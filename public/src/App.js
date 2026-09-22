// APP.JS - VERSAO 2 - CAIXA DE SELECAO DE CENARIOS
// Se esta mensagem aparece na primeira linha, o arquivo correto foi copiado.

import { Renderer } from "./Renderer.js";
import { ScenarioNormal } from "./ScenarioNormal.js";
import { Scenario01 } from "./Scenario01.js";
import { Scenario02 } from "./Scenario02.js";
import { loadActiveScenario } from "./ScenarioActive.js";
import { EventLog } from "./EventLog.js";
import { EventPrint } from "./EventPrint.js";
import { Engine } from "./Engine.js";
import { UGSimulator } from "./UGSimulator.js";

export const App = {

    clockTimer: null,

    selectedScenario: "normal",

    scenarioDescriptions: {
        normal: "CONFIGURAÇÃO NORMAL DO SISTEMA",
        scenario1: "FONTE DA UG-01 INDISPONÍVEL DEVIDO À MODERNIZAÇÃO",
        scenario2: "FONTE DA UG-02 INDISPONÍVEL DEVIDO À MODERNIZAÇÃO",
        scenario3: "CENÁRIO 3 — AGUARDANDO CONFIGURAÇÃO",
        scenario4: "CENÁRIO 4 — AGUARDANDO CONFIGURAÇÃO"
    },

    sidePanelFitTimer: null,

    eventLogResizeState: null,

    eventLogPointerMoveHandler: null,

    eventLogPointerUpHandler: null,

    //==================================================
    // INICIALIZACAO
    //==================================================

    start() {

        const app =
            document.getElementById("app");

        if (!app) {

            console.error(
                "[App] Elemento #app n\u00e3o encontrado."
            );

            return;
        }

        app.innerHTML = `

            <div id="scada">

                <header id="topbar">

                    <div class="logo">
                        SCADA &bull; UHE ILHA SOLTEIRA
                    </div>

                    <div class="title">
                        SERVI&Ccedil;O AUXILIAR CA
                    </div>

                    <div class="topbarControls">

                        <button
                            id="zoomIn"
                            class="controlButton"
                            type="button"
                            title="Aumentar zoom"
                            aria-label="Aumentar zoom"
                        >
                            +
                        </button>

                        <button
                            id="zoomOut"
                            class="controlButton"
                            type="button"
                            title="Diminuir zoom"
                            aria-label="Diminuir zoom"
                        >
                            &minus;
                        </button>

                        <button
                            id="fitDiagram"
                            class="controlButton"
                            type="button"
                            title="Enquadrar diagrama"
                        >
                            AJUSTAR
                        </button>

                        <button
                            id="openUGSimulator"
                            class="controlButton"
                            type="button"
                            title="Abrir simulador operacional da UG-01"
                        >
                            SIMULADOR UG
                        </button>

                        <button
                            id="blackoutMode"
                            class="controlButton"
                            type="button"
                            title="Simular blackout com desligamento sequencial das UGs"
                            aria-label="Simular blackout"
                        >
                            BLACKOUT
                        </button>

                        <button
                            id="normalMode"
                            class="controlButton"
                            type="button"
                            title="Restaurar configura&ccedil;&atilde;o normal"
                            aria-label="Restaurar configura&ccedil;&atilde;o normal"
                        >
                            NORMAL
                        </button>

                    </div>

                    <div id="clock">
                        00:00:00
                    </div>

                </header>

                <div id="workspace">

                    <button
                        id="toggleLeftPanel"
                        class="sidePanelToggle sidePanelToggleLeft"
                        type="button"
                        title="Recolher painel de opera&ccedil;&atilde;o"
                        aria-label="Recolher painel de opera&ccedil;&atilde;o"
                        aria-controls="leftPanel"
                        aria-expanded="true"
                    >
                        <span class="sidePanelToggleIcon" aria-hidden="true">&lsaquo;</span>
                        <span class="sidePanelToggleText">OPERA&Ccedil;&Atilde;O</span>
                    </button>

                    <aside id="leftPanel">

                        <h2>OPERA&Ccedil;&Atilde;O</h2>

                        <div class="panelSection">

                            <span class="sectionLabel">
                                Cen&aacute;rio
                            </span>

                            <select
                                id="scenarioSelect"
                                class="scenarioSelect"
                                aria-label="Selecionar cenário de operação"
                                title="Selecionar cenário de operação"
                                style="
                                    width: 100%;
                                    margin-top: 5px;
                                    padding: 8px 30px 8px 9px;
                                    color: #ffffff;
                                    background: #29465f;
                                    border: 1px solid #4f7592;
                                    border-radius: 5px;
                                    font: inherit;
                                    font-weight: 700;
                                    cursor: pointer;
                                    outline: none;
                                "
                            >
                                <option value="normal" selected>Normal</option>
                                <option value="scenario1">Cenário 1</option>
                                <option value="scenario2">Cenário 2</option>
                                <option value="scenario3">Cenário 3</option>
                                <option value="scenario4">Cenário 4</option>
                            </select>

                        </div>

                        <div class="panelSection">

                            <span class="sectionLabel">
                                Navega&ccedil;&atilde;o
                            </span>

                            <button
                                id="focusUpper"
                                class="menuButton"
                                type="button"
                            >
                                Fontes e UGs
                            </button>

                            <button
                                id="focusMainPanels"
                                class="menuButton"
                                type="button"
                            >
                                1QP / 3QP
                            </button>

                            <button
                                id="focusPcaPanels"
                                class="menuButton"
                                type="button"
                            >
                                Pain&eacute;is pCA
                            </button>

                            <button
                                id="focusAuxPanels"
                                class="menuButton"
                                type="button"
                            >
                                Pain&eacute;is auxiliares
                            </button>

                        </div>

                        <div class="panelSection breakerLegend">

                            <span class="sectionLabel">
                                Legenda dos disjuntores
                            </span>

                            <div class="legendItem">

                                <span
                                    class="breakerSymbol breakerNormal"
                                    aria-hidden="true"
                                ></span>

                                <span class="legendText">
                                    Disjuntor normalmente ligado
                                </span>

                            </div>

                            <div class="legendItem">

                                <span
                                    class="breakerSymbol breakerNoVoltage"
                                    aria-hidden="true"
                                >
                                    <span class="breakerDiagonal"></span>
                                </span>

                                <span class="legendText">
                                    Ligado &mdash; desliga-se por falta de tens&atilde;o
                                </span>

                            </div>

                            <div class="legendItem">

                                <span
                                    class="breakerSymbol breakerAutomatic"
                                    aria-hidden="true"
                                >
                                    <span
                                        class="breakerAutoLine breakerAutoLineOne"
                                    ></span>

                                    <span
                                        class="breakerAutoLine breakerAutoLineTwo"
                                    ></span>
                                </span>

                                <span class="legendText">
                                    Ligado com opera&ccedil;&atilde;o autom&aacute;tica
                                </span>

                            </div>

                        </div>

                    </aside>

                    <main id="diagramArea">

                        <svg
                            id="svgDiagram"
                            xmlns="http://www.w3.org/2000/svg"
                            preserveAspectRatio="xMidYMid meet"
                            role="img"
                            aria-label="Diagrama do Servi&ccedil;o Auxiliar CA da UHE Ilha Solteira"
                        ></svg>

                        <section
                            id="eventLogPanel"
                            aria-label="&Uacute;ltimos eventos do sistema"
                        >

                            <div class="eventLogHeader">

                                <span class="eventLogTitle">
                                    EVENTOS DO SISTEMA
                                </span>

                                <div class="eventLogHeaderActions">

                                    <button
                                        id="printEventLog"
                                        class="eventLogPrintButton"
                                        type="button"
                                        title="Imprimir lista de eventos"
                                        aria-label="Imprimir lista de eventos"
                                    >
                                        IMPRIMIR
                                    </button>

                                    <span
                                        id="eventLogCounter"
                                        class="eventLogCounter"
                                    >
                                        0 EVENTOS
                                    </span>

                                </div>

                            </div>

                            <div
                                id="eventLogList"
                                class="eventLogList"
                                role="log"
                                aria-live="polite"
                                aria-relevant="additions"
                            ></div>

                        </section>

                    </main>

                    <button
                        id="toggleRightPanel"
                        class="sidePanelToggle sidePanelToggleRight"
                        type="button"
                        title="Recolher painel de status"
                        aria-label="Recolher painel de status"
                        aria-controls="rightPanel"
                        aria-expanded="true"
                    >
                        <span class="sidePanelToggleIcon" aria-hidden="true">&rsaquo;</span>
                        <span class="sidePanelToggleText">STATUS</span>
                    </button>

                    <aside id="rightPanel">

                        <h2>STATUS</h2>

                        <div class="statusItem">

                            <span>UG-01</span>

                            <strong class="statusAvailable">
                                DISPON&Iacute;VEL
                            </strong>

                        </div>

                        <div class="statusItem">

                            <span>UG-02</span>

                            <strong class="statusAvailable">
                                DISPON&Iacute;VEL
                            </strong>

                        </div>

                        <div class="statusItem">

                            <span>UG-11</span>

                            <strong class="statusAvailable">
                                DISPON&Iacute;VEL
                            </strong>

                        </div>

                        <div class="statusItem">

                            <span>UG-12</span>

                            <strong class="statusAvailable">
                                DISPON&Iacute;VEL
                            </strong>

                        </div>

                        <div class="documentationPanel">

                            <span class="documentationTitle">
                                DOCUMENTA&Ccedil;&Atilde;O
                            </span>

                            <div class="documentationMain">
                                TTRI-O-ACAD-A4-533
                            </div>

                            <div class="documentationRevision">
                                REV. 22 &bull; 26/06/2026
                            </div>

                            <div class="documentationItem">

                                <span>
                                    Atualiza&ccedil;&atilde;o
                                </span>

                                <strong>
                                    Thiago Stiegert Faier
                                </strong>

                            </div>

                            <div class="documentationItem">

                                <span>
                                    Confer&ecirc;ncia
                                </span>

                                <strong>
                                    C&eacute;sar A. S. Andrade
                                </strong>

                            </div>

                            <div class="documentationItem">

                                <span>
                                    Aprova&ccedil;&atilde;o
                                </span>

                                <strong>
                                    Ernandes C. de Souza
                                </strong>

                            </div>

                        </div>

                    </aside>

                </div>

                <footer id="statusbar">

                    <div class="statusbarScenario">

                        <strong id="statusbarScenarioName">
                            NORMAL
                        </strong>

                        <span class="statusbarSeparator">
                            |
                        </span>

                        <span id="statusbarScenarioDescription">
                            CONFIGURA&Ccedil;&Atilde;O NORMAL DO SISTEMA
                        </span>

                    </div>

                    <div
                        id="systemStatus"
                        class="statusbarOnline"
                    >
                        ONLINE
                    </div>

                </footer>

            </div>
        `;

        this.clock();

        EventLog.initialize(
            "eventLogList"
        );

        loadActiveScenario(ScenarioNormal);

        Renderer.initialize(
            "svgDiagram"
        );

        Engine.initialize({

            transferDelay: 3000,

            onStateChange: () => {
                Renderer.render();
            }
        });

        /*
         * IMPORTANTE:
         * O Renderer faz o primeiro desenho antes do Engine terminar
         * de aplicar as transferências automáticas dos quadros auxiliares.
         *
         * No CMCS, por exemplo, os DJs 256/257 partem com estado base
         * "openAuto". Durante Engine.initialize(), propagateColors()
         * identifica as fontes 7 e 33 energizadas e fecha a fonte normal.
         *
         * Este render adicional garante que o estado calculado pelo Engine
         * apareça imediatamente na abertura do simulador, sem precisar
         * clicar ou trocar de cenário.
         */
        Renderer.render();

        UGSimulator.initialize();

        // Abertura garantida da primeira tela do modulo UG.
        // Mantemos este botao independente do SVG para nao depender
        // de eventos de clique/zoom/camadas do diagrama principal.
        const openUGSimulatorButton = document.getElementById("openUGSimulator");
        if (openUGSimulatorButton) {
            openUGSimulatorButton.addEventListener("click", () => {
                UGSimulator.open("UG01");
            });
        }

        this.initializeEventLogResize();

        this.bindControls();
    },

    //==================================================
    // RELOGIO
    //==================================================

    clock() {

        const clock =
            document.getElementById("clock");

        if (!clock) {
            return;
        }

        if (this.clockTimer) {

            clearInterval(
                this.clockTimer
            );
        }

        const update = () => {

            clock.textContent =
                new Date().toLocaleTimeString(
                    "pt-BR",
                    {
                        hour12: false
                    }
                );
        };

        update();

        this.clockTimer =
            setInterval(
                update,
                1000
            );
    },

    //==================================================
    // CONTROLES DA INTERFACE
    //==================================================

    bindControls() {

        const navigation =
            Renderer.navigation;

        if (!navigation) {

            console.warn(
                "[App] Navega\u00e7\u00e3o ainda n\u00e3o dispon\u00edvel."
            );

            return;
        }

        this.bindButton(
            "zoomIn",
            () => navigation.zoomIn()
        );

        this.bindButton(
            "zoomOut",
            () => navigation.zoomOut()
        );

        this.bindButton(
            "fitDiagram",
            () => navigation.fit()
        );

        this.bindButton(
            "printEventLog",
            () => {
                EventPrint.open({
                    scenarioName:
                        document.getElementById("statusbarScenarioName")
                            ?.textContent?.trim() || "NORMAL",

                    scenarioDescription:
                        document.getElementById("statusbarScenarioDescription")
                            ?.textContent?.trim() || ""
                });
            }
        );

        this.bindButton(
            "blackoutMode",
            () => Engine.startBlackoutSimulation()
        );

        this.bindButton(
            "normalMode",
            () => {
                const scenarioSelect =
                    document.getElementById("scenarioSelect");

                if (scenarioSelect) {
                    scenarioSelect.value = "normal";
                }

                this.selectScenario("normal");
            }
        );

        this.bindButton(
            "toggleLeftPanel",
            () => this.toggleSidePanel("left")
        );

        this.bindButton(
            "toggleRightPanel",
            () => this.toggleSidePanel("right")
        );

        this.bindButton(
            "focusUpper",
            () => navigation.focusUpperArea()
        );

        this.bindButton(
            "focusMainPanels",
            () => navigation.focusMainPanels()
        );

        this.bindButton(
            "focusPcaPanels",
            () => navigation.focusPcaPanels()
        );

        this.bindButton(
            "focusAuxPanels",
            () => navigation.focusAuxPanels()
        );

        const scenarioSelect =
            document.getElementById("scenarioSelect");

        if (scenarioSelect) {

            scenarioSelect.value =
                this.selectedScenario;

            scenarioSelect.addEventListener(
                "change",
                event => this.selectScenario(event.target.value)
            );
        }
    },

    //==================================================
    // SELECAO DE CENARIO
    // As logicas eletricas serao vinculadas posteriormente.
    //==================================================

    selectScenario(scenarioId) {

        const scenarioNames = {
            normal: "NORMAL",
            scenario1: "CENÁRIO 1",
            scenario2: "CENÁRIO 2",
            scenario3: "CENÁRIO 3",
            scenario4: "CENÁRIO 4"
        };

        if (!scenarioNames[scenarioId]) {
            return;
        }

        const scenarios = {
            normal: ScenarioNormal,
            scenario1: Scenario01,
            scenario2: Scenario02
        };

        const scenario =
            scenarios[scenarioId];

        // Cenários 3 e 4 ainda estão reservados.
        // Não carregamos outro cenário por engano enquanto
        // eles não tiverem arquivos próprios.
        if (!scenario) {
            return;
        }

        Engine.loadScenario(scenario);

        this.selectedScenario = scenarioId;

        const statusbarName =
            document.getElementById("statusbarScenarioName");

        const statusbarDescription =
            document.getElementById("statusbarScenarioDescription");

        if (statusbarName) {
            statusbarName.textContent = scenarioNames[scenarioId];
        }

        if (statusbarDescription) {
            statusbarDescription.textContent =
                this.scenarioDescriptions[scenarioId] || "";
        }
    },

    //==================================================
    // PAINEIS LATERAIS RECOLHIVEIS
    //==================================================

    toggleSidePanel(side) {

        const workspace =
            document.getElementById("workspace");

        const isLeft =
            side === "left";

        const button =
            document.getElementById(
                isLeft
                    ? "toggleLeftPanel"
                    : "toggleRightPanel"
            );

        if (!workspace || !button) {
            return;
        }

        const collapsedClass =
            isLeft
                ? "leftPanelCollapsed"
                : "rightPanelCollapsed";

        const collapsed =
            workspace.classList.toggle(
                collapsedClass
            );

        const panelName =
            isLeft
                ? "opera\u00e7\u00e3o"
                : "status";

        button.setAttribute(
            "aria-expanded",
            collapsed
                ? "false"
                : "true"
        );

        button.setAttribute(
            "aria-label",
            `${collapsed ? "Abrir" : "Recolher"} painel de ${panelName}`
        );

        button.title =
            `${collapsed ? "Abrir" : "Recolher"} painel de ${panelName}`;

        const icon =
            button.querySelector(
                ".sidePanelToggleIcon"
            );

        if (icon) {

            icon.textContent =
                isLeft
                    ? (collapsed ? "\u203a" : "\u2039")
                    : (collapsed ? "\u2039" : "\u203a");
        }

        if (this.sidePanelFitTimer) {

            clearTimeout(
                this.sidePanelFitTimer
            );
        }

        this.sidePanelFitTimer =
            setTimeout(
                () => {

                    window.dispatchEvent(
                        new Event("resize")
                    );

                    Renderer.navigation
                        ?.fit?.();
                },
                300
            );
    },

    //==================================================
    // ALTURA DA BARRA DE EVENTOS CONTROLADA PELO MOUSE
    //==================================================

    initializeEventLogResize() {

        const panel =
            document.getElementById("eventLogPanel");

        const header =
            panel?.querySelector(".eventLogHeader");

        const list =
            document.getElementById("eventLogList");

        if (!panel || !header || !list) {
            return;
        }

        let handle =
            document.getElementById("eventLogResizeHandle");

        if (!handle) {

            handle = document.createElement("button");
            handle.id = "eventLogResizeHandle";
            handle.type = "button";
            handle.textContent = "\u2195";
            handle.title =
                "Arraste para aumentar ou diminuir as linhas de eventos";
            handle.setAttribute(
                "aria-label",
                "Arraste para ajustar as linhas de eventos"
            );

            Object.assign(
                handle.style,
                {
                    flex: "0 0 24px",
                    width: "24px",
                    minWidth: "24px",
                    height: "18px",
                    margin: "0 0 0 6px",
                    padding: "0",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#4fd8ff",
                    background: "#29435a",
                    border: "1px solid #4fd8ff",
                    borderRadius: "4px",
                    cursor: "ns-resize",
                    touchAction: "none",
                    fontSize: "13px",
                    fontWeight: "900",
                    lineHeight: "1",
                    position: "relative",
                    zIndex: "20"
                }
            );

            header.appendChild(handle);
        }

        handle.addEventListener(
            "pointerdown",
            event => this.startEventLogResize(event)
        );

        handle.addEventListener(
            "dblclick",
            () => this.resetEventLogHeight()
        );

        this.eventLogPointerMoveHandler =
            event => this.resizeEventLog(event);

        this.eventLogPointerUpHandler =
            event => this.finishEventLogResize(event);

        window.addEventListener(
            "pointermove",
            this.eventLogPointerMoveHandler
        );

        window.addEventListener(
            "pointerup",
            this.eventLogPointerUpHandler
        );
    },

    startEventLogResize(event) {

        if (event.button !== 0) {
            return;
        }

        const panel =
            document.getElementById("eventLogPanel");

        const list =
            document.getElementById("eventLogList");

        const header =
            panel?.querySelector(".eventLogHeader");

        const diagramArea =
            document.getElementById("diagramArea");

        if (!panel || !list || !header || !diagramArea) {
            return;
        }

        event.preventDefault();

        const rowHeight =
            Math.ceil(
                list.querySelector(".eventItem")
                    ?.getBoundingClientRect?.()
                    .height || 22
            );

        const headerHeight =
            header.offsetHeight || 24;

        this.eventLogResizeState = {
            pointerId: event.pointerId,
            startY: event.clientY,
            startHeight: panel.getBoundingClientRect().height,
            rowHeight,
            headerHeight,
            minHeight: headerHeight + rowHeight + 6,
            maxHeight: Math.max(
                headerHeight + rowHeight + 6,
                Math.floor(diagramArea.clientHeight * 0.72)
            )
        };

        panel.style.transition = "none";
        document.body.style.cursor = "ns-resize";
        document.body.style.userSelect = "none";

        event.currentTarget
            ?.setPointerCapture?.(event.pointerId);
    },

    resizeEventLog(event) {

        const state =
            this.eventLogResizeState;

        const panel =
            document.getElementById("eventLogPanel");

        if (!state || !panel || event.pointerId !== state.pointerId) {
            return;
        }

        event.preventDefault();

        const requestedHeight =
            state.startHeight +
            state.startY -
            event.clientY;

        const rows =
            Math.max(
                1,
                Math.round(
                    (
                        requestedHeight -
                        state.headerHeight -
                        6
                    ) / state.rowHeight
                )
            );

        const snappedHeight =
            state.headerHeight +
            rows * state.rowHeight +
            6;

        const height =
            Math.min(
                state.maxHeight,
                Math.max(state.minHeight, snappedHeight)
            );

        panel.style.height = `${height}px`;

        document
            .getElementById("eventLogResizeHandle")
            ?.setAttribute(
                "aria-valuetext",
                `${rows} linhas vis\u00edveis`
            );
    },

    finishEventLogResize(event) {

        const state =
            this.eventLogResizeState;

        if (!state || event.pointerId !== state.pointerId) {
            return;
        }

        this.eventLogResizeState = null;

        const panel =
            document.getElementById("eventLogPanel");

        if (panel) {
            panel.style.transition = "height 90ms ease-out";
        }

        document.body.style.cursor = "";
        document.body.style.userSelect = "";
    },

    resetEventLogHeight() {

        const panel =
            document.getElementById("eventLogPanel");

        if (panel) {
            panel.style.height = "";
        }

        document
            .getElementById("eventLogResizeHandle")
            ?.setAttribute(
                "aria-valuetext",
                "Altura padr\u00e3o"
            );
    },

    //==================================================
    // VINCULACAO SEGURA DOS BOTOES
    //==================================================

    bindButton(
        elementId,
        callback
    ) {

        const button =
            document.getElementById(
                elementId
            );

        if (!button) {

            console.warn(
                `[App] Bot\u00e3o n\u00e3o encontrado: ${elementId}`
            );

            return;
        }

        button.addEventListener(
            "click",
            callback
        );
    },

    //==================================================
    // ENCERRAMENTO
    //==================================================

    destroy() {

        if (this.clockTimer) {

            clearInterval(
                this.clockTimer
            );

            this.clockTimer = null;
        }

        if (this.sidePanelFitTimer) {

            clearTimeout(
                this.sidePanelFitTimer
            );

            this.sidePanelFitTimer = null;
        }

        if (this.eventLogPointerMoveHandler) {

            window.removeEventListener(
                "pointermove",
                this.eventLogPointerMoveHandler
            );
        }

        if (this.eventLogPointerUpHandler) {

            window.removeEventListener(
                "pointerup",
                this.eventLogPointerUpHandler
            );
        }

        this.eventLogResizeState = null;
        this.eventLogPointerMoveHandler = null;
        this.eventLogPointerUpHandler = null;

        document.body.style.cursor = "";
        document.body.style.userSelect = "";

        EventLog.destroy();

        Engine.destroy();

        Renderer.navigation
            ?.destroy?.();
    }
};
