const SVG_NS = "http://www.w3.org/2000/svg";

export class DiagramHover {

    static svg = null;
    static overlay = null;
    static tag = null;
    static body = null;
    static lines = [];
    static currentTarget = null;

    static pointerMoveHandler = null;
    static pointerLeaveHandler = null;
    static pointerDownHandler = null;
    static clickHandler = null;

    //==================================================
    // INICIALIZAÇÃO
    //==================================================

    static initialize(svg) {

        if (!svg) {
            console.warn("[DiagramHover] SVG não informado.");
            return false;
        }

        this.destroy();

        this.svg = svg;

        this.overlay =
            svg.querySelector("#effects");

        if (!this.overlay) {

            this.overlay =
                document.createElementNS(
                    SVG_NS,
                    "g"
                );

            this.overlay.id =
                "effects";

            svg.appendChild(
                this.overlay
            );
        }

        this.createTag();

        /*
         * Os textos do diagrama usam pointer-events:none no CSS.
         * Para o nome dos quadros receber hover, liberamos somente
         * as classes de identificação.
         */
        this.enablePanelNameTargets();

        this.pointerMoveHandler =
            event => {
                this.handlePointerMove(event);
            };

        this.pointerLeaveHandler =
            () => {
                this.hide();
            };

        /*
         * Quando o operador clica em um DJ para abrir o menu
         * LIGA / DESL / EXTRAIR / INSERIR, a tag precisa sumir
         * imediatamente para não atrapalhar a escolha.
         */
        this.pointerDownHandler =
            event => {

                if (
                    event?.target?.closest?.(
                        [
                            ".breaker",
                            ".aux-breaker",
                            ".breaker-command-menu",
                            ".main-panel-feeder"
                        ].join(",")
                    )
                ) {
                    this.hide();
                }
            };

        this.clickHandler =
            event => {

                if (
                    event?.target?.closest?.(
                        [
                            ".breaker",
                            ".aux-breaker",
                            ".breaker-command-menu",
                            ".main-panel-feeder"
                        ].join(",")
                    )
                ) {
                    this.hide();
                }
            };

        svg.addEventListener(
            "pointermove",
            this.pointerMoveHandler
        );

        svg.addEventListener(
            "pointerleave",
            this.pointerLeaveHandler
        );

        svg.addEventListener(
            "pointerdown",
            this.pointerDownHandler
        );

        svg.addEventListener(
            "click",
            this.clickHandler
        );

        return true;
    }

    static destroy() {

        if (
            this.svg &&
            this.pointerMoveHandler
        ) {

            this.svg.removeEventListener(
                "pointermove",
                this.pointerMoveHandler
            );
        }

        if (
            this.svg &&
            this.pointerLeaveHandler
        ) {

            this.svg.removeEventListener(
                "pointerleave",
                this.pointerLeaveHandler
            );
        }

        if (
            this.svg &&
            this.pointerDownHandler
        ) {

            this.svg.removeEventListener(
                "pointerdown",
                this.pointerDownHandler
            );
        }

        if (
            this.svg &&
            this.clickHandler
        ) {

            this.svg.removeEventListener(
                "click",
                this.clickHandler
            );
        }

        this.tag?.remove?.();

        this.svg = null;
        this.overlay = null;
        this.tag = null;
        this.body = null;
        this.lines = [];
        this.currentTarget = null;
        this.pointerMoveHandler = null;
        this.pointerLeaveHandler = null;
        this.pointerDownHandler = null;
        this.clickHandler = null;
    }

    //==================================================
    // NOMES DOS QUADROS
    //==================================================

    static enablePanelNameTargets() {

        if (!this.svg) return;

        const selectors = [
            ".main-panel-title",
            ".distribution-panel-label",
            ".pca-panel-title",
            ".pca-load-label",
            ".aux-panel-label",

            /*
             * Também permite passar o mouse diretamente
             * sobre a moldura/caixa do quadro.
             */
            ".main-panel-border",
            ".distribution-panel-border",
            ".pca-panel-border",
            ".pca-load-box",
            ".aux-panel-border"
        ];

        this.svg
            .querySelectorAll(
                selectors.join(",")
            )
            .forEach(
                element => {

                    element.setAttribute(
                        "pointer-events",
                        "all"
                    );

                    element.style.cursor =
                        "help";
                }
            );
    }

    //==================================================
    // TAG ÚNICA NA CAMADA EFFECTS
    //==================================================

