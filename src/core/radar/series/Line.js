goog.provide('anychart.core.radar.series.Line');

goog.require('anychart.core.radar.series.ContinuousBase');



/**
 * Define Line series type.<br/>
 * <b>Note:</b> Better for use method {@link anychart.charts.Radar#line}.
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @constructor
 * @extends {anychart.core.radar.series.ContinuousBase}
 */
anychart.core.radar.series.Line = function(opt_data, opt_csvSettings) {
  goog.base(this, opt_data, opt_csvSettings);

  this.referenceValuesSupportStack = false;
  // legacy
  this.stroke(function() {
    return this['sourceColor'];
  });
};
goog.inherits(anychart.core.radar.series.Line, anychart.core.radar.series.ContinuousBase);
anychart.core.radar.series.Base.SeriesTypesMap[anychart.enums.RadarSeriesType.LINE] = anychart.core.radar.series.Line;


/**
 * @type {boolean}
 * @protected
 */
anychart.core.radar.series.Line.prototype.prevPointIsMissing = false;


/** @inheritDoc */
anychart.core.radar.series.Line.prototype.drawFirstPoint = function(pointState) {
  var referenceValues = this.getValuePointCoords();

  if (!goog.isDef(this.firstPointIsMissing))
    this.firstPointIsMissing = !referenceValues;

  if (!referenceValues) {
    this.prevPointIsMissing = true;
    return false;
  } else
    this.prevPointIsMissing = false;

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    var x = referenceValues[0];
    var y = referenceValues[1];

    if (!this.firstDrawnPoint) this.firstDrawnPoint = {x: x, y: y};
    this.path.moveTo(x, y);

    this.getIterator().meta('x', x).meta('value', y);
  }

  return true;
};


/** @inheritDoc */
anychart.core.radar.series.Line.prototype.drawSubsequentPoint = function(pointState) {
  var referenceValues = this.getValuePointCoords();
  if (!referenceValues) {
    this.prevPointIsMissing = true;
    return false;
  } else
    this.prevPointIsMissing = false;

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    var x = referenceValues[0];
    var y = referenceValues[1];

    this.path.lineTo(x, y);

    this.getIterator().meta('x', x).meta('value', y);
  }

  return true;
};


/** @inheritDoc */
anychart.core.radar.series.Line.prototype.finalizeDrawing = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    if (this.connectMissing || (!this.firstPointIsMissing && !this.prevPointIsMissing)) {
      if (goog.isDefAndNotNull(this.firstDrawnPoint))
        this.path.lineTo(this.firstDrawnPoint.x, this.firstDrawnPoint.y);
    }
  }
  goog.base(this, 'finalizeDrawing');
};


/**
 * @inheritDoc
 */
anychart.core.radar.series.Line.prototype.startDrawing = function() {
  this.prevPointIsMissing = false;

  goog.base(this, 'startDrawing');
};


/** @inheritDoc */
anychart.core.radar.series.Line.prototype.getMarkerFill = function() {
  return this.getFinalStroke(false, anychart.PointState.NORMAL);
};


/** @inheritDoc */
anychart.core.radar.series.Line.prototype.getFinalHatchFill = function(usePointSettings, pointState) {
  return /** @type {!(acgraph.vector.HatchFill|acgraph.vector.PatternFill)} */ (/** @type {Object} */ (null));
};


/**
 * @inheritDoc
 */
anychart.core.radar.series.Line.prototype.getType = function() {
  return anychart.enums.CartesianSeriesType.LINE;
};


//anychart.core.radar.series.Line.prototype['finalizeDrawing'] = anychart.core.radar.series.Line.prototype.finalizeDrawing;
//anychart.core.radar.series.Line.prototype['startDrawing'] = anychart.core.radar.series.Line.prototype.startDrawing;
//exports
anychart.core.radar.series.Line.prototype['stroke'] = anychart.core.radar.series.Line.prototype.stroke;//inherited
anychart.core.radar.series.Line.prototype['hoverStroke'] = anychart.core.radar.series.Line.prototype.hoverStroke;//inherited
anychart.core.radar.series.Line.prototype['selectStroke'] = anychart.core.radar.series.Line.prototype.selectStroke;//inherited
anychart.core.radar.series.Line.prototype['finalizeDrawing'] = anychart.core.radar.series.Line.prototype.finalizeDrawing;//inherited
anychart.core.radar.series.Line.prototype['startDrawing'] = anychart.core.radar.series.Line.prototype.startDrawing;//inherited
