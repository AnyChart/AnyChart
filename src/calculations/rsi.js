goog.provide('anychart.calculations.rsi');
goog.require('anychart.calculations.CycledQueue');
goog.require('anychart.utils');

/**
 * @namespace {anychart.calculations}
 */


/**
 * @typedef {{
 *    queue: !anychart.calculations.CycledQueue,
 *    period: number,
 *    upwardChange: number,
 *    downwardChange: number,
 *    dispose: Function
 * }}
 */
anychart.calculations.rsi.Context;


/**
 * Creates context for RSI indicator calculation.
 * @param {number=} opt_period Defaults to 10.
 * @return {anychart.calculations.rsi.Context}
 */
anychart.calculations.rsi.initContext = function(opt_period) {
  var period = anychart.utils.normalizeToNaturalNumber(opt_period, 14, false);
  return {
    queue: anychart.calculations.cycledQueue(period),
    period: period,
    upwardChange: NaN,
    downwardChange: NaN,
    /**
     * @this {anychart.calculations.rsi.Context}
     */
    'dispose': function() {
      this.queue.clear();
    }
  };
};


/**
 * Start calculation function for RSI indicator calculation.
 * @param {anychart.calculations.rsi.Context} context
 * @this {anychart.calculations.rsi.Context}
 */
anychart.calculations.rsi.startFunction = function(context) {
  context.queue.clear();
  context.upwardChange = NaN;
  context.downwardChange = NaN;
};


/**
 * Calculates RSI.
 * @param {anychart.data.TableComputer.RowProxy} row
 * @param {anychart.calculations.rsi.Context} context
 * @this {anychart.calculations.rsi.Context}
 */
anychart.calculations.rsi.calculationFunction = function(row, context) {
  var currValue = anychart.utils.toNumber(row.get('value'));
  var missing = isNaN(currValue);
  if (!missing)
    context.queue.enqueue(currValue);
  /** @type {number} */
  var result;
  /** @type {number} */
  var prev;
  /** @type {number} */
  var curr;
  if (missing || context.queue.getLength() < context.period) { // not ready yet
    result = NaN;
  } else {
    if (isNaN(context.upwardChange)) { // first calculation
      var up = 0, down = 0;
      curr = /** @type {number} */(context.queue.get(0));
      for (var i = 1; i < context.period; i++) {
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
    if (down == 0)
      result = 100;
    else
      result = 100 - 100 / (1 + context.upwardChange / context.downwardChange);
  }
  row.set('result', result);
};


/**
 * Creates RSI computer for the given table mapping.
 * @param {anychart.data.TableMapping} mapping
 * @param {number=} opt_period
 * @return {anychart.data.TableComputer}
 */
anychart.calculations.rsi.createComputer = function(mapping, opt_period) {
  var result = mapping.getTable().createComputer(mapping);
  result.setContext(anychart.calculations.rsi.initContext(opt_period));
  result.setStartFunction(anychart.calculations.rsi.startFunction);
  result.setCalculationFunction(anychart.calculations.rsi.calculationFunction);
  result.addOutputField('result');
  return result;
};


//exports
goog.exportSymbol('anychart.calculations.rsi.initContext', anychart.calculations.rsi.initContext);
goog.exportSymbol('anychart.calculations.rsi.startFunction', anychart.calculations.rsi.startFunction);
goog.exportSymbol('anychart.calculations.rsi.calculationFunction', anychart.calculations.rsi.calculationFunction);
goog.exportSymbol('anychart.calculations.rsi.createComputer', anychart.calculations.rsi.createComputer);
