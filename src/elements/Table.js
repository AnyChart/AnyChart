goog.provide('anychart.elements.Table');
goog.provide('anychart.elements.Table.Cell');

goog.require('anychart.VisualBaseWithBounds');
goog.require('anychart.color');
goog.require('anychart.elements.LabelsFactory');
goog.require('anychart.utils');
goog.require('anychart.utils.Padding');



/**
 * Table visual element.
 * @param {number=} opt_rowsCount Number of rows in the table.
 * @param {number=} opt_colsCount Number of columns in the table.
 * @constructor
 * @extends {anychart.VisualBaseWithBounds}
 */
anychart.elements.Table = function(opt_rowsCount, opt_colsCount) {
  goog.base(this);

  /**
   * Cells array.
   * @type {Array.<anychart.elements.Table.Cell>}
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
   * @type {Array.<anychart.elements.Table.Cell>}
   * @private
   */
  this.cellsPool_ = [];

  /**
   * Row height settings. Array can contain holes.
   * @type {Array.<number|string>}
   * @private
   */
  this.rowHeightSettings_ = [];

  /**
   * Col width settings. Array can contain holes.
   * @type {Array.<number|string>}
   * @private
   */
  this.colWidthSettings_ = [];

  /**
   * Incremental row heights array. rowBottoms_[i] = rowBottoms_[i-1] + rowHeight[i] in pixels.
   * @type {Array.<number>}
   * @private
   */
  this.rowBottoms_ = [];

  /**
   * Incremental col widths array. colRights_[i] = colRights_[i-1] + colWidth[i] in pixels.
   * @type {Array.<number>}
   * @private
   */
  this.colRights_ = [];

  /**
   * Factory for cell text content wrappers.
   * @type {anychart.elements.LabelsFactory}
   * @private
   */
  this.labelsFactory_ = null;

  /**
   * Table layer.
   * @type {acgraph.vector.Layer}
   * @private
   */
  this.layer_ = null;

  /**
   * Cell contents container.
   * @type {acgraph.vector.Layer}
   * @private
   */
  this.contentLayer_ = null;

  /**
   * Internal flag used by table to mark that row heights or col widths changed and should be rebuilt.
   * @type {boolean}
   */
  this.shouldRebuildSizes = true;

  /**
   * Internal flag used by cells to mark that row or col span changed.
   * @type {boolean}
   */
  this.shouldDropOverlap = false;

  /**
   * Internal flag used by cells to mark that table grid changed and should be rebuilt.
   * @type {boolean}
   */
  this.shouldRedrawBorders = true;

  /**
   * Internal flag used by cells to mark that table grid changed and should be rebuilt.
   * @type {boolean}
   */
  this.shouldRedrawFills = true;

  /**
   * Internal flag used by cells to mark that cell content should be redrawn.
   * @type {boolean}
   */
  this.shouldRedrawContent = true;

  /**
   * Border paths dictionary by stroke object hash.
   * @type {Object.<string, !acgraph.vector.Path>}
   * @private
   */
  this.borderPaths_ = null;

  /**
   * Cell fill paths dictionary by fill object hash.
   * @type {Object.<string, !acgraph.vector.Path>}
   * @private
   */
  this.fillPaths_ = null;

  /**
   * Pool of freed paths that can be reused.
   * @type {Array.<acgraph.vector.Path>}
   * @private
   */
  this.pathsPool_ = null;

  /**
   * Default cell fill.
   * @type {acgraph.vector.Fill}
   * @private
   */
  this.cellFill_ = 'none';

  /**
   * Default odd cell fill.
   * @type {acgraph.vector.Fill|undefined}
   * @private
   */
  this.cellOddFill_ = undefined;

  /**
   * Default even cell fill.
   * @type {acgraph.vector.Fill|undefined}
   * @private
   */
  this.cellEvenFill_ = undefined;

  /**
   * Default cell border.
   * @type {acgraph.vector.Stroke}
   * @private
   */
  this.cellBorder_ = anychart.color.normalizeStroke('1 black');

  /**
   * Default cell top border.
   * @type {acgraph.vector.Stroke|undefined}
   * @private
   */
  this.cellTopBorder_ = undefined;

  /**
   * Default cell bottom border.
   * @type {acgraph.vector.Stroke|undefined}
   * @private
   */
  this.cellBottomBorder_ = undefined;

  /**
   * Default cell left border.
   * @type {acgraph.vector.Stroke|undefined}
   * @private
   */
  this.cellLeftBorder_ = undefined;

  /**
   * Default cell right border.
   * @type {acgraph.vector.Stroke|undefined}
   * @private
   */
  this.cellRightBorder_ = undefined;

  /**
   * Default cell padding.
   * @type {anychart.utils.Padding}
   * @private
   */
  this.cellPadding_ = null;

  /**
   * @type {Array.<anychart.elements.Table.CellContent>|undefined}
   * @private
   */
  this.contentToDispose_ = undefined;

  this.cellPadding(0);
};
goog.inherits(anychart.elements.Table, anychart.VisualBaseWithBounds);


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.elements.Table.prototype.SUPPORTED_SIGNALS =
    anychart.VisualBaseWithBounds.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.elements.Table.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.VisualBaseWithBounds.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.APPEARANCE;


/**
 * @typedef {anychart.elements.LabelsFactory.Label|anychart.VisualBase}
 */
anychart.elements.Table.CellContent;


/**
 * Getter and setter for table rows count.
 * @param {number=} opt_value Rows count to set.
 * @return {number|!anychart.elements.Table}
 */
anychart.elements.Table.prototype.rowsCount = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.normalizeToNaturalNumber(opt_value, this.rowsCount_);
    if (this.rowsCount_ != opt_value) {
      if (isNaN(this.currentColsCount_)) // mark that we should rebuild the table
        this.currentColsCount_ = this.colsCount_;
      this.rowsCount_ = opt_value;
      this.shouldDropOverlap = true;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.rowsCount_;
};


/**
 * Getter and setter for table cols count.
 * @param {number=} opt_value Cols count to set.
 * @return {number|!anychart.elements.Table}
 */
anychart.elements.Table.prototype.colsCount = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.normalizeToNaturalNumber(opt_value, this.colsCount_);
    if (this.colsCount_ != opt_value) {
      if (isNaN(this.currentColsCount_)) // mark that we should rebuild the table
        this.currentColsCount_ = this.colsCount_;
      this.colsCount_ = opt_value;
      this.shouldDropOverlap = true;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.colsCount_;
};


/**
 * Getter and setter for row height settings. Null sets row height to default value.
 * @param {number} row Row number.
 * @param {(string|number|null)=} opt_value Value to set.
 * @return {string|number|null|anychart.elements.Table}
 */
