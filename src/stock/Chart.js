goog.provide('anychart.stockModule.Chart');

goog.require('anychart.colorScalesModule.Ordinal');
goog.require('anychart.core.Chart');
goog.require('anychart.core.IChart');
goog.require('anychart.core.IChartWithAnnotations');
goog.require('anychart.core.IGroupingProvider');
goog.require('anychart.core.reporting');
goog.require('anychart.core.settings');
goog.require('anychart.core.ui.Crosshair');
goog.require('anychart.core.ui.Tooltip');
goog.require('anychart.enums');
goog.require('anychart.stockModule.Controller');
goog.require('anychart.stockModule.Interactivity');
goog.require('anychart.stockModule.Plot');
goog.require('anychart.stockModule.Scroller');
goog.require('anychart.stockModule.data.DummyTable');
goog.require('anychart.stockModule.eventMarkers.ChartController');
goog.require('anychart.stockModule.scales.IKeyIndexTransformer');
goog.require('anychart.stockModule.scales.Ordinal');
goog.require('anychart.stockModule.scales.Scatter');
goog.require('anychart.stockModule.splitter.Controller');
goog.require('anychart.stockModule.splitter.SplittersSettings');

goog.require('anychart.utils');
goog.require('goog.array');
goog.require('goog.events.MouseWheelHandler');



/**
 * Stock chart class.
 * @constructor
 * @extends {anychart.core.Chart}
 * @implements {anychart.core.IChart}
 * @implements {anychart.core.IChartWithAnnotations}
 * @implements {anychart.core.IGroupingProvider}
 * @implements {anychart.stockModule.scales.IKeyIndexTransformer}
 * @param {boolean=} opt_allowPointSettings Allows to set point settings from data.
 */
anychart.stockModule.Chart = function(opt_allowPointSettings) {
  anychart.stockModule.Chart.base(this, 'constructor');

  this.addThemes('stock');

  /**
   * Chart plots array.
   * @type {Array.<anychart.stockModule.Plot>}
   * @private
   */
  this.plots_ = [];

  /**
   * Chart scroller.
   * @type {anychart.stockModule.Scroller}
   * @private
   */
  this.scroller_ = null;

  /**
   * Stock data controller.
   * @type {!anychart.stockModule.Controller}
   * @private
   */
  this.dataController_ = new anychart.stockModule.Controller();
  this.dataController_.listenSignals(this.dataControllerInvalidated_, this);

  /**
   * @type {boolean}
   * @private
   */
  this.preserveSelectedRangeOnDataUpdate_ = false;

  /**
   * Common X scale of all series of the chart.
   * @type {anychart.stockModule.scales.Scatter}
   * @private
   */
  this.xScale_ = null;

  /**
   * If the chart is currently in highlighted state.
   * @type {boolean}
   * @private
   */
  this.highlighted_ = false;

  /**
   * If the highlight is currently prevented.
   * @type {boolean}
   * @private
   */
  this.highlightPrevented_ = false;

  /**
   * Last highlighted X-ratio.
   * @type {number}
   * @private
   */
  this.highlightedRatio_ = NaN;


  /**
   * Last highlighted Y-ratio.
   * @type {number}
   * @private
   */
  this.highlightedYRatio_ = NaN;

  /**
   * Last highlighted clientX.
   * @type {number}
   * @private
   */
  this.highlightedClientX_ = NaN;

  /**
   * Last highlighted clientY.
   * @type {number}
   * @private
   */
  this.highlightedClientY_ = NaN;

  /**
   * Minimum plot width.
   * @type {number}
   * @private
   */
  this.minPlotsDrawingWidth_ = NaN;

  /**
   * Annotations controller.
   * @type {anychart.annotationsModule.ChartController}
   * @private
   */
  this.annotations_ = null;

  /**
   * Event markers chart-level controller.
   * @type {anychart.stockModule.eventMarkers.ChartController}
   * @private
   */
  this.eventMarkers_ = null;

  /**
   * Annotations module exports, if it is included. Also used in Plots.
   * @type {{ChartController:Function, PlotController:Function}|undefined}
   */
  this.annotationsModule = anychart.window['anychart']['annotations'];

  /**
   * Default annotation settings.
   * @type {Object}
   * @private
   */
  this.defaultAnnotationSettings_ = {};

  /**
   * Mouse wheel handler.
   * @type {goog.events.MouseWheelHandler}
   * @private
   */
  this.mouseWheelHandler_ = null;

  /**
   * Mouse wheel scroll action.
   * @type {function()}
   * @private
   */
  this.mwScrollAction_ = goog.bind(this.doMWScroll_, this);

  /**
   * Mouse wheel zoom action.
   * @type {function()}
   * @private
   */
  this.mwZoomAction_ = goog.bind(this.doMWZoom_, this);

  /**
   * Index of first plot.
   * @type {number}
   * @private
   */
  this.firstPlotIndex_ = Infinity;

  /**
   * Index of last plot.
   * @type {number}
   * @private
   */
  this.lastPlotIndex_ = -1;

  /**
   * Whether stock series should use PER_POINT shape manager (discrete style of point drawing).
   * @type {boolean}
   * @private
   */
  this.allowPointSettings_ = !!opt_allowPointSettings;

  /**
   * Series config.
   * @type {Object.<string, anychart.core.series.TypeConfig>}
   */
  this.seriesConfig = this.createSeriesConfig(this.allowPointSettings_);

  /**
   *
   * @type {anychart.stockModule.data.DummyTable}
   * @private
   */
  this.dummyTable_ = null;

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['plotsManualBounds', anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.STOCK_PLOTS_APPEARANCE,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['zoomMarqueeFill', 0, 0],
    ['zoomMarqueeStroke', 0, 0]
  ]);

  this.markConsistent(anychart.ConsistencyState.STOCK_GAP);
};
goog.inherits(anychart.stockModule.Chart, anychart.core.Chart);


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.stockModule.Chart.prototype.SUPPORTED_SIGNALS = anychart.core.Chart.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.stockModule.Chart.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.Chart.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.STOCK_PLOTS_APPEARANCE |
    anychart.ConsistencyState.STOCK_SCROLLER |
    anychart.ConsistencyState.STOCK_DATA |
    anychart.ConsistencyState.STOCK_SCALES |
    anychart.ConsistencyState.STOCK_SPLITTERS |
    anychart.ConsistencyState.STOCK_GAP;


/**
 * Minimal ratio between marked range and the full range.
 * @const {number}
 */
anychart.stockModule.Chart.MINIMAL_MARQUEE_ZOOM_RANGE_RATIO = 0.05;


/**
 * Minimal marquee pixel width to make a selection.
 * @const {number}
 */
anychart.stockModule.Chart.MINIMAL_MARQUEE_ZOOM_PIXEL_WIDTH = 5;


/**
 * Zoom factor per 1 mouse wheel line.
 * @const {number}
 */
anychart.stockModule.Chart.ZOOM_FACTOR_PER_WHEEL_STEP = 0.05 / 4;


/**
 * Scroll factor per 1 mouse wheel line.
 * @const {number}
 */
anychart.stockModule.Chart.SCROLL_FACTOR_PER_WHEEL_STEP = 0.1 / 4;


/**
 * Max mouse wheel delta.
 * @const {number}
 */
anychart.stockModule.Chart.MOUSE_WHEEL_MAX_DELTA = 21;


/**
 * Hashmap which shows whether point settings allowed for stock series.
 *   true  means always allowed (always PER_POINT)
 *   false means always disallowed (always PER_SERIES)
 *   null  means depended on allowPointSettings flag (if not set for series - chart flag is used)
 * @type {Object.<string, boolean>}
 */
anychart.stockModule.Chart.ALLOWED_POINT_SETTINGS = {
  'area': false,
  'candlestick': null,
  'column': null,
  'jump-line': true,
  'stick': true,
  'line': false,
  'marker': null,
  'ohlc': null,
  'range-area': false,
  'range-column': null,
  'range-spline-area': false,
  'range-step-area': false,
  'spline': false,
  'spline-area': false,
  'step-area': false,
  'step-line': false,
  'hilo': true
};


/** @inheritDoc */
anychart.stockModule.Chart.prototype.supportsBaseHighlight = function() {
  return false;
};


//region Chart type and series types
//----------------------------------------------------------------------------------------------------------------------
//
//  Chart type and series types
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.stockModule.Chart.prototype.getType = function() {
  return anychart.enums.ChartTypes.STOCK;
};


/**
 * Creates series config for the chart.
 * @param {boolean} allowPointSettings
 * @return {Object.<string, anychart.core.series.TypeConfig>}
 */
