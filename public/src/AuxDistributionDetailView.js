import { AuxDistributionDetailDatabase } from "./AuxDistributionDetailDatabase.js";
import { Engine } from "./Engine.js";

export class AuxDistributionDetailView {

    static overlay = null;
    static content = null;
    static panelData = null;
    static definition = null;
    static states = new Map();
    static autoTimers = new Map();
    static stateListener = null;

    static open(panelData = {}) {
        const definition =
            AuxDistributionDetailDatabase.get(panelData.id ?? panelData.label);

        if (!definition) {
            console.warn(
                `[AuxDistributionDetailView] Painel sem diagrama interno: ${panelData.id ?? panelData.label}`
            );
            return false;
        }

        this.close();
        this.panelData = panelData;
        this.definition = definition;
        this.getState();

        const overlay = document.createElement("section");
        overlay.id = "aux-distribution-detail-overlay";
        overlay.className = "aux-distribution-detail-overlay";
        overlay.tabIndex = -1;
        overlay.innerHTML = `
            <style>
                .aux-distribution-detail-overlay {
                    position: fixed;
                    inset: 0;
                    z-index: 100000;
                    display: grid;
                    grid-template-rows: 50px minmax(0, 1fr) 31px;
                    background: #f6f9fb;
                    color: #172b3a;
                    font-family: "Segoe UI", Arial, sans-serif;
                }

                .aux-dist-header,
                .aux-dist-footer {
                    background: #193247;
                    color: #ffffff;
                    display: flex;
                    align-items: center;
                    border: 1px solid #355a73;
                }

                .aux-dist-header {
                    display: grid;
                    grid-template-columns: 190px 1fr 360px;
                    gap: 12px;
                    padding: 7px 10px;
                }

                .aux-dist-title {
                    text-align: center;
                    font-weight: 800;
                    letter-spacing: .02em;
                }

                .aux-dist-header-actions {
                    display: flex;
                    justify-content: flex-end;
                    align-items: center;
                    gap: 8px;
                    font-size: 12px;
                    font-weight: 800;
                }

                .aux-dist-button {
                    min-height: 32px;
                    padding: 5px 14px;
                    border: 1px solid #63839a;
                    border-radius: 4px;
                    background: #213f56;
                    color: #ffffff;
                    font-weight: 800;
                    cursor: pointer;
                }

                .aux-dist-button:hover,
                .aux-dist-button:focus-visible {
                    background: #2e5a77;
                    outline: 2px solid #61d7ff;
                    outline-offset: 1px;
                }

                .aux-dist-mode[data-mode="MANUAL"] {
                    background: #7d5b00;
                    border-color: #ffd55e;
                }

                .aux-dist-live {
                    color: #50ff9a;
                    white-space: nowrap;
                }

                .aux-dist-content {
                    min-height: 0;
                    overflow: auto;
                    padding: 20px 24px 34px;
                }

                .aux-dist-card {
                    width: min(1840px, 100%);
                    min-width: 1080px;
                    margin: 0 auto;
                    border: 1px solid #9db0bd;
                    border-radius: 12px;
                    background: #ffffff;
                    box-shadow: 0 5px 18px rgba(21, 50, 69, .08);
                    overflow: hidden;
                }

                .aux-dist-card-title {
                    padding: 17px 20px 8px;
                    text-align: center;
                }

                .aux-dist-card-title h1 {
                    margin: 0;
                    font-size: 28px;
                    color: #153248;
                }

                .aux-dist-card-title p {
                    margin: 6px 0 0;
                    color: #526b7c;
                    font-weight: 600;
                }

                .aux-dist-summary {
                    display: flex;
                    justify-content: center;
                    gap: 10px;
                    flex-wrap: wrap;
                    padding: 8px 16px 14px;
                }

                .aux-dist-chip {
                    padding: 6px 10px;
                    border: 1px solid #b9c8d2;
                    border-radius: 999px;
                    background: #f6f9fb;
                    font-size: 12px;
                    font-weight: 800;
                }

                .aux-dist-one-line {
                    display: block;
                    width: 100%;
                    height: auto;
                    border-top: 1px solid #d5e0e7;
                    border-bottom: 1px solid #d5e0e7;
                    background: #ffffff;
                }

                .aux-dist-command {
                    cursor: pointer;
                }

                .aux-dist-command:hover .command-outline,
                .aux-dist-command:focus .command-outline {
                    stroke: #00a8e8;
                    stroke-width: 4;
                }

                .aux-dist-footer {
                    justify-content: center;
                    font-size: 11px;
                    font-weight: 800;
                }

                @media (max-width: 1180px) {
                    .aux-dist-header {
                        grid-template-columns: 150px 1fr 310px;
                    }

                    .aux-dist-content {
                        padding-inline: 10px;
                    }
                }
            </style>

            <header class="aux-dist-header">
                <button class="aux-dist-button" data-action="back">\u2190 VOLTAR</button>
                <div class="aux-dist-title"></div>
                <div class="aux-dist-header-actions">
                    <button class="aux-dist-button aux-dist-mode" data-action="mode"></button>
                    <button class="aux-dist-button" data-action="reset">REPOR NORMAL</button>
                    <span class="aux-dist-live"></span>
                </div>
            </header>

            <main class="aux-dist-content"></main>

            <footer class="aux-dist-footer">
                SCADA \u2022 UHE ILHA SOLTEIRA \u2022 SERVI\u00c7O AUXILIAR CA
            </footer>
        `;

        document.body.appendChild(overlay);
        this.overlay = overlay;
        this.content = overlay.querySelector(".aux-dist-content");

        overlay
            .querySelector('[data-action="back"]')
            .addEventListener("click", () => this.close());

        overlay
            .querySelector('[data-action="mode"]')
            .addEventListener("click", () => this.toggleMode());

        overlay
            .querySelector('[data-action="reset"]')
            .addEventListener("click", () => this.reset());

        overlay.addEventListener("keydown", event => {
            if (event.key === "Escape") {
                event.preventDefault();
                this.close();
            }
        });

        this.stateListener = () => this.render();
        window.addEventListener("scada:state-changed", this.stateListener);
        window.addEventListener("scada:panel-mode-changed", this.stateListener);

        this.render();
        overlay.focus();
        return true;
    }

    static close() {
        this.cancelAutoTimer();

        if (this.stateListener) {
            window.removeEventListener("scada:state-changed", this.stateListener);
            window.removeEventListener("scada:panel-mode-changed", this.stateListener);
        }

        this.stateListener = null;
        this.overlay?.remove();
        this.overlay = null;
        this.content = null;
        this.panelData = null;
        this.definition = null;
    }

    static getState() {
        const definition = this.definition;
        const panelData = this.panelData;
        if (!definition || !panelData) return null;

        if (!this.states.has(definition.id)) {
            const isClosed = value =>
                !["open", "openauto", "open-auto", "false"].includes(
                    String(value ?? "closed").toLowerCase()
                );

            const defaultLeftState =
                definition.defaultLeftClosed === false ? "open" : "closed";
            const defaultRightState =
                definition.defaultRightClosed === false ? "open" : "closed";

            this.states.set(definition.id, {
                leftClosed: isClosed(
                    panelData.leftBreakerState ?? defaultLeftState
                ),
                rightClosed: isClosed(
                    panelData.rightBreakerState ?? defaultRightState
                ),
                tieClosed: isClosed(panelData.mainBreakerState ?? "open"),
                transferring: false,
                transferText: ""
            });
        }

        return this.states.get(definition.id);
    }

