goog.provide('anychart.surfaceModule.defaultTheme');


goog.mixin(goog.global['anychart']['themes']['defaultTheme'], {
  'surface': {
    'rotationZ': 17,
    'rotationY': 35,
    'box': null,
    'stroke': {
      'color': ''
    },
    'colorScale': {
      'type': 'linear-color'
    },
    'colorRange': {
      'marker': {
        'enabled': false,
        'type': anychart.enums.MarkerType.TRIANGLE_DOWN
      },
      'labels': {
        'useHtml': true
      }
    },
    'xAxis': {
      'enabled': true,
      'orientation': 'right',
      'stroke': 'red',
      'labels': {
        'useHtml': true
      },
      'ticks': {
        'stroke': 'red'
      },
      'minorLabels': {
        'useHtml': true
      },
      'minorTicks': {
        'stroke': anychart.color.lighten('red')
      }
    },
    'yAxis': {
      'enabled': true,
      'orientation': 'bottom',
      'stroke': 'green',
      'labels': {
        'useHtml': true
      },
      'minorLabels': {
        'useHtml': true
      },
      'ticks': {
        'stroke': 'green'
      },
      'minorTicks': {
        'stroke': anychart.color.lighten('green')
      }
    },
    'zAxis': {
      'enabled': true,
      'orientation': 'left',
      'stroke': 'blue',
      'labels': {
        'useHtml': true
      },
      'minorLabels': {
        'useHtml': true
      },
      'ticks': {
        'stroke': 'blue'
      },
      'minorTicks': {
        'stroke': anychart.color.lighten('blue')
      }
    },
    'xGrid': {
      'zIndex': 35,
      'enabled': true
    },
    'yGrid': {
      'zIndex': 35,
      'enabled': true
    },
    'zGrid': {
      'zIndex': 35,
      'enabled': true
    }
  }
});
