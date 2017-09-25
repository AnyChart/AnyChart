goog.provide('anychart.pyramidFunnelModule.defaultTheme');


goog.mixin(goog.global['anychart']['themes']['defaultTheme'], {
  'funnel': {
    'title': {
      'text': 'Funnel Chart'
    },
    'neckWidth': '30%',
    'neckHeight': '25%',
    'reversed': true,
    'normal': {
      'labels': {
        'position': 'outside-left-in-column'
      }
    }
  },
  'pyramid': {
    'title': {
      'text': 'Pyramid Chart'
    },
    'legend': {
      'inverted': true
    },
    'normal': {
      'labels': {
        'position': 'outside-left-in-column'
      }
    },
    'reversed': false
  }
});
