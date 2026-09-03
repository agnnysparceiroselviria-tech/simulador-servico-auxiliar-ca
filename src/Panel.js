import { Equipment } from "./Equipment.js";
import { Breaker } from "./Breaker.js";

export class Panel extends Equipment {

    static COLORS = {
        text: "#263238",
        border: "#000000",
        deenergized: "#7a858d"
    };

    static draw(layer, data = {}) {

        if (!layer) {

            console.warn(
                "[Panel] Camada SVG não informada."
            );

            return null;
        }

        if (!data.id) {

            console.warn(
                "[Panel] Painel sem identificação.",
                data
            );
        }

        if (data.type === "main") {

            return this.drawMain(
                layer,
                data
            );
        }

        return this.drawDistribution(
            layer,
            data
        );
    }

    //========================================================
    // PONTOS DE CONEXÃO
    //========================================================

    static getPorts(data = {}) {

        const x =
            data.x ?? 0;

        const y =
            data.y ?? 0;

        const width =
            data.width ?? 0;

        const height =
            data.height ?? 0;

        const centerX =
            x + width / 2;

        const busY =
            data.busY ?? y + 85;

        return {

            top: {
                x: centerX,
                y
            },

            bottom: {
                x: centerX,
                y: y + height
            },

            center: {
                x: centerX,
                y: y + height / 2
            },

            bus: {
                x: centerX,
                y: busY
            }
        };
    }

    //========================================================
    // PAINEL PRINCIPAL 1QP / 3QP
    //========================================================

