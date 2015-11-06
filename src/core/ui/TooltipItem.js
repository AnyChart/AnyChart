goog.provide('anychart.core.ui.TooltipItem');
goog.require('acgraph.math.Coordinate');
goog.require('anychart.core.VisualBase');
goog.require('anychart.core.ui.Background');
goog.require('anychart.core.ui.Label');
goog.require('anychart.core.ui.Separator');
goog.require('anychart.core.ui.Title');
goog.require('anychart.core.utils.Padding');
goog.require('anychart.enums');
goog.require('anychart.math.Rect');
goog.require('anychart.utils');
goog.require('goog.async.Delay');



/**
 * @constructor
 * @extends {anychart.core.VisualBase}
 */
anychart.core.ui.TooltipItem = function() {
  goog.base(this);

  /**
   * Tooltip item title.
   * @type {anychart.core.ui.Title}
   * @private
   */
  this.title_ = null;

  /**
   * Tooltip item separator.
   * @type {anychart.core.ui.Separator}
   * @private
   */
  this.separator_ = null;

  /**
   * Tooltip item content.
   * @type {anychart.core.ui.Label}
   * @private
   */
  this.label_ = null;

  /**
   * Tooltip item x coordinate.
   * @type {number}
   * @private
   */
  this.x_ = 0;

  /**
   * Tooltip item y coordinate.
   * @type {number}
   * @private
   */
  this.y_ = 0;

  /**
   * Tooltip item X offset.
   * @type {number}
   * @private
   */
  this.offsetX_ = 0;

  /**
   * Tooltip item Y offset.
   * @type {number}
   * @private
   */
  this.offsetY_ = 0;

  /**
   * Tooltip anchor settings.
   * @type {anychart.enums.Anchor}
   * @private
   */
  this.anchor_;

  /**
   * Tooltip item background.
   * @type {anychart.core.ui.Background}
   * @private
   */
  this.background_ = null;

  /**
   * Tooltip item padding.
   * @type {anychart.core.utils.Padding}
   * @private
   */
  this.padding_ = null;

  /**
   * Is tooltip visible.
   * @type {boolean}
   * @private
   */
  this.visible_ = true;

  /**
   * Delay in milliseconds before tooltip item becomes invisible on visible(false) call.
   * @type {number}
   * @private
   */
  this.hideDelay_;

  /**
   * Timer object to hide tooltip item with delay.
   * @type {goog.async.Delay}
   * @private
   */
  this.timer_ = null;

  /**
   * Root tooltip item layer.
   * @type {acgraph.vector.Layer}
   * @private
   */
  this.layer_ = null;

  /**
   * Cache of content bounds of tooltip item.
   * @type {anychart.math.Rect}
   * @private
   */
  this.contentBounds_ = null;

  /**
   * Cache of content bounds with applied padding of tooltip item.
   * @type {anychart.math.Rect}
   * @private
   */
  this.boundsWithoutPadding_ = null;

  /**
   * Cache of content bounds with applied padding without title bounds.
   * @type {anychart.math.Rect}
   * @private
   */
  this.titleRemainingBounds_ = null;

  /**
   * Cache of content bounds with applied padding without title and separator bounds.
   * @type {anychart.math.Rect}
   * @private
   */
  this.separatorRemainingBounds_ = null;

  /**
   * Cache of tooltip item position.
   * @type {acgraph.math.Coordinate}
   * @private
   */
  this.position_;


  this.createTimerObject_();
  this.invalidate(this.SUPPORTED_CONSISTENCY_STATES);
};
goog.inherits(anychart.core.ui.TooltipItem, anychart.core.VisualBase);


/**
 * Supported signals. Adds BOUNDS_CHANGED to Base signals.
 * @type {number}
 */
anychart.core.ui.TooltipItem.prototype.SUPPORTED_SIGNALS = 0;
// If we ever want to use it as a separate entity  we need to put back signals support.
// If tooltip will never support different TooltipItem these classes have to be merged.
// Signals support is dropped now, cause item is manage directly by tooltip and it doesn't
// matter where it is changed, it invokes draw() itself and there is no access to item.


