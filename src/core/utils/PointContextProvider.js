goog.provide('anychart.core.utils.PointContextProvider');
goog.require('anychart.core.utils.BaseContextProvider');
goog.require('anychart.core.utils.IContextProvider');



/**
 * @param {anychart.charts.Pie|anychart.core.PyramidFunnelBase|anychart.charts.Sparkline} chartInstance chart instance.
 * @param {Array.<string>} referenceValueNames reference value names to be applied.
 * @extends {anychart.core.utils.BaseContextProvider}
 * @implements {anychart.core.utils.IContextProvider}
 * @constructor
 */
anychart.core.utils.PointContextProvider = function(chartInstance, referenceValueNames) {
  anychart.core.utils.PointContextProvider.base(this, 'constructor');

  this.chartInternal = chartInstance;
  /**
   * @type {anychart.charts.Pie|anychart.core.PyramidFunnelBase|anychart.charts.Sparkline}
   */
  this['chart'] = chartInstance;

  /**
   * @type {Array.<string>}
   * @protected
   */
  this.referenceValueNames = referenceValueNames;
};
goog.inherits(anychart.core.utils.PointContextProvider, anychart.core.utils.BaseContextProvider);


/** @inheritDoc */
anychart.core.utils.PointContextProvider.prototype.applyReferenceValues = function() {
  var iterator = this['chart'].getIterator();
  var value;
  this['index'] = iterator.getIndex();
  for (var i = 0; i < this.referenceValueNames.length; i++) {
    value = this.referenceValueNames[i];
    this[value] = iterator.get(value);
  }
  if (iterator.meta('groupedPoint')) {
    this['name'] = 'Other points';
    this['groupedPoint'] = true;
    this['names'] = iterator.meta('names');
    this['values'] = iterator.meta('values');
  } else {
    delete this['groupedPoint'];
    delete this['names'];
    delete this['values'];
  }
};


/** @inheritDoc */
anychart.core.utils.PointContextProvider.prototype.getStat = function(key) {
  return /** @type {{getStat:function(string):*}} */(this['chart']).getStat(key);
};


/** @inheritDoc */
anychart.core.utils.PointContextProvider.prototype.getDataValue = function(key) {
  return this['chart'].getIterator().get(key);
};


/** @inheritDoc */
anychart.core.utils.PointContextProvider.prototype.getTokenValue = function(name) {
  switch (name) {
    case anychart.enums.StringToken.NAME:
      return this['name'];
    case anychart.enums.StringToken.X_VALUE:
      return this['x'];
  }
  return anychart.core.utils.PointContextProvider.base(this, 'getTokenValue', name);
};


//exports
(function() {
  var proto = anychart.core.utils.PointContextProvider.prototype;
  proto['getStat'] = proto.getStat;
  proto['getDataValue'] = proto.getDataValue;
  proto['getTokenValue'] = proto.getTokenValue;
})();
