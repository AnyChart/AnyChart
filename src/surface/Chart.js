//region --- Requiring and Providing
goog.provide('anychart.surfaceModule.Chart');
goog.require('anychart.colorScalesModule.ui.ColorRange');
goog.require('anychart.core.SeparateChart');
goog.require('anychart.core.reporting');
goog.require('anychart.data.Set');
goog.require('anychart.surfaceModule.Axis');
goog.require('anychart.surfaceModule.Grid');
goog.require('anychart.surfaceModule.math');
//endregion



//region --- Constructor
/**
 * Surface chart class.
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Data for surface chart.
 * @param {(anychart.enums.TextParsingMode|anychart.data.TextParsingSettings)=} opt_csvSettings
 * @extends {anychart.core.SeparateChart}
 * @constructor
 */
anychart.surfaceModule.Chart = function(opt_data, opt_csvSettings) {
  anychart.surfaceModule.Chart.base(this, 'constructor');
  this.addThemes('surface');

  this.referenceValueNames = ['z', 'value'];

  /**
   * Unique x values from data.
   * @type {Array}
   * @private
   */
  this.valuesX_ = [];

  /**
   * Unique y values from data.
   * @type {Array}
   * @private
   */
  this.valuesY_ = [];

  /**
   * Unique z values from data.
   * @type {Array}
   * @private
   */
  this.valuesZ_ = [];

  /**
   * Array for surface paths.
   * @type {Array.<acgraph.vector.Path>}
   * @private
   */
  this.paths_ = [];

  /**
   * Array for box paths.
   * @type {Array.<acgraph.vector.Path>}
   * @private
   */
  this.boxPaths_ = [];

  this.data(opt_data || null, opt_csvSettings);

  var rotationBeforeInvalidationHook = function() {
    var rotationZ = this.getOption('rotationZ');
    var rotationY = this.getOption('rotationY');

    var xGrid = this.getCreated('xGrid');
    var yGrid = this.getCreated('yGrid');
    var zGrid = this.getCreated('zGrid');

    var xAxis = this.getCreated('xAxis');
    var yAxis = this.getCreated('yAxis');
    var zAxis = this.getCreated('zAxis');

    anychart.core.Base.suspendSignalsDispatching(xAxis, yAxis, zAxis, xGrid, yGrid, zGrid);

    if (xGrid) xGrid.rotationZ(rotationZ).rotationY(rotationY);
    if (yGrid) yGrid.rotationZ(rotationZ).rotationY(rotationY);
    if (zGrid) zGrid.rotationZ(rotationZ).rotationY(rotationY);

    if (zAxis) zAxis.rotationZ(rotationZ).rotationY(rotationY);
    if (xAxis) xAxis.rotationZ(rotationZ).rotationY(rotationY);
    if (yAxis) yAxis.rotationZ(rotationZ).rotationY(rotationY);

    anychart.core.Base.resumeSignalsDispatchingFalse(xAxis, yAxis, zAxis, xGrid, yGrid, zGrid);
  };

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['rotationZ', anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.AXES_CHART_GRIDS |
          anychart.ConsistencyState.AXES_CHART_AXES, anychart.Signal.NEEDS_REDRAW, null, rotationBeforeInvalidationHook],
    ['rotationY', anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.AXES_CHART_GRIDS |
          anychart.ConsistencyState.AXES_CHART_AXES, anychart.Signal.NEEDS_REDRAW, null, rotationBeforeInvalidationHook],
    ['box', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['stroke', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW]
  ]);
};
goog.inherits(anychart.surfaceModule.Chart, anychart.core.SeparateChart);
//endregion
//region --- Descriptors, signals, consistency states


/**
 * @type {!Object<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.surfaceModule.Chart.OWN_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  var rotationYNormalizer = function(val) {
    val = anychart.core.settings.numberNormalizer(val);
    return goog.math.clamp(val, -90, 90);
  };

  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'rotationZ', anychart.core.settings.numberNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'rotationY', rotationYNormalizer],
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'box', anychart.core.settings.strokeNormalizer],
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'stroke', anychart.core.settings.strokeNormalizer]

  ]);

  return map;
})();
anychart.core.settings.populate(anychart.surfaceModule.Chart, anychart.surfaceModule.Chart.OWN_DESCRIPTORS);


/**
 * @type {number}
 */
anychart.surfaceModule.Chart.prototype.SUPPORTED_SIGNALS = anychart.core.SeparateChart.prototype.SUPPORTED_SIGNALS;


/**
 * @type {number}
 */
anychart.surfaceModule.Chart.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.SeparateChart.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.SURFACE_DATA |
    anychart.ConsistencyState.SCALE_CHART_SCALES |
    anychart.ConsistencyState.AXES_CHART_AXES |
    anychart.ConsistencyState.CHART_LEGEND |
    anychart.ConsistencyState.SURFACE_COLOR_RANGE |
    anychart.ConsistencyState.AXES_CHART_GRIDS |
    anychart.ConsistencyState.SURFACE_COLOR_SCALE;


/**
 * Root layer for content z index
 * @type {number}
 */
anychart.surfaceModule.Chart.Z_INDEX_ROOT_LAYER = 36;
//endregion
//region --- Axes


/**
 *
 * @param {(Object|boolean|null)=} opt_value Axis settings
 * @return {(anychart.surfaceModule.Axis|anychart.surfaceModule.Chart)}
 */
anychart.surfaceModule.Chart.prototype.zAxis = function(opt_value) {
  if (!this.zAxis_) {
    this.zAxis_ = new anychart.surfaceModule.Axis();
    this.zAxis_.listenSignals(this.onAxisSignal_, this);
    this.zAxis_.rotationZ(/** @type {number} */(this.getOption('rotationZ')));
    this.zAxis_.rotationY(/** @type {number} */(this.getOption('rotationY')));
    this.setupCreated('zAxis', this.zAxis_);
  }
  if (goog.isDef(opt_value)) {
    this.zAxis_.setup(opt_value);
    return this;
  }
  return this.zAxis_;
};


/**
 *
 * @param {(Object|boolean|null)=} opt_value Axis settings
 * @return {(anychart.surfaceModule.Axis|anychart.surfaceModule.Chart)}
 */
anychart.surfaceModule.Chart.prototype.xAxis = function(opt_value) {
  if (!this.xAxis_) {
    this.xAxis_ = new anychart.surfaceModule.Axis();
    this.xAxis_.listenSignals(this.onAxisSignal_, this);
    this.xAxis_.rotationZ(/** @type {number} */(this.getOption('rotationZ')));
    this.xAxis_.rotationY(/** @type {number} */(this.getOption('rotationY')));
    this.setupCreated('xAxis', this.xAxis_);
  }
  if (goog.isDef(opt_value)) {
    this.xAxis_.setup(opt_value);
    return this;
  }
  return this.xAxis_;
};


/**
 *
 * @param {(Object|boolean|null)=} opt_value Axis settings
 * @return {(anychart.surfaceModule.Axis|anychart.surfaceModule.Chart)}
 */
