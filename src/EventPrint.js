import { EventLog } from "./EventLog.js";

export const EventPrint = {

    open(options = {}) {

        const events =
            EventLog.getEvents()
                .slice()
                .reverse();

        const scenarioName =
            this.escapeHtml(
                options.scenarioName || "NORMAL"
            );

        const scenarioDescription =
            this.escapeHtml(
                options.scenarioDescription || ""
            );

        const now = new Date();

        const printDate =
            now.toLocaleDateString(
                "pt-BR",
                {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric"
                }
            );

        const printTime =
            now.toLocaleTimeString(
                "pt-BR",
                {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false
                }
            );

        const rows =
            events.length
                ? events
                    .map(
                        (event, index) => `
                            <tr>
                                <td class="col-number">${index + 1}</td>
                                <td class="col-date">${this.escapeHtml(event.date || "")}</td>
                                <td class="col-time">${this.escapeHtml(event.time || "")}</td>
                                <td class="col-equipment">${this.escapeHtml(event.equipment || "")}</td>
                                <td class="col-event">${this.escapeHtml(event.description || "")}</td>
                                <td class="col-type">${this.getTypeLabel(event.type)}</td>
                            </tr>
                        `
                    )
                    .join("")
                : `
                    <tr>
                        <td colspan="6" class="empty-row">
                            NENHUM EVENTO REGISTRADO
                        </td>
                    </tr>
                `;

        const popup =
            window.open(
                "",
                "scadaEventPrint",
                "width=1100,height=800,menubar=no,toolbar=no,location=no,status=no"
            );

        if (!popup) {
            window.alert(
                "O navegador bloqueou a janela de impressão. Permita pop-ups para este simulador e tente novamente."
            );
            return false;
        }

        popup.document.open();

        popup.document.write(`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >
    <title>Lista de Eventos - UHE Ilha Solteira</title>

    <style>
        * {
            box-sizing: border-box;
        }

        html,
        body {
            margin: 0;
            padding: 0;
            background: #d9d9d9;
            font-family: Arial, Helvetica, sans-serif;
            color: #000000;
        }

        body {
            padding: 18px;
        }

        .toolbar {
            width: min(1080px, 100%);
            margin: 0 auto 12px auto;
            display: flex;
            justify-content: flex-end;
            gap: 8px;
        }

        .toolbar button {
            min-width: 130px;
            padding: 9px 14px;
            border: 1px solid #444444;
            background: #ffffff;
            color: #000000;
            font-weight: 700;
            cursor: pointer;
        }

        .sheet {
            width: min(1080px, 100%);
            min-height: 760px;
            margin: 0 auto;
            padding: 24px 30px 30px 30px;
            background: #ffffff;
            box-shadow: 0 3px 18px rgba(0, 0, 0, 0.18);
        }

        .brand {
            display: flex;
            align-items: center;
            gap: 9px;
            margin-bottom: 12px;
            font-size: 22px;
            font-weight: 800;
        }

        .brand-mark {
            width: 31px;
            height: 31px;
            border: 3px solid #0b6ca8;
            border-radius: 50%;
            position: relative;
        }

        .brand-mark::before {
            content: "";
            position: absolute;
            left: 7px;
            right: 7px;
            top: 5px;
            bottom: 5px;
            border-left: 3px solid #0b6ca8;
            border-right: 3px solid #0b6ca8;
        }

        .brand-name {
            font-style: italic;
        }

        .brand-name span {
            font-weight: 400;
        }

        .main-title {
            margin: 0;
            text-align: center;
            font-size: 22px;
            font-weight: 800;
        }

        .sub-title {
            margin: 2px 0 14px 0;
            text-align: center;
            font-size: 17px;
            font-weight: 800;
        }

        .info-table,
        .event-table,
        .signature-table {
            width: 100%;
            border-collapse: collapse;
        }

        .info-table {
            margin-bottom: 9px;
        }

        .info-table td {
            padding: 4px 6px;
            border: 1px solid #000000;
            font-size: 12px;
        }

        .section-title {
            padding: 13px 6px;
            border: 1px solid #000000;
            text-align: center;
            font-size: 18px;
            font-weight: 800;
        }

        .event-table {
            margin-top: 0;
        }

        .event-table th,
        .event-table td {
            border: 1px solid #000000;
            padding: 5px 6px;
            vertical-align: top;
            font-size: 10px;
        }

        .event-table th {
            background: #f3f3f3;
            text-align: left;
            font-weight: 800;
        }

        .col-number {
            width: 42px;
            text-align: center;
        }

        .col-date {
            width: 78px;
            white-space: nowrap;
        }

        .col-time {
            width: 70px;
            white-space: nowrap;
        }

        .col-equipment {
            width: 130px;
            font-weight: 700;
        }

        .col-type {
            width: 82px;
            text-align: center;
            white-space: nowrap;
        }

        .empty-row {
            height: 54px;
            text-align: center;
            vertical-align: middle !important;
            font-weight: 700;
        }

        .signature-table {
            margin-top: 20px;
        }

        .signature-table td {
            height: 36px;
            border: 1px solid #000000;
            padding: 4px 6px;
            font-size: 11px;
        }

        .signature-table .role {
            width: 190px;
        }

        .signature-table .name {
            width: 43%;
        }

        .signature-table .signature {
            width: auto;
        }

        .footer-note {
            margin-top: 8px;
            font-size: 9px;
            color: #444444;
        }

        @page {
            size: A4 landscape;
            margin: 10mm;
        }

        @media print {

            html,
            body {
                background: #ffffff;
            }

            body {
                padding: 0;
            }

            .toolbar {
                display: none !important;
            }

            .sheet {
                width: 100%;
                min-height: 0;
                margin: 0;
                padding: 0;
                box-shadow: none;
            }

            .event-table thead {
                display: table-header-group;
            }

            .event-table tr {
                break-inside: avoid;
                page-break-inside: avoid;
            }

            .signature-table {
                break-inside: avoid;
                page-break-inside: avoid;
            }
        }
    </style>
</head>

<body>

    <div class="toolbar">
        <button
            type="button"
            onclick="window.print()"
        >
            IMPRIMIR / PDF
        </button>

        <button
            type="button"
            onclick="window.close()"
        >
            FECHAR
        </button>
    </div>

    <main class="sheet">

        <div class="brand">
            <span class="brand-mark" aria-hidden="true"></span>
            <span class="brand-name">CTG <span>Brasil</span></span>
        </div>

        <h1 class="main-title">
            LISTA DE EVENTOS DO SIMULADOR
        </h1>

        <div class="sub-title">
            UHE ILHA SOLTEIRA
        </div>

        <table class="info-table">
            <tr>
                <td>
                    <strong>Cenário:</strong>
                    ${scenarioName}
                </td>
                <td>
                    <strong>Data da impressão:</strong>
                    ${printDate}
                </td>
                <td>
                    <strong>Hora:</strong>
                    ${printTime}
                </td>
            </tr>

            <tr>
                <td colspan="3">
                    <strong>Descrição:</strong>
                    ${scenarioDescription || "-"}
                </td>
            </tr>
        </table>

        <div class="section-title">
            Eventos Registrados
        </div>

        <table class="event-table">
            <thead>
                <tr>
                    <th class="col-number">Nº</th>
                    <th class="col-date">Data</th>
                    <th class="col-time">Hora</th>
                    <th class="col-equipment">Equipamento</th>
                    <th>Evento</th>
                    <th class="col-type">Status</th>
                </tr>
            </thead>

            <tbody>
                ${rows}
            </tbody>
        </table>

        <table class="signature-table">
            <tr>
                <td class="role"></td>
                <td class="name">Nome</td>
                <td class="signature">Assinatura</td>
            </tr>

            <tr>
                <td class="role">
                    Técnico de Produção
                </td>
                <td></td>
                <td></td>
            </tr>

            <tr>
                <td class="role">
                    Líder / Coordenador
                </td>
                <td></td>
                <td></td>
            </tr>
        </table>

        <div class="footer-note">
            Relatório gerado pelo Simulador do Serviço Auxiliar CA — UHE Ilha Solteira.
        </div>

    </main>

</body>
</html>
        `);

        popup.document.close();
        popup.focus();

        return true;
    },

    getTypeLabel(type) {

        const labels = {
            info: "INFO",
            success: "NORMAL",
            warning: "ATENÇÃO",
            alarm: "ALARME"
        };

        return this.escapeHtml(
            labels[
                String(type ?? "")
                    .trim()
                    .toLowerCase()
            ] ?? "INFO"
        );
    },

    escapeHtml(value) {

        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }
};
