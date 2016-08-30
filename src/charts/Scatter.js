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
  anychart.charts.Scatter.base(this, 'constructor', false, false);

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
    anchoredPositionTop: anychart.opt.VALUE,
    anchoredPositionBottom: anychart.opt.VALUE
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
    anchoredPositionTop: anychart.opt.VALUE,
    anchoredPositionBottom: anychart.opt.VALUE
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
    anchoredPositionTop: anychart.opt.VALUE,
    anchoredPositionBottom: anychart.opt.VALUE
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
anychart.charts.Scatter.prototype.checkScaleType = function(scale) {
  var res = (scale instanceof anychart.scales.ScatterBase);
  if (!res)
    anychart.core.reporting.error(anychart.enums.ErrorCode.INCORRECT_SCALE_TYPE, undefined, ['Scatter chart scales']);
  return res;
};


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
anychart.charts.Scatter.prototype['crosshair'] = anychart.charts.Scatter.prototype.crosshair;
anychart.charts.Scatter.prototype['xScale'] = anychart.charts.Scatter.prototype.xScale;//doc|ex
anychart.charts.Scatter.prototype['yScale'] = anychart.charts.Scatter.prototype.yScale;//doc|ex
anychart.charts.Scatter.prototype['grid'] = anychart.charts.Scatter.prototype.grid;//doc|ex
anychart.charts.Scatter.prototype['minorGrid'] = anychart.charts.Scatter.prototype.minorGrid;//doc|ex
anychart.charts.Scatter.prototype['xAxis'] = anychart.charts.Scatter.prototype.xAxis;//doc|ex
anychart.charts.Scatter.prototype['yAxis'] = anychart.charts.Scatter.prototype.yAxis;//doc|ex
anychart.charts.Scatter.prototype['getSeries'] = anychart.charts.Scatter.prototype.getSeries;//doc|ex
// autoexport
// anychart.charts.Scatter.prototype['bubble'] = anychart.charts.Scatter.prototype.bubble;//doc|ex
// anychart.charts.Scatter.prototype['line'] = anychart.charts.Scatter.prototype.line;//doc|ex
// anychart.charts.Scatter.prototype['marker'] = anychart.charts.Scatter.prototype.marker;//doc|ex
anychart.charts.Scatter.prototype['lineMarker'] = anychart.charts.Scatter.prototype.lineMarker;//doc|ex
anychart.charts.Scatter.prototype['rangeMarker'] = anychart.charts.Scatter.prototype.rangeMarker;//doc|ex
anychart.charts.Scatter.prototype['textMarker'] = anychart.charts.Scatter.prototype.textMarker;//doc|ex
anychart.charts.Scatter.prototype['palette'] = anychart.charts.Scatter.prototype.palette;//doc|ex
anychart.charts.Scatter.prototype['markerPalette'] = anychart.charts.Scatter.prototype.markerPalette;
anychart.charts.Scatter.prototype['hatchFillPalette'] = anychart.charts.Scatter.prototype.hatchFillPalette;
anychart.charts.Scatter.prototype['getType'] = anychart.charts.Scatter.prototype.getType;
anychart.charts.Scatter.prototype['maxBubbleSize'] = anychart.charts.Scatter.prototype.maxBubbleSize;
anychart.charts.Scatter.prototype['minBubbleSize'] = anychart.charts.Scatter.prototype.minBubbleSize;
anychart.charts.Scatter.prototype['defaultSeriesType'] = anychart.charts.Scatter.prototype.defaultSeriesType;
anychart.charts.Scatter.prototype['addSeries'] = anychart.charts.Scatter.prototype.addSeries;
anychart.charts.Scatter.prototype['getSeriesAt'] = anychart.charts.Scatter.prototype.getSeriesAt;
anychart.charts.Scatter.prototype['getSeriesCount'] = anychart.charts.Scatter.prototype.getSeriesCount;
anychart.charts.Scatter.prototype['removeSeries'] = anychart.charts.Scatter.prototype.removeSeries;
anychart.charts.Scatter.prototype['removeSeriesAt'] = anychart.charts.Scatter.prototype.removeSeriesAt;
anychart.charts.Scatter.prototype['removeAllSeries'] = anychart.charts.Scatter.prototype.removeAllSeries;
anychart.charts.Scatter.prototype['getPlotBounds'] = anychart.charts.Scatter.prototype.getPlotBounds;
anychart.charts.Scatter.prototype['annotations'] = anychart.charts.Scatter.prototype.annotations;
