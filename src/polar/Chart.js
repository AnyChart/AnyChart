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

  /**
   * Before invalidation handler for 'spreadValues'.
   * Invalidate marker series.
   */
  function invalidateMarkerSeries() {
    goog.array.forEach(this.seriesList, function (series) {
      if (series.getType() == anychart.enums.PolarSeriesType.MARKER) {
        series.invalidate(anychart.ConsistencyState.ALL);
      }
    });
  }

  anychart.core.settings.createDescriptorMeta(
    this.descriptorsMeta,
    'spreadValues',
    anychart.ConsistencyState.SERIES_CHART_SERIES,
    anychart.Signal.NEEDS_REDRAW,
    void 0,
    invalidateMarkerSeries,
    this
  );

  this.addThemes('polar');
};
goog.inherits(anychart.polarModule.Chart, anychart.radarPolarBaseModule.Chart);


/**
 * @type {!Object<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.polarModule.Chart.PROPERTY_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  anychart.core.settings.createDescriptor(map,
    anychart.enums.PropertyHandlerType.SINGLE_ARG,
    'spreadValues',
    anychart.enums.normalizePolarValueSpreadType
  );

  return map;
})();
anychart.core.settings.populate(anychart.polarModule.Chart, anychart.polarModule.Chart.PROPERTY_DESCRIPTORS);
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
  res[anychart.enums.PolarSeriesType.POLYLINE] = {
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
  res[anychart.enums.PolarSeriesType.RANGE_COLUMN] = {
    drawerType: anychart.enums.SeriesDrawerTypes.POLAR_RANGE_COLUMN,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_POINT,
    shapesConfig: [
      anychart.core.shapeManagers.pathFillStrokeConfig,
      anychart.core.shapeManagers.pathHatchConfig,

      anychart.core.shapeManagers.pathHighFillStrokeConfig,
      anychart.core.shapeManagers.pathLowFillStrokeConfig,
      anychart.core.shapeManagers.pathHighHatchConfig,
      anychart.core.shapeManagers.pathLowHatchConfig
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

/**
 * Creates map that contains info about points and points count.
 */
anychart.polarModule.Chart.prototype.calculateInfoAboutPoints_ = function() {
  this.resetInfoAboutPoints_();
  var spreadValues = this.getOption('spreadValues');

  if (spreadValues != anychart.enums.PolarValuesSpreadType.NONE) {
    goog.array.forEach(this.seriesList, function (series) {
      if (series.enabled() && series.getType() == anychart.enums.PolarSeriesType.MARKER) {
        var iterator = series.getResetIterator();
        var spreadAroundTick = spreadValues == anychart.enums.PolarValuesSpreadType.VALUE_50;

        while (iterator.advance()) {
          var x = iterator.get('x');
          var value = iterator.get('value');

          // Treat all points around tick as same.
          value = spreadAroundTick ? series.yScale().ticks().valueToClosestTick(value) : value;

          var pointData = this.pointsInfo_[x] && this.pointsInfo_[x][value];

          if (!pointData) {
            if (!this.pointsInfo_[x])
              this.pointsInfo_[x] = {};
            pointData = this.pointsInfo_[x][value] = {count: 0, alreadyProcessed: 0};
          }

          pointData.count++;
        }
      }
    }, this);
  }
};

/**
 * Reset points info.
 */
anychart.polarModule.Chart.prototype.resetInfoAboutPoints_ = function() {
  /**
   * Object that contains info about points of all chart marker series.
   *
   * For this data set
   * |    x    |  value |
   * |  dim_1  |   10   |
   * |  dim_1  |   10   |
   * |  dim_1  |   30   |
   * |  dim_2  |   20   |
   * |  dim_3  |   15   |
   * Object will contain
   * {
   *     dim_1: {
   *         10: {
   *             count: 2,
   *             alreadyProcessed:0
   *         },
   *         30: {
   *             count: 1,
   *             alreadyProcessed:0
   *         }
   *     },
   *     dim_2: {
   *         20: {
   *             count: 1,
   *             alreadyProcessed:0
   *         }
   *     },
   *     dim_3: {
   *         15: {
   *             count: 1,
   *             alreadyProcessed:0
   *         }
   *     }
   * }
   *
   * @type {Object}
   *
   * @private
   */
  this.pointsInfo_ = {};
};

/**
 * Returns count of point with same 'x' and same 'value'.
 *
 * @param {string|number} x
 * @param {number} value
 * @param {anychart.polarModule.Series} series - Series instance.
 *
 * @return {number}
 */
anychart.polarModule.Chart.prototype.getCountOfPointsWithSameValue = function(x, value, series) {
  var seriesType = series.getType();
  var seriesXScale = series.xScale();
  var seriesYScale = series.yScale();

  var xScaleType = seriesXScale.getType();

  var spreadValues = this.getOption('spreadValues');

  if (spreadValues == anychart.enums.PolarValuesSpreadType.NONE ||
      seriesType != anychart.enums.PolarSeriesType.MARKER ||
      xScaleType != anychart.enums.ScaleTypes.ORDINAL) {
    return 1;
  }

  value = spreadValues === anychart.enums.PolarValuesSpreadType.VALUE_50 ? seriesYScale.ticks().valueToClosestTick(value) : value;

  return this.pointsInfo_[x] && this.pointsInfo_[x][value].count;
};

/**
 * Returns count of point with same 'x' and same 'value' already processed.
 *
 * @param {string|number} x
 * @param {number} value
 * @param {anychart.polarModule.Series} series - Series instance.
 *
 * @return {number}
 */
anychart.polarModule.Chart.prototype.getCountOfProcessedPoints = function(x, value, series) {
  var seriesType = series.getType();
  var seriesXScale = series.xScale();
  var seriesYScale = series.yScale();

  var xScaleType = seriesXScale.getType();

  var spreadValues = this.getOption('spreadValues');

  if (spreadValues == anychart.enums.PolarValuesSpreadType.NONE ||
      seriesType != anychart.enums.PolarSeriesType.MARKER ||
      xScaleType != anychart.enums.ScaleTypes.ORDINAL) {
    return 1;
  }

  value = spreadValues === anychart.enums.PolarValuesSpreadType.VALUE_50 ? seriesYScale.ticks().valueToClosestTick(value) : value;

  return this.pointsInfo_[x] && ++this.pointsInfo_[x][value].alreadyProcessed;
};

/** @inheritDoc */
anychart.polarModule.Chart.prototype.calculate = function () {
  anychart.polarModule.Chart.base(this, 'calculate');
  this.calculateInfoAboutPoints_();
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
