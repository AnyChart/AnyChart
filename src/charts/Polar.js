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
  res[anychart.enums.CartesianSeriesType.AREA] = {
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
  res[anychart.enums.CartesianSeriesType.LINE] = {
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
  res[anychart.enums.CartesianSeriesType.MARKER] = {
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
  return anychart.enums.normalizeRadarSeriesType(type);
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
  var res = (scale instanceof anychart.scales.ScatterBase);
  if (!res)
    anychart.core.reporting.error(anychart.enums.ErrorCode.INCORRECT_SCALE_TYPE, undefined, ['Polar chart scales', 'scatter', 'linear, log']);
  return res;
};


/** @inheritDoc */
anychart.charts.Polar.prototype.createScaleByType = function(value, isXScale, returnNullOnError) {
  return anychart.scales.ScatterBase.fromString(value, returnNullOnError);
};


/** @inheritDoc */
anychart.charts.Polar.prototype.createSeriesInstance = function(type, config) {
  return new anychart.core.series.Polar(this, this, type, config, false);
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
})();
//endregion
