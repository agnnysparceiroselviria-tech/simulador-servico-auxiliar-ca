import { Engine } from "./Engine.js";
import { PanelDetailDatabase } from "./PanelDetailDatabase.js";

const SVG_NS = "http://www.w3.org/2000/svg";

export class PanelDetail {

    static overlay = null;

    static activePanelId = null;

    static transferTimer = null;

    static open(panelId) {
        if (!PanelDetailDatabase.has(panelId)) return false;

        this.close();
        this.activePanelId = panelId;

        const overlay = document.createElement("div");
        overlay.id = "panelDetailOverlay";
        overlay.className = "panel-detail-overlay";
        Object.assign(overlay.style, {
            position: "fixed",
            top: "0",
            right: "0",
            bottom: "0",
            left: "0",
            zIndex: "99999",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            background: "#ffffff"
        });

        const svg = document.createElementNS(SVG_NS, "svg");
        svg.id = "panelDetailSvg";
        svg.setAttribute("viewBox", "0 0 10000 7000");
        svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
        svg.setAttribute("role", "img");
        svg.setAttribute(
            "aria-label",
            `Diagrama detalhado do painel ${panelId}`
        );
        Object.assign(svg.style, {
            display: "block",
            width: "100%",
            height: "100%",
            background: "#ffffff"
        });

        overlay.appendChild(svg);
        overlay.setAttribute("tabindex", "-1");
        overlay.addEventListener("keydown", event => {
            if (event.key === "Escape") this.close();
        });
        document.body.appendChild(overlay);

        this.overlay = overlay;
        try {
            this.refresh();
        } catch (error) {
            console.error(
                "[PanelDetail] Falha ao desenhar o painel.",
                error
            );

            svg.innerHTML = "";
            const message = document.createElementNS(SVG_NS, "text");
            message.setAttribute("x", "5000");
            message.setAttribute("y", "3200");
            message.setAttribute("text-anchor", "middle");
            message.setAttribute("font-size", "90");
            message.setAttribute("fill", "#b00020");
            message.textContent =
                "Falha ao carregar o diagrama do CCM-U01";
            svg.appendChild(message);

            const detail = document.createElementNS(SVG_NS, "text");
            detail.setAttribute("x", "5000");
            detail.setAttribute("y", "3370");
            detail.setAttribute("text-anchor", "middle");
            detail.setAttribute("font-size", "45");
            detail.setAttribute("fill", "#263238");
            detail.textContent = error?.message ?? "Erro desconhecido";
            svg.appendChild(detail);
        }
        overlay.focus();
        return true;
    }

    static close() {
        clearTimeout(this.transferTimer);
        this.transferTimer = null;
        this.overlay?.remove();
        this.overlay = null;
        this.activePanelId = null;
    }

    static exit() {
        if (
            document.body?.dataset
                ?.panelDetailStandalone === "true"
        ) {
            window.location.href = "/";
            return;
        }

        if (
            String(window.location.hash)
                .toLowerCase() === "#ccm-u01"
        ) {
            window.history.replaceState(
                null,
                "",
                window.location.pathname +
                    window.location.search
            );
        }

        this.close();
    }

    static refresh() {
        const svg = this.overlay?.querySelector("#panelDetailSvg");
        if (!svg || !this.activePanelId) return;

        svg.innerHTML = "";
        this.draw(svg, this.activePanelId, {
            onBack: () => this.exit()
        });
    }

    static element(type, attributes = {}, text = null) {
        const element = document.createElementNS(SVG_NS, type);

        Object.entries(attributes).forEach(([name, value]) => {
            if (value !== undefined && value !== null) {
                element.setAttribute(name, String(value));
            }
        });

        if (text !== null) {
            element.textContent = text;
        }

        return element;
    }

    static line(group, x1, y1, x2, y2, color, width = 8) {
        group.appendChild(this.element("line", {
            x1, y1, x2, y2,
            stroke: color,
            "stroke-width": width,
            "stroke-linecap": "square"
        }));
    }

