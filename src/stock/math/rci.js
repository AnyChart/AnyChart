goog.provide('anychart.stockModule.math.rci');
goog.require('anychart.stockModule.math.CycledQueue');
goog.require('anychart.utils');


/**
 * @typedef {{
 *    queue: !anychart.stockModule.math.CycledQueue,
 *    period: number,
 *    dispose: Function
 * }}
 */
anychart.stockModule.math.rci.Context;


/**
 * Creates context for RCI indicator calculation.
 * @param {number=} opt_period [12] Defaults to 12.
 * @return {anychart.stockModule.math.rci.Context}
 */
anychart.stockModule.math.rci.initContext = function(opt_period) {
  var period = anychart.utils.normalizeToNaturalNumber(opt_period, 12, false);
  return {
    queue: anychart.math.cycledQueue(period),
    period: period,
    /**
     * @this {anychart.stockModule.math.rci.Context}
     */
    'dispose': function() {
      this.queue.clear();
    }
  };
};


/**
 * Start calculation function for RCI indicator calculation.
 * @param {anychart.stockModule.math.rci.Context} context
 * @this {anychart.stockModule.math.rci.Context}
 */
anychart.stockModule.math.rci.startFunction = function(context) {
  context.queue.clear();
};


/**
 * Calculates RCI.
 * @param {anychart.stockModule.data.TableComputer.RowProxy} row
 * @param {anychart.stockModule.math.rci.Context} context
 * @this {anychart.stockModule.math.rci.Context}
 */
anychart.stockModule.math.rci.calculationFunction = function(row, context) {
  var value = row.get('value');
  value = goog.isDef(value) ? value : row.get('close');
  value = anychart.utils.toNumber(value);
  var result = anychart.stockModule.math.rci.calculate(context, value);
  row.set('result', result);
};


/**
 * Creates RCI computer for the given table mapping.
 * @param {anychart.stockModule.data.TableMapping} mapping
 * @param {number=} opt_period
 * @return {anychart.stockModule.data.TableComputer}
 */
anychart.stockModule.math.rci.createComputer = function(mapping, opt_period) {
  var result = mapping.getTable().createComputer(mapping);
  result.setContext(anychart.stockModule.math.rci.initContext(opt_period));
  result.setStartFunction(anychart.stockModule.math.rci.startFunction);
  result.setCalculationFunction(anychart.stockModule.math.rci.calculationFunction);
  result.addOutputField('result');
  return result;
};


/**
 * Calculates RCI value. The calculation formula of this indicator is hard to explain, so
 * private helper functions helps to organize the code.
 * To use this function you need a setup queue with length equal to period.
 * @param {anychart.stockModule.math.rci.Context} context
 * @param {number} value
 * @return {number}
 */
anychart.stockModule.math.rci.calculate = function(context, value) {
  if (isNaN(value))
    return NaN;

  context.queue.enqueue(value);
  var rci = NaN;

  if (context.queue.getLength() >= context.period) {
    var d = anychart.stockModule.math.rci.calculateD_(context);
    var denominator = (context.period * (Math.pow(context.period, 2) - 1));
    rci = (1 - 6 * d / denominator) * 100;
  }

  return rci;
};


/**
 * Helper function for calculating price ranks for RCI.
 * @param {anychart.stockModule.math.rci.Context} context
 * @param {number} idx
 * @param {number} period
 * @return {number}
 * @private
 */
anychart.stockModule.math.rci.calculatePriceRanks_ = function(context, idx, period) {
  var p = context.queue.get(idx);
  var o = 1;
  var s = 0;

  for (var i = 0; i < period; i++) {
    var currentValue = context.queue.get(i);
    if (p < currentValue)
      o++;
    else if (p == currentValue)
      s++;
  }
  return o + (s - 1) / 2;
};


/**
 * Helper function for calculating the difference between the date rank and the price is squared and the total number.
 * It's called D.
 * @param {anychart.stockModule.math.rci.Context} context
 * @return {number}
 * @private
 */
anychart.stockModule.math.rci.calculateD_ = function(context) {
  var sum = 0;
  var period = context.period;
  // date indexes goes in reverse order according to indicator explanation
  for (var i = 0; i < period; i++) {
    var dateOrder = period - i;
    var priceRank = anychart.stockModule.math.rci.calculatePriceRanks_(context, i, period);
    sum += Math.pow(dateOrder - priceRank, 2);
  }
  return sum;
};


//exports
goog.exportSymbol('anychart.math.rci.initContext', anychart.stockModule.math.rci.initContext);
goog.exportSymbol('anychart.math.rci.startFunction', anychart.stockModule.math.rci.startFunction);
goog.exportSymbol('anychart.math.rci.calculate', anychart.stockModule.math.rci.calculate);
goog.exportSymbol('anychart.math.rci.calculationFunction', anychart.stockModule.math.rci.calculationFunction);
goog.exportSymbol('anychart.math.rci.createComputer', anychart.stockModule.math.rci.createComputer);
