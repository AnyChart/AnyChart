goog.provide('anychart.stockModule.math.momentum');
goog.require('anychart.stockModule.math.CycledQueue');
goog.require('anychart.utils');


/**
 * @typedef {{
 *   queue: !anychart.stockModule.math.CycledQueue,
 *   period: number,
 *   prevResult: number,
 *   dispose: Function
 * }}
 */
anychart.stockModule.math.momentum.Context;


/**
 * Creates context for momentum indicator calculation.
 * @param {number=} opt_period [14] Indicator period. Defaults to 14.
 * @return {anychart.stockModule.math.momentum.Context}
 */
anychart.stockModule.math.momentum.initContext = function(opt_period) {
  var period = anychart.utils.normalizeToNaturalNumber(opt_period, 14, false);

  return /** @type {anychart.stockModule.math.momentum.Context} */ ({
    queue: anychart.math.cycledQueue(period + 1),
    period: period,
    /**
     * @this {anychart.stockModule.math.momentum.Context}
     */
    'dispose': function() {
      this.queue.clear();
    }
  });
};


/**
 * Start calculation function for momentum indicator calculation.
 * @param {anychart.stockModule.math.momentum.Context} context
 * @this {anychart.stockModule.math.momentum.Context}
 */
anychart.stockModule.math.momentum.startFunction = function(context) {
  context.queue.clear();
  context.prevResult = NaN;
};


/**
 * momentum calculation.
 * @param {anychart.stockModule.math.momentum.Context} context momentum Context.
 * @param {number} close Current close value.
 * @return {number}
 */
anychart.stockModule.math.momentum.calculate = function(context, close) {
  if (isNaN(close))
    return NaN;
  var queue = context.queue;
  queue.enqueue(close);
  var result;
  if (queue.getLength() < context.period + 1) {
    return NaN;
  } else {
    // init and process calculations are the same
    result = 100 * close / /** @type {number} */(queue.get(0));
  }
  context.prevResult = result;
  return result;
};


/**
 * Calculates momentum.
 * @param {anychart.stockModule.data.TableComputer.RowProxy} row
 * @param {anychart.stockModule.math.momentum.Context} context
 * @this {anychart.stockModule.math.momentum.Context}
 */
anychart.stockModule.math.momentum.calculationFunction = function(row, context) {
  var value = row.get('value');
  value = goog.isDef(value) ? value : row.get('close');
  value = anychart.utils.toNumber(value);
  var rv = anychart.stockModule.math.momentum.calculate(context, value);
  row.set('result', rv);
};


/**
 * Creates momentum computer for the given table mapping.
 * @param {anychart.stockModule.data.TableMapping} mapping
 * @param {number=} opt_period [14] Indicator period. Defaults to 14.
 * @return {anychart.stockModule.data.TableComputer}
 */
anychart.stockModule.math.momentum.createComputer = function(mapping, opt_period) {
  var result = mapping.getTable().createComputer(mapping);
  result.setContext(anychart.stockModule.math.momentum.initContext(opt_period));
  result.setStartFunction(anychart.stockModule.math.momentum.startFunction);
  result.setCalculationFunction(anychart.stockModule.math.momentum.calculationFunction);
  result.addOutputField('result');
  return result;
};


//exports
goog.exportSymbol('anychart.math.momentum.initContext', anychart.stockModule.math.momentum.initContext);
goog.exportSymbol('anychart.math.momentum.startFunction', anychart.stockModule.math.momentum.startFunction);
goog.exportSymbol('anychart.math.momentum.calculate', anychart.stockModule.math.momentum.calculate);
goog.exportSymbol('anychart.math.momentum.calculationFunction', anychart.stockModule.math.momentum.calculationFunction);
goog.exportSymbol('anychart.math.momentum.createComputer', anychart.stockModule.math.momentum.createComputer);
