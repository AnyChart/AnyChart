goog.provide('anychart.stockModule.math.vwap');
goog.require('anychart.utils');


/**
 * @typedef {{
 *   cumulativeVolume: number,
 *   cumulativeTransactionsValue: number,
 *   beginOfDay: number,
 *   chart: anychart.core.Chart,
 *   allowedUnits: Array.<string>,
 *   dispose: Function
 * }}
 */
anychart.stockModule.math.vwap.Context;


/**
 * Creates context for VWAP indicator calculation.
 * @param {anychart.core.Chart} chart
 * @return {anychart.stockModule.math.vwap.Context}
 */
anychart.stockModule.math.vwap.initContext = function(chart) {
  return {
    cumulativeVolume: 0,
    cumulativeTransactionsValue: 0,
    beginOfDay: NaN,
    // chart instance to get access to the chart data grouping
    chart: chart,
    // vwap can be rendered on the following data grouping units
    allowedUnits: ['hour', 'millisecond', 'minute', 'second'],
    /**
     * @this {anychart.stockModule.math.vwap.Context}
     */
    'dispose': function() {
      this.cumulativeVolume = 0;
      this.cumulativeTransactionsValue = 0;
    }
  };
};


/**
 * Start calculation function for VWAP indicator calculation.
 * @param {anychart.stockModule.math.vwap.Context} context
 * @this {anychart.stockModule.math.vwap.Context}
 */
anychart.stockModule.math.vwap.startFunction = function(context) {
  context.cumulativeVolume = 0;
  context.cumulativeTransactionsValue = 0;
  context.beginOfDay = NaN;
};


/**
 * Calculates VWAP value.
 * @param {anychart.stockModule.math.vwap.Context} context
 * @param {number} high
 * @param {number} low
 * @param {number} close
 * @param {number} volume
 * @return {number}
 */
anychart.stockModule.math.vwap.calculate = function(context, high, low, close, volume) {
  if (isNaN(high) || isNaN(low) || isNaN(close) || isNaN(volume)) {
    return NaN;
  } else {
    context.cumulativeVolume += volume;
    context.cumulativeTransactionsValue += (high + low + close) * volume / 3;
    return context.cumulativeTransactionsValue / context.cumulativeVolume;
  }
};


/**
 * Calculate VWAP.
 * @param {anychart.stockModule.data.TableComputer.RowProxy} row
 * @param {anychart.stockModule.math.vwap.Context} context
 * @this {anychart.stockModule.math.vwap.Context}
 */
anychart.stockModule.math.vwap.calculationFunction = function(row, context) {
  var currentTimestamp = anychart.utils.toNumber(row.getX());
  if (isNaN(context.beginOfDay) || currentTimestamp - context.beginOfDay >= 1000 * 60 * 60 * 24) {
    var curDateObj = new Date(currentTimestamp);
    var curYear = curDateObj.getUTCFullYear();
    var curMonth = curDateObj.getUTCMonth();
    var curDay = curDateObj.getUTCDate();
    context.beginOfDay = Date.UTC(curYear, curMonth, curDay, 0, 0, 0);
    context['dispose']();
  }
  // get current data grouping unit
  var unit = context.chart.grouping().getCurrentDataInterval()['unit'];

  if (context.allowedUnits.indexOf(unit) === -1) {
    // do not calculate indicator on disallowed data grouping units
    row.set('vwapValue', NaN);
  } else {
    // calculate indicator on allowed data grouping units
      var high = anychart.utils.toNumber(row.get('high'));
      var low = anychart.utils.toNumber(row.get('low'));
      var close = anychart.utils.toNumber(row.get('close'));
      var volume = anychart.utils.toNumber(row.get('volume'));
      var result = anychart.stockModule.math.vwap.calculate(context, high, low, close, volume);
      row.set('vwapValue', result);
  }
};


/**
 * Creates VWAP computer for the given table mapping.
 * @param {anychart.stockModule.data.TableMapping} mapping
 * @param {anychart.core.Chart} chart
 * @return {anychart.stockModule.data.TableComputer}
 */
anychart.stockModule.math.vwap.createComputer = function(mapping, chart) {
  var result = mapping.getTable().createComputer(mapping);
  result.setContext(anychart.stockModule.math.vwap.initContext(chart));
  result.setStartFunction(anychart.stockModule.math.vwap.startFunction);
  result.setCalculationFunction(anychart.stockModule.math.vwap.calculationFunction);
  result.addOutputField('vwapValue');
  return result;
};

//exports
goog.exportSymbol('anychart.math.vwap.initContext', anychart.stockModule.math.vwap.initContext);
goog.exportSymbol('anychart.math.vwap.startFunction', anychart.stockModule.math.vwap.startFunction);
goog.exportSymbol('anychart.math.vwap.calculate', anychart.stockModule.math.vwap.calculate);
goog.exportSymbol('anychart.math.vwap.calculationFunction', anychart.stockModule.math.vwap.calculationFunction);
goog.exportSymbol('anychart.math.vwap.createComputer', anychart.stockModule.math.vwap.createComputer);
