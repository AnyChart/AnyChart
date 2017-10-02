goog.provide('anychart.stockModule.math.roc');
goog.require('anychart.stockModule.math.CycledQueue');
goog.require('anychart.utils');


/**
 * @typedef {{
 *    queue: !anychart.stockModule.math.CycledQueue,
 *    period: number,
 *    dispose: Function
 * }}
 */
anychart.stockModule.math.roc.Context;


/**
 * Creates context for RoC indicator calculation.
 * @param {number=} opt_period Defaults to 20.
 * @return {anychart.stockModule.math.roc.Context}
 */
anychart.stockModule.math.roc.initContext = function(opt_period) {
  var period = anychart.utils.normalizeToNaturalNumber(opt_period, 20, false);
  return {
    queue: anychart.math.cycledQueue(period + 1),
    period: period,
    /**
     * @this {anychart.stockModule.math.roc.Context}
     */
    'dispose': function() {
      this.queue.clear();
    }
  };
};


/**
 * Start calculation function for RoC indicator calculation.
 * @param {anychart.stockModule.math.roc.Context} context
 * @this {anychart.stockModule.math.roc.Context}
 */
anychart.stockModule.math.roc.startFunction = function(context) {
  context.queue.clear();
};


/**
 * Calculates RoC.
 * @param {anychart.stockModule.data.TableComputer.RowProxy} row
 * @param {anychart.stockModule.math.roc.Context} context
 * @this {anychart.stockModule.math.roc.Context}
 */
anychart.stockModule.math.roc.calculationFunction = function(row, context) {
  var currValue = anychart.utils.toNumber(row.get('value'));
  var missing = isNaN(currValue);
  if (!missing)
    context.queue.enqueue(currValue);
  /** @type {number} */
  var result;
  if (missing || context.queue.getLength() <= context.period) {
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
 * @param {anychart.stockModule.data.TableMapping} mapping
 * @param {number=} opt_period
 * @return {anychart.stockModule.data.TableComputer}
 */
anychart.stockModule.math.roc.createComputer = function(mapping, opt_period) {
  var result = mapping.getTable().createComputer(mapping);
  result.setContext(anychart.stockModule.math.roc.initContext(opt_period));
  result.setStartFunction(anychart.stockModule.math.roc.startFunction);
  result.setCalculationFunction(anychart.stockModule.math.roc.calculationFunction);
  result.addOutputField('result');
  return result;
};


//exports
goog.exportSymbol('anychart.math.roc.initContext', anychart.stockModule.math.roc.initContext);
goog.exportSymbol('anychart.math.roc.startFunction', anychart.stockModule.math.roc.startFunction);
goog.exportSymbol('anychart.math.roc.calculationFunction', anychart.stockModule.math.roc.calculationFunction);
goog.exportSymbol('anychart.math.roc.createComputer', anychart.stockModule.math.roc.createComputer);
