goog.provide('anychart.ganttModule.defaultTheme');


goog.mixin(goog.global['anychart']['themes']['defaultTheme'], {
  // merge with chart
  'ganttBase': {
    'splitterPosition': '30%',
    'headerHeight': 70,
    'rowHoverFill': '#F8FAFB',
    'rowSelectedFill': '#ebf1f4',
    'rowStroke': '#cecece',
    'editing': false,
    'title': {
      'enabled': false
    },
    'legend': {
      'enabled': false
    },
    'background': {
      'fill': '#fff'
    },
    'margin': 0,
    'padding': 0,
    'dataGrid': {
      'isStandalone': false,
      'backgroundFill': 'none',
      'tooltip': {
        'zIndex': 100,
        'allowLeaveChart': false
      }
    },
    'timeline': {
      'isStandalone': false
    }
  },

  'ganttResource': {
    'dataGrid': {
      'tooltip': {
        /**
         * @this {*}
         * @return {string}
         */
        'titleFormat': function() {
          return this['name'] || '';
        },
        /**
         * @this {*}
         * @return {string}
         */
        'format': function() {
          var startDate = this['minPeriodDate'];
          var endDate = this['maxPeriodDate'];
          return (startDate ? 'Start Date: ' + anychart.format.dateTime(startDate) : '') +
              (endDate ? '\nEnd Date: ' + anychart.format.dateTime(endDate) : '');
        }
      }
    },
    'timeline': {
      'tooltip': {
        /**
         * @this {*}
         * @return {string}
         */
        'titleFormat': function() {
          return this['name'] || '';
        },
        /**
         * @this {*}
         * @return {string}
         */
        'format': function() {
          var startDate = this['periodStart'] || this['minPeriodDate'];
          var endDate = this['periodEnd'] || this['maxPeriodDate'];
          return (startDate ? 'Start Date: ' + anychart.format.dateTime(startDate) : '') +
              (endDate ? '\nEnd Date: ' + anychart.format.dateTime(endDate) : '');
        }
      }
    }
  },
  'ganttProject': {
    'dataGrid': {
      'tooltip': {
        /**
         * @this {*}
         * @return {string}
         */
        'titleFormat': function() {
          return this['name'] || '';
        },
        /**
         * @this {*}
         * @return {string}
         */
        'format': function() {
          var startDate = this['actualStart'] || this['autoStart'];
          var endDate = this['actualEnd'] || this['autoEnd'];
          var progress = this['progressValue'];

          if (progress === void 0) {
            var auto = this['autoProgress'] * 100;
            progress = (Math.round(auto * 100) / 100 || 0) + '%';
          }

          return (startDate ? 'Start Date: ' + anychart.format.dateTime(startDate) : '') +
              (endDate ? '\nEnd Date: ' + anychart.format.dateTime(endDate) : '') +
              (progress ? '\nComplete: ' + progress : '');
        }
      }
    },
    'timeline': {
      'tooltip': {
        /**
         * @this {*}
         * @return {string}
         */
        'titleFormat': function() {
          return this['name'] || '';
        },
        /**
         * @this {*}
         * @return {string}
         */
        'format': function() {
          var startDate = this['actualStart'] || this['autoStart'];
          var endDate = this['actualEnd'] || this['autoEnd'];
          var progress = this['progressValue'];

          if (progress === void 0) {
            var auto = this['autoProgress'] * 100;
            progress = (Math.round(auto * 100) / 100 || 0) + '%';
          }

          return (startDate ? 'Start Date: ' + anychart.format.dateTime(startDate) : '') +
              (endDate ? '\nEnd Date: ' + anychart.format.dateTime(endDate) : '') +
              (progress ? '\nComplete: ' + progress : '');

        }
      }
    }
  }
});

goog.mixin(goog.global['anychart']['themes']['defaultTheme']['standalones'], {
  'projectTimeline': {
    'tooltip': {
      /**
       * @this {*}
       * @return {string}
       */
      'titleFormat': function() {
        return this['name'] || '';
      },
      /**
       * @this {*}
       * @return {string}
       */
      'format': function() {
        var startDate = this['actualStart'] || this['autoStart'];
        var endDate = this['actualEnd'] || this['autoEnd'];
        var progress = this['progressValue'];

        if (progress === void 0) {
          var auto = this['autoProgress'] * 100;
          progress = (Math.round(auto * 100) / 100 || 0) + '%';
        }

        return (startDate ? 'Start Date: ' + anychart.format.dateTime(startDate) : '') +
            (endDate ? '\nEnd Date: ' + anychart.format.dateTime(endDate) : '') +
            (progress ? '\nComplete: ' + progress : '');

      }
    }
  },
  'resourceTimeline': {
    'tooltip': {
      /**
       * @this {*}
       * @return {string}
       */
      'titleFormat': function() {
        return this['name'] || '';
      },
      /**
       * @this {*}
       * @return {string}
       */
      'format': function() {
        var startDate = this['periodStart'] || this['minPeriodDate'];
        var endDate = this['periodEnd'] || this['maxPeriodDate'];
        return (startDate ? 'Start Date: ' + anychart.format.dateTime(startDate) : '') +
            (endDate ? '\nEnd Date: ' + anychart.format.dateTime(endDate) : '');
      }
    }
  },
  'dataGrid': {
    'enabled': true,
    'zIndex': 0
  }
});
