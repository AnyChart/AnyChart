goog.provide('anychart.math.sma');
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
anychart.math.sma.Context;


/**
 * Creates context for SMA indicator calculation.
 * @param {number=} opt_period Defaults to 20.
 * @return {anychart.math.sma.Context}
 */
anychart.math.sma.initContext = function(opt_period) {
  var period = anychart.utils.normalizeToNaturalNumber(opt_period, 20, false);
  return {
    queue: anychart.math.cycledQueue(period),
    period: period,
    prevResult: NaN,
    /**
     * @this {anychart.math.sma.Context}
     */
    'dispose': function() {
      this.queue.clear();
    }
  };
};


/**
 * Start calculation function for SMA indicator calculation.
 * @param {anychart.math.sma.Context} context
 * @this {anychart.math.sma.Context}
 */
anychart.math.sma.startFunction = function(context) {
  context.queue.clear();
  context.prevResult = NaN;
};


/**
 * Calculates SMA.
 * @param {anychart.data.TableComputer.RowProxy} row
 * @param {anychart.math.sma.Context} context
 * @this {anychart.math.sma.Context}
 */
anychart.math.sma.calculationFunction = function(row, context) {
  var value = anychart.utils.toNumber(row.get('value'));
  var result;
  if (isNaN(value)) {
    result = NaN;
  } else {
    result = anychart.math.sma.calculate(value, context.period, context.queue, context.prevResult);
    context.prevResult = result;
  }
  row.set('result', result);
};


/**
 * Creates SMA computer for the given table mapping.
 * @param {anychart.data.TableMapping} mapping
 * @param {number=} opt_period
 * @return {anychart.data.TableComputer}
 */
anychart.math.sma.createComputer = function(mapping, opt_period) {
  var result = mapping.getTable().createComputer(mapping);
  result.setContext(anychart.math.sma.initContext(opt_period));
  result.setStartFunction(anychart.math.sma.startFunction);
  result.setCalculationFunction(anychart.math.sma.calculationFunction);
  result.addOutputField('result');
  return result;
};


/**
 * Calculates next SMA value based on a previous SMA value and current data value.
 * To use this function you need a setup queue with length equal to period.
 * On first calculation pass NaN or nothing as a opt_prevResult.
 * @param {number} value
 * @param {number} period
 * @param {anychart.math.CycledQueue} queue
 * @param {number} prevResult
 * @return {number}
 */
anychart.math.sma.calculate = function(value, period, queue, prevResult) {
  var firstValue = /** @type {number} */(queue.enqueue(value));
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
    result = prevResult + (lastValue - firstValue) / period;
  }
  return result;
};


//exports
goog.exportSymbol('anychart.math.sma.initContext', anychart.math.sma.initContext);
goog.exportSymbol('anychart.math.sma.startFunction', anychart.math.sma.startFunction);
goog.exportSymbol('anychart.math.sma.calculationFunction', anychart.math.sma.calculationFunction);
goog.exportSymbol('anychart.math.sma.createComputer', anychart.math.sma.createComputer);
