goog.provide('anychart.stockModule.math.volumeMA');
goog.require('anychart.stockModule.math.ema');
goog.require('anychart.stockModule.math.sma');
goog.require('anychart.utils');


/**
 * @typedef {{
 *   maPeriod: number,
 *   maType: anychart.enums.MovingAverageType,
 *   maContext: (anychart.stockModule.math.sma.Context|anychart.stockModule.math.ema.Context),
 *   maCalculate: Function,
 *   dispose: Function
 * }}
 */
anychart.stockModule.math.volumeMA.Context;


/**
 * Creates context for Volume+MA indicator calculation.
 * @param {number=} opt_maPeriod
 * @param {anychart.enums.MovingAverageType=} opt_maType defaults to SMA
 * @return {anychart.stockModule.math.volumeMA.Context}
 */
anychart.stockModule.math.volumeMA.initContext = function(opt_maPeriod, opt_maType) {
  var maPeriod = anychart.utils.normalizeToNaturalNumber(opt_maPeriod, 20, false);
  var maType = anychart.enums.normalizeMovingAverageType(opt_maType, anychart.enums.MovingAverageType.SMA);

  var maInitContext;
  var maCalculate;
  if (maType == anychart.enums.MovingAverageType.EMA) {
    maInitContext = anychart.stockModule.math.ema.initContext;
    maCalculate = anychart.stockModule.math.ema.calculate;
  } else {
    maInitContext = anychart.stockModule.math.sma.initContext;
    maCalculate = anychart.stockModule.math.sma.calculate;
  }

  return {
    maPeriod: maPeriod,
    maType: maType,
    maContext: maInitContext(maPeriod),
    maCalculate: maCalculate,
    /**
     * @this {anychart.stockModule.math.volumeMA.Context}
     */
    'dispose': function() {
      this.maContext['dispose']();
    }
  };
};


/**
 * Start calculation function for Volume+MA indicator calculation.
 * @param {anychart.stockModule.math.volumeMA.Context} context
 * @this {anychart.stockModule.math.volumeMA.Context}
 */
anychart.stockModule.math.volumeMA.startFunction = function(context) {
  if (context.maType == anychart.enums.MovingAverageType.EMA) {
    anychart.stockModule.math.ema.startFunction(/** @type {anychart.stockModule.math.ema.Context} */ (context.maContext));
  } else {
    anychart.stockModule.math.sma.startFunction(/** @type {anychart.stockModule.math.sma.Context} */ (context.maContext));
  }
};


/**
 * Calculates Moving Average over Volume.
 * @param {anychart.stockModule.math.volumeMA.Context} context
 * @param {number} volumeValue
 * @return {Array.<number>}
 */
anychart.stockModule.math.volumeMA.calculate = function(context, volumeValue) {
  if (isNaN(volumeValue)) {
    return [NaN, NaN];
  } else {
    var maResult = context.maCalculate(context.maContext, volumeValue);
    return [volumeValue, maResult];
  }
};


/**
 * Calculate Volume+MA.
 * @param {anychart.stockModule.data.TableComputer.RowProxy} row
 * @param {anychart.stockModule.math.volumeMA.Context} context
 * @this {anychart.stockModule.math.volumeMA.Context}
 */
anychart.stockModule.math.volumeMA.calculationFunction = function(row, context) {
  var volume = anychart.utils.toNumber(row.get('volume'));
  var result = anychart.stockModule.math.volumeMA.calculate(context, volume);
  row.set('volumeResult', result[0]);
  row.set('maResult', result[1]);
};


/**
 * Creates Volume+MA computer for the given table mapping.
 * @param {anychart.stockModule.data.TableMapping} mapping
 * @param {number=} opt_maPeriod
 * @param {anychart.enums.MovingAverageType=} opt_maType
 * @return {anychart.stockModule.data.TableComputer}
 */
anychart.stockModule.math.volumeMA.createComputer = function(mapping, opt_maPeriod, opt_maType) {
  var result = mapping.getTable().createComputer(mapping);
  result.setContext(anychart.stockModule.math.volumeMA.initContext(opt_maPeriod, opt_maType));
  result.setStartFunction(anychart.stockModule.math.volumeMA.startFunction);
  result.setCalculationFunction(anychart.stockModule.math.volumeMA.calculationFunction);
  result.addOutputField('volumeResult');
  result.addOutputField('maResult');
  return result;
};

//exports
goog.exportSymbol('anychart.math.volumeMA.initContext', anychart.stockModule.math.volumeMA.initContext);
goog.exportSymbol('anychart.math.volumeMA.startFunction', anychart.stockModule.math.volumeMA.startFunction);
goog.exportSymbol('anychart.math.volumeMA.calculate', anychart.stockModule.math.volumeMA.calculate);
goog.exportSymbol('anychart.math.volumeMA.calculationFunction', anychart.stockModule.math.volumeMA.calculationFunction);
goog.exportSymbol('anychart.math.volumeMA.createComputer', anychart.stockModule.math.volumeMA.createComputer);
