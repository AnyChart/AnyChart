goog.provide('anychart.circularGaugeModule.defaultTheme');

goog.mixin(goog.global['anychart']['themes']['defaultTheme'], {
  // merge with chart
  'circularGauge': {
    'defaultPointerType': 'needle',
    'title': {
      'enabled': false
    },
    'defaultAxisSettings': {
      'startAngle': null,
      'labels': {
        'position': 'inside',
        'adjustFontSize': true,
        'offsetY': 0
      },
      'minorLabels': {
        'position': 'inside',
        'adjustFontSize': true,
        'offsetY': 0
      },
      'fill': anychart.core.defaultTheme.colorStrokeNormal,
      'ticks': {
        'hatchFill': false,
        'type': 'line',
        'position': 'center',
        'length': null,
        'fill': anychart.core.defaultTheme.fontColorBright,
        'stroke': 'none'
      },
      'minorTicks': {
        'hatchFill': false,
        'type': 'line',
        'position': 'center',
        'length': null,
        'fill': anychart.core.defaultTheme.fontColorBright,
        'stroke': 'none'
      },
      'zIndex': 10,
      'cornersRounding': '0%'
    },
    'defaultPointerSettings': {
      'base': {
        'enabled': true,
        'fill': anychart.core.defaultTheme.fontColorBright,
        'stroke': anychart.core.defaultTheme.fontColorBright,
        'hatchFill': false,
        'axisIndex': 0
      },
      'bar': {
        'position': 'center',
        /**
         * @this {anychart.circularGaugeModule.pointers.Bar.BarDrawerContext}
         * @param {anychart.circularGaugeModule.pointers.Bar.BarDrawerContext} ctx Drawer context
         */
        'barDrawer': function(ctx) {
          this['path']['clear']();
          this['path']['circularArc'](
              this['centerX'],
              this['centerY'],
              this['radius'] - this['width'] / 2,
              this['radius'] - this['width'] / 2,
              this['startAngle'],
              this['sweepAngle']);

          this['path']['circularArc'](
              this['centerX'],
              this['centerY'],
              this['radius'] + this['width'] / 2,
              this['radius'] + this['width'] / 2,
              this['startAngle'] + this['sweepAngle'],
              -this['sweepAngle'], true);

          this['path']['close']();
        }
      },
      'marker': {
        'size': '4%',
        'hoverSize': 6,
        'selectSize': 6,
        'position': 'inside',
        'type': 'triangle-up'
      },
      'knob': {
        'fill': anychart.core.defaultTheme.colorStrokeNormal,
        'stroke': anychart.core.defaultTheme.colorStrokeBright,
        'verticesCount': 6,
        'verticesCurvature': .5,
        'topRatio': .5,
        'bottomRatio': .5
      },
      'needle': {
        'startRadius': '-20%',
        'startWidth': '3%',
        'middleWidth': '1%'
      }
    },
    'defaultRangeSettings': {
      'enabled': true,
      'axisIndex': 0,
      'fill': anychart.core.defaultTheme.fontColorNormal + anychart.core.defaultTheme.opacityStrong,
      'position': 'center',
      'startSize': 0,
      'endSize': '10%',
      'cornersRounding': '0%'
    },
    'fill': anychart.core.defaultTheme.colorFillExtraThin,
    'stroke': anychart.core.defaultTheme.colorStrokeThin,
    'startAngle': 0,
    'sweepAngle': 360,
    'cap': {
      'enabled': false,
      'fill': anychart.core.defaultTheme.colorStrokeThin,
      'stroke': anychart.core.defaultTheme.colorStrokeNormal,
      'hatchFill': false,
      'radius': '15%',
      'zIndex': 50
    },
    'circularPadding': '10%',
    'encloseWithStraightLine': false,
    'axes': [{}],
    'bars': [],
    'markers': [],
    'needles': [],
    'knobs': [],
    'ranges': [],
    'tooltip': {
      'title': {'enabled': false},
      'separator': {'enabled': false},
      /**
       * @this {*}
       * @return {*}
       */
      'titleFormat': function() {
        return this['index'];
      },
      /**
       * @this {*}
       * @return {*}
       */
      'format': function() {
        return 'Value: ' + anychart.core.defaultTheme.locNum(this['value']);
      }
    }
  }
});
