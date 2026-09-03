import { Equipment } from "./Equipment.js";

export class Breaker extends Equipment {

    static STATES = {

        OPEN:
            "open",

        OPEN_AUTO_PRESELECTED:
            "openAutoPreselected",

        OPEN_AUTO:
            "openAuto",

        OPEN_UNDERVOLTAGE_TRIP:
            "openUndervoltageTrip",

        CLOSED_AUTO:
            "closedAuto",

        CLOSED_UNDERVOLTAGE_TRIP:
            "closedUndervoltageTrip",

        OPEN_SEMI_AUTO:
            "openSemiAuto",

        CLOSED:
            "closed",

        TRIPPED:
            "tripped",

        INTERLOCKED:
            "interlocked"
    };

    //==================================================
    // DESENHO PRINCIPAL
    //==================================================

    static draw(layer, data = {}) {

        if (!layer) {

            console.warn(
                "[Breaker] Camada SVG nÃ£o informada."
            );

            return null;
        }

        const {

            id = "",

            label = id,

            x = 0,

            y = 0,

            size = 42,

            state =
                this.STATES.OPEN_AUTO,

            closed = null,

            stroke = "#000000",

            textColor = stroke,

            strokeWidth = 1.4,

            labelPosition = "right",

            labelOffset = 12,

            energized = false,

            available = true,

            interactive = true,

            onCommand = null,

            inserted = null,

            showLabel = true,

            time = "",

            timePosition = "bottom"

        } = data;

        const resolvedState =
            this.resolveState(
                state,
                closed
            );

        /*
         * Posição mecânica do disjuntor.
         *
         * O mapa global é mantido pelo Engine para permitir
         * que todos os DJs desenhados pelo Breaker compartilhem
         * a mesma informação de INSERIDO / EXTRAÍDO sem alterar
         * as estruturas já existentes do cenário.
         */
        const storedInserted =
            typeof window !== "undefined"
                ? window.__scadaBreakerPositions?.[
                    String(id)
                ]
                : undefined;

        const resolvedInserted =
            typeof storedInserted === "boolean"
                ? storedInserted
                : inserted !== false;

        /*
         * Estado visual:
         *
         * INSERIDO:
         * mantém o estado elétrico real.
         *
         * EXTRAÍDO:
         * é eletricamente considerado aberto, porém a representação
         * visual utiliza o padrão preto/branco solicitado para indicar
         * claramente que o DJ está fora da posição de serviço.
         */
        const effectiveState =
            resolvedInserted
                ? resolvedState
                : this.STATES.OPEN_UNDERVOLTAGE_TRIP;

        const group =
            this.group(
                id
                    ? `breaker-${id}`
                    : "",
                "breaker"
            );

        group.dataset.equipmentId =
            id;

        group.dataset.equipmentType =
            "breaker";

        group.dataset.state =
            resolvedState;

        group.dataset.energized =
            energized
                ? "true"
                : "false";

        group.dataset.available =
            available
                ? "true"
                : "false";

        group.dataset.inserted =
            resolvedInserted
                ? "true"
                : "false";

        if (interactive) {

            group.classList.add(
                "interactive"
            );

            group.setAttribute(
                "tabindex",
                "0"
            );

            group.setAttribute(
                "role",
                "button"
            );

            group.setAttribute(
                "aria-label",
                `Disjuntor ${label}, estado ${effectiveState}, posição ${resolvedInserted ? "inserido" : "extraído"}`
            );

            group.style.cursor =
                available
                    ? "pointer"
                    : "not-allowed";
        }

        const left =
            x - size / 2;

        const top =
            y - size / 2;

        const visual =
            this.getVisualState({
                state:
                    effectiveState,

                stroke,

                energized,

                available
            });

        //==================================================
        // ÃREA DE CLIQUE
        //==================================================

        if (interactive) {

            const hitArea =
                this.rect(
                    left - 10,
                    top - 10,
                    size + 20,
                    size + 20,
                    "transparent",
                    "transparent",
                    0,
                    {
                        className:
                            "breaker-hit-area"
                    }
                );

            hitArea.setAttribute(
                "pointer-events",
                "all"
            );

            group.appendChild(
                hitArea
            );
        }

        //==================================================
        // CORPO DO DISJUNTOR
        //==================================================

        const body =
            this.rect(
                left,
                top,
                size,
                size,
                visual.fill,
                visual.stroke,
                strokeWidth,
                {
                    className:
                        "breaker-body"
                }
            );

        group.appendChild(
            body
        );

        /*
         * MantÃ©m os DJs fechados em vermelho mesmo quando
         * existir uma regra com !important no theme.css.
         */
        if (
            this.isClosedState(
                effectiveState
            )
        ) {

            const closedBodyColor =
                energized
                    ? "#d60000"
                    : "#000000";

            body.setAttribute(
                "fill",
                closedBodyColor
            );

            body.setAttribute(
                "stroke",
                closedBodyColor
            );

            body.style.setProperty(
                "fill",
                closedBodyColor,
                "important"
            );

            body.style.setProperty(
                "stroke",
                closedBodyColor,
                "important"
            );
        }

        /*
         * Os DJs 107 a 112 utilizam este estado especial.
         * Mesmo assim, quando fechados, permanecem vermelhos.
         */
        if (
            effectiveState ===
            this.STATES
                .CLOSED_UNDERVOLTAGE_TRIP
        ) {

            body.setAttribute(
                "fill",
                "#d60000"
            );

            body.setAttribute(
                "stroke",
                "#d60000"
            );

            body.style.setProperty(
                "fill",
                "#d60000",
                "important"
            );

            body.style.setProperty(
                "stroke",
                "#d60000",
                "important"
            );
        }

        /*
         * DJs das fontes externas SE 138 kV.
         * Permanecem pretos conforme o diagrama operacional.
         */
        const externalSourceBreakers = [
            "SE138_1QP-breaker",
            "SE138_3QP-breaker",
            "1QD-91-breaker",
            "3QD-92-breaker"
        ];

        if (
            externalSourceBreakers.includes(
                String(id)
            )
        ) {

            body.setAttribute(
                "fill",
                "#000000"
            );

            body.setAttribute(
                "stroke",
                "#000000"
            );

            body.style.setProperty(
                "fill",
                "#000000",
                "important"
            );

            body.style.setProperty(
                "stroke",
                "#000000",
                "important"
            );
        }

        /*
         * PADRÃO VISUAL DA POSIÇÃO MECÂNICA
         *
         * INSERIDO + DESLIGADO:
         * sem cor, para indicar que o DJ está disponível na posição
         * de serviço, porém aberto.
         *
         * EXTRAÍDO + DESLIGADO:
         * mantém o padrão preto/branco conforme solicitado.
         * Não utiliza mais corpo cinza nem contorno tracejado.
         */

        const insertedOpenStates = [
            this.STATES.OPEN,
            this.STATES.OPEN_AUTO_PRESELECTED,
            this.STATES.OPEN_AUTO,
            this.STATES.OPEN_SEMI_AUTO
        ];

        if (
            resolvedInserted &&
            insertedOpenStates.includes(
                resolvedState
            )
        ) {

            const insertedOpenColor =
                "#ffffff";

            body.setAttribute(
                "fill",
                insertedOpenColor
            );

            body.setAttribute(
                "stroke",
                "#000000"
            );

            body.removeAttribute(
                "stroke-dasharray"
            );

            body.style.setProperty(
                "fill",
                insertedOpenColor,
                "important"
            );

            body.style.setProperty(
                "stroke",
                "#000000",
                "important"
            );
        }

        if (!resolvedInserted) {

            const extractedColor =
                "#f2b705";

            body.setAttribute(
                "fill",
                extractedColor
            );

            body.setAttribute(
                "stroke",
                extractedColor
            );

            body.removeAttribute(
                "stroke-dasharray"
            );

            body.style.setProperty(
                "fill",
                extractedColor,
                "important"
            );

            body.style.setProperty(
                "stroke",
                extractedColor,
                "important"
            );

            /*
             * Contorno tracejado adicional para DJ extraído.
             * Mantém o símbolo atual e acrescenta apenas
             * a identificação visual ao redor do disjuntor.
             */
            const extractedOutline =
                this.rect(
                    left - 8,
                    top - 8,
                    size + 16,
                    size + 16,
                    "none",
                    extractedColor,
                    Math.max(
                        1.2,
                        strokeWidth
                    ),
                    {
                        className:
                            "breaker-extracted-outline"
                    }
                );

            extractedOutline.setAttribute(
                "stroke-dasharray",
                "8 5"
            );

            extractedOutline.style.setProperty(
                "fill",
                "none",
                "important"
            );

            extractedOutline.style.setProperty(
                "stroke",
                extractedColor,
                "important"
            );

            group.appendChild(
                extractedOutline
            );
        }

        //==================================================
        // SÃMBOLO INTERNO
        //==================================================

        this.drawInternalSymbol(
            group,
            {
                left,

                top,

                size,

                state:
                    effectiveState,

                color:
                    visual.symbolColor,

                strokeWidth
            }
        );

        //==================================================
        // INDICAÃ‡ÃƒO DE TRIP
        //==================================================

        if (
            effectiveState ===
            this.STATES.TRIPPED
        ) {

            const tripDot =
                this.circle(
                    x + size / 2 - 2,
                    y - size / 2 + 2,
                    6,
                    "#ff3b1f",
                    "#ff3b1f",
                    1,
                    {
                        className:
                            "breaker-trip-dot"
                    }
                );

            group.appendChild(
                tripDot
            );
        }

        //==================================================
        // IDENTIFICAÃ‡ÃƒO
        //==================================================

        if (
            showLabel &&
            label
        ) {

            const position =
                this.getLabelPosition(
                    x,
                    y,
                    size,
                    labelPosition,
                    labelOffset
                );

            const labelText =
                this.text(
                    position.x,
                    position.y,
                    label,
                    data.fontSize ?? 30,
                    textColor,
                    {
                        anchor:
                            position.anchor,

                        weight:
                            "600",

                        className:
                            "breaker-label"
                    }
                );

            group.appendChild(
                labelText
            );
        }

        //==================================================
        // TEMPORIZAÃ‡ÃƒO
        //==================================================

        if (time) {

            const position =
                this.getTimePosition(
                    x,
                    y,
                    size,
                    timePosition
                );

            const timeText =
                this.text(
                    position.x,
                    position.y,
                    time,
                    data.timeFontSize ?? 24,
                    data.timeColor ??
                        textColor,
                    {
                        anchor:
                            "middle",

                        weight:
                            "600",

                        className:
                            "breaker-time"
                    }
                );

            group.appendChild(
                timeText
            );
        }

        //==================================================
        // POSIÇÃO MECÂNICA
        //==================================================

        if (!resolvedInserted) {

            group.appendChild(
                this.text(
                    x,
                    y + size / 2 + 18,
                    "EXTRAÍDO",
                    data.positionFontSize ?? 10,
                    "#7a858d",
                    {
                        anchor:
                            "middle",

                        weight:
                            "700",

                        className:
                            "breaker-position-label"
                    }
                )
            );
        }

        //==================================================
        // COMANDO DIRETO DO OPERADOR
        // 1 clique  = LIGA / DESL
        // 2 cliques = EXTRAIR / INSERIR
        //==================================================

        if (interactive) {

            group.addEventListener(
                "pointerdown",
                event => {
                    event.stopPropagation();
                }
            );

            const currentlyClosed =
                this.isClosedState(
                    effectiveState
                );

            const executeElectricalCommand = (
                desiredClosed,
                event
            ) => {

                event?.preventDefault?.();
                event?.stopPropagation?.();

                if (!available) {
                    return false;
                }

                if (
                    desiredClosed === true &&
                    !resolvedInserted
                ) {

                    window.alert(
                        `COMANDO BLOQUEADO\nO DJ ${label} está EXTRAÍDO. Insira o disjuntor antes de ligar.`
                    );

                    return false;
                }

                if (
                    desiredClosed ===
                    currentlyClosed
                ) {
                    return true;
                }

                if (
                    typeof onCommand ===
                    "function"
                ) {

                    onCommand({
                        id,
                        label,
                        state:
                            effectiveState,
                        closed:
                            currentlyClosed,
                        nextClosed:
                            desiredClosed,
                        inserted:
                            resolvedInserted
                    });

                    return true;
                }

                return false;
            };

            const executeRackCommand = (
                desiredInserted,
                event
            ) => {

                event?.preventDefault?.();
                event?.stopPropagation?.();

                if (!available) {
                    return false;
                }

                if (
                    desiredInserted === false &&
                    currentlyClosed
                ) {

                    window.alert(
                        `COMANDO BLOQUEADO\nDesligue o DJ ${label} antes de EXTRAIR.`
                    );

                    return false;
                }

                if (
                    desiredInserted ===
                    resolvedInserted
                ) {
                    return true;
                }

                window.dispatchEvent(
                    new CustomEvent(
                        "scada:breaker-rack-command",
                        {
                            detail: {
                                id:
                                    String(id),
                                label:
                                    String(label),
                                inserted:
                                    desiredInserted
                            }
                        }
                    )
                );

                return true;
            };

            let singleClickTimer = null;

            const cancelSingleClick = () => {

                if (singleClickTimer !== null) {
                    window.clearTimeout(
                        singleClickTimer
                    );

                    singleClickTimer = null;
                }
            };

            group.addEventListener(
                "click",
                event => {
                    event.preventDefault();
                    event.stopPropagation();

                    cancelSingleClick();

                    /*
                     * Aguarda brevemente para distinguir o clique
                     * simples do primeiro clique de um duplo clique.
                     */
                    singleClickTimer =
                        window.setTimeout(
                            () => {
                                singleClickTimer = null;

                                executeElectricalCommand(
                                    !currentlyClosed,
                                    event
                                );
                            },
                            260
                        );
                }
            );

            group.addEventListener(
                "dblclick",
                event => {
                    event.preventDefault();
                    event.stopPropagation();

                    cancelSingleClick();

                    executeRackCommand(
                        !resolvedInserted,
                        event
                    );
                }
            );

            group.addEventListener(
                "keydown",
                event => {

                    if (
                        event.key === "Enter" ||
                        event.key === " "
                    ) {
                        executeElectricalCommand(
                            !currentlyClosed,
                            event
                        );
                    }
                }
            );
        }

        layer.appendChild(
            group
        );

        return group;
    }

