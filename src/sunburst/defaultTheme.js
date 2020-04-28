goog.provide('anychart.sunburstModule.defaultTheme');


/**
 * @this {*}
 * @return {*}
 */
anychart.core.defaultTheme.returnNameOrNameWithValue = function() {
  var calcMode = this['chart']['calculationMode']();
  return this['name'] + (calcMode == 'parent-dependent' || calcMode == 'parent-independent' ?
      '\n' +  anychart.core.defaultTheme.locNum(this['value']) : '');
};


goog.mixin(goog.global['anychart']['themes']['defaultTheme'], {
  'sunburst': {
    'animation': {
      'duration': 2000
    },
    'title': {
      'text': 'Sunburst Chart'
    },
    'interactivity': {
      'selectionMode': 'drill-down'
    },
    'radius': '45%',
    'innerRadius': 0,
    'startAngle': 0,
    'a11y': {
      'titleFormat': anychart.core.defaultTheme.pieA11yTitleFormatter
    },
    'center': {
      'fill': 'none',
      'stroke': 'none'
    },
    'calculationMode': 'ordinal-from-root',
    'tooltip': {
      'enabled': true,
      'title': false,
      'separator': false,
      'titleFormat': anychart.core.defaultTheme.returnName,
      'format': anychart.core.defaultTheme.returnNameOrNameWithValue
    },
    'leaves': {
      'enabled': null,
      'normal': {
        'labels': {
          'padding': '10%',
          'hAlign': 'center',
          'position': 'radial',
          'format': anychart.core.defaultTheme.returnName
        }
      }
    },
    'sort': 'none',
    'normal': {
      /**
       * @this {*}
       * @return {*}
       */
      'fill': anychart.core.defaultTheme.returnSourceColor,
      'stroke': '#fff',
      'labels': {
        'adjustFontSize': [true, true],
        'maxFontSize': 14,
        'minFontSize': 1,
        'padding': [1, '5%', 1, '5%'],
        'enabled': true,
        'hAlign': 'center',
        'vAlign': 'middle',
        'position': 'circular',
        'anchor': 'center',
        'fontColor': anychart.core.defaultTheme.fontColorReversedNormal,
        'format': anychart.core.defaultTheme.returnNameOrNameWithValue
      }
    },
    'hovered': {
      'fill': anychart.core.defaultTheme.returnLightenSourceColor,
      'stroke': anychart.core.defaultTheme.returnSourceColor,
      'labels': {
        'enabled': null
      }
    },
    'selected': {
      'fill': anychart.core.defaultTheme.defaultSelectColor,
      'stroke': anychart.core.defaultTheme.returnSourceColor,
      'labels': {
        'enabled': null
      }
    }
  }
});