    static createTag() {

        if (!this.overlay) return;

        const tag =
            document.createElementNS(
                SVG_NS,
                "g"
            );

        tag.id =
            "diagram-global-hover-tag";

        tag.setAttribute(
            "pointer-events",
            "none"
        );

        tag.style.display =
            "none";

        const body =
            document.createElementNS(
                SVG_NS,
                "rect"
            );

        body.setAttribute(
            "x",
            "0"
        );

        body.setAttribute(
            "y",
            "0"
        );

        body.setAttribute(
            "width",
            "900"
        );

        body.setAttribute(
            "height",
            "220"
        );

        body.setAttribute(
            "rx",
            "5"
        );

        body.setAttribute(
            "ry",
            "5"
        );

        body.setAttribute(
            "fill",
            "#fffbe8"
        );

        body.setAttribute(
            "stroke",
            "#66727a"
        );

        body.setAttribute(
            "stroke-width",
            "1.8"
        );

        tag.appendChild(
            body
        );

        const lineSettings = [
            {
                y: 58,
                size: 42,
                weight: "700",
                color: "#263238"
            },
            {
                y: 126,
                size: 36,
                weight: "600",
                color: "#4f5b63"
            },
            {
                y: 188,
                size: 32,
                weight: "600",
                color: "#4f5b63"
            }
        ];

        const lines =
            lineSettings.map(
                settings => {

                    const text =
                        document.createElementNS(
                            SVG_NS,
                            "text"
                        );

                    text.setAttribute(
                        "x",
                        "30"
                    );

                    text.setAttribute(
                        "y",
                        String(
                            settings.y
                        )
                    );

                    text.setAttribute(
                        "font-size",
                        String(
                            settings.size
                        )
                    );

                    text.setAttribute(
                        "font-weight",
                        settings.weight
                    );

                    text.setAttribute(
                        "fill",
                        settings.color
                    );

                    text.setAttribute(
                        "font-family",
                        "Segoe UI, Arial, sans-serif"
                    );

                    tag.appendChild(
                        text
                    );

                    return text;
                }
            );

        this.overlay.appendChild(
            tag
        );

        this.tag = tag;
        this.body = body;
        this.lines = lines;
    }

    //==================================================
    // MOVIMENTO DO MOUSE
    //==================================================

    static handlePointerMove(event) {

        if (
            !this.svg ||
            !event?.target
        ) {
            return;
        }

        /*
         * Enquanto qualquer menu de comando de DJ estiver aberto,
         * nenhuma tag de hover deve aparecer.
         */
        if (
            this.hasOpenCommandMenu()
        ) {
            this.hide();
            return;
        }

        const target =
            event.target;

        /*
         * Os alimentadores do 1QP/3QP já possuem a tag
         * específica com "ALIMENTA" e "FONTE ATUAL".
         * Não mostramos uma segunda tag sobre eles.
         */
        if (
            target.closest?.(
                ".main-panel-feeder"
            )
        ) {
            this.hide();
            return;
        }

        const panelName =
            target.closest?.(
                [
                    ".main-panel-title",
                    ".distribution-panel-label",
                    ".pca-panel-title",
                    ".pca-load-label",
                    ".aux-panel-label",
                    ".main-panel-border",
                    ".distribution-panel-border",
                    ".pca-panel-border",
                    ".pca-load-box",
                    ".aux-panel-border"
                ].join(",")
            );

        if (panelName) {

            const info =
                this.getPanelInfo(
                    panelName
                );

            this.show(
                info,
                event
            );

            return;
        }

        const breaker =
            target.closest?.(
                [
                    "g.breaker",
                    "g.aux-breaker",
                    "g[id^='breaker-']",
                    "g[id^='aux-breaker-']",
                    "g[id*='-breaker']"
                ].join(",")
            );

        if (breaker) {

            const info =
                this.getBreakerInfo(
                    breaker
                );

            this.show(
                info,
                event
            );

            return;
        }

        this.hide();
    }

    //==================================================
    // INFORMAÇÕES DOS DJs
    //==================================================

    static getBreakerInfo(group) {

        const rawId =
            String(
                group.dataset?.equipmentId ??
                group.id ??
                ""
            );

        const labelElement =
            group.querySelector(
                [
                    ".breaker-label",
                    ".aux-breaker-label",
                    ".pca-breaker-label",
                    ".pca-switch-label"
                ].join(",")
            );

        let label =
            String(
                labelElement?.textContent ??
                ""
            ).trim();

        if (!label) {

            const texts =
                [...group.querySelectorAll("text")]
                    .map(
                        item =>
                            String(
                                item.textContent ??
                                ""
                            ).trim()
                    )
                    .filter(Boolean);

            label =
                texts.find(
                    value =>
                        !/^\d+([,.]\d+)?\s*s$/i.test(
                            value
                        )
                ) ?? "";
        }

        if (!label) {

            label =
                rawId
                    .replace(
                        /^breaker-/i,
                        ""
                    )
                    .replace(
                        /^aux-breaker-/i,
                        ""
                    )
                    .replace(
                        /-breaker$/i,
                        ""
                    );
        }

        const state =
            this.resolveBreakerState(
                group
            );

        const inserted =
            this.resolveBreakerInserted(
                group,
                label,
                rawId
            );

        const panel =
            this.findPanelName(
                group
            );

        return {
            line1:
                `DJ ${label || "SEM TAG"}`,
            line2:
                `ESTADO: ${state}  •  POSIÇÃO: ${
                    inserted
                        ? "INSERIDO"
                        : "EXTRAÍDO"
                }`,
            line3:
                panel
                    ? `QUADRO: ${panel}`
                    : "QUADRO: NÃO IDENTIFICADO"
        };
    }

