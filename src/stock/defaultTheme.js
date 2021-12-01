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
  var val = anychart.core.defaultTheme.locNum(this['value'], this['defaultDecimalDigitsCount'] || undefined);
  return this['seriesName'] + ': ' + this['valuePrefix'] + val + this['valuePostfix'];
};


/**
 * @this {*}
 * @return {*}
 */
anychart.stockModule.defaultTheme.StockRangeTooltipFormatter = function() {
  var digits = this['defaultDecimalDigitsCount'] || undefined;
  return this['seriesName'] + ':\n' +
      '  High: ' + anychart.core.defaultTheme.locNum(this['high'], digits) + '\n' +
      '  Low: ' + anychart.core.defaultTheme.locNum(this['low'], digits);
};


/**
 * @this {*}
 * @return {*}
 */
anychart.stockModule.defaultTheme.StockOHLCTooltipFormatter = function() {
  var digits = this['defaultDecimalDigitsCount'] || undefined;
  return this['seriesName'] + ':\n' +
      '  Open: ' + anychart.core.defaultTheme.locNum(this['open'], digits) + '\n' +
      '  High: ' + anychart.core.defaultTheme.locNum(this['high'], digits) + '\n' +
      '  Low: ' + anychart.core.defaultTheme.locNum(this['low'], digits) + '\n' +
      '  Close: ' + anychart.core.defaultTheme.locNum(this['close'], digits);
};


/**
 * @this {*}
 * @return {*}
 */
anychart.stockModule.defaultTheme.StockSeriesLabelFormatter = function() {
  var date = this['x'];
  return anychart.format.dateTime(date, anychart.format.getDateTimeFormat(anychart.format.getIntervalIdentifier(this['dataIntervalUnit'], void 0, 'full')));
};


/**
 * @this {*}
 * @return {*}
 */
