const SVG_NS = "http://www.w3.org/2000/svg";

export class Equipment {

    static COLORS = {
        text: "#263238",
        border: "#3f4b53",
        background: "#ffffff"
    };

    static STROKES = {
        line: 1.55,
        equipment: 1.8,
        border: 1.5,
        bus: 2.1
    };

    //==================================================
    // CRIAÇÃO DE ELEMENTOS SVG
    //==================================================

    static create(type) {

        return document.createElementNS(
            SVG_NS,
            type
        );
    }

    //==================================================
    // APLICAÇÃO SEGURA DE CLASSES
    //==================================================

    static addClasses(
        element,
        className = ""
    ) {

        if (!element || !className) {
            return element;
        }

        String(className)
            .split(/\s+/)
            .filter(Boolean)
            .forEach(name => {
                element.classList.add(name);
            });

        return element;
    }

    //==================================================
    // ATRIBUTOS OPCIONAIS
    //==================================================

    static applyCommonOptions(
        element,
        options = {}
    ) {

        if (!element) return element;

        if (options.opacity !== undefined) {
            element.setAttribute(
                "opacity",
                options.opacity
            );
        }

        if (options.pointerEvents) {
            element.setAttribute(
                "pointer-events",
                options.pointerEvents
            );
        }

        if (options.dasharray) {
            element.setAttribute(
                "stroke-dasharray",
                options.dasharray
            );
        }

        if (options.transform) {
            element.setAttribute(
                "transform",
                options.transform
            );
        }

        if (options.id) {
            element.id = options.id;
        }

        this.addClasses(
            element,
            options.className
        );

        return element;
    }

    //==================================================
    // GRUPO SVG
    //==================================================

    static group(
        id = "",
        className = ""
    ) {

        const group = this.create("g");

        if (id) {
            group.id = id;
        }

        this.addClasses(
            group,
            className
        );

        return group;
    }

    //==================================================
    // LINHA
    //==================================================

    static line(
        x1,
        y1,
        x2,
        y2,
        color = this.COLORS.border,
        width = this.STROKES.line,
        options = {}
    ) {

        const line = this.create("line");

        line.setAttribute("x1", x1);
        line.setAttribute("y1", y1);
        line.setAttribute("x2", x2);
        line.setAttribute("y2", y2);

        line.setAttribute(
            "stroke",
            color
        );

        line.setAttribute(
            "stroke-width",
            width
        );

        line.setAttribute(
            "stroke-linecap",
            options.linecap ?? "square"
        );

        line.setAttribute(
            "stroke-linejoin",
            options.linejoin ?? "miter"
        );

        this.applyCommonOptions(
            line,
            options
        );

        return line;
    }

    //==================================================
    // CÍRCULO
    //==================================================

    static circle(
        x,
        y,
        radius,
        stroke = this.COLORS.border,
        fill = "none",
        width = this.STROKES.equipment,
        options = {}
    ) {

        const circle = this.create("circle");

        circle.setAttribute("cx", x);
        circle.setAttribute("cy", y);
        circle.setAttribute("r", radius);

        circle.setAttribute(
            "fill",
            fill
        );

        circle.setAttribute(
            "stroke",
            stroke
        );

        circle.setAttribute(
            "stroke-width",
            width
        );

        this.applyCommonOptions(
            circle,
            options
        );

        return circle;
    }

    //==================================================
    // RETÂNGULO
    //==================================================

    static rect(
        x,
        y,
        width,
        height,
        fill = "none",
        stroke = this.COLORS.border,
        strokeWidth = this.STROKES.border,
        options = {}
    ) {

        const rect = this.create("rect");

        rect.setAttribute("x", x);
        rect.setAttribute("y", y);
        rect.setAttribute("width", width);
        rect.setAttribute("height", height);

        rect.setAttribute(
            "fill",
            fill
        );

        rect.setAttribute(
            "stroke",
            stroke
        );

        rect.setAttribute(
            "stroke-width",
            strokeWidth
        );

        if (options.rx !== undefined) {
            rect.setAttribute(
                "rx",
                options.rx
            );
        }

        if (options.ry !== undefined) {
            rect.setAttribute(
                "ry",
                options.ry
            );
        }

        this.applyCommonOptions(
            rect,
            options
        );

        return rect;
    }