    static resolveBreakerState(group) {

        const state =
            String(
                group.dataset?.state ??
                ""
            );

        const normalized =
            state.toLowerCase();

        if (
            normalized.includes(
                "closed"
            )
        ) {
            return "LIGADO";
        }

        if (
            normalized.includes(
                "tripped"
            )
        ) {
            return "TRIP";
        }

        if (
            normalized.includes(
                "interlocked"
            )
        ) {
            return "INTERTRAVADO";
        }

        if (
            normalized.includes(
                "undervoltage"
            )
        ) {
            return "ABERTO POR FALTA DE TENSÃO";
        }

        if (
            normalized.includes(
                "open"
            )
        ) {
            return "DESLIGADO";
        }

        /*
         * AuxPanel grava o estado também como classe.
         */
        const classText =
            String(
                group.getAttribute(
                    "class"
                ) ?? ""
            ).toLowerCase();

        if (
            classText.includes(
                "closed"
            )
        ) {
            return "LIGADO";
        }

        if (
            classText.includes(
                "open"
            )
        ) {
            return "DESLIGADO";
        }

        return "NÃO INFORMADO";
    }

    static resolveBreakerInserted(
        group,
        label,
        rawId
    ) {

        const datasetInserted =
            group.dataset?.inserted;

        if (
            datasetInserted ===
            "false"
        ) {
            return false;
        }

        if (
            datasetInserted ===
            "true"
        ) {
            return true;
        }

        const store =
            typeof window !== "undefined"
                ? (
                    window.__scadaBreakerPositions ??
                    {}
                )
                : {};

        const possibleKeys = [
            rawId,
            label,
            rawId
                .replace(
                    /^breaker-/i,
                    ""
                )
                .replace(
                    /^aux-breaker-/i,
                    ""
                )
                .replace(
                    /-breaker$/i,
                    ""
                )
        ]
            .map(
                value =>
                    String(
                        value ?? ""
                    ).trim()
            )
            .filter(Boolean);

        for (
            const key
            of possibleKeys
        ) {

            if (
                typeof store[key] ===
                "boolean"
            ) {
                return store[key];
            }
        }

        return true;
    }

    //==================================================
    // INFORMAÇÕES DOS QUADROS
    //==================================================

    static getPanelInfo(
        targetElement
    ) {

        /*
         * O hover pode ocorrer:
         * - diretamente no nome;
         * - na moldura do quadro;
         * - na caixa de uma carga/CCM/CM dentro dos PCAs.
         *
         * Por isso primeiro localizamos o grupo lógico mais próximo.
         */
        const panelGroup =
            targetElement.closest?.(
                [
                    ".main-panel",
                    ".distribution-panel",
                    ".pca-group",
                    ".pca-bus-panel",
                    ".aux-panel",
                    ".pca-load",
                    "g[id^='pca-load-']"
                ].join(",")
            ) ??
            targetElement.parentElement;

        /*
         * Se o próprio elemento possui texto, usamos esse texto.
         * Caso contrário procuramos a identificação dentro do grupo.
         */
        const isTextElement =
            String(
                targetElement.tagName ??
                ""
            ).toLowerCase() ===
            "text";

        const labelElement =
            isTextElement
                ? targetElement
                : panelGroup?.querySelector?.(
                    [
                        ".main-panel-title",
                        ".distribution-panel-label",
                        ".pca-panel-title",
                        ".pca-load-label",
                        ".aux-panel-label"
                    ].join(",")
                );

        const label =
            String(
                labelElement?.textContent ??
                ""
            ).trim();

        const rawId =
            String(
                panelGroup?.dataset?.equipmentId ??
                panelGroup?.dataset?.panelId ??
                panelGroup?.dataset?.loadId ??
                panelGroup?.id ??
                ""
            )
                .replace(
                    /^panel-/i,
                    ""
                )
                .replace(
                    /^distribution-panel-/i,
                    ""
                )
                .replace(
                    /^pca-group-/i,
                    ""
                )
                .replace(
                    /^pca-panel-/i,
                    ""
                )
                .replace(
                    /^pca-load-/i,
                    ""
                )
                .replace(
                    /^aux-panel-/i,
                    ""
                );

        const classList =
            labelElement?.classList ??
            targetElement.classList;

        const type =
            classList?.contains(
                "main-panel-title"
            ) ||
            targetElement.classList?.contains(
                "main-panel-border"
            )
                ? "PAINEL PRINCIPAL"
                : classList?.contains(
                    "pca-load-label"
                ) ||
                targetElement.classList?.contains(
                    "pca-load-box"
                )
                ? "QUADRO / CARGA"
                : classList?.contains(
                    "pca-panel-title"
                ) ||
                targetElement.classList?.contains(
                    "pca-panel-border"
                )
                ? "PAINEL pCA"
                : classList?.contains(
                    "aux-panel-label"
                ) ||
                targetElement.classList?.contains(
                    "aux-panel-border"
                )
                ? "PAINEL AUXILIAR"
                : "QUADRO DE DISTRIBUIÇÃO";

        const energized =
            panelGroup?.dataset?.energized;

        const energyText =
            energized === "false"
                ? "SEM TENSÃO"
                : energized === "true"
                ? "ENERGIZADO"
                : "ESTADO NÃO INFORMADO";

        return {
            line1:
                `QUADRO: ${
                    label ||
                    rawId ||
                    "SEM IDENTIFICAÇÃO"
                }`,
            line2:
                `TIPO: ${type}`,
            line3:
                `IDENTIFICAÇÃO: ${
                    rawId ||
                    label ||
                    "—"
                }  •  ${energyText}`
        };
    }

