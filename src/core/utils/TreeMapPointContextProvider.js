goog.provide('anychart.core.utils.TreeMapPointContextProvider');
goog.require('anychart.core.utils.BaseContextProvider');
goog.require('anychart.core.utils.IContextProvider');



/**
 * TreeMap point context provider.
 * @param {anychart.charts.TreeMap} chart chart instance.
 * @extends {anychart.core.utils.BaseContextProvider}
 * @implements {anychart.core.utils.IContextProvider}
 * @constructor
 */
anychart.core.utils.TreeMapPointContextProvider = function(chart) {
  anychart.core.utils.TreeMapPointContextProvider.base(this, 'constructor');

  this.chartInternal = chart;

  /**
   * @type {anychart.charts.TreeMap}
   */
  this['chart'] = chart;
};
goog.inherits(anychart.core.utils.TreeMapPointContextProvider, anychart.core.utils.BaseContextProvider);


/** @inheritDoc */
anychart.core.utils.TreeMapPointContextProvider.prototype.applyReferenceValues = function() {
  var iterator = this['chart'].getIterator();
  var dataItem = iterator.getItem();

  this['index'] = iterator.getIndex();
  // own field for data
  this['name'] = dataItem.get('name');
  // calculated fields from meta
  this['value'] = dataItem.meta('value');
  this['size'] = dataItem.meta('size');
};


/** @inheritDoc */
anychart.core.utils.TreeMapPointContextProvider.prototype.getStat = function(key) {
  return void 0;
  //return /** @type {{statistics:Function, getIterator:Function}} */(this['chart']).statistics(opt_key);
};


/** @inheritDoc */
anychart.core.utils.TreeMapPointContextProvider.prototype.getDataValue = function(key) {
  var dataItem = /** @type {anychart.data.Tree.DataItem} */ (this['chart'].getIterator().getItem());
  return dataItem.get(key);
};


/** @inheritDoc */
anychart.core.utils.TreeMapPointContextProvider.prototype.getTokenValue = function(name) {
  switch (name) {
    case anychart.enums.StringToken.NAME:
      return this['name'];
  }
  return anychart.core.utils.TreeMapPointContextProvider.base(this, 'getTokenValue', name);
};


//exports
(function() {
  var proto = anychart.core.utils.TreeMapPointContextProvider.prototype;
  proto['getStat'] = proto.getStat;
  proto['getDataValue'] = proto.getDataValue;
  proto['getTokenValue'] = proto.getTokenValue;
})();
