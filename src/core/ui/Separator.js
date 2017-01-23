goog.provide('anychart.core.ui.Separator');
goog.require('acgraph');
goog.require('anychart.core.VisualBase');
goog.require('anychart.core.settings');
goog.require('anychart.core.utils.Margin');
goog.require('anychart.enums');
goog.require('anychart.math.Rect');
goog.require('anychart.utils');



/**
 * Class for a separator element.
 * @constructor
 * @extends {anychart.core.VisualBase}
 * @implements {anychart.core.settings.IObjectWithSettings}
 * @implements {anychart.core.settings.IResolvable}
 */
anychart.core.ui.Separator = function() {
  anychart.core.ui.Separator.base(this, 'constructor');

  /**
   * Path of the separator.
   * @type {acgraph.vector.Path}
   * @private
   */
  this.path_ = null;

  /**
   * Drawer function.
   * @type {function(acgraph.vector.Path, anychart.math.Rect)}
   * @private
   */
  this.drawer_;

  /**
   * Separator margin.
   * @type {anychart.core.utils.Margin}
   */
  this.margin_;

  /**
   * Separator left position.
   * @type {number}
   * @private
   */
  this.actualLeft_ = NaN;

  /**
   * Separator top position.
   * @type {number}
   * @private
   */
  this.actualTop_ = NaN;

  /**
   * Pixel bounds due to orientation, margins, etc.
   * @type {anychart.math.Rect}
   * @private
   */
  this.pixelBounds_ = null;

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
   * Parent separator.
   * @type {anychart.core.ui.Separator}
   * @private
   */
  this.parent_ = null;

  /**
   * @type {boolean}
   */
  this.forceInvalidate = false;

  /**
   * Resolution chain cache.
   * @type {?Array.<Object|null|undefined>}
   * @private
   */
  this.resolutionChainCache_ = null;

  var drawer = goog.bind(function(path, bounds) {
    bounds = bounds.clone().round();

    if (!this.isHorizontal()) {
      var shift = bounds.width == 1 ? 0.5 : 0;
      bounds.left -= shift;
      bounds.width += 2 * shift;
    }

    path
        .moveTo(bounds.left, bounds.top)
        .lineTo(bounds.left + bounds.width, bounds.top)
        .lineTo(bounds.left + bounds.width, bounds.top + bounds.height)
        .lineTo(bounds.left, bounds.top + bounds.height)
        .close();
  }, this);

  this.drawer(drawer);

  this.invalidate(anychart.ConsistencyState.ALL);
};
goog.inherits(anychart.core.ui.Separator, anychart.core.VisualBase);


/**
 * Dispatched consistency states.
 * @type {number}
 */
anychart.core.ui.Separator.prototype.SUPPORTED_SIGNALS =
    anychart.core.VisualBase.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.ENABLED_STATE_CHANGED;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.ui.Separator.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.BOUNDS;


//region -- Optimized props descriptors
/**
 * Simple Separator descriptors.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.ui.Separator.prototype.SIMPLE_SEPARATOR_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  map['fill'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'fill',
      anychart.core.settings.fillOrFunctionNormalizer,
      anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW);

  map['stroke'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'stroke',
      anychart.core.settings.strokeOrFunctionNormalizer,
      anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW);

  map['width'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'width',
      anychart.core.settings.numberOrPercentNormalizer,
      anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);

  map['height'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'height',
      anychart.core.settings.numberOrPercentNormalizer,
      anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);

  map['orientation'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'orientation',
      anychart.enums.normalizeOrientation,
      anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);

  return map;
})();
anychart.core.settings.populate(anychart.core.ui.Separator, anychart.core.ui.Separator.prototype.SIMPLE_SEPARATOR_DESCRIPTORS);
//endregion


//region -- IObjectWithSettings implementation
/** @inheritDoc */
anychart.core.ui.Separator.prototype.getOwnOption = function(name) {
  return this.ownSettings[name];
};


/** @inheritDoc */
anychart.core.ui.Separator.prototype.hasOwnOption = function(name) {
  return goog.isDefAndNotNull(this.ownSettings[name]);
};


/** @inheritDoc */
anychart.core.ui.Separator.prototype.getThemeOption = function(name) {
  return this.themeSettings[name];
};


/** @inheritDoc */
anychart.core.ui.Separator.prototype.getOption = anychart.core.settings.getOption;


/** @inheritDoc */
anychart.core.ui.Separator.prototype.setOption = function(name, value) {
  this.ownSettings[name] = value;
};


/** @inheritDoc */
anychart.core.ui.Separator.prototype.check = function(flags) {
  return true;
};
//endregion