    //==================================================
    // MENU DE COMANDO DO DJ
    //==================================================

    static drawCommandMenu(
        group,
        data = {}
    ) {

        if (!group) {
            return null;
        }

        const {
            x = 0,
            y = 0,
            closed = false,
            inserted = true,
            available = true,
            onClose = null,
            onOpen = null,
            onExtract = null,
            onInsert = null
        } = data;

        const menu =
            this.group(
                "",
                "breaker-command-menu"
            );

        const width =
            380;

        const height =
            170;

        menu.appendChild(
            this.rect(
                x,
                y,
                width,
                height,
                "#ffffff",
                "#66727a",
                1.2,
                {
                    className:
                        "breaker-command-menu-body"
                }
            )
        );

        const buttons = [
            {
                label: "LIGA",
                x: x + 10,
                y: y + 10,
                active:
                    !closed &&
                    inserted,
                disabled:
                    !available ||
                    closed ||
                    !inserted,
                action:
                    onClose
            },
            {
                label: "DESL",
                x: x + 195,
                y: y + 10,
                active:
                    closed,
                disabled:
                    !available ||
                    !closed,
                action:
                    onOpen
            },
            {
                label: "EXTRAIR",
                x: x + 10,
                y: y + 88,
                active:
                    inserted &&
                    !closed,
                disabled:
                    !available ||
                    closed ||
                    !inserted,
                action:
                    onExtract
            },
            {
                label: "INSERIR",
                x: x + 195,
                y: y + 88,
                active:
                    !inserted,
                disabled:
                    !available ||
                    inserted,
                action:
                    onInsert
            }
        ];

        buttons.forEach(item => {

            const button =
                this.group(
                    "",
                    `breaker-command-button${
                        item.disabled
                            ? " disabled"
                            : ""
                    }`
                );

            const body =
                this.rect(
                    item.x,
                    item.y,
                    175,
                    70,
                    item.active
                        ? "#e8f4ff"
                        : "#ffffff",
                    item.disabled
                        ? "#b8c0c5"
                        : "#4f5b63",
                    1,
                    {
                        className:
                            "breaker-command-button-body"
                    }
                );

            const text =
                this.text(
                    item.x + 87.5,
                    item.y + 45,
                    item.label,
                    26,
                    item.disabled
                        ? "#9aa2a7"
                        : "#263238",
                    {
                        anchor:
                            "middle",

                        weight:
                            "700",

                        className:
                            "breaker-command-button-label"
                    }
                );

            button.appendChild(
                body
            );

            button.appendChild(
                text
            );

            button.setAttribute(
                "pointer-events",
                "all"
            );

            button.style.cursor =
                item.disabled
                    ? "not-allowed"
                    : "pointer";

            button.addEventListener(
                "pointerdown",
                event =>
                    event.stopPropagation()
            );

            button.addEventListener(
                "click",
                event => {

                    event.preventDefault();
                    event.stopPropagation();

                    if (
                        item.disabled ||
                        typeof item.action !==
                            "function"
                    ) {
                        return;
                    }

                    item.action(
                        event
                    );
                }
            );

            menu.appendChild(
                button
            );
        });

        group.appendChild(
            menu
        );

        return menu;
    }

