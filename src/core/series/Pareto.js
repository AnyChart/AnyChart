goog.provide('anychart.core.series.Pareto');

goog.require('anychart.core.series.Cartesian');
goog.require('anychart.core.utils.IInteractiveSeries');
goog.require('anychart.format.Context');
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
anychart.core.series.Pareto.prototype.updateContext = function(provider, opt_rowInfo) {
  provider = anychart.core.series.Pareto.base(this, 'updateContext', provider, opt_rowInfo);
  var values = provider.values();
  if (goog.isDef(values['index']) && values['index'].value > -1) {
    var data = this.data();
    if (goog.isDef(data)) {
      var index = values['index'].value;
      var paretoMapping = /** @type {anychart.data.Mapping} */ (data.getRowMapping(index));
      if ((paretoMapping instanceof anychart.data.ParetoMapping) || (paretoMapping instanceof anychart.data.ParetoSeriesMapping)) {
        values['cf'] = {value: paretoMapping.getCumulativeFrequency(index), type: anychart.enums.TokenType.NUMBER};
        values['rf'] = {value: paretoMapping.getRelativeFrequency(index), type: anychart.enums.TokenType.NUMBER};
      }
    }
  }

  var tokenAliases = provider.tokenAliases();
  tokenAliases[anychart.enums.StringToken.CUMULATIVE_FREQUENCY] = 'cf';
  tokenAliases[anychart.enums.StringToken.RELATIVE_FREQUENCY] = 'rf';

  return /** @type {anychart.format.Context} */ (provider.propagate(values));
};


/** @inheritDoc */
anychart.core.series.Pareto.prototype.getColorResolutionContext = function(opt_baseColor, opt_ignorePointSettings, opt_ignoreColorScale) {
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
