goog.provide('anychart.annotationsModule.defaultTheme');
goog.require('anychart.core.defaultTheme');


goog.mixin(goog.global['anychart']['themes']['defaultTheme']['chart'], {
  'defaultAnnotationSettings': {
    'base': {
      'enabled': true,
      'normal': {
        'fill': anychart.core.defaultTheme.returnSourceColor50,
        'stroke': anychart.core.defaultTheme.returnSourceColor,
        'hatchFill': null,
        'markers': {
          'enabled': false,
          'size': 5,
          'type': 'square',
          'fill': '#ffff66',
          'stroke': '#333333'
        },
        'labels': {
          'enabled': true,
          'position': 'center-top',
          'anchor': 'center-top',
          /**
           * @return {*}
           * @this {*}
           */
          'format': function() {
            return this['level'];
          }
        }
      },
      'hovered': {
        'fill': anychart.core.defaultTheme.returnSourceColor70,
        'stroke': anychart.core.defaultTheme.returnDarkenSourceColor,
        'markers': {
          'enabled': null
        },
        'labels': {
          'enabled': null
        }
      },
      'selected': {
        'fill': anychart.core.defaultTheme.returnSourceColor70,
        'stroke': anychart.core.defaultTheme.returnDarkenSourceColor,
        'markers': {
          'enabled': true
        },
        'labels': {
          'enabled': null
        }
      },
      'color': '#e06666',
      'allowEdit': true,
      'hoverGap': 5
    },
    'ray': {},
    'line': {},
    'infiniteLine': {},
    'verticalLine': {},
    'horizontalLine': {},
    'rectangle': {},
    'ellipse': {},
    'triangle': {},
    'trendChannel': {},
    'finiteTrendChannel': {
      'channelWidth': 0
    },
    'andrewsPitchfork': {},
    'fibonacciFan': {
      'levels': [
        0,
        0.382,
        0.5,
        0.618,
        1
      ],
      'timeLevels': [
        0,
        0.382,
        0.5,
        0.618,
        1
      ],
      'labels': {
        'anchor': null
      }
    },
    'fibonacciArc': {
      'levels': [
        0.236,
        0.382,
        0.5,
        0.618,
        0.764,
        1
      ],
      'labels': {
        'anchor': null
      }
    },
    'fibonacciRetracement': {
      'levels': [
        0,
        0.236,
        0.382,
        0.5,
        0.618,
        0.764,
        1,
        1.236,
        1.382,
        1.5,
        1.618,
        1.764,
        2.618,
        4.236
      ],
      'normal': {
        'labels': {
          'position': 'left-center',
          'anchor': 'right-center'
        }
      }
    },
    'fibonacciTimezones': {
      'levels': [
        0,
        1,
        2,
        3,
        5,
        8,
        13,
        21,
        34,
        55,
        89,
        144,
        233,
        377,
        610,
        987,
        1597,
        2584,
        4181,
        6765,
        10946,
        17711,
        28657,
        46368,
        75025,
        121393,
        196418,
        317811,
        514229,
        832040,
        1346269,
        2178309,
        3524578,
        5702887,
        9227465,
        14930352,
        24157817,
        39088169
      ],
      'labels': {
        'anchor': 'left-bottom'
      }
    },
    'marker': {
      'markerType': 'arrow-up',
      'normal': {
        'size': 20
      },
      'anchor': 'center-top',
      'offsetX': 0,
      'offsetY': 0
    },
    'label': {
      'text': 'Label',
      'offsetX': 0,
      'offsetY': 0,
      'anchor': 'left-top',
      'hAlign': 'start',
      'vAlign': 'top',
      'width': null,
      'height': null,
      'background': {
        'enabled': true,
        'fill': '#eee 0.4',
        'stroke': anychart.color.darken('#eee')
      },
      'padding': 5,
      'normal': {
        'markers': {
          'size': 3
        }
      }
    },
    'horizontalRange': {},
    'verticalRange': {}
  }
});
