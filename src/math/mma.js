goog.provide('anychart.math.mma');
goog.require('anychart.math.CycledQueue');
goog.require('anychart.utils');


/**
 * @typedef {{
 *    queue: !anychart.math.CycledQueue,
 *    period: number,
 *    prevResult: number,
 *    dispose: Function
 * }}
 */
anychart.math.mma.Context;


/**
 * Creates context for MMA indicator calculation.
 * @param {number=} opt_period Defaults to 20.
 * @return {anychart.math.mma.Context}
 */
anychart.math.mma.initContext = function(opt_period) {
  var period = anychart.utils.normalizeToNaturalNumber(opt_period, 20, false);
  return {
    queue: anychart.math.cycledQueue(period),
    period: period,
    prevResult: NaN,
    /**
     * @this {anychart.math.mma.Context}
     */
    'dispose': function() {
      this.queue.clear();
    }
  };
};


/**
 * Start calculation function for MMA indicator calculation.
 * @param {anychart.math.mma.Context} context
 * @this {anychart.math.mma.Context}
 */
anychart.math.mma.startFunction = function(context) {
  context.queue.clear();
  context.prevResult = NaN;
};


/**
 * Calculates MMA.
 * @param {anychart.data.TableComputer.RowProxy} row
 * @param {anychart.math.mma.Context} context
 * @this {anychart.math.mma.Context}
 */
anychart.math.mma.calculationFunction = function(row, context) {
  var value = anychart.utils.toNumber(row.get('value'));
  var result;
  if (isNaN(value)) {
    result = NaN;
  } else {
    result = anychart.math.mma.calculate(value, context.period, context.queue, context.prevResult);
    context.prevResult = result;
  }
  row.set('result', result);
};


/**
 * Creates MMA computer for the given table mapping.
 * @param {anychart.data.TableMapping} mapping
 * @param {number=} opt_period
 * @return {anychart.data.TableComputer}
 */
anychart.math.mma.createComputer = function(mapping, opt_period) {
  var result = mapping.getTable().createComputer(mapping);
  result.setContext(anychart.math.mma.initContext(opt_period));
  result.setStartFunction(anychart.math.mma.startFunction);
  result.setCalculationFunction(anychart.math.mma.calculationFunction);
  result.addOutputField('result');
  return result;
};


/**
 * Calculates next MMA value based on a previous MMA value and current data value.
 * To use this function you need a setup queue with length equal to period.
 * On first calculation pass NaN or nothing as a opt_prevResult.
 * @param {number} value
 * @param {number} period
 * @param {anychart.math.CycledQueue} queue
 * @param {number} prevResult
 * @return {number}
 */
anychart.math.mma.calculate = function(value, period, queue, prevResult) {
  queue.enqueue(value);
  /** @type {number} */
  var result;
  if (queue.getLength() < period) {
    result = NaN;
  } else if (isNaN(prevResult)) {
    result = 0;
    for (var i = 0; i < period; i++) {
      result += /** @type {number} */(queue.get(i));
    }
    result /= period;
  } else { // firstValue should not be undefined here
    var lastValue = /** @type {number} */(queue.get(-1));
    result = prevResult + (lastValue - prevResult) / period;
  }
  return result;
};


//exports
goog.exportSymbol('anychart.math.mma.initContext', anychart.math.mma.initContext);
goog.exportSymbol('anychart.math.mma.startFunction', anychart.math.mma.startFunction);
goog.exportSymbol('anychart.math.mma.calculationFunction', anychart.math.mma.calculationFunction);
goog.exportSymbol('anychart.math.mma.createComputer', anychart.math.mma.createComputer);
