const outgoing = [
  ["52-21191", "Bomba motorizada do RV 1"],
  ["52-21192", "Bomba motorizada do RV 2"],
  ["52-21111", "Bomba de circulação de óleo do mancal escora 1"],
  ["52-21112", "Bomba de circulação de óleo do mancal escora 2"],
  ["52-21113", "Bomba de injeção de óleo do mancal escora 1"],
  ["52-21114", "Bomba de injeção de óleo do mancal escora 2"],
  ["52-21115", "Exaustor de vapor de óleo do mancal escora"],
  ["52-21116", "Bomba de circulação de óleo do MGS 1"],
  ["52-21117", "Bomba de circulação de óleo do MGS 2"],
  ["52-21118", "Bomba de circulação de óleo do MGI 1"],
  ["52-21119", "Bomba de circulação de óleo do MGI 2"],
  ["52-21120", "Bomba de injeção de água de selagem do eixo 1"],
  ["52-21121", "Bomba de injeção de água de selagem do eixo 2"],
  ["52-21122", "Bomba de drenagem da tampa da turbina"],
  ["52-21123", "Bomba motorizada do RV 3"],
  ["52-21124", "Exaustor de pó de freio 1"],
  ["52-21125", "Exaustor de pó de freio 2"],
  ["52-21126", "Exaustor de pó de freio 3"],
  ["52-21103", "Alimentação do GAE-1"],
  ["52-21127", "Reserva", false],
  ["52-21128", "Reserva", false],
  ["52-21129", "Reserva", false],
  ["52-21130", "CF-PSD-U01"],
  ["52-21131", "Reserva", false],
  ["52-21132", "Reserva", false],
  ["52-21133", "Bomba da unidade hidráulica da comporta 1"],
  ["52-21134", "Bomba da unidade hidráulica da comporta 2"],
  ["52-21151", "Resistência de aquecimento do gerador"],
  ["52-21152", "Reserva", false],
  ["52-21153", "CF-MCP-V-01 — compressor do RV"],
  ["52-21154", "CF-TUG-U01 — refrigeração do transformador"],
  ["52-21155", "Pré-excitação"],
  ["52-21156", "CF-PFA-U01 — controle dos filtros"],
  ["52-21157", "CF-QEX-U01 — ventilação do RTVX/conversor"],
  ["52-21158", "Reserva", false],
  ["52-21159", "Reserva", false],
  ["52-21160", "CF-PVR-U01 — válvulas motorizadas"],
  ["52-21161", "Painel do sistema de frenagem e levantamento"],
  ["52-21162", "Reserva", false],
  ["52-21163", "CF-qLF01-U01 — força e iluminação"]
].map(([id, label, closed = true]) => ({
  id,
  label,
  closed,
  available: true
}));

const panels = {
  "CCM-U01": {
      id: "CCM-U01",
      title: "CF-CCM-U01",
      subtitle: "Centro de Controle de Motores — Unidade 01",
      groupId: "P14_R14",
      loadId: "CCM-U01",
      voltage: "440 V",
      operationMode: "AUTO",
      normalIncoming: "52-21101",
      reserveIncoming: "52-21102",
      reserveDelay: "3 s",
      runtime: {
          initialized: false,
          normalAvailable: true,
          reserveAvailable: true,
          normalClosed: true,
          reserveClosed: false,
          transferring: false,
          events: []
      },
      arcFlash: {
          distance: "1,07 m",
          incidentEnergy: "2,3 cal/cm²",
          ppe: "Categoria 2"
      },
      outgoing
  }
};

export const PanelDetailDatabase = {
  has(id) {
      return Boolean(panels[String(id)]);
  },

  get(id) {
      return panels[String(id)] ?? null;
  },

  setMode(id, mode) {
      const panel = this.get(id);
      if (!panel) return false;
      panel.operationMode =
          String(mode).toUpperCase() === "MANUAL"
              ? "MANUAL"
              : "AUTO";
      return true;
  },

  toggleOutgoing(panelId, breakerId) {
      const panel = this.get(panelId);
      const breaker = panel?.outgoing.find(
          item => String(item.id) === String(breakerId)
      );

      if (!breaker || breaker.available === false) {
          return null;
      }

      breaker.closed = !breaker.closed;
      return breaker;
  },

  addEvent(panelId, equipment, message, type = "info") {
      const panel = this.get(panelId);
      if (!panel) return;

      panel.runtime.events.unshift({
          time: new Date().toLocaleTimeString("pt-BR"),
          equipment,
          message,
          type
      });

      panel.runtime.events = panel.runtime.events.slice(0, 12);
  },

  reset(panelId) {
      const panel = this.get(panelId);
      if (!panel) return false;

      Object.assign(panel.runtime, {
          initialized: true,
          normalAvailable: true,
          reserveAvailable: true,
          normalClosed: true,
          reserveClosed: false,
          transferring: false,
          events: []
      });

      panel.operationMode = "AUTO";
      panel.outgoing.forEach(item => {
          item.closed = item.label !== "Reserva";
      });

      this.addEvent(panelId, "SISTEMA", "CONDIÇÃO NORMAL RESTABELECIDA", "success");
      return true;
  }
};
