import { Equipment } from './Equipment.js';
import { Breaker } from './Breaker.js';
import { Engine } from './Engine.js';
import { AuxDistributionDetailView } from './AuxDistributionDetailView.js';

export class AuxPanel extends Equipment {
  //==================================================
  // PADRÃƒÆ’Ã†â€™O VISUAL PARA FUNDO CLARO
  //==================================================

  static COLORS = {
    text: '#263238',
    border: '#3f4b53',
    breakerClosed: '#d60000',
    breakerOpen: '#ffffff',
  };

  //==================================================
  // DESENHO PRINCIPAL
  //==================================================

  static draw(layer, data = {}) {
    if (!layer || !data) {
      console.warn('[AuxPanel] Camada ou dados ausentes.');
      return null;
    }

    if (data.type === 'seIhm') {
      return this.drawSeIhm(layer, data);
    }

    if (data.type === 'fiveQa') {
      return this.drawFiveQa(layer, data);
    }

    return this.drawStandard(layer, data);
  }

  //==================================================
  // PAINEL AUXILIAR PADRÃƒÆ’Ã†â€™O
  // 7qS-1 / 7qS-2 / CMCS / 1qA / 2qA / 3qA / 4qA / 8qV
  //==================================================

  static drawStandard(layer, data = {}) {
    const {
      id = '',
      label = id,

      x = 0,
      y = 0,

      colorLeft = '#3f7cff',
      colorRight = '#44dd55',
      textColor = this.COLORS.text,

      panelWidth = 170,
      panelHeight = 110,
    } = data;

    const group = this.group(id ? `aux-panel-${id}` : '', 'aux-panel standard');

    this.setEquipmentData(group, {
      id,
      type: 'aux-panel',
      energized: data.energized ?? true,
      available: data.available ?? true,
    });

    /*
     * Geometria compacta baseada nos diagramas originais.
     * As duas entradas ficam simÃƒÆ’Ã‚Â©tricas e convergem para
     * o barramento interno do quadro.
     */
    const leftX = x - 45;
    const rightX = x + 45;

    const topY = y;
    const transformerY = y + 75;
    const incomingBreakerY = y + 155;

    // Ajuste vertical dos quadros auxiliares padrão.
    // Mantém fontes, transformadores e DJs de entrada na posição original
    // e desce somente o quadro, prolongando o trecho de alimentação.
    const panelVerticalDrop = 70;
    const panelY = y + 185 + panelVerticalDrop;

    const innerBusY = panelY + 55;

    const isClosedState = (value) => {
      const normalized = String(value ?? '')
        .trim()
        .toLowerCase()
        .replaceAll('-', '');

      return ['closed', 'closedauto', 'true'].includes(normalized);
    };

    const leftBreakerClosed = isClosedState(
      data.leftBreakerState ?? Breaker.STATES.CLOSED
    );

    const rightBreakerClosed = isClosedState(
      data.rightBreakerState ?? Breaker.STATES.CLOSED
    );

    const leftIncomingColor =
      leftBreakerClosed && data.leftEnergized !== false ? colorLeft : '#8a8a8a';

    const rightIncomingColor =
      rightBreakerClosed && data.rightEnergized !== false
        ? colorRight
        : '#8a8a8a';

    /*
     * Alimentação de emergência pelo GAE-3.
     * Quando o Engine sinaliza gaeEmergencyEnergized, o barramento do 8qV
     * passa a ser representado pela fonte de emergência em ciano.
     */
    const gaeEmergencyEnergized =
      data.gaeEmergencyEnergized === true;

    const gaeEmergencyColor =
      data.gaeEmergencyColor ?? '#00B8D9';

    const leftBusColor =
      gaeEmergencyEnergized
        ? gaeEmergencyColor
        : data.leftBusEnergized === false
          ? '#8a8a8a'
          : data.leftBusColor ?? leftIncomingColor;

    const rightBusColor =
      gaeEmergencyEnergized
        ? gaeEmergencyColor
        : data.rightBusEnergized === false
          ? '#8a8a8a'
          : data.rightBusColor ?? rightIncomingColor;

    const modePanelIds = [
      'AUX_7QS1',
      'AUX_7QS2',
      'AUX_CMCS',
      'AUX_1QA',
      'AUX_2QA',
      'AUX_3QA',
      'AUX_4QA',
      'AUX_8QV',
    ];

    if (modePanelIds.includes(String(id))) {
      this.drawModeButton(
        group,
        data,
        x - panelWidth / 2 - 105,
        panelY + panelHeight / 2 - 21,
        {
          id,
          width: 84,
          height: 42,
        }
      );
    }

    const mainBreakerSize = data.mainBreakerSize ?? 30;

    const mainBreakerHalf = mainBreakerSize / 2;

    /*
     * O 8qV possui uma cadeia fixa de transferÃƒÆ’Ã‚Âªncia para o GD-3.
     * Os valores abaixo tambÃƒÆ’Ã‚Â©m funcionam como proteÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o contra
     * configuraÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Âµes antigas com coordenadas absolutas distantes.
     */
    const is8qv =
      String(id).toUpperCase().includes('8QV') ||
      String(label).toUpperCase().replaceAll('-', '').includes('8QV');

    const mainBreaker = data.mainBreaker || (is8qv ? '111' : '');

    const mainTime = data.mainTime || (is8qv ? '2,5 s' : '');

    const mainBreakerState =
      data.mainBreakerState ||
      (is8qv ? Breaker.STATES.OPEN_AUTO : Breaker.STATES.OPEN);

    //==================================================
    // RAMAL ESQUERDO
    //==================================================

    const leftBreakerGroup = this.drawSourceBranch(group, {
      id: `${id}-left`,

      source: data.leftSource,

      transformer: data.leftTransformer,

      power: data.power,

      voltage: data.voltage,

      breaker: data.leftBreaker,

      breakerState: data.leftBreakerState ?? Breaker.STATES.CLOSED,

      x: leftX,
      topY,
      trafoY: transformerY,
      breakerY: incomingBreakerY,
      panelY,

      color: colorLeft,
      downstreamColor: leftIncomingColor,
      textColor,
      textSide: 'left',
      showRatings: false,
    });

    //==================================================
    // RAMAL DIREITO
    //==================================================

    const rightBreakerGroup = this.drawSourceBranch(group, {
      id: `${id}-right`,

      source: data.rightSource,

      transformer: data.rightTransformer,

      power: data.power,

      voltage: data.voltage,

      breaker: data.rightBreaker,

      breakerState: data.rightBreakerState ?? Breaker.STATES.CLOSED,

      x: rightX,
      topY,
      trafoY: transformerY,
      breakerY: incomingBreakerY,
      panelY,

      color: colorRight,
      downstreamColor: rightIncomingColor,
      textColor,
      textSide: 'right',
      showRatings: true,
    });

    this.attachAuxBreakerCommand(
      leftBreakerGroup,
      data,
      'left',
      data.leftBreaker
    );

    this.attachAuxBreakerCommand(
      rightBreakerGroup,
      data,
      'right',
      data.rightBreaker
    );

    //==================================================
    // CONTORNO DO QUADRO
    //==================================================

    group.appendChild(
      this.rect(
        x - panelWidth / 2,
        panelY,
        panelWidth,
        panelHeight,
        'none',
        this.COLORS.border,
        1.5,
        {
          className: 'aux-panel-border',
        }
      )
    );

    //==================================================
    // DESCIDA INTERNA DOS ALIMENTADORES
    //==================================================

    group.appendChild(
      this.line(leftX, panelY, leftX, innerBusY, leftIncomingColor, 1.8, {
        className: 'aux-panel-internal-line aux-panel-left-line',
      })
    );

    group.appendChild(
      this.line(rightX, panelY, rightX, innerBusY, rightIncomingColor, 1.8, {
        className: 'aux-panel-internal-line aux-panel-right-line',
      })
    );

    //==================================================
    // BARRAMENTO INTERNO E DJ CENTRAL
    //==================================================

    group.appendChild(
      this.line(
        x - panelWidth / 2 + 12,
        innerBusY,
        leftX,
        innerBusY,
        leftBusColor,
        1.8,
        {
          className: 'aux-panel-bus aux-panel-bus-left-stub',
        }
      )
    );

    if (mainBreaker) {
      group.appendChild(
        this.line(
          leftX,
          innerBusY,
          x - mainBreakerHalf,
          innerBusY,
          leftBusColor,
          1.8,
          {
            className: 'aux-panel-bus aux-panel-bus-left',
          }
        )
      );

      group.appendChild(
        this.line(
          x + mainBreakerHalf,
          innerBusY,
          rightX,
          innerBusY,
          rightBusColor,
          1.8,
          {
            className: 'aux-panel-bus aux-panel-bus-right',
          }
        )
      );
    } else {
      group.appendChild(
        this.line(
          leftX,
          innerBusY,
          rightX,
          innerBusY,
          data.activeSupply === 'right' ? rightBusColor : leftBusColor,
          1.8,
          {
            className: 'aux-panel-bus aux-panel-bus-direct',
          }
        )
      );
    }

    group.appendChild(
      this.line(
        rightX,
        innerBusY,
        x + panelWidth / 2 - 12,
        innerBusY,
        rightBusColor,
        1.8,
        {
          className: 'aux-panel-bus aux-panel-bus-right-stub',
        }
      )
    );

    //==================================================
    // NÃƒÆ’Ã¢â‚¬Å“S DOS BARRAMENTOS
    //==================================================

    group.appendChild(
      this.circle(leftX, innerBusY, 4, leftBusColor, leftBusColor, 1, {
        className: 'aux-panel-node left',
      })
    );

    group.appendChild(
      this.circle(rightX, innerBusY, 4, rightBusColor, rightBusColor, 1, {
        className: 'aux-panel-node right',
      })
    );

    //==================================================
    // DJ DE INTERLIGAÃƒÆ’Ã¢â‚¬Â¡ÃƒÆ’Ã†â€™O
    //==================================================

    if (mainBreaker) {
      const mainBreakerGroup = this.drawAuxBreaker(group, {
        id: `${id}-main-breaker`,

        label: mainBreaker,

        x,
        y: innerBusY,

        size: mainBreakerSize,

        state: mainBreakerState,

        stroke: this.COLORS.border,

        textColor: this.COLORS.text,

        labelPosition: 'top',

        labelOffset: 10,

        time: mainTime,

        timePosition: 'below',
      });

      this.attachAuxBreakerCommand(mainBreakerGroup, data, 'tie', mainBreaker);
    }

    //==================================================
    // IDENTIFICAÃƒÆ’Ã¢â‚¬Â¡ÃƒÆ’Ã†â€™O DO QUADRO
    //==================================================

    group.appendChild(
      this.text(
        x - panelWidth / 2,
        panelY + panelHeight + 35,
        label,
        22,
        textColor,
        {
          anchor: 'start',
          weight: '700',
          className: 'aux-panel-label',
        }
      )
    );

    //==================================================
    // DISJUNTORES ADICIONAIS
    //==================================================

    if (!data.generator) {
      data.extraBreakers?.forEach((item, index) => {
        this.drawAuxBreaker(group, {
          id: `${id}-extra-${index}`,

          label: item.label ?? '',

          x: item.x ?? x,

          y: item.y ?? panelY + panelHeight + 50,

          size: item.size ?? 28,

          state: item.state ?? Breaker.STATES.OPEN_AUTO,

          stroke: item.color ?? this.COLORS.border,

          textColor: item.color ?? this.COLORS.text,

          labelPosition: item.labelPosition ?? 'right',

          time: item.time ?? '',

          timePosition: item.timePosition ?? 'below',
        });
      });
    }

    //==================================================
    // GERADOR AUXILIAR
    //==================================================

    if (data.generator) {
      const generatorData = is8qv
        ? {
            ...data.generator,
            x: rightX,
            y: panelY + 245,
            breaker: '252',
            breakerX: rightX,
            breakerY: panelY + 137,
            breakerState:
              data.generator?.breakerState ?? Breaker.STATES.OPEN_AUTO,
            time: '11s',
            timePosition: 'below',
            timeOffset: 18,
          }
        : data.generator;

      const generatorExtraBreakers = is8qv
        ? [
            {
              ...(data.extraBreakers?.find((item) => item.label === '255') ??
                {}),
              label: '255',
              x: rightX,
              y: panelY + 190,
              state: Breaker.STATES.OPEN_AUTO,
            },
          ]
        : data.extraBreakers ?? [];

      this.drawSmallGenerator(
        group,
        {
          ...generatorData,
          connectionX: rightX,
          connectionTopY: innerBusY,
          extraBreakers: generatorExtraBreakers,
        },
        id
      );
    }

    this.attachDetailOpening(group, data, {
      x: x - panelWidth / 2,
      y: panelY,
      width: panelWidth,
      height: panelHeight,
    });

    layer.appendChild(group);

    return group;
  }

