goog.provide('anychart.stockModule.math.env');
goog.require('anychart.stockModule.math.ema');
goog.require('anychart.stockModule.math.sma');
goog.require('anychart.utils');


/**
 * @typedef {{
 *   period: number,
 *   deviation: number,
 *   maType: anychart.enums.MovingAverageType,
 *   maContext: (anychart.stockModule.math.ema.Context|anychart.stockModule.math.sma.Context),
 *   maCalculate: Function,
 *   dispose: Function
 * }}
 */
anychart.stockModule.math.env.Context;


/**
 * Creates context for Envelope indicator calculation.
 * @param {number=} opt_period [20] Indicator period. Defaults to 20.
 * @param {number=} opt_deviation [10] Indicator deviation in percents. Defaults to 10.
 * @param {anychart.enums.MovingAverageType=} opt_maType [EMA] Indicator basis smoothing type. Defaults to EMA.
 * @return {anychart.stockModule.math.env.Context}
 */
anychart.stockModule.math.env.initContext = function(opt_period, opt_deviation, opt_maType) {
  var period = anychart.utils.normalizeToNaturalNumber(opt_period, 20, false);
  var deviation = anychart.utils.normalizeToNaturalNumber(opt_deviation, 10, false);
  var maType = anychart.enums.normalizeMovingAverageType(opt_maType, anychart.enums.MovingAverageType.EMA);

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
    period: period,
    deviation: deviation,
    maType: maType,
    maContext: maInitContext(period),
    maCalculate: maCalculate,
    /**
     * @this {anychart.stockModule.math.env.Context}
     */
    'dispose': function() {
      this.maContext['dispose']();
    }
  };
};


/**
 * Start calculation function for ENV indicator calculation.
 * @param {anychart.stockModule.math.env.Context} context
 * @this {anychart.stockModule.math.env.Context}
 */
anychart.stockModule.math.env.startFunction = function(context) {
  if (context.maType == anychart.enums.MovingAverageType.EMA) {
    anychart.stockModule.math.ema.startFunction(/** @type {anychart.stockModule.math.ema.Context} */ (context.maContext));
  } else {
    anychart.stockModule.math.sma.startFunction(/** @type {anychart.stockModule.math.sma.Context} */ (context.maContext));
  }};


/**
 * ENV calculation.
 * @param {anychart.stockModule.math.env.Context} context ENV Context.
 * @param {number} value Current value.
 * @return {Array.<number>}
 */
anychart.stockModule.math.env.calculate = function(context, value) {
  if (isNaN(value))
    return [NaN, NaN];

  var ma = context.maCalculate(context.maContext, value);

  // cast deviation to percents
  var upper = ma * (1 + context.deviation / 100);
  var lower = ma * (1 - context.deviation / 100);
  return [upper, lower];
};


/**
 * Calculates ENV.
 * @param {anychart.stockModule.data.TableComputer.RowProxy} row
 * @param {anychart.stockModule.math.env.Context} context
 * @this {anychart.stockModule.math.env.Context}
 */
anychart.stockModule.math.env.calculationFunction = function(row, context) {
  var value = row.get('value');
  value = goog.isDef(value) ? value : row.get('close');
  value = anychart.utils.toNumber(value);
  var result = anychart.stockModule.math.env.calculate(context, value);
  row.set('upperResult', result[0]);
  row.set('lowerResult', result[1]);
};


/**
 * Creates ENV computer for the given table mapping.
 * @param {anychart.stockModule.data.TableMapping} mapping
 * @param {number=} opt_period [20] Indicator period. Defaults to 20.
 * @param {number=} opt_deviation [10] Indicator deviation in percents. Defaults to 10.
 * @param {anychart.enums.MovingAverageType=} opt_maType [EMA] Indicator basis smoothing type. Defaults to EMA.
 * @return {anychart.stockModule.data.TableComputer}
 */
anychart.stockModule.math.env.createComputer = function(mapping, opt_period, opt_deviation, opt_maType) {
  var result = mapping.getTable().createComputer(mapping);
  result.setContext(anychart.stockModule.math.env.initContext(opt_period, opt_deviation, opt_maType));
  result.setStartFunction(anychart.stockModule.math.env.startFunction);
  result.setCalculationFunction(anychart.stockModule.math.env.calculationFunction);
  result.addOutputField('upperResult');
  result.addOutputField('lowerResult');
  return result;
};


//exports
goog.exportSymbol('anychart.math.env.initContext', anychart.stockModule.math.env.initContext);
goog.exportSymbol('anychart.math.env.startFunction', anychart.stockModule.math.env.startFunction);
goog.exportSymbol('anychart.math.env.calculate', anychart.stockModule.math.env.calculate);
goog.exportSymbol('anychart.math.env.calculationFunction', anychart.stockModule.math.env.calculationFunction);
goog.exportSymbol('anychart.math.env.createComputer', anychart.stockModule.math.env.createComputer);
