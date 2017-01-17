goog.provide('anychart.data.Mapping');

goog.require('anychart.core.reporting');
goog.require('anychart.data.View');
goog.require('anychart.utils');
goog.require('goog.array');



/**
 * Special View which allows to map anychart.data.Set storages.
 * @param {!(anychart.data.Set|anychart.data.IView)} parentSet The data set to map.
 * @param {!Object.<Array.<number>>=} opt_arrayMapping Mapping for array rows.
 * @param {!Object.<Array.<string>>=} opt_objectMapping Mapping for object rows.
 * @param {!Array.<string>=} opt_defaultProps Mapping for rows which are string, number or a function.
 *    Doesn't work if a row is an object.
 * @param {!Array.<string>=} opt_indexProps Array of the names in case other options fail.
 * @param {boolean=} opt_writeToFirstFieldByMapping If true, in case of object rows, values are written to the first
 *    fieldName, defined by object field mapping (they are written to the field they are read from by default).
 * @constructor
 * @extends {anychart.data.View}
 */
anychart.data.Mapping = function(parentSet, opt_arrayMapping, opt_objectMapping, opt_defaultProps, opt_indexProps,
    opt_writeToFirstFieldByMapping) {
  anychart.data.Mapping.base(this, 'constructor', parentSet);
  this.initMappingInfo(opt_arrayMapping, opt_objectMapping, opt_defaultProps, opt_indexProps, opt_writeToFirstFieldByMapping);
};
goog.inherits(anychart.data.Mapping, anychart.data.View);


/**
 * Consistency states supported by this object.
 * @type {number}
 */
anychart.data.Mapping.prototype.SUPPORTED_SIGNALS = anychart.Signal.DATA_CHANGED;


/**
 * Mapping doesn't support DATA dirty state.
 * @type {number}
 */
anychart.data.Mapping.prototype.SUPPORTED_CONSISTENCY_STATES = 0;


/**
 * Fetches a field value from the row by its  name. Returns undefined, if no matching field found.
 * @param {*} row The row to fetch field value from.
 * @param {number} rowIndex The index of the row to be able to use it as a field value in some cases.
 * @param {string} fieldName The name of the field to fetch from the row.
 * @return {*} The field value or undefined if not found.
 */
anychart.data.Mapping.prototype.getInternal = function(row, rowIndex, fieldName) {
  /** @type {*} */
  var result;
  /** @type {string} */
  var rowType = goog.typeOf(row);
  if (rowType == 'array') {
    /** @type {Array.<number>} */
    var indexes = this.arrayMapping_[fieldName];
    if (indexes) {
      for (var i = 0; i < indexes.length; i++) {
        if (indexes[i] < row.length) {
          result = row[indexes[i]];
          break;
        }
      }
    }
  } else if (rowType == 'object') {
    result = anychart.utils.mapObject(/** @type {!Object} */(row), fieldName, this.objectMapping_[fieldName]);
  } else if (goog.array.indexOf(this.defaultProps_, fieldName) > -1) {
    result = row;
  }
  if (!goog.isDef(result) && goog.array.indexOf(this.indexProps_, fieldName) > -1) {
    result = rowIndex;
  }
  return result;
};


/**
 * Sets field of the row to the specified value and returns the row.
 * @param {*} row The row to fetch field value from.
 * @param {string} fieldName The name of the field to fetch from the row.
 * @param {*} value The value to set.
 * @return {*} The row with new value set (because in some cases the total row need to be changed and reset to data.Set).
 */
anychart.data.Mapping.prototype.setInternal = function(row, fieldName, value) {
  /** @type {string} */
  var rowType = goog.typeOf(row);
  if (rowType == 'array') {
    /** @type {Array.<number>} */
    var indexes = this.arrayMapping_[fieldName];
    if (indexes) {
      var minIndex = indexes[0];
      for (var i = 0; i < indexes.length; i++) {
        if (indexes[i] < row.length) {
          row[indexes[i]] = value;
          return row;

        // select min index
        } else if (indexes[i] < minIndex) {
          minIndex = indexes[i];
        }
      }

      // DVF-1357 set value by min index
      row[minIndex] = value;
      return row;

    }
    anychart.core.reporting.warning(anychart.enums.WarningCode.NOT_MAPPED_FIELD, null, [fieldName]);
  } else if (rowType == 'object') {
    anychart.utils.mapObject(/** @type {!Object} */(row), fieldName, this.objectMapping_[fieldName], value,
        this.writeToFirstFieldByMapping_);
  } else if (goog.array.indexOf(this.defaultProps_, fieldName) > -1) {
    if (anychart.DEVELOP && (goog.isArray(value) || goog.isObject(value)))
      anychart.core.reporting.warning(anychart.enums.WarningCode.COMPLEX_VALUE_TO_DEFAULT_FIELD, null, [fieldName]);
    row = value;
  } else {
    anychart.core.reporting.warning(anychart.enums.WarningCode.NOT_OBJECT_OR_ARRAY, null, [fieldName]);
  }
  return row;
};


