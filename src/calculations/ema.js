goog.provide('anychart.calculations.ema');
goog.require('anychart.calculations.CycledQueue');
goog.require('anychart.utils');

/**
 * @namespace {anychart.calculations}
 */


/**
 * @typedef {{
 *    queue: !anychart.calculations.CycledQueue,
 *    period: number,
 *    prevResult: number,
 *    dispose: Function
 * }}
 */
anychart.calculations.ema.Context;


/**
 * Creates context for EMA indicator calculation.
 * @param {number=} opt_period Defaults to 20.
 * @return {anychart.calculations.ema.Context}
 */
anychart.calculations.ema.initContext = function(opt_period) {
  var period = anychart.utils.normalizeToNaturalNumber(opt_period, 20, false);
  return {
    queue: anychart.calculations.cycledQueue(period),
    period: period,
    prevResult: NaN,
    /**
     * @this {anychart.calculations.ema.Context}
     */
    'dispose': function() {
      this.queue.clear();
    }
  };
};


/**
 * Start calculation function for EMA indicator calculation.
 * @param {anychart.calculations.ema.Context} context
 * @this {anychart.calculations.ema.Context}
 */
anychart.calculations.ema.startFunction = function(context) {
  context.queue.clear();
  context.prevResult = NaN;
};


/**
 * Calculates EMA.
 * @param {anychart.data.TableComputer.RowProxy} row
 * @param {anychart.calculations.ema.Context} context
 * @this {anychart.calculations.ema.Context}
 */
anychart.calculations.ema.calculationFunction = function(row, context) {
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
anychart.calculations.ema.createComputer = function(mapping, opt_period) {
  var result = mapping.getTable().createComputer(mapping);
  result.setContext(anychart.calculations.ema.initContext(opt_period));
  result.setStartFunction(anychart.calculations.ema.startFunction);
  result.setCalculationFunction(anychart.calculations.ema.calculationFunction);
  result.addOutputField('result');
  return result;
};


//exports
goog.exportSymbol('anychart.calculations.ema.initContext', anychart.calculations.ema.initContext);
goog.exportSymbol('anychart.calculations.ema.startFunction', anychart.calculations.ema.startFunction);
goog.exportSymbol('anychart.calculations.ema.calculationFunction', anychart.calculations.ema.calculationFunction);
goog.exportSymbol('anychart.calculations.ema.createComputer', anychart.calculations.ema.createComputer);
