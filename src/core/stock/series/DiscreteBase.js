goog.provide('anychart.core.stock.series.DiscreteBase');
goog.require('anychart.core.stock.series.Base');



/**
 * DiscreteBase series class.
 * @param {!anychart.charts.Stock} chart
 * @param {!anychart.core.stock.Plot} plot
 * @constructor
 * @extends {anychart.core.stock.series.Base}
 */
anychart.core.stock.series.DiscreteBase = function(chart, plot) {
  goog.base(this, chart, plot);
};
goog.inherits(anychart.core.stock.series.DiscreteBase, anychart.core.stock.series.Base);


/**
 * Point width settings.
 * @param {(number|string|null)=} opt_value Point width pixel value.
 * @return {string|number|anychart.core.stock.series.DiscreteBase} Bar width pixel value or Bar instance for chaining call.
 */
anychart.core.stock.series.DiscreteBase.prototype.pointWidth = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.barWidth_ = opt_value;
    return this;
  } else {
    return goog.isDefAndNotNull(this.barWidth_) ? this.barWidth_ : '90%';
  }
};


/**
 * @return {number} Point width in pixels.
 * @protected
 */
anychart.core.stock.series.DiscreteBase.prototype.getPointWidth = function() {
  return anychart.utils.normalizeSize(/** @type {(number|string)} */(this.pointWidth()), this.getCategoryWidth());
};


/**
 * @return {number} Category width in pixels.
 * @protected
 */
anychart.core.stock.series.DiscreteBase.prototype.getCategoryWidth = function() {
  if (this.xScale instanceof anychart.scales.StockOrdinalDateTime)
    return this.pixelBoundsCache.width / (this.xScale.getMaximumIndex() - this.xScale.getMinimumIndex());
  else
    return this.getSelectableData().getMinDistance() / (this.xScale.getMaximum() - this.xScale.getMinimum()) * this.pixelBoundsCache.width;
};


/**
 * @inheritDoc
 */
anychart.core.stock.series.DiscreteBase.prototype.setupByJSON = function(config) {
  goog.base(this, 'setupByJSON', config);
  this.pointWidth(config['pointWidth']);
};


//exports
anychart.core.stock.series.DiscreteBase.prototype['pointWidth'] = anychart.core.stock.series.DiscreteBase.prototype.pointWidth;
