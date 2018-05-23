goog.provide('anychart.stockModule.math.trix');
goog.require('anychart.enums');
goog.require('anychart.stockModule.math.CycledQueue');
goog.require('anychart.stockModule.math.ema');
goog.require('anychart.stockModule.math.sma');
goog.require('anychart.utils');


/**
 * @typedef {{
 *    period: number,
 *    prevResult: number,
 *    signalPeriod: number,
 *    firstMaContext: (anychart.stockModule.math.ema.Context|anychart.stockModule.math.sma.Context),
 *    secondMaContext: (anychart.stockModule.math.ema.Context|anychart.stockModule.math.sma.Context),
 *    thirdMaContext: (anychart.stockModule.math.ema.Context|anychart.stockModule.math.sma.Context),
 *    signalMaContext: (anychart.stockModule.math.ema.Context|anychart.stockModule.math.sma.Context),
 *    maSignalCalculate:Function,
 *    maCalculate:Function,
 *    maSignalStartFunction: Function,
 *    maStartFunction: Function,
 *    dispose: Function
 * }}
 */
anychart.stockModule.math.trix.Context;


/**
 * Creates context for TRIX indicator calculation.
 * @param {number=} opt_period Defaults to 15.
 * @param {number=} opt_signalPeriod Defaults to 9.
 * @param {anychart.enums.MovingAverageType=} opt_maType type of Ma function
 * @param {anychart.enums.MovingAverageType=} opt_signalMaType type of signal Ma function
 * @return {anychart.stockModule.math.trix.Context}
 */
anychart.stockModule.math.trix.initContext = function(opt_period, opt_signalPeriod, opt_maType, opt_signalMaType) {
  var period = anychart.utils.normalizeToNaturalNumber(opt_period, 15, false);
  var signalPeriod = anychart.utils.normalizeToNaturalNumber(opt_signalPeriod, 9, false);
  var maCalculate;
  var maSignalCalculate;
  var maInitContext;
  var signalMaInitContext;
  var maStartFunction;
  var maSignalStartFunction;
  if (opt_maType === anychart.enums.MovingAverageType.EMA) {
    maStartFunction = anychart.stockModule.math.ema.startFunction;
    maCalculate = anychart.stockModule.math.ema.calculate;
    maInitContext = anychart.stockModule.math.ema.initContext;
  } else {
    maStartFunction = anychart.stockModule.math.sma.startFunction;
    maCalculate = anychart.stockModule.math.sma.calculate;
    maInitContext = anychart.stockModule.math.sma.initContext;
  }
  if (opt_signalMaType === anychart.enums.MovingAverageType.EMA) {
    maSignalStartFunction = anychart.stockModule.math.ema.startFunction;
    maSignalCalculate = anychart.stockModule.math.ema.calculate;
    signalMaInitContext = anychart.stockModule.math.ema.initContext;
  } else {
    maSignalStartFunction = anychart.stockModule.math.sma.startFunction;
    maSignalCalculate = anychart.stockModule.math.sma.calculate;
    signalMaInitContext = anychart.stockModule.math.sma.initContext;
  }

  return {
    period: period,
    signalPeriod: signalPeriod,
    prevResult: NaN,
    firstMaContext: maInitContext(period),
    secondMaContext: maInitContext(period),
    thirdMaContext: maInitContext(period),
    signalMaContext: signalMaInitContext(signalPeriod),
    maCalculate: maCalculate,
    maSignalCalculate: maSignalCalculate,
    maSignalStartFunction: maSignalStartFunction,
    maStartFunction: maStartFunction,
    /**
     * @this {anychart.stockModule.math.trix.Context}
     */
    'dispose': function() {
      this.firstMaContext['dispose']();
      this.secondMaContext['dispose']();
      this.thirdMaContext['dispose']();
      this.signalMaContext['dispose']();
    }
  };
};


/**
 * Start calculation function for TRIX indicator calculation.
 * @param {anychart.stockModule.math.trix.Context} context
 * @this {anychart.stockModule.math.trix.Context}
 */
anychart.stockModule.math.trix.startFunction = function(context) {
  context.prevResult = NaN;
  context.maStartFunction(context.firstMaContext);
  context.maStartFunction(context.secondMaContext);
  context.maStartFunction(context.thirdMaContext);
  context.maSignalStartFunction(context.signalMaContext);
};


/**
 * Calculates TRIX.
 * @param {anychart.stockModule.data.TableComputer.RowProxy} row
 * @param {anychart.stockModule.math.trix.Context} context
 * @this {anychart.stockModule.math.trix.Context}
 */
anychart.stockModule.math.trix.calculationFunction = function(row, context) {
  var value = row.get('value');
  value = goog.isDef(value) ? value : row.get('close');
  value = anychart.utils.toNumber(value);
  var result = anychart.stockModule.math.trix.calculate(context, value);
  row.set('trix', result[0]);
  row.set('signal', result[1]);
};


/**
 * Creates TRIX computer for the given table mapping.
 * @param {anychart.stockModule.data.TableMapping} mapping
 * @param {number=} opt_period
 * @param {number=} opt_signalPeriod
 * @param {anychart.enums.MovingAverageType=} opt_maType
 * @param {anychart.enums.MovingAverageType=} opt_signalMaType
 * @return {anychart.stockModule.data.TableComputer}
 */
anychart.stockModule.math.trix.createComputer = function(mapping, opt_period, opt_signalPeriod, opt_maType, opt_signalMaType) {
  var result = mapping.getTable().createComputer(mapping);
  result.setContext(anychart.stockModule.math.trix.initContext(opt_period, opt_signalPeriod, opt_maType, opt_signalMaType));
  result.setStartFunction(anychart.stockModule.math.trix.startFunction);
  result.setCalculationFunction(anychart.stockModule.math.trix.calculationFunction);
  result.addOutputField('trix');
  result.addOutputField('signal');
  return result;
};


/**
 * Calculates next TRIX value based on a previous Ma value and current data value.
 * To use this function you need a setup queue with length equal to period.
 * On first calculation pass NaN or nothing as a opt_prevResult.
 * @param {anychart.stockModule.math.trix.Context} context
 * @param {number} value
 * @return {Array}
 */
anychart.stockModule.math.trix.calculate = function(context, value) {
  if (isNaN(value)) {
    return [NaN, NaN];
  }

  context.prevResult = context.thirdMaContext.prevResult;
  var firstMa = context.maCalculate(context.firstMaContext, value);
  var secondMa = context.maCalculate(context.secondMaContext, firstMa);
  var thirdMa = context.maCalculate(context.thirdMaContext, secondMa);
  var trix = ((thirdMa - context.prevResult) / context.prevResult) * 100.0;
  var signal = context.maSignalCalculate(context.signalMaContext, trix);

  return [trix, signal];
};


//exports
goog.exportSymbol('anychart.math.trix.initContext', anychart.stockModule.math.trix.initContext);
goog.exportSymbol('anychart.math.trix.startFunction', anychart.stockModule.math.trix.startFunction);
goog.exportSymbol('anychart.math.trix.calculate', anychart.stockModule.math.trix.calculate);
goog.exportSymbol('anychart.math.trix.calculationFunction', anychart.stockModule.math.trix.calculationFunction);
goog.exportSymbol('anychart.math.trix.createComputer', anychart.stockModule.math.trix.createComputer);
