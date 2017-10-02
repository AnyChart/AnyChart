goog.provide('anychart.polarModule.Chart');

goog.require('anychart.enums');
goog.require('anychart.polarModule.Axis');
goog.require('anychart.polarModule.Grid');
goog.require('anychart.polarModule.Series');
goog.require('anychart.radarPolarBaseModule.Chart');



/**
 * Polar chart class.<br/>
 * To get the chart use method {@link anychart.polar}.<br/>
 * Chart can contain any number of series.<br/>
 * Each series is interactive, you can customize click and hover behavior and other params.
 * @extends {anychart.radarPolarBaseModule.Chart}
 * @constructor
 */
anychart.polarModule.Chart = function() {
  anychart.polarModule.Chart.base(this, 'constructor', false);
};
goog.inherits(anychart.polarModule.Chart, anychart.radarPolarBaseModule.Chart);


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
anychart.polarModule.Chart.prototype.seriesConfig = (function() {
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
anychart.core.ChartWithSeries.generateSeriesConstructors(anychart.polarModule.Chart, anychart.polarModule.Chart.prototype.seriesConfig);


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
 * @return {boolean|anychart.polarModule.Chart}
 */
anychart.polarModule.Chart.prototype.sortPointsByX = function(opt_value) {
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
anychart.polarModule.Chart.prototype.getType = function() {
  return anychart.enums.ChartTypes.POLAR;
};


/** @inheritDoc */
anychart.polarModule.Chart.prototype.normalizeSeriesType = function(type) {
  return anychart.enums.normalizePolarSeriesType(type);
};


/** @inheritDoc */
anychart.polarModule.Chart.prototype.createGridInstance = function() {
  return new anychart.polarModule.Grid();
};


/** @inheritDoc */
anychart.polarModule.Chart.prototype.createXAxisInstance = function() {
  return new anychart.polarModule.Axis();
};


/** @inheritDoc */
anychart.polarModule.Chart.prototype.allowLegendCategoriesMode = function() {
  return false;
};


/**
 * @return {anychart.enums.ScaleTypes}
 */
anychart.polarModule.Chart.prototype.getXScaleDefaultType = function() {
  return anychart.enums.ScaleTypes.LINEAR;
};


/** @inheritDoc */
anychart.polarModule.Chart.prototype.createSeriesInstance = function(type, config) {
  return new anychart.polarModule.Series(this, this, type, config, false);
};


//endregion
//region --- Serialization / Deserialization
//------------------------------------------------------------------------------
//
//  Serialization / Deserialization
//
//------------------------------------------------------------------------------
/** @inheritDoc */
anychart.polarModule.Chart.prototype.setupByJSONWithScales = function(config, scalesInstances, opt_default) {
  anychart.polarModule.Chart.base(this, 'setupByJSONWithScales', config, scalesInstances, opt_default);
  this.sortPointsByX(config['sortPointsByX']);
};


/** @inheritDoc */
anychart.polarModule.Chart.prototype.serializeWithScales = function(json, scales, scaleIds) {
  anychart.polarModule.Chart.base(this, 'serializeWithScales', json, scales, scaleIds);
  json['sortPointsByX'] = this.sortPointsByX();
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
  var proto = anychart.polarModule.Chart.prototype;
  proto['getType'] = proto.getType;
  proto['sortPointsByX'] = proto.sortPointsByX;
  // auto generated from ChartWithOrthogonalScales
  // proto['barsPadding'] = proto.barsPadding;
  // proto['barGroupsPadding'] = proto.barGroupsPadding;
})();
//endregion
