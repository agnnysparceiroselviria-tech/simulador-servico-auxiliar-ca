import { Equipment } from "./Equipment.js";
import { Breaker } from "./Breaker.js";

export class Busbar extends Equipment {

    static draw(layer, data = {}) {

        if (!layer) {
            console.warn("[Busbar] Camada SVG não informada.");
            return null;
        }

        const {
            id = "",

            x = 0,
            y = 0,

            color = "#3f7cff",
            strokeWidth = 2.1,

            segment = 700,
            gap = 260,

            dj1 = "",
            dj2 = "",

            energized = true,
            available = true
        } = data;

        const visualColor =
            available
                ? color
                : "#7a858d";

        const group = this.group(
            id ? `busbar-${id}` : "",
            "busbar"
        );

        this.setEquipmentData(group, {
            id,
            type: "busbar",
            energized,
            available,
            state:
                energized
                    ? "energized"
                    : "deenergized"
        });

        const firstSectionStartX = x;
        const firstSectionEndX =
            x + segment;

        const firstBreakerX =
            firstSectionEndX +
            gap / 2;

        const secondSectionStartX =
            firstSectionEndX +
            gap;

        const secondSectionEndX =
            secondSectionStartX +
            segment;

        const secondBreakerX =
            secondSectionEndX +
            gap / 2;

        const thirdSectionStartX =
            secondSectionEndX +
            gap;

        const thirdSectionEndX =
            thirdSectionStartX +
            segment;

        //==================================================
        // BARRA ESQUERDA
        //==================================================

        group.appendChild(
            this.line(
                firstSectionStartX,
                y,
                firstSectionEndX,
                y,
                visualColor,
                strokeWidth,
                {
                    className:
                        "busbar-section busbar-section-left"
                }
            )
        );

        //==================================================
        // PRIMEIRO DJ — 101 / 103
        //==================================================

        if (dj1) {

            Breaker.draw(group, {
                id: dj1,
                label: dj1,

                x: firstBreakerX,
                y,

                size:
                    data.breakerSize ?? 38,

                state:
                    data.dj1State ??
                    Breaker.STATES.OPEN_AUTO,

                closed:
                    data.dj1Closed,

                stroke:
                    data.dj1Color ??
                    "#3f4b53",

                textColor:
                    data.dj1TextColor ??
                    "#263238",

                labelPosition:
                    data.dj1LabelPosition ??
                    "top",

                labelOffset:
                    data.dj1LabelOffset ??
                    10,

                showLabel:
                    data.showBreakerLabels ??
                    true,

                time:
                    data.dj1Time ?? "",

                timePosition:
                    data.dj1TimePosition ??
                    "bottom",

                energized:
                    data.dj1Energized ??
                    false,

                available:
                    data.dj1Available ??
                    true,

                interactive:
                    data.interactive ??
                    true
            });
        }

        //==================================================
        // BARRA CENTRAL
        //==================================================

        group.appendChild(
            this.line(
                secondSectionStartX,
                y,
                secondSectionEndX,
                y,
                visualColor,
                strokeWidth,
                {
                    className:
                        "busbar-section busbar-section-center"
                }
            )
        );

        //==================================================
        // SEGUNDO DJ — 102 / 104
        //==================================================

        if (dj2) {

            Breaker.draw(group, {
                id: dj2,
                label: dj2,

                x: secondBreakerX,
                y,

                size:
                    data.breakerSize ?? 38,

                state:
                    data.dj2State ??
                    Breaker.STATES.OPEN_AUTO,

                closed:
                    data.dj2Closed,

                stroke:
                    data.dj2Color ??
                    "#3f4b53",

                textColor:
                    data.dj2TextColor ??
                    "#263238",

                labelPosition:
                    data.dj2LabelPosition ??
                    "top",

                labelOffset:
                    data.dj2LabelOffset ??
                    10,

                showLabel:
                    data.showBreakerLabels ??
                    true,

                time:
                    data.dj2Time ?? "",

                timePosition:
                    data.dj2TimePosition ??
                    "bottom",

                energized:
                    data.dj2Energized ??
                    false,

                available:
                    data.dj2Available ??
                    true,

                interactive:
                    data.interactive ??
                    true
            });
        }

        //==================================================
        // BARRA DIREITA
        //==================================================

        group.appendChild(
            this.line(
                thirdSectionStartX,
                y,
                thirdSectionEndX,
                y,
                visualColor,
                strokeWidth,
                {
                    className:
                        "busbar-section busbar-section-right"
                }
            )
        );

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
            segment = 700,
            gap = 260
        } = data;

        return {
            left: {
                x,
                y
            },

            section1End: {
                x: x + segment,
                y
            },

            breaker1: {
                x:
                    x +
                    segment +
                    gap / 2,
                y
            },

            center: {
                x:
                    x +
                    segment +
                    gap +
                    segment / 2,
                y
            },

            breaker2: {
                x:
                    x +
                    segment * 2 +
                    gap +
                    gap / 2,
                y
            },

            right: {
                x:
                    x +
                    segment * 3 +
                    gap * 2,
                y
            }
        };
    }

}