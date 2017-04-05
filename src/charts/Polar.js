goog.provide('anychart.charts.Polar');

goog.require('anychart.core.RadarPolarChart');
goog.require('anychart.core.axes.Polar');
goog.require('anychart.core.grids.Polar');
goog.require('anychart.core.series.Polar');
goog.require('anychart.enums');



/**
 * Polar chart class.<br/>
 * To get the chart use method {@link anychart.polar}.<br/>
 * Chart can contain any number of series.<br/>
 * Each series is interactive, you can customize click and hover behavior and other params.
 * @extends {anychart.core.RadarPolarChart}
 * @constructor
 */
anychart.charts.Polar = function() {
  anychart.charts.Polar.base(this, 'constructor', false);
};
goog.inherits(anychart.charts.Polar, anychart.core.RadarPolarChart);


//region --- Series
//------------------------------------------------------------------------------
//
//  Series
//
//------------------------------------------------------------------------------
/**
 * Series config for Radar chart.
 * @type {!Object.<string, anychart.core.series.TypeConfig>}
 */
anychart.charts.Polar.prototype.seriesConfig = (function() {
  var res = {};
  var capabilities = (
      anychart.core.series.Capabilities.ALLOW_INTERACTIVITY |
      anychart.core.series.Capabilities.ALLOW_POINT_SETTINGS |
      // anychart.core.series.Capabilities.ALLOW_ERROR |
      anychart.core.series.Capabilities.SUPPORTS_MARKERS |
      anychart.core.series.Capabilities.SUPPORTS_LABELS |
      0);
  res[anychart.enums.PolarSeriesType.AREA] = {
    drawerType: anychart.enums.SeriesDrawerTypes.POLAR_AREA,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_SERIES,
    shapesConfig: [
      anychart.core.shapeManagers.pathFillConfig,
      anychart.core.shapeManagers.pathStrokeConfig,
      anychart.core.shapeManagers.pathHatchConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'value',
    anchoredPositionBottom: 'zero'
  };
  res[anychart.enums.PolarSeriesType.COLUMN] = {
    drawerType: anychart.enums.SeriesDrawerTypes.POLAR_COLUMN,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_POINT,
    shapesConfig: [
      anychart.core.shapeManagers.pathFillStrokeConfig,
      anychart.core.shapeManagers.pathHatchConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'value',
    anchoredPositionBottom: 'zero'
  };
  res[anychart.enums.PolarSeriesType.LINE] = {
    drawerType: anychart.enums.SeriesDrawerTypes.POLAR_LINE,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_SERIES,
    shapesConfig: [
      anychart.core.shapeManagers.pathStrokeConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'value',
    anchoredPositionBottom: 'value'
  };
  res[anychart.enums.PolarSeriesType.POLYGON] = {
    drawerType: anychart.enums.SeriesDrawerTypes.AREA,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_SERIES,
    shapesConfig: [
      anychart.core.shapeManagers.pathFillConfig,
      anychart.core.shapeManagers.pathStrokeConfig,
      anychart.core.shapeManagers.pathHatchConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'value',
    anchoredPositionBottom: 'zero'
  };
  res[anychart.enums.PolarSeriesType.POLYLINE] = {
    drawerType: anychart.enums.SeriesDrawerTypes.LINE,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_SERIES,
    shapesConfig: [
      anychart.core.shapeManagers.pathStrokeConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'value',
    anchoredPositionBottom: 'value'
  };
  res[anychart.enums.PolarSeriesType.RANGE_COLUMN] = {
    drawerType: anychart.enums.SeriesDrawerTypes.POLAR_RANGE_COLUMN,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_POINT,
    shapesConfig: [
      anychart.core.shapeManagers.pathFillStrokeConfig,
      anychart.core.shapeManagers.pathHatchConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'high',
    anchoredPositionBottom: 'low'
  };
  res[anychart.enums.PolarSeriesType.MARKER] = {
    drawerType: anychart.enums.SeriesDrawerTypes.MARKER,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_POINT,
    shapesConfig: [
      anychart.core.shapeManagers.pathFillStrokeConfig,
      anychart.core.shapeManagers.pathHatchConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: (
        anychart.core.series.Capabilities.ALLOW_INTERACTIVITY |
        anychart.core.series.Capabilities.ALLOW_POINT_SETTINGS |
        // anychart.core.series.Capabilities.ALLOW_ERROR |
        // anychart.core.series.Capabilities.SUPPORTS_MARKERS |
        anychart.core.series.Capabilities.SUPPORTS_LABELS |
        0),
    anchoredPositionTop: 'value',
    anchoredPositionBottom: 'value'
  };
  return res;
})();
anychart.core.ChartWithSeries.generateSeriesConstructors(anychart.charts.Polar, anychart.charts.Polar.prototype.seriesConfig);


//endregion
//region --- Public methods
//------------------------------------------------------------------------------
//
//  Public methods
//
//------------------------------------------------------------------------------
/**
 * If the points of series should be sorted by X before drawing.
 * @param {boolean=} opt_value
 * @return {boolean|anychart.charts.Polar}
 */
anychart.charts.Polar.prototype.sortPointsByX = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = !!opt_value;
    if (this.categorizeData != val) {
      this.categorizeData = val;
      this.invalidate(anychart.ConsistencyState.SCALE_CHART_SCALES | anychart.ConsistencyState.SCALE_CHART_Y_SCALES);
      this.invalidateSeriesOfScale(this.xScale());
    }
    return this;
  }
  return this.categorizeData;
};


//endregion
//region --- Infrastructure overrides
//------------------------------------------------------------------------------
//
//  Infrastructure overrides
//
//------------------------------------------------------------------------------
/** @inheritDoc */
anychart.charts.Polar.prototype.getType = function() {
  return anychart.enums.ChartTypes.POLAR;
};


/** @inheritDoc */
anychart.charts.Polar.prototype.normalizeSeriesType = function(type) {
  return anychart.enums.normalizePolarSeriesType(type);
};


/** @inheritDoc */
anychart.charts.Polar.prototype.createGridInstance = function() {
  return new anychart.core.grids.Polar();
};


/** @inheritDoc */
anychart.charts.Polar.prototype.createXAxisInstance = function() {
  return new anychart.core.axes.Polar();
};


/** @inheritDoc */
anychart.charts.Polar.prototype.allowLegendCategoriesMode = function() {
  return false;
};


/** @inheritDoc */
anychart.charts.Polar.prototype.checkXScaleType = function(scale) {
  return (scale instanceof anychart.scales.Base);
};


/** @inheritDoc */
anychart.charts.Polar.prototype.createScaleByType = function(value, isXScale, returnNullOnError) {
  return anychart.scales.Base.fromString(value, returnNullOnError);
};


/** @inheritDoc */
anychart.charts.Polar.prototype.createSeriesInstance = function(type, config) {
  return new anychart.core.series.Polar(this, this, type, config, false);
};


//endregion
//region --- Serialization / Deserialization
//------------------------------------------------------------------------------
//
//  Serialization / Deserialization
//
//------------------------------------------------------------------------------
/** @inheritDoc */
anychart.charts.Polar.prototype.setupByJSONWithScales = function(config, scalesInstances, opt_default) {
  anychart.charts.Polar.base(this, 'setupByJSONWithScales', config, scalesInstances, opt_default);
  this.sortPointsByX(config['sortPointsByX']);
  this.barGroupsPadding(config['barGroupsPadding']);
  this.barsPadding(config['barsPadding']);
};


/** @inheritDoc */
anychart.charts.Polar.prototype.serializeWithScales = function(json, scales, scaleIds) {
  anychart.charts.Polar.base(this, 'serializeWithScales', json, scales, scaleIds);
  json['sortPointsByX'] = this.sortPointsByX();
  json['barGroupsPadding'] = this.barGroupsPadding();
  json['barsPadding'] = this.barsPadding();
};


//endregion
//region --- Exports
//------------------------------------------------------------------------------
//
//  Exports
//
//------------------------------------------------------------------------------
//exports
(function() {
  var proto = anychart.charts.Polar.prototype;
  proto['getType'] = proto.getType;
  proto['sortPointsByX'] = proto.sortPointsByX;
  proto['barsPadding'] = proto.barsPadding;
  proto['barGroupsPadding'] = proto.barGroupsPadding;
})();
//endregion
