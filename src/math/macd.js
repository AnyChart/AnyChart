goog.provide('anychart.math.macd');
goog.require('anychart.math.CycledQueue');
goog.require('anychart.utils');


/**
 * @typedef {{
 *    fastQueue: !anychart.math.CycledQueue,
 *    slowQueue: !anychart.math.CycledQueue,
 *    signalQueue: !anychart.math.CycledQueue,
 *    fastPeriod: number,
 *    slowPeriod: number,
 *    signalPeriod: number,
 *    fastResult: number,
 *    slowResult: number,
 *    signalResult: number,
 *    dispose: Function
 * }}
 */
anychart.math.macd.Context;


/**
 * Creates context for MACD indicator calculation.
 * @param {number=} opt_fastPeriod Defaults to 12.
 * @param {number=} opt_slowPeriod Defaults to 26.
 * @param {number=} opt_signalPeriod Defaults to 9.
 * @return {anychart.math.macd.Context}
 */
anychart.math.macd.initContext = function(opt_fastPeriod, opt_slowPeriod, opt_signalPeriod) {
  var fastPeriod = anychart.utils.normalizeToNaturalNumber(opt_fastPeriod, 12, false);
  var slowPeriod = anychart.utils.normalizeToNaturalNumber(opt_slowPeriod, 26, false);
  if (fastPeriod > slowPeriod) {
    var tmp = fastPeriod;
    fastPeriod = slowPeriod;
    slowPeriod = tmp;
  }
  var signalPeriod = anychart.utils.normalizeToNaturalNumber(opt_signalPeriod, 9, false);
  return {
    fastQueue: anychart.math.cycledQueue(fastPeriod),
    slowQueue: anychart.math.cycledQueue(slowPeriod),
    signalQueue: anychart.math.cycledQueue(signalPeriod),
    fastPeriod: fastPeriod,
    slowPeriod: slowPeriod,
    signalPeriod: signalPeriod,
    fastResult: NaN,
    slowResult: NaN,
    signalResult: NaN,
    /**
     * @this {anychart.math.macd.Context}
     */
    'dispose': function() {
      this.fastQueue.clear();
      this.slowQueue.clear();
      this.signalQueue.clear();
    }
  };
};


/**
 * Start calculation function for MACD indicator calculation.
 * @param {anychart.math.macd.Context} context
 * @this {anychart.math.macd.Context}
 */
anychart.math.macd.startFunction = function(context) {
  context.fastQueue.clear();
  context.slowQueue.clear();
  context.signalQueue.clear();
  context.fastResult = NaN;
  context.slowResult = NaN;
  context.signalResult = NaN;
};


/**
 * Calculates MACD.
 * @param {anychart.data.TableComputer.RowProxy} row
 * @param {anychart.math.macd.Context} context
 * @this {anychart.math.macd.Context}
 */
anychart.math.macd.calculationFunction = function(row, context) {
  var currValue = anychart.utils.toNumber(row.get('value'));
  var missing = isNaN(currValue);
  if (!missing) {
    context.fastQueue.enqueue(currValue);
    context.slowQueue.enqueue(currValue);

    if (context.fastQueue.getLength() == context.fastPeriod) {
      context.fastResult = anychart.math.macd.calcEMA_(
          context.fastResult,
          context.fastQueue,
          context.fastPeriod);
    }
    if (context.slowQueue.getLength() == context.slowPeriod) {
      context.slowResult = anychart.math.macd.calcEMA_(
          context.slowResult,
          context.slowQueue,
          context.slowPeriod);
    }
    if (!isNaN(context.slowResult) && !isNaN(context.fastPeriod)) {
      context.signalQueue.enqueue(context.fastResult - context.slowResult);
    }
    if (context.signalQueue.getLength() == context.signalPeriod) {
      context.signalResult = anychart.math.macd.calcEMA_(
          context.signalResult,
          context.signalQueue,
          context.signalPeriod);
      row.set('macdResult', context.fastResult - context.slowResult);
      row.set('signalResult', context.signalResult);
      row.set('histogramResult', context.fastResult - context.slowResult - context.signalResult);
      return;
    }
  }
  row.set('macdResult', NaN);
  row.set('signalResult', NaN);
  row.set('histogramResult', NaN);
};


/**
 * Calculates EMA on given values.
 * @param {number} prevVal
 * @param {!anychart.math.CycledQueue} queue
 * @param {number} period
 * @return {number}
 * @private
 */
anychart.math.macd.calcEMA_ = function(prevVal, queue, period) {
  var result;
  if (isNaN(prevVal)) {
    result = 0;
    for (var i = 0; i < period; i++) {
      result += /** @type {number} */(queue.get(i));
    }
    result /= period;
  } else {
    var lastValue = /** @type {number} */(queue.get(-1));
    var alpha = 2 / (period + 1);
    result = prevVal + alpha * (lastValue - prevVal);
  }
  return result;
};


/**
 * Creates MACD computer for the given table mapping.
 * @param {anychart.data.TableMapping} mapping
 * @param {number=} opt_fastPeriod
 * @param {number=} opt_slowPeriod
 * @param {number=} opt_signalPeriod
 * @return {anychart.data.TableComputer}
 */
anychart.math.macd.createComputer = function(mapping, opt_fastPeriod, opt_slowPeriod, opt_signalPeriod) {
  var result = mapping.getTable().createComputer(mapping);
  result.setContext(anychart.math.macd.initContext(opt_fastPeriod, opt_slowPeriod, opt_signalPeriod));
  result.setStartFunction(anychart.math.macd.startFunction);
  result.setCalculationFunction(anychart.math.macd.calculationFunction);
  result.addOutputField('macdResult');
  result.addOutputField('signalResult');
  result.addOutputField('histogramResult');
  return result;
};


//exports
goog.exportSymbol('anychart.math.macd.initContext', anychart.math.macd.initContext);
goog.exportSymbol('anychart.math.macd.startFunction', anychart.math.macd.startFunction);
goog.exportSymbol('anychart.math.macd.calculationFunction', anychart.math.macd.calculationFunction);
goog.exportSymbol('anychart.math.macd.createComputer', anychart.math.macd.createComputer);