/** @inheritDoc */
anychart.data.Mapping.prototype.getRowMapping = function(rowIndex) {
  return this;
};


/** @inheritDoc */
anychart.data.Mapping.prototype.getMappings = function() {
  return [this];
};


/** @inheritDoc */
anychart.data.Mapping.prototype.row = function(rowIndex, opt_value) {
  return this.parentView.row.apply(this.parentView, arguments);
};


/** @inheritDoc */
anychart.data.Mapping.prototype.getRowsCount = function() {
  return this.parentView.getRowsCount();
};


/** @inheritDoc */
anychart.data.Mapping.prototype.parentViewChangedHandler = function(event) {
  this.cachedValues = null;
  if (event.hasSignal(anychart.Signal.DATA_CHANGED))
    this.dispatchSignal(anychart.Signal.DATA_CHANGED);
};


/** @inheritDoc */
anychart.data.Mapping.prototype.checkFieldExist = function(name) {
  if (this.parentView.checkFieldExist(name))
    return true;
  var i;
  var mapping = this.indexProps_;
  for (i = 0; i < mapping.length; i++) {
    if (mapping[i] == name)
      return true;
  }
  if (this.parentView.hasSimpleRows()) {
    mapping = this.defaultProps_;
    for (i = 0; i < mapping.length; i++) {
      if (mapping[i] == name)
        return true;
    }
  }
  mapping = this.objectMapping_[name];
  if (mapping) {
    for (i = 0; i < mapping.length; i++) {
      if (this.parentView.checkFieldExist(mapping[i]))
        return true;
    }
  }
  mapping = this.arrayMapping_[name];
  if (mapping) {
    for (i = 0; i < mapping.length; i++) {
      if (this.parentView.checkFieldExist(mapping[i]))
        return true;
    }
  }
  return false;
};


/**
 * @const
 * @type {!Object.<Array.<number>>}
 */
anychart.data.Mapping.DEFAULT_ARRAY_MAPPING = {
  'x': [0],
  'value': [1, 0],
  'size': [2, 1], // bubble series
  'open': [1],
  'high': [2],
  'low': [3, 1],
  'close': [4],

  // box/whisker series
  'lowest': [1],
  'q1': [2],
  'median': [3],
  'q3': [4],
  'highest': [5],
  'outliers': [6],

  // maps
  'id': [0],
  'lat': [0],
  'long': [1],
  'points': [0],  //connector series

  // heat map
  'y': [1],
  'heat': [2]
};


/**
 * @const
 * @type {!Object.<Array.<string>>}
 */
anychart.data.Mapping.DEFAULT_OBJECT_MAPPING = {
  //'x': ['x'], // this mapping entry can be omitted cause of defaults
  'x': ['column', 'x'],
  'value': ['value', 'y', 'close', 'heat'], // 'value' here enforces checking order

  'lowest': ['lowest', 'low'],
  'highest': ['highest', 'high'],
  //for maps
  'lat': ['lat', 'y', 'value'],
  'long': ['long', 'lon', 'x'],
  //for heat map

  'y': ['row', 'y'],
  'heat': ['heat', 'value']
};


/**
 * @const
 * @type {!Array<string>}
 */
anychart.data.Mapping.DEFAULT_SIMPLE_ROW_MAPPING = ['value', 'close'];


/**
 * @const
 * @type {!Array<string>}
 */
anychart.data.Mapping.DEFAULT_INDEX_MAPPING = ['x'];


/**
 * Initializes mapping info objects for the mapping.
 * @param {!Object.<(Array.<number>|number)>=} opt_arrayMapping Mapping settings for array rows.
 * @param {!Object.<(Array.<string>|string)>=} opt_objectMapping Mapping setting for object rows.
 * @param {!Array.<string>=} opt_defaultProps Mapping for rows which are string, number or a function.
 *    Doesn't work if a row is an object.
 * @param {!Array.<string>=} opt_indexProps Array of the names in case other options fail.
 * @param {boolean=} opt_writeToFirstFieldByMapping If true, in case of object rows, values are written to the first
 *    fieldName, defined by object field mapping (they are written to the field they are read from by default).
 * @protected
 */
