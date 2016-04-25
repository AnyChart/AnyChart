goog.provide('anychart.core.drawers.RangeArea');
goog.require('anychart.core.drawers');
goog.require('anychart.core.drawers.Base');
goog.require('anychart.enums');
goog.require('anychart.opt');



/**
 * RangeArea drawer.
 * @param {anychart.core.series.Base} series
 * @constructor
 * @extends {anychart.core.drawers.Base}
 */
anychart.core.drawers.RangeArea = function(series) {
  anychart.core.drawers.RangeArea.base(this, 'constructor', series);
};
goog.inherits(anychart.core.drawers.RangeArea, anychart.core.drawers.Base);
anychart.core.drawers.AvailableDrawers[anychart.enums.SeriesDrawerTypes.RANGE_AREA] = anychart.core.drawers.RangeArea;


/** @inheritDoc */
anychart.core.drawers.RangeArea.prototype.type = anychart.enums.SeriesDrawerTypes.RANGE_AREA;


/** @inheritDoc */
anychart.core.drawers.RangeArea.prototype.flags = (
    // anychart.core.drawers.Capabilities.NEEDS_ZERO |
    // anychart.core.drawers.Capabilities.NEEDS_SIZE_SCALE |
    // anychart.core.drawers.Capabilities.USES_CONTAINER_AS_ROOT |
    // anychart.core.drawers.Capabilities.USES_STROKE_AS_FILL |
    anychart.core.drawers.Capabilities.SUPPORTS_CONNECTING_MISSING |
    // anychart.core.drawers.Capabilities.SUPPORTS_STACK |
    // anychart.core.drawers.Capabilities.SUPPORTS_ERROR |
    // anychart.core.drawers.Capabilities.SUPPORTS_OUTLIERS |
    // anychart.core.drawers.Capabilities.IS_DISCRETE_BASED |
    // anychart.core.drawers.Capabilities.IS_WIDTH_BASED |
    // anychart.core.drawers.Capabilities.IS_3D_BASED |
    // anychart.core.drawers.Capabilities.IS_BAR_BASED |
    // anychart.core.drawers.Capabilities.IS_MARKER_BASED |
    // anychart.core.drawers.Capabilities.IS_OHLC_BASED |
    // anychart.core.drawers.Capabilities.IS_LINE_BASED |
    anychart.core.drawers.Capabilities.IS_RANGE_BASED |
    0);


/** @inheritDoc */
anychart.core.drawers.RangeArea.prototype.yValueNames = ([anychart.opt.HIGH, anychart.opt.LOW]);


/** @inheritDoc */
anychart.core.drawers.RangeArea.prototype.drawFirstPoint = function(point, state) {
  var shapes = this.shapesManager.getShapesGroup(this.seriesState);
  var x = /** @type {number} */(point.meta(anychart.opt.X));
  var high = /** @type {number} */(point.meta(anychart.opt.HIGH));
  var low = /** @type {number} */(point.meta(anychart.opt.LOW));

  shapes[anychart.opt.FILL]
      .moveTo(x, low)
      .lineTo(x, high);
  shapes[anychart.opt.HATCH_FILL]
      .moveTo(x, low)
      .lineTo(x, high);
  shapes[anychart.opt.HIGH]
      .moveTo(x, high);

  /**
   * @type {Array.<number>}
   */
  this.lowsStack = [x, low];
};


/** @inheritDoc */
anychart.core.drawers.RangeArea.prototype.drawSubsequentPoint = function(point, state) {
  var shapes = this.shapesManager.getShapesGroup(this.seriesState);
  var x = /** @type {number} */(point.meta(anychart.opt.X));
  var high = /** @type {number} */(point.meta(anychart.opt.HIGH));
  var low = /** @type {number} */(point.meta(anychart.opt.LOW));

  shapes[anychart.opt.FILL].lineTo(x, high);
  shapes[anychart.opt.HATCH_FILL].lineTo(x, high);
  shapes[anychart.opt.HIGH].lineTo(x, high);

  this.lowsStack.push(x, low);
};


/** @inheritDoc */
anychart.core.drawers.RangeArea.prototype.finalizeSegment = function() {
  if (!this.prevPointDrawn) return;
  if (this.lowsStack) {
    var shapes = this.shapesManager.getShapesGroup(this.seriesState);
    var first = true;
    for (var i = this.lowsStack.length - 1; i >= 0; i -= 2) {
      var x = this.lowsStack[i - 1];
      var y = this.lowsStack[i];
      shapes[anychart.opt.FILL].lineTo(x, y);
      shapes[anychart.opt.HATCH_FILL].lineTo(x, y);
      if (first) {
        shapes[anychart.opt.LOW].moveTo(x, y);
        first = false;
      } else {
        shapes[anychart.opt.LOW].lineTo(x, y);
      }
    }
    shapes[anychart.opt.FILL].close();
    shapes[anychart.opt.HATCH_FILL].close();
    this.lowsStack = null;
  }
};