/**
 * Supported consistency states. Adds POSITION, BOUNDS, TITLE, SEPARATOR, LABELS, BACKGROUND, VISIBILITY to Base states.
 * @type {number}
 */
anychart.core.ui.TooltipItem.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES |
        anychart.ConsistencyState.TOOLTIP_POSITION |
        anychart.ConsistencyState.TOOLTIP_TITLE |
        anychart.ConsistencyState.TOOLTIP_SEPARATOR |
        anychart.ConsistencyState.TOOLTIP_CONTENT |
        anychart.ConsistencyState.TOOLTIP_BACKGROUND |
        anychart.ConsistencyState.TOOLTIP_VISIBILITY;


//----------------------------------------------------------------------------------------------------------------------
//
//  Title.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Tooltip item title.
 * @param {(null|boolean|Object|string)=} opt_value Tooltip settings.
 * @return {!(anychart.core.ui.Title|anychart.core.ui.TooltipItem)} Title instance or itself for method chaining.
 */
anychart.core.ui.TooltipItem.prototype.title = function(opt_value) {
  if (!this.title_) {
    this.title_ = new anychart.core.ui.Title();
    this.title_.listenSignals(this.onTitleSignal_, this);
    this.title_.setParentEventTarget(this);
    this.registerDisposable(this.title_);
  }

  if (goog.isDef(opt_value)) {
    this.title_.setup(opt_value);
    return this;
  } else {
    return this.title_;
  }
};


/**
 * Internal title invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.ui.TooltipItem.prototype.onTitleSignal_ = function(event) {
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    this.contentBounds_ = null;
    this.invalidate((anychart.ConsistencyState.BOUNDS |
        anychart.ConsistencyState.TOOLTIP_POSITION |
        anychart.ConsistencyState.TOOLTIP_TITLE |
        anychart.ConsistencyState.TOOLTIP_SEPARATOR |
        anychart.ConsistencyState.TOOLTIP_CONTENT |
        anychart.ConsistencyState.TOOLTIP_BACKGROUND),
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
  } else if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.invalidate(anychart.ConsistencyState.TOOLTIP_TITLE, anychart.Signal.NEEDS_REDRAW);
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Separator.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Tooltip item title separator.
 * @param {(Object|boolean|null)=} opt_value Separator settings.
 * @return {!(anychart.core.ui.Separator|anychart.core.ui.TooltipItem)} Separator instance or itself for method chaining.
 */
anychart.core.ui.TooltipItem.prototype.separator = function(opt_value) {
  if (!this.separator_) {
    this.separator_ = new anychart.core.ui.Separator();
    this.separator_.listenSignals(this.onSeparatorSignal_, this);
    this.registerDisposable(this.separator_);
  }

  if (goog.isDef(opt_value)) {
    this.separator_.setup(opt_value);
    return this;
  } else {
    return this.separator_;
  }
};


/**
 * Internal title invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.ui.TooltipItem.prototype.onSeparatorSignal_ = function(event) {
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    this.contentBounds_ = null;
    this.invalidate((anychart.ConsistencyState.BOUNDS |
        anychart.ConsistencyState.TOOLTIP_POSITION |
        anychart.ConsistencyState.TOOLTIP_TITLE |
        anychart.ConsistencyState.TOOLTIP_SEPARATOR |
        anychart.ConsistencyState.TOOLTIP_CONTENT |
        anychart.ConsistencyState.TOOLTIP_BACKGROUND),
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
  } else if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.invalidate(anychart.ConsistencyState.TOOLTIP_SEPARATOR, anychart.Signal.NEEDS_REDRAW);
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Content.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Tooltip item content.
 * @param {(Object|boolean|null|string)=} opt_value Content settings.
 * @return {!(anychart.core.ui.Label|anychart.core.ui.TooltipItem)} Labels instance or itself for method chaining.
 */
anychart.core.ui.TooltipItem.prototype.content = function(opt_value) {
  if (!this.label_) {
    this.label_ = new anychart.core.ui.Label();
    this.label_.listenSignals(this.onContentSignal_, this);
    this.label_.setParentEventTarget(this);
    this.registerDisposable(this.label_);
  }

  if (goog.isDef(opt_value)) {
    this.label_.setup(opt_value);
    return this;
  } else {
    return this.label_;
  }
};


