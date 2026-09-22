// Engine.js
import {
  ActiveScenario as Scenario01,
  loadActiveScenario,
} from './ScenarioActive.js';
import { EventLog } from './EventLog.js';
import { Breaker } from './Breaker.js';

export const Engine = {
  initialized: false,

  normalScenarioState: null,

  onStateChange: null,

  mainPanelModeChangeHandler: null,

  breakerRackCommandHandler: null,

  transferTimer: null,

  pcaTransferTimers: new Map(),

  pcaTransferDeadlines: new Map(),

  auxPanelTransferTimers: new Map(),

  auxPanelTransferDeadlines: new Map(),

  // Temporização de partida automática dos GAEs durante blackout.
  gaeStartTimers: new Map(),
  gaeStartDeadlines: new Map(),
  gaeStartDelay: 10000,
  gaeEmergencyColor: '#00B8D9',

  /*
   * Simulação de BLACKOUT pelo botão do topo.
   * Temporariamente configurado para desligar uma UG a cada 1 segundo.
   * Esse valor ficará centralizado aqui para facilitar o ajuste posterior.
   */
  blackoutStepDelay: 1000,
  blackoutTimers: [],
  blackoutSimulationRunning: false,

  transferDelay: 1300,

  deenergizedColor: '#8a8a8a',

  auxPanelTransferConfigs: {
    AUX_7QS1: {
      type: 'bus-tie',
      delay: 2500,
    },
    AUX_7QS2: {
      type: 'bus-tie',
      delay: 2500,
    },
    AUX_CMCS: {
      type: 'source-transfer',
      delay: 3000,
    },
    AUX_1QA: {
      type: 'bus-tie',
      delay: 2500,
    },
    AUX_2QA: {
      type: 'bus-tie',
      delay: 2500,
    },
    AUX_3QA: {
      type: 'bus-tie',
      delay: 2500,
    },
    AUX_4QA: {
      type: 'bus-tie',
      delay: 2500,
    },
    AUX_8QV: {
      type: 'bus-tie',
      delay: 2500,
    },
  },

  unitBreakers: {
    UG01: ['107', '111'],
    UG02: ['109'],
    UG11: ['108', '110'],
    UG12: ['112'],
  },

  /*
   * Condições mínimas de alimentação auxiliar para permitir a partida
   * das UGs após um blackout.
   *
   * A verificação é feita pelo estado REAL de energização do respectivo
   * CCM/CM. Assim, se um GAE falhar e não conseguir energizar o quadro,
   * somente a UG dependente daquele quadro permanece bloqueada.
   */
  unitStartAuxiliaryRequirements: {
    UG01: ['CCM-U01'],
    UG02: ['CM-2'],
    UG11: ['CM-11'],
    UG12: ['CM-12'],
  },
  manualIncomingBreakers: {
    107: {
      panelId: '1QP',
      source: 'UG01',
      busIndex: 0,
    },

    108: {
      panelId: '1QP',
      source: 'UG11',
      busIndex: 1,
    },

    109: {
      panelId: '1QP',
      source: 'UG02',
      busIndex: 2,
    },

    120: {
      panelId: '1QP',
      source: 'SE138_1QP',
      busIndex: null,
    },

    110: {
      panelId: '3QP',
      source: 'UG11',
      busIndex: 0,
    },

    111: {
      panelId: '3QP',
      source: 'UG01',
      busIndex: 1,
    },

    112: {
      panelId: '3QP',
      source: 'UG12',
      busIndex: 2,
    },

    135: {
      panelId: '3QP',
      source: 'SE138_3QP',
      busIndex: null,
    },
  },
  unitColors: {
    UG01: '#3f7cff',
    UG02: '#e4c24a',
    UG11: '#ff44dd',
    UG12: '#44dd55',
    SE138_1QP: '#f28c28',
    SE138_3QP: '#f28c28',
  },

  restorationPlans: {
    UG01: {
      localPanelId: 'PSA-U01',
      localBreakerId: '1001',
      requirements: [
        {
          couplerId: '101',
          mainPanelId: '1QP',
          busIndex: 0,
          incomingBreakerId: '107',
        },
        {
          couplerId: '103',
          mainPanelId: '3QP',
          busIndex: 1,
          incomingBreakerId: '111',
        },
      ],
    },

    UG11: {
      localPanelId: '3QD-11',
      localBreakerId: '104',
      requirements: [
        {
          couplerId: '101',
          mainPanelId: '1QP',
          busIndex: 1,
          incomingBreakerId: '108',
        },
        {
          couplerId: '103',
          mainPanelId: '3QP',
          busIndex: 0,
          incomingBreakerId: '110',
        },
      ],
    },

    UG12: {
      localPanelId: '3QD-12',
      localBreakerId: '106',
      requirements: [
        {
          couplerId: '102',
          mainPanelId: '1QP',
          busIndex: 2,
          incomingBreakerId: '109',
        },
        {
          couplerId: '104',
          mainPanelId: '3QP',
          busIndex: 2,
          incomingBreakerId: '112',
        },
      ],
    },
  },

  /*
   * Configuração normal dos seis barramentos.
   *
   * 1QP:
   * Barra 1 = UG01
   * Barra 2 = UG11
   * Barra 3 = UG02
   *
   * 3QP:
   * Barra 1 = UG11
   * Barra 2 = UG01
   * Barra 3 = UG12
   */
  normalBusSources: {
    '1QP': ['UG01', 'UG11', 'UG02'],

    '3QP': ['UG11', 'UG01', 'UG12'],
  },

  panelFeeders: {
    '1QP': [
      ['113', '114', '115', '116', '117'],
      ['118', '119', '121', '122'],
      ['123', '124', '125', '126', '127'],
    ],

    '3QP': [
      ['128', '129', '130', '131', '132'],
      ['133', '134', '136', '137'],
      ['138', '139', '140', '141', '142'],
    ],
  },

  couplersByPanel: {
    '1QP': ['101', '102'],

    '3QP': ['103', '104'],
  },

  initialize(options = {}) {
    this.onStateChange =
      typeof options.onStateChange === 'function'
        ? options.onStateChange
        : null;

    if (Number.isFinite(options.transferDelay) && options.transferDelay >= 0) {
      this.transferDelay = options.transferDelay;
    }

    this.mainPanelModeChangeHandler = (event) => {
      const detail = event?.detail ?? {};

      const panelId = String(detail.panelId ?? detail.id ?? '').toUpperCase();

      if (['1QP', '3QP'].includes(panelId)) {
        this.setMainPanelOperationMode(
          panelId,
          detail.mode ?? detail.operationMode
        );

        return;
      }

      this.setPcaLoadOperationMode(
        panelId,
        detail.mode ?? detail.operationMode
      );
    };

    window.addEventListener(
      'scada:panel-mode-changed',
      this.mainPanelModeChangeHandler
    );

    /*
     * Mapa global da posição mecânica dos DJs.
     * true  = INSERIDO
     * false = EXTRAÍDO
     *
     * Ele é separado do estado elétrico para preservar toda a
     * lógica já existente de aberto/fechado/automático/subtensão.
     */
    window.__scadaBreakerPositions = window.__scadaBreakerPositions ?? {};

    this.breakerRackCommandHandler = (event) => {
      const detail = event?.detail ?? {};

      this.setBreakerInserted(detail.id, detail.label, detail.inserted);
    };

    window.addEventListener(
      'scada:breaker-rack-command',
      this.breakerRackCommandHandler
    );

    /*
     * Ao abrir o simulador, a configuracao normal ja deve representar
     * as seis entradas das barras ligadas. Esta etapa precisa acontecer
     * antes da captura do estado normal; caso contrario, o botao NORMAL
     * restauraria os DJs 107 a 112 com o estado incorreto do Scenario01.
     */
    this.applyScenarioProfile();

    this.applyNormalIncomingBreakerStates();

    this.captureNormalState();

    this.initialized = true;

    this.propagateColors();

    return this;
  },

  destroy() {
    this.cancelTransferTimer();

    this.pcaTransferTimers.forEach((timer) => {
      window.clearTimeout(timer);
    });

    this.pcaTransferTimers.clear();
    this.pcaTransferDeadlines.clear();

    this.cancelAllAuxPanelTransfers();

    this.cancelAllGaeAutomaticStarts();

    if (this.mainPanelModeChangeHandler) {
      window.removeEventListener(
        'scada:panel-mode-changed',
        this.mainPanelModeChangeHandler
      );

      this.mainPanelModeChangeHandler = null;
    }

    if (this.breakerRackCommandHandler) {
      window.removeEventListener(
        'scada:breaker-rack-command',
        this.breakerRackCommandHandler
      );

      this.breakerRackCommandHandler = null;
    }

    this.onStateChange = null;

    this.initialized = false;
  },

  cloneState(source) {
    if (typeof structuredClone === 'function') {
      return structuredClone(source);
    }

    return JSON.parse(JSON.stringify(source));
  },

  applyScenarioProfile() {
    const profile = Scenario01.engineProfile ?? {};

    this.operationalUnits = Array.isArray(profile.operationalUnits)
      ? [...profile.operationalUnits]
      : ['UG01', 'UG02', 'UG11', 'UG12'];

    if (profile.unitBreakers) {
      this.unitBreakers = this.cloneState(profile.unitBreakers);
    }

    if (profile.normalBusSources) {
      this.normalBusSources = this.cloneState(profile.normalBusSources);
    }

    const incomingSources = profile.incomingSources ?? {};

    Object.entries(this.manualIncomingBreakers).forEach(
      ([breakerId, config]) => {
        if (incomingSources[breakerId]) {
          config.source = incomingSources[breakerId];
        }
      }
    );

    const sourcePanels = {
      UG01: { panelId: 'PSA-U01', breakerId: '1001' },
      UG02: { panelId: '1QD-2', breakerId: '103' },
      UG11: { panelId: '3QD-11', breakerId: '104' },
      UG12: { panelId: '3QD-12', breakerId: '106' },
    };

    const rebuiltPlans = {};

    Object.entries(sourcePanels).forEach(([unitId, local]) => {
      const requirements = [];

      Object.entries(this.normalBusSources).forEach(([panelId, sources]) => {
        sources.forEach((source, busIndex) => {
          if (source !== unitId) return;

          const incomingIds =
            panelId === '1QP' ? ['107', '108', '109'] : ['110', '111', '112'];

          const couplerIds =
            panelId === '1QP' ? ['101', '102'] : ['103', '104'];

          requirements.push({
            couplerId: couplerIds[busIndex === 2 ? 1 : 0],
            mainPanelId: panelId,
            busIndex,
            incomingBreakerId: incomingIds[busIndex],
          });
        });
      });

      rebuiltPlans[unitId] = {
        localPanelId: local.panelId,
        localBreakerId: local.breakerId,
        requirements,
      };
    });

    this.restorationPlans = rebuiltPlans;
  },

  loadScenario(source) {
    if (!source) return false;

    this.cancelBlackoutSimulation();
    this.cancelTransferTimer();
    this.cancelAllAuxPanelTransfers();
    this.cancelAllGaeAutomaticStarts();

    loadActiveScenario(source);
    this.applyScenarioProfile();

    this.normalScenarioState = null;
    this.resetAllBreakerPositions();
    this.applyNormalIncomingBreakerStates();
    this.captureNormalState();
    this.propagateColors();

    EventLog.add('SISTEMA', `${Scenario01.name} CARREGADO`, 'info');

    this.notifyStateChange('scenario-loaded', {
      scenarioId: Scenario01.id,
    });

    return true;
  },

  captureNormalState() {
    if (this.normalScenarioState) {
      return;
    }

    this.normalScenarioState = this.cloneState(Scenario01);
  },

  applyNormalIncomingBreakerStates() {
    Object.entries(this.manualIncomingBreakers).forEach(
      ([breakerId, config]) => {
        /*
         * As fontes externas 120 e 135 nao fazem parte deste ajuste.
         * Aqui entram somente os seis DJs normais das UGs.
         */
        if (!['107', '108', '109', '110', '111', '112'].includes(breakerId)) {
          return;
        }

        const breaker = this.getIncomingBreaker(breakerId);

        if (!breaker) {
          return;
        }

        const source = config.source;
        const sourceAvailable = this.isUnitRunning(source);

        breaker.closed = true;
        breaker.state = Breaker.STATES.CLOSED_UNDERVOLTAGE_TRIP;
        breaker.breakerState = Breaker.STATES.CLOSED_UNDERVOLTAGE_TRIP;
        breaker.sourceEnergized = sourceAvailable;
        breaker.energized = sourceAvailable;
        breaker.suppliedBy = sourceAvailable ? source : null;
        breaker.color = this.getUnitColor(source);
      }
    );

    /*
     * As fontes externas devem iniciar prontas para comando:
     *
     * - DJ 120 e DJ 135 INSERIDOS;
     * - ambos DESLIGADOS;
     * - tensão externa disponível no lado da fonte.
     *
     * Dessa forma, um único clique fecha o DJ e energiza o respectivo
     * QP em laranja. Não é necessário primeiro inserir o equipamento.
     */
    [
      { breakerId: '120', source: 'SE138_1QP' },
      { breakerId: '135', source: 'SE138_3QP' },
    ].forEach(({ breakerId, source }) => {
      const breaker = this.getIncomingBreaker(breakerId);

      if (!breaker) {
        return;
      }

      breaker.closed = false;
      breaker.state = Breaker.STATES.OPEN_AUTO;
      breaker.breakerState = Breaker.STATES.OPEN_AUTO;
      breaker.sourceEnergized = true;
      breaker.energized = false;
      breaker.suppliedBy = null;
      breaker.color = this.deenergizedColor;

      this.getBreakerPositionStore()[breakerId] = true;
    });

    /*
     * A UG-02 está em modernização. O DJ 103 do 1QD-2 deve permanecer
     * desligado, desenergizado e indisponível para comando.
     */
    const modernization = Scenario01.engineProfile?.modernization;
    const modernizationPanel = modernization
      ? this.getDistributionPanel(modernization.panelId)
      : null;

    if (
      modernizationPanel &&
      Scenario01.units?.[modernization.unitId]?.maintenance === true
    ) {
      modernizationPanel.closed = false;
      modernizationPanel.breakerState = Breaker.STATES.OPEN;
      modernizationPanel.outputEnergized = false;
      modernizationPanel.energized = false;
      modernizationPanel.available = false;
      modernizationPanel.color = this.deenergizedColor;
    }

    this.openAllCouplers();
    this.applyNormalBusSources();
  },

  cancelTransferTimer() {
    if (this.transferTimer !== null) {
      window.clearTimeout(this.transferTimer);

      this.transferTimer = null;
    }
  },

  //==================================================
  // POSIÇÃO MECÂNICA DOS DISJUNTORES
  // INSERIDO / EXTRAÍDO
  //==================================================

  getBreakerPositionStore() {
    window.__scadaBreakerPositions = window.__scadaBreakerPositions ?? {};

    return window.__scadaBreakerPositions;
  },

  isBreakerInserted(breakerId, breakerLabel = null) {
    const store = this.getBreakerPositionStore();

    const id = String(breakerId ?? '').trim();

    const label = String(breakerLabel ?? '').trim();

    if (id && typeof store[id] === 'boolean') {
      return store[id];
    }

    if (label && typeof store[label] === 'boolean') {
      return store[label];
    }

    return true;
  },

  setBreakerInserted(breakerId, breakerLabel, inserted) {
    const id = String(breakerId ?? '').trim();

    const label = String(breakerLabel ?? '').trim();

    const desiredInserted = inserted !== false;

    if (!id && !label) {
      return false;
    }

    const store = this.getBreakerPositionStore();

    /*
     * O Breaker.js já impede a extração com o DJ fechado.
     * Esta segunda validação protege chamadas externas.
     */
    const matchingIncoming = this.getIncomingBreaker(label || id);

    const matchingCoupler = this.getBusBreaker(label || id);

    const matchingDistribution =
      Scenario01.distributionPanels?.find(
        (panel) =>
          String(panel.breaker ?? '') === String(label || id) ||
          String(panel.id ?? '') === String(id).replace(/-breaker$/, '')
      ) ?? null;

    const matchingPcaMain = this.getPcaMainBreakerRuntimeState?.(
      this.parsePcaMainBreakerId(label || id) ?? this.parsePcaMainBreakerId(id)
    );

    const electricalObject =
      matchingIncoming ??
      matchingCoupler ??
      matchingDistribution ??
      matchingPcaMain;

    if (
      desiredInserted === false &&
      electricalObject &&
      this.isBreakerClosed(electricalObject)
    ) {
      this.showOperationMessage(
        `COMANDO BLOQUEADO\nDesligue o DJ ${label || id} antes de EXTRAIR.`
      );

      EventLog.add(
        `DJ ${label || id}`,
        'EXTRACAO BLOQUEADA - DISJUNTOR LIGADO',
        'warning'
      );

      return false;
    }

    if (id) {
      store[id] = desiredInserted;
    }

    /*
     * Também grava pelo número/tag mostrado ao operador.
     * Assim as rotinas do Engine, que normalmente conhecem
     * apenas o número do DJ, conseguem respeitar a posição.
     */
    const shouldStoreByLabel = label && !String(id).startsWith('pca-main:');

    if (shouldStoreByLabel) {
      store[label] = desiredInserted;
    }

    EventLog.add(
      `DJ ${label || id}`,
      desiredInserted ? 'DISJUNTOR INSERIDO' : 'DISJUNTOR EXTRAIDO',
      desiredInserted ? 'info' : 'warning'
    );

    this.propagateColors();

    this.notifyStateChange('breaker-rack-position-changed', {
      breakerId: id,
      breakerLabel: label,
      inserted: desiredInserted,
    });

    return true;
  },

  ensureBreakerInserted(breakerId, breakerLabel = null) {
    if (this.isBreakerInserted(breakerId, breakerLabel)) {
      return true;
    }

    const label = String(breakerLabel ?? breakerId ?? '');

    this.showOperationMessage(
      `COMANDO BLOQUEADO\nO DJ ${label} está EXTRAÍDO. Insira o disjuntor antes de ligar.`
    );

    EventLog.add(
      `DJ ${label}`,
      'COMANDO BLOQUEADO - DISJUNTOR EXTRAIDO',
      'warning'
    );

    return false;
  },

  //==================================================
  // REINSERE TODOS OS DJs
  // USADO PELA CONDIÇÃO NORMAL
  //==================================================

  resetAllBreakerPositions() {
    const store = this.getBreakerPositionStore();

    /*
     * A ausência de uma entrada no mapa representa
     * a condição padrão: DJ INSERIDO.
     *
     * Portanto, ao restaurar a condição NORMAL,
     * basta limpar todas as posições mecânicas
     * alteradas pelo operador.
     */
    Object.keys(store).forEach((key) => {
      delete store[key];
    });

    return true;
  },

  getUnitState(unitId) {
    return Scenario01.units?.[unitId] ?? null;
  },

  getGenerator(unitId) {
    return Scenario01.generators?.find((item) => item.id === unitId) ?? null;
  },

  getIncomingBreaker(breakerId) {
    return (
      Scenario01.incomingBreakers?.find(
        (item) => String(item.id) === String(breakerId)
      ) ?? null
    );
  },

  getUnitBreakerIds(unitId) {
    return this.unitBreakers[unitId] ?? [];
  },

  getPanel(panelId) {
    return Scenario01.panels?.find((item) => item.id === panelId) ?? null;
  },

  getPanelFeeder(panelId, feederId) {
    const panel = this.getPanel(panelId);

    return (
      panel?.feeders?.find(
        (feeder) => String(feeder.id) === String(feederId)
      ) ?? null
    );
  },

  getBusBreaker(breakerId) {
    for (const panel of Scenario01.panels ?? []) {
      const breaker = panel.busBreakers?.find(
        (item) => String(item.id) === String(breakerId)
      );

      if (breaker) {
        return breaker;
      }
    }

    return null;
  },

  getCouplerPanelId(breakerId) {
    const id = String(breakerId);

    if (['101', '102'].includes(id)) {
      return '1QP';
    }

    if (['103', '104'].includes(id)) {
      return '3QP';
    }

    return null;
  },

  setMainPanelOperationMode(panelId, mode) {
    const normalizedPanelId = String(panelId).toUpperCase();

    if (!['1QP', '3QP'].includes(normalizedPanelId)) {
      return false;
    }

    const panel = this.getPanel(normalizedPanelId);

    if (!panel) {
      return false;
    }

    const normalizedMode = String(mode).toUpperCase();

    if (!['AUTO', 'MANUAL'].includes(normalizedMode)) {
      return false;
    }

    panel.operationMode = normalizedMode;

    EventLog.add(
      normalizedPanelId,
      `PAINEL COLOCADO EM ${normalizedMode}`,
      normalizedMode === 'MANUAL' ? 'warning' : 'info'
    );

    this.notifyStateChange('main-panel-mode-changed', {
      panelId: normalizedPanelId,
      mode: normalizedMode,
    });

    return true;
  },

  setPanelOperationMode(panelId, mode) {
    const normalizedPanelId = String(panelId).toUpperCase();

    if (['1QP', '3QP'].includes(normalizedPanelId)) {
      return this.setMainPanelOperationMode(normalizedPanelId, mode);
    }

    if (this.getPcaLoadTransferConfigByPanelId(normalizedPanelId)) {
      return this.setPcaLoadOperationMode(normalizedPanelId, mode);
    }

    if (this.getAuxPanel(normalizedPanelId)) {
      return this.setAuxPanelOperationMode(normalizedPanelId, mode);
    }

    return false;
  },

  isPanelAutomatic(panelId) {
    const panel = this.getPanel(panelId);

    return String(panel?.operationMode ?? 'AUTO').toUpperCase() === 'AUTO';
  },

  setPcaLoadOperationMode(panelId, mode) {
    const config = this.getPcaLoadTransferConfigByPanelId(panelId);

    if (!config) {
      return false;
    }

    const load = this.getPcaLoad(config.groupId, config.loadId);

    if (!load) {
      return false;
    }

    const normalizedMode = String(mode).toUpperCase();

    if (!['AUTO', 'MANUAL'].includes(normalizedMode)) {
      return false;
    }

    const key = `${config.groupId}:${config.loadId}`;

    /*
     * IMPORTANTE:
     * captura o estado FÍSICO dos dois DJs antes de trocar o modo.
     * Assim um manualTransferStates antigo nunca pode reaparecer e
     * fazer o Engine acreditar que um DJ aberto ainda está fechado.
     */
    const normalClosedBeforeMode = this.getPcaTransferDevicePhysicalClosed(
      load,
      config.normal
    );

    const reserveClosedBeforeMode = this.getPcaTransferDevicePhysicalClosed(
      load,
      config.reserve
    );

    load.operationMode = normalizedMode;

    if (normalizedMode === 'MANUAL') {
      load.manualTransferStates = {
        [this.getPcaTransferDeviceKey(config.normal)]: normalClosedBeforeMode,
        [this.getPcaTransferDeviceKey(config.reserve)]: reserveClosedBeforeMode,
      };

      this.cancelPcaTransferTimer(key);
    } else {
      load.manualTransferStates = null;
      load.manualNormalOpen = false;

      const feederSupplyMap = this.getFeederSupplyMap();

      this.updatePcaLoadTransfers(feederSupplyMap, key);
    }

    EventLog.add(
      config.loadId,
      `PAINEL COLOCADO EM ${normalizedMode}`,
      normalizedMode === 'MANUAL' ? 'warning' : 'info'
    );

    this.notifyStateChange('pca-load-mode-changed', {
      panelId: config.loadId,
      mode: normalizedMode,
    });

    return true;
  },
  toggleIncomingBreaker(breakerId) {
    const id = String(breakerId);

    const config = this.manualIncomingBreakers?.[id];

    if (!config) {
      console.warn(`[Engine] DJ ${id} não configurado para comando manual.`);

      return false;
    }

    const { panelId, source, busIndex } = config;

    const panel = this.getPanel(panelId);

    if (!panel) {
      return false;
    }

    const operationMode = String(panel.operationMode ?? 'AUTO').toUpperCase();

    //==================================================
    // BLOQUEIO EM AUTOMÁTICO
    //==================================================

    if (operationMode !== 'MANUAL') {
      this.showOperationMessage(
        `COMANDO BLOQUEADO\nO DJ ${id} está sob controle automático do ${panelId}. Selecione o ${panelId} em MANUAL para realizar esta operação.`
      );

      EventLog.add(
        `DJ ${id}`,
        `COMANDO BLOQUEADO - ${panelId} EM AUTOMATICO`,
        'warning'
      );

      return false;
    }

    const breaker = this.getIncomingBreaker(id);

    if (!breaker) {
      console.warn(`[Engine] DJ ${id} não encontrado em incomingBreakers.`);

      return false;
    }

    const currentlyClosed = this.isBreakerClosed(breaker);

    const closing = !currentlyClosed;

    if (closing && !this.ensureBreakerInserted(id, id)) {
      return false;
    }

    //==================================================
    // BLOQUEIO DE FECHAMENTO COM INTERLIGACAO LIGADA
    //==================================================

    if (closing) {
      const restorationRequirement = Object.values(this.restorationPlans)
        .flatMap((plan) => plan.requirements ?? [])
        .find((requirement) => String(requirement.incomingBreakerId) === id);

      const couplerId = restorationRequirement?.couplerId ?? null;

      if (couplerId && this.isBreakerClosed(this.getBusBreaker(couplerId))) {
        this.showOperationMessage(
          `COMANDO BLOQUEADO\nPara ligar o DJ ${id}, desligue primeiro o DJ ${couplerId} de interligacao do ${panelId}.`
        );

        EventLog.add(
          `DJ ${id}`,
          `COMANDO BLOQUEADO - DJ ${couplerId} DE INTERLIGACAO LIGADO`,
          'warning'
        );

        return false;
      }
    }

    //==================================================
    // ALTERA ESTADO DO DJ
    //==================================================

    breaker.closed = closing;

    breaker.state = closing
      ? Breaker.STATES.CLOSED_UNDERVOLTAGE_TRIP
      : Breaker.STATES.OPEN_UNDERVOLTAGE_TRIP;

    breaker.breakerState = breaker.state;

    //==================================================
    // VERIFICA DISPONIBILIDADE DA FONTE
    //==================================================

    let sourceAvailable = false;

    if (this.getUnitState(source)) {
      sourceAvailable = this.isUnitRunning(source);
    } else {
      /*
       * Fontes externas.
       * Mantém o valor já existente no cenário.
       */
      sourceAvailable = breaker.sourceEnergized !== false;
    }

    breaker.sourceEnergized = sourceAvailable;

    breaker.energized = closing && sourceAvailable;

    breaker.suppliedBy = breaker.energized ? source : null;

    breaker.color = breaker.energized
      ? this.getUnitColor(source)
      : this.deenergizedColor;

    //==================================================
    // ATUALIZA BARRAMENTO CORRESPONDENTE
    //==================================================

    if (Number.isInteger(busIndex)) {
      this.setBusSectionState(
        panelId,
        busIndex,
        breaker.energized ? source : null
      );
    }

    //==================================================
    // FONTES EXTERNAS SE1 / SE2
    // DJ 120 energiza as três barras do 1QP.
    // DJ 135 energiza as três barras do 3QP.
    //==================================================

    if (
      !Number.isInteger(busIndex) &&
      (source === 'SE138_1QP' || source === 'SE138_3QP')
    ) {
      const normalSources = this.normalBusSources?.[panelId] ?? [];

      normalSources.forEach((normalSource, sectionIndex) => {
        if (breaker.energized) {
          this.setBusSectionState(panelId, sectionIndex, source);

          return;
        }

        /*
         * Ao desligar a fonte externa, a barra retorna para sua chegada
         * normal somente quando o respectivo DJ estiver fechado e com
         * tensão disponível. Caso contrário, permanece desenergizada.
         */
        const normalIncomingEntry = Object.entries(
          this.manualIncomingBreakers
        ).find(
          ([, incomingConfig]) =>
            incomingConfig.panelId === panelId &&
            incomingConfig.busIndex === sectionIndex
        );

        const normalIncoming = normalIncomingEntry
          ? this.getIncomingBreaker(normalIncomingEntry[0])
          : null;

        const normalAvailable =
          this.isBreakerClosed(normalIncoming) &&
          normalIncoming?.energized === true &&
          this.isUnitRunning(normalSource);

        this.setBusSectionState(
          panelId,
          sectionIndex,
          normalAvailable ? normalSource : null
        );
      });
    }

    /*
     * A abertura de qualquer DJ de chegada 107 a 112 provoca falta de
     * tensão na respectiva barra e inicia a transferência dos DJs
     * 101 a 104, mesmo que a UG correspondente continue funcionando.
     */
    if (!closing && Number.isInteger(busIndex)) {
      this.scheduleAutomaticTransfer();
    }

    //==================================================
    // EVENTO
    //==================================================

    EventLog.add(
      `DJ ${id}`,
      closing
        ? `FECHADO PELO OPERADOR - ${panelId}`
        : `ABERTO PELO OPERADOR - ${panelId}`,
      closing ? 'info' : 'warning'
    );

    //==================================================
    // ATUALIZA DIAGRAMA
    //==================================================

    this.propagateColors();

    this.notifyStateChange('incoming-breaker-command', {
      breakerId: id,
      panelId,
      closed: closing,
      energized: breaker.energized === true,
    });

    return true;
  },

  isUnitAvailable(unitId) {
    const unit = this.getUnitState(unitId);

    return Boolean(
      unit && unit.available === true && unit.maintenance === false
    );
  },

  isUnitRunning(unitId) {
    const unit = this.getUnitState(unitId);

    return Boolean(this.isUnitAvailable(unitId) && unit?.running === true);
  },

  getRunningUnits() {
    return (this.operationalUnits ?? ['UG01', 'UG02', 'UG11', 'UG12']).filter(
      (unitId) => this.isUnitRunning(unitId)
    );
  },

  getStoppedUnits() {
    return (this.operationalUnits ?? ['UG01', 'UG02', 'UG11', 'UG12']).filter(
      (unitId) => !this.isUnitRunning(unitId)
    );
  },

  getUnitColor(unitId) {
    return this.unitColors[unitId] ?? this.deenergizedColor;
  },

  setUnitBreakerSources(unitId, energized) {
    this.getUnitBreakerIds(unitId).forEach((breakerId) => {
      const breaker = this.getIncomingBreaker(breakerId);

      if (breaker) {
        breaker.sourceEnergized = energized;
      }
    });
  },

  openUnitBreakers(unitId) {
    const breakerIds = this.getUnitBreakerIds(unitId);

    breakerIds.forEach((breakerId) => {
      const breaker = this.getIncomingBreaker(breakerId);

      if (!breaker) {
        return;
      }

      breaker.sourceEnergized = false;
      breaker.state = Breaker.STATES.OPEN_AUTO;
      breaker.breakerState = Breaker.STATES.OPEN_AUTO;
      breaker.closed = false;
      breaker.energized = false;

      EventLog.add(`DJ ${breakerId}`, 'ABERTO POR FALTA DE TENSAO', 'warning');
    });

    return breakerIds;
  },

  restoreUnitBreakerSource(unitId) {
    this.getUnitBreakerIds(unitId).forEach((breakerId) => {
      const breaker = this.getIncomingBreaker(breakerId);

      if (!breaker) {
        return;
      }

      breaker.sourceEnergized = true;
      breaker.energized = true;
    });
  },

  openAllCouplers(automaticOnly = false) {
    ['101', '102', '103', '104'].forEach((breakerId) => {
      const panelId = this.getCouplerPanelId(breakerId);

      if (automaticOnly && !this.isPanelAutomatic(panelId)) {
        return;
      }

      const breaker = this.getBusBreaker(breakerId);

      if (!breaker) {
        return;
      }

      breaker.state = Breaker.STATES.OPEN_AUTO;

      breaker.breakerState = Breaker.STATES.OPEN_AUTO;

      breaker.closed = false;
      breaker.energized = false;
      breaker.suppliedBy = null;
    });
  },

  closeCoupler(breakerId, suppliedBy, panelId) {
    const breaker = this.getBusBreaker(breakerId);

    if (!breaker) {
      return;
    }

    if (!this.isBreakerInserted(breakerId, breakerId)) {
      EventLog.add(
        `DJ ${breakerId}`,
        'FECHAMENTO AUTOMATICO BLOQUEADO - DISJUNTOR EXTRAIDO',
        'warning'
      );

      return false;
    }

    const color = this.getUnitColor(suppliedBy);

    breaker.state = Breaker.STATES.CLOSED_AUTO;

    breaker.breakerState = Breaker.STATES.CLOSED_AUTO;

    breaker.closed = true;
    breaker.energized = true;
    breaker.suppliedBy = suppliedBy;
    breaker.color = color;

    EventLog.add(
      `DJ ${breakerId}`,
      `FECHADO AUTOMATICAMENTE - ${suppliedBy} ALIMENTA ${panelId}`,
      'info'
    );
  },

  setBusSectionState(panelId, busIndex, suppliedBy) {
    const panel = this.getPanel(panelId);

    const busSection = panel?.busSections?.[busIndex];

    if (!panel || !busSection) {
      return;
    }

    const energized = Boolean(suppliedBy);

    const color = energized
      ? this.getUnitColor(suppliedBy)
      : this.deenergizedColor;

    busSection.color = color;
    busSection.energized = energized;
    busSection.suppliedBy = suppliedBy ?? null;

    const feederIds = this.panelFeeders?.[panelId]?.[busIndex] ?? [];

    feederIds.forEach((feederId) => {
      const feeder = this.getPanelFeeder(panelId, feederId);

      if (!feeder) {
        return;
      }

      const feederClosed = this.isBreakerClosed(feeder);
      const feederEnergized = energized && feederClosed;

      feeder.color = feederEnergized ? color : this.deenergizedColor;
      feeder.energized = feederEnergized;
      feeder.suppliedBy = feederEnergized ? suppliedBy ?? null : null;
    });
  },

  applyNormalBusSources() {
    Object.entries(this.normalBusSources).forEach(([panelId, sources]) => {
      sources.forEach((source, busIndex) => {
        this.setBusSectionState(panelId, busIndex, source);
      });
    });
  },

  applyLossStage() {
    this.openAllCouplers(true);

    Object.entries(this.normalBusSources).forEach(([panelId, sources]) => {
      sources.forEach((normalSource, busIndex) => {
        const suppliedBy = this.isUnitRunning(normalSource)
          ? normalSource
          : null;

        this.setBusSectionState(panelId, busIndex, suppliedBy);
      });
    });

    this.propagateColors();

    this.notifyStateChange('transfer-waiting', {
      delay: this.transferDelay,

      stoppedUnits: this.getStoppedUnits(),
    });
  },

  buildTransferState() {
    const state = {
      sources: {
        '1QP': [null, null, null],

        '3QP': [null, null, null],
      },

      couplers: [],
    };

    /*
     * A transferência é determinada pela tensão realmente disponível
     * depois de cada DJ de chegada, e não apenas pelo estado da UG.
     *
     * 1QP: 107 / 108 / 109  -> DJs 101 e 102
     * 3QP: 110 / 111 / 112  -> DJs 103 e 104
     */

    const panelConfigs = {
      '1QP': {
        incomingIds: ['107', '108', '109'],
        couplerIds: ['101', '102'],
      },

      '3QP': {
        incomingIds: ['110', '111', '112'],
        couplerIds: ['103', '104'],
      },
    };

    Object.entries(panelConfigs).forEach(([panelId, config]) => {
      const normalSources = this.normalBusSources[panelId];

      const directSources = config.incomingIds.map((breakerId, busIndex) => {
        const breaker = this.getIncomingBreaker(breakerId);

        const available =
          this.isBreakerClosed(breaker) &&
          breaker?.sourceEnergized !== false &&
          this.isUnitRunning(normalSources[busIndex]);

        return available ? normalSources[busIndex] : null;
      });

      state.sources[panelId] = [...directSources];

      const availableIndexes = directSources
        .map((source, index) => (source ? index : -1))
        .filter((index) => index >= 0);

      if (availableIndexes.length === 0) {
        return;
      }

      const addCoupler = (couplerIndex, suppliedBy) => {
        const id = config.couplerIds[couplerIndex];

        if (state.couplers.some((item) => item.id === id)) {
          return;
        }

        state.couplers.push({ id, suppliedBy, panelId });
      };

      if (availableIndexes.length === 1) {
        const sourceIndex = availableIndexes[0];
        const suppliedBy = directSources[sourceIndex];

        state.sources[panelId] = [suppliedBy, suppliedBy, suppliedBy];

        addCoupler(0, suppliedBy);
        addCoupler(1, suppliedBy);

        return;
      }

      /* Barra esquerda sem tensão: recebe da barra central pelo primeiro DJ. */
      if (!directSources[0] && directSources[1]) {
        state.sources[panelId][0] = directSources[1];
        addCoupler(0, directSources[1]);
      }

      /*
       * Barra central sem tensão: prioriza a barra esquerda.
       * O segundo DJ permanece aberto para não paralelar fontes.
       */
      if (!directSources[1]) {
        if (directSources[0]) {
          state.sources[panelId][1] = directSources[0];
          addCoupler(0, directSources[0]);
        } else if (directSources[2]) {
          state.sources[panelId][1] = directSources[2];
          addCoupler(1, directSources[2]);
        }
      }

      /* Barra direita sem tensão: recebe da barra central pelo segundo DJ. */
      if (!directSources[2] && directSources[1]) {
        state.sources[panelId][2] = directSources[1];
        addCoupler(1, directSources[1]);
      }
    });

    return state;
  },

  applyAutomaticTransfer() {
    const transferState = this.buildTransferState();

    /*
     * Recalcula toda a configuração das interligações antes de fechar
     * somente os DJs necessários para as barras que perderam tensão.
     */
    this.openAllCouplers();

    Object.entries(transferState.sources).forEach(([panelId, sources]) => {
      sources.forEach((suppliedBy, busIndex) => {
        const validSource = this.isUnitRunning(suppliedBy) ? suppliedBy : null;

        this.setBusSectionState(panelId, busIndex, validSource);
      });
    });

    transferState.couplers.forEach((coupler) => {
      if (!this.isUnitRunning(coupler.suppliedBy)) {
        return;
      }

      this.closeCoupler(coupler.id, coupler.suppliedBy, coupler.panelId);
    });

    this.propagateColors();

    const runningUnits = this.getRunningUnits();

    if (runningUnits.length === 1) {
      EventLog.add(
        'TRANSFERENCIA',
        `${runningUnits[0]} ALIMENTA TODOS OS BARRAMENTOS`,
        'info'
      );
    }

    this.notifyStateChange('automatic-transfer-completed', {
      runningUnits,
      stoppedUnits: this.getStoppedUnits(),

      couplers: transferState.couplers.map((item) => item.id),
    });

    this.transferTimer = null;
  },

  scheduleAutomaticTransfer() {
    this.cancelTransferTimer();

    EventLog.add(
      'TRANSFERENCIA',
      `BARRAMENTOS SEM TENSAO - TEMPORIZACAO DE ${this.transferDelay / 1000} s`,
      'warning'
    );

    this.transferTimer = window.setTimeout(() => {
      this.applyAutomaticTransfer();
    }, this.transferDelay);
  },

  getFeederSupplyMap() {
    const supplyMap = new Map();

    Scenario01.panels?.forEach((panel) => {
      panel.feeders?.forEach((feeder) => {
        const outputNumbers = [feeder.bottomLabel, feeder.secondaryBottomLabel]
          .map((value) => String(value ?? '').trim())
          .filter(Boolean);

        outputNumbers.forEach((outputNumber) => {
          supplyMap.set(outputNumber, {
            color: feeder.color ?? this.deenergizedColor,

            energized: feeder.energized !== false,

            suppliedBy: feeder.suppliedBy ?? null,

            feederId: feeder.id,

            panelId: panel.id,
          });
        });
      });
    });

    return supplyMap;
  },

  isElectricalColor(color) {
    if (typeof color !== 'string') {
      return false;
    }

    const normalized = color.toLowerCase();

    return [
      '#3f7cff',
      '#ff44dd',
      '#44dd55',
      '#e4c24a',
      '#7a858d',
      '#8a8a8a',
      '#00b8d9',
    ].includes(normalized);
  },

  recolorElectricalObject(target, color, energized, suppliedBy) {
    if (!target || typeof target !== 'object') {
      return;
    }

    if (Object.prototype.hasOwnProperty.call(target, 'color')) {
      if (this.isElectricalColor(target.color)) {
        target.color = color;
      }
    }

    if (Object.prototype.hasOwnProperty.call(target, 'energized')) {
      target.energized = energized;
    }

    if (Object.prototype.hasOwnProperty.call(target, 'suppliedBy')) {
      target.suppliedBy = suppliedBy ?? null;
    }

    Object.values(target).forEach((value) => {
      if (value && typeof value === 'object') {
        this.recolorElectricalObject(value, color, energized, suppliedBy);
      }
    });
  },

  propagatePcaPanelColors(feederSupplyMap) {
    Scenario01.pcaPanels?.forEach((panel, panelIndex) => {
      const normalPanel = this.normalScenarioState?.pcaPanels?.[panelIndex];

      const topSourceNumber = String(
        panel.topIncoming?.sourceNumber ?? ''
      ).trim();

      const bottomSourceNumber = String(
        panel.bottomIncoming?.sourceNumber ?? ''
      ).trim();

      const topSupply = this.getPcaSideSupply(panel.id, 'top', feederSupplyMap);

      const bottomSupply = this.getPcaSideSupply(
        panel.id,
        'bottom',
        feederSupplyMap
      );

      if (topSupply && panel.topPanel) {
        panel.topPanel.color = topSupply.color;

        panel.topPanel.energized = topSupply.energized;

        panel.topPanel.suppliedBy = topSupply.suppliedBy;

        panel.topIncoming.energized = topSupply.energized;

        panel.topIncoming.sourceEnergized = topSupply.sourceEnergized;

        panel.topIncoming.suppliedBy = topSupply.suppliedBy;
      }

      if (bottomSupply && panel.bottomPanel) {
        panel.bottomPanel.color = bottomSupply.color;

        panel.bottomPanel.energized = bottomSupply.energized;

        panel.bottomPanel.suppliedBy = bottomSupply.suppliedBy;

        panel.bottomIncoming.energized = bottomSupply.energized;

        panel.bottomIncoming.sourceEnergized = bottomSupply.sourceEnergized;

        panel.bottomIncoming.suppliedBy = bottomSupply.suppliedBy;
      }

      const normalTopColor = normalPanel?.topPanel?.color;

      const normalBottomColor = normalPanel?.bottomPanel?.color;

      const recolorByNormalSource = (current, normal) => {
        if (
          !current ||
          !normal ||
          typeof current !== 'object' ||
          typeof normal !== 'object'
        ) {
          return;
        }

        Object.keys(current).forEach((key) => {
          const currentValue = current[key];

          const normalValue = normal[key];

          if (
            currentValue &&
            normalValue &&
            typeof currentValue === 'object' &&
            typeof normalValue === 'object'
          ) {
            recolorByNormalSource(currentValue, normalValue);

            return;
          }

          if (typeof normalValue !== 'string') {
            return;
          }

          const normalizedValue = normalValue.toLowerCase();

          if (
            topSupply &&
            normalizedValue === String(normalTopColor).toLowerCase()
          ) {
            current[key] = topSupply.color;

            return;
          }

          if (
            bottomSupply &&
            normalizedValue === String(normalBottomColor).toLowerCase()
          ) {
            current[key] = bottomSupply.color;
          }
        });
      };

      recolorByNormalSource(panel, normalPanel);

      panel.energized = Boolean(
        topSupply?.energized || bottomSupply?.energized
      );
    });
  },

  pcaLoadTransfers: [
    {
      groupId: 'P14_R14',
      loadId: 'CCM-U01',
      normalSide: 'top',
      normal: { kind: 'upper', label: '21101' },
      reserve: { kind: 'lower', label: '21102' },
      delay: 3000,
    },
    {
      groupId: 'P14_R14',
      loadId: 'CM-2',
      normalSide: 'top',
      normal: { kind: 'upper', label: '211' },
      reserve: { kind: 'lower', label: '210' },
      delay: 3000,
    },
    {
      groupId: 'P14_R14',
      loadId: 'CCM-U03',
      normalSide: 'top',
      normal: { kind: 'mid' },
      reserve: { kind: 'lower', label: '52-E2' },
      delay: 3000,
    },
    {
      groupId: 'P14_R14',
      loadId: 'CCM-U04',
      normalSide: 'bottom',
      normal: { kind: 'lower', label: '21402' },
      reserve: { kind: 'upper', label: '21401' },
      delay: 3000,
    },

    {
      groupId: 'P58_R58',
      loadId: 'CM-5',
      normalSide: 'top',
      normal: { kind: 'mid' },
      reserve: { kind: 'lower', label: '217' },
      delay: 3000,
    },
    {
      groupId: 'P58_R58',
      loadId: 'CM-6',
      normalSide: 'bottom',
      normal: { kind: 'lower', label: '218' },
      reserve: { kind: 'upper', label: '219' },
      delay: 3000,
    },
    {
      groupId: 'P58_R58',
      loadId: 'CCM-U07',
      normalSide: 'top',
      normal: { kind: 'mid' },
      reserve: { kind: 'lower', label: '52-E2' },
      delay: 3000,
    },
    {
      groupId: 'P58_R58',
      loadId: 'CM-8',
      normalSide: 'bottom',
      normal: { kind: 'lower', label: '222' },
      reserve: { kind: 'upper', label: '223' },
      delay: 3000,
    },

    {
      groupId: 'P0912_R0912',
      loadId: 'CCM-U09',
      normalSide: 'top',
      normal: { kind: 'upper', label: '21901' },
      reserve: { kind: 'lower', label: '21902' },
      delay: 3000,
    },
    {
      groupId: 'P0912_R0912',
      loadId: 'CM-10',
      normalSide: 'bottom',
      normal: { kind: 'lower', label: '226' },
      reserve: { kind: 'upper', label: '227' },
      delay: 3000,
    },
    {
      groupId: 'P0912_R0912',
      loadId: 'CM-11',
      normalSide: 'top',
      normal: { kind: 'upper', label: '228' },
      reserve: { kind: 'lower', label: '229' },
      delay: 3000,
    },
    {
      groupId: 'P0912_R0912',
      loadId: 'CM-12',
      normalSide: 'bottom',
      normal: { kind: 'lower', label: '230' },
      reserve: { kind: 'upper', label: '231' },
      delay: 3000,
    },

    {
      groupId: 'P1316_R1316',
      loadId: 'CCM-U13',
      normalSide: 'top',
      normal: { kind: 'upper', label: '22301' },
      reserve: { kind: 'lower', label: '22302' },
      delay: 3000,
    },
    {
      groupId: 'P1316_R1316',
      loadId: 'CM-14',
      normalSide: 'bottom',
      normal: { kind: 'lower', label: '234' },
      reserve: { kind: 'upper', label: '235' },
      delay: 3000,
    },
    {
      groupId: 'P1316_R1316',
      loadId: 'CM-15',
      normalSide: 'top',
      normal: { kind: 'upper', label: '236' },
      reserve: { kind: 'lower', label: '237' },
      delay: 3000,
    },
    {
      groupId: 'P1316_R1316',
      loadId: 'CM-16',
      normalSide: 'bottom',
      normal: { kind: 'lower', label: '238' },
      reserve: { kind: 'upper', label: '239' },
      delay: 3000,
    },

    {
      groupId: 'P1720_R1720',
      loadId: 'CM-17',
      normalSide: 'top',
      normal: { kind: 'upper', label: '240' },
      reserve: { kind: 'lower', label: '241' },
      delay: 3000,
    },
    {
      groupId: 'P1720_R1720',
      loadId: 'CM-18',
      normalSide: 'bottom',
      normal: { kind: 'lower', label: '242' },
      reserve: { kind: 'upper', label: '243' },
      delay: 3000,
    },
    {
      groupId: 'P1720_R1720',
      loadId: 'CM-19',
      normalSide: 'top',
      normal: { kind: 'upper', label: '244' },
      reserve: { kind: 'lower', label: '245' },
      delay: 3000,
    },
    {
      groupId: 'P1720_R1720',
      loadId: 'CCM-U20',
      normalSide: 'bottom',
      normal: { kind: 'lower', label: '23002' },
      reserve: { kind: 'upper', label: '23001' },
      delay: 3000,
    },
  ],

  samePcaTransferDevice(first, second) {
    if (!first || !second) {
      return false;
    }

    return (
      first.kind === second.kind &&
      String(first.label ?? '') === String(second.label ?? '')
    );
  },

  getPcaLoadTransferConfig(groupId, loadId) {
    return (
      this.pcaLoadTransfers.find(
        (config) =>
          String(config.groupId) === String(groupId) &&
          String(config.loadId) === String(loadId)
      ) ?? null
    );
  },

  normalizePcaLoadId(loadId) {
    const normalized = String(loadId ?? '')
      .trim()
      .toUpperCase()
      .replaceAll('_', '-')
      .replaceAll(' ', '');

    const ccmMatch = normalized.match(/^CCM-?U?-?0*(\d+)$/);

    if (ccmMatch) {
      return `CCM-U${String(Number(ccmMatch[1])).padStart(2, '0')}`;
    }

    const cmMatch = normalized.match(/^CM-0*(\d+)$/);

    if (cmMatch) {
      return `CM-${Number(cmMatch[1])}`;
    }

    return normalized;
  },

  getPcaTransferDeviceKey(device) {
    return `${String(device?.kind ?? '')}:${String(device?.label ?? '')}`;
  },

  getPcaLoadTransferConfigByPanelId(panelId) {
    const normalized = this.normalizePcaLoadId(panelId);

    return (
      this.pcaLoadTransfers.find(
        (config) => this.normalizePcaLoadId(config.loadId) === normalized
      ) ?? null
    );
  },

  getPcaLoadTransferState(panelId) {
    const config = this.getPcaLoadTransferConfigByPanelId(panelId);

    if (!config) {
      return null;
    }

    const load = this.getPcaLoad(config.groupId, config.loadId);

    const panelGroup =
      Scenario01.pcaPanels?.find(
        (panel) => String(panel.id) === String(config.groupId)
      ) ?? null;

    if (!load || !panelGroup) {
      return null;
    }

    const reserveSide = config.normalSide === 'top' ? 'bottom' : 'top';

    const feederSupplyMap = this.getFeederSupplyMap();

    const normalSupply = this.getPcaSideSupply(
      config.groupId,
      config.normalSide,
      feederSupplyMap
    );

    const reserveSupply = this.getPcaSideSupply(
      config.groupId,
      reserveSide,
      feederSupplyMap
    );

    const key = `${config.groupId}:${config.loadId}`;

    const deadline = this.pcaTransferDeadlines.get(key) ?? 0;

    const transferRemaining =
      deadline > Date.now()
        ? Math.max(1, Math.ceil((deadline - Date.now()) / 1000))
        : 0;

    return {
      synchronized: true,
      panelId: String(panelId),
      groupId: config.groupId,
      loadId: config.loadId,
      normalSide: config.normalSide,
      reserveSide,
      normalAvailable: normalSupply?.energized === true,
      reserveAvailable: reserveSupply?.energized === true,
      normalClosed: this.isPcaTransferDeviceClosed(load, config.normal),
      reserveClosed: this.isPcaTransferDeviceClosed(load, config.reserve),
      transferRemaining,
      transferring: this.pcaTransferTimers.has(key),
      activeSupply: load.activeSupply ?? null,
      energized: load.energized === true,
      suppliedBy: load.suppliedBy ?? null,
      operationMode: String(load.operationMode ?? 'AUTO').toUpperCase(),
    };
  },

  togglePcaLoadNormalByPanelId(panelId, desiredClosed = null) {
    const config = this.getPcaLoadTransferConfigByPanelId(panelId);

    if (!config) {
      return false;
    }

    return this.togglePcaLoadBreaker(
      config.groupId,
      config.loadId,
      config.normal,
      desiredClosed
    );
  },

  togglePcaLoadReserveByPanelId(panelId, desiredClosed = null) {
    const config = this.getPcaLoadTransferConfigByPanelId(panelId);

    if (!config) {
      return false;
    }

    return this.togglePcaLoadBreaker(
      config.groupId,
      config.loadId,
      config.reserve,
      desiredClosed
    );
  },

  requestPcaLoadNormalRestoration(panelId) {
    const config = this.getPcaLoadTransferConfigByPanelId(panelId);

    if (!config) {
      return false;
    }

    const load = this.getPcaLoad(config.groupId, config.loadId);

    if (!load) {
      return false;
    }

    load.manualNormalOpen = false;

    const feederSupplyMap = this.getFeederSupplyMap();

    this.updatePcaLoadTransfers(
      feederSupplyMap,
      `${config.groupId}:${config.loadId}`
    );

    this.notifyStateChange('pca-load-normal-restoration', {
      groupId: config.groupId,
      loadId: config.loadId,
    });

    return true;
  },

  showPcaReserveAutomaticMessage(panelId) {
    const config = this.getPcaLoadTransferConfigByPanelId(panelId);

    if (!config) {
      return false;
    }

    const breakerLabel = config.reserve.label ?? 'RESERVA';

    this.showOperationMessage(
      `COMANDO BLOQUEADO\nO DJ ${breakerLabel} e comandado automaticamente apos a perda da fonte normal.`
    );

    EventLog.add(
      `DJ ${breakerLabel}`,
      `COMANDO BLOQUEADO - RESERVA DE ${config.loadId} EM AUTOMATICO`,
      'warning'
    );

    return true;
  },

  hasPcaLoadTransferDevice(groupId, loadId, device) {
    const config = this.getPcaLoadTransferConfig(groupId, loadId);

    return Boolean(
      config &&
        (this.samePcaTransferDevice(config.normal, device) ||
          this.samePcaTransferDevice(config.reserve, device))
    );
  },

  getPcaTransferDevicePhysicalClosed(load, device) {
    if (!load || !device) {
      return false;
    }

    if (device.kind === 'mid') {
      if (typeof load.midBreakerClosed === 'boolean') {
        return load.midBreakerClosed;
      }

      return Breaker.isClosedState(
        load.midBreakerState ?? Breaker.STATES.CLOSED_AUTO
      );
    }

    const collection =
      device.kind === 'lower' ? load.lowerSwitches : load.upperSwitches;

    const switchData = collection?.find(
      (item) => String(item.label) === String(device.label)
    );

    if (!switchData) {
      return false;
    }

    if (typeof switchData.closed === 'boolean') {
      return switchData.closed;
    }

    return Breaker.isClosedState(switchData.state ?? Breaker.STATES.OPEN_AUTO);
  },

  isPcaTransferDeviceClosed(load, device) {
    if (!load || !device) {
      return false;
    }

    /*
     * O estado elétrico/físico do próprio objeto é a fonte da verdade.
     * manualTransferStates fica apenas como espelho/fallback.
     * Isso elimina o travamento em que o desenho mostrava ABERTO,
     * mas o mapa manual ainda dizia FECHADO.
     */
    const physicalClosed = this.getPcaTransferDevicePhysicalClosed(
      load,
      device
    );

    if (device.kind === 'mid') {
      return physicalClosed;
    }

    const collection =
      device.kind === 'lower' ? load.lowerSwitches : load.upperSwitches;

    const switchData = collection?.find(
      (item) => String(item.label) === String(device.label)
    );

    if (switchData && typeof switchData.closed === 'boolean') {
      return physicalClosed;
    }

    const manualKey = this.getPcaTransferDeviceKey(device);

    if (
      String(load.operationMode ?? 'AUTO').toUpperCase() === 'MANUAL' &&
      load.manualTransferStates &&
      typeof load.manualTransferStates[manualKey] === 'boolean'
    ) {
      return load.manualTransferStates[manualKey];
    }

    return physicalClosed;
  },

  togglePcaLoadBreaker(groupId, loadId, device, desiredClosed = null) {
    const config = this.getPcaLoadTransferConfig(groupId, loadId);

    const load = this.getPcaLoad(groupId, loadId);

    const panelGroup =
      Scenario01.pcaPanels?.find(
        (panel) => String(panel.id) === String(groupId)
      ) ?? null;

    if (!config || !load || !panelGroup) {
      return false;
    }

    const isNormalDevice = this.samePcaTransferDevice(config.normal, device);

    /*
     * Os DJs internos dos CMs e CCMs não pertencem ao comando do
     * CF-pCA. O PCA fornece apenas a alimentação elétrica; portanto,
     * o modo AUTO / MANUAL do PCA não pode bloquear uma manobra feita
     * dentro do CM ou CCM.
     */

    const operationMode = String(load.operationMode ?? 'AUTO').toUpperCase();

    const breakerLabel = device.label ?? load.midBreaker ?? 'EQUIPAMENTO';

    if (operationMode !== 'MANUAL') {
      this.showOperationMessage(
        `COMANDO BLOQUEADO\nO DJ ${breakerLabel} está sob controle automático do ${loadId}. Abra o ${loadId} e selecione MANUAL para realizar esta operação.`
      );

      EventLog.add(
        `DJ ${breakerLabel}`,
        `COMANDO BLOQUEADO - ${loadId} EM AUTOMATICO`,
        'warning'
      );

      return false;
    }

    const feederSupplyMap = this.getFeederSupplyMap();

    const reserveSide = config.normalSide === 'top' ? 'bottom' : 'top';

    const deviceSide = isNormalDevice ? config.normalSide : reserveSide;

    const deviceSupply = this.getPcaSideSupply(
      groupId,
      deviceSide,
      feederSupplyMap
    );

    const oppositeDevice = isNormalDevice ? config.reserve : config.normal;

    /*
     * COMANDO MANUAL DETERMINÍSTICO
     *
     * Quando a tela informa desiredClosed=true/false, essa intenção
     * do operador passa a ser soberana. Não usamos mais um estado
     * antigo para transformar o comando em "nenhuma ação".
     *
     * O toggle por estado atual fica somente para chamadas antigas
     * que não informarem desiredClosed.
     */
    const isClosed = this.getPcaTransferDevicePhysicalClosed(load, device);

    const hasExplicitCommand = typeof desiredClosed === 'boolean';

    const closing = hasExplicitCommand ? desiredClosed : !isClosed;

    if (!hasExplicitCommand && closing === isClosed) {
      return true;
    }

    /*
     * Qualquer manobra manual invalida uma transferência automática
     * que pudesse ter sido iniciada antes da seleção de MANUAL.
     */
    this.cancelPcaTransferTimer(`${groupId}:${loadId}`);

    /*
     * O intertravamento consulta somente o estado físico do outro DJ.
     * Assim um espelho/manualTransferStates antigo não bloqueia
     * indevidamente o religamento da entrada principal.
     */
    const oppositeClosed = this.getPcaTransferDevicePhysicalClosed(
      load,
      oppositeDevice
    );

    if (closing && oppositeClosed) {
      this.showOperationMessage(
        `COMANDO BLOQUEADO\nDesligue o outro DJ do ${loadId} antes de ligar o DJ ${breakerLabel}, evitando o paralelismo das fontes.`
      );

      EventLog.add(
        `DJ ${breakerLabel}`,
        `COMANDO BLOQUEADO - OUTRA ENTRADA DO ${loadId} LIGADA`,
        'warning'
      );

      return false;
    }

    this.setPcaTransferDevice(
      load,
      device,
      closing,
      deviceSupply?.energized === true
    );

    /*
     * Regrava explicitamente o espelho manual com o estado que acabou
     * de ser comandado. Isso mantém todas as telas lendo o mesmo valor.
     */
    if (String(load.operationMode ?? 'AUTO').toUpperCase() === 'MANUAL') {
      load.manualTransferStates ??= {};
      load.manualTransferStates[this.getPcaTransferDeviceKey(device)] = closing;
    }

    load.manualNormalOpen = !this.getPcaTransferDevicePhysicalClosed(
      load,
      config.normal
    );

    if (closing && deviceSupply?.energized === true) {
      load.energized = true;
      load.activeSupply = deviceSide;
      load.suppliedBy = deviceSupply.suppliedBy ?? null;
    } else if (!closing && load.activeSupply === deviceSide) {
      load.energized = false;
      load.activeSupply = null;
      load.suppliedBy = null;
    }

    EventLog.add(
      loadId,
      `DJ ${breakerLabel} ${closing ? 'LIGADO' : 'DESLIGADO'} PELO OPERADOR`,
      closing ? 'info' : 'warning'
    );

    this.notifyStateChange('pca-load-breaker-command', {
      groupId,
      loadId,
      device,
      closed: closing,
      normalOpen: load.manualNormalOpen === true,
    });

    return true;
  },

  getDistributionPanel(panelId) {
    return (
      Scenario01.distributionPanels?.find((item) => item.id === panelId) ?? null
    );
  },

  isBreakerClosed(breaker) {
    if (!breaker) {
      return false;
    }

    if (typeof breaker.closed === 'boolean') {
      return breaker.closed;
    }

    return Breaker.isClosedState(
      breaker.breakerState ?? breaker.state ?? Breaker.STATES.CLOSED
    );
  },

  getCurrentColorForOriginalColor(originalColor) {
    const normalUnit = Object.entries(this.unitColors).find(
      ([, color]) => color.toLowerCase() === String(originalColor).toLowerCase()
    )?.[0];

    if (!normalUnit) {
      return originalColor;
    }

    const suppliedSections = [];

    Scenario01.panels?.forEach((panel) => {
      panel.busSections?.forEach((section) => {
        const normalColor = this.normalScenarioState?.panels?.find(
          (item) => item.id === panel.id
        )?.busSections?.[panel.busSections.indexOf(section)]?.color;

        if (
          String(normalColor).toLowerCase() ===
          String(originalColor).toLowerCase()
        ) {
          suppliedSections.push(section);
        }
      });
    });

    if (suppliedSections.length === 0) {
      return this.isUnitRunning(normalUnit)
        ? this.getUnitColor(normalUnit)
        : this.deenergizedColor;
    }

    const energizedSection = suppliedSections.find(
      (section) => section.energized !== false
    );

    return energizedSection?.color ?? this.deenergizedColor;
  },

  propagateAuxPanelColors(feederSupplyMap) {
    Scenario01.auxPanels?.forEach((panel) => {
      const leftSourceNumber = String(panel.leftSource ?? '').trim();

      const rightSourceNumber = String(panel.rightSource ?? '').trim();

      const leftSupply = feederSupplyMap.get(leftSourceNumber);

      const rightSupply = feederSupplyMap.get(rightSourceNumber);

      if (panel.type === 'seIhm') {
        const supply = leftSupply ?? rightSupply;

        if (supply) {
          panel.color = supply.color;
          panel.energized = supply.energized;
          panel.suppliedBy = supply.suppliedBy;
        }

        return;
      }

      if (leftSupply) {
        panel.colorLeft = leftSupply.color;

        panel.leftEnergized = leftSupply.energized;

        panel.leftSuppliedBy = leftSupply.suppliedBy;
      }

      if (rightSupply) {
        panel.colorRight = rightSupply.color;

        panel.rightEnergized = rightSupply.energized;

        panel.rightSuppliedBy = rightSupply.suppliedBy;
      }

      panel.energized = Boolean(
        leftSupply?.energized || rightSupply?.energized
      );
    });
  },

  //==================================================
  // TRANSFERÊNCIA DOS QUADROS AUXILIARES INFERIORES
  //==================================================

  getAuxPanel(panelId) {
    return (
      Scenario01.auxPanels?.find(
        (panel) => String(panel.id) === String(panelId)
      ) ?? null
    );
  },

  getAuxPanelTransferConfig(panelId) {
    return this.auxPanelTransferConfigs[String(panelId)] ?? null;
  },

  hasAuxPanelTransfer(panelId) {
    return Boolean(
      this.getAuxPanel(panelId) && this.getAuxPanelTransferConfig(panelId)
    );
  },

  isAuxPanelBreakerClosed(state) {
    const normalized = String(state ?? '')
      .trim()
      .toLowerCase()
      .replaceAll('-', '');

    return ['closed', 'closedauto', 'true'].includes(normalized);
  },

  setAuxPanelBreakerState(panel, role, closed) {
    if (!panel) {
      return false;
    }

    const propertyByRole = {
      left: 'leftBreakerState',
      right: 'rightBreakerState',
      tie: 'mainBreakerState',
    };

    const property = propertyByRole[String(role)];

    if (!property) {
      return false;
    }

    panel[property] = closed ? 'closed' : 'openAuto';

    return true;
  },

  isAuxPanelBreakerRoleClosed(panel, role) {
    if (!panel) {
      return false;
    }

    const propertyByRole = {
      left: 'leftBreakerState',
      right: 'rightBreakerState',
      tie: 'mainBreakerState',
    };

    return this.isAuxPanelBreakerClosed(panel[propertyByRole[String(role)]]);
  },

  getAuxPanelElectricalState(panelId) {
    const panel = this.getAuxPanel(panelId);

    const config = this.getAuxPanelTransferConfig(panelId);

    if (!panel || !config) {
      return null;
    }

    const leftAvailable = panel.leftEnergized === true;

    const rightAvailable = panel.rightEnergized === true;

    const leftClosed = this.isAuxPanelBreakerRoleClosed(panel, 'left');

    const rightClosed = this.isAuxPanelBreakerRoleClosed(panel, 'right');

    const tieClosed =
      config.type === 'bus-tie' &&
      this.isAuxPanelBreakerRoleClosed(panel, 'tie');

    const directLeft = leftAvailable && leftClosed;

    const directRight = rightAvailable && rightClosed;

    const singleBus = config.type === 'source-transfer';

    const leftBusEnergized = singleBus
      ? directLeft || directRight
      : directLeft || (tieClosed && directRight);

    const rightBusEnergized = singleBus
      ? leftBusEnergized
      : directRight || (tieClosed && directLeft);

    const leftBusColor = directLeft
      ? panel.colorLeft
      : (singleBus || tieClosed) && directRight
      ? panel.colorRight
      : this.deenergizedColor;

    const rightBusColor = directRight
      ? panel.colorRight
      : (singleBus || tieClosed) && directLeft
      ? panel.colorLeft
      : this.deenergizedColor;

    return {
      panelId: panel.id,
      type: config.type,
      leftAvailable,
      rightAvailable,
      leftClosed,
      rightClosed,
      tieClosed,
      directLeft,
      directRight,
      leftBusEnergized,
      rightBusEnergized,
      leftBusColor,
      rightBusColor,
      transferring: panel.transferring === true,
      transferText: panel.transferText ?? '',
      operationMode: String(panel.operationMode ?? 'AUTO').toUpperCase(),
    };
  },

  refreshAuxPanelElectricalState(panel) {
    const state = this.getAuxPanelElectricalState(panel?.id);

    if (!panel || !state) {
      return null;
    }

    panel.leftBusEnergized = state.leftBusEnergized;

    panel.rightBusEnergized = state.rightBusEnergized;

    panel.leftBusColor = state.leftBusColor;

    panel.rightBusColor = state.rightBusColor;

    panel.energized = state.leftBusEnergized || state.rightBusEnergized;

    if (state.type === 'source-transfer') {
      panel.activeSupply = state.directLeft
        ? 'left'
        : state.directRight
        ? 'right'
        : null;
    } else if (
      state.leftBusEnergized &&
      state.rightBusEnergized &&
      state.tieClosed
    ) {
      panel.activeSupply = state.directLeft ? 'left' : 'right';
    } else {
      panel.activeSupply = null;
    }

    return state;
  },

  setAuxPanelTransferStatus(panel, transferring, text = '') {
    if (!panel) {
      return;
    }

    panel.transferring = transferring === true;

    panel.transferText = transferring ? String(text) : '';
  },

  cancelAuxPanelTransfer(panelId, clearStatus = true) {
    const key = String(panelId);

    const timer = this.auxPanelTransferTimers.get(key);

    if (timer) {
      window.clearTimeout(timer);
    }

    this.auxPanelTransferTimers.delete(key);

    this.auxPanelTransferDeadlines.delete(key);

    if (clearStatus) {
      this.setAuxPanelTransferStatus(this.getAuxPanel(panelId), false);
    }
  },

  cancelAllAuxPanelTransfers() {
    [...this.auxPanelTransferTimers.keys()].forEach((panelId) => {
      this.cancelAuxPanelTransfer(panelId);
    });
  },

  scheduleAuxPanelTransfer(panel, config, target) {
    if (!panel || !config) {
      return false;
    }

    const key = String(panel.id);

    if (this.auxPanelTransferTimers.has(key)) {
      return false;
    }

    const delay = Number.isFinite(config.delay) ? config.delay : 2500;

    const targetLabel =
      target === 'tie'
        ? `DJ ${panel.mainBreaker}`
        : target === 'right'
        ? `DJ ${panel.rightBreaker}`
        : `DJ ${panel.leftBreaker}`;

    this.setAuxPanelTransferStatus(
      panel,
      true,
      `TRANSFERÊNCIA AUTOMÁTICA PARA ${targetLabel} • ${this.formatMilliseconds(
        delay
      )}`
    );

    EventLog.add(
      panel.label ?? panel.id,
      `FALTA DE TENSÃO - TEMPORIZAÇÃO DE ${this.formatMilliseconds(
        delay
      )} PARA ${targetLabel}`,
      'warning'
    );

    const timer = window.setTimeout(() => {
      this.auxPanelTransferTimers.delete(key);

      this.auxPanelTransferDeadlines.delete(key);

      const currentPanel = this.getAuxPanel(panel.id);

      const currentConfig = this.getAuxPanelTransferConfig(panel.id);

      if (
        !currentPanel ||
        !currentConfig ||
        String(currentPanel.operationMode ?? 'AUTO').toUpperCase() !== 'AUTO'
      ) {
        return;
      }

      const feederSupplyMap = this.getFeederSupplyMap();

      this.propagateAuxPanelColors(feederSupplyMap);

      const currentState = this.getAuxPanelElectricalState(currentPanel.id);

      let operated = false;

      if (
        target === 'tie' &&
        currentConfig.type === 'bus-tie' &&
        currentState &&
        currentState.directLeft !== currentState.directRight
      ) {
        this.setAuxPanelBreakerState(currentPanel, 'tie', true);
        operated = true;
      }

      if (
        target === 'right' &&
        currentConfig.type === 'source-transfer' &&
        currentState?.rightAvailable &&
        !currentState.leftAvailable
      ) {
        this.setAuxPanelBreakerState(currentPanel, 'right', true);
        operated = true;
      }

      if (
        target === 'left' &&
        currentConfig.type === 'source-transfer' &&
        currentState?.leftAvailable &&
        !currentState.rightAvailable
      ) {
        this.setAuxPanelBreakerState(currentPanel, 'left', true);
        operated = true;
      }

      this.setAuxPanelTransferStatus(currentPanel, false);

      this.refreshAuxPanelElectricalState(currentPanel);

      if (operated) {
        EventLog.add(
          currentPanel.label ?? currentPanel.id,
          `${targetLabel} FECHADO AUTOMATICAMENTE`,
          'success'
        );

        this.notifyStateChange('aux-panel-transfer-completed', {
          panelId: currentPanel.id,
          target,
        });
      }
    }, delay);

    this.auxPanelTransferTimers.set(key, timer);

    this.auxPanelTransferDeadlines.set(key, Date.now() + delay);

    return true;
  },

  updateAuxPanelTransfers(feederSupplyMap, onlyPanelId = null) {
    Object.entries(this.auxPanelTransferConfigs).forEach(
      ([panelId, config]) => {
        if (onlyPanelId && String(panelId) !== String(onlyPanelId)) {
          return;
        }

        const panel = this.getAuxPanel(panelId);

        if (!panel) {
          return;
        }

        const leftSupply = feederSupplyMap.get(
          String(panel.leftSource ?? '').trim()
        );

        const rightSupply = feederSupplyMap.get(
          String(panel.rightSource ?? '').trim()
        );

        panel.leftEnergized = leftSupply?.energized === true;

        panel.rightEnergized = rightSupply?.energized === true;

        const automatic =
          String(panel.operationMode ?? 'AUTO').toUpperCase() === 'AUTO';

        if (!automatic) {
          this.cancelAuxPanelTransfer(panelId);
          this.refreshAuxPanelElectricalState(panel);
          return;
        }

        const leftAvailable = panel.leftEnergized === true;

        const rightAvailable = panel.rightEnergized === true;

        if (config.type === 'source-transfer') {
          if (leftAvailable && rightAvailable) {
            this.cancelAuxPanelTransfer(panelId);
            this.setAuxPanelBreakerState(panel, 'right', false);
            this.setAuxPanelBreakerState(panel, 'left', true);
          } else if (leftAvailable && !rightAvailable) {
            this.setAuxPanelBreakerState(panel, 'right', false);

            if (!this.isAuxPanelBreakerRoleClosed(panel, 'left')) {
              this.scheduleAuxPanelTransfer(panel, config, 'left');
            }
          } else if (!leftAvailable && rightAvailable) {
            this.setAuxPanelBreakerState(panel, 'left', false);

            if (!this.isAuxPanelBreakerRoleClosed(panel, 'right')) {
              this.scheduleAuxPanelTransfer(panel, config, 'right');
            }
          } else {
            this.cancelAuxPanelTransfer(panelId);
            this.setAuxPanelBreakerState(panel, 'left', false);
            this.setAuxPanelBreakerState(panel, 'right', false);
          }

          this.refreshAuxPanelElectricalState(panel);
          return;
        }

        if (leftAvailable && rightAvailable) {
          this.cancelAuxPanelTransfer(panelId);

          // Retorno seguro: abre a interligação antes
          // de restabelecer as duas entradas.
          this.setAuxPanelBreakerState(panel, 'tie', false);
          this.setAuxPanelBreakerState(panel, 'left', true);
          this.setAuxPanelBreakerState(panel, 'right', true);
        } else if (leftAvailable && !rightAvailable) {
          this.setAuxPanelBreakerState(panel, 'right', false);
          this.setAuxPanelBreakerState(panel, 'left', true);

          if (!this.isAuxPanelBreakerRoleClosed(panel, 'tie')) {
            this.scheduleAuxPanelTransfer(panel, config, 'tie');
          }
        } else if (!leftAvailable && rightAvailable) {
          this.setAuxPanelBreakerState(panel, 'left', false);
          this.setAuxPanelBreakerState(panel, 'right', true);

          if (!this.isAuxPanelBreakerRoleClosed(panel, 'tie')) {
            this.scheduleAuxPanelTransfer(panel, config, 'tie');
          }
        } else {
          this.cancelAuxPanelTransfer(panelId);
          this.setAuxPanelBreakerState(panel, 'left', false);
          this.setAuxPanelBreakerState(panel, 'right', false);
          this.setAuxPanelBreakerState(panel, 'tie', false);
        }

        this.refreshAuxPanelElectricalState(panel);
      }
    );
  },

  setAuxPanelOperationMode(panelId, mode) {
    const panel = this.getAuxPanel(panelId);

    if (!panel) {
      return this.setPcaLoadOperationMode(panelId, mode);
    }

    panel.operationMode =
      String(mode).toUpperCase() === 'MANUAL' ? 'MANUAL' : 'AUTO';

    /*
     * Alguns CMs / CCMs também possuem representação como carga dos
     * grupos PCA. Mantém o modo local sincronizado nas duas visões.
     */
    const pcaConfig = this.getPcaLoadTransferConfigByPanelId(panelId);

    const pcaLoad = pcaConfig
      ? this.getPcaLoad(pcaConfig.groupId, pcaConfig.loadId)
      : null;

    if (pcaLoad) {
      pcaLoad.operationMode = panel.operationMode;
    }

    if (panel.operationMode === 'MANUAL') {
      this.cancelAuxPanelTransfer(panelId);

      if (pcaConfig) {
        this.cancelPcaTransferTimer(`${pcaConfig.groupId}:${pcaConfig.loadId}`);
      }
    } else {
      const feederSupplyMap = this.getFeederSupplyMap();

      this.propagateAuxPanelColors(feederSupplyMap);

      this.updateAuxPanelTransfers(feederSupplyMap, panelId);

      if (pcaConfig) {
        pcaLoad.manualNormalOpen = false;

        this.updatePcaLoadTransfers(
          feederSupplyMap,
          `${pcaConfig.groupId}:${pcaConfig.loadId}`
        );
      }
    }

    this.notifyStateChange('aux-panel-mode-changed', {
      panelId,
      mode: panel.operationMode,
    });

    return true;
  },

  toggleAuxPanelBreaker(panelId, role) {
    const panel = this.getAuxPanel(panelId);

    const config = this.getAuxPanelTransferConfig(panelId);

    if (!panel || !config) {
      return false;
    }

    const operationMode = String(panel.operationMode ?? 'AUTO').toUpperCase();

    const breakerLabel =
      role === 'left'
        ? panel.leftBreaker
        : role === 'right'
        ? panel.rightBreaker
        : panel.mainBreaker;

    if (operationMode !== 'MANUAL') {
      this.showOperationMessage(
        `COMANDO BLOQUEADO\nO DJ ${breakerLabel} está sob controle automático do ${panel.label}. Selecione o painel em MANUAL para realizar esta operação.`
      );

      EventLog.add(
        `DJ ${breakerLabel}`,
        `COMANDO BLOQUEADO - ${panel.label} EM AUTOMÁTICO`,
        'warning'
      );

      return false;
    }

    if (role === 'tie' && config.type !== 'bus-tie') {
      return false;
    }

    const state = this.getAuxPanelElectricalState(panelId);

    const currentlyClosed = this.isAuxPanelBreakerRoleClosed(panel, role);

    if (!currentlyClosed) {
      if (
        config.type === 'source-transfer' &&
        ((role === 'left' && state.rightClosed) ||
          (role === 'right' && state.leftClosed))
      ) {
        this.showOperationMessage(
          'COMANDO BLOQUEADO\nAbra a outra entrada antes de fechar este DJ. O comando foi bloqueado para evitar paralelismo das fontes.'
        );
        return false;
      }

      if (role === 'tie' && state.directLeft && state.directRight) {
        this.showOperationMessage(
          'COMANDO BLOQUEADO\nAs duas barras estão energizadas por fontes diferentes. O fechamento da interligação causaria paralelismo das fontes.'
        );
        return false;
      }

      if (
        role === 'tie' &&
        ((state.directLeft && state.rightClosed) ||
          (state.directRight && state.leftClosed))
      ) {
        this.showOperationMessage(
          'COMANDO BLOQUEADO\nAbra primeiro o DJ da entrada sem tensão. O fechamento da interligação com essa entrada fechada poderia realimentar a fonte indisponível.'
        );
        return false;
      }

      if (role === 'left' && state.tieClosed && state.directRight) {
        this.showOperationMessage(
          'COMANDO BLOQUEADO\nAbra o DJ de interligação antes de fechar a entrada esquerda.'
        );
        return false;
      }

      if (role === 'right' && state.tieClosed && state.directLeft) {
        this.showOperationMessage(
          'COMANDO BLOQUEADO\nAbra o DJ de interligação antes de fechar a entrada direita.'
        );
        return false;
      }
    }

    this.cancelAuxPanelTransfer(panelId);

    this.setAuxPanelBreakerState(panel, role, !currentlyClosed);

    this.refreshAuxPanelElectricalState(panel);

    EventLog.add(
      `DJ ${breakerLabel}`,
      `${!currentlyClosed ? 'FECHADO' : 'ABERTO'} PELO OPERADOR - ${
        panel.label
      }`,
      !currentlyClosed ? 'success' : 'warning'
    );

    this.notifyStateChange('aux-panel-breaker-command', {
      panelId,
      role,
      breakerId: breakerLabel,
      closed: !currentlyClosed,
    });

    return true;
  },

  restoreAuxPanelNormalState(panelId) {
    const panel = this.getAuxPanel(panelId);

    const normalPanel = this.normalScenarioState?.auxPanels?.find(
      (item) => String(item.id) === String(panelId)
    );

    if (!panel || !normalPanel) {
      return false;
    }

    this.cancelAuxPanelTransfer(panelId);

    panel.leftBreakerState = normalPanel.leftBreakerState ?? 'closed';

    panel.rightBreakerState = normalPanel.rightBreakerState ?? 'closed';

    panel.mainBreakerState = normalPanel.mainBreakerState ?? 'openAuto';

    panel.operationMode = 'AUTO';

    const feederSupplyMap = this.getFeederSupplyMap();

    this.propagateAuxPanelColors(feederSupplyMap);

    this.updateAuxPanelTransfers(feederSupplyMap, panelId);

    this.notifyStateChange('aux-panel-normal-restored', {
      panelId,
    });

    return true;
  },

  formatMilliseconds(milliseconds = 0) {
    const seconds = milliseconds / 1000;

    return `${
      Number.isInteger(seconds) ? seconds : seconds.toFixed(1).replace('.', ',')
    } s`;
  },

  getPcaLoad(groupId, loadId) {
    const group = Scenario01.pcaPanels?.find(
      (panel) => String(panel.id) === String(groupId)
    );

    return (
      group?.loads?.find((load) => String(load.id) === String(loadId)) ?? null
    );
  },

  normalizePcaMainBreakerSide(side) {
    return String(side).toLowerCase() === 'bottom' ? 'bottom' : 'top';
  },

  getPcaMainBreakerId(groupId, loadId, side) {
    const normalizedSide = this.normalizePcaMainBreakerSide(side);

    return `pca-main:${groupId}:${loadId}:${normalizedSide}`;
  },

  parsePcaMainBreakerId(value) {
    const raw = String(value ?? '').trim();

    if (!raw.startsWith('pca-main:')) {
      return null;
    }

    const [, groupId = '', loadId = '', side = 'top'] = raw.split(':');

    if (!groupId || !loadId) {
      return null;
    }

    return {
      groupId,
      loadId,
      side: this.normalizePcaMainBreakerSide(side),
    };
  },

  getPcaMainBreakerRuntimeState(parsed) {
    if (!parsed) {
      return null;
    }

    const load = this.getPcaLoad(parsed.groupId, parsed.loadId);

    if (!load) {
      return null;
    }

    const side = this.normalizePcaMainBreakerSide(parsed.side);
    const stateKey = `${side}BreakerState`;
    const closedKey = `${side}BreakerClosed`;

    return {
      state: load[stateKey],
      closed: typeof load[closedKey] === 'boolean' ? load[closedKey] : null,
    };
  },

  isPcaMainBreakerClosed(groupId, loadId, side) {
    const load = this.getPcaLoad(groupId, loadId);

    if (!load) {
      return false;
    }

    const normalizedSide = this.normalizePcaMainBreakerSide(side);
    const closedKey = `${normalizedSide}BreakerClosed`;
    const stateKey = `${normalizedSide}BreakerState`;

    if (typeof load[closedKey] === 'boolean') {
      return load[closedKey];
    }

    if (load[stateKey]) {
      return Breaker.isClosedState(load[stateKey]);
    }

    return load.available !== false;
  },

  setPcaMainBreakerClosed(groupId, loadId, side, closed) {
    const load = this.getPcaLoad(groupId, loadId);

    if (!load) {
      return false;
    }

    const normalizedSide = this.normalizePcaMainBreakerSide(side);
    const closedKey = `${normalizedSide}BreakerClosed`;
    const stateKey = `${normalizedSide}BreakerState`;

    load[closedKey] = closed === true;
    load[stateKey] =
      closed === true ? Breaker.STATES.CLOSED : Breaker.STATES.OPEN;

    return true;
  },

  togglePcaMainBreaker(groupId, loadId, side, desiredClosed = null) {
    const load = this.getPcaLoad(groupId, loadId);

    if (!load) {
      return false;
    }

    const normalizedSide = this.normalizePcaMainBreakerSide(side);
    const breakerLabel =
      load[`${normalizedSide}Breaker`] ??
      load[`${normalizedSide}Feeder`] ??
      'DJ';

    if (!breakerLabel) {
      return false;
    }

    const breakerId = this.getPcaMainBreakerId(groupId, loadId, normalizedSide);

    const currentClosed = this.isPcaMainBreakerClosed(
      groupId,
      loadId,
      normalizedSide
    );

    const hasExplicitCommand = typeof desiredClosed === 'boolean';
    const closing = hasExplicitCommand ? desiredClosed : !currentClosed;

    if (!hasExplicitCommand && closing === currentClosed) {
      return true;
    }

    if (closing && !this.ensureBreakerInserted(breakerId, breakerLabel)) {
      return false;
    }

    this.setPcaMainBreakerClosed(groupId, loadId, normalizedSide, closing);

    EventLog.add(
      `${loadId}`,
      `DJ ${breakerLabel} ${closing ? 'LIGADO' : 'DESLIGADO'} PELO OPERADOR`,
      closing ? 'info' : 'warning'
    );

    this.notifyStateChange('pca-main-breaker-command', {
      groupId,
      loadId,
      side: normalizedSide,
      breaker: breakerLabel,
      closed: closing,
    });

    const feederSupplyMap = this.getFeederSupplyMap();

    /*
     * Atualiza imediatamente o CM/CCM alimentado por este DJ do PCA.
     * AUTO   -> abre por falta de tensão e arma a transferência temporizada.
     * MANUAL -> abre por falta de tensão, mas não fecha a reserva sozinho.
     */
    this.updatePcaLoadTransfers(feederSupplyMap, `${groupId}:${loadId}`);

    this.propagateColors();

    return true;
  },

  getPcaSideSupply(groupId, side, feederSupplyMap) {
    const group = Scenario01.pcaPanels?.find(
      (panel) => String(panel.id) === String(groupId)
    );

    if (!group) {
      return null;
    }

    const normalizedSide =
      String(side).toLowerCase() === 'bottom' ? 'bottom' : 'top';

    const incoming =
      normalizedSide === 'bottom' ? group.bottomIncoming : group.topIncoming;

    const sourceNumber = String(incoming?.sourceNumber ?? '').trim();

    const sourceSupply = feederSupplyMap.get(sourceNumber) ?? null;

    if (!sourceSupply) {
      return null;
    }

    const breakerClosed = this.isPcaIncomingClosed(incoming);

    const sourceEnergized = sourceSupply.energized === true;

    const energized = breakerClosed && sourceEnergized;

    return {
      ...sourceSupply,
      energized,
      sourceEnergized,
      breakerClosed,
      color: energized ? sourceSupply.color : this.deenergizedColor,
      sourceColor: sourceSupply.color,
      suppliedBy: energized ? sourceSupply.suppliedBy : null,
    };
  },

  getPcaLoadSideSupply(groupId, loadId, side, feederSupplyMap) {
    const normalizedSide = this.normalizePcaMainBreakerSide(side);

    const sideSupply = this.getPcaSideSupply(
      groupId,
      normalizedSide,
      feederSupplyMap
    );

    if (!sideSupply) {
      return null;
    }

    const load = this.getPcaLoad(groupId, loadId);

    if (!load) {
      return {
        ...sideSupply,
        energized: false,
        mainBreakerClosed: false,
      };
    }

    const breakerLabel =
      load[`${normalizedSide}Breaker`] ??
      load[`${normalizedSide}Feeder`] ??
      null;

    /*
     * Nos PCAs 0912 / 1316 / 1720 os DJs de saída são identificados
     * por topFeeder / bottomFeeder (20511, 20711, 20911 etc.).
     * Eles também precisam participar da lógica de falta de tensão.
     */
    const mainBreakerClosed = breakerLabel
      ? this.isPcaMainBreakerClosed(groupId, loadId, normalizedSide)
      : true;

    const energized = sideSupply.energized === true && mainBreakerClosed;

    return {
      ...sideSupply,
      energized,
      mainBreakerClosed,
      color: energized ? sideSupply.color : this.deenergizedColor,
      suppliedBy: energized ? sideSupply.suppliedBy : null,
    };
  },

  isPcaIncomingClosed(incoming) {
    if (!incoming) {
      return false;
    }

    if (typeof incoming.closed === 'boolean') {
      return incoming.closed;
    }

    if (incoming.breakerState) {
      return Breaker.isClosedState(incoming.breakerState);
    }

    /*
     * Compatibilidade com os cenários existentes:
     * quando o estado ainda não estiver gravado,
     * a entrada inicia fechada.
     */
    return true;
  },

  togglePcaIncomingBreaker(groupId, side) {
    const group =
      Scenario01.pcaPanels?.find(
        (panel) => String(panel.id) === String(groupId)
      ) ?? null;

    if (!group) {
      return false;
    }

    const normalizedSide =
      String(side).toLowerCase() === 'bottom' ? 'bottom' : 'top';

    const incoming =
      normalizedSide === 'bottom' ? group.bottomIncoming : group.topIncoming;

    if (!incoming) {
      return false;
    }

    const panelLabel =
      normalizedSide === 'bottom'
        ? group.bottomPanel?.label ?? group.id
        : group.topPanel?.label ?? group.id;

    const breakerLabel = incoming.breaker ?? 'ENTRADA';

    /*
     * Os DJs de entrada dos PCAs podem ser comandados diretamente
     * pelo operador sem necessidade de selecionar MANUAL no painel.
     *
     * Mantém-se apenas os intertravamentos elétricos e mecânicos
     * (por exemplo: DJ extraído não pode ser ligado).
     */
    const closing = !this.isPcaIncomingClosed(incoming);

    if (closing && !this.ensureBreakerInserted(breakerLabel, breakerLabel)) {
      return false;
    }

    incoming.closed = closing;

    incoming.breakerState = closing
      ? Breaker.STATES.CLOSED_AUTO
      : Breaker.STATES.OPEN_AUTO;

    const feederSupplyMap = this.getFeederSupplyMap();

    const sourceNumber = String(incoming.sourceNumber ?? '').trim();

    const sourceSupply = feederSupplyMap.get(sourceNumber);

    incoming.sourceEnergized = sourceSupply?.energized === true;

    incoming.energized = closing && incoming.sourceEnergized;

    incoming.suppliedBy = incoming.energized
      ? sourceSupply?.suppliedBy ?? null
      : null;

    EventLog.add(
      `DJ ${breakerLabel}`,
      closing
        ? `FECHADO PELO OPERADOR - ${panelLabel}`
        : `ABERTO PELO OPERADOR - ${panelLabel} DESENERGIZADO`,
      closing ? 'info' : 'warning'
    );

    this.propagateColors();

    this.notifyStateChange('pca-incoming-breaker-command', {
      groupId: group.id,
      side: normalizedSide,
      breaker: breakerLabel,
      closed: closing,
      energized: incoming.energized === true,
    });

    return true;
  },

  setPcaTransferDevice(
    load,
    device,
    closed,
    energized,
    openSymbolType = 'closedAutoQuadrant'
  ) {
    if (!load || !device) {
      return;
    }

    if (String(load.operationMode ?? 'AUTO').toUpperCase() === 'MANUAL') {
      load.manualTransferStates ??= {};
      load.manualTransferStates[this.getPcaTransferDeviceKey(device)] = closed;
    }

    const state = closed
      ? Breaker.STATES.CLOSED_AUTO
      : Breaker.STATES.OPEN_AUTO;

    if (device.kind === 'mid') {
      load.midBreakerState = state;
      load.midBreakerClosed = closed;
      load.midBreakerEnergized = closed && energized;
      load.midBreakerSymbolType = closed ? '' : openSymbolType;
      return;
    }

    const collection =
      device.kind === 'lower' ? load.lowerSwitches : load.upperSwitches;

    const switchData = collection?.find(
      (item) => String(item.label) === String(device.label)
    );

    if (!switchData) {
      return;
    }

    switchData.state = state;
    switchData.closed = closed;
    switchData.energized = closed && energized;
    switchData.symbolType = closed ? '' : openSymbolType;
  },

  cancelPcaTransferTimer(key) {
    const timer = this.pcaTransferTimers.get(key);

    if (timer !== undefined) {
      window.clearTimeout(timer);
      this.pcaTransferTimers.delete(key);
    }

    this.pcaTransferDeadlines.delete(key);
  },

  updatePcaLoadTransfers(feederSupplyMap, targetKey = null) {
    this.pcaLoadTransfers.forEach((config) => {
      const key = `${config.groupId}:${config.loadId}`;

      if (targetKey !== null && key !== targetKey) {
        return;
      }

      const load = this.getPcaLoad(config.groupId, config.loadId);

      if (!load) {
        return;
      }

      const reserveSide = config.normalSide === 'top' ? 'bottom' : 'top';

      const normalSupply = this.getPcaLoadSideSupply(
        config.groupId,
        config.loadId,
        config.normalSide,
        feederSupplyMap
      );

      const reserveSupply = this.getPcaLoadSideSupply(
        config.groupId,
        config.loadId,
        reserveSide,
        feederSupplyMap
      );

      const normalEnergized = normalSupply?.energized === true;

      const reserveEnergized = reserveSupply?.energized === true;

      /*
       * Em MANUAL não existe fechamento automático da reserva.
       * Porém, se a alimentação do DJ que estava fechado desaparecer,
       * esse DJ deve abrir imediatamente por falta de tensão.
       * Depois disso, a recomposição só ocorre por clique do operador.
       */
      if (String(load.operationMode ?? 'AUTO').toUpperCase() === 'MANUAL') {
        this.cancelPcaTransferTimer(key);

        const normalClosed = this.getPcaTransferDevicePhysicalClosed(
          load,
          config.normal
        );

        const reserveClosed = this.getPcaTransferDevicePhysicalClosed(
          load,
          config.reserve
        );

        if (normalClosed && !normalEnergized) {
          this.setPcaTransferDevice(load, config.normal, false, false);
        }

        if (reserveClosed && !reserveEnergized) {
          this.setPcaTransferDevice(load, config.reserve, false, false, '');
        }

        const normalStillClosed = this.getPcaTransferDevicePhysicalClosed(
          load,
          config.normal
        );

        const reserveStillClosed = this.getPcaTransferDevicePhysicalClosed(
          load,
          config.reserve
        );

        if (normalStillClosed && normalEnergized) {
          load.energized = true;
          load.activeSupply = config.normalSide;
          load.suppliedBy = normalSupply?.suppliedBy ?? null;
        } else if (reserveStillClosed && reserveEnergized) {
          load.energized = true;
          load.activeSupply = reserveSide;
          load.suppliedBy = reserveSupply?.suppliedBy ?? null;
        } else {
          load.energized = false;
          load.activeSupply = null;
          load.suppliedBy = null;
        }

        return;
      }

      if (normalEnergized && load.manualNormalOpen !== true) {
        this.cancelPcaTransferTimer(key);

        this.setPcaTransferDevice(load, config.normal, true, true);

        this.setPcaTransferDevice(
          load,
          config.reserve,
          false,
          reserveEnergized,
          ''
        );

        load.suppliedBy = normalSupply?.suppliedBy ?? null;
        load.energized = true;
        load.activeSupply = config.normalSide;
        return;
      }

      this.setPcaTransferDevice(load, config.normal, false, false);

      if (!reserveEnergized) {
        this.cancelPcaTransferTimer(key);

        this.setPcaTransferDevice(load, config.reserve, false, false, '');

        load.suppliedBy = null;
        load.energized = false;
        load.activeSupply = null;
        return;
      }

      if (load.activeSupply === reserveSide) {
        return;
      }

      this.setPcaTransferDevice(load, config.reserve, false, true, '');

      load.energized = false;
      load.activeSupply = null;

      if (this.pcaTransferTimers.has(key)) {
        return;
      }

      EventLog.add(
        config.loadId,
        `FONTE NORMAL SEM TENSAO - TRANSFERENCIA EM ${
          (config.delay ?? 3000) / 1000
        } s`,
        'warning'
      );

      const timer = window.setTimeout(() => {
        this.pcaTransferTimers.delete(key);
        this.pcaTransferDeadlines.delete(key);

        const currentMap = this.getFeederSupplyMap();

        const currentNormal = this.getPcaLoadSideSupply(
          config.groupId,
          config.loadId,
          config.normalSide,
          currentMap
        );

        const currentReserve = this.getPcaLoadSideSupply(
          config.groupId,
          config.loadId,
          reserveSide,
          currentMap
        );

        if (
          (currentNormal?.energized === true &&
            load.manualNormalOpen !== true) ||
          currentReserve?.energized !== true
        ) {
          this.updatePcaLoadTransfers(currentMap, key);
          this.notifyStateChange('pca-load-transfer-cancelled', {
            loadId: config.loadId,
          });
          return;
        }

        this.setPcaTransferDevice(load, config.reserve, true, true);

        load.suppliedBy = currentReserve?.suppliedBy ?? null;
        load.energized = true;
        load.activeSupply = reserveSide;

        EventLog.add(
          config.loadId,
          'FONTE RESERVA LIGADA AUTOMATICAMENTE',
          'info'
        );

        this.notifyStateChange('pca-load-transfer-completed', {
          groupId: config.groupId,
          loadId: config.loadId,
          activeSupply: reserveSide,
        });
      }, config.delay ?? 3000);

      this.pcaTransferTimers.set(key, timer);
      this.pcaTransferDeadlines.set(key, Date.now() + (config.delay ?? 3000));
    });
  },

  propagateColors() {
    const feederSupplyMap = this.getFeederSupplyMap();

    this.propagatePcaPanelColors(feederSupplyMap);

    this.propagateAuxPanelColors(feederSupplyMap);

    this.updateAuxPanelTransfers(feederSupplyMap);

    this.updatePcaLoadTransfers(feederSupplyMap);

    /*
     * A lógica dos GAEs é aplicada por último.
     * Assim a alimentação de emergência prevalece visual e eletricamente
     * sobre os estados sem tensão calculados a partir das fontes normais.
     */
    this.updateGaeAutomaticBlackout();

    this.applyGaeEmergencySupplyOverrides();
  },

  notifyStateChange(reason, detail = {}) {
    this.onStateChange?.({
      reason,
      detail,
      scenario: Scenario01,
    });

    window.dispatchEvent(
      new CustomEvent('scada:state-changed', {
        detail: {
          reason,
          ...detail,
        },
      })
    );
  },

  showOperationMessage(message) {
    window.setTimeout(() => {
      window.alert(message);
    }, 0);
  },

  toggleBusCoupler(breakerId) {
    const breaker = this.getBusBreaker(breakerId);

    if (!breaker) {
      return false;
    }

    const panelId = this.getCouplerPanelId(breakerId);

    const panel = this.getPanel(panelId);

    const panelMode = String(panel?.operationMode ?? 'AUTO').toUpperCase();

    if (panelMode !== 'MANUAL') {
      this.showOperationMessage(
        `COMANDO BLOQUEADO\nO DJ ${breakerId} está sob controle automático do ${panelId}. Selecione o painel em MANUAL para realizar esta operação.`
      );

      EventLog.add(
        `DJ ${breakerId}`,
        `COMANDO MANUAL BLOQUEADO - ${panelId} EM AUTOMATICO`,
        'warning'
      );

      return false;
    }

    const currentlyClosed = this.isBreakerClosed(breaker);

    if (!currentlyClosed && !this.ensureBreakerInserted(breakerId, breakerId)) {
      return false;
    }

    if (!currentlyClosed) {
      const couplerIndex = this.couplersByPanel?.[panelId]?.findIndex(
        (id) => String(id) === String(breakerId)
      );

      const leftSection = panel?.busSections?.[couplerIndex];
      const rightSection = panel?.busSections?.[couplerIndex + 1];

      const differentEnergizedSources =
        leftSection?.energized === true &&
        rightSection?.energized === true &&
        leftSection?.suppliedBy &&
        rightSection?.suppliedBy &&
        leftSection.suppliedBy !== rightSection.suppliedBy;

      if (differentEnergizedSources) {
        this.showOperationMessage(
          `COMANDO BLOQUEADO\nO fechamento do DJ ${breakerId} causaria paralelismo entre ${leftSection.suppliedBy} e ${rightSection.suppliedBy}.`
        );

        EventLog.add(
          `DJ ${breakerId}`,
          'COMANDO BLOQUEADO - RISCO DE PARALELISMO DE FONTES',
          'warning'
        );

        return false;
      }

      const suppliedBy =
        leftSection?.energized === true
          ? leftSection.suppliedBy
          : rightSection?.energized === true
          ? rightSection.suppliedBy
          : null;

      breaker.state = Breaker.STATES.CLOSED_AUTO;
      breaker.breakerState = Breaker.STATES.CLOSED_AUTO;
      breaker.closed = true;
      breaker.energized = Boolean(suppliedBy);
      breaker.suppliedBy = suppliedBy;
      breaker.color = suppliedBy
        ? this.getUnitColor(suppliedBy)
        : this.deenergizedColor;

      if (suppliedBy) {
        this.setBusSectionState(panelId, couplerIndex, suppliedBy);
        this.setBusSectionState(panelId, couplerIndex + 1, suppliedBy);
      }

      EventLog.add(`DJ ${breakerId}`, 'FECHADO PELO OPERADOR', 'info');

      this.propagateColors();
      this.notifyStateChange('bus-coupler-closed', { breakerId, panelId });

      return true;
    }

    breaker.state = Breaker.STATES.OPEN_AUTO;
    breaker.breakerState = Breaker.STATES.OPEN_AUTO;
    breaker.closed = false;
    breaker.energized = false;

    Object.entries(this.restorationPlans).forEach(([unitId, plan]) => {
      (plan.requirements ?? [])
        .filter(
          (requirement) => String(requirement.couplerId) === String(breakerId)
        )
        .forEach((requirement) => {
          const panel = this.getPanel(requirement.mainPanelId);

          const busSection = panel?.busSections?.[requirement.busIndex];

          if (busSection) {
            const normalSource =
              this.normalBusSources?.[requirement.mainPanelId]?.[
                requirement.busIndex
              ] ?? null;

            const localPanel = this.getDistributionPanel(plan.localPanelId);

            const localBreakerClosed = this.isBreakerClosed(localPanel);

            const incomingBreaker = this.getIncomingBreaker(
              requirement.incomingBreakerId
            );

            const incomingBreakerClosed =
              this.isBreakerClosed(incomingBreaker) &&
              incomingBreaker?.energized === true;

            const suppliedBy =
              normalSource &&
              this.isUnitRunning(normalSource) &&
              localBreakerClosed &&
              incomingBreakerClosed
                ? normalSource
                : null;

            this.setBusSectionState(
              requirement.mainPanelId,
              requirement.busIndex,
              suppliedBy
            );
          }
        });
    });

    EventLog.add(`DJ ${breakerId}`, 'ABERTO PELO OPERADOR', 'info');

    this.propagateColors();

    this.notifyStateChange('bus-coupler-opened', { breakerId });

    return true;
  },

  toggleDistributionBreaker(panelId) {
    const panel = this.getDistributionPanel(panelId);

    if (!panel) {
      return false;
    }

    const modernization = Scenario01.engineProfile?.modernization;

    if (
      modernization?.panelId === panelId &&
      Scenario01.units?.[modernization.unitId]?.maintenance === true
    ) {
      this.showOperationMessage(
        `COMANDO BLOQUEADO\nO DJ ${
          modernization.breakerId
        } do ${panelId} está indisponível devido à modernização da ${modernization.unitId.replace(
          'UG',
          'UG-'
        )}.`
      );

      EventLog.add(
        `DJ ${modernization.breakerId}`,
        `COMANDO BLOQUEADO - ${modernization.unitId} EM MODERNIZACAO`,
        'warning'
      );

      return false;
    }

    const restorationEntry = Object.entries(this.restorationPlans).find(
      ([, plan]) => plan.localPanelId === panelId
    );

    if (!restorationEntry) {
      const currentlyClosed = this.isBreakerClosed(panel);
      const closing = !currentlyClosed;

      if (
        closing &&
        !this.ensureBreakerInserted(
          `${panelId}-breaker`,
          panel.breaker ?? panelId
        )
      ) {
        return false;
      }

      panel.closed = closing;
      panel.breakerState = closing
        ? Breaker.STATES.CLOSED
        : Breaker.STATES.OPEN;
      panel.outputEnergized = closing && panel.energized !== false;

      EventLog.add(
        `DJ ${panel.breaker ?? panel.id}`,
        `${closing ? 'FECHADO' : 'ABERTO'} PELO OPERADOR`,
        closing ? 'info' : 'warning'
      );

      this.propagateColors();
      this.notifyStateChange('distribution-breaker-command', {
        panelId,
        closed: closing,
      });

      return true;
    }

    const [unitId, plan] = restorationEntry;

    const currentlyClosed = this.isBreakerClosed(panel);

    if (currentlyClosed) {
      panel.closed = false;
      panel.breakerState = Breaker.STATES.OPEN;
      panel.outputEnergized = false;

      this.getUnitBreakerIds(unitId).forEach((breakerId) => {
        const incoming = this.getIncomingBreaker(breakerId);

        if (incoming) {
          incoming.sourceEnergized = false;
          incoming.closed = false;
          incoming.state = Breaker.STATES.OPEN_AUTO;
          incoming.breakerState = Breaker.STATES.OPEN_AUTO;
          incoming.energized = false;
          incoming.suppliedBy = null;
        }
      });

      /*
       * A abertura do DJ local do PSA / QD elimina imediatamente a
       * tensão nas barras atendidas pelos respectivos DJs de chegada.
       *
       * Exemplos:
       * - DJ 1001 aberto -> DJs 107 e 111 abrem por subtensão;
       * - DJ 104 aberto  -> DJs 108 e 110 abrem por subtensão;
       * - DJ 106 aberto  -> DJs 109 e 112 abrem por subtensão.
       */
      (plan.requirements ?? []).forEach((requirement) => {
        this.setBusSectionState(
          requirement.mainPanelId,
          requirement.busIndex,
          null
        );

        EventLog.add(
          `DJ ${requirement.incomingBreakerId}`,
          'ABERTO AUTOMATICAMENTE POR FALTA DE TENSAO',
          'warning'
        );
      });

      EventLog.add(`DJ ${plan.localBreakerId}`, 'ABERTO PELO OPERADOR', 'info');

      this.propagateColors();

      /*
       * Depois da confirmação da falta de tensão, inicia o tempo de
       * 1,3 s para atuação dos DJs 101, 102, 103 e 104.
       */
      this.scheduleAutomaticTransfer();

      this.notifyStateChange('local-breaker-opened', { unitId, panelId });

      return true;
    }

    if (
      !this.ensureBreakerInserted(
        `${panelId}-breaker`,
        panel.breaker ?? plan.localBreakerId
      )
    ) {
      return false;
    }

    if (!this.isUnitRunning(unitId)) {
      this.showOperationMessage(
        `Para ligar o disjuntor ${plan.localBreakerId} no ${
          plan.localPanelId
        }, a ${unitId.replace('UG', 'UG-')} deve estar ligada.`
      );

      EventLog.add(
        `DJ ${plan.localBreakerId}`,
        `COMANDO BLOQUEADO - ${unitId} DESLIGADA`,
        'warning'
      );

      return false;
    }

    const closedCouplers = (plan.requirements ?? [])
      .filter((requirement) =>
        this.isBreakerClosed(this.getBusBreaker(requirement.couplerId))
      )
      .map((requirement) => requirement.couplerId);

    if (closedCouplers.length > 0) {
      this.showOperationMessage(
        `Para ligar o disjuntor ${plan.localBreakerId} no ${
          plan.localPanelId
        }, os disjuntores ${closedCouplers.join(
          ' e '
        )} de interligacao devem estar desligados.`
      );

      EventLog.add(
        `DJ ${plan.localBreakerId}`,
        `COMANDO BLOQUEADO - ABRIR OS DJs ${closedCouplers.join(' E ')}`,
        'warning'
      );

      return false;
    }

    const energizedRequirements = (plan.requirements ?? []).filter(
      (requirement) => {
        const mainPanel = this.getPanel(requirement.mainPanelId);

        return (
          mainPanel?.busSections?.[requirement.busIndex]?.energized !== false
        );
      }
    );

    if (energizedRequirements.length > 0) {
      const busNames = energizedRequirements
        .map(
          (requirement) =>
            `${requirement.mainPanelId} BARRA ${requirement.busIndex + 1}`
        )
        .join(' E ');

      this.showOperationMessage(
        `Comando bloqueado. ${busNames} deve estar desenergizada antes de ligar o disjuntor ${plan.localBreakerId}.`
      );

      EventLog.add(
        `DJ ${plan.localBreakerId}`,
        `COMANDO BLOQUEADO - ${busNames} AINDA ENERGIZADA`,
        'warning'
      );

      return false;
    }

    panel.closed = true;
    panel.breakerState = Breaker.STATES.CLOSED;
    panel.outputEnergized = true;
    panel.energized = true;

    (plan.requirements ?? []).forEach((requirement) => {
      const incoming = this.getIncomingBreaker(requirement.incomingBreakerId);

      if (incoming) {
        incoming.sourceEnergized = true;
        incoming.closed = true;
        incoming.state = Breaker.STATES.CLOSED_UNDERVOLTAGE_TRIP;
        incoming.breakerState = incoming.state;
        incoming.energized = true;
      }

      this.setBusSectionState(
        requirement.mainPanelId,
        requirement.busIndex,
        unitId
      );

      EventLog.add(
        `DJ ${requirement.incomingBreakerId}`,
        `FECHADO AUTOMATICAMENTE POR PRESENCA DE TENSAO - ${unitId}`,
        'info'
      );
    });

    EventLog.add(`DJ ${plan.localBreakerId}`, 'FECHADO PELO OPERADOR', 'info');

    this.propagateColors();

    this.notifyStateChange('unit-restored-to-bus', { unitId, panelId });

    return true;
  },

  //==================================================
  // CONSEQUÊNCIAS DOS DJs DE SAÍDA DO 1QP / 3QP
  //==================================================

  applyMainPanelFeederConsequences(panelId, feederId) {
    const feeder = this.getPanelFeeder(panelId, feederId);

    if (!feeder) {
      return false;
    }

    /*
     * Um mesmo DJ pode possuir uma ou duas identificações de saída.
     *
     * Exemplo:
     * saída principal + derivação secundária.
     *
     * Todas as cargas associadas a essas saídas devem enxergar
     * imediatamente a presença ou a falta de tensão.
     */
    const outputNumbers = [feeder.bottomLabel, feeder.secondaryBottomLabel]
      .map((value) => String(value ?? '').trim())
      .filter(Boolean);

    /*
     * propagateColors() já é o ponto central das lógicas inferiores:
     *
     * - atualiza CF-pCA / PCA;
     * - atualiza quadros auxiliares;
     * - inicia as transferências dos PCAs conforme os tempos
     *   previstos em pcaLoadTransfers;
     * - inicia as interligações / transferências dos auxiliares
     *   conforme auxPanelTransferConfigs;
     * - cancela a temporização quando a fonte normal retorna.
     *
     * Portanto, não criamos nenhum novo tempo aqui.
     * São mantidos exatamente os tempos já existentes no diagrama.
     */
    this.propagateColors();

    /*
     * Registra quais quadros perderam a fonte associada ao DJ.
     * Isto não interfere na lógica elétrica; serve apenas para
     * deixar o comportamento claro no EventLog.
     */
    if (feeder.energized !== true) {
      Scenario01.pcaPanels?.forEach((panel) => {
        const topSource = String(panel.topIncoming?.sourceNumber ?? '').trim();

        const bottomSource = String(
          panel.bottomIncoming?.sourceNumber ?? ''
        ).trim();

        if (
          outputNumbers.includes(topSource) ||
          outputNumbers.includes(bottomSource)
        ) {
          EventLog.add(
            panel.id,
            `FONTE DO DJ ${feederId} / ${panelId} SEM TENSAO - LOGICA DE TRANSFERENCIA ATIVADA`,
            'warning'
          );
        }
      });

      Scenario01.auxPanels?.forEach((panel) => {
        const leftSource = String(panel.leftSource ?? '').trim();

        const rightSource = String(panel.rightSource ?? '').trim();

        if (
          outputNumbers.includes(leftSource) ||
          outputNumbers.includes(rightSource)
        ) {
          EventLog.add(
            panel.label ?? panel.id,
            `FONTE DO DJ ${feederId} / ${panelId} SEM TENSAO - LOGICA DE INTERLIGACAO ATIVADA`,
            'warning'
          );
        }
      });
    }

    this.notifyStateChange('main-panel-feeder-downstream-updated', {
      panelId,
      feederId: String(feederId),
      outputs: outputNumbers,
      energized: feeder.energized === true,
    });

    return true;
  },

  toggleMainPanelFeeder(panelId, feederId) {
    const panel = this.getPanel(panelId);
    const feeder = this.getPanelFeeder(panelId, feederId);

    if (!panel || !feeder) {
      return false;
    }

    const operationMode = String(panel.operationMode ?? 'AUTO').toUpperCase();

    if (operationMode !== 'MANUAL') {
      this.showOperationMessage(
        `COMANDO BLOQUEADO\nO DJ ${feederId} esta sob controle do ${panelId}. Selecione o ${panelId} em MANUAL para realizar esta operacao.`
      );

      EventLog.add(
        `DJ ${feederId}`,
        `COMANDO BLOQUEADO - ${panelId} EM AUTOMATICO`,
        'warning'
      );

      return false;
    }

    const currentlyClosed = this.isBreakerClosed(feeder);
    const closing = !currentlyClosed;

    if (closing && !this.ensureBreakerInserted(feederId, feederId)) {
      return false;
    }

    const busIndex = (this.panelFeeders?.[panelId] ?? []).findIndex((ids) =>
      ids.map(String).includes(String(feederId))
    );

    const busSection = panel.busSections?.[busIndex] ?? null;
    const energized = closing && busSection?.energized === true;

    feeder.closed = closing;
    feeder.state = closing ? Breaker.STATES.CLOSED : Breaker.STATES.OPEN;
    feeder.breakerState = feeder.state;
    feeder.energized = energized;
    feeder.color = energized ? busSection.color : this.deenergizedColor;
    feeder.suppliedBy = energized ? busSection.suppliedBy ?? null : null;

    EventLog.add(
      `DJ ${feederId}`,
      `${closing ? 'FECHADO' : 'ABERTO'} PELO OPERADOR - ${panelId}`,
      closing ? 'info' : 'warning'
    );

    /*
     * Atualiza imediatamente todos os quadros alimentados por esta saída.
     *
     * Se não houver alimentação reserva/interligação configurada,
     * o quadro permanece desenergizado.
     *
     * Se existir transferência automática, o próprio Engine utiliza
     * os tempos já definidos para cada conjunto.
     */
    this.applyMainPanelFeederConsequences(panelId, feederId);

    this.notifyStateChange('main-panel-feeder-command', {
      panelId,
      feederId: String(feederId),
      closed: closing,
      energized,
    });

    return true;
  },

  /*
   * DJs dos Grupos Auxiliares de Emergência / geradores auxiliares
   * representados nos painéis pCA e auxiliares.
   *
   * Exemplos atuais:
   *   GD COG -> DJ 52-G
   *   GD-2   -> DJ 254
   *   GD-3   -> DJ 252
   */
  /*
   * DJs associados aos GAEs.
   *
   * GAE provisório:
   *   52-1
   *
   * GAE COG:
   *   52-G, 52-2A, 52-2B
   *
   * GAE-2:
   *   254, 250, 251
   *
   * GAE-3:
   *   252, 255
   */
  getGaeBreaker(breakerId) {
    const targetId = String(breakerId ?? '').trim();

    if (!targetId) {
      return null;
    }

    const gaeBreakerIds = new Set([
      // GAE provisório - CF-pCA-P14
      '52-1',
      '21103',

      // GAE COG
      '52-G',
      '52-2A',
      '52-2B',
      '254',
      '250',
      '251',
      '252',
      '255',
    ]);

    if (!gaeBreakerIds.has(targetId)) {
      return null;
    }

    // 1) DJs instalados diretamente nos geradores dos grupos pCA.
    for (const panel of Scenario01.pcaPanels ?? []) {
      for (const generator of panel.generators ?? []) {
        if (String(generator?.breaker ?? '').trim() === targetId) {
          return {
            kind: 'pca-generator',
            panel,
            target: generator,
          };
        }
      }

      // 2) DJs de acoplamento do GAE aos quadros.
      for (const load of panel.loads ?? []) {
        for (const item of load.upperSwitches ?? []) {
          if (String(item?.label ?? '').trim() === targetId) {
            return {
              kind: 'pca-switch',
              panel,
              load,
              target: item,
            };
          }
        }

        for (const item of load.lowerSwitches ?? []) {
          if (String(item?.label ?? '').trim() === targetId) {
            return {
              kind: 'pca-switch',
              panel,
              load,
              target: item,
            };
          }
        }
      }
    }

    // 3) GAE-3 no painel auxiliar 8qV.
    for (const panel of Scenario01.auxPanels ?? []) {
      const generator = panel?.generator;

      if (generator && String(generator.breaker ?? '').trim() === targetId) {
        return {
          kind: 'aux-generator',
          panel,
          target: generator,
        };
      }

      for (const item of panel?.extraBreakers ?? []) {
        if (String(item?.label ?? '').trim() === targetId) {
          return {
            kind: 'aux-extra',
            panel,
            target: item,
          };
        }
      }
    }

    return null;
  },

  getGaeControlConfig(breakerId) {
    const id = String(breakerId ?? '').trim();

    const configs = [
      {
        id: 'GAE_PROV',
        label: 'GD PROV',
        primaryBreaker: '52-1',
        breakers: ['52-1', '21103'],
        couplingBreakers: ['21103'],
        startDelay: 10000,
      },
      {
        id: 'GAE_COG',
        label: 'GD COG',
        primaryBreaker: '52-G',
        breakers: ['52-G', '52-2A', '52-2B'],
        couplingBreakers: ['52-2A', '52-2B'],
        startDelay: 10000,
      },
      {
        id: 'GAE_2',
        label: 'GD-2',
        primaryBreaker: '254',
        breakers: ['254', '250', '251'],
        couplingBreakers: ['250', '251'],
        startDelay: 10000,
      },
      {
        id: 'GAE_3',
        label: 'GD-3',
        primaryBreaker: '252',
        breakers: ['252', '255'],
        couplingBreakers: ['255'],
        startDelay: 10000,
      },
    ];

    return configs.find((config) => config.breakers.includes(id)) ?? null;
  },

  getGaeOperationMode(breakerId) {
    const config = this.getGaeControlConfig(breakerId);

    if (!config) {
      return 'AUTO';
    }

    const primary = this.getGaeBreaker(config.primaryBreaker);

    const rawMode =
      primary?.target?.operationMode ??
      primary?.panel?.gaeOperationModes?.[config.id] ??
      'AUTO';

    return String(rawMode).toUpperCase() === 'MANUAL' ? 'MANUAL' : 'AUTO';
  },

  setGaeOperationMode(breakerId, mode) {
    const config = this.getGaeControlConfig(breakerId);

    if (!config) {
      return false;
    }

    const normalizedMode =
      String(mode ?? '').toUpperCase() === 'MANUAL' ? 'MANUAL' : 'AUTO';

    const primary = this.getGaeBreaker(config.primaryBreaker);

    if (!primary) {
      return false;
    }

    primary.target.operationMode = normalizedMode;

    if (primary.panel) {
      primary.panel.gaeOperationModes ??= {};
      primary.panel.gaeOperationModes[config.id] = normalizedMode;
    }

    // Mantém todos os objetos elétricos do mesmo GAE com o mesmo modo.
    config.breakers.forEach((id) => {
      const match = this.getGaeBreaker(id);
      if (match?.target) {
        match.target.operationMode = normalizedMode;
      }
    });

    /*
     * MANUAL cancela imediatamente qualquer partida automática pendente.
     * AUTO, se já houver blackout, inicia a temporização de 10 s.
     */
    if (normalizedMode === 'MANUAL') {
      this.cancelGaeAutomaticStart(config.id);
    } else {
      this.updateGaeAutomaticBlackout();
    }

    EventLog.add(
      config.label,
      `GAE COLOCADO EM ${
        normalizedMode === 'MANUAL' ? 'MANUAL' : 'AUTOMATICO'
      }`,
      normalizedMode === 'MANUAL' ? 'warning' : 'info'
    );

    this.notifyStateChange('gae-mode-changed', {
      gaeId: config.id,
      gaeLabel: config.label,
      breakerId: String(breakerId),
      mode: normalizedMode,
    });

    return true;
  },

  toggleGaeOperationMode(breakerId) {
    const current = this.getGaeOperationMode(breakerId);
    return this.setGaeOperationMode(
      breakerId,
      current === 'MANUAL' ? 'AUTO' : 'MANUAL'
    );
  },

  isBlackoutForGae() {
    const units =
      this.operationalUnits ?? ['UG01', 'UG02', 'UG11', 'UG12'];

    return units.every((unitId) => !this.isUnitRunning(unitId));
  },

  getAllGaeControlConfigs() {
    return ['52-1', '52-G', '254', '252']
      .map((breakerId) => this.getGaeControlConfig(breakerId))
      .filter(Boolean);
  },

  cancelGaeAutomaticStart(gaeId) {
    const key = String(gaeId ?? '');
    const timer = this.gaeStartTimers.get(key);

    if (timer != null) {
      window.clearTimeout(timer);
    }

    this.gaeStartTimers.delete(key);
    this.gaeStartDeadlines.delete(key);
  },

  cancelAllGaeAutomaticStarts() {
    this.gaeStartTimers.forEach((timer) => {
      window.clearTimeout(timer);
    });

    this.gaeStartTimers.clear();
    this.gaeStartDeadlines.clear();
  },

  setGaeBreakerStateAutomatic(breakerId, closed) {
    const match = this.getGaeBreaker(breakerId);

    if (!match?.target) {
      return false;
    }

    if (closed && !this.isBreakerInserted(breakerId, breakerId)) {
      EventLog.add(
        `DJ ${breakerId}`,
        'FECHAMENTO AUTOMATICO BLOQUEADO - DISJUNTOR EXTRAIDO',
        'warning'
      );
      return false;
    }

    const state = closed ? Breaker.STATES.CLOSED : Breaker.STATES.OPEN_AUTO;

    match.target.closed = closed === true;
    match.target.state = state;
    match.target.breakerState = state;

    if (match.kind === 'pca-generator' || match.kind === 'aux-generator') {
      match.target.running = closed === true;
      match.target.energized = closed === true;
      match.target.available = true;
    } else {
      match.target.energized = closed === true;
    }

    return true;
  },

  startGaeAutomatically(config) {
    if (!config || !this.isBlackoutForGae()) {
      return false;
    }

    if (this.getGaeOperationMode(config.primaryBreaker) !== 'AUTO') {
      return false;
    }

    /*
     * Primeiro entra o grupo gerador e, na mesma sequência automática,
     * fecham os DJs que conectam o GAE aos quadros que ele atende.
     */
    this.setGaeBreakerStateAutomatic(config.primaryBreaker, true);

    for (const breakerId of config.couplingBreakers ?? []) {
      this.setGaeBreakerStateAutomatic(breakerId, true);
    }

    EventLog.add(
      config.label,
      'PARTIDA AUTOMATICA CONCLUIDA - BLACKOUT',
      'info'
    );

    this.applyGaeEmergencySupplyOverrides();

    this.notifyStateChange('gae-automatic-start-completed', {
      gaeId: config.id,
      gaeLabel: config.label,
      breakers: [...config.breakers],
      delay: config.startDelay ?? this.gaeStartDelay,
    });

    return true;
  },

  stopGaeAutomatically(config, reason = 'RETORNO DE FONTE NORMAL') {
    if (!config) {
      return false;
    }

    /*
     * Ao retornar qualquer UG, um GAE que permaneça em AUTO é retirado
     * automaticamente para evitar paralelismo com a alimentação normal.
     * Em MANUAL, o estado é preservado para decisão do operador.
     */
    if (this.getGaeOperationMode(config.primaryBreaker) !== 'AUTO') {
      return false;
    }

    let changed = false;

    for (const breakerId of [
      ...(config.couplingBreakers ?? []),
      config.primaryBreaker,
    ]) {
      if (this.isGaeBreakerClosed(breakerId)) {
        this.setGaeBreakerStateAutomatic(breakerId, false);
        changed = true;
      }
    }

    if (changed) {
      EventLog.add(
        config.label,
        `DESLIGADO AUTOMATICAMENTE - ${reason}`,
        'info'
      );

      this.notifyStateChange('gae-automatic-stop', {
        gaeId: config.id,
        gaeLabel: config.label,
        reason,
      });
    }

    return changed;
  },

  scheduleGaeAutomaticStart(config) {
    if (!config) {
      return false;
    }

    const key = String(config.id);

    if (
      this.gaeStartTimers.has(key) ||
      this.isGaeBreakerClosed(config.primaryBreaker)
    ) {
      return true;
    }

    const delay = config.startDelay ?? this.gaeStartDelay;

    EventLog.add(
      config.label,
      `BLACKOUT - PARTIDA AUTOMATICA EM ${this.formatMilliseconds(delay)}`,
      'warning'
    );

    const timer = window.setTimeout(() => {
      this.gaeStartTimers.delete(key);
      this.gaeStartDeadlines.delete(key);

      if (
        this.isBlackoutForGae() &&
        this.getGaeOperationMode(config.primaryBreaker) === 'AUTO'
      ) {
        this.startGaeAutomatically(config);
      }
    }, delay);

    this.gaeStartTimers.set(key, timer);
    this.gaeStartDeadlines.set(key, Date.now() + delay);

    return true;
  },

  updateGaeAutomaticBlackout() {
    const blackout = this.isBlackoutForGae();

    for (const config of this.getAllGaeControlConfigs()) {
      const automatic =
        this.getGaeOperationMode(config.primaryBreaker) === 'AUTO';

      if (!automatic) {
        this.cancelGaeAutomaticStart(config.id);
        continue;
      }

      if (blackout) {
        this.scheduleGaeAutomaticStart(config);
      } else {
        this.cancelGaeAutomaticStart(config.id);
        this.stopGaeAutomatically(config);
      }
    }

    return blackout;
  },

  clearGaeEmergencySupplyFlags() {
    for (const panel of Scenario01.pcaPanels ?? []) {
      for (const load of panel.loads ?? []) {
        load.gaeEmergencyEnergized = false;
        load.gaeEmergencySource = null;
        load.gaeEmergencyColor = null;
      }
    }

    for (const panel of Scenario01.auxPanels ?? []) {
      panel.gaeEmergencyEnergized = false;
      panel.gaeEmergencySource = null;
      panel.gaeEmergencyColor = null;
    }
  },

  applyGaeEmergencySupplyOverrides() {
    this.clearGaeEmergencySupplyFlags();

    if (!this.isBlackoutForGae()) {
      return false;
    }

    let suppliedAny = false;

    for (const config of this.getAllGaeControlConfigs()) {
      if (!this.isGaeBreakerClosed(config.primaryBreaker)) {
        continue;
      }

      for (const breakerId of config.couplingBreakers ?? []) {
        if (!this.isGaeBreakerClosed(breakerId)) {
          continue;
        }

        const match = this.getGaeBreaker(breakerId);

        if (match?.load) {
          match.load.gaeEmergencyEnergized = true;
          match.load.gaeEmergencySource = config.id;
          match.load.gaeEmergencyColor = this.gaeEmergencyColor;

          match.load.energized = true;
          match.load.suppliedBy = config.id;
          match.load.activeSupply = 'GAE';

          suppliedAny = true;
        }

        /*
         * No GD-3 o DJ 255 pertence ao próprio painel 8qV.
         */
        if (match?.kind === 'aux-extra' && match.panel) {
          match.panel.gaeEmergencyEnergized = true;
          match.panel.gaeEmergencySource = config.id;
          match.panel.gaeEmergencyColor = this.gaeEmergencyColor;
          match.panel.energized = true;
          match.panel.suppliedBy = config.id;

          suppliedAny = true;
        }
      }
    }

    return suppliedAny;
  },

  isGaeBreakerClosed(breakerId) {
    const match = this.getGaeBreaker(breakerId);

    if (!match) {
      return false;
    }

    if (match.kind === 'pca-switch') {
      if (typeof match.target.closed === 'boolean') {
        return match.target.closed;
      }

      return Breaker.isClosedState(
        match.target.state ?? Breaker.STATES.OPEN_AUTO
      );
    }

    if (match.kind === 'pca-generator' || match.kind === 'aux-generator') {
      return Breaker.isClosedState(
        match.target.breakerState ??
          match.target.state ??
          Breaker.STATES.OPEN_AUTO
      );
    }

    return Breaker.isClosedState(
      match.target.state ?? Breaker.STATES.OPEN_AUTO
    );
  },

  toggleGaeBreaker(breakerId, desiredClosed = null) {
    const match = this.getGaeBreaker(breakerId);

    if (!match) {
      return false;
    }

    const config = this.getGaeControlConfig(breakerId);
    const operationMode = this.getGaeOperationMode(breakerId);

    // Comando local de LIGA / DESLIGA somente em MANUAL.
    if (config && operationMode !== 'MANUAL') {
      this.showOperationMessage(
        `COMANDO BLOQUEADO\n${config.label} está em AUTOMATICO. Selecione MANUAL para comandar o DJ ${breakerId}.`
      );

      EventLog.add(
        `DJ ${breakerId}`,
        `COMANDO BLOQUEADO - ${config.label} EM AUTOMATICO`,
        'warning'
      );

      return false;
    }

    const currentlyClosed = this.isGaeBreakerClosed(breakerId);

    const closing =
      typeof desiredClosed === 'boolean' ? desiredClosed : !currentlyClosed;

    if (closing === currentlyClosed) {
      return true;
    }

    if (closing && !this.ensureBreakerInserted(breakerId, breakerId)) {
      return false;
    }

    //==================================================
    // BLOQUEIO ESPECIAL DO DJ 21103 - GAE PROV
    //==================================================
    // O acoplamento do GD PROV ao CCM-U01 somente pode ser fechado
    // durante BLACKOUT, isto e, quando as tres UGs que alimentam o
    // servico auxiliar normal estiverem simultaneamente indisponiveis.
    //
    // UG-01 -> perdida/parada
    // UG-11 -> perdida/parada
    // UG-12 -> perdida/parada
    //
    // A abertura do 21103 continua permitida a qualquer momento em MANUAL.
    if (String(breakerId) === '21103' && closing) {
      const operationalUnits =
        this.operationalUnits ?? ['UG01', 'UG02', 'UG11', 'UG12'];

      const availableSources = operationalUnits
        .filter((unitId) => this.isUnitRunning(unitId))
        .map((unitId) => unitId.replace('UG', 'UG-'));

      const blackout = availableSources.length === 0;

      if (!blackout) {
        this.showOperationMessage(
          `COMANDO BLOQUEADO\nO DJ 21103 do GD PROV somente pode ser ligado em BLACKOUT, com perda simultanea de todas as UGs operacionais.${
            availableSources.length
              ? `\nFonte(s) ainda disponivel(is): ${availableSources.join(
                  ', '
                )}.`
              : ''
          }`
        );

        EventLog.add(
          'DJ 21103',
          `FECHAMENTO BLOQUEADO - FONTE NORMAL DISPONIVEL${
            availableSources.length ? ` (${availableSources.join(', ')})` : ''
          }`,
          'warning'
        );

        return false;
      }
    }

    if (match.kind === 'pca-switch') {
      match.target.closed = closing;
      match.target.state = closing
        ? Breaker.STATES.CLOSED
        : Breaker.STATES.OPEN_AUTO;
      match.target.breakerState = match.target.state;
    } else if (
      match.kind === 'pca-generator' ||
      match.kind === 'aux-generator'
    ) {
      match.target.breakerState = closing
        ? Breaker.STATES.CLOSED
        : Breaker.STATES.OPEN_AUTO;

      match.target.state = match.target.breakerState;
      match.target.closed = closing;
      match.target.energized = closing;
    } else {
      match.target.state = closing
        ? Breaker.STATES.CLOSED
        : Breaker.STATES.OPEN_AUTO;

      match.target.breakerState = match.target.state;
      match.target.closed = closing;
      match.target.energized = closing;
    }

    EventLog.add(
      `DJ ${breakerId}`,
      closing ? 'LIGADO PELO OPERADOR' : 'DESLIGADO PELO OPERADOR',
      closing ? 'info' : 'warning'
    );

    this.propagateColors();

    this.notifyStateChange('gae-breaker-command', {
      breakerId: String(breakerId),
      closed: closing,
      panelId: match.panel?.id ?? null,
      loadId: match.load?.id ?? null,
      gaeId: config?.id ?? null,
      operationMode,
    });

    return true;
  },

  /*
   * Compatibilidade com a primeira versão da lógica dos GAEs.
   */
  toggleAuxGeneratorBreaker(breakerId, desiredClosed = null) {
    return this.toggleGaeBreaker(breakerId, desiredClosed);
  },

  getUnitStartAuxiliaryRequirements(unitId) {
    return this.unitStartAuxiliaryRequirements?.[String(unitId)] ?? [];
  },

  isPcaLoadEnergizedByPanelId(panelId) {
    const config = this.getPcaLoadTransferConfigByPanelId(panelId);

    if (!config) {
      return false;
    }

    const load = this.getPcaLoad(config.groupId, config.loadId);

    if (!load) {
      return false;
    }

    /*
     * gaeEmergencyEnergized é verificado explicitamente para que a
     * condição de partida reconheça imediatamente a alimentação do GAE,
     * mesmo antes de qualquer outra recomposição de fonte normal.
     */
    return load.energized === true || load.gaeEmergencyEnergized === true;
  },

  getMissingUnitStartAuxiliaryPanels(unitId) {
    return this.getUnitStartAuxiliaryRequirements(unitId).filter(
      (panelId) => !this.isPcaLoadEnergizedByPanelId(panelId)
    );
  },

  canStartUnitByAuxiliarySupply(unitId, showMessage = true) {
    const requiredPanels = this.getUnitStartAuxiliaryRequirements(unitId);

    /*
     * UGs sem requisito configurado continuam usando a lógica existente.
     */
    if (requiredPanels.length === 0) {
      return true;
    }

    const missingPanels = this.getMissingUnitStartAuxiliaryPanels(unitId);

    if (missingPanels.length === 0) {
      return true;
    }

    const generator = this.getGenerator(unitId);
    const unitLabel = generator?.label ?? String(unitId);

    if (showMessage) {
      this.showOperationMessage(
        `PARTIDA BLOQUEADA\n${unitLabel} não pode ser ligada enquanto o(s) quadro(s) auxiliar(es) ${missingPanels.join(
          ', '
        )} estiver(em) SEM TENSÃO.\nEnergize o(s) CCM/CM necessário(s) antes de comandar a partida.`
      );
    }

    EventLog.add(
      unitLabel,
      `PARTIDA BLOQUEADA - QUADRO AUXILIAR SEM TENSAO: ${missingPanels.join(
        ', '
      )}`,
      'warning'
    );

    this.notifyStateChange('generator-start-blocked-auxiliary-supply', {
      unitId: String(unitId),
      requiredPanels: [...requiredPanels],
      missingPanels: [...missingPanels],
    });

    return false;
  },

  //==================================================
  // SIMULADOR UG - PARTIDA MANUAL
  //==================================================

  getUgManualStartStore() {
    window.__ugManualStartStates = window.__ugManualStartStates ?? {};
    return window.__ugManualStartStates;
  },

  getUgManualStartState(unitId) {
    const id = String(unitId);
    const store = this.getUgManualStartStore();

    store[id] = store[id] ?? {
      mode: 'AUTO',
      auxiliariesChecked: false,
      brakeReleased: false,
      turbineAdmitted: false,
      speedPercent: 0,
      excitationOn: false,
      voltagePercent: 0,
      readyToRun: false,
    };

    return store[id];
  },

  resetUgManualStartState(unitId, keepMode = true) {
    const current = this.getUgManualStartState(unitId);
    const mode = keepMode ? current.mode : 'AUTO';

    this.getUgManualStartStore()[String(unitId)] = {
      mode,
      auxiliariesChecked: false,
      brakeReleased: false,
      turbineAdmitted: false,
      speedPercent: 0,
      excitationOn: false,
      voltagePercent: 0,
      readyToRun: false,
    };

    this.notifyStateChange('ug-manual-start-reset', { unitId: String(unitId) });
    return true;
  },

  setUgOperationMode(unitId, mode) {
    const state = this.getUgManualStartState(unitId);
    const normalized = String(mode).toUpperCase();

    if (!['AUTO', 'MANUAL'].includes(normalized)) return false;

    state.mode = normalized;

    EventLog.add(
      this.getGenerator(unitId)?.label ?? String(unitId),
      `SIMULADOR UG COLOCADO EM ${normalized}`,
      normalized === 'MANUAL' ? 'warning' : 'info'
    );

    this.notifyStateChange('ug-operation-mode-changed', {
      unitId: String(unitId),
      mode: normalized,
    });

    return true;
  },

  commandUgManualStart(unitId, command) {
    const id = String(unitId);
    const unit = this.getUnitState(id);
    const generator = this.getGenerator(id);
    const state = this.getUgManualStartState(id);
    const label = generator?.label ?? id;

    if (!unit || !generator) return false;

    if (!this.isUnitAvailable(id)) {
      this.showOperationMessage(`${label} indisponível para partida.`);
      return false;
    }

    if (state.mode !== 'MANUAL') {
      this.showOperationMessage(
        `COMANDO BLOQUEADO\nColoque ${label} em MANUAL antes de executar a partida manual.`
      );
      return false;
    }

    const blocked = (message) => {
      this.showOperationMessage(`PARTIDA MANUAL BLOQUEADA\n${message}`);
      EventLog.add(label, `PARTIDA MANUAL BLOQUEADA - ${message}`, 'warning');
      return false;
    };

    switch (String(command).toUpperCase()) {
      case 'AUXILIAR':
        if (!this.canStartUnitByAuxiliarySupply(id, true)) return false;
        state.auxiliariesChecked = true;
        EventLog.add(
          label,
          'PARTIDA MANUAL - SERVICOS AUXILIARES CONFIRMADOS',
          'info'
        );
        break;

      case 'FREIO':
        if (!state.auxiliariesChecked) {
          return blocked('Confirme primeiro os serviços auxiliares.');
        }
        state.brakeReleased = true;
        EventLog.add(label, 'PARTIDA MANUAL - FREIO DESAPLICADO', 'info');
        break;

      case 'TURBINA':
        if (!state.brakeReleased) {
          return blocked('Desaplique primeiro o freio da unidade.');
        }
        state.turbineAdmitted = true;
        state.speedPercent = Math.max(state.speedPercent, 15);
        EventLog.add(
          label,
          'PARTIDA MANUAL - ADMISSAO DE AGUA / INICIO DE GIRO',
          'info'
        );
        break;

      case 'SPEED_30':
      case 'SPEED_60':
      case 'SPEED_90':
      case 'SPEED_100': {
        if (!state.turbineAdmitted) {
          return blocked('Inicie primeiro o giro da turbina.');
        }

        const target = Number(String(command).split('_')[1]);
        if (target > 30 && state.speedPercent < 30) {
          return blocked('Eleve primeiro a rotação para 30%.');
        }
        if (target > 60 && state.speedPercent < 60) {
          return blocked('Eleve primeiro a rotação para 60%.');
        }
        if (target > 90 && state.speedPercent < 90) {
          return blocked('Eleve primeiro a rotação para 90%.');
        }

        state.speedPercent = target;
        EventLog.add(label, `PARTIDA MANUAL - ROTACAO EM ${target}%`, 'info');
        break;
      }

      case 'SPEED_UP':
        if (!state.turbineAdmitted) {
          return blocked('Inicie primeiro o giro da turbina.');
        }
        state.speedPercent = Math.min(100, (state.speedPercent || 0) + 5);
        EventLog.add(
          label,
          `PARTIDA MANUAL - ROTACAO AUMENTADA PARA ${state.speedPercent}%`,
          'info'
        );
        break;

      case 'SPEED_DOWN':
        if (!state.turbineAdmitted) {
          return blocked('A turbina ainda não está em giro.');
        }
        state.speedPercent = Math.max(0, (state.speedPercent || 0) - 5);
        EventLog.add(
          label,
          `PARTIDA MANUAL - ROTACAO REDUZIDA PARA ${state.speedPercent}%`,
          'info'
        );
        break;

      case 'VOLTAGE_UP':
        if (!state.excitationOn) {
          return blocked('Ligue primeiro a excitação.');
        }
        state.voltagePercent = Math.min(100, (state.voltagePercent || 0) + 5);
        EventLog.add(
          label,
          `PARTIDA MANUAL - TENSAO AUMENTADA PARA ${state.voltagePercent}%`,
          'info'
        );
        break;

      case 'VOLTAGE_DOWN':
        if (!state.excitationOn) {
          return blocked('Ligue primeiro a excitação.');
        }
        state.voltagePercent = Math.max(0, (state.voltagePercent || 0) - 5);
        EventLog.add(
          label,
          `PARTIDA MANUAL - TENSAO REDUZIDA PARA ${state.voltagePercent}%`,
          'info'
        );
        break;

      case 'EXCITACAO':
        if (state.speedPercent < 90) {
          return blocked(
            'A rotação deve estar em pelo menos 90% para ligar a excitação.'
          );
        }
        state.excitationOn = true;
        state.voltagePercent = Math.max(state.voltagePercent || 0, 80);
        EventLog.add(label, 'PARTIDA MANUAL - EXCITACAO LIGADA', 'info');
        break;

      case 'PRONTO':
        if (state.speedPercent < 100) {
          return blocked('Eleve a unidade até 100% da rotação.');
        }
        if (!state.excitationOn) {
          return blocked('Ligue a excitação antes de concluir a partida.');
        }
        if ((state.voltagePercent || 0) < 100) {
          return blocked(
            'Ajuste a tensão do gerador para 100% usando o comando +.'
          );
        }
        state.readyToRun = true;
        EventLog.add(
          label,
          'PARTIDA MANUAL - UNIDADE PRONTA PARA OPERACAO',
          'info'
        );
        break;

      case 'LIGAR':
        if (!state.readyToRun) {
          return blocked('Conclua todas as etapas da partida manual.');
        }

        if (unit.running !== true) {
          const ok = this.toggleGenerator(id);
          if (!ok) return false;
        }

        state.speedPercent = 100;
        state.excitationOn = true;
        state.voltagePercent = 100;
        EventLog.add(label, 'PARTIDA MANUAL CONCLUIDA', 'info');
        break;

      case 'ABORTAR':
        if (unit.running === true) {
          this.toggleGenerator(id);
        }
        this.resetUgManualStartState(id, true);
        EventLog.add(label, 'SEQUENCIA DE PARTIDA MANUAL CANCELADA', 'warning');
        break;

      default:
        return false;
    }

    this.notifyStateChange('ug-manual-start-command', {
      unitId: id,
      command: String(command).toUpperCase(),
      state: { ...state },
    });

    return true;
  },

  toggleGenerator(unitId) {
    const unit = this.getUnitState(unitId);

    const generator = this.getGenerator(unitId);

    if (!unit || !generator) {
      return false;
    }

    if (!this.isUnitAvailable(unitId)) {
      this.showOperationMessage(
        `${
          generator.label ?? unitId
        } indisponivel para comando devido a modernizacao.`
      );

      EventLog.add(
        generator.label ?? unitId,
        'COMANDO BLOQUEADO - UNIDADE EM MODERNIZACAO',
        'warning'
      );

      return false;
    }

    /*
     * BLOQUEIO DE PARTIDA APÓS BLACKOUT / PERDA DOS SERVIÇOS AUXILIARES.
     *
     * A regra vale somente para LIGAR a unidade. A parada permanece sempre
     * disponível. Cada UG é validada de forma independente pelo seu CCM/CM;
     * portanto a falha de um GAE não libera indevidamente a UG associada.
     */
    const starting = unit.running !== true;

    if (starting && !this.canStartUnitByAuxiliarySupply(unitId, true)) {
      return false;
    }

    unit.running = unit.running !== true;

    generator.running = unit.running;

    generator.available = unit.available;

    generator.energized = unit.running;

    if (unit.running) {
      EventLog.add(
        generator.label ?? unitId,
        'UNIDADE LIGADA PELO OPERADOR',
        'info'
      );

      /*
       * A unidade retorna disponível, mas os DJs de entrada permanecem
       * abertos até a recomposição manual pelo operador.
       */
      this.notifyStateChange('generator-started', {
        unitId,
        running: true,
      });

      return true;
    }

    const breakerIds = this.openUnitBreakers(unitId);

    EventLog.add(
      generator.label ?? unitId,
      'UNIDADE DESLIGADA PELO OPERADOR',
      'warning'
    );

    this.applyLossStage();

    this.scheduleAutomaticTransfer();

    this.notifyStateChange('generator-stopped', {
      unitId,
      running: false,
      breakerIds,
    });

    return true;
  },

  cancelBlackoutSimulation() {
    if (Array.isArray(this.blackoutTimers)) {
      this.blackoutTimers.forEach((timer) => {
        clearTimeout(timer);
      });
    }

    this.blackoutTimers = [];
    this.blackoutSimulationRunning = false;

    return true;
  },

  startBlackoutSimulation() {
    /*
     * BLACKOUT - PRIMEIRA VERSÃO
     *
     * Sequência solicitada:
     *   t = 0 s  -> UG-01 OFF
     *   t = 1 s  -> UG-11 OFF
     *   t = 2 s  -> UG-12 OFF
     *
     * A UG-02 não participa desta sequência porque, no cenário atual,
     * encontra-se em modernização e a lógica de blackout do simulador
     * utiliza UG-01, UG-11 e UG-12 como fontes disponíveis.
     *
     * Cada desligamento usa toggleGenerator(), portanto preserva TODA a
     * lógica já existente de perda de tensão, abertura dos DJs,
     * transferência automática e partida dos GAEs.
     */
    if (this.blackoutSimulationRunning) {
      this.showOperationMessage(
        'BLACKOUT\nA simulação de blackout já está em andamento.'
      );

      return false;
    }

    const sequence = [...(this.operationalUnits ?? ['UG01', 'UG02', 'UG11', 'UG12'])];

    const unitsToStop = sequence.filter((unitId) => {
      const unit = this.getUnitState(unitId);

      return unit && this.isUnitAvailable(unitId) && unit.running === true;
    });

    if (unitsToStop.length === 0) {
      this.showOperationMessage(
        'BLACKOUT\nAs UGs da sequência já estão desligadas ou indisponíveis.'
      );

      return false;
    }

    this.cancelBlackoutSimulation();
    this.blackoutSimulationRunning = true;

    EventLog.add(
      'SISTEMA',
      'SIMULAÇÃO DE BLACKOUT INICIADA - DESLIGAMENTO SEQUENCIAL DAS UGs',
      'warning'
    );

    this.notifyStateChange('blackout-simulation-started', {
      sequence: [...unitsToStop],
      stepDelay: this.blackoutStepDelay,
    });

    unitsToStop.forEach((unitId, index) => {
      const timer = setTimeout(() => {
        const unit = this.getUnitState(unitId);

        /*
         * Verifica novamente antes do comando.
         * Se o operador já desligou a UG durante a sequência,
         * não fazemos toggle para evitar religá-la acidentalmente.
         */
        if (unit && this.isUnitAvailable(unitId) && unit.running === true) {
          this.toggleGenerator(unitId);

          EventLog.add(
            'BLACKOUT',
            `${unitId.replace('UG', 'UG-')} DESLIGADA - ETAPA ${index + 1}/${
              unitsToStop.length
            }`,
            'warning'
          );
        }

        if (index === unitsToStop.length - 1) {
          this.blackoutTimers = [];
          this.blackoutSimulationRunning = false;

          EventLog.add(
            'SISTEMA',
            'BLACKOUT CONCLUÍDO - FONTES DAS UGs PERDIDAS',
            'warning'
          );

          this.notifyStateChange('blackout-simulation-completed', {
            sequence: [...unitsToStop],
          });
        }
      }, index * this.blackoutStepDelay);

      this.blackoutTimers.push(timer);
    });

    return true;
  },

  restoreNormalState() {
    this.cancelBlackoutSimulation();

    if (!this.normalScenarioState) {
      return false;
    }

    this.cancelTransferTimer();

    this.cancelAllAuxPanelTransfers();

    const restoredState = this.cloneState(this.normalScenarioState);

    Object.keys(Scenario01).forEach((key) => {
      delete Scenario01[key];
    });

    Object.assign(Scenario01, restoredState);

    /*
     * A condição NORMAL também restaura a posição mecânica
     * de todos os disjuntores.
     *
     * Qualquer DJ que tenha sido EXTRAÍDO pelo operador
     * volta automaticamente para INSERIDO.
     */
    this.resetAllBreakerPositions();

    /*
     * Reforca a configuracao operacional normal: os seis DJs de entrada
     * ficam fechados. Em uma perda real simulada, openUnitBreakers()
     * continua abrindo somente os DJs associados a unidade perdida.
     */
    this.applyNormalIncomingBreakerStates();

    this.propagateColors();

    EventLog.add('SISTEMA', 'CONFIGURACAO NORMAL RESTAURADA', 'info');

    this.notifyStateChange('normal-restored');

    window.dispatchEvent(new CustomEvent('scada:normal-restored'));

    return true;
  },
};