    static drawMain(layer, data = {}) {

        const {

            id = "",

            label = id,

            x = 0,

            y = 0,

            width = 4200,

            height = 520,

            color = "#3f7cff",

            busY = y + 85,

            busStrokeWidth = 2.1,

            voltage = "14,4 kV",

            voltageLabel = true,

            busSections = [],

            busBreakers = [],

            feeders = []

        } = data;

        const group =
            this.group(
                id
                    ? `panel-${id}`
                    : "",
                "main-panel"
            );

        this.setEquipmentData(
            group,
            {
                id,

                type:
                    "main-panel",

                energized:
                    data.energized ?? true,

                state:
                    data.state ?? ""
            }
        );

        const busStartX =
            data.busStartX ??
            x + 70;

        const busEndX =
            data.busEndX ??
            x + width - 70;

        /*
         * A moldura envolve somente o barramento.
         * Os alimentadores permanecem abaixo e fora dela.
         */
        const busBoxX =
            data.busBoxX ??
            x;

        const busBoxY =
            data.busBoxY ??
            busY - 58;

        const busBoxWidth =
            data.busBoxWidth ??
            width;

        const busBoxHeight =
            data.busBoxHeight ??
            116;

        this.drawModeButton(
            group,
            data,
            busBoxX - 115,
            busBoxY + 28,
            {
                id,
                width: 92,
                height: 46
            }
        );

        //====================================================
        // CONTORNO DO BARRAMENTO
        //====================================================

        if (
            data.showBorder !==
            false
        ) {

            group.appendChild(
                this.rect(
                    busBoxX,
                    busBoxY,
                    busBoxWidth,
                    busBoxHeight,
                    "none",
                    data.borderColor ??
                        this.COLORS.border,
                    data.borderWidth ??
                        1.6,
                    {
                        className:
                            "main-panel-border"
                    }
                )
            );
        }

        //====================================================
        // NOME DO PAINEL
        //====================================================

        group.appendChild(
            this.text(
                busBoxX,
                busBoxY - 18,
                label,
                data.titleSize ?? 28,
                data.titleColor ??
                    this.COLORS.text,
                {
                    anchor:
                        "start",

                    weight:
                        "700",

                    className:
                        "main-panel-title"
                }
            )
        );

        //====================================================
        // BARRAMENTOS
        //====================================================

        const sections =
            busSections.length > 0
                ? busSections
                : [
                    {
                        x1:
                            busStartX,

                        x2:
                            busEndX,

                        color
                    }
                ];

        sections.forEach(
            (
                section,
                index
            ) => {

                const line =
                    this.line(
                        section.x1,

                        section.y ??
                            busY,

                        section.x2,

                        section.y ??
                            busY,

                        section.color ??
                            color,

                        section.width ??
                            busStrokeWidth,

                        {
                            className:
                                "main-bus-section"
                        }
                    );

                line.dataset.sectionIndex =
                    String(index);

                line.dataset.panelId =
                    id;

                group.appendChild(
                    line
                );
            }
        );

        //====================================================
        // TENSÃO
        //====================================================

        if (
            voltageLabel !==
            false
        ) {

            group.appendChild(
                this.text(
                    busBoxX +
                        busBoxWidth -
                        10,

                    busBoxY + 34,

                    voltage,

                    data.voltageSize ??
                        27,

                    data.voltageColor ??
                        this.COLORS.text,

                    {
                        anchor:
                            "end",

                        weight:
                            "600",

                        className:
                            "panel-voltage"
                    }
                )
            );
        }

        //====================================================
        // DJs DE INTERLIGAÇÃO 101 / 102
        //====================================================

        busBreakers.forEach(
            item => {

                Breaker.draw(
                    group,
                    {
                        id:
                            item.id,

                        label:
                            item.id,

                        x:
                            item.x,

                        y:
                            item.y ??
                            busY,

                        size:
                            item.size ??
                            34,

                        state:
                            item.state ??
                            Breaker.STATES
                                .OPEN_AUTO,

                        closed:
                            item.closed,

                        stroke:
                            item.color ??
                            this.COLORS.border,

                        textColor:
                            item.textColor ??
                            this.COLORS.text,

                        strokeWidth:
                            item.strokeWidth ??
                            1.4,

                        labelPosition:
                            item.labelPosition ??
                            "top",

                        labelOffset:
                            item.labelOffset ??
                            10,

                        showLabel:
                            item.showLabel ??
                            true,

                        time:
                            item.time ??
                            "",

                        timePosition:
                            item.timePosition ??
                            "bottom",

                        energized:
                            item.energized ??
                            false,

                        available:
                            item.available ??
                            true,

                        interactive:
                            item.interactive ??
                            true,

                        onCommand:
                            item.onCommand ??
                            null,

                        fontSize:
                            item.fontSize ??
                            20,

                        timeFontSize:
                            item.timeFontSize ??
                            18
                    }
                );
            }
        );

        //====================================================
        // ALIMENTADORES
        //====================================================

        feeders.forEach(
            feeder => {

                this.drawMainFeeder(
                    group,
                    {
                        panelId:
                            id,

                        panelY:
                            y,

                        panelHeight:
                            height,

                        busY,

                        busBoxBottomY:
                            busBoxY +
                            busBoxHeight,

                        defaultColor:
                            color,

                        ...feeder
                    }
                );
            }
        );

        layer.appendChild(
            group
        );

        return group;
    }

    //========================================================
    // ALIMENTADOR DO 1QP / 3QP
    //========================================================

