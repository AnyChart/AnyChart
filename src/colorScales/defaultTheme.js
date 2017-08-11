goog.provide('anychart.colorScalesModule.defaultTheme');


goog.mixin(goog.global['anychart']['themes']['defaultTheme'], {
  'defaultColorRange': {
    'enabled': false,
    'stroke': '#B9B9B9',
    'orientation': 'bottom',
    'title': {'enabled': false},
    'colorLineSize': 10,
    'padding': {
      'top': 10,
      'right': 0,
      'bottom': 0,
      'left': 0
    },
    'margin': 0,
    'align': 'center',
    'length': '50%',
    'marker': {
      'padding': 3,
      'positionFormatter': anychart.core.defaultTheme.returnValue,
      'enabled': true,
      'disablePointerEvents': false,
      'position': 'center',
      'rotation': 0,
      'anchor': 'center',
      'offsetX': 0,
      'offsetY': 0,
      'type': 'triangle-down',
      'fill': anychart.core.defaultTheme.defaultSelectColor,
      'stroke': 'none',
      'size': 7
    },
    'labels': {
      'offsetX': 0,
      'offsetY': 0,
      'fontSize': 11,
      'padding': 0
    },
    'ticks': {
      'stroke': '#B9B9B9',
      'position': 'outside',
      'length': 5,
      'enabled': true
    },
    'minorTicks': {
      'stroke': '#B9B9B9',
      'position': 'outside',
      'length': 3,
      'enabled': false
    }
  },
  'defaultOrdinalColorScale': {
    'inverted': false,
    'ticks': {
      'maxCount': 100
    },
    'autoColors': function(rangesCount) {
      return anychart.color.blendedHueProgression('#90caf9', '#01579b', rangesCount);
    }
  },
  'defaultLinearColorScale': {
    'maxTicksCount': 1000,
    'colors': ['#90caf9', '#01579b'],
    'minimumGap': 0,
    'maximumGap': 0
  }
});
goog.mixin(goog.global['anychart']['themes']['defaultTheme']['standalones'], {
  'colorRange': {
    'enabled': true,
    'zIndex': 50
  }
});
