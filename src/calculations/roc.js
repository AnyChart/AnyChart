goog.provide('anychart.calculations.roc');
goog.require('anychart.calculations.CycledQueue');
goog.require('anychart.utils');

/**
 * @namespace {anychart.calculations}
 */


/**
 * @typedef {{
 *    queue: !anychart.calculations.CycledQueue,
 *    period: number,
 *    dispose: Function
 * }}
 */
anychart.calculations.roc.Context;


/**
 * Creates context for RoC indicator calculation.
 * @param {number=} opt_period Defaults to 20.
 * @return {anychart.calculations.roc.Context}
 */
anychart.calculations.roc.initContext = function(opt_period) {
  var period = anychart.utils.normalizeToNaturalNumber(opt_period, 20, false);
  return {
    queue: anychart.calculations.cycledQueue(period + 1),
    period: period,
    /**
     * @this {anychart.calculations.roc.Context}
     */
    'dispose': function() {
      this.queue.clear();
    }
  };
};


/**
 * Start calculation function for RoC indicator calculation.
 * @param {anychart.calculations.roc.Context} context
 * @this {anychart.calculations.roc.Context}
 */
anychart.calculations.roc.startFunction = function(context) {
  context.queue.clear();
};


/**
 * Calculates RoC.
 * @param {anychart.data.TableComputer.RowProxy} row
 * @param {anychart.calculations.roc.Context} context
 * @this {anychart.calculations.roc.Context}
 */
anychart.calculations.roc.calculationFunction = function(row, context) {
  var currValue = anychart.utils.toNumber(row.get('value'));
  var missing = isNaN(currValue);
  if (!missing)
    context.queue.enqueue(currValue);
  /** @type {number} */
  var result;
  if (missing || context.queue.getLength() < context.period) {
    result = NaN;
  } else {
    var firstValue = /** @type {number} */(context.queue.get(0));
    var lastValue = /** @type {number} */(context.queue.get(-1));
    result = 100 * (lastValue - firstValue) / firstValue;
  }
  row.set('result', result);
};


/**
 * Creates RoC computer for the given table mapping.
 * @param {anychart.data.TableMapping} mapping
 * @param {number=} opt_period
 * @return {anychart.data.TableComputer}
 */
anychart.calculations.roc.createComputer = function(mapping, opt_period) {
  var result = mapping.getTable().createComputer(mapping);
  result.setContext(anychart.calculations.roc.initContext(opt_period));
  result.setStartFunction(anychart.calculations.roc.startFunction);
  result.setCalculationFunction(anychart.calculations.roc.calculationFunction);
  result.addOutputField('result');
  return result;
};


//exports
goog.exportSymbol('anychart.calculations.roc.initContext', anychart.calculations.roc.initContext);
goog.exportSymbol('anychart.calculations.roc.startFunction', anychart.calculations.roc.startFunction);
goog.exportSymbol('anychart.calculations.roc.calculationFunction', anychart.calculations.roc.calculationFunction);
goog.exportSymbol('anychart.calculations.roc.createComputer', anychart.calculations.roc.createComputer);
