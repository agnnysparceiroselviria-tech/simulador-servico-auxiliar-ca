import { Equipment } from "./Equipment.js";

export class GroundSwitch extends Equipment {

    static draw(layer, data = {}) {

        if (!layer) {
            console.warn("[GroundSwitch] Camada SVG não informada.");
            return null;
        }

        const {
            id = "",
            tag = "",

            x = 0,
            y = 0,

            color = "#3f4b53",
            strokeWidth = 1.6,

            closed = false,
            grounded = false,

            energized = true,
            available = true,

            showTag = true
        } = data;

        const visualColor =
            available
                ? color
                : "#7a858d";

        const group = this.group(
            id ? `ground-switch-${id}` : "",
            "ground-switch"
        );

        this.setEquipmentData(group, {
            id,
            type: "ground-switch",
            energized,
            available,
            state:
                grounded
                    ? "grounded"
                    : closed
                        ? "closed"
                        : "open"
        });

        group.dataset.closed =
            closed ? "true" : "false";

        group.dataset.grounded =
            grounded ? "true" : "false";

        //==================================================
        // CONDUTOR VERTICAL
        //==================================================

        group.appendChild(
            this.line(
                x,
                y - 34,
                x,
                y + 34,
                visualColor,
                strokeWidth,
                {
                    className:
                        "ground-switch-main-line"
                }
            )
        );

        //==================================================
        // NÓ DE DERIVAÇÃO
        //==================================================

        group.appendChild(
            this.circle(
                x,
                y,
                3.5,
                visualColor,
                visualColor,
                1,
                {
                    className:
                        "ground-switch-node"
                }
            )
        );

        group.appendChild(
            this.line(
                x,
                y,
                x + 18,
                y,
                visualColor,
                strokeWidth,
                {
                    className:
                        "ground-switch-branch"
                }
            )
        );

        //==================================================
        // CONTATOS DA FACA
        //==================================================

        const contact1X = x + 20;
        const contact2X = x + 56;

        group.appendChild(
            this.circle(
                contact1X,
                y,
                6,
                visualColor,
                "#ffffff",
                strokeWidth,
                {
                    className:
                        "ground-switch-contact"
                }
            )
        );

        group.appendChild(
            this.circle(
                contact2X,
                y,
                6,
                visualColor,
                "#ffffff",
                strokeWidth,
                {
                    className:
                        "ground-switch-contact"
                }
            )
        );

        //==================================================
        // LÂMINA
        //==================================================

        const isClosed =
            closed || grounded;

        const blade = isClosed
            ? this.line(
                contact1X + 6,
                y,
                contact2X - 6,
                y,
                visualColor,
                strokeWidth,
                {
                    className:
                        "ground-switch-blade closed",
                    linecap: "round"
                }
            )
            : this.line(
                contact1X + 6,
                y - 13,
                contact2X - 6,
                y - 1,
                visualColor,
                strokeWidth,
                {
                    className:
                        "ground-switch-blade open",
                    linecap: "round"
                }
            );

        group.appendChild(blade);

        //==================================================
        // LIGAÇÃO AO ATERRAMENTO
        //==================================================

        group.appendChild(
            this.line(
                contact2X + 6,
                y,
                x + 82,
                y,
                visualColor,
                strokeWidth,
                {
                    className:
                        "ground-switch-ground-lead"
                }
            )
        );

        //==================================================
        // SÍMBOLO DE TERRA
        //==================================================

        const groundX = x + 90;

        group.appendChild(
            this.line(
                groundX,
                y - 16,
                groundX,
                y + 16,
                visualColor,
                strokeWidth,
                {
                    className:
                        "ground-switch-ground-bar"
                }
            )
        );

        group.appendChild(
            this.line(
                groundX + 13,
                y - 11,
                groundX + 13,
                y + 11,
                visualColor,
                1.4,
                {
                    className:
                        "ground-switch-ground-bar"
                }
            )
        );

        group.appendChild(
            this.line(
                groundX + 24,
                y - 6,
                groundX + 24,
                y + 6,
                visualColor,
                1.2,
                {
                    className:
                        "ground-switch-ground-bar"
                }
            )
        );

        //==================================================
        // TAG
        //==================================================

        if (showTag && tag) {

            group.appendChild(
                this.text(
                    data.tagX ?? x + 8,
                    data.tagY ?? y + 44,
                    tag,
                    data.tagSize ?? 24,
                    data.tagColor ?? "#263238",
                    {
                        anchor: "start",
                        weight: "600",
                        className:
                            "ground-switch-tag"
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
            y = 0
        } = data;

        return {
            top: {
                x,
                y: y - 34
            },

            bottom: {
                x,
                y: y + 34
            },

            ground: {
                x: x + 114,
                y
            },

            center: {
                x,
                y
            }
        };
    }

}