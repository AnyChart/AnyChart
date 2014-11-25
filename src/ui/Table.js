goog.provide('anychart.ui.Table');
goog.require('anychart.core.ui.Table');



/**
 * @param {number=} opt_rowsCount Number of rows in the table.
 * @param {number=} opt_colsCount Number of columns in the table.
 * @constructor
 * @extends {anychart.core.ui.Table}
 */
anychart.ui.Table = function(opt_rowsCount, opt_colsCount) {
  goog.base(this, opt_rowsCount, opt_colsCount);
};
goog.inherits(anychart.ui.Table, anychart.core.ui.Table);


/**
 * Constructor function.
 * @param {number=} opt_rowsCount Number of rows in the table.
 * @param {number=} opt_colsCount Number of columns in the table.
 * @return {!anychart.ui.Table}
 */
anychart.ui.table = function(opt_rowsCount, opt_colsCount) {
  return new anychart.ui.Table(opt_rowsCount, opt_colsCount);
};


//exports
goog.exportSymbol('anychart.ui.table', anychart.ui.table);
