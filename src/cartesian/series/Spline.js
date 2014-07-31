goog.provide('anychart.cartesian.series.Spline');

goog.require('anychart.cartesian.series.ContinuousBase');
goog.require('anychart.cartesian.series.SplineDrawer');



/**
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @constructor
 * @extends {anychart.cartesian.series.ContinuousBase}
 */
anychart.cartesian.series.Spline = function(data, opt_csvSettings) {
  goog.base(this, data, opt_csvSettings);

  // Define reference points for a series
  this.referenceValueNames = ['x', 'value'];
  this.referenceValueMeanings = ['x', 'y'];
  this.referenceValuesSupportStack = true;

  /**
   * Spline drawer.
   * @type {!anychart.cartesian.series.SplineDrawer}
   * @private
   */
  this.queue_ = new anychart.cartesian.series.SplineDrawer(this.path);

  this.zIndex(40);
};
goog.inherits(anychart.cartesian.series.Spline, anychart.cartesian.series.ContinuousBase);
anychart.cartesian.series.seriesTypesMap[anychart.cartesian.series.Type.SPLINE] = anychart.cartesian.series.Spline;


/** @inheritDoc */
anychart.cartesian.series.Spline.prototype.startDrawing = function() {
  goog.base(this, 'startDrawing');
  this.queue_.rtl(!!(this.xScale() && this.xScale().inverted()));
};


/** @inheritDoc */
anychart.cartesian.series.Spline.prototype.drawFirstPoint = function() {
  var referenceValues = this.getReferenceCoords();
  if (!referenceValues)
    return false;

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    var x = referenceValues[0];
    var y = referenceValues[1];

    this.finalizeSegment();
    this.queue_.resetDrawer(false);
    this.path.moveTo(x, y);
    this.queue_.processPoint(x, y);

    this.getIterator().meta('x', x).meta('y', y);
  }

  return true;
};


/** @inheritDoc */
anychart.cartesian.series.Spline.prototype.drawSubsequentPoint = function() {
  var referenceValues = this.getReferenceCoords();
  if (!referenceValues)
    return false;

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    var x = referenceValues[0];
    var y = referenceValues[1];

    this.queue_.processPoint(x, y);

    this.getIterator().meta('x', x).meta('y', y);
  }

  return true;
};


/** @inheritDoc */
anychart.cartesian.series.Spline.prototype.strokeInternal = (function() {
  return this['sourceColor'];
});


/** @inheritDoc */
anychart.cartesian.series.Spline.prototype.finalizeSegment = function() {
  this.queue_.finalizeProcessing();
};


/**
 * @inheritDoc
 */
anychart.cartesian.series.Spline.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  json['seriesType'] = anychart.cartesian.series.Type.SPLINE;
  return json;
};


/**
 * @inheritDoc
 */
anychart.cartesian.series.Spline.prototype.deserialize = function(config) {
  return goog.base(this, 'deserialize', config);
};


/**
 * Constructor function.
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {!anychart.cartesian.series.Spline}
 */
anychart.cartesian.series.spline = function(data, opt_csvSettings) {
  return new anychart.cartesian.series.Spline(data, opt_csvSettings);
};


//exports
goog.exportSymbol('anychart.cartesian.series.spline', anychart.cartesian.series.spline);
anychart.cartesian.series.Spline.prototype['stroke'] = anychart.cartesian.series.Spline.prototype.stroke;
anychart.cartesian.series.Spline.prototype['hoverStroke'] = anychart.cartesian.series.Spline.prototype.hoverStroke;
