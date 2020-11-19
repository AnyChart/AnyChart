goog.provide('anychart.waterfallModule.defaultTheme');
goog.require('anychart.core.defaultTheme');


goog.mixin(goog.global['anychart']['themes']['defaultTheme'], {
  'waterfall': {
    'dataMode': 'diff',
    'connectorStroke': anychart.core.defaultTheme.waterfallTotalStroke,
    'defaultSeriesType': 'waterfall',
    'defaultSeriesSettings': {
      'waterfall': {
        'normal': {
          'fill': anychart.core.defaultTheme.waterfallTotalFill,
          'stroke': anychart.core.defaultTheme.waterfallTotalStroke,
          'risingFill': anychart.core.defaultTheme.waterfallRisingFill,
          'fallingFill': anychart.core.defaultTheme.waterfallFallingFill,
          'risingStroke': anychart.core.defaultTheme.waterfallRisingStroke,
          'fallingStroke': anychart.core.defaultTheme.waterfallFallingStroke,
          'risingHatchFill': false,
          'fallingHatchFill': false,
          'labels': {
            'enabled': true,
            /**
             * @this {*}
             * @return {*}
             */
            'format': function() {
              return anychart.core.defaultTheme.locNum(this['isTotal'] ? this['absolute'] : this['diff']);
            }
          }
        },
        'hovered': {
          'risingFill': anychart.core.defaultTheme.returnSourceColor65,
          'fallingFill': anychart.core.defaultTheme.returnSourceColor65,
          'risingStroke': anychart.core.defaultTheme.returnLightenStrokeSourceColor,
          'fallingStroke': anychart.core.defaultTheme.returnLightenStrokeSourceColor,
          'risingHatchFill': null,
          'fallingHatchFill': null
        },
        'selected': {
          'risingFill': anychart.core.defaultTheme.defaultSelectColor,
          'fallingFill': anychart.core.defaultTheme.defaultSelectColor,
          'risingStroke': anychart.core.defaultTheme.defaultSelectColor,
          'fallingStroke': anychart.core.defaultTheme.defaultSelectColor,
          'risingHatchFill': null,
          'fallingHatchFill': null
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
        'softMinimum': 0,
        'stackDirection': 'reverse'
      }
    ],
    'stackLabels': {
      'anchor': 'auto',
      'enabled': false,
      'format': '{%total}',
      'position': 'auto'
    },
    'connectors': {
      'stroke': '#697474',
      'labels': {
        'format': '{%stack}',
        'position': 'auto',
        'anchor': 'auto'
      }
    }
  }
});
