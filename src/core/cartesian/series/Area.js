goog.provide('anychart.core.cartesian.series.Area');

goog.require('anychart.core.cartesian.series.AreaBase');



/**
 * Define Area series type.<br/>
 * <b>Note:</b> Use method {@link anychart.charts.Cartesian#area} to get this series.
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @constructor
 * @extends {anychart.core.cartesian.series.AreaBase}
 */
anychart.core.cartesian.series.Area = function(opt_data, opt_csvSettings) {
  goog.base(this, opt_data, opt_csvSettings);

  this.needsZero = true;
};
goog.inherits(anychart.core.cartesian.series.Area, anychart.core.cartesian.series.AreaBase);
anychart.core.cartesian.series.Base.SeriesTypesMap[anychart.enums.CartesianSeriesType.AREA] = anychart.core.cartesian.series.Area;


/** @inheritDoc */
anychart.core.cartesian.series.Area.prototype.drawFirstPoint = function(pointState) {
  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    var x = /** @type {number} */(this.iterator.meta('x'));
    var y = /** @type {number} */(this.iterator.meta('value'));
    var zero = /** @type {number} */(this.iterator.meta('zero'));

    this.path
        .moveTo(x, zero)
        .lineTo(x, y);
    this.strokePath
        .moveTo(x, y);

    if (this.drawingPlan.stacked) {
      this.zeroesStack = [x, zero, this.iterator.meta('zeroMissing')];
    } else {
      this.lastDrawnX = x;
    }
  }
};


/** @inheritDoc */
anychart.core.cartesian.series.Area.prototype.drawSubsequentPoint = function(pointState) {
  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    var x = /** @type {number} */(this.iterator.meta('x'));
    var y = /** @type {number} */(this.iterator.meta('value'));
    var zero = /** @type {number} */(this.iterator.meta('zero'));

    this.path.lineTo(x, y);
    this.strokePath.lineTo(x, y);

    if (this.drawingPlan.stacked) {
      this.zeroesStack.push(x, zero, this.iterator.meta('zeroMissing'));
    } else {
      this.lastDrawnX = x;
    }
  }
};


/** @inheritDoc */
anychart.core.cartesian.series.Area.prototype.finalizeSegment = function() {
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
      if (isMissing && !isNaN(prevX))
        this.path.lineTo(prevX, y);
      else if (prevWasMissing && !isNaN(prevY))
        this.path.lineTo(x, prevY);
      this.path.lineTo(x, y);
      prevX = x;
      prevY = y;
      prevWasMissing = isMissing;
    }
    this.path.close();
    this.zeroesStack = null;
  } else if (!isNaN(this.lastDrawnX)) {
    this.path
        .lineTo(this.lastDrawnX, this.zeroY)
        .close();
  }
};


/**
 * @inheritDoc
 */
anychart.core.cartesian.series.Area.prototype.getType = function() {
  return anychart.enums.CartesianSeriesType.AREA;
};


//exports
anychart.core.cartesian.series.Area.prototype['fill'] = anychart.core.cartesian.series.Area.prototype.fill;
anychart.core.cartesian.series.Area.prototype['hoverFill'] = anychart.core.cartesian.series.Area.prototype.hoverFill;
anychart.core.cartesian.series.Area.prototype['selectFill'] = anychart.core.cartesian.series.Area.prototype.selectFill;

anychart.core.cartesian.series.Area.prototype['stroke'] = anychart.core.cartesian.series.Area.prototype.stroke;
anychart.core.cartesian.series.Area.prototype['hoverStroke'] = anychart.core.cartesian.series.Area.prototype.hoverStroke;
anychart.core.cartesian.series.Area.prototype['selectStroke'] = anychart.core.cartesian.series.Area.prototype.selectStroke;

anychart.core.cartesian.series.Area.prototype['hatchFill'] = anychart.core.cartesian.series.Area.prototype.hatchFill;
anychart.core.cartesian.series.Area.prototype['hoverHatchFill'] = anychart.core.cartesian.series.Area.prototype.hoverHatchFill;
anychart.core.cartesian.series.Area.prototype['selectHatchFill'] = anychart.core.cartesian.series.Area.prototype.selectHatchFill;
