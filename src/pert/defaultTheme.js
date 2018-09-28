goog.provide('anychart.pertModule.defaultTheme');


goog.mixin(goog.global['anychart']['themes']['defaultTheme'], {
  'pert': {
    'tooltip': {
      'enabled': false
    },
    'horizontalSpacing': '15%',
    'verticalSpacing': '25%',
    /**
     * @this {*}
     * @return {*}
     */
    'expectedTimeCalculator': function() {
      if (this['duration'] === void 0) {
        var pessimistic = this['pessimistic'];
        var optimistic = this['optimistic'];
        var mostLikely = this['mostLikely'];
        return Math.round(((optimistic + 4 * mostLikely + pessimistic) / 6) * 100) / 100; //Round to 2 digits after floating point.
      } else {
        return Number(this['duration']);
      }
    },
    'background': {
      'zIndex': 0
    },
    'milestones': {
      'shape': 'circle',
      'size': '5%',
      'normal': {
        'labels': {
          'enabled': true,
          'anchor': 'left-top',
          'vAlign': 'middle',
          'hAlign': 'center',
          'fontColor': '#fff',
          'disablePointerEvents': true,
          'format': anychart.core.defaultTheme.returnMilestoneName
        },
        'fill': anychart.core.defaultTheme.returnSourceColor85,
        'stroke': 'none'
      },
      'hovered': {
        'labels': {
          'enabled': null,
          'fontColor': '#fff',
          'fontOpacity': 1
        },
        'fill': anychart.core.defaultTheme.returnLightenSourceColor,
        'stroke': anychart.core.defaultTheme.returnThickenedStrokeSourceColor
      },
      'selected': {
        'labels': {
          'enabled': null,
          'fontWeight': 'bold'
        },
        'fill': anychart.core.defaultTheme.defaultSelectColor,
        'stroke': anychart.core.defaultTheme.defaultSelectColor
      },
      'color': '#64b5f6',
      'tooltip': {
        'title': {'enabled': true},
        'separator': {'enabled': true},
        /**
         * @this {*}
         * @return {*}
         */
        'titleFormat': function() {
          if (this['creator']) {
            return 'Milestone - ' + this['index'];
          } else {
            return 'Milestone - ' + (this['isStart'] ? 'Start' : 'Finish');
          }
        },
        /**
         * @this {*}
         * @return {*}
         */
        'format': function() {
          var result = '';
          var i = 0;
          if (this['successors'] && this['successors'].length) {
            result += 'Successors:';
            for (i = 0; i < this['successors'].length; i++) {
              result += '\n - ' + this['successors'][i].get('name');
            }
            if (this['predecessors'] && this['predecessors'].length)
              result += '\n\n';
          }
          if (this['predecessors'] && this['predecessors'].length) {
            result += 'Predecessors:';
            for (i = 0; i < this['predecessors'].length; i++) {
              result += '\n - ' + this['predecessors'][i].get('name');
            }
          }
          return result;
        }
      }
    },
    'tasks': {
      'color': '#64b5f6',
      'normal': {
        'fill': anychart.core.defaultTheme.returnSourceColor85,
        'stroke': anychart.core.defaultTheme.returnSourceColor85,
        'dummyFill': anychart.core.defaultTheme.returnSourceColor85,
        'dummyStroke': anychart.core.defaultTheme.returnDashedStrokeSourceColor,
        'upperLabels': {
          'enabled': true,
          'anchor': 'center-bottom',
          'vAlign': 'bottom',
          'hAlign': 'center',
          'fontSize': 10,
          'contColor': '#333',
          'padding': {
            'top': 1,
            'right': 10,
            'bottom': 1,
            'left': 10
          },
          /**
           * @this {*}
           * @return {*}
           */
          'format': function() {
            return this['name'];
          }
        },
        'lowerLabels': {
          'enabled': true,
          'anchor': 'center-top',
          'vAlign': 'top',
          'hAlign': 'center',
          'fontSize': 9,
          'fontOpacity': 0.5,
          'contColor': '#333',
          'padding': {
            'top': 1,
            'right': 5,
            'bottom': 1,
            'left': 5
          },
          /**
           * @this {*}
           * @return {*}
           */
          'format': function() {
            return 't: ' + anychart.core.defaultTheme.locNum(this['duration']);
          }
        }
      },
      'hovered': {
        'fill': anychart.core.defaultTheme.returnLightenSourceColor,
        'stroke': anychart.core.defaultTheme.returnThickenedStrokeSourceColor,
        'upperLabels': {'fontWeight': 'bold'},
        'lowerLabels': {'fontWeight': 'bold'}
      },
      'selected': {
        'fill': anychart.core.defaultTheme.defaultSelectColor,
        'stroke': anychart.core.defaultTheme.defaultSelectColor,
        'upperLabels': {'fontWeight': 'bold'},
        'lowerLabels': {'fontWeight': 'bold'}
      },

      'tooltip': {
        'title': {'enabled': true},
        'separator': {'enabled': true},
        /**
         * @this {*}
         * @return {*}
         */
        'titleFormat': function() {
          return this['name'];
        },
        /**
         * @this {*}
         * @return {*}
         */
        'format': function() {
          var result = 'Earliest start: ' + anychart.core.defaultTheme.locNum(this['earliestStart']) + '\nEarliest finish: ' + anychart.core.defaultTheme.locNum(this['earliestFinish']) +
              '\nLatest start: ' + anychart.core.defaultTheme.locNum(this['latestStart']) + '\nLatest finish: ' + anychart.core.defaultTheme.locNum(this['latestFinish']) +
              '\nDuration: ' + anychart.core.defaultTheme.locNum(this['duration']) + '\nSlack: ' + anychart.core.defaultTheme.locNum(this['slack']);
          if (!isNaN(this['variance'])) result += '\nStandard deviation: ' + Math.round(this['variance'] * 100) / 100;
          return result;
        }
      }
    },

    'criticalPath': {
      'tasks': {
        'tooltip': {
          'title': {'background': null}
        },
        'color': '#e06666',
        'normal': {
          'lowerLabels': {},
          'upperLabels': {}
        }
      },
      'milestones': {
        'tooltip': {
          'title': {'background': null}
        }
      }
    }
  }
});
