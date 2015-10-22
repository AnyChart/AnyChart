goog.provide('anychart.core.cartesian.series.BarBase');

goog.require('anychart.core.cartesian.series.WidthBased');



/**
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @constructor
 * @extends {anychart.core.cartesian.series.WidthBased}
 */
anychart.core.cartesian.series.BarBase = function(opt_data, opt_csvSettings) {
  goog.base(this, opt_data, opt_csvSettings);
  this.markers().position(anychart.enums.Position.RIGHT_CENTER);
  this.labels().position(anychart.enums.Position.RIGHT_CENTER);
};
goog.inherits(anychart.core.cartesian.series.BarBase, anychart.core.cartesian.series.WidthBased);


/** @inheritDoc */
anychart.core.cartesian.series.BarBase.prototype.getPointWidth = function() {
  // todo(Anton Saukh): fix for linear scale case.
  var categoryWidth = (this.xScale().getPointWidthRatio() || (this.xScale().getZoomFactor() / this.getIterator().getRowsCount())) *
      this.pixelBoundsCache.height;
  return anychart.utils.normalizeSize(/** @type {(number|string)} */(this.pointWidth()), categoryWidth);
};


/** @inheritDoc */
anychart.core.cartesian.series.BarBase.prototype.isBarBased = function() {
  return true;
};


/** @inheritDoc */
anychart.core.cartesian.series.BarBase.prototype.applyRatioToBounds = function(ratio, horizontal) {
  var min, range;
  if (horizontal) {
    min = this.pixelBoundsCache.getBottom();
    range = -this.pixelBoundsCache.height;
  } else {
    min = this.pixelBoundsCache.left;
    range = this.pixelBoundsCache.width;
  }
  return min + ratio * range;
};


/** @inheritDoc */
anychart.core.cartesian.series.BarBase.prototype.applyAxesLinesSpace = function(value) {
  var bounds = this.pixelBoundsCache;
  var max = bounds.getRight() - +this.axesLinesSpace().right();
  var min = bounds.getLeft() + +this.axesLinesSpace().left();

  return goog.math.clamp(value, min, max);
};
