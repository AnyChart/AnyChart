goog.provide('anychart.core.stock.scrollerSeries.Base');
goog.require('acgraph');
goog.require('anychart.core.VisualBaseWithBounds');
goog.require('anychart.core.dataDrawers.Base');
goog.require('anychart.data.Table');


/**
 * Namespace anychart.core.stock.scrollerSeries
 * @namespace
 * @name anychart.core.stock.scrollerSeries
 */



/**
 *
 * @param {!anychart.core.stock.Scroller} scroller
 * @constructor
 * @extends {anychart.core.VisualBaseWithBounds}
 */
anychart.core.stock.scrollerSeries.Base = function(scroller) {
  goog.base(this);

  /**
   * Scroller reference.
   * @type {!anychart.core.stock.Scroller}
   * @protected
   */
  this.scroller = scroller;

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
   * Root layer of the series.
   * @type {acgraph.vector.Layer}
   */
  this.rootLayerSelected = null;

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
   * Second container for the selected copy of the series.
   * @type {acgraph.vector.ILayer}
   * @private
   */
  this.selectedContainer_ = null;

  /**
   * Series drawer.
   * @type {anychart.core.dataDrawers.Base}
   * @protected
   */
  this.drawer = null;

  /**
   * Series selected drawer.
   * @type {anychart.core.dataDrawers.Base}
   * @protected
   */
  this.selectedDrawer = null;
};
goog.inherits(anychart.core.stock.scrollerSeries.Base, anychart.core.VisualBaseWithBounds);


/**
 * Consistency states supported by series.
 * @type {number}
 */
anychart.core.stock.scrollerSeries.Base.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBaseWithBounds.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.STOCK_SERIES_COLOR |
    anychart.ConsistencyState.STOCK_SERIES_POINTS;


/**
 * Map of series constructors by type.
 * @type {Object.<string, Function>}
 */
anychart.core.stock.scrollerSeries.Base.SeriesTypesMap = {};


/**
 * Gets and sets data for the series.
 * @param {(anychart.data.TableMapping|anychart.data.Table|Array.<Array.<*>>|string)=} opt_value
 * @param {Object.<({column: (number|string), type: anychart.enums.AggregationType, weights: (number|string)}|number|string)>=} opt_mappingSettings
 *   An object where keys are field names and values are objects with fields:
 *      - 'column': number - Column index, that the field should get values from;
 *      - 'type': anychart.enums.AggregationType - How to group values for the field. Defaults to 'close'.
 *      - 'weights': number - Column to get weights from for 'weightedAverage' grouping type. Note: If type set to
 *          'weightedAverage', but opt_weightsColumn is not passed - uses 'average' grouping instead.
 *   or numbers - just the column index to get values from. In this case the grouping type will be set to 'close'.
 * @param {Object=} opt_csvSettings CSV parser settings if the string is passed.
 * @return {anychart.data.TableMapping|anychart.data.Table|Array.<Array.<*>>|string|anychart.core.stock.scrollerSeries.Base}
 */
anychart.core.stock.scrollerSeries.Base.prototype.data = function(opt_value, opt_mappingSettings, opt_csvSettings) {
  if (goog.isDef(opt_value)) {
    this.scroller.getChart().suspendSignalsDispatching();
    var data;
    // deregistering data source
    if (this.data_) {
      data = this.data_;
      // we need this zeroing to let the chart check if the data source is still relevant
      this.data_ = null;
      this.scroller.getChart().deregisterSource(/** @type {!anychart.data.TableSelectable} */(data));
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
      this.scroller.getChart().registerSource(this.data_, true);
    } else {
      this.dataSource_ = null;
    }
    this.scroller.getChart().resumeSignalsDispatching(true);
    return this;
  }
  return this.dataSource_;
};


/**
 * Returns current series data as TableSelectable (if any data is set).
 * @return {anychart.data.TableSelectable}
 */
anychart.core.stock.scrollerSeries.Base.prototype.getSelectableData = function() {
  return this.data_;
};


/**
 * Sets/gets series inner index.
 * @param {number=} opt_value
 * @return {anychart.core.stock.scrollerSeries.Base|number}
 */
anychart.core.stock.scrollerSeries.Base.prototype.index = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.index_ = opt_value;
    return this;
  } else {
    return this.index_;
  }
};


/**
 * Returns series index.
 * @return {number}
 */
anychart.core.stock.scrollerSeries.Base.prototype.getIndex = function() {
  if (this.isDisposed())
    return -1;
  return goog.array.indexOf(this.scroller.getAllSeries(), this);
};


/**
 * Getter/setter for series id.
 * @param {(string|number)=} opt_value Id of the series.
 * @return {string|number|anychart.core.stock.scrollerSeries.Base} Id or self for chaining.
 */
anychart.core.stock.scrollerSeries.Base.prototype.id = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.id_ = opt_value;
    return this;
  } else {
    return this.id_;
  }
};


/**
 * Returns type of current series.
 * @return {anychart.enums.StockSeriesType} Series type.
 */
anychart.core.stock.scrollerSeries.Base.prototype.getType = goog.abstractMethod;


