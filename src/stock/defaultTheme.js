goog.provide('anychart.stockModule.defaultTheme');
goog.require('anychart.core.defaultTheme');
goog.require('anychart.format');


/**
 * @const {string}
 */
anychart.stockModule.defaultTheme.stockScrollerUnselected = '#999 0.6';


/**
 * @this {*}
 * @return {*}
 */
anychart.stockModule.defaultTheme.StockSimpleTooltipFormatter = function() {
  var val = anychart.core.defaultTheme.locNum(this['value']);
  return this['seriesName'] + ': ' + this['valuePrefix'] + val + this['valuePostfix'];
};


/**
 * @this {*}
 * @return {*}
 */
anychart.stockModule.defaultTheme.StockRangeTooltipFormatter = function() {
  return this['seriesName'] + ':\n' +
      '  High: ' + anychart.core.defaultTheme.locNum(this['high']) + '\n' +
      '  Low: ' + anychart.core.defaultTheme.locNum(this['low']);
};


/**
 * @this {*}
 * @return {*}
 */
anychart.stockModule.defaultTheme.StockOHLCTooltipFormatter = function() {
  return this['seriesName'] + ':\n' +
      '  Open: ' + anychart.core.defaultTheme.locNum(this['open']) + '\n' +
      '  High: ' + anychart.core.defaultTheme.locNum(this['high']) + '\n' +
      '  Low: ' + anychart.core.defaultTheme.locNum(this['low']) + '\n' +
      '  Close: ' + anychart.core.defaultTheme.locNum(this['close']);
};


