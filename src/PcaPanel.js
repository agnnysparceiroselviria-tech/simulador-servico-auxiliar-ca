// PcaPanel.js
import { Equipment } from "./Equipment.js";
import { Breaker } from "./Breaker.js";
import { Engine } from "./Engine.js";
import { CcmU01View } from "./CcmU01View.js";
import { AuxPanelDetailView } from "./AuxPanelDetailView.js";

export class PcaPanel extends Equipment {

    static COLORS = {
        text: "#263238",
        border: "#3f4b53",
        openBreaker: "#ffffff",
        closedBreaker: "#000000",
        unavailable: "#7a858d"
    };

    //==================================================
    // DESENHO PRINCIPAL
    //==================================================

    static draw(layer, data = {}) {

        if (!layer || !data) {
            console.warn("[PcaPanel] Dados ou camada ausentes.");
            return null;
        }

        if (data.type === "pcaGroup") {
            return this.drawGroup(layer, data);
        }

        return this.drawSinglePanelLegacy(layer, data);
    }

    //==================================================
    // GRUPO P/R COMPLETO
    //==================================================

    static drawGroup(layer, data = {}) {

        const {
            id = "",
            x = 0,
            y = 0,
            width = 1500,
            panelHeight = 110,
            gap = 650
        } = data;

        const group = this.group(
            id ? `pca-group-${id}` : "",
            "pca-group"
        );

        this.setEquipmentData(group, {
            id,
            type: "pca-group",
            energized: data.energized ?? true,
            available: data.available ?? true
        });

        const topY = y;
        const bottomY = y + gap;

        const topBusY =
            topY + panelHeight / 2;

        const bottomBusY =
            bottomY + panelHeight / 2;

        this.drawModeButton(
            group,
            data,
            x - 115,
            topY + panelHeight / 2 - 23,
            {
                id,
                width: 92,
                height: 46
            }
        );

        const feederSupplyMap =
            Engine.getFeederSupplyMap?.() ??
            new Map();

        const topSourceNumber =
            String(
                data.topIncoming
                    ?.sourceNumber ?? ""
            ).trim();

        const bottomSourceNumber =
            String(
                data.bottomIncoming
                    ?.sourceNumber ?? ""
            ).trim();

        const topSupply =
            Engine.getPcaSideSupply?.(
                id,
                "top",
                feederSupplyMap
            ) ??
            feederSupplyMap.get(
                topSourceNumber
            );

        const bottomSupply =
            Engine.getPcaSideSupply?.(
                id,
                "bottom",
                feederSupplyMap
            ) ??
            feederSupplyMap.get(
                bottomSourceNumber
            );

        const topEnergized =
            topSupply?.energized ??
            data.topPanel?.energized ??
            true;

        const bottomEnergized =
            bottomSupply?.energized ??
            data.bottomPanel?.energized ??
            true;

        const topColor =
            topSupply?.color ??
            data.topPanel?.color ??
            this.COLORS.border;

        const bottomColor =
            bottomSupply?.color ??
            data.bottomPanel?.color ??
            this.COLORS.border;

        if (data.topPanel) {

            data.topPanel.color =
                topColor;

            data.topPanel.energized =
                topEnergized;

            data.topPanel.suppliedBy =
                topSupply?.suppliedBy ??
                data.topPanel.suppliedBy ??
                null;
        }

        if (data.bottomPanel) {

            data.bottomPanel.color =
                bottomColor;

            data.bottomPanel.energized =
                bottomEnergized;

            data.bottomPanel.suppliedBy =
                bottomSupply?.suppliedBy ??
                data.bottomPanel.suppliedBy ??
                null;
        }

        //==================================================
        // PAINEL SUPERIOR
        //==================================================

        this.drawBusPanel(group, {
            id: `${id}-top`,
            x,
            y: topY,
            width,
            height: panelHeight,
            color: topColor,
            label:
                data.topPanel?.label ??
                "CF-pCA-P"
        });

        //==================================================
        // PAINEL INFERIOR
        //==================================================

        this.drawBusPanel(group, {
            id: `${id}-bottom`,
            x,
            y: bottomY,
            width,
            height: panelHeight,
            color: bottomColor,
            label:
                data.bottomPanel?.label ??
                "CF-pCA-R",

            /*
             * Permite posicionar a identificaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o do painel R
             * abaixo da moldura. Quando nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o informado,
             * mantÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©m o padrÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o antigo acima do quadro.
             */
            labelY:
                data.bottomPanel?.labelY ??
                null
        });

        //==================================================
        // ENTRADA SUPERIOR
        //==================================================

        if (data.topIncoming) {

            this.drawIncomingTop(group, {
                ...data.topIncoming,

                id:
                    `${id}-incoming-top`,

                x:
                    data.topIncoming.x ??
                    x + width / 2,

                panelY: topY,
                busY: topBusY,
                color: topColor,
                energized: topEnergized,
                sourceEnergized:
                    topSupply?.sourceEnergized ??
                    topEnergized,
                groupId: id,
                side: "top"
            });
        }

        //==================================================
        // ENTRADA INFERIOR
        //==================================================

        if (data.bottomIncoming) {

            this.drawIncomingBottom(group, {
                ...data.bottomIncoming,

                id:
                    `${id}-incoming-bottom`,

                x:
                    data.bottomIncoming.x ??
                    x + width / 2,

                panelY: bottomY,
                busY: bottomBusY,
                color: bottomColor,
                energized: bottomEnergized,
                sourceEnergized:
                    bottomSupply?.sourceEnergized ??
                    bottomEnergized,
                groupId: id,
                side: "bottom"
            });
        }

        //==================================================
        // CARGAS
        //==================================================

        data.loads?.forEach(load => {

            this.drawLoad(group, {
                ...load,

                groupId: id,

                topBusY,
                bottomBusY,

                topPanelBottomY:
                    topY + panelHeight,

                panelHeight,

                topColor,
                bottomColor,

                topEnergized,
                bottomEnergized,

                topSuppliedBy:
                    topSupply?.suppliedBy ?? null,

                bottomSuppliedBy:
                    bottomSupply?.suppliedBy ?? null,

                defaultColor:
                    load.color ??
                    load.boxColor ??
                    this.COLORS.border
            });
        });

        //==================================================
        // GERADORES
        //==================================================

        data.generators?.forEach(
            (generator, index) => {

                this.drawSmallGenerator(group, {
                    ...generator,

                    id:
                        generator.id ??
                        `${id}-generator-${index}`
                });
            }
        );

        //==================================================
        // INTERLIGAÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ES
        //==================================================

        data.interlinks?.forEach(link => {
            this.drawInterlink(group, link);
        });

        //==================================================
        // RESERVA
        //==================================================

        if (data.reserve) {

            this.drawReserve(
                group,
                {
                    ...data.reserve,

                    /*
                     * A reserva fica alinhada e conectada
                     * diretamente ao barramento superior P.
                     */
                    busY:
                        topBusY,

                    busEndX:
                        x + width - 45
                },
                topColor
            );
        }

        layer.appendChild(group);

        return group;
    }

    //==================================================
    // PAINEL E BARRAMENTO
    //==================================================

    static drawBusPanel(group, data = {}) {

        const {
            id = "",
            x = 0,
            y = 0,
            width = 1500,
            height = 110,
            color = "#3f7cff",
            label = "",
            labelY = null
        } = data;

        const panelGroup = this.group(
            id ? `pca-panel-${id}` : "",
            "pca-bus-panel"
        );

        const busY =
            y + height / 2;

        /*
         * Ajuste exclusivo do conjunto P14 / R14:
         * aumenta ligeiramente o comprimento útil do barramento
         * para que ele ultrapasse os DJs 52-1 nas extremidades.
         *
         * Os demais PCAs mantêm exatamente o comprimento atual.
         */
        const busInset =
            String(id).startsWith("P14_R14")
                ? 25
                : 45;

        //==================================================
        // CONTORNO
        //==================================================

        panelGroup.appendChild(
            this.rect(
                x,
                y,
                width,
                height,
                "none",
                this.COLORS.border,
                1.5,
                {
                    className:
                        "pca-panel-border"
                }
            )
        );

        //==================================================
        // BARRAMENTO
        //==================================================

        panelGroup.appendChild(
            this.line(
                x + busInset,
                busY,
                x + width - busInset,
                busY,
                color,
                2.1,
                {
                    className:
                        "pca-panel-bus"
                }
            )
        );

        //==================================================
        // IDENTIFICAÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢O
        //==================================================

        if (label) {

            panelGroup.appendChild(
                this.text(
                    x,
                    labelY ?? (y - 18),
                    label,
                    28,
                    this.COLORS.text,
                    {
                        anchor: "start",
                        weight: "700",
                        className:
                            "pca-panel-title"
                    }
                )
            );
        }

        group.appendChild(panelGroup);

        return panelGroup;
    }

