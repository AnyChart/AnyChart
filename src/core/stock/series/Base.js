goog.provide('anychart.core.stock.series.Base');
goog.require('anychart.core.VisualBaseWithBounds');
goog.require('anychart.core.ui.SeriesTooltip');
goog.require('anychart.core.utils.LegendItemSettings');
goog.require('anychart.core.utils.StockSeriesContextProvider');
goog.require('anychart.data.Table');
goog.require('goog.object');



/**
 *
 * @param {!anychart.charts.Stock} chart
 * @param {!anychart.core.stock.Plot} plot
 * @constructor
 * @extends {anychart.core.VisualBaseWithBounds}
 */
anychart.core.stock.series.Base = function(chart, plot) {
  goog.base(this);

  /**
   * Chart reference.
   * @type {!anychart.charts.Stock}
   */
  this.chart = chart;

  /**
   * Plot reference.
   * @type {!anychart.core.stock.Plot}
   */
  this.plot = plot;

  /**
   * Series data interface.
   * @type {anychart.data.TableSelectable}
   * @private
   */
  this.data_ = null;

  /**
   * Original data source.
   * @type {anychart.data.Table|anychart.data.TableMapping|Array|string}
   * @private
   */
  this.dataSource_ = null;

  /**
   * Contains data instance that should be disposed.
   * @type {goog.disposable.IDisposable}
   * @private
   */
  this.dataToDispose_ = null;

  /**
   * An array used to determine data mapping fields used by the series. May be redefined in subclasses.
   * @type {!Array.<string>}
   * @protected
   */
  this.usedFields = ['value'];

  /**
   * Series index.
   * @type {number}
   * @private
   */
  this.index_ = NaN;

  /**
   * Y values of the currently drawn point. Updated in this.extractValues_() method. Values set and order is
   * defined by this.usedFields array.
   * @type {!Array.<*>}
   */
  this.yValues = [];

  /**
   * Y pixel values of the currently drawn point. Updated in this.extractValues_() method. Values set and order is
   * defined by this.usedFields array.
   * @type {!Array.<number>}
   */
  this.yPixelValues = [];

  /**
   * X pixel value of the currently drawn point. Updated in this.extractValues_() method.
   * @type {number}
   */
  this.xPixelValue = NaN;

  /**
   * The pixel value of zero for the current bounds and scale state. Updated in this.draw() method.
   * @type {number}
   */
  this.zeroPixelValue = NaN;

  /**
   * Cache of current pixel bounds. Allows to avoid each time recalculation.
   * @type {!anychart.math.Rect}
   */
  this.pixelBoundsCache = this.getPixelBounds();

  /**
   * Root layer of the series.
   * @type {acgraph.vector.Layer}
   */
  this.rootLayer = null;

  /**
   * X scale reference.
   * @type {anychart.scales.StockScatterDateTime}
   * @protected
   */
  this.xScale = null;

  /**
   * Series Y scale.
   * @type {anychart.scales.ScatterBase}
   * @private
   */
  this.yScale_ = null;

  /**
   * Clip settings.
   * @type {boolean|anychart.math.Rect}
   * @private
   */
  this.clip_ = false;

  /**
   * Series drawer.
   * @type {anychart.core.dataDrawers.Base}
   * @protected
   */
  this.drawer = null;

  /**
   * Currently highlighted point.
   * @type {anychart.data.TableSelectable.RowProxy}
   * @private
   */
  this.highlightedRow_ = null;

  /**
   * Currently last point.
   * @type {anychart.data.TableSelectable.RowProxy}
   * @private
   */
  this.lastRow_ = null;

  /**
   * Context provider.
   * @type {anychart.core.utils.StockSeriesContextProvider}
   * @private
   */
  this.pointProvider_ = null;

  /**
   * @type {anychart.core.ui.SeriesTooltip}
   * @private
   */
  this.tooltip_ = null;
};
goog.inherits(anychart.core.stock.series.Base, anychart.core.VisualBaseWithBounds);


