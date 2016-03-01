goog.provide('anychart.themes.defaultThemeOld');


window['anychart'] = window['anychart'] || {};
window['anychart']['themes'] = window['anychart']['themes'] || {};
window['anychart']['themes']['defaultThemeOld'] = {
  // default font settings
  'defaultFontSettings': {
    'fontSize': 13,
    'fontFamily': 'Verdana, Helvetica, Arial, sans-serif',
    'fontColor': '#7c868e',
    'textDirection': 'ltr',
    'fontOpacity': 1,
    'fontDecoration': 'none',
    'fontStyle': 'normal',
    'fontVariant': 'normal',
    'fontWeight': 'normal',
    'letterSpacing': 'normal',
    'lineHeight': 'normal',
    'textIndent': 0,
    'vAlign': 'top',
    'hAlign': 'start',
    'textWrap': 'byLetter',
    'textOverflow': '',
    'selectable': false,
    'disablePointerEvents': false,
    'useHtml': false
  },

  // global palettes
  'palette': {
    'type': 'distinct',
    'items': ['#64b5f6', '#1976d2', '#ef6c00', '#ffd54f', '#455a64', '#96a6a6', '#dd2c00', '#00838f', '#00bfa5', '#ffa000']
  },
  'hatchFillPalette': {
    'items': ['backwardDiagonal', 'forwardDiagonal', 'horizontal', 'vertical', 'dashedBackwardDiagonal', 'grid', 'dashedForwardDiagonal', 'dashedHorizontal', 'dashedVertical', 'diagonalCross', 'diagonalBrick', 'divot', 'horizontalBrick', 'verticalBrick', 'checkerBoard', 'confetti', 'plaid', 'solidDiamond', 'zigZag', 'weave', 'percent05', 'percent10', 'percent20', 'percent25', 'percent30', 'percent40', 'percent50', 'percent60', 'percent70', 'percent75', 'percent80', 'percent90']
  },
  'markerPalette': {
    'items': ['circle', 'diamond', 'square', 'triangleDown', 'triangleUp', 'diagonalCross', 'pentagon', 'cross', 'line', 'star5', 'star4', 'trapezium', 'star7', 'star6', 'star10']
  },

  'ordinalColor': {
    'autoColors': function(rangesCount) {
      return window['anychart']['color']['blendedHueProgression']('#ffd54f', '#ef6c00', rangesCount);
    }
  },

  // global background settings
  'defaultBackground': {
    'enabled': true,
    'fill': '#fff',
    'stroke': 'none',
    'cornerType': 'round',
    'corners': 0
  },

  'defaultLabelFactory': {
    'minFontSize': 8,
    'maxFontSize': 72,
    'enabled': true,
    'offsetX': 0,
    'offsetY': 0,
    'anchor': 'center',
    'padding': {
      'top': 2,
      'right': 4,
      'bottom': 2,
      'left': 4
    },
    'rotation': 0,
    'background': {
      'enabled': false,
      'stroke': {'keys': ['0 #DDDDDD 1', '1 #D0D0D0 1'], 'angle': '90'},
      'fill': {'keys': ['0 #FFFFFF 1', '0.5 #F3F3F3 1', '1 #FFFFFF 1'], 'angle': '90'}
    },
    /**
     * @this {*}
     * @return {*}
     */
    'textFormatter': function() {
      return this['value'];
    },
    /**
     * @this {*}
     * @return {*}
     */
    'positionFormatter': function() {
      return this['value'];
    }
  },

  'defaultMarkerFactory': {
    'size': 10,
    'anchor': 'center',
    'offsetX': 0,
    'offsetY': 0,
    'rotation': 0,
    /**
     * @this {*}
     * @return {*}
     */
    'positionFormatter': function() {
      return this['value'];
    }
  },

  // global title settings
  'defaultTitle': {
    'enabled': true,

    'fontSize': 16,
    'fontColor': '#7c868e',

    'text': 'Title text',

    'background': {
      'enabled': false
    },

    //'rotation': undefined',
    'width': null,
    'height': null,
    'margin': {
      'top': 0,
      'right': 0,
      'bottom': 0,
      'left': 0
    },
    'padding': {
      'top': 0,
      'right': 0,
      'bottom': 0,
      'left': 0
    },
    'align': 'center',
    'hAlign': 'center'
    //'orientation': undefined
  },

  // global tooltip settings
  'defaultTooltip': {
    'enabled': true,
    'title': {
      'enabled': false,
      'fontColor': '#ffffff',
      'fontSize': '15px',
      'fontWeight': 'bold',
      'vAlign': 'top',
      'hAlign': 'left',
      'text': '',
      'background': {
        'enabled': false
      },
      'rotation': 0,
      'width': '100%',
      'height': null,
      'margin': 0,
      'padding': {
        'top': 5,
        'right': 10,
        'bottom': 5,
        'left': 10
      },
      'align': 'left',
      'orientation': 'top',
      'zIndex': 1
    },
    'separator': {
      'enabled': false,
      'fill': '#cecece 0.3',
      'width': '100%',
      'height': 1,
      'margin': {
        'top': 0,
        'right': 5,
        'bottom': 0,
        'left': 5
      },
      'orientation': 'top',
      'stroke': 'none',
      'zIndex': 1
    },
    'content': {
      'enabled': true,
      'fontSize': 12,
      'fontColor': '#fff',
      'vAlign': 'top',
      'hAlign': 'left',
      'textWrap': 'byLetter',
      'text': 'Tooltip Text',
      'background': {
        'enabled': false
      },
      'padding': {
        'top': 5,
        'right': 10,
        'bottom': 5,
        'left': 10
      },
      'width': '100%',
      'height': null,
      'anchor': 'leftTop',
      'offsetX': 0,
      'offsetY': 0,
      'position': 'leftTop',
      'minFontSize': 8,
      'maxFontSize': 72,
      'adjustFontSize': {
        'width': false,
        'height': false
      },
      'rotation': 0,
      'zIndex': 1
    },
    'background': {
      'enabled': true,
      'fill': '#212121 0.7',
      'stroke': null,
      'cornerType': 'round',
      'corners': 3,
      'zIndex': 0
    },
    'padding': {
      'top': 0,
      'right': 0,
      'bottom': 0,
      'left': 0
    },
    'offsetX': 10,
    'offsetY': 10,
    'valuePrefix': '',
    'valuePostfix': '',
    'position': 'leftTop',
    'anchor': 'leftTop',
    'hideDelay': 0,
    'selectable': false,
    /**
     * @this {*}
     * @return {*}
     */
    'titleFormatter': function() {
      return this['value'];
    },
    /**
     * @this {*}
     * @return {*}
     */
    'textFormatter': function() {
      return this['valuePrefix'] + this['value'] + this['valuePostfix'];
    }
  },

  // global axis settings
  'defaultAxis': {
    'enabled': true,
    'startAngle': 0,
    'drawLastLabel': true,
    'drawFirstLabel': true,
    'staggerMaxLines': 2,
    'staggerMode': false,
    'staggerLines': null,
    'width': null,
    'overlapMode': 'noOverlap',
    'stroke': '#cecece',
    'title': {
      'enabled': false,
      'fontSize': 13,
      'text': 'Axis title',
      'margin': {
        'top': 0,
        'right': 0,
        'bottom': 10,
        'left': 0
      },
      'background': {
        'enabled': false,
        'stroke': {'keys': ['#ddd', '#d0d0d0'], 'angle': '90'},
        'fill': {'keys': ['#fff', '#f3f3f3', '#fff'], 'angle': '90'}
      },
      'fontColor': '#545f69'
    },
    'labels': {
      'enabled': true,
      'offsetX': 0,
      'offsetY': 0,
      'minFontSize': 8,
      'maxFontSize': 72,
      'rotation': 0,
      'anchor': 'center',
      'padding': {
        'top': 0,
        'right': 0,
        'bottom': 0,
        'left': 0
      }, // this is xAxis default!
      'fontWeight': 'normal',
      'fontSize': 12,
      'fontColor': '#7c868e',
      'textWrap': 'noWrap',
      'background': {
        'enabled': false,
        'stroke': {'keys': ['#ddd', '#d0d0d0'], 'angle': '90'},
        'fill': {'keys': ['#fff', '#f3f3f3', '#fff'], 'angle': '90'}
      },
      /**
       * @this {*}
       * @return {*}
       */
      'textFormatter': function() {
        return (this['value']);
      },
      /**
       * @this {*}
       * @return {*}
       */
      'positionFormatter': function() {
        return this['value'];
      },
      'zIndex': 35
    },
    'minorLabels': {
      'enabled': false,
      'offsetX': 0,
      'offsetY': 0,
      'minFontSize': 8,
      'maxFontSize': 72,
      'rotation': 0,
      'anchor': 'center',
      'padding': {
        'top': 1,
        'right': 1,
        'bottom': 0,
        'left': 1
      },
      'fontSize': 9,
      'textWrap': 'noWrap',
      'background': {
        'enabled': false,
        'stroke': {'keys': ['#ddd', '#d0d0d0'], 'angle': '90'},
        'fill': {'keys': ['#fff', '#f3f3f3', '#fff'], 'angle': '90'}
      },
      /**
       * @this {*}
       * @return {*}
       */
      'textFormatter': function() {
        return (this['value']);
      },
      /**
       * @this {*}
       * @return {*}
       */
      'positionFormatter': function() {
        return this['value'];
      },
      'zIndex': 35
    },
    'ticks': {
      'enabled': false,
      'length': 6,
      'position': 'outside',
      'stroke': '#cecece',
      'zIndex': 35
    },
    'minorTicks': {
      'enabled': false,
      'length': 4,
      'position': 'outside',
      'stroke': '#eaeaea',
      'zIndex': 35
    },
    'zIndex': 35
  },

  // base/separated chart
  'chart': {
    'defaultSeriesSettings': {
      'base': {
        'tooltip': {
          'enabled': true,
          'title': {
            'enabled': true,
            'fontSize': 13,
            'fontWeight': 'normal'
          },
          'content': {'fontSize': 11},
          'separator': {'enabled': true},
          /**
           * @this {*}
           * @return {*}
           */
          'titleFormatter': function() {
            return this['x'];
          },
          /**
           * @this {*}
           * @return {*}
           */
          'textFormatter': function() {
            return this['seriesName'] + ': ' + this['valuePrefix'] + this['value'] + this['valuePostfix'];
          }
        }
      },
      'marker': {
        /**
         * @this {*}
         * @return {*}
         */
        'fill': function() {
          return window['anychart']['color']['setOpacity'](this['sourceColor'], 0.85, true);
        },
        /**
         * @this {*}
         * @return {*}
         */
        'hoverFill': function() {
          return window['anychart']['color']['setOpacity'](this['sourceColor'], 0.6, true);
        },
        /**
         * @this {*}
         * @return {*}
         */
        'stroke': function() {
          var color = window['anychart']['color']['setThickness'](this['sourceColor'], 1.5);
          color['opacity'] = 0.85;
          return color;
        },
        /**
         * @this {*}
         * @return {*}
         */
        'hoverStroke': function() {
          return window['anychart']['color']['setOpacity'](this['sourceColor'], 1);
        },
        'hatchFill': false,
        'size': 6,
        'hoverSize': 8,
        'selectSize': 8
      }
    },
    'title': {
      'enabled': false,
      'text': 'Chart Title',
      'margin': {
        'top': 0,
        'right': 0,
        'bottom': 0,
        'left': 0
      },
      'padding': {
        'top': 0,
        'right': 0,
        'bottom': 10,
        'left': 0
      },
      'align': 'center',
      'zIndex': 80
    },
    'background': {
      'enabled': true,
      'fill': '#fff',
      'stroke': 'none',
      'zIndex': 1
    },
    'margin': {
      'top': 0,
      'right': 0,
      'bottom': 0,
      'left': 0
    },
    'padding': {
      'top': 30,
      'right': 20,
      'bottom': 20,
      'left': 20
    },
    'legend': {
      'enabled': true,
      'vAlign': 'bottom',
      'fontSize': 12,
      'itemsLayout': 'horizontal',
      'itemsSpacing': 15,
      'items': null,
      'itemsFormatter': null, // effectively equals current settings
      'itemsTextFormatter': null,
      'itemsSourceMode': 'default',
      'inverted': false,
      'hoverCursor': 'pointer',
      'iconTextSpacing': 5,
      'iconSize': 15,
      'width': null,
      'height': null,
      'position': 'top',
      'align': 'center',
      'margin': {
        'top': 0,
        'right': 0,
        'bottom': 0,
        'left': 0
      },
      'padding': {
        'top': 10,
        'right': 10,
        'bottom': 10,
        'left': 10
      },
      'background': {
        'enabled': false,
        'fill': '#fff',
        'stroke': 'none',
        'corners': 5
      },
      'title': {
        'enabled': false,
        'fontSize': 15,
        'text': 'Legend title',
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
          'right': 0,
          'bottom': 3,
          'left': 0
        },
        'padding': {
          'top': 0,
          'right': 0,
          'bottom': 0,
          'left': 0
        },
        'orientation': 'top'
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
      },
      'paginator': {
        'enabled': true,

        'fontSize': 12,
        'fontColor': '#545f69',

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
        'padding': {
          'top': 0,
          'right': 0,
          'bottom': 0,
          'left': 0
        },
        'margin': {
          'top': 0,
          'right': 0,
          'bottom': 0,
          'left': 0
        },
        'orientation': 'right',
        'layout': 'horizontal',
        'zIndex': 30
      },
      'tooltip': {
        'enabled': false,
        'title': {
          'enabled': false,
          'margin': {
            'top': 3,
            'right': 3,
            'bottom': 0,
            'left': 3
          },
          'padding': {
            'top': 0,
            'right': 0,
            'bottom': 0,
            'left': 0
          }
        }
      },
      'zIndex': 20
    },
    'credits': {
      'enabled': true,
      'text': 'AnyChart',
      'url': 'http://anychart.com',
      'alt': 'AnyChart.com',
      'inChart': false
      // we cannot determine the protocol statically :(
      //'logoSrc': 'http://static.anychart.com/logo.png'
    },
    'defaultLabelSettings': {
      'enabled': true,
      'text': 'Chart label',
      'background': {
        'enabled': false
      },
      'padding': {
        'top': 0,
        'right': 0,
        'bottom': 0,
        'left': 0
      },
      'width': null,
      'height': null,
      'anchor': 'leftTop',
      'position': 'leftTop',
      'offsetX': 0,
      'offsetY': 0,
      'minFontSize': 8,
      'maxFontSize': 72,
      'adjustFontSize': {
        'width': false,
        'height': false
      },
      'rotation': 0,
      'zIndex': 50
    },
    'chartLabels': [],
    'animation': {
      'enabled': false,
      'duration': 1000
    },
    'bounds': {
      'top': null,
      'right': null,
      'bottom': null,
      'left': null,
      'width': null,
      'height': null,
      'minWidth': null,
      'minHeight': null,
      'maxWidth': null,
      'maxHeight': null
    },
    'interactivity': {
      'hoverMode': 'single',
      'selectionMode': 'multiSelect',
      'spotRadius': 2,
      'allowMultiSeriesSelection': true
    },
    'tooltip': {
      'allowLeaveScreen': false,
      'allowLeaveChart': true,
      'displayMode': 'single',
      'positionMode': 'float',
      'title': {
        'enabled': true,
        'fontSize': 13
      },
      'separator': {'enabled': true},
      /**
       * @this {*}
       * @return {*}
       */
      'titleFormatter': function() {
        return this['points'][0]['x'];
      },
      /**
       * @this {*}
       * @return {*}
       */
      'textFormatter': function() {
        return this['formattedValues'].join('\n');
      }
    }
  },

  // merge with chart
  'cartesian': {
    'defaultSeriesSettings': {
      'base': {
        /**
         * @this {*}
         * @return {*}
         */
        'fill': function() {
          return this['sourceColor'];
        },
        /**
         * @this {*}
         * @return {*}
         */
        'hoverFill': function() {
          return window['anychart']['color']['lighten'](this['sourceColor']);
        },
        'selectFill': '#333333',
        /**
         * @this {*}
         * @return {*}
         */
        'stroke': function() {
          return window['anychart']['color']['darken'](this['sourceColor']);
        },
        /**
         * @this {*}
         * @return {*}
         */
        'hoverStroke': function() {
          return '1.5 #c2185b';
        },
        /**
         * @this {*}
         * @return {*}
         */
        'selectStroke': function() {
          return window['anychart']['color']['darken'](this['sourceColor']);
        },
        'hatchFill': false,
        //'hoverHatchFill': null,

        'labels': {
          'enabled': false,
          'fontSize': 11,

          'background': {
            'enabled': false
          },
          'padding': {
            'top': 2,
            'right': 4,
            'bottom': 2,
            'left': 4
          },
          'position': 'center',
          'anchor': 'center',
          'offsetX': 0,
          'offsetY': 0,
          'rotation': 0,
          'width': null,
          'height': null,
          /**
           * @this {*}
           * @return {*}
           */
          'textFormatter': function() {
            return this['value'];
          },
          /**
           * @this {*}
           * @return {*}
           */
          'positionFormatter': function() {
            return this['value'];
          }
        },
        'hoverLabels': {
          'enabled': null
        },
        'markers': {
          'enabled': false,
          'disablePointerEvents': false,
          'position': 'center',
          'rotation': 0,
          'anchor': 'center',
          'offsetX': 0,
          'offsetY': 0,
          //'type': null,
          'size': 4,
          //'fill': '', // autoFill
          //'stroke': '', // autoStroke
          /**
           * @this {*}
           * @return {*}
           */
          'positionFormatter': function() {
            return this['value'];
          }
        },
        'hoverMarkers': {
          'enabled': null,
          'size': 6
        },

        'clip': true,
        'color': null,

        'tooltip': {},
        'xScale': null,
        'yScale': null,
        'error': {
          'mode': 'both',
          'xError': null,
          'xUpperError': null,
          'xLowerError': null,
          'valueError': null,
          'valueUpperError': null,
          'valueLowerError': null,
          'xErrorWidth': 10,
          'valueErrorWidth': 10,
          /**
           * @this {*}
           * @return {*}
           */
          'xErrorStroke': function() {
            return window['anychart']['color']['setThickness'](window['anychart']['color']['darken'](this['sourceColor']));
          },
          /**
           * @this {*}
           * @return {*}
           */
          'valueErrorStroke': function() {
            return window['anychart']['color']['setThickness'](window['anychart']['color']['darken'](this['sourceColor']));
          }
        },
        // series legend item is managed by the legend
        //'legendItem': {
        //'iconTextSpacing': '',
        //'iconEnabled': '',
        //'iconType': '',
        //'iconStroke': '',
        //'iconFill': '',
        //'iconHatchFill': '',
        //'iconMarkerType': '',
        //'iconMarkerFill': '',
        //'iconMarkerStroke': '',
        //'text': '',
        //'disabled': ''
        //},
        // overruled by chart auto distribution setup by
        // cartesian.barsPadding() and cartesian.barGroupsPadding()
        //'pointWidth': '90%',
        //'xPointPosition': 0.5
        'connectMissingPoints': false
      },
      'area': {
        'labels': {
          'anchor': 'bottomleft',
          'padding': {'top': 5, 'right': 5, 'bottom': 5, 'left': 5}
        },
        /**
         * @this {*}
         * @return {*}
         */
        'fill': function() {
          return window['anychart']['color']['setOpacity'](this['sourceColor'], 0.6, true);
        },
        /**
         * @this {*}
         * @return {*}
         */
        'hoverFill': function() {
          return window['anychart']['color']['setOpacity'](this['sourceColor'], 0.6, true);
        },
        /**
         * @this {*}
         * @return {*}
         */
        'stroke': function() {
          return window['anychart']['color']['setThickness'](this['sourceColor'], 1.5);
        },
        /**
         * @this {*}
         * @return {*}
         */
        'hoverStroke': function() {
          return window['anychart']['color']['setThickness'](this['sourceColor'], 1.5);
        },
        'legendItem': {
          'iconStroke': null
        },
        'hoverMarkers': {'enabled': true},
        'selectMarkers': {
          'enabled': true,
          'fill': '#FFD700',
          'size': 6
        }
      },
      'bar': {
        /**
         * @this {*}
         * @return {*}
         */
        'fill': function() {
          return window['anychart']['color']['setOpacity'](this['sourceColor'], 0.85, true);
        },
        /**
         * @this {*}
         * @return {*}
         */
        'hoverFill': function() {
          return window['anychart']['color']['setOpacity'](this['sourceColor'], 0.6, true);
        },
        /**
         * @this {*}
         * @return {*}
         */
        'stroke': function() {
          var color = window['anychart']['color']['setThickness'](this['sourceColor'], 1.5);
          color['opacity'] = 0.85;
          return color;
        },
        /**
         * @this {*}
         * @return {*}
         */
        'hoverStroke': function() {
          return window['anychart']['color']['setOpacity'](this['sourceColor'], 1);
        },
        'legendItem': {
          'iconStroke': null
        },
        'markers': {
          'position': 'rightCenter'
        },
        'labels': {
          'position': 'rightCenter'
        }
      },
      'box': {
        'markers': {
          'position': 'centerTop'
        },
        'labels': {
          'position': 'centerTop',
          /**
           * @this {*}
           * @return {*}
           */
          'textFormatter': function() {
            return this['x'];
          }
        },
        /**
         * @this {*}
         * @return {*}
         */
        'fill': function() {
          return window['anychart']['color']['setOpacity'](this['sourceColor'], 0.85, true);
        },
        /**
         * @this {*}
         * @return {*}
         */
        'hoverFill': function() {
          return window['anychart']['color']['setOpacity'](this['sourceColor'], 0.6, true);
        },
        /**
         * @this {*}
         * @return {*}
         */
        'stroke': function() {
          var color = window['anychart']['color']['setThickness'](this['sourceColor'], 1.5);
          color['opacity'] = 0.85;
          return color;
        },
        /**
         * @this {*}
         * @return {*}
         */
        'hoverStroke': function() {
          return window['anychart']['color']['setOpacity'](this['sourceColor'], 1);
        },
        'legendItem': {
          'iconStroke': null
        },
        /**
         * @this {*}
         * @return {*}
         */
        'medianStroke': function() {
          return window['anychart']['color']['darken'](this['sourceColor']);
        },
        /**
         * @this {*}
         * @return {*}
         */
        'hoverMedianStroke': function() {
          return this['sourceColor'];
        },
        /**
         * @this {*}
         * @return {*}
         */
        'selectMedianStroke': function() {
          //todo need change default
          return window['anychart']['color']['darken']('red');
        },
        /**
         * @this {*}
         * @return {*}
         */
        'stemStroke': function() {
          return window['anychart']['color']['darken'](this['sourceColor']);
        },
        /**
         * @this {*}
         * @return {*}
         */
        'hoverStemStroke': function() {
          return this['sourceColor'];
        },
        /**
         * @this {*}
         * @return {*}
         */
        'selectStemStroke': function() {
          //todo need change default
          return window['anychart']['color']['darken']('blue');
        },
        /**
         * @this {*}
         * @return {*}
         */
        'whiskerStroke': function() {
          return window['anychart']['color']['darken'](this['sourceColor']);
        },
        /**
         * @this {*}
         * @return {*}
         */
        'hoverWhiskerStroke': function() {
          return this['sourceColor'];
        },
        /**
         * @this {*}
         * @return {*}
         */
        'selectWiskerStroke': function() {
          //todo need change default
          return window['anychart']['color']['darken']('yellow');
        },
        'whiskerWidth': 0,
        'outlierMarkers': {
          'enabled': true,
          'disablePointerEvents': false,
          'position': 'center',
          'rotation': 0,
          'anchor': 'center',
          'offsetX': 0,
          'offsetY': 0,
          'type': 'circle',
          'size': 3,
          //'fill': '', // autoFill
          //'stroke': '', // autoStroke
          /**
           * @this {*}
           * @return {*}
           */
          'positionFormatter': function() {
            return this['value'];
          }
        },
        'hoverOutlierMarkers': {
          'enabled': null,
          'size': 4
        },
        'selectOutlierMarkers': {
          //todo need change default
          'enabled': null,
          'size': 20,
          'type': 'star10'
        },
        'tooltip': {
          'content': {
            'hAlign': 'left'
          },
          /**
           * @this {*}
           * @return {*}
           */
          'titleFormatter': function() {
            return this['name'] || this['x'];
          },
          /**
           * @this {*}
           * @return {*}
           */
          'textFormatter': function() {
            return 'Lowest: ' + this['valuePrefix'] + parseFloat(this['lowest']).toFixed(2) + this['valuePostfix'] + '\n' +
                'Q1: ' + this['valuePrefix'] + parseFloat(this['q1']).toFixed(2) + this['valuePostfix'] + '\n' +
                'Median: ' + this['valuePrefix'] + parseFloat(this['median']).toFixed(2) + this['valuePostfix'] + '\n' +
                'Q3: ' + this['valuePrefix'] + parseFloat(this['q3']).toFixed(2) + this['valuePostfix'] + '\n' +
                'Highest: ' + this['valuePrefix'] + parseFloat(this['highest']).toFixed(2) + this['valuePostfix'];
          }
        }
      },
      'bubble': {
        'displayNegative': false,
        /**
         * @this {*}
         * @return {*}
         */
        'fill': function() {
          return window['anychart']['color']['setOpacity'](this['sourceColor'], 0.7, true);
        },
        /**
         * @this {*}
         * @return {*}
         */
        'hoverFill': function() {
          return window['anychart']['color']['setOpacity'](this['sourceColor'], 0.7, true);
        },
        /**
         * @this {*}
         * @return {*}
         */
        'stroke': function() {
          return window['anychart']['color']['setThickness'](this['sourceColor'], 1.5);
        },
        /**
         * @this {*}
         * @return {*}
         */
        'hoverStroke': function() {
          return window['anychart']['color']['setThickness'](this['sourceColor'], 1.5);
        },
        'legendItem': {
          'iconStroke': null
        },
        /**
         * @this {*}
         * @return {*}
         */
        'negativeFill': function() {
          return window['anychart']['color']['darken'](
              window['anychart']['color']['darken'](
              window['anychart']['color']['darken'](this['sourceColor'])));
        },
        /**
         * @this {*}
         * @return {*}
         */
        'hoverNegativeFill': function() {
          return window['anychart']['color']['darken'](
              window['anychart']['color']['darken'](
              window['anychart']['color']['darken'](
              window['anychart']['color']['darken'](this['sourceColor']))));
        },
        /**
         * @this {*}
         * @return {*}
         */
        'negativeStroke': function() {
          return window['anychart']['color']['darken'](
              window['anychart']['color']['darken'](
              window['anychart']['color']['darken'](
              window['anychart']['color']['darken'](this['sourceColor']))));
        },
        /**
         * @this {*}
         * @return {*}
         */
        'hoverNegativeStroke': function() {
          return window['anychart']['color']['darken'](
              window['anychart']['color']['darken'](
              window['anychart']['color']['darken'](
              window['anychart']['color']['darken'](
                  window['anychart']['color']['darken'](this['sourceColor'])))));
        },
        'negativeHatchFill': null,
        'hoverNegativeHatchFill': null,
        'tooltip': {
          /**
           * @this {*}
           * @return {*}
           */
          'textFormatter': function() {
            return this['valuePrefix'] + parseFloat(this['value']).toFixed(2) + this['valuePostfix'];
          }
        }
      },
      'candlestick': {
        'markers': {
          'position': 'centerTop'
        },
        /**
         * @this {*}
         * @return {*}
         */
        'risingFill': function() {
          return window['anychart']['color']['lighten'](this['sourceColor']);
        },
        /**
         * @this {*}
         * @return {*}
         */
        'hoverRisingFill': function() {
          return window['anychart']['color']['lighten'](
              window['anychart']['color']['lighten'](this['sourceColor']));
        },
        /**
         * @this {*}
         * @return {*}
         */
        'selectRisingFill': function() {
          //todo need define cool color.
          return window['anychart']['color']['lighten'](
              window['anychart']['color']['lighten']('red'));
        },
        /**
         * @this {*}
         * @return {*}
         */
        'fallingFill': function() {
          return window['anychart']['color']['darken'](this['sourceColor']);
        },
        /**
         * @this {*}
         * @return {*}
         */
        'hoverFallingFill': function() {
          return window['anychart']['color']['darken'](
              window['anychart']['color']['darken'](this['sourceColor']));
        },
        /**
         * @this {*}
         * @return {*}
         */
        'selectFallingFill': function() {
          //todo need define cool color.
          return window['anychart']['color']['darken'](
              window['anychart']['color']['darken']('blue'));
        },
        'risingHatchFill': null,
        'hoverRisingHatchFill': null,
        'fallingHatchFill': null,
        'hoverFallingHatchFill': null,
        /**
         * @this {*}
         * @return {*}
         */
        'risingStroke': function() {
          return this['sourceColor'];
        },
        /**
         * @this {*}
         * @return {*}
         */
        'hoverRisingStroke': function() {
          return window['anychart']['color']['lighten'](this['sourceColor']);
        },
        /**
         * @this {*}
         * @return {*}
         */
        'selectRisingStroke': function() {
          //todo need define cool color.
          return window['anychart']['color']['lighten']('red');
        },
        /**
         * @this {*}
         * @return {*}
         */
        'fallingStroke': function() {
          return window['anychart']['color']['darken'](
              window['anychart']['color']['darken'](this['sourceColor']));
        },
        /**
         * @this {*}
         * @return {*}
         */
        'hoverFallingStroke': function() {
          return window['anychart']['color']['darken'](
              window['anychart']['color']['darken'](
              window['anychart']['color']['darken'](this['sourceColor'])));
        },
        /**
         * @this {*}
         * @return {*}
         */
        'selectFallingStroke': function() {
          //todo need define cool color.
          return window['anychart']['color']['darken'](
              window['anychart']['color']['darken'](
                  window['anychart']['color']['darken']('blue')));
        },
        'tooltip': {
          'content': {
            'hAlign': 'left'
          },
          /**
           * @this {*}
           * @return {*}
           */
          'textFormatter': function() {
            return 'O: ' + this['valuePrefix'] + parseFloat(this['open']).toFixed(4) + this['valuePostfix'] + '\n' +
                'H: ' + this['valuePrefix'] + parseFloat(this['high']).toFixed(4) + this['valuePostfix'] + '\n' +
                'L: ' + this['valuePrefix'] + parseFloat(this['low']).toFixed(4) + this['valuePostfix'] + '\n' +
                'C: ' + this['valuePrefix'] + parseFloat(this['close']).toFixed(4) + this['valuePostfix'];
          }
        },
        'labels': {
          'position': 'centerTop',
          /**
           * @this {*}
           * @return {*}
           */
          'textFormatter': function() {
            return this['x'];
          },
          'offsetY': -10
        }
      },
      'column': {
        /**
         * @this {*}
         * @return {*}
         */
        'fill': function() {
          return window['anychart']['color']['setOpacity'](this['sourceColor'], 0.85, true);
        },
        /**
         * @this {*}
         * @return {*}
         */
        'hoverFill': function() {
          return window['anychart']['color']['setOpacity'](this['sourceColor'], 0.6, true);
        },
        /**
         * @this {*}
         * @return {*}
         */
        'stroke': function() {
          var color = window['anychart']['color']['setThickness'](this['sourceColor'], 1.5);
          color['opacity'] = 0.85;
          return color;
        },
        /**
         * @this {*}
         * @return {*}
         */
        'hoverStroke': function() {
          return window['anychart']['color']['setOpacity'](this['sourceColor'], 1);
        },
        'legendItem': {
          'iconStroke': null
        },
        'markers': {
          'position': 'centerTop'
        },
        'labels': {
          'position': 'centerTop'
        }
      },
      'line': {
        'labels': {
          'anchor': 'bottomleft',
          'padding': {'top': 5, 'right': 5, 'bottom': 5, 'left': 5}
        },
        /**
         * @this {*}
         * @return {*}
         */
        'stroke': function() {
          var color = window['anychart']['color']['setThickness'](this['sourceColor'], 2);
          color['opacity'] = 1;
          return color;
        },
        'legendItem': {
          'iconType': 'line'
        },
        /**
         * @this {*}
         * @return {*}
         */
        'hoverStroke': function() {
          return window['anychart']['color']['lighten'](this['sourceColor']);
        },
        'hoverMarkers': {'enabled': true},
        'selectMarkers': {
          'enabled': true,
          'fill': '#FFD700',
          'size': 6
        }
      },
      'marker': {},
      'ohlc': {
        /**
         * @this {*}
         * @return {*}
         */
        'risingStroke': function() {
          return this['sourceColor'];
        },
        /**
         * @this {*}
         * @return {*}
         */
        'hoverRisingStroke': function() {
          return window['anychart']['color']['lighten'](this['sourceColor']);
        },
        /**
         * @this {*}
         * @return {*}
         */
        'selectRisingStroke': function() {
          //todo need define cool color.
          return window['anychart']['color']['darken']('red');
        },
        /**
         * @this {*}
         * @return {*}
         */
        'fallingStroke': function() {
          return window['anychart']['color']['darken'](
              window['anychart']['color']['darken'](this['sourceColor']));
        },
        /**
         * @this {*}
         * @return {*}
         */
        'hoverFallingStroke': function() {
          return window['anychart']['color']['darken'](
              window['anychart']['color']['darken'](
                  window['anychart']['color']['darken'](this['sourceColor'])));
        },
        /**
         * @this {*}
         * @return {*}
         */
        'selectFallingStroke': function() {
          //todo need define cool color.
          return window['anychart']['color']['darken']('blue');
        },
        'tooltip': {
          'content': {
            'hAlign': 'left'
          },
          /**
           * @this {*}
           * @return {*}
           */
          'textFormatter': function() {
            return 'O: ' + this['valuePrefix'] + parseFloat(this['open']).toFixed(4) + this['valuePostfix'] + '\n' +
                'H: ' + this['valuePrefix'] + parseFloat(this['high']).toFixed(4) + this['valuePostfix'] + '\n' +
                'L: ' + this['valuePrefix'] + parseFloat(this['low']).toFixed(4) + this['valuePostfix'] + '\n' +
                'C: ' + this['valuePrefix'] + parseFloat(this['close']).toFixed(4) + this['valuePostfix'];
          }
        },
        'labels': {
          /**
           * @this {*}
           * @return {*}
           */
          'textFormatter': function() {
            return this['x'];
          },
          'offsetY': -10
        }
      },
      'rangeArea': {
        'labels': {
          'anchor': 'bottom'
        },
        'legendItem': {
          'iconStroke': null
        },
        /**
         * @this {*}
         * @return {*}
         */
        'fill': function() {
          return window['anychart']['color']['setOpacity'](this['sourceColor'], 0.6, true);
        },
        /**
         * @this {*}
         * @return {*}
         */
        'hoverFill': function() {
          return window['anychart']['color']['setOpacity'](this['sourceColor'], 0.6, true);
        },
        /**
         * @this {*}
         * @return {*}
         */
        'lowStroke': function() {
          var color = window['anychart']['color']['setThickness'](this['sourceColor'], 1.5);
          color['opacity'] = 1;
          return color;
        },
        /**
         * @this {*}
         * @return {*}
         */
        'hoverLowStroke': function() {
          var color = window['anychart']['color']['setThickness'](this['sourceColor'], 1.5);
          color['opacity'] = 1;
          return color;
        },
        /**
         * @this {*}
         * @return {*}
         */
        'highStroke': function() {
          var color = window['anychart']['color']['setThickness'](this['sourceColor'], 1.5);
          color['opacity'] = 1;
          return color;
        },
        /**
         * @this {*}
         * @return {*}
         */
        'hoverHighStroke': function() {
          var color = window['anychart']['color']['setThickness'](this['sourceColor'], 1.5);
          color['opacity'] = 1;
          return color;
        },
        'tooltip': {
          'content': {
            'hAlign': 'left'
          },
          /**
           * @this {*}
           * @return {*}
           */
          'textFormatter': function() {
            return 'High: ' + this['valuePrefix'] + parseFloat(this['high']).toFixed(2) + this['valuePostfix'] + '\n' +
                'Low: ' + this['valuePrefix'] + parseFloat(this['low']).toFixed(2) + this['valuePostfix'];
          }
        }
      },
      'rangeBar': {
        'tooltip': {
          'content': {
            'hAlign': 'left'
          },
          /**
           * @this {*}
           * @return {*}
           */
          'textFormatter': function() {
            return 'High: ' + this['valuePrefix'] + parseFloat(this['high']).toFixed(2) + this['valuePostfix'] + '\n' +
                'Low: ' + this['valuePrefix'] + parseFloat(this['low']).toFixed(2) + this['valuePostfix'];
          }
        }
      },
      'rangeColumn': {
        'tooltip': {
          'content': {
            'hAlign': 'left'
          },
          /**
           * @this {*}
           * @return {*}
           */
          'textFormatter': function() {
            return 'High: ' + this['valuePrefix'] + parseFloat(this['high']).toFixed(2) + this['valuePostfix'] + '\n' +
                'Low: ' + this['valuePrefix'] + parseFloat(this['low']).toFixed(2) + this['valuePostfix'];
          }
        }
      },
      'rangeSplineArea': {
        'labels': {
          'anchor': 'bottom'
        },
        'legendItem': {
          'iconStroke': null
        },
        /**
         * @this {*}
         * @return {*}
         */
        'fill': function() {
          return window['anychart']['color']['setOpacity'](this['sourceColor'], 0.6, true);
        },
        /**
         * @this {*}
         * @return {*}
         */
        'hoverFill': function() {
          return window['anychart']['color']['setOpacity'](this['sourceColor'], 0.6, true);
        },
        /**
         * @this {*}
         * @return {*}
         */
        'lowStroke': function() {
          var color = window['anychart']['color']['setThickness'](this['sourceColor'], 1.5);
          color['opacity'] = 1;
          return color;
        },
        /**
         * @this {*}
         * @return {*}
         */
        'hoverLowStroke': function() {
          var color = window['anychart']['color']['setThickness'](this['sourceColor'], 1.5);
          color['opacity'] = 1;
          return color;
        },
        /**
         * @this {*}
         * @return {*}
         */
        'highStroke': function() {
          var color = window['anychart']['color']['setThickness'](this['sourceColor'], 1.5);
          color['opacity'] = 1;
          return color;
        },
        /**
         * @this {*}
         * @return {*}
         */
        'hoverHighStroke': function() {
          var color = window['anychart']['color']['setThickness'](this['sourceColor'], 1.5);
          color['opacity'] = 1;
          return color;
        },
        'tooltip': {
          'content': {
            'hAlign': 'left'
          },
          /**
           * @this {*}
           * @return {*}
           */
          'textFormatter': function() {
            return 'High: ' + this['valuePrefix'] + parseFloat(this['high']).toFixed(2) + this['valuePostfix'] + '\n' +
                'Low: ' + this['valuePrefix'] + parseFloat(this['low']).toFixed(2) + this['valuePostfix'];
          }
        }
      },
      'rangeStepArea': {
        'labels': {
          'anchor': 'bottom'
        },
        'legendItem': {
          'iconStroke': null
        },
        /**
         * @this {*}
         * @return {*}
         */
        'fill': function() {
          return window['anychart']['color']['setOpacity'](this['sourceColor'], 0.6, true);
        },
        /**
         * @this {*}
         * @return {*}
         */
        'hoverFill': function() {
          return window['anychart']['color']['setOpacity'](this['sourceColor'], 0.6, true);
        },
        /**
         * @this {*}
         * @return {*}
         */
        'lowStroke': function() {
          var color = window['anychart']['color']['setThickness'](this['sourceColor'], 1.5);
          color['opacity'] = 1;
          return color;
        },
        /**
         * @this {*}
         * @return {*}
         */
        'hoverLowStroke': function() {
          var color = window['anychart']['color']['setThickness'](this['sourceColor'], 1.5);
          color['opacity'] = 1;
          return color;
        },
        /**
         * @this {*}
         * @return {*}
         */
        'highStroke': function() {
          var color = window['anychart']['color']['setThickness'](this['sourceColor'], 1.5);
          color['opacity'] = 1;
          return color;
        },
        /**
         * @this {*}
         * @return {*}
         */
        'hoverHighStroke': function() {
          var color = window['anychart']['color']['setThickness'](this['sourceColor'], 1.5);
          color['opacity'] = 1;
          return color;
        },
        'tooltip': {
          'content': {
            'hAlign': 'left'
          },
          /**
           * @this {*}
           * @return {*}
           */
          'textFormatter': function() {
            return 'High: ' + this['valuePrefix'] + parseFloat(this['high']).toFixed(2) + this['valuePostfix'] + '\n' +
                'Low: ' + this['valuePrefix'] + parseFloat(this['low']).toFixed(2) + this['valuePostfix'];
          }
        }
      },
      'spline': {
        'labels': {
          'anchor': 'bottomleft',
          'padding': {'top': 5, 'right': 5, 'bottom': 5, 'left': 5}
        },
        /**
         * @this {*}
         * @return {*}
         */
        'stroke': function() {
          var color = window['anychart']['color']['setThickness'](this['sourceColor'], 2);
          color['opacity'] = 1;
          return color;
        },
        'legendItem': {
          'iconType': 'line'
        },
        /**
         * @this {*}
         * @return {*}
         */
        'hoverStroke': function() {
          return window['anychart']['color']['lighten'](this['sourceColor']);
        },
        'hoverMarkers': {'enabled': true},
        'selectMarkers': {
          'enabled': true,
          'fill': '#FFD700',
          'size': 6
        }
      },
      'splineArea': {
        'labels': {
          'anchor': 'bottomleft',
          'padding': {'top': 5, 'right': 5, 'bottom': 5, 'left': 5}
        },
        /**
         * @this {*}
         * @return {*}
         */
        'fill': function() {
          return window['anychart']['color']['setOpacity'](this['sourceColor'], 0.6, true);
        },
        /**
         * @this {*}
         * @return {*}
         */
        'hoverFill': function() {
          return window['anychart']['color']['setOpacity'](this['sourceColor'], 0.6, true);
        },
        /**
         * @this {*}
         * @return {*}
         */
        'stroke': function() {
          return window['anychart']['color']['setThickness'](this['sourceColor'], 1.5);
        },
        /**
         * @this {*}
         * @return {*}
         */
        'hoverStroke': function() {
          return window['anychart']['color']['setThickness'](this['sourceColor'], 1.5);
        },
        'legendItem': {
          'iconStroke': null
        },
        'hoverMarkers': {'enabled': true},
        'selectMarkers': {
          'enabled': true,
          'fill': '#FFD700',
          'size': 6
        }
      },
      'stepLine': {
        'labels': {
          'anchor': 'bottom',
          'padding': {'top': 5, 'right': 5, 'bottom': 5, 'left': 5}
        },
        /**
         * @this {*}
         * @return {*}
         */
        'stroke': function() {
          var color = window['anychart']['color']['setThickness'](this['sourceColor'], 2);
          color['opacity'] = 1;
          return color;
        },
        'legendItem': {
          'iconType': 'line'
        },
        /**
         * @this {*}
         * @return {*}
         */
        'hoverStroke': function() {
          return window['anychart']['color']['lighten'](this['sourceColor']);
        },
        'hoverMarkers': {'enabled': true},
        'selectMarkers': {
          'enabled': true,
          'fill': '#FFD700',
          'size': 6
        }
      },
      'stepArea': {
        'labels': {
          'anchor': 'bottom',
          'padding': {'top': 5, 'right': 5, 'bottom': 5, 'left': 5}
        },
        /**
         * @this {*}
         * @return {*}
         */
        'fill': function() {
          return window['anychart']['color']['setOpacity'](this['sourceColor'], 0.6, true);
        },
        /**
         * @this {*}
         * @return {*}
         */
        'hoverFill': function() {
          return window['anychart']['color']['setOpacity'](this['sourceColor'], 0.6, true);
        },
        /**
         * @this {*}
         * @return {*}
         */
        'stroke': function() {
          return window['anychart']['color']['setThickness'](this['sourceColor'], 1.5);
        },
        /**
         * @this {*}
         * @return {*}
         */
        'hoverStroke': function() {
          return window['anychart']['color']['setThickness'](this['sourceColor'], 1.5);
        },
        'legendItem': {
          'iconStroke': null
        },
        'hoverMarkers': {'enabled': true},
        'selectMarkers': {
          'enabled': true,
          'fill': '#FFD700',
          'size': 6
        }
      }
    },
    'defaultGridSettings': {
      'enabled': true,
      'isMinor': false,
      'layout': 'horizontal',
      'drawFirstLine': true,
      'drawLastLine': true,
      'oddFill': null,
      'evenFill': null,
      'stroke': '#cecece',
      'scale': 1,
      'zIndex': 11
    },
    'defaultMinorGridSettings': {
      'enabled': true,
      'isMinor': true,
      'layout': 'horizontal',
      'drawFirstLine': true,
      'drawLastLine': true,
      'oddFill': null,
      'evenFill': null,
      'stroke': '#eaeaea',
      'scale': 1,
      'zIndex': 10
    },
    'defaultXAxisSettings': {
      'enabled': true,
      'orientation': 'bottom',
      'title': {
        'enabled': false,
        'text': 'X-Axis',
        'padding': {
          'top': 5,
          'right': 5,
          'bottom': 5,
          'left': 5
        }
      },
      'width': null,
      'scale': 0,
      'labels': {
        'padding': {
          'top': 5,
          'right': 0,
          'bottom': 5,
          'left': 0
        }
      },
      'minorLabels': {
        'padding': {
          'top': 5,
          'right': 0,
          'bottom': 5,
          'left': 0
        }
      }
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
      'width': null,
      'labels': {
        'padding': {
          'top': 0,
          'right': 5,
          'bottom': 0,
          'left': 5
        }
      },
      'minorLabels': {
        'padding': {
          'top': 0,
          'right': 5,
          'bottom': 0,
          'left': 5
        }
      },
      'scale': 1
    },
    'defaultLineMarkerSettings': {
      'enabled': true,
      'value': 0,
      'layout': 'horizontal',
      'stroke': {
        'color': '#DC0A0A',
        'thickness': 1,
        'opacity': 1,
        'dash': '',
        'lineJoin': 'miter',
        'lineCap': 'square'
      },
      'zIndex': 25.2,
      'scale': 1
    },
    'defaultTextMarkerSettings': {
      'enabled': true,

      'fontSize': 12,

      'value': 0,
      'anchor': 'center',
      'align': 'center',
      'layout': 'horizontal',
      //'rotation': undefined,
      'offsetX': 0,
      'offsetY': 0,
      'text': 'Text marker',
      'width': null,
      'height': null,
      'zIndex': 25.3,
      'scale': 1
    },
    'defaultRangeMarkerSettings': {
      'enabled': true,
      'from': 0,
      'to': 0,
      'layout': 'horizontal',
      'fill': '#000 0.3',
      'zIndex': 25.1,
      'scale': 1
    },

    'background': {
      'enabled': false
    },
    'legend': {
      'enabled': false
    },
    'margin': {
      'top': 0,
      'right': 0,
      'bottom': 0,
      'left': 0
    },
    'padding': {
      'top': 0,
      'right': 0,
      'bottom': 0,
      'left': 0
    },

    'series': [],
    'grids': [],
    'minorGrids': [],
    'xAxes': [],
    'yAxes': [],
    'lineAxesMarkers': [],
    'rangeAxesMarkers': [],
    'textAxesMarkers': [],

    'scales': [
      {
        'type': 'ordinal',
        'inverted': false,
        'names': [],
        'ticks': {
          'interval': 1
        }
      },
      {
        'type': 'linear',
        'inverted': false,
        'maximum': null,
        'minimum': null,
        'minimumGap': 0.1,
        'maximumGap': 0.1,
        'softMinimum': null,
        'softMaximum': null,
        'ticks': {
          'mode': 'linear',
          'base': 0,
          'minCount': 4,
          'maxCount': 6
        },
        'minorTicks': {
          'mode': 'linear',
          'base': 0,
          'count': 5
        },
        'stackMode': 'none',
        'stickToZero': true
      }
    ],
    'xScale': 0,
    'yScale': 1,

    'barsPadding': 0.4,
    'barGroupsPadding': 0.8,
    'maxBubbleSize': '20%',
    'minBubbleSize': '5%',
    'barChartMode': false,
    'crosshair': {
      'enabled': false,
      'displayMode': 'float',
      'xStroke': '#cecece',
      'yStroke': '#cecece',
      'xLabel': {
        'x': 0,
        'y': 0,
        'axisIndex': 0,
        /**
         * @this {*}
         * @return {*}
         */
        'textFormatter': function() {
          return this['value'];
        },
        'enabled': true,
        'fontSize': 12,
        'fontColor': '#fff',
        'fontWeight': 400,
        'textWrap': 'byLetter',
        'disablePointerEvents': true,

        'text': 'Label text',
        'background': {
          'enabled': true,
          'fill': '#212121 0.7',
          'corners': 3
        },
        'padding': {
          'top': 5,
          'right': 10,
          'bottom': 5,
          'left': 10
        },
        'width': null,
        'height': null,
        'anchor': null,
        'offsetX': 0,
        'offsetY': 0,
        'minFontSize': 8,
        'maxFontSize': 72,
        'adjustFontSize': {
          'width': false,
          'height': false
        },
        'rotation': 0
      },
      'yLabel': {
        'x': 0,
        'y': 0,
        'axisIndex': 0,
        /**
         * @this {*}
         * @return {*}
         */
        'textFormatter': function() {
          return this['value'];
        },
        'enabled': true,
        'fontSize': 12,
        'fontColor': '#fff',
        'fontWeight': 400,
        'textWrap': 'byLetter',
        'disablePointerEvents': true,

        'text': 'Label text',
        'background': {
          'enabled': true,
          'fill': '#212121 0.7',
          'corners': 3
        },
        'padding': {
          'top': 5,
          'right': 10,
          'bottom': 5,
          'left': 10
        },
        'width': null,
        'height': null,
        'anchor': null,
        'offsetX': 0,
        'offsetY': 0,
        'minFontSize': 8,
        'maxFontSize': 72,
        'adjustFontSize': {
          'width': false,
          'height': false
        },
        'rotation': 0
      },
      'zIndex': 41
    },
    'xZoom': {
      'continuous': true,
      'startRatio': 0,
      'endRatio': 1
    },
    'xScroller': {
      'enabled': false,
      'fill': '#fff',
      'selectedFill': '#1976d2 0.2',
      'outlineStroke': 'none',
      'height': 10,
      'minHeight': null,
      'maxHeight': null,
      'autoHide': false,
      'orientation': 'bottom',
      'position': 'afterAxes',
      'allowRangeChange': true,
      'thumbs': {
        'enabled': true,
        'autoHide': false,
        'fill': '#f7f7f7',
        'stroke': '#7c868e',
        'hoverFill': '#ffffff',
        'hoverStroke': '#545f69'
      },
      'zIndex': 35
    }
  },

  // merge with cartesian
  'area': {
    'background': {
      'enabled': true
    },
    'xAxes': [{}],
    'yAxes': [{}],
    'grids': [],
    'minorGrids': [],
    'padding': {
      'top': 30,
      'right': 20,
      'bottom': 20,
      'left': 20
    },
    'tooltip': {
      'displayMode': 'union'
    },
    'interactivity': {
      'hoverMode': 'byX'
    }
  },
  'bar': {
    'background': {
      'enabled': true
    },
    'barChartMode': true,
    'defaultGridSettings': {
      'layout': 'vertical'
    },
    'defaultMinorGridSettings': {
      'layout': 'vertical'
    },
    'defaultLineMarkerSettings': {
      'layout': 'vertical'
    },
    'defaultTextMarkerSettings': {
      'layout': 'vertical'
    },
    'defaultRangeMarkerSettings': {
      'layout': 'vertical'
    },
    'defaultXAxisSettings': {
      'orientation': 'left',
      'labels': {
        'padding': {
          'top': 0,
          'right': 5,
          'bottom': 0,
          'left': 5
        }
      },
      'minorLabels': {
        'padding': {
          'top': 0,
          'right': 5,
          'bottom': 0,
          'left': 5
        }
      }
    },
    'defaultYAxisSettings': {
      'orientation': 'bottom',
      'labels': {
        'padding': {
          'top': 5,
          'right': 0,
          'bottom': 5,
          'left': 0
        }
      },
      'minorLabels': {
        'padding': {
          'top': 5,
          'right': 0,
          'bottom': 5,
          'left': 0
        }
      }
    },
    'xAxes': [{}],
    'yAxes': [{}],
    'grids': [],
    'minorGrids': [],
    'scales': [
      {
        'type': 'ordinal',
        'inverted': true,
        'names': [],
        'ticks': {
          'interval': 1
        }
      },
      {
        'type': 'linear',
        'inverted': false,
        'maximum': null,
        'minimum': null,
        'minimumGap': 0.1,
        'maximumGap': 0.1,
        'softMinimum': null,
        'softMaximum': null,
        'ticks': {
          'mode': 'linear',
          'base': 0,
          'minCount': 4,
          'maxCount': 6
        },
        'minorTicks': {
          'mode': 'linear',
          'base': 0,
          'count': 5
        },
        'stackMode': 'none',
        'stickToZero': true
      }
    ],
    'padding': {
      'top': 30,
      'right': 20,
      'bottom': 20,
      'left': 20
    },
    'tooltip': {
      'displayMode': 'single',
      'position': 'right',
      'anchor': 'left',
      'offsetX': 10,
      'offsetY': 0
    },
    'xScroller': {
      'orientation': 'left'
    }
  },
  'box': {
    'background': {
      'enabled': true
    },
    'xAxes': [{}],
    'yAxes': [{}],
    'grids': [],
    'minorGrids': [],
    'padding': {
      'top': 30,
      'right': 20,
      'bottom': 20,
      'left': 20
    }
  },
  'column': {
    'background': {
      'enabled': true
    },
    'xAxes': [{}],
    'yAxes': [{}],
    'grids': [],
    'minorGrids': [],
    'padding': {
      'top': 30,
      'right': 20,
      'bottom': 20,
      'left': 20
    },
    'tooltip': {
      'displayMode': 'single',
      'position': 'top',
      'anchor': 'bottom',
      'offsetX': 0,
      'offsetY': 10
    }
  },
  'financial': {
    'background': {
      'enabled': true
    },
    'xAxes': [
      {
        'labels': {
          /**
           * @this {*}
           * @return {*}
           */
          'textFormatter': function() {
            var date = new Date(this['tickValue']);
            var day = date.getUTCDate();
            var month = date.getUTCMonth();
            var year = date.getUTCFullYear();
            var res = [' ', day, ', ', year].join('');
            switch (month) {
              case 0:
                return 'Jan' + res;
              case 1:
                return 'Feb' + res;
              case 2:
                return 'Mar' + res;
              case 3:
                return 'Apr' + res;
              case 4:
                return 'May' + res;
              case 5:
                return 'Jun' + res;
              case 6:
                return 'Jul' + res;
              case 7:
                return 'Aug' + res;
              case 8:
                return 'Sep' + res;
              case 9:
                return 'Oct' + res;
              case 10:
                return 'Nov' + res;
              case 11:
                return 'Dec' + res;
            }
            return 'Invalid date';
          }
        }
      }
    ],
    'yAxes': [{}],
    'grids': [],
    'minorGrids': [],
    'scales': [
      {
        'type': 'dateTime',
        'inverted': false,
        'maximum': null,
        'minimum': null,
        'minimumGap': 0.1,
        'maximumGap': 0.1,
        'softMinimum': null,
        'softMaximum': null,
        'ticks': {
          'count': 4
        },
        'minorTicks': {
          'count': 4
        }
      },
      {
        'type': 'linear',
        'inverted': false,
        'maximum': null,
        'minimum': null,
        'minimumGap': 0.1,
        'maximumGap': 0.1,
        'softMinimum': null,
        'softMaximum': null,
        'ticks': {
          'mode': 'linear',
          'base': 0,
          'minCount': 4,
          'maxCount': 6
        },
        'minorTicks': {
          'mode': 'linear',
          'base': 0,
          'count': 5
        },
        'stackMode': 'none',
        'stickToZero': true
      }
    ],
    'padding': {
      'top': 30,
      'right': 20,
      'bottom': 20,
      'left': 20
    }
  },
  'line': {
    'background': {
      'enabled': true
    },
    'xAxes': [{}],
    'yAxes': [{}],
    'grids': [],
    'minorGrids': [],
    'padding': {
      'top': 30,
      'right': 20,
      'bottom': 20,
      'left': 20
    },
    'tooltip': {
      'displayMode': 'union'
    },
    'interactivity': {
      'hoverMode': 'byX'
    }
  },

  // merge with chart
  'heatMap': {
    'scales': [
      {
        'type': 'ordinal',
        'inverted': false,
        'names': [],
        'ticks': {
          'interval': 1
        }
      },
      {
        'type': 'ordinal',
        'inverted': true,
        'names': [],
        'ticks': {
          'interval': 1
        }
      },
      {
        'type': 'ordinalColor'
      }
    ],
    'colorScale': 2,
    'background': {
      'enabled': true
    },
    'xAxes': [{}],
    'yAxes': [{}],
    'grids': [],
    'padding': {
      'top': 30,
      'right': 20,
      'bottom': 20,
      'left': 20
    },
    'tooltip': {
      'enabled': true,
      'title': {
        'enabled': true,
        'fontSize': 13,
        'fontWeight': 'normal'
      },
      'content': {'fontSize': 11},
      'separator': {'enabled': true},
      /**
       * @this {*}
       * @return {*}
       */
      'titleFormatter': function() {
        return this['name'] || this['x'];
      },
      /**
       * @this {*}
       * @return {*}
       */
      'textFormatter': function() {
        if (goog.isDef(this['heat'])) {
          var value = 'Value: ' + this['valuePrefix'] + this['heat'] + this['valuePostfix'];
          if (!isNaN(+this['heat']))
            value += '\n' + 'Percent Value: ' + (this['heat'] * 100 / this['getStat']('sum')).toFixed(1) + '%';
          return value;
        } else {
          return 'x: ' + this['x'] + ' y: ' + this['y'];
        }
      }
    },
    'legendItem': {
      'iconStroke': null
    },
    'legend': {
      'itemsSourceMode': 'categories'
    },

    /**
     * @this {*}
     * @return {*}
     */
    'fill': function() {
      var color;
      if (this['colorScale']) {
        var value = this['iterator']['get']('heat');
        color = this['colorScale']['valueToColor'](value);
      } else {
        color = window['anychart']['color']['setOpacity'](this['sourceColor'], 0.85, true);
      }
      return color;
    },
    /**
     * @this {*}
     * @return {*}
     */
    'hoverFill': function() {
      return window['anychart']['color']['setOpacity'](this['sourceColor'], 0.6, true);
    },
    'selectFill': '#333333',
    /**
     * @this {*}
     * @return {*}
     */
    'stroke': function() {
      var color;
      if (this['colorScale']) {
        var value = this['iterator']['get']('heat');
        color = this['colorScale']['valueToColor'](value);
      } else {
        color = this['sourceColor'];
      }
      return window['anychart']['color']['setThickness'](color, 1 , .85);
    },
    /**
     * @this {*}
     * @return {*}
     */
    'hoverStroke': function() {
      return window['anychart']['color']['setThickness'](this['sourceColor'], 1, .85);
    },
    'selectStroke': null,

    'labels': {
      'enabled': false,
      'fontSize': 11,
      'adjustFontSize': true,
      'minFontSize': 7,
      'maxFontSize': 15,
      'hAlign': 'center',
      'vAlign': 'center',
      'textWrap': 'noWrap',
      'fontWeight': 'normal',
      'fontColor': '#333',
      'selectable': false,

      'background': {
        'enabled': false
      },
      'padding': {
        'top': 2,
        'right': 4,
        'bottom': 2,
        'left': 4
      },
      'position': 'center',
      'anchor': 'center',
      'offsetX': 0,
      'offsetY': 0,
      'rotation': 0,
      'width': null,
      'height': null,
      /**
       * @this {*}
       * @return {*}
       */
      'textFormatter': function() {
        return this['heat'];
      },
      /**
       * @this {*}
       * @return {*}
       */
      'positionFormatter': function() {
        return this['value'];
      }
    },
    'hoverLabels': {
      'enabled': null
    },
    'selectLabels': {
      'fontColor': '#f5f500',
      'enabled': null
    },

    'markers': {
      'enabled': false,
      'disablePointerEvents': false,
      'position': 'center',
      'rotation': 0,
      'anchor': 'center',
      'offsetX': 0,
      'offsetY': 0,
      //'type': null,
      'size': 4,
      //'fill': '', // autoFill
      //'stroke': '', // autoStroke
      /**
       * @this {*}
       * @return {*}
       */
      'positionFormatter': function() {
        return this['value'];
      }
    },
    'hoverMarkers': {
      'enabled': null,
      'size': 6
    },
    'selectMarkers': {
      'enabled': null,
      'fill': '#f5f500'
    },
    'labelsDisplayMode': 'drop',

    'hatchFill': false,
    //'hoverHatchFill': null,

    'clip': true,
    'xZoom': {
      'continuous': true,
      'startRatio': 0,
      'endRatio': 1
    },
    'xScroller': {
      'enabled': false,
      'fill': '#fff',
      'selectedFill': '#1976d2 0.2',
      'outlineStroke': 'none',
      'height': 10,
      'minHeight': null,
      'maxHeight': null,
      'autoHide': false,
      'orientation': 'bottom',
      'position': 'afterAxes',
      'allowRangeChange': true,
      'thumbs': {
        'enabled': true,
        'autoHide': false,
        'fill': '#f7f7f7',
        'stroke': '#7c868e',
        'hoverFill': '#ffffff',
        'hoverStroke': '#545f69'
      },
      'zIndex': 35
    },
    'yZoom': {
      'continuous': true,
      'startRatio': 0,
      'endRatio': 1
    },
    'yScroller': {
      'enabled': false,
      'fill': '#fff',
      'selectedFill': '#1976d2 0.2',
      'outlineStroke': 'none',
      'height': 10,
      'minHeight': null,
      'maxHeight': null,
      'autoHide': false,
      'orientation': 'left',
      'position': 'afterAxes',
      'allowRangeChange': true,
      'thumbs': {
        'enabled': true,
        'autoHide': false,
        'fill': '#f7f7f7',
        'stroke': '#7c868e',
        'hoverFill': '#ffffff',
        'hoverStroke': '#545f69'
      },
      'zIndex': 35
    }
  },

  // merge with chart
  'scatter': {
    'legend': {
      'enabled': false
    },
    'defaultSeriesSettings': {
      'base': {
        /**
         * @this {*}
         * @return {*}
         */
        'fill': function() {
          return this['sourceColor'];
        },
        /**
         * @this {*}
         * @return {*}
         */
        'hoverFill': function() {
          return window['anychart']['color']['lighten'](this['sourceColor']);
        },
        /**
         * @this {*}
         * @return {*}
         */
        'selectFill': function() {
          return window['anychart']['color']['darken'](this['sourceColor']);
        },
        /**
         * @this {*}
         * @return {*}
         */
        'stroke': function() {
          return window['anychart']['color']['darken'](this['sourceColor']);
        },
        'hoverStroke': null,
        'selectStroke': null,
        'hatchFill': false,
        //'hoverHatchFill': undefined,

        'labels': {
          'enabled': false,

          'background': {
            'enabled': false
          },
          'padding': {
            'top': 2,
            'right': 4,
            'bottom': 2,
            'left': 4
          },
          'position': 'center',
          'anchor': 'center',
          'offsetX': 0,
          'offsetY': 0,
          'rotation': 0,
          'width': null,
          'height': null,
          /**
           * @this {*}
           * @return {*}
           */
          'textFormatter': function() {
            return this['value'];
          },
          /**
           * @this {*}
           * @return {*}
           */
          'positionFormatter': function() {
            return this['value'];
          }
        },
        'hoverLabels': {
          'enabled': null
        },
        'markers': {
          'enabled': false,
          //'disablePointerEvents': undefined,
          'position': 'center',
          'rotation': 0,
          'anchor': 'center',
          'offsetX': 0,
          'offsetY': 0,
          //'type': undefined,
          'size': 4,
          //'fill': undefined,
          //'stroke': undefined,
          /**
           * @this {*}
           * @return {*}
           */
          'positionFormatter': function() {
            return this['value'];
          }
        },
        'hoverMarkers': {
          'enabled': null,
          'size': 6
        },
        'clip': true,
        'color': null,

        'tooltip': {
          /**
           * @this {*}
           * @return {*}
           */
          'textFormatter': function() {
            return 'x: ' + this['x'] + '\ny: ' + this['valuePrefix'] + this['value'] + this['valuePostfix'];
          }
        },
        'xScale': null,
        'yScale': null,
        'error': {
          'mode': 'both',
          'xError': null,
          //'xUpperError': undefined,
          //'xLowerError': undefined,
          'valueError': null,
          //'valueUpperError': undefined,
          //'valueLowerError': undefined,
          'xErrorWidth': 10,
          'valueErrorWidth': 10,
          /**
           * @this {*}
           * @return {*}
           */
          'xErrorStroke': function() {
            return window['anychart']['color']['setThickness'](window['anychart']['color']['darken'](this['sourceColor']));
          },
          /**
           * @this {*}
           * @return {*}
           */
          'valueErrorStroke': function() {
            return window['anychart']['color']['setThickness'](window['anychart']['color']['darken'](this['sourceColor']));
          }
        }
      },
      'bubble': {
        'displayNegative': false,
        /**
         * @this {*}
         * @return {*}
         */
        'fill': function() {
          return window['anychart']['color']['setOpacity'](this['sourceColor'], 0.7, true);
        },
        /**
         * @this {*}
         * @return {*}
         */
        'hoverFill': function() {
          return window['anychart']['color']['setOpacity'](this['sourceColor'], 0.7, true);
        },
        /**
         * @this {*}
         * @return {*}
         */
        'stroke': function() {
          return window['anychart']['color']['setThickness'](this['sourceColor'], 1.5);
        },
        /**
         * @this {*}
         * @return {*}
         */
        'hoverStroke': function() {
          return window['anychart']['color']['setThickness'](this['sourceColor'], 1.5);
        },
        'legendItem': {
          'iconStroke': null
        },
        /**
         * @this {*}
         * @return {*}
         */
        'negativeFill': function() {
          var darken = window['anychart']['color']['darken'];
          return darken(darken(darken(this['sourceColor'])));
        },
        /**
         * @this {*}
         * @return {*}
         */
        'hoverNegativeFill': function() {
          var darken = window['anychart']['color']['darken'];
          return darken(darken(darken(darken(this['sourceColor']))));
        },
        /**
         * @this {*}
         * @return {*}
         */
        'negativeStroke': function() {
          var darken = window['anychart']['color']['darken'];
          return darken(darken(darken(darken(this['sourceColor']))));
        },
        /**
         * @this {*}
         * @return {*}
         */
        'hoverNegativeStroke': function() {
          var darken = window['anychart']['color']['darken'];
          return darken(darken(darken(darken(darken(this['sourceColor'])))));
        },
        'negativeHatchFill': null,
        'hoverNegativeHatchFill': undefined,
        'hatchFill': false,
        'markers': {
          'position': 'center'
        },
        'tooltip': {
          /**
           * @this {*}
           * @return {*}
           */
          'textFormatter': function() {
            return 'X: ' + this['x'] + '\nY: ' + this['valuePrefix'] + this['value'] + this['valuePostfix'] + '\nSize: ' + this['size'];
          }
        }
      },
      'line': {
        'connectMissingPoints': false,
        /**
         * @this {*}
         * @return {*}
         */
        'stroke': function() {
          return this['sourceColor'];
        },
        /**
         * @this {*}
         * @return {*}
         */
        'hoverStroke': function() {
          return window['anychart']['color']['lighten'](this['sourceColor']);
        },
        'labels': {
          'anchor': 'bottom'
        }
      },
      'marker': {}
    },

    'defaultGridSettings': {
      'enabled': true,
      'isMinor': false,
      'layout': 'horizontal',
      'drawFirstLine': true,
      'drawLastLine': true,
      'oddFill': null,
      'evenFill': null,
      'stroke': '#cecece',
      'scale': 1,
      'zIndex': 11
    },
    'defaultMinorGridSettings': {
      'enabled': true,
      'isMinor': true,
      'layout': 'horizontal',
      'drawFirstLine': true,
      'drawLastLine': true,
      'oddFill': null,
      'evenFill': null,
      'stroke': '#eaeaea',
      'scale': 1,
      'zIndex': 10
    },
    'defaultXAxisSettings': {
      'enabled': true,
      'orientation': 'bottom',
      'title': {
        'text': 'X-Axis',
        'padding': {
          'top': 5,
          'right': 5,
          'bottom': 5,
          'left': 5
        }
      },
      'width': null,
      'scale': 0,
      'labels': {
        'padding': {
          'top': 5,
          'right': 0,
          'bottom': 5,
          'left': 0
        }
      },
      'minorLabels': {
        'padding': {
          'top': 5,
          'right': 0,
          'bottom': 5,
          'left': 0
        }
      }
    },
    'defaultYAxisSettings': {
      'enabled': true,
      'orientation': 'left',
      'title': {
        'text': 'Y-Axis'
      },
      'width': null,
      'labels': {
        'padding': {
          'top': 0,
          'right': 5,
          'bottom': 0,
          'left': 5
        }
      },
      'minorLabels': {
        'padding': {
          'top': 0,
          'right': 5,
          'bottom': 0,
          'left': 5
        }
      },
      'scale': 1
    },
    'defaultLineMarkerSettings': {
      'enabled': true,
      'value': 0,
      'layout': 'horizontal',
      'stroke': {
        'color': '#DC0A0A',
        'thickness': 1,
        'opacity': 1,
        'dash': '',
        'lineJoin': 'miter',
        'lineCap': 'square'
      },
      'zIndex': 25.2,
      'scale': 1
    },
    'defaultTextMarkerSettings': {
      'enabled': true,

      'fontSize': 12,

      'value': 0,
      'anchor': 'center',
      'align': 'center',
      'layout': 'horizontal',
      //'rotation': undefined,
      'offsetX': 0,
      'offsetY': 0,
      'text': 'Text marker',
      'width': null,
      'height': null,
      'zIndex': 25.3,
      'scale': 1
    },
    'defaultRangeMarkerSettings': {
      'enabled': true,
      'from': 0,
      'to': 0,
      'layout': 'horizontal',
      'fill': '#000 0.3',
      'zIndex': 25.1,
      'scale': 1
    },

    'series': [],
    'grids': [],
    'minorGrids': [],
    'xAxes': [{}],
    'yAxes': [{}],
    'lineAxesMarkers': [],
    'rangeAxesMarkers': [],
    'textAxesMarkers': [],

    'scales': [
      {
        'type': 'linear',
        'inverted': false,
        'maximum': null,
        'minimum': null,
        'minimumGap': 0.1,
        'maximumGap': 0.1,
        'softMinimum': null,
        'softMaximum': null,
        'ticks': {
          'mode': 'linear',
          'base': 0,
          'minCount': 4,
          'maxCount': 6
        },
        'minorTicks': {
          'mode': 'linear',
          'base': 0,
          'count': 5
        },
        'stackMode': 'none',
        'stickToZero': true
      },
      {
        'type': 'linear',
        'inverted': false,
        'maximum': null,
        'minimum': null,
        'minimumGap': 0.1,
        'maximumGap': 0.1,
        'softMinimum': null,
        'softMaximum': null,
        'ticks': {
          'mode': 'linear',
          'base': 0,
          'minCount': 4,
          'maxCount': 6
        },
        'minorTicks': {
          'mode': 'linear',
          'base': 0,
          'count': 5
        },
        'stackMode': 'none',
        'stickToZero': true
      }
    ],
    'xScale': 0,
    'yScale': 1,

    'maxBubbleSize': '20%',
    'minBubbleSize': '5%',
    'crosshair': {
      'enabled': false,
      'displayMode': 'float',
      'xStroke': '#cecece',
      'yStroke': '#cecece',
      'xLabel': {
        'x': 0,
        'y': 0,
        'axisIndex': 0,
        /**
         * @this {*}
         * @return {*}
         */
        'textFormatter': function() {
          return this['value'];
        },
        'enabled': true,
        'fontSize': 12,
        'fontColor': '#fff',
        'fontWeight': 400,
        'textWrap': 'byLetter',
        'disablePointerEvents': true,

        'text': 'Label text',
        'background': {
          'enabled': true,
          'fill': '#212121 0.7',
          'corners': 3
        },
        'padding': {
          'top': 5,
          'right': 10,
          'bottom': 5,
          'left': 10
        },
        'width': null,
        'height': null,
        'anchor': null,
        'offsetX': 0,
        'offsetY': 0,
        'minFontSize': 8,
        'maxFontSize': 72,
        'adjustFontSize': {
          'width': false,
          'height': false
        },
        'rotation': 0
      },
      'yLabel': {
        'x': 0,
        'y': 0,
        'axisIndex': 0,
        /**
         * @this {*}
         * @return {*}
         */
        'textFormatter': function() {
          return this['value'];
        },
        'enabled': true,
        'fontSize': 12,
        'fontColor': '#fff',
        'fontWeight': 400,
        'textWrap': 'byLetter',
        'disablePointerEvents': true,

        'text': 'Label text',
        'background': {
          'enabled': true,
          'fill': '#212121 0.7',
          'corners': 3
        },
        'padding': {
          'top': 5,
          'right': 10,
          'bottom': 5,
          'left': 10
        },
        'width': null,
        'height': null,
        'anchor': null,
        'offsetX': 0,
        'offsetY': 0,
        'minFontSize': 8,
        'maxFontSize': 72,
        'adjustFontSize': {
          'width': false,
          'height': false
        },
        'rotation': 0
      },
      'zIndex': 41
    }
  },

  // merge with scatter
  'marker': {},
  'bubble': {},

  // merge with chart
  'bullet': {
    'background': {
      'enabled': false
    },
    'defaultRangeMarkerSettings': {
      'enabled': true,
      'from': 0,
      'to': 0,
      'zIndex': 2
      //'layout': 'horizontal'
      //'fill': '#000 0.3'
    },
    'defaultMarkerSettings': {
      'fill': '#000',
      'stroke': 'none',
      'zIndex': 2
    },
    'layout': 'horizontal',
    'rangePalette': {
      'type': 'distinct',
      'items': ['#828282', '#a8a8a8', '#c2c2c2', '#d4d4d4', '#e1e1e1']
    },
    'markerPalette': {
      'items': ['bar', 'line', 'x', 'ellipse']
    },
    'scale': {
      'type': 'linear',
      'ticks': {
        'mode': 'linear',
        'base': 0,
        'explicit': null,
        'minCount': 3,
        'maxCount': 5,
        'interval': NaN
      },
      'minorTicks': {
        'mode': 'linear',
        'base': 0,
        'explicit': null,
        'count': 5,
        'interval': NaN
      },
      'stackMode': 'none',
      'stickToZero': true,
      'minimumGap': 0,
      'maximumGap': 0,
      'softMinimum': null,
      'softMaximum': null,
      'minimum': null,
      'maximum': null,
      'inverted': false
    },
    'axis': {
      'title': {
        'enabled': false
      },
      'labels': {
        'fontSize': 9,
        'zIndex': 3
      },
      'minorLabels': {
        'padding': {
          'top': 1,
          'right': 1,
          'bottom': 0,
          'left': 1
        },
        'zIndex': 3
      },
      'ticks': {
        'stroke': '#ccc',
        'zIndex': 3
      },
      'minorTicks': {
        'stroke': '#ccc',
        'zIndex': 3
      },
      'stroke': '#ccc',
      'orientation': null,
      'zIndex': 3
    },
    'ranges': [],
    'margin': {
      'top': 10,
      'right': 10,
      'bottom': 10,
      'left': 10
    },
    'title': {
      'rotation': 0
    }
  },

  // merge with chart
  'pie': {
    'title': {
      'text': 'Pie Chart',
      'margin': {
        'bottom': 0
      },
      'padding': {
        'top': 0,
        'right': 0,
        'bottom': 20,
        'left': 0
      }
    },
    'group': false,
    'sort': 'none',
    'radius': '45%',
    'innerRadius': 0,
    'startAngle': 0,
    'explode': 15,
    'outsideLabelsSpace': 30,
    'insideLabelsOffset': '50%',
    'overlapMode': 'noOverlap',
    'connectorLength': 20,
    'outsideLabelsCriticalAngle': 60,
    'connectorStroke': '#000 0.3',
    /**
     * @this {*}
     * @return {*}
     */
    'fill': function() {
      return this['sourceColor'];
    },
    /**
     * @this {*}
     * @return {*}
     */
    'hoverFill': function() {
      return window['anychart']['color']['lighten'](this['sourceColor']);
    },
    'stroke': 'none',
    'hoverStroke': 'none',
    'hatchFill': null,
    //'hoverHatchFill': undefined,
    'forceHoverLabels': false,
    'labels': {
      'enabled': true,
      'fontSize': 13,
      'fontFamily': 'Arial',
      'fontColor': null,
      'background': {
        'enabled': false
      },
      'padding': {
        'top': 1,
        'right': 1,
        'bottom': 1,
        'left': 1
      },
      //'position': undefined,
      'anchor': 'center',
      //'offsetX': undefined,
      //'offsetY': undefined,
      'rotation': 0,
      'width': null,
      'height': null,
      'autoRotate': false,
      /**
       * @this {*}
       * @return {*}
       */
      'textFormatter': function() {
        return (this['value'] * 100 / this['getStat']('sum')).toFixed(1) + '%';
      },
      /**
       * @this {*}
       * @return {*}
       */
      'positionFormatter': function() {
        return this['value'];
      },
      'zIndex': 32
    },
    'outsideLabels': {'autoColor': '#545f69'},
    'insideLabels': {'autoColor': '#fff'},
    'hoverLabels': {
      'enabled': null
    },
    'tooltip': {
      'enabled': true,
      'title': {
        'enabled': true,
        'fontSize': 13,
        'fontWeight': 'normal'
      },
      'content': {'fontSize': 11},
      'separator': {'enabled': true},
      /**
       * @this {*}
       * @return {*}
       */
      'titleFormatter': function() {
        return this['name'] || this['x'];
      },
      /**
       * @this {*}
       * @return {*}
       */
      'textFormatter': function() {
        return 'Value: ' + this['valuePrefix'] + this['value'] + this['valuePostfix'] + '\n' +
            'Percent Value: ' + (this['value'] * 100 / this['getStat']('sum')).toFixed(1) + '%';
      }
    },
    'legend': {
      'enabled': true,
      'position': 'bottom',
      'align': 'center',
      'itemsLayout': 'horizontal',
      'title': {
        'enabled': false
      },
      'titleSeparator': {
        'enabled': false,
        'margin': {
          'top': 3,
          'right': 0,
          'bottom': 3,
          'left': 0
        }
      }
    },
    'interactivity': {
      'hoverMode': 'single'
    }
  },

  // merge with pie
  'pie3d': {
    'explode': '5%',
    'connectorLength': '15%'
  },

  // merge with chart
  'pieFunnelPyramidBase': {
    'baseWidth': '90%',
    'connectorLength': 20,
    'connectorStroke': '#7c868e',
    'overlapMode': 'noOverlap',
    'pointsPadding': 5,
    /**
     * @this {*}
     * @return {*}
     */
    'fill': function() {
      return this['sourceColor'];
    },
    /**
     * @this {*}
     * @return {*}
     */
    'hoverFill': function() {
      return window['anychart']['color']['lighten'](this['sourceColor']);
    },
    /**
     * @this {*}
     * @return {*}
     */
    'stroke': function() {
      return window['anychart']['color']['setThickness'](this['sourceColor'], 1.5);
    },
    /**
     * @this {*}
     * @return {*}
     */
    'hoverStroke': function() {
      return window['anychart']['color']['setThickness'](this['sourceColor'], 1.5);
    },
    'hatchFill': null,
    //'hoverHatchFill': undefined,
    'labels': {
      'enabled': true,

      'fontSize': 13,
      'fontFamily': 'Arial',
      'fontColor': null,
      'disablePointerEvents': false,

      'background': {
        'enabled': false
      },
      'padding': {
        'top': 1,
        'right': 1,
        'bottom': 1,
        'left': 1
      },
      'position': 'outsideLeftInColumn',
      'anchor': 'center',
      //'offsetX': undefined,
      //'offsetY': undefined,
      'rotation': 0,
      'width': null,
      'height': null,
      /**
       * @this {*}
       * @return {*}
       */
      'textFormatter': function() {
        return this['name'] ? this['name'] : this['x'];
      },
      /**
       * @this {*}
       * @return {*}
       */
      'positionFormatter': function() {
        return this['value'];
      },
      'zIndex': 34
    },
    'outsideLabels': {'autoColor': '#545f69'},
    'insideLabels': {'autoColor': '#fff'},
    'hoverLabels': {
      'enabled': null,

      'padding': {
        'top': 1,
        'right': 1,
        'bottom': 1,
        'left': 1
      }
    },
    'markers': {
      'enabled': false,
      //'disablePointerEvents': undefined,
      //'position': undefined,
      'rotation': 0,
      'anchor': 'center',
      'offsetX': 0,
      'offsetY': 0,
      //'type': undefined,
      'size': 8,
      //'fill': undefined,
      //'stroke': undefined,
      /**
       * @this {*}
       * @return {*}
       */
      'positionFormatter': function() {
        return this['value'];
      },
      'zIndex': 33
    },
    'hoverMarkers': {
      'enabled': null,
      'size': 12
    },
    'tooltip': {
      'enabled': true,
      'title': {
        'enabled': true,
        'fontSize': 13,
        'fontWeight': 'normal'
      },
      'content': {'fontSize': 11},
      'separator': {'enabled': true},
      /**
       * @this {*}
       * @return {*}
       */
      'titleFormatter': function() {
        return this['name'] || this['x'];
      },
      /**
       * @this {*}
       * @return {*}
       */
      'textFormatter': function() {
        return 'Value: ' + this['valuePrefix'] + this['value'] + this['valuePostfix'] + '\n' +
            'Percent Value: ' + (this['value'] * 100 / this['getStat']('sum')).toFixed(1) + '%';
      }
    },
    'legend': {
      'margin': {
        'top': 0,
        'right': 0,
        'bottom': 0,
        'left': 0
      },
      'tooltip': {
        /**
         * @this {*}
         * @return {*}
         */
        'textFormatter': function() {
          return (this['value']) + '\n' + this['valuePrefix'] + this['meta']['pointValue'] + this['valuePostfix'];
        }
      },
      'zIndex': 35,
      'position': 'right',
      'hAlign': 'left',
      'vAlign': 'middle',
      'itemsLayout': 'vertical',
      'enabled': false
    },
    'interactivity': {
      'hoverMode': 'single'
    }
  },

  // merge with pyramidFunnel
  'funnel': {
    'title': {
      'text': 'Funnel Chart'
    },
    'neckWidth': '30%',
    'neckHeight': '25%'
  },
  'pyramid': {
    'title': {
      'text': 'Pyramid Chart'
    },
    'reversed': false,
    'legend': {
      'inverted': true
    }
  },

  // merge with chart
  'radar': {
    'title': {
      'padding': {
        'top': 0,
        'right': 0,
        'bottom': 20,
        'left': 0
      }
    },
    'defaultSeriesSettings': {
      'base': {
        'enabled': true,
        'hatchFill': null,
        'labels': {'enabled': false, 'position': 'center'},
        'hoverLabels': {'enabled': null, 'position': 'center'},
        'markers': {
          'enabled': false,
          'disablePointerEvents': false,
          'position': 'center',
          'rotation': 0,
          'anchor': 'center',
          'offsetX': 0,
          'offsetY': 0,
          //'type': null,
          'size': 4,
          //'fill': '', // autoFill
          //'stroke': '', // autoStroke
          /**
           * @this {*}
           * @return {*}
           */
          'positionFormatter': function() {
            return this['value'];
          }
        },
        'hoverMarkers': {'enabled': null, 'size': 6}
      },
      'area': {
        /**
         * @this {*}
         * @return {*}
         */
        'fill': function() {
          return window['anychart']['color']['setOpacity'](this['sourceColor'], 0.6, true);
        },
        /**
         * @this {*}
         * @return {*}
         */
        'hoverFill': function() {
          return window['anychart']['color']['setOpacity'](this['sourceColor'], 0.6, true);
        },
        /**
         * @this {*}
         * @return {*}
         */
        'stroke': function() {
          return window['anychart']['color']['setThickness'](this['sourceColor'], 1.5);
        },
        /**
         * @this {*}
         * @return {*}
         */
        'hoverStroke': function() {
          return window['anychart']['color']['setThickness'](this['sourceColor'], 1.5);
        },
        'legendItem': {
          'iconStroke': null
        },
        'markers': {
          'enabled': false,
          'position': 'center'
        }
      },
      'line': {
        'markers': {'enabled': false, 'position': 'center'},
        /**
         * @this {*}
         * @return {*}
         */
        'stroke': function() {
          var color = window['anychart']['color']['setThickness'](this['sourceColor'], 2);
          color['opacity'] = 1;
          return color;
        },
        'legendItem': {
          'iconType': 'line'
        },
        /**
         * @this {*}
         * @return {*}
         */
        'hoverStroke': function() {
          return window['anychart']['color']['lighten'](this['sourceColor']);
        }
      },
      'marker': {}
    },
    'defaultGridSettings': {
      'enabled': true,
      'isMinor': false,
      'layout': 'radial',
      'drawLastLine': true,
      'oddFill': 'none',
      'evenFill': 'none',
      'stroke': '#DDDDDD',
      'zIndex': 10,
      'xScale': 0,
      'yScale': 1
    },
    'defaultMinorGridSettings': {
      'enabled': true,
      'isMinor': true,
      'layout': 'circuit',
      'drawLastLine': true,
      'oddFill': 'none',
      'evenFill': 'none',
      'stroke': '#333333',
      'zIndex': 10,
      'xScale': 0,
      'yScale': 1
    },
    'xAxis': {
      'stroke': '#eaeaea',
      'ticks': {
        'enabled': false,
        'stroke': '#cecece',
        'length': 6
      },
      'labels': {
        'hAlign': 'center',
        'padding': {
          'top': 2,
          'right': 5,
          'bottom': 2,
          'left': 5
        },
        'fontSize': 12
      },
      'scale': 0,
      'zIndex': 25
    },
    'yAxis': {
      'stroke': '#b9b9b9',
      'drawLastLabel': false,
      'labels': {
        'hAlign': 'center',
        'padding': {
          'top': 0,
          'right': 2,
          'bottom': 0,
          'left': 0
        },
        'fontSize': 11
      },
      'minorLabels': {
        'padding': {'top': 1, 'right': 1, 'bottom': 0, 'left': 1}
      },
      'ticks': {
        'enabled': true,
        'stroke': '#b9b9b9',
        'length': 6
      },
      'minorTicks': {
        'stroke': '#eaeaea',
        'length': 4
      },
      'scale': 1
    },
    'startAngle': 0,
    'grids': [{}],
    'minorGrids': [],
    'scales': [
      {
        'type': 'ordinal',
        'inverted': false,
        'names': [],
        'ticks': {
          'interval': 1
        }
      },
      {
        'type': 'linear',
        'inverted': false,
        'maximum': null,
        'minimum': null,
        'minimumGap': 0.1,
        'maximumGap': 0.1,
        'softMinimum': null,
        'softMaximum': null,
        'ticks': {
          'mode': 'linear',
          'base': 0,
          'minCount': 4,
          'maxCount': 6
        },
        'minorTicks': {
          'mode': 'linear',
          'base': 0,
          'count': 5
        },
        'stackMode': 'none',
        'stickToZero': true
      }
    ],
    'xScale': 0,
    'yScale': 1
  },

  // merge with chart
  'polar': {
    'title': {
      'padding': {
        'top': 0,
        'right': 0,
        'bottom': 20,
        'left': 0
      }
    },
    'defaultSeriesSettings': {
      'base': {
        'enabled': true,
        'hatchFill': null,
        'labels': {'enabled': false, 'position': 'center'},
        'hoverLabels': {'enabled': null, 'position': 'center'},
        'markers': {
          'enabled': false,
          'disablePointerEvents': false,
          'position': 'center',
          'rotation': 0,
          'anchor': 'center',
          'offsetX': 0,
          'offsetY': 0,
          //'type': null,
          'size': 4,
          //'fill': '', // autoFill
          //'stroke': '', // autoStroke
          /**
           * @this {*}
           * @return {*}
           */
          'positionFormatter': function() {
            return this['value'];
          }
        },
        'hoverMarkers': {'enabled': null, 'size': 6}
      },
      'area': {
        /**
         * @this {*}
         * @return {*}
         */
        'fill': function() {
          return window['anychart']['color']['setOpacity'](this['sourceColor'], 0.6, true);
        },
        /**
         * @this {*}
         * @return {*}
         */
        'hoverFill': function() {
          return window['anychart']['color']['setOpacity'](this['sourceColor'], 0.6, true);
        },
        /**
         * @this {*}
         * @return {*}
         */
        'selectFill': function() {
          return window['anychart']['color']['setOpacity'](this['sourceColor'], 0.9, true);
        },
        /**
         * @this {*}
         * @return {*}
         */
        'stroke': function() {
          return window['anychart']['color']['setThickness'](this['sourceColor'], 1.5);
        },
        /**
         * @this {*}
         * @return {*}
         */
        'hoverStroke': function() {
          return window['anychart']['color']['setThickness'](this['sourceColor'], 1.5);
        },
        /**
         * @this {*}
         * @return {*}
         */
        'selectStroke': function() {
          return window['anychart']['color']['setThickness'](this['sourceColor'], 1.5);
        },
        'legendItem': {
          'iconStroke': null
        }
      },
      'line': {
        'markers': {'enabled': false},
        'legendItem': {
          'iconType': 'line'
        },
        /**
         * @this {*}
         * @return {*}
         */
        'stroke': function() {
          var color = window['anychart']['color']['setThickness'](this['sourceColor'], 2);
          color['opacity'] = 1;
          return color;
        },
        /**
         * @this {*}
         * @return {*}
         */
        'hoverStroke': function() {
          return window['anychart']['color']['lighten'](this['sourceColor']);
        },
        /**
         * @this {*}
         * @return {*}
         */
        'selectStroke': function() {
          return window['anychart']['color']['darken'](this['sourceColor']);
        }
      },
      'marker': {}
    },
    'defaultGridSettings': {
      'enabled': true,
      'isMinor': false,
      'layout': 'radial',
      'drawLastLine': true,
      'oddFill': 'none',
      'evenFill': 'none',
      'stroke': '#DDDDDD',
      'zIndex': 10,
      'xScale': 0,
      'yScale': 1
    },
    'defaultMinorGridSettings': {
      'enabled': true,
      'isMinor': true,
      'layout': 'circuit',
      'drawLastLine': true,
      'oddFill': 'none',
      'evenFill': 'none',
      'stroke': '#333333',
      'zIndex': 10,
      'xScale': 0,
      'yScale': 1
    },
    'xAxis': {
      'stroke': '#eaeaea',
      'ticks': {
        'enabled': false,
        'stroke': '#cecece',
        'length': 6
      },
      'labels': {
        'hAlign': 'center',
        'padding': {
          'top': 2,
          'right': 5,
          'bottom': 2,
          'left': 5
        },
        'fontSize': 12
      },
      'scale': 0,
      'zIndex': 25
    },
    'yAxis': {
      'stroke': '#b9b9b9',
      'drawLastLabel': false,
      'labels': {
        'hAlign': 'center',
        'padding': {
          'top': 0,
          'right': 2,
          'bottom': 0,
          'left': 0
        },
        'fontSize': 11
      },
      'minorLabels': {
        'padding': {'top': 1, 'right': 1, 'bottom': 0, 'left': 1}
      },
      'ticks': {
        'enabled': true,
        'stroke': '#b9b9b9',
        'length': 6
      },
      'minorTicks': {
        'stroke': '#eaeaea',
        'length': 4
      },
      'scale': 1
    },
    'startAngle': 0,
    'grids': [{}],
    'minorGrids': [],
    'scales': [
      {
        'type': 'linear',
        'inverted': false,
        'maximum': null,
        'minimum': null,
        'minimumGap': 0.1,
        'maximumGap': 0.1,
        'softMinimum': null,
        'softMaximum': null,
        'ticks': {
          'mode': 'linear',
          'base': 0,
          'minCount': 4,
          'maxCount': 6
        },
        'minorTicks': {
          'mode': 'linear',
          'base': 0,
          'count': 5
        },
        'stackMode': 'none',
        'stickToZero': true
      },
      {
        'type': 'linear',
        'inverted': false,
        'maximum': null,
        'minimum': null,
        'minimumGap': 0.1,
        'maximumGap': 0.1,
        'softMinimum': null,
        'softMaximum': null,
        'ticks': {
          'mode': 'linear',
          'base': 0,
          'minCount': 4,
          'maxCount': 6
        },
        'minorTicks': {
          'mode': 'linear',
          'base': 0,
          'count': 5
        },
        'stackMode': 'none',
        'stickToZero': true
      }
    ],
    'xScale': 0,
    'yScale': 1
  },

  // merge with chart
  'sparkline': {
    'title': {
      'enabled': false,
      'padding': {
        'top': 0,
        'right': 0,
        'bottom': 0,
        'left': 0
      },
      'margin': {
        'top': 0,
        'right': 0,
        'bottom': 0,
        'left': 0
      },
      'orientation': 'right',
      'rotation': 0
    },
    'background': {
      'enabled': false
    },
    'margin': {
      'top': 0,
      'right': 0,
      'bottom': 0,
      'left': 0
    },
    'padding': {
      'top': 0,
      'right': 0,
      'bottom': 0,
      'left': 0
    },
    'defaultSeriesSettings': {
      'base': {
        'markers': {
          'enabled': false,
          'position': 'center',
          'anchor': 'center',
          'type': 'circle',
          'size': 1.8,
          'stroke': 'none'
        },
        'labels': {
          'enabled': false,
          'fontSize': 8,
          'background': {
            enabled: false
          },
          'position': 'center',
          'anchor': 'centerBottom'
        },
        'minLabels': {
          'position': 'bottom',
          'anchor': 'bottomCenter'
        },
        'maxLabels': {
          'position': 'top',
          'anchor': 'topCenter'
        },
        'color': '#64b5f6'
      },
      'area': {
        'stroke': '#64b5f6',
        'fill': '#64b5f6 0.5'
      },
      'column': {
        'markers': {
          'position': 'centerTop'
        },
        'labels': {
          'position': 'centerTop',
          'anchor': 'centerBottom'
        },
        'negativeMarkers': {
          'position': 'centerBottom'
        },
        'negativeLabels': {
          'position': 'centerBottom',
          'anchor': 'centerTop'
        },
        'fill': '#64b5f6',
        'negativeFill': '#ef6c00'
      },
      'line': {
        'stroke': '#64b5f6'
      },
      'winLoss': {
        'markers': {
          'position': 'centerTop',
          'anchor': 'centerTop'
        },
        'labels': {
          'position': 'centerTop',
          'anchor': 'centerTop'
        },
        'negativeMarkers': {
          'position': 'centerBottom',
          'anchor': 'centerBottom'
        },
        'negativeLabels': {
          'position': 'centerBottom',
          'anchor': 'centerBottom'
        },
        'fill': '#64b5f6',
        'negativeFill': '#ef6c00'
      }
    },
    'defaultLineMarkerSettings': {
      'enabled': true,
      'value': 0,
      'layout': 'horizontal',
      'stroke': {
        'color': '#DC0A0A',
        'thickness': 1,
        'opacity': 1,
        'dash': '',
        'lineJoin': 'miter',
        'lineCap': 'square'
      },
      'zIndex': 25.2,
      'scale': 1
    },
    'defaultTextMarkerSettings': {
      'enabled': true,

      'value': 0,
      'anchor': 'center',
      'align': 'center',
      'layout': 'horizontal',
      //'rotation': undefined,
      'offsetX': 0,
      'offsetY': 0,
      'text': 'Text marker',
      'width': null,
      'height': null,
      'zIndex': 25.3,
      'scale': 1
    },
    'defaultRangeMarkerSettings': {
      'enabled': true,
      'from': 0,
      'to': 0,
      'layout': 'horizontal',
      'fill': '#000 0.3',
      'zIndex': 25.1,
      'scale': 1
    },

    //'stroke': undefined,
    //'fill': undefined,
    //'firstFill': undefined,
    //'lastFill': undefined,
    //'negativeFill': undefined,
    //'minFill': undefined,
    //'maxFill': undefined,
    'hatchFill': null,
    //'firstHatchFill': undefined,
    //'lastHatchFill': undefined,
    //'negativeHatchFill': undefined,
    //'minHatchFill': undefined,
    //'maxHatchFill': undefined,

    'markers': {
    },
    'firstMarkers': {
      'fill': '#64b5f6'
    },
    'lastMarkers': {
      'fill': '#64b5f6'
    },
    'negativeMarkers': {
      'fill': '#ef6c00'
    },
    'minMarkers': {
      'fill': '#455a64'
    },
    'maxMarkers': {
      'fill': '#dd2c00'
    },

    'labels': {},
    'firstLabels': {},
    'lastLabels': {},
    'negativeLabels': {},
    'minLabels': {
      'fontSize': 9,
      'padding': {
        'top': 3,
        'right': 0,
        'bottom': 3,
        'left': 0
      },
      'fontColor': '#303f46'
    },
    'maxLabels': {
      'fontSize': 9,
      'padding': {
        'top': 3,
        'right': 0,
        'bottom': 3,
        'left': 0
      },
      'fontColor': '#9b1f00'
    },

    'lineAxesMarkers': [],
    'rangeAxesMarkers': [],
    'textAxesMarkers': [],
    'scales': [
      {
        'type': 'ordinal',
        'inverted': false,
        'names': [],
        'ticks': {
          'interval': 1
        }
      },
      {
        'type': 'linear',
        'inverted': false,
        'maximum': null,
        'minimum': null,
        'minimumGap': 0.1,
        'maximumGap': 0.1,
        'softMinimum': null,
        'softMaximum': null,
        'ticks': {
          'mode': 'linear',
          'base': 0,
          'minCount': 4,
          'maxCount': 6
        },
        'minorTicks': {
          'mode': 'linear',
          'base': 0,
          'count': 5
        },
        'stackMode': 'none',
        'stickToZero': true
      }
    ],
    'xScale': 0,
    'yScale': 1,
    'clip': true,
    'seriesType': 'line',
    'connectMissingPoints': false,
    'pointWidth': '95%',
    'tooltip': {
      'displayMode': 'single',
      'title': {
        'enabled': false
      },
      'titleFormatter': function() {
        return 'Tooltip title';
      },
      /**
       * @return {string}
       * @this {*}
       */
      'textFormatter': function() {
        if (this['chart']['type'] && this['chart']['type']() == 'winLoss') {
          var res = this['value'];
          if (res > 0)
            res = 'Win';
          else if (res < 0)
            res = 'Loss';
          else
            res = 'Draw';
          return 'x: ' + this['x'] + '\n' + res;
        }
        return 'x: ' + this['x'] + '\ny: ' + this['valuePrefix'] + this['value'] + this['valuePostfix'];
      }
    }
  },

  // merge with chart
  'circularGauge': {
    'title': {
      'enabled': false
    },
    'defaultAxisSettings': {
      'startAngle': null,
      'labels': {'position': 'inside', 'adjustFontSize': true},
      'minorLabels': {'position': 'inside', 'adjustFontSize': true},
      'fill': 'black .3',
      'ticks': {
        'hatchFill': false,
        'type': 'line',
        'position': 'center',
        'length': null,
        'fill': 'red',
        'stroke': 'none'
      },
      'minorTicks': {
        'hatchFill': false,
        'type': 'line',
        'position': 'center',
        'length': null,
        'fill': 'red',
        'stroke': 'none'
      },
      'zIndex': 10
    },
    'defaultPointerSettings': {
      'base': {
        'enabled': true,
        'fill': '#f22922',
        'stroke': '#f22922',
        'hatchFill': false,
        'axisIndex': 0
        //'dataIndex': undefined
      },
      'bar': {
        'position': 'center'
        //'width': undefined,
        //'radius': undefined
      },
      'marker': {
        'size': 4,
        'hoverSize': 6,
        'position': 'inside',
        'type': 'triangleUp'
      },
      'needle': {
        //'startRadius': undefined,
        //'middleRadius': undefined,
        //'endRadius': undefined,
        //'startWidth': undefined,
        //'middleWidth': undefined,
        //'endWidth': undefined
      },
      'knob': {
        'fill': {
          'keys': ['rgb(255, 255, 255)', 'rgb(220, 220, 220)'],
          'angle': 135
        },
        'stroke': '2 #ccc',
        'verticesCount': 6,
        'verticesCurvature': .5,
        'topRatio': .5,
        'bottomRatio': .5
        //'topRadius': undefined,
        //'bottomRadius': undefined
      }
    },
    'defaultRangeSettings': {
      'enabled': true,
      'axisIndex': 0,
      //'from': undefined,
      //'to': undefined,
      'fill': '#008000 .5',
      'position': 'center',
      'startSize': 0,
      'endSize': '10%'
      //'radius': undefined
    },
    'fill': {
      'keys': ['#fff', '#dcdcdc'],
      'angle': 315
    },
    //'stroke': undefined,
    'startAngle': 0,
    'sweepAngle': 360,
    'cap': {
      'enabled': false,
      'fill': {
        'keys': ['#D3D3D3', '#6F6F6F'],
        'angle': -45
      },
      'stroke': 'none',
      'hatchFill': false,
      'radius': '15%',
      'zIndex': 50
    },
    'circularPadding': '10%',
    'encloseWithStraightLine': false,
    'axes': [],
    'bars': [],
    'markers': [],
    'needles': [],
    'knobs': [],
    'ranges': [],
    'interactivity': {
      'hoverMode': 'single'
    },
    'tooltip': {
      'enabled': false,
      'title': {
        'enabled': false
      },
      /**
       * @this {*}
       * @return {*}
       */
      'titleFormatter': function() {
        return this['value'];
      },
      /**
       * @this {*}
       * @return {*}
       */
      'textFormatter': function() {
        return this['valuePrefix'] + this['value'] + this['valuePostfix'];
      }
    }
  },

  // merge with chart
  'map': {
    'defaultSeriesSettings': {
      'base': {
        /**
         * @this {*}
         * @return {*}
         */
        'fill': function() {
          var color;
          if (this['colorScale']) {
            var refVale = this['referenceValueNames'][1];
            var value = this['iterator']['get'](refVale);
            color = this['colorScale']['valueToColor'](value);
          } else {
            color = this['sourceColor'];
          }
          return color;
        },
        /**
         * @this {*}
         * @return {*}
         */
        'hoverFill': function() {
          var color;
          if (this['colorScale']) {
            var refVale = this['referenceValueNames'][1];
            var value = this['iterator']['get'](refVale);
            color = this['colorScale']['valueToColor'](value);
          } else {
            color = this['sourceColor'];
          }
          return window['anychart']['color']['lighten'](color);
        },
        'selectFill': {'color': '#333333'},
        'stroke': {'thickness': 0.5, 'color': '#545f69'},
        'hoverStroke': {'thickness': 0.5, 'color': '#545f69'},
        'selectStroke': {'thickness': 0.5, 'color': '#333333'},
        'hatchFill': false,
        //'hoverHatchFill': null,
        //'selectHatchFill': null,

        'labels': {
          'enabled': true,
          'fontSize': 12,
          'adjustFontSize': {
            'width': true,
            'height': true
          },
          'position': 'center',
          'anchor': 'center',
          /**
           * @this {*}
           * @return {*}
           */
          'textFormatter': function() {
            return this['name'] || this['size'];
          }
        },
        'hoverLabels': {
          'enabled': null
        },
        'selectLabels': {
          'enabled': null
        },
        'markers': {
          'enabled': false,
          'disablePointerEvents': false,
          'size': 4,
          'position': 'center',
          'rotation': 0,
          'anchor': 'center'
        },
        'hoverMarkers': {'enabled': null, 'size': 6},
        'selectMarkers': {
          'enabled': null,
          'size': 6
        },

        'color': null,
        'allowPointsSelect': null,

        'tooltip': {
          /**
           * @this {*}
           * @return {*}
           */
          'titleFormatter': function() {
            return this['name'];
          },
          /**
           * @this {*}
           * @return {*}
           */
          'textFormatter': function() {
            return 'Id: ' + this['id'] + '\nValue: ' + this['valuePrefix'] + this['value'] + this['valuePostfix'];
          }
        },
        'xScale': null,
        'yScale': null,
        'geoIdField': null
      },
      'choropleth': {},
      'bubble': {
        'displayNegative': false,
        /**
         * @this {*}
         * @return {*}
         */
        'fill': function() {
          return window['anychart']['color']['setOpacity'](this['sourceColor'], 0.7, true);
        },
        /**
         * @this {*}
         * @return {*}
         */
        'hoverFill': function() {
          return window['anychart']['color']['setOpacity'](this['sourceColor'], 0.7, true);
        },
        /**
         * @this {*}
         * @return {*}
         */
        'stroke': function() {
          return window['anychart']['color']['setThickness'](this['sourceColor'], 1.5);
        },
        /**
         * @this {*}
         * @return {*}
         */
        'hoverStroke': function() {
          return window['anychart']['color']['setThickness'](this['sourceColor'], 1.5);
        },
        'legendItem': {
          'iconStroke': null
        },
        /**
         * @this {*}
         * @return {*}
         */
        'negativeFill': function() {
          return window['anychart']['color']['darken'](
              window['anychart']['color']['darken'](
                  window['anychart']['color']['darken'](this['sourceColor'])));
        },
        /**
         * @this {*}
         * @return {*}
         */
        'hoverNegativeFill': function() {
          return window['anychart']['color']['darken'](
              window['anychart']['color']['darken'](
                  window['anychart']['color']['darken'](
                      window['anychart']['color']['darken'](this['sourceColor']))));
        },
        /**
         * @this {*}
         * @return {*}
         */
        'negativeStroke': function() {
          return window['anychart']['color']['darken'](
              window['anychart']['color']['darken'](
                  window['anychart']['color']['darken'](
                      window['anychart']['color']['darken'](this['sourceColor']))));
        },
        /**
         * @this {*}
         * @return {*}
         */
        'hoverNegativeStroke': function() {
          return window['anychart']['color']['darken'](
              window['anychart']['color']['darken'](
                  window['anychart']['color']['darken'](
                      window['anychart']['color']['darken'](
                          window['anychart']['color']['darken'](this['sourceColor'])))));
        },
        'negativeHatchFill': null,
        'hoverNegativeHatchFill': null,
        'tooltip': {
          /**
           * @this {*}
           * @return {*}
           */
          'titleFormatter': function() {
            return this['name'] || this['getDataValue']('name');
          },
          /**
           * @this {*}
           * @return {*}
           */
          'textFormatter': function() {
            return 'Value: ' + this['valuePrefix'] + this['size'] + this['valuePostfix'];
          }
        }
      },
      'marker': {
        'hoverFill': '#545f69',
        'selectFill': '#333',
        'tooltip': {
          /**
           * @this {*}
           * @return {*}
           */
          'textFormatter': function() {
            var result;
            if (this['id']) {
              result = 'Id: ' + this['id'];
            } else {
              result = 'lat: ' + this['lat'] + '\nlong: ' + this['long'];
            }
            if (this['value'])
              result += '\nValue: ' + this['valuePrefix'] + this['value'] + this['valuePostfix'];
            return result;
          }
        }
      }
    },
    'colorRange': {
      'enabled': false,
      'stroke': null,
      'orientation': 'bottom',
      'title': {'enabled': false},
      'colorLineSize': 20,
      'padding': {'top': 10, 'right': 0, 'bottom': 20, 'left': 0},
      'align': 'center',
      'length': '70%',
      'marker': {
        'padding': {'top': 3, 'right': 3, 'bottom': 3, 'left': 3},
        'fill': '#545f69',
        'hoverFill': '#545f69',
        'stroke': '#545f69',
        'hoverStroke': '#545f69',
        /**
         * @this {*}
         * @return {*}
         */
        'positionFormatter': function() {
          return this['value'];
        },
        'legendItem': {
          'iconStroke': null
        },
        'enabled': true,
        'disablePointerEvents': false,
        'position': 'center',
        'rotation': 0,
        'anchor': 'center',
        'offsetX': 0,
        'offsetY': 0,
        'type': 'triangleDown',
        'size': 15
      },
      'labels': {'offsetX': 0},
      'ticks': {
        'stroke': {'thickness': 3, 'color': '#fff', 'position': 'center', 'length': 20}
      }
    },
    'unboundRegions': {'enabled': true, 'fill': '#F7F7F7', 'stroke': '#B9B9B9'},
    'linearColor': {'colors': ['#fff', '#ffd54f', '#ef6c00']},
    'legend': {'enabled': false},
    'maxBubbleSize': '10%',
    'minBubbleSize': '3%',
    'geoIdField': 'id'
  },

  // merge with map
  'choropleth': {},
  // merge with map
  'bubbleMap': {},
  // merge with map
  'markerMap': {},

  'defaultDataGrid': {
    'isStandalone': true,
    'headerHeight': 25,
    'backgroundFill': '#fff',
    'columnStroke': '#cecece',
    'rowStroke': '#cecece',
    'rowOddFill': '#fff',
    'rowEvenFill': '#fff',
    'rowFill': '#fff',
    'hoverFill': '#F8FAFB',
    'rowSelectedFill': '#ebf1f4',
    'zIndex': 5,
    'editing': false,
    'editStructurePreviewFill': {
      'color': '#4285F4',
      'opacity': 0.2
    },
    'editStructurePreviewStroke': {
      'color': '#4285F4',
      'thickness': 2
    },
    'editStructurePreviewDashStroke': {
      'color': '#4285F4',
      'dash': '4 4'
    },
    'headerFill': '#f7f7f7',
    'tooltip': {
      'padding': {'top': 5, 'right': 5, 'bottom': 5, 'left': 5},
      'title': {
        'enabled': true,
        'fontSize': '14px',
        'fontWeight': 'normal',
        'fontColor': '#e5e5e5'
      },
      'separator': {
        'enabled': true
      },
      'anchor': 'leftTop',
      'content': {
        'hAlign': 'left'
      },
      'textFormatter': function(data) {
        var name = data['get']('name');
        return (name !== void 0) ? name + '' : '';
      }
    },
    'defaultColumnSettings': {
      'width': 90,
      //'defaultWidth': undefined,
      'cellTextSettings': {
        'anchor': 'leftTop',
        'vAlign': 'middle',
        'padding': {
          'top': 0,
          'right': 5,
          'bottom': 0,
          'left': 5
        },
        'textWrap': 'noWrap',
        'background': null,
        'rotation': 0,
        'width': null,
        'height': null,
        'fontSize': 11,
        'minFontSize': 8,
        'maxFontSize': 72,
        'disablePointerEvents': true
      },
      'depthPaddingMultiplier': 0,
      'collapseExpandButtons': false,
      'title': {
        'margin': {
          'top': 0,
          'right': 0,
          'bottom': 0,
          'left': 0
        },
        'textWrap': 'noWrap',
        'hAlign': 'center',
        'vAlign': 'middle',
        'background': {
          'enabled': false
        }
      },
      'textFormatter': function(item) {
        return '';
      }
    },
    'columns': [
      {
        'width': 50,
        'textFormatter': function(item) {
          var val = item['meta']('index');
          return (val != null) ? (val + 1) + '' : '';
        },
        'title': {
          'text': '#'
        }
      },
      {
        'width': 170,
        'collapseExpandButtons': true,
        'depthPaddingMultiplier': 15,
        'textFormatter': function(item) {
          var val = item['get']('name');
          return (val != null) ? (val + '') : '';
        },
        'title': {
          'text': 'Name'
        }
      }
    ]
  },

  // merge with chart
  'gantt': {
    'base': {
      'splitterPosition': '30%',
      'headerHeight': 70,
      'hoverFill': '#F8FAFB',
      'rowSelectedFill': '#ebf1f4',
      'rowStroke': '#cecece',
      'editing': false,
      'title': {
        'enabled': false
      },
      'legend': {
        'enabled': false
      },
      'credits': {
        'inChart': true
      },
      'background': {
        'fill': '#fff'
      },
      'margin': {
        'top': 0,
        'right': 0,
        'bottom': 0,
        'left': 0
      },
      'padding': {
        'top': 0,
        'right': 0,
        'bottom': 0,
        'left': 0
      },
      'dataGrid': {
        'isStandalone': false,
        'backgroundFill': 'none'
      },
      'timeline': {
        'columnStroke': '#cecece',
        'rowStroke': '#cecece',
        'backgroundFill': 'none',
        'rowOddFill': '#fff',
        'rowEvenFill': '#fff',
        'rowFill': '#fff',

        'hoverFill': '#F8FAFB',
        'rowSelectedFill': '#ebf1f4',

        'zIndex': 5,
        'headerHeight': 70,
        'editing': false,

        'connectorPreviewStroke': {
          'color': '#545f69',
          'dash': '3 3'
        },
        'editPreviewFill': {
          'color': '#fff',
          'opacity': 0.00001
        },
        'editPreviewStroke': {
          'color': '#aaa',
          'dash': '3 3'
        },

        'editProgressFill': '#EAEAEA',
        'editProgressStroke': '#545f69',
        'editIntervalThumbFill': '#EAEAEA',
        'editIntervalThumbStroke': '#545f69',
        'editConnectorThumbFill': '#EAEAEA',
        'editConnectorThumbStroke': '#545f69',

        'editStructurePreviewFill': {
          'color': '#4285F4',
          'opacity': 0.2
        },

        'editStructurePreviewStroke': {
          'color': '#4285F4',
          'thickness': 2
        },

        'editStructurePreviewDashStroke': {
          'color': '#4285F4',
          'dash': '4 4'
        },

        'baseFill': '#7ec1f5',
        'baseStroke': '#74b2e2',
        'progressFill': '#1976d2',
        'progressStroke': {
          'color': '#fff',
          'opacity': 0.00001
        },

        'baselineFill': '#d5ebfc',
        'baselineStroke': '#bfd1e0',
        'parentFill': '#455a64',
        'parentStroke': '#2f3f46',
        'milestoneFill': '#ffa000',
        'milestoneStroke': '#d26104',
        'connectorFill': '#545f69',
        'connectorStroke': '#545f69',
        'selectedElementFill': '#ef6c00',
        'selectedElementStroke': '#bc5704',
        'minimumGap': 0.1,
        'maximumGap': 0.1,
        'baselineAbove': false,
        'tooltip': {
          'padding': {'top': 5, 'right': 5, 'bottom': 5, 'left': 5},
          'title': {
            'enabled': true,
            'fontSize': '14px',
            'fontWeight': 'normal',
            'fontColor': '#e5e5e5'
          },
          'separator': {
            'enabled': true
          },
          'anchor': 'leftTop',
          'content': {
            'hAlign': 'left'
          }
        },
        'labelsFactory': {
          'anchor': 'leftCenter',
          'position': 'rightCenter',
          'padding': {
            'top': 3,
            'right': 5,
            'bottom': 3,
            'left': 5
          },
          'vAlign': 'middle',
          'textWrap': 'noWrap',
          'background': null,
          'rotation': 0,
          'width': null,
          'height': null,
          'fontSize': 11,
          'minFontSize': 8,
          'maxFontSize': 72,
          'zIndex': 40,
          'disablePointerEvents': true
        },
        'markersFactory': {
          'anchor': 'centerTop',
          'zIndex': 50,
          'enabled': true,
          'type': 'star4'
        },
        'header': {
          'labelsFactory': {
            'anchor': 'leftTop',
            'vAlign': 'middle',
            'padding': {
              'top': 0,
              'right': 5,
              'bottom': 0,
              'left': 5
            },
            'textWrap': 'noWrap',
            'background': null,
            'rotation': 0,
            'width': null,
            'height': null,
            'fontSize': 11,
            'minFontSize': 8,
            'maxFontSize': 72,
            'disablePointerEvents': true
          }

        }
      }
    },
    'ganttResource': {
      'dataGrid': {
        'tooltip': {
          'titleFormatter': function(data) {
            var item = data['item'];
            return item ? item['get']('name') : '';
          },
          'textFormatter': function(data) {
            var item = data['item'];
            if (!item) return '';
            //var name = item['get']('name');
            var startDate = item['meta']('minPeriodDate');
            var endDate = item['meta']('maxPeriodDate');
            return (startDate ? 'Start Date: ' + window['anychart']['format']['dateTime'](startDate) : '') +
                (endDate ? '\nEnd Date: ' + window['anychart']['format']['dateTime'](endDate) : '');
          }
        }
      },
      'timeline': {
        'tooltip': {
          'titleFormatter': function(data) {
            var item = data['item'];
            return item ? item['get']('name') : '';
          },
          'textFormatter': function(data) {
            var item = data['item'];
            var period = data['period'];
            var startDate = period ? period['start'] : item['meta']('minPeriodDate');
            var endDate = period ? period['end'] : item['meta']('maxPeriodDate');

            return (startDate ? 'Start Date: ' + window['anychart']['format']['dateTime'](startDate) : '') +
                (endDate ? '\nEnd Date: ' + window['anychart']['format']['dateTime'](endDate) : '');
          }
        }
      }
    },
    'ganttProject': {
      'dataGrid': {
        'tooltip': {
          'titleFormatter': function(data) {
            var item = data['item'];
            return item ? item['get']('name') : '';
          },
          'textFormatter': function(data) {
            var item = data['item'];
            if (!item) return '';
            var startDate = item['get']('actualStart') || item['meta']('autoStart');
            var endDate = item['get']('actualEnd') || item['meta']('autoEnd');
            var progress = item['get']('progressValue');

            if (progress === void 0) {
              var auto = item['meta']('autoProgress') * 100;
              progress = (Math.round(auto * 100) / 100 || 0) + '%';
            }

            return (startDate ? 'Start Date: ' + window['anychart']['format']['dateTime'](startDate) : '') +
                (endDate ? '\nEnd Date: ' + window['anychart']['format']['dateTime'](endDate) : '') +
                (progress ? '\nComplete: ' + progress : '');
          }
        }
      },
      'timeline': {
        'tooltip': {
          'titleFormatter': function(data) {
            var item = data['item'];
            return item ? item['get']('name') : '';
          },
          'textFormatter': function(data) {
            var item = data['item'];
            var startDate = item['get']('actualStart') || item['meta']('autoStart');
            var endDate = item['get']('actualEnd') || item['meta']('autoEnd');
            var progress = item['get']('progressValue');

            if (progress === void 0) {
              var auto = item['meta']('autoProgress') * 100;
              progress = (Math.round(auto * 100) / 100 || 0) + '%';
            }

            return (startDate ? 'Start Date: ' + window['anychart']['format']['dateTime'](startDate) : '') +
                (endDate ? '\nEnd Date: ' + window['anychart']['format']['dateTime'](endDate) : '') +
                (progress ? '\nComplete: ' + progress : '');

          }
        }
      }
    }
  },

  'stock': {
    'defaultPlotSettings': {
      'defaultSeriesSettings': {
        'base': {
          'pointWidth': '75%',
          'tooltip': {
            /**
             * @this {*}
             * @return {*}
             */
            'textFormatter': function() {
              var val = this['value'];
              if (val === undefined) val = this['close'];
              val = parseFloat(val).toFixed(4);
              return this['seriesName'] + ': ' + this['valuePrefix'] + val + this['valuePostfix'];
            }
          },
          'legendItem': {'iconStroke': 'none'}
        },
        'line': {
          'stroke': '1.5 #64b5f6'
        },
        'column': {
          'fill': '#64b5f6',
          'stroke': 'none'
        },
        'ohlc': {
          'risingStroke': '#1976d2',
          'fallingStroke': '#ef6c00'
        }
      },
      'defaultGridSettings': {
        'enabled': true,
        'isMinor': false,
        'layout': 'horizontal',
        'drawFirstLine': true,
        'drawLastLine': true,
        'oddFill': null,
        'evenFill': null,
        'stroke': '#cecece',
        'scale': 0,
        'zIndex': 11
      },
      'defaultMinorGridSettings': {
        'enabled': true,
        'isMinor': true,
        'layout': 'horizontal',
        'drawFirstLine': true,
        'drawLastLine': true,
        'oddFill': null,
        'evenFill': null,
        'stroke': '#eaeaea',
        'scale': 0,
        'zIndex': 10
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
      'xAxis': {
        'enabled': true,
        'orientation': 'bottom',
        'background': {
          //'stroke': '#cecece'
          //fill: '#F7F7F7'
        },
        'height': 25,
        'scale': 0,
        'labels': {
          'enabled': true,
          'fontSize': '11px',
          'padding': {
            'top': 5,
            'right': 5,
            'bottom': 5,
            'left': 5
          },
          'anchor': 'centerTop',
          /**
           * @this {*}
           * @return {string}
           */
          'textFormatter': function() {
            var date = this['tickValue'];
            switch (this['majorIntervalUnit']) {
              case 'year':
                return window['anychart']['format']['dateTime'](date, 'yyyy');
              case 'semester':
              case 'quarter':
              case 'month':
                return window['anychart']['format']['dateTime'](date, 'yyyy MMM');
              case 'thirdOfMonth':
              case 'week':
              case 'day':
                return window['anychart']['format']['dateTime'](date, 'MMM dd');
              case 'hour':
                return window['anychart']['format']['dateTime'](date, 'MMM-dd HH');
              case 'minute':
                return window['anychart']['format']['dateTime'](date, 'dd HH:mm');
              case 'second':
                return window['anychart']['format']['dateTime'](date, 'HH:mm:ss');
              case 'millisecond':
                return window['anychart']['format']['dateTime'](date, 'HH:mm:ss.SSS');
            }
            return window['anychart']['format']['dateTime'](date, 'yyyy MMM dd');
          }
        },
        'minorLabels': {
          'enabled': true,
          'anchor': 'centerTop',
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
          'textFormatter': function() {
            var date = this['tickValue'];
            switch (this['majorIntervalUnit']) {
              case 'year':
                return window['anychart']['format']['dateTime'](date, 'yyyy');
              case 'semester':
              case 'quarter':
              case 'month':
                return window['anychart']['format']['dateTime'](date, 'MMM');
              case 'thirdOfMonth':
              case 'week':
              case 'day':
                return window['anychart']['format']['dateTime'](date, 'dd');
              case 'hour':
                return window['anychart']['format']['dateTime'](date, 'HH');
              case 'minute':
                return window['anychart']['format']['dateTime'](date, 'HH:mm');
              case 'second':
                return window['anychart']['format']['dateTime'](date, 'HH:mm:ss');
              case 'millisecond':
                return window['anychart']['format']['dateTime'](date, 'SSS');
            }
            return window['anychart']['format']['dateTime'](date, 'HH:mm:ss.SSS');
          }
        }
      },
      'dateTimeHighlighter': '#B9B9B9',
      'legend': {
        'enabled': true,
        'vAlign': 'bottom',
        'fontSize': 12,
        'itemsLayout': 'horizontal',
        'itemsSpacing': 15,
        'items': null,
        'iconSize': 13,
        'itemsFormatter': null, // effectively equals current settings
        'itemsTextFormatter': null,
        'itemsSourceMode': 'default',
        'inverted': false,
        'hoverCursor': 'pointer',
        'iconTextSpacing': 5,
        'width': null,
        'height': null,
        'position': 'top',
        /**
         * @this {*}
         * @return {*}
         */
        'titleFormatter': function() {
          var date = /** @type {number} */(this['value']);
          switch (this['groupingIntervalUnit']) {
            case 'year':
              return window['anychart']['format']['dateTime'](date, 'yyyy');
            case 'semester':
            case 'quarter':
            case 'month':
              return window['anychart']['format']['dateTime'](date, 'MMM yyyy');
            case 'thirdofmonth':
            case 'week':
            case 'day':
              return window['anychart']['format']['dateTime'](date, 'dd MMM yyyy');
            case 'hour':
            case 'minute':
              return window['anychart']['format']['dateTime'](date, 'HH:mm, dd MMM');
            case 'second':
              return window['anychart']['format']['dateTime'](date, 'HH:mm:ss');
            case 'millisecond':
              return window['anychart']['format']['dateTime'](date, 'HH:mm:ss.SSS');
          }
          return window['anychart']['format']['dateTime'](date, 'dd MMM yyyy');
        },
        'align': 'center',
        'margin': {
          'top': 0,
          'right': 0,
          'bottom': 0,
          'left': 0
        },
        'padding': {
          'top': 10,
          'right': 10,
          'bottom': 10,
          'left': 10
        },
        'background': {
          'enabled': false,
          'fill': '#fff',
          'stroke': 'none',
          'corners': 5
        },
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
          'padding': {
            'top': 0,
            'right': 0,
            'bottom': 0,
            'left': 0
          },
          'orientation': 'left',
          'align': 'left',
          'hAlign': 'left',
          'rotation': 0
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
        },
        'paginator': {
          'enabled': true,

          'fontSize': 12,
          'fontColor': '#545f69',

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
          'padding': {
            'top': 0,
            'right': 0,
            'bottom': 0,
            'left': 0
          },
          'margin': {
            'top': 0,
            'right': 0,
            'bottom': 0,
            'left': 0
          },
          'orientation': 'right',
          'layout': 'horizontal',
          'zIndex': 30
        },
        'tooltip': {
          'enabled': false,
          'title': {
            'enabled': false,
            'margin': {
              'top': 3,
              'right': 3,
              'bottom': 0,
              'left': 3
            },
            'padding': {
              'top': 0,
              'right': 0,
              'bottom': 0,
              'left': 0
            }
          }
        },
        'zIndex': 20
      },
      'scales': [
        {
          'type': 'linear',
          'inverted': false,
          'maximum': null,
          'minimum': null,
          'minimumGap': 0.1,
          'maximumGap': 0.1,
          'softMinimum': null,
          'softMaximum': null,
          'ticks': {
            'mode': 'linear',
            'base': 0,
            'minCount': 4,
            'maxCount': 6
          },
          'minorTicks': {
            'mode': 'linear',
            'base': 0,
            'count': 5
          },
          'stackMode': 'none',
          'stickToZero': true
        }
      ],
      'yScale': 0,
      'zIndex': 10,
      'yAxes': [{}]
    },
    'padding': [20, 30, 20, 60],
    'plots': [{}],
    'scroller': {
      'defaultSeriesSettings': {
        'base': {
          'pointWidth': '75%'
        },
        'line': {
          'stroke': '#999 0.9',
          'selectedStroke': '1.5 #64b5f6'
        },
        'column': {
          'fill': '#64b5f6 0.6',
          'stroke': 'none',
          'selectedFill': '#64b5f6 0.9',
          'selectedStroke': 'none'
        },
        'ohlc': {
          'risingStroke': '#1976d2 0.6',
          'fallingStroke': '#ef6c00 0.6',
          'selectedRisingStroke': '#1976d2 0.9',
          'selectedFallingStroke': '#ef6c00 0.9'
        }
      },
      'enabled': true,
      'fill': '#fff',
      'selectedFill': '#1976d2 0.2',
      'outlineStroke': '#cecece',
      'height': 40,
      'minHeight': null,
      'maxHeight': null,
      'thumbs': {
        'enabled': true,
        'autoHide': false,
        'fill': '#f7f7f7',
        'stroke': '#7c868e',
        'hoverFill': '#ffffff',
        'hoverStroke': '#545f69'
      },
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
          'padding': {
            'top': 5,
            'right': 5,
            'bottom': 5,
            'left': 5
          },
          'anchor': 'leftTop',
          /**
           * @this {*}
           * @return {string}
           */
          'textFormatter': function() {
            var date = this['tickValue'];
            switch (this['majorIntervalUnit']) {
              case 'year':
                return window['anychart']['format']['dateTime'](date, 'yyyy');
              case 'semester':
              case 'quarter':
              case 'month':
                return window['anychart']['format']['dateTime'](date, 'yyyy MMM');
              case 'thirdOfMonth':
              case 'week':
              case 'day':
                return window['anychart']['format']['dateTime'](date, 'MMM dd');
              case 'hour':
                return window['anychart']['format']['dateTime'](date, 'MMM-dd HH');
              case 'minute':
                return window['anychart']['format']['dateTime'](date, 'dd HH:mm');
              case 'second':
                return window['anychart']['format']['dateTime'](date, 'HH:mm:ss');
              case 'millisecond':
                return window['anychart']['format']['dateTime'](date, 'HH:mm:ss.SSS');
            }
            return window['anychart']['format']['dateTime'](date, 'yyyy MMM dd');
          }
        },
        'minorLabels': {
          'enabled': true,
          'anchor': 'leftTop',
          'fontSize': '11px',
          'padding': {
            'top': 5,
            'right': 5,
            'bottom': 5,
            'left': 5
          },
          /**
           * @this {*}
           * @return {string}
           */
          'textFormatter': function() {
            var date = this['tickValue'];
            switch (this['majorIntervalUnit']) {
              case 'year':
                return window['anychart']['format']['dateTime'](date, 'yyyy');
              case 'semester':
              case 'quarter':
              case 'month':
                return window['anychart']['format']['dateTime'](date, 'MMM');
              case 'thirdOfMonth':
              case 'week':
              case 'day':
                return window['anychart']['format']['dateTime'](date, 'dd');
              case 'hour':
                return window['anychart']['format']['dateTime'](date, 'HH');
              case 'minute':
                return window['anychart']['format']['dateTime'](date, 'HH:mm');
              case 'second':
                return window['anychart']['format']['dateTime'](date, 'HH:mm:ss');
              case 'millisecond':
                return window['anychart']['format']['dateTime'](date, 'SSS');
            }
            return window['anychart']['format']['dateTime'](date, 'HH:mm:ss.SSS');
          }
        },
        'zIndex': 75
      }
    },
    'tooltip': {
      'allowLeaveScreen': false,
      'allowLeaveChart': true,
      'displayMode': 'union',
      'positionMode': 'float',
      'title': {
        'enabled': true,
        'fontSize': 13
      },
      'separator': {'enabled': true},
      /**
       * @this {*}
       * @return {*}
       */
      'titleFormatter': function() {
        var date = /** @type {number} */(this['hoveredDate']);
        switch (this['groupingIntervalUnit']) {
          case 'year':
            return window['anychart']['format']['dateTime'](date, 'yyyy');
          case 'semester':
          case 'quarter':
          case 'month':
            return window['anychart']['format']['dateTime'](date, 'MMM yyyy');
          case 'thirdofmonth':
          case 'week':
          case 'day':
            return window['anychart']['format']['dateTime'](date, 'dd MMM yyyy');
          case 'hour':
          case 'minute':
            return window['anychart']['format']['dateTime'](date, 'HH:mm, dd MMM');
          case 'second':
            return window['anychart']['format']['dateTime'](date, 'HH:mm:ss');
          case 'millisecond':
            return window['anychart']['format']['dateTime'](date, 'HH:mm:ss.SSS');
        }
        return window['anychart']['format']['dateTime'](date, 'dd MMM yyyy');
      },
      /**
       * @this {*}
       * @return {*}
       */
      'textFormatter': function() {
        return this['formattedValues'].join('\n');
      }
    }
  },

  // standalone components
  'standalones': {
    'background': {
      'zIndex': 0
    }, // default
    'label': {
      'enabled': true,
      'fontSize': 11,
      'fontFamily': 'Tahoma',
      'fontWeight': 'bold',
      'textWrap': 'byLetter',
      'text': 'Label text',
      'background': {
        'enabled': false
      },
      'padding': {
        'top': 0,
        'right': 0,
        'bottom': 0,
        'left': 0
      },
      'width': null,
      'height': null,
      'anchor': 'leftTop',
      'position': 'leftTop',
      'offsetX': 0,
      'offsetY': 0,
      'minFontSize': 8,
      'maxFontSize': 72,
      'adjustFontSize': {
        'width': false,
        'height': false
      },
      'rotation': 0,
      'zIndex': 0
    },
    'labelsFactory': {
      'enabled': true,
      'zIndex': 0
    },
    'legend': {
      'position': 'bottom',
      'align': 'center',
      'itemsSpacing': 15,
      'iconTextSpacing': 5,
      'iconSize': 15,
      'width': null,
      'height': null,
      'itemsLayout': 'horizontal',
      'inverted': false,
      'items': null,
      'itemsSourceMode': 'default',
      'itemsFormatter': function(items) {
        return items;
      },
      'fontColor': '#232323',
      'fontSize': 12,
      'background': {
        'enabled': true,
        'fill': {
          'keys': [
            '0 #fff 1',
            '0.5 #f3f3f3 1',
            '1 #fff 1'],
          'angle': '90'
        },
        'stroke': {
          'keys': [
            '0 #ddd 1',
            '1 #d0d0d0 1'
          ],
          'angle': '90'
        },
        'cornerType': 'round',
        'corners': 5
      },
      'title': {
        'enabled': true,
        'fontFamily': 'Verdana',
        'fontSize': 10,
        'fontColor': '#232323',
        'text': 'Legend Title',
        'background': {
          'enabled': false,
          'stroke': {
            'keys': [
              '0 #DDDDDD 1',
              '1 #D0D0D0 1'
            ],
            'angle': '90'
          },
          'fill': {
            'keys': [
              '0 #FFFFFF 1',
              '0.5 #F3F3F3 1',
              '1 #FFFFFF 1'
            ],
            'angle': '90'
          }
        },
        'padding': {
          'top': 0,
          'right': 0,
          'bottom': 0,
          'left': 0
        },
        'margin': {
          'top': 0,
          'right': 0,
          'bottom': 3,
          'left': 0
        }
      },
      'paginator': {
        'enabled': true,
        'fontColor': '#232323',
        'orientation': 'right',
        'margin': {
          'top': 0,
          'right': 0,
          'bottom': 0,
          'left': 0
        },
        'padding': {
          'top': 0,
          'right': 0,
          'bottom': 0,
          'left': 0
        },
        'background': {
          'enabled': false,
          'stroke': {
            'keys': [
              '0 #DDDDDD 1',
              '1 #D0D0D0 1'
            ],
            'angle': '90'
          },
          'fill': {
            'keys': [
              '0 #FFFFFF 1',
              '0.5 #F3F3F3 1',
              '1 #FFFFFF 1'
            ],
            'angle': '90'
          }
        },
        'zIndex': 30
      },
      'titleSeparator': {
        'enabled': true,
        'width': '100%',
        'height': 1,
        'margin': {
          'top': 3,
          'right': 0,
          'bottom': 3,
          'left': 0
        },
        'orientation': 'top',
        'fill': {
          'keys': [
            '0 #333333 0',
            '0.5 #333333 1',
            '1 #333333 0'
          ]
        },
        'stroke': 'none'
      },
      'padding': {
        'top': 7,
        'right': 7,
        'bottom': 7,
        'left': 7
      },
      'margin': {
        'top': 4,
        'right': 4,
        'bottom': 4,
        'left': 4
      },
      'zIndex': 0
    },
    'markersFactory': {
      'zIndex': 0
    },
    'title': {
      'zIndex': 0
    },
    // defaultAxis merges into all these axes
    'linearAxis': {
      'zIndex': 0,
      'ticks': {'enabled': true},
      'minorTicks': {'enabled': true}
    },
    'polarAxis': {
      'startAngle': 0,
      'zIndex': 0,
      'ticks': {'enabled': true},
      'minorTicks': {'enabled': true}
    },
    'radarAxis': {
      'startAngle': 0,
      'zIndex': 0,
      'ticks': {'enabled': true},
      'minorTicks': {'enabled': true}
    },
    'radialAxis': {
      'startAngle': 0,
      'zIndex': 0,
      'ticks': {'enabled': true},
      'minorTicks': {'enabled': true},
      'minorLabels': {
        'padding': {
          'top': 1,
          'right': 1,
          'bottom': 0,
          'left': 1
        }
      }
    },
    'linearGrid': {
      'enabled': true,
      'isMinor': false,
      'layout': 'horizontal',
      'drawFirstLine': true,
      'drawLastLine': true,
      'oddFill': '#fff',
      'evenFill': '#f5f5f5',
      'stroke': '#c1c1c1',
      'scale': null,
      'zIndex': 0
    },
    'polarGrid': {
      'enabled': true,
      'isMinor': false,
      'layout': 'circuit',
      'drawLastLine': true,
      'oddFill': '#fff 0.3',
      'evenFill': '#f5f5f5 0.3',
      'stroke': '#c1c1c1',
      'zIndex': 0
    },
    'radarGrid': {
      'enabled': true,
      'isMinor': false,
      'layout': 'circuit',
      'drawLastLine': true,
      'oddFill': '#fff 0.3',
      'evenFill': '#f5f5f5 0.3',
      'stroke': '#c1c1c1',
      'zIndex': 0
    },
    'lineAxisMarker': {
      'enabled': true,
      'value': 0,
      'layout': 'horizontal',
      'stroke': {
        'color': '#DC0A0A',
        'thickness': 1,
        'opacity': 1,
        'dash': '',
        'lineJoin': 'miter',
        'lineCap': 'square'
      },
      'zIndex': 0
    },
    'textAxisMarker': {
      'enabled': true,
      'fontSize': 11,
      'fontFamily': 'Tahoma',
      'fontWeight': 'bold',
      'value': 0,
      'anchor': 'center',
      'align': 'center',
      'layout': 'horizontal',
      //'rotation': undefined,
      'offsetX': 0,
      'offsetY': 0,
      'text': 'Text marker',
      'width': null,
      'height': null,
      'zIndex': 0
    },
    'rangeAxisMarker': {
      'enabled': true,
      'from': 0,
      'to': 0,
      'layout': 'horizontal',
      'fill': '#000 0.3',
      'zIndex': 0
    },
    'dataGrid': {
      'zIndex': 0
    },
    'scroller': {
      'enabled': true,
      'fill': '#fff',
      'selectedFill': '#e2e2e2',
      'outlineStroke': '#fff',
      'height': 40,
      'minHeight': null,
      'maxHeight': null,
      'thumbs': {
        'enabled': true,
        'autoHide': false,
        'fill': '#f7f7f7',
        'stroke': '#545f69',
        'hoverFill': '#ccc',
        'hoverStroke': '#000'
      }
    }
  }
};