    //==================================================
    // ENTRADA SUPERIOR
    //==================================================

    static drawIncomingTop(group, data = {}) {

        const {
            id = "",
            x = 0,
            panelY = 0,
            busY = 0,
            color = "#3f7cff",

            sourceNumber = "",
            breaker = "",
            time = "",
            transformer = true,
            labels = [],
            energized = true,
            sourceEnergized = energized,
            closed = true,
            groupId = "",
            side = "top"
        } = data;

        const incoming = this.group(
            id,
            "pca-incoming top"
        );

        const topLineY =
            data.topLineY ??
            panelY - 330;

        const transformerY =
            data.transformerY ??
            panelY - 230;

        const breakerY =
            data.breakerY ??
            panelY - 30;

        //==================================================
        // LINHA PRINCIPAL SEGMENTADA
        //==================================================

        /*
         * A linha vertical nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o atravessa mais o sÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­mbolo
         * do transformador. Ela ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â© desenhada em dois trechos:
         * acima e abaixo das bobinas.
         */
        const transformerRadius =
            data.transformerRadius ?? 18;

        const transformerTopY =
            transformerY - transformerRadius;

        const transformerBottomY =
            transformerY +
            transformerRadius * 2.65;

        const upperContactY =
            topLineY + 28;

        const lowerContactY =
            topLineY + 50;

        incoming.appendChild(
            this.line(
                x,
                lowerContactY + 6,
                x,
                transformerTopY,
                color,
                1.55,
                {
                    className:
                        "pca-incoming-line pca-incoming-line-top"
                }
            )
        );

        incoming.appendChild(
            this.line(
                x,
                transformerBottomY,
                x,
                busY,
                color,
                1.55,
                {
                    className:
                        "pca-incoming-line pca-incoming-line-bottom"
                }
            )
        );

        //==================================================
        // NÃƒÆ’Ã†â€™Ãƒâ€¦Ã‚Â¡MERO DA FONTE
        //==================================================

        if (sourceNumber) {

            incoming.appendChild(
                this.text(
                    x,
                    topLineY - 24,
                    sourceNumber,
                    20,
                    this.COLORS.text,
                    {
                        weight: "700"
                    }
                )
            );
        }

        //==================================================
        // TERMINAL EM "V" ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â SOMENTE DUAS LINHAS INCLINADAS
        //==================================================

        const terminalApexY =
            topLineY + 13;

        incoming.appendChild(
            this.line(
                x - 8,
                topLineY + 2,
                x,
                terminalApexY,
                color,
                1.5
            )
        );

        incoming.appendChild(
            this.line(
                x + 8,
                topLineY + 2,
                x,
                terminalApexY,
                color,
                1.5
            )
        );

        /*
         * Pequena ligaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o vertical entre o terminal em "V"
         * e a chave CF-STS.
         */
        incoming.appendChild(
            this.line(
                x,
                terminalApexY,
                x,
                upperContactY - 5,
                color,
                1.5,
                {
                    className:
                        "pca-sts-terminal-link"
                }
            )
        );

        /*
         * Chave CF-STS conforme o diagrama original:
         * dois contatos e lÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢mina inclinada.
         */
        incoming.appendChild(
            this.circle(
                x,
                upperContactY,
                5,
                color,
                "#ffffff",
                1.5
            )
        );

        incoming.appendChild(
            this.circle(
                x,
                lowerContactY,
                5,
                color,
                "#ffffff",
                1.5
            )
        );

        incoming.appendChild(
            this.line(
                x - 1,
                upperContactY + 5,
                x + 7,
                lowerContactY - 5,
                color,
                1.5,
                {
                    linecap: "round",
                    className:
                        "pca-sts-switch-blade"
                }
            )
        );

        //==================================================
        // TRANSFORMADOR
        //==================================================

        if (transformer !== false) {

            this.drawTransformerSymbol(
                incoming,
                x,
                transformerY,
                color,
                data.transformerRadius ?? 18
            );
        }

        //==================================================
        // DISJUNTOR
        //==================================================

        const breakerClosed =
            closed !== false;

        this.drawSwitchBox(
            incoming,
            {
                id:
                    `${id}-breaker`,

                x,
                y: breakerY,

                label: breaker,
                time,
                color,
                energized:
                    breakerClosed &&
                    sourceEnergized !== false,

                state:
                    breakerClosed
                        ? Breaker.STATES.CLOSED_AUTO
                        : Breaker.STATES.OPEN_AUTO,

                symbolType:
                    breakerClosed
                        ? ""
                        : "closedAutoQuadrant",

                labelColor:
                    breakerClosed
                        ? this.COLORS.text
                        : color,

                timeColor:
                    breakerClosed
                        ? this.COLORS.text
                        : color,

                labelPosition:
                    "right",

                timePosition:
                    "left",

                labelOffset:
                    18,

                timeOffset:
                    18,

                interactive: true,

                onCommand:
                    () =>
                        Engine.togglePcaIncomingBreaker(
                            groupId,
                            side
                        )
            }
        );

        //==================================================
        // TEXTOS
        //==================================================

        labels.forEach((label, index) => {

            /*
             * MantÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©m a tag CF-STS prÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³xima da chave e cria
             * um espaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§amento maior antes da tag CF-TSA.
             */
            const extraSpacing =
                index >= 1
                    ? 16
                    : 0;

            incoming.appendChild(
                this.text(
                    x + 34,
                    topLineY +
                        42 +
                        index * 25 +
                        extraSpacing,
                    label,
                    18,
                    this.COLORS.text,
                    {
                        anchor: "start",
                        weight: "600"
                    }
                )
            );
        });

        group.appendChild(incoming);

        return incoming;
    }

    //==================================================
    // ENTRADA INFERIOR
    //==================================================

    static drawIncomingBottom(group, data = {}) {

        const {
            id = "",
            x = 0,
            panelY = 0,
            busY = 0,
            color = "#44dd55",

            sourceNumber = "",
            breaker = "",
            time = "",
            transformer = true,
            labels = [],
            energized = true,
            sourceEnergized = energized,
            closed = true,
            groupId = "",
            side = "bottom"
        } = data;

        const incoming = this.group(
            id,
            "pca-incoming bottom"
        );

        const breakerY =
            data.breakerY ??
            panelY + 130;

        const transformerY =
            data.transformerY ??
            panelY + 220;

        const bottomLineY =
            data.bottomLineY ??
            panelY + 400;

        //==================================================
        // LINHA PRINCIPAL SEGMENTADA
        //==================================================

        /*
         * A linha vertical tambÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©m nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o atravessa o sÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­mbolo
         * do transformador da entrada inferior.
         */
        const transformerRadius =
            data.transformerRadius ?? 18;

        const transformerTopY =
            transformerY - transformerRadius;

        const transformerBottomY =
            transformerY +
            transformerRadius * 2.65;

        incoming.appendChild(
            this.line(
                x,
                busY,
                x,
                transformerTopY,
                color,
                1.55,
                {
                    className:
                        "pca-incoming-line pca-incoming-line-top"
                }
            )
        );

        /*
         * A linha inferior termina antes da chave CF-STS-R.
         * O restante ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â© formado pela prÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³pria chave e pelo
         * terminal em "V".
         */
        incoming.appendChild(
            this.line(
                x,
                transformerBottomY,
                x,
                bottomLineY - 64,
                color,
                1.55,
                {
                    className:
                        "pca-incoming-line pca-incoming-line-bottom"
                }
            )
        );

        //==================================================
        // DISJUNTOR
        //==================================================

        const breakerClosed =
            closed !== false;

        this.drawSwitchBox(
            incoming,
            {
                id:
                    `${id}-breaker`,

                x,
                y: breakerY,

                label: breaker,
                time,
                color,
                energized:
                    breakerClosed &&
                    sourceEnergized !== false,

                state:
                    breakerClosed
                        ? Breaker.STATES.CLOSED_AUTO
                        : Breaker.STATES.OPEN_AUTO,

                symbolType:
                    breakerClosed
                        ? ""
                        : "closedAutoQuadrant",

                labelColor:
                    breakerClosed
                        ? this.COLORS.text
                        : color,

                timeColor:
                    breakerClosed
                        ? this.COLORS.text
                        : color,

                labelPosition:
                    "right",

                timePosition:
                    "left",

                labelOffset:
                    18,

                timeOffset:
                    18,

                interactive: true,

                onCommand:
                    () =>
                        Engine.togglePcaIncomingBreaker(
                            groupId,
                            side
                        )
            }
        );

        //==================================================
        // TRANSFORMADOR
        //==================================================

        if (transformer !== false) {

            this.drawTransformerSymbol(
                incoming,
                x,
                transformerY,
                color,
                data.transformerRadius ?? 18
            );
        }

        //==================================================
        // CHAVE CF-STS-R + TERMINAL EM "V"
        //==================================================

        const upperContactY =
            bottomLineY - 58;

        const lowerContactY =
            bottomLineY - 36;

        /*
         * Chave CF-STS-R conforme o diagrama original:
         * dois contatos e lÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢mina inclinada.
         */
        incoming.appendChild(
            this.circle(
                x,
                upperContactY,
                5,
                color,
                "#ffffff",
                1.5
            )
        );

        incoming.appendChild(
            this.circle(
                x,
                lowerContactY,
                5,
                color,
                "#ffffff",
                1.5
            )
        );

        incoming.appendChild(
            this.line(
                x - 1,
                upperContactY + 5,
                x + 7,
                lowerContactY - 5,
                color,
                1.5,
                {
                    linecap: "round",
                    className:
                        "pca-sts-switch-blade"
                }
            )
        );

        /*
         * Pequena ligaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o vertical entre a chave
         * CF-STS-R e o terminal inferior em "V".
         */
        const terminalApexY =
            bottomLineY - 13;

        incoming.appendChild(
            this.line(
                x,
                lowerContactY + 5,
                x,
                terminalApexY,
                color,
                1.5,
                {
                    className:
                        "pca-sts-terminal-link"
                }
            )
        );

        /*
         * Terminal inferior em "V".
         */
        incoming.appendChild(
            this.line(
                x,
                terminalApexY,
                x - 8,
                bottomLineY - 2,
                color,
                1.5
            )
        );

        incoming.appendChild(
            this.line(
                x,
                terminalApexY,
                x + 8,
                bottomLineY - 2,
                color,
                1.5
            )
        );

        //==================================================
        // NÃƒÆ’Ã†â€™Ãƒâ€¦Ã‚Â¡MERO DA FONTE
        //==================================================

        if (sourceNumber) {

            incoming.appendChild(
                this.text(
                    x,
                    bottomLineY + 32,
                    sourceNumber,
                    20,
                    this.COLORS.text,
                    {
                        weight: "700"
                    }
                )
            );
        }

        //==================================================
        // TEXTOS
        //==================================================

        labels.forEach((label, index) => {

            /*
             * MantÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©m os dados do transformador prÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³ximos
             * ÃƒÆ’Ã†â€™ s bobinas e cria espaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§o antes da tag CF-STS-R.
             */
            const extraSpacing =
                index >= 3
                    ? 14
                    : 0;

            incoming.appendChild(
                this.text(
                    x + 34,
                    panelY +
                        205 +
                        index * 25 +
                        extraSpacing,
                    label,
                    18,
                    this.COLORS.text,
                    {
                        anchor: "start",
                        weight: "600"
                    }
                )
            );
        });

        group.appendChild(incoming);

        return incoming;
    }

