const load = (id, label, options = {}) => ({
    id,
    label,
    closed: options.closed ?? !/^Reserva$/i.test(label),
    reserve: options.reserve ?? /^Reserva$/i.test(label),
    available: options.available ?? true,
    openSymbol: options.openSymbol ?? "automatic"
});

const loads = items =>
    items.map(([id, label, options]) => load(id, label, options));

const cmMachineLoads = ({
    disabledCompressor = "Reserva",
    compressorLabel = "Compressor do Regulador de Velocidade"
} = {}) => loads([
    ["1C", "TRAFO de controle e rel\u00E9s de m\u00EDnima tens\u00E3o (principal e reserva)"],
    ["2A", "Bomba 1 - Regulador de Velocidade"],
    ["2B", "Bomba 2 - Regulador de Velocidade"],
    ["2C", "Comporta de Emerg\u00EAncia - Tomada d'\u00C1gua"],
    ["2D", disabledCompressor, {
        closed: disabledCompressor === "Reserva" ? false : true,
        reserve: disabledCompressor === "Reserva"
    }],
    ["2E", "Pr\u00E9-excita\u00E7\u00E3o"],
    ["2F", "Sistema de Resfriamento - Transformador 170 MVA"],
    ["3A", "Bomba 1 - Sistema de Inje\u00E7\u00E3o - Mancal de Escora"],
    ["3B", "Bomba 2 - Sistema de Inje\u00E7\u00E3o - Mancal de Escora"],
    ["3C", "Resistor de Aquecimento do Gerador"],
    ["3D", compressorLabel],
    ["3E", "Bomba 1 - Circula\u00E7\u00E3o de \u00D3leo - Mancal Combinado"],
    ["3F", "Bomba 2 - Circula\u00E7\u00E3o de \u00D3leo - Mancal Combinado"],
    ["3G", "QDRO QC e RTVX"],
    ["4A", "V\u00E1lvula Motorizada / Recupera\u00E7\u00E3o de \u00D3leo MC / Exaustor QCT"],
    ["4B", "Bomba Macaco Hidr\u00E1ulico"],
    ["4C", "Bomba do Sistema de Lubrifica\u00E7\u00E3o - Graxa"],
    ["4D", "Bomba 1 - Circula\u00E7\u00E3o de \u00D3leo - Mancal Guia Inferior"],
    ["4E", "Bomba 2 - Circula\u00E7\u00E3o de \u00D3leo - Mancal Guia Inferior"],
    ["4F", "Exaustor de Vapores - Mancal de Escora"]
]);

