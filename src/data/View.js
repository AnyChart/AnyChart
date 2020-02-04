/**
 * @fileoverview anychart.data.View namespace file.
 * @suppress {missingRequire}
 */
goog.provide('anychart.data.View');

goog.require('anychart.core.Base');
goog.require('anychart.data.IDataSource');
goog.require('anychart.data.IView');
goog.require('anychart.data.Iterator');
goog.require('anychart.enums');



/**
 * View is a representation of raw data.<br/>
 * <b>Note:</b> Default View is a view with default mapping.<br/>
 *
 * @param {!anychart.data.IView} parentView The parent view. The last view is a mapping.
 * @constructor
 * @implements {anychart.data.IView}
 * @name anychart.data.View
 * @extends {anychart.core.Base}
 * @implements {anychart.data.IDataSource}
 */
anychart.data.View = function(parentView) {
  anychart.data.View.base(this, 'constructor');

  /**
   * The parent view to ask data from.
   * @type {!anychart.data.IView}
   * @protected
   */
  this.parentView = parentView;

  parentView.listen(anychart.enums.EventType.SIGNAL, this.parentViewChangedHandler, false, this);

  this.invalidate(anychart.ConsistencyState.DATA_MASK);
};
goog.inherits(anychart.data.View, anychart.core.Base);


/**
 * Consistency state mask supported by this object.
 * @type {number}
 */
anychart.data.View.prototype.SUPPORTED_SIGNALS = anychart.Signal.DATA_CHANGED;


/**
 * Consistency state mask supported by this object.
 * @type {number}
 */
anychart.data.View.prototype.SUPPORTED_CONSISTENCY_STATES = anychart.ConsistencyState.DATA_MASK;


/**
 * The redirection mask for a view. Each value in this array is an index of the row in parentView to fetch,
 * when that index is asked from the current view.
 * @type {Array.<number>}
 * @protected
 */
anychart.data.View.prototype.mask = null;


/**
 * Mappings cache.
 * @type {Array.<!anychart.data.Mapping>}
 */
anychart.data.View.prototype.mappingsCache = null;


/**
 * Metadata storage.
 * @type {Array.<Object>}
 * @private
 */
anychart.data.View.prototype.metadata_ = null;


/**
 * If the metadata should be passed to the parent view.
 * @type {boolean}
 * @private
 */
anychart.data.View.prototype.transitMeta_ = false;


/**
 * Ensures that the view redirection mask is consistent with the last changes.
 */
anychart.data.View.prototype.ensureConsistent = function() {
  if (this.isConsistent())
    return;
  if (this.metadata_)
    this.metadata_.length = 0;
  this.mappingsCache = null;
  this.mask = this.buildMask();
  this.markConsistent(anychart.ConsistencyState.DATA_MASK);
};


/**
 * Creates a derived view, containing just the same data set and order as this view does.
 * @example <t>lineChart</t>
 *  var data = anychart.data.set([
 *     ['Point A', 231],
 *     ['Point B', 131],
 *     ['Point C', 212],
 *     ['Point D', 94]
 * ]);
 * var view = data.mapAs();
 * var derivedView = view.derive();
 * chart.line(derivedView)
 * @return {!anychart.data.View} The new derived view.
 */
anychart.data.View.prototype.derive = function() {
  var result = new anychart.data.View(this);
  this.registerDisposable(result);
  return result;
};


/**
 * Creates a derived view, containing only the rows that pass the filter.
 * @example <t>listingOnly</t>
 *  // Filter out values lesser or equal to 3:
 *  view.filter('fieldName', function(fieldValue){
 *    return fieldValue > 3;
 *  });
 * @example <t>lineChart</t>
 *  var data = anychart.data.set([
 *     ['Point A', 231],
 *     ['Point B', 131],
 *     ['Point C', 212],
 *     ['Point D', 94],
 *     ['Point E', 194],
 *     ['Point F', 45],
 *     ['Point G', 201]
 * ]);
 * var view = data.mapAs();
 * var filteredView = view.filter('value', function(value){ return value > 100;});
 * chart.line(filteredView);
 * @param {string} fieldName A field which value will be passed to a filter function.
 * @param {function(*):boolean} func A filter function that should accept a field value and return true if the row
 *  should be included into the resulting view.
 * @return {!anychart.data.View} The new derived view.
 */
