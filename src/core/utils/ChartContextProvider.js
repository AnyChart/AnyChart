goog.provide('anychart.core.utils.ChartContextProvider');

goog.require('anychart.core.utils.BaseContextProvider');



/**
 * Chart context provider.
 * @param {anychart.core.Chart} chart - Chart instance.
 * @constructor
 * @extends {anychart.core.utils.BaseContextProvider}
 */
anychart.core.utils.ChartContextProvider = function(chart) {
  anychart.core.utils.ChartContextProvider.base(this, 'constructor');

  this.chartInternal = chart;

  /**
   * @type {anychart.core.Chart}
   */
  this['chart'] = chart;
};
goog.inherits(anychart.core.utils.ChartContextProvider, anychart.core.utils.BaseContextProvider);


/**
 * Gets stat by key.
 * @param {string=} opt_key - Key.
 * @return {*}
 */
anychart.core.utils.ChartContextProvider.prototype.getStat = function(opt_key) {
  return this['chart'].getStat(opt_key);
};


//exports
(function() {
  var proto = anychart.core.utils.ChartContextProvider.prototype;
  proto['getStat'] = proto.getStat;
})();

