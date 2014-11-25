goog.provide('anychart.ui.DataGrid');
goog.require('anychart.core.ui.DataGrid');



/**
 * @constructor
 * @extends {anychart.core.ui.DataGrid}
 */
anychart.ui.DataGrid = function() {
  goog.base(this);
};
goog.inherits(anychart.ui.DataGrid, anychart.core.ui.DataGrid);


/**
 * Constructor function.
 * @return {!anychart.ui.DataGrid}
 */
anychart.ui.dataGrid = function() {
  return new anychart.ui.DataGrid();
};


//exports
goog.exportSymbol('anychart.ui.dataGrid', anychart.ui.dataGrid);
