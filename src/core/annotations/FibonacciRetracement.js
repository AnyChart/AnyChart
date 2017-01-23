goog.provide('anychart.core.annotations.FibonacciRetracement');
goog.require('anychart.core.annotations');
goog.require('anychart.core.annotations.FibonacciBase');
goog.require('anychart.enums');



/**
 * FibonacciRetracement annotation.
 * @param {!anychart.core.annotations.ChartController} chartController
 * @constructor
 * @extends {anychart.core.annotations.FibonacciBase}
 */
anychart.core.annotations.FibonacciRetracement = function(chartController) {
  anychart.core.annotations.FibonacciRetracement.base(this, 'constructor', chartController);
};
goog.inherits(anychart.core.annotations.FibonacciRetracement, anychart.core.annotations.FibonacciBase);
anychart.core.annotations.AnnotationTypes[anychart.enums.AnnotationTypes.FIBONACCI_RETRACEMENT] = anychart.core.annotations.FibonacciRetracement;


//region Properties
//----------------------------------------------------------------------------------------------------------------------
//
//  Properties
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.annotations.FibonacciRetracement.prototype.type = anychart.enums.AnnotationTypes.FIBONACCI_RETRACEMENT;
//endregion


//region Drawing
//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.annotations.FibonacciRetracement.prototype.drawLevel = function(levelIndex, levelValue, path, hoverPath,
                                                                              mainFactory, stateFactory, drawLabels, strokeThickness) {
  var x1 = this.coords['xAnchor'];
  var y1 = this.coords['valueAnchor'];
  var x2 = this.coords['secondXAnchor'];
  var y2 = this.coords['secondValueAnchor'];
  var sx = Math.min(x1, x2);
  var baseHeight = y1 - y2;
  var y = anychart.utils.applyPixelShift(y2 + baseHeight * levelValue, strokeThickness);
  var line = anychart.math.clipRayByRect(sx, y, sx + 10, y, this.pixelBoundsCache);
  if (line) {
    path.moveTo(line[0], line[1]).lineTo(line[2], line[3]);
    hoverPath.moveTo(line[0], line[1]).lineTo(line[2], line[3]);
  }

  if (drawLabels) {
    var position = {'value': {'x': sx, 'y': y}};
    this.drawLabel(levelIndex, mainFactory, stateFactory, this.createFormatProvider(levelValue), position, undefined);
  }
};


/** @inheritDoc */
anychart.core.annotations.FibonacciRetracement.prototype.checkVisible = function() {
  var res = anychart.core.annotations.FibonacciRetracement.base(this, 'checkVisible');
  if (!res) {
    var x1 = this.coords['xAnchor'];
    var x2 = this.coords['secondXAnchor'];
    var x = Math.min(x1, x2);
    res = !isNaN(x) && (x <= this.pixelBoundsCache.getRight());
  }
  return res;
};
//endregion
