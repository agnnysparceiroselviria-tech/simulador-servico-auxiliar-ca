import * as AuxPanelDatabaseModule from './AuxPanelDetailDatabase.js';
import { Engine } from './Engine.js';

const AuxPanelDetailDatabase =
  AuxPanelDatabaseModule.AuxPanelDetailDatabase ??
  AuxPanelDatabaseModule.AuxPanelDatabase ??
  AuxPanelDatabaseModule.PanelDetailDatabase;

const SVG_NS = 'http://www.w3.org/2000/svg';

const COLORS = {
  header: '#1b2d3e',
  text: '#1b2d3e',
  muted: '#61737e',
  border: '#8fa0aa',
  off: '#9aa9b2',
  closed: '#d60000',
  open: '#ffffff',
  background: '#ffffff',
  panel: '#f8fafc',
  warning: '#ffd85c',
};

function escapeXml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function shorten(value, maximum = 78) {
  const text = String(value);
  return text.length > maximum ? `${text.slice(0, maximum - 3)}...` : text;
}

function normalizeSeconds(value) {
  const seconds = Number(value);
  return Number.isFinite(seconds) && seconds > 0 ? Math.round(seconds) : 3;
}

export const AuxPanelDetailView = {
  overlay: null,
  main: null,
  status: null,
  panel: null,
  transferTimer: null,
  engineSyncTimer: null,
  engineStateHandler: null,
  linkedToEngine: false,
  previousBodyOverflow: '',

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
    operationMode: 'AUTO',

    outgoing: [],
    events: [],
  },

  open(panelId) {
    if (
      !AuxPanelDetailDatabase ||
      typeof AuxPanelDetailDatabase.get !== 'function'
    ) {
      window.alert(
        'N\u00E3o foi poss\u00EDvel abrir os diagramas dos CMs/CCMs.\n\n' +
          'Verifique se o arquivo AuxPanelDetailDatabase.js existe e n\u00E3o foi substitu\u00EDdo por AuxDistributionDetailDatabase.js.'
      );
      console.error(
        '[AuxPanelDetailView] AuxPanelDetailDatabase.js ausente ou incompat\u00EDvel.'
      );
      return false;
    }

    const panel = AuxPanelDetailDatabase.get(panelId);

    if (!panel) {
      window.alert(
        `Diagrama n\u00E3o cadastrado para ${String(panelId ?? 'este painel')}.`
      );
      return false;
    }

    this.close();
    this.panel = panel;
    this.resetState(false);

    const overlay = document.createElement('section');
    overlay.id = 'auxPanelDetailView';
    overlay.setAttribute('aria-label', `Simulador do ${panel.title}`);

    Object.assign(overlay.style, {
      position: 'fixed',
      inset: '0',
      zIndex: '99999',
      display: 'grid',
      gridTemplateRows: '54px minmax(0, 1fr) 34px',
      background: COLORS.background,
      color: COLORS.text,
      fontFamily: 'Segoe UI, Arial, sans-serif',
    });

    const header = document.createElement('header');
    Object.assign(header.style, {
      display: 'grid',
      gridTemplateColumns: '150px minmax(0, 1fr) 640px',
      alignItems: 'center',
      gap: '16px',
      padding: '0 14px',
      background: COLORS.header,
      borderBottom: '1px solid #4c6f8c',
      color: '#ffffff',
    });

    const backButton = this.createHeaderButton('\u2190 VOLTAR', '126px');
    backButton.addEventListener('click', () => this.close());

    const title = document.createElement('strong');
    title.textContent = `SIMULADOR ${panel.title}`;
    Object.assign(title.style, {
      overflow: 'hidden',
      textAlign: 'center',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      fontSize: '18px',
      letterSpacing: '0.35px',
    });

    const actions = document.createElement('div');
    Object.assign(actions.style, {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: '12px',
    });

    const autoButton = this.createHeaderButton('AUTOMÁTICO', '126px');

    const manualButton = this.createHeaderButton('MANUAL', '104px');

    const refreshModeButtons = () => {
      const manual = this.state.operationMode === 'MANUAL';

      Object.assign(autoButton.style, {
        background: manual ? '#29435a' : '#ffffff',
        color: manual ? '#ffffff' : '#1b2d3e',
        borderColor: manual ? '#6f93ad' : '#7dff9e',
      });

      Object.assign(manualButton.style, {
        background: manual ? '#fff3cd' : '#29435a',
        color: manual ? '#1b2d3e' : '#ffffff',
        borderColor: manual ? '#d4a900' : '#6f93ad',
      });
    };

    autoButton.addEventListener('click', () => {
      this.setOperationMode('AUTO');

      refreshModeButtons();
    });

    manualButton.addEventListener('click', () => {
      this.setOperationMode('MANUAL');

      refreshModeButtons();
    });

    refreshModeButtons();

    const resetButton = this.createHeaderButton('REPOR NORMAL', '142px');
    resetButton.addEventListener('click', () => this.resetState(true));

    const status = document.createElement('span');
    Object.assign(status.style, {
      minWidth: '190px',
      textAlign: 'right',
      color: '#7dff9e',
      fontSize: '13px',
      fontWeight: '800',
      whiteSpace: 'nowrap',
    });

    actions.appendChild(autoButton);
    actions.appendChild(manualButton);
    actions.appendChild(resetButton);
    actions.appendChild(status);
    header.appendChild(backButton);
    header.appendChild(title);
    header.appendChild(actions);

    const main = document.createElement('main');
    Object.assign(main.style, {
      minWidth: '0',
      minHeight: '0',
      overflow: 'auto',
      background: '#ffffff',
    });

    const footer = document.createElement('footer');
    footer.textContent =
      'SCADA \u2022 UHE ILHA SOLTEIRA \u2022 SERVI\u00C7O AUXILIAR CA';
    Object.assign(footer.style, {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: COLORS.header,
      borderTop: '1px solid #4c6f8c',
      color: '#c9e2ff',
      fontSize: '12px',
      fontWeight: '700',
    });

    overlay.appendChild(header);
    overlay.appendChild(main);
    overlay.appendChild(footer);

    overlay.tabIndex = -1;
    overlay.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        this.close();
      }
    });

    this.previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.body.appendChild(overlay);

    this.overlay = overlay;
    this.main = main;
    this.status = status;

    this.startEngineSynchronization();

    this.addEvent('SISTEMA', `DIAGRAMA ${panel.title} CARREGADO`);
    this.redraw();
    overlay.focus();
    return true;
  },

  createHeaderButton(label, width) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;

    Object.assign(button.style, {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width,
      height: '34px',
      padding: '0 12px',
      border: '1px solid #6f93ad',
      borderRadius: '4px',
      background: '#29435a',
      color: '#ffffff',
      fontWeight: '800',
      lineHeight: '1',
      whiteSpace: 'nowrap',
      cursor: 'pointer',
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
        'scada:state-changed',
        this.engineStateHandler
      );
    }

    this.engineStateHandler = null;
    this.linkedToEngine = false;
    this.overlay?.remove();
    this.overlay = null;
    this.main = null;
    this.status = null;
    this.panel = null;

    if (document.body) {
      document.body.style.overflow = this.previousBodyOverflow;
    }
  },

  resetState(redraw = true) {
    clearInterval(this.transferTimer);
    this.transferTimer = null;

    /*
     * REPOR NORMAL também retorna o diagrama
     * para o modo AUTOMÁTICO.
     */
    this.state.operationMode = 'AUTO';

    this.state.outgoing =
      this.panel?.outgoing.map((item) => ({
        ...item,
        closed: item.defaultClosed,
      })) ?? [];
    this.state.events = [];

    const sharedState =
      this.panel && typeof Engine.getPcaLoadTransferState === 'function'
        ? Engine.getPcaLoadTransferState(this.panel.id)
        : null;

    this.linkedToEngine = Boolean(sharedState);

    if (this.linkedToEngine) {
      this.state.operationMode = String(
        sharedState.operationMode ?? 'AUTO'
      ).toUpperCase();

      if (
        redraw &&
        typeof Engine.setPanelOperationMode === 'function'
      ) {
        Engine.setPanelOperationMode(this.panel.id, 'AUTO');
        this.state.operationMode = 'AUTO';
      }

      if (
        redraw &&
        typeof Engine.requestPcaLoadNormalRestoration === 'function'
      ) {
        Engine.requestPcaLoadNormalRestoration(this.panel.id);
      }

      this.syncIncomingFromEngine(false);
    } else {
      this.state.normalAvailable = true;
      this.state.reserveAvailable = true;
      this.state.normalClosed = true;
      this.state.reserveClosed = false;
      this.state.transferRemaining = 0;
    }

    if (redraw && this.main) {
      this.addEvent('SISTEMA', 'CONDI\u00C7\u00C3O NORMAL RESTABELECIDA');
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

    window.addEventListener('scada:state-changed', this.engineStateHandler);

    /*
     * O Engine e a fonte unica do temporizador.
     * Este intervalo apenas atualiza a contagem visual.
     */
    this.engineSyncTimer = window.setInterval(() => {
      this.syncIncomingFromEngine(true);
    }, 200);
  },

  syncIncomingFromEngine(redraw = true) {
    if (!this.panel || typeof Engine.getPcaLoadTransferState !== 'function') {
      this.linkedToEngine = false;
      return false;
    }

    const sharedState = Engine.getPcaLoadTransferState(this.panel.id);

    if (!sharedState) {
      this.linkedToEngine = false;
      return false;
    }

    this.linkedToEngine = true;

    const previous = {
      normalClosed: this.state.normalClosed,
      reserveClosed: this.state.reserveClosed,
      transferRemaining: this.state.transferRemaining,
      operationMode: this.state.operationMode,
    };

    this.state.normalAvailable = sharedState.normalAvailable;
    this.state.reserveAvailable = sharedState.reserveAvailable;
    this.state.normalClosed = sharedState.normalClosed;
    this.state.reserveClosed = sharedState.reserveClosed;
    this.state.transferRemaining = sharedState.transferRemaining;
    this.state.operationMode = String(
      sharedState.operationMode ?? 'AUTO'
    ).toUpperCase();

    const changed =
      previous.normalClosed !== this.state.normalClosed ||
      previous.reserveClosed !== this.state.reserveClosed ||
      previous.transferRemaining !== this.state.transferRemaining ||
      previous.operationMode !== this.state.operationMode;

    if (redraw && previous.normalClosed && !this.state.normalClosed) {
      this.addEvent(
        this.panel.normal.incomingBreaker,
        'ABERTO - ESTADO SINCRONIZADO'
      );
    }

    if (redraw && !previous.reserveClosed && this.state.reserveClosed) {
      this.addEvent(
        this.panel.reserve.incomingBreaker,
        'FECHADO AUTOMATICAMENTE - FONTE RESERVA'
      );
    }

    if (
      redraw &&
      previous.transferRemaining === 0 &&
      this.state.transferRemaining > 0
    ) {
      this.addEvent(
        this.panel.reserve.incomingBreaker,
        `TRANSFER\u00CANCIA AUTOM\u00C1TICA INICIADA - ${this.state.transferRemaining} s`
      );
    }

    if (redraw && changed && this.main) {
      this.redraw();
    }

    return true;
  },

  setOperationMode(mode) {
    const normalized = String(mode ?? 'AUTO').toUpperCase();

    if (!['AUTO', 'MANUAL'].includes(normalized)) {
      return false;
    }

    if (this.state.operationMode === normalized) {
      return true;
    }

    if (this.panel) {
      let changed = null;

      if (typeof Engine.setPcaLoadOperationMode === 'function') {
        changed = Engine.setPcaLoadOperationMode(this.panel.id, normalized);
      } else if (typeof Engine.setPanelOperationMode === 'function') {
        changed = Engine.setPanelOperationMode(this.panel.id, normalized);
      } else {
        window.dispatchEvent(
          new CustomEvent('scada:panel-mode-changed', {
            detail: {
              panelId: this.panel.id,
              mode: normalized,
            },
          })
        );
      }

      if (changed === false) {
        window.alert(
          `Não foi possível colocar o ${this.panel.id} em ${normalized}. Verifique se o Engine.js atualizado foi instalado.`
        );
        return false;
      }
    }

    this.state.operationMode = normalized;

    if (this.linkedToEngine) {
      this.syncIncomingFromEngine(false);
    }

    this.addEvent(
      this.panel?.title ?? 'PAINEL',
      `PAINEL COLOCADO EM ${normalized}`
    );

    if (this.main) {
      this.redraw();
    }

    return true;
  },

  isManualMode() {
    return this.state.operationMode === 'MANUAL';
  },

  showManualModeMessage(breakerLabel) {
    window.alert(
      `COMANDO BLOQUEADO\nO DJ ${breakerLabel} está sob controle automático do painel. Selecione MANUAL no topo para realizar esta operação.`
    );
  },

  addEvent(equipment, message) {
    this.state.events.unshift({
      time: new Date().toLocaleTimeString('pt-BR'),
      equipment,
      message,
    });
    this.state.events = this.state.events.slice(0, 7);
  },

  getBusState() {
    if (this.state.normalClosed && this.state.normalAvailable) {
      return {
        energized: true,
        source: this.panel.normal.sourcePanel,
        color: this.panel.normal.color,
      };
    }

    if (this.state.reserveClosed && this.state.reserveAvailable) {
      return {
        energized: true,
        source: this.panel.reserve.sourcePanel,
        color: this.panel.reserve.color,
      };
    }

    return {
      energized: false,
      source: 'SEM FONTE',
      color: COLORS.off,
    };
  },

  redraw() {
    if (!this.main || !this.panel) return;

    this.main.innerHTML = '';
    this.drawDiagram();

    const bus = this.getBusState();
    const transfer = this.state.transferRemaining;

    if (this.status) {
      const electricalStatus = bus.energized
        ? `ENERGIZADO \u2022 ${bus.source}`
        : transfer > 0
        ? `TRANSFER\u00CANCIA \u2022 ${transfer} s`
        : 'DESENERGIZADO';

      this.status.textContent = `${this.state.operationMode} \u2022 ${electricalStatus}`;

      this.status.style.color = bus.energized
        ? '#7dff9e'
        : transfer > 0
        ? '#ffd166'
        : '#ff8e8e';
    }
  },

  drawDiagram() {
    const rowHeight = 45;
    const listTop = 116;
    const contentHeight =
      listTop + this.state.outgoing.length * rowHeight + 170;
    const viewHeight = Math.max(2140, contentHeight);

    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', `0 0 1600 ${viewHeight}`);
    svg.setAttribute('preserveAspectRatio', 'xMidYMin meet');
    svg.setAttribute('aria-label', `Diagrama unifilar do ${this.panel.title}`);

    Object.assign(svg.style, {
      display: 'block',
      width: '100%',
      minWidth: '1180px',
      height: 'auto',
      background: '#ffffff',
    });

    const bus = this.getBusState();

    svg.innerHTML = `
            <rect
                x="20" y="20"
                width="1560" height="${viewHeight - 40}"
                fill="#ffffff"
                stroke="#a7b3bb"
                stroke-width="1.5"
            />
            ${this.identificationSvg()}
            ${this.sourcePathsSvg(bus)}
            ${this.outgoingSvg(bus, listTop, rowHeight)}
            ${this.arcFlashSvg()}
            ${this.legendSvg()}
            ${this.eventsSvg()}
        `;

    this.bindCommands(svg);
    this.main.appendChild(svg);
  },

  identificationSvg() {
    const panel = this.panel;

    return `
            <rect
                x="55" y="54"
                width="360" height="95"
                fill="#ffffff"
                stroke="${COLORS.text}"
                stroke-width="1.8"
            />
            <rect
                x="68" y="67"
                width="334" height="69"
                rx="9"
                fill="#0aa8df"
                stroke="${COLORS.text}"
                stroke-width="1.5"
            />
            <text
                x="235" y="114"
                text-anchor="middle"
                font-family="Segoe UI, Arial, sans-serif"
                font-size="37"
                font-weight="900"
                fill="#ffffff"
            >${escapeXml(panel.title)}</text>
            <text
                x="68" y="187"
                font-family="Segoe UI, Arial, sans-serif"
                font-size="27"
                font-weight="700"
                fill="${COLORS.text}"
            >${escapeXml(panel.voltage)}</text>
            <text
                x="68" y="217"
                font-family="Segoe UI, Arial, sans-serif"
                font-size="19"
                fill="${COLORS.text}"
            >${escapeXml(panel.location)}</text>
            <text
                x="68" y="249"
                font-family="Segoe UI, Arial, sans-serif"
                font-size="15"
                font-style="italic"
                fill="${COLORS.text}"
            >${escapeXml(panel.subtitle)}</text>
        `;
  },

  sourcePathsSvg(bus) {
    const normal = this.panel.normal;
    const reserve = this.panel.reserve;
    const sourceX = 260;
    const incomingX = 475;
    const trunkX = 610;

    /*
     * Comprimento automático do barramento principal.
     *
     * Alguns CMs/CCMs possuem mais DJs de saída que outros.
     * Antes o barramento terminava em uma altura fixa (1360),
     * fazendo com que ele parasse antes dos últimos DJs.
     *
     * Agora o final do barramento acompanha automaticamente
     * a quantidade de saídas cadastradas no painel.
     */
    const outgoingListTop = 116;
    const outgoingRowHeight = 45;

    const lastOutgoingY =
      outgoingListTop +
      Math.max(0, this.state.outgoing.length - 1) * outgoingRowHeight +
      15;

    /*
     * Alguns CMs possuem poucas saídas.
     * Neles, o mínimo fixo de 1360 deixava o barramento
     * passando muito abaixo do último DJ.
     *
     * Para esses painéis, o barramento termina
     * individualmente logo após a última saída.
     */
    const compactBusPanels = [
      'CM-05',
      'CM-06',
      'CM-08',
      'CM-10',
      'CM-11',
      'CM-12',
      'CM-14',
      'CM-15',
      'CM-16',
      'CM-17',
      'CM-18',
      'CM-19',
    ];

    const compactBus = compactBusPanels.includes(String(this.panel?.id ?? ''));

    const trunkBottomY = compactBus
      ? lastOutgoingY + 35
      : Math.max(1360, lastOutgoingY + 35);

    const normalBreakerY = 730;
    const normalLineY = normalBreakerY + 13;
    const reserveBreakerY = 917;
    const reserveLineY = reserveBreakerY + 13;
    const delay = normalizeSeconds(this.panel.reserveDelaySeconds);
    const normalAfter = this.state.normalClosed ? normal.color : COLORS.off;
    const reserveAfter = this.state.reserveClosed ? reserve.color : COLORS.off;
    const reserveStatus = this.state.reserveClosed
      ? 'FECHADO \u2022 ALIMENTANDO'
      : this.state.transferRemaining > 0
      ? `FECHAMENTO EM ${this.state.transferRemaining} s`
      : `ABERTO \u2022 ${delay} s`;

    return `
            <g aria-label="Alimenta\u00E7\u00E3o principal">
                <text x="260" y="330" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="17" font-weight="800" fill="${
                  COLORS.text
                }">${escapeXml(normal.qp)}</text>
                <line x1="260" y1="338" x2="260" y2="366" stroke="${
                  normal.color
                }" stroke-width="3" />
                <rect x="246" y="366" width="28" height="28" fill="${
                  COLORS.closed
                }" />
                <text x="288" y="386" font-family="Segoe UI, Arial, sans-serif" font-size="15" font-weight="700" fill="${
                  COLORS.text
                }">${escapeXml(normal.sourceBreaker)}</text>
                <line x1="260" y1="394" x2="260" y2="433" stroke="${
                  normal.color
                }" stroke-width="3" />
                <circle cx="260" cy="450" r="17" fill="#ffffff" stroke="${
                  normal.color
                }" stroke-width="2" />
                <circle cx="260" cy="470" r="17" fill="#ffffff" stroke="${
                  normal.color
                }" stroke-width="2" />
                <text x="232" y="454" text-anchor="end" font-family="Segoe UI, Arial, sans-serif" font-size="14" font-weight="700" fill="${
                  COLORS.text
                }">${escapeXml(normal.transformer)}</text>
                <text x="232" y="476" text-anchor="end" font-family="Segoe UI, Arial, sans-serif" font-size="12" fill="${
                  COLORS.muted
                }">${escapeXml(normal.transformerVoltage)}</text>
                <line x1="260" y1="487" x2="260" y2="515" stroke="${
                  normal.color
                }" stroke-width="3" />
                <rect x="248" y="515" width="24" height="24" fill="${
                  COLORS.closed
                }" />
                <text x="286" y="533" font-family="Segoe UI, Arial, sans-serif" font-size="14" font-weight="700" fill="${
                  COLORS.text
                }">${escapeXml(normal.transformerBreaker)}</text>
                <line x1="260" y1="539" x2="260" y2="569" stroke="${
                  normal.color
                }" stroke-width="3" />
                <rect x="130" y="569" width="260" height="56" fill="#ffffff" stroke="${
                  COLORS.text
                }" stroke-width="1.5" />
                <line x1="155" y1="597" x2="365" y2="597" stroke="${
                  normal.color
                }" stroke-width="3" />
                <text x="115" y="604" text-anchor="end" font-family="Segoe UI, Arial, sans-serif" font-size="18" font-weight="800" fill="${
                  COLORS.text
                }">${escapeXml(normal.sourcePanel)}</text>
                <line x1="260" y1="625" x2="260" y2="660" stroke="${
                  normal.color
                }" stroke-width="3" />
                <rect x="247" y="660" width="26" height="26" fill="${
                  COLORS.closed
                }" />
                <text x="231" y="679" text-anchor="end" font-family="Segoe UI, Arial, sans-serif" font-size="15" font-weight="700" fill="${
                  COLORS.text
                }">${escapeXml(normal.feederBreaker)}</text>
                <line x1="${sourceX}" y1="686" x2="${sourceX}" y2="${normalLineY}" stroke="${
      normal.color
    }" stroke-width="3" />
                <line x1="${sourceX}" y1="${normalLineY}" x2="${
      incomingX - 13
    }" y2="${normalLineY}" stroke="${normal.color}" stroke-width="3" />
                ${this.incomingBreakerSvg({
                  x: incomingX,
                  y: normalBreakerY,
                  closed: this.state.normalClosed,
                  color: normal.color,
                  id: normal.incomingBreaker,
                  action: 'incoming-normal',
                  status: this.state.normalClosed ? 'FECHADO' : 'ABERTO',
                })}
                <line x1="${
                  incomingX + 13
                }" y1="${normalLineY}" x2="${trunkX}" y2="${normalLineY}" stroke="${normalAfter}" stroke-width="3" />
            </g>

            <g aria-label="Alimenta\u00E7\u00E3o reserva">
                <line x1="${sourceX}" y1="${reserveLineY}" x2="${
      incomingX - 13
    }" y2="${reserveLineY}" stroke="${reserve.color}" stroke-width="3" />
                ${this.incomingBreakerSvg({
                  x: incomingX,
                  y: reserveBreakerY,
                  closed: this.state.reserveClosed,
                  color: reserve.color,
                  id: reserve.incomingBreaker,
                  action: 'incoming-reserve',
                  status: reserveStatus,
                })}
                <line x1="${
                  incomingX + 13
                }" y1="${reserveLineY}" x2="${trunkX}" y2="${reserveLineY}" stroke="${reserveAfter}" stroke-width="3" />
                <line x1="${sourceX}" y1="${reserveLineY}" x2="${sourceX}" y2="987" stroke="${
      reserve.color
    }" stroke-width="3" />
                <rect x="247" y="987" width="26" height="26" fill="${
                  COLORS.closed
                }" />
                <text x="231" y="1006" text-anchor="end" font-family="Segoe UI, Arial, sans-serif" font-size="15" font-weight="700" fill="${
                  COLORS.text
                }">${escapeXml(reserve.feederBreaker)}</text>
                <line x1="260" y1="1013" x2="260" y2="1044" stroke="${
                  reserve.color
                }" stroke-width="3" />
                <rect x="130" y="1044" width="260" height="56" fill="#ffffff" stroke="${
                  COLORS.text
                }" stroke-width="1.5" />
                <line x1="155" y1="1072" x2="365" y2="1072" stroke="${
                  reserve.color
                }" stroke-width="3" />
                <text x="115" y="1079" text-anchor="end" font-family="Segoe UI, Arial, sans-serif" font-size="18" font-weight="800" fill="${
                  COLORS.text
                }">${escapeXml(reserve.sourcePanel)}</text>
                <line x1="260" y1="1100" x2="260" y2="1128" stroke="${
                  reserve.color
                }" stroke-width="3" />
                <rect x="248" y="1128" width="24" height="24" fill="${
                  COLORS.closed
                }" />
                <text x="286" y="1146" font-family="Segoe UI, Arial, sans-serif" font-size="14" font-weight="700" fill="${
                  COLORS.text
                }">${escapeXml(reserve.transformerBreaker)}</text>
                <line x1="260" y1="1152" x2="260" y2="1182" stroke="${
                  reserve.color
                }" stroke-width="3" />
                <circle cx="260" cy="1199" r="17" fill="#ffffff" stroke="${
                  reserve.color
                }" stroke-width="2" />
                <circle cx="260" cy="1219" r="17" fill="#ffffff" stroke="${
                  reserve.color
                }" stroke-width="2" />
                <text x="232" y="1203" text-anchor="end" font-family="Segoe UI, Arial, sans-serif" font-size="14" font-weight="700" fill="${
                  COLORS.text
                }">${escapeXml(reserve.transformer)}</text>
                <text x="232" y="1225" text-anchor="end" font-family="Segoe UI, Arial, sans-serif" font-size="12" fill="${
                  COLORS.muted
                }">${escapeXml(reserve.transformerVoltage)}</text>
                <line x1="260" y1="1236" x2="260" y2="1268" stroke="${
                  reserve.color
                }" stroke-width="3" />
                <rect x="246" y="1268" width="28" height="28" fill="${
                  COLORS.closed
                }" />
                <text x="288" y="1288" font-family="Segoe UI, Arial, sans-serif" font-size="15" font-weight="700" fill="${
                  COLORS.text
                }">${escapeXml(reserve.sourceBreaker)}</text>
                <line x1="260" y1="1296" x2="260" y2="1323" stroke="${
                  reserve.color
                }" stroke-width="3" />
                <text x="260" y="1346" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="17" font-weight="800" fill="${
                  COLORS.text
                }">${escapeXml(reserve.qp)}</text>
            </g>

            <line
                x1="${trunkX}"
                y1="86"
                x2="${trunkX}"
                y2="${trunkBottomY}"
                stroke="${bus.color}"
                stroke-width="5"
            />
            <text x="585" y="715" text-anchor="middle" transform="rotate(-90 585 715)" font-family="Segoe UI, Arial, sans-serif" font-size="19" font-weight="900" fill="${
              bus.color
            }">BARRAMENTO ${escapeXml(this.panel.voltage)} \u2022 ${
      bus.energized
        ? `ENERGIZADO POR ${escapeXml(bus.source)}`
        : 'DESENERGIZADO'
    }</text>
        `;
  },

  incomingBreakerSvg({ x, y, closed, color, id, action, status }) {
    return `
            <g
                data-action="${action}"
                role="button"
                tabindex="0"
                aria-label="Comandar ${escapeXml(id)}"
                style="cursor:pointer"
            >
                <rect
                    x="${x - 13}" y="${y}"
                    width="26" height="26"
                    fill="${closed ? COLORS.closed : COLORS.open}"
                    stroke="${closed ? COLORS.closed : COLORS.text}"
                    stroke-width="1.8"
                />
                ${
                  closed
                    ? ''
                    : `
                    <line x1="${x - 9}" y1="${y + 4}" x2="${x + 9}" y2="${
                        y + 22
                      }" stroke="${COLORS.text}" stroke-width="2" />
                    <line x1="${x + 9}" y1="${y + 4}" x2="${x - 9}" y2="${
                        y + 22
                      }" stroke="${COLORS.text}" stroke-width="2" />
                `
                }
                <text x="${x}" y="${
      y - 12
    }" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="16" font-weight="800" fill="${
      COLORS.text
    }">${escapeXml(id)}</text>
                <text x="${x}" y="${
      y + 53
    }" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="13" font-weight="800" fill="${
      closed
        ? COLORS.closed
        : this.state.transferRemaining > 0 && action === 'incoming-reserve'
        ? COLORS.warning
        : COLORS.muted
    }">${escapeXml(status)}</text>
                <rect x="${x - 65}" y="${
      y - 39
    }" width="130" height="105" rx="7" fill="transparent" stroke="transparent" pointer-events="all" />
            </g>
        `;
  },

  outgoingSvg(bus, listTop, rowHeight) {
    const rows = this.state.outgoing
      .map((item, index) => {
        const y = listTop + index * rowHeight;
        const closedColor =
          bus.energized && item.closed ? COLORS.closed : COLORS.text;
        const lineColor = bus.energized && item.closed ? bus.color : COLORS.off;
        const status = item.closed
          ? bus.energized
            ? 'LIGADO'
            : 'FECHADO \u2022 SEM TENS\u00C3O'
          : 'ABERTO';

        return `
                <g
                    data-action="outgoing"
                    data-breaker-id="${escapeXml(item.id)}"
                    role="button"
                    tabindex="0"
                    aria-label="Comandar ${escapeXml(item.id)}"
                    style="cursor:pointer"
                >
                    <line x1="610" y1="${y + 15}" x2="690" y2="${
          y + 15
        }" stroke="${lineColor}" stroke-width="2" />
                    <rect x="690" y="${y + 2}" width="26" height="26" fill="${
          item.closed ? closedColor : COLORS.open
        }" stroke="${
          item.closed ? closedColor : COLORS.text
        }" stroke-width="1.6" />
                    ${
                      item.closed
                        ? ''
                        : `
                        <line x1="694" y1="${y + 6}" x2="712" y2="${
                            y + 24
                          }" stroke="${COLORS.text}" stroke-width="1.8" />
                        <line x1="712" y1="${y + 6}" x2="694" y2="${
                            y + 24
                          }" stroke="${COLORS.text}" stroke-width="1.8" />
                    `
                    }
                    <text x="730" y="${
                      y + 13
                    }" font-family="Segoe UI, Arial, sans-serif" font-size="14" font-weight="800" fill="${
          COLORS.text
        }">${escapeXml(item.id)}</text>
                    <text x="730" y="${
                      y + 30
                    }" font-family="Segoe UI, Arial, sans-serif" font-size="11" font-weight="800" fill="${
          item.closed ? closedColor : COLORS.muted
        }">${escapeXml(status)}</text>
                    <line x1="825" y1="${y + 15}" x2="1510" y2="${
          y + 15
        }" stroke="${lineColor}" stroke-width="1.6" />
                    <polygon points="1510,${y + 15} 1498,${y + 8} 1498,${
          y + 22
        }" fill="${lineColor}" />
                    <text x="845" y="${
                      y + 11
                    }" font-family="Segoe UI, Arial, sans-serif" font-size="13" fill="${
          item.reserve ? COLORS.muted : COLORS.text
        }">${escapeXml(shorten(item.label))}</text>
                    <rect x="618" y="${
                      y - 3
                    }" width="910" height="${rowHeight}" fill="transparent" stroke="transparent" pointer-events="all" />
                </g>
            `;
      })
      .join('');

    return `
            <text x="1065" y="70" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="25" font-weight="900" fill="${
              COLORS.text
            }">SA\u00CDDAS DO ${escapeXml(this.panel.title)}</text>
            <text x="1065" y="94" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="13" fill="${
              COLORS.muted
            }">Clique em um disjuntor para abrir ou fechar individualmente</text>
            ${rows}
        `;
  },

  arcFlashSvg() {
    const arc = this.panel.arcFlash;

    return `
            <g aria-label="Risco de arco el\u00E9trico">
                <rect x="58" y="1410" width="430" height="184" fill="#fffbd2" stroke="${
                  COLORS.text
                }" stroke-width="1.5" />
                <rect x="58" y="1410" width="430" height="42" fill="#e60000" stroke="${
                  COLORS.text
                }" stroke-width="1.5" />
                <text x="273" y="1439" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="24" font-weight="900" fill="#ffffff">\u26A0 PERIGO</text>
                <text x="273" y="1477" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="15" font-weight="800" fill="${
                  COLORS.text
                }">Risco de Arco El\u00E9trico e Choque</text>
                <text x="78" y="1510" font-family="Segoe UI, Arial, sans-serif" font-size="13" fill="${
                  COLORS.text
                }">Dist\u00E2ncia de seguran\u00E7a: ${escapeXml(
      arc.distance
    )}</text>
                <text x="78" y="1538" font-family="Segoe UI, Arial, sans-serif" font-size="13" fill="${
                  COLORS.text
                }">Energia incidente: ${escapeXml(arc.energy)}</text>
                <text x="78" y="1566" font-family="Segoe UI, Arial, sans-serif" font-size="13" font-weight="800" fill="${
                  COLORS.text
                }">EPI recomendado: ${escapeXml(arc.ppe)}</text>
            </g>
        `;
  },

  legendSvg() {
    const dc = this.panel.dcSupplies;

    return `
            <g aria-label="Legenda e alimenta\u00E7\u00F5es em corrente cont\u00EDnua">
                <rect x="58" y="1620" width="430" height="250" fill="#ffffff" stroke="${
                  COLORS.border
                }" stroke-width="1.4" />
                <text x="78" y="1652" font-family="Segoe UI, Arial, sans-serif" font-size="18" font-weight="900" fill="${
                  COLORS.text
                }">LEGENDA DOS DISJUNTORES</text>
                <rect x="80" y="1675" width="22" height="22" fill="${
                  COLORS.closed
                }" />
                <text x="116" y="1692" font-family="Segoe UI, Arial, sans-serif" font-size="13" fill="${
                  COLORS.text
                }">Disjuntor fechado e energizado</text>
                <rect x="80" y="1710" width="22" height="22" fill="#ffffff" stroke="${
                  COLORS.text
                }" stroke-width="1.5" />
                <line x1="84" y1="1714" x2="98" y2="1728" stroke="${
                  COLORS.text
                }" stroke-width="1.6" />
                <line x1="98" y1="1714" x2="84" y2="1728" stroke="${
                  COLORS.text
                }" stroke-width="1.6" />
                <text x="116" y="1727" font-family="Segoe UI, Arial, sans-serif" font-size="13" fill="${
                  COLORS.text
                }">Disjuntor aberto com opera\u00E7\u00E3o autom\u00E1tica</text>
                <rect x="80" y="1745" width="22" height="22" fill="${
                  COLORS.text
                }" />
                <text x="116" y="1762" font-family="Segoe UI, Arial, sans-serif" font-size="13" fill="${
                  COLORS.text
                }">Disjuntor fechado sem tens\u00E3o</text>
                <text x="78" y="1802" font-family="Segoe UI, Arial, sans-serif" font-size="16" font-weight="900" fill="${
                  COLORS.text
                }">ALIMENTA\u00C7\u00D5ES EM CORRENTE CONT\u00CDNUA</text>
                <text x="88" y="1830" font-family="Segoe UI, Arial, sans-serif" font-size="13" fill="${
                  COLORS.text
                }">${escapeXml(dc[0] ?? '')}</text>
                <text x="88" y="1854" font-family="Segoe UI, Arial, sans-serif" font-size="13" fill="${
                  COLORS.text
                }">${escapeXml(dc[1] ?? '')}</text>
            </g>
        `;
  },

  eventsSvg() {
    const events = this.state.events
      .map(
        (event, index) => `
                <text
                    x="78" y="${1928 + index * 24}"
                    font-family="Consolas, monospace"
                    font-size="12"
                    fill="${COLORS.text}"
                >${escapeXml(
                  `${event.time}  ${event.equipment}  ${event.message}`
                )}</text>
            `
      )
      .join('');

    return `
            <g aria-label="Eventos do painel">
                <rect x="58" y="1890" width="500" height="210" fill="${
                  COLORS.panel
                }" stroke="${COLORS.border}" stroke-width="1.4" />
                <text x="78" y="1918" font-family="Segoe UI, Arial, sans-serif" font-size="16" font-weight="900" fill="${
                  COLORS.text
                }">EVENTOS DO PAINEL</text>
                ${events}
                <text x="78" y="2083" font-family="Segoe UI, Arial, sans-serif" font-size="12" fill="${
                  COLORS.muted
                }">Revis\u00E3o do diagrama: ${escapeXml(
      this.panel.revision
    )}</text>
            </g>
        `;
  },

  bindCommands(svg) {
    svg.querySelectorAll('[data-action]').forEach((element) => {
      const command = (event) => {
        event.preventDefault();
        event.stopPropagation();

        const action = element.getAttribute('data-action');

        if (action === 'incoming-normal') {
          this.toggleNormalIncoming();
          return;
        }

        if (action === 'incoming-reserve') {
          this.toggleReserveIncoming();
          return;
        }

        if (action === 'outgoing') {
          this.toggleOutgoing(element.getAttribute('data-breaker-id'));
        }
      };

      element.addEventListener('click', command);
      element.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          command(event);
        }
      });
    });
  },

  toggleNormalIncoming() {
    if (!this.isManualMode()) {
      this.showManualModeMessage(this.panel.normal.incomingBreaker);

      this.addEvent(
        `DJ ${this.panel.normal.incomingBreaker}`,
        'COMANDO BLOQUEADO - PAINEL EM AUTOMÁTICO'
      );

      this.redraw();
      return false;
    }

    const breaker = this.panel.normal.incomingBreaker;

    if (
      this.linkedToEngine &&
      typeof Engine.togglePcaLoadNormalByPanelId === 'function'
    ) {
      /*
       * Antes do comando, busca novamente o estado real no Engine.
       * Assim o comando não depende de um estado visual antigo.
       */
      this.syncIncomingFromEngine(false);

      const desiredClosed =
        !this.state.normalClosed;

      const changed =
        Engine.togglePcaLoadNormalByPanelId(
          this.panel.id,
          desiredClosed
        );

      this.syncIncomingFromEngine(true);

      return changed;
    }

    if (!this.state.normalClosed) {
      if (this.state.reserveClosed) {
        this.addEvent(
          breaker,
          'COMANDO BLOQUEADO - ABRA A RESERVA ANTES DE FECHAR A PRINCIPAL'
        );
        this.redraw();
        return;
      }

      clearInterval(this.transferTimer);
      this.transferTimer = null;
      this.state.transferRemaining = 0;
      this.state.normalClosed = true;
      this.addEvent(breaker, 'FECHADO PELO OPERADOR');
      this.redraw();
      return;
    }

    this.state.normalClosed = false;
    this.addEvent(breaker, 'ABERTO PELO OPERADOR');
    this.redraw();
    this.startReserveTransfer();
  },

  toggleReserveIncoming() {
    if (!this.isManualMode()) {
      this.showManualModeMessage(this.panel.reserve.incomingBreaker);

      this.addEvent(
        `DJ ${this.panel.reserve.incomingBreaker}`,
        'COMANDO BLOQUEADO - PAINEL EM AUTOMÁTICO'
      );

      this.redraw();
      return false;
    }

    const breaker = this.panel.reserve.incomingBreaker;

    if (
      this.linkedToEngine &&
      typeof Engine.togglePcaLoadReserveByPanelId === 'function'
    ) {
      this.syncIncomingFromEngine(false);

      const desiredClosed =
        !this.state.reserveClosed;

      const changed =
        Engine.togglePcaLoadReserveByPanelId(
          this.panel.id,
          desiredClosed
        );

      this.syncIncomingFromEngine(true);

      return changed;
    }

    if (!this.state.reserveClosed) {
      if (this.state.normalClosed) {
        this.addEvent(
          breaker,
          'COMANDO BLOQUEADO - FONTE PRINCIPAL AINDA FECHADA'
        );
        this.redraw();
        return;
      }

      clearInterval(this.transferTimer);
      this.transferTimer = null;
      this.state.transferRemaining = 0;
      this.state.reserveClosed = true;
      this.addEvent(breaker, 'FECHADO PELO OPERADOR');
      this.redraw();
      return;
    }

    this.state.reserveClosed = false;
    this.addEvent(breaker, 'ABERTO PELO OPERADOR');
    this.redraw();
  },

  startReserveTransfer() {
    clearInterval(this.transferTimer);
    this.transferTimer = null;

    if (
      this.state.normalClosed ||
      this.state.reserveClosed ||
      !this.state.reserveAvailable
    ) {
      return;
    }

    this.state.transferRemaining = normalizeSeconds(
      this.panel.reserveDelaySeconds
    );

    this.addEvent(
      this.panel.reserve.incomingBreaker,
      `TRANSFER\u00CANCIA AUTOM\u00C1TICA INICIADA - ${this.state.transferRemaining} s`
    );
    this.redraw();

    this.transferTimer = window.setInterval(() => {
      if (
        this.state.normalClosed ||
        this.state.reserveClosed ||
        !this.state.reserveAvailable
      ) {
        clearInterval(this.transferTimer);
        this.transferTimer = null;
        this.state.transferRemaining = 0;
        this.redraw();
        return;
      }

      this.state.transferRemaining -= 1;

      if (this.state.transferRemaining <= 0) {
        clearInterval(this.transferTimer);
        this.transferTimer = null;
        this.state.transferRemaining = 0;
        this.state.reserveClosed = true;
        this.addEvent(
          this.panel.reserve.incomingBreaker,
          'FECHADO AUTOMATICAMENTE - FONTE RESERVA'
        );
      }

      this.redraw();
    }, 1000);
  },

  toggleOutgoing(breakerId) {
    if (!this.isManualMode()) {
      this.showManualModeMessage(breakerId);

      this.addEvent(
        `DJ ${breakerId}`,
        'COMANDO BLOQUEADO - PAINEL EM AUTOMÁTICO'
      );

      this.redraw();
      return false;
    }

    const breaker = this.state.outgoing.find(
      (item) => String(item.id) === String(breakerId)
    );

    if (!breaker || breaker.available === false) {
      return;
    }

    breaker.closed = !breaker.closed;
    this.addEvent(
      breaker.id,
      breaker.closed ? 'FECHADO PELO OPERADOR' : 'ABERTO PELO OPERADOR'
    );
    this.redraw();
  },
};
