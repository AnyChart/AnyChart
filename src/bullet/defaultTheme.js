goog.provide('anychart.bulletModule.defaultTheme');


goog.mixin(goog.global['anychart']['themes']['defaultTheme'], {
  // merge with chart
  'bullet': {
    'background': {
      'enabled': true
    },
    'layout': 'horizontal',
    'defaultRangeMarkerSettings': {
      'enabled': true,
      'from': 0,
      'to': 0,
      'zIndex': 2
    },
    'padding': {
      'top': 5,
      'right': 10,
      'bottom': 5,
      'left': 10
    },
    'margin': 0,
    'defaultMarkerSettings': {
      'fill': '#64b5f6',
      'stroke': '2 #64b5f6',
      'zIndex': 2
    },
    'rangePalette': {
      'type': 'distinct',
      'items': ['#828282', '#a8a8a8', '#c2c2c2', '#d4d4d4', '#e1e1e1']
    },
    'markerPalette': {
      'items': ['bar', 'line', 'x', 'ellipse']
    },
    'axis': {
      'enabled': false,
      'title': {
        'padding': 0,
        'margin': {
          'top': 0,
          'right': 0,
          'bottom': 10,
          'left': 0
        }
      },
      'labels': {
        'fontSize': 9,
        'padding': 0
      },
      'minorLabels': {
        'padding': 0
      },
      'ticks': {
        'enabled': false
      },
      'orientation': null,
      'zIndex': 3
    },
    'title': {
      'rotation': 0
    },
    'scale': {
      'type': 'linear',
      'minimumGap': 0,
      'maximumGap': 0,
      'ticks': {
        'minCount': 2,
        'maxCount': 5,
        'interval': NaN
      }
    },
    'ranges': [],
    'a11y': {
      'titleFormat': anychart.core.defaultTheme.bulletA11yTitleFormatter
    }
  }
});
