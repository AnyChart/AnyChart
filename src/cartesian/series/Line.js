goog.provide('anychart.cartesian.series.Line');

goog.require('anychart.cartesian.series.ContinuousBase');



/**
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @constructor
 * @extends {anychart.cartesian.series.ContinuousBase}
 */
anychart.cartesian.series.Line = function(data, opt_csvSettings) {
  goog.base(this, data, opt_csvSettings);

  // Определяем значения опорных полей серии.
  this.referenceValueNames = ['x', 'value'];
  this.referenceValueMeanings = ['x', 'y'];
  this.referenceValuesSupportStack = true;

  this.zIndex(40);
};
goog.inherits(anychart.cartesian.series.Line, anychart.cartesian.series.ContinuousBase);


/** @inheritDoc */
anychart.cartesian.series.Line.prototype.drawFirstPoint = function() {
  var referenceValues = this.getReferenceCoords();
  if (!referenceValues)
    return false;

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    var x = referenceValues[0];
    var y = referenceValues[1];

    this.path.moveTo(x, y);

    this.getIterator().meta('x', x).meta('y', y);
  }

  return true;
};


/** @inheritDoc */
anychart.cartesian.series.Line.prototype.drawSubsequentPoint = function() {
  var referenceValues = this.getReferenceCoords();
  if (!referenceValues)
    return false;

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    var x = referenceValues[0];
    var y = referenceValues[1];

    this.path.lineTo(x, y);

    this.getIterator().meta('x', x).meta('y', y);
  }

  return true;
};


/** @inheritDoc */
anychart.cartesian.series.Line.prototype.strokeInternal = (function() {
  return this['sourceColor'];
});


/**
 * @inheritDoc
 */
anychart.cartesian.series.Line.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  json['seriesType'] = 'line';
  return json;
};


/**
 * @inheritDoc
 */
anychart.cartesian.series.Line.prototype.deserialize = function(config) {
  return goog.base(this, 'deserialize', config);
};
