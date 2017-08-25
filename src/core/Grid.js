goog.provide('anychart.core.Grid');
goog.provide('anychart.standalones.grids.Linear');
goog.require('acgraph');
goog.require('anychart.color');
goog.require('anychart.core.IStandaloneBackend');
goog.require('anychart.core.VisualBase');
goog.require('anychart.core.reporting');
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
anychart.core.Grid = function() {
  anychart.core.Grid.base(this, 'constructor');

  /**
   * Parent title.
   * @type {anychart.mapModule.elements.GridSettings}
   * @private
   */
  this.parent_ = null;

  /**
   * @type {acgraph.vector.Path}
   * @protected
   */
  this.lineElementInternal = null;

  /**
   * Resolution chain cache.
   * @type {?Array.<Object|null|undefined>}
   * @private
   */
  this.resolutionChainCache_ = null;

  /**
   * @type {anychart.scales.Base}
   * @private
   */
  this.scale_ = null;

  /**
   * @type {boolean}
   * @private
   */
  this.isMinor_ = false;

  /**
   * @type {anychart.enums.Layout}
   * @private
   */
  this.layout_;

  /**
   * Assigned axis.
   * @type {anychart.core.Axis}
   * @private
   */
  this.axis_ = null;

  /**
   * Palette for series colors.
   * @type {anychart.palettes.RangeColors|anychart.palettes.DistinctColors}
   * @private
   */
  this.palette_ = null;

  /**
   *
   * @type {Object.<string, acgraph.vector.Path>}
   * @private
   */
  this.fillMap = {};

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['stroke', anychart.ConsistencyState.APPEARANCE],
    ['fill', anychart.ConsistencyState.BOUNDS],
    ['drawFirstLine', anychart.ConsistencyState.GRIDS_POSITION],
    ['drawLastLine', anychart.ConsistencyState.GRIDS_POSITION]
  ]);
};
goog.inherits(anychart.core.Grid, anychart.core.VisualBase);


//region --- Internal properties
/**
 * Supported signals.
 * @type {number}
 */
anychart.core.Grid.prototype.SUPPORTED_SIGNALS =
    anychart.core.VisualBase.prototype.SUPPORTED_SIGNALS |
        anychart.Signal.BOUNDS_CHANGED |
        anychart.Signal.ENABLED_STATE_CHANGED |
        anychart.Signal.Z_INDEX_STATE_CHANGED;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.Grid.prototype.SUPPORTED_CONSISTENCY_STATES =
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
anychart.core.Grid.prototype.getOption = anychart.core.settings.getOption;


/** @inheritDoc */
anychart.core.Grid.prototype.getSignal = function(fieldName) {
  // all properties invalidates with NEEDS_REDRAW;
  return anychart.Signal.NEEDS_REDRAW;
};


//endregion
//region --- IResolvable implementation
/** @inheritDoc */
anychart.core.Grid.prototype.resolutionChainCache = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.resolutionChainCache_ = opt_value;
  }
  return this.resolutionChainCache_;
};


/** @inheritDoc */
anychart.core.Grid.prototype.getResolutionChain = anychart.core.settings.getResolutionChain;


/** @inheritDoc */
anychart.core.Grid.prototype.getLowPriorityResolutionChain = function() {
  var sett = [this.themeSettings];
  if (this.parent_) {
    sett = goog.array.concat(sett, this.parent_.getLowPriorityResolutionChain());
  }
  return sett;
};