    static findPanelName(
        element
    ) {

        const panelGroup =
            element.closest?.(
                [
                    ".main-panel",
                    ".distribution-panel",
                    ".pca-group",
                    ".pca-bus-panel",
                    ".aux-panel"
                ].join(",")
            );

        if (!panelGroup) {
            return "";
        }

        const title =
            panelGroup.querySelector(
                [
                    ".main-panel-title",
                    ".distribution-panel-label",
                    ".pca-panel-title",
                    ".aux-panel-label",
                    ".pca-load-label"
                ].join(",")
            );

        if (
            title?.textContent
        ) {
            return String(
                title.textContent
            ).trim();
        }

        return String(
            panelGroup.dataset?.equipmentId ??
            panelGroup.id ??
            ""
        )
            .replace(
                /^panel-/i,
                ""
            )
            .replace(
                /^distribution-panel-/i,
                ""
            )
            .replace(
                /^pca-group-/i,
                ""
            )
            .replace(
                /^aux-panel-/i,
                ""
            );
    }

    //==================================================
    // CONTROLE DO MENU DE COMANDO
    //==================================================

    static hasOpenCommandMenu() {

        return Boolean(
            document.querySelector(
                ".breaker-command-menu:not([style*='display: none'])"
            )
        );
    }

    //==================================================
    // EXIBIÇÃO
    //==================================================

    static show(
        info,
        event
    ) {

        if (
            !info ||
            !this.tag ||
            !this.overlay
        ) {
            return;
        }

        if (
            this.hasOpenCommandMenu()
        ) {
            this.hide();
            return;
        }

        this.lines[0].textContent =
            info.line1 ?? "";

        this.lines[1].textContent =
            info.line2 ?? "";

        this.lines[2].textContent =
            info.line3 ?? "";

        const longest =
            Math.max(
                ...[
                    info.line1,
                    info.line2,
                    info.line3
                ].map(
                    value =>
                        String(
                            value ?? ""
                        ).length
                )
            );

        const width =
            Math.max(
                760,
                Math.min(
                    1400,
                    longest * 22 + 90
                )
            );

        this.body.setAttribute(
            "width",
            String(width)
        );

        const point =
            this.clientPointToSvg(
                event.clientX,
                event.clientY
            );

        this.tag.setAttribute(
            "transform",
            `translate(${point.x + 34} ${point.y - 44})`
        );

        /*
         * Sempre deixa a tag como último elemento da camada effects.
         */
        this.overlay.appendChild(
            this.tag
        );

        this.tag.style.display =
            "block";
    }

    static hide() {

        if (this.tag) {
            this.tag.style.display =
                "none";
        }
    }

    static clientPointToSvg(
        clientX,
        clientY
    ) {

        const point =
            this.svg.createSVGPoint();

        point.x =
            clientX;

        point.y =
            clientY;

        const matrix =
            this.svg
                .getScreenCTM()
                ?.inverse?.();

        if (!matrix) {

            return {
                x: clientX,
                y: clientY
            };
        }

        const transformed =
            point.matrixTransform(
                matrix
            );

        return {
            x: transformed.x,
            y: transformed.y
        };
    }
}