    //==================================================
    // CARGA ENTRE OS PAINÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â°IS
    //==================================================

    static drawLoad(group, load = {}) {

        const {
            groupId = "",
            id = "",
            label = id,

            x = 0,
            topBusY = 0,
            bottomBusY = 0,

            topPanelBottomY =
                topBusY + 55,

            panelHeight = 110,

            topColor = "#3f7cff",
            bottomColor = "#44dd55",
            topEnergized = true,
            bottomEnergized = true,
            topSuppliedBy = null,
            bottomSuppliedBy = null,
            defaultColor = "#3f4b53",

            boxWidth = 150,
            boxHeight = 78
        } = load;

        const loadGroup = this.group(
            `pca-load-${groupId}-${id}`,
            "pca-load"
        );

        const loadAvailable =
            load.available ??
            true;

        const isCmOrCcm =
            /^(CM-|CCM-)/i.test(
                String(id)
            );

        const transferConfig =
            Engine.getPcaLoadTransferConfig?.(
                groupId,
                id
            ) ?? null;

        const loadTransferState =
            Engine.getPcaLoadTransferState?.(
                id
            ) ?? null;

        const loadOperationMode =
            String(
                loadTransferState?.operationMode ??
                load.operationMode ??
                "AUTO"
            ).toUpperCase();

        const manualMode =
            isCmOrCcm &&
            loadOperationMode === "MANUAL";

        loadGroup.dataset.operationMode =
            loadOperationMode;

        const reserveSide =
            transferConfig?.normalSide === "top"
                ? "bottom"
                : transferConfig?.normalSide === "bottom"
                    ? "top"
                    : null;

        const deviceHasExplicitState = device => {

            if (!device) {
                return false;
            }

            if (device.kind === "mid") {
                return typeof load.midBreakerClosed ===
                    "boolean";
            }

            const collection =
                device.kind === "lower"
                    ? load.lowerSwitches
                    : load.upperSwitches;

            const switchData =
                collection?.find(item =>
                    String(item.label ?? "") ===
                    String(device.label ?? "")
                );

            return typeof switchData?.closed ===
                "boolean";
        };

        const normalDeviceClosed =
            transferConfig
                ? deviceHasExplicitState(
                    transferConfig.normal
                )
                    ? Engine.isPcaTransferDeviceClosed?.(
                        load,
                        transferConfig.normal
                    ) === true
                    : load.activeSupply
                        ? load.activeSupply ===
                            transferConfig.normalSide
                        : true
                : false;

        const reserveDeviceClosed =
            transferConfig
                ? deviceHasExplicitState(
                    transferConfig.reserve
                )
                    ? Engine.isPcaTransferDeviceClosed?.(
                        load,
                        transferConfig.reserve
                    ) === true
                    : load.activeSupply ===
                        reserveSide
                : false;

        const sideIsEnergized = side =>
            side === "top"
                ? topEnergized === true
                : side === "bottom"
                    ? bottomEnergized === true
                    : false;

        const resolvedSupplySide =
            normalDeviceClosed &&
            sideIsEnergized(
                transferConfig?.normalSide
            )
                ? transferConfig.normalSide
                : reserveDeviceClosed &&
                    sideIsEnergized(reserveSide)
                    ? reserveSide
                    : null;

        const loadEnergized =
            isCmOrCcm &&
            loadAvailable &&
            resolvedSupplySide !== null;

        const activeSupplySide =
            resolvedSupplySide;

        const activeSupplyColor =
            activeSupplySide === "bottom"
                ? bottomColor
                : activeSupplySide === "top"
                    ? topColor
                    : defaultColor;

        const activeSuppliedBy =
            activeSupplySide === "bottom"
                ? bottomSuppliedBy
                : activeSupplySide === "top"
                    ? topSuppliedBy
                    : null;

        this.setEquipmentData(loadGroup, {
            id,
            type: "pca-load",
            available: loadAvailable,
            energized: loadEnergized,
            suppliedBy:
                activeSuppliedBy,
            maintenance:
                load.maintenance ??
                false
        });

        /*
         * Nos painÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©is compactos, como o P1720/R1720,
         * os DJs 20911, 20912, 20913 e 20914 ficam
         * totalmente abaixo e fora da moldura superior.
         *
         * Nos demais painÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©is, o posicionamento anterior
         * permanece preservado.
         */
        const topBreakerY =
            load.topBreakerY ??
            (
                panelHeight <= 80
                    ? topPanelBottomY + 28
                    : topBusY + 42
            );

            const loadBoxY =
            load.boxY ??
            (
                panelHeight <= 80
                    ? topBusY + 235
                    : topBusY + 330
            );

        const bottomBreakerY =
            load.bottomBreakerY ??
            bottomBusY - 78;

        const bottomBreakerX =
            load.bottomBreakerX ??
            x;

        /*
         * Permite deslocar somente a linha superior e o
         * respectivo DJ sem mover a caixa da carga.
         *
         * Exemplo no Scenario01.js:
         * topBreakerX: 1835
         */
        const topBreakerX =
            load.topBreakerX ??
            x;

        const boxX =
            x - boxWidth / 2;

        //==================================================
        // LINHA SUPERIOR
        //==================================================

        loadGroup.appendChild(
            this.line(
                topBreakerX,
                topBusY,
                topBreakerX,
                loadBoxY,
                load.topLineColor ??
                    (
                        loadAvailable
                            ? topColor
                            : this.COLORS.unavailable
                    ),
                1.55,
                {
                    className:
                        "pca-load-top-line"
                }
            )
        );

        //==================================================
        // DJ SUPERIOR
        //==================================================

        this.drawClosedBreaker(
            loadGroup,
            {
                id:
                    `${groupId}-${id}-top`,

                x:
                    topBreakerX,

                y:
                    topBreakerY,

                label:
                    load.topBreaker,

                color: topColor,

                state:
                    load.topBreakerState ??
                    (
                        loadAvailable
                            ? Breaker.STATES.CLOSED
                            : Breaker.STATES.OPEN
                    ),

                available:
                    loadAvailable,

                energized:
                    topEnergized
            }
        );

        //==================================================
        // IDENTIFICAÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢O SUPERIOR
        //==================================================

        if (load.topFeeder) {

            /*
             * Nos painÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©is compactos, como o P1720,
             * as tags 20911, 20912, 20913 e 20914
             * ficam mais prÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³ximas dos DJs pretos.
             */
            const topFeederTextY =
                load.topFeederY ??
                (
                    panelHeight <= 80
                        ? topBreakerY + 42
                        : topBusY + 165
                );

            this.drawVerticalText(
                loadGroup,
                load.topFeeder,
                load.topFeederX ??
                    topBreakerX - 28,
                topFeederTextY,
                load.topFeederColor ??
                    topColor
            );
        }

        //==================================================
        // CAIXA DA CARGA
        //==================================================

        const loadBox =
            this.rect(
                boxX,
                loadBoxY,
                boxWidth,
                boxHeight,
                loadEnergized
                    ? activeSupplyColor
                    : "#ffffff",
                load.boxStrokeColor ??
                    (
                        !loadAvailable
                            ? this.COLORS.unavailable
                            : loadEnergized
                                ? activeSupplyColor
                                : this.COLORS.border
                    ),
                loadEnergized
                    ? 2
                    : 1.5,
                {
                    className:
                        loadEnergized
                            ? "pca-load-box energized"
                            : "pca-load-box deenergized"
                }
            );

        loadBox.setAttribute(
            "fill-opacity",
            loadEnergized
                ? "0.14"
                : "1"
        );

        /*
         * O estilo direto impede que regras gerais do
         * theme.css substituam o preenchimento dinÃƒÂ¢mico
         * dos CMs e CCMs por branco.
         */
        loadBox.style.setProperty(
            "fill",
            loadEnergized
                ? activeSupplyColor
                : "#ffffff",
            "important"
        );

        loadBox.style.setProperty(
            "fill-opacity",
            loadEnergized
                ? "0.14"
                : "1",
            "important"
        );

        loadBox.style.setProperty(
            "stroke",
            !loadAvailable
                ? this.COLORS.unavailable
                : loadEnergized
                    ? activeSupplyColor
                    : this.COLORS.border,
            "important"
        );

        loadBox.setAttribute(
            "data-supplied-by",
            activeSuppliedBy ?? ""
        );

        loadGroup.appendChild(loadBox);

        const loadLabel =
            this.text(
                x,
                loadBoxY + 48,
                label,
                22,
                load.labelColor ??
                    (
                        loadAvailable
                            ? this.COLORS.text
                            : this.COLORS.unavailable
                    ),
                {
                    weight: "700",
                    className:
                        "pca-load-label"
                }
            );

        loadGroup.appendChild(loadLabel);

        //==================================================
        // SINALIZAÇÃO DE CM / CCM DEIXADO EM MANUAL
        //==================================================

        if (manualMode) {
            const manualOutline =
                this.rect(
                    boxX - 6,
                    loadBoxY - 6,
                    boxWidth + 12,
                    boxHeight + 12,
                    "none",
                    "#d4a900",
                    2.5,
                    {
                        className:
                            "pca-load-manual-outline"
                    }
                );

            manualOutline.setAttribute(
                "fill",
                "none"
            );

            manualOutline.setAttribute(
                "stroke-dasharray",
                "10 6"
            );

            manualOutline.setAttribute(
                "pointer-events",
                "none"
            );

            /*
             * Pulsação moderada do contorno para alertar que o quadro
             * permaneceu em MANUAL. O texto e a cor de energização não
             * piscam, evitando confusão com falta de tensão ou trip.
             */
            const manualBlink =
                document.createElementNS(
                    "http://www.w3.org/2000/svg",
                    "animate"
                );

            manualBlink.setAttribute(
                "attributeName",
                "stroke-opacity"
            );

            manualBlink.setAttribute(
                "values",
                "1;0.18;1"
            );

            manualBlink.setAttribute(
                "dur",
                "0.8s"
            );

            manualBlink.setAttribute(
                "repeatCount",
                "indefinite"
            );

            manualOutline.appendChild(
                manualBlink
            );

            loadGroup.appendChild(
                manualOutline
            );

            const manualLabel =
                this.text(
                    x,
                    loadBoxY + boxHeight - 7,
                    "MANUAL",
                    12,
                    "#9a7300",
                    {
                        anchor: "middle",
                        weight: "800",
                        className:
                            "pca-load-manual-label"
                    }
                );

            manualLabel.setAttribute(
                "pointer-events",
                "none"
            );

            loadGroup.appendChild(
                manualLabel
            );
        }

        //==================================================
        // DJ CENTRAL
        //==================================================

        if (load.midBreaker) {

            const midBreakerLabel =
                String(load.midBreaker ?? "");

            const isMidClosedAuto =
                ["216", "52-E1"].includes(
                    midBreakerLabel
                );

            const resolvedMidState =
                load.midBreakerClosed === true
                    ? Breaker.STATES.CLOSED_AUTO
                    : load.midBreakerClosed === false
                        ? Breaker.STATES.OPEN_AUTO
                        : load.midBreakerState ??
                (
                    isMidClosedAuto
                        ? Breaker.STATES.CLOSED_AUTO
                        : Breaker.STATES.OPEN_AUTO
                );

            const midDevice = {
                kind: "mid"
            };

            const midInteractive =
                Engine.hasPcaLoadTransferDevice?.(
                    groupId,
                    id,
                    midDevice
                ) === true;

            this.drawSwitchBox(
                loadGroup,
                {
                    id:
                        `${groupId}-${id}-mid`,

                    x,
                    y: loadBoxY - 38,

                    label:
                        load.midBreaker,

                    time:
                        load.midTime,

                    color:
                        load.midColor ??
                        this.COLORS.border,

                    state:
                        resolvedMidState,

                    /*
                     * DJs principais dos CMs/CCMs (ex.: 52-E1, 216 etc.)
                     * quando são dispositivos de transferência interativos
                     * devem usar o mesmo caminho do Breaker.draw utilizado
                     * pelos DJs reserva.
                     *
                     * O ramo visual "closedAutoQuadrant" possuía um manipulador
                     * de clique próprio e era justamente a diferença entre o
                     * comportamento do DJ principal e o DJ reserva fora do
                     * diagrama detalhado.
                     */
                    symbolType:
                        midInteractive
                            ? ""
                            : load.midBreakerClosed === true
                                ? ""
                                : load.midBreakerClosed === false
                                    ? load.midBreakerSymbolType ??
                                        "closedAutoQuadrant"
                                : isMidClosedAuto && topEnergized
                                    ? ""
                                    : load.midBreakerSymbolType ??
                                        (
                                            isMidClosedAuto
                                                ? ""
                                                : "closedAutoQuadrant"
                                        ),

                    energized:
                        isMidClosedAuto && topEnergized
                            ? true
                            : load.midBreakerEnergized ??
                                topEnergized,

                    interactive:
                        midInteractive,

                    onCommand:
                        midInteractive
                            ? command => Engine.togglePcaLoadBreaker(
                                groupId,
                                id,
                                midDevice,
                                command?.nextClosed
                            )
                            : null,

                    labelColor:
                        this.COLORS.text,

                    timeColor:
                        this.COLORS.text,

                    labelPosition:
                        "right",

                    timePosition:
                        load.midTime
                            ? "belowLabel"
                            : "right",

                    labelOffset:
                        12,

                    timeBelowLabelY:
                        24
                }
            );
        }

        //==================================================
        // CHAVES SUPERIORES
        //==================================================

        load.upperSwitches?.forEach(
            (switchData, index) => {

                const switchLabel =
                    String(switchData.label ?? "");

                const isClosedAuto =
                    [
                        "52-1B",
                        "52-1A",
                        "21101",
                        "216",
                        "218",
                        "21901",
                        "222",
                        "22301",
                        "228",
                        "236",
                        "240",
                        "244"
                    ].includes(
                        switchLabel
                    );

                const isOpenAuto =
                    [
                        "217",
                        "219",
                        "223",
                        "227",
                        "231",
                        "235",
                        "239",
                        "243",
                        "23001"
                    ].includes(
                        switchLabel
                    );

                const upperSwitchX =
                    switchData.x ??
                    x;

                const upperSwitchY =
                    switchData.y ??
                    loadBoxY - 40;

                const upperSwitchSize =
                    switchData.size ??
                    28;

                const hasVerticalLabel =
                    switchData.labelOrientation ===
                    "vertical";

                const hasCustomLabel =
                    switchData.labelX !== undefined ||
                    switchData.labelY !== undefined;

                const hideStandardLabel =
                    hasVerticalLabel ||
                    hasCustomLabel;

                const resolvedUpperState =
                    switchData.closed === true
                        ? Breaker.STATES.CLOSED_AUTO
                        : switchData.closed === false
                            ? Breaker.STATES.OPEN_AUTO
                            : switchData.state ??
                                (
                                    isClosedAuto
                                        ? Breaker.STATES.CLOSED_AUTO
                                        : Breaker.STATES.OPEN_AUTO
                                );

                const upperDevice = {
                    kind: "upper",
                    label: switchData.label
                };

                const upperIsGaeBreaker =
                    Engine.getGaeBreaker?.(
                        switchLabel
                    ) != null;

                const upperInteractive =
                    Engine.hasPcaLoadTransferDevice?.(
                        groupId,
                        id,
                        upperDevice
                    ) === true ||
                    upperIsGaeBreaker;

                this.drawSwitchBox(
                    loadGroup,
                    {
                        id:
                            `${groupId}-${id}-upper-${index}`,

                        x:
                            upperSwitchX,

                        y:
                            upperSwitchY,

                        label:
                            hideStandardLabel
                                ? ""
                                : switchData.label,

                        time:
                            switchData.time,

                        color:
                            switchData.color ??
                            this.COLORS.border,

                        size:
                            upperSwitchSize,

                        state:
                            resolvedUpperState,

                        /*
                         * Se esta chave é um dos dois dispositivos de
                         * transferência do CM/CCM, usa o Breaker.draw padrão.
                         * Assim o DJ principal e o reserva têm exatamente o
                         * mesmo mecanismo de clique fora do diagrama detalhado.
                         */
                        symbolType:
                            upperInteractive
                                ? ""
                                : isOpenAuto &&
                                  switchData.closed !== true
                                    ? ""
                                    : switchData.closed === true
                                    ? ""
                                    : switchData.closed === false
                                        ? switchData.symbolType ??
                                            "closedAutoQuadrant"
                                    : isClosedAuto && topEnergized
                                        ? ""
                                        : switchData.symbolType ??
                                            (
                                                isClosedAuto
                                                    ? ""
                                                    : isOpenAuto
                                                        ? "closedAutoQuadrant"
                                                        : ""
                                            ),

                        energized:
                            isClosedAuto && topEnergized
                                ? true
                                : switchData.energized ??
                                    topEnergized,

                        interactive:
                            upperInteractive,

                        onCommand:
                            upperInteractive
                                ? command => {
                                    if (upperIsGaeBreaker) {
                                        return Engine.toggleGaeBreaker?.(
                                            switchLabel,
                                            command?.nextClosed
                                        );
                                    }

                                    return Engine.togglePcaLoadBreaker(
                                        groupId,
                                        id,
                                        upperDevice,
                                        command?.nextClosed
                                    );
                                }
                                : null,

                        labelColor:
                            switchData.labelColor ??
                            this.COLORS.text,

                        timeColor:
                            switchData.timeColor ??
                            this.COLORS.text,

                        labelPosition:
                            switchData.labelPosition ??
                            "right",

                        timePosition:
                            switchData.timePosition ??
                            "right",

                        labelOffset:
                            switchData.labelOffset ??
                            12,

                        timeOffset:
                            switchData.timeOffset ??
                            12,

                        timeBelowLabelY:
                            switchData.timeBelowLabelY ??
                            24
                    }
                );

                if (switchData.connectToBox) {

                    loadGroup.appendChild(
                        this.line(
                            upperSwitchX,
                            upperSwitchY +
                                upperSwitchSize / 2,
                            upperSwitchX,
                            loadBoxY,
                            switchData.color ??
                                this.COLORS.border,
                            1.55,
                            {
                                className:
                                    "pca-upper-switch-to-box-line"
                            }
                        )
                    );
                }

                if (
                    hasVerticalLabel &&
                    switchData.label
                ) {

                    this.drawVerticalText(
                        loadGroup,
                        switchData.label,
                        switchData.verticalLabelX ??
                            upperSwitchX -
                                upperSwitchSize / 2 -
                                14,
                        switchData.verticalLabelY ??
                            upperSwitchY + 6,
                        switchData.labelColor ??
                            this.COLORS.text,
                        switchData.labelSize ??
                            18
                    );
                }

                if (
                    hasCustomLabel &&
                    switchData.label
                ) {

                    loadGroup.appendChild(
                        this.text(
                            switchData.labelX ??
                                upperSwitchX,
                            switchData.labelY ??
                                upperSwitchY -
                                    upperSwitchSize / 2 -
                                    8,
                            switchData.label,
                            switchData.labelSize ??
                                28,
                            switchData.labelColor ??
                                this.COLORS.text,
                            {
                                anchor:
                                    switchData.labelAnchor ??
                                    "middle",
                                weight: "600",
                                className:
                                    "pca-switchbox-label custom"
                            }
                        )
                    );
                }
            }
        );

        //==================================================
        // CHAVES INFERIORES
        //==================================================

        load.lowerSwitches?.forEach(
            (switchData, index) => {

                const switchLabel =
                    String(switchData.label ?? "");

                const isClosedAuto =
                    [
                        "218",
                        "21402",
                        "222",
                        "226",
                        "230",
                        "234",
                        "238",
                        "242",
                        "23002"
                    ].includes(
                        switchLabel
                    );

                const isOpenAuto =
                    [
                        "217",
                        "21102",
                        "21902",
                        "22302",
                        "229",
                        "237",
                        "241",
                        "245",
                        "52-E2"
                    ].includes(
                        switchLabel
                    );

                const lowerSwitchX =
                    switchData.x ??
                    x;

                const lowerSwitchY =
                    switchData.y ??
                    loadBoxY +
                        boxHeight +
                        38;

                const lowerSwitchSize =
                    switchData.size ??
                    28;

                const hasVerticalLabel =
                    switchData.labelOrientation ===
                    "vertical";

                const resolvedLowerState =
                    switchData.closed === true
                        ? Breaker.STATES.CLOSED_AUTO
                        : switchData.closed === false
                            ? Breaker.STATES.OPEN_AUTO
                            : switchData.state ??
                                (
                                    isClosedAuto
                                        ? Breaker.STATES.CLOSED_AUTO
                                        : Breaker.STATES.OPEN_AUTO
                                );

                const lowerDevice = {
                    kind: "lower",
                    label: switchData.label
                };

                const lowerIsGaeBreaker =
                    Engine.getGaeBreaker?.(
                        switchLabel
                    ) != null;

                const lowerInteractive =
                    Engine.hasPcaLoadTransferDevice?.(
                        groupId,
                        id,
                        lowerDevice
                    ) === true ||
                    lowerIsGaeBreaker;

                this.drawSwitchBox(
                    loadGroup,
                    {
                        id:
                            `${groupId}-${id}-lower-${index}`,

                        x:
                            lowerSwitchX,

                        y:
                            lowerSwitchY,

                        label:
                            hasVerticalLabel
                                ? ""
                                : switchData.label,

                        time:
                            switchData.time,

                        color:
                            switchData.color ??
                            this.COLORS.border,

                        size:
                            lowerSwitchSize,

                        state:
                            resolvedLowerState,

                        /*
                         * Mantém também os dispositivos reserva no mesmo
                         * caminho padrão do Breaker.draw.
                         */
                        symbolType:
                            lowerInteractive
                                ? ""
                                : isOpenAuto &&
                                  switchData.closed !== true
                                    ? ""
                                    : switchData.closed === true
                                    ? ""
                                    : switchData.closed === false
                                        ? switchData.symbolType ??
                                            "closedAutoQuadrant"
                                    : isClosedAuto && bottomEnergized
                                        ? ""
                                        : switchData.symbolType ??
                                            (
                                                isClosedAuto
                                                    ? ""
                                                    : isOpenAuto
                                                        ? "closedAutoQuadrant"
                                                        : ""
                                            ),

                        energized:
                            isClosedAuto && bottomEnergized
                                ? true
                                : switchData.energized ??
                                    bottomEnergized,

                        interactive:
                            lowerInteractive,

                        onCommand:
                            lowerInteractive
                                ? command => {
                                    if (lowerIsGaeBreaker) {
                                        return Engine.toggleGaeBreaker?.(
                                            switchLabel,
                                            command?.nextClosed
                                        );
                                    }

                                    return Engine.togglePcaLoadBreaker(
                                        groupId,
                                        id,
                                        lowerDevice,
                                        command?.nextClosed
                                    );
                                }
                                : null,

                        labelColor:
                            switchData.labelColor ??
                            this.COLORS.text,

                        timeColor:
                            switchData.timeColor ??
                            this.COLORS.text,

                        labelPosition:
                            switchData.labelPosition ??
                            "right",

                        timePosition:
                            switchData.timePosition ??
                            "right",

                        labelOffset:
                            switchData.labelOffset ??
                            12,

                        timeOffset:
                            switchData.timeOffset ??
                            12,

                        timeBelowLabelY:
                            switchData.timeBelowLabelY ??
                            24
                    }
                );

                if (
                    hasVerticalLabel &&
                    switchData.label
                ) {

                    this.drawVerticalText(
                        loadGroup,
                        switchData.label,
                        switchData.verticalLabelX ??
                            lowerSwitchX -
                                lowerSwitchSize / 2 -
                                14,
                        switchData.verticalLabelY ??
                            lowerSwitchY + 6,
                        switchData.labelColor ??
                            this.COLORS.text,
                        switchData.labelSize ??
                            18
                    );
                }
            }
        );

        //==================================================
        // LINHA INFERIOR
        //==================================================

        if (load.bottom !== false) {

            const bottomLineColor =
                load.bottomLineColor ??
                (
                    loadAvailable
                        ? bottomColor
                        : this.COLORS.unavailable
                );

            const firstLowerSwitch =
                load.lowerSwitches?.[0];

            const bottomLineX =
                load.bottomLineX ??
                firstLowerSwitch?.x ??
                x;

            /*
             * Quando existe DJ logo abaixo do CM/CCM,
             * a linha inferior ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â© dividida em dois trechos.
             * Assim, ela termina antes do DJ e reaparece
             * depois dele, sem atravessar o sÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­mbolo.
             */
            if (firstLowerSwitch) {

                const lowerSwitchY =
                    firstLowerSwitch.y ??
                    loadBoxY +
                        boxHeight +
                        38;

                const lowerSwitchSize =
                    firstLowerSwitch.size ??
                    28;

                const lowerSwitchTopY =
                    lowerSwitchY -
                    lowerSwitchSize / 2;

                const lowerSwitchBottomY =
                    lowerSwitchY +
                    lowerSwitchSize / 2;

                // CM/CCM ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ parte superior do DJ
                loadGroup.appendChild(
                    this.line(
                        bottomLineX,
                        loadBoxY + boxHeight,
                        bottomLineX,
                        lowerSwitchTopY,
                        bottomLineColor,
                        1.55,
                        {
                            className:
                                "pca-load-bottom-line-before-switch"
                        }
                    )
                );

                // Parte inferior do DJ ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ barramento R
                loadGroup.appendChild(
                    this.line(
                        bottomLineX,
                        lowerSwitchBottomY,
                        bottomLineX,
                        bottomBusY,
                        bottomLineColor,
                        1.55,
                        {
                            className:
                                "pca-load-bottom-line-after-switch"
                        }
                    )
                );

            } else {

                loadGroup.appendChild(
                    this.line(
                        bottomLineX,
                        loadBoxY + boxHeight,
                        bottomLineX,
                        bottomBusY,
                        bottomLineColor,
                        1.55,
                        {
                            className:
                                "pca-load-bottom-line"
                        }
                    )
                );
            }

            this.drawClosedBreaker(
                loadGroup,
                {
                    id:
                        `${groupId}-${id}-bottom`,

                    x: bottomBreakerX,
                    y: bottomBreakerY,

                    label:
                        load.bottomBreaker,

                    color:
                        bottomColor,

                    state:
                        load.bottomBreakerState ??
                        (
                            loadAvailable
                                ? Breaker.STATES.CLOSED
                                : Breaker.STATES.OPEN
                        ),

                    available:
                        loadAvailable,

                    energized:
                        bottomEnergized
                }
            );

            if (load.bottomFeeder) {

                /*
                 * Permite movimentar individualmente as tags
                 * inferiores pelo Scenario01.js, sem alterar
                 * a posiÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o dos CMs, CCMs ou dos DJs.
                 */
                const bottomFeederTextY =
                    load.bottomFeederY ??
                    bottomBusY - 150;

                this.drawVerticalText(
                    loadGroup,
                    load.bottomFeeder,
                    load.bottomFeederX ??
                        bottomBreakerX - 28,
                    bottomFeederTextY,
                    load.bottomFeederColor ??
                        bottomColor
                );
            }
        }

        //==================================================
        // TRANSFORMADOR PEQUENO
        //==================================================

        if (load.smallTransformer) {

            const transformer =
                load.smallTransformer;

            const transformerX =
                transformer.x ?? x;

            const transformerY =
                transformer.y ??
                loadBoxY - 155;

            const transformerColor =
                transformer.color ??
                defaultColor;

            this.drawTransformerSymbol(
                loadGroup,
                transformerX,
                transformerY,
                transformerColor,
                20
            );

            transformer.labels?.forEach(
                (text, index) => {

                    loadGroup.appendChild(
                        this.text(
                            transformerX + 38,
                            transformerY -
                                18 +
                                index * 24,
                            text,
                            18,
                            this.COLORS.text,
                            {
                                anchor: "start",
                                weight: "600"
                            }
                        )
                    );
                }
            );
        }

        const normalizedLoadId =
            String(id)
                .toUpperCase()
                .replace(/[^A-Z0-9]/g, "");

        const detailPanelAliases = {
            CM2: "CM-02",
            CM02: "CM-02",
            CCMU03: "CCM-U03",
            CCMU3: "CCM-U03",
            CCMU04: "CCM-U04",
            CCMU4: "CCM-U04",
            CM5: "CM-05",
            CM05: "CM-05",
            CM6: "CM-06",
            CM06: "CM-06",
            CCMU07: "CCM-U07",
            CCMU7: "CCM-U07",
            CM8: "CM-08",
            CM08: "CM-08",
            CCMU09: "CCM-U09",
            CCMU9: "CCM-U09",
            CM10: "CM-10",
            CM11: "CM-11",
            CM12: "CM-12",
            CCMU13: "CCM-U13",
            CM13: "CCM-U13",
            CM14: "CM-14",
            CM15: "CM-15",
            CM16: "CM-16",
            CM17: "CM-17",
            CM18: "CM-18",
            CM19: "CM-19",
            CCMU20: "CCM-U20",
            CM20: "CCM-U20"
        };

        const isCcmU01 =
            normalizedLoadId === "CCMU01";

        const detailPanelId =
            isCcmU01
                ? "CCM-U01"
                : detailPanelAliases[normalizedLoadId] ?? null;

        if (detailPanelId) {
            const detailHitArea = this.rect(
                boxX,
                loadBoxY,
                boxWidth,
                boxHeight,
                "transparent",
                "transparent",
                0,
                {
                    className:
                        "pca-panel-detail-hit-area"
                }
            );

            detailHitArea.setAttribute(
                "pointer-events",
                "all"
            );
            detailHitArea.style.cursor = "pointer";
            detailHitArea.style.touchAction = "none";
            detailHitArea.setAttribute(
                "aria-label",
                `Abrir diagrama ${detailPanelId}`
            );

            const highlight = active => {
                loadBox.style.setProperty(
                    "stroke-width",
                    active ? "4" :
                        (loadEnergized ? "2" : "1.5"),
                    "important"
                );
                loadBox.style.setProperty(
                    "filter",
                    active
                        ? "drop-shadow(0 0 12px rgba(0, 123, 255, 0.9))"
                        : "none",
                    "important"
                );
                loadLabel.style.setProperty(
                    "fill",
                    active ? "#0057b8" :
                        (
                            load.labelColor ??
                            (
                                loadAvailable
                                    ? this.COLORS.text
                                    : this.COLORS.unavailable
                            )
                        ),
                    "important"
                );
            };

            detailHitArea.addEventListener(
                "pointerenter",
                () => highlight(true)
            );

            detailHitArea.addEventListener(
                "pointerleave",
                () => highlight(false)
            );

            detailHitArea.addEventListener(
                "pointerdown",
                event => {
                    event.stopPropagation();
                }
            );

            detailHitArea.addEventListener(
                "click",
                event => {
                    event.preventDefault();
                    event.stopPropagation();

                    try {
                        if (isCcmU01) {
                            CcmU01View.open();
                        } else {
                            AuxPanelDetailView.open(
                                detailPanelId
                            );
                        }
                    } catch (error) {
                        console.error(
                            `[PcaPanel] Falha ao abrir o diagrama ${detailPanelId}:`,
                            error
                        );
                        window.alert(
                            `N\u00E3o foi poss\u00EDvel abrir o diagrama ${detailPanelId}.\n\n` +
                            "Verifique os arquivos AuxPanelDetailView.js e AuxPanelDetailDatabase.js."
                        );
                    }
                }
            );

            loadGroup.appendChild(detailHitArea);
        }

        group.appendChild(loadGroup);

        return loadGroup;
    }

