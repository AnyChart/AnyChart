goog.provide('anychart.stockModule.math.kdj');
goog.require('anychart.stockModule.math.CycledQueue');
goog.require('anychart.stockModule.math.stochastic');
goog.require('anychart.utils');


/**
 * @typedef {{
 *   highQueue: !anychart.stockModule.math.CycledQueue,
 *   lowQueue: !anychart.stockModule.math.CycledQueue,
 *   kPeriod: number,
 *   kMAType: anychart.enums.MovingAverageType,
 *   kMAContext: (anychart.stockModule.math.sma.Context|anychart.stockModule.math.ema.Context|Object),
 *   kMACalculate: Function,
 *   dMAType: anychart.enums.MovingAverageType,
 *   dMAContext: (anychart.stockModule.math.sma.Context|anychart.stockModule.math.ema.Context|Object),
 *   dMACalculate: Function,
 *   kMultiplier: number,
 *   dMultiplier: number,
 *   dispose: Function
 * }}
 */
anychart.stockModule.math.kdj.Context;


/**
 * Creates context for *** indicator calculation.
 * @param {number=} opt_kPeriod [14] Indicator period. Defaults to 14.
 * @param {number=} opt_kMAPeriod [5] Indicator K smoothing period. Defaults to 5.
 * @param {number=} opt_dPeriod [5] Indicator D period. Defaults to 5.
 * @param {anychart.enums.MovingAverageType=} opt_kMAType [EMA] Indicator K smoothing type. Defaults to EMA.
 * @param {anychart.enums.MovingAverageType=} opt_dMAType [EMA] Indicator D smoothing type. Defaults to EMA.
 * @param {number=} opt_kMultiplier [-2] Indicator K multiplier. Defaults to -2.
 * @param {number=} opt_dMultiplier [3] Indicator D multiplier. Defaults to 3.
 * @return {anychart.stockModule.math.kdj.Context}
 */
anychart.stockModule.math.kdj.initContext = function(opt_kPeriod, opt_kMAPeriod, opt_dPeriod, opt_kMAType, opt_dMAType, opt_kMultiplier, opt_dMultiplier) {
  var kPeriod = anychart.utils.normalizeToNaturalNumber(opt_kPeriod, 14, false);
  var kMAType = anychart.enums.normalizeMovingAverageType(opt_kMAType, anychart.enums.MovingAverageType.EMA);
  var kMAPeriod = anychart.utils.normalizeToNaturalNumber(opt_kMAPeriod, 5, false);

  var dMAType = anychart.enums.normalizeMovingAverageType(opt_dMAType, anychart.enums.MovingAverageType.EMA);
  var dPeriod = anychart.utils.normalizeToNaturalNumber(opt_dPeriod, 5, false);

  var mult;
  mult = anychart.utils.toNumber(opt_kMultiplier);
  var kMultiplier = isNaN(mult) ? -2 : mult;
  mult = anychart.utils.toNumber(opt_dMultiplier);
  var dMultiplier = isNaN(mult) ? 3 : mult;

  var kdjContext = anychart.stockModule.math.stochastic.initContext(kPeriod, kMAPeriod, dPeriod, kMAType, dMAType);
  kdjContext.kMultiplier = kMultiplier;
  kdjContext.dMultiplier = dMultiplier;
  return /** @type {anychart.stockModule.math.kdj.Context} */ (kdjContext);
};


/**
 * Start calculation function for KDJ indicator calculation.
 * @param {anychart.stockModule.math.kdj.Context} context
 * @this {anychart.stockModule.math.kdj.Context}
 */
anychart.stockModule.math.kdj.startFunction = function(context) {
  anychart.stockModule.math.stochastic.startFunction(/** @type {anychart.stockModule.math.stochastic.Context} */ (context));
};


/**
 * KDJ calculation.
 * @param {anychart.stockModule.math.kdj.Context} context KDJ Context.
 * @param {number} close Current close value.
 * @param {number} high Current high value.
 * @param {number} low Current low value.
 * @return {Array.<number>}
 */
anychart.stockModule.math.kdj.calculate = function(context, close, high, low) {
  if (isNaN(close) || isNaN(high) || isNaN(low)) {
    return [NaN, NaN, NaN];
  } else {
    var KD = anychart.stockModule.math.stochastic.calculate(context, close, high, low);
    KD.push(context.kMultiplier * KD[0] + context.dMultiplier * KD[1]);
    return KD;
  }
};


/**
 * Calculates KDJ.
 * @param {anychart.stockModule.data.TableComputer.RowProxy} row
 * @param {anychart.stockModule.math.kdj.Context} context
 * @this {anychart.stockModule.math.kdj.Context}
 */
anychart.stockModule.math.kdj.calculationFunction = function(row, context) {
  var close = anychart.utils.toNumber(row.get('close'));
  var high = anychart.utils.toNumber(row.get('high'));
  var low = anychart.utils.toNumber(row.get('low'));
  var rv = anychart.stockModule.math.kdj.calculate(context, close, high, low);
  var kResult = rv[0];
  var dResult = rv[1];
  var jResult = rv[2];
  row.set('kResult', kResult);
  row.set('dResult', dResult);
  row.set('jResult', jResult);
};


/**
 * Creates KDJ computer for the given table mapping.
 * @param {anychart.stockModule.data.TableMapping} mapping
 * @param {number=} opt_kPeriod [14] Indicator period. Defaults to 14.
 * @param {number=} opt_kMAPeriod [5] Indicator K smoothing period. Defaults to 5.
 * @param {number=} opt_dPeriod [5] Indicator D period. Defaults to 5.
 * @param {anychart.enums.MovingAverageType=} opt_kMAType [EMA] Indicator K smoothing type. Defaults to EMA.
 * @param {anychart.enums.MovingAverageType=} opt_dMAType [EMA] Indicator D smoothing type. Defaults to EMA.
 * @param {number=} opt_kMultiplier [-2] Indicator K multiplier. Defaults to -2.
 * @param {number=} opt_dMultiplier [3] Indicator D multiplier. Defaults to 3.
 * @return {anychart.stockModule.data.TableComputer}
 */
anychart.stockModule.math.kdj.createComputer = function(mapping, opt_kPeriod, opt_kMAPeriod, opt_dPeriod, opt_kMAType, opt_dMAType, opt_kMultiplier, opt_dMultiplier) {
  var result = mapping.getTable().createComputer(mapping);
  result.setContext(anychart.stockModule.math.kdj.initContext(opt_kPeriod, opt_kMAPeriod, opt_dPeriod, opt_kMAType, opt_dMAType, opt_kMultiplier, opt_dMultiplier));
  result.setStartFunction(anychart.stockModule.math.kdj.startFunction);
  result.setCalculationFunction(anychart.stockModule.math.kdj.calculationFunction);
  result.addOutputField('kResult');
  result.addOutputField('dResult');
  result.addOutputField('jResult');
  return result;
};


//exports
goog.exportSymbol('anychart.math.kdj.initContext', anychart.stockModule.math.kdj.initContext);
goog.exportSymbol('anychart.math.kdj.startFunction', anychart.stockModule.math.kdj.startFunction);
goog.exportSymbol('anychart.math.kdj.calculate', anychart.stockModule.math.kdj.calculate);
goog.exportSymbol('anychart.math.kdj.calculationFunction', anychart.stockModule.math.kdj.calculationFunction);
goog.exportSymbol('anychart.math.kdj.createComputer', anychart.stockModule.math.kdj.createComputer);
