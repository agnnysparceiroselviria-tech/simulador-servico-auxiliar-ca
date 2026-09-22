export const ScenarioNormal = {
  id: 'normal',
  name: 'NORMAL',
  description: 'CONFIGURAÇÃO NORMAL DE OPERAÇÃO DA USINA',

  engineProfile: {
    operationalUnits: ['UG01', 'UG02', 'UG11', 'UG12'],

    incomingSources: {
      107: 'UG01',
      108: 'UG11',
      109: 'UG02',
      110: 'UG11',
      111: 'UG01',
      112: 'UG12',
    },

    unitBreakers: {
      UG01: ['107', '111'],
      UG02: ['109'],
      UG11: ['108', '110'],
      UG12: ['112'],
    },

    normalBusSources: {
      '1QP': ['UG01', 'UG11', 'UG02'],
      '3QP': ['UG11', 'UG01', 'UG12'],
    },

    modernization: null,
  },

  //==================================================
  // ESCALA DO CONJUNTO SUPERIOR
  //==================================================

  upperAreaTransform: {
    scale: 1.15,

    originX: 5000,

    originY: 2100,
  },

  //==================================================
  // ESTADO DAS UNIDADES
  // CONFIGURAÇÃO NORMAL = TODAS AS UGs DISPONÍVEIS
  //==================================================

  units: {
    UG01: {
      available: true,
      running: true,
      maintenance: false,
    },

    UG02: {
      available: true,
      running: true,
      maintenance: false,
    },

    UG11: {
      available: true,
      running: true,
      maintenance: false,
    },

    UG12: {
      available: true,
      running: true,
      maintenance: false,
    },
  },

  //==================================================
  // GERADORES
  //==================================================

  generators: [
    {
      id: 'UG01',
      label: 'UG-01',
      x: 990,
      y: 650,
      color: '#3f7cff',
    },

    {
      id: 'UG02',
      label: 'UG-02',
      x: 3170,
      y: 650,
      color: '#e4c24a',
    },

    {
      id: 'UG11',
      label: 'UG-11',
      x: 4440,
      y: 650,
      color: '#ff44dd',
    },

    {
      id: 'UG12',
      label: 'UG-12',
      x: 6380,
      y: 650,
      color: '#44dd55',
    },
  ],

  //==================================================
  // REATORES / RE
  //==================================================

  relays: [
    {
      id: 'RE1',
      label: 'RE-1',
      x: 990,
      y: 860,
      color: '#3f7cff',
    },

    {
      id: 'RE2',
      label: 'RE-2',
      x: 3170,
      y: 860,
      color: '#e4c24a',
    },

    {
      id: 'RE3',
      label: 'RE-3',
      x: 4440,
      y: 860,
      color: '#ff44dd',
    },

    {
      id: 'RE4',
      label: 'RE-4',
      x: 6380,
      y: 860,
      color: '#44dd55',
    },
  ],

  //==================================================
  // SAÃDAS DAS UGs PARA OS TRs ELEVADORES / SE 440 kV
  //==================================================

  stepUpBranches: [
    {
      id: 'STEP_UP_UG01',
      generator: 'UG01',
      direction: 'left',

      transformerLabel: 'TR-1',
      power: '205 MVA',
      voltage: '14,4/440 kV',

      transformerX: 720,
      transformerY: 800,
      takeoffX: 990,
      takeoffY: 800,
      takeoffNodeRadius: 6,
      transformerRadius: 54,

      breaker: '1',
      breakerX: 525,

      groundSwitchTag: '1729-1',
      groundSwitchX: 580,

      arrowX: 375,
      seLabel: 'SE 440 kV',

      color: '#7a858d',
    },

    {
      id: 'STEP_UP_UG02',
      generator: 'UG02',
      direction: 'right',

      transformerLabel: 'TR-2',
      power: '205 MVA',
      voltage: '14,4/440 kV',

      transformerX: 3365,
      transformerY: 800,
      takeoffX: 3170,
      takeoffY: 800,
      takeoffNodeRadius: 6,
      transformerRadius: 54,

      breaker: '2',
      breakerX: 3510,

      groundSwitchTag: '1729-3',
      groundSwitchX: 3565,

      arrowX: 3710,
      seLabel: 'SE 440 kV',

      color: '#7a858d',
    },

    {
      id: 'STEP_UP_UG11',
      generator: 'UG11',
      direction: 'left',

      transformerLabel: 'TR-11',
      power: '205 MVA',
      voltage: '14,4/440 kV',

      transformerX: 4245,
      transformerY: 800,
      takeoffX: 4440,
      takeoffY: 800,
      takeoffNodeRadius: 6,
      transformerRadius: 54,

      breaker: '11',
      breakerX: 4050,

      groundSwitchTag: '1729-21',
      groundSwitchX: 4105,

      arrowX: 3945,
      seLabel: 'SE 440 kV',

      color: '#7a858d',
    },

    {
      id: 'STEP_UP_UG12',
      generator: 'UG12',
      direction: 'right',

      transformerLabel: 'TR-12',
      power: '205 MVA',
      voltage: '14,4/440 kV',

      transformerX: 6565,
      transformerY: 800,
      takeoffX: 6380,
      takeoffY: 800,
      takeoffNodeRadius: 6,
      transformerRadius: 54,

      breaker: '12',
      breakerX: 6710,

      groundSwitchTag: '1729-23',
      groundSwitchX: 6765,

      arrowX: 6910,
      seLabel: 'SE 440 kV',

      color: '#7a858d',
    },
  ],

  //==================================================
  // FONTES EXTERNAS - SE 138 kV
  //==================================================

  externalSources: [
    {
      id: 'SE138_1QP',
      label: 'SE 138 kV',
      breaker: '102',
      tagInside: '1729-44',
      tagBottom: '1729-250',
      x: 2200,
      y: 720,
      width: 560,
      height: 270,
      color: '#7a858d',
    },

    {
      id: 'SE138_3QP',
      label: 'SE 138 kV',
      breaker: '105',
      tagInside: '1729-48',
      tagBottom: '1729-252',
      x: 5240,
      y: 720,
      width: 560,
      height: 270,
      color: '#7a858d',
    },
  ],

  //==================================================
  // PAINÃ‰IS DE DISTRIBUIÃ‡ÃƒO pCA - PARTE INFERIOR
  // NOVO PADRÃƒO EM GRUPOS P/R
  //==================================================

  pcaPanels: [
    //==================================================
    // CF-pCA-P14 / CF-pCA-R14
    //==================================================

    {
      id: 'P14_R14',
      type: 'pcaGroup',

      x: 1550,
      y: 2790,
      // Moldura e barramentos reduzidos, sem mover os equipamentos.
      width: 1400,
      panelHeight: 90,
      gap: 700,

      topPanel: {
        label: 'CF-pCA-P14',
        color: '#3f7cff',
      },

      bottomPanel: {
        label: 'CF-pCA-R14',
        color: '#44dd55',
        labelY: 3638,
      },

      topIncoming: {
        x: 2150,
        sourceNumber: '5',
        breaker: '52-E1',
        time: '2,5 s',
        transformer: true,
        labels: ['CF-STS-P14', 'CF-TSA-P14', '1500 kVA', '14,4/0,44 kV'],
      },

      bottomIncoming: {
        x: 2150,
        sourceNumber: '21',
        breaker: '52-E1',
        time: '2,5 s',
        transformer: true,
        labels: ['CF-TSA-R14', '1500 kVA', '14,4/0,44 kV', 'CF-STS-R14'],
      },

      loads: [
        {
          id: 'CCM-U01',
          label: 'CCM-U01',
          x: 1660,
          boxColor: '#3f7cff',
          boxStrokeColor: '#3f7cff',

          topBreaker: '52-1',
          topBreakerX: 1605,
          bottomBreaker: '52-1',
          bottomBreakerX: 1605,
          bottomLineX: 1605,

          upperSwitches: [
            {
              label: '21101',
              x: 1605,
              labelOrientation: 'vertical',
              verticalLabelY: 3120,
              labelSize: 28,
            },
            {
              // DJ de acoplamento do GAE provisório ao CCM-U01.
              // Comandável em Liga / Desliga pelo Engine.
              label: '21103',
              x: 1715,
              state: 'open',
              closed: false,
              labelOrientation: 'vertical',
              verticalLabelY: 3120,
              labelSize: 28,
              connectToBox: true,
            },
          ],

          lowerSwitches: [
            {
              label: '21102',
              x: 1605,
              time: '3s',
              labelOrientation: 'vertical',
              labelSize: 28,
              timePosition: 'right',
              timeOffset: 12,
            },
          ],
        },

        {
          id: 'CM-2',
          label: 'CM-2',
          x: 1930,
          boxColor: '#3f7cff',

          available: true,
          maintenance: false,

          topBreaker: '52-2',
          bottomBreaker: '52-2',
          bottom: true,
        },

        {
          id: 'CCM-U03',
          label: 'CCM-U03',
          x: 2220,
          boxColor: '#3f7cff',

          topBreaker: '52-3',
          bottomBreaker: '52-3',

          midBreaker: '52-E1',

          lowerSwitches: [
            {
              label: '52-E2',
              x: 2220,
              time: '3s',
              labelPosition: 'right',
              timePosition: 'belowLabel',
              labelOffset: 12,
              timeBelowLabelY: 24,
            },
          ],
        },

        {
          id: 'CCM-U04',
          label: 'CCM-U04',
          x: 2500,
          boxColor: '#44dd55',

          topBreaker: '52-4',
          bottomBreaker: '52-4',

          upperSwitches: [
            {
              label: '21401',
              x: 2500,
              time: '3s',
              labelPosition: 'right',
              timePosition: 'belowLabel',
              labelOffset: 12,
              timeBelowLabelY: 24,
            },
          ],

          lowerSwitches: [
            {
              label: '21402',
              x: 2500,
              labelPosition: 'right',
              labelOffset: 12,
            },
          ],
        },

        {
          id: 'CG-QGE-01',
          label: 'CG-QGE-01',
          x: 2800,
          boxColor: '#3f7cff',

          topBreaker: '52-5',
          topBreakerX: 2735,
          bottom: false,

          upperSwitches: [
            {
              label: '52-1A',
              x: 2735,
              labelPosition: 'left',
              labelOffset: 18,
            },
            {
              label: '52-2A',
              x: 2845,
              time: '10s',
              labelPosition: 'right',
              timePosition: 'belowLabel',
              labelOffset: 18,
              timeBelowLabelY: 24,
              connectToBox: true,
            },
          ],

          smallTransformer: {
            x: 2735,
            y: 2990,
            color: '#3f7cff',
            labels: ['CG-TCG-01', '440 / 220 V', '300 kVA'],
          },
        },
      ],

      generators: [
        {
          label: ['GD', 'PROV'],
          x: 1810,
          y: 3020,
          color: '#263238',
          radius: 42,

          // DJ do GAE provisório
          // ID lógico usado pelo Engine para Liga / Desliga.
          breaker: '52-1',

          // Mantém o desenho como estava: sem repetir a tag ao lado
          // do pequeno DJ abaixo do GD PROV.
          breakerLabel: '',

          showBreaker: true,
          breakerX: 1810,
          breakerY: 3090,
        },

        {
          label: ['GD', 'COG'],
          x: 3055,

          // Ajuste fino do GAE COG:
          // entrada do GAE elevada para ficar acima
          // dos DJs 52-2A e 52-2B, conforme referência.
          y: 2980,

          color: '#263238',
          radius: 42,

          breaker: '52-G',
          time: '10s',

          breakerX: 3055,
          breakerY: 3045,

          breakerLabelPosition: 'right',
          breakerTimePosition: 'belowLabel',
          breakerLabelOffset: 18,
          breakerTimeBelowLabelY: 24,
        },
      ],

      interlinks: [
        {
          // GAE provisório: linha ajustada para passar no centro do DJ 21103.
          id: 'LINK_GD_PROV_CCM_U01',
          color: '#263238',
          width: 1.55,
          points: [
            { x: 1810, y: 3105 },
            { x: 1810, y: 3125 },
            { x: 1715, y: 3125 },
            { x: 1715, y: 3166 },
          ],
        },
        {
          // Barramento do GAE COG reposicionado acima dos DJs 52-2A e 52-2B,
          // para que a linha entre pelo topo dos disjuntores.
          id: 'LINK_GD_COG',
          color: '#263238',
          width: 1.55,
          points: [
            { x: 2845, y: 3088 },
            { x: 3265, y: 3088 },
          ],
        },
        {
          // Descida do DJ 52-G até o novo barramento horizontal superior.
          id: 'LINK_GD_COG_DROP',
          color: '#263238',
          width: 1.55,
          points: [
            { x: 3055, y: 3060 },
            { x: 3055, y: 3088 },
          ],
        },
        {
          // Entrada superior no DJ 52-2A.
          id: 'LINK_GD_COG_52_2A_DROP',
          color: '#263238',
          width: 1.55,
          points: [
            { x: 2845, y: 3088 },
            { x: 2845, y: 3138 },
          ],
        },
        {
          // Entrada superior no DJ 52-2B.
          id: 'LINK_GD_COG_52_2B_DROP',
          color: '#263238',
          width: 1.55,
          points: [
            { x: 3265, y: 3088 },
            { x: 3265, y: 3138 },
          ],
        },
      ],
    },

    //==================================================
    // CF-pCA-P58 / CF-pCA-R58
    //==================================================

    {
      id: 'P58_R58',
      type: 'pcaGroup',

      x: 3200,
      y: 2790,

      /*
       * Moldura e barramentos reduzidos, preservando as posiÃ§Ãµes de:
       * CG-QGE-02, CM-5, CM-6, CCM-U07 e CM-8.
       */
      width: 1400,
      panelHeight: 90,
      gap: 700,

      topPanel: {
        label: 'CF-pCA-P58',
        color: '#44dd55',
      },

      bottomPanel: {
        label: 'CF-pCA-R58',
        color: '#ff44dd',
        labelY: 3638,
      },

      topIncoming: {
        x: 3800,
        sourceNumber: '23',
        breaker: '52-E1',
        time: '2,5 s',
        transformer: true,
        labels: ['CF-STS-P58', 'CF-TSA-P58', '1500 kVA', '14,4/0,44 kV'],
      },

      bottomIncoming: {
        x: 3800,
        sourceNumber: '19',
        breaker: '52-E1',
        time: '2,5 s',
        transformer: true,
        labels: ['CF-TSA-R58', '1500 kVA', '14,4/0,44 kV', 'CF-STS-R58'],
      },

      loads: [
        {
          id: 'CG-QGE-02',
          label: 'CG-QGE-02',
          x: 3310,
          boxColor: '#44dd55',

          topBreaker: '52-5',
          bottom: false,

          upperSwitches: [
            {
              label: '52-1B',
              x: 3310,
              labelPosition: 'right',
              labelOffset: 18,
            },
            {
              label: '52-2B',
              x: 3265,
              time: '10s',

              /*
               * Tag principal Ã  esquerda, tempo logo abaixo
               * e linha de ligaÃ§Ã£o atÃ© o CG-QGE-02.
               */
              labelPosition: 'left',
              timePosition: 'belowLabel',
              labelOffset: 18,
              timeBelowLabelY: 24,
              connectToBox: true,
            },
          ],

          smallTransformer: {
            x: 3310,

            /*
             * Transformador CG-TCG-02 aproximado do barramento,
             * conforme o ajuste fino solicitado.
             */
            y: 2990,
            color: '#44dd55',
            labels: ['CG-TCG-02', '440 / 220 V', '300 kVA'],
          },
        },

        {
          id: 'CM-5',
          label: 'CM-5',
          x: 3580,
          boxColor: '#44dd55',

          topBreaker: '52-1',
          bottomBreaker: '52-1',

          midBreaker: '216',

          lowerSwitches: [
            {
              label: '217',
              x: 3580,
              time: '3s',
              labelPosition: 'right',
              timePosition: 'belowLabel',
              labelOffset: 12,
              timeBelowLabelY: 24,
            },
          ],
        },

        {
          id: 'CM-6',
          label: 'CM-6',
          x: 3870,
          boxColor: '#ff44dd',

          topBreaker: '52-2',
          bottomBreaker: '52-2',

          upperSwitches: [
            {
              label: '219',
              x: 3870,
              time: '3s',
              labelPosition: 'right',
              timePosition: 'belowLabel',
              labelOffset: 12,
              timeBelowLabelY: 24,
            },
          ],

          lowerSwitches: [
            {
              label: '218',
              x: 3870,
              labelPosition: 'right',
              labelOffset: 12,
            },
          ],
        },

        {
          id: 'CCM-U07',
          label: 'CCM-U07',
          x: 4150,
          boxColor: '#44dd55',

          topBreaker: '52-3',
          bottomBreaker: '52-3',

          midBreaker: '52-E1',

          lowerSwitches: [
            {
              label: '52-E2',
              x: 4150,
              time: '3s',
              labelPosition: 'right',
              timePosition: 'belowLabel',
              labelOffset: 12,
              timeBelowLabelY: 24,
            },
          ],
        },

        {
          id: 'CM-8',
          label: 'CM-8',
          x: 4450,
          boxColor: '#ff44dd',

          topBreaker: '52-4',
          bottomBreaker: '52-4',

          upperSwitches: [
            {
              label: '223',
              x: 4450,
              time: '3s',
              labelPosition: 'right',
              timePosition: 'belowLabel',
              labelOffset: 12,
              timeBelowLabelY: 24,
            },
          ],

          lowerSwitches: [
            {
              label: '222',
              x: 4450,
              labelPosition: 'right',
              labelOffset: 12,
            },
          ],
        },
      ],
    },

    //==================================================
    // CF-pCA-P0912 / CF-pCA-R0912
    //==================================================

    {
      id: 'P0912_R0912',
      type: 'pcaGroup',

      x: 4850,
      y: 2790,

      // Barramento encurtado: termina logo após o último DJ do painel.
      width: 1100,
      panelHeight: 90,
      gap: 700,

      topPanel: {
        label: 'CF-pCA-P0912',
        color: '#ff44dd',
      },

      bottomPanel: {
        label: 'CF-pCA-R0912',
        color: '#44dd55',
        labelY: 3638,
      },

      topIncoming: {
        x: 5450,
        sourceNumber: '10',
        breaker: '20501',
        time: '2,5 s',
        transformer: true,
        labels: ['CF-STS-P0912', 'CF-TSA-P0912', '1500 kVA', '14,4/0,44 kV'],
      },

      bottomIncoming: {
        x: 5450,
        sourceNumber: '30',
        breaker: '20601',
        time: '2,5 s',
        transformer: true,
        labels: ['CF-TSA-R0912', '1500 kVA', '14,4/0,44 kV', 'CF-STS-R0912'],
      },

      loads: [
        {
          id: 'CCM-U09',
          label: 'CCM-U09',
          x: 4960,
          boxColor: '#ff44dd',

          topFeeder: '20511',
          topFeederY: 3070,

          bottomFeeder: '20611',
          bottomFeederY: 3495,

          upperSwitches: [
            {
              label: '21901',
              x: 4960,
              labelPosition: 'right',
              labelOffset: 12,
            },
          ],

          lowerSwitches: [
            {
              label: '21902',
              x: 4960,
              time: '3s',
              labelPosition: 'right',
              timePosition: 'belowLabel',
              labelOffset: 12,
              timeBelowLabelY: 24,
            },
          ],
        },

        {
          id: 'CM-10',
          label: 'CM-10',
          x: 5230,
          boxColor: '#44dd55',

          topFeeder: '20512',
          topFeederY: 3070,

          bottomFeeder: '20612',
          bottomFeederY: 3495,

          upperSwitches: [
            {
              label: '227',
              x: 5230,
              time: '3s',
              labelPosition: 'right',
              timePosition: 'belowLabel',
              labelOffset: 12,
              timeBelowLabelY: 24,
            },
          ],

          lowerSwitches: [
            {
              label: '226',
              x: 5230,
              labelPosition: 'right',
              labelOffset: 12,
            },
          ],
        },

        {
          id: 'CM-11',
          label: 'CM-11',
          x: 5520,
          boxColor: '#ff44dd',

          boxStrokeColor: '#ff44dd',
          topBreakerX: 5460,
          bottomBreakerX: 5460,
          bottomLineX: 5460,

          topFeeder: '20513',
          topFeederY: 3070,

          bottomFeeder: '20613',
          bottomFeederY: 3495,

          upperSwitches: [
            {
              label: '228',
              x: 5460,
              labelPosition: 'left',
              labelOffset: 12,
            },
            {
              label: '250',
              x: 5580,
              state: 'open',
              labelPosition: 'left',
              labelOffset: 12,
              connectToBox: true,
            },
          ],

          lowerSwitches: [
            {
              label: '229',
              x: 5460,
              time: '3s',
              labelPosition: 'left',
              timePosition: 'right',
              labelOffset: 10,
              timeOffset: 12,
            },
          ],
        },

        {
          id: 'CM-12',
          label: 'CM-12',
          x: 5800,
          boxColor: '#44dd55',

          boxStrokeColor: '#44dd55',
          topBreakerX: 5860,
          bottomBreakerX: 5860,
          bottomLineX: 5860,

          topFeeder: '20514',
          topFeederY: 3070,

          bottomFeeder: '20614',
          bottomFeederY: 3495,

          upperSwitches: [
            {
              label: '251',
              x: 5740,
              state: 'open',
              labelPosition: 'right',
              labelOffset: 12,
              connectToBox: true,
            },
            {
              label: '231',
              x: 5860,
              time: '3s',
              labelPosition: 'right',
              timePosition: 'belowLabel',
              labelOffset: 12,
              timeBelowLabelY: 24,
            },
          ],

          lowerSwitches: [
            {
              label: '230',
              x: 5860,
              labelPosition: 'right',
              labelOffset: 12,
            },
          ],
        },
      ],

      generators: [
        {
          /*
           * GD-2 centralizado entre o CM-11 e o CM-12.
           * Conjunto elevado para manter o barramento acima dos DJs 250 e 251.
           */
          label: 'GD-2',
          x: 5660,
          y: 2985,
          color: '#263238',
          radius: 42,

          breaker: '254',
          time: '11s',

          breakerX: 5660,
          breakerY: 3045,
          breakerLabelPosition: 'right',
          breakerTimePosition: 'belowLabel',
          breakerLabelOffset: 12,
          breakerTimeBelowLabelY: 24,
        },
      ],

      interlinks: [
        {
          /*
           * Barramento do GD-2 limitado aos eixos
           * dos DJs 250 e 251.
           */
          id: 'LINK_GD_2',
          color: '#263238',
          width: 1.55,
          points: [
            { x: 5580, y: 3075 },
            { x: 5740, y: 3075 },
          ],
        },
        {
          id: 'LINK_GD_2_DROP',
          color: '#263238',
          width: 1.55,
          points: [
            { x: 5660, y: 3060 },
            { x: 5660, y: 3075 },
          ],
        },
        {
          id: 'LINK_GD_2_250',
          color: '#263238',
          width: 1.55,
          points: [
            { x: 5580, y: 3075 },
            { x: 5580, y: 3166 },
          ],
        },
        {
          id: 'LINK_GD_2_251',
          color: '#263238',
          width: 1.55,
          points: [
            { x: 5740, y: 3075 },
            { x: 5740, y: 3166 },
          ],
        },
      ],

      reserve: {
        // DJ de reserva aproximado do novo fim do barramento.
        x: 6020,
        y: 3265,
        label: 'CF-QCF-0912',
        fromX: 5955,
      },
    },

    //==================================================
    // CF-pCA-P1316 / CF-pCA-R1316
    //==================================================

    {
      id: 'P1316_R1316',
      type: 'pcaGroup',

      // VÃ£o de 350 apÃ³s o P0912 para liberar a saÃ­da do DJ reserva.
      x: 6350,
      y: 2790,

      // Barramento encurtado: termina logo após o último DJ do painel.
      width: 1050,
      panelHeight: 90,
      gap: 700,

      topPanel: {
        label: 'CF-pCA-P1316',
        color: '#ff44dd',
      },

      bottomPanel: {
        label: 'CF-pCA-R1316',
        color: '#3f7cff',
        labelY: 3638,
      },

      topIncoming: {
        x: 6950,
        sourceNumber: '8',
        breaker: '20701',
        time: '2,5 s',
        transformer: true,
        labels: ['CF-STS-P1316', 'CF-TSA-P1316', '1500 kVA', '14,4/0,44 kV'],
      },

      bottomIncoming: {
        x: 6950,
        sourceNumber: '12',
        breaker: '20801',
        time: '2,5 s',
        transformer: true,
        labels: ['CF-TSA-R1316', '1500 kVA', '14,4/0,44 kV', 'CF-STS-R1316'],
      },

      loads: [
        {
          id: 'CCM-U13',
          label: 'CCM-U13',
          x: 6460,
          boxColor: '#ff44dd',

          topFeeder: '20711',
          topFeederY: 3070,

          bottomFeeder: '20811',
          bottomFeederY: 3495,

          upperSwitches: [
            {
              label: '22301',
              x: 6460,
              labelPosition: 'right',
              labelOffset: 12,
            },
          ],

          lowerSwitches: [
            {
              label: '22302',
              x: 6460,
              time: '3s',
              labelPosition: 'right',
              timePosition: 'belowLabel',
              labelOffset: 12,
              timeBelowLabelY: 24,
            },
          ],
        },

        {
          id: 'CM-14',
          label: 'CM-14',
          x: 6730,
          boxColor: '#3f7cff',

          topFeeder: '20712',
          topFeederY: 3070,

          bottomFeeder: '20812',
          bottomFeederY: 3495,

          upperSwitches: [
            {
              label: '235',
              x: 6730,
              time: '3s',
              labelPosition: 'right',
              timePosition: 'belowLabel',
              labelOffset: 12,
              timeBelowLabelY: 24,
            },
          ],

          lowerSwitches: [
            {
              label: '234',
              x: 6730,
              labelPosition: 'right',
              labelOffset: 12,
            },
          ],
        },

        {
          id: 'CM-15',
          label: 'CM-15',
          x: 7020,
          boxColor: '#ff44dd',

          topFeeder: '20713',
          topFeederY: 3070,

          bottomFeeder: '20813',
          bottomFeederY: 3495,

          upperSwitches: [
            {
              label: '236',
              x: 7020,
              labelPosition: 'right',
              labelOffset: 12,
            },
          ],

          lowerSwitches: [
            {
              label: '237',
              x: 7020,
              time: '3s',
              labelPosition: 'right',
              timePosition: 'belowLabel',
              labelOffset: 12,
              timeBelowLabelY: 24,
            },
          ],
        },

        {
          id: 'CM-16',
          label: 'CM-16',
          x: 7300,
          boxColor: '#3f7cff',

          topFeeder: '20714',
          topFeederY: 3070,

          bottomFeeder: '20814',
          bottomFeederY: 3495,

          upperSwitches: [
            {
              label: '239',
              x: 7300,
              time: '3s',
              labelPosition: 'right',
              timePosition: 'belowLabel',
              labelOffset: 12,
              timeBelowLabelY: 24,
            },
          ],

          lowerSwitches: [
            {
              label: '238',
              x: 7300,
              labelPosition: 'right',
              labelOffset: 12,
            },
          ],
        },
      ],

      reserve: {
        // DJ de reserva aproximado do novo fim do barramento.
        x: 7470,
        y: 3265,
        label: 'Reserva',
        fromX: 7405,
      },
    },

    //==================================================
    // CF-pCA-P1720 / CF-pCA-R1720
    //==================================================

    {
      id: 'P1720_R1720',
      type: 'pcaGroup',

      // VÃ£o de 350 apÃ³s o P1316 para liberar a saÃ­da do DJ reserva.
      x: 7750,
      y: 2790,

      // Barramento encurtado: termina logo após o último DJ do painel.
      width: 1050,
      panelHeight: 90,
      gap: 700,

      topPanel: {
        label: 'CF-pCA-P1720',
        color: '#ff44dd',
      },

      bottomPanel: {
        label: 'CF-pCA-R1720',
        color: '#44dd55',

        // Tag posicionada abaixo da moldura do painel R
        labelY: 3638,
      },

      topIncoming: {
        x: 8350,
        sourceNumber: '6',
        breaker: '20901',
        time: '2,5 s',
        transformer: true,
        labels: ['CF-STS-P1720', 'CF-TSA-P1720', '1500 kVA', '14,4/0,44 kV'],
      },

      bottomIncoming: {
        x: 8350,
        sourceNumber: '28',
        breaker: '21001',
        time: '2,5 s',
        transformer: true,
        labels: ['CF-TSA-R1720', '1500 kVA', '14,4/0,44 kV', 'CF-STS-R1720'],
      },

      loads: [
        {
          id: 'CM-17',
          label: 'CM-17',
          x: 7860,
          boxColor: '#ff44dd',
          topFeeder: '20911',
          topFeederY: 3070,

          bottomFeeder: '21011',
          bottomFeederY: 3495,
          upperSwitches: [
            {
              label: '240',
              x: 7860,
              labelPosition: 'right',
              labelOffset: 12,
            },
          ],
          lowerSwitches: [
            {
              label: '241',
              x: 7860,
              time: '3s',

              labelPosition: 'right',
              timePosition: 'belowLabel',

              labelOffset: 12,
              timeBelowLabelY: 24,
            },
          ],
        },

        {
          id: 'CM-18',
          label: 'CM-18',
          x: 8130,
          boxColor: '#44dd55',
          topFeeder: '20912',
          topFeederY: 3070,

          bottomFeeder: '21012',
          bottomFeederY: 3495,
          upperSwitches: [
            {
              label: '243',
              x: 8130,
              time: '3s',

              labelPosition: 'right',
              timePosition: 'belowLabel',

              labelOffset: 12,
              timeBelowLabelY: 24,
            },
          ],
          lowerSwitches: [
            {
              label: '242',
              x: 8130,

              labelPosition: 'right',
              labelOffset: 12,
            },
          ],
        },

        {
          id: 'CM-19',
          label: 'CM-19',
          x: 8420,
          boxColor: '#ff44dd',
          topFeeder: '20913',
          topFeederY: 3070,

          bottomFeeder: '21013',
          bottomFeederY: 3495,
          upperSwitches: [
            {
              label: '244',
              x: 8420,
              labelPosition: 'right',
              labelOffset: 12,
            },
          ],
          lowerSwitches: [
            {
              label: '245',
              x: 8420,
              time: '3s',

              labelPosition: 'right',
              timePosition: 'belowLabel',

              labelOffset: 12,
              timeBelowLabelY: 24,
            },
          ],
        },

        {
          id: 'CCM-U20',
          label: 'CCM-U20',
          x: 8700,
          boxColor: '#44dd55',
          topFeeder: '20914',
          topFeederY: 3070,

          bottomFeeder: '21014',
          bottomFeederY: 3495,
          upperSwitches: [
            {
              label: '23001',
              x: 8700,
              time: '3s',

              labelPosition: 'right',
              timePosition: 'belowLabel',

              labelOffset: 12,
              timeBelowLabelY: 24,
            },
          ],
          lowerSwitches: [
            {
              label: '23002',
              x: 8700,

              labelPosition: 'right',
              labelOffset: 12,
            },
          ],
        },
      ],

      reserve: {
        // DJ de reserva aproximado do novo fim do barramento.
        x: 8870,
        y: 3265,
        label: 'Reserva',
        fromX: 8805,
      },
    },
  ],
  //==================================================
  // PAINÃ‰IS AUXILIARES - 7qS, CMCS, qA, 8qV
  //==================================================

  auxPanels: [
    //==================================================
    // IHM SE - SE do HM / TRHM-1 / TRHM-2
    //==================================================

    {
      id: 'AUX_IHM_SE',
      type: 'seIhm',
      label: 'SE do HM',

      // Acima do 5qA
      // y menor = sobe / afasta do 5qA
      // Reaproximado do conjunto dos demais quadros.
      // Mantém uma folga antes do CF-pCA-P14.
      x: 1100,
      y: 2750,

      leftSource: '17',
      rightSource: '11',

      leftBreaker: '1729-254',
      rightBreaker: '1729-258',
      busBreakerLeft: '1729-256',

      leftTransformer: 'TRHM-1',
      rightTransformer: 'TRHM-2',

      power: '750kVA',
      voltage: '14,4/0,44 kV',

      color: '#ff44dd',
      textColor: '#263238',

      // Aumentado o quadrado externo do SE
      panelWidth: 620,
      panelHeight: 520,

      outputs: [
        { label: 'E1 (440V)', x: 940 },
        { label: 'E2 (440V)', x: 1020 },
        { label: 'E3 (440V)', x: 1100 },
        { label: 'E4 (440V)', x: 1180 },
        { label: 'E5 (440V)', x: 1260 },
      ],
    },

    //==================================================
    // 5qA - Alimentado por 1QD-SA3 e 7qS-1
    //==================================================

    {
      id: 'AUX_5QA',
      type: 'fiveQa',
      label: '5qA',

      // Reaproximado do conjunto dos demais quadros.
      x: 1100,
      y: 3450,

      leftSource: '31',
      qdLabel: '1QD-SA3',
      qdBreaker: '260',
      qdTag: '1729-229',

      leftTrafo: '5TA1',
      leftPower: '300 kVA',
      leftVoltage: '14,4/0,22 kV',
      leftPanelBreaker: '258',

      rightTitle: '7qS-1  SE 440kV',
      rightSubtitle: 'GAV. 4B',
      rightPanelBreaker: '259',
      rightVoltage: '440V',

      auxBreaker: '24-11',
      threeCBreaker: '3C',

      bottomTrafo: '5TA2',
      bottomPower: '150 kVA',
      bottomVoltage: '440/220V',

      colorLeft: '#3f7cff',
      colorRight: '#ff7a1a',
      colorAux: '#38e8ff',

      panelWidth: 560,
      panelHeight: 250,
    },

    //==================================================
    // 7qS-1
    //==================================================

    {
      id: 'AUX_7QS1',
      label: '7qS-1',

      // Fileira auxiliar compactada: passo horizontal de 750.
      x: 1750,
      y: 4000,

      leftSource: '9',
      rightSource: '11',

      leftTransformer: '7TS1-1',
      rightTransformer: '7TS1-2',

      power: '225 kVA',
      voltage: '14,4/0,44 kV',

      leftBreaker: '144',
      rightBreaker: '145',
      leftBreakerState: 'closed',
      rightBreakerState: 'closed',

      mainBreaker: '105',
      mainTime: '2,5 s',
      mainBreakerState: 'openAuto',

      colorLeft: '#3f7cff',
      colorRight: '#ff44dd',

      panelWidth: 170,
      panelHeight: 110,
    },

    //==================================================
    // 7qS-2
    //==================================================

    {
      id: 'AUX_7QS2',
      label: '7qS-2',

      x: 2500,
      y: 4000,

      leftSource: '20',
      rightSource: '22',

      leftTransformer: '7TS2-1',
      rightTransformer: '7TS2-2',

      power: '225 kVA',
      voltage: '14,4/0,44 kV',

      leftBreaker: '164',
      rightBreaker: '165',
      leftBreakerState: 'closed',
      rightBreakerState: 'closed',

      mainBreaker: '110',
      mainTime: '2,5 s',
      mainBreakerState: 'openAuto',

      colorLeft: '#3f7cff',
      colorRight: '#44dd55',

      panelWidth: 170,
      panelHeight: 110,
    },

    //==================================================
    // CMCS
    //==================================================

    {
      id: 'AUX_CMCS',
      label: 'CMCS',

      x: 3250,
      y: 4000,

      leftSource: '7',
      rightSource: '33',

      leftTransformer: '1TCS-1',
      rightTransformer: '1TCS-2',

      power: '1000 kVA',
      voltage: '14,4/0,44 kV',

      leftBreaker: '256',
      rightBreaker: '257',
      leftBreakerState: 'openAuto',
      rightBreakerState: 'openAuto',

      mainBreaker: '',
      mainTime: '',
      mainBreakerState: 'open',

      colorLeft: '#3f7cff',
      colorRight: '#e4c24a',

      panelWidth: 170,
      panelHeight: 110,
    },

    //==================================================
    // 1qA
    //==================================================

    {
      id: 'AUX_1QA',
      label: '1qA',

      x: 4000,
      y: 4000,

      leftSource: '3',
      rightSource: '24',

      leftTransformer: '1TA-1',
      rightTransformer: '1TA-2',

      power: '1500 kVA',
      voltage: '14,4/0,44 kV',

      leftBreaker: '146',
      rightBreaker: '147',
      leftBreakerState: 'closed',
      rightBreakerState: 'closed',

      mainBreaker: '106',
      mainTime: '2,5 s',
      mainBreakerState: 'openAuto',

      colorLeft: '#3f7cff',
      colorRight: '#44dd55',

      panelWidth: 170,
      panelHeight: 110,
    },

    //==================================================
    // 2qA
    //==================================================

    {
      id: 'AUX_2QA',
      label: '2qA',

      x: 4750,
      y: 4000,

      leftSource: '4',
      rightSource: '25',

      leftTransformer: '2TA-1',
      rightTransformer: '2TA-2',

      power: '1500 kVA',
      voltage: '14,4/0,44 kV',

      leftBreaker: '150',
      rightBreaker: '151',
      leftBreakerState: 'closed',
      rightBreakerState: 'closed',

      mainBreaker: '107',
      mainTime: '2,5 s',
      mainBreakerState: 'openAuto',

      colorLeft: '#ff44dd',
      colorRight: '#e4c24a',

      panelWidth: 170,
      panelHeight: 110,
    },

    //==================================================
    // 3qA
    //==================================================

    {
      id: 'AUX_3QA',
      label: '3qA',

      x: 5500,
      y: 4000,

      leftSource: '2',
      rightSource: '27',

      leftTransformer: '3TA-1',
      rightTransformer: '3TA-2',

      power: '1500 kVA',
      voltage: '14,4/0,44 kV',

      leftBreaker: '154',
      rightBreaker: '155',
      leftBreakerState: 'closed',
      rightBreakerState: 'closed',

      mainBreaker: '108',
      mainTime: '2,5 s',
      mainBreakerState: 'openAuto',

      colorLeft: '#ff44dd',
      colorRight: '#e4c24a',

      panelWidth: 170,
      panelHeight: 110,
    },

    //==================================================
    // 4qA
    //==================================================

    {
      id: 'AUX_4QA',
      label: '4qA',

      x: 6250,
      y: 4000,

      leftSource: '1',
      rightSource: '26',

      leftTransformer: '4TA-1',
      rightTransformer: '4TA-2',

      power: '1500 kVA',
      voltage: '14,4/0,44 kV',

      leftBreaker: '158',
      rightBreaker: '159',
      leftBreakerState: 'closed',
      rightBreakerState: 'closed',

      mainBreaker: '109',
      mainTime: '2,5 s',
      mainBreakerState: 'openAuto',

      colorLeft: '#3f7cff',
      colorRight: '#44dd55',

      panelWidth: 170,
      panelHeight: 110,
    },

    //==================================================
    // 8qV + GD-3
    //==================================================

    {
      id: 'AUX_8QV',
      label: '8qV',

      x: 7000,
      y: 4000,

      leftSource: '13',
      rightSource: '18',

      leftTransformer: '8TV-1',
      rightTransformer: '8TV-2',

      power: '750 kVA',
      voltage: '14,4/0,44 kV',

      leftBreaker: '166',
      rightBreaker: '167',
      leftBreakerState: 'closed',
      rightBreakerState: 'closed',

      mainBreaker: '111',
      mainTime: '2,5 s',
      mainBreakerState: 'openAuto',

      colorLeft: '#ff44dd',
      colorRight: '#3f7cff',

      panelWidth: 170,
      panelHeight: 110,

      extraBreakers: [
        {
          label: '255',
          x: 7045,
          y: 4275,
          state: 'openAuto',
        },
      ],

      generator: {
        label: 'GD-3',
        x: 7045,
        y: 4330,
        color: '#263238',
        radius: 38,
        breaker: '252',
        time: '11s',
        timePosition: 'below',
        timeOffset: 18,
        breakerX: 7045,
        breakerY: 4222,
        breakerState: 'openAuto',
      },
    },
  ],

  //==================================================
  // PAINÃ‰IS / QDs SUPERIORES
  //==================================================

  distributionPanels: [
    {
      id: 'PSA-U01',
      label: 'PSA-U01',
      breaker: '1001',
      tag: '1729-201',
      x: 730,
      y: 1060,
      width: 520,
      height: 250,
      color: '#3f7cff',
      busColor: '#3f7cff',
    },

    {
      id: '1QD-91',
      label: '1QD-91',
      breaker: '102',
      tag: '1729-203',
      x: 2220,
      y: 1040,
      width: 520,
      height: 250,
      color: '#7a858d',
      busColor: '#cfd5dc',
    },

    {
      id: '1QD-2',
      label: '1QD-2',
      breaker: '103',
      tag: '1729-205',
      x: 2910,
      y: 1060,
      width: 520,
      height: 250,
      color: '#e4c24a',
      busColor: '#e4c24a',
    },

    {
      id: '3QD-11',
      label: '3QD-11',
      breaker: '104',
      tag: '1729-207',
      x: 4180,
      y: 1060,
      width: 520,
      height: 250,
      color: '#ff44dd',
      busColor: '#ff44dd',
    },

    {
      id: '3QD-92',
      label: '3QD-92',
      breaker: '105',
      tag: '1729-209',
      x: 5260,
      y: 1040,
      width: 520,
      height: 250,
      color: '#7a858d',
      busColor: '#cfd5dc',
    },

    {
      id: '3QD-12',
      label: '3QD-12',
      breaker: '106',
      tag: '1729-211',
      x: 6120,
      y: 1060,
      width: 520,
      height: 250,
      color: '#44dd55',
      busColor: '#44dd55',
    },
  ],

  //==================================================
  // TRANSFORMADORES SUPERIORES
  //==================================================

  transformers: [
    {
      id: 'TR01',
      label: 'TR-SA-1',
      x: 990,
      y: 1450,
      color: '#3f7cff',
      power: '7,5 MVA',
      voltage: '14,4/14,4Â±16% kV',
    },

    {
      id: 'TRSE1',
      label: 'TR-SA-3',
      x: 2480,
      y: 1430,
      color: '#7a858d',
      power: '7,5 MVA',
      voltage: '13,8/14,4Â±16% kV',
    },

    {
      id: 'TR02',
      label: 'TR-SA-2',
      x: 3170,
      y: 1450,
      color: '#e4c24a',
      power: '7,5 MVA',
      voltage: '14,4/14,4Â±16% kV',
    },

    {
      id: 'TR11',
      label: 'TR-SA-4',
      x: 4440,
      y: 1450,
      color: '#ff44dd',
      power: '7,5 MVA',
      voltage: '14,4/14,4Â±16% kV',
    },

    {
      id: 'TRSE3',
      label: 'TR-SA-6',
      x: 5520,
      y: 1430,
      color: '#7a858d',
      power: '7,5 MVA',
      voltage: '13,8/14,4Â±16% kV',
    },

    {
      id: 'TR12',
      label: 'TR-SA-5',
      x: 6380,
      y: 1450,
      color: '#44dd55',
      power: '7,5 MVA',
      voltage: '14,4/14,4Â±16% kV',
    },
  ],

  //==================================================
  // FACAS TERRA ANTES DOS DJs
  //==================================================

  groundSwitches: [
    {
      id: 'GS107',
      tag: '1729-213',
      x: 990,
      y: 1740,
      color: '#3f7cff',
    },

    {
      id: 'GS108',
      tag: '1729-215',
      x: 2050,
      y: 1740,
      color: '#ff44dd',
    },

    {
      id: 'GS109',
      tag: '1729-217',
      x: 3170,
      y: 1740,
      color: '#e4c24a',
    },

    {
      id: 'GS110',
      tag: '1729-219',
      x: 4440,
      y: 1740,
      color: '#ff44dd',
    },

    {
      id: 'GS111',
      tag: '1729-221',
      x: 5200,
      y: 1740,
      color: '#3f7cff',
    },

    {
      id: 'GS112',
      tag: '1729-223',
      x: 6380,
      y: 1740,
      color: '#44dd55',
    },
  ],

  //==================================================
  // DISJUNTORES DE ENTRADA PARA OS BARRAMENTOS
  //==================================================

  incomingBreakers: [
    {
      id: '107',
      x: 990,
      y: 1820,
      color: '#3f7cff',
    },

    {
      id: '108',
      x: 2050,
      y: 1820,
      color: '#ff44dd',
    },

    {
      id: '109',
      x: 3170,
      y: 1820,
      color: '#e4c24a',
    },

    {
      id: '110',
      x: 4440,
      y: 1820,
      color: '#ff44dd',
    },

    {
      id: '111',
      x: 5200,
      y: 1820,
      color: '#3f7cff',
    },

    {
      id: '112',
      x: 6380,
      y: 1820,
      color: '#44dd55',
    },

    {
      id: '120',
      x: 2480,
      y: 1820,
      color: '#7a858d',
    },

    {
      id: '135',
      x: 5520,
      y: 1820,
      color: '#7a858d',
    },
  ],

  //==================================================
  // PAINÃ‰IS PRINCIPAIS 1QP / 3QP
  //==================================================

  panels: [
    {
      id: '1QP',
      type: 'main',
      label: '1QP',

      x: 500,
      y: 1870,

      /*
       * Barra 1 reduzida para 1000 px, com os DJs 113 a 117
       * distribuÃ­dos uniformemente.
       * A Barra 2 possui 1000 px e ultrapassa o DJ 120 em x = 2480.
       * Os DJs 118, 119, 121 e 122 permanecem compactados.
       */
      width: 3140,
      height: 520,

      color: '#3f7cff',

      busSections: [
        {
          x1: 620,
          x2: 1620,
          color: '#3f7cff',
        },

        {
          x1: 1620,
          x2: 2620,
          color: '#ff44dd',
        },

        {
          x1: 2620,
          x2: 3520,
          color: '#e4c24a',
        },
      ],

      busBreakers: [
        {
          id: '101',
          x: 1620,
          time: '1,3 s',
        },

        {
          id: '102',
          x: 2620,
          time: '1,3 s',
        },
      ],

      feeders: [
        // Barra I â€” azul
        { id: '113', x: 720, bottomLabel: '1', color: '#3f7cff' },
        { id: '114', x: 900, bottomLabel: '3', color: '#3f7cff' },
        { id: '115', x: 1080, bottomLabel: '5', color: '#3f7cff' },
        { id: '116', x: 1260, bottomLabel: '7', color: '#3f7cff' },
        {
          id: '117',
          x: 1440,
          bottomLabel: '9',
          secondaryBottomLabel: '31',
          secondaryOffset: 120,
          branchY: 2230,
          color: '#3f7cff',
        },

        // Barra II â€” magenta
        { id: '118', x: 1710, bottomLabel: '11', color: '#ff44dd' },
        { id: '119', x: 1940, bottomLabel: '13', color: '#ff44dd' },
        { id: '121', x: 2170, bottomLabel: '17', color: '#ff44dd' },
        { id: '122', x: 2400, bottomLabel: '19', color: '#ff44dd' },

        // Barra III â€” amarela (UG02)
        { id: '123', x: 2720, bottomLabel: '21', color: '#e4c24a' },
        { id: '124', x: 2900, bottomLabel: '23', color: '#e4c24a' },
        { id: '125', x: 3080, bottomLabel: '25', color: '#e4c24a' },
        {
          id: '126',
          x: 3260,
          bottomLabel: '27',
          secondaryBottomLabel: '33',
          secondaryOffset: 120,
          branchY: 2230,
          color: '#e4c24a',
        },
        { id: '127', x: 3440, bottomLabel: '', color: '#e4c24a' },
      ],
    },

    {
      id: '3QP',
      type: 'main',
      label: '3QP',

      // Vão de 150 unidades após o término do 1QP.
      x: 3790,
      y: 1870,

      /*
       * Barra 1 reduzida para 900 px, com os DJs 128 a 132
       * distribuÃ­dos uniformemente.
       * Barra 2 reduzida para 900 px, com o DJ 134 reserva aberto.
       * Barra 3 reduzida para 900 px, com os DJs 138 a 142
       * distribuÃ­dos uniformemente.
       */
      width: 2940,
      height: 520,

      color: '#44dd55',

      busSections: [
        {
          x1: 3910,
          x2: 4810,
          color: '#ff44dd',
        },

        {
          x1: 4810,
          x2: 5710,
          color: '#3f7cff',
        },

        {
          x1: 5710,
          x2: 6610,
          color: '#44dd55',
        },
      ],

      busBreakers: [
        {
          id: '103',
          x: 4810,
          time: '1,3 s',
        },

        {
          id: '104',
          x: 5710,
          time: '1,3 s',
        },
      ],

      feeders: [
        // Barra I â€” magenta
        { id: '128', x: 4010, bottomLabel: '2', color: '#ff44dd' },
        { id: '129', x: 4180, bottomLabel: '4', color: '#ff44dd' },
        { id: '130', x: 4350, bottomLabel: '6', color: '#ff44dd' },
        { id: '131', x: 4520, bottomLabel: '8', color: '#ff44dd' },
        { id: '132', x: 4690, bottomLabel: '10', color: '#ff44dd' },

        // Barra II â€” azul
        { id: '133', x: 4960, bottomLabel: '12', color: '#3f7cff' },
        {
          id: '134',
          x: 5120,
          bottomLabel: '',
          note: 'RESERVA',
          state: 'open',
          breakerState: 'open',
          color: '#3f7cff',
        },
        { id: '136', x: 5400, bottomLabel: '18', color: '#3f7cff' },
        { id: '137', x: 5630, bottomLabel: '20', color: '#3f7cff' },

        // Barra III â€” verde
        { id: '138', x: 5810, bottomLabel: '22', color: '#44dd55' },
        { id: '139', x: 5970, bottomLabel: '24', color: '#44dd55' },
        { id: '140', x: 6130, bottomLabel: '26', color: '#44dd55' },
        { id: '141', x: 6290, bottomLabel: '28', color: '#44dd55' },
        { id: '142', x: 6450, bottomLabel: '30', color: '#44dd55' },
      ],
    },
  ],
};

