goog.provide('anychart.stockModule.math.bbandsWidth');
goog.require('anychart.stockModule.math.CycledQueue');
goog.require('anychart.stockModule.math.bbands');
goog.require('anychart.utils');

/**
 * @namespace {anychart.stockModule.math.bbandsWidth}
 */


/**
 * @typedef {{
 *    queue: !anychart.stockModule.math.CycledQueue,
 *    period: number,
 *    deviation: number,
 *    prevResult: number,
 *    prevDeviation: number,
 *    dequeuedValue: number,
 *    dispose: Function
 * }}
 */
anychart.stockModule.math.bbandsWidth.Context;


/**
 * Creates context for BBandsWidth indicator calculation.
 * @param {number=} opt_period [20].
 * @param {number=} opt_deviation [2].
 * @return {anychart.stockModule.math.bbandsWidth.Context}
 */
anychart.stockModule.math.bbandsWidth.initContext = function(opt_period, opt_deviation) {
  return /** @type {anychart.stockModule.math.bbandsWidth.Context} */ (anychart.stockModule.math.bbands.initContext(opt_period, opt_deviation));
};


/**
 * Start calculation function for BBandsWidth indicator calculation.
 * @param {anychart.stockModule.math.bbandsWidth.Context} context
 * @this {anychart.stockModule.math.bbandsWidth.Context}
 */
anychart.stockModule.math.bbandsWidth.startFunction = function(context) {
  anychart.stockModule.math.bbands.startFunction(context);
};


/**
 * BBands Width calculation.
 * @param {anychart.stockModule.math.bbandsWidth.Context} context BBands Width context.
 * @param {number} value Current value.
 * @return {number}
 */
anychart.stockModule.math.bbandsWidth.calculate = function(context, value) {
  var rv = anychart.stockModule.math.bbands.calculate(context, value);
  var middle = rv[0];
  var upper = rv[1];
  var lower = rv[2];
  return ((upper - lower) / middle);
};


/**
 * Calculates BBandsWidth.
 * @param {anychart.stockModule.data.TableComputer.RowProxy} row
 * @param {anychart.stockModule.math.bbandsWidth.Context} context
 * @this {anychart.stockModule.math.bbandsWidth.Context}
 */
anychart.stockModule.math.bbandsWidth.calculationFunction = function(row, context) {
  var value = row.get('value');
  value = goog.isDef(value) ? value : row.get('close');
  value = anychart.utils.toNumber(value);
  row.set('result', anychart.stockModule.math.bbandsWidth.calculate(context, value));
};


/**
 * Creates BBands computer for the given table mapping.
 * @param {anychart.stockModule.data.TableMapping} mapping
 * @param {number=} opt_period
 * @param {number=} opt_deviation
 * @return {anychart.stockModule.data.TableComputer}
 */
anychart.stockModule.math.bbandsWidth.createComputer = function(mapping, opt_period, opt_deviation) {
  var result = mapping.getTable().createComputer(mapping);
  result.setContext(anychart.stockModule.math.bbandsWidth.initContext(opt_period, opt_deviation));
  result.setStartFunction(anychart.stockModule.math.bbandsWidth.startFunction);
  result.setCalculationFunction(anychart.stockModule.math.bbandsWidth.calculationFunction);
  result.addOutputField('result');
  return result;
};


//exports
goog.exportSymbol('anychart.math.bbandsWidth.initContext', anychart.stockModule.math.bbandsWidth.initContext);
goog.exportSymbol('anychart.math.bbandsWidth.startFunction', anychart.stockModule.math.bbandsWidth.startFunction);
goog.exportSymbol('anychart.math.bbandsWidth.calculate', anychart.stockModule.math.bbandsWidth.calculate);
goog.exportSymbol('anychart.math.bbandsWidth.calculationFunction', anychart.stockModule.math.bbandsWidth.calculationFunction);
goog.exportSymbol('anychart.math.bbandsWidth.createComputer', anychart.stockModule.math.bbandsWidth.createComputer);