/**
 * Container for the second, selected replica of the series.
 * @param {(acgraph.vector.ILayer|string|Element)=} opt_value .
 * @return {(acgraph.vector.ILayer|!anychart.core.stock.scrollerSeries.Base)} .
 */
anychart.core.stock.scrollerSeries.Base.prototype.selectedContainer = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.selectedContainer_ != opt_value) {
      var containerBounds = this.selectedContainer_ && this.selectedContainer_.getStage() && this.selectedContainer_.getStage().getBounds();
      if (goog.isString(opt_value) || goog.dom.isElement(opt_value)) {
        // Should we use registerDisposable in this case?
        // TODO(Anton Saukh): fix type cast to {Element|string} when this will be fixed in graphics.
        this.selectedContainer_ = acgraph.create();
        this.registerDisposable(this.selectedContainer_);
        this.selectedContainer_.container(/** @type {Element} */(opt_value));

        //if graphics engine can't recognize passed container
        //we should destroy stage to avoid uncontrolled behaviour
        if (!this.selectedContainer_.container()) {
          this.selectedContainer_.dispose();
          this.selectedContainer_ = null;
          return this;
        }
      } else {
        this.selectedContainer_ = /** @type {acgraph.vector.ILayer} */(opt_value);
      }

      var state = anychart.ConsistencyState.CONTAINER;
      var newContainerBounds = this.selectedContainer_ && this.selectedContainer_.getStage() && this.selectedContainer_.getStage().getBounds();
      if (!goog.math.Rect.equals(containerBounds, newContainerBounds))
        state |= anychart.ConsistencyState.BOUNDS;

      this.invalidate(state, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.selectedContainer_;
};


//region Drawing
/** @inheritDoc */
anychart.core.stock.scrollerSeries.Base.prototype.remove = function() {
  if (this.rootLayer) {
    this.rootLayer.remove();
    this.rootLayerSelected.remove();
  }
};


/**
 * Draws the series. Stock series drawing differs from other series drawing, because they are completely independent of
 * each other. So we can draw them one by one without any influence of the chart, the plot or other series.
 * @return {anychart.core.stock.scrollerSeries.Base}
 */
anychart.core.stock.scrollerSeries.Base.prototype.draw = function() {
  var scrollerXScale = /** @type {anychart.scales.StockScatterDateTime} */(this.scroller.xScale());
  if (this.xScale != scrollerXScale) {
    this.xScale = scrollerXScale;
    this.invalidate(anychart.ConsistencyState.STOCK_SERIES_POINTS);
  }

  if (!this.checkDrawingNeeded())
    return this;
  // we won't try to suspend stage here, because stock series are not going to be standalone

  // this method places all needed things to the container, so we can just clear the container state after calling it
  this.ensureVisualIsReady(
      /** @type {acgraph.vector.ILayer} */(this.container()),
      /** @type {acgraph.vector.ILayer} */(this.selectedContainer())
  );
  this.markConsistent(anychart.ConsistencyState.CONTAINER);

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    this.rootLayer.zIndex(/** @type {number} */(this.zIndex()));
    this.rootLayerSelected.zIndex(/** @type {number} */(this.zIndex()));
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.pixelBoundsCache = this.getPixelBounds();
    this.rootLayer.clip(this.pixelBoundsCache);
    this.invalidate(anychart.ConsistencyState.STOCK_SERIES_CLIP |
        anychart.ConsistencyState.STOCK_SERIES_POINTS |
        anychart.ConsistencyState.STOCK_SERIES_COLOR);
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.STOCK_SERIES_POINTS)) {
    var usedColumns = this.retrieveColumns_(this.usedFields);
    // it is also null if this.data_ == null
    if (usedColumns) {
      var zeroRatio = goog.math.clamp(this.yScale().transform(0), 0, 1);
      this.zeroPixelValue = Math.round(this.applyRatioToBounds_(zeroRatio, false));
      var iterator = this.data_.getIteratorInternal(true, true);
      var firstPointDrawn = false;
      iterator.reset();
      this.startDrawing();
      while (iterator.advance()) {
        if (this.extractValues_(iterator, usedColumns)) {
          if (firstPointDrawn) {
            this.drawSubsequentPoint();
          } else {
            this.drawFirstPoint();
            firstPointDrawn = true;
          }
        } else {
          this.drawMissing(firstPointDrawn);
          firstPointDrawn = false;
        }
      }
      this.finalizeDrawing(firstPointDrawn);
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
 * This method ensures that all visual elements needed are created. Also it should do everything needed to clear out
 * CONTAINER consistency state but it shouldn't mark it as cleared.
 * @param {acgraph.vector.ILayer} container Saved this.container() value.
 * @param {acgraph.vector.ILayer} containerSelected Saved this.selectedContainer() value.
 * @protected
 */
anychart.core.stock.scrollerSeries.Base.prototype.ensureVisualIsReady = function(container, containerSelected) {
  if (!this.rootLayer) {
    this.rootLayer = acgraph.layer();
    this.registerDisposable(this.rootLayer);
    this.rootLayerSelected = acgraph.layer();
    this.registerDisposable(this.rootLayerSelected);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    this.rootLayer.parent(container);
    this.rootLayerSelected.parent(containerSelected);
  }
};


/**
 * Starts series drawing. Usually just ensures that drawers are ready and sets them up.
 * @protected
 */
anychart.core.stock.scrollerSeries.Base.prototype.startDrawing = function() {};


/**
 * Draws first real point after missing or series start.
 */
anychart.core.stock.scrollerSeries.Base.prototype.drawFirstPoint = function() {
  this.drawer.drawFirstPoint(this.xPixelValue, this.yValues, this.yPixelValues, this.zeroPixelValue);
  this.selectedDrawer.drawFirstPoint(this.xPixelValue, this.yValues, this.yPixelValues, this.zeroPixelValue);
};


/**
 * Draws subsequent series point (not first).
 */
anychart.core.stock.scrollerSeries.Base.prototype.drawSubsequentPoint = function() {
  this.drawer.drawSubsequentPoint(this.xPixelValue, this.yValues, this.yPixelValues, this.zeroPixelValue);
  this.selectedDrawer.drawSubsequentPoint(this.xPixelValue, this.yValues, this.yPixelValues, this.zeroPixelValue);
};


/**
 * Handles drawing of a missing point. Parameter defines whether the point is the first missing after a non-missing.
 * @param {boolean} firstMissingInARow
 */
anychart.core.stock.scrollerSeries.Base.prototype.drawMissing = function(firstMissingInARow) {
  this.drawer.finalizeSegment();
  this.selectedDrawer.finalizeSegment();
};


/**
 * Finalizes series drawing. Parameter specifies whether the last drawn point was non missing.
 * @param {boolean} lastPointWasNonMissing
 */
anychart.core.stock.scrollerSeries.Base.prototype.finalizeDrawing = function(lastPointWasNonMissing) {
  this.drawer.finalizeSegment();
  this.selectedDrawer.finalizeSegment();
};


/**
 * Applies color settings to series elements.
 */
anychart.core.stock.scrollerSeries.Base.prototype.colorizePoints = function() {};


/**
 * Returns values, needed to be counted on in scale min/max determining.
 * @return {!Array.<number>}
 */
anychart.core.stock.scrollerSeries.Base.prototype.getScaleReferenceValues = function() {
  var columns = this.retrieveColumns_(this.usedFields);
  var res = [];
  if (columns) {
    for (var i = 0; i < columns.length; i++) {
      var column = columns[i];
      res.push(this.data_.getColumnMin(column));
      res.push(this.data_.getColumnMax(column));
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
anychart.core.stock.scrollerSeries.Base.prototype.retrieveColumns_ = function(fields) {
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
 * @param {anychart.data.TableIterator} iterator
 * @param {Array.<number>} columns
 * @return {boolean}
 * @private
 */
anychart.core.stock.scrollerSeries.Base.prototype.extractValues_ = function(iterator, columns) {
  this.xPixelValue = this.applyRatioToBounds_(
      this.xScale.transformInternal(iterator.getKey(), iterator.getIndex()), true);
  if (isNaN(this.xPixelValue)) return false;
  var scale = this.yScale();
  for (var i = 0; i < columns.length; i++) {
    var val = iterator.getColumn(columns[i]);
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
anychart.core.stock.scrollerSeries.Base.prototype.applyRatioToBounds_ = function(ratio, horizontal) {
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
 * @return {(anychart.scales.ScatterBase|!anychart.core.stock.scrollerSeries.Base)} Series Y Scale or itself for chaining call.
 */
anychart.core.stock.scrollerSeries.Base.prototype.yScale = function(opt_value) {
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
  return this.yScale_ ? this.yScale_ : /** @type {anychart.scales.ScatterBase} */(this.scroller.yScale());
};


/**
 * Scales invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.stock.scrollerSeries.Base.prototype.scaleInvalidated_ = function(event) {
  var signal = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION))
    signal |= anychart.Signal.NEEDS_RECALCULATION;
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION))
    signal |= anychart.Signal.NEEDS_REDRAW;
  this.invalidate(anychart.ConsistencyState.STOCK_SERIES_POINTS, signal);
};


/** @inheritDoc */
anychart.core.stock.scrollerSeries.Base.prototype.disposeInternal = function() {
  if (this.data_) {
    var data = this.data_;
    // we need this zeroing to let the chart check if the data source is still relevant
    this.data_ = null;
    this.scroller.getChart().deregisterSource(/** @type {!anychart.data.TableSelectable} */(data));
  }

  goog.base(this, 'disposeInternal');
};


//anychart.core.stock.scrollerSeries.Base.prototype['getType'] = anychart.core.stock.scrollerSeries.Base.prototype.getType;

//exports
anychart.core.stock.scrollerSeries.Base.prototype['data'] = anychart.core.stock.scrollerSeries.Base.prototype.data;
anychart.core.stock.scrollerSeries.Base.prototype['yScale'] = anychart.core.stock.scrollerSeries.Base.prototype.yScale;
anychart.core.stock.scrollerSeries.Base.prototype['getIndex'] = anychart.core.stock.scrollerSeries.Base.prototype.getIndex;
