goog.provide('anychart.stockModule.math.aroon');
goog.require('anychart.stockModule.math.CycledQueue');
goog.require('anychart.utils');

/**
 * @namespace {anychart.stockModule.math.aroon}
 */


/**
 * @typedef {{
 *    highQueue: !anychart.stockModule.math.CycledQueue,
 *    lowQueue: !anychart.stockModule.math.CycledQueue,
 *    period: number,
 *    dispose: Function
 * }}
 */
anychart.stockModule.math.aroon.Context;


/**
 * Creates context for Aroon indicator calculation.
 * @param {number=} opt_period Defaults to 20.
 * @return {anychart.stockModule.math.aroon.Context}
 */
anychart.stockModule.math.aroon.initContext = function(opt_period) {
  var period = anychart.utils.normalizeToNaturalNumber(opt_period, 20, false);
  return {
    // we need one item longer queues to correctly calculate the indicator
    highQueue: anychart.math.cycledQueue(period + 1),
    lowQueue: anychart.math.cycledQueue(period + 1),
    period: period,
    /**
     * @this {anychart.stockModule.math.aroon.Context}
     */
    'dispose': function() {
      this.highQueue.clear();
      this.lowQueue.clear();
    }
  };
};


/**
 * Start calculation function for Aroon indicator calculation.
 * @param {anychart.stockModule.math.aroon.Context} context
 * @this {anychart.stockModule.math.aroon.Context}
 */
anychart.stockModule.math.aroon.startFunction = function(context) {
  context.highQueue.clear();
  context.lowQueue.clear();
};


/**
 * Calculates Aroon.
 * @param {anychart.stockModule.data.TableComputer.RowProxy} row
 * @param {anychart.stockModule.math.aroon.Context} context
 * @this {anychart.stockModule.math.aroon.Context}
 */
anychart.stockModule.math.aroon.calculationFunction = function(row, context) {
  var currHigh = anychart.utils.toNumber(row.get('high'));
  var currLow = anychart.utils.toNumber(row.get('low'));
  var missing = isNaN(currHigh) || isNaN(currLow);
  if (!missing) {
    context.highQueue.enqueue(currHigh);
    context.lowQueue.enqueue(currLow);
  }
  /** @type {number} */
  var upResult;
  /** @type {number} */
  var downResult;
  var queueLength = context.highQueue.getLength();
  // period should be one less than the queue lengths to start math
  if (missing || queueLength <= context.period) {
    upResult = NaN;
    downResult = NaN;
  } else {
    var i, val;
    var extremumI = 0;
    var extremum = /** @type {number} */(context.highQueue.get(0));
    for (i = 1; i < queueLength; i++) {
      val = /** @type {number} */(context.highQueue.get(i));
      if (val >= extremum) {
        extremum = val;
        extremumI = i;
      }
    }
    upResult = extremumI * 100 / context.period;

    extremumI = 0;
    extremum = /** @type {number} */(context.lowQueue.get(0));
    for (i = 1; i < queueLength; i++) {
      val = /** @type {number} */(context.lowQueue.get(i));
      if (val <= extremum) {
        extremum = val;
        extremumI = i;
      }
    }
    downResult = extremumI * 100 / context.period;
  }
  row.set('upResult', upResult);
  row.set('downResult', downResult);
};


/**
 * Creates Aroon computer for the given table mapping.
 * @param {anychart.stockModule.data.TableMapping} mapping
 * @param {number=} opt_period
 * @return {anychart.stockModule.data.TableComputer}
 */
anychart.stockModule.math.aroon.createComputer = function(mapping, opt_period) {
  var result = mapping.getTable().createComputer(mapping);
  result.setContext(anychart.stockModule.math.aroon.initContext(opt_period));
  result.setStartFunction(anychart.stockModule.math.aroon.startFunction);
  result.setCalculationFunction(anychart.stockModule.math.aroon.calculationFunction);
  result.addOutputField('upResult');
  result.addOutputField('downResult');
  return result;
};


//exports
goog.exportSymbol('anychart.math.aroon.initContext', anychart.stockModule.math.aroon.initContext);
goog.exportSymbol('anychart.math.aroon.startFunction', anychart.stockModule.math.aroon.startFunction);
goog.exportSymbol('anychart.math.aroon.calculationFunction', anychart.stockModule.math.aroon.calculationFunction);
goog.exportSymbol('anychart.math.aroon.createComputer', anychart.stockModule.math.aroon.createComputer);
