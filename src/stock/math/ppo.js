goog.provide('anychart.stockModule.math.ppo');
goog.require('anychart.stockModule.math.ema');
goog.require('anychart.utils');


/**
 * @typedef {{
 *   shortPeriod: number,
 *   longPeriod: number,
 *   smoothingPeriod: number,
 *   shortEMAContext: anychart.stockModule.math.ema.Context,
 *   longEMAContext: anychart.stockModule.math.ema.Context,
 *   smoothingEMAContext: anychart.stockModule.math.ema.Context,
 *   dispose: Function
 * }}
 */
anychart.stockModule.math.ppo.Context;


/**
 * Creates context for PPO indicator calculation.
 * @param {number=} opt_shortPeriod [12] Indicator short period. Defaults to 12.
 * @param {number=} opt_longPeriod [26] Indicator long period. Defaults to 26.
 * @param {number=} opt_smoothingPeriod [9] Indicator smoothing period. Defaults to 9.
 * @return {anychart.stockModule.math.ppo.Context}
 */
anychart.stockModule.math.ppo.initContext = function(opt_shortPeriod, opt_longPeriod, opt_smoothingPeriod) {
  var shortPeriod = anychart.utils.normalizeToNaturalNumber(opt_shortPeriod, 12, false);
  var longPeriod = anychart.utils.normalizeToNaturalNumber(opt_longPeriod, 26, false);
  var smoothingPeriod = anychart.utils.normalizeToNaturalNumber(opt_smoothingPeriod, 9, false);

  var shortEMAContext = anychart.stockModule.math.ema.initContext(shortPeriod);

  var longEMAContext = anychart.stockModule.math.ema.initContext(longPeriod);

  var smoothingEMAContext = anychart.stockModule.math.ema.initContext(smoothingPeriod);

  return {
    shortPeriod: shortPeriod,
    longPeriod: longPeriod,
    smoothingPeriod: smoothingPeriod,
    shortEMAContext: shortEMAContext,
    longEMAContext: longEMAContext,
    smoothingEMAContext: smoothingEMAContext,
    /**
     * @this {anychart.stockModule.math.ppo.Context}
     */
    'dispose': function() {
      this.shortEMAContext['dispose']();
      this.longEMAContext['dispose']();
      this.smoothingEMAContext['dispose']();
    }
  };
};


/**
 * Start calculation function for PPO indicator calculation.
 * @param {anychart.stockModule.math.ppo.Context} context
 * @this {anychart.stockModule.math.ppo.Context}
 */
anychart.stockModule.math.ppo.startFunction = function(context) {
  anychart.stockModule.math.ema.startFunction(/** @type {anychart.stockModule.math.ema.Context} */ (context.shortEMAContext));
  anychart.stockModule.math.ema.startFunction(/** @type {anychart.stockModule.math.ema.Context} */ (context.longEMAContext));
  anychart.stockModule.math.ema.startFunction(/** @type {anychart.stockModule.math.ema.Context} */ (context.smoothingEMAContext));
};


/**
 * PPO calculation.
 * @param {anychart.stockModule.math.ppo.Context} context PPO Context.
 * @param {number} value Current value or close.
 * @return {Array.<number>}
 */
anychart.stockModule.math.ppo.calculate = function(context, value) {
  if (isNaN(value))
    return [NaN, NaN, NaN];

  var shortEMA = anychart.stockModule.math.ema.calculate(context.shortEMAContext, value);
  var longEMA = anychart.stockModule.math.ema.calculate(context.longEMAContext, value);
  var ppo = (shortEMA - longEMA) / longEMA * 100;
  var signal = anychart.stockModule.math.ema.calculate(context.smoothingEMAContext, ppo);
  var histogram = ppo - signal;
  return [ppo, signal, histogram];
};


/**
 * Calculates PPO.
 * @param {anychart.stockModule.data.TableComputer.RowProxy} row
 * @param {anychart.stockModule.math.ppo.Context} context
 * @this {anychart.stockModule.math.ppo.Context}
 */
anychart.stockModule.math.ppo.calculationFunction = function(row, context) {
  var value = row.get('value');
  value = goog.isDef(value) ? value : row.get('close');
  value = anychart.utils.toNumber(value);
  var result = anychart.stockModule.math.ppo.calculate(context, value);
  row.set('ppoResult', result[0]);
  row.set('signalResult', result[1]);
  row.set('histogramResult', result[2]);
};


/**
 * Creates PPO computer for the given table mapping.
 * @param {anychart.stockModule.data.TableMapping} mapping
 * @param {number=} opt_shortPeriod [12] Indicator short period. Defaults to 12.
 * @param {number=} opt_longPeriod [26] Indicator long period. Defaults to 26.
 * @param {number=} opt_smoothingPeriod [9] Indicator smoothing period. Defaults to 9.
 * @return {anychart.stockModule.data.TableComputer}
 */
anychart.stockModule.math.ppo.createComputer = function(mapping, opt_shortPeriod, opt_longPeriod, opt_smoothingPeriod) {
  var result = mapping.getTable().createComputer(mapping);
  result.setContext(anychart.stockModule.math.ppo.initContext(opt_shortPeriod, opt_longPeriod, opt_smoothingPeriod));
  result.setStartFunction(anychart.stockModule.math.ppo.startFunction);
  result.setCalculationFunction(anychart.stockModule.math.ppo.calculationFunction);
  result.addOutputField('ppoResult');
  result.addOutputField('signalResult');
  result.addOutputField('histogramResult');
  return result;
};


//exports
goog.exportSymbol('anychart.math.ppo.initContext', anychart.stockModule.math.ppo.initContext);
goog.exportSymbol('anychart.math.ppo.startFunction', anychart.stockModule.math.ppo.startFunction);
goog.exportSymbol('anychart.math.ppo.calculate', anychart.stockModule.math.ppo.calculate);
goog.exportSymbol('anychart.math.ppo.calculationFunction', anychart.stockModule.math.ppo.calculationFunction);
goog.exportSymbol('anychart.math.ppo.createComputer', anychart.stockModule.math.ppo.createComputer);
