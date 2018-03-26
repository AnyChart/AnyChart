goog.provide('anychart.stockModule.scales.Ordinal');
goog.require('anychart.stockModule.scales.ExplicitTicksIterator');
goog.require('anychart.stockModule.scales.OrdinalTicksIterator');
goog.require('anychart.stockModule.scales.Scatter');
goog.require('anychart.utils');



/**
 * Stock ordinal date time scale.
 * @param {!(anychart.stockModule.Chart|anychart.stockModule.Scroller)} chartOrScroller
 * @constructor
 * @extends {anychart.stockModule.scales.Scatter}
 */
anychart.stockModule.scales.Ordinal = function(chartOrScroller) {
  anychart.stockModule.scales.Ordinal.base(this, 'constructor', chartOrScroller);
};
goog.inherits(anychart.stockModule.scales.Ordinal, anychart.stockModule.scales.Scatter);


/** @inheritDoc */
anychart.stockModule.scales.Ordinal.prototype.getType = function() {
  return anychart.enums.ScaleTypes.STOCK_ORDINAL_DATE_TIME;
};


/** @inheritDoc */
anychart.stockModule.scales.Ordinal.prototype.transform = function(value, opt_subrangeRatio) {
  return this.transformInternal(value, this.keyIndexTransformer.getIndexByKey(anychart.utils.normalizeTimestamp(value)));
};


/** @inheritDoc */
anychart.stockModule.scales.Ordinal.prototype.inverseTransform = function(ratio) {
  var result = ratio * (this.maxIndex - this.minIndex) + this.minIndex;
  return Math.round(this.keyIndexTransformer.getKeyByIndex(result));
};


/** @inheritDoc */
anychart.stockModule.scales.Ordinal.prototype.transformInternal = function(key, index, opt_subRangeRatio) {
  return (index - this.minIndex) / (this.maxIndex - this.minIndex);
};


/** @inheritDoc */
anychart.stockModule.scales.Ordinal.prototype.transformAligned = function(key) {
  return this.transformInternal(key, Math.ceil(this.keyIndexTransformer.getIndexByKey(anychart.utils.normalizeTimestamp(key))));
};


/** @inheritDoc */
anychart.stockModule.scales.Ordinal.prototype.ensureTicksIteratorCreated = function() {
  if (!this.ticksIterator)
    this.ticksIterator = new anychart.stockModule.scales.OrdinalTicksIterator(this);
  if (!this.explicitTicksIterator && this.ticksCallback_)
    this.explicitTicksIterator = new anychart.stockModule.scales.ExplicitTicksIterator();
};


//exports
(function() {
  var proto = anychart.stockModule.scales.Ordinal.prototype;
  proto['transform'] = proto.transform;
  proto['inverseTransform'] = proto.inverseTransform;
})();
