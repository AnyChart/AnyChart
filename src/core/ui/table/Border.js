goog.provide('anychart.core.ui.table.Border');
goog.require('acgraph');



/**
 * Border settings proxy. Doesn't store anything - just passes settings to and from the parent object.
 * @param {anychart.core.ui.table.IProxyUser} parent Object to pass settings to.
 * @param {boolean} useCellSettings If this border should use 'cell*' properties rather than .
 * @constructor
 */
anychart.core.ui.table.Border = function(parent, useCellSettings) {
  /**
   * @type {anychart.core.ui.table.IProxyUser}
   * @private
   */
  this.parent_ = parent;
  /**
   * @type {!Array.<string>}
   * @private
   */
  this.names_ = useCellSettings ? anychart.core.ui.table.Border.cellPropNames : anychart.core.ui.table.Border.propNames;
};


/**
 * Property names for border settings.
 * @type {!Array.<string>}
 */
anychart.core.ui.table.Border.propNames = ['topBorder', 'rightBorder', 'bottomBorder', 'leftBorder'];


/**
 * Property names for cell border settings.
 * @type {!Array.<string>}
 */
anychart.core.ui.table.Border.cellPropNames = ['cellTopBorder', 'cellRightBorder', 'cellBottomBorder', 'cellLeftBorder'];


/**
 * Getter/setter for top.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line join style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.core.ui.table.Border|acgraph.vector.Stroke|undefined} .
 */
anychart.core.ui.table.Border.prototype.top = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDefAndNotNull(opt_strokeOrFill)) // we want to keep null first param as null, not as 'none'
    opt_strokeOrFill = acgraph.vector.normalizeStroke.apply(null, arguments);
  return /** @type {anychart.core.ui.table.Border|acgraph.vector.Stroke|undefined} */(this.parent_.settings(
      this.names_[0], opt_strokeOrFill, anychart.ConsistencyState.TABLE_BORDERS));
};


/**
 * Getter/setter for right.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line join style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.core.ui.table.Border|acgraph.vector.Stroke|undefined} .
 */
anychart.core.ui.table.Border.prototype.right = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDefAndNotNull(opt_strokeOrFill)) // we want to keep null first param as null, not as 'none'
    opt_strokeOrFill = acgraph.vector.normalizeStroke.apply(null, arguments);
  return /** @type {anychart.core.ui.table.Border|acgraph.vector.Stroke|undefined} */(this.parent_.settings(
      this.names_[1], opt_strokeOrFill, anychart.ConsistencyState.TABLE_BORDERS));
};


/**
 * Getter/setter for bottom.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line join style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.core.ui.table.Border|acgraph.vector.Stroke|undefined} .
 */
anychart.core.ui.table.Border.prototype.bottom = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDefAndNotNull(opt_strokeOrFill)) // we want to keep null first param as null, not as 'none'
    opt_strokeOrFill = acgraph.vector.normalizeStroke.apply(null, arguments);
  return /** @type {anychart.core.ui.table.Border|acgraph.vector.Stroke|undefined} */(this.parent_.settings(
      this.names_[2], opt_strokeOrFill, anychart.ConsistencyState.TABLE_BORDERS));
};


/**
 * Getter/setter for left.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line join style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.core.ui.table.Border|acgraph.vector.Stroke|undefined} .
 */
anychart.core.ui.table.Border.prototype.left = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDefAndNotNull(opt_strokeOrFill)) // we want to keep null first param as null, not as 'none'
    opt_strokeOrFill = acgraph.vector.normalizeStroke.apply(null, arguments);
  return /** @type {anychart.core.ui.table.Border|acgraph.vector.Stroke|undefined} */(this.parent_.settings(
      this.names_[3], opt_strokeOrFill, anychart.ConsistencyState.TABLE_BORDERS));
};


//exports
(function() {
  var proto = anychart.core.ui.table.Border.prototype;
  proto['top'] = proto.top;
  proto['right'] = proto.right;
  proto['bottom'] = proto.bottom;
  proto['left'] = proto.left;
})();
