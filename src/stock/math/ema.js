goog.provide('anychart.stockModule.math.ema');
goog.require('anychart.stockModule.math.CycledQueue');
goog.require('anychart.utils');


/**
 * @typedef {{
 *    queue: !anychart.stockModule.math.CycledQueue,
 *    period: number,
 *    prevResult: number,
 *    dispose: Function
 * }}
 */
anychart.stockModule.math.ema.Context;


/**
 * Creates context for EMA indicator calculation.
 * @param {number=} opt_period Defaults to 20.
 * @return {anychart.stockModule.math.ema.Context}
 */
anychart.stockModule.math.ema.initContext = function(opt_period) {
  var period = anychart.utils.normalizeToNaturalNumber(opt_period, 20, false);
  return {
    queue: anychart.math.cycledQueue(period),
    period: period,
    prevResult: NaN,
    /**
     * @this {anychart.stockModule.math.ema.Context}
     */
    'dispose': function() {
      this.queue.clear();
    }
  };
};


/**
 * Start calculation function for EMA indicator calculation.
 * @param {anychart.stockModule.math.ema.Context} context
 * @this {anychart.stockModule.math.ema.Context}
 */
anychart.stockModule.math.ema.startFunction = function(context) {
  context.queue.clear();
  context.prevResult = NaN;
};


/**
 * Calculates EMA.
 * @param {anychart.stockModule.data.TableComputer.RowProxy} row
 * @param {anychart.stockModule.math.ema.Context} context
 * @this {anychart.stockModule.math.ema.Context}
 */
anychart.stockModule.math.ema.calculationFunction = function(row, context) {
  var value = anychart.utils.toNumber(row.get('value'));
  var result = anychart.stockModule.math.ema.calculate(context, value);
  row.set('result', result);
};


/**
 * Creates EMA computer for the given table mapping.
 * @param {anychart.stockModule.data.TableMapping} mapping
 * @param {number=} opt_period
 * @return {anychart.stockModule.data.TableComputer}
 */
anychart.stockModule.math.ema.createComputer = function(mapping, opt_period) {
  var result = mapping.getTable().createComputer(mapping);
  result.setContext(anychart.stockModule.math.ema.initContext(opt_period));
  result.setStartFunction(anychart.stockModule.math.ema.startFunction);
  result.setCalculationFunction(anychart.stockModule.math.ema.calculationFunction);
  result.addOutputField('result');
  return result;
};


/**
 * Calculates next EMA value based on a previous EMA value and current data value.
 * To use this function you need a setup queue with length equal to period.
 * On first calculation pass NaN or nothing as a opt_prevResult.
 * @param {anychart.stockModule.math.ema.Context} context
 * @param {number} value
 * @return {number}
 */
anychart.stockModule.math.ema.calculate = function(context, value) {
  if (isNaN(value))
    return NaN;
  context.queue.enqueue(value);
  /** @type {number} */
  var result;
  if (context.queue.getLength() < context.period) {
    return NaN;
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
  return result;
};


//exports
goog.exportSymbol('anychart.math.ema.initContext', anychart.stockModule.math.ema.initContext);
goog.exportSymbol('anychart.math.ema.startFunction', anychart.stockModule.math.ema.startFunction);
goog.exportSymbol('anychart.math.ema.calculate', anychart.stockModule.math.ema.calculate);
goog.exportSymbol('anychart.math.ema.calculationFunction', anychart.stockModule.math.ema.calculationFunction);
goog.exportSymbol('anychart.math.ema.createComputer', anychart.stockModule.math.ema.createComputer);