anychart.data.View.prototype.filter = function(fieldName, func) {
  var result = new anychart.data.FilterView(this, fieldName, func);
  this.registerDisposable(result);
  return result;
};


/**
 * Creates a derived view that ensures sorting by a passed field.
 * @example <t>listingOnly</t>
 *  // Sorting by string length:
 *  view.sort('name', function(value1, value2){
 *    return value1 > value2;
 *  });
 * @example <t>lineChart</t>
 *  var data = anychart.data.set([
 *     ['Point A', 231],
 *     ['Point B', 131],
 *     ['Point C', 212],
 *     ['Point D', 94],
 *     ['Point E', 194],
 *     ['Point F', 45],
 *     ['Point G', 201]
 * ]);
 * var view = data.mapAs();
 * var sortedView = view.sort('value', function(value1, value2){ return value1 > value2;});
 * chart.line(sortedView);
 * @param {string} fieldName A field name to make sort by.
 * @param {(anychart.enums.Sort|function(*, *):number)=} opt_comparatorOrOrder A sorting function that should accept two
 *    field values and return numeric result of the comparison or string value of anychart.enums.Sort enumeration
 *    except NONE. Defaults to anychart.enums.Sort.ASC.
 * @return {!anychart.data.View} The new derived view.
 */
anychart.data.View.prototype.sort = function(fieldName, opt_comparatorOrOrder) {
  var result = new anychart.data.SortView(this, fieldName, opt_comparatorOrOrder);
  this.registerDisposable(result);
  return result;
};


/**
 * Concatenates two views to make a derived view that contains rows from both views.
 * @example <c>Concatenation of two Views</c><t>listingOnly</t>
 * // mainView                      additionalView
 *  [                               [
 *    [1, 3, 5],                        {x: 2, y: 5},
 *    [5, 3, 1]                         {x: 3, y: 7},
 *  ]                                   function(){ return {x: 4, y: 7}}
 *                                  ]
 * mainView.concat(additionalView);
 * // Result mainView
 *  [
 *    [1, 3, 5],
 *    [5, 3, 1],
 *    {x: 2, y: 5},
 *    {x: 3, y: 7},
 *    function(){ return {x: 4, y: 7}}
 *  ]
 * @example <c>Concatenation of a View and a data Set</c><t>listingOnly</t>
 * // mainView
 *  [
 *    [1, 3, 5],
 *    [5, 3, 1]
 *  ]
 * mainView.concat(anychart.data.set([
 *     {x: 2, y: 5},
 *     {x: 3, y: 7},
 *     function(){ return {x: 4, y: 7}}
 *  ]));
 * // Result mainView
 *  [
 *    [1, 3, 5],
 *    [5, 3, 1],
 *    {x: 2, y: 5},
 *    {x: 3, y: 7},
 *    function(){ return {x: 4, y: 7}}
 *  ]
 * @example <c>Concatenation of a View and and Array</c><t>listingOnly</t>
 * // mainView
 *  [
 *    [1, 3, 5],
 *    [5, 3, 1]
 *  ]
 * mainView.concat([2, 2, 2]);
 * // Result mainView
 *  [
 *    [1, 3, 5],
 *    [5, 3, 1],
 *    2,
 *    2,
 *    2
 *  ]
 * @example <t>lineChart</t>
 *  var dataSet1 = anychart.data.set([
 *     ['Point A', 231],
 *     ['Point B', 131],
 *     ['Point C', 212],
 *     ['Point D', 94]
 *  ]);
 *  var dataSet2 = anychart.data.set([
 *     ['Point E', 194],
 *     ['Point F', 45],
 *     ['Point G', 201],
 *     ['Point H', 104]
 * ]);
 * var view1 = dataSet1.mapAs();
 * var view2 = dataSet2.mapAs();
 * var concatinatedView = view1.concat(view2);
 * chart.line(concatinatedView);
 * @param {!(anychart.data.IView|Array)} otherView A view, data set or even an array to concat with.
 * @return {!anychart.data.IView} The new derived view.
 */
