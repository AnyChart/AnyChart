goog.provide('anychart.themes.morning');


(function() {
  var global = this;
  var stockScrollerUnselected = '#999';


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
  global['anychart']['themes']['morning'] = {
    'palette': {
      'type': 'distinct',
      'items': ['#0288d1', '#58abd7', '#ffe082', '#f8bbd0', '#f48fb1', '#bbdefb', '#d4e157', '#ff6e40', '#03a9f4', '#e1bee7']
    },
    'defaultOrdinalColorScale': {
      'autoColors': function(rangesCount) {
        return global['anychart']['color']['blendedHueProgression']('#ffe082', '#f06292', rangesCount);
      }
    },
    'defaultLinearColorScale': {'colors': ['#ffe082', '#f06292']},
    'defaultFontSettings': {
      'fontFamily': '"Source Sans Pro", sans-serif',
      'fontColor': '#37474f',
      'fontSize': 14
    },
    'defaultBackground': {
      'fill': '#ffffff',
      'stroke': '#ffffff',
      'cornerType': 'round',
      'corners': 0
    },
    'defaultAxis': {
      'labels': {
        'enabled': true
      },
      'ticks': {
        'stroke': '#cfd8dc'
      },
      'minorTicks': {
        'stroke': '#eceff1'
      }
    },
    'defaultGridSettings': {
      'stroke': '#cfd8dc'
    },
    'defaultMinorGridSettings': {
      'stroke': '#eceff1'
    },
    'defaultSeparator': {
      'fill': '#eceff1'
    },
    'defaultLegend': {
      'position': 'right',
      'vAlign': 'middle',
      'align': 'left',
      'fontSize': 14,
      'iconTextSpacing': 8,
      'iconSize': 18,
      'itemsLayout': 'vertical',
      'padding': {'top': 10, 'right': 10, 'bottom': 10, 'left': 10},
      'margin': {'top': 0, 'right': 0, 'bottom': 0, 'left': 15},
      'background': {
        'enabled': true,
        'fill': '#F9FAFB',
        'stroke': '#eceff1',
        'cornerType': 'round',
        'corners': 2
      },
      'paginator': {
        'orientation': 'bottom',
        'fontSize': 14
      },
      'title': {
        'padding': {'bottom': 10},
        'hAlign': 'left',
        'fontSize': 16
      }
    },
    'defaultTooltip': {
      'title': {
        'fontColor': '#263238',
        'padding': {'bottom': 8},
        'fontSize': 18
      },
      'separator': {
        'enabled': false,
        'padding': {'bottom': 8}
      },
      'background': {
        'fill': '#F9FAFB 0.95',
        'stroke': '#eceff1',
        'corners': 2
      },
      'padding': {'top': 10, 'right': 20, 'bottom': 15, 'left': 20},
      'fontColor': '#78909c'
    },
    'defaultColorRange': {
      'stroke': '#bdc8ce',
      'ticks': {
        'stroke': '#bdc8ce', 'position': 'outside', 'length': 7, 'enabled': true
      },
      'minorTicks': {
        'stroke': '#bdc8ce', 'position': 'outside', 'length': 5, 'enabled': true
      },
      'marker': {
        'padding': {'top': 3, 'right': 3, 'bottom': 3, 'left': 3},
        'fill': '#37474f',
        'hoverFill': '#37474f'
      }
    },
    'defaultScroller': {
      'fill': '#F9FAFB',
      'selectedFill': '#eceff1',
      'thumbs': {
        'fill': '#F9FAFB',
        'stroke': '#bdc8ce',
        'hoverFill': '#bdc8ce',
        'hoverStroke': '#e9e4e4'
      }
    },
    'chart': {
      'defaultSeriesSettings': {
        'candlestick': {
          'risingFill': '#0288d1',
          'risingStroke': '#0288d1',
          'hoverRisingFill': returnLightenSourceColor,
          'hoverRisingStroke': returnDarkenSourceColor,
          'fallingFill': '#f8bbd0',
          'fallingStroke': '#f8bbd0',
          'hoverFallingFill': returnLightenSourceColor,
          'hoverFallingStroke': returnDarkenSourceColor,
          'selectRisingStroke': '3 #0288d1',
          'selectFallingStroke': '3 #f8bbd0',
          'selectRisingFill': '#333333 0.85',
          'selectFallingFill': '#333333 0.85'
        },
        'ohlc': {
          'risingStroke': '#0288d1',
          'hoverRisingStroke': returnDarkenSourceColor,
          'fallingStroke': '#f8bbd0',
          'hoverFallingStroke': returnDarkenSourceColor,
          'selectRisingStroke': '3 #0288d1',
          'selectFallingStroke': '3 #f8bbd0'
        }
      },
      'title': {
        'fontSize': 20,
        'margin': {'top': 0, 'right': 0, 'bottom': 10, 'left': 10},
        'align': 'left'
      }
    },
    'cartesianBase': {
      'defaultXAxisSettings': {
        'orientation': 'bottom',
        'title': {
          'text': 'X-Axis'
        },
        'ticks': {
          'enabled': false
        },
        'scale': 0
      },
      'defaultYAxisSettings': {
        'orientation': 'left',
        'title': {
          'text': 'Y-Axis'
        },
        'ticks': {
          'enabled': false
        },
        'scale': 1
      },
      'xAxes': [{}],
      'grids': [],
      'yAxes': []
    },
    'financial': {
      'yAxes': [{}]
    },
    'map': {
      'unboundRegions': {'enabled': true, 'fill': '#e8ecf1', 'stroke': '#bdc8ce'},
      'defaultSeriesSettings': {
        'base': {
          'stroke': '#eceff1',
          'labels': {
            'fontColor': '#212121'
          }
        },
        'bubble': {
          'stroke': returnDarkenSourceColor
        },
        'connector': {
          'selectStroke': '1.5 #000',
          'hoverStroke': '#58abd7',
          'stroke': '#0288d1',
          'markers': {
            'fill': '#58abd7',
            'stroke': '1.5 #e8ecf1'
          },
          'hoverMarkers': {
            'stroke': '1.5 #e8ecf1'
          },
          'selectMarkers': {
            'fill': '#000',
            'stroke': '1.5 #e8ecf1'
          }
        }
      }
    },
    'sparkline': {
      'padding': 0,
      'background': {'stroke': '#ffffff'},
      'defaultSeriesSettings': {
        'area': {
          'stroke': '1.5 #0288d1',
          'fill': '#0288d1 0.5'
        },
        'column': {
          'fill': '#0288d1',
          'negativeFill': '#f8bbd0'
        },
        'line': {
          'stroke': '1.5 #0288d1'
        },
        'winLoss': {
          'fill': '#0288d1',
          'negativeFill': '#f8bbd0'
        }
      }
    },
    'bullet': {
      'background': {'stroke': '#ffffff'},
      'defaultMarkerSettings': {
        'fill': '#0288d1',
        'stroke': '2 #0288d1'
      }
    },
    'treeMap': {
      'headers': {
        'background': {
          'enabled': true,
          'fill': '#eceff1',
          'stroke': '#bdc8ce'
        }
      },
      'hoverHeaders': {
        'fontColor': '#757575',
        'background': {
          'fill': '#bdc8ce',
          'stroke': '#bdc8ce'
        }
      },
      'labels': {
        'fontColor': '#212121'
      },
      'selectLabels': {
        'fontColor': '#fafafa'
      },
      'stroke': '#bdc8ce',
      'selectStroke': '2 #eceff1'
    },
    'stock': {
      'padding': [20, 30, 20, 60],
      'defaultPlotSettings': {
        'xAxis': {
          'background': {
            'fill': '#e8ecf1 0.6',
            'stroke': '#e8ecf1'
          }
        },
        'legend': {
          'padding': {'top': 0, 'right': 10, 'bottom': 10, 'left': 10},
          'itemsLayout': 'horizontal',
          'position': 'top',
          'fontSize': 12,
          'vAlign': 'bottom',
          'background': null,
          'title': {
            'padding': {'bottom': 0},
            'hAlign': 'left',
            'fontSize': 12
          }
        }
      },
      'scroller': {
        'fill': 'none',
        'selectedFill': '#e8ecf1 0.6',
        'outlineStroke': '#e8ecf1',
        'defaultSeriesSettings': {
          'base': {
            'color': '#0288d1 0.5',
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
