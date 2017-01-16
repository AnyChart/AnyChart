goog.provide('anychart.core.heatMap.series.Base');
goog.require('acgraph');
goog.require('anychart.color');
goog.require('anychart.core.SeriesBase');
goog.require('anychart.core.ui.LabelsFactory');
goog.require('anychart.core.ui.MarkersFactory');
goog.require('anychart.core.utils.Padding');
goog.require('anychart.core.utils.SeriesPointContextProvider');
goog.require('anychart.core.utils.TypedLayer');
goog.require('anychart.data');
goog.require('anychart.enums');
goog.require('anychart.utils');



/**
 * Base class for all heat map series.<br/>
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Series data.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @constructor
 * @extends {anychart.core.SeriesBase}
 */
anychart.core.heatMap.series.Base = function(opt_data, opt_csvSettings) {
  anychart.core.heatMap.series.Base.base(this, 'constructor', opt_data, opt_csvSettings);

  this.referenceValueNames = ['x', 'y', 'heat'];
  this.referenceValueMeanings = ['x', 'y', 'n'];

  /**
   * @type {anychart.core.utils.SeriesPointContextProvider}
   * @private
   */
  this.pointProvider_;

  /**
   * Pool of freed paths that can be reused.
   * @type {Array.<acgraph.vector.Path>}
   * @private
   */
  this.pathsPool_ = null;

  this.labels().adjustFontSizeMode('same');
};
goog.inherits(anychart.core.heatMap.series.Base, anychart.core.SeriesBase);


/**
 * Link to incoming raw data.
 * Used to avoid data reapplication on same data sets.
 * NOTE: If is disposable entity, should be disposed from the source, not from this class.
 * @type {?(anychart.data.View|anychart.data.Set|Array|string)}
 * @private
 */
anychart.core.heatMap.series.Base.prototype.rawData_;


/**
 * @type {anychart.math.Rect}
 * @protected
 */
anychart.core.heatMap.series.Base.prototype.pixelBoundsCache = null;


/**
 * @type {anychart.core.ui.MarkersFactory}
 * @private
 */
anychart.core.heatMap.series.Base.prototype.markers_ = null;


/**
 * @type {anychart.core.ui.MarkersFactory}
 * @private
 */
anychart.core.heatMap.series.Base.prototype.hoverMarkers_ = null;


/**
 * @type {anychart.core.ui.MarkersFactory}
 * @private
 */
anychart.core.heatMap.series.Base.prototype.selectMarkers_ = null;


/**
 * Supported signals.
 * @type {number}
 */
anychart.core.heatMap.series.Base.prototype.SUPPORTED_SIGNALS =
    anychart.core.SeriesBase.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.DATA_CHANGED |
    anychart.Signal.NEEDS_RECALCULATION |
    anychart.Signal.NEED_UPDATE_LEGEND;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.heatMap.series.Base.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.SeriesBase.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.SERIES_HATCH_FILL |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.SERIES_LABELS |
    anychart.ConsistencyState.SERIES_DATA |
    anychart.ConsistencyState.SERIES_MARKERS;


/**
 * Series element z-index in series root layer.
 * @type {number}
 */
anychart.core.heatMap.series.Base.ZINDEX_SERIES = 1;


/**
 * Hatch fill z-index in series root layer.
 * @type {number}
 */
anychart.core.heatMap.series.Base.ZINDEX_HATCH_FILL = 2;


/**
 * Error path z-index in series root layer.
 * @type {number}
 */
anychart.core.heatMap.series.Base.ZINDEX_ERROR_PATH = 3;


/**
 * Series clip.
 * @type {boolean|anychart.math.Rect}
 * @private
 */
anychart.core.heatMap.series.Base.prototype.clip_ = false;


/**
 * @type {anychart.core.utils.TypedLayer}
 * @protected
 */
anychart.core.heatMap.series.Base.prototype.rootElement = null;


/**
 * Gets rootElement of the series.
 * @return {anychart.core.utils.TypedLayer}
 */
anychart.core.heatMap.series.Base.prototype.getRootElement = function() {
  return this.rootElement;
};


/**
 * @type {anychart.core.utils.TypedLayer}
 * @protected
 */
anychart.core.heatMap.series.Base.prototype.hatchFillRootElement = null;


/**
 * Discrete-pointed series are based on a typed layer, that constructs children by this initializer.
 * @return {!acgraph.vector.Element} Returns new instance of an element.
 * @protected
 */
anychart.core.heatMap.series.Base.prototype.rootTypedLayerInitializer = function() {
  return acgraph.rect();
};


/**
 * @type {anychart.core.utils.Padding}
 * @private
 */
anychart.core.heatMap.series.Base.prototype.axesLinesSpace_;


/**
 * @type {anychart.scales.Base}
 * @private
 */
anychart.core.heatMap.series.Base.prototype.yScale_ = null;


/**
 * @type {anychart.scales.Base}
 * @private
 */
anychart.core.heatMap.series.Base.prototype.xScale_ = null;


/**
 * Field names certain type of series needs from data set.
 * For example ['x', 'value']. Must be created in constructor. getReferenceCoords() doesn't work without this.
 * @type {!Array.<string>}
 */
anychart.core.heatMap.series.Base.prototype.referenceValueNames;


/**
 * Attributes names list from referenceValueNames. Must be the same length as referenceValueNames.
 * For example ['x', 'y']. Must be created in constructor. getReferenceCoords() doesn't work without this.
 * Possible values:
 *    'x' - transforms through xScale,
 *    'y' - transforms through yScale,
 *    'z' - gets as zero Y.
 * NOTE: if we need zeroY, you need to ask for it prior toall 'y' values.
 * @type {!Array.<string>}
 */
anychart.core.heatMap.series.Base.prototype.referenceValueMeanings;


