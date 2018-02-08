goog.provide('anychart.stockModule.math.macd');
goog.require('anychart.stockModule.math.CycledQueue');
goog.require('anychart.stockModule.math.ema');
goog.require('anychart.utils');


/**
 * @typedef {{
 *    fastEMAContext: anychart.stockModule.math.ema.Context,
 *    slowEMAContext: anychart.stockModule.math.ema.Context,
 *    signalEMAContext: anychart.stockModule.math.ema.Context,
 *    dispose: Function
 * }}
 */
anychart.stockModule.math.macd.Context;


/**
 * Creates context for MACD indicator calculation.
 * @param {number=} opt_fastPeriod Defaults to 12.
 * @param {number=} opt_slowPeriod Defaults to 26.
 * @param {number=} opt_signalPeriod Defaults to 9.
 * @return {anychart.stockModule.math.macd.Context}
 */
anychart.stockModule.math.macd.initContext = function(opt_fastPeriod, opt_slowPeriod, opt_signalPeriod) {
  var fastPeriod = anychart.utils.normalizeToNaturalNumber(opt_fastPeriod, 12, false);
  var slowPeriod = anychart.utils.normalizeToNaturalNumber(opt_slowPeriod, 26, false);
  if (fastPeriod > slowPeriod) {
    var tmp = fastPeriod;
    fastPeriod = slowPeriod;
    slowPeriod = tmp;
  }
  var signalPeriod = anychart.utils.normalizeToNaturalNumber(opt_signalPeriod, 9, false);

  var fastEMAContext = anychart.stockModule.math.ema.initContext(fastPeriod);
  var slowEMAContext = anychart.stockModule.math.ema.initContext(slowPeriod);
  var signalEMAContext = anychart.stockModule.math.ema.initContext(signalPeriod);
  return {
    fastEMAContext: fastEMAContext,
    slowEMAContext: slowEMAContext,
    signalEMAContext: signalEMAContext,
    /**
     * @this {anychart.stockModule.math.macd.Context}
     */
    'dispose': function() {
      this.fastEMAContext['dispose']();
      this.slowEMAContext['dispose']();
      this.signalEMAContext['dispose']();
    }
  };
};


/**
 * Start calculation function for MACD indicator calculation.
 * @param {anychart.stockModule.math.macd.Context} context
 * @this {anychart.stockModule.math.macd.Context}
 */
anychart.stockModule.math.macd.startFunction = function(context) {
  anychart.stockModule.math.ema.startFunction(context.fastEMAContext);
  anychart.stockModule.math.ema.startFunction(context.slowEMAContext);
  anychart.stockModule.math.ema.startFunction(context.signalEMAContext);
};


/**
 * Calculates MACD.
 * @param {anychart.stockModule.data.TableComputer.RowProxy} row
 * @param {anychart.stockModule.math.macd.Context} context
 * @this {anychart.stockModule.math.macd.Context}
 */
anychart.stockModule.math.macd.calculationFunction = function(row, context) {
  var value = row.get('value');
  value = goog.isDef(value) ? value : row.get('close');
  value = anychart.utils.toNumber(value);
  var rv = anychart.stockModule.math.macd.calculate(context, value);
  var macdResult = rv[0];
  var signalResult = rv[1];
  var histogramResult = rv[2];
  row.set('macdResult', macdResult);
  row.set('signalResult', signalResult);
  row.set('histogramResult', histogramResult);
};


/**
 * Calculates macd.
 * @param {anychart.stockModule.math.macd.Context} context
 * @param {number} value
 * @return {Array.<number>}
 */
anychart.stockModule.math.macd.calculate = function(context, value) {
  if (isNaN(value))
    return [NaN, NaN, NaN];
  else {
    var macdResult, histogramResult;
    var fastResult = anychart.stockModule.math.ema.calculate(context.fastEMAContext, value);
    var slowResult = anychart.stockModule.math.ema.calculate(context.slowEMAContext, value);
    var signalResult = anychart.stockModule.math.ema.calculate(context.signalEMAContext, fastResult - slowResult);
    if (!isNaN(signalResult)) {
      macdResult = fastResult - slowResult;
      histogramResult = fastResult - slowResult - signalResult;
    } else
      macdResult = signalResult = histogramResult = NaN;
    return [macdResult, signalResult, histogramResult];
  }
};


/**
 * Creates MACD computer for the given table mapping.
 * @param {anychart.stockModule.data.TableMapping} mapping
 * @param {number=} opt_fastPeriod
 * @param {number=} opt_slowPeriod
 * @param {number=} opt_signalPeriod
 * @return {anychart.stockModule.data.TableComputer}
 */
anychart.stockModule.math.macd.createComputer = function(mapping, opt_fastPeriod, opt_slowPeriod, opt_signalPeriod) {
  var result = mapping.getTable().createComputer(mapping);
  result.setContext(anychart.stockModule.math.macd.initContext(opt_fastPeriod, opt_slowPeriod, opt_signalPeriod));
  result.setStartFunction(anychart.stockModule.math.macd.startFunction);
  result.setCalculationFunction(anychart.stockModule.math.macd.calculationFunction);
  result.addOutputField('macdResult');
  result.addOutputField('signalResult');
  result.addOutputField('histogramResult');
  return result;
};


//exports
goog.exportSymbol('anychart.math.macd.initContext', anychart.stockModule.math.macd.initContext);
goog.exportSymbol('anychart.math.macd.startFunction', anychart.stockModule.math.macd.startFunction);
goog.exportSymbol('anychart.math.macd.calculate', anychart.stockModule.math.macd.calculate);
goog.exportSymbol('anychart.math.macd.calculationFunction', anychart.stockModule.math.macd.calculationFunction);
goog.exportSymbol('anychart.math.macd.createComputer', anychart.stockModule.math.macd.createComputer);