anychart.surfaceModule.Chart.prototype.yAxis = function(opt_value) {
  if (!this.yAxis_) {
    this.yAxis_ = new anychart.surfaceModule.Axis();
    this.yAxis_.listenSignals(this.onAxisSignal_, this);
    this.yAxis_.rotationZ(/** @type {number} */(this.getOption('rotationZ')));
    this.yAxis_.rotationY(/** @type {number} */(this.getOption('rotationY')));
    this.setupCreated('yAxis', this.yAxis_);
  }
  if (goog.isDef(opt_value)) {
    this.yAxis_.setup(opt_value);
    return this;
  }
  return this.yAxis_;
};


/**
 * Axis listener.
 * @param {anychart.SignalEvent} event
 * @private
 */
anychart.surfaceModule.Chart.prototype.onAxisSignal_ = function(event) {
  this.invalidate(anychart.ConsistencyState.AXES_CHART_AXES, anychart.Signal.NEEDS_REDRAW);
};
//endregion
//region --- Data


/**
 * Returns detached data iterator.
 * @return {!anychart.data.Iterator}
 */
anychart.surfaceModule.Chart.prototype.getDetachedIterator = function() {
  return this.data_.getIterator();
};


/**
 * Returns new data iterator.
 * @return {!anychart.data.Iterator}
 */
anychart.surfaceModule.Chart.prototype.getResetIterator = function() {
  return this.iterator_ = this.data_.getIterator();
};


/**
 * Returns current data iterator.
 * @return {!anychart.data.Iterator}
 */
anychart.surfaceModule.Chart.prototype.getIterator = function() {
  return this.iterator_ || (this.iterator_ = this.data_.getIterator());
};


/** @inheritDoc */
anychart.surfaceModule.Chart.prototype.isNoData = function() {
  var rowsCount = this.data_.getIterator().getRowsCount();
  return (!rowsCount);
};


/**
 * Getter/setter for data.
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_value
 * @param {(anychart.enums.TextParsingMode|anychart.data.TextParsingSettings)=} opt_csvSettings
 * @return {anychart.surfaceModule.Chart|anychart.data.View}
 */
anychart.surfaceModule.Chart.prototype.data = function(opt_value, opt_csvSettings) {
  if (goog.isDef(opt_value)) {
    if (this.rawData_ !== opt_value) {
      this.rawData_ = opt_value;
      if (this.data_)
        this.data_.unlistenSignals(this.dataInvalidated_, this);
      goog.dispose(this.data_);
      goog.dispose(this.parentViewToDispose_);

      if (anychart.utils.instanceOf(opt_value, anychart.data.View))
        this.data_ = (/** @type {anychart.data.View} */ (opt_value)).derive();
      else if (anychart.utils.instanceOf(opt_value, anychart.data.Set))
        this.data_ = (/** @type {anychart.data.Set} */ (opt_value)).mapAs();
      else
        this.data_ = (this.parentViewToDispose_ = new anychart.data.Set(
            (goog.isArray(opt_value) || goog.isString(opt_value)) ? opt_value : null, opt_csvSettings)).mapAs();
      this.data_.listenSignals(this.dataInvalidated_, this);
      this.invalidate(anychart.ConsistencyState.SURFACE_DATA |
              anychart.ConsistencyState.CHART_LEGEND, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.data_;
};


/**
 * Data invalidation handler.
 * @param {anychart.SignalEvent} event
 * @private
 */
anychart.surfaceModule.Chart.prototype.dataInvalidated_ = function(event) {
  this.invalidate(anychart.ConsistencyState.CHART_LABELS | anychart.ConsistencyState.SURFACE_DATA,
      anychart.Signal.NEEDS_REDRAW);
};


/**
 * Callback for goog.array.filter function.
 * Filters out unique values in array.
 * @param {*} element
 * @param {number} index
 * @param {Array.<*>} array
 * @return {boolean} returns true if passed element's index is equal to index of element's first occurrence in array.
 * @private
 */
anychart.surfaceModule.Chart.prototype.filterUnique_ = function(element, index, array) {
  return goog.array.indexOf(array, element) === index;
};


/**
 * Calculations
 */
anychart.surfaceModule.Chart.prototype.calculate = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.SURFACE_DATA)) {
    this.invalidate(anychart.ConsistencyState.SURFACE_COLOR_SCALE);
    var iterator = this.data().getIterator();
    iterator.reset();

    this.minX_ = Infinity;
    this.minY_ = Infinity;
    this.minZ_ = Infinity;
    this.maxX_ = -Infinity;
    this.maxY_ = -Infinity;
    this.maxZ_ = -Infinity;
    var valuesX = [], valuesY = [], valuesZ = []; // unique values

    while (iterator.advance()) {
      var x = anychart.utils.toNumber(iterator.get('x'));
      var y = anychart.utils.toNumber(iterator.get('y'));
      var z = anychart.utils.toNumber(iterator.get('z'));

      this.minX_ = Math.min(this.minX_, x);
      this.minY_ = Math.min(this.minY_, y);
      this.minZ_ = Math.min(this.minZ_, z);

      this.maxX_ = Math.max(this.maxX_, x);
      this.maxY_ = Math.max(this.maxY_, y);
      this.maxZ_ = Math.max(this.maxZ_, z);

      valuesX.push(x);
      valuesY.push(y);
      valuesZ.push(z);
    }

    valuesX = goog.array.filter(valuesX, this.filterUnique_);
    valuesY = goog.array.filter(valuesY, this.filterUnique_);
    valuesZ = goog.array.filter(valuesZ, this.filterUnique_);

    this.valuesX_ = valuesX;
    this.valuesY_ = valuesY;
    this.valuesZ_ = valuesZ;

    var pointsCount = iterator.getRowsCount();
    if (pointsCount > 3000) {
      anychart.core.reporting.warning(anychart.enums.WarningCode.SURFACE_POOR_PERFORMANCE, null, [pointsCount], true);
    }
    if ((valuesX.length * valuesY.length != pointsCount || pointsCount < 4) && pointsCount != 0) {
      anychart.core.reporting.error(anychart.enums.ErrorCode.SURFACE_DATA_MALFORMED);
      this.problemWithData_ = true;
    } else {
      this.problemWithData_ = false;
    }
    this.markConsistent(anychart.ConsistencyState.SURFACE_DATA);
  }


  if (this.hasInvalidationState(anychart.ConsistencyState.SURFACE_COLOR_SCALE)) {
    if (this.colorScale_) {
      if (this.colorScale_.needsAutoCalc()) {
        this.colorScale_.startAutoCalc();
        this.colorScale_.extendDataRange.apply(this.colorScale_, this.valuesZ_);
        this.colorScale_.finishAutoCalc();
      } else {
        this.colorScale_.resetDataRange();
        this.colorScale_.extendDataRange.apply(this.colorScale_, this.valuesZ_);
      }
      if (anychart.utils.instanceOf(this.colorScale_, anychart.colorScalesModule.Ordinal))
        this.colorScale_.ticks().markInvalid();
      this.invalidate(anychart.ConsistencyState.APPEARANCE);
      this.markConsistent(anychart.ConsistencyState.SURFACE_COLOR_SCALE);
    }
  }

  var xScale = this.xScale();
  var yScale = this.yScale();
  var zScale = this.zScale();

  var scalesChanged = false;

  if (xScale.needsAutoCalc()) xScale.startAutoCalc();
  if (yScale.needsAutoCalc()) yScale.startAutoCalc();
  if (zScale.needsAutoCalc()) zScale.startAutoCalc();
  xScale.extendDataRange.apply(/** @type {anychart.scales.Base} */(xScale), this.valuesX_);
  yScale.extendDataRange.apply(/** @type {anychart.scales.Base} */(yScale), this.valuesY_);
  zScale.extendDataRange.apply(/** @type {anychart.scales.Base} */(zScale), this.valuesZ_);
  if (xScale.needsAutoCalc()) scalesChanged |= xScale.finishAutoCalc();
  if (yScale.needsAutoCalc()) scalesChanged |= yScale.finishAutoCalc();
  if (zScale.needsAutoCalc()) scalesChanged |= zScale.finishAutoCalc();

  if (scalesChanged)
    this.invalidate(anychart.ConsistencyState.SCALE_CHART_SCALES);

};