    //==================================================
    // TEXTO
    //==================================================

    static text(
        x,
        y,
        value,
        size = 22,
        color = this.COLORS.text,
        options = {}
    ) {

        const text = this.create("text");

        text.setAttribute("x", x);
        text.setAttribute("y", y);

        text.setAttribute(
            "text-anchor",
            options.anchor ?? "middle"
        );

        text.setAttribute(
            "dominant-baseline",
            options.baseline ?? "auto"
        );

        text.setAttribute(
            "font-family",
            options.fontFamily ??
                "Segoe UI, Arial, sans-serif"
        );

        text.setAttribute(
            "font-size",
            size
        );

        text.setAttribute(
            "fill",
            color
        );

        if (options.weight) {

            text.setAttribute(
                "font-weight",
                options.weight
            );
        }

        if (options.style) {

            text.setAttribute(
                "font-style",
                options.style
            );
        }

        if (options.letterSpacing) {

            text.setAttribute(
                "letter-spacing",
                options.letterSpacing
            );
        }

        this.applyCommonOptions(
            text,
            options
        );

        text.textContent =
            value ?? "";

        return text;
    }

    //==================================================
    // POLILINHA
    //==================================================

    static polyline(
        points = [],
        color = this.COLORS.border,
        width = this.STROKES.line,
        options = {}
    ) {

        const polyline =
            this.create("polyline");

        const formattedPoints =
            points
                .map(
                    point =>
                        `${point.x},${point.y}`
                )
                .join(" ");

        polyline.setAttribute(
            "points",
            formattedPoints
        );

        polyline.setAttribute(
            "fill",
            options.fill ?? "none"
        );

        polyline.setAttribute(
            "stroke",
            color
        );

        polyline.setAttribute(
            "stroke-width",
            width
        );

        polyline.setAttribute(
            "stroke-linecap",
            options.linecap ?? "square"
        );

        polyline.setAttribute(
            "stroke-linejoin",
            options.linejoin ?? "miter"
        );

        this.applyCommonOptions(
            polyline,
            options
        );

        return polyline;
    }

    //==================================================
    // CAMINHO SVG
    //==================================================

    static path(
        d,
        stroke = this.COLORS.border,
        fill = "none",
        width = this.STROKES.line,
        options = {}
    ) {

        const path =
            this.create("path");

        path.setAttribute(
            "d",
            d
        );

        path.setAttribute(
            "stroke",
            stroke
        );

        path.setAttribute(
            "fill",
            fill
        );

        path.setAttribute(
            "stroke-width",
            width
        );

        path.setAttribute(
            "stroke-linecap",
            options.linecap ?? "square"
        );

        path.setAttribute(
            "stroke-linejoin",
            options.linejoin ?? "miter"
        );

        this.applyCommonOptions(
            path,
            options
        );

        return path;
    }

    //==================================================
    // METADADOS DO EQUIPAMENTO
    //==================================================

    static setEquipmentData(
        element,
        {
            id = "",
            type = "",
            source = "",
            target = "",
            energized = false,
            state = "",
            available = true
        } = {}
    ) {

        if (!element) return element;

        if (id) {
            element.dataset.equipmentId = id;
        }

        if (type) {
            element.dataset.equipmentType = type;
        }

        if (source) {
            element.dataset.source = source;
        }

        if (target) {
            element.dataset.target = target;
        }

        element.dataset.energized =
            energized
                ? "true"
                : "false";

        element.dataset.available =
            available
                ? "true"
                : "false";

        if (state) {
            element.dataset.state = state;
        }

        return element;
    }
}