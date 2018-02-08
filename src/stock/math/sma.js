goog.provide('anychart.stockModule.math.sma');
goog.require('anychart.stockModule.math.CycledQueue');
goog.require('anychart.utils');


/**
 * @typedef {{
 *    queue: !anychart.stockModule.math.CycledQueue,
 *    period: number,
 *    prevResult: number,
 *    dequeuedValue: number,
 *    dispose: Function
 * }}
 */
anychart.stockModule.math.sma.Context;


/**
 * Creates context for SMA indicator calculation.
 * @param {number=} opt_period Defaults to 20.
 * @return {anychart.stockModule.math.sma.Context}
 */
anychart.stockModule.math.sma.initContext = function(opt_period) {
  var period = anychart.utils.normalizeToNaturalNumber(opt_period, 20, false);
  return {
    queue: anychart.math.cycledQueue(period),
    period: period,
    prevResult: NaN,
    dequeuedValue: NaN,
    /**
     * @this {anychart.stockModule.math.sma.Context}
     */
    'dispose': function() {
      this.queue.clear();
    }
  };
};


/**
 * Start calculation function for SMA indicator calculation.
 * @param {anychart.stockModule.math.sma.Context} context
 * @this {anychart.stockModule.math.sma.Context}
 */
anychart.stockModule.math.sma.startFunction = function(context) {
  context.queue.clear();
  context.prevResult = NaN;
  context.dequeuedValue = NaN;
};


/**
 * Calculates SMA.
 * @param {anychart.stockModule.data.TableComputer.RowProxy} row
 * @param {anychart.stockModule.math.sma.Context} context
 * @this {anychart.stockModule.math.sma.Context}
 */
anychart.stockModule.math.sma.calculationFunction = function(row, context) {
  var value = row.get('value');
  value = goog.isDef(value) ? value : row.get('close');
  value = anychart.utils.toNumber(value);
  var result = anychart.stockModule.math.sma.calculate(context, value);
  row.set('result', result);
};


/**
 * Creates SMA computer for the given table mapping.
 * @param {anychart.stockModule.data.TableMapping} mapping
 * @param {number=} opt_period
 * @return {anychart.stockModule.data.TableComputer}
 */
anychart.stockModule.math.sma.createComputer = function(mapping, opt_period) {
  var result = mapping.getTable().createComputer(mapping);
  result.setContext(anychart.stockModule.math.sma.initContext(opt_period));
  result.setStartFunction(anychart.stockModule.math.sma.startFunction);
  result.setCalculationFunction(anychart.stockModule.math.sma.calculationFunction);
  result.addOutputField('result');
  return result;
};


/**
 * Calculates next SMA value based on a previous SMA value and current data value.
 * To use this function you need a setup queue with length equal to period.
 * On first calculation pass NaN or nothing as a opt_prevResult.
 * @param {anychart.stockModule.math.sma.Context} context
 * @param {number} value
 * @return {number}
 */
anychart.stockModule.math.sma.calculate = function(context, value) {
  if (isNaN(value)) {
    context.dequeuedValue = NaN;
    return NaN;
  }
  var firstValue = /** @type {number} */(context.queue.enqueue(value));
  context.dequeuedValue = firstValue;
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
  } else { // firstValue should not be undefined here
    var lastValue = /** @type {number} */(context.queue.get(-1));
    result = context.prevResult + (lastValue - firstValue) / context.period;
  }
  context.prevResult = result;
  return result;
};


//exports
goog.exportSymbol('anychart.math.sma.initContext', anychart.stockModule.math.sma.initContext);
goog.exportSymbol('anychart.math.sma.startFunction', anychart.stockModule.math.sma.startFunction);
goog.exportSymbol('anychart.math.sma.calculate', anychart.stockModule.math.sma.calculate);
goog.exportSymbol('anychart.math.sma.calculationFunction', anychart.stockModule.math.sma.calculationFunction);
goog.exportSymbol('anychart.math.sma.createComputer', anychart.stockModule.math.sma.createComputer);
