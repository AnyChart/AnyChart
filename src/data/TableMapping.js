goog.provide('anychart.data.TableMapping');
goog.require('anychart.core.Base');
goog.require('anychart.data.TableSelectable');
goog.require('anychart.enums');
goog.require('anychart.utils');



/**
 * Table mapping constructor.
 * @param {!anychart.data.Table} table
 * @param {Object.<({column:(number|string), type:anychart.enums.AggregationType, weights:(number|string)}|number|string)>=} opt_fields An
 *   object where keys are field names and values are
 *   objects with fields:
 *      - 'column': (number|string) - Column index or object field name, that the field should get values from;
 *      - 'type': anychart.enums.AggregationType - How to group values for the field. Defaults to 'close'.
 *      - 'weights': (number|string) - Column to get weights from for 'weightedAverage' grouping type. Note: If type set to
 *          'weightedAverage', but opt_weightsColumn is not passed - uses 'average' grouping instead.
 *   or (numbers|strings) - just the field name to get values from. In this case the grouping type will be determined from
 *      field name.
 * @constructor
 * @extends {anychart.core.Base}
 */
anychart.data.TableMapping = function(table, opt_fields) {
  goog.base(this);

  /**
   * Table reference.
   * @type {!anychart.data.Table}
   * @private
   */
  this.table_ = table;

  /**
   * Field descriptors hash map.
   * @type {!Object.<string, !anychart.data.TableMapping.Field>}
   * @private
   */
  this.fields_ = {};

  if (goog.isObject(opt_fields)) {
    this.table_.suspendSignalsDispatching();
    for (var name in opt_fields) {
      var field = opt_fields[name];
      if (goog.isObject(field))
        this.addField(name, field['column'], field['type'], field['weights']);
      else if (goog.isNumber(field) || goog.isString(field))
        this.addField(name, field);
    }
    this.table_.resumeSignalsDispatching(true);
  }
};
goog.inherits(anychart.data.TableMapping, anychart.core.Base);


/**
 * Internal descriptor of the field
 * @typedef {{
 *   aggregationType: anychart.enums.AggregationType,
 *   sourceColumn: (number|string),
 *   weightsColumn: (number|string),
 *   resultColumn: number,
 *   artificial: boolean
 * }}
 */
anychart.data.TableMapping.Field;


/**
 * Returns new selectable object for the mapping.
 * @return {!anychart.data.TableSelectable}
 */
anychart.data.TableMapping.prototype.createSelectable = function() {
  return new anychart.data.TableSelectable(this);
};


/**
 * Adds a field to the mapping.
 * @param {string} name Name of the field to add.
 * @param {number|string} column Column index or field name, that the field should get values from.
 * @param {anychart.enums.AggregationType=} opt_type How to group values for the field. Defaults to 'close'.
 * @param {(number|string)=} opt_weightsColumn Column to get weights from for 'weightedAverage' grouping type.
 *     If opt_type set to 'weightedAverage', but opt_weightsColumn is not passed - uses 'average' grouping instead.
 * @return {anychart.data.TableMapping} This for chaining.
 */
anychart.data.TableMapping.prototype.addField = function(name, column, opt_type, opt_weightsColumn) {
  var sourceColumn = goog.isString(column) ?
      column :
      anychart.utils.normalizeToNaturalNumber(column, NaN, true);
  var weightsColumn = goog.isString(opt_weightsColumn) ?
      opt_weightsColumn :
      anychart.utils.normalizeToNaturalNumber(opt_weightsColumn, NaN, true);
  var type = anychart.enums.normalizeAggregationType(goog.isDef(opt_type) ? opt_type : name);
  if (type == anychart.enums.AggregationType.WEIGHTED_AVERAGE && goog.isNumber(weightsColumn) && isNaN(weightsColumn))
    type = anychart.enums.AggregationType.AVERAGE;
  if (goog.isString(sourceColumn) || !isNaN(sourceColumn)) {
    this.table_.suspendSignalsDispatching();
    var resultColumn = this.table_.registerField(sourceColumn, opt_type, weightsColumn);
    this.fields_[name] = {
      aggregationType: type,
      sourceColumn: sourceColumn,
      weightsColumn: weightsColumn,
      resultColumn: resultColumn,
      artificial: false
    };
    this.table_.resumeSignalsDispatching(true);
  }
  return this;
};


/**
 * Returns aggregate column by field name.
 * @param {string} fieldName
 * @return {number}
 */
anychart.data.TableMapping.prototype.getAggregateColumn = function(fieldName) {
  if (fieldName in this.fields_)
    return this.fields_[fieldName].resultColumn;
  else
    return NaN;
};


/**
 * Returns source column by field name.
 * @param {string} fieldName
 * @return {number|string}
 */
anychart.data.TableMapping.prototype.getSourceColumn = function(fieldName) {
  if (fieldName in this.fields_)
    return this.fields_[fieldName].sourceColumn;
  else
    return NaN;
};


/**
 * Returns mapping original table.
 * @return {!anychart.data.Table}
 */
anychart.data.TableMapping.prototype.getTable = function() {
  return this.table_;
};


//anychart.data.TableMapping.prototype['getAggregateColumn'] = anychart.data.TableMapping.prototype.getAggregateColumn;
//anychart.data.TableMapping.prototype['getSourceColumn'] = anychart.data.TableMapping.prototype.getSourceColumn;
//anychart.data.TableMapping.prototype['getTable'] = anychart.data.TableMapping.prototype.getTable;

//exports
anychart.data.TableMapping.prototype['addField'] = anychart.data.TableMapping.prototype.addField;
anychart.data.TableMapping.prototype['createSelectable'] = anychart.data.TableMapping.prototype.createSelectable;
