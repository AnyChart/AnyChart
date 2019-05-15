goog.provide('anychart.core.GridBase');
goog.require('acgraph');
goog.require('anychart.color');
goog.require('anychart.core.IAxis');
goog.require('anychart.core.IStandaloneBackend');
goog.require('anychart.core.VisualBase');
goog.require('anychart.core.reporting');
goog.require('anychart.core.settings');
goog.require('anychart.core.utils.Padding');
goog.require('anychart.enums');
goog.require('anychart.scales');



/**
 * Grid.
 * @constructor
 * @extends {anychart.core.VisualBase}
 * @implements {anychart.core.settings.IResolvable}
 * @implements {anychart.core.IStandaloneBackend}
 */
anychart.core.GridBase = function() {
  anychart.core.GridBase.base(this, 'constructor');

  this.addThemes('defaultGridSettings');
  /**
   * @type {acgraph.vector.Path}
   * @protected
   */
  this.lineElementInternal = null;

  /**
   * @type {anychart.enums.Layout|anychart.enums.RadialGridLayout}
   * @protected
   */
  this.defaultLayout = anychart.enums.Layout.HORIZONTAL;

  /**
   * Parent title.
   * @type {anychart.core.settings.IResolvable}
   * @private
   */
  this.parent_ = null;

  /**
   * Resolution chain cache.
   * @type {?Array.<Object|null|undefined>}
   * @private
   */
  this.resolutionChainCache_ = null;

  /**
   * @type {anychart.enums.Layout|anychart.enums.RadialGridLayout}
   * @private
   */
  this.layout_;

  /**
   * Palette for series colors.
   * @type {anychart.palettes.RangeColors|anychart.palettes.DistinctColors}
   * @private
   */
  this.palette_ = null;

  /**
   * @type {Object.<string, acgraph.vector.Path>}
   */
  this.fillMap = {};

  /**
   * @type {anychart.scales.IXScale|anychart.scales.IGeoScale|anychart.stockModule.scales.Scatter|anychart.scales.Base|null}
   * @private
   */
  this.autoScale_ = null;

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['stroke', anychart.ConsistencyState.APPEARANCE],
    ['fill', anychart.ConsistencyState.BOUNDS],
    ['drawFirstLine', anychart.ConsistencyState.GRIDS_POSITION],
    ['drawLastLine', anychart.ConsistencyState.GRIDS_POSITION],
    ['isMinor', anychart.ConsistencyState.GRIDS_POSITION | anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED]
  ]);
};
goog.inherits(anychart.core.GridBase, anychart.core.VisualBase);


//region --- Internal properties
/**
 * Supported signals.
 * @type {number}
 */
anychart.core.GridBase.prototype.SUPPORTED_SIGNALS =
    anychart.core.VisualBase.prototype.SUPPORTED_SIGNALS |
        anychart.Signal.BOUNDS_CHANGED |
        anychart.Signal.ENABLED_STATE_CHANGED |
        anychart.Signal.Z_INDEX_STATE_CHANGED;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.GridBase.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES |
        anychart.ConsistencyState.APPEARANCE |
        anychart.ConsistencyState.GRIDS_POSITION;


//endregion
//region --- IObjectWithSettings overrides
/**
 * @override
 * @param {string} name
 * @return {*}
 */
anychart.core.GridBase.prototype.getOption = anychart.core.settings.getOption;


/** @inheritDoc */
anychart.core.GridBase.prototype.getSignal = function(fieldName) {
  // all properties invalidates with NEEDS_REDRAW;
  return anychart.Signal.NEEDS_REDRAW;
};


//endregion
//region --- IResolvable implementation
/** @inheritDoc */
anychart.core.GridBase.prototype.resolutionChainCache = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.resolutionChainCache_ = opt_value;
  }
  return this.resolutionChainCache_;
};


/** @inheritDoc */
anychart.core.GridBase.prototype.getResolutionChain = anychart.core.settings.getResolutionChain;


/** @inheritDoc */
anychart.core.GridBase.prototype.getLowPriorityResolutionChain = function() {
  var sett = [this.themeSettings];
  if (this.parent_) {
    sett = goog.array.concat(sett, this.parent_.getLowPriorityResolutionChain());
  }
  return sett;
};


