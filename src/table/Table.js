goog.provide('anychart.tableModule.Table');
goog.require('acgraph');
goog.require('anychart.color');
goog.require('anychart.core.IStandaloneBackend');
goog.require('anychart.core.VisualBaseWithBounds');
goog.require('anychart.core.reporting');
goog.require('anychart.core.ui.LabelsFactory');
goog.require('anychart.core.ui.MarkersFactory');
goog.require('anychart.core.utils.Padding');
goog.require('anychart.enums');
goog.require('anychart.math.Rect');
goog.require('anychart.tableModule.elements.Border');
goog.require('anychart.tableModule.elements.Cell');
goog.require('anychart.tableModule.elements.Column');
goog.require('anychart.tableModule.elements.IProxyUser');
goog.require('anychart.tableModule.elements.Padding');
goog.require('anychart.tableModule.elements.Row');
goog.require('anychart.utils');

goog.forwardDeclare('anychart.ui.ContextMenu');
goog.forwardDeclare('anychart.ui.ContextMenu.Item');
goog.forwardDeclare('anychart.ui.ContextMenu.PrepareItemsContext');



/**
 * Represents table element.<br/>
 * <b>Note:</b> Use {@link anychart.standalones.table} method to create it.
 * @param {number=} opt_rowsCount Number of rows in the table.
 * @param {number=} opt_colsCount Number of columns in the table.
 * @constructor
 * @extends {anychart.core.VisualBaseWithBounds}
 * @implements {anychart.tableModule.elements.IProxyUser}
 * @implements {anychart.core.IStandaloneBackend}
 */
anychart.tableModule.Table = function(opt_rowsCount, opt_colsCount) {
  anychart.tableModule.Table.base(this, 'constructor');

  /**
   * Cells array.
   * @type {Array.<anychart.tableModule.elements.Cell>}
   * @private
   */
  this.cells_ = [];

  /**
   * Current columns count.
   * @type {number}
   * @private
   */
  this.colsCount_ = anychart.utils.normalizeToNaturalNumber(opt_colsCount, 4);

  /**
   * Current rows count.
   * @type {number}
   * @private
   */
  this.rowsCount_ = anychart.utils.normalizeToNaturalNumber(opt_rowsCount, 5);

  /**
   * This number tells the table how to rebuild the cells_ array.
   * If it is NaN - nothing to rebuild. In other cases it stores the previous number of columns.
   * @type {number}
   * @private
   */
  this.currentColsCount_ = 0;

  /**
   * Cells that should be disposed.
   * @type {Array.<anychart.tableModule.elements.Cell>}
   * @private
   */
  this.cellsPool_ = [];

  /**
   * Row height settings. Array can contain holes.
   * @type {!Array.<number|string>}
   * @private
   */
  this.rowHeightSettings_ = [];

  /**
   * Col width settings. Array can contain holes.
   * @type {!Array.<number|string>}
   * @private
   */
  this.colWidthSettings_ = [];

  /**
   * Incremental row heights array. rowBottoms_[i] = rowBottoms_[i-1] + rowHeight[i] in pixels.
   * @type {!Array.<number>}
   * @private
   */
  this.rowBottoms_ = [];

  /**
   * Incremental col widths array. colRights_[i] = colRights_[i-1] + colWidth[i] in pixels.
   * @type {!Array.<number>}
   * @private
   */
  this.colRights_ = [];

  /**
   * Settings accumulator.
   * Possible structure: {!{
   *  // The same structure, as anychart.tableModule.elements.Base.prototype.settingsObj has
   *  // cell fill
   *  fill: (acgraph.vector.Fill|undefined),
   *
   *  // cell border in Cell settings and row/col/table border in Row/Column/Table settings
   *  topBorder: (acgraph.vector.Stroke|undefined),
   *  rightBorder: (acgraph.vector.Stroke|undefined),
   *  bottomBorder: (acgraph.vector.Stroke|undefined),
   *  leftBorder: (acgraph.vector.Stroke|undefined),
   *  border: (acgraph.vector.Stroke|undefined), // actually Table do not use this property
   *
   *  // cell border in Row/Column settings
   *  cellTopBorder: (acgraph.vector.Stroke|undefined),
   *  cellRightBorder: (acgraph.vector.Stroke|undefined),
   *  cellBottomBorder: (acgraph.vector.Stroke|undefined),
   *  cellLeftBorder: (acgraph.vector.Stroke|undefined),
   *  cellBorder: (acgraph.vector.Stroke|undefined),
   *
   *  // cell padding
   *  topPadding: (number|undefined),
   *  rightPadding: (number|undefined),
   *  bottomPadding: (number|undefined),
   *  leftPadding: (number|undefined),
   *
   *  // text settings for text cells
   *  fontSize: (string|number|undefined),
   *  fontFamily: (string|undefined),
   *  fontColor: (string|undefined),
   *  fontOpacity: (number|undefined),
   *  fontDecoration: (anychart.enums.TextDecoration|undefined),
   *  fontStyle: (anychart.enums.FontStyle|undefined),
   *  fontVariant: (anychart.enums.FontVariant|undefined),
   *  fontWeight: (string|number|undefined),
   *  letterSpacing: (string|number|undefined),
   *  textDirection: (anychart.enums.TextDirection|undefined),
   *  lineHeight: (string|number|undefined),
   *  textIndent: (number|undefined),
   *  vAlign: (anychart.enums.VAlign|undefined),
   *  hAlign: (anychart.enums.HAlign|undefined),
   *  wordWrap: (string|undefined),
   *  wordBreak: (string|undefined),
   *  textOverflow: (acgraph.vector.Text.TextOverflow|undefined),
   *  selectable: (boolean|undefined),
   *  disablePointerEvents: (boolean|undefined),
   *  useHtml: (boolean|undefined)
   *
   *  // Plus these two properties:
   *  rowEvenFill: (acgraph.vector.Fill|undefined),
   *  rowOddFill: (acgraph.vector.Fill|undefined)
   * }}
   * @type {!Object}
   */
  this.settingsObj = {
    'fill': 'none',
    'cellBorder': 'black',
    'topPadding': 0,
    'rightPadding': 0,
    'bottomPadding': 0,
    'leftPadding': 0,
    'hAlign': anychart.enums.HAlign.START,
    'vAlign': anychart.enums.VAlign.TOP,
    'enabled': true,
    'wordWrap': 'break-word',
    'wordBreak': 'normal'
  };

  this.settingsObj['fill'] = '#fff';
};
goog.inherits(anychart.tableModule.Table, anychart.core.VisualBaseWithBounds);


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.tableModule.Table.prototype.SUPPORTED_SIGNALS =
    anychart.core.VisualBaseWithBounds.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.tableModule.Table.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBaseWithBounds.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.TABLE_CELL_BOUNDS |
    anychart.ConsistencyState.TABLE_OVERLAP |
    anychart.ConsistencyState.TABLE_BORDERS |
    anychart.ConsistencyState.TABLE_FILLS |
    anychart.ConsistencyState.TABLE_CONTENT |
    anychart.ConsistencyState.TABLE_STRUCTURE;


//region Private properties with null defaults
/**
 * Factory for cell text content wrappers.
 * @type {anychart.core.ui.LabelsFactory}
 * @private
 */
anychart.tableModule.Table.prototype.labelsFactory_ = null;


/**
 * Table layer.
 * @type {acgraph.vector.Layer}
 * @private
 */
anychart.tableModule.Table.prototype.layer_ = null;


/**
 * Cell contents container.
 * @type {acgraph.vector.Layer}
 * @private
 */
anychart.tableModule.Table.prototype.contentLayer_ = null;


/**
 * Border paths dictionary by stroke object hash.
 * @type {Object.<string, !acgraph.vector.Path>}
 * @private
 */
anychart.tableModule.Table.prototype.borderPaths_ = null;


/**
 * Cell fill paths dictionary by fill object hash.
 * @type {Object.<string, !acgraph.vector.Path>}
 * @private
 */
anychart.tableModule.Table.prototype.fillPaths_ = null;


/**
 * Pool of freed paths that can be reused.
 * @type {Array.<acgraph.vector.Path>}
 * @private
 */
anychart.tableModule.Table.prototype.pathsPool_ = null;


/**
 * @type {Array.<acgraph.vector.Element|anychart.core.VisualBase>}
 * @private
 */
anychart.tableModule.Table.prototype.contentToClear_ = null;


/**
 * Borders proxy object.
 * @type {anychart.tableModule.elements.Border}
 * @private
 */
anychart.tableModule.Table.prototype.bordersProxy_ = null;


/**
 * Borders proxy object.
 * @type {anychart.tableModule.elements.Border}
 * @private
 */
anychart.tableModule.Table.prototype.cellBordersProxy_ = null;


/**
 * Paddings proxy object.
 * @type {anychart.tableModule.elements.Padding}}
 * @private
 */
anychart.tableModule.Table.prototype.paddingProxy_ = null;


/**
 * Rows array. Lazy creation, may contain undefined indexes.
 * @type {Array.<anychart.tableModule.elements.Row>}
 * @private
 */
anychart.tableModule.Table.prototype.rows_ = null;


/**
 * Columns array. Lazy creation, may contain undefined indexes.
 * @type {Array.<anychart.tableModule.elements.Column>}
 * @private
 */
anychart.tableModule.Table.prototype.cols_ = null;


/**
 * Row min height settings. Array can contain holes.
 * @type {Array.<number|string>}
 * @private
 */
anychart.tableModule.Table.prototype.rowMinHeightSettings_ = null;


/**
 * Row max height settings. Array can contain holes.
 * @type {Array.<number|string>}
 * @private
 */
anychart.tableModule.Table.prototype.rowMaxHeightSettings_ = null;


/**
 * Col min width settings. Array can contain holes.
 * @type {Array.<number|string>}
 * @private
 */
anychart.tableModule.Table.prototype.colMinWidthSettings_ = null;


/**
 * Col max width settings. Array can contain holes.
 * @type {Array.<number|string>}
 * @private
 */
anychart.tableModule.Table.prototype.colMaxWidthSettings_ = null;


/**
 * Default row height settings.
 * @type {number|string|null}
 * @private
 */
anychart.tableModule.Table.prototype.defaultRowHeight_ = null;


/**
 * Default row height settings.
 * @type {number|string|null}
 * @private
 */
anychart.tableModule.Table.prototype.defaultRowMinHeight_ = null;


/**
 * Default row height settings.
 * @type {number|string|null}
 * @private
 */
anychart.tableModule.Table.prototype.defaultRowMaxHeight_ = null;


/**
 * Default row height settings.
 * @type {number|string|null}
 * @private
 */
anychart.tableModule.Table.prototype.defaultColWidth_ = null;


/**
 * Default row height settings.
 * @type {number|string|null}
 * @private
 */
anychart.tableModule.Table.prototype.defaultColMinWidth_ = null;


/**
 * Default row height settings.
 * @type {number|string|null}
 * @private
 */
anychart.tableModule.Table.prototype.defaultColMaxWidth_ = null;


//endregion
//region Table methods
//----------------------------------------------------------------------------------------------------------------------
//
//  Public methods to setup or query table
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for rowsCount.
 * Getter and setter for table rows count.
 * @param {number=} opt_value Rows count to set.
 * @return {!anychart.tableModule.Table|number}
 */