/** @inheritDoc */
anychart.surfaceModule.Chart.prototype.createLegendItemsProvider = function(sourceMode, itemsFormat) {
  this.calculate();

  var ticks = this.zScale().ticks().get();

  var legendItemsArray = [];
  for (var i = 0; i < ticks.length; i++) {
    var color = this.colorScale() ? this.colorScale().valueToColor(ticks[i]) : this.palette().itemAt(0);
    var legendItemProvider = {
      'index': 0,
      'text': ticks[i],
      'iconEnabled': true,
      'iconType': 'square',
      'iconStroke': anychart.color.setThickness(color, 1),
      'iconFill': color,
      'disabled': !this.enabled()
    };
    legendItemsArray.push(legendItemProvider);
  }

  return legendItemsArray;
};


/** @inheritDoc */
anychart.surfaceModule.Chart.prototype.getAllSeries = function() {
  return [];
};
//endregion
//region --- Scales


/**
 * Getter/setter for xScale
 * @param {(anychart.scales.Base|Object|anychart.enums.ScaleTypes)=} opt_value
 * @return {(anychart.scales.Base|!anychart.surfaceModule.Chart)}
 */
anychart.surfaceModule.Chart.prototype.xScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = anychart.scales.Base.setupScale(this.xScale_, opt_value, null, anychart.scales.Base.ScaleTypes.ALL_DEFAULT);
    if (val) {
      this.xScale_ = val;
      this.xScale_.resumeSignalsDispatching(false);
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    this.xScale_.listenSignals(this.onScalesSignal_, this);
    return this;
  } else {
    if (!this.xScale_) {
      this.xScale_ = anychart.scales.linear();
      this.xScale_.listenSignals(this.onScalesSignal_, this);
    }
    return this.xScale_;
  }
};


/**
 * Getter/setter for yScale
 * @param {(anychart.scales.Base|Object|anychart.enums.ScaleTypes)=} opt_value
 * @return {(anychart.scales.Base|!anychart.surfaceModule.Chart)}
 */
anychart.surfaceModule.Chart.prototype.yScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = anychart.scales.Base.setupScale(this.yScale_, opt_value, null, anychart.scales.Base.ScaleTypes.ALL_DEFAULT);
    if (val) {
      this.yScale_ = val;
      this.yScale_.resumeSignalsDispatching(false);
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    this.yScale_.listenSignals(this.onScalesSignal_, this);
    return this;
  } else {
    if (!this.yScale_) {
      this.yScale_ = anychart.scales.linear();
      this.yScale_.listenSignals(this.onScalesSignal_, this);
    }
    return this.yScale_;
  }
};


/**
 * Getter/setter for zScale
 * @param {(anychart.scales.Base|Object|anychart.enums.ScaleTypes)=} opt_value
 * @return {(anychart.scales.Base|!anychart.surfaceModule.Chart)}
 */
anychart.surfaceModule.Chart.prototype.zScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = anychart.scales.Base.setupScale(this.zScale_, opt_value, null, anychart.scales.Base.ScaleTypes.ALL_DEFAULT);
    if (val) {
      this.zScale_ = val;
      this.zScale_.resumeSignalsDispatching(false);
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    this.zScale_.listenSignals(this.onScalesSignal_, this);
    return this;
  } else {
    if (!this.zScale_) {
      this.zScale_ = anychart.scales.linear();
      this.zScale_.listenSignals(this.onScalesSignal_, this);
    }
    return this.zScale_;
  }
};


/**
 *
 * @param {(anychart.colorScalesModule.Linear|anychart.colorScalesModule.Ordinal|Object|anychart.enums.ScaleTypes)=} opt_value
 * @return {anychart.surfaceModule.Chart|anychart.colorScalesModule.Linear}
 */
anychart.surfaceModule.Chart.prototype.colorScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (goog.isNull(opt_value) && this.colorScale_) {
      this.colorScale_ = null;
      this.invalidate(anychart.ConsistencyState.SURFACE_COLOR_SCALE | anychart.ConsistencyState.APPEARANCE,
          anychart.Signal.NEEDS_REDRAW);
    } else {
      var val = anychart.scales.Base.setupScale(this.colorScale_, opt_value, null,
          anychart.scales.Base.ScaleTypes.COLOR_SCALES, null, this.colorScaleInvalidated_, this);
      if (val) {
        var dispatch = this.colorScale_ == val;
        this.colorScale_ = val;
        this.colorScale_.resumeSignalsDispatching(dispatch);
        if (!dispatch) {
          this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.SURFACE_COLOR_SCALE,
              anychart.Signal.NEEDS_REDRAW);
        }
      }
    }
    return this;
  }
  return this.colorScale_;
};


/**
 * Chart color scale invalidation handler.
 * @param {anychart.SignalEvent} event
 * @private
 */
anychart.surfaceModule.Chart.prototype.colorScaleInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.SURFACE_COLOR_SCALE | anychart.ConsistencyState.CHART_LEGEND,
        anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 *
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.surfaceModule.Chart.prototype.onScalesSignal_ = function(event) {
  this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
};
//endregion
//region --- Color range


/**
 * Getter/setter for color range.
 * @param {Object=} opt_value Color range settings to set.
 * @return {!(anychart.colorScalesModule.ui.ColorRange|anychart.surfaceModule.Chart)}
 * Return current chart color range or itself for chaining call.
 */
