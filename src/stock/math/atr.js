goog.provide('anychart.stockModule.math.atr');
goog.require('anychart.stockModule.math.CycledQueue');
goog.require('anychart.stockModule.math.sma');
goog.require('anychart.utils');


/**
 * @typedef {{
 *    queue: !anychart.stockModule.math.CycledQueue,
 *    period: number,
 *    prevResult: number,
 *    prevClose: number,
 *    dequeuedValue: number,
 *    dispose: Function
 * }}
 */
anychart.stockModule.math.atr.Context;


/**
 * Creates context for ATR indicator calculation.
 * @param {number=} opt_period [14] Indicator period. Defaults to 14.
 * @return {anychart.stockModule.math.atr.Context}
 */
anychart.stockModule.math.atr.initContext = function(opt_period) {
  var period = anychart.utils.normalizeToNaturalNumber(opt_period, 14, false);
  var context = anychart.stockModule.math.sma.initContext(period);
  context.prevClose = NaN;
  return /** @type {anychart.stockModule.math.atr.Context} */ (context);
};


/**
 * Start calculation function for ATR indicator calculation.
 * @param {anychart.stockModule.math.atr.Context} context
 * @this {anychart.stockModule.math.atr.Context}
 */
anychart.stockModule.math.atr.startFunction = function(context) {
  anychart.stockModule.math.sma.startFunction(context);
  context.prevClose = NaN;
};


/**
 * ATR calculation.
 * @param {anychart.stockModule.math.atr.Context} context ATR context.
 * @param {number} close Current close value.
 * @param {number} high Current high value.
 * @param {number} low Current low value.
 * @return {number}
 */
anychart.stockModule.math.atr.calculate = function(context, close, high, low) {
  if (isNaN(high) || isNaN(low) || isNaN(close))
    return NaN;

  // currTR will be NaN if prevClose is NaN
  var currTR = Math.max(high, context.prevClose) - Math.min(low, context.prevClose);
  var result = anychart.stockModule.math.sma.calculate(context, currTR);
  context.prevClose = close;
  return result;
};


/**
 * Calculates ATR.
 * @param {anychart.stockModule.data.TableComputer.RowProxy} row
 * @param {anychart.stockModule.math.atr.Context} context
 * @this {anychart.stockModule.math.atr.Context}
 */
anychart.stockModule.math.atr.calculationFunction = function(row, context) {
  var close = anychart.utils.toNumber(row.get('close'));
  var high = anychart.utils.toNumber(row.get('high'));
  var low = anychart.utils.toNumber(row.get('low'));
  var result = anychart.stockModule.math.atr.calculate(context, close, high, low);
  row.set('result', result);
};


/**
 * Creates ATR computer for the given table mapping.
 * @param {anychart.stockModule.data.TableMapping} mapping
 * @param {number=} opt_period
 * @return {anychart.stockModule.data.TableComputer}
 */
anychart.stockModule.math.atr.createComputer = function(mapping, opt_period) {
  var result = mapping.getTable().createComputer(mapping);
  result.setContext(anychart.stockModule.math.atr.initContext(opt_period));
  result.setStartFunction(anychart.stockModule.math.atr.startFunction);
  result.setCalculationFunction(anychart.stockModule.math.atr.calculationFunction);
  result.addOutputField('result');
  return result;
};


//exports
goog.exportSymbol('anychart.math.atr.initContext', anychart.stockModule.math.atr.initContext);
goog.exportSymbol('anychart.math.atr.startFunction', anychart.stockModule.math.atr.startFunction);
goog.exportSymbol('anychart.math.atr.calculate', anychart.stockModule.math.atr.calculate);
goog.exportSymbol('anychart.math.atr.calculationFunction', anychart.stockModule.math.atr.calculationFunction);
goog.exportSymbol('anychart.math.atr.createComputer', anychart.stockModule.math.atr.createComputer);
