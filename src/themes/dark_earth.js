goog.provide('anychart.themes.dark_earth');


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
  global['anychart']['themes']['darkEarth'] = {
    'palette': {
      'type': 'distinct',
      'items': ['#827717', '#c77532', '#998675', '#6b617b', '#c69c6d', '#d29b9b', '#879872', '#16685d', '#57a7b1', '#bdbdbd']
    },
    'defaultOrdinalColorScale': {
      'autoColors': function(rangesCount) {
        return global['anychart']['color']['blendedHueProgression']('#827717', '#c77532', rangesCount);
      }
    },
    'defaultLinearColorScale': {'colors': ['#827717', '#c77532']},
    'defaultFontSettings': {
      'fontColor': '#888888'
    },
    'defaultBackground': {
      'fill': '#2b2b2b',
      'stroke': '#212121',
      'cornerType': 'round',
      'corners': 0
    },
    'defaultAxis': {
      'stroke': '#636363 0.6',
      'ticks': {
        'stroke': '#636363 0.6'
      },
      'minorTicks': {
        'stroke': '#42484d 0.6'
      }
    },
    'defaultGridSettings': {
      'stroke': '#636363 0.6'
    },
    'defaultMinorGridSettings': {
      'stroke': '#42484d 0.6'
    },
    'defaultSeparator': {
      'fill': '#42484d 0.6'
    },
    'defaultTooltip': {
      'background': {
        'stroke': '1.5 #212121',
        'corners': 5
      },
      'padding': {'top': 8, 'right': 15, 'bottom': 10, 'left': 15}
    },
    'defaultColorRange': {
      'stroke': '#616161',
      'ticks': {
        'stroke': '#616161', 'position': 'outside', 'length': 7, 'enabled': true
      },
      'minorTicks': {
        'stroke': '#616161', 'position': 'outside', 'length': 5, 'enabled': true
      },
      'marker': {
        'padding': {'top': 3, 'right': 3, 'bottom': 3, 'left': 3},
        'fill': '#616161',
        'hoverFill': '#616161'
      }
    },
    'defaultScroller': {
      'fill': '#424242',
      'selectedFill': '#616161',
      'thumbs': {
        'fill': '#757575',
        'stroke': '#424242',
        'hoverFill': '#bdbdbd',
        'hoverStroke': '#616161'
      }
    },
    'chart': {
      'defaultSeriesSettings': {
        'base': {
          'hoverFill': '#bdbdbd',
          'selectFill': '#e0e0e0',
          'selectStroke': '1.5 #212121',
          'selectMarkers': {
            'stroke': '1.5 #fafafa'
          }
        },
        'lineLike': {
          'selectStroke': '3 #bdbdbd'
        },
        'areaLike': {
          'selectStroke': '3 #bdbdbd'
        },
        'marker': {
          'selectStroke': '1.5 #bdbdbd'
        },
        'candlestick': {
          'risingFill': '#827717',
          'risingStroke': '#827717',
          'hoverRisingFill': returnLightenSourceColor,
          'hoverRisingStroke': returnDarkenSourceColor,
          'fallingFill': '#c77532',
          'fallingStroke': '#c77532',
          'hoverFallingFill': returnLightenSourceColor,
          'hoverFallingStroke': returnDarkenSourceColor,
          'selectRisingStroke': '3 #827717',
          'selectFallingStroke': '3 #c77532',
          'selectRisingFill': '#333333 0.85',
          'selectFallingFill': '#333333 0.85'
        },
        'ohlc': {
          'risingStroke': '#827717',
          'hoverRisingStroke': returnDarkenSourceColor,
          'fallingStroke': '#c77532',
          'hoverFallingStroke': returnDarkenSourceColor,
          'selectRisingStroke': '3 #827717',
          'selectFallingStroke': '3 #c77532'
        }
      },
      'padding': {'top': 20, 'right': 25, 'bottom': 15, 'left': 15}
    },
    'cartesianBase': {
      'defaultSeriesSettings': {
        'box': {
          'selectMedianStroke': '#bdbdbd',
          'selectStemStroke': '#bdbdbd',
          'selectWhiskerStroke': '#bdbdbd',
          'selectOutlierMarkers': {
            'enabled': null,
            'size': 4,
            'fill': '#bdbdbd',
            'stroke': '#bdbdbd'
          }
        }
      }
    },
    'pieFunnelPyramidBase': {
      'labels': {
        'fontColor': null
      },
      'selectStroke': '1.5 #bdbdbd',
      'connectorStroke': '#636363',
      'outsideLabels': {'autoColor': '#888888'},
      'insideLabels': {'autoColor': '#212121'}
    },
    'map': {
      'unboundRegions': {'enabled': true, 'fill': '#424242', 'stroke': '#616161'},
      'defaultSeriesSettings': {
        'base': {
          'stroke': returnLightenSourceColor,
          'hoverFill': '#bdbdbd',
          'selectFill': '#e0e0e0',
          'selectStroke': '1.5 #212121',
          'labels': {
            'fontColor': '#212121'
          }
        },
        'connector': {
          'selectStroke': '1.5 #fafafa',
          'markers': {
            'stroke': '1.5 #424242'
          },
          'hoverMarkers': {
            'stroke': '1.5 #424242'
          },
          'selectMarkers': {
            'fill': '#fafafa',
            'stroke': '1.5 #424242'
          }
        },
        'bubble': {
          'stroke': returnLightenSourceColor
        },
        'marker': {
          'labels': {
            'fontColor': '#888888'
          }
        }
      }
    },
    'sparkline': {
      'padding': 0,
      'background': {'stroke': '#2b2b2b'},
      'defaultSeriesSettings': {
        'area': {
          'stroke': '1.5 #827717',
          'fill': '#827717 0.5'
        },
        'column': {
          'fill': '#827717',
          'negativeFill': '#c77532'
        },
        'line': {
          'stroke': '1.5 #827717'
        },
        'winLoss': {
          'fill': '#827717',
          'negativeFill': '#c77532'
        }
      }
    },
    'bullet': {
      'background': {'stroke': '#2b2b2b'},
      'defaultMarkerSettings': {
        'fill': '#827717',
        'stroke': '2 #827717'
      },
      'padding': {'top': 5, 'right': 10, 'bottom': 5, 'left': 10},
      'margin': {'top': 0, 'right': 0, 'bottom': 0, 'left': 0},
      'rangePalette': {
        'items': ['#565656', '#4B4B4B', '#414141', '#383838', '#303030']
      }
    },
    'heatMap': {
      'stroke': '1 #2b2b2b',
      'hoverStroke': '1.5 #2b2b2b',
      'selectStroke': '2 #bdbdbd',
      'labels': {
        'fontColor': '#212121'
      }
    },
    'treeMap': {
      'headers': {
        'background': {
          'enabled': true,
          'fill': '#424242',
          'stroke': '#616161'
        }
      },
      'hoverHeaders': {
        'fontColor': '#888888',
        'background': {
          'fill': '#616161',
          'stroke': '#616161'
        }
      },
      'labels': {
        'fontColor': '#212121'
      },
      'selectLabels': {
        'fontColor': '#fafafa'
      },
      'stroke': '#616161',
      'selectStroke': '2 #eceff1'
    },
    'stock': {
      'padding': [20, 30, 20, 60],
      'defaultPlotSettings': {
        'xAxis': {
          'background': {
            'fill': '#424242 0.3',
            'stroke': '#636363 0.6'
          }
        }
      },
      'scroller': {
        'fill': 'none',
        'selectedFill': '#424242 0.3',
        'outlineStroke': '#636363 0.6',
        'defaultSeriesSettings': {
          'base': {
            'color': '#827717 0.6',
            'selectStroke': returnSourceColor,
            'selectFill': returnSourceColor
          },
          'lineLike': {
            'selectStroke': returnSourceColor
          },
          'areaLike': {
            'selectStroke': returnSourceColor,
            'selectFill': returnSourceColor
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
