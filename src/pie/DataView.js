goog.provide('anychart.pieModule.DataView');

goog.require('anychart.data.Mapping');
goog.require('anychart.data.View');
goog.require('goog.array');



/**
 * Pie view.
 * @param {!anychart.data.IView} parentView Parent view. The last view is a mapping.
 * @param {string} fieldName Field name to make filter by.
 * @param {string} groupedPointName Name for grouped point
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
anychart.pieModule.DataView = function(parentView, fieldName, groupedPointName, opt_func, opt_other, opt_otherInitialConstructor) {
  anychart.pieModule.DataView.base(this, 'constructor', parentView);

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
   * @type {function(): ?R}
   * @private
   * @template R
   */
  this.otherInitial_ = opt_otherInitialConstructor || (function() { return { 'value': 0 }; });

  /**
   * Other point mapping.
   * @type {!anychart.data.Mapping}
   * @private
   */
  this.otherPointView_ = new anychart.pieModule.DataView.Mapping_();
  this.otherPointView_.meta(0, 'groupedPoint', true);
  this.otherPointView_.meta(0, 'name', groupedPointName);
};
goog.inherits(anychart.pieModule.DataView, anychart.data.View);


/** @inheritDoc */
anychart.pieModule.DataView.prototype.buildMask = function() {
  var mask = [];
  var iterator = this.parentView.getIterator();
  var otherPointValues = undefined;
  var otherPointNames = undefined;
  if (this.func_) {
    while (iterator.advance()) {
      var val = iterator.get(this.fieldName_);
      var name = iterator.get('name');
      if (!goog.isDef(name)) {
        name = 'Point ' + (iterator.getIndex());
      }
      if (this.func_(val))
        mask.push(iterator.getIndex());
      else if (otherPointValues) {
        otherPointValues.push(val);
        otherPointNames.push(name);
      }
      else {
        otherPointValues = [val];
        otherPointNames = [name];
      }
    }
  } else {
    for (var i = 0, l = iterator.getRowsCount(); i < l; i++)
      mask.push(i);
  }

  if (otherPointValues) {
    this.otherPointView_.row(0, goog.array.reduce(otherPointValues, this.otherFunc_, this.otherInitial_()));
    this.otherPointView_.meta(0, 'names', otherPointNames);
    this.otherPointView_.meta(0, 'values', otherPointValues);
  } else {
    this.otherPointView_.row(0, otherPointValues);
    this.otherPointView_.meta(0, 'names', []);
    this.otherPointView_.meta(0, 'values', []);
  }
  return mask;
};


/**
 * Returns the number of rows in a view.
 * @return {number} Number of rows in the set.
 */
anychart.pieModule.DataView.prototype.getRowsCount = function() {
  this.ensureConsistent();
  return (this.mask ? this.mask.length : this.parentView.getRowsCount()) + this.otherPointView_.getRowsCount();
};


/** @inheritDoc */
anychart.pieModule.DataView.prototype.getRowMapping = function(rowIndex) {
  this.ensureConsistent();
  var count = this.parentView.getRowsCount();
  if (rowIndex < count)
    return this.parentView.getRowMapping(rowIndex);
  return this.otherPointView_.getRowMapping(rowIndex - count);
};


/** @inheritDoc */
anychart.pieModule.DataView.prototype.getMappings = function() {
  return goog.array.concat(this.parentView.getMappings(), this.otherPointView_);
};


/** @inheritDoc */
anychart.pieModule.DataView.prototype.row = function(rowIndex, opt_value) {
  this.ensureConsistent();
  var len = (this.mask ? this.mask.length : this.parentView.getRowsCount());
  if (rowIndex < len)
    return anychart.data.View.prototype.row.apply(this, arguments);
  rowIndex -= len;
  return this.otherPointView_.row.apply(this.otherPointView_, arguments);
};


/**
 * @inheritDoc
 */
anychart.pieModule.DataView.prototype.parentMeta = function(index, name, opt_value) {
  var len = (this.mask ? this.mask.length : this.parentView.getRowsCount());
  if (index > len) {
    throw Error('Index can not be masked by this View');
  }
  if (index >= len) {
    index -= len;
    if (arguments.length > 2) {
      this.otherPointView_.meta.apply(this.otherPointView_, arguments);
      return this;
    } else {
      return this.otherPointView_.meta.apply(this.otherPointView_, arguments);
    }
  } else {
    return anychart.data.View.prototype.parentMeta.apply(this, arguments);
  }
};



/**
 * Special mapping for other point for PieView.
 * @constructor
 * @extends {anychart.data.Mapping}
 * @private
 */
anychart.pieModule.DataView.Mapping_ = function() {
  anychart.core.Base.call(this);
  this.initMappingInfo();

  /**
   * Row to handle.
   * @type {*}
   * @private
   */
  this.row_ = undefined;
};
goog.inherits(anychart.pieModule.DataView.Mapping_, anychart.data.Mapping);


/** @inheritDoc */
anychart.pieModule.DataView.Mapping_.prototype.row = function(rowIndex, opt_value) {
  if (!rowIndex) {
    var res = this.row_;
    if (arguments.length > 1) {
      this.row_ = opt_value;
    }
    return res;
  } else
    return undefined;
};


/**
 * @inheritDoc
 */
anychart.pieModule.DataView.Mapping_.prototype.meta = function(index, name, opt_value) {
  if (!index) {
    return anychart.data.View.prototype.meta.apply(this, arguments);
  }
};


/** @inheritDoc */
anychart.pieModule.DataView.Mapping_.prototype.getRowsCount = function() {
  return goog.isDef(this.row_) ? 1 : 0;
};


//exports
(function() {
  var proto = anychart.pieModule.DataView.Mapping_.prototype;
  proto['row'] = proto.row;
  proto['getRowsCount'] = proto.getRowsCount;
})();