/** @inheritDoc */
anychart.core.heatMap.series.Base.prototype.getType = function() {
  return anychart.enums.HeatMapSeriesType.HEAT_MAP;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Data
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.heatMap.series.Base.prototype.data = function(opt_value, opt_csvSettings) {
  if (goog.isDef(opt_value)) {
    if (this.rawData !== opt_value) {
      this.rawData = opt_value;
      goog.dispose(this.parentViewToDispose); // disposing a view created by the series if any;
      if (opt_value instanceof anychart.data.View)
        this.parentView = this.parentViewToDispose = opt_value.derive(); // deriving a view to avoid interference with other view users
      else if (opt_value instanceof anychart.data.Set)
        this.parentView = this.parentViewToDispose = opt_value.mapAs();
      else
        this.parentView = (this.parentViewToDispose = new anychart.data.Set(
            (goog.isArray(opt_value) || goog.isString(opt_value)) ? opt_value : null, opt_csvSettings)).mapAs();
      this.registerDisposable(this.parentViewToDispose);
      this.dataInternal = this.parentView.derive();
      this.dataInternal.listenSignals(this.onDataSignal_, this);
      // DATA is supported only in Bubble, so we invalidate only for it.
      this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.SERIES_DATA | anychart.ConsistencyState.A11Y,
          anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_LEGEND);
    }
    return this;
  }
  return this.dataInternal;
};


/**
 * Listens to data invalidation.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.core.heatMap.series.Base.prototype.onDataSignal_ = function(e) {
  if (e.hasSignal(anychart.Signal.DATA_CHANGED)) {
    this.dispatchSignal(anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.DATA_CHANGED);
  }
};


/**
 * DO NOT PUBLISH.
 */
anychart.core.heatMap.series.Base.prototype.resetCategorisation = function() {
  if (this.dataInternal != this.parentView)
    goog.dispose(this.dataInternal);
  this.dataInternal = /** @type {!anychart.data.View} */(this.parentView);
};


/**
 * DO NOT PUBLISH.
 * @param {!Array.<*>|boolean} categories If Array - ordinal scale, if false - scatter scale with numbers,
 *    true - datetime scale.
 */
anychart.core.heatMap.series.Base.prototype.categoriseData = function(categories) {
  this.dataInternal = this.parentView.prepare('x', categories);
};


/**
 * Gets an array of reference 'y' fields from the row iterator points to.
 * Reference fields are defined using referenceValueNames and referenceValueMeanings.
 * If there is only one field - a value is returned.
 * If there are several - array.
 * If any of the two is undefined - returns null.
 *
 * @return {?Array.<*>} Fetches significant scale values from current data row.
 */
anychart.core.heatMap.series.Base.prototype.getReferenceScaleValues = function() {
  if (!this.enabled()) return null;
  var res = [];
  var iterator = this.getIterator();
  var yScale = /** @type {anychart.scales.Base} */ (this.yScale());
  for (var i = 0, len = this.referenceValueNames.length; i < len; i++) {
    if (this.referenceValueMeanings[i] != 'n') continue;
    var val = iterator.get(this.referenceValueNames[i]);
    if (yScale.isMissing(val)) return null;
    res.push(val);
  }

  return res;
};


/**
 * Gets an array of reference 'y' fields from the row iterator point to
 * and gets pixel values. Reference fields are defined using referenceValueNames and referenceValueMeanings.
 * If there is only one field - a value is returned.
 * If there are several - array.
 * If any of the two is undefined - returns null.
 *
 * @return {?Array.<number>} Array with values or null, any of the two is undefined.
 *    (we do so to avoid reiterating to check on missing).
 * @protected
 */