/**
 * Internal title invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.ui.TooltipItem.prototype.onContentSignal_ = function(event) {
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    this.contentBounds_ = null;
    this.invalidate((anychart.ConsistencyState.BOUNDS |
        anychart.ConsistencyState.TOOLTIP_POSITION |
        anychart.ConsistencyState.TOOLTIP_TITLE |
        anychart.ConsistencyState.TOOLTIP_SEPARATOR |
        anychart.ConsistencyState.TOOLTIP_CONTENT |
        anychart.ConsistencyState.TOOLTIP_BACKGROUND),
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
  } else if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.invalidate(anychart.ConsistencyState.TOOLTIP_CONTENT, anychart.Signal.NEEDS_REDRAW);
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Background.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Tooltip item background.
 * @param {(string|Object|null|boolean)=} opt_value Tooltip item background settings.
 * @return {!(anychart.core.ui.Background|anychart.core.ui.TooltipItem)} Background instance or itself for method chaining.
 */
anychart.core.ui.TooltipItem.prototype.background = function(opt_value) {
  if (!this.background_) {
    this.background_ = new anychart.core.ui.Background();
    this.background_.listenSignals(this.backgroundInvalidated_, this);
    this.registerDisposable(this.background_);
  }

  if (goog.isDef(opt_value)) {
    this.background_.setup(opt_value);
    return this;
  } else {
    return this.background_;
  }
};


/**
 * Internal title invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.ui.TooltipItem.prototype.backgroundInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.invalidate(anychart.ConsistencyState.TOOLTIP_BACKGROUND, anychart.Signal.NEEDS_REDRAW);
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Padding.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Tooltip item padding.
 * @param {(string|number|Array.<number|string>|{top:(number|string),left:(number|string),bottom:(number|string),right:(number|string)})=} opt_value Tooltip item padding settings.
 * @return {!(anychart.core.utils.Padding|anychart.core.ui.TooltipItem)} Padding instance or itself for method chaining.
 */
anychart.core.ui.TooltipItem.prototype.padding = function(opt_value) {
  if (!this.padding_) {
    this.padding_ = new anychart.core.utils.Padding();
    this.padding_.listenSignals(this.onPaddingSignal_, this);
    this.registerDisposable(this.padding_);
  }

  if (goog.isDef(opt_value)) {
    this.padding_.setup.apply(this.padding_, arguments);
    return this;
  } else {
    return this.padding_;
  }
};


/**
 * Internal title invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.ui.TooltipItem.prototype.onPaddingSignal_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.contentBounds_ = null;
    this.invalidate(anychart.ConsistencyState.BOUNDS,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Position.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * X coordinate of tooltip item position.
 * @param {number=} opt_value New value of X coordinate of tooltip item position.
 * @return {number|anychart.core.ui.TooltipItem} X coordinate of tooltip item position of itself for method chaining.
 */
anychart.core.ui.TooltipItem.prototype.x = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.x_ != opt_value) {
      this.x_ = opt_value;
      this.position_ = null;
      this.invalidate(anychart.ConsistencyState.TOOLTIP_POSITION,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.x_;
  }
};


/**
 * Y coordinate of tooltip item position.
 * @param {number=} opt_value New value of Y coordinate of tooltip item position.
 * @return {number|anychart.core.ui.TooltipItem} Y coordinate of tooltip item position of itself for method chaining.
 */
anychart.core.ui.TooltipItem.prototype.y = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.y_ != opt_value) {
      this.y_ = opt_value;
      this.position_ = null;
      this.invalidate(anychart.ConsistencyState.TOOLTIP_POSITION,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.y_;
  }
};


/**
 * Offset by X of tooltip item position.
 * @param {number=} opt_value New value of X offset of tooltip item position.
 * @return {number|anychart.core.ui.TooltipItem} X offset of tooltip item position of itself for method chaining.
 */
anychart.core.ui.TooltipItem.prototype.offsetX = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.offsetX_ != opt_value) {
      this.offsetX_ = opt_value;
      this.position_ = null;
      this.invalidate(anychart.ConsistencyState.TOOLTIP_POSITION,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.offsetX_;
  }
};


