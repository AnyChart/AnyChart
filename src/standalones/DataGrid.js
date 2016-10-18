goog.provide('anychart.standalones.DataGrid');
goog.require('anychart.core.ui.DataGrid');



/**
 * @constructor
 * @extends {anychart.core.ui.DataGrid}
 */
anychart.standalones.DataGrid = function() {
  anychart.standalones.DataGrid.base(this, 'constructor');
};
goog.inherits(anychart.standalones.DataGrid, anychart.core.ui.DataGrid);
anychart.core.makeStandalone(anychart.standalones.DataGrid, anychart.core.ui.DataGrid);


/**
 * Constructor function.
 * @return {!anychart.standalones.DataGrid}
 */
anychart.standalones.dataGrid = function() {
  var dataGrid = new anychart.standalones.DataGrid();
  dataGrid.setup(anychart.getFullTheme()['standalones']['dataGrid']);
  return dataGrid;
};


/**
 * Constructor function.
 * @return {!anychart.standalones.DataGrid}
 * @deprecated Since 7.12.0. Use anychart.standalones.dataGrid instead.
 */
anychart.ui.dataGrid = function() {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null, ['anychart.ui.dataGrid', 'anychart.standalones.dataGrid'], true);
  return anychart.standalones.dataGrid();
};


//exports
goog.exportSymbol('anychart.ui.dataGrid', anychart.ui.dataGrid);
goog.exportSymbol('anychart.standalones.dataGrid', anychart.standalones.dataGrid);
anychart.standalones.DataGrid.prototype['draw'] = anychart.standalones.DataGrid.prototype.draw;
anychart.standalones.DataGrid.prototype['data'] = anychart.standalones.DataGrid.prototype.data;
anychart.standalones.DataGrid.prototype['parentBounds'] = anychart.standalones.DataGrid.prototype.parentBounds;
anychart.standalones.DataGrid.prototype['container'] = anychart.standalones.DataGrid.prototype.container;
anychart.standalones.DataGrid.prototype['rowStroke'] = anychart.standalones.DataGrid.prototype.rowStroke;
anychart.standalones.DataGrid.prototype['backgroundFill'] = anychart.standalones.DataGrid.prototype.backgroundFill;
anychart.standalones.DataGrid.prototype['titleHeight'] = anychart.standalones.DataGrid.prototype.titleHeight; //deprecated
anychart.standalones.DataGrid.prototype['headerHeight'] = anychart.standalones.DataGrid.prototype.headerHeight;