//==================================================
// ALINHAMENTO DO CONJUNTO 1QP / 3QP COM OS PCAs
//==================================================

/*
 * Mantém as coordenadas internas aprovadas e aplica um único
 * deslocamento horizontal ao diagrama principal completo.
 *
 * Centro original de 1QP + 3QP: 3615
 * Centro da faixa dos grupos PCA: 5200
 * Deslocamento visual final: +1285
 * (300 unidades à esquerda do alinhamento geométrico dos PCAs,
 * compensando o painel lateral direito da interface.)
 */
const MAIN_DIAGRAM_OFFSET_X = 1285;

const shiftItemX = (item) => {
  if (item && Number.isFinite(item.x)) {
    item.x += MAIN_DIAGRAM_OFFSET_X;
  }
};

ScenarioNormal.generators?.forEach(shiftItemX);
ScenarioNormal.relays?.forEach(shiftItemX);
ScenarioNormal.externalSources?.forEach(shiftItemX);
ScenarioNormal.distributionPanels?.forEach(shiftItemX);
ScenarioNormal.transformers?.forEach(shiftItemX);
ScenarioNormal.groundSwitches?.forEach(shiftItemX);
ScenarioNormal.incomingBreakers?.forEach(shiftItemX);

ScenarioNormal.stepUpBranches?.forEach((branch) => {
  ['transformerX', 'takeoffX', 'breakerX', 'groundSwitchX', 'arrowX'].forEach(
    (key) => {
      if (Number.isFinite(branch[key])) {
        branch[key] += MAIN_DIAGRAM_OFFSET_X;
      }
    }
  );
});

ScenarioNormal.panels?.forEach((panel) => {
  shiftItemX(panel);

  panel.busSections?.forEach((section) => {
    if (Number.isFinite(section.x1)) {
      section.x1 += MAIN_DIAGRAM_OFFSET_X;
    }

    if (Number.isFinite(section.x2)) {
      section.x2 += MAIN_DIAGRAM_OFFSET_X;
    }
  });

  panel.busBreakers?.forEach(shiftItemX);
  panel.feeders?.forEach(shiftItemX);
});
