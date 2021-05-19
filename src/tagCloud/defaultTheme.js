goog.provide('anychart.tagCloudModule.defaultTheme');


goog.mixin(goog.global['anychart']['themes']['defaultTheme'], {
  'tagCloud': {
    'anglesCount': 7,
    'fromAngle': -90,
    'toAngle': 90,
    'mode': 'spiral',
    'textSpacing': 1,
    'scale': {'type': 'linear'},
    'colorRange': {},
    'colorScale': null,
    'normal': {
      'fontFamily': 'Verdana, Helvetica, Arial, sans-serif',
      'fontOpacity': 1,
      'fontDecoration': 'none',
      'fontStyle': 'normal',
      'fontVariant': 'normal',
      'fontWeight': 'normal',
      /**
       * @this {*}
       * @return {*}
       */
      'fill': function() {
        return anychart.color.setOpacity(this['scaledColor'] || this['sourceColor'], 0.85, true);
      },
      'stroke': 'none'
    },
    'hovered': {
      'fill': anychart.core.defaultTheme.returnSourceColor65,
      'stroke': 'none'
    },
    'selected': {
      'fill': anychart.core.defaultTheme.defaultSelectColor,
      'stroke': 'none'
    },
    'tooltip': {
      'enabled': true,
      'title': {'enabled': true},
      'separator': {'enabled': true},
      /**
       * @this {*}
       * @return {*}
       */
      'titleFormat': function() {
        return this['name'] || this['x'];
      },
      /**
       * @this {*}
       * @return {*}
       */
      'format': function() {
        return 'Frequency: ' + anychart.core.defaultTheme.locNum(this['value']) + '\nPercent of total: ' + (this['value'] * 100 / this['getStat']('sum')).toFixed(1) + '%';
      }
    },
    'legend': {
      'enabled': false,
      'itemsSourceMode': 'categories',
      'tooltip': {
        'contentInternal': {
          'background': {
            'disablePointerEvents': false
          }
        }
      }
    }
  }
});