goog.mixin(goog.global['anychart']['themes']['defaultTheme'], {
  'defaultGroupingSettings': {
    'enabled': true,
    'forced': false,
    'levels': [
      {
        'unit': 'millisecond',
        'count': 1
      },
      {
        'unit': 'millisecond',
        'count': 5
      },
      {
        'unit': 'millisecond',
        'count': 10
      },
      {
        'unit': 'millisecond',
        'count': 25
      },
      {
        'unit': 'millisecond',
        'count': 50
      },
      {
        'unit': 'millisecond',
        'count': 100
      },
      {
        'unit': 'millisecond',
        'count': 250
      },
      {
        'unit': 'millisecond',
        'count': 500
      },
      {
        'unit': 'second',
        'count': 1
      },
      {
        'unit': 'second',
        'count': 5
      },
      {
        'unit': 'second',
        'count': 10
      },
      {
        'unit': 'second',
        'count': 20
      },
      {
        'unit': 'second',
        'count': 30
      },
      {
        'unit': 'minute',
        'count': 1
      },
      {
        'unit': 'minute',
        'count': 5
      },
      {
        'unit': 'minute',
        'count': 15
      },
      {
        'unit': 'minute',
        'count': 30
      },
      {
        'unit': 'hour',
        'count': 1
      },
      {
        'unit': 'hour',
        'count': 2
      },
      {
        'unit': 'hour',
        'count': 6
      },
      {
        'unit': 'hour',
        'count': 12
      },
      {
        'unit': 'day',
        'count': 1
      },
      {
        'unit': 'week',
        'count': 1
      },
      {
        'unit': 'month',
        'count': 1
      },
      {
        'unit': 'month',
        'count': 3
      },
      {
        'unit': 'month',
        'count': 6
      },
      {
        'unit': 'year',
        'count': 1
      }
    ],
    'maxVisiblePoints': 500,
    'minPixPerPoint': NaN
  },
  'stock': {
    'grouping': {},
    'scrollerGrouping': {
      'levels': [
        {'unit': 'millisecond', 'count': 1},
        {'unit': 'millisecond', 'count': 2},
        {'unit': 'millisecond', 'count': 5},
        {'unit': 'millisecond', 'count': 10},
        {'unit': 'millisecond', 'count': 25},
        {'unit': 'millisecond', 'count': 50},
        {'unit': 'millisecond', 'count': 100},
        {'unit': 'millisecond', 'count': 250},
        {'unit': 'millisecond', 'count': 500},
        {'unit': 'second', 'count': 1},
        {'unit': 'second', 'count': 2},
        {'unit': 'second', 'count': 5},
        {'unit': 'second', 'count': 10},
        {'unit': 'second', 'count': 20},
        {'unit': 'second', 'count': 30},
        {'unit': 'minute', 'count': 1},
        {'unit': 'minute', 'count': 2},
        {'unit': 'minute', 'count': 5},
        {'unit': 'minute', 'count': 10},
        {'unit': 'minute', 'count': 20},
        {'unit': 'minute', 'count': 30},
        {'unit': 'hour', 'count': 1},
        {'unit': 'hour', 'count': 2},
        {'unit': 'hour', 'count': 3},
        {'unit': 'hour', 'count': 4},
        {'unit': 'hour', 'count': 6},
        {'unit': 'hour', 'count': 12},
        {'unit': 'day', 'count': 1},
        {'unit': 'day', 'count': 2},
        {'unit': 'day', 'count': 4},
        {'unit': 'week', 'count': 1},
        {'unit': 'week', 'count': 2},
        {'unit': 'month', 'count': 1},
        {'unit': 'month', 'count': 2},
        {'unit': 'month', 'count': 3},
        {'unit': 'month', 'count': 6},
        {'unit': 'year', 'count': 1}
      ],
      'maxVisiblePoints': NaN,
      'minPixPerPoint': 1
    },
    'defaultAnnotationSettings': {},
    'defaultPlotSettings': {
      'annotations': {
        'annotationsList': [],
        'zIndex': 2000
      },
      'background': {
        'enabled': false
      },
      'defaultSeriesSettings': {
        'base': {
          'pointWidth': '75%',
          'tooltip': {
            'format': anychart.stockModule.defaultTheme.StockSimpleTooltipFormatter
          },
          'legendItem': {'iconStroke': 'none'}
        },
        'areaLike': {
          'hovered': {
            'markers': {
              'enabled': null
            }
          },
          'selected': {
            'markers': {
              'enabled': null
            }
          }
        },
        'lineLike': {
          'hovered': {
            'markers': {
              'enabled': null
            }
          },
          'selected': {
            'markers': {
              'enabled': null
            }
          }
        },
        'rangeLike': {
          'tooltip': {
            'format': anychart.stockModule.defaultTheme.StockRangeTooltipFormatter
          }
        },
        'candlestick': {
          'tooltip': {
            'format': anychart.stockModule.defaultTheme.StockOHLCTooltipFormatter
          }
        },
        'column': {
          'normal': {
            'stroke': 'none'
          }
        },
        'rangeColumn': {
          'normal': {
            'stroke': 'none'
          }
        },
        'ohlc': {
          'tooltip': {
            'format': anychart.stockModule.defaultTheme.StockOHLCTooltipFormatter
          }
        },
        'stick': {
          'maxPointWidth': '100%'
        },
        'jumpLine': {
          'maxPointWidth': '100%'
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
      'defaultPriceIndicatorSettings': {
        'label': {
          'enabled': true,
          'background': {
            'enabled': true,
            'fill': '#000'
          },
          'fontColor': '#fff',
          'padding': [2, 9],
          'hAlign': 'center',
          'fontSize': '11px'
        },
        'stroke': 'black'
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
          'padding': 5,
          'anchor': 'center-top',
          /**
           * @this {*}
           * @return {string}
           */
          'format': function() {
            var date = this['tickValue'];
            return anychart.format.dateTime(date, anychart.format.getDateTimeFormat(anychart.format.getIntervalIdentifier(this['majorIntervalUnit'])));
          }
        },
        'minorLabels': {
          'enabled': true,
          'anchor': 'center-top',
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
          'format': function() {
            var date = this['tickValue'];
            return anychart.format.dateTime(date, anychart.format.getDateTimeFormat(anychart.format.getIntervalIdentifier(this['minorIntervalUnit'], this['majorIntervalUnit'])));
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
        'titleFormat': function() {
          var date = this['value'];
          return anychart.format.dateTime(date, anychart.format.getDateTimeFormat(anychart.format.getIntervalIdentifier(this['dataIntervalUnit'], void 0, 'full')));
        },
        'align': 'left',
        'padding': 10,
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
          'padding': 0,
          'orientation': 'left',
          'align': 'left',
          'hAlign': 'left',
          'rotation': 0,
          'wordBreak': 'break-all'
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
          'type': 'linear'
        }
      ],
      'yScale': 0,
      'zIndex': 10,
      'yAxes': [{}],
      'crosshair': {
        'zIndex': 201,
        'enabled': null
      }
    },
    'padding': [20, 30, 20, 60],
    'plots': [{}],
    'scroller': {
      'defaultSeriesSettings': {
        'base': {
          'normal': {
            'fill': anychart.stockModule.defaultTheme.stockScrollerUnselected,
            'stroke': anychart.stockModule.defaultTheme.stockScrollerUnselected,
            'lowStroke': anychart.stockModule.defaultTheme.stockScrollerUnselected,
            'highStroke': anychart.stockModule.defaultTheme.stockScrollerUnselected
          },
          'selected': {
            'fill': anychart.core.defaultTheme.returnSourceColor,
            'stroke': anychart.core.defaultTheme.returnSourceColor,
            'lowStroke': anychart.core.defaultTheme.returnSourceColor,
            'highStroke': anychart.core.defaultTheme.returnSourceColor
          },
          'pointWidth': '75%'
        },
        'marker': {
          'normal': {
            'fill': anychart.stockModule.defaultTheme.stockScrollerUnselected,
            'stroke': anychart.stockModule.defaultTheme.stockScrollerUnselected
          },
          'selected': {
            'fill': anychart.core.defaultTheme.returnSourceColor,
            'stroke': anychart.core.defaultTheme.returnSourceColor
          }
        },
        'areaLike': {
          'normal': {
            'fill': anychart.stockModule.defaultTheme.stockScrollerUnselected
          }
        },
        'barLike': {
          'normal': {
            'fill': anychart.stockModule.defaultTheme.stockScrollerUnselected
          }
        },
        'candlestick': {
          'normal': {
            'risingFill': anychart.stockModule.defaultTheme.stockScrollerUnselected,
            'risingStroke': anychart.stockModule.defaultTheme.stockScrollerUnselected,
            'fallingFill': anychart.stockModule.defaultTheme.stockScrollerUnselected,
            'fallingStroke': anychart.stockModule.defaultTheme.stockScrollerUnselected
          },
          'selected': {
            'risingFill': anychart.core.defaultTheme.risingColor,
            'risingStroke': anychart.core.defaultTheme.risingColor,
            'fallingFill': anychart.core.defaultTheme.fallingColor,
            'fallingStroke': anychart.core.defaultTheme.fallingColor
          }
        },
        'ohlc': {
          'normal': {
            'risingStroke': anychart.stockModule.defaultTheme.stockScrollerUnselected,
            'fallingStroke': anychart.stockModule.defaultTheme.stockScrollerUnselected
          },
          'selected': {
            'risingStroke': anychart.core.defaultTheme.risingColor,
            'fallingStroke': anychart.core.defaultTheme.fallingColor
          }
        },
        'stick': {
          'normal': {
            'stroke': anychart.stockModule.defaultTheme.stockScrollerUnselected
          },
          'selected': {
            'stroke': anychart.core.defaultTheme.returnStrokeSourceColor1
          }
        },
        'jumpLine': {
          'normal': {
            'stroke': anychart.stockModule.defaultTheme.stockScrollerUnselected
          },
          'selected': {
            'stroke': anychart.core.defaultTheme.returnStrokeSourceColor1
          }
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
          'padding': 5,
          'anchor': 'left-top',
          /**
           * @this {*}
           * @return {string}
           */
          'format': function() {
            var date = this['tickValue'];
            return anychart.format.dateTime(date, anychart.format.getDateTimeFormat(anychart.format.getIntervalIdentifier(this['majorIntervalUnit'])));
          }
        },
        'minorLabels': {
          'enabled': true,
          'anchor': 'left-top',
          'fontSize': '11px',
          'padding': 5,
          /**
           * @this {*}
           * @return {string}
           */
          'format': function() {
            var date = this['tickValue'];
            return anychart.format.dateTime(date, anychart.format.getDateTimeFormat(anychart.format.getIntervalIdentifier(this['minorIntervalUnit'], this['majorIntervalUnit'])));
          }
        },
        'zIndex': 75
      }
    },
    'tooltip': {
      'allowLeaveScreen': true,
      'displayMode': 'union',
      'title': {
        'fontSize': 13
      },
      /**
       * @this {*}
       * @return {*}
       */
      'titleFormat': function() {
        var date = this['hoveredDate'];
        return anychart.format.dateTime(date,
            anychart.format.getDateTimeFormat(
                anychart.format.getIntervalIdentifier(
                    this['dataIntervalUnit'], void 0, 'full'
                )));
      }
    },
    'a11y': {
      'titleFormat': anychart.core.defaultTheme.chartA11yTitleFormatter
    },
    'zoomMarqueeFill': '#d3d3d3 0.4',
    'zoomMarqueeStroke': '#d3d3d3',
    'interactivity': {
      'zoomOnMouseWheel': false,
      'scrollOnMouseWheel': false
    },
    'crosshair': {
      'enabled': true,
      'displayMode': 'sticky',
      'xStroke': anychart.core.defaultTheme.colorStrokeExtraBright,
      'yStroke': anychart.core.defaultTheme.colorStrokeExtraBright
    }
  }
});
