goog.provide('anychart.themes.defaultTheme');
var colorStrokeThin = '#EAEAEA';
var colorStrokeNormal = '#CECECE';
var colorStrokeBright = '#c1c1c1';
var colorStrokeExtraBright = '#969EA5';

var colorFillBackground = '#ffffff';
var colorFillExtraThin = '#f5f5f5';
var colorFillBackgroundReversed = '#212121';

var fontColorNormal = '#7c868e';
var fontColorBright = '#545f69';
var fontColorDark = '#212121';

var defaultHoverColor = '#757575';
var defaultSelectSolidColor = '#333';
var defaultSelectColor = '#333 0.85';
var defaultSelectStroke = '1.5 #212121';

var stockScrollerUnselected = '#999 0.6';

var fontColorReversedNormal = '#ffffff';
var opacityThin = ' 0.3';
var opacityStrong = ' 0.7';

var risingColor = '#64b5f6';
var fallingColor = '#ef6c00';


/**
 * @this {*}
 * @return {*}
 */
var returnValue = function() {
  return this['value'];
};


/**
 * @this {*}
 * @return {*}
 */
var returnName = function() {
  return this['name'] || this['getDataValue']('id');
};


/**
 * @this {*}
 * @return {*}
 */
var returnNameWithValue = function() {
  var name = this['name'] || this['getDataValue']('id');
  return name + '\n' + this['value'];
};


/**
 * @this {*}
 * @return {*}
 */
var returnValueWithPrefixPostfix = function() {
  return this['valuePrefix'] + this['value'] + this['valuePostfix'];
};


/**
 * @this {*}
 * @return {*}
 */
var returnX = function() {
  return this['x'];
};


/**
 * @this {*}
 * @return {*}
 */
var returnDateTimeX = function() {
  var date = new Date(this['x']);
  var options = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  };
  return date.toLocaleDateString('en-US', options);
};


/**
 * @this {*}
 * @return {*}
 */
var returnSourceColor = function() {
  return this['sourceColor'];
};


/**
 * @this {*}
 * @return {*}
 */
var returnSourceColor70 = function() {
  return window['anychart']['color']['setOpacity'](this['sourceColor'], 0.7, true);
};


/**
 * @this {*}
 * @return {*}
 */
var returnSourceColor60 = function() {
  return window['anychart']['color']['setOpacity'](this['sourceColor'], 0.65, true);
};


/**
 * @this {*}
 * @return {*}
 */
var returnSourceColor50 = function() {
  return window['anychart']['color']['setOpacity'](this['sourceColor'], 0.50, true);
};


/**
 * @this {*}
 * @return {*}
 */
var returnSourceColor85 = function() {
  return window['anychart']['color']['setOpacity'](this['sourceColor'], 0.85, true);
};


/**
 * @this {*}
 * @return {*}
 */
var returnDarkenSourceColor = function() {
  return window['anychart']['color']['darken'](this['sourceColor']);
};


/**
 * @this {*}
 * @return {*}
 */
var returnLightenSourceColor = function() {
  return window['anychart']['color']['lighten'](this['sourceColor']);
};


/**
 * @this {*}
 * @return {*}
 */
var returnStrokeSourceColor = function() {
  return window['anychart']['color']['setThickness'](this['sourceColor'], 1.5);
};


/**
 * @this {*}
 * @return {*}
 */
var returnLightenStrokeSourceColor = function() {
  return window['anychart']['color']['setThickness'](window['anychart']['color']['lighten'](this['sourceColor']), 1.5);
};


/**
 * @this {*}
 * @return {*}
 */
var returnRangeTooltipContentFormatter = function() {
  return 'High: ' + parseFloat(this['high']).toFixed(2) + '\n' +
      'Low: ' + parseFloat(this['low']).toFixed(2);
};


/**
 * @this {*}
 * @return {*}
 */
var returnRangeLabelsContentFormatter = function() {
  return parseFloat(this['high']).toFixed(2);
};


/**
 * @this {*}
 * @return {*}
 */
var returnStrokeWithThickness = function() {
  return window['anychart']['color']['setThickness'](this['sourceColor'], 1.5);
};


