goog.provide('anychart.charts.Stock');
goog.require('anychart.core.Chart');
goog.require('anychart.core.IChart');
goog.require('anychart.core.IChartWithAnnotations');
goog.require('anychart.core.IGroupingProvider');
goog.require('anychart.core.annotations.ChartController');
goog.require('anychart.core.reporting');
goog.require('anychart.core.stock.Controller');
goog.require('anychart.core.stock.IKeyIndexTransformer');
goog.require('anychart.core.stock.Plot');
goog.require('anychart.core.stock.Scroller');
goog.require('anychart.core.ui.Tooltip');
goog.require('anychart.enums');
goog.require('anychart.scales.StockOrdinalDateTime');
goog.require('anychart.scales.StockScatterDateTime');
goog.require('anychart.utils');



/**
 * Stock chart class.
 * @constructor
 * @extends {anychart.core.Chart}
 * @implements {anychart.core.IChart}
 * @implements {anychart.core.IChartWithAnnotations}
 * @implements {anychart.core.IGroupingProvider}
 * @implements {anychart.core.stock.IKeyIndexTransformer}
 * @param {boolean=} opt_allowPointSettings Allows to set point settings from data.
 */
anychart.charts.Stock = function(opt_allowPointSettings) {
  // See SeparateChart
  this.supportsBaseHighlight = false;

  anychart.charts.Stock.base(this, 'constructor');

  /**
   * Chart plots array.
   * @type {Array.<anychart.core.stock.Plot>}
   * @private
   */
  this.plots_ = [];

  /**
   * Chart scroller.
   * @type {anychart.core.stock.Scroller}
   * @private
   */
  this.scroller_ = null;

  /**
   * Stock data controller.
   * @type {!anychart.core.stock.Controller}
   * @private
   */
  this.dataController_ = new anychart.core.stock.Controller();
  this.dataController_.listenSignals(this.dataControllerInvalidated_, this);

  /**
   * Common X scale of all series of the chart.
   * @type {anychart.scales.StockScatterDateTime}
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
   * @type {anychart.core.annotations.ChartController}
   * @private
   */
  this.annotations_ = null;

  /**
   * Default annotation settings.
   * @type {Object}
   * @private
   */
  this.defaultAnnotationSettings_ = {};

  /**
   * Series config.
   * @type {Object.<string, anychart.core.series.TypeConfig>}
   */
  this.seriesConfig = this.createSeriesConfig(!!opt_allowPointSettings);
};
goog.inherits(anychart.charts.Stock, anychart.core.Chart);


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.charts.Stock.prototype.SUPPORTED_SIGNALS = anychart.core.Chart.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.charts.Stock.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.Chart.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.STOCK_PLOTS_APPEARANCE |
    anychart.ConsistencyState.STOCK_SCROLLER |
    anychart.ConsistencyState.STOCK_DATA |
    anychart.ConsistencyState.STOCK_SCALES;


//region Chart type and series types
//----------------------------------------------------------------------------------------------------------------------
//
//  Chart type and series types
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.charts.Stock.prototype.getType = function() {
  return anychart.enums.ChartTypes.STOCK;
};


/**
 * Creates series config for the chart.
 * @param {boolean} allowColoring
 * @return {Object.<string, anychart.core.series.TypeConfig>}
 */
anychart.charts.Stock.prototype.createSeriesConfig = function(allowColoring) {
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
  return res;
};


/** @inheritDoc */
anychart.charts.Stock.prototype.getVersionHistoryLink = function() {
  return 'http://anychart.com/products/anystock/history';
};


