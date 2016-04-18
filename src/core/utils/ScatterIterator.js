goog.provide('anychart.core.utils.ScatterIterator');



/**
 * Synced iterator to iterate over synchronous data sets.
 * @param {!Array.<(anychart.core.polar.series.Base|anychart.core.radar.series.Base)>} series .
 * @param {boolean} isDateTime .
 * @param {Function=} opt_pointCallback .
 * @param {Function=} opt_missingCallback .
 * @param {Function=} opt_beforePointCallback .
 * @param {Function=} opt_afterPointCallback .
 * @constructor
 */
anychart.core.utils.ScatterIterator = function(series, isDateTime, opt_pointCallback, opt_missingCallback, opt_beforePointCallback,
    opt_afterPointCallback) {
  /**
   * @type {!Array.<(anychart.core.polar.series.Base|anychart.core.radar.series.Base)>}
   * @protected
   */
  this.series = series;

  /**
   * @type {Array.<boolean>}
   * @protected
   */
  this.seriesStatus = [];

  /**
   * @type {!Array.<anychart.data.Iterator>}
   * @protected
   */
  this.iterators = [];

  /**
   * @type {Array.<boolean>}
   * @protected
   */
  this.iteratorsStatus = [];

  /**
   * @type {Array}
   * @protected
   */
  this.xValues = [];

  /**
   * @type {Function}
   * @protected
   */
  this.pointCallback = opt_pointCallback || goog.nullFunction;

  /**
   * @type {Function}
   * @protected
   */
  this.beforePointCallback = opt_beforePointCallback || goog.nullFunction;

  /**
   * @type {Function}
   * @protected
   */
  this.afterPointCallback = opt_afterPointCallback || goog.nullFunction;

  /**
   * @type {Function}
   * @protected
   */
  this.missingCallback = opt_missingCallback || goog.nullFunction;

  /**
   * @type {boolean}
   * @protected
   */
  this.isDateTime = isDateTime;

  for (var i = 0; i < series.length; i++)
    this.iterators.push(series[i].getResetIterator());
  this.reset();
};


/**
 * Resets iterator cursor to the point before the first element.
 * @return {anychart.core.utils.ScatterIterator} Returns itself for chaining.
 */
anychart.core.utils.ScatterIterator.prototype.reset = function() {
  this.currentIndex = 0;

  for (var i = 0; i < this.iterators.length; i++) {
    this.iteratorsStatus[i] = this.iterators[i].reset().advance();
    this.xValues[i] = this.normalize(this.iterators[i].get('x'));
  }
  return this;
};


/**
 * Advances the iterator cursor and returns if the next element is available.
 * @return {boolean} Availability if the subsequent element.
 */
anychart.core.utils.ScatterIterator.prototype.advance = function() {
  var i;
  var min = this.findMin.apply(this, this.xValues);
  var iteratorsToAdvance = [];
  for (i = this.iterators.length; i--;) {
    var isMin = this.iteratorsStatus[i] && (!goog.isDef(min) || this.xValues[i] == min);
    this.seriesStatus[i] = isMin;
    if (isMin)
      iteratorsToAdvance.push(i);
  }
  this.invokeCallbacks();
  for (i = iteratorsToAdvance.length; i--;) {
    var index = iteratorsToAdvance[i];
    var tmp = this.iteratorsStatus[index] = this.iterators[index].advance();
    if (tmp)
      this.xValues[index] = this.normalize(this.iterators[index].get('x'));
    else
      this.xValues[index] = NaN;
  }
  this.currentIndex++;

  return !!Math.max.apply(null, this.iteratorsStatus);
};


/**
 * @protected
 */
anychart.core.utils.ScatterIterator.prototype.invokeCallbacks = function() {
  var i, activeSeries = [];
  for (i = 0; i < this.series.length; i++) {
    if (this.seriesStatus[i])
      activeSeries.push(this.series[i]);
  }
  this.beforePointCallback(activeSeries);
  for (i = 0; i < this.series.length; i++) {
    if (this.seriesStatus[i])
      this.pointCallback(this.series[i]);
    else
      this.missingCallback(this.series[i]);
  }
  this.afterPointCallback();
};


/**
 * @param {...*} var_args Numbers or NaNs.
 * @return {*} Minimum of numbers except NaNs.
 * @protected
 */
anychart.core.utils.ScatterIterator.prototype.findMin = function(var_args) {
  var argsLen = arguments.length;
  var res = NaN;
  for (var i = 0; i < argsLen; i++) {
    var val = arguments[i];
    if (!isNaN(val))
      res = isNaN(res) ? val : Math.min(res, val);
  }
  return isNaN(res) ? undefined : res;
};


/**
 * Normalizes data value to number.
 * @param {*} value
 * @return {*}
 */
anychart.core.utils.ScatterIterator.prototype.normalize = function(value) {
  return this.isDateTime ?
      anychart.utils.normalizeTimestamp(value) :
      anychart.utils.toNumber(value);
};
