goog.provide('anychart.math.ama');
goog.require('anychart.math.CycledQueue');
goog.require('anychart.utils');


/**
 * @typedef {{
 *    queue: !anychart.math.CycledQueue,
 *    period: number,
 *    slowPeriod: number,
 *    fastPeriod: number,
 *    prevNoise: number,
 *    prevResult: number,
 *    dispose: Function
 * }}
 */
anychart.math.ama.Context;


/**
 * Creates context for AMA indicator calculation.
 * @param {number=} opt_period Defaults to 20.
 * @param {number=} opt_fastPeriod Defaults to 2.
 * @param {number=} opt_slowPeriod Defaults to 30.
 * @return {anychart.math.ama.Context}
 */
anychart.math.ama.initContext = function(opt_period, opt_fastPeriod, opt_slowPeriod) {
  var period = anychart.utils.normalizeToNaturalNumber(opt_period, 20, false);
  var fastPeriod = anychart.utils.normalizeToNaturalNumber(opt_fastPeriod, 2, false);
  var slowPeriod = anychart.utils.normalizeToNaturalNumber(opt_slowPeriod, 30, false);
  if (fastPeriod > slowPeriod) {
    var tmp = fastPeriod;
    fastPeriod = slowPeriod;
    slowPeriod = tmp;
  }
  return {
    queue: anychart.math.cycledQueue(period + 1),
    period: period,
    slowPeriod: slowPeriod,
    fastPeriod: fastPeriod,
    prevNoise: NaN,
    prevResult: NaN,
    /**
     * @this {anychart.math.ama.Context}
     */
    'dispose': function() {
      this.queue.clear();
    }
  };
};


/**
 * Start calculation function for AMA indicator calculation.
 * @param {anychart.math.ama.Context} context
 * @this {anychart.math.ama.Context}
 */
anychart.math.ama.startFunction = function(context) {
  context.queue.clear();
  context.prevResult = NaN;
};


/**
 * Calculates AMA.
 * @param {anychart.data.TableComputer.RowProxy} row
 * @param {anychart.math.ama.Context} context
 * @this {anychart.math.ama.Context}
 */
anychart.math.ama.calculationFunction = function(row, context) {
  var currValue = anychart.utils.toNumber(row.get('value'));
  var missing = isNaN(currValue);
  var dequeuedValue;
  if (!missing)
    dequeuedValue = context.queue.enqueue(currValue);
  var result, SSC, slowAlpha, fastAlpha, firstValue, lastValue, preLastValue, ER;
  if (missing || context.queue.getLength() <= context.period) {
    result = NaN;
  } else {
    slowAlpha = 2 / (context.slowPeriod + 1);
    fastAlpha = 2 / (context.fastPeriod + 1);
    lastValue = /** @type {number} */(context.queue.get(-1));
    firstValue = /** @type {number} */(context.queue.get(0));
    preLastValue = /** @type {number} */(context.queue.get(-2));
    if (isNaN(context.prevResult) || isNaN(context.prevNoise)) {
      context.prevNoise = 0;
      for (var i = 1; i <= context.period; i++) {
        context.prevNoise += Math.abs(
            /** @type {number} */(context.queue.get(i)) -
            /** @type {number} */(context.queue.get(i - 1)));
      }
      if (context.prevNoise) {
        ER = Math.abs(lastValue - firstValue) / context.prevNoise;
        SSC = ER * (fastAlpha - slowAlpha) + slowAlpha;
      } else {
        SSC = slowAlpha;
      }
      result = preLastValue + SSC * SSC * (lastValue - preLastValue);
    } else { // dequeuedValue is defined here
      context.prevNoise +=
          Math.abs(lastValue - preLastValue) -
          Math.abs(firstValue - /** @type {number} */(dequeuedValue));
      if (context.prevNoise) {
        ER = Math.abs(lastValue - firstValue) / context.prevNoise;
        SSC = ER * (fastAlpha - slowAlpha) + slowAlpha;
      } else {
        SSC = slowAlpha;
      }
      result = context.prevResult + SSC * SSC * (lastValue - context.prevResult);
    }
    context.prevResult = result;
  }
  row.set('result', result);
};


/**
 * Creates AMA computer for the given table mapping.
 * @param {anychart.data.TableMapping} mapping
 * @param {number=} opt_period
 * @param {number=} opt_fastPeriod
 * @param {number=} opt_slowPeriod
 * @return {anychart.data.TableComputer}
 */
anychart.math.ama.createComputer = function(mapping, opt_period, opt_fastPeriod, opt_slowPeriod) {
  var result = mapping.getTable().createComputer(mapping);
  result.setContext(anychart.math.ama.initContext(opt_period, opt_fastPeriod, opt_slowPeriod));
  result.setStartFunction(anychart.math.ama.startFunction);
  result.setCalculationFunction(anychart.math.ama.calculationFunction);
  result.addOutputField('result');
  return result;
};


//exports
goog.exportSymbol('anychart.math.ama.initContext', anychart.math.ama.initContext);
goog.exportSymbol('anychart.math.ama.startFunction', anychart.math.ama.startFunction);
goog.exportSymbol('anychart.math.ama.calculationFunction', anychart.math.ama.calculationFunction);
goog.exportSymbol('anychart.math.ama.createComputer', anychart.math.ama.createComputer);