  //==================================================
  // RAMAL DE FONTE DO PAINEL AUXILIAR
  //==================================================

  static drawSourceBranch(group, data = {}) {
    const {
      id = '',
      source = '',
      transformer = '',
      power = '',
      voltage = '',
      breaker = '',
      breakerState = Breaker.STATES.CLOSED,

      x = 0,
      topY = 0,
      trafoY = 0,
      breakerY = 0,
      panelY = 0,

      color = '#263238',
      downstreamColor = color,
      textColor = '#263238',
      textSide = 'right',
      showRatings = true,
    } = data;

    if (source) {
      group.appendChild(
        this.text(x, topY - 22, source, 22, textColor, {
          weight: '700',
        })
      );
    }

    // Entrada superior em "V", conforme o diagrama original.
    group.appendChild(
      this.line(x - 9, topY, x, topY + 16, color, 1.8, {
        className: 'aux-panel-source-fork',
      })
    );

    group.appendChild(
      this.line(x + 9, topY, x, topY + 16, color, 1.8, {
        className: 'aux-panel-source-fork',
      })
    );

    group.appendChild(
      this.line(x, topY + 16, x, trafoY - 18, color, 1.8, {
        className: 'aux-panel-source-line',
      })
    );

    this.drawTransformerSymbol(group, x, trafoY, color, 18, 1.1);

    const textX = textSide === 'left' ? x - 26 : x + 26;

    if (transformer) {
      group.appendChild(
        this.text(textX, trafoY + 5, transformer, 20, textColor, {
          anchor: textSide === 'left' ? 'end' : 'start',
          weight: '700',
        })
      );
    }

    if (showRatings && power) {
      group.appendChild(
        this.text(textX, trafoY + 30, power, 18, textColor, {
          anchor: 'start',
          weight: '600',
        })
      );
    }

    if (showRatings && voltage) {
      group.appendChild(
        this.text(textX, trafoY + 54, voltage, 18, textColor, {
          anchor: 'start',
          weight: '600',
        })
      );
    }

    group.appendChild(
      this.line(x, trafoY + 38, x, breakerY - 15, color, 1.8, {
        className: 'aux-panel-source-line',
      })
    );

    const breakerGroup = this.drawAuxBreaker(group, {
      id: `${id}-breaker`,

      label: breaker,

      x,
      y: breakerY,

      size: 30,

      state: breakerState,

      stroke: this.COLORS.border,

      textColor: textColor,

      labelPosition: textSide === 'left' ? 'left' : 'right',
    });

    group.appendChild(
      this.line(x, breakerY + 16, x, panelY, downstreamColor, 1.8)
    );

    return breakerGroup;
  }

