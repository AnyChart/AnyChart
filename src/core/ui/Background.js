//region --- Requiring and Providing
goog.provide('anychart.core.ui.Background');
goog.require('acgraph');
goog.require('anychart.core.IStandaloneBackend');
goog.require('anychart.core.VisualBaseWithBounds');
goog.require('anychart.core.settings');
goog.require('anychart.enums');
goog.require('anychart.math.Rect');
goog.require('goog.array');
//endregion



/**
 * Background element class.<br/>
 * Background can be a part of another complex element (chart, legend, title and so on),
 * or used separately.<br/>
 * Background has a fill, a border and corner shape settings.<br/>
 * <b>Note:</b> Always specify display bounds if you use Background separately.
 * @extends {anychart.core.VisualBaseWithBounds}
 * @implements {anychart.core.IStandaloneBackend}
 * @constructor
 * @implements {anychart.core.settings.IObjectWithSettings}
 * @implements {anychart.core.settings.IResolvable}
 */
anychart.core.ui.Background = function() {
  goog.base(this);

  /**
   * Graphics element that represents background path.
   * @type {acgraph.vector.Rect}
   * @private
   */
  this.rect_ = null;


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
   * @type {anychart.core.ui.Background}
   * @private
   */
  this.parent_ = null;

  /**
   * @type {boolean}
   */
  this.forceInvalidate = false;
};
goog.inherits(anychart.core.ui.Background, anychart.core.VisualBaseWithBounds);


//region -- Consistency states and Signals
/**
 * Supported signals.
 * @type {number}
 */
anychart.core.ui.Background.prototype.SUPPORTED_SIGNALS =
    anychart.core.VisualBaseWithBounds.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.ENABLED_STATE_CHANGED;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.ui.Background.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBaseWithBounds.prototype.SUPPORTED_CONSISTENCY_STATES |
        anychart.ConsistencyState.APPEARANCE |
        anychart.ConsistencyState.BACKGROUND_POINTER_EVENTS;


//endregion
//region -- Optimized props descriptors
/**
 * Simple BG descriptors.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.ui.Background.prototype.SIMPLE_PROPS_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  map[anychart.opt.FILL] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      anychart.opt.FILL,
      anychart.core.settings.fillOrFunctionNormalizer,
      anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW);

  map[anychart.opt.STROKE] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      anychart.opt.STROKE,
      anychart.core.settings.strokeOrFunctionNormalizer,
      anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.BOUNDS,
      anychart.Signal.NEEDS_REDRAW);

  map[anychart.opt.DISABLE_POINTER_EVENTS] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      anychart.opt.DISABLE_POINTER_EVENTS,
      anychart.core.settings.booleanNormalizer,
      anychart.ConsistencyState.BACKGROUND_POINTER_EVENTS,
      anychart.Signal.NEEDS_REDRAW);

  map[anychart.opt.CORNER_TYPE] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      anychart.opt.CORNER_TYPE,
      anychart.enums.normalizeBackgroundCornerType,
      anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW);

  return map;
})();
anychart.core.settings.populate(anychart.core.ui.Background, anychart.core.ui.Background.prototype.SIMPLE_PROPS_DESCRIPTORS);


/** @inheritDoc */
anychart.core.ui.Background.prototype.enabled = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.ownSettings[anychart.opt.ENABLED] != opt_value) {
      var enabled = this.ownSettings[anychart.opt.ENABLED] = opt_value;
      this.invalidate(anychart.ConsistencyState.ENABLED, this.getEnableChangeSignals());
      if (enabled) {
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
    return /** @type {boolean} */(this.getOption(anychart.opt.ENABLED));
  }
};


