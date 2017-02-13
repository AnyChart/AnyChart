goog.provide('anychart.math.bbands');
goog.require('anychart.math.CycledQueue');
goog.require('anychart.math.sma');
goog.require('anychart.utils');

/**
 * @namespace {anychart.math.bbands}
 */


/**
 * @typedef {{
 *    queue: !anychart.math.CycledQueue,
 *    period: number,
 *    deviation: number,
 *    prevResult: number,
 *    prevDeviation: number,
 *    dequeuedValue: number,
 *    dispose: Function
 * }}
 */
anychart.math.bbands.Context;


/**
 * Creates context for BBands indicator calculation.
 * @param {number=} opt_period Defaults to 20.
 * @param {number=} opt_deviation Defaults to 2.
 * @return {anychart.math.bbands.Context}
 */
anychart.math.bbands.initContext = function(opt_period, opt_deviation) {
  var period = anychart.utils.normalizeToNaturalNumber(opt_period, 20, false);
  var deviation = anychart.utils.normalizeToNaturalNumber(opt_deviation, 2, false);
  var context = anychart.math.sma.initContext(period);
  context.deviation = deviation;
  context.prevDeviation = NaN;
  return /** @type {anychart.math.bbands.Context} */ (context);
};


/**
 * Start calculation function for BBands indicator calculation.
 * @param {anychart.math.bbands.Context} context
 * @this {anychart.math.bbands.Context}
 */
anychart.math.bbands.startFunction = function(context) {
  anychart.math.sma.startFunction(context);
  context.prevDeviation = NaN;
};


/**
 * BBands calculation.
 * @param {anychart.math.bbands.Context} context BBands Width context.
 * @param {number} value Current value.
 * @return {Array.<number>}
 */
anychart.math.bbands.calculate = function(context, value) {
  var prevResult = context.prevResult;
  var sma = anychart.math.sma.calculate(context, value);
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
 * @param {anychart.data.TableComputer.RowProxy} row
 * @param {anychart.math.bbands.Context} context
 * @this {anychart.math.bbands.Context}
 */
anychart.math.bbands.calculationFunction = function(row, context) {
  var value = anychart.utils.toNumber(row.get('value'));
  var rv = anychart.math.bbands.calculate(context, value);
  var middle = rv[0];
  var upper = rv[1];
  var lower = rv[2];
  row.set('middleResult', middle);
  row.set('upperResult', upper);
  row.set('lowerResult', lower);
};


/**
 * Creates BBands computer for the given table mapping.
 * @param {anychart.data.TableMapping} mapping
 * @param {number=} opt_period
 * @param {number=} opt_deviation
 * @return {anychart.data.TableComputer}
 */
anychart.math.bbands.createComputer = function(mapping, opt_period, opt_deviation) {
  var result = mapping.getTable().createComputer(mapping);
  result.setContext(anychart.math.bbands.initContext(opt_period, opt_deviation));
  result.setStartFunction(anychart.math.bbands.startFunction);
  result.setCalculationFunction(anychart.math.bbands.calculationFunction);
  result.addOutputField('upperResult');
  result.addOutputField('lowerResult');
  result.addOutputField('middleResult');
  return result;
};


//exports
goog.exportSymbol('anychart.math.bbands.initContext', anychart.math.bbands.initContext);
goog.exportSymbol('anychart.math.bbands.startFunction', anychart.math.bbands.startFunction);
goog.exportSymbol('anychart.math.bbands.calculate', anychart.math.bbands.calculate);
goog.exportSymbol('anychart.math.bbands.calculationFunction', anychart.math.bbands.calculationFunction);
goog.exportSymbol('anychart.math.bbands.createComputer', anychart.math.bbands.createComputer);
