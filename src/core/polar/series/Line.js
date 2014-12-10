goog.provide('anychart.core.polar.series.Line');

goog.require('anychart.core.polar.series.ContinuousBase');



/**
 * Define Line series type.<br/>
 * <b>Note:</b> Better for use methods {@link anychart.charts.Polar#line} or {@link anychart.core.Chart#lineChart}.
 * @example
 * anychart.core.polar.series.line([1, 4, 7, 1]).container(stage).draw();
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @constructor
 * @extends {anychart.core.polar.series.ContinuousBase}
 */
anychart.core.polar.series.Line = function(opt_data, opt_csvSettings) {
  goog.base(this, opt_data, opt_csvSettings);
};
goog.inherits(anychart.core.polar.series.Line, anychart.core.polar.series.ContinuousBase);
anychart.core.polar.series.Base.SeriesTypesMap[anychart.enums.PolarSeriesType.LINE] = anychart.core.polar.series.Line;


/** @inheritDoc */
anychart.core.polar.series.Line.prototype.drawFirstPoint = function() {
  var valuePoint = this.getValuePointCoords();

  if (!valuePoint) {
    if (!goog.isDefAndNotNull(this.firstPointIsMissing)) this.firstPointIsMissing = true;
    return false;
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    if (!goog.isDefAndNotNull(this.firstPointIsMissing) || (this.closed() && this.connectMissing)) {
      this.firstValuePointCoords = this.prevValuePointCoords.slice();
      this.firstPointIsMissing = false;
    }

    var x = valuePoint[4];
    var y = valuePoint[5];

    this.path.moveTo(x, y);

    this.getIterator().meta('x', x).meta('y', y);
  }

  return true;
};


/** @inheritDoc */
anychart.core.polar.series.Line.prototype.drawSubsequentPoint = function() {
  var valuePoint = this.getValuePointCoords();
  if (!valuePoint)
    return false;

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {

    for (var i = 0, len = valuePoint.length; i < len; i += 6) {
      var P2x = valuePoint[i];
      var P2y = valuePoint[i + 1];
      var P3x = valuePoint[i + 2];
      var P3y = valuePoint[i + 3];
      var P4x = valuePoint[i + 4];
      var P4y = valuePoint[i + 5];

      this.path.curveTo(P2x, P2y, P3x, P3y, P4x, P4y);
    }

    this.getIterator().meta('x', P4x).meta('y', P4y);
  }

  return true;
};


/** @inheritDoc */
anychart.core.polar.series.Line.prototype.finalizeDrawing = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    if (!this.firstPointIsMissing &&
        this.closed() &&
        goog.isDefAndNotNull(this.prevValuePointCoords) &&
        goog.isDefAndNotNull(this.firstValuePointCoords)) {

      var valuePoint = this.approximateCurve(this.prevValuePointCoords, this.firstValuePointCoords);

      if (!valuePoint) {
        this.path.lineTo(this.firstValuePointCoords[0], this.firstValuePointCoords[1]);
      } else {
        for (var i = 0, len = valuePoint.length; i < len; i += 6) {
          var P2x = valuePoint[i];
          var P2y = valuePoint[i + 1];
          var P3x = valuePoint[i + 2];
          var P3y = valuePoint[i + 3];
          var P4x = valuePoint[i + 4];
          var P4y = valuePoint[i + 5];

          this.path.curveTo(P2x, P2y, P3x, P3y, P4x, P4y);
        }
      }
    }
  }

  goog.base(this, 'finalizeDrawing');
};


/** @inheritDoc */
anychart.core.polar.series.Line.prototype.strokeInternal = (function() {
  return this['sourceColor'];
});


/** @inheritDoc */
anychart.core.polar.series.Line.prototype.getMarkerFill = function() {
  return this.getFinalStroke(false, false);
};


/**
 * @inheritDoc
 */
anychart.core.polar.series.Line.prototype.getType = function() {
  return anychart.enums.CartesianSeriesType.LINE;
};


/** @inheritDoc */
anychart.core.polar.series.Line.prototype.getLegendIconType = function() {
  return /** @type {anychart.enums.LegendItemIconType} */(anychart.enums.LegendItemIconType.LINE);
};


//anychart.core.polar.series.Line.prototype['finalizeDrawing'] = anychart.core.polar.series.Line.prototype.finalizeDrawing;
//exports
anychart.core.polar.series.Line.prototype['stroke'] = anychart.core.polar.series.Line.prototype.stroke;//inherited
anychart.core.polar.series.Line.prototype['hoverStroke'] = anychart.core.polar.series.Line.prototype.hoverStroke;//inherited