    //==================================================
    // GERADOR PEQUENO
    //==================================================

    static drawSmallGenerator(group, data = {}) {

        const {
            id = "",
            x = 0,
            y = 0,
            color = "#3f4b53",
            radius = 45,
            label = "GD"
        } = data;

        const generator = this.group(
            `pca-generator-${id}`,
            "pca-small-generator"
        );

        generator.appendChild(
            this.circle(
                x,
                y,
                radius,
                this.COLORS.border,
                "#ffffff",
                1.8
            )
        );

        const labelLines =
            Array.isArray(label)
                ? label
                : String(label).split(" ");

        labelLines.forEach((line, index) => {

            generator.appendChild(
                this.text(
                    x,
                    y - 8 + index * 24,
                    line,
                    18,
                    this.COLORS.text,
                    {
                        weight: "700"
                    }
                )
            );
        });

        const showBreaker =
            data.showBreaker ??
            Boolean(data.breaker);

        if (showBreaker) {

            const breakerX =
                data.breakerX ?? x;

            const breakerY =
                data.breakerY ??
                y + radius + 45;

            generator.appendChild(
                this.line(
                    x,
                    y + radius,
                    breakerX,
                    breakerY - 16,
                    color,
                    1.55
                )
            );

            this.drawSwitchBox(
                generator,
                {
                    id:
                        `${id}-breaker`,

                    x: breakerX,
                    y: breakerY,

                    label:
                        data.breaker ??
                        "",

                    time:
                        data.time,

                    color,
                    size: 30,

                    labelPosition:
                        data.breakerLabelPosition ??
                        "right",

                    timePosition:
                        data.breakerTimePosition ??
                        "right",

                    labelOffset:
                        data.breakerLabelOffset ??
                        12,

                    timeOffset:
                        data.breakerTimeOffset ??
                        12,

                    timeBelowLabelY:
                        data.breakerTimeBelowLabelY ??
                        24,

                    /*
                     * DJs dos GAEs / geradores auxiliares também são
                     * comandáveis pela visão geral.
                     */
                    state:
                        data.breakerState ??
                        Breaker.STATES.OPEN_AUTO,

                    energized:
                        Breaker.isClosedState(
                            data.breakerState ??
                            Breaker.STATES.OPEN_AUTO
                        ),

                    interactive:
                        Boolean(data.breaker),

                    onCommand:
                        data.breaker
                            ? command =>
                                Engine.toggleGaeBreaker?.(
                                    data.breaker,
                                    command?.nextClosed
                                )
                            : null
                }
            );
        }

        group.appendChild(generator);

        return generator;
    }

