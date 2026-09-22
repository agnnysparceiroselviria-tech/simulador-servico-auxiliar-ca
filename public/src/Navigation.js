import { Diagram } from "./Diagram.js";

export class Navigation {

    constructor(svg) {

        if (!svg) {
            console.warn(
                "[Navigation] Elemento SVG nÃ£o informado."
            );
            return;
        }

        this.svg = svg;

        this.minZoom =
            Diagram.navigation?.minZoom ?? 0.25;

        this.maxZoom =
            Diagram.navigation?.maxZoom ?? 6;

        this.fitPadding =
            Diagram.navigation?.fitPadding ?? 35;

        /*
         * Escala final aplicada somente pelo botÃ£o AJUSTAR.
         * 1.00 preserva o viewBox calculado e garante que todos os
         * equipamentos permaneÃ§am visÃ­veis ao pressionar AJUSTAR.
         */
        this.fitScale = 0.70;

        /*
         * Desloca o enquadramento para cima apÃ³s o zoom do AJUSTAR,
         * eliminando a margem branca excessiva acima das UGs.
         */
        this.fitTopShiftRatio = 0.08;

        /*
         * O SVG jÃ¡ ocupa somente a Ã¡rea Ãºtil entre os painÃ©is laterais
         * da interface. Portanto, o botÃ£o AJUSTAR nÃ£o deve reservar
         * novamente uma faixa Ã  esquerda: isso deslocaria todo o
         * diagrama para a direita.
         *
         * Mantemos o valor fixo em zero para que o centro dos limites
         * reais dos equipamentos coincida com o centro do viewport.
         */
        this.leftSafeRatio = 0;

        this.dragging = false;

        this.lastX = 0;
        this.lastY = 0;

        this.viewBox = {
            x: 0,
            y: 0,
            width: Diagram.width,
            height: Diagram.height
        };

        this.boundEvents = {};

        /*
         * Temporizador usado para estabilizar o ajuste
         * automÃ¡tico durante o redimensionamento.
         */
        this.resizeTimer = null;

        this.update();
        this.events();

        /*
         * Aguarda o Renderer concluir a criaÃ§Ã£o
         * de todos os elementos SVG.
         */
        requestAnimationFrame(() => {

            requestAnimationFrame(() => {

                this.fit();
            });
        });
    }

    //==================================================
    // ATUALIZA O VIEWBOX
    //==================================================

    update() {

        if (!this.svg) {
            return;
        }

        this.limitPosition();

        this.svg.setAttribute(
            "viewBox",
            [
                this.viewBox.x,
                this.viewBox.y,
                this.viewBox.width,
                this.viewBox.height
            ].join(" ")
        );
    }

    //==================================================
    // ZOOM
    // FATOR MENOR QUE 1 APROXIMA
    // FATOR MAIOR QUE 1 AFASTA
    //==================================================

    zoom(
        factor,
        centerX = null,
        centerY = null
    ) {

        if (
            !Number.isFinite(factor) ||
            factor <= 0
        ) {
            return;
        }

        const oldWidth =
            this.viewBox.width;

        const oldHeight =
            this.viewBox.height;

        const newWidth =
            oldWidth * factor;

        const newHeight =
            oldHeight * factor;

        const minWidth =
            Diagram.width /
            this.maxZoom;

        const minHeight =
            Diagram.height /
            this.maxZoom;

        const maxWidth =
            Diagram.width /
            this.minZoom;

        const maxHeight =
            Diagram.height /
            this.minZoom;

        if (
            newWidth < minWidth ||
            newHeight < minHeight ||
            newWidth > maxWidth ||
            newHeight > maxHeight
        ) {
            return;
        }

        const centerPointX =
            centerX ??
            this.viewBox.x +
            oldWidth / 2;

        const centerPointY =
            centerY ??
            this.viewBox.y +
            oldHeight / 2;

        const ratioX =
            (
                centerPointX -
                this.viewBox.x
            ) /
            oldWidth;

        const ratioY =
            (
                centerPointY -
                this.viewBox.y
            ) /
            oldHeight;

        this.viewBox.width =
            newWidth;

        this.viewBox.height =
            newHeight;

        this.viewBox.x =
            centerPointX -
            newWidth * ratioX;

        this.viewBox.y =
            centerPointY -
            newHeight * ratioY;

        this.update();
    }