    static text(group, x, y, value, size = 42, options = {}) {
        const text = this.element("text", {
            x, y,
            fill: options.color ?? "#263238",
            "font-size": size,
            "font-family": "Segoe UI, Arial, sans-serif",
            "font-weight": options.weight ?? 600,
            "text-anchor": options.anchor ?? "start"
        }, value);
        group.appendChild(text);
        return text;
    }

    static button(group, x, y, width, height, label, options = {}) {
        const button = this.element("g", {
            class: `panel-detail-button ${options.className ?? ""}`,
            role: "button",
            tabindex: "0"
        });

        button.style.cursor = "pointer";
        button.appendChild(this.element("rect", {
            x, y, width, height,
            rx: 12,
            fill: options.fill ?? "#ffffff",
            stroke: options.stroke ?? "#3f657d",
            "stroke-width": 4
        }));

        this.text(
            button,
            x + width / 2,
            y + height / 2 + 15,
            label,
            options.fontSize ?? 38,
            { anchor: "middle", weight: 700 }
        );

        const command = event => {
            event.preventDefault();
            event.stopPropagation();
            options.onClick?.();
        };

        button.addEventListener("click", command);
        button.addEventListener("keydown", event => {
            if (event.key === "Enter" || event.key === " ") command(event);
        });

        group.appendChild(button);
        return button;
    }

    static breaker(group, data = {}) {
        const size = data.size ?? 56;
        const left = data.x - size / 2;
        const top = data.y - size / 2;
        const closed = data.closed === true;
        const energized = data.energized === true;
        const fill = closed
            ? (energized ? "#d60000" : "#000000")
            : "#ffffff";

        const breaker = this.element("g", {
            class: "panel-detail-breaker",
            "data-breaker-id": data.id,
            "data-closed": closed ? "true" : "false"
        });

        breaker.appendChild(this.element("rect", {
            x: left,
            y: top,
            width: size,
            height: size,
            fill,
            stroke: closed ? fill : "#263238",
            "stroke-width": 5
        }));

        if (!closed) {
            this.line(breaker, left + 9, top + 9, left + size - 9, top + size - 9, "#263238", 4);
            this.line(breaker, left + size - 9, top + 9, left + 9, top + size - 9, "#263238", 4);
        }

        if (data.interactive !== false) {
            breaker.style.cursor = "pointer";
            breaker.setAttribute("role", "button");
            breaker.setAttribute("tabindex", "0");

            const command = event => {
                event.preventDefault();
                event.stopPropagation();
                data.onCommand?.();
            };

            breaker.addEventListener("click", command);
            breaker.addEventListener("keydown", event => {
                if (event.key === "Enter" || event.key === " ") command(event);
            });
        }

        group.appendChild(breaker);
        return breaker;
    }

    static showMessage(message) {
        if (typeof Engine.showOperationMessage === "function") {
            Engine.showOperationMessage(message);
            return;
        }

        window.alert(message);
    }

    static notify(panelId, breakerId, closed) {
        if (
            String(breakerId).toUpperCase() === "MODE"
        ) {
            Engine.setPanelOperationMode?.(
                panelId,
                closed
            );
        }

        this.refresh();

        window.dispatchEvent(new CustomEvent("scada:panel-detail-state-changed", {
            detail: { panelId, breakerId, closed }
        }));
    }

    static commandOutgoing(panel, breaker, busEnergized) {
        if (panel.operationMode !== "MANUAL") {
            this.showMessage(
                `COMANDO BLOQUEADO\nO DJ ${breaker.id} está sob controle automático do ${panel.title}. Selecione o painel em MANUAL para realizar esta operação.`
            );
            return;
        }

        if (!breaker.closed && !busEnergized) {
            this.showMessage(
                `COMANDO BLOQUEADO\nNão há tensão no barramento do ${panel.title} para fechar o DJ ${breaker.id}.`
            );
            return;
        }

        const changed = PanelDetailDatabase.toggleOutgoing(
            panel.id,
            breaker.id
        );

        if (changed) {
            PanelDetailDatabase.addEvent(
                panel.id,
                `DJ ${changed.id}`,
                changed.closed ? "FECHADO PELO OPERADOR" : "ABERTO PELO OPERADOR",
                changed.closed ? "success" : "warning"
            );
            this.notify(panel.id, changed.id, changed.closed);
        }
    }