/**
 * Y offset of tooltip item position.
 * @param {number=} opt_value New value of Y offset of tooltip item position.
 * @return {number|anychart.core.ui.TooltipItem} Y offset of tooltip item position of itself for method chaining.
 */
anychart.core.ui.TooltipItem.prototype.offsetY = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.offsetY_ != opt_value) {
      this.offsetY_ = opt_value;
      this.invalidate(anychart.ConsistencyState.TOOLTIP_POSITION,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.offsetY_;
  }
};


/**
 * Gets or sets Tooltip item anchor settings.
 * @param {(anychart.enums.Anchor|string)=} opt_value Tooltip item anchor settings.
 * @return {anychart.core.ui.TooltipItem|anychart.enums.Anchor} Tooltip item anchor settings or itself for method chaining.
 */
anychart.core.ui.TooltipItem.prototype.anchor = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeAnchor(opt_value);
    if (this.anchor_ != opt_value) {
      this.anchor_ = opt_value;
      this.position_ = null;
      this.invalidate(anychart.ConsistencyState.TOOLTIP_POSITION,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.anchor_;
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Visibility.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Change tooltip item visibility settings.
 * @param {boolean=} opt_value Tooltip item visibility settings.
 * @return {boolean|anychart.core.ui.TooltipItem} Tooltip item visibility settings or itself for method chaining.
 */
anychart.core.ui.TooltipItem.prototype.visible = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.visible_ != opt_value) {
      this.visible_ = opt_value;
      this.invalidate(anychart.ConsistencyState.TOOLTIP_VISIBILITY, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.visible_;
  }
};


/**
 * Sets/gets delay in milliseconds before tooltip item becomes invisible on visible(false) call.
 * @param {number=} opt_value Delay in milliseconds before tooltip item becomes invisible on visible(false) call.
 * @return {number|anychart.core.ui.TooltipItem} delay in milliseconds before tooltip item becomes invisible on visible(false) call or itself for method chaining.
 */
anychart.core.ui.TooltipItem.prototype.hideDelay = function(opt_value) {
  if (goog.isDef(opt_value)) {
    //we have no need to invalidate anything here
    if (this.hideDelay_ != opt_value) {
      this.hideDelay_ = opt_value;
      this.createTimerObject_();
    }
    return this;
  } else {
    return this.hideDelay_;
  }
};


/**
 * Create timer object for hiding with delay, if hiding process has already started,
 * mark timer to recreate after hiding process ends.
 * @private
 */
anychart.core.ui.TooltipItem.prototype.createTimerObject_ = function() {
  if (this.timer_ && this.timer_.isActive()) {
    this.disposeTimerOnTick_ = true;
  } else {
    goog.dispose(this.timer_);
    this.timer_ = new goog.async.Delay(function() {
      this.remove();
      if (this.disposeTimerOnTick_) {
        this.disposeTimerOnTick_ = false;
        this.createTimerObject_();
      }
    }, this.hideDelay_, this);
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Draw tooltip item.
 * @return {anychart.core.ui.TooltipItem} Return itself for method chaining.
 */
anychart.core.ui.TooltipItem.prototype.draw = function() {
  if (!this.checkDrawingNeeded())
    return this;


  var stage = this.container() ? this.container().getStage() : null;
  var manualSuspend = stage && !stage.isSuspended();
  if (manualSuspend) stage.suspend();

  if (!this.layer_) {
    this.layer_ = acgraph.layer();

    this.registerDisposable(this.layer_);
    this.layer_.disablePointerEvents(true);
    this.bindHandlersToGraphics(this.layer_);
  }


  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    this.layer_.zIndex(/** @type {number} */(this.zIndex()));
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER | anychart.ConsistencyState.TOOLTIP_VISIBILITY)) {
    if (this.visible()) {
      this.layer_.parent(/** @type {acgraph.vector.ILayer} */(this.container()));
      this.timer_.stop();
    } else {
      if (this.hideDelay_ <= 0) {
        this.remove();
      } else if (!this.timer_.isActive()) {
        this.timer_.start();
      }
    }
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
    this.markConsistent(anychart.ConsistencyState.TOOLTIP_VISIBILITY);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.TOOLTIP_POSITION)) {
    this.calculatePosition_();

    this.layer_.setTransformationMatrix(1, 0, 0, 1, 0, 0);
    this.layer_.translate(this.position_.x, this.position_.y);

    this.markConsistent(anychart.ConsistencyState.TOOLTIP_POSITION);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.calculateContentBounds_();
    this.boundsWithoutPadding_ = this.padding().tightenBounds(/** @type {!anychart.math.Rect} */(this.contentBounds_));
    this.titleRemainingBounds_ = null;
    this.separatorRemainingBounds_ = null;
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }


  if (this.hasInvalidationState(anychart.ConsistencyState.TOOLTIP_BACKGROUND)) {
    var background = /** @type {anychart.core.ui.Background} */(this.background());
    background.suspendSignalsDispatching();
    background.parentBounds(this.contentBounds_);
    if (this.enabled() && this.visible()) background.container(this.layer_);
    background.resumeSignalsDispatching(false);
    background.draw();

    this.markConsistent(anychart.ConsistencyState.TOOLTIP_BACKGROUND);
  }


  if (this.hasInvalidationState(anychart.ConsistencyState.TOOLTIP_TITLE)) {
    var title = /** @type {anychart.core.ui.Title} */ (this.title());
    title.suspendSignalsDispatching();
    if (this.enabled() && this.visible()) title.container(this.layer_);
    title.parentBounds(this.boundsWithoutPadding_);
    title.resumeSignalsDispatching(false);
    title.draw();

    //title bounds
    if (!this.titleRemainingBounds_ && title.enabled())
      this.titleRemainingBounds_ = title.getRemainingBounds();

    this.markConsistent(anychart.ConsistencyState.TOOLTIP_TITLE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.TOOLTIP_SEPARATOR)) {
    var separator = /** @type {anychart.core.ui.Separator} */(this.separator());
    separator.suspendSignalsDispatching();
    if (this.enabled() && this.visible()) separator.container(this.layer_);
    separator.parentBounds(this.titleRemainingBounds_ || this.boundsWithoutPadding_);
    separator.resumeSignalsDispatching(false);
    separator.draw();

    //separator bounds
    if (!this.separatorRemainingBounds_ && separator.enabled())
      this.separatorRemainingBounds_ = separator.getRemainingBounds();

    this.markConsistent(anychart.ConsistencyState.TOOLTIP_SEPARATOR);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.TOOLTIP_CONTENT)) {
    var label = /** @type {anychart.core.ui.Label} */(this.content());
    var remainingBounds = this.separatorRemainingBounds_ || this.titleRemainingBounds_ || this.boundsWithoutPadding_;
    label.suspendSignalsDispatching();
    if (this.enabled() && this.visible()) label.container(this.layer_);
    label.parentBounds(remainingBounds);
    label.resumeSignalsDispatching(false);
    label.draw();

    this.markConsistent(anychart.ConsistencyState.TOOLTIP_CONTENT);
  }

  if (manualSuspend) stage.resume();

  return this;
};