/** @inheritDoc */
anychart.core.Grid.prototype.getHighPriorityResolutionChain = function() {
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
 * @param {anychart.core.GridSettings=} opt_value - Value to set.
 * @return {anychart.core.GridSettings|anychart.core.Grid} - Current value or itself for method chaining.
 */
anychart.core.Grid.prototype.parent = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.parent_ != opt_value) {
      if (this.parent_)
        this.parent_.unlistenSignals(this.parentInvalidated_, this);
      this.parent_ = opt_value;
      if (this.parent_)
        this.parent_.listenSignals(this.parentInvalidated_, this);
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
anychart.core.Grid.prototype.parentInvalidated_ = function(e) {
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
anychart.core.Grid.prototype.SIMPLE_PROPS_DESCRIPTORS = (function() {
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
      'minorStroke',
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

  return map;
})();
anychart.core.settings.populate(anychart.core.Grid, anychart.core.Grid.prototype.SIMPLE_PROPS_DESCRIPTORS);


/** @inheritDoc */
anychart.core.Grid.prototype.enabled = function(opt_value) {
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
anychart.core.Grid.prototype.zIndex = function(opt_value) {
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
 * Getter/setter for palette.
 * @param {(anychart.palettes.RangeColors|anychart.palettes.DistinctColors|Object|Array.<string>)=} opt_value .
 * @return {!(anychart.palettes.RangeColors|anychart.palettes.DistinctColors|anychart.core.Grid)} .
 */
anychart.core.Grid.prototype.palette = function(opt_value) {
  if (opt_value instanceof anychart.palettes.RangeColors) {
    this.setupPalette_(anychart.palettes.RangeColors, opt_value);
    return this;
  } else if (opt_value instanceof anychart.palettes.DistinctColors) {
    this.setupPalette_(anychart.palettes.DistinctColors, opt_value);
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
anychart.core.Grid.prototype.setupPalette_ = function(cls, opt_cloneFrom) {
  if (this.palette_ instanceof cls) {
    if (opt_cloneFrom)
      this.palette_.setup(opt_cloneFrom);
  } else {
    // we dispatch only if we replace existing palette.
    var doDispatch = !!this.palette_;
    goog.dispose(this.palette_);
    this.palette_ = new cls();
    if (opt_cloneFrom)
      this.palette_.setup(opt_cloneFrom);
    this.palette_.listenSignals(this.paletteInvalidated_, this);
    this.registerDisposable(this.palette_);
    if (doDispatch)
      this.invalidate(anychart.ConsistencyState.GRIDS_POSITION, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Internal palette invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.Grid.prototype.paletteInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.GRIDS_POSITION, anychart.Signal.NEEDS_REDRAW);
  }
};


//endregion
//region --- Infrastructure
/**
 * Sets the chart series belongs to.
 * @param {anychart.core.SeparateChart} chart Chart instance.
 */
anychart.core.Grid.prototype.setChart = function(chart) {
  this.chart_ = chart;
};


/**
 * Get the chart series belongs to.
 * @return {anychart.core.SeparateChart}
 */
anychart.core.Grid.prototype.getChart = function() {
  return this.chart_;
};


/**
 * Get/set grid layout.
 * @param {anychart.enums.Layout=} opt_value Grid layout.
 * @return {anychart.enums.Layout|anychart.core.Grid} Layout or this.
 */
anychart.core.Grid.prototype.layout = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.layout_ = opt_value;
    return this;
  } else {
    return this.layout_;
  }
};


//endregion


//----------------------------------------------------------------------------------------------------------------------
//  Scale.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for scale.
 * @param {anychart.scales.Base=} opt_value Scale.
 * @return {anychart.scales.Base|!anychart.core.Grid} Axis scale or itself for method chaining.
 */
anychart.core.Grid.prototype.scale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.scale_ != opt_value) {
      this.scale_ = opt_value;
      this.scale_.listenSignals(this.scaleInvalidated_, this);
      this.invalidate(anychart.ConsistencyState.GRIDS_POSITION | anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    if (this.scale_) {
      return this.scale_;
    } else {
      if (this.axis_)
        return /** @type {?anychart.scales.Base} */ (this.axis_.scale());
      return null;
    }
  }
};


/**
 * Internal scale invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.Grid.prototype.scaleInvalidated_ = function(event) {
  var signal = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION))
    signal |= anychart.Signal.NEEDS_RECALCULATION;
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION))
    signal |= anychart.Signal.NEEDS_REDRAW;

  signal |= anychart.Signal.BOUNDS_CHANGED;

  var state = anychart.ConsistencyState.BOUNDS |
      anychart.ConsistencyState.APPEARANCE;

  this.invalidate(state, signal);
};


//----------------------------------------------------------------------------------------------------------------------
//  Axis.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Sets axis.
 * @param {anychart.core.Axis=} opt_value - Value to be set.
 * @return {(anychart.core.Axis|anychart.core.Grid)} - Current value or itself for method chaining.
 */
anychart.core.Grid.prototype.axis = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.axis_ != opt_value) {
      if (this.axis_) this.axis_.unlistenSignals(this.axisInvalidated_, this);
      this.axis_ = opt_value;
      this.axis_.listenSignals(this.axisInvalidated_, this);
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
 * @private
 */
anychart.core.Grid.prototype.axisInvalidated_ = function(event) {
  this.invalidate(anychart.ConsistencyState.GRIDS_POSITION, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
};


//----------------------------------------------------------------------------------------------------------------------
//  Bounds.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Axes lines space.
 * @param {(string|number|anychart.core.utils.Space)=} opt_spaceOrTopOrTopAndBottom Space object or top or top and bottom
 *    space.
 * @param {(string|number)=} opt_rightOrRightAndLeft Right or right and left space.
 * @param {(string|number)=} opt_bottom Bottom space.
 * @param {(string|number)=} opt_left Left space.
 * @return {!(anychart.core.VisualBase|anychart.core.utils.Padding)} .
 */
anychart.core.Grid.prototype.axesLinesSpace = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
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


//region --- Coloring
/**
 * Creates and returns fill path.
 * @return {acgraph.vector.Path}
 */
anychart.core.Grid.prototype.createFillElement = function() {
  var path = acgraph.path();
  path
      .parent(/** @type {acgraph.vector.ILayer} */(this.container()))
      .zIndex(/** @type {number} */(this.zIndex()))
      .stroke('none');
  this.registerDisposable(path);
  return path;
};


/**
 * Clearing fills cache elements.
 */
anychart.core.Grid.prototype.clearFillElements = function() {
  goog.object.forEach(this.fillMap, function(value, key) {
    value.clear();
  });
};


/**
 * Returns fill path element.
 * @param {number} index .
 * @return {acgraph.vector.Path}
 */
anychart.core.Grid.prototype.getFillElement = function(index) {
  var fill = /** @type {acgraph.vector.Fill|function} */(this.fill_);
  var fill_, result, hashFill;
  if (goog.isFunction(fill)) {
    var context = {
      'index': index,
      'grid': this,
      'palette': this.palette_ || this.parent_.palette(),
      'sourceColor': 'blue'
    };

    fill_ = fill.call(context);
  } else {
    fill_ = fill;
  }

  var sFill = anychart.color.serialize(fill_);
  hashFill = goog.isString(sFill) ? sFill : JSON.stringify(sFill);
  result = hashFill in this.fillMap ? this.fillMap[hashFill] : (this.fillMap[hashFill] = this.createFillElement());
  result.fill(fill_);

  return result;
};


//endregion


//----------------------------------------------------------------------------------------------------------------------
//
//  Line drawing.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Draw horizontal line.
 * @param {number} ratio Scale ratio to draw grid line.
 * @param {number} shift Grid line pixel shift.
 * @protected
 */
anychart.core.Grid.prototype.drawLineHorizontal = function(ratio, shift) {
  var parentBounds = this.parentBounds() || anychart.math.rect(0, 0, 0, 0);
  /** @type {number}*/
  var y = Math.round(parentBounds.getBottom() - ratio * parentBounds.height);
  ratio == 1 ? y -= shift : y += shift;
  this.lineElementInternal.moveTo(parentBounds.getLeft(), y);
  this.lineElementInternal.lineTo(parentBounds.getRight(), y);
};


/**
 * Draw vertical line.
 * @param {number} ratio Scale ratio to draw grid line.
 * @param {number} shift Grid line pixel shift.
 * @protected
 */
anychart.core.Grid.prototype.drawLineVertical = function(ratio, shift) {
  var parentBounds = this.parentBounds() || anychart.math.rect(0, 0, 0, 0);
  /** @type {number}*/
  var x = Math.round(parentBounds.getLeft() + ratio * parentBounds.width);
  ratio == 1 ? x += shift : x -= shift;
  this.lineElementInternal.moveTo(x, parentBounds.getBottom());
  this.lineElementInternal.lineTo(x, parentBounds.getTop());
};


/**
 * Whether marker is horizontal
 * @return {boolean} If the marker is horizontal.
 */
anychart.core.Grid.prototype.isHorizontal = function() {
  return this.layout() == anychart.enums.Layout.HORIZONTAL;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Interlaced drawing.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Draw horizontal line.
 * @param {number} ratio Scale ratio to draw grid interlace.
 * @param {number} prevRatio Previous scale ratio to draw grid interlace.
 * @param {acgraph.vector.Path} path Layer to draw interlace.
 * @param {number} shift Grid line pixel shift.
 * @protected
 */
anychart.core.Grid.prototype.drawInterlaceHorizontal = goog.abstractMethod;


/**
 * Draw horizontal line.
 * @param {number} ratio Scale ratio to draw grid interlace.
 * @param {number} prevRatio Previous scale ratio to draw grid interlace.
 * @param {acgraph.vector.Path} path Layer to draw interlace.
 * @param {number} shift Grid line pixel shift.
 * @protected
 */
anychart.core.Grid.prototype.drawInterlaceVertical = goog.abstractMethod;


//----------------------------------------------------------------------------------------------------------------------
//  Drawing.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Drawing.
 * @return {anychart.core.Grid} An instance of {@link anychart.core.Grid} class for method chaining.
 */
anychart.core.Grid.prototype.draw = function() {
  var scale = /** @type {anychart.scales.Linear|anychart.scales.Ordinal} */(this.scale());

  if (!scale) {
    anychart.core.reporting.error(anychart.enums.ErrorCode.SCALE_NOT_SET);
    return this;
  }

  if (!this.checkDrawingNeeded())
    return this;

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    var zIndex = /** @type {number} */(this.zIndex());
    this.lineElement().zIndex(zIndex);
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    var container = /** @type {acgraph.vector.ILayer} */(this.container());
    this.lineElement().parent(container);
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    this.lineElement().stroke(/** @type {acgraph.vector.Stroke} */(this.stroke()));
    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.GRIDS_POSITION) ||
      this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    var layout;
    var path;
    var ratio;
    var prevRatio = NaN;
    var isOrdinal = this.scale() instanceof anychart.scales.Ordinal;
    var ticks = isOrdinal ? scale.ticks() : this.isMinor() ? scale.minorTicks() : scale.ticks();
    var ticksArray = ticks.get();

    if (this.isHorizontal()) {
      layout = [this.drawLineHorizontal, this.drawInterlaceHorizontal];
    } else {
      layout = [this.drawLineVertical, this.drawInterlaceVertical];
    }

    this.clearFillElements();
    this.lineElement().clear();

    var bounds = this.parentBounds() || anychart.math.rect(0, 0, 0, 0);
    var mode3d = this.chart_ && this.chart_.isMode3d();
    if (mode3d) {
      this.x3dShift = this.getChart().x3dShift;
      this.y3dShift = this.getChart().y3dShift;

      var strokeThickness = acgraph.vector.getThickness(/** @type {acgraph.vector.Stroke} */(this.stroke())) / 2;
      bounds.top -= this.y3dShift + strokeThickness;
      bounds.height += this.y3dShift + strokeThickness;
      bounds.width += this.x3dShift;
    }
    var axesLinesSpace = this.axesLinesSpace();
    var clip = axesLinesSpace.tightenBounds(/** @type {!anychart.math.Rect} */(bounds));

    this.lineElement().clip(clip);

    var drawInterlace = layout[1];
    var drawLine = layout[0];

    var pixelShift = -this.lineElement().strokeThickness() % 2 / 2;

    // zeroTick
    if (mode3d && this.isHorizontal()) {
      drawLine.call(this, 0, pixelShift);
    }

    for (var i = 0, count = ticksArray.length; i < count; i++) {
      var tickVal = ticksArray[i];
      if (goog.isArray(tickVal)) tickVal = tickVal[0];
      ratio = scale.transform(tickVal);

      path = this.getFillElement(i);
      if (path) {
        drawInterlace.call(this, ratio, prevRatio, path, pixelShift);
      }

      if (!i) {
        if (this.drawFirstLine_)
          drawLine.call(this, ratio, pixelShift);
      } else if (i == count - 1) {
        if (this.drawLastLine_ || isOrdinal)
          drawLine.call(this, ratio, pixelShift);
      } else {
        drawLine.call(this, ratio, pixelShift);
      }

      prevRatio = ratio;
    }

    if (isOrdinal && goog.isDef(tickVal)) {
      if (this.drawLastLine_) drawLine.call(this, 1, pixelShift);
      path = this.getFillElement(i);
      if (path) {
        drawInterlace.call(this, 1, ratio, path, pixelShift);
      }
    }

    this.markConsistent(anychart.ConsistencyState.GRIDS_POSITION);
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  return this;
};


//----------------------------------------------------------------------------------------------------------------------
//  Disabling & enabling.
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.Grid.prototype.remove = function() {
  this.lineElement().parent(null);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Elements creation.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @return {!acgraph.vector.Path} Grid line element.
 */
anychart.core.Grid.prototype.lineElement = function() {
  this.lineElementInternal = this.lineElementInternal ? this.lineElementInternal : acgraph.path();
  this.registerDisposable(this.lineElementInternal);
  return this.lineElementInternal;
};


//----------------------------------------------------------------------------------------------------------------------
//  Serialize & Deserialize
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.Grid.prototype.serialize = function() {
  var json = anychart.core.Grid.base(this, 'serialize');
  json['isMinor'] = this.isMinor();
  if (this.layout_) json['layout'] = this.layout_;
  json['palette'] = this.palette().serialize();
  json['drawFirstLine'] = this.drawFirstLine();
  json['drawLastLine'] = this.drawLastLine();
  json['fill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill} */(this.fill()));
  json['stroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke} */(this.stroke()));
  return json;
};


/** @inheritDoc */
anychart.core.Grid.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.Grid.base(this, 'setupByJSON', config, opt_default);
  this.isMinor(config['isMinor']);
  if ('layout' in config && config['layout']) this.layout(config['layout']);
  this.palette(config['palette']);
  this.drawFirstLine(config['drawFirstLine']);
  this.drawLastLine(config['drawLastLine']);

  this.fill(config['fill']);
  this.stroke(config['stroke']);
  if ('axis' in config) {
    var ax = config['axis'];
    if (goog.isNumber(ax)) {
      if (this.chart_) {
        this.axis((/** @type {anychart.core.CartesianBase} */(this.chart_)).getAxisByIndex(ax));
      }
    } else if (ax instanceof anychart.core.Axis) {
      this.axis(ax);
    }
  }
};


//----------------------------------------------------------------------------------------------------------------------
//  Disposing.
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.Grid.prototype.disposeInternal = function() {
  delete this.stroke_;
  this.axis_ = null;
  this.chart_ = null;
  anychart.core.Grid.base(this, 'disposeInternal');
};



//region --- Standalone
//------------------------------------------------------------------------------
//
//  Standalone
//
//------------------------------------------------------------------------------
/**
 * @constructor
 * @extends {anychart.core.Grid}
 */
anychart.standalones.grids.Linear = function() {
  anychart.standalones.grids.Linear.base(this, 'constructor');
};
goog.inherits(anychart.standalones.grids.Linear, anychart.core.Grid);
anychart.core.makeStandalone(anychart.standalones.grids.Linear, anychart.core.Grid);


/**
 * Constructor function.
 * @return {!anychart.standalones.grids.Linear}
 */
anychart.standalones.grids.linear = function() {
  var grid = new anychart.standalones.grids.Linear();
  grid.setup(anychart.getFullTheme('standalones.linearGrid'));
  return grid;
};


//endregion
//exports
(function() {
  var proto = anychart.core.Grid.prototype;
  proto['isMinor'] = proto.isMinor;
  proto['palette'] = proto.palette;
  proto['fill'] = proto.fill;
  // proto['layout'] = proto.layout;
  proto['isHorizontal'] = proto.isHorizontal;
  proto['scale'] = proto.scale;
  proto['stroke'] = proto.stroke;
  proto['drawFirstLine'] = proto.drawFirstLine;
  proto['drawLastLine'] = proto.drawLastLine;
  proto['axis'] = proto.axis;

  proto = anychart.standalones.grids.Linear.prototype;
  goog.exportSymbol('anychart.standalones.grids.linear', anychart.standalones.grids.linear);
  proto['draw'] = proto.draw;
  proto['parentBounds'] = proto.parentBounds;
  proto['container'] = proto.container;
})();
