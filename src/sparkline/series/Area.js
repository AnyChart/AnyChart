goog.provide('anychart.sparklineModule.series.Area');

goog.require('anychart.sparklineModule.series.ContinuousBase');



/**
 * Define Area series type.<br/>
 * <b>Note:</b> Use method {@link anychart.sparklineModule.Chart#area} to get this series.
 * @param {!anychart.sparklineModule.Chart} chart Chart.
 * @constructor
 * @extends {anychart.sparklineModule.series.ContinuousBase}
 */
anychart.sparklineModule.series.Area = function(chart) {
  anychart.sparklineModule.series.Area.base(this, 'constructor', chart);

  /**
   * @type {!acgraph.vector.Path}
   * @protected
   */
  this.strokePath = acgraph.path();
  this.strokePath.zIndex(anychart.sparklineModule.series.Base.ZINDEX_SERIES + 0.1);

  this.paths.push(this.strokePath);
};
goog.inherits(anychart.sparklineModule.series.Area, anychart.sparklineModule.series.ContinuousBase);
anychart.sparklineModule.series.Base.SeriesTypesMap[anychart.enums.SparklineSeriesType.AREA] = anychart.sparklineModule.series.Area;


/**
 * Last drawn X in case of non-stacked scalthis.pathse, NaN otherwise.
 * @type {number}
 * @protected
 */
anychart.sparklineModule.series.Area.prototype.lastDrawnX;


/**
 * @inheritDoc
 */
anychart.sparklineModule.series.Area.prototype.startDrawing = function() {
  anychart.sparklineModule.series.Area.base(this, 'startDrawing');

  // No points were drawn before
  this.lastDrawnX = NaN;
};


/** @inheritDoc */
anychart.sparklineModule.series.Area.prototype.colorizeShape = function() {
  var fill = acgraph.vector.normalizeFill(/** @type {!acgraph.vector.Fill} */(
      this.chart.normalizeColor(/** @type {acgraph.vector.Fill|Function} */(this.chart.fill()))));

  this.path.stroke(null);
  this.path.fill(fill);
  this.strokePath.stroke(this.chart.getFinalStroke());
  this.strokePath.fill(null);
};


/** @inheritDoc */
anychart.sparklineModule.series.Area.prototype.finalizeHatchFill = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_HATCH_FILL)) {
    if (this.hatchFillPath) {
      this.hatchFillPath.deserialize(this.path.serialize());
      this.applyHatchFill();
    }
  }
};


/** @inheritDoc */
anychart.sparklineModule.series.Area.prototype.drawFirstPoint = function() {
  var valuePoint = this.getReferenceCoords();

  if (!valuePoint)
    return false;

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    var x = valuePoint[0];
    var y = valuePoint[1];

    this.finalizeSegment();

    this.path
        .moveTo(x, this.zeroY)
        .lineTo(x, y);
    this.strokePath
        .moveTo(x, y);

    this.lastDrawnX = x;

    this.getIterator().meta('x', x).meta('value', y);
  }

  return true;
};


/** @inheritDoc */
anychart.sparklineModule.series.Area.prototype.drawSubsequentPoint = function() {
  var valuePoint = this.getReferenceCoords();
  if (!valuePoint)
    return false;

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    var x = valuePoint[0];
    var y = valuePoint[1];

    this.path.lineTo(x, y);
    this.strokePath.lineTo(x, y);

    this.lastDrawnX = x;

    this.getIterator().meta('x', x).meta('value', y);
  }

  return true;
};


/** @inheritDoc */
anychart.sparklineModule.series.Area.prototype.finalizeSegment = function() {
  if (!isNaN(this.lastDrawnX)) {
    this.path
        .lineTo(this.lastDrawnX, this.zeroY)
        .close();
  }
};


/** @inheritDoc */
anychart.sparklineModule.series.Area.prototype.getDefaults = function() {
  var settings = anychart.sparklineModule.series.Area.base(this, 'getDefaults');

  settings['stroke'] = {
    'color': '#64b5f6',
    'thickness': 1.5
  };
  settings['fill'] = {
    'color': '#64b5f6',
    'opacity': 0.5
  };

  return settings;
};

