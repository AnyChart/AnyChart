goog.provide('anychart.themes.defaultThemeNew');
var colorStrokeThin = '#EAEAEA';
var colorStrokeNormal = '#CECECE';
var colorStrokeBright = '#c1c1c1';
var colorStrokeExtraBright = '#969EA5';

var colorFillBackground = '#ffffff';
var colorFillExtraThin = '#f5f5f5';
var colorFillBackgroundReversed = '#212121';

var fontColorNormal = '#7c868e';
var fontColorBright = '#545f69';

var fontColorReversedNormal = '#ffffff';
var opacityThin = ' 0.3';
var opacityStrong = ' 0.7';


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
var returnDarkenDarkenSourceColor = function() {
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
var returnDarkenStrokeSourceColor = function() {
  return window['anychart']['color']['setThickness'](window['anychart']['color']['darken'](this['sourceColor']), 1.5);
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



window['anychart'] = window['anychart'] || {};
window['anychart']['themes'] = window['anychart']['themes'] || {};
window['anychart']['themes']['defaultThemeNew'] = {
  'palette': {
    'type': 'distinct',
    'items': ['#64b5f6', '#1976d2', '#ef6c00', '#ffd54f', '#455a64', '#96a6a6', '#dd2c00', '#00838f', '#00bfa5', '#ffa000']
  },
  'hatchFillPalette': {
    'items': ['backwardDiagonal', 'forwardDiagonal', 'horizontal', 'vertical', 'dashedBackwardDiagonal', 'grid', 'dashedForwardDiagonal', 'dashedHorizontal', 'dashedVertical', 'diagonalCross', 'diagonalBrick', 'divot', 'horizontalBrick', 'verticalBrick', 'checkerBoard', 'confetti', 'plaid', 'solidDiamond', 'zigZag', 'weave', 'percent05', 'percent10', 'percent20', 'percent25', 'percent30', 'percent40', 'percent50', 'percent60', 'percent70', 'percent75', 'percent80', 'percent90']
  },
  'markerPalette': {
    'items': ['circle', 'diamond', 'square', 'triangleDown', 'triangleUp', 'diagonalCross', 'pentagon', 'cross', 'line', 'star5', 'star4', 'trapezium', 'star7', 'star6', 'star10']
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

  'defaultTitle': {
    'enabled': false,
    'fontSize': 16,
    'text': 'Title text',
    'width': null,
    'height': null,
    'align': 'center',
    'hAlign': 'center'
  },

  'defaultTooltip': {
    'enabled': true,
    'title': {
      'enabled': false,
      'fontColor': fontColorReversedNormal,
      'fontSize': 13,
      'text': 'Tooltip Title',
      'rotation': 0,
      'width': null,
      'height': null,
      'align': 'left',
      'orientation': 'top',
      'zIndex': 1
    },
    'content': {
      'enabled': true,
      'fontSize': 11,
      'fontColor': fontColorReversedNormal,
      'hAlign': 'left',
      'text': 'Content Title',
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
      'rotation': 0,
      'zIndex': 1
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
      'fontColor': fontColorBright
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
    'layout': 'horizontal',
    'drawFirstLine': true,
    'drawLastLine': true,
    'oddFill': null,
    'evenFill': null,
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
    'layout': 'horizontal',
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
    'anchor': 'centerBottom',
    'align': 'center',
    'layout': 'horizontal',
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
    'layout': 'horizontal',
    'fill': '#EAEAEA',
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
    'padding': {'top': 5, 'right': 10, 'bottom': 15, 'left': 10},
    'title': {'fontSize': 15},
    'paginator': {
      'enabled': true,
      'fontSize': 12,
      'fontColor': fontColorBright,
      'orientation': 'right',
      'layout': 'horizontal',
      'zIndex': 30
    },
    'tooltip': {
      'enabled': false,
      'title': {'enabled': false}
    },
    'zIndex': 20
  },

  'defaultCrosshairLabel': {
    'x': 0,
    'y': 0,
    'axisIndex': 0,
    'textFormatter': returnValue,
    'enabled': true,
    'fontSize': 12,
    'fontColor': fontColorReversedNormal,
    'fontWeight': 400,
    'disablePointerEvents': true,
    'text': 'Label text',
    'background': {
      'enabled': true,
      'fill': colorFillBackgroundReversed + opacityStrong,
      'stroke': null,
      'corners': 3,
      'zIndex': 0
    },
    'padding': {'top': 5, 'right': 10, 'bottom': 5, 'left': 10},
    'width': null,
    'height': null,
    'anchor': null,
    'offsetX': 0,
    'offsetY': 0,
    'adjustFontSize': {
      'width': false,
      'height': false
    },
    'rotation': 0
  },

  'chart': {
    'padding': {'top': 30, 'right': 20, 'bottom': 20, 'left': 20},
    'margin': {'top': 0, 'right': 0, 'bottom': 0, 'left': 0},
    'background': {'enabled': true, 'zIndex': 1},
    'title': {
      'text': 'Chart Title',
      'padding': {'top': 0, 'right': 0, 'bottom': 5, 'left': 0},
      'zIndex': 80
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
        'enabled': true,
        'fontSize': 13
      },
      'separator': {'enabled': true},
      /**
       * @this {*}
       * @return {*}
       */
      'titleFormatter': function() {
        return 'Union Tooltip';
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
      'inChart': false
      // we cannot determine the protocol statically :(
      //'logoSrc': 'http://static.anychart.com/logo.png'
    },
    'defaultSeriesSettings': {
      'base': {
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
            return this['seriesName'];
          },
          /**
           * @this {*}
           * @return {*}
           */
          'contentFormatter': function() {
            return this['x'] + ': ' + this['value'];
          }
        },
        'hatchFill': false,
        'hoverLabels': {'enabled': null},
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
        'legendItem': {
          'iconType': 'square',
          'iconStroke': 'none'
        },
        'lowStroke': returnStrokeSourceColor,
        'hoverLowStroke': returnStrokeSourceColor,
        'highStroke': returnStrokeSourceColor,
        'hoverHighStroke': returnStrokeSourceColor,
        'hoverMarkers': {
          'enabled': null,
          'disablePointerEvents': false,
          'position': 'center',
          'rotation': 0,
          'anchor': 'center',
          'offsetX': 0,
          'offsetY': 0,
          'size': 6
        },
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
        'connectMissingPoints': false
      },
      'marker': {
        'fill': returnSourceColor85,
        'hoverFill': returnLightenSourceColor,
        'stroke': returnStrokeSourceColor,
        'hoverStroke': returnStrokeSourceColor,
        'size': 6,
        'hoverSize': 8
      },
      'bubble': {
        'fill': returnSourceColor70,
        'hoverFill': returnSourceColor50,
        'stroke': returnStrokeSourceColor,
        'hoverStroke': returnStrokeSourceColor,
        'hoverMarkers': {
          'enabled': null,
          'position': 'center'
        },
        'labels': {
          'position': 'center',
          'anchor': 'bottom'
        }
      },
      'areaLike': {
        'fill': returnSourceColor60,
        'hoverFill': returnSourceColor60,
        'stroke': returnStrokeSourceColor,
        'hoverStroke': returnStrokeSourceColor,
        'hoverMarkers': {
          'enabled': true,
          'position': 'top'
        },
        'labels': {
          'anchor': 'bottomLeft'
        }
      },
      'barLike': {
        'fill': returnSourceColor85,
        'hoverFill': returnSourceColor60,
        'stroke': returnStrokeSourceColor,
        'hoverStroke': returnStrokeSourceColor,

        'labels': {
          'anchor': 'bottomCenter'
        }
      },
      'lineLike': {
        'stroke': returnStrokeSourceColor,
        'hoverStroke': returnStrokeSourceColor,
        'labels': {
          'anchor': 'bottomleft'
        },
        'legendItem': {
          'iconStroke': returnStrokeSourceColor,
          'iconType': 'line'
        },
        'hoverMarkers': {
          'enabled': true
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

  // merge with chart
  'cartesian': {
    'defaultSeriesSettings': {
      'rangeArea': {
        'labels': {
          'textFormatter': returnRangeLabelsContentFormatter
        },
        'tooltip': {
          'contentFormatter': returnRangeTooltipContentFormatter
        }
      },
      'rangeSplineArea': {
        'labels': {
          'textFormatter': returnRangeLabelsContentFormatter
        },
        'tooltip': {
          'titleFormatter': returnX,
          'contentFormatter': returnRangeTooltipContentFormatter
        }
      },
      'rangeStepArea': {
        'labels': {
          'textFormatter': returnRangeLabelsContentFormatter
        },
        'tooltip': {
          'contentFormatter': returnRangeTooltipContentFormatter
        }
      },
      'bar': {
        'markers': {
          'position': 'right'
        },
        'hoverMarkers': {
          'position': 'right'
        },
        'labels': {
          'offsetX': 3,
          'anchor': 'centerLeft'
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
          'anchor': 'centerLeft',
          'offsetX': 3,
          'textFormatter': returnRangeLabelsContentFormatter
        },
        'tooltip': {
          'contentFormatter': returnRangeTooltipContentFormatter
        }
      },
      'column': {
        'markers': {
          'position': 'top'
        },
        'hoverMarkers': {
          'position': 'top'
        },
        'labels': {
          'offsetY': 3,
          'anchor': 'centerBottom'
        }
      },
      'rangeColumn': {
        'markers': {
          'position': 'top'
        },
        'hoverMarkers': {
          'position': 'top'
        },
        'labels': {
          'position': 'top',
          'anchor': 'bottom',
          'textFormatter': returnRangeLabelsContentFormatter
        },
        'tooltip': {
          'contentFormatter': returnRangeTooltipContentFormatter
        }
      },
      'box': {
        'medianStroke': returnDarkenSourceColor,
        'hoverMedianStroke': returnSourceColor,
        'stemStroke': returnDarkenSourceColor,
        'hoverStemStroke': returnSourceColor,
        'whiskerStroke': returnDarkenSourceColor,
        'hoverWhiskerStroke': null,
        'whiskerWidth': 0,
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
          //todo need change default
          'enabled': null,
          'size': 20,
          'type': 'star10'
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
      'enabled': true,
      'orientation': 'bottom',
      'title': {
        'text': 'X-Axis'
      }
    },
    'defaultYAxisSettings': {
      'enabled': true,
      'orientation': 'left',
      'title': {
        'text': 'Y-Axis'
      }
    },

    'series': [],
    'grids': [],
    'minorGrids': [],
    'xAxes': [],
    'yAxes': [],
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
    }
  },

  // merge with cartesian
  'area': {
    'xAxes': [{}],
    'yAxes': [{}],
    'grids': [],
    'minorGrids': [],
    'interactivity': {
      'hoverMode': 'byX'
    }
  },
  'bar': {
    'barChartMode': true,
    'defaultGridSettings': {
      'layout': 'vertical'
    },
    'defaultMinorGridSettings': {
      'layout': 'vertical'
    },
    'defaultLineMarkerSettings': {
      'layout': 'vertical'
    },
    'defaultTextMarkerSettings': {
      'layout': 'vertical'
    },
    'defaultRangeMarkerSettings': {
      'layout': 'vertical'
    },
    'defaultXAxisSettings': {
      'orientation': 'left'
    },
    'defaultYAxisSettings': {
      'orientation': 'bottom'
    },

    'xAxes': [{}],
    'yAxes': [{}],
    'grids': [],
    'minorGrids': [],
    'scales': []
  },
  'column': {
    'xAxes': [{}],
    'yAxes': [{}],
    'grids': [],
    'minorGrids': []
  },
  'line': {
    'xAxes': [{}],
    'yAxes': [{}],
    'grids': [],
    'minorGrids': []
  },
  'box': {
    'xAxes': [{}],
    'yAxes': [{}],
    'grids': [],
    'minorGrids': []
  },
  'financial': {
    'defaultSeriesSettings': {
      'base': {
        'risingFill': returnSourceColor,
        'risingStroke': returnStrokeSourceColor,
        'hoverRisingFill': returnLightenSourceColor,
        'hoverRisingStroke': returnStrokeSourceColor,
        'fallingFill': returnDarkenDarkenSourceColor,
        'fallingStroke': returnDarkenStrokeSourceColor,
        'hoverFallingFill': returnDarkenSourceColor,
        'hoverFallingStroke': returnDarkenStrokeSourceColor,
        'risingHatchFill': null,
        'hoverRisingHatchFill': null,
        'fallingHatchFill': null,
        'hoverFallingHatchFill': null
      },
      'candlestick': {
        'tooltip': {
          'titleFormatter': returnDateTimeX,
          /**
           * @this {*}
           * @return {*}
           */
          'contentFormatter': function() {
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
          'position': 'centerTop'
        },
        'labels': {
          'position': 'centerTop',
          'textFormatter': returnDateTimeX
        }
      },
      'ohlc': {
        'tooltip': {
          'titleFormatter': returnDateTimeX,
          /**
           * @this {*}
           * @return {*}
           */
          'contentFormatter': function() {
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
        'labels': {
          'position': 'centerTop',
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
    'yAxes': [{}],
    'grids': [],
    'minorGrids': [],
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

  // merge with chart
  'pieFunnelPyramidBase': {
    'fill': returnSourceColor,
    'hoverFill': returnLightenSourceColor,
    'stroke': 'none',
    'hoverStroke': 'none',
    'title': {
      'padding': {'top': 0, 'right': 0, 'bottom': 20, 'left': 0}
    },
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
    'legend': {
      'enabled': true,
      'position': 'bottom',
      'align': 'center'
    },
    'markers': {
      'enabled': false,
      'rotation': 0,
      'anchor': 'center',
      'offsetX': 0,
      'offsetY': 0,
      'size': 4,
      'positionFormatter': returnValue,
      'zIndex': 33
    },
    'hoverMarkers': {
      'enabled': null,
      'size': 6
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
      'contentFormatter': function() {
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
    'pointsPadding': 5,
    'legend': {
      'enabled': false,
      'position': 'right',
      'vAlign': 'middle',
      'itemsLayout': 'vertical',
      'align': 'center'
    },
    'labels': {
      'position': 'outsideLeftInColumn'
    }
  },
  'pyramid': {
    'title': {
      'text': 'Pyramid Chart'
    },
    'baseWidth': '70%',
    'pointsPadding': 5,
    'legend': {
      'enabled': false,
      'position': 'right',
      'vAlign': 'middle',
      'itemsLayout': 'vertical',
      'align': 'center',
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
    'connectorLength': '15%'
  },

  // merge with chart
  'scatter': {
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
    'defaultSeriesSettings': {
      'base': {
        'enabled': true,
        'hatchFill': null
      },
      'area': {},
      'line': {},
      'marker': {}
    },
    'defaultGridSettings': {
      'layout': 'radial'
    },
    'defaultMinorGridSettings': {
      'layout': 'circuit'
    },
    'xAxis': {
      'scale': 0,
      'zIndex': 25
    },
    'startAngle': 0,
    'grids': [{}],
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
    'defaultSeriesSettings': {
      'base': {
        'enabled': true,
        'hatchFill': null
      },
      'area': {
        'hoverMarkers': {'enabled': null}
      },
      'line': {},
      'marker': {}
    },
    'defaultGridSettings': {
      'layout': 'radial'
    },
    'defaultMinorGridSettings': {
      'layout': 'circuit'
    },
    'xAxis': {
      'scale': 0,
      'zIndex': 25
    },
    'startAngle': 0,
    'grids': [{}],
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
    'background': {'enabled': true},
    'layout': 'horizontal',
    'padding': {'top': 0, 'right': 0, 'bottom': 0, 'left': 0},
    'defaultRangeMarkerSettings': {
      'enabled': true,
      'from': 0,
      'to': 0,
      'zIndex': 2
    },
    'defaultMarkerSettings': {
      'fill': '#545f69',
      'stroke': 'none',
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
        'padding': {'top': 0, 'right': 0, 'bottom': 0, 'left': 0}
      },
      'labels': {
        'fontSize': 9,
        'padding': {'top': 0, 'right': 0, 'bottom': 0, 'left': 0}
      },
      'minorLabels': {
        'padding': {'top': 0, 'right': 0, 'bottom': 0, 'left': 0}
      },
      'orientation': 'bottom',
      'zIndex': 3
    },
    'title': {
      'rotation': 0,
      'padding': {'top': 0, 'right': 10, 'bottom': 0, 'left': 0}
    },
    'scale': {
      'type': 'linear',
      'ticks': {
        'mode': 'linear',
        'base': 0,
        'explicit': null,
        'minCount': 3,
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
        'labels': {
          'enabled': false,
          'fontSize': 8,
          'background': {
            enabled: false
          },
          'position': 'center',
          'anchor': 'centerBottom'
        },
        'minLabels': {
          'position': 'bottom',
          'anchor': 'bottomCenter'
        },
        'maxLabels': {
          'position': 'top',
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
        'fill': colorStrokeBright,
        'stroke': 'none'
      },
      'minorTicks': {
        'hatchFill': false,
        'type': 'line',
        'position': 'center',
        'length': null,
        'fill': colorStrokeBright,
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
      'fill': colorFillExtraThin,
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
    'ranges': []
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
        'hoverFill': returnLightenSourceColor,
        'selectFill': {'color': '#64b5f6'},
        'stroke': {'thickness': 0.5, 'color': '#545f69'},
        'hoverStroke': {'thickness': 0.5, 'color': '#545f69'},
        'selectStroke': {'thickness': 0.5, 'color': '#545f69'},
        'hatchFill': false,
        'labels': {
          'enabled': true,
          'fontSize': 12,
          'adjustFontSize': {
            'width': true,
            'height': true
          },
          /**
           * @this {*}
           * @return {*}
           */
          'textFormatter': function() {
            return this['name'];
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
          'disablePointerEvents': false,
          'size': 4
        },
        'hoverMarkers': {'enabled': null, 'size': 6},
        'selectMarkers': {
          'enabled': null,
          'size': 6
        },
        'color': null,
        'allowPointsSelect': null,
        'tooltip': {
          /**
           * @this {*}
           * @return {*}
           */
          'titleFormatter': function() {
            return this['name'];
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
      'choropleth': {}
    },
    'colorRange': {
      'enabled': false,
      'stroke': null,
      'orientation': 'bottom',
      'title': {'enabled': false},
      'colorLineSize': 20,
      'padding': {'top': 10, 'right': 0, 'bottom': 20, 'left': 0},
      'align': 'center',
      'length': '70%',
      'marker': {
        'padding': {'top': 3, 'right': 3, 'bottom': 3, 'left': 3},
        'fill': '#545f69',
        'hoverFill': '#545f69',
        'stroke': '#545f69',
        'hoverStroke': '#545f69',
        /**
         * @this {*}
         * @return {*}
         */
        'positionFormatter': function() {
          return this['value'];
        },
        'legendItem': {
          'iconStroke': null
        },
        'enabled': true,
        'disablePointerEvents': false,
        'position': 'center',
        'rotation': 0,
        'anchor': 'center',
        'offsetX': 0,
        'offsetY': 0,
        'type': 'triangleDown',
        'size': 15
      },
      'labels': {'offsetX': 0},
      'ticks': {
        'stroke': {'thickness': 3, 'color': '#fff', 'position': 'center', 'length': 20}
      }
    },
    'unboundRegions': {'enabled': true, 'fill': '#F7F7F7', 'stroke': '#B9B9B9'},
    'linearColor': {'colors': ['#fff', '#ffd54f', '#ef6c00']},
    'ordinalColor': {
      'autoColors': function(rangesCount) {
        return window['anychart']['color']['blendedHueProgression']('#ffd54f', '#ef6c00', rangesCount);
      }
    },
    'legend': {'enabled': false},
    'maxBubbleSize': '20%',
    'minBubbleSize': '5%'
  },
  'defaultDataGrid': {
    'isStandalone': true,
    'titleHeight': 25,
    'backgroundFill': '#fff',
    'columnStroke': '#ccd7e1',
    'rowStroke': '#ccd7e1',
    'rowOddFill': '#fff',
    'rowEvenFill': '#fafafa',
    'rowFill': '#fff',
    'hoverFill': '#edf8ff',
    'rowSelectedFill': '#d2eafa',
    'zIndex': 5,
    'titleFill': {
      'keys': ['#f8f8f8', '#fff'],
      'angle': 90
    },
    'tooltip': {
      'anchor': 'leftTop',
      'content': {
        'hAlign': 'left'
      },
      'textFormatter': function(data) {
        var name = data['get']('name');
        return (name !== void 0) ? name + '' : '';
      }
    },
    'defaultColumnSettings': {
      'width': 90,
      //'defaultWidth': undefined,
      'cellTextSettings': {
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
        'maxFontSize': 72
      },
      'depthPaddingMultiplier': 0,
      'collapseExpandButtons': false,
      'title': {
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
      'textFormatter': function(item) {
        return '';
      }
    },
    'columns': [
      {
        'width': 50,
        'textFormatter': function(item) {
          var val = item['meta']('index');
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
        'textFormatter': function(item) {
          var val = item['get']('name');
          return (val != null) ? (val + '') : '';
        },
        'title': {
          'text': 'Name'
        }
      }
    ]
  },
  // merge with chart
  'gantt': {
    'base': {
      'splitterPosition': '30%',
      'headerHeight': 70,
      'hoverFill': '#edf8ff',
      'rowSelectedFill': '#d2eafa',
      'columnStroke': '#ccd7e1',
      'rowStroke': '#ccd7e1',
      'title': {
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
        'columnStroke': '#ccd7e1',
        'rowStroke': '#ccd7e1',
        'backgroundFill': 'none',
        'rowOddFill': '#fff',
        'rowEvenFill': '#fafafa',
        'rowFill': '#fff',
        'hoverFill': '#edf8ff',
        'rowSelectedFill': '#d2eafa',
        'zIndex': 5,
        'baseFill': {
          'keys': ['#3CA0DE', '#3085BC'],
          'angle': -90
        },
        'baseStroke': '#0C3F5F',
        'baselineFill': {
          'keys': ['#E1E1E1', '#A1A1A1'],
          'angle': -90
        },
        'baselineStroke': '#0C3F5F',
        'progressFill': {
          'keys': ['#63FF78', '#3DC351', '#188E2D'],
          'angle': -90
        },
        'progressStroke': '#006616',
        'milestoneFill': {
          'keys': ['#FAE096', '#EB8344'],
          'angle': -90
        },
        'milestoneStroke': '#000',
        'parentFill': {
          'keys': ['#646464', '#282828'],
          'angle': -90
        },
        'parentStroke': '#000',
        'selectedElementFill': {
          'keys': ['#f1b8b9', '#f07578'],
          'angle': -90
        },
        'connectorFill': '#000090',
        'connectorStroke': '#000090',
        'minimumGap': 0.1,
        'maximumGap': 0.1,
        'baselineAbove': false,
        'tooltip': {
          'anchor': 'leftTop',
          'content': {
            'hAlign': 'left'
          }
        },
        'labelsFactory': {
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
          'zIndex': 40
        },
        'markersFactory': {
          'anchor': 'centerTop',
          'zIndex': 50,
          'enabled': true,
          'type': 'star4'
        },
        'header': {
          'labelsFactory': {
            'anchor': 'leftTop',
            'padding': {
              'top': 0,
              'right': 2,
              'bottom': 0,
              'left': 2
            },
            'vAlign': 'middle',
            'textWrap': 'noWrap',
            'textOverflow': '...'
          }

        }
      }
    },
    'ganttResource': {
      'dataGrid': {
        'tooltip': {
          'textFormatter': function(data) {
            var item = data['item'];
            if (!item) return '';
            var name = item['get']('name');
            var startDate = item['meta']('minPeriodDate');
            var endDate = item['meta']('maxPeriodDate');
            return (name ? name : '') +
                (startDate ? '\nStart Date: ' + window['anychart']['utils']['defaultDateFormatter'](startDate) : '') +
                (endDate ? '\nEnd Date: ' + window['anychart']['utils']['defaultDateFormatter'](endDate) : '');
          }
        }
      },
      'timeline': {
        'selectedElementStroke': 'none',
        'tooltip': {
          'textFormatter': function(data) {
            var item = data['item'];
            var period = data['period'];
            var name = item['get']('name');
            var startDate = period ? period['start'] : (item['get']('actualStart') || item['meta']('autoStart'));
            var endDate = period ? period['end'] : (item['get']('actualEnd') || item['meta']('autoEnd'));

            return (name ? name : '') +
                (startDate ? '\nStart Date: ' + window['anychart']['utils']['defaultDateFormatter'](startDate) : '') +
                (endDate ? '\nEnd Date: ' + window['anychart']['utils']['defaultDateFormatter'](endDate) : '');
          }
        }
      }
    },
    'ganttProject': {
      'dataGrid': {
        'tooltip': {
          'textFormatter': function(data) {
            var item = data['item'];
            if (!item) return '';
            var name = item['get']('name');
            var startDate = item['get']('actualStart') || item['meta']('autoStart');
            var endDate = item['get']('actualEnd') || item['meta']('autoEnd');
            var progress = item['get']('progressValue');

            if (progress === void 0) {
              var auto = item['meta']('autoProgress') * 100;
              progress = (Math.round(auto * 100) / 100 || 0) + '%';
            }

            return (name ? name : '') +
                (startDate ? '\nStart Date: ' + window['anychart']['utils']['defaultDateFormatter'](startDate) : '') +
                (endDate ? '\nEnd Date: ' + window['anychart']['utils']['defaultDateFormatter'](endDate) : '') +
                (progress ? '\nComplete: ' + progress : '');
          }
        }
      },
      'timeline': {
        'selectedElementStroke': '#000',
        'tooltip': {
          'textFormatter': function(data) {
            var item = data['item'];
            var name = item['get']('name');
            var startDate = item['get']('actualStart') || item['meta']('autoStart');
            var endDate = item['get']('actualEnd') || item['meta']('autoEnd');
            var progress = item['get']('progressValue');

            if (progress === void 0) {
              var auto = item['meta']('autoProgress') * 100;
              progress = (Math.round(auto * 100) / 100 || 0) + '%';
            }

            return (name ? name : '') +
                (startDate ? '\nStart Date: ' + window['anychart']['utils']['defaultDateFormatter'](startDate) : '') +
                (endDate ? '\nEnd Date: ' + window['anychart']['utils']['defaultDateFormatter'](endDate) : '') +
                (progress ? '\nComplete: ' + progress : '');

          }
        }
      }
    }
  },

  'stock': {
    'defaultPlotSettings': {
      'legend': {
        'enabled': true,
        'vAlign': 'bottom',
        'fontSize': 12,
        'itemsLayout': 'horizontal',
        'itemsSpacing': 15,
        'items': null,
        'iconSize': 13,
        'itemsFormatter': null, // effectively equals current settings
        'itemsTextFormatter': null,
        'itemsSourceMode': 'default',
        'inverted': false,
        'hoverCursor': 'pointer',
        'iconTextSpacing': 5,
        'width': null,
        'height': null,
        'position': 'top',
        /**
         * @this {*}
         * @return {*}
         */
        'titleFormatter': function() {
          var date = /** @type {number} */(this['value']);
          switch (this['groupingIntervalUnit']) {
            case 'year':
              return window['anychart']['utils']['formatDateTime'](date, 'yyyy');
            case 'semester':
            case 'quarter':
            case 'month':
              return window['anychart']['utils']['formatDateTime'](date, 'MMM yyyy');
            case 'thirdofmonth':
            case 'week':
            case 'day':
              return window['anychart']['utils']['formatDateTime'](date, 'dd MMM yyyy');
            case 'hour':
            case 'minute':
              return window['anychart']['utils']['formatDateTime'](date, 'HH:mm, dd MMM');
            case 'second':
              return window['anychart']['utils']['formatDateTime'](date, 'HH:mm:ss');
            case 'millisecond':
              return window['anychart']['utils']['formatDateTime'](date, 'HH:mm:ss.SSS');
          }
          return window['anychart']['utils']['formatDateTime'](date, 'dd MMM yyyy');
        },
        'align': 'center',
        'margin': {
          'top': 0,
          'right': 0,
          'bottom': 0,
          'left': 0
        },
        'padding': {
          'top': 10,
          'right': 10,
          'bottom': 10,
          'left': 10
        },
        'background': {
          'enabled': false,
          'fill': '#fff',
          'stroke': 'none',
          'corners': 5
        },
        'title': {
          'enabled': true,
          'fontSize': 12,
          'text': 'Legend title',
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
        },
        'paginator': {
          'enabled': true,

          'fontSize': 12,
          'fontColor': '#545f69',

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
          'padding': {
            'top': 0,
            'right': 0,
            'bottom': 0,
            'left': 0
          },
          'margin': {
            'top': 0,
            'right': 0,
            'bottom': 0,
            'left': 0
          },
          'orientation': 'right',
          'layout': 'horizontal',
          'zIndex': 30
        },
        'tooltip': {
          'enabled': false,
          'title': {
            'enabled': false,
            'margin': {
              'top': 3,
              'right': 3,
              'bottom': 0,
              'left': 3
            },
            'padding': {
              'top': 0,
              'right': 0,
              'bottom': 0,
              'left': 0
            }
          }
        },
        'zIndex': 20
      },
      'zIndex': 10
    },
    'plots': [{}],
    'scroller': {
      'enabled': true,
      'fill': '#fff',
      'selectedFill': '#e2e2e2',
      'outlineStroke': '#fff',
      'height': 40,
      'minHeight': null,
      'maxHeight': null,
      'thumbs': {
        'enabled': true,
        'autoHide': false,
        'fill': '#f7f7f7',
        'stroke': '#545f69',
        'hoverFill': '#ccc',
        'hoverStroke': '#000'
      },
      'zIndex': 40
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
            return window['anychart']['utils']['formatDateTime'](date, 'yyyy');
          case 'semester':
          case 'quarter':
          case 'month':
            return window['anychart']['utils']['formatDateTime'](date, 'MMM yyyy');
          case 'thirdofmonth':
          case 'week':
          case 'day':
            return window['anychart']['utils']['formatDateTime'](date, 'dd MMM yyyy');
          case 'hour':
          case 'minute':
            return window['anychart']['utils']['formatDateTime'](date, 'HH:mm, dd MMM');
          case 'second':
            return window['anychart']['utils']['formatDateTime'](date, 'HH:mm:ss');
          case 'millisecond':
            return window['anychart']['utils']['formatDateTime'](date, 'HH:mm:ss.SSS');
        }
        return window['anychart']['utils']['formatDateTime'](date, 'dd MMM yyyy');
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
      'zIndex': 0
    },
    'legend': {
      'zIndex': 0
    },
    'markersFactory': {
      'zIndex': 0
    },
    'title': {
      'zIndex': 0
    },
    'linearAxis': {
      'zIndex': 0,
      'ticks': {'enabled': true},
      'minorTicks': {'enabled': true}
    },
    'polarAxis': {
      'startAngle': 0,
      'zIndex': 0,
      'ticks': {'enabled': true},
      'minorTicks': {'enabled': true}
    },
    'radarAxis': {
      'startAngle': 0,
      'zIndex': 0,
      'ticks': {'enabled': true},
      'minorTicks': {'enabled': true}
    },
    'radialAxis': {
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
      'scale': null,
      'zIndex': 0
    },
    'polarGrid': {
      'layout': 'circuit',
      'zIndex': 0
    },
    'radarGrid': {
      'layout': 'circuit',
      'zIndex': 0
    },
    'lineAxisMarker': {
      'zIndex': 0
    },
    'textAxisMarker': {
      'zIndex': 0
    },
    'rangeAxisMarker': {
      'zIndex': 0
    },
    'dataGrid': {
      'zIndex': 0
    },
    'scroller': {
      'enabled': true,
      'fill': '#fff',
      'selectedFill': '#e2e2e2',
      'outlineStroke': '#fff',
      'height': 40,
      'minHeight': null,
      'maxHeight': null,
      'thumbs': {
        'enabled': true,
        'autoHide': false,
        'fill': '#f7f7f7',
        'stroke': '#545f69',
        'hoverFill': '#ccc',
        'hoverStroke': '#000'
      }
    }
  }
};