    static isClosedState(value) {
        return ![
            "open",
            "openauto",
            "open-auto",
            "false"
        ].includes(
            String(value ?? "closed")
                .toLowerCase()
        );
    }

    static syncStateFromMainPanel() {
        const state = this.getState();
        const panelData = this.panelData;

        if (!state || !panelData) {
            return state;
        }

        state.leftClosed =
            this.isClosedState(
                panelData.leftBreakerState
            );

        state.rightClosed =
            this.isClosedState(
                panelData.rightBreakerState
            );

        state.tieClosed =
            this.isClosedState(
                panelData.mainBreakerState ??
                "open"
            );

        state.transferring =
            panelData.transferring === true;

        state.transferText =
            panelData.transferText ?? "";

        return state;
    }

    static getMode() {
        return String(this.panelData?.operationMode ?? "AUTO").toUpperCase() === "MANUAL"
            ? "MANUAL"
            : "AUTO";
    }

    static sourceStatus() {
        return {
            leftAvailable: this.panelData?.leftEnergized === true,
            rightAvailable: this.panelData?.rightEnergized === true,
            leftColor: this.panelData?.colorLeft ?? "#3f7cff",
            rightColor: this.panelData?.colorRight ?? "#35b95f",
            gaeEmergencyEnergized:
                this.panelData?.gaeEmergencyEnergized === true,
            gaeEmergencyColor:
                this.panelData?.gaeEmergencyColor ??
                Engine.gaeEmergencyColor ??
                "#00B8D9",
            gaeEmergencySource:
                this.panelData?.gaeEmergencySource ?? null
        };
    }

    static electricalState() {
        const state = this.getState();
        const source = this.sourceStatus();

        const directLeft = source.leftAvailable && state.leftClosed;
        const directRight = source.rightAvailable && state.rightClosed;

        /*
         * O GAE alimenta o barramento do quadro por uma terceira entrada.
         * Durante blackout as duas entradas normais podem estar sem tensão,
         * mas o painel continua energizado se o Engine sinalizar o GAE ativo.
         */
        if (source.gaeEmergencyEnergized) {
            return {
                ...source,
                directLeft,
                directRight,
                leftEnergized: true,
                rightEnergized: true,
                leftColor: source.gaeEmergencyColor,
                rightColor: source.gaeEmergencyColor,
                gaeFeeding: true
            };
        }

        const leftEnergized =
            directLeft ||
            (state.tieClosed && directRight);

        const rightEnergized =
            directRight ||
            (state.tieClosed && directLeft);

        const leftColor = directLeft
            ? source.leftColor
            : (state.tieClosed && directRight ? source.rightColor : "#9baab3");

        const rightColor = directRight
            ? source.rightColor
            : (state.tieClosed && directLeft ? source.leftColor : "#9baab3");

        return {
            ...source,
            directLeft,
            directRight,
            leftEnergized,
            rightEnergized,
            leftColor,
            rightColor,
            gaeFeeding: false
        };
    }

    static render() {
        if (!this.overlay || !this.content || !this.definition) return;

        if (
            Engine.hasAuxPanelTransfer?.(
                this.panelData?.id
            )
        ) {
            this.syncStateFromMainPanel();
        } else {
            this.applyAutomaticLogic();
        }

        const definition = this.definition;
        const state = this.getState();
        const electrical = this.electricalState();
        const mode = this.getMode();

        const title = this.overlay.querySelector(".aux-dist-title");
        const modeButton = this.overlay.querySelector('[data-action="mode"]');
        const live = this.overlay.querySelector(".aux-dist-live");

        title.textContent = `SIMULADOR ${definition.title} - DIAGRAMA VERTICAL REV.05`;
        modeButton.textContent = mode;
        modeButton.dataset.mode = mode;
        live.textContent = state.transferring
            ? state.transferText
            : this.getSupplyText(electrical);

        this.content.innerHTML = `
            <section class="aux-dist-card">
                <div class="aux-dist-card-title">
                    <h1>${this.escape(definition.title)} \u2022 ${this.escape(definition.voltage)}</h1>
                    <p>${this.escape(definition.subtitle)}</p>
                </div>

                <div class="aux-dist-summary">
                    <span class="aux-dist-chip">MODO ${mode}</span>
                    <span class="aux-dist-chip">${this.escape(this.getSupplyText(electrical))}</span>
                    ${
                        definition.layout === "single-bus-dual-incoming"
                            ? ""
                            : `<span class="aux-dist-chip">INTERLIGA\u00c7\u00c3O ${state.tieClosed ? "FECHADA" : "ABERTA"}</span>`
                    }
                </div>

                ${this.renderOneLine(definition, state, electrical)}
            </section>
        `;

        this.bindCommands();
    }

    static renderOneLine(definition, state, electrical) {
        if (definition.layout === "mixed-voltage") {
            return this.renderMixedVoltageDiagram(definition, state, electrical);
        }

        if (definition.layout === "four-section") {
            return this.renderFourSectionDiagram(definition, state, electrical);
        }

        if (definition.layout === "single-bus-dual-incoming") {
            return this.renderSingleBusDualIncoming(
                definition,
                state,
                electrical
            );
        }

        return this.renderVerticalDualBusDiagram(definition, state, electrical);
    }

