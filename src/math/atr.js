goog.provide('anychart.math.atr');
goog.require('anychart.math.CycledQueue');
goog.require('anychart.math.sma');
goog.require('anychart.utils');


/**
 * @typedef {{
 *    queue: !anychart.math.CycledQueue,
 *    period: number,
 *    prevResult: number,
 *    prevClose: number,
 *    dequeuedValue: number,
 *    dispose: Function
 * }}
 */
anychart.math.atr.Context;


/**
 * Creates context for ATR indicator calculation.
 * @param {number=} opt_period [14] Indicator period. Defaults to 14.
 * @return {anychart.math.atr.Context}
 */
anychart.math.atr.initContext = function(opt_period) {
  var period = anychart.utils.normalizeToNaturalNumber(opt_period, 14, false);
  var context = anychart.math.sma.initContext(period);
  context.prevClose = NaN;
  return /** @type {anychart.math.atr.Context} */ (context);
};


/**
 * Start calculation function for ATR indicator calculation.
 * @param {anychart.math.atr.Context} context
 * @this {anychart.math.atr.Context}
 */
anychart.math.atr.startFunction = function(context) {
  anychart.math.sma.startFunction(context);
  context.prevClose = NaN;
};


/**
 * ATR calculation.
 * @param {anychart.math.atr.Context} context ATR context.
 * @param {number} close Current close value.
 * @param {number} high Current high value.
 * @param {number} low Current low value.
 * @return {number}
 */
anychart.math.atr.calculate = function(context, close, high, low) {
  if (isNaN(high) || isNaN(low) || isNaN(close))
    return NaN;

  // currTR will be NaN if prevClose is NaN
  var currTR = Math.max(high, context.prevClose) - Math.min(low, context.prevClose);
  var result = anychart.math.sma.calculate(context, currTR);
  context.prevClose = close;
  return result;
};


/**
 * Calculates ATR.
 * @param {anychart.data.TableComputer.RowProxy} row
 * @param {anychart.math.atr.Context} context
 * @this {anychart.math.atr.Context}
 */
anychart.math.atr.calculationFunction = function(row, context) {
  var close = anychart.utils.toNumber(row.get('close'));
  var high = anychart.utils.toNumber(row.get('high'));
  var low = anychart.utils.toNumber(row.get('low'));
  var result = anychart.math.atr.calculate(context, close, high, low);
  row.set('result', result);
};


/**
 * Creates ATR computer for the given table mapping.
 * @param {anychart.data.TableMapping} mapping
 * @param {number=} opt_period
 * @return {anychart.data.TableComputer}
 */
anychart.math.atr.createComputer = function(mapping, opt_period) {
  var result = mapping.getTable().createComputer(mapping);
  result.setContext(anychart.math.atr.initContext(opt_period));
  result.setStartFunction(anychart.math.atr.startFunction);
  result.setCalculationFunction(anychart.math.atr.calculationFunction);
  result.addOutputField('result');
  return result;
};


//exports
goog.exportSymbol('anychart.math.atr.initContext', anychart.math.atr.initContext);
goog.exportSymbol('anychart.math.atr.startFunction', anychart.math.atr.startFunction);
goog.exportSymbol('anychart.math.atr.calculate', anychart.math.atr.calculate);
goog.exportSymbol('anychart.math.atr.calculationFunction', anychart.math.atr.calculationFunction);
goog.exportSymbol('anychart.math.atr.createComputer', anychart.math.atr.createComputer);
