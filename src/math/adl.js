goog.provide('anychart.math.adl');
goog.require('anychart.math.CycledQueue');
goog.require('anychart.utils');


/**
 * @typedef {{
 *   highQueue: !anychart.math.CycledQueue,
 *   lowQueue: !anychart.math.CycledQueue,
 *   closeQueue: !anychart.math.CycledQueue,
 *   volumeQueue: !anychart.math.CycledQueue,
 *   period: number,
 *   prevResult: number,
 *   dispose: Function
 * }}
 */
anychart.math.adl.Context;


/**
 * Creates context for ADL indicator calculation.
 * @return {anychart.math.adl.Context}
 */
anychart.math.adl.initContext = function() {
  var period = 1;
  return {
    highQueue: anychart.math.cycledQueue(period),
    lowQueue: anychart.math.cycledQueue(period),
    closeQueue: anychart.math.cycledQueue(period),
    volumeQueue: anychart.math.cycledQueue(period),
    period: period,
    prevResult: NaN,
    /**
     * @this {anychart.math.adl.Context}
     */
    'dispose': function() {
      this.highQueue.clear();
      this.lowQueue.clear();
      this.closeQueue.clear();
      this.volumeQueue.clear();
    }
  };
};


/**
 * Start calculation function for ADL indicator calculation.
 * @param {anychart.math.adl.Context} context
 * @this {anychart.math.adl.Context}
 */
anychart.math.adl.startFunction = function(context) {
  context.highQueue.clear();
  context.lowQueue.clear();
  context.closeQueue.clear();
  context.volumeQueue.clear();
  context.prevResult = NaN;
};


/**
 * Calculates ADL value.
 * @param {Object} context
 * @param {number} close
 * @param {number} high
 * @param {number} low
 * @param {number} volume
 * @return {number}
 */
anychart.math.adl.calculate = function(context, close, high, low, volume) {
  if (isNaN(high) || isNaN(low) || isNaN(close) || isNaN(volume)) {
    return NaN;
  } else {
    context.highQueue.enqueue(high);
    context.lowQueue.enqueue(low);
    context.closeQueue.enqueue(close);
    context.volumeQueue.enqueue(volume);
    var h, l, c, clv, v, result;
    if (context.closeQueue.getLength() < context.period) {
      return NaN;
    } else {
      h = context.highQueue.get(0);
      l = context.lowQueue.get(0);
      c = context.closeQueue.get(0);
      clv = ((c - l) - (h - c)) / (h - l);
      v = context.volumeQueue.get(0);

      if (isNaN(context.prevResult)) {
        // init calculation
        if (!(h - l))
          result = 0;
        else
          result = clv * v;
      } else {
        // process calculation
        if (h - l)
          result = context.prevResult + clv * v;
      }
    }
  }
  context.prevResult = result;
  return result;
};


/**
 * Calculation function for ADL.
 * @param {anychart.data.TableComputer.RowProxy} row
 * @param {anychart.math.adl.Context} context
 * @this {anychart.math.adl.Context}
 */
anychart.math.adl.calculationFunction = function(row, context) {
  var close = anychart.utils.toNumber(row.get('close'));
  var high = anychart.utils.toNumber(row.get('high'));
  var low = anychart.utils.toNumber(row.get('low'));
  var volume = anychart.utils.toNumber(row.get('volume'));
  var rv = anychart.math.adl.calculate(context, close, high, low, volume);
  row.set('result', rv);
};


/**
 * Creates ADL computer for the given table mapping.
 * @param {anychart.data.TableMapping} mapping
 * @return {anychart.data.TableComputer}
 */
anychart.math.adl.createComputer = function(mapping) {
  var result = mapping.getTable().createComputer(mapping);
  result.setContext(anychart.math.adl.initContext());
  result.setStartFunction(anychart.math.adl.startFunction);
  result.setCalculationFunction(anychart.math.adl.calculationFunction);
  result.addOutputField('result');
  return result;
};


//exports
goog.exportSymbol('anychart.math.adl.initContext', anychart.math.adl.initContext);
goog.exportSymbol('anychart.math.adl.startFunction', anychart.math.adl.startFunction);
goog.exportSymbol('anychart.math.adl.calculate', anychart.math.adl.calculate);
goog.exportSymbol('anychart.math.adl.calculationFunction', anychart.math.adl.calculationFunction);
goog.exportSymbol('anychart.math.adl.createComputer', anychart.math.adl.createComputer);
