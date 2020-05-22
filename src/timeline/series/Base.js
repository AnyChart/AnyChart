goog.provide('anychart.timelineModule.series.Base');
goog.require('anychart.core.series.Cartesian');



//region --- Constructor
/**
 * @param {!anychart.core.IChart} chart
 * @param {!anychart.core.IPlot} plot
 * @param {string} type
 * @param {anychart.core.series.TypeConfig} config
 * @param {boolean} sortedMode
 * @constructor
 * @extends {anychart.core.series.Cartesian}
 */
anychart.timelineModule.series.Base = function(chart, plot, type, config, sortedMode) {
  anychart.timelineModule.series.Base.base(this, 'constructor', chart, plot, type, config, sortedMode);

  this.autoDirection_ = anychart.enums.Direction.UP;
  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['direction', anychart.ConsistencyState.SERIES_COLOR, anychart.Signal.NEEDS_REDRAW, anychart.core.series.Capabilities.ANY]
  ]);
};
goog.inherits(anychart.timelineModule.series.Base, anychart.core.series.Cartesian);


//endregion
//region --- Consistency states and descriptors
/**
 * Timeline base series supported consistency states.
 * @type {number}
 */
anychart.timelineModule.series.Base.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.series.Cartesian.prototype.SUPPORTED_CONSISTENCY_STATES;


/**
 * @type {!Object<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.timelineModule.series.Base.PROPERTY_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  var d = anychart.core.settings.descriptors;
  anychart.core.settings.createDescriptors(map, [
    d.DIRECTION
  ]);

  return map;
})();
anychart.core.settings.populate(anychart.timelineModule.series.Base, anychart.timelineModule.series.Base.PROPERTY_DESCRIPTORS);


//endregion
//region --- Infrastructure and overrides
/**
 * @param {anychart.enums.Direction=} opt_value
 * @return {anychart.enums.Direction|anychart.timelineModule.series.Base}
 */
anychart.timelineModule.series.Base.prototype.autoDirection = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.autoDirection_ = opt_value;
    return this;
  }
  return this.autoDirection_;
};


/**
 * Returns UP or DOWN direction. Handles auto direction.
 * @return {anychart.enums.Direction}
 */
anychart.timelineModule.series.Base.prototype.getFinalDirection = function() {
  var direction = /** @type {anychart.enums.Direction} */(this.getOption('direction'));
  if (direction == anychart.enums.Direction.AUTO || direction == anychart.enums.Direction.ODD_EVEN) {
    return this.autoDirection_;
  }
  return direction;
};


/** @inheritDoc */
anychart.timelineModule.series.Base.prototype.getCategoryWidth = function(opt_category) {
  return 0;
};


/** @inheritDoc */
anychart.timelineModule.series.Base.prototype.needsExtremums = function() {
  return false;
};


/** @inheritDoc */
anychart.timelineModule.series.Base.prototype.isPointVisible = function(point) {
  var x = anychart.utils.normalizeTimestamp(point.getX());
  var range = this.chart.xScale().getRange();
  if (x >= range['min'] || x <= range['max']) {
    return true;
  }
  return false;
};


/** @inheritDoc */
anychart.timelineModule.series.Base.prototype.planIsStacked = function() {
  return false;
};


/**
 * @param {Array} data
 * @param {Function} dataPusher
 * @param {Function} xNormalizer
 */
anychart.timelineModule.series.Base.prototype.pushSeriesBasedPointData = goog.nullFunction;


/** @inheritDoc */
anychart.timelineModule.series.Base.prototype.getDrawingData = function(data, dataPusher, xNormalizer, xMissingChecker) {
  var dataSource = /** @type {anychart.data.IView} */(this.data());
  var iterator = dataSource.getIterator();
  var hasXErrors = false;
  var hasYErrors = false;

  var nonMissingCount = 0;

  this.pushSeriesBasedPointData(data, dataPusher, xNormalizer);

  this.invalidate(anychart.ConsistencyState.SERIES_DATA);
  this.drawingPlan = {
    data: data,
    series: this,
    nonMissingCount: nonMissingCount,
    hasPointLabels: this.supportsLabels() &&
        (
            dataSource.checkFieldExist('normal') ||
            dataSource.checkFieldExist('hovered') ||
            dataSource.checkFieldExist('selected') ||
            dataSource.checkFieldExist('label') ||
            dataSource.checkFieldExist('hoverLabel') ||
            dataSource.checkFieldExist('selectLabel') ||
            dataSource.checkFieldExist('minLabel') ||
            dataSource.checkFieldExist('hoverMinLabel') ||
            dataSource.checkFieldExist('selectMinLabel') ||
            dataSource.checkFieldExist('maxLabel') ||
            dataSource.checkFieldExist('hoverMaxLabel') ||
            dataSource.checkFieldExist('selectMaxLabel')
        ),
    hasPointMarkers: this.supportsMarkers() &&
        (
            dataSource.checkFieldExist('normal') ||
            dataSource.checkFieldExist('hovered') ||
            dataSource.checkFieldExist('selected') ||
            dataSource.checkFieldExist('marker') ||
            dataSource.checkFieldExist('hoverMarker') ||
            dataSource.checkFieldExist('selectMarker')
        ),
    hasPointOutliers: this.supportsOutliers() &&
        (
            dataSource.checkFieldExist('outliers') ||
            dataSource.checkFieldExist('normal') ||
            dataSource.checkFieldExist('hovered') ||
            dataSource.checkFieldExist('selected') ||
            dataSource.checkFieldExist('outlierMarker') ||
            dataSource.checkFieldExist('hoverOutlierMarker') ||
            dataSource.checkFieldExist('selectOutlierMarker')
        ),
    hasPointXErrors: hasXErrors,
    hasPointYErrors: hasYErrors,
    hasPointErrors: hasXErrors || hasYErrors
  };

  return this.drawingPlan;
};


//endregion
//region --- Meta
/**
 * Meta maker for timeline.
 * @param {anychart.data.IRowInfo} rowInfo
 * @param {Array.<string>} yNames
 * @param {Array.<string|number>} yColumns
 * @param {number} pointMissing
 * @param {number} xRatio
 */
anychart.timelineModule.series.Base.prototype.makeTimelineMeta = function(rowInfo, yNames, yColumns, pointMissing, xRatio) {
  var direction = /** @type {anychart.enums.Direction} */(this.getOption('direction'));
  if (direction == anychart.enums.Direction.AUTO || direction == anychart.enums.Direction.ODD_EVEN) {
    direction = this.autoDirection();
  }
  rowInfo.meta('direction', direction);
  var bounds = this.parentBounds();
  rowInfo.meta('zero', bounds.top + bounds.height / 2);
};


/** @inheritDoc */
anychart.timelineModule.series.Base.prototype.prepareMetaMakers = function(yNames, yColumns) {
  this.metaMakers.push(this.makeTimelineMeta);
};


//endregion
//region --- Serialization and setup
/**
 * @inheritDoc
 */
anychart.timelineModule.series.Base.prototype.serialize = function() {
  var json = anychart.timelineModule.series.Base.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.timelineModule.series.Base.PROPERTY_DESCRIPTORS, json);
  return json;
};


/**
 * @inheritDoc
 */
anychart.timelineModule.series.Base.prototype.setupByJSON = function(config, opt_default) {
  anychart.timelineModule.series.Base.base(this, 'setupByJSON', config, opt_default);
  anychart.core.settings.deserialize(this, anychart.timelineModule.series.Base.PROPERTY_DESCRIPTORS, config, opt_default);
};
//endregion
