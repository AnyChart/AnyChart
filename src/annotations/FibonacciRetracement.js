goog.provide('anychart.annotationsModule.FibonacciRetracement');
goog.require('anychart.annotationsModule');
goog.require('anychart.annotationsModule.FibonacciBase');
goog.require('anychart.enums');



/**
 * FibonacciRetracement annotation.
 * @param {!anychart.annotationsModule.ChartController} chartController
 * @constructor
 * @extends {anychart.annotationsModule.FibonacciBase}
 */
anychart.annotationsModule.FibonacciRetracement = function(chartController) {
  anychart.annotationsModule.FibonacciRetracement.base(this, 'constructor', chartController);
};
goog.inherits(anychart.annotationsModule.FibonacciRetracement, anychart.annotationsModule.FibonacciBase);
anychart.annotationsModule.AnnotationTypes[anychart.enums.AnnotationTypes.FIBONACCI_RETRACEMENT] = anychart.annotationsModule.FibonacciRetracement;


//region Properties
//----------------------------------------------------------------------------------------------------------------------
//
//  Properties
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.annotationsModule.FibonacciRetracement.prototype.type = anychart.enums.AnnotationTypes.FIBONACCI_RETRACEMENT;


//endregion
//region Drawing
//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.annotationsModule.FibonacciRetracement.prototype.drawLevel = function(levelIndex, levelRatio, path, hoverPath,
                                                                              mainFactory, stateFactory, drawLabels, strokeThickness) {
  var x1 = this.coords['xAnchor'];
  var y1 = this.coords['valueAnchor'];
  var x2 = this.coords['secondXAnchor'];
  var y2 = this.coords['secondValueAnchor'];
  var sx = Math.min(x1, x2);
  var baseHeight = y1 - y2;
  var y = anychart.utils.applyPixelShift(y2 + baseHeight * levelRatio, strokeThickness);
  var line = anychart.math.clipRayByRect(sx, y, sx + 10, y, this.pixelBoundsCache);
  if (line) {
    path.moveTo(line[0], line[1]).lineTo(line[2], line[3]);
    hoverPath.moveTo(line[0], line[1]).lineTo(line[2], line[3]);
  }

  if (drawLabels) {
    var position = {'value': {'x': sx, 'y': y}};
    this.drawLabel(levelIndex, mainFactory, stateFactory, this.createFormatProvider(levelRatio, this.getValueFromPixY(y), false), position);
  }
};


/** @inheritDoc */
anychart.annotationsModule.FibonacciRetracement.prototype.checkVisible = function() {
  var res = anychart.annotationsModule.FibonacciRetracement.base(this, 'checkVisible');
  if (!res) {
    var x1 = this.coords['xAnchor'];
    var x2 = this.coords['secondXAnchor'];
    var x = Math.min(x1, x2);
    res = !isNaN(x) && (x <= this.pixelBoundsCache.getRight());
  }
  return res;
};
//endregion
