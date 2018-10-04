goog.provide('anychart.sparklineModule.defaultTheme');


goog.mixin(goog.global['anychart']['themes']['defaultTheme'], {
  // merge with chart
  'sparkline': {
    'background': {'enabled': true},
    'title': {
      'enabled': false,
      'padding': 0,
      'margin': 0,
      'orientation': 'right',
      'rotation': 0
    },
    'margin': 0,
    'padding': 0,
    'hatchFill': null,
    'markers': {},
    'interactivity': {
      'hoverMode': 'by-x'
    },

    'firstMarkers': {
      'fill': '#64b5f6'
    },
    'lastMarkers': {
      'fill': '#64b5f6'
    },
    'negativeMarkers': {
      'fill': '#ef6c00'
    },
    'minMarkers': {
      'fill': '#455a64'
    },
    'maxMarkers': {
      'fill': '#dd2c00'
    },

    'labels': {},
    'firstLabels': {},
    'lastLabels': {},
    'negativeLabels': {},
    'minLabels': {
      'fontSize': 9,
      'padding': {
        'top': 3,
        'right': 0,
        'bottom': 3,
        'left': 0
      },
      'fontColor': '#303f46'
    },
    'maxLabels': {
      'fontSize': 9,
      'padding': {
        'top': 3,
        'right': 0,
        'bottom': 3,
        'left': 0
      },
      'fontColor': '#9b1f00'
    },

    'lineAxesMarkers': [],
    'rangeAxesMarkers': [],
    'textAxesMarkers': [],
    'scales': [
      {
        'type': 'ordinal'
      },
      {
        'type': 'linear'
      }
    ],
    'xScale': 0,
    'yScale': 1,
    'clip': true,
    'seriesType': 'line',
    'connectMissingPoints': false,
    'pointWidth': '95%',

    'tooltip': {
      'title': false,
      'separator': false,
      /**
       * @this {*}
       * @return {*}
       */
      'titleFormat': function() {
        return this['x'];
      },
      /**
       * @this {*}
       * @return {*}
       */
      'format': function() {
        return 'x: ' + this['x'] + '\ny: ' + anychart.core.defaultTheme.locNum(this['value']);
      },
      'allowLeaveChart': true
    },

    'defaultSeriesSettings': {
      'base': {
        'markers': {
          'enabled': false,
          'position': 'center',
          'anchor': 'center',
          'type': 'circle',
          'size': 1.8,
          'stroke': 'none'
        },
        'hoverMarkers': {
          'enabled': true
        },
        'labels': {
          'enabled': false,
          'fontSize': 8,
          'background': {
            'enabled': false
          },
          'position': 'center',
          'anchor': 'center-bottom'
        },
        'minLabels': {
          'position': 'center-bottom',
          'anchor': 'center-bottom'
        },
        'maxLabels': {
          'position': 'center-top',
          'anchor': 'center-top'
        },
        'color': '#64b5f6'
      },
      'area': {
        'stroke': '#64b5f6',
        'fill': '#64b5f6 0.5'
      },
      'column': {
        'markers': {
          'position': 'center-top'
        },
        'labels': {
          'position': 'center-top',
          'anchor': 'center-bottom'
        },
        'negativeMarkers': {
          'position': 'center-bottom'
        },
        'negativeLabels': {
          'position': 'center-bottom',
          'anchor': 'center-top'
        },
        'fill': '#64b5f6',
        'negativeFill': '#ef6c00'
      },
      'line': {
        'stroke': '#64b5f6'
      },
      'winLoss': {
        'markers': {
          'position': 'center-top',
          'anchor': 'center-top'
        },
        'labels': {
          'position': 'center-top',
          'anchor': 'center-top'
        },
        'negativeMarkers': {
          'position': 'center-bottom',
          'anchor': 'center-bottom'
        },
        'negativeLabels': {
          'position': 'center-bottom',
          'anchor': 'center-bottom'
        },
        'fill': '#64b5f6',
        'negativeFill': '#ef6c00'
      }
    }
  }
});
