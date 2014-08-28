goog.provide('anychart.cartesian.series.RangeStepArea');

goog.require('anychart.cartesian.series.ContinuousRangeBase');



/**
 * Define RangeStepArea series type.<br/>
 * <b>Note:</b> Better for use methods {@link anychart.cartesian.Chart#rangeStepArea}.
 * @example
 * anychart.cartesian.series.rangeStepArea([['A1', 1, 4],['A2', 7, 1]]).container(stage).draw();
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @constructor
 * @extends {anychart.cartesian.series.ContinuousRangeBase}
 */
anychart.cartesian.series.RangeStepArea = function(data, opt_csvSettings) {
  goog.base(this, data, opt_csvSettings);

  // Define reference points for a series
  this.referenceValueNames = ['x', 'low', 'high'];
  this.referenceValueMeanings = ['x', 'y', 'y'];
  this.referenceValuesSupportStack = false;
};
goog.inherits(anychart.cartesian.series.RangeStepArea, anychart.cartesian.series.ContinuousRangeBase);
anychart.cartesian.series.seriesTypesMap[anychart.cartesian.series.Type.RANGE_STEP_AREA] = anychart.cartesian.series.RangeStepArea;


/** @inheritDoc */
anychart.cartesian.series.RangeStepArea.prototype.drawFirstPoint = function() {
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

    this.prevX_ = x;
    this.prevY_ = high;

    this.lowsStack = [x, low];

    this.getIterator().meta('x', x).meta('low', low).meta('high', high);
  }

  return true;
};


/** @inheritDoc */
anychart.cartesian.series.RangeStepArea.prototype.drawSubsequentPoint = function() {
  var referenceValues = this.getReferenceCoords();
  if (!referenceValues)
    return false;

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    var x = referenceValues[0];
    var low = referenceValues[1];
    var high = referenceValues[2];

    var midX = (x + this.prevX_) / 2;
    this.path
        .lineTo(midX, this.prevY_)
        .lineTo(midX, high)
        .lineTo(x, high);
    this.highPath
        .lineTo(midX, this.prevY_)
        .lineTo(midX, high)
        .lineTo(x, high);

    this.prevX_ = x;
    this.prevY_ = high;

    this.lowsStack.push(x, low);

    this.getIterator().meta('x', x).meta('low', low).meta('high', high);
  }

  return true;
};


/** @inheritDoc */
anychart.cartesian.series.RangeStepArea.prototype.finalizeSegment = function() {
  if (this.lowsStack) {
    /** @type {number} */
    var prevX = NaN;
    /** @type {number} */
    var prevY = NaN;
    var first = true;
    for (var i = this.lowsStack.length - 1; i >= 0; i -= 2) {
      /** @type {number} */
      var x = /** @type {number} */(this.lowsStack[i - 1]);
      /** @type {number} */
      var y = /** @type {number} */(this.lowsStack[i]);
      if (first) {
        this.lowPath.moveTo(x, y);
        first = false;
      } else {
        var midX = (x + prevX) / 2;
        this.path
            .lineTo(midX, prevY)
            .lineTo(midX, y);
        this.lowPath
            .lineTo(midX, prevY)
            .lineTo(midX, y);
      }
      this.path.lineTo(x, y);
      this.lowPath.lineTo(x, y);
      prevX = x;
      prevY = y;
    }
    this.path.close();
    this.lowsStack = null;
  }
};


/**
 * @inheritDoc
 */
anychart.cartesian.series.RangeStepArea.prototype.getType = function() {
  return anychart.cartesian.series.Type.RANGE_STEP_AREA;
};


/**
 * @inheritDoc
 */
anychart.cartesian.series.RangeStepArea.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  json['seriesType'] = this.getType();
  return json;
};


/**
 * @inheritDoc
 */
anychart.cartesian.series.RangeStepArea.prototype.deserialize = function(config) {
  return goog.base(this, 'deserialize', config);
};


/**
 * Constructor function for rangeStepArea series.<br/>
 * @example
 * anychart.cartesian.series.rangeStepArea([['A1', 1, 4],['A2', 7, 1]]).container(stage).draw();
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {!anychart.cartesian.series.RangeStepArea}
 */
anychart.cartesian.series.rangeStepArea = function(data, opt_csvSettings) {
  return new anychart.cartesian.series.RangeStepArea(data, opt_csvSettings);
};


//exports
goog.exportSymbol('anychart.cartesian.series.rangeStepArea', anychart.cartesian.series.rangeStepArea);//doc|ex
anychart.cartesian.series.RangeStepArea.prototype['fill'] = anychart.cartesian.series.RangeStepArea.prototype.fill;//inherited
anychart.cartesian.series.RangeStepArea.prototype['hoverFill'] = anychart.cartesian.series.RangeStepArea.prototype.hoverFill;//inherited
anychart.cartesian.series.RangeStepArea.prototype['highStroke'] = anychart.cartesian.series.RangeStepArea.prototype.highStroke;//inherited
anychart.cartesian.series.RangeStepArea.prototype['hoverHighStroke'] = anychart.cartesian.series.RangeStepArea.prototype.hoverHighStroke;//inherited
anychart.cartesian.series.RangeStepArea.prototype['lowStroke'] = anychart.cartesian.series.RangeStepArea.prototype.lowStroke;//inherited
anychart.cartesian.series.RangeStepArea.prototype['hoverLowStroke'] = anychart.cartesian.series.RangeStepArea.prototype.hoverLowStroke;//inherited
anychart.cartesian.series.RangeStepArea.prototype['hatchFill'] = anychart.cartesian.series.RangeStepArea.prototype.hatchFill;//inherited
anychart.cartesian.series.RangeStepArea.prototype['hoverHatchFill'] = anychart.cartesian.series.RangeStepArea.prototype.hoverHatchFill;//inherited
