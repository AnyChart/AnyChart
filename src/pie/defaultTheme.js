goog.provide('anychart.pieModule.defaultTheme');


goog.mixin(goog.global['anychart']['themes']['defaultTheme'], {
  'pie': {
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
    'explode': 15,
    'outsideLabelsCriticalAngle': 60,
    'outsideLabelsSpace': 30,
    'insideLabelsOffset': '50%',
    'normal': {
      'labels': {
        'format': anychart.core.defaultTheme.PERCENT_VALUE_TOKEN + '%'
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
