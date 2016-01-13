goog.provide('anychart.charts.Stock');
goog.require('anychart.core.ChartWithCredits');
goog.require('anychart.core.stock.Controller');
goog.require('anychart.core.stock.Plot');
goog.require('anychart.core.stock.Scroller');
goog.require('anychart.core.ui.ChartTooltip');
goog.require('anychart.enums');
goog.require('anychart.scales.StockOrdinalDateTime');
goog.require('anychart.scales.StockScatterDateTime');
goog.require('anychart.utils');



/**
 * Stock chart class.
 * @constructor
 * @extends {anychart.core.ChartWithCredits}
 */
anychart.charts.Stock = function() {
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
   * @type {anychart.core.stock.Controller}
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
};
goog.inherits(anychart.charts.Stock, anychart.core.ChartWithCredits);


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
    anychart.ConsistencyState.STOCK_SCALES |
    anychart.ConsistencyState.STOCK_FULL_RANGE_PARAMS;


/** @inheritDoc */
anychart.charts.Stock.prototype.getType = function() {
  return anychart.enums.ChartTypes.STOCK;
};


/**
 * ALSO A DUMMY. Redeclared to show another error text.
 * @ignoreDoc
 * @param {(Object|boolean|null)=} opt_value Legend settings.
 * @return {anychart.core.Chart|anychart.core.ui.Legend} Chart legend instance of itself for chaining call.
 */
anychart.charts.Stock.prototype.legend = function(opt_value) {
  anychart.utils.error(anychart.enums.ErrorCode.NO_LEGEND_IN_STOCK);
  return goog.isDef(opt_value) ? this : null;
};


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
    index = opt_indexOrValue;
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
        anychart.ConsistencyState.BOUNDS |
        anychart.ConsistencyState.STOCK_FULL_RANGE_PARAMS,
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
 * @param {number|string|Date} start
 * @param {number|string|Date} end
 * @return {anychart.charts.Stock}
 */
anychart.charts.Stock.prototype.selectRange = function(start, end) {
  this.selectRangeInternal(anychart.utils.normalizeTimestamp(start), anychart.utils.normalizeTimestamp(end));
  return this;
};


/**
 * Internal function to select a range.
 * @param {number} start
 * @param {number} end
 * @param {boolean=} opt_forceUpdate
 */
anychart.charts.Stock.prototype.selectRangeInternal = function(start, end, opt_forceUpdate) {
  if (this.dataController_.select(start, end, opt_forceUpdate) || opt_forceUpdate) {
    this.xScale().setCurrentRange(
        this.dataController_.getFirstSelectedKey(),
        this.dataController_.getLastSelectedKey(),
        this.dataController_.getFirstSelectedIndex(),
        this.dataController_.getLastSelectedIndex(),
        this.dataController_.getCurrentGroupingIntervalUnit(),
        this.dataController_.getCurrentGroupingIntervalCount());
    this.invalidateRedrawable();
  }
};


