//region --- Requiring and Providing
goog.provide('anychart.core.grids.Map');

goog.require('acgraph');
goog.require('anychart.core.VisualBase');
goog.require('anychart.core.reporting');
goog.require('anychart.core.settings');
goog.require('anychart.enums');
//endregion



/**
 * Map axes settings.
 * @extends {anychart.core.VisualBase}
 * @implements {anychart.core.settings.IObjectWithSettings}
 * @implements {anychart.core.settings.IResolvable}
 * @constructor
 */
anychart.core.grids.Map = function() {
  anychart.core.grids.Map.base(this, 'constructor');

  /**
   * Theme settings.
   * @type {Object}
   */
  this.themeSettings = {};

  /**
   * Own settings (Settings set by user with API).
   * @type {Object}
   */
  this.ownSettings = {};

  /**
   * Parent title.
   * @type {anychart.core.grids.MapSettings}
   * @private
   */
  this.parent_ = null;

  /**
   * @type {acgraph.vector.Path}
   * @private
   */
  this.oddFillElement_ = null;

  /**
   * @type {acgraph.vector.Path}
   * @private
   */
  this.evenFillElement_ = null;

  /**
   * @type {acgraph.vector.Path}
   * @protected
   */
  this.lineElementInternal = null;

  /**
   * @type {acgraph.vector.Path}
   * @protected
   */
  this.minorLineElementInternal = null;

  /**
   * @type {anychart.scales.Geo}
   * @private
   */
  this.scale_ = null;

  /**
   * @type {anychart.enums.Layout}
   * @private
   */
  this.layout_;

  /**
   * Resolution chain cache.
   * @type {Array.<Object|null|undefined>|null}
   * @private
   */
  this.resolutionChainCache_ = null;
};
goog.inherits(anychart.core.grids.Map, anychart.core.VisualBase);


//region --- Internal properties
/**
 * Supported signals.
 * @type {number}
 */
anychart.core.grids.Map.prototype.SUPPORTED_SIGNALS =
    anychart.core.VisualBase.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.ENABLED_STATE_CHANGED |
    anychart.Signal.Z_INDEX_STATE_CHANGED;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.grids.Map.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.GRIDS_POSITION;


//endregion
//region --- IObjectWithSettings implementation
/** @inheritDoc */
anychart.core.grids.Map.prototype.getOwnOption = function(name) {
  return this.ownSettings[name];
};


/** @inheritDoc */
anychart.core.grids.Map.prototype.hasOwnOption = function(name) {
  return goog.isDef(this.ownSettings[name]);
};


/** @inheritDoc */
anychart.core.grids.Map.prototype.getThemeOption = function(name) {
  return this.themeSettings[name];
};


/** @inheritDoc */
anychart.core.grids.Map.prototype.getOption = anychart.core.settings.getOption;


/** @inheritDoc */
anychart.core.grids.Map.prototype.setOption = function(name, value) {
  this.ownSettings[name] = value;
};


/** @inheritDoc */
anychart.core.grids.Map.prototype.check = function(flags) {
  return true;
};


//endregion
//region --- IResolvable implementation
/** @inheritDoc */
anychart.core.grids.Map.prototype.resolutionChainCache = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.resolutionChainCache_ = opt_value;
  }
  return this.resolutionChainCache_;
};


/** @inheritDoc */
anychart.core.grids.Map.prototype.getResolutionChain = anychart.core.settings.getResolutionChain;


/** @inheritDoc */
anychart.core.grids.Map.prototype.getLowPriorityResolutionChain = function() {
  var sett = [this.themeSettings];
  if (this.parent_) {
    sett = goog.array.concat(sett, this.parent_.getLowPriorityResolutionChain());
  }
  return sett;
};