/**
 * Consistency states supported by series.
 * @type {number}
 */
anychart.core.stock.series.Base.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBaseWithBounds.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.STOCK_SERIES_COLOR |
    anychart.ConsistencyState.STOCK_SERIES_CLIP |
    anychart.ConsistencyState.STOCK_SERIES_POINTS;


/**
 * Map of series constructors by type.
 * @type {Object.<string, Function>}
 */
anychart.core.stock.series.Base.SeriesTypesMap = {};


/**
 * Gets and sets data for the series.
 * @param {(anychart.data.TableMapping|anychart.data.Table|Array.<Array.<*>>|string)=} opt_value
 * @param {Object.<({column: number, type: anychart.enums.AggregationType, weights: number}|number)>=} opt_mappingSettings
 *   An object where keys are field names and values are objects with fields:
 *      - 'column': number - Column index, that the field should get values from;
 *      - 'type': anychart.enums.AggregationType - How to group values for the field. Defaults to 'close'.
 *      - 'weights': number - Column to get weights from for 'weightedAverage' grouping type. Note: If type set to
 *          'weightedAverage', but opt_weightsColumn is not passed - uses 'average' grouping instead.
 *   or numbers - just the column index to get values from. In this case the grouping type will be set to 'close'.
 * @param {Object=} opt_csvSettings CSV parser settings if the string is passed.
 * @return {anychart.data.TableMapping|anychart.data.Table|Array.<Array.<*>>|string|anychart.core.stock.series.Base}
 */
anychart.core.stock.series.Base.prototype.data = function(opt_value, opt_mappingSettings, opt_csvSettings) {
  if (goog.isDef(opt_value)) {
    var data;
    // deregistering data source
    if (this.data_) {
      data = this.data_;
      // we need this zeroing to let the chart check if the data source is still relevant
      this.data_ = null;
      this.chart.deregisterSource(/** @type {!anychart.data.TableSelectable} */(data));
    }

    // disposing previously created data
    if (this.dataToDispose_) {
      goog.dispose(this.dataToDispose_);
      this.dataToDispose_ = null;
    }

    // saving source value here
    this.dataSource_ = opt_value;

    // creating data table if needed
    if (goog.isArray(opt_value) || goog.isString(opt_value)) {
      data = new anychart.data.Table();
      data.addData(opt_value, false, opt_csvSettings);
      this.dataToDispose_ = opt_value = data;
    }

    // creating data mapping if needed
    if (opt_value instanceof anychart.data.Table) {
      opt_value = opt_value.mapAs(opt_mappingSettings);
      if (!opt_mappingSettings) {
        opt_value.addField('value', 1, anychart.enums.AggregationType.AVERAGE);
        opt_value.addField('size', 2, anychart.enums.AggregationType.SUM);
        opt_value.addField('open', 1, anychart.enums.AggregationType.FIRST);
        opt_value.addField('high', 2, anychart.enums.AggregationType.MAX);
        opt_value.addField('low', 3, anychart.enums.AggregationType.MIN);
        opt_value.addField('close', 4, anychart.enums.AggregationType.LAST);
        opt_value.addField('volume', 5, anychart.enums.AggregationType.SUM);
      }
      if (!this.dataToDispose_)
        this.dataToDispose_ = opt_value;
    }

    // applying passed value if it is suitable.
    if (opt_value instanceof anychart.data.TableMapping) {
      this.data_ = opt_value.createSelectable();
      this.chart.registerSource(this.data_, false);
    } else {
      this.dataSource_ = null;
    }
    return this;
  }
  return this.dataSource_;
};


/**
 * Returns current series data as TableSelectable (if any data is set).
 * @return {anychart.data.TableSelectable}
 */
anychart.core.stock.series.Base.prototype.getSelectableData = function() {
  return this.data_;
};


/**
 * Sets series index.
 * @param {number} value
 */
anychart.core.stock.series.Base.prototype.setIndex = function(value) {
  this.index_ = value;
};