    static renderVerticalDualBusDiagram(definition, state, electrical) {
        const busX = 680;
        const rowHeight = 45;
        const topRows = this.rowsForSection(definition.sections[1]?.id);
        const bottomRows = this.rowsForSection(definition.sections[0]?.id);
        const topStart = 70;
        const topEnd = topStart + Math.max(topRows.length, 1) * rowHeight;
        const generatorGap = definition.generator ? 108 : 0;
        const generatorInputY = definition.generator
            ? topEnd + 58
            : null;
        const reserveInputY = topEnd + 58 + generatorGap;
        const tieY = reserveInputY + 88;
        const normalInputY = tieY + 88;
        const bottomStart = normalInputY + 66;
        const bottomEnd = bottomStart + Math.max(bottomRows.length, 1) * rowHeight;
        const height = bottomEnd + 85;

        const topColor = electrical.rightEnergized
            ? electrical.rightColor
            : "#9baab3";
        const bottomColor = electrical.leftEnergized
            ? electrical.leftColor
            : "#9baab3";
        const reserveSourceColor = electrical.rightAvailable
            ? this.panelData?.colorRight ?? "#35b95f"
            : "#9baab3";
        const normalSourceColor = electrical.leftAvailable
            ? this.panelData?.colorLeft ?? "#3f7cff"
            : "#9baab3";

        return `
            <svg class="aux-dist-one-line" viewBox="0 0 1700 ${height}" role="img"
                 aria-label="Diagrama unifilar fiel do ${this.escape(definition.title)}">
                <rect x="22" y="20" width="1656" height="${height - 40}" rx="10"
                      fill="#ffffff" stroke="#91a8b6" stroke-width="2"/>

                ${this.renderPanelBadge(definition, 48, 48)}

                <line x1="${busX}" y1="${topStart - 18}" x2="${busX}" y2="${topEnd + 18}"
                      stroke="${topColor}" stroke-width="5"/>
                ${this.renderVerticalSectionLabel(
                    definition.sections[1]?.label ?? "BARRA II",
                    busX - 30,
                    (topStart + topEnd) / 2,
                    topColor
                )}
                ${this.renderOutputRows(topRows, {
                    busX,
                    startY: topStart,
                    color: topColor,
                    energized: electrical.rightEnergized
                })}

                ${
                    definition.generator
                        ? this.renderGeneratorIncoming({
                            y: generatorInputY,
                            generator: definition.generator,
                            busX,
                            busColor: topColor,
                            energized: electrical.gaeFeeding === true,
                            emergencyColor: electrical.gaeEmergencyColor
                        })
                        : ""
                }

                ${this.renderHorizontalIncoming({
                    action: "incoming-right",
                    y: reserveInputY,
                    data: definition.reserve,
                    sourceColor: reserveSourceColor,
                    busColor: topColor,
                    available: electrical.rightAvailable,
                    closed: state.rightClosed,
                    busX
                })}

                <line x1="${busX}" y1="${topEnd + 18}" x2="${busX}" y2="${tieY - 23}"
                      stroke="${topColor}" stroke-width="4"/>
                ${this.renderBreakerSvg({
                    action: "tie",
                    x: busX,
                    y: tieY,
                    closed: state.tieClosed,
                    label: definition.tieBreaker,
                    status: state.tieClosed
                        ? "FECHADO"
                        : `ABERTO \u2022 ${this.formatDelay(definition.tieDelayMs)}`,
                    color: state.tieClosed ? "#d60000" : "#3f505a",
                    labelSide: "right"
                })}
                <line x1="${busX}" y1="${tieY + 23}" x2="${busX}" y2="${normalInputY}"
                      stroke="${state.tieClosed ? bottomColor : "#9baab3"}" stroke-width="4"/>

                ${this.renderHorizontalIncoming({
                    action: "incoming-left",
                    y: normalInputY,
                    data: definition.normal,
                    sourceColor: normalSourceColor,
                    busColor: bottomColor,
                    available: electrical.leftAvailable,
                    closed: state.leftClosed,
                    busX
                })}

                <line x1="${busX}" y1="${normalInputY}" x2="${busX}" y2="${bottomEnd + 18}"
                      stroke="${bottomColor}" stroke-width="5"/>
                ${this.renderVerticalSectionLabel(
                    definition.sections[0]?.label ?? "BARRA I",
                    busX - 30,
                    (bottomStart + bottomEnd) / 2,
                    bottomColor
                )}
                ${this.renderOutputRows(bottomRows, {
                    busX,
                    startY: bottomStart,
                    color: bottomColor,
                    energized: electrical.leftEnergized
                })}

                <text x="850" y="${height - 28}" text-anchor="middle"
                      fill="#617887" font-size="13" font-weight="700">
                    Em MANUAL, clique em qualquer disjuntor para comand\u00e1-lo.
                </text>
            </svg>
        `;
    }

    static renderSingleBusDualIncoming(definition, state, electrical) {
        const busX = 680;
        const rowHeight = 45;
        const rows = this.rowsForSection("BUS");
        const upperRows = rows.slice(0, 1);
        const centerRows = rows.slice(1, -1);
        const lowerRows = rows.slice(-1);
        const topStart = 76;
        const reserveInputY =
            topStart + Math.max(upperRows.length, 1) * rowHeight + 48;
        const centerStart = reserveInputY + 72;
        const centerEnd =
            centerStart + Math.max(centerRows.length, 1) * rowHeight;
        const normalInputY = centerEnd + 62;
        const lowerStart = normalInputY + 70;
        const lowerEnd =
            lowerStart + Math.max(lowerRows.length, 1) * rowHeight;
        const height = lowerEnd + 82;
        const busEnergized =
            electrical.gaeFeeding === true ||
            electrical.directLeft ||
            electrical.directRight;
        const busColor = electrical.gaeFeeding === true
            ? electrical.gaeEmergencyColor
            : electrical.directLeft
                ? electrical.leftColor
                : (electrical.directRight ? electrical.rightColor : "#9baab3");
        const reserveSourceColor = electrical.rightAvailable
            ? this.panelData?.colorRight ?? "#35b95f"
            : "#9baab3";
        const normalSourceColor = electrical.leftAvailable
            ? this.panelData?.colorLeft ?? "#3f7cff"
            : "#9baab3";

        return `
            <svg class="aux-dist-one-line" viewBox="0 0 1700 ${height}" role="img"
                 aria-label="Diagrama unifilar do ${this.escape(definition.title)}">
                <rect x="22" y="20" width="1656" height="${height - 40}" rx="10"
                      fill="#ffffff" stroke="#91a8b6" stroke-width="2"/>

                ${this.renderPanelBadge(definition, 48, 48)}

                <line x1="${busX}" y1="${topStart - 18}" x2="${busX}" y2="${lowerEnd + 18}"
                      stroke="${busColor}" stroke-width="5"/>
                ${this.renderVerticalSectionLabel(
                    definition.sections[0]?.label ?? "BARRAMENTO CMCS",
                    busX - 30,
                    (topStart + lowerEnd) / 2,
                    busColor
                )}

                ${this.renderOutputRows(upperRows, {
                    busX,
                    startY: topStart,
                    color: busColor,
                    energized: busEnergized
                })}

                ${this.renderHorizontalIncoming({
                    action: "incoming-right",
                    y: reserveInputY,
                    data: definition.reserve,
                    sourceColor: reserveSourceColor,
                    busColor,
                    available: electrical.rightAvailable,
                    closed: state.rightClosed,
                    busX
                })}

                ${this.renderOutputRows(centerRows, {
                    busX,
                    startY: centerStart,
                    color: busColor,
                    energized: busEnergized
                })}

                ${this.renderHorizontalIncoming({
                    action: "incoming-left",
                    y: normalInputY,
                    data: definition.normal,
                    sourceColor: normalSourceColor,
                    busColor,
                    available: electrical.leftAvailable,
                    closed: state.leftClosed,
                    busX
                })}

                ${this.renderOutputRows(lowerRows, {
                    busX,
                    startY: lowerStart,
                    color: busColor,
                    energized: busEnergized
                })}

                <text x="850" y="${height - 28}" text-anchor="middle"
                      fill="#617887" font-size="13" font-weight="700">
                    Transfer\u00eancia autom\u00e1tica entre as entradas 1752-256 e 1752-257.
                </text>
            </svg>
        `;
    }

