goog.provide('anychart.stockModule.math.williamsR');
goog.require('anychart.stockModule.math.CycledQueue');
goog.require('anychart.utils');


/**
 * @typedef {{
 *   closeQueue: !anychart.stockModule.math.CycledQueue,
 *   highQueue: !anychart.stockModule.math.CycledQueue,
 *   lowQueue: !anychart.stockModule.math.CycledQueue,
 *   period: number,
 *   prevResult: number,
 *   dispose: Function
 * }}
 */
anychart.stockModule.math.williamsR.Context;


/**
 * Creates context for williamsR indicator calculation.
 * @param {number=} opt_period [10] Indicator period. Defaults to 10.
 * @return {anychart.stockModule.math.williamsR.Context}
 */
anychart.stockModule.math.williamsR.initContext = function(opt_period) {
  var period = anychart.utils.normalizeToNaturalNumber(opt_period, 10, false);

  return /** @type {anychart.stockModule.math.williamsR.Context} */ ({
    closeQueue: anychart.math.cycledQueue(period),
    highQueue: anychart.math.cycledQueue(period),
    lowQueue: anychart.math.cycledQueue(period),
    period: period,
    /**
     * @this {anychart.stockModule.math.williamsR.Context}
     */
    'dispose': function() {
      this.closeQueue.clear();
      this.highQueue.clear();
      this.lowQueue.clear();
    }
  });
};


/**
 * Start calculation function for williamsR indicator calculation.
 * @param {anychart.stockModule.math.williamsR.Context} context
 * @this {anychart.stockModule.math.williamsR.Context}
 */
anychart.stockModule.math.williamsR.startFunction = function(context) {
  context.closeQueue.clear();
  context.highQueue.clear();
  context.lowQueue.clear();
  context.prevResult = NaN;
};


/**
 * williamsR calculation.
 * @param {anychart.stockModule.math.williamsR.Context} context williamsR Context.
 * @param {number} close Current close value.
 * @param {number} high Current high value.
 * @param {number} low Current low value.
 * @return {number}
 */
anychart.stockModule.math.williamsR.calculate = function(context, close, high, low) {
  if (isNaN(close) || isNaN(high) || isNaN(low))
    return NaN;
  context.closeQueue.enqueue(close);
  context.highQueue.enqueue(high);
  context.lowQueue.enqueue(low);
  var result;
  var max;
  var min;
  var i;
  if (context.closeQueue.getLength() < context.period) {
    return NaN;
  } else {
    // init and process calculations are the same
    min = Number.MAX_VALUE;
    max = -Number.MIN_VALUE;
    for (i = 0; i < context.period; i++) {
      var highValue = /** @type {number} */(context.highQueue.get(i));
      var lowValue = /** @type {number} */(context.lowQueue.get(i));
      if (max < highValue)
        max = highValue;
      if (min > lowValue)
        min = lowValue;
    }
    result = -100 * (max - /** @type {number} */(context.closeQueue.get(-1))) / (max - min);
  }
  context.prevResult = result;
  return result;
};


/**
 * Calculates williamsR.
 * @param {anychart.stockModule.data.TableComputer.RowProxy} row
 * @param {anychart.stockModule.math.williamsR.Context} context
 * @this {anychart.stockModule.math.williamsR.Context}
 */
anychart.stockModule.math.williamsR.calculationFunction = function(row, context) {
  var close = anychart.utils.toNumber(row.get('close'));
  var high = anychart.utils.toNumber(row.get('high'));
  var low = anychart.utils.toNumber(row.get('low'));
  var rv = anychart.stockModule.math.williamsR.calculate(context, close, high, low);
  row.set('result', rv);
};


/**
 * Creates williamsR computer for the given table mapping.
 * @param {anychart.stockModule.data.TableMapping} mapping
 * @param {number=} opt_period [14] Indicator period. Defaults to 14.
 * @return {anychart.stockModule.data.TableComputer}
 */
anychart.stockModule.math.williamsR.createComputer = function(mapping, opt_period) {
  var result = mapping.getTable().createComputer(mapping);
  result.setContext(anychart.stockModule.math.williamsR.initContext(opt_period));
  result.setStartFunction(anychart.stockModule.math.williamsR.startFunction);
  result.setCalculationFunction(anychart.stockModule.math.williamsR.calculationFunction);
  result.addOutputField('result');
  return result;
};


//exports
goog.exportSymbol('anychart.math.williamsR.initContext', anychart.stockModule.math.williamsR.initContext);
goog.exportSymbol('anychart.math.williamsR.startFunction', anychart.stockModule.math.williamsR.startFunction);
goog.exportSymbol('anychart.math.williamsR.calculate', anychart.stockModule.math.williamsR.calculate);
goog.exportSymbol('anychart.math.williamsR.calculationFunction', anychart.stockModule.math.williamsR.calculationFunction);
goog.exportSymbol('anychart.math.williamsR.createComputer', anychart.stockModule.math.williamsR.createComputer);
