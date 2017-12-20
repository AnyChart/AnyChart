goog.provide('anychart.pieModule.defaultTheme');


goog.mixin(goog.global['anychart']['themes']['defaultTheme'], {
  'pie': {
    'interactivity': {
      'multiSelectOnClick': true,
      'unselectOnClickOutOfPoint': false
    },
    'animation': {
      'duration': 2000
    },
    'title': {
      'text': 'Pie Chart'
    },
    'group': false,
    'sort': 'none',
    'radius': '45%',
    'innerRadius': 0,
    'startAngle': 0,
    'outsideLabelsCriticalAngle': 60,
    'insideLabelsOffset': '50%',
    'center': {
      'fill': 'none',
      'stroke': 'none'
    },
    'normal': {
      'labels': {
        'format': anychart.core.defaultTheme.PERCENT_VALUE_TOKEN + '%'
      },
      'explode': 0,
      'outline': {
        'enabled': true,
        'width': 0,
        'offset': 0,
        'fill': anychart.core.defaultTheme.returnLightenSourceColor50,
        'stroke': 'none'
      }
    },
    'hovered': {
      'explode': 0,
      'outline': {
        'enabled': null,
        'width': 10,
        'offset': 0,
        'fill': anychart.core.defaultTheme.returnSourceColor,
        'stroke': 'none'
      }
    },
    'selected': {
      'explode': '5%',
      'fill': anychart.core.defaultTheme.returnSourceColor,
      'stroke': 'none',
      'outline': {
        'enabled': null,
        'width': 10,
        'offset': 0,
        'fill': anychart.core.defaultTheme.returnLightenSourceColor50,
        'stroke': 'none'
      }
    },
    'a11y': {
      'titleFormat': anychart.core.defaultTheme.pieA11yTitleFormatter
    }
  },
  // merge with pie
  'pie3d': {
    'mode3d': true,
    'explode': '5%',
    'connectorLength': '15%',
    //'legend': {
    'legendItem': {
      'iconStroke': null
    }
    //}
  }
});