anychart.tableModule.Table.prototype.rowsCount = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.normalizeToNaturalNumber(opt_value, this.rowsCount_);
    if (this.rowsCount_ != opt_value) {
      if (isNaN(this.currentColsCount_)) // mark that we should rebuild the table
        this.currentColsCount_ = this.colsCount_;
      this.rowsCount_ = opt_value;
      this.invalidate(anychart.ConsistencyState.TABLE_STRUCTURE | anychart.ConsistencyState.TABLE_OVERLAP,
          anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.rowsCount_;
};


/**
 * Getter/setter for colsCount.
 * Getter and setter for table columns count.
 * @param {number=} opt_value columns count to set.
 * @return {!anychart.tableModule.Table|number}
 */
anychart.tableModule.Table.prototype.colsCount = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.normalizeToNaturalNumber(opt_value, this.colsCount_);
    if (this.colsCount_ != opt_value) {
      if (isNaN(this.currentColsCount_)) // mark that we should rebuild the table
        this.currentColsCount_ = this.colsCount_;
      this.colsCount_ = opt_value;
      this.invalidate(anychart.ConsistencyState.TABLE_STRUCTURE | anychart.ConsistencyState.TABLE_OVERLAP,
          anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.colsCount_;
};


/**
 * Returns cell by its row and column number.
 * @example <t>simple-h100</t>
 * var table = anychart.standalones.table();
 * var cell = table.getCell(1,1);
 * cell.content( anychart.standalones.label().text('Text element'));
 * table.container(stage).draw();
 * @param {number} row Row index.
 * @param {number} col Column index.
 * @return {anychart.tableModule.elements.Cell} {@link anychart.tableModule.elements.Cell} instance for method chaining.
 */
anychart.tableModule.Table.prototype.getCell = function(row, col) {
  this.checkTable_();
  // defaulting to NaN to return null when incorrect arguments are passed.
  row = anychart.utils.normalizeToNaturalNumber(row, NaN, true);
  col = anychart.utils.normalizeToNaturalNumber(col, NaN, true);
  return this.cells_[row * this.colsCount_ + col] || null;
};


/**
 * Returns row instance by its number. Returns null if there is no row with passed number.
 * @param {number} row
 * @return {anychart.tableModule.elements.Row}
 */
anychart.tableModule.Table.prototype.getRow = function(row) {
  this.checkTable_();
  // defaulting to NaN to return null when incorrect arguments are passed.
  row = anychart.utils.normalizeToNaturalNumber(row, NaN, true);
  if (isNaN(row) || row >= this.rowsCount_)
    return null;
  if (!this.rows_)
    this.rows_ = [];
  if (!(row in this.rows_))
    this.rows_[row] = new anychart.tableModule.elements.Row(this, row);
  return this.rows_[row];
};


/**
 * Returns column instance by its number. Returns null if there is no column with passed number.
 * @param {number} col
 * @return {anychart.tableModule.elements.Column}
 */
anychart.tableModule.Table.prototype.getCol = function(col) {
  this.checkTable_();
  // defaulting to NaN to return null when incorrect arguments are passed.
  col = anychart.utils.normalizeToNaturalNumber(col, NaN, true);
  if (isNaN(col) || col >= this.colsCount_)
    return null;
  if (!this.cols_)
    this.cols_ = [];
  if (!(col in this.cols_))
    this.cols_[col] = new anychart.tableModule.elements.Column(this, col);
  return this.cols_[col];
};


/**
 * Getter and setter for default row height settings. Defaults to null - divide the rest of table height between
 * rows with null height evenly.
 * @param {(string|number|null)=} opt_value Value to set.
 * @return {string|number|null|anychart.tableModule.Table}
 */
anychart.tableModule.Table.prototype.rowsHeight = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.defaultRowHeight_ != opt_value) {
      this.defaultRowHeight_ = opt_value;
      this.invalidate(anychart.ConsistencyState.TABLE_CELL_BOUNDS, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.defaultRowHeight_;
};


/**
 * Getter and setter for default row height minimum settings. Defaults to null - no minimum height.
 * @param {(string|number|null)=} opt_value Value to set.
 * @return {string|number|null|anychart.tableModule.Table}
 */
anychart.tableModule.Table.prototype.rowsMinHeight = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.defaultRowMinHeight_ != opt_value) {
      this.defaultRowMinHeight_ = opt_value;
      this.invalidate(anychart.ConsistencyState.TABLE_CELL_BOUNDS, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.defaultRowMinHeight_;
};


/**
 * Getter and setter for default row height maximum settings. Defaults to null - no maximum height.
 * @param {(string|number|null)=} opt_value Value to set.
 * @return {string|number|null|anychart.tableModule.Table}
 */
anychart.tableModule.Table.prototype.rowsMaxHeight = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.defaultRowMaxHeight_ != opt_value) {
      this.defaultRowMaxHeight_ = opt_value;
      this.invalidate(anychart.ConsistencyState.TABLE_CELL_BOUNDS, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.defaultRowMaxHeight_;
};


/**
 * Getter and setter for default column width settings. Defaults to null - divide the rest of table width between
 * columns with null width evenly.
 * @param {(string|number|null)=} opt_value Value to set.
 * @return {string|number|null|anychart.tableModule.Table}
 */
anychart.tableModule.Table.prototype.colsWidth = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.defaultColWidth_ != opt_value) {
      this.defaultColWidth_ = opt_value;
      this.invalidate(anychart.ConsistencyState.TABLE_CELL_BOUNDS, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.defaultColWidth_;
};


/**
 * Getter and setter for default column width minimum settings. Defaults to null - no minimum width.
 * @param {(string|number|null)=} opt_value Value to set.
 * @return {string|number|null|anychart.tableModule.Table}
 */
anychart.tableModule.Table.prototype.colsMinWidth = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.defaultColMinWidth_ != opt_value) {
      this.defaultColMinWidth_ = opt_value;
      this.invalidate(anychart.ConsistencyState.TABLE_CELL_BOUNDS, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.defaultColMinWidth_;
};


/**
 * Getter and setter for default column width maximum settings. Defaults to null - no maximum width.
 * @param {(string|number|null)=} opt_value Value to set.
 * @return {string|number|null|anychart.tableModule.Table}
 */
anychart.tableModule.Table.prototype.colsMaxWidth = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.defaultColMaxWidth_ != opt_value) {
      this.defaultColMaxWidth_ = opt_value;
      this.invalidate(anychart.ConsistencyState.TABLE_CELL_BOUNDS, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.defaultColMaxWidth_;
};


/**
 * Border for the table (not cells). Overrides this.cellBorder() settings for the borders that are on the border of the
 * table. :)
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line join style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.tableModule.Table|anychart.tableModule.elements.Border} Border settings instance or this for chaining.
 */
anychart.tableModule.Table.prototype.border = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    if (!goog.isNull(opt_strokeOrFill))
      opt_strokeOrFill = acgraph.vector.normalizeStroke.apply(null, arguments);
    this.suspendSignalsDispatching();
    this.settings('border', /** @type {acgraph.vector.Stroke|null|undefined} */(opt_strokeOrFill), anychart.ConsistencyState.TABLE_BORDERS);
    for (var i = 0; i < 4; i++)
      this.settings(anychart.tableModule.elements.Border.propNames[i], null, anychart.ConsistencyState.TABLE_BORDERS);
    this.resumeSignalsDispatching(true);
    return this;
  }
  return this.bordersProxy_ || (this.bordersProxy_ = new anychart.tableModule.elements.Border(this, false));
};


/**
 * Getter/setter for contents.
 * @param {Array.<Array.<(anychart.core.VisualBase|string|number|undefined)>>=} opt_tableValues
 * @param {boolean=} opt_demergeCells
 * @return {Array.<Array.<(anychart.core.VisualBase)>>|anychart.tableModule.Table}
 */
anychart.tableModule.Table.prototype.contents = function(opt_tableValues, opt_demergeCells) {
  var row, col, cell, rowArr;
  if (goog.isDef(opt_tableValues)) {
    var fail = !goog.isArray(opt_tableValues);
    var colsCount = 0, rowsCount;
    if (!fail) {
      rowsCount = opt_tableValues.length;
      for (row = 0; row < rowsCount; row++) {
        rowArr = opt_tableValues[row];
        if (goog.isArray(rowArr)) {
          if (rowArr.length > colsCount)
            colsCount = rowArr.length;
        } else {
          fail = true;
          break;
        }
      }
    }
    if (fail || !rowsCount || !colsCount) {
      anychart.core.reporting.error(anychart.enums.ErrorCode.WRONG_TABLE_CONTENTS);
    } else {
      this.suspendSignalsDispatching();
      this.rowsCount(rowsCount);
      this.colsCount(colsCount);
      if (!!opt_demergeCells) {
        for (row = 0; row < rowsCount; row++) {
          for (col = 0; col < colsCount; col++) {
            cell = this.getCell(row, col);
            cell.rowSpan(1);
            cell.colSpan(1);
          }
        }
      }
      for (row = 0; row < rowsCount; row++) {
        rowArr = opt_tableValues[row];
        for (col = 0; col < colsCount; col++) {
          cell = this.getCell(row, col);
          var tmp = rowArr[col];
          cell.content(goog.isDef(tmp) ? tmp : null);
        }
      }
      this.resumeSignalsDispatching(true);
    }
    return this;
  } else {
    // we have no cache here, because we want to return new arrays here anyway. So caching is useless.
    var result = [];
    for (row = 0; row < this.rowsCount_; row++) {
      rowArr = [];
      for (col = 0; col < this.colsCount_; col++) {
        rowArr.push(this.getCell(row, col).content());
      }
      result.push(rowArr);
    }
    return result;
  }
};


/**
 * Draws the table.
 * @return {anychart.tableModule.Table} {@link anychart.tableModule.Table} instance for method chaining.
 */
anychart.tableModule.Table.prototype.draw = function() {
  if (!this.checkDrawingNeeded())
    return this;

  if (!this.layer_) {
    this.layer_ = acgraph.layer();
    this.bindHandlersToGraphics(this.layer_);
    this.contentLayer_ = this.layer_.layer();
  }

  var stage = this.layer_.getStage();
  var manualSuspend = stage && !stage.isSuspended();
  if (manualSuspend) stage.suspend();

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    // if sizes changed, it will be checked in drawing
    this.invalidate(anychart.ConsistencyState.TABLE_CELL_BOUNDS);
    if (anychart.utils.isPercent(this.left()) || anychart.utils.isPercent(this.top())) {
      this.invalidate(
          anychart.ConsistencyState.TABLE_BORDERS |
          anychart.ConsistencyState.TABLE_FILLS |
          anychart.ConsistencyState.TABLE_CONTENT);
    }
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  if (this.labelsFactory_) // we don't want to create it if no cell use it
    this.labelsFactory_.suspendSignalsDispatching();
  this.checkTable_();
  this.checkSizes_();
  this.checkOverlap_();
  this.checkFills_();
  this.checkBorders_();
  this.checkContent_();
  if (this.labelsFactory_)
    this.labelsFactory_.resumeSignalsDispatching(false);

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    this.layer_.zIndex(/** @type {number} */(this.zIndex()));
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    this.layer_.parent(/** @type {acgraph.vector.ILayer} */(this.container()));
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  if (!this.contextMenu_) {
    this.contextMenu({fromTheme: true, enabled: true});
  }

  if (manualSuspend) stage.resume();

  return this;
};


/**
 * Default browser event handler. Redispatches the event over ACDVF event target hierarchy.
 * @param {acgraph.events.BrowserEvent} event
 * @override
 */
anychart.tableModule.Table.prototype.handleBrowserEvent = function(event) {
  if (event.type == 'contextmenu')
    return this.dispatchEvent(event);
  return false;
};


/** @inheritDoc */
anychart.tableModule.Table.prototype.remove = function() {
  if (this.layer_) this.layer_.parent(null);
};


//endregion
//region Cell settings
//----------------------------------------------------------------------------------------------------------------------
//
//  Cell settings
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for fontSize.
 * @param {string|number=} opt_value .
 * @return {!anychart.tableModule.Table|string|number} .
 */
anychart.tableModule.Table.prototype.fontSize = function(opt_value) {
  if (goog.isDef(opt_value)) opt_value = anychart.utils.toNumberOrString(opt_value);
  return /** @type {!anychart.tableModule.Table|string|number} */(this.settings('fontSize', opt_value));
};


/**
 * Getter/setter for fontFamily.
 * @param {string=} opt_value .
 * @return {!anychart.tableModule.Table|string} .
 */
anychart.tableModule.Table.prototype.fontFamily = function(opt_value) {
  if (goog.isDef(opt_value)) opt_value = String(opt_value);
  return /** @type {!anychart.tableModule.Table|string} */(this.settings('fontFamily', opt_value));
};


/**
 * Getter/setter for fontColor.
 * @param {string=} opt_value .
 * @return {!anychart.tableModule.Table|string} .
 */
anychart.tableModule.Table.prototype.fontColor = function(opt_value) {
  if (goog.isDef(opt_value)) opt_value = String(opt_value);
  return /** @type {!anychart.tableModule.Table|string} */(this.settings('fontColor', opt_value));
};


/**
 * Getter/setter for fontOpacity.
 * @param {number=} opt_value .
 * @return {!anychart.tableModule.Table|number} .
 */
anychart.tableModule.Table.prototype.fontOpacity = function(opt_value) {
  if (goog.isDef(opt_value)) opt_value = goog.math.clamp(+opt_value, 0, 1);
  return /** @type {!anychart.tableModule.Table|number} */(this.settings('fontOpacity', opt_value));
};


/**
 * Getter/setter for fontDecoration.
 * @param {(anychart.enums.TextDecoration|string)=} opt_value .
 * @return {!anychart.tableModule.Table|anychart.enums.TextDecoration} .
 */
anychart.tableModule.Table.prototype.fontDecoration = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeFontDecoration(opt_value);
  }
  return /** @type {!anychart.tableModule.Table|anychart.enums.TextDecoration} */(this.settings('fontDecoration', opt_value));
};


/**
 * Getter/setter for fontStyle.
 * @param {anychart.enums.FontStyle|string=} opt_value .
 * @return {!anychart.tableModule.Table|anychart.enums.FontStyle} .
 */
anychart.tableModule.Table.prototype.fontStyle = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeFontStyle(opt_value);
  }
  return /** @type {!anychart.tableModule.Table|anychart.enums.FontStyle} */(this.settings('fontStyle', opt_value));
};


/**
 * Getter/setter for fontVariant.
 * @param {anychart.enums.FontVariant|string=} opt_value .
 * @return {!anychart.tableModule.Table|anychart.enums.FontVariant} .
 */
anychart.tableModule.Table.prototype.fontVariant = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeFontVariant(opt_value);
  }
  return /** @type {!anychart.tableModule.Table|anychart.enums.FontVariant} */(this.settings('fontVariant', opt_value));
};


/**
 * Getter/setter for fontWeight.
 * @param {(string|number)=} opt_value .
 * @return {!anychart.tableModule.Table|string|number} .
 */
anychart.tableModule.Table.prototype.fontWeight = function(opt_value) {
  if (goog.isDef(opt_value)) opt_value = anychart.utils.toNumberOrString(opt_value);
  return /** @type {!anychart.tableModule.Table|string|number} */(this.settings('fontWeight', opt_value));
};


/**
 * Getter/setter for letterSpacing.
 * @param {(number|string)=} opt_value .
 * @return {!anychart.tableModule.Table|number|string} .
 */
anychart.tableModule.Table.prototype.letterSpacing = function(opt_value) {
  if (goog.isDef(opt_value)) opt_value = anychart.utils.toNumberOrString(opt_value);
  return /** @type {!anychart.tableModule.Table|number|string} */(this.settings('letterSpacing', opt_value));
};


/**
 * Getter/setter for textDirection.
 * @param {anychart.enums.TextDirection|string=} opt_value .
 * @return {!anychart.tableModule.Table|anychart.enums.TextDirection} .
 */
anychart.tableModule.Table.prototype.textDirection = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeTextDirection(opt_value);
  }
  return /** @type {!anychart.tableModule.Table|anychart.enums.TextDirection} */(this.settings('textDirection', opt_value));
};


