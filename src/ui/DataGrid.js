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
  var dataGrid = new anychart.ui.DataGrid();
  var theme = anychart.getFullTheme();
  dataGrid.setup(theme['standalones']['dataGrid']);

  return dataGrid;
};


//exports
goog.exportSymbol('anychart.ui.dataGrid', anychart.ui.dataGrid);
anychart.ui.DataGrid.prototype['draw'] = anychart.ui.DataGrid.prototype.draw;
anychart.ui.DataGrid.prototype['data'] = anychart.ui.DataGrid.prototype.data;
anychart.ui.DataGrid.prototype['parentBounds'] = anychart.ui.DataGrid.prototype.parentBounds;
anychart.ui.DataGrid.prototype['container'] = anychart.ui.DataGrid.prototype.container;
anychart.ui.DataGrid.prototype['rowStroke'] = anychart.ui.DataGrid.prototype.rowStroke;
anychart.ui.DataGrid.prototype['backgroundFill'] = anychart.ui.DataGrid.prototype.backgroundFill;
anychart.ui.DataGrid.prototype['titleHeight'] = anychart.ui.DataGrid.prototype.titleHeight; //deprecated
anychart.ui.DataGrid.prototype['headerHeight'] = anychart.ui.DataGrid.prototype.headerHeight;
