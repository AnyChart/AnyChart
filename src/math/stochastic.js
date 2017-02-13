goog.provide('anychart.math.stochastic');
goog.require('anychart.math.CycledQueue');
goog.require('anychart.math.ema');
goog.require('anychart.math.sma');
goog.require('anychart.utils');


/**
 * @typedef {{
 *   highQueue: !anychart.math.CycledQueue,
 *   lowQueue: !anychart.math.CycledQueue,
 *   kPeriod: number,
 *   kMAType: anychart.enums.MovingAverageType,
 *   kMAContext: (anychart.math.sma.Context|anychart.math.ema.Context|Object),
 *   kMACalculate: Function,
 *   dMAType: anychart.enums.MovingAverageType,
 *   dMAContext: (anychart.math.sma.Context|anychart.math.ema.Context|Object),
 *   dMACalculate: Function,
 *   dispose: Function
 * }}
 */
anychart.math.stochastic.Context;


/**
 * Creates context for *** indicator calculation.
 * @param {number=} opt_kPeriod [14] Indicator period. Defaults to 14.
 * @param {number=} opt_kMAPeriod [1] Indicator K smoothing period. Defaults to 1.
 * @param {number=} opt_dPeriod [3] Indicator D period. Defaults to 3.
 * @param {anychart.enums.MovingAverageType=} opt_kMAType [SMA] Indicator K smoothing type. Defaults to SMA.
 * @param {anychart.enums.MovingAverageType=} opt_dMAType [SMA] Indicator D smoothing type. Defaults to SMA.
 * @return {anychart.math.stochastic.Context}
 */
anychart.math.stochastic.initContext = function(opt_kPeriod, opt_kMAPeriod, opt_dPeriod, opt_kMAType, opt_dMAType) {
  var kPeriod = anychart.utils.normalizeToNaturalNumber(opt_kPeriod, 14, false);
  var kMAType = anychart.enums.normalizeMovingAverageType(opt_kMAType, anychart.enums.MovingAverageType.SMA);
  var kMAPeriod = anychart.utils.normalizeToNaturalNumber(opt_kMAPeriod, 1, false);

  var dMAType = anychart.enums.normalizeMovingAverageType(opt_dMAType, anychart.enums.MovingAverageType.SMA);
  var dPeriod = anychart.utils.normalizeToNaturalNumber(opt_dPeriod, 3, false);

  var kMAInitContext;
  var kMACalculate;
  if (kMAType == anychart.enums.MovingAverageType.SMA) {
    kMAInitContext = anychart.math.sma.initContext;
    kMACalculate = anychart.math.sma.calculate;
  } else {
    kMAInitContext = anychart.math.ema.initContext;
    kMACalculate = anychart.math.ema.calculate;
  }

  var dMAInitContext;
  var dMACalculate;
  if (dMAType == anychart.enums.MovingAverageType.SMA) {
    dMAInitContext = anychart.math.sma.initContext;
    dMACalculate = anychart.math.sma.calculate;
  } else {
    dMAInitContext = anychart.math.ema.initContext;
    dMACalculate = anychart.math.ema.calculate;
  }

  return {
    highQueue: anychart.math.cycledQueue(kPeriod),
    lowQueue: anychart.math.cycledQueue(kPeriod),
    kPeriod: kPeriod,
    kMAType: kMAType,
    kMAContext: kMAInitContext(kMAPeriod),
    kMACalculate: kMACalculate,
    dMAType: dMAType,
    dMAContext: dMAInitContext(dPeriod),
    dMACalculate: dMACalculate,
    /**
     * @this {anychart.math.stochastic.Context}
     */
    'dispose': function() {
      this.highQueue.clear();
      this.lowQueue.clear();
      this.kMAContext['dispose']();
      this.dMAContext['dispose']();
    }
  };
};


/**
 * Start calculation function for *** indicator calculation.
 * @param {anychart.math.stochastic.Context} context
 * @this {anychart.math.stochastic.Context}
 */
