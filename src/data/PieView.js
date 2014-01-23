goog.provide('anychart.data.PieView');

goog.require('anychart.data.Mapping');
goog.require('anychart.data.View');
goog.require('goog.array');



/**
 * Pie view.
 * @param {!anychart.data.IView} parentView Parent view. The last view is a mapping.
 * @param {string} fieldName Field name to make filter by.
 * @param {function(*):boolean=} opt_func Filter function that should accept a field value and return true if the row
 *    should be included into the resulting view as a and false otherwise.
 * @param {(function(R, T, number, Array) : R)=} opt_other The function to call for
 *     every value of other. This function
 *     takes 4 arguments (the function's previous result or the initial value,
 *     the value of the current array element, the current array index, and the
 *     array itself)
 *     function(previousValue, currentValue, index, array).
 * @param {(function():R)=} opt_otherInitialConstructor The function that constructs initial value for opt_other func.
 * @template T,S,R
 * @constructor
 * @extends {anychart.data.View}
 */
anychart.data.PieView = function(parentView, fieldName, opt_func, opt_other, opt_otherInitialConstructor) {
  goog.base(this, parentView);

  /**
   * Field name to categorize by. Stored for data change events.
   * @type {string}
   * @private
   */
  this.fieldName_ = fieldName;

  /**
   * Filter function.
   * @type {(function(*):boolean)?}
   * @private
   */
  this.func_ = opt_func || null;

  /**
   * Other function.
   * @type {function(R, ?, number, Array):R}
   * @private
   * @template R
   */
  this.otherFunc_ = opt_other || (function(val, item, index, arr) {
    val['value'] += Math.max(0, +item) || 0;
    return val;
  });


  /**
   * Other initial value constructor.
   * @type {function(): R?}
   * @private
   * @template R
   */
  this.otherInitial_ = opt_otherInitialConstructor || (function() { return { 'value': 0 }; });

  /**
   * Other point mapping.
   * @type {!anychart.data.Mapping}
   * @private
   */
  this.otherPointView_ = new anychart.data.PieView.Mapping_();
};
goog.inherits(anychart.data.PieView, anychart.data.View);


/** @inheritDoc */
anychart.data.PieView.prototype.buildMask = function() {
  var mask = [];
  var iterator = this.parentView.getIterator();
  var otherPoint = undefined;
  if (this.func_) {
    while (iterator.advance()) {
      var val = iterator.get(this.fieldName_);
      if (this.func_(val))
        mask.push(iterator.getIndex());
      else if (otherPoint)
        otherPoint.push(val);
      else
        otherPoint = [val];
    }
  } else {
    for (var i = 0, l = iterator.getRowsCount(); i < l; i++)
      mask.push(i);
  }
  this.otherPointView_.row(0, otherPoint ?
      goog.array.reduce(otherPoint, this.otherFunc_, this.otherInitial_()) :
      otherPoint);
  return mask;
};


/**
 * Returns the number of rows in a view.
 * @return {number} Number of rows in the set.
 */
anychart.data.PieView.prototype.getRowsCount = function() {
  this.ensureConsistent();
  return this.mask.length + this.otherPointView_.getRowsCount();
};


/** @inheritDoc */
anychart.data.PieView.prototype.getRowMapping = function(rowIndex) {
  this.ensureConsistent();
  var count = this.parentView.getRowsCount();
  if (rowIndex < count)
    return this.parentView.getRowMapping(rowIndex);
  return this.otherPointView_.getRowMapping(rowIndex - count);
};


/** @inheritDoc */
anychart.data.PieView.prototype.row = function(rowIndex, opt_value) {
  this.ensureConsistent();
  if (rowIndex < this.mask.length)
    return anychart.data.View.prototype.row.apply(this, arguments);
  rowIndex -= this.mask.length;
  return this.otherPointView_.row.apply(this.otherPointView_, arguments);
};



/**
 * Special mapping for other point for PieView.
 * @constructor
 * @extends {anychart.data.Mapping}
 * @private
 */
anychart.data.PieView.Mapping_ = function() {
  anychart.utils.Invalidatable.call(this);
  this.initMappingInfo();

  /**
   * Row to handle.
   * @type {*}
   * @private
   */
  this.row_ = undefined;
};
goog.inherits(anychart.data.PieView.Mapping_, anychart.data.Mapping);


/** @inheritDoc */
anychart.data.PieView.Mapping_.prototype.row = function(rowIndex, opt_value) {
  if (rowIndex == 0) {
    var res = this.row_;
    if (arguments.length > 1) {
      this.row_ = opt_value;
    }
    return res;
  } else
    return undefined;
};


/** @inheritDoc */
anychart.data.PieView.Mapping_.prototype.getRowsCount = function() {
  return goog.isDef(this.row_) ? 1 : 0;
};