    static commandIncoming(panel, side) {
        const runtime = panel.runtime;

        if (panel.operationMode !== "MANUAL") {
            this.showMessage(
                `COMANDO BLOQUEADO\nO ${panel.title} está em AUTOMÁTICO. Selecione MANUAL para comandar as entradas.`
            );
            return;
        }

        const isNormal = side === "normal";
        const closedKey = isNormal ? "normalClosed" : "reserveClosed";
        const otherClosedKey = isNormal ? "reserveClosed" : "normalClosed";
        const availableKey = isNormal ? "normalAvailable" : "reserveAvailable";
        const breakerId = isNormal ? panel.normalIncoming : panel.reserveIncoming;

        const sharedState =
            Engine.getPcaLoadTransferState?.(panel.id);

        if (sharedState) {
            const changed = isNormal
                ? Engine.togglePcaLoadNormalByPanelId?.(panel.id)
                : Engine.togglePcaLoadReserveByPanelId?.(panel.id);

            if (!changed) {
                return;
            }

            const updatedState =
                Engine.getPcaLoadTransferState?.(panel.id);

            if (updatedState) {
                runtime.normalClosed = updatedState.normalClosed;
                runtime.reserveClosed = updatedState.reserveClosed;
                runtime.normalAvailable = updatedState.normalAvailable;
                runtime.reserveAvailable = updatedState.reserveAvailable;
            }

            const nowClosed = isNormal
                ? runtime.normalClosed
                : runtime.reserveClosed;

            PanelDetailDatabase.addEvent(
                panel.id,
                `DJ ${breakerId}`,
                nowClosed ? "FECHADO PELO OPERADOR" : "ABERTO PELO OPERADOR",
                nowClosed ? "success" : "warning"
            );

            this.notify(panel.id, breakerId, nowClosed);
            return;
        }

        if (!runtime[closedKey]) {
            if (!runtime[availableKey]) {
                this.showMessage(`COMANDO BLOQUEADO\nA fonte do DJ ${breakerId} está indisponível.`);
                return;
            }

            if (runtime[otherClosedKey]) {
                this.showMessage(
                    `COMANDO BLOQUEADO\nAbra a outra entrada antes de fechar o DJ ${breakerId}. Paralelismo de fontes não permitido.`
                );
                return;
            }
        }

        runtime[closedKey] = !runtime[closedKey];
        PanelDetailDatabase.addEvent(
            panel.id,
            `DJ ${breakerId}`,
            runtime[closedKey] ? "FECHADO PELO OPERADOR" : "ABERTO PELO OPERADOR",
            runtime[closedKey] ? "success" : "warning"
        );
        this.notify(panel.id, breakerId, runtime[closedKey]);
    }

    static simulateNormalLoss(panel) {
        const runtime = panel.runtime;
        clearTimeout(this.transferTimer);

        runtime.normalAvailable = false;
        runtime.normalClosed = false;
        runtime.transferring = panel.operationMode === "AUTO";

        PanelDetailDatabase.addEvent(
            panel.id,
            "P14",
            "FALTA DE TENSÃO NA FONTE NORMAL",
            "danger"
        );

        if (panel.operationMode === "AUTO") {
            PanelDetailDatabase.addEvent(
                panel.id,
                panel.reserveIncoming,
                "TRANSFERÊNCIA AUTOMÁTICA INICIADA — 3 s",
                "warning"
            );

            this.transferTimer = setTimeout(() => {
                runtime.transferring = false;

                if (runtime.reserveAvailable) {
                    runtime.reserveClosed = true;
                    PanelDetailDatabase.addEvent(
                        panel.id,
                        `DJ ${panel.reserveIncoming}`,
                        "FECHADO AUTOMATICAMENTE — R14 ALIMENTA O CCM-U01",
                        "success"
                    );
                }

                this.notify(panel.id, panel.reserveIncoming, runtime.reserveClosed);
            }, 3000);
        }

        this.notify(panel.id, panel.normalIncoming, false);
    }