anychart.core.heatMap.series.Base.prototype.getReferenceCoords = function() {
  if (!this.enabled()) return null;
  var res = [];
  var yScale = /** @type {anychart.scales.Base} */(this.yScale());
  var xScale = /** @type {anychart.scales.Base} */(this.xScale());
  var iterator = this.getIterator();
  var fail = false;
  for (var i = 0, len = this.referenceValueNames.length; i < len; i++) {
    var name = this.referenceValueNames[i];
    var val = iterator.get(name);
    if (!goog.isDef(val) && name != this.referenceValueNames[2]) {
      return null;
    }

    var pix, width, ratio0, ratio1;
    switch (this.referenceValueMeanings[i]) {
      case 'x':
        if (xScale.isMissing(val))
          pix = NaN;
        else {
          ratio0 = xScale.transform(val, 0);
          ratio1 = xScale.transform(val, 1);
          if (ratio0 < 0 && ratio1 < 0 || ratio0 > 1 && ratio1 > 1) {
            pix = NaN;
          } else {
            pix = this.applyRatioToBounds(xScale.transform(val, xScale.inverted() ? 1 : 0), true);
            width = Math.abs(pix - this.applyRatioToBounds(xScale.transform(val, xScale.inverted() ? 0 : 1), true));
          }
        }

        if (isNaN(pix)) fail = true;
        break;
      case 'y':
        if (yScale.isMissing(val))
          pix = NaN;
        else {
          ratio0 = yScale.transform(val, 0);
          ratio1 = yScale.transform(val, 1);
          if (ratio0 < 0 && ratio1 < 0 || ratio0 > 1 && ratio1 > 1) {
            pix = NaN;
          } else {
            pix = this.applyRatioToBounds(yScale.transform(val, yScale.inverted() ? 0 : 1), false);
            width = Math.abs(pix - this.applyRatioToBounds(yScale.transform(val, yScale.inverted() ? 1 : 0), false));
          }
        }

        if (isNaN(pix)) fail = true;
        break;
      case 'n':
        pix = /** @type {number} */(val);
        break;
    }

    res.push(pix, width);
  }
  return fail ? null : res;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Sufficient properties
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.heatMap.series.Base.prototype.isDiscreteBased = function() {
  return true;
};


/**
 * Tester if the series has markers() method.
 * @return {boolean}
 */
anychart.core.heatMap.series.Base.prototype.supportsMarkers = function() {
  return true;
};


/**
 * Axes lines space.
 * @param {(string|number|anychart.core.utils.Space)=} opt_spaceOrTopOrTopAndBottom Space object or top or top and bottom
 *    space.
 * @param {(string|number)=} opt_rightOrRightAndLeft Right or right and left space.
 * @param {(string|number)=} opt_bottom Bottom space.
 * @param {(string|number)=} opt_left Left space.
 * @return {!(anychart.core.VisualBase|anychart.core.utils.Padding)} .
 */
anychart.core.heatMap.series.Base.prototype.axesLinesSpace = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  if (!this.axesLinesSpace_) {
    this.axesLinesSpace_ = new anychart.core.utils.Padding();
    this.registerDisposable(this.axesLinesSpace_);
  }

  if (goog.isDef(opt_spaceOrTopOrTopAndBottom)) {
    this.axesLinesSpace_.setup.apply(this.axesLinesSpace_, arguments);
    return this;
  } else {
    return this.axesLinesSpace_;
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Initializes sereis draw.<br/>
 * If scale is not explicitly set - creates a default one.
 */
anychart.core.heatMap.series.Base.prototype.startDrawing = function() {
  this.pixelBoundsCache = this.getPixelBounds();

  if (!this.rootLayer) {
    this.rootLayer = acgraph.layer();
    this.bindHandlersToGraphics(this.rootLayer);
    this.registerDisposable(this.rootLayer);
  }

  this.checkDrawingNeeded();

  this.labels().suspendSignalsDispatching();
  this.hoverLabels().suspendSignalsDispatching();
  this.selectLabels().suspendSignalsDispatching();

  this.labels().clear();
  this.labels().container(/** @type {acgraph.vector.ILayer} */(this.container()));
  this.labels().parentBounds(/** @type {anychart.math.Rect} */(this.getPixelBounds()));

  if (this.isConsistent() || !this.enabled()) return;

  if (!this.rootElement) {
    this.rootElement = new anychart.core.utils.TypedLayer(
        this.rootTypedLayerInitializer,
        goog.nullFunction);
    this.rootElement.zIndex(anychart.core.heatMap.series.Base.ZINDEX_SERIES);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    /** @type {acgraph.vector.Element} */(this.rootLayer).zIndex(/** @type {number} */(this.zIndex()));
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    this.rootElement.clear();
    this.calculateGridPadding();
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_HATCH_FILL)) {
    var enabledHatchFill = this.hatchFill() || this.hoverHatchFill() || this.selectHatchFill();
    if (!this.hatchFillRootElement && enabledHatchFill) {
      this.hatchFillRootElement = new anychart.core.utils.TypedLayer(
          this.rootTypedLayerInitializer,
          goog.nullFunction);

      this.hatchFillRootElement.parent(/** @type {acgraph.vector.ILayer} */(this.rootLayer));
      this.hatchFillRootElement.zIndex(anychart.core.heatMap.series.Base.ZINDEX_HATCH_FILL);
      this.hatchFillRootElement.disablePointerEvents(true);
    }
    if (this.hatchFillRootElement)
      this.hatchFillRootElement.clear();
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    this.rootLayer.parent(/** @type {acgraph.vector.ILayer} */(this.container()));
    this.rootElement.parent(/** @type {acgraph.vector.ILayer} */(this.rootLayer));
    if (this.hatchFillRootElement)
      this.hatchFillRootElement.parent(/** @type {acgraph.vector.ILayer} */(this.rootLayer));
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  var markers = this.markers();
  var hoverMarkers = this.hoverMarkers();
  var selectMarkers = this.hoverMarkers();

  markers.suspendSignalsDispatching();
  hoverMarkers.suspendSignalsDispatching();
  selectMarkers.suspendSignalsDispatching();

  markers.clear();
  markers.container(/** @type {acgraph.vector.ILayer} */(this.container()));
  markers.parentBounds(this.getPixelBounds());

  this.drawA11y();
};


/**
 * Draws a pint iterator points to.<br/>
 * Closes polygon in a correct way if missing occured;
 * @param {anychart.PointState|number} pointState Point state.
 * @param {boolean=} opt_update This is update or draw.
 * @return {boolean} .
 */
anychart.core.heatMap.series.Base.prototype.drawPoint = function(pointState, opt_update) {
  var referenceValues = this.getReferenceCoords();
  var iterator = this.getIterator();

  if (this.enabled() && referenceValues) {
    if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
      var x = referenceValues[0];
      var xWidth = referenceValues[1];
      var y = referenceValues[2];
      var yWidth = referenceValues[3];
      var heat = referenceValues[4];

      var rect, width, height;
      if (opt_update) {
        rect = /** @type {!acgraph.vector.Rect} */(this.getIterator().meta('shape'));
      } else {
        rect = /** @type {!acgraph.vector.Rect} */(this.rootElement.genNextChild());
        iterator.meta('heat', heat).meta('shape', rect);
        this.makeInteractive(rect);
      }

      this.colorizeShape(pointState);

      var yRatio = this.yScale().transform(iterator.get('y'), 1);
      var xRatio = this.xScale().transform(iterator.get('x'), 1);


      var thickness = acgraph.vector.getThickness(/** @type {acgraph.vector.Stroke} */(rect.stroke()));
      var vPadding = this.verticalGridThickness % 2 / 2 + this.verticalGridThickness / 2;
      //if (xRatio == 1) vPadding -= this.verticalGridThickness % 2;
      var hPadding = -this.horizontalGridThickness % 2 / 2 + this.horizontalGridThickness / 2;
      if (yRatio == 1) hPadding += this.horizontalGridThickness % 2;

      x = Math.floor(x + vPadding) + thickness / 2;
      y = Math.floor(y + hPadding) + thickness / 2;


      width = xWidth - thickness - this.verticalGridThickness;
      if (xRatio == 1) width -= this.verticalGridThickness % 2;
      height = yWidth - thickness - this.horizontalGridThickness;
      if (yRatio == 1) height -= this.horizontalGridThickness % 2;

      iterator.meta('x', x).meta('y', y).meta('width', width).meta('height', height);

      rect
          .setX(x)
          .setY(y)
          .setWidth(width)
          .setHeight(height);
    }

    if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_HATCH_FILL)) {
      var hatchFillShape;
      if (opt_update) {
        hatchFillShape = iterator.meta('hatchFillShape');
      } else {
        hatchFillShape = this.hatchFillRootElement ?
            /** @type {!acgraph.vector.Rect} */(this.hatchFillRootElement.genNextChild()) :
            null;
        iterator.meta('hatchFillShape', hatchFillShape);
      }
      var shape = /** @type {acgraph.vector.Shape} */(iterator.meta('shape'));
      if (goog.isDef(shape) && hatchFillShape) {
        hatchFillShape.deserialize(shape.serialize());
      }
      this.applyHatchFill(pointState);
    }

    this.configureMarker(pointState, true);

    return true;
  }
  this.getIterator().meta('shape', null);
  this.getIterator().meta('hatchFillShape', null);
  return false;
};