    //==================================================
    // INTERLIGAÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢O
    //==================================================

    static drawInterlink(group, link = {}) {

        if (
            !Array.isArray(link.points) ||
            link.points.length < 2
        ) {
            return null;
        }

        const path = this.polyline(
            link.points,
            link.color ??
                this.COLORS.border,
            link.width ?? 1.55,
            {
                className:
                    "pca-interlink"
            }
        );

        if (link.id) {
            path.id =
                `pca-interlink-${link.id}`;
        }

        group.appendChild(path);

        return path;
    }

    //==================================================
    // RESERVA
    //==================================================

    static drawReserve(
        group,
        reserve = {},
        color = "#3f4b53"
    ) {

        const {
            x = 0,
            label = "Reserva",

            /*
             * Eixo do barramento superior P.
             */
            busY = reserve.busY ?? 0,

            /*
             * Descida vertical antes do DJ Reserva.
             */
            verticalDrop =
                reserve.verticalDrop ?? 16,

            /*
             * Extremidade ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âºtil direita do barramento P.
             */
            busEndX =
                reserve.busEndX ??
                reserve.fromX ??
                x - 140
        } = reserve;

        /*
         * O DJ Reserva fica um pouco abaixo do barramento,
         * com ligaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o em "L": vertical + horizontal.
         */
        const reserveY =
            busY + verticalDrop;

        /*
         * A descida vertical nasce um pouco antes da
         * extremidade do barramento, formando uma derivaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o.
         */
        const verticalX =
            busEndX -
            (reserve.verticalOffsetX ?? 28);

        const breakerCenterX =
            x + 22;

        const breakerSize =
            reserve.size ?? 30;

        const breakerLeftX =
            breakerCenterX -
            breakerSize / 2;

        //==================================================
        // LIGAÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢O EM "L" BARRAMENTO P ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ DJ RESERVA
        //==================================================

        // Trecho vertical, deslocado para a esquerda
        group.appendChild(
            this.line(
                verticalX,
                busY,
                verticalX,
                reserveY,
                color,
                1.55,
                {
                    className:
                        "pca-reserve-bus-link-vertical"
                }
            )
        );

        // Trecho horizontal atÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â© o DJ Reserva
        group.appendChild(
            this.line(
                verticalX,
                reserveY,
                breakerLeftX,
                reserveY,
                color,
                1.55,
                {
                    className:
                        "pca-reserve-bus-link-horizontal"
                }
            )
        );

        //==================================================
        // DJ RESERVA
        //==================================================

        Breaker.draw(group, {
            id:
                reserve.id ??
                `reserve-${x}-${reserveY}`,

            label: "",

            x:
                breakerCenterX,

            y:
                reserveY,

            size:
                breakerSize,

            state:
                reserve.state ??
                Breaker.STATES.OPEN,

            stroke:
                this.COLORS.border,

            textColor:
                this.COLORS.text,

            showLabel: false,

            interactive:
                reserve.interactive ??
                false
        });

        //==================================================
        // SETA
        //==================================================

        const breakerRightX =
            breakerCenterX +
            breakerSize / 2;

        const arrowStartX =
            breakerRightX + 6;

        const arrowEndX =
            arrowStartX + 34;

        const arrow = this.path(
            [
                `M ${arrowStartX} ${reserveY}`,
                `L ${arrowEndX} ${reserveY}`,
                `M ${arrowEndX - 10} ${reserveY - 8}`,
                `L ${arrowEndX} ${reserveY}`,
                `L ${arrowEndX - 10} ${reserveY + 8}`
            ].join(" "),
            this.COLORS.border,
            "none",
            1.55
        );

        group.appendChild(arrow);

        //==================================================
        // TEXTO
        //==================================================

        group.appendChild(
            this.text(
                arrowEndX + 8,
                reserveY + 6,
                label,
                18,
                this.COLORS.text,
                {
                    anchor: "start",
                    weight: "700"
                }
            )
        );
    }