window['anychart'] = window['anychart'] || {};
window['anychart']['themes'] = window['anychart']['themes'] || {};
window['anychart']['themes']['defaultTheme'] = {
  'palette': {
    'type': 'distinct',
    'items': ['#64b5f6', '#1976d2', '#ef6c00', '#ffd54f', '#455a64', '#96a6a6', '#dd2c00', '#00838f', '#00bfa5', '#ffa000']
  },
  'hatchFillPalette': {
    'items': ['backwardDiagonal', 'forwardDiagonal', 'horizontal', 'vertical', 'dashedBackwardDiagonal', 'grid', 'dashedForwardDiagonal', 'dashedHorizontal', 'dashedVertical', 'diagonalCross', 'diagonalBrick', 'divot', 'horizontalBrick', 'verticalBrick', 'checkerBoard', 'confetti', 'plaid', 'solidDiamond', 'zigZag', 'weave', 'percent05', 'percent10', 'percent20', 'percent25', 'percent30', 'percent40', 'percent50', 'percent60', 'percent70', 'percent75', 'percent80', 'percent90']
  },
  'hatchFillPaletteFor3D': {
    'items': ['backwardDiagonal', 'forwardDiagonal', 'dashedBackwardDiagonal', 'grid', 'dashedForwardDiagonal', 'dashedHorizontal', 'dashedVertical', 'diagonalCross', 'diagonalBrick', 'divot', 'horizontalBrick', 'verticalBrick', 'checkerBoard', 'confetti', 'plaid', 'solidDiamond', 'zigZag', 'weave', 'percent05', 'percent10', 'percent20', 'percent25', 'percent30', 'percent40', 'percent50', 'percent60', 'percent70', 'percent75', 'percent80', 'percent90', 'horizontal', 'vertical']
  },
  'markerPalette': {
    'items': ['circle', 'diamond', 'square', 'triangleDown', 'triangleUp', 'diagonalCross', 'pentagon', 'cross', 'line', 'star5', 'star4', 'trapezium', 'star7', 'star6', 'star10']
  },

  'ordinalColor': {
    'autoColors': function(rangesCount) {
      return window['anychart']['color']['blendedHueProgression']('#90caf9', '#01579b', rangesCount);
      //return window['anychart']['color']['blendedHueProgression']('#ffd54f', '#ef6c00', rangesCount); //todo: delete after final choice
    }
  },

  'defaultFontSettings': {
    'fontSize': 13,
    'fontFamily': 'Verdana, Helvetica, Arial, sans-serif',
    'fontColor': fontColorNormal,
    'textDirection': 'ltr',
    'fontOpacity': 1,
    'fontDecoration': 'none',
    'fontStyle': 'normal',
    'fontVariant': 'normal',
    'fontWeight': 'normal',
    'letterSpacing': 'normal',
    'lineHeight': 'normal',
    'textIndent': 0,
    'vAlign': 'top',
    'hAlign': 'start',
    'textWrap': 'byLetter',
    'textOverflow': '',
    'selectable': false,
    'disablePointerEvents': false,
    'useHtml': false
  },

  'defaultBackground': {
    'enabled': false,
    'fill': colorFillBackground,
    'stroke': 'none',
    'cornerType': 'round',
    'corners': 0
  },

  'defaultSeparator': {
    'enabled': false,
    'fill': colorStrokeNormal + opacityThin,
    'width': '100%',
    'height': 1,
    'margin': {'top': 5, 'right': 0, 'bottom': 5, 'left': 0},
    'orientation': 'top',
    'stroke': 'none',
    'zIndex': 1
  },

  'defaultLabelFactory': {
    'enabled': false,
    'offsetX': 0,
    'offsetY': 0,
    'fontSize': 12,
    'minFontSize': 8,
    'maxFontSize': 72,
    'adjustFontSize': {
      'width': false,
      'height': false
    },
    'anchor': 'center',
    'padding': {'top': 4, 'right': 4, 'bottom': 4, 'left': 4},
    'rotation': 0,
    'textFormatter': returnValue,
    'positionFormatter': returnValue
  },

  'defaultMarkerFactory': {
    'anchor': 'center',
    'size': 6,
    'offsetX': 0,
    'offsetY': 0,
    'rotation': 0,
    'positionFormatter': returnValue
  },

  'defaultTitle': {
    'enabled': false,
    'fontSize': 16,
    'text': 'Title text',
    'width': null,
    'height': null,
    'align': 'center',
    'hAlign': 'center',
    'padding': {'top': 0, 'right': 0, 'bottom': 0, 'left': 0},
    'margin': {'top': 0, 'right': 0, 'bottom': 0, 'left': 0}
  },

  'defaultTooltip': {
    'enabled': true,
    'title': {
      'enabled': false,
      'fontColor': fontColorReversedNormal,
      'text': '',
      'fontSize': 14,
      'rotation': 0,
      'width': null,
      'height': null,
      'align': 'left',
      'hAlign': 'left',
      'orientation': 'top',
      'zIndex': 1
    },
    'content': {
      'enabled': true,
      'fontSize': 12,
      'minFontSize': 9,
      'maxFontSize': 13,
      'fontColor': fontColorReversedNormal,
      'hAlign': 'left',
      'text': 'Tooltip Text',
      'width': null,
      'height': null,
      'anchor': 'leftTop',
      'offsetX': 0,
      'offsetY': 0,
      'position': 'leftTop',
      'adjustFontSize': {
        'width': false,
        'height': false
      },
      'padding': {'top': 0, 'right': 0, 'bottom': 0, 'left': 0},
      'rotation': 0,
      'zIndex': 1
    },
    'fontSize': 12,
    'minFontSize': 9,
    'maxFontSize': 13,
    'fontColor': fontColorReversedNormal,
    'hAlign': 'left',
    'text': 'Tooltip Text',
    'width': null,
    'height': null,
    'adjustFontSize': {
      'width': false,
      'height': false
    },
    'background': {
      'enabled': true,
      'fill': colorFillBackgroundReversed + opacityStrong,
      'corners': 3,
      'zIndex': 0
    },
    'offsetX': 10,
    'offsetY': 10,
    'padding': {'top': 5, 'right': 10, 'bottom': 5, 'left': 10},
    'valuePrefix': '',
    'valuePostfix': '',
    'position': 'leftTop',
    'anchor': 'leftTop',
    'hideDelay': 0,
    'titleFormatter': returnValue,
    'textFormatter': returnValueWithPrefixPostfix
  },

  'defaultAxis': {
    'enabled': true,
    'startAngle': 0,
    'drawLastLabel': true,
    'drawFirstLabel': true,
    'staggerMaxLines': 2,
    'staggerMode': false,
    'staggerLines': null,
    'width': null,
    'overlapMode': 'noOverlap',
    'stroke': colorStrokeNormal,
    'title': {
      'padding': {'top': 5, 'right': 5, 'bottom': 5, 'left': 5},
      'enabled': false,
      'fontSize': 13,
      'text': 'Axis title',
      'fontColor': fontColorBright,
      'zIndex': 35
    },
    'labels': {
      'enabled': true,
      'textFormatter': returnValue,
      'positionFormatter': returnValue,
      'zIndex': 35
    },
    'minorLabels': {
      'enabled': false,
      'fontSize': 9,
      'textFormatter': returnValue,
      'positionFormatter': returnValue,
      'zIndex': 35
    },
    'ticks': {
      'enabled': true,
      'length': 6,
      'position': 'outside',
      'stroke': colorStrokeNormal,
      'zIndex': 35
    },
    'minorTicks': {
      'enabled': false,
      'length': 4,
      'position': 'outside',
      'stroke': colorStrokeThin,
      'zIndex': 35
    },
    'zIndex': 35
  },

  'defaultGridSettings': {
    'enabled': true,
    'isMinor': false,
    'drawFirstLine': true,
    'drawLastLine': true,
    'oddFill': 'none',
    'evenFill': 'none',
    'stroke': colorStrokeNormal,
    'scale': 1,
    'zIndex': 11
  },

  'defaultMinorGridSettings': {
    'isMinor': true,
    'stroke': colorStrokeThin,
    'zIndex': 10
  },

  'defaultLineMarkerSettings': {
    'enabled': true,
    'value': 0,
    'layout': null,
    'stroke': {
      'color': '#7c868e',
      'thickness': 2,
      'opacity': 1,
      'dash': '',
      'lineJoin': 'miter',
      'lineCap': 'square'
    },
    'zIndex': 25.2,
    'scale': 1
  },

  'defaultTextMarkerSettings': {
    'enabled': true,
    'fontSize': 12,
    'value': 0,
    'anchor': 'center',
    'align': 'center',
    'layout': null,
    'offsetX': 0,
    'offsetY': 0,
    'text': 'Text marker',
    'width': null,
    'height': null,
    'zIndex': 25.3,
    'scale': 1
  },

  'defaultRangeMarkerSettings': {
    'enabled': true,
    'from': 0,
    'to': 0,
    'layout': null,
    'fill': colorStrokeBright + ' 0.4',
    'zIndex': 25.1,
    'scale': 1
  },

  'defaultLegend': {
    'enabled': false,
    'vAlign': 'bottom',
    'fontSize': 12,
    'itemsLayout': 'horizontal',
    'itemsSpacing': 15,
    'items': null,
    'itemsFormatter': null,
    'itemsTextFormatter': null,
    'itemsSourceMode': 'default',
    'inverted': false,
    'hoverCursor': 'pointer',
    'iconTextSpacing': 5,
    'iconSize': 15,
    'width': null,
    'height': null,
    'position': 'top',
    'align': 'center',
    'padding': {'top': 0, 'right': 10, 'bottom': 10, 'left': 10},
    'margin': {'top': 0, 'right': 0, 'bottom': 0, 'left': 0},
    'title': {'fontSize': 15},
    'paginator': {
      'enabled': true,
      'fontSize': 12,
      'fontColor': fontColorBright,
      'orientation': 'right',
      'layout': 'horizontal',
      'padding': {'top': 0, 'right': 0, 'bottom': 0, 'left': 5},
      'margin': {'top': 0, 'right': 0, 'bottom': 0, 'left': 0},
      'zIndex': 30,
      'buttonsSettings': {
        'normal': {
          'stroke': '#757575',
          'fill': '#9e9e9e'
        },
        'hover': {
          'stroke': '#546e7a',
          'fill': fontColorNormal
        },
        'pushed': {
          'stroke': fontColorNormal,
          'fill': '#9e9e9e'
        },
        'disabled': {
          'stroke': null,
          'fill': '#e0e0e0'
        }
      }
    },
    'titleFormatter': null,
    'tooltip': {
      'enabled': false,
      'allowLeaveScreen': false,
      'title': {'enabled': false}
    },
    'zIndex': 20
  },

  'defaultCrosshairLabel': {
    'x': 0,
    'y': 0,
    'axisIndex': 0,
    'anchor': null,
    'textFormatter': returnValue,
    'enabled': true,
    'fontSize': 12,
    'minFontSize': 8,
    'maxFontSize': 16,
    'fontColor': fontColorReversedNormal,
    'fontWeight': 400,
    'disablePointerEvents': true,
    'text': 'Label text',
    'background': {
      'enabled': true,
      'fill': colorFillBackgroundReversed + opacityStrong,
      'corners': 3,
      'zIndex': 0
    },
    'padding': {'top': 5, 'right': 10, 'bottom': 5, 'left': 10},
    'width': null,
    'height': null,
    'offsetX': 0,
    'offsetY': 0,
    'adjustFontSize': {
      'width': false,
      'height': false
    },
    'rotation': 0
  },

  'defaultColorRange': {
    'enabled': false,
    'stroke': '#B9B9B9',
    'orientation': 'bottom',
    'title': {'enabled': false},
    'colorLineSize': 10,
    'padding': {'top': 10, 'right': 0, 'bottom': 0, 'left': 0},
    'margin': {'top': 0, 'right': 0, 'bottom': 0, 'left': 0},
    'align': 'center',
    'length': '50%',
    'marker': {
      'padding': {'top': 3, 'right': 3, 'bottom': 3, 'left': 3},
      'positionFormatter': returnValue,
      'enabled': true,
      'disablePointerEvents': false,
      'position': 'center',
      'rotation': 0,
      'anchor': 'center',
      'offsetX': 0,
      'offsetY': 0,
      'type': 'triangleDown',
      'fill': defaultSelectColor,
      'stroke': 'none',
      'size': 7
    },
    'labels': {
      'offsetX': 0,
      'offsetY': 0,
      'fontSize': 11,
      'padding': {'top': 0, 'right': 0, 'bottom': 0, 'left': 0}
    },
    'ticks': {
      'stroke': '#B9B9B9', 'position': 'outside', 'length': 5, 'enabled': true
    },
    'minorTicks': {
      'stroke': '#B9B9B9', 'position': 'outside', 'length': 3, 'enabled': false
    }
  },

  'defaultScroller': {
    'enabled': false,
    'fill': '#f7f7f7',
    'selectedFill': '#ddd',
    'outlineStroke': 'none',
    'height': 16,
    'minHeight': null,
    'maxHeight': null,
    'autoHide': false,
    'orientation': 'bottom',
    'position': 'afterAxes',
    'allowRangeChange': true,
    'thumbs': {
      'enabled': true,
      'autoHide': false,
      'fill': '#E9E9E9',
      'stroke': '#7c868e',
      'hoverFill': '#ffffff',
      'hoverStroke': defaultHoverColor
    },
    'inverted': false,
    'zIndex': 35
  },

  'chart': {
    'enabled': true,
    'padding': {'top': 10, 'right': 20, 'bottom': 5, 'left': 10},
    'margin': {'top': 0, 'right': 0, 'bottom': 0, 'left': 0},
    'background': {'enabled': true, 'zIndex': 1},
    'contextMenu': {
      'fromTheme': true, // suppress NO_FEATURE_IN_MODULE warning
      'enabled': true
    },
    'title': {
      'text': 'Chart Title',
      'padding': {'top': 0, 'right': 0, 'bottom': 10, 'left': 0},
      'zIndex': 80,
      'background': {
        'zIndex': 0
      }
    },
    'animation': {
      'enabled': false,
      'duration': 1000
    },
    'interactivity': {
      'hoverMode': 'single',
      'selectionMode': 'multiSelect',
      'spotRadius': 2,
      'allowMultiSeriesSelection': true
    },
    'tooltip': {
      'allowLeaveScreen': false,
      'allowLeaveChart': true,
      'displayMode': 'single',
      'positionMode': 'float',
      'title': {
        'enabled': true
      },
      'separator': {'enabled': true},
      /**
       * @this {*}
       * @return {*}
       */
      'titleFormatter': function() {
        return this['points'][0]['x'];
      },
      /**
       * @this {*}
       * @return {*}
       */
      'textFormatter': function() {
        return this['formattedValues'].join('\n');
      }
    },
    'bounds': {
      'top': null,
      'right': null,
      'bottom': null,
      'left': null,
      'width': null,
      'height': null,
      'minWidth': null,
      'minHeight': null,
      'maxWidth': null,
      'maxHeight': null
    },
    'credits': {
      'enabled': true,
      'text': 'AnyChart',
      'url': 'http://anychart.com',
      'alt': 'AnyChart.com',
      'inChart': false,
      'logoSrc': 'https://static.anychart.com/logo.png'
    },
    'defaultSeriesSettings': {
      'base': {
        'enabled': true,
        'background': {'enabled': true},
        'tooltip': {
          'enabled': true,
          'title': {'enabled': true},
          'separator': {'enabled': true},
          /**
           * @this {*}
           * @return {*}
           */
          'titleFormatter': function() {
            return this['x'];
          },
          /**
           * @this {*}
           * @return {*}
           */
          'textFormatter': function() {
            return this['seriesName'] + ': ' + this['valuePrefix'] + this['value'] + this['valuePostfix'];
          }
        },
        'hatchFill': false,
        'hoverHatchFill': null,
        'selectHatchFill': null,
        'labels': {
          'anchor': 'centerBottom',
          'position': 'centerTop'
        },
        'hoverLabels': {'enabled': null},
        'selectLabels': {'enabled': null},
        'markers': {
          'enabled': false,
          'disablePointerEvents': false,
          'position': 'center',
          'positionFormatter': returnValue,
          'size': 4
        },
        'hoverMarkers': {
          'enabled': null,
          'size': 6
        },
        'selectMarkers': {
          'enabled': null,
          'fill': defaultSelectColor,
          'stroke': defaultSelectStroke,
          'size': 6
        },
        'legendItem': {
          'enabled': true,
          'iconType': 'square'
        },
        'fill': returnSourceColor60,
        'hoverFill': returnSourceColor,
        'selectFill': defaultSelectColor,
        'stroke': returnStrokeSourceColor,
        'hoverStroke': returnLightenStrokeSourceColor,
        'selectStroke': defaultSelectColor,
        'lowStroke': returnStrokeSourceColor,
        'hoverLowStroke': returnLightenStrokeSourceColor,
        'selectLowStroke': defaultSelectColor,
        'highStroke': returnStrokeSourceColor,
        'hoverHighStroke': returnLightenStrokeSourceColor,
        'selectHighStroke': defaultSelectColor,
        'clip': true,
        'color': null,
        'xScale': null,
        'yScale': null,
        'error': {
          'mode': 'both',
          'xError': null,
          'xUpperError': null,
          'xLowerError': null,
          'valueError': null,
          'valueUpperError': null,
          'valueLowerError': null,
          'xErrorWidth': 10,
          'valueErrorWidth': 10,
          'xErrorStroke': returnDarkenSourceColor,
          'valueErrorStroke': returnDarkenSourceColor
        },
        'pointWidth': null,
        'connectMissingPoints': false
      },
      'marker': {
        'fill': returnSourceColor,
        'stroke': returnStrokeWithThickness,
        'hoverFill': returnLightenSourceColor,
        'hoverStroke': returnStrokeWithThickness,
        'selectFill': defaultSelectColor,
        'selectStroke': defaultSelectStroke,
        'size': 4,
        'hoverSize': 6,
        'selectSize': 6,
        'legendItem': {
          'iconStroke': 'none'
        },
        'labels': {
          'anchor': 'bottom',
          'offsetY': 3
        }
      },
      'bubble': {
        'fill': returnSourceColor70,
        'hoverFill': returnSourceColor50,
        'hoverMarkers': {
          'position': 'center'
        },
        'displayNegative': false,
        /**
         * @this {*}
         * @return {*}
         */
        'negativeFill': function() {
          return window['anychart']['color']['darken'](
              window['anychart']['color']['darken'](
                  window['anychart']['color']['darken'](this['sourceColor'])));
        },
        /**
         * @this {*}
         * @return {*}
         */
        'hoverNegativeFill': function() {
          return window['anychart']['color']['darken'](
              window['anychart']['color']['darken'](
                  window['anychart']['color']['darken'](
                      window['anychart']['color']['darken'](this['sourceColor']))));
        },
        /**
         * @this {*}
         * @return {*}
         */
        'selectNegativeFill': function() {
          return window['anychart']['color']['darken'](
              window['anychart']['color']['darken'](
                  window['anychart']['color']['darken'](this['sourceColor'])));
        },
        /**
         * @this {*}
         * @return {*}
         */
        'negativeStroke': function() {
          return window['anychart']['color']['darken'](
              window['anychart']['color']['darken'](
                  window['anychart']['color']['darken'](
                      window['anychart']['color']['darken'](this['sourceColor']))));
        },
        /**
         * @this {*}
         * @return {*}
         */
        'hoverNegativeStroke': function() {
          return window['anychart']['color']['darken'](
              window['anychart']['color']['darken'](
                  window['anychart']['color']['darken'](
                      window['anychart']['color']['darken'](
                          window['anychart']['color']['darken'](this['sourceColor'])))));
        },
        /**
         * @this {*}
         * @return {*}
         */
        'selectNegativeStroke': function() {
          return window['anychart']['color']['darken'](
              window['anychart']['color']['darken'](
                  window['anychart']['color']['darken'](
                      window['anychart']['color']['darken'](this['sourceColor']))));
        },
        'negativeHatchFill': false,
        'hoverNegativeHatchFill': null,
        'selectNegativeHatchFill': null,
        'legendItem': {
          'iconStroke': 'none'
        },
        'labels': {
          'position': 'center',
          'anchor': 'center'
        }
      },
      'areaLike': {
        'fill': returnSourceColor60,
        'hoverFill': returnSourceColor60,
        'markers': {
          'position': 'centerTop'
        },
        'hoverMarkers': {
          'enabled': true
        },
        'selectMarkers': {
          'enabled': true
        },
        'legendItem': {
          'iconStroke': 'none'
        },
        'labels': {
          'anchor': 'leftBottom'
        }
      },
      'barLike': {
        'fill': returnSourceColor85,
        'hoverFill': returnSourceColor60,
        'legendItem': {
          'iconStroke': 'none'
        },
        'labels': {
          'anchor': 'centerBottom',
          'position': 'centerTop'
        }
      },
      'lineLike': {
        'labels': {
          'anchor': 'leftBottom'
        },
        'legendItem': {
          'iconType': 'line'
        },
        'hoverMarkers': {
          'enabled': true
        },
        'selectMarkers': {
          'enabled': true
        }
      },
      'rangeArea': {
        'labels': {
          'textFormatter': returnRangeLabelsContentFormatter
        },
        'tooltip': {
          'titleFormatter': returnX,
          'textFormatter': returnRangeTooltipContentFormatter
        }
      },
      'rangeSplineArea': {
        'labels': {
          'textFormatter': returnRangeLabelsContentFormatter
        },
        'tooltip': {
          'titleFormatter': returnX,
          'textFormatter': returnRangeTooltipContentFormatter
        }
      },
      'rangeStepArea': {
        'labels': {
          'textFormatter': returnRangeLabelsContentFormatter
        },
        'tooltip': {
          'titleFormatter': returnX,
          'textFormatter': returnRangeTooltipContentFormatter
        }
      },
      'candlestick': {
        'risingFill': risingColor,
        'risingStroke': risingColor,
        'hoverRisingFill': returnLightenSourceColor,
        'hoverRisingStroke': returnDarkenSourceColor,
        'fallingFill': fallingColor,
        'fallingStroke': fallingColor,
        'hoverFallingFill': returnLightenSourceColor,
        'hoverFallingStroke': returnDarkenSourceColor,

        'risingHatchFill': false,
        'hoverRisingHatchFill': null,
        'selectRisingHatchFill': null,
        'fallingHatchFill': false,
        'hoverFallingHatchFill': null,
        'selectFallingHatchFill': null,
        'selectFallingFill': defaultSelectColor,
        'selectRisingFill': defaultSelectColor,
        'selectRisingStroke': defaultSelectColor,
        'selectFallingStroke': defaultSelectColor,
        'tooltip': {
          /**
           * @this {*}
           * @return {string}
           */
          'textFormatter': function() {
            return 'O: ' + parseFloat(this['open']).toFixed(4) + '\n' +
                'H: ' + parseFloat(this['high']).toFixed(4) + '\n' +
                'L: ' + parseFloat(this['low']).toFixed(4) + '\n' +
                'C: ' + parseFloat(this['close']).toFixed(4);
          }
        },
        'markers': {
          'position': 'centerTop'
        },
        'labels': {
          'position': 'centerTop',
          'anchor': 'bottom',
          'textFormatter': returnX
        }
      },
      'column': {
        'markers': {
          'position': 'centerTop'
        },
        'hoverMarkers': {
          'position': 'centerTop'
        },
        'labels': {
          'offsetY': 3,
          'anchor': 'centerBottom'
        }
      },
      'rangeColumn': {
        'markers': {
          'position': 'centerTop'
        },
        'hoverMarkers': {
          'position': 'centerTop'
        },
        'labels': {
          'position': 'centerTop',
          'anchor': 'bottom',
          'textFormatter': returnRangeLabelsContentFormatter
        },
        'tooltip': {
          'textFormatter': returnRangeTooltipContentFormatter
        }
      },
      'ohlc': {
        'risingStroke': risingColor,
        'hoverRisingStroke': returnDarkenSourceColor,
        'fallingStroke': fallingColor,
        'hoverFallingStroke': returnDarkenSourceColor,
        'selectRisingStroke': '3 ' + defaultSelectColor,
        'selectFallingStroke': '3 ' + defaultSelectColor,
        'tooltip': {
          /**
           * @this {*}
           * @return {*}
           */
          'textFormatter': function() {
            return 'O: ' + parseFloat(this['open']).toFixed(4) + '\n' +
                'H: ' + parseFloat(this['high']).toFixed(4) + '\n' +
                'L: ' + parseFloat(this['low']).toFixed(4) + '\n' +
                'C: ' + parseFloat(this['close']).toFixed(4);
          }
        },
        'markers': {
          'position': 'centerTop'
        },
        'hoverMarkers': {
          'enabled': null,
          'position': 'centerTop'
        },
        'selectMarkers': {
          'enabled': null,
          'position': 'centerTop'
        },
        'labels': {
          'position': 'centerTop',
          'anchor': 'bottom',
          /**
           * @this {*}
           * @return {*}
           */
          'textFormatter': function() {
            return this['x'];
          }
        }
      }
    },
    'defaultLabelSettings': {
      'enabled': true,
      'text': 'Chart label',
      'width': null,
      'height': null,
      'anchor': 'leftTop',
      'position': 'leftTop',
      'offsetX': 0,
      'offsetY': 0,
      'minFontSize': 8,
      'maxFontSize': 72,
      'adjustFontSize': {
        'width': false,
        'height': false
      },
      'rotation': 0,
      'zIndex': 50
    },
    'chartLabels': [],
    'maxBubbleSize': '20%',
    'minBubbleSize': '5%'
  },

  'cartesianBase': {
    'defaultSeriesSettings': {
      'bar': {
        'markers': {
          'position': 'right'
        },
        'hoverMarkers': {
          'position': 'right'
        },
        'labels': {
          'offsetX': 3,
          'anchor': 'leftCenter',
          'position': 'right'
        }
      },
      'rangeBar': {
        'markers': {
          'position': 'right'
        },
        'hoverMarkers': {
          'position': 'right'
        },
        'labels': {
          'anchor': 'leftCenter',
          'offsetX': 3,
          'textFormatter': returnRangeLabelsContentFormatter,
          'position': 'right'
        },
        'tooltip': {
          'textFormatter': returnRangeTooltipContentFormatter
        }
      },
      'box': {
        'medianStroke': returnDarkenSourceColor,
        'hoverMedianStroke': returnSourceColor,
        'selectMedianStroke': defaultSelectColor,
        'stemStroke': returnDarkenSourceColor,
        'hoverStemStroke': returnSourceColor,
        'selectStemStroke': defaultSelectColor,
        'whiskerStroke': returnDarkenSourceColor,
        'hoverWhiskerStroke': returnDarkenSourceColor,
        'selectWhiskerStroke': defaultSelectColor,
        'whiskerWidth': 0,
        'hoverWhiskerWidth': null,
        'selectWhiskerWidth': null,
        'outlierMarkers': {
          'enabled': true,
          'disablePointerEvents': false,
          'position': 'center',
          'rotation': 0,
          'anchor': 'center',
          'offsetX': 0,
          'offsetY': 0,
          'type': 'circle',
          'size': 3,
          'positionFormatter': returnValue
        },
        'hoverOutlierMarkers': {
          'enabled': null,
          'size': 4
        },
        'selectOutlierMarkers': {
          'enabled': null,
          'size': 4,
          'fill': defaultSelectColor,
          'stroke': defaultSelectStroke
        },
        'tooltip': {
          /**
           * @this {*}
           * @return {*}
           */
          'titleFormatter': function() {
            return this['name'] || this['x'];
          },
          /**
           * @this {*}
           * @return {*}
           */
          'textFormatter': function() {
            return 'Lowest: ' + this['valuePrefix'] + parseFloat(this['lowest']).toFixed(2) + this['valuePostfix'] + '\n' +
                'Q1: ' + this['valuePrefix'] + parseFloat(this['q1']).toFixed(2) + this['valuePostfix'] + '\n' +
                'Median: ' + this['valuePrefix'] + parseFloat(this['median']).toFixed(2) + this['valuePostfix'] + '\n' +
                'Q3: ' + this['valuePrefix'] + parseFloat(this['q3']).toFixed(2) + this['valuePostfix'] + '\n' +
                'Highest: ' + this['valuePrefix'] + parseFloat(this['highest']).toFixed(2) + this['valuePostfix'];
          }
        }
      }
    },
    'defaultXAxisSettings': {
      'orientation': 'bottom',
      'title': {
        'text': 'X-Axis',
        'padding': {'top': 5, 'right': 0, 'bottom': 0, 'left': 0}
      },
      'scale': 0
    },
    'defaultYAxisSettings': {
      'orientation': 'left',
      'title': {
        'text': 'Y-Axis',
        'padding': {'top': 0, 'right': 0, 'bottom': 5, 'left': 0}
      },
      'scale': 1
    },
    'xAxes': [{}],
    'yAxes': [{}],
    'grids': [],
    'minorGrids': [],
    'series': [],
    'lineAxesMarkers': [],
    'rangeAxesMarkers': [],
    'textAxesMarkers': [],
    'xScale': 0,
    'yScale': 1,
    'barsPadding': 0.4,
    'barGroupsPadding': 0.8,
    'maxBubbleSize': '20%',
    'minBubbleSize': '5%',
    'barChartMode': false,
    'scales': [
      {
        'type': 'ordinal',
        'inverted': false,
        'names': [],
        'ticks': {
          'interval': 1
        }
      },
      {
        'type': 'linear',
        'inverted': false,
        'maximum': null,
        'minimum': null,
        'minimumGap': 0.1,
        'maximumGap': 0.1,
        'softMinimum': null,
        'softMaximum': null,
        'ticks': {
          'mode': 'linear',
          'base': 0,
          'minCount': 4,
          'maxCount': 6
        },
        'minorTicks': {
          'mode': 'linear',
          'base': 0,
          'count': 5
        },
        'stackMode': 'none',
        'stickToZero': true
      }
    ],
    'crosshair': {
      'enabled': false,
      'displayMode': 'float',
      'xStroke': colorStrokeExtraBright,
      'yStroke': colorStrokeExtraBright,
      'zIndex': 41
    },
    'xZoom': {
      'continuous': true,
      'startRatio': 0,
      'endRatio': 1
    }
  },

  // merge with defaultCartesian
  'cartesian': {
    'defaultSeriesType': 'line',
    'xAxes': [],
    'yAxes': []
  },

  // merge with cartesian
  'area': {
    'defaultSeriesType': 'area',
    'tooltip': {
      'displayMode': 'union'
    },
    'interactivity': {
      'hoverMode': 'byX'
    }
  },
  'bar': {
    'barChartMode': true,
    'defaultSeriesType': 'bar',
    'defaultGridSettings': {
      'layout': 'vertical'
    },
    'defaultMinorGridSettings': {
      'layout': 'vertical'
    },
    'defaultXAxisSettings': {
      'orientation': 'left'
    },
    'defaultYAxisSettings': {
      'orientation': 'bottom'
    },
    'scales': [
      {
        'type': 'ordinal',
        'inverted': true,
        'names': [],
        'ticks': {
          'interval': 1
        }
      },
      {
        'type': 'linear',
        'inverted': false,
        'maximum': null,
        'minimum': null,
        'minimumGap': 0.1,
        'maximumGap': 0.1,
        'softMinimum': null,
        'softMaximum': null,
        'ticks': {
          'mode': 'linear',
          'base': 0,
          'minCount': 4,
          'maxCount': 6
        },
        'minorTicks': {
          'mode': 'linear',
          'base': 0,
          'count': 5
        },
        'stackMode': 'none',
        'stickToZero': true
      }
    ],
    'tooltip': {
      'displayMode': 'single',
      'position': 'right',
      'anchor': 'left',
      'offsetX': 10,
      'offsetY': 0
    },
    'xScroller': {
      'orientation': 'left'
    }
  },
  'column': {
    'defaultSeriesType': 'column',
    'tooltip': {
      'displayMode': 'single',
      'position': 'centerTop',
      'anchor': 'bottom',
      'offsetX': 0,
      'offsetY': 10
    }
  },
  'line': {
    'defaultSeriesType': 'line',
    'tooltip': {
      'displayMode': 'union'
    },
    'interactivity': {
      'hoverMode': 'byX'
    }
  },
  'box': {
    'defaultSeriesType': 'box'
  },
  'financial': {
    'defaultSeriesType': 'candlestick',
    'defaultSeriesSettings': {
      'candlestick': {
        'tooltip': {
          'titleFormatter': returnDateTimeX
        },
        'labels': {
          'textFormatter': returnDateTimeX
        }
      },
      'ohlc': {
        'tooltip': {
          'titleFormatter': returnDateTimeX
        },
        'labels': {
          'textFormatter': returnDateTimeX
        }
      }
    },
    'xAxes': [
      {
        'labels': {
          /**
           * @this {*}
           * @return {*}
           */
          'textFormatter': function() {
            var date = new Date(this['tickValue']);
            var day = date.getUTCDate();
            var month = date.getUTCMonth();
            var year = date.getUTCFullYear();
            var res = [' ', day, ', ', year].join('');
            switch (month) {
              case 0:
                return 'Jan' + res;
              case 1:
                return 'Feb' + res;
              case 2:
                return 'Mar' + res;
              case 3:
                return 'Apr' + res;
              case 4:
                return 'May' + res;
              case 5:
                return 'Jun' + res;
              case 6:
                return 'Jul' + res;
              case 7:
                return 'Aug' + res;
              case 8:
                return 'Sep' + res;
              case 9:
                return 'Oct' + res;
              case 10:
                return 'Nov' + res;
              case 11:
                return 'Dec' + res;
            }
            return 'Invalid date';
          }
        }
      }
    ],
    'scales': [
      {
        'type': 'dateTime',
        'inverted': false,
        'maximum': null,
        'minimum': null,
        'minimumGap': 0.1,
        'maximumGap': 0.1,
        'softMinimum': null,
        'softMaximum': null,
        'ticks': {
          'count': 4
        },
        'minorTicks': {
          'count': 4
        }
      },
      {
        'type': 'linear',
        'inverted': false,
        'maximum': null,
        'minimum': null,
        'minimumGap': 0.1,
        'maximumGap': 0.1,
        'softMinimum': null,
        'softMaximum': null,
        'ticks': {
          'mode': 'linear',
          'base': 0,
          'minCount': 4,
          'maxCount': 6
        },
        'minorTicks': {
          'mode': 'linear',
          'base': 0,
          'count': 5
        },
        'stackMode': 'none',
        'stickToZero': true
      }
    ]
  },

  // merge with cartesian
  'cartesian3d': {
    'defaultSeriesType': 'column',
    'zAngle': 45,
    'zAspect': '50%',
    'zDistribution': false,
    'zPadding': 10,
    'defaultSeriesSettings': {
      'base': {
        'stroke': 'none',
        'fill': returnSourceColor,
        'hoverStroke': returnSourceColor,
        'hoverFill': returnLightenSourceColor,
        'selectStroke': returnSourceColor,
        'selectFill': defaultSelectSolidColor
      }
    }
  },
  // merge with area
  'bar3d': {
    'defaultSeriesType': 'bar',
    'grids': [
      {},
      {
        'enabled': true,
        'layout': 'horizontal',
        'scale': 0
      }
    ]
  },
  // merge with column
  'column3d': {
    'defaultSeriesType': 'column',
    'grids': [
      {},
      {
        'enabled': true,
        'layout': 'vertical',
        'scale': 0
      }
    ]
  },
  // merge with area
  'area3d': {
    'defaultSeriesType': 'area',
    'zDistribution': true,
    'zPadding': 5,
    'grids': [
      {},
      {
        'enabled': true,
        'layout': 'vertical',
        'scale': 0
      }
    ]
  },

  // merge with chart
  'pieFunnelPyramidBase': {
    'fill': returnSourceColor,
    'stroke': 'none',
    'hoverFill': returnLightenSourceColor,
    'hoverStroke': returnSourceColor,
    'selectFill': defaultSelectColor,
    'selectStroke': defaultSelectStroke,
    'connectorStroke': colorStrokeNormal,
    'overlapMode': 'noOverlap',
    'connectorLength': 20,
    'hatchFill': null,
    'forceHoverLabels': false,
    'labels': {
      'enabled': true,
      'fontColor': null,
      'position': 'inside',
      'disablePointerEvents': false,
      'anchor': 'center',
      'rotation': 0,
      'autoRotate': false,
      'width': null,
      'height': null,
      'zIndex': 34,
      'positionFormatter': returnValue,
      /**
       * @this {*}
       * @return {*}
       */
      'textFormatter': function() {
        return this['name'] ? this['name'] : this['x'];
      }
    },
    'outsideLabels': {'autoColor': fontColorBright},
    'insideLabels': {'autoColor': fontColorReversedNormal},
    'hoverLabels': {
      'enabled': null
    },
    'selectLabels': {
      'enabled': null
    },
    'legend': {
      'enabled': true,
      'padding': {'top': 10, 'right': 10, 'bottom': 0, 'left': 10},
      'position': 'bottom'
    },
    'markers': {
      'enabled': false,
      'position': 'center',
      'positionFormatter': returnValue,
      'zIndex': 33
    },
    'hoverMarkers': {
      'enabled': null
    },
    'selectMarkers': {
      'enabled': null
    },
    'tooltip': {
      'enabled': true,
      'title': {'enabled': true},
      'separator': {'enabled': true},
      /**
       * @this {*}
       * @return {*}
       */
      'titleFormatter': function() {
        return this['name'] || this['x'];
      },
      /**
       * @this {*}
       * @return {*}
       */
      'textFormatter': function() {
        return 'Value: ' + this['value'] + '\nPercent Value: ' + (this['value'] * 100 / this['getStat']('sum')).toFixed(1) + '%';
      }
    },
    'interactivity': {
      'hoverMode': 'single'
    }
  },
  // merge with pieFunnelPyramidBase
  'pie': {
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
    'labels': {
      /**
       * @this {*}
       * @return {*}
       */
      'textFormatter': function() {
        return (this['value'] * 100 / this['getStat']('sum')).toFixed(1) + '%';
      }
    }
  },
  'funnel': {
    'title': {
      'text': 'Funnel Chart'
    },
    'baseWidth': '70%',
    'neckWidth': '30%',
    'neckHeight': '25%',
    'pointsPadding': 0,
    'labels': {
      'position': 'outsideLeftInColumn'
    }
  },
  'pyramid': {
    'title': {
      'text': 'Pyramid Chart'
    },
    'baseWidth': '70%',
    'pointsPadding': 0,
    'legend': {
      'inverted': true
    },
    'labels': {
      'position': 'outsideLeftInColumn'
    },
    'reversed': false
  },

  // merge with pie
  'pie3d': {
    'explode': '5%',
    'connectorLength': '15%',
    //'legend': {
    'legendItem': {
      'iconStroke': null
    }
    //}
  },

  // merge with chart
  'scatter': {
    'defaultSeriesType': 'marker',
    'legend': {
      'enabled': false
    },
    'defaultSeriesSettings': {
      'base': {
        'clip': true,
        'color': null,
        'tooltip': {
          /**
           * @this {*}
           * @return {string}
           */
          'titleFormatter': function() {
            return this['seriesName'];
          },
          /**
           * @this {*}
           * @return {*}
           */
          'textFormatter': function() {
            return 'x: ' + this['x'] + '\ny: ' + this['valuePrefix'] + this['value'] + this['valuePostfix'];
          }
        },
        'xScale': null,
        'yScale': null
      },
      'bubble': {
        'displayNegative': false,
        'negativeFill': returnDarkenSourceColor,
        'hoverNegativeFill': returnDarkenSourceColor,
        'negativeStroke': returnDarkenSourceColor,
        'hoverNegativeStroke': returnDarkenSourceColor,
        'negativeHatchFill': null,
        'hoverNegativeHatchFill': undefined,
        'hatchFill': false,
        'tooltip': {
          /**
           * @this {*}
           * @return {*}
           */
          'textFormatter': function() {
            return 'X: ' + this['x'] + '\nY: ' + this['valuePrefix'] + this['value'] + this['valuePostfix'] + '\nSize: ' + this['size'];
          }
        }
      },
      'line': {
        'connectMissingPoints': false
      },
      'marker': {
        'size': 5,
        'hoverSize': 7,
        'selectSize': 7
      }
    },
    'defaultXAxisSettings': {
      'orientation': 'bottom',
      'scale': 0,
      'title': {
        'text': 'X-Axis'
      }
    },
    'defaultYAxisSettings': {
      'orientation': 'left',
      'scale': 1,
      'title': {
        'text': 'Y-Axis'
      }
    },
    'series': [],
    'grids': [],
    'minorGrids': [],
    'xAxes': [{}],
    'yAxes': [{}],
    'lineAxesMarkers': [],
    'rangeAxesMarkers': [],
    'textAxesMarkers': [],
    'scales': [
      {
        'type': 'linear',
        'inverted': false,
        'maximum': null,
        'minimum': null,
        'minimumGap': 0.1,
        'maximumGap': 0.1,
        'softMinimum': null,
        'softMaximum': null,
        'ticks': {
          'mode': 'linear',
          'base': 0,
          'minCount': 4,
          'maxCount': 6
        },
        'minorTicks': {
          'mode': 'linear',
          'base': 0,
          'count': 5
        },
        'stackMode': 'none',
        'stickToZero': true
      },
      {
        'type': 'linear',
        'inverted': false,
        'maximum': null,
        'minimum': null,
        'minimumGap': 0.1,
        'maximumGap': 0.1,
        'softMinimum': null,
        'softMaximum': null,
        'ticks': {
          'mode': 'linear',
          'base': 0,
          'minCount': 4,
          'maxCount': 6
        },
        'minorTicks': {
          'mode': 'linear',
          'base': 0,
          'count': 5
        },
        'stackMode': 'none',
        'stickToZero': true
      }
    ],
    'xScale': 0,
    'yScale': 1,
    'maxBubbleSize': '20%',
    'minBubbleSize': '5%',
    'crosshair': {
      'enabled': false,
      'displayMode': 'float',
      'xStroke': colorStrokeExtraBright,
      'yStroke': colorStrokeExtraBright,
      'zIndex': 41
    }
  },
  // merge with scatter
  'marker': {},
  'bubble': {},

  // merge with chart
  'radar': {
    'defaultSeriesType': 'line',
    'defaultSeriesSettings': {
      'base': {
        'enabled': true,
        'hatchFill': null
      },
      'area': {},
      'line': {},
      'marker': {}
    },
    //'defaultGridSettings': {
    //  'layout': null//'radial'
    //},
    //'defaultMinorGridSettings': {
    //  'layout': null//'circuit'
    //},
    'xAxis': {
      'scale': 0,
      'zIndex': 25
    },
    'startAngle': 0,
    'grids': [{}, {'layout': 'circuit'}],
    'minorGrids': [],
    'scales': [
      {
        'type': 'ordinal',
        'inverted': false,
        'names': [],
        'ticks': {
          'interval': 1
        }
      },
      {
        'type': 'linear',
        'inverted': false,
        'maximum': null,
        'minimum': null,
        'minimumGap': 0.1,
        'maximumGap': 0.1,
        'softMinimum': null,
        'softMaximum': null,
        'ticks': {
          'mode': 'linear',
          'base': 0,
          'minCount': 4,
          'maxCount': 6
        },
        'minorTicks': {
          'mode': 'linear',
          'base': 0,
          'count': 5
        },
        'stackMode': 'none',
        'stickToZero': true
      }
    ],
    'xScale': 0,
    'yScale': 1
  },
  // merge with chart
  'polar': {
    'defaultSeriesType': 'marker',
    'defaultSeriesSettings': {
      'base': {
        'enabled': true,
        'hatchFill': null,
        'closed': true
      },
      'area': {},
      'line': {},
      'marker': {}
    },
    //'defaultGridSettings': {
    //  'layout': null//'radial'
    //},
    //'defaultMinorGridSettings': {
    //  'layout': null//'circuit'
    //},
    'xAxis': {
      'scale': 0,
      'zIndex': 25
    },
    'startAngle': 0,
    'grids': [{}, {'layout': 'circuit'}],
    'minorGrids': [],
    'scales': [
      {
        'type': 'linear',
        'inverted': false,
        'maximum': null,
        'minimum': null,
        'minimumGap': 0.1,
        'maximumGap': 0.1,
        'softMinimum': null,
        'softMaximum': null,
        'ticks': {
          'mode': 'linear',
          'base': 0,
          'minCount': 4,
          'maxCount': 6
        },
        'minorTicks': {
          'mode': 'linear',
          'base': 0,
          'count': 5
        },
        'stackMode': 'none',
        'stickToZero': true
      },
      {
        'type': 'linear',
        'inverted': false,
        'maximum': null,
        'minimum': null,
        'minimumGap': 0.1,
        'maximumGap': 0.1,
        'softMinimum': null,
        'softMaximum': null,
        'ticks': {
          'mode': 'linear',
          'base': 0,
          'minCount': 4,
          'maxCount': 6
        },
        'minorTicks': {
          'mode': 'linear',
          'base': 0,
          'count': 5
        },
        'stackMode': 'none',
        'stickToZero': true
      }
    ],
    'xScale': 0,
    'yScale': 1
  },

  // merge with chart
  'bullet': {
    'background': {
      'enabled': true
    },
    'layout': 'horizontal',
    'defaultRangeMarkerSettings': {
      'enabled': true,
      'from': 0,
      'to': 0,
      'zIndex': 2
    },
    'padding': {'top': 5, 'right': 10, 'bottom': 5, 'left': 10},
    'margin': {'top': 0, 'right': 0, 'bottom': 0, 'left': 0},
    'defaultMarkerSettings': {
      'fill': '#64b5f6',
      'stroke': '2 #64b5f6',
      'zIndex': 2
    },
    'rangePalette': {
      'type': 'distinct',
      'items': ['#828282', '#a8a8a8', '#c2c2c2', '#d4d4d4', '#e1e1e1']
    },
    'markerPalette': {
      'items': ['bar', 'line', 'x', 'ellipse']
    },
    'axis': {
      'enabled': false,
      'title': {
        'padding': {'top': 0, 'right': 0, 'bottom': 0, 'left': 0},
        'margin': {'top': 0, 'right': 0, 'bottom': 10, 'left': 0}
      },
      'labels': {
        'fontSize': 9,
        'padding': {'top': 0, 'right': 0, 'bottom': 0, 'left': 0}
      },
      'minorLabels': {
        'padding': {'top': 0, 'right': 0, 'bottom': 0, 'left': 0}
      },
      'ticks': {
        'enabled': false
      },
      'orientation': null,
      'zIndex': 3
    },
    'title': {
      'rotation': 0
    },
    'scale': {
      'type': 'linear',
      'ticks': {
        'mode': 'linear',
        'base': 0,
        'explicit': null,
        'minCount': 2,
        'maxCount': 5,
        'interval': NaN
      },
      'minorTicks': {
        'mode': 'linear',
        'base': 0,
        'explicit': null,
        'count': 5,
        'interval': NaN
      },
      'stackMode': 'none',
      'stickToZero': true,
      'minimumGap': 0,
      'maximumGap': 0,
      'softMinimum': null,
      'softMaximum': null,
      'minimum': null,
      'maximum': null,
      'inverted': false
    },
    'ranges': []
  },
  // merge with chart
  'sparkline': {
    'background': {'enabled': true},
    'title': {
      'enabled': false,
      'padding': {'top': 0, 'right': 0, 'bottom': 0, 'left': 0},
      'margin': {'top': 0, 'right': 0, 'bottom': 0, 'left': 0},
      'orientation': 'right',
      'rotation': 0
    },
    'margin': {'top': 0, 'right': 0, 'bottom': 0, 'left': 0},
    'padding': {'top': 0, 'right': 0, 'bottom': 0, 'left': 0},
    'hatchFill': null,
    'markers': {},

    'firstMarkers': {
      'fill': '#64b5f6'
    },
    'lastMarkers': {
      'fill': '#64b5f6'
    },
    'negativeMarkers': {
      'fill': '#ef6c00'
    },
    'minMarkers': {
      'fill': '#455a64'
    },
    'maxMarkers': {
      'fill': '#dd2c00'
    },

    'labels': {},
    'firstLabels': {},
    'lastLabels': {},
    'negativeLabels': {},
    'minLabels': {
      'fontSize': 9,
      'padding': {
        'top': 3,
        'right': 0,
        'bottom': 3,
        'left': 0
      },
      'fontColor': '#303f46'
    },
    'maxLabels': {
      'fontSize': 9,
      'padding': {
        'top': 3,
        'right': 0,
        'bottom': 3,
        'left': 0
      },
      'fontColor': '#9b1f00'
    },

    'lineAxesMarkers': [],
    'rangeAxesMarkers': [],
    'textAxesMarkers': [],
    'scales': [
      {
        'type': 'ordinal',
        'inverted': false,
        'names': [],
        'ticks': {
          'interval': 1
        }
      },
      {
        'type': 'linear',
        'inverted': false,
        'maximum': null,
        'minimum': null,
        'minimumGap': 0.1,
        'maximumGap': 0.1,
        'softMinimum': null,
        'softMaximum': null,
        'ticks': {
          'mode': 'linear',
          'base': 0,
          'minCount': 4,
          'maxCount': 6
        },
        'minorTicks': {
          'mode': 'linear',
          'base': 0,
          'count': 5
        },
        'stackMode': 'none',
        'stickToZero': true
      }
    ],
    'xScale': 0,
    'yScale': 1,
    'clip': true,
    'seriesType': 'line',
    'connectMissingPoints': false,
    'pointWidth': '95%',

    'tooltip': {
      'title': false,
      'separator': false,
      /**
       * @this {*}
       * @return {*}
       */
      'titleFormatter': function() {
        return this['x'];
      },
      /**
       * @this {*}
       * @return {*}
       */
      'textFormatter': function() {
        return 'x: ' + this['x'] + '\ny: ' + this['value'];
      }
    },

    'defaultSeriesSettings': {
      'base': {
        'markers': {
          'enabled': false,
          'position': 'center',
          'anchor': 'center',
          'type': 'circle',
          'size': 1.8,
          'stroke': 'none'
        },
        'hoverMarkers': {
          'enabled': true
        },
        'labels': {
          'enabled': false,
          'fontSize': 8,
          'background': {
            'enabled': false
          },
          'position': 'center',
          'anchor': 'centerBottom'
        },
        'minLabels': {
          'position': 'bottom',
          'anchor': 'centerBottom'
        },
        'maxLabels': {
          'position': 'centerTop',
          'anchor': 'topCenter'
        },
        'color': '#64b5f6'
      },
      'area': {
        'stroke': '#64b5f6',
        'fill': '#64b5f6 0.5'
      },
      'column': {
        'markers': {
          'position': 'centerTop'
        },
        'labels': {
          'position': 'centerTop',
          'anchor': 'centerBottom'
        },
        'negativeMarkers': {
          'position': 'centerBottom'
        },
        'negativeLabels': {
          'position': 'centerBottom',
          'anchor': 'centerTop'
        },
        'fill': '#64b5f6',
        'negativeFill': '#ef6c00'
      },
      'line': {
        'stroke': '#64b5f6'
      },
      'winLoss': {
        'markers': {
          'position': 'centerTop',
          'anchor': 'centerTop'
        },
        'labels': {
          'position': 'centerTop',
          'anchor': 'centerTop'
        },
        'negativeMarkers': {
          'position': 'centerBottom',
          'anchor': 'centerBottom'
        },
        'negativeLabels': {
          'position': 'centerBottom',
          'anchor': 'centerBottom'
        },
        'fill': '#64b5f6',
        'negativeFill': '#ef6c00'
      }
    }
  },

  // merge with chart
  'map': {
    'defaultSeriesSettings': {
      'base': {
        /**
         * @this {*}
         * @return {*}
         */
        'fill': function() {
          var color;
          if (this['colorScale']) {
            var refVale = this['referenceValueNames'][1];
            var value = this['iterator']['get'](refVale);
            color = this['colorScale']['valueToColor'](value);
          } else {
            color = this['sourceColor'];
          }
          return color;
        },
        'hoverFill': defaultHoverColor,
        'selectFill': defaultSelectColor,
        'stroke': returnDarkenSourceColor,
        'hoverStroke': {'thickness': 0.5, 'color': '#545f69'},
        'selectStroke': {'thickness': 0.5, 'color': '#545f69'},
        'hatchFill': false,
        'labels': {
          'enabled': false,
          'adjustFontSize': {
            'width': true,
            'height': true
          },
          /**
           * @this {*}
           * @return {*}
           */
          'textFormatter': function() {
            if (this['getDataValue']('name')) {
              return this['getDataValue']('name');
            } else if (this['name']) {
              return this['name'];
            } else if (this['getDataValue']('id')) {
              return this['getDataValue']('id');
            } else {
              return 'lat: ' + this['lat'] + '\nlong: ' + this['long'];
            }
          }
        },
        'hoverLabels': {
          'enabled': null
        },
        'selectLabels': {
          'enabled': null
        },
        'markers': {
          'enabled': false,
          'disablePointerEvents': false
        },
        'hoverMarkers': {'enabled': null},
        'selectMarkers': {'enabled': null},
        'color': null,
        'allowPointsSelect': null,
        'tooltip': {
          /**
           * @this {*}
           * @return {*}
           */
          'titleFormatter': function() {
            return this['name'] || this['getDataValue']('name') || 'Tooltip title';
          },
          /**
           * @this {*}
           * @return {*}
           */
          'textFormatter': function() {
            return 'Id: ' + this['id'] + '\nValue: ' + this['valuePrefix'] + this['value'] + this['valuePostfix'];
          }
        },
        'xScale': null,
        'yScale': null
      },
      'choropleth': {
        'labels': {
          'fontColor': fontColorDark
        }
      },
      'connector': {
        'startSize': 0,
        'endSize': 0,
        'hoverStroke': '1.5 #455a64',
        'stroke': '1.5 #1976d2',
        'curvature': .3,
        'markers': {
          'position': 'middle',
          'enabled': true,
          'size': 15,
          'fill': '#455a64',
          'stroke': '1.5 #f7f7f7',
          'rotation': null,
          'type': 'arrowhead'
        },
        'hoverMarkers': {
          'fill': '#1976d2'
        },
        'labels': {
          'enabled': false,
          'position': 'middle',
          /**
           * @this {*}
           * @return {*}
           */
          'textFormatter': function() {
            return 'from: ' + this['startPoint']['lat'] + ',' + this['startPoint']['long'] + '\nto: ' + this['endPoint']['lat'] + ',' + this['endPoint']['long'];
          }
        },
        'tooltip': {
          'title': {
            'enabled': false
          },
          'separator': {
            'enabled': false
          },
          /**
           * @this {*}
           * @return {*}
           */
          'textFormatter': function() {
            return 'from: ' + this['startPoint']['lat'] + ', ' + this['startPoint']['long'] + '\nto: ' + this['endPoint']['lat'] + ', ' + this['endPoint']['long'];
          }
        }
      },
      'bubble': {
        'hoverFill': defaultHoverColor,
        'selectFill': defaultSelectColor,
        'tooltip': {
          /**
           * @this {*}
           * @return {*}
           */
          'textFormatter': function() {
            return 'Id: ' + this['id'] + '\nValue: ' + this['valuePrefix'] + this['size'] + this['valuePostfix'];
          }
        }
      },
      'marker': {
        'labels': {
          'enabled': true
        },
        'hoverLabels': {
          'fontWeight': 'bold'
        },
        'selectLabels': {
          'fontWeight': 'bold'
        },
        'tooltip': {
          /**
           * @this {*}
           * @return {*}
           */
          'textFormatter': function() {
            var result;
            if (this['id']) {
              result = 'Id: ' + this['id'];
            } else {
              result = 'lat: ' + this['lat'] + '\nlong: ' + this['long'];
            }
            if (this['value'])
              result += '\nValue: ' + this['valuePrefix'] + this['value'] + this['valuePostfix'];
            return result;
          }
        }
      }
    },
    'colorRange': {
      'zIndex': 50
    },
    'unboundRegions': {'enabled': true, 'fill': '#F7F7F7', 'stroke': '#e0e0e0'},
    'linearColor': {'colors': ['#90caf9', '#01579b']},
    //'linearColor': {'colors': ['#ffd54f', '#ef6c00']}, //todo: delete after final choice
    'legend': {'enabled': false},
    'maxBubbleSize': '20%',
    'minBubbleSize': '5%',
    'geoIdField': 'id',
    'interactivity': {
      'copyFormatter': function() {
        var ths = arguments[0];
        var seriesStatus = ths['seriesStatus'];
        var result = '';
        for (var i = 0, len = seriesStatus.length; i < len; i++) {
          var status = seriesStatus[i];
          if (status['points'].length == 0) continue;
          result += 'Series ' + status['series'].index() + ':\n';
          for (var j = 0, len_ = status['points'].length; j < len_; j++) {
            var point = status['points'][j];
            result += 'id: ' + point['id'] + ' index: ' + point['index'];
            if (j != len_ - 1) result += '\n';
          }
          if (i != len - 1) result += '\n';
        }
        return result || 'no selected points';
      },
      'drag': true,
      'mouseWheel': true
    },
    'crsAnimation': {
      'enabled': true,
      'duration': 300
    }
  },
  // merge with map
  'choropleth': {},
  // merge with map
  'bubbleMap': {},
  // merge with map
  'markerMap': {},
  // merge with map
  'connector': {},

  // merge with chart
  'circularGauge': {
    'title': {
      'enabled': false
    },
    'defaultAxisSettings': {
      'startAngle': null,
      'labels': {'position': 'inside', 'adjustFontSize': true},
      'minorLabels': {'position': 'inside', 'adjustFontSize': true},
      'fill': colorStrokeNormal,
      'ticks': {
        'hatchFill': false,
        'type': 'line',
        'position': 'center',
        'length': null,
        'fill': fontColorBright,
        'stroke': 'none'
      },
      'minorTicks': {
        'hatchFill': false,
        'type': 'line',
        'position': 'center',
        'length': null,
        'fill': fontColorBright,
        'stroke': 'none'
      },
      'zIndex': 10
    },
    'defaultPointerSettings': {
      'base': {
        'enabled': true,
        'fill': fontColorBright,
        'stroke': fontColorBright,
        'hatchFill': false,
        'axisIndex': 0
      },
      'bar': {
        'position': 'center'
      },
      'marker': {
        'size': 4,
        'hoverSize': 6,
        'selectSize': 6,
        'position': 'inside',
        'type': 'triangleUp'
      },
      'knob': {
        'fill': colorStrokeNormal,
        'stroke': colorStrokeBright,
        'verticesCount': 6,
        'verticesCurvature': .5,
        'topRatio': .5,
        'bottomRatio': .5
      }
    },
    'defaultRangeSettings': {
      'enabled': true,
      'axisIndex': 0,
      'fill': fontColorNormal + opacityStrong,
      'position': 'center',
      'startSize': 0,
      'endSize': '10%'
    },
    'fill': colorFillExtraThin,
    'stroke': colorStrokeThin,
    'startAngle': 0,
    'sweepAngle': 360,
    'cap': {
      'enabled': false,
      'fill': colorStrokeThin,
      'stroke': colorStrokeNormal,
      'hatchFill': false,
      'radius': '15%',
      'zIndex': 50
    },
    'circularPadding': '10%',
    'encloseWithStraightLine': false,
    'axes': [],
    'bars': [],
    'markers': [],
    'needles': [],
    'knobs': [],
    'ranges': [],
    'tooltip': {
      'title': {'enabled': false},
      'separator': {'enabled': false},
      /**
       * @this {*}
       * @return {*}
       */
      'titleFormatter': function() {
        return this['index'];
      },
      /**
       * @this {*}
       * @return {*}
       */
      'textFormatter': function() {
        return 'Value: ' + this['value'];
      }
    }
  },

  // merge with chart
  'heatMap': {
    'scales': [
      {
        'type': 'ordinal',
        'inverted': false,
        'names': [],
        'ticks': {
          'interval': 1
        }
      },
      {
        'type': 'ordinal',
        'inverted': true,
        'names': [],
        'ticks': {
          'interval': 1
        }
      },
      {
        'type': 'ordinalColor'
      }
    ],
    'xScale': 0,
    'yScale': 1,
    'colorScale': 2,
    'background': {
      'enabled': true
    },
    'xAxes': [{
      'orientation': 'top'
    }],
    'yAxes': [{}],
    'grids': [],
    'tooltip': {
      'enabled': true,
      'title': {
        'enabled': true,
        'fontSize': 13,
        'fontWeight': 'normal'
      },
      'content': {'fontSize': 11},
      'separator': {'enabled': true},
      /**
       * @this {*}
       * @return {*}
       */
      'titleFormatter': function() {
        return this['name'] || this['x'];
      },
      /**
       * @this {*}
       * @return {*}
       */
      'textFormatter': function() {
        if (this['heat'] === undefined) {
          var value = 'Value: ' + this['valuePrefix'] + this['heat'] + this['valuePostfix'];
          if (!isNaN(+this['heat']))
            value += '\n' + 'Percent Value: ' + (this['heat'] * 100 / this['getStat']('sum')).toFixed(1) + '%';
          return value;
        } else {
          return 'x: ' + this['x'] + '\ny: ' + this['y'];
        }
      }
    },
    'legendItem': {
      'iconStroke': null
    },
    'legend': {
      'itemsSourceMode': 'categories'
    },
    'defaultXAxisSettings': {
      'enabled': true,
      'orientation': 'bottom',
      'ticks': {'enabled': false},
      'title': {
        'text': 'X-Axis'
      }
    },
    'defaultYAxisSettings': {
      'enabled': true,
      'orientation': 'left',
      'ticks': {'enabled': false},
      'title': {
        'text': 'Y-Axis'
      }
    },
    /**
     * @this {*}
     * @return {*}
     */
    'fill': function() {
      var color;
      if (this['colorScale']) {
        var value = this['iterator']['get']('heat');
        color = this['colorScale']['valueToColor'](value);
      } else {
        color = window['anychart']['color']['setOpacity'](this['sourceColor'], 0.85, true);
      }
      return color;
    },
    'stroke': '1 #ffffff',
    'hoverStroke': '1.5 #ffffff',
    'hoverFill': defaultHoverColor,
    'selectStroke': '2 #ffffff',
    'selectFill': defaultSelectColor,
    'labels': {
      'enabled': true,
      'fontSize': 11,
      'adjustFontSize': {
        'width': true,
        'height': true
      },
      'minFontSize': 7,
      'maxFontSize': 13,
      'hAlign': 'center',
      'vAlign': 'center',
      'textWrap': 'noWrap',
      'fontWeight': 'normal',
      'fontColor': '#212121',
      'selectable': false,
      'background': {
        'enabled': false
      },
      'padding': {
        'top': 2,
        'right': 4,
        'bottom': 2,
        'left': 4
      },
      'position': 'center',
      'anchor': 'center',
      'offsetX': 0,
      'offsetY': 0,
      'rotation': 0,
      'width': null,
      'height': null,
      /**
       * @this {*}
       * @return {*}
       */
      'textFormatter': function() {
        return this['heat'];
      },
      'positionFormatter': returnValue
    },
    'hoverLabels': {
      'fontColor': '#f5f5f5',
      'enabled': null
    },
    'selectLabels': {
      'fontColor': '#fff',
      'enabled': null
    },
    'markers': {
      'enabled': false,
      'disablePointerEvents': false,
      'position': 'center',
      'rotation': 0,
      'anchor': 'center',
      'offsetX': 0,
      'offsetY': 0,
      'size': 4,
      'positionFormatter': returnValue
    },
    'hoverMarkers': {
      'enabled': null
    },
    'selectMarkers': {
      'enabled': null
    },
    'labelsDisplayMode': 'drop',
    'hatchFill': false,
    'clip': true,
    'xZoom': {
      'continuous': true,
      'startRatio': 0,
      'endRatio': 1
    },
    'yZoom': {
      'continuous': true,
      'startRatio': 0,
      'endRatio': 1
    },
    'yScroller': {
      'orientation': 'right',
      'inverted': true
    }
  },

  'treeMap': {
    'sort': 'desc',
    'labelsDisplayMode': 'clip',
    'headersDisplayMode': 'alwaysShow',
    'colorRange': {
      'zIndex': 50
    },
    'colorScale': {
      'type': 'ordinalColor'
    },
    'tooltip': {
      'enabled': true,
      'titleFormatter': returnName,
      'textFormatter': returnValue
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
      'vAlign': 'center',
      'position': 'leftTop',
      'anchor': 'leftTop',
      'rotation': 0,
      'background': {
        'enabled': true,
        'fill': '#F7F7F7',
        'stroke': '#e0e0e0'
      },
      'textFormatter': returnName
    },
    'hoverHeaders': {
      'enabled': true,
      'fontColor': defaultSelectColor,
      'background': {
        'fill': '#e0e0e0',
        'stroke': '#e0e0e0'
      }
    },
    'labels': {
      'enabled': true,
      'hAlign': 'center',
      'vAlign': 'center',
      'position': 'leftTop',
      'anchor': 'leftTop',
      'rotation': 0,
      'fontColor': fontColorDark,
      'textFormatter': returnNameWithValue
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
      'size': 6
    },
    'hoverMarkers': {
      'enabled': null,
      'size': 8
    },
    'selectMarkers': {
      'enabled': null,
      'size': 8
    },
    /**
     * @this {*}
     * @return {*}
     */
    'fill': function() {
      var color;
      if (this['colorScale']) {
        color = this['colorScale']['valueToColor'](this['value']);
      } else {
        color = window['anychart']['color']['setOpacity'](this['sourceColor'], 0.85, true);
      }
      return color;
    },
    'stroke': '#e0e0e0',
    'hoverFill': returnLightenSourceColor,
    'hoverStroke': returnDarkenSourceColor,
    'selectFill': defaultSelectColor,
    'selectStroke': defaultSelectStroke,
    'hatchFill': false,
    'hoverHatchFill': false,
    'selectHatchFill': false
  },

  'defaultDataGrid': {
    'isStandalone': true,
    'headerHeight': 25,
    'backgroundFill': '#fff',
    'columnStroke': '#cecece',
    'rowStroke': '#cecece',
    'rowOddFill': '#fff',
    'rowEvenFill': '#fff',
    'rowFill': '#fff',
    'hoverFill': '#F8FAFB',
    'rowSelectedFill': '#ebf1f4',
    'zIndex': 5,
    'editing': false,
    'editStructurePreviewFill': {
      'color': '#4285F4',
      'opacity': 0.2
    },
    'editStructurePreviewStroke': {
      'color': '#4285F4',
      'thickness': 2
    },
    'editStructurePreviewDashStroke': {
      'color': '#4285F4',
      'dash': '4 4'
    },
    'headerFill': '#f7f7f7',
    'tooltip': {
      'padding': {'top': 5, 'right': 5, 'bottom': 5, 'left': 5},
      'title': {
        'enabled': true,
        'fontSize': '14px',
        'fontWeight': 'normal',
        'fontColor': '#e5e5e5'
      },
      'separator': {
        'enabled': true
      },
      'anchor': 'leftTop',
      'content': {
        'hAlign': 'left'
      },
      /**
       * @this {*}
       * @return {string}
       */
      'textFormatter': function() {
        var name = this['name'];
        return (name !== void 0) ? name + '' : '';
      }
    },
    'defaultColumnSettings': {
      'width': 90,
      //'defaultWidth': undefined,
      'cellTextSettings': {
        'enabled': true,
        'anchor': 'leftTop',
        'vAlign': 'middle',
        'padding': {
          'top': 0,
          'right': 5,
          'bottom': 0,
          'left': 5
        },
        'textWrap': 'noWrap',
        'background': null,
        'rotation': 0,
        'width': null,
        'height': null,
        'fontSize': 11,
        'minFontSize': 8,
        'maxFontSize': 72,
        'disablePointerEvents': true
      },
      'depthPaddingMultiplier': 0,
      'collapseExpandButtons': false,
      'title': {
        'enabled': true,
        'margin': {
          'top': 0,
          'right': 0,
          'bottom': 0,
          'left': 0
        },
        'textWrap': 'noWrap',
        'hAlign': 'center',
        'vAlign': 'middle',
        'background': {
          'enabled': false
        }
      },
      /**
       * @this {*}
       * @return {string}
       */
      'textFormatter': function() {
        return '';
      }
    },
    'columns': [
      {
        'width': 50,
        /**
         * @this {*}
         * @return {string}
         */
        'textFormatter': function() {
          var val = this['item']['meta']('index');
          return (val != null) ? (val + 1) + '' : '';
        },
        'title': {
          'text': '#'
        }
      },
      {
        'width': 170,
        'collapseExpandButtons': true,
        'depthPaddingMultiplier': 15,
        /**
         * @this {*}
         * @return {string}
         */
        'textFormatter': function() {
          var val = this['name'];
          return (val != null) ? (val + '') : '';
        },
        'title': {
          'text': 'Name'
        }
      }
    ]
  },

  // merge with chart
  'ganttBase': {
    'splitterPosition': '30%',
    'headerHeight': 70,
    'hoverFill': '#F8FAFB',
    'rowSelectedFill': '#ebf1f4',
    'rowStroke': '#cecece',
    'editing': false,
    'title': {
      'enabled': false
    },
    'legend': {
      'enabled': false
    },
    'credits': {
      'inChart': true
    },
    'background': {
      'fill': '#fff'
    },
    'margin': {
      'top': 0,
      'right': 0,
      'bottom': 0,
      'left': 0
    },
    'padding': {
      'top': 0,
      'right': 0,
      'bottom': 0,
      'left': 0
    },
    'dataGrid': {
      'isStandalone': false,
      'backgroundFill': 'none'
    },
    'timeline': {
      'columnStroke': '#cecece',
      'rowStroke': '#cecece',
      'backgroundFill': 'none',
      'rowOddFill': '#fff',
      'rowEvenFill': '#fff',
      'rowFill': '#fff',

      'hoverFill': '#F8FAFB',
      'rowSelectedFill': '#ebf1f4',

      'zIndex': 5,
      'headerHeight': 70,
      'editing': false,

      'connectorPreviewStroke': {
        'color': '#545f69',
        'dash': '3 3'
      },

      'editPreviewFill': {
        'color': '#fff',
        'opacity': 0.00001
      },

      'editPreviewStroke': {
        'color': '#aaa',
        'dash': '3 3'
      },

      'editProgressFill': '#EAEAEA',
      'editProgressStroke': '#545f69',
      'editIntervalThumbFill': '#EAEAEA',
      'editIntervalThumbStroke': '#545f69',
      'editConnectorThumbFill': '#EAEAEA',
      'editConnectorThumbStroke': '#545f69',

      'editStructurePreviewFill': {
        'color': '#4285F4',
        'opacity': 0.2
      },

      'editStructurePreviewStroke': {
        'color': '#4285F4',
        'thickness': 2
      },

      'editStructurePreviewDashStroke': {
        'color': '#4285F4',
        'dash': '4 4'
      },

      'baseFill': '#7ec1f5',
      'baseStroke': '#74b2e2',
      'progressFill': '#1976d2',
      'progressStroke': {
        'color': '#fff',
        'opacity': 0.00001
      },

      'baselineFill': '#d5ebfc',
      'baselineStroke': '#bfd1e0',
      'parentFill': '#455a64',
      'parentStroke': '#2f3f46',
      'milestoneFill': '#ffa000',
      'milestoneStroke': '#d26104',
      'connectorFill': '#545f69',
      'connectorStroke': '#545f69',
      'selectedElementFill': '#ef6c00',
      'selectedElementStroke': '#bc5704',
      'selectedConnectorStroke': '2 #bc5704',
      'minimumGap': 0.1,
      'maximumGap': 0.1,
      'baselineAbove': false,
      'tooltip': {
        'padding': {'top': 5, 'right': 5, 'bottom': 5, 'left': 5},
        'title': {
          'enabled': true,
          'fontSize': '14px',
          'fontWeight': 'normal',
          'fontColor': '#e5e5e5'
        },
        'separator': {
          'enabled': true
        },
        'anchor': 'leftTop',
        'content': {
          'hAlign': 'left'
        }
      },
      'labels': {
        'enabled': true,
        'anchor': 'leftCenter',
        'position': 'rightCenter',
        'padding': {
          'top': 3,
          'right': 5,
          'bottom': 3,
          'left': 5
        },
        'vAlign': 'middle',
        'textWrap': 'noWrap',
        'background': null,
        'rotation': 0,
        'width': null,
        'height': null,
        'fontSize': 11,
        'minFontSize': 8,
        'maxFontSize': 72,
        'zIndex': 40,
        'disablePointerEvents': true
      },
      'markers': {
        'anchor': 'centerTop',
        'zIndex': 50,
        'type': 'star5',
        'fill': '#ff0',
        'stroke': '2 red'
      },
      'defaultLineMarkerSettings': {
        'layout': 'vertical',
        'zIndex': 1.5
      },
      'defaultRangeMarkerSettings': {
        'layout': 'vertical',
        'zIndex': 1
      },
      'defaultTextMarkerSettings': {
        'layout': 'vertical',
        'zIndex': 2,
        'textWrap': 'byLetter'
      },
      'header': {
        'labelsFactory': {
          'enabled': true,
          'anchor': 'leftTop',
          'vAlign': 'middle',
          'padding': {
            'top': 0,
            'right': 5,
            'bottom': 0,
            'left': 5
          },
          'textWrap': 'noWrap',
          'background': null,
          'rotation': 0,
          'width': null,
          'height': null,
          'fontSize': 11,
          'minFontSize': 8,
          'maxFontSize': 72,
          'disablePointerEvents': true
        }

      }
    }
  },

  'ganttResource': {
    'dataGrid': {
      'tooltip': {
        /**
         * @this {*}
         * @return {string}
         */
        'titleFormatter': function() {
          return this['name'] || '';
        },
        /**
         * @this {*}
         * @return {string}
         */
        'textFormatter': function() {
          var startDate = this['minPeriodDate'];
          var endDate = this['maxPeriodDate'];
          return (startDate ? 'Start Date: ' + window['anychart']['format']['dateTime'](startDate) : '') +
              (endDate ? '\nEnd Date: ' + window['anychart']['format']['dateTime'](endDate) : '');
        }
      }
    },
    'timeline': {
      'tooltip': {
        /**
         * @this {*}
         * @return {string}
         */
        'titleFormatter': function() {
          return this['name'] || '';
        },
        /**
         * @this {*}
         * @return {string}
         */
        'textFormatter': function() {
          var startDate = this['periodStart'] || this['minPeriodDate'];
          var endDate = this['periodEnd'] || this['maxPeriodDate'];
          return (startDate ? 'Start Date: ' + window['anychart']['format']['dateTime'](startDate) : '') +
              (endDate ? '\nEnd Date: ' + window['anychart']['format']['dateTime'](endDate) : '');
        }
      }
    }
  },
  'ganttProject': {
    'dataGrid': {
      'tooltip': {
        /**
         * @this {*}
         * @return {string}
         */
        'titleFormatter': function() {
          return this['name'] || '';
        },
        /**
         * @this {*}
         * @return {string}
         */
        'textFormatter': function() {
          var startDate = this['actualStart'] || this['autoStart'];
          var endDate = this['actualEnd'] || this['autoEnd'];
          var progress = this['progressValue'];

          if (progress === void 0) {
            var auto = this['autoProgress'] * 100;
            progress = (Math.round(auto * 100) / 100 || 0) + '%';
          }

          return (startDate ? 'Start Date: ' + window['anychart']['format']['dateTime'](startDate) : '') +
              (endDate ? '\nEnd Date: ' + window['anychart']['format']['dateTime'](endDate) : '') +
              (progress ? '\nComplete: ' + progress : '');
        }
      }
    },
    'timeline': {
      'tooltip': {
        /**
         * @this {*}
         * @return {string}
         */
        'titleFormatter': function() {
          return this['name'] || '';
        },
        /**
         * @this {*}
         * @return {string}
         */
        'textFormatter': function() {
          var startDate = this['actualStart'] || this['autoStart'];
          var endDate = this['actualEnd'] || this['autoEnd'];
          var progress = this['progressValue'];

          if (progress === void 0) {
            var auto = this['autoProgress'] * 100;
            progress = (Math.round(auto * 100) / 100 || 0) + '%';
          }

          return (startDate ? 'Start Date: ' + window['anychart']['format']['dateTime'](startDate) : '') +
              (endDate ? '\nEnd Date: ' + window['anychart']['format']['dateTime'](endDate) : '') +
              (progress ? '\nComplete: ' + progress : '');

        }
      }
    }
  },

  'stock': {
    'defaultPlotSettings': {
      'background': {
        'enabled': false
      },
      'defaultSeriesSettings': {
        'base': {
          'pointWidth': '75%',
          'tooltip': {
            /**
             * @this {*}
             * @return {*}
             */
            'textFormatter': function() {
              var val = this['value'];
              if (val === undefined) val = this['close'];
              val = parseFloat(val).toFixed(4);
              return this['seriesName'] + (isNaN(val) ? '' : (': ' + this['valuePrefix'] + val + this['valuePostfix']));
            }
          },
          'legendItem': {'iconStroke': 'none'}
        },
        'column': {
          'stroke': 'none'
        },
        'rangeColumn': {
          'stroke': 'none'
        }
      },
      'defaultGridSettings': {
        'scale': 0
      },
      'defaultMinorGridSettings': {
        'scale': 0
      },
      'defaultYAxisSettings': {
        'enabled': true,
        'orientation': 'left',
        'title': {
          'enabled': false,
          'text': 'Y-Axis'
        },
        'staggerMode': false,
        'staggerLines': null,
        'ticks': {
          'enabled': true
        },
        'width': 50,
        'labels': {
          'fontSize': '11px',
          'padding': {
            'top': 0,
            'right': 5,
            'bottom': 0,
            'left': 5
          }
        },
        'minorLabels': {
          'fontSize': '11px',
          'padding': {
            'top': 0,
            'right': 5,
            'bottom': 0,
            'left': 5
          }
        },
        'scale': 0
      },
      'xAxis': {
        'enabled': true,
        'orientation': 'bottom',
        'background': {
          'stroke': '#cecece',
          'fill': '#F7F7F7'
        },
        'height': 25,
        'scale': 0,
        'ticks': {
          'enabled': false
        },
        'labels': {
          'enabled': true,
          'fontSize': '11px',
          'padding': {
            'top': 5,
            'right': 5,
            'bottom': 5,
            'left': 5
          },
          'anchor': 'centerTop',
          /**
           * @this {*}
           * @return {string}
           */
          'textFormatter': function() {
            var date = this['tickValue'];
            switch (this['majorIntervalUnit']) {
              case 'year':
                return window['anychart']['format']['dateTime'](date, 'yyyy');
              case 'semester':
              case 'quarter':
              case 'month':
                return window['anychart']['format']['dateTime'](date, 'yyyy MMM');
              case 'thirdOfMonth':
              case 'week':
              case 'day':
                return window['anychart']['format']['dateTime'](date, 'MMM dd');
              case 'hour':
                return window['anychart']['format']['dateTime'](date, 'MMM-dd HH');
              case 'minute':
                return window['anychart']['format']['dateTime'](date, 'dd HH:mm');
              case 'second':
                return window['anychart']['format']['dateTime'](date, 'HH:mm:ss');
              case 'millisecond':
                return window['anychart']['format']['dateTime'](date, 'HH:mm:ss.SSS');
            }
            return window['anychart']['format']['dateTime'](date, 'yyyy MMM dd');
          }
        },
        'minorLabels': {
          'enabled': true,
          'anchor': 'centerTop',
          'fontSize': '11px',
          'padding': {
            'top': 5,
            'right': 0,
            'bottom': 5,
            'left': 0
          },
          /**
           * @this {*}
           * @return {string}
           */
          'textFormatter': function() {
            var date = this['tickValue'];
            switch (this['majorIntervalUnit']) {
              case 'year':
                return window['anychart']['format']['dateTime'](date, 'yyyy');
              case 'semester':
              case 'quarter':
              case 'month':
                return window['anychart']['format']['dateTime'](date, 'MMM');
              case 'thirdOfMonth':
              case 'week':
              case 'day':
                return window['anychart']['format']['dateTime'](date, 'dd');
              case 'hour':
                return window['anychart']['format']['dateTime'](date, 'HH');
              case 'minute':
                return window['anychart']['format']['dateTime'](date, 'HH:mm');
              case 'second':
                return window['anychart']['format']['dateTime'](date, 'HH:mm:ss');
              case 'millisecond':
                return window['anychart']['format']['dateTime'](date, 'SSS');
            }
            return window['anychart']['format']['dateTime'](date, 'HH:mm:ss.SSS');
          }
        }
      },
      'dateTimeHighlighter': '#B9B9B9',
      'legend': {
        'enabled': true,
        'vAlign': 'bottom',
        'iconSize': 13,
        'position': 'top',
        /**
         * @this {*}
         * @return {*}
         */
        'titleFormatter': function() {
          var date = /** @type {number} */(this['value']);
          switch (this['groupingIntervalUnit']) {
            case 'year':
              return window['anychart']['format']['dateTime'](date, 'yyyy');
            case 'semester':
            case 'quarter':
            case 'month':
              return window['anychart']['format']['dateTime'](date, 'MMM yyyy');
            case 'thirdofmonth':
            case 'week':
            case 'day':
              return window['anychart']['format']['dateTime'](date, 'dd MMM yyyy');
            case 'hour':
            case 'minute':
              return window['anychart']['format']['dateTime'](date, 'HH:mm, dd MMM');
            case 'second':
              return window['anychart']['format']['dateTime'](date, 'HH:mm:ss');
            case 'millisecond':
              return window['anychart']['format']['dateTime'](date, 'HH:mm:ss.SSS');
          }
          return window['anychart']['format']['dateTime'](date, 'dd MMM yyyy');
        },
        'align': 'center',
        'padding': {
          'top': 10,
          'right': 10,
          'bottom': 10,
          'left': 10
        },
        'title': {
          'enabled': true,
          'fontSize': 12,
          'text': '',
          'background': {
            'enabled': false,
            'fill': {
              'keys': [
                '#fff',
                '#f3f3f3',
                '#fff'
              ],
              'angle': '90'
            },
            'stroke': {
              'keys': [
                '#ddd',
                '#d0d0d0'
              ],
              'angle': '90'
            }
          },
          'margin': {
            'top': 0,
            'right': 15,
            'bottom': 0,
            'left': 0
          },
          'padding': {
            'top': 0,
            'right': 0,
            'bottom': 0,
            'left': 0
          },
          'orientation': 'left',
          'align': 'left',
          'hAlign': 'left',
          'rotation': 0
        },
        'titleSeparator': {
          'enabled': false,
          'width': '100%',
          'height': 1,
          'margin': {
            'top': 3,
            'right': 0,
            'bottom': 3,
            'left': 0
          },
          'orientation': 'top',
          'fill': ['#000 0', '#000', '#000 0'],
          'stroke': 'none'
        }
      },
      'scales': [
        {
          'type': 'linear',
          'inverted': false,
          'maximum': null,
          'minimum': null,
          'minimumGap': 0.1,
          'maximumGap': 0.1,
          'softMinimum': null,
          'softMaximum': null,
          'ticks': {
            'mode': 'linear',
            'base': 0,
            'minCount': 4,
            'maxCount': 6
          },
          'minorTicks': {
            'mode': 'linear',
            'base': 0,
            'count': 5
          },
          'stackMode': 'none',
          'stickToZero': true
        }
      ],
      'yScale': 0,
      'zIndex': 10,
      'yAxes': [{}]
    },
    'padding': [20, 30, 20, 60],
    'plots': [{}],
    'scroller': {
      'defaultSeriesSettings': {
        'base': {
          'color': '#64b5f6',
          'fill': stockScrollerUnselected,
          'selectFill': returnSourceColor,
          'stroke': stockScrollerUnselected,
          'selectStroke': returnSourceColor,
          'lowStroke': stockScrollerUnselected,
          'selectLowStroke': returnSourceColor,
          'highStroke': stockScrollerUnselected,
          'selectHighStroke': returnSourceColor,
          'pointWidth': '75%'
        },
        'marker': {
          'fill': stockScrollerUnselected,
          'stroke': stockScrollerUnselected,
          'selectFill': returnSourceColor,
          'selectStroke': returnSourceColor
        },
        'areaLike': {
          'fill': stockScrollerUnselected
        },
        'barLike': {
          'fill': stockScrollerUnselected
        },
        'candlestick': {
          'risingFill': stockScrollerUnselected,
          'risingStroke': stockScrollerUnselected,
          'fallingFill': stockScrollerUnselected,
          'fallingStroke': stockScrollerUnselected,
          'selectFallingFill': fallingColor,
          'selectRisingFill': risingColor,
          'selectRisingStroke': risingColor,
          'selectFallingStroke': fallingColor
        },
        'ohlc': {
          'risingStroke': stockScrollerUnselected,
          'fallingStroke': stockScrollerUnselected,
          'selectRisingStroke': risingColor,
          'selectFallingStroke': fallingColor
        }
      },
      'enabled': true,
      'fill': 'none',
      'selectedFill': '#1976d2 0.2',
      'outlineStroke': '#cecece',
      'height': 40,
      'minHeight': null,
      'maxHeight': null,
      'zIndex': 40,
      'xAxis': {
        'background': {
          'enabled': false
        },
        'minorTicks': {
          'enabled': true,
          'stroke': '#cecece'
        },
        'labels': {
          'enabled': true,
          'fontSize': '11px',
          'padding': {
            'top': 5,
            'right': 5,
            'bottom': 5,
            'left': 5
          },
          'anchor': 'leftTop',
          /**
           * @this {*}
           * @return {string}
           */
          'textFormatter': function() {
            var date = this['tickValue'];
            switch (this['majorIntervalUnit']) {
              case 'year':
                return window['anychart']['format']['dateTime'](date, 'yyyy');
              case 'semester':
              case 'quarter':
              case 'month':
                return window['anychart']['format']['dateTime'](date, 'yyyy MMM');
              case 'thirdOfMonth':
              case 'week':
              case 'day':
                return window['anychart']['format']['dateTime'](date, 'MMM dd');
              case 'hour':
                return window['anychart']['format']['dateTime'](date, 'MMM-dd HH');
              case 'minute':
                return window['anychart']['format']['dateTime'](date, 'dd HH:mm');
              case 'second':
                return window['anychart']['format']['dateTime'](date, 'HH:mm:ss');
              case 'millisecond':
                return window['anychart']['format']['dateTime'](date, 'HH:mm:ss.SSS');
            }
            return window['anychart']['format']['dateTime'](date, 'yyyy MMM dd');
          }
        },
        'minorLabels': {
          'enabled': true,
          'anchor': 'leftTop',
          'fontSize': '11px',
          'padding': {
            'top': 5,
            'right': 5,
            'bottom': 5,
            'left': 5
          },
          /**
           * @this {*}
           * @return {string}
           */
          'textFormatter': function() {
            var date = this['tickValue'];
            switch (this['majorIntervalUnit']) {
              case 'year':
                return window['anychart']['format']['dateTime'](date, 'yyyy');
              case 'semester':
              case 'quarter':
              case 'month':
                return window['anychart']['format']['dateTime'](date, 'MMM');
              case 'thirdOfMonth':
              case 'week':
              case 'day':
                return window['anychart']['format']['dateTime'](date, 'dd');
              case 'hour':
                return window['anychart']['format']['dateTime'](date, 'HH');
              case 'minute':
                return window['anychart']['format']['dateTime'](date, 'HH:mm');
              case 'second':
                return window['anychart']['format']['dateTime'](date, 'HH:mm:ss');
              case 'millisecond':
                return window['anychart']['format']['dateTime'](date, 'SSS');
            }
            return window['anychart']['format']['dateTime'](date, 'HH:mm:ss.SSS');
          }
        },
        'zIndex': 75
      }
    },
    'tooltip': {
      'allowLeaveScreen': false,
      'allowLeaveChart': true,
      'displayMode': 'union',
      'positionMode': 'float',
      'title': {
        'enabled': true,
        'fontSize': 13
      },
      'separator': {'enabled': true},
      /**
       * @this {*}
       * @return {*}
       */
      'titleFormatter': function() {
        var date = /** @type {number} */(this['hoveredDate']);
        switch (this['groupingIntervalUnit']) {
          case 'year':
            return window['anychart']['format']['dateTime'](date, 'yyyy');
          case 'semester':
          case 'quarter':
          case 'month':
            return window['anychart']['format']['dateTime'](date, 'MMM yyyy');
          case 'thirdofmonth':
          case 'week':
          case 'day':
            return window['anychart']['format']['dateTime'](date, 'dd MMM yyyy');
          case 'hour':
          case 'minute':
            return window['anychart']['format']['dateTime'](date, 'HH:mm, dd MMM');
          case 'second':
            return window['anychart']['format']['dateTime'](date, 'HH:mm:ss');
          case 'millisecond':
            return window['anychart']['format']['dateTime'](date, 'HH:mm:ss.SSS');
        }
        return window['anychart']['format']['dateTime'](date, 'dd MMM yyyy');
      },
      /**
       * @this {*}
       * @return {*}
       */
      'textFormatter': function() {
        return this['formattedValues'].join('\n');
      }
    }
  },

  // standalone components
  'standalones': {
    'background': {
      'enabled': true,
      'zIndex': 0
    },
    'label': {
      'enabled': true,
      'text': 'Label text',
      'padding': {
        'top': 0,
        'right': 0,
        'bottom': 0,
        'left': 0
      },
      'width': null,
      'height': null,
      'anchor': 'leftTop',
      'position': 'leftTop',
      'offsetX': 0,
      'offsetY': 0,
      'minFontSize': 8,
      'maxFontSize': 72,
      'adjustFontSize': {
        'width': false,
        'height': false
      },
      'rotation': 0,
      'zIndex': 0
    },
    'labelsFactory': {
      'enabled': true,
      'zIndex': 0
    },
    'legend': {
      'enabled': true,
      'zIndex': 0
    },
    'markersFactory': {
      'enabled': true,
      'zIndex': 0
    },
    'title': {
      'enabled': true,
      'zIndex': 0
    },
    'linearAxis': {
      'enabled': true,
      'zIndex': 0,
      'ticks': {'enabled': true},
      'minorTicks': {'enabled': true}
    },
    'polarAxis': {
      'enabled': true,
      'startAngle': 0,
      'zIndex': 0,
      'ticks': {'enabled': true},
      'minorTicks': {'enabled': true}
    },
    'radarAxis': {
      'enabled': true,
      'startAngle': 0,
      'zIndex': 0,
      'ticks': {'enabled': true},
      'minorTicks': {'enabled': true}
    },
    'radialAxis': {
      'enabled': true,
      'startAngle': 0,
      'zIndex': 0,
      'ticks': {'enabled': true},
      'minorTicks': {'enabled': true},
      'minorLabels': {
        'padding': {
          'top': 1,
          'right': 1,
          'bottom': 0,
          'left': 1
        }
      }
    },
    'linearGrid': {
      'enabled': true,
      'scale': null,
      'zIndex': 0
    },
    'polarGrid': {
      'enabled': true,
      'layout': 'circuit',
      'zIndex': 0
    },
    'radarGrid': {
      'enabled': true,
      'layout': 'circuit',
      'zIndex': 0
    },
    'lineAxisMarker': {
      'enabled': true,
      'zIndex': 0
    },
    'textAxisMarker': {
      'enabled': true,
      'zIndex': 0
    },
    'rangeAxisMarker': {
      'enabled': true,
      'zIndex': 0
    },
    'dataGrid': {
      'enabled': true,
      'zIndex': 0
    },
    'scroller': {
      'enabled': true
    }
  }
};