const panels = {
    "CM-02": {
        id: "CM-02",
        title: "CM-02",
        subtitle: "Centro de M\u00E1quinas \u2022 Sala de M\u00E1quinas",
        voltage: "440 V",
        location: "cota 281,00",
        revision: "Mar\u00E7o / 2024",
        normal: {
            sourcePanel: "CF-pCA-P14",
            qp: "1QP - B-I",
            sourceBreaker: "1752-115",
            transformer: "CF-TSA-P14",
            transformerVoltage: "14,4 / 0,46 kV \u2022 1500 kVA",
            transformerBreaker: "52-E1",
            feederBreaker: "52-2",
            incomingBreaker: "1752-211",
            color: "#3f7cff"
        },
        reserve: {
            sourcePanel: "CF-pCA-R14",
            qp: "1QP - B-III",
            sourceBreaker: "1752-123",
            transformer: "CF-TSA-R14",
            transformerVoltage: "14,4 / 0,46 kV \u2022 1500 kVA",
            transformerBreaker: "52-E1",
            feederBreaker: "52-2",
            incomingBreaker: "1752-210",
            color: "#3dbb5a"
        },
        reserveDelaySeconds: 3,
        dcSupplies: [
            "72-93 - CF-pCC-P14 (125 Vcc)",
            "72-93 - CF-pCC-R14 (125 Vcc)"
        ],
        arcFlash: {
            distance: "1,417 m",
            energy: "7,7 cal/cm\u00B2",
            ppe: "RISCO 2"
        },
        outgoing: loads([
            ["1C", "TRAFO de Controle e Rel\u00E9s de M\u00EDnima Tens\u00E3o (Princ. e Reserva)"],
            ["2B", "Bomba 1 - Regulador de Velocidade"],
            ["2C", "Bomba 2 - Regulador de Velocidade"],
            ["3A", "Comporta de Emerg\u00EAncia - Tomada d'\u00C1gua"],
            ["3B", "Sistema de Resfriamento - Transformador 170 MVA"],
            ["3C", "Pr\u00E9-excita\u00E7\u00E3o"],
            ["3D", "Reserva"],
            ["4A", "Bomba 1 - Sistema de Inje\u00E7\u00E3o - Mancal de Escora"],
            ["4B", "Reserva"],
            ["2A", "GAE-1", { closed: false, openSymbol: "preselection" }],
            ["4C", "Resistor de Aquecimento do Gerador"],
            ["4D", "Bomba 2 - Sistema de Inje\u00E7\u00E3o - Mancal de Escora"],
            ["4E", "Bomba 1 - Circula\u00E7\u00E3o de \u00D3leo - Mancal de Escora"],
            ["4F", "Bomba 2 - Circula\u00E7\u00E3o de \u00D3leo - Mancal de Escora"],
            ["5A", "Compressor do Regulador de Velocidade"],
            ["5B", "Bomba Macaco Hidr\u00E1ulico"],
            ["5C", "Bomba do Sistema de Lubrifica\u00E7\u00E3o - Graxa"],
            ["5D", "V\u00E1lvula Motorizada"],
            ["5E", "QDRO QC e RTVX"],
            ["5F", "Reserva"]
        ])
    },

    "CCM-U03": {
        id: "CCM-U03",
        title: "CF-CCM-U03",
        subtitle: "Centro de Controle de Motores da Unidade Geradora 03",
        voltage: "460 V",
        location: "cota 281,00 \u2022 Sala de M\u00E1quinas",
        revision: "Mar\u00E7o / 2024",
        normal: {
            sourcePanel: "CF-pCA-P14",
            qp: "1QP - B-I",
            sourceBreaker: "1752-115",
            transformer: "CF-TSA-P14",
            transformerVoltage: "14,4 / 0,44 kV \u2022 1500 kVA",
            transformerBreaker: "52-E1",
            feederBreaker: "52-3",
            incomingBreaker: "52-E1",
            color: "#3f7cff"
        },
        reserve: {
            sourcePanel: "CF-pCA-R14",
            qp: "1QP - B-III",
            sourceBreaker: "1752-123",
            transformer: "CF-TSA-R14",
            transformerVoltage: "14,4 / 0,44 kV \u2022 1500 kVA",
            transformerBreaker: "52-E1",
            feederBreaker: "52-3",
            incomingBreaker: "52-E2",
            color: "#3dbb5a"
        },
        reserveDelaySeconds: 3,
        dcSupplies: [
            "72-76 - CF-pCC-P14 (125 Vcc)",
            "72-76 - CF-pCC-R14 (125 Vcc)"
        ],
        arcFlash: {
            distance: "0,61 m",
            energy: "2,43 cal/cm\u00B2",
            ppe: "RISCO 2"
        },
        outgoing: loads([
            ["52-01", "Regulador de Velocidade - Bomba 1"],
            ["52-02", "Regulador de Velocidade - Bomba 2"],
            ["52-03", "MET - Circula\u00E7\u00E3o de \u00D3leo - Bomba 1"],
            ["52-04", "MET - Circula\u00E7\u00E3o de \u00D3leo - Bomba 2"],
            ["52-05", "MGT - Circula\u00E7\u00E3o de \u00D3leo - Bomba 1"],
            ["52-06", "MGT - Circula\u00E7\u00E3o de \u00D3leo - Bomba 2"],
            ["52-07", "Sistema de Inje\u00E7\u00E3o de Alta Press\u00E3o - Bomba 1"],
            ["52-08", "Sistema de Inje\u00E7\u00E3o de Alta Press\u00E3o - Bomba 2"],
            ["52-09", "MGG - Circula\u00E7\u00E3o de \u00D3leo - Bomba 1"],
            ["52-10", "MGG - Circula\u00E7\u00E3o de \u00D3leo - Bomba 2"],
            ["52-11", "Bomba de Drenagem da Regi\u00E3o do Mecanismo"],
            ["52-12", "Exaustor de Vapor de \u00D3leo"],
            ["52-13", "Exaustor de P\u00F3 de Freio 1"],
            ["52-14", "Exaustor de P\u00F3 de Freio 2"],
            ["52-15", "Exaustor de P\u00F3 de Freio 3"],
            ["52-16", "Compressor de Ar - Regulador de Velocidade"],
            ["52-17", "Trocador de Calor - Regulador de Velocidade - Bomba 3"],
            ["52-18", "Reserva"],
            ["52-19", "Reserva"],
            ["52-20", "Reserva"],
            ["52-21", "Reserva"],
            ["52-22", "Reserva"],
            ["52-23", "RTVX e Ventila\u00E7\u00E3o"],
            ["52-24", "Sistema de Refrigera\u00E7\u00E3o - Transformador"],
            ["52-25", "Sistema de \u00C1gua de Resfriamento - Filtro"],
            ["52-26", "Sistema de \u00C1gua de Resfriamento - V\u00E1lvula Motorizada"],
            ["52-27", "CF-qLF01-03 - Ilumina\u00E7\u00E3o e Resist\u00EAncia de Aquecimento / 20AQS"],
            ["52-28", "Unidade Hidr\u00E1ulica da Comporta de Emerg\u00EAncia - Bombas 1 e 2"],
            ["52-29", "Compressor de Carga Parcial"],
            ["52-30", "Sistema de Frenagem e Levantamento do Rotor"],
            ["52-31", "Reserva"],
            ["52-32", "Sistema de Excita\u00E7\u00E3o Inicial"],
            ["52-33", "Reserva"],
            ["52-34", "Veda\u00E7\u00E3o do Eixo - Bomba 1"],
            ["52-35", "Veda\u00E7\u00E3o do Eixo - Bomba 2"]
        ])
    },

    "CCM-U04": {
        id: "CCM-U04",
        title: "CF-CCM-U04",
        subtitle: "Centro de Controle de Motores da Unidade Geradora 04",
        voltage: "460 V",
        location: "cota 281,00 \u2022 Sala de M\u00E1quinas",
        revision: "Mar\u00E7o / 2024",
        normal: {
            sourcePanel: "CF-pCA-R14",
            qp: "1QP - B-III",
            sourceBreaker: "1752-123",
            transformer: "CF-TSA-R14",
            transformerVoltage: "14,4 / 0,46 kV \u2022 1500 kVA",
            transformerBreaker: "52-E1",
            feederBreaker: "52-4",
            incomingBreaker: "52-21402",
            color: "#3dbb5a"
        },
        reserve: {
            sourcePanel: "CF-pCA-P14",
            qp: "1QP - B-I",
            sourceBreaker: "1752-115",
            transformer: "CF-TSA-P14",
            transformerVoltage: "14,4 / 0,46 kV \u2022 1500 kVA",
            transformerBreaker: "52-E1",
            feederBreaker: "52-4",
            incomingBreaker: "52-21401",
            color: "#3f7cff"
        },
        reserveDelaySeconds: 3,
        dcSupplies: [
            "72-59 - CF-pCC-P14 (125 Vcc)",
            "72-59 - CF-pCC-R14 (125 Vcc)"
        ],
        arcFlash: {
            distance: "1,359 m",
            energy: "7,2 cal/cm\u00B2",
            ppe: "RISCO 2"
        },
        outgoing: loads([
            ["52-21491", "Regulador de Velocidade - Bomba 1"],
            ["52-21492", "Regulador de Velocidade - Bomba 2"],
            ["52-21411", "Mancal Escora - Bomba de Circula\u00E7\u00E3o 1"],
            ["52-21412", "Mancal Escora - Bomba de Circula\u00E7\u00E3o 2"],
            ["52-21413", "Mancal Escora - Bomba de Inje\u00E7\u00E3o de Alta Press\u00E3o 1"],
            ["52-21414", "Mancal Escora - Bomba de Inje\u00E7\u00E3o de Alta Press\u00E3o 2"],
            ["52-21415", "Mancal Escora - Exaustor de Vapor de \u00D3leo"],
            ["52-21416", "Mancal Guia Inferior - Bomba de Circula\u00E7\u00E3o 1"],
            ["52-21417", "Mancal Guia Inferior - Bomba de Circula\u00E7\u00E3o 2"],
            ["52-21418", "Veda\u00E7\u00E3o do Eixo - Bomba de Inje\u00E7\u00E3o de \u00C1gua 1"],
            ["52-21419", "Veda\u00E7\u00E3o do Eixo - Bomba de Inje\u00E7\u00E3o de \u00C1gua 2"],
            ["52-21420", "Drenagem da Tampa - Bomba de Emerg\u00EAncia"],
            ["52-21421", "Mancal Combinado - Bomba do Tanque de Coleta de \u00D3leo"],
            ["52-21422", "Reserva"],
            ["52-21423", "Coletor de P\u00F3 de Freio 1"],
            ["52-21424", "Coletor de P\u00F3 de Freio 2"],
            ["52-21425", "Coletor de P\u00F3 de Freio 3"],
            ["52-21426", "Motor do Trocador do Regulador de Velocidade"],
            ["52-21427", "Reserva"],
            ["52-21428", "Reserva"],
            ["52-21429", "Reserva"],
            ["52-21430", "Reserva"],
            ["52-21431", "MGS - Circula\u00E7\u00E3o de \u00D3leo - Bomba 1"],
            ["52-21432", "MGS - Circula\u00E7\u00E3o de \u00D3leo - Bomba 2"],
            ["52-21433", "Reserva"],
            ["52-21434", "Reserva"],
            ["52-21451", "Quadro de For\u00E7a e Ilumina\u00E7\u00E3o da Unidade"],
            ["52-21452", "Painel de Comando do Compressor U04"],
            ["52-21453", "Bombas 1 e 2 - Unidade Hidr\u00E1ulica da Comporta"],
            ["52-21454", "Sistema de Refrigera\u00E7\u00E3o do Transformador"],
            ["52-21455", "Pr\u00E9-excita\u00E7\u00E3o da Unidade 04"],
            ["52-21456", "Sistema de \u00C1gua de Resfriamento - Filtro"],
            ["52-21457", "Ventila\u00E7\u00E3o e Conversor CA-CC do RTVX"],
            ["52-21458", "Reserva"],
            ["52-21459", "Reserva"],
            ["52-21460", "Sistema de \u00C1gua de Resfriamento - V\u00E1lvulas Motorizadas"],
            ["52-21461", "Frenagem e Levantamento do Gerador - Bomba de \u00D3leo"],
            ["52-21462", "Seccionadora Terra", { closed: false }]
        ])
    },

    "CM-05": {
        id: "CM-05",
        title: "CM-05",
        subtitle: "Centro de M\u00E1quinas \u2022 Sala de M\u00E1quinas",
        voltage: "440 V",
        location: "cota 281,00",
        revision: "Mar\u00E7o / 2024",
        normal: {
            sourcePanel: "CF-pCA-P58",
            qp: "1QP - B-III",
            sourceBreaker: "1752-124",
            transformer: "CF-TSA-P58",
            transformerVoltage: "14,4 / 0,46 kV \u2022 1500 kVA",
            transformerBreaker: "52-E1",
            feederBreaker: "52-1",
            incomingBreaker: "1752-216",
            color: "#ff31c7"
        },
        reserve: {
            sourcePanel: "CF-pCA-R58",
            qp: "1QP - B-II",
            sourceBreaker: "1752-122",
            transformer: "CF-TSA-R58",
            transformerVoltage: "14,4 / 0,46 kV \u2022 1500 kVA",
            transformerBreaker: "52-E1",
            feederBreaker: "52-1",
            incomingBreaker: "1752-217",
            color: "#3dbb5a"
        },
        reserveDelaySeconds: 3,
        dcSupplies: [
            "72-33 - CF-pCC-P58 (125 Vcc)",
            "72-33 - CF-pCC-R58 (125 Vcc)"
        ],
        arcFlash: {
            distance: "1,235 m",
            energy: "6,2 cal/cm\u00B2",
            ppe: "RISCO 2"
        },
        outgoing: cmMachineLoads({
            disabledCompressor: "CP-21 (Desativado)",
            compressorLabel: "CF-MCP-U05 - Compressor de Ar do Regulador de Velocidade"
        })
    },

    "CM-06": {
        id: "CM-06",
        title: "CM-06",
        subtitle: "Centro de M\u00E1quinas \u2022 Sala de M\u00E1quinas",
        voltage: "440 V",
        location: "cota 281,00",
        revision: "Mar\u00E7o / 2024",
        normal: {
            sourcePanel: "CF-pCA-P58",
            qp: "1QP - B-III",
            sourceBreaker: "1752-124",
            transformer: "CF-TSA-P58",
            transformerVoltage: "14,4 / 0,46 kV \u2022 1500 kVA",
            transformerBreaker: "52-E1",
            feederBreaker: "52-2",
            incomingBreaker: "1752-219",
            color: "#ff31c7"
        },
        reserve: {
            sourcePanel: "CF-pCA-R58",
            qp: "1QP - B-II",
            sourceBreaker: "1752-122",
            transformer: "CF-TSA-R58",
            transformerVoltage: "14,4 / 0,46 kV \u2022 1500 kVA",
            transformerBreaker: "52-E1",
            feederBreaker: "52-2",
            incomingBreaker: "1752-218",
            color: "#3dbb5a"
        },
        reserveDelaySeconds: 3,
        dcSupplies: [
            "72-93 - CF-pCC-P58 (125 Vcc)",
            "72-93 - CF-pCC-R58 (125 Vcc)"
        ],
        arcFlash: {
            distance: "1,338 m",
            energy: "7,0 cal/cm\u00B2",
            ppe: "RISCO 2"
        },
        outgoing: cmMachineLoads()
    },

    "CCM-U07": {
        id: "CCM-U07",
        title: "CF-CCM-U07",
        subtitle: "Centro de Controle de Motores da Unidade Geradora 07",
        voltage: "460 V",
        location: "cota 281,00 \u2022 Sala de M\u00E1quinas",
        revision: "Abril / 2024",
        normal: {
            sourcePanel: "CF-pCA-P58",
            qp: "1QP - B-III",
            sourceBreaker: "1752-124",
            transformer: "CF-TSA-P58",
            transformerVoltage: "14,4 / 0,44 kV \u2022 1500 kVA",
            transformerBreaker: "52-E1",
            feederBreaker: "52-3",
            incomingBreaker: "52-E1",
            color: "#ff31c7"
        },
        reserve: {
            sourcePanel: "CF-pCA-R58",
            qp: "1QP - B-II",
            sourceBreaker: "1752-122",
            transformer: "CF-TSA-R58",
            transformerVoltage: "14,4 / 0,44 kV \u2022 1500 kVA",
            transformerBreaker: "52-E1",
            feederBreaker: "52-3",
            incomingBreaker: "52-E2",
            color: "#3dbb5a"
        },
        reserveDelaySeconds: 3,
        dcSupplies: [
            "72-75 - CF-pCC-P58 (125 Vcc)",
            "72-75 - CF-pCC-R58 (125 Vcc)"
        ],
        arcFlash: {
            distance: "0,61 m",
            energy: "2,43 cal/cm\u00B2",
            ppe: "RISCO 2"
        },
        outgoing: loads([
            ["52-01", "Regulador de Velocidade - Bomba 1"],
            ["52-02", "Regulador de Velocidade - Bomba 2"],
            ["52-03", "MGT - Circula\u00E7\u00E3o de \u00D3leo - Bomba 1"],
            ["52-04", "MGT - Circula\u00E7\u00E3o de \u00D3leo - Bomba 2"],
            ["52-05", "MCT - Circula\u00E7\u00E3o de \u00D3leo - Bomba 1"],
            ["52-06", "MCT - Circula\u00E7\u00E3o de \u00D3leo - Bomba 2"],
            ["52-07", "Sistema de Inje\u00E7\u00E3o de Alta Press\u00E3o - Bomba 1"],
            ["52-08", "Sistema de Inje\u00E7\u00E3o de Alta Press\u00E3o - Bomba 2"],
            ["52-09", "MCT - Sistema de Recupera\u00E7\u00E3o de \u00D3leo"],
            ["52-10", "Bomba de Drenagem da Regi\u00E3o do Mecanismo"],
            ["52-11", "Exaustor de Vapor de \u00D3leo"],
            ["52-12", "Exaustor de P\u00F3 de Freio 1"],
            ["52-13", "Exaustor de P\u00F3 de Freio 2"],
            ["52-14", "Exaustor de P\u00F3 de Freio 3"],
            ["52-15", "Exaustor de P\u00F3 de Freio 4"],
            ["52-16", "Compressor de Ar - Regulador de Velocidade"],
            ["52-17", "Reserva"],
            ["52-18", "Reserva"],
            ["52-19", "Reserva"],
            ["52-20", "Reserva"],
            ["52-21", "Reserva"],
            ["52-22", "Reserva"],
            ["52-23", "RTVX e Ventila\u00E7\u00E3o"],
            ["52-24", "Sistema de Refrigera\u00E7\u00E3o - Transformador"],
            ["52-25", "Sistema de \u00C1gua de Resfriamento - Filtro"],
            ["52-26", "Sistema de \u00C1gua de Resfriamento - V\u00E1lvula Motorizada"],
            ["52-27", "CF-qLF01-07 - Ilumina\u00E7\u00E3o e Resist\u00EAncia de Aquecimento"],
            ["52-28", "Unidade Hidr\u00E1ulica da Comporta de Emerg\u00EAncia - Bombas 1 e 2"],
            ["52-29", "Sistema de Frenagem e Levantamento do Rotor"],
            ["52-30", "Reserva"],
            ["52-31", "Reserva"],
            ["52-32", "Sistema de Excita\u00E7\u00E3o Inicial"],
            ["52-33", "Reserva"],
            ["52-34", "Veda\u00E7\u00E3o do Eixo - Bomba 1"],
            ["52-35", "Veda\u00E7\u00E3o do Eixo - Bomba 2"]
        ])
    },

    "CM-08": {
        id: "CM-08",
        title: "CM-08",
        subtitle: "Centro de M\u00E1quinas \u2022 Sala de M\u00E1quinas",
        voltage: "440 V",
        location: "cota 281,00",
        revision: "Abril / 2024",
        normal: {
            sourcePanel: "CF-pCA-P58",
            qp: "1QP - B-III",
            sourceBreaker: "1752-124",
            transformer: "CF-TSA-P58",
            transformerVoltage: "14,4 / 0,46 kV \u2022 1500 kVA",
            transformerBreaker: "52-E1",
            feederBreaker: "52-4",
            incomingBreaker: "1752-223",
            color: "#ff31c7"
        },
        reserve: {
            sourcePanel: "CF-pCA-R58",
            qp: "1QP - B-II",
            sourceBreaker: "1752-122",
            transformer: "CF-TSA-R58",
            transformerVoltage: "14,4 / 0,46 kV \u2022 1500 kVA",
            transformerBreaker: "52-E1",
            feederBreaker: "52-4",
            incomingBreaker: "1752-222",
            color: "#3dbb5a"
        },
        reserveDelaySeconds: 3,
        dcSupplies: [
            "72-59 - CF-pCC-P58 (125 Vcc)",
            "72-59 - CF-pCC-R58 (125 Vcc)"
        ],
        arcFlash: {
            distance: "1,282 m",
            energy: "6,5 cal/cm\u00B2",
            ppe: "RISCO 2"
        },
        outgoing: cmMachineLoads({
            disabledCompressor: "CP-08 (Desativado)"
        })
    },

    "CCM-U09": {
        id: "CCM-U09",
        title: "CF-CCM-U09",
        subtitle: "Centro de Controle de Motores da Unidade Geradora 09",
        voltage: "460 V",
        location: "cota 281,00 \u2022 Sala de M\u00E1quinas",
        revision: "Abril / 2024",
        normal: {
            sourcePanel: "CF-pCA-P0912",
            qp: "3QP - B-I",
            sourceBreaker: "1752-132",
            transformer: "CF-TSA-P0912",
            transformerVoltage: "14,4 / 0,46 kV \u2022 1500 kVA",
            transformerBreaker: "52-20501",
            feederBreaker: "52-20511",
            incomingBreaker: "52-21901",
            color: "#ff31c7"
        },
        reserve: {
            sourcePanel: "CF-pCA-R0912",
            qp: "3QP - B-III",
            sourceBreaker: "1752-143",
            transformer: "CF-TSA-R0912",
            transformerVoltage: "14,4 / 0,46 kV \u2022 1500 kVA",
            transformerBreaker: "52-20601",
            feederBreaker: "52-20611",
            incomingBreaker: "52-21902",
            color: "#3dbb5a"
        },
        reserveDelaySeconds: 3,
        dcSupplies: [
            "72-10541 - CF-pCC-P0912 (125 Vcc)",
            "72-10641 - CF-pCC-R0912 (125 Vcc)"
        ],
        arcFlash: {
            distance: "0,61 m",
            energy: "2,54 cal/cm\u00B2",
            ppe: "RISCO 2"
        },
        outgoing: loads([
            ["52-21991", "Regulador de Velocidade - Bomba 1"],
            ["52-21992", "Regulador de Velocidade - Bomba 2"],
            ["52-21911", "Mancal Combinado - Circula\u00E7\u00E3o de \u00D3leo - Bomba 1"],
            ["52-21912", "Mancal Combinado - Circula\u00E7\u00E3o de \u00D3leo - Bomba 2"],
            ["52-21913", "Mancal Escora - Inje\u00E7\u00E3o de Alta Press\u00E3o - Bomba 1"],
            ["52-21914", "Mancal Escora - Inje\u00E7\u00E3o de Alta Press\u00E3o - Bomba 2"],
            ["52-21915", "Mancal Combinado - Exaustor de Vapor de \u00D3leo"],
            ["52-21916", "Mancal de Guia Inferior - Bomba de Circula\u00E7\u00E3o 1"],
            ["52-21917", "Mancal de Guia Inferior - Bomba de Circula\u00E7\u00E3o 2"],
            ["52-21918", "Veda\u00E7\u00E3o do Eixo - Inje\u00E7\u00E3o de \u00C1gua - Bomba 1"],
            ["52-21919", "Veda\u00E7\u00E3o do Eixo - Inje\u00E7\u00E3o de \u00C1gua - Bomba 2"],
            ["52-21920", "Bomba de Drenagem da Tampa da Turbina"],
            ["52-21921", "Mancal Combinado - Bomba do Tanque de Coleta de \u00D3leo"],
            ["52-21922", "Reserva"],
            ["52-21923", "Frenagem e Levantamento - Coletor de P\u00F3 de Freio 1"],
            ["52-21924", "Frenagem e Levantamento - Coletor de P\u00F3 de Freio 2"],
            ["52-21925", "Frenagem e Levantamento - Coletor de P\u00F3 de Freio 3"],
            ["52-21926", "Frenagem e Levantamento - Coletor de P\u00F3 de Freio 4"],
            ["52-21927", "Reserva"],
            ["52-21928", "Reserva"],
            ["52-21929", "Reserva"],
            ["52-21930", "Reserva"],
            ["52-21931", "Reserva"],
            ["52-21932", "Reserva"],
            ["52-21933", "Reserva"],
            ["52-21934", "Reserva"],
            ["52-21951", "CF-qLF01-U09 - Quadro de For\u00E7a e Ilumina\u00E7\u00E3o"],
            ["52-21952", "CF-MCP-U09 - Compressor de Ar do Regulador de Velocidade"],
            ["52-21953", "Bombas 1 e 2 - Unidade Hidr\u00E1ulica da Comporta"],
            ["52-21954", "Sistema de Refrigera\u00E7\u00E3o do Transformador"],
            ["52-21955", "Pr\u00E9-excita\u00E7\u00E3o da Unidade"],
            ["52-21956", "Sistema de \u00C1gua de Resfriamento - Filtro"],
            ["52-21957", "Ventila\u00E7\u00E3o e Conversor CA-CC do RTVX"],
            ["52-21958", "Reserva"],
            ["52-21959", "Reserva"],
            ["52-21960", "Sistema de \u00C1gua de Resfriamento - V\u00E1lvulas Motorizadas"],
            ["52-21961", "Frenagem e Levantamento do Gerador - Bomba de \u00D3leo"],
            ["52-21962", "Seccionadora Faca Terra 1729-17 - Cabos desconectados", { closed: false }]
        ])
    },

    "CM-10": {
        id: "CM-10",
        title: "CM-10",
        subtitle: "Centro de M\u00E1quinas \u2022 Sala de M\u00E1quinas",
        voltage: "440 V",
        location: "cota 281,00",
        revision: "Abril / 2024",
        normal: {
            sourcePanel: "CF-pCA-P0912",
            qp: "3QP - B-I",
            sourceBreaker: "1752-132",
            transformer: "CF-TSA-P0912",
            transformerVoltage: "14,4 / 0,46 kV \u2022 1500 kVA",
            transformerBreaker: "52-20501",
            feederBreaker: "52-20512",
            incomingBreaker: "1752-227",
            color: "#ff31c7"
        },
        reserve: {
            sourcePanel: "CF-pCA-R0912",
            qp: "3QP - B-III",
            sourceBreaker: "1752-143",
            transformer: "CF-TSA-R0912",
            transformerVoltage: "14,4 / 0,46 kV \u2022 1500 kVA",
            transformerBreaker: "52-20601",
            feederBreaker: "52-20612",
            incomingBreaker: "1752-226",
            color: "#3dbb5a"
        },
        reserveDelaySeconds: 3,
        dcSupplies: [
            "3qc-2 (125 Vcc)",
            "3qc-1 (125 Vcc)"
        ],
        arcFlash: {
            distance: "1,33 m",
            energy: "6,9 cal/cm\u00B2",
            ppe: "RISCO 2"
        },
        outgoing: cmMachineLoads({
            disabledCompressor: "Compressor CP-10 (Desativado)"
        })
    },

    "CM-11": {
        id: "CM-11",
        title: "CM-11",
        subtitle: "Centro de M\u00E1quinas \u2022 Sala de M\u00E1quinas",
        voltage: "440 V",
        location: "cota 281,00",
        revision: "Abril / 2024",
        normal: {
            sourcePanel: "CF-pCA-P0912",
            qp: "3QP - B-I",
            sourceBreaker: "1752-132",
            transformer: "CF-TSA-P0912",
            transformerVoltage: "14,4 / 0,46 kV \u2022 1500 kVA",
            transformerBreaker: "52-20501",
            feederBreaker: "52-20513",
            incomingBreaker: "1752-228",
            color: "#ff31c7"
        },
        reserve: {
            sourcePanel: "CF-pCA-R0912",
            qp: "3QP - B-II",
            sourceBreaker: "1752-143",
            transformer: "CF-TSA-R0912",
            transformerVoltage: "14,4 / 0,46 kV \u2022 1500 kVA",
            transformerBreaker: "52-20601",
            feederBreaker: "52-20613",
            incomingBreaker: "1752-229",
            color: "#3dbb5a"
        },
        reserveDelaySeconds: 3,
        emergency: {
            source: "GAE-2",
            primaryBreaker: "254",
            primaryLabel: "1752-254",
            couplingBreaker: "250",
            couplingLabel: "1752-250"
        },
        dcSupplies: [
            "3qc-2 (125 Vcc)",
            "3qc-1 (125 Vcc)"
        ],
        arcFlash: {
            distance: "1,46 m",
            energy: "8,1 cal/cm\u00B2",
            ppe: "RISCO 4 - Capuz carrasco; Luva Isolante Classe 00 e Calçado de segurança"
        },
        outgoing: loads([
            ["1C", "TRAFO de Controle e Rel\u00E9s de M\u00EDnima Tens\u00E3o (Princ. e Reserva)"],
            ["2B", "Bomba 1 - Regulador de Velocidade"],
            ["2C", "Bomba 2 - Regulador de Velocidade"],
            ["2D", "Comporta de Emerg\u00EAncia - Tomada d'\u00C1gua"],
            ["2E", "CP-11 (Desativado)", { closed: false }],
            ["3A", "Pr\u00E9-excita\u00E7\u00E3o"],
            ["3B", "Sistema de Resfriamento - Transformador 170 MVA"],
            ["3C", "Bomba 1 - Sistema de Inje\u00E7\u00E3o - Mancal de Escora"],
            ["3D", "Bomba 2 - Sistema de Inje\u00E7\u00E3o - Mancal de Escora"],
            ["3E", "Resistor de Aquecimento do Gerador"],
            ["2A", "GAE-2", { closed: false, openSymbol: "preselection" }],
            ["3F", "Compressor do Regulador de Velocidade"],
            ["3G", "Bomba 1 - Circula\u00E7\u00E3o de \u00D3leo - Mancal Combinado"],
            ["3H", "Bomba 2 - Circula\u00E7\u00E3o de \u00D3leo - Mancal Combinado"],
            ["4A", "Quadro QC e RTVX"],
            ["4B", "V\u00E1lvula Motorizada e Exaustor do QCT"],
            ["4C", "Bomba Macaco Hidr\u00E1ulico"],
            ["4D", "Bomba de Recupera\u00E7\u00E3o de \u00D3leo do Mancal Combinado"],
            ["4E", "Bomba 1 - Circula\u00E7\u00E3o de \u00D3leo - Mancal Guia Inferior"],
            ["4F", "Bomba 2 - Circula\u00E7\u00E3o de \u00D3leo - Mancal Guia Inferior"],
            ["4G", "Exaustor de Vapores - Mancal de Escora"],
            ["4H", "Sistema Anti-inc\u00EAndio - Espuma Qu\u00EDmica"]
        ])
    },

    "CM-12": {
        id: "CM-12",
        title: "CM-12",
        subtitle: "Centro de M\u00E1quinas \u2022 Sala de M\u00E1quinas",
        voltage: "440 V",
        location: "cota 281,00",
        revision: "Abril / 2024",
        normal: {
            sourcePanel: "CF-pCA-P0912",
            qp: "3QP - B-I",
            sourceBreaker: "1752-132",
            transformer: "CF-TSA-P0912",
            transformerVoltage: "14,4 / 0,46 kV \u2022 1500 kVA",
            transformerBreaker: "52-20501",
            feederBreaker: "52-20514",
            incomingBreaker: "1752-231",
            color: "#ff31c7"
        },
        reserve: {
            sourcePanel: "CF-pCA-R0912",
            qp: "3QP - B-II",
            sourceBreaker: "1752-143",
            transformer: "CF-TSA-R0912",
            transformerVoltage: "14,4 / 0,46 kV \u2022 1500 kVA",
            transformerBreaker: "52-20601",
            feederBreaker: "52-20614",
            incomingBreaker: "1752-230",
            color: "#3dbb5a"
        },
        reserveDelaySeconds: 3,
        emergency: {
            source: "GAE-2",
            primaryBreaker: "254",
            primaryLabel: "1752-254",
            couplingBreaker: "251",
            couplingLabel: "1752-251"
        },
        dcSupplies: [
            "3qc-2 (125 Vcc)",
            "3qc-1 (125 Vcc)"
        ],
        arcFlash: {
            distance: "1,278 m",
            energy: "6,5 cal/cm\u00B2",
            ppe: "RISCO 2 - Vestimenta risco 2; Capacete com viseira; Balaclava; Óculos de segurança; Luva Isolante Classe 00 e Calçado de Segurança"
        },
        outgoing: loads([
            ["1C", "TRAFO de Controle e Rel\u00E9s de M\u00EDnima Tens\u00E3o"],
            ["2B", "Bomba 1 - Regulador de Velocidade"],
            ["2C", "Bomba 2 - Regulador de Velocidade"],
            ["2D", "Comporta de Emerg\u00EAncia - Tomada d'\u00C1gua"],
            ["2E", "CP-12 (Desativado)", { closed: false }],
            ["3A", "Pr\u00E9-excita\u00E7\u00E3o"],
            ["3B", "Sistema de Resfriamento - Transformador 170 MVA"],
            ["3C", "Bomba 1 - Sistema de Inje\u00E7\u00E3o - Mancal de Escora"],
            ["3D", "Bomba 2 - Sistema de Inje\u00E7\u00E3o - Mancal de Escora"],
            ["3E", "Resistor de Aquecimento do Gerador"],
            ["2A", "GAE-2", { closed: false, openSymbol: "preselection" }],
            ["3F", "Compressor do Regulador de Velocidade"],
            ["3G", "Bomba 1 - Circula\u00E7\u00E3o de \u00D3leo - Mancal Combinado"],
            ["3H", "Bomba 2 - Circula\u00E7\u00E3o de \u00D3leo - Mancal Combinado"],
            ["4A", "QDRO QC e RTVX"],
            ["4B", "V\u00E1lvula Motorizada / Recupera\u00E7\u00E3o de \u00D3leo MC / Exaustor QCT"],
            ["4C", "Bomba Macaco Hidr\u00E1ulico"],
            ["4D", "Bomba do Sistema de Lubrifica\u00E7\u00E3o - Graxa"],
            ["4E", "Bomba 1 - Circula\u00E7\u00E3o de \u00D3leo - Mancal Guia Inferior"],
            ["4F", "Bomba 2 - Circula\u00E7\u00E3o de \u00D3leo - Mancal Guia Inferior"],
            ["4G", "Exaustor de Vapores - Mancal de Escora"],
            ["4H", "Sistema Anti-inc\u00EAndio - Espuma Qu\u00EDmica"]
        ])
    },

    "CCM-U13": {
        id: "CCM-U13",
        title: "CF-CCM-U13",
        subtitle: "Centro de Controle de Motores da Unidade Geradora 13",
        voltage: "460 V",
        location: "cota 281,00 \u2022 Sala de M\u00E1quinas",
        revision: "Janeiro / 2026",
        normal: {
            sourcePanel: "CF-pCA-P1316",
            qp: "3QP - B-I",
            sourceBreaker: "1752-131",
            transformer: "CF-TSA-P1316",
            transformerVoltage: "14,4 / 0,46 kV \u2022 1500 kVA",
            transformerBreaker: "52-20701",
            feederBreaker: "52-20711",
            incomingBreaker: "52-22301",
            color: "#ff31c7"
        },
        reserve: {
            sourcePanel: "CF-pCA-R1316",
            qp: "3QP - B-II",
            sourceBreaker: "1752-133",
            transformer: "CF-TSA-R1316",
            transformerVoltage: "14,4 / 0,46 kV \u2022 1500 kVA",
            transformerBreaker: "52-20801",
            feederBreaker: "52-20811",
            incomingBreaker: "52-22302",
            color: "#3f7cff"
        },
        reserveDelaySeconds: 3,
        dcSupplies: [
            "72-10734 - CF-pCC-P1316 (125 Vcc)",
            "72-10834 - CF-pCC-R1316 (125 Vcc)"
        ],
        arcFlash: {
            distance: "0,61 m",
            energy: "2,43 cal/cm\u00B2",
            ppe: "RISCO 2"
        },
        outgoing: loads([
            ["52-22391", "Regulador de Velocidade - Bomba 1"],
            ["52-22392", "Regulador de Velocidade - Bomba 2"],
            ["52-22311", "Mancal Combinado - Bomba de Circula\u00E7\u00E3o 1"],
            ["52-22312", "Mancal Combinado - Bomba de Circula\u00E7\u00E3o 2"],
            ["52-22313", "Mancal Combinado - Bomba de Inje\u00E7\u00E3o de Alta Press\u00E3o 1"],
            ["52-22314", "Mancal Combinado - Bomba de Inje\u00E7\u00E3o de Alta Press\u00E3o 2"],
            ["52-22315", "Mancal Combinado - Exaustor de Vapor de \u00D3leo"],
            ["52-22316", "Mancal Guia Inferior - Bomba de Circula\u00E7\u00E3o 1"],
            ["52-22317", "Mancal Guia Inferior - Bomba de Circula\u00E7\u00E3o 2"],
            ["52-22318", "Veda\u00E7\u00E3o do Eixo - Bomba de Inje\u00E7\u00E3o de \u00C1gua 1"],
            ["52-22319", "Veda\u00E7\u00E3o do Eixo - Bomba de Inje\u00E7\u00E3o de \u00C1gua 2"],
            ["52-22320", "Drenagem da Tampa - Bomba de Emerg\u00EAncia"],
            ["52-22321", "Mancal Combinado - Bomba do Tanque de Coleta de \u00D3leo"],
            ["52-22322", "Reserva"],
            ["52-22323", "Coletor de P\u00F3 de Freio 1"],
            ["52-22324", "Coletor de P\u00F3 de Freio 2"],
            ["52-22325", "Coletor de P\u00F3 de Freio 3"],
            ["52-22326", "Coletor de P\u00F3 de Freio 4"],
            ["52-22327", "Reserva"],
            ["52-22328", "Reserva"],
            ["52-22329", "Reserva"],
            ["52-22330", "Reserva"],
            ["52-22331", "Reserva"],
            ["52-22332", "Reserva"],
            ["52-22333", "Reserva"],
            ["52-22334", "Reserva"],
            ["52-22351", "Quadro de For\u00E7a e Ilumina\u00E7\u00E3o da Unidade"],
            ["52-22352", "Painel de Comando do Compressor U13"],
            ["52-22353", "Bombas 1 e 2 - Unidade Hidr\u00E1ulica da Comporta"],
            ["52-22354", "Sistema de Refrigera\u00E7\u00E3o do Transformador"],
            ["52-22355", "Pr\u00E9-excita\u00E7\u00E3o da Unidade 13"],
            ["52-22356", "Sistema de \u00C1gua de Resfriamento - Filtro"],
            ["52-22357", "Ventila\u00E7\u00E3o e Conversor CA-CC do RTVX"],
            ["52-22358", "Reserva"],
            ["52-22359", "Reserva"],
            ["52-22360", "Sistema de \u00C1gua de Resfriamento - V\u00E1lvulas Motorizadas"],
            ["52-22361", "Frenagem e Levantamento do Gerador - Bomba de \u00D3leo"],
            ["52-22362", "Seccionadora de Aterramento", { closed: false }]
        ])
    },

    "CM-14": {
        id: "CM-14",
        title: "CM-14",
        subtitle: "Centro de M\u00E1quinas \u2022 Sala de M\u00E1quinas",
        voltage: "440 V",
        location: "cota 281,00",
        revision: "Abril / 2024",
        normal: {
            sourcePanel: "CF-pCA-P1316",
            qp: "3QP - B-I",
            sourceBreaker: "1752-131",
            transformer: "CF-TSA-P1316",
            transformerVoltage: "14,4 / 0,46 kV \u2022 1500 kVA",
            transformerBreaker: "52-20701",
            feederBreaker: "52-20712",
            incomingBreaker: "1752-235",
            color: "#ff31c7"
        },
        reserve: {
            sourcePanel: "CF-pCA-R1316",
            qp: "3QP - B-II",
            sourceBreaker: "1752-133",
            transformer: "CF-TSA-R1316",
            transformerVoltage: "14,4 / 0,46 kV \u2022 1500 kVA",
            transformerBreaker: "52-20801",
            feederBreaker: "52-20812",
            incomingBreaker: "1752-234",
            color: "#3f7cff"
        },
        reserveDelaySeconds: 3,
        dcSupplies: [
            "4qc-2 (125 Vcc)",
            "4qc-1 (125 Vcc)"
        ],
        arcFlash: {
            distance: "1,333 m",
            energy: "7,0 cal/cm\u00B2",
            ppe: "RISCO 2"
        },
        outgoing: loads([
            ["1C", "TRAFO de Controle e Rel\u00E9s de M\u00EDnima Tens\u00E3o"],
            ["2A", "Bomba 1 - Regulador de Velocidade"],
            ["2B", "Bomba 2 - Regulador de Velocidade"],
            ["2C", "Comporta de Emerg\u00EAncia - Tomada d'\u00C1gua"],
            ["2D", "CP-14 (Desativado)", { closed: false }],
            ["2E", "Pr\u00E9-excita\u00E7\u00E3o"],
            ["2F", "Sistema de Resfriamento - Transformador 170 MVA"],
            ["3A", "Bomba 1 - Sistema de Inje\u00E7\u00E3o - Mancal de Escora"],
            ["3B", "Reserva"],
            ["3C", "Resistor de Aquecimento do Gerador"],
            ["3D", "Compressor do Regulador de Velocidade"],
            ["3E", "Bomba 1 - Circula\u00E7\u00E3o de \u00D3leo - Mancal Combinado"],
            ["3F", "Bomba 2 - Circula\u00E7\u00E3o de \u00D3leo - Mancal Combinado"],
            ["3G", "QDRO QC e RTVX"],
            ["3H", "Bomba 2 - Sistema de Inje\u00E7\u00E3o - Mancal de Escora"],
            ["4A", "V\u00E1lvula Motorizada / Recupera\u00E7\u00E3o de \u00D3leo MC / Exaustor QCT"],
            ["4B", "Bomba Macaco Hidr\u00E1ulico"],
            ["4C", "Bomba do Sistema de Lubrifica\u00E7\u00E3o - Graxa"],
            ["4D", "Bomba 1 - Circula\u00E7\u00E3o de \u00D3leo - Mancal Guia Inferior"],
            ["4E", "Bomba 2 - Circula\u00E7\u00E3o de \u00D3leo - Mancal Guia Inferior"],
            ["4F", "Exaustor de Vapores - Mancal de Escora"]
        ])
    },

    "CM-15": {
        id: "CM-15",
        title: "CM-15",
        subtitle: "Centro de M\u00E1quinas \u2022 Sala de M\u00E1quinas",
        voltage: "440 V",
        location: "cota 281,00",
        revision: "Abril / 2024",
        normal: {
            sourcePanel: "CF-pCA-P1316",
            qp: "3QP - B-I",
            sourceBreaker: "1752-131",
            transformer: "CF-TSA-P1316",
            transformerVoltage: "14,4 / 0,46 kV \u2022 1500 kVA",
            transformerBreaker: "52-20701",
            feederBreaker: "52-20713",
            incomingBreaker: "1752-236",
            color: "#ff31c7"
        },
        reserve: {
            sourcePanel: "CF-pCA-R1316",
            qp: "3QP - B-II",
            sourceBreaker: "1752-133",
            transformer: "CF-TSA-R1316",
            transformerVoltage: "14,4 / 0,46 kV \u2022 1500 kVA",
            transformerBreaker: "52-20801",
            feederBreaker: "52-20813",
            incomingBreaker: "1752-237",
            color: "#3f7cff"
        },
        reserveDelaySeconds: 3,
        dcSupplies: [
            "4qc-2 (125 Vcc)",
            "4qc-1 (125 Vcc)"
        ],
        arcFlash: {
            distance: "1,467 m",
            energy: "8,2 cal/cm\u00B2",
            ppe: "RISCO 4"
        },
        outgoing: loads([
            ["1C", "TRAFO de Controle e Rel\u00E9s de M\u00EDnima Tens\u00E3o"],
            ["2A", "Bomba 1 - Regulador de Velocidade"],
            ["2B", "Bomba 2 - Regulador de Velocidade"],
            ["2C", "Comporta de Emerg\u00EAncia - Tomada d'\u00C1gua"],
            ["2D", "CP-15 (Desativado)", { closed: false }],
            ["2E", "Pr\u00E9-excita\u00E7\u00E3o"],
            ["2F", "Sistema de Resfriamento - Transformador 170 MVA"],
            ["3A", "Bomba 1 - Sistema de Inje\u00E7\u00E3o - Mancal de Escora"],
            ["3B", "Bomba 2 - Sistema de Inje\u00E7\u00E3o - Mancal de Escora"],
            ["3C", "Resistor de Aquecimento do Gerador"],
            ["3D", "Compressor do Regulador de Velocidade"],
            ["3E", "Bomba 1 - Circula\u00E7\u00E3o de \u00D3leo - Mancal Combinado"],
            ["3F", "Bomba 2 - Circula\u00E7\u00E3o de \u00D3leo - Mancal Combinado"],
            ["3G", "QDRO QC e RTVX"],
            ["4A", "V\u00E1lvula Motorizada / Recupera\u00E7\u00E3o de \u00D3leo MC / Exaustor QCT"],
            ["4B", "Bomba Macaco Hidr\u00E1ulico"],
            ["4C", "Bomba do Sistema de Lubrifica\u00E7\u00E3o - Graxa"],
            ["4D", "Bomba 1 - Circula\u00E7\u00E3o de \u00D3leo - Mancal Guia Inferior"],
            ["4E", "Bomba 2 - Circula\u00E7\u00E3o de \u00D3leo - Mancal Guia Inferior"],
            ["4F", "Exaustor de Vapores - Mancal de Escora"]
        ])
    },

    "CM-16": {
        id: "CM-16",
        title: "CM-16",
        subtitle: "Centro de M\u00E1quinas \u2022 Sala de M\u00E1quinas",
        voltage: "440 V",
        location: "cota 281,00",
        revision: "Abril / 2024",
        normal: {
            sourcePanel: "CF-pCA-P1316",
            qp: "3QP - B-I",
            sourceBreaker: "1752-131",
            transformer: "CF-TSA-P1316",
            transformerVoltage: "14,4 / 0,46 kV \u2022 1500 kVA",
            transformerBreaker: "52-20701",
            feederBreaker: "52-20714",
            incomingBreaker: "1752-239",
            color: "#ff31c7"
        },
        reserve: {
            sourcePanel: "CF-pCA-R1316",
            qp: "3QP - B-II",
            sourceBreaker: "1752-133",
            transformer: "CF-TSA-R1316",
            transformerVoltage: "14,4 / 0,46 kV \u2022 1500 kVA",
            transformerBreaker: "52-20801",
            feederBreaker: "52-20814",
            incomingBreaker: "1752-238",
            color: "#3f7cff"
        },
        reserveDelaySeconds: 3,
        dcSupplies: [
            "4qc-2 (125 Vcc)",
            "4qc-1 (125 Vcc)"
        ],
        arcFlash: {
            distance: "1,281 m",
            energy: "6,5 cal/cm\u00B2",
            ppe: "RISCO 2"
        },
        outgoing: loads([
            ["1C", "TRAFO de Controle e Rel\u00E9s de M\u00EDnima Tens\u00E3o"],
            ["2A", "Bomba 1 - Regulador de Velocidade"],
            ["2B", "Bomba 2 - Regulador de Velocidade"],
            ["2C", "Comporta de Emerg\u00EAncia - Tomada d'\u00C1gua"],
            ["2D", "CP-16 (Desativado)", { closed: false }],
            ["2E", "Pr\u00E9-excita\u00E7\u00E3o"],
            ["2F", "Sistema de Resfriamento - Transformador 170 MVA"],
            ["3A", "Bomba 1 - Sistema de Inje\u00E7\u00E3o - Mancal de Escora"],
            ["3B", "Reserva"],
            ["3C", "Resistor de Aquecimento do Gerador"],
            ["3D", "Compressor de Ar do Regulador de Velocidade"],
            ["3E", "Bomba 1 - Circula\u00E7\u00E3o de \u00D3leo - Mancal Combinado"],
            ["3F", "Bomba 2 - Circula\u00E7\u00E3o de \u00D3leo - Mancal Combinado"],
            ["3G", "QDRO QC e RTVX"],
            ["3H", "Bomba 2 - Sistema de Inje\u00E7\u00E3o - Mancal de Escora"],
            ["4A", "V\u00E1lvula Motorizada / Recupera\u00E7\u00E3o de \u00D3leo MC / Exaustor QCT"],
            ["4B", "Bomba Macaco Hidr\u00E1ulico"],
            ["4C", "Bomba do Sistema de Lubrifica\u00E7\u00E3o - Graxa"],
            ["4D", "Bomba 1 - Circula\u00E7\u00E3o de \u00D3leo - Mancal Guia Inferior"],
            ["4E", "Bomba 2 - Circula\u00E7\u00E3o de \u00D3leo - Mancal Guia Inferior"],
            ["4F", "Exaustor de Vapores - Mancal de Escora"]
        ])
    },

    "CM-17": {
        id: "CM-17",
        title: "CM-17",
        subtitle: "Centro de M\u00E1quinas \u2022 Sala de M\u00E1quinas",
        voltage: "440 V",
        location: "cota 281,00",
        revision: "Abril / 2024",
        normal: {
            sourcePanel: "CF-pCA-P1720",
            qp: "3QP - B-I",
            sourceBreaker: "1752-130",
            transformer: "CF-TSA-P1720",
            transformerVoltage: "14,4 / 0,46 kV \u2022 1500 kVA",
            transformerBreaker: "52-20901",
            feederBreaker: "52-20911",
            incomingBreaker: "1752-240",
            color: "#ff31c7"
        },
        reserve: {
            sourcePanel: "CF-pCA-R1720",
            qp: "3QP - B-III",
            sourceBreaker: "1752-141",
            transformer: "CF-TSA-R1720",
            transformerVoltage: "14,4 / 0,46 kV \u2022 1500 kVA",
            transformerBreaker: "52-21001",
            feederBreaker: "52-21011",
            incomingBreaker: "1752-241",
            color: "#3dbb5a"
        },
        reserveDelaySeconds: 3,
        dcSupplies: [
            "5qc-2 (125 Vcc)",
            "5qc-1 (125 Vcc)"
        ],
        arcFlash: {
            distance: "1,1194 m",
            energy: "5,8 cal/cm\u00B2",
            ppe: "RISCO 2"
        },
        outgoing: loads([
            ["1C", "TRAFO de Controle e Rel\u00E9s de M\u00EDnima Tens\u00E3o"],
            ["2A", "Bomba 1 - Regulador de Velocidade"],
            ["2B", "Bomba 2 - Regulador de Velocidade"],
            ["2C", "Comporta de Emerg\u00EAncia - Tomada d'\u00C1gua"],
            ["2D", "CP-24 (Desativado)", { closed: false }],
            ["2E", "Pr\u00E9-excita\u00E7\u00E3o"],
            ["2F", "Sistema de Resfriamento - Transformador 170 MVA"],
            ["3A", "Sistema de Inje\u00E7\u00E3o - Mancal de Escora"],
            ["3B", "Bomba de Recupera\u00E7\u00E3o de \u00D3leo - Mancal Combinado"],
            ["3C", "Resistor de Aquecimento do Gerador"],
            ["3D", "Compressor de Ar do Regulador de Velocidade"],
            ["3E", "Bomba 1 - Circula\u00E7\u00E3o de \u00D3leo - Mancal Combinado"],
            ["3F", "Bomba 2 - Circula\u00E7\u00E3o de \u00D3leo - Mancal Combinado"],
            ["3G", "QDRO QC e Regulador de Velocidade"],
            ["4A", "Reserva"],
            ["4B", "Bomba Macaco Hidr\u00E1ulico"],
            ["4C", "Bomba do Sistema de Lubrifica\u00E7\u00E3o - Graxa"],
            ["4D", "Bomba 1 - Circula\u00E7\u00E3o de \u00D3leo - Mancal Guia Inferior"],
            ["4E", "Bomba 2 - Circula\u00E7\u00E3o de \u00D3leo - Mancal Guia Inferior"],
            ["4F", "Exaustor de Vapores - Mancal de Escora"]
        ])
    },

    "CM-18": {
        id: "CM-18",
        title: "CM-18",
        subtitle: "Centro de M\u00E1quinas \u2022 Sala de M\u00E1quinas",
        voltage: "440 V",
        location: "cota 281,00",
        revision: "Junho / 2024",
        normal: {
            sourcePanel: "CF-pCA-P1720",
            qp: "3QP - B-I",
            sourceBreaker: "1752-130",
            transformer: "CF-TSA-P1720",
            transformerVoltage: "14,4 / 0,46 kV \u2022 1500 kVA",
            transformerBreaker: "52-20901",
            feederBreaker: "52-20912",
            incomingBreaker: "1752-243",
            color: "#ff31c7"
        },
        reserve: {
            sourcePanel: "CF-pCA-R1720",
            qp: "3QP - B-III",
            sourceBreaker: "1752-141",
            transformer: "CF-TSA-R1720",
            transformerVoltage: "14,4 / 0,46 kV \u2022 1500 kVA",
            transformerBreaker: "52-21001",
            feederBreaker: "52-21012",
            incomingBreaker: "1752-242",
            color: "#3dbb5a"
        },
        reserveDelaySeconds: 3,
        dcSupplies: [
            "5qc-2 (125 Vcc)",
            "5qc-1 (125 Vcc)"
        ],
        arcFlash: {
            distance: "1,293 m",
            energy: "6,6 cal/cm\u00B2",
            ppe: "RISCO 2"
        },
        outgoing: loads([
            ["1C", "TRAFO de Controle e Rel\u00E9s de M\u00EDnima Tens\u00E3o"],
            ["2A", "Bomba 1 - Regulador de Velocidade"],
            ["2B", "Bomba 2 - Regulador de Velocidade"],
            ["2C", "Comporta de Emerg\u00EAncia - Tomada d'\u00C1gua"],
            ["2D", "Reserva"],
            ["2E", "Pr\u00E9-excita\u00E7\u00E3o"],
            ["2F", "Sistema de Resfriamento - Transformador 170 MVA"],
            ["3A", "Sistema de Inje\u00E7\u00E3o - Mancal de Escora"],
            ["3B", "Reserva"],
            ["3C", "Resistor de Aquecimento do Gerador"],
            ["3D", "Compressor de Ar do Regulador de Velocidade"],
            ["3E", "Bomba 1 - Circula\u00E7\u00E3o de \u00D3leo - Mancal Combinado"],
            ["3F", "Bomba 2 - Circula\u00E7\u00E3o de \u00D3leo - Mancal Combinado"],
            ["3G", "QDRO QC e Regulador de Velocidade"],
            ["4A", "V\u00E1lvula Motorizada / Bomba de Recupera\u00E7\u00E3o de \u00D3leo - Mancal Combinado"],
            ["4B", "Bomba Macaco Hidr\u00E1ulico"],
            ["4C", "Reserva"],
            ["4D", "Bomba 1 - Circula\u00E7\u00E3o de \u00D3leo - Mancal Guia Inferior"],
            ["4E", "Bomba 2 - Circula\u00E7\u00E3o de \u00D3leo - Mancal Guia Inferior"],
            ["4F", "Exaustor de Vapores de \u00D3leo - Mancal de Escora"]
        ])
    },

    "CM-19": {
        id: "CM-19",
        title: "CM-19",
        subtitle: "Centro de M\u00E1quinas \u2022 Sala de M\u00E1quinas",
        voltage: "440 V",
        location: "cota 281,00",
        revision: "Abril / 2024",
        normal: {
            sourcePanel: "CF-pCA-P1720",
            qp: "3QP - B-I",
            sourceBreaker: "1752-130",
            transformer: "CF-TSA-P1720",
            transformerVoltage: "14,4 / 0,46 kV \u2022 1500 kVA",
            transformerBreaker: "52-20901",
            feederBreaker: "52-20913",
            incomingBreaker: "1752-244",
            color: "#ff31c7"
        },
        reserve: {
            sourcePanel: "CF-pCA-R1720",
            qp: "3QP - B-III",
            sourceBreaker: "1752-141",
            transformer: "CF-TSA-R1720",
            transformerVoltage: "14,4 / 0,46 kV \u2022 1500 kVA",
            transformerBreaker: "52-21001",
            feederBreaker: "52-21013",
            incomingBreaker: "1752-245",
            color: "#3dbb5a"
        },
        reserveDelaySeconds: 3,
        dcSupplies: [
            "5qc-2 (125 Vcc)",
            "5qc-1 (125 Vcc)"
        ],
        arcFlash: {
            distance: "1,431 m",
            energy: "7,8 cal/cm\u00B2",
            ppe: "RISCO 2"
        },
        outgoing: loads([
            ["1C", "TRAFO de Controle e Rel\u00E9s de M\u00EDnima Tens\u00E3o"],
            ["2A", "Bomba 1 - Regulador de Velocidade"],
            ["2B", "Bomba 2 - Regulador de Velocidade"],
            ["2C", "Comporta de Emerg\u00EAncia - Tomada d'\u00C1gua"],
            ["2D", "CP-19 (Desativado)", { closed: false }],
            ["2E", "Pr\u00E9-excita\u00E7\u00E3o"],
            ["2F", "Sistema de Resfriamento - Transformador 170 MVA"],
            ["3A", "Sistema de Inje\u00E7\u00E3o - Mancal de Escora"],
            ["3B", "Reserva"],
            ["3C", "Resistor de Aquecimento do Gerador"],
            ["3D", "Compressor de Ar do Regulador de Velocidade"],
            ["3E", "Bomba 1 - Circula\u00E7\u00E3o de \u00D3leo - Mancal Combinado"],
            ["3F", "Bomba 2 - Circula\u00E7\u00E3o de \u00D3leo - Mancal Combinado"],
            ["3G", "QDRO QC e RTVX"],
            ["4A", "V\u00E1lvula Motorizada / Bomba de Recupera\u00E7\u00E3o de \u00D3leo MC"],
            ["4B", "Bomba Macaco Hidr\u00E1ulico"],
            ["4C", "Reserva"],
            ["4D", "Bomba 1 - Circula\u00E7\u00E3o de \u00D3leo - Mancal Guia Inferior"],
            ["4E", "Bomba 2 - Circula\u00E7\u00E3o de \u00D3leo - Mancal Guia Inferior"],
            ["4F", "Exaustor de Vapores de \u00D3leo - Mancal de Escora"]
        ])
    },

    "CCM-U20": {
        id: "CCM-U20",
        title: "CF-CCM-U20",
        subtitle: "Centro de Controle de Motores da Unidade Geradora 20",
        voltage: "460 V",
        location: "cota 281,00 \u2022 Sala de M\u00E1quinas",
        revision: "Junho / 2024",
        normal: {
            sourcePanel: "CF-pCA-P1720",
            qp: "3QP - B-I",
            sourceBreaker: "1752-130",
            transformer: "CF-TSA-P1720",
            transformerVoltage: "14,4 / 0,46 kV \u2022 1500 kVA",
            transformerBreaker: "52-20901",
            feederBreaker: "52-20914",
            incomingBreaker: "52-23001",
            color: "#ff31c7"
        },
        reserve: {
            sourcePanel: "CF-pCA-R1720",
            qp: "3QP - B-III",
            sourceBreaker: "1752-141",
            transformer: "CF-TSA-R1720",
            transformerVoltage: "14,4 / 0,46 kV \u2022 1500 kVA",
            transformerBreaker: "52-21001",
            feederBreaker: "52-21014",
            incomingBreaker: "52-23002",
            color: "#3dbb5a"
        },
        reserveDelaySeconds: 3,
        dcSupplies: [
            "72-10941 - CF-pCC-P1720 (125 Vcc)",
            "72-11041 - CF-pCC-R1720 (125 Vcc)"
        ],
        arcFlash: {
            distance: "0,61 m",
            energy: "2,54 cal/cm\u00B2",
            ppe: "RISCO 2"
        },
        outgoing: loads([
            ["52-23091", "Regulador de Velocidade - Bomba 1"],
            ["52-23092", "Regulador de Velocidade - Bomba 2"],
            ["52-23011", "Mancal Combinado - Circula\u00E7\u00E3o de \u00D3leo - Bomba 1"],
            ["52-23012", "Mancal Combinado - Circula\u00E7\u00E3o de \u00D3leo - Bomba 2"],
            ["52-23013", "Mancal Combinado - Inje\u00E7\u00E3o de Alta Press\u00E3o - Bomba 1"],
            ["52-23014", "Mancal Combinado - Inje\u00E7\u00E3o de Alta Press\u00E3o - Bomba 2"],
            ["52-23015", "Mancal Combinado - Exaustor de Vapor de \u00D3leo"],
            ["52-23016", "Mancal de Guia Inferior - Bomba de Circula\u00E7\u00E3o 1"],
            ["52-23017", "Mancal de Guia Inferior - Bomba de Circula\u00E7\u00E3o 2"],
            ["52-23018", "Veda\u00E7\u00E3o do Eixo - Inje\u00E7\u00E3o de \u00C1gua - Bomba 1"],
            ["52-23019", "Veda\u00E7\u00E3o do Eixo - Inje\u00E7\u00E3o de \u00C1gua - Bomba 2"],
            ["52-23020", "Drenagem da Tampa - Bomba de Emerg\u00EAncia"],
            ["52-23021", "Mancal Combinado - Bomba do Tanque de Coleta de \u00D3leo"],
            ["52-23022", "Frenagem e Levantamento do Gerador - Bomba de \u00D3leo"],
            ["52-23023", "Frenagem e Levantamento - Coletor de P\u00F3 de Freio 1"],
            ["52-23024", "Frenagem e Levantamento - Coletor de P\u00F3 de Freio 2"],
            ["52-23025", "Frenagem e Levantamento - Coletor de P\u00F3 de Freio 3"],
            ["52-23026", "Frenagem e Levantamento - Coletor de P\u00F3 de Freio 4"],
            ["52-23027", "Reserva"],
            ["52-23028", "Reserva"],
            ["52-23029", "Reserva"],
            ["52-23030", "Reserva"],
            ["52-23031", "Reserva"],
            ["52-23032", "Reserva"],
            ["52-23033", "Reserva"],
            ["52-23034", "Reserva"],
            ["52-23051", "Quadro de For\u00E7a e Ilumina\u00E7\u00E3o da Unidade"],
            ["52-23052", "Compressor de Ar do Regulador de Velocidade"],
            ["52-23053", "Bombas 1 e 2 - Unidade Hidr\u00E1ulica da Comporta"],
            ["52-23054", "Sistema de Refrigera\u00E7\u00E3o do Transformador"],
            ["52-23055", "Pr\u00E9-excita\u00E7\u00E3o da Unidade"],
            ["52-23056", "Sistema de \u00C1gua de Resfriamento - Filtro"],
            ["52-23057", "Ventila\u00E7\u00E3o e Conversor CA-CC do RTVX"],
            ["52-23058", "Reserva"],
            ["52-23059", "Reserva"],
            ["52-23060", "Sistema de \u00C1gua de Resfriamento - V\u00E1lvulas Motorizadas"],
            ["52-23061", "Reserva"],
            ["52-23062", "Reserva"]
        ])
    }
};

