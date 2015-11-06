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
  goog.base(this, table);

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
 * Getter for cell content.
 * @return {anychart.core.VisualBase} Current cell content.
 *//**
 * Setter for cell content.
 * @example
 * var table = anychart.ui.table(3,2);
 * // resize first column
 * table.colWidth(0, 100);
 * // set content to cell as string
 * table.getCell(0,0)
 *   .content('text');
 * // set content to another cell as number
 * table.getCell(1,0)
 *   .content(2014);
 * // set content to another cell as chart
 * table.getCell(0,1)
 *   .content(anychart.line([1.1, 1.4, 1.2, 1.6]))
 *   .rowSpan(3);
 * table.container(stage).draw();
 * @param {(anychart.core.VisualBase|string|number)=} opt_value Value to set.<br/>
 *  <b>Note:</b> Numbers and strings are automaticaly set as instance of {@link anychart.core.ui.LabelsFactory.Label} class.
 * @return {anychart.core.ui.table.Cell} {@link anychart.core.ui.table.Cell} class for method chaining.
 *//**
 * @ignoreDoc
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
 * Getter for cell columns span.
 * @return {number} Current columns span.
 *//**
 * Setter for cell columns span.<br/>
 * <b>Note:</b> Cells that are overlapped by other cells are not drawn.
 * @example <t>simple-h100</t>
 * var table = anychart.ui.table();
 * table.contents([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]]);
 * var cell = table.getCell(1,1);
 * cell.colSpan(2);
 * table.container(stage).draw();
 * @param {number=} opt_value [1] Count of cells to merge right.
 * @return {!anychart.core.ui.table.Cell} {@link anychart.core.ui.table.Cell} instance for method chaining.
 *//**
 * @ignoreDoc
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
 * Getter for cell rows span.
 * @return {number} Current rows span.
 *//**
 * Setter for cell rows span.<br/>
 * <b>Note:</b> Cells that are overlapped by other cells are not drawn.
 * @example <t>simple-h100</t>
 * var table = anychart.ui.table();
 * table.contents([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]]);
 * var cell = table.getCell(1,1);
 * cell.rowSpan(2);
 * table.container(stage).draw();
 * @param {number=} opt_value [1] Count of cells to merge down.
 * @return {!anychart.core.ui.table.Cell} {@link anychart.core.ui.table.Cell} instance for method chaining.
 *//**
 * @ignoreDoc
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
 * Getter for current fill color override.
 * @return {!acgraph.vector.Fill} Current fill color.
 *//**
 * Sets fill settings using an object or a string.<br/>
 * Learn more about coloring at:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Fill}
 * @example <c>Solid fill</c><t>simple-h100</t>
 * var table = anychart.ui.table();
 * table.contents([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
 * table.getCell(1,1).fill('green 0.2');
 * table.container(stage).draw();
 * @example <c>Linear gradient fill</c><t>simple-h100</t>
 * var table = anychart.ui.table();
 * table.contents([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
 * table.getCell(1,1).fill(['green 0.2', 'yellow 0.2']);
 * table.container(stage).draw();
 * @param {acgraph.vector.Fill} value [null] Color as an object or a string.
 * @return {!anychart.core.ui.table.Base} {@link anychart.core.ui.table.Base} instance for method chaining.
 *//**
 * Fill color with opacity.<br/>
 * <b>Note:</b> If color is set as a string (e.g. 'red .5') it has a priority over opt_opacity, which
 * means: <b>color</b> set like this <b>rect.fill('red 0.3', 0.7)</b> will have 0.3 opacity.
 * @shortDescription Fill as a string or an object.
 * @example <t>simple-h100</t>
 * var table = anychart.ui.table();
 * table.contents([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
 * table.getCell(1,1).fill('green', 0.3);
 * table.container(stage).draw();
 * @param {string} color Color as a string.
 * @param {number=} opt_opacity Color opacity.
 * @return {!anychart.core.ui.table.Base} {@link anychart.core.ui.table.Base} instance for method chaining.
 *//**
 * Linear gradient fill.<br/>
 * Learn more about coloring at:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Fill}
 * @example <t>simple-h100</t>
 * var table = anychart.ui.table();
 * table.contents([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
 * table.getCell(1,1).fill(['black', 'yellow'], 45, true, 0.5);
 * table.container(stage).draw();
 * @param {!Array.<(acgraph.vector.GradientKey|string)>} keys Gradient keys.
 * @param {number=} opt_angle Gradient angle.
 * @param {(boolean|!acgraph.vector.Rect|!{left:number,top:number,width:number,height:number})=} opt_mode Gradient mode.
 * @param {number=} opt_opacity Gradient opacity.
 * @return {!anychart.core.ui.table.Base} {@link anychart.core.ui.table.Base} instance for method chaining.
 *//**
 * Radial gradient fill.<br/>
 * Learn more about coloring at:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Fill}
 * @example <t>simple-h100</t>
 * var table = anychart.ui.table();
 * table.contents([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
 * table.getCell(1,1).fill(['black', 'yellow'], .5, .5, null, .9, 0.3, 0.81);
 * table.container(stage).draw();
 * @param {!Array.<(acgraph.vector.GradientKey|string)>} keys Color-stop gradient keys.
 * @param {number} cx X ratio of center radial gradient.
 * @param {number} cy Y ratio of center radial gradient.
 * @param {anychart.math.Rect=} opt_mode If defined then userSpaceOnUse mode, else objectBoundingBox.
 * @param {number=} opt_opacity Opacity of the gradient.
 * @param {number=} opt_fx X ratio of focal point.
 * @param {number=} opt_fy Y ratio of focal point.
 * @return {!anychart.core.ui.table.Base} {@link anychart.core.ui.table.Base} instance for method chaining.
 *//**
 * Image fill.<br/>
 * Learn more about coloring at:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Fill}
 * @example <t>simple-h100</t>
 * var table = anychart.ui.table();
 * table.contents([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
 * table.getCell(1,1).fill({
 *    src: 'http://static.anychart.com/underwater.jpg',
 *    mode: acgraph.vector.ImageFillMode.STRETCH
 * });
 * table.container(stage).draw();
 * @param {!acgraph.vector.Fill} imageSettings Object with settings.
 * @return {!anychart.core.ui.table.Base} {@link anychart.core.ui.table.Base} instance for method chaining.
 *//**
 * @ignoreDoc
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
 * Getter for padding settings object.
 * @return {!anychart.core.ui.table.Padding} Padding settings object.
 *//**
 * Setter for current cell paddings in pixels using a single value.<br/>
 * @example <t>listingOnly</t>
 * // all paddings 15px
 * cell.padding(15);
 * // all paddings 15px
 * cell.padding('15px');
 * // top and bottom 5px ,right and left 15px
 * cell.padding(anychart.utils.space(5,15));
 * @example <t>simple-h100</t>
 * var table = anychart.ui.table();
 * table.contents([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]]);
 * table.cellTextFactory().background().enabled(true);
 * table.getCell(0,0).padding(0);
 * table.container(stage).draw();
 * @param {(null|Array.<number|string>|{top:(number|string),left:(number|string),bottom:(number|string),right:(number|string)})=} opt_value Value to set.
 * @return {!anychart.core.ui.table.Base} {@link anychart.core.ui.table.Base} instance for method chaining.
 *//**
 * Setter for current cell paddings in pixels using several numbers.<br/>
 * @example <t>listingOnly</t>
 * // 1) top and bottom 10px, left and right 15px
 * table.cellPadding(10, '15px');
 * // 2) top 10px, left and right 15px, bottom 5px
 * table.cellPadding(10, '15px', 5);
 * // 3) top 10px, right 15px, bottom 5px, left 12px
 * table.cellPadding(10, '15px', '5px', 12);
 * @example <t>simple-h100</t>
 * var table = anychart.ui.table();
 * table.contents([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]]);
 * table.cellTextFactory().background().enabled(true);
 * table.getCell(0,0).padding(-5, 0, 0, -15);
 * table.container(stage).draw();
 * @param {(string|number)=} opt_value1 Top or top-bottom space.
 * @param {(string|number)=} opt_value2 Right or right-left space.
 * @param {(string|number)=} opt_value3 Bottom space.
 * @param {(string|number)=} opt_value4 Left space.
 * @return {!anychart.core.ui.table.Base} {@link anychart.core.ui.table.Base} instance for method chaining.
 *//**
 * Cell padding settings.
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
  goog.base(this, 'disposeInternal');
};


//exports
anychart.core.ui.table.Cell.prototype['content'] = anychart.core.ui.table.Cell.prototype.content;//doc|ex|need-tr
anychart.core.ui.table.Cell.prototype['rowSpan'] = anychart.core.ui.table.Cell.prototype.rowSpan;//doc|ex
anychart.core.ui.table.Cell.prototype['colSpan'] = anychart.core.ui.table.Cell.prototype.colSpan;//doc|ex
anychart.core.ui.table.Cell.prototype['padding'] = anychart.core.ui.table.Cell.prototype.padding;//doc|ex
anychart.core.ui.table.Cell.prototype['getBounds'] = anychart.core.ui.table.Cell.prototype.getBounds;//doc|ex
anychart.core.ui.table.Cell.prototype['getRowNum'] = anychart.core.ui.table.Cell.prototype.getRowNum;//doc
anychart.core.ui.table.Cell.prototype['getColNum'] = anychart.core.ui.table.Cell.prototype.getColNum;//doc
anychart.core.ui.table.Cell.prototype['getRow'] = anychart.core.ui.table.Cell.prototype.getRow;
anychart.core.ui.table.Cell.prototype['getCol'] = anychart.core.ui.table.Cell.prototype.getCol;
anychart.core.ui.table.Cell.prototype['fill'] = anychart.core.ui.table.Cell.prototype.fill;