  //==================================================
  // SE DO HM
  //==================================================

  static drawSeIhm(layer, data = {}) {
    const {
      id = 'AUX_IHM_SE',
      label = 'SE do HM',

      x = 0,
      y = 0,

      color = '#ff44dd',
      textColor = '#263238',

      panelWidth = 620,
      panelHeight = 520,
    } = data;

    const group = this.group(`aux-panel-${id}`, 'aux-panel se-ihm');

    this.setEquipmentData(group, {
      id,
      type: 'se-ihm',
      energized: data.energized ?? true,
      available: data.available ?? true,
    });

    const panelX = x - panelWidth / 2;

    const panelY = y;

    const sourceX = x - 15;

    const leftX = x - 65;

    const rightX = x + 65;

    const topY = y + 35;

    const busY = y + 155;

    const branchSwitchY = y + 190;

    const trafoY = y + 245;

    const outputBusY = y + 345;

    const outputY = y + 405;

    //==================================================
    // CONTORNO
    //==================================================

    group.appendChild(
      this.rect(
        panelX,
        panelY,
        panelWidth,
        panelHeight,
        'none',
        textColor,
        1.8,
        {
          className: 'se-ihm-border',
        }
      )
    );

    group.appendChild(
      this.text(panelX + 20, panelY + 35, label, 22, textColor, {
        anchor: 'start',
        weight: '700',
      })
    );

    //==================================================
    // ENTRADAS
    //==================================================

    group.appendChild(
      this.text(sourceX, topY - 12, data.leftSource ?? '17', 22, color, {
        weight: '700',
      })
    );

    group.appendChild(this.line(sourceX, topY, sourceX, busY, color, 1.8));

    this.drawSmallSwitch(group, sourceX, y + 82, color);

    group.appendChild(
      this.text(
        sourceX + 20,
        y + 88,
        data.leftBreaker ?? '1729-254',
        18,
        textColor,
        {
          anchor: 'start',
          weight: '600',
        }
      )
    );

    group.appendChild(this.line(sourceX, busY, leftX, busY, color, 1.8));

    //==================================================
    // BARRAMENTO INTERNO
    //==================================================

    group.appendChild(this.line(leftX, busY, rightX, busY, color, 2.1));

    [
      {
        x: leftX,
        label: data.busBreakerLeft ?? '1729-256',
        labelX: leftX - 20,
        anchor: 'end',
      },
      {
        x: rightX,
        label: data.rightBreaker ?? '1729-258',
        labelX: rightX + 20,
        anchor: 'start',
      },
    ].forEach((item) => {
      group.appendChild(
        this.line(item.x, busY, item.x, trafoY - 24, color, 1.8)
      );

      this.drawSmallSwitch(group, item.x, branchSwitchY, color);

      group.appendChild(
        this.text(item.labelX, branchSwitchY + 6, item.label, 18, textColor, {
          anchor: item.anchor,
          weight: '600',
        })
      );
    });

    //==================================================
    // TRANSFORMADORES
    //==================================================

    this.drawTransformerSymbol(group, leftX, trafoY, color, 23);

    this.drawTransformerSymbol(group, rightX, trafoY, color, 23);

    this.drawTransformerLabels(group, {
      x: leftX - 150,

      y: trafoY + 12,

      name: data.leftTransformer ?? 'TRHM-1',

      power: data.power ?? '750kVA',

      voltage: data.voltage ?? '14,4/0,44 kV',

      color: textColor,
    });

    this.drawTransformerLabels(group, {
      x: rightX + 35,

      y: trafoY + 12,

      name: data.rightTransformer ?? 'TRHM-2',

      power: data.power ?? '750kVA',

      voltage: data.voltage ?? '14,4/0,44 kV',

      color: textColor,
    });

    //==================================================
    // SAÃƒÆ’Ã‚ÂDAS
    //==================================================

    group.appendChild(
      this.line(leftX, trafoY + 62, leftX, outputBusY, color, 1.8)
    );

    group.appendChild(
      this.line(rightX, trafoY + 62, rightX, outputBusY, color, 1.8)
    );

    const outputs = data.outputs ?? [
      {
        label: 'C1 (440V)',
        x: x - 140,
      },
      {
        label: 'C2 (380V)',
        x: x - 84,
        color: textColor,
      },
      {
        label: 'C3 (440V)',
        x: x - 28,
      },
      {
        label: 'C4 (440V)',
        x: x + 28,
      },
      {
        label: 'C5 (440V)',
        x: x + 84,
      },
      {
        label: 'C6 (440V)',
        x: x + 140,
      },
    ];

    group.appendChild(
      this.line(
        outputs[0].x,
        outputBusY,
        outputs[outputs.length - 1].x,
        outputBusY,
        color,
        2.1
      )
    );

    outputs.forEach((item, index) => {
      const outputX = item.x ?? x + (index - 2) * 80;

      const outputColor = item.color ?? color;

      group.appendChild(
        this.line(outputX, outputBusY, outputX, outputY, outputColor, 1.8)
      );

      const arrow = this.path(
        [
          `M ${outputX - 12} ${outputY - 18}`,
          `L ${outputX} ${outputY}`,
          `L ${outputX + 12} ${outputY - 18}`,
        ].join(' '),
        outputColor,
        'none',
        1.8
      );

      group.appendChild(arrow);

      const textX = outputX - 8;

      const textY = outputY + 55;

      group.appendChild(
        this.text(textX, textY, item.label ?? '', 17, outputColor, {
          weight: '700',
          transform: `rotate(-90 ${textX} ${textY})`,
        })
      );
    });

    layer.appendChild(group);

    return group;
  }

