import { Diagram } from "./Diagram.js";
import { Scenario01 } from "./Scenario01.js";
import { Engine } from "./Engine.js";

import { Navigation } from "./Navigation.js";
import { DiagramHover } from "./DiagramHover.js";

import { Generator } from "./Generator.js";
import { Transformer } from "./Transformer.js";
import { Breaker } from "./Breaker.js";
import { Panel } from "./Panel.js";
import { Wire } from "./Wire.js";
import { RE } from "./RE.js";
import { GroundSwitch } from "./GroundSwitch.js";
import { ExternalSource } from "./ExternalSource.js";
import { PcaPanel } from "./PcaPanel.js";
import { AuxPanel } from "./AuxPanel.js";

const SVG_NS = "http://www.w3.org/2000/svg";

export const Renderer = {

    svg: null,

    navigation: null,

    layers: {},

    //==================================================
    // ESPESSURAS PADRONIZADAS
    //==================================================

    strokes: {
        wire: Diagram.strokes?.mainWire ?? 1.55,
        transfer: Diagram.strokes?.transferWire ?? 1.45,
        bus: Diagram.strokes?.bus ?? 2.10,
        equipment: Diagram.strokes?.equipment ?? 1.80,
        panel: Diagram.strokes?.panel ?? 1.35
    },

    //==================================================
    // INICIALIZAÇÃO
    //==================================================

    initialize(id) {

        this.svg = document.getElementById(id);

        if (!this.svg) {
            console.error("[Renderer] SVG não encontrado.");
            return;
        }

        this.svg.innerHTML = "";

        this.createLayers();

        /*
         * O grid do SVG foi desativado.
         * O fundo agora é controlado somente pelo CSS.
         */
        if (Diagram.grid?.enabled === true) {
            this.drawGrid();
        }

        this.render();

        /*
         * Tags informativas globais:
         * - todos os DJs;
         * - nomes dos quadros;
         * - sempre desenhadas na camada effects.
         */
        DiagramHover.initialize(
            this.svg
        );

        /*
         * A navegação é criada depois da renderização.
         * Assim, o ajuste inicial consegue ler o tamanho
         * real dos equipamentos desenhados.
         */
        this.navigation?.destroy?.();
        this.navigation = new Navigation(this.svg);
    },

    //==================================================
    // CRIAÇÃO DE ELEMENTOS SVG
    //==================================================

    create(type) {
        return document.createElementNS(SVG_NS, type);
    },

    createLayers() {

        this.layers = {};

        const names = [
            "grid",
            "topLinks",
            "wires",
            "panels",
            "equipment",
            "labels",
            "effects"
        ];

        names.forEach(name => {

            const layer = this.create("g");

            layer.id = name;

            this.layers[name] = layer;

            this.svg.appendChild(layer);
        });
    },

    layer(name) {
        return this.layers[name];
    },

    //==================================================
    // GRID SVG OPCIONAL
    //==================================================

    drawGrid() {

        const grid = this.layer("grid");

        if (!grid || Diagram.grid?.enabled !== true) return;

        const size = Diagram.grid?.size ?? 100;
        const color = Diagram.grid?.color ?? "#b7c3cc";
        const opacity = Diagram.grid?.opacity ?? 0.18;
        const width = Diagram.grid?.strokeWidth ?? 0.6;

        grid.setAttribute("class", "grid");
        grid.setAttribute("opacity", opacity);

        for (let x = 0; x <= Diagram.width; x += size) {

            const line = this.create("line");

            line.setAttribute("x1", x);
            line.setAttribute("y1", 0);
            line.setAttribute("x2", x);
            line.setAttribute("y2", Diagram.height);
            line.setAttribute("stroke", color);
            line.setAttribute("stroke-width", width);

            grid.appendChild(line);
        }

        for (let y = 0; y <= Diagram.height; y += size) {

            const line = this.create("line");

            line.setAttribute("x1", 0);
            line.setAttribute("y1", y);
            line.setAttribute("x2", Diagram.width);
            line.setAttribute("y2", y);
            line.setAttribute("stroke", color);
            line.setAttribute("stroke-width", width);

            grid.appendChild(line);
        }
    },

    clear() {

        Object.keys(this.layers).forEach(name => {

            if (name === "grid") return;

            this.layers[name].innerHTML = "";
        });
    },

    //==================================================
    // BUSCAS INTERNAS
    //==================================================

    getGenerator(id) {
        return Scenario01.generators?.find(item => item.id === id);
    },

    getRelay(id) {
        return Scenario01.relays?.find(item => item.id === id);
    },

    getDistributionPanel(id) {
        return Scenario01.distributionPanels?.find(item => item.id === id);
    },

    getTransformer(id) {
        return Scenario01.transformers?.find(item => item.id === id);
    },

    getGroundSwitch(id) {
        return Scenario01.groundSwitches?.find(item => item.id === id);
    },

    getIncomingBreaker(id) {
        return Scenario01.incomingBreakers?.find(item => item.id === id);
    },

    getExternalSource(id) {
        return Scenario01.externalSources?.find(item => item.id === id);
    },

    getPanel(id) {
        return Scenario01.panels?.find(item => item.id === id);
    },

    isUnitAvailable(unitId) {

        const unit = Scenario01.units?.[unitId];

        if (!unit) return false;

        return (
            unit.available === true &&
            unit.maintenance === false
        );
    },

    //==================================================
    // DESENHO DE POLILINHA
    //==================================================

    drawPolyline(
        layer,
        points,
        color,
        width = this.strokes.transfer,
        className = "electrical-wire transfer-wire"
    ) {

        if (!layer || !points || points.length < 2) return;

        const path = this.create("path");

        const d = points
            .map((point, index) => {
                return `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`;
            })
            .join(" ");

        path.setAttribute("d", d);
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", color);
        path.setAttribute("stroke-width", width);
        path.setAttribute("stroke-linecap", "square");
        path.setAttribute("stroke-linejoin", "miter");
        path.setAttribute("class", className);

        layer.appendChild(path);
    },

    //==================================================
    // DESENHO PADRÃO DOS DISJUNTORES
    //==================================================

    drawBreaker(breaker, color) {

        if (!breaker) return;

        /*
         * DJs comandáveis dos painéis principais:
         *
         * 1QP:
         * 107, 108, 109 e 120
         *
         * 3QP:
         * 110, 111, 112 e 135
         *
         * O comando somente é aceito pelo Engine
         * quando o QP correspondente estiver em MANUAL.
         */
        const incomingCommandBreakers = [
            "107",
            "108",
            "109",
            "110",
            "111",
            "112",
            "120",
            "135"
        ];

        const breakerId =
            String(
                breaker.id ??
                ""
            );

        const isIncomingCommandBreaker =
            incomingCommandBreakers.includes(
                breakerId
            );

        /*
         * Estado visual real do equipamento.
         * O App inicializa o Engine antes do primeiro desenho, portanto o
         * Renderer apenas representa o estado efetivo definido pelo motor.
         */
        const resolvedState =
            breaker.breakerState ??
            breaker.state ??
            (
                breaker.closed === true
                    ? Breaker.STATES.CLOSED_UNDERVOLTAGE_TRIP
                    : Breaker.STATES.OPEN_UNDERVOLTAGE_TRIP
            );

        Breaker.draw(
            this.layer("equipment"),
            {
                ...breaker,

                id:
                    breaker.id,

                label:
                    breaker.label ??
                    breaker.id,

                size:
                    breaker.size ??
                    (
                        isIncomingCommandBreaker
                            ? 38
                            : 42
                    ),

                state:
                    resolvedState,

                closed:
                    typeof breaker.closed === "boolean"
                        ? breaker.closed
                        : null,

                stroke:
                    color,

                textColor:
                    color,

                labelPosition:
                    breaker.labelPosition ??
                    "right",

                labelOffset:
                    breaker.labelOffset ??
                    8,

                fontSize:
                    breaker.fontSize ??
                    (
                        isIncomingCommandBreaker
                            ? 17
                            : 18
                    ),

                interactive:
                    isIncomingCommandBreaker
                        ? true
                        : (
                            breaker.interactive ??
                            true
                        ),

                onCommand:
                    isIncomingCommandBreaker
                        ? () => {
                            Engine.toggleIncomingBreaker(
                                breakerId
                            );
                        }
                        : (
                            breaker.onCommand ??
                            null
                        )
            }
        );
    },

    //==================================================
    // RAMAIS DAS UGs
    //==================================================

    drawUpperBranch(branch) {

        const generator = this.getGenerator(branch.generator);
        const relay = this.getRelay(branch.relay);
        const panel = this.getDistributionPanel(branch.panel);
        const transformer = this.getTransformer(branch.transformer);
        const groundSwitch = this.getGroundSwitch(branch.groundSwitch);
        const breaker = this.getIncomingBreaker(branch.breaker);

        const unitAvailable =
            this.isUnitAvailable(branch.unit);

        const unitRunning =
            Scenario01.units?.[branch.unit]?.running === true;

        const branchEnergized =
            unitAvailable && unitRunning;

        const distributionBreakerCommandEnabled =
            Boolean(panel) &&
            !(
                branch.unit === "UG02" &&
                Scenario01.units?.UG02?.maintenance === true
            );

        const branchColor =
            branchEnergized
                ? branch.color
                : "#8a8a8a";

        /*
         * O DJ localizado no PSA / QD divide o ramal em dois trechos:
         *
         * - montante: UG -> RE -> entrada do PSA / QD;
         * - jusante: saída do PSA / QD -> TR-SA -> faca -> DJ de chegada.
         *
         * Quando o DJ local estiver aberto, somente o trecho a jusante
         * perde tensão e deve ser representado em cinza.
         */
        const distributionBreakerClosed =
            panel
                ? Engine.isBreakerClosed(panel)
                : true;

        const downstreamEnergized =
            branchEnergized &&
            distributionBreakerClosed &&
            panel?.outputEnergized !== false;

        const downstreamColor =
            downstreamEnergized
                ? branch.color
                : "#8a8a8a";

        if (generator) {

            Generator.draw(
                this.layer("equipment"),
                {
                    ...generator,
                    color: branchColor,
                    running:
                        unitRunning,
                    available:
                        unitAvailable,
                    onCommand:
                        unitAvailable
                            ? () => {
                                Engine.toggleGenerator(branch.unit);
                            }
                            : null,
                    strokeWidth:
                        generator.strokeWidth ??
                        this.strokes.equipment
                }
            );
        }

        if (!unitAvailable) {
            this.drawMaintenanceLabel(generator);
        }

        if (relay) {

            RE.draw(
                this.layer("equipment"),
                {
                    ...relay,
                    color: branchColor,
                    strokeWidth:
                        relay.strokeWidth ??
                        this.strokes.equipment
                }
            );
        }

        if (panel) {

            Panel.draw(
                this.layer("panels"),
                {
                    ...panel,
                    color: branchColor,
                    busColor: downstreamColor,
                    interactive:
                        distributionBreakerCommandEnabled,
                    onBreakerCommand:
                        distributionBreakerCommandEnabled
                            ? () => {
                                Engine.toggleDistributionBreaker(
                                    branch.panel
                                );
                            }
                            : null,
                    strokeWidth:
                        panel.strokeWidth ??
                        this.strokes.panel,
                    busStrokeWidth:
                        panel.busStrokeWidth ??
                        this.strokes.bus
                }
            );
        }

        if (transformer) {

            Transformer.draw(
                this.layer("equipment"),
                {
                    ...transformer,
                    color: downstreamColor,
                    strokeWidth:
                        transformer.strokeWidth ??
                        this.strokes.equipment
                }
            );
        }

        /*
         * UG-02 indisponível:
         * mantém o trecho cinza até o TR-SA-2.
         * O DJ 109 pertence ao ramal da UG-12.
         */
        if (
            branch.unit === "UG02" &&
            Scenario01.units?.UG02?.maintenance === true
        ) {

            this.drawUpperBranchWires(
                generator,
                relay,
                panel,
                transformer,
                null,
                null,
                branchColor,
                downstreamColor
            );

            /*
             * Completa o trecho desenergizado da UG-02 desde a saída do
             * TR-SA-2 até o ponto de encontro com o retorno verde da GS109.
             * A GS109 e o DJ 109 continuam pertencendo ao ramal da UG-12.
             */
            if (transformer && groundSwitch) {
                Wire.draw(
                    this.layer("wires"),
                    transformer.x,
                    transformer.y + 206,
                    groundSwitch.x,
                    groundSwitch.y - 34,
                    downstreamColor,
                    this.strokes.wire
                );
            }

            return;
        }

        if (groundSwitch) {

            GroundSwitch.draw(
                this.layer("equipment"),
                {
                    ...groundSwitch,
                    color: downstreamColor,
                    strokeWidth:
                        groundSwitch.strokeWidth ??
                        this.strokes.equipment
                }
            );
        }

        this.drawBreaker(
            breaker,
            downstreamColor
        );

        this.drawUpperBranchWires(
            generator,
            relay,
            panel,
            transformer,
            groundSwitch,
            breaker,
            branchColor,
            downstreamColor
        );
    },

    drawUpperBranchWires(
        generator,
        relay,
        panel,
        transformer,
        groundSwitch,
        breaker,
        upstreamColor,
        downstreamColor = upstreamColor
    ) {

        if (!generator || !relay || !panel || !transformer) return;

        const centerPanelX =
            panel.x + panel.width / 2;

        const reTopConnectionY =
            relay.y - 95;

        const reBottomConnectionY =
            relay.y + 260;

        const transformerTopConnectionY =
            transformer.y - 120;

        const transformerBottomConnectionY =
            transformer.y + 206;

        const gsTopConnectionY =
            groundSwitch
                ? groundSwitch.y - 34
                : null;

        const gsBottomConnectionY =
            groundSwitch
                ? groundSwitch.y + 34
                : null;

        const wireWidth =
            this.strokes.wire;

        // Gerador → RE
        Wire.draw(
            this.layer("wires"),
            generator.x,
            generator.y + 55,
            relay.x,
            reTopConnectionY,
            upstreamColor,
            wireWidth
        );

        // RE → QD / PSA
        Wire.draw(
            this.layer("wires"),
            relay.x,
            reBottomConnectionY,
            centerPanelX,
            panel.y,
            upstreamColor,
            wireWidth
        );

        // QD / PSA → TR-SA
        Wire.draw(
            this.layer("wires"),
            centerPanelX,
            panel.y + panel.height,
            transformer.x,
            transformerTopConnectionY,
            downstreamColor,
            wireWidth
        );

        if (!groundSwitch || !breaker) return;

        // TR-SA → faca
        Wire.draw(
            this.layer("wires"),
            transformer.x,
            transformerBottomConnectionY,
            groundSwitch.x,
            gsTopConnectionY,
            downstreamColor,
            wireWidth
        );

        // Faca → DJ
        Wire.draw(
            this.layer("wires"),
            groundSwitch.x,
            gsBottomConnectionY,
            breaker.x,
            breaker.y - 24,
            downstreamColor,
            wireWidth
        );
    },

    //==================================================
    // FONTES EXTERNAS — SE 138 kV
    //==================================================

    drawExternalBranch(branch) {

        const source = this.getExternalSource(branch.source);
        const panel = this.getDistributionPanel(branch.panel);
        const transformer = this.getTransformer(branch.transformer);
        const breaker = this.getIncomingBreaker(branch.breaker);

        /*
         * As fontes externas SE1 e SE2 utilizam laranja para não serem
         * confundidas com as cores das UGs.
         *
         * DJ 120 / 135 desligado ou sem tensão: cinza.
         * DJ 120 / 135 ligado e energizado: laranja.
         */
        const externalEnergized =
            breaker?.closed === true &&
            breaker?.energized === true;

        const color =
            externalEnergized
                ? "#f28c28"
                : "#8a8a8a";

        if (source) {

            ExternalSource.draw(
                this.layer("equipment"),
                {
                    ...source,
                    color,
                    strokeWidth:
                        source.strokeWidth ??
                        this.strokes.equipment
                }
            );
        }

        if (panel) {

            Panel.draw(
                this.layer("panels"),
                {
                    ...panel,
                    color,
                    busColor: color,
                    interactive: true,
                    onBreakerCommand:
                        () => {
                            Engine.toggleDistributionBreaker(
                                branch.panel
                            );
                        },
                    strokeWidth:
                        panel.strokeWidth ??
                        this.strokes.panel,
                    busStrokeWidth:
                        panel.busStrokeWidth ??
                        this.strokes.bus
                }
            );
        }

        if (transformer) {

            Transformer.draw(
                this.layer("equipment"),
                {
                    ...transformer,
                    color,
                    strokeWidth:
                        transformer.strokeWidth ??
                        this.strokes.equipment
                }
            );
        }

        this.drawBreaker(
            breaker,
            color
        );

        this.drawExternalBranchWires(
            source,
            panel,
            transformer,
            breaker,
            color
        );
    },

    drawExternalBranchWires(
        source,
        panel,
        transformer,
        breaker,
        color
    ) {

        if (!source || !panel || !transformer || !breaker) return;

        const sourceCenterX =
            source.x + source.width / 2;

        const panelCenterX =
            panel.x + panel.width / 2;

        const sourceBottomY =
            source.y + source.height + 105;

        const transformerTopConnectionY =
            transformer.y - 120;

        const transformerBottomConnectionY =
            transformer.y + 206;

        const wireWidth =
            this.strokes.wire;

        // SE 138 kV → QD
        Wire.draw(
            this.layer("wires"),
            sourceCenterX,
            sourceBottomY,
            panelCenterX,
            panel.y,
            color,
            wireWidth
        );

        // QD → TR-SA
        Wire.draw(
            this.layer("wires"),
            panelCenterX,
            panel.y + panel.height,
            transformer.x,
            transformerTopConnectionY,
            color,
            wireWidth
        );

        // TR-SA → DJ 120 / 135
        Wire.draw(
            this.layer("wires"),
            transformer.x,
            transformerBottomConnectionY,
            breaker.x,
            breaker.y - 24,
            color,
            wireWidth
        );
    },

    //==================================================
    // RAMAIS DE TRANSFERÊNCIA
    //==================================================

    drawTransferBranch(branch) {

        const transformer =
            this.getTransformer(branch.sourceTransformer);

        const groundSwitch =
            this.getGroundSwitch(branch.groundSwitch);

        const breaker =
            this.getIncomingBreaker(branch.breaker);

        if (!transformer || !groundSwitch || !breaker) return;

        const unitAvailable =
            this.isUnitAvailable(branch.unit);

        const unitRunning =
            Scenario01.units?.[branch.unit]?.running === true;

        /*
         * Os ramais 111, 108 e 109 nascem depois dos mesmos DJs locais
         * que alimentam os ramais principais 107, 110 e 112.
         * Portanto, também devem perder a cor quando o DJ do PSA / QD
         * correspondente estiver aberto.
         */
        const localPanelByUnit = {
            UG01: "PSA-U01",
            UG11: "3QD-11",
            UG12: "3QD-12"
        };

        const localPanelId =
            localPanelByUnit[branch.unit] ?? null;

        const localPanel =
            localPanelId
                ? this.getDistributionPanel(localPanelId)
                : null;

        const localBreakerClosed =
            localPanel
                ? Engine.isBreakerClosed(localPanel)
                : true;

        const transferEnergized =
            unitAvailable &&
            unitRunning &&
            localBreakerClosed &&
            localPanel?.outputEnergized !== false;

        const color =
            transferEnergized
                ? (branch.color ?? "#ffffff")
                : "#8a8a8a";

        GroundSwitch.draw(
            this.layer("equipment"),
            {
                ...groundSwitch,
                color,
                strokeWidth:
                    groundSwitch.strokeWidth ??
                    this.strokes.equipment
            }
        );

        this.drawBreaker(
            breaker,
            color
        );

        this.drawTransferBranchWires(
            branch,
            transformer,
            groundSwitch,
            breaker,
            color
        );
    },

    drawTransferBranchWires(
        branch,
        transformer,
        groundSwitch,
        breaker,
        color
    ) {

        const transformerBottomConnectionY =
            transformer.y + 206;

        const gsTopConnectionY =
            groundSwitch.y - 34;

        const gsBottomConnectionY =
            groundSwitch.y + 34;

        const topY =
            branch.topY ?? 260;

        const sourceSideX =
            branch.sourceSideX ??
            transformer.x +
                (branch.sourceOffsetX ?? 600);

        const targetSideX =
            branch.targetSideX ??
            groundSwitch.x +
                (branch.targetOffsetX ?? 0);

        this.drawPolyline(
            this.layer("topLinks"),
            [
                {
                    x: transformer.x,
                    y: transformerBottomConnectionY
                },
                {
                    x: sourceSideX,
                    y: transformerBottomConnectionY
                },
                {
                    x: sourceSideX,
                    y: topY
                },
                {
                    x: targetSideX,
                    y: topY
                },
                {
                    x: targetSideX,
                    y: gsTopConnectionY
                },
                {
                    x: groundSwitch.x,
                    y: gsTopConnectionY
                }
            ],
            color,
            this.strokes.transfer,
            "electrical-wire transfer-wire"
        );

        // Faca → DJ
        Wire.draw(
            this.layer("wires"),
            groundSwitch.x,
            gsBottomConnectionY,
            breaker.x,
            breaker.y - 24,
            color,
            this.strokes.wire
        );
    },

    //==================================================
    // SAÍDAS DAS UGs PARA OS TRs ELEVADORES / SE 440 kV
    //==================================================

    drawStepUpBranches() {

        Scenario01.stepUpBranches?.forEach(branch => {
            this.drawStepUpBranch(branch);
        });
    },

    drawStepUpBranch(branch) {

        const generator =
            this.getGenerator(branch.generator);

        if (!generator) return;

        const layer =
            this.layer("equipment");

        const wireLayer =
            this.layer("wires");

        const labelLayer =
            this.layer("labels");

        const direction =
            branch.direction === "left"
                ? -1
                : 1;

        const color =
            branch.color ?? "#7a858d";

        const radius =
            branch.transformerRadius ?? 54;

        const transformerX =
            branch.transformerX;

        const transformerY =
            branch.transformerY ?? generator.y;

        const breakerX =
            branch.breakerX;

        const groundSwitchX =
            branch.groundSwitchX;

        const arrowX =
            branch.arrowX;

        /*
         * A derivação para o TR elevador nasce no condutor
         * vertical entre a UG e o RE, conforme o diagrama
         * elétrico original.
         */
        const takeoffX =
            branch.takeoffX ??
            generator.x;

        const takeoffY =
            branch.takeoffY ??
            transformerY;

        const transformerNearX =
            transformerX -
            direction * radius * 1.35;

        const transformerFarX =
            transformerX +
            direction * radius * 1.35;

        const wireWidth =
            this.strokes.wire;

        //==================================================
        // FUNÇÃO LOCAL DE TEXTO
        //==================================================

        const addText = (
            x,
            y,
            text,
            size = 24,
            anchor = "middle",
            weight = "500",
            fill = "#263238"
        ) => {

            const element =
                this.create("text");

            element.setAttribute("x", x);
            element.setAttribute("y", y);
            element.setAttribute("text-anchor", anchor);
            element.setAttribute("font-size", size);
            element.setAttribute("font-weight", weight);
            element.setAttribute("fill", fill);
            element.setAttribute("class", "step-up-label");

            element.textContent = text;

            labelLayer.appendChild(element);

            return element;
        };

        //==================================================
        // LIGAÇÃO UG → TR ELEVADOR
        //==================================================

        /*
         * Trecho vertical entre a UG e o ponto de derivação.
         * Normalmente ele já existe no ramal principal, mas
         * esta pequena sobreposição garante continuidade
         * visual no nó de saída para o TR elevador.
         */
        Wire.draw(
            wireLayer,
            takeoffX,
            takeoffY - 4,
            takeoffX,
            takeoffY + 4,
            generator.color ?? color,
            wireWidth
        );

        /*
         * Derivação horizontal: condutor da UG → TR elevador.
         */
        Wire.draw(
            wireLayer,
            takeoffX,
            takeoffY,
            transformerNearX,
            transformerY,
            color,
            wireWidth
        );

        /*
         * Nó elétrico no ponto de derivação.
         */
        const takeoffNode =
            this.create("circle");

        takeoffNode.setAttribute(
            "cx",
            takeoffX
        );

        takeoffNode.setAttribute(
            "cy",
            takeoffY
        );

        takeoffNode.setAttribute(
            "r",
            branch.takeoffNodeRadius ?? 5
        );

        takeoffNode.setAttribute(
            "fill",
            generator.color ?? color
        );

        takeoffNode.setAttribute(
            "stroke",
            generator.color ?? color
        );

        takeoffNode.setAttribute(
            "stroke-width",
            1
        );

        takeoffNode.setAttribute(
            "class",
            "step-up-takeoff-node"
        );

        layer.appendChild(
            takeoffNode
        );

        //==================================================
        // TR ELEVADOR — DOIS CÍRCULOS SOBREPOSTOS
        //==================================================

        const circleOffset =
            radius * 0.52;

        const leftCircle =
            this.create("circle");

        leftCircle.setAttribute(
            "cx",
            transformerX - circleOffset
        );

        leftCircle.setAttribute(
            "cy",
            transformerY
        );

        leftCircle.setAttribute(
            "r",
            radius
        );

        leftCircle.setAttribute(
            "fill",
            "#ffffff"
        );

        leftCircle.setAttribute(
            "stroke",
            color
        );

        leftCircle.setAttribute(
            "stroke-width",
            this.strokes.equipment
        );

        leftCircle.setAttribute(
            "class",
            "step-up-transformer-coil"
        );

        layer.appendChild(leftCircle);

        const rightCircle =
            this.create("circle");

        rightCircle.setAttribute(
            "cx",
            transformerX + circleOffset
        );

        rightCircle.setAttribute(
            "cy",
            transformerY
        );

        rightCircle.setAttribute(
            "r",
            radius
        );

        rightCircle.setAttribute(
            "fill",
            "#ffffff"
        );

        rightCircle.setAttribute(
            "stroke",
            color
        );

        rightCircle.setAttribute(
            "stroke-width",
            this.strokes.equipment
        );

        rightCircle.setAttribute(
            "class",
            "step-up-transformer-coil"
        );

        layer.appendChild(rightCircle);

        //==================================================
        // LIGAÇÃO TR → DJ → SE 440 kV
        //==================================================

        Wire.draw(
            wireLayer,
            transformerFarX,
            transformerY,
            arrowX,
            transformerY,
            color,
            wireWidth
        );

        //==================================================
        // DJ DE SAÍDA 440 kV
        //==================================================

        const breakerWidth = 38;
        const breakerHeight = 30;

        const breakerBody =
            this.create("rect");

        breakerBody.setAttribute(
            "x",
            breakerX - breakerWidth / 2
        );

        breakerBody.setAttribute(
            "y",
            transformerY - breakerHeight / 2
        );

        breakerBody.setAttribute(
            "width",
            breakerWidth
        );

        breakerBody.setAttribute(
            "height",
            breakerHeight
        );

        breakerBody.setAttribute(
            "fill",
            color
        );

        breakerBody.setAttribute(
            "stroke",
            color
        );

        breakerBody.setAttribute(
            "stroke-width",
            1.4
        );

        breakerBody.setAttribute(
            "class",
            "step-up-breaker"
        );

        layer.appendChild(breakerBody);

        addText(
            breakerX,
            transformerY - 28,
            branch.breaker ?? "",
            branch.breakerLabelSize ?? 26,
            "middle",
            "700",
            "#263238"
        );

        //==================================================
        // FACA TERRA DA SAÍDA
        //==================================================

        const switchTopY =
            transformerY + 4;

        const switchContactY =
            transformerY + 62;

        /*
         * Ajuste da faca terra dos TRs elevadores:
         * bolinha inferior + aterramento movidos juntos.
         */
        const fixedContactOffsetX =
            branch.groundSwitchFixedContactOffsetX ?? 1;

        const fixedContactOffsetY =
            branch.groundSwitchFixedContactOffsetY ?? 28;

        const fixedContactX =
            groundSwitchX + fixedContactOffsetX;

        const fixedContactY =
            switchContactY + fixedContactOffsetY;

        Wire.draw(
            wireLayer,
            groundSwitchX,
            switchTopY,
            groundSwitchX,
            switchContactY,
            color,
            1.5
        );

        const node =
            this.create("circle");

        node.setAttribute("cx", groundSwitchX);
        node.setAttribute("cy", switchContactY);
        node.setAttribute("r", 4);
        node.setAttribute("fill", color);
        node.setAttribute("stroke", color);

        layer.appendChild(node);

        const blade =
            this.create("line");

        blade.setAttribute(
            "x1",
            groundSwitchX + 3
        );

        blade.setAttribute(
            "y1",
            switchContactY - 3
        );

        blade.setAttribute(
            "x2",
            fixedContactX - 2
        );

        blade.setAttribute(
            "y2",
            fixedContactY - 5
        );

        blade.setAttribute(
            "stroke",
            color
        );

        blade.setAttribute(
            "stroke-width",
            1.5
        );

        layer.appendChild(blade);

        const fixedContact =
            this.create("circle");

        fixedContact.setAttribute(
            "cx",
            fixedContactX
        );

        fixedContact.setAttribute(
            "cy",
            fixedContactY
        );

        fixedContact.setAttribute(
            "r",
            4
        );

        fixedContact.setAttribute(
            "fill",
            "#ffffff"
        );

        fixedContact.setAttribute(
            "stroke",
            color
        );

        fixedContact.setAttribute(
            "stroke-width",
            1.4
        );

        layer.appendChild(fixedContact);

        Wire.draw(
            wireLayer,
            fixedContactX,
            fixedContactY + 4,
            fixedContactX,
            fixedContactY + 24,
            color,
            1.4
        );

        // Barras de terra horizontais
        [
            { y: fixedContactY + 26, half: 14 },
            { y: fixedContactY + 33, half: 10 },
            { y: fixedContactY + 40, half: 6 }
        ].forEach(item => {

            Wire.draw(
                wireLayer,
                fixedContactX - item.half,
                item.y,
                fixedContactX + item.half,
                item.y,
                color,
                1.3
            );
        });

        addText(
            fixedContactX + 10,
            fixedContactY + 8,
            branch.groundSwitchTag ?? "",
            branch.groundSwitchTagSize ?? 22,
            "start",
            "600",
            "#263238"
        );

        //==================================================
        // SETA PARA A SE 440 kV
        //==================================================

        const arrow =
            this.create("path");

        if (direction > 0) {

            arrow.setAttribute(
                "d",
                [
                    `M ${arrowX} ${transformerY}`,
                    `L ${arrowX - 34} ${transformerY - 17}`,
                    `L ${arrowX - 34} ${transformerY + 17}`,
                    "Z"
                ].join(" ")
            );

        } else {

            arrow.setAttribute(
                "d",
                [
                    `M ${arrowX} ${transformerY}`,
                    `L ${arrowX + 34} ${transformerY - 17}`,
                    `L ${arrowX + 34} ${transformerY + 17}`,
                    "Z"
                ].join(" ")
            );
        }

        arrow.setAttribute(
            "fill",
            color
        );

        arrow.setAttribute(
            "stroke",
            color
        );

        arrow.setAttribute(
            "stroke-width",
            1.2
        );

        layer.appendChild(arrow);

        addText(
            arrowX -
                direction * 38,

            transformerY + 58,

            branch.seLabel ?? "SE 440 kV",

            branch.seLabelSize ?? 27,

            direction > 0
                ? "end"
                : "start",

            "600",

            "#263238"
        );

        //==================================================
        // DADOS DO TRANSFORMADOR
        //==================================================

        const textX =
            transformerX +
            (branch.transformerTextOffsetX ?? 0);

        const compactTransformerText =
            ["UG02", "UG12"].includes(branch.generator);

        addText(
            textX,
            transformerY -
                (branch.transformerLabelOffsetY ?? 122),
            branch.transformerLabel ?? "",
            branch.transformerLabelSize ??
                (compactTransformerText ? 24 : 32),
            "middle",
            "600",
            "#263238"
        );

        addText(
            textX,
            transformerY -
                (branch.transformerPowerOffsetY ?? 91),
            branch.power ?? "",
            branch.transformerPowerSize ??
                (compactTransformerText ? 19 : 26),
            "middle",
            "600",
            "#263238"
        );

        addText(
            textX,
            transformerY -
                (branch.transformerVoltageOffsetY ?? 63),
            branch.voltage ?? "",
            branch.transformerVoltageSize ??
                (compactTransformerText ? 18 : 25),
            "middle",
            "600",
            "#263238"
        );
    },

    //==================================================
    // TEXTO DE MODERNIZAÇÃO
    //==================================================

    drawMaintenanceLabel(generator) {

        if (!generator) return;

        const text = this.create("text");

        text.setAttribute("x", generator.x);
        text.setAttribute("y", generator.y - 145);
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("fill", "#d4a900");
        text.setAttribute("font-size", "34");
        text.setAttribute("font-weight", "700");

        text.textContent = "MODERNIZAÇÃO";

        this.layer("labels").appendChild(text);
    },

    //==================================================
    // LIGAÇÃO DOS DJs AOS BARRAMENTOS
    //==================================================

    drawBreakerToBusConnections() {

        Scenario01.incomingBreakers?.forEach(dj => {

            let targetPanel = null;

            if (["107", "108", "109", "120"].includes(dj.id)) {
                targetPanel = this.getPanel("1QP");
            }

            if (["110", "111", "112", "135"].includes(dj.id)) {
                targetPanel = this.getPanel("3QP");
            }

            if (!targetPanel) return;

            const incomingSourceByBreaker = {
                "107": "UG01",
                "108": "UG11",
                "109": "UG12",
                "110": "UG11",
                "111": "UG01",
                "112": "UG12"
            };

            const sourceUnit =
                incomingSourceByBreaker[dj.id] ?? null;

            const sourceRunning =
                sourceUnit
                    ? Scenario01.units?.[sourceUnit]?.running === true
                    : true;

            const breakerClosed =
                dj.closed === true;

            const connectionEnergized =
                sourceRunning &&
                breakerClosed &&
                dj.energized === true;

            let wireColor =
                sourceUnit && !connectionEnergized
                    ? "#8a8a8a"
                    : (dj.color || "#d8d8d8");

            if (connectionEnergized) {
                wireColor =
                    Engine.getUnitColor(sourceUnit);
            }

            const targetBusY =
                targetPanel.busY ??
                targetPanel.y + 85;

            Wire.draw(
                this.layer("wires"),
                dj.x,
                dj.y + 22,
                dj.x,
                targetBusY,
                wireColor,
                this.strokes.wire
            );
        });
    },

    //==================================================
    // RENDERIZAÇÃO PRINCIPAL
    //==================================================

    render() {

        this.clear();

        const upperBranches = [
            {
                unit: "UG01",
                generator: "UG01",
                relay: "RE1",
                panel: "PSA-U01",
                transformer: "TR01",
                groundSwitch: "GS107",
                breaker: "107",
                color: "#3f7cff"
            },
            {
                unit: "UG02",
                generator: "UG02",
                relay: "RE2",
                panel: "1QD-2",
                transformer: "TR02",
                groundSwitch: "GS109",
                breaker: "109",
                color: "#e4c24a"
            },
            {
                unit: "UG11",
                generator: "UG11",
                relay: "RE3",
                panel: "3QD-11",
                transformer: "TR11",
                groundSwitch: "GS110",
                breaker: "110",
                color: "#ff44dd"
            },
            {
                unit: "UG12",
                generator: "UG12",
                relay: "RE4",
                panel: "3QD-12",
                transformer: "TR12",
                groundSwitch: "GS112",
                breaker: "112",
                color: "#44dd55"
            }
        ];

        upperBranches.forEach(branch => {
            this.drawUpperBranch(branch);
        });

        /*
         * Saídas das UGs para os transformadores
         * elevadores e para a SE 440 kV.
         */
        this.drawStepUpBranches();

        const externalBranches = [
            {
                source: "SE138_1QP",
                panel: "1QD-91",
                transformer: "TRSE1",
                breaker: "120",
                color: "#7a858d"
            },
            {
                source: "SE138_3QP",
                panel: "3QD-92",
                transformer: "TRSE3",
                breaker: "135",
                color: "#7a858d"
            }
        ];

        externalBranches.forEach(branch => {
            this.drawExternalBranch(branch);
        });

        const transferBranches = [
            {
                id: "TRANSFER_UG01_TO_3QP",
                unit: "UG01",
                sourceTransformer: "TR01",
                groundSwitch: "GS111",
                breaker: "111",
                color: "#3f7cff",
                // Calculado a partir do TR01 e da posição atual da GS111.
                sourceOffsetX: 600,
                topY: 320
            },
            {
                id: "TRANSFER_UG11_TO_1QP",
                unit: "UG11",
                sourceTransformer: "TR11",
                groundSwitch: "GS108",
                breaker: "108",
                color: "#ff44dd",
                // Calculado a partir do TR11 e da posição atual da GS108.
                sourceOffsetX: 500,
                topY: 390
            },
            {
                id: "TRANSFER_UG12_TO_109",
                unit: "UG12",
                sourceTransformer: "TR12",
                groundSwitch: "GS109",
                breaker: "109",
                color: "#44dd55",
                // O desvio nasce à esquerda do TR12 para não ultrapassar a UG-12.
                sourceOffsetX: -400,
                // Mantém a descida verde à direita dos instrumentos da UG-02
                // e faz o retorno horizontal somente antes da GS109/DJ 109.
                targetOffsetX: 650,
                topY: 460
            }
        ];

        transferBranches.forEach(branch => {
            this.drawTransferBranch(branch);
        });

        this.drawBreakerToBusConnections();

        Scenario01.panels?.forEach(panel => {

            const busBreakers =
                (panel.busBreakers ?? []).map(item => ({
                    ...item,
                    interactive: true,
                    onCommand: () => {
                        Engine.toggleBusCoupler(item.id);
                    }
                }));

            const feeders =
                (panel.feeders ?? []).map(feeder => ({
                    ...feeder,
                    interactive: true,
                    onBreakerCommand: () => {
                        Engine.toggleMainPanelFeeder(
                            panel.id,
                            feeder.id
                        );
                    }
                }));

            Panel.draw(
                this.layer("panels"),
                {
                    ...panel,
                    busBreakers,
                    feeders,
                    strokeWidth:
                        panel.strokeWidth ??
                        this.strokes.panel,
                    busStrokeWidth:
                        panel.busStrokeWidth ??
                        this.strokes.bus
                }
            );
        });

        Scenario01.pcaPanels?.forEach(panel => {

            PcaPanel.draw(
                this.layer("panels"),
                panel
            );
        });

        Scenario01.auxPanels?.forEach(panel => {

            AuxPanel.draw(
                this.layer("panels"),
                panel
            );
        });

     }

};
