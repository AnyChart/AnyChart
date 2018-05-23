goog.provide('anychart.stockModule.math.keltnerChannels');
goog.require('anychart.stockModule.math.atr');
goog.require('anychart.stockModule.math.ema');
goog.require('anychart.stockModule.math.sma');
goog.require('anychart.utils');


/**
 * @typedef {{
 *    maContext: (anychart.stockModule.math.ema.Context|anychart.stockModule.math.sma.Context),
 *    maCalculate: Function,
 *    atrContext: !anychart.stockModule.math.atr.Context,
 *    multiplier: number,
 *    maPeriod: number,
 *    atrPeriod: number,
 *    maType: !anychart.enums.MovingAverageType,
 *    dispose: Function
 * }}
 */
anychart.stockModule.math.keltnerChannels.Context;


/**
 * Creates context.
 * @param {number=} opt_maPeriod [20] MA period. Defaults to 20.
 * @param {number=} opt_atrPeriod [10] ATR period. Defaults to 10.
 * @param {anychart.enums.MovingAverageType=} opt_maType [EMA] Indicator smoothing type. Defaults to EMA.
 * @param {number=} opt_multiplier [2] Multiplier value.
 * @return {anychart.stockModule.math.keltnerChannels.Context}
 */
anychart.stockModule.math.keltnerChannels.initContext = function(opt_maPeriod, opt_atrPeriod, opt_maType, opt_multiplier) {
  var maPeriod = anychart.utils.normalizeToNaturalNumber(opt_maPeriod, 20, false);
  var atrPeriod = anychart.utils.normalizeToNaturalNumber(opt_atrPeriod, 10, false);
  var multiplier = anychart.utils.normalizeToNaturalNumber(opt_multiplier, 2, false);
  var maType = anychart.enums.normalizeMovingAverageType(opt_maType, anychart.enums.MovingAverageType.EMA);

  var maInitContext;
  var maCalculate;
  if (maType == anychart.enums.MovingAverageType.SMA) {
    maInitContext = anychart.stockModule.math.sma.initContext;
    maCalculate = anychart.stockModule.math.sma.calculate;
  } else {
    maInitContext = anychart.stockModule.math.ema.initContext;
    maCalculate = anychart.stockModule.math.ema.calculate;
  }
  return {
    maContext: maInitContext(maPeriod),
    maCalculate: maCalculate,
    atrContext: anychart.stockModule.math.atr.initContext(atrPeriod),
    multiplier: multiplier,
    maPeriod: maPeriod,
    atrPeriod: atrPeriod,
    maType: maType,
    /**
     * @this {anychart.stockModule.math.keltnerChannels.Context}
     */
    'dispose': function() {
      this.maContext['dispose']();
      this.atrContext['dispose']();
    }
  };
};


/**
 * Start calculation function for Keltner Channels indicator calculation
 * @param {anychart.stockModule.math.keltnerChannels.Context} context
 */
anychart.stockModule.math.keltnerChannels.startFunction = function(context) {
  if (context.maType == anychart.enums.MovingAverageType.SMA) {
    anychart.stockModule.math.sma.startFunction(/** @type {anychart.stockModule.math.sma.Context} */ (context.maContext));
  } else {
    anychart.stockModule.math.ema.startFunction(/** @type {anychart.stockModule.math.sma.Context} */ (context.maContext));
  }
  anychart.stockModule.math.atr.startFunction(context.atrContext);
};


/**
 * Calculates Keltner Channels.
 * @param {anychart.stockModule.data.TableComputer.RowProxy} row
 * @param {anychart.stockModule.math.keltnerChannels.Context} context
 * @this {anychart.stockModule.math.keltnerChannels.Context}
 */
anychart.stockModule.math.keltnerChannels.calculationFunction = function(row, context) {
  var close = anychart.utils.toNumber(row.get('close'));
  var high = anychart.utils.toNumber(row.get('high'));
  var low = anychart.utils.toNumber(row.get('low'));
  var result = anychart.stockModule.math.keltnerChannels.calculate(context, close, high, low);
  row.set('maResult', result[0]);
  row.set('upperResult', result[1]);
  row.set('lowerResult', result[2]);
};


/**
 * Creates Keltner Channel computer for the given table mapping.
 * @param {anychart.stockModule.data.TableMapping} mapping
 * @param {number=} opt_maPeriod
 * @param {number=} opt_atrPeriod
 * @param {anychart.enums.MovingAverageType=} opt_maType Indicator smoothing type. Defaults to EMA.
 * @param {number=} opt_multiplier
 * @return {anychart.stockModule.data.TableComputer}
 */
anychart.stockModule.math.keltnerChannels.createComputer = function(mapping, opt_maPeriod, opt_atrPeriod, opt_maType, opt_multiplier) {
  var result = mapping.getTable().createComputer(mapping);
  result.setContext(anychart.stockModule.math.keltnerChannels.initContext(opt_maPeriod, opt_atrPeriod, opt_maType, opt_multiplier));
  result.setStartFunction(anychart.stockModule.math.keltnerChannels.startFunction);
  result.setCalculationFunction(anychart.stockModule.math.keltnerChannels.calculationFunction);
  result.addOutputField('maResult');
  result.addOutputField('upperResult');
  result.addOutputField('lowerResult');
  return result;
};


/**
 * Calculates ma, upper and lower lines of Keltner Channels.
 * @param {anychart.stockModule.math.keltnerChannels.Context} context
 * @param {number} close
 * @param {number} high
 * @param {number} low
 * @return {Array.<number>}
 */
anychart.stockModule.math.keltnerChannels.calculate = function(context, close, high, low) {
  var hlc3 = (high + low + close) / 3;
  var ma = context.maCalculate(context.maContext, hlc3);
  var atr = anychart.stockModule.math.atr.calculate(context.atrContext, close, high, low);

  return [
    ma,
    ma + (context.multiplier * atr),
    ma - (context.multiplier * atr)
  ];
};


//exports
goog.exportSymbol('anychart.math.keltnerChannels.initContext', anychart.stockModule.math.keltnerChannels.initContext);
goog.exportSymbol('anychart.math.keltnerChannels.startFunction', anychart.stockModule.math.keltnerChannels.startFunction);
goog.exportSymbol('anychart.math.keltnerChannels.calculate', anychart.stockModule.math.keltnerChannels.calculate);
goog.exportSymbol('anychart.math.keltnerChannels.calculationFunction', anychart.stockModule.math.keltnerChannels.calculationFunction);
goog.exportSymbol('anychart.math.keltnerChannels.createComputer', anychart.stockModule.math.keltnerChannels.createComputer);
