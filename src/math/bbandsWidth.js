goog.provide('anychart.math.bbandsWidth');
goog.require('anychart.math.CycledQueue');
goog.require('anychart.utils');

/**
 * @namespace {anychart.math.bbandsWidth}
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
anychart.math.bbandsWidth.Context;


/**
 * Creates context for BBandsWidth indicator calculation.
 * @param {number=} opt_period [20].
 * @param {number=} opt_deviation [2].
 * @return {anychart.math.bbandsWidth.Context}
 */
anychart.math.bbandsWidth.initContext = function(opt_period, opt_deviation) {
  var period = anychart.utils.normalizeToNaturalNumber(opt_period, 20, false);
  var deviation = anychart.utils.normalizeToNaturalNumber(opt_deviation, 2, false);
  return {
    queue: anychart.math.cycledQueue(period),
    period: period,
    deviation: deviation,
    prevResult: NaN,
    prevDeviation: NaN,
    /**
     * @this {anychart.math.bbandsWidth.Context}
     */
    'dispose': function() {
      this.queue.clear();
    }
  };
};


/**
 * Start calculation function for BBandsWidth indicator calculation.
 * @param {anychart.math.bbandsWidth.Context} context
 * @this {anychart.math.bbandsWidth.Context}
 */
anychart.math.bbandsWidth.startFunction = function(context) {
  context.queue.clear();
  context.prevResult = NaN;
  context.prevDeviation = NaN;
};


/**
 * Calculates BBandsWidth.
 * @param {anychart.data.TableComputer.RowProxy} row
 * @param {anychart.math.bbandsWidth.Context} context
 * @this {anychart.math.bbandsWidth.Context}
 */
anychart.math.bbandsWidth.calculationFunction = function(row, context) {
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
      result = context.prevDeviation * context.deviation * 2;
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
      result = prevDeviation * context.deviation * 2;
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
anychart.math.bbandsWidth.createComputer = function(mapping, opt_period, opt_deviation) {
  var result = mapping.getTable().createComputer(mapping);
  result.setContext(anychart.math.bbandsWidth.initContext(opt_period, opt_deviation));
  result.setStartFunction(anychart.math.bbandsWidth.startFunction);
  result.setCalculationFunction(anychart.math.bbandsWidth.calculationFunction);
  result.addOutputField('result');
  return result;
};


//exports
goog.exportSymbol('anychart.math.bbandsWidth.initContext', anychart.math.bbandsWidth.initContext);
goog.exportSymbol('anychart.math.bbandsWidth.startFunction', anychart.math.bbandsWidth.startFunction);
goog.exportSymbol('anychart.math.bbandsWidth.calculationFunction', anychart.math.bbandsWidth.calculationFunction);
goog.exportSymbol('anychart.math.bbandsWidth.createComputer', anychart.math.bbandsWidth.createComputer);