    static isClosedState(state) {

        return [
            this.STATES.CLOSED,
            this.STATES.CLOSED_AUTO,
            this.STATES
                .CLOSED_UNDERVOLTAGE_TRIP
        ].includes(state);
    }

    //==================================================
    // RESOLUÃ‡ÃƒO DE ESTADO
    //==================================================

    static resolveState(
        state,
        closed
    ) {

        if (
            typeof closed ===
            "boolean"
        ) {

            return closed
                ? this.STATES.CLOSED
                : this.STATES.OPEN;
        }

        return Object
            .values(
                this.STATES
            )
            .includes(
                state
            )
            ? state
            : this.STATES.OPEN;
    }

    //==================================================
    // APARÊNCIA DOS ESTADOS
    //
    // PADRÃO ADOTADO:
    // - LIGADO + INSERIDO: vermelho
    // - DESLIGADO + INSERIDO: sem cor
    // - FALTA DE TENSÃO: preto/branco
    // - EXTRAÍDO + DESLIGADO: preto/branco
    //==================================================

    static getVisualState({
        state,
        stroke,
        energized,
        available
    }) {

        if (!available) {

            return {

                stroke:
                    "#777777",

                fill:
                    "#d0d0d0",

                symbolColor:
                    "#777777"
            };
        }

        const closedStates = [

            this.STATES.CLOSED,

            this.STATES.CLOSED_AUTO
        ];

        /*
         * DJs fechados:
         * corpo totalmente vermelho.
         */
        if (
            closedStates.includes(
                state
            )
        ) {

            const closedColor =
                energized
                    ? "#d60000"
                    : "#000000";

            return {

                stroke:
                    closedColor,

                fill:
                    closedColor,

                symbolColor:
                    "#ffffff"
            };
        }

        /*
         * Fechado com operaÃ§Ã£o por subtensÃ£o:
         * corpo vermelho com indicaÃ§Ã£o diagonal branca.
         */
        if (
            state ===
            this.STATES
                .CLOSED_UNDERVOLTAGE_TRIP
        ) {

            return {

                stroke:
                    "#d60000",

                fill:
                    "#d60000",

                symbolColor:
                    "#ffffff"
            };
        }

        /*
         * DJ aberto por falta de tensÃ£o:
         * metade preta e metade branca.
         */
        if (
            state ===
            this.STATES
                .OPEN_UNDERVOLTAGE_TRIP
        ) {

            return {

                stroke:
                    "#000000",

                fill:
                    "#ffffff",

                symbolColor:
                    "#000000"
            };
        }

        /*
         * DJ atuado por proteÃ§Ã£o.
         */
        if (
            state ===
            this.STATES.TRIPPED
        ) {

            return {

                stroke:
                    "#ff3b1f",

                fill:
                    "#ffffff",

                symbolColor:
                    "#ff3b1f"
            };
        }

        /*
         * DJ intertravado.
         */
        if (
            state ===
            this.STATES.INTERLOCKED
        ) {

            return {

                stroke:
                    "#d4a900",

                fill:
                    "#ffffff",

                symbolColor:
                    "#d4a900"
            };
        }

        /*
         * DJs abertos:
         * corpo branco e sÃ­mbolo preto.
         */
        return {

            stroke:
                stroke,

            fill:
                "#ffffff",

            symbolColor:
                "#000000"
        };
    }

