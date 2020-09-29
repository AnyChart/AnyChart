goog.provide('anychart.stockModule.math.adl');
goog.require('anychart.stockModule.math.CycledQueue');
goog.require('anychart.utils');


/**
 * @typedef {{
 *   prevResult: number,
 *   dispose: Function
 * }}
 */
anychart.stockModule.math.adl.Context;


/**
 * Creates context for ADL indicator calculation.
 * @return {anychart.stockModule.math.adl.Context}
 */
anychart.stockModule.math.adl.initContext = function() {
  return {
    prevResult: 0,
    /**
     * @this {anychart.stockModule.math.adl.Context}
     */
    'dispose': function() {
    }
  };
};


/**
 * Start calculation function for ADL indicator calculation.
 * @param {anychart.stockModule.math.adl.Context} context
 * @this {anychart.stockModule.math.adl.Context}
 */
anychart.stockModule.math.adl.startFunction = function(context) {
  context.prevResult = 0;
};


/**
 * Calculates ADL value.
 * @param {Object} context
 * @param {number} close
 * @param {number} high
 * @param {number} low
 * @param {number} volume
 * @return {number}
 */
anychart.stockModule.math.adl.calculate = function(context, close, high, low, volume) {
  if (isNaN(high) || isNaN(low) || isNaN(close) || isNaN(volume)) {
    return NaN;
  } else {
    var denominator = high - low;
    var result = context.prevResult;
    // if the formula can be calculated with the valid result
    if (denominator) {
      result += ((close - low) - (high - close)) / denominator * volume;
      context.prevResult = result;
    }
  }
  return result;
};


/**
 * Calculation function for ADL.
 * @param {anychart.stockModule.data.TableComputer.RowProxy} row
 * @param {anychart.stockModule.math.adl.Context} context
 * @this {anychart.stockModule.math.adl.Context}
 */
anychart.stockModule.math.adl.calculationFunction = function(row, context) {
  var close = anychart.utils.toNumber(row.get('close'));
  var high = anychart.utils.toNumber(row.get('high'));
  var low = anychart.utils.toNumber(row.get('low'));
  var volume = anychart.utils.toNumber(row.get('volume'));
  var rv = anychart.stockModule.math.adl.calculate(context, close, high, low, volume);
  row.set('result', rv);
};


/**
 * Creates ADL computer for the given table mapping.
 * @param {anychart.stockModule.data.TableMapping} mapping
 * @return {anychart.stockModule.data.TableComputer}
 */
anychart.stockModule.math.adl.createComputer = function(mapping) {
  var result = mapping.getTable().createComputer(mapping);
  result.setContext(anychart.stockModule.math.adl.initContext());
  result.setStartFunction(anychart.stockModule.math.adl.startFunction);
  result.setCalculationFunction(anychart.stockModule.math.adl.calculationFunction);
  result.addOutputField('result');
  return result;
};


//exports
goog.exportSymbol('anychart.math.adl.initContext', anychart.stockModule.math.adl.initContext);
goog.exportSymbol('anychart.math.adl.startFunction', anychart.stockModule.math.adl.startFunction);
goog.exportSymbol('anychart.math.adl.calculate', anychart.stockModule.math.adl.calculate);
goog.exportSymbol('anychart.math.adl.calculationFunction', anychart.stockModule.math.adl.calculationFunction);
goog.exportSymbol('anychart.math.adl.createComputer', anychart.stockModule.math.adl.createComputer);