  //==================================================
  // ENTRADA DO SE DO HM
  //==================================================

  static drawSeIhmInput(group, data = {}) {
    const {
      id = '',
      x = 0,
      topY = 0,
      breakerY = 0,
      busY = 0,
      source = '',
      breaker = '',
      color = '#263238',
      textColor = '#263238',
    } = data;

    group.appendChild(
      this.text(x, topY - 20, source, 22, color, {
        weight: '700',
      })
    );

    group.appendChild(this.line(x, topY, x, busY, color, 1.8));

    this.drawSmallSwitch(group, x, topY + 30, color);

    Breaker.draw(group, {
      id: `${id}-breaker`,

      label: breaker,

      x,
      y: breakerY,

      size: 28,

      state: Breaker.STATES.OPEN_AUTO,

      stroke: textColor,

      textColor: textColor,

      labelPosition: 'right',

      interactive: false,
    });
  }

  //==================================================
  // 5qA
  //==================================================

  static drawFiveQa(layer, data = {}) {
    const {
      id = 'AUX_5QA',
      label = '5qA',

      x = 0,
      y = 0,

      colorLeft = '#3f7cff',
      colorRight = '#ff7a1a',
      colorAux = '#38e8ff',
      textColor = '#263238',

      panelWidth = 560,
      panelHeight = 250,
    } = data;

    const group = this.group(`aux-panel-${id}`, 'aux-panel five-qa');

    this.setEquipmentData(group, {
      id,
      type: 'five-qa',
      energized: data.energized ?? true,
      available: data.available ?? true,
    });

    const leftX = x - 230;

    const rightX = x + 260;

    const topY = y;

    const qdY = y + 120;

    const trafo1Y = y + 325;

    const panelY = y + 430;

    const bottomTrafoY = panelY + panelHeight + 45;

    const mainBusY = panelY + 110;

    const panelBreakerY = panelY + 35;

    const auxBreakerX = x + 95;

    const threeCX = rightX - 45;

    const bottomTrafoX = auxBreakerX;

    const bottomElbowY = bottomTrafoY + 80;

    const bottomTransformerConnectionY = bottomTrafoY + 64;

    //==================================================
    // FONTE ESQUERDA
    //==================================================

    group.appendChild(
      this.text(leftX, topY - 25, data.leftSource ?? '31', 22, colorLeft, {
        weight: '700',
      })
    );

    group.appendChild(this.line(leftX, topY + 12, leftX, qdY, colorLeft, 1.8));

    group.appendChild(
      this.path(
        [
          `M ${leftX - 10} ${topY}`,
          `L ${leftX} ${topY + 12}`,
          `L ${leftX + 10} ${topY}`,
        ].join(' '),
        colorLeft,
        'none',
        1.8
      )
    );

    group.appendChild(
      this.rect(leftX - 150, qdY, 300, 150, 'none', colorLeft, 1.8)
    );

    group.appendChild(
      this.text(
        leftX - 135,
        qdY + 132,
        data.qdLabel ?? '1QD-SA3',
        24,
        textColor,
        {
          anchor: 'start',
          weight: '700',
        }
      )
    );

    Breaker.draw(group, {
      id: `${id}-qd-breaker`,

      label: data.qdBreaker ?? '260',

      x: leftX,

      y: qdY + 35,

      size: 28,

      state: Breaker.STATES.CLOSED,

      closed: true,

      stroke: textColor,

      textColor: textColor,

      labelPosition: 'right',

      interactive: false,
    });

    if (data.qdTag) {
      const switchY = qdY + 82;

      group.appendChild(
        this.line(leftX, qdY + 52, leftX, qdY + 150, colorLeft, 1.8)
      );

      group.appendChild(
        this.circle(leftX, switchY, 5, colorLeft, '#ffffff', 1.5)
      );

      group.appendChild(
        this.circle(leftX + 55, switchY, 5, colorLeft, '#ffffff', 1.5)
      );

      group.appendChild(
        this.line(leftX + 6, switchY, leftX + 40, switchY - 12, colorLeft, 1.8)
      );

      group.appendChild(
        this.line(leftX + 60, switchY, leftX + 88, switchY, colorLeft, 1.8)
      );

      group.appendChild(
        this.line(
          leftX + 88,
          switchY - 13,
          leftX + 88,
          switchY + 13,
          colorLeft,
          1.5
        )
      );

      [0, 8, 16].forEach((offset, index) => {
        group.appendChild(
          this.line(
            leftX + 88 - (10 - index * 3),
            switchY + 13 + offset,
            leftX + 88 + (10 - index * 3),
            switchY + 13 + offset,
            colorLeft,
            1.5
          )
        );
      });

      group.appendChild(
        this.text(leftX + 50, qdY + 125, data.qdTag, 16, textColor, {
          weight: '600',
        })
      );
    }

    group.appendChild(
      this.line(leftX, qdY + 150, leftX, trafo1Y - 35, colorLeft, 1.8)
    );

    this.drawTransformerSymbol(group, leftX, trafo1Y, colorLeft, 24);

    this.drawTransformerLabels(group, {
      x: leftX - 55,

      y: trafo1Y + 5,

      name: data.leftTrafo ?? '5TA1',

      power: data.leftPower ?? '300 kVA',

      voltage: data.leftVoltage ?? '14,4/0,22 kV',

      color: textColor,
    });

    group.appendChild(
      this.line(leftX, trafo1Y + 72, leftX, panelY + 58, colorLeft, 1.8)
    );

    //==================================================
    // FONTE DIREITA
    //==================================================

    group.appendChild(
      this.text(
        rightX,
        topY - 40,
        data.rightTitle ?? '7qS-1 SE 440kV',
        19,
        textColor,
        {
          weight: '700',
        }
      )
    );

    group.appendChild(
      this.text(
        rightX,
        topY - 15,
        data.rightSubtitle ?? 'GAV. 4B',
        18,
        textColor,
        {
          weight: '700',
        }
      )
    );

    group.appendChild(
      this.line(rightX, topY, rightX, panelY + 34, colorRight, 1.8)
    );

    this.drawSmallSwitch(group, rightX, topY + 35, colorRight);

    //==================================================
    // QUADRO 5qA
    //==================================================

    group.appendChild(
      this.rect(
        x - panelWidth / 2,
        panelY,
        panelWidth,
        panelHeight,
        'none',
        textColor,
        1.8
      )
    );

    this.drawAuxBreaker(group, {
      id: `${id}-left-panel`,

      label: data.leftPanelBreaker ?? '258',

      x: leftX,

      y: panelBreakerY,

      size: 28,

      state: data.leftBreakerState ?? Breaker.STATES.CLOSED,

      stroke: textColor,

      textColor: textColor,

      labelPosition: 'right',

      interactive: false,
    });

    this.drawAuxBreaker(group, {
      id: `${id}-right-panel`,

      label: data.rightPanelBreaker ?? '259',

      x: rightX,

      y: panelBreakerY,

      size: 28,

      state: data.rightBreakerState ?? Breaker.STATES.CLOSED,

      stroke: textColor,

      textColor: textColor,

      labelPosition: 'left',

      interactive: false,
    });

    group.appendChild(
      this.text(
        rightX - 80,
        mainBusY - 15,
        data.rightVoltage ?? '440V',
        17,
        textColor,
        {
          anchor: 'start',
          weight: '700',
        }
      )
    );

    group.appendChild(
      this.line(leftX - 20, mainBusY, auxBreakerX, mainBusY, colorAux, 1.8)
    );

    group.appendChild(
      this.text(
        leftX + 65,
        mainBusY - 15,
        data.midVoltage ?? '220V',
        17,
        textColor,
        {
          anchor: 'start',
          weight: '700',
        }
      )
    );

    group.appendChild(
      this.line(leftX, panelY + 49, leftX, mainBusY, colorAux, 1.8)
    );

    group.appendChild(
      this.line(auxBreakerX, mainBusY, auxBreakerX, panelY + 168, colorAux, 1.8)
    );

    group.appendChild(
      this.line(rightX - 85, mainBusY, rightX + 20, mainBusY, colorRight, 1.8)
    );

    this.drawAuxBreaker(group, {
      id: `${id}-aux-breaker`,

      label: data.auxBreaker ?? '24-114',

      x: auxBreakerX,

      y: panelY + 185,

      size: 28,

      state: data.mainBreakerState ?? Breaker.STATES.OPEN_AUTO,

      stroke: textColor,

      textColor: textColor,

      labelPosition: 'left',

      interactive: false,
    });

    group.appendChild(
      this.line(
        auxBreakerX,
        panelY + 199,
        bottomTrafoX,
        bottomTrafoY - 24,
        colorAux,
        1.8
      )
    );

    Breaker.draw(group, {
      id: `${id}-3c`,

      label: data.threeCBreaker ?? '3C',

      x: threeCX,

      y: panelY + 175,

      size: 30,

      state: Breaker.STATES.CLOSED,

      closed: true,

      stroke: textColor,

      textColor: textColor,

      labelPosition: 'right',

      interactive: false,
    });

    group.appendChild(
      this.line(rightX, panelY + 49, rightX, mainBusY, colorRight, 1.8)
    );

    group.appendChild(
      this.line(threeCX, mainBusY, threeCX, panelY + 160, colorRight, 1.8)
    );

    group.appendChild(
      this.line(threeCX, panelY + 190, threeCX, bottomElbowY, colorRight, 1.8)
    );

    group.appendChild(
      this.line(
        threeCX,
        bottomElbowY,
        bottomTrafoX,
        bottomElbowY,
        colorRight,
        1.8
      )
    );

    group.appendChild(
      this.line(
        bottomTrafoX,
        bottomElbowY,
        bottomTrafoX,
        bottomTransformerConnectionY,
        colorRight,
        1.8
      )
    );

    this.drawTransformerSymbol(
      group,
      bottomTrafoX,
      bottomTrafoY,
      colorRight,
      24
    );

    this.drawTransformerLabels(group, {
      x: bottomTrafoX - 95,

      y: bottomTrafoY + 5,

      name: data.bottomTrafo ?? '5TA2',

      power: data.bottomPower ?? '150 kVA',

      voltage: data.bottomVoltage ?? '440/220V',

      color: textColor,
    });

    group.appendChild(
      this.text(
        x - panelWidth / 2 + 10,
        panelY + panelHeight + 35,
        label,
        22,
        textColor,
        {
          anchor: 'start',
          weight: '700',
        }
      )
    );

    this.attachDetailOpening(group, data, {
      x: x - panelWidth / 2,
      y: panelY,
      width: panelWidth,
      height: panelHeight,
    });

    layer.appendChild(group);

    return group;
  }

