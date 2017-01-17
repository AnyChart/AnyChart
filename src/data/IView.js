goog.provide('anychart.data.IView');
goog.require('goog.events.Listenable');



/**
 * A common part between anychart.data.Set and anychart.data.View.
 * @interface
 * @extends {goog.events.Listenable}
 */
anychart.data.IView = function() {
};


/**
 * Gets or sets the full row of the set by its index. If there is no any row for the index - returns undefined.
 * If used as a setter - returns the previous value of the row (don't think it saves the previous state of objects
 * stored by reference - it doesn't).
 *
 * NOTE: The number of parameters is the only thing that matters in determining if it is a setter or a getter!
 *
 * @param {number} rowIndex Index of the row to fetch.
 * @param {*=} opt_value If passed, the method is treated as a setter.
 * @return {*} The full row current or previous value. May be anything including undefined.
 */
anychart.data.IView.prototype.row = function(rowIndex, opt_value) {};


/**
 * Returns the size of the data set (number of rows).
 * @return {number} Number of rows in the set.
 */
anychart.data.IView.prototype.getRowsCount = function() {};


/**
 * Returns the mapping for the row.
 * @param {number} rowIndex Index of the row.
 * @return {!anychart.data.Mapping} Mapping for the row.
 */
anychart.data.IView.prototype.getRowMapping = function(rowIndex) {};


/**
 * Returns all mappings that are related to the view.
 * @return {Array.<anychart.data.Mapping>}
 */
anychart.data.IView.prototype.getMappings = function() {};


/**
 * Checks whether the field exists.
 * @param {string|number} nameOrColumn
 * @return {boolean}
 */
anychart.data.IView.prototype.checkFieldExist = function(nameOrColumn) {};


/**
 * Checks whether the view has non-object and non-array rows.
 * @return {boolean}
 */
anychart.data.IView.prototype.hasSimpleRows = function() {};


/**
 * Getter/setter for meta.
 * @param {number} rowIndex .
 * @param {string} name .
 * @param {*=} opt_value .
 * @return {anychart.data.View|*|undefined} .
 */
anychart.data.IView.prototype.meta = function(rowIndex, name, opt_value) {};