anychart.surfaceModule.Chart.prototype.colorRange = function(opt_value) {
  if (!this.colorRange_) {
    this.colorRange_ = new anychart.colorScalesModule.ui.ColorRange();
    this.setupCreated('colorRange', this.colorRange_);
    this.colorRange_.setupInternal(true, this.colorRange_.themeSettings);
    this.colorRange_.marker().addThemes('defaultMarkerFactory', 'surface.colorRange.marker');
    this.colorRange_.marker().setupInternal(true, this.colorRange_.marker().themeSettings);
    this.colorRange_.setParentEventTarget(this);
    this.colorRange_.container(this.rootElement);
    this.colorRange_.listenSignals(this.colorRangeInvalidated_, this);
    this.invalidate(anychart.ConsistencyState.SURFACE_COLOR_RANGE | anychart.ConsistencyState.BOUNDS,
        anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(opt_value)) {
    this.colorRange_.setup(opt_value);
    return this;
  } else {
    return this.colorRange_;
  }
};


/**
 * On color range invalidation.
 * @param {anychart.SignalEvent} event
 * @private
 */
anychart.surfaceModule.Chart.prototype.colorRangeInvalidated_ = function(event) {
  var state = 0;
  var signal = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state |= anychart.ConsistencyState.SURFACE_COLOR_RANGE | anychart.ConsistencyState.APPEARANCE;
    signal |= anychart.Signal.NEEDS_REDRAW;
  }
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state |= anychart.ConsistencyState.BOUNDS;
    signal |= anychart.Signal.BOUNDS_CHANGED;
  }
  // if there are no signals, !state and nothing happens.
  this.invalidate(state, signal);
};
//endregion
//region --- Events


/** @inheritDoc */
anychart.surfaceModule.Chart.prototype.onMouseDown = function(event) {
  if (event['button'] != acgraph.events.BrowserEvent.MouseButton.LEFT) return;
  this.mouseRotation_ = true;
  this.startMouseRotationX = event['clientX'];
  this.startMouseRotationY = event['clientY'];
  this.startSurfaceRotationY = this.getOption('rotationY');
  this.startSurfaceRotationZ = this.getOption('rotationZ');
};


/** @inheritDoc */
anychart.surfaceModule.Chart.prototype.handleMouseEvent = function(event) {
  if (event['type'] == acgraph.events.EventType.MOUSEUP) {
    this.mouseRotation_ = false;
  }
};


/** @inheritDoc */
anychart.surfaceModule.Chart.prototype.handleMouseOverAndMove = function(event) {
  if (this.mouseRotation_) {
    this.suspendSignalsDispatching();
    var pixelBounds = this.getPixelBounds();
    this['rotationY'](this.startSurfaceRotationY -
        (this.startMouseRotationY - event['clientY']) / pixelBounds.height * 110);
    this['rotationZ'](this.startSurfaceRotationZ +
        (this.startMouseRotationX - event['clientX']) / pixelBounds.width * 110);
    this.resumeSignalsDispatching(true);
  }
};
//endregion
//region --- Drawing


/** @inheritDoc */
anychart.surfaceModule.Chart.prototype.drawContent = function(bounds) {
  if (this.isConsistent())
    return;

  this.prepareTransformationMatrix(/** @type {number} */(this.getOption('rotationZ')),
      /** @type {number} */(this.getOption('rotationY')));

  var xGrid = this.getCreated('xGrid');
  var yGrid = this.getCreated('yGrid');
  var zGrid = this.getCreated('zGrid');

  var xAxis = this.getCreated('xAxis');
  var yAxis = this.getCreated('yAxis');
  var zAxis = this.getCreated('zAxis');

  if (!this.rootLayer_) {
    this.rootLayer_ = this.rootElement.layer();
    this.rootLayer_.zIndex(anychart.surfaceModule.Chart.Z_INDEX_ROOT_LAYER);
    this.surfaceLayer_ = this.rootLayer_.layer();
    this.surfaceLayer_.zIndex(anychart.surfaceModule.Chart.Z_INDEX_ROOT_LAYER);
    // this line eliminates gaps between polygons, but makes surface look less antialiased
    // this.surfaceLayer_.attr('shape-rendering', 'crispEdges');
  }

  var colorRange = this.getCreated('colorRange');
  this.calculate();

  if (this.hasInvalidationState(anychart.ConsistencyState.SCALE_CHART_SCALES)) {
    if (zAxis && !zAxis.scale()){
      zAxis.scale(this.zScale());
    }
    if (xAxis && !xAxis.scale()){
      xAxis.scale(this.xScale());
    }
    if (yAxis && !yAxis.scale()){
      yAxis.scale(this.yScale());
    }
    if (xGrid){
      xGrid.scale(/** @type {anychart.scales.IXScale} */(this.xScale()));
    }
    if (yGrid){
      yGrid.scale(/** @type {anychart.scales.IXScale} */(this.yScale()));
    }
    if (zGrid){
      zGrid.scale(/** @type {anychart.scales.IXScale} */(this.zScale()));
    }
    this.markConsistent(anychart.ConsistencyState.SCALE_CHART_SCALES);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.SURFACE_COLOR_RANGE)) {
    /* Bounds shrinking for colorRange to place */
    if (colorRange) {
      colorRange.suspendSignalsDispatching();
      colorRange.scale(this.colorScale());
      colorRange.target(this);
      colorRange.resumeSignalsDispatching(false);
      this.invalidate(anychart.ConsistencyState.BOUNDS);
    }
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    if (colorRange) {
      colorRange.parentBounds(bounds.clone());
      this.dataBounds_ = colorRange.getRemainingBounds();
    } else {
      this.dataBounds_ = bounds.clone();
    }
    var paddingForZAxisLabels = 10;
    this.dataBounds_.left += paddingForZAxisLabels;
    this.dataBounds_.width -= paddingForZAxisLabels;

    if (zAxis) zAxis.parentBounds(this.dataBounds_);
    if (yAxis) yAxis.parentBounds(this.dataBounds_);
    if (xAxis) xAxis.parentBounds(this.dataBounds_);
    if (xGrid) xGrid.parentBounds(this.dataBounds_);
    if (yGrid) yGrid.parentBounds(this.dataBounds_);
    if (zGrid) zGrid.parentBounds(this.dataBounds_);

    this.invalidate(anychart.ConsistencyState.CHART_LEGEND);
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }


  if (this.hasInvalidationState(anychart.ConsistencyState.SURFACE_COLOR_RANGE)) {
    if (colorRange) {
      colorRange.suspendSignalsDispatching();
      colorRange.container(this.rootElement);
      colorRange.draw();
      colorRange.resumeSignalsDispatching(false);
    }
    this.markConsistent(anychart.ConsistencyState.SURFACE_COLOR_RANGE);
  }

  this.drawBox(this.dataBounds_);

  if (this.hasInvalidationState(anychart.ConsistencyState.AXES_CHART_GRIDS)) {
    if (xGrid) {
      xGrid.container(this.rootElement);
      xGrid.draw();
    }
    if (yGrid) {
      yGrid.container(this.rootElement);
      yGrid.draw();
    }
    if (zGrid) {
      zGrid.container(this.rootElement);
      zGrid.draw();
    }
    this.markConsistent(anychart.ConsistencyState.AXES_CHART_GRIDS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    this.drawSurface(this.dataBounds_);
    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.AXES_CHART_AXES)) {
    this.drawAxes();
    this.markConsistent(anychart.ConsistencyState.AXES_CHART_AXES);
  }
};


/**
 * Scales all points to fit them into [-0.5; 0.5] along their axes.
 * Also inverts Z axis, because we want higher values to go up.
 * @param {Array.<number>} point
 * @return {Array.<number>} returns scaled point.
 */
