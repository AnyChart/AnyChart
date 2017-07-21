goog.provide('anychart.tableModule.elements.Border');
goog.require('acgraph');



/**
 * Border settings proxy. Doesn't store anything - just passes settings to and from the parent object.
 * @param {anychart.tableModule.elements.IProxyUser} parent Object to pass settings to.
 * @param {boolean} useCellSettings If this border should use 'cell*' properties rather than .
 * @constructor
 */
anychart.tableModule.elements.Border = function(parent, useCellSettings) {
  /**
   * @type {anychart.tableModule.elements.IProxyUser}
   * @private
   */
  this.parent_ = parent;
  /**
   * @type {!Array.<string>}
   * @private
   */
  this.names_ = useCellSettings ? anychart.tableModule.elements.Border.cellPropNames : anychart.tableModule.elements.Border.propNames;
};


/**
 * Property names for border settings.
 * @type {!Array.<string>}
 */
anychart.tableModule.elements.Border.propNames = ['topBorder', 'rightBorder', 'bottomBorder', 'leftBorder'];


/**
 * Property names for cell border settings.
 * @type {!Array.<string>}
 */
anychart.tableModule.elements.Border.cellPropNames = ['cellTopBorder', 'cellRightBorder', 'cellBottomBorder', 'cellLeftBorder'];


/**
 * Getter/setter for top.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line join style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.tableModule.elements.Border|acgraph.vector.Stroke|undefined} .
 */
anychart.tableModule.elements.Border.prototype.top = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDefAndNotNull(opt_strokeOrFill)) // we want to keep null first param as null, not as 'none'
    opt_strokeOrFill = acgraph.vector.normalizeStroke.apply(null, arguments);
  return /** @type {anychart.tableModule.elements.Border|acgraph.vector.Stroke|undefined} */(this.parent_.settings(
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
 * @return {anychart.tableModule.elements.Border|acgraph.vector.Stroke|undefined} .
 */
anychart.tableModule.elements.Border.prototype.right = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDefAndNotNull(opt_strokeOrFill)) // we want to keep null first param as null, not as 'none'
    opt_strokeOrFill = acgraph.vector.normalizeStroke.apply(null, arguments);
  return /** @type {anychart.tableModule.elements.Border|acgraph.vector.Stroke|undefined} */(this.parent_.settings(
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
 * @return {anychart.tableModule.elements.Border|acgraph.vector.Stroke|undefined} .
 */
anychart.tableModule.elements.Border.prototype.bottom = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDefAndNotNull(opt_strokeOrFill)) // we want to keep null first param as null, not as 'none'
    opt_strokeOrFill = acgraph.vector.normalizeStroke.apply(null, arguments);
  return /** @type {anychart.tableModule.elements.Border|acgraph.vector.Stroke|undefined} */(this.parent_.settings(
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
 * @return {anychart.tableModule.elements.Border|acgraph.vector.Stroke|undefined} .
 */
anychart.tableModule.elements.Border.prototype.left = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDefAndNotNull(opt_strokeOrFill)) // we want to keep null first param as null, not as 'none'
    opt_strokeOrFill = acgraph.vector.normalizeStroke.apply(null, arguments);
  return /** @type {anychart.tableModule.elements.Border|acgraph.vector.Stroke|undefined} */(this.parent_.settings(
      this.names_[3], opt_strokeOrFill, anychart.ConsistencyState.TABLE_BORDERS));
};


//exports
(function() {
  var proto = anychart.tableModule.elements.Border.prototype;
  proto['top'] = proto.top;
  proto['right'] = proto.right;
  proto['bottom'] = proto.bottom;
  proto['left'] = proto.left;
})();