anychart.elements.Table.prototype.rowHeight = function(row, opt_value) {
  if (goog.isDef(opt_value)) {
    row = goog.isNull(row) ? NaN : +row;
    if (!isNaN(row) && this.rowHeightSettings_[row] != opt_value) {
      if (goog.isNull(opt_value))
        delete this.rowHeightSettings_[row];
      else
        this.rowHeightSettings_[row] = opt_value;
      this.shouldRebuildSizes = true;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return row in this.rowHeightSettings_ ? this.rowHeightSettings_[row] : null;
};


/**
 * Getter and setter for column height settings. Null sets column width to default value.
 * @param {number} col Row number.
 * @param {(string|number|null)=} opt_value Value to set.
 * @return {string|number|null|anychart.elements.Table}
 */
anychart.elements.Table.prototype.colWidth = function(col, opt_value) {
  if (goog.isDef(opt_value)) {
    col = goog.isNull(col) ? NaN : +col;
    if (!isNaN(col) && this.colWidthSettings_[col] != opt_value) {
      if (goog.isNull(opt_value))
        delete this.colWidthSettings_[col];
      else
        this.colWidthSettings_[col] = opt_value;
      this.shouldRebuildSizes = true;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return col in this.colWidthSettings_ ? this.colWidthSettings_[col] : null;
};


/**
 * Returns cell by its row and column number.
 * @param {number} row
 * @param {number} col
 * @return {anychart.elements.Table.Cell}
 */
anychart.elements.Table.prototype.getCell = function(row, col) {
  this.checkTable_();
  // defaulting to NaN to return null when incorrect arguments are passed.
  row = anychart.utils.normalizeToNaturalNumber(row, NaN, true);
  col = anychart.utils.normalizeToNaturalNumber(col, NaN, true);
  return this.cells_[row * this.colsCount_ + col] || null;
};


//region Cell settings
//----------------------------------------------------------------------------------------------------------------------
//
//  Cell settings
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter and setter for table cell text factory. You can setup the default text appearance for entire table.
 * These settings apply to cells which content was setup as string or number. If you want to setup text appearance
 * for the particular cell, set cell content as string first, and then feel free to get the content and setup it.
 * @param {anychart.elements.LabelsFactory=} opt_value
 * @return {anychart.elements.LabelsFactory|anychart.elements.Table}
 */
anychart.elements.Table.prototype.cellTextFactory = function(opt_value) {
  if (!this.labelsFactory_) {
    this.labelsFactory_ = new anychart.elements.LabelsFactory();
    this.labelsFactory_.anchor(anychart.utils.NinePositions.CENTER);
    this.labelsFactory_.position(anychart.utils.NinePositions.CENTER);
    this.registerDisposable(this.labelsFactory_);
  }
  if (goog.isDef(opt_value)) {
    var shouldRedraw = true;
    if (opt_value instanceof anychart.elements.LabelsFactory) {
      this.labelsFactory_.deserialize(opt_value.serialize());
    } else if (goog.isObject(opt_value)) {
      this.labelsFactory_.deserialize(opt_value);
    } else if (anychart.utils.isNone(opt_value)) {
      this.labelsFactory_.enabled(false);
    } else {
      shouldRedraw = false;
    }
    if (shouldRedraw) {
      this.shouldRedrawContent = true;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.labelsFactory_;
};


/**
 * Cell padding settings.
 * @param {(string|number|Object|anychart.utils.Space)=} opt_spaceOrTopOrTopAndBottom .
 * @param {(string|number)=} opt_rightOrRightAndLeft .
 * @param {(string|number)=} opt_bottom .
 * @param {(string|number)=} opt_left .
 * @return {anychart.elements.Table|anychart.utils.Padding} .
 */
anychart.elements.Table.prototype.cellPadding = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  if (!this.cellPadding_) {
    this.cellPadding_ = new anychart.utils.Padding();
    this.cellPadding_.listenSignals(this.cellPaddingInvalidated_, this);
    this.registerDisposable(this.cellPadding_);
  }

  if (arguments.length > 0) {
    if (arguments.length > 1) {
      this.cellPadding_.set.apply(this.cellPadding_, arguments);
    } else if (opt_spaceOrTopOrTopAndBottom instanceof anychart.utils.Padding) {
      this.cellPadding_.deserialize(opt_spaceOrTopOrTopAndBottom.serialize());
    } else if (goog.isObject(opt_spaceOrTopOrTopAndBottom)) {
      this.cellPadding_.deserialize(opt_spaceOrTopOrTopAndBottom);
    } else {
      this.cellPadding_.set(opt_spaceOrTopOrTopAndBottom);
    }
    return this;
  } else {
    return this.cellPadding_;
  }
};


/**
 * Default table cell background fill getter/setter. If set, resets even and odd cell fills.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.elements.Table} .
 */
anychart.elements.Table.prototype.cellFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var shouldInvalidate = false;
    if (this.cellOddFill_ || this.cellEvenFill_) {
      this.cellOddFill_ = undefined;
      this.cellEvenFill_ = undefined;
      shouldInvalidate = true;
    }
    var fill = anychart.color.normalizeFill.apply(null, arguments);
    if (fill != this.cellFill_) {
      this.cellFill_ = fill;
      shouldInvalidate = true;
    }
    if (shouldInvalidate) {
      this.shouldRedrawFills = true;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.cellFill_;
};


/**
 * Table cell background fill getter/setter for cells in odd rows. Use null to reset to default cell fill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.elements.Table|undefined} .
 */
anychart.elements.Table.prototype.cellOddFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var shouldInvalidate = false;
    if (goog.isNull(opt_fillOrColorOrKeys)) {
      this.cellOddFill_ = undefined;
      shouldInvalidate = true;
    } else {
      var fill = anychart.color.normalizeFill.apply(null, arguments);
      if (fill != this.cellOddFill_) {
        this.cellOddFill_ = fill;
        shouldInvalidate = true;
      }
    }
    if (shouldInvalidate) {
      this.shouldRedrawFills = true;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.cellOddFill_;
};


/**
 * Table cell background fill getter/setter for cells in even rows. Use null to reset to default cell fill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.elements.Table|undefined} .
 */
anychart.elements.Table.prototype.cellEvenFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var shouldInvalidate = false;
    if (goog.isNull(opt_fillOrColorOrKeys)) {
      this.cellEvenFill_ = undefined;
      shouldInvalidate = true;
    } else {
      var fill = anychart.color.normalizeFill.apply(null, arguments);
      if (fill != this.cellEvenFill_) {
        this.cellEvenFill_ = fill;
        shouldInvalidate = true;
      }
    }
    if (shouldInvalidate) {
      this.shouldRedrawFills = true;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.cellEvenFill_;
};


/**
 * Table cell border settings for all 4 sides simultaneously. The last usage of border(), leftBorder(), rightBorder(),
 * topBorder() and bottomBorder() methods determines the border for the corresponding side.
 *
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill Настройки заливки
 *    границ или просто настройки заливки.
 * @param {number=} opt_thickness Толщина линии.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Стиль (форма) соединения меду двумя линиями.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Style of line cap.
 * @return {anychart.elements.Table|acgraph.vector.Stroke|undefined} .
 */
anychart.elements.Table.prototype.cellBorder = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var stroke = anychart.color.normalizeStroke.apply(null, arguments);
    if (stroke != this.cellBorder_) {
      this.cellBorder_ = stroke;
      this.shouldRedrawBorders = true;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.cellBorder_;
};


/**
 * Left border settings for all cells. The last usage of cellBorder(), cellLeftBorder(), cellRightBorder(),
 * cellTopBorder() and cellLeftBorder() methods determines the border for the corresponding side.
 * As a getter returns only the side override if any. To determine table default for the left cell border use
 * table.cellLeftBorder() || table.border().
 *
 * Note: If you want to reset side override, use null. If you want to remove border for the side, use 'none'.
 *
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill Настройки заливки
 *    границ или просто настройки заливки.
 * @param {number=} opt_thickness Толщина линии.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Стиль (форма) соединения меду двумя линиями.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Style of line cap.
 * @return {anychart.elements.Table|acgraph.vector.Stroke|undefined} .
 */
anychart.elements.Table.prototype.cellLeftBorder = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var shouldInvalidate = false;
    if (goog.isNull(opt_strokeOrFill)) {
      if (this.cellLeftBorder_) {
        this.cellLeftBorder_ = undefined;
        shouldInvalidate = true;
      }
    } else {
      var stroke = anychart.color.normalizeStroke.apply(null, arguments);
      if (stroke != this.cellLeftBorder_) {
        this.cellLeftBorder_ = stroke;
        shouldInvalidate = true;
      }
    }
    if (shouldInvalidate) {
      this.shouldRedrawBorders = true;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.cellLeftBorder_;
};


/**
 * Right border settings for all cells. The last usage of cellBorder(), cellLeftBorder(), cellRightBorder(),
 * cellTopBorder() and cellRightBorder() methods determines the border for the corresponding side.
 * As a getter returns only the side override if any. To determine table default for the right cell border use
 * table.cellRightBorder() || table.border().
 *
 * Note: If you want to reset side override, use null. If you want to remove border for the side, use 'none'.
 *
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill Настройки заливки
 *    границ или просто настройки заливки.
 * @param {number=} opt_thickness Толщина линии.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Стиль (форма) соединения меду двумя линиями.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Style of line cap.
 * @return {anychart.elements.Table|acgraph.vector.Stroke|undefined} .
 */
anychart.elements.Table.prototype.cellRightBorder = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var shouldInvalidate = false;
    if (goog.isNull(opt_strokeOrFill)) {
      if (this.cellRightBorder_) {
        this.cellRightBorder_ = undefined;
        shouldInvalidate = true;
      }
    } else {
      var stroke = anychart.color.normalizeStroke.apply(null, arguments);
      if (stroke != this.cellRightBorder_) {
        this.cellRightBorder_ = stroke;
        shouldInvalidate = true;
      }
    }
    if (shouldInvalidate) {
      this.shouldRedrawBorders = true;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.cellRightBorder_;
};


/**
 * Top border settings for all cells. The last usage of cellBorder(), cellLeftBorder(), cellRightBorder(),
 * cellTopBorder() and cellTopBorder() methods determines the border for the corresponding side.
 * As a getter returns only the side override if any. To determine table default for the top cell border use
 * table.cellTopBorder() || table.border().
 *
 * Note: If you want to reset side override, use null. If you want to remove border for the side, use 'none'.
 *
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill Настройки заливки
 *    границ или просто настройки заливки.
 * @param {number=} opt_thickness Толщина линии.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Стиль (форма) соединения меду двумя линиями.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Style of line cap.
 * @return {anychart.elements.Table|acgraph.vector.Stroke|undefined} .
 */
anychart.elements.Table.prototype.cellTopBorder = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var shouldInvalidate = false;
    if (goog.isNull(opt_strokeOrFill)) {
      if (this.cellTopBorder_) {
        this.cellTopBorder_ = undefined;
        shouldInvalidate = true;
      }
    } else {
      var stroke = anychart.color.normalizeStroke.apply(null, arguments);
      if (stroke != this.cellTopBorder_) {
        this.cellTopBorder_ = stroke;
        shouldInvalidate = true;
      }
    }
    if (shouldInvalidate) {
      this.shouldRedrawBorders = true;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.cellTopBorder_;
};


/**
 * Bottom border settings for all cells. The last usage of cellBorder(), cellLeftBorder(), cellRightBorder(),
 * cellTopBorder() and cellBottomBorder() methods determines the border for the corresponding side.
 * As a getter returns only the side override if any. To determine table default for the bottom cell border use
 * table.cellBottomBorder() || table.border().
 *
 * Note: If you want to reset side override, use null. If you want to remove border for the side, use 'none'.
 *
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill Настройки заливки
 *    границ или просто настройки заливки.
 * @param {number=} opt_thickness Толщина линии.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Стиль (форма) соединения меду двумя линиями.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Style of line cap.
 * @return {anychart.elements.Table|acgraph.vector.Stroke|undefined} .
 */
anychart.elements.Table.prototype.cellBottomBorder = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var shouldInvalidate = false;
    if (goog.isNull(opt_strokeOrFill)) {
      if (this.cellBottomBorder_) {
        this.cellBottomBorder_ = undefined;
        shouldInvalidate = true;
      }
    } else {
      var stroke = anychart.color.normalizeStroke.apply(null, arguments);
      if (stroke != this.cellBottomBorder_) {
        this.cellBottomBorder_ = stroke;
        shouldInvalidate = true;
      }
    }
    if (shouldInvalidate) {
      this.shouldRedrawBorders = true;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.cellBottomBorder_;
};
//endregion


/**
 * Draws the table.
 * @return {anychart.elements.Table}
 */
anychart.elements.Table.prototype.draw = function() {
  if (!this.checkDrawingNeeded())
    return this;

  if (!this.layer_) {
    this.layer_ = acgraph.layer();
    this.contentLayer_ = this.layer_.layer();
    this.registerDisposable(this.layer_);
    this.registerDisposable(this.contentLayer_);
  }

  var stage = this.layer_.getStage();
  var manualSuspend = stage && !stage.isSuspended();
  if (manualSuspend) stage.suspend();

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.shouldRebuildSizes = true; // if sizes changed, it will be checked in drawing
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
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
    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    this.layer_.zIndex(/** @type {number} */(this.zIndex()));
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    this.layer_.parent(/** @type {acgraph.vector.ILayer} */(this.container()));
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  if (manualSuspend) stage.resume();

  return this;
};


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
anychart.elements.Table.prototype.checkTable_ = function() {
  if (isNaN(this.currentColsCount_))
    return;
  var newCells = [];
  var currentRowsCount = this.currentColsCount_ ? this.cells_.length / this.currentColsCount_ : 0;
  var row, col;
  var rowsFromCells = Math.min(currentRowsCount, this.rowsCount_);
  var colsFromCells = Math.min(this.currentColsCount_, this.colsCount_);
  for (row = 0; row < rowsFromCells; row++) { // processing rows that are both in current in new tables
    for (col = 0; col < colsFromCells; col++) // adding cells from current cells_ array.
      newCells.push(this.cells_[row * this.colsCount_ + col]);
    for (col = colsFromCells; col < this.colsCount_; col++) // adding new cells to the row if needed.
      newCells.push(this.allocCell_(row, col));
    for (col = colsFromCells; col < this.currentColsCount_; col++) // clearing cells that are not needed anymore.
      this.freeCell_(this.cells_[row * this.colsCount_ + col]);
  }

  for (row = rowsFromCells; row < this.rowsCount_; row++) { // rows that should be added entirely
    for (col = 0; col < this.colsCount_; col++) // adding new cells if needed.
      newCells.push(this.allocCell_(row, col));
  }

  for (row = rowsFromCells; row < currentRowsCount; row++) { // rows that should be removed entirely
    for (col = 0; col < this.currentColsCount_; col++) // clearing cells that are not needed anymore.
      this.freeCell_(this.cells_[row * this.colsCount_ + col]);
  }

  this.cells_ = newCells;
  this.currentColsCount_ = NaN;
  this.shouldRebuildSizes = true;
  this.shouldDropOverlap = true;
  this.shouldRedrawBorders = true;
  this.shouldRedrawFills = true;
  this.shouldRedrawContent = true;
};


/**
 * Rebuilds cell sizes.
 * @private
 */
anychart.elements.Table.prototype.checkSizes_ = function() {
  if (this.shouldRebuildSizes) {
    var newColRights = new Array(this.colsCount_);
    var newRowBottoms = new Array(this.rowsCount_);
    var i, len, val, size, needsRedraw = false;

    var distributedSize = 0;
    var fixedSizes = [];
    var autoSizesCount = 0;
    var tableSize = this.pixelBounds().width;
    for (i = 0, len = this.colsCount_; i < len; i++) {
      size = anychart.utils.normalize(this.colWidthSettings_[i], tableSize);
      if (isNaN(size)) {
        autoSizesCount++;
      } else {
        distributedSize += size;
        fixedSizes[i] = size;
      }
    }
    // min to 3px per autoColumn to make them visible, but not good-looking.
    var autoSize = Math.max(3 * autoSizesCount, tableSize - distributedSize) / autoSizesCount;
    var current = 0;
    for (i = 0, len = this.colsCount_ - 1; i < len; i++) {
      if (i in fixedSizes)
        size = fixedSizes[i];
      else
        size = autoSize;
      current += size;
      val = Math.round(current) - 1;
      newColRights[i] = val;
      if (val != this.colRights_[i]) needsRedraw = true;
    }
    if (this.colsCount_ > 0) { // last column
      i = this.colsCount_ - 1;
      newColRights[i] = val = Math.round(current + ((i in fixedSizes) ? fixedSizes[i] : autoSize));
      if (val != this.colRights_[i]) needsRedraw = true;
    }

    distributedSize = 0;
    fixedSizes.length = 0;
    autoSizesCount = 0;
    tableSize = this.pixelBounds().height;
    for (i = 0, len = this.rowsCount_; i < len; i++) {
      size = anychart.utils.normalize(this.rowHeightSettings_[i], tableSize);
      if (isNaN(size)) {
        autoSizesCount++;
      } else {
        distributedSize += size;
        fixedSizes[i] = size;
      }
    }
    // min to 3px per autorow to make them visible, but not good-looking.
    autoSize = Math.max(3 * autoSizesCount, tableSize - distributedSize) / autoSizesCount;
    current = 0;
    for (i = 0, len = this.rowsCount_ - 1; i < len; i++) {
      if (i in fixedSizes)
        size = fixedSizes[i];
      else
        size = autoSize;
      current += size;
      val = Math.round(current) - 1;
      newRowBottoms[i] = val;
      if (val != this.rowBottoms_[i]) needsRedraw = true;
    }
    if (this.rowsCount_ > 0) { // last row
      i = this.rowsCount_ - 1;
      newRowBottoms[i] = val = Math.round(current + ((i in fixedSizes) ? fixedSizes[i] : autoSize));
      if (val != this.rowBottoms_[i]) needsRedraw = true;
    }

    this.shouldRebuildSizes = false;
    if (needsRedraw) {
      this.colRights_ = newColRights;
      this.rowBottoms_ = newRowBottoms;
      this.shouldRedrawBorders = true;
      this.shouldRedrawFills = true;
      this.shouldRedrawContent = true;
    }
  }
};


/**
 * Renews overlapping cells marking.
 * @private
 */
anychart.elements.Table.prototype.checkOverlap_ = function() {
  if (this.shouldDropOverlap) {
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
    this.shouldDropOverlap = false;
    this.shouldRedrawBorders = true;
    this.shouldRedrawFills = true;
    this.shouldRedrawContent = true;
  }
};


/**
 * Redraws cell filling.
 * @private
 */
anychart.elements.Table.prototype.checkFills_ = function() {
  if (this.shouldRedrawFills) {
    this.resetFillPaths_();
    for (var row = 0; row < this.rowsCount_; row++) {
      for (var col = 0; col < this.colsCount_; col++) {
        var cell = this.cells_[row * this.colsCount_ + col];
        if (isNaN(cell.overlapper)) {
          var bounds = this.getCellBounds(row, col,
              /** @type {number} */(cell.rowSpan()),
              /** @type {number} */(cell.colSpan()), bounds); // rect will be created one time and then reused
          var fill = this.getCellFill_(cell, row);
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
    this.shouldRedrawFills = false;
  }
};


/**
 * Redraws cell filling.
 * @private
 */
anychart.elements.Table.prototype.checkBorders_ = function() {
  if (this.shouldRedrawBorders) {
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
    this.shouldRedrawBorders = false;
  }
};


/**
 * Draws table cells content.
 * @private
 */
anychart.elements.Table.prototype.checkContent_ = function() {
  var content, bounds, label;
  if (this.shouldRedrawContent) {
    if (this.contentToDispose_) {
      while (this.contentToDispose_.length) {
        content = this.contentToDispose_.pop();
        content.suspendSignalsDispatching();
        if (content instanceof anychart.elements.LabelsFactory.Label) {
          label = /** @type {anychart.elements.LabelsFactory.Label} */(content);
          if (label.parentLabelsFactory())
            label.parentLabelsFactory().clear(label.getIndex());
        } else if ((content instanceof anychart.VisualBaseWithBounds) || content.parentBounds) {
          content.container(null);
          content.draw();
        }
        content.resumeSignalsDispatching(false);
      }
    }

    for (var row = 0; row < this.rowsCount_; row++) {
      for (var col = 0; col < this.colsCount_; col++) {
        var cell = this.cells_[row * this.colsCount_ + col];
        content = /** @type {anychart.elements.Table.CellContent} */(cell.content());
        if (content) {
          if (isNaN(cell.overlapper)) {
            bounds = this.getCellBounds(row, col,
                /** @type {number} */(cell.rowSpan()), /** @type {number} */(cell.colSpan()), bounds);
            var padding = cell.getPaddingOverride() || this.cellPadding_;
            bounds = padding.tightenBounds(bounds);
            content.suspendSignalsDispatching();
            content.container(this.contentLayer_);
            if (content instanceof anychart.elements.LabelsFactory.Label) {
              label = /** @type {anychart.elements.LabelsFactory.Label} */(content);
              // here is proper label position determining. It is done in this way, because we are not sure, that
              // the label in the cell was created by the table labels factory, so we need to use label's own
              // methods to determine the correct behaviour. And also, as we don't use this.cellTextFactory() here,
              // the table factory is not created if it is not used.
              var position = /** @type {string} */(
                  label.position() ||
                  label.currentLabelsFactory() && label.currentLabelsFactory().position() ||
                  label.parentLabelsFactory() && label.parentLabelsFactory().position());
              label.positionProvider(
                  anychart.utils.getCoordinateByAnchor(
                      bounds,
                      position));
            } else if (content instanceof anychart.VisualBaseWithBounds) {
              var elementWithBounds = /** @type {anychart.VisualBaseWithBounds} */(content);
              elementWithBounds.pixelBounds(null);
              var chartBounds = /** @type {anychart.math.Rect} */(elementWithBounds.pixelBounds(bounds.width, bounds.height));
              chartBounds.left += bounds.left;
              chartBounds.top += bounds.top;
              elementWithBounds.pixelBounds(chartBounds);
              elementWithBounds.draw();
            } else if (content.parentBounds) {
              var element = /** @type {anychart.VisualBase} */(content);
              element.parentBounds(bounds);
              element.draw();
            }
            content.resumeSignalsDispatching(false);
          } else {
            content.enabled(false);
            content.draw();
          }
        }
      }
    }
    if (this.labelsFactory_) {
      this.labelsFactory_.container(this.contentLayer_);
      this.labelsFactory_.parentBounds(/** @type {anychart.math.Rect} */(this.pixelBounds()));
      this.labelsFactory_.draw();
    }
    this.shouldRedrawContent = false;
  }
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
anychart.elements.Table.prototype.drawBorder_ = function(row, col, rowSpan, colSpan, stroke, side) {
  if (stroke && stroke != 'none') {
    var lineThickness = stroke['thickness'] ? stroke['thickness'] : 1;
    var pixelShift = (lineThickness % 2) ? 0.5 : 0;
    var bounds = this.getCellBounds(row, col, rowSpan, colSpan, bounds);
    var path = this.getBorderPath_(stroke);
    switch (side) {
      case 0: // top
        path.moveTo(bounds.getLeft(), bounds.getTop() + pixelShift);
        path.lineTo(bounds.getRight(), bounds.getTop() + pixelShift);
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
        path.lineTo(bounds.getLeft() + pixelShift, bounds.getBottom());
        break;
    }
  }
};


/**
 * Return final fill for the cell.
 * @param {anychart.elements.Table.Cell} cell
 * @param {number} row
 * @return {acgraph.vector.Fill}
 * @private
 */
anychart.elements.Table.prototype.getCellFill_ = function(cell, row) {
  var fill = /** @type {acgraph.vector.Fill|undefined} */(cell.fill());
  if (goog.isDef(fill)) return fill;
  fill = (row % 2) ? this.cellOddFill_ : this.cellEvenFill_;
  if (goog.isDef(fill)) return fill;
  return this.cellFill_;
};


/**
 * Returns final horizontal border stroke settings between two cells.
 * @param {anychart.elements.Table.Cell|undefined} topCell
 * @param {anychart.elements.Table.Cell|undefined} bottomCell
 * @return {acgraph.vector.Stroke}
 * @private
 */
anychart.elements.Table.prototype.getCellHorizontalBorder_ = function(topCell, bottomCell) {
  if (topCell || bottomCell) {
    var upperStroke, lowerStroke;
    // upper cell settings have advantage on same settings level.
    // checking specific border overrides
    upperStroke = topCell && topCell.bottomBorder();
    lowerStroke = bottomCell && bottomCell.topBorder();
    if (upperStroke) return /** @type {acgraph.vector.Stroke} */(upperStroke);
    if (lowerStroke) return /** @type {acgraph.vector.Stroke} */(lowerStroke);
    //checking cell border overrides
    upperStroke = topCell && topCell.border();
    lowerStroke = bottomCell && bottomCell.border();
    if (upperStroke) return /** @type {acgraph.vector.Stroke} */(upperStroke);
    if (lowerStroke) return /** @type {acgraph.vector.Stroke} */(lowerStroke);
    //checking table-level specific borders
    upperStroke = topCell && this.cellBottomBorder_;
    lowerStroke = bottomCell && this.cellTopBorder_;
    if (upperStroke) return /** @type {acgraph.vector.Stroke} */(upperStroke);
    if (lowerStroke) return /** @type {acgraph.vector.Stroke} */(lowerStroke);
    // fallback to default table cell border
    return this.cellBorder_;
  }
  return 'none';
};


/**
 * Returns final vertical border stroke settings between two cells.
 * @param {anychart.elements.Table.Cell|undefined} leftCell
 * @param {anychart.elements.Table.Cell|undefined} rightCell
 * @return {acgraph.vector.Stroke}
 * @private
 */
anychart.elements.Table.prototype.getCellVerticalBorder_ = function(leftCell, rightCell) {
  if (leftCell || rightCell) {
    var leftStroke, rightStroke;
    // upper cell settings have advantage on same settings level.
    // checking specific border overrides
    leftStroke = leftCell && leftCell.rightBorder();
    rightStroke = rightCell && rightCell.leftBorder();
    if (leftStroke) return /** @type {acgraph.vector.Stroke} */(leftStroke);
    if (rightStroke) return /** @type {acgraph.vector.Stroke} */(rightStroke);
    //checking cell border overrides
    leftStroke = leftCell && leftCell.border();
    rightStroke = rightCell && rightCell.border();
    if (leftStroke) return /** @type {acgraph.vector.Stroke} */(leftStroke);
    if (rightStroke) return /** @type {acgraph.vector.Stroke} */(rightStroke);
    //checking table-level specific borders
    leftStroke = leftCell && this.cellRightBorder_;
    rightStroke = rightCell && this.cellLeftBorder_;
    if (leftStroke) return /** @type {acgraph.vector.Stroke} */(leftStroke);
    if (rightStroke) return /** @type {acgraph.vector.Stroke} */(rightStroke);
    // fallback to default table cell border
    return this.cellBorder_;
  }
  return 'none';
};


/**
 * Removes all border paths and clears hashes.
 * @private
 */
anychart.elements.Table.prototype.resetBorderPaths_ = function() {
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
anychart.elements.Table.prototype.resetFillPaths_ = function() {
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
anychart.elements.Table.prototype.getBorderPath_ = function(stroke) {
  var hash = anychart.utils.hash(stroke);
  if (hash in this.borderPaths_)
    return this.borderPaths_[hash];
  else {
    var path = this.pathsPool_.length ?
        /** @type {!acgraph.vector.Path} */(this.pathsPool_.pop()) :
        acgraph.path();
    this.layer_.addChild(path);
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
anychart.elements.Table.prototype.getFillPath_ = function(fill) {
  var hash = anychart.utils.hash(fill);
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
 * Returns bounds for the cell. Result is placed in opt_outBounds argument, if passed.
 * @param {number} row
 * @param {number} col
 * @param {number} rowSpan
 * @param {number} colSpan
 * @param {anychart.math.Rect=} opt_outBounds Result is placed here.
 * @return {!anychart.math.Rect}
 */
anychart.elements.Table.prototype.getCellBounds = function(row, col, rowSpan, colSpan, opt_outBounds) {
  var tableBounds = this.pixelBounds();
  var outBounds = opt_outBounds instanceof anychart.math.Rect ? opt_outBounds : new anychart.math.Rect(0, 0, 0, 0);
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
 * This method is used by cells to check table consistency before getting bounds.
 * These calls were not placed to Table.getCellBounds to avoid unneeded overhead.
 */
anychart.elements.Table.prototype.checkConsistency = function() {
  this.checkTable_();
  this.checkSizes_();
};


/**
 * Marks content to be cleared. Used by cells.
 * @param {anychart.elements.Table.CellContent} content
 */
anychart.elements.Table.prototype.clearContent = function(content) {
  this.contentToDispose_ = this.contentToDispose_ || [];
  this.contentToDispose_.push(content);
  this.shouldRedrawContent = true;
};


/**
 * Internal cellPadding invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.elements.Table.prototype.cellPaddingInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.shouldRedrawContent = true;
    this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Marks the cell to be removed on next draw.
 * @param {anychart.elements.Table.Cell} cell Cell to free.
 * @private
 */
anychart.elements.Table.prototype.freeCell_ = function(cell) {
  var cellContent = cell.content();
  if (cellContent) {
    if (this.labelsFactory_ && cellContent instanceof anychart.elements.LabelsFactory.Label)
      this.labelsFactory_.clear(cellContent.getIndex());
    else
      cellContent.container(null);
  }
  this.cellsPool_.push(cell);
};


/**
 * Allocates a new cell or reuses previously freed one.
 * @param {number} row
 * @param {number} col
 * @return {anychart.elements.Table.Cell}
 * @private
 */
anychart.elements.Table.prototype.allocCell_ = function(row, col) {
  return this.cellsPool_.length ? // checking if there are any cells in pool
      /** @type {anychart.elements.Table.Cell} */(this.cellsPool_.pop().reset(row, col)) :
      new anychart.elements.Table.Cell(this, row, col);
};
//endregion


/**
 * Creates cell content for text cells. Used by cells.
 * @param {*} value Text to be set for the label.
 * @return {!anychart.elements.LabelsFactory.Label}
 */
anychart.elements.Table.prototype.createTextCellContent = function(value) {
  value = value + '';
  return this.cellTextFactory().add(value, {'x': 0, 'y': 0});
};


/** @inheritDoc */
anychart.elements.Table.prototype.disposeInternal = function() {
  goog.disposeAll(this.cells_, this.cellsPool_);
  goog.base(this, 'disposeInternal');
};



/**
 * Table cell.
 * @param {anychart.elements.Table} table
 * @param {number} row
 * @param {number} col
 * @constructor
 * @extends {goog.Disposable}
 */
anychart.elements.Table.Cell = function(table, row, col) {
  goog.base(this);
  /**
   * If the content_ should be disposed on reset().
   * @type {boolean}
   * @private
   */
  this.disposableContent_ = false;

  /**
   * Table reference.
   * @type {anychart.elements.Table}
   * @private
   */
  this.table_ = table;
  this.reset(row, col);
};
goog.inherits(anychart.elements.Table.Cell, goog.Disposable);


/**
 * @typedef {{
 *  fill: acgraph.vector.Fill,
 *  border: acgraph.vector.Stroke,
 *  topBorder: acgraph.vector.Stroke,
 *  rightBorder: acgraph.vector.Stroke,
 *  bottomBorder: acgraph.vector.Stroke,
 *  leftBorder: acgraph.vector.Stroke,
 *  padding: anychart.utils.Padding
 * }}
 */
anychart.elements.Table.Cell.SettingsObj;


/**
 * Cell settings overrides.
 * @type {!anychart.elements.Table.Cell.SettingsObj}
 * @private
 */
anychart.elements.Table.Cell.settings_;


/**
 * Resets Cell settings and row/col position.
 * @param {number} row
 * @param {number} col
 * @return {anychart.elements.Table.Cell}
 */
anychart.elements.Table.Cell.prototype.reset = function(row, col) {
  /**
   * Number of rows the cell spans for.
   * @type {number}
   * @private
   */
  this.rowSpan_ = 1;
  /**
   * Number of columns the cell spans for.
   * @type {number}
   * @private
   */
  this.colSpan_ = 1;
  /**
   * Cell row number. Needed only for getRow() and getBounds().
   * @type {number}
   * @private
   */
  this.row_ = row;
  /**
   * Cell column number. Needed only for getCol() and getBounds().
   * @type {number}
   * @private
   */
  this.col_ = col;

  if (this.disposableContent_)
    goog.dispose(this.content_);
  /**
   * Content.
   * @type {anychart.elements.Table.CellContent}
   * @private
   */
  this.content_ = null;
  this.disposableContent_ = false;
  /**
   * Flag used by the table. If not NaN - the cell is overlapped by other cell and shouldn't be drawn.
   * @type {number}
   */
  this.overlapper = NaN;

  delete this.settings_;

  return this;
};


/**
 *
 * @param {(anychart.elements.Table.CellContent|string|number)=} opt_value
 * @return {anychart.elements.Table.CellContent|anychart.elements.Table.Cell}
 */
anychart.elements.Table.Cell.prototype.content = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.content_)
      this.table_.clearContent(this.content_);
    this.disposableContent_ = (goog.isNumber(opt_value) || goog.isString(opt_value));
    if (this.disposableContent_)
      opt_value = this.table_.createTextCellContent(opt_value);
    this.content_ = /** @type {anychart.Chart|anychart.elements.LabelsFactory.Label} */(opt_value);
    this.table_.shouldRedrawContent = true;
    this.table_.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    return this;
  }
  return this.content_;
};


/**
 * Returns cell row number.
 * @return {number}
 */
anychart.elements.Table.Cell.prototype.getRow = function() {
  return this.row_;
};


/**
 * Returns cell column number.
 * @return {number}
 */
anychart.elements.Table.Cell.prototype.getCol = function() {
  return this.col_;
};


/**
 * Returns cell bounds without padding counted (bounds which are used for borders drawing).
 * @return {!anychart.math.Rect}
 */
anychart.elements.Table.Cell.prototype.getBounds = function() {
  this.table_.checkConsistency();
  return this.table_.getCellBounds(this.row_, this.col_, this.rowSpan_, this.colSpan_);
};


/**
 * Table cell background fill getter/setter.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.elements.Table.Cell} .
 */
anychart.elements.Table.Cell.prototype.fill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var shouldInvalidate = false;
    if (goog.isNull(opt_fillOrColorOrKeys)) {
      if (this.settings_ && this.settings_.fill) {
        delete this.settings_.fill;
        shouldInvalidate = true;
      }
    } else {
      var fill = anychart.color.normalizeFill.apply(null, arguments);
      if (!this.settings_) this.settings_ = /** @type {anychart.elements.Table.Cell.SettingsObj} */({});
      if (fill != this.settings_.fill) {
        this.settings_.fill = fill;
        shouldInvalidate = true;
      }
    }
    if (shouldInvalidate) {
      this.table_.shouldRedrawFills = true;
      this.table_.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.settings_ && this.settings_.fill;
};


/**
 * Table cell border settings for all 4 sides simultaneously. The last usage of border(), leftBorder(), rightBorder(),
 * topBorder() and bottomBorder() methods determines the border for the corresponding side.
 *
 * Note: If you want to reset cell overrides, use null. If you want to remove border from the cell, use 'none'.
 *
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill Настройки заливки
 *    границ или просто настройки заливки.
 * @param {number=} opt_thickness Толщина линии.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Стиль (форма) соединения меду двумя линиями.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Style of line cap.
 * @return {anychart.elements.Table.Cell|acgraph.vector.Stroke|undefined} .
 */
anychart.elements.Table.Cell.prototype.border = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var shouldInvalidate = this.settings_ && (this.settings_.leftBorder || this.settings_.rightBorder ||
        this.settings_.topBorder || this.settings_.bottomBorder);
    if (shouldInvalidate) {
      delete this.settings_.leftBorder;
      delete this.settings_.rightBorder;
      delete this.settings_.topBorder;
      delete this.settings_.bottomBorder;
    }
    if (goog.isNull(opt_strokeOrFill)) {
      if (this.settings_ && this.settings_.border) {
        delete this.settings_.border;
        shouldInvalidate = true;
      }
    } else {
      if (!this.settings_) this.settings_ = /** @type {anychart.elements.Table.Cell.SettingsObj} */({});
      var stroke = anychart.color.normalizeStroke.apply(null, arguments);
      if (stroke != this.settings_.border) {
        this.settings_.border = stroke;
        shouldInvalidate = true;
      }
    }
    if (shouldInvalidate) {
      this.table_.shouldRedrawBorders = true;
      this.table_.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.settings_ && this.settings_.border;
};


/**
 * Left border settings for the cell. The last usage of border(), leftBorder(), rightBorder(),
 * topBorder() and bottomBorder() methods determines the border for the corresponding side.
 *
 * Note: If you want to reset cell overrides, use null. If you want to remove border from the cell, use 'none'.
 *
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill Настройки заливки
 *    границ или просто настройки заливки.
 * @param {number=} opt_thickness Толщина линии.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Стиль (форма) соединения меду двумя линиями.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Style of line cap.
 * @return {anychart.elements.Table.Cell|acgraph.vector.Stroke|undefined} .
 */
anychart.elements.Table.Cell.prototype.leftBorder = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var shouldInvalidate = false;
    if (goog.isNull(opt_strokeOrFill)) {
      if (this.settings_ && this.settings_.leftBorder) {
        delete this.settings_.leftBorder;
        shouldInvalidate = true;
      }
    } else {
      if (!this.settings_) this.settings_ = /** @type {anychart.elements.Table.Cell.SettingsObj} */({});
      var stroke = anychart.color.normalizeStroke.apply(null, arguments);
      if (stroke != this.settings_.leftBorder) {
        this.settings_.leftBorder = stroke;
        shouldInvalidate = true;
      }
    }
    if (shouldInvalidate) {
      this.table_.shouldRedrawBorders = true;
      this.table_.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.settings_ && this.settings_.leftBorder;
};


/**
 * Right border settings for the cell. The last usage of border(), leftBorder(), rightBorder(),
 * topBorder() and bottomBorder() methods determines the border for the corresponding side.
 *
 * Note: If you want to reset cell overrides, use null. If you want to remove border from the cell, use 'none'.
 *
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill Настройки заливки
 *    границ или просто настройки заливки.
 * @param {number=} opt_thickness Толщина линии.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Стиль (форма) соединения меду двумя линиями.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Style of line cap.
 * @return {anychart.elements.Table.Cell|acgraph.vector.Stroke|undefined} .
 */
anychart.elements.Table.Cell.prototype.rightBorder = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var shouldInvalidate = false;
    if (goog.isNull(opt_strokeOrFill)) {
      if (this.settings_ && this.settings_.rightBorder) {
        delete this.settings_.rightBorder;
        shouldInvalidate = true;
      }
    } else {
      if (!this.settings_) this.settings_ = /** @type {anychart.elements.Table.Cell.SettingsObj} */({});
      var stroke = anychart.color.normalizeStroke.apply(null, arguments);
      if (stroke != this.settings_.rightBorder) {
        this.settings_.rightBorder = stroke;
        shouldInvalidate = true;
      }
    }
    if (shouldInvalidate) {
      this.table_.shouldRedrawBorders = true;
      this.table_.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.settings_ && this.settings_.rightBorder;
};


/**
 * Top border settings for the cell. The last usage of border(), leftBorder(), rightBorder(),
 * topBorder() and bottomBorder() methods determines the border for the corresponding side.
 *
 * Note: If you want to reset cell overrides, use null. If you want to remove border from the cell, use 'none'.
 *
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill Настройки заливки
 *    границ или просто настройки заливки.
 * @param {number=} opt_thickness Толщина линии.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Стиль (форма) соединения меду двумя линиями.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Style of line cap.
 * @return {anychart.elements.Table.Cell|acgraph.vector.Stroke|undefined} .
 */
anychart.elements.Table.Cell.prototype.topBorder = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var shouldInvalidate = false;
    if (goog.isNull(opt_strokeOrFill)) {
      if (this.settings_ && this.settings_.topBorder) {
        delete this.settings_.topBorder;
        shouldInvalidate = true;
      }
    } else {
      if (!this.settings_) this.settings_ = /** @type {anychart.elements.Table.Cell.SettingsObj} */({});
      var stroke = anychart.color.normalizeStroke.apply(null, arguments);
      if (stroke != this.settings_.topBorder) {
        this.settings_.topBorder = stroke;
        shouldInvalidate = true;
      }
    }
    if (shouldInvalidate) {
      this.table_.shouldRedrawBorders = true;
      this.table_.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.settings_ && this.settings_.topBorder;
};


/**
 * Bottom border settings for the cell. The last usage of border(), leftBorder(), rightBorder(),
 * topBorder() and bottomBorder() methods determines the border for the corresponding side.
 *
 * Note: If you want to reset cell overrides, use null. If you want to remove border from the cell, use 'none'.
 *
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill Настройки заливки
 *    границ или просто настройки заливки.
 * @param {number=} opt_thickness Толщина линии.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Стиль (форма) соединения меду двумя линиями.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Style of line cap.
 * @return {anychart.elements.Table.Cell|acgraph.vector.Stroke|undefined} .
 */
anychart.elements.Table.Cell.prototype.bottomBorder = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var shouldInvalidate = false;
    if (goog.isNull(opt_strokeOrFill)) {
      if (this.settings_ && this.settings_.bottomBorder) {
        delete this.settings_.bottomBorder;
        shouldInvalidate = true;
      }
    } else {
      if (!this.settings_) this.settings_ = /** @type {anychart.elements.Table.Cell.SettingsObj} */({});
      var stroke = anychart.color.normalizeStroke.apply(null, arguments);
      if (stroke != this.settings_.bottomBorder) {
        this.settings_.bottomBorder = stroke;
        shouldInvalidate = true;
      }
    }
    if (shouldInvalidate) {
      this.table_.shouldRedrawBorders = true;
      this.table_.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.settings_ && this.settings_.bottomBorder;
};


/**
 * Getter and setter for cell columns span. Cells that are overlapped by cells with colSpan != 1 are not drawn.
 * @param {number=} opt_value
 * @return {number|!anychart.elements.Table.Cell}
 */
anychart.elements.Table.Cell.prototype.colSpan = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.normalizeToNaturalNumber(opt_value, this.colSpan_);
    if (opt_value != this.colSpan_) {
      this.colSpan_ = opt_value;
      this.table_.shouldDropOverlap = true;
      this.table_.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.colSpan_;
};


/**
 * Getter and setter for cell rows span. Cells that are overlapped by cells with rowSpan != 1 are not drawn.
 * @param {number=} opt_value
 * @return {number|!anychart.elements.Table.Cell}
 */
anychart.elements.Table.Cell.prototype.rowSpan = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.normalizeToNaturalNumber(opt_value, this.rowSpan_);
    if (opt_value != this.rowSpan_) {
      this.rowSpan_ = opt_value;
      this.table_.shouldDropOverlap = true;
      this.table_.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.rowSpan_;
};


/**
 * Getter and setter for table cell override of cell padding.
 *
 * @param {(string|number|Object|anychart.utils.Space)=} opt_spaceOrTopOrTopAndBottom .
 * @param {(string|number)=} opt_rightOrRightAndLeft .
 * @param {(string|number)=} opt_bottom .
 * @param {(string|number)=} opt_left .
 * @return {anychart.elements.Table.Cell|anychart.utils.Padding} .
 */
anychart.elements.Table.Cell.prototype.padding = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  if (!this.settings_)
    this.settings_ = /** @type {anychart.elements.Table.Cell.SettingsObj} */({});

  var padding;
  if (this.settings_.padding) {
    padding = this.settings_.padding;
  } else {
    this.settings_.padding = padding = new anychart.utils.Padding();
    padding.listenSignals(this.paddingInvalidated_, this);
    this.registerDisposable(padding);
  }

  if (arguments.length > 0) {
    if (arguments.length > 1) {
      padding.set.apply(padding, arguments);
    } else if (opt_spaceOrTopOrTopAndBottom instanceof anychart.utils.Padding) {
      padding.deserialize(opt_spaceOrTopOrTopAndBottom.serialize());
    } else if (goog.isObject(opt_spaceOrTopOrTopAndBottom)) {
      padding.deserialize(opt_spaceOrTopOrTopAndBottom);
    } else {
      padding.set(opt_spaceOrTopOrTopAndBottom);
    }
    return this;
  }

  return padding;
};


/**
 * Internal padding invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.elements.Table.Cell.prototype.paddingInvalidated_ = function(event) {
  // whatever has changed in paddings affects chart size, so we need to redraw everything
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.table_.shouldRedrawContent = true;
    this.table_.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Return cell override of the padding.
 * @return {anychart.utils.Padding|undefined}
 */
anychart.elements.Table.Cell.prototype.getPaddingOverride = function() {
  return this.settings_ && this.settings_.padding;
};


/** @inheritDoc */
anychart.elements.Table.Cell.prototype.disposeInternal = function() {
  if (this.disposableContent_)
    this.content_.dispose();
  goog.base(this, 'disposeInternal');
};


goog.exportSymbol('anychart.elements.Table', anychart.elements.Table);
anychart.elements.Table.prototype['rowsCount'] = anychart.elements.Table.prototype.rowsCount;
anychart.elements.Table.prototype['colsCount'] = anychart.elements.Table.prototype.colsCount;
anychart.elements.Table.prototype['getCell'] = anychart.elements.Table.prototype.getCell;
anychart.elements.Table.prototype['draw'] = anychart.elements.Table.prototype.draw;
anychart.elements.Table.prototype['colWidth'] = anychart.elements.Table.prototype.colWidth;
anychart.elements.Table.prototype['rowHeight'] = anychart.elements.Table.prototype.rowHeight;
anychart.elements.Table.prototype['cellTextFactory'] = anychart.elements.Table.prototype.cellTextFactory;
anychart.elements.Table.prototype['cellFill'] = anychart.elements.Table.prototype.cellFill;
anychart.elements.Table.prototype['cellPadding'] = anychart.elements.Table.prototype.cellPadding;
anychart.elements.Table.prototype['cellEvenFill'] = anychart.elements.Table.prototype.cellEvenFill;
anychart.elements.Table.prototype['cellOddFill'] = anychart.elements.Table.prototype.cellOddFill;
anychart.elements.Table.prototype['cellBorder'] = anychart.elements.Table.prototype.cellBorder;
anychart.elements.Table.prototype['cellLeftBorder'] = anychart.elements.Table.prototype.cellLeftBorder;
anychart.elements.Table.prototype['cellRightBorder'] = anychart.elements.Table.prototype.cellRightBorder;
anychart.elements.Table.prototype['cellTopBorder'] = anychart.elements.Table.prototype.cellTopBorder;
anychart.elements.Table.prototype['cellBottomBorder'] = anychart.elements.Table.prototype.cellBottomBorder;
anychart.elements.Table.Cell.prototype['rowSpan'] = anychart.elements.Table.Cell.prototype.rowSpan;
anychart.elements.Table.Cell.prototype['colSpan'] = anychart.elements.Table.Cell.prototype.colSpan;
anychart.elements.Table.Cell.prototype['content'] = anychart.elements.Table.Cell.prototype.content;
anychart.elements.Table.Cell.prototype['padding'] = anychart.elements.Table.Cell.prototype.padding;
anychart.elements.Table.Cell.prototype['fill'] = anychart.elements.Table.Cell.prototype.fill;
anychart.elements.Table.Cell.prototype['border'] = anychart.elements.Table.Cell.prototype.border;
anychart.elements.Table.Cell.prototype['leftBorder'] = anychart.elements.Table.Cell.prototype.leftBorder;
anychart.elements.Table.Cell.prototype['rightBorder'] = anychart.elements.Table.Cell.prototype.rightBorder;
anychart.elements.Table.Cell.prototype['topBorder'] = anychart.elements.Table.Cell.prototype.topBorder;
anychart.elements.Table.Cell.prototype['bottomBorder'] = anychart.elements.Table.Cell.prototype.bottomBorder;
anychart.elements.Table.Cell.prototype['getRow'] = anychart.elements.Table.Cell.prototype.getRow;
anychart.elements.Table.Cell.prototype['getCol'] = anychart.elements.Table.Cell.prototype.getCol;
anychart.elements.Table.Cell.prototype['getBounds'] = anychart.elements.Table.Cell.prototype.getBounds;
