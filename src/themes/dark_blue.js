goog.provide('anychart.themes.dark_blue');


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
  global['anychart']['themes']['darkBlue'] = {
    'palette': {
      'type': 'distinct',
      'items': ['#40c4ff', '#0288d1', '#9fa8da', '#5c6bc0', '#7e57c2', '#54dbdf', '#15a9c7', '#00897b', '#304ffe', '#0179be']
    },
    'defaultOrdinalColorScale': {
      'autoColors': function(rangesCount) {
        return global['anychart']['color']['blendedHueProgression']('#40c4ff', '#0179be', rangesCount);
      }
    },
    'defaultLinearColorScale': {'colors': ['#40c4ff', '#0179be']},
    'defaultFontSettings': {
      'fontFamily': '"Lucida Console", Monaco, monospace',
      'fontColor': '#b0bec5',
      'fontSize': 12
    },
    'defaultBackground': {
      'fill': '#37474f',
      'stroke': '#263238',
      'cornerType': 'round',
      'corners': 0
    },
    'defaultAxis': {
      'stroke': '#546e7a',
      'ticks': {
        'stroke': '#546e7a'
      },
      'minorTicks': {
        'stroke': '#455a64'
      }
    },
    'defaultGridSettings': {
      'stroke': '#546e7a'
    },
    'defaultMinorGridSettings': {
      'stroke': '#455a64'
    },
    'defaultSeparator': {
      'fill': '#546e7a'
    },
    'defaultTooltip': {
      'background': {
        'fill': '#37474f 0.9',
        'corners': 3
      },
      'fontColor': '#90a4ae',
      'fontSize': 12,
      'title': {
        'align': 'center',
        'fontSize': 14
      },
      'padding': {'top': 10, 'right': 15, 'bottom': 10, 'left': 15},
      'separator': {
        'margin': {'top': 10, 'right': 10, 'bottom': 10, 'left': 10}
      }
    },
    'defaultColorRange': {
      'stroke': '#546e7a',
      'ticks': {
        'stroke': '#546e7a', 'position': 'outside', 'length': 7, 'enabled': true
      },
      'minorTicks': {
        'stroke': '#546e7a', 'position': 'outside', 'length': 5, 'enabled': true
      },
      'marker': {
        'padding': {'top': 3, 'right': 3, 'bottom': 3, 'left': 3},
        'fill': '#b0bec5',
        'hoverFill': '#b0bec5'
      }
    },
    'defaultScroller': {
      'fill': '#455a64',
      'selectedFill': '#546e7a',
      'thumbs': {
        'fill': '#78909c',
        'stroke': '#455a64',
        'hoverFill': '#90a4ae',
        'hoverStroke': '#546e7a'
      }
    },
    'chart': {
      'defaultSeriesSettings': {
        'base': {
          'selectStroke': '1.5 #878f96',
          'selectMarkers': {
            'stroke': '1.5 #878f96'
          }
        },
        'lineLike': {
          'selectStroke': '3 #878f96'
        },
        'areaLike': {
          'selectStroke': '3 #878f96'
        },
        'marker': {
          'selectStroke': '1.5 #878f96'
        },
        'candlestick': {
          'risingFill': '#0179be',
          'risingStroke': '#0179be',
          'hoverRisingFill': returnLightenSourceColor,
          'hoverRisingStroke': returnDarkenSourceColor,
          'fallingFill': '#40c4ff',
          'fallingStroke': '#40c4ff',
          'hoverFallingFill': returnLightenSourceColor,
          'hoverFallingStroke': returnLightenSourceColor,
          'selectRisingStroke': '3 #0179be',
          'selectFallingStroke': '3 #40c4ff',
          'selectRisingFill': '#333333 0.85',
          'selectFallingFill': '#333333 0.85'
        },
        'ohlc': {
          'risingStroke': '#0179be',
          'hoverRisingStroke': returnLightenSourceColor,
          'fallingStroke': '#40c4ff',
          'hoverFallingStroke': returnLightenSourceColor,
          'selectRisingStroke': '3 #0179be',
          'selectFallingStroke': '3 #40c4ff'
        }
      },
      'title': {
        'fontSize': 14
      },
      'padding': {'top': 20, 'right': 25, 'bottom': 15, 'left': 15}
    },
    'cartesianBase': {
      'defaultSeriesSettings': {
        'box': {
          'selectMedianStroke': '#878f96',
          'selectStemStroke': '#878f96',
          'selectWhiskerStroke': '#878f96',
          'selectOutlierMarkers': {
            'enabled': null,
            'size': 4,
            'fill': '#878f96',
            'stroke': '#878f96'
          }
        }
      }
    },
    'pieFunnelPyramidBase': {
      'labels': {
        'fontColor': null
      },
      'selectStroke': '1.5 #878f96',
      'connectorStroke': '#546e7a',
      'outsideLabels': {'autoColor': '#b0bec5'},
      'insideLabels': {'autoColor': '#212121'}
    },
    'map': {
      'unboundRegions': {'enabled': true, 'fill': '#455a64', 'stroke': '#546e7a'},
      'defaultSeriesSettings': {
        'base': {
          'labels': {
            'fontColor': '#212121'
          },
          'selectStroke': '3 #878f96'
        },
        'connector': {
          'selectStroke': '1.5 #000',
          'markers': {
            'stroke': '1.5 #455a64'
          },
          'hoverMarkers': {
            'stroke': '1.5 #455a64'
          },
          'selectMarkers': {
            'stroke': '1.5 #455a64',
            'fill': '#000'
          }
        },
        'bubble': {
          'stroke': returnLightenSourceColor
        },
        'marker': {
          'labels': {
            'fontColor': '#b0bec5'
          }
        }
      }
    },
    'sparkline': {
      'padding': 0,
      'background': {'stroke': '#37474f'},
      'defaultSeriesSettings': {
        'area': {
          'stroke': '1.5 #40c4ff',
          'fill': '#40c4ff 0.5'
        },
        'column': {
          'fill': '#40c4ff',
          'negativeFill': '#0179be'
        },
        'line': {
          'stroke': '1.5 #40c4ff'
        },
        'winLoss': {
          'fill': '#40c4ff',
          'negativeFill': '#0179be'
        }
      }
    },
    'bullet': {
      'background': {'stroke': '#37474f'},
      'padding': {'top': 5, 'right': 10, 'bottom': 5, 'left': 10},
      'margin': {'top': 0, 'right': 0, 'bottom': 0, 'left': 0},
      'defaultMarkerSettings': {
        'fill': '#40c4ff',
        'stroke': '2 #40c4ff'
      },
      'rangePalette': {
        'items': ['#b0bec5', '#90a4ae', '#78909c', '#546e7a', '#455a64']
      }
    },
    'heatMap': {
      'stroke': '#37474f',
      'hoverStroke': '1.5 #37474f',
      'selectStroke': '1.5 #878f96',
      'labels': {
        'fontColor': '#212121'
      }
    },
    'treeMap': {
      'headers': {
        'background': {
          'enabled': true,
          'fill': '#455a64',
          'stroke': '#546e7a'
        }
      },
      'hoverHeaders': {
        'fontColor': '#b0bec5',
        'background': {
          'fill': '#546e7a',
          'stroke': '#546e7a'
        }
      },
      'labels': {
        'fontColor': '#212121'
      },
      'selectLabels': {
        'fontColor': '#fafafa'
      },
      'stroke': '#546e7a',
      'selectStroke': '2 #878f96'
    },
    'stock': {
      'padding': [20, 30, 20, 60],
      'defaultPlotSettings': {
        'xAxis': {
          'background': {
            'fill': '#455a64 0.3',
            'stroke': '#546e7a'
          }
        }
      },
      'scroller': {
        'fill': 'none',
        'selectedFill': '#455a64 0.3',
        'outlineStroke': '#546e7a',
        'defaultSeriesSettings': {
          'base': {
            'color': '#40c4ff 0.5',
            'selectStroke': returnSourceColor
          },
          'lineLike': {
            'selectStroke': returnSourceColor
          },
          'areaLike': {
            'selectStroke': returnSourceColor
          },
          'marker': {
            'selectStroke': returnSourceColor
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
