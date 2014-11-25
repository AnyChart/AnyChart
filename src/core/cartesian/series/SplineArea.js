goog.provide('anychart.core.cartesian.series.SplineArea');

goog.require('anychart.core.cartesian.series.AreaBase');
goog.require('anychart.core.cartesian.series.SplineDrawer');



/**
 * Define SplineArea series type.<br/>
 * <b>Note:</b> Better for use methods {@link anychart.charts.Cartesian#splineArea}.
 * @example
 * anychart.core.cartesian.series.splineArea([1, 4, 7, 1]).container(stage).draw();
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @constructor
 * @extends {anychart.core.cartesian.series.AreaBase}
 */
anychart.core.cartesian.series.SplineArea = function(data, opt_csvSettings) {
  goog.base(this, data, opt_csvSettings);

  // Define reference fields for a series
  this.referenceValueNames = ['x', 'value', 'value'];
  this.referenceValueMeanings = ['x', 'z', 'y'];
  this.referenceValuesSupportStack = true;

  /**
   * Spline drawer.
   * @type {!anychart.core.cartesian.series.SplineDrawer}
   * @private
   */
  this.queue_ = new anychart.core.cartesian.series.SplineDrawer(this.path);
};
goog.inherits(anychart.core.cartesian.series.SplineArea, anychart.core.cartesian.series.AreaBase);
anychart.core.cartesian.series.Base.SeriesTypesMap[anychart.enums.CartesianSeriesType.SPLINE_AREA] = anychart.core.cartesian.series.SplineArea;


/** @inheritDoc */
anychart.core.cartesian.series.SplineArea.prototype.startDrawing = function() {
  goog.base(this, 'startDrawing');
  this.queue_.rtl(!!(this.xScale() && this.xScale().inverted()));
};


/** @inheritDoc */
anychart.core.cartesian.series.SplineArea.prototype.drawFirstPoint = function() {
  var zeroMissing = this.yScale().isStackValMissing();
  var referenceValues = this.getReferenceCoords();
  if (!referenceValues) {
    return false;
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    var x = referenceValues[0];
    var zero = referenceValues[1];
    var y = referenceValues[2];

    this.finalizeSegment();
    this.queue_.resetDrawer(false);
    this.queue_.setStrokePath(this.strokePath);
    this.path
        .moveTo(x, zero)
        .lineTo(x, y);
    this.strokePath
        .moveTo(x, y);
    this.queue_.processPoint(x, y);

    if (this.yScale().stackMode() == anychart.enums.ScaleStackMode.NONE)
      this.lastDrawnX = x;
    else
      this.zeroesStack = [x, zero, zeroMissing];

    this.getIterator().meta('x', x).meta('zero', zero).meta('y', y);
  }

  return true;
};


/** @inheritDoc */
anychart.core.cartesian.series.SplineArea.prototype.drawSubsequentPoint = function() {
  var zeroMissing = this.yScale().isStackValMissing();
  var referenceValues = this.getReferenceCoords();
  if (!referenceValues) {
    return false;
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    var x = referenceValues[0];
    var zero = referenceValues[1];
    var y = referenceValues[2];

    this.queue_.processPoint(x, y);

    if (this.yScale().stackMode() == anychart.enums.ScaleStackMode.NONE)
      this.lastDrawnX = x;
    else
      this.zeroesStack.push(x, zero, zeroMissing);

    this.getIterator().meta('x', x).meta('zero', zero).meta('y', y);
  }

  return true;
};


/** @inheritDoc */
anychart.core.cartesian.series.SplineArea.prototype.finalizeSegment = function() {
  this.queue_.finalizeProcessing();
  this.queue_.setStrokePath(null);
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
    /** @type {boolean} */
    var firstPoint = true;
    for (var i = this.zeroesStack.length - 1; i >= 0; i -= 3) {
      /** @type {number} */
      var x = /** @type {number} */(this.zeroesStack[i - 2]);
      /** @type {number} */
      var y = /** @type {number} */(this.zeroesStack[i - 1]);
      /** @type {boolean} */
      var isMissing = /** @type {boolean} */(this.zeroesStack[i - 0]);
      if (firstPoint) {
        this.queue_.resetDrawer(true);
        this.path.lineTo(x, y);
        if (!isMissing)
          this.queue_.processPoint(x, y);
        firstPoint = false;
      } else if (isMissing && prevWasMissing) {
        this.path.lineTo(x, y);
      } else if (isMissing) {
        this.queue_.finalizeProcessing();
        this.queue_.resetDrawer(true);
        this.path.lineTo(prevX, y);
        this.path.lineTo(x, y);
      } else if (prevWasMissing) {
        this.path.lineTo(x, prevY);
        this.path.lineTo(x, y);
        this.queue_.processPoint(x, y);
      } else {
        this.queue_.processPoint(x, y);
      }
      prevX = x;
      prevY = y;
      prevWasMissing = isMissing;
    }
    this.queue_.finalizeProcessing();
    this.zeroesStack = null;
  }
};


/**
 * @inheritDoc
 */
anychart.core.cartesian.series.SplineArea.prototype.getType = function() {
  return anychart.enums.CartesianSeriesType.SPLINE_AREA;
};


/**
 * @inheritDoc
 */
anychart.core.cartesian.series.SplineArea.prototype.deserialize = function(config) {
  return goog.base(this, 'deserialize', config);
};


//exports
anychart.core.cartesian.series.SplineArea.prototype['startDrawing'] = anychart.core.cartesian.series.SplineArea.prototype.startDrawing;//inherited
anychart.core.cartesian.series.SplineArea.prototype['fill'] = anychart.core.cartesian.series.SplineArea.prototype.fill;//inherited
anychart.core.cartesian.series.SplineArea.prototype['hoverFill'] = anychart.core.cartesian.series.SplineArea.prototype.hoverFill;//inherited
anychart.core.cartesian.series.SplineArea.prototype['stroke'] = anychart.core.cartesian.series.SplineArea.prototype.stroke;//inherited
anychart.core.cartesian.series.SplineArea.prototype['hoverStroke'] = anychart.core.cartesian.series.SplineArea.prototype.hoverStroke;//inherited
anychart.core.cartesian.series.SplineArea.prototype['hatchFill'] = anychart.core.cartesian.series.SplineArea.prototype.hatchFill;//inherited
anychart.core.cartesian.series.SplineArea.prototype['hoverHatchFill'] = anychart.core.cartesian.series.SplineArea.prototype.hoverHatchFill;//inherited
