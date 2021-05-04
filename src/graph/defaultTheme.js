goog.provide('anychart.graphModule.defaultTheme');


goog.mixin(goog.global['anychart']['themes']['defaultTheme'], {
  'graph': {
    'labels': {
      'enabled': false,
      'fontSize': 8,
      'fontColor': '#7c868e',
      'disablePointerEvents': true,
      'selectable': false,
      'anchor': 'center-top',
      'position': 'center-bottom',
      'padding' : {
        'top' : 0,
        'left' : 0,
        'right' : 0,
        'bottom' : 0
      }
    },
    'padding': 10,
    'tooltip': {
      'displayMode': 'single',
      'positionMode': 'float',
      'separator': {
        'enabled': false
      },
      'title': {
        'enabled': false
      },
      'titleFormat': ''
    },
    'nodes': {
      'width': 12,
      'height': 12,
      'shape': 'circle',
      'tooltip': {
        'format': '{%id}'
      },
      'labels': {
        'format': '{%id}',
        'enabled': false
      },
      'normal': {
        'fill': anychart.core.defaultTheme.returnSourceColor,
        'stroke': anychart.core.defaultTheme.returnDarkenSourceColor
      },
      'hovered': {
        'fill': anychart.core.defaultTheme.returnLightenSourceColor,
        'stroke': anychart.core.defaultTheme.returnSourceColor
      },
      'selected': {
        'fill': anychart.core.defaultTheme.defaultSelectColor,
        'stroke': anychart.core.defaultTheme.defaultSelectStroke
      }
    },
    'edges': {
      'arrows': {
        'enabled': false,
        'size': 10,
        'position': '100%'
      },
      'stroke': anychart.core.defaultTheme.returnLightenSourceColor,
      'hovered': {
        'stroke': anychart.core.defaultTheme.returnDarkenSourceColor
      },
      'selected': {
        'stroke': anychart.core.defaultTheme.defaultSelectColor
      },
      'labels': {
        'enabled': false,
        'format': 'from {%from} to {%to}'
      },
      'tooltip': {
        'format': 'from: {%from}\nto: {%to}'
      }
    },
    'layout': {
      'type': 'forced',
      'iterationCount': 500
    },
    'interactivity': {
      'enabled': true,
      'zoomOnMouseWheel': true,
      'scrollOnMouseWheel': false,
      'nodes': true,
      'edges': true,
      'magnetize': false,
      'hoverGap': 7
    }
  }
});
