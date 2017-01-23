goog.provide('anychart.math.bbandsB');
goog.require('anychart.math.CycledQueue');
goog.require('anychart.utils');

/**
 * @namespace {anychart.math.bbandsB}
 */


/**
 * @typedef {{
 *    queue: !anychart.math.CycledQueue,
 *    period: number,
 *    deviation: number,
 *    prevResult: number,
 *    prevDeviation: number,
 *    dispose: Function
 * }}
 */
anychart.math.bbandsB.Context;


/**
 * Creates context for BBandsB indicator calculation.
 * @param {number=} opt_period [20].
 * @param {number=} opt_deviation [2].
 * @return {anychart.math.bbandsB.Context}
 */
anychart.math.bbandsB.initContext = function(opt_period, opt_deviation) {
  var period = anychart.utils.normalizeToNaturalNumber(opt_period, 20, false);
  var deviation = anychart.utils.normalizeToNaturalNumber(opt_deviation, 2, false);
  return {
    queue: anychart.math.cycledQueue(period),
    period: period,
    deviation: deviation,
    prevResult: NaN,
    prevDeviation: NaN,
    /**
     * @this {anychart.math.bbandsB.Context}
     */
    'dispose': function() {
      this.queue.clear();
    }
  };
};


/**
 * Start calculation function for BBandsB indicator calculation.
 * @param {anychart.math.bbandsB.Context} context
 * @this {anychart.math.bbandsB.Context}
 */
anychart.math.bbandsB.startFunction = function(context) {
  context.queue.clear();
  context.prevResult = NaN;
  context.prevDeviation = NaN;
};


/**
 * Calculates BBandsB.
 * @param {anychart.data.TableComputer.RowProxy} row
 * @param {anychart.math.bbandsB.Context} context
 * @this {anychart.math.bbandsB.Context}
 */
anychart.math.bbandsB.calculationFunction = function(row, context) {
  var queue = context.queue;
  var period = context.period;
  var currValue = /** @type {number} */ (row.get('value'));
  currValue = anychart.utils.toNumber(currValue);
  var missing = isNaN(currValue);
  var dequeuedValue;
  if (!missing)
    // add value to queue
    dequeuedValue = /** @type {number} */ (queue.enqueue(currValue));

  var result = 0;
  var i;
  var h;
  var l;
  if (missing || queue.getLength() < period) {
    // queue doesn't filled
    result = NaN;
  } else {
    if (isNaN(context.prevResult)) {
      // init calculations
      for (i = 0; i < period; i++) {
        result += /** @type {number} */ (queue.get(i));
      }
      result /= period;
      context.prevResult = result;

      result = 0;
      for (i = 0; i < period; i++) {
        dist = /** @type {number} */ (queue.get(i)) - context.prevResult;
        result += dist * dist;
      }

      if (result < 0) result = 0;
      context.prevDeviation = Math.sqrt(result / period);
      result = context.prevDeviation * context.deviation;
      h = context.prevResult + result;
      l = context.prevResult - result;
      result = (/** @type {number} */ (queue.get(-1)) - l) / (h - l);
    } else {
      // process calculations
      result = (/** @type {number} */ (queue.get(-1)) - dequeuedValue) / period;
      var prevResult = context.prevResult;
      var prevDeviation = context.prevDeviation;
      context.prevResult = prevResult + result;
      result = prevDeviation * prevDeviation * period;
      var distPrev = dequeuedValue - prevResult;
      var dist = /** @type {number} */ (queue.get(-1)) - context.prevResult;
      var diff = prevResult - context.prevResult;
      result =
          result +
          period * diff * diff +
          diff * (context.prevResult + prevResult) -
          2 * dequeuedValue * diff +
          dist * dist - distPrev * distPrev;

      if (result < 0) result = 0;
      prevDeviation = Math.sqrt(result / period);
      context.prevDeviation = prevDeviation;
      result = prevDeviation * context.deviation;
      h = context.prevResult + result;
      l = context.prevResult - result;
      result = (/** @type {number} */ (queue.get(-1)) - l) / (h - l);
    }
  }

  row.set('result', result);
};


/**
 * Creates BBands computer for the given table mapping.
 * @param {anychart.data.TableMapping} mapping
 * @param {number=} opt_period
 * @param {number=} opt_deviation
 * @return {anychart.data.TableComputer}
 */
anychart.math.bbandsB.createComputer = function(mapping, opt_period, opt_deviation) {
  var result = mapping.getTable().createComputer(mapping);
  result.setContext(anychart.math.bbandsB.initContext(opt_period, opt_deviation));
  result.setStartFunction(anychart.math.bbandsB.startFunction);
  result.setCalculationFunction(anychart.math.bbandsB.calculationFunction);
  result.addOutputField('result');
  return result;
};


//exports
goog.exportSymbol('anychart.math.bbandsB.initContext', anychart.math.bbandsB.initContext);
goog.exportSymbol('anychart.math.bbandsB.startFunction', anychart.math.bbandsB.startFunction);
goog.exportSymbol('anychart.math.bbandsB.calculationFunction', anychart.math.bbandsB.calculationFunction);
goog.exportSymbol('anychart.math.bbandsB.createComputer', anychart.math.bbandsB.createComputer);