    static normalizeNormalSource(panel) {
        const runtime = panel.runtime;
        clearTimeout(this.transferTimer);
        runtime.transferring = false;
        runtime.normalAvailable = true;

        if (panel.operationMode === "AUTO") {
            runtime.reserveClosed = false;
            runtime.normalClosed = true;
        }

        PanelDetailDatabase.addEvent(
            panel.id,
            "P14",
            panel.operationMode === "AUTO"
                ? "FONTE NORMAL RESTABELECIDA — RETORNO AUTOMÁTICO CONCLUÍDO"
                : "FONTE NORMAL DISPONÍVEL",
            "success"
        );
        this.notify(panel.id, panel.normalIncoming, runtime.normalClosed);
    }

    static resetSimulation(panel) {
        clearTimeout(this.transferTimer);
        this.transferTimer = null;
        PanelDetailDatabase.reset(panel.id);
        this.notify(panel.id, "RESET", true);
    }

    static draw(layer, panelId, options = {}) {
        const panel = PanelDetailDatabase.get(panelId);
        if (!layer || !panel) return null;

        const root = this.element("g", {
            id: `panel-detail-${panel.id}`,
            class: "panel-detail-view"
        });

        const load = Engine.getPcaLoad?.(
            panel.groupId,
            panel.loadId
        );

        const runtime = panel.runtime;
        const normalClosed = runtime.normalClosed === true;
        const reserveClosed = runtime.reserveClosed === true;
        const normalFeeding = normalClosed && runtime.normalAvailable;
        const reserveFeeding = reserveClosed && runtime.reserveAvailable;

        /*
         * CM-11 e CM-12 possuem alimentação de emergência pelo GAE-2.
         * PDF de referência:
         *
         * CM-11: 1752-250 -> 1752-254 -> GAE-2
         * CM-12: 1752-251 -> 1752-254 -> GAE-2
         */
        const gae2CouplingBreaker =
            panel.id === "CM-11"
                ? "250"
                : panel.id === "CM-12"
                    ? "251"
                    : null;

        const gae2Running =
            gae2CouplingBreaker !== null &&
            Engine.isGaeBreakerClosed?.("254") === true;

        const gae2Coupled =
            gae2CouplingBreaker !== null &&
            Engine.isGaeBreakerClosed?.(gae2CouplingBreaker) === true;

        const gae2Feeding =
            gae2Running &&
            gae2Coupled;

        const busEnergized =
            normalFeeding ||
            reserveFeeding ||
            gae2Feeding;

        const suppliedBy =
            gae2Feeding
                ? "GAE-2"
                : normalFeeding
                    ? "P0912"
                    : reserveFeeding
                        ? "R0912"
                        : null;

        const busColor =
            gae2Feeding
                ? (Engine.gaeEmergencyColor ?? "#00B8D9")
                : busEnergized
                    ? (normalFeeding ? panel.normal.color : panel.reserve.color)
                    : "#7a858d";

        root.appendChild(this.element("rect", {
            x: 120,
            y: 100,
            width: 9760,
            height: 6800,
            rx: 20,
            fill: "#ffffff",
            stroke: "#5e7280",
            "stroke-width": 6
        }));

        this.button(root, 250, 230, 420, 110, "← VOLTAR", {
            onClick: options.onBack,
            fill: "#eaf7ff"
        });

        this.text(root, 820, 300, panel.title, 78, { weight: 800 });
        this.text(root, 820, 375, panel.subtitle, 38, { color: "#53636c" });

        const statusLabel = busEnergized
            ? `ENERGIZADO POR ${suppliedBy}`
            : runtime.transferring
                ? "TRANSFERÊNCIA EM ANDAMENTO — 3 s"
                : "DESENERGIZADO";

        this.text(root, 9680, 290, statusLabel, 42, {
            anchor: "end",
            color: busEnergized ? busColor : "#7a858d",
            weight: 800
        });

        this.button(
            root,
            8200,
            330,
            700,
            110,
            panel.operationMode,
            {
                fill: panel.operationMode === "MANUAL" ? "#fff3cd" : "#eaf7ff",
                stroke: panel.operationMode === "MANUAL" ? "#c79b00" : "#2a789c",
                onClick: () => {
                    PanelDetailDatabase.setMode(
                        panel.id,
                        panel.operationMode === "AUTO" ? "MANUAL" : "AUTO"
                    );
                    PanelDetailDatabase.addEvent(
                        panel.id,
                        "SELETOR",
                        `MODO ${panel.operationMode}`,
                        "info"
                    );
                    this.notify(panel.id, "MODE", panel.operationMode);
                }
            }
        );
        this.text(root, 8150, 405, "MODO:", 34, { anchor: "end", color: "#53636c" });

        this.button(root, 4550, 330, 920, 110, "SIMULAR FALTA P14", {
            fill: "#fff0ed",
            stroke: "#c6402d",
            fontSize: 32,
            onClick: () => this.simulateNormalLoss(panel)
        });
        this.button(root, 5530, 330, 920, 110, "NORMALIZAR P14", {
            fill: "#eaf8ee",
            stroke: "#288647",
            fontSize: 32,
            onClick: () => this.normalizeNormalSource(panel)
        });
        this.button(root, 6510, 330, 650, 110, "RESET", {
            fill: "#f2f5f7",
            fontSize: 32,
            onClick: () => this.resetSimulation(panel)
        });

        // Entradas normal e reserva.
        this.text(root, 450, 720, "FONTES DE ENTRADA", 46, { weight: 800 });
        this.text(root, 620, 940, "P14 — NORMAL", 38, { color: "#3f7cff" });
        this.text(root, 620, 1240, "R14 — RESERVA (3 s)", 38, { color: "#44b95a" });

        this.line(root, 1750, 900, 2550, 900, normalFeeding ? busColor : "#7a858d", 10);
        this.breaker(root, {
            id: panel.normalIncoming,
            x: 2150,
            y: 900,
            closed: normalClosed,
            energized: normalFeeding,
            onCommand: () => this.commandIncoming(panel, "normal"),
            size: 68
        });
        this.text(root, 2200, 865, panel.normalIncoming, 34);
        this.text(
            root,
            620,
            1005,
            runtime.normalAvailable ? "DISPONÍVEL" : "SEM TENSÃO",
            30,
            {
                color: runtime.normalAvailable ? "#16853a" : "#c12f24",
                weight: 800
            }
        );

        this.line(root, 1750, 1200, 2550, 1200, reserveFeeding ? busColor : "#7a858d", 10);
        this.breaker(root, {
            id: panel.reserveIncoming,
            x: 2150,
            y: 1200,
            closed: reserveClosed,
            energized: reserveFeeding,
            onCommand: () => this.commandIncoming(panel, "reserve"),
            size: 68
        });
        this.text(root, 2200, 1165, panel.reserveIncoming, 34);
        this.text(
            root,
            620,
            1305,
            runtime.reserveAvailable ? "DISPONÍVEL" : "SEM TENSÃO",
            30,
            {
                color: runtime.reserveAvailable ? "#16853a" : "#c12f24",
                weight: 800
            }
        );

        // Barramento principal.
        this.line(root, 2550, 900, 2900, 900, normalClosed ? busColor : "#7a858d", 10);
        this.line(root, 2550, 1200, 2900, 1200, reserveClosed ? busColor : "#7a858d", 10);
        this.line(root, 2900, 900, 2900, 6550, busColor, 16);
        this.text(root, 2820, 690, `BARRAMENTO ${panel.voltage}`, 42, { anchor: "middle", color: busColor, weight: 800 });

        // Saídas, distribuídas em duas colunas para manter boa leitura.
        const rowsPerColumn = 20;
        const rowHeight = 275;
        const firstY = 1040;

        panel.outgoing.forEach((breaker, index) => {
            const column = Math.floor(index / rowsPerColumn);
            const row = index % rowsPerColumn;
            const busX = column === 0 ? 2900 : 6250;
            const breakerX = busX + 480;
            const labelX = breakerX + 110;
            const endX = column === 0 ? 6000 : 9550;
            const y = firstY + row * rowHeight;
            const isGae2 =
                breaker.label === "GAE-2" &&
                (panel.id === "CM-11" || panel.id === "CM-12");

            const feederEnergized = busEnergized && breaker.closed;
            const feederColor = feederEnergized ? busColor : "#7a858d";

            if (column === 1 && row === 0) {
                this.line(root, 2900, 6500, 6250, 6500, busColor, 16);
                this.line(root, 6250, 1040, 6250, 6500, busColor, 16);
            }

            if (isGae2) {
                const gaeColor =
                    Engine.gaeEmergencyColor ?? "#00B8D9";

                const couplingClosed =
                    Engine.isGaeBreakerClosed?.(gae2CouplingBreaker) === true;

                const primaryClosed =
                    Engine.isGaeBreakerClosed?.("254") === true;

                const sourceLineColor =
                    primaryClosed
                        ? gaeColor
                        : "#7a858d";

                const busSideLineColor =
                    couplingClosed && primaryClosed
                        ? gaeColor
                        : "#7a858d";

                const couplingX = breakerX;
                const primaryX = breakerX + 520;
                const generatorX = breakerX + 1040;

                this.line(
                    root,
                    busX,
                    y,
                    couplingX - 32,
                    y,
                    busSideLineColor,
                    7
                );

                this.breaker(root, {
                    id: gae2CouplingBreaker,
                    x: couplingX,
                    y,
                    closed: couplingClosed,
                    energized: couplingClosed && primaryClosed,
                    onCommand: () =>
                        Engine.toggleGaeBreaker?.(gae2CouplingBreaker),
                    size: 58
                });

                this.text(
                    root,
                    couplingX,
                    y - 52,
                    panel.id === "CM-11" ? "1752-250" : "1752-251",
                    27,
                    { anchor: "middle", weight: 800 }
                );

                this.line(
                    root,
                    couplingX + 32,
                    y,
                    primaryX - 32,
                    y,
                    sourceLineColor,
                    7
                );

                this.breaker(root, {
                    id: "254",
                    x: primaryX,
                    y,
                    closed: primaryClosed,
                    energized: primaryClosed,
                    onCommand: () =>
                        Engine.toggleGaeBreaker?.("254"),
                    size: 58
                });

                this.text(
                    root,
                    primaryX,
                    y - 52,
                    "1752-254",
                    27,
                    { anchor: "middle", weight: 800 }
                );

                this.line(
                    root,
                    primaryX + 32,
                    y,
                    generatorX - 70,
                    y,
                    sourceLineColor,
                    7
                );

                root.appendChild(
                    this.element("circle", {
                        cx: generatorX,
                        cy: y,
                        r: 70,
                        fill: primaryClosed ? gaeColor : "#ffffff",
                        stroke: primaryClosed ? gaeColor : "#263238",
                        "stroke-width": 7
                    })
                );

                root.appendChild(
                    this.element("circle", {
                        cx: generatorX,
                        cy: y,
                        r: 58,
                        fill: "none",
                        stroke: primaryClosed ? "#ffffff" : "#263238",
                        "stroke-width": 4
                    })
                );

                this.text(
                    root,
                    generatorX,
                    y + 13,
                    "GAE-2",
                    31,
                    {
                        anchor: "middle",
                        weight: 800,
                        color: primaryClosed ? "#ffffff" : "#263238"
                    }
                );

                this.text(
                    root,
                    busX - 85,
                    y - 26,
                    "2A",
                    28,
                    { anchor: "end", weight: 800 }
                );

                return;
            }

            this.line(root, busX, y, endX, y, feederColor, 7);
            this.breaker(root, {
                id: breaker.id,
                x: breakerX,
                y,
                closed: breaker.closed,
                energized: feederEnergized,
                onCommand: () => this.commandOutgoing(
                    panel,
                    breaker,
                    busEnergized
                )
            });
            this.text(root, labelX, y - 28, breaker.id, 31, { weight: 800 });
            this.text(root, labelX, y + 38, breaker.label, 28, {
                color: breaker.label === "Reserva" ? "#7a858d" : "#263238",
                weight: 500
            });
        });

        // Informações de segurança retiradas do desenho de referência.
        root.appendChild(this.element("rect", {
            x: 380,
            y: 5600,
            width: 1950,
            height: 780,
            rx: 16,
            fill: "#fff8df",
            stroke: "#d0a200",
            "stroke-width": 5
        }));
        this.text(root, 500, 5740, "SEGURANÇA — ARCO ELÉTRICO", 38, { weight: 800 });
        this.text(root, 500, 5870, `Distância de trabalho: ${panel.arcFlash.distance}`, 31);
        this.text(root, 500, 5980, `Energia incidente: ${panel.arcFlash.incidentEnergy}`, 31);
        this.text(root, 500, 6090, `EPI requerido: ${panel.arcFlash.ppe}`, 31);
        if (panel.arcFlash.ppeDetail) {
            this.text(root, 500, 6185, panel.arcFlash.ppeDetail, 24, {
                color: "#53636c",
                weight: 500
            });
        }

        // Últimos eventos do simulador interno.
        root.appendChild(this.element("rect", {
            x: 380,
            y: 1550,
            width: 2200,
            height: 3650,
            rx: 16,
            fill: "#f7fafc",
            stroke: "#78909c",
            "stroke-width": 4
        }));
        this.text(root, 500, 1690, "EVENTOS DO CCM-U01", 38, { weight: 800 });

        if (runtime.events.length === 0) {
            this.text(root, 500, 1830, "Nenhum evento registrado.", 29, {
                color: "#70808a",
                weight: 500
            });
        }

        runtime.events.slice(0, 11).forEach((event, index) => {
            const y = 1840 + index * 285;
            const color =
                event.type === "danger"
                    ? "#c12f24"
                    : event.type === "warning"
                        ? "#b07800"
                        : event.type === "success"
                            ? "#16853a"
                            : "#263238";

            this.text(root, 500, y, `${event.time}  ${event.equipment}`, 27, {
                color,
                weight: 800
            });
            this.text(root, 500, y + 58, event.message, 25, {
                color: "#3f4b53",
                weight: 500
            });
        });

        layer.appendChild(root);
        return root;
    }
}

//==================================================
// ABERTURA GLOBAL DO CCM-U01
//==================================================

if (
    typeof window !== "undefined" &&
    typeof document !== "undefined" &&
    window.__ccmU01OpenHandlerInstalled !== true
) {
    window.__ccmU01OpenHandlerInstalled = true;

    const openCcmU01 = event => {
        const target = event.target;

        if (!(target instanceof Element)) return;

        const clickable = target.closest(
            ".panel-detail-link, " +
            ".panel-detail-link-label, " +
            ".pca-panel-detail-hit-area, " +
            "[data-equipment-id='CCM-U01'] .pca-load-box, " +
            "[data-equipment-id='CCM-U01'] .pca-load-label"
        );

        if (!clickable) return;

        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation?.();

        window.location.href = "/#ccm-u01";
    };

    /*
     * O modo capture=true executa antes do zoom/pan
     * existente no Navigation.js.
     */
    document.addEventListener(
        "pointerup",
        openCcmU01,
        true
    );

    window.openCCMU01 = () => {
        window.location.href = "/#ccm-u01";
    };
}
