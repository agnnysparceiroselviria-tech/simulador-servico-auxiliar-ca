import { Engine } from "./Engine.js";

const OUTGOING_TEMPLATE = [
    {
        id: "52-21191",
        label: "Regulador de Velocidade - Motor bomba 1",
        closed: true
    },
    {
        id: "52-21192",
        label: "Regulador de Velocidade - Motor bomba 2",
        closed: true
    },
    {
        id: "52-21111",
        label: "Mancal Escora - Bomba circulação óleo 1",
        closed: true
    },
    {
        id: "52-21112",
        label: "Mancal Escora - Bomba circulação óleo 2",
        closed: true
    },
    {
        id: "52-21113",
        label: "Sistema de injeção de óleo ME - Bomba 1",
        closed: true
    },
    {
        id: "52-21114",
        label: "Sistema de injeção de óleo ME - Bomba 2",
        closed: true
    },
    {
        id: "52-21115",
        label: "Mancal Escora - Exaustor de vapor de óleo",
        closed: true
    },
    {
        id: "52-21116",
        label: "Mancal Guia Superior - Bomba circulação óleo 1",
        closed: true
    },
    {
        id: "52-21117",
        label: "Mancal Guia Superior - Bomba circulação óleo 2",
        closed: true
    },
    {
        id: "52-21118",
        label: "Mancal Guia Inferior - Bomba circulação óleo 1",
        closed: true
    },
    {
        id: "52-21119",
        label: "Mancal Guia Inferior - Bomba circulação óleo 2",
        closed: true
    },
    {
        id: "52-21120",
        label: "Vedação do Eixo - Bomba injeção água 1",
        closed: true
    },
    {
        id: "52-21121",
        label: "Vedação do Eixo - Bomba injeção água 2",
        closed: true
    },
    {
        id: "52-21122",
        label: "Tampa da Turbina - Bomba de drenagem",
        closed: true
    },
    {
        id: "52-21123",
        label: "Regulador de Velocidade - Motor da bomba 3",
        closed: true
    },
    {
        id: "52-21124",
        label: "Exaustor pó de freio 1",
        closed: true
    },
    {
        id: "52-21125",
        label: "Exaustor pó de freio 2",
        closed: true
    },
    {
        id: "52-21126",
        label: "Exaustor pó de freio 3",
        closed: true
    },
    {
        id: "52-21103",
        label: "Alimentação do GAE-1",
        closed: false,
        openSymbol: "preselection"
    },
    {
        id: "52-21127",
        label: "Reserva",
        closed: false,
        reserve: true
    },
    {
        id: "52-21128",
        label: "Reserva",
        closed: false,
        reserve: true
    },
    {
        id: "52-21129",
        label: "Reserva",
        closed: false,
        reserve: true
    },
    {
        id: "52-21130",
        label: "CF-PSD-U01 - Sist. de esgotamento - Painel contr. local",
        closed: true
    },
    {
        id: "52-21131",
        label: "Reserva",
        closed: false,
        reserve: true
    },
    {
        id: "52-21132",
        label: "Reserva",
        closed: false,
        reserve: true
    },
    {
        id: "52-21133",
        label: "Bomba 1 - Unidade hidráulica da comporta",
        closed: true
    },
    {
        id: "52-21134",
        label: "Bomba 2 - Unidade hidráulica da comporta",
        closed: true
    },
    {
        id: "52-21151",
        label: "Resistência de aquecimento do gerador",
        closed: true
    },
    {
        id: "52-21152",
        label: "Reserva",
        closed: false,
        reserve: true
    },
    {
        id: "52-21153",
        label: "CF-MCP-V-01 - Compressor RV - Painel de controle local",
        closed: true
    },
    {
        id: "52-21154",
        label: "CF-TUG-U01 - Sistema de refrigeração do transformador",
        closed: true
    },
    {
        id: "52-21155",
        label: "Pré-excitação da Unidade 01",
        closed: true
    },
    {
        id: "52-21156",
        label: "CF-PFA-U01 - Sist. Água Resfriamento - Painel controle filtro",
        closed: true
    },
    {
        id: "52-21157",
        label: "CF-QEX-U01 - Ventilação e Conversor CA-CC do RTVX",
        closed: true
    },
    {
        id: "52-21158",
        label: "Reserva",
        closed: false,
        reserve: true
    },
    {
        id: "52-21159",
        label: "Reserva",
        closed: false,
        reserve: true
    },
    {
        id: "52-21160",
        label: "CF-PVR-U01 - Válvulas motorizadas - Painel de controle",
        closed: true
    },
    {
        id: "52-21161",
        label: "Painel do Sistema de Frenagem e Levantamento",
        closed: true
    },
    {
        id: "52-21162",
        label: "Reserva",
        closed: false,
        reserve: true
    },
    {
        id: "52-21163",
        label: "CF-qLF01-U01 - Quadro de força e iluminação",
        closed: true
    }
];

const SVG_NS = "http://www.w3.org/2000/svg";

const COLORS = {
    normal: "#3f7cff",
    reserve: "#3dbb5a",
    closed: "#d60000",
    deenergized: "#263238",
    open: "#ffffff",
    off: "#9aa9b2",
    text: "#1b2d3e",
    muted: "#60727d",
    border: "#8ea0ab",
    panel: "#f8fafc",
    warning: "#b07800"
};

function cloneOutgoing() {
    return OUTGOING_TEMPLATE.map(item => ({
        ...item,
        defaultClosed: item.closed
    }));
}

function escapeXml(value = "") {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&apos;");
}

function wrapLabel(value, maximum = 44) {
    const words = String(value).split(/\s+/);
    const lines = [""];

    words.forEach(word => {
        const current = lines.at(-1);
        const next = current ? `${current} ${word}` : word;

        if (next.length <= maximum || lines.length === 2) {
            lines[lines.length - 1] = next;
        } else {
            lines.push(word);
        }
    });

    if (lines[1]?.length > maximum + 8) {
        lines[1] = `${lines[1].slice(0, maximum + 5)}...`;
    }

    return lines.slice(0, 2);
}

function openBreakerSymbol(x, y, size, symbol = "automatic") {
    if (symbol === "preselection") {
        return `
            <line
                x1="${x + 4}" y1="${y + size - 4}"
                x2="${x + size - 4}" y2="${y + 4}"
                stroke="${COLORS.deenergized}"
                stroke-width="2"
            />
        `;
    }

    return `
        <line
            x1="${x + 4}" y1="${y + 4}"
            x2="${x + size - 4}" y2="${y + size - 4}"
            stroke="${COLORS.deenergized}"
            stroke-width="2"
        />
        <line
            x1="${x + size - 4}" y1="${y + 4}"
            x2="${x + 4}" y2="${y + size - 4}"
            stroke="${COLORS.deenergized}"
            stroke-width="2"
        />
    `;
}

