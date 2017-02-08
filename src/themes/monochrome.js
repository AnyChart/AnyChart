goog.provide('anychart.themes.monochrome');


(function() {
  var global = this;
  var stockScrollerUnselected = '#999 0.6';


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
  var returnDarkenSourceColor = function() {
    return global['anychart']['color']['darken'](this['sourceColor']);
  };


  /**
   * @this {*}
   * @return {*}
   */
  var returnLightenSourceColor = function() {
    return global['anychart']['color']['lighten'](this['sourceColor']);
  };


  global['anychart'] = global['anychart'] || {};
  global['anychart']['themes'] = global['anychart']['themes'] || {};
  global['anychart']['themes']['monochrome'] = {
    'palette': {
      'type': 'distinct',
      'items': ['#252525', '#636363', '#898989', '#acacac', '#e1e1e1']
    },
    'defaultOrdinalColorScale': {
      'autoColors': function(rangesCount) {
        return global['anychart']['color']['blendedHueProgression']('#e1e1e1', '#707070', rangesCount);
      }
    },
    'defaultLinearColorScale': {'colors': ['#e1e1e1', '#707070']},
    'defaultFontSettings': {
      'fontFamily': 'Verdana, Geneva, sans-serif',
      'fontColor': '#959595'
    },
    'defaultBackground': {
      'fill': '#ffffff',
      'stroke': '#ffffff',
      'cornerType': 'round',
      'corners': 0
    },
    'defaultAxis': {
      'stroke': '#d7d7d7',
      'ticks': {
        'stroke': '#d7d7d7'
      },
      'minorTicks': {
        'stroke': '#ebebeb'
      }
    },
    'defaultGridSettings': {
      'stroke': '#d7d7d7'
    },
    'defaultMinorGridSettings': {
      'stroke': '#ebebeb'
    },
    'defaultTooltip': {
      'title': {
        'fontColor': '#212121',
        'padding': {'bottom': 10},
        'fontSize': 14
      },
      'separator': {
        'enabled': false
      },
      'fontColor': '#464646',
      'fontSize': 13,
      'background': {
        'fill': '#e1e1e1 0.9',
        'stroke': '#ffffff',
        'corners': 5
      },
      'padding': {'top': 8, 'right': 15, 'bottom': 10, 'left': 15}
    },
    'chart': {
      'defaultSeriesSettings': {
        'base': {
          'selectFill': '#bdbdbd',
          'selectHatchFill': {
            'type': 'percent20',
            'color': '#212121'
          },
          'selectStroke': '1.5 #212121'
        },
        'lineLike': {
          'selectStroke': '3 #212121',
          'markers': {'enabled': true},
          'selectMarkers': {
            'enabled': true,
            'fill': '#bdbdbd',
            'stroke': '1.5 #212121'
          }
        },
        'areaLike': {
          'selectStroke': '3 #212121',
          'selectMarkers': {
            'enabled': true,
            'fill': '#bdbdbd',
            'stroke': '1.5 #212121'
          }
        },
        'candlestick': {
          'risingFill': '#252525',
          'risingStroke': '#252525',
          'hoverRisingFill': returnLightenSourceColor,
          'hoverRisingStroke': returnDarkenSourceColor,
          'fallingFill': '#acacac',
          'fallingStroke': '#acacac',
          'hoverFallingFill': returnLightenSourceColor,
          'hoverFallingStroke': returnDarkenSourceColor,
          'selectRisingStroke': '3 #252525',
          'selectFallingStroke': '3 #acacac',
          'selectRisingFill': '#333333 0.85',
          'selectFallingFill': '#333333 0.85'
        },
        'ohlc': {
          'risingStroke': '#252525',
          'hoverRisingStroke': returnDarkenSourceColor,
          'fallingStroke': '#acacac',
          'hoverFallingStroke': returnDarkenSourceColor,
          'selectRisingStroke': '3 #252525',
          'selectFallingStroke': '3 #acacac',
          'markers': {'enabled': false}
        }
      }
    },
    'pieFunnelPyramidBase': {
      'labels': {
        'fontColor': null
      },
      'connectorStroke': '#d7d7d7',
      'outsideLabels': {'autoColor': '#959595'},
      'insideLabels': {'autoColor': '#fff'},
      'selectFill': '#bdbdbd',
      'selectStroke': '1.5 #212121',
      'selectHatchFill': {
        'type': 'percent20',
        'color': '#212121'
      }
    },
    'map': {
      'unboundRegions': {'enabled': true, 'fill': '#F7F7F7', 'stroke': '#B9B9B9'},
      'defaultSeriesSettings': {
        'base': {
          'labels': {
            'fontColor': '#fafafa'
          }
        },
        'connector': {
          'selectStroke': '1.5 #000',
          'stroke': '1.5 #252525',
          'markers': {
            'fill': '#252525',
            'stroke': '1.5 #F7F7F7'
          },
          'hoverMarkers': {
            'fill': '#252525',
            'stroke': '1.5 #F7F7F7'
          },
          'selectMarkers': {
            'fill': '#000',
            'stroke': '1.5 #F7F7F7'
          }
        },
        'marker': {
          'labels': {
            'fontColor': '#000'
          }
        }
      }
    },
    'sparkline': {
      'padding': 0,
      'background': {'stroke': '#ffffff'},
      'defaultSeriesSettings': {
        'area': {
          'stroke': '1.5 #252525',
          'fill': '#252525 0.5'
        },
        'column': {
          'fill': '#252525',
          'negativeFill': '#acacac'
        },
        'line': {
          'stroke': '1.5 #252525'
        },
        'winLoss': {
          'fill': '#252525',
          'negativeFill': '#acacac'
        }
      }
    },
    'bullet': {
      'background': {'stroke': '#ffffff'},
      'defaultMarkerSettings': {
        'fill': '#252525',
        'stroke': '2 #252525'
      }
    },
    'heatMap': {
      'stroke': '1 #ffffff',
      'hoverStroke': '1.5 #ffffff',
      'selectStroke': '2 #212121',
      'selectFill': '#bdbdbd',
      'selectHatchFill': {
        'type': 'percent20',
        'color': '#212121'
      },
      'labels': {
        'fontColor': '#212121'
      }
    },
    'treeMap': {
      'headers': {
        'background': {
          'enabled': true,
          'fill': '#F7F7F7',
          'stroke': '#B9B9B9'
        }
      },
      'hoverHeaders': {
        'fontColor': '#959595',
        'background': {
          'fill': '#B9B9B9',
          'stroke': '#B9B9B9'
        }
      },
      'labels': {
        'fontColor': '#212121'
      },
      'selectLabels': {
        'fontColor': '#fafafa'
      },
      'stroke': '#B9B9B9',
      'selectStroke': '2 #eceff1'
    },
    'stock': {
      'padding': [20, 30, 20, 60],
      'defaultPlotSettings': {
        'xAxis': {
          'background': {
            'fill': '#B9B9B9 0.5',
            'stroke': '#B9B9B9'
          }
        }
      },
      'scroller': {
        'fill': 'none',
        'selectedFill': '#B9B9B9 0.5',
        'outlineStroke': '#B9B9B9',
        'defaultSeriesSettings': {
          'base': {
            'color': '#252525 0.6',
            'fill': stockScrollerUnselected,
            'stroke': stockScrollerUnselected,
            'selectFill': returnSourceColor,
            'selectHatchFill': null,
            'selectStroke': returnSourceColor
          },
          'lineLike': {
            'selectStroke': returnSourceColor,
            'fill': stockScrollerUnselected,
            'stroke': stockScrollerUnselected
          },
          'areaLike': {
            'selectStroke': returnSourceColor,
            'fill': stockScrollerUnselected,
            'stroke': stockScrollerUnselected
          },
          'candlestick': {
            'risingFill': stockScrollerUnselected,
            'risingStroke': stockScrollerUnselected,
            'fallingFill': stockScrollerUnselected,
            'fallingStroke': stockScrollerUnselected,
            'selectRisingStroke': returnSourceColor,
            'selectFallingStroke': returnSourceColor,
            'selectRisingFill': returnSourceColor,
            'selectFallingFill': returnSourceColor
          },
          'ohlc': {
            'risingStroke': stockScrollerUnselected,
            'fallingStroke': stockScrollerUnselected,
            'selectRisingStroke': returnSourceColor,
            'selectFallingStroke': returnSourceColor
          }
        }
      }
    }
  };
}).call(this);
