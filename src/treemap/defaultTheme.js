goog.provide('anychart.treemapModule.defaultTheme');


goog.mixin(goog.global['anychart']['themes']['defaultTheme'], {
  'treeMap': {
    'sort': 'desc',
    'labelsDisplayMode': 'clip',
    'headersDisplayMode': 'always-show',
    'colorRange': {
      'zIndex': 50
    },
    'colorScale': {
      'type': 'ordinal-color'
    },
    'tooltip': {
      'enabled': true,
      'titleFormat': anychart.core.defaultTheme.returnName,
      'format': anychart.core.defaultTheme.returnValue
    },
    'legend': {
      'itemsSourceMode': 'categories'
    },
    'maxDepth': 1,
    'hintDepth': 0,
    'hintOpacity': 0.4,
    'maxHeadersHeight': '25',
    'headers': {
      'enabled': true,
      'hAlign': 'center',
      'vAlign': 'middle',
      'position': 'left-top',
      'anchor': 'left-top',
      'background': {
        'enabled': true,
        'fill': '#F7F7F7',
        'stroke': '#e0e0e0'
      },
      'format': anychart.core.defaultTheme.returnName
    },
    'hoverHeaders': {
      'enabled': true,
      'fontColor': anychart.core.defaultTheme.defaultSelectColor,
      'background': {
        'fill': '#e0e0e0',
        'stroke': '#e0e0e0'
      }
    },
    'labels': {
      'enabled': true,
      'hAlign': 'center',
      'vAlign': 'middle',
      'position': 'left-top',
      'anchor': 'left-top',
      'fontColor': anychart.core.defaultTheme.fontColorDark,
      'format': anychart.core.defaultTheme.returnNameWithValue
    },
    'hoverLabels': {
      'enabled': null,
      'fontWeight': 'bold'
    },
    'selectLabels': {
      'enabled': null,
      'fontColor': '#fafafa'
    },
    'markers': {
      'enabled': false,
      'position': 'center',
      'size': 6,
      'fill': '#dd2c00',
      'type': 'circle'
    },
    'hoverMarkers': {
      'enabled': null,
      'size': 8
    },
    'selectMarkers': {
      'enabled': null,
      'size': 8,
      'fill': anychart.core.defaultTheme.defaultSelectColor,
      'stroke': anychart.core.defaultTheme.defaultSelectStroke
    },
    /**
     * @this {*}
     * @return {*}
     */
    'fill': function() {
      var color;
      if (this['colorScale']) {
        color = this['colorScale'].valueToColor(this['value']);
      } else {
        color = anychart.color.setOpacity(this['sourceColor'], 0.85, true);
      }
      return color;
    },
    'stroke': '#e0e0e0',
    'hoverFill': anychart.core.defaultTheme.returnLightenSourceColor,
    'hoverStroke': anychart.core.defaultTheme.returnDarkenSourceColor,
    'selectFill': anychart.core.defaultTheme.defaultSelectColor,
    'selectStroke': anychart.core.defaultTheme.defaultSelectStroke,
    'hatchFill': false,
    'hoverHatchFill': false,
    'selectHatchFill': false
  }
});