/** @inheritDoc */
anychart.core.GridBase.prototype.getHighPriorityResolutionChain = function() {
  var sett = [this.ownSettings];
  if (this.parent_) {
    sett = goog.array.concat(sett, this.parent_.getHighPriorityResolutionChain());
  }
  return sett;
};


//endregion
//region --- Parental relations
/**
 * Gets/sets new parent.
 * @param {anychart.core.settings.IResolvable=} opt_value - Value to set.
 * @return {anychart.core.settings.IResolvable|anychart.core.GridBase} - Current value or itself for method chaining.
 */
anychart.core.GridBase.prototype.parent = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.parent_ != opt_value) {
      if (this.parent_)
        (/** @type {anychart.core.Base} */(this.parent_)).unlistenSignals(this.parentInvalidated_, this);
      this.parent_ = opt_value;
      if (this.parent_)
        (/** @type {anychart.core.Base} */(this.parent_)).listenSignals(this.parentInvalidated_, this);
    }
    return this;
  }
  return this.parent_;
};


/**
 * Parent invalidation handler.
 * @param {anychart.SignalEvent} e - Signal event.
 * @private
 */
anychart.core.GridBase.prototype.parentInvalidated_ = function(e) {
  var state = 0;
  var signal = 0;

  if (e.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state |= anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.GRIDS_POSITION;
    signal |= anychart.Signal.NEEDS_REDRAW;
  }

  if (e.hasSignal(anychart.Signal.ENABLED_STATE_CHANGED)) {
    state |= anychart.ConsistencyState.ENABLED;
    signal |= anychart.Signal.NEEDS_REDRAW;
  }


  if (e.hasSignal(anychart.Signal.Z_INDEX_STATE_CHANGED)) {
    state |= anychart.ConsistencyState.Z_INDEX;
    signal |= anychart.Signal.NEEDS_REDRAW;
  }

  this.resolutionChainCache_ = null;

  this.invalidate(state, signal);
};


//endregion
//region --- Optimized props descriptors
/**
 * Simple properties descriptors.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.GridBase.prototype.SIMPLE_PROPS_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'stroke',
      anychart.core.settings.strokeNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'fill',
      anychart.core.settings.fillOrFunctionNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'drawFirstLine',
      anychart.core.settings.booleanNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'drawLastLine',
      anychart.core.settings.booleanNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'isMinor',
      anychart.core.settings.booleanNormalizer);

  return map;
})();
anychart.core.settings.populate(anychart.core.GridBase, anychart.core.GridBase.prototype.SIMPLE_PROPS_DESCRIPTORS);


/** @inheritDoc */
anychart.core.GridBase.prototype.enabled = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.ownSettings['enabled'] != opt_value) {
      this.ownSettings['enabled'] = opt_value;
      this.invalidate(anychart.ConsistencyState.ENABLED, this.getEnableChangeSignals());
      if (this.ownSettings['enabled']) {
        this.doubleSuspension = false;
        this.resumeSignalsDispatching(true);
      } else {
        if (isNaN(this.suspendedDispatching)) {
          this.suspendSignalsDispatching();
        } else {
          this.doubleSuspension = true;
        }
      }
    }
    return this;
  } else {
    return /** @type {boolean} */(this.getOption('enabled'));
  }
};


/** @inheritDoc */
anychart.core.GridBase.prototype.zIndex = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = +opt_value || 0;
    if (this.ownSettings['zIndex'] != val) {
      this.ownSettings['zIndex'] = val;
      this.invalidate(anychart.ConsistencyState.Z_INDEX, anychart.Signal.NEEDS_REDRAW | anychart.Signal.Z_INDEX_STATE_CHANGED);
    }
    return this;
  }
  return /** @type {number} */(goog.isDef(this.getOwnOption('zIndex')) ? this.getOwnOption('zIndex') : goog.isDef(this.autoZIndex) ? this.autoZIndex : this.getOption('zIndex'));
};


//endregion
//region --- Palette
/**
 * Creates palette depending on passed value type.
 * @param {(anychart.palettes.RangeColors|anychart.palettes.DistinctColors|Object|Array.<string>)} palette
 * @private
 */
anychart.core.GridBase.prototype.checkSetupPalette_ = function(palette) {
  if (anychart.utils.instanceOf(palette, anychart.palettes.RangeColors) || (goog.isObject(palette) && palette['type'] == 'range')) {
    this.setupPalette_(anychart.palettes.RangeColors);
  } else if (anychart.utils.instanceOf(palette, anychart.palettes.DistinctColors) || goog.isObject(palette) || this.palette_ == null) {
    this.setupPalette_(anychart.palettes.DistinctColors);
  }
};