/** @override */
anychart.charts.Stock.prototype.getAllSeries = function() {
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
anychart.charts.Stock.prototype.getConfigByType = function(type) {
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
anychart.charts.Stock.prototype.isVertical = function() {
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
anychart.charts.Stock.prototype.calculate = goog.nullFunction;


/**
 * ALSO A DUMMY. Redeclared to show another error text.
 * @ignoreDoc
 * @param {(Object|boolean|null)=} opt_value Legend settings.
 * @return {anychart.core.Chart|anychart.core.ui.Legend} Chart legend instance of itself for chaining call.
 */
anychart.charts.Stock.prototype.legend = function(opt_value) {
  anychart.core.reporting.error(anychart.enums.ErrorCode.NO_LEGEND_IN_STOCK);
  return goog.isDef(opt_value) ? this : null;
};


/**
 * Plots getter/setter.
 * @param {(Object|boolean|null|number)=} opt_indexOrValue
 * @param {(Object|boolean|null)=} opt_value
 * @return {!(anychart.core.stock.Plot|anychart.charts.Stock)}
 */
anychart.charts.Stock.prototype.plot = function(opt_indexOrValue, opt_value) {
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
    plot = new anychart.core.stock.Plot(this);
    if (goog.isDef(this.defaultPlotSettings_))
      plot.setup(this.defaultPlotSettings_);
    plot.setParentEventTarget(this);
    this.plots_[index] = plot;
    plot.listenSignals(this.plotInvalidated_, this);
    this.invalidate(anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.STOCK_PLOTS_APPEARANCE,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
  }

  if (goog.isDef(value)) {
    plot.setup(value);
    return this;
  } else {
    return plot;
  }
};


/**
 * Scroller getter-setter.
 * @param {(Object|boolean|null)=} opt_value
 * @return {anychart.core.stock.Scroller|anychart.charts.Stock}
 */
anychart.charts.Stock.prototype.scroller = function(opt_value) {
  if (!this.scroller_) {
    this.scroller_ = new anychart.core.stock.Scroller(this);
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
 * @return {anychart.charts.Stock}
 */
anychart.charts.Stock.prototype.selectRange = function(
    typeOrUnitOrStart, opt_endOrCountOrDispatchEvent, opt_anchorOrDispatchEvent, opt_dispatchEvent) {
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
anychart.charts.Stock.prototype.getSelectedRange = function() {
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
 * @param {string=} opt_value
 * @return {anychart.scales.StockScatterDateTime|anychart.charts.Stock}
 */
anychart.charts.Stock.prototype.xScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var askedForScatter = anychart.scales.StockScatterDateTime.askedForScatter(opt_value);
    var currIsScatter = this.xScale_ && !(this.xScale_ instanceof anychart.scales.StockOrdinalDateTime);
    if (askedForScatter != currIsScatter) {
      if (askedForScatter) {
        this.xScale_ = new anychart.scales.StockScatterDateTime(this);
        if (this.scroller_)
          this.scroller_.xScale(new anychart.scales.StockScatterDateTime(this.scroller_));
      } else {
        this.xScale_ = new anychart.scales.StockOrdinalDateTime(this);
        if (this.scroller_)
          this.scroller_.xScale(new anychart.scales.StockOrdinalDateTime(this.scroller_));
      }

      this.invalidate(anychart.ConsistencyState.STOCK_SCROLLER);
      this.invalidateRedrawable();
    }
    return this;
  }
  if (!this.xScale_) {
    this.xScale_ = new anychart.scales.StockOrdinalDateTime(this);
  }
  return this.xScale_;
};


/**
 * Grouping settings object getter/setter.
 * @param {(boolean|Array.<string|anychart.core.stock.Grouping.Level>|Object)=} opt_value
 * @return {anychart.charts.Stock|anychart.core.stock.Grouping}
 */
anychart.charts.Stock.prototype.grouping = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.dataController_.grouping(opt_value);
    return this;
  }
  return /** @type {anychart.core.stock.Grouping} */(this.dataController_.grouping());
};


/**
 * Scroller grouping settings object getter/setter.
 * @param {(boolean|Array.<string|anychart.core.stock.Grouping.Level>|Object)=} opt_value
 * @return {anychart.charts.Stock|anychart.core.stock.Grouping}
 */
anychart.charts.Stock.prototype.scrollerGrouping = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.dataController_.scrollerGrouping(opt_value);
    return this;
  }
  return /** @type {anychart.core.stock.Grouping} */(this.dataController_.scrollerGrouping());
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
anychart.charts.Stock.prototype.setDefaultPlotSettings = function(value) {
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
anychart.charts.Stock.prototype.selectRangeInternal_ = function(start, end) {
  var xScale = /** @type {!anychart.scales.StockScatterDateTime} */(this.xScale());
  if (this.dataController_.refreshFullRange()) {
    this.dataController_.updateFullScaleRange(xScale);
    this.dataController_.updateFullScaleRange(/** @type {!anychart.scales.StockScatterDateTime} */(this.scroller().xScale()));
  }
  if (this.dataController_.select(start, end)) {
    this.dataController_.updateCurrentScaleRange(xScale, false);
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
anychart.charts.Stock.prototype.dispatchRangeChange_ = function(type, source, opt_first, opt_last) {
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
    var grouping = /** @type {anychart.core.stock.Grouping} */(this.grouping());
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
anychart.charts.Stock.prototype.resizeHandler = function(e) {
  if (this.bounds().dependsOnContainerSize()) {
    this.invalidate(anychart.ConsistencyState.BOUNDS,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
  }
};


/** @inheritDoc */
anychart.charts.Stock.prototype.createTooltip = function() {
  var tooltip = new anychart.core.ui.Tooltip(anychart.core.ui.Tooltip.Capabilities.ANY);
  this.registerDisposable(tooltip);
  tooltip.chart(this);

  return tooltip;
};


/**
 * Returns current selection min distance (from selectable sources).
 * @return {number}
 */
anychart.charts.Stock.prototype.getCurrentMinDistance = function() {
  return this.dataController_.getCurrentMinDistance();
};


/**
 * Returns current selection min distance (from scroller sources).
 * @return {number}
 */
anychart.charts.Stock.prototype.getCurrentScrollerMinDistance = function() {
  return this.dataController_.getCurrentScrollerMinDistance();
};
//endregion


//region Drawing
//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.charts.Stock.prototype.drawContent = function(bounds) {
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
    var xScale = /** @type {anychart.scales.StockScatterDateTime} */(this.xScale());
    var scrollerXScale = /** @type {anychart.scales.StockScatterDateTime} */(this.scroller().xScale());
    var changed = this.dataController_.refreshSelection(this.minPlotsDrawingWidth_);
    this.dataController_.updateFullScaleRange(xScale);
    this.dataController_.updateFullScaleRange(scrollerXScale);
    if (!!(changed & 1)) {
      this.dataController_.updateCurrentScaleRange(xScale, false);
      this.invalidateRedrawable();
    }
    if (!!(changed & 2)) {
      this.dataController_.updateCurrentScaleRange(scrollerXScale, true);
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
    for (var i = 0; i < this.plots_.length; i++) {
      var plot = this.plots_[i];
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

  // anychart.core.Base.resumeSignalsDispatchingFalse(this.plots_, this.scroller_);
};


/**
 * Calculates all Y scales.
 * @private
 */
anychart.charts.Stock.prototype.calculateScales_ = function() {
  // we just iterate over all series and calculate them semi-independently
  var i, j, series, aSeries, scale;
  var scales = [];
  for (i = 0; i < this.plots_.length; i++) {
    var plot = this.plots_[i];
    if (plot && plot.enabled()) {
      series = plot.getAllSeries();
      for (j = 0; j < series.length; j++) {
        aSeries = series[j];
        aSeries.updateComparisonZero();
        scale = /** @type {anychart.scales.Base} */(aSeries.yScale());
        if (scale.needsAutoCalc()) {
          scale.startAutoCalc();
          if (aSeries.enabled())
            scale.extendDataRange.apply(scale, aSeries.getScaleReferenceValues());
          scales.push(scale);
        }
      }
    }
  }

  if (this.scroller_ && this.scroller_.isVisible()) {
    series = this.scroller_.getAllSeries();
    for (j = 0; j < series.length; j++) {
      aSeries = series[j];
      aSeries.updateComparisonZero();
      scale = /** @type {anychart.scales.Base} */(aSeries.yScale());
      if (scale.needsAutoCalc()) {
        scale.startAutoCalc();
        if (aSeries.enabled())
          scale.extendDataRange.apply(scale, aSeries.getScaleReferenceValues());
        scales.push(scale);
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
anychart.charts.Stock.prototype.distributeBounds_ = function(contentBounds) {
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
anychart.charts.Stock.prototype.distributeBoundsLocal_ = function(boundsArray, top, bottom, fullHeight) {
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
anychart.charts.Stock.prototype.plotInvalidated_ = function(e) {
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
anychart.charts.Stock.prototype.scrollerInvalidated_ = function(e) {
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
anychart.charts.Stock.prototype.dataControllerInvalidated_ = function(e) {
  if (e.hasSignal(anychart.Signal.DATA_CHANGED)) {
    this.invalidate(anychart.ConsistencyState.STOCK_DATA, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Initiates series redraw.
 */
anychart.charts.Stock.prototype.invalidateRedrawable = function() {
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
 * @param {!anychart.data.TableSelectable} source
 * @param {boolean} isScrollerSeries
 */
anychart.charts.Stock.prototype.registerSource = function(source, isScrollerSeries) {
  this.dataController_.registerSource(source, !isScrollerSeries);
};


/**
 * Removes source registration.
 * @param {!anychart.data.TableSelectable} source
 */
anychart.charts.Stock.prototype.deregisterSource = function(source) {
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
anychart.charts.Stock.prototype.getKeyByIndex = function(index) {
  return this.dataController_.getKeyByIndex(index);
};


/**
 * Returns index by key. If the key is not in the registry - returns fractional inter/extrapolated index for it.
 * @param {number} key
 * @return {number}
 */
anychart.charts.Stock.prototype.getIndexByKey = function(key) {
  return this.dataController_.getIndexByKey(key);
};


/**
 * Returns key by index. Index can be fractional - the key will be inter- or extrapolated.
 * @param {number} index
 * @return {number}
 */
anychart.charts.Stock.prototype.getKeyByScrollerIndex = function(index) {
  return this.dataController_.getKeyByScrollerIndex(index);
};


/**
 * Returns index by key. If the key is not in the registry - returns fractional inter/extrapolated index for it.
 * @param {number} key
 * @return {number}
 */
anychart.charts.Stock.prototype.getScrollerIndexByKey = function(key) {
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
 * @return {anychart.charts.Stock|anychart.core.annotations.ChartController}
 */
anychart.charts.Stock.prototype.annotations = function(opt_value) {
  if (!this.annotations_) {
    this.annotations_ = new anychart.core.annotations.ChartController(this);
  }
  if (goog.isDef(opt_value)) {
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
anychart.charts.Stock.prototype.defaultAnnotationSettings = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.defaultAnnotationSettings_ = opt_value;
    return this;
  }
  return this.defaultAnnotationSettings_;
};
//endregion


//region Interactivity
/**
 * Highlights points on all charts by ratio of current selected range. Used by plots.
 * @param {number} ratio
 * @param {number} clientX
 * @param {number} clientY
 */
anychart.charts.Stock.prototype.highlightAtRatio = function(ratio, clientX, clientY) {
  this.highlightedRatio_ = ratio;
  this.highlightedClientX_ = clientX;
  this.highlightedClientY_ = clientY;
  this.highlightAtRatio_(ratio, clientX, clientY);
};


/**
 * Removes highlight.
 */
anychart.charts.Stock.prototype.unhighlight = function() {
  this.highlightedRatio_ = NaN;
  this.highlightedClientX_ = NaN;
  this.highlightedClientY_ = NaN;
  this.unhighlight_();
};


/**
 * Returns last visible date.
 * @return {number}
 */
anychart.charts.Stock.prototype.getLastDate = function() {
  return this.dataController_.getLastVisibleKey();
};


/**
 * Prevents chart from highlighting points.
 */
anychart.charts.Stock.prototype.preventHighlight = function() {
  this.highlightPrevented_ = true;
  this.unhighlight_();
};


/**
 * Turns highlight prevention off and refreshes points highlight if necessary.
 */
anychart.charts.Stock.prototype.allowHighlight = function() {
  this.highlightPrevented_ = false;
  this.refreshHighlight_();
};


/**
 * Refreshes points highlight if necessary.
 * @private
 */
anychart.charts.Stock.prototype.refreshHighlight_ = function() {
  if (!isNaN(this.highlightedRatio_)) {
    this.highlightAtRatio_(this.highlightedRatio_, this.highlightedClientX_, this.highlightedClientY_);
  }
};


/**
 * Highlights passed ratio.
 * @param {number} ratio
 * @param {number} clientX
 * @param {number} clientY
 * @private
 */
anychart.charts.Stock.prototype.highlightAtRatio_ = function(ratio, clientX, clientY) {
  if (this.highlightPrevented_ || ratio < 0 || ratio > 1) return;
  var value = this.dataController_.alignHighlight(this.xScale().inverseTransform(ratio));
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
  //if (this.dispatchEvent(eventInfo)) {
  for (i = 0; i < this.plots_.length; i++) {
    if (this.plots_[i])
      this.plots_[i].highlight(value);
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
    var grouping = /** @type {anychart.core.stock.Grouping} */(this.grouping());
    tooltip.showForSeriesPoints(points, clientX, clientY, null, false, {
      'hoveredDate': value,
      'dataIntervalUnit': grouping.getCurrentDataInterval()['unit'],
      'dataIntervalUnitCount': grouping.getCurrentDataInterval()['count'],
      'isGrouped': grouping.isGrouped()
    });
  }
  //}
};


/**
 * @private
 */
anychart.charts.Stock.prototype.unhighlight_ = function() {
  if (this.highlighted_/* && this.dispatchEvent(anychart.enums.EventType.UNHIGHLIGHT)*/) {
    this.highlighted_ = false;
    for (var i = 0; i < this.plots_.length; i++) {
      if (this.plots_[i])
        this.plots_[i].unhighlight();
    }
    this.tooltip().hide();
  }
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
anychart.charts.Stock.prototype.transformScrollerSource_ = function(source) {
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
anychart.charts.Stock.prototype.scrollerChangeStartHandler_ = function(e) {
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
anychart.charts.Stock.prototype.scrollerChangeHandler_ = function(e) {
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
anychart.charts.Stock.prototype.scrollerChangeFinishHandler_ = function(e) {
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
anychart.charts.Stock.DragAnchor;


/**
 * Returns current first selected.
 * @return {anychart.charts.Stock.DragAnchor}
 */
anychart.charts.Stock.prototype.getDragAnchor = function() {
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
 * Drags the chart to passed position.
 * @param {number} ratio
 * @param {anychart.charts.Stock.DragAnchor} anchor
 */
anychart.charts.Stock.prototype.dragToRatio = function(ratio, anchor) {
  var scale = this.xScale();
  var valueDiff, range, start, end;
  if (scale instanceof anychart.scales.StockOrdinalDateTime) {
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
          anychart.enums.StockRangeChangeSource.PLOT_DRAG,
          Math.min(start, end), Math.max(start, end))) {
    this.selectRangeInternal_(start, end);
    anchor.firstIndex = this.getIndexByKey(anchor.firstKey);
    anchor.lastIndex = this.getIndexByKey(anchor.lastKey);
    anchor.minIndex = this.getIndexByKey(anchor.minKey);
    anchor.maxIndex = this.getIndexByKey(anchor.maxKey);
    // anchor.minKey = this.dataController_.getFirstKey();
    // anchor.maxKey = this.dataController_.getLastKey();
    this.dispatchRangeChange_(
        anychart.enums.EventType.SELECTED_RANGE_CHANGE,
        anychart.enums.StockRangeChangeSource.PLOT_DRAG);
  }
};


/**
 * Limits passed drag ratio.
 * @param {number} ratio
 * @param {Object} anchor
 * @return {number}
 */
anychart.charts.Stock.prototype.limitDragRatio = function(ratio, anchor) {
  var scale = this.xScale();
  var range, start, end;
  if (scale instanceof anychart.scales.StockOrdinalDateTime) {
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
anychart.charts.Stock.prototype.askDragStart = function() {
  var res = this.dispatchRangeChange_(
      anychart.enums.EventType.SELECTED_RANGE_CHANGE_START,
      anychart.enums.StockRangeChangeSource.PLOT_DRAG);
  if (res) {
    this.preventHighlight();
    goog.style.setStyle(document['body'], 'cursor', acgraph.vector.Cursor.EW_RESIZE);
  }
  return res;
};


/**
 * Notifies the chart, that the drag process has ended.
 */
anychart.charts.Stock.prototype.dragEnd = function() {
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
anychart.charts.Stock.prototype.disposeInternal = function() {
  // plot annotations should be disposed before chart annotations
  goog.disposeAll(this.plots_, this.scroller_, this.dataController_, this.annotations_);
  this.plots_ = null;
  this.scroller_ = null;
  this.annotations_ = null;
  delete this.dataController_;
  delete this.defaultAnnotationSettings_;

  anychart.charts.Stock.base(this, 'disposeInternal');
};


/** @inheritDoc */
anychart.charts.Stock.prototype.serialize = function() {
  var json = anychart.charts.Stock.base(this, 'serialize');
  json['grouping'] = this.grouping().serialize();
  json['scrollerGrouping'] = this.scrollerGrouping().serialize();
  json['xScale'] = this.xScale().serialize();
  json['scroller'] = this.scroller().serialize();
  json['plots'] = goog.array.map(this.plots_, function(element) { return element ? element.serialize() : null; });
  return json;
};


/** @inheritDoc */
anychart.charts.Stock.prototype.setupByJSON = function(config, opt_default) {
  anychart.charts.Stock.base(this, 'setupByJSON', config, opt_default);
  var json;

  if ('xScale' in config)
    this.xScale(config['xScale']);

  if ('defaultPlotSettings' in config)
    this.setDefaultPlotSettings(config['defaultPlotSettings']);

  json = config['plots'];
  if (goog.isArray(json)) {
    for (var i = 0; i < json.length; i++) {
      this.plot(i, json[i]);
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
};
//endregion


/**
 * Stock chart constructor function.
 * @param {boolean=} opt_allowPointSettings Allows to set point settings from data.
 * @return {anychart.charts.Stock}
 */
anychart.stock = function(opt_allowPointSettings) {
  var result = new anychart.charts.Stock(opt_allowPointSettings);
  result.setupByVal(anychart.getFullTheme('stock'), true);
  return result;
};


/** @inheritDoc */
anychart.charts.Stock.prototype.extractHeaders = function(storage, headers, headersLength) {
  var i;
  var knownFields = storage.getKnownFields();
  if (goog.isNumber(knownFields)) {
    for (i = 0; i < knownFields; i++)
      if (!(i in headers))
        headers[i] = headersLength++;
  } else {
    for (i in knownFields)
      if (!(i in headers))
        headers[i] = headersLength++;
  }
  return headersLength;
};


/** @inheritDoc */
anychart.charts.Stock.prototype.toCsv = function(opt_chartDataExportMode, opt_csvSettings) {
  opt_chartDataExportMode = anychart.enums.normalizeChartDataExportMode(opt_chartDataExportMode);
  var rawData = (opt_chartDataExportMode == anychart.enums.ChartDataExportMode.RAW);
  var groupedData = (opt_chartDataExportMode == anychart.enums.ChartDataExportMode.GROUPED);
  var settings = goog.isObject(opt_csvSettings) ? opt_csvSettings : {};
  var rowsSeparator = settings['rowsSeparator'] || '\n';
  this.checkSeparator(rowsSeparator);
  var columnsSeparator = settings['columnsSeparator'] || ',';
  this.checkSeparator(columnsSeparator);
  var ignoreFirstRow = settings['ignoreFirstRow'] || false;

  var plot;
  var i, j, k;
  var len;
  var series;
  var seriesList;
  var seriesListLength;
  var seriesData;
  var seriesDataTable;
  var uid;
  var storage;
  var storages;

  storages = {};
  var storagesCount = 0;
  for (k = 0, len = this.plots_.length; k < len; k++) {
    plot = this.plots_[k];
    if (plot) {
      seriesList = plot.getAllSeries();
      seriesListLength = seriesList.length;

      for (i = 0; i < seriesListLength; i++) {
        series = seriesList[i];
        seriesData = series.getSelectableData();
        seriesDataTable = seriesData.getMapping().getTable();
        storage = seriesDataTable.getStorage();
        uid = goog.getUid(storage);
        if (!(uid in storages)) {
          storages[uid] = storage;
          storagesCount++;
        }
      }
    }
  }

  var csvHeaders;
  var header;
  var headers;
  var headersLength = 0;
  var columnToIndex;
  var csvStrings;
  var finalValue;
  var value;

  if (rawData) {
    var needCountStorages = storagesCount > 1;
    headers = {};
    if (needCountStorages) {
      headers['#'] = headersLength++;
    }

    for (uid in storages) {
      storage = storages[uid];
      headersLength = this.extractHeaders(storage, headers, headersLength);
    }

    csvStrings = [];

    if (!ignoreFirstRow) {
      csvHeaders = [];
      for (header in headers)
        csvHeaders[headers[header]] = header;
      csvStrings.push(csvHeaders.join(columnsSeparator));
    }

    var storageNumber = 0;
    var column, columnIndex;
    for (uid in storages) {
      storage = storages[uid];

      for (i = 0, len = storage.getRowsCount(); i < len; i++) {
        var csvRow = new Array(headersLength);
        var row = storage.getRow(i).values;
        for (column in row) {
          columnIndex = headers[column];
          finalValue = goog.isObject(row[column]) ? goog.json.serialize(row[column]) : row[column];
          csvRow[columnIndex] = finalValue;
        }
        if (needCountStorages)
          csvRow[0] = storageNumber;
        this.escapeValuesInRow(csvRow, columnsSeparator, rowsSeparator);
        csvStrings.push(csvRow.join(columnsSeparator));
      }
      storageNumber++;
    }
    return csvStrings.join(rowsSeparator);
  } else {
    var plotPrefix;
    var seriesPrefix;
    var x;
    var fields, field;
    var csvRows = {};
    csvHeaders = [];
    headers = [];
    var prefixed;
    if (groupedData) {
      csvHeaders.push('x');
      for (k = 0, len = this.plots_.length; k < len; k++) {
        plotPrefix = this.plots_.length > 1 ? ('plot_' + k + '_') : '';
        plot = this.plots_[k];
        if (plot) {
          seriesList = plot.getAllSeries();
          seriesListLength = seriesList.length;

          for (i = 0; i < seriesListLength; i++) {
            seriesPrefix = seriesListLength > 1 ? ('series_' + i + '_') : '';
            series = seriesList[i];
            if (series) {
              seriesData = series.getSelectableData();
              headers = [];
              fields = seriesData.getMapping().getFieldsInternal();
              for (field in fields) {
                headers.push(plotPrefix + seriesPrefix + field);
              }
              csvHeaders = goog.array.concat(csvHeaders, headers);
            }
          }
        }
      }

      columnToIndex = {};
      for (i = 0, len = csvHeaders.length; i < len; i++) {
        columnToIndex[csvHeaders[i]] = i;
      }

      var mapping;
      csvRows = {};
      for (k = 0, len = this.plots_.length; k < len; k++) {
        plotPrefix = this.plots_.length > 1 ? ('plot_' + k + '_') : '';
        plot = this.plots_[k];
        if (plot) {
          seriesList = plot.getAllSeries();
          seriesListLength = seriesList.length;
          seriesPrefix = seriesListLength > 1 ? 'series_' : '';

          for (i = 0; i < seriesListLength; i++) {
            seriesPrefix = seriesListLength > 1 ? ('series_' + i + '_') : '';
            series = seriesList[i];
            if (series) {
              seriesData = series.getSelectableData();
              mapping = seriesData.getMapping();
              fields = mapping.getFieldsInternal();

              var iterator = seriesData.getExportingIterator();
              while (iterator.advance()) {
                x = iterator.getKey();

                if (!csvRows[x]) {
                  csvRows[x] = new Array(csvHeaders.length);
                  csvRows[x][0] = x;
                }
                for (field in fields) {
                  prefixed = plotPrefix + seriesPrefix + field;
                  columnIndex = columnToIndex[prefixed];
                  value = iterator.get(field);
                  finalValue = goog.isObject(value) ? goog.json.serialize(value) : value;
                  csvRows[x][columnIndex] = finalValue;
                }
              }
            }
          }
        }
      }
      // show grouped data
      // join by X
      // all columns in mapping
    } else {
      csvHeaders.push('x');
      headers = {};
      headersLength = 1;
      for (k = 0, len = this.plots_.length; k < len; k++) {
        plotPrefix = this.plots_.length > 1 ? ('plot_' + k + '_') : '';
        plot = this.plots_[k];
        if (plot) {
          seriesList = plot.getAllSeries();
          seriesListLength = seriesList.length;

          for (i = 0; i < seriesListLength; i++) {
            seriesPrefix = seriesListLength > 1 ? ('series_' + i + '_') : '';
            series = seriesList[i];
            if (series) {
              seriesData = series.getSelectableData();
              storage = seriesData.getMapping().getTable().getStorage();
              headersLength = this.extractHeaders(storage, headers, headersLength);
              for (header in headers) {
                csvHeaders[headers[header]] = plotPrefix + seriesPrefix + header;
              }
              headers = {};
            }
          }
        }
      }

      var values;
      for (k = 0, len = this.plots_.length; k < len; k++) {
        plotPrefix = this.plots_.length > 1 ? ('plot_' + k + '_') : '';
        plot = this.plots_[k];
        if (plot) {
          seriesList = plot.getAllSeries();
          seriesListLength = seriesList.length;

          for (i = 0; i < seriesListLength; i++) {
            seriesPrefix = seriesListLength > 1 ? ('series_' + i + '_') : '';
            series = seriesList[i];
            if (series) {
              seriesData = series.getSelectableData();
              storage = seriesData.getMapping().getTable().getStorage();
              for (j = 0; j < storage.getRowsCount(); j++) {
                row = storage.getRow(j);
                values = row.values;
                x = row.key;
                if (!csvRows[x]) {
                  csvRows[x] = new Array(csvHeaders.length);
                  csvRows[x][0] = x;
                }
                for (column in values) {
                  prefixed = plotPrefix + seriesPrefix + column;
                  columnIndex = goog.array.indexOf(csvHeaders, prefixed);
                  finalValue = goog.isObject(values[column]) ? goog.json.serialize(values[column]) : values[column];
                  csvRows[x][columnIndex] = finalValue;
                }
              }
            }
          }
        }
      }
      // show all data
      // join by X
      // all columns in tables
    }
    csvStrings = [];
    if (!ignoreFirstRow)
      csvStrings.push(csvHeaders.join(columnsSeparator));
    if (goog.isArray(csvRows)) {
      for (i = 0; i < csvRows.length; i++) {
        this.escapeValuesInRow(csvRows[i], columnsSeparator, rowsSeparator);
        csvStrings.push(csvRows[i].join(columnsSeparator));
      }
    } else {
      for (row in csvRows) {
        this.escapeValuesInRow(csvRows[row], columnsSeparator, rowsSeparator);
        csvStrings.push(csvRows[row].join(columnsSeparator));
      }
    }
    return csvStrings.join(rowsSeparator);
  }
};


//exports
(function() {
  var proto = anychart.charts.Stock.prototype;
  goog.exportSymbol('anychart.stock', anychart.stock);
  proto['plot'] = proto.plot;
  proto['scroller'] = proto.scroller;
  proto['xScale'] = proto.xScale;
  proto['selectRange'] = proto.selectRange;
  proto['getSelectedRange'] = proto.getSelectedRange;
  proto['getType'] = proto.getType;
  proto['legend'] = proto.legend;
  proto['toCsv'] = proto.toCsv;
  proto['grouping'] = proto.grouping;
  proto['scrollerGrouping'] = proto.scrollerGrouping;
  proto['annotations'] = proto.annotations;
})();