    static renderMixedVoltageDiagram(definition, state, electrical) {
        const busX = 690;
        const rowHeight = 53;
        const rows440 = this.rowsForSection("440");
        const rows220 = this.rowsForSection("220");
        const reserveInputY = 210;
        const topStart = 268;
        const topEnd = topStart + Math.max(rows440.length, 1) * rowHeight;
        const tieY = topEnd + 92;
        const transformerY = tieY + 76;
        const normalInputY = transformerY + 96;
        const bottomStart = normalInputY + 72;
        const bottomEnd = bottomStart + Math.max(rows220.length, 1) * rowHeight;
        const height = bottomEnd + 90;
        const color440 = electrical.rightEnergized
            ? electrical.rightColor
            : "#9baab3";
        const color220 = electrical.leftEnergized
            ? electrical.leftColor
            : "#9baab3";
        const reserveSourceColor = electrical.rightAvailable
            ? this.panelData?.colorRight ?? "#e53935"
            : "#9baab3";
        const normalSourceColor = electrical.leftAvailable
            ? this.panelData?.colorLeft ?? "#245cff"
            : "#9baab3";

        return `
            <svg class="aux-dist-one-line" viewBox="0 0 1700 ${height}" role="img"
                 aria-label="Diagrama misto 440 e 220 volts do ${this.escape(definition.title)}">
                <rect x="22" y="20" width="1656" height="${height - 40}" rx="10"
                      fill="#ffffff" stroke="#91a8b6" stroke-width="2"/>
                ${this.renderPanelBadge(definition, 48, 48)}

                ${this.renderSimpleIncoming({
                    action: "incoming-right",
                    y: reserveInputY,
                    data: definition.reserve,
                    sourceColor: reserveSourceColor,
                    busColor: color440,
                    available: electrical.rightAvailable,
                    closed: state.rightClosed,
                    busX
                })}
                <line x1="${busX}" y1="${reserveInputY}" x2="${busX}" y2="${topEnd + 18}"
                      stroke="${color440}" stroke-width="5"/>
                ${this.renderVerticalSectionLabel("BARRA 440 V", busX - 30, (topStart + topEnd) / 2, color440)}
                ${this.renderOutputRows(rows440, {
                    busX,
                    startY: topStart,
                    color: color440,
                    energized: electrical.rightEnergized
                })}

                ${this.renderBreakerSvg({
                    action: "tie",
                    x: busX,
                    y: tieY,
                    closed: state.tieClosed,
                    label: definition.tieBreaker,
                    status: state.tieClosed
                        ? "FECHADO \u2022 TRANSFER\u00caNCIA"
                        : `ABERTO \u2022 ${this.formatDelay(definition.tieDelayMs)}`,
                    color: state.tieClosed ? "#d60000" : "#3f505a",
                    labelSide: "right"
                })}
                <line x1="${busX}" y1="${topEnd + 18}" x2="${busX}" y2="${tieY - 23}"
                      stroke="${color440}" stroke-width="4"/>
                <line x1="${busX}" y1="${tieY + 23}" x2="${busX}" y2="${transformerY - 25}"
                      stroke="${state.tieClosed ? color220 : "#9baab3"}" stroke-width="4"/>
                ${this.renderTransformerVertical({
                    x: busX,
                    y: transformerY,
                    color: state.tieClosed ? color220 : "#9baab3",
                    id: definition.transferTransformer?.id ?? "5TA-2",
                    rating: definition.transferTransformer?.rating ?? "440/220 V \u2022 150 kVA"
                })}

                ${this.renderHorizontalIncoming({
                    action: "incoming-left",
                    y: normalInputY,
                    data: definition.normal,
                    sourceColor: normalSourceColor,
                    busColor: color220,
                    available: electrical.leftAvailable,
                    closed: state.leftClosed,
                    busX
                })}
                <line x1="${busX}" y1="${transformerY + 28}" x2="${busX}" y2="${bottomEnd + 18}"
                      stroke="${color220}" stroke-width="5"/>
                ${this.renderVerticalSectionLabel("BARRA 220 V", busX - 30, (bottomStart + bottomEnd) / 2, color220)}
                ${this.renderOutputRows(rows220, {
                    busX,
                    startY: bottomStart,
                    color: color220,
                    energized: electrical.leftEnergized
                })}

                <text x="850" y="${height - 28}" text-anchor="middle"
                      fill="#617887" font-size="13" font-weight="700">
                    440 V: alimenta\u00e7\u00e3o pelo 7qS-1 \u2022 220 V: 5TA-1 ou transfer\u00eancia pelo 5TA-2
                </text>
            </svg>
        `;
    }

    static renderFourSectionDiagram(definition, state, electrical) {
        const busX = 680;
        const rowHeight = 44;
        const allIV = this.rowsForSection("IV");
        const allIII = this.rowsForSection("III");
        const iv4 = allIV.filter(item => String(item.id).startsWith("4"));
        const iv5 = allIV.filter(item => String(item.id).startsWith("5"));
        const iii1 = allIII.filter(item => String(item.id).startsWith("1"));
        const iii2 = allIII.filter(item => String(item.id).startsWith("2"));
        const topStart = 70;
        const iv4End = topStart + Math.max(iv4.length, 1) * rowHeight;
        const tie113Y = iv4End + 46;
        const iv5Start = tie113Y + 62;
        const iv5End = iv5Start + Math.max(iv5.length, 1) * rowHeight;
        const reserveInputY = iv5End + 60;
        const mainTieY = reserveInputY + 82;
        const normalInputY = mainTieY + 82;
        const iii1Start = normalInputY + 62;
        const iii1End = iii1Start + Math.max(iii1.length, 1) * rowHeight;
        const tie112Y = iii1End + 46;
        const iii2Start = tie112Y + 62;
        const iii2End = iii2Start + Math.max(iii2.length, 1) * rowHeight;
        const height = iii2End + 84;
        const colorIV = electrical.rightEnergized ? electrical.rightColor : "#9baab3";
        const colorIII = electrical.leftEnergized ? electrical.leftColor : "#9baab3";
        const reserveSourceColor = electrical.rightAvailable
            ? this.panelData?.colorRight ?? "#35b95f"
            : "#9baab3";
        const normalSourceColor = electrical.leftAvailable
            ? this.panelData?.colorLeft ?? "#3f7cff"
            : "#9baab3";

        return `
            <svg class="aux-dist-one-line" viewBox="0 0 1700 ${height}" role="img"
                 aria-label="Diagrama de quatro se\u00e7\u00f5es do ${this.escape(definition.title)}">
                <rect x="22" y="20" width="1656" height="${height - 40}" rx="10"
                      fill="#ffffff" stroke="#91a8b6" stroke-width="2"/>
                ${this.renderPanelBadge(definition, 48, 48)}

                <line x1="${busX}" y1="${topStart - 18}" x2="${busX}" y2="${tie113Y - 23}"
                      stroke="${colorIV}" stroke-width="5"/>
                ${this.renderOutputRows(iv4, {
                    busX, startY: topStart, color: colorIV,
                    energized: electrical.rightEnergized
                })}
                ${this.renderFixedSectionBreaker(definition.extraTies?.[1] ?? "1724-113", busX, tie113Y, colorIV)}
                <line x1="${busX}" y1="${tie113Y + 23}" x2="${busX}" y2="${iv5End + 18}"
                      stroke="${colorIV}" stroke-width="5"/>
                ${this.renderOutputRows(iv5, {
                    busX, startY: iv5Start, color: colorIV,
                    energized: electrical.rightEnergized
                })}
                ${this.renderVerticalSectionLabel("BARRA IV \u2022 440 V", busX - 30, (topStart + iv5End) / 2, colorIV)}

                ${this.renderHorizontalIncoming({
                    action: "incoming-right",
                    y: reserveInputY,
                    data: definition.reserve,
                    sourceColor: reserveSourceColor,
                    busColor: colorIV,
                    available: electrical.rightAvailable,
                    closed: state.rightClosed,
                    busX
                })}
                <line x1="${busX}" y1="${iv5End + 18}" x2="${busX}" y2="${mainTieY - 23}"
                      stroke="${colorIV}" stroke-width="4"/>
                ${this.renderBreakerSvg({
                    action: "tie",
                    x: busX,
                    y: mainTieY,
                    closed: state.tieClosed,
                    label: definition.tieBreaker,
                    status: state.tieClosed ? "FECHADO" : `ABERTO \u2022 ${this.formatDelay(definition.tieDelayMs)}`,
                    color: state.tieClosed ? "#d60000" : "#3f505a",
                    labelSide: "right"
                })}
                <line x1="${busX}" y1="${mainTieY + 23}" x2="${busX}" y2="${normalInputY}"
                      stroke="${state.tieClosed ? colorIII : "#9baab3"}" stroke-width="4"/>

                ${this.renderHorizontalIncoming({
                    action: "incoming-left",
                    y: normalInputY,
                    data: definition.normal,
                    sourceColor: normalSourceColor,
                    busColor: colorIII,
                    available: electrical.leftAvailable,
                    closed: state.leftClosed,
                    busX
                })}
                <line x1="${busX}" y1="${normalInputY}" x2="${busX}" y2="${tie112Y - 23}"
                      stroke="${colorIII}" stroke-width="5"/>
                ${this.renderOutputRows(iii1, {
                    busX, startY: iii1Start, color: colorIII,
                    energized: electrical.leftEnergized
                })}
                ${this.renderFixedSectionBreaker(definition.extraTies?.[0] ?? "1724-112", busX, tie112Y, colorIII)}
                <line x1="${busX}" y1="${tie112Y + 23}" x2="${busX}" y2="${iii2End + 18}"
                      stroke="${colorIII}" stroke-width="5"/>
                ${this.renderOutputRows(iii2, {
                    busX, startY: iii2Start, color: colorIII,
                    energized: electrical.leftEnergized
                })}
                ${this.renderVerticalSectionLabel("BARRA III \u2022 440 V", busX - 30, (normalInputY + iii2End) / 2, colorIII)}

                <text x="850" y="${height - 28}" text-anchor="middle"
                      fill="#617887" font-size="13" font-weight="700">
                    Se\u00e7\u00f5es 4/5: Barra IV \u2022 Se\u00e7\u00f5es 1/2: Barra III
                </text>
            </svg>
        `;
    }

