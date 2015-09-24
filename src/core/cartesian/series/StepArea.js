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

  // Define reference fields for a series
  this.referenceValueNames = ['x', 'value', 'value'];
  this.referenceValueMeanings = ['x', 'z', 'y'];
  this.referenceValuesSupportStack = true;
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
  var zeroMissing = this.yScale().isStackValMissing();
  var referenceValues = this.getReferenceCoords();
  if (!referenceValues)
    return false;

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    var x = referenceValues[0];
    var zero = referenceValues[1];
    var y = referenceValues[2];

    this.finalizeSegment();

    this.path
        .moveTo(x, zero)
        .lineTo(x, y);
    this.strokePath
        .moveTo(x, y);

    this.prevX_ = x;
    this.prevY_ = y;

    if (this.yScale().stackMode() == anychart.enums.ScaleStackMode.NONE)
      this.lastDrawnX = x;
    else
      this.zeroesStack = [x, zero, zeroMissing];

    this.getIterator().meta('x', x).meta('zero', zero).meta('value', y);
  }

  return true;
};


/** @inheritDoc */
anychart.core.cartesian.series.StepArea.prototype.drawSubsequentPoint = function(pointState) {
  var zeroMissing = this.yScale().isStackValMissing();
  var referenceValues = this.getReferenceCoords();
  if (!referenceValues)
    return false;

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    var x = referenceValues[0];
    var zero = referenceValues[1];
    var y = referenceValues[2];

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

    if (this.yScale().stackMode() == anychart.enums.ScaleStackMode.NONE)
      this.lastDrawnX = x;
    else
      this.zeroesStack.push(x, zero, zeroMissing);

    this.getIterator().meta('x', x).meta('zero', zero).meta('value', y);
  }

  return true;
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
      var isMissing = /** @type {boolean} */(this.zeroesStack[i - 0]);
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
