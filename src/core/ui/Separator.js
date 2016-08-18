goog.provide('anychart.core.ui.Separator');
goog.require('acgraph');
goog.require('anychart.color');
goog.require('anychart.core.VisualBase');
goog.require('anychart.core.utils.Margin');
goog.require('anychart.enums');
goog.require('anychart.math.Rect');
goog.require('anychart.utils');



/**
 * Class for a separator element.
 * @constructor
 * @extends {anychart.core.VisualBase}
 */
anychart.core.ui.Separator = function() {
  goog.base(this);

  /**
   * Path of the separator.
   * @type {acgraph.vector.Path}
   * @private
   */
  this.path_ = null;

  /**
   * Separator fill.
   * @type {acgraph.vector.Fill}
   * @private
   */
  this.fill_;

  /**
   * Separator stroke.
   * @type {acgraph.vector.Stroke}
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
   * Separator orientation.
   * @type {anychart.enums.Orientation}
   * @private
   */
  this.orientation_;

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
        anychart.Signal.BOUNDS_CHANGED;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.ui.Separator.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES |
        anychart.ConsistencyState.APPEARANCE |
        anychart.ConsistencyState.BOUNDS;


/** @inheritDoc */
anychart.core.ui.Separator.prototype.invalidateParentBounds = function() {
  this.invalidate(anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
};


/**
 * Getter/setter for width.
 * @param {(number|string|null)=} opt_value .
 * @return {!anychart.core.ui.Separator|number|string|null} .
 */
anychart.core.ui.Separator.prototype.width = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.width_ != opt_value) {
      this.width_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.APPEARANCE,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.width_;
};


/**
 * Getter/setter for height.
 * @param {(number|string|null)=} opt_value .
 * @return {!anychart.core.ui.Separator|number|string|null} .
 */
anychart.core.ui.Separator.prototype.height = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.height_ != opt_value) {
      this.height_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.APPEARANCE,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.height_;
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
 * Orientation of the separator.
 * @param {(anychart.enums.Orientation|string)=} opt_value .
 * @return {!anychart.core.ui.Separator|anychart.enums.Orientation} .
 */
anychart.core.ui.Separator.prototype.orientation = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeOrientation(opt_value);
    if (this.orientation_ != opt_value) {
      this.orientation_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.APPEARANCE,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.orientation_;
};


/**
 * Separator fill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {!(acgraph.vector.Fill|anychart.core.ui.Separator)} .
 */
anychart.core.ui.Separator.prototype.fill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var val = acgraph.vector.normalizeFill.apply(null, arguments);
    if (!anychart.color.equals(val, this.fill_)) {
      this.fill_ = val;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.fill_ || 'none';
  }
};


/**
 * Separator stroke.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill .
 * @param {number=} opt_thickness .
 * @param {string=} opt_dashpattern .
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin .
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap .
 * @return {(!anychart.core.ui.Separator|acgraph.vector.Stroke)} .
 */
anychart.core.ui.Separator.prototype.stroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var val = acgraph.vector.normalizeStroke.apply(null, arguments);
    if (!anychart.color.equals(val, this.stroke_)) {
      this.stroke_ = val;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.stroke_ || 'none';
  }
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
    this.path_.fill(/** @type {acgraph.vector.Fill} */ (this.fill()));
    this.path_.stroke(/** @type {acgraph.vector.Stroke} */ (this.stroke()));
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

  switch (this.orientation_) {
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

  var width = anychart.utils.isNone(this.width_) ? '100%' : this.width_;
  var height = anychart.utils.isNone(this.height_) ? '100%' : this.height_;

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

  var leftMargin = anychart.utils.normalizeSize(/** @type {number} */ (margin.left()), parentWidth);
  var topMargin = anychart.utils.normalizeSize(/** @type {number} */ (margin.top()), parentHeight);

  if (parentBounds) {
    switch (this.orientation_) {
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
  return (this.orientation_ == anychart.enums.Orientation.TOP || this.orientation_ == anychart.enums.Orientation.BOTTOM);
};


/** @inheritDoc */
anychart.core.ui.Separator.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  if (goog.isDefAndNotNull(this.width()))
    json['width'] = this.width();
  if (goog.isDefAndNotNull(this.height()))
    json['height'] = this.height();
  if (this.orientation())
    json['orientation'] = this.orientation();
  json['margin'] = this.margin().serialize();
  if (this.fill_)
    json['fill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill} */(this.fill()));
  if (this.stroke_)
    json['stroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke} */(this.stroke()));
  return json;
};


/** @inheritDoc */
anychart.core.ui.Separator.prototype.setupByJSON = function(config) {
  goog.base(this, 'setupByJSON', config);
  this.width(config['width']);
  this.height(config['height']);
  this.margin(config['margin']);
  this.orientation(config['orientation']);
  this.fill(config['fill']);
  this.stroke(config['stroke']);
};


//anychart.core.ui.Separator.prototype['drawer'] = anychart.core.ui.Separator.prototype.drawer;
//anychart.core.ui.Separator.prototype['draw'] = anychart.core.ui.Separator.prototype.draw;
//exports
anychart.core.ui.Separator.prototype['width'] = anychart.core.ui.Separator.prototype.width;
anychart.core.ui.Separator.prototype['height'] = anychart.core.ui.Separator.prototype.height;
anychart.core.ui.Separator.prototype['margin'] = anychart.core.ui.Separator.prototype.margin;
anychart.core.ui.Separator.prototype['orientation'] = anychart.core.ui.Separator.prototype.orientation;
anychart.core.ui.Separator.prototype['fill'] = anychart.core.ui.Separator.prototype.fill;
anychart.core.ui.Separator.prototype['stroke'] = anychart.core.ui.Separator.prototype.stroke;
anychart.core.ui.Separator.prototype['getRemainingBounds'] = anychart.core.ui.Separator.prototype.getRemainingBounds;
