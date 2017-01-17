goog.provide('anychart.core.series.Pareto');
goog.require('anychart.core.series.Cartesian');
goog.require('anychart.core.utils.IInteractiveSeries');
goog.require('anychart.core.utils.ParetoSeriesPointContextProvider');
goog.forwardDeclare('anychart.data.ParetoMapping');
goog.forwardDeclare('anychart.data.ParetoSeriesMapping');



/**
 * Class that represents a pareto series for the user.
 * @param {!anychart.core.IChart} chart
 * @param {!anychart.core.IPlot} plot
 * @param {string} type
 * @param {anychart.core.series.TypeConfig} config
 * @param {boolean} sortedMode
 * @constructor
 * @extends {anychart.core.series.Cartesian}
 * @implements {anychart.core.utils.IInteractiveSeries}
 */
anychart.core.series.Pareto = function(chart, plot, type, config, sortedMode) {
  anychart.core.series.Pareto.base(this, 'constructor', chart, plot, type, config, sortedMode);
};
goog.inherits(anychart.core.series.Pareto, anychart.core.series.Cartesian);


//region --- Overrides
/** @inheritDoc */
anychart.core.series.Pareto.prototype.createLabelsContextProvider = function() {
  var provider = new anychart.core.utils.ParetoSeriesPointContextProvider(this, this.getYValueNames(), this.supportsError());
  provider.applyReferenceValues();
  return provider;
};


/** @inheritDoc */
anychart.core.series.Pareto.prototype.createTooltipContextProvider = function() {
  if (!this.tooltipContext) {
    /**
     * Tooltip context cache.
     * @type {anychart.core.utils.ParetoSeriesPointContextProvider}
     * @protected
     */
    this.tooltipContext = new anychart.core.utils.ParetoSeriesPointContextProvider(this, this.getYValueNames(), this.supportsError());
  }
  this.tooltipContext.applyReferenceValues();
  return this.tooltipContext;
};


/** @inheritDoc */
anychart.core.series.Pareto.prototype.getColorResolutionContext = function(opt_baseColor, opt_ignorePointSettings) {
  var ctx = anychart.core.series.Pareto.base(this, 'getColorResolutionContext', opt_baseColor, opt_ignorePointSettings);
  this.applyCFRFTo(ctx, ctx['index']);
  return ctx;
};


/** @inheritDoc */
anychart.core.series.Pareto.prototype.getHatchFillResolutionContext = function(opt_ignorePointSettings) {
  var ctx = anychart.core.series.Pareto.base(this, 'getHatchFillResolutionContext', opt_ignorePointSettings);
  this.applyCFRFTo(ctx, ctx['index']);
  return ctx;
};


/** @inheritDoc */
anychart.core.series.Pareto.prototype.getPoint = function(index) {
  var point = anychart.core.series.Pareto.base(this, 'getPoint', index);
  this.applyCFRFTo(point, index);
  return point;
};


/**
 * Get cf and rf values.
 * @param {number} index
 * @return {?Object}
 */
anychart.core.series.Pareto.prototype.getCFRF = function(index) {
  var rv = null;
  var data = this.data();
  if (goog.isDef(data)) {
    var paretoMapping = /** @type {anychart.data.Mapping} */ (data.getRowMapping(index));
    if ((paretoMapping instanceof anychart.data.ParetoMapping) || (paretoMapping instanceof anychart.data.ParetoSeriesMapping)) {
      rv = {};
      rv['cf'] = paretoMapping.getCumulativeFrequency(index);
      rv['rf'] = paretoMapping.getRelativeFrequency(index);
    }
  }
  return rv;
};


/**
 * Add cf and rf values to target.
 * @param {Object} target
 * @param {number} index
 */
anychart.core.series.Pareto.prototype.applyCFRFTo = function(target, index) {
  var cfrf;
  if (goog.isDef(index) && index > -1)
    cfrf = this.getCFRF(index);
  if (cfrf) {
    target['cf'] = cfrf['cf'];
    target['rf'] = cfrf['rf'];
  }
};


//endregion