    //==================================================
    // APROXIMAÃ‡ÃƒO
    //==================================================

    zoomIn() {

        this.zoom(0.88);
    }

    //==================================================
    // AFASTAMENTO
    //==================================================

    zoomOut() {

        this.zoom(1.12);
    }

    //==================================================
    // ZOOM NO PONTO DO MOUSE
    //==================================================

    zoomAtPointer(event, factor) {

        if (!event) {
            return;
        }

        const point =
            this.clientToSvg(
                event.clientX,
                event.clientY
            );

        this.zoom(
            factor,
            point.x,
            point.y
        );
    }

    //==================================================
    // MOVIMENTAÃ‡ÃƒO
    //==================================================

    pan(dx, dy) {

        if (
            !Number.isFinite(dx) ||
            !Number.isFinite(dy)
        ) {
            return;
        }

        this.viewBox.x -= dx;
        this.viewBox.y -= dy;

        this.update();
    }

    //==================================================
    // OBTÃ‰M A ÃREA PRINCIPAL CONFIGURADA
    //==================================================

    getMainDiagramArea() {

        const area =
            Diagram.areas?.mainDiagramArea;

        if (
            !area ||
            !Number.isFinite(area.x) ||
            !Number.isFinite(area.y) ||
            !Number.isFinite(area.width) ||
            !Number.isFinite(area.height) ||
            area.width <= 0 ||
            area.height <= 0
        ) {
            return null;
        }

        return {
            x: area.x,
            y: area.y,
            width: area.width,
            height: area.height
        };
    }

    //==================================================
    // LIMITES REAIS DO DIAGRAMA PRINCIPAL
    //==================================================

    getDiagramBounds() {

        /*
         * Somente as camadas principais entram
         * no enquadramento automÃ¡tico.
         *
         * A camada footer nÃ£o entra no cÃ¡lculo.
         */
        const layerSelectors = [
            "#topLinks",
            "#wires",
            "#panels",
            "#equipment",
            "#labels",
            "#effects"
        ];

        const boxes = [];

        layerSelectors.forEach(selector => {

            const element =
                this.svg.querySelector(selector);

            if (!element) {
                return;
            }

            try {

                const box =
                    element.getBBox();

                if (
                    Number.isFinite(box.x) &&
                    Number.isFinite(box.y) &&
                    Number.isFinite(box.width) &&
                    Number.isFinite(box.height) &&
                    box.width > 0 &&
                    box.height > 0
                ) {
                    boxes.push(box);
                }

            } catch (error) {

                console.warn(
                    `[Navigation] NÃ£o foi possÃ­vel ler ${selector}.`,
                    error
                );
            }
        });

        if (boxes.length === 0) {

            return {
                x: 0,
                y: 0,
                width: Diagram.width,
                height: Diagram.height
            };
        }

        const minX =
            Math.min(
                ...boxes.map(
                    box => box.x
                )
            );

        const minY =
            Math.min(
                ...boxes.map(
                    box => box.y
                )
            );

        const maxX =
            Math.max(
                ...boxes.map(
                    box =>
                        box.x +
                        box.width
                )
            );

        const maxY =
            Math.max(
                ...boxes.map(
                    box =>
                        box.y +
                        box.height
                )
            );

        return {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY
        };
    }

    //==================================================
    // EIXO HORIZONTAL DO CONJUNTO PRINCIPAL
    //==================================================

    getMainHorizontalCenter() {

        /*
         * Os cinco grupos PCA formam a referÃªncia horizontal estÃ¡vel
         * do desenho. Os pequenos diagramas isolados Ã  esquerda devem
         * continuar visÃ­veis, mas nÃ£o podem deslocar o eixo visual do
         * conjunto principal.
         */
        const elements = [
            ...this.svg.querySelectorAll(
                '[id^="pca-panel-"]'
            )
        ];

        const boxes = [];

        elements.forEach(element => {

            try {

                const box = element.getBBox();

                if (
                    Number.isFinite(box.x) &&
                    Number.isFinite(box.width) &&
                    box.width > 0
                ) {
                    boxes.push(box);
                }

            } catch (error) {

                console.warn(
                    "[Navigation] NÃ£o foi possÃ­vel ler um painel PCA.",
                    error
                );
            }
        });

        if (boxes.length === 0) {
            return null;
        }

        const minX = Math.min(...boxes.map(box => box.x));
        const maxX = Math.max(
            ...boxes.map(box => box.x + box.width)
        );

        return (minX + maxX) / 2;
    }