anychart.data.View.prototype.concat = function(otherView) {
  if (goog.isArray(otherView))
    otherView = new anychart.data.Set(/** @type {!Array} */(otherView));
  if (anychart.utils.instanceOf(otherView, anychart.data.Set))
    otherView = (/** @type {!anychart.data.Set} */(otherView)).mapAs();
  var result = new anychart.data.ConcatView(this, /** @type {!anychart.data.IView} */(otherView));
  this.registerDisposable(result);
  return result;
};


/**
 * Getter/setter for row.
 * @param {number} rowIndex .
 * @param {*=} opt_value .
 * @return {*} .
 */
anychart.data.View.prototype.row = function(rowIndex, opt_value) {
  this.ensureConsistent();
  rowIndex = this.mask ? this.mask[rowIndex] : rowIndex;
  if (goog.isDef(rowIndex)) {
    return this.parentView.row.apply(this.parentView, arguments);
  }
  return rowIndex; // undefined
};


/**
 * Returns row by index.
 * @param {number} rowIndex
 * @return {*}
 */
anychart.data.View.prototype.getRow = function(rowIndex) {
  return this.row(rowIndex);
};


/**
 * Returns the number of the rows in the current view.
 * @example <t>lineChart</t>
 *  var data = anychart.data.set([
 *     ['Point A', 231],
 *     ['Point B', 131],
 *     ['Point C', 212],
 *     ['Point D', 94]
 * ]);
 * var view = data.mapAs();
 * chart.title().text("rows count: " + view.getRowsCount());
 * chart.line(data)
 * @see anychart.data.Iterator#getRowsCount
 * @return {number} The number of the rows in the set.
 */
anychart.data.View.prototype.getRowsCount = function() {
  this.ensureConsistent();
  return this.mask ? this.mask.length : this.parentView.getRowsCount();
};


/**
* Returns the mapping for the row.
* @param {number} rowIndex The index of the row.
* @return {!anychart.data.Mapping} The mapping for the row.
*/
anychart.data.View.prototype.getRowMapping = function(rowIndex) {
  this.ensureConsistent();
  if (!this.mappingsCache) {
    this.mappingsCache = this.getMappings();
  }
  if (this.mappingsCache.length == 1)
    return this.mappingsCache[0];
  return this.parentView.getRowMapping(this.mask ? this.mask[rowIndex] : rowIndex);
};


/**
 * Returns parent dataset.
 * @return {Array.<anychart.data.Set>} Parent data set.
 */
anychart.data.View.prototype.getDataSets = function() {
  return this.parentView.getDataSets();
};


/** @inheritDoc */
anychart.data.View.prototype.populateObjWithKnownFields = function(result, resultLength) {
  var sets = this.getDataSets();
  for (var i = 0; i < sets.length; i++) {
    resultLength = sets[i].populateObjWithKnownFields(result, resultLength);
  }
  return resultLength;
};


/**
 * Searches fieldName by fieldValue and returns it index (or the first match).
 * @example
 * var chart = anychart.column();
 * var data = anychart.data.set([
 *     {x: 'A1', value: 8},
 *     {x: 'A2', value: 11, fill: 'orange'},
 *     {x: 'A3', value: 12},
 *     {x: 'A4', value: 9}
 * ]);
 * chart.column(data);
 * chart.container(stage).draw();
 * var view = data.mapAs();
 * var index = view.find('x', 'A2');
 * view.set(index, 'x', 'changed');
 * view.set(index, 'fill', 'grey');
 * @param {string} fieldName Name of the field.
 * @param {*} fieldValue Value of the field.
 * @return {number} Index in view.
 */
anychart.data.View.prototype.find = function(fieldName, fieldValue) {
  this.ensureConsistent();
  if (!goog.isDef(fieldName) || !goog.isDef(fieldValue))
    return -1;

  if (!this.cachedValues) this.cachedValues = {};
  if (!this.cachedValues[fieldName]) this.cachedValues[fieldName] = {};

  if (this.cachedValues[fieldName][fieldValue])
    return this.cachedValues[fieldName][fieldValue];

  var iterator = this.getIterator();
  var index = -1;
  var value;

  while (iterator.advance()) {
    index = iterator.getIndex();
    value = iterator.get(fieldName);

    this.cachedValues[fieldName][value] = index;

    if (value == fieldValue) {
      return index;
    }
  }
  return -1;
};


