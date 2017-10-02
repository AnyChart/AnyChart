goog.provide('anychart.paretoModule.defaultTheme');


goog.mixin(goog.global['anychart']['themes']['defaultTheme'], {
  'pareto': {
    'defaultSeriesType': 'column',
    'tooltip': {
      'displayMode': 'union'
    },
    'interactivity': {
      'hoverMode': 'by-x'
    },
    'yAxes': [
      {
        'orientation': 'left'
      },
      {
        'orientation': 'right',
        'labels': {
          'format': '{%Value}%'
        }
      }
    ]
  }
});