/** @inheritDoc */
anychart.core.ui.TooltipItem.prototype.remove = function() {
  if (this.layer_) this.layer_.parent(null);
};


/**
 * Calculate tooltip item content bounds and cache it to this.contentBounds_.
 * @private
 */
anychart.core.ui.TooltipItem.prototype.calculateContentBounds_ = function() {
  if (!this.contentBounds_) {
    var result = new anychart.math.Rect(0, 0, 0, 0);
    var separatorBounds;
    var tmpWidth = null;

    var title = /** @type {anychart.core.ui.Title} */(this.title());
    if (title.enabled()) {
      title.parentBounds(null);
      // fix for title.width('100%');
      if (anychart.utils.isPercent(title.width())) {
        tmpWidth = /** @type {number|string|null} */(title.width());
        title.width(null);
      }
      var titleBounds = title.getContentBounds();
      result.width = Math.max(result.width, titleBounds.width);
      result.height += titleBounds.height;

      if (tmpWidth) {
        title.width(tmpWidth);
        tmpWidth = null;
      }
    }

    var label = /** @type {anychart.core.ui.Label} */(this.content());
    if (label.enabled()) {
      label.parentBounds(null);
      // fix for content.width('100%');
      if (anychart.utils.isPercent(label.width())) {
        tmpWidth = /** @type {number|string|null} */(label.width());
        label.width(null);
      }
      var contentBounds = label.getContentBounds();
      result.width = Math.max(result.width, contentBounds.width);
      result.height += contentBounds.height;

      if (tmpWidth) {
        label.width(tmpWidth);
        tmpWidth = null;
      }
    }

    // fix for title and content .width('100%');
    if (title.enabled()) {
      title.parentBounds(new anychart.math.Rect(0, 0, result.width, titleBounds.height));
    }
    if (label.enabled()) {
      label.parentBounds(new anychart.math.Rect(0, 0, result.width, contentBounds.height));
    }

    var separator = /** @type {anychart.core.ui.Separator} */(this.separator());
    if (separator.enabled()) {
      separator.parentBounds((title.enabled() || label.enabled()) ? result : null);
      separatorBounds = separator.getContentBounds();
      result.width = Math.max(result.width, separatorBounds.width);
      result.height += separatorBounds.height;
    }

    this.contentBounds_ = this.padding().widenBounds(result);
  }
};


