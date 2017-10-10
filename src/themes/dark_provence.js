goog.provide('anychart.themes.dark_provence');


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
  global['anychart']['themes']['darkProvence'] = {
    'palette': {
      'type': 'distinct',
      'items': ['#aa8ab3', '#b7cbe2', '#cdd18e', '#938d9c', '#6f5264', '#96246a', '#519790', '#6aabcc', '#61687d', '#7b8030']
    },
    'defaultOrdinalColorScale': {
      'autoColors': function(rangesCount) {
        return global['anychart']['color']['blendedHueProgression']('#b7cbe2', '#574774', rangesCount);
      }
    },
    'defaultLinearColorScale': {'colors': ['#b7cbe2', '#574774']},
    'defaultFontSettings': {
      'fontFamily': '"Source Sans Pro", sans-serif',
      'fontSize': 13,
      'fontColor': '#b2aab5'
    },
    'defaultBackground': {
      'fill': '#464646',
      'stroke': '#363636',
      'cornerType': 'round',
      'corners': 0
    },
    'defaultAxis': {
      'stroke': '#5f5b61 0.8',
      'title': {
        'fontSize': 15
      },
      'ticks': {
        'stroke': '#5f5b61 0.8'
      },
      'minorTicks': {
        'stroke': '#534f54 0.8'
      }
    },
    'defaultGridSettings': {
      'stroke': '#5f5b61 0.8'
    },
    'defaultMinorGridSettings': {
      'stroke': '#534f54 0.8'
    },
    'defaultSeparator': {
      'fill': '#5f5b61'
    },
    'defaultTooltip': {
      'title': {
        'fontColor': '#745c65',
        'padding': {'bottom': 5},
        'fontSize': 15
      },
      'separator': {
        'enabled': false
      },
      'fontColor': '#997f89',
      'fontSize': 13,
      'background': {
        'fill': '#ffffff 0.9',
        'stroke': '#b2aab5',
        'corners': 0
      },
      'offsetX': 15,
      'offsetY': 0,
      'padding': {'top': 5, 'right': 15, 'bottom': 5, 'left': 15}
    },
    'defaultColorRange': {
      'stroke': '#8e8691',
      'ticks': {
        'stroke': '#8e8691', 'position': 'outside', 'length': 7, 'enabled': true
      },
      'minorTicks': {
        'stroke': '#8e8691', 'position': 'outside', 'length': 5, 'enabled': true
      },
      'marker': {
        'padding': {'top': 3, 'right': 3, 'bottom': 3, 'left': 3},
        'fill': '#b2aab5'
      }
    },
    'defaultScroller': {
      'fill': '#616161',
      'selectedFill': '#757575',
      'thumbs': {
        'fill': '#b2aab5',
        'stroke': '#616161',
        'hovered': {
          'fill': '#cec6d1',
          'stroke': '#757575'
        }
      }
    },
    'defaultLegend': {
      'fontSize': 13
    },
    'chart': {
      'defaultSeriesSettings': {
        'base': {
          'selected': {
            'stroke': '1.5 #fafafa',
            'markers': {
              'stroke': '1.5 #fafafa'
            }
          }
        },
        'lineLike': {
          'selected': {
            'stroke': '3 #fafafa'
          }
        },
        'areaLike': {
          'selected': {
            'stroke': '3 #fafafa'
          }
        },
        'marker': {
          'selected': {
            'stroke': '1.5 #fafafa'
          }
        },
        'candlestick': {
          'normal': {
            'risingFill': '#aa8ab3',
            'risingStroke': '#aa8ab3',
            'fallingFill': '#b7cbe2',
            'fallingStroke': '#b7cbe2'
          },
          'hovered': {
            'risingFill': returnLightenSourceColor,
            'risingStroke': returnDarkenSourceColor,
            'fallingFill': returnLightenSourceColor,
            'fallingStroke': returnDarkenSourceColor
          },
          'selected': {
            'risingStroke': '3 #aa8ab3',
            'fallingStroke': '3 #b7cbe2',
            'risingFill': '#333333 0.85',
            'fallingFill': '#333333 0.85'
          }
        },
        'ohlc': {
          'normal': {
            'risingStroke': '#aa8ab3',
            'fallingStroke': '#b7cbe2'
          },
          'hovered': {
            'risingStroke': returnDarkenSourceColor,
            'fallingStroke': returnDarkenSourceColor
          },
          'selected': {
            'risingStroke': '3 #aa8ab3',
            'fallingStroke': '3 #b7cbe2'
          }
        }
      },
      'title': {
        'fontSize': 17
      },
      'padding': {'top': 20, 'right': 25, 'bottom': 15, 'left': 15}
    },
    'cartesianBase': {
      'defaultSeriesSettings': {
        'box': {
          'selected': {
            'medianStroke': '#fafafa',
            'stemStroke': '#fafafa',
            'whiskerStroke': '#fafafa',
            'uutlierMarkers': {
              'enabled': null,
              'size': 4,
              'fill': '#fafafa',
              'stroke': '#fafafa'
            }
          }
        }
      }
    },
    'pieFunnelPyramidBase': {
      'normal': {
        'labels': {
          'fontColor': null
        }
      },
      'selected': {
        'stroke': '1.5 #fafafa'
      },
      'connectorStroke': '#5f5b61',
      'outsideLabels': {'autoColor': '#b2aab5'},
      'insideLabels': {'autoColor': '#212121'}
    },
    'map': {
      'unboundRegions': {'enabled': true, 'fill': '#616161', 'stroke': '#757575'},
      'defaultSeriesSettings': {
        'base': {
          'normal': {
            'stroke': '#b2aab5',
            'labels': {
              'fontColor': '#212121'
            }
          },
          'hovered': {
            'fill': '#b0bec5'
          },
          'selected': {
            'stroke': '1.5 #fafafa'
          }
        },
        'connector': {
          'normal': {
            'stroke': returnSourceColor,
            'markers': {
              'stroke': '1.5 #616161'
            }
          },
          'hovered': {
            'markers': {
              'stroke': '1.5 #616161'
            }
          },
          'selected': {
            'stroke': '1.5 #000',
            'markers': {
              'fill': '#000',
              'stroke': '1.5 #616161'
            }
          }
        },
        'bubble': {
          'normal': {
            'stroke': returnLightenSourceColor
          }
        },
        'marker': {
          'normal': {
            'labels': {
              'fontColor': '#b2aab5'
            }
          }
        }
      }
    },
    'sparkline': {
      'padding': 0,
      'background': {'stroke': '#464646'},
      'defaultSeriesSettings': {
        'area': {
          'stroke': '1.5 #aa8ab3',
          'fill': '#aa8ab3 0.5'
        },
        'column': {
          'fill': '#aa8ab3',
          'negativeFill': '#b7cbe2'
        },
        'line': {
          'stroke': '1.5 #aa8ab3'
        },
        'winLoss': {
          'fill': '#aa8ab3',
          'negativeFill': '#b7cbe2'
        }
      }
    },
    'bullet': {
      'background': {'stroke': '#464646'},
      'defaultMarkerSettings': {
        'fill': '#aa8ab3',
        'stroke': '2 #aa8ab3'
      },
      'padding': {'top': 5, 'right': 10, 'bottom': 5, 'left': 10},
      'margin': {'top': 0, 'right': 0, 'bottom': 0, 'left': 0},
      'rangePalette': {
        'items': ['#757575', '#696969', '#606060', '#545454', '#4B4B4B']
      }
    },
    'heatMap': {
      'normal': {
        'stroke': '1 #464646',
        'labels': {
          'fontColor': '#212121'
        }
      },
      'hovered': {
        'stroke': '1.5 #464646'
      },
      'selected': {
        'stroke': '2 #fafafa'
      }
    },
    'treeMap': {
      'normal': {
        'headers': {
          'background': {
            'enabled': true,
            'fill': '#616161',
            'stroke': '#414141'
          }
        },
        'labels': {
          'fontColor': '#212121'
        },
        'stroke': '#414141'
      },
      'hovered': {
        'headers': {
          'fontColor': '#b2aab5',
          'background': {
            'fill': '#414141',
            'stroke': '#414141'
          }
        }
      },
      'selected': {
        'labels': {
          'fontColor': '#fafafa'
        },
        'stroke': '2 #eceff1'
      }
    },
    'stock': {
      'padding': [20, 30, 20, 60],
      'defaultPlotSettings': {
        'xAxis': {
          'background': {
            'fill': '#616161 0.3',
            'stroke': '#5f5b61 0.8'
          }
        }
      },
      'scroller': {
        'fill': 'none',
        'selectedFill': '#616161 0.3',
        'outlineStroke': '#5f5b61 0.8',
        'defaultSeriesSettings': {
          'base': {
            'selected': {
              'stroke': returnSourceColor
            }
          },
          'lineLike': {
            'selected': {
              'stroke': returnSourceColor
            }
          },
          'areaLike': {
            'selected': {
              'stroke': returnSourceColor
            }
          },
          'marker': {
            'selected': {
              'stroke': returnSourceColor
            }
          },
          'candlestick': {
            'normal': {
              'risingStroke': stockScrollerUnselected,
              'fallingFill': stockScrollerUnselected,
              'risingFill': stockScrollerUnselected,
              'fallingStroke': stockScrollerUnselected
            }
          },
          'ohlc': {
            'normal': {
              'risingStroke': stockScrollerUnselected,
              'fallingStroke': stockScrollerUnselected
            }
          }
        }
      }
    }
  };
}).call(this);
