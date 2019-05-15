goog.provide('anychart.vennModule.defaultTheme');


/**
 * Default tooltip for intersections and chart.
 * */
anychart.vennModule.defaultTheme.tooltip = {
  'titleFormat': '{%Name}',
  'format': 'Value: {%Value}'
};


goog.mixin(goog.global['anychart']['themes']['defaultTheme'], {
  'venn': {
    'dataSeparator': '&',
    'background': {
      'zIndex': 0
    },
    'padding': {
      'top': 15,
      'right': 5,
      'bottom': 15,
      'left': 5
    },
    'a11y': {
      'enabled': true,
      'titleFormat': anychart.core.defaultTheme.chartA11yTitleFormatter,
      'mode': 'chart-elements'
    },
    'color': '#64b5f6',
    'normal': {
      'fill': anychart.core.defaultTheme.returnSourceColor50,
      'stroke': 'none',
      'hatchFill': false,
      'labels': {
        'fontColor': '#f4f4f4',
        'format': '{%Name}',
        'enabled': true,
        'disablePointerEvents': true,
        'zIndex': 100,
        'fontWeight': 'bold'
      },
      'markers': {
        'enabled': false,
        'zIndex': 99,
        'disablePointerEvents': true,
        'stroke': 'none'
      }
    },
    'hovered': {
      'fill': anychart.core.defaultTheme.returnLightenSourceColor50,
      'stroke': 'none',
      'hatchFill': false,
      'labels': {
        'enabled': null
      },
      'markers': {
        'enabled': null
      }
    },
    'selected': {
      'fill': anychart.core.defaultTheme.defaultSelectColor,
      'stroke': 'none',
      'hatchFill': false,
      'labels': {
        'enabled': null
      },
      'markers': {
        'enabled': null
      }
    },
    'tooltip': anychart.vennModule.defaultTheme.tooltip,
    'intersections': {
      'normal': {
        'fill': '#fff 0.00001',
        'stroke': 'none',
        'labels': {
          'fontWeight': 'normal',
          'format': '{%Value}',
          'enabled': null
        },
        'markers': {
          'enabled': null
        }
      },
      'hovered': {
        'fill': '#fff 0.5',
        'stroke': 'none',
        'labels': {
          'enabled': null
        },
        'hoverMarkers': {
          'enabled': null
        }
      },
      'selected': {
        'fill': anychart.core.defaultTheme.defaultSelectColor,
        'stroke': 'none',
        'labels': {
          'enabled': null
        },
        'markers': {
          'enabled': null
        }
      },
      'tooltip': anychart.vennModule.defaultTheme.tooltip
    },
    'legend': {
      'enabled': true,
      'zIndex': 0,
      'tooltip': {
        'enabled': false
      },
      'padding': {'top': 10, 'right': 10, 'bottom': 0, 'left': 10},
      'position': 'bottom'
    }
  }
});
