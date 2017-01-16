goog.provide('anychart.data.aggregators.CustomFunction');
goog.require('anychart.data.aggregators.Base');



/**
 * Counts the average between all passed non-NaN values as the value of the aggregate.
 * @param {number|string} valuesColumn
 * @param {function(this:THIS, !Array, !Array.<Object|Array>)} func
 * @param {THIS=} opt_context
 * @constructor
 * @extends {anychart.data.aggregators.Base}
 * @template THIS
 */
anychart.data.aggregators.CustomFunction = function(valuesColumn, func, opt_context) {
  /**
   * Custom function.
   * @type {function(this:THIS, !Array, !Array.<Object|Array>)}
   * @private
   */
  this.func_ = func;

  /**
   * @type {THIS}
   * @private
   */
  this.context_ = opt_context;

  anychart.data.aggregators.CustomFunction.base(this, 'constructor', valuesColumn);
};
goog.inherits(anychart.data.aggregators.CustomFunction, anychart.data.aggregators.Base);


/** @inheritDoc */
anychart.data.aggregators.CustomFunction.prototype.clear = function() {
  this.value = [];
  /**
   * @type {!Array.<Array|Object>}
   */
  this.rows = [];
};


/** @inheritDoc */
anychart.data.aggregators.CustomFunction.prototype.process = function(value, weight, row) {
  this.value.push(value);
  this.rows.push(row);
};


/** @inheritDoc */
anychart.data.aggregators.CustomFunction.prototype.getValueAndClear = function() {
  var res = this.func_.call(this.context_, /** @type {!Array} */(this.value), this.rows);
  this.clear();
  return res;
};


/** @inheritDoc */
anychart.data.aggregators.CustomFunction.prototype.disposeInternal = function() {
  delete this.func_;
  delete this.context_;
  anychart.data.aggregators.CustomFunction.base(this, 'disposeInternal');
};