/**
 * Returns series index.
 * @return {number}
 */
anychart.core.stock.series.Base.prototype.getIndex = function() {
  return this.index_;
};


/**
 * Returns type of current series.
 * @return {anychart.enums.StockSeriesType} Series type.
 */
anychart.core.stock.series.Base.prototype.getType = goog.abstractMethod;


/**
 * Clipping settings
 * @param {(boolean|anychart.math.Rect)=} opt_value [False, if series is created manually.<br/>True, if created via chart
 *    Enable/disable series clip.
 * @return {anychart.core.stock.series.Base|boolean|anychart.math.Rect} .
 */
anychart.core.stock.series.Base.prototype.clip = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (goog.isNull(opt_value)) opt_value = false;
    if (this.clip_ != opt_value) {
      this.clip_ = opt_value;
      this.invalidate(anychart.ConsistencyState.STOCK_SERIES_CLIP, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.clip_;
  }
};


/**
 * Getter and setter for the tooltip.
 * @param {(Object|boolean|null)=} opt_value Tooltip settings.
 * @return {!(anychart.core.stock.series.Base|anychart.core.ui.SeriesTooltip)} Tooltip instance or itself for chaining call.
 */
anychart.core.stock.series.Base.prototype.tooltip = function(opt_value) {
  if (!this.tooltip_) {
    this.tooltip_ = new anychart.core.ui.SeriesTooltip();
    this.registerDisposable(this.tooltip_);
  }
  if (goog.isDef(opt_value)) {
    this.tooltip_.setup(opt_value);
    return this;
  } else {
    return this.tooltip_;
  }
};


//region Drawing
/** @inheritDoc */
anychart.core.stock.series.Base.prototype.remove = function() {
  if (this.rootLayer) {
    this.rootLayer.remove();
  }
};


/**
 * Draws the series. Stock series drawing differs from other series drawing, because they are completely independent of
 * each other. So we can draw them one by one without any influence of the chart, the plot or other series.
 * @return {anychart.core.stock.series.Base}
 */
anychart.core.stock.series.Base.prototype.draw = function() {
  var chartXScale = /** @type {anychart.scales.StockScatterDateTime} */(this.chart.xScale());
  if (this.xScale != chartXScale) {
    this.xScale = chartXScale;
    this.invalidate(anychart.ConsistencyState.STOCK_SERIES_POINTS);
  }

  if (!this.checkDrawingNeeded())
    return this;
  // we won't try to suspend stage here, because stock series are not going to be standalone

  // this method places all needed things to the container, so we can just clear the container state after calling it
  this.ensureVisualIsReady(/** @type {acgraph.vector.ILayer} */(this.container()));
  this.markConsistent(anychart.ConsistencyState.CONTAINER);

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    this.rootLayer.zIndex(/** @type {number} */(this.zIndex()));
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.pixelBoundsCache = this.getPixelBounds();
    this.invalidate(anychart.ConsistencyState.STOCK_SERIES_CLIP |
        anychart.ConsistencyState.STOCK_SERIES_POINTS |
        anychart.ConsistencyState.STOCK_SERIES_COLOR);
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.STOCK_SERIES_CLIP)) {
    var clip = goog.isBoolean(this.clip_) ?
        (this.clip_ ? this.pixelBoundsCache : null) :
        /** @type {anychart.math.Rect} */(this.clip_);
    this.rootLayer.clip(clip);
    this.markConsistent(anychart.ConsistencyState.STOCK_SERIES_CLIP);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.STOCK_SERIES_POINTS)) {
    var usedColumns = this.retrieveColumns_(this.usedFields);
    // it is also null if this.data_ == null
    if (usedColumns) {
      var zeroRatio = goog.math.clamp(this.yScale().transform(0), 0, 1);
      this.zeroPixelValue = Math.round(this.applyRatioToBounds_(zeroRatio, false));

      this.startDrawing();

      var prevPointDrawn = false;
      var iterator = this.data_.getIterator();

      var hasPointsInside = iterator.advance();
      var prePoint = this.data_.getPreFirstRow();
      var postPoint = this.data_.getPostLastRow();
      if (prePoint) {
        prevPointDrawn = this.drawPoint_(prePoint, this.chart.getIndexByKey(prePoint.getKey()), prevPointDrawn, usedColumns);
      }

      if (hasPointsInside) {
        do {
          prevPointDrawn = this.drawPoint_(iterator, iterator.getIndex(), prevPointDrawn, usedColumns);
        } while (iterator.advance());
      }

      if (postPoint) {
        prevPointDrawn = this.drawPoint_(postPoint, this.chart.getIndexByKey(postPoint.getKey()), prevPointDrawn, usedColumns);
      }

      this.finalizeDrawing(prevPointDrawn);
    }
    this.markConsistent(anychart.ConsistencyState.STOCK_SERIES_POINTS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.STOCK_SERIES_COLOR)) {
    this.colorizePoints();
    this.markConsistent(anychart.ConsistencyState.STOCK_SERIES_COLOR);
  }

  return this;
};


