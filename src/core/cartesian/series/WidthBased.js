goog.provide('anychart.core.cartesian.series.WidthBased');

goog.require('anychart.core.cartesian.series.DiscreteBase');



/**
 * A base for all width-based series like bars, columns, OHLC and candlesticks.
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @constructor
 * @extends {anychart.core.cartesian.series.DiscreteBase}
 */
anychart.core.cartesian.series.WidthBased = function(opt_data, opt_csvSettings) {
  goog.base(this, opt_data, opt_csvSettings);
};
goog.inherits(anychart.core.cartesian.series.WidthBased, anychart.core.cartesian.series.DiscreteBase);


/**
 * @private
 * @type {(number|string|null)}
 */
anychart.core.cartesian.series.WidthBased.prototype.barWidth_ = null;


/**
 * @private
 * @type {string}
 */
anychart.core.cartesian.series.WidthBased.prototype.autoBarWidth_ = '90%';


/**
 * Getter/setter for pointWidth.
 * @param {(number|string|null)=} opt_value Point width pixel value.
 * @return {string|number|anychart.core.cartesian.series.WidthBased} Bar width pixel value or Bar instance for chaining call.
 */
anychart.core.cartesian.series.WidthBased.prototype.pointWidth = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.barWidth_ = opt_value;
    return this;
  } else {
    return goog.isDefAndNotNull(this.barWidth_) ? this.barWidth_ : this.autoBarWidth_;
  }
};


/** @inheritDoc */
anychart.core.cartesian.series.WidthBased.prototype.setAutoBarWidth = function(value) {
  this.autoBarWidth_ = String(value * 100) + '%';
};


/** @inheritDoc */
anychart.core.cartesian.series.WidthBased.prototype.isWidthBased = function() {
  return true;
};


/**
 * @return {number} Point width in pixels.
 */
anychart.core.cartesian.series.WidthBased.prototype.getPointWidth = function() {
  // todo(Anton Saukh): fix for linear scale case.
  var categoryWidth = (this.xScale().getPointWidthRatio() || (this.xScale().getZoomFactor() / this.getIterator().getRowsCount())) *
      this.pixelBoundsCache.width;
  return anychart.utils.normalizeSize(/** @type {(number|string)} */(this.pointWidth()), categoryWidth);
};


/**
 * @inheritDoc
 */
anychart.core.cartesian.series.WidthBased.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  json['pointWidth'] = this.barWidth_ || null;
  return json;
};


/**
 * @inheritDoc
 */
anychart.core.cartesian.series.WidthBased.prototype.setupByJSON = function(config) {
  goog.base(this, 'setupByJSON', config);
  this.pointWidth(config['pointWidth']);
};


//exports
anychart.core.cartesian.series.WidthBased.prototype['pointWidth'] = anychart.core.cartesian.series.WidthBased.prototype.pointWidth;
