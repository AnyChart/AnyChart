goog.provide('anychart.charts.Scatter');

goog.require('anychart'); // otherwise we can't use anychart.chartTypesMap object.
goog.require('anychart.core.ChartWithAxes');
goog.require('anychart.core.series.Cartesian');
goog.require('anychart.enums');



/**
 * Scatter chart class.<br/>
 * @extends {anychart.core.ChartWithAxes}
 * @constructor
 */
anychart.charts.Scatter = function() {
  anychart.charts.Scatter.base(this, 'constructor', false);

  this.defaultSeriesType(anychart.enums.ScatterSeriesType.MARKER);
};
goog.inherits(anychart.charts.Scatter, anychart.core.ChartWithAxes);


//region --- Infrastucture
//----------------------------------------------------------------------------------------------------------------------
//
//  Infrastucture
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.charts.Scatter.prototype.getType = function() {
  return anychart.enums.ChartTypes.SCATTER;
};


/**
 * Series config for Scatter chart.
 * @type {!Object.<string, anychart.core.series.TypeConfig>}
 */
anychart.charts.Scatter.prototype.seriesConfig = (function() {
  var res = {};
  var capabilities = (
      anychart.core.series.Capabilities.ALLOW_INTERACTIVITY |
      anychart.core.series.Capabilities.ALLOW_POINT_SETTINGS |
      anychart.core.series.Capabilities.ALLOW_ERROR |
      anychart.core.series.Capabilities.SUPPORTS_MARKERS |
      anychart.core.series.Capabilities.SUPPORTS_LABELS |
      0);
  res[anychart.enums.CartesianSeriesType.BUBBLE] = {
    drawerType: anychart.enums.SeriesDrawerTypes.BUBBLE,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_POINT,
    shapesConfig: [
      anychart.core.shapeManagers.circleFillStrokeConfig,
      anychart.core.shapeManagers.circleHatchConfig,
      anychart.core.shapeManagers.circleNegativeFillStrokeConfig,
      anychart.core.shapeManagers.circleNegativeHatchConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'value',
    anchoredPositionBottom: 'value'
  };
  res[anychart.enums.CartesianSeriesType.LINE] = {
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
        anychart.core.series.Capabilities.ALLOW_ERROR |
        // anychart.core.series.Capabilities.SUPPORTS_MARKERS |
        anychart.core.series.Capabilities.SUPPORTS_LABELS |
        0),
    anchoredPositionTop: 'value',
    anchoredPositionBottom: 'value'
  };
  return res;
})();
anychart.core.ChartWithSeries.generateSeriesConstructors(anychart.charts.Scatter, anychart.charts.Scatter.prototype.seriesConfig);


//endregion
//region --- Scales
//----------------------------------------------------------------------------------------------------------------------
//
//  Scales
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.charts.Scatter.prototype.allowLegendCategoriesMode = function() {
  return false;
};


/** @inheritDoc */
anychart.charts.Scatter.prototype.checkXScaleType = function(scale) {
  var res = (scale instanceof anychart.scales.ScatterBase);
  if (!res)
    anychart.core.reporting.error(anychart.enums.ErrorCode.INCORRECT_SCALE_TYPE, undefined, ['Scatter chart scales', 'scatter', 'linear, log']);
  return res;
};


/** @inheritDoc */
anychart.charts.Scatter.prototype.checkYScaleType = anychart.charts.Scatter.prototype.checkXScaleType;


/** @inheritDoc */
anychart.charts.Scatter.prototype.createScaleByType = function(value, isXScale, returnNullOnError) {
  return anychart.scales.ScatterBase.fromString(value, returnNullOnError);
};


//endregion
//region --- Series
//----------------------------------------------------------------------------------------------------------------------
//
//  Series
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.charts.Scatter.prototype.createSeriesInstance = function(type, config) {
  return new anychart.core.series.Cartesian(this, this, type, config, false);
};


/** @inheritDoc */
anychart.charts.Scatter.prototype.normalizeSeriesType = function(type) {
  return anychart.enums.normalizeScatterSeriesType(type);
};


//endregion
//region --- Serialization / Deserialization / Disposing
//----------------------------------------------------------------------------------------------------------------------
//
//  Serialization / Deserialization / Disposing
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @inheritDoc
 */
anychart.charts.Scatter.prototype.serialize = function() {
  var json = anychart.charts.Scatter.base(this, 'serialize');
  json['type'] = anychart.enums.ChartTypes.SCATTER;
  return {'chart': json};
};


//endregion


//exports
(function() {
  var proto = anychart.charts.Scatter.prototype;
  proto['crosshair'] = proto.crosshair;
  proto['xScale'] = proto.xScale;//doc|ex
  proto['yScale'] = proto.yScale;//doc|ex
  proto['grid'] = proto.grid;//doc|ex
  proto['minorGrid'] = proto.minorGrid;//doc|ex
  proto['xAxis'] = proto.xAxis;//doc|ex
  proto['yAxis'] = proto.yAxis;//doc|ex
  proto['getSeries'] = proto.getSeries;//doc|ex
  // autoexport
  // proto['bubble'] = proto.bubble;//doc|ex
  // proto['line'] = proto.line;//doc|ex
  // proto['marker'] = proto.marker;//doc|ex
  proto['lineMarker'] = proto.lineMarker;//doc|ex
  proto['rangeMarker'] = proto.rangeMarker;//doc|ex
  proto['textMarker'] = proto.textMarker;//doc|ex
  proto['palette'] = proto.palette;//doc|ex
  proto['markerPalette'] = proto.markerPalette;
  proto['hatchFillPalette'] = proto.hatchFillPalette;
  proto['getType'] = proto.getType;
  proto['maxBubbleSize'] = proto.maxBubbleSize;
  proto['minBubbleSize'] = proto.minBubbleSize;
  proto['defaultSeriesType'] = proto.defaultSeriesType;
  proto['addSeries'] = proto.addSeries;
  proto['getSeriesAt'] = proto.getSeriesAt;
  proto['getSeriesCount'] = proto.getSeriesCount;
  proto['removeSeries'] = proto.removeSeries;
  proto['removeSeriesAt'] = proto.removeSeriesAt;
  proto['removeAllSeries'] = proto.removeAllSeries;
  proto['getPlotBounds'] = proto.getPlotBounds;
  proto['annotations'] = proto.annotations;
})();
