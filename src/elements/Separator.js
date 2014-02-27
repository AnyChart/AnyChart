goog.provide('anychart.elements.Separator');



/**
 * Class is responsible for separator element.
 * @constructor
 * @extends {anychart.elements.Base}
 */
anychart.elements.Separator = function() {
  goog.base(this);

  /**
   * Path of the separator.
   * @type {acgraph.vector.Path}
   * @private
   */
  this.path_ = null;

  /**
   * Separator fill.
   * @type {!Array}
   * @private
   */
  this.fill_;

  /**
   * Separator stroke.
   * @type {!Array}
   * @private
   */
  this.stroke_;

  /**
   * Drawer function.
   * @type {function(acgraph.vector.Path, anychart.math.Rect)}
   * @private
   */
  this.drawer_;

  /**
   * Width settings for the separator.
   * @type {number|string|null}
   * @private
   */
  this.width_ = null;

  /**
   * Height settings for the separator.
   * @type {number|string|null}
   * @private
   */
  this.height_ = null;

  /**
   * Separator margin.
   * @type {anychart.utils.Margin}
   */
  this.margin_;

  /**
   * Separator`s left position.
   * @type {number}
   * @private
   */
  this.actualLeft_ = NaN;

  /**
   * Separator`s top position.
   * @type {number}
   * @private
   */
  this.actualTop_ = NaN;

  /**
   * Parent bounds stored.
   * @type {anychart.math.Rect}
   * @private
   */
  this.parentBounds_ = null;

  /**
   * Pixel bounds due to orientation, margins, etc.
   * @type {anychart.math.Rect}
   * @private
   */
  this.pixelBounds_ = null;

  /**
   * Separator margin.
   * @type {anychart.utils.Margin}
   * @private
   */
  this.margin_ = null;

  /**
   * Separator orientation.
   * @type {anychart.utils.Orientation}
   * @private
   */
  this.orientation_;

  this.restoreDefaults();

  this.silentlyInvalidate(anychart.utils.ConsistencyState.ALL);
};
goog.inherits(anychart.elements.Separator, anychart.elements.Base);


/**
 * Dispatched consistency states.
 * @type {number}
 */
anychart.elements.Separator.prototype.DISPATCHED_CONSISTENCY_STATES =
    anychart.elements.Base.prototype.DISPATCHED_CONSISTENCY_STATES |
        anychart.utils.ConsistencyState.APPEARANCE |
        anychart.utils.ConsistencyState.PIXEL_BOUNDS;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.elements.Separator.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.elements.Base.prototype.SUPPORTED_CONSISTENCY_STATES |
        anychart.utils.ConsistencyState.APPEARANCE |
        anychart.utils.ConsistencyState.PIXEL_BOUNDS;


/**
 * Устанавливает/Возвращает баунды отностительно которых идут рассчеты позиционирования элемента.
 * @param {anychart.math.Rect=} opt_value .
 * @return {!anychart.elements.Separator|anychart.math.Rect} .
 */
anychart.elements.Separator.prototype.parentBounds = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.parentBounds_ != opt_value) {
      this.parentBounds_ = opt_value;
      this.invalidate(anychart.utils.ConsistencyState.PIXEL_BOUNDS);
    }
    return this;
  }
  return this.parentBounds_;
};


/**
 * Getter/setter for separator width.
 * @param {(number|string|null)=} opt_value .
 * @return {!anychart.elements.Separator|number|string|null} .
 */
anychart.elements.Separator.prototype.width = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.width_ != opt_value) {
      this.width_ = opt_value;
      this.invalidate(anychart.utils.ConsistencyState.PIXEL_BOUNDS);
    }
    return this;
  }
  return this.width_;
};


/**
 * Getter/setter for separator height.
 * @param {(number|string|null)=} opt_value .
 * @return {!anychart.elements.Separator|number|string|null} .
 */
anychart.elements.Separator.prototype.height = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.height_ != opt_value) {
      this.height_ = opt_value;
      this.invalidate(anychart.utils.ConsistencyState.PIXEL_BOUNDS);
    }
    return this;
  }
  return this.height_;
};


/**
 * Margin of the separator
 * @param {(string|number|anychart.utils.Space)=} opt_spaceOrTopOrTopAndBottom .
 * @param {(string|number)=} opt_rightOrRightAndLeft .
 * @param {(string|number)=} opt_bottom .
 * @param {(string|number)=} opt_left .
 * @return {anychart.elements.Separator|anychart.utils.Margin} .
 */
anychart.elements.Separator.prototype.margin = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  if (!this.margin_) {
    this.margin_ = new anychart.utils.Margin();
    this.registerDisposable(this.margin_);
    this.margin_.listenInvalidation(this.boundsInvalidated_, this);
  }
  if (goog.isDef(opt_spaceOrTopOrTopAndBottom)) {
    this.margin_.set.apply(this.margin_, arguments);
    return this;
  }
  return this.margin_;
};


/**
 * Orientation of the separator.
 * @param {(anychart.utils.Orientation|string)=} opt_value .
 * @return {!anychart.elements.Separator|anychart.utils.Orientation} .
 */