//region -- IResolvable implementation
/** @inheritDoc */
anychart.core.ui.Separator.prototype.resolutionChainCache = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.resolutionChainCache_ = opt_value;
  }
  return this.resolutionChainCache_;
};


/** @inheritDoc */
anychart.core.ui.Separator.prototype.getResolutionChain = anychart.core.settings.getResolutionChain;


/** @inheritDoc */
anychart.core.ui.Separator.prototype.getLowPriorityResolutionChain = function() {
  var sett = [this.themeSettings];
  if (this.parent_) {
    sett = goog.array.concat(sett, this.parent_.getLowPriorityResolutionChain());
  }
  return sett;
};


/** @inheritDoc */
anychart.core.ui.Separator.prototype.getHighPriorityResolutionChain = function() {
  var sett = [this.ownSettings];
  if (this.parent_) {
    sett = goog.array.concat(sett, this.parent_.getHighPriorityResolutionChain());
  }
  return sett;
};
//endregion


//region -- Parental relations
/**
 * Gets/sets new parent.
 * @param {anychart.core.ui.Separator=} opt_value - Value to set.
 * @return {anychart.core.ui.Separator} - Current value or itself for method chaining.
 */
anychart.core.ui.Separator.prototype.parent = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.parent_ != opt_value) {
      if (this.parent_)
        this.parent_.unlistenSignals(this.parentInvalidated_, this);
      this.parent_ = opt_value;
      if (this.parent_) {
        this.parent_.listenSignals(this.parentInvalidated_, this);
        this.margin().parent(this.parent_.margin());
      } else {
        this.margin().parent(null);
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
anychart.core.ui.Separator.prototype.parentInvalidated_ = function(e) {
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


/**
 * Whether needs force invalidation.
 * @return {boolean}
 */
anychart.core.ui.Separator.prototype.needsForceInvalidation = function() {
  return this.forceInvalidate;
};


/** @inheritDoc */
anychart.core.ui.Separator.prototype.invalidateParentBounds = function() {
  this.invalidate(anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
};


/**
 * Margin of the separator
 * @param {(string|number|Array.<number|string>|{top:(number|string),left:(number|string),bottom:(number|string),right:(number|string)})=} opt_spaceOrTopOrTopAndBottom .
 * @param {(string|number)=} opt_rightOrRightAndLeft .
 * @param {(string|number)=} opt_bottom .
 * @param {(string|number)=} opt_left .
 * @return {!(anychart.core.ui.Separator|anychart.core.utils.Margin)} .
 */
anychart.core.ui.Separator.prototype.margin = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  if (!this.margin_) {
    this.margin_ = new anychart.core.utils.Margin();
    this.registerDisposable(this.margin_);
    this.margin_.listenSignals(this.marginInvalidated_, this);
  }
  if (goog.isDef(opt_spaceOrTopOrTopAndBottom)) {
    this.margin_.setup.apply(this.margin_, arguments);
    return this;
  }
  return this.margin_;
};


/**
 * Getter/setter for drawer.
 * @param {function(acgraph.vector.Path, anychart.math.Rect)=} opt_value Drawer function.
 * @return {(function(acgraph.vector.Path, anychart.math.Rect)|anychart.core.ui.Separator)} Drawer function or self for method chaining.
 */
anychart.core.ui.Separator.prototype.drawer = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.drawer_ != opt_value) {
      this.drawer_ = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.drawer_;
};


/**
 * Draw separator.
 * @return {!anychart.core.ui.Separator} {@link anychart.core.ui.Separator} instance for method chaining.
 */
anychart.core.ui.Separator.prototype.draw = function() {
  if (!this.checkDrawingNeeded())
    return this;

  var isInitial = !this.path_;

  if (isInitial) {
    this.path_ = acgraph.path();
    this.registerDisposable(this.path_);
  }

  var container = /** @type {acgraph.vector.ILayer} */(this.container());
  var stage = container ? container.getStage() : null;
  var manualSuspend = stage && !stage.isSuspended();
  if (manualSuspend) stage.suspend();

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.calculateSeparatorBounds_();
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    this.path_.fill(/** @type {acgraph.vector.Fill} */ (this.getOption('fill')));
    this.path_.stroke(/** @type {acgraph.vector.Stroke} */ (this.getOption('stroke')));
    this.path_.clear();

    var bounds = new anychart.math.Rect(this.actualLeft_, this.actualTop_, this.separatorWidth_, this.separatorHeight_);
    if (this.drawer_ && goog.isFunction(this.drawer_)) {
      this.drawer_(this.path_, bounds);
    }
    //    this.drawInternal(bounds);
    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    if (this.enabled()) this.path_.parent(container);
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    var zIndex = /** @type {number} */ (this.zIndex());
    this.path_.zIndex(zIndex);
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (manualSuspend) stage.resume();
  return this;
};


/** @inheritDoc */
anychart.core.ui.Separator.prototype.remove = function() {
  if (this.path_) this.path_.parent(null);
};


/**
 * Return separator content bounds.
 * @return {anychart.math.Rect} Separator content bounds.
 */
anychart.core.ui.Separator.prototype.getContentBounds = function() {
  if (!this.pixelBounds_ || this.hasInvalidationState(anychart.ConsistencyState.BOUNDS))
    this.calculateSeparatorBounds_();
  return new anychart.math.Rect(0, 0, this.pixelBounds_.width, this.pixelBounds_.height);
};


/**
 * @return {!anychart.math.Rect} Parent bounds without the space used by the title.
 */
anychart.core.ui.Separator.prototype.getRemainingBounds = function() {
  if (!this.pixelBounds_ || this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.calculateSeparatorBounds_();
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }
  /** @type {!anychart.math.Rect} */
  var parentBounds = /** @type {anychart.math.Rect} */(this.parentBounds()) || anychart.math.rect(0, 0, 0, 0);

  if (!this.enabled()) return parentBounds;

  switch (this.getOption('orientation')) {
    case anychart.enums.Orientation.TOP:
      parentBounds.top += this.pixelBounds_.height;
      parentBounds.height -= this.pixelBounds_.height;
      break;
    case anychart.enums.Orientation.RIGHT:
      parentBounds.width -= this.pixelBounds_.width;
      break;
    case anychart.enums.Orientation.BOTTOM:
      parentBounds.height -= this.pixelBounds_.height;
      break;
    case anychart.enums.Orientation.LEFT:
      parentBounds.left += this.pixelBounds_.width;
      parentBounds.width -= this.pixelBounds_.width;
      break;
  }
  return parentBounds;
};


/**
 * Calculates actual size of the separator due to different sizing cases.
 * @private
 */
anychart.core.ui.Separator.prototype.calculateSeparatorBounds_ = function() {
  var container = /** @type {acgraph.vector.ILayer} */(this.container());
  var stage = container ? container.getStage() : null;

  var margin = this.margin();

  /** @type {anychart.math.Rect} */
  var parentBounds = /** @type {anychart.math.Rect} */(this.parentBounds());

  var parentWidth, parentHeight;
  if (parentBounds) {
    if (this.isHorizontal()) {
      parentWidth = parentBounds.width;
      parentHeight = parentBounds.height;
    } else {
      parentWidth = parentBounds.height;
      parentHeight = parentBounds.width;
    }
  } else {
    parentWidth = parentHeight = undefined;
  }

  var optionWidth = this.getOption('width');
  var optionHeight = this.getOption('height');
  var width = anychart.utils.isNone(optionWidth) || !goog.isDef(optionWidth) ? '100%' : optionWidth;
  var height = anychart.utils.isNone(optionHeight) || !goog.isDef(optionHeight) ? '100%' : optionHeight;

  var separatorWidth = anychart.utils.normalizeSize(/** @type {number} */ (width), parentWidth);
  if (parentBounds && parentWidth < margin.widenWidth(separatorWidth)) {
    separatorWidth = margin.tightenWidth(parentWidth);
  }

  var separatorHeight = anychart.utils.normalizeSize(/** @type {number} */ (height), parentHeight);
  if (parentBounds && parentHeight < margin.widenHeight(separatorHeight)) {
    separatorHeight = margin.tightenHeight(parentHeight);
  }

  var widthWithMargin = margin.widenWidth(separatorWidth);
  var heightWithMargin = margin.widenHeight(separatorHeight);

  var leftMargin = anychart.utils.normalizeSize(/** @type {number|string} */(margin.getOption('left')), parentWidth);
  var topMargin = anychart.utils.normalizeSize(/** @type {number|string} */(margin.getOption('top')), parentHeight);

  var orientation = this.getOption('orientation') || anychart.enums.Orientation.TOP;
  if (parentBounds) {
    switch (orientation) {
      case anychart.enums.Orientation.TOP:
        this.actualLeft_ = parentBounds.getLeft() + leftMargin;
        this.actualTop_ = parentBounds.getTop() + topMargin;
        this.separatorWidth_ = separatorWidth;
        this.separatorHeight_ = separatorHeight;

        this.pixelBounds_ = new anychart.math.Rect(
            parentBounds.getLeft(),
            parentBounds.getTop(),
            widthWithMargin,
            heightWithMargin);
        break;

      case anychart.enums.Orientation.BOTTOM:
        this.actualLeft_ = parentBounds.getLeft() + leftMargin;
        this.actualTop_ = parentBounds.getBottom() - heightWithMargin + topMargin;
        this.separatorWidth_ = separatorWidth;
        this.separatorHeight_ = separatorHeight;

        this.pixelBounds_ = new anychart.math.Rect(
            parentBounds.getLeft(),
            parentBounds.getBottom() - heightWithMargin,
            widthWithMargin,
            heightWithMargin);
        break;

      case anychart.enums.Orientation.LEFT:
        this.actualLeft_ = parentBounds.getLeft() + topMargin;
        this.actualTop_ = parentBounds.getBottom() - leftMargin - separatorWidth;
        this.separatorWidth_ = separatorHeight;
        this.separatorHeight_ = separatorWidth;

        this.pixelBounds_ = new anychart.math.Rect(
            parentBounds.getLeft(),
            parentBounds.getTop(),
            heightWithMargin,
            widthWithMargin);
        break;

      case anychart.enums.Orientation.RIGHT:
        this.actualLeft_ = parentBounds.getRight() - topMargin - separatorHeight;
        this.actualTop_ = parentBounds.getTop() + leftMargin;
        this.separatorWidth_ = separatorHeight;
        this.separatorHeight_ = separatorWidth;

        this.pixelBounds_ = new anychart.math.Rect(
            parentBounds.getRight() - heightWithMargin,
            parentBounds.getTop(),
            heightWithMargin,
            widthWithMargin);
        break;
    }
  } else {
    this.actualLeft_ = leftMargin;
    this.actualTop_ = topMargin;
    if (this.isHorizontal())
      this.pixelBounds_ = new anychart.math.Rect(0, 0, widthWithMargin, heightWithMargin);
    else
      this.pixelBounds_ = new anychart.math.Rect(0, 0, heightWithMargin, widthWithMargin);
  }
};


/**
 * Listener for margin invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.core.ui.Separator.prototype.marginInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.APPEARANCE,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
  }
};


/**
 * Whether orientation is horizontal.
 * @return {boolean}
 */
anychart.core.ui.Separator.prototype.isHorizontal = function() {
  var orientation = this.getOption('orientation');
  return (goog.isDef(orientation)) ?
      (orientation == anychart.enums.Orientation.TOP || orientation == anychart.enums.Orientation.BOTTOM) :
      true;
};


/**
 * @inheritDoc
 */
anychart.core.ui.Separator.prototype.invalidate = function(state, opt_signal) {
  var effective = anychart.core.ui.Separator.base(this, 'invalidate', state, opt_signal);
  if (!effective && this.needsForceInvalidation())
    this.dispatchSignal(opt_signal || 0);
  return effective;
};


/** @inheritDoc */
anychart.core.ui.Separator.prototype.enabled = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.ownSettings['enabled'] != opt_value) {
      this.ownSettings['enabled'] = opt_value;
      this.invalidate(anychart.ConsistencyState.ENABLED,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED | anychart.Signal.ENABLED_STATE_CHANGED);
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
anychart.core.ui.Separator.prototype.serialize = function() {
  var json = {};

  var zIndex;
  if (this.hasOwnOption('zIndex')) {
    zIndex = this.getOwnOption('zIndex');
  }
  if (!goog.isDef(zIndex)) {
    zIndex = this.getThemeOption('zIndex');
  }
  if (goog.isDef(zIndex)) json['zIndex'] = zIndex;

  var enabled;
  if (this.hasOwnOption('enabled')) {
    enabled = this.getOwnOption('enabled');
  }
  if (!goog.isDef(enabled)) {
    enabled = this.getThemeOption('enabled');
  }
  if (goog.isDef(enabled))
    json['enabled'] = enabled;

  anychart.core.settings.serialize(this, this.SIMPLE_SEPARATOR_DESCRIPTORS, json, 'Separator');

  var marginConfig = this.margin().serialize();
  if (!goog.object.isEmpty(marginConfig))
    json['margin'] = marginConfig;

  return json;
};


/** @inheritDoc */
anychart.core.ui.Separator.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.settings.deserialize(this, this.SIMPLE_SEPARATOR_DESCRIPTORS, config);
  this.margin().setupByVal(config['margin'], opt_default);
  this.zIndex(config['zIndex']);
  this.enabled(config['enabled']);
};


//proto['drawer'] = proto.drawer;
//proto['draw'] = proto.draw;
//exports
(function() {
  var proto = anychart.core.ui.Separator.prototype;
  // proto['width'] = proto.width;
  // proto['height'] = proto.height;
  proto['margin'] = proto.margin;
  // proto['orientation'] = proto.orientation;
  // proto['fill'] = proto.fill;
  // proto['stroke'] = proto.stroke;
  proto['getRemainingBounds'] = proto.getRemainingBounds;
})();
