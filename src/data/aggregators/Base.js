goog.provide('anychart.data.aggregators.Base');
goog.require('goog.Disposable');



/**
 * Aggregator base class.
 * @param {number|string} valuesColumn
 * @param {(number|string)=} opt_weightsColumn
 * @constructor
 * @extends {goog.Disposable}
 */
anychart.data.aggregators.Base = function(valuesColumn, opt_weightsColumn) {
  anychart.data.aggregators.Base.base(this, 'constructor');
  /**
   * Number of the column with values.
   * @type {number|string}
   */
  this.valuesColumn = valuesColumn;

  /**
   * Number of the column with weights.
   * @type {number|string}
   */
  this.weightsColumn = goog.isDef(opt_weightsColumn) ? opt_weightsColumn : NaN;

  this.clear();
};
goog.inherits(anychart.data.aggregators.Base, goog.Disposable);


/**
 * Initializes aggregator calculation. Called in getValueAndClear.
 * @protected
 */
anychart.data.aggregators.Base.prototype.clear = function() {
  /**
   * Internal container for the value.
   * @type {*}
   * @protected
   */
  this.value = undefined;
};


/**
 * Method to process consequent value.
 * @param {*} value
 * @param {*} weight Used only for weighted average.
 * @param {Array|Object} row Used only for custom aggregators.
 */
anychart.data.aggregators.Base.prototype.process = goog.abstractMethod;


/**
 * Returns aggregated value and clears the aggregator to prepare it for the next iteration.
 * WARNING: You cannot use this method twice for one iteration - performance purposes.
 * @return {*}
 */
anychart.data.aggregators.Base.prototype.getValueAndClear = function() {
  var res = this.value;
  this.clear();
  return res;
};


/** @inheritDoc */
anychart.data.aggregators.Base.prototype.disposeInternal = function() {
  delete this.value;
  anychart.data.aggregators.Base.base(this, 'disposeInternal');
};