/**
 * Getter/setter for textShadow.
 * @param {(acgraph.vector.TextShadow|string)=} opt_value - Text shadow settings.
 * @return {!anychart.tableModule.Table|string} - Chart instance or text shadow settings.
 */
anychart.tableModule.Table.prototype.textShadow = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = acgraph.vector.normalizeTextShadow(opt_value);
  }
  return /** @type {!anychart.tableModule.Table|string} */(this.settings('textShadow', opt_value));
};


/**
 * Getter/setter for lineHeight.
 * @param {(number|string)=} opt_value .
 * @return {!anychart.tableModule.Table|number|string} .
 */
anychart.tableModule.Table.prototype.lineHeight = function(opt_value) {
  if (goog.isDef(opt_value)) opt_value = anychart.utils.toNumberOrString(opt_value);
  return /** @type {!anychart.tableModule.Table|number|string} */(this.settings('lineHeight', opt_value));
};


/**
 * Getter/setter for textIndent.
 * @param {number=} opt_value .
 * @return {!anychart.tableModule.Table|number} .
 */
anychart.tableModule.Table.prototype.textIndent = function(opt_value) {
  if (goog.isDef(opt_value)) opt_value = parseFloat(anychart.utils.toNumberOrString(opt_value));
  return /** @type {!anychart.tableModule.Table|number} */(this.settings('textIndent', opt_value));
};


/**
 * Getter/setter for vAlign.
 * @param {anychart.enums.VAlign|string=} opt_value .
 * @return {!anychart.tableModule.Table|anychart.enums.VAlign} .
 */
anychart.tableModule.Table.prototype.vAlign = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeVAlign(opt_value);
  }
  return /** @type {!anychart.tableModule.Table|anychart.enums.VAlign} */(this.settings('vAlign', opt_value));
};


/**
 * Getter/setter for hAlign.
 * @param {anychart.enums.HAlign|string=} opt_value .
 * @return {!anychart.tableModule.Table|anychart.enums.HAlign} .
 */
anychart.tableModule.Table.prototype.hAlign = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeHAlign(opt_value);
  }
  return /** @type {!anychart.tableModule.Table|anychart.enums.HAlign} */(this.settings('hAlign', opt_value));
};


/**
 * Getter/setter for wordBreak.
 * @param {string|string=} opt_value .
 * @return {!anychart.tableModule.Table|string} .
 */
anychart.tableModule.Table.prototype.wordBreak = function(opt_value) {
  return /** @type {!anychart.tableModule.Table|string} */(this.settings('wordBreak', opt_value));
};


/**
 * Getter/setter for wordWrap.
 * @param {string|string=} opt_value .
 * @return {!anychart.tableModule.Table|string} .
 */
anychart.tableModule.Table.prototype.wordWrap = function(opt_value) {
  return /** @type {!anychart.tableModule.Table|string} */(this.settings('wordWrap', opt_value));
};


/**
 * Getter/setter for textOverflow.
 * @param {acgraph.vector.Text.TextOverflow|string=} opt_value .
 * @return {!anychart.tableModule.Table|acgraph.vector.Text.TextOverflow} .
 */
anychart.tableModule.Table.prototype.textOverflow = function(opt_value) {
  if (goog.isDef(opt_value)) opt_value = String(opt_value);
  return /** @type {!anychart.tableModule.Table|acgraph.vector.Text.TextOverflow} */(this.settings('textOverflow', opt_value));
};


/**
 * Getter/setter for selectable.
 * @param {boolean=} opt_value .
 * @return {!anychart.tableModule.Table|boolean} .
 */
anychart.tableModule.Table.prototype.selectable = function(opt_value) {
  if (goog.isDef(opt_value)) opt_value = !!opt_value;
  return /** @type {!anychart.tableModule.Table|boolean} */(this.settings('selectable', opt_value));
};


/**
 * Getter/setter for disablePointerEvents.
 * @param {boolean=} opt_value .
 * @return {!anychart.tableModule.Table|boolean} .
 */
anychart.tableModule.Table.prototype.disablePointerEvents = function(opt_value) {
  if (goog.isDef(opt_value)) opt_value = !!opt_value;
  return /** @type {!anychart.tableModule.Table|boolean} */(this.settings('disablePointerEvents', opt_value));
};


/**
 * Getter/setter for useHtml.
 * @param {boolean=} opt_value .
 * @return {!anychart.tableModule.Table|boolean} .
 */
anychart.tableModule.Table.prototype.useHtml = function(opt_value) {
  if (goog.isDef(opt_value)) opt_value = !!opt_value;
  return /** @type {!anychart.tableModule.Table|boolean} */(this.settings('useHtml', opt_value));
};


/**
 * Getter/setter for cellFill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.tableModule.Table} .
 */
anychart.tableModule.Table.prototype.cellFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDefAndNotNull(opt_fillOrColorOrKeys)) // we want to keep null first param as null, not as 'none'
    opt_fillOrColorOrKeys = acgraph.vector.normalizeFill.apply(null, arguments);
  return /** @type {acgraph.vector.Fill|anychart.tableModule.Table} */(this.settings('fill',
      /** @type {acgraph.vector.Fill|null|undefined} */(opt_fillOrColorOrKeys), anychart.ConsistencyState.TABLE_FILLS));
};


/**
 * Getter/setter for rowOddFill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|Function|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.tableModule.Table|undefined} .
 */
anychart.tableModule.Table.prototype.rowOddFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDefAndNotNull(opt_fillOrColorOrKeys)) // we want to keep null first param as null, not as 'none'
    opt_fillOrColorOrKeys = acgraph.vector.normalizeFill.apply(null, arguments);
  return /** @type {acgraph.vector.Fill|anychart.tableModule.Table} */(this.settings('rowOddFill',
      /** @type {acgraph.vector.Fill|null|undefined} */(opt_fillOrColorOrKeys), anychart.ConsistencyState.TABLE_FILLS));
};


/**
 * Getter/setter for rowEvenFill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|Function|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.tableModule.Table|undefined} .
 */
anychart.tableModule.Table.prototype.rowEvenFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDefAndNotNull(opt_fillOrColorOrKeys)) // we want to keep null first param as null, not as 'none'
    opt_fillOrColorOrKeys = acgraph.vector.normalizeFill.apply(null, arguments);
  return /** @type {acgraph.vector.Fill|anychart.tableModule.Table} */(this.settings('rowEvenFill',
      /** @type {acgraph.vector.Fill|null|undefined} */(opt_fillOrColorOrKeys), anychart.ConsistencyState.TABLE_FILLS));
};


/**
 * Getter/setter for cellBorder.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line join style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.tableModule.Table|anychart.tableModule.elements.Border} .
 */
anychart.tableModule.Table.prototype.cellBorder = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    // we treat null as 'none' here because we don't want to be left without super default border
    opt_strokeOrFill = acgraph.vector.normalizeStroke.apply(null, arguments);
    this.suspendSignalsDispatching();
    this.settings('cellBorder', /** @type {acgraph.vector.Stroke|undefined} */(opt_strokeOrFill), anychart.ConsistencyState.TABLE_BORDERS);
    for (var i = 0; i < 4; i++)
      this.settings(anychart.tableModule.elements.Border.cellPropNames[i], null, anychart.ConsistencyState.TABLE_BORDERS);
    this.resumeSignalsDispatching(true);
    return this;
  }
  return this.cellBordersProxy_ || (this.cellBordersProxy_ = new anychart.tableModule.elements.Border(this, true));
};


/**
 * Getter/setter for cellPadding.
 * @param {(null|string|number|Array.<number|string>|{top:(number|string),left:(number|string),bottom:(number|string),right:(number|string)})=} opt_spaceOrTopOrTopAndBottom .
 * @param {(string|number)=} opt_rightOrRightAndLeft .
 * @param {(string|number)=} opt_bottom .
 * @param {(string|number)=} opt_left .
 * @return {!(anychart.tableModule.Table|anychart.tableModule.elements.Padding)} .
 */
anychart.tableModule.Table.prototype.cellPadding = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  if (goog.isDef(opt_spaceOrTopOrTopAndBottom)) {
    var top, right, bottom, left;
    var argsLen;
    if (goog.isArray(opt_spaceOrTopOrTopAndBottom)) {
      var tmp = opt_spaceOrTopOrTopAndBottom;
      opt_spaceOrTopOrTopAndBottom = tmp[0];
      opt_rightOrRightAndLeft = tmp[1];
      opt_bottom = tmp[2];
      opt_left = tmp[3];
      argsLen = tmp.length;
    } else
      argsLen = arguments.length;
    if (!argsLen) {
      left = bottom = right = top = 0;
    } else if (goog.isObject(opt_spaceOrTopOrTopAndBottom)) {
      top = anychart.utils.toNumberOrString(opt_spaceOrTopOrTopAndBottom['top']) || 0;
      right = anychart.utils.toNumberOrString(opt_spaceOrTopOrTopAndBottom['right']) || 0;
      bottom = anychart.utils.toNumberOrString(opt_spaceOrTopOrTopAndBottom['bottom']) || 0;
      left = anychart.utils.toNumberOrString(opt_spaceOrTopOrTopAndBottom['left']) || 0;
    } else if (argsLen == 1) {
      left = bottom = right = top = anychart.utils.toNumberOrString(opt_spaceOrTopOrTopAndBottom) || 0;
    } else if (argsLen == 2) {
      bottom = top = anychart.utils.toNumberOrString(opt_spaceOrTopOrTopAndBottom) || 0;
      left = right = anychart.utils.toNumberOrString(opt_rightOrRightAndLeft) || 0;
    } else if (argsLen == 3) {
      top = anychart.utils.toNumberOrString(opt_spaceOrTopOrTopAndBottom) || 0;
      left = right = anychart.utils.toNumberOrString(opt_rightOrRightAndLeft) || 0;
      bottom = anychart.utils.toNumberOrString(opt_bottom) || 0;
    } else if (argsLen >= 4) {
      top = anychart.utils.toNumberOrString(opt_spaceOrTopOrTopAndBottom) || 0;
      right = anychart.utils.toNumberOrString(opt_rightOrRightAndLeft) || 0;
      bottom = anychart.utils.toNumberOrString(opt_bottom) || 0;
      left = anychart.utils.toNumberOrString(opt_left) || 0;
    }
    this.suspendSignalsDispatching();
    this.settings(anychart.tableModule.elements.Padding.propNames[0], top, anychart.ConsistencyState.TABLE_CONTENT);
    this.settings(anychart.tableModule.elements.Padding.propNames[1], right, anychart.ConsistencyState.TABLE_CONTENT);
    this.settings(anychart.tableModule.elements.Padding.propNames[2], bottom, anychart.ConsistencyState.TABLE_CONTENT);
    this.settings(anychart.tableModule.elements.Padding.propNames[3], left, anychart.ConsistencyState.TABLE_CONTENT);
    this.resumeSignalsDispatching(true);
    return this;
  }
  return this.paddingProxy_ || (this.paddingProxy_ = new anychart.tableModule.elements.Padding(this));
};


//endregion
//region Drawing phases
//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing phases
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Rebuilds table, applying new rows and cols count.
 * @private
 */
anychart.tableModule.Table.prototype.checkTable_ = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.TABLE_STRUCTURE)) {
    var newCells = [];
    var currentRowsCount = this.currentColsCount_ ? this.cells_.length / this.currentColsCount_ : 0;
    var row, col;
    var rowsFromCells = Math.min(currentRowsCount, this.rowsCount_);
    var colsFromCells = Math.min(this.currentColsCount_, this.colsCount_);
    for (row = 0; row < rowsFromCells; row++) { // processing rows that are both in current in new tables
      for (col = 0; col < colsFromCells; col++) // adding cells from current cells_ array.
        newCells.push(this.cells_[row * this.currentColsCount_ + col]);
      for (col = colsFromCells; col < this.colsCount_; col++) // adding new cells to the row if needed.
        newCells.push(this.allocCell_(row, col));
      for (col = colsFromCells; col < this.currentColsCount_; col++) // clearing cells that are not needed anymore.
        this.freeCell_(this.cells_[row * this.currentColsCount_ + col]);
    }

    for (row = rowsFromCells; row < this.rowsCount_; row++) { // rows that should be added entirely
      for (col = 0; col < this.colsCount_; col++) // adding new cells if needed.
        newCells.push(this.allocCell_(row, col));
    }

    for (row = rowsFromCells; row < currentRowsCount; row++) { // rows that should be removed entirely
      for (col = 0; col < this.currentColsCount_; col++) // clearing cells that are not needed anymore.
        this.freeCell_(this.cells_[row * this.currentColsCount_ + col]);
    }

    this.cells_ = newCells;
    this.currentColsCount_ = NaN;
    this.markConsistent(anychart.ConsistencyState.TABLE_STRUCTURE);
    this.invalidate(
        anychart.ConsistencyState.TABLE_CELL_BOUNDS |
        anychart.ConsistencyState.TABLE_OVERLAP |
        anychart.ConsistencyState.TABLE_BORDERS |
        anychart.ConsistencyState.TABLE_FILLS |
        anychart.ConsistencyState.TABLE_CONTENT);
  }
};


/**
 * Rebuilds cell sizes.
 * @private
 */
anychart.tableModule.Table.prototype.checkSizes_ = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.TABLE_CELL_BOUNDS)) {
    var pixelBounds = this.getPixelBounds();

    var newColRights = this.countSizes_(this.colsCount_, this.colWidthSettings_, this.colMinWidthSettings_,
        this.colMaxWidthSettings_, this.defaultColWidth_, this.defaultColMinWidth_, this.defaultColMaxWidth_,
        pixelBounds.width, this.colRights_);

    var newRowBottoms = this.countSizes_(this.rowsCount_, this.rowHeightSettings_, this.rowMinHeightSettings_,
        this.rowMaxHeightSettings_, this.defaultRowHeight_, this.defaultRowMinHeight_, this.defaultRowMaxHeight_,
        pixelBounds.height, this.rowBottoms_);

    this.markConsistent(anychart.ConsistencyState.TABLE_CELL_BOUNDS);
    if (newColRights || newRowBottoms) {
      this.colRights_ = newColRights || this.colRights_;
      this.rowBottoms_ = newRowBottoms || this.rowBottoms_;
      this.invalidate(
          anychart.ConsistencyState.TABLE_BORDERS |
          anychart.ConsistencyState.TABLE_FILLS |
          anychart.ConsistencyState.TABLE_CONTENT);
    }
  }
};


