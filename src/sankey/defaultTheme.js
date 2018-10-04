goog.provide('anychart.sankeyModule.defaultTheme');


goog.mixin(goog.global['anychart']['themes']['defaultTheme'], {
  'sankey': {
    'nodePadding': 8,
    'nodeWidth': 24,
    'curveFactor': 0.33,
    'tooltip': {
      'titleFormat': '{%name}',
      'format': '{%Value}'
    },

    'node': {
      'normal': {
        'fill': anychart.core.defaultTheme.returnSourceColor,
        'stroke': 'none',
        'labels': {
          'enabled': true,
          'format': '{%name}',
          'fontColor': 'black',
          'fontSize': 10,
          'disablePointerEvents': true
        }
      },
      'hovered': {
        'fill': anychart.core.defaultTheme.returnSourceColor
      },
      'tooltip': {
        'titleFormat': '{%name} ({%value})',
        /**
         * @this {*}
         * @return {*}
         */
        'format': function() {
          var values = [];
          var income = this['income'];
          var outcome = this['outcome'];
          var dropoff = this['dropoff'];
          var i, item;
          if (income.length) {
            values.push('Income:');
            for (i = 0; i < income.length; i++) {
              item = income[i];
              values.push('- ' + item.name + ': ' + item.value);
            }
          }
          if (outcome.length) {
            values.push('Outcome:');
            for (i = 0; i < outcome.length; i++) {
              item = outcome[i];
              values.push('- ' + item.name + ': ' + item.value);
            }
          }
          if (dropoff) {
            values.push('Dropoff: ' + dropoff);
          }
          return values.join('\n');
        }
      }
    },

    'flow': {
      'normal': {
        'fill': 'grey 0.3',
        'stroke': 'none',
        'labels': {
          'enabled': false,
          'disablePointerEvents': true,
          'fontColor': '#000',
          'padding': 0
        }
      },
      'hovered': {
        'fill': anychart.core.defaultTheme.returnDarkenSourceColor,
        'labels': {
          'enabled': true
        }
      }
    },

    'dropoff': {
      'normal': {
        'fill': {
          'angle': -90,
          'keys': [
            {'color': 'red', 'offset': 0},
            {'color': 'white', 'offset': 1}
          ]
        },
        'stroke': 'none',
        'labels': {
          'enabled': false,
          'disablePointerEvents': true,
          'fontColor': '#000',
          'padding': 0
        }
      },
      'hovered': {
        'labels': {
          'enabled': true
        }
      }
    }
  }
});