    static rowsForSection(sectionId) {
        return this.definition.outgoing.filter(
            item => item.section === sectionId
        );
    }

    static renderPanelBadge(definition, x, y) {
        return `
            <g transform="translate(${x} ${y})">
                <path d="M 0 12 L 12 0 H 252 L 264 12 V 68 L 252 80 H 12 L 0 68 Z"
                      fill="#08a9df" stroke="#173248" stroke-width="2"/>
                <text x="132" y="52" text-anchor="middle"
                      fill="#ffffff" font-size="34" font-weight="900">
                    ${this.escape(definition.title)}
                </text>
                <text x="0" y="112" fill="#173248" font-size="24" font-weight="900">
                    ${this.escape(definition.voltage)}
                </text>
                <foreignObject x="0" y="125" width="430" height="64">
                    <div xmlns="http://www.w3.org/1999/xhtml"
                         style="font:600 14px 'Segoe UI',Arial,sans-serif;color:#4d6575;line-height:1.25">
                        ${this.escape(definition.subtitle)}
                    </div>
                </foreignObject>
            </g>
        `;
    }

    static renderHorizontalIncoming({
        action,
        y,
        data,
        sourceColor,
        busColor,
        available,
        closed,
        busX
    }) {
        const status = closed
            ? (available ? "FECHADO" : "FECHADO \u2022 SEM TENS\u00c3O")
            : "ABERTO";
        const activeColor = closed && available ? busColor : "#9baab3";

        return `
            <g>
                <line x1="76" y1="${y}" x2="${busX}" y2="${y}"
                      stroke="${sourceColor}" stroke-width="3"/>
                <path d="M 88 ${y} L 76 ${y - 6} L 76 ${y + 6} Z"
                      fill="${sourceColor}"/>
                <text x="28" y="${y + 31}" fill="#173248"
                      font-size="16" font-weight="900">
                    ${this.escape(data.source)}
                </text>

                <rect x="198" y="${y - 16}" width="32" height="32"
                      fill="${available ? "#d60000" : "#8796a0"}"
                      stroke="${available ? "#d60000" : "#8796a0"}"/>
                <text x="214" y="${y - 27}" text-anchor="middle"
                      fill="#173248" font-size="15" font-weight="900">
                    ${this.escape(data.sourceBreaker)}
                </text>

                ${this.renderIsolator(315, y, data.isolator, sourceColor)}

                <circle cx="425" cy="${y}" r="21" fill="#ffffff"
                        stroke="${sourceColor}" stroke-width="2"/>
                <circle cx="455" cy="${y}" r="21" fill="#ffffff"
                        stroke="${sourceColor}" stroke-width="2"/>
                <text x="440" y="${y + 42}" text-anchor="middle"
                      fill="#173248" font-size="16" font-weight="900">
                    ${this.escape(data.transformer)}
                </text>
                <text x="440" y="${y + 61}" text-anchor="middle"
                      fill="#4d6575" font-size="12" font-weight="700">
                    ${this.escape(data.rating)}
                </text>

                <line x1="476" y1="${y}" x2="${busX}" y2="${y}"
                      stroke="${activeColor}" stroke-width="4"/>
                ${this.renderBreakerSvg({
                    action,
                    x: 570,
                    y,
                    closed,
                    label: data.incomingBreaker,
                    status,
                    color: closed && available ? "#d60000" : "#455963",
                    labelSide: "top"
                })}
            </g>
        `;
    }

    static renderSimpleIncoming({
        action,
        y,
        data,
        sourceColor,
        busColor,
        available,
        closed,
        busX
    }) {
        const status = closed
            ? (available ? "FECHADO" : "FECHADO \u2022 SEM TENS\u00c3O")
            : "ABERTO";
        const activeColor = closed && available ? busColor : "#9baab3";

        return `
            <g>
                <line x1="76" y1="${y}" x2="${busX}" y2="${y}"
                      stroke="${sourceColor}" stroke-width="3"/>
                <path d="M 88 ${y} L 76 ${y - 6} L 76 ${y + 6} Z"
                      fill="${sourceColor}"/>
                <text x="28" y="${y + 31}" fill="#173248"
                      font-size="16" font-weight="900">
                    ${this.escape(data.source)}
                </text>
                <text x="210" y="${y - 24}" fill="#4d6575"
                      font-size="13" font-weight="800">
                    ORIGEM ${this.escape(data.sourceBreaker)}
                </text>
                <line x1="280" y1="${y}" x2="${busX}" y2="${y}"
                      stroke="${activeColor}" stroke-width="4"/>
                ${this.renderBreakerSvg({
                    action,
                    x: 515,
                    y,
                    closed,
                    label: data.incomingBreaker,
                    status,
                    color: closed && available ? "#d60000" : "#455963",
                    labelSide: "right"
                })}
            </g>
        `;
    }