/**
 * Creates and configures labels.
 * @param {anychart.PointState|number} pointState Point state.
 * @param {boolean=} opt_reset Whether reset labels settings.
 * @return {?anychart.core.ui.LabelsFactory.Label}
 */
anychart.core.heatMap.series.Base.prototype.configureLabel = function(pointState, opt_reset) {
  var iterator = this.getIterator();

  var selected = this.state.isStateContains(pointState, anychart.PointState.SELECT);
  var hovered = !selected && this.state.isStateContains(pointState, anychart.PointState.HOVER);

  var pointLabel = iterator.get('label');
  var hoverPointLabel = hovered ? iterator.get('hoverLabel') : null;
  var selectPointLabel = selected ? iterator.get('selectLabel') : null;

  var index = iterator.getIndex();
  var labelsFactory;
  if (selected) {
    labelsFactory = /** @type {anychart.core.ui.LabelsFactory} */(this.selectLabels());
  } else if (hovered) {
    labelsFactory = /** @type {anychart.core.ui.LabelsFactory} */(this.hoverLabels());
  } else {
    labelsFactory = /** @type {anychart.core.ui.LabelsFactory} */(this.labels());
  }

  var label = this.labels().getLabel(index);

  var labelEnabledState = pointLabel && goog.isDef(pointLabel['enabled']) ? pointLabel['enabled'] : null;
  var labelSelectEnabledState = selectPointLabel && goog.isDef(selectPointLabel['enabled']) ? selectPointLabel['enabled'] : null;
  var labelHoverEnabledState = hoverPointLabel && goog.isDef(hoverPointLabel['enabled']) ? hoverPointLabel['enabled'] : null;

  var isDraw = hovered || selected ?
      hovered ?
          goog.isNull(labelHoverEnabledState) ?
              goog.isNull(this.hoverLabels().enabled()) ?
                  goog.isNull(labelEnabledState) ?
                      this.labels().enabled() :
                      labelEnabledState :
                  this.hoverLabels().enabled() :
              labelHoverEnabledState :
          goog.isNull(labelSelectEnabledState) ?
              goog.isNull(this.selectLabels().enabled()) ?
                  goog.isNull(labelEnabledState) ?
                      this.labels().enabled() :
                      labelEnabledState :
                  this.selectLabels().enabled() :
              labelSelectEnabledState :
      goog.isNull(labelEnabledState) ?
          this.labels().enabled() :
          labelEnabledState;

  isDraw = isDraw && goog.isDef(iterator.get(this.referenceValueNames[2]));

  if (isDraw) {
    var position = this.getLabelsPosition(pointState);

    var positionProvider = this.createPositionProvider(/** @type {anychart.enums.Position|string} */(position));
    var formatProvider = this.createFormatProvider(true);
    if (label) {
      this.labels().dropCallsCache(index);
      label.formatProvider(formatProvider);
      label.positionProvider(positionProvider);
    } else {
      label = this.labels().add(formatProvider, positionProvider, index);
    }

    if (opt_reset) {
      label.resetSettings();
      label.currentLabelsFactory(labelsFactory);
      label.setSettings(/** @type {Object} */(pointLabel), /** @type {Object} */(hovered ? hoverPointLabel : selectPointLabel));
    }

    return label;
  } else if (label) {
    this.labels().clear(label.getIndex());
  }
  return null;
};


/**
 * Additional configures labels. It is necessary for global (for all data labels) adjust font size settings and applying
 * label display mode (drop|crop|alwaysShow).
 */
anychart.core.heatMap.series.Base.prototype.drawLabels = function() {
  var iterator = this.getIterator().reset();

  while (iterator.advance()) {
    var shape = iterator.meta('shape');

    if (shape) {
      var index = iterator.getIndex();
      var pointState = this.state.getPointStateByIndex(index);

      var label = this.configureLabel(pointState, true);
      if (label) {
        var mergedSettings = label.getMergedSettings();
        var padding = mergedSettings['padding'];

        var thickness = acgraph.vector.getThickness(/** @type {acgraph.vector.Stroke} */(shape.stroke())) / 2;
        var cellBounds = anychart.math.rect(
            /** @type {number} */(iterator.meta('x')) + thickness,
            /** @type {number} */(iterator.meta('y')) + thickness,
            /** @type {number} */(iterator.meta('width')) - thickness * 2,
            /** @type {number} */(iterator.meta('height')) - thickness * 2);

        mergedSettings['width'] = null;
        mergedSettings['height'] = null;
        if (mergedSettings['adjustByWidth'] || mergedSettings['adjustByHeight'])
          mergedSettings['fontSize'] = label.parentLabelsFactory().adjustFontSizeValue;

        var bounds = this.labels().measure(label.formatProvider(), label.positionProvider(), mergedSettings);

        var notOutOfCellBounds = cellBounds.left <= bounds.left &&
            cellBounds.getRight() >= bounds.getRight() &&
            cellBounds.top <= bounds.top &&
            cellBounds.getBottom() >= bounds.getBottom();

        var chart = this.getChart();
        if (!notOutOfCellBounds) {
          if (chart.labelsDisplayMode() == anychart.enums.LabelsDisplayMode.DROP) {
            this.labels().clear(index);
          } else {
            if (label.width() != bounds.width || label.height() != bounds.height) {
              label.dropMergedSettings();
              label.width(bounds.width).height(bounds.height);
            }
          }
        } else {
          label.width(cellBounds.width).height(cellBounds.height);
        }

        if (chart.labelsDisplayMode() != anychart.enums.LabelsDisplayMode.ALWAYS_SHOW) {
          label.clip(cellBounds);
        } else {
          label.clip(null);
        }
      }
    }
  }
};


