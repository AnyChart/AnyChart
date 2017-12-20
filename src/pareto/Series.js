goog.provide('anychart.paretoModule.Series');

goog.require('anychart.core.series.Cartesian');
goog.require('anychart.core.utils.IInteractiveSeries');
goog.require('anychart.format.Context');
goog.forwardDeclare('anychart.paretoModule.Mapping');
goog.forwardDeclare('anychart.paretoModule.SeriesMapping');



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
anychart.paretoModule.Series = function(chart, plot, type, config, sortedMode) {
  anychart.paretoModule.Series.base(this, 'constructor', chart, plot, type, config, sortedMode);
};
goog.inherits(anychart.paretoModule.Series, anychart.core.series.Cartesian);


/**
 * Token aliases list.
 * @type {Object.<string, string>}
 */
anychart.paretoModule.Series.prototype.TOKEN_ALIASES = (function() {
  var tokenAliases = {};
  tokenAliases[anychart.enums.StringToken.BUBBLE_SIZE] = 'size';
  tokenAliases[anychart.enums.StringToken.RANGE_START] = 'low';
  tokenAliases[anychart.enums.StringToken.RANGE_END] = 'high';
  tokenAliases[anychart.enums.StringToken.X_VALUE] = 'x';
  tokenAliases[anychart.enums.StringToken.CUMULATIVE_FREQUENCY] = 'cf';
  tokenAliases[anychart.enums.StringToken.RELATIVE_FREQUENCY] = 'rf';
  return tokenAliases;
})();


//region --- Overrides
/** @inheritDoc */
anychart.paretoModule.Series.prototype.getContextProviderValues = function(provider, rowInfo) {
  var values = anychart.paretoModule.Series.base(this, 'getContextProviderValues', provider, rowInfo);
  var data = this.data();
  var index;
  if (goog.isDef(data) &&
      goog.isDef(values['index']) &&
      (index = Number(values['index'].value)) > -1) {
    var paretoMapping = /** @type {anychart.data.Mapping} */ (data.getRowMapping(index));
    if ((anychart.utils.instanceOf(paretoMapping, anychart.paretoModule.Mapping)) || (anychart.utils.instanceOf(paretoMapping, anychart.paretoModule.SeriesMapping))) {
      values['cf'] = {value: anychart.math.round(paretoMapping.getCumulativeFrequency(index), 2), type: anychart.enums.TokenType.NUMBER};
      values['rf'] = {value: anychart.math.round(paretoMapping.getRelativeFrequency(index), 2), type: anychart.enums.TokenType.NUMBER};
    }
  }
  return values;
};


/** @inheritDoc */
anychart.paretoModule.Series.prototype.getColorResolutionContext = function(opt_baseColor, opt_ignorePointSettings, opt_ignoreColorScale) {
  var ctx = anychart.paretoModule.Series.base(this, 'getColorResolutionContext', opt_baseColor, opt_ignorePointSettings);
  this.applyCFRFTo(ctx, ctx['index']);
  return ctx;
};


/** @inheritDoc */
anychart.paretoModule.Series.prototype.getHatchFillResolutionContext = function(opt_ignorePointSettings) {
  var ctx = anychart.paretoModule.Series.base(this, 'getHatchFillResolutionContext', opt_ignorePointSettings);
  this.applyCFRFTo(ctx, ctx['index']);
  return ctx;
};


/** @inheritDoc */
anychart.paretoModule.Series.prototype.getPoint = function(index) {
  var point = anychart.paretoModule.Series.base(this, 'getPoint', index);
  this.applyCFRFTo(point, index);
  return point;
};


/**
 * Get cf and rf values.
 * @param {number} index
 * @return {?Object}
 */
anychart.paretoModule.Series.prototype.getCFRF = function(index) {
  var rv = null;
  var data = this.data();
  if (goog.isDef(data)) {
    var paretoMapping = /** @type {anychart.data.Mapping} */ (data.getRowMapping(index));
    if ((anychart.utils.instanceOf(paretoMapping, anychart.paretoModule.Mapping)) || (anychart.utils.instanceOf(paretoMapping, anychart.paretoModule.SeriesMapping))) {
      rv = {};
      rv['cf'] = anychart.math.round(paretoMapping.getCumulativeFrequency(index), 2);
      rv['rf'] = anychart.math.round(paretoMapping.getRelativeFrequency(index), 2);
    }
  }
  return rv;
};


/**
 * Add cf and rf values to target.
 * @param {Object} target
 * @param {number} index
 */
anychart.paretoModule.Series.prototype.applyCFRFTo = function(target, index) {
  var cfrf;
  if (goog.isDef(index) && index > -1)
    cfrf = this.getCFRF(index);
  if (cfrf) {
    target['cf'] = cfrf['cf'];
    target['rf'] = cfrf['rf'];
  }
};


//endregion
