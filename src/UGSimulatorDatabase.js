export const UGSimulatorDatabase = {
  UG01: {
    label: 'UG-01', title: 'Turbina / Gerador', ratedVoltage: '14,4 kV', ratedSpeed: '85,7 rpm',
    sections: ['Visão Geral','Turbina / Gerador','Regulador de Velocidade','Excitação','Proteções','Resfriamento','Mancais','Alarmes / Eventos','Partida / Parada'],
    measurements: [
      ['Mancal de guia superior','Temperatura','-- °C'], ['Mancal de guia inferior','Temperatura','-- °C'],
      ['Mancal de escora','Temperatura','-- °C'], ['Óleo mancal combinado','Temperatura','-- °C'],
      ['Vibração vertical integrada','Nível','-- mm/s'], ['Rotação da unidade','Velocidade','-- rpm']
    ]
  },
  UG02: { label:'UG-02' }, UG11: { label:'UG-11' }, UG12: { label:'UG-12' }
};
