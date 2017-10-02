goog.provide('anychart.themes.light_glamour');


(function() {
  var global = this;
  var stockScrollerUnselected = '#999 0.6';


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
  global['anychart']['themes']['lightGlamour'] = {
    'palette': {
      'type': 'distinct',
      'items': ['#f8bbd0', '#ce93d8', '#ab47bc', '#d81b60', '#880e4f', '#ffd600', '#ff6e40', '#03a9f4', '#5e35b1', '#1976d2']
    },
    'defaultOrdinalColorScale': {
      'autoColors': function(rangesCount) {
        return global['anychart']['color']['blendedHueProgression']('#f8bbd0', '#d81b60', rangesCount);
      }
    },
    'defaultLinearColorScale': {'colors': ['#f8bbd0', '#d81b60']},
    'defaultFontSettings': {
      'fontFamily': '"Source Sans Pro", sans-serif',
      'fontSize': 13,
      'fontColor': '#5d1b3e'
    },
    'defaultBackground': {
      'fill': '#fff',
      'stroke': '#ffffff',
      'cornerType': 'round',
      'corners': 0
    },
    'defaultAxis': {
      'stroke': '#d7cacc',
      'title': {
        'fontSize': 15
      },
      'ticks': {
        'stroke': '#d7cacc'
      },
      'minorTicks': {
        'stroke': '#f1eaeb'
      }
    },
    'defaultGridSettings': {
      'stroke': '#d7cacc'
    },
    'defaultMinorGridSettings': {
      'stroke': '#f1eaeb'
    },
    'defaultSeparator': {
      'fill': '#fce4ec'
    },
    'defaultTooltip': {
      'background': {
        'fill': '#fef7f9 0.9',
        'stroke': '2 #fce4ec',
        'corners': 3
      },
      'fontSize': 13,
      'title': {
        'align': 'center',
        'fontSize': 15
      },
      'padding': {'top': 10, 'right': 15, 'bottom': 10, 'left': 15},
      'separator': {
        'margin': {'top': 10, 'right': 10, 'bottom': 10, 'left': 10}
      }
    },
    'defaultColorRange': {
      'stroke': '#d7cacc',
      'ticks': {
        'stroke': '#d7cacc', 'position': 'outside', 'length': 7, 'enabled': true
      },
      'minorTicks': {
        'stroke': '#d7cacc', 'position': 'outside', 'length': 5, 'enabled': true
      },
      'marker': {
        'padding': {'top': 3, 'right': 3, 'bottom': 3, 'left': 3},
        'fill': '#d7cacc'
      }
    },
    'defaultScroller': {
      'fill': '#f4efef',
      'selectedFill': '#ece1e3',
      'thumbs': {
        'fill': '#f4efef',
        'stroke': '#d7cacc',
        'hovered': {
          'fill': '#d7cacc',
          'stroke': '#beafb1'
        }
      }
    },
    'defaultLegend': {
      'fontSize': 13
    },
    'chart': {
      'defaultSeriesSettings': {
        'candlestick': {
          'normal': {
            'risingFill': '#f8bbd0',
            'risingStroke': '#f8bbd0',
            'fallingFill': '#880e4f',
            'fallingStroke': '#880e4f'
          },
          'hovered': {
            'risingFill': returnLightenSourceColor,
            'risingStroke': returnDarkenSourceColor,
            'fallingFill': returnLightenSourceColor,
            'fallingStroke': returnDarkenSourceColor
          },
          'selected': {
            'risingStroke': '3 #f8bbd0',
            'fallingStroke': '3 #880e4f',
            'risingFill': '#333333 0.85',
            'fallingFill': '#333333 0.85'
          }
        },
        'ohlc': {
          'normal': {
            'risingStroke': '#f8bbd0',
            'fallingStroke': '#880e4f'
          },
          'hovered': {
            'risingStroke': returnDarkenSourceColor,
            'fallingStroke': returnDarkenSourceColor
          },
          'selected': {
            'risingStroke': '3 #f8bbd0',
            'fallingStroke': '3 #880e4f'
          }
        }
      },
      'title': {
        'fontSize': 17
      },
      'padding': {'top': 20, 'right': 25, 'bottom': 15, 'left': 15}
    },
    'pieFunnelPyramidBase': {
      'normal': {
        'labels': {
          'fontColor': null
        }
      },
      'connectorStroke': '#ffcdd2',
      'outsideLabels': {'autoColor': '#5d1b3e'},
      'insideLabels': {'autoColor': '#37474f'}
    },
    'map': {
      'unboundRegions': {'enabled': true, 'fill': '#f4efef', 'stroke': '#ece1e3'},
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
            'markers': {
              'stroke': '1.5 #ece1e3'
            }
          },
          'hovered': {
            'markers': {
              'stroke': '1.5 #ece1e3'
            }
          },
          'selected': {
            //'stroke': '1.5 #fafafa',
            'markers': {
              //'fill': '#fafafa',
              'stroke': '1.5 #ece1e3'
            }
          }
        }
      }
    },
    'sparkline': {
      'padding': 0,
      'background': {'stroke': '#ffffff'},
      'defaultSeriesSettings': {
        'area': {
          'stroke': '1.5 #f8bbd0',
          'fill': '#f8bbd0 0.5'
        },
        'column': {
          'fill': '#f8bbd0',
          'negativeFill': '#d81b60'
        },
        'line': {
          'stroke': '1.5 #f8bbd0'
        },
        'winLoss': {
          'fill': '#f8bbd0',
          'negativeFill': '#d81b60'
        }
      }
    },
    'bullet': {
      'background': {'stroke': '#ffffff'},
      'defaultMarkerSettings': {
        'fill': '#f8bbd0',
        'stroke': '2 #f8bbd0'
      },
      'padding': {'top': 5, 'right': 10, 'bottom': 5, 'left': 10},
      'margin': {'top': 0, 'right': 0, 'bottom': 0, 'left': 0},
      'rangePalette': {
        'items': ['#848D90', '#98A0A3', '#B4B9BB', '#CFD3D4', '#EAECED']
      }
    },
    'heatMap': {
      'stroke': '1 #ffffff',
      'hoverStroke': '1.5 #ffffff',
      'selectStroke': '2 #ffffff',
      'labels': {
        'fontColor': '#212121'
      }
    },
    'treeMap': {
      'normal': {
        'headers': {
          'background': {
            'enabled': true,
            'fill': '#f4efef',
            'stroke': '#ece1e3'
          }
        },
        'labels': {
          'fontColor': '#212121'
        },
        'stroke': '#ece1e3'
      },
      'hovered': {
        'headers': {
          'fontColor': '#5d1b3e',
          'background': {
            'fill': '#ece1e3',
            'stroke': '#ece1e3'
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
            'fill': '#d7cacc 0.3',
            'stroke': '#d7cacc'
          }
        }
      },
      'scroller': {
        'fill': 'none',
        'selectedFill': '#d7cacc 0.3',
        'outlineStroke': '#d7cacc',
        'defaultSeriesSettings': {
          'base': {
            'selected': {
              'fill': returnSourceColor60,
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
              'fallingFill': returnSourceColor60
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
      }
    }
  };
}).call(this);