    static drawMainFeeder(
        group,
        data = {}
    ) {

        const {

            panelId = "",

            panelY = 0,

            panelHeight = 520,

            busY = 0,

            busBoxBottomY =
                busY + 58,

            id = "",

            x = 0,

            color =
                data.defaultColor ??
                "#3f7cff",

            state =
                Breaker.STATES.CLOSED,

            closed = true,

            bottomLabel = "",

            secondaryBottomLabel = "",

            secondaryOffset = 200,

            branchY = null,

            note = "",

            breakerSize = 30,

            /*
             * O DJ começa abaixo da moldura
             * do barramento.
             */
            feederTopY =
                busBoxBottomY + 22,

            feederBottomY =
                panelY +
                panelHeight -
                95

        } = data;

        const feederGroup =
            this.group(
                panelId && id
                    ? `feeder-${panelId}-${id}-${bottomLabel}`
                    : "",
                "main-panel-feeder"
            );

        feederGroup.dataset.feederId =
            id;

        feederGroup.dataset.panelId =
            panelId;

        feederGroup.dataset.output =
            bottomLabel;

        //====================================================
        // TAG AO PASSAR O MOUSE
        // IDENTIFICA A SAÍDA ALIMENTADA PELO DJ
        //====================================================

        const feederOutputs =
            [
                bottomLabel,
                secondaryBottomLabel
            ]
                .map(
                    value =>
                        String(
                            value ?? ""
                        ).trim()
                )
                .filter(Boolean);

        const destinationText =
            feederOutputs.length > 0
                ? feederOutputs.join(" / ")
                : "SEM IDENTIFICAÇÃO";

        const currentSupplyText =
            data.energized === false
                ? "SEM TENSÃO"
                : (
                    data.suppliedBy ??
                    "FONTE DISPONÍVEL"
                );

        const hoverLineOne =
            `DJ ${id}  •  ALIMENTA: ${destinationText}`;

        const hoverLineTwo =
            `FONTE ATUAL: ${currentSupplyText}`;

        const hoverTagWidth =
            Math.max(
                310,
                Math.min(
                    560,
                    Math.max(
                        hoverLineOne.length,
                        hoverLineTwo.length
                    ) * 13 + 34
                )
            );

        const hoverTagHeight =
            78;

        const hoverTagX =
            x + breakerSize / 2 + 26;

        const hoverTagY =
            feederTopY - 38;

        const hoverTag =
            this.group(
                "",
                "feeder-hover-tag"
            );

        hoverTag.setAttribute(
            "pointer-events",
            "none"
        );

        hoverTag.style.display =
            "none";

        hoverTag.appendChild(
            this.rect(
                hoverTagX,
                hoverTagY,
                hoverTagWidth,
                hoverTagHeight,
                "#fffbe8",
                "#66727a",
                1.8,
                {
                    className:
                        "feeder-hover-tag-body"
                }
            )
        );

        hoverTag.appendChild(
            this.text(
                hoverTagX + 17,
                hoverTagY + 31,
                hoverLineOne,
                22,
                "#263238",
                {
                    anchor:
                        "start",
                    weight:
                        "700",
                    className:
                        "feeder-hover-tag-title"
                }
            )
        );

        hoverTag.appendChild(
            this.text(
                hoverTagX + 17,
                hoverTagY + 61,
                hoverLineTwo,
                19,
                "#4f5b63",
                {
                    anchor:
                        "start",
                    weight:
                        "600",
                    className:
                        "feeder-hover-tag-subtitle"
                }
            )
        );

        /*
         * A tag precisa ficar acima de TODO o diagrama.
         *
         * O Renderer já possui a camada "effects", criada por último
         * dentro do SVG. Portanto ela é naturalmente a camada mais alta.
         *
         * Usamos diretamente essa camada em vez de ownerSVGElement,
         * porque durante drawMainFeeder() o grupo do painel ainda pode
         * não ter sido anexado ao SVG e ownerSVGElement pode ser null.
         */
        const hoverOverlay =
            document.getElementById(
                "effects"
            );

        if (hoverOverlay) {

            hoverOverlay.appendChild(
                hoverTag
            );

        } else {

            /*
             * Fallback apenas para evitar perda da tag caso a camada
             * effects ainda não exista por algum motivo.
             */
            feederGroup.appendChild(
                hoverTag
            );
        }

        const showHoverTag = () => {

            /*
             * Garante novamente que a tag esteja dentro de "effects"
             * no momento do hover.
             */
            const currentEffects =
                document.getElementById(
                    "effects"
                );

            if (currentEffects) {

                currentEffects.appendChild(
                    hoverTag
                );
            }

            hoverTag.style.display =
                "block";
        };

        const hideHoverTag = () => {
            hoverTag.style.display =
                "none";
        };

        feederGroup.addEventListener(
            "pointerenter",
            showHoverTag
        );

        feederGroup.addEventListener(
            "pointerleave",
            hideHoverTag
        );

        /*
         * Também adiciona o tooltip nativo do SVG como apoio.
         */
        const nativeTitle =
            this.create(
                "title"
            );

        nativeTitle.textContent =
            `${hoverLineOne} | ${hoverLineTwo}`;

        feederGroup.insertBefore(
            nativeTitle,
            feederGroup.firstChild
        );

        //====================================================
        // LINHA VERTICAL
        //====================================================

        const resolvedBranchY =
            branchY ??
            feederTopY +
            breakerSize +
            76;

        const hasSecondaryOutput =
            Boolean(
                secondaryBottomLabel
            );

        /*
         * Quando houver uma segunda saída, a linha principal
         * desce somente até o ponto da derivação.
         */
        const mainLineEndY =
            hasSecondaryOutput
                ? resolvedBranchY
                : feederBottomY;

        feederGroup.appendChild(
            this.line(
                x,
                busY,
                x,
                mainLineEndY,
                color,
                data.lineWidth ??
                    1.55,
                {
                    className:
                        "feeder-line"
                }
            )
        );

        //====================================================
        // DISJUNTOR DO ALIMENTADOR
        //====================================================

        Breaker.draw(
            feederGroup,
            {
                id:
                    `${panelId}-${id}-${bottomLabel}`,

                label:
                    id,

                x,

                y:
                    feederTopY +
                    breakerSize / 2,

                size:
                    breakerSize,

                state,

                closed,

                stroke:
                    color,

                textColor:
                    color,

                strokeWidth:
                    1.4,

                labelPosition:
                    data.breakerLabelPosition ??
                    "bottom",

                labelOffset:
                    data.breakerLabelOffset ??
                    22,

                showLabel:
                    false,

                interactive:
                    data.interactive ??
                    true,

                onCommand:
                    data.onBreakerCommand ??
                    null,

                energized:
                    data.energized ??
                    true,

                available:
                    data.available ??
                    true
            }
        );

        //====================================================
        // NÚMERO VERTICAL DO DJ
        //====================================================

        const djTextX =
            x - 10;

        const djTextY =
            feederTopY + 76;

        feederGroup.appendChild(
            this.text(
                djTextX,
                djTextY,
                id,
                data.idSize ??
                    30,
                color,
                {
                    anchor:
                        "middle",

                    weight:
                        "700",

                    transform:
                        `rotate(-90 ${djTextX} ${djTextY})`,

                    className:
                        "feeder-id"
                }
            )
        );

        //====================================================
        // SAÍDA SIMPLES OU DUPLA
        //====================================================

        if (hasSecondaryOutput) {

            const secondaryX =
                x +
                secondaryOffset;

            /*
             * Derivação horizontal após o DJ.
             */
            feederGroup.appendChild(
                this.line(
                    x,
                    resolvedBranchY,
                    secondaryX,
                    resolvedBranchY,
                    color,
                    data.lineWidth ??
                        1.55,
                    {
                        className:
                            "feeder-branch-line"
                    }
                )
            );

            /*
             * Linha vertical da saída principal.
             */
            feederGroup.appendChild(
                this.line(
                    x,
                    resolvedBranchY,
                    x,
                    feederBottomY,
                    color,
                    data.lineWidth ??
                        1.55,
                    {
                        className:
                            "feeder-output-line"
                    }
                )
            );

            /*
             * Linha vertical da saída secundária.
             */
            feederGroup.appendChild(
                this.line(
                    secondaryX,
                    resolvedBranchY,
                    secondaryX,
                    feederBottomY,
                    color,
                    data.lineWidth ??
                        1.55,
                    {
                        className:
                            "feeder-output-line"
                    }
                )
            );

            this.drawFeederArrow(
                feederGroup,
                {
                    x,
                    y: feederBottomY,
                    color
                }
            );

            this.drawFeederArrow(
                feederGroup,
                {
                    x: secondaryX,
                    y: feederBottomY,
                    color
                }
            );

            if (bottomLabel) {

                feederGroup.appendChild(
                    this.text(
                        x,
                        feederBottomY + 65,
                        bottomLabel,
                        data.bottomLabelSize ??
                            22,
                        this.COLORS.text,
                        {
                            anchor:
                                "middle",

                            weight:
                                "600",

                            className:
                                "feeder-bottom-label"
                        }
                    )
                );
            }

            feederGroup.appendChild(
                this.text(
                    secondaryX,
                    feederBottomY + 65,
                    secondaryBottomLabel,
                    data.bottomLabelSize ??
                        22,
                    this.COLORS.text,
                    {
                        anchor:
                            "middle",

                        weight:
                            "600",

                        className:
                            "feeder-bottom-label"
                    }
                )
            );

        } else {

            this.drawFeederArrow(
                feederGroup,
                {
                    x,
                    y: feederBottomY,
                    color
                }
            );

            if (bottomLabel) {

                feederGroup.appendChild(
                    this.text(
                        x,
                        feederBottomY + 65,
                        bottomLabel,
                        data.bottomLabelSize ??
                            22,
                        this.COLORS.text,
                        {
                            anchor:
                                "middle",

                            weight:
                                "600",

                            className:
                                "feeder-bottom-label"
                        }
                    )
                );
            }
        }

        //====================================================
        // RESERVA / OBSERVAÇÃO
        //====================================================

        if (note) {

            feederGroup.appendChild(
                this.text(
                    x + 20,
                    feederBottomY + 65,
                    note,
                    data.noteSize ??
                        18,
                    this.COLORS.text,
                    {
                        anchor:
                            "start",

                        weight:
                            "600",

                        className:
                            "feeder-note"
                    }
                )
            );
        }

        group.appendChild(
            feederGroup
        );

        return feederGroup;
    }