/**
 * Getter/setter for palette.
 * @param {(anychart.palettes.RangeColors|anychart.palettes.DistinctColors|Object|Array.<string>)=} opt_value .
 * @return {!(anychart.palettes.RangeColors|anychart.palettes.DistinctColors|anychart.core.GridBase)} .
 */
anychart.core.GridBase.prototype.palette = function(opt_value) {
  if (!this.palette_ && (!this.parent_ || this.themeSettings['palette'])) { // this is for map/elements/Grid.js to work properly
    var palette = this.themeSettings['palette'];
    this.checkSetupPalette_(palette);
    this.setupCreated('palette', this.palette_);
    this.palette_.restoreDefaults(false);
  }

  if (goog.isDef(opt_value)) {
    this.checkSetupPalette_(opt_value);
    this.palette_.setup(opt_value);
    return this;
  }
  return /** @type {!(anychart.palettes.RangeColors|anychart.palettes.DistinctColors)} */(this.palette_);
};


/**
 * @param {Function} cls Palette constructor.
 * @private
 */
anychart.core.GridBase.prototype.setupPalette_ = function(cls) {
  if (anychart.utils.instanceOf(this.palette_, cls)) {
    //do nothing
  } else {
    // we dispatch only if we replace existing palette.
    var doDispatch = !!this.palette_;
    goog.dispose(this.palette_);
    this.palette_ = new cls();
    this.palette_.listenSignals(this.paletteInvalidated_, this);
    if (doDispatch)
      this.invalidate(anychart.ConsistencyState.GRIDS_POSITION, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Internal palette invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.GridBase.prototype.paletteInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.GRIDS_POSITION, anychart.Signal.NEEDS_REDRAW);
  }
};


//endregion
//region --- Infrastructure
/**
 * Whether marker is horizontal
 * @return {boolean} If the marker is horizontal.
 */
anychart.core.GridBase.prototype.isHorizontal = function() {
  return this.layout() == anychart.enums.Layout.HORIZONTAL;
};


/**
 * Returns layout for axis.
 * @param {anychart.core.IAxis} axis .
 * @return {(anychart.enums.RadialGridLayout|anychart.enums.Layout)} Layout or this.
 */
anychart.core.GridBase.prototype.getLayoutByAxis = function(axis) {
  var axisOrientation = axis.orientation();
  var isHorizontal = (axisOrientation == anychart.enums.Orientation.LEFT || axisOrientation == anychart.enums.Orientation.RIGHT);
  return isHorizontal ? anychart.enums.Layout.HORIZONTAL : anychart.enums.Layout.VERTICAL;
};


/**
 * Layout normalizer.
 * @param {anychart.enums.Layout|anychart.enums.RadialGridLayout} layout .
 * @return {anychart.enums.Layout|anychart.enums.RadialGridLayout}
 */
anychart.core.GridBase.prototype.normalizeLayout = function(layout) {
  return anychart.enums.normalizeLayout(layout);
};


/**
 * Get/set grid layout.
 * @param {(anychart.enums.Layout|anychart.enums.RadialGridLayout)=} opt_value Grid layout.
 * @return {(anychart.enums.RadialGridLayout|anychart.enums.Layout|anychart.core.GridBase)} Layout or this.
 */
