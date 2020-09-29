goog.provide('anychart.polarModule.defaultTheme');


goog.mixin(goog.global['anychart']['themes']['defaultTheme'], {
  // merge with chart
  'polar': {
    'defaultSeriesType': 'marker',
    'defaultSeriesSettings': {
      'base': {
        'closed': true,
        'clip': false
      },
      'area': {},
      'line': {},
      'marker': {},
      'column': {},
      'rangeColumn': {}
    },
    'xAxis': {
      'scale': 0,
      'zIndex': 25,
      'fill': 'none',
      'labels': {
        'position': 'outside',
        'vAlign': 'middle',
        'hAlign': 'middle',
        'anchor': 'auto',
        'zIndex': 25
      },
      'minorLabels': {
        'anchor': 'auto',
        'zIndex': 25
      },
      'ticks': {
        'zIndex': 25
      },
      'minorTicks': {
        'zIndex': 25
      }
    },
    'yAxis': {
      'scale': 1
    },
    'startAngle': 0,
    'spreadValues': 'none',
    'innerRadius': 0,
    'sortPointsByX': false,
    'xGrids': [{}],
    'yGrids': [{}],
    'minorGrids': [],
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
    'barsPadding': 0,
    'barGroupsPadding': 0,
    'a11y': {
      'titleFormat': anychart.core.defaultTheme.scatterA11yTitleFormatter
    }
  }
});