    //==================================================
    // DISJUNTOR FECHADO
    //==================================================

    static drawClosedBreaker(
        group,
        {
            id = "",
            x = 0,
            y = 0,
            label = "",
            color = "#3f4b53",
            state = Breaker.STATES.CLOSED,
            available = true,
            energized = true
        }
    ) {

        const breakerColor =
            available
                ? color
                : this.COLORS.unavailable;

        Breaker.draw(group, {
            id,
            label,

            x,
            y,

            size: 30,

            state:
                state,

            closed:
                state === Breaker.STATES.CLOSED
                    ? true
                    : null,

            stroke: breakerColor,

            textColor: breakerColor,

            available,

            energized,

            showLabel:
                Boolean(label),

            labelPosition:
                "right",

            interactive: false
        });
    }

    //==================================================
    // CAIXA COM DIAGONAL
    //==================================================

    static drawSwitchBox(
        group,
        {
            id = "",
            x = 0,
            y = 0,
            label = "",
            time = "",
            color = "#3f4b53",
            size = 32,

            state =
                Breaker.STATES.OPEN_AUTO,

            energized = null,

            symbolType = "",

            labelColor = color,
            timeColor = color,

            labelPosition = "right",
            timePosition = "right",

            labelOffset = 10,
            timeOffset = 10,

            timeBelowLabelY = 24,

            interactive = false,
            onCommand = null
        }
    ) {

        /*
         * SÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­mbolo especÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­fico do DJ ligado com operaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o automÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡tica:
         * quadrado branco, X interno e apenas um quadrante preto.
         */
        if (symbolType === "closedAutoQuadrant") {

            const half = size / 2;
            const left = x - half;
            const right = x + half;
            const top = y - half;
            const bottom = y + half;

            // Corpo branco do DJ
            group.appendChild(
                this.rect(
                    left,
                    top,
                    size,
                    size,
                    "#ffffff",
                    this.COLORS.border,
                    1.6,
                    {
                        className:
                            "pca-switchbox closed-auto-quadrant"
                    }
                )
            );

            // Quadrante esquerdo preenchido em preto
            const blackQuadrant =
                document.createElementNS(
                    "http://www.w3.org/2000/svg",
                    "path"
                );

            blackQuadrant.setAttribute(
                "d",
                [
                    `M ${left} ${top}`,
                    `L ${left} ${bottom}`,
                    `L ${x} ${y}`,
                    "Z"
                ].join(" ")
            );

            blackQuadrant.setAttribute("fill", "#000000");
            blackQuadrant.setAttribute("stroke", "none");
            blackQuadrant.setAttribute(
                "class",
                "pca-switchbox-black-quadrant"
            );

            group.appendChild(blackQuadrant);

            // X interno
            group.appendChild(
                this.line(
                    left,
                    top,
                    right,
                    bottom,
                    this.COLORS.border,
                    1.6
                )
            );

            group.appendChild(
                this.line(
                    right,
                    top,
                    left,
                    bottom,
                    this.COLORS.border,
                    1.6
                )
            );

            // Tag do DJ
            if (label) {

                const labelX =
                    labelPosition === "left"
                        ? left - labelOffset
                        : right + labelOffset;

                group.appendChild(
                    this.text(
                        labelX,
                        y + 7,
                        label,
                        30,
                        labelColor,
                        {
                            anchor:
                                labelPosition === "left"
                                    ? "end"
                                    : "start",

                            weight: "600",
                            className:
                                "pca-switchbox-label"
                        }
                    )
                );
            }

            // Tempo do automatismo
            if (time) {

                const isBelowLabel =
                    timePosition === "belowLabel";

                const timeX =
                    isBelowLabel
                        ? (
                            labelPosition === "left"
                                ? left - labelOffset
                                : right + labelOffset
                        )
                        : (
                            timePosition === "left"
                                ? left - timeOffset
                                : right + timeOffset
                        );

                const timeY =
                    isBelowLabel
                        ? y + timeBelowLabelY
                        : y + 7;

                group.appendChild(
                    this.text(
                        timeX,
                        timeY,
                        time,
                        26,
                        timeColor,
                        {
                            anchor:
                                isBelowLabel
                                    ? (
                                        labelPosition === "left"
                                            ? "end"
                                            : "start"
                                    )
                                    : (
                                        timePosition === "left"
                                            ? "end"
                                            : "start"
                                    ),

                            weight: "600",
                            className:
                                "pca-switchbox-time"
                        }
                    )
                );
            }

            /*
             * Mantem o DJ ligado automatico clicavel mesmo
             * usando o simbolo especial em quatro quadrantes.
             */
            if (
                interactive &&
                typeof onCommand === "function"
            ) {

                const hitArea =
                    this.rect(
                        left - 8,
                        top - 8,
                        size + 16,
                        size + 16,
                        "transparent",
                        "transparent",
                        0,
                        {
                            className:
                                "pca-switchbox-hit-area"
                        }
                    );

                hitArea.setAttribute(
                    "pointer-events",
                    "all"
                );

                hitArea.style.cursor = "pointer";

                hitArea.addEventListener(
                    "click",
                    event => {
                        event.preventDefault();
                        event.stopPropagation();
                        /*
                         * Este ramo visual (closedAutoQuadrant) é usado
                         * quando o DJ principal está ABERTO em condição
                         * automática/manual.
                         *
                         * Não podemos decidir o próximo comando usando
                         * novamente o objeto "state", porque ele pode
                         * permanecer com um valor visual anterior durante
                         * a reconstrução do diagrama.
                         *
                         * Se este símbolo está sendo exibido, a intenção do
                         * clique é sempre FECHAR o DJ.
                         */
                        onCommand({
                            id,
                            label,
                            state:
                                Breaker.STATES.OPEN_AUTO,
                            closed:
                                false,
                            nextClosed:
                                true
                        });
                    }
                );

                group.appendChild(hitArea);
            }

            return;
        }

        const useBelowLabelTime =
            timePosition === "belowLabel";

        /*
         * MÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡scara branca atrÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡s do DJ.
         * Ela cobre a linha vertical do alimentador para que
         * o condutor pareÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§a passar por trÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡s do equipamento.
         */
        const maskMargin =
            2;

        group.appendChild(
            this.rect(
                x - size / 2 - maskMargin,
                y - size / 2 - maskMargin,
                size + maskMargin * 2,
                size + maskMargin * 2,
                "#ffffff",
                "none",
                0,
                {
                    className:
                        "pca-switchbox-line-mask"
                }
            )
        );

        Breaker.draw(group, {
            id,
            label,

            x,
            y,

            size,

            state,

            energized,

            stroke:
                this.COLORS.border,

            textColor:
                labelColor,

            showLabel:
                Boolean(label),

            labelPosition,

            labelOffset,

            time:
                useBelowLabelTime
                    ? ""
                    : time,

            timePosition,

            timeOffset,

            interactive,

            onCommand
        });

        /*
         * Posicionamento especial: o tempo fica exatamente
         * abaixo da tag do DJ, alinhado pela esquerda.
         */
        if (
            useBelowLabelTime &&
            time
        ) {

            const half =
                size / 2;

            const timeX =
                labelPosition === "left"
                    ? x - half - labelOffset
                    : x + half + labelOffset;

            const timeY =
                y + timeBelowLabelY;

            group.appendChild(
                this.text(
                    timeX,
                    timeY,
                    time,
                    22,
                    timeColor,
                    {
                        anchor:
                            labelPosition === "left"
                                ? "end"
                                : "start",
                        weight: "600",
                        className:
                            "pca-switchbox-time below-label"
                    }
                )
            );
        }
    }