anychart.stockModule.Chart.prototype.createSeriesConfig = function(allowPointSettings) {
  var res = {};
  var capabilities = (
      // anychart.core.series.Capabilities.ALLOW_INTERACTIVITY |
      // anychart.core.series.Capabilities.ALLOW_POINT_SETTINGS |
      // anychart.core.series.Capabilities.ALLOW_ERROR |
      anychart.core.series.Capabilities.SUPPORTS_MARKERS |
      anychart.core.series.Capabilities.SUPPORTS_LABELS |
      0);
  capabilities |= (allowPointSettings && anychart.core.series.Capabilities.ALLOW_POINT_SETTINGS);
  var discreteShapeManager = allowPointSettings ? anychart.enums.ShapeManagerTypes.PER_POINT : anychart.enums.ShapeManagerTypes.PER_SERIES;
  res[anychart.enums.StockSeriesType.AREA] = {
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
  res[anychart.enums.StockSeriesType.CANDLESTICK] = {
    drawerType: anychart.enums.SeriesDrawerTypes.CANDLESTICK,
    shapeManagerType: discreteShapeManager,
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
  res[anychart.enums.StockSeriesType.COLUMN] = {
    drawerType: anychart.enums.SeriesDrawerTypes.COLUMN,
    shapeManagerType: discreteShapeManager,
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
  res[anychart.enums.StockSeriesType.JUMP_LINE] = {
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
  res[anychart.enums.StockSeriesType.STICK] = {
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
  res[anychart.enums.StockSeriesType.LINE] = {
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
  res[anychart.enums.StockSeriesType.MARKER] = {
    drawerType: anychart.enums.SeriesDrawerTypes.MARKER,
    shapeManagerType: discreteShapeManager,
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
    anchoredPositionBottom: 'value'
  };
  res[anychart.enums.StockSeriesType.OHLC] = {
    drawerType: anychart.enums.SeriesDrawerTypes.OHLC,
    shapeManagerType: discreteShapeManager,
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
  res[anychart.enums.StockSeriesType.RANGE_AREA] = {
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
  res[anychart.enums.StockSeriesType.RANGE_COLUMN] = {
    drawerType: anychart.enums.SeriesDrawerTypes.RANGE_COLUMN,
    shapeManagerType: discreteShapeManager,
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
  res[anychart.enums.StockSeriesType.RANGE_SPLINE_AREA] = {
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
  res[anychart.enums.StockSeriesType.RANGE_STEP_AREA] = {
    drawerType: anychart.enums.SeriesDrawerTypes.RANGE_STEP_AREA,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_SERIES,
    shapesConfig: [
      anychart.core.shapeManagers.pathFillConfig,
      anychart.core.shapeManagers.pathHighStrokeConfig,
      anychart.core.shapeManagers.pathLowStrokeConfig,
      anychart.core.shapeManagers.pathHatchConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'high',
    anchoredPositionBottom: 'low'
  };
  res[anychart.enums.StockSeriesType.SPLINE] = {
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
  res[anychart.enums.StockSeriesType.SPLINE_AREA] = {
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
  res[anychart.enums.StockSeriesType.STEP_AREA] = {
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
  res[anychart.enums.StockSeriesType.STEP_LINE] = {
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
  res[anychart.enums.StockSeriesType.HILO] = {
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
};


/** @inheritDoc */
anychart.stockModule.Chart.prototype.getVersionHistoryLink = function() {
  return 'https://anychart.com/products/anystock/history';
};


/** @override */
anychart.stockModule.Chart.prototype.getAllSeries = function() {
  var series = [];
  for (var i = 0; i < this.plots_.length; i++) {
    var plot = this.plots_[i];
    if (plot) {
      series.push.apply(series, plot.getAllSeries());
    }
  }
  return series;
};


/**
 * Returns normalized series type and a config for this series type.
 * @param {string} type
 * @return {?Array.<string|anychart.core.series.TypeConfig>}
 */
anychart.stockModule.Chart.prototype.getConfigByType = function(type) {
  type = anychart.enums.normalizeStockSeriesType(type);
  var config = this.seriesConfig[type];
  var res;
  if (config && (config.drawerType in anychart.core.drawers.AvailableDrawers)) {
    res = [type, config];
  } else {
    anychart.core.reporting.error(anychart.enums.ErrorCode.NO_FEATURE_IN_MODULE, null, [type + ' series']);
    res = null;
  }
  return res;
};


/**
 * @return {boolean}
 */
anychart.stockModule.Chart.prototype.isVertical = function() {
  return false;
};


//endregion
//region Public getter/setters and methods
//----------------------------------------------------------------------------------------------------------------------
//
//  Public getter/setters and methods
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @inheritDoc
 * TODO (A.Kudryavtsev): statistics calculations TBA.
 */
anychart.stockModule.Chart.prototype.calculate = goog.nullFunction;


/**
 * ALSO A DUMMY. Redeclared to show another error text.
 * @ignoreDoc
 * @param {(Object|boolean|null)=} opt_value Legend settings.
 * @return {anychart.core.Chart|anychart.core.ui.Legend} Chart legend instance of itself for chaining call.
 */
anychart.stockModule.Chart.prototype.legend = function(opt_value) {
  anychart.core.reporting.error(anychart.enums.ErrorCode.NO_LEGEND_IN_STOCK);
  return goog.isDef(opt_value) ? this : null;
};


/**
 * Plots getter/setter.
 * @param {(Object|boolean|null|number)=} opt_indexOrValue
 * @param {(Object|boolean|null)=} opt_value
 * @return {!(anychart.stockModule.Plot|anychart.stockModule.Chart)}
 */
anychart.stockModule.Chart.prototype.plot = function(opt_indexOrValue, opt_value) {
  return this.plotInternal(opt_indexOrValue, opt_value, !goog.isDef(opt_value));
};


/**
 * Plots internal getter/setter. Considers theme settings.
 * @param {(Object|boolean|null|number)=} opt_indexOrValue
 * @param {(Object|boolean|null)=} opt_value
 * @param {boolean=} opt_default - .
 * @return {!(anychart.stockModule.Plot|anychart.stockModule.Chart)}
 */
anychart.stockModule.Chart.prototype.plotInternal = function(opt_indexOrValue, opt_value, opt_default) {
  var index, value;
  index = anychart.utils.toNumber(opt_indexOrValue);
  if (isNaN(index)) {
    index = 0;
    value = opt_indexOrValue;
  } else {
    index = /** @type {number} */(opt_indexOrValue);
    value = opt_value;
  }
  var plot = this.plots_[index];
  if (!plot) {
    var existingPlots = this.getEnabledPlots();
    var weightsSum = 0;
    if (existingPlots.length) {
      for (var i = 0; i < existingPlots.length; i++) {
        var existingPlot = existingPlots[i];
        var w = existingPlot.getOption('weight');
        if (w)
          weightsSum += w;
      }
    }

    //NOTE: plot.crosshair().interactivityTarget() is not set because stock chart controls crosshair itself.
    plot = new anychart.stockModule.Plot(this);
    plot.addThemes('stock.defaultPlotSettings', this.defaultPlotSettings());
    plot.crosshair().parent(/** @type {anychart.core.ui.Crosshair} */ (this.crosshair()));
    plot.setupElements(true);
    plot.setParentEventTarget(this);
    if (weightsSum)
      plot.setOption('weight', weightsSum / existingPlots.length); //existingPlots.length is not zero if weightsSum is not zero.

    this.plots_[index] = plot;
    plot.listenSignals(this.plotInvalidated_, this);
    if (index > this.lastPlotIndex_) {
      var prevPlot = this.plots_[this.lastPlotIndex_];
      if (prevPlot)
        prevPlot.isLastPlot(false);
      plot.isLastPlot(true);
      this.lastPlotIndex_ = index;
    }
    if (index < this.firstPlotIndex_) {
      var firstPlot = this.plots_[this.firstPlotIndex_];
      if (firstPlot)
        firstPlot.isFirstPlot(false);
      plot.isFirstPlot(true);
      this.firstPlotIndex_ = index;
    }
    this.invalidate(anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.STOCK_PLOTS_APPEARANCE,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
  }

  if (goog.isDef(value)) {
    plot.setupInternal(!!opt_default, value);
    return this;
  } else {
    return plot;
  }
};


/**
 * Gets enabled plots.
 * @return {Array.<anychart.stockModule.Plot>}
 */
anychart.stockModule.Chart.prototype.getEnabledPlots = function() {
  var res = [];
  for (var i = 0; i < this.plots_.length; i++) {
    var plot = this.plots_[i];
    if (plot && plot.enabled() && !plot.isDisposed()) {
      res.push(plot);
    }
  }
  return res;
};


/**
 * Returns previous plot.
 * Used to swap plots position.
 * @see {anychart.stockModule.PlotControls#handleButtonAction_}
 * @param {anychart.stockModule.Plot} plot
 * @return {anychart.stockModule.Plot}
 */
anychart.stockModule.Chart.prototype.getPrevPlot = function(plot) {
  var index = goog.array.indexOf(this.plots_, plot);
  for (var i = index - 1; i > -1; i--) {
    var prevPlot = this.plots_[i];
    if (prevPlot && prevPlot.enabled())
      return prevPlot;
  }
  return null;
};


/**
 * Returns next plot.
 * Used to swap plots position.
 * @see {anychart.stockModule.PlotControls#handleButtonAction_}
 * @param {anychart.stockModule.Plot} plot
 * @return {anychart.stockModule.Plot}
 */
anychart.stockModule.Chart.prototype.getNextPlot = function(plot) {
  var index = goog.array.indexOf(this.plots_, plot);
  for (var i = index + 1; i < this.plots_.length; i++) {
    var nextPlot = this.plots_[i];
    if (nextPlot && nextPlot.enabled())
      return nextPlot;
  }
  return null;
};


/**
 * Swap plots by it's indexes.
 * @param {anychart.stockModule.Plot} plot1 Plot to swap.
 * @param {anychart.stockModule.Plot} plot2 Plot to swap.
 */
anychart.stockModule.Chart.prototype.swapPlots = function(plot1, plot2) {
  if (plot1 === plot2 || goog.isNull(plot1) || goog.isNull(plot2))
    return;

  var index1 = goog.array.indexOf(this.plots_, plot1);
  var index2 = goog.array.indexOf(this.plots_, plot2);
  this.plots_[index1] = plot2;
  this.plots_[index2] = plot1;

  if (plot1.isLastPlot()) {
    plot1.isLastPlot(false);
    plot2.isLastPlot(true);
  } else if (plot2.isLastPlot()) {
    plot1.isLastPlot(true);
    plot2.isLastPlot(false);
  }

  if (plot1.isFirstPlot()) {
    plot1.isFirstPlot(false);
    plot2.isFirstPlot(true);
  } else if (plot2.isFirstPlot()) {
    plot1.isFirstPlot(true);
    plot2.isFirstPlot(false);
  }

  this.invalidate(anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.STOCK_PLOTS_APPEARANCE,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
};


/**
 * Expand or collapse plot.
 * @param {anychart.stockModule.Plot} plot Plot to expand or collapse.
 * @param {boolean} expand Expand or collapse (true - for expand, false - collapse)
 */
anychart.stockModule.Chart.prototype.expandPlot = function(plot, expand) {
  plot.isExpanded(expand);
  this.suspendSignalsDispatching();
  for (var i = 0; i < this.plots_.length; i++) {
    var thePlot = this.plots_[i];
    if (thePlot !== plot)
      thePlot.enabled(!expand);
  }
  this.resumeSignalsDispatching(true);
};


/**
 * Plot remove endpoint.
 * @param {anychart.stockModule.Plot} plot
 */
anychart.stockModule.Chart.prototype.removePlotInternal = function(plot) {
  if (goog.array.remove(this.plots_, plot))
    this.invalidate(anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.STOCK_PLOTS_APPEARANCE,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
};


/**
 * Scroller getter-setter.
 * @param {(Object|boolean|null)=} opt_value
 * @return {anychart.stockModule.Scroller|anychart.stockModule.Chart}
 */
anychart.stockModule.Chart.prototype.scroller = function(opt_value) {
  if (!this.scroller_) {
    this.scroller_ = new anychart.stockModule.Scroller(this);
    this.scroller_.setParentEventTarget(this);
    this.setupCreated('scroller', this.scroller_);
    this.scroller_.setupElements(true);

    this.scroller_.listenSignals(this.scrollerInvalidated_, this);
    this.eventsHandler.listen(this.scroller_, anychart.enums.EventType.SCROLLER_CHANGE_START, this.scrollerChangeStartHandler_);
    this.eventsHandler.listen(this.scroller_, anychart.enums.EventType.SCROLLER_CHANGE, this.scrollerChangeHandler_);
    this.eventsHandler.listen(this.scroller_, anychart.enums.EventType.SCROLLER_CHANGE_FINISH, this.scrollerChangeFinishHandler_);
    this.invalidate(
        anychart.ConsistencyState.STOCK_SCROLLER |
        anychart.ConsistencyState.BOUNDS,
        anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(opt_value)) {
    this.scroller_.setup(opt_value);
    return this;
  } else {
    return this.scroller_;
  }
};


/**
 * Selects passed range and initiates data redraw.
 * @param {number|string|Date|anychart.enums.StockRangeType|anychart.enums.Interval} typeOrUnitOrStart
 * @param {(number|string|Date|boolean)=} opt_endOrCountOrDispatchEvent
 * @param {(anychart.enums.StockRangeAnchor|boolean)=} opt_anchorOrDispatchEvent
 * @param {boolean=} opt_dispatchEvent
 * @return {anychart.stockModule.Chart}
 */
anychart.stockModule.Chart.prototype.selectRange = function(typeOrUnitOrStart, opt_endOrCountOrDispatchEvent, opt_anchorOrDispatchEvent, opt_dispatchEvent) {
  var type, unit;
  var offset, year, month;
  var count, anchor, direction;

  var baseKey = this.dataController_.getLastKey(), baseDate;
  var newKey = NaN, newDate;
  type = anychart.enums.normalizeStockRangeType(typeOrUnitOrStart, null);

  if (type == anychart.enums.StockRangeType.POINTS) {
    count = Math.max(+opt_endOrCountOrDispatchEvent || 0, 10);
    anchor = anychart.enums.normalizeStockRangeAnchor(opt_anchorOrDispatchEvent);
    direction = -1;
    var baseIndex;
    if (anchor == anychart.enums.StockRangeAnchor.LAST_VISIBLE_DATE) {
      baseIndex = this.dataController_.getMainIndexByKey(this.dataController_.getLastVisibleKey());
    } else if (anchor == anychart.enums.StockRangeAnchor.FIRST_VISIBLE_DATE) {
      baseIndex = this.dataController_.getMainIndexByKey(this.dataController_.getFirstVisibleKey());
      direction = 1;
    } else if (anchor == anychart.enums.StockRangeAnchor.FIRST_DATE) {
      baseIndex = this.dataController_.getFirstMainIndex();
      direction = 1;
    } else {
      baseIndex = this.dataController_.getLastMainIndex();
    }
    var newIndex = baseIndex + direction * (count - 1);
    baseIndex -= direction / 2;
    newIndex += direction / 2;
    baseKey = this.dataController_.getKeyByMainIndex(baseIndex);
    newKey = this.dataController_.getKeyByMainIndex(goog.math.clamp(newIndex, this.dataController_.getFirstMainIndex(), this.dataController_.getLastMainIndex()));
  } else if (type && (type != anychart.enums.StockRangeType.UNIT)) {
    baseDate = new Date(baseKey);
    switch (type) {
      case anychart.enums.StockRangeType.YTD:
        newKey = Date.UTC(baseDate.getUTCFullYear(), 0);
        break;
      case anychart.enums.StockRangeType.QTD:
        var baseQuarter = Math.floor((baseDate.getUTCMonth() + 3) / 3);
        newKey = Date.UTC(baseDate.getUTCFullYear(), baseQuarter * 3 - 3, 1);
        break;
      case anychart.enums.StockRangeType.MTD:
        newKey = Date.UTC(baseDate.getUTCFullYear(), baseDate.getUTCMonth());
        break;
      case anychart.enums.StockRangeType.MAX:
        newKey = this.dataController_.getFirstKey();
        break;
    }
  } else if (unit = anychart.enums.normalizeInterval(typeOrUnitOrStart, null)) {
    count = opt_endOrCountOrDispatchEvent || 1;
    anchor = anychart.enums.normalizeStockRangeAnchor(opt_anchorOrDispatchEvent);
    direction = -1;
    if (anchor == anychart.enums.StockRangeAnchor.LAST_VISIBLE_DATE) {
      baseKey = this.dataController_.getLastVisibleKey();
    } else if (anchor == anychart.enums.StockRangeAnchor.FIRST_VISIBLE_DATE) {
      baseKey = this.dataController_.getFirstVisibleKey();
      direction = 1;
    } else if (anchor == anychart.enums.StockRangeAnchor.FIRST_DATE) {
      baseKey = this.dataController_.getFirstKey();
      direction = 1;
    }

    baseDate = new Date(baseKey);
    newDate = new Date(baseKey);

    if (unit == anychart.enums.Interval.YEAR) {
      newDate.setUTCFullYear(baseDate.getUTCFullYear() + direction * count);
      newKey = newDate.getTime();
    } else if (unit == anychart.enums.Interval.SEMESTER ||
        unit == anychart.enums.Interval.QUARTER ||
        unit == anychart.enums.Interval.MONTH) {
      switch (unit) {
        case anychart.enums.Interval.SEMESTER:
          offset = count * 6;
          break;
        case anychart.enums.Interval.QUARTER:
          offset = count * 3;
          break;
        case anychart.enums.Interval.MONTH:
          offset = count;
          break;
      }
      month = baseDate.getUTCMonth() + direction * offset;
      year = baseDate.getUTCFullYear() + Math.floor(month / 12);
      month %= 12;
      if (month < 0) {
        month += 12;
      }
      newDate.setUTCFullYear(year);
      newDate.setUTCMonth(month);
      newKey = newDate.getTime();

    } else if (unit == anychart.enums.Interval.THIRD_OF_MONTH) {
      var decade;
      var date = baseDate.getUTCDate();
      if (date <= 10)
        decade = 0;
      else if (date <= 20)
        decade = 1;
      else
        decade = 2;
      var val = (baseDate.getUTCFullYear() * 12 + baseDate.getUTCMonth()) * 3 + decade + direction * count;
      year = Math.floor(val / 36);
      val %= 36;
      month = Math.floor(val / 3);
      if (month < 0) month += 12;
      decade = val % 3;
      if (decade < 0) decade += 3;
      newKey = Date.UTC(year, month, 1 + decade * 10);

    } else {
      switch (unit) {
        case anychart.enums.Interval.WEEK:
          offset = count * 1000 * 60 * 60 * 24 * 7;
          break;
        case anychart.enums.Interval.DAY:
          offset = count * 1000 * 60 * 60 * 24;
          break;
        case anychart.enums.Interval.HOUR:
          offset = count * 1000 * 60 * 60;
          break;
        case anychart.enums.Interval.MINUTE:
          offset = count * 1000 * 60;
          break;
        case anychart.enums.Interval.SECOND:
          offset = count * 1000;
          break;
        case anychart.enums.Interval.MILLISECOND:
          offset = count;
          break;
      }
      newKey = baseKey + direction * offset;
    }
  } else {
    baseKey = anychart.utils.normalizeTimestamp(typeOrUnitOrStart);
    newKey = anychart.utils.normalizeTimestamp(opt_endOrCountOrDispatchEvent);
  }

  this.invalidate(anychart.ConsistencyState.STOCK_DATA);

  this.selectRangeInternal_(baseKey, newKey);

  if ((goog.isBoolean(opt_endOrCountOrDispatchEvent) && opt_endOrCountOrDispatchEvent) ||
      (goog.isBoolean(opt_anchorOrDispatchEvent) && opt_anchorOrDispatchEvent) ||
      opt_dispatchEvent) {
    this.dispatchRangeChange_(
        anychart.enums.EventType.SELECTED_RANGE_CHANGE,
        anychart.enums.StockRangeChangeSource.SELECT_RANGE);
  }
  return this;
};


/**
 * Get selected range.
 * @return {Object}
 */
anychart.stockModule.Chart.prototype.getSelectedRange = function() {
  return {
    'firstSelected': this.dataController_.getFirstSelectedKey(),
    'lastSelected': this.dataController_.getLastSelectedKey(),
    'firstVisible': this.dataController_.getFirstVisibleKey(),
    'lastVisible': this.dataController_.getLastVisibleKey()
  };
};


/**
 * Stock chart X scale getter and setter. It is a misconfiguration if you use it as a setter with anything but a string.
 * We can consider a warning for that.
 * @param {(string|Object)=} opt_value
 * @return {anychart.stockModule.scales.Scatter|anychart.stockModule.Chart}
 */
anychart.stockModule.Chart.prototype.xScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var newType;
    if (goog.isString(opt_value)) {
      newType = opt_value;
    } else if (goog.isObject(opt_value)) {
      // for now only the type of the scale can be changed by the object setter
      newType = opt_value['type'];
    }
    newType = String(newType).toLowerCase();
    var askedForScatter = newType == anychart.enums.ScaleTypes.STOCK_SCATTER_DATE_TIME || newType == 'scatter';
    var currIsScatter = this.xScale_ && !(anychart.utils.instanceOf(this.xScale_, anychart.stockModule.scales.Ordinal));

    var scroller = this.getCreated('scroller');
    if (scroller)
      scroller.unlistenSignals(this.xScaleListener_, this);

    if (askedForScatter != currIsScatter) {
      if (askedForScatter) {
        this.xScale_ = new anychart.stockModule.scales.Scatter(this);
        if (scroller)
          scroller.xScale(new anychart.stockModule.scales.Scatter(/** @type {!anychart.stockModule.Scroller} */(scroller)));
      } else {
        this.xScale_ = new anychart.stockModule.scales.Ordinal(this);
        if (scroller)
          scroller.xScale(new anychart.stockModule.scales.Ordinal(/** @type {!anychart.stockModule.Scroller} */(scroller)));
      }
      this.setupCreated('xScale', this.xScale_);
      this.xScale_.setup(this.xScale_.themeSettings);

      this.xScale_.listenSignals(this.xScaleListener_, this);
      this.invalidateRedrawable();
    }
    return this;
  }
  if (!this.xScale_) {
    this.xScale_ = new anychart.stockModule.scales.Ordinal(this);
    this.setupCreated('xScale', this.xScale_);
    this.xScale_.setup(this.xScale_.themeSettings);
    this.xScale_.listenSignals(this.xScaleListener_, this);
  }
  return this.xScale_;
};


/**
 * xScale listener.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.stockModule.Chart.prototype.xScaleListener_ = function(e) {
  if (e.hasSignal(anychart.Signal.DATA_CHANGED)) {
    if (this.dummyTable_) {
      this.dummyTable_.remove();
    }
    this.invalidate(anychart.ConsistencyState.STOCK_GAP | anychart.ConsistencyState.STOCK_DATA, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Grouping settings object getter/setter.
 * @param {(boolean|Array.<string|anychart.stockModule.Grouping.Level>|Object)=} opt_value
 * @return {anychart.stockModule.Chart|anychart.stockModule.Grouping}
 */
anychart.stockModule.Chart.prototype.grouping = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.dataController_.grouping(opt_value);
    return this;
  }
  return /** @type {anychart.stockModule.Grouping} */(this.dataController_.grouping());
};


/**
 * Scroller grouping settings object getter/setter.
 * @param {(boolean|Array.<string|anychart.stockModule.Grouping.Level>|Object)=} opt_value
 * @return {anychart.stockModule.Chart|anychart.stockModule.Grouping}
 */
anychart.stockModule.Chart.prototype.scrollerGrouping = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.dataController_.scrollerGrouping(opt_value);
    return this;
  }
  return /** @type {anychart.stockModule.Grouping} */(this.dataController_.scrollerGrouping());
};


/**
 * If the selected range absolute date start and absolute date end should be preserved on data update.
 * If false - the ratio of start and end points relative to the whole range is preserved.
 * @param {boolean=} opt_value
 * @return {anychart.stockModule.Chart|boolean}
 */
anychart.stockModule.Chart.prototype.preserveSelectedRangeOnDataUpdate = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.preserveSelectedRangeOnDataUpdate_ = !!opt_value;
    return this;
  }
  return this.preserveSelectedRangeOnDataUpdate_;
};


//endregion
//region Infrastructure methods
//----------------------------------------------------------------------------------------------------------------------
//
//  Infrastructure methods
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Setter for plot default settings.
 * @param {Object=} opt_value Object with default series settings.
 * @return {Object}
 */
anychart.stockModule.Chart.prototype.defaultPlotSettings = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.defaultPlotSettings_ = !!opt_value;
    return this;
  }
  return this.defaultPlotSettings_ || {};
};


/**
 * Returns an array of params to pass to eventMarkers table getIterator() method.
 * @param {boolean=} opt_full
 * @return {Array} [coIterator, fromOrNaN, toOrNaN]
 */
anychart.stockModule.Chart.prototype.getEventMarkersIteratorParams = function(opt_full) {
  return [
    this.dataController_.getCoIterator(false, false, true),
    opt_full ? NaN : this.dataController_.getFirstSelectedKey(),
    opt_full ? NaN : this.dataController_.getLastSelectedKey()
  ];
};


/**
 * Internal function to select a range.
 * @param {number} start
 * @param {number} end
 * @private
 */
anychart.stockModule.Chart.prototype.selectRangeInternal_ = function(start, end) {
  this.suspendSignalsDispatching();
  var xScale = /** @type {!anychart.stockModule.scales.Scatter} */(this.xScale());
  var scrollerXScale = /** @type {!anychart.stockModule.scales.Scatter} */(this.scroller().xScale());
  if (this.dataController_.refreshFullRange()) {
    this.dataController_.updateFullScaleRange(xScale);
    this.dataController_.updateFullScaleRange(scrollerXScale);
  }
  if (this.dataController_.select(start, end, scrollerXScale)) {
    this.dataController_.updateCurrentScaleRange(xScale);
    this.invalidateRedrawable();
  }
  this.resumeSignalsDispatching(true);
};


/**
 * Dispatches range change event. If opt_first and opt_last are passed, includes only first/last Selected into the event
 * (usable for pre- events). Otherwise includes all info from data controller.
 * @param {anychart.enums.EventType} type
 * @param {anychart.enums.StockRangeChangeSource} source
 * @param {number=} opt_first
 * @param {number=} opt_last
 * @return {boolean}
 * @private
 */
anychart.stockModule.Chart.prototype.dispatchRangeChange_ = function(type, source, opt_first, opt_last) {
  if (goog.isDef(opt_first)) {
    return this.dispatchEvent({
      'type': type,
      'source': source,
      'firstSelected': opt_first,
      'lastSelected': opt_last,
      'firstKey': this.dataController_.getFirstKey(),
      'lastKey': this.dataController_.getLastKey()
    });
  } else {
    var grouping = /** @type {anychart.stockModule.Grouping} */(this.grouping());
    return this.dispatchEvent({
      'type': type,
      'source': source,
      'firstSelected': this.dataController_.getFirstSelectedKey(),
      'lastSelected': this.dataController_.getLastSelectedKey(),
      'firstVisible': this.dataController_.getFirstVisibleKey(),
      'lastVisible': this.dataController_.getLastVisibleKey(),
      'firstKey': this.dataController_.getFirstKey(),
      'lastKey': this.dataController_.getLastKey(),
      'dataIntervalUnit': grouping.getCurrentDataInterval()['unit'],
      'dataIntervalUnitCount': grouping.getCurrentDataInterval()['count'],
      'dataIsGrouped': grouping.isGrouped()
    });
  }
};


/** @inheritDoc */
anychart.stockModule.Chart.prototype.resizeHandler = function(e) {
  if (this.bounds().dependsOnContainerSize()) {
    this.invalidate(anychart.ConsistencyState.BOUNDS,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
  }
};


/**
 * Returns current selection min distance (from selectable sources).
 * @return {number}
 */
anychart.stockModule.Chart.prototype.getCurrentMinDistance = function() {
  return this.dataController_.getCurrentMinDistance();
};


/**
 * Returns current selection min distance (from scroller sources).
 * @return {number}
 */
anychart.stockModule.Chart.prototype.getCurrentScrollerMinDistance = function() {
  return this.dataController_.getCurrentScrollerMinDistance();
};


/**
 * Returns plots count.
 * @return {number} Number of plots.
 */
anychart.stockModule.Chart.prototype.getPlotsCount = function() {
  var count = 0;
  for (var i = 0; i < this.plots_.length; i++) {
    if (this.plots_[i])
      count++;
  }
  return count;
};


/**
 * Returns plots count that are enabled.
 * @return {number} Number of enabled plots.
 */
anychart.stockModule.Chart.prototype.getEnabledPlotsCount = function() {
  var count = 0;
  for (var i = 0; i < this.plots_.length; i++) {
    if (this.plots_[i] && this.plots_[i].enabled())
      count++;
  }
  return count;
};


/** @inheritDoc */
anychart.stockModule.Chart.prototype.supportsNoData = function() {
  return false;
};


/**
 * Whether point settings is allowed.
 * @return {boolean}
 */
anychart.stockModule.Chart.prototype.getAllowPointSettings = function() {
  return this.allowPointSettings_;
};


//endregion
//region Drawing
//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.stockModule.Chart.prototype.drawContent = function(bounds) {
  var i, plot;

  if (this.annotationsModule)
    this.annotations().ready(true);

  if (!this.splitterController_) {
    this.splitterController_ = new anychart.stockModule.splitter.Controller(this);
  }

  // anychart.core.Base.suspendSignalsDispatching(this.plots_, this.scroller_);
  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.distributeBounds_(bounds);
    this.invalidate(anychart.ConsistencyState.STOCK_DATA);
    // we do not mark BOUNDS consistent, since the chart becomes unresizable in that case
    //this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  // means that stock selection range needs to be updated
  if (this.hasInvalidationState(anychart.ConsistencyState.STOCK_DATA) ||
      this.hasInvalidationState(anychart.ConsistencyState.STOCK_SCALES)) {
    anychart.performance.start('Stock data calc');
    var xScale = /** @type {anychart.stockModule.scales.Scatter} */(this.xScale());
    var scrollerXScale = /** @type {anychart.stockModule.scales.Scatter} */(this.scroller().xScale());

    //this first selection is needed to define total data max value.
    var changed = this.dataController_.refreshSelection(
        this.minPlotsDrawingWidth_,
        this.inDrag_ || this.preserveSelectedRangeOnDataUpdate_,
        xScale, scrollerXScale);

    if (this.hasInvalidationState(anychart.ConsistencyState.STOCK_GAP)) {
      if (!this.dummyTable_) {
        this.dummyTable_ = new anychart.stockModule.data.DummyTable();
        this.dataController_.registerSource(this.dummyTable_.mapAs().createSelectable(), false); //TODO (A.Kudryavtsev): Check second arg.
      }

      this.dummyTable_.applyGapSettings(/** @type {anychart.stockModule.scales.Scatter} */ (this.xScale()));
      this.markConsistent(anychart.ConsistencyState.STOCK_GAP);

      //this second refresh allows to consider dummy data.
      changed = this.dataController_.refreshSelection(
          this.minPlotsDrawingWidth_,
          this.inDrag_ || this.preserveSelectedRangeOnDataUpdate_,
          xScale, scrollerXScale);
    }

    if (!!(changed & 1)) {
      this.invalidateRedrawable();
      for (i = 0; i < this.plots_.length; i++) {
        plot = this.plots_[i];
        if (plot) {
          plot.refreshDragAnchor();
        }
      }
    }
    if (!!(changed & 2)) {
      this.scroller_.invalidateScaleDependend();
      this.invalidate(anychart.ConsistencyState.STOCK_SCROLLER);
      this.dispatchRangeChange_(anychart.enums.EventType.SELECTED_RANGE_CHANGE,
          anychart.enums.StockRangeChangeSource.DATA_CHANGE);
    }

    this.markConsistent(anychart.ConsistencyState.STOCK_DATA);
    anychart.performance.end('Stock data calc');
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.STOCK_SCALES)) {
    anychart.performance.start('Stock scales calc');
    this.calculateScales_();
    this.markConsistent(anychart.ConsistencyState.STOCK_SCALES);
    anychart.performance.end('Stock scales calc');
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.STOCK_SCROLLER)) {
    anychart.performance.start('Stock drawing scroller');
    // we created scroller at least at STOCK_DATA this.scroller().xScale() call
    this.scroller()
        .setRangeByValues(
            this.dataController_.getFirstSelectedKey(),
            this.dataController_.getLastSelectedKey())
        .container(this.rootElement)
        .draw();
    this.markConsistent(anychart.ConsistencyState.STOCK_SCROLLER);
    anychart.performance.end('Stock drawing scroller');
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.STOCK_PLOTS_APPEARANCE)) {
    anychart.performance.start('Stock drawing plots');
    var isFirstPlotFound = false;
    for (i = 0; i < this.plots_.length; i++) {
      plot = this.plots_[i];
      if (plot) {
        // Condition below fixes DVF-4361.
        if (plot.enabled()) {
          plot.isFirstPlot(!isFirstPlotFound);
          isFirstPlotFound = true;
        }

        plot
            .container(this.rootElement)
            .draw();
      }
    }

    this.markConsistent(anychart.ConsistencyState.STOCK_PLOTS_APPEARANCE);
    anychart.performance.end('Stock drawing plots');
  }

  this.refreshHighlight_();
  if (this.hasInvalidationState(anychart.ConsistencyState.STOCK_SPLITTERS)) {
    // State is needed to call this.splitterController_.sync()
    this.markConsistent(anychart.ConsistencyState.STOCK_SPLITTERS);
  }
  this.splitterController_.sync(); // This will do nothing if isPlotsManualBounds() is TRUE.

  if (!this.mouseWheelHandler_) {
    this.mouseWheelHandler_ = new goog.events.MouseWheelHandler(
        this.container().getStage().getDomWrapper(), false);

    this.mouseWheelHandler_.listen('mousewheel', this.handleMouseWheel_, false, this);
  }

  this.eventMarkers().markConsistent(anychart.ConsistencyState.ALL);
  this.eventMarkers().normal().connector().markConsistent(anychart.ConsistencyState.ALL);

  // anychart.core.Base.resumeSignalsDispatchingFalse(this.plots_, this.scroller_);
};


/**
 * Applies value stacking to a point.
 * @param {anychart.scales.Base} scale
 * @param {anychart.data.IRowInfo} point
 * @param {Object} stack
 * @param {number} val
 * @param {Object} prevStack
 * @param {number} prevVal
 * @private
 */
anychart.stockModule.Chart.prototype.valueStacking_ = function(scale, point, stack, val, prevStack, prevVal) {
  this.percentStacking_(scale, point, stack, val, prevStack, prevVal);
  var positive = val >= 0;

  stack.shared = stack.shared || {
    positiveAnchor: NaN,
    negativeAnchor: NaN
  };

  if (!point.meta('shared'))
    point.meta('shared', stack.shared);

  if (stack.prevMissing) {
    if (positive) {
      point.meta('stackedZeroPrev', stack.prevPositive);
      point.meta('stackedValuePrev', stack.prevPositive + val);
    } else {
      point.meta('stackedZeroPrev', stack.prevNegative);
      point.meta('stackedValuePrev', stack.prevNegative + val);
    }
  } else {
    point.meta('stackedZeroPrev', NaN);
    point.meta('stackedValuePrev', NaN);
  }
  if (stack.nextMissing) {
    if (positive) {
      point.meta('stackedZeroNext', stack.nextPositive);
      point.meta('stackedValueNext', stack.nextPositive + val);
    } else {
      point.meta('stackedZeroNext', stack.nextNegative);
      point.meta('stackedValueNext', stack.nextNegative + val);
    }
  } else {
    point.meta('stackedZeroNext', NaN);
    point.meta('stackedValueNext', NaN);
  }
  scale.extendDataRange(point.meta('stackedValuePrev'));
  scale.extendDataRange(point.meta('stackedValue'));
  scale.extendDataRange(point.meta('stackedValueNext'));
  if (prevStack) {
    if (prevStack.missing) {
      stack.prevMissing = true;
    } else {
      if (positive) {
        stack.prevPositive += val;
      } else {
        stack.prevNegative += val;
      }
    }
    if (!isNaN(prevVal)) {
      if (prevVal >= 0) {
        prevStack.nextPositive += prevVal;
      } else {
        prevStack.nextNegative += prevVal;
      }
    }
  }
};


/**
 * Applies percent stacking to a point.
 * @param {anychart.scales.Base} scale
 * @param {anychart.data.IRowInfo} point
 * @param {Object} stack
 * @param {number} val
 * @param {Object} prevStack
 * @param {number} prevVal
 * @private
 */
anychart.stockModule.Chart.prototype.percentStacking_ = function(scale, point, stack, val, prevStack, prevVal) {
  if (val >= 0) {
    point.meta('stackedZero', stack.positive);
    stack.positive += val;
    point.meta('stackedValue', stack.positive);
  } else {
    point.meta('stackedZero', stack.negative);
    stack.negative += val;
    point.meta('stackedValue', stack.negative);
  }
};


/**
 * Applies stacking to a series.
 * @param {anychart.stockModule.Series} aSeries
 * @param {Object} stacksByScale
 * @return {boolean} - if the stacking is percent
 * @private
 */
anychart.stockModule.Chart.prototype.calcStacking_ = function(aSeries, stacksByScale) {
  var scale = /** @type {anychart.scales.Base} */(aSeries.yScale());
  var guid = goog.getUid(scale);
  var iterator = aSeries.getResetIterator();
  var valueColumn = aSeries.getSelectableData().getFieldColumn('value');
  var stacks = stacksByScale[guid];
  var k;
  if (!stacks) {
    stacks = stacksByScale[guid] = [];
    var len = iterator.getRowsCount();
    for (k = 0; k < len + 2; k++)
      stacks.push({
        prevPositive: 0,
        positive: 0,
        nextPositive: 0,
        prevNegative: 0,
        negative: 0,
        nextNegative: 0,
        prevMissing: false,
        nextMissing: false,
        missing: false
      });
  }
  var percent = scale.stackMode() == anychart.enums.ScaleStackMode.PERCENT;
  var applyStacking = percent ? this.percentStacking_ : this.valueStacking_;
  var stack = stacks[k = 0];
  var prevVal, prevStack;
  var val;
  var point = aSeries.getSelectableData().getPreFirstRow();
  if (point) {
    point.meta('stackedMissing', stack.missing);
    if (stack.missing = point.meta('missing')) {
      prevVal = NaN;
    } else {
      val = Number(point.getColumn(valueColumn));
      applyStacking.call(this, scale, point, stack, val, null, NaN);
      prevVal = val;
    }
  } else {
    prevVal = NaN;
  }
  iterator.reset();
  while (iterator.advance()) {
    prevStack = stack;
    stack = stacks[++k];
    iterator.meta('stackedMissing', stack.missing);
    if (stack.missing = iterator.meta('missing')) {
      prevStack.nextMissing = true;
      prevVal = NaN;
    } else {
      val = Number(iterator.getColumn(valueColumn));
      applyStacking.call(this, scale, iterator, stack, val, prevStack, prevVal);
      prevVal = val;
    }
  }
  point = aSeries.getSelectableData().getPostLastRow();
  if (point) {
    stack = stacks[++k];
    point.meta('stackedMissing', stack.missing);
    if (!(stack.missing = point.meta('missing'))) {
      val = Number(point.getColumn(valueColumn));
      applyStacking.call(this, scale, point, stack, val, prevStack, prevVal);
    }
  }
  return percent;
};


/**
 * Finalizes point percent stacking.
 * @param {anychart.data.IRowInfo} point
 * @param {anychart.scales.Base} scale
 * @param {Object} stack
 * @private
 */
anychart.stockModule.Chart.prototype.finalizePercentStack_ = function(point, scale, stack) {
  if (point.meta('missing')) {
    point.meta('stackedPositiveZero', (Number(point.meta('stackedPositiveZero')) / stack.positive * 100) || 0);
    point.meta('stackedNegativeZero', (Number(point.meta('stackedNegativeZero')) / stack.negative * 100) || 0);
  } else {
    var val = Number(point.meta('stackedValue'));
    var sum;
    if (val >= 0) {
      sum = stack.positive;
      scale.extendDataRange(100);
    } else {
      sum = -stack.negative;
      scale.extendDataRange(-100);
    }
    point.meta('stackedZero', (Number(point.meta('stackedZero')) / sum * 100) || 0);
    point.meta('stackedValue', (Number(point.meta('stackedValue')) / sum * 100) || 0);
  }
};


/**
 * Finalizes series percent stacking.
 * @param {anychart.stockModule.Series} aSeries
 * @param {anychart.scales.Base} scale
 * @param {Object} stacksByScale
 * @private
 */
anychart.stockModule.Chart.prototype.finalizePercentStackCalc_ = function(aSeries, scale, stacksByScale) {
  var guid = goog.getUid(scale);
  var iterator = /** @type {anychart.stockModule.data.TableIterator} */(aSeries.getIterator());
  var stacks = stacksByScale[guid];
  scale.extendDataRange(0);
  var stack;
  var point = aSeries.getSelectableData().getPreFirstRow();
  if (point) {
    stack = stacks[0];
    this.finalizePercentStack_(point, scale, stack);
  }
  var k = 1;
  iterator.reset();
  while (iterator.advance()) {
    stack = stacks[k++];
    this.finalizePercentStack_(iterator, scale, stack);
  }
  point = aSeries.getSelectableData().getPostLastRow();
  if (point) {
    stack = stacks[k];
    this.finalizePercentStack_(point, scale, stack);
  }
};


/**
 * Calculates all Y scales.
 * @private
 */
anychart.stockModule.Chart.prototype.calculateScales_ = function() {
  // we just iterate over all series and calculate them semi-independently
  var i, j, seriesList, series, scale, stacksByScale, hasPercentStacks;
  var scales = [];
  for (i = 0; i < this.plots_.length; i++) {
    var plot = /** @type {anychart.stockModule.Plot} */(this.plots_[i]);
    if (plot && plot.enabled()) {
      var stackDirection = /** @type {anychart.enums.ScaleStackDirection} */ (plot.yScale().stackDirection());
      var stackIsDirect = stackDirection == anychart.enums.ScaleStackDirection.DIRECT;

      var axisMarkers = /** @type {Array.<anychart.core.axisMarkers.Line|anychart.core.axisMarkers.Range|anychart.core.axisMarkers.Text>} */ (plot.getAxisMarkers());

      seriesList = plot.getAllSeries();
      stacksByScale = {};
      hasPercentStacks = false;

      for (j = 0; j < seriesList.length; j++) {
        series = seriesList[stackIsDirect ? seriesList.length - j - 1 : j];
        series.updateComparisonZero();
        scale = /** @type {anychart.scales.Base} */(series.yScale());
        if (scale.needsAutoCalc()) {
          scale.startAutoCalc();
          scales.push(scale);
        }
        if (series.enabled()) {
          if (series.planIsStacked()) {
            hasPercentStacks = this.calcStacking_(series, stacksByScale) || hasPercentStacks;
          } else if (series.enabled()) {
            scale.extendDataRange.apply(scale, series.getScaleReferenceValues());
          }
        }
      }
      if (hasPercentStacks) {
        for (j = 0; j < seriesList.length; j++) {
          series = seriesList[j];
          if (series.enabled()) {
            scale = /** @type {anychart.scales.Base} */(series.yScale());
            if (scale.stackMode() == anychart.enums.ScaleStackMode.PERCENT) {
              this.finalizePercentStackCalc_(series, scale, stacksByScale);
            }
          }
        }
      }
      for (j = 0; j < seriesList.length; j++) {
        series = seriesList[j];
        if (series.enabled()) {
          scale = /** @type {anychart.scales.Base} */(series.yScale());
          for (var k = 0; k < axisMarkers.length; k++) {
            var marker = axisMarkers[k];
            var autoScale = marker.isHorizontal() ? scale : this.xScale();
            var markerScale = marker.scale() || autoScale;
            if (marker && marker.enabled() && scale == markerScale && (marker.getOption('scaleRangeMode') == anychart.enums.ScaleRangeMode.CONSIDER))
              scale.extendDataRange.apply(scale, marker.getReferenceValues());
          }
        }
      }
    }
  }

  var scroller = this.getCreated('scroller');
  if (scroller && scroller.isVisible()) {
    seriesList = scroller.getAllSeries();
    stacksByScale = {};
    hasPercentStacks = false;
    for (j = 0; j < seriesList.length; j++) {
      series = seriesList[j];
      series.updateComparisonZero();
      scale = /** @type {anychart.scales.Base} */(series.yScale());
      if (scale.needsAutoCalc()) {
        scale.startAutoCalc();
        scales.push(scale);
      }
      if (series.enabled()) {
        if (series.planIsStacked()) {
          hasPercentStacks = this.calcStacking_(series, stacksByScale) || hasPercentStacks;
        } else if (series.enabled()) {
          scale.extendDataRange.apply(scale, series.getScaleReferenceValues());
        }
      }
    }
    if (hasPercentStacks) {
      for (j = 0; j < seriesList.length; j++) {
        series = seriesList[j];
        if (series.enabled()) {
          scale = /** @type {anychart.scales.Base} */(series.yScale());
          if (scale.stackMode() == anychart.enums.ScaleStackMode.PERCENT) {
            this.finalizePercentStackCalc_(series, scale, stacksByScale);
          }
        }
      }
    }
  }
  for (i = 0; i < scales.length; i++)
    scales[i].finishAutoCalc();
};

/**
 * Whether bounds of plots must be set manually (https://anychart.atlassian.net/browse/DVF-4331).
 * @return {boolean} - Whether chart is configured to have a plot with manually set bounds.
 */
anychart.stockModule.Chart.prototype.isPlotsManualBounds = function() {
  return !!this.getOption('plotsManualBounds');
};


/**
 * Distributes weights among plots.
 * @private
 */
anychart.stockModule.Chart.prototype.distributeWeights_ = function() {
  // this.plotsBounds_ must be already set here.
  var remainingBounds = this.plotsBounds_;
  var i, plot, bounds, height;

  /**
   * List of enabled plots.
   * @type {Array.<anychart.stockModule.Plot>}
   */
  var enabledPlots = this.getEnabledPlots();

  /**
   * Sum of heights set by user.
   * @type {number}
   */
  var heightsSetSum = 0;

  var allHeightsSum = 0;

  /**
   * Storage of heights set by user.
   * Also contains calculated heights.
   * @type {Array.<number>}
   */
  var exactHeights = [];

  var remHeight = remainingBounds.height;

  var enabledPlotsCount = enabledPlots.length;
  if (enabledPlotsCount) {
    var calculatedHeight = remHeight / enabledPlotsCount;
    var autoHeightsCount = 0;

    /*
      This cycle calculates heights set to plots by user.
     */
    for (i = 0; i < enabledPlotsCount; i++) {
      plot = enabledPlots[i];
      plot.parentBounds(remainingBounds);
      height = NaN;
      bounds = plot.bounds();

      var plotMinHeight = anychart.utils.normalizeSize(/** @type {number|string} */(bounds.minHeight()), remHeight);
      var plotHeight = anychart.utils.normalizeSize(/** @type {number|string} */(bounds.height()), remHeight);
      var plotMaxHeight = anychart.utils.normalizeSize(/** @type {number|string} */(bounds.maxHeight()), remHeight);

      if (!isNaN(plotMinHeight)) {
        height = Math.max(plotMinHeight, calculatedHeight);
        plot.setOption('weight', null);
      }

      if (!isNaN(plotHeight)) {
        height = isNaN(height) ? plotHeight : Math.max(plotHeight, height);
        plot.setOption('weight', null);
      }

      if (!isNaN(plotMaxHeight)) {
        height = isNaN(height) ? Math.min(plotMaxHeight, calculatedHeight) : Math.min(plotMaxHeight, height);
        plot.setOption('weight', null);
      }

      if (isNaN(height))
        autoHeightsCount += 1;
      else
        heightsSetSum += height;

      allHeightsSum += isNaN(height) ? calculatedHeight : height;
      exactHeights.push(height); // Can contain NaNs. NaN means height autocalculation.

      bounds.suspendSignalsDispatching();
      bounds.top(null).bottom(null).height(null).minHeight(null).maxHeight(null);
      bounds.resumeSignalsDispatching(false);
    }

    // Good variable naming ;)
    var exactHeightExceedsAvailableHeight = heightsSetSum > remHeight;

    var weightsSum = 0;
    var weights = [];
    var weight, exactHeight;

    /*
      This passage calculates weights and sums.
     */
    for (i = 0; i < enabledPlotsCount; i++) {
      plot = enabledPlots[i];
      exactHeight = exactHeights[i]; // Can be NaN.
      weight = /** @type {number} */ (plot.getOption('weight'));

      if (!goog.isDefAndNotNull(weight)) {
        /*
          This condition processes cases when
          bounds set by user exceed available height.
         */
        if (exactHeightExceedsAvailableHeight) {
          if (isNaN(exactHeight)) {
            weight = calculatedHeight;
          } else {
            weight = exactHeight;
          }
        } else {
          if (isNaN(exactHeight)) {
            weight = (remHeight - heightsSetSum) / autoHeightsCount;
          } else {
            weight = exactHeight;
          }
        }
      }

      weights.push(weight);
      weightsSum += weight;
    }

    var currentTop = 0;
    /*
      This passage sets auto top and ayot height.
     */
    for (i = 0; i < enabledPlotsCount; i++) {
      plot = enabledPlots[i];
      bounds = plot.bounds();
      bounds.suspendSignalsDispatching();

      weight = weights[i];
      plot.setOption('weight', weight); // Here we don't need signals dispatching.

      var size = Math.round((weight / weightsSum) * remHeight);

      bounds.setAutoTop(currentTop);
      bounds.setAutoHeight(size);
      currentTop += size;

      bounds.resumeSignalsDispatching(true);
    }
  }
};


/**
 * Bounds distribution.
 * @param {Array.<anychart.core.utils.Bounds>} boundsArray
 * @param {number} top
 * @param {number} bottom
 * @param {number} fullHeight - Parent bounds height to get percent heights normalized.
 * @private
 */
anychart.stockModule.Chart.prototype.distributeBoundsLocal_ = function(boundsArray, top, bottom, fullHeight) {
  var i, size, minSize, maxSize;
  var bounds;
  var distributedSize = 0;
  var fixedSizes = [];
  var minSizes = [];
  var maxSizes = [];
  var autoSizesCount = 0;
  var hardWay = false;
  var height = bottom - top;
  for (i = 0; i < boundsArray.length; i++) {
    bounds = boundsArray[i];
    bounds.suspendSignalsDispatching();
    minSize = anychart.utils.normalizeSize(/** @type {number|string|null} */(bounds.minHeight()), fullHeight);
    maxSize = anychart.utils.normalizeSize(/** @type {number|string|null} */(bounds.maxHeight()), fullHeight);
    // getting normalized size
    size = anychart.utils.normalizeSize(/** @type {number|string|null} */(bounds.height()), fullHeight);
    // if it is NaN (not fixed)
    if (isNaN(size)) {
      autoSizesCount++;
      // if there are any limitations on that non-fixed size - we are going to do it hard way:(
      // we cache those limitations
      if (!isNaN(minSize)) {
        minSizes[i] = minSize;
        hardWay = true;
      }
      if (!isNaN(maxSize)) {
        maxSizes[i] = maxSize;
        hardWay = true;
      }
    } else {
      if (!isNaN(minSize))
        size = Math.max(size, minSize);
      if (!isNaN(maxSize))
        size = Math.min(size, maxSize);
      distributedSize += size;
      fixedSizes[i] = size;
    }
  }

  var autoSize;
  var restrictedSizes;
  if (hardWay && autoSizesCount > 0) {
    restrictedSizes = [];
    // we limit max cycling times to guarantee finite exec time in case my calculations are wrong
    var maxTimes = autoSizesCount * autoSizesCount;
    do {
      var repeat = false;
      // min to 3px per autoPlot to make them visible, but not good-looking.
      autoSize = Math.max(3, (height - distributedSize) / autoSizesCount);
      for (i = 0; i < boundsArray.length; i++) {
        // if the size of the column is not fixed
        if (!(i in fixedSizes)) {
          // we recheck if the limitation still exist and drop it if it doesn't
          if (i in restrictedSizes) {
            if (restrictedSizes[i] == minSizes[i] && minSizes[i] < autoSize) {
              distributedSize -= minSizes[i];
              autoSizesCount++;
              delete restrictedSizes[i];
              repeat = true;
              break;
            }
            if (restrictedSizes[i] == maxSizes[i] && maxSizes[i] > autoSize) {
              distributedSize -= maxSizes[i];
              autoSizesCount++;
              delete restrictedSizes[i];
              repeat = true;
              break;
            }
          } else {
            if ((i in minSizes) && minSizes[i] > autoSize) {
              distributedSize += restrictedSizes[i] = minSizes[i];
              autoSizesCount--;
              repeat = true;
              break;
            }
            if ((i in maxSizes) && maxSizes[i] < autoSize) {
              distributedSize += restrictedSizes[i] = maxSizes[i];
              autoSizesCount--;
              repeat = true;
              break;
            }
          }
        }
      }
    } while (repeat && autoSizesCount > 0 && maxTimes--);
  }
  var current = top;
  autoSize = Math.max(3, (height - distributedSize) / autoSizesCount);
  for (i = 0; i < boundsArray.length; i++) {
    bounds = boundsArray[i];
    if (i in fixedSizes)
      size = fixedSizes[i];
    else if (restrictedSizes && (i in restrictedSizes))
      size = restrictedSizes[i];
    else
      size = autoSize;
    size = Math.round(size);
    bounds.setAutoTop(current);
    bounds.setAutoHeight(size);
    bounds.resumeSignalsDispatching(true);
    current += size;
  }
};

/**
 *
 * @param {anychart.math.Rect} remainingBounds - .
 * @private
 */
anychart.stockModule.Chart.prototype.distributeManualBounds_ = function(remainingBounds) {
  var plot;
  var currentTop = 0;
  var currentBottom = NaN;
  var boundsArray = [];
  for (var i = 0; i < this.plots_.length; i++) {
    plot = this.plots_[i];
    if (plot && plot.enabled()) {
      plot.parentBounds(remainingBounds);
      var bounds = /** @type {anychart.core.utils.Bounds} */(plot.bounds());
      var usedInDistribution = false;
      if (!goog.isNull(bounds.top())) {
        currentBottom = anychart.utils.normalizeSize(/** @type {number|string} */(bounds.top()), remainingBounds.height);
      } else if (!goog.isNull(bounds.bottom())) {
        usedInDistribution = true;
        boundsArray.push(bounds);
        currentBottom = anychart.utils.normalizeSize(/** @type {number|string} */(bounds.bottom()), remainingBounds.height, true);
      }
      if (!isNaN(currentBottom)) {
        if (boundsArray.length)
          this.distributeBoundsLocal_(boundsArray, currentTop, currentBottom, remainingBounds.height);
        currentTop = currentBottom;
        currentBottom = NaN;
        boundsArray.length = 0;
      }
      if (!usedInDistribution)
        boundsArray.push(bounds);
    }
  }
  if (boundsArray.length)
    this.distributeBoundsLocal_(boundsArray, currentTop, remainingBounds.height, remainingBounds.height);
};


/**
 * Distributes content bounds among plots.
 * @param {anychart.math.Rect} contentBounds
 * @private
 */
anychart.stockModule.Chart.prototype.distributeBounds_ = function(contentBounds) {
  var remainingBounds = contentBounds;
  // first - setup scroller
  var scroller = this.getCreated('scroller');
  if (scroller) {
    scroller.parentBounds(remainingBounds);
    remainingBounds = scroller.getRemainingBounds();
  }

  if (this.isPlotsManualBounds()) {
    // https://anychart.atlassian.net/browse/DVF-4331.
    this.distributeManualBounds_(remainingBounds);
  } else {
    this.plotsBounds_ = remainingBounds;

    // Since DVF-4261, weight distribution replaces previous behaviour.
    this.distributeWeights_();
  }

  this.minPlotsDrawingWidth_ = Infinity;
  for (var i = 0; i < this.plots_.length; i++) {
    var plot = this.plots_[i];
    if (plot && plot.enabled()) {
      var width = plot.getDrawingWidth();
      if (this.minPlotsDrawingWidth_ > width)
        this.minPlotsDrawingWidth_ = width;
    }
  }
  if (!isFinite(this.minPlotsDrawingWidth_))
    this.minPlotsDrawingWidth_ = NaN;
};


//endregion
//region Signals handlers
/**
 * Plot signals handler.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.stockModule.Chart.prototype.plotInvalidated_ = function(e) {
  // this signal is dispatched by plot to update custom legend on highlight
  if (e.hasSignal(anychart.Signal.NEED_UPDATE_LEGEND))
    return;
  var state = anychart.ConsistencyState.STOCK_PLOTS_APPEARANCE;
  if (e.hasSignal(anychart.Signal.BOUNDS_CHANGED))
    state |= anychart.ConsistencyState.BOUNDS;
  if (e.hasSignal(anychart.Signal.NEEDS_RECALCULATION))
    state |= anychart.ConsistencyState.STOCK_SCALES;
  this.invalidate(state, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Scroller signals handler.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.stockModule.Chart.prototype.scrollerInvalidated_ = function(e) {
  var state = anychart.ConsistencyState.STOCK_SCROLLER;
  var signal = anychart.Signal.NEEDS_REDRAW;
  if (e.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state |= anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.STOCK_SCALES;
    signal |= anychart.Signal.BOUNDS_CHANGED;
  }
  if (e.hasSignal(anychart.Signal.NEEDS_RECALCULATION))
    state |= anychart.ConsistencyState.STOCK_SCALES;
  this.invalidate(state, signal);
};


/**
 * Data controller signals handler.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.stockModule.Chart.prototype.dataControllerInvalidated_ = function(e) {
  if (e.hasSignal(anychart.Signal.DATA_CHANGED)) {
    this.invalidate(anychart.ConsistencyState.STOCK_DATA, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Initiates series redraw.
 */
anychart.stockModule.Chart.prototype.invalidateRedrawable = function() {
  for (var i = 0; i < this.plots_.length; i++) {
    var plot = this.plots_[i];
    if (plot)
      plot.invalidateRedrawable(false);
  }
  this.invalidate(anychart.ConsistencyState.STOCK_SCALES |
      anychart.ConsistencyState.STOCK_PLOTS_APPEARANCE |
      anychart.ConsistencyState.STOCK_SCROLLER,
      anychart.Signal.NEEDS_REDRAW);
};


//endregion
//region Data
/**
 * Registers selectable as a chart data source.
 * @param {!anychart.stockModule.data.TableSelectable} source
 * @param {boolean} isScrollerSeries
 */
anychart.stockModule.Chart.prototype.registerSource = function(source, isScrollerSeries) {
  this.dataController_.registerSource(source, !isScrollerSeries);
};


/**
 * Removes source registration.
 * @param {!anychart.stockModule.data.TableSelectable} source
 */
anychart.stockModule.Chart.prototype.deregisterSource = function(source) {
  var isUsed = false;
  for (var i = 0; i < this.plots_.length; i++) {
    var plot = this.plots_[i];
    if (plot && !plot.isDisposed()) {
      var series = plot.getAllSeries();
      for (var j = 0; j < series.length; j++) {
        if (series[j].getSelectableData() == source) {
          isUsed = true;
          break;
        }
      }
    }
  }
  if (!isUsed)
    this.dataController_.deregisterSource(source);
};


//endregion
//region IKeyIndexTransformation
//----------------------------------------------------------------------------------------------------------------------
//
//  IKeyIndexTransformation
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Returns key by index. Index can be fractional - the key will be inter- or extrapolated.
 * @param {number} index
 * @return {number}
 */
anychart.stockModule.Chart.prototype.getKeyByIndex = function(index) {
  return this.dataController_.getKeyByIndex(index);
};


/**
 * Returns index by key. If the key is not in the registry - returns fractional inter/extrapolated index for it.
 * @param {number} key
 * @return {number}
 */
anychart.stockModule.Chart.prototype.getIndexByKey = function(key) {
  return this.dataController_.getIndexByKey(key);
};


/**
 * Returns key by index. Index can be fractional - the key will be inter- or extrapolated.
 * @param {number} index
 * @return {number}
 */
anychart.stockModule.Chart.prototype.getKeyByScrollerIndex = function(index) {
  return this.dataController_.getKeyByScrollerIndex(index);
};


/**
 * Returns index by key. If the key is not in the registry - returns fractional inter/extrapolated index for it.
 * @param {number} key
 * @return {number}
 */
anychart.stockModule.Chart.prototype.getScrollerIndexByKey = function(key) {
  return this.dataController_.getScrollerIndexByKey(key);
};


//endregion
//region Annotations
//----------------------------------------------------------------------------------------------------------------------
//
//  Annotations
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Chart-level annotations controller getter/setter.
 * @param {(Object|boolean)=} opt_value
 * @return {anychart.stockModule.Chart|anychart.annotationsModule.ChartController}
 */
anychart.stockModule.Chart.prototype.annotations = function(opt_value) {
  if (!this.annotationsModule) {
    anychart.core.reporting.error(anychart.enums.ErrorCode.NO_FEATURE_IN_MODULE, null, ['Annotations']);
  } else if (!this.annotations_) {
    this.annotations_ = new this.annotationsModule['ChartController'](this);
  }
  if (goog.isDef(opt_value)) {
    if (this.annotations_)
      this.annotations_.setup(opt_value);
    return this;
  }
  return this.annotations_;
};


/**
 * Getter/Setter for default annotation settings.
 * @param {Object=} opt_value
 * @return {Object}
 */
anychart.stockModule.Chart.prototype.defaultAnnotationSettings = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.defaultAnnotationSettings_ = opt_value;
    return this;
  }
  return this.defaultAnnotationSettings_;
};


//endregion
//region Event markers
//------------------------------------------------------------------------------
//
//  Event markers
//
//------------------------------------------------------------------------------
/**
 * Event markers controller getter-setter.
 * @param {(Object|boolean|null)=} opt_value
 * @return {anychart.stockModule.eventMarkers.ChartController|anychart.stockModule.Chart}
 */
anychart.stockModule.Chart.prototype.eventMarkers = function(opt_value) {
  if (!this.eventMarkers_) {
    this.eventMarkers_ = new anychart.stockModule.eventMarkers.ChartController(this);
    this.eventMarkers_.setParentEventTarget(this);
    this.eventMarkers_.listenSignals(this.eventMarkersInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    this.eventMarkers_.setup(opt_value);
    return this;
  }
  return this.eventMarkers_;
};


/**
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.stockModule.Chart.prototype.eventMarkersInvalidated_ = function(e) {
  this.suspendSignalsDispatching();
  for (var i = 0; i < this.plots_.length; i++) {
    this.plots_[i].eventMarkers().invalidate(anychart.ConsistencyState.EVENT_MARKERS_DATA, anychart.Signal.NEEDS_REDRAW);
  }
  this.resumeSignalsDispatching(true);
};


//endregion
//region Interactivity
/**
 * @inheritDoc
 */
anychart.stockModule.Chart.prototype.onInteractivitySignal = goog.nullFunction;


/**
 * Highlights points on all charts by ratio of current selected range. Used by plots.
 * @param {number} xRatio
 * @param {number} yRatio
 * @param {number} clientX
 * @param {number} clientY
 * @param {anychart.stockModule.Plot} plot
 */
anychart.stockModule.Chart.prototype.highlightAtRatio = function(xRatio, yRatio, clientX, clientY, plot) {
  this.highlightedRatio_ = xRatio;
  this.highlightedYRatio_ = yRatio;
  this.highlightedClientX_ = clientX;
  this.highlightedClientY_ = clientY;
  this.highlightSourcePlot_ = plot;
  this.highlightAtRatio_(xRatio, yRatio, clientX, clientY, plot);
};


/**
 * Removes highlight.
 */
anychart.stockModule.Chart.prototype.unhighlight = function() {
  this.highlightedRatio_ = NaN;
  this.highlightedYRatio_ = NaN;
  this.highlightedClientX_ = NaN;
  this.highlightedClientY_ = NaN;
  this.highlightSourcePlot_ = null;
  this.unhighlight_();
};


/**
 * Returns last visible date.
 * @return {number}
 */
anychart.stockModule.Chart.prototype.getLastDate = function() {
  return this.dataController_.getLastVisibleKey();
};


/**
 * Prevents chart from highlighting points.
 */
anychart.stockModule.Chart.prototype.preventHighlight = function() {
  this.highlightPrevented_ = true;
  this.unhighlight_();
};


/**
 * Turns highlight prevention off and refreshes points highlight if necessary.
 */
anychart.stockModule.Chart.prototype.allowHighlight = function() {
  this.highlightPrevented_ = false;
  this.refreshHighlight_();
};


/**
 * Refreshes points highlight if necessary.
 * @private
 */
anychart.stockModule.Chart.prototype.refreshHighlight_ = function() {
  if (!isNaN(this.highlightedRatio_)) {
    this.highlightAtRatio_(this.highlightedRatio_, this.highlightedYRatio_, this.highlightedClientX_, this.highlightedClientY_, this.highlightSourcePlot_);
  }
};


/**
 * Highlights passed ratio.
 * @param {number} xRatio
 * @param {number} yRatio
 * @param {number} clientX
 * @param {number} clientY
 * @param {anychart.stockModule.Plot} sourcePlot - .
 * @private
 */
anychart.stockModule.Chart.prototype.highlightAtRatio_ = function(xRatio, yRatio, clientX, clientY, sourcePlot) {
  if (this.highlightPrevented_ || xRatio < 0 || xRatio > 1) return;
  var rawValue = this.xScale().inverseTransform(xRatio);
  var value = this.dataController_.alignHighlight(rawValue);
  if (isNaN(value)) return;

  var i;
  var closestSeriesInfo;
  var sourcePlotInfo = (sourcePlot && sourcePlot.enabled()) ? sourcePlot.prepareHighlight(value) : null;
  if (sourcePlotInfo)
    closestSeriesInfo = this.getClosestSeriesInfo_(sourcePlotInfo, yRatio);

  for (i = 0; i < this.plots_.length; i++) {
    if (this.plots_[i]) {
      var plot = this.plots_[i];
      var closestSeriesInfoArg = plot == sourcePlot ? closestSeriesInfo : void 0; // We need this argument only for the current plot.
      plot.highlight(value, rawValue, sourcePlot, clientY, closestSeriesInfoArg, plot === sourcePlot);
    }
  }
  this.highlighted_ = true;

  var grouping = /** @type {anychart.stockModule.Grouping} */(this.grouping());
  var extendedContext = {
    'hoveredDate': {value: value, type: anychart.enums.TokenType.DATE_TIME},
    'rawHoveredDate': {value: rawValue, type: anychart.enums.TokenType.DATE_TIME},
    'dataIntervalUnit': {value: grouping.getCurrentDataInterval()['unit'], type: anychart.enums.TokenType.STRING},
    'dataIntervalUnitCount': {
      value: grouping.getCurrentDataInterval()['count'],
      type: anychart.enums.TokenType.NUMBER
    },
    'isGrouped': {value: grouping.isGrouped()}
  };

  /**
   * @type {!anychart.core.ui.Tooltip}
   */
  var tooltip = /** @type {!anychart.core.ui.Tooltip} */(this.tooltip());
  if (this.xScale_.isValueInDummyRange(rawValue)) { //deciding whether to hide tooltip.
    tooltip.hide();

  } else if (tooltip.getOption('displayMode') == anychart.enums.TooltipDisplayMode.UNION &&
      tooltip.getOption('positionMode') != anychart.enums.TooltipPositionMode.POINT) {

    var eventInfo = {
      'type': anychart.enums.EventType.POINTS_HOVER,
      'infoByPlots': goog.array.map(this.plots_, function(plot) {
        return {
          'plot': plot,
          'infoBySeries': (plot && plot.enabled()) ? plot.prepareHighlight(value) : null
        };
      }),
      'hoveredDate': value
    };

    var points = [];
    var info = eventInfo['infoByPlots'];
    for (i = 0; i < info.length; i++) {
      if (info[i]) {
        var seriesInfo = info[i]['infoBySeries'];
        if (seriesInfo) {
          for (var j = 0; j < seriesInfo.length; j++) {
            var series = seriesInfo[j]['series'];
            if (series)
              points.push({'series': series});
          }
        }
      }
    }
    tooltip.showForSeriesPoints(points, clientX, clientY, null, false, extendedContext);

  } else if (tooltip.getOption('displayMode') == anychart.enums.TooltipDisplayMode.SINGLE) { // DVF-4056
    if (closestSeriesInfo && closestSeriesInfo['distance'] < 0.03) {
      var hoveredSeries = closestSeriesInfo['series'];
      tooltip.showForSeriesPoints([{'series': hoveredSeries}], clientX, clientY, hoveredSeries, false, extendedContext);
    } else
      tooltip.hide();
  }
};


/**
 * Finds closest series (by yRatio) in array of highlighted data rows for each series of the plot.
 *
 * @param {!Array.<anychart.stockModule.Plot.HighlightedSeriesInfo>} sourcePlotInfo
 * @param {number} yRatio Cursor Y ratio.
 *
 * @return {(anychart.stockModule.Plot.HighlightedSeriesInfo|null)} Highlighted data row for series that is actually closest to cursor.
 * @private
 */
anychart.stockModule.Chart.prototype.getClosestSeriesInfo_ = function(sourcePlotInfo, yRatio) {
  var result = null;
  var closestIndex = -1;
  var distance = Infinity;
  var pointYRatio;

  /*
   * Walk trough every series info to get most close distance between Y ratio of the cursor and highlighted series point's value.
   */
  for (var i = 0; i < sourcePlotInfo.length; i++) {
    var inf = sourcePlotInfo[i];
    var ser = inf['series'];
    var pt = inf['point'];
    if (pt && ser) {
      var scale = ser.yScale();

      /*
        Should consider that
          - OHLC series returns 'close' as 'value'
          - Range series returns 'high' as 'value'
          - etc.
       */
      var value = anychart.utils.getFirstNotNullValue(pt.get('value'), pt.get('close'), pt.get('high'));
      value = anychart.utils.toNumber(value);

      if (!isNaN(value)) {
        var ptYRatio = scale.transform(value);
        var yR = scale.inverted() ? yRatio : 1 - yRatio;
        var d = Math.abs(ptYRatio - yR);
        if (distance > d) {
          distance = d;
          pointYRatio = ptYRatio;
          closestIndex = i;
        }
      }
    }
  }

  if (closestIndex >= 0) {
    result = sourcePlotInfo[closestIndex];
    result['distance'] = distance;
    result['pointYRatio'] = pointYRatio;
  }

  return result;
};


/**
 * @private
 */
anychart.stockModule.Chart.prototype.unhighlight_ = function() {
  if (this.highlighted_/* && this.dispatchEvent(anychart.enums.EventType.UNHIGHLIGHT)*/) {
    this.highlighted_ = false;
    for (var i = 0; i < this.plots_.length; i++) {
      var plot = this.plots_[i];
      if (plot)
        plot.unhighlight();
    }
    this.tooltip().hide();
  }
};


/** @inheritDoc */
anychart.stockModule.Chart.prototype.createInteractivitySettings = function() {
  return new anychart.stockModule.Interactivity(this);
};


//endregion
//region Crosshair
//----------------------------------------------------------------------------------------------------------------------
//
//  Crosshair
//
//----------------------------------------------------------------------------------------------------------------------
/**
 *
 * @param {(Object|boolean|null)=} opt_value
 * @return {!(anychart.core.ui.Crosshair|anychart.stockModule.Chart)}
 */
anychart.stockModule.Chart.prototype.crosshair = function(opt_value) {
  if (!this.crosshair_) {
    this.crosshair_ = new anychart.core.ui.Crosshair();
    this.crosshair_.needsForceSignalsDispatching(true);
    this.setupCreated('crosshair', this.crosshair_);
    this.crosshair_.listenSignals(this.onCrosshairSignal_, this);
    this.invalidate(anychart.ConsistencyState.AXES_CHART_CROSSHAIR, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(opt_value)) {
    this.crosshair_.setup(opt_value);
    return this;
  } else {
    return this.crosshair_;
  }
};


/**
 * Listener for crosshair invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.stockModule.Chart.prototype.onCrosshairSignal_ = function(event) {
  this.invalidate(anychart.ConsistencyState.AXES_CHART_CROSSHAIR, anychart.Signal.NEEDS_REDRAW);
};


//endregion
//region Selection Marquee
//------------------------------------------------------------------------------
//
//  Selection Marquee
//
//------------------------------------------------------------------------------
/** @inheritDoc */
anychart.stockModule.Chart.prototype.getSelectMarqueeBounds = function() {
  var bounds = [];
  for (var i = 0; i < this.plots_.length; i++) {
    /** @type {anychart.stockModule.Plot} */
    var plot = this.plots_[i];
    bounds.push(plot && plot.enabled() ? plot.getPlotBounds() : null);
  }
  return bounds;
};


/** @inheritDoc */
anychart.stockModule.Chart.prototype.createSelectMarqueeEvent = function(eventType, plotIndex, left, top, width, height, browserEvent) {
  var res = anychart.stockModule.Chart.base(this, 'createSelectMarqueeEvent', eventType, plotIndex, left, top, width, height, browserEvent);
  var plot = /** @type {anychart.stockModule.Plot} */(this.plots_[plotIndex]);
  var plotBounds = plot.getPlotBounds();
  var leftRatio = (res['left'] - plotBounds.left) / plotBounds.width;
  var rightRatio = (res['left'] + res['width'] - plotBounds.left) / plotBounds.width;
  var topRatio = (res['top'] - plotBounds.top) / plotBounds.height;
  var bottomRatio = (res['top'] + res['height'] - plotBounds.top) / plotBounds.height;
  var xScale = this.xScale();
  var yScale = plot.yScale();
  res['plot'] = plot;
  res['plotIndex'] = plotIndex;
  res['plotBounds'] = {
    'left': plotBounds.left,
    'top': plotBounds.top,
    'width': plotBounds.width,
    'height': plotBounds.height
  };
  res['leftX'] = xScale.inverseTransform(leftRatio);
  res['rightX'] = xScale.inverseTransform(rightRatio);
  res['maxValue'] = yScale.inverseTransform(topRatio);
  res['minValue'] = yScale.inverseTransform(bottomRatio);
  if (yScale.inverted()) {
    var tmp = res['minValue'];
    res['minValue'] = res['maxValue'];
    res['maxValue'] = tmp;
  }
  return res;
};


//endregion
//region Descriptors
/**
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.stockModule.Chart.PROPERTY_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'plotsManualBounds',
      anychart.core.settings.booleanNormalizer);
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'zoomMarqueeFill',
      anychart.core.settings.fillNormalizer);
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'zoomMarqueeStroke',
      anychart.core.settings.strokeNormalizer);

  return map;
})();
anychart.core.settings.populate(anychart.stockModule.Chart, anychart.stockModule.Chart.PROPERTY_DESCRIPTORS);


//endregion
//region Zoom Marquee
//------------------------------------------------------------------------------
//
//  Zoom Marquee
//
//------------------------------------------------------------------------------
/**
 * Starts zoom marquee.
 * @param {boolean=} opt_repeat
 * @param {boolean=} opt_asRect
 * @return {anychart.stockModule.Chart}
 */
anychart.stockModule.Chart.prototype.startZoomMarquee = function(opt_repeat, opt_asRect) {
  this.startIRDrawing(this.onZoomMarqueeStart_, null, this.onZoomMarqueeFinish_, this.getSelectMarqueeBounds(),
      false, acgraph.vector.Cursor.CROSSHAIR, opt_repeat, /** @type {acgraph.vector.Stroke} */ (this.getOption('zoomMarqueeStroke')), /** @type {acgraph.vector.Fill} */ (this.getOption('zoomMarqueeFill')), !opt_asRect);
  return this;
};


/**
 *
 * @param {number} plotIndex
 * @param {number} left
 * @param {number} top
 * @param {number} width
 * @param {number} height
 * @param {acgraph.events.BrowserEvent} browserEvent
 * @return {boolean}
 * @private
 */
anychart.stockModule.Chart.prototype.onZoomMarqueeStart_ = function(plotIndex, left, top, width, height, browserEvent) {
  this.preventHighlight();
  return true;
};


/**
 *
 * @param {number} plotIndex
 * @param {number} left
 * @param {number} top
 * @param {number} width
 * @param {number} height
 * @param {acgraph.events.BrowserEvent} browserEvent
 * @return {boolean}
 * @private
 */
anychart.stockModule.Chart.prototype.onZoomMarqueeFinish_ = function(plotIndex, left, top, width, height, browserEvent) {
  if (Math.abs(width) > anychart.stockModule.Chart.MINIMAL_MARQUEE_ZOOM_PIXEL_WIDTH) {
    var plotBounds = this.plots_[plotIndex].getPlotBounds();
    var scale = /** @type {anychart.stockModule.scales.Scatter} */(this.xScale());
    var startRatio = (left - plotBounds.left) / plotBounds.width;
    var endRatio = (left + width - plotBounds.left) / plotBounds.width;
    if (startRatio > endRatio) {
      var tmp = startRatio;
      startRatio = endRatio;
      endRatio = tmp;
    }
    if (endRatio - startRatio < anychart.stockModule.Chart.MINIMAL_MARQUEE_ZOOM_RANGE_RATIO) {
      var centerRatio = (startRatio + endRatio) / 2;
      startRatio = centerRatio - anychart.stockModule.Chart.MINIMAL_MARQUEE_ZOOM_RANGE_RATIO / 2;
      endRatio = centerRatio + anychart.stockModule.Chart.MINIMAL_MARQUEE_ZOOM_RANGE_RATIO / 2;
    }
    var start = scale.inverseTransform(startRatio);
    var end = scale.inverseTransform(endRatio);
    var startIndex = this.dataController_.getIndexByKey(start);
    var endIndex = this.dataController_.getIndexByKey(end);
    if (endIndex - startIndex < 1) { // can't zoom in less than 2 points
      start = this.dataController_.getKeyByIndex(Math.floor(startIndex));
      end = this.dataController_.getKeyByIndex(Math.ceil(endIndex));
    }
    if ((!isNaN(start) && !isNaN(end)) &&
        (start != this.dataController_.getFirstSelectedKey() || end != this.dataController_.getLastSelectedKey()) &&
        this.dispatchRangeChange_(anychart.enums.EventType.SELECTED_RANGE_CHANGE_START, anychart.enums.StockRangeChangeSource.MARQUEE) &&
        this.dispatchRangeChange_(anychart.enums.EventType.SELECTED_RANGE_BEFORE_CHANGE, anychart.enums.StockRangeChangeSource.MARQUEE, start, end)) {
      this.selectRangeInternal_(start, end);
      this.dispatchRangeChange_(
          anychart.enums.EventType.SELECTED_RANGE_CHANGE,
          anychart.enums.StockRangeChangeSource.MARQUEE);
      this.dispatchRangeChange_(
          anychart.enums.EventType.SELECTED_RANGE_CHANGE_FINISH,
          anychart.enums.StockRangeChangeSource.MARQUEE);
    }
  }
  this.allowHighlight();
  return true;
};


//endregion
//region --- Splitters
/**
 * Splitters settings.
 * @param {(Object|boolean|null)=} opt_value
 * @return {!(anychart.stockModule.splitter.SplittersSettings|anychart.stockModule.Chart)}
 */
anychart.stockModule.Chart.prototype.splitters = function(opt_value) {
  if (!this.splitters_) {
    this.splitters_ = new anychart.stockModule.splitter.SplittersSettings();
    this.setupCreated('splitters', this.splitters_);
    this.splitters_.listenSignals(this.splittersInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    this.splitters_.setup(opt_value);
    return this;
  } else {
    return this.splitters_;
  }
};


/**
 * Splitters signals handler.
 * @param {anychart.SignalEvent} e - .
 * @private
 */
anychart.stockModule.Chart.prototype.splittersInvalidated_ = function(e) {
  this.invalidate(anychart.ConsistencyState.STOCK_SPLITTERS, anychart.Signal.NEEDS_REDRAW);
};


//endregion
//region Mouse wheel interactivity
//------------------------------------------------------------------------------
//
//  Mouse wheel interactivity
//
//------------------------------------------------------------------------------
/**
 * Mouse wheel handler.
 * @param {goog.events.MouseWheelEvent} e
 * @private
 */
anychart.stockModule.Chart.prototype.handleMouseWheel_ = function(e) {
  var bounds = this.getSelectMarqueeBounds();
  var cp = this.container().getStage().getClientPosition();
  var x = e['clientX'] - cp.x;
  var y = e['clientY'] - cp.y;
  var boundsItem;
  var inBounds = false;
  if (bounds && bounds.length) {
    for (var i = 0; i < bounds.length; i++) {
      boundsItem = /** @type {anychart.math.Rect} */(bounds[i]);
      if (boundsItem &&
          boundsItem.left <= x && x <= boundsItem.left + boundsItem.width &&
          boundsItem.top <= y && y <= boundsItem.top + boundsItem.height) {
        inBounds = true;
        break;
      }
    }
  }

  var scroller = this.getCreated('scroller');
  if (!inBounds && scroller && scroller.isVisible()) {
    boundsItem = scroller.getPixelBounds();
    inBounds = (boundsItem &&
        boundsItem.left <= x && x <= boundsItem.left + boundsItem.width &&
        boundsItem.top <= y && y <= boundsItem.top + boundsItem.height);
  }
  if (inBounds) {
    var doZoom,
        delta;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      doZoom = !(e.shiftKey || e.ctrlKey || e.metaKey);
      delta = e.deltaY;
    } else {
      doZoom = false;
      delta = e.deltaX;
    }
    delta = goog.math.sign(delta) * Math.min(Math.abs(delta), anychart.stockModule.Chart.MOUSE_WHEEL_MAX_DELTA);

    var interactivity = /** @type {anychart.stockModule.Interactivity} */(this.interactivity());
    if (doZoom) {
      if (interactivity.getOption('zoomOnMouseWheel')) {
        var first,
            last,
            start,
            end;
        var ordinal = anychart.utils.instanceOf(this.xScale(), anychart.stockModule.scales.Ordinal);
        first = this.dataController_.getFirstKey();
        last = this.dataController_.getLastKey();
        if (ordinal) {
          first = this.dataController_.getIndexByKey(first);
          last = this.dataController_.getIndexByKey(last);
          start = this.dataController_.getFirstSelectedIndex();
          end = this.dataController_.getLastSelectedIndex();
        } else {
          start = this.dataController_.getFirstSelectedKey();
          end = this.dataController_.getLastSelectedKey();
        }
        if (isNaN(start) || isNaN(end))
          return;
        var factor = (delta * anychart.stockModule.Chart.ZOOM_FACTOR_PER_WHEEL_STEP) * (end - start);
        start -= factor;
        end += factor;
        if (end - start > last - first) {
          start = first;
          end = last;
        } else {
          if (start < first) {
            end += first - start;
            start = first;
          }
          if (end > last) {
            start += last - end;
            end = last;
          }
        }
        if (ordinal) {
          if (end - start < 1) {
            start = Math.round(start);
            end = start + 1;
          }
          start = this.dataController_.getKeyByIndex(start);
          end = this.dataController_.getKeyByIndex(end);
        } else {
          var startIndex = this.dataController_.getIndexByKey(start);
          var endIndex = this.dataController_.getIndexByKey(end);
          if (endIndex - startIndex < 1) {
            startIndex = Math.round(startIndex);
            endIndex = startIndex + 1;
            start = this.dataController_.getKeyByIndex(startIndex);
            end = this.dataController_.getKeyByIndex(endIndex);
          }
        }
        if ((start != this.dataController_.getFirstSelectedKey() ||
            end != this.dataController_.getLastSelectedKey())) {
          e.preventDefault();

          this.mwZoomStart_ = start;
          this.mwZoomEnd_ = end;
          if (goog.isDef(this.mwScrollFrame_)) {
            anychart.window.cancelAnimationFrame(this.mwScrollFrame_);
            this.mwScrollAction_();
          }
          if (!goog.isDef(this.mwZoomFrame_)) {
            this.mwZoomFrame_ = anychart.window.requestAnimationFrame(this.mwZoomAction_);
          }
        }
      }
    } else {
      if (interactivity.getOption('scrollOnMouseWheel')) {
        var anchor = this.getDragAnchor();
        if (isNaN(anchor.firstIndex) || isNaN(anchor.lastIndex))
          return;
        var ratio = this.limitDragRatio(-delta * anychart.stockModule.Chart.SCROLL_FACTOR_PER_WHEEL_STEP, anchor);
        if (ratio) {
          e.preventDefault();

          this.mwScrollRatio_ = ratio;
          this.mwScrollAnchor_ = anchor;
          if (goog.isDef(this.mwZoomFrame_)) {
            anychart.window.cancelAnimationFrame(this.mwZoomFrame_);
            this.mwZoomAction_();
          }
          if (!goog.isDef(this.mwScrollFrame_)) {
            this.mwScrollFrame_ = anychart.window.requestAnimationFrame(this.mwScrollAction_);
          }
        }
      }
    }
  }
};


/**
 * Action on mouse wheel zoom.
 * @private
 */
anychart.stockModule.Chart.prototype.doMWZoom_ = function() {
  this.mwZoomFrame_ = undefined;
  if (this.dispatchRangeChange_(
          anychart.enums.EventType.SELECTED_RANGE_CHANGE_START,
          anychart.enums.StockRangeChangeSource.MOUSE_WHEEL) &&
      this.dispatchRangeChange_(
          anychart.enums.EventType.SELECTED_RANGE_BEFORE_CHANGE,
          anychart.enums.StockRangeChangeSource.MOUSE_WHEEL,
          this.mwZoomStart_, this.mwZoomEnd_)) {
    this.selectRangeInternal_(this.mwZoomStart_, this.mwZoomEnd_);
    this.dispatchRangeChange_(
        anychart.enums.EventType.SELECTED_RANGE_CHANGE,
        anychart.enums.StockRangeChangeSource.MOUSE_WHEEL);
    this.dispatchRangeChange_(
        anychart.enums.EventType.SELECTED_RANGE_CHANGE_FINISH,
        anychart.enums.StockRangeChangeSource.MOUSE_WHEEL);
  }
};


/**
 * Action on mouse wheel scroll.
 * @private
 */
anychart.stockModule.Chart.prototype.doMWScroll_ = function() {
  this.mwScrollFrame_ = undefined;
  if (this.dispatchRangeChange_(
          anychart.enums.EventType.SELECTED_RANGE_CHANGE_START,
          anychart.enums.StockRangeChangeSource.MOUSE_WHEEL)) {
    this.dragToRatio(this.mwScrollRatio_, this.mwScrollAnchor_, anychart.enums.StockRangeChangeSource.MOUSE_WHEEL);
    this.dispatchRangeChange_(
        anychart.enums.EventType.SELECTED_RANGE_CHANGE_FINISH,
        anychart.enums.StockRangeChangeSource.MOUSE_WHEEL);
  }
};


//endregion
//region Context menu
//------------------------------------------------------------------------------
//
//  Context menu
//
//------------------------------------------------------------------------------
/**
 * Items map.
 * @type {Object.<string, anychart.ui.ContextMenu.Item>}
 */
anychart.stockModule.Chart.contextMenuItems = {
  // Item 'Keep Only'.
  'zoom-marquee-start': {
    'index': 8,
    'text': 'Start zoom marquee',
    'eventType': 'anychart.startZoomMarquee',
    'action': function(context) {
      context['menuParent'].startZoomMarquee(false);
    }
  }
};


/**
 * Menu map.
 * @type {Object.<string, Object.<string, anychart.ui.ContextMenu.Item>>}
 */
anychart.stockModule.Chart.contextMenuMap = {
  // Stock 'Default menu'. (will be added to 'main')
  'stock': {
    'zoom-marquee-start': anychart.stockModule.Chart.contextMenuItems['zoom-marquee-start'],
    //'select-marquee-start': anychart.core.Chart.contextMenuItems['select-marquee-start'],
    'stock-specific-separator': {'index': 9.4}
  }
};


/** @inheritDoc */
anychart.stockModule.Chart.prototype.specificContextMenuItems = function(items, context, isPointContext) {
  goog.object.extend(items, /** @type {Object} */ (anychart.utils.recursiveClone(anychart.stockModule.Chart.contextMenuMap['stock'])));
  return items;
};


//endregion
//region Scroller change
//----------------------------------------------------------------------------------------------------------------------
//
//  Scroller change
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @param {string} source
 * @return {anychart.enums.StockRangeChangeSource}
 * @private
 */
anychart.stockModule.Chart.prototype.transformScrollerSource_ = function(source) {
  switch (source) {
    case anychart.enums.ScrollerRangeChangeSource.THUMB_DRAG:
      return anychart.enums.StockRangeChangeSource.SCROLLER_THUMB_DRAG;
    case anychart.enums.ScrollerRangeChangeSource.SELECTED_RANGE_DRAG:
      return anychart.enums.StockRangeChangeSource.SCROLLER_DRAG;
      //case anychart.enums.ScrollerRangeChangeSource.BACKGROUND_CLICK:
    default: // for very weird case when there is an incorrect source at incoming event.
      return anychart.enums.StockRangeChangeSource.SCROLLER_CLICK;
  }
};


/**
 * Scroller change start event handler.
 * @param {anychart.core.ui.Scroller.ScrollerChangeEvent} e
 * @return {boolean}
 * @private
 */
anychart.stockModule.Chart.prototype.scrollerChangeStartHandler_ = function(e) {
  var res = this.dispatchRangeChange_(
      anychart.enums.EventType.SELECTED_RANGE_CHANGE_START,
      this.transformScrollerSource_(e['source']));
  if (res)
    this.preventHighlight();
  return res;
};


/**
 * Scroller change start event handler.
 * @param {anychart.core.ui.Scroller.ScrollerChangeEvent} e
 * @private
 */
anychart.stockModule.Chart.prototype.scrollerChangeHandler_ = function(e) {
  e.preventDefault();
  var first = e['startKey'];
  var last = e['endKey'];
  var source = this.transformScrollerSource_(e['source']);
  if (this.dispatchRangeChange_(
      anychart.enums.EventType.SELECTED_RANGE_BEFORE_CHANGE,
      source,
      Math.min(first, last), Math.max(first, last))) {
    this.selectRangeInternal_(first, last);
    this.dispatchRangeChange_(anychart.enums.EventType.SELECTED_RANGE_CHANGE, source);
  }
};


/**
 * Scroller change start event handler.
 * @param {anychart.core.ui.Scroller.ScrollerChangeEvent} e
 * @private
 */
anychart.stockModule.Chart.prototype.scrollerChangeFinishHandler_ = function(e) {
  e.preventDefault();
  this.dispatchRangeChange_(
      anychart.enums.EventType.SELECTED_RANGE_CHANGE_FINISH,
      this.transformScrollerSource_(e['source']));
  this.allowHighlight();
};


//endregion
//region Drag
//----------------------------------------------------------------------------------------------------------------------
//
//  Drag
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @typedef {{
 *    firstKey: number,
 *    lastKey: number,
 *    firstIndex: number,
 *    lastIndex: number,
 *    minKey: number,
 *    maxKey: number,
 *    minIndex: number,
 *    maxIndex: number
 * }}
 */
anychart.stockModule.Chart.DragAnchor;


/**
 * Returns current first selected.
 * @return {anychart.stockModule.Chart.DragAnchor}
 */
anychart.stockModule.Chart.prototype.getDragAnchor = function() {
  var controller = this.dataController_;
  var vf = controller.getFirstKey();
  var vl = controller.getLastKey();
  var vfi = this.getIndexByKey(vf);
  var vli = this.getIndexByKey(vl);
  var fs = controller.getFirstSelectedKey();
  var ls = controller.getLastSelectedKey();
  var fsi = controller.getFirstSelectedIndex();//this.getIndexByKey(fs);
  var lsi = controller.getLastSelectedIndex();//this.getIndexByKey(ls);
  return {
    firstKey: fs,
    lastKey: ls,
    firstIndex: fsi,
    lastIndex: lsi,
    minKey: vf,
    maxKey: vl,
    minIndex: vfi,
    maxIndex: vli
  };
};


/**
 * Refreshes drag anchor.
 * @param {anychart.stockModule.Chart.DragAnchor} anchor
 */
anychart.stockModule.Chart.prototype.refreshDragAnchor = function(anchor) {
  var controller = this.dataController_;
  var vf = controller.getFirstKey();
  var vl = controller.getLastKey();
  var vfi = this.getIndexByKey(vf);
  var vli = this.getIndexByKey(vl);
  var fs = controller.getFirstSelectedKey();
  var ls = controller.getLastSelectedKey();
  var fsi = controller.getFirstSelectedIndex();//this.getIndexByKey(fs);
  var lsi = controller.getLastSelectedIndex();//this.getIndexByKey(ls);
  anchor.firstKey = fs;
  anchor.lastKey = ls;
  anchor.firstIndex = fsi;
  anchor.lastIndex = lsi;
  anchor.minKey = vf;
  anchor.maxKey = vl;
  anchor.minIndex = vfi;
  anchor.maxIndex = vli;
};


/**
 * Drags the chart to passed position. If opt_source passed - dispatches with that source instead of plot drag.
 * @param {number} ratio
 * @param {anychart.stockModule.Chart.DragAnchor} anchor
 * @param {anychart.enums.StockRangeChangeSource=} opt_source
 */
anychart.stockModule.Chart.prototype.dragToRatio = function(ratio, anchor, opt_source) {
  var params = this.getDragParamsIfChanged(ratio, anchor);
  if (params) {
    this.selectRangeByAnchor_(params[0], params[1], anchor, opt_source);
  }
};


/**
 *
 * @param {number} start
 * @param {number} end
 * @param {anychart.stockModule.Chart.DragAnchor} anchor
 * @param {anychart.enums.StockRangeChangeSource=} opt_source
 * @private
 */
anychart.stockModule.Chart.prototype.selectRangeByAnchor_ = function(start, end, anchor, opt_source) {
  if (this.dispatchRangeChange_(
          anychart.enums.EventType.SELECTED_RANGE_BEFORE_CHANGE,
          opt_source || anychart.enums.StockRangeChangeSource.PLOT_DRAG,
          start, end)) {
    this.selectRangeInternal_(start, end);
    anchor.firstIndex = this.getIndexByKey(anchor.firstKey);
    anchor.lastIndex = this.getIndexByKey(anchor.lastKey);
    anchor.minIndex = this.getIndexByKey(anchor.minKey);
    anchor.maxIndex = this.getIndexByKey(anchor.maxKey);
    this.dispatchRangeChange_(
        anychart.enums.EventType.SELECTED_RANGE_CHANGE,
        opt_source || anychart.enums.StockRangeChangeSource.PLOT_DRAG);
  }
};


/**
 * Drags the chart to passed position. If opt_source passed - dispatches with that source instead of plot drag.
 * @param {anychart.stockModule.Chart.DragAnchor} anchor
 * @param {number} dXRatio
 * @param {number} dDistanceRatio
 * @param {anychart.enums.StockRangeChangeSource=} opt_source
 */
anychart.stockModule.Chart.prototype.pinchZoom = function(anchor, dXRatio, dDistanceRatio, opt_source) {
  var scale = this.xScale();
  var valueDiff, range, rangeHalf, start, end;
  dDistanceRatio = Math.min(dDistanceRatio, 1.9);
  if (anychart.utils.instanceOf(scale, anychart.stockModule.scales.Ordinal)) {
    range = anchor.lastIndex - anchor.firstIndex;
    valueDiff = dXRatio * range;
    rangeHalf = range * (1 - dDistanceRatio) / 2;
    start = this.getKeyByIndex(anchor.firstIndex - valueDiff - rangeHalf);
    end = this.getKeyByIndex(anchor.lastIndex - valueDiff + rangeHalf);
  } else {
    range = anchor.lastKey - anchor.firstKey;
    valueDiff = dXRatio * range;
    rangeHalf = range * (1 - dDistanceRatio) / 2;
    start = anchor.firstKey - valueDiff - rangeHalf;
    end = anchor.lastKey - valueDiff + rangeHalf;
  }
  if (start != this.dataController_.getFirstSelectedKey() || end != this.dataController_.getLastSelectedKey())
    this.selectRangeByAnchor_(start, end, anchor, opt_source);
};


/**
 * If new drag params differ from current position - returns new start/end keys.
 * @param {number} ratio
 * @param {anychart.stockModule.Chart.DragAnchor} anchor
 * @return {?Array.<number>} [start, end]
 */
anychart.stockModule.Chart.prototype.getDragParamsIfChanged = function(ratio, anchor) {
  var scale = this.xScale();
  var valueDiff,
      range,
      start,
      end;
  if (anychart.utils.instanceOf(scale, anychart.stockModule.scales.Ordinal)) {
    range = anchor.lastIndex - anchor.firstIndex;
    valueDiff = ratio * range;
    start = this.getKeyByIndex(anchor.firstIndex - valueDiff);
    end = this.getKeyByIndex(anchor.lastIndex - valueDiff);
  } else {
    range = anchor.lastKey - anchor.firstKey;
    valueDiff = ratio * range;
    start = anchor.firstKey - valueDiff;
    end = anchor.lastKey - valueDiff;
  }
  if (start > end) {
    var tmp = start;
    start = end;
    end = tmp;
  }
  return (start != this.dataController_.getFirstSelectedKey() || end != this.dataController_.getLastSelectedKey()) ?
      [start, end] :
      null;
};


/**
 * Limits passed drag ratio.
 * @param {number} ratio
 * @param {Object} anchor
 * @return {number}
 */
anychart.stockModule.Chart.prototype.limitDragRatio = function(ratio, anchor) {
  var scale = this.xScale();
  var range, start, end;
  if (anychart.utils.instanceOf(scale, anychart.stockModule.scales.Ordinal)) {
    range = anchor.lastIndex - anchor.firstIndex;
    start = (anchor.minIndex - anchor.firstIndex) / range;
    end = (anchor.maxIndex - anchor.firstIndex) / range;
  } else {
    range = anchor.lastKey - anchor.firstKey;
    start = (anchor.minKey - anchor.firstKey) / range;
    end = (anchor.maxKey - anchor.firstKey) / range;
  }
  return -goog.math.clamp(-ratio, start, end - 1);
};


/**
 * Asks the chart if the drag process can be initiated.
 * @return {boolean}
 */
anychart.stockModule.Chart.prototype.askDragStart = function() {
  var res = !this.inMarquee() && this.dispatchRangeChange_(
      anychart.enums.EventType.SELECTED_RANGE_CHANGE_START,
      anychart.enums.StockRangeChangeSource.PLOT_DRAG);
  if (res) {
    this.inDrag_ = true;
    this.preventHighlight();
    goog.style.setStyle(document['body'], 'cursor', acgraph.vector.Cursor.EW_RESIZE);
  }
  return res;
};


/**
 * Notifies the chart, that the drag process has ended.
 */
anychart.stockModule.Chart.prototype.dragEnd = function() {
  this.inDrag_ = false;
  goog.style.setStyle(document['body'], 'cursor', '');
  this.dispatchRangeChange_(
      anychart.enums.EventType.SELECTED_RANGE_CHANGE_FINISH,
      anychart.enums.StockRangeChangeSource.PLOT_DRAG);
  this.allowHighlight();
};


//endregion
//region Serialization / deserialization / disposing
//----------------------------------------------------------------------------------------------------------------------
//
//  Serialization / deserialization / disposing
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.stockModule.Chart.prototype.disposeInternal = function() {
  // plot annotations should be disposed before chart annotations
  goog.disposeAll(
      this.plots_,
      this.scroller_,
      this.dataController_,
      this.annotations_,
      this.eventMarkers_,
      this.mouseWheelHandler_,
      this.crosshair_,
      this.splitters_,
      this.splitterController_);

  this.plots_ = null;
  this.scroller_ = null;
  this.annotations_ = null;
  this.eventMarkers_ = null;
  this.mouseWheelHandler_ = null;
  this.crosshair_ = null;
  this.splitters_ = null;
  this.splitterController_ = null;

  delete this.dataController_;
  delete this.defaultAnnotationSettings_;

  anychart.stockModule.Chart.base(this, 'disposeInternal');
};


/** @inheritDoc */
anychart.stockModule.Chart.prototype.serialize = function() {
  var json = anychart.stockModule.Chart.base(this, 'serialize');
  delete json['noDataLabel'];
  json['grouping'] = this.grouping().serialize();
  json['scrollerGrouping'] = this.scrollerGrouping().serialize();
  json['xScale'] = this.xScale().serialize();
  json['scroller'] = this.scroller().serialize();
  json['plots'] = goog.array.map(this.plots_, function(element) {
    return element ? element.serialize() : null;
  });
  json['crosshair'] = this.crosshair().serialize();
  json['eventMarkers'] = this.eventMarkers().serialize();

  anychart.core.settings.serialize(this, anychart.stockModule.Chart.PROPERTY_DESCRIPTORS, json);
  json['interactivity'] = this.interactivity().serialize();
  return json;
};


/** @inheritDoc */
anychart.stockModule.Chart.prototype.setupByJSON = function(config, opt_default) {
  anychart.stockModule.Chart.base(this, 'setupByJSON', config, opt_default);
  var json;

  if ('xScale' in config)
    this.xScale(config['xScale']);

  this.setupElements(opt_default, config);

  this.crosshair(config['crosshair']);

  if ('defaultPlotSettings' in config)
    this.defaultPlotSettings(config['defaultPlotSettings']);

  this.scroller(config['scroller']);
  this.grouping(config['grouping']);
  this.scrollerGrouping(config['scrollerGrouping']);

  if ('defaultAnnotationSettings' in config)
    this.defaultAnnotationSettings(config['defaultAnnotationSettings']);

  json = config['eventMarkers'];
  if (json)
    this.eventMarkers().setupInternal(!!opt_default, json);

  json = config['selectedRange'];
  if (goog.isObject(json)) {
    this.selectRange(json['start'], json['end']);
  }

  anychart.core.settings.deserialize(this, anychart.stockModule.Chart.PROPERTY_DESCRIPTORS, config);
  this.interactivity(config['interactivity']);
};


/**
 * Create and setup elements that should be created before draw
 * @param {boolean=} opt_default
 * @param {Object=} opt_config
 */
anychart.stockModule.Chart.prototype.setupElements = function(opt_default, opt_config) {
  var config = opt_config || this.themeSettings;
  var json = config['plots'];
  if (goog.isArray(json)) {
    for (var i = 0; i < json.length; i++) {
      this.plotInternal(i, json[i], opt_default);
    }
  }
};


//endregion
//region CSV
/** @inheritDoc */
anychart.stockModule.Chart.prototype.getRawCsvDataSources = function() {
  var tables = this.dataController_.getAllTables();
  var res = [];
  for (var i in tables) {
    res.push(tables[i].getStorage());
  }
  return res;
};


/** @inheritDoc */
anychart.stockModule.Chart.prototype.getCsvGrouperColumn = function() {
  return ['_', 'x'];
};


/** @inheritDoc */
anychart.stockModule.Chart.prototype.getCsvExportRow = function(x, xAlias, data, xValues, id, index, seriesXValues) {
  var xHash = anychart.utils.hash(x);
  var rowIndex;
  if (xHash in xValues) {
    rowIndex = xValues[xHash];
  } else {
    rowIndex = xValues[xHash] = data.length;
    data.push([x, xAlias]);
  }
  return data[rowIndex];
};


/** @inheritDoc */
anychart.stockModule.Chart.prototype.populateRawCsvRow = function(targetCsvRow, dataRow, headers) {
  anychart.stockModule.Chart.base(this, 'populateRawCsvRow', targetCsvRow, (/** @type {anychart.stockModule.data.TableRow} */(dataRow)).values, headers);
};


/** @inheritDoc */
anychart.stockModule.Chart.prototype.getCsvGrouperValue = function(iterator) {
  return iterator.getX();
};


/** @inheritDoc */
anychart.stockModule.Chart.prototype.getCsvGrouperAlias = function(iterator, dataHolder) {
  var pattern = dataHolder.getSelectableData().getMapping().getTable().getDTPatten();
  return anychart.format.dateTime(/** @type {number} */(iterator.getX()), pattern);
};


/** @inheritDoc */
anychart.stockModule.Chart.prototype.getCsvIterator = function(dataHolder, mode) {
  var res;
  var series = /** @type {anychart.stockModule.Series} */(dataHolder);
  switch (mode) {
    case anychart.enums.ChartDataExportMode.SELECTED:
      res = series.getDetachedIterator();
      break;
    case anychart.enums.ChartDataExportMode.GROUPED:
      res = series.getSelectableData().getExportingIterator();
      break;
    default: // anychart.enums.ChartDataExportMode.DEFAULT
      res = series.getSelectableData().getMapping().createSelectable().getIteratorInternal(false);
      break;
  }
  return res;
};


/** @inheritDoc */
anychart.stockModule.Chart.prototype.identifyCsvDataHolder = function(dataHolder) {
  return '';
};


/** @inheritDoc */
anychart.stockModule.Chart.prototype.getCsvData = function(mode) {
  var res = anychart.stockModule.Chart.base(this, 'getCsvData', mode);
  res.headers.shift();
  res.data.sort(function(a, b) {
    return /** @type {number} */(a[0]) - /** @type {number} */(b[0]);
  });
  goog.array.forEach(res.data, function(item) {
    item.shift();
  });
  return res;
};


//endregion
/**
 * Stock chart constructor function.
 * @param {boolean=} opt_allowPointSettings Allows to set point settings from data.
 * @return {anychart.stockModule.Chart}
 */
anychart.stock = function(opt_allowPointSettings) {
  var chart = new anychart.stockModule.Chart(opt_allowPointSettings);
  chart.setupElements(true);
  return chart;
};


//exports
(function() {
  var proto = anychart.stockModule.Chart.prototype;
  goog.exportSymbol('anychart.stock', anychart.stock);
  proto['plot'] = proto.plot;
  proto['crosshair'] = proto.crosshair;
  proto['scroller'] = proto.scroller;
  proto['splitters'] = proto.splitters;
  proto['xScale'] = proto.xScale;
  proto['selectRange'] = proto.selectRange;
  proto['getSelectedRange'] = proto.getSelectedRange;
  proto['getType'] = proto.getType;
  proto['legend'] = proto.legend;
  proto['grouping'] = proto.grouping;
  proto['scrollerGrouping'] = proto.scrollerGrouping;
  proto['annotations'] = proto.annotations;
  proto['eventMarkers'] = proto.eventMarkers;
  proto['getPlotsCount'] = proto.getPlotsCount;
  proto['startZoomMarquee'] = proto.startZoomMarquee;
  // auto generated
  // proto['zoomMarqueeFill'] = proto.zoomMarqueeFill;
  // proto['zoomMarqueeStroke'] = proto.zoomMarqueeStroke;
  proto['interactivity'] = proto.interactivity;
  proto['preserveSelectedRangeOnDataUpdate'] = proto.preserveSelectedRangeOnDataUpdate;
})();