/** @inheritDoc */
anychart.core.ui.Background.prototype.zIndex = function(opt_value) {
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
//region -- IObjectWithSettings implementation
/** @inheritDoc */
anychart.core.ui.Background.prototype.getOwnOption = function(name) {
  return this.ownSettings[name];
};


/** @inheritDoc */
anychart.core.ui.Background.prototype.hasOwnOption = function(name) {
  return goog.isDef(this.ownSettings[name]);
};


/** @inheritDoc */
anychart.core.ui.Background.prototype.getThemeOption = function(name) {
  return this.themeSettings[name];
};


/** @inheritDoc */
anychart.core.ui.Background.prototype.getOption = anychart.core.settings.getOption;


/** @inheritDoc */
anychart.core.ui.Background.prototype.setOption = function(name, value) {
  this.ownSettings[name] = value;
};


/** @inheritDoc */
anychart.core.ui.Background.prototype.check = function(flags) {
  return true;
};


//endregion
//region -- IResolvable implementation
/** @inheritDoc */
anychart.core.ui.Background.prototype.getResolutionChain = anychart.core.settings.getResolutionChain;


/** @inheritDoc */
anychart.core.ui.Background.prototype.getLowPriorityResolutionChain = function() {
  var sett = [this.themeSettings];
  if (this.parent_) {
    sett = goog.array.concat(sett, this.parent_.getLowPriorityResolutionChain());
  }
  return sett;
};


/** @inheritDoc */
anychart.core.ui.Background.prototype.getHighPriorityResolutionChain = function() {
  var sett = [this.ownSettings];
  if (this.parent_) {
    sett = goog.array.concat(sett, this.parent_.getHighPriorityResolutionChain());
  }
  return sett;
};


//endregion
//region -- Other methods
/**
 * Corners formatter.
 * @param {...(number|string|Array.<number|string>)} var_args .
 * @return {Array.<number|string>}
 * @private
 */
anychart.core.ui.Background.prototype.cornersFormatter_ = function(var_args) {
  var val;
  var arg0 = arguments[0];
  if (goog.isArray(arg0)) {
    val = arg0;
  } else if (goog.isObject(arg0)) {
    val = [
      anychart.utils.toNumber(arg0['leftTop']) || 0,
      anychart.utils.toNumber(arg0['rightTop']) || 0,
      anychart.utils.toNumber(arg0['rightBottom']) || 0,
      anychart.utils.toNumber(arg0['leftBottom']) || 0
    ];
  } else {
    val = goog.array.slice(arguments, 0);
  }
  return val;
};


/**
 * Getter/setter for corners.
 * @param {(number|string|Array.<number|string>)=} opt_value .
 * @return {(Array.<number|string>|!anychart.core.ui.Background)} .
 */
anychart.core.ui.Background.prototype.corners = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = this.cornersFormatter_.apply(this, arguments);
    if (!goog.array.equals(val, this.ownSettings[anychart.opt.CORNERS])) {
      this.ownSettings[anychart.opt.CORNERS] = val;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return /** @type {Array.<number|string>} */(this.getOption(anychart.opt.CORNERS));
  }
};


/**
 * Whether needs force invalidation.
 * @return {boolean}
 */
anychart.core.ui.Background.prototype.needsForceInvalidation = function() {
  return this.forceInvalidate;
};


//endregion
//region -- Parental relations
/**
 * Gets/sets new parent.
 * @param {anychart.core.ui.Background=} opt_value - Value to set.
 * @return {anychart.core.ui.Background} - Current value or itself for method chaining.
 */
