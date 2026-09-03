const buildOutgoing = (section, rows) =>
    rows.map(([id, label, closed = true, options = {}]) => ({
        id,
        label,
        section,
        closed,
        defaultClosed: closed,
        available: true,
        ...options
    }));

const panels = {
    AUX_1QA: {
        id: "AUX_1QA",
        title: "1qA",
        subtitle: "Quadro auxiliar 440 V \u2022 Sala de M\u00e1quinas \u2022 cota 284,90",
        voltage: "440 V",
        layout: "dual-bus",
        normal: {
            source: "1QP \u2022 Barra I",
            sourceBreaker: "1752-114",
            isolator: "1729-206",
            transformer: "1TA-1",
            rating: "14,4/0,44 kV \u2022 1500 kVA",
            incomingBreaker: "1752-146"
        },
        reserve: {
            source: "3QP \u2022 Barra III",
            sourceBreaker: "1752-139",
            isolator: "1729-208",
            transformer: "1TA-2",
            rating: "14,4/0,44 kV \u2022 1500 kVA",
            incomingBreaker: "1752-147"
        },
        tieBreaker: "1724-106",
        tieDelayMs: 2500,
        sections: [
            { id: "I", label: "BARRA I \u2022 440 V" },
            { id: "II", label: "BARRA II \u2022 440 V" }
        ],
        outgoing: [
            ...buildOutgoing("I", [
                ["1A", "QDRO 1QI - Ventila\u00e7\u00e3o For\u00e7ada"],
                ["1B", "QDRO 1qL-5 - Galeria CF - cota 265,30"],
                ["1C", "QDRO 1qL-6 - Galeria BG - cota 328,00"],
                ["1D", "ETE - Q1 - Esta\u00e7\u00e3o de Tratamento de Esgoto"],
                ["1E", "Comutador TAP dos TR-SA-1, 2 e 3 - GAE-01"],
                ["2A", "QDRO 02QI - Ventila\u00e7\u00e3o For\u00e7ada HM"],
                ["2B", "CF-RET-14 - Retificador 125 Vcc"],
                ["2C", "Tomadas Carregador M\u00f3vel e Galeria STOP LOG's Jusante"],
                ["2D", "Circuito Soft Starter - Bomba de Drenagem do Po\u00e7o 1"],
                ["2E", "QDRO 1qL (B-I) - Jusante dos Geradores"],
                ["2F", "QDRO 01qL (B-I) - Edif\u00edcio de Comando"],
                ["3A", "Tomadas para Tratamento de \u00d3leo - TR-01 a 04"],
                ["3B", "Pontes Rolantes 280 T - HM"],
                ["3C", "QDRO 02qL (B-I) - HM"]
            ]),
            ...buildOutgoing("II", [
                ["4B", "Bomba de Esgotamento 1 - Po\u00e7o 1"],
                ["4C", "Trafo de controle / Rel\u00e9 de m\u00ednima tens\u00e3o"],
                ["6B", "Bomba de Esgotamento 2 - Po\u00e7o 1"],
                ["6C", "Trafo de controle / Rel\u00e9 de m\u00ednima tens\u00e3o"],
                ["7A", "Tomada para Tratamento de \u00d3leo - HT"],
                ["7B", "Monta-carga - BG"],
                ["7C", "QDRO 02qL (B-II) - HM"],
                ["8A", "Tomadas Purifica\u00e7\u00e3o de \u00d3leo - Sala dos Geradores UG-01 a 05"],
                ["8B", "Tomadas Turbinas UG-01 a 05 e Po\u00e7o 1"],
                ["8C", "Tomadas Comportas, Galeria By-Pass, QK e Galeria de Filtros"],
                ["8D", "Tomadas HM"],
                ["8E", "QDRO 1qL (B-II)"],
                ["8F", "QDRO 01qL (B-II) - Edif\u00edcio de Comando"],
                ["9A", "Ponte Rolante 70 T - HT"],
                ["9B", "SC-RET-01 / SC-RET-02 - Retificadores 125 Vcc"],
                ["9C", "Elevador 3 - CF"],
                ["9D", "CF-SGA-01 - Sistema de Hidrantes - Bomba Principal"],
                ["9E", "Reserva", false]
            ])
        ]
    },

    AUX_2QA: {
        id: "AUX_2QA",
        title: "2qA",
        subtitle: "Quadro auxiliar 440 V \u2022 Sala de M\u00e1quinas \u2022 cota 284,90",
        voltage: "440 V",
        layout: "dual-bus",
        normal: {
            source: "3QP \u2022 Barra I",
            sourceBreaker: "1752-129",
            isolator: "1729-214",
            transformer: "2TA-1",
            rating: "14,4/0,44 kV \u2022 1500 kVA",
            incomingBreaker: "1752-150"
        },
        reserve: {
            source: "1QP \u2022 Barra III",
            sourceBreaker: "1752-125",
            isolator: "1729-216",
            transformer: "2TA-2",
            rating: "14,4/0,44 kV \u2022 1500 kVA",
            incomingBreaker: "1752-151"
        },
        tieBreaker: "1724-107",
        tieDelayMs: 2500,
        sections: [
            { id: "I", label: "BARRA I \u2022 440 V" },
            { id: "II", label: "BARRA II \u2022 440 V" }
        ],
        outgoing: [
            ...buildOutgoing("I", [
                ["1A", "SC-SAI-02 Provis\u00f3rio"],
                ["1B", "P\u00f3rtico 45 T e Limpa Grade - Tomada d'\u00c1gua"],
                ["1C", "Moto Compressor CP-22"],
                ["1D", "QDRO 2qL5 - Galeria CF - cota 265,30"],
                ["1E", "ETE - Q2 - Esta\u00e7\u00e3o de Tratamento de Esgoto"],
                ["2A", "Circuito Soft Starter - Bomba de Drenagem - Po\u00e7o 2"],
                ["2B", "Circuito Soft Starter - Bomba de Drenagem - Po\u00e7o 3"],
                ["2C", "Carregador de Baterias CF-RET-58"],
                ["2D", "QDRO 2qL (B-I)"],
                ["2E", "Ponte Rolante 40 T - STOP LOG's Jusante"],
                ["2F", "Tomadas Carregador M\u00f3vel e Galeria STOP LOG's Jusante"],
                ["3A", "Tomadas Tratamento de \u00d3leo - TR-05 a 08"],
                ["3B", "P\u00f3rticos Principais 280 T"],
                ["3C", "Carregador de Baterias CF-RET-0912"]
            ]),
            ...buildOutgoing("II", [
                ["4B", "Bomba de Esgotamento 1 - Po\u00e7o 2"],
                ["4C", "TRAFO de Controle / Rel\u00e9s de M\u00ednima Tens\u00e3o - Principal e Reserva"],
                ["6B", "Bomba de Esgotamento 2 - Po\u00e7o 2"],
                ["6C", "Bomba de Esgotamento 2 - Po\u00e7o 3"],
                ["7A", "QDRO 2QI - Ventila\u00e7\u00e3o For\u00e7ada"],
                ["7B", "3 Pontes Rolantes 35 T"],
                ["7C", "TRAFO de Controle"],
                ["8A", "Tomadas Turbinas UG-06 a 10, Po\u00e7os 2 e 3 e Tomadas da Roda"],
                ["8B", "Tomadas Estrada - cota 332,00 - UG-01 a 10"],
                ["8C", "Tomadas Comportas, Galeria By-Pass, QK e Galeria de Filtros - UG-06 a 10"],
                ["8D", "Tomadas Purifica\u00e7\u00e3o de \u00d3leo - Sala dos Geradores UG-06 a 10"],
                ["8E", "QDRO 2qL (B-II)"],
                ["8F", "P\u00f3rtico 160 T - Comporta de Emerg\u00eancia"],
                ["9A", "Reserva", false],
                ["9B", "Moto Compressor CP-23"],
                ["9C", "CF-SGA-01 - Sistema de Hidrantes - Bomba Reserva"],
                ["9D", "Oficina Mec\u00e2nica - Galeria de Filtros"],
                ["9E", "SC-SAI-01 Provis\u00f3rio"]
            ])
        ]
    },

    AUX_3QA: {
        id: "AUX_3QA",
        title: "3qA",
        subtitle: "Quadro auxiliar 440 V \u2022 Sala de M\u00e1quinas \u2022 cota 284,90",
        voltage: "440 V",
        layout: "dual-bus",
        normal: {
            source: "3QP \u2022 Barra I",
            sourceBreaker: "1752-128",
            isolator: "1729-222",
            transformer: "3TA-1",
            rating: "14,4/0,44 kV \u2022 1500 kVA",
            incomingBreaker: "1752-154"
        },
        reserve: {
            source: "1QP \u2022 Barra III",
            sourceBreaker: "1752-126",
            isolator: "1729-224",
            transformer: "3TA-2",
            rating: "14,4/0,44 kV \u2022 1500 kVA",
            incomingBreaker: "1752-155"
        },
        tieBreaker: "1724-108",
        tieDelayMs: 2500,
        sections: [
            { id: "I", label: "BARRA I \u2022 440 V" },
            { id: "II", label: "BARRA II \u2022 440 V" }
        ],
        outgoing: [
            ...buildOutgoing("I", [
                ["1A", "Circuito Soft Starter - Bomba de Drenagem - Po\u00e7o 4"],
                ["1B", "Retificador CF-RET-1316"],
                ["1C", "QDRO 3qL6 - Galeria BG - cota 328,00"],
                ["1D", "QDRO 3qL5 - Galeria CF - cota 265,30"],
                ["1E", "Ponte Rolante 10 T - Galeria de Filtros"],
                ["2A", "Moto Compressor 3CA - Galeria de Filtros"],
                ["2B", "Reserva", false],
                ["2C", "Reserva", false],
                ["2D", "QDRO 3qL (B-I) / Comutador TAP dos TR-SA-04 e 05"],
                ["2E", "Retificador 4qr"],
                ["2F", "Tomadas Carregador M\u00f3vel e Galeria STOP LOG's Jusante"],
                ["3A", "Reserva", false],
                ["3B", "Tomadas para Tratamento de \u00d3leo TR-09 a 12"]
            ]),
            ...buildOutgoing("II", [
                ["4B", "Bomba de Esgotamento 1 - Po\u00e7o 4"],
                ["4C", "Bomba de Esgotamento 1 - Po\u00e7o 3"],
                ["6B", "Bomba de Esgotamento 2 - Po\u00e7o 4"],
                ["6C", "Trafo de controle / Rel\u00e9s de m\u00ednima tens\u00e3o"],
                ["7A", "Reserva", false],
                ["7B", "QDRO 3QI - Ventila\u00e7\u00e3o For\u00e7ada"],
                ["7C", "Reserva", false],
                ["8A", "Tomadas Turbinas UG-11 a 15 e Po\u00e7o 4"],
                ["8B", "Tomadas Purifica\u00e7\u00e3o de \u00d3leo - Sala dos Geradores UG-11 a 15"],
                ["8C", "Tomadas Tomada d'\u00c1gua - cota 332,00 - UG-11 a 20"],
                ["8D", "QDRO 3qL (B-II)"],
                ["8E", "Tomadas Comportas, Galeria By-Pass, QK e Galeria de Filtros"],
                ["8F", "Elevador de carga UG-10"],
                ["9A", "Reserva", false],
                ["9B", "Retificador 3qr"],
                ["9C", "Reserva", false],
                ["9D", "Elevador 4"],
                ["9E", "QDRO 3qL - GDE-2 e Comutador TAP do TR-SA-06"]
            ])
        ]
    },

    AUX_4QA: {
        id: "AUX_4QA",
        title: "4qA",
        subtitle: "Quadro auxiliar 440 V \u2022 Sala de M\u00e1quinas \u2022 cota 284,90",
        voltage: "440 V",
        layout: "dual-bus",
        normal: {
            source: "1QP \u2022 Barra I",
            sourceBreaker: "1752-113",
            isolator: "1729-230",
            transformer: "4TA-1",
            rating: "14,4/0,44 kV \u2022 1500 kVA",
            incomingBreaker: "1752-158"
        },
        reserve: {
            source: "3QP \u2022 Barra III",
            sourceBreaker: "1752-140",
            isolator: "1729-232",
            transformer: "4TA-2",
            rating: "14,4/0,44 kV \u2022 1500 kVA",
            incomingBreaker: "1752-159"
        },
        tieBreaker: "1724-109",
        tieDelayMs: 2500,
        sections: [
            { id: "I", label: "BARRA I \u2022 440 V" },
            { id: "II", label: "BARRA II \u2022 440 V" }
        ],
        outgoing: [
            ...buildOutgoing("I", [
                ["1A", "Alimenta\u00e7\u00e3o VS-01 a 10 - Socorro"],
                ["1B", "Bomba 3 - Po\u00e7o A"],
                ["1C", "Retificador 5yqr - Desativado", false],
                ["1D", "Bomba 3 - Po\u00e7o B"],
                ["1E", "QDRO 4qL5 - Galeria CF - cota 265,30"],
                ["2A", "QDRO 4qL (B-I)"],
                ["2B", "Reserva", false],
                ["2C", "Circuito Soft Starter - Bomba de Drenagem - Po\u00e7o 5"],
                ["2D", "Retificador CF-RET-1720 - Provis\u00f3rio"],
                ["2E", "Reserva", false],
                ["2F", "Tomadas Carregador M\u00f3vel / Galeria STOP LOG Jusante"],
                ["3A", "Tomadas para Tratamento de \u00d3leo - TR-13 a 16"],
                ["3B", "Alimenta\u00e7\u00e3o M\u00e1quina de Solda da Roda - 440 V"],
                ["3C", "Tomadas para Tratamento de \u00d3leo - TR-17 a 20"]
            ]),
            ...buildOutgoing("II", [
                ["4B", "Bomba de Esgotamento 1 - Po\u00e7o 5"],
                ["4C", "Trafo de controle / Rel\u00e9s de m\u00ednima tens\u00e3o"],
                ["6B", "Bomba de Esgotamento 2 - Po\u00e7o 5"],
                ["6C", "Trafo de controle / Rel\u00e9s de m\u00ednima tens\u00e3o"],
                ["7A", "Moto Compressor CP-17"],
                ["7B", "QDRO 4QI - Ventila\u00e7\u00e3o CF"],
                ["7C", "Reserva", false],
                ["8A", "Tomadas Turbinas UG-16 a 20 e Po\u00e7o de Bombas 5"],
                ["8B", "Tomadas Purifica\u00e7\u00e3o de \u00d3leo - Sala dos Geradores UG-16 a 20"],
                ["8C", "Tomadas Comportas, Galeria By-Pass, QK e Galeria de Filtros"],
                ["8D", "Alimenta\u00e7\u00e3o VS-11 a 19 - Socorro"],
                ["8E", "QDRO 4qL (B-II)"],
                ["8F", "Elevador 5"],
                ["9A", "ETA"],
                ["9B", "Elevador 6"],
                ["9C", "Retificador 5qr"],
                ["9D", "Oficina El\u00e9trica - IE"],
                ["9E", "Bomba 1 - Po\u00e7o A"]
            ])
        ]
    },

    AUX_5QA: {
        id: "AUX_5QA",
        title: "5qA",
        subtitle: "Quadro auxiliar 440/220 V \u2022 CSA-3 - Pr\u00e9dio Administrativo \u2022 cota 292,00",
        voltage: "440/220 V",
        layout: "mixed-voltage",
        normal: {
            source: "1QP \u2022 Barra I",
            sourceBreaker: "1752-117",
            isolator: "1729-229",
            transformer: "5TA-1",
            rating: "14,4/0,22 kV \u2022 300 kVA",
            incomingBreaker: "1752-258"
        },
        reserve: {
            source: "7qS-1 \u2022 Gaveta 4B",
            sourceBreaker: "1752-144",
            isolator: "",
            transformer: "",
            rating: "Alimenta\u00e7\u00e3o direta em 440 V",
            incomingBreaker: "1752-259"
        },
        transferTransformer: {
            id: "5TA-2",
            rating: "440/220 V \u2022 150 kVA"
        },
        tieBreaker: "1724-114",
        tieDelayMs: 3000,
        sections: [
            { id: "220", label: "BARRA 220 V" },
            { id: "440", label: "BARRA 440 V" }
        ],
        outgoing: [
            ...buildOutgoing("220", [
                ["1C", "Motobomba Anti-inc\u00eandio - Pr\u00e9dio Administrativo"],
                ["1D", "Eletroposto"],
                ["1E", "Alimenta\u00e7\u00e3o QGLF"],
                ["1F", "QG-AC-03 - Audit\u00f3rio e Alimenta\u00e7\u00e3o QL Audit\u00f3rio"],
                ["1G", "QG-AC-02 - Superior T\u00e9rreo ME"],
                ["1H", "QG-AC-01 - Superior T\u00e9rreo MD"]
            ]),
            ...buildOutgoing("440", [
                ["3C", "Reserva", false],
                ["3D", "Almoxarifado - \u00c1rea externa UHE"],
                ["3E", "Oficina do estator UG-13"],
                ["3F", "Canteiro de Obras da Moderniza\u00e7\u00e3o"]
            ])
        ]
    },

    AUX_7QS1: {
        id: "AUX_7QS1",
        title: "7qS-1",
        subtitle: "Servi\u00e7o auxiliar 440 V \u2022 SE 440 kV \u2022 CSA-1",
        voltage: "440 V",
        layout: "dual-bus",
        normal: {
            source: "1QP \u2022 Barra I",
            sourceBreaker: "1752-117",
            isolator: "1729-202",
            transformer: "7TS1-1",
            rating: "14,4/0,44 kV \u2022 225 kVA",
            incomingBreaker: "1752-144"
        },
        reserve: {
            source: "1QP \u2022 Barra II",
            sourceBreaker: "1752-118",
            isolator: "1729-204",
            transformer: "7TS1-2",
            rating: "14,4/0,44 kV \u2022 225 kVA",
            incomingBreaker: "1752-145"
        },
        tieBreaker: "1724-105",
        tieDelayMs: 2500,
        sections: [
            { id: "I", label: "BARRA I \u2022 440 V" },
            { id: "II", label: "BARRA II \u2022 440 V" }
        ],
        outgoing: [
            ...buildOutgoing("I", [
                ["1A", "Retificador 7qr - CTG / ISA ENERGIA"],
                ["1B", "QDRO 7qL 01 - Barra I"],
                ["1C", "Alimenta\u00e7\u00e3o QDRO 7qL01X - ISA ENERGIA - CSA-1"],
                ["1D", "QDCA 1 - ISA ENERGIA"],
                ["1E", "Servi\u00e7o Auxiliar da ITATIM"],
                ["2B", "Transformador 7TS1-1"],
                ["2C", "Trafo de controle / Rel\u00e9 m\u00ednima tens\u00e3o / Sobrecorrente de neutro"]
            ]),
            ...buildOutgoing("II", [
                ["3A", "Transformador 7TS1-2"],
                ["3C", "Trafo de controle / Rel\u00e9 m\u00ednima tens\u00e3o / Sobrecorrente de neutro"],
                ["4A", "QDRO 7qL 01 - Barra II"],
                ["4B", "5qA - 440 V - Pr\u00e9dio Administrativo"],
                ["4C", "Alimenta\u00e7\u00e3o DJ 1752-24 - ISA ENERGIA - Bay MIR-II C-1"],
                ["4D", "QDCA 2 - ISA ENERGIA"],
                ["4E", "Refeit\u00f3rio / Novo Almoxarifado"]
            ])
        ]
    },

    AUX_7QS2: {
        id: "AUX_7QS2",
        title: "7qS-2",
        subtitle: "Servi\u00e7o auxiliar 440 V \u2022 SE 440 kV \u2022 CSA-2",
        voltage: "440 V",
        layout: "four-section",
        normal: {
            source: "3QP \u2022 Barra II",
            sourceBreaker: "1752-137",
            isolator: "1729-242",
            transformer: "7TS2-1",
            rating: "14,4/0,44 kV \u2022 225 kVA",
            incomingBreaker: "1752-164"
        },
        reserve: {
            source: "3QP \u2022 Barra III",
            sourceBreaker: "1752-138",
            isolator: "1729-244",
            transformer: "7TS2-2",
            rating: "14,4/0,44 kV \u2022 225 kVA",
            incomingBreaker: "1752-165"
        },
        tieBreaker: "1724-110",
        tieDelayMs: 2500,
        extraTies: ["1724-112", "1724-113"],
        sections: [
            { id: "III", label: "BARRA III \u2022 440 V" },
            { id: "IV", label: "BARRA IV \u2022 440 V" }
        ],
        outgoing: [
            ...buildOutgoing("III", [
                ["1A", "Reserva", false],
                ["1B", "Reserva", false],
                ["1C", "Reserva", false],
                ["1D", "Reserva", false],
                ["1E", "7qL02-C1 - Barra I"],
                ["1F", "Bay UG-20 - Provis\u00f3rio"],
                ["1G", "SE-RET-02 - Provis\u00f3rio"],
                ["2A", "Principal BAY UG-01 e Reserva BAY UG-02"],
                ["2B", "Principal BAY UG-03 e Reserva BAY UG-04"],
                ["2C", "Principal BAY UG-05 e Reserva BAY UG-06"],
                ["2D", "Principal BAY UG-07 e Reserva BAY UG-08"],
                ["2E", "Reserva BAY UG-10", false],
                ["2F", "Principal BAY UG-11 e Reserva BAY UG-12"],
                ["2G", "Principal BAY UG-13 e Reserva BAY UG-14"],
                ["2H", "Principal BAY UG-15 e Reserva BAY UG-16"],
                ["2I", "Principal BAY UG-17 e Reserva BAY UG-18"],
                ["2J", "Principal BAY UG-19"],
                ["2K/L", "Reserva", false]
            ]),
            ...buildOutgoing("IV", [
                ["4A", "Principal BAY UG-02 e Reserva BAY UG-01"],
                ["4B", "Principal BAY UG-04 e Reserva BAY UG-03"],
                ["4C", "Principal BAY UG-06 e Reserva BAY UG-05"],
                ["4D", "Principal BAY UG-08 e Reserva BAY UG-07"],
                ["4E", "Principal BAY UG-10"],
                ["4F", "Principal BAY UG-12 e Reserva BAY UG-11"],
                ["4G", "Principal BAY UG-14 e Reserva BAY UG-13"],
                ["4H", "Principal BAY UG-16 e Reserva BAY UG-15"],
                ["4I", "Principal BAY UG-18 e Reserva BAY UG-17"],
                ["4J", "Reserva BAY UG-19", false],
                ["4K/L", "Reserva", false],
                ["5B", "Reserva", false],
                ["5C", "Reserva", false],
                ["5D", "Bay UG-09 - Provis\u00f3rio"],
                ["5E", "7qL02-C2 - Barra II"],
                ["5F", "SE-RET-01 - Provis\u00f3rio"],
                ["5G", "Reserva", false]
            ])
        ]
    },

    AUX_CMCS: {
        id: "AUX_CMCS",
        title: "CMCS",
        subtitle: "Centro de Motores dos Compressores \u2022 Galeria de Filtros UG-03 \u2022 cota 281,60",
        voltage: "440 V",
        layout: "single-bus-dual-incoming",
        defaultLeftClosed: true,
        defaultRightClosed: false,
        normal: {
            source: "1QP \u2022 Barra I",
            sourceBreaker: "1752-116",
            isolator: "",
            transformer: "TCS-1",
            rating: "14,4/0,44 kV \u2022 1000 kVA",
            incomingBreaker: "1752-256"
        },
        reserve: {
            source: "1QP \u2022 Barra III",
            sourceBreaker: "1752-126",
            isolator: "",
            transformer: "TCS-2",
            rating: "14,4/0,44 kV \u2022 1000 kVA",
            incomingBreaker: "1752-257"
        },
        transferDelayMs: 3000,
        sections: [
            { id: "BUS", label: "BARRAMENTO CMCS \u2022 440 V" }
        ],
        arcFlash: {
            distance: "1,586 m",
            incidentEnergy: "9,3 cal/cm\u00b2",
            ppe: "Vestimenta de seguran\u00e7a risco 4"
        },
        outgoing: [
            ...buildOutgoing("BUS", [
                ["G5C", "Compartimento de Entrada 2 - Comando", true, {
                    showBreaker: false,
                    switchable: false
                }],
                ["G5A", "Compartimento de Entrada 2 - Medi\u00e7\u00e3o", true, {
                    showBreaker: false,
                    switchable: false
                }],
                ["G4D", "DJ-CPSR-05 - Compressor 5"],
                ["G4C", "DJ-CPSR-04 - Compressor 4"],
                ["G4B", "Reserva", false],
                ["G4A", "Reserva", false],
                ["G3D", "DJ-CPSR-03 - Compressor 3"],
                ["G3C", "DJ-CPSR-02 - Compressor 2"],
                ["G3B", "DJ-CPSR-01 - Compressor 1"],
                ["G3A", "Reserva", false],
                ["G2A", "Coluna do CLP", true, {
                    showBreaker: false,
                    switchable: false
                }],
                ["G1C", "Compartimento de Entrada 1 - Comando", true, {
                    showBreaker: false,
                    switchable: false
                }],
                ["G1A", "Compartimento de Entrada 1 - Medi\u00e7\u00e3o e Comando", true, {
                    showBreaker: false,
                    switchable: false
                }]
            ])
        ]
    },

    AUX_8QV: {
        id: "AUX_8QV",
        title: "8qV",
        subtitle: "Quadro auxiliar 440 V \u2022 Sala de M\u00e1quinas \u2022 cota 284,90",
        voltage: "440 V",
        layout: "dual-bus-generator",
        normal: {
            source: "1QP \u2022 Barra II",
            sourceBreaker: "1752-119",
            isolator: "1729-246",
            transformer: "8TV-1",
            rating: "14,4/0,44 kV \u2022 750 kVA",
            incomingBreaker: "1752-166"
        },
        reserve: {
            source: "3QP \u2022 Barra II",
            sourceBreaker: "1752-136",
            isolator: "1729-248",
            transformer: "8TV-2",
            rating: "14,4/0,44 kV \u2022 750 kVA",
            incomingBreaker: "1752-167"
        },
        tieBreaker: "1724-111",
        tieDelayMs: 2500,
        generator: {
            id: "GD-03",
            firstBreaker: "1752-255",
            incomingBreaker: "1752-252",
            delayMs: 11000
        },
        sections: [
            { id: "I", label: "BARRA I \u2022 440 V" },
            { id: "II", label: "BARRA II \u2022 440 V" }
        ],
        arcFlash: {
            distance: "5,033 m",
            incidentEnergy: "61,7 cal/cm\u00b2",
            ppe: "Somente realizar manobras com o barramento desenergizado"
        },
        outgoing: [
            ...buildOutgoing("I", [
                ["1A", "Reserva", false],
                ["1B", "Quadro 8qL-4 - Automatismo das Bombas dos Po\u00e7os A e B"],
                ["1C", "Bomba de Drenagem 4 - Po\u00e7o A"],
                ["1D", "Tomadas Pares - Cabine de Manobras 1 a 10"],
                ["1E", "Bomba de Drenagem 2 - Po\u00e7o B"],
                ["1F", "Quadro 8qL (B-I) - Ilumina\u00e7\u00e3o - cota 284,90"],
                ["2A", "Quadro 8qV 01 - Motores VS-01"],
                ["2B", "Quadro 8qV 02 - Motores VS-02"],
                ["2C", "Quadro 8qV 03 - Motores VS-03"],
                ["2D", "Quadro 8qV 04 - Motores VS-04"],
                ["2E", "Quadro 8qV 05 - Motores VS-05"],
                ["2F", "Quadro 8qV 06 - Motores VS-06"],
                ["2G", "Quadro 8qV 07 - Motores VS-07"],
                ["2H", "Quadro 8qV 08 - Motores VS-08"],
                ["2I", "Quadro 8qV 09 - Motores VS-09"],
                ["2J", "Quadro 8qV 10 - Motores VS-10"],
                ["3C", "TRAFO de Controle", true, {
                    showBreaker: false,
                    switchable: false
                }]
            ]),
            ...buildOutgoing("II", [
                ["4C", "TRAFO de Controle", true, {
                    showBreaker: false,
                    switchable: false
                }],
                ["5A", "Quadro 8qV 11 - Motores VS-11"],
                ["5B", "Quadro 8qV 12 - Motores VS-12"],
                ["5C", "Quadro 8qV 13 - Motores VS-13"],
                ["5D", "Quadro 8qV 14 - Motores VS-14"],
                ["5E", "Quadro 8qV 15 - Motores VS-15"],
                ["5F", "Quadro 8qV 16 - Motores VS-16"],
                ["5G", "Quadro 8qV 17 - Motores VS-17"],
                ["5H", "Quadro 8qV 18 - Motores VS-18"],
                ["5I", "Quadro 8qV 19 - Motores VS-19"],
                ["5J", "Quadro 8qL (B-II) - Ilumina\u00e7\u00e3o - cota 284,90"],
                ["6A", "TRAFO 8TL-3 - cota 284,90 / Quadro 8qL-3 - cota 303,85"],
                ["6B", "Quadro 8qL 8 - Ilumina\u00e7\u00e3o B. Terra ME - cota 332,00"],
                ["6C", "Quadro 8QI - Ventila\u00e7\u00e3o Vertedouro"],
                ["6D", "Bomba de Drenagem 2 - Po\u00e7o A"],
                ["6E", "Bomba de Drenagem 1 - Po\u00e7o B"],
                ["6F", "Tomadas \u00cdmpares - Cabine de Manobras 11 a 19"]
            ])
        ]
    }
};

const normalizeId = value =>
    String(value ?? "")
        .trim()
        .toUpperCase()
        .replaceAll("-", "")
        .replaceAll("_", "");

const aliases = new Map();
Object.values(panels).forEach(panel => {
    aliases.set(normalizeId(panel.id), panel.id);
    aliases.set(normalizeId(panel.title), panel.id);
});

export const AuxDistributionDetailDatabase = {
    has(id) {
        return Boolean(this.get(id));
    },

    get(id) {
        const key = aliases.get(normalizeId(id));
        return key ? panels[key] ?? null : null;
    },

    toggleOutgoing(panelId, breakerId) {
        const panel = this.get(panelId);
        const breaker = panel?.outgoing.find(
            item => String(item.id) === String(breakerId)
        );

        if (
            !breaker ||
            breaker.available === false ||
            breaker.switchable === false
        ) {
            return null;
        }

        breaker.closed = !breaker.closed;
        return breaker;
    },

    reset(panelId) {
        const panel = this.get(panelId);
        if (!panel) return false;

        panel.outgoing.forEach(item => {
            item.closed = item.defaultClosed;
        });

        return true;
    }
};