/**
 * Draws point.
 * @param {anychart.data.TableIterator|anychart.data.TableSelectable.RowProxy} rowInfoExtractor
 * @param {number} rowIndex
 * @param {boolean} prevPointDrawn
 * @param {Array.<number>} usedColumns
 * @return {boolean}
 * @private
 */
anychart.core.stock.series.Base.prototype.drawPoint_ = function(rowInfoExtractor, rowIndex, prevPointDrawn, usedColumns) {
  if (this.extractValues_(rowInfoExtractor, usedColumns, rowIndex)) {
    if (prevPointDrawn)
      this.drawSubsequentPoint();
    else
      this.drawFirstPoint();
    return true;
  } else {
    this.drawMissing(prevPointDrawn);
    return false;
  }
};


/**
 * This method ensures that all visual elements needed are created. Also it should do everything needed to clear out
 * CONTAINER consistency state but it shouldn't mark it as cleared.
 * @param {acgraph.vector.ILayer} container Saved this.container() value.
 * @protected
 */
anychart.core.stock.series.Base.prototype.ensureVisualIsReady = function(container) {
  if (!this.rootLayer)
    this.rootLayer = acgraph.layer();

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER))
    this.rootLayer.parent(container);
};


/**
 * Starts series drawing. Should ensure that all visual elements are cleared.
 * @protected
 */
anychart.core.stock.series.Base.prototype.startDrawing = function() {};


/**
 * Draws first real point after missing or series start.
 */
anychart.core.stock.series.Base.prototype.drawFirstPoint = function() {
  this.drawer.drawFirstPoint(this.xPixelValue, this.yValues, this.yPixelValues, this.zeroPixelValue);
};


/**
 * Draws subsequent series point (not first).
 */
anychart.core.stock.series.Base.prototype.drawSubsequentPoint = function() {
  this.drawer.drawSubsequentPoint(this.xPixelValue, this.yValues, this.yPixelValues, this.zeroPixelValue);
};


/**
 * Handles drawing of a missing point. Parameter defines whether the point is the first missing after a non-missing.
 * @param {boolean} firstMissingInARow
 */
anychart.core.stock.series.Base.prototype.drawMissing = function(firstMissingInARow) {
  this.drawer.finalizeSegment();
};


/**
 * Finalizes series drawing. Parameter specifies whether the last drawn point was non missing.
 * @param {boolean} lastPointWasNonMissing
 */
anychart.core.stock.series.Base.prototype.finalizeDrawing = function(lastPointWasNonMissing) {
  this.drawer.finalizeSegment();
};


/**
 * Applies color settings to series elements.
 */
anychart.core.stock.series.Base.prototype.colorizePoints = function() {};


/**
 * Returns values, needed to be counted on in scale min/max determining.
 * @return {!Array.<number>}
 */
