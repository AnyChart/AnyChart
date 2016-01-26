goog.provide('anychart.core.cartesian.series.StepArea');

goog.require('anychart.core.cartesian.series.AreaBase');



/**
 * Define StepArea series type.<br/>
 * <b>Note:</b> Use method {@link anychart.charts.Cartesian#stepArea} to get this series.
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @constructor
 * @extends {anychart.core.cartesian.series.AreaBase}
 */
anychart.core.cartesian.series.StepArea = function(opt_data, opt_csvSettings) {
  goog.base(this, opt_data, opt_csvSettings);

  this.needsZero = true;
};
goog.inherits(anychart.core.cartesian.series.StepArea, anychart.core.cartesian.series.AreaBase);
anychart.core.cartesian.series.Base.SeriesTypesMap[anychart.enums.CartesianSeriesType.STEP_AREA] = anychart.core.cartesian.series.StepArea;


/**
 * @type {number}
 * @private
 */
anychart.core.cartesian.series.StepArea.prototype.prevX_;


/**
 * @type {number}
 * @private
 */
anychart.core.cartesian.series.StepArea.prototype.prevY_;


/** @inheritDoc */
anychart.core.cartesian.series.StepArea.prototype.drawFirstPoint = function(pointState) {
  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    var x = /** @type {number} */(this.iterator.meta('x'));
    var y = /** @type {number} */(this.iterator.meta('value'));
    var zero = /** @type {number} */(this.iterator.meta('zero'));

    this.path
        .moveTo(x, zero)
        .lineTo(x, y);
    this.strokePath
        .moveTo(x, y);

    this.prevX_ = x;
    this.prevY_ = y;

    if (this.drawingPlan.stacked) {
      this.zeroesStack = [x, zero, this.iterator.meta('zeroMissing')];
    } else {
      this.lastDrawnX = x;
    }
  }
};


/** @inheritDoc */
anychart.core.cartesian.series.StepArea.prototype.drawSubsequentPoint = function(pointState) {
  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    var x = /** @type {number} */(this.iterator.meta('x'));
    var y = /** @type {number} */(this.iterator.meta('value'));
    var zero = /** @type {number} */(this.iterator.meta('zero'));

    var midX = (x + this.prevX_) / 2;
    this.path
        .lineTo(midX, this.prevY_)
        .lineTo(midX, y)
        .lineTo(x, y);
    this.strokePath
        .lineTo(midX, this.prevY_)
        .lineTo(midX, y)
        .lineTo(x, y);

    this.prevX_ = x;
    this.prevY_ = y;

    if (this.drawingPlan.stacked) {
      this.zeroesStack.push(x, zero, this.iterator.meta('zeroMissing'));
    } else {
      this.lastDrawnX = x;
    }
  }
};


/** @inheritDoc */
anychart.core.cartesian.series.StepArea.prototype.finalizeSegment = function() {
  if (!isNaN(this.lastDrawnX)) {
    this.path
        .lineTo(this.lastDrawnX, this.zeroY)
        .close();
  } else if (this.zeroesStack) {
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
      if (isMissing && !prevWasMissing && !isNaN(prevX))
        this.path.lineTo(prevX, y);
      else if (prevWasMissing && !isNaN(prevY))
        this.path.lineTo(x, prevY);
      else if (!isNaN(prevY)) {
        var midX = (x + prevX) / 2;
        this.path
            .lineTo(midX, prevY)
            .lineTo(midX, y);
      }
      this.path.lineTo(x, y);
      prevX = x;
      prevY = y;
      prevWasMissing = isMissing;
    }
    this.path.close();
    this.zeroesStack = null;
  }
};


/**
 * @inheritDoc
 */
anychart.core.cartesian.series.StepArea.prototype.getType = function() {
  return anychart.enums.CartesianSeriesType.STEP_AREA;
};


//anychart.core.cartesian.series.StepArea.prototype['startDrawing'] = anychart.core.cartesian.series.StepArea.prototype.startDrawing;//inherited
//exports
anychart.core.cartesian.series.StepArea.prototype['fill'] = anychart.core.cartesian.series.StepArea.prototype.fill;//inherited
anychart.core.cartesian.series.StepArea.prototype['hoverFill'] = anychart.core.cartesian.series.StepArea.prototype.hoverFill;//inherited
anychart.core.cartesian.series.StepArea.prototype['selectFill'] = anychart.core.cartesian.series.StepArea.prototype.selectFill;//inherited

anychart.core.cartesian.series.StepArea.prototype['stroke'] = anychart.core.cartesian.series.StepArea.prototype.stroke;//inherited
anychart.core.cartesian.series.StepArea.prototype['hoverStroke'] = anychart.core.cartesian.series.StepArea.prototype.hoverStroke;//inherited
anychart.core.cartesian.series.StepArea.prototype['selectStroke'] = anychart.core.cartesian.series.StepArea.prototype.selectStroke;//inherited

anychart.core.cartesian.series.StepArea.prototype['hatchFill'] = anychart.core.cartesian.series.StepArea.prototype.hatchFill;//inherited
anychart.core.cartesian.series.StepArea.prototype['hoverHatchFill'] = anychart.core.cartesian.series.StepArea.prototype.hoverHatchFill;//inherited
anychart.core.cartesian.series.StepArea.prototype['selectHatchFill'] = anychart.core.cartesian.series.StepArea.prototype.selectHatchFill;//inherited