  //==================================================
  // DJ AUXILIAR COM TAGS ORIENTÃƒÆ’Ã‚ÂVEIS
  //==================================================

  static drawAuxBreaker(group, data = {}) {
    const {
      id = '',
      x = 0,
      y = 0,
      size = 30,
      state = Breaker.STATES.OPEN_AUTO,
      stroke = this.COLORS.border,
      textColor = this.COLORS.text,
      label = '',
      labelPosition = 'right',
      labelOffset = 10,
      time = '',
      timePosition = 'below',
      timeOffset = 24,
    } = data;

    const half = size / 2;

    const breakerGroup = this.group(
      id ? `aux-breaker-${id}` : '',
      `aux-breaker ${state}`
    );

    breakerGroup.appendChild(
      this.rect(x - half, y - half, size, size, '#ffffff', stroke, 1.7, {
        className: 'aux-breaker-box',
      })
    );

    if (
      state === Breaker.STATES.CLOSED ||
      state === Breaker.STATES.CLOSED_AUTO ||
      state === 'closed' ||
      state === 'closedAuto'
    ) {
      breakerGroup.appendChild(
        this.rect(
          x - half + 1,
          y - half + 1,
          size - 2,
          size - 2,
          this.COLORS.breakerClosed,
          this.COLORS.breakerClosed,
          1,
          {
            className: 'aux-breaker-closed-fill',
          }
        )
      );
    } else {
      breakerGroup.appendChild(
        this.line(
          x - half + 3,
          y - half + 3,
          x + half - 3,
          y + half - 3,
          stroke,
          1.7,
          {
            className: 'aux-breaker-diagonal',
          }
        )
      );

      if (
        state === Breaker.STATES.OPEN_AUTO ||
        state === Breaker.STATES.CLOSED_AUTO ||
        state === 'openAuto' ||
        state === 'closedAuto'
      ) {
        breakerGroup.appendChild(
          this.line(
            x + half - 3,
            y - half + 3,
            x - half + 3,
            y + half - 3,
            stroke,
            1.7,
            {
              className: 'aux-breaker-diagonal',
            }
          )
        );
      }
    }

    if (label) {
      const positions = {
        left: {
          x: x - half - labelOffset,
          y: y + 6,
          anchor: 'end',
        },
        right: {
          x: x + half + labelOffset,
          y: y + 6,
          anchor: 'start',
        },
        top: {
          x,
          y: y - half - 7,
          anchor: 'middle',
        },
        bottom: {
          x,
          y: y + half + 22,
          anchor: 'middle',
        },
      };

      const position = positions[labelPosition] ?? positions.right;

      breakerGroup.appendChild(
        this.text(position.x, position.y, label, 18, textColor, {
          anchor: position.anchor,
          weight: '700',
          className: 'aux-breaker-label',
        })
      );
    }

    if (time) {
      const below = timePosition === 'below' || timePosition === 'bottom';

      breakerGroup.appendChild(
        this.text(
          below ? x : x + half + labelOffset,
          below ? y + half + timeOffset : y + 6,
          time,
          17,
          textColor,
          {
            anchor: below ? 'middle' : 'start',
            weight: '700',
            className: 'aux-breaker-time',
          }
        )
      );
    }

    group.appendChild(breakerGroup);

    return breakerGroup;
  }

