goog.provide('anychart.stockModule.math.psar');
goog.require('anychart.stockModule.math.CycledQueue');
goog.require('anychart.utils');


/**
 * @typedef {{
 *   highQueue: !anychart.stockModule.math.CycledQueue,
 *   lowQueue: !anychart.stockModule.math.CycledQueue,
 *   prevResult: number,
 *   currentUpTrendEP: number,
 *   currentDownTrendEP: number,
 *   isUptrend: boolean,
 *   alpha: number,
 *   alphaStart: number,
 *   alphaIncrement: number,
 *   alphaMax: number,
 *   dequeuedHigh: number,
 *   dequeuedLow: number,
 *   dispose: Function
 * }}
 */
anychart.stockModule.math.psar.Context;


/**
 * Creates context for psar indicator calculation.
 * @param {number=} opt_accelerationFactorStart [0.02] Indicator's alpha start value. Defaults to 0.02.
 * @param {number=} opt_accelerationFactorIncrement [0.02] Indicator's increment alpha value. Defaults to 0.2.
 * @param {number=} opt_accelerationFactorMaximum [0.2] Indicator's maximum alpha value. Defaults to 0.2.
 * @return {anychart.stockModule.math.psar.Context}
 */
anychart.stockModule.math.psar.initContext = function(opt_accelerationFactorStart, opt_accelerationFactorIncrement, opt_accelerationFactorMaximum) {
  var accStart = anychart.utils.toNumber(opt_accelerationFactorStart) || 0.02;
  var accInc = anychart.utils.toNumber(opt_accelerationFactorIncrement) || 0.02;
  var accMax = anychart.utils.toNumber(opt_accelerationFactorMaximum) || 0.2;

  return /** @type {anychart.stockModule.math.psar.Context} */ ({
    highQueue: anychart.math.cycledQueue(2),
    lowQueue: anychart.math.cycledQueue(2),

    alphaStart: accStart,
    alphaIncrement: accInc,
    alphaMax: accMax,
    /**
     * @this {anychart.stockModule.math.psar.Context}
     */
    'dispose': function() {
      this.highQueue.clear();
      this.lowQueue.clear();
    }
  });
};


/**
 * Start calculation function for psar indicator calculation.
 * @param {anychart.stockModule.math.psar.Context} context
 * @this {anychart.stockModule.math.psar.Context}
 */
anychart.stockModule.math.psar.startFunction = function(context) {
  context.highQueue.clear();
  context.lowQueue.clear();
  context.prevResult = NaN;
  context.currentUpTrendEP = NaN;
  context.currentDownTrendEP = NaN;
  context.alpha = context.alphaStart;
};


/**
 * @param {anychart.stockModule.math.psar.Context} context psar Context.
 */
anychart.stockModule.math.psar.incAlpha = function(context) {
  context.alpha += context.alphaIncrement;
  if (context.alpha > context.alphaMax)
    context.alpha = context.alphaMax;
};


/**
 * @param {anychart.stockModule.math.psar.Context} context psar Context.
 */
anychart.stockModule.math.psar.checkUpTrend = function(context) {
  var newSAR = context.prevResult + context.alpha * (context.currentUpTrendEP - context.prevResult);
  if (newSAR > /** @type {number} */(context.lowQueue.get(-2))) {
    newSAR = /** @type {number} */(context.lowQueue.get(-2));
  } else if (!isNaN(context.dequeuedLow) && newSAR > context.dequeuedLow) { // not NaN checking shows that we are processing calculations
    newSAR = context.dequeuedLow;
  }

  if (newSAR > /** @type {number} */(context.lowQueue.get(-1))) {
    newSAR = context.currentUpTrendEP;
    context.currentUpTrendEP = NaN;
    context.currentDownTrendEP = NaN;
    context.isUptrend = false;
    context.alpha = context.alphaStart;
  }

  context.prevResult = newSAR;
};


/**
 * @param {anychart.stockModule.math.psar.Context} context psar Context.
 */
anychart.stockModule.math.psar.checkDownTrend = function(context) {
  var newSAR = context.prevResult + context.alpha * (context.currentDownTrendEP - context.prevResult);
  if (newSAR < /** @type {number} */(context.highQueue.get(-2))) {
    newSAR = /** @type {number} */(context.highQueue.get(-2));
  } else if (!isNaN(context.dequeuedHigh) && newSAR < context.dequeuedHigh) { // not NaN checking shows that we are processing calculations
    newSAR = context.dequeuedHigh;
  }

  if (newSAR < /** @type {number} */(context.highQueue.get(-1))) {
    newSAR = context.currentDownTrendEP;
    context.currentUpTrendEP = NaN;
    context.currentDownTrendEP = NaN;
    context.isUptrend = true;
    context.alpha = context.alphaStart;
  }

  context.prevResult = newSAR;
};


/**
 * @param {anychart.stockModule.math.psar.Context} context psar Context.
 */
