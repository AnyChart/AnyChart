goog.provide('anychart.data.TableMapping');
goog.require('anychart.core.Base');
goog.require('anychart.data.TableSelectable');
goog.require('anychart.enums');
goog.require('anychart.utils');



/**
 * Table mapping constructor.
 * @param {!anychart.data.Table} table
 * @param {Object.<({
 *    column:(number|string),
 *    type:(anychart.enums.AggregationType|anychart.data.TableMapping.CustomFieldType),
 *    weights:(number|string|undefined)
 * }|number|string)>=} opt_fields An
 *   object where keys are field names and values are
 *   objects with fields:
 *      - 'column': (number|string) - Column index or object field name, that the field should get values from;
 *      - 'type': (anychart.enums.AggregationType|anychart.data.TableMapping.CustomFieldType) - How to group values for the field. Defaults to 'close'.
 *      - 'weights': (number|string) - Column to get weights from for 'weightedAverage' grouping type. Note: If type set to
 *          'weightedAverage', but opt_weightsColumn is not passed - uses 'average' grouping instead.
 *   or (numbers|strings) - just the field name to get values from. In this case the grouping type will be determined from
 *      field name.
 * @constructor
 * @extends {anychart.core.Base}
 */
anychart.data.TableMapping = function(table, opt_fields) {
  anychart.data.TableMapping.base(this, 'constructor');

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
        this.addField(name, field['column'], field['type'], field['context'] || field['weights']);
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
 *   sourceColumn: (number|string),
 *   resultColumn: number
 * }}
 */
anychart.data.TableMapping.Field;


/**
 * Custom field grouping calculation complex.
 * @typedef {({reset:function(),considerItem:function(*,(Array|Object)),getResult:function():*}|function(Array, Array))}
 */
anychart.data.TableMapping.CustomFieldType;


/**
 * Gets field descriptors hash map.
 * Internal use only.
 * @return {!Object.<string, !anychart.data.TableMapping.Field>}
 */
anychart.data.TableMapping.prototype.getFieldsInternal = function() {
  return this.fields_;
};


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
 * @param {(anychart.enums.AggregationType|anychart.data.TableMapping.CustomFieldType)=} opt_typeOrCalculator
 *    How to group values for the field. Being not passed the value is determined from the field name.
 * @param {(number|string|*)=} opt_context Column to get weights from for 'weightedAverage' grouping type.
 *     If opt_typeOrCalculator set to 'weightedAverage', but opt_weightsColumn is not passed - uses 'average' grouping instead.
 * @return {anychart.data.TableMapping} This for chaining.
 */
anychart.data.TableMapping.prototype.addField = function(name, column, opt_typeOrCalculator, opt_context) {
  var sourceColumn;
  if (goog.isNumber(column)) {
    sourceColumn = Math.round(anychart.utils.toNumber(column));
  } else if (goog.isString(column)) {
    sourceColumn = this.table_.getComputedColumnIndexByAlias(column);
    if (isNaN(sourceColumn)) { // column is not known to be a computed field alias - that's probably a source field name
      sourceColumn = column;
    }
  } else {
    return this; // invalid mapping, ignoring.
  }
  if (goog.isNumber(sourceColumn) && sourceColumn < 0) { // that's a computed field - no need to notify table
    // if it is a computed field - it has the same index in both aggregated and non-aggregated storages.
    this.fields_[name] = {
      sourceColumn: sourceColumn,
      resultColumn: sourceColumn
    };
  } else if (goog.isString(sourceColumn) || !isNaN(sourceColumn)) {
    var typeIsCalculator = goog.isObject(opt_typeOrCalculator);
    if (typeIsCalculator &&
        !goog.isFunction(opt_typeOrCalculator) &&
        !(
            ('reset' in opt_typeOrCalculator) &&
            ('considerItem' in opt_typeOrCalculator) &&
            ('getResult' in opt_typeOrCalculator)
        )) {
      return this; // an object wannabe calculator with wrong fields - ignoring.
    }
    var type = typeIsCalculator ? // this includes the case when opt_typeOrCalculator is a function
        /** @type {anychart.data.TableMapping.CustomFieldType} */(opt_typeOrCalculator) :
        anychart.enums.normalizeAggregationType(goog.isDef(opt_typeOrCalculator) ? opt_typeOrCalculator : name);
    var context = opt_context;
    if (type == anychart.enums.AggregationType.WEIGHTED_AVERAGE) {
      if (goog.isNumber(opt_context)) {
        context = Math.round(opt_context);
      } else if (goog.isString(opt_context)) {
        context = this.table_.getComputedColumnIndexByAlias(opt_context);
        if (isNaN(context)) { // column is not a known computed field alias - that's probably a source field name
          context = opt_context;
        }
      } else {
        context = NaN;
      }
      if (goog.isNumber(context) && isNaN(context)) // it can be only a string or a number or NaN
        type = anychart.enums.AggregationType.AVERAGE;
    }
    this.table_.suspendSignalsDispatching();
    var resultColumn = this.table_.registerField(sourceColumn, type, context);
    this.fields_[name] = {
      sourceColumn: sourceColumn,
      resultColumn: resultColumn
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


//proto['getAggregateColumn'] = proto.getAggregateColumn;
//proto['getSourceColumn'] = proto.getSourceColumn;
//proto['getTable'] = proto.getTable;

//exports
(function() {
  var proto = anychart.data.TableMapping.prototype;
  proto['addField'] = proto.addField;
  proto['createSelectable'] = proto.createSelectable;
})();
