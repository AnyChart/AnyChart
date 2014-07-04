goog.provide('anychart.cartesian.series.StepLine');

goog.require('anychart.cartesian.series.ContinuousBase');



/**
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @constructor
 * @extends {anychart.cartesian.series.ContinuousBase}
 */
anychart.cartesian.series.StepLine = function(data, opt_csvSettings) {
  goog.base(this, data, opt_csvSettings);

  // Define reference fields of a series
  this.referenceValueNames = ['x', 'value'];
  this.referenceValueMeanings = ['x', 'y'];
  this.referenceValuesSupportStack = true;

  this.zIndex(40);
};
goog.inherits(anychart.cartesian.series.StepLine, anychart.cartesian.series.ContinuousBase);


/**
 * @type {number}
 * @private
 */
anychart.cartesian.series.StepLine.prototype.prevX_;


/**
 * @type {number}
 * @private
 */
anychart.cartesian.series.StepLine.prototype.prevY_;


/** @inheritDoc */
anychart.cartesian.series.StepLine.prototype.drawFirstPoint = function() {
  var referenceValues = this.getReferenceCoords();
  if (!referenceValues)
    return false;

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    var x = referenceValues[0];
    var y = referenceValues[1];

    this.path.moveTo(x, y);

    this.prevX_ = x;
    this.prevY_ = y;

    this.getIterator().meta('x', x).meta('y', y);
  }

  return true;
};


/** @inheritDoc */
anychart.cartesian.series.StepLine.prototype.drawSubsequentPoint = function() {
  var referenceValues = this.getReferenceCoords();
  if (!referenceValues)
    return false;

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    var x = referenceValues[0];
    var y = referenceValues[1];

    var midX = (x + this.prevX_) / 2;
    this.path
        .lineTo(midX, this.prevY_)
        .lineTo(midX, y)
        .lineTo(x, y);

    this.prevX_ = x;
    this.prevY_ = y;

    this.getIterator().meta('x', x).meta('y', y);
  }

  return true;
};


/** @inheritDoc */
anychart.cartesian.series.StepLine.prototype.strokeInternal = (function() {
  return this['sourceColor'];
});


/**
 * @inheritDoc
 */
anychart.cartesian.series.StepLine.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  json['seriesType'] = 'stepline';
  return json;
};


/**
 * @inheritDoc
 */
anychart.cartesian.series.StepLine.prototype.deserialize = function(config) {
  return goog.base(this, 'deserialize', config);
};