    //==================================================
    // SÃMBOLOS INTERNOS
    //==================================================

    static drawInternalSymbol(
        group,
        {
            left,
            top,
            size,
            state,
            color,
            strokeWidth
        }
    ) {

        const symbolInset =
            Math.max(
                6,
                size * 0.18
            );

        const symbolWidth =
            Math.max(
                1.4,
                strokeWidth
            );

        const openAutomaticStates = [

            this.STATES
                .OPEN_AUTO_PRESELECTED,

            this.STATES.OPEN_AUTO,

            this.STATES.OPEN_SEMI_AUTO
        ];

        //==================================================
        // DJ ABERTO SIMPLES
        //==================================================

        if (
            state ===
            this.STATES.OPEN
        ) {

            const openingLine =
                this.line(
                    left + symbolInset,
                    top + size - symbolInset,
                    left + size - symbolInset,
                    top + symbolInset,
                    color,
                    symbolWidth,
                    {
                        className:
                            "breaker-opening-symbol"
                    }
                );

            group.appendChild(
                openingLine
            );

            return;
        }

        //==================================================
        // DJ ABERTO COM OPERAÃ‡ÃƒO AUTOMÃTICA
        // SÃMBOLO EM X
        //==================================================

        if (
            openAutomaticStates.includes(
                state
            )
        ) {

            const diagonalOne =
                this.line(
                    left + symbolInset,
                    top + symbolInset,
                    left + size - symbolInset,
                    top + size - symbolInset,
                    color,
                    symbolWidth,
                    {
                        className:
                            "breaker-auto-symbol"
                    }
                );

            const diagonalTwo =
                this.line(
                    left + symbolInset,
                    top + size - symbolInset,
                    left + size - symbolInset,
                    top + symbolInset,
                    color,
                    symbolWidth,
                    {
                        className:
                            "breaker-auto-symbol"
                    }
                );

            group.appendChild(
                diagonalOne
            );

            group.appendChild(
                diagonalTwo
            );

            return;
        }

        //==================================================
        // DJ FECHADO COM OPERAÃ‡ÃƒO AUTOMÃTICA
        // X BRANCO SOBRE CORPO VERMELHO
        //==================================================

        if (
            state ===
            this.STATES.CLOSED_AUTO
        ) {

            const diagonalOne =
                this.line(
                    left + symbolInset,
                    top + symbolInset,
                    left + size - symbolInset,
                    top + size - symbolInset,
                    "#ffffff",
                    symbolWidth,
                    {
                        className:
                            "breaker-auto-symbol"
                    }
                );

            const diagonalTwo =
                this.line(
                    left + symbolInset,
                    top + size - symbolInset,
                    left + size - symbolInset,
                    top + symbolInset,
                    "#ffffff",
                    symbolWidth,
                    {
                        className:
                            "breaker-auto-symbol"
                    }
                );

            group.appendChild(
                diagonalOne
            );

            group.appendChild(
                diagonalTwo
            );

            return;
        }

        //==================================================
        // FECHADO COM DESLIGAMENTO POR SUBTENSÃƒO
        // CORPO VERMELHO / DIAGONAL BRANCA
        //==================================================

        if (
            state ===
                this.STATES
                    .CLOSED_UNDERVOLTAGE_TRIP ||
            state ===
                this.STATES
                    .OPEN_UNDERVOLTAGE_TRIP
        ) {

            const isOpenUndervoltageTrip =
                state ===
                this.STATES
                    .OPEN_UNDERVOLTAGE_TRIP;

            const halfColor =
                isOpenUndervoltageTrip
                    ? "#000000"
                    : "#d60000";

            const dividerColor =
                isOpenUndervoltageTrip
                    ? "#000000"
                    : "#ffffff";

            const inset =
                Math.max(
                    1,
                    strokeWidth
                );

            /*
             * MantÃ©m toda a indicaÃ§Ã£o interna vermelha.
             */
            const blackHalf =
                this.create(
                    "path"
                );

            blackHalf.setAttribute(
                "d",
                [
                    `M ${left + inset} ${top + inset}`,
                    `L ${left + size - inset} ${top + inset}`,
                    `L ${left + inset} ${top + size - inset}`,
                    "Z"
                ].join(" ")
            );

            blackHalf.setAttribute(
                "fill",
                halfColor
            );

            blackHalf.setAttribute(
                "stroke",
                "none"
            );

            blackHalf.style.setProperty(
                "fill",
                halfColor,
                "important"
            );

            blackHalf.classList.add(
                "breaker-undervoltage-half"
            );

            group.appendChild(
                blackHalf
            );

            /*
             * Linha diagonal de separaÃ§Ã£o.
             */
            const divider =
                this.line(
                    left + inset,
                    top + size - inset,
                    left + size - inset,
                    top + inset,
                    dividerColor,
                    Math.max(
                        1.2,
                        strokeWidth
                    ),
                    {
                        className:
                            "breaker-undervoltage-divider"
                    }
                );

            divider.style.setProperty(
                "stroke",
                dividerColor,
                "important"
            );

            group.appendChild(
                divider
            );

            return;
        }

        //==================================================
        // INTERTRAVAMENTO
        //==================================================

        if (
            state ===
            this.STATES.INTERLOCKED
        ) {

            const lockLineOne =
                this.line(
                    left + symbolInset,
                    top + symbolInset,
                    left + size - symbolInset,
                    top + size - symbolInset,
                    color,
                    symbolWidth,
                    {
                        className:
                            "breaker-lock-symbol"
                    }
                );

            const lockLineTwo =
                this.line(
                    left + size - symbolInset,
                    top + symbolInset,
                    left + symbolInset,
                    top + size - symbolInset,
                    color,
                    symbolWidth,
                    {
                        className:
                            "breaker-lock-symbol"
                    }
                );

            group.appendChild(
                lockLineOne
            );

            group.appendChild(
                lockLineTwo
            );
        }
    }

