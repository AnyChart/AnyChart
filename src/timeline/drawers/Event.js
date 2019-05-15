goog.provide('anychart.timelineModule.drawers.Event');


//region -- Requirements.
goog.require('anychart.core.drawers');
goog.require('anychart.core.drawers.Base');



//endregion
//region -- Constructor.
/**
 * Timeline series Event drawer.
 * @param {anychart.core.series.Base} series
 * @constructor
 * @extends {anychart.core.drawers.Base}
 */
anychart.timelineModule.drawers.Event = function(series) {
  anychart.timelineModule.drawers.Event.base(this, 'constructor', series);
};
goog.inherits(anychart.timelineModule.drawers.Event, anychart.core.drawers.Base);
anychart.core.drawers.AvailableDrawers[anychart.enums.SeriesDrawerTypes.EVENT] = anychart.timelineModule.drawers.Event;


//endregion
/** @inheritDoc */
anychart.timelineModule.drawers.Event.prototype.type = anychart.enums.SeriesDrawerTypes.EVENT;


/** @inheritDoc */
anychart.timelineModule.drawers.Event.prototype.flags = (
    anychart.core.drawers.Capabilities.NEEDS_ZERO |
    // anychart.core.drawers.Capabilities.NEEDS_SIZE_SCALE |
    // anychart.core.drawers.Capabilities.USES_CONTAINER_AS_ROOT |
    anychart.core.drawers.Capabilities.USES_STROKE_AS_FILL |
    // anychart.core.drawers.Capabilities.SUPPORTS_CONNECTING_MISSING |
    // anychart.core.drawers.Capabilities.SUPPORTS_STACK |
    // anychart.core.drawers.Capabilities.SUPPORTS_COMPARISON |
    // anychart.core.drawers.Capabilities.SUPPORTS_ERROR |
    // anychart.core.drawers.Capabilities.SUPPORTS_OUTLIERS |
    anychart.core.drawers.Capabilities.IS_DISCRETE_BASED |
    // anychart.core.drawers.Capabilities.IS_WIDTH_BASED |
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
anychart.timelineModule.drawers.Event.prototype.drawSubsequentPoint = function(point, state) {
  var shapesManager = this.shapesManager;
  var value = point.get(this.series.getYValueNames()[0]);

  var names = this.getShapeNames(value, this.prevValue);

  var shapeNames = {};
  shapeNames[names.stroke] = true;
  point.meta('names', names);
  var shapes = /** @type {Object.<acgraph.vector.Path>} */(shapesManager.getShapesGroup(state, shapeNames));

  this.drawPointShape(point, shapes[names.stroke]);
};


/**
 * Draws point.
 * @param {anychart.data.IRowInfo} point
 * @param {acgraph.vector.Path} path
 */
anychart.timelineModule.drawers.Event.prototype.drawPointShape = function(point, path) {
  var x = /** @type {number} */(point.meta('x'));
  var zero = /** @type {number} */(point.meta('zero'));
  var minLength = /** @type {number} */(point.meta('minLength'));
  // var length = /** @type {number} */(point.meta('length'));
  var thickness = anychart.utils.extractThickness(/** @type {acgraph.vector.Stroke} */(path.stroke()));
  var axisHeight = /** @type {number} */(point.meta('axisHeight'));
  // false - direction is down, it can't be auto
  var directionUp = /** @type {anychart.enums.EventMarkerDirection} */(point.meta('direction')) == anychart.enums.EventMarkerDirection.UP;

  zero += directionUp ? -axisHeight / 2 : axisHeight / 2;

  x = anychart.utils.applyPixelShift(x, thickness);
  anychart.core.drawers.move(path, this.isVertical, x, zero);
  anychart.core.drawers.line(path, this.isVertical, x, directionUp ? zero - minLength : zero + minLength);
};