anychart.surfaceModule.Chart.prototype.scalePoint = function(point) {
  var x = this.xScale().transform(point[0]) - 0.5;
  var y = this.yScale().transform(point[1]) - 0.5;
  var z = 1 - this.zScale().transform(point[2]) - 0.5;
  return [x, y, z];
};


/**
 * Prepares transformation matrix, wich rotates point with given angles.
 * As of now it only rotates along 2 axes, one of which (Y axis) is always horizontal and is parallel to viewer.
 * All info taken from this website: http://planning.cs.uiuc.edu/node102.html
 * Beware, in our case Z rotation is applied first and only then Y rotation,
 * this is to keep Y rotation relative to viewer.
 * @param {number} yaw - Z axis rotation
 * @param {number} pitch - Y axis rotation
 */
anychart.surfaceModule.Chart.prototype.prepareTransformationMatrix = function(yaw, pitch) {
  var pointForDepth = [-1, 0, 0];
  var matrix = anychart.surfaceModule.math.createTransformationMatrix(0, pitch);
  pointForDepth = anychart.surfaceModule.math.applyTransformationMatrixToPoint(matrix, pointForDepth);
  this.cameraPoint_ = pointForDepth;

  yaw = Math.PI / 180 * yaw;
  pitch = Math.PI / 180 * pitch;

  var sinA = Math.sin(yaw);
  var cosA = Math.cos(yaw);
  var sinB = Math.sin(pitch);
  var cosB = Math.cos(pitch);

  this.transformationMatrix_ = [cosA * cosB, -sinA * cosB, sinB,
                                sinA, cosA, 0,
                                -sinB * cosA, sinA * sinB, cosB];
};


/**
 * Distance from camera to path defined by points. Points should be in range [-0.5, 0.5].
 * @param {Array.<Array.<number>>} points
 * @return {number} returns zIndex-like distance, where lower value means object is farther away.
 */
anychart.surfaceModule.Chart.prototype.calculateZIndex = function(points) {
  var distance = 0;
  for (var i = 0; i < points.length; i++) {
    distance += anychart.surfaceModule.math.distanceFromPointToPoint(this.cameraPoint_, points[i]);
  }

  distance /= points.length;

  return 2 - distance;
};


/**
 * Checks if passed polygon goes out of scales bounds and crops it accordingly.
 * As of now it doesn't move point along edge, but simply modifies value of axis that is out of bounds (x, y or z).
 * @param {Array.<Array.<number>>} face Array of points representing rectangular polygon.
 * Each point is represented as array of 3 numbers: [x, y, z].
 * @return {?Array.<Array.<number>>} returns modified polygon with points cropped if they went out of scales bounds.
 * Or if all points are out of bounds it returns null.
 */
anychart.surfaceModule.Chart.prototype.cropFaceByScales = function(face) {
  var zScale = this.zScale();
  var zMin = zScale.minimum();
  var zMax = zScale.maximum();
  var yScale = this.yScale();
  var yMin = yScale.minimum();
  var yMax = yScale.maximum();
  var xScale = this.xScale();
  var xMin = xScale.minimum();
  var xMax = xScale.maximum();
  var faultyPoints = 0;
  var newFace = [];
  for (var i = 0; i < face.length; i++) {
    var point = face[i];
    if (point[2] >= zMin && point[2] <= zMax && point[1] <= yMax && point[1] >= yMin && point[0] >= xMin && point[0] <= xMax) {
      newFace.push(point);
    } else {
      faultyPoints++;
      if (point[2] < zMin || point[2] > zMax)
        point[2] = Math.max(Math.min(point[2], zMax), zMin);
      if (point[1] < yMax || point[1] > yMin)
        point[1] = Math.max(Math.min(point[1], yMax), yMin);
      if (point[0] > xMin || point[0] < xMax)
        point[0] = Math.max(Math.min(point[0], xMax), xMin);
      newFace.push(point);
    }
  }

  if (faultyPoints == face.length)
    return null;

  return newFace;
};


/**
 * Draws surface.
 * @param {anychart.math.Rect} bounds
 */
anychart.surfaceModule.Chart.prototype.drawSurface = function(bounds) {
  var iterator = this.data().getIterator();
  iterator.reset();
  var stroke = /** @type {acgraph.vector.Stroke} */(this.getOption('stroke'));

  this.surfaceLayer_.removeChildren();

  if (this.problemWithData_) return;

  this.rootLayer_.suspend();
  for (var x = 0; x < this.valuesX_.length - 1; x++) {
    for (var y = 0; y < this.valuesY_.length - 1; y++) {
      var p0, p1, p2, p3;
      var path;

      var pathID = x * (this.valuesY_.length - 1) + y;
      path = this.paths_[pathID];
      if (path) {
        path.parent(this.surfaceLayer_);
        path.clear();
      } else {
        path = this.paths_[pathID] = this.surfaceLayer_.path();
        // fix for cases when on first draw path isn't drawn, but drawn afterwards
        // it results in black stroke
        // this might happen if scales min/max changed before draw, and then changed again
        path.stroke(null);
      }

      iterator.select(x * this.valuesY_.length + y);
      var originalP0 = [anychart.utils.toNumber(iterator.get('x')),
            anychart.utils.toNumber(iterator.get('y')), anychart.utils.toNumber(iterator.get('z'))];
      iterator.select((x + 1) * this.valuesY_.length + y);
      var originalP1 = [anychart.utils.toNumber(iterator.get('x')),
            anychart.utils.toNumber(iterator.get('y')), anychart.utils.toNumber(iterator.get('z'))];
      iterator.select((x + 1) * this.valuesY_.length + y + 1);
      var originalP2 = [anychart.utils.toNumber(iterator.get('x')),
            anychart.utils.toNumber(iterator.get('y')), anychart.utils.toNumber(iterator.get('z'))];
      iterator.select(x * this.valuesY_.length + y + 1);
      var originalP3 = [anychart.utils.toNumber(iterator.get('x')),
            anychart.utils.toNumber(iterator.get('y')), anychart.utils.toNumber(iterator.get('z'))];

      //todo (I.Kurnoy) think about cropping faces along edges for better result
      var face = this.cropFaceByScales([originalP0, originalP1, originalP2, originalP3]);

      //face is out of scales bounds, no need to draw it
      if (!face) continue;

      p0 = anychart.surfaceModule.math.applyTransformationMatrixToPoint(this.transformationMatrix_, this.scalePoint(face[0]));
      p1 = anychart.surfaceModule.math.applyTransformationMatrixToPoint(this.transformationMatrix_, this.scalePoint(face[1]));
      p2 = anychart.surfaceModule.math.applyTransformationMatrixToPoint(this.transformationMatrix_, this.scalePoint(face[2]));
      p3 = anychart.surfaceModule.math.applyTransformationMatrixToPoint(this.transformationMatrix_, this.scalePoint(face[3]));

      var depth = anychart.surfaceModule.Chart.Z_INDEX_ROOT_LAYER + this.calculateZIndex([p0, p1, p2, p3]);

      var pointsToRender = anychart.surfaceModule.math.pointsToScreenCoordinates([p0, p1, p2, p3], bounds);

      var colorScale = this.colorScale();
      var color;

      if (colorScale) {
        color = colorScale.valueToColor((originalP0[2] + originalP1[2] + originalP2[2] + originalP3[2]) / 4);
      } else {
        var palette = this.palette();
        color = palette.itemAt(0);
      }

      this.drawPolygon(path, pointsToRender, depth, color, stroke);
    }
  }

  this.rootLayer_.resume();
};