    //==================================================
    // ESCOLHE A ÃREA USADA PELO AJUSTE
    //==================================================

    getFitBounds() {

        /*
         * O botÃ£o Ajuste deve acompanhar o conteÃºdo real,
         * inclusive depois de alteraÃ§Ãµes de layout.
         * A Ã¡rea fixa do Diagram.js fica apenas como fallback.
         */
        const diagramBounds =
            this.getDiagramBounds();

        if (
            diagramBounds &&
            Number.isFinite(diagramBounds.width) &&
            Number.isFinite(diagramBounds.height) &&
            diagramBounds.width > 0 &&
            diagramBounds.height > 0
        ) {

            const mainCenterX =
                this.getMainHorizontalCenter();

            if (Number.isFinite(mainCenterX)) {

                const diagramRight =
                    diagramBounds.x +
                    diagramBounds.width;

                const halfWidth = Math.max(
                    mainCenterX - diagramBounds.x,
                    diagramRight - mainCenterX
                );

                return {
                    x: mainCenterX - halfWidth,
                    y: diagramBounds.y,
                    width: halfWidth * 2,
                    height: diagramBounds.height
                };
            }

            return diagramBounds;
        }

        return this.getMainDiagramArea();
    }

    //==================================================
    // CALCULA VIEWBOX PARA UMA ÃREA
    //==================================================

    calculateAreaViewBox(
        area,
        padding = 35
    ) {

        if (!area) {
            return null;
        }

        const svgRect =
            this.svg.getBoundingClientRect();

        if (
            svgRect.width <= 0 ||
            svgRect.height <= 0 ||
            area.width <= 0 ||
            area.height <= 0
        ) {
            return null;
        }

        const safePadding =
            Math.max(
                Number(padding) || 0,
                0
            );

        const safeLeftRatio =
            Math.min(
                Math.max(
                    Number(this.leftSafeRatio) || 0,
                    0
                ),
                0.35
            );

        const contentWidth =
            area.width +
            safePadding * 2;

        const availableWidth =
            contentWidth /
            (1 - safeLeftRatio);

        const availableHeight =
            area.height +
            safePadding * 2;

        const svgAspect =
            svgRect.width /
            svgRect.height;

        const areaAspect =
            availableWidth /
            availableHeight;

        let viewWidth;
        let viewHeight;

        if (areaAspect > svgAspect) {

            viewWidth =
                availableWidth;

            viewHeight =
                viewWidth /
                svgAspect;

        } else {

            viewHeight =
                availableHeight;

            viewWidth =
                viewHeight *
                svgAspect;
        }

        const centerX =
            area.x +
            area.width / 2;

        const centerY =
            area.y +
            area.height / 2;

        return {
            /*
             * Centraliza o conteÃºdo real no viewport.
             * Quando houver faixa lateral configurada,
             * desloca o centro apenas pela metade da reserva.
             */
            x:
                centerX -
                viewWidth *
                (1 + safeLeftRatio) / 2,

            y:
                centerY -
                viewHeight / 2,

            width:
                viewWidth,

            height:
                viewHeight
        };
    }

    //==================================================
    // AJUSTA O DIAGRAMA PRINCIPAL Ã€ TELA
    //==================================================

    fit(padding = this.fitPadding) {

        const bounds =
            this.getFitBounds();

        const calculatedViewBox =
            this.calculateAreaViewBox(
                bounds,
                padding
            );

        if (!calculatedViewBox) {
            return;
        }

        const scale = Math.min(
            Math.max(this.fitScale, 0.30),
            1
        );

        const widthReduction =
            calculatedViewBox.width *
            (1 - scale);

        this.viewBox = {
            x:
                calculatedViewBox.x +
                widthReduction / 2,

            y:
                /*
                 * AvanÃ§a o viewBox no eixo Y para mover o desenho para
                 * cima, preservando ainda uma margem sobre as linhas
                 * superiores das UGs.
                 */
                calculatedViewBox.y +
                calculatedViewBox.height *
                scale *
                this.fitTopShiftRatio,

            width:
                calculatedViewBox.width *
                scale,

            height:
                calculatedViewBox.height *
                scale
        };

        this.update();
    }

