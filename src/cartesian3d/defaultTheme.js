goog.provide('anychart.cartesian3dModule.defaultTheme');


goog.mixin(goog.global['anychart']['themes']['defaultTheme'], {
  // merges with nothing
  'cartesian3dBase': {
    'zAngle': 45,
    'zAspect': '50%',
    'zDistribution': false,
    'zPadding': 10,
    'defaultSeriesSettings': {
      'base': {
        'normal': {
          'stroke': 'none',
          'fill': anychart.core.defaultTheme.returnSourceColor
        },
        'hovered': {
          'stroke': 'none',
          'fill': anychart.core.defaultTheme.returnLightenSourceColor
        },
        'selected': {
          'stroke': 'none',
          'fill': anychart.core.defaultTheme.defaultSelectSolidColor
        },
        'tooltip': {
          'anchor': 'left-top',
          'position': 'left-top'
        }
      },
      'area': {
        'hovered': {
          'markers': {
            'enabled': true
          }
        },
        'selected': {
          'markers': {
            'enabled': true
          }
        }
      },
      'bar': {
        'isVertical': true
      },
      'line': {
        'hovered': {
          'markers': {
            'enabled': true
          }
        },
        'selected': {
          'markers': {
            'enabled': true
          }
        }
      },
      'line2d': {
        'normal': {
          'stroke': anychart.core.defaultTheme.returnSourceColor
        },
        'hovered': {
          'stroke': anychart.core.defaultTheme.returnLightenSourceColor,
          'markers': {
            'enabled': true
          }
        },
        'selected': {
          'stroke': anychart.core.defaultTheme.defaultSelectSolidColor,
          'markers': {
            'enabled': true
          }
        }
      }
    }
  },
  // merge with area
  'bar3d': {
    'grids': [
      {},
      {
        'enabled': true,
        'layout': 'horizontal',
        'scale': 0
      }
    ]
  },
  // merge with column
  'column3d': {
    'defaultSeriesType': 'column',
    'grids': [
      {},
      {
        'enabled': true,
        'layout': 'vertical',
        'scale': 0
      }
    ]
  },
  // merge with area
  'area3d': {
    'defaultSeriesType': 'area',
    'zDistribution': true,
    'zPadding': 5,
    'grids': [
      {},
      {
        'enabled': true,
        'layout': 'vertical',
        'scale': 0
      }
    ]
  },
  // merge with area
  'line3d': {
    'defaultSeriesType': 'line',
    'zDistribution': true,
    'zPadding': 5,
    'grids': [
      {},
      {
        'enabled': true,
        'layout': 'vertical',
        'scale': 0
      }
    ]
  },
  // merge with cartesian
  'cartesian3d': {
    'defaultSeriesType': 'column'
  }
});