anychart.core.GridBase.prototype.layout = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var layout = this.normalizeLayout(opt_value);
    if (this.layout_ != layout) {
      this.layout_ = layout;
      this.autoScale_ = null;
      this.invalidate(anychart.ConsistencyState.GRIDS_POSITION,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else if (this.layout_) {
    return this.layout_;
  } else if (this.axis_) {
    return this.getLayoutByAxis(this.axis_);
  } else {
    return this.defaultLayout;
  }
};


/**
 * Set default layout.
 * @param {anychart.enums.Layout|anychart.enums.RadialGridLayout} value - Layout value.
 */
anychart.core.GridBase.prototype.setDefaultLayout = function(value) {
  var needInvalidate = !this.layout_ && this.defaultLayout != value;
  this.defaultLayout = value;
  if (needInvalidate) this.invalidate(anychart.ConsistencyState.GRIDS_POSITION);
};


/**
 * Sets the entry series belongs to.
 * @param {anychart.core.IChart|anychart.core.IPlot} chart Chart instance.
 */
anychart.core.GridBase.prototype.setOwner = function(chart) {
  this.owner_ = chart;
};


/**
 * Get the chart series belongs to.
 * @return {anychart.core.IChart|anychart.core.IPlot}
 */
anychart.core.GridBase.prototype.getOwner = function() {
  return this.owner_;
};


/**
 * Returns the most suitable scale
 * @return {anychart.scales.IXScale|anychart.scales.IGeoScale|!anychart.core.GridBase|null}
 */
anychart.core.GridBase.prototype.resolveScale = function() {
  if (this.scale_)
    return this.scale_;

  else if (this.axis_)
    return /** @type {?anychart.scales.Base} */ (this.axis_.scale());

  return this.autoScale_;
};


/**
 * Sets default scale
 * @param {(anychart.scales.IXScale|anychart.scales.IGeoScale|anychart.stockModule.scales.Scatter|anychart.scales.Base)} value Scale.
 */
anychart.core.GridBase.prototype.setAutoScale = function(value) {
  this.setupScale(true, value);
};


/**
 * Applies scale settings to scale property (this.scale_ or this.autoScale_)
 * @param {boolean} useAutoScale
 * @param {(anychart.scales.IXScale|anychart.scales.IGeoScale|anychart.stockModule.scales.Scatter|anychart.scales.Base)=} opt_value Scale.
 * @return {anychart.scales.IXScale|anychart.scales.IGeoScale|anychart.stockModule.scales.Scatter|anychart.scales.Base|null} Scale for method chaining.
 */
anychart.core.GridBase.prototype.setupScale = function(useAutoScale, opt_value) {
  var scaleProperty = useAutoScale ? this.autoScale_ : this.scale_;
  if (goog.isDef(opt_value)) {
    var scType = opt_value && goog.isFunction(opt_value.getType) && opt_value.getType();
    var stockScale = (scType == anychart.enums.ScaleTypes.STOCK_SCATTER_DATE_TIME) || (scType == anychart.enums.ScaleTypes.STOCK_ORDINAL_DATE_TIME);
    var val = /** @type {anychart.stockModule.scales.Scatter|anychart.scales.Base} */(stockScale ?
        (opt_value == scaleProperty ? null : opt_value) :
        anychart.scales.Base.setupScale(scaleProperty, opt_value, null, anychart.scales.Base.ScaleTypes.ALL_DEFAULT, null, this.scaleInvalidated, this));
    if (val || (goog.isNull(opt_value) && scaleProperty)) {
      var dispatch = scaleProperty == val;
      if (!val)
        scaleProperty.unlistenSignals(this.scaleInvalidated, this);

      scaleProperty = /** @type {anychart.stockModule.scales.Scatter|anychart.scales.Base} */(val);
      useAutoScale ? this.autoScale_ = scaleProperty : this.scale_ = scaleProperty;

      if (val && !stockScale)
        val.resumeSignalsDispatching(dispatch);
      if (!dispatch)
        this.invalidate(
            anychart.ConsistencyState.BOUNDS |
            anychart.ConsistencyState.APPEARANCE,
            anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
  }

  return scaleProperty;
};


/**
 * Getter/setter for scale.
 * @param {(anychart.scales.IXScale|anychart.scales.IGeoScale|anychart.stockModule.scales.Scatter|anychart.scales.Base)=} opt_value Scale.
 * @return {anychart.scales.IXScale|anychart.scales.IGeoScale|!anychart.core.GridBase} Axis scale or itself for method chaining.
 */
anychart.core.GridBase.prototype.scale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.setupScale(false, opt_value);
    return this;
  }

  return this.resolveScale();
};


/**
 * Internal scale invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @protected
 */
anychart.core.GridBase.prototype.scaleInvalidated = goog.nullFunction;


/**
 * Sets axis.
 * @param {anychart.core.IAxis=} opt_value - Value to be set.
 * @return {(anychart.core.IAxis|anychart.core.GridBase)} - Current value or itself for method chaining.
 */
anychart.core.GridBase.prototype.axis = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.axis_ != opt_value) {
      if (this.axis_) this.axis_.unlistenSignals(this.axisInvalidated, this);
      this.axis_ = opt_value;
      /** @type {anychart.core.Base} */(this.axis_).listenSignals(this.axisInvalidated, this);
      this.invalidate(anychart.ConsistencyState.GRIDS_POSITION,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.axis_;
};


/**
 * Axis invalidation handler.
 * @param {anychart.SignalEvent} event - Event object.
 * @protected
 */
anychart.core.GridBase.prototype.axisInvalidated = function(event) {
  this.invalidate(anychart.ConsistencyState.GRIDS_POSITION | anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
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
anychart.core.GridBase.prototype.axesLinesSpace = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  if (!this.axesLinesSpace_) {
    this.axesLinesSpace_ = new anychart.core.utils.Padding();
  }

  if (goog.isDef(opt_spaceOrTopOrTopAndBottom)) {
    this.axesLinesSpace_.setup.apply(this.axesLinesSpace_, arguments);
    return this;
  } else {
    return this.axesLinesSpace_;
  }
};


//endregion
//region --- Coloring
/**
 * Creates and returns fill path.
 * @return {acgraph.vector.Path}
 */
anychart.core.GridBase.prototype.createFillElement = function() {
  var path = acgraph.path();
  path
      .parent(/** @type {acgraph.vector.ILayer} */(this.container()))
      .zIndex(/** @type {number} */(this.zIndex()))
      .stroke('none');
  return path;
};


/**
 * Clearing fills cache elements.
 */
anychart.core.GridBase.prototype.clearFillElements = function() {
  goog.object.forEach(this.fillMap, function(value, key) {
    value.clear();
  });
};


/**
 * Returns fill path element.
 * @param {number} index .
 * @return {acgraph.vector.Path}
 */
anychart.core.GridBase.prototype.getFillElement = function(index) {
  var fill = /** @type {acgraph.vector.Fill|Function} */(this.getOption('fill'));
  var fill_, result;
  if (goog.isFunction(fill)) {
    var context = {
      'index': index,
      'grid': this,
      'palette': this.palette() || this.parent_.palette()
    };

    fill_ = fill.call(context);
  } else {
    fill_ = fill;
  }

  result = index in this.fillMap ? this.fillMap[index.toString()] : (this.fillMap[index.toString()] = this.createFillElement());
  result.fill(/** @type {acgraph.vector.Fill} */(fill_));

  return result;
};


//endregion
//region --- Elements creation
/**
 * Creates/gets line element.
 * @param {boolean=} opt_isMajor .
 * @return {!acgraph.vector.Path} Grid line element.
 */
anychart.core.GridBase.prototype.lineElement = function(opt_isMajor) {
  this.lineElementInternal = /** @type {!acgraph.vector.Path} */(this.lineElementInternal ?
      this.lineElementInternal :
      acgraph.path());
  return this.lineElementInternal;
};


//endregion
//region --- Drawing
/**
 * Draw horizontal line.
 * @param {number} ratio Scale ratio to draw grid line.
 * @param {number} shift Grid line pixel shift.
 * @protected
 */
anychart.core.GridBase.prototype.drawLineHorizontal = goog.abstractMethod;


/**
 * Draw vertical line.
 * @param {number} ratio Scale ratio to draw grid line.
 * @param {number} shift Grid line pixel shift.
 * @protected
 */
anychart.core.GridBase.prototype.drawLineVertical = goog.abstractMethod;


/**
 * Draw horizontal line.
 * @param {number} ratio Scale ratio to draw grid interlace.
 * @param {number} prevRatio Previous scale ratio to draw grid interlace.
 * @param {acgraph.vector.Path} path Layer to draw interlace.
 * @param {number} shift Grid line pixel shift.
 * @protected
 */
anychart.core.GridBase.prototype.drawInterlaceHorizontal = goog.abstractMethod;


/**
 * Draw horizontal line.
 * @param {number} ratio Scale ratio to draw grid interlace.
 * @param {number} prevRatio Previous scale ratio to draw grid interlace.
 * @param {acgraph.vector.Path} path Layer to draw interlace.
 * @param {number} shift Grid line pixel shift.
 * @protected
 */
anychart.core.GridBase.prototype.drawInterlaceVertical = goog.abstractMethod;


/**
 * Check scale available.
 * @return {boolean}
 */
anychart.core.GridBase.prototype.checkScale = function() {
  var scale = /** @type {anychart.scales.Linear|anychart.scales.Ordinal} */(this.scale());

  if (!scale)
    anychart.core.reporting.error(anychart.enums.ErrorCode.SCALE_NOT_SET);

  return !!scale;
};


/**
 * Grid lines and interlace drawing.
 */
anychart.core.GridBase.prototype.drawInternal = function() {
  var scale = /** @type {anychart.scales.Linear|anychart.scales.Ordinal} */(this.scale());

  var layout;
  var path;
  var ratio;
  var prevRatio = NaN;
  var isOrdinal = anychart.utils.instanceOf(scale, anychart.scales.Ordinal);
  var ticks = isOrdinal ? scale.ticks() : this.getOption('isMinor') ? scale.minorTicks() : scale.ticks();
  var ticksArray = ticks.get();

  if (this.isHorizontal()) {
    layout = [this.drawLineHorizontal, this.drawInterlaceHorizontal];
  } else {
    layout = [this.drawLineVertical, this.drawInterlaceVertical];
  }

  this.clearFillElements();
  this.lineElement().clear();

  var bounds = /** @type {anychart.math.Rect} */(this.parentBounds() || anychart.math.rect(0, 0, 0, 0));
  var mode3d = this.owner_ && this.owner_.isMode3d();
  var strokeThickness = anychart.utils.extractThickness(/** @type {acgraph.vector.Stroke|string} */(this.getOption('stroke')));
  if (mode3d) {
    var owner = /** @type {anychart.cartesian3dModule.Chart} */(this.owner_);
    this.x3dShift = owner.x3dShift;
    this.y3dShift = owner.y3dShift;

    bounds.top -= this.y3dShift + strokeThickness / 2;
    bounds.height += this.y3dShift + strokeThickness / 2;
    bounds.width += this.x3dShift;
  }
  var clip = bounds.clone();
  // align clip to bottom tick
  clip.height = anychart.utils.applyPixelShift(clip.height, 1) + 0.5;
  // align right clip to right tick
  clip.width = anychart.utils.applyPixelShift(clip.width, 1) + 0.5;

  this.lineElement().clip(clip);

  var drawInterlace = layout[1];
  var drawLine = layout[0];

  var pixelShift = -this.lineElement().strokeThickness() % 2 / 2;

  // zeroTick
  if (mode3d && this.isHorizontal()) {
    ratio = scale.inverted() ? 1 : 0;
    drawLine.call(this, ratio, pixelShift);
  }

  for (var i = 0, count = ticksArray.length; i < count; i++) {
    var tickVal = ticksArray[i];
    if (goog.isArray(tickVal)) tickVal = tickVal[0];
    var subRangeRatio = (isOrdinal && scale.mode() == anychart.enums.OrdinalScaleMode.CONTINUOUS) ? 0.5 : 0;
    ratio = scale.transform(tickVal, subRangeRatio);
    /*
    Fix for logarithmic scale, because sometimes it returns nonzero ratio for
    scale.minimum() value like this: "7.230440002281568e-8" or this "-1.0641554004653386e-7"
    This leads to missing first tick or problems with pixel shift when yAxis tick,
    or grid line in {value == scale.minimum()} is drawn one pixel above xAxis.
    */
    if (scale.getType() == 'log') {
      ratio = anychart.math.round(ratio, 6);
    }

    if (i) {
      path = this.getFillElement(i - 1);
      if (path) {
        drawInterlace.call(this, ratio, prevRatio, path, pixelShift);
      }
    }

    if (!i) {
      if (this.getOption('drawFirstLine'))
        drawLine.call(this, ratio, pixelShift);
    } else if (i == count - 1) {
      if (this.getOption('drawLastLine') || isOrdinal)
        drawLine.call(this, ratio, pixelShift);
    } else {
      drawLine.call(this, ratio, pixelShift);
    }

    prevRatio = ratio;
  }

  if (isOrdinal && goog.isDef(tickVal)) {
    ratio = scale.inverted() ? 0 : 1;
    if (this.getOption('drawLastLine')) drawLine.call(this, ratio, pixelShift);
    path = this.getFillElement(i - 1);
    if (path) {
      drawInterlace.call(this, ratio, prevRatio, path, pixelShift);
    }
  }
};


/**
 * Applying appearance.
 */
anychart.core.GridBase.prototype.applyAppearance = function() {
  this.lineElement().stroke(/** @type {acgraph.vector.Stroke} */(this.getOption('stroke')));
};


/**
 * Something that will be doing before drawing.
 */
anychart.core.GridBase.prototype.beforeDraw = goog.nullFunction;


/**
 * Applying container.
 */
anychart.core.GridBase.prototype.applyContainer = function() {
  var container = /** @type {acgraph.vector.ILayer} */(this.container());
  this.lineElement().parent(container);
  goog.object.forEach(this.fillMap, function(path, key, obj) {
    path.parent(container);
  });
};


/**
 * Applying z-index
 */
anychart.core.GridBase.prototype.applyZIndex = function() {
  var zIndex = /** @type {number} */(this.zIndex());
  this.lineElement().zIndex(zIndex + 0.03);
  goog.object.forEach(this.fillMap, function(path, key, obj) {
    path.zIndex(zIndex);
  });
};


/**
 * Drawing.
 * @return {anychart.core.GridBase} An instance of {@link anychart.core.GridBase} class for method chaining.
 */
anychart.core.GridBase.prototype.draw = function() {
  if (!this.checkScale() || !this.checkDrawingNeeded())
    return this;

  this.beforeDraw();

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    this.applyAppearance();
    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.GRIDS_POSITION | anychart.ConsistencyState.BOUNDS)) {
    this.drawInternal();
    this.markConsistent(anychart.ConsistencyState.GRIDS_POSITION | anychart.ConsistencyState.BOUNDS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    this.applyZIndex();
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    this.applyContainer();
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  return this;
};


/** @inheritDoc */
anychart.core.GridBase.prototype.remove = function() {
  this.lineElement().parent(null);
  goog.object.forEach(this.fillMap, function(path, key, obj) {
    path.parent(null);
  });
};


//endregion
//region --- Serialization
/**
 * Sets default settings.
 * @param {!Object} config
 */
anychart.core.GridBase.prototype.setThemeSettings = function(config) {
  anychart.core.settings.copy(this.themeSettings, this.SIMPLE_PROPS_DESCRIPTORS, config);
};


/** @inheritDoc */
anychart.core.GridBase.prototype.serialize = function() {
  var json = {};

  if (this.palette_)
    json['palette'] = this.palette_.serialize();

  var zIndex = anychart.core.Base.prototype.getOption.call(this, 'zIndex');
  if (goog.isDef(zIndex))
    json['zIndex'] = zIndex;

  var enabled = anychart.core.Base.prototype.getOption.call(this, 'enabled');
  json['enabled'] = goog.isDef(enabled) ? enabled : null;

  anychart.core.settings.serialize(this, this.SIMPLE_PROPS_DESCRIPTORS, json, 'Map grids props');

  return json;
};


/** @inheritDoc */
anychart.core.GridBase.prototype.setupByJSON = function(config, opt_default) {
  if ('axis' in config) {
    var ax = config['axis'];
    if (goog.isNumber(ax)) {
      if (this.owner_) {
        this.axis((/** @type {anychart.core.CartesianBase} */(this.owner_)).getAxisByIndex(ax));
      }
    } else if (anychart.utils.instanceOf(ax, anychart.core.Axis)) {
      this.axis(ax);
    }
  }

  if (config['palette'])
    this.palette(config['palette']);

  if (opt_default) {
    this.setThemeSettings(config);
  } else {
    anychart.core.settings.deserialize(this, this.SIMPLE_PROPS_DESCRIPTORS, config);
    anychart.core.GridBase.base(this, 'setupByJSON', config);
  }
};


//----------------------------------------------------------------------------------------------------------------------
//  Disposing.
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.GridBase.prototype.disposeInternal = function() {
  this.axis_ = null;
  this.owner_ = null;

  for (var key in this.fillMap) {
    goog.dispose(this.fillMap[key]);
  }
  this.fillMap = null;

  goog.disposeAll(this.palette_, this.axesLinesSpace_, this.lineElementInternal);
  this.palette_ = null;
  this.axesLinesSpace_ = null;
  this.lineElementInternal = null;

  anychart.core.GridBase.base(this, 'disposeInternal');
};


//endregion
//region --- Exports
(function() {
  var proto = anychart.core.GridBase.prototype;
  proto['enabled'] = proto.enabled;
  proto['palette'] = proto.palette;
  // proto['zIndex'] = proto.zIndex;
  // proto['stroke'] = proto.stroke;
  // proto['drawFirstLine'] = proto.drawFirstLine;
  // proto['drawLastLine'] = proto.drawLastLine;
  // proto['fill'] = proto.fill;
})();
//endregion