    //==================================================
    // POSIÃ‡ÃƒO DA IDENTIFICAÃ‡ÃƒO
    //==================================================

    static getLabelPosition(
        x,
        y,
        size,
        position,
        offset
    ) {

        switch (position) {

            case "left":

                return {

                    x:
                        x -
                        size / 2 -
                        offset,

                    y:
                        y + 6,

                    anchor:
                        "end"
                };

            case "top":

                return {

                    x,

                    y:
                        y -
                        size / 2 -
                        offset,

                    anchor:
                        "middle"
                };

            case "bottom":

                return {

                    x,

                    y:
                        y +
                        size / 2 +
                        offset +
                        12,

                    anchor:
                        "middle"
                };

            default:

                return {

                    x:
                        x +
                        size / 2 +
                        offset,

                    y:
                        y + 6,

                    anchor:
                        "start"
                };
        }
    }

    //==================================================
    // POSIÃ‡ÃƒO DA TEMPORIZAÃ‡ÃƒO
    //==================================================

    static getTimePosition(
        x,
        y,
        size,
        position
    ) {

        switch (position) {

            case "top":

                return {

                    x,

                    y:
                        y -
                        size / 2 -
                        12
                };

            case "left":

                return {

                    x:
                        x -
                        size / 2 -
                        30,

                    y:
                        y + 6
                };

            case "right":

                return {

                    x:
                        x +
                        size / 2 +
                        30,

                    y:
                        y + 6
                };

            default:

                return {

                    x,

                    y:
                        y +
                        size / 2 +
                        24
                };
        }
    }

}
