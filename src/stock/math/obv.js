goog.provide('anychart.stockModule.math.obv');
goog.require('anychart.utils');



/**
 * @typedef {{
 *    prevObvValue: number,
 *    prevCloseValue:number,
 *    dispose: Function
 * }}
 */
anychart.stockModule.math.obv.Context;


/**
 * Creates context for OBV indicator calculation.
 * @return {anychart.stockModule.math.obv.Context}
 */
anychart.stockModule.math.obv.initContext = function() {
  return {
    prevObvValue: NaN,
    prevCloseValue: NaN,
    /**
     * @this {anychart.stockModule.math.obv.Context}
     */
    'dispose': function() {
    }
  };
};


/**
 * Start calculation function for OBV indicator calculation.
 * @param {anychart.stockModule.math.obv.Context} context
 * @this {anychart.stockModule.math.obv.Context}
 */
anychart.stockModule.math.obv.startFunction = function(context) {
  context.prevObvValue = NaN;
  context.prevCloseValue = NaN;
};


/**
 * Calculates OBV.
 * @param {anychart.stockModule.data.TableComputer.RowProxy} row
 * @param {anychart.stockModule.math.obv.Context} context
 * @this {anychart.stockModule.math.obv.Context}
 */
anychart.stockModule.math.obv.calculationFunction = function(row, context) {
  var value = row.get('close');
  value = goog.isDef(value) ? value : row.get('value');
  var volume = row.get('volume');
  volume = anychart.utils.toNumber(volume);
  value = anychart.utils.toNumber(value);
  var result = anychart.stockModule.math.obv.calculate(context, value, volume);
  row.set('result', result);
};


/**
 * Creates OBV computer for the given table mapping.
 * @param {anychart.stockModule.data.TableMapping} mapping
 * @return {anychart.stockModule.data.TableComputer}
 */
anychart.stockModule.math.obv.createComputer = function(mapping) {
  var result = mapping.getTable().createComputer(mapping);
  result.setContext(anychart.stockModule.math.obv.initContext());
  result.setStartFunction(anychart.stockModule.math.obv.startFunction);
  result.setCalculationFunction(anychart.stockModule.math.obv.calculationFunction);
  result.addOutputField('result');
  return result;
};


/**
 * Calculates next OBV value based on a previous OBV value and current close value.
 * On first calculation pass 0.
 * @param {anychart.stockModule.math.obv.Context} context
 * @param {number} value close value
 * @param {number} volume Volume value
 * @return {number}
 */
anychart.stockModule.math.obv.calculate = function(context, value, volume) {
  if (isNaN(value) || isNaN(volume)) {
    return NaN;
  }
  if (isNaN(context.prevObvValue)) {
    context.prevCloseValue = value;
    context.prevObvValue = volume;
  } else {
    if (value > context.prevCloseValue) {
      context.prevObvValue += volume;
    } else if (value < context.prevCloseValue) {
      context.prevObvValue -= volume;
    }
    context.prevCloseValue = value;
  }
  return context.prevObvValue;
};


//exports
goog.exportSymbol('anychart.math.obv.initContext', anychart.stockModule.math.obv.initContext);
goog.exportSymbol('anychart.math.obv.startFunction', anychart.stockModule.math.obv.startFunction);
goog.exportSymbol('anychart.math.obv.calculate', anychart.stockModule.math.obv.calculate);
goog.exportSymbol('anychart.math.obv.calculationFunction', anychart.stockModule.math.obv.calculationFunction);
goog.exportSymbol('anychart.math.obv.createComputer', anychart.stockModule.math.obv.createComputer);
