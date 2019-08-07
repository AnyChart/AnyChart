goog.provide('anychart.stockModule.math.ikh');
goog.require('anychart.stockModule.data.TableComputer.RowProxy');
goog.require('anychart.utils');


/**
 * @typedef {{
 *    conversionPeriod: number,
 *    basePeriod: number,
 *    leadingPeriod: number,
 *    highQueue: !anychart.stockModule.math.CycledQueue,
 *    lowQueue: !anychart.stockModule.math.CycledQueue,
 *    leadingSpanAQueue: !anychart.stockModule.math.CycledQueue,
 *    leadingSpanBQueue: !anychart.stockModule.math.CycledQueue,
 *    dispose: Function
 * }}
 */
anychart.stockModule.math.ikh.Context;


/**
 * {anychart.stockModule.data.TableComputer}
 */
anychart.stockModule.math.ikh.Computer_;


/**
 * Creates context.
 * @param {number=} opt_conversionPeriod [9] Conversion line period. Defaults to 9.
 * @param {number=} opt_basePeriod [26] Base line period. Defaults to 26.
 * @param {number=} opt_leadingPeriod [52] Leading span range period. Defaults to 52.
 * @return {anychart.stockModule.math.ikh.Context}
 */
anychart.stockModule.math.ikh.initContext = function(opt_conversionPeriod, opt_basePeriod, opt_leadingPeriod) {
  var conversionPeriod = anychart.utils.normalizeToNaturalNumber(opt_conversionPeriod, 9, false);
  var basePeriod = anychart.utils.normalizeToNaturalNumber(opt_basePeriod, 26, false);
  var leadingPeriod = anychart.utils.normalizeToNaturalNumber(opt_leadingPeriod, 52, false);

  // all series can use the same low/high queue
  var maxPeriod = Math.max(conversionPeriod, basePeriod, leadingPeriod);

  return {
    conversionPeriod: conversionPeriod,
    basePeriod: basePeriod,
    leadingPeriod: leadingPeriod,
    highQueue: anychart.math.cycledQueue(maxPeriod),
    lowQueue: anychart.math.cycledQueue(maxPeriod),
    leadingSpanAQueue: anychart.math.cycledQueue(basePeriod),
    leadingSpanBQueue: anychart.math.cycledQueue(basePeriod),
    /**
     * @this {anychart.stockModule.math.ikh.Context}
     */
    'dispose': function() {
      this.highQueue.clear();
      this.lowQueue.clear();
      this.leadingSpanAQueue.clear();
      this.leadingSpanBQueue.clear();
    }
  };
};


/**
 * Start calculation function for Ichimoku Kinko Hyo indicator calculation
 * @param {anychart.stockModule.math.ikh.Context} context
 */
anychart.stockModule.math.ikh.startFunction = function(context) {
  context.highQueue.clear();
  context.lowQueue.clear();
  context.leadingSpanAQueue.clear();
  context.leadingSpanBQueue.clear();
};


/**
 * Calculates Ichimoku Kinko Hyo.
 * @param {anychart.stockModule.data.TableComputer.RowProxy} row
 * @param {anychart.stockModule.math.ikh.Context} context
 * @this {anychart.stockModule.math.ikh.Context}
 */
anychart.stockModule.math.ikh.calculationFunction = function(row, context) {
  var high = anychart.utils.toNumber(row.get('high'));
  var low = anychart.utils.toNumber(row.get('low'));
  var currentIndex = row.getIndex();

  var result = anychart.stockModule.math.ikh.calculate(context, high, low, currentIndex, row);
  row.set('conversionResult', result[0]);
  row.set('baseResult', result[1]);
  row.set('spanAResult', result[2]);
  row.set('spanBResult', result[3]);
  row.set('laggingResult', result[4]);
};


/**
 * Creates Ichimoku Kinko Hyo computer for the given table mapping.
 * @param {anychart.stockModule.data.TableMapping} mapping
 * @param {number=} opt_conversionPeriod
 * @param {number=} opt_basePeriod
 * @param {number=} opt_leadingPeriod
 * @return {anychart.stockModule.data.TableComputer}
 */
