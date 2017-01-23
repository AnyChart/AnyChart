goog.provide('anychart.core.annotations.FibonacciArc');
goog.require('anychart.core.annotations');
goog.require('anychart.core.annotations.FibonacciBase');
goog.require('anychart.enums');



/**
 * FibonacciArc annotation.
 * @param {!anychart.core.annotations.ChartController} chartController
 * @constructor
 * @extends {anychart.core.annotations.FibonacciBase}
 */
anychart.core.annotations.FibonacciArc = function(chartController) {
  anychart.core.annotations.FibonacciArc.base(this, 'constructor', chartController);
};
goog.inherits(anychart.core.annotations.FibonacciArc, anychart.core.annotations.FibonacciBase);
anychart.core.annotations.AnnotationTypes[anychart.enums.AnnotationTypes.FIBONACCI_ARC] = anychart.core.annotations.FibonacciArc;


//region Properties
//----------------------------------------------------------------------------------------------------------------------
//
//  Properties
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.annotations.FibonacciArc.prototype.type = anychart.enums.AnnotationTypes.FIBONACCI_ARC;
//endregion


//region Drawing
//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.annotations.FibonacciArc.prototype.drawLevel = function(levelIndex, levelValue, path, hoverPath,
                                                                      mainFactory, stateFactory, drawLabels, strokeThickness) {
  var sx = this.coords['xAnchor'];
  var sy = this.coords['valueAnchor'];
  var ex = this.coords['secondXAnchor'];
  var ey = this.coords['secondValueAnchor'];
  var lx = ex + levelValue * (sx - ex);
  var ly = ey + levelValue * (sy - ey);
  var r = Math.sqrt((lx - ex) * (lx - ex) + (ly - ey) * (ly - ey));
  if (ly < ey) {
    path.circularArc(ex, ey, r, r, 180, 180);
    hoverPath.circularArc(ex, ey, r, r, 180, 180);
  } else {
    path.circularArc(ex, ey, r, r, 0, 180);
    hoverPath.circularArc(ex, ey, r, r, 0, 180);
  }
  if (drawLabels) {
    var position, anchor;
    if (ly < ey) {
      position = {'x': ex, 'y': ey - r};
      anchor = anychart.enums.Anchor.CENTER_TOP;
    } else {
      position = {'x': ex, 'y': ey + r};
      anchor = anychart.enums.Anchor.CENTER_BOTTOM;
    }
    this.drawLabel(levelIndex, mainFactory, stateFactory, this.createFormatProvider(levelValue),
        {'value': position}, {'anchor': anchor});
  }
};


/** @inheritDoc */
anychart.core.annotations.FibonacciArc.prototype.checkVisible = function() {
  var res = anychart.core.annotations.FibonacciArc.base(this, 'checkVisible');
  if (!res) {
    var sx = this.coords['xAnchor'];
    var sy = this.coords['valueAnchor'];
    var ex = this.coords['secondXAnchor'];
    var ey = this.coords['secondValueAnchor'];
    var maxLevel = Math.max.apply(Math, this.levelsInternal);
    var lx = ex + maxLevel * (sx - ex);
    var ly = ey + maxLevel * (sy - ey);
    var r = Math.sqrt((lx - ex) * (lx - ex) + (ly - ey) * (ly - ey));
    res = !isNaN(r) && !((ex + r < this.pixelBoundsCache.left) || (ex - r > this.pixelBoundsCache.getRight()));
  }
  return res;
};
//endregion