/**
 * Calculate tooltip item position and cache it to this.position_.
 * @private
 */
anychart.core.ui.TooltipItem.prototype.calculatePosition_ = function() {
  this.calculateContentBounds_();

  if (!this.position_) {
    /** @type {acgraph.math.Coordinate} */
    var position = new acgraph.math.Coordinate(this.x_, this.y_);
    var anchor = anychart.utils.getCoordinateByAnchor(this.contentBounds_, this.anchor_);
    position.x -= anchor.x;
    position.y -= anchor.y;
    anychart.utils.applyOffsetByAnchor(position, this.anchor_, this.offsetX_, this.offsetY_);
    this.position_ = position;
  }
};


/**
 * Return Tooltip item content bounds.
 * @return {anychart.math.Rect} Tooltip item content bounds.
 */
anychart.core.ui.TooltipItem.prototype.getPixelBounds = function() {
  this.calculatePosition_(); //also calculate content bounds, because it needs it.
  return new anychart.math.Rect(this.position_.x, this.position_.y, this.contentBounds_.width, this.contentBounds_.height);
};


/**
 * Return Tooltip item content bounds.
 * @return {anychart.math.Rect} Tooltip item content bounds.
 */
anychart.core.ui.TooltipItem.prototype.getContentBounds = function() {
  this.calculateContentBounds_();
  return this.contentBounds_;
};


//anychart.core.ui.TooltipItem.prototype['title'] = anychart.core.ui.TooltipItem.prototype.title;
//anychart.core.ui.TooltipItem.prototype['separator'] = anychart.core.ui.TooltipItem.prototype.separator;
//anychart.core.ui.TooltipItem.prototype['content'] = anychart.core.ui.TooltipItem.prototype.content;
//anychart.core.ui.TooltipItem.prototype['background'] = anychart.core.ui.TooltipItem.prototype.background;
//anychart.core.ui.TooltipItem.prototype['padding'] = anychart.core.ui.TooltipItem.prototype.padding;
//anychart.core.ui.TooltipItem.prototype['x'] = anychart.core.ui.TooltipItem.prototype.x;
//anychart.core.ui.TooltipItem.prototype['y'] = anychart.core.ui.TooltipItem.prototype.y;
//anychart.core.ui.TooltipItem.prototype['offsetX'] = anychart.core.ui.TooltipItem.prototype.offsetX;
//anychart.core.ui.TooltipItem.prototype['offsetY'] = anychart.core.ui.TooltipItem.prototype.offsetY;
//anychart.core.ui.TooltipItem.prototype['anchor'] = anychart.core.ui.TooltipItem.prototype.anchor;
//anychart.core.ui.TooltipItem.prototype['visible'] = anychart.core.ui.TooltipItem.prototype.visible;
//anychart.core.ui.TooltipItem.prototype['hideDelay'] = anychart.core.ui.TooltipItem.prototype.hideDelay;
//anychart.core.ui.TooltipItem.prototype['draw'] = anychart.core.ui.TooltipItem.prototype.draw;
//exports
