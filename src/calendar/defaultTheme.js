goog.provide('anychart.calendarModule.defaultTheme');

goog.mixin(goog.global['anychart']['themes']['defaultTheme'], {
  'defaultMonthsLabelsSettings': {},

  'calendar': {
    'margin': 0,
    'padding': 0,

    'colorRange': {
      'orientation': 'top',
      'enabled': true
    },

    'colorScale': {
      'type': 'linear-color'
    },

    'background': {
      'enabled': false
    },

    'years': {
      'title': {
        'enabled': true,
        'fontSize': 40,
        'width': '100%',
        'fontColor': '#dfdfdf',
        'orientation': 'left',
        'position': 'center'
      },
      'background': {
        'enabled': false
      },
      'inverted': false,
      'underSpace': 30,
      'monthsPerRow': 12,
      'format': '{%year}'
    },

    'months': {
      'labels': {},
      'stroke': '#0767b1',
      'noDataStroke': '#c9c9c9',
      'underSpace': 5
    },

    'weeks': {
      'showWeekends': true,
      'labels': {
        'width': '100%',
        'position': 'center',
        'anchor': 'center'
      },
      'spacing': 5
    },

    'days': {
      'noDataFill': '#f8f8f8',
      'noDataStroke': '#fff',
      'noDataHatchFill': {
        'type': 'backward-diagonal',
        'color': '#e0e0e0',
        'thickness': 1,
        'size': 6
      },
      'spacing': 0,
      'normal': {
        /**
         * @this {*}
         * @return {*}
         */
        'fill': function() {
          return this['scaledColor'] || this['sourceColor'];
        },
        'stroke': '#fff',
        'hatchFill': 'backward-diagonal'
      },
      'hovered': {
        'fill': '#6363a3',
        'stroke': '2 #6333a3'
      },
      'selected': {}
    },

    'tooltip': {
      'titleFormat': '{%x}',
      'format': '{%Value}'
    }
  }
});