  //==================================================
  // CHAVE PEQUENA
  //==================================================

  static drawSmallSwitch(group, x, y, color) {
    group.appendChild(this.circle(x, y - 12, 6, color, '#ffffff', 1.5));

    group.appendChild(this.circle(x, y + 12, 6, color, '#ffffff', 1.5));

    group.appendChild(this.line(x, y - 6, x, y + 6, color, 1.5));
  }

  //==================================================
  // TRANSFORMADOR PEQUENO
  //==================================================

  static drawTransformerSymbol(
    group,
    x,
    y,
    color,
    radius = 24,
    centerOffset = 1.55
  ) {
    group.appendChild(this.circle(x, y, radius, color, 'none', 1.8));

    group.appendChild(
      this.circle(x, y + radius * centerOffset, radius, color, 'none', 1.8)
    );
  }

  //==================================================
  // TEXTOS DO TRANSFORMADOR
  //==================================================

  static drawTransformerLabels(
    group,
    { x = 0, y = 0, name = '', power = '', voltage = '', color = '#263238' }
  ) {
    if (name) {
      group.appendChild(
        this.text(x, y, name, 20, color, {
          anchor: 'start',
          weight: '700',
        })
      );
    }

    if (power) {
      group.appendChild(
        this.text(x, y + 25, power, 17, color, {
          anchor: 'start',
          weight: '600',
        })
      );
    }

    if (voltage) {
      group.appendChild(
        this.text(x, y + 50, voltage, 17, color, {
          anchor: 'start',
          weight: '600',
        })
      );
    }
  }

  //==================================================
  // GERADOR AUXILIAR
  //==================================================

