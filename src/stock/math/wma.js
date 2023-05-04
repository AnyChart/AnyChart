goog.provide('anychart.stockModule.math.wma');
goog.require('anychart.stockModule.math.CycledQueue');
goog.require('anychart.utils');


/**
 * @typedef {{
 *    queue: !anychart.stockModule.math.CycledQueue,
 *    period: number,
 *    dispose: Function
 * }}
 */
anychart.stockModule.math.wma.Context;


/**
 * Creates context for WMA indicator calculation.
 * @param {number=} opt_period Defaults to 9.
 * @return {anychart.stockModule.math.wma.Context}
 */
anychart.stockModule.math.wma.initContext = function(opt_period) {
  var period = anychart.utils.normalizeToNaturalNumber(opt_period, 9, false);
  return {
    queue: anychart.math.cycledQueue(period),
    period: period,
    /**
     * @this {anychart.stockModule.math.wma.Context}
     */
    'dispose': function() {
      this.queue.clear();
    }
  };
};


/**
 * Start calculation function for WMA indicator calculation.
 * @param {anychart.stockModule.math.wma.Context} context
 * @this {anychart.stockModule.math.wma.Context}
 */
anychart.stockModule.math.wma.startFunction = function(context) {
  context.queue.clear();
};


/**
 * Calculates next WMA value.
 * @param {anychart.stockModule.math.wma.Context} context
 * @param {number} value
 * @return {number}
 */
 anychart.stockModule.math.wma.calculate = function(context, value) {
  if (isNaN(value))
    return NaN;

  context.queue.enqueue(value);
  if (context.queue.getLength() < context.period) {
    return NaN;
  } else {
    var triangularMultiplier = 2 / (context.period * (context.period + 1));
    var sumOfWeightedValues = 0;
    for (var i = 0; i < context.period; i++) {
      sumOfWeightedValues += /** @type {number} */(context.queue.get(i)) * (i + 1);
    }
    return triangularMultiplier * sumOfWeightedValues;
  }
};


/**
 * Calculates WMA.
 * @param {anychart.stockModule.data.TableComputer.RowProxy} row
 * @param {anychart.stockModule.math.wma.Context} context
 * @this {anychart.stockModule.math.wma.Context}
 */
anychart.stockModule.math.wma.calculationFunction = function(row, context) {
  var value = row.get('value');
  value = goog.isDef(value) ? value : row.get('close');
  value = anychart.utils.toNumber(value);
  var result = anychart.stockModule.math.wma.calculate(context, value);
  row.set('result', result);
};


/**
 * Creates WMA computer for the given table mapping.
 * @param {anychart.stockModule.data.TableMapping} mapping
 * @param {number=} opt_period
 * @return {anychart.stockModule.data.TableComputer}
 */
anychart.stockModule.math.wma.createComputer = function(mapping, opt_period) {
  var result = mapping.getTable().createComputer(mapping);
  result.setContext(anychart.stockModule.math.wma.initContext(opt_period));
  result.setStartFunction(anychart.stockModule.math.wma.startFunction);
  result.setCalculationFunction(anychart.stockModule.math.wma.calculationFunction);
  result.addOutputField('result');
  return result;
};


//exports
goog.exportSymbol('anychart.math.wma.initContext', anychart.stockModule.math.wma.initContext);
goog.exportSymbol('anychart.math.wma.startFunction', anychart.stockModule.math.wma.startFunction);
goog.exportSymbol('anychart.math.wma.calculate', anychart.stockModule.math.wma.calculate);
goog.exportSymbol('anychart.math.wma.calculationFunction', anychart.stockModule.math.wma.calculationFunction);
goog.exportSymbol('anychart.math.wma.createComputer', anychart.stockModule.math.wma.createComputer);