const aliases = {
    CM2: "CM-02",
    CM02: "CM-02",
    CCMU03: "CCM-U03",
    CCMU3: "CCM-U03",
    CCMU04: "CCM-U04",
    CCMU4: "CCM-U04",
    CM5: "CM-05",
    CM05: "CM-05",
    CM6: "CM-06",
    CM06: "CM-06",
    CCMU07: "CCM-U07",
    CCMU7: "CCM-U07",
    CM8: "CM-08",
    CM08: "CM-08",
    CCMU09: "CCM-U09",
    CCMU9: "CCM-U09",
    CM10: "CM-10",
    CM11: "CM-11",
    CM12: "CM-12",
    CCMU13: "CCM-U13",
    CCMU013: "CCM-U13",
    CM13: "CCM-U13",
    CM14: "CM-14",
    CM15: "CM-15",
    CM16: "CM-16",
    CM17: "CM-17",
    CM18: "CM-18",
    CM19: "CM-19",
    CCMU20: "CCM-U20",
    CM20: "CCM-U20"
};

function normalize(value) {
    return String(value ?? "")
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "");
}

function clonePanel(panel) {
    return {
        ...panel,
        normal: { ...panel.normal },
        reserve: { ...panel.reserve },
        emergency: panel.emergency ? { ...panel.emergency } : null,
        dcSupplies: [...panel.dcSupplies],
        arcFlash: { ...panel.arcFlash },
        outgoing: panel.outgoing.map(item => ({
            ...item,
            defaultClosed: item.closed
        }))
    };
}

export const AuxPanelDetailDatabase = {
    resolveId(value) {
        const direct = String(value ?? "");
        if (panels[direct]) return direct;
        return aliases[normalize(value)] ?? null;
    },

    has(value) {
        return Boolean(this.resolveId(value));
    },

    get(value) {
        const id = this.resolveId(value);
        return id ? clonePanel(panels[id]) : null;
    },

    list() {
        return Object.keys(panels);
    }
};
