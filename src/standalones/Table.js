goog.provide('anychart.standalones.Table');
goog.require('anychart.core.ui.Table');



/**
 * @param {number=} opt_rowsCount Number of rows in the table.
 * @param {number=} opt_colsCount Number of columns in the table.
 * @constructor
 * @extends {anychart.core.ui.Table}
 */
anychart.standalones.Table = function(opt_rowsCount, opt_colsCount) {
  anychart.standalones.Table.base(this, 'constructor', opt_rowsCount, opt_colsCount);
};
goog.inherits(anychart.standalones.Table, anychart.core.ui.Table);
anychart.core.makeStandalone(anychart.standalones.Table, anychart.core.ui.Table);


/**
 * Constructor function.
 * @param {number=} opt_rowsCount Number of rows in the table.
 * @param {number=} opt_colsCount Number of columns in the table.
 * @return {!anychart.standalones.Table}
 */
anychart.standalones.table = function(opt_rowsCount, opt_colsCount) {
  return new anychart.standalones.Table(opt_rowsCount, opt_colsCount);
};


/**
 * Constructor function.
 * @param {number=} opt_rowsCount Number of rows in the table.
 * @param {number=} opt_colsCount Number of columns in the table.
 * @return {!anychart.standalones.Table}
 * @deprecated Since 7.12.0. Use anychart.standalones.table instead.
 */
anychart.ui.table = function(opt_rowsCount, opt_colsCount) {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null, ['anychart.ui.table()', 'anychart.standalones.table()', null, 'Constructor'], true);
  return anychart.standalones.table(opt_rowsCount, opt_colsCount);
};


//exports
/** @suppress {deprecated} */
(function() {
  var proto = anychart.standalones.Table.prototype;
  goog.exportSymbol('anychart.ui.table', anychart.ui.table);
  goog.exportSymbol('anychart.standalones.table', anychart.standalones.table);
  proto['draw'] = proto.draw;
  proto['parentBounds'] = proto.parentBounds;
  proto['container'] = proto.container;
})();
