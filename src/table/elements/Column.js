goog.provide('anychart.tableModule.elements.Column');
goog.require('acgraph');
goog.require('anychart.tableModule.elements.Base');
goog.require('anychart.tableModule.elements.Border');



/**
 * Table column settings container.
 * @param {!anychart.tableModule.Table} table
 * @param {number} columnIndex
 * @constructor
 * @extends {anychart.tableModule.elements.Base}
 */
anychart.tableModule.elements.Column = function(table, columnIndex) {
  anychart.tableModule.elements.Column.base(this, 'constructor', table);
  /**
   * Column index.
   * @type {number}
   * @private
   */
  this.index_ = columnIndex;

  /**
   * Cell borders proxy object.
   * @type {anychart.tableModule.elements.Border}
   * @private
   */
  this.cellBordersProxy_ = null;
};
goog.inherits(anychart.tableModule.elements.Column, anychart.tableModule.elements.Base);


/**
 * Returns column index.
 * @return {number}
 */
anychart.tableModule.elements.Column.prototype.getColNum = function() {
  return this.index_;
};


/**
 * Returns cell of current column by row index.
 * @param {number} row
 * @return {anychart.tableModule.elements.Cell}
 */
anychart.tableModule.elements.Column.prototype.getCell = function(row) {
  return this.table.getCell(row, this.index_);
};


/**
 * Getter/setter for width.
 * Getter and setter for column height settings. Null sets column width to default value.
 * @param {(string|number|null)=} opt_value Value to set.
 * @return {string|number|null|anychart.tableModule.elements.Column}
 */
anychart.tableModule.elements.Column.prototype.width = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.table.colWidth(this.index_, opt_value);
    return this;
  }
  return /** @type {number|string|null} */(this.table.colWidth(this.index_));
};


/**
 * Getter and setter for column min width settings. Null sets column width to the default value.
 * @param {(string|number|null)=} opt_value Value to set.
 * @return {string|number|null|anychart.tableModule.elements.Column}
 */
anychart.tableModule.elements.Column.prototype.minWidth = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.table.colMinWidth(this.index_, opt_value);
    return this;
  }
  return /** @type {number} */(this.table.colMinWidth(this.index_));
};


/**
 * Getter and setter for column max width settings. Null sets column width to the default value.
 * @param {(string|number|null)=} opt_value Value to set.
 * @return {string|number|null|anychart.tableModule.elements.Column}
 */
anychart.tableModule.elements.Column.prototype.maxWidth = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.table.colMaxWidth(this.index_, opt_value);
    return this;
  }
  return /** @type {number|string|null} */(this.table.colMaxWidth(this.index_));
};


/**
 * Getter/setter for cellFill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|Function|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.tableModule.elements.Base} .
 */
anychart.tableModule.elements.Column.prototype.cellFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDefAndNotNull(opt_fillOrColorOrKeys)) // we want to keep null first param as null, not as 'none'
    opt_fillOrColorOrKeys = acgraph.vector.normalizeFill.apply(null, arguments);
  return /** @type {acgraph.vector.Fill|anychart.tableModule.elements.Base} */(this.settings('fill',
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
 * @return {anychart.tableModule.elements.Base|anychart.tableModule.elements.Border} .
 */
anychart.tableModule.elements.Column.prototype.cellBorder = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    if (!goog.isNull(opt_strokeOrFill))
      opt_strokeOrFill = acgraph.vector.normalizeStroke.apply(null, arguments);
    this.table.suspendSignalsDispatching();
    this.settings('cellBorder',
        /** @type {acgraph.vector.Stroke|null|undefined} */(opt_strokeOrFill), anychart.ConsistencyState.TABLE_BORDERS);
    // we remove specific border settings to make common border settings work
    for (var i = 0; i < 4; i++)
      this.settings(anychart.tableModule.elements.Border.cellPropNames[i], null, anychart.ConsistencyState.TABLE_BORDERS);
    this.table.resumeSignalsDispatching(true);
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
 * @return {!anychart.tableModule.elements.Base|anychart.tableModule.elements.Padding} .
 */
anychart.tableModule.elements.Column.prototype.cellPadding = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  return this.paddingInternal.apply(this, arguments);
};


//exports
(function() {
  var proto = anychart.tableModule.elements.Column.prototype;
  proto['width'] = proto.width;
  proto['maxWidth'] = proto.maxWidth;
  proto['minWidth'] = proto.minWidth;
  proto['getCell'] = proto.getCell;
  proto['getColNum'] = proto.getColNum;
  proto['cellFill'] = proto.cellFill;
  proto['cellBorder'] = proto.cellBorder;
  proto['cellPadding'] = proto.cellPadding;
})();