anychart.core.stock.series.Base.prototype.getScaleReferenceValues = function() {
  var columns = this.retrieveColumns_(this.usedFields);
  var res = [];
  if (columns) {
    var i, len = columns.length;
    for (i = 0; i < len; i++) {
      var column = columns[i];
      res.push(this.data_.getColumnMin(column));
      res.push(this.data_.getColumnMax(column));
    }

    var row = this.data_.getPreFirstRow();
    if (row) {
      for (i = 0; i < len; i++) {
        res.push(row.getColumn(columns[i]));
      }
    }

    row = this.data_.getPostLastRow();
    if (row) {
      for (i = 0; i < len; i++) {
        res.push(row.getColumn(columns[i]));
      }
    }
  }
  return res;
};


/**
 * Retrieves an array of column indexes matching asked column names from the current mapping.
 * @param {Array.<string>} fields
 * @return {?Array.<number>}
 * @private
 */
anychart.core.stock.series.Base.prototype.retrieveColumns_ = function(fields) {
  this.yPixelValues.length = fields.length;
  this.yValues.length = fields.length;
  // we do not report empty data drawing because it is not actually an error
  if (!this.data_) return null;
  var res = [];
  for (var i = 0; i < fields.length; i++) {
    var column = this.data_.getFieldColumn(fields[i]);
    if (isNaN(column)) {
      anychart.utils.warning(anychart.enums.WarningCode.STOCK_WRONG_MAPPING, undefined, [this.getType(), fields[i]]);
      return null;
    }
    res.push(column);
  }
  return res;
};


/**
 * Extracts pixel values and puts them to this.yPixelValues and this.xPixelValue.
 * If the point is missing, this.yPixelValues and this.xPixelValue should not be used, because they would contain
 * wrong values.
 * @param {anychart.data.TableIterator|anychart.data.TableSelectable.RowProxy} rowInfoExtractor
 * @param {Array.<number>} columns
 * @param {number} rowIndex
 * @return {boolean}
 * @private
 */
anychart.core.stock.series.Base.prototype.extractValues_ = function(rowInfoExtractor, columns, rowIndex) {
  this.xPixelValue = this.applyRatioToBounds_(
      this.xScale.transformInternal(rowInfoExtractor.getKey(), rowIndex), true);
  if (isNaN(this.xPixelValue)) return false;
  var scale = this.yScale();
  for (var i = 0; i < columns.length; i++) {
    var val = rowInfoExtractor.getColumn(columns[i]);
    var ratio;
    this.yValues[i] = val;
    if (scale.isMissing(val) || isNaN(ratio = scale.transform(val)))
      return false;
    this.yPixelValues[i] = this.applyRatioToBounds_(ratio, false);
  }
  return true;
};


/**
 * Applies passed ratio (usually transformed by a scale) to bounds where
 * series is drawn.
 * @param {number} ratio
 * @param {boolean} horizontal
 * @return {number}
 * @private
 */
anychart.core.stock.series.Base.prototype.applyRatioToBounds_ = function(ratio, horizontal) {
  var min, range;
  if (horizontal) {
    min = this.pixelBoundsCache.left;
    range = this.pixelBoundsCache.width;
  } else {
    min = this.pixelBoundsCache.getBottom();
    range = -this.pixelBoundsCache.height;
  }
  return min + ratio * range;
};
//endregion


/**
 * Getter/setter for the Y scale.
 * @param {anychart.scales.ScatterBase=} opt_value Value to set.
 * @return {(anychart.scales.ScatterBase|!anychart.core.stock.series.Base)} Series Y Scale or itself for chaining call.
 */
