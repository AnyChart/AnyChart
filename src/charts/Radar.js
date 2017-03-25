goog.provide('anychart.charts.Radar');

goog.require('anychart.core.RadarPolarChart');
goog.require('anychart.core.axes.Radar');
goog.require('anychart.core.grids.Radar');
goog.require('anychart.core.series.Radar');
goog.require('anychart.enums');



/**
 * Radar chart class.<br/>
 * To get the chart use method {@link anychart.radar}.<br/>
 * Chart can contain any number of series.<br/>
 * Each series is interactive, you can customize click and hover behavior and other params.
 * @extends {anychart.core.RadarPolarChart}
 * @constructor
 */
anychart.charts.Radar = function() {
  anychart.charts.Radar.base(this, 'constructor', true);
};
goog.inherits(anychart.charts.Radar, anychart.core.RadarPolarChart);


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
anychart.charts.Radar.prototype.seriesConfig = (function() {
  var res = {};
  var capabilities = (
      anychart.core.series.Capabilities.ALLOW_INTERACTIVITY |
      anychart.core.series.Capabilities.ALLOW_POINT_SETTINGS |
      // anychart.core.series.Capabilities.ALLOW_ERROR |
      anychart.core.series.Capabilities.SUPPORTS_MARKERS |
      anychart.core.series.Capabilities.SUPPORTS_LABELS |
      0);
  res[anychart.enums.CartesianSeriesType.AREA] = {
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
        // anychart.core.series.Capabilities.ALLOW_ERROR |
        // anychart.core.series.Capabilities.SUPPORTS_MARKERS |
        anychart.core.series.Capabilities.SUPPORTS_LABELS |
        0),
    anchoredPositionTop: 'value',
    anchoredPositionBottom: 'value'
  };
  return res;
})();
anychart.core.ChartWithSeries.generateSeriesConstructors(anychart.charts.Radar, anychart.charts.Radar.prototype.seriesConfig);


//endregion
//region --- Infrastructure overrides
//------------------------------------------------------------------------------
//
//  Infrastructure overrides
//
//------------------------------------------------------------------------------
/** @inheritDoc */
anychart.charts.Radar.prototype.getType = function() {
  return anychart.enums.ChartTypes.RADAR;
};


/** @inheritDoc */
anychart.charts.Radar.prototype.normalizeSeriesType = function(type) {
  return anychart.enums.normalizeRadarSeriesType(type);
};


/** @inheritDoc */
anychart.charts.Radar.prototype.createGridInstance = function() {
  return new anychart.core.grids.Radar();
};


/** @inheritDoc */
anychart.charts.Radar.prototype.createXAxisInstance = function() {
  return new anychart.core.axes.Radar();
};


/** @inheritDoc */
anychart.charts.Radar.prototype.checkXScaleType = function(scale) {
  var res = (scale instanceof anychart.scales.Ordinal);
  if (!res)
    anychart.core.reporting.error(anychart.enums.ErrorCode.INCORRECT_SCALE_TYPE, undefined, ['Radar chart X scale', 'ordinal']);
  return res;
};


/** @inheritDoc */
anychart.charts.Radar.prototype.checkYScaleType = function(scale) {
  return scale instanceof anychart.scales.Base;
};


/** @inheritDoc */
anychart.charts.Radar.prototype.createScaleByType = function(value, isXScale, returnNullOnError) {
  if (isXScale) {
    value = String(value).toLowerCase();
    return (returnNullOnError && value != 'ordinal' && value != 'ord' && value != 'discrete') ?
        null :
        anychart.scales.ordinal();
  }
  return anychart.scales.Base.fromString(value, false);
};


/** @inheritDoc */
anychart.charts.Radar.prototype.createSeriesInstance = function(type, config) {
  var result = new anychart.core.series.Radar(this, this, type, config, true);
  result.setOption('closed', true);
  return result;
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
  var proto = anychart.charts.Radar.prototype;
  proto['getType'] = proto.getType;
})();
//endregion
