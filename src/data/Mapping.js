goog.provide('anychart.data.Mapping');

goog.require('anychart.core.reporting');
goog.require('anychart.data.View');
goog.require('anychart.utils');
goog.require('goog.array');



/**
 * Special View which allows to map anychart.data.Set storages.
 * @param {!(anychart.data.Set|anychart.data.IView)} parentSet - The data set to map.
 * @param {!Object.<Array.<number|string>>=} opt_mapping - Mapping for rows (array or object).
 * @constructor
 * @extends {anychart.data.View}
 */
anychart.data.Mapping = function(parentSet, opt_mapping) {
  anychart.data.Mapping.base(this, 'constructor', parentSet);
  this.initMappingInfo(opt_mapping);
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
    var indexes = this.mapping_[fieldName];
    if (indexes) {
      for (var i = 0; i < indexes.length; i++) {
        if (indexes[i] < row.length) {
          result = row[indexes[i]];
          break;
        }
      }
    }
  } else if (rowType == 'object') {
    result = anychart.utils.mapObject(/** @type {!Object} */(row), fieldName, this.mapping_[fieldName]);
  } else if (goog.array.indexOf(anychart.data.Mapping.DEFAULT_SIMPLE_ROW_MAPPING, fieldName) > -1) {
    result = row;
  }
  if (!goog.isDef(result) && goog.array.indexOf(anychart.data.Mapping.DEFAULT_INDEX_MAPPING, fieldName) > -1) {
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
    var indexes = this.mapping_[fieldName];
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
    var result = anychart.utils.mapObject(/** @type {!Object} */(row), fieldName, this.mapping_[fieldName], value);
    // result will be undefined if there no such field in row, but row will have property because it will be set.
    if ((result === void 0) && row.hasOwnProperty(fieldName)) {
      this.parentView.addSeenField(fieldName);
    }
  } else if (goog.array.indexOf(anychart.data.Mapping.DEFAULT_SIMPLE_ROW_MAPPING, fieldName) > -1) {
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
  var mapping = anychart.data.Mapping.DEFAULT_INDEX_MAPPING;
  for (i = 0; i < mapping.length; i++) {
    if (mapping[i] == name)
      return true;
  }
  if (this.parentView.hasSimpleRows()) {
    mapping = anychart.data.Mapping.DEFAULT_SIMPLE_ROW_MAPPING;
    for (i = 0; i < mapping.length; i++) {
      if (mapping[i] == name)
        return true;
    }
  }
  mapping = this.mapping_[name];
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
 * @type {!Object.<Array.<number|string>>}
 */
anychart.data.Mapping.DEFAULT_MAPPING = {
  'x': [0, 'column', 'x'],
  'value': [1, 0, 'value', 'y', 'close', 'heat'],
  'size': [2, 1], // bubble series
  'open': [1],
  'high': [2],
  'low': [3, 1],
  'close': [4],

  // box/whisker series
  'lowest': [1, 'lowest', 'low'],
  'q1': [2],
  'median': [3],
  'q3': [4],
  'highest': [5, 'highest', 'high'],
  'outliers': [6],

  // maps
  'id': [0],
  'lat': [0, 'lat', 'y', 'value'],
  'long': [1, 'long', 'lon', 'x'],
  'points': [0],  //connector series

  // heat map
  'y': [1, 'row', 'y'],
  'heat': [2, 'heat', 'value'],

  // tag cloud
  'category': [2],

  // water fall
  'isTotal': [2],

  // sankey diagram
  'from': [0],
  'to': [1],
  'weight': [2, 'value', 'flow', 'weight'],

  // surface
  'z': [2],

  // timeline
  'name': [0],
  'start': [1],
  'end': [2]
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
 * @param {!(Object.<Array.<number|string>>)=} opt_mapping - Mapping settings for rows.
 * @protected
 */
anychart.data.Mapping.prototype.initMappingInfo = function(opt_mapping) {
  var i;
  if (goog.isObject(opt_mapping)) {
    for (i in opt_mapping) {
      if (!goog.isArray(opt_mapping[i]))
        opt_mapping[i] = [opt_mapping[i]];
    }
  } else {
    opt_mapping = undefined;
  }
  this.isMappingCustom = !!opt_mapping;


  /**
   * Mapping settings for rows.
   * @type {!Object.<Array.<number|string>>}
   * @private
   */
  this.mapping_ = /** @type {!Object.<Array.<number|string>>} */(opt_mapping) || anychart.data.Mapping.DEFAULT_MAPPING;
};


/**
 * Getter for mapping.
 * @return {!Object.<Array.<number|string>>} - Mapping.
 */
anychart.data.Mapping.prototype.getMapping = function() {
  return this.mapping_;
};


//exports
(function() {
  var proto = anychart.data.Mapping.prototype;
  goog.exportSymbol('anychart.data.Mapping.DEFAULT_MAPPING', anychart.data.Mapping.DEFAULT_MAPPING);
  goog.exportSymbol('anychart.data.Mapping.DEFAULT_SIMPLE_ROW_MAPPING', anychart.data.Mapping.DEFAULT_SIMPLE_ROW_MAPPING);
  goog.exportSymbol('anychart.data.Mapping.DEFAULT_INDEX_MAPPING', anychart.data.Mapping.DEFAULT_INDEX_MAPPING);
  proto['getRowsCount'] = proto.getRowsCount;
  proto['getIterator'] = proto.getIterator;
  proto['row'] = proto.row;
  proto['getMapping'] = proto.getMapping;
})();
