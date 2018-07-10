goog.provide('anychart.stockModule.math.ao');
goog.require('anychart.stockModule.math.CycledQueue');
goog.require('anychart.stockModule.math.ema');
goog.require('anychart.stockModule.math.sma');
goog.require('anychart.utils');


/**
 * @typedef {{
 *   fastMAContext: (anychart.stockModule.math.sma.Context|anychart.stockModule.math.ema.Context),
 *   slowMAContext: (anychart.stockModule.math.sma.Context|anychart.stockModule.math.ema.Context),
 *   maCalculate: Function,
 *   maType: anychart.enums.MovingAverageType,
 *   dispose: Function
 * }}
 */
anychart.stockModule.math.ao.Context;


/**
 * Creates context for AO indicator calculation
 * @param {number=} opt_fastPeriod [5] Indicator period. Defaults to 5.
 * @param {number=} opt_slowPeriod [34] Indicator period. Defaults to 34.
 * @param {string=} opt_maType [SMA] Indicator smoothing type. Defaults to SMA.
 * @return {anychart.stockModule.math.ao.Context}
 */
anychart.stockModule.math.ao.initContext = function(opt_fastPeriod, opt_slowPeriod, opt_maType) {
  var fastPeriod = anychart.utils.normalizeToNaturalNumber(opt_fastPeriod, 5, false);
  var slowPeriod = anychart.utils.normalizeToNaturalNumber(opt_slowPeriod, 34, false);
  var maType = anychart.enums.normalizeMovingAverageType(opt_maType, anychart.enums.MovingAverageType.SMA);

  var maContext, maCalculate;

  if (maType == anychart.enums.MovingAverageType.SMA) {
    maContext = anychart.stockModule.math.sma.initContext;
    maCalculate = anychart.stockModule.math.sma.calculate;
  } else {
    maContext = anychart.stockModule.math.ema.initContext;
    maCalculate = anychart.stockModule.math.ema.calculate;
  }

  return {
    fastMAContext: maContext(fastPeriod),
    slowMAContext: maContext(slowPeriod),
    maCalculate: maCalculate,
    maType: maType,
    /**
     * @this {anychart.stockModule.math.ao.Context}
     */
    'dispose': function() {
      this.fastMAContext['dispose']();
      this.slowMAContext['dispose']();
    }
  };

};


/**
 * Start calculation function for AO indicator calculation
 * @param {anychart.stockModule.math.ao.Context} context
 * @this {anychart.stockModule.math.ao.Context}
 */
anychart.stockModule.math.ao.startFunction = function(context) {
  if (context.maType == anychart.enums.MovingAverageType.SMA) {
    anychart.stockModule.math.sma.startFunction(/** @type {anychart.stockModule.math.sma.Context} */ (context.fastMAContext));
    anychart.stockModule.math.sma.startFunction(/** @type {anychart.stockModule.math.sma.Context} */ (context.slowMAContext));
  } else {
    anychart.stockModule.math.ema.startFunction(/** @type {anychart.stockModule.math.ema.Context} */ (context.fastMAContext));
    anychart.stockModule.math.ema.startFunction(/** @type {anychart.stockModule.math.ema.Context} */ (context.slowMAContext));
  }
};


/**
 * Calculates AO value
 * @param {anychart.stockModule.math.ao.Context} context
 * @param {number} high
 * @param {number} low
 * @return {number}
 */
anychart.stockModule.math.ao.calculate = function(context, high, low) {
  if (isNaN(high) || isNaN(low)) {
    return NaN;
  } else {
    var price = /** @type {number} */ ((high + low) / 2);
    var fastMA = /** @type {number} */ (context.maCalculate(context.fastMAContext, price));
    var slowMA = /** @type {number} */ (context.maCalculate(context.slowMAContext, price));
    return fastMA - slowMA;
  }
};


/**
 * Calculation function for AO
 * @param {anychart.stockModule.data.TableComputer.RowProxy} row
 * @param {anychart.stockModule.math.ao.Context} context
 */
anychart.stockModule.math.ao.calculationFunction = function(row, context) {
  var high = anychart.utils.toNumber(row.get('high'));
  var low = anychart.utils.toNumber(row.get('low'));
  var rv = anychart.stockModule.math.ao.calculate(context, high, low);
  row.set('result', rv);
};


/**
 * Creates computer for the given table mapping.
 * @param {anychart.stockModule.data.TableMapping} mapping
 * @param {number=} opt_fastPeriod [5] Indicator period. Defaults to 5
 * @param {number=} opt_slowPeriod [34] Indicator period. Defaults to 34
 * @param {string=} opt_maType [SMA] Indicator smoothing type. Defaults to SMA
 * @return {anychart.stockModule.data.TableComputer}
 */
anychart.stockModule.math.ao.createComputer = function(mapping, opt_fastPeriod, opt_slowPeriod, opt_maType) {
  var result = mapping.getTable().createComputer(mapping);
  result.setContext(anychart.stockModule.math.ao.initContext(opt_fastPeriod, opt_slowPeriod, opt_maType));
  result.setStartFunction(anychart.stockModule.math.ao.startFunction);
  result.setCalculationFunction(anychart.stockModule.math.ao.calculationFunction);
  result.addOutputField('result');
  return result;
};


//exports
goog.exportSymbol('anychart.math.ao.initContext', anychart.stockModule.math.ao.initContext);
goog.exportSymbol('anychart.math.ao.startFunction', anychart.stockModule.math.ao.startFunction);
goog.exportSymbol('anychart.math.ao.calculate', anychart.stockModule.math.ao.calculate);
goog.exportSymbol('anychart.math.ao.calculationFunction', anychart.stockModule.math.ao.calculationFunction);
goog.exportSymbol('anychart.math.ao.createComputer', anychart.stockModule.math.ao.createComputer);
