goog.provide('anychart.mapModule.defaultTheme');


goog.mixin(goog.global['anychart']['themes']['defaultTheme'], {
  // merge with chart
  'map': {
    'defaultCalloutSettings': {},
    'defaultSeriesSettings': {
      'base': {
        /**
         * @this {*}
         * @return {*}
         */
        'fill': function() {
          return this['scaledColor'] || this['sourceColor'];
        },
        'hoverFill': anychart.core.defaultTheme.defaultHoverColor,
        'selectFill': anychart.core.defaultTheme.defaultSelectColor,
        'stroke': anychart.core.defaultTheme.returnDarkenSourceColor,
        'hoverStroke': {
          'thickness': 0.5,
          'color': '#545f69'
        },
        'selectStroke': {
          'thickness': 0.5,
          'color': '#545f69'
        },
        'hatchFill': false,
        'labels': {
          'anchor': 'center-bottom',
          'enabled': null,
          'adjustFontSize': {
            'width': true,
            'height': true
          },
          /**
           * @this {*}
           * @return {*}
           */
          'format': function() {
            return this['getData']('name') ||
                this['name'] ||
                this['getData']('id') ||
                ('lat: ' + this['lat'] + '\nlong: ' + this['long']);
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
          'disablePointerEvents': false
        },
        'hoverMarkers': {'enabled': null},
        'selectMarkers': {'enabled': null},
        'color': null,
        'tooltip': {
          /**
           * @this {*}
           * @return {*}
           */
          'titleFormat': function() {
            return this['getData']('name') || this['name'] || 'Tooltip title';
          },
          /**
           * @this {*}
           * @return {*}
           */
          'format': function() {
            return 'Id: ' + this['id'] + '\nValue: ' + this['valuePrefix'] + anychart.core.defaultTheme.locNum(this['value']) + this['valuePostfix'];
          }
        },
        'xScale': null,
        'yScale': null,
        'a11y': {
          'titleFormat': 'Series named {%SeriesName}'
        },
        'clip': false
      },
      'choropleth': {
        'labels': {
          'fontColor': anychart.core.defaultTheme.fontColorDark,
          'anchor': 'center'
        },
        'markers': {
          'anchor': null
        },
        'colorScale': {}
      },
      'connector': {
        'startSize': 0,
        'endSize': 0,
        'curvature': .3,
        /**
         * @this {*}
         * @return {*}
         */
        'stroke': function() {
          return {
            'thickness': 2,
            'color': this['sourceColor'],
            'lineJoin': 'round'
          };
        },
        'hoverStroke': anychart.core.defaultTheme.returnLightenSourceColor,
        'selectStroke': '2 ' + anychart.core.defaultTheme.defaultSelectColor,
        'markers': {
          'position': 'middle',
          'enabled': true,
          'size': 15,
          'stroke': '1.5 #f7f7f7',
          'rotation': null,
          'anchor': null,
          'type': 'arrowhead'
        },
        'hoverMarkers': {
          'stroke': '1.5 #f7f7f7',
          'size': 15
        },
        'selectMarkers': {
          'fill': anychart.core.defaultTheme.defaultSelectColor,
          'stroke': '1.5 #f7f7f7',
          'size': 15
        },
        'labels': {
          'enabled': false,
          'position': 'middle',
          'anchor': null,
          /**
           * @this {*}
           * @return {*}
           */
          'format': function() {
            return 'from: ' + this['startPoint']['lat'] + ',' + this['startPoint']['long'] + '\nto: ' + this['endPoint']['lat'] + ',' + this['endPoint']['long'];
          }
        },
        'tooltip': {
          'title': {
            'enabled': false
          },
          'separator': {
            'enabled': false
          },
          /**
           * @this {*}
           * @return {*}
           */
          'format': function() {
            return 'from: ' + this['startPoint']['lat'] + ', ' + this['startPoint']['long'] + '\nto: ' + this['endPoint']['lat'] + ', ' + this['endPoint']['long'];
          }
        }
      },
      'bubble': {
        /**
         * @this {*}
         * @return {*}
         */
        'stroke': function() {
          return {
            'thickness': 2,
            'color': anychart.color.darken(this['sourceColor'])
          };
        },
        'labels': {
          'anchor': 'center'
        },
        'hoverFill': anychart.core.defaultTheme.defaultHoverColor,
        'selectFill': anychart.core.defaultTheme.defaultSelectColor,
        'tooltip': {
          /**
           * @this {*}
           * @return {*}
           */
          'format': function() {
            var result;
            if (this['id']) {
              result = 'Id: ' + this['id'];
            } else {
              result = 'lat: ' + this['lat'] + '\nlong: ' + this['long'];
            }
            if (this['size'])
              result += '\nValue: ' + this['valuePrefix'] + anychart.core.defaultTheme.locNum(this['size']) + this['valuePostfix'];
            return result;
          }
        }
      },
      'marker': {
        'labels': {
          'enabled': true
        },
        'hoverLabels': {
          'fontWeight': 'bold'
        },
        'selectLabels': {
          'fontWeight': 'bold'
        },
        'tooltip': {
          /**
           * @this {*}
           * @return {*}
           */
          'format': function() {
            var result;
            if (this['id']) {
              result = 'Id: ' + this['id'];
            } else {
              result = 'lat: ' + this['lat'] + '\nlong: ' + this['long'];
            }
            if (this['value'])
              result += '\nValue: ' + this['valuePrefix'] + anychart.core.defaultTheme.locNum(this['value']) + this['valuePostfix'];
            return result;
          }
        }
      }
    },
    'colorRange': {
      'zIndex': 50
    },
    'geoScale': {
      'maxTicksCount': 1000,
      'precision': 2
    },
    'callouts': [],
    'axesSettings': {
      'enabled': false,
      'title': {
        'padding': 5,
        'fontSize': 13,
        'text': 'Axis title',
        'fontColor': anychart.core.defaultTheme.fontColorBright,
        'zIndex': 35
      },
      'labels': {
        'enabled': true,
        'padding': 2,
        'rotation': null,
        'fontSize': 10,
        'anchor': 'auto'
      },
      'minorLabels': {
        'padding': 2,
        'rotation': null,
        'fontSize': 9,
        'anchor': null
      },
      'overlapMode': 'no-overlap',
      'ticks': {
        'enabled': true,
        'length': 5,
        'position': 'outside',
        'stroke': anychart.core.defaultTheme.colorStrokeNormal
      },
      'minorTicks': {
        'enabled': false,
        'length': 2,
        'position': 'outside',
        'stroke': anychart.core.defaultTheme.colorStrokeNormal
      },
      'drawFirstLabel': true,
      'drawLastLabel': true,
      'stroke': anychart.core.defaultTheme.colorStrokeNormal
    },
    'gridsSettings': {
      'enabled': false,
      'drawFirstLine': true,
      'drawLastLine': true,
      'oddFill': 'none',
      'evenFill': 'none',
      'stroke': anychart.core.defaultTheme.colorStrokeNormal,
      'minorStroke': 'none',
      'zIndex': 5
    },
    'crosshair': {
      'enabled': false,
      'xStroke': anychart.core.defaultTheme.colorStrokeExtraBright,
      'yStroke': anychart.core.defaultTheme.colorStrokeExtraBright,
      'zIndex': 110,
      'xLabel': {
        'axisIndex': 2
      },
      'yLabel': {
        'axisIndex': 3
      }
    },
    'unboundRegions': {
      'enabled': true,
      'fill': '#F7F7F7',
      'stroke': '#e0e0e0'
    },
    'maxBubbleSize': '20%',
    'minBubbleSize': '5%',
    'geoIdField': 'id',
    'interactivity': {
      'copyFormat': function() {
        var ths = arguments[0];
        var seriesStatus = ths['seriesStatus'];
        var result = '';
        for (var i = 0, len = seriesStatus.length; i < len; i++) {
          var status = seriesStatus[i];
          if (!status['points'].length) continue;
          result += 'Series ' + status['series'].getIndex() + ':\n';
          for (var j = 0, len_ = status['points'].length; j < len_; j++) {
            var point = status['points'][j];
            result += 'id: ' + point['id'] + ' index: ' + point['index'];
            if (j != len_ - 1) result += '\n';
          }
          if (i != len - 1) result += '\n';
        }
        return result || 'no selected points';
      },
      'drag': true,
      'zoomOnMouseWheel': false,
      'keyboardZoomAndMove': true,
      'zoomOnDoubleClick': false
    },
    'minZoomLevel': 1,
    'maxZoomLevel': 10,
    'overlapMode': 'no-overlap',
    'crsAnimation': {
      'enabled': true,
      'duration': 300
    },
    'legend': {
      'enabled': false,
      'tooltip': {
        'contentInternal': {
          'background': {
            'disablePointerEvents': false
          }
        }
      }
    }
  },
  // merge with map
  'choropleth': {},
  // merge with map
  'bubbleMap': {},
  // merge with map
  'markerMap': {},
  // merge with map
  'connector': {},
  // merge with map
  'seatMap': {}
});