    static renderIsolator(x, y, label, color) {
        if (!label) return "";

        return `
            <g>
                <circle cx="${x - 28}" cy="${y}" r="4" fill="#ffffff"
                        stroke="${color}" stroke-width="2"/>
                <circle cx="${x + 28}" cy="${y}" r="4" fill="#ffffff"
                        stroke="${color}" stroke-width="2"/>
                <line x1="${x - 24}" y1="${y - 2}" x2="${x + 17}" y2="${y - 18}"
                      stroke="${color}" stroke-width="2"/>
                <text x="${x}" y="${y + 34}" text-anchor="middle"
                      fill="#4d6575" font-size="12" font-weight="800">
                    ${this.escape(label)}
                </text>
            </g>
        `;
    }

    static renderTransformerVertical({ x, y, color, id, rating }) {
        return `
            <g>
                <circle cx="${x}" cy="${y - 12}" r="20" fill="#ffffff"
                        stroke="${color}" stroke-width="2"/>
                <circle cx="${x}" cy="${y + 16}" r="20" fill="#ffffff"
                        stroke="${color}" stroke-width="2"/>
                <text x="${x + 38}" y="${y - 2}" fill="#173248"
                      font-size="16" font-weight="900">${this.escape(id)}</text>
                <text x="${x + 38}" y="${y + 22}" fill="#4d6575"
                      font-size="12" font-weight="700">${this.escape(rating)}</text>
            </g>
        `;
    }

    static renderVerticalSectionLabel(label, x, y, color) {
        return `
            <text x="${x}" y="${y}" text-anchor="middle"
                  transform="rotate(-90 ${x} ${y})"
                  fill="${color}" font-size="17" font-weight="900">
                ${this.escape(label)}
            </text>
        `;
    }

    static renderFixedSectionBreaker(label, x, y, color) {
        return `
            <g>
                <rect x="${x - 18}" y="${y - 18}" width="36" height="36"
                      fill="${color === "#9baab3" ? "#8796a0" : "#d60000"}"
                      stroke="${color === "#9baab3" ? "#8796a0" : "#d60000"}"/>
                <text x="${x + 32}" y="${y + 6}" fill="#173248"
                      font-size="16" font-weight="900">${this.escape(label)}</text>
                <text x="${x + 32}" y="${y + 24}" fill="#d60000"
                      font-size="11" font-weight="900">FECHADO</text>
            </g>
        `;
    }

    static renderOutputRows(rows, {
        busX,
        startY,
        color,
        energized
    }) {
        return rows.map((item, index) => {
            const y = startY + index * 45;
            const showBreaker = item.showBreaker !== false;
            const interactive =
                showBreaker &&
                item.switchable !== false &&
                item.available !== false;
            const closedAndLive = energized && item.closed;
            const symbolColor = !energized
                ? "#8796a0"
                : (item.closed ? "#d60000" : "#455963");
            const lineColor = closedAndLive ? color : "#9baab3";
            const stateText = !energized
                ? "SEM TENS\u00c3O"
                : (item.closed ? "LIGADO" : "ABERTO");
            const symbol = !showBreaker
                ? ""
                : item.closed
                ? `<rect x="${busX + 55}" y="${y - 14}" width="28" height="28"
                         fill="${symbolColor}" stroke="${symbolColor}"/>`
                : `<rect x="${busX + 55}" y="${y - 14}" width="28" height="28"
                         fill="#ffffff" stroke="${symbolColor}" stroke-width="2"/>
                   <path d="M ${busX + 60} ${y - 9} L ${busX + 78} ${y + 9}
                            M ${busX + 78} ${y - 9} L ${busX + 60} ${y + 9}"
                         stroke="${symbolColor}" stroke-width="2"/>`;
            const groupAttributes = interactive
                ? `class="aux-dist-command" data-action="outgoing"
                   data-breaker-id="${this.escape(item.id)}"
                   tabindex="0" role="button"`
                : `class="aux-dist-static-row"`;
            const stateMarkup = showBreaker
                ? `<text x="${busX + 98}" y="${y + 14}" fill="${symbolColor}"
                         font-size="10" font-weight="900">${stateText}</text>`
                : "";

            return `
                <g ${groupAttributes}>
                    <rect class="command-outline" x="${busX + 8}" y="${y - 20}"
                          width="820" height="40" rx="4"
                          fill="transparent" stroke="transparent" stroke-width="2"/>
                    <circle cx="${busX}" cy="${y}" r="4" fill="${color}"/>
                    <line x1="${busX}" y1="${y}" x2="${busX + 210}" y2="${y}"
                          stroke="${lineColor}" stroke-width="2"/>
                    ${symbol}
                    <text x="${busX + 98}" y="${showBreaker ? y - 1 : y + 5}" fill="#173248"
                          font-size="15" font-weight="900">
                        ${this.escape(item.id)}
                    </text>
                    ${stateMarkup}
                    <foreignObject x="${busX + 230}" y="${y - 18}" width="630" height="38">
                        <div xmlns="http://www.w3.org/1999/xhtml"
                             style="font:600 14px 'Segoe UI',Arial,sans-serif;color:#243d4d;line-height:1.2;display:flex;align-items:center;height:38px">
                            ${this.escape(item.label)}
                        </div>
                    </foreignObject>
                    <path d="M ${busX + 210} ${y}
                             L ${busX + 202} ${y - 5}
                             L ${busX + 202} ${y + 5} Z"
                          fill="${lineColor}"/>
                </g>
            `;
        }).join("");
    }

    static renderGeneratorIncoming({
        y,
        generator,
        busX,
        busColor,
        energized = false,
        emergencyColor = "#00B8D9"
    }) {
        const standbyColor = "#d98300";
        const activeColor = energized ? emergencyColor : standbyColor;
        const connectionColor = energized ? emergencyColor : "#9baab3";
        const generatorFill = energized ? emergencyColor : "#ffffff";
        const generatorText = energized ? "#ffffff" : "#173248";
        const status = energized
            ? "FONTE DE EMERGÊNCIA EM OPERAÇÃO"
            : `FONTE DE EMERGÊNCIA EM ESPERA • ${this.formatDelay(generator.delayMs)}`;

        const breakerMarkup = (x, label) => energized
            ? `
                <g>
                    <rect x="${x - 17}" y="${y - 17}" width="34" height="34"
                          fill="#d60000" stroke="#d60000" stroke-width="2"/>
                    <text x="${x}" y="${y - 28}" text-anchor="middle"
                          fill="#173248" font-size="14" font-weight="900">
                        ${this.escape(label)}
                    </text>
                    <text x="${x}" y="${y + 34}" text-anchor="middle"
                          fill="#d60000" font-size="10" font-weight="900">LIGADO</text>
                </g>
            `
            : this.renderOpenStaticBreaker(x, y, label);

        return `
            <g>
                <line x1="76" y1="${y}" x2="${busX}" y2="${y}"
                      stroke="${connectionColor}" stroke-width="3"/>
                <path d="M 88 ${y} L 76 ${y - 6} L 76 ${y + 6} Z"
                      fill="${activeColor}"/>
                <circle cx="210" cy="${y}" r="28" fill="${generatorFill}"
                        stroke="${activeColor}" stroke-width="3"/>
                <text x="210" y="${y + 6}" text-anchor="middle"
                      fill="${generatorText}" font-size="17" font-weight="900">
                    ${this.escape(generator.id)}
                </text>
                ${breakerMarkup(300, generator.firstBreaker)}
                ${breakerMarkup(470, generator.incomingBreaker)}
                <line x1="498" y1="${y}" x2="${busX}" y2="${y}"
                      stroke="${connectionColor}" stroke-width="3"/>
                <text x="560" y="${y + 35}" text-anchor="middle"
                      fill="${activeColor}" font-size="13" font-weight="900">
                    ${status}
                </text>
                <circle cx="${busX}" cy="${y}" r="4" fill="${energized ? emergencyColor : busColor}"/>
            </g>
        `;
    }

