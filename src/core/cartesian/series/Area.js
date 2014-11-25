goog.provide('anychart.core.cartesian.series.Area');

goog.require('anychart.core.cartesian.series.AreaBase');



/**
 * Define Area series type.<br/>
 * <b>Note:</b> Better for use methods {@link anychart.charts.Cartesian#area} or {@link anychart.core.Chart#areaChart}.
 * @example
 * anychart.core.cartesian.series.area([1, 4, 7, 1]).container(stage).draw();
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @constructor
 * @extends {anychart.core.cartesian.series.AreaBase}
 */
anychart.core.cartesian.series.Area = function(data, opt_csvSettings) {
  goog.base(this, data, opt_csvSettings);

  // Define reference fields for a series
  this.referenceValueNames = ['x', 'value', 'value'];
  this.referenceValueMeanings = ['x', 'z', 'y'];
  this.referenceValuesSupportStack = true;
};
goog.inherits(anychart.core.cartesian.series.Area, anychart.core.cartesian.series.AreaBase);
anychart.core.cartesian.series.Base.SeriesTypesMap[anychart.enums.CartesianSeriesType.AREA] = anychart.core.cartesian.series.Area;


/** @inheritDoc */
anychart.core.cartesian.series.Area.prototype.drawFirstPoint = function() {
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

    if (this.yScale().stackMode() == anychart.enums.ScaleStackMode.NONE)
      this.lastDrawnX = x;
    else
      this.zeroesStack = [x, zero, zeroMissing];

    this.getIterator().meta('x', x).meta('zero', zero).meta('y', y);
  }

  return true;
};


/** @inheritDoc */
anychart.core.cartesian.series.Area.prototype.drawSubsequentPoint = function() {
  var zeroMissing = this.yScale().isStackValMissing();
  var referenceValues = this.getReferenceCoords();
  if (!referenceValues)
    return false;

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    var x = referenceValues[0];
    var zero = referenceValues[1];
    var y = referenceValues[2];

    this.path.lineTo(x, y);
    this.strokePath.lineTo(x, y);

    if (this.yScale().stackMode() == anychart.enums.ScaleStackMode.NONE)
      this.lastDrawnX = x;
    else
      this.zeroesStack.push(x, zero, zeroMissing);

    this.getIterator().meta('x', x).meta('zero', zero).meta('y', y);
  }

  return true;
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
      var isMissing = /** @type {boolean} */(this.zeroesStack[i - 0]);
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


/**
 * @inheritDoc
 */
anychart.core.cartesian.series.Area.prototype.deserialize = function(config) {
  return goog.base(this, 'deserialize', config);
};


//exports
anychart.core.cartesian.series.Area.prototype['fill'] = anychart.core.cartesian.series.Area.prototype.fill;//inherited
anychart.core.cartesian.series.Area.prototype['hoverFill'] = anychart.core.cartesian.series.Area.prototype.hoverFill;//inherited
anychart.core.cartesian.series.Area.prototype['stroke'] = anychart.core.cartesian.series.Area.prototype.stroke;//inherited
anychart.core.cartesian.series.Area.prototype['hoverStroke'] = anychart.core.cartesian.series.Area.prototype.hoverStroke;//inherited
anychart.core.cartesian.series.Area.prototype['hatchFill'] = anychart.core.cartesian.series.Area.prototype.hatchFill;//inherited
anychart.core.cartesian.series.Area.prototype['hoverHatchFill'] = anychart.core.cartesian.series.Area.prototype.hoverHatchFill;//inherited
