goog.provide('anychart.annotationsModule.FibonacciTimezones');
goog.require('anychart.annotationsModule');
goog.require('anychart.annotationsModule.FibonacciBase');
goog.require('anychart.enums');



/**
 * FibonacciTimezones annotation.
 * @param {!anychart.annotationsModule.ChartController} chartController
 * @constructor
 * @extends {anychart.annotationsModule.FibonacciBase}
 */
anychart.annotationsModule.FibonacciTimezones = function(chartController) {
  anychart.annotationsModule.FibonacciTimezones.base(this, 'constructor', chartController);
};
goog.inherits(anychart.annotationsModule.FibonacciTimezones, anychart.annotationsModule.FibonacciBase);
anychart.annotationsModule.AnnotationTypes[anychart.enums.AnnotationTypes.FIBONACCI_TIMEZONES] = anychart.annotationsModule.FibonacciTimezones;


//region Properties
//----------------------------------------------------------------------------------------------------------------------
//
//  Properties
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.annotationsModule.FibonacciTimezones.prototype.type = anychart.enums.AnnotationTypes.FIBONACCI_TIMEZONES;


//endregion
//region Drawing
//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.annotationsModule.FibonacciTimezones.prototype.drawLevel = function(levelIndex, levelValue, path, hoverPath,
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
      this.drawLabel(levelIndex, mainFactory, stateFactory, this.createFormatProvider(levelValue, this.getValueFromPixX(x), true), position,
          anychart.enums.Anchor.LEFT_BOTTOM);
    }
  }
};


/** @inheritDoc */
anychart.annotationsModule.FibonacciTimezones.prototype.checkVisible = function() {
  var res = anychart.annotationsModule.FibonacciTimezones.base(this, 'checkVisible');
  if (!res) {
    var x1 = this.coords['xAnchor'];
    var x2 = this.coords['secondXAnchor'];
    var x = Math.min(x1, x2);
    res = !isNaN(x) && (x <= this.pixelBoundsCache.getRight());
  }
  return res;
};
//endregion