    //==================================================
    // CHAVE PEQUENA
    //==================================================

    static drawSmallSwitch(
        group,
        x,
        y,
        color
    ) {

        group.appendChild(
            this.circle(
                x,
                y - 12,
                6,
                color,
                "#ffffff",
                1.5
            )
        );

        group.appendChild(
            this.circle(
                x,
                y + 12,
                6,
                color,
                "#ffffff",
                1.5
            )
        );

        group.appendChild(
            this.line(
                x,
                y - 6,
                x,
                y + 6,
                color,
                1.5
            )
        );
    }

    //==================================================
    // TRANSFORMADOR PEQUENO
    //==================================================

    static drawTransformerSymbol(
        group,
        x,
        y,
        color,
        radius = 28
    ) {

        group.appendChild(
            this.circle(
                x,
                y,
                radius,
                color,
                "none",
                1.8
            )
        );

        group.appendChild(
            this.circle(
                x,
                y + radius * 1.65,
                radius,
                color,
                "none",
                1.8
            )
        );
    }

    //==================================================
    // TEXTO VERTICAL
    //==================================================

    static drawVerticalText(
        group,
        content,
        x,
        y,
        color,
        size = 24
    ) {

        group.appendChild(
            this.text(
                x,
                y,
                content,
                size,
                color,
                {
                    weight: "700",

                    transform:
                        `rotate(-90 ${x} ${y})`
                }
            )
        );
    }

