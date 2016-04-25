goog.provide('anychart.core.drawers.Area');
goog.require('anychart.core.drawers');
goog.require('anychart.core.drawers.Base');
goog.require('anychart.enums');
goog.require('anychart.opt');



/**
 * Area drawer.
 * @param {anychart.core.series.Base} series
 * @constructor
 * @extends {anychart.core.drawers.Base}
 */
anychart.core.drawers.Area = function(series) {
  anychart.core.drawers.Area.base(this, 'constructor', series);
};
goog.inherits(anychart.core.drawers.Area, anychart.core.drawers.Base);
anychart.core.drawers.AvailableDrawers[anychart.enums.SeriesDrawerTypes.AREA] = anychart.core.drawers.Area;


/** @inheritDoc */
anychart.core.drawers.Area.prototype.type = anychart.enums.SeriesDrawerTypes.AREA;


/** @inheritDoc */
anychart.core.drawers.Area.prototype.flags = (
    anychart.core.drawers.Capabilities.NEEDS_ZERO |
    // anychart.core.drawers.Capabilities.NEEDS_SIZE_SCALE |
    // anychart.core.drawers.Capabilities.USES_CONTAINER_AS_ROOT |
    // anychart.core.drawers.Capabilities.USES_STROKE_AS_FILL |
    anychart.core.drawers.Capabilities.SUPPORTS_CONNECTING_MISSING |
    anychart.core.drawers.Capabilities.SUPPORTS_STACK |
    anychart.core.drawers.Capabilities.SUPPORTS_ERROR |
    // anychart.core.drawers.Capabilities.SUPPORTS_OUTLIERS |
    // anychart.core.drawers.Capabilities.SUPPORTS_OUTLIERS |
    // anychart.core.drawers.Capabilities.IS_DISCRETE_BASED |
    // anychart.core.drawers.Capabilities.IS_WIDTH_BASED |
    // anychart.core.drawers.Capabilities.IS_3D_BASED |
    // anychart.core.drawers.Capabilities.IS_BAR_BASED |
    // anychart.core.drawers.Capabilities.IS_MARKER_BASED |
    // anychart.core.drawers.Capabilities.IS_OHLC_BASED |
    // anychart.core.drawers.Capabilities.IS_LINE_BASED |
    // anychart.core.drawers.Capabilities.IS_RANGE_BASED |
    0);


/** @inheritDoc */
anychart.core.drawers.Area.prototype.drawFirstPoint = function(point, state) {
  var shapes = this.shapesManager.getShapesGroup(this.seriesState);
  var x = /** @type {number} */(point.meta(anychart.opt.X));
  var zero = /** @type {number} */(point.meta(anychart.opt.ZERO));
  var zeroMissing = /** @type {boolean} */(point.meta(anychart.opt.ZERO_MISSING));
  var y = /** @type {number} */(point.meta(anychart.opt.VALUE));

  shapes[anychart.opt.FILL]
      .moveTo(x, zero)
      .lineTo(x, y);
  shapes[anychart.opt.HATCH_FILL]
      .moveTo(x, zero)
      .lineTo(x, y);
  shapes[anychart.opt.STROKE]
      .moveTo(x, y);

  if (this.series.planIsStacked()) {
    /** @type {Array.<number|boolean>} */
    this.zeroesStack = [x, zero, zeroMissing];
  } else {
    /** @type {number} */
    this.lastDrawnX = x;
    /** @type {number} */
    this.zeroY = zero;
  }
};


/** @inheritDoc */
anychart.core.drawers.Area.prototype.drawSubsequentPoint = function(point, state) {
  var shapes = this.shapesManager.getShapesGroup(this.seriesState);
  var x = /** @type {number} */(point.meta(anychart.opt.X));
  var zero = /** @type {number} */(point.meta(anychart.opt.ZERO));
  var zeroMissing = /** @type {boolean} */(point.meta(anychart.opt.ZERO_MISSING));
  var y = /** @type {number} */(point.meta(anychart.opt.VALUE));

  shapes[anychart.opt.FILL].lineTo(x, y);
  shapes[anychart.opt.HATCH_FILL].lineTo(x, y);
  shapes[anychart.opt.STROKE].lineTo(x, y);

  if (this.series.planIsStacked()) {
    this.zeroesStack.push(x, zero, zeroMissing);
  } else {
    this.lastDrawnX = x;
  }
};


/** @inheritDoc */
anychart.core.drawers.Area.prototype.finalizeSegment = function() {
  if (!this.prevPointDrawn) return;
  var shapes = this.shapesManager.getShapesGroup(this.seriesState);
  var path = shapes[anychart.opt.FILL];
  var hatchPath = shapes[anychart.opt.HATCH_FILL];
  if (this.zeroesStack) {
    /** @type {number} */
    var prevX = NaN;
    /** @type {number} */
    var prevY = NaN;
    /** @type {boolean} */
    var prevWasMissing = false;
    for (var i = this.zeroesStack.length - 1; i >= 0; i -= 3) {
      /** @type {number} */
      var x = /** @type {number} */(this.zeroesStack[i - 2]);
      /** @type {number} */
      var y = /** @type {number} */(this.zeroesStack[i - 1]);
      /** @type {boolean} */
      var isMissing = /** @type {boolean} */(this.zeroesStack[i]);
      if (isMissing && !isNaN(prevX)) {
        path.lineTo(prevX, y);
        hatchPath.lineTo(prevX, y);
      } else if (prevWasMissing && !isNaN(prevY)) {
        path.lineTo(x, prevY);
        hatchPath.lineTo(x, prevY);
      }
      path.lineTo(x, y);
      hatchPath.lineTo(x, y);
      prevX = x;
      prevY = y;
      prevWasMissing = isMissing;
    }
    path.close();
    hatchPath.close();
    this.zeroesStack = null;
  } else if (!isNaN(this.lastDrawnX)) {
    path
        .lineTo(this.lastDrawnX, this.zeroY)
        .close();
    hatchPath
        .lineTo(this.lastDrawnX, this.zeroY)
        .close();
  }
};