anychart.stockModule.defaultTheme.stockTitleFormatter = function() {
  var date = this['hoveredDate'];
  return anychart.format.dateTime(date,
      anychart.format.getDateTimeFormat(
          anychart.format.getIntervalIdentifier(
              this['dataIntervalUnit'], void 0, 'full'
          )));
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
      'defaultLineMarkerSettings': {
        'zIndex': 200.2
      },
      'defaultTextMarkerSettings': {
        'zIndex': 200.3
      },
      'annotations': {
        'annotationsList': [],
        'zIndex': 2000
      },
      'background': {
        'enabled': false
      },
      'title': {
        'text': 'Plot Title',
        'padding': [5, 5, 2, 5],
        'fontSize': 12
      },
      'defaultSeriesSettings': {
        'base': {
          'pointWidth': '75%',
          'tooltip': {
            'format': anychart.stockModule.defaultTheme.StockSimpleTooltipFormatter,
            'titleFormat': anychart.stockModule.defaultTheme.stockTitleFormatter
          },
          'legendItem': {'iconStroke': 'none'},
          'normal': {
            'labels': {
              'offsetY': 10
            }
          }
        },
        'areaLike': {
          'normal': {
            'labels': {
              'format': anychart.stockModule.defaultTheme.StockSeriesLabelFormatter
            }
          },
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
          'normal': {
            'labels': {
              'format': anychart.stockModule.defaultTheme.StockSeriesLabelFormatter
            }
          },
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
          'normal': {
            'labels': {
              'format': anychart.stockModule.defaultTheme.StockSeriesLabelFormatter
            }
          },
          'tooltip': {
            'format': anychart.stockModule.defaultTheme.StockRangeTooltipFormatter
          }
        },
        'candlestick': {
          'normal': {
            'labels': {
              'format': anychart.stockModule.defaultTheme.StockSeriesLabelFormatter
            }
          },
          'tooltip': {
            'format': anychart.stockModule.defaultTheme.StockOHLCTooltipFormatter
          }
        },
        'column': {
          'normal': {
            'labels': {
              'format': anychart.stockModule.defaultTheme.StockSeriesLabelFormatter
            },
            'stroke': 'none'
          }
        },
        'rangeColumn': {
          'normal': {
            'labels': {
              'format': anychart.stockModule.defaultTheme.StockSeriesLabelFormatter
            },
            'stroke': 'none'
          }
        },
        'ohlc': {
          'normal': {
            'labels': {
              'format': anychart.stockModule.defaultTheme.StockSeriesLabelFormatter
            }
          },
          'tooltip': {
            'format': anychart.stockModule.defaultTheme.StockOHLCTooltipFormatter
          }
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
        'showHelperLabel': true,
        'scale': 0,
        'ticks': {
          'enabled': false,
          'position': 'center'
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
            var date = this['dataValue'];
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
            var date = this['dataValue'];
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
        'xLabels': [{'enabled': null}],
        'yLabels': [{'enabled': null}]
      },
      'dataArea': {
        'zIndex': 10,
        'background': {
          'fill': 'none'
        }
      },
      'baseline': 0,
      'weight': null
    },
    'padding': [20, 30, 20, 60],
    'plots': [{}],
    'eventMarkers': {
      'stickToLeft': true,
      'normal': {
        'type': 'circle',
        'width': 22,
        'height': 22,
        'fill': '#515151',
        'stroke': '#515151',
        'fontColor': '#fff',
        'adjustFontSize': true,
        'minFontSize': 6,
        'maxFontSize': 20,
        'fontSize': null,
        'format': 'A',
        'hAlign': 'center',
        'vAlign': 'middle',
        'fontPadding': 2,
        'connector': {
          'length': 5,
          'stroke': '#455a64'
        }
      },
      'hovered': {
        'fill': anychart.core.defaultTheme.returnLightenSourceColor
      },
      'selected': {
        'fill': '#dd2c00'
      },
      'tooltip': {
        'title': {
          'fontColor': '#fff',
          'enabled': true
        },
        /**
         * @this {*}
         * @return {string}
         */
        'titleFormat': function() {
          var date = anychart.format.dateTime(this['date'],
              anychart.format.getDateTimeFormat(
                  anychart.format.getIntervalIdentifier(
                      this['dataIntervalUnit'], void 0, 'full'
                  )));
          return this['title'] ? this['title'] + ' (' + date + ')' : date;
        },
        /**
         * @this {*}
         * @return {string}
         */
        'format': function() {
          return this['description'] || this['symbol'];
        },
        'fontColor': '#fff',
        'separator': true
      },
      'direction': 'auto',
      'position': 'axis',
      'seriesId': '0',
      'fieldName': 'value'
    },
    'scroller': {
      'defaultSeriesSettings': {
        'base': {
          'enabled': true,
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
            var date = this['dataValue'];
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
            var date = this['dataValue'];
            return anychart.format.dateTime(date, anychart.format.getDateTimeFormat(anychart.format.getIntervalIdentifier(this['minorIntervalUnit'], this['majorIntervalUnit'])));
          }
        },
        'ticks': {
          'position': 'center'
        },
        'minorTicks': {
          'enabled': true,
          'stroke': '#cecece',
          'position': 'center'
        },
        'zIndex': 75,
        'showHelperLabel': true
      }
    },
    'splitters': {
      'enabled': true,
      'normal': {
        'stroke': '1 #ddd 0.5'
      },
      'hovered': {
        'stroke': '1 #ddd 0.8'
      },
      'preview': {
        'fill': '#000 0.1'
      }
    },
    'plotsManualBounds': false,
    'tooltip': {
      'allowLeaveScreen': true,
      'displayMode': 'union',
      'title': {
        'fontSize': 13
      },
      'titleFormat': anychart.stockModule.defaultTheme.stockTitleFormatter
    },
    'a11y': {
      'titleFormat': anychart.core.defaultTheme.chartA11yTitleFormatter
    },
    'zoomMarqueeFill': '#d3d3d3 0.4',
    'zoomMarqueeStroke': '#d3d3d3',
    'interactivity': {
      'allowPlotDrag': true,
      'zoomOnMouseWheel': false,
      'scrollOnMouseWheel': false
    },
    'crosshair': {
      'enabled': true,
      'displayMode': 'sticky',
      'xLabels': [{'enabled': null}],
      'yLabels': [{'enabled': null}],
      'xStroke': anychart.core.defaultTheme.colorStrokeExtraBright,
      'yStroke': anychart.core.defaultTheme.colorStrokeExtraBright
    }
  }
});
