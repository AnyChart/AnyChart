goog.provide('anychart.cartesian.series.BarBase');

goog.require('anychart.cartesian.series.WidthBased');



/**
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @constructor
 * @extends {anychart.cartesian.series.WidthBased}
 */
anychart.cartesian.series.BarBase = function(data, opt_csvSettings) {
  goog.base(this, data, opt_csvSettings);
  this.markers().position(anychart.enums.Position.RIGHT_CENTER);
  this.labels().position(anychart.enums.Position.RIGHT_CENTER);
};
goog.inherits(anychart.cartesian.series.BarBase, anychart.cartesian.series.WidthBased);


/** @inheritDoc */
anychart.cartesian.series.BarBase.prototype.getPointWidth = function() {
  // todo(Anton Saukh): fix for linear scale case.
  var categoryWidth = (this.xScale().getPointWidthRatio() || (1 / this.getIterator().getRowsCount())) *
      this.pixelBounds().height;
  return anychart.utils.normalizeSize(/** @type {(number|string)} */(this.pointWidth()), categoryWidth);
};


/** @inheritDoc */
anychart.cartesian.series.BarBase.prototype.isBarBased = function() {
  return true;
};


/** @inheritDoc */
anychart.cartesian.series.BarBase.prototype.applyRatioToBounds = function(ratio, horizontal) {
  /** @type {acgraph.math.Rect} */
  var bounds = /** @type {acgraph.math.Rect} */(this.pixelBounds());
  var min, range;
  if (horizontal) {
    min = bounds.getBottom();
    range = -bounds.height;
  } else {
    min = bounds.left;
    range = bounds.width;
  }
  return min + ratio * range;
};


/** @inheritDoc */
anychart.cartesian.series.BarBase.prototype.applyAxesLinesSpace = function(value) {
  var bounds = this.pixelBounds();
  var max = bounds.getRight() - +this.axesLinesSpace().right();
  var min = bounds.getLeft() + +this.axesLinesSpace().left();

  return goog.math.clamp(value, min, max);
};