    static renderOpenStaticBreaker(x, y, label) {
        return `
            <g>
                <rect x="${x - 17}" y="${y - 17}" width="34" height="34"
                      fill="#ffffff" stroke="#455963" stroke-width="2"/>
                <path d="M ${x - 12} ${y - 12} L ${x + 12} ${y + 12}
                         M ${x + 12} ${y - 12} L ${x - 12} ${y + 12}"
                      stroke="#455963" stroke-width="2"/>
                <text x="${x}" y="${y - 28}" text-anchor="middle"
                      fill="#173248" font-size="14" font-weight="900">
                    ${this.escape(label)}
                </text>
            </g>
        `;
    }

    static renderBreakerSvg({
        action,
        x,
        y,
        closed,
        label,
        status,
        color,
        labelSide = "right"
    }) {
        const symbol = closed
            ? `<rect x="${x - 19}" y="${y - 19}" width="38" height="38"
                     fill="#d60000" stroke="#d60000" stroke-width="2"/>`
            : `<rect x="${x - 19}" y="${y - 19}" width="38" height="38"
                     fill="#ffffff" stroke="#455963" stroke-width="2"/>
               <path d="M ${x - 14} ${y - 14} L ${x + 14} ${y + 14}
                        M ${x + 14} ${y - 14} L ${x - 14} ${y + 14}"
                     stroke="#455963" stroke-width="2"/>`;

        const labelX = labelSide === "left"
            ? x - 31
            : (labelSide === "top" ? x : x + 31);
        const labelY = labelSide === "top" ? y - 30 : y + 6;
        const anchor = labelSide === "left"
            ? "end"
            : (labelSide === "top" ? "middle" : "start");

        return `
            <g class="aux-dist-command" data-action="${action}" tabindex="0" role="button">
                <rect class="command-outline" x="${x - 90}" y="${y - 43}"
                      width="180" height="92" rx="7"
                      fill="transparent" stroke="transparent" stroke-width="2"/>
                ${symbol}
                <text x="${labelX}" y="${labelY}" text-anchor="${anchor}"
                      fill="#173248" font-size="17" font-weight="900">
                    ${this.escape(label)}
                </text>
                <text x="${x}" y="${y + 43}" text-anchor="middle"
                      fill="${color}" font-size="13" font-weight="900">
                    ${this.escape(status)}
                </text>
            </g>
        `;
    }

    static bindCommands() {
        this.content
            ?.querySelectorAll("[data-action]")
            .forEach(element => {
                const execute = event => {
                    event.preventDefault();
                    event.stopPropagation();
                    this.executeCommand(
                        element.dataset.action,
                        element.dataset.breakerId
                    );
                };

                element.addEventListener("click", execute);
                element.addEventListener("keydown", event => {
                    if (event.key === "Enter" || event.key === " ") {
                        execute(event);
                    }
                });
            });
    }

    static executeCommand(action, breakerId = "") {
        if (
            [
                "incoming-left",
                "incoming-right",
                "tie"
            ].includes(action) &&
            Engine.hasAuxPanelTransfer?.(
                this.panelData?.id
            )
        ) {
            const roleByAction = {
                "incoming-left": "left",
                "incoming-right": "right",
                tie: "tie"
            };

            Engine.toggleAuxPanelBreaker(
                this.panelData.id,
                roleByAction[action]
            );
            return;
        }

        if (this.getMode() !== "MANUAL") {
            this.blocked(
                "O painel est\u00e1 sob controle autom\u00e1tico. Selecione MANUAL para realizar esta opera\u00e7\u00e3o."
            );
            return;
        }

        const state = this.getState();
        const electrical = this.electricalState();
        const singleBus =
            this.definition.layout === "single-bus-dual-incoming";

        if (action === "incoming-left") {
            if (!state.leftClosed && singleBus && state.rightClosed) {
                this.blocked(
                    "Abra a entrada reserva antes de fechar a entrada normal. O comando foi bloqueado para evitar paralelismo das fontes."
                );
                return;
            }
            if (!state.leftClosed && state.tieClosed && electrical.directRight) {
                this.blocked(
                    "Abra o DJ de interliga\u00e7\u00e3o antes de fechar a entrada normal. O comando evitar\u00e1 o paralelismo das fontes."
                );
                return;
            }
            state.leftClosed = !state.leftClosed;
        }

        if (action === "incoming-right") {
            if (!state.rightClosed && singleBus && state.leftClosed) {
                this.blocked(
                    "Abra a entrada normal antes de fechar a entrada reserva. O comando foi bloqueado para evitar paralelismo das fontes."
                );
                return;
            }
            if (!state.rightClosed && state.tieClosed && electrical.directLeft) {
                this.blocked(
                    "Abra o DJ de interliga\u00e7\u00e3o antes de fechar a entrada reserva. O comando evitar\u00e1 o paralelismo das fontes."
                );
                return;
            }
            state.rightClosed = !state.rightClosed;
        }

        if (action === "tie") {
            if (!state.tieClosed && electrical.directLeft && electrical.directRight) {
                this.blocked(
                    "As duas barras est\u00e3o energizadas por fontes diferentes. O fechamento da interliga\u00e7\u00e3o foi bloqueado para evitar paralelismo."
                );
                return;
            }
            state.tieClosed = !state.tieClosed;
        }

        if (action === "outgoing") {
            AuxDistributionDetailDatabase.toggleOutgoing(
                this.definition.id,
                breakerId
            );
        }

        this.syncMainPanel();
        this.notifyChange();
        this.render();
    }

    static toggleMode() {
        const next = this.getMode() === "AUTO" ? "MANUAL" : "AUTO";

        if (
            Engine.hasAuxPanelTransfer?.(
                this.panelData?.id
            ) &&
            typeof Engine
                .setAuxPanelOperationMode ===
            "function"
        ) {
            Engine.setAuxPanelOperationMode(
                this.panelData.id,
                next
            );
            return;
        }

        this.panelData.operationMode = next;

        if (next === "MANUAL") {
            this.cancelAutoTimer();
        }

        window.dispatchEvent(
            new CustomEvent("scada:panel-mode-changed", {
                detail: {
                    id: this.panelData.id,
                    mode: next
                }
            })
        );

        this.notifyChange();
        this.render();
    }

