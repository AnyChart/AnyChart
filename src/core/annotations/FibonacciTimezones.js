goog.provide('anychart.core.annotations.FibonacciTimezones');
goog.require('anychart.core.annotations');
goog.require('anychart.core.annotations.FibonacciBase');
goog.require('anychart.enums');



/**
 * FibonacciTimezones annotation.
 * @param {!anychart.core.annotations.ChartController} chartController
 * @constructor
 * @extends {anychart.core.annotations.FibonacciBase}
 */
anychart.core.annotations.FibonacciTimezones = function(chartController) {
  anychart.core.annotations.FibonacciTimezones.base(this, 'constructor', chartController);
};
goog.inherits(anychart.core.annotations.FibonacciTimezones, anychart.core.annotations.FibonacciBase);
anychart.core.annotations.AnnotationTypes[anychart.enums.AnnotationTypes.FIBONACCI_TIMEZONES] = anychart.core.annotations.FibonacciTimezones;


//region Properties
//----------------------------------------------------------------------------------------------------------------------
//
//  Properties
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.annotations.FibonacciTimezones.prototype.type = anychart.enums.AnnotationTypes.FIBONACCI_TIMEZONES;
//endregion


//region Drawing
//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.annotations.FibonacciTimezones.prototype.drawLevel = function(levelIndex, levelValue, path, hoverPath,
                                                                            mainFactory, stateFactory, drawLabels, strokeThickness) {
  var x1 = this.coords['xAnchor'];
  var x2 = this.coords['secondXAnchor'];
  var baseWidth = Math.abs(x1 - x2);
  var x = anychart.utils.applyPixelShift(x2 + baseWidth * levelValue, strokeThickness);
  if (this.pixelBoundsCache.left <= x && x <= this.pixelBoundsCache.getRight()) {
    var t = this.pixelBoundsCache.top;
    var b = this.pixelBoundsCache.getBottom();
    path.moveTo(x, t).lineTo(x, b);
    hoverPath.moveTo(x, t).lineTo(x, b);
    if (drawLabels) {
      var position = {'value': {'x': x, 'y': b}};
      this.drawLabel(levelIndex, mainFactory, stateFactory, this.createFormatProvider(levelValue), position,
          {'anchor': anychart.enums.Anchor.LEFT_BOTTOM});
    }
  }
};


/** @inheritDoc */
anychart.core.annotations.FibonacciTimezones.prototype.checkVisible = function() {
  var res = anychart.core.annotations.FibonacciTimezones.base(this, 'checkVisible');
  if (!res) {
    var x1 = this.coords['xAnchor'];
    var x2 = this.coords['secondXAnchor'];
    var x = Math.min(x1, x2);
    res = !isNaN(x) && (x <= this.pixelBoundsCache.getRight());
  }
  return res;
};
//endregion
