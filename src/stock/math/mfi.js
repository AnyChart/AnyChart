goog.provide('anychart.stockModule.math.mfi');
goog.require('anychart.stockModule.math.CycledQueue');
goog.require('anychart.utils');


/**
 * @typedef {{
 *   priceQueue: !anychart.stockModule.math.CycledQueue,
 *   volumeQueue: !anychart.stockModule.math.CycledQueue,
 *   period: number,
 *   positiveFlow: number,
 *   negativeFlow: number,
 *   lastValueSign: number,
 *   prevResult: number,
 *   dispose: Function
 * }}
 */
anychart.stockModule.math.mfi.Context;


/**
 * Creates context for mfi indicator calculation.
 * @param {number=} opt_period [10] Indicator period. Defaults to 10.
 * @return {anychart.stockModule.math.mfi.Context}
 */
anychart.stockModule.math.mfi.initContext = function(opt_period) {
  var period = anychart.utils.normalizeToNaturalNumber(opt_period, 10, false);

  return /** @type {anychart.stockModule.math.mfi.Context} */ ({
    priceQueue: anychart.math.cycledQueue(period),
    volumeQueue: anychart.math.cycledQueue(period),
    period: period,
    /**
     * @this {anychart.stockModule.math.mfi.Context}
     */
    'dispose': function() {
      this.priceQueue.clear();
      this.volumeQueue.clear();
    }
  });
};


/**
 * Start calculation function for mfi indicator calculation.
 * @param {anychart.stockModule.math.mfi.Context} context
 * @this {anychart.stockModule.math.mfi.Context}
 */
anychart.stockModule.math.mfi.startFunction = function(context) {
  context.priceQueue.clear();
  context.volumeQueue.clear();
  context.prevResult = NaN;
};


/**
 * mfi calculation.
 * @param {anychart.stockModule.math.mfi.Context} context mfi Context.
 * @param {number} close Current close value.
 * @param {number} high Current high value.
 * @param {number} low Current low value.
 * @param {number} volume Current volume value.
 * @return {number}
 */
anychart.stockModule.math.mfi.calculate = function(context, close, high, low, volume) {
  if (isNaN(close) || isNaN(high) || isNaN(low) || isNaN(volume))
    return NaN;
  var dequeuedPrice = /** @type {number} */(context.priceQueue.enqueue(close + high + low));
  var dequeuedVolume = /** @type {number} */(context.volumeQueue.enqueue(volume));
  var result;
  var prevPrice;
  var price;
  var flowDiff;
  var priceQueue = context.priceQueue;
  var volumeQueue = context.volumeQueue;

  if (priceQueue.getLength() < context.period) {
    return NaN;
  } else if (isNaN(context.prevResult)) {
    // init calculations
    var positiveFlow = 0;
    var negativeFlow = 0;

    price = 0;
    prevPrice = /** @type {number} */(priceQueue.get(0));

    for (var i = 1; i < context.period; i++) {
      price = /** @type {number} */(priceQueue.get(i));
      flowDiff = price * /** @type {number} */(volumeQueue.get(i));
      if (price == prevPrice)
        continue;
      if (price > prevPrice) {
        positiveFlow += flowDiff;
      } else {
        negativeFlow += flowDiff;
      }
      prevPrice = price;
    }

    context.lastValueSign = 0;
    context.positiveFlow = positiveFlow;
    context.negativeFlow = negativeFlow;

    result = 100 * positiveFlow / (positiveFlow + negativeFlow);
  } else {
    // process calculation
    var moneyFlow = dequeuedPrice * dequeuedVolume;

    if (context.lastValueSign > 0) {
      context.positiveFlow -= moneyFlow;
    } else if (context.lastValueSign < 0) {
      context.negativeFlow -= moneyFlow;
    }

    prevPrice = /** @type {number} */(priceQueue.get(-2));
    price = /** @type {number} */(priceQueue.get(-1));

    flowDiff = price * /** @type {number} */(volumeQueue.get(-1));

    if (price > prevPrice) {
      context.positiveFlow += flowDiff;
    } else if (price < prevPrice) {
      context.negativeFlow += flowDiff;
    }

    context.lastValueSign = /** @type {number} */(priceQueue.get(0)) - dequeuedPrice;

    result = 100 * context.positiveFlow / (context.positiveFlow + context.negativeFlow);

  }

  context.prevResult = result;
  return result;
};


/**
 * Calculates mfi.
 * @param {anychart.stockModule.data.TableComputer.RowProxy} row
 * @param {anychart.stockModule.math.mfi.Context} context
 * @this {anychart.stockModule.math.mfi.Context}
 */
anychart.stockModule.math.mfi.calculationFunction = function(row, context) {
  var close = anychart.utils.toNumber(row.get('close'));
  var high = anychart.utils.toNumber(row.get('high'));
  var low = anychart.utils.toNumber(row.get('low'));
  var volume = anychart.utils.toNumber(row.get('volume'));
  var rv = anychart.stockModule.math.mfi.calculate(context, close, high, low, volume);
  row.set('result', rv);
};


/**
 * Creates mfi computer for the given table mapping.
 * @param {anychart.stockModule.data.TableMapping} mapping
 * @param {number=} opt_period [14] Indicator period. Defaults to 14.
 * @return {anychart.stockModule.data.TableComputer}
 */
anychart.stockModule.math.mfi.createComputer = function(mapping, opt_period) {
  var result = mapping.getTable().createComputer(mapping);
  result.setContext(anychart.stockModule.math.mfi.initContext(opt_period));
  result.setStartFunction(anychart.stockModule.math.mfi.startFunction);
  result.setCalculationFunction(anychart.stockModule.math.mfi.calculationFunction);
  result.addOutputField('result');
  return result;
};


//exports
goog.exportSymbol('anychart.math.mfi.initContext', anychart.stockModule.math.mfi.initContext);
goog.exportSymbol('anychart.math.mfi.startFunction', anychart.stockModule.math.mfi.startFunction);
goog.exportSymbol('anychart.math.mfi.calculate', anychart.stockModule.math.mfi.calculate);
goog.exportSymbol('anychart.math.mfi.calculationFunction', anychart.stockModule.math.mfi.calculationFunction);
goog.exportSymbol('anychart.math.mfi.createComputer', anychart.stockModule.math.mfi.createComputer);