    //==================================================
    // MODELO ANTIGO
    //==================================================

    static drawSinglePanelLegacy(
        layer,
        data = {}
    ) {

        const converted = {
            id: data.id,
            type: "pcaGroup",

            x: data.x,
            y: data.y,

            width:
                data.width ??
                1450,

            panelHeight:
                data.height ??
                110,

            gap:
                data.gap ??
                650,

            topPanel: {
                label:
                    data.label ??
                    data.id,

                color:
                    data.color ??
                    "#3f7cff"
            },

            bottomPanel: {
                label:
                    data.bottomLabel ??
                    `${data.label ?? data.id}-R`,

                color:
                    data.bottomColor ??
                    data.color ??
                    "#44dd55"
            },

            topIncoming:
                data.incoming,

            loads:
                data.loads ??
                data.feeders ??
                []
        };

        return this.drawGroup(
            layer,
            converted
        );
    }

    //==================================================
    // PONTOS DE CONEXÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢O
    //==================================================

    static getPorts(data = {}) {

        const {
            x = 0,
            y = 0,
            width = 1500,
            panelHeight = 110,
            gap = 650
        } = data;

        return {
            topBus: {
                x:
                    x +
                    width / 2,

                y:
                    y +
                    panelHeight / 2
            },

            bottomBus: {
                x:
                    x +
                    width / 2,

                y:
                    y +
                    gap +
                    panelHeight / 2
            },

            topIncoming: {
                x:
                    data.topIncoming?.x ??
                    x + width / 2,

                y
            },

            bottomIncoming: {
                x:
                    data.bottomIncoming?.x ??
                    x + width / 2,

                y:
                    y +
                    gap +
                    panelHeight
            }
        };
    }

    //==================================================
    // SELETOR MANUAL / AUTO
    //==================================================

    static drawModeButton(group, data, x, y, options = {}) {

        const id = options.id ?? data.id ?? "pca";
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
            "#ffffff", "#66727a", 1.6
        );

        const label = this.text(
            x + width / 2,
            y + height / 2 + 7,
            data.operationMode,
            19,
            "#263238",
            { weight: "700" }
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
