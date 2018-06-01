goog.provide('anychart.stockModule.math.priceChannels');
goog.require('anychart.stockModule.math.CycledQueue');
goog.require('anychart.utils');

/**
 * @namespace {anychart.stockModule.math.priceChannels}
 */


/**
 * @typedef {{
 *    highQueue: !anychart.stockModule.math.CycledQueue,
 *    lowQueue: !anychart.stockModule.math.CycledQueue,
 *    period: number,
 *    dispose: Function
 * }}
 */
anychart.stockModule.math.priceChannels.Context;


/**
 * Creates context for Price Channels indicator calculation.
 * @param {number=} opt_period Defaults to 20.
 * @return {anychart.stockModule.math.priceChannels.Context}
 */
anychart.stockModule.math.priceChannels.initContext = function(opt_period) {
  var period = anychart.utils.normalizeToNaturalNumber(opt_period, 20, false);
  return {
    highQueue: anychart.math.cycledQueue(period),
    lowQueue: anychart.math.cycledQueue(period),
    period: period,
    /**
     * @this {anychart.stockModule.math.priceChannels.Context}
     */
    'dispose': function() {
      this.highQueue.clear();
      this.lowQueue.clear();
    }
  };
};


/**
 * Start calculation function for Price Channels indicator calculation.
 * @param {anychart.stockModule.math.priceChannels.Context} context
 * @this {anychart.stockModule.math.priceChannels.Context}
 */
anychart.stockModule.math.priceChannels.startFunction = function(context) {
  context.highQueue.clear();
  context.lowQueue.clear();
};


/**
 * Price Channels calculation.
 * @param {anychart.stockModule.math.priceChannels.Context} context Price Channels context.
 * @param {number} high Current high value.
 * @param {number} low Current low value.
 * @return {Array.<number>}
 */
anychart.stockModule.math.priceChannels.calculate = function(context, high, low) {
  if (isNaN(high) || isNaN(low))
    return [NaN, NaN, NaN];

  var periodHigh = NaN;
  var periodMiddle = NaN;
  var periodLow = NaN;
  if (context.highQueue.getLength() >= context.period) {
    periodHigh = context.highQueue.get(0);
    periodLow = context.lowQueue.get(0);
    var highFromQueue, lowFromQueue;
    for (var i = 1; i < context.period; i++) {
      highFromQueue = context.highQueue.get(i);
      lowFromQueue = context.lowQueue.get(i);

      if (highFromQueue > periodHigh)
        periodHigh = highFromQueue;

      if (lowFromQueue < periodLow)
        periodLow = lowFromQueue;
    }
    periodMiddle = (periodHigh + periodLow) / 2;
  }
  //current point doesn't participate in calculation
  context.highQueue.enqueue(high);
  context.lowQueue.enqueue(low);
  return [
    periodHigh,
    periodMiddle,
    periodLow
  ];
};


/**
 * Calculates Price Channels.
 * @param {anychart.stockModule.data.TableComputer.RowProxy} row
 * @param {anychart.stockModule.math.priceChannels.Context} context
 * @this {anychart.stockModule.math.priceChannels.Context}
 */
anychart.stockModule.math.priceChannels.calculationFunction = function(row, context) {
  var high = /** @type {number} */ (anychart.utils.toNumber(row.get('high')));
  var low = /** @type {number} */ (anychart.utils.toNumber(row.get('low')));
  var result = anychart.stockModule.math.priceChannels.calculate(context, high, low);
  row.set('upperResult', result[0]);
  row.set('middleResult', result[1]);
  row.set('lowerResult', result[2]);
};


/**
 * Creates Price Channels computer for the given table mapping.
 * @param {anychart.stockModule.data.TableMapping} mapping
 * @param {number=} opt_period
 * @return {anychart.stockModule.data.TableComputer}
 */
anychart.stockModule.math.priceChannels.createComputer = function(mapping, opt_period) {
  var result = mapping.getTable().createComputer(mapping);
  result.setContext(anychart.stockModule.math.priceChannels.initContext(opt_period));
  result.setStartFunction(anychart.stockModule.math.priceChannels.startFunction);
  result.setCalculationFunction(anychart.stockModule.math.priceChannels.calculationFunction);
  result.addOutputField('upperResult');
  result.addOutputField('middleResult');
  result.addOutputField('lowerResult');
  return result;
};


//exports
goog.exportSymbol('anychart.math.priceChannels.initContext', anychart.stockModule.math.priceChannels.initContext);
goog.exportSymbol('anychart.math.priceChannels.startFunction', anychart.stockModule.math.priceChannels.startFunction);
goog.exportSymbol('anychart.math.priceChannels.calculate', anychart.stockModule.math.priceChannels.calculate);
goog.exportSymbol('anychart.math.priceChannels.calculationFunction', anychart.stockModule.math.priceChannels.calculationFunction);
goog.exportSymbol('anychart.math.priceChannels.createComputer', anychart.stockModule.math.priceChannels.createComputer);
