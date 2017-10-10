goog.provide('anychart.themes.light_turquoise');


(function() {
  var global = this;
  var stockScrollerUnselected = '#999 0.6';


  /**
   * @this {*}
   * @return {*}
   */
  var returnSourceColor50 = function() {
    return global['anychart']['color']['setOpacity'](this['sourceColor'], 0.5, true);
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
  global['anychart']['themes']['lightTurquoise'] = {
    'palette': {
      'type': 'distinct',
      'items': ['#80deea', '#00acc1', '#00838f', '#29b6f6', '#0277bd', '#0277bd', '#8c9eff', '#9575cd', '#ce93d8', '#8e24aa']
    },
    'defaultOrdinalColorScale': {
      'autoColors': function(rangesCount) {
        return global['anychart']['color']['blendedHueProgression']('#b2dfdb', '#00838f', rangesCount);
      }
    },
    'defaultLinearColorScale': {'colors': ['#b2dfdb', '#00838f']},
    'defaultFontSettings': {
      'fontFamily': '"Lucida Console", Monaco, monospace',
      'fontColor': '#424242',
      'fontSize': 12
    },
    'defaultBackground': {
      'fill': '#eeeeee',
      'stroke': '#e0e0e0',
      'cornerType': 'round',
      'corners': 0
    },
    'defaultAxis': {
      'stroke': '#bdbdbd',
      'labels': {
        'enabled': true
      },
      'ticks': {
        'stroke': '#bdbdbd'
      },
      'minorTicks': {
        'stroke': '#e0e0e0'
      }
    },
    'defaultGridSettings': {
      'stroke': '#bdbdbd'
    },
    'defaultMinorGridSettings': {
      'stroke': '#e0e0e0'
    },
    'defaultSeparator': {
      'fill': '#bdbdbd'
    },
    'defaultTooltip': {
      'background': {
        'fill': '#424242 0.9',
        'stroke': '#909090 0.9',
        'corners': 3
      },
      'fontColor': '#e0e0e0',
      'fontSize': 12,
      'title': {
        'fontColor': '#bdbdbd',
        'align': 'center',
        'fontSize': 14
      },
      'padding': {'top': 10, 'right': 15, 'bottom': 10, 'left': 15},
      'separator': {
        'margin': {'top': 10, 'right': 10, 'bottom': 10, 'left': 10}
      }
    },
    'defaultColorRange': {
      'stroke': '#bdbdbd',
      'ticks': {
        'stroke': '#bdbdbd', 'position': 'outside', 'length': 7, 'enabled': true
      },
      'minorTicks': {
        'stroke': '#e0e0e0', 'position': 'outside', 'length': 5, 'enabled': true
      },
      'marker': {
        'padding': {'top': 3, 'right': 3, 'bottom': 3, 'left': 3},
        'fill': '#616161'
      }
    },
    'defaultScroller': {
      'fill': '#e0e0e0',
      'selectedFill': '#bdbdbd',
      'thumbs': {
        'fill': '#bdbdbd',
        'stroke': '#616161',
        'hovered': {
          'fill': '#e0e0e0',
          'stroke': '#757575'
        }
      }
    },
    'chart': {
      'defaultSeriesSettings': {
        'candlestick': {
          'normal': {
            'risingFill': '#80deea',
            'risingStroke': '#80deea',
            'fallingFill': '#00838f',
            'fallingStroke': '#00838f'
          },
          'hovered': {
            'risingFill': returnLightenSourceColor,
            'risingStroke': returnDarkenSourceColor,
            'fallingFill': returnLightenSourceColor,
            'fallingStroke': returnDarkenSourceColor
          },
          'selected': {
            'risingStroke': '3 #80deea',
            'fallingStroke': '3 #00838f',
            'risingFill': '#333333 0.85',
            'fallingFill': '#333333 0.85'
          }
        },
        'ohlc': {
          'normal': {
            'risingStroke': '#80deea',
            'fallingStroke': '#00838f'
          },
          'hovered': {
            'risingStroke': returnDarkenSourceColor,
            'fallingStroke': returnDarkenSourceColor
          },
          'selected': {
            'risingStroke': '3 #80deea',
            'fallingStroke': '3 #00838f'
          }
        }
      },
      'title': {
        'fontSize': 14
      },
      'padding': {'top': 20, 'right': 25, 'bottom': 15, 'left': 15}
    },
    'pieFunnelPyramidBase': {
      'normal': {
        'labels': {
          'fontColor': null
        }
      },
      'connectorStroke': '#757575',
      'outsideLabels': {'autoColor': '#424242'},
      'insideLabels': {'autoColor': '#424242'}
    },
    'cartesianBase': {
      'defaultXAxisSettings': {
        'ticks': {
          'enabled': false
        }
      },
      'defaultYAxisSettings': {
        'ticks': {
          'enabled': false
        }
      },
      'xAxes': [{}],
      'xGrids': [],
      'yGrids': [],
      'yAxes': []
    },
    'financial': {
      'yAxes': [{}]
    },
    'map': {
      'unboundRegions': {'enabled': true, 'fill': '#e0e0e0', 'stroke': '#bdbdbd'},
      'defaultSeriesSettings': {
        'base': {
          'normal': {
            'labels': {
              'fontColor': '#424242'
            }
          }
        },
        'connector': {
          'normal': {
            'markers': {
              'stroke': '1.5 #e0e0e0'
            }
          },
          'hovered': {
            'markers': {
              'stroke': '1.5 #e0e0e0'
            }
          },
          'selected': {
            'stroke': '1.5 #000',
            'markers': {
              'fill': '#000',
              'stroke': '1.5 #e0e0e0'
            }
          }
        },
        'marker': {
          'normal': {
            'stroke': '1.5 #bdbdbd'
          },
          'hovered': {
            'stroke': '1.5 #bdbdbd'
          }
        },
        'bubble': {
          'normal': {
            'stroke': returnDarkenSourceColor
          },
          'hovered': {
            'stroke': '1.5 #bdbdbd'
          }
        }
      }
    },
    'sparkline': {
      'padding': 0,
      'background': {'stroke': '#eeeeee'},
      'defaultSeriesSettings': {
        'area': {
          'stroke': '1.5 #80deea',
          'fill': '#80deea 0.5'
        },
        'column': {
          'fill': '#80deea',
          'negativeFill': '#00838f'
        },
        'line': {
          'stroke': '1.5 #80deea'
        },
        'winLoss': {
          'fill': '#80deea',
          'negativeFill': '#00838f'
        }
      }
    },
    'bullet': {
      'background': {'stroke': '#eeeeee'},
      'defaultMarkerSettings': {
        'fill': '#80deea',
        'stroke': '2 #80deea'
      },
      'padding': {'top': 5, 'right': 10, 'bottom': 5, 'left': 10},
      'margin': {'top': 0, 'right': 0, 'bottom': 0, 'left': 0},
      'rangePalette': {
        'items': ['#A4A4A4', '#8C8C8C', '#797979', '#616161', '#4E4E4E']
      }
    },
    'heatMap': {
      'normal': {
        'stroke': '1 #eeeeee',
        'labels': {
          'fontColor': '#212121'
        }
      },
      'hovered': {
        'stroke': '1.5 #eeeeee'
      },
      'selected': {
        'stroke': '2 #eeeeee'
      }
    },
    'treeMap': {
      'normal': {
        'headers': {
          'background': {
            'enabled': true,
            'fill': '#c7c7c7',
            'stroke': '#bdbdbd'
          }
        },
        'labels': {
          'fontColor': '#212121'
        },
        'stroke': '#bdbdbd'
      },
      'hovered': {
        'headers': {
          'fontColor': '#424242',
          'background': {
            'fill': '#bdbdbd',
            'stroke': '#bdbdbd'
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
            'fill': '#bdbdbd 0.5',
            'stroke': '#bdbdbd'
          }
        }
      },
      'scroller': {
        'fill': 'none',
        'selectedFill': '#bdbdbd 0.5',
        'outlineStroke': '#bdbdbd',
        'defaultSeriesSettings': {
          'base': {
            'selected': {
              'fill': returnSourceColor50,
              'stroke': returnSourceColor50
            }
          },
          'candlestick': {
            'normal': {
              'risingFill': stockScrollerUnselected,
              'risingStroke': stockScrollerUnselected,
              'fallingFill': stockScrollerUnselected,
              'fallingStroke': stockScrollerUnselected
            },
            'selected': {
              'risingStroke': returnSourceColor50,
              'fallingStroke': returnSourceColor50,
              'risingFill': returnSourceColor50,
              'fallingFill': returnSourceColor50
            }
          },
          'ohlc': {
            'normal': {
              'risingStroke': stockScrollerUnselected,
              'fallingStroke': stockScrollerUnselected
            },
            'selected': {
              'risingStroke': returnSourceColor50,
              'fallingStroke': returnSourceColor50
            }
          }
        }
      }
    }
  };
}).call(this);
