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
    'normal': {
      /**
       * @this {*}
       * @return {*}
       */
      'fill': function() {
        var color;
        if (this['colorScale']) {
          color = this['colorScale']['valueToColor'](this['value']);
        } else {
          color = anychart.color.setOpacity(this['sourceColor'], 0.85, true);
        }
        return color;
      },
      'stroke': '#e0e0e0',
      'hatchFill': false,
      'labels': {
        'enabled': true,
        'hAlign': 'center',
        'vAlign': 'middle',
        'position': 'center',
        'anchor': 'center',
        'fontColor': anychart.core.defaultTheme.fontColorDark,
        'format': anychart.core.defaultTheme.returnNameWithValue
      },
      'markers': {
        'enabled': false,
        'position': 'center',
        'size': 6,
        'fill': '#dd2c00',
        'type': 'circle'
      },
      'headers': {
        'enabled': true,
        'hAlign': 'center',
        'vAlign': 'middle',
        'position': 'center',
        'anchor': 'center',
        'background': {
          'enabled': true,
          'fill': '#F7F7F7',
          'stroke': '#e0e0e0'
        },
        'format': anychart.core.defaultTheme.returnName
      }
    },
    'hovered': {
      'fill': anychart.core.defaultTheme.returnLightenSourceColor,
      'stroke': anychart.core.defaultTheme.returnDarkenSourceColor,
      'hatchFill': false,
      'labels': {
        'enabled': null,
        'fontWeight': 'bold'
      },
      'markers': {
        'enabled': null,
        'size': 8
      },
      'headers': {
        'enabled': true,
        'fontColor': anychart.core.defaultTheme.defaultSelectColor,
        'background': {
          'fill': '#e0e0e0',
          'stroke': '#e0e0e0'
        }
      }
    },
    'selected': {
      'fill': anychart.core.defaultTheme.defaultSelectColor,
      'stroke': anychart.core.defaultTheme.defaultSelectStroke,
      'hatchFill': false,
      'labels': {
        'enabled': null,
        'fontColor': '#fafafa'
      },
      'markers': {
        'enabled': null,
        'size': 8,
        'fill': anychart.core.defaultTheme.defaultSelectColor,
        'stroke': anychart.core.defaultTheme.defaultSelectStroke
      }
    }
  }
});
