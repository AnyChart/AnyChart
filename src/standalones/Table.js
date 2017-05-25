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


//region --- Save as csv / Export to csv/xlsx
/**
 * Returns CSV string with series data.
 * @param {Object.<string, (string|boolean|undefined)>=} opt_csvSettings CSV settings.
 * @return {string} CSV string.
 */
anychart.standalones.Table.prototype.toCsv = function(opt_csvSettings) {
  var settings = goog.isObject(opt_csvSettings) ? opt_csvSettings : {};
  var rowsSeparator = settings['rowsSeparator'] || '\n';
  anychart.utils.checkSeparator(rowsSeparator);
  var columnsSeparator = settings['columnsSeparator'] || ',';
  anychart.utils.checkSeparator(columnsSeparator);
  var ignoreFirstRow = settings['ignoreFirstRow'] || false;
  var rowsCount = this.rowsCount();
  var colsCount = this.colsCount();
  var cell, content;
  var i, j, k, l;
  var rows = new Array(rowsCount);
  for (i = 0; i < rowsCount; i++) {
    rows[i] = new Array(colsCount);
  }

  var seenCells = {};
  var colSpan, rowSpan;
  var rowsString = [];

  for (i = 0; i < rowsCount; i++) {
    for (j = 0; j < colsCount; j++) {
      if ((i * colsCount + j) in seenCells)
        continue;
      cell = this.getCell(i, j);
      content = cell.content();
      content = goog.isString(content) || goog.isNumber(content) || goog.isBoolean(content) ? String(content) : '';
      if (content.indexOf(columnsSeparator) != -1) {
        content = content.split('"').join('""');
        content = '"' + content + '"';
      } else if (content.indexOf(rowsSeparator) != -1) {
        content = content.split('"').join('""');
        content = '"' + content + '"';
      }
      rows[i][j] = content;
      colSpan = cell.colSpan();
      rowSpan = cell.rowSpan();

      if (rowSpan + colSpan != 2) {
        for (k = 0; k < rowSpan; k++) {
          for (l = 0; l < colSpan; l++) {
            if ((k == 0) && (l == 0))
              continue;
            rows[i + k][j + l] = '';
            seenCells[(i + k) * colsCount + (j + l)] = true;
          }
        }
      }
    }
    rowsString.push(rows[i].join(columnsSeparator));
  }

  if (ignoreFirstRow)
    rowsString.shift();

  return rowsString.join(rowsSeparator);
};


/**
 * Saves table data as excel document.
 * @param {string=} opt_filename file name to save.
 */
anychart.standalones.Table.prototype.saveAsXlsx = function(opt_filename) {
  var csv = this.toCsv({
    'rowsSeparator': '\n',
    'columnsSeparator': ',',
    'ignoreFirstRow': false
  });
  var options = {};
  options['file-name'] = opt_filename || anychart.exports.filename();
  options['data'] = csv;
  options['dataType'] = 'xlsx';
  options['responseType'] = 'file';
  acgraph.sendRequestToExportServer(acgraph.exportServer + '/xlsx', options);
};


/**
 * Saves table data as csv.
 * @param {Object.<string, (string|boolean|undefined)>=} opt_csvSettings CSV settings.
 * @param {string=} opt_filename file name to save.
 */
anychart.standalones.Table.prototype.saveAsCsv = function(opt_csvSettings, opt_filename) {
  var csv = this.toCsv(opt_csvSettings);
  var options = {};
  options['file-name'] = opt_filename || anychart.exports.filename();
  options['data'] = csv;
  options['dataType'] = 'csv';
  options['responseType'] = 'file';
  acgraph.sendRequestToExportServer(acgraph.exportServer + '/csv', options);
};
//endregion


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
  proto['toCsv'] = proto.toCsv;
  proto['saveAsCsv'] = proto.saveAsCsv;
  proto['saveAsXlsx'] = proto.saveAsXlsx;
})();