/**
 * Draw axes.
 */
anychart.surfaceModule.Chart.prototype.drawAxes = function() {
  var xAxis = this.getCreated('xAxis');
  var yAxis = this.getCreated('yAxis');
  var zAxis = this.getCreated('zAxis');

  if (xAxis) xAxis.container(this.rootElement).draw();
  if (yAxis) yAxis.container(this.rootElement).draw();
  if (zAxis) zAxis.container(this.rootElement).draw();
};


/**
 * Finds and returns nearest, farthest, most left and most right points in given set.
 * @param {Array.<Array.<number>>} points Array of transformed points, where above mentioned ones will be searched.
 * @return {{
 *  left: Array.<number>,
 *  right: Array.<number>,
 *  near: Array.<number>,
 *  far: Array.<number>
 * }}
 */
anychart.surfaceModule.Chart.prototype.findPoints = function(points) {
  var minX = 0;
  var indexMin = 0;
  var maxX = 0;
  var indexMax = 0;
  var maxDepth = -Infinity;
  var indexMaxDepth = 0;
  var minDepth = +Infinity;
  var indexMinDepth = 0;
  for (var i = 0; i < points.length; i++) {
    if (points[i][1] < minX) {
      minX = points[i][1];
      indexMin = i;
    }
    if (points[i][1] > maxX) {
      maxX = points[i][1];
      indexMax = i;
    }
    var depth = points[i][0];
    if (maxDepth < depth) {
      maxDepth = points[i][0];
      indexMaxDepth = i;
    }
    if (minDepth > depth) {
      minDepth = points[i][0];
      indexMinDepth = i;
    }
  }
  return {
    left: points[indexMin],
    right: points[indexMax],
    far: points[indexMaxDepth],
    near: points[indexMinDepth]
  };
};


/**
 * Draws box around surface.
 * @param {anychart.math.Rect} bounds
 */
anychart.surfaceModule.Chart.prototype.drawBox = function(bounds) {
  var bottomPlane = [ // bottom plane points
    [-0.5, -0.5, 0.5],
    [-0.5, 0.5, 0.5],
    [0.5, 0.5, 0.5],
    [0.5, -0.5, 0.5]
  ];

  var upperPlane = [ // upper plane points
    [-0.5, -0.5, -0.5],
    [-0.5, 0.5, -0.5],
    [0.5, 0.5, -0.5],
    [0.5, -0.5, -0.5]
  ];

  var i;
  if (this.boxPaths_.length == 0) {
    // box has 12 edges, so we create all of them
    for (i = 0; i < 12; i++) {
      this.boxPaths_[i] = this.rootLayer_.path();
    }
  } else {
    for (i = 0; i < this.boxPaths_.length; i++) {
      this.boxPaths_[i].clear();
    }
  }

  var stroke = /** @type {acgraph.vector.Stroke} */(this.getOption('box'));

  var bottomPlaneTransformed = [];
  var upperPlaneTransformed = [];
  for (i = 0; i < bottomPlane.length; i++) {
    bottomPlaneTransformed[i] = anychart.surfaceModule.math.applyTransformationMatrixToPoint(this.transformationMatrix_,
        bottomPlane[i]);
    upperPlaneTransformed[i] = anychart.surfaceModule.math.applyTransformationMatrixToPoint(this.transformationMatrix_,
        upperPlane[i]);
  }

  var bottomFoundPoints = this.findPoints(bottomPlaneTransformed);
  var upperFoundPoints = this.findPoints(upperPlaneTransformed);
  var bottomNearest = bottomFoundPoints.near;
  var upperNearest = upperFoundPoints.near;
  var bottomLeft = bottomFoundPoints.left;

  var cagePoints = [];

  //pushing bottom plane points to cagePath points
  for (i = 0; i < bottomPlaneTransformed.length; i++) {
    var nextPointIndex = i == bottomPlaneTransformed.length - 1 ? 0 : i + 1;
    var nextPoint = bottomPlaneTransformed[nextPointIndex];
    var currPoint = bottomPlaneTransformed[i];
    var xDif = Math.abs(bottomPlane[i][0] - bottomPlane[nextPointIndex][0]);
    var yDif = Math.abs(bottomPlane[i][1] - bottomPlane[nextPointIndex][1]);

    var xAxis = this.getCreated('xAxis');
    var yAxis = this.getCreated('yAxis');
    var zAxis = this.getCreated('zAxis');

    // This fixes box & axes overlapping. We don't draw box where there is axis already.
    // Bc if we draw them onto each other they look horrific.
    // This peace fixes x and y axes only.
    if ((xAxis && xAxis.enabled() && xAxis.fixedPosition() && i == bottomPlaneTransformed.length - 1) ||
        (yAxis && yAxis.enabled() && yAxis.fixedPosition() && i == 0) ||
        (xAxis && xAxis.enabled() && (xDif > yDif) && [currPoint, nextPoint].indexOf(bottomNearest) >= 0) ||
        (yAxis && yAxis.enabled() && (yDif > xDif) && [currPoint, nextPoint].indexOf(bottomNearest) >= 0)) {
      continue;
    }
    cagePoints.push([bottomPlaneTransformed[i], nextPoint]);
  }

  //upper plane
  for (i = 0; i < upperPlaneTransformed.length; i++) {
    var nextPoint = i == upperPlaneTransformed.length - 1 ? upperPlaneTransformed[0] : upperPlaneTransformed[i + 1];
    cagePoints.push([upperPlaneTransformed[i], nextPoint]);
  }

  //connecting planes
  for (i = 0; i < bottomPlaneTransformed.length; i++) {
    // This is same as above. Fixes overlapping with Z axis by not drawing edge of box.
    if (zAxis && zAxis.enabled() && ((zAxis.fixedPosition() && i == 0) ||
        bottomPlaneTransformed[i] == bottomLeft)) {
      continue;
    }
    cagePoints.push([bottomPlaneTransformed[i], upperPlaneTransformed[i]]);
  }

  for (i = 0; i < cagePoints.length; i++) {
    var p0 = cagePoints[i][0];
    var p1 = cagePoints[i][1];

    var zIndex = Math.min(this.calculateZIndex([p0]), this.calculateZIndex([p1]));
    if (p0 == bottomNearest || p1 == bottomNearest || p0 == upperNearest || p1 == upperNearest)
      zIndex = 100; // zIndex hack, for lines going out of nearest point to the viewer
    this.drawLine(this.boxPaths_[i], anychart.surfaceModule.math.pointsToScreenCoordinates(cagePoints[i], bounds),
                  zIndex, stroke);
  }
};


/**
 * Draws polygon (closed path).
 * @param {acgraph.vector.Path} path used for drawing.
 * @param {Array.<Array.<number>>} points stored in the array. Each point with 3 values [x, y, z] and only last two of them are used for drawing.
 * It goes like [x, y, z] => [unused, x, y]
 * @param {number} zIndex for path to be set.
 * @param {string=} opt_fillColor of path.
 * @param {(acgraph.vector.Stroke)=} opt_stroke of path.
 */
