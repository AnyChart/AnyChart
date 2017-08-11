goog.provide('anychart.waterfallModule.defaultTheme');
goog.require('anychart.core.defaultTheme');


goog.mixin(goog.global['anychart']['themes']['defaultTheme'], {
  'waterfall': {
    'dataMode': 'diff',
    'connectorStroke': anychart.core.defaultTheme.waterfallTotalStroke,
    'defaultSeriesType': 'waterfall',
    'defaultSeriesSettings': {
      'waterfall': {
        'fill': anychart.core.defaultTheme.waterfallTotalFill,
        'stroke': anychart.core.defaultTheme.waterfallTotalStroke,

        'risingFill': anychart.core.defaultTheme.waterfallRisingFill,
        'fallingFill': anychart.core.defaultTheme.waterfallFallingFill,
        'hoverRisingFill': anychart.core.defaultTheme.returnSourceColor65,
        'hoverFallingFill': anychart.core.defaultTheme.returnSourceColor65,
        'risingStroke': anychart.core.defaultTheme.waterfallRisingStroke,
        'fallingStroke': anychart.core.defaultTheme.waterfallFallingStroke,
        'hoverRisingStroke': anychart.core.defaultTheme.returnLightenStrokeSourceColor,
        'hoverFallingStroke': anychart.core.defaultTheme.returnLightenStrokeSourceColor,

        'risingHatchFill': false,
        'hoverRisingHatchFill': null,
        'selectRisingHatchFill': null,
        'fallingHatchFill': false,
        'hoverFallingHatchFill': null,
        'selectFallingHatchFill': null,
        'selectFallingFill': anychart.core.defaultTheme.defaultSelectColor,
        'selectRisingFill': anychart.core.defaultTheme.defaultSelectColor,
        'selectRisingStroke': anychart.core.defaultTheme.defaultSelectColor,
        'selectFallingStroke': anychart.core.defaultTheme.defaultSelectColor,

        'labels': {
          'enabled': true,
          /**
           * @this {*}
           * @return {*}
           */
          'format': function() {
            return anychart.core.defaultTheme.locNum(this['isTotal'] ? this['absolute'] : this['diff']);
          }
        },
        'tooltip': {
          /**
           * @this {*}
           * @return {*}
           */
          'format': function() {
            if (this['isTotal']) {
              return 'Absolute: ' + anychart.core.defaultTheme.locNum(this['absolute']);
            } else {
              return 'Absolute: ' + anychart.core.defaultTheme.locNum(this['absolute']) + '\nDifference: ' + anychart.core.defaultTheme.locNum(this['diff']);
            }
          }
        }
      }
    },
    'legend': {
      'enabled': true,
      'itemsSourceMode': 'categories'
    },
    'scales': [
      {
        'type': 'ordinal'
      },
      {
        'type': 'linear',
        'softMinimum': 0
      }
    ]
  }
});
