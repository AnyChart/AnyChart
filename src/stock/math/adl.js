goog.provide('anychart.stockModule.math.adl');
goog.require('anychart.stockModule.math.CycledQueue');
goog.require('anychart.utils');


/**
 * @typedef {{
 *   highQueue: !anychart.stockModule.math.CycledQueue,
 *   lowQueue: !anychart.stockModule.math.CycledQueue,
 *   closeQueue: !anychart.stockModule.math.CycledQueue,
 *   volumeQueue: !anychart.stockModule.math.CycledQueue,
 *   period: number,
 *   prevResult: number,
 *   dispose: Function
 * }}
 */
anychart.stockModule.math.adl.Context;


/**
 * Creates context for ADL indicator calculation.
 * @return {anychart.stockModule.math.adl.Context}
 */
anychart.stockModule.math.adl.initContext = function() {
  var period = 1;
  return {
    highQueue: anychart.math.cycledQueue(period),
    lowQueue: anychart.math.cycledQueue(period),
    closeQueue: anychart.math.cycledQueue(period),
    volumeQueue: anychart.math.cycledQueue(period),
    period: period,
    prevResult: NaN,
    /**
     * @this {anychart.stockModule.math.adl.Context}
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
 * @param {anychart.stockModule.math.adl.Context} context
 * @this {anychart.stockModule.math.adl.Context}
 */
anychart.stockModule.math.adl.startFunction = function(context) {
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
anychart.stockModule.math.adl.calculate = function(context, close, high, low, volume) {
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
 * @param {anychart.stockModule.data.TableComputer.RowProxy} row
 * @param {anychart.stockModule.math.adl.Context} context
 * @this {anychart.stockModule.math.adl.Context}
 */
anychart.stockModule.math.adl.calculationFunction = function(row, context) {
  var close = anychart.utils.toNumber(row.get('close'));
  var high = anychart.utils.toNumber(row.get('high'));
  var low = anychart.utils.toNumber(row.get('low'));
  var volume = anychart.utils.toNumber(row.get('volume'));
  var rv = anychart.stockModule.math.adl.calculate(context, close, high, low, volume);
  row.set('result', rv);
};


/**
 * Creates ADL computer for the given table mapping.
 * @param {anychart.stockModule.data.TableMapping} mapping
 * @return {anychart.stockModule.data.TableComputer}
 */
anychart.stockModule.math.adl.createComputer = function(mapping) {
  var result = mapping.getTable().createComputer(mapping);
  result.setContext(anychart.stockModule.math.adl.initContext());
  result.setStartFunction(anychart.stockModule.math.adl.startFunction);
  result.setCalculationFunction(anychart.stockModule.math.adl.calculationFunction);
  result.addOutputField('result');
  return result;
};


//exports
goog.exportSymbol('anychart.math.adl.initContext', anychart.stockModule.math.adl.initContext);
goog.exportSymbol('anychart.math.adl.startFunction', anychart.stockModule.math.adl.startFunction);
goog.exportSymbol('anychart.math.adl.calculate', anychart.stockModule.math.adl.calculate);
goog.exportSymbol('anychart.math.adl.calculationFunction', anychart.stockModule.math.adl.calculationFunction);
goog.exportSymbol('anychart.math.adl.createComputer', anychart.stockModule.math.adl.createComputer);
