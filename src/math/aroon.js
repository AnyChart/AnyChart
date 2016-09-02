goog.provide('anychart.math.aroon');
goog.require('anychart.math.CycledQueue');
goog.require('anychart.utils');

/**
 * @namespace {anychart.math.aroon}
 */


/**
 * @typedef {{
 *    highQueue: !anychart.math.CycledQueue,
 *    lowQueue: !anychart.math.CycledQueue,
 *    period: number,
 *    dispose: Function
 * }}
 */
anychart.math.aroon.Context;


/**
 * Creates context for Aroon indicator calculation.
 * @param {number=} opt_period Defaults to 20.
 * @return {anychart.math.aroon.Context}
 */
anychart.math.aroon.initContext = function(opt_period) {
  var period = anychart.utils.normalizeToNaturalNumber(opt_period, 20, false);
  return {
    // we need one item longer queues to correctly calculate the indicator
    highQueue: anychart.math.cycledQueue(period + 1),
    lowQueue: anychart.math.cycledQueue(period + 1),
    period: period,
    /**
     * @this {anychart.math.aroon.Context}
     */
    'dispose': function() {
      this.highQueue.clear();
      this.lowQueue.clear();
    }
  };
};


/**
 * Start calculation function for Aroon indicator calculation.
 * @param {anychart.math.aroon.Context} context
 * @this {anychart.math.aroon.Context}
 */
anychart.math.aroon.startFunction = function(context) {
  context.highQueue.clear();
  context.lowQueue.clear();
};


/**
 * Calculates Aroon.
 * @param {anychart.data.TableComputer.RowProxy} row
 * @param {anychart.math.aroon.Context} context
 * @this {anychart.math.aroon.Context}
 */
anychart.math.aroon.calculationFunction = function(row, context) {
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
 * @param {anychart.data.TableMapping} mapping
 * @param {number=} opt_period
 * @return {anychart.data.TableComputer}
 */
anychart.math.aroon.createComputer = function(mapping, opt_period) {
  var result = mapping.getTable().createComputer(mapping);
  result.setContext(anychart.math.aroon.initContext(opt_period));
  result.setStartFunction(anychart.math.aroon.startFunction);
  result.setCalculationFunction(anychart.math.aroon.calculationFunction);
  result.addOutputField('upResult');
  result.addOutputField('downResult');
  return result;
};


//exports
goog.exportSymbol('anychart.math.aroon.initContext', anychart.math.aroon.initContext);
goog.exportSymbol('anychart.math.aroon.startFunction', anychart.math.aroon.startFunction);
goog.exportSymbol('anychart.math.aroon.calculationFunction', anychart.math.aroon.calculationFunction);
goog.exportSymbol('anychart.math.aroon.createComputer', anychart.math.aroon.createComputer);