anychart.elements.Separator.prototype.orientation = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.normalizeOrientation(opt_value);
    if (this.orientation_ != opt_value) {
      this.orientation_ = opt_value;
      this.invalidate(anychart.utils.ConsistencyState.PIXEL_BOUNDS);
    }
    return this;
  }
  return this.orientation_;
};


/**
 * Separator fill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {!(acgraph.vector.Fill|anychart.elements.Separator)} .
 */
anychart.elements.Separator.prototype.fill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var val = goog.array.slice(arguments, 0);
    if (!goog.array.equals(val, this.fill_)) {
      this.fill_ = val;
      this.invalidate(anychart.utils.ConsistencyState.APPEARANCE);
    }
    return this;
  } else {
    return this.fill_[0] || null;
  }
};


/**
 * Separator stroke.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill .
 * @param {number=} opt_thickness .
 * @param {string=} opt_dashpattern .
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin .
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap .
 * @return {(!anychart.elements.Separator|acgraph.vector.Stroke)} .
 */
anychart.elements.Separator.prototype.stroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var val = goog.array.slice(arguments, 0);
    if (!goog.array.equals(val, this.stroke_)) {
      this.stroke_ = val;
      this.invalidate(anychart.utils.ConsistencyState.APPEARANCE);
    }
    return this;
  } else {
    return this.stroke_[0] || null;
  }
};


/**
 * Getter/Setter for function drawing separator.
 * @param {function(acgraph.vector.Path, anychart.math.Rect)=} opt_value Drawer function.
 * @return {(function(acgraph.vector.Path, anychart.math.Rect)|anychart.elements.Separator)} Drawer function or self for chaining.
 */
anychart.elements.Separator.prototype.drawer = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.drawer_ != opt_value) {
      this.drawer_ = opt_value;
      this.invalidate(anychart.utils.ConsistencyState.APPEARANCE);
    }
    return this;
  }
  return this.drawer_;
};


/**
 * Draw separator.
 * @return {!anychart.elements.Separator} Экземпляр класса {@link anychart.elements.Separator} для цепочного вызова.
 */
anychart.elements.Separator.prototype.draw = function() {
  if (this.isConsistent()) return this;

  var isInitial;

  if (isInitial = !this.path_) {
    this.path_ = acgraph.path();
    this.registerDisposable(this.path_);
  }

  this.resolveEnabledState();

  var container = /** @type {acgraph.vector.ILayer} */(this.container());
  var stage = container ? container.getStage() : null;
  var manualSuspend = stage && !stage.isSuspended();
  if (manualSuspend) stage.suspend();

  if (this.hasInvalidationState(anychart.utils.ConsistencyState.PIXEL_BOUNDS)) {
    this.calculateSeparatorBounds_();
    this.silentlyInvalidate(anychart.utils.ConsistencyState.APPEARANCE);
    this.markConsistent(anychart.utils.ConsistencyState.PIXEL_BOUNDS);
  }

  if (this.hasInvalidationState(anychart.utils.ConsistencyState.APPEARANCE)) {
    this.path_.fill(/** @type {acgraph.vector.Fill} */ (this.fill()));
    this.path_.stroke(/** @type {acgraph.vector.Stroke} */ (this.stroke()));
    this.path_.clear();

    var bounds = new anychart.math.Rect(this.actualLeft_, this.actualTop_, this.separatorWidth_, this.separatorHeight_);
    if (this.drawer_ && goog.isFunction(this.drawer_)) {
      this.drawer_(this.path_, bounds);
    }
    //    this.drawInternal(bounds);
    this.markConsistent(anychart.utils.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.utils.ConsistencyState.CONTAINER)) {
    this.path_.parent(container);
    this.markConsistent(anychart.utils.ConsistencyState.CONTAINER);
  }

  if (this.hasInvalidationState(anychart.utils.ConsistencyState.Z_INDEX)) {
    var zIndex = /** @type {number} */ (this.zIndex());
    this.path_.zIndex(zIndex);
    this.markConsistent(anychart.utils.ConsistencyState.Z_INDEX);
  }

  if (manualSuspend) stage.resume();
  return this;
};


/** @inheritDoc */
anychart.elements.Separator.prototype.restore = function() {
  if (this.path_ && this.enabled()) this.path_.parent(/** @type {acgraph.vector.ILayer} */(this.container()));
};


/** @inheritDoc */
anychart.elements.Separator.prototype.remove = function() {
  if (this.path_) this.path_.parent(null);
};


/**
 * @return {!anychart.math.Rect} Parent bounds without the space used by the title.
 */