/** @inheritDoc */
anychart.core.heatMap.series.Base.prototype.drawLabel = function(pointState) {
  var iterator = this.getIterator();
  var shape = iterator.meta('shape');
  if (shape) {
    var label = this.configureLabel(pointState, true);

    if (label) {
      var mergedSettings = label.getMergedSettings();

      var thickness = acgraph.vector.getThickness(/** @type {acgraph.vector.Stroke} */(shape.stroke())) / 2;
      var cellBounds = anychart.math.rect(
          /** @type {number} */(iterator.meta('x')) + thickness,
          /** @type {number} */(iterator.meta('y')) + thickness,
          /** @type {number} */(iterator.meta('width')) - thickness * 2,
          /** @type {number} */(iterator.meta('height')) - thickness * 2);
      label.width(cellBounds.width).height(cellBounds.height);

      var padding = mergedSettings['padding'];

      mergedSettings['width'] = null;
      mergedSettings['height'] = null;
      if (mergedSettings['adjustByWidth'] || mergedSettings['adjustByHeight'])
        mergedSettings['fontSize'] = label.parentLabelsFactory().adjustFontSizeValue;

      var bounds = this.labels().measure(label.formatProvider(), label.positionProvider(), mergedSettings);

      var notOutOfCellBounds = cellBounds.left <= bounds.left &&
          cellBounds.getRight() >= bounds.getRight() &&
          cellBounds.top <= bounds.top &&
          cellBounds.getBottom() >= bounds.getBottom();

      var chart = this.getChart();
      if (chart.labelsDisplayMode() != anychart.enums.LabelsDisplayMode.ALWAYS_SHOW) {
        label.clip(cellBounds);
      } else {
        label.clip(null);
      }

      if (!notOutOfCellBounds) {
        if (chart.labelsDisplayMode() == anychart.enums.LabelsDisplayMode.DROP) {
          this.labels().clear(label.getIndex());
        } else {
          if (label.width() != bounds.width || label.height() != bounds.height) {
            label.dropMergedSettings();
            label.width(bounds.width).height(bounds.height);
          }
        }
      }
    }
  }
};


/**
 * Finishes series draw.
 * @example <t>listingOnly</t>
 * series.startDrawing();
 * while(series.getIterator().advance())
 *   series.drawPoint();
 * series.finalizeDrawing();
 */
anychart.core.heatMap.series.Base.prototype.finalizeDrawing = function() {
  this.markers().draw();

  this.markers().resumeSignalsDispatching(false);
  this.hoverMarkers().resumeSignalsDispatching(false);
  this.selectMarkers().resumeSignalsDispatching(false);

  this.markers().markConsistent(anychart.ConsistencyState.ALL);
  this.hoverMarkers().markConsistent(anychart.ConsistencyState.ALL);
  this.selectMarkers().markConsistent(anychart.ConsistencyState.ALL);



  this.labels().draw();

  this.labels().resumeSignalsDispatching(false);
  this.hoverLabels().resumeSignalsDispatching(false);
  this.selectLabels().resumeSignalsDispatching(false);

  this.labels().markConsistent(anychart.ConsistencyState.ALL);
  this.hoverLabels().markConsistent(anychart.ConsistencyState.ALL);
  this.selectLabels().markConsistent(anychart.ConsistencyState.ALL);

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.doClip();
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  // This check need to prevent finalizeDrawing to mark CONTAINER consistency state in case when series was disabled by
  // series.enabled(false).
  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    this.markConsistent(anychart.ConsistencyState.ALL & !anychart.ConsistencyState.CONTAINER);
  } else {
    this.markConsistent(anychart.ConsistencyState.ALL);
  }
};


/** @inheritDoc */
anychart.core.heatMap.series.Base.prototype.remove = function() {
  if (this.rootLayer)
    this.rootLayer.remove();

  this.labels().container(null);
  this.markers().container(null);

  anychart.core.heatMap.series.Base.base(this, 'remove');
};


/**
 * Calculates grid padding for heat map cells.
 */
anychart.core.heatMap.series.Base.prototype.calculateGridPadding = function() {
  var grids = this.getChart().getGrids();
  var maxVerticalThickness = 0;
  var maxHorizontalThickness = 0;
  for (var i = 0, len = grids.length; i < len; i++) {
    var grid = grids[i];
    if (!grid) continue;

    var thickness = acgraph.vector.getThickness(/** @type {acgraph.vector.Stroke} */(grid.stroke()));

    if (grid.isHorizontal()) {
      if (thickness > maxHorizontalThickness) {
        maxHorizontalThickness = thickness;
      }
    } else {
      if (thickness > maxVerticalThickness) {
        maxVerticalThickness = thickness;
      }
    }
  }

  this.verticalGridThickness = maxVerticalThickness;
  this.horizontalGridThickness = maxHorizontalThickness;
};


/**
 * Apply axes lines space.
 * @param {number} value Value.
 * @return {number} .
 * @protected
 */
anychart.core.heatMap.series.Base.prototype.applyAxesLinesSpace = function(value) {
  var bounds = this.pixelBoundsCache;
  var max = bounds.getBottom() - +this.axesLinesSpace().bottom();
  var min = bounds.getTop() + +this.axesLinesSpace().top();

  return goog.math.clamp(value, min, max);
};


/**
 * Create base series format provider.
 * @param {boolean=} opt_force create context provider forcibly.
 * @return {Object} Object with info for labels formatting.
 */
anychart.core.heatMap.series.Base.prototype.createFormatProvider = function(opt_force) {
  if (!this.pointProvider_ || opt_force)
    this.pointProvider_ = new anychart.core.utils.SeriesPointContextProvider(this, this.referenceValueNames, false);
  this.pointProvider_.applyReferenceValues();

  var colorScale = this.getChart().colorScale();

  if (colorScale) {
    var iterator = this.getIterator();
    var value = iterator.get('heat');

    if (colorScale instanceof anychart.scales.OrdinalColor) {
      this.pointProvider_['color'] = colorScale.valueToColor(/** @type {number} */(value));
      var range = colorScale.getRangeByValue(/** @type {number} */(value));
      if (range) {
        this.pointProvider_['colorRange'] = {
          'color': range.color,
          'end': range.end,
          'name': range.name,
          'start': range.start,
          'index': range.sourceIndex
        };
      }
    }
  }

  return this.pointProvider_;
};


