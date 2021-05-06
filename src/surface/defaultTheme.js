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
        'type': 'triangle-down'
      },
      'labels': {
        'useHtml': true
      }
    },
    'markers': {
      'enabled': false,
      'type': 'circle',
      'size': 4,
      'fill': anychart.core.defaultTheme.returnSourceColor,
      'stroke': anychart.core.defaultTheme.returnDarkenSourceColor,
      'tooltip': {
        'enabled': true,
        'format': 'x: {%x}\ny: {%y}\nz: {%z}',
        'titleFormat': 'Marker: {%index}',
        'separator': {
          'enabled': false
        },
        'title': {
          'enabled': false
        }
      },
      'droplines': {
        'enabled': false,
        'stroke': '#CECECE'
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
