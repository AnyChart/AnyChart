goog.provide('anychart.scatterModule.Chart');

goog.require('anychart'); // otherwise we can't use anychart.chartTypesMap object.
goog.require('anychart.core.ChartWithAxes');
goog.require('anychart.core.series.Cartesian');
goog.require('anychart.enums');



/**
 * Scatter chart class.<br/>
 * @extends {anychart.core.ChartWithAxes}
 * @constructor
 */
anychart.scatterModule.Chart = function() {
  anychart.scatterModule.Chart.base(this, 'constructor', false);

  this.addThemes('scatter');

  this.setOption('defaultSeriesType', anychart.enums.ScatterSeriesType.MARKER);
  this.setType(anychart.enums.ChartTypes.SCATTER);
};
goog.inherits(anychart.scatterModule.Chart, anychart.core.ChartWithAxes);


//region --- Infrastucture
//----------------------------------------------------------------------------------------------------------------------
//
//  Infrastucture
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Series config for Scatter chart.
 * @type {!Object.<string, anychart.core.series.TypeConfig>}
 */
anychart.scatterModule.Chart.prototype.seriesConfig = (function() {
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
      anychart.core.shapeManagers.pathStrokeConfig,
      anychart.core.shapeManagers.pathContiniousFallingStrokeConfig,
      anychart.core.shapeManagers.pathContiniousRisingStrokeConfig,
      anychart.core.shapeManagers.pathContiniousNegativeStrokeConfig
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
      anychart.core.shapeManagers.pathHatchConfig,

      anychart.core.shapeManagers.pathNegativeFillStrokeConfig,
      anychart.core.shapeManagers.pathNegativeHatchConfig,

      anychart.core.shapeManagers.pathRisingFillStrokeConfig,
      anychart.core.shapeManagers.pathRisingHatchConfig,
      anychart.core.shapeManagers.pathFallingFillStrokeConfig,
      anychart.core.shapeManagers.pathFallingHatchConfig
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
anychart.core.ChartWithSeries.generateSeriesConstructors(anychart.scatterModule.Chart, anychart.scatterModule.Chart.prototype.seriesConfig);


//endregion
//region --- Scales
//----------------------------------------------------------------------------------------------------------------------
//
//  Scales
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.scatterModule.Chart.prototype.allowLegendCategoriesMode = function() {
  return false;
};


//endregion
//region --- Series
//----------------------------------------------------------------------------------------------------------------------
//
//  Series
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.scatterModule.Chart.prototype.createSeriesInstance = function(type, config) {
  return new anychart.core.series.Cartesian(this, this, type, config, false);
};


/** @inheritDoc */
anychart.scatterModule.Chart.prototype.normalizeSeriesType = function(type) {
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
anychart.scatterModule.Chart.prototype.serialize = function() {
  var json = anychart.scatterModule.Chart.base(this, 'serialize');
  return {'chart': json};
};




//endregion
//exports
(function() {
  var proto = anychart.scatterModule.Chart.prototype;
  proto['crosshair'] = proto.crosshair;
  proto['xScale'] = proto.xScale;//doc|ex
  proto['yScale'] = proto.yScale;//doc|ex
  proto['xGrid'] = proto.xGrid;//doc|ex
  proto['yGrid'] = proto.yGrid;//doc|ex
  proto['xMinorGrid'] = proto.xMinorGrid;//doc|ex
  proto['yMinorGrid'] = proto.yMinorGrid;//doc|ex
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
  // auto from ChartWithSeries
  // proto['maxBubbleSize'] = proto.maxBubbleSize;
  // proto['minBubbleSize'] = proto.minBubbleSize;
  // proto['defaultSeriesType'] = proto.defaultSeriesType;
  proto['addSeries'] = proto.addSeries;
  proto['getSeriesAt'] = proto.getSeriesAt;
  proto['getSeriesCount'] = proto.getSeriesCount;
  proto['removeSeries'] = proto.removeSeries;
  proto['removeSeriesAt'] = proto.removeSeriesAt;
  proto['removeAllSeries'] = proto.removeAllSeries;
  proto['getPlotBounds'] = proto.getPlotBounds;
  proto['annotations'] = proto.annotations;
  proto['getXScales'] = proto.getXScales;
  proto['getYScales'] = proto.getYScales;
  // quadrant
  proto['quarters'] = proto.quarters;
  proto['crossing'] = proto.crossing;
})();