anychart.core.stock.series.Base.prototype.yScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.yScale_ != opt_value) {
      if (this.yScale_)
        this.yScale_.unlistenSignals(this.scaleInvalidated_, this);
      this.yScale_ = opt_value;
      this.yScale_.listenSignals(this.scaleInvalidated_, this);
      this.invalidate(anychart.ConsistencyState.STOCK_SERIES_POINTS, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.yScale_ ? this.yScale_ : /** @type {anychart.scales.ScatterBase} */(this.plot.yScale());
};


/**
 * Scales invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.stock.series.Base.prototype.scaleInvalidated_ = function(event) {
  var signal = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION))
    signal |= anychart.Signal.NEEDS_RECALCULATION;
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION))
    signal |= anychart.Signal.NEEDS_REDRAW;
  else
    this.dispatchSignal(signal);
  this.invalidate(anychart.ConsistencyState.STOCK_SERIES_POINTS, signal);
};


/**
 * Prepares series data for highlight.
 * @param {number} value
 * @return {anychart.data.TableSelectable.RowProxy}
 */
anychart.core.stock.series.Base.prototype.prepareHighlight = function(value) {
  return this.data_.search(value, anychart.enums.TableSearchMode.EXACT);
};


/**
 * Updates last row. Used in plot.
 */
anychart.core.stock.series.Base.prototype.updateLastRow = function() {
  this.lastRow_ = this.data_.getLastRow();
};


/**
 * Highlights series data.
 * @param {number} value
 */
anychart.core.stock.series.Base.prototype.highlight = function(value) {
  this.highlightedRow_ = this.prepareHighlight(value);
};


/**
 * Removes series highlight.
 */
anychart.core.stock.series.Base.prototype.removeHighlight = function() {
  this.highlightedRow_ = null;
};


/**
 * Returns current point for the legend.
 * @return {?anychart.data.TableSelectable.RowProxy}
 */
anychart.core.stock.series.Base.prototype.getCurrentPoint = function() {
  return this.highlightedRow_ || this.lastRow_;
};


/**
 * Sets/Gets legend item setting for series.
 * @param {(Object)=} opt_value Legend item settings object.
 * @return {(anychart.core.utils.LegendItemSettings|anychart.core.stock.series.Base)} Legend item settings or self for chaining.
 */
anychart.core.stock.series.Base.prototype.legendItem = function(opt_value) {
  if (!this.legendItem_) {
    this.legendItem_ = new anychart.core.utils.LegendItemSettings();
    this.registerDisposable(this.legendItem_);
    this.legendItem_.listenSignals(this.onLegendItemSignal_, this);
  }
  if (goog.isDef(opt_value)) {
    this.legendItem_.setup(opt_value);
    return this;
  }

  return this.legendItem_;
};


/**
 * Listener for legend item settings invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.core.stock.series.Base.prototype.onLegendItemSignal_ = function(event) {
  var signal = anychart.Signal.NEED_UPDATE_LEGEND;
  var force = false;
  //if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
  //  signal |= anychart.Signal.BOUNDS_CHANGED;
  //  force = true;
  //}
  this.dispatchSignal(signal, force);
};


/**
 * Create base series format provider.
 * @param {boolean=} opt_force create context provider forcibly.
 * @return {anychart.core.utils.StockSeriesContextProvider} Object with info for labels formatting.
 * @protected
 */
anychart.core.stock.series.Base.prototype.createFormatProvider = function(opt_force) {
  if (!this.pointProvider_ || opt_force)
    this.pointProvider_ = new anychart.core.utils.StockSeriesContextProvider(this, this.usedFields);
  this.pointProvider_.applyReferenceValues();
  return this.pointProvider_;
};


/**
 * Creates legend item config.
 * @param {Function} itemsTextFormatter Items text formatter.
 * @return {!anychart.core.ui.Legend.LegendItemProvider} Legend item config.
 */
anychart.core.stock.series.Base.prototype.getLegendItemData = function(itemsTextFormatter) {
  var legendItem = this.legendItem();
  legendItem.markAllConsistent();
  var json = legendItem.serialize();
  //var iconFill, iconStroke, iconHatchFill;
  //if (goog.isFunction(legendItem.iconFill())) {
  //  iconFill = legendItem.iconFill().call(this.fill());
  //}
  //if (goog.isFunction(legendItem.iconStroke())) {
  //  iconStroke = legendItem.iconStroke().call(this.color());
  //}
  //if (goog.isFunction(legendItem.iconHatchFill())) {
  //  iconHatchFill = legendItem.iconHatchFill().call(this.autoHatchFill_);
  //}
  var itemText;
  /** @type {anychart.core.utils.StockSeriesContextProvider} */
  var format = this.createFormatProvider();
  if (goog.isFunction(itemsTextFormatter)) {
    itemText = itemsTextFormatter.call(format, format);
  }
  if (!goog.isString(itemText)) {
    itemText = /** @type {string} */(this.name()) + ': ' + this.getLegendValue(format);
  }

  var ret = {
    'text': /** @type {string} */ (itemText),
    'iconEnabled': true,
    'iconType': this.getLegendIconType(format),
    'iconStroke': this.getLegendIconStroke(format),
    'iconFill': this.getLegendIconFill(format),
    'iconHatchFill': null, //iconHatchFill || this.getFinalHatchFill(false, false),
    'disabled': !this.enabled()
  };
  goog.object.extend(ret, json);
  return ret;
};


/**
 * Sets and gets series name.
 * @param {string=} opt_value
 * @return {anychart.core.stock.series.Base|string}
 */
anychart.core.stock.series.Base.prototype.name = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.name_ != opt_value) {
      this.name_ = String(opt_value);
      this.dispatchSignal(anychart.Signal.NEED_UPDATE_LEGEND);
    }
    return this;
  }
  return this.name_ || ('Series ' + this.getIndex());
};


