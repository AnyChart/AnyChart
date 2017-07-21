goog.provide('anychart.stockModule.math.cci');
goog.require('anychart.stockModule.math.CycledQueue');
goog.require('anychart.stockModule.math.sma');
goog.require('anychart.utils');


/**
 * @typedef {{
 *    queue: !anychart.stockModule.math.CycledQueue,
 *    period: number,
 *    prevResult: number,
 *    dequeuedValue: number,
 *    dispose: Function
 * }}
 */
anychart.stockModule.math.cci.Context;


/**
 * Creates context for CCI indicator calculation.
 * @param {number=} opt_period [20] Indicator period. Defaults to 20.
 * @return {anychart.stockModule.math.cci.Context}
 */
anychart.stockModule.math.cci.initContext = function(opt_period) {
  var period = anychart.utils.normalizeToNaturalNumber(opt_period, 20, false);
  var context = anychart.stockModule.math.sma.initContext(period);
  return /** @type {anychart.stockModule.math.cci.Context} */ (context);
};


/**
 * Start calculation function for CCI indicator calculation.
 * @param {anychart.stockModule.math.cci.Context} context
 * @this {anychart.stockModule.math.cci.Context}
 */
anychart.stockModule.math.cci.startFunction = function(context) {
  anychart.stockModule.math.sma.startFunction(context);
};


/**
 * Calculates normalized mean deviation.
 * @param {anychart.stockModule.math.cci.Context} context
 * @return {number} deviation.
 */
anychart.stockModule.math.cci.calculateMeanDeviation = function(context) {
  var result = 0;
  for (var i = 0; i < context.period; i++) {
    result += Math.abs(/** @type {number} */ (context.queue.get(i)) - context.prevResult);
  }
  return result / context.period;
};


/**
 * Calculates CCI value.
 * @param {anychart.stockModule.math.cci.Context} context
 * @param {number} close
 * @param {number} high
 * @param {number} low
 * @return {number}
 */
anychart.stockModule.math.cci.calculate = function(context, close, high, low) {
  if (isNaN(high) || isNaN(low) || isNaN(close)) {
    return NaN;
  }
  var tp = (high + low + close) / 3;
  var sma = anychart.stockModule.math.sma.calculate(/** @type {anychart.stockModule.math.sma.Context} */ (context), tp);
  return (tp - sma) / (0.015 * anychart.stockModule.math.cci.calculateMeanDeviation(context));
};


/**
 * Calculation function for CCI.
 * @param {anychart.stockModule.data.TableComputer.RowProxy} row
 * @param {anychart.stockModule.math.cci.Context} context
 * @this {anychart.stockModule.math.cci.Context}
 */
anychart.stockModule.math.cci.calculationFunction = function(row, context) {
  var close = anychart.utils.toNumber(row.get('close'));
  var high = anychart.utils.toNumber(row.get('high'));
  var low = anychart.utils.toNumber(row.get('low'));
  var rv = anychart.stockModule.math.cci.calculate(context, close, high, low);
  row.set('result', rv);
};


/**
 * Creates CCI computer for the given table mapping.
 * @param {anychart.stockModule.data.TableMapping} mapping
 * @param {number=} opt_period
 * @return {anychart.stockModule.data.TableComputer}
 */
anychart.stockModule.math.cci.createComputer = function(mapping, opt_period) {
  var result = mapping.getTable().createComputer(mapping);
  result.setContext(anychart.stockModule.math.cci.initContext(opt_period));
  result.setStartFunction(anychart.stockModule.math.cci.startFunction);
  result.setCalculationFunction(anychart.stockModule.math.cci.calculationFunction);
  result.addOutputField('result');
  return result;
};


//exports
goog.exportSymbol('anychart.math.cci.initContext', anychart.stockModule.math.cci.initContext);
goog.exportSymbol('anychart.math.cci.startFunction', anychart.stockModule.math.cci.startFunction);
goog.exportSymbol('anychart.math.cci.calculate', anychart.stockModule.math.cci.calculate);
goog.exportSymbol('anychart.math.cci.calculationFunction', anychart.stockModule.math.cci.calculationFunction);
goog.exportSymbol('anychart.math.cci.createComputer', anychart.stockModule.math.cci.createComputer);
