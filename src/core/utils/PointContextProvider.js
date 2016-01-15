goog.provide('anychart.core.utils.PointContextProvider');
goog.require('anychart.core.utils.BaseContextProvider');
goog.require('anychart.core.utils.IContextProvider');



/**
 * @implements {anychart.core.utils.IContextProvider}
 * @param {anychart.charts.Pie|anychart.core.PyramidFunnelBase|anychart.charts.Sparkline} chartInstance chart instance.
 * @param {Array.<string>} referenceValueNames reference value names to be applied.
 * @extends {anychart.core.utils.BaseContextProvider}
 * @constructor
 */
anychart.core.utils.PointContextProvider = function(chartInstance, referenceValueNames) {
  anychart.core.utils.PointContextProvider.base(this, 'constructor');
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
  if (iterator.meta('groupedPoint') == true) {
    this['name'] = 'Other points';
    this['groupedPoint'] = true;
    this['names'] = iterator.meta('names');
    this['values'] = iterator.meta('values');
  }
};


/** @inheritDoc */
anychart.core.utils.PointContextProvider.prototype.getStat = function(opt_key) {
  return /** @type {{statistics:Function, getIterator:Function}} */(this['chart']).statistics(opt_key);
};


/** @inheritDoc */
anychart.core.utils.PointContextProvider.prototype.getDataValue = function(key) {
  return this['chart'].getIterator().get(key);
};


/** @inheritDoc */
anychart.core.utils.PointContextProvider.prototype.getTokenValue = function(name) {
  switch (name) {
    case '%Name':
      return this['name'];
    case '%SeriesYSum':
    case '%DataPlotYSum':
      return this.getStat('sum');
    case '%SeriesYMax':
    case '%DataPlotYMax':
      return this.getStat('max');
    case '%SeriesYMin':
    case '%DataPlotYMin':
      return this.getStat('min');
    case '%SeriesYAverage':
    case '%DataPlotYAverage':
      return this.getStat('average');
    case '%SeriesPointCount':
    case '%DataPlotPointCount':
      return this.getStat('count');
    case '%XValue':
      return this['x'];
  }
  return anychart.core.utils.PointContextProvider.base(this, 'getTokenValue', name);
};


//exports
anychart.core.utils.PointContextProvider.prototype['getStat'] = anychart.core.utils.PointContextProvider.prototype.getStat;
anychart.core.utils.PointContextProvider.prototype['getDataValue'] = anychart.core.utils.PointContextProvider.prototype.getDataValue;
anychart.core.utils.PointContextProvider.prototype['getTokenValue'] = anychart.core.utils.PointContextProvider.prototype.getTokenValue;
