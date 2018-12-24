goog.provide('anychart.cartesianModule.Chart');
goog.require('anychart.core.CartesianBase');
goog.require('anychart.core.series');
goog.require('anychart.core.settings');
goog.require('anychart.core.shapeManagers');
goog.require('anychart.enums');



/**
 * Cartesian chart class.<br/>
 * To get the chart use any of these methods:
 *  <ul>
 *      <li>{@link anychart.cartesian}</li>
 *      <li>{@link anychart.area}</li>
 *      <li>{@link anychart.bar}</li>
 *      <li>{@link anychart.column}</li>
 *      <li>{@link anychart.financial}</li>
 *      <li>{@link anychart.line}</li>
 *  </ul>
 * Chart can contain any number of series.
 * Each series is interactive, you can customize click and hover behavior and other params.
 * @extends {anychart.core.CartesianBase}
 * @constructor
 */
anychart.cartesianModule.Chart = function() {
  anychart.cartesianModule.Chart.base(this, 'constructor');

  this.addThemes('cartesian');

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['categorizedBySeries', anychart.ConsistencyState.SCALE_CHART_SCALES | anychart.ConsistencyState.SCALE_CHART_Y_SCALES, anychart.Signal.NEEDS_REDRAW]
  ]);

  this.setType(anychart.enums.ChartTypes.CARTESIAN);
};
goog.inherits(anychart.cartesianModule.Chart, anychart.core.CartesianBase);


/**
 * Series config for Cartesian chart.
 * @type {!Object.<string, anychart.core.series.TypeConfig>}
 */