    static reset() {
        if (
            Engine.hasAuxPanelTransfer?.(
                this.panelData?.id
            ) &&
            typeof Engine
                .restoreAuxPanelNormalState ===
            "function"
        ) {
            AuxDistributionDetailDatabase.reset(
                this.definition.id
            );

            Engine.restoreAuxPanelNormalState(
                this.panelData.id
            );
            return;
        }

        this.cancelAutoTimer();
        const state = this.getState();

        Object.assign(state, {
            leftClosed: this.definition.defaultLeftClosed ?? true,
            rightClosed: this.definition.defaultRightClosed ?? true,
            tieClosed: false,
            transferring: false,
            transferText: ""
        });

        this.panelData.operationMode = "AUTO";
        AuxDistributionDetailDatabase.reset(this.definition.id);
        this.syncMainPanel();
        this.notifyChange();
        this.render();
    }

    static applyAutomaticLogic() {
        if (
            Engine.hasAuxPanelTransfer?.(
                this.panelData?.id
            )
        ) {
            this.syncStateFromMainPanel();
            return;
        }

        if (this.getMode() !== "AUTO") return;

        const state = this.getState();
        const source = this.sourceStatus();
        const singleBus =
            this.definition.layout === "single-bus-dual-incoming";

        if (singleBus) {
            if (!source.leftAvailable && state.leftClosed) {
                state.leftClosed = false;
            }

            if (!source.rightAvailable && state.rightClosed) {
                state.rightClosed = false;
            }

            if (
                !source.leftAvailable &&
                source.rightAvailable &&
                !state.leftClosed &&
                !state.rightClosed
            ) {
                this.scheduleIncomingTransfer("RESERVA");
            }

            if (
                !source.rightAvailable &&
                source.leftAvailable &&
                !state.rightClosed &&
                !state.leftClosed
            ) {
                this.scheduleIncomingTransfer("NORMAL");
            }

            return;
        }

        if (!source.leftAvailable && state.leftClosed) {
            state.leftClosed = false;
        }

        if (!source.rightAvailable && state.rightClosed) {
            state.rightClosed = false;
        }

        const leftLost =
            !source.leftAvailable &&
            source.rightAvailable &&
            state.rightClosed &&
            !state.tieClosed;

        const rightLost =
            !source.rightAvailable &&
            source.leftAvailable &&
            state.leftClosed &&
            !state.tieClosed;

        if (leftLost || rightLost) {
            this.scheduleAutoTransfer(leftLost ? "RESERVA" : "NORMAL");
        }
    }

    static scheduleIncomingTransfer(sourceName) {
        const id = this.definition.id;
        if (this.autoTimers.has(id)) return;

        const state = this.getState();
        const delay = this.definition.transferDelayMs ?? 3000;
        state.transferring = true;
        state.transferText =
            `TRANSFER\u00caNCIA PARA ${sourceName} \u2022 ${this.formatDelay(delay)}`;

        const timer = window.setTimeout(() => {
            this.autoTimers.delete(id);

            if (!this.overlay || this.definition?.id !== id) {
                return;
            }

            const current = this.sourceStatus();
            state.transferring = false;
            state.transferText = "";

            if (
                this.getMode() === "AUTO" &&
                sourceName === "RESERVA" &&
                current.rightAvailable &&
                !state.leftClosed
            ) {
                state.rightClosed = true;
            }

            if (
                this.getMode() === "AUTO" &&
                sourceName === "NORMAL" &&
                current.leftAvailable &&
                !state.rightClosed
            ) {
                state.leftClosed = true;
            }

            this.syncMainPanel();
            this.notifyChange();
            this.render();
        }, delay);

        this.autoTimers.set(id, timer);
    }

    static scheduleAutoTransfer(sourceName) {
        const id = this.definition.id;
        if (this.autoTimers.has(id)) return;

        const state = this.getState();
        const delay = this.definition.tieDelayMs ?? 2500;
        state.transferring = true;
        state.transferText =
            `TRANSFER\u00caNCIA AUTOM\u00c1TICA \u2022 ${this.formatDelay(delay)}`;

        const timer = window.setTimeout(() => {
            this.autoTimers.delete(id);

            if (!this.overlay || this.definition?.id !== id) {
                return;
            }

            const current = this.sourceStatus();
            const canTransfer =
                sourceName === "RESERVA"
                    ? current.rightAvailable && state.rightClosed
                    : current.leftAvailable && state.leftClosed;

            state.transferring = false;
            state.transferText = "";

            if (this.getMode() === "AUTO" && canTransfer) {
                state.tieClosed = true;
                this.syncMainPanel();
                this.notifyChange();
            }

            this.render();
        }, delay);

        this.autoTimers.set(id, timer);
    }

    static cancelAutoTimer() {
        const id = this.definition?.id;
        if (!id) return;

        const timer = this.autoTimers.get(id);
        if (timer) {
            window.clearTimeout(timer);
            this.autoTimers.delete(id);
        }

        const state = this.getState();
        if (state) {
            state.transferring = false;
            state.transferText = "";
        }
    }

    static syncMainPanel() {
        const state = this.getState();
        if (!state || !this.panelData) return;

        this.panelData.leftBreakerState =
            state.leftClosed ? "closed" : "openAuto";
        this.panelData.rightBreakerState =
            state.rightClosed ? "closed" : "openAuto";
        this.panelData.mainBreakerState =
            state.tieClosed ? "closed" : "openAuto";
    }

    static notifyChange() {
        const detail = {
            source: "aux-distribution-detail",
            id: this.definition.id
        };

        if (typeof Engine.notifyStateChange === "function") {
            Engine.notifyStateChange("aux-panel-detail", detail);
            return;
        }

        window.dispatchEvent(
            new CustomEvent("scada:state-changed", { detail })
        );
    }

    static getSupplyText(electrical) {
        if (electrical?.gaeFeeding === true) {
            return "ENERGIZADO PELO GAE";
        }

        if (this.definition?.layout === "single-bus-dual-incoming") {
            if (electrical.directLeft) {
                return "ENERGIZADO PELA ENTRADA NORMAL";
            }

            if (electrical.directRight) {
                return "ENERGIZADO PELA ENTRADA RESERVA";
            }

            return "PAINEL DESENERGIZADO";
        }

        if (electrical.leftEnergized && electrical.rightEnergized) {
            if (this.getState().tieClosed) {
                return electrical.directLeft
                    ? "ENERGIZADO PELA FONTE NORMAL"
                    : "ENERGIZADO PELA FONTE RESERVA";
            }
            return "DUAS BARRAS ENERGIZADAS";
        }

        if (electrical.leftEnergized) {
            return "BARRA I ENERGIZADA";
        }

        if (electrical.rightEnergized) {
            return "BARRA II ENERGIZADA";
        }

        return "PAINEL DESENERGIZADO";
    }

    static blocked(message) {
        window.alert(`COMANDO BLOQUEADO\n\n${message}`);
    }

    static formatDelay(milliseconds = 0) {
        const seconds = milliseconds / 1000;
        return `${Number.isInteger(seconds) ? seconds : seconds.toFixed(1).replace(".", ",")} s`;
    }

    static escape(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }
}