/** @inheritDoc */
anychart.core.grids.Map.prototype.getHighPriorityResolutionChain = function() {
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
 * @param {anychart.core.grids.MapSettings=} opt_value - Value to set.
 * @return {anychart.core.grids.MapSettings|anychart.core.grids.Map} - Current value or itself for method chaining.
 */
anychart.core.grids.Map.prototype.parent = function(opt_value) {
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
anychart.core.grids.Map.prototype.parentInvalidated_ = function(e) {
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
anychart.core.grids.Map.prototype.SIMPLE_PROPS_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  map[anychart.opt.STROKE] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      anychart.opt.STROKE,
      anychart.core.settings.strokeNormalizer,
      anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW);

  map[anychart.opt.MINOR_STROKE] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      anychart.opt.MINOR_STROKE,
      anychart.core.settings.strokeNormalizer,
      anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW);

  map[anychart.opt.ODD_FILL] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      anychart.opt.ODD_FILL,
      anychart.core.settings.fillNormalizer,
      anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW);

  map[anychart.opt.EVEN_FILL] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      anychart.opt.EVEN_FILL,
      anychart.core.settings.fillNormalizer,
      anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW);

  map[anychart.opt.DRAW_FIRST_LINE] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      anychart.opt.DRAW_FIRST_LINE,
      anychart.core.settings.booleanNormalizer,
      anychart.ConsistencyState.GRIDS_POSITION,
      anychart.Signal.NEEDS_REDRAW);

  map[anychart.opt.DRAW_LAST_LINE] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      anychart.opt.DRAW_LAST_LINE,
      anychart.core.settings.booleanNormalizer,
      anychart.ConsistencyState.GRIDS_POSITION,
      anychart.Signal.NEEDS_REDRAW);

  return map;
})();
anychart.core.settings.populate(anychart.core.grids.Map, anychart.core.grids.Map.prototype.SIMPLE_PROPS_DESCRIPTORS);


/** @inheritDoc */
anychart.core.grids.Map.prototype.enabled = function(opt_value) {
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
anychart.core.grids.Map.prototype.zIndex = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = +opt_value || 0;
    if (this.ownSettings[anychart.opt.Z_INDEX] != val) {
      this.ownSettings[anychart.opt.Z_INDEX] = val;
      this.invalidate(anychart.ConsistencyState.Z_INDEX, anychart.Signal.NEEDS_REDRAW | anychart.Signal.Z_INDEX_STATE_CHANGED);
    }
    return this;
  }
  return /** @type {number} */(goog.isDef(this.getOwnOption(anychart.opt.Z_INDEX)) ? this.getOwnOption(anychart.opt.Z_INDEX) : goog.isDef(this.autoZIndex) ? this.autoZIndex : this.getOption(anychart.opt.Z_INDEX));
};


//endregion
//region --- Settings
/**
 * Get/set grid layout.
 * @param {anychart.enums.Layout=} opt_value Grid layout.
 * @return {anychart.enums.Layout|anychart.core.grids.Map} Layout or this.
 */
anychart.core.grids.Map.prototype.layout = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.layout_ = opt_value;
    return this;
  } else {
    return this.layout_;
  }
};


/**
 * Setter for scale.
 * @param {anychart.scales.Geo} value Scale.
 * @return {anychart.core.grids.Map} .
 */
