goog.provide('anychart.stockModule.math.bbands');
goog.require('anychart.stockModule.math.CycledQueue');
goog.require('anychart.stockModule.math.sma');
goog.require('anychart.utils');

/**
 * @namespace {anychart.stockModule.math.bbands}
 */


/**
 * @typedef {{
 *    queue: !anychart.stockModule.math.CycledQueue,
 *    period: number,
 *    deviation: number,
 *    prevResult: number,
 *    prevDeviation: number,
 *    dequeuedValue: number,
 *    dispose: Function
 * }}
 */
anychart.stockModule.math.bbands.Context;


/**
 * Creates context for BBands indicator calculation.
 * @param {number=} opt_period Defaults to 20.
 * @param {number=} opt_deviation Defaults to 2.
 * @return {anychart.stockModule.math.bbands.Context}
 */
anychart.stockModule.math.bbands.initContext = function(opt_period, opt_deviation) {
  var period = anychart.utils.normalizeToNaturalNumber(opt_period, 20, false);
  var deviation = anychart.utils.normalizeToNaturalNumber(opt_deviation, 2, false);
  var context = anychart.stockModule.math.sma.initContext(period);
  context.deviation = deviation;
  context.prevDeviation = NaN;
  return /** @type {anychart.stockModule.math.bbands.Context} */ (context);
};


/**
 * Start calculation function for BBands indicator calculation.
 * @param {anychart.stockModule.math.bbands.Context} context
 * @this {anychart.stockModule.math.bbands.Context}
 */
anychart.stockModule.math.bbands.startFunction = function(context) {
  anychart.stockModule.math.sma.startFunction(context);
  context.prevDeviation = NaN;
};


/**
 * BBands calculation.
 * @param {anychart.stockModule.math.bbands.Context} context BBands Width context.
 * @param {number} value Current value.
 * @return {Array.<number>}
 */
anychart.stockModule.math.bbands.calculate = function(context, value) {
  var prevResult = context.prevResult;
  var sma = anychart.stockModule.math.sma.calculate(context, value);
  if (isNaN(sma))
    return [NaN, NaN, NaN];
  var i, dist, result;
  var queue = context.queue;
  var period = context.period;
  if (isNaN(prevResult)) {
    // init calculations
    result = 0;
    for (i = 0; i < period; i++) {
      dist = /** @type {number} */ (queue.get(i)) - sma;
      result += dist * dist;
    }
  } else {
    // process calculations
    var distPrev = context.dequeuedValue - prevResult;
    dist = /** @type {number} */ (queue.get(-1)) - sma;
    var diff = prevResult - sma;
    result =
        context.prevDeviation +
        period * diff * diff +
        diff * (sma + prevResult) -
        2 * context.dequeuedValue * diff +
        dist * dist -
        distPrev * distPrev;
  }
  if (result < 0) result = 0;
  context.prevDeviation = result;
  result = Math.sqrt(result / period) * context.deviation;
  return [
    sma, // middle
    sma + result, // upper
    sma - result  // lower
  ];
};


/**
 * Calculates BBands.
 * @param {anychart.stockModule.data.TableComputer.RowProxy} row
 * @param {anychart.stockModule.math.bbands.Context} context
 * @this {anychart.stockModule.math.bbands.Context}
 */
anychart.stockModule.math.bbands.calculationFunction = function(row, context) {
  var value = row.get('value');
  value = goog.isDef(value) ? value : row.get('close');
  value = anychart.utils.toNumber(value);
  var rv = anychart.stockModule.math.bbands.calculate(context, value);
  var middle = rv[0];
  var upper = rv[1];
  var lower = rv[2];
  row.set('middleResult', middle);
  row.set('upperResult', upper);
  row.set('lowerResult', lower);
};


/**
 * Creates BBands computer for the given table mapping.
 * @param {anychart.stockModule.data.TableMapping} mapping
 * @param {number=} opt_period
 * @param {number=} opt_deviation
 * @return {anychart.stockModule.data.TableComputer}
 */
anychart.stockModule.math.bbands.createComputer = function(mapping, opt_period, opt_deviation) {
  var result = mapping.getTable().createComputer(mapping);
  result.setContext(anychart.stockModule.math.bbands.initContext(opt_period, opt_deviation));
  result.setStartFunction(anychart.stockModule.math.bbands.startFunction);
  result.setCalculationFunction(anychart.stockModule.math.bbands.calculationFunction);
  result.addOutputField('upperResult');
  result.addOutputField('lowerResult');
  result.addOutputField('middleResult');
  return result;
};


//exports
goog.exportSymbol('anychart.math.bbands.initContext', anychart.stockModule.math.bbands.initContext);
goog.exportSymbol('anychart.math.bbands.startFunction', anychart.stockModule.math.bbands.startFunction);
goog.exportSymbol('anychart.math.bbands.calculate', anychart.stockModule.math.bbands.calculate);
goog.exportSymbol('anychart.math.bbands.calculationFunction', anychart.stockModule.math.bbands.calculationFunction);
goog.exportSymbol('anychart.math.bbands.createComputer', anychart.stockModule.math.bbands.createComputer);
