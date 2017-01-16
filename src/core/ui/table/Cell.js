goog.provide('anychart.core.ui.table.Cell');
goog.require('acgraph');
goog.require('anychart.core.ui.table.Base');
goog.require('anychart.utils');



/**
 * Table cell.
 * @param {!anychart.core.ui.Table} table
 * @param {number} row
 * @param {number} col
 * @constructor
 * @includeDoc
 * @extends {anychart.core.ui.table.Base}
 */
anychart.core.ui.table.Cell = function(table, row, col) {
  anychart.core.ui.table.Cell.base(this, 'constructor', table);

  this.reset(row, col);
};
goog.inherits(anychart.core.ui.table.Cell, anychart.core.ui.table.Base);


/**
 * Resets Cell settings and row/col position.
 * @param {number} row
 * @param {number} col
 * @return {anychart.core.ui.table.Cell}
 */
anychart.core.ui.table.Cell.prototype.reset = function(row, col) {
  if (goog.isNumber(this.content_) || goog.isString(this.content_))
    goog.dispose(this.realContent);
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
  /**
   * Content.
   * @type {anychart.core.VisualBase|string|number}
   * @private
   */
  this.content_ = null;
  /**
   * Real content (strings and numbers are LabelsFactory.Labels here).
   * @type {anychart.core.VisualBase}
   */
  this.realContent = null;
  /**
   * Flag used by the table. If not NaN - the cell is overlapped by other cell and shouldn't be drawn.
   * @type {number}
   */
  this.overlapper = NaN;

  delete this.settingsObj;

  return this;
};


/**
 * Getter/setter for content.
 * @param {(anychart.core.VisualBase|string|number)=} opt_value
 * @return {anychart.core.VisualBase|anychart.core.ui.table.Cell|string|number}
 */
anychart.core.ui.table.Cell.prototype.content = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.content_ != opt_value) {
      this.content_ = opt_value;
      if (this.realContent)
        this.table.clearContent(this.realContent);
      if ((goog.isNumber(opt_value) || goog.isString(opt_value)))
        this.realContent = this.table.createTextCellContent(opt_value);
      else
        this.realContent = opt_value;
      this.table.invalidate(anychart.ConsistencyState.TABLE_CONTENT, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.content_;
};


/**
 * Getter/setter for colSpan.
 * Getter and setter for cell rows span.
 * @param {number=} opt_value
 * @return {!anychart.core.ui.table.Cell|number}
 */
anychart.core.ui.table.Cell.prototype.colSpan = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.normalizeToNaturalNumber(opt_value, this.colSpan_);
    if (opt_value != this.colSpan_) {
      this.colSpan_ = opt_value;
      this.table.invalidate(anychart.ConsistencyState.TABLE_OVERLAP, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.colSpan_;
};


/**
 * Getter/setter for rowSpan.
 * Getter and setter for cell rows span.
 * @param {number=} opt_value
 * @return {!anychart.core.ui.table.Cell|number}
 */
anychart.core.ui.table.Cell.prototype.rowSpan = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.normalizeToNaturalNumber(opt_value, this.rowSpan_);
    if (opt_value != this.rowSpan_) {
      this.rowSpan_ = opt_value;
      this.table.invalidate(anychart.ConsistencyState.TABLE_OVERLAP, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.rowSpan_;
};


/**
 * Returns current cell row number.
 * @return {number}
 */
anychart.core.ui.table.Cell.prototype.getRowNum = function() {
  return this.row_;
};


/**
 * Returns current cell column number.
 * @return {number}
 */
anychart.core.ui.table.Cell.prototype.getColNum = function() {
  return this.col_;
};


/**
 * Returns current cell row instance.
 * @return {anychart.core.ui.table.Row}
 */
anychart.core.ui.table.Cell.prototype.getRow = function() {
  return this.table.getRow(this.row_);
};


/**
 * Returns current cell column instance.
 * @return {anychart.core.ui.table.Column}
 */
anychart.core.ui.table.Cell.prototype.getCol = function() {
  return this.table.getCol(this.col_);
};


/**
 * Returns cell bounds without padding counted (bounds which are used for borders drawing).
 * @example <t>simple-h100</t>
 * var table = anychart.ui.table();
 * table.contents([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
 * table.container(stage).draw();
 * stage.rect().fill('red 0.2').setBounds(
 *     table.getCell(1,1).getBounds()
 *   );
 * @return {!anychart.math.Rect}
 */
anychart.core.ui.table.Cell.prototype.getBounds = function() {
  return this.table.getCellBounds(this.row_, this.col_, this.rowSpan_, this.colSpan_);
};


/**
 * Getter/setter for fill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|Function|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.ui.table.Base} .
 */
anychart.core.ui.table.Cell.prototype.fill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDefAndNotNull(opt_fillOrColorOrKeys)) // we want to keep null first param as null, not as 'none'
    opt_fillOrColorOrKeys = acgraph.vector.normalizeFill.apply(null, arguments);
  return /** @type {acgraph.vector.Fill|anychart.core.ui.table.Base} */(this.settings('fill',
      /** @type {acgraph.vector.Fill|null|undefined} */(opt_fillOrColorOrKeys), anychart.ConsistencyState.TABLE_FILLS));
};


/**
 * Getter/setter for padding.
 * @param {(null|string|number|Array.<number|string>|{top:(number|string),left:(number|string),bottom:(number|string),right:(number|string)})=} opt_spaceOrTopOrTopAndBottom .
 * @param {(string|number)=} opt_rightOrRightAndLeft .
 * @param {(string|number)=} opt_bottom .
 * @param {(string|number)=} opt_left .
 * @return {!anychart.core.ui.table.Base|anychart.core.ui.table.Padding} .
 */
anychart.core.ui.table.Cell.prototype.padding = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  return this.paddingInternal.apply(this, arguments);
};


/** @inheritDoc */
anychart.core.ui.table.Cell.prototype.disposeInternal = function() {
  if (goog.isNumber(this.content_) || goog.isString(this.content_))
    goog.dispose(this.realContent);
  anychart.core.ui.table.Cell.base(this, 'disposeInternal');
};


//exports
(function() {
  var proto = anychart.core.ui.table.Cell.prototype;
  proto['content'] = proto.content;//doc|ex|need-tr
  proto['rowSpan'] = proto.rowSpan;//doc|ex
  proto['colSpan'] = proto.colSpan;//doc|ex
  proto['padding'] = proto.padding;//doc|ex
  proto['getBounds'] = proto.getBounds;//doc|ex
  proto['getRowNum'] = proto.getRowNum;//doc
  proto['getColNum'] = proto.getColNum;//doc
  proto['getRow'] = proto.getRow;
  proto['getCol'] = proto.getCol;
  proto['fill'] = proto.fill;
})();
