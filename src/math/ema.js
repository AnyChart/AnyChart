goog.provide('anychart.math.ema');
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
anychart.math.ema.Context;


/**
 * Creates context for EMA indicator calculation.
 * @param {number=} opt_period Defaults to 20.
 * @return {anychart.math.ema.Context}
 */
anychart.math.ema.initContext = function(opt_period) {
  var period = anychart.utils.normalizeToNaturalNumber(opt_period, 20, false);
  return {
    queue: anychart.math.cycledQueue(period),
    period: period,
    prevResult: NaN,
    /**
     * @this {anychart.math.ema.Context}
     */
    'dispose': function() {
      this.queue.clear();
    }
  };
};


/**
 * Start calculation function for EMA indicator calculation.
 * @param {anychart.math.ema.Context} context
 * @this {anychart.math.ema.Context}
 */
anychart.math.ema.startFunction = function(context) {
  context.queue.clear();
  context.prevResult = NaN;
};


/**
 * Calculates EMA.
 * @param {anychart.data.TableComputer.RowProxy} row
 * @param {anychart.math.ema.Context} context
 * @this {anychart.math.ema.Context}
 */
anychart.math.ema.calculationFunction = function(row, context) {
  var currValue = anychart.utils.toNumber(row.get('value'));
  var missing = isNaN(currValue);
  if (!missing)
    context.queue.enqueue(currValue);
  /** @type {number} */
  var result;
  if (missing || context.queue.getLength() < context.period) {
    result = NaN;
  } else if (isNaN(context.prevResult)) {
    result = 0;
    for (var i = 0; i < context.period; i++) {
      result += /** @type {number} */(context.queue.get(i));
    }
    result /= context.period;
  } else {
    var lastValue = /** @type {number} */(context.queue.get(-1));
    var alpha = 2 / (context.period + 1);
    result = context.prevResult + alpha * (lastValue - context.prevResult);
  }
  context.prevResult = result;
  row.set('result', result);
};


/**
 * Creates EMA computer for the given table mapping.
 * @param {anychart.data.TableMapping} mapping
 * @param {number=} opt_period
 * @return {anychart.data.TableComputer}
 */
anychart.math.ema.createComputer = function(mapping, opt_period) {
  var result = mapping.getTable().createComputer(mapping);
  result.setContext(anychart.math.ema.initContext(opt_period));
  result.setStartFunction(anychart.math.ema.startFunction);
  result.setCalculationFunction(anychart.math.ema.calculationFunction);
  result.addOutputField('result');
  return result;
};


//exports
goog.exportSymbol('anychart.math.ema.initContext', anychart.math.ema.initContext);
goog.exportSymbol('anychart.math.ema.startFunction', anychart.math.ema.startFunction);
goog.exportSymbol('anychart.math.ema.calculationFunction', anychart.math.ema.calculationFunction);
goog.exportSymbol('anychart.math.ema.createComputer', anychart.math.ema.createComputer);
