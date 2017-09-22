goog.provide('anychart.themes.wines');


(function() {
  var global = this;
  var stockScrollerUnselected = '#999';


  /**
   * @this {*}
   * @return {*}
   */
  var returnSourceColor60 = function() {
    return global['anychart']['color']['setOpacity'](this['sourceColor'], 0.6, true);
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
  global['anychart']['themes']['wines'] = {
    'palette': {
      'type': 'distinct',
      'items': ['#6f3448', '#857600', '#f1a122', '#a50b01', '#400001', '#a98b80', '#c08081', '#86614e', '#c26364', '#615060']
    },
    'defaultOrdinalColorScale': {
      'autoColors': function(rangesCount) {
        return global['anychart']['color']['blendedHueProgression']('#f1a122', '#a50b01', rangesCount);
      }
    },
    'defaultLinearColorScale': {'colors': ['#f1a122', '#a50b01']},
    'defaultFontSettings': {
      'fontColor': '#3e2723'
    },
    'defaultBackground': {
      'fill': {
        'src': 'https://cdn.anychart.com/images/themes/brickwall.png',
        'mode': 'tile'
      },
      'stroke': '#e3e3e3',
      'cornerType': 'round',
      'corners': 3
    },
    'defaultSeparator': {
      'fill': '#CECECE'
    },
    'defaultTooltip': {
      'background': {
        'fill': '#e3e3e3',
        'stroke': '#d4d4d4'
      },
      'padding': {'top': 8, 'right': 15, 'bottom': 10, 'left': 15}
    },
    'defaultColorRange': {
      'stroke': '#bdbdbd',
      'ticks': {
        'stroke': '#bdbdbd', 'position': 'outside', 'length': 7, 'enabled': true
      },
      'minorTicks': {
        'stroke': '#bdbdbd', 'position': 'outside', 'length': 5, 'enabled': true
      },
      'marker': {
        'padding': {'top': 3, 'right': 3, 'bottom': 3, 'left': 3},
        'fill': '#37474f'
      }
    },
    'defaultScroller': {
      'fill': '#e3e3e3',
      'selectedFill': '#d0d0d0',
      'thumbs': {
        'fill': '#F9FAFB',
        'stroke': '#bdc8ce',
        'hovered': {
          'fill': '#bdc8ce',
          'stroke': '#e9e4e4'
        }
      }
    },
    'defaultGridSettings': {
      'stroke': '#9e9e9e 0.4'
    },
    'defaultMinorGridSettings': {
      'stroke': '#bdbdbd 0.4'
    },
    'chart': {
      'padding': {'top': 20, 'right': 25, 'bottom': 15, 'left': 15},
      'defaultSeriesSettings': {
        'candlestick': {
          'normal': {
            'risingFill': '#6f3448',
            'risingStroke': '#6f3448',
            'fallingFill': '#f1a122',
            'fallingStroke': '#f1a122'
          },
          'hovered': {
            'risingFill': returnLightenSourceColor,
            'risingStroke': returnDarkenSourceColor,
            'fallingFill': returnLightenSourceColor,
            'fallingStroke': returnDarkenSourceColor
          },
          'selected': {
            'risingStroke': '3 #6f3448',
            'fallingStroke': '3 #f1a122',
            'risingFill': '#333333 0.85',
            'fallingFill': '#333333 0.85'
          }
        },
        'ohlc': {
          'normal': {
            'risingStroke': '#6f3448',
            'fallingStroke': '#f1a122'
          },
          'hovered': {
            'risingStroke': returnDarkenSourceColor,
            'fallingStroke': returnDarkenSourceColor
          },
          'selected': {
            'risingStroke': '3 #6f3448',
            'fallingStroke': '3 #f1a122'
          }
        }
      }
    },
    'map': {
      'unboundRegions': {'enabled': true, 'fill': '#e3e3e3', 'stroke': '#bdbdbd'},
      'defaultSeriesSettings': {
        'base': {
          'normal': {
            'stroke': returnDarkenSourceColor,
            'labels': {
              'fontColor': '#212121'
            }
          }
        },
        'connector': {
          'normal': {
            'stroke': '1.5 #6f3448',
            'markers': {
              'stroke': '1.5 #e3e3e3',
              'fill': '#857600'
            }
          },
          'hovered': {
            'stroke': '1.5 #37474f',
            'markers': {
              'fill': '#857600'
            }
          },
          'selected': {
            'stroke': '1.5 #000',
            'markers': {
              'fill': '#000'
            }
          }
        }
      }
    },
    'sparkline': {
      'padding': 0,
      'background': {'stroke': '#e3e3e3'},
      'defaultSeriesSettings': {
        'area': {
          'stroke': '1.5 #6f3448',
          'fill': '#6f3448 0.5'
        },
        'column': {
          'fill': '#6f3448',
          'negativeFill': '#f1a122'
        },
        'line': {
          'stroke': '1.5 #6f3448'
        },
        'winLoss': {
          'fill': '#6f3448',
          'negativeFill': '#f1a122'
        }
      }
    },
    'bullet': {
      'background': {'stroke': '#e3e3e3'},
      'defaultMarkerSettings': {
        'fill': '#6f3448',
        'stroke': '2 #6f3448'
      },
      'padding': {'top': 5, 'right': 10, 'bottom': 5, 'left': 10},
      'margin': {'top': 0, 'right': 0, 'bottom': 0, 'left': 0},
      'rangePalette': {
        'items': ['#868686', '#969696', '#A6A6A6', '#BCBCBC', '#D2D2D2']
      }
    },
    'heatMap': {
      'normal': {
        'stroke': '1 #e3e3e3',
        'labels': {
          'fontColor': '#212121'
        }
      },
      'hovered': {
        'stroke': '1.5 #e3e3e3'
      },
      'selected': {
        'stroke': '2 #e3e3e3'
      }
    },
    'treeMap': {
      'normal': {
        'headers': {
          'background': {
            'enabled': true,
            'fill': '#e3e3e3',
            'stroke': '#bdbdbd',
            'cornerType': 'square',
            'corners': 0
          }
        },
        'labels': {
          'fontColor': '#212121'
        },
        'stroke': '#bdbdbd'
      },
      'hovered': {
        'headers': {
          'fontColor': '#3e2723',
          'background': {
            'fill': '#bdbdbd',
            'stroke': '#bdbdbd',
            'cornerType': 'square',
            'corners': 0
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
            'fill': '#e3e3e3 0.5',
            'stroke': '#bdbdbd',
            'cornerType': 'square',
            'corners': 0
          }
        }
      },
      'scroller': {
        'fill': 'none',
        'selectedFill': '#e3e3e3 0.5',
        'outlineStroke': '#bdbdbd',
        'defaultSeriesSettings': {
          'base': {
            'selected': {
              'stroke': returnSourceColor60
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
              'risingStroke': returnSourceColor60,
              'fallingStroke': returnSourceColor60,
              'risingFill': returnSourceColor60,
              'FallingFill': returnSourceColor60
            }
          },
          'ohlc': {
            'normal': {
              'risingStroke': stockScrollerUnselected,
              'fallingStroke': stockScrollerUnselected
            },
            'selected': {
              'risingStroke': returnSourceColor60,
              'fallingStroke': returnSourceColor60
            }
          }
        }
      },
      'xAxis': {
        'background': {
          'enabled': false
        }
      }
    }
  };
}).call(this);
