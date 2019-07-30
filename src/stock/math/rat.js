goog.provide('anychart.stockModule.math.rat');
goog.require('anychart.utils');


/**
 * @typedef {{
 *    baseDate: number,
 *    firstRatiocator: number,
 *    dispose: Function
 * }}
 */
anychart.stockModule.math.rat.Context;


/**
 * Creates context for RAT indicator calculation.
 * @param {number=} opt_baseDate Defaults to 0 ms.
 * @return {anychart.stockModule.math.rat.Context}
 */
anychart.stockModule.math.rat.initContext = function(opt_baseDate) {
  var baseDate = anychart.utils.normalizeToNaturalNumber(opt_baseDate, 0, false);
  return {
    baseDate: baseDate,
    firstRatiocator: NaN,
    /**
     * @this {anychart.stockModule.math.rat.Context}
     */
    'dispose': function() {
      this.firstRatiocator = NaN;
    }
  };
};


/**
 * Start calculation function for RAT indicator calculation.
 * @param {anychart.stockModule.math.rat.Context} context
 * @this {anychart.stockModule.math.rat.Context}
 */
anychart.stockModule.math.rat.startFunction = function(context) {
  this.firstRatiocator = NaN;
};


/**
 * Calculates RAT.
 * @param {anychart.stockModule.data.TableComputer.RowProxy} row
 * @param {anychart.stockModule.math.rat.Context} context
 * @this {anychart.stockModule.math.rat.Context}
 */
anychart.stockModule.math.rat.calculationFunction = function(row, context) {
  var priceA = row.get('priceA');
  priceA = anychart.utils.toNumber(priceA);
  var priceB = row.get('priceB');
  priceB = anychart.utils.toNumber(priceB);
  var currentKey = row.getKey();
  var result = anychart.stockModule.math.rat.calculate(context, priceA, priceB, currentKey);
  row.set('result', result);
};


/**
 * Creates RAT computer for the given table mapping.
 * @param {anychart.stockModule.data.TableMapping} mapping
 * @param {number=} opt_baseDate
 * @return {anychart.stockModule.data.TableComputer}
 */
anychart.stockModule.math.rat.createComputer = function(mapping, opt_baseDate) {
  var result = mapping.getTable().createComputer(mapping);
  result.setContext(anychart.stockModule.math.rat.initContext(opt_baseDate));
  result.setStartFunction(anychart.stockModule.math.rat.startFunction);
  result.setCalculationFunction(anychart.stockModule.math.rat.calculationFunction);
  result.addOutputField('result');
  return result;
};


/**
 * Calculates RAT value based on close values of two series.
 * @param {anychart.stockModule.math.rat.Context} context
 * @param {number} priceA
 * @param {number} priceB
 * @param {number} currentKey
 * @return {number}
 */
anychart.stockModule.math.rat.calculate = function(context, priceA, priceB, currentKey) {

  if (isNaN(priceA) || isNaN(priceB))
    return NaN;

  if (isNaN(context.firstRatiocator) && currentKey >= context.baseDate) {
    context.firstRatiocator = priceA / priceB;
  }

  var ratio = priceA / priceB;

  return (ratio / context.firstRatiocator) * 100;
};


//exports
goog.exportSymbol('anychart.math.rat.initContext', anychart.stockModule.math.rat.initContext);
goog.exportSymbol('anychart.math.rat.startFunction', anychart.stockModule.math.rat.startFunction);
goog.exportSymbol('anychart.math.rat.calculate', anychart.stockModule.math.rat.calculate);
goog.exportSymbol('anychart.math.rat.calculationFunction', anychart.stockModule.math.rat.calculationFunction);
goog.exportSymbol('anychart.math.rat.createComputer', anychart.stockModule.math.rat.createComputer);
