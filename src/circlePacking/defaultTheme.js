goog.provide('anychart.circlePackingModule.defaultTheme');


goog.mixin(goog.global['anychart']['themes']['defaultTheme'], {
  'circlePacking': {
    'normal': {
      /**
       * @this {*}
       * @return {*}
       */
      'fill': anychart.core.defaultTheme.returnSourceColor,

      /**
       * @this {*}
       * @return {*}
       */
      'stroke': anychart.core.defaultTheme.returnDarkenSourceColor,
      
      'labels': {
        'format': '{%name}',
        'enabled': true,
        'hAlign': 'center',
        'vAlign': 'middle',
        'anchor': 'center-top',
        'position': 'center-top',
        'fontSize': 14,
        'fontColor': '#fff',
        'textShadow': '2px 2px 0px black',
        'disablePointerEvents': true,
        'width': null,
        'height': null,
      }
    },

    'labelsMode': 'roots',

    'hovered': {
      /**
       * @this {*}
       * @return {*}
       */
      'fill': anychart.core.defaultTheme.returnLightenSourceColor,

      /**
       * @this {*}
       * @return {*}
       */
      'stroke': anychart.core.defaultTheme.returnStrokeSourceColor
    },

    'selected': {
      'fill': anychart.core.defaultTheme.defaultSelectColor,
      'stroke': '#fff'
    },

    'tooltip': {
      'titleFormat': '{%name}',
      'format': 'Value: {%value}'
    }

  }
});