anychart.core.ui.Background.prototype.parent = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.parent_ != opt_value) {
      if (goog.isNull(opt_value)) {
        //this.parent_ is not null here.
        this.parent_.unlistenSignals(this.parentInvalidated_, this);
        this.parent_ = null;
      } else {
        if (this.parent_)
          this.parent_.unlistenSignals(this.parentInvalidated_, this);
        this.parent_ = opt_value;
        this.parent_.listenSignals(this.parentInvalidated_, this);
      }
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
anychart.core.ui.Background.prototype.parentInvalidated_ = function(e) {
  var state = 0;
  var signal = 0;

  if (e.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state |= anychart.ConsistencyState.APPEARANCE;
    signal |= anychart.Signal.NEEDS_REDRAW;
  }

  if (e.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state |= anychart.ConsistencyState.BOUNDS;
    signal |= anychart.Signal.BOUNDS_CHANGED;
  }

  if (e.hasSignal(anychart.Signal.ENABLED_STATE_CHANGED)) {
    state |= anychart.ConsistencyState.ENABLED;
    signal |= anychart.Signal.NEEDS_REDRAW;
  }

  this.invalidate(state, signal);
};


//endregion
//region -- Drawing, removing
/**
 * Render background.
 * @return {!anychart.core.ui.Background} {@link anychart.core.ui.Background} instance for method chaining.
 */
anychart.core.ui.Background.prototype.draw = function() {
  if (!this.checkDrawingNeeded())
    return this;

  if (!this.rect_) {
    this.rect_ = acgraph.rect();
  }

  var fill = this.getOption(anychart.opt.FILL) || anychart.opt.NONE;
  var stroke = this.getOption(anychart.opt.STROKE) || anychart.opt.NONE;

  var stage = this.container() ? this.container().getStage() : null;
  var manualSuspend = stage && !stage.isSuspended();
  if (manualSuspend) stage.suspend();

  if (this.hasInvalidationState(anychart.ConsistencyState.BACKGROUND_POINTER_EVENTS)) {
    this.rect_.disablePointerEvents(/** @type {boolean|undefined} */ (this.getOption(anychart.opt.DISABLE_POINTER_EVENTS)));
    this.markConsistent(anychart.ConsistencyState.BACKGROUND_POINTER_EVENTS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    var bounds = this.getPixelBounds();
    var strokeThickness;
    // stroke have been changed
    strokeThickness = acgraph.vector.getThickness(/** @type {acgraph.vector.Stroke} */ (stroke));
    var thicknessHalf = strokeThickness / 2;
    //TODO(Anton Saukh): remove this fix when graphics is fixed.
    if (isNaN(thicknessHalf)) thicknessHalf = .5;
    bounds.left += thicknessHalf;
    bounds.top += thicknessHalf;
    bounds.width -= thicknessHalf + thicknessHalf;
    bounds.height -= thicknessHalf + thicknessHalf;
    this.rect_.setBounds(bounds);
    this.markConsistent(anychart.ConsistencyState.BOUNDS);

    if (goog.isObject(fill) && ('keys' in fill || 'src' in fill))
      this.invalidate(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    this.rect_.fill(/** @type {acgraph.vector.Fill} */ (fill));
    this.rect_.stroke(/** @type {acgraph.vector.Stroke} */ (stroke));
    switch (this.getOption(anychart.opt.CORNER_TYPE)) {
      case anychart.enums.BackgroundCornersType.ROUND:
        this.rect_.round.apply(this.rect_, /** @type {Array.<number|string>} */(this.getOption(anychart.opt.CORNERS)));
        break;
      case anychart.enums.BackgroundCornersType.CUT:
        this.rect_.cut.apply(this.rect_, /** @type {Array.<number|string>} */(this.getOption(anychart.opt.CORNERS)));
        break;
      case anychart.enums.BackgroundCornersType.ROUND_INNER:
        this.rect_.roundInner.apply(this.rect_, /** @type {Array.<number|string>} */(this.getOption(anychart.opt.CORNERS)));
        break;
      default:
        this.rect_.cut(0);
        break;
    }
    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    this.rect_.zIndex(/** @type {number} */(this.zIndex()));
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    this.rect_.parent(/** @type {acgraph.vector.ILayer} */(this.container()));
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  if (manualSuspend) stage.resume();

  return this;
};


/** @inheritDoc */
anychart.core.ui.Background.prototype.remove = function() {
  if (this.rect_) this.rect_.parent(null);
};


//endregion
//region -- Other functions
/**
 * Returns the remaining (after background placement) part of the container.
 * @return {!anychart.math.Rect} Parent bounds without the space used by the background thickness.
 */
anychart.core.ui.Background.prototype.getRemainingBounds = function() {
  var parentBounds = /** @type {anychart.math.Rect} */(this.getPixelBounds());
  if (parentBounds)
    parentBounds = parentBounds.clone();
  else
    parentBounds = anychart.math.rect(0, 0, 0, 0);

  if (!this.enabled())
    return parentBounds;

  var stroke = /** @type {acgraph.vector.Stroke} */ (this.getOption(anychart.opt.STROKE));
  var thickness = anychart.utils.isNone(stroke) ? 0 : acgraph.vector.getThickness(stroke);

  parentBounds.top += thickness;
  parentBounds.left += thickness;
  parentBounds.height -= 2 * thickness;
  parentBounds.width -= 2 * thickness;

  return parentBounds;
};


/**
 * @inheritDoc
 */
anychart.core.ui.Background.prototype.invalidate = function(state, opt_signal) {
  var effective = anychart.core.ui.Background.base(this, 'invalidate', state, opt_signal);
  if (!effective && this.needsForceInvalidation())
    this.dispatchSignal(opt_signal || 0);
  return effective;
};


//endregion
//region -- Serialize, deserialize, dispose
/**
 * Sets default settings.
 * @param {!Object} config
 */
anychart.core.ui.Background.prototype.setThemeSettings = function(config) {
  for (var name in this.SIMPLE_PROPS_DESCRIPTORS) {
    var val = config[name];
    if (goog.isDef(val))
      this.themeSettings[name] = val;
  }
  if (anychart.opt.ENABLED in config) this.themeSettings[anychart.opt.ENABLED] = config[anychart.opt.ENABLED];
  if (anychart.opt.Z_INDEX in config) this.themeSettings[anychart.opt.Z_INDEX] = config[anychart.opt.Z_INDEX];
  if (anychart.opt.CORNERS in config) this.themeSettings[anychart.opt.CORNERS] = this.cornersFormatter_(config[anychart.opt.CORNERS]);
};


/** @inheritDoc */
anychart.core.ui.Background.prototype.serialize = function() {
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

  anychart.core.settings.serialize(this, this.SIMPLE_PROPS_DESCRIPTORS, json, 'Background');

  var corners = /** @type {Array} */(this.getOwnOption(anychart.opt.CORNERS));
  if (corners) {
    if (corners.length >= 4) {
      corners = {
        'leftTop': corners[0],
        'rightTop': corners[1],
        'rightBottom': corners[2],
        'leftBottom': corners[3]
      };
    } else {
      corners = corners[0];
    }
    json['corners'] = corners;
  }
  return json;
};


/** @inheritDoc */
anychart.core.ui.Background.prototype.specialSetupByVal = function(value, opt_default) {
  if (goog.isString(value)) {
    if (opt_default) {
      this.themeSettings[anychart.opt.FILL] = value;
      this.themeSettings[anychart.opt.STROKE] = null;
      this.themeSettings[anychart.opt.ENABLED] = true;
    } else {
      this[anychart.opt.FILL](value);
      this[anychart.opt.STROKE](null);
      this.enabled(true);
    }
    return true;
  } else if (goog.isBoolean(value) || goog.isNull(value)) {
    if (opt_default)
      this.themeSettings[anychart.opt.ENABLED] = !!value;
    else
      this.enabled(!!value);
    return true;
  }
  return false;
};


/** @inheritDoc */
anychart.core.ui.Background.prototype.setupByJSON = function(config, opt_default) {
  if (opt_default) {
    this.setThemeSettings(config);
  } else {
    anychart.core.settings.deserialize(this, this.SIMPLE_PROPS_DESCRIPTORS, config);
    this.corners(config['corners']);
    anychart.core.ui.Background.base(this, 'setupByJSON', config);
  }
};


/** @inheritDoc */
anychart.core.ui.Background.prototype.disposeInternal = function() {
  if (this.rect_) {
    goog.dispose(this.rect_);
    this.rect_ = null;
  }

  // delete this.fill_;
  // delete this.stroke_;
  // delete this.cornerType_;
  // if (this.corners_)
  //   this.corners_.length = 0;
  // delete this.corners_;

  anychart.core.ui.Background.base(this, 'disposeInternal');
};
//endregion


//exports
// anychart.core.ui.Background.prototype['fill'] = anychart.core.ui.Background.prototype.fill;//in docs/final
// anychart.core.ui.Background.prototype['stroke'] = anychart.core.ui.Background.prototype.stroke;//in docs/final
// anychart.core.ui.Background.prototype['cornerType'] = anychart.core.ui.Background.prototype.cornerType;//in docs/final
anychart.core.ui.Background.prototype['corners'] = anychart.core.ui.Background.prototype.corners;//in docs/final