  static drawSmallGenerator(group, data = {}, parentId = '') {
    const {
      label = 'GD',
      x = 0,
      y = 0,
      color = '#263238',
      radius = 38,
      connectionX = x,
      connectionTopY = y - 160,
      extraBreakers = [],
    } = data;

    const generator = this.group(
      `aux-generator-${parentId}`,
      'aux-small-generator'
    );

    const gaeRunning =
      Boolean(data.breaker) &&
      Engine.isGaeBreakerClosed?.(data.breaker) === true;

    const gaeRunningColor =
      data.gaeEmergencyColor ??
      Engine.gaeEmergencyColor ??
      '#00B8D9';

    const generatorLineColor = gaeRunning ? gaeRunningColor : color;
    const generatorCircleFill = gaeRunning ? gaeRunningColor : '#ffffff';
    const generatorCircleStroke = gaeRunning ? gaeRunningColor : color;
    const generatorTextColor = gaeRunning ? '#ffffff' : color;

    const breakerX = data.breakerX ?? x;

    const breakerY = data.breakerY ?? y - 150;

    const breakerSize = data.breakerSize ?? 28;

    let previousX = connectionX;
    let previousY = connectionTopY;

    if (data.breaker) {
      generator.appendChild(
        this.path(
          [
            `M ${previousX} ${previousY}`,
            `L ${breakerX} ${previousY}`,
            `L ${breakerX} ${breakerY - breakerSize / 2}`,
          ].join(' '),
          generatorLineColor,
          'none',
          1.55,
          {
            className: 'aux-generator-line',
          }
        )
      );

      /*
       * O DJ principal do gerador auxiliar usa Breaker.draw para
       * receber o mesmo menu LIGA / DESLIGA dos demais DJs.
       */
      Breaker.draw(generator, {
        id: `${parentId}-generator-breaker`,

        label: data.breaker,

        x: breakerX,

        y: breakerY,

        size: breakerSize,

        state: data.breakerState ?? Breaker.STATES.OPEN_AUTO,

        energized: Breaker.isClosedState(
          data.breakerState ?? Breaker.STATES.OPEN_AUTO
        ),

        stroke: generatorLineColor,

        textColor: generatorLineColor,

        showLabel: Boolean(data.breaker),

        labelPosition: data.breakerLabelPosition ?? 'right',

        labelOffset: data.breakerLabelOffset ?? 10,

        time: data.time ?? '',

        timePosition: data.timePosition ?? 'below',

        timeOffset: data.timeOffset ?? 7,

        interactive: Boolean(data.breaker),

        onCommand: data.breaker
          ? (command) =>
              Engine.toggleGaeBreaker?.(data.breaker, command?.nextClosed)
          : null,
      });

      previousX = breakerX;
      previousY = breakerY + breakerSize / 2;
    }

    [...extraBreakers]
      .sort((a, b) => (a.y ?? 0) - (b.y ?? 0))
      .forEach((item, index) => {
        const itemX = item.x ?? x;

        const itemY = item.y ?? previousY + 60;

        const itemSize = item.size ?? 28;

        generator.appendChild(
          this.path(
            [
              `M ${previousX} ${previousY}`,
              `L ${itemX} ${previousY}`,
              `L ${itemX} ${itemY - itemSize / 2}`,
            ].join(' '),
            generatorLineColor,
            'none',
            1.55,
            {
              className: 'aux-generator-line',
            }
          )
        );

        const extraLabel = String(item.label ?? '');

        const extraIsGaeBreaker = Engine.getGaeBreaker?.(extraLabel) != null;

        if (extraIsGaeBreaker) {
          Breaker.draw(generator, {
            id: `${parentId}-generator-extra-${index}`,

            label: extraLabel,

            x: itemX,

            y: itemY,

            size: itemSize,

            state: item.state ?? Breaker.STATES.OPEN_AUTO,

            energized: Engine.isGaeBreakerClosed?.(extraLabel) === true,

            stroke: item.color ?? color,

            textColor: item.color ?? color,

            labelPosition: item.labelPosition ?? 'right',

            time: item.time ?? '',

            timePosition: item.timePosition ?? 'below',

            interactive: true,

            onCommand: (command) =>
              Engine.toggleGaeBreaker?.(extraLabel, command?.nextClosed),
          });
        } else {
          this.drawAuxBreaker(generator, {
            id: `${parentId}-generator-extra-${index}`,

            label: extraLabel,

            x: itemX,

            y: itemY,

            size: itemSize,

            state: item.state ?? Breaker.STATES.OPEN_AUTO,

            stroke: item.color ?? color,

            textColor: item.color ?? color,

            labelPosition: item.labelPosition ?? 'right',

            time: item.time ?? '',

            timePosition: item.timePosition ?? 'below',
          });
        }

        previousX = itemX;
        previousY = itemY + itemSize / 2;
      });

    generator.appendChild(
      this.path(
        [
          `M ${previousX} ${previousY}`,
          `L ${x} ${previousY}`,
          `L ${x} ${y - radius}`,
        ].join(' '),
        color,
        'none',
        1.55,
        {
          className: 'aux-generator-line',
        }
      )
    );

    generator.appendChild(
      this.circle(x, y, radius, generatorCircleStroke, generatorCircleFill, 1.8)
    );

    generator.appendChild(
      this.text(x, y + 7, label, 18, generatorTextColor, {
        weight: '700',
      })
    );

    //==================================================
    // CONTROLES RÁPIDOS DO GAE - LIGA/DES + MAN/AUT
    //==================================================
    if (data.breaker && data.showGaeControls !== false) {
      const controls = this.group(
        `aux-generator-${parentId}-gae-controls`,
        'aux-gae-controls'
      );

      const controlButtonX = data.controlsX ?? (x - radius - 100);
      const firstButtonY = data.controlsY ?? (y - 14);
      const rowGap = 34;
      const iconSize = 26;
      const labelGap = 14;

      const applyVisual = (body, icon, visual = {}) => {
        body.setAttribute('fill', visual.fill ?? '#ffffff');
        body.setAttribute('stroke', visual.stroke ?? this.COLORS.border);
        icon.setAttribute('fill', visual.textColor ?? this.COLORS.text);
        icon.textContent = visual.symbol ?? '';
      };

      const makeButton = (by, tag, getVisual, onClick, className) => {
        const button = this.group('', className);

        const body = this.rect(
          controlButtonX - iconSize / 2,
          by - iconSize / 2,
          iconSize,
          iconSize,
          '#ffffff',
          this.COLORS.border,
          1.4
        );
        body.setAttribute('rx', 3);
        body.setAttribute('ry', 3);

        const icon = this.text(
          controlButtonX,
          by + 5,
          '',
          15,
          this.COLORS.text,
          { anchor: 'middle', weight: '700' }
        );
        icon.setAttribute('pointer-events', 'none');

        const tagText = this.text(
          controlButtonX + iconSize / 2 + labelGap,
          by + 5,
          tag,
          14,
          this.COLORS.text,
          { anchor: 'start', weight: '700' }
        );
        tagText.setAttribute('pointer-events', 'none');

        applyVisual(body, icon, getVisual());

        button.appendChild(body);
        button.appendChild(icon);
        button.appendChild(tagText);
        button.style.cursor = 'pointer';
        button.setAttribute('pointer-events', 'all');

        button.addEventListener('pointerdown', (event) => event.stopPropagation());
        button.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          onClick();
          applyVisual(body, icon, getVisual());
        });

        controls.appendChild(button);
      };

      const getBreakerClosed = () =>
        Engine.isGaeBreakerClosed?.(data.breaker) === true;

      const getGaeMode = () =>
        Engine.getGaeOperationMode?.(data.breaker) ?? 'AUTO';

      makeButton(
        firstButtonY,
        'LIGA/DES',
        () =>
          getBreakerClosed()
            ? {
                symbol: 'I',
                fill: '#1f9d45',
                stroke: '#1f9d45',
                textColor: '#ffffff',
              }
            : {
                symbol: 'O',
                fill: '#ffffff',
                stroke: '#7a858d',
                textColor: this.COLORS.text,
              },
        () => {
          const currentlyClosed = getBreakerClosed();
          Engine.toggleGaeBreaker?.(data.breaker, !currentlyClosed);
        },
        'aux-gae-control-button'
      );

      makeButton(
        firstButtonY + rowGap,
        'MAN/AUT',
        () =>
          getGaeMode() === 'MANUAL'
            ? {
                symbol: 'M',
                fill: '#d4a900',
                stroke: '#d4a900',
                textColor: '#ffffff',
              }
            : {
                symbol: 'A',
                fill: '#1f9d45',
                stroke: '#1f9d45',
                textColor: '#ffffff',
              },
        () => {
          Engine.toggleGaeOperationMode?.(data.breaker);
        },
        'aux-gae-mode-button'
      );

