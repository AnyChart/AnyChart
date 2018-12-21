goog.provide('anychart.surfaceModule.AxisTicks');
goog.require('anychart.core.AxisTicks');



//region --- Constructor, signals, consistency states
/**
 * @constructor
 * @extends {anychart.core.AxisTicks}
 */
anychart.surfaceModule.AxisTicks = function() {
  anychart.surfaceModule.AxisTicks.base(this, 'constructor');

  /**
   * This point is start point of axis this ticks belong to.
   * @type {Array.<number>}
   * @private
   */
  this.startPoint_ = [];

  /**
   * This point is end point of axis this ticks belong to.
   * @type {Array.<number>}
   * @private
   */
  this.endPoint_ = [];
};
goog.inherits(anychart.surfaceModule.AxisTicks, anychart.core.AxisTicks);


/**
 * Supported signals.
 * @type {number}
 */
anychart.surfaceModule.AxisTicks.prototype.SUPPORTED_SIGNALS = anychart.core.AxisTicks.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.surfaceModule.AxisTicks.prototype.SUPPORTED_CONSISTENCY_STATES = anychart.core.AxisTicks.prototype.SUPPORTED_CONSISTENCY_STATES |
        anychart.ConsistencyState.APPEARANCE;
//endregion
//region --- Drawing


/** @inheritDoc */
anychart.surfaceModule.AxisTicks.prototype.drawLeftTick = function(ratio, bounds, lineBounds, lineThickness) {
  var length = /** @type {number} */(this.getOption('length'));
  var leftPoint = this.startPoint_.slice();
  var y1 = this.startPoint_[1];

  var y2 = this.endPoint_[1];
  var height = Math.abs(y1 - y2);
  var minY = Math.min(y1, y2);
  leftPoint[1] = (minY + height) - height * ratio;

  var stroke = /** @type {acgraph.vector.Stroke} */(this.getOption('stroke'));
  var thickness = anychart.utils.extractThickness(stroke);
  var x = leftPoint[0] - lineThickness / 2;
  x = anychart.utils.applyPixelShift(x, 1) + 0.5;
  var y = leftPoint[1];
  y = anychart.utils.applyPixelShift(y, thickness);

  this.path.moveTo(x, y);
  this.path.lineTo(x - length, y);
  this.path.stroke(stroke);
};


/** @inheritDoc */
anychart.surfaceModule.AxisTicks.prototype.drawBottomTick = function(ratio, bounds, lineBounds, lineThickness) {
  this.drawXYTick(ratio, lineThickness);
};


/** @inheritDoc */
anychart.surfaceModule.AxisTicks.prototype.drawRightTick = function(ratio, bounds, lineBounds, lineThickness) {
  this.drawXYTick(ratio, lineThickness);
};


/**
 * Drawer for surface axis ticks on x and y axes.
 * @param {number} ratio of tick position on axis.
 * @param {number} lineThickness thickness of axis line.
 */
anychart.surfaceModule.AxisTicks.prototype.drawXYTick = function(ratio, lineThickness) {
  var startPoint = this.startPoint_.slice();
  var endPoint = this.endPoint_.slice();

  var length = /** @type {number} */(this.getOption('length'));

  var stroke = /** @type {acgraph.vector.Stroke} */(this.getOption('stroke'));
  var thickness = anychart.utils.extractThickness(stroke);
  var x = (startPoint[0] * (1 - ratio) + ratio * endPoint[0]);
  var y = (startPoint[1] * (1 - ratio) + ratio * endPoint[1]) + lineThickness / 2;
  y = anychart.utils.applyPixelShift(y, 1) - 0.5;
  x = anychart.utils.applyPixelShift(x, thickness);
  this.path.moveTo(x, y);
  this.path.lineTo(x, y + length);
  this.path.stroke(stroke);
};
//endregion


/**
 * Getter/setter for start and end points.
 * Between this points axis ticks are drawn.
 * @param {Array.<number>=} opt_startPoint
 * @param {Array.<number>=} opt_endPoint
 * @return {Object|anychart.surfaceModule.AxisTicks} returns object with start and end point or this.
 */
anychart.surfaceModule.AxisTicks.prototype.startEndPoints = function(opt_startPoint, opt_endPoint) {
  if (goog.isDef(opt_startPoint) && goog.isDef(opt_endPoint)) {
    this.startPoint_ = opt_startPoint;
    this.endPoint_ = opt_endPoint;
    this.dispatchSignal(anychart.Signal.NEEDS_REDRAW);
    return this;
  }
  return {startPoint: this.startPoint_, endPoint: this.endPoint_};
};
