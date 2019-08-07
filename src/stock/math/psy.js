goog.provide('anychart.stockModule.math.psy');
goog.require('anychart.stockModule.math.CycledQueue');
goog.require('anychart.utils');


/**
 * @typedef {{
 *    queue: !anychart.stockModule.math.CycledQueue,
 *    period: number,
 *    dispose: Function
 * }}
 */
anychart.stockModule.math.psy.Context;


/**
 * Creates context for PSY indicator calculation.
 * @param {number=} opt_period [20] Defaults to 20.
 * @return {anychart.stockModule.math.psy.Context}
 */
anychart.stockModule.math.psy.initContext = function(opt_period) {
  var period = anychart.utils.normalizeToNaturalNumber(opt_period, 20, false);
  return {
    /**
     * Here and then "period + 1" means that queue takes into account the point
     * before the considered period for comparing values.
     * For example: period = 10. It means 10 pairs to compare, it requires 11 points then.
     */
    queue: anychart.math.cycledQueue(period + 1),
    period: period,
    /**
     * @this {anychart.stockModule.math.psy.Context}
     */
    'dispose': function() {
      this.queue.clear();
    }
  };
};


/**
 * Start calculation function for PSY indicator calculation.
 * @param {anychart.stockModule.math.psy.Context} context
 * @this {anychart.stockModule.math.psy.Context}
 */
anychart.stockModule.math.psy.startFunction = function(context) {
  context.queue.clear();
};


/**
 * Calculates PSY.
 * @param {anychart.stockModule.data.TableComputer.RowProxy} row
 * @param {anychart.stockModule.math.psy.Context} context
 * @this {anychart.stockModule.math.psy.Context}
 */
anychart.stockModule.math.psy.calculationFunction = function(row, context) {
  var value = row.get('value');
  value = goog.isDef(value) ? value : row.get('close');
  value = anychart.utils.toNumber(value);
  var result = anychart.stockModule.math.psy.calculate(context, value);
  row.set('result', result);
};


/**
 * Creates PSY computer for the given table mapping.
 * @param {anychart.stockModule.data.TableMapping} mapping
 * @param {number=} opt_period
 * @return {anychart.stockModule.data.TableComputer}
 */
anychart.stockModule.math.psy.createComputer = function(mapping, opt_period) {
  var result = mapping.getTable().createComputer(mapping);
  result.setContext(anychart.stockModule.math.psy.initContext(opt_period));
  result.setStartFunction(anychart.stockModule.math.psy.startFunction);
  result.setCalculationFunction(anychart.stockModule.math.psy.calculationFunction);
  result.addOutputField('result');
  return result;
};


/**
 * Calculates next PSY value based comparing values among the period and
 * one point before the period.
 * @param {anychart.stockModule.math.psy.Context} context
 * @param {number} value
 * @return {number}
 */
anychart.stockModule.math.psy.calculate = function(context, value) {
  if (isNaN(value))
    return NaN;

  var result = NaN;

  context.queue.enqueue(value);

  if (context.queue.getLength() >= context.period + 1) {
    var prevValue = context.queue.get(0);
    var risingCount = 0;
    for (var i = 1; i < context.period + 1; i++) {
      var currentValue = context.queue.get(i);
      if (currentValue > prevValue)
        risingCount++;

      prevValue = currentValue;
    }
    // number of positive diffs among the period (not +1)
    result = (risingCount / context.period) * 100;
  }

  return result;
};


//exports
goog.exportSymbol('anychart.math.psy.initContext', anychart.stockModule.math.psy.initContext);
goog.exportSymbol('anychart.math.psy.startFunction', anychart.stockModule.math.psy.startFunction);
goog.exportSymbol('anychart.math.psy.calculate', anychart.stockModule.math.psy.calculate);
goog.exportSymbol('anychart.math.psy.calculationFunction', anychart.stockModule.math.psy.calculationFunction);
goog.exportSymbol('anychart.math.psy.createComputer', anychart.stockModule.math.psy.createComputer);