/**
 * @param {Object} format
 * @return {string}
 */
anychart.core.stock.series.Base.prototype.getLegendValue = function(format) {
  return anychart.utils.toNumber(format['value']).toFixed(2);
};


/**
 * Returns legend icon type.
 * @param {anychart.core.utils.StockSeriesContextProvider} context
 * @return {anychart.enums.LegendItemIconType}
 */
anychart.core.stock.series.Base.prototype.getLegendIconType = function(context) {
  return anychart.enums.LegendItemIconType.SQUARE;
};


/**
 * @param {anychart.core.utils.StockSeriesContextProvider} context
 * @return {acgraph.vector.Fill}
 */
anychart.core.stock.series.Base.prototype.getLegendIconFill = function(context) {
  return '#000';
};


/**
 * @param {anychart.core.utils.StockSeriesContextProvider} context
 * @return {acgraph.vector.Stroke}
 */
anychart.core.stock.series.Base.prototype.getLegendIconStroke = function(context) {
  return '#000';
};


/**
 * @inheritDoc
 */
anychart.core.stock.series.Base.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  json['tooltip'] = this.tooltip().serialize();
  return json;
};


/**
 * @inheritDoc
 */
anychart.core.stock.series.Base.prototype.setupByJSON = function(config) {
  goog.base(this, 'setupByJSON', config);
  this.tooltip(config['tooltip']);
  this.legendItem(config['legendItem']);
};


//anychart.core.stock.series.Base.prototype['clip'] = anychart.core.stock.series.Base.prototype.clip;
//anychart.core.stock.series.Base.prototype['getType'] = anychart.core.stock.series.Base.prototype.getType;

//exports
anychart.core.stock.series.Base.prototype['data'] = anychart.core.stock.series.Base.prototype.data;
anychart.core.stock.series.Base.prototype['yScale'] = anychart.core.stock.series.Base.prototype.yScale;
anychart.core.stock.series.Base.prototype['getIndex'] = anychart.core.stock.series.Base.prototype.getIndex;
anychart.core.stock.series.Base.prototype['tooltip'] = anychart.core.stock.series.Base.prototype.tooltip;
anychart.core.stock.series.Base.prototype['legendItem'] = anychart.core.stock.series.Base.prototype.legendItem;
anychart.core.stock.series.Base.prototype['name'] = anychart.core.stock.series.Base.prototype.name;
