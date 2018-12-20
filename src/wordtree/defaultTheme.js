goog.provide('anychart.wordtreeModule.defaultTheme');


goog.mixin(goog.global['anychart']['themes']['defaultTheme'], {
  'wordtree': {
    'maxFontSize': 36,
    'minFontSize': 7,
    'fontFamily': 'Verdana, Helvetica, Arial, sans-serif',
    'fontColor': '#7c868e',
    'fontDecoration': 'none',
    'fontOpacity': 1,
    'fontStyle': 'normal',
    'fontWeight': 400,
    'postfix': 'more',
    'connectors': {
      'stroke': '2 #888888',
      'curveFactor': 0.5,
      'length': 30,
      'offset': 5
    },
    'tooltip': {
      'titleFormat': '{%Value}',
      'format': 'Weight: {%weight}'
    }
  }
});