    //==================================================
    // AJUSTE PELOS LIMITES REAIS
    //==================================================

    fitContent(padding = this.fitPadding) {

        const bounds =
            this.getDiagramBounds();

        const calculatedViewBox =
            this.calculateAreaViewBox(
                bounds,
                padding
            );

        if (!calculatedViewBox) {
            return;
        }

        this.viewBox =
            calculatedViewBox;

        this.update();
    }

    //==================================================
    // CENTRALIZA EM UMA ÃREA CONFIGURADA
    //==================================================

    focusArea(
        areaName,
        padding = 50
    ) {

        const area =
            Diagram.areas?.[areaName];

        if (!area) {

            console.warn(
                `[Navigation] Ãrea nÃ£o encontrada: ${areaName}`
            );

            return;
        }

        const calculatedViewBox =
            this.calculateAreaViewBox(
                area,
                padding
            );

        if (!calculatedViewBox) {
            return;
        }

        this.viewBox =
            calculatedViewBox;

        this.update();
    }

    //==================================================
    // ATALHOS DE FOCO
    //==================================================

    focusMainDiagram(
        padding = this.fitPadding
    ) {

        this.focusArea(
            "mainDiagramArea",
            padding
        );
    }

    focusUpperArea(padding = 50) {

        this.focusArea(
            "upperArea",
            padding
        );
    }

    focusMainPanels(padding = 50) {

        this.focusArea(
            "mainPanelsArea",
            padding
        );
    }

    focusPcaPanels(padding = 50) {

        this.focusArea(
            "pcaPanelsArea",
            padding
        );
    }

    focusAuxPanels(padding = 50) {

        this.focusArea(
            "auxPanelsArea",
            padding
        );
    }

    focusLowerPanels(padding = 50) {

        this.focusArea(
            "lowerPanelsArea",
            padding
        );
    }

    //==================================================
    // CONVERTE COORDENADA DA TELA PARA SVG
    //==================================================

    clientToSvg(
        clientX,
        clientY
    ) {

        const rect =
            this.svg.getBoundingClientRect();

        if (
            rect.width <= 0 ||
            rect.height <= 0
        ) {
            return {
                x: this.viewBox.x,
                y: this.viewBox.y
            };
        }

        const scaleX =
            this.viewBox.width /
            rect.width;

        const scaleY =
            this.viewBox.height /
            rect.height;

        return {
            x:
                this.viewBox.x +
                (
                    clientX -
                    rect.left
                ) *
                scaleX,

            y:
                this.viewBox.y +
                (
                    clientY -
                    rect.top
                ) *
                scaleY
        };
    }

    //==================================================
    // LIMITA A MOVIMENTAÃ‡ÃƒO
    //==================================================

    limitPosition() {

        const extraX =
            this.viewBox.width *
            0.35;

        const extraY =
            this.viewBox.height *
            0.35;

        const minX =
            -extraX;

        const minY =
            -extraY;

        const maxX =
            Diagram.width -
            this.viewBox.width +
            extraX;

        const maxY =
            Diagram.height -
            this.viewBox.height +
            extraY;

        if (minX <= maxX) {

            this.viewBox.x =
                Math.min(
                    Math.max(
                        this.viewBox.x,
                        minX
                    ),
                    maxX
                );
        }

        if (minY <= maxY) {

            this.viewBox.y =
                Math.min(
                    Math.max(
                        this.viewBox.y,
                        minY
                    ),
                    maxY
                );
        }
    }

    //==================================================
    // EVENTOS
    //==================================================

