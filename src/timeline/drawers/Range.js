goog.provide('anychart.timelineModule.drawers.Range');


//region -- Requirements.
goog.require('anychart.core.drawers');
goog.require('anychart.core.drawers.Base');



//endregion
//region -- Constructor.
/**
 * Timeline series Range drawer.
 * @param {anychart.core.series.Base} series
 * @constructor
 * @extends {anychart.core.drawers.Base}
 */
anychart.timelineModule.drawers.Range = function(series) {
  anychart.timelineModule.drawers.Range.base(this, 'constructor', series);
};
goog.inherits(anychart.timelineModule.drawers.Range, anychart.core.drawers.Base);
anychart.core.drawers.AvailableDrawers[anychart.enums.SeriesDrawerTypes.RANGE] = anychart.timelineModule.drawers.Range;


//endregion
/** @inheritDoc */
anychart.timelineModule.drawers.Range.prototype.type = anychart.enums.SeriesDrawerTypes.RANGE;


/** @inheritDoc */
anychart.timelineModule.drawers.Range.prototype.flags = (
    anychart.core.drawers.Capabilities.NEEDS_ZERO |
    // anychart.core.drawers.Capabilities.NEEDS_SIZE_SCALE |
    // anychart.core.drawers.Capabilities.USES_CONTAINER_AS_ROOT |
    // anychart.core.drawers.Capabilities.USES_STROKE_AS_FILL |
    // anychart.core.drawers.Capabilities.SUPPORTS_CONNECTING_MISSING |
    // anychart.core.drawers.Capabilities.SUPPORTS_STACK |
    // anychart.core.drawers.Capabilities.SUPPORTS_COMPARISON |
    // anychart.core.drawers.Capabilities.SUPPORTS_ERROR |
    // anychart.core.drawers.Capabilities.SUPPORTS_OUTLIERS |
    anychart.core.drawers.Capabilities.IS_DISCRETE_BASED |
    anychart.core.drawers.Capabilities.IS_WIDTH_BASED |
    // anychart.core.drawers.Capabilities.IS_3D_BASED |
    // anychart.core.drawers.Capabilities.IS_VERTICAL |
    // anychart.core.drawers.Capabilities.IS_MARKER_BASED |
    // anychart.core.drawers.Capabilities.IS_OHLC_BASED |
    // anychart.core.drawers.Capabilities.IS_LINE_BASED |
    // anychart.core.drawers.Capabilities.IS_RANGE_BASED |
    // anychart.core.drawers.Capabilities.SUPPORTS_STEP_DIRECTION |
    // anychart.core.drawers.Capabilities.SUPPORTS_DISTRIBUTION |
    0);


/** @inheritDoc */
anychart.timelineModule.drawers.Range.prototype.drawSubsequentPoint = function(point, state) {
  var shapesManager = this.shapesManager;
  var value = point.get(this.series.getYValueNames()[0]);

  var names = this.getShapeNames(value, this.prevValue);

  var shapeNames = {};
  shapeNames[names.path] = true;
  point.meta('names', names);
  var shapes = /** @type {Object.<acgraph.vector.Path>} */(shapesManager.getShapesGroup(state, shapeNames));

  this.drawPointShape(point, shapes[names.path]);
};


/**
 * Draws point.
 * @param {anychart.data.IRowInfo} point
 * @param {acgraph.vector.Path} path
 */
anychart.timelineModule.drawers.Range.prototype.drawPointShape = function(point, path) {
  var startX = /** @type {number} */(point.meta('startX'));
  var endX = /** @type {number} */(point.meta('endX'));
  var zero = /** @type {number} */(point.meta('zero'));
  var axisHeight = /** @type {number} */(point.meta('axisHeight'));
  var stackLevel = /** @type {number} */(point.meta('stackLevel'));
  var direction = /** @type {anychart.enums.Direction} */(point.get('direction') || point.meta('direction'));

  var startY = /** @type {number} */(point.meta('startY'));
  var endY = /** @type {number} */(point.meta('endY'));

  if (!goog.isDef(stackLevel)) {
    stackLevel = 1;
  }

  // upper line is bottom line if direction is down
  var pointZero, pointUpperLine;
  if (direction == anychart.enums.Direction.UP) {
    zero -= axisHeight / 2;
    pointZero = zero - startY;
    pointUpperLine = pointZero - endY;
  } else {
    zero += axisHeight / 2;
    pointZero = zero + startY;
    pointUpperLine = pointZero + endY;
  }

  var thickness = anychart.utils.extractThickness(/** @type {acgraph.vector.Stroke} */(path.stroke()));
  startX = anychart.utils.applyPixelShift(startX, thickness);
  endX = anychart.utils.applyPixelShift(endX, thickness);

  path.moveTo(startX, zero).lineTo(startX, pointUpperLine).lineTo(endX, pointUpperLine).lineTo(endX, zero).close();
};