/**
 * Create series position provider.
 * @param {string} position Understands anychart.enums.Position and some additional values.
 * @return {Object} Object with info for labels formatting.
 * @protected
 */
anychart.core.heatMap.series.Base.prototype.createPositionProvider = function(position) {
  var iterator = this.getIterator();
  var shape = iterator.meta('shape');
  if (shape) {
    var shapeBounds = shape.getBounds();
    position = anychart.enums.normalizeAnchor(position);
    return {'value': anychart.utils.getCoordinateByAnchor(shapeBounds, position)};
  } else {
    return {'value': {'x': iterator.meta('x'), 'y': iterator.meta('y')}};
  }
};


/**
 * Applies passed ratio (usually transformed by a scale) to bounds where
 * series is drawn.
 * @param {number} ratio .
 * @param {boolean} horizontal .
 * @return {number} .
 */
anychart.core.heatMap.series.Base.prototype.applyRatioToBounds = function(ratio, horizontal) {
  var min, range;
  if (horizontal) {
    min = this.pixelBoundsCache.left;
    range = this.pixelBoundsCache.width;
  } else {
    min = this.pixelBoundsCache.getBottom();
    range = -this.pixelBoundsCache.height;
  }
  return Math.round(min + ratio * range);
};


/**
 * Colorizes shape in accordance to current point colorization settings.
 * Shape is get from current meta 'shape'.
 * @param {anychart.PointState|number} pointState Point state.
 * @protected
 */
anychart.core.heatMap.series.Base.prototype.colorizeShape = function(pointState) {
  var shape = /** @type {acgraph.vector.Shape} */(this.getIterator().meta('shape'));
  if (goog.isDef(shape)) {
    shape.stroke(this.getFinalStroke(true, pointState));
    shape.fill(this.getFinalFill(true, pointState));
  }
};


/**
 * Apply hatch fill to shape in accordance to current point colorization settings.
 * Shape is get from current meta 'hatchFillShape'.
 * @param {anychart.PointState|number} pointState If the point is hovered.
 * @protected
 */
anychart.core.heatMap.series.Base.prototype.applyHatchFill = function(pointState) {
  var hatchFillShape = /** @type {acgraph.vector.Shape} */(this.getIterator().meta('hatchFillShape'));
  if (goog.isDefAndNotNull(hatchFillShape)) {
    hatchFillShape
        .stroke(null)
        .fill(this.getFinalHatchFill(true, pointState));
  }
};


/** @inheritDoc */
anychart.core.heatMap.series.Base.prototype.applyAppearanceToPoint = function(pointState) {
  var shape = this.getIterator().meta('shape');
  if (shape) {
    var strokeThicknessForState = acgraph.vector.getThickness(this.getFinalStroke(true, pointState));
    var currentThickness = acgraph.vector.getThickness(shape.stroke());
    if (strokeThicknessForState != currentThickness) {
      this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.SERIES_HATCH_FILL);
      this.drawPoint(pointState, true);
      this.markConsistent(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.SERIES_HATCH_FILL);
    } else {
      this.colorizeShape(pointState);
      this.applyHatchFill(pointState);
    }
    this.drawLabel(pointState);
    this.drawMarker(pointState);
  }
};


/** @inheritDoc */
anychart.core.heatMap.series.Base.prototype.finalizePointAppearance = function() {
  this.labels().draw();
  this.markers().draw();
};


/** @inheritDoc */
anychart.core.heatMap.series.Base.prototype.applyAppearanceToSeries = function(pointState) {
  this.colorizeShape(pointState);
  this.applyHatchFill(pointState);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Clip.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Makes proper clipping. Considered internal.
 */
anychart.core.heatMap.series.Base.prototype.doClip = function() {
  var clip, bounds, axesLinesSpace;
  clip = /** @type {!anychart.math.Rect|boolean} */ (this.clip());
  if (goog.isBoolean(clip)) {
    bounds = this.pixelBoundsCache;
    axesLinesSpace = this.axesLinesSpace();
    clip = axesLinesSpace.tightenBounds(/** @type {!anychart.math.Rect} */(bounds));
  }

  this.rootLayer.clip(/** @type {anychart.math.Rect} */ (clip || null));
  var labelDOM = this.labels().getDomElement();
  if (labelDOM) labelDOM.clip(/** @type {anychart.math.Rect} */(clip || null));
  var markerDOM = this.markers().getDomElement();
  if (markerDOM) markerDOM.clip(/** @type {anychart.math.Rect} */(clip || null));
};


/**
 * Getter/setter for series clip settings.
 * @param {(boolean|anychart.math.Rect)=} opt_value [False, if series is created manually.<br/>True, if created via chart] Enable/disable series clip.
 * @return {anychart.core.heatMap.series.Base|boolean|anychart.math.Rect} .
 */
anychart.core.heatMap.series.Base.prototype.clip = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (goog.isNull(opt_value)) opt_value = false;
    if (this.clip_ != opt_value) {
      this.clip_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.clip_;
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Scales.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for current series X scale.
 * @param {anychart.scales.Base=} opt_value Value to set.
 * @return {(anychart.scales.Base|!anychart.core.heatMap.series.Base)} Series X Scale or itself for chaining call.
 */
anychart.core.heatMap.series.Base.prototype.xScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.xScale_ != opt_value) {
      if (this.xScale_)
        this.xScale_.unlistenSignals(this.scaleInvalidated_, this);
      this.xScale_ = opt_value;
      this.xScale_.listenSignals(this.scaleInvalidated_, this);
      this.invalidate(anychart.ConsistencyState.APPEARANCE,
          anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.xScale_;
  }
};


/**
 * Getter/setter for current series Y scale.
 * @param {anychart.scales.Base=} opt_value Value to set.
 * @return {(anychart.scales.Base|!anychart.core.heatMap.series.Base)} Series Y Scale or itself for chaining call.
 */
anychart.core.heatMap.series.Base.prototype.yScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.yScale_ != opt_value) {
      if (this.yScale_)
        this.yScale_.unlistenSignals(this.scaleInvalidated_, this);
      this.yScale_ = opt_value;
      this.yScale_.listenSignals(this.scaleInvalidated_, this);
      this.invalidate(anychart.ConsistencyState.APPEARANCE,
          anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.yScale_;
  }
};


