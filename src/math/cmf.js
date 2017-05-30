goog.provide('anychart.math.cmf');
goog.require('anychart.math.CycledQueue');
goog.require('anychart.utils');


/**
 * @typedef {{
 *   mfvQueue: !anychart.math.CycledQueue,
 *   volumeQueue: !anychart.math.CycledQueue,
 *   period: number,
 *   prevMFVSum: number,
 *   prevVolumeSum: number,
 *   dispose: Function
 * }}
 */
anychart.math.cmf.Context;


/**
 * Creates context for CMF indicator calculation.
 * @param {number=} opt_period [20] Indicator period. Defaults to 20.
 * @return {anychart.math.cmf.Context}
 */
anychart.math.cmf.initContext = function(opt_period) {
  var period = anychart.utils.normalizeToNaturalNumber(opt_period, 20, false);
  return {
    mfvQueue: anychart.math.cycledQueue(period),
    volumeQueue: anychart.math.cycledQueue(period),
    period: period,
    prevMFVSum: NaN,
    prevVolumeSum: NaN,
    /**
     * @this {anychart.math.cmf.Context}
     */
    'dispose': function() {
      this.mfvQueue.clear();
      this.volumeQueue.clear();
    }
  };
};


/**
 * Start calculation function for CMF indicator calculation.
 * @param {anychart.math.cmf.Context} context
 * @this {anychart.math.cmf.Context}
 */
anychart.math.cmf.startFunction = function(context) {
  context.mfvQueue.clear();
  context.volumeQueue.clear();
  context.prevMFVSum = NaN;
  context.prevVolumeSum = NaN;
};


/**
 * Calculates CMF value.
 * @param {Object} context
 * @param {number} close
 * @param {number} high
 * @param {number} low
 * @param {number} volume
 * @return {number}
 */
anychart.math.cmf.calculate = function(context, close, high, low, volume) {
  if (isNaN(high) || isNaN(low) || isNaN(close) || isNaN(volume)) {
    return NaN;
  }
  // money flow volume = money flow * volume
  var mfv = (high == low) ? 0 : (((close - low) - (high - close)) * volume / (high - low));
  var dequeuedMFV = context.mfvQueue.enqueue(mfv);
  var dequeuedVolume = context.volumeQueue.enqueue(volume);
  if (context.mfvQueue.getLength() < context.period) {
    return NaN;
  } else {
    if (isNaN(context.prevMFVSum)) {
      // init calculations
      context.prevMFVSum = 0;
      context.prevVolumeSum = 0;
      for (var i = 0; i < context.period; i++) {
        context.prevMFVSum += context.mfvQueue.get(i);
        context.prevVolumeSum += context.volumeQueue.get(i);
      }
    } else {
      // process calculations
      context.prevMFVSum += (context.mfvQueue.get(-1) - dequeuedMFV);
      context.prevVolumeSum += (context.volumeQueue.get(-1) - dequeuedVolume);
    }
    return context.prevMFVSum / context.prevVolumeSum;
  }
};


/**
 * Calculation function for CMF.
 * @param {anychart.data.TableComputer.RowProxy} row
 * @param {anychart.math.cmf.Context} context
 * @this {anychart.math.cmf.Context}
 */
anychart.math.cmf.calculationFunction = function(row, context) {
  var close = anychart.utils.toNumber(row.get('close'));
  var high = anychart.utils.toNumber(row.get('high'));
  var low = anychart.utils.toNumber(row.get('low'));
  var volume = anychart.utils.toNumber(row.get('volume'));
  var rv = anychart.math.cmf.calculate(context, close, high, low, volume);
  row.set('result', rv);
};


/**
 * Creates CMF computer for the given table mapping.
 * @param {anychart.data.TableMapping} mapping
 * @param {number=} opt_period
 * @return {anychart.data.TableComputer}
 */
anychart.math.cmf.createComputer = function(mapping, opt_period) {
  var result = mapping.getTable().createComputer(mapping);
  result.setContext(anychart.math.cmf.initContext(opt_period));
  result.setStartFunction(anychart.math.cmf.startFunction);
  result.setCalculationFunction(anychart.math.cmf.calculationFunction);
  result.addOutputField('result');
  return result;
};


//exports
goog.exportSymbol('anychart.math.cmf.initContext', anychart.math.cmf.initContext);
goog.exportSymbol('anychart.math.cmf.startFunction', anychart.math.cmf.startFunction);
goog.exportSymbol('anychart.math.cmf.calculate', anychart.math.cmf.calculate);
goog.exportSymbol('anychart.math.cmf.calculationFunction', anychart.math.cmf.calculationFunction);
goog.exportSymbol('anychart.math.cmf.createComputer', anychart.math.cmf.createComputer);

