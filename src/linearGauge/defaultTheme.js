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
        'label': {
          'zIndex': 0,
          'position': 'center-top'
        },
        'hoverLabel': {
          'enabled': null
        },
        'selectLabel': {
          'enabled': null
        },
        'stroke': anychart.core.defaultTheme.returnStrokeSourceColor,
        'hoverStroke': anychart.core.defaultTheme.returnLightenStrokeSourceColor,
        'selectStroke': anychart.core.defaultTheme.returnDarkenSourceColor,
        'fill': anychart.core.defaultTheme.returnSourceColor,
        'hoverFill': anychart.core.defaultTheme.returnLightenSourceColor,
        'selectFill': anychart.core.defaultTheme.returnDarkenSourceColor
      },
      'bar': {},
      'rangeBar': {
        'label': {
          /**
           * @this {*}
           * @return {*}
           */
          'format': function() {
            return anychart.core.defaultTheme.locNum(this['high']);
          }
        }
      },
      'marker': {'width': '3%'},
      'tank': {
        'emptyFill': '#fff 0.3',
        'hoverEmptyFill': anychart.core.defaultTheme.returnSourceColor,
        'selectEmptyFill': anychart.core.defaultTheme.returnSourceColor,
        'emptyHatchFill': null
      },
      'thermometer': {
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
        },
        'width': '3%',
        'bulbRadius': '120%',
        'bulbPadding': '3%'
      },
      'led': {
        /**
         * @param {acgraph.vector.SolidFill|string} color
         * @return {*}
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
