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
        'stroke': 'none',
        'hoverStroke': 'none',
        'selectStroke': 'none',
        'fill': anychart.core.defaultTheme.returnSourceColor,
        'hoverFill': anychart.core.defaultTheme.returnLightenSourceColor,
        'selectFill': anychart.core.defaultTheme.defaultSelectSolidColor,
        'tooltip': {
          'anchor': 'left-top',
          'position': 'left-top'
        }
      },
      'area': {
        'hoverMarkers': {
          'enabled': true
        },
        'selectMarkers': {
          'enabled': true
        }
      },
      'bar': {
        'isVertical': true
      },
      'line': {
        'hoverMarkers': {
          'enabled': true
        },
        'selectMarkers': {
          'enabled': true
        }
      },
      'line2d': {
        'hoverMarkers': {
          'enabled': true
        },
        'selectMarkers': {
          'enabled': true
        },
        'stroke': anychart.core.defaultTheme.returnSourceColor,
        'hoverStroke': anychart.core.defaultTheme.returnLightenSourceColor,
        'selectStroke': anychart.core.defaultTheme.defaultSelectSolidColor
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