/**
 * Search on unsorted data by passed x field name [default 'x']. Returns array of indexes of found points.
 * @param {*} fieldValue Value to find.
 * @param {boolean} isOrdinal
 * @return {Array.<number>} Point indexes.
 */
anychart.data.View.prototype.findClosestByX = function(fieldValue, isOrdinal) {
  this.ensureConsistent();
  var indexes = [];

  if (goog.isDef(fieldValue)) {
    var iterator = this.getIterator();
    var index = -1;
    var length = Infinity;
    var x, minValue, length_;
    if (!isOrdinal)
      fieldValue = anychart.utils.toNumber(fieldValue);

    iterator.reset();
    while (iterator.advance()) {
      index = iterator.getIndex();
      x = iterator.get('x');
      if (isOrdinal) {
        if (x == fieldValue) {
          indexes.push(index);
        }
      } else {
        x = anychart.utils.toNumber(x);
        if (!isNaN(x)) {
          length_ = Math.abs(x - fieldValue);
          if (length_ < length) {
            length = length_;
            minValue = x;
            indexes.length = 0;
          }
          if (x == minValue) {
            indexes.push(index);
          }
        }
      }
    }
  }

  return /** @type {Array.<number>} */(indexes);
};


/**
 * Search in range of values by passed x field name [default 'x']. Returns array of indexes of found points.
 * @param {number} minValue Minimum range limit.
 * @param {number} maxValue Maximum range limit.
 * @param {boolean=} opt_isOrdinal .
 * @param {string=} opt_fieldName Field name.
 * @return {Array.<number>} indexes.
 */
anychart.data.View.prototype.findInRangeByX = function(minValue, maxValue, opt_isOrdinal, opt_fieldName) {
  this.ensureConsistent();
  if (!goog.isDef(minValue) || !goog.isDef(maxValue))
    return null;

  if (!this.cachedRanges) this.cachedRanges = {};

  var name = minValue + '|' + maxValue;
  if (this.cachedRanges[name]) {
    return this.cachedRanges[name].slice();
  }

  if (minValue > maxValue) {
    var tempValue = minValue;
    minValue = maxValue;
    maxValue = tempValue;
  }

  var iterator = this.getIterator();
  var value, index;
  var fieldName = opt_fieldName || 'x';

  var indexes = [];
  iterator.reset();
  while (iterator.advance()) {
    index = iterator.getIndex();
    value = /** @type {number} */(opt_isOrdinal ? index : iterator.get(fieldName));
    if (value >= minValue && value <= maxValue) {
      indexes.push(index);
    }
  }
  this.cachedRanges[name] = indexes;

  return indexes;
};


/**
 * Gets the value from the row by row index and field name.
 * @example
 * var data = anychart.data.set([
 *     {x: 'A1', value: 8, fill: 'yellow'},
 *     {x: 'A2', value: 11, fill: 'orange'},
 *     {x: 'A3', value: 12, fill: 'red'},
 *     {x: 'A4', value: 9, fill: 'grey'}
 * ]);
 * chart = anychart.column(data);
 * chart.container(stage).draw();
 * var view = data.mapAs();
 * var pointX = view.get(2, 'x');
 * var pointFill = view.get(2, 'fill');
 * chart.title().text('point \''+ pointX +'\' has \'' + pointFill + '\' fill.');
 * @param {number} rowIndex Index of the row to get field value from.
 * @param {string} fieldName The name of the field to be fetched from the current row.
 * @return {*} The field value or undefined, if not found.
 */
anychart.data.View.prototype.get = function(rowIndex, fieldName) {
  if (rowIndex >= this.getRowsCount()) return undefined;
  return this.getRowMapping(rowIndex).getInternal(this.row(rowIndex), rowIndex, fieldName);
};