anychart.data.Mapping.prototype.initMappingInfo = function(opt_arrayMapping, opt_objectMapping, opt_defaultProps, opt_indexProps,
    opt_writeToFirstFieldByMapping) {
  var i;
  if (goog.isObject(opt_arrayMapping)) {
    for (i in opt_arrayMapping) {
      if (!goog.isArray(opt_arrayMapping[i]))
        opt_arrayMapping[i] = [opt_arrayMapping[i]];
    }
  } else {
    opt_arrayMapping = undefined;
  }
  this.isArrayMappingCustom = !!opt_arrayMapping;

  if (goog.isObject(opt_objectMapping)) {
    for (i in opt_objectMapping) {
      if (!goog.isArray(opt_objectMapping[i]))
        opt_objectMapping[i] = [opt_objectMapping[i]];
    }
  } else {
    opt_objectMapping = undefined;
  }
  this.isObjectMappingCustom = !!opt_objectMapping;

  /**
   * Mapping settings for array rows.
   * @type {!Object.<Array.<number>>}
   * @private
   */
  this.arrayMapping_ = /** @type {!Object.<Array.<number>>} */(opt_arrayMapping) || anychart.data.Mapping.DEFAULT_ARRAY_MAPPING;

  /**
   * Mapping settings for object rows.
   * @type {!Object.<Array.<string>>}
   * @private
   */
  this.objectMapping_ = /** @type {!Object.<Array.<string>>} */(opt_objectMapping) || anychart.data.Mapping.DEFAULT_OBJECT_MAPPING;

  /**
   * Mapping array for the fields where values can be taken as a row value
   * is it not an object or an array.
   * @type {!Array.<string>}
   * @private
   */
  this.defaultProps_ = opt_defaultProps || anychart.data.Mapping.DEFAULT_SIMPLE_ROW_MAPPING;

  /**
   * Mapping array for the fields where values can be taken as an index of a row
   * is it not an object or an array.
   * @type {!Array.<string>}
   * @private
   */
  this.indexProps_ = opt_indexProps || anychart.data.Mapping.DEFAULT_INDEX_MAPPING;

  this.writeToFirstFieldByMapping_ = !!opt_writeToFirstFieldByMapping;
};


/**
 * Getter for array mapping.
 * @return {!Object.<Array.<number>>} Array mapping.
 */
anychart.data.Mapping.prototype.getArrayMapping = function() {
  return this.arrayMapping_;
};


/**
 * Getter for object mapping.
 * @return {!Object.<Array.<string>>} Object mapping.
 */
anychart.data.Mapping.prototype.getObjectMapping = function() {
  return this.objectMapping_;
};


/**
 * Getter for simple row mapping.
 * @return {!Array.<string>} Simple row mapping.
 */
anychart.data.Mapping.prototype.getSimpleRowMapping = function() {
  return this.defaultProps_;
};


/**
 * Getter for index mapping.
 * @return {!Array.<string>} Simple row mapping.
 */
anychart.data.Mapping.prototype.getIndexMapping = function() {
  return this.indexProps_;
};


//exports
(function() {
  var proto = anychart.data.Mapping.prototype;
  goog.exportSymbol('anychart.data.Mapping.DEFAULT_ARRAY_MAPPING', anychart.data.Mapping.DEFAULT_ARRAY_MAPPING);
  goog.exportSymbol('anychart.data.Mapping.DEFAULT_OBJECT_MAPPING', anychart.data.Mapping.DEFAULT_OBJECT_MAPPING);
  goog.exportSymbol('anychart.data.Mapping.DEFAULT_SIMPLE_ROW_MAPPING', anychart.data.Mapping.DEFAULT_SIMPLE_ROW_MAPPING);
  goog.exportSymbol('anychart.data.Mapping.DEFAULT_INDEX_MAPPING', anychart.data.Mapping.DEFAULT_INDEX_MAPPING);
  proto['getRowsCount'] = proto.getRowsCount;
  proto['getIterator'] = proto.getIterator;
  proto['row'] = proto.row;
  proto['getArrayMapping'] = proto.getArrayMapping;
  proto['getObjectMapping'] = proto.getObjectMapping;
  proto['getSimpleRowMapping'] = proto.getSimpleRowMapping;
  proto['getIndexMapping'] = proto.getIndexMapping;
})();