      generator.appendChild(controls);
    }

    group.appendChild(generator);
  }

  //==================================================
  // COMANDO INDIVIDUAL DOS DJs DOS QUADROS AUXILIARES
  //==================================================

  static attachAuxBreakerCommand(breakerGroup, panelData, role, breakerLabel) {
    if (
      !breakerGroup ||
      !panelData?.id ||
      !Engine.hasAuxPanelTransfer?.(panelData.id)
    ) {
      return null;
    }

    breakerGroup.style.cursor = 'pointer';
    breakerGroup.setAttribute('pointer-events', 'all');
    breakerGroup.setAttribute('role', 'button');
    breakerGroup.setAttribute('tabindex', '0');
    breakerGroup.setAttribute(
      'aria-label',
      `Comandar DJ ${breakerLabel} do painel ${panelData.label ?? panelData.id}`
    );

    const execute = (event) => {
      event.preventDefault();
      event.stopPropagation();

      Engine.toggleAuxPanelBreaker(panelData.id, role);
    };

    breakerGroup.addEventListener('pointerdown', (event) =>
      event.stopPropagation()
    );

    breakerGroup.addEventListener('click', execute);

    breakerGroup.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        execute(event);
      }
    });

    return breakerGroup;
  }

  //==================================================
  // ABERTURA DO DIAGRAMA INTERNO
  //==================================================

  static attachDetailOpening(group, data, bounds = {}) {
    const supportedPanelIds = new Set([
      'AUX_1QA',
      'AUX_2QA',
      'AUX_3QA',
      'AUX_4QA',
      'AUX_5QA',
      'AUX_7QS1',
      'AUX_7QS2',
      'AUX_CMCS',
      'AUX_8QV',
    ]);

    const panelId = String(data?.id ?? '');

    if (!supportedPanelIds.has(panelId) || !group) {
      return null;
    }

    /*
     * CORREÇÃO DA ABERTURA DOS DIAGRAMAS DOS PAINÉIS AUXILIARES
     *
     * Antes, a área de clique era inserida como o PRIMEIRO filho do <g>.
     * No SVG isso deixava a área de clique atrás das linhas, retângulos,
     * barramentos e outros elementos do painel. Esses elementos podiam
     * receber o clique antes da área transparente e o diagrama não abria.
     *
     * Agora a abertura fica vinculada ao próprio grupo do painel.
     * Assim, qualquer clique no corpo/linhas/barramentos do painel sobe
     * (bubble) até o grupo e abre o diagrama.
     *
     * Os comandos individuais dos DJs e o botão AUTO/MANUAL já usam
     * stopPropagation(), portanto continuam independentes e NÃO abrem
     * o diagrama quando forem comandados.
     */

    group.classList.add('aux-panel-detail-link');
    group.style.cursor = 'pointer';
    group.setAttribute('role', 'button');
    group.setAttribute('tabindex', '0');
    group.setAttribute(
      'aria-label',
      `Abrir diagrama interno do painel ${data.label ?? panelId}`
    );

    const openDetail = (event) => {
      event.preventDefault();
      event.stopPropagation();

      if (
        !AuxDistributionDetailView ||
        typeof AuxDistributionDetailView.open !== 'function'
      ) {
        console.error(
          '[AuxPanel] AuxDistributionDetailView.open não está disponível.'
        );
        return;
      }

      AuxDistributionDetailView.open(data);
    };

    group.addEventListener('click', openDetail);

    group.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        openDetail(event);
      }
    });

    /*
     * Área transparente auxiliar apenas para aumentar a região clicável
     * do corpo do quadro. Ela fica atrás dos comandos e não recebe o
     * listener diretamente; o clique sobe para o grupo.
     */
    const hitArea = this.rect(
      bounds.x ?? 0,
      bounds.y ?? 0,
      bounds.width ?? 100,
      bounds.height ?? 80,
      '#ffffff',
      'transparent',
      3,
      {
        className: 'aux-panel-detail-hit-area',
      }
    );

    hitArea.setAttribute('fill-opacity', '0');
    hitArea.setAttribute('pointer-events', 'all');

    group.insertBefore(hitArea, group.firstChild);

    return hitArea;
  }

  //==================================================
  // PONTOS DE CONEXÃƒÆ’Ã†â€™O
  //==================================================

  static getPorts(data = {}) {
    const { x = 0, y = 0, panelHeight = 110 } = data;

    if (data.type === 'seIhm') {
      return {
        top: {
          x,
          y,
        },

        bottom: {
          x,
          y: y + (data.panelHeight ?? 520),
        },
      };
    }

    if (data.type === 'fiveQa') {
      const panelY = y + 430;

      return {
        leftTop: {
          x: x - 230,
          y,
        },

        rightTop: {
          x: x + 260,
          y,
        },

        bottom: {
          x,
          y: panelY + (data.panelHeight ?? 250) + 128,
        },
      };
    }

    return {
      leftTop: {
        x: x - 45,
        y,
      },

      rightTop: {
        x: x + 45,
        y,
      },

      bottom: {
        x: data.generator?.x ?? x,
        y: data.generator
          ? (data.generator.y ?? y + 490) + (data.generator.radius ?? 38)
          : y + 185 + panelHeight,
      },
    };
  }

  //==================================================
  // SELETOR MANUAL / AUTO
  //==================================================

  static drawModeButton(group, data, x, y, options = {}) {
    const id = options.id ?? data.id ?? 'aux';
    const width = options.width ?? 84;
    const height = options.height ?? 42;

    data.operationMode =
      String(data.operationMode ?? 'AUTO').toUpperCase() === 'MANUAL'
        ? 'MANUAL'
        : 'AUTO';

    const button = this.group(`mode-button-${id}`, 'panel-mode-button');

    const body = this.rect(x, y, width, height, '#ffffff', '#66727a', 1.5);

    const label = this.text(
      x + width / 2,
      y + height / 2 + 6,
      data.operationMode,
      17,
      '#263238',
      { weight: '700' }
    );

    const refresh = () => {
      const manual = data.operationMode === 'MANUAL';
      label.textContent = data.operationMode;
      body.setAttribute('fill', manual ? '#fff3cd' : '#ffffff');
      body.setAttribute('stroke', manual ? '#d4a900' : '#66727a');
      button.dataset.mode = data.operationMode;
    };

    button.appendChild(body);
    button.appendChild(label);
    button.style.cursor = 'pointer';

    button.addEventListener('pointerdown', (event) => event.stopPropagation());

    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();

      data.operationMode = data.operationMode === 'AUTO' ? 'MANUAL' : 'AUTO';

      refresh();

      if (
        typeof Engine.setAuxPanelOperationMode === 'function' &&
        Engine.hasAuxPanelTransfer?.(id)
      ) {
        Engine.setAuxPanelOperationMode(id, data.operationMode);
        return;
      }

      window.dispatchEvent(
        new CustomEvent('scada:panel-mode-changed', {
          detail: { id, mode: data.operationMode },
        })
      );
    });

    refresh();
    group.appendChild(button);

    return button;
  }
}
