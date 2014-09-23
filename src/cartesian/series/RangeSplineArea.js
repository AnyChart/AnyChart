goog.provide('anychart.cartesian.series.RangeSplineArea');

goog.require('anychart.cartesian.series.ContinuousRangeBase');
goog.require('anychart.cartesian.series.SplineDrawer');



/**
 * Define RangeSplineArea series type.<br/>
 * <b>Note:</b> Better for use methods {@link anychart.cartesian.Chart#rangeSplineArea}.
 * @example
 * anychart.cartesian.series.rangeSplineArea([['A1', 1, 4],['A2', 3, 5],['A3', 2, 3]]).container(stage).draw();
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @constructor
 * @extends {anychart.cartesian.series.ContinuousRangeBase}
 */
anychart.cartesian.series.RangeSplineArea = function(data, opt_csvSettings) {
  goog.base(this, data, opt_csvSettings);

  // Define reference points for a series
  this.referenceValueNames = ['x', 'low', 'high'];
  this.referenceValueMeanings = ['x', 'y', 'y'];
  this.referenceValuesSupportStack = false;

  /**
   * Spline drawer.
   * @type {!anychart.cartesian.series.SplineDrawer}
   * @private
   */
  this.queue_ = new anychart.cartesian.series.SplineDrawer(this.path);
};
goog.inherits(anychart.cartesian.series.RangeSplineArea, anychart.cartesian.series.ContinuousRangeBase);
anychart.cartesian.series.Base.SeriesTypesMap[anychart.enums.CartesianSeriesType.RANGE_SPLINE_AREA] = anychart.cartesian.series.RangeSplineArea;


/** @inheritDoc */
anychart.cartesian.series.RangeSplineArea.prototype.startDrawing = function() {
  goog.base(this, 'startDrawing');
  this.queue_.rtl(!!(this.xScale() && this.xScale().inverted()));
};


/** @inheritDoc */
anychart.cartesian.series.RangeSplineArea.prototype.drawFirstPoint = function() {
  var referenceValues = this.getReferenceCoords();
  if (!referenceValues) {
    return false;
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    var x = referenceValues[0];
    var low = referenceValues[1];
    var high = referenceValues[2];

    this.finalizeSegment();
    this.queue_.resetDrawer(false);
    this.queue_.setStrokePath(this.highPath);
    this.path
        .moveTo(x, low)
        .lineTo(x, high);
    this.highPath
        .moveTo(x, high);
    this.queue_.processPoint(x, high);

    this.lowsStack = [x, low];

    this.getIterator().meta('x', x).meta('low', low).meta('high', high);
  }

  return true;
};


/** @inheritDoc */
anychart.cartesian.series.RangeSplineArea.prototype.drawSubsequentPoint = function() {
  var referenceValues = this.getReferenceCoords();
  if (!referenceValues) {
    return false;
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    var x = referenceValues[0];
    var low = referenceValues[1];
    var high = referenceValues[2];

    this.queue_.processPoint(x, high);

    this.lowsStack.push(x, low);

    this.getIterator().meta('x', x).meta('low', low).meta('high', high);
  }

  return true;
};


/** @inheritDoc */
anychart.cartesian.series.RangeSplineArea.prototype.finalizeSegment = function() {
  this.queue_.finalizeProcessing();
  this.queue_.setStrokePath(this.lowPath);
  if (this.lowsStack) {
    /** @type {boolean} */
    var firstPoint = true;
    for (var i = this.lowsStack.length - 1; i >= 0; i -= 2) {
      /** @type {number} */
      var x = /** @type {number} */(this.lowsStack[i - 1]);
      /** @type {number} */
      var y = /** @type {number} */(this.lowsStack[i]);
      if (firstPoint) {
        this.queue_.resetDrawer(true);
        this.path.lineTo(x, y);
        this.lowPath.moveTo(x, y);
        firstPoint = false;
      }
      this.queue_.processPoint(x, y);
    }
    this.queue_.finalizeProcessing();
    this.lowsStack = null;
  }
};


/**
 * @inheritDoc
 */
anychart.cartesian.series.RangeSplineArea.prototype.getType = function() {
  return anychart.enums.CartesianSeriesType.RANGE_SPLINE_AREA;
};


/**
 * @inheritDoc
 */
anychart.cartesian.series.RangeSplineArea.prototype.deserialize = function(config) {
  return goog.base(this, 'deserialize', config);
};


/**
 * Constructor function for rangeSplineArea series.<br/>
 * @example
 * anychart.cartesian.series.rangeSplineArea([['A1', 1, 4],['A2', 3, 5],['A3', 2, 3]]).container(stage).draw();
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {!anychart.cartesian.series.RangeSplineArea}
 */
anychart.cartesian.series.rangeSplineArea = function(data, opt_csvSettings) {
  return new anychart.cartesian.series.RangeSplineArea(data, opt_csvSettings);
};


//exports
goog.exportSymbol('anychart.cartesian.series.rangeSplineArea', anychart.cartesian.series.rangeSplineArea);//doc|ex
anychart.cartesian.series.RangeSplineArea.prototype['fill'] = anychart.cartesian.series.RangeSplineArea.prototype.fill;//inherited
anychart.cartesian.series.RangeSplineArea.prototype['hoverFill'] = anychart.cartesian.series.RangeSplineArea.prototype.hoverFill;//inherited
anychart.cartesian.series.RangeSplineArea.prototype['highStroke'] = anychart.cartesian.series.RangeSplineArea.prototype.highStroke;//inherited
anychart.cartesian.series.RangeSplineArea.prototype['hoverHighStroke'] = anychart.cartesian.series.RangeSplineArea.prototype.hoverHighStroke;//inherited
anychart.cartesian.series.RangeSplineArea.prototype['lowStroke'] = anychart.cartesian.series.RangeSplineArea.prototype.lowStroke;//inherited
anychart.cartesian.series.RangeSplineArea.prototype['hoverLowStroke'] = anychart.cartesian.series.RangeSplineArea.prototype.hoverLowStroke;//inherited
anychart.cartesian.series.RangeSplineArea.prototype['hatchFill'] = anychart.cartesian.series.RangeSplineArea.prototype.hatchFill;//inherited
anychart.cartesian.series.RangeSplineArea.prototype['hoverHatchFill'] = anychart.cartesian.series.RangeSplineArea.prototype.hoverHatchFill;//inherited