anychart.math.stochastic.startFunction = function(context) {
  context.highQueue.clear();
  context.lowQueue.clear();
  if (context.kMAType === anychart.enums.MovingAverageType.SMA)
    anychart.math.sma.startFunction(/** @type {anychart.math.sma.Context} */ (context.kMAContext));
  else
    anychart.math.ema.startFunction(/** @type {anychart.math.ema.Context} */ (context.kMAContext));

  if (context.dMAType === anychart.enums.MovingAverageType.SMA)
    anychart.math.sma.startFunction(/** @type {anychart.math.sma.Context} */ (context.dMAContext));
  else
    anychart.math.ema.startFunction(/** @type {anychart.math.ema.Context} */ (context.dMAContext));
};


/**
 * Calculates stochastic value.
 * @param {Object} context
 * @param {number} closeValue
 * @param {number} highValue
 * @param {number} lowValue
 * @return {Array.<number>}
 */
anychart.math.stochastic.calculate = function(context, closeValue, highValue, lowValue) {
  if (isNaN(closeValue) || isNaN(highValue) || isNaN(lowValue)) {
    return [NaN, NaN];
  } else {
    var highQueue = context.highQueue;
    var lowQueue = context.lowQueue;
    highQueue.enqueue(highValue);
    lowQueue.enqueue(lowValue);
    /**
     * @type {number}
     */
    var percentK;

    /**
     * @type {number}
     */
    var percentD;

    var min, max, i, high, low;

    if (highQueue.getLength() < context.kPeriod) {
      percentK = NaN;
    } else {
      // init and process calculation are the same
      min = Number.MAX_VALUE;
      max = -Number.MIN_VALUE;
      for (i = 0; i < context.kPeriod; i++) {
        high = highQueue.get(i);
        low = lowQueue.get(i);
        if (max < high)
          max = high;
        if (min > low)
          min = low;
      }
      percentK = 100 * (closeValue - min) / (max - min);
    }

    percentK = context.kMACalculate(context.kMAContext, percentK);
    percentD = context.dMACalculate(context.dMAContext, percentK);
    return [percentK, percentD];
  }
};


/**
 * Calculates ***.
 * @param {anychart.data.TableComputer.RowProxy} row
 * @param {anychart.math.stochastic.Context} context
 * @this {anychart.math.stochastic.Context}
 */
anychart.math.stochastic.calculationFunction = function(row, context) {
  var close = anychart.utils.toNumber(row.get('close'));
  var high = anychart.utils.toNumber(row.get('high'));
  var low = anychart.utils.toNumber(row.get('low'));
  var rv = anychart.math.stochastic.calculate(context, close, high, low);
  var kResult = rv[0];
  var dResult = rv[1];
  row.set('kResult', kResult);
  row.set('dResult', dResult);
};


/**
 * Creates *** computer for the given table mapping.
 * @param {anychart.data.TableMapping} mapping
 * @param {number=} opt_kPeriod [14] Indicator period. Defaults to 14.
 * @param {number=} opt_kMAPeriod [1] Indicator K smoothing period. Defaults to 1.
 * @param {number=} opt_dPeriod [3] Indicator D period. Defaults to 3.
 * @param {anychart.enums.MovingAverageType=} opt_kMAType [SMA] Indicator K smoothing type. Defaults to SMA.
 * @param {anychart.enums.MovingAverageType=} opt_dMAType [SMA] Indicator D smoothing type. Defaults to SMA.
 * @return {anychart.data.TableComputer}
 */
anychart.math.stochastic.createComputer = function(mapping, opt_kPeriod, opt_kMAPeriod, opt_dPeriod, opt_kMAType, opt_dMAType) {
  var result = mapping.getTable().createComputer(mapping);
  result.setContext(anychart.math.stochastic.initContext(opt_kPeriod, opt_kMAPeriod, opt_dPeriod, opt_kMAType, opt_dMAType));
  result.setStartFunction(anychart.math.stochastic.startFunction);
  result.setCalculationFunction(anychart.math.stochastic.calculationFunction);
  result.addOutputField('kResult');
  result.addOutputField('dResult');
  return result;
};


//exports
goog.exportSymbol('anychart.math.stochastic.initContext', anychart.math.stochastic.initContext);
goog.exportSymbol('anychart.math.stochastic.startFunction', anychart.math.stochastic.startFunction);
goog.exportSymbol('anychart.math.stochastic.calculate', anychart.math.stochastic.calculate);
goog.exportSymbol('anychart.math.stochastic.calculationFunction', anychart.math.stochastic.calculationFunction);
goog.exportSymbol('anychart.math.stochastic.createComputer', anychart.math.stochastic.createComputer);