anychart.surfaceModule.Chart.prototype.drawPolygon = function(path, points, zIndex, opt_fillColor, opt_stroke) {
  this.drawLine(path, points, zIndex, opt_stroke);
  path.close();
  path.fill(opt_fillColor || 'white');
};


/**
 * Draws line (nonclosed path).
 * @param {acgraph.vector.Path} path
 * @param {Array.<Array.<number>>} points
 * @param {number} zIndex
 * @param {(acgraph.vector.Stroke)=} opt_stroke
 */
anychart.surfaceModule.Chart.prototype.drawLine = function(path, points, zIndex, opt_stroke) {
  path.clear();
  path.moveTo(points[0][1], points[0][2]);
  for (var i = 1; i < points.length; i++) {
    path.lineTo(points[i][1], points[i][2]);
  }
  path.zIndex(zIndex);
  path.stroke(opt_stroke);
};
//endregion
//region --- Grids


/**
 * Getter/setter for xGrid.
 * @param {(Object|boolean|null)=} opt_value
 * @return {!(anychart.surfaceModule.Grid|anychart.surfaceModule.Chart)}
 */
anychart.surfaceModule.Chart.prototype.xGrid = function(opt_value) {
  if (!this.xGrid_) {
    this.xGrid_ = new anychart.surfaceModule.Grid();
    this.xGrid_.setOwner(/** @type {anychart.core.IChart} */(this));
    this.xGrid_.listenSignals(this.onGridSignal_, this);
    this.xGrid_.rotationZ(/** @type {number} */(this.getOption('rotationZ')));
    this.xGrid_.rotationY(/** @type {number} */(this.getOption('rotationY')));
    this.setupCreated('xGrid', this.xGrid_);
    this.invalidate(anychart.ConsistencyState.AXES_CHART_GRIDS, anychart.Signal.NEEDS_REDRAW);
  }
  if (goog.isDef(opt_value)) {
    this.xGrid_.setup(opt_value);
    return this;
  } else {
    return this.xGrid_;
  }
};


/**
 * Getter/setter for yGrid.
 * @param {(Object|boolean|null)=} opt_value
 * @return {!(anychart.surfaceModule.Grid|anychart.surfaceModule.Chart)}
 */
anychart.surfaceModule.Chart.prototype.yGrid = function(opt_value) {
  if (!this.yGrid_) {
    this.yGrid_ = new anychart.surfaceModule.Grid();
    this.yGrid_.setOwner(/** @type {anychart.core.IChart} */(this));
    this.yGrid_.listenSignals(this.onGridSignal_, this);
    this.yGrid_.rotationZ(/** @type {number} */(this.getOption('rotationZ')));
    this.yGrid_.rotationY(/** @type {number} */(this.getOption('rotationY')));
    this.yGrid_.setDefaultLayout(anychart.enums.Layout.VERTICAL);
    this.setupCreated('yGrid', this.yGrid_);
    this.invalidate(anychart.ConsistencyState.AXES_CHART_GRIDS, anychart.Signal.NEEDS_REDRAW);
  }
  if (goog.isDef(opt_value)) {
    this.yGrid_.setup(opt_value);
    return this;
  } else {
    return this.yGrid_;
  }
};


/**
 * Getter/setter for zGrid.
 * @param {(Object|boolean|null)=} opt_value
 * @return {!(anychart.surfaceModule.Grid|anychart.surfaceModule.Chart)}
 */
anychart.surfaceModule.Chart.prototype.zGrid = function(opt_value) {
  if (!this.zGrid_) {
    this.zGrid_ = new anychart.surfaceModule.Grid();
    this.zGrid_.setOwner(/** @type {anychart.core.IChart} */(this));
    this.zGrid_.listenSignals(this.onGridSignal_, this);
    this.zGrid_.rotationZ(/** @type {number} */(this.getOption('rotationZ')));
    this.zGrid_.rotationY(/** @type {number} */(this.getOption('rotationY')));
    this.zGrid_.setDefaultLayout(anychart.enums.Layout.HORIZONTAL);
    this.zGrid_.isZGrid(true);
    this.setupCreated('zGrid', this.zGrid_);
    this.invalidate(anychart.ConsistencyState.AXES_CHART_GRIDS, anychart.Signal.NEEDS_REDRAW);
  }
  if (goog.isDef(opt_value)) {
    this.zGrid_.setup(opt_value);
    return this;
  } else {
    return this.zGrid_;
  }
};


/**
 * Grid events listener.
 * @param {anychart.SignalEvent} event
 * @private
 */
anychart.surfaceModule.Chart.prototype.onGridSignal_ = function(event) {
  this.invalidate(anychart.ConsistencyState.AXES_CHART_GRIDS | anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW);
};
//endregion


/**
 * Getter for chart which current point belongs to.
 * @return {anychart.surfaceModule.Chart}
 */
anychart.surfaceModule.Chart.prototype.getChart = function() {
  return this;
};


/** @inheritDoc */
anychart.surfaceModule.Chart.prototype.getPoint = function(index) {
  return null;
};


/**
 * Getter/setter for palette.
 * @param {(anychart.palettes.RangeColors|anychart.palettes.DistinctColors|Object|Array.<string>)=} opt_value .
 * @return {!(anychart.palettes.RangeColors|anychart.palettes.DistinctColors|anychart.surfaceModule.Chart)} .
 */
anychart.surfaceModule.Chart.prototype.palette = function(opt_value) {
  if (anychart.utils.instanceOf(opt_value, anychart.palettes.RangeColors)) {
    this.setupPalette_(anychart.palettes.RangeColors, /** @type {anychart.palettes.RangeColors} */(opt_value));
    return this;
  } else if (anychart.utils.instanceOf(opt_value, anychart.palettes.DistinctColors)) {
    this.setupPalette_(anychart.palettes.DistinctColors, /** @type {anychart.palettes.DistinctColors} */(opt_value));
    return this;
  } else if (goog.isObject(opt_value) && opt_value['type'] == 'range') {
    this.setupPalette_(anychart.palettes.RangeColors);
  } else if (goog.isObject(opt_value) || this.palette_ == null)
    this.setupPalette_(anychart.palettes.DistinctColors);

  if (goog.isDef(opt_value)) {
    this.palette_.setup(opt_value);
    return this;
  }

  return /** @type {!(anychart.palettes.RangeColors|anychart.palettes.DistinctColors)} */(this.palette_);
};


/**
 * @param {Function} cls Palette constructor.
 * @param {(anychart.palettes.RangeColors|anychart.palettes.DistinctColors)=} opt_cloneFrom Settings to clone from.
 * @private
 */
