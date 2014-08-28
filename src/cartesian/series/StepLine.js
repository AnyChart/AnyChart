goog.provide('anychart.cartesian.series.StepLine');

goog.require('anychart.cartesian.series.ContinuousBase');



/**
 * Define StepLine series type.<br/>
 * <b>Note:</b> Better for use methods {@link anychart.cartesian.Chart#stepLine}.
 * @example
 * anychart.cartesian.series.stepLine([1, 4, 7, 1]).container(stage).draw();
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
anychart.cartesian.series.seriesTypesMap[anychart.cartesian.series.Type.STEP_LINE] = anychart.cartesian.series.StepLine;


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
anychart.cartesian.series.StepLine.prototype.getType = function() {
  return anychart.cartesian.series.Type.STEP_LINE;
};


/**
 * @inheritDoc
 */
anychart.cartesian.series.StepLine.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  json['seriesType'] = this.getType();
  return json;
};


/**
 * @inheritDoc
 */
anychart.cartesian.series.StepLine.prototype.deserialize = function(config) {
  return goog.base(this, 'deserialize', config);
};


/**
 * Constructor function for stepLine series.<br/>
 * @example
 * anychart.cartesian.series.stepLine([1, 4, 7, 1]).container(stage).draw();
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {!anychart.cartesian.series.StepLine}
 */
anychart.cartesian.series.stepLine = function(data, opt_csvSettings) {
  return new anychart.cartesian.series.StepLine(data, opt_csvSettings);
};


//exports
goog.exportSymbol('anychart.cartesian.series.stepLine', anychart.cartesian.series.stepLine);//doc|ex
anychart.cartesian.series.StepLine.prototype['stroke'] = anychart.cartesian.series.StepLine.prototype.stroke;//inherited
anychart.cartesian.series.StepLine.prototype['hoverStroke'] = anychart.cartesian.series.StepLine.prototype.hoverStroke;//inherited
