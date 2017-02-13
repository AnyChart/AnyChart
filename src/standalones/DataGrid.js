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
 * Getter/setter for vertical scroll bar.
 * @param {Object=} opt_value Object with settings.
 * @return {anychart.standalones.DataGrid|anychart.core.ui.ScrollBar}
 */
anychart.standalones.DataGrid.prototype.verticalScrollBar = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.controller.getScrollBar().setup(opt_value);
    return this;
  }
  return this.controller.getScrollBar();
};


/** @inheritDoc */
anychart.standalones.DataGrid.prototype.serialize = function() {
  var json = anychart.standalones.DataGrid.base(this, 'serialize');
  json['verticalScrollBar'] = this.verticalScrollBar().serialize();
  return json;
};


/** @inheritDoc */
anychart.standalones.DataGrid.prototype.setupByJSON = function(config) {
  anychart.standalones.DataGrid.base(this, 'setupByJSON', config);
  if ('verticalScrollBar' in config)
    this.verticalScrollBar(config['verticalScrollBar']);
};


/**
 * Constructor function.
 * @return {!anychart.standalones.DataGrid}
 */
anychart.standalones.dataGrid = function() {
  var dataGrid = new anychart.standalones.DataGrid();
  dataGrid.setup(anychart.getFullTheme('standalones.dataGrid'));
  return dataGrid;
};


/**
 * Constructor function.
 * @return {!anychart.standalones.DataGrid}
 * @deprecated Since 7.12.0. Use anychart.standalones.dataGrid instead.
 */
anychart.ui.dataGrid = function() {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null, ['anychart.ui.dataGrid()', 'anychart.standalones.dataGrid()', null, 'Constructor'], true);
  return anychart.standalones.dataGrid();
};


//exports
/** @suppress {deprecated} */
(function() {
  var proto = anychart.standalones.DataGrid.prototype;
  goog.exportSymbol('anychart.ui.dataGrid', anychart.ui.dataGrid);
  goog.exportSymbol('anychart.standalones.dataGrid', anychart.standalones.dataGrid);
  proto['draw'] = proto.draw;
  proto['data'] = proto.data;
  proto['parentBounds'] = proto.parentBounds;
  proto['container'] = proto.container;
  proto['rowStroke'] = proto.rowStroke;
  proto['backgroundFill'] = proto.backgroundFill;
  proto['titleHeight'] = proto.titleHeight; //deprecated since 7.7.0
  proto['headerHeight'] = proto.headerHeight;
  proto['verticalScrollBar'] = proto.verticalScrollBar;
  proto['defaultRowHeight'] = proto.defaultRowHeight;
})();