/**
 * Sets the value to the row field by row index and field name.
 * @example
 * var chart = anychart.columnChart();
 * var data = anychart.data.set([
 *     ['A1', 8],
 *     ['A2', 11],
 *     ['A3', 12],
 *     ['A4', 9]
 * ]);
 * chart.column(data);
 * chart.container(stage).draw();
 * var view = data.mapAs();
 * view.set(2, 'x', 'B1');
 * @param {number} rowIndex
 * @param {string} fieldName
 * @param {*} value
 * @return {!anychart.data.View} Itself for chaining.
 */
anychart.data.View.prototype.set = function(rowIndex, fieldName, value) {
  var row = this.row(rowIndex);
  if (goog.isDef(row))
    this.row(rowIndex, this.getRowMapping(rowIndex).setInternal(row, fieldName, value));
  return this;
};


/**
 * Returns a new iterator for the current view.
 * @example <t>lineChart</t>
 * var data = anychart.data.set([
 *     ['Point A', 231],
 *     ['Point B', 131],
 *     ['Point C', 212],
 *     ['Point D', 94]
 * ]);
 * var view = data.mapAs();
 * var iterator = view.getIterator();
 * // move cursor
 * iterator.select(2);
 * chart.title().text(iterator.get('x') + ' - ' + iterator.get('value'))
 * chart.line(data);
 * @return {!anychart.data.Iterator} New iterator.
 */
anychart.data.View.prototype.getIterator = function() {
  this.ensureConsistent();
  return new anychart.data.Iterator(this);
};


/**
 * Builds redirection mask. The default mask is an equality mask.
 * @return {Array.<number>} The mask.
 * @protected
 */
anychart.data.View.prototype.buildMask = function() {
  return null;
};


/**
 * Handles changes in the parent view.
 * @param {anychart.SignalEvent} event The event object.
 * @protected
 */
anychart.data.View.prototype.parentViewChangedHandler = function(event) {
  this.cachedValues = null;
  this.cachedRanges = null;
  if (event.hasSignal(anychart.Signal.DATA_CHANGED))
    this.invalidate(anychart.ConsistencyState.DATA_MASK, anychart.Signal.DATA_CHANGED);
};


/**
 * Getter/setter for meta.
 * @param {number} index .
 * @param {string} name .
 * @param {*=} opt_value .
 * @return {anychart.data.View|*|undefined} .
 */
anychart.data.View.prototype.meta = function(index, name, opt_value) {
  if (this.transitMeta_) {
    return this.parentMeta.apply(this, arguments);
  }
  if (!this.metadata_) this.metadata_ = [];
  var obj = this.metadata_[index];
  if (!obj)
    this.metadata_[index] = obj = {};
  if (arguments.length > 2) {
    obj[name] = opt_value;
    return this;
  }
  return obj[name];
};


/**
 * Getter and setter for the parent metadata value. Can be overridden in the descendants.
 *
 * ATTENTION: THE CHECK IF IT IS A SETTER IS BASED ON THE NUMBER OF PARAMETERS,
 * e.g. ds.meta(1, 'qqq', undefined); is still a SETTER.
 * @param {number} index A row index.
 * @param {string} name The name of the metadata field.
 * @param {*=} opt_value Value to set.
 * @return {anychart.data.View|*|undefined} Self for chaining or value.
 * @protected
 */
anychart.data.View.prototype.parentMeta = function(index, name, opt_value) {
  index = this.mask ? this.mask[index] : index;
  //TODO(Anton Saukh): fix it to proper error reporting.
  if (!goog.isDef(index))
    throw Error('Index can not be masked by this View');
  if (arguments.length > 2) {
    this.parentView.meta(index, name, opt_value);
    return this;
  } else {
    return this.parentView.meta(index, name);
  }
};


/**
 * Sets metadata transitioning state.
 * @param {boolean} on If the meta should be transitioned.
 */
anychart.data.View.prototype.transitionMeta = function(on) {
  this.transitMeta_ = !!on;
};


/**
 * Checks if there exists at least one row in the view, that returns defined value for that name.
 * @param {string|number} nameOrColumn
 * @return {boolean}
 */
