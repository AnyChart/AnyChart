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
  anychart.core.ui.table.Column.base(this, 'constructor', table);
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
 * Getter/setter for width.
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
 * Getter/setter for cellFill.
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
 * Getter/setter for cellBorder.
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
 * Getter/setter for cellPadding.
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
(function() {
  var proto = anychart.core.ui.table.Column.prototype;
  proto['width'] = proto.width;
  proto['maxWidth'] = proto.maxWidth;
  proto['minWidth'] = proto.minWidth;
  proto['getCell'] = proto.getCell;
  proto['getColNum'] = proto.getColNum;
  proto['cellFill'] = proto.cellFill;
  proto['cellBorder'] = proto.cellBorder;
  proto['cellPadding'] = proto.cellPadding;
})();
