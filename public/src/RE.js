import { Equipment } from "./Equipment.js";

export class RE extends Equipment {

    static draw(layer, data = {}) {

        if (!layer) {
            console.warn("[RE] Camada SVG não informada.");
            return null;
        }

        const {
            id = "",
            label = id,

            x = 0,
            y = 0,

            color = "#2f6cff",

            coilRadius = 34,
            turns = 4,
            step = 34,
            strokeWidth = 1.8,

            topLead = 95,
            bottomLead = 95,

            energized = true,
            available = true,

            showLabel = true
        } = data;

        const visualColor =
            available
                ? color
                : "#7a858d";

        const group = this.group(
            id ? `reactor-${id}` : "",
            "reactor"
        );

        this.setEquipmentData(group, {
            id,
            type: "reactor",
            energized,
            available,
            state:
                available
                    ? "available"
                    : "unavailable"
        });

        const coilStartY =
            y - 5;

        const coilEndY =
            coilStartY +
            turns * step;

        //==================================================
        // LINHA SUPERIOR
        //==================================================

        group.appendChild(
            this.line(
                x,
                y - topLead,
                x,
                coilStartY,
                visualColor,
                strokeWidth,
                {
                    className:
                        "reactor-top-lead"
                }
            )
        );

        //==================================================
        // BOBINA
        //==================================================

        for (let i = 0; i < turns; i++) {

            const startY =
                coilStartY +
                i * step;

            const endY =
                startY + step;

            const pathData = [
                `M ${x} ${startY}`,
                `C ${x + coilRadius} ${startY}`,
                `${x + coilRadius} ${endY}`,
                `${x} ${endY}`
            ].join(" ");

            const coil = this.path(
                pathData,
                visualColor,
                "none",
                strokeWidth,
                {
                    linecap: "round",
                    linejoin: "round",
                    className:
                        "reactor-coil"
                }
            );

            group.appendChild(coil);
        }

        //==================================================
        // LINHA INFERIOR
        //==================================================

        group.appendChild(
            this.line(
                x,
                coilEndY,
                x,
                coilEndY + bottomLead,
                visualColor,
                strokeWidth,
                {
                    className:
                        "reactor-bottom-lead"
                }
            )
        );

        //==================================================
        // IDENTIFICAÇÃO
        //==================================================

        if (showLabel && label) {

            group.appendChild(
                this.text(
                    data.labelX ??
                        x + 105,

                    data.labelY ??
                        y + 100,

                    label,

                    data.labelSize ??
                        42,

                    data.labelColor ??
                        visualColor,

                    {
                        anchor: "start",
                        baseline: "middle",
                        weight: "500",
                        className:
                            "reactor-label"
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

            turns = 4,
            step = 34,

            topLead = 95,
            bottomLead = 95
        } = data;

        const coilStartY =
            y - 5;

        const coilEndY =
            coilStartY +
            turns * step;

        return {
            top: {
                x,
                y: y - topLead
            },

            coilTop: {
                x,
                y: coilStartY
            },

            coilBottom: {
                x,
                y: coilEndY
            },

            bottom: {
                x,
                y:
                    coilEndY +
                    bottomLead
            }
        };
    }

}