anychart.surfaceModule.Chart.prototype.setupPalette_ = function(cls, opt_cloneFrom) {
  if (anychart.utils.instanceOf(this.palette_, cls)) {
    if (opt_cloneFrom)
      this.palette_.setup(opt_cloneFrom);
  } else {
    // we dispatch only if we replace existing palette.
    var doDispatch = !!this.palette_;
    goog.dispose(this.palette_);
    this.palette_ = /** @type {anychart.palettes.DistinctColors|anychart.palettes.RangeColors} */ (new cls());
    this.setupCreated('palette', this.palette_);
    this.palette_.restoreDefaults();
    if (opt_cloneFrom)
      this.palette_.setup(opt_cloneFrom);
    this.palette_.listenSignals(this.paletteInvalidated_, this);
    if (doDispatch)
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Internal palette invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.surfaceModule.Chart.prototype.paletteInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
  }
};


/** @inheritDoc */
anychart.surfaceModule.Chart.prototype.getType = function() {
  return anychart.enums.ChartTypes.SURFACE;
};


/**
 * Serializes object scale if it's not in scaleUids list.
 * @param {Array.<Object>} scaleUids array of uids in surface chart scales.
 * @param {Object} object with scale.
 * @param {string} name of object with scale.
 * @param {Object} json passed to chart.
 */
anychart.surfaceModule.Chart.prototype.serializeScales = function(scaleUids, object, name, json) {
  var uid = goog.getUid(object.scale());
  if (!goog.array.contains(scaleUids, uid)) {
    json[name]['scale'] = object.scale().serialize();
  }
};


/** @inheritDoc */
anychart.surfaceModule.Chart.prototype.serialize = function() {
  var json = anychart.surfaceModule.Chart.base(this, 'serialize');

  if (this.data_)
    json['data'] = this.data().serialize();

  var scaleGuids = [];
  var uid;

  if (this.xScale_) {
    json['xScale'] = this.xScale().serialize();
    scaleGuids.push(goog.getUid(this.xScale()));
  }
  if (this.yScale_) {
    json['yScale'] = this.yScale().serialize();
    scaleGuids.push(goog.getUid(this.yScale()));
  }
  if (this.zScale_) {
    json['zScale'] = this.zScale().serialize();
    scaleGuids.push(goog.getUid(this.zScale()));
  }

  if (this.xAxis_) {
    json['xAxis'] = this.xAxis().serialize();
    this.serializeScales(scaleGuids, this.xAxis(), 'xAxis', json);
  }
  if (this.yAxis_) {
    json['yAxis'] = this.yAxis().serialize();
    this.serializeScales(scaleGuids, this.yAxis(), 'yAxis', json);
  }
  if (this.zAxis_) {
    json['zAxis'] = this.zAxis().serialize();
    this.serializeScales(scaleGuids, this.zAxis(), 'zAxis', json);
  }

  if (this.xGrid_) {
    json['xGrid'] = this.xGrid().serialize();
    this.serializeScales(scaleGuids, this.xGrid(), 'xGrid', json);
  }
  if (this.yGrid_) {
    json['yGrid'] = this.yGrid().serialize();
    this.serializeScales(scaleGuids, this.yGrid(), 'yGrid', json);
  }
  if (this.zGrid_) {
    json['zGrid'] = this.zGrid().serialize();
    this.serializeScales(scaleGuids, this.zGrid(), 'zGrid', json);
  }

  if (this.colorScale_)
    json['colorScale'] = this.colorScale().serialize();
  else
    json['colorScale'] = null;

  if (this.colorRange_)
    json['colorRange'] = this.colorRange().serialize();

  anychart.core.settings.serialize(this, anychart.surfaceModule.Chart.OWN_DESCRIPTORS, json);
  return {'chart': json};
};


/**
 * Setup objects with scale settings if they are present in config.
 * @param {!Object} config
 * @param {string} name of object with scale.
 */
anychart.surfaceModule.Chart.prototype.setupScalesByJSON = function(config, name) {
  if (name in config) {
    this[name](config[name]);
    if ('scale' in config[name])
      this[name]().scale(config[name]['scale']);
  }
};


/** @inheritDoc */
anychart.surfaceModule.Chart.prototype.setupByJSON = function(config, opt_default) {
  anychart.surfaceModule.Chart.base(this, 'setupByJSON', config, opt_default);
  if ('data' in config)
    this.data(config['data']);

  this.setupScalesByJSON(config, 'xScale');
  this.setupScalesByJSON(config, 'yScale');
  this.setupScalesByJSON(config, 'zScale');

  this.setupScalesByJSON(config, 'xAxis');
  this.setupScalesByJSON(config, 'yAxis');
  this.setupScalesByJSON(config, 'zAxis');

  this.setupScalesByJSON(config, 'xGrid');
  this.setupScalesByJSON(config, 'yGrid');
  this.setupScalesByJSON(config, 'zGrid');

  if ('colorScale' in config)
    this.colorScale(config['colorScale']);
  if ('colorRange' in config)
    this.colorRange(config['colorRange']);


  anychart.core.settings.deserialize(this, anychart.surfaceModule.Chart.OWN_DESCRIPTORS, config, opt_default);
};


/** @inheritDoc */
anychart.surfaceModule.Chart.prototype.disposeInternal = function() {
  goog.disposeAll(
      this.xAxis_,
      this.yAxis_,
      this.zAxis_,
      this.paths_,
      this.xGrid_,
      this.yGrid_,
      this.zGrid_,
      this.boxPaths_,
      this.surfaceLayer_,
      this.rootLayer_,
      this.colorRange_,
      this.palette_,
      this.data_,
      this.parentViewToDispose_);
  this.boxPaths_.length = 0;
  this.paths_.length = 0;
  this.surfaceLayer_ = null;
  this.rootLayer_ = null;
  this.colorRange_ = null;
  this.palette_ = null;
  this.data_ = null;
  this.parentViewToDispose_ = null;
  this.xAxis_ = null;
  this.yAxis_ = null;
  this.zAxis_ = null;
  this.xGrid_ = null;
  this.yGrid_ = null;
  this.zGrid_ = null;
  anychart.surfaceModule.Chart.base(this, 'disposeInternal');
};


/** @inheritDoc */
anychart.surfaceModule.Chart.prototype.getDataHolders = function() {
  return /** @type {Array.<{data: function():anychart.data.IDataSource}>} */([this]);
};


/** @inheritDoc */
anychart.surfaceModule.Chart.prototype.getCsvColumns = function(dataHolder) {
  return ['x', 'y', 'z'];
};


//region Exports
//exports
(function() {
  var proto = anychart.surfaceModule.Chart.prototype;

  proto['colorScale'] = proto.colorScale;

  proto['colorRange'] = proto.colorRange;

  proto['xGrid'] = proto.xGrid;
  proto['yGrid'] = proto.yGrid;
  proto['zGrid'] = proto.zGrid;

  proto['xAxis'] = proto.xAxis;
  proto['yAxis'] = proto.yAxis;
  proto['zAxis'] = proto.zAxis;

  proto['xScale'] = proto.xScale;
  proto['yScale'] = proto.yScale;
  proto['zScale'] = proto.zScale;

  proto['getType'] = proto.getType;

  proto['palette'] = proto.palette;

  //auto
  //proto['rotationZ'] = proto.rotationZ;
  //proto['rotationY'] = proto.rotationY;
  //proto['box'] = proto.box;
  //proto['stroke'] = proto.stroke;
})();
//endregion
