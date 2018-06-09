goog.provide('anychart.resourceModule.defaultTheme');


goog.mixin(goog.global['anychart']['themes']['defaultTheme'], {
  'resource': {
    'calendar': {},
    'conflicts': {
      'labels': {
        'enabled': true,
        'anchor': 'left-top',
        'hAlign': 'center',
        'fontSize': '8pt',
        'padding': 0,
        'fontColor': '#F4F4F4',
        'format': '{%hours}{decimalsCount:1}h ({%percent}{decimalsCount:2}%)'
      },
      'fill': '#dd2c00',
      'stroke': 'none',
      'hatchFill': null,
      'height': 15,
      'zIndex': 100
    },
    'overlay': {
      'enabled': false
    },
    'activities': {
      'normal': {
        'labels': {
          'enabled': true,
          'anchor': 'left-top',
          'fontColor': '#F4F4F4',
          'format': '{%name} ({%hoursPerDayRounded}{decimalsCount:1}h)',
          'position': 'left-top'
        },
        'fill': '#1976d2',
        'stroke': null,
        'hatchFill': false
      },
      'hovered': {
        'labels': {'enabled': null},
        'fill': anychart.core.defaultTheme.returnLightenSourceColor,
        'stroke': anychart.core.defaultTheme.returnSourceColor,
        'hatchFill': null
      },
      'selected': {
        'labels': {'enabled': null},
        'fill': anychart.core.defaultTheme.defaultSelectSolidColor,
        'stroke': anychart.core.defaultTheme.returnSourceColor,
        'hatchFill': null
      }
    },
    'resourceList': {
      'oddFill': 'none',
      'evenFill': 'none',
      'enabled': true,
      'width': '100%',
      'height': '100%',
      'background': {
        'enabled': true,
        'fill': '#F3F7FA',
        'stroke': 'none',
        'cornerType': 'none',
        'corners': 0
      },
      'images': {
        'borderRadius': 10,
        'opacity': 1,
        'align': 'none',
        'fittingMode': 'meet',
        'size': '25%',
        'margin': {
          'top': 5,
          'right': 0,
          'bottom': 5,
          'left': 5
        }
      },
      'baseSettings': {
        'margin': {
          'top': 2,
          'right': 0,
          'bottom': 3,
          'left': 5
        },
        'fontSize': 15,
        'textOverflow': '...',
        'fontFamily': '"Helvetica Neue","Helvetica",sans-serif'
      },
      'names': {
        'margin': {
          'top': 5,
          'right': 0,
          'bottom': 3,
          'left': 5
        },
        'fontSize': 17,
        'fontWeight': 'bold',
        'fontColor': '#000'
      },
      'types': {
        'fontSize': 10,
        'fontColor': anychart.core.defaultTheme.fontColorDark
      },
      'descriptions': {
        'fontSize': 12,
        'fontColor': '#959CA0',
        'fontWeight': 'bold'
      },
      'tags': {
        'fontSize': 9,
        'fontColor': anychart.core.defaultTheme.fontColorDark,
        'background': {
          'enabled': true,
          'fill': '#eee',
          'stroke': '#ccc',
          'cornerType': 'round',
          'corners': 4
        },
        'padding': 5,
        'margin': {
          'top': 2,
          'right': 0,
          'bottom': 3,
          'left': 5
        }
      },
      'drawTopLine': false,
      'drawRightLine': false,
      'drawBottomLine': true,
      'drawLeftLine': false,
      'stroke': '#ccc',
      'zIndex': 2,
      'overlay': true
    },
    'logo': {
      'enabled': true,
      'fill': '#E7ECF0',
      'stroke': 'none',
      'bottomStroke': '#ccc',
      'zIndex': 2,
      'overlay': false
    },
    'timeLine': {
      'enabled': true,
      'background': {
        'enabled': false
      },
      'overlay': {
        'enabled': false
      },
      'zIndex': 2,
      'vAlign': 'middle',
      'hAlign': 'center',
      'textOverflow': '',
      'fill': 'none',
      'stroke': '#ccc',
      'padding': [2, 10, 2, 10],
      'fontSize': 11,
      'fontWeight': 'bold',
      'fontFamily': '"Helvetica Neue", Helvetica, sans-serif',
      'drawTopLine': false,
      'drawRightLine': false,
      'drawBottomLine': true,
      'drawLeftLine': false
    },
    'grid': {
      'overlay': {
        'enabled': false
      },
      'background': {
        'enabled': false,
        'fill': '#F3F7FA'
      },
      'oddFill': '#fff',
      'evenFill': '#fff',
      'oddHolidayFill': '#F4F4F4 .7',
      'evenHolidayFill': '#F4F4F4 .7',
      'oddHatchFill': null,
      'evenHatchFill': null,
      'oddHolidayHatchFill': null,
      'evenHolidayHatchFill': null,
      'horizontalStroke': '#ccc',
      'verticalStroke': '#ccc',
      'drawTopLine': false,
      'drawRightLine': false,
      'drawBottomLine': true,
      'drawLeftLine': false,
      'zIndex': 2
    },
    'xScale': {
      'minimumGap': 0.01,
      'maximumGap': 0.01
    },
    'horizontalScrollBar': {
      'enabled': true,
      'allowRangeChange': false,
      'autoHide': true,
      'orientation': 'bottom',
      'thumbs': false,
      'fill': null,
      'zIndex': 1010
    },
    'verticalScrollBar': {
      'enabled': true,
      'allowRangeChange': false,
      'autoHide': true,
      'orientation': 'right',
      'thumbs': false,
      'fill': null,
      'zIndex': 1010,
      'inverted': true
    },
    'zoomLevels': [
      {
        'id': 'days',
        'levels': [
          {
            'unit': 'day',
            'count': 1,
            'formats': [
              'MMM\ndd  EEEE'
            ],
            /**
             * @this {*}
             * @return {*}
             */
            'format': function() {
              return this['value'].toUpperCase();
            },
            'hAlign': 'left'
          }
        ],
        'unit': 'day',
        'count': 1,
        'unitPixSize': 220
      },
      {
        'id': 'weeks',
        'levels': [
          {
            'unit': 'day',
            'count': 1,
            'formats': [
              'dd EEE',
              'dd'
            ],
            'hAlign': 'left',
            'fill': '#fff',
            'fontColor': '#ABB6BC',
            /**
             * @this {*}
             * @return {*}
             */
            'format': function() {
              return this['value'].toUpperCase();
            },
            'height': 30
          },
          {
            'unit': 'week',
            'count': 1,
            'formats': [
              'w MMM'
            ],
            'fill': '#F0F5F8',
            /**
             * @this {*}
             * @return {*}
             */
            'format': function() {
              return this['value'].toUpperCase();
            }
          }
        ],
        'unit': 'day',
        'count': 1,
        'unitPixSize': 100
      },
      {
        'id': 'months',
        'levels': [
          {
            'unit': 'day',
            'count': 1,
            'formats': [
              'd EEE',
              'd'
            ],
            'hAlign': 'center',
            'padding': [2, 5, 2, 5],
            'fill': '#fff',
            /**
             * @this {*}
             * @return {*}
             */
            'format': function() {
              return this['value'].toUpperCase();
            },
            'height': 30
          },
          {
            'unit': 'week',
            'count': 1,
            'formats': [
              'w MMM'
            ],
            'fill': '#F0F5F8',
            /**
             * @this {*}
             * @return {*}
             */
            'format': function() {
              return this['value'].toUpperCase();
            }
          }
        ],
        'unit': 'day',
        'count': 1,
        'unitPixSize': 25
      }
    ],
    'zoomLevel': 0,
    'padding': 0,
    'margin': 20,
    'resourceListWidth': 260,
    'timeLineHeight': 52,
    'cellPadding': [2, 2, 2, 2],
    'minRowHeight': 50,
    'pixPerHour': 25,
    'defaultMinutesPerDay': 60,
    'splitterStroke': '#ccc',
    'timeTrackingMode': 'activity-per-resource',
    'background': {
      'enabled': true,
      'stroke': '#ccc'
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
      'titleFormat': '{%name}',
      /**
       * @return {string}
       * @this {*}
       */
      'format': function() {
        return 'Starts: ' + anychart.format.date(this['start']) + '\nEnds: ' + anychart.format.date(this['end']);
      }
    }
  }
});
goog.mixin(goog.global['anychart']['themes']['defaultTheme']['standalones'], {
  'resourceList': {
    'width': '33%',
    'height': '100%',
    'background': {
      'enabled': true,
      'fill': '#ccc',
      'stroke': '#ccc',
      'cornerType': 'none',
      'corners': 0
    },
    'rowHeight': null,
    'minRowHeight': '20%',
    'maxRowHeight': '50%',
    'images': {
      'borderRadius': 10,
      'opacity': 1,
      'align': 'none',
      'fittingMode': 'meet',
      'size': '25%',
      'margin': {
        'top': 5,
        'right': 0,
        'bottom': 5,
        'left': 5
      }
    },
    'baseSettings': {
      'margin': {
        'top': 2,
        'right': 0,
        'bottom': 3,
        'left': 5
      },
      'fontSize': 15,
      'textOverflow': '...'
    },
    'names': {
      'margin': {
        'top': 5,
        'right': 0,
        'bottom': 3,
        'left': 5
      }
    },
    'types': {
      'fontSize': 10,
      'fontColor': anychart.core.defaultTheme.fontColorDark
    },
    'descriptions': {
      'fontSize': 12,
      'fontColor': anychart.core.defaultTheme.fontColorBright,
      'fontStyle': 'oblique'
    },
    'tags': {
      'fontSize': 9,
      'fontColor': anychart.core.defaultTheme.fontColorDark,
      'background': {
        'enabled': true,
        'fill': '#eee',
        'stroke': '#ccc',
        'cornerType': 'round',
        'corners': 4
      },
      'padding': 5,
      'margin': {
        'top': 2,
        'right': 0,
        'bottom': 3,
        'left': 5
      }
    }
  }
});
