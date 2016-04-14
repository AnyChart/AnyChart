goog.provide('anychart.core.calculations.ema');
goog.require('anychart.core.calculations.CycledQueue');
goog.require('anychart.utils');

/**
 * @namespace {anychart.core.calculations}
 */


/**
 * @typedef {{
 *    queue: !anychart.core.calculations.CycledQueue,
 *    period: number,
 *    prevResult: number,
 *    dispose: Function
 * }}
 */
anychart.core.calculations.ema.Context;


/**
 * Creates context for EMA indicator calculation.
 * @param {number=} opt_period Defaults to 20.
 * @return {anychart.core.calculations.ema.Context}
 */
anychart.core.calculations.ema.initContext = function(opt_period) {
  var period = anychart.utils.normalizeToNaturalNumber(opt_period, 20, false);
  return {
    queue: anychart.core.calculations.cycledQueue(period),
    period: period,
    prevResult: NaN,
    /**
     * @this {anychart.core.calculations.ema.Context}
     */
    'dispose': function() {
      this.queue.clear();
    }
  };
};


/**
 * Start calculation function for EMA indicator calculation.
 * @param {anychart.core.calculations.ema.Context} context
 * @this {anychart.core.calculations.ema.Context}
 */
anychart.core.calculations.ema.startFunction = function(context) {
  context.queue.clear();
  context.prevResult = NaN;
};


/**
 * Calculates EMA.
 * @param {anychart.data.TableComputer.RowProxy} row
 * @param {anychart.core.calculations.ema.Context} context
 * @this {anychart.core.calculations.ema.Context}
 */
anychart.core.calculations.ema.calculationFunction = function(row, context) {
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
anychart.core.calculations.ema.createComputer = function(mapping, opt_period) {
  var result = mapping.getTable().createComputer(mapping);
  result.setContext(anychart.core.calculations.ema.initContext(opt_period));
  result.setStartFunction(anychart.core.calculations.ema.startFunction);
  result.setCalculationFunction(anychart.core.calculations.ema.calculationFunction);
  result.addOutputField('result');
  return result;
};


//exports
goog.exportSymbol('anychart.core.calculations.ema.initContext', anychart.core.calculations.ema.initContext);
goog.exportSymbol('anychart.core.calculations.ema.startFunction', anychart.core.calculations.ema.startFunction);
goog.exportSymbol('anychart.core.calculations.ema.calculationFunction', anychart.core.calculations.ema.calculationFunction);
goog.exportSymbol('anychart.core.calculations.ema.createComputer', anychart.core.calculations.ema.createComputer);
