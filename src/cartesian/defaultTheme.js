goog.provide('anychart.cartesianModule.defaultTheme');


goog.mixin(goog.global['anychart']['themes']['defaultTheme'], {
  // merge with cartesianBase
  'cartesian': {
    'defaultSeriesType': 'line',
    'xAxes': [],
    'yAxes': []
  },

  // merge with cartesianBase
  'area': {
    'defaultSeriesType': 'area',
    'tooltip': {
      'displayMode': 'union'
    },
    'interactivity': {
      'hoverMode': 'by-x'
    }
  },
  'bar': {
    'isVertical': true,
    'defaultSeriesType': 'bar',
    'defaultXAxisSettings': {
      'orientation': 'left'
    },
    'defaultYAxisSettings': {
      'orientation': 'bottom'
    },
    'scales': [
      {
        'type': 'ordinal',
        'inverted': true
      },
      {
        'type': 'linear',
        'stackDirection': 'reverse'
      }
    ],
    'tooltip': {
      'displayMode': 'single',
      'position': 'right-center',
      'anchor': 'left-center'
    },
    'xScroller': {
      'orientation': 'left'
    }
  },
  'column': {
    'defaultSeriesType': 'column',
    'tooltip': {
      'displayMode': 'single',
      'position': 'center-top',
      'anchor': 'center-bottom',
      'offsetX': 0,
      'offsetY': 10
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
  },
  'line': {
    'defaultSeriesType': 'line',
    'tooltip': {
      'displayMode': 'union'
    },
    'interactivity': {
      'hoverMode': 'by-x'
    }
  },
  'box': {
    'defaultSeriesType': 'box'
  },
  'financial': {
    'defaultSeriesType': 'candlestick',
    'defaultSeriesSettings': {
      'candlestick': {
        'tooltip': {
          'titleFormat': anychart.core.defaultTheme.returnDateTimeX
        },
        'normal': {
          'labels': {
            'format': anychart.core.defaultTheme.returnDateTimeX
          }
        }
      },
      'ohlc': {
        'tooltip': {
          'titleFormat': anychart.core.defaultTheme.returnDateTimeX
        },
        'normal': {
          'labels': {
            'format': anychart.core.defaultTheme.returnDateTimeX
          }
        }
      }
    },
    'xAxes': [
      {
        'labels': {
          'format': anychart.core.defaultTheme.returnDateTimeTickValue
        },
        'minorLabels': {
          'format': anychart.core.defaultTheme.returnDateTimeTickValue
        }
      }
    ],
    'scales': [
      {
        'type': 'date-time'
      },
      {
        'type': 'linear'
      }
    ]
  },
  'verticalLine': {
    'isVertical': true,
    'defaultSeriesType': 'line',
    'defaultXAxisSettings': {
      'orientation': 'left'
    },
    'defaultYAxisSettings': {
      'orientation': 'bottom'
    },
    'scales': [
      {
        'type': 'ordinal',
        'inverted': true
      },
      {
        'type': 'linear'
      }
    ],
    'tooltip': {
      'displayMode': 'union'
    },
    'interactivity': {
      'hoverMode': 'by-x'
    },
    'xScroller': {
      'orientation': 'left'
    }
  },
  'verticalArea': {
    'isVertical': true,
    'defaultSeriesType': 'area',
    'defaultXAxisSettings': {
      'orientation': 'left'
    },
    'defaultYAxisSettings': {
      'orientation': 'bottom'
    },
    'scales': [
      {
        'type': 'ordinal',
        'inverted': true
      },
      {
        'type': 'linear'
      }
    ],
    'tooltip': {
      'displayMode': 'union'
    },
    'interactivity': {
      'hoverMode': 'by-x'
    },
    'xScroller': {
      'orientation': 'left'
    }
  }
});
