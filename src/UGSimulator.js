import { Engine } from './Engine.js';
import { UGSimulatorDatabase } from './UGSimulatorDatabase.js';

export const UGSimulator = {
  root: null,
  activeUnit: null,
  activeSection: 'Turbina / Gerador',

  initialize() {
    if (document.getElementById('ugSimulatorOverlay')) {
      this.root = document.getElementById('ugSimulatorOverlay');
      return;
    }

    const root = document.createElement('div');
    root.id = 'ugSimulatorOverlay';
    root.className = 'ugSimOverlay';
    root.hidden = true;

    root.innerHTML = `
      <section class="ugSimWindow" role="dialog" aria-modal="true" aria-labelledby="ugSimTitle">
        <header class="ugSimHeader">
          <div class="ugSimHeaderIdentity">
            <strong id="ugSimUnit">UG-01</strong>
            <span id="ugSimTitle">SIMULADOR OPERACIONAL DA UNIDADE GERADORA</span>
          </div>
          <button id="ugSimClose" type="button" aria-label="Fechar">×</button>
        </header>

        <div class="ugSimBody">
          <aside class="ugSimSidebar">
            <button class="ugSimBack" type="button">← VOLTAR AO SERVIÇO AUXILIAR</button>
            <div id="ugSimMenu"></div>

            <div class="ugSimState">
              <span>ESTADO OPERACIONAL</span>
              <strong id="ugSimState">--</strong>
            </div>
          </aside>

          <main class="ugSimMain">
            <div class="ugSimBreadcrumb" id="ugSimBreadcrumb"></div>

            <div class="ugSimTabs">
              <button class="active" type="button">CONJUNTO</button>
              <button type="button">GERADOR</button>
              <button type="button">TURBINA</button>
              <button type="button">MANCAIS</button>
              <button type="button">SISTEMAS AUXILIARES</button>
            </div>

            <div class="ugSimDashboard">
              <section class="ugSimMachinePanel">
                <div class="ugSimCallout callout-excitation"><i></i><b>SISTEMA DE EXCITAÇÃO</b><small>Excitatriz e regulador</small></div>
                <div class="ugSimCallout callout-stator"><i></i><b>ESTATOR DO GERADOR</b><small>Enrolamentos</small></div>
                <div class="ugSimCallout callout-rotor"><i></i><b>ROTOR DO GERADOR</b><small>Polos</small></div>
                <div class="ugSimCallout callout-bearing-top"><i></i><b>MANCAL-GUIA SUPERIOR</b><small>Radial</small></div>
                <div class="ugSimCallout callout-shaft"><i></i><b>EIXO PRINCIPAL</b><small>Eixo vertical</small></div>
                <div class="ugSimCallout callout-distributor"><i></i><b>DISTRIBUIDOR</b><small>Palhetas diretrizes</small></div>

                <div class="ugSimCallout right callout-terminals"><i></i><b>TERMINAIS DE SAÍDA</b><small>Barramento</small></div>
                <div class="ugSimCallout right callout-brake"><i></i><b>FREIO DO GERADOR</b><small>Disco</small></div>
                <div class="ugSimCallout right callout-thrust"><i></i><b>MANCAL DE ESCORA</b><small>Axial</small></div>
                <div class="ugSimCallout right callout-bearing-bottom"><i></i><b>MANCAL-GUIA INFERIOR</b><small>Radial</small></div>
                <div class="ugSimCallout right callout-servo"><i></i><b>SERVOMOTOR</b><small>Distribuidor</small></div>
                <div class="ugSimCallout right callout-turbine"><i></i><b>TURBINA FRANCIS</b><small>Rotor (runner)</small></div>

                <div class="hydroSet hydroSetShaftOnly" aria-label="Eixo vertical simplificado da unidade geradora">
                  <div class="shaftRotor rotatingTrainPart">
                    <div class="shaftRotorHub top"></div>
                    <div class="shaftRotorCore"></div>
                    <div class="shaftRotorRing rotorMotionWindow">
                      <div class="rotorMotionTrack trackA">
                        <i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i>
                      </div>
                      <div class="rotorMotionTrack trackB">
                        <i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i>
                      </div>
                    </div>
                    <div class="shaftRotorHub bottom"></div>
                  </div>

                  <div class="shaftMain upper rotatingTrainPart"></div>

                  <div class="shaftCollar collar1"></div>
                  <div class="shaftMain middle rotatingTrainPart"></div>
                  <div class="shaftCollar collar2"></div>
                  <div class="shaftMain lower rotatingTrainPart"></div>

                  <div class="shaftCone rotatingTrainPart"></div>

                  <div class="shaftFrancis shaftFrancisV9 rotatingTrainPart">
                    <div class="francisTopFlange"></div>

                    <div class="francisBladeStage francisMotionWindow">
                      <div class="francisMotionTrack trackA">
                        <div class="francisBlade"></div><div class="francisBlade"></div>
                        <div class="francisBlade"></div><div class="francisBlade"></div>
                        <div class="francisBlade"></div><div class="francisBlade"></div>
                        <div class="francisBlade"></div><div class="francisBlade"></div>
                      </div>
                      <div class="francisMotionTrack trackB">
                        <div class="francisBlade"></div><div class="francisBlade"></div>
                        <div class="francisBlade"></div><div class="francisBlade"></div>
                        <div class="francisBlade"></div><div class="francisBlade"></div>
                        <div class="francisBlade"></div><div class="francisBlade"></div>
                      </div>
                    </div>

                    <div class="francisBottomBand"></div>
                    <div class="francisBottomHub"></div>
                  </div>
                </div>

              </section>

              <aside class="ugSimInfoColumn">
                <section class="ugSimInfoCard">
                  <h3>PARÂMETROS PRINCIPAIS</h3>
                  <div class="ugInfoRow"><span>⚡ TENSÃO DO GERADOR</span><strong id="ugVoltage">--</strong></div>
                  <div class="ugInfoRow"><span>◴ ROTAÇÃO</span><strong id="ugSpeed">--</strong></div>
                  <div class="ugInfoRow"><span>〰 FREQUÊNCIA</span><strong id="ugFrequency">--</strong></div>
                  <div class="ugInfoRow"><span>▥ POTÊNCIA ATIVA</span><strong id="ugActivePower">--</strong></div>
                  <div class="ugInfoRow"><span>▥ POTÊNCIA REATIVA</span><strong id="ugReactivePower">--</strong></div>
                </section>

                <section class="ugSimInfoCard">
                  <h3>SISTEMAS AUXILIARES</h3>
                  <div class="ugAuxRow"><span>ÓLEO DOS MANCAIS</span><b>NORMAL</b></div>
                  <div class="ugAuxRow"><span>EXCITAÇÃO</span><b id="ugExcitationState">--</b></div>
                  <div class="ugAuxRow"><span>RESFRIAMENTO</span><b>NORMAL</b></div>
                  <div class="ugAuxRow"><span>SISTEMA DE FREIO</span><b id="ugBrakeState">--</b></div>
                  <div class="ugAuxRow"><span>SISTEMA HIDRÁULICO</span><b>NORMAL</b></div>
                </section>

                <section class="ugSimInfoCard">
                  <h3>STATUS DA UNIDADE</h3>
                  <div class="ugUnitStatus">
                    <i id="ugStatusLamp"></i>
                    <strong id="ugStatus">--</strong>
                  </div>
                </section>
              </aside>
            </div>

            <section class="ugManualStartPanel ugQcPanel" id="ugManualStartPanel" hidden>
              <div class="ugQcTitleRow">
                <div class="ugQcPlate" id="ugQcPlate">QC-UG</div>
                <div class="ugModeSelector">
                  <button id="ugModeAuto" type="button">AUTOMÁTICO</button>
                  <button id="ugModeManual" type="button">MANUAL</button>
                </div>
              </div>

              <div class="ugQcBoard">
                <section class="ugQcSide turbine">
                  <h3>TURBINA</h3>

                  <div class="ugQcControlsGrid ugQcIndustrialControls">

                  </div>

                  <div class="ugQcSubsectionTitle">SISTEMAS AUXILIARES DE PARTIDA</div>

                  <div class="ugQcAuxSequence compactSequence">
                    <div class="ugQcAuxRow row6">
                      <button class="ugQcSwitch ugQcSelectorSwitch mini" data-ug-local-toggle="rv" type="button">
                        <span class="ugQcSelectorPlate">
                          <span class="ugQcSelectorMark left">0</span>
                          <span class="ugQcSelectorHandle"></span>
                          <span class="ugQcSelectorMark right">1</span>
                        </span>
                        <b>R.V.</b>
                        <small id="qcRvAuxState">DESLIGADO</small>
                      </button>

                      <button class="ugQcSwitch ugQcSelectorSwitch mini" data-ug-local-toggle="compressor" type="button">
                        <span class="ugQcSelectorPlate">
                          <span class="ugQcSelectorMark left">0</span>
                          <span class="ugQcSelectorHandle"></span>
                          <span class="ugQcSelectorMark right">1</span>
                        </span>
                        <b>COMPRESSOR</b>
                        <small id="qcCompressorAuxState">DESLIGADO</small>
                      </button>

                      <button class="ugQcSwitch ugQcSelectorSwitch mini" data-ug-local-toggle="graxa" type="button">
                        <span class="ugQcSelectorPlate">
                          <span class="ugQcSelectorMark left">0</span>
                          <span class="ugQcSelectorHandle"></span>
                          <span class="ugQcSelectorMark right">1</span>
                        </span>
                        <b>GRAXA</b>
                        <small id="qcGraxaAuxState">DESLIGADO</small>
                      </button>

                      <button class="ugQcSwitch ugQcSelectorSwitch mini" data-ug-local-toggle="mgi" type="button">
                        <span class="ugQcSelectorPlate">
                          <span class="ugQcSelectorMark left">0</span>
                          <span class="ugQcSelectorHandle"></span>
                          <span class="ugQcSelectorMark right">1</span>
                        </span>
                        <b>M.G.I.</b>
                        <small id="qcMgiAuxState">DESLIGADO</small>
                      </button>

                      <button class="ugQcSwitch ugQcSelectorSwitch mini" data-ug-local-toggle="resfriamento" type="button">
                        <span class="ugQcSelectorPlate">
                          <span class="ugQcSelectorMark left">0</span>
                          <span class="ugQcSelectorHandle"></span>
                          <span class="ugQcSelectorMark right">1</span>
                        </span>
                        <b>RESFR.</b>
                        <small id="qcCoolingAuxState">DESLIGADO</small>
                      </button>

                      <button class="ugQcSwitch ugQcSelectorSwitch mini" data-ug-local-toggle="freioAux" type="button">
                        <span class="ugQcSelectorPlate">
                          <span class="ugQcSelectorMark left">0</span>
                          <span class="ugQcSelectorHandle"></span>
                          <span class="ugQcSelectorMark right">1</span>
                        </span>
                        <b>FREIO</b>
                        <small id="qcFreioAuxState">DESLIGADO</small>
                      </button>
                    </div>

                    <div class="ugQcAuxRow row3">
                      <button class="ugQcSwitch ugQcSelectorSwitch mini" data-ug-local-toggle="compEmerg" type="button">
                        <span class="ugQcSelectorPlate">
                          <span class="ugQcSelectorMark left">0</span>
                          <span class="ugQcSelectorHandle"></span>
                          <span class="ugQcSelectorMark right">1</span>
                        </span>
                        <b>COMP. EMERG.</b>
                        <small id="qcCompEmergAuxState">DESLIGADO</small>
                      </button>

                      <button class="ugQcSwitch ugQcSelectorSwitch mini" data-ug-local-toggle="s20q" type="button">
                        <span class="ugQcSelectorPlate">
                          <span class="ugQcSelectorMark left">0</span>
                          <span class="ugQcSelectorHandle"></span>
                          <span class="ugQcSelectorMark right">1</span>
                        </span>
                        <b>S20Q</b>
                        <small id="qcS20qAuxState">DESLIGADO</small>
                      </button>

                      <button class="ugQcSwitch ugQcSelectorSwitch mini" data-ug-local-toggle="s65" type="button">
                        <span class="ugQcSelectorPlate">
                          <span class="ugQcSelectorMark left">0</span>
                          <span class="ugQcSelectorHandle"></span>
                          <span class="ugQcSelectorMark right">1</span>
                        </span>
                        <b>S65</b>
                        <small id="qcS65AuxState">DESLIGADO</small>
                      </button>
                    </div>

                    <div class="ugQcAuxRow row2">
                      <button class="ugQcSwitch ugQcSelectorSwitch mini" data-ug-local-toggle="mc" type="button">
                        <span class="ugQcSelectorPlate">
                          <span class="ugQcSelectorMark left">0</span>
                          <span class="ugQcSelectorHandle"></span>
                          <span class="ugQcSelectorMark right">1</span>
                        </span>
                        <b>M.C.</b>
                        <small id="qcMcAuxState">MANCAL COMBINADO</small>
                      </button>

                      <button class="ugQcSwitch ugQcSelectorSwitch mini" data-ug-local-toggle="inj" type="button">
                        <span class="ugQcSelectorPlate">
                          <span class="ugQcSelectorMark left">0</span>
                          <span class="ugQcSelectorHandle"></span>
                          <span class="ugQcSelectorMark right">1</span>
                        </span>
                        <b>INJEÇÃO</b>
                        <small id="qcInjAuxState">DESLIGADO</small>
                      </button>
                    </div>
                  </div>

                </section>

                <section class="ugQcSide generator">
                  <h3>GERADOR</h3>

                  <div class="ugGenStartControls">

                    <div class="ugGenSimpleControl voltage">
                      <span class="ugGenSimpleTitle">AJUSTE TENSÃO</span>

                      <button class="ugQcSwitch ugQcSelectorSwitch ugGenVoltageSelector"
                              id="ugVoltageRocker"
                              type="button"
                              aria-label="Ajuste de tensão: segure à esquerda para diminuir e à direita para aumentar">
                        <span class="ugQcSelectorPlate ugVoltageSelectorPlate">
                          <span class="ugQcSelectorMark left">−</span>
                          <span class="ugQcSelectorHandle ugVoltageSelectorHandle"></span>
                          <span class="ugQcSelectorMark right">+</span>
                        </span>
                        <b>AJUSTE TENSÃO</b>
                        <small id="qcVoltageValue">0%</small>
                      </button>
                    </div>

                    <div class="ugGenSimpleControl field">
                      <span class="ugGenSimpleTitle">DISJUNTOR DE CAMPO</span>

                      <button class="ugQcSwitch ugQcSelectorSwitch ugGenFieldSwitch"
                              data-ug-command="EXCITACAO"
                              type="button">
                        <span class="ugQcSelectorPlate">
                          <span class="ugQcSelectorMark left">0</span>
                          <span class="ugQcSelectorHandle"></span>
                          <span class="ugQcSelectorMark right">1</span>
                        </span>
                        <b>DISJ. CAMPO</b>
                        <small id="qcExcCommandState">DESLIGADO</small>
                      </button>
                    </div>

                  </div>

                  <div class="ugGenStartStopPanel">
                    <div class="ugGenSignalPlate" id="qcReadyStartPlate">
                      <strong>PRONTO PARA PARTIDA</strong>
                    </div>

                    <button class="ugGenRoundButton" data-ug-action="START" type="button">
                      <span class="cap"></span>
                      <b>PARTIDA</b>
                    </button>

                    <button class="ugGenRoundButton" data-ug-action="STOP" type="button">
                      <span class="cap"></span>
                      <b>PARADA</b>
                    </button>

                    <div class="ugGenSignalPlate" id="qcReadySyncPlate">
                      <strong>PRONTO PARA SINCRONISMO</strong>
                    </div>
                  </div>

                  <div class="ugGenMiniDiagramBox">
                    <div class="ugGenMiniDiagramTitle">DIAGRAMA DE SINCRONISMO</div>

                    <div class="ugGenMiniDiagram">
                      <div class="ugGenBus top"></div>
                      <div class="ugGenBus mid"></div>
                      <div class="ugGenLoop leftV"></div>
                      <div class="ugGenLoop rightV"></div>
                      <div class="ugGenLoop bottomH"></div>
                      <div class="ugGenDrop"></div>

                      <button class="ugGenMiniSwitch seccionadora left"
                              data-ug-local-toggle="secLeft"
                              type="button"
                              aria-label="Seccionadora esquerda">
                        <span class="core"></span>
                        <span class="deviceLabel">SECC.</span>
                      </button>

                      <button class="ugGenMiniSwitch seccionadora right"
                              data-ug-local-toggle="secRight"
                              type="button"
                              aria-label="Seccionadora direita">
                        <span class="core"></span>
                        <span class="deviceLabel">SECC.</span>
                      </button>

                      <button class="ugGenMiniSwitch modekey left"
                              data-ug-local-toggle="syncKey"
                              type="button"
                              aria-label="Chave man/auto de sincronismo">
                        <span class="topLabel">man/auto</span>
                        <span class="core"></span>
                        <span class="deviceLabel">chave de<br>sincronismo</span>
                      </button>

                      <button class="ugGenMiniSwitch sync center"
                              data-ug-local-toggle="syncDiag"
                              type="button"
                              aria-label="Sincronismo">
                        <span class="core"></span>
                        <span class="deviceLabel">SINCR.</span>
                      </button>

                      <div class="ugGenGroundKnife" aria-hidden="true">
                        <span class="knife"></span>
                      </div>

                      <div class="ugGenMiniGenerator" aria-hidden="true">
                        <span class="ring outer"></span>
                        <span class="ring inner"></span>
                        <span class="g">G</span>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              <div class="ugManualFooter">
                <span id="ugManualStatus">Selecione MANUAL para iniciar.</span>
                <button class="danger" data-ug-command="ABORTAR" type="button">PARADA / CANCELAR SEQUÊNCIA</button>
              </div>
            </section>
          </main>
        </div>

        <footer class="ugSimFooter">
          <span id="ugSimAlarm">● SEM ALARMES ATIVOS</span>
          <span>MODO SIMULAÇÃO</span>
        </footer>
      </section>
    `;

    document.body.appendChild(root);
    this.root = root;

    root.querySelector('#ugSimClose').addEventListener('click', () => this.close());
    root.querySelector('.ugSimBack').addEventListener('click', () => this.close());
    root.querySelector('#ugModeAuto').addEventListener('click', () => {
      Engine.setUgOperationMode(this.activeUnit, 'AUTO');
      this.render();
    });
    root.querySelector('#ugModeManual').addEventListener('click', () => {
      Engine.setUgOperationMode(this.activeUnit, 'MANUAL');
      this.render();
    });
    root.querySelectorAll('[data-ug-command]').forEach(button => {
      button.addEventListener('click', () => {
        Engine.commandUgManualStart(this.activeUnit, button.dataset.ugCommand);
        this.render();
      });
    });

    const voltageRocker = root.querySelector('#ugVoltageRocker');

    if (voltageRocker) {
      let holdDelay = null;
      let holdInterval = null;

      const stopVoltageHold = () => {
        if (holdDelay) {
          clearTimeout(holdDelay);
          holdDelay = null;
        }

        if (holdInterval) {
          clearInterval(holdInterval);
          holdInterval = null;
        }

        voltageRocker.classList.remove('holding-left', 'holding-right');
      };

      const commandVoltage = direction => {
        const manual = Engine.getUgManualStartState(this.activeUnit);

        if (!manual || manual.mode !== 'MANUAL') {
          stopVoltageHold();
          this.render();
          return false;
        }

        const command = direction === 'left'
          ? 'VOLTAGE_DOWN'
          : 'VOLTAGE_UP';

        const ok = Engine.commandUgManualStart(this.activeUnit, command);
        this.render();

        if (ok === false) {
          stopVoltageHold();
          return false;
        }

        return true;
      };

      voltageRocker.addEventListener('pointerdown', event => {
        if (voltageRocker.disabled) return;

        event.preventDefault();

        const rect = voltageRocker.getBoundingClientRect();
        const direction =
          event.clientX < rect.left + (rect.width / 2)
            ? 'left'
            : 'right';

        stopVoltageHold();
        voltageRocker.classList.add(
          direction === 'left' ? 'holding-left' : 'holding-right'
        );

        voltageRocker.setPointerCapture?.(event.pointerId);

        // Um toque já executa um passo.
        if (!commandVoltage(direction)) return;

        // Segurando: começa a repetir após 320 ms.
        holdDelay = setTimeout(() => {
          holdInterval = setInterval(() => {
            commandVoltage(direction);
          }, 120);
        }, 320);
      });

      voltageRocker.addEventListener('pointerup', stopVoltageHold);
      voltageRocker.addEventListener('pointercancel', stopVoltageHold);
      voltageRocker.addEventListener('lostpointercapture', stopVoltageHold);
      voltageRocker.addEventListener('pointerleave', event => {
        if (event.buttons === 0) stopVoltageHold();
      });
    }

    root.querySelectorAll('[data-ug-local-toggle]').forEach(button => {
      button.addEventListener('click', () => {
        const manual = Engine.getUgManualStartState(this.activeUnit);
        if (!manual || manual.mode !== 'MANUAL') {
          this.render();
          return;
        }

        manual.localSwitches = manual.localSwitches || {};
        const key = button.dataset.ugLocalToggle;
        manual.localSwitches[key] = !manual.localSwitches[key];
        this.render();
      });
    });

    root.querySelectorAll('[data-ug-action]').forEach(button => {
      button.addEventListener('click', () => {
        const manual = Engine.getUgManualStartState(this.activeUnit);
        const unit = Engine.getUnitState(this.activeUnit) || {};

        if (!manual || manual.mode !== 'MANUAL') {
          this.render();
          return;
        }

        // Pulso visual do botão redondo.
        button.classList.remove('pulse-active');
        void button.offsetWidth;
        button.classList.add('pulse-active');
        setTimeout(() => button.classList.remove('pulse-active'), 1400);

        if (button.dataset.ugAction === 'START') {
          Engine.commandUgManualStart(this.activeUnit, 'LIGAR');
        } else if (button.dataset.ugAction === 'STOP') {
          if (unit.running === true && typeof Engine.toggleGenerator === 'function') {
            Engine.toggleGenerator(this.activeUnit);
          } else {
            Engine.commandUgManualStart(this.activeUnit, 'ABORTAR');
          }
        }

        this.render();
      });
    });
    root.addEventListener('click', e => { if (e.target === root) this.close(); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !root.hidden) this.close();
    });
  },

  open(unitId = 'UG01') {
    this.initialize();
    this.activeUnit = unitId;
    this.activeSection = 'Turbina / Gerador';
    this.render();
    this.root.hidden = false;
  },

  close() {
    if (this.root) this.root.hidden = true;
  },

  render() {
    const data = UGSimulatorDatabase[this.activeUnit] || { label: this.activeUnit };
    const state = Engine.getUnitState(this.activeUnit) || {};
    const running = state.running === true;
    const available = state.available !== false;
    const manual = Engine.getUgManualStartState(this.activeUnit);

    const stateText = !available
      ? 'INDISPONÍVEL / MANUTENÇÃO'
      : running ? 'EM OPERAÇÃO' : 'PARADA';

    this.root.querySelector('#ugSimUnit').textContent = data.label || this.activeUnit;
    this.root.querySelector('#ugSimBreadcrumb').textContent = `NÍVEL 2 • ${this.activeSection}`;
    this.root.querySelector('#ugSimState').textContent = stateText;
    this.root.querySelector('#ugStatus').textContent = stateText;

    const manualSpeed = running ? 100 : (manual.speedPercent || 0);
    const ratedSpeedNumber = parseFloat(String(data.ratedSpeed || '85.7').replace(',', '.')) || 85.7;
    const currentRpm = ratedSpeedNumber * manualSpeed / 100;

    const manualVoltagePercent = running ? 100 : (manual.voltagePercent || 0);
    const ratedVoltageNumber = parseFloat(String(data.ratedVoltage || '14,4').replace(',', '.')) || 14.4;
    const currentKv = ratedVoltageNumber * manualVoltagePercent / 100;

    this.root.querySelector('#ugVoltage').textContent =
      `${currentKv.toFixed(1).replace('.', ',')} kV`;

    this.root.querySelector('#ugSpeed').textContent =
      `${currentRpm.toFixed(1).replace('.', ',')} rpm`;

    this.root.querySelector('#ugFrequency').textContent =
      `${(60 * manualSpeed / 100).toFixed(1).replace('.', ',')} Hz`;

    this.root.querySelector('#ugActivePower').textContent =
      running ? (data.activePower || '-- MW') : '0 MW';

    this.root.querySelector('#ugReactivePower').textContent =
      running ? (data.reactivePower || '-- MVAr') : '0 MVAr';

    this.root.querySelector('#ugExcitationState').textContent =
      (running || manual.excitationOn) ? 'LIGADA' : 'DESLIGADA';

    this.root.querySelector('#ugBrakeState').textContent =
      (running || manual.brakeReleased) ? 'DESAPLICADO' : 'APLICADO';

    const lamp = this.root.querySelector('#ugStatusLamp');
    lamp.classList.toggle('off', !running || !available);
    lamp.classList.toggle('maintenance', !available);

    const machine = this.root.querySelector('.hydroSet');
    const visuallySpinning = running || manual.speedPercent > 0;
    machine.classList.toggle('running', visuallySpinning);
    machine.classList.toggle('unavailable', !available);

    const speedForAnimation = Math.max(manualSpeed, 10);
    const animationDuration = Math.max(0.28, 2.8 - (speedForAnimation * 0.022));
    machine.style.setProperty('--ug-rotation-duration', `${animationDuration.toFixed(2)}s`);

    const manualPanel = this.root.querySelector('#ugManualStartPanel');
    const dashboard = this.root.querySelector('.ugSimDashboard');
    const onStartStop = this.activeSection === 'Partida / Parada';

    const machinePanel = this.root.querySelector('.ugSimMachinePanel');
    const infoColumn = this.root.querySelector('.ugSimInfoColumn');

    manualPanel.hidden = !onStartStop;
    dashboard.hidden = false;
    machinePanel.classList.toggle('startStopMode', onStartStop);
    infoColumn.hidden = onStartStop;

    if (onStartStop) {
      if (manualPanel.parentElement !== machinePanel) {
        machinePanel.appendChild(manualPanel);
      }
      const manualMode = manual.mode === 'MANUAL';
      this.root.querySelector('#ugModeManual').classList.toggle('active', manualMode);
      this.root.querySelector('#ugModeAuto').classList.toggle('active', !manualMode);
      this.root.querySelector('#ugQcPlate').textContent =
        `QC-${String(data.label || this.activeUnit).replace('UG-', '')}`;

      const voltagePercent = running ? 100 : (manual.voltagePercent || 0);
      const speedPercent = running ? 100 : (manual.speedPercent || 0);

      this.root.querySelector('#qcVoltageValue').textContent = `${voltagePercent}%`;
      this.root.querySelector('#qcVoltageBar').style.width = `${voltagePercent}%`;

      const setLamp = (selector, on, ready = false) => {
        const el = this.root.querySelector(selector);
        if (!el) return;
        el.classList.toggle('on', Boolean(on));
        el.classList.toggle('ready', Boolean(ready));
      };


      // Permissivos visuais do QC.

      // Estados escritos nos seletores/chaves.
      const setCommandText = (selector, value) => {
        const el = this.root.querySelector(selector);
        if (el) el.textContent = value;
      };

      setCommandText(
        '#qcExcCommandState',
        (manual.excitationOn || running) ? 'LIGADO' : 'DESLIGADO'
      );

      // A posição gráfica do seletor acompanha o estado lógico.
      const setSelectorState = (command, active) => {
        const button = this.root.querySelector(`[data-ug-command="${command}"]`);
        if (button) button.classList.toggle('selected', Boolean(active));
      };

      setSelectorState('EXCITACAO', manual.excitationOn || running);

      const localSwitches = manual.localSwitches || {};

      const setLocalToggleState = (key, selector, textSelector) => {
        const on = Boolean(localSwitches[key]);
        const button = this.root.querySelector(`[data-ug-local-toggle="${key}"]`);
        if (button) {
          button.classList.toggle('selected', on);
          button.setAttribute('aria-pressed', on ? 'true' : 'false');
          const labels = {
            secLeft: 'SECCIONADORA ESQUERDA',
            secRight: 'SECCIONADORA DIREITA',
            syncDiag: 'SINCRONISMO',
            syncKey: 'CHAVE MAN/AUTO DO SINCRONISMO'
          };
          if (labels[key]) {
            button.title = `${labels[key]} ${on ? 'FECHADA' : 'ABERTA'}`;
          }
        }
        const text = textSelector ? this.root.querySelector(textSelector) : null;
        if (text) text.textContent = on ? 'LIGADO' : 'DESLIGADO';
      };

      setLocalToggleState('rv', '[data-ug-local-toggle="rv"]', '#qcRvAuxState');
      setLocalToggleState('compressor', '[data-ug-local-toggle="compressor"]', '#qcCompressorAuxState');
      setLocalToggleState('graxa', '[data-ug-local-toggle="graxa"]', '#qcGraxaAuxState');
      setLocalToggleState('mgi', '[data-ug-local-toggle="mgi"]', '#qcMgiAuxState');
      setLocalToggleState('freioAux', '[data-ug-local-toggle="freioAux"]', '#qcFreioAuxState');
      setLocalToggleState('resfriamento', '[data-ug-local-toggle="resfriamento"]', '#qcCoolingAuxState');
      setLocalToggleState('compEmerg', '[data-ug-local-toggle="compEmerg"]', '#qcCompEmergAuxState');
      setLocalToggleState('s20q', '[data-ug-local-toggle="s20q"]', '#qcS20qAuxState');
      setLocalToggleState('s65', '[data-ug-local-toggle="s65"]', '#qcS65AuxState');
      setLocalToggleState('mc', '[data-ug-local-toggle="mc"]', '#qcMcAuxState');
      setLocalToggleState('inj', '[data-ug-local-toggle="inj"]', '#qcInjAuxState');

      setLocalToggleState('secLeft', '[data-ug-local-toggle="secLeft"]');
      setLocalToggleState('secRight', '[data-ug-local-toggle="secRight"]');
      setLocalToggleState('syncKey', '[data-ug-local-toggle="syncKey"]');
      setLocalToggleState('syncDiag', '[data-ug-local-toggle="syncDiag"]');

      const requiredAux = [
        'rv', 'compressor', 'graxa', 'mgi', 'resfriamento',
        'freioAux', 'compEmerg', 's20q', 's65', 'mc', 'inj'
      ];
      const readyForStart = manualMode && requiredAux.every(key => Boolean(localSwitches[key]));
      const readyForSync = readyForStart && (manual.excitationOn || running) && voltagePercent >= 90;

      const readyStartPlate = this.root.querySelector('#qcReadyStartPlate');
      if (readyStartPlate) readyStartPlate.classList.toggle('active', readyForStart);

      const readySyncPlate = this.root.querySelector('#qcReadySyncPlate');
      if (readySyncPlate) readySyncPlate.classList.toggle('active', readyForSync);

      this.root.querySelector('#ugManualStatus').textContent =
        running ? `${data.label || this.activeUnit} EM OPERAÇÃO` :
        !manualMode ? 'Selecione MANUAL para habilitar os comandos do QC.' :
        manual.readyToRun ? 'GERADOR PRONTO • execute PARTIDA / OPERAÇÃO.' :
        `PARTIDA MANUAL • ROTAÇÃO ${speedPercent}% • TENSÃO ${voltagePercent}%`;

      this.root.querySelectorAll('[data-ug-command]').forEach(button => {
        button.disabled = !manualMode && button.dataset.ugCommand !== 'ABORTAR';
      });

      const voltageRocker = this.root.querySelector('#ugVoltageRocker');
      if (voltageRocker) {
        voltageRocker.disabled = !manualMode;
      }

      this.root.querySelectorAll('[data-ug-local-toggle]').forEach(button => {
        button.disabled = !manualMode;
      });

      this.root.querySelectorAll('[data-ug-action]').forEach(button => {
        button.disabled = !manualMode;
      });
    }

    if (!onStartStop && manualPanel.parentElement === machinePanel) {
      dashboard.insertAdjacentElement('afterend', manualPanel);
    }

    const menu = this.root.querySelector('#ugSimMenu');
    menu.innerHTML = '';

    const defaultSections = [
      'Visão Geral',
      'Turbina / Gerador',
      'Regulador de Velocidade',
      'Excitação',
      'Proteções',
      'Resfriamento',
      'Mancais',
      'Sistemas Auxiliares',
      'Alarmes / Eventos',
      'Partida / Parada'
    ];

    const sections = Array.from(new Set([
      ...(data.sections || defaultSections),
      'Sistemas Auxiliares'
    ]));

    sections.forEach(name => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = name;
      b.className = name === this.activeSection ? 'active' : '';
      b.addEventListener('click', () => {
        this.activeSection = name;
        this.render();
      });
      menu.appendChild(b);
    });
  }
};
