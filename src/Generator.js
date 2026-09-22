import { Equipment } from "./Equipment.js";

const SVG_NS = "http://www.w3.org/2000/svg";

export class Generator extends Equipment {

    static draw(layer, data = {}) {

        if (!layer) {
            console.warn("[Generator] Camada SVG n\u00e3o informada.");
            return null;
        }

        const {
            id = "",
            label = id,

            x = 0,
            y = 0,

            radius = 115,

            color = "#00aa55",
            fill = "#ffffff",

            strokeWidth = 1.8,

            energized = true,
            available = true,
            running = true,

            lineLength = 180,

            showLabel = true,
            showCommand = true,
            commandSide = "right",
            onCommand = null,
            onOpenSimulator = null
        } = data;

        const visualColor =
            available
                ? (
                    running
                        ? color
                        : "#607d8b"
                )
                : "#7a858d";

        const visualFill =
            available && running
                ? fill
                : "#f0f3f5";

        const group = this.group(
            id ? `generator-${id}` : "",
            "generator"
        );

        this.setEquipmentData(group, {
            id,
            type: "generator",
            energized,
            available,
            state:
                running
                    ? "running"
                    : "stopped"
        });

        group.dataset.running =
            running
                ? "true"
                : "false";

        //==================================================
        // CIRCULO EXTERNO
        //==================================================

        group.appendChild(
            this.circle(
                x,
                y,
                radius,
                visualColor,
                visualFill,
                strokeWidth,
                {
                    className: "generator-body"
                }
            )
        );

        //==================================================
        // CIRCULO INTERNO
        //==================================================

        const innerRadius =
            radius * 0.86;

        group.appendChild(
            this.circle(
                x,
                y,
                innerRadius,
                visualColor,
                "none",
                data.innerStrokeWidth ?? 1.45,
                {
                    className: "generator-inner-ring"
                }
            )
        );

        //==================================================
        // IDENTIFICACAO CENTRAL
        //==================================================

        if (showLabel && label) {

            group.appendChild(
                this.text(
                    x,
                    y + 4,
                    label,
                    data.labelSize ?? 50,
                    data.labelColor ?? "#263238",
                    {
                        anchor: "middle",
                        weight: "500",
                        className: "generator-label"
                    }
                )
            );
        }

        //==================================================
        // BOTAO LIGAR / DESLIGAR
        //==================================================

        if (showCommand) {

            const commandSize =
                data.commandSize ?? 34;

            const commandGap =
                data.commandGap ?? 18;

            const commandOnLeft =
                commandSide === "left";

            const commandX =
                commandOnLeft
                    ? x - radius - commandGap - commandSize
                    : x + radius + commandGap;

            const commandY =
                y - commandSize / 2;

            const actionLabel =
                !available
                    ? "BLOQUEADA"
                    : (
                        running
                            ? "DESLIGAR"
                            : "LIGAR"
                    );

            const commandSymbol =
                !available
                    ? "X"
                    : (
                        running
                            ? "I"
                            : "O"
                    );

            const commandColor =
                !available
                    ? "#7a858d"
                    : (
                        running
                            ? "#16883f"
                            : "#c62828"
                    );

            const command = this.group(
                id ? `generator-command-${id}` : "",
                "generator-command"
            );

            command.dataset.generatorId = id;
            command.dataset.action = "toggle-generator";
            command.dataset.state =
                running
                    ? "running"
                    : "stopped";
            command.dataset.available =
                available
                    ? "true"
                    : "false";

            command.setAttribute("role", "button");
            command.setAttribute(
                "aria-label",
                !available
                    ? `${label} indisponivel`
                    : `${actionLabel} ${label}`
            );

            command.setAttribute(
                "tabindex",
                available
                    ? "0"
                    : "-1"
            );

            command.style.cursor =
                available
                    ? "pointer"
                    : "not-allowed";

            const commandBody =
                document.createElementNS(
                    SVG_NS,
                    "rect"
                );

            commandBody.setAttribute("x", commandX);
            commandBody.setAttribute("y", commandY);
            commandBody.setAttribute("width", commandSize);
            commandBody.setAttribute("height", commandSize);
            commandBody.setAttribute("rx", 5);
            commandBody.setAttribute("ry", 5);
            commandBody.setAttribute("fill", commandColor);
            commandBody.setAttribute("stroke", "#ffffff");
            commandBody.setAttribute("stroke-width", 1.4);
            commandBody.setAttribute(
                "class",
                "generator-command-body"
            );

            command.appendChild(commandBody);

            command.appendChild(
                this.text(
                    commandX + commandSize / 2,
                    commandY + commandSize / 2 + 7,
                    commandSymbol,
                    data.commandFontSize ?? 19,
                    "#ffffff",
                    {
                        anchor: "middle",
                        weight: "700",
                        className: "generator-command-label"
                    }
                )
            );

            command.appendChild(
                this.text(
                    commandOnLeft
                        ? commandX - 11
                        : commandX + commandSize + 11,
                    y + 7,
                    "LIGA/DES",
                    data.commandTagSize ?? 19,
                    available
                        ? "#263238"
                        : "#7a858d",
                    {
                        anchor:
                            commandOnLeft
                                ? "end"
                                : "start",
                        weight: "700",
                        className: "generator-command-tag"
                    }
                )
            );

            const title =
                document.createElementNS(
                    SVG_NS,
                    "title"
                );

            title.textContent =
                !available
                    ? `${label} indisponivel para comando`
                    : `${actionLabel} ${label}`;

            command.appendChild(title);

            command.addEventListener(
                "pointerdown",
                event => event.stopPropagation()
            );

            const executeCommand = event => {

                event.preventDefault();
                event.stopPropagation();

                if (typeof onCommand === "function") {
                    onCommand({
                        id,
                        running,
                        nextRunning: !running
                    });
                }
            };

            command.addEventListener(
                "click",
                executeCommand
            );

            command.addEventListener(
                "keydown",
                event => {

                    if (
                        event.key === "Enter" ||
                        event.key === " "
                    ) {
                        executeCommand(event);
                    }
                }
            );

            group.appendChild(command);
        }

        //==================================================
        // SAIDA INFERIOR
        //==================================================

        group.appendChild(
            this.line(
                x,
                y + radius,
                x,
                y + lineLength,
                visualColor,
                strokeWidth,
                {
                    className: "generator-output"
                }
            )
        );

        if (typeof onOpenSimulator === "function") {
            // DUPLO CLIQUE no corpo/identificacao da UG abre o simulador.
            // O botao LIGA/DESLIGA continua independente porque interrompe a propagacao.
            group.style.cursor = "pointer";
            group.setAttribute("tabindex", "0");
            group.setAttribute("role", "button");
            group.setAttribute(
                "aria-label",
                `Duplo clique para abrir o simulador operacional ${label}`
            );

            const openSimulator = event => {
                if (event.target?.closest?.(".generator-command")) return;

                event.preventDefault();
                event.stopPropagation();

                onOpenSimulator({ id });
            };

            // IMPORTANTE:
            // O primeiro clique não pode chegar ao diagrama principal.
            // Caso contrário o Renderer pode redesenhar o SVG entre o 1º e o 2º clique,
            // destruindo o elemento e impedindo o evento nativo "dblclick".
            group.addEventListener("click", event => {
                if (event.target?.closest?.(".generator-command")) return;
                event.preventDefault();
                event.stopPropagation();
            });

            group.addEventListener("dblclick", openSimulator);

            // Mantém acessibilidade pelo teclado.
            group.addEventListener("keydown", event => {
                if (event.key === "Enter" || event.key === " ") {
                    openSimulator(event);
                }
            });

            const simulatorTitle =
                document.createElementNS(
                    SVG_NS,
                    "title"
                );

            simulatorTitle.textContent =
                `Duplo clique para abrir o simulador operacional ${label}`;

            group.appendChild(simulatorTitle);
        }

        layer.appendChild(group);

        return group;
    }

    //==================================================
    // PONTOS DE CONEXAO
    //==================================================

    static getPorts(data = {}) {

        const {
            x = 0,
            y = 0,
            radius = 115,
            lineLength = 220
        } = data;

        return {
            center: {
                x,
                y
            },

            top: {
                x,
                y: y - radius
            },

            bottom: {
                x,
                y: y + lineLength
            }
        };
    }
}