/** @inheritDoc */
anychart.charts.Stock.prototype.drawContent = function(bounds) {
  anychart.core.Base.suspendSignalsDispatching(this.plots_, this.scroller_);

  var i, plot;

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.distributeBounds_(bounds);
    this.invalidate(anychart.ConsistencyState.STOCK_PLOTS_APPEARANCE |
        anychart.ConsistencyState.STOCK_SCROLLER);
    // we do not mark BOUNDS consistent, since the chart becomes unresizable in that case
    //this.markConsistent(anychart.ConsistencyState.BOUNDS);
    this.invalidate(anychart.ConsistencyState.STOCK_FULL_RANGE_PARAMS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.STOCK_DATA)) {
    var veryFirst = this.dataController_.getFirstKey();
    var veryLast = this.dataController_.getLastKey();
    this.xScale().setAutoFullRange(
        veryFirst,
        veryLast,
        this.dataController_.getFirstIndex(),
        this.dataController_.getLastIndex());
    var first = this.dataController_.getFirstSelectedKey();
    if (isNaN(first) || this.dataController_.currentSelectionSticksLeft())
      first = veryFirst;
    first = goog.math.clamp(first, veryFirst, veryLast);
    var last = this.dataController_.getLastSelectedKey();
    if (isNaN(last) || this.dataController_.currentSelectionSticksRight())
      last = veryLast;
    last = goog.math.clamp(last, veryFirst, veryLast);

    this.invalidate(anychart.ConsistencyState.STOCK_FULL_RANGE_PARAMS);
    this.selectRangeInternal(first, last, true);

    this.markConsistent(anychart.ConsistencyState.STOCK_DATA);

    this.dispatchRangeChange_(
        anychart.enums.EventType.SELECTED_RANGE_CHANGE,
        anychart.enums.StockRangeChangeSource.DATA_CHANGE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.STOCK_FULL_RANGE_PARAMS)) {
    if (this.scroller_) {
      this.dataController_.refreshFullRangeSources(this.scroller_.getPixelBounds().width);
      var scale = this.scroller_.xScale();
      scale.setAutoFullRange(
          this.dataController_.getFirstKey(),
          this.dataController_.getLastKey(),
          this.dataController_.getFirstIndex(),
          this.dataController_.getLastIndex());
      scale.setCurrentRange(
          this.dataController_.getFirstKey(),
          this.dataController_.getLastKey(),
          this.dataController_.getFirstFullRangeIndex(),
          this.dataController_.getLastFullRangeIndex(),
          this.dataController_.getFullRangeGroupingIntervalUnit(),
          this.dataController_.getFullRangeGroupingIntervalCount());
      this.scroller_.invalidateScaleDependend();
    }
    this.markConsistent(anychart.ConsistencyState.STOCK_FULL_RANGE_PARAMS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.STOCK_SCALES)) {
    this.calculateScales_();
    this.markConsistent(anychart.ConsistencyState.STOCK_SCALES);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.STOCK_SCROLLER)) {
    if (this.scroller_) {
      this.scroller_.setRangeByValues(
          this.dataController_.getFirstSelectedKey(),
          this.dataController_.getLastSelectedKey());
      this.scroller_.container(this.rootElement);
      this.scroller_.draw();
    }
    this.markConsistent(anychart.ConsistencyState.STOCK_SCROLLER);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.STOCK_PLOTS_APPEARANCE)) {
    for (i = 0; i < this.plots_.length; i++) {
      plot = this.plots_[i];
      if (plot) {
        if (!plot.container()) plot.container(this.rootElement);
        plot.draw();
      }
    }
    this.markConsistent(anychart.ConsistencyState.STOCK_PLOTS_APPEARANCE);
  }

  this.refreshHighlight_();

  anychart.core.Base.resumeSignalsDispatchingFalse(this.plots_, this.scroller_);
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
        scale = /** @type {anychart.scales.Base} */(aSeries.yScale());
        if (scale.needsAutoCalc()) {
          scale.startAutoCalc();
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
      scale = /** @type {anychart.scales.Base} */(aSeries.yScale());
      if (scale.needsAutoCalc()) {
        scale.startAutoCalc();
        scale.extendDataRange.apply(scale, aSeries.getScaleReferenceValues());
        scales.push(scale);
      }
    }
  }
  for (i = 0; i < scales.length; i++)
    scales[i].finishAutoCalc();
};


/** @inheritDoc */
anychart.charts.Stock.prototype.resizeHandler = function(e) {
  if (this.bounds().dependsOnContainerSize()) {
    this.invalidate(anychart.ConsistencyState.BOUNDS,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
  }
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
      'lastSelected': opt_last
    });
  } else {
    return this.dispatchEvent({
      'type': type,
      'source': source,
      'firstSelected': this.dataController_.getFirstSelectedKey(),
      'lastSelected': this.dataController_.getLastSelectedKey(),
      'firstVisible': this.dataController_.getFirstVisibleKey(),
      'lastVisible': this.dataController_.getLastVisibleKey(),
      'groupingIntervalUnit': this.dataController_.getCurrentGroupingIntervalUnit(),
      'groupingIntervalUnitCount': this.dataController_.getCurrentGroupingIntervalCount()
    });
  }
};


//region Signals handlers
/**
 * Plot signals handler.
 * @param {anychart.SignalEvent} event
 * @private
 */
anychart.charts.Stock.prototype.plotInvalidated_ = function(event) {
  var state = anychart.ConsistencyState.STOCK_PLOTS_APPEARANCE;
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED))
    state |= anychart.ConsistencyState.BOUNDS;
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
    state |= anychart.ConsistencyState.BOUNDS;
    signal |= anychart.Signal.BOUNDS_CHANGED;
  }
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
    if (plot) {
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


/**
 * Returns key by index. Index can be fractional - the key will be inter- or extrapolated.
 * @param {number} index
 * @return {number}
 */
anychart.charts.Stock.prototype.getKeyByIndex = function(index) {
  return this.dataController_.getKey(index);
};


/**
 * Returns index by key. If the key is not in the registry - returns fractional inter/extrapolated index for it.
 * @param {number} key
 * @return {number}
 */
anychart.charts.Stock.prototype.getIndexByKey = function(key) {
  return this.dataController_.getIndex(key);
};


/**
 * Returns key by index. Index can be fractional - the key will be inter- or extrapolated.
 * @param {number} index
 * @return {number}
 */
anychart.charts.Stock.prototype.getKeyByFullRangeIndex = function(index) {
  return this.dataController_.getFullRangeKey(index);
};


/**
 * Returns index by key. If the key is not in the registry - returns fractional inter/extrapolated index for it.
 * @param {number} key
 * @return {number}
 */
anychart.charts.Stock.prototype.getFullRangeIndexByKey = function(key) {
  return this.dataController_.getFullRangeIndex(key);
};


/**
 * Returns last visible date.
 * @return {number}
 */
anychart.charts.Stock.prototype.getLastDate = function() {
  return this.dataController_.getLastVisibleKey();
};
//endregion


//region Interactivity
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
    this.preventHighlight_();
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
    this.selectRangeInternal(first, last);
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
  this.allowHighlight_();
};


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
 * Prevents chart from highlighting points.
 * @private
 */
