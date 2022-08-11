goog.provide('anychart.stockModule.math.rsi');
goog.require('anychart.stockModule.math.CycledQueue');
goog.require('anychart.utils');


/**
 * @typedef {{
 *    queue: !anychart.stockModule.math.CycledQueue,
 *    period: number,
 *    upwardChange: number,
 *    downwardChange: number,
 *    dispose: Function
 * }}
 */
anychart.stockModule.math.rsi.Context;


/**
 * Creates context for RSI indicator calculation.
 * @param {number=} opt_period Defaults to 10.
 * @return {anychart.stockModule.math.rsi.Context}
 */
anychart.stockModule.math.rsi.initContext = function(opt_period) {
  var period = anychart.utils.normalizeToNaturalNumber(opt_period, 14, false);
  return {
    queue: anychart.math.cycledQueue(period + 1),
    period: period,
    upwardChange: NaN,
    downwardChange: NaN,
    /**
     * @this {anychart.stockModule.math.rsi.Context}
     */
    'dispose': function() {
      this.queue.clear();
    }
  };
};


/**
 * Start calculation function for RSI indicator calculation.
 * @param {anychart.stockModule.math.rsi.Context} context
 * @this {anychart.stockModule.math.rsi.Context}
 */
anychart.stockModule.math.rsi.startFunction = function(context) {
  context.queue.clear();
  context.upwardChange = NaN;
  context.downwardChange = NaN;
};


/**
 * Calculates RSI.
 * @param {anychart.stockModule.data.TableComputer.RowProxy} row
 * @param {anychart.stockModule.math.rsi.Context} context
 * @this {anychart.stockModule.math.rsi.Context}
 */
anychart.stockModule.math.rsi.calculationFunction = function(row, context) {
  var currValue = row.get('value');
  currValue = goog.isDef(currValue) ? currValue : row.get('close');
  currValue = anychart.utils.toNumber(currValue);
  var missing = isNaN(currValue);
  if (!missing)
    context.queue.enqueue(currValue);
  /** @type {number} */
  var result;
  /** @type {number} */
  var prev;
  /** @type {number} */
  var curr;
  if (missing || context.queue.getLength() < context.period + 1) { // not ready yet
    result = NaN;
  } else {
    if (isNaN(context.upwardChange)) { // first calculation
      var up = 0, down = 0;
      curr = /** @type {number} */(context.queue.get(0));
      for (var i = 1; i < context.period + 1; i++) {
        prev = curr;
        curr = /** @type {number} */(context.queue.get(i));
        if (curr > prev)
          up += curr - prev;
        else if (curr < prev)
          down += prev - curr;
      }
      context.upwardChange = up;
      context.downwardChange = down;
    } else { // subsequent calculations
      curr = /** @type {number} */(context.queue.get(-1));
      prev = /** @type {number} */(context.queue.get(-2));
      var multiplier = (context.period - 1) / context.period;
      context.upwardChange *= multiplier;
      context.downwardChange *= multiplier;
      if (curr > prev)
        context.upwardChange += curr - prev;
      else if (curr < prev)
        context.downwardChange += prev - curr;
    }
    if (context.downwardChange)
      result = 100 - 100 / (1 + context.upwardChange / context.downwardChange);
    else
      result = 100;
  }
  row.set('result', result);
};


/**
 * Creates RSI computer for the given table mapping.
 * @param {anychart.stockModule.data.TableMapping} mapping
 * @param {number=} opt_period
 * @return {anychart.stockModule.data.TableComputer}
 */
anychart.stockModule.math.rsi.createComputer = function(mapping, opt_period) {
  var result = mapping.getTable().createComputer(mapping);
  result.setContext(anychart.stockModule.math.rsi.initContext(opt_period));
  result.setStartFunction(anychart.stockModule.math.rsi.startFunction);
  result.setCalculationFunction(anychart.stockModule.math.rsi.calculationFunction);
  result.addOutputField('result');
  return result;
};


//exports
goog.exportSymbol('anychart.math.rsi.initContext', anychart.stockModule.math.rsi.initContext);
goog.exportSymbol('anychart.math.rsi.startFunction', anychart.stockModule.math.rsi.startFunction);
goog.exportSymbol('anychart.math.rsi.calculationFunction', anychart.stockModule.math.rsi.calculationFunction);
goog.exportSymbol('anychart.math.rsi.createComputer', anychart.stockModule.math.rsi.createComputer);