export const CcmU01View = {

    overlay: null,
    diagramContainer: null,
    headerStatus: null,
    transferTimer: null,
    engineSyncTimer: null,
    engineStateHandler: null,
    linkedToEngine: false,
    previousBodyOverflow: "",

    state: {
        normalAvailable: true,
        reserveAvailable: true,
        normalClosed: true,
        reserveClosed: false,
        transferRemaining: 0,

        /*
         * Modo de operação do diagrama detalhado.
         *
         * AUTO:
         * mantém a lógica automática existente.
         *
         * MANUAL:
         * libera os comandos individuais dos DJs.
         */
        operationMode: "AUTO",

        // Estado elétrico real recebido do Engine.
        energized: true,
        suppliedBy: "P14",
        emergencyEnergized: false,
        emergencyColor: "#00B8D9",

        outgoing: cloneOutgoing(),
        events: []
    },

    open() {
        this.close();

        /*
         * Abrir novamente o CCM não repõe sua condição normal.
         * O modo AUTO / MANUAL e os estados dos DJs permanecem no Engine.
         */
        this.syncIncomingFromEngine(false);

        const overlay = document.createElement("section");
        overlay.id = "ccmU01View";
        overlay.setAttribute("aria-label", "Simulador do CF-CCM-U01");

        Object.assign(overlay.style, {
            position: "fixed",
            inset: "0",
            zIndex: "99999",
            display: "grid",
            gridTemplateRows: "54px minmax(0, 1fr) 34px",
            background: "#ffffff",
            color: COLORS.deenergized,
            fontFamily: "Segoe UI, Arial, sans-serif"
        });

        const header = document.createElement("header");
        Object.assign(header.style, {
            display: "grid",
            gridTemplateColumns: "130px 1fr 620px",
            alignItems: "center",
            gap: "18px",
            padding: "0 16px",
            background: "#1b2d3e",
            borderBottom: "1px solid #4c6f8c",
            color: "#ffffff"
        });

        const backButton = this.createHeaderButton("← VOLTAR");
        backButton.addEventListener("click", () => this.close());

        const title = document.createElement("strong");
        title.textContent = "CF-CCM-U01";
        Object.assign(title.style, {
            display: "block",
            minWidth: "0",
            textAlign: "center",
            fontSize: "18px",
            letterSpacing: "0.4px"
        });

        const actions = document.createElement("div");
        Object.assign(actions.style, {
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "12px"
        });

        const autoButton =
            this.createHeaderButton(
                "AUTOMÁTICO",
                "126px"
            );

        const manualButton =
            this.createHeaderButton(
                "MANUAL",
                "104px"
            );

        const refreshModeButtons = () => {

            const manual =
                this.state.operationMode ===
                "MANUAL";

            Object.assign(
                autoButton.style,
                {
                    background:
                        manual
                            ? "#29435a"
                            : "#ffffff",
                    color:
                        manual
                            ? "#ffffff"
                            : "#1b2d3e",
                    borderColor:
                        manual
                            ? "#6f93ad"
                            : "#7dff9e"
                }
            );

            Object.assign(
                manualButton.style,
                {
                    background:
                        manual
                            ? "#fff3cd"
                            : "#29435a",
                    color:
                        manual
                            ? "#1b2d3e"
                            : "#ffffff",
                    borderColor:
                        manual
                            ? "#d4a900"
                            : "#6f93ad"
                }
            );
        };

        autoButton.addEventListener(
            "click",
            () => {

                this.setOperationMode(
                    "AUTO"
                );

                refreshModeButtons();
            }
        );

        manualButton.addEventListener(
            "click",
            () => {

                this.setOperationMode(
                    "MANUAL"
                );

                refreshModeButtons();
            }
        );

        refreshModeButtons();

        const resetButton = this.createHeaderButton("REPOR NORMAL", "138px");
        resetButton.addEventListener("click", () => this.resetState(true));

        const status = document.createElement("span");
        Object.assign(status.style, {
            minWidth: "145px",
            textAlign: "right",
            color: "#7dff9e",
            fontWeight: "700",
            fontSize: "13px"
        });

        actions.appendChild(autoButton);
        actions.appendChild(manualButton);
        actions.appendChild(resetButton);
        actions.appendChild(status);

        header.appendChild(backButton);
        header.appendChild(title);
        header.appendChild(actions);

        const main = document.createElement("main");
        Object.assign(main.style, {
            position: "relative",
            minWidth: "0",
            minHeight: "0",
            overflow: "auto",
            background: "#ffffff"
        });

        const footer = document.createElement("footer");
        footer.textContent = "SCADA • UHE ILHA SOLTEIRA • SERVIÇO AUXILIAR CA";
        Object.assign(footer.style, {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#1b2d3e",
            borderTop: "1px solid #4c6f8c",
            color: "#c9e2ff",
            fontSize: "12px",
            fontWeight: "700"
        });

        overlay.appendChild(header);
        overlay.appendChild(main);
        overlay.appendChild(footer);

        overlay.tabIndex = -1;
        overlay.addEventListener("keydown", event => {
            if (event.key === "Escape") {
                this.close();
            }
        });

        this.previousBodyOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        document.body.appendChild(overlay);

        this.overlay = overlay;
        this.diagramContainer = main;
        this.headerStatus = status;

        this.startEngineSynchronization();

        this.addEvent("SISTEMA", "DIAGRAMA COMPLETO CARREGADO");
        this.redraw();
        overlay.focus();
    },

    createHeaderButton(label, width = "118px") {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = label;

        Object.assign(button.style, {
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width,
            height: "34px",
            padding: "0 12px",
            border: "1px solid #6f93ad",
            borderRadius: "4px",
            background: "#29435a",
            color: "#ffffff",
            fontWeight: "700",
            cursor: "pointer"
        });

        return button;
    },

    close() {
        clearInterval(this.transferTimer);
        this.transferTimer = null;
        clearInterval(this.engineSyncTimer);
        this.engineSyncTimer = null;

        if (this.engineStateHandler) {
            window.removeEventListener(
                "scada:state-changed",
                this.engineStateHandler
            );
        }

        this.engineStateHandler = null;
        this.linkedToEngine = false;
        this.overlay?.remove();
        this.overlay = null;
        this.diagramContainer = null;
        this.headerStatus = null;

        if (document.body) {
            document.body.style.overflow = this.previousBodyOverflow;
        }
    },

    resetState(redraw = true) {
        clearInterval(this.transferTimer);
        this.transferTimer = null;

        /*
         * REPOR NORMAL também devolve o diagrama
         * detalhado para o modo AUTOMÁTICO.
         */
        this.state.operationMode =
            "AUTO";

        this.state.outgoing = cloneOutgoing();
        this.state.events = [];

        const sharedState =
            Engine.getPcaLoadTransferState(
                "CCM-U01"
            );

        this.linkedToEngine =
            Boolean(sharedState);

        if (this.linkedToEngine) {

            Engine.setPanelOperationMode?.(
                "CCM-U01",
                "AUTO"
            );

            if (redraw) {
                Engine.requestPcaLoadNormalRestoration(
                    "CCM-U01"
                );
            }

            this.syncIncomingFromEngine(false);

        } else {

            this.state.normalAvailable = true;
            this.state.reserveAvailable = true;
            this.state.normalClosed = true;
            this.state.reserveClosed = false;
            this.state.transferRemaining = 0;
        }

        if (redraw && this.diagramContainer) {
            this.addEvent("SISTEMA", "CONDIÇÃO NORMAL RESTABELECIDA");
            this.redraw();
        }
    },

    startEngineSynchronization() {
        this.syncIncomingFromEngine(false);

        if (!this.linkedToEngine) {
            return;
        }

        this.engineStateHandler = () => {
            this.syncIncomingFromEngine(true);
        };

        window.addEventListener(
            "scada:state-changed",
            this.engineStateHandler
        );

        this.engineSyncTimer = window.setInterval(
            () => {
                this.syncIncomingFromEngine(true);
            },
            200
        );
    },

    syncIncomingFromEngine(redraw = true) {
        const sharedState =
            Engine.getPcaLoadTransferState(
                "CCM-U01"
            );

        if (!sharedState) {
            this.linkedToEngine = false;
            return false;
        }

        this.linkedToEngine = true;

        const previous = {
            operationMode:
                this.state.operationMode,
            normalClosed:
                this.state.normalClosed,
            reserveClosed:
                this.state.reserveClosed,
            transferRemaining:
                this.state.transferRemaining,
            energized:
                this.state.energized,
            suppliedBy:
                this.state.suppliedBy,
            emergencyEnergized:
                this.state.emergencyEnergized
        };

        this.state.normalAvailable =
            sharedState.normalAvailable;
        this.state.operationMode =
            sharedState.operationMode ??
            this.state.operationMode;
        this.state.reserveAvailable =
            sharedState.reserveAvailable;
        this.state.normalClosed =
            sharedState.normalClosed;
        this.state.reserveClosed =
            sharedState.reserveClosed;
        this.state.transferRemaining =
            sharedState.transferRemaining;

        /*
         * O estado energized/suppliedBy do Engine é a fonte de verdade do
         * diagrama interno. Isso é essencial no BLACKOUT e também quando o
         * GD PROV passa a alimentar o CCM-U01 pelo DJ 21103.
         */
        this.state.energized =
            sharedState.energized === true;
        this.state.suppliedBy =
            sharedState.suppliedBy ?? null;
        this.state.emergencyEnergized =
            this.state.energized &&
            String(this.state.suppliedBy ?? "")
                .toUpperCase()
                .startsWith("GAE_");
        this.state.emergencyColor =
            Engine.gaeEmergencyColor ?? "#00B8D9";

        // O DJ 52-21103 mostrado no detalhe representa o 21103 do Engine.
        const gaeIncoming =
            this.state.outgoing.find(item => item.id === "52-21103");
        if (gaeIncoming) {
            gaeIncoming.closed =
                Engine.isGaeBreakerClosed?.("21103") === true;
        }

        const changed =
            previous.operationMode !==
                this.state.operationMode ||
            previous.normalClosed !==
                this.state.normalClosed ||
            previous.reserveClosed !==
                this.state.reserveClosed ||
            previous.transferRemaining !==
                this.state.transferRemaining ||
            previous.energized !==
                this.state.energized ||
            previous.suppliedBy !==
                this.state.suppliedBy ||
            previous.emergencyEnergized !==
                this.state.emergencyEnergized;

        if (
            redraw &&
            previous.normalClosed &&
            !this.state.normalClosed
        ) {
            this.addEvent(
                "DJ 52-21101",
                "ABERTO - ESTADO SINCRONIZADO"
            );
        }

        if (
            redraw &&
            !previous.reserveClosed &&
            this.state.reserveClosed
        ) {
            this.addEvent(
                "DJ 52-21102",
                "FECHADO AUTOMATICAMENTE - R14 ALIMENTA"
            );
        }

        if (
            redraw &&
            previous.transferRemaining === 0 &&
            this.state.transferRemaining > 0
        ) {
            this.addEvent(
                "DJ 52-21102",
                `TRANSFERÊNCIA AUTOMÁTICA INICIADA - ${this.state.transferRemaining} s`
            );
        }

        if (
            redraw &&
            changed &&
            this.diagramContainer
        ) {
            this.redraw();
        }

        return true;
    },

    setOperationMode(mode) {

        const normalized =
            String(
                mode ??
                "AUTO"
            ).toUpperCase();

        if (
            ![
                "AUTO",
                "MANUAL"
            ].includes(
                normalized
            )
        ) {
            return false;
        }

        if (
            this.state.operationMode ===
            normalized
        ) {
            Engine.setPanelOperationMode?.(
                "CCM-U01",
                normalized
            );

            return true;
        }

        this.state.operationMode =
            normalized;

        /*
         * Mantém o modo mostrado na tela detalhada sincronizado com
         * o estado lógico utilizado pelos DJs dentro e fora do CCM.
         */
        Engine.setPanelOperationMode?.(
            "CCM-U01",
            normalized
        );

        this.addEvent(
            "CF-CCM-U01",
            `PAINEL COLOCADO EM ${normalized}`
        );

        this.redraw();

        return true;
    },

    isManualMode() {

        return (
            this.state.operationMode ===
            "MANUAL"
        );
    },

    showManualModeMessage(
        breakerLabel
    ) {

        window.alert(
            `COMANDO BLOQUEADO\nO DJ ${breakerLabel} está sob controle automático do CF-CCM-U01. Selecione MANUAL no topo para realizar esta operação.`
        );
    },

    addEvent(equipment, message) {
        this.state.events.unshift({
            time: new Date().toLocaleTimeString("pt-BR"),
            equipment,
            message
        });
        this.state.events = this.state.events.slice(0, 5);
    },

    getBusState() {
        /*
         * Alimentação pelo GAE tem prioridade visual no detalhe.
         * O Engine marca suppliedBy como GAE_PROV quando 52-1/21103
         * energizam o CCM-U01 durante o blackout.
         */
        if (
            this.state.emergencyEnergized === true ||
            (
                this.state.energized === true &&
                String(this.state.suppliedBy ?? "")
                    .toUpperCase()
                    .startsWith("GAE_")
            )
        ) {
            return {
                energized: true,
                source: "GAE PROV",
                color: this.state.emergencyColor ??
                    Engine.gaeEmergencyColor ??
                    "#00B8D9"
            };
        }

        if (this.state.normalClosed && this.state.normalAvailable) {
            return {
                energized: true,
                source: "P14",
                color: COLORS.normal
            };
        }

        if (this.state.reserveClosed && this.state.reserveAvailable) {
            return {
                energized: true,
                source: "R14",
                color: COLORS.reserve
            };
        }

        return {
            energized: false,
            source: "SEM FONTE",
            color: COLORS.off
        };
    },

    redraw() {
        if (!this.diagramContainer) return;

        this.diagramContainer.innerHTML = "";
        this.drawCompleteDiagram(this.diagramContainer);

        const bus = this.getBusState();
        if (this.headerStatus) {
            const electricalStatus =
                bus.energized
                    ? `ENERGIZADO • ${bus.source}`
                    : this.state.transferRemaining > 0
                        ? `TRANSFERÊNCIA • ${this.state.transferRemaining} s`
                        : "DESENERGIZADO";

            this.headerStatus.textContent =
                `${this.state.operationMode} • ${electricalStatus}`;

            this.headerStatus.style.color = bus.energized
                ? "#7dff9e"
                : this.state.transferRemaining > 0
                    ? "#ffd166"
                    : "#ff8e8e";
        }
    },

    drawCompleteDiagram(container) {
        const svg = document.createElementNS(SVG_NS, "svg");
        svg.setAttribute("viewBox", "0 0 1500 2220");
        svg.setAttribute("preserveAspectRatio", "xMidYMin meet");
        svg.setAttribute("aria-label", "Diagrama unifilar do CF-CCM-U01");

        Object.assign(svg.style, {
            display: "block",
            width: "100%",
            minWidth: "1180px",
            height: "auto",
            background: "#ffffff"
        });

        const bus = this.getBusState();

        svg.innerHTML = `
            <rect x="24" y="24" width="1452" height="2168" fill="#ffffff" stroke="#a7b3bb" stroke-width="1.5" />
            ${this.identificationSvg()}
            ${this.sourcePathsSvg(bus)}
            ${this.outgoingListSvg(bus)}
            ${this.arcFlashSvg()}
            ${this.informationPanelsSvg(bus)}
        `;

        this.bindDiagramCommands(svg);
        container.appendChild(svg);
    },

    identificationSvg() {
        return `
            <rect x="58" y="58" width="430" height="112" fill="#ffffff" stroke="${COLORS.deenergized}" stroke-width="2" />
            <rect x="72" y="72" width="402" height="84" rx="12" fill="#0aa8df" stroke="${COLORS.deenergized}" stroke-width="2" />
            <text x="273" y="130" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="45" font-weight="900" fill="#ffffff">CF-CCM-U01</text>
            <text x="72" y="210" font-family="Segoe UI, Arial, sans-serif" font-size="31" font-weight="500" fill="${COLORS.text}">460 V</text>
            <text x="72" y="243" font-family="Segoe UI, Arial, sans-serif" font-size="22" font-weight="500" fill="${COLORS.text}">cota 281,00</text>
            <text x="72" y="274" font-family="Segoe UI, Arial, sans-serif" font-size="15" font-style="italic" fill="${COLORS.text}">“Casa de Força - Centro de Controle de Motores</text>
            <text x="72" y="295" font-family="Segoe UI, Arial, sans-serif" font-size="15" font-style="italic" fill="${COLORS.text}">da Unidade Geradora 01”</text>
            <text x="72" y="319" font-family="Segoe UI, Arial, sans-serif" font-size="15" font-style="italic" fill="${COLORS.text}">Sala de Máquinas</text>
        `;
    },

    sourcePathsSvg(bus) {
        const x = 315;
        const trunkX = 650;
        const normalY = 790;
        const reserveY = 1045;
        const incomingX = 520;
        const normalClosed = this.state.normalClosed === true;
        const reserveClosed = this.state.reserveClosed === true;

        /*
         * A cor do caminho a montante deve representar TENSÃO REAL,
         * e não apenas a posição mecânica do DJ.
         *
         * Durante blackout:
         * 1QP B-I / B-III sem tensão -> todo o caminho fica cinza.
         */
        const normalSourceEnergized = this.state.normalAvailable === true;
        const reserveSourceEnergized = this.state.reserveAvailable === true;

        const normalSourceColor =
            normalSourceEnergized ? COLORS.normal : COLORS.off;

        const reserveSourceColor =
            reserveSourceEnergized ? COLORS.reserve : COLORS.off;

        const normalBreakerFill =
            normalClosed
                ? (normalSourceEnergized ? COLORS.closed : COLORS.deenergized)
                : COLORS.open;

        const reserveBreakerFill =
            reserveClosed
                ? (reserveSourceEnergized ? COLORS.closed : COLORS.deenergized)
                : COLORS.open;

        const normalAfter =
            normalClosed && normalSourceEnergized
                ? COLORS.normal
                : COLORS.off;

        const reserveAfter =
            reserveClosed && reserveSourceEnergized
                ? COLORS.reserve
                : COLORS.off;
        const reserveStatus = reserveClosed
            ? "FECHADO • ALIMENTANDO"
            : this.state.transferRemaining > 0
                ? `FECHAMENTO EM ${this.state.transferRemaining} s`
                : "ABERTO • 3 s";

        return `
            <g aria-label="Alimentação normal P14">
                <text x="${x}" y="390" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="18" font-weight="800" fill="${COLORS.text}">1QP - B-I</text>
                <line x1="${x}" y1="398" x2="${x}" y2="422" stroke="${normalSourceColor}" stroke-width="3" />
                <rect x="${x - 14}" y="422" width="28" height="28" fill="${normalSourceEnergized ? COLORS.closed : COLORS.deenergized}" />
                <text x="${x + 26}" y="442" font-family="Segoe UI, Arial, sans-serif" font-size="16" font-weight="700" fill="${COLORS.text}">1752-115</text>
                <line x1="${x}" y1="450" x2="${x}" y2="482" stroke="${normalSourceColor}" stroke-width="3" />
                <text x="${x - 25}" y="475" text-anchor="end" font-family="Segoe UI, Arial, sans-serif" font-size="13" fill="${COLORS.muted}">CF-STS-P14</text>
                <circle cx="${x}" cy="500" r="18" fill="#ffffff" stroke="${normalSourceColor}" stroke-width="2" />
                <circle cx="${x}" cy="520" r="18" fill="#ffffff" stroke="${normalSourceColor}" stroke-width="2" />
                <text x="${x - 35}" y="507" text-anchor="end" font-family="Segoe UI, Arial, sans-serif" font-size="14" font-weight="700" fill="${COLORS.text}">CF-TSA-P14</text>
                <text x="${x - 35}" y="526" text-anchor="end" font-family="Segoe UI, Arial, sans-serif" font-size="12" fill="${COLORS.muted}">14,4 / 0,46 kV</text>
                <text x="${x - 35}" y="543" text-anchor="end" font-family="Segoe UI, Arial, sans-serif" font-size="12" fill="${COLORS.muted}">1500 kVA</text>
                <line x1="${x}" y1="538" x2="${x}" y2="567" stroke="${normalSourceColor}" stroke-width="3" />
                <rect x="${x - 12}" y="567" width="24" height="24" fill="${normalSourceEnergized ? COLORS.closed : COLORS.deenergized}" />
                <text x="${x + 24}" y="584" font-family="Segoe UI, Arial, sans-serif" font-size="15" font-weight="700" fill="${COLORS.text}">52-E1</text>
                <line x1="${x}" y1="591" x2="${x}" y2="625" stroke="${normalSourceColor}" stroke-width="3" />
                <rect x="195" y="625" width="240" height="54" fill="#ffffff" stroke="${COLORS.deenergized}" stroke-width="1.5" />
                <line x1="220" y1="652" x2="410" y2="652" stroke="${normalSourceColor}" stroke-width="3" />
                <text x="180" y="660" text-anchor="end" font-family="Segoe UI, Arial, sans-serif" font-size="19" font-weight="700" fill="${COLORS.text}">CF-pCA-P14</text>
                <line x1="${x}" y1="679" x2="${x}" y2="704" stroke="${normalSourceColor}" stroke-width="3" />
                <rect x="${x - 13}" y="704" width="26" height="26" fill="${normalSourceEnergized ? COLORS.closed : COLORS.deenergized}" />
                <text x="${x - 25}" y="723" text-anchor="end" font-family="Segoe UI, Arial, sans-serif" font-size="16" font-weight="700" fill="${COLORS.text}">52-1</text>
                <line x1="${x}" y1="730" x2="${x}" y2="${normalY}" stroke="${normalSourceColor}" stroke-width="3" />
                <line x1="${x}" y1="${normalY}" x2="${incomingX - 14}" y2="${normalY}" stroke="${normalSourceColor}" stroke-width="3" />
                <rect x="${incomingX - 14}" y="${normalY - 14}" width="28" height="28" fill="${normalBreakerFill}" stroke="${normalClosed ? normalBreakerFill : COLORS.deenergized}" stroke-width="2" />
                ${normalClosed ? "" : openBreakerSymbol(incomingX - 14, normalY - 14, 28)}
                <text x="${incomingX}" y="${normalY - 25}" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="16" font-weight="800" fill="${COLORS.text}">52-21101</text>
                <text x="${incomingX}" y="${normalY + 40}" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="12" font-weight="800" fill="${normalClosed ? COLORS.closed : COLORS.muted}">${normalClosed ? "FECHADO" : "ABERTO"}</text>
                <line x1="${incomingX + 14}" y1="${normalY}" x2="${trunkX}" y2="${normalY}" stroke="${normalAfter}" stroke-width="3" />
                <rect class="ccm-incoming-command" data-side="normal" x="${incomingX - 65}" y="${normalY - 52}" width="130" height="105" rx="7" fill="#ffffff" fill-opacity="0" stroke="transparent" stroke-width="3" pointer-events="all" role="button" tabindex="0" aria-label="Comandar DJ 52-21101" />
            </g>

            <g aria-label="Alimentação reserva R14">
                <line x1="${x}" y1="${reserveY}" x2="${incomingX - 14}" y2="${reserveY}" stroke="${reserveSourceColor}" stroke-width="3" />
                <rect x="${incomingX - 14}" y="${reserveY - 14}" width="28" height="28" fill="${reserveBreakerFill}" stroke="${reserveClosed ? reserveBreakerFill : COLORS.deenergized}" stroke-width="2" />
                ${reserveClosed ? "" : openBreakerSymbol(incomingX - 14, reserveY - 14, 28)}
                <text x="${incomingX}" y="${reserveY - 25}" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="16" font-weight="800" fill="${COLORS.text}">52-21102</text>
                <text x="${incomingX}" y="${reserveY + 40}" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="12" font-weight="800" fill="${reserveClosed ? COLORS.closed : this.state.transferRemaining > 0 ? COLORS.warning : COLORS.muted}">${escapeXml(reserveStatus)}</text>
                <line x1="${incomingX + 14}" y1="${reserveY}" x2="${trunkX}" y2="${reserveY}" stroke="${reserveAfter}" stroke-width="3" />
                <rect class="ccm-incoming-command" data-side="reserve" x="${incomingX - 65}" y="${reserveY - 52}" width="130" height="105" rx="7" fill="#ffffff" fill-opacity="0" stroke="transparent" stroke-width="3" pointer-events="all" role="button" tabindex="0" aria-label="Comandar DJ 52-21102" />
                <line x1="${x}" y1="${reserveY}" x2="${x}" y2="1105" stroke="${reserveSourceColor}" stroke-width="3" />
                <rect x="${x - 13}" y="1105" width="26" height="26" fill="${reserveSourceEnergized ? COLORS.closed : COLORS.deenergized}" />
                <text x="${x - 25}" y="1124" text-anchor="end" font-family="Segoe UI, Arial, sans-serif" font-size="16" font-weight="700" fill="${COLORS.text}">52-1</text>
                <line x1="${x}" y1="1131" x2="${x}" y2="1160" stroke="${reserveSourceColor}" stroke-width="3" />
                <rect x="195" y="1160" width="240" height="54" fill="#ffffff" stroke="${COLORS.deenergized}" stroke-width="1.5" />
                <line x1="220" y1="1187" x2="410" y2="1187" stroke="${reserveSourceColor}" stroke-width="3" />
                <text x="180" y="1195" text-anchor="end" font-family="Segoe UI, Arial, sans-serif" font-size="19" font-weight="700" fill="${COLORS.text}">CF-pCA-R14</text>
                <line x1="${x}" y1="1214" x2="${x}" y2="1283" stroke="${reserveSourceColor}" stroke-width="3" />
                <rect x="${x - 12}" y="1283" width="24" height="24" fill="${reserveSourceEnergized ? COLORS.closed : COLORS.deenergized}" />
                <text x="${x + 24}" y="1300" font-family="Segoe UI, Arial, sans-serif" font-size="15" font-weight="700" fill="${COLORS.text}">52-E1</text>
                <line x1="${x}" y1="1307" x2="${x}" y2="1336" stroke="${reserveSourceColor}" stroke-width="3" />
                <circle cx="${x}" cy="1354" r="18" fill="#ffffff" stroke="${reserveSourceColor}" stroke-width="2" />
                <circle cx="${x}" cy="1374" r="18" fill="#ffffff" stroke="${reserveSourceColor}" stroke-width="2" />
                <text x="${x - 35}" y="1360" text-anchor="end" font-family="Segoe UI, Arial, sans-serif" font-size="14" font-weight="700" fill="${COLORS.text}">CF-TSA-R14</text>
                <text x="${x - 35}" y="1379" text-anchor="end" font-family="Segoe UI, Arial, sans-serif" font-size="12" fill="${COLORS.muted}">14,4 / 0,46 kV</text>
                <text x="${x - 35}" y="1396" text-anchor="end" font-family="Segoe UI, Arial, sans-serif" font-size="12" fill="${COLORS.muted}">1500 kVA</text>
                <line x1="${x}" y1="1392" x2="${x}" y2="1425" stroke="${reserveSourceColor}" stroke-width="3" />
                <text x="${x - 25}" y="1420" text-anchor="end" font-family="Segoe UI, Arial, sans-serif" font-size="13" fill="${COLORS.muted}">CF-STS-R14</text>
                <rect x="${x - 14}" y="1425" width="28" height="28" fill="${reserveSourceEnergized ? COLORS.closed : COLORS.deenergized}" />
                <text x="${x + 26}" y="1445" font-family="Segoe UI, Arial, sans-serif" font-size="16" font-weight="700" fill="${COLORS.text}">1752-123</text>
                <line x1="${x}" y1="1453" x2="${x}" y2="1477" stroke="${reserveSourceColor}" stroke-width="3" />
                <text x="${x}" y="1500" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="18" font-weight="800" fill="${COLORS.text}">1QP - B-III</text>
            </g>

            <line x1="${trunkX}" y1="72" x2="${trunkX}" y2="2000" stroke="${bus.color}" stroke-width="3" />
            <text x="${trunkX - 16}" y="990" text-anchor="middle" transform="rotate(-90 ${trunkX - 16} 990)" font-family="Segoe UI, Arial, sans-serif" font-size="14" font-weight="800" fill="${bus.color}">BARRAMENTO 460 V • ${escapeXml(bus.source)}</text>
        `;
    },

    outgoingListSvg(bus) {
        const firstStart = 92;
        const secondStart = 1110;
        const rowHeight = 43;
        const first = this.state.outgoing.slice(0, 19);
        const second = this.state.outgoing.slice(19);

        const firstRows = first.map((item, index) =>
            this.outgoingRowSvg(item, firstStart + index * rowHeight, bus)
        ).join("");
        const secondRows = second.map((item, index) =>
            this.outgoingRowSvg(item, secondStart + index * rowHeight, bus)
        ).join("");

        return `
            <g aria-label="Saídas do CF-CCM-U01">
                ${firstRows}
                ${secondRows}
            </g>
        `;
    },

    outgoingRowSvg(item, y, bus) {
        const trunkX = 650;
        const breakerX = 680;
        const breakerY = y - 10;
        const size = 20;
        const closed = item.closed === true;
        const fill = closed
            ? bus.energized ? COLORS.closed : COLORS.deenergized
            : COLORS.open;
        const lineColor = closed && bus.energized ? bus.color : COLORS.off;
        const status = closed
            ? bus.energized ? "LIGADO" : "SEM TENSÃO"
            : "ABERTO";
        const statusColor = closed
            ? bus.energized ? COLORS.closed : COLORS.deenergized
            : COLORS.muted;

        if (item.id === "52-21103") {
            return this.gaeOutgoingSvg(item, y, bus, fill, lineColor, status, statusColor);
        }

        const lines = wrapLabel(item.label, 62);
        const label = lines.map((line, index) => `
            <tspan x="855" dy="${index === 0 ? 0 : 14}">${escapeXml(line)}</tspan>
        `).join("");

        return `
            <g class="ccm-outgoing-command" data-breaker-id="${escapeXml(item.id)}" role="button" tabindex="0" aria-label="Comandar DJ ${escapeXml(item.id)} - ${escapeXml(item.label)}">
                <rect class="ccm-outgoing-hitbox" x="645" y="${y - 19}" width="790" height="38" rx="4" fill="#ffffff" fill-opacity="0" stroke="transparent" stroke-width="2" pointer-events="all" />
                <line x1="${trunkX}" y1="${y}" x2="${breakerX}" y2="${y}" stroke="${bus.energized ? bus.color : COLORS.off}" stroke-width="2" />
                <rect x="${breakerX}" y="${breakerY}" width="${size}" height="${size}" fill="${fill}" stroke="${closed ? fill : COLORS.deenergized}" stroke-width="1.6" />
                ${closed ? "" : openBreakerSymbol(breakerX, breakerY, size, item.openSymbol)}
                <text x="712" y="${y - 2}" font-family="Segoe UI, Arial, sans-serif" font-size="12.5" font-weight="800" fill="${COLORS.text}">${escapeXml(item.id)}</text>
                <text x="712" y="${y + 13}" font-family="Segoe UI, Arial, sans-serif" font-size="9.5" font-weight="800" fill="${statusColor}">${status}</text>
                <line x1="790" y1="${y}" x2="830" y2="${y}" stroke="${lineColor}" stroke-width="2" />
                <polygon points="830,${y - 6} 842,${y} 830,${y + 6}" fill="${lineColor}" />
                <text x="855" y="${y - 3}" font-family="Segoe UI, Arial, sans-serif" font-size="12.5" font-weight="600" fill="${item.reserve ? COLORS.muted : COLORS.text}">${label}</text>
            </g>
        `;
    },

    gaeOutgoingSvg(item, y, bus, fill, lineColor, status, statusColor) {
        /*
         * Estado real do GAE PROV dentro do diagrama do CCM-U01.
         *
         * 52-1   = DJ principal do grupo gerador.
         * 21103  = acoplamento do GAE ao CCM-U01.
         *
         * O círculo identifica o GERADOR EM OPERAÇÃO assim que o 52-1 fecha.
         * O trecho até o barramento fica ciano somente quando 52-1 + 21103
         * estiverem fechados e o CCM estiver efetivamente alimentado pelo GAE.
         */
        const gaeRunning =
            Engine.isGaeBreakerClosed?.("52-1") === true;

        const gaeCoupled =
            Engine.isGaeBreakerClosed?.("21103") === true;

        const gaeSupplying =
            gaeRunning &&
            gaeCoupled &&
            bus.energized === true;

        const gaeColor =
            Engine.gaeEmergencyColor ?? "#00B8D9";

        const gaeBreakerFill =
            gaeRunning
                ? COLORS.closed
                : COLORS.open;

        const gaeBreakerStroke =
            gaeRunning
                ? COLORS.closed
                : COLORS.deenergized;

        const gaeLineColor =
            gaeRunning
                ? gaeColor
                : COLORS.off;

        const gaeCircleFill =
            gaeRunning
                ? gaeColor
                : "#ffffff";

        const gaeCircleStroke =
            gaeRunning
                ? gaeColor
                : COLORS.deenergized;

        const gaeTextColor =
            gaeRunning
                ? "#ffffff"
                : COLORS.text;

        const busSideColor =
            gaeSupplying
                ? gaeColor
                : (bus.energized ? bus.color : COLORS.off);

        return `
            <g class="ccm-outgoing-command" data-breaker-id="${escapeXml(item.id)}" role="button" tabindex="0" aria-label="Comandar DJ ${escapeXml(item.id)} - Alimentação do GAE-1">
                <rect class="ccm-outgoing-hitbox" x="645" y="${y - 22}" width="790" height="55" rx="4" fill="#ffffff" fill-opacity="0" stroke="transparent" stroke-width="2" pointer-events="all" />

                <line x1="650" y1="${y}" x2="680" y2="${y}" stroke="${busSideColor}" stroke-width="2" />

                <rect x="680" y="${y - 10}" width="20" height="20" fill="${fill}" stroke="${item.closed ? fill : COLORS.deenergized}" stroke-width="1.6" />
                ${item.closed ? "" : openBreakerSymbol(680, y - 10, 20, item.openSymbol)}
                <text x="712" y="${y - 2}" font-family="Segoe UI, Arial, sans-serif" font-size="12.5" font-weight="800" fill="${COLORS.text}">${escapeXml(item.id)}</text>
                <text x="712" y="${y + 13}" font-family="Segoe UI, Arial, sans-serif" font-size="9.5" font-weight="800" fill="${statusColor}">${status}</text>

                <line x1="790" y1="${y}" x2="930" y2="${y}" stroke="${gaeSupplying ? gaeColor : lineColor}" stroke-width="2" />

                <rect x="930" y="${y - 10}" width="20" height="20" fill="${gaeBreakerFill}" stroke="${gaeBreakerStroke}" stroke-width="1.6" />
                ${gaeRunning ? "" : openBreakerSymbol(930, y - 10, 20)}
                <text x="919" y="${y - 16}" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="11" fill="${COLORS.text}">52-nnnn</text>

                <line x1="950" y1="${y}" x2="1010" y2="${y}" stroke="${gaeLineColor}" stroke-width="2" />

                <circle cx="1038" cy="${y}" r="27" fill="${gaeCircleFill}" stroke="${gaeCircleStroke}" stroke-width="2" />
                <circle cx="1038" cy="${y}" r="22" fill="none" stroke="${gaeRunning ? "#ffffff" : COLORS.deenergized}" stroke-width="1" />
                <text x="1038" y="${y + 5}" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="12" font-weight="700" fill="${gaeTextColor}">GAE-1</text>
            </g>
        `;
    },

    arcFlashSvg() {
        const x = 770;
        const y = 910;
        return `
            <g aria-label="Aviso de risco de arco elétrico">
                <rect x="${x}" y="${y}" width="650" height="170" fill="#fff9b8" stroke="${COLORS.deenergized}" stroke-width="2" />
                <rect x="${x}" y="${y}" width="650" height="42" fill="#ef1111" stroke="${COLORS.deenergized}" stroke-width="2" />
                <text x="${x + 325}" y="${y + 31}" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="28" font-weight="900" fill="#000000">⚠ PERIGO</text>
                <text x="${x + 325}" y="${y + 65}" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="14" fill="${COLORS.text}">Risco de Arco Elétrico e Choque - EPI Recomendado</text>
                <line x1="${x}" y1="${y + 75}" x2="${x + 650}" y2="${y + 75}" stroke="${COLORS.deenergized}" stroke-width="1" />
                <text x="${x + 18}" y="${y + 96}" font-family="Segoe UI, Arial, sans-serif" font-size="12" fill="#d60000">Distância de segurança:</text>
                <text x="${x + 250}" y="${y + 96}" font-family="Segoe UI, Arial, sans-serif" font-size="12" font-weight="700" fill="${COLORS.text}">1,07 m</text>
                <text x="${x + 18}" y="${y + 117}" font-family="Segoe UI, Arial, sans-serif" font-size="12" fill="#d60000">Energia incidente:</text>
                <text x="${x + 250}" y="${y + 117}" font-family="Segoe UI, Arial, sans-serif" font-size="12" font-weight="700" fill="${COLORS.text}">2,3 cal/cm²</text>
                <text x="${x + 18}" y="${y + 138}" font-family="Segoe UI, Arial, sans-serif" font-size="12" fill="#d60000">EPI recomendado:</text>
                <text x="${x + 250}" y="${y + 138}" font-family="Segoe UI, Arial, sans-serif" font-size="12" font-weight="700" fill="${COLORS.text}">RISCO 2</text>
                <text x="${x + 18}" y="${y + 158}" font-family="Segoe UI, Arial, sans-serif" font-size="10.5" fill="${COLORS.text}">Vestimenta risco 2, capacete com viseira, balaclava, óculos, luva classe 00 e calçado de segurança.</text>
            </g>
        `;
    },

    informationPanelsSvg(bus) {
        const events = this.state.events.slice(0, 4);
        const eventRows = events.map((event, index) => `
            <text x="765" y="${2048 + index * 25}" font-family="Consolas, monospace" font-size="12" font-weight="600" fill="${COLORS.text}">${escapeXml(event.time)} • ${escapeXml(event.equipment)} • ${escapeXml(event.message)}</text>
        `).join("");

        return `
            <rect x="70" y="1635" width="500" height="135" fill="#ffffff" stroke="${COLORS.deenergized}" stroke-width="1.5" />
            <text x="90" y="1665" font-family="Segoe UI, Arial, sans-serif" font-size="17" font-weight="700" fill="${COLORS.text}">Alimentações em Corrente Contínua:</text>
            <text x="110" y="1702" font-family="Segoe UI, Arial, sans-serif" font-size="14" fill="${COLORS.text}">• 72-33 - CF-pCC-P14 (125 Vcc)</text>
            <text x="110" y="1733" font-family="Segoe UI, Arial, sans-serif" font-size="14" fill="${COLORS.text}">• 72-33 - CF-pCC-R14 (125 Vcc)</text>

            <text x="70" y="1810" font-family="Segoe UI, Arial, sans-serif" font-size="17" font-weight="700" fill="${COLORS.text}">Legenda</text>
            <rect x="70" y="1825" width="500" height="330" fill="#ffffff" stroke="${COLORS.deenergized}" stroke-width="1.5" />
            <text x="90" y="1855" font-family="Segoe UI, Arial, sans-serif" font-size="16" font-weight="700" fill="${COLORS.text}">Disjuntores</text>
            <rect x="90" y="1878" width="28" height="28" fill="${COLORS.closed}" />
            <text x="135" y="1898" font-family="Segoe UI, Arial, sans-serif" font-size="13" fill="${COLORS.text}">Disjuntor fechado e energizado</text>
            <rect x="90" y="1920" width="28" height="28" fill="${COLORS.deenergized}" />
            <text x="135" y="1940" font-family="Segoe UI, Arial, sans-serif" font-size="13" fill="${COLORS.text}">Disjuntor fechado sem tensão</text>
            <rect x="90" y="1962" width="28" height="28" fill="#ffffff" stroke="${COLORS.deenergized}" stroke-width="2" />
            <path d="M 90 1990 L 118 1962 L 90 1962 Z" fill="${COLORS.deenergized}" />
            <text x="135" y="1982" font-family="Segoe UI, Arial, sans-serif" font-size="13" fill="${COLORS.text}">Ligado - desliga-se por falta de tensão</text>
            <rect x="90" y="2004" width="28" height="28" fill="#ffffff" stroke="${COLORS.deenergized}" stroke-width="2" />
            <line x1="94" y1="2028" x2="114" y2="2008" stroke="${COLORS.deenergized}" stroke-width="2" />
            <text x="135" y="2024" font-family="Segoe UI, Arial, sans-serif" font-size="13" fill="${COLORS.text}">Desligado com operação automática e pré-seleção</text>
            <rect x="90" y="2046" width="28" height="28" fill="#ffffff" stroke="${COLORS.deenergized}" stroke-width="2" />
            <path d="M 90 2074 L 118 2046 L 90 2046 Z" fill="${COLORS.deenergized}" />
            ${openBreakerSymbol(90, 2046, 28)}
            <text x="135" y="2066" font-family="Segoe UI, Arial, sans-serif" font-size="13" fill="${COLORS.text}">Ligado com operação automática</text>
            <rect x="90" y="2088" width="28" height="28" fill="#ffffff" stroke="${COLORS.deenergized}" stroke-width="2" />
            ${openBreakerSymbol(90, 2088, 28)}
            <text x="135" y="2108" font-family="Segoe UI, Arial, sans-serif" font-size="13" fill="${COLORS.text}">Desligado com operação automática</text>
            <text x="70" y="2180" font-family="Segoe UI, Arial, sans-serif" font-size="13" font-weight="700" fill="${COLORS.muted}">Revisão: Junho / 2026</text>

            <rect x="735" y="2000" width="700" height="150" rx="6" fill="#f8fafc" stroke="${COLORS.border}" stroke-width="1.5" />
            <text x="755" y="2029" font-family="Segoe UI, Arial, sans-serif" font-size="15" font-weight="800" fill="${COLORS.text}">EVENTOS DO PAINEL • FONTE ATUAL: ${escapeXml(bus.source)}</text>
            ${eventRows || `<text x="765" y="2060" font-family="Segoe UI, Arial, sans-serif" font-size="13" fill="${COLORS.muted}">Nenhum evento registrado.</text>`}
        `;
    },

    bindDiagramCommands(svg) {
        const incomingCommands = svg.querySelectorAll(".ccm-incoming-command");
        incomingCommands.forEach(command => {
            const execute = event => {
                event.preventDefault();
                event.stopPropagation();

                if (command.dataset.side === "normal") {
                    this.commandNormalIncoming();
                } else if (command.dataset.side === "reserve") {
                    this.commandReserveIncoming();
                }
            };

            this.bindCommandElement(command, execute);
        });

        const outgoingCommands = svg.querySelectorAll(".ccm-outgoing-command");
        outgoingCommands.forEach(command => {
            const execute = event => {
                event.preventDefault();
                event.stopPropagation();
                this.toggleOutgoing(command.dataset.breakerId);
            };

            this.bindCommandElement(command, execute);
        });
    },

    bindCommandElement(element, execute) {
        element.style.cursor = "pointer";

        element.addEventListener("pointerenter", () => {
            const hitbox = element.classList.contains("ccm-outgoing-command")
                ? element.querySelector(".ccm-outgoing-hitbox")
                : null;
            hitbox?.setAttribute("stroke", "#0078d4");
        });

        element.addEventListener("pointerleave", () => {
            const hitbox = element.classList.contains("ccm-outgoing-command")
                ? element.querySelector(".ccm-outgoing-hitbox")
                : null;
            hitbox?.setAttribute("stroke", "transparent");
        });

        element.addEventListener("click", execute);
        element.addEventListener("keydown", event => {
            if (event.key === "Enter" || event.key === " ") {
                execute(event);
            }
        });
    },

    commandNormalIncoming() {

        if (
            !this.isManualMode()
        ) {

            this.showManualModeMessage(
                "52-21101"
            );

            this.addEvent(
                "DJ 52-21101",
                "COMANDO BLOQUEADO - CF-CCM-U01 EM AUTOMÁTICO"
            );

            return false;
        }

        if (this.linkedToEngine) {

            this.syncIncomingFromEngine(false);

            const desiredClosed =
                !this.state.normalClosed;

            const changed =
                Engine.togglePcaLoadNormalByPanelId(
                    "CCM-U01",
                    desiredClosed
                );

            this.syncIncomingFromEngine(true);

            return changed;
        }

        if (this.state.normalClosed) {
            this.startReserveTransfer();
        } else {
            this.returnToNormalSource();
        }
    },

    commandReserveIncoming() {

        if (!this.isManualMode()) {
            this.showManualModeMessage("52-21102");

            this.addEvent(
                "DJ 52-21102",
                "COMANDO BLOQUEADO - CF-CCM-U01 EM AUTOMÁTICO"
            );

            return false;
        }

        if (this.linkedToEngine) {

            this.syncIncomingFromEngine(false);

            const desiredClosed =
                !this.state.reserveClosed;

            const changed =
                Engine.togglePcaLoadReserveByPanelId?.(
                    "CCM-U01",
                    desiredClosed
                );

            this.syncIncomingFromEngine(true);

            return changed;
        }

        if (!this.state.reserveClosed && this.state.normalClosed) {
            window.alert(
                "COMANDO BLOQUEADO\nDesligue primeiro o DJ 52-21101 antes de ligar o DJ 52-21102."
            );

            return false;
        }

        this.state.reserveClosed = !this.state.reserveClosed;
        this.addEvent(
            "DJ 52-21102",
            this.state.reserveClosed
                ? "FECHADO PELO OPERADOR"
                : "ABERTO PELO OPERADOR"
        );
        this.redraw();

        return true;
    },

    startReserveTransfer() {
        clearInterval(this.transferTimer);

        this.state.normalClosed = false;
        this.state.reserveClosed = false;
        this.state.transferRemaining = 3;
        this.addEvent("DJ 52-21101", "ABERTO - INICIADA TRANSFERÊNCIA");
        this.redraw();

        this.transferTimer = setInterval(() => {
            this.state.transferRemaining -= 1;

            if (this.state.transferRemaining <= 0) {
                clearInterval(this.transferTimer);
                this.transferTimer = null;
                this.state.transferRemaining = 0;

                if (this.state.reserveAvailable) {
                    this.state.reserveClosed = true;
                    this.addEvent("DJ 52-21102", "FECHADO AUTOMATICAMENTE - R14 ALIMENTA");
                } else {
                    this.addEvent("DJ 52-21102", "FALHA - FONTE R14 INDISPONÍVEL");
                }
            }

            this.redraw();
        }, 1000);
    },

    returnToNormalSource() {
        clearInterval(this.transferTimer);
        this.transferTimer = null;

        // Break-before-make: abre R14 antes de fechar P14.
        this.state.reserveClosed = false;
        this.state.transferRemaining = 0;
        this.state.normalClosed = true;
        this.addEvent("DJ 52-21101", "FECHADO - CONDIÇÃO NORMAL RESTABELECIDA");
        this.redraw();
    },

    toggleOutgoing(breakerId) {

        if (
            !this.isManualMode()
        ) {

            this.showManualModeMessage(
                breakerId
            );

            this.addEvent(
                `DJ ${breakerId}`,
                "COMANDO BLOQUEADO - CF-CCM-U01 EM AUTOMÁTICO"
            );

            return false;
        }

        const breaker = this.state.outgoing.find(item => item.id === breakerId);
        if (!breaker) return;

        breaker.closed = !breaker.closed;
        this.addEvent(
            `DJ ${breaker.id}`,
            breaker.closed ? "FECHADO PELO OPERADOR" : "ABERTO PELO OPERADOR"
        );
        this.redraw();
    }
};
