goog.provide('anychart.math.macd');
goog.require('anychart.math.CycledQueue');
goog.require('anychart.math.ema');
goog.require('anychart.utils');


/**
 * @typedef {{
 *    fastEMAContext: anychart.math.ema.Context,
 *    slowEMAContext: anychart.math.ema.Context,
 *    signalEMAContext: anychart.math.ema.Context,
 *    dispose: Function
 * }}
 */
anychart.math.macd.Context;


/**
 * Creates context for MACD indicator calculation.
 * @param {number=} opt_fastPeriod Defaults to 12.
 * @param {number=} opt_slowPeriod Defaults to 26.
 * @param {number=} opt_signalPeriod Defaults to 9.
 * @return {anychart.math.macd.Context}
 */
anychart.math.macd.initContext = function(opt_fastPeriod, opt_slowPeriod, opt_signalPeriod) {
  var fastPeriod = anychart.utils.normalizeToNaturalNumber(opt_fastPeriod, 12, false);
  var slowPeriod = anychart.utils.normalizeToNaturalNumber(opt_slowPeriod, 26, false);
  if (fastPeriod > slowPeriod) {
    var tmp = fastPeriod;
    fastPeriod = slowPeriod;
    slowPeriod = tmp;
  }
  var signalPeriod = anychart.utils.normalizeToNaturalNumber(opt_signalPeriod, 9, false);

  var fastEMAContext = anychart.math.ema.initContext(fastPeriod);
  var slowEMAContext = anychart.math.ema.initContext(slowPeriod);
  var signalEMAContext = anychart.math.ema.initContext(signalPeriod);
  return {
    fastEMAContext: fastEMAContext,
    slowEMAContext: slowEMAContext,
    signalEMAContext: signalEMAContext,
    /**
     * @this {anychart.math.macd.Context}
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
 * @param {anychart.math.macd.Context} context
 * @this {anychart.math.macd.Context}
 */
anychart.math.macd.startFunction = function(context) {
  anychart.math.ema.startFunction(context.fastEMAContext);
  anychart.math.ema.startFunction(context.slowEMAContext);
  anychart.math.ema.startFunction(context.signalEMAContext);
};


/**
 * Calculates MACD.
 * @param {anychart.data.TableComputer.RowProxy} row
 * @param {anychart.math.macd.Context} context
 * @this {anychart.math.macd.Context}
 */
anychart.math.macd.calculationFunction = function(row, context) {
  var value = anychart.utils.toNumber(row.get('value'));
  var rv = anychart.math.macd.calculate(context, value);
  var macdResult = rv[0];
  var signalResult = rv[1];
  var histogramResult = rv[2];
  row.set('macdResult', macdResult);
  row.set('signalResult', signalResult);
  row.set('histogramResult', histogramResult);
};


/**
 * Calculates macd.
 * @param {anychart.math.macd.Context} context
 * @param {number} value
 * @return {Array.<number>}
 */
anychart.math.macd.calculate = function(context, value) {
  if (isNaN(value))
    return [NaN, NaN, NaN];
  else {
    var macdResult, histogramResult;
    var fastResult = anychart.math.ema.calculate(context.fastEMAContext, value);
    var slowResult = anychart.math.ema.calculate(context.slowEMAContext, value);
    var signalResult = anychart.math.ema.calculate(context.signalEMAContext, fastResult - slowResult);
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
 * @param {anychart.data.TableMapping} mapping
 * @param {number=} opt_fastPeriod
 * @param {number=} opt_slowPeriod
 * @param {number=} opt_signalPeriod
 * @return {anychart.data.TableComputer}
 */
anychart.math.macd.createComputer = function(mapping, opt_fastPeriod, opt_slowPeriod, opt_signalPeriod) {
  var result = mapping.getTable().createComputer(mapping);
  result.setContext(anychart.math.macd.initContext(opt_fastPeriod, opt_slowPeriod, opt_signalPeriod));
  result.setStartFunction(anychart.math.macd.startFunction);
  result.setCalculationFunction(anychart.math.macd.calculationFunction);
  result.addOutputField('macdResult');
  result.addOutputField('signalResult');
  result.addOutputField('histogramResult');
  return result;
};


//exports
goog.exportSymbol('anychart.math.macd.initContext', anychart.math.macd.initContext);
goog.exportSymbol('anychart.math.macd.startFunction', anychart.math.macd.startFunction);
goog.exportSymbol('anychart.math.macd.calculate', anychart.math.macd.calculate);
goog.exportSymbol('anychart.math.macd.calculationFunction', anychart.math.macd.calculationFunction);
goog.exportSymbol('anychart.math.macd.createComputer', anychart.math.macd.createComputer);