anychart.charts.Stock.prototype.preventHighlight_ = function() {
  this.highlightPrevented_ = true;
  this.unhighlight_();
};


/**
 * Turns highlight prevention off and refreshes points highlight if necessary.
 * @private
 */
anychart.charts.Stock.prototype.allowHighlight_ = function() {
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
  var value = this.xScale().inverseTransform(ratio);
  if (isNaN(value)) return;
  var index = this.getIndexByKey(value);
  if (index % 1 != 0) // aligning by points
    value = this.getKeyByIndex(Math.round(index));

  var i;
  var eventInfo = {
    'type': anychart.enums.EventType.POINTS_HOVER,
    'infoByPlots': goog.array.map(this.plots_, function(plot) {
      return {
        'plot': plot,
        'infoBySeries': plot ? plot.prepareHighlight(value) : null
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
   * @type {!anychart.core.ui.ChartTooltip}
   */
  var tooltip = /** @type {!anychart.core.ui.ChartTooltip} */(this.tooltip());
  if (tooltip.displayMode() == anychart.enums.TooltipDisplayMode.UNION &&
      tooltip.positionMode() != anychart.enums.TooltipPositionMode.POINT) {
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
    tooltip.show(points, clientX, clientY, null, false, {'hoveredDate': value});
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
    this.tooltip().hide(null);
  }
};


/** @inheritDoc */
anychart.charts.Stock.prototype.createTooltip = function() {
  var tooltip = new anychart.core.ui.ChartTooltip();
  this.registerDisposable(tooltip);
  tooltip.chart(this);

  return tooltip;
};


/**
 * Returns current first selected.
 * @return {{
 *    firstKey: number,
 *    lastKey: number,
 *    firstIndex: number,
 *    lastIndex: number,
 *    minIndex: number,
 *    maxIndex: number,
 *    minKey: number,
 *    maxKey: number
 * }}
 */
anychart.charts.Stock.prototype.getDragAnchor = function() {
  var controller = this.dataController_;
  return {
    firstKey: controller.getFirstSelectedKey(),
    lastKey: controller.getLastSelectedKey(),
    firstIndex: controller.getFirstSelectedIndex(),
    lastIndex: controller.getLastSelectedIndex(),
    minIndex: this.getIndexByKey(controller.getFirstKey()),
    maxIndex: this.getIndexByKey(controller.getLastKey()),
    minKey: controller.getFirstKey(),
    maxKey: controller.getLastKey()
  };
};


/**
 * Drags the chart to passed position.
 * @param {number} ratio
 * @param {Object} anchor
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
    this.selectRangeInternal(start, end);
    anchor.firstIndex = this.getIndexByKey(anchor.firstKey);
    anchor.lastIndex = this.getIndexByKey(anchor.lastKey);
    anchor.minIndex = this.getIndexByKey(this.dataController_.getFirstKey());
    anchor.maxIndex = this.getIndexByKey(this.dataController_.getLastKey());
    anchor.minKey = this.dataController_.getFirstKey();
    anchor.maxKey = this.dataController_.getLastKey();
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
    this.preventHighlight_();
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
  this.allowHighlight_();
};
//endregion


/** @inheritDoc */
anychart.charts.Stock.prototype.disposeInternal = function() {
  goog.disposeAll(this.plots_);
  this.plots_ = null;

  goog.dispose(this.scroller_);
  this.scroller_ = null;

  goog.dispose(this.dataController_);
  this.dataController_ = null;

  goog.base(this, 'disposeInternal');
};


/** @inheritDoc */
anychart.charts.Stock.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  json['xScale'] = this.xScale().serialize();
  json['scroller'] = this.scroller().serialize();
  json['plots'] = goog.array.map(this.plots_, function(element) { return element ? element.serialize() : null; });
  return json;
};


/** @inheritDoc */
anychart.charts.Stock.prototype.setupByJSON = function(config) {
  goog.base(this, 'setupByJSON', config);
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

  json = config['selectedRange'];
  if (goog.isObject(json)) {
    this.selectRange(json['start'], json['end']);
  }
};


/**
 * Stock chart constructor function.
 * @return {anychart.charts.Stock}
 */
anychart.stock = function() {
  var result = new anychart.charts.Stock();
  result.setup(anychart.getFullTheme()['stock']);
  return result;
};


//exports
goog.exportSymbol('anychart.stock', anychart.stock);
anychart.charts.Stock.prototype['plot'] = anychart.charts.Stock.prototype.plot;
anychart.charts.Stock.prototype['scroller'] = anychart.charts.Stock.prototype.scroller;
anychart.charts.Stock.prototype['xScale'] = anychart.charts.Stock.prototype.xScale;
anychart.charts.Stock.prototype['selectRange'] = anychart.charts.Stock.prototype.selectRange;
anychart.charts.Stock.prototype['getType'] = anychart.charts.Stock.prototype.getType;
anychart.charts.Stock.prototype['legend'] = anychart.charts.Stock.prototype.legend;