    events() {

        this.svg.style.cursor =
            "grab";

        this.svg.style.touchAction =
            "none";

        this.boundEvents.wheel =
            event => {

                event.preventDefault();

                const factor =
                    event.deltaY < 0
                        ? 0.88
                        : 1.12;

                this.zoomAtPointer(
                    event,
                    factor
                );
            };

        this.boundEvents.pointerDown =
            event => {

                if (event.button !== 0) {
                    return;
                }

                this.dragging = true;

                this.lastX =
                    event.clientX;

                this.lastY =
                    event.clientY;

                this.svg.style.cursor =
                    "grabbing";

                this.svg.setPointerCapture?.(
                    event.pointerId
                );
            };

        this.boundEvents.pointerMove =
            event => {

                if (!this.dragging) {
                    return;
                }

                if (
                    !this.svg.clientWidth ||
                    !this.svg.clientHeight
                ) {
                    return;
                }

                const dx =
                    (
                        event.clientX -
                        this.lastX
                    ) *
                    this.viewBox.width /
                    this.svg.clientWidth;

                const dy =
                    (
                        event.clientY -
                        this.lastY
                    ) *
                    this.viewBox.height /
                    this.svg.clientHeight;

                this.pan(dx, dy);

                this.lastX =
                    event.clientX;

                this.lastY =
                    event.clientY;
            };

        this.boundEvents.pointerUp =
            event => {

                this.dragging = false;

                this.svg.style.cursor =
                    "grab";

                this.svg.releasePointerCapture?.(
                    event.pointerId
                );
            };

        /*
         * Duplo clique restaura a visualizaÃ§Ã£o
         * do diagrama principal.
         */
        this.boundEvents.doubleClick =
            () => {

                this.fit();
            };

        /*
         * Ao redimensionar a janela, aguarda o navegador
         * concluir o novo layout antes de recalcular
         * o enquadramento.
         *
         * Isso evita o afastamento excessivo causado por
         * vÃ¡rias chamadas consecutivas de resize.
         */
        this.boundEvents.resize =
            () => {

                if (this.resizeTimer) {

                    clearTimeout(
                        this.resizeTimer
                    );
                }

                this.resizeTimer =
                    setTimeout(
                        () => {

                            this.resizeTimer = null;

                            const rect =
                                this.svg
                                    ?.getBoundingClientRect();

                            if (
                                !rect ||
                                rect.width <= 0 ||
                                rect.height <= 0
                            ) {
                                return;
                            }

                            requestAnimationFrame(
                                () => {

                                    requestAnimationFrame(
                                        () => {

                                            this.fit();
                                        }
                                    );
                                }
                            );
                        },
                        180
                    );
            };

        this.svg.addEventListener(
            "wheel",
            this.boundEvents.wheel,
            {
                passive: false
            }
        );

        this.svg.addEventListener(
            "pointerdown",
            this.boundEvents.pointerDown
        );

        this.svg.addEventListener(
            "pointermove",
            this.boundEvents.pointerMove
        );

        this.svg.addEventListener(
            "pointerup",
            this.boundEvents.pointerUp
        );

        this.svg.addEventListener(
            "pointercancel",
            this.boundEvents.pointerUp
        );

        this.svg.addEventListener(
            "dblclick",
            this.boundEvents.doubleClick
        );

        window.addEventListener(
            "resize",
            this.boundEvents.resize
        );
    }

    //==================================================
    // REMOVE EVENTOS
    //==================================================

    destroy() {

        if (!this.svg) {
            return;
        }

        this.svg.removeEventListener(
            "wheel",
            this.boundEvents.wheel
        );

        this.svg.removeEventListener(
            "pointerdown",
            this.boundEvents.pointerDown
        );

        this.svg.removeEventListener(
            "pointermove",
            this.boundEvents.pointerMove
        );

        this.svg.removeEventListener(
            "pointerup",
            this.boundEvents.pointerUp
        );

        this.svg.removeEventListener(
            "pointercancel",
            this.boundEvents.pointerUp
        );

        this.svg.removeEventListener(
            "dblclick",
            this.boundEvents.doubleClick
        );

        window.removeEventListener(
            "resize",
            this.boundEvents.resize
        );

        if (this.resizeTimer) {

            clearTimeout(
                this.resizeTimer
            );

            this.resizeTimer = null;
        }

        this.dragging = false;
    }
}