goog.provide('anychart.linearGaugeModule.defaultTheme');


goog.mixin(goog.global['anychart']['themes']['defaultTheme'], {
  'linearGauge': {
    'padding': 10,
    'markerPalette': {
      'items': ['circle', 'diamond', 'square', 'triangle-down', 'triangle-up', 'triangle-left', 'triangle-right', 'diagonal-cross', 'pentagon', 'cross', 'v-line', 'star5', 'star4', 'trapezium', 'star7', 'star6', 'star10']
    },
    'globalOffset': '0%',
    'layout': 'vertical',
    'tooltip': {
      /**
       * @this {*}
       * @return {*}
       */
      'titleFormat': function() {
        return this['name'];
      },
      /**
       * @this {*}
       * @return {*}
       */
      'format': function() {
        if (this['high'])
          return anychart.core.defaultTheme.returnRangeTooltipContentFormatter.call(this);
        else
          return 'Value: ' + anychart.core.defaultTheme.locNum(this['value']);
      }
    },
    'scales': [
      {
        'type': 'linear'
      }
    ],

    'defaultAxisSettings': {
      'enabled': true,
      'width': '10%',
      'offset': '0%'
    },
    'defaultScaleBarSettings': {
      'enabled': true,
      'width': '10%',
      'offset': '0%',
      'from': 'min',
      'to': 'max',
      'colorScale': {
        'type': 'ordinal-color',
        'inverted': false,
        'ticks': {
          'maxCount': 100
        }
      },
      'points': [
        {
          'height': 0,
          'left': 0,
          'right': 0
        },
        {
          'height': 1,
          'left': 0,
          'right': 0
        }
      ]
    },
    'defaultPointerSettings': {
      'base': {
        'enabled': true,
        'selectionMode': 'single',
        'width': '10%',
        'offset': '0%',
        'legendItem': {
          'enabled': true
        },
        'normal': {
          'stroke': anychart.core.defaultTheme.returnStrokeSourceColor,
          'fill': anychart.core.defaultTheme.returnSourceColor,
          'hatchFill': null,
          'labels': {
            'zIndex': 0,
            'position': 'center-top'
          }
        },
        'hovered': {
          'stroke': anychart.core.defaultTheme.returnLightenStrokeSourceColor,
          'fill': anychart.core.defaultTheme.returnLightenSourceColor,
          'labels': {
            'enabled': null
          }
        },
        'selected': {
          'stroke': anychart.core.defaultTheme.returnDarkenSourceColor,
          'fill': anychart.core.defaultTheme.returnDarkenSourceColor,
          'labels': {
            'enabled': null
          }
        }
      },
      'bar': {},
      'rangeBar': {
        'normal': {
          'labels': {
            /**
             * @this {*}
             * @return {*}
             */
            'format': function() {
              return anychart.core.defaultTheme.locNum(this['high']);
            }
          }
        }
      },
      'marker': {'width': '3%'},
      'tank': {
        'normal': {
          'emptyFill': '#fff 0.3',
          'emptyHatchFill': null
        },
        'hovered': {
          'emptyFill': anychart.core.defaultTheme.returnSourceColor
        },
        'selected': {
          'emptyFill': anychart.core.defaultTheme.returnSourceColor
        }
      },
      'thermometer': {
        'normal': {
          /**
           * @this {*}
           * @return {*}
           */
          'fill': function() {
            var sourceColor = this['sourceColor'];
            var dark = anychart.color.darken(sourceColor);
            var key1 = {
              'color': dark
            };
            var key2 = {
              'color': sourceColor
            };
            var key3 = {
              'color': dark
            };
            var isVertical = this['isVertical'];
            return {
              'angle': isVertical ? 0 : 90,
              'keys': [key1, key2, key3]
            };
          }
        },
        'width': '3%',
        'bulbRadius': '120%',
        'bulbPadding': '3%'
      },
      'led': {
        /**
         * @param {acgraph.vector.SolidFill|string} color
         * @return {*}
         * @this {*}
         */
        'dimmer': function(color) {
          return anychart.color.darken(color);
        },
        'gap': '1%',
        'size': '2%',
        'count': null,
        'colorScale': {
          'type': 'ordinal-color',
          'inverted': false,
          'ticks': {
            'maxCount': 100
          }
        }
      }
    }
  },
  'thermometer': {},
  'tank': {},
  'led': {}
});