anychart.cartesianModule.Chart.prototype.seriesConfig = (function() {
  var res = {};
  var capabilities = (
      anychart.core.series.Capabilities.ALLOW_INTERACTIVITY |
      anychart.core.series.Capabilities.ALLOW_POINT_SETTINGS |
      anychart.core.series.Capabilities.ALLOW_ERROR |
      anychart.core.series.Capabilities.SUPPORTS_MARKERS |
      anychart.core.series.Capabilities.SUPPORTS_LABELS |
      0);
  res[anychart.enums.CartesianSeriesType.AREA] = {
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
  res[anychart.enums.CartesianSeriesType.BAR] = {
    drawerType: anychart.enums.SeriesDrawerTypes.COLUMN,
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
    capabilities: capabilities,
    anchoredPositionTop: 'value',
    anchoredPositionBottom: 'zero'
  };
  res[anychart.enums.CartesianSeriesType.BOX] = {
    drawerType: anychart.enums.SeriesDrawerTypes.BOX,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_POINT,
    shapesConfig: [
      anychart.core.shapeManagers.pathFillStrokeConfig,
      anychart.core.shapeManagers.pathHatchConfig,
      anychart.core.shapeManagers.pathMedianStrokeConfig,
      anychart.core.shapeManagers.pathStemStrokeConfig,
      anychart.core.shapeManagers.pathWhiskerStrokeConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'highest',
    anchoredPositionBottom: 'lowest'
  };
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
  res[anychart.enums.CartesianSeriesType.CANDLESTICK] = {
    drawerType: anychart.enums.SeriesDrawerTypes.CANDLESTICK,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_POINT,
    shapesConfig: [
      anychart.core.shapeManagers.pathRisingFillStrokeConfig,
      anychart.core.shapeManagers.pathRisingHatchConfig,
      anychart.core.shapeManagers.pathFallingFillStrokeConfig,
      anychart.core.shapeManagers.pathFallingHatchConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'high',
    anchoredPositionBottom: 'low'
  };
  res[anychart.enums.CartesianSeriesType.COLUMN] = {
    drawerType: anychart.enums.SeriesDrawerTypes.COLUMN,
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
    capabilities: capabilities,
    anchoredPositionTop: 'value',
    anchoredPositionBottom: 'zero'
  };
  res[anychart.enums.CartesianSeriesType.JUMP_LINE] = {
    drawerType: anychart.enums.SeriesDrawerTypes.JUMP_LINE,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_POINT,
    shapesConfig: [
      anychart.core.shapeManagers.pathStrokeConfig,
      anychart.core.shapeManagers.pathFallingStrokeConfig,
      anychart.core.shapeManagers.pathRisingStrokeConfig,
      anychart.core.shapeManagers.pathNegativeStrokeConfig
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
  res[anychart.enums.CartesianSeriesType.OHLC] = {
    drawerType: anychart.enums.SeriesDrawerTypes.OHLC,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_POINT,
    shapesConfig: [
      anychart.core.shapeManagers.pathRisingStrokeConfig,
      anychart.core.shapeManagers.pathFallingStrokeConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'high',
    anchoredPositionBottom: 'low'
  };
  res[anychart.enums.CartesianSeriesType.RANGE_AREA] = {
    drawerType: anychart.enums.SeriesDrawerTypes.RANGE_AREA,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_SERIES,
    shapesConfig: [
      anychart.core.shapeManagers.pathFillConfig,
      anychart.core.shapeManagers.pathLowStrokeConfig,
      anychart.core.shapeManagers.pathHighStrokeConfig,
      anychart.core.shapeManagers.pathHatchConfig,

      anychart.core.shapeManagers.pathHighFillConfig,
      anychart.core.shapeManagers.pathLowFillConfig,
      anychart.core.shapeManagers.pathHighHatchConfig,
      anychart.core.shapeManagers.pathLowHatchConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'high',
    anchoredPositionBottom: 'low'
  };
  res[anychart.enums.CartesianSeriesType.RANGE_BAR] = {
    drawerType: anychart.enums.SeriesDrawerTypes.RANGE_COLUMN,
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
  res[anychart.enums.CartesianSeriesType.RANGE_COLUMN] = {
    drawerType: anychart.enums.SeriesDrawerTypes.RANGE_COLUMN,
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
  res[anychart.enums.CartesianSeriesType.RANGE_SPLINE_AREA] = {
    drawerType: anychart.enums.SeriesDrawerTypes.RANGE_SPLINE_AREA,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_SERIES,
    shapesConfig: [
      anychart.core.shapeManagers.pathFillConfig,
      anychart.core.shapeManagers.pathHighStrokeConfig,
      anychart.core.shapeManagers.pathLowStrokeConfig,
      anychart.core.shapeManagers.pathHatchConfig,

      anychart.core.shapeManagers.pathHighFillConfig,
      anychart.core.shapeManagers.pathLowFillConfig,
      anychart.core.shapeManagers.pathHighHatchConfig,
      anychart.core.shapeManagers.pathLowHatchConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'high',
    anchoredPositionBottom: 'low'
  };
  res[anychart.enums.CartesianSeriesType.RANGE_STEP_AREA] = {
    drawerType: anychart.enums.SeriesDrawerTypes.RANGE_STEP_AREA,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_SERIES,
    shapesConfig: [
      anychart.core.shapeManagers.pathFillConfig,
      anychart.core.shapeManagers.pathHatchConfig,
      // anychart.core.shapeManagers.pathHighFillConfig,
      // anychart.core.shapeManagers.pathLowFillConfig,
      anychart.core.shapeManagers.pathHighStrokeConfig,
      anychart.core.shapeManagers.pathLowStrokeConfig
      // anychart.core.shapeManagers.pathHighHatchConfig,
      // anychart.core.shapeManagers.pathLowHatchConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'high',
    anchoredPositionBottom: 'low'
  };
  res[anychart.enums.CartesianSeriesType.SPLINE] = {
    drawerType: anychart.enums.SeriesDrawerTypes.SPLINE,
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
  res[anychart.enums.CartesianSeriesType.SPLINE_AREA] = {
    drawerType: anychart.enums.SeriesDrawerTypes.SPLINE_AREA,
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
  res[anychart.enums.CartesianSeriesType.STEP_AREA] = {
    drawerType: anychart.enums.SeriesDrawerTypes.STEP_AREA,
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
  res[anychart.enums.CartesianSeriesType.STEP_LINE] = {
    drawerType: anychart.enums.SeriesDrawerTypes.STEP_LINE,
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
  res[anychart.enums.CartesianSeriesType.STICK] = {
    drawerType: anychart.enums.SeriesDrawerTypes.STICK,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_POINT,
    shapesConfig: [
      anychart.core.shapeManagers.pathStrokeConfig,
      anychart.core.shapeManagers.pathFallingStrokeConfig,
      anychart.core.shapeManagers.pathRisingStrokeConfig,
      anychart.core.shapeManagers.pathNegativeStrokeConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'value',
    anchoredPositionBottom: 'zero'
  };
  res[anychart.enums.CartesianSeriesType.HILO] = {
    drawerType: anychart.enums.SeriesDrawerTypes.RANGE_STICK,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_POINT,
    shapesConfig: [
      anychart.core.shapeManagers.pathStrokeConfig,

      anychart.core.shapeManagers.pathHighStrokeConfig,
      anychart.core.shapeManagers.pathLowStrokeConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'high',
    anchoredPositionBottom: 'low'
  };
  return res;
})();
anychart.core.ChartWithSeries.generateSeriesConstructors(anychart.cartesianModule.Chart, anychart.cartesianModule.Chart.prototype.seriesConfig);


//region --- No Data
/** @inheritDoc */
anychart.cartesianModule.Chart.prototype.isSeriesVisible = function(series) {
  var enabled = /** @type {boolean} */(series.enabled());
  var excluded = series.getExcludedIndexesInternal();
  var visible = true;
  var rowsCount = series.data() ? series.data().getRowsCount() : 0;
  if (!rowsCount || (rowsCount == excluded.length))
    visible = false;
  return (enabled && visible);
};


//endregion
//region --- Categorization By Series
/** @inheritDoc */
anychart.cartesianModule.Chart.prototype.autoCalcOrdinalXScale = function(xScale, drawingPlans, hasExcludes, excludesMap) {
  if (!this.getOption('categorizedBySeries')) {
    anychart.cartesianModule.Chart.base(this, 'autoCalcOrdinalXScale', xScale, drawingPlans, hasExcludes, excludesMap);
  } else {
    var i;
    var len = drawingPlans.length;

    var xArray = [];
    var xHashMap = {};

    for (i = 0; i < len; i++) {
      var plan = drawingPlans[i];
      var x = plan.series.name();
      xArray.push(x);

      var xHash = anychart.utils.hash(x);
      xHashMap[xHash] = i;
    }

    xScale.setAutoValues(xHashMap, xArray);
  }
};


/** @inheritDoc */
anychart.cartesianModule.Chart.prototype.finishOrdinalXScaleCalculation = function(xScale, drawingPlans) {
  if (!this.getOption('categorizedBySeries')) {
    anychart.cartesianModule.Chart.base(this, 'finishOrdinalXScaleCalculation', xScale, drawingPlans);
  }
};


//endregion
//region --- Descriptors
/**
 * Properties that should be defined in class prototype.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.cartesianModule.Chart.OWN_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'categorizedBySeries', anychart.core.settings.booleanNormalizer]
  ]);

  return map;
})();
anychart.core.settings.populate(anychart.cartesianModule.Chart, anychart.cartesianModule.Chart.OWN_DESCRIPTORS);


//endregion
//region --- Serialize / Setup / Dispose
/** @inheritDoc */
anychart.cartesianModule.Chart.prototype.serialize = function() {
  var json = anychart.cartesianModule.Chart.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.cartesianModule.Chart.OWN_DESCRIPTORS, json['chart']);
  return json;
};


/** @inheritDoc */
anychart.cartesianModule.Chart.prototype.setupByJSON = function(config, opt_default) {
  anychart.cartesianModule.Chart.base(this, 'setupByJSON', config, opt_default);
  anychart.core.settings.deserialize(this, anychart.cartesianModule.Chart.OWN_DESCRIPTORS, config);
};


//endregion


/**
 * Returns a chart instance with initial settings (no axes, grids, titles, legend and so on).<br/>
 * <b>Note:</b> To get a chart with initial settings use:
 *  <ul>
 *      <li>{@link anychart.area}</li>
 *      <li>{@link anychart.bar}</li>
 *      <li>{@link anychart.column}</li>
 *      <li>{@link anychart.financial}</li>
 *      <li>{@link anychart.line}</li>
 *  </ul>
 * @example
 * var chart = anychart.cartesian();
 * chart.line([20, 7, 10, 14]);
 * @return {!anychart.cartesianModule.Chart} Empty chart.
 */
anychart.cartesian = function() {
  var chart = new anychart.cartesianModule.Chart();
  chart.setOption('defaultSeriesType', anychart.enums.CartesianSeriesType.LINE);
  chart.setupStateSettings();
  chart.setupAxes();
  return chart;
};


anychart.chartTypesMap[anychart.enums.ChartTypes.CARTESIAN] = anychart.cartesian;


//exports
(function() {
  var proto = anychart.cartesianModule.Chart.prototype;
  goog.exportSymbol('anychart.cartesian', anychart.cartesian);
  proto['xScale'] = proto.xScale;
  proto['yScale'] = proto.yScale;
  // auto generated from ChartWithOrthogonalScales
  // proto['barsPadding'] = proto.barsPadding;
  // proto['barGroupsPadding'] = proto.barGroupsPadding;
  proto['crosshair'] = proto.crosshair;
  proto['xGrid'] = proto.xGrid;
  proto['yGrid'] = proto.yGrid;
  proto['xMinorGrid'] = proto.xMinorGrid;
  proto['yMinorGrid'] = proto.yMinorGrid;
  proto['xAxis'] = proto.xAxis;
  proto['getXAxesCount'] = proto.getXAxesCount;
  proto['yAxis'] = proto.yAxis;
  proto['getYAxesCount'] = proto.getYAxesCount;
  proto['getSeries'] = proto.getSeries;
  // generated automatically
  // proto['area'] = proto.area;
  // proto['bar'] = proto.bar;
  // proto['box'] = proto.box;
  // proto['bubble'] = proto.bubble;
  // proto['candlestick'] = proto.candlestick;
  // proto['column'] = proto.column;
  // proto['line'] = proto.line;
  // proto['marker'] = proto.marker;
  // proto['ohlc'] = proto.ohlc;
  // proto['rangeArea'] = proto.rangeArea;
  // proto['rangeBar'] = proto.rangeBar;
  // proto['rangeColumn'] = proto.rangeColumn;
  // proto['rangeSplineArea'] = proto.rangeSplineArea;
  // proto['rangeStepArea'] = proto.rangeStepArea;
  // proto['spline'] = proto.spline;
  // proto['splineArea'] = proto.splineArea;
  // proto['stepLine'] = proto.stepLine;
  // proto['stepArea'] = proto.stepArea;
  // proto['stick'] = proto.stick;
  // proto['jumpLine'] = proto.jumpLine;
  // proto['hilo'] = proto.hilo;
  proto['lineMarker'] = proto.lineMarker;
  proto['rangeMarker'] = proto.rangeMarker;
  proto['textMarker'] = proto.textMarker;
  proto['palette'] = proto.palette;
  proto['markerPalette'] = proto.markerPalette;
  proto['hatchFillPalette'] = proto.hatchFillPalette;
  proto['getType'] = proto.getType;
  // auto from ChartWithSeries
  // proto['defaultSeriesType'] = proto.defaultSeriesType;
  // proto['maxBubbleSize'] = proto.maxBubbleSize;
  // proto['minBubbleSize'] = proto.minBubbleSize;
  proto['addSeries'] = proto.addSeries;
  proto['getSeriesAt'] = proto.getSeriesAt;
  proto['getSeriesCount'] = proto.getSeriesCount;
  proto['removeSeries'] = proto.removeSeries;
  proto['removeSeriesAt'] = proto.removeSeriesAt;
  proto['removeAllSeries'] = proto.removeAllSeries;
  proto['getPlotBounds'] = proto.getPlotBounds;
  proto['xZoom'] = proto.xZoom;
  proto['yZoom'] = proto.yZoom;
  proto['xScroller'] = proto.xScroller;
  proto['yScroller'] = proto.yScroller;
  // auto form CartesianBase
  // proto['zAspect'] = proto.zAspect;
  // proto['zAngle'] = proto.zAngle;
  // proto['zDistribution'] = proto.zDistribution;
  // proto['zPadding'] = proto.zPadding;
  // auto
  // proto['categorizedBySeries'] = proto.categorizedBySeries;
  proto['getStat'] = proto.getStat;
  proto['annotations'] = proto.annotations;
  proto['getXScales'] = proto.getXScales;
  proto['getYScales'] = proto.getYScales;
})();