anychart.elements.Separator.prototype.getRemainingBounds = function() {
  if (!this.pixelBounds_ || this.hasInvalidationState(anychart.utils.ConsistencyState.PIXEL_BOUNDS))
    this.calculateSeparatorBounds_();
  /** @type {anychart.math.Rect} */
  var parentBounds;
  if (this.parentBounds_) {
    parentBounds = this.parentBounds_.clone();
  } else {
    var container = /** @type {acgraph.vector.ILayer} */(this.container());
    var stage = container ? container.getStage() : null;
    if (stage) {
      parentBounds = stage.getBounds(); // cloned already
    } else {
      return new anychart.math.Rect(0, 0, 0, 0);
    }
  }

  if (!this.enabled()) return parentBounds;

  switch (this.orientation_) {
    case anychart.utils.Orientation.TOP:
      parentBounds.top += this.pixelBounds_.height;
      parentBounds.height -= this.pixelBounds_.height;
      break;
    case anychart.utils.Orientation.RIGHT:
      parentBounds.width -= this.pixelBounds_.width;
      break;
    case anychart.utils.Orientation.BOTTOM:
      parentBounds.height -= this.pixelBounds_.height;
      break;
    case anychart.utils.Orientation.LEFT:
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
anychart.elements.Separator.prototype.calculateSeparatorBounds_ = function() {
  if (!this.enabled()) return;
  var container = /** @type {acgraph.vector.ILayer} */(this.container());
  var stage = container ? container.getStage() : null;

  var margin = this.margin();

  /** @type {anychart.math.Rect} */
  var parentBounds;
  if (this.parentBounds_) {
    parentBounds = this.parentBounds_;
  } else if (stage) {
    parentBounds = stage.getBounds();
  } else {
    parentBounds = null;
  }

  var parentWidth, parentHeight;
  if (parentBounds) {
    if (this.orientation_ == anychart.utils.Orientation.TOP ||
        this.orientation_ == anychart.utils.Orientation.BOTTOM) {
      parentWidth = parentBounds.width;
      parentHeight = parentBounds.height;
    } else {
      parentWidth = parentBounds.height;
      parentHeight = parentBounds.width;
    }
  } else {
    parentWidth = parentHeight = undefined;
  }

  var width = anychart.isNone(this.width_) ? '100%' : this.width_;
  var height = anychart.isNone(this.height_) ? '100%' : this.height_;

  var separatorWidth = anychart.utils.normalize(/** @type {number} */ (width), parentWidth);
  if (parentBounds && parentWidth < margin.widenWidth(separatorWidth)) {
    separatorWidth = margin.tightenWidth(parentWidth);
  }

  var separatorHeight = anychart.utils.normalize(/** @type {number} */ (height), parentHeight);
  if (parentBounds && parentHeight < margin.widenHeight(separatorHeight)) {
    separatorHeight = margin.tightenHeight(parentHeight);
  }

  var widthWithMargin = margin.widenWidth(separatorWidth);
  var heightWithMargin = margin.widenHeight(separatorHeight);

  var leftMargin = anychart.utils.normalize(/** @type {number} */ (margin.left()), parentWidth);
  var topMargin = anychart.utils.normalize(/** @type {number} */ (margin.top()), parentHeight);

  if (parentBounds) {
    switch (this.orientation_) {
      case anychart.utils.Orientation.TOP:
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

      case anychart.utils.Orientation.BOTTOM:
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

      case anychart.utils.Orientation.LEFT:
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

      case anychart.utils.Orientation.RIGHT:
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
    this.pixelBounds_ = new anychart.math.Rect(0, 0, widthWithMargin, heightWithMargin);
  }
};


/**
 * Listener for bounds invalidation.
 * @param {anychart.utils.InvalidatedStatesEvent} event Invalidation event.
 * @private
 */
anychart.elements.Separator.prototype.boundsInvalidated_ = function(event) {
  if (event.invalidated(anychart.utils.ConsistencyState.BOUNDS)) {
    this.invalidate(anychart.utils.ConsistencyState.PIXEL_BOUNDS);
  }
};


/**
 * Restore separator default settings.
 */
anychart.elements.Separator.prototype.restoreDefaults = function() {
  this.orientation(anychart.utils.Orientation.TOP);
  this.margin(0, 0, 10, 0);
  this.width(null);
  this.height(null);

  this.fill('#d0d0d0');
  this.stroke('none');

  this.drawer(function(path, bounds) {
    path
        .moveTo(bounds.left, bounds.top)
        .lineTo(bounds.getRight(), bounds.top)
        .lineTo(bounds.getRight(), bounds.getBottom())
        .lineTo(bounds.left, bounds.getBottom())
        .close();
  });
};


/**
 * @inheritDoc
 */
anychart.elements.Separator.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  json['width'] = this.width();
  json['height'] = this.height();
  json['orientation'] = this.orientation();
  json['fill'] = this.fill();
  json['stroke'] = this.stroke();
  if (this.margin_)
    json['margin'] = this.margin_.serialize();
  return json;
};


/**
 * @inheritDoc
 */
anychart.elements.Separator.prototype.deserialize = function(config) {
  goog.base(this, 'deserialize', config);
  this.width(config['width']);
  this.height(config['height']);
  this.margin(config['margin']);
  this.orientation(config['orientation']);
  this.fill(config['fill']);
  this.stroke(config['stroke']);
};
