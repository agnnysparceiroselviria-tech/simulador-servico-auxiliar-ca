export const EventLog = {

  //==================================================
  // CONFIGURAÇÕES
  //==================================================

  containerId: "eventLogList",

  counterId: "eventLogCounter",

  maxEvents: 100,

  events: [],

  initialized: false,

  //==================================================
  // INICIALIZAÇÃO
  //==================================================

  initialize(
      containerId = "eventLogList",
      options = {}
  ) {

      this.containerId =
          containerId;

      if (options.counterId) {

          this.counterId =
              options.counterId;
      }

      if (
          Number.isInteger(
              options.maxEvents
          ) &&
          options.maxEvents >= 3
      ) {

          this.maxEvents =
              options.maxEvents;
      }

      const container =
          this.getContainer();

      if (!container) {

          console.warn(
              `[EventLog] Container #${this.containerId} não encontrado.`
          );

          return false;
      }

      this.initialized = true;

      this.events = [];

      container.innerHTML = "";

      this.updateCounter();

      this.add(
          "SISTEMA",
          "CENÁRIO 02 CARREGADO",
          "info"
      );

      return true;
  },

  //==================================================
  // OBTÉM ELEMENTOS DA INTERFACE
  //==================================================

  getContainer() {

      return document.getElementById(
          this.containerId
      );
  },

  getCounter() {

      return document.getElementById(
          this.counterId
      );
  },

  //==================================================
  // REGISTRA NOVO EVENTO
  //==================================================

  add(
      equipment,
      description,
      type = "info",
      options = {}
  ) {

      const normalizedEquipment =
          this.normalizeText(
              equipment,
              "SISTEMA"
          );

      const normalizedDescription =
          this.normalizeText(
              description,
              "EVENTO NÃO INFORMADO"
          );

      const normalizedType =
          this.normalizeType(
              type
          );

      const eventDate =
          options.date instanceof Date
              ? options.date
              : new Date();

      const event = {

          id:
              this.createId(),

          equipment:
              normalizedEquipment,

          description:
              normalizedDescription,

          type:
              normalizedType,

          timestamp:
              eventDate.getTime(),

          time:
              this.formatTime(
                  eventDate
              ),

          date:
              this.formatDate(
                  eventDate
              )
      };

      /*
       * O evento mais recente fica no início.
       */
      this.events.unshift(
          event
      );

      /*
       * Limita a quantidade de registros mantidos.
       */
      if (
          this.events.length >
          this.maxEvents
      ) {

          this.events =
              this.events.slice(
                  0,
                  this.maxEvents
              );
      }

      this.render();

      return event;
  },

  //==================================================
  // ATALHOS POR CATEGORIA
  //==================================================

  info(
      equipment,
      description,
      options = {}
  ) {

      return this.add(
          equipment,
          description,
          "info",
          options
      );
  },

  success(
      equipment,
      description,
      options = {}
  ) {

      return this.add(
          equipment,
          description,
          "success",
          options
      );
  },

  warning(
      equipment,
      description,
      options = {}
  ) {

      return this.add(
          equipment,
          description,
          "warning",
          options
      );
  },

  alarm(
      equipment,
      description,
      options = {}
  ) {

      return this.add(
          equipment,
          description,
          "alarm",
          options
      );
  },

  //==================================================
  // EVENTOS PADRÃO DOS DISJUNTORES
  //==================================================

  breakerOpened(
      breakerId,
      reason = ""
  ) {

      const normalizedId =
          this.normalizeBreakerId(
              breakerId
          );

      const normalizedReason =
          this.normalizeText(
              reason,
              ""
          );

      const description =
          normalizedReason
              ? `ABERTO — ${normalizedReason}`
              : "ABERTO";

      return this.alarm(
          `DJ ${normalizedId}`,
          description
      );
  },

  breakerClosed(
      breakerId
  ) {

      const normalizedId =
          this.normalizeBreakerId(
              breakerId
          );

      return this.success(
          `DJ ${normalizedId}`,
          "FECHADO"
      );
  },

  breakerAutomatic(
      breakerId
  ) {

      const normalizedId =
          this.normalizeBreakerId(
              breakerId
          );

      return this.warning(
          `DJ ${normalizedId}`,
          "OPERAÇÃO AUTOMÁTICA"
      );
  },

  breakerUndervoltageTrip(
      breakerId
  ) {

      const normalizedId =
          this.normalizeBreakerId(
              breakerId
          );

      return this.alarm(
          `DJ ${normalizedId}`,
          "ABERTO POR FALTA DE TENSÃO"
      );
  },

  breakerTrip(
      breakerId,
      reason = ""
  ) {

      const normalizedId =
          this.normalizeBreakerId(
              breakerId
          );

      const normalizedReason =
          this.normalizeText(
              reason,
              ""
          );

      const description =
          normalizedReason
              ? `TRIP — ${normalizedReason}`
              : "TRIP";

      return this.alarm(
          `DJ ${normalizedId}`,
          description
      );
  },

  breakerInterlocked(
      breakerId
  ) {

      const normalizedId =
          this.normalizeBreakerId(
              breakerId
          );

      return this.warning(
          `DJ ${normalizedId}`,
          "COMANDO BLOQUEADO POR INTERTRAVAMENTO"
      );
  },

  //==================================================
  // EVENTO POR ESTADO DO DISJUNTOR
  //==================================================

  breakerStateChanged(
      breakerId,
      state,
      options = {}
  ) {

      const normalizedState =
          String(
              state ?? ""
          )
              .trim()
              .toLowerCase();

      switch (normalizedState) {

          case "open":

              return this.breakerOpened(
                  breakerId,
                  options.reason ?? ""
              );

          case "closed":

              return this.breakerClosed(
                  breakerId
              );

          case "openauto":

          case "closedauto":

              return this.breakerAutomatic(
                  breakerId
              );

          case "closedundervoltagetrip":

          case "undervoltagetrip":

              return this.breakerUndervoltageTrip(
                  breakerId
              );

          case "tripped":

          case "trip":

              return this.breakerTrip(
                  breakerId,
                  options.reason ?? ""
              );

          case "interlocked":

              return this.breakerInterlocked(
                  breakerId
              );

          default:

              return this.info(
                  `DJ ${this.normalizeBreakerId(breakerId)}`,
                  `ESTADO ALTERADO PARA ${String(state).toUpperCase()}`
              );
      }
  },

  //==================================================
  // RENDERIZAÇÃO
  //==================================================

  render() {

      const container =
          this.getContainer();

      if (!container) {

          if (this.initialized) {

              console.warn(
                  `[EventLog] Container #${this.containerId} indisponível.`
              );
          }

          return;
      }

      const fragment =
          document.createDocumentFragment();

      this.events.forEach(event => {

          fragment.appendChild(
              this.createEventElement(
                  event
              )
          );
      });

      container.replaceChildren(
          fragment
      );

      /*
       * O registro mais recente fica no topo.
       */
      container.scrollTop = 0;

      this.updateCounter();
  },

  //==================================================
  // CRIA O ELEMENTO VISUAL DO EVENTO
  //==================================================

  createEventElement(event) {

      const item =
          document.createElement(
              "div"
          );

      item.className =
          [
              "eventItem",
              this.getTypeClass(
                  event.type
              )
          ].join(" ");

      item.dataset.eventId =
          event.id;

      item.dataset.eventType =
          event.type;

      item.title =
          `${event.date} ${event.time} — ` +
          `${event.equipment} — ` +
          `${event.description}`;

      const time =
          document.createElement(
              "span"
          );

      time.className =
          "eventTime";

      time.textContent =
          event.time;

      const equipment =
          document.createElement(
              "span"
          );

      equipment.className =
          "eventEquipment";

      equipment.textContent =
          event.equipment;

      const description =
          document.createElement(
              "span"
          );

      description.className =
          "eventDescription";

      description.textContent =
          event.description;

      item.append(
          time,
          equipment,
          description
      );

      return item;
  },

  //==================================================
  // ATUALIZA CONTADOR
  //==================================================

  updateCounter() {

      const counter =
          this.getCounter();

      if (!counter) {
          return;
      }

      const total =
          this.events.length;

      counter.textContent =
          total === 1
              ? "1 EVENTO"
              : `${total} EVENTOS`;
  },

  //==================================================
  // CLASSE CSS POR TIPO
  //==================================================

  getTypeClass(type) {

      const classes = {

          info:
              "eventInfo",

          success:
              "eventInfo",

          warning:
              "eventWarning",

          alarm:
              "eventAlarm"
      };

      return (
          classes[type] ??
          classes.info
      );
  },

  //==================================================
  // NORMALIZAÇÃO DO TIPO
  //==================================================

  normalizeType(type) {

      const value =
          String(
              type ?? ""
          )
              .trim()
              .toLowerCase();

      const allowedTypes = [
          "info",
          "success",
          "warning",
          "alarm"
      ];

      return allowedTypes.includes(
          value
      )
          ? value
          : "info";
  },

  //==================================================
  // NORMALIZAÇÃO DO ID DO DISJUNTOR
  //==================================================

  normalizeBreakerId(breakerId) {

      const value =
          String(
              breakerId ?? ""
          )
              .trim()
              .replace(
                  /^DJ\s*/i,
                  ""
              );

      return (
          value ||
          "NÃO IDENTIFICADO"
      );
  },

  //==================================================
  // NORMALIZAÇÃO DE TEXTO
  //==================================================

  normalizeText(
      value,
      fallback
  ) {

      const text =
          String(
              value ?? ""
          )
              .trim()
              .replace(
                  /\s+/g,
                  " "
              );

      return (
          text ||
          fallback
      );
  },

  //==================================================
  // FORMATAÇÃO DO HORÁRIO
  //==================================================

  formatTime(date) {

      return date.toLocaleTimeString(
          "pt-BR",
          {
              hour:
                  "2-digit",

              minute:
                  "2-digit",

              second:
                  "2-digit",

              hour12:
                  false
          }
      );
  },

  //==================================================
  // FORMATAÇÃO DA DATA
  //==================================================

  formatDate(date) {

      return date.toLocaleDateString(
          "pt-BR",
          {
              day:
                  "2-digit",

              month:
                  "2-digit",

              year:
                  "numeric"
          }
      );
  },

  //==================================================
  // CRIA IDENTIFICADOR ÚNICO
  //==================================================

  createId() {

      if (
          typeof crypto !== "undefined" &&
          typeof crypto.randomUUID === "function"
      ) {

          return crypto.randomUUID();
      }

      return [
          Date.now(),
          Math.random()
              .toString(16)
              .slice(2)
      ].join("-");
  },

  //==================================================
  // REMOVE UM EVENTO
  //==================================================

  remove(eventId) {

      const previousLength =
          this.events.length;

      this.events =
          this.events.filter(
              event =>
                  event.id !== eventId
          );

      if (
          this.events.length ===
          previousLength
      ) {

          return false;
      }

      this.render();

      return true;
  },

  //==================================================
  // LIMPA TODOS OS EVENTOS
  //==================================================

  clear(
      createSystemEvent = false
  ) {

      this.events = [];

      this.render();

      if (createSystemEvent) {

          this.info(
              "SISTEMA",
              "LISTA DE EVENTOS LIMPA"
          );
      }
  },

  //==================================================
  // RETORNA CÓPIA DOS EVENTOS
  //==================================================

  getEvents() {

      return this.events.map(
          event => ({
              ...event
          })
      );
  },

  //==================================================
  // ALTERA LIMITE DE EVENTOS
  //==================================================

  setMaxEvents(value) {

      const parsedValue =
          Number.parseInt(
              value,
              10
          );

      if (
          !Number.isFinite(
              parsedValue
          ) ||
          parsedValue < 3
      ) {

          console.warn(
              "[EventLog] O limite mínimo é de 3 eventos."
          );

          return false;
      }

      this.maxEvents =
          parsedValue;

      if (
          this.events.length >
          this.maxEvents
      ) {

          this.events =
              this.events.slice(
                  0,
                  this.maxEvents
              );

          this.render();
      }

      return true;
  },

  //==================================================
  // ENCERRAMENTO
  //==================================================

  destroy() {

      this.events = [];

      this.initialized = false;

      const container =
          this.getContainer();

      if (container) {

          container.innerHTML = "";
      }

      this.updateCounter();
  }
};