anychart.stockModule.math.psar.calculateUpTrendEP = function(context) {
  var high = /** @type {number} */(context.highQueue.get(-2));
  var low = /** @type {number} */(context.lowQueue.get(-2));
  if (isNaN(context.currentUpTrendEP)) {
    context.currentUpTrendEP = high;
  } else if (context.currentUpTrendEP < high) {
    context.currentUpTrendEP = high;
    anychart.stockModule.math.psar.incAlpha(context);
  }

  if (isNaN(context.currentDownTrendEP) || (context.currentDownTrendEP > low)) {
    context.currentDownTrendEP = low;
  }
};


/**
 * @param {anychart.stockModule.math.psar.Context} context psar Context.
 */
anychart.stockModule.math.psar.calculateDownTrendEP = function(context) {
  var high = /** @type {number} */(context.highQueue.get(-2));
  var low = /** @type {number} */(context.lowQueue.get(-2));
  if (isNaN(context.currentDownTrendEP)) {
    context.currentDownTrendEP = low;
  } else if (context.currentDownTrendEP > low) {
    context.currentDownTrendEP = low;
    anychart.stockModule.math.psar.incAlpha(context);
  }

  if (isNaN(context.currentUpTrendEP) || (context.currentUpTrendEP < high)) {
    context.currentUpTrendEP = high;
  }
};


/**
 * psar calculation.
 * @param {anychart.stockModule.math.psar.Context} context psar Context.
 * @param {number} high Current high value.
 * @param {number} low Current low value.
 * @return {number}
 */
anychart.stockModule.math.psar.calculate = function(context, high, low) {
  if (isNaN(high) || isNaN(low))
    return NaN;
  var dequeuedHigh = context.dequeuedHigh = /** @type {number} */(context.highQueue.enqueue(high));
  context.dequeuedLow = /** @type {number} */(context.lowQueue.enqueue(low));
  if (context.highQueue.getLength() < 2) {
    return NaN;
  } else if (isNaN(context.prevResult)) {
    // init calculations
    context.currentUpTrendEP = NaN;
    context.currentDownTrendEP = NaN;
    context.isUptrend = (dequeuedHigh <= /** @type {number} */(context.highQueue.get(0)));

    if (context.isUptrend) {
      anychart.stockModule.math.psar.calculateUpTrendEP(context);
      context.prevResult = context.currentUpTrendEP;
      anychart.stockModule.math.psar.checkUpTrend(context);
    } else {
      anychart.stockModule.math.psar.calculateDownTrendEP(context);
      context.prevResult = context.currentDownTrendEP;
      anychart.stockModule.math.psar.checkDownTrend(context);
    }
  } else {
    // process calculations
    if (context.isUptrend) {
      anychart.stockModule.math.psar.calculateUpTrendEP(context);
      anychart.stockModule.math.psar.checkUpTrend(context);
    } else {
      anychart.stockModule.math.psar.calculateDownTrendEP(context);
      anychart.stockModule.math.psar.checkDownTrend(context);
    }
  }
  return context.prevResult;
};


/**
 * Calculates psar.
 * @param {anychart.stockModule.data.TableComputer.RowProxy} row
 * @param {anychart.stockModule.math.psar.Context} context
 * @this {anychart.stockModule.math.psar.Context}
 */
anychart.stockModule.math.psar.calculationFunction = function(row, context) {
  var high = anychart.utils.toNumber(row.get('high'));
  var low = anychart.utils.toNumber(row.get('low'));
  var rv = anychart.stockModule.math.psar.calculate(context, high, low);
  row.set('result', rv);
};


/**
 * Creates psar computer for the given table mapping.
 * @param {anychart.stockModule.data.TableMapping} mapping
 * @param {number=} opt_accelerationFactorStart [0.02] Indicator's alpha start value. Defaults to 0.02.
 * @param {number=} opt_accelerationFactorIncrement [0.02] Indicator's increment alpha value. Defaults to 0.2.
 * @param {number=} opt_accelerationFactorMaximum [0.2] Indicator's maximum alpha value. Defaults to 0.2.
 * @return {anychart.stockModule.data.TableComputer}
 */
anychart.stockModule.math.psar.createComputer = function(mapping, opt_accelerationFactorStart, opt_accelerationFactorIncrement, opt_accelerationFactorMaximum) {
  var result = mapping.getTable().createComputer(mapping);
  result.setContext(anychart.stockModule.math.psar.initContext(opt_accelerationFactorStart, opt_accelerationFactorIncrement, opt_accelerationFactorMaximum));
  result.setStartFunction(anychart.stockModule.math.psar.startFunction);
  result.setCalculationFunction(anychart.stockModule.math.psar.calculationFunction);
  result.addOutputField('result');
  return result;
};


//exports
goog.exportSymbol('anychart.math.psar.initContext', anychart.stockModule.math.psar.initContext);
goog.exportSymbol('anychart.math.psar.startFunction', anychart.stockModule.math.psar.startFunction);
goog.exportSymbol('anychart.math.psar.calculate', anychart.stockModule.math.psar.calculate);
goog.exportSymbol('anychart.math.psar.calculationFunction', anychart.stockModule.math.psar.calculationFunction);
goog.exportSymbol('anychart.math.psar.createComputer', anychart.stockModule.math.psar.createComputer);
