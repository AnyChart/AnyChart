goog.provide('anychart.data.Mapping');

goog.require('anychart.data.View');
goog.require('anychart.utils');
goog.require('goog.array');



/**
 * Soecial View which allows to map anychart.data.Set storages.
 * @param {!anychart.data.Set} parentSet The data set to map.
 * @param {!Object.<Array.<number>>=} opt_arrayMapping Mapping for array rows.
 * @param {!Object.<Array.<string>>=} opt_objectMapping Mapping for object rows.
 * @param {!Array.<string>=} opt_defaultProps Mapping for rows which are string, number or a function.
 *    Doesn't work if a row is an object.
 * @param {!Array.<string>=} opt_indexProps Array of the names in case other options fail.
 * @constructor
 * @extends {anychart.data.View}
 */
anychart.data.Mapping = function(parentSet, opt_arrayMapping, opt_objectMapping, opt_defaultProps, opt_indexProps) {
  goog.base(this, parentSet);
  this.initMappingInfo(opt_arrayMapping, opt_objectMapping, opt_defaultProps, opt_indexProps);
};
goog.inherits(anychart.data.Mapping, anychart.data.View);


/**
 * Conistency states supported by this object.
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
anychart.data.Mapping.prototype.get = function(row, rowIndex, fieldName) {
  /** @type {*} */
  var result;
  if (goog.isDefAndNotNull(row)) {
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
  }
  return result;
};


/** @inheritDoc */
anychart.data.Mapping.prototype.getRowMapping = function(rowIndex) {
  return this;
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
  if (event.hasSignal(anychart.Signal.DATA_CHANGED))
    this.dispatchSignal(anychart.Signal.DATA_CHANGED);
};


/**
 * Initializes mapping info objects for the mapping.
 * @param {!Object.<Array.<number>>=} opt_arrayMapping Mapping settings for array rows.
 * @param {!Object.<Array.<string>>=} opt_objectMapping Mapping setting for object rows.
 * @param {!Array.<string>=} opt_defaultProps Mapping for rows which are string, number or a function.
 *    Doesn't work if a row is an object.
 * @param {!Array.<string>=} opt_indexProps Array of the names in case other options fail.
 * @protected
 */
anychart.data.Mapping.prototype.initMappingInfo = function(opt_arrayMapping, opt_objectMapping, opt_defaultProps, opt_indexProps) {
  /**
   * Mapping settings for array rows.
   * @type {!Object.<Array.<number>>}
   * @private
   */
  this.arrayMapping_ = opt_arrayMapping || {
    'x': [0],
    'value': [1, 0],
    'size': [2], // bubble series
    'open': [1],
    'high': [2],
    'low': [3, 1],
    'close': [4]
  };

  /**
   * Mapping settings for object rows.
   * @type {!Object.<Array.<string>>}
   * @private
   */
  this.objectMapping_ = opt_objectMapping || {
    //'x': ['x'], // this mapping entry can be omitted cause of defaults
    'value': ['value', 'y', 'close'] // 'value' here enforces checking order
  };

  /**
   * Mapping array for the fields where values can be taken as a row value
   * is it not an object or an array.
   * @type {!Array.<string>}
   * @private
   */
  this.defaultProps_ = opt_defaultProps || ['value', 'close'];

  /**
   * Mapping array for the fields where values can be taken as an index of a row
   * is it not an object or an array.
   * @type {!Array.<string>}
   * @private
   */
  this.indexProps_ = opt_indexProps || ['x'];
};


/**
 * Getter for array mapping.
 * @return {!Object.<Array.<number>>} Array mapping.
 */
anychart.data.Mapping.prototype.getArrayMapping = function() {
  return this.arrayMapping_;
};


//exports
anychart.data.Mapping.prototype['row'] = anychart.data.Mapping.prototype.row;//in docs/final
anychart.data.Mapping.prototype['getRowsCount'] = anychart.data.Mapping.prototype.getRowsCount;//in docs/final
anychart.data.Mapping.prototype['getIterator'] = anychart.data.Mapping.prototype.getIterator;//in docs/final
