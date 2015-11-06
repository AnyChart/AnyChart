goog.provide('anychart.core.stock.scrollerSeries.DiscreteBase');
goog.require('anychart.core.stock.scrollerSeries.Base');



/**
 * DiscreteBase series class.
 * @param {!anychart.core.stock.Scroller} scroller
 * @constructor
 * @extends {anychart.core.stock.scrollerSeries.Base}
 */
anychart.core.stock.scrollerSeries.DiscreteBase = function(scroller) {
  goog.base(this, scroller);
};
goog.inherits(anychart.core.stock.scrollerSeries.DiscreteBase, anychart.core.stock.scrollerSeries.Base);


/**
 * Point width settings.
 * @param {(number|string|null)=} opt_value Point width pixel value.
 * @return {string|number|anychart.core.stock.scrollerSeries.DiscreteBase} Bar width pixel value or Bar instance for chaining call.
 */
anychart.core.stock.scrollerSeries.DiscreteBase.prototype.pointWidth = function(opt_value) {
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
anychart.core.stock.scrollerSeries.DiscreteBase.prototype.getPointWidth = function() {
  var categoryWidth = this.getSelectableData().getMinDistance() / (this.xScale.getMaximum() - this.xScale.getMinimum()) * this.pixelBoundsCache.width;
  return anychart.utils.normalizeSize(/** @type {(number|string)} */(this.pointWidth()), categoryWidth);
};


/**
 * @inheritDoc
 */
anychart.core.stock.scrollerSeries.DiscreteBase.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  json['pointWidth'] = this.pointWidth();
  return json;
};


/**
 * @inheritDoc
 */
anychart.core.stock.scrollerSeries.DiscreteBase.prototype.setupByJSON = function(config) {
  goog.base(this, 'setupByJSON', config);
  this.pointWidth(config['pointWidth']);
};

//exports
anychart.core.stock.scrollerSeries.DiscreteBase.prototype['pointWidth'] = anychart.core.stock.scrollerSeries.DiscreteBase.prototype.pointWidth;
