goog.provide('anychart.math.bbands');
goog.require('anychart.math.CycledQueue');
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
  return {
    queue: anychart.math.cycledQueue(period),
    period: period,
    deviation: deviation,
    prevResult: NaN,
    prevDeviation: NaN,
    /**
     * @this {anychart.math.bbands.Context}
     */
    'dispose': function() {
      this.queue.clear();
    }
  };
};


/**
 * Start calculation function for BBands indicator calculation.
 * @param {anychart.math.bbands.Context} context
 * @this {anychart.math.bbands.Context}
 */
anychart.math.bbands.startFunction = function(context) {
  context.queue.clear();
  context.prevResult = NaN;
  context.prevDeviation = NaN;
};


/**
 * Calculates BBands.
 * @param {anychart.data.TableComputer.RowProxy} row
 * @param {anychart.math.bbands.Context} context
 * @this {anychart.math.bbands.Context}
 */
anychart.math.bbands.calculationFunction = function(row, context) {
  var queue = context.queue;
  var period = context.period;
  var currValue = /** @type {number} */ (row.get('value'));
  currValue = anychart.utils.toNumber(currValue);
  var missing = isNaN(currValue);
  var dequeuedValue;
  if (!missing)
    // add value to queue
    dequeuedValue = /** @type {number} */ (queue.enqueue(currValue));

  var upperResult;
  var lowerResult;
  var result = 0;
  var i;
  if (missing || queue.getLength() < period) {
    // queue doesn't filled
    upperResult = NaN;
    lowerResult = NaN;
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
      upperResult = context.prevResult + result;
      lowerResult = context.prevResult - result;

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
      upperResult = context.prevResult + result;
      lowerResult = context.prevResult - result;
    }
  }

  row.set('upResult', upperResult);
  row.set('downResult', lowerResult);
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
  result.addOutputField('upResult');
  result.addOutputField('downResult');
  return result;
};


//exports
goog.exportSymbol('anychart.math.bbands.initContext', anychart.math.bbands.initContext);
goog.exportSymbol('anychart.math.bbands.startFunction', anychart.math.bbands.startFunction);
goog.exportSymbol('anychart.math.bbands.calculationFunction', anychart.math.bbands.calculationFunction);
goog.exportSymbol('anychart.math.bbands.createComputer', anychart.math.bbands.createComputer);