/**
 * Renews overlapping cells marking.
 * @private
 */
anychart.tableModule.Table.prototype.checkOverlap_ = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.TABLE_OVERLAP)) {
    var i, j;
    for (i = 0; i < this.cells_.length; i++) {
      this.cells_[i].overlapper = NaN;
    }
    for (var row = 0; row < this.rowsCount_; row++) {
      for (var col = 0; col < this.colsCount_; col++) {
        var index = row * this.colsCount_ + col;
        var cell = this.cells_[index];
        if (isNaN(cell.overlapper) && (cell.colSpan() > 1 || cell.rowSpan() > 1)) {
          for (i = Math.min(this.rowsCount_, row + cell.rowSpan()); i-- > row;) {
            for (j = Math.min(this.colsCount_, col + cell.colSpan()); j-- > col;) {
              this.cells_[i * this.colsCount_ + j].overlapper = index;
            }
          }
          cell.overlapper = NaN;
        }
      }
    }
    this.markConsistent(anychart.ConsistencyState.TABLE_OVERLAP);
    this.invalidate(
        anychart.ConsistencyState.TABLE_BORDERS |
        anychart.ConsistencyState.TABLE_FILLS |
        anychart.ConsistencyState.TABLE_CONTENT);
  }
};


/**
 * Redraws cell filling.
 * @private
 */
anychart.tableModule.Table.prototype.checkFills_ = function() {
  var bounds;
  if (this.hasInvalidationState(anychart.ConsistencyState.TABLE_FILLS)) {
    this.resetFillPaths_();
    for (var row = 0; row < this.rowsCount_; row++) {
      for (var col = 0; col < this.colsCount_; col++) {
        var cell = this.cells_[row * this.colsCount_ + col];
        if (isNaN(cell.overlapper)) {
          bounds = this.getCellBounds(row, col,
              /** @type {number} */(cell.rowSpan()),
              /** @type {number} */(cell.colSpan()), bounds); // rect will be created one time and then reused
          var fill = this.getCellFill_(cell, row, col);
          if (fill) {
            var path = this.getFillPath_(fill);
            var l = bounds.getLeft(), r = bounds.getRight() + 1, t = bounds.getTop(), b = bounds.getBottom() + 1;
            path.moveTo(l, t);
            path.lineTo(r, t);
            path.lineTo(r, b);
            path.lineTo(l, b);
            path.close();
          }
        }
      }
    }
    this.markConsistent(anychart.ConsistencyState.TABLE_FILLS);
  }
};


/**
 * Redraws cell filling.
 * @private
 */
anychart.tableModule.Table.prototype.checkBorders_ = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.TABLE_BORDERS)) {
    this.resetBorderPaths_();
    var row, col, cell1, cell2, index;
    // drawing top borders for top cells
    for (col = 0; col < this.colsCount_; col++) {
      cell1 = this.cells_[col];
      if (isNaN(cell1.overlapper))
        this.drawBorder_(0, col, 1, /** @type {number} */(cell1.colSpan()),
            this.getCellHorizontalBorder_(undefined, cell1), 0);
    }
    // drawing left borders for left cells
    for (row = 0; row < this.rowsCount_; row++) {
      cell1 = this.cells_[row * this.colsCount_];
      if (isNaN(cell1.overlapper))
        this.drawBorder_(row, 0, /** @type {number} */(cell1.rowSpan()), 1,
            this.getCellVerticalBorder_(undefined, cell1), 3);
    }
    // drawing right and bottom borders for all cells
    for (row = 0; row < this.rowsCount_; row++) {
      for (col = 0; col < this.colsCount_; col++) {
        // bottom border
        index = row * this.colsCount_ + col;
        cell1 = this.cells_[index]; // always exists
        cell2 = this.cells_[index + this.colsCount_]; // can be undefined if this is a last row
        if (cell2) {
          if (isNaN(cell1.overlapper)) {
            if (!isNaN(cell2.overlapper)) {
              if (cell2.overlapper == index)
                cell1 = cell2 = undefined;
              else
                cell2 = this.cells_[cell2.overlapper];
            }
          } else {
            if (isNaN(cell2.overlapper)) {
              cell1 = this.cells_[cell1.overlapper];
            } else {
              if (cell1.overlapper == cell2.overlapper) {
                cell1 = cell2 = undefined;
              } else {
                cell1 = this.cells_[cell1.overlapper];
                cell2 = this.cells_[cell2.overlapper];
              }
            }
          }
        } else if (!isNaN(cell1.overlapper))
          cell1 = this.cells_[cell1.overlapper];
        this.drawBorder_(row, col, 1, 1, this.getCellHorizontalBorder_(cell1, cell2), 2);
        // right border
        index = row * this.colsCount_ + col;
        cell1 = this.cells_[index]; // always exists
        cell2 = ((col + 1) == this.colsCount_) ? undefined : this.cells_[index + 1]; // can be undefined if this is a last col
        if (cell2) {
          if (isNaN(cell1.overlapper)) {
            if (!isNaN(cell2.overlapper)) {
              if (cell2.overlapper == index)
                cell1 = cell2 = undefined;
              else
                cell2 = this.cells_[cell2.overlapper];
            }
          } else {
            if (isNaN(cell2.overlapper)) {
              cell1 = this.cells_[cell1.overlapper];
            } else {
              if (cell1.overlapper == cell2.overlapper) {
                cell1 = cell2 = undefined;
              } else {
                cell1 = this.cells_[cell1.overlapper];
                cell2 = this.cells_[cell2.overlapper];
              }
            }
          }
        } else if (!isNaN(cell1.overlapper))
          cell1 = this.cells_[cell1.overlapper];
        this.drawBorder_(row, col, 1, 1, this.getCellVerticalBorder_(cell1, cell2), 1);
      }
    }
    this.markConsistent(anychart.ConsistencyState.TABLE_BORDERS);
  }
};


/**
 * Draws table cells content.
 * @private
 */
anychart.tableModule.Table.prototype.checkContent_ = function() {
  var content, bounds, label, marker, chart, position, positionProvider, cell;
  if (this.hasInvalidationState(anychart.ConsistencyState.TABLE_CONTENT)) {
    if (this.contentToClear_) {
      while (this.contentToClear_.length) {
        content = this.contentToClear_.pop();
        if (anychart.utils.instanceOf(content, acgraph.vector.Element)) {
          content.remove();
        } else {
          content.suspendSignalsDispatching();
          if (anychart.utils.instanceOf(content, anychart.core.ui.LabelsFactory.Label)) {
            label = /** @type {anychart.core.ui.LabelsFactory.Label} */(content);
            if (label.parentLabelsFactory())
              label.parentLabelsFactory().clear(label.getIndex());
          } else if (anychart.utils.instanceOf(content, anychart.core.ui.MarkersFactory.Marker)) {
            marker = /** @type {anychart.core.ui.MarkersFactory.Marker} */(content);
            if (marker.parentMarkersFactory())
              marker.parentMarkersFactory().clear(marker.getIndex());
          } else if (anychart.utils.instanceOf(content, anychart.core.VisualBase)) {
            if (content.isChart && content.isChart()) {
              chart = /** @type {anychart.core.Chart} */(content);
              chart.autoRedraw(chart.originalAutoRedraw);
            }
            content.container(null);
            content.remove();
            // no draw here to avoid drawing in to a null container
          }
          content.unlistenSignals(this.handleContentInvalidation_);
          content.resumeSignalsDispatching(false);
        }
      }
    }

    var cellsCount = this.rowsCount_ * this.colsCount_;
    for (var i = 0; i < cellsCount; i++) {
      cell = this.cells_[i];
      if (!isNaN(cell.overlapper) && (content = cell.realContent)) {
        if (anychart.utils.instanceOf(content, acgraph.vector.Layer)) {
          content.removeChildren();
          goog.dispose(content);
        } else {
          content.suspendSignalsDispatching();
          content.unlistenSignals(this.handleContentInvalidation_);
          if (anychart.utils.instanceOf(content, anychart.core.ui.LabelsFactory.Label) ||
              anychart.utils.instanceOf(content, anychart.core.ui.MarkersFactory.Marker)) {
            content.enabled(false);
          } else if (content.isChart && content.isChart()) {
            chart = /** @type {anychart.core.Chart} */(content);
            chart.autoRedraw(chart.originalAutoRedraw);
          }

          content.container(null);
          content.remove();
          // no draw here to avoid drawing in to a null container
          content.resumeSignalsDispatching(false);
        }
      }
    }

    // we use one Padding instance for calculations
    var padding = new anychart.core.utils.Padding();
    padding.suspendSignalsDispatching();

    for (var row = 0; row < this.rowsCount_; row++) {
      for (var col = 0; col < this.colsCount_; col++) {
        cell = this.cells_[row * this.colsCount_ + col];
        content = cell.realContent;
        var contentIsGraphicsElement = anychart.utils.instanceOf(content, acgraph.vector.Element);
        if (content) {
          var rowObj = this.rows_ && this.rows_[row];
          var colObj = this.cols_ && this.cols_[col];
          if (!contentIsGraphicsElement)
            content.suspendSignalsDispatching();
          if (isNaN(cell.overlapper)) {
            bounds = this.getCellBounds(row, col,
                /** @type {number} */(cell.rowSpan()), /** @type {number} */(cell.colSpan()), bounds);
            padding['top'](this.getPaddingProp_('topPadding', cell, rowObj, colObj, this));
            padding['right'](this.getPaddingProp_('rightPadding', cell, rowObj, colObj, this));
            padding['bottom'](this.getPaddingProp_('bottomPadding', cell, rowObj, colObj, this));
            padding['left'](this.getPaddingProp_('leftPadding', cell, rowObj, colObj, this));
            bounds = padding.tightenBounds(bounds);
            var settings;
            if (contentIsGraphicsElement) {
              content.parent(this.contentLayer_);
              var realContent = (/** @type {acgraph.vector.Layer} */(content)).getChildAt(0);
              var hAlign = this.resolveFullProperty_('hAlign', cell, rowObj, colObj, anychart.enums.HAlign.START);
              var vAlign = this.resolveFullProperty_('vAlign', cell, rowObj, colObj, anychart.enums.VAlign.TOP);
              if (hAlign == anychart.enums.HAlign.START) {
                hAlign = this.resolveFullProperty_('textDirection', cell, rowObj, colObj, anychart.enums.TextDirection.RTL) == anychart.enums.TextDirection.RTL ?
                    anychart.enums.HAlign.RIGHT :
                    anychart.enums.HAlign.LEFT;
              } else if (hAlign == anychart.enums.HAlign.END) {
                hAlign = this.resolveFullProperty_('textDirection', cell, rowObj, colObj, anychart.enums.TextDirection.RTL) == anychart.enums.TextDirection.RTL ?
                    anychart.enums.HAlign.LEFT :
                    anychart.enums.HAlign.RIGHT;
              }
              var left, top;
              switch (hAlign) {
                case anychart.enums.HAlign.RIGHT:
                  left = bounds.left + bounds.width - realContent.getAbsoluteWidth();
                  break;
                case anychart.enums.HAlign.CENTER:
                  left = bounds.left + (bounds.width - realContent.getAbsoluteWidth()) / 2;
                  break;
                // case anychart.enums.HAlign.LEFT:
                default:
                  left = bounds.left;
                  break;
              }
              switch (vAlign) {
                case anychart.enums.VAlign.BOTTOM:
                  top = bounds.top + bounds.height - realContent.getAbsoluteHeight();
                  break;
                case anychart.enums.VAlign.MIDDLE:
                  top = bounds.top + (bounds.height - realContent.getAbsoluteHeight()) / 2;
                  break;
                  // case anychart.enums.VAlign.TOP:
                default:
                  top = bounds.top;
                  break;
              }
              realContent.setPosition(left, top);
              content.clip(bounds);
            } else {
              content.container(this.contentLayer_);
              if (anychart.utils.instanceOf(content, anychart.core.ui.LabelsFactory.Label)) {
                label = /** @type {anychart.core.ui.LabelsFactory.Label} */(content);
                label.positionProvider({
                  'value': {
                    'x': bounds.left,
                    'y': bounds.top
                  }
                });
                // if the label is not created by table label factory than we do not modify it's settings - only position
                // it properly due to cell bounds.
                if (label.parentLabelsFactory() == this.labelsFactory_) {
                  label['anchor'](anychart.enums.Anchor.LEFT_TOP);
                  label['width'](bounds.width);
                  label['height'](bounds.height);
                  // we apply custom label settings in the next order: table < col < row < cell
                  // keeping in mind, that table-wide settings are already applied to the factory
                  // also we use direct settingsObj reference to avoid unnecessary objects creation
                  settings = colObj && colObj.settingsObj;
                  if (settings) label.setup(settings);
                  settings = rowObj && rowObj.settingsObj;
                  if (settings) label.setup(settings);
                  settings = cell.settingsObj;
                  if (settings) label.setup(settings);
                  label.resumeSignalsDispatching(false);
                  continue; // we don't want to listen labels of table labelsFactory_.
                } else {
                  position = /** @type {string} */(label.getOption('position') ||
                      (label.currentLabelsFactory() && label.currentLabelsFactory().getOption('position')) ||
                      (label.parentLabelsFactory() && label.parentLabelsFactory().getOption('position')));
                  positionProvider = {'value': anychart.utils.getCoordinateByAnchor(bounds, position)};
                  label.positionProvider(positionProvider);
                  label.draw();
                }
              } else if (anychart.utils.instanceOf(content, anychart.core.ui.MarkersFactory.Marker)) {
                marker = /** @type {anychart.core.ui.MarkersFactory.Marker} */(content);
                position = /** @type {string} */(
                    marker.getOption('position') ||
                    (marker.currentMarkersFactory() && marker.currentMarkersFactory().getOption('position')) ||
                    (marker.parentMarkersFactory() && marker.parentMarkersFactory().getOption('position')));
                positionProvider = {'value': anychart.utils.getCoordinateByAnchor(bounds, position)};
                marker.positionProvider(positionProvider);
                marker.draw();
              } else if (anychart.utils.instanceOf(content, anychart.core.VisualBase)) {
                if (content.isChart && content.isChart()) {
                  chart = /** @type {anychart.core.Chart} */(content);
                  chart.originalAutoRedraw = /** @type {boolean} */(chart.autoRedraw());
                  chart.autoRedraw(false);
                }
                var element = /** @type {anychart.core.VisualBase} */(content);
                element.parentBounds(bounds);
                if (element.draw)
                  element.draw();
              }
              content.listenSignals(this.handleContentInvalidation_);
            }
          } // we suppose that we have fixed overlapped content above.
          if (!contentIsGraphicsElement)
            content.resumeSignalsDispatching(false);
        }
      }
    }

    padding.resumeSignalsDispatching(false);

    if (this.labelsFactory_) {
      this.labelsFactory_.suspendSignalsDispatching();
      this.labelsFactory_.setup(this.settingsObj);
      this.labelsFactory_.container(this.contentLayer_);
      this.labelsFactory_.parentBounds(/** @type {anychart.math.Rect} */(this.getPixelBounds()));
      this.labelsFactory_.draw();
      this.labelsFactory_.resumeSignalsDispatching(false);
    }
    this.markConsistent(anychart.ConsistencyState.TABLE_CONTENT);
  }
};


