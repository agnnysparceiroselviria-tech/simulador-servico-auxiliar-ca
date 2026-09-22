import { Equipment } from "./Equipment.js";
import { Breaker } from "./Breaker.js";

export class DistributionPanel extends Equipment {

    static draw(layer, data = {}) {

        if (!layer) {
            console.warn(
                "[DistributionPanel] Camada SVG não informada."
            );
            return null;
        }

        const {
            id = "",
            label = id,
            tag = "",

            x = 0,
            y = 0,

            width = 180,
            height = 70,

            color = "#3f4b53",
            busColor = "#ffd54a",

            energized = true,
            available = true,

            breaker = "",
            breakerState = Breaker.STATES.CLOSED,
            closed = true,

            showBorder = true,
            showBreaker = true,
            interactive = false
        } = data;

        const visualColor =
            available
                ? color
                : "#7a858d";

        const group = this.group(
            id
                ? `distribution-panel-${id}`
                : "",
            "distribution-panel"
        );

        this.setEquipmentData(group, {
            id,
            type: "distribution-panel",
            energized,
            available,
            state:
                energized
                    ? "energized"
                    : "deenergized"
        });

        const centerX =
            x + width / 2;

        const busY =
            y + 42;

        //====================================
        // ENTRADA SUPERIOR
        //====================================

        group.appendChild(
            this.line(
                centerX,
                y - 28,
                centerX,
                y,
                visualColor,
                data.lineWidth ?? 1.55,
                {
                    className:
                        "distribution-panel-input"
                }
            )
        );

        //====================================
        // MOLDURA
        //====================================

        if (showBorder) {

            group.appendChild(
                this.rect(
                    x,
                    y,
                    width,
                    height,
                    "#ffffff",
                    data.borderColor ??
                        "#3f4b53",
                    data.borderWidth ?? 1.5,
                    {
                        className:
                            "distribution-panel-border"
                    }
                )
            );
        }

        //====================================
        // BARRAMENTO
        //====================================

        group.appendChild(
            this.line(
                x + 18,
                busY,
                x + width - 18,
                busY,
                busColor,
                data.busWidth ?? 2.1,
                {
                    className:
                        "distribution-panel-bus"
                }
            )
        );

        //====================================
        // DISJUNTOR
        //====================================

        if (showBreaker) {

            Breaker.draw(group, {
                id:
                    id
                        ? `${id}-breaker`
                        : "",

                label: breaker,

                x: centerX,
                y: busY,

                size:
                    data.breakerSize ?? 26,

                state: breakerState,
                closed,

                stroke:
                    data.breakerColor ??
                    "#3f4b53",

                textColor:
                    data.breakerTextColor ??
                    "#263238",

                strokeWidth:
                    data.breakerStrokeWidth ??
                    1.4,

                showLabel: false,

                energized,
                available,
                interactive
            });
        }

        //====================================
        // NÚMERO DO DJ
        //====================================

        if (breaker) {

            group.appendChild(
                this.text(
                    centerX,
                    y + 18,
                    breaker,
                    data.breakerLabelSize ?? 15,
                    data.breakerLabelColor ??
                        "#263238",
                    {
                        anchor: "middle",
                        weight: "700",
                        className:
                            "distribution-panel-breaker-label"
                    }
                )
            );
        }

        //====================================
        // NOME DO PAINEL
        //====================================

        if (label) {

            group.appendChild(
                this.text(
                    x + 8,
                    y + height - 8,
                    label,
                    data.labelSize ?? 15,
                    data.labelColor ??
                        "#263238",
                    {
                        anchor: "start",
                        weight: "600",
                        className:
                            "distribution-panel-label"
                    }
                )
            );
        }

        //====================================
        // TAG
        //====================================

        if (tag) {

            group.appendChild(
                this.text(
                    x + width - 8,
                    y + height - 8,
                    tag,
                    data.tagSize ?? 13,
                    data.tagColor ??
                        "#263238",
                    {
                        anchor: "end",
                        weight: "500",
                        className:
                            "distribution-panel-tag"
                    }
                )
            );
        }

        //====================================
        // SAÍDA INFERIOR
        //====================================

        group.appendChild(
            this.line(
                centerX,
                y + height,
                centerX,
                y + height + 28,
                visualColor,
                data.lineWidth ?? 1.55,
                {
                    className:
                        "distribution-panel-output"
                }
            )
        );

        layer.appendChild(group);

        return group;
    }

    //====================================
    // PONTOS DE CONEXÃO
    //====================================

    static getPorts(data = {}) {

        const {
            x = 0,
            y = 0,
            width = 180,
            height = 70
        } = data;

        const centerX =
            x + width / 2;

        return {
            top: {
                x: centerX,
                y: y - 28
            },

            input: {
                x: centerX,
                y
            },

            bus: {
                x: centerX,
                y: y + 42
            },

            center: {
                x: centerX,
                y: y + height / 2
            },

            output: {
                x: centerX,
                y: y + height
            },

            bottom: {
                x: centerX,
                y: y + height + 28
            }
        };
    }
}