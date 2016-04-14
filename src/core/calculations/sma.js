goog.provide('anychart.core.calculations.sma');
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
anychart.core.calculations.sma.Context;


/**
 * Creates context for SMA indicator calculation.
 * @param {number=} opt_period Defaults to 20.
 * @return {anychart.core.calculations.sma.Context}
 */
anychart.core.calculations.sma.initContext = function(opt_period) {
  var period = anychart.utils.normalizeToNaturalNumber(opt_period, 20, false);
  return {
    queue: anychart.core.calculations.cycledQueue(period),
    period: period,
    prevResult: NaN,
    /**
     * @this {anychart.core.calculations.sma.Context}
     */
    'dispose': function() {
      this.queue.clear();
    }
  };
};


/**
 * Start calculation function for SMA indicator calculation.
 * @param {anychart.core.calculations.sma.Context} context
 * @this {anychart.core.calculations.sma.Context}
 */
anychart.core.calculations.sma.startFunction = function(context) {
  context.queue.clear();
  context.prevResult = NaN;
};


/**
 * Calculates SMA.
 * @param {anychart.data.TableComputer.RowProxy} row
 * @param {anychart.core.calculations.sma.Context} context
 * @this {anychart.core.calculations.sma.Context}
 */
anychart.core.calculations.sma.calculationFunction = function(row, context) {
  var currValue = anychart.utils.toNumber(row.get('value'));
  var missing = isNaN(currValue);
  var firstValue;
  if (!missing)
    firstValue = /** @type {number|undefined} */(context.queue.enqueue(currValue));
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
  } else { // firstValue should not be undefined here
    var lastValue = /** @type {number} */(context.queue.get(-1));
    result = context.prevResult + (lastValue - firstValue) / context.period;
  }
  context.prevResult = result;
  row.set('result', result);
};


/**
 * Creates SMA computer for the given table mapping.
 * @param {anychart.data.TableMapping} mapping
 * @param {number=} opt_period
 * @return {anychart.data.TableComputer}
 */
anychart.core.calculations.sma.createComputer = function(mapping, opt_period) {
  var result = mapping.getTable().createComputer(mapping);
  result.setContext(anychart.core.calculations.sma.initContext(opt_period));
  result.setStartFunction(anychart.core.calculations.sma.startFunction);
  result.setCalculationFunction(anychart.core.calculations.sma.calculationFunction);
  result.addOutputField('result');
  return result;
};


//exports
goog.exportSymbol('anychart.core.calculations.sma.initContext', anychart.core.calculations.sma.initContext);
goog.exportSymbol('anychart.core.calculations.sma.startFunction', anychart.core.calculations.sma.startFunction);
goog.exportSymbol('anychart.core.calculations.sma.calculationFunction', anychart.core.calculations.sma.calculationFunction);
goog.exportSymbol('anychart.core.calculations.sma.createComputer', anychart.core.calculations.sma.createComputer);