anychart.stockModule.math.ikh.createComputer = function(mapping, opt_conversionPeriod, opt_basePeriod, opt_leadingPeriod) {
  var result = /** @type {!anychart.stockModule.data.TableComputer} */ (mapping.getTable().createComputer(mapping));
  anychart.stockModule.math.ikh.Computer_ = result;
  result.setContext(anychart.stockModule.math.ikh.initContext(opt_conversionPeriod, opt_basePeriod, opt_leadingPeriod));
  result.setStartFunction(anychart.stockModule.math.ikh.startFunction);
  result.setCalculationFunction(anychart.stockModule.math.ikh.calculationFunction);
  result.addOutputField('conversionResult');
  result.addOutputField('baseResult');
  result.addOutputField('spanAResult');
  result.addOutputField('spanBResult');
  result.addOutputField('laggingResult');
  return result;
};


/**
 * Calculates Ichimoku Kinko Hyo series values.
 * @param {anychart.stockModule.math.ikh.Context} context
 * @param {number} high
 * @param {number} low
 * @param {number} currentIndex
 * @param {anychart.stockModule.data.TableComputer.RowProxy} row
 * @return {Array.<number>}
 */
anychart.stockModule.math.ikh.calculate = function(context, high, low, currentIndex, row) {

  var conversion = NaN;
  var base = NaN;
  var spanA = NaN;
  var spanB = NaN;
  var close = NaN;

  var periodHigh, periodLow, i;

  // get close value from future row (in a basePeriod)
  var item = row.row;
  for (i = 0; i < context.basePeriod; i++) {
    if (item && item.next)
      item = item.next;
    else
      item = null;
  }

  if (item) {
    var rowProxy = new anychart.stockModule.data.TableComputer.RowProxy(item, anychart.stockModule.math.ikh.Computer_, row.isAggregated(), currentIndex);
    close = anychart.utils.toNumber(rowProxy.get('close'));
  }

  if (!isNaN(high) || !isNaN(low)) {
    context.highQueue.enqueue(high);
    context.lowQueue.enqueue(low);

    // all indicator series can use the same queues of high and low
    var currentQueueLength = context.highQueue.getLength();

    // calculate conversion line
    if (currentQueueLength >= context.conversionPeriod) {
      periodHigh = [];
      periodLow = [];

      for (i = currentQueueLength - context.conversionPeriod; i < currentQueueLength; i++) {
        periodHigh.push(context.highQueue.get(i));
        periodLow.push(context.lowQueue.get(i));
      }
      periodHigh = Math.max.apply(null, periodHigh);
      periodLow = Math.min.apply(null, periodLow);
      conversion = (periodHigh + periodLow) / 2;
    }

    // calculate base line
    if (currentQueueLength >= context.basePeriod) {
      periodHigh = [];
      periodLow = [];

      for (i = currentQueueLength - context.basePeriod; i < currentQueueLength; i++) {
        periodHigh.push(context.highQueue.get(i));
        periodLow.push(context.lowQueue.get(i));
      }
      periodHigh = Math.max.apply(null, periodHigh);
      periodLow = Math.min.apply(null, periodLow);
      base = (periodHigh + periodLow) / 2;
    }

    // calculate leading span
    if (currentQueueLength >= context.leadingPeriod) {
      periodHigh = [];
      periodLow = [];

      for (i = currentQueueLength - context.leadingPeriod; i < currentQueueLength; i++) {
        periodHigh.push(context.highQueue.get(i));
        periodLow.push(context.lowQueue.get(i));
      }
      periodHigh = Math.max.apply(null, periodHigh);
      periodLow = Math.min.apply(null, periodLow);

      spanA = context.leadingSpanAQueue.enqueue((conversion + base) / 2);
      spanB = context.leadingSpanBQueue.enqueue((periodHigh + periodLow) / 2);
    }
  }

  return [
    conversion,
    base,
    spanA,
    spanB,
    close
  ];
};


//exports
goog.exportSymbol('anychart.math.ikh.initContext', anychart.stockModule.math.ikh.initContext);
goog.exportSymbol('anychart.math.ikh.startFunction', anychart.stockModule.math.ikh.startFunction);
goog.exportSymbol('anychart.math.ikh.calculate', anychart.stockModule.math.ikh.calculate);
goog.exportSymbol('anychart.math.ikh.calculationFunction', anychart.stockModule.math.ikh.calculationFunction);
goog.exportSymbol('anychart.math.ikh.createComputer', anychart.stockModule.math.ikh.createComputer);
