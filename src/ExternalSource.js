import { Equipment } from './Equipment.js';
import { Breaker } from './Breaker.js';

export class ExternalSource extends Equipment {
  static draw(layer, data = {}) {
    if (!layer) {
      console.warn('[ExternalSource] Camada SVG não informada.');
      return null;
    }

    const {
      id = '',
      label = 'SE 138 kV',

      x = 0,
      y = 0,

      width = 560,
      height = 270,

      color = '#3f4b53',

      voltage = '13,8 kV',
      breaker = '',

      tagInside = '',
      tagBottom = '',

      energized = false,
      available = true,

      showBorder = true,
    } = data;

    const visualColor = available ? color : '#7a858d';

    const group = this.group(
      id ? `external-source-${id}` : '',
      'external-source'
    );

    this.setEquipmentData(group, {
      id,
      type: 'external-source',
      energized,
      available,
      state: energized ? 'energized' : 'deenergized',
    });

    const centerX = x + width / 2;

    const busY = y + 72;

    //==================================================
    // RETÂNGULO EXTERNO
    //==================================================

    if (showBorder) {
      group.appendChild(
        this.rect(
          x,
          y,
          width,
          height,
          'none',
          data.borderColor ?? '#3f4b53',
          data.borderWidth ?? 1.5,
          {
            className: 'external-source-border',
          }
        )
      );
    }

    //==================================================
    // BARRA 13,8 kV
    //==================================================

    group.appendChild(
      this.line(
        x + 80,
        busY,
        x + width - 80,
        busY,
        visualColor,
        data.busWidth ?? 2.1,
        {
          className: 'external-source-bus',
        }
      )
    );

    group.appendChild(
      this.text(
        x + width - 150,
        busY - 12,
        voltage,
        data.voltageSize ?? 28,
        data.voltageColor ?? '#263238',
        {
          anchor: 'start',
          weight: '600',
          className: 'external-source-voltage',
        }
      )
    );

    //==================================================
    // LINHA VERTICAL CENTRAL
    //==================================================

    const bottomConnectionY = y + height + 105;

    group.appendChild(
      this.line(
        centerX,
        busY,
        centerX,
        bottomConnectionY,
        visualColor,
        data.lineWidth ?? 1.55,
        {
          className: 'external-source-line',
        }
      )
    );

    //==================================================
    // DISJUNTOR
    //==================================================

    const breakerY = y + 115;

    Breaker.draw(group, {
      id: `${id}-breaker`,
      label: breaker,

      x: centerX,
      y: breakerY,

      size: data.breakerSize ?? 52,

      state: data.breakerState ?? Breaker.STATES.CLOSED,

      closed: data.closed ?? true,

      stroke: data.breakerColor ?? visualColor,

      textColor: data.breakerTextColor ?? '#263238',

      strokeWidth: data.breakerStrokeWidth ?? 1.5,

      labelPosition: 'right',
      labelOffset: 18,

      showLabel: Boolean(breaker),

      fontSize: data.breakerFontSize ?? 34,

      energized,
      available,

      interactive: data.interactive ?? true,
    });

    //==================================================
    // IDENTIFICAÇÃO
    //==================================================

    group.appendChild(
      this.text(
        centerX,
        y + 170,
        label,
        data.labelSize ?? 36,
        data.labelColor ?? '#263238',
        {
          weight: '600',
          className: 'external-source-label',
        }
      )
    );

    //==================================================
    // TAG INTERNA
    //==================================================

    if (tagInside) {
      group.appendChild(
        this.text(
          centerX,
          y + 215,
          tagInside,
          data.tagInsideSize ?? 26,
          data.tagInsideColor ?? '#263238',
          {
            weight: '500',
            className: 'external-source-tag-inside',
          }
        )
      );
    }

    //==================================================
    // TAG EXTERNA INFERIOR
    //==================================================

    if (tagBottom) {
      group.appendChild(
        this.text(
          x + 20,
          y + height + 55,
          tagBottom,
          data.tagBottomSize ?? 24,
          data.tagBottomColor ?? '#263238',
          {
            anchor: 'start',
            weight: '500',
            className: 'external-source-tag-bottom',
          }
        )
      );
    }

    layer.appendChild(group);

    return group;
  }

  //==================================================
  // PONTOS DE CONEXÃO
  //==================================================

  static getPorts(data = {}) {
    const { x = 0, y = 0, width = 560, height = 270 } = data;

    const centerX = x + width / 2;

    return {
      top: {
        x: centerX,
        y,
      },

      bus: {
        x: centerX,
        y: y + 72,
      },

      center: {
        x: centerX,
        y: y + height / 2,
      },

      bottom: {
        x: centerX,
        y: y + height + 105,
      },
    };
  }
}
