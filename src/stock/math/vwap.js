goog.provide('anychart.stockModule.math.vwap');
goog.require('anychart.utils');


/**
 * @typedef {{
 *   cumulativeVolume: number,
 *   cumulativeTransactionsValue: number,
 *   dispose: Function
 * }}
 */
anychart.stockModule.math.vwap.Context;


/**
 * Creates context for VWAP indicator calculation.
 * @return {anychart.stockModule.math.vwap.Context}
 */
anychart.stockModule.math.vwap.initContext = function() {
  return {
    cumulativeVolume: 0,
    cumulativeTransactionsValue: 0,
    /**
     * @this {anychart.stockModule.math.vwap.Context}
     */
    'dispose': function() {
    }
  };
};


/**
 * Start calculation function for VWAP indicator calculation.
 * @param {anychart.stockModule.math.vwap.Context} context
 * @this {anychart.stockModule.math.vwap.Context}
 */
anychart.stockModule.math.vwap.startFunction = function(context) {
  context.cumulativeVolume = 0;
  context.cumulativeTransactionsValue = 0;
};


/**
 * Calculates VWAP value.
 * @param {anychart.stockModule.math.vwap.Context} context
 * @param {number} high
 * @param {number} low
 * @param {number} close
 * @param {number} volume
 * @return {number}
 */
anychart.stockModule.math.vwap.calculate = function(context, high, low, close, volume) {
  if (isNaN(high) || isNaN(low) || isNaN(close) || isNaN(volume)) {
    return NaN;
  } else {
    context.cumulativeVolume += volume;
    context.cumulativeTransactionsValue += (high + low + close) * volume / 3;
    return context.cumulativeTransactionsValue / context.cumulativeVolume;
  }
};


/**
 * Calculate VWAP.
 * @param {anychart.stockModule.data.TableComputer.RowProxy} row
 * @param {anychart.stockModule.math.vwap.Context} context
 * @this {anychart.stockModule.math.vwap.Context}
 */
anychart.stockModule.math.vwap.calculationFunction = function(row, context) {
  var high = anychart.utils.toNumber(row.get('high'));
  var low = anychart.utils.toNumber(row.get('low'));
  var close = anychart.utils.toNumber(row.get('close'));
  var volume = anychart.utils.toNumber(row.get('volume'));
  var result = anychart.stockModule.math.vwap.calculate(context, high, low, close, volume);
  row.set('vwapValue', result);
};


/**
 * Creates VWAP computer for the given table mapping.
 * @param {anychart.stockModule.data.TableMapping} mapping
 * @return {anychart.stockModule.data.TableComputer}
 */
anychart.stockModule.math.vwap.createComputer = function(mapping) {
  var result = mapping.getTable().createComputer(mapping);
  result.setContext(anychart.stockModule.math.vwap.initContext());
  result.setStartFunction(anychart.stockModule.math.vwap.startFunction);
  result.setCalculationFunction(anychart.stockModule.math.vwap.calculationFunction);
  result.addOutputField('vwapValue');
  return result;
};

//exports
goog.exportSymbol('anychart.math.vwap.initContext', anychart.stockModule.math.vwap.initContext);
goog.exportSymbol('anychart.math.vwap.startFunction', anychart.stockModule.math.vwap.startFunction);
goog.exportSymbol('anychart.math.vwap.calculate', anychart.stockModule.math.vwap.calculate);
goog.exportSymbol('anychart.math.vwap.calculationFunction', anychart.stockModule.math.vwap.calculationFunction);
goog.exportSymbol('anychart.math.vwap.createComputer', anychart.stockModule.math.vwap.createComputer);
