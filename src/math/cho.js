goog.provide('anychart.math.cho');
goog.require('anychart.math.CycledQueue');
goog.require('anychart.math.adl');
goog.require('anychart.math.ema');
goog.require('anychart.math.sma');
goog.require('anychart.utils');


/**
 * @typedef {{
 *   adlContext: anychart.math.adl.Context,
 *   fastMAContext: (anychart.math.ema.Context|anychart.math.sma.Context),
 *   slowMAContext: (anychart.math.ema.Context|anychart.math.sma.Context),
 *   maCalculate: Function,
 *   maType: anychart.enums.MovingAverageType,
 *   dispose: Function
 * }}
 */
anychart.math.cho.Context;


/**
 * Creates context for CHO indicator calculation.
 * @param {number=} opt_fastPeriod [3] Indicator period. Defaults to 3.
 * @param {number=} opt_slowPeriod [10] Indicator period. Defaults to 10.
 * @param {string=} opt_maType [EMA] Indicator smoothing type. Defaults to EMA.
 * @return {anychart.math.cho.Context}
 */
anychart.math.cho.initContext = function(opt_fastPeriod, opt_slowPeriod, opt_maType) {
  var fastPeriod = anychart.utils.normalizeToNaturalNumber(opt_fastPeriod, 3, false);
  var slowPeriod = anychart.utils.normalizeToNaturalNumber(opt_slowPeriod, 10, false);
  if (fastPeriod > slowPeriod) {
    var tmp = fastPeriod;
    fastPeriod = slowPeriod;
    slowPeriod = tmp;
  }

  var maType = anychart.enums.normalizeMovingAverageType(opt_maType, anychart.enums.MovingAverageType.EMA);
  var adlContext = anychart.math.adl.initContext();

  var fastMAContext;
  var slowMAContext;
  var maCalculate;

  if (maType == anychart.enums.MovingAverageType.SMA) {
    fastMAContext = anychart.math.sma.initContext(fastPeriod);
    slowMAContext = anychart.math.sma.initContext(slowPeriod);
    maCalculate = anychart.math.sma.calculate;
  } else {
    fastMAContext = anychart.math.ema.initContext(fastPeriod);
    slowMAContext = anychart.math.ema.initContext(slowPeriod);
    maCalculate = anychart.math.ema.calculate;
  }

  return {
    adlContext: adlContext,
    fastMAContext: fastMAContext,
    slowMAContext: slowMAContext,
    maCalculate: maCalculate,
    maType: maType,
    /**
     * @this {anychart.math.cho.Context}
     */
    'dispose': function() {
      this.adlContext['dispose']();
      this.fastMAContext['dispose']();
      this.slowMAContext['dispose']();
    }
  };
};


/**
 * Start calculation function for  indicator calculation.
 * @param {anychart.math.cho.Context} context
 * @this {anychart.math.cho.Context}
 */
anychart.math.cho.startFunction = function(context) {
  anychart.math.adl.startFunction(context.adlContext);
  if (context.maType == anychart.enums.MovingAverageType.SMA) {
    anychart.math.sma.startFunction(/** @type {anychart.math.sma.Context} */ (context.fastMAContext));
    anychart.math.sma.startFunction(/** @type {anychart.math.sma.Context} */ (context.slowMAContext));
  } else {
    anychart.math.ema.startFunction(/** @type {anychart.math.ema.Context} */ (context.fastMAContext));
    anychart.math.ema.startFunction(/** @type {anychart.math.ema.Context} */ (context.slowMAContext));
  }
};


/**
 * Calculates CHO value.
 * @param {anychart.math.cho.Context} context
 * @param {number} close
 * @param {number} high
 * @param {number} low
 * @param {number} volume
 * @return {number}
 */
anychart.math.cho.calculate = function(context, close, high, low, volume) {
  if (isNaN(close) || isNaN(high) || isNaN(low) || isNaN(volume)) {
    return NaN;
  } else {
    var adl = /** @type {number} */ (anychart.math.adl.calculate(context.adlContext, close, high, low, volume));
    var fastMa = /** @type {number} */ (context.maCalculate(context.fastMAContext, adl));
    var slowMa = /** @type {number} */ (context.maCalculate(context.slowMAContext, adl));
    return (fastMa - slowMa);
  }
};


/**
 * Calculation function for CHO.
 * @param {anychart.data.TableComputer.RowProxy} row
 * @param {anychart.math.cho.Context} context
 * @this {anychart.math.cho.Context}
 */
anychart.math.cho.calculationFunction = function(row, context) {
  var close = anychart.utils.toNumber(row.get('close'));
  var high = anychart.utils.toNumber(row.get('high'));
  var low = anychart.utils.toNumber(row.get('low'));
  var volume = anychart.utils.toNumber(row.get('volume'));
  var rv = anychart.math.cho.calculate(context, close, high, low, volume);
  row.set('result', rv);
};


/**
 * Creates  computer for the given table mapping.
 * @param {anychart.data.TableMapping} mapping
 * @param {number=} opt_fastPeriod [3] Indicator period. Defaults to 3.
 * @param {number=} opt_slowPeriod [10] Indicator period. Defaults to 10.
 * @param {string=} opt_maType [EMA] Indicator smoothing type. Defaults to EMA.
 * @return {anychart.data.TableComputer}
 */
anychart.math.cho.createComputer = function(mapping, opt_fastPeriod, opt_slowPeriod, opt_maType) {
  var result = mapping.getTable().createComputer(mapping);
  result.setContext(anychart.math.cho.initContext(opt_fastPeriod, opt_slowPeriod, opt_maType));
  result.setStartFunction(anychart.math.cho.startFunction);
  result.setCalculationFunction(anychart.math.cho.calculationFunction);
  result.addOutputField('result');
  return result;
};


//exports
goog.exportSymbol('anychart.math.cho.initContext', anychart.math.cho.initContext);
goog.exportSymbol('anychart.math.cho.startFunction', anychart.math.cho.startFunction);
goog.exportSymbol('anychart.math.cho.calculate', anychart.math.cho.calculate);
goog.exportSymbol('anychart.math.cho.calculationFunction', anychart.math.cho.calculationFunction);
goog.exportSymbol('anychart.math.cho.createComputer', anychart.math.cho.createComputer);
