import { Equipment } from "./Equipment.js";

export class Transformer extends Equipment {

    static draw(layer, data = {}) {

        if (!layer) {
            console.warn("[Transformer] Camada SVG não informada.");
            return null;
        }

        const {
            id = "",
            label = id,

            x = 0,
            y = 0,

            color = "#2f6cff",

            radius = 54,
            coilGap = 86,
            strokeWidth = 1.8,

            topLead = 120,
            bottomLead = 120,

            power = "7,5 MVA",
            voltage = "14,4 / 14,4 / 416 V",

            energized = true,
            available = true,

            showLabel = true,
            showPower = true,
            showVoltage = true
        } = data;

        const visualColor =
            available
                ? color
                : "#7a858d";

        const group = this.group(
            id ? `transformer-${id}` : "",
            "transformer"
        );

        this.setEquipmentData(group, {
            id,
            type: "transformer",
            energized,
            available,
            state:
                available
                    ? "available"
                    : "unavailable"
        });

        const primaryY = y;
        const secondaryY = y + coilGap;

        const topConnectionY =
            primaryY - topLead;

        const topCircleY =
            primaryY - radius;

        const bottomCircleY =
            secondaryY + radius;

        const bottomConnectionY =
            secondaryY + bottomLead;

        //==================================================
        // LINHA SUPERIOR
        //==================================================

        group.appendChild(
            this.line(
                x,
                topConnectionY,
                x,
                topCircleY,
                visualColor,
                strokeWidth,
                {
                    className:
                        "transformer-top-lead"
                }
            )
        );

        //==================================================
        // ENROLAMENTO PRIMÁRIO
        //==================================================

        group.appendChild(
            this.circle(
                x,
                primaryY,
                radius,
                visualColor,
                "none",
                strokeWidth,
                {
                    className:
                        "transformer-primary"
                }
            )
        );

        //==================================================
        // ENROLAMENTO SECUNDÁRIO
        //==================================================

        group.appendChild(
            this.circle(
                x,
                secondaryY,
                radius,
                visualColor,
                "none",
                strokeWidth,
                {
                    className:
                        "transformer-secondary"
                }
            )
        );

        //==================================================
        // LINHA INFERIOR
        //==================================================

        group.appendChild(
            this.line(
                x,
                bottomCircleY,
                x,
                bottomConnectionY,
                visualColor,
                strokeWidth,
                {
                    className:
                        "transformer-bottom-lead"
                }
            )
        );

        //==================================================
        // TEXTOS
        //==================================================

        const textX =
            data.textX ??
            x + 125;

        if (showLabel && label) {

            group.appendChild(
                this.text(
                    textX,
                    y + 4,
                    label,
                    data.labelSize ?? 42,
                    visualColor,
                    {
                        anchor: "start",
                        weight: "600",
                        className:
                            "transformer-label"
                    }
                )
            );
        }

        if (showPower && power) {

            group.appendChild(
                this.text(
                    textX,
                    y + 54,
                    power,
                    data.powerSize ?? 34,
                    data.powerColor ??
                        "#263238",
                    {
                        anchor: "start",
                        weight: "500",
                        className:
                            "transformer-power"
                    }
                )
            );
        }

        if (showVoltage && voltage) {

            group.appendChild(
                this.text(
                    textX,
                    y + 98,
                    voltage,
                    data.voltageSize ?? 32,
                    data.voltageColor ??
                        "#263238",
                    {
                        anchor: "start",
                        weight: "500",
                        className:
                            "transformer-voltage"
                    }
                )
            );
        }

        layer.appendChild(group);

        return group;
    }

    //==================================================
    // PONTOS DE CONEXÃO
    //==================================================

    static getPorts(data = {}) {

        const {
            x = 0,
            y = 0,
            coilGap = 86,
            topLead = 120,
            bottomLead = 120
        } = data;

        const secondaryY =
            y + coilGap;

        return {
            top: {
                x,
                y: y - topLead
            },

            primary: {
                x,
                y
            },

            secondary: {
                x,
                y: secondaryY
            },

            bottom: {
                x,
                y:
                    secondaryY +
                    bottomLead
            },

            center: {
                x,
                y:
                    y +
                    coilGap / 2
            }
        };
    }

}