/**
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.tableModule.Table.prototype.handleContentInvalidation_ = function(e) {
  if (goog.isFunction(e.target.draw)) e.target.draw();
};


//endregion
//region Drawing routines
//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing routines
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Draws one cell border side by passed params.
 * @param {number} row
 * @param {number} col
 * @param {number} rowSpan
 * @param {number} colSpan
 * @param {?acgraph.vector.Stroke} stroke
 * @param {number} side 0-top, 1-right, 2-bottom, 3-left.
 * @private
 */
anychart.tableModule.Table.prototype.drawBorder_ = function(row, col, rowSpan, colSpan, stroke, side) {
  if (stroke && stroke != 'none') {
    var lineThickness = stroke['thickness'] ? stroke['thickness'] : 1;
    var pixelShift = (lineThickness % 2) ? 0.5 : 0;
    var bounds = this.getCellBounds(row, col, rowSpan, colSpan);
    var path = this.getBorderPath_(stroke);
    switch (side) {
      case 0: // top
        path.moveTo(bounds.getLeft(), bounds.getTop() + pixelShift);
        path.lineTo(bounds.getRight() + 1, bounds.getTop() + pixelShift);
        break;
      case 1: // right
        path.moveTo(bounds.getRight() + pixelShift, bounds.getTop());
        path.lineTo(bounds.getRight() + pixelShift, bounds.getBottom() + 1);
        break;
      case 2: // bottom
        path.moveTo(bounds.getLeft(), bounds.getBottom() + pixelShift);
        path.lineTo(bounds.getRight() + 1, bounds.getBottom() + pixelShift);
        break;
      case 3: // left
        path.moveTo(bounds.getLeft() + pixelShift, bounds.getTop());
        path.lineTo(bounds.getLeft() + pixelShift, bounds.getBottom() + 1);
        break;
    }
  }
};


/**
 * Return final fill for the cell.
 * @param {anychart.tableModule.elements.Cell} cell
 * @param {number} row
 * @param {number} col
 * @return {acgraph.vector.Fill}
 * @private
 */
anychart.tableModule.Table.prototype.getCellFill_ = function(cell, row, col) {
  // check cell fill first
  var fill = cell.fill();
  if (fill) return /** @type {acgraph.vector.Fill} */(fill);
  // than check row fill
  fill = this.rows_ && this.rows_[row] && this.rows_[row].cellFill();
  if (fill) return /** @type {acgraph.vector.Fill} */(fill);
  // than - column fill
  fill = this.cols_ && this.cols_[col] && this.cols_[col].cellFill();
  if (fill) return /** @type {acgraph.vector.Fill} */(fill);
  // table even/odd row fill
  fill = (row % 2) ? this.rowOddFill() : this.rowEvenFill();
  if (fill) return /** @type {acgraph.vector.Fill} */(fill);
  // table super default
  return /** @type {acgraph.vector.Fill} */(this.settings('fill'));
};


/**
 * Returns final horizontal border stroke settings between two cells.
 * @param {anychart.tableModule.elements.Cell|undefined} topCell
 * @param {anychart.tableModule.elements.Cell|undefined} bottomCell
 * @return {acgraph.vector.Stroke}
 * @private
 */
anychart.tableModule.Table.prototype.getCellHorizontalBorder_ = function(topCell, bottomCell) {
  if (topCell || bottomCell) {
    var stroke;
    var bottomBorder = 'bottomBorder';
    var topBorder = 'topBorder';
    var border = 'border';
    var cellBottomBorder = 'cellBottomBorder';
    var cellTopBorder = 'cellTopBorder';
    var cellBorder = 'cellBorder';

    // upper cell settings have advantage on same settings level
    // we don't use *.border().*() notation to avoid unnecessary border proxy creation

    // checking if specific border settings are set for the cells
    stroke = topCell && topCell.settings(bottomBorder);
    if (stroke) return /** @type {acgraph.vector.Stroke} */(stroke);
    stroke = bottomCell && bottomCell.settings(topBorder);
    if (stroke) return /** @type {acgraph.vector.Stroke} */(stroke);

    // checking if general border settings are set for the cells
    stroke = topCell && topCell.settings(border);
    if (stroke) return /** @type {acgraph.vector.Stroke} */(stroke);
    stroke = bottomCell && bottomCell.settings(border);
    if (stroke) return /** @type {acgraph.vector.Stroke} */(stroke);

    if (this.rows_) {
      var topRow = this.rows_[(topCell || NaN) && topCell.getRowNum()];
      var botRow = this.rows_[(bottomCell || NaN) && bottomCell.getRowNum()];

      // checking if specific border settings are set for the rows
      stroke = topRow && topRow.settings(bottomBorder);
      if (stroke) return /** @type {acgraph.vector.Stroke} */(stroke);
      stroke = botRow && botRow.settings(topBorder);
      if (stroke) return /** @type {acgraph.vector.Stroke} */(stroke);

      // checking if general border settings are set for the rows
      stroke = topRow && topRow.settings(border);
      if (stroke) return /** @type {acgraph.vector.Stroke} */(stroke);
      stroke = botRow && botRow.settings(border);
      if (stroke) return /** @type {acgraph.vector.Stroke} */(stroke);

      // checking if specific border settings are set for the row cells
      stroke = topRow && topRow.settings(cellBottomBorder);
      if (stroke) return /** @type {acgraph.vector.Stroke} */(stroke);
      stroke = botRow && botRow.settings(cellTopBorder);
      if (stroke) return /** @type {acgraph.vector.Stroke} */(stroke);

      // checking if general border settings are set for the row cells
      stroke = topRow && topRow.settings(cellBorder);
      if (stroke) return /** @type {acgraph.vector.Stroke} */(stroke);
      stroke = botRow && botRow.settings(cellBorder);
      if (stroke) return /** @type {acgraph.vector.Stroke} */(stroke);
    }

    // both cells have the same column
    var col = this.cols_ && this.cols_[(topCell || bottomCell).getColNum()];

    if (col) {
      // checking if the target border is on the top or on the bottom of the column and choosing specific and general
      // settings for this case. The two settings do not conflict, so we check them both here.
      stroke =
          (!topCell && (col.settings(topBorder) || col.settings(border))) || // the top of the column
          (!bottomCell && (col.settings(bottomBorder) || col.settings(border))); // the bottom of the column
      if (stroke) return /** @type {acgraph.vector.Stroke} */(stroke);

      // checking if specific border settings are set for the column cells
      stroke = col.settings(cellBottomBorder);
      if (stroke) return /** @type {acgraph.vector.Stroke} */(stroke);
      stroke = col.settings(cellTopBorder);
      if (stroke) return /** @type {acgraph.vector.Stroke} */(stroke);

      // checking if general border settings are set for the column cells
      stroke = col.settings(cellBorder);
      if (stroke) return /** @type {acgraph.vector.Stroke} */(stroke);
      stroke = col.settings(cellBorder);
      if (stroke) return /** @type {acgraph.vector.Stroke} */(stroke);
    }

    // checking if the target border is on the top or on the bottom of the column and choosing specific and general
    // settings for this case. The two settings do not conflict, so we check them both here.
    stroke =
        (!topCell && (this.settings(topBorder) || this.settings(border))) || // the top of the column
        (!bottomCell && (this.settings(bottomBorder) || this.settings(border))); // the bottom of the column
    if (stroke) return /** @type {acgraph.vector.Stroke} */(stroke);

    // checking if specific border settings are set for the table cells
    stroke = topCell && this.settings(cellBottomBorder);
    if (stroke) return /** @type {acgraph.vector.Stroke} */(stroke);
    stroke = bottomCell && this.settings(cellTopBorder);
    if (stroke) return /** @type {acgraph.vector.Stroke} */(stroke);

    // fallback to default table cell border and redundantly ensure that we return valid Stroke
    return /** @type {acgraph.vector.Stroke} */(this.settings(cellBorder)) || 'none';
  }
  return 'none';
};


/**
 * Returns final vertical border stroke settings between two cells.
 * @param {anychart.tableModule.elements.Cell|undefined} leftCell
 * @param {anychart.tableModule.elements.Cell|undefined} rightCell
 * @return {acgraph.vector.Stroke}
 * @private
 */
anychart.tableModule.Table.prototype.getCellVerticalBorder_ = function(leftCell, rightCell) {
  if (leftCell || rightCell) {
    var stroke;
    var rightBorder = 'rightBorder';
    var leftBorder = 'leftBorder';
    var border = 'border';
    var cellRightBorder = 'cellRightBorder';
    var cellLeftBorder = 'cellLeftBorder';
    var cellBorder = 'cellBorder';

    // upper cell settings have advantage on same settings level
    // we don't use *.border().*() notation to avoid unnecessary border proxy creation

    // checking if specific border settings are set for the cells
    stroke = leftCell && leftCell.settings(rightBorder);
    if (stroke) return /** @type {acgraph.vector.Stroke} */(stroke);
    stroke = rightCell && rightCell.settings(leftBorder);
    if (stroke) return /** @type {acgraph.vector.Stroke} */(stroke);

    // checking if general border settings are set for the cells
    stroke = leftCell && leftCell.settings(border);
    if (stroke) return /** @type {acgraph.vector.Stroke} */(stroke);
    stroke = rightCell && rightCell.settings(border);
    if (stroke) return /** @type {acgraph.vector.Stroke} */(stroke);

    // both cells have the same column
    var row = this.rows_ && this.rows_[(leftCell || rightCell).getRowNum()];

    if (row) {
      // checking if the target border is on the left or on the right of the column and choosing specific and general
      // settings for this case. The two settings do not conflict, so we check them both here.
      stroke =
          (!leftCell && (row.settings(leftBorder) || row.settings(border))) || // the top of the column
          (!rightCell && (row.settings(rightBorder) || row.settings(border))); // the bottom of the column
      if (stroke) return /** @type {acgraph.vector.Stroke} */(stroke);

      // checking if specific border settings are set for the column cells
      stroke = row.settings(cellRightBorder);
      if (stroke) return /** @type {acgraph.vector.Stroke} */(stroke);
      stroke = row.settings(cellLeftBorder);
      if (stroke) return /** @type {acgraph.vector.Stroke} */(stroke);

      // checking if general border settings are set for the column cells
      stroke = row.settings(cellBorder);
      if (stroke) return /** @type {acgraph.vector.Stroke} */(stroke);
      stroke = row.settings(cellBorder);
      if (stroke) return /** @type {acgraph.vector.Stroke} */(stroke);
    }

    if (this.cols_) {
      var leftCol = this.cols_[(leftCell || NaN) && leftCell.getColNum()];
      var rightCol = this.cols_[(rightCell || NaN) && rightCell.getColNum()];

      // checking if specific border settings are set for the rows
      stroke = leftCol && leftCol.settings(rightBorder);
      if (stroke) return /** @type {acgraph.vector.Stroke} */(stroke);
      stroke = rightCol && rightCol.settings(leftBorder);
      if (stroke) return /** @type {acgraph.vector.Stroke} */(stroke);

      // checking if general border settings are set for the rows
      stroke = leftCol && leftCol.settings(border);
      if (stroke) return /** @type {acgraph.vector.Stroke} */(stroke);
      stroke = rightCol && rightCol.settings(border);
      if (stroke) return /** @type {acgraph.vector.Stroke} */(stroke);

      // checking if specific border settings are set for the row cells
      stroke = leftCol && leftCol.settings(cellRightBorder);
      if (stroke) return /** @type {acgraph.vector.Stroke} */(stroke);
      stroke = rightCol && rightCol.settings(cellLeftBorder);
      if (stroke) return /** @type {acgraph.vector.Stroke} */(stroke);

      // checking if general border settings are set for the row cells
      stroke = leftCol && leftCol.settings(cellBorder);
      if (stroke) return /** @type {acgraph.vector.Stroke} */(stroke);
      stroke = rightCol && rightCol.settings(cellBorder);
      if (stroke) return /** @type {acgraph.vector.Stroke} */(stroke);
    }

    // checking if the target border is on the left or on the right of the column and choosing specific and general
    // settings for this case. The two settings do not conflict, so we check them both here.
    stroke =
        (!leftCell && (this.settings(leftBorder) || this.settings(border))) || // the top of the column
        (!rightCell && (this.settings(rightBorder) || this.settings(border))); // the bottom of the column
    if (stroke) return /** @type {acgraph.vector.Stroke} */(stroke);

    // checking if specific border settings are set for the table cells
    stroke = leftCell && this.settings(cellRightBorder);
    if (stroke) return /** @type {acgraph.vector.Stroke} */(stroke);
    stroke = rightCell && this.settings(cellLeftBorder);
    if (stroke) return /** @type {acgraph.vector.Stroke} */(stroke);

    // fallback to default table cell border and redundantly ensure that we return valid Stroke
    return /** @type {acgraph.vector.Stroke} */(this.settings(cellBorder)) || 'none';
  }
  return 'none';
};


