goog.provide('anychart.stockModule.Chart');

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
goog.require('anychart.stockModule.scales.IKeyIndexTransformer');
goog.require('anychart.stockModule.scales.Ordinal');
goog.require('anychart.stockModule.scales.Scatter');
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
   * Last highlighted ratio.
   * @type {number}
   * @private
   */
  this.highlightedRatio_ = NaN;

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
   * Index of last plot.
   * @type {number}
   * @private
   */
  this.lastPlotIndex_ = -1;

  /**
   * Series config.
   * @type {Object.<string, anychart.core.series.TypeConfig>}
   */
  this.seriesConfig = this.createSeriesConfig(!!opt_allowPointSettings);

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['zoomMarqueeFill', 0, 0],
    ['zoomMarqueeStroke', 0, 0]
  ]);
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
    anychart.ConsistencyState.STOCK_SCALES;


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
 * @param {boolean} allowColoring
 * @return {Object.<string, anychart.core.series.TypeConfig>}
 */
anychart.stockModule.Chart.prototype.createSeriesConfig = function(allowColoring) {
  var res = {};
  var capabilities = (
      // anychart.core.series.Capabilities.ALLOW_INTERACTIVITY |
      // anychart.core.series.Capabilities.ALLOW_POINT_SETTINGS |
      // anychart.core.series.Capabilities.ALLOW_ERROR |
      anychart.core.series.Capabilities.SUPPORTS_MARKERS |
      // anychart.core.series.Capabilities.SUPPORTS_LABELS |
      0);
  capabilities |= (allowColoring && anychart.core.series.Capabilities.ALLOW_POINT_SETTINGS);
  var discreteShapeManager = allowColoring ? anychart.enums.ShapeManagerTypes.PER_POINT : anychart.enums.ShapeManagerTypes.PER_SERIES;
  res[anychart.enums.StockSeriesType.AREA] = {
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
      anychart.core.shapeManagers.pathHatchConfig
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
      anychart.core.shapeManagers.pathStrokeConfig
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
      anychart.core.shapeManagers.pathStrokeConfig
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
      anychart.core.shapeManagers.pathStrokeConfig
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
      anychart.core.shapeManagers.pathHatchConfig
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
      anychart.core.shapeManagers.pathHatchConfig
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
      anychart.core.shapeManagers.pathHatchConfig
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
      anychart.core.shapeManagers.pathHatchConfig
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
      anychart.core.shapeManagers.pathStrokeConfig
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
  res[anychart.enums.StockSeriesType.STEP_AREA] = {
    drawerType: anychart.enums.SeriesDrawerTypes.STEP_AREA,
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
  res[anychart.enums.StockSeriesType.STEP_LINE] = {
    drawerType: anychart.enums.SeriesDrawerTypes.STEP_LINE,
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
  res[anychart.enums.StockSeriesType.HILO] = {
    drawerType: anychart.enums.SeriesDrawerTypes.RANGE_STICK,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_POINT,
    shapesConfig: [
      anychart.core.shapeManagers.pathStrokeConfig
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
    //NOTE: plot.crosshair().interactivityTarget() is not set because stock chart controls crosshair itself.
    plot = new anychart.stockModule.Plot(this);

    plot.crosshair().parent(/** @type {anychart.core.ui.Crosshair} */ (this.crosshair()));
    if (goog.isDef(this.defaultPlotSettings_))
      plot.setupInternal(!!opt_default, this.defaultPlotSettings_);
    plot.setParentEventTarget(this);
    this.plots_[index] = plot;
    plot.listenSignals(this.plotInvalidated_, this);
    if (index > this.lastPlotIndex_) {
      var prevPlot = this.plots_[this.lastPlotIndex_];
      if (prevPlot)
        prevPlot.isLastPlot(false);
      plot.isLastPlot(true);
      this.lastPlotIndex_ = index;
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
 * Scroller getter-setter.
 * @param {(Object|boolean|null)=} opt_value
 * @return {anychart.stockModule.Scroller|anychart.stockModule.Chart}
 */
anychart.stockModule.Chart.prototype.scroller = function(opt_value) {
  if (!this.scroller_) {
    this.scroller_ = new anychart.stockModule.Scroller(this);
    this.scroller_.setParentEventTarget(this);
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

  var baseKey = this.dataController_.getLastKey(), baseDate;
  var newKey = NaN, newDate;

  if (type = anychart.enums.normalizeStockRangeType(typeOrUnitOrStart, null)) {
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
    var count = opt_endOrCountOrDispatchEvent || 1;
    var anchor = anychart.enums.normalizeStockRangeAnchor(opt_anchorOrDispatchEvent);
    /**
     * Anchor determines the direction of offset.
     * Direction determines a sign of an operation.
     * 1 - forward (FIRST_DATE|FIRST_VISIBLE_DATE)
     * -1 - backward (LAST_DATE|LAST_VISIBLE_DATE)
     * @type {number}
     */
    var direction = -1;
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
    var askedForScatter = newType == 'scatter';
    var currIsScatter = this.xScale_ && !(anychart.utils.instanceOf(this.xScale_, anychart.stockModule.scales.Ordinal));
    if (askedForScatter != currIsScatter) {
      if (askedForScatter) {
        this.xScale_ = new anychart.stockModule.scales.Scatter(this);
        if (this.scroller_)
          this.scroller_.xScale(new anychart.stockModule.scales.Scatter(this.scroller_));
      } else {
        this.xScale_ = new anychart.stockModule.scales.Ordinal(this);
        if (this.scroller_)
          this.scroller_.xScale(new anychart.stockModule.scales.Ordinal(this.scroller_));
      }

      this.invalidate(anychart.ConsistencyState.STOCK_SCROLLER);
      this.invalidateRedrawable();
    }
    return this;
  }
  if (!this.xScale_) {
    this.xScale_ = new anychart.stockModule.scales.Ordinal(this);
  }
  return this.xScale_;
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
 * @param {Object} value Object with default series settings.
 */
anychart.stockModule.Chart.prototype.setDefaultPlotSettings = function(value) {
  /**
   * Default plot settings.
   * @type {*}
   * @private
   */
  this.defaultPlotSettings_ = value;
};


/**
 * Internal function to select a range.
 * @param {number} start
 * @param {number} end
 * @private
 */
anychart.stockModule.Chart.prototype.selectRangeInternal_ = function(start, end) {
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
  return this.plots_.length;
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

  // anychart.core.Base.suspendSignalsDispatching(this.plots_, this.scroller_);
  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.distributeBounds_(bounds);
    this.invalidate(anychart.ConsistencyState.STOCK_DATA);
    // we do not mark BOUNDS consistent, since the chart becomes unresizable in that case
    //this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  // means that stock selection range needs to be updated
  if (this.hasInvalidationState(anychart.ConsistencyState.STOCK_DATA)) {
    anychart.performance.start('Stock data calc');
    var xScale = /** @type {anychart.stockModule.scales.Scatter} */(this.xScale());
    var scrollerXScale = /** @type {anychart.stockModule.scales.Scatter} */(this.scroller().xScale());
    var changed = this.dataController_.refreshSelection(
        this.minPlotsDrawingWidth_,
        this.inDrag_ || this.preserveSelectedRangeOnDataUpdate_,
        xScale, scrollerXScale);
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
    for (i = 0; i < this.plots_.length; i++) {
      plot = this.plots_[i];
      if (plot) {
        plot
            .container(this.rootElement)
            .draw();
      }
    }
    this.markConsistent(anychart.ConsistencyState.STOCK_PLOTS_APPEARANCE);
    anychart.performance.end('Stock drawing plots');
  }

  this.refreshHighlight_();

  if (!this.mouseWheelHandler_) {
    this.mouseWheelHandler_ = new goog.events.MouseWheelHandler(
        this.container().getStage().getDomWrapper(), false);

    this.mouseWheelHandler_.listen('mousewheel', this.handleMouseWheel_, false, this);
  }

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
    }
  }

  if (this.scroller_ && this.scroller_.isVisible()) {
    seriesList = this.scroller_.getAllSeries();
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
 * Distributes content bounds among plots.
 * @param {anychart.math.Rect} contentBounds
 * @private
 */
anychart.stockModule.Chart.prototype.distributeBounds_ = function(contentBounds) {
  var remainingBounds = contentBounds;
  // first - setup scroller
  if (this.scroller_) {
    this.scroller_.parentBounds(remainingBounds);
    remainingBounds = this.scroller_.getRemainingBounds();
  }

  var currentTop = 0;
  var currentBottom = NaN;
  var boundsArray = [];
  for (var i = 0; i < this.plots_.length; i++) {
    var plot = this.plots_[i];
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

  this.minPlotsDrawingWidth_ = Infinity;
  for (i = 0; i < this.plots_.length; i++) {
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
    maxSize = anychart.utils.normalizeSize(/** @type {number|string|null} */(bounds.minHeight()), fullHeight);
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
//region Interactivity
/**
 * @inheritDoc
 */
anychart.stockModule.Chart.prototype.onInteractivitySignal = goog.nullFunction;


/**
 * Highlights points on all charts by ratio of current selected range. Used by plots.
 * @param {number} ratio
 * @param {number} clientX
 * @param {number} clientY
 * @param {anychart.stockModule.Plot} plot
 */
anychart.stockModule.Chart.prototype.highlightAtRatio = function(ratio, clientX, clientY, plot) {
  this.highlightedRatio_ = ratio;
  this.highlightedClientX_ = clientX;
  this.highlightedClientY_ = clientY;
  this.highlightSourcePlot_ = plot;
  this.highlightAtRatio_(ratio, clientX, clientY, plot);
};


/**
 * Removes highlight.
 */
anychart.stockModule.Chart.prototype.unhighlight = function() {
  this.highlightedRatio_ = NaN;
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
    this.highlightAtRatio_(this.highlightedRatio_, this.highlightedClientX_, this.highlightedClientY_, this.highlightSourcePlot_);
  }
};


/**
 * Highlights passed ratio.
 * @param {number} ratio
 * @param {number} clientX
 * @param {number} clientY
 * @param {anychart.stockModule.Plot} sourcePlot - .
 * @private
 */
anychart.stockModule.Chart.prototype.highlightAtRatio_ = function(ratio, clientX, clientY, sourcePlot) {
  if (this.highlightPrevented_ || ratio < 0 || ratio > 1) return;
  var rawValue = this.xScale().inverseTransform(ratio);
  var value = this.dataController_.alignHighlight(rawValue);
  if (isNaN(value)) return;

  var i;
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

  for (i = 0; i < this.plots_.length; i++) {
    if (this.plots_[i]) {
      var plot = this.plots_[i];
      plot.highlight(value, rawValue, sourcePlot, clientY);
    }
  }
  this.highlighted_ = true;

  /**
   * @type {!anychart.core.ui.Tooltip}
   */
  var tooltip = /** @type {!anychart.core.ui.Tooltip} */(this.tooltip());
  if (tooltip.getOption('displayMode') == anychart.enums.TooltipDisplayMode.UNION &&
      tooltip.getOption('positionMode') != anychart.enums.TooltipPositionMode.POINT) {
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
    var grouping = /** @type {anychart.stockModule.Grouping} */(this.grouping());
    tooltip.showForSeriesPoints(points, clientX, clientY, null, false, {
      'hoveredDate': {value: value, type: anychart.enums.TokenType.DATE_TIME},
      'rawHoveredDate': {value: rawValue, type: anychart.enums.TokenType.DATE_TIME},
      'dataIntervalUnit': {value: grouping.getCurrentDataInterval()['unit'], type: anychart.enums.TokenType.STRING},
      'dataIntervalUnitCount': {
        value: grouping.getCurrentDataInterval()['count'],
        type: anychart.enums.TokenType.NUMBER
      },
      'isGrouped': {value: grouping.isGrouped()}
    });
  }
  //}
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
    this.registerDisposable(this.crosshair_);
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
  if (!inBounds && this.scroller_ && this.scroller_.isVisible()) {
    boundsItem = this.scroller_.getPixelBounds();
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
      if (interactivity.zoomOnMouseWheel()) {
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
        var factor = (-delta * anychart.stockModule.Chart.ZOOM_FACTOR_PER_WHEEL_STEP) * (end - start);
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
      if (interactivity.scrollOnMouseWheel()) {
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
  'start-zoom-marquee': {
    'index': 8,
    'text': 'Start zoom marquee',
    'eventType': 'anychart.startZoomMarquee',
    'action': function(context) {
      context['chart'].startZoomMarquee(false);
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
    'start-zoom-marquee': anychart.stockModule.Chart.contextMenuItems['start-zoom-marquee'],
    'start-select-marquee': anychart.core.Chart.contextMenuItems['start-select-marquee'],
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
  var scale = this.xScale();
  var valueDiff, range, start, end;
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
  if ((start != this.dataController_.getFirstSelectedKey() ||
      end != this.dataController_.getLastSelectedKey()) &&
      this.dispatchRangeChange_(
          anychart.enums.EventType.SELECTED_RANGE_BEFORE_CHANGE,
          opt_source || anychart.enums.StockRangeChangeSource.PLOT_DRAG,
          Math.min(start, end), Math.max(start, end))) {
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
  goog.disposeAll(this.plots_, this.scroller_, this.dataController_, this.annotations_, this.mouseWheelHandler_);
  this.plots_ = null;
  this.scroller_ = null;
  this.annotations_ = null;
  this.mouseWheelHandler_ = null;
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

  this.crosshair().setupInternal(!!opt_default, config['crosshair']);

  if ('defaultPlotSettings' in config)
    this.setDefaultPlotSettings(config['defaultPlotSettings']);

  json = config['plots'];
  if (goog.isArray(json)) {
    for (var i = 0; i < json.length; i++) {
      this.plotInternal(i, json[i], opt_default);
    }
  }

  this.scroller(config['scroller']);
  this.grouping(config['grouping']);
  this.scrollerGrouping(config['scrollerGrouping']);

  if ('defaultAnnotationSettings' in config)
    this.defaultAnnotationSettings(config['defaultAnnotationSettings']);

  json = config['selectedRange'];
  if (goog.isObject(json)) {
    this.selectRange(json['start'], json['end']);
  }

  anychart.core.settings.deserialize(this, anychart.stockModule.Chart.PROPERTY_DESCRIPTORS, config);
  this.interactivity(config['interactivity']);
};


//endregion
/**
 * Stock chart constructor function.
 * @param {boolean=} opt_allowPointSettings Allows to set point settings from data.
 * @return {anychart.stockModule.Chart}
 */
anychart.stock = function(opt_allowPointSettings) {
  var result = new anychart.stockModule.Chart(opt_allowPointSettings);
  result.setupInternal(true, anychart.getFullTheme('stock'));
  return result;
};


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
  goog.array.forEach(res.data, function(item) { item.shift(); });
  return res;
};


//exports
(function() {
  var proto = anychart.stockModule.Chart.prototype;
  goog.exportSymbol('anychart.stock', anychart.stock);
  proto['plot'] = proto.plot;
  proto['crosshair'] = proto.crosshair;
  proto['scroller'] = proto.scroller;
  proto['xScale'] = proto.xScale;
  proto['selectRange'] = proto.selectRange;
  proto['getSelectedRange'] = proto.getSelectedRange;
  proto['getType'] = proto.getType;
  proto['legend'] = proto.legend;
  proto['grouping'] = proto.grouping;
  proto['scrollerGrouping'] = proto.scrollerGrouping;
  proto['annotations'] = proto.annotations;
  proto['getPlotsCount'] = proto.getPlotsCount;
  proto['startZoomMarquee'] = proto.startZoomMarquee;
  // auto generated
  // proto['zoomMarqueeFill'] = proto.zoomMarqueeFill;
  // proto['zoomMarqueeStroke'] = proto.zoomMarqueeStroke;
  proto['interactivity'] = proto.interactivity;
  proto['preserveSelectedRangeOnDataUpdate'] = proto.preserveSelectedRangeOnDataUpdate;
})();
