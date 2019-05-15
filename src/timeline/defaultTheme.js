goog.provide('anychart.timelineModule.defaultTheme');

goog.mixin(goog.global['anychart']['themes']['defaultTheme'], {
  'timeline': {
    'interactivity': {
      'zoomOnMouseWheel': true,
      'scrollOnMouseWheel': true
    },
    'defaultRangeMarkerSettings': {
      'zIndex': 30.1,
      'scaleRangeMode': anychart.enums.ScaleRangeMode.CONSIDER
    },
    'defaultLineMarkerSettings': {
      'zIndex': 30.2,
      'scaleRangeMode': anychart.enums.ScaleRangeMode.CONSIDER
    },
    'defaultTextMarkerSettings': {
      'zIndex': 30.3,
      'scaleRangeMode': anychart.enums.ScaleRangeMode.CONSIDER,
      'align': anychart.enums.Align.TOP
    },
    'legend': {
      'enabled': false
    },
    'axis': {
      'enabled': true,
      'zIndex': 35,
      'height': 32,
      'stroke': '#004e72',
      'fill': '#004e72',
      'ticks': {
        'enabled': true,
        'stroke': '2 #60899b',
        'zIndex': 36
      },
      'labels': {
        'padding': 7.5,
        'fontSize': 12,
        'fontColor': '#d6f8ff',
        'textOverflow': true,
        'format': '{%Value}',
        'selectable': false
      }
    },
    'defaultSeriesSettings': {
      'base': {
        'direction': anychart.enums.Direction.AUTO,
        'clip': false
      },
      'moment': {
        'direction': anychart.enums.Direction.ODD_EVEN,
        'connector': {'length': '4%'},
        'normal': {
          /**
           * @this {*}
           * @return {Object}
           */
          'stroke': function() {
            return {
              'color': anychart.color.lighten(this['sourceColor']),
              'thickness': 1,
              'dash': '2 2'
            };
          },
          'markers': {'enabled': true},
          'labels': {
            'fontColor': anychart.core.defaultTheme.fontColorDark,
            'padding': 5,
            'enabled': true,
            'anchor': anychart.enums.Anchor.LEFT_CENTER,
            'width': 120,
            'background': {
              'enabled': true,
              'fill': '#f2f8ff .7',
              'corners': 2,
              'stroke': anychart.core.defaultTheme.colorStrokeNormal
            },
            'fontSize': 11,
            'offsetX': 5
          }
        },
        'zIndex': 33,
        'tooltip': {
          /**
           * @this {*}
           * @return {string}
           */
          'titleFormat': function() {
            return anychart.format.date(this['x']);
          }
        }
      },
      'range': {
        'direction': anychart.enums.Direction.UP,
        'zIndex': 34,
        'height': 25,
        'normal': {
          'labels': {
            'enabled': true,
            'anchor': anychart.enums.Anchor.LEFT_CENTER,
            'format': '{%x}',
            'fontColor': '#000'
          },
          /**
           * @this {*}
           * @return {string}
           */
          'fill': function() {
            return this['sourceColor'] + ' 0.3';
          }
        },
        'tooltip': {
          'format': 'Start: {%start}{type:date}\nEnd: {%end}{type:date}'
        }
      }

    }
  }
});
