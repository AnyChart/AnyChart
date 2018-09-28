goog.provide('anychart.radarModule.Chart');

goog.require('anychart.enums');
goog.require('anychart.radarModule.Axis');
goog.require('anychart.radarModule.Grid');
goog.require('anychart.radarPolarBaseModule.Chart');
goog.require('anychart.radarPolarBaseModule.Series');



/**
 * Radar chart class.<br/>
 * To get the chart use method {@link anychart.radar}.<br/>
 * Chart can contain any number of series.<br/>
 * Each series is interactive, you can customize click and hover behavior and other params.
 * @extends {anychart.radarPolarBaseModule.Chart}
 * @constructor
 */
anychart.radarModule.Chart = function() {
  anychart.radarModule.Chart.base(this, 'constructor', true);

  this.addThemes('radar');
};
goog.inherits(anychart.radarModule.Chart, anychart.radarPolarBaseModule.Chart);


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
anychart.radarModule.Chart.prototype.seriesConfig = (function() {
  var res = {};
  var capabilities = (
      anychart.core.series.Capabilities.ALLOW_INTERACTIVITY |
      anychart.core.series.Capabilities.ALLOW_POINT_SETTINGS |
      // anychart.core.series.Capabilities.ALLOW_ERROR |
      anychart.core.series.Capabilities.SUPPORTS_MARKERS |
      anychart.core.series.Capabilities.SUPPORTS_LABELS |
      0);
  res[anychart.enums.RadarSeriesType.AREA] = {
    drawerType: anychart.enums.SeriesDrawerTypes.AREA,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_SERIES,
    shapesConfig: [
      anychart.core.shapeManagers.pathStrokeConfig,
      anychart.core.shapeManagers.pathContiniousFallingStrokeConfig,
      anychart.core.shapeManagers.pathContiniousRisingStrokeConfig,
      anychart.core.shapeManagers.pathContiniousNegativeStrokeConfig,

      anychart.core.shapeManagers.pathFillConfig,
      anychart.core.shapeManagers.pathContiniousFallingFillConfig,
      anychart.core.shapeManagers.pathContiniousRisingFillConfig,
      anychart.core.shapeManagers.pathContiniousNegativeFillConfig,

      anychart.core.shapeManagers.pathHatchConfig,
      anychart.core.shapeManagers.pathFallingHatchConfig,
      anychart.core.shapeManagers.pathRisingHatchConfig,
      anychart.core.shapeManagers.pathNegativeHatchConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'value',
    anchoredPositionBottom: 'zero'
  };
  res[anychart.enums.RadarSeriesType.LINE] = {
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
  res[anychart.enums.RadarSeriesType.MARKER] = {
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
        // anychart.core.series.Capabilities.ALLOW_ERROR |
        // anychart.core.series.Capabilities.SUPPORTS_MARKERS |
        anychart.core.series.Capabilities.SUPPORTS_LABELS |
        0),
    anchoredPositionTop: 'value',
    anchoredPositionBottom: 'value'
  };
  return res;
})();
anychart.core.ChartWithSeries.generateSeriesConstructors(anychart.radarModule.Chart, anychart.radarModule.Chart.prototype.seriesConfig);


//endregion
//region --- Infrastructure overrides
//------------------------------------------------------------------------------
//
//  Infrastructure overrides
//
//------------------------------------------------------------------------------
/** @inheritDoc */
anychart.radarModule.Chart.prototype.getType = function() {
  return anychart.enums.ChartTypes.RADAR;
};


/** @inheritDoc */
anychart.radarModule.Chart.prototype.normalizeSeriesType = function(type) {
  return anychart.enums.normalizeRadarSeriesType(type);
};


/** @inheritDoc */
anychart.radarModule.Chart.prototype.createGridInstance = function() {
  return new anychart.radarModule.Grid();
};


/** @inheritDoc */
anychart.radarModule.Chart.prototype.createXAxisInstance = function() {
  return new anychart.radarModule.Axis();
};


/**
 * @return {anychart.scales.Base.ScaleTypes}
 */
anychart.radarModule.Chart.prototype.getXScaleAllowedTypes = function() {
  return anychart.scales.Base.ScaleTypes.ORDINAL;
};


/**
 * @return {Array}
 */
anychart.radarModule.Chart.prototype.getXScaleWrongTypeError = function() {
  return ['Radar chart X scale', 'ordinal'];
};


/**
 * @return {anychart.enums.ScaleTypes}
 */
anychart.radarModule.Chart.prototype.getYScaleDefaultType = function() {
  return anychart.enums.ScaleTypes.LINEAR;
};


/**
 * @return {anychart.scales.Base.ScaleTypes}
 */
anychart.radarModule.Chart.prototype.getYScaleAllowedTypes = function() {
  return anychart.scales.Base.ScaleTypes.ALL_DEFAULT;
};


/**
 * @return {Array}
 */
anychart.radarModule.Chart.prototype.getYScaleWrongTypeError = function() {
  return ['Chart scale', 'ordinal, linear, log, date-time'];
};


/** @inheritDoc */
anychart.radarModule.Chart.prototype.createSeriesInstance = function(type, config) {
  var result = new anychart.radarPolarBaseModule.Series(this, this, type, config, true);
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
  var proto = anychart.radarModule.Chart.prototype;
  proto['getType'] = proto.getType;
})();
//endregion
