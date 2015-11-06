goog.provide('anychart.core.ui.table.Column');
goog.require('acgraph');
goog.require('anychart.core.ui.table.Base');
goog.require('anychart.core.ui.table.Border');



/**
 * Table column settings container.
 * @param {!anychart.core.ui.Table} table
 * @param {number} columnIndex
 * @constructor
 * @extends {anychart.core.ui.table.Base}
 */
anychart.core.ui.table.Column = function(table, columnIndex) {
  goog.base(this, table);
  /**
   * Column index.
   * @type {number}
   * @private
   */
  this.index_ = columnIndex;

  /**
   * Cell borders proxy object.
   * @type {anychart.core.ui.table.Border}
   * @private
   */
  this.cellBordersProxy_ = null;
};
goog.inherits(anychart.core.ui.table.Column, anychart.core.ui.table.Base);


/**
 * Returns column index.
 * @return {number}
 */
anychart.core.ui.table.Column.prototype.getColNum = function() {
  return this.index_;
};


/**
 * Returns cell of current column by row index.
 * @param {number} row
 * @return {anychart.core.ui.table.Cell}
 */
anychart.core.ui.table.Column.prototype.getCell = function(row) {
  return this.table.getCell(row, this.index_);
};


/**
 * Getter for column width settings.
 * @param {number} col Column number.
 * @return {string|number|null} Current column width.
 *//**
 * Setter for column width settings. <br/>
 * <b>Note:</b> Pass <b>null</b> to set the default value.
 * @example <t>simple-h100</t>
 * var table = anychart.ui.table();
 * table.contents([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11]]);
 * table.getCol(0).width(200);
 * table.container(stage).draw();
 * @param {(string|number|null)=} opt_value Value to set.
 * @return {anychart.core.ui.table.Column} {@link anychart.core.ui.table.Column} instance for method chaining.
 *//**
 * @ignoreDoc
 * Getter and setter for column height settings. Null sets column width to default value.
 * @param {(string|number|null)=} opt_value Value to set.
 * @return {string|number|null|anychart.core.ui.table.Column}
 */
anychart.core.ui.table.Column.prototype.width = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.table.colWidth(this.index_, opt_value);
    return this;
  }
  return /** @type {number|string|null} */(this.table.colWidth(this.index_));
};


/**
 * Getter and setter for column min width settings. Null sets column width to the default value.
 * @param {(string|number|null)=} opt_value Value to set.
 * @return {string|number|null|anychart.core.ui.table.Column}
 */
anychart.core.ui.table.Column.prototype.minWidth = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.table.colMinWidth(this.index_, opt_value);
    return this;
  }
  return /** @type {number} */(this.table.colMinWidth(this.index_));
};


/**
 * Getter and setter for column max width settings. Null sets column width to the default value.
 * @param {(string|number|null)=} opt_value Value to set.
 * @return {string|number|null|anychart.core.ui.table.Column}
 */
anychart.core.ui.table.Column.prototype.maxWidth = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.table.colMaxWidth(this.index_, opt_value);
    return this;
  }
  return /** @type {number|string|null} */(this.table.colMaxWidth(this.index_));
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
anychart.core.ui.table.Column.prototype.cellFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDefAndNotNull(opt_fillOrColorOrKeys)) // we want to keep null first param as null, not as 'none'
    opt_fillOrColorOrKeys = acgraph.vector.normalizeFill.apply(null, arguments);
  return /** @type {acgraph.vector.Fill|anychart.core.ui.table.Base} */(this.settings('fill',
      /** @type {acgraph.vector.Fill|null|undefined} */(opt_fillOrColorOrKeys), anychart.ConsistencyState.TABLE_FILLS));
};


/**
 * Getter for border settings object.
 * @return {!anychart.core.ui.table.Border} Current bor settings.
 *//**
 * Setter for cell border settings.<br/>
 * Learn more about stroke settings:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Stroke}<br/>
 * <b>Note:</b> Pass <b>null</b> to reset to default settings.<br/>
 * <b>Note:</b> <u>lineJoin</u> settings not working here.
 * @shortDescription Setter for cell border settings.
 * @example <t>simple-h100</t>
 * var table = anychart.ui.table();
 * table.contents([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
 * table.getCell(1,1).border('orange', 3, '5 2', 'round');
 * table.container(stage).draw();
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line join style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {!anychart.core.ui.table.Base} {@link anychart.core.ui.table.Base} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line join style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.core.ui.table.Base|anychart.core.ui.table.Border} .
 */
anychart.core.ui.table.Column.prototype.cellBorder = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    if (!goog.isNull(opt_strokeOrFill))
      opt_strokeOrFill = acgraph.vector.normalizeStroke.apply(null, arguments);
    this.table.suspendSignalsDispatching();
    this.settings('cellBorder',
        /** @type {acgraph.vector.Stroke|null|undefined} */(opt_strokeOrFill), anychart.ConsistencyState.TABLE_BORDERS);
    // we remove specific border settings to make common border settings work
    for (var i = 0; i < 4; i++)
      this.settings(anychart.core.ui.table.Border.cellPropNames[i], null, anychart.ConsistencyState.TABLE_BORDERS);
    this.table.resumeSignalsDispatching(true);
    return this;
  }
  return this.cellBordersProxy_ || (this.cellBordersProxy_ = new anychart.core.ui.table.Border(this, true));
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
anychart.core.ui.table.Column.prototype.cellPadding = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  return this.paddingInternal.apply(this, arguments);
};


//exports
anychart.core.ui.table.Column.prototype['width'] = anychart.core.ui.table.Column.prototype.width;
anychart.core.ui.table.Column.prototype['maxWidth'] = anychart.core.ui.table.Column.prototype.maxWidth;
anychart.core.ui.table.Column.prototype['minWidth'] = anychart.core.ui.table.Column.prototype.minWidth;
anychart.core.ui.table.Column.prototype['getCell'] = anychart.core.ui.table.Column.prototype.getCell;
anychart.core.ui.table.Column.prototype['getColNum'] = anychart.core.ui.table.Column.prototype.getColNum;
anychart.core.ui.table.Column.prototype['cellFill'] = anychart.core.ui.table.Column.prototype.cellFill;
anychart.core.ui.table.Column.prototype['cellBorder'] = anychart.core.ui.table.Column.prototype.cellBorder;
anychart.core.ui.table.Column.prototype['cellPadding'] = anychart.core.ui.table.Column.prototype.cellPadding;