/**
 * Scales invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.heatMap.series.Base.prototype.scaleInvalidated_ = function(event) {
  var signal = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION))
    signal |= anychart.Signal.NEEDS_RECALCULATION;
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION))
    signal |= anychart.Signal.NEEDS_REDRAW;
  else
    this.dispatchSignal(signal);
  this.invalidate(anychart.ConsistencyState.APPEARANCE, signal);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Coloring.
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.heatMap.series.Base.prototype.normalizeColor = function(color, var_args) {
  var fill;
  if (goog.isFunction(color)) {
    var sourceColor = arguments.length > 1 ?
        this.normalizeColor.apply(this, goog.array.slice(arguments, 1)) :
        this.color();
    var scope = {
      'index': this.getIterator().getIndex(),
      'sourceColor': sourceColor,
      'iterator': this.getIterator(),
      'colorScale': this.getChart().colorScale()
    };
    fill = color.call(scope);
  } else
    fill = color;
  return fill;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Statistics
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.heatMap.series.Base.prototype.calculateStatistics = function() {
  var max = -Infinity;
  var min = Infinity;
  var sum = 0;
  var pointsCount = 0;

  var iterator = this.getResetIterator();

  while (iterator.advance()) {
    var values = this.getReferenceScaleValues();
    if (values) {
      var y = anychart.utils.toNumber(values[0]);
      if (!isNaN(y)) {
        max = Math.max(max, y);
        min = Math.min(min, y);
        sum += y;
      }
    }
    pointsCount++;
  }
  var average = sum / pointsCount;

  this.statistics(anychart.enums.Statistics.MAX, max);
  this.statistics(anychart.enums.Statistics.SERIES_MAX, max);
  this.statistics(anychart.enums.Statistics.SERIES_Y_MAX, max);
  this.statistics(anychart.enums.Statistics.MIN, min);
  this.statistics(anychart.enums.Statistics.SERIES_MIN, min);
  this.statistics(anychart.enums.Statistics.SERIES_Y_MIN, min);
  this.statistics(anychart.enums.Statistics.SUM, sum);
  this.statistics(anychart.enums.Statistics.AVERAGE, average);
  this.statistics(anychart.enums.Statistics.POINTS_COUNT, pointsCount);
  this.statistics(anychart.enums.Statistics.SERIES_POINTS_COUNT, pointsCount);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Series default settings.
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.heatMap.series.Base.prototype.getEnableChangeSignals = function() {
  return anychart.core.heatMap.series.Base.base(this, 'getEnableChangeSignals') | anychart.Signal.DATA_CHANGED | anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.NEED_UPDATE_LEGEND;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Markers.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for series data markers.
 * @param {(Object|boolean|null|string)=} opt_value Series data markers settings.
 * @return {!(anychart.core.ui.MarkersFactory|anychart.core.heatMap.series.Base)} Markers instance or itself for chaining call.
 */