    //========================================================
    // SETA DO ALIMENTADOR
    //========================================================

    static drawFeederArrow(
        group,
        {
            x,
            y,
            color
        }
    ) {

        const arrow =
            this.create(
                "path"
            );

        arrow.setAttribute(
            "d",
            [
                `M ${x - 14} ${y}`,

                `L ${x + 14} ${y}`,

                `L ${x} ${y + 28}`,

                "Z"
            ].join(" ")
        );

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
            "1.4"
        );

        arrow.classList.add(
            "feeder-arrow"
        );

        group.appendChild(
            arrow
        );

        return arrow;
    }

    //========================================================
    // PAINÉIS SUPERIORES
    // PSA-U01 / 1QD / 3QD
    //========================================================

    static drawDistribution(
        layer,
        data = {}
    ) {

        const {

            id = "",

            label = id,

            x = 0,

            y = 0,

            width = 520,

            height = 250,

            color = "#2f6cff",

            busColor = color,

            breaker = "",

            tag = ""

        } = data;

        const group =
            this.group(
                id
                    ? `panel-${id}`
                    : "",
                "distribution-panel"
            );

        this.setEquipmentData(
            group,
            {
                id,

                type:
                    "distribution-panel",

                energized:
                    data.energized ??
                    true,

                state:
                    data.state ??
                    ""
            }
        );

        const centerX =
            x + width / 2;

        const breakerSize =
            data.breakerSize ??
            58;

        const breakerCenterY =
            data.breakerCenterY ??
            y + 58;

        const switchY =
            data.switchY ??
            y + 138;

        const inputColor =
            data.inputColor ??
            busColor;

        //====================================================
        // ENERGIZAÇÃO APÓS O DJ PRINCIPAL
        //====================================================

        /*
         * A linha que sai do DJ principal do PSA / QD
         * acompanha a cor da UG somente quando o DJ
         * estiver fechado.
         *
         * PSA-U01 / DJ 1001 -> azul da UG-01
         * 1QD-2             -> amarelo da UG-02
         * 3QD-11            -> magenta da UG-11
         * 3QD-12            -> verde da UG-12
         *
         * Com o DJ aberto, o trecho após o disjuntor
         * fica desenergizado.
         */

        const resolvedBreakerState =
            data.breakerState ??
            Breaker.STATES.CLOSED;

        const breakerClosed =
            typeof data.closed === "boolean"
                ? data.closed
                : (
                    resolvedBreakerState ===
                        Breaker.STATES.CLOSED ||

                    resolvedBreakerState ===
                        Breaker.STATES.CLOSED_AUTO ||

                    resolvedBreakerState ===
                        Breaker.STATES.CLOSED_UNDERVOLTAGE_TRIP ||

                    resolvedBreakerState ===
                        "closed" ||

                    resolvedBreakerState ===
                        "closedAuto" ||

                    resolvedBreakerState ===
                        "closedUndervoltageTrip"
                );

        const downstreamEnergized =
            (data.energized ?? true) &&
            (data.available ?? true) &&
            breakerClosed;

        const outputColor =
            data.outputColor ??
            (
                downstreamEnergized
                    ? busColor
                    : this.COLORS.deenergized
            );

        //====================================================
        // CONTORNO DO QUADRO
        //====================================================

        group.appendChild(
            this.rect(
                x,
                y,
                width,
                height,
                "none",
                data.borderColor ??
                    "#7f8c96",
                data.borderWidth ??
                    1.35,
                {
                    className:
                        "distribution-panel-border"
                }
            )
        );

        //====================================================
        // CONDUTOR PRINCIPAL SEGMENTADO
        //====================================================

        /*
         * O condutor não atravessa mais o corpo do DJ.
         * Agora ele é desenhado em três trechos, sempre
         * utilizando a cor do ramal:
         *
         * 1) entrada do RE até a parte superior do DJ;
         * 2) parte inferior do DJ até a seccionadora;
         * 3) seccionadora até a saída para o TR-SA.
         */

        const mainLineWidth =
            data.lineWidth ??
            1.55;

        const breakerTopY =
            breakerCenterY -
            breakerSize / 2;

        const breakerBottomY =
            breakerCenterY +
            breakerSize / 2;

        // Borda superior do painel → DJ
        // A ligação RE → painel já é desenhada pelo Renderer.js.
        group.appendChild(
            this.line(
                centerX,
                y,
                centerX,
                breakerTopY,
                inputColor,
                mainLineWidth,
                {
                    className:
                        "distribution-panel-line distribution-panel-line-top"
                }
            )
        );

        // DJ → seccionadora
        group.appendChild(
            this.line(
                centerX,
                breakerBottomY,
                centerX,
                switchY,
                outputColor,
                mainLineWidth,
                {
                    className:
                        "distribution-panel-line distribution-panel-line-middle"
                }
            )
        );

        // Seccionadora → borda inferior do painel
        // A ligação painel → TR-SA já é desenhada pelo Renderer.js.
        group.appendChild(
            this.line(
                centerX,
                switchY,
                centerX,
                y + height,
                outputColor,
                mainLineWidth,
                {
                    className:
                        "distribution-panel-line distribution-panel-line-bottom"
                }
            )
        );

        //====================================================
        // DISJUNTOR SUPERIOR
        //====================================================

        Breaker.draw(
            group,
            {
                id:
                    `${id}-breaker`,

                label:
                    breaker,

                x:
                    centerX,

                y:
                    breakerCenterY,

                size:
                    breakerSize,

                closed:
                    data.closed ??
                    true,

                state:
                    data.breakerState ??
                    Breaker.STATES.CLOSED,

                stroke:
                    inputColor,

                textColor:
                    inputColor,

                strokeWidth:
                    1.4,

                labelPosition:
                    "right",

                labelOffset:
                    data.breakerLabelOffset ??
                    18,

                showLabel:
                    Boolean(breaker),

                fontSize:
                    data.breakerFontSize ??
                    38,

                interactive:
                    data.interactive ??
                    true,

                onCommand:
                    data.onBreakerCommand ??
                    null,

                energized:
                    data.energized ??
                    true,

                available:
                    data.available ??
                    true
            }
        );

        //====================================================
        // SECCIONADORA HORIZONTAL
        //====================================================

        this.drawDistributionSwitch(
            group,
            {
                x:
                    centerX,

                y:
                    switchY,

                color:
                    outputColor,

                width:
                    data.switchWidth ??
                    1.8
            }
        );

        //====================================================
        // IDENTIFICAÇÃO DO EQUIPAMENTO
        //====================================================

        if (tag) {

            group.appendChild(
                this.text(
                    centerX + 4,

                    switchY + 42,

                    tag,

                    data.tagSize ??
                        20,

                    this.COLORS.text,

                    {
                        anchor:
                            "start",

                        weight:
                            "500",

                        className:
                            "distribution-panel-tag"
                    }
                )
            );
        }

        //====================================================
        // IDENTIFICAÇÃO DO QUADRO
        //====================================================

        group.appendChild(
            this.text(
                x + 25,
                y + height - 24,
                label,
                data.labelSize ??
                    42,
                this.COLORS.text,
                {
                    anchor:
                        "start",

                    weight:
                        "700",

                    className:
                        "distribution-panel-label"
                }
            )
        );

        layer.appendChild(
            group
        );

        return group;
    }

    //========================================================
    // SECCIONADORA E SÍMBOLO LATERAL
    //========================================================

    static drawDistributionSwitch(
        group,
        {
            x,
            y,
            color,
            width = 1.8
        }
    ) {

        const switchGroup =
            this.group(
                "",
                "distribution-switch"
            );

        //========================================
        // NÓ NO EIXO VERTICAL
        //========================================
        switchGroup.appendChild(
            this.circle(
                x,
                y,
                4,
                color,
                color,
                1.2
            )
        );

        //========================================
        // TRECHO HORIZONTAL SAINDO DO EIXO
        //========================================
        switchGroup.appendChild(
            this.line(
                x,
                y,
                x + 18,
                y,
                color,
                width
            )
        );

        //========================================
        // PRIMEIRO CONTATO
        //========================================
        switchGroup.appendChild(
            this.circle(
                x + 28,
                y,
                6,
                color,
                "#ffffff",
                1.4
            )
        );

        //========================================
        // SEGUNDO CONTATO
        //========================================
        switchGroup.appendChild(
            this.circle(
                x + 52,
                y,
                6,
                color,
                "#ffffff",
                1.4
            )
        );

        //========================================
        // FACA INCLINADA
        //========================================
        switchGroup.appendChild(
            this.line(
                x + 33,
                y - 10,
                x + 47,
                y + 2,
                color,
                width
            )
        );

        //========================================
        // TRECHO ATÉ O SÍMBOLO LATERAL
        //========================================
        switchGroup.appendChild(
            this.line(
                x + 58,
                y,
                x + 82,
                y,
                color,
                width
            )
        );

        //========================================
        // SÍMBOLO LATERAL (3 BARRAS)
        //========================================
        switchGroup.appendChild(
            this.line(
                x + 92,
                y - 12,
                x + 92,
                y + 12,
                color,
                width
            )
        );

        switchGroup.appendChild(
            this.line(
                x + 104,
                y - 9,
                x + 104,
                y + 9,
                color,
                1.5
            )
        );

        switchGroup.appendChild(
            this.line(
                x + 116,
                y - 6,
                x + 116,
                y + 6,
                color,
                1.3
            )
        );

        group.appendChild(
            switchGroup
        );

        return switchGroup;
    }

    //========================================================
    // SELETOR MANUAL / AUTO
    //========================================================

    static drawModeButton(group, data, x, y, options = {}) {

        const id = options.id ?? data.id ?? "panel";
        const width = options.width ?? 92;
        const height = options.height ?? 46;

        data.operationMode =
            String(data.operationMode ?? "AUTO").toUpperCase() === "MANUAL"
                ? "MANUAL"
                : "AUTO";

        const button = this.group(
            `mode-button-${id}`,
            "panel-mode-button"
        );

        const body = this.rect(
            x, y, width, height,
            "#ffffff", "#66727a", 1.6,
            { className: "panel-mode-button-body" }
        );

        const label = this.text(
            x + width / 2,
            y + height / 2 + 7,
            data.operationMode,
            19,
            "#263238",
            {
                weight: "700",
                className: "panel-mode-button-label"
            }
        );

        const refresh = () => {
            const manual = data.operationMode === "MANUAL";
            label.textContent = data.operationMode;
            body.setAttribute("fill", manual ? "#fff3cd" : "#ffffff");
            body.setAttribute("stroke", manual ? "#d4a900" : "#66727a");
            button.dataset.mode = data.operationMode;
        };

        button.appendChild(body);
        button.appendChild(label);
        button.style.cursor = "pointer";

        button.addEventListener(
            "pointerdown",
            event => event.stopPropagation()
        );

        button.addEventListener("click", event => {
            event.preventDefault();
            event.stopPropagation();

            data.operationMode =
                data.operationMode === "AUTO"
                    ? "MANUAL"
                    : "AUTO";

            refresh();

            window.dispatchEvent(
                new CustomEvent("scada:panel-mode-changed", {
                    detail: { id, mode: data.operationMode }
                })
            );
        });

        refresh();
        group.appendChild(button);

        return button;
    }

}