/**
 * Removes all border paths and clears hashes.
 * @private
 */
anychart.tableModule.Table.prototype.resetBorderPaths_ = function() {
  if (!this.pathsPool_)
    this.pathsPool_ = [];
  if (this.borderPaths_) {
    for (var hash in this.borderPaths_) {
      var path = this.borderPaths_[hash];
      path.clear();
      path.parent(null);
      this.pathsPool_.push(path);
      delete this.borderPaths_[hash];
    }
  } else
    this.borderPaths_ = {};
};


/**
 * Removes all cell filling paths and clears hashes.
 * @private
 */
anychart.tableModule.Table.prototype.resetFillPaths_ = function() {
  if (!this.pathsPool_)
    this.pathsPool_ = [];
  if (this.fillPaths_) {
    for (var hash in this.fillPaths_) {
      var path = this.fillPaths_[hash];
      path.clear();
      path.parent(null);
      this.pathsPool_.push(path);
      delete this.fillPaths_[hash];
    }
  } else
    this.fillPaths_ = {};
};


/**
 * Returns border path for a stroke.
 * @param {!acgraph.vector.Stroke} stroke
 * @return {!acgraph.vector.Path}
 * @private
 */
anychart.tableModule.Table.prototype.getBorderPath_ = function(stroke) {
  var hash = anychart.color.hash(stroke);
  if (hash in this.borderPaths_)
    return this.borderPaths_[hash];
  else {
    var path = this.pathsPool_.length ?
        /** @type {!acgraph.vector.Path} */(this.pathsPool_.pop()) :
        acgraph.path();
    this.layer_.addChild(path);
    if (goog.isObject(stroke) && ('keys' in stroke) && !goog.isObject(stroke['mode'])) {
      stroke = /** @type {acgraph.vector.Stroke} */(anychart.utils.recursiveClone(stroke));
      stroke['mode'] = this.getPixelBounds();
    }
    path.stroke(stroke);
    path.fill(null);
    this.borderPaths_[hash] = path;
    return path;
  }
};


/**
 * Returns fill path for a fill.
 * @param {!acgraph.vector.Fill} fill
 * @return {!acgraph.vector.Path}
 * @private
 */
anychart.tableModule.Table.prototype.getFillPath_ = function(fill) {
  var hash = anychart.color.hash(fill);
  if (hash in this.fillPaths_)
    return this.fillPaths_[hash];
  else {
    var path = this.pathsPool_.length ?
        /** @type {!acgraph.vector.Path} */(this.pathsPool_.pop()) :
        acgraph.path();
    this.layer_.addChildAt(path, 0);
    path.fill(fill);
    path.stroke(null);
    this.fillPaths_[hash] = path;
    return path;
  }
};


//endregion
//region Other routines
//----------------------------------------------------------------------------------------------------------------------
//
//  Other routines
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * This method is internal.
 * @param {string=} opt_name Settings object or settings name or nothing to get complete object.
 * @param {(string|number|boolean|acgraph.vector.Fill|acgraph.vector.Stroke|null)=} opt_value Setting value if used as a setter.
 * @param {(anychart.ConsistencyState|number)=} opt_state State to invalidate in table if value changed. Defaults to TABLE_CONTENT.
 * @param {(anychart.Signal|number)=} opt_signal Signal to raise on table if value changed. Defaults to NEEDS_REDRAW.
 * @return {!(anychart.tableModule.Table|Object|string|number|boolean)} A copy of settings or the Text for chaining.
 */
anychart.tableModule.Table.prototype.settings = function(opt_name, opt_value, opt_state, opt_signal) {
  if (goog.isDef(opt_name)) {
    if (goog.isDef(opt_value)) {
      var shouldInvalidate = false;
      if (goog.isNull(opt_value)) {
        if (this.settingsObj[opt_name]) {
          delete this.settingsObj[opt_name];
          shouldInvalidate = true;
        }
      } else {
        if (this.settingsObj[opt_name] != opt_value) {
          this.settingsObj[opt_name] = opt_value;
          shouldInvalidate = true;
        }
      }
      if (shouldInvalidate)
        this.invalidate(+opt_state || anychart.ConsistencyState.TABLE_CONTENT, +opt_signal || anychart.Signal.NEEDS_REDRAW);
      return this;
    } else {
      return this.settingsObj && this.settingsObj[opt_name];
    }
  }
  return this.settingsObj || {};
};


/**
 * Getter and setter for row height settings. Null sets row height to the default value.
 * @param {number} row Row number.
 * @param {(string|number|null)=} opt_value Value to set.
 * @return {string|number|null|anychart.tableModule.Table}
 */
