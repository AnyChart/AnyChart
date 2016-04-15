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
anychart.math.sma.createComputer = function(mapping, opt_period) {
  var result = mapping.getTable().createComputer(mapping);
  result.setContext(anychart.math.sma.initContext(opt_period));
  result.setStartFunction(anychart.math.sma.startFunction);
  result.setCalculationFunction(anychart.math.sma.calculationFunction);
  result.addOutputField('result');
  return result;
};


//exports
goog.exportSymbol('anychart.math.sma.initContext', anychart.math.sma.initContext);
goog.exportSymbol('anychart.math.sma.startFunction', anychart.math.sma.startFunction);
goog.exportSymbol('anychart.math.sma.calculationFunction', anychart.math.sma.calculationFunction);
goog.exportSymbol('anychart.math.sma.createComputer', anychart.math.sma.createComputer);
