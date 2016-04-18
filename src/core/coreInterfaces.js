goog.provide('anychart.core.I3DProvider');
goog.provide('anychart.core.IChart');
goog.provide('anychart.core.IPlot');



/**
 * @interface
 */
anychart.core.IChart = function() {};


/**
 * @return {anychart.core.Base}
 * @this {anychart.core.Base}
 */
anychart.core.IChart.prototype.suspendSignalsDispatching = function() {};


/**
 * @param {boolean} dispatch
 * @return {anychart.core.Base}
 * @this {anychart.core.Base}
 */
anychart.core.IChart.prototype.resumeSignalsDispatching = function(dispatch) {};


/**
 * @return {anychart.scales.IXScale|anychart.core.IChart}
 */
anychart.core.IChart.prototype.xScale = function() {};


/**
 * Returns normalized series type and a config for this series type.
 * @param {string} name
 * @return {?Array.<string|anychart.core.series.TypeConfig>}
 */
anychart.core.IChart.prototype.getConfigByType = function(name) {};



/**
 * @interface
 */
anychart.core.IPlot = function() {};


/**
 * @return {anychart.scales.Base|anychart.core.IPlot}
 */
anychart.core.IPlot.prototype.yScale = function() {};


/**
 * @return {!Array.<anychart.core.series.Base>}
 */
anychart.core.IPlot.prototype.getAllSeries = function() {};


/**
 * Getter/setter for series default settings.
 * @param {Object=} opt_value Object with default series settings.
 * @return {Object}
 */
anychart.core.IPlot.prototype.defaultSeriesSettings = function(opt_value) {};



/**
 * @interface
 */
anychart.core.I3DProvider = function() {};


/**
 * @param {number} seriesIndex
 * @param {boolean} seriesIsStacked
 * @return {number}
 */
anychart.core.I3DProvider.prototype.getX3DDistributionShift = function(seriesIndex, seriesIsStacked) {};


/**
 * @param {number} seriesIndex
 * @param {boolean} seriesIsStacked
 * @return {number}
 */
anychart.core.I3DProvider.prototype.getY3DDistributionShift = function(seriesIndex, seriesIsStacked) {};


/**
 * @param {boolean} seriesIsStacked
 * @return {number}
 */
anychart.core.I3DProvider.prototype.getX3DShift = function(seriesIsStacked) {};


/**
 * @param {boolean} seriesIsStacked
 * @return {number}
 */
anychart.core.I3DProvider.prototype.getY3DShift = function(seriesIsStacked) {};


/**
 * @param {number} seriesIndex
 * @param {boolean} seriesIsStacked
 * @param {string} scalesIds
 * @return {boolean}
 */
anychart.core.I3DProvider.prototype.shouldDrawTopSide = function(seriesIndex, seriesIsStacked, scalesIds) {};


/**
 * @return {boolean}
 */
anychart.core.I3DProvider.prototype.yInverted = function() {};


/**
 * @return {boolean}
 */
anychart.core.I3DProvider.prototype.xInverted = function() {};
