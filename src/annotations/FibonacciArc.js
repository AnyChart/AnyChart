goog.provide('anychart.annotationsModule.FibonacciArc');
goog.require('anychart.annotationsModule');
goog.require('anychart.annotationsModule.FibonacciBase');
goog.require('anychart.enums');



/**
 * FibonacciArc annotation.
 * @param {!anychart.annotationsModule.ChartController} chartController
 * @constructor
 * @extends {anychart.annotationsModule.FibonacciBase}
 */
anychart.annotationsModule.FibonacciArc = function(chartController) {
  anychart.annotationsModule.FibonacciArc.base(this, 'constructor', chartController);
};
goog.inherits(anychart.annotationsModule.FibonacciArc, anychart.annotationsModule.FibonacciBase);
anychart.annotationsModule.AnnotationTypes[anychart.enums.AnnotationTypes.FIBONACCI_ARC] = anychart.annotationsModule.FibonacciArc;


//region Properties
//----------------------------------------------------------------------------------------------------------------------
//
//  Properties
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.annotationsModule.FibonacciArc.prototype.type = anychart.enums.AnnotationTypes.FIBONACCI_ARC;


//endregion
//region Drawing
//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.annotationsModule.FibonacciArc.prototype.drawLevel = function(levelIndex, levelRatio, path, hoverPath,
                                                                      mainFactory, stateFactory, drawLabels, strokeThickness) {
  var sx = this.coords['xAnchor'];
  var sy = this.coords['valueAnchor'];
  var ex = this.coords['secondXAnchor'];
  var ey = this.coords['secondValueAnchor'];
  var lx = ex + levelRatio * (sx - ex);
  var ly = ey + levelRatio * (sy - ey);
  var r = anychart.math.vectorLength(lx, ly, ex, ey);
  if (ly < ey) {
    path.circularArc(ex, ey, r, r, 180, 180);
    hoverPath.circularArc(ex, ey, r, r, 180, 180);
  } else {
    path.circularArc(ex, ey, r, r, 0, 180);
    hoverPath.circularArc(ex, ey, r, r, 0, 180);
  }
  if (drawLabels) {
    var position, anchor;
    var y;
    if (sy < ey) {
      y = ey - r;
      anchor = anychart.enums.Anchor.CENTER_BOTTOM;
    } else {
      y = ey + r;
      anchor = anychart.enums.Anchor.CENTER_TOP;
    }
    position = {
      'x': ex,
      'y': y
    };
    this.drawLabel(levelIndex, mainFactory, stateFactory, this.createFormatProvider(levelRatio, this.getValueFromPixY(y), false),
        {'value': position}, anchor);
  }
};


/** @inheritDoc */
anychart.annotationsModule.FibonacciArc.prototype.checkVisible = function() {
  var res = anychart.annotationsModule.FibonacciArc.base(this, 'checkVisible');
  if (!res) {
    var sx = this.coords['xAnchor'];
    var sy = this.coords['valueAnchor'];
    var ex = this.coords['secondXAnchor'];
    var ey = this.coords['secondValueAnchor'];
    var maxLevel = Math.max.apply(Math, this.levelsInternal);
    var lx = ex + maxLevel * (sx - ex);
    var ly = ey + maxLevel * (sy - ey);
    var r = anychart.math.vectorLength(lx, ly, ex, ey);
    res = !isNaN(r) && !((ex + r < this.pixelBoundsCache.left) || (ex - r > this.pixelBoundsCache.getRight()));
  }
  return res;
};
//endregion
