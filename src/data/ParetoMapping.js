goog.provide('anychart.data.ParetoMapping');
goog.require('anychart.data.Mapping');



/**
 * Pareto view.
 * @extends {anychart.data.Mapping}
 * @param {!anychart.data.IView} parentView Parent view. The last view is a mapping.
 * @constructor
 */
anychart.data.ParetoMapping = function(parentView) {
  anychart.data.ParetoMapping.base(this, 'constructor', parentView);

  /**
   * Rows with relative frequencies.
   * RFi = VALUEi / SUM.
   * @type {Array.<number>}
   * @private
   */
  this.rfs_ = [];

  /**
   * Rows with cumulative frequencies in percent.
   * CFi = SUM(RFj) (j<=i)
   * @type {Array.<number>}
   * @private
   */
  this.cfs_ = [];

  /**
   * Sorted values.
   * @type {Array.<number>}
   * @private
   */
  this.values_ = [];

  /**
   * Sum of values.
   * @type {number}
   * @private
   */
  this.sum_ = 0;
};
goog.inherits(anychart.data.ParetoMapping, anychart.data.Mapping);


/**
 * ParetoMapping supports DATA dirty state.
 * @type {number}
 */
anychart.data.ParetoMapping.prototype.SUPPORTED_CONSISTENCY_STATES = anychart.ConsistencyState.DATA_MASK;


/** @inheritDoc */
anychart.data.ParetoMapping.prototype.getInternal = function(row, rowIndex, fieldName) {
  var rv = anychart.data.ParetoMapping.base(this, 'getInternal', row, rowIndex, fieldName);
  if (fieldName == 'value') {
    rv = anychart.utils.toNumber(rv);
    if (isNaN(rv) || rv < 0)
      rv = 0;
  }
  return rv;
};


/** @inheritDoc */
anychart.data.ParetoMapping.prototype.buildMask = function() {
  this.rfs_ = [];
  this.cfs_ = [];
  this.values_ = [];
  this.sum_ = 0;
  this.markConsistent(anychart.ConsistencyState.DATA_MASK);
  var iterator = this.getIterator();

  var value;
  while (iterator.advance()) {
    value = /** @type {number} */ (iterator.get('value'));
    this.values_.push(value);
    this.sum_ += value;
  }

  var i;

  if (this.values_.length) {
    if (this.sum_ == 0) {
      for (i = 0; i < this.values_.length; i++) {
        this.rfs_[i] = 0;
        this.cfs_[i] = 0;
      }
    } else {
      this.rfs_[0] = this.cfs_[0] = this.values_[0] * 100 / this.sum_;

      for (i = 1; i < this.values_.length; i++) {
        this.rfs_[i] = this.values_[i] * 100 / this.sum_;
        this.cfs_[i] = this.cfs_[i - 1] + this.values_[i] * 100 / this.sum_;
      }
    }
  }
  return null;
};


/** @inheritDoc */
anychart.data.ParetoMapping.prototype.parentViewChangedHandler = function(event) {
  this.cachedValues = null;
  if (event.hasSignal(anychart.Signal.DATA_CHANGED)) {
    this.invalidate(anychart.ConsistencyState.DATA_MASK, anychart.Signal.DATA_CHANGED);
  }
};


/**
 * Gets cumulative frequency for row index.
 * @param {number} rowIndex Row index.
 * @return {number} Cumulative frequency.
 */
anychart.data.ParetoMapping.prototype.getCumulativeFrequency = function(rowIndex) {
  return this.cfs_[rowIndex];
};


/**
 * Gets relative frequency for row index.
 * @param {number} rowIndex Row index.
 * @return {number} Relative frequency.
 */
anychart.data.ParetoMapping.prototype.getRelativeFrequency = function(rowIndex) {
  return this.rfs_[rowIndex];
};


/**
 * Returns value for row index.
 * @param {number} rowIndex Row index.
 * @return {number} Value.
 */
anychart.data.ParetoMapping.prototype.getValue = function(rowIndex) {
  return this.values_[rowIndex];
};


/**
 * Sum of values.
 * @return {number}
 */
anychart.data.ParetoMapping.prototype.getSum = function() {
  this.ensureConsistent();
  return this.sum_;
};