anychart.data.View.prototype.checkFieldExist = function(nameOrColumn) {
  if (!this.mappingsCache) {
    this.mappingsCache = this.getMappings();
  }
  for (var i = 0; i < this.mappingsCache.length; i++) {
    var mapping = this.mappingsCache[i];
    if (mapping.checkFieldExist(nameOrColumn))
      return true;
  }
  return false;
};


/**
 * Checks whether the view has non-object and non-array rows.
 * @return {boolean}
 */
anychart.data.View.prototype.hasSimpleRows = function() {
  return this.parentView.hasSimpleRows();
};


/**
 * Returns all mappings that are related to the view.
 * @return {Array.<!anychart.data.Mapping>}
 */
anychart.data.View.prototype.getMappings = function() {
  return this.parentView.getMappings();
};


/**
 * Serializes the value.
 * @param {*} val
 * @return {*}
 * @private
 */
anychart.data.View.prototype.serializeValue_ = function(val) {
  if (anychart.utils.instanceOf(val, Date))
    val = val.getTime();
  if (!goog.isDef(val) || (goog.isNumber(val) && isNaN(val)))
    val = null;
  return val;
};


/**
 * Serializes and returns one particular row.
 * @param {number} index
 * @return {*}
 */
anychart.data.View.prototype.serializeRow = function(index) {
  var rowObject;
  var row;
  var mapping, map;
  var key;
  var i;
  var val;
  var m;
  row = this.row(index);
  // if row represented by array - convert it to object with help of array mapping.
  if (goog.isArray(row)) {
    // get array mapping for the row
    mapping = this.getRowMapping(index);
    if (mapping.isMappingCustom) {
      rowObject = {};
      m = mapping.getMapping();
      for (key in m) {
        map = m[key];
        for (i = 0; i < map.length; i++) {
          if (map[i] in row) {
            val = this.serializeValue_(row[/** @type {number} */ (map[i])]);
            rowObject[key] = val;
            break;
          }
        }
      }
    } else {
      rowObject = goog.array.map(row, this.serializeValue_);
    }
  } else if (goog.isObject(row)) {
    // if row is presented by object - normalize it to default mapping, because we cannot provide
    // mapping info to the resulting JSON now
    mapping = this.getRowMapping(index);
    if (mapping.isMappingCustom) {
      rowObject = {};
      m = mapping.getMapping();
      for (key in m) {
        map = m[key];
        for (i = 0; i < map.length; i++) {
          if (map[i] in row) {
            val = row[map[i]];
            if (anychart.utils.instanceOf(val, Date))
              val = val.getTime();
            if (!goog.isDef(val) || (goog.isNumber(val) && isNaN(val)))
              val = null;
            rowObject[key] = val;
            break;
          }
        }
      }
      for (key in row) {
        if (row.hasOwnProperty(key) && !(key in m && key in rowObject)) {
          val = this.serializeValue_(row[key]);
          rowObject[key] = val;
        }
      }
    } else {
      rowObject = goog.object.map(row, this.serializeValue_);
    }
  } else {
    if (!goog.isDef(row) || (goog.isNumber(row) && isNaN(row)))
      row = null;
    rowObject = row;
  }
  return rowObject;
};


/**
 * @inheritDoc
 */
anychart.data.View.prototype.serialize = function() {
  var arr = [];

  var iterator = this.getIterator();
  while (iterator.advance()) {
    arr.push(this.serializeRow(iterator.getIndex()));
  }

  return arr;
};


//exports
(function() {
  var proto = anychart.data.View.prototype;
  proto['derive'] = proto.derive;//doc|ex
  proto['filter'] = proto.filter;//doc|ex
  proto['sort'] = proto.sort;//doc|ex
  proto['concat'] = proto.concat;//doc|ex
  proto['row'] = proto.row;//doc|ex
  proto['getRowsCount'] = proto.getRowsCount;//doc|ex
  proto['getIterator'] = proto.getIterator;//doc|ex
  proto['getDataSets'] = proto.getDataSets;//doc|ex
  proto['meta'] = proto.meta;//doc|need-ex
  proto['get'] = proto.get;//doc|ex
  proto['set'] = proto.set;//doc|ex
  proto['find'] = proto.find;//doc|ex
})();