anychart.core.heatMap.series.Base.prototype.markers = function(opt_value) {
  if (!this.markers_) {
    this.markers_ = new anychart.core.ui.MarkersFactory();
    this.markers_.setParentEventTarget(this);
    this.registerDisposable(this.markers_);
    this.markers_.listenSignals(this.markersInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.markers_.setup(opt_value);
    return this;
  }
  return this.markers_;
};


/**
 * Getter/setter for series data markers on hover.
 * @param {(Object|boolean|null|string)=} opt_value Series data markers settings.
 * @return {!(anychart.core.ui.MarkersFactory|anychart.core.heatMap.series.Base)} Markers instance or itself for chaining call.
 */
anychart.core.heatMap.series.Base.prototype.hoverMarkers = function(opt_value) {
  if (!this.hoverMarkers_) {
    this.hoverMarkers_ = new anychart.core.ui.MarkersFactory();
    this.registerDisposable(this.hoverMarkers_);
    // don't listen to it, for it will be reapplied at the next hover
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.hoverMarkers_.setup(opt_value);
    return this;
  }
  return this.hoverMarkers_;
};


/**
 * @param {(Object|boolean|null|string)=} opt_value Series data markers settings.
 * @return {!(anychart.core.ui.MarkersFactory|anychart.core.heatMap.series.Base)} Markers instance or itself for chaining call.
 */
anychart.core.heatMap.series.Base.prototype.selectMarkers = function(opt_value) {
  if (!this.selectMarkers_) {
    this.selectMarkers_ = new anychart.core.ui.MarkersFactory();
    this.registerDisposable(this.selectMarkers_);
    // don't listen to it, for it will be reapplied at the next hover
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.selectMarkers_.setup(opt_value);
    return this;
  }
  return this.selectMarkers_;
};


/** @inheritDoc */
anychart.core.heatMap.series.Base.prototype.setAutoMarkerType = function(opt_value) {
  this.markers().setAutoType(opt_value);
};


/**
 * Listener for markers invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.core.heatMap.series.Base.prototype.markersInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.invalidate(anychart.ConsistencyState.SERIES_MARKERS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_LEGEND);
  }
};


/**
 * Gets marker position.
 * @param {anychart.PointState|number} pointState If it is a hovered oe selected marker drawing.
 * @return {string} Position settings.
 */
anychart.core.heatMap.series.Base.prototype.getMarkersPosition = function(pointState) {
  var iterator = this.getIterator();

  var selected = this.state.isStateContains(pointState, anychart.PointState.SELECT);
  var hovered = !selected && this.state.isStateContains(pointState, anychart.PointState.HOVER);

  var pointMarker = iterator.get('marker');
  var hoverPointMarker = iterator.get('hoverMarker');
  var selectPointMarker = iterator.get('selectMarker');

  var markerPosition = pointMarker && pointMarker['position'] ? pointMarker['position'] : null;
  var markerHoverPosition = hoverPointMarker && hoverPointMarker['position'] ? hoverPointMarker['position'] : null;
  var markerSelectPosition = selectPointMarker && selectPointMarker['position'] ? selectPointMarker['position'] : null;

  return (hovered && (markerHoverPosition || this.hoverMarkers().position())) ||
      (selected && (markerSelectPosition || this.selectMarkers().position())) ||
      markerPosition || this.markers().position();
};


/**
 * Draws marker for the point.
 * @param {anychart.PointState|number} pointState Point state.
 * @protected
 */
anychart.core.heatMap.series.Base.prototype.drawMarker = function(pointState) {
  this.configureMarker(pointState, true);
};


/**
 * Creates and configures marker.
 * @param {anychart.PointState|number} pointState Point state.
 * @param {boolean=} opt_reset Whether reset marker settings.
 * @return {?anychart.core.ui.MarkersFactory.Marker}
 */
anychart.core.heatMap.series.Base.prototype.configureMarker = function(pointState, opt_reset) {
  var iterator = this.getIterator();

  var selected = this.state.isStateContains(pointState, anychart.PointState.SELECT);
  var hovered = !selected && this.state.isStateContains(pointState, anychart.PointState.HOVER);

  var pointMarker = iterator.get('marker');
  var hoverPointMarker = iterator.get('hoverMarker');
  var selectPointMarker = iterator.get('selectMarker');

  var index = iterator.getIndex();
  var markersFactory;
  if (selected) {
    markersFactory = /** @type {anychart.core.ui.MarkersFactory} */(this.selectMarkers());
  } else if (hovered) {
    markersFactory = /** @type {anychart.core.ui.MarkersFactory} */(this.hoverMarkers());
  } else {
    markersFactory = /** @type {anychart.core.ui.MarkersFactory} */(this.markers());
  }

  var marker = this.markers().getMarker(index);

  var markerEnabledState = pointMarker && goog.isDef(pointMarker['enabled']) ? pointMarker['enabled'] : null;
  var markerHoverEnabledState = hoverPointMarker && goog.isDef(hoverPointMarker['enabled']) ? hoverPointMarker['enabled'] : null;
  var markerSelectEnabledState = selectPointMarker && goog.isDef(selectPointMarker['enabled']) ? selectPointMarker['enabled'] : null;

  var isDraw = hovered || selected ?
      hovered ?
          goog.isNull(markerHoverEnabledState) ?
              this.hoverMarkers_ && goog.isNull(this.hoverMarkers_.enabled()) ?
                  goog.isNull(markerEnabledState) ?
                      this.markers_.enabled() :
                      markerEnabledState :
                  this.hoverMarkers_.enabled() :
              markerHoverEnabledState :
          goog.isNull(markerSelectEnabledState) ?
              this.selectMarkers_ && goog.isNull(this.selectMarkers_.enabled()) ?
                  goog.isNull(markerEnabledState) ?
                      this.markers_.enabled() :
                      markerEnabledState :
                  this.selectMarkers_.enabled() :
              markerSelectEnabledState :
      goog.isNull(markerEnabledState) ?
          this.markers_.enabled() :
          markerEnabledState;

  if (isDraw) {
    var position = this.getMarkersPosition(pointState);

    var positionProvider = this.createPositionProvider(/** @type {anychart.enums.Position|string} */(position));
    if (marker) {
      marker.positionProvider(positionProvider);
    } else {
      marker = this.markers().add(positionProvider, index);
    }

    if (opt_reset) {
      marker.resetSettings();
      marker.currentMarkersFactory(markersFactory);
      marker.setSettings(/** @type {Object} */(pointMarker), /** @type {Object} */(hovered ? hoverPointMarker : selectPointMarker));
    }

    return marker;
  } else if (marker) {
    this.markers().clear(marker.getIndex());
  }
  return null;
};


/**
 * Return marker color for series.
 * @return {!acgraph.vector.Fill} Marker color for series.
 */
anychart.core.heatMap.series.Base.prototype.getMarkerFill = function() {
  if (anychart.DEFAULT_THEME != 'v6')
    return anychart.color.setOpacity(this.getFinalFill(false, anychart.PointState.NORMAL), 1, false);
  else
    return this.getFinalFill(false, anychart.PointState.NORMAL);
};


/**
 * Return marker color for series.
 * @return {(string|acgraph.vector.Fill|acgraph.vector.Stroke)} Marker color for series.
 */
anychart.core.heatMap.series.Base.prototype.getMarkerStroke = function() {
  return anychart.color.darken(this.markers().fill());
};


/**
 * @inheritDoc
 */
anychart.core.heatMap.series.Base.prototype.getLegendItemData = function(itemsTextFormatter) {
  var data = anychart.core.heatMap.series.Base.base(this, 'getLegendItemData', itemsTextFormatter);
  var markers = this.markers();
  markers.setAutoFill(this.getMarkerFill());
  markers.setAutoStroke(/** @type {acgraph.vector.Stroke} */(this.getMarkerStroke()));
  if (markers.enabled()) {
    data['iconMarkerType'] = data['iconMarkerType'] || markers.type();
    data['iconMarkerFill'] = data['iconMarkerFill'] || markers.fill();
    data['iconMarkerStroke'] = data['iconMarkerStroke'] || markers.stroke();
  } else {
    data['iconMarkerType'] = null;
    data['iconMarkerFill'] = null;
    data['iconMarkerStroke'] = null;
  }
  return data;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Serialize
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @inheritDoc
 */
anychart.core.heatMap.series.Base.prototype.serialize = function() {
  var json = anychart.core.heatMap.series.Base.base(this, 'serialize');
  json['clip'] = (this.clip_ instanceof anychart.math.Rect) ? this.clip_.serialize() : this.clip_;
  json['markers'] = this.markers().serialize();
  json['hoverMarkers'] = this.hoverMarkers().serialize();
  json['selectMarkers'] = this.selectMarkers().serialize();
  return json;
};


/**
 * @inheritDoc
 */
anychart.core.heatMap.series.Base.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.heatMap.series.Base.base(this, 'setupByJSON', config, opt_default);
  this.clip(config['clip']);
  this.markers().setup(config['markers']);
  this.hoverMarkers().setup(config['hoverMarkers']);
  this.selectMarkers().setup(config['selectMarkers']);
};