anychart.core.grids.Map.prototype.setScale = function(value) {
  if (this.scale_ != value) {
    this.scale_ = value;
    this.scale_.listenSignals(this.scaleInvalidated_, this);
    this.invalidate(anychart.ConsistencyState.GRIDS_POSITION | anychart.ConsistencyState.BOUNDS,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
  }
  return this;
};


/**
 * Internal scale invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.grids.Map.prototype.scaleInvalidated_ = function(event) {
  var signal = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION))
    signal |= anychart.Signal.NEEDS_RECALCULATION;
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION))
    signal |= anychart.Signal.NEEDS_REDRAW;

  var state = anychart.ConsistencyState.BOUNDS |
      anychart.ConsistencyState.APPEARANCE;

  this.invalidate(state, signal);
};


//endregion
//region --- Elements creation
//----------------------------------------------------------------------------------------------------------------------
//
//  Elements creation.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Creates/gets line element.
 * @param {boolean} isMajor .
 * @return {!acgraph.vector.Path} Grid line element.
 */
anychart.core.grids.Map.prototype.lineElement = function(isMajor) {
  var lineElement = isMajor ? this.lineElementInternal : this.minorLineElementInternal;

  if (!lineElement) {
    if (isMajor) {
      lineElement = this.lineElementInternal = /** @type {acgraph.vector.Path} */(acgraph.path());
    } else {
      lineElement = this.minorLineElementInternal = /** @type {acgraph.vector.Path} */(acgraph.path());
    }
    lineElement.disablePointerEvents(true).disableStrokeScaling(true);
    this.registerDisposable(lineElement);
  }
  return /** @type {!acgraph.vector.Path} */(lineElement);
};


/**
 * @return {!acgraph.vector.Path} Grid odd fill element.
 * @protected
 */
anychart.core.grids.Map.prototype.oddFillElement = function() {
  if (!this.oddFillElement_) {
    this.oddFillElement_ = acgraph.path();
    this.oddFillElement_.stroke('none');
    this.registerDisposable(this.oddFillElement_);
  }

  return this.oddFillElement_;
};


/**
 * @return {!acgraph.vector.Path} Grid event fill element.
 * @protected
 */
anychart.core.grids.Map.prototype.evenFillElement = function() {
  if (!this.evenFillElement_) {
    this.evenFillElement_ = acgraph.path();
    this.evenFillElement_.stroke('none');
    this.registerDisposable(this.evenFillElement_);
  }

  return this.evenFillElement_;
};


//endregion
//region --- Interactivity
/**
 * Update grid on zoom or move.
 * @param {goog.graphics.AffineTransform} tx .
 */
anychart.core.grids.Map.prototype.updateOnZoomOrMove = function(tx) {
  if (this.rootLayer_)
    this.rootLayer_.setTransformationMatrix(tx.getScaleX(), tx.getShearX(), tx.getShearY(), tx.getScaleY(), tx.getTranslateX(), tx.getTranslateY());
};


//endregion
//region --- Drawing
/**
 * Draw horizontal line.
 * @param {number} value Tick value to draw grid line.
 * @param {acgraph.vector.Path} line Line element for drawing.
 * @param {number} shift Grid line pixel shift.
 * @param {number} precision Grid precision.
 * @protected
 */
anychart.core.grids.Map.prototype.drawLineHorizontal = function(value, line, shift, precision) {
  var scale = this.scale_;
  var xy;

  var minimumX = /** @type {number} */(scale.minimumX());
  var maximumX = /** @type {number} */(scale.maximumX());

  // shift = value == maximumX ? -shift : shift;

  var currLong = minimumX;
  while (currLong < maximumX) {
    xy = scale.transform(currLong, value, null);
    if (currLong == minimumX) {
      line.moveTo(xy[0], xy[1]);
    } else {
      line.lineTo(xy[0], xy[1]);
    }
    currLong += precision;
  }
  xy = scale.transform(maximumX, value, null);
  line.lineTo(xy[0], xy[1] + shift);
};


/**
 * Draw vertical line.
 * @param {number} value Tick value to draw grid line.
 * @param {acgraph.vector.Path} line Line element for drawing.
 * @param {number} shift Grid line pixel shift.
 * @param {number} precision Grid precision.
 * @protected
 */
anychart.core.grids.Map.prototype.drawLineVertical = function(value, line, shift, precision) {
  var scale = this.scale_;
  var xy;

  var minimumY = /** @type {number} */(scale.minimumY());
  var maximumY = /** @type {number} */(scale.maximumY());

  // shift = value == maximumY ? shift : -shift;

  var currLat = minimumY;
  while (currLat < maximumY) {
    xy = scale.transform(value, currLat, null);
    if (currLat == minimumY) {
      line.moveTo(xy[0], xy[1]);
    } else {
      line.lineTo(xy[0], xy[1]);
    }
    currLat += precision;
  }
  xy = scale.transform(value, maximumY, null);
  line.lineTo(xy[0], xy[1]);
};


/**
 * Whether marker is horizontal
 * @return {boolean} If the marker is horizontal.
 */
anychart.core.grids.Map.prototype.isHorizontal = function() {
  return this.layout() == anychart.enums.Layout.HORIZONTAL;
};


/**
 * Draw horizontal line.
 * @param {number} value Tick value to draw grid interlace.
 * @param {number} prevValue Previous tick value to draw grid interlace.
 * @param {string} fillSettings Interlace fill settings.
 * @param {acgraph.vector.Path} path Layer to draw interlace.
 * @param {number} shift Grid line pixel shift.
 * @param {number} precision Grid precision.
 * @protected
 */
anychart.core.grids.Map.prototype.drawInterlaceHorizontal = function(value, prevValue, fillSettings, path, shift, precision) {
  var scale = this.scale_;

  var minimumX = /** @type {number} */(scale.minimumX());
  var maximumX = /** @type {number} */(scale.maximumX());
  var minimumY = /** @type {number} */(scale.minimumY());

  if (isNaN(prevValue) && value != minimumY) {
    prevValue = minimumY;
  }

  if (!isNaN(prevValue)) {
    var xy, currLong, currLat;

    shift = value == maximumX ? -shift : shift;
    var prevShift = prevValue == maximumX ? -shift : shift;

    currLong = minimumX;
    while (currLong < maximumX) {
      xy = scale.transform(currLong, value, null);
      if (currLong == minimumX) {
        path.moveTo(xy[0], xy[1] + prevShift);
      } else {
        path.lineTo(xy[0], xy[1] + prevShift);
      }
      currLong += precision;
    }
    xy = scale.transform(maximumX, value, null);
    path.lineTo(xy[0], xy[1] + shift);


    currLat = value;
    while (currLat > prevValue) {
      xy = scale.transform(maximumX, currLat, null);
      path.lineTo(xy[0], xy[1] + shift);
      currLat -= precision;
    }
    xy = scale.transform(maximumX, prevValue, null);
    path.lineTo(xy[0], xy[1]);


    currLong = maximumX;
    while (currLong > minimumX) {
      xy = scale.transform(currLong, prevValue, null);
      path.lineTo(xy[0], xy[1] + shift);
      currLong -= precision;
    }
    xy = scale.transform(minimumX, prevValue, null);
    path.lineTo(xy[0], xy[1]);


    currLat = prevValue;
    while (currLat < value) {
      xy = scale.transform(minimumX, currLat, null);
      path.lineTo(xy[0], xy[1] + shift);
      currLat += precision;
    }
    xy = scale.transform(minimumX, value, null);
    path.lineTo(xy[0], xy[1]);
    path.close();
  }
};


/**
 * Draw horizontal line.
 * @param {number} value Tick value to draw grid interlace.
 * @param {number} prevValue Previous tick value to draw grid interlace.
 * @param {string} fillSettings Interlace fill settings.
 * @param {acgraph.vector.Path} path Layer to draw interlace.
 * @param {number} shift Grid line pixel shift.
 * @param {number} precision Grid precision.
 * @protected
 */
anychart.core.grids.Map.prototype.drawInterlaceVertical = function(value, prevValue, fillSettings, path, shift, precision) {
  var scale = this.scale_;

  var minimumX = /** @type {number} */(scale.minimumX());
  var minimumY = /** @type {number} */(scale.minimumY());
  var maximumY = /** @type {number} */(scale.maximumY());

  if (isNaN(prevValue) && value != minimumX) {
    prevValue = minimumX;
  }

  if (!isNaN(prevValue)) {
    var xy, currLong, currLat;

    shift = value == maximumY ? shift : -shift;
    var prevShift = prevValue == maximumY ? shift : -shift;

    currLong = prevValue;
    while (currLong < value) {
      xy = scale.transform(currLong, minimumY, null);
      if (currLong == prevValue) {
        path.moveTo(xy[0], xy[1] + prevShift);
      } else {
        path.lineTo(xy[0], xy[1] + prevShift);
      }
      currLong += precision;
    }
    xy = scale.transform(value, minimumY, null);
    path.lineTo(xy[0], xy[1] + shift);


    currLat = minimumY;
    while (currLat < maximumY) {
      xy = scale.transform(value, currLat, null);
      path.lineTo(xy[0], xy[1] + shift);
      currLat += precision;
    }
    xy = scale.transform(value, maximumY, null);
    path.lineTo(xy[0], xy[1]);


    currLong = value;
    while (currLong > prevValue) {
      xy = scale.transform(currLong, maximumY, null);
      path.lineTo(xy[0], xy[1] + shift);
      currLong -= precision;
    }
    xy = scale.transform(prevValue, maximumY, null);
    path.lineTo(xy[0], xy[1]);


    currLat = maximumY;
    while (currLat > minimumY) {
      xy = scale.transform(prevValue, currLat);
      path.lineTo(xy[0], xy[1] + shift);
      currLat -= precision;
    }
    xy = scale.transform(prevValue, minimumY, null);
    path.lineTo(xy[0], xy[1]);
    path.close();
  }
};


/** @inheritDoc */
anychart.core.grids.Map.prototype.remove = function() {
  if (this.rootLayer_) this.rootLayer_.parent(null);
};


/**
 * Drawing
 * @return {anychart.core.grids.Map}
 */
anychart.core.grids.Map.prototype.draw = function() {
  var scale = /** @type {anychart.scales.Geo} */(this.scale_);

  if (!scale) {
    anychart.core.reporting.error(anychart.enums.ErrorCode.SCALE_NOT_SET);
    return this;
  }

  if (!this.checkDrawingNeeded())
    return this;

  var majorLineElement = this.lineElement(true);
  var minorLineElement = this.lineElement(false);

  if (!this.rootLayer_) {
    this.rootLayer_ = acgraph.layer();
    this.evenFillElement().parent(this.rootLayer_);
    this.oddFillElement().parent(this.rootLayer_);
    majorLineElement.parent(this.rootLayer_).zIndex(1);
    minorLineElement.parent(this.rootLayer_).zIndex(0);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    var zIndex = /** @type {number} */(this.zIndex());
    this.rootLayer_.zIndex(zIndex);
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    var container = /** @type {acgraph.vector.ILayer} */(this.container());
    this.rootLayer_.parent(container);
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    majorLineElement.stroke(/** @type {acgraph.vector.Stroke} */(this.getOption(anychart.opt.STROKE)));
    minorLineElement.stroke(/** @type {acgraph.vector.Stroke} */(this.getOption(anychart.opt.MINOR_STROKE)));
    this.oddFillElement().fill(/** @type {acgraph.vector.Fill} */(this.getOption(anychart.opt.ODD_FILL)));
    this.evenFillElement().fill(/** @type {acgraph.vector.Fill} */(this.getOption(anychart.opt.EVEN_FILL)));
    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.GRIDS_POSITION) ||
      this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    var layout, fill, path, ticks, minorTicks, tickVal;
    var prevTickVal = NaN;
    var pixelShift, i, count, scaleMaximum;
    var precision = scale.precision();
    if (this.isHorizontal()) {
      ticks = scale.yTicks();
      minorTicks = scale.yMinorTicks();
      precision = precision[0];
      scaleMaximum = /** @type {number} */(scale.maximumY());
      layout = [this.drawLineHorizontal, this.drawInterlaceHorizontal];
    } else {
      ticks = scale.xTicks();
      minorTicks = scale.xMinorTicks();
      precision = precision[1];
      scaleMaximum = /** @type {number} */(scale.maximumX());
      layout = [this.drawLineVertical, this.drawInterlaceVertical];
    }

    var ticksArray = ticks.get();
    var minorTicksArray = minorTicks.get();

    this.evenFillElement().clear();
    this.oddFillElement().clear();
    majorLineElement.clear();
    minorLineElement.clear();

    var drawLine = layout[0];
    var drawInterlace = layout[1];

    pixelShift = -majorLineElement.strokeThickness() % 2 / 2;

    for (i = 0, count = ticksArray.length; i < count; i++) {
      tickVal = ticksArray[i];

      if (i % 2 == 0) {
        fill = this.getOption('evenFill');
        path = this.evenFillElement_;
      } else {
        fill = this.getOption('oddFill');
        path = this.oddFillElement_;
      }

      drawInterlace.call(this, tickVal, prevTickVal, fill, path, pixelShift, precision);

      if ((!i && this.getOption(anychart.opt.DRAW_FIRST_LINE)) || (i == count - 1 && this.getOption(anychart.opt.DRAW_LAST_LINE)) || (i != 0 && i != count - 1)) {
        drawLine.call(this, tickVal, majorLineElement, pixelShift, precision);
      }

      prevTickVal = tickVal;
    }

    if (tickVal != scaleMaximum) {
      //draw last interlace if last scale tick is not scale maximum
      if (i % 2 == 0) {
        fill = this.getOption('evenFill');
        path = this.evenFillElement_;
      } else {
        fill = this.getOption('oddFill');
        path = this.oddFillElement_;
      }

      drawInterlace.call(this, scaleMaximum, prevTickVal, fill, path, pixelShift);
    }

    pixelShift = -majorLineElement.strokeThickness() % 2 / 2;

    for (i = 0, count = minorTicksArray.length; i < count; i++) {
      tickVal = minorTicksArray[i];
      drawLine.call(this, tickVal, minorLineElement, pixelShift, precision);
    }

    this.markConsistent(anychart.ConsistencyState.GRIDS_POSITION);
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  return this;
};


//endregion
//region --- Serialization
/**
 * Sets default settings.
 * @param {!Object} config
 */
anychart.core.grids.Map.prototype.setThemeSettings = function(config) {
  for (var name in this.SIMPLE_PROPS_DESCRIPTORS) {
    var val = config[name];
    if (goog.isDef(val))
      this.themeSettings[name] = val;
  }
  if (anychart.opt.ENABLED in config) this.themeSettings[anychart.opt.ENABLED] = config[anychart.opt.ENABLED];
  if (anychart.opt.Z_INDEX in config) this.themeSettings[anychart.opt.Z_INDEX] = config[anychart.opt.Z_INDEX];
};


/** @inheritDoc */
anychart.core.grids.Map.prototype.serialize = function() {
  var json = {};

  var zIndex;
  if (this.hasOwnOption(anychart.opt.Z_INDEX)) {
    zIndex = this.getOwnOption(anychart.opt.Z_INDEX);
  }
  if (!goog.isDef(zIndex)) {
    zIndex = this.getThemeOption(anychart.opt.Z_INDEX);
  }
  if (goog.isDef(zIndex)) json['zIndex'] = zIndex;

  var enabled;
  if (this.hasOwnOption(anychart.opt.ENABLED)) {
    enabled = this.getOwnOption(anychart.opt.ENABLED);
  }
  if (!goog.isDef(enabled)) {
    enabled = this.getThemeOption(anychart.opt.ENABLED);
  }
  json['enabled'] = goog.isDef(enabled) ? enabled : null;

  anychart.core.settings.serialize(this, this.SIMPLE_PROPS_DESCRIPTORS, json, 'Map grids props');

  return json;
};


/** @inheritDoc */
anychart.core.grids.Map.prototype.specialSetupByVal = function(value, opt_default) {
  if (goog.isBoolean(value) || goog.isNull(value)) {
    if (opt_default)
      this.themeSettings[anychart.opt.ENABLED] = !!value;
    else
      this.enabled(!!value);
    return true;
  }
  return anychart.core.Base.prototype.specialSetupByVal.apply(this, arguments);
};


/** @inheritDoc */
anychart.core.grids.Map.prototype.setupByJSON = function(config, opt_default) {
  if (opt_default) {
    this.setThemeSettings(config);
  } else {
    anychart.core.settings.deserialize(this, this.SIMPLE_PROPS_DESCRIPTORS, config);
    anychart.core.grids.Map.base(this, 'setupByJSON', config);
  }
};


//----------------------------------------------------------------------------------------------------------------------
//  Disposing.
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.grids.Map.prototype.disposeInternal = function() {
  this.axis_ = null;
  this.chart_ = null;
  goog.base(this, 'disposeInternal');
};


//endregion
//region --- Exports
//exports
anychart.core.grids.Map.prototype['enabled'] = anychart.core.grids.Map.prototype.enabled;
// anychart.core.grids.Map.prototype['zIndex'] = anychart.core.grids.Map.prototype.zIndex;
// anychart.core.grids.Map.prototype['stroke'] = anychart.core.grids.Map.prototype.stroke;
// anychart.core.grids.Map.prototype['minorStroke'] = anychart.core.grids.Map.prototype.minorStroke;
// anychart.core.grids.Map.prototype['drawFirstLine'] = anychart.core.grids.Map.prototype.drawFirstLine;
// anychart.core.grids.Map.prototype['drawLastLine'] = anychart.core.grids.Map.prototype.drawLastLine;
// anychart.core.grids.Map.prototype['oddFill'] = anychart.core.grids.Map.prototype.oddFill;
// anychart.core.grids.Map.prototype['evenFill'] = anychart.core.grids.Map.prototype.evenFill;
//endregion
