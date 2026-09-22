import { Equipment } from "./Equipment.js";

export class Wire extends Equipment {

    static draw(
        layer,
        x1,
        y1,
        x2,
        y2,
        color = "#7a858d",
        width = 1.55,
        options = {}
    ) {

        if (!layer) {
            console.warn("[Wire] Camada SVG não informada.");
            return null;
        }

        const {
            id = "",
            className = "electrical-wire",
            energized = false,
            dashed = false,
            opacity = 1,
            source = "",
            target = "",

            linecap = "square",
            linejoin = "miter",

            dasharray = "18 12"
        } = options;

        const group = this.group(
            id ? `wire-${id}` : "",
            "wire-group"
        );

        const wire = this.line(
            x1,
            y1,
            x2,
            y2,
            color,
            width,
            {
                className,
                opacity,
                linecap,
                linejoin,
                dasharray:
                    dashed
                        ? dasharray
                        : ""
            }
        );

        if (id) {
            wire.id = `wire-line-${id}`;
        }

        group.dataset.energized =
            energized
                ? "true"
                : "false";

        if (source) {
            group.dataset.source = source;
        }

        if (target) {
            group.dataset.target = target;
        }

        if (energized) {
            wire.classList.add("energized");
        }

        group.appendChild(wire);
        layer.appendChild(group);

        return group;
    }

}