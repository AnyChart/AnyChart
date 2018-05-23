goog.provide('anychart.stockModule.math.ha');
goog.require('anychart.stockModule.math.CycledQueue');
goog.require('anychart.utils');


/**
 * @typedef {{
 *    openQueue: !anychart.stockModule.math.CycledQueue,
 *    closeQueue: !anychart.stockModule.math.CycledQueue,
 *    dispose: Function
 * }}
 */
anychart.stockModule.math.ha.Context;


/**
 * Creates context for HA indicator calculation.
 * @return {anychart.stockModule.math.ha.Context}
 */
anychart.stockModule.math.ha.initContext = function() {
  return {
    openQueue: anychart.math.cycledQueue(1),
    closeQueue: anychart.math.cycledQueue(1),
    /**
     * @this {anychart.stockModule.math.ha.Context}
     */
    'dispose': function() {
      this.openQueue.clear();
      this.closeQueue.clear();
    }
  };
};


/**
 * Start calculation function for HA indicator calculation.
 * @param {anychart.stockModule.math.ha.Context} context
 * @this {anychart.stockModule.math.ha.Context}
 */
anychart.stockModule.math.ha.startFunction = function(context) {
  this.openQueue.clear();
  this.closeQueue.clear();
};


/**
 * HA calculation.
 * @param {anychart.stockModule.math.ha.Context} context HA context.
 * @param {number} currOpen Current open value.
 * @param {number} currHigh Current high value.
 * @param {number} currLow Current low value.
 * @param {number} currClose Current close value.
 * @return {Array.<number>}
 */
anychart.stockModule.math.ha.calculate = function(context, currOpen, currHigh, currLow, currClose) {
  /** @type {number} */ var haOpen;
  /** @type {number} */ var haHigh;
  /** @type {number} */ var haLow;
  /** @type {number} */ var haClose;
  if (isNaN(currOpen) || isNaN(currHigh) || isNaN(currLow) || isNaN(currClose)) {
    return [NaN, NaN, NaN, NaN];
  } else {
    if (context.openQueue.getLength()) {
      var storedOpen = context.openQueue.get(0);
      var storedClose = context.closeQueue.get(0);
      haOpen = (storedOpen + storedClose) / 2;
      haClose = (currOpen + currHigh + currLow + currClose) / 4;
      haHigh = Math.max(currHigh, haOpen, haClose);
      haLow = Math.min(currLow, haOpen, haClose);
    } else {
      //alternative approach to calculate the first haCandle open
      // haOpen = (currOpen + currClose) / 2;
      haOpen = currOpen;
      haHigh = currHigh;
      haLow = currLow;
      haClose = (currOpen + currHigh + currLow + currClose) / 4;
    }
    context.openQueue.enqueue(haOpen);
    context.closeQueue.enqueue(haClose);
  }
  return [haOpen, haHigh, haLow, haClose];
};


/**
 * Calculates HA.
 * @param {anychart.stockModule.data.TableComputer.RowProxy} row
 * @param {anychart.stockModule.math.ha.Context} context
 * @this {anychart.stockModule.math.ha.Context}
 */
anychart.stockModule.math.ha.calculationFunction = function(row, context) {
  var currOpen = /** @type {number} */ (anychart.utils.toNumber(row.get('open')));
  var currHigh = /** @type {number} */ (anychart.utils.toNumber(row.get('high')));
  var currLow = /** @type {number} */ (anychart.utils.toNumber(row.get('low')));
  var currClose = /** @type {number} */ (anychart.utils.toNumber(row.get('close')));
  var result = anychart.stockModule.math.ha.calculate(context, currOpen, currHigh, currLow, currClose);
  row.set('haOpen', result[0]);
  row.set('haHigh', result[1]);
  row.set('haLow', result[2]);
  row.set('haClose', result[3]);
};


/**
 * Creates HA computer for the given table mapping.
 * @param {anychart.stockModule.data.TableMapping} mapping
 * @return {anychart.stockModule.data.TableComputer}
 */
anychart.stockModule.math.ha.createComputer = function(mapping) {
  var result = mapping.getTable().createComputer(mapping);
  result.setContext(anychart.stockModule.math.ha.initContext());
  result.setStartFunction(anychart.stockModule.math.ha.startFunction);
  result.setCalculationFunction(anychart.stockModule.math.ha.calculationFunction);
  result.addOutputField('haOpen');
  result.addOutputField('haHigh');
  result.addOutputField('haLow');
  result.addOutputField('haClose');
  return result;
};


//exports
goog.exportSymbol('anychart.math.ha.initContext', anychart.stockModule.math.ha.initContext);
goog.exportSymbol('anychart.math.ha.startFunction', anychart.stockModule.math.ha.startFunction);
goog.exportSymbol('anychart.math.ha.calculate', anychart.stockModule.math.ha.calculate);
goog.exportSymbol('anychart.math.ha.calculationFunction', anychart.stockModule.math.ha.calculationFunction);
goog.exportSymbol('anychart.math.ha.createComputer', anychart.stockModule.math.ha.createComputer);
