goog.provide('anychart.cartesian.series.RangeArea');

goog.require('anychart.cartesian.series.ContinuousRangeBase');



/**
 * Define RangeArea series type.<br/>
 * <b>Note:</b> Better for use methods {@link anychart.cartesian.Chart#rangeArea}.
 * @example
 * anychart.cartesian.series.rangeArea([['A1', 1, 4],['A2', 7, 1]]).container(stage).draw();
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @constructor
 * @extends {anychart.cartesian.series.ContinuousRangeBase}
 */
anychart.cartesian.series.RangeArea = function(data, opt_csvSettings) {
  goog.base(this, data, opt_csvSettings);

  // Define reference points for a series
  this.referenceValueNames = ['x', 'low', 'high'];
  this.referenceValueMeanings = ['x', 'y', 'y'];
  this.referenceValuesSupportStack = false;
};
goog.inherits(anychart.cartesian.series.RangeArea, anychart.cartesian.series.ContinuousRangeBase);
anychart.cartesian.series.seriesTypesMap[anychart.cartesian.series.Type.RANGE_AREA] = anychart.cartesian.series.RangeArea;


/** @inheritDoc */
anychart.cartesian.series.RangeArea.prototype.drawFirstPoint = function() {
  var referenceValues = this.getReferenceCoords();
  if (!referenceValues)
    return false;

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    var x = referenceValues[0];
    var low = referenceValues[1];
    var high = referenceValues[2];

    this.finalizeSegment();

    this.path
        .moveTo(x, low)
        .lineTo(x, high);
    this.highPath
        .moveTo(x, high);

    this.lowsStack = [x, low];

    this.getIterator().meta('x', x).meta('low', low).meta('high', high);
  }

  return true;
};


/** @inheritDoc */
anychart.cartesian.series.RangeArea.prototype.drawSubsequentPoint = function() {
  var referenceValues = this.getReferenceCoords();
  if (!referenceValues)
    return false;

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    var x = referenceValues[0];
    var low = referenceValues[1];
    var high = referenceValues[2];

    this.path.lineTo(x, high);
    this.highPath.lineTo(x, high);

    this.lowsStack.push(x, low);

    this.getIterator().meta('x', x).meta('low', low).meta('high', high);
  }

  return true;
};


/** @inheritDoc */
anychart.cartesian.series.RangeArea.prototype.finalizeSegment = function() {
  if (this.lowsStack) {
    /** @type {boolean} */
    var first = true;
    for (var i = this.lowsStack.length - 1; i >= 0; i -= 2) {
      /** @type {number} */
      var x = /** @type {number} */(this.lowsStack[i - 1]);
      /** @type {number} */
      var y = /** @type {number} */(this.lowsStack[i - 0]);
      this.path.lineTo(x, y);
      if (first) {
        this.lowPath.moveTo(x, y);
        first = false;
      } else {
        this.lowPath.lineTo(x, y);
      }
    }
    this.path.close();
    this.lowsStack = null;
  }
};


/**
 * @inheritDoc
 */
anychart.cartesian.series.RangeArea.prototype.getType = function() {
  return anychart.cartesian.series.Type.RANGE_AREA;
};


/**
 * @inheritDoc
 */
anychart.cartesian.series.RangeArea.prototype.deserialize = function(config) {
  return goog.base(this, 'deserialize', config);
};


/**
 * Constructor function for rangeArea series.<br/>
 * @example
 * anychart.cartesian.series.rangeArea([['A1', 1, 4],['A2', 7, 1]]).container(stage).draw();
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {!anychart.cartesian.series.RangeArea}
 */
anychart.cartesian.series.rangeArea = function(data, opt_csvSettings) {
  return new anychart.cartesian.series.RangeArea(data, opt_csvSettings);
};


//exports
goog.exportSymbol('anychart.cartesian.series.rangeArea', anychart.cartesian.series.rangeArea);//doc|ex
anychart.cartesian.series.RangeArea.prototype['fill'] = anychart.cartesian.series.RangeArea.prototype.fill;//inherited
anychart.cartesian.series.RangeArea.prototype['hoverFill'] = anychart.cartesian.series.RangeArea.prototype.hoverFill;//inherited
anychart.cartesian.series.RangeArea.prototype['highStroke'] = anychart.cartesian.series.RangeArea.prototype.highStroke;//inherited
anychart.cartesian.series.RangeArea.prototype['hoverHighStroke'] = anychart.cartesian.series.RangeArea.prototype.hoverHighStroke;//inherited
anychart.cartesian.series.RangeArea.prototype['lowStroke'] = anychart.cartesian.series.RangeArea.prototype.lowStroke;//inherited
anychart.cartesian.series.RangeArea.prototype['hoverLowStroke'] = anychart.cartesian.series.RangeArea.prototype.hoverLowStroke;//inherited
anychart.cartesian.series.RangeArea.prototype['hatchFill'] = anychart.cartesian.series.RangeArea.prototype.hatchFill;//inherited
anychart.cartesian.series.RangeArea.prototype['hoverHatchFill'] = anychart.cartesian.series.RangeArea.prototype.hoverHatchFill;//inherited
