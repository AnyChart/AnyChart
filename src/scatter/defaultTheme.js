goog.provide('anychart.scatterModule.defaultTheme');


goog.mixin(goog.global['anychart']['themes']['defaultTheme'], {
  // merge with chart
  'scatter': {
    'defaultSeriesType': 'marker',
    'legend': {
      'enabled': false
    },
    'defaultSeriesSettings': {
      'base': {
        'clip': true,
        'color': null,
        'tooltip': {
          /**
           * @this {*}
           * @return {string}
           */
          'titleFormat': function() {
            return this['seriesName'];
          },
          /**
           * @this {*}
           * @return {*}
           */
          'format': function() {
            return 'x: ' + this['x'] + '\ny: ' + this['valuePrefix'] + anychart.core.defaultTheme.locNum(this['value']) + this['valuePostfix'];
          }
        },
        'xScale': null,
        'yScale': null,
        'a11y': {
          'enabled': false,
          'titleFormat': 'Series named {%SeriesName} with {%SeriesPointsCount} points. Min value is {%SeriesYMin}, max value is {%SeriesYMax}'
        }
      },
      'bubble': {
        'normal': {
          'negativeFill': anychart.core.defaultTheme.returnDarkenSourceColor,
          'negativeStroke': anychart.core.defaultTheme.returnDarkenSourceColor,
          'negativeHatchFill': null,
          'labels': {
            'anchor': 'center'
          }
        },
        'hovered': {
          'negativeFill': anychart.core.defaultTheme.returnDarkenSourceColor,
          'negativeStroke': anychart.core.defaultTheme.returnDarkenSourceColor,
          'negativeHatchFill': undefined
        },
        'displayNegative': false,
        'hatchFill': false,
        'tooltip': {
          /**
           * @this {*}
           * @return {*}
           */
          'format': function() {
            return 'X: ' + this['x'] + '\nY: ' + this['valuePrefix'] + anychart.core.defaultTheme.locNum(this['value']) + this['valuePostfix'] + '\nSize: ' + anychart.core.defaultTheme.locNum(this['size']);
          }
        }
      },
      'line': {
        'connectMissingPoints': false
      },
      'marker': {
        'normal': {
          'size': 5
        },
        'hovered': {
          'size': 7
        },
        'selected': {
          'size': 7
        }
      }
    },
    'defaultAnnotationSettings': {},
    'defaultXAxisSettings': {
      'orientation': 'bottom',
      'scale': 0,
      'title': {
        'text': 'X-Axis'
      }
    },
    'defaultYAxisSettings': {
      'orientation': 'left',
      'scale': 1,
      'title': {
        'text': 'Y-Axis'
      }
    },
    'series': [],
    'xGrids': [],
    'yGrids': [],
    'xMinorGrids': [],
    'yMinorGrids': [],
    'xAxes': [{}],
    'yAxes': [{}],
    'lineAxesMarkers': [],
    'rangeAxesMarkers': [],
    'textAxesMarkers': [],
    'scales': [
      {
        'type': 'linear'
      },
      {
        'type': 'linear'
      }
    ],
    'xScale': 0,
    'yScale': 1,
    'maxBubbleSize': '20%',
    'minBubbleSize': '5%',
    'crosshair': {
      'enabled': false,
      'displayMode': 'float',
      'xStroke': anychart.core.defaultTheme.colorStrokeExtraBright,
      'yStroke': anychart.core.defaultTheme.colorStrokeExtraBright,
      'zIndex': 41,
      'xLabels': [{'enabled': null}],
      'yLabels': [{'enabled': null}]
    },
    'a11y': {
      'titleFormat': anychart.core.defaultTheme.scatterA11yTitleFormatter
    },
    'annotations': {
      'annotationsList': [],
      'zIndex': 2000
    }
  },

  // merge with scatter
  'marker': {},
  'bubble': {},
  'quadrant': {
    'scales': [
      {
        'type': 'linear',
        'minimum': 0,
        'maximum': 100
      }, {
        'type': 'linear',
        'minimum': 0,
        'maximum': 100
      }],
    'xScale': 0,
    'yScale': 1,
    'defaultXAxisSettings': {
      'ticks': false,
      'labels': false,
      'title': {
        'enabled': false,
        'align': 'left'
      },
      'stroke': '3 #bbdefb'
    },
    'defaultYAxisSettings': {
      'ticks': false,
      'labels': false,
      'title': {
        'enabled': false,
        'align': 'left'
      },
      'stroke': '3 #bbdefb'
    },
    'xAxes': [
      {},
      {
        'orientation': 'top'
      }
    ],
    'yAxes': [
      {},
      {
        'orientation': 'right'
      }
    ],
    'crossing': {
      'stroke': '#bbdefb'
    },
    'quarters': {
      'rightTop': {
        'enabled': true
      },
      'leftTop': {
        'enabled': true
      },
      'leftBottom': {
        'enabled': true
      },
      'rightBottom': {
        'enabled': true
      }
    }
  }
});
