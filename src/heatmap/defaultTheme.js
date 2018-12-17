goog.provide('anychart.heatmapModule.defaultTheme');


goog.mixin(goog.global['anychart']['themes']['defaultTheme'], {
  // merge with chart
  'heatMap': {
    'annotations': {
      'annotationsList': [],
      'zIndex': 2000
    },
    'isVertical': false,
    'scales': [
      {
        'type': 'ordinal'
      },
      {
        'type': 'ordinal',
        'inverted': true
      },
      {
        'type': 'ordinal-color'
      }
    ],
    'xScale': 0,
    'yScale': 1,
    'colorScale': 2,
    'background': {
      'enabled': true
    },
    'xAxes': [{
      'orientation': 'top'
    }],
    'yAxes': [{}],
    'xGrids': [],
    'yGrids': [],
    'tooltip': {
      'enabled': true,
      'title': {
        'enabled': true,
        'fontSize': 13,
        'fontWeight': 'normal'
      },
      'contentInternal': {'fontSize': 11},
      'separator': {'enabled': true},
      /**
       * @this {*}
       * @return {*}
       */
      'titleFormat': function() {
        return this['name'] || this['x'];
      },
      /**
       * @this {*}
       * @return {*}
       */
      'format': function() {
        if (this['heat'] !== undefined) {
          var value = 'Value: ' + this['valuePrefix'] + this['heat'] + this['valuePostfix'];
          if (!isNaN(+this['heat']))
            value += '\n' + 'Percent Value: ' + (this['heat'] * 100 / this['getStat']('sum')).toFixed(1) + '%';
          return value;
        } else {
          return 'x: ' + this['x'] + '\ny: ' + this['y'];
        }
      }
    },
    'legendItem': {
      'iconStroke': null
    },
    'legend': {
      'itemsSourceMode': 'categories'
    },
    'defaultXAxisSettings': {
      'enabled': true,
      'orientation': 'bottom',
      'ticks': {'enabled': false},
      'title': {
        'text': 'X-Axis',
        'padding': 5
      },
      'scale': 0
    },
    'defaultYAxisSettings': {
      'enabled': true,
      'orientation': 'left',
      'ticks': {'enabled': false},
      'title': {
        'text': 'Y-Axis',
        'padding': 5
      },
      'scale': 1
    },
    'defaultSeriesSettings': {
      'heatMap': {
        'normal': {
          /**
           * @this {*}
           * @return {*}
           */
          'fill': function() {
            var color;
            if (this['colorScale']) {
              var value = this['iterator']['get']('heat');
              color = this['colorScale']['valueToColor'](value);
            } else {
              color = anychart.color.setOpacity(this['sourceColor'], 0.85, true);
            }
            return color;
          },
          'stroke': '1 #ffffff',
          'labels': {
            'disablePointerEvents': true,
            'enabled': true,
            'fontSize': 11,
            'anchor': 'center',
            'adjustFontSize': {
              'width': true,
              'height': true
            },
            'minFontSize': 7,
            'maxFontSize': 13,
            'hAlign': 'center',
            'vAlign': 'middle',
            'fontWeight': 'normal',
            'fontColor': '#212121',
            'selectable': false,
            'background': {
              'enabled': false
            },
            'padding': {
              'top': 2,
              'right': 4,
              'bottom': 2,
              'left': 4
            },
            'position': 'center',
            /**
             * @this {*}
             * @return {*}
             */
            'format': function() {
              return anychart.core.defaultTheme.locNum(this['heat']);
            }
          },
          'markers': {
            'enabled': false,
            'disablePointerEvents': false,
            'position': 'center',
            'rotation': 0,
            'anchor': 'center',
            'offsetX': 0,
            'offsetY': 0,
            'size': 4,
            'positionFormatter': anychart.core.defaultTheme.returnValue,
            'fill': '#dd2c00',
            'type': 'circle',
            'stroke': 'none'
          },
          'hatchFill': false
        },
        'hovered': {
          'fill': anychart.core.defaultTheme.defaultHoverColor,
          'stroke': '2 #ffffff',
          'labels': {
            'fontColor': '#f5f5f5',
            'enabled': null
          },
          'markers': {
            'enabled': null,
            'size': 6
          },
          'hatchFill': null
        },
        'selected': {
          'fill': anychart.core.defaultTheme.defaultSelectColor,
          'stroke': '2 #ffffff',
          'labels': {
            'fontColor': '#fff',
            'enabled': null
          },
          'markers': {
            'enabled': null,
            'size': 6,
            'fill': anychart.core.defaultTheme.defaultSelectColor,
            'stroke': anychart.core.defaultTheme.defaultSelectStroke
          },
          'hatchFill': null
        },
        'tooltip': {
          'enabled': true,
          'title': {
            'enabled': true,
            'fontSize': 13,
            'fontWeight': 'normal'
          },
          'contentInternal': {'fontSize': 11},
          'separator': {'enabled': true},
          /**
           * @this {*}
           * @return {*}
           */
          'titleFormat': function() {
            return this['name'] || this['x'];
          },
          /**
           * @this {*}
           * @return {*}
           */
          'format': function() {
            if (this['heat'] !== undefined) {
              var value = 'Value: ' + this['valuePrefix'] + this['heat'] + this['valuePostfix'];
              if (!isNaN(+this['heat']))
                value += '\n' + 'Percent Value: ' + (this['heat'] * 100 / this['getStat']('sum')).toFixed(1) + '%';
              return value;
            } else {
              return 'x: ' + this['x'] + '\ny: ' + this['y'];
            }
          }
        }
      }
    },
    'labelsDisplayMode': 'drop',
    'clip': true,
    'xZoom': {
      'continuous': true,
      'startRatio': 0,
      'endRatio': 1
    },
    'yZoom': {
      'continuous': true,
      'startRatio': 0,
      'endRatio': 1
    },
    'yScroller': {
      'orientation': 'right',
      'inverted': true
    },
    'a11y': {
      'titleFormat': anychart.core.defaultTheme.chartA11yTitleFormatter
    }
  }
});
