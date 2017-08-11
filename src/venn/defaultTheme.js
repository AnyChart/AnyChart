goog.provide('anychart.vennModule.defaultTheme');


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
    'fill': anychart.core.defaultTheme.returnSourceColor50,
    'hoverFill': anychart.core.defaultTheme.returnLightenSourceColor50,
    'selectFill': anychart.core.defaultTheme.defaultSelectColor,
    'tooltip': {
      'titleFormat': '{%Name}',
      'format': 'Value: {%Value}'
    },
    'stroke': 'none',
    'hoverStroke': 'none',
    'hatchFill': false,
    'hoverHatchFill': false,
    'selectHatchFill': false,
    'selectStroke': 'none',
    'labels': {
      'fontColor': '#f4f4f4',
      'format': '{%Name}',
      'enabled': true,
      'disablePointerEvents': true,
      'zIndex': 100,
      'fontWeight': 'bold'
    },
    'hoverLabels': {
      'enabled': null
    },
    'selectLabels': {
      'enabled': null
    },
    'markers': {
      'enabled': false,
      'zIndex': 99,
      'disablePointerEvents': true,
      'stroke': 'none'
    },
    'hoverMarkers': {
      'enabled': null
    },
    'selectMarkers': {
      'enabled': null
    },
    'intersections': {
      'fill': '#fff 0.00001',
      'hoverFill': '#fff 0.5',
      'selectFill': anychart.core.defaultTheme.defaultSelectColor,
      'stroke': 'none',
      'hoverStroke': 'none',
      'selectStroke': 'none',
      'labels': {
        'fontWeight': 'normal',
        'format': '{%Value}',
        'enabled': null
      },
      'hoverLabels': {
        'enabled': null
      },
      'selectLabels': {
        'enabled': null
      },
      'markers': {
        'enabled': null
      },
      'hoverMarkers': {
        'enabled': null
      },
      'selectMarkers': {
        'enabled': null
      },
      'tooltip': {
        'titleFormat': '{%Name}'
      }
    },
    'legend': {
      'enabled': true,
      'zIndex': 0,
      'tooltip': {
        'enabled': false
      },
      'padding': {
        'top': 10,
        'right': 10,
        'bottom': 0,
        'left': 10
      },
      'position': 'bottom'
    }
  }
});
