goog.provide('anychart.mapModule.defaultTheme');


goog.mixin(goog.global['anychart']['themes']['defaultTheme'], {
  // merge with chart
  'map': {
    'defaultCalloutSettings': {},
    'defaultSeriesSettings': {
      'base': {
        'normal': {
          /**
           * @this {*}
           * @return {*}
           */
          'fill': function() {
            return this['scaledColor'] || this['sourceColor'];
          },
          'stroke': anychart.core.defaultTheme.returnDarkenSourceColor,
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
              if (this['getData']('name')) {
                return this['getData']('name');
              } else if (this['name']) {
                return this['name'];
              } else if (this['getData']('id')) {
                return this['getData']('id');
              } else {
                return 'lat: ' + this['lat'] + '\nlong: ' + this['long'];
              }
            }
          },
          'markers': {
            'enabled': false,
            'disablePointerEvents': false
          }
        },
        'hovered': {
          'fill': anychart.core.defaultTheme.defaultHoverColor,
          'stroke': {'thickness': 0.5, 'color': '#545f69'},
          'labels': {
            'enabled': null
          },
          'markers': {'enabled': null}
        },
        'selected': {
          'fill': anychart.core.defaultTheme.defaultSelectColor,
          'stroke': {'thickness': 0.5, 'color': '#545f69'},
          'labels': {
            'enabled': null
          },
          'markers': {'enabled': null}
        },
        'color': null,
        'tooltip': {
          /**
           * @this {*}
           * @return {*}
           */
          'titleFormat': function() {
            return this['name'] || this['getData']('name') || 'Tooltip title';
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
        'normal': {
          'labels': {
            'fontColor': anychart.core.defaultTheme.fontColorDark,
            'anchor': 'center'
          },
          'markers': {
            'anchor': null
          }
        },
        'colorScale': {}
      },
      'connector': {
        'startSize': 0,
        'endSize': 0,
        'curvature': .3,
        'normal': {
          /**
           * @this {*}
           * @return {*}
           */
          'stroke': function() {
            return {'thickness': 2, 'color': this['sourceColor'], 'lineJoin': 'round'};
          },
          'markers': {
            'position': 'middle',
            'enabled': true,
            'size': 15,
            'stroke': '1.5 #f7f7f7',
            'rotation': null,
            'anchor': null,
            'type': 'arrowhead'
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
          }
        },
        'hovered': {
          'stroke': anychart.core.defaultTheme.returnLightenSourceColor,
          'markers': {
            'stroke': '1.5 #f7f7f7',
            'size': 15
          }
        },
        'selected': {
          'stroke': '2 ' + anychart.core.defaultTheme.defaultSelectColor,
          'markers': {
            'fill': anychart.core.defaultTheme.defaultSelectColor,
            'stroke': '1.5 #f7f7f7',
            'size': 15
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
        'normal': {
          /**
           * @this {*}
           * @return {*}
           */
          'stroke': function() {
            return {'thickness': 2, 'color': anychart.color.darken(this['sourceColor'])};
          },
          'labels': {
            'anchor': 'center'
          }
        },
        'hovered': {
          'fill': anychart.core.defaultTheme.defaultHoverColor
        },
        'selected': {
          'fill': anychart.core.defaultTheme.defaultSelectColor
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
            if (this['size'])
              result += '\nValue: ' + this['valuePrefix'] + anychart.core.defaultTheme.locNum(this['size']) + this['valuePostfix'];
            return result;
          }
        }
      },
      'marker': {
        'normal': {
          'labels': {
            'enabled': true
          }
        },
        'hovered': {
          'labels': {
            'fontWeight': 'bold'
          }
        },
        'selected': {
          'labels': {
            'fontWeight': 'bold'
          }
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
        'zIndex': 10
      },
      'labels': {
        'enabled': true,
        'padding': 2,
        'rotation': null,
        'fontSize': 10,
        'anchor': 'auto',
        'position': 'outside',
        'zIndex': 5
      },
      'minorLabels': {
        'enabled': null,
        'padding': 2,
        'rotation': null,
        'fontSize': 9,
        'anchor': null,
        'position': 'outside',
        'zIndex': 4
      },
      'overlapMode': 'no-overlap',
      'ticks': {
        'enabled': true,
        'length': 5,
        'position': 'outside',
        'stroke': anychart.core.defaultTheme.colorStrokeNormal,
        'zIndex': 3
      },
      'minorTicks': {
        'enabled': false,
        'length': 2,
        'position': 'outside',
        'stroke': anychart.core.defaultTheme.colorStrokeNormal,
        'zIndex': 2
      },
      'drawFirstLabel': true,
      'drawLastLabel': true,
      'stroke': anychart.core.defaultTheme.colorStrokeNormal
    },
    'gridsSettings': {
      'enabled': false,
      'minorStroke': 'none',
      'zIndex': 5
    },
    'crosshair': {
      'enabled': false,
      'xStroke': anychart.core.defaultTheme.colorStrokeExtraBright,
      'yStroke': anychart.core.defaultTheme.colorStrokeExtraBright,
      'zIndex': 110,
      'xLabels': [{
        'enabled': null,
        'axisIndex': 2
      }],
      'yLabels': [{
        'enabled': null,
        'axisIndex': 3
      }]
    },
    'unboundRegions': {'enabled': true, 'fill': '#F7F7F7', 'stroke': '#e0e0e0'},
    'maxBubbleSize': '10%',
    'minBubbleSize': '1%',
    'geoIdField': 'id',
    'interactivity': {
      'copyFormat': function() {
        var ths = arguments[0];
        var seriesStatus = ths['seriesStatus'];
        var result = '';
        for (var i = 0, len = seriesStatus.length; i < len; i++) {
          var status = seriesStatus[i];
          if (!status['points'].length) continue;
          result += 'Series ' + status['series']['getIndex']() + ':\n';
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
    },
    'selectPolygonMarqueeFill': '#d3d3d3 0.4',
    'selectPolygonMarqueeStroke': '#d3d3d3',
    'selectPolygonMarqueeMarker': {
      'fill': '#d3d3d3 0.4',
      'stroke': '#d3d3d3',
      'radius': 15
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
