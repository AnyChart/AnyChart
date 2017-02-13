goog.provide('anychart.math.bbandsWidth');
goog.require('anychart.math.CycledQueue');
goog.require('anychart.math.bbands');
goog.require('anychart.utils');

/**
 * @namespace {anychart.math.bbandsWidth}
 */


/**
 * @typedef {{
 *    queue: !anychart.math.CycledQueue,
 *    period: number,
 *    deviation: number,
 *    prevResult: number,
 *    prevDeviation: number,
 *    dequeuedValue: number,
 *    dispose: Function
 * }}
 */
anychart.math.bbandsWidth.Context;


/**
 * Creates context for BBandsWidth indicator calculation.
 * @param {number=} opt_period [20].
 * @param {number=} opt_deviation [2].
 * @return {anychart.math.bbandsWidth.Context}
 */
anychart.math.bbandsWidth.initContext = function(opt_period, opt_deviation) {
  return /** @type {anychart.math.bbandsWidth.Context} */ (anychart.math.bbands.initContext(opt_period, opt_deviation));
};


/**
 * Start calculation function for BBandsWidth indicator calculation.
 * @param {anychart.math.bbandsWidth.Context} context
 * @this {anychart.math.bbandsWidth.Context}
 */
anychart.math.bbandsWidth.startFunction = function(context) {
  anychart.math.bbands.startFunction(context);
};


/**
 * BBands Width calculation.
 * @param {anychart.math.bbandsWidth.Context} context BBands Width context.
 * @param {number} value Current value.
 * @return {number}
 */
anychart.math.bbandsWidth.calculate = function(context, value) {
  var rv = anychart.math.bbands.calculate(context, value);
  var middle = rv[0];
  var upper = rv[1];
  var lower = rv[2];
  return ((upper - lower) / middle);
};


/**
 * Calculates BBandsWidth.
 * @param {anychart.data.TableComputer.RowProxy} row
 * @param {anychart.math.bbandsWidth.Context} context
 * @this {anychart.math.bbandsWidth.Context}
 */
anychart.math.bbandsWidth.calculationFunction = function(row, context) {
  var value = anychart.utils.toNumber(row.get('value'));
  row.set('result', anychart.math.bbandsWidth.calculate(context, value));
};


/**
 * Creates BBands computer for the given table mapping.
 * @param {anychart.data.TableMapping} mapping
 * @param {number=} opt_period
 * @param {number=} opt_deviation
 * @return {anychart.data.TableComputer}
 */
anychart.math.bbandsWidth.createComputer = function(mapping, opt_period, opt_deviation) {
  var result = mapping.getTable().createComputer(mapping);
  result.setContext(anychart.math.bbandsWidth.initContext(opt_period, opt_deviation));
  result.setStartFunction(anychart.math.bbandsWidth.startFunction);
  result.setCalculationFunction(anychart.math.bbandsWidth.calculationFunction);
  result.addOutputField('result');
  return result;
};


//exports
goog.exportSymbol('anychart.math.bbandsWidth.initContext', anychart.math.bbandsWidth.initContext);
goog.exportSymbol('anychart.math.bbandsWidth.startFunction', anychart.math.bbandsWidth.startFunction);
goog.exportSymbol('anychart.math.bbandsWidth.calculate', anychart.math.bbandsWidth.calculate);
goog.exportSymbol('anychart.math.bbandsWidth.calculationFunction', anychart.math.bbandsWidth.calculationFunction);
goog.exportSymbol('anychart.math.bbandsWidth.createComputer', anychart.math.bbandsWidth.createComputer);