anychart.tableModule.Table.prototype.rowHeight = function(row, opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.rowHeightSettings_[row] != opt_value) {
      if (goog.isNull(opt_value))
        delete this.rowHeightSettings_[row];
      else
        this.rowHeightSettings_[row] = opt_value;
      this.invalidate(anychart.ConsistencyState.TABLE_CELL_BOUNDS, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return row in this.rowHeightSettings_ ? this.rowHeightSettings_[row] : null;
};


/**
 * Getter and setter for row min height settings. Null sets row height to the default value.
 * @param {number} row Row number.
 * @param {(string|number|null)=} opt_value Value to set.
 * @return {string|number|null|anychart.tableModule.Table}
 */
anychart.tableModule.Table.prototype.rowMinHeight = function(row, opt_value) {
  if (goog.isDef(opt_value)) {
    var shouldInvalidate = false;
    if (goog.isNull(opt_value)) {
      if (this.rowMinHeightSettings_ && (row in this.rowMinHeightSettings_)) {
        delete this.rowMinHeightSettings_[row];
        shouldInvalidate = true;
      }
    } else {
      if (!this.rowMinHeightSettings_) this.rowMinHeightSettings_ = [];
      if (this.rowMinHeightSettings_[row] != opt_value) {
        this.rowMinHeightSettings_[row] = opt_value;
        shouldInvalidate = true;
      }
    }
    if (shouldInvalidate)
      this.invalidate(anychart.ConsistencyState.TABLE_CELL_BOUNDS, anychart.Signal.NEEDS_REDRAW);
    return this;
  }
  return (this.rowMinHeightSettings_ && (row in this.rowMinHeightSettings_)) ? this.rowMinHeightSettings_[row] : null;
};


/**
 * Getter and setter for row max height settings. Null sets row height to the default value.
 * @param {number} row Row number.
 * @param {(string|number|null)=} opt_value Value to set.
 * @return {string|number|null|anychart.tableModule.Table}
 */
anychart.tableModule.Table.prototype.rowMaxHeight = function(row, opt_value) {
  if (goog.isDef(opt_value)) {
    var shouldInvalidate = false;
    if (goog.isNull(opt_value)) {
      if (this.rowMaxHeightSettings_ && (row in this.rowMaxHeightSettings_)) {
        delete this.rowMaxHeightSettings_[row];
        shouldInvalidate = true;
      }
    } else {
      if (!this.rowMaxHeightSettings_) this.rowMaxHeightSettings_ = [];
      if (this.rowMaxHeightSettings_[row] != opt_value) {
        this.rowMaxHeightSettings_[row] = opt_value;
        shouldInvalidate = true;
      }
    }
    if (shouldInvalidate)
      this.invalidate(anychart.ConsistencyState.TABLE_CELL_BOUNDS, anychart.Signal.NEEDS_REDRAW);
    return this;
  }
  return (this.rowMaxHeightSettings_ && (row in this.rowMaxHeightSettings_)) ? this.rowMaxHeightSettings_[row] : null;
};


/**
 * Getter and setter for column height settings. Null sets column width to default value.
 * @param {number} col Column number.
 * @param {(string|number|null)=} opt_value Value to set.
 * @return {string|number|null|anychart.tableModule.Table}
 */
anychart.tableModule.Table.prototype.colWidth = function(col, opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.colWidthSettings_[col] != opt_value) {
      if (goog.isNull(opt_value))
        delete this.colWidthSettings_[col];
      else
        this.colWidthSettings_[col] = opt_value;
      this.invalidate(anychart.ConsistencyState.TABLE_CELL_BOUNDS, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return col in this.colWidthSettings_ ? this.colWidthSettings_[col] : null;
};


/**
 * Getter and setter for column min width settings. Null sets column width to the default value.
 * @param {number} col Column number.
 * @param {(string|number|null)=} opt_value Value to set.
 * @return {string|number|null|anychart.tableModule.Table}
 */
anychart.tableModule.Table.prototype.colMinWidth = function(col, opt_value) {
  if (goog.isDef(opt_value)) {
    var shouldInvalidate = false;
    if (goog.isNull(opt_value)) {
      if (this.colMinWidthSettings_ && (col in this.colMinWidthSettings_)) {
        delete this.colMinWidthSettings_[col];
        shouldInvalidate = true;
      }
    } else {
      if (!this.colMinWidthSettings_) this.colMinWidthSettings_ = [];
      if (this.colMinWidthSettings_[col] != opt_value) {
        this.colMinWidthSettings_[col] = opt_value;
        shouldInvalidate = true;
      }
    }
    if (shouldInvalidate)
      this.invalidate(anychart.ConsistencyState.TABLE_CELL_BOUNDS, anychart.Signal.NEEDS_REDRAW);
    return this;
  }
  return (this.colMinWidthSettings_ && (col in this.colMinWidthSettings_)) ? this.colMinWidthSettings_[col] : null;
};


/**
 * Getter and setter for column max width settings. Null sets column width to the default value.
 * @param {number} col Column number.
 * @param {(string|number|null)=} opt_value Value to set.
 * @return {string|number|null|anychart.tableModule.Table}
 */
anychart.tableModule.Table.prototype.colMaxWidth = function(col, opt_value) {
  if (goog.isDef(opt_value)) {
    var shouldInvalidate = false;
    if (goog.isNull(opt_value)) {
      if (this.colMaxWidthSettings_ && (col in this.colMaxWidthSettings_)) {
        delete this.colMaxWidthSettings_[col];
        shouldInvalidate = true;
      }
    } else {
      if (!this.colMaxWidthSettings_) this.colMaxWidthSettings_ = [];
      if (this.colMaxWidthSettings_[col] != opt_value) {
        this.colMaxWidthSettings_[col] = opt_value;
        shouldInvalidate = true;
      }
    }
    if (shouldInvalidate)
      this.invalidate(anychart.ConsistencyState.TABLE_CELL_BOUNDS, anychart.Signal.NEEDS_REDRAW);
    return this;
  }
  return (this.colMaxWidthSettings_ && (col in this.colMaxWidthSettings_)) ? this.colMaxWidthSettings_[col] : null;
};


/**
 * Returns bounds for the cell. Result is placed in opt_outBounds argument, if passed. Internal method - you should
 * ensure table consistency before using it.
 * @param {number} row
 * @param {number} col
 * @param {number} rowSpan
 * @param {number} colSpan
 * @param {anychart.math.Rect=} opt_outBounds Result is placed here.
 * @return {!anychart.math.Rect}
 */
anychart.tableModule.Table.prototype.getCellBounds = function(row, col, rowSpan, colSpan, opt_outBounds) {
  this.checkTable_();
  this.checkSizes_();
  var tableBounds = this.getPixelBounds();
  var outBounds = anychart.utils.instanceOf(opt_outBounds, anychart.math.Rect) ? opt_outBounds : new anychart.math.Rect(0, 0, 0, 0);
  var start = (this.colRights_[col - 1] + 1) || 0;
  var end = this.colRights_[Math.min(col + colSpan, this.colsCount_) - 1];
  outBounds.width = end - start;
  outBounds.left = tableBounds.left + start;
  start = (this.rowBottoms_[row - 1] + 1) || 0;
  end = this.rowBottoms_[Math.min(row + rowSpan, this.rowsCount_) - 1];
  outBounds.height = end - start;
  outBounds.top = tableBounds.top + start;
  return outBounds;
};


/**
 * Marks content to be cleared. Used by cells.
 * @param {acgraph.vector.Element|anychart.core.VisualBase} content
 */
anychart.tableModule.Table.prototype.clearContent = function(content) {
  this.contentToClear_ = this.contentToClear_ || [];
  this.contentToClear_.push(content);
};


/**
 * Checks params in right order and returns the size.
 * @param {number|string|null|undefined} rawSize - Raw size settings.
 * @param {number|string|null|undefined} minSize - Raw min size settings.
 * @param {number|string|null|undefined} maxSize - Raw max size settings.
 * @param {number} defSize - NORMALIZED default size.
 * @param {number} defMinSize - NORMALIZED default min size.
 * @param {number} defMaxSize - NORMALIZED default max size.
 * @param {number} tableSize - Table size.
 * @return {number}
 * @private
 */
anychart.tableModule.Table.prototype.getSize_ = function(rawSize, minSize, maxSize,
    defSize, defMinSize, defMaxSize, tableSize) {
  rawSize = anychart.utils.normalizeSize(rawSize, tableSize);
  minSize = anychart.utils.normalizeSize(minSize, tableSize);
  maxSize = anychart.utils.normalizeSize(maxSize, tableSize);
  if (isNaN(rawSize)) rawSize = defSize;
  if (isNaN(minSize)) minSize = defMinSize;
  if (isNaN(maxSize)) maxSize = defMaxSize;
  if (!isNaN(minSize)) rawSize = Math.max(rawSize, minSize);
  if (!isNaN(maxSize)) rawSize = Math.min(rawSize, maxSize);
  return rawSize;
};


/**
 * Calculates cumulative widths of columns or heights of rows (e.g. column right and row bottom coords).
 * Returns null if it doesn't differ from the prevSizesArray.
 * @param {number} sizesCount Number of columns or rows.
 * @param {!Array.<string|number|null>} sizesSettings Size settings array. May contain holes.
 * @param {?Array.<string|number|null>} minSizesSettings Min size settings array. May contain holes or be null.
 * @param {?Array.<string|number|null>} maxSizesSettings Max size settings array. May contain holes or be null.
 * @param {string|number|null} defSize Default setting for column or row size.
 * @param {string|number|null} defMinSize Default setting for column or row min size.
 * @param {string|number|null} defMaxSize Default setting for column or row max size.
 * @param {number} tableSize Table size in pixels.
 * @param {!Array.<number>} prevSizesArray Previous calculation result.
 * @return {?Array.<number>} Array of counted cumulative sizes or null if it doesn't differ.
 * @private
 */
anychart.tableModule.Table.prototype.countSizes_ = function(sizesCount, sizesSettings, minSizesSettings, maxSizesSettings,
    defSize, defMinSize, defMaxSize, tableSize, prevSizesArray) {
  var i, val, size, minSize, maxSize, needsRedraw = false;
  var distributedSize = 0;
  var fixedSizes = [];
  var minSizes = [];
  var maxSizes = [];
  var autoSizesCount = 0;
  defSize = anychart.utils.normalizeSize(defSize, tableSize);
  defMinSize = anychart.utils.normalizeSize(defMinSize, tableSize);
  defMaxSize = anychart.utils.normalizeSize(defMaxSize, tableSize);
  var hardWay = false;
  for (i = 0; i < sizesCount; i++) {
    minSize = minSizesSettings ? anychart.utils.normalizeSize(minSizesSettings[i], tableSize) : NaN;
    maxSize = maxSizesSettings ? anychart.utils.normalizeSize(maxSizesSettings[i], tableSize) : NaN;
    // getting normalized size
    size = this.getSize_(sizesSettings[i], minSize, maxSize, defSize, defMinSize, defMaxSize, tableSize);
    // if it is NaN (not fixed)
    if (isNaN(size)) {
      autoSizesCount++;
      // if there are any limitations on that non-fixed size - we are going to do it hard way:(
      // we cache those limitations
      if (!isNaN(minSize)) {
        minSizes[i] = minSize;
        hardWay = true;
      } else if (!isNaN(defMinSize)) {
        minSizes[i] = defMinSize;
        hardWay = true;
      }
      if (!isNaN(maxSize)) {
        maxSizes[i] = maxSize;
        hardWay = true;
      } else if (!isNaN(defMaxSize)) {
        maxSizes[i] = defMaxSize;
        hardWay = true;
      }
    } else {
      distributedSize += size;
      fixedSizes[i] = size;
    }
  }

  var autoSize;
  var restrictedSizes;
  if (hardWay && autoSizesCount > 0) {
    restrictedSizes = [];
    // we limit max cycling times to guarantee finite exec time in case my calculations are wrong
    var maxTimes = autoSizesCount * autoSizesCount;
    do {
      var repeat = false;
      // min to 3px per autoColumn to make them visible, but not good-looking.
      autoSize = Math.max(3 * autoSizesCount, tableSize - distributedSize) / autoSizesCount;
      for (i = 0; i < sizesCount; i++) {
        // if the size of the column is not fixed
        if (!(i in fixedSizes)) {
          // we recheck if the limitation still exist and drop it if it doesn't
          if (i in restrictedSizes) {
            if (restrictedSizes[i] == minSizes[i] && minSizes[i] < autoSize) {
              distributedSize -= minSizes[i];
              autoSizesCount++;
              delete restrictedSizes[i];
              repeat = true;
              break;
            }
            if (restrictedSizes[i] == maxSizes[i] && maxSizes[i] > autoSize) {
              distributedSize -= maxSizes[i];
              autoSizesCount++;
              delete restrictedSizes[i];
              repeat = true;
              break;
            }
          } else {
            if ((i in minSizes) && minSizes[i] > autoSize) {
              distributedSize += restrictedSizes[i] = minSizes[i];
              autoSizesCount--;
              repeat = true;
              break;
            }
            if ((i in maxSizes) && maxSizes[i] < autoSize) {
              distributedSize += restrictedSizes[i] = maxSizes[i];
              autoSizesCount--;
              repeat = true;
              break;
            }
          }
        }
      }
    } while (repeat && autoSizesCount > 0 && maxTimes--);
  }
  var current = 0;
  var result = [];
  autoSize = Math.max(3 * autoSizesCount, tableSize - distributedSize) / autoSizesCount;
  for (i = 0; i < sizesCount; i++) {
    if (i in fixedSizes)
      size = fixedSizes[i];
    else if (restrictedSizes && (i in restrictedSizes))
      size = restrictedSizes[i];
    else
      size = autoSize;
    current += size;
    val = Math.round(current) - 1;
    result[i] = val;
    if (val != prevSizesArray[i]) needsRedraw = true;
  }
  return needsRedraw ? result : null;
};


/**
 * Marks the cell to be removed on next draw.
 * @param {anychart.tableModule.elements.Cell} cell Cell to free.
 * @private
 */
anychart.tableModule.Table.prototype.freeCell_ = function(cell) {
  cell.content(null);
  this.cellsPool_.push(cell);
};


/**
 * Allocates a new cell or reuses previously freed one.
 * @param {number} row
 * @param {number} col
 * @return {anychart.tableModule.elements.Cell}
 * @private
 */
anychart.tableModule.Table.prototype.allocCell_ = function(row, col) {
  return this.cellsPool_.length ? // checking if there are any cells in pool
      /** @type {anychart.tableModule.elements.Cell} */(this.cellsPool_.pop().reset(row, col)) :
      new anychart.tableModule.elements.Cell(this, row, col);
};


/**
 * @return {!anychart.core.ui.LabelsFactory}
 * @private
 */
anychart.tableModule.Table.prototype.getLabelsFactory_ = function() {
  if (!this.labelsFactory_) {
    this.labelsFactory_ = new anychart.core.ui.LabelsFactory();
    this.labelsFactory_.setup(anychart.getFullTheme('standalones.labelsFactory'));
    this.labelsFactory_['anchor'](anychart.enums.Anchor.CENTER);
    this.labelsFactory_['position'](anychart.enums.Position.CENTER);
    // we do not register disposable here, cause we dispose it manually in disposeInternal
  }
  return this.labelsFactory_;
};


/**
 * Small private stupid routine.
 * @param {string} propName
 * @param {...(anychart.tableModule.elements.IProxyUser|undefined)} var_args
 * @private
 * @return {string|number}
 */
anychart.tableModule.Table.prototype.getPaddingProp_ = function(propName, var_args) {
  for (var i = 1; i < arguments.length; i++) {
    var item = arguments[i];
    if (item) {
      var res = item.settings(propName);
      if (goog.isDefAndNotNull(res))
        return /** @type {string|number} */(res);
    }
  }
  return 0;
};


/**
 * Resolves the property.
 * @param {string} name
 * @param {anychart.tableModule.elements.Cell} cell
 * @param {anychart.tableModule.elements.Row} row
 * @param {anychart.tableModule.elements.Column} col
 * @param {T} defVal
 * @return {T}
 * @template T
 * @private
 */
anychart.tableModule.Table.prototype.resolveFullProperty_ = function(name, cell, row, col, defVal) {
  return cell.settingsObj && cell.settingsObj[name] ||
      row && row.settingsObj && row.settingsObj[name] ||
      col && col.settingsObj && col.settingsObj[name] ||
      this.settingsObj && this.settingsObj[name] ||
      defVal;
};


//endregion
/**
 * Creates cell content for text cells. Used by cells.
 * @param {*} value Text to be set for the label.
 * @return {!anychart.core.ui.LabelsFactory.Label}
 */
anychart.tableModule.Table.prototype.createTextCellContent = function(value) {
  return this.getLabelsFactory_().add({'value': String(value)}, {'value': {'x': 0, 'y': 0}});
};


/** @inheritDoc */
anychart.tableModule.Table.prototype.disposeInternal = function() {
  goog.disposeAll(this.cells_, this.cellsPool_, this.rows_, this.cols_,
      this.fillPaths_, this.borderPaths_, this.pathsPool_);
  goog.dispose(this.labelsFactory_);
  goog.dispose(this.layer_);
  goog.dispose(this.contentLayer_);
  goog.dispose(this.contextMenu_);
  delete this.settingsObj;
  anychart.tableModule.Table.base(this, 'disposeInternal');
};


//region --- Export settings / Save as csv / Export to csv/xlsx
/**
 * Table exports settings.
 * @param {Object=} opt_value .
 * @return {anychart.tableModule.Table|anychart.exportsModule.Exports}
 */
anychart.tableModule.Table.prototype.exports = function(opt_value) {
  var exports = goog.global['anychart']['exports'];
  if (exports) {
    if (!this.exports_)
      this.exports_ = exports.create();
  } else {
    anychart.core.reporting.error(anychart.enums.ErrorCode.NO_FEATURE_IN_MODULE, null, ['Exporting']);
  }

  if (goog.isDef(opt_value) && this.exports_) {
    this.exports_.setupByJSON(opt_value);
    return this;
  }

  return this.exports_;
};


/**
 * Returns CSV string with series data.
 * @param {Object.<string, (string|boolean|undefined)>=} opt_csvSettings CSV settings.
 * @return {string} CSV string.
 */
anychart.tableModule.Table.prototype.toCsv = function(opt_csvSettings) {
  var settings = goog.isObject(opt_csvSettings) ? opt_csvSettings : {};
  var rowsSeparator = settings['rowsSeparator'] || '\n';
  anychart.utils.checkSeparator(rowsSeparator);
  var columnsSeparator = settings['columnsSeparator'] || ',';
  anychart.utils.checkSeparator(columnsSeparator);
  var ignoreFirstRow = settings['ignoreFirstRow'] || false;
  var rowsCount = this.rowsCount();
  var colsCount = this.colsCount();
  var cell,
      content;
  var i,
      j,
      k,
      l;
  var rows = new Array(rowsCount);
  for (i = 0; i < rowsCount; i++) {
    rows[i] = new Array(colsCount);
  }

  var seenCells = {};
  var colSpan,
      rowSpan;
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
anychart.tableModule.Table.prototype.saveAsXlsx = function(opt_filename) {
  var exports = anychart.window['anychart']['exports'];
  if (exports) {
    var csv = this.toCsv({
      'rowsSeparator': '\n',
      'columnsSeparator': ',',
      'ignoreFirstRow': false
    });
    exports.saveAsXlsx(this, csv, opt_filename);
  } else {
    anychart.core.reporting.error(anychart.enums.ErrorCode.NO_FEATURE_IN_MODULE, null, ['Exporting']);
  }
};


/**
 * Saves table data as csv.
 * @param {Object.<string, (string|boolean|undefined)>=} opt_csvSettings CSV settings.
 * @param {string=} opt_filename file name to save.
 */
anychart.tableModule.Table.prototype.saveAsCsv = function(opt_csvSettings, opt_filename) {
  var exports = anychart.window['anychart']['exports'];
  if (exports) {
    var csv = this.toCsv(opt_csvSettings);
    exports.saveAsCsv(this, csv, opt_filename);
  } else {
    anychart.core.reporting.error(anychart.enums.ErrorCode.NO_FEATURE_IN_MODULE, null, ['Exporting']);
  }
};



/**
 * @param {number=} opt_rowsCount Number of rows in the table.
 * @param {number=} opt_colsCount Number of columns in the table.
 * @constructor
 * @extends {anychart.tableModule.Table}
 */
anychart.tableModule.Table.Standalone = function(opt_rowsCount, opt_colsCount) {
  anychart.tableModule.Table.Standalone.base(this, 'constructor', opt_rowsCount, opt_colsCount);
};
goog.inherits(anychart.tableModule.Table.Standalone, anychart.tableModule.Table);
anychart.core.makeStandalone(anychart.tableModule.Table.Standalone, anychart.tableModule.Table);


/**
 * Constructor function.
 * @param {number=} opt_rowsCount Number of rows in the table.
 * @param {number=} opt_colsCount Number of columns in the table.
 * @return {!anychart.tableModule.Table}
 */
anychart.tableModule.table = function(opt_rowsCount, opt_colsCount) {
  return new anychart.tableModule.Table.Standalone(opt_rowsCount, opt_colsCount);
};


//endregion


//region --- Context menu
//------------------------------------------------------------------------------
//
//  Context menu
//
//------------------------------------------------------------------------------
/**
 * Creates context menu for table.
 * @param {(Object|boolean|null)=} opt_value
 * @return {anychart.ui.ContextMenu|!anychart.tableModule.Table}
 */
anychart.tableModule.Table.prototype.contextMenu = function(opt_value) {
  if (!this.contextMenu_) {
    // suppress NO_FEATURE_IN_MODULE warning
    this.contextMenu_ = anychart.window['anychart']['ui']['contextMenu'](true);
    if (this.contextMenu_) {
      this.contextMenu_['itemsProvider'](this.contextMenuItemsProvider);
      this.contextMenu_['attach'](this);
    }
  }

  if (goog.isDef(opt_value)) {
    if (this.contextMenu_) {
      this.contextMenu_['setup'](opt_value);
    }
    return this;
  } else {
    return this.contextMenu_;
  }
};


/**
 * Returns link to version history.
 * Used by context menu version item.
 * @return {string}
 * @protected
 */
anychart.tableModule.Table.prototype.getVersionHistoryLink = function() {
  return 'https://anychart.com/products/anychart/history';
};


/**
 * Default context menu items provider.
 * @param {anychart.ui.ContextMenu.PrepareItemsContext} context Context object.
 * @this {anychart.ui.ContextMenu.PrepareItemsContext}
 * @return {Object.<string, anychart.ui.ContextMenu.Item>}
 * @protected
 */
anychart.tableModule.Table.prototype.contextMenuItemsProvider = function(context) {
  var items = {};
  if (anychart.window['anychart']['exports']) {
    goog.object.extend(items, /** @type {Object} */ (anychart.utils.recursiveClone(anychart.tableModule.Table.contextMenuMap['exporting'])));
  }
  if (goog.dom.fullscreen.isSupported() && context['menuParent'])
    goog.object.extend(items, /** @type {Object} */ (anychart.utils.recursiveClone(anychart.tableModule.Table.contextMenuMap[context['menuParent'].fullScreen() ? 'full-screen-exit' : 'full-screen-enter'])));
  goog.object.extend(items, /** @type {Object} */ (anychart.utils.recursiveClone(anychart.tableModule.Table.contextMenuMap['main'])));

  if (anychart.DEVELOP) {
    // prepare version link (specific to each product)
    var versionHistoryItem = /** @type {anychart.ui.ContextMenu.Item} */(anychart.utils.recursiveClone(anychart.tableModule.Table.contextMenuItems['version-history']));
    versionHistoryItem['href'] = context['menuParent'].getVersionHistoryLink() + '?version=' + anychart.VERSION;

    items['version-history-separator'] = {'index': 81};
    items['link-to-help'] = anychart.utils.recursiveClone(anychart.tableModule.Table.contextMenuItems['link-to-help']);
    items['version-history'] = versionHistoryItem;
  }

  return context['menuParent'].specificContextMenuItems(items, context);
};


/**
 * Specific set context menu items to chart.
 * @param {Object.<string, anychart.ui.ContextMenu.Item>} items Default items provided from chart.
 * @param {anychart.ui.ContextMenu.PrepareItemsContext} context Context object.
 * @return {Object.<string, anychart.ui.ContextMenu.Item>}
 * @protected
 */
anychart.tableModule.Table.prototype.specificContextMenuItems = function(items, context) {
  return items;
};


/**
 * Items map.
 * @type {Object.<string, anychart.ui.ContextMenu.Item>}
 */
anychart.tableModule.Table.contextMenuItems = {
  // Item 'Export as ...'.
  'save-table-as': {
    'index': 10,
    'text': 'Save table as...',
    'iconClass': 'ac ac-file-image-o',
    'subMenu': {
      'save-table-as-png': {
        'index': 10,
        'text': '.png',
        'iconClass': 'ac ac-file-image-o',
        'eventType': 'anychart.saveAsPng',
        'action': function(context) {
          context['menuParent'].saveAsPng();
        }
      },
      'save-table-as-jpg': {
        'index': 20,
        'text': '.jpg',
        'iconClass': 'ac ac-file-image-o',
        'eventType': 'anychart.saveAsJpg',
        'action': function(context) {
          context['menuParent'].saveAsJpg();
        }
      },
      'save-table-as-pdf': {
        'index': 30,
        'text': '.pdf',
        'iconClass': 'ac ac-file-pdf-o',
        'eventType': 'anychart.saveAsPdf',
        'action': function(context) {
          context['menuParent'].saveAsPdf();
        }
      },
      'save-table-as-svg': {
        'index': 40,
        'text': '.svg',
        'iconClass': 'ac ac-file-code-o',
        'eventType': 'anychart.saveAsSvg',
        'action': function(context) {
          context['menuParent'].saveAsSvg();
        }
      }
    }
  },

  // Item 'Save data as...'.
  'save-data-as': {
    'index': 20,
    'text': 'Save data as...',
    'iconClass': 'ac ac-save',
    'subMenu': {
      'save-data-as-text': {
        'index': 10,
        'text': '.csv',
        'iconClass': 'ac ac-file-excel-o',
        'eventType': 'anychart.saveAsCsv',
        'action': function(context) {
          context['menuParent'].saveAsCsv();
        }
      },
      'save-data-as-xlsx': {
        'index': 20,
        'text': '.xlsx',
        'iconClass': 'ac ac-file-excel-o',
        'eventType': 'anychart.saveAsXlsx',
        'action': function(context) {
          context['menuParent'].saveAsXlsx();
        }
      }
    }
  },

  // Item 'Share with...'.
  'share-with': {
    'index': 30,
    'text': 'Share with...',
    'iconClass': 'ac ac-net',
    'subMenu': {
      'share-with-facebook': {
        'index': 10,
        'text': 'Facebook',
        'iconClass': 'ac ac-facebook',
        'eventType': 'anychart.shareWithFacebook',
        'action': function(context) {
          context['menuParent'].shareWithFacebook();
        }
      },
      'share-with-twitter': {
        'index': 20,
        'text': 'Twitter',
        'iconClass': 'ac ac-twitter',
        'eventType': 'anychart.shareWithTwitter',
        'action': function(context) {
          context['menuParent'].shareWithTwitter();
        }
      },
      'share-with-linkedin': {
        'index': 30,
        'text': 'LinkedIn',
        'iconClass': 'ac ac-linkedin',
        'eventType': 'anychart.shareWithLinkedIn',
        'action': function(context) {
          context['menuParent'].shareWithLinkedIn();
        }
      },
      'share-with-pinterest': {
        'index': 40,
        'text': 'Pinterest',
        'iconClass': 'ac ac-pinterest',
        'eventType': 'anychart.shareWithPinterest',
        'action': function(context) {
          context['menuParent'].shareWithPinterest();
        }
      }
    }
  },

  // Item 'Print Chart'.
  'print-table': {
    'index': 50,
    'text': 'Print',
    'iconClass': 'ac ac-print',
    'eventType': 'anychart.print',
    'action': function(context) {
      context['menuParent'].print();
    }
  },

  // Item-link to our site.
  'full-screen-enter': {
    'index': 60,
    'text': 'Enter full screen',
    'action': function(context) {
      context['menuParent'].fullScreen(true);
    }
  },

  'full-screen-exit': {
    'index': 60,
    'text': 'Exit full screen',
    'action': function(context) {
      context['menuParent'].fullScreen(false);
    }
  },

  // Item-link to our site.
  'about': {
    'index': 80,
    'iconClass': 'ac ac-cog',
    'text': 'AnyChart ' + (anychart.VERSION ?
        goog.string.subs.apply(null, ['v%s.%s.%s.%s'].concat(anychart.VERSION.split('.'))) :
        ' develop version'),
    'href': 'https://anychart.com'
  },

  // Item 'Link to help'.
  'link-to-help': {
    'index': 110,
    'iconClass': 'ac ac-question',
    'text': 'Need help? Go to support center!',
    'href': 'https://anychart.com/support'
  },

  // Item-link to version history.
  'version-history': {
    'index': 120,
    'text': 'Version History',
    'href': ''
  }
};


/**
 * Menu map.
 * @type {Object.<string, Object.<string, anychart.ui.ContextMenu.Item>>}
 */
anychart.tableModule.Table.contextMenuMap = {
  // Menu 'Default menu'.
  'exporting': {
    'save-table-as': anychart.tableModule.Table.contextMenuItems['save-table-as'],
    'save-data-as': anychart.tableModule.Table.contextMenuItems['save-data-as'],
    'share-with': anychart.tableModule.Table.contextMenuItems['share-with'],
    'print-table': anychart.tableModule.Table.contextMenuItems['print-table'],
    'exporting-separator': {'index': 51}
  },
  'full-screen-enter': {
    'full-screen-enter': anychart.tableModule.Table.contextMenuItems['full-screen-enter'],
    'full-screen-separator': {'index': 61}
  },
  'full-screen-exit': {
    'full-screen-exit': anychart.tableModule.Table.contextMenuItems['full-screen-exit'],
    'full-screen-separator': {'index': 61}
  },
  'main': {
    'about': anychart.tableModule.Table.contextMenuItems['about']
  }
};


//endregion
//region --- Full screen
//------------------------------------------------------------------------------
//
//  Full screen
//
//------------------------------------------------------------------------------
/**
 * Getter/Setter for the full screen mode.
 * @param {boolean=} opt_value
 * @return {anychart.tableModule.Table|boolean}
 */
anychart.tableModule.Table.prototype.fullScreen = function(opt_value) {
  var container = this.container();
  var stage = container ? container.getStage() : null;
  if (goog.isDef(opt_value)) {
    if (stage)
      stage.fullScreen(opt_value);
    return this;
  }
  return stage ? /** @type {boolean} */(stage.fullScreen()) : false;
};


/**
 * Tester for the full screen support.
 * @return {boolean}
 */
anychart.tableModule.Table.prototype.isFullScreenAvailable = function() {
  var container = this.container();
  var stage = container ? container.getStage() : null;
  return stage ? /** @type {boolean} */(stage.isFullScreenAvailable()) : false;
};


//endregion
//exports
(function() {
  var proto = anychart.tableModule.Table.prototype;
  proto['rowsCount'] = proto.rowsCount;//doc|ex
  proto['colsCount'] = proto.colsCount;//doc|ex

  proto['getCell'] = proto.getCell;//doc|ex
  proto['getRow'] = proto.getRow;
  proto['getCol'] = proto.getCol;

  proto['rowsHeight'] = proto.rowsHeight;
  proto['rowsMinHeight'] = proto.rowsMinHeight;
  proto['rowsMaxHeight'] = proto.rowsMaxHeight;
  proto['colsWidth'] = proto.colsWidth;
  proto['colsMinWidth'] = proto.colsMinWidth;
  proto['colsMaxWidth'] = proto.colsMaxWidth;

  proto['border'] = proto.border;

  proto['contents'] = proto.contents;//doc|ex

  proto['contextMenu'] = proto.contextMenu;

  proto['draw'] = proto.draw;//doc

  proto['fullScreen'] = proto.fullScreen;
  proto['isFullScreenAvailable'] = proto.isFullScreenAvailable;

  proto['fontSize'] = proto.fontSize;
  proto['fontFamily'] = proto.fontFamily;
  proto['fontColor'] = proto.fontColor;
  proto['fontOpacity'] = proto.fontOpacity;
  proto['fontDecoration'] = proto.fontDecoration;
  proto['fontStyle'] = proto.fontStyle;
  proto['fontVariant'] = proto.fontVariant;
  proto['fontWeight'] = proto.fontWeight;
  proto['letterSpacing'] = proto.letterSpacing;
  proto['textDirection'] = proto.textDirection;
  proto['textShadow'] = proto.textShadow;
  proto['lineHeight'] = proto.lineHeight;
  proto['textIndent'] = proto.textIndent;
  proto['vAlign'] = proto.vAlign;
  proto['hAlign'] = proto.hAlign;
  proto['wordBreak'] = proto.wordBreak;
  proto['wordWrap'] = proto.wordWrap;
  proto['textOverflow'] = proto.textOverflow;
  proto['selectable'] = proto.selectable;
  proto['disablePointerEvents'] = proto.disablePointerEvents;
  proto['useHtml'] = proto.useHtml;

  proto['cellFill'] = proto.cellFill;//doc|ex

  proto['rowEvenFill'] = proto.rowEvenFill;
  proto['rowOddFill'] = proto.rowOddFill;

  proto['cellBorder'] = proto.cellBorder;

  proto['cellPadding'] = proto.cellPadding;

  proto['saveAsPng'] = proto.saveAsPng;//inherited
  proto['saveAsJpg'] = proto.saveAsJpg;//inherited
  proto['saveAsPdf'] = proto.saveAsPdf;//inherited
  proto['saveAsSvg'] = proto.saveAsSvg;//inherited
  proto['shareAsPng'] = proto.shareAsPng;//inherited
  proto['shareAsJpg'] = proto.shareAsJpg;//inherited
  proto['shareAsPdf'] = proto.shareAsPdf;//inherited
  proto['shareAsSvg'] = proto.shareAsSvg;//inherited
  proto['getPngBase64String'] = proto.getPngBase64String;//inherited
  proto['getJpgBase64String'] = proto.getJpgBase64String;//inherited
  proto['getSvgBase64String'] = proto.getSvgBase64String;//inherited
  proto['getPdfBase64String'] = proto.getPdfBase64String;//inherited
  proto['toSvg'] = proto.toSvg;//inherited
  proto['toCsv'] = proto.toCsv;
  proto['saveAsCsv'] = proto.saveAsCsv;
  proto['saveAsXlsx'] = proto.saveAsXlsx;
  proto['exports'] = proto.exports;

  proto['shareWithFacebook'] = proto.shareWithFacebook;//inherited
  proto['shareWithTwitter'] = proto.shareWithTwitter;//inherited
  proto['shareWithLinkedIn'] = proto.shareWithLinkedIn;//inherited
  proto['shareWithPinterest'] = proto.shareWithPinterest;//inherited

  proto['parentBounds'] = proto.parentBounds;
  proto['container'] = proto.container;

  proto = anychart.tableModule.Table.Standalone.prototype;
  proto['draw'] = proto.draw;

  goog.exportSymbol('anychart.standalones.table', anychart.tableModule.table);
})();
