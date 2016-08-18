goog.provide('anychart.core.ui.Background');
goog.require('acgraph');
goog.require('anychart.color');
goog.require('anychart.core.VisualBaseWithBounds');
goog.require('anychart.enums');
goog.require('anychart.math.Rect');
goog.require('goog.array');



/**
 * Background element class.<br/>
 * Background can be a part of another complex element (chart, legend, title and so on),
 * or used separately.<br/>
 * Background has a fill, a border and corner shape settings.<br/>
 * <b>Note:</b> Always specify display bounds if you use Background separately.
 * @extends {anychart.core.VisualBaseWithBounds}
 * @constructor
 */
anychart.core.ui.Background = function() {
  this.suspendSignalsDispatching();
  goog.base(this);

  /**
   * Graphics element that represents background path.
   * @type {acgraph.vector.Rect}
   * @private
   */
  this.rect_ = null;

  /**
   * We add a default here, because too many backgrounds are created in too many places to put this default there.
   * @type {anychart.enums.BackgroundCornersType}
   * @private
   */
  this.cornerType_;

  /**
   * @type {!Array}
   * @private
   */
  this.corners_;

  /**
   * Fill settings.
   * @type {acgraph.vector.Fill}
   * @private
   */
  this.fill_;

  /**
   * Stroke settings.
   * @type {acgraph.vector.Stroke}
   * @private
   */
  this.stroke_;

  /**
   * Pointer events.
   * @type {boolean}
   * @private
   */
  this.disablePointerEvents_ = false;

  this.resumeSignalsDispatching(false);
};
goog.inherits(anychart.core.ui.Background, anychart.core.VisualBaseWithBounds);


/**
 * Supported signals.
 * @type {number}
 */
anychart.core.ui.Background.prototype.SUPPORTED_SIGNALS =
    anychart.core.VisualBaseWithBounds.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.ui.Background.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBaseWithBounds.prototype.SUPPORTED_CONSISTENCY_STATES |
        anychart.ConsistencyState.APPEARANCE |
        anychart.ConsistencyState.BACKGROUND_POINTER_EVENTS;


//----------------------------------------------------------------------------------------------------------------------
//
//  Corners.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for corners.
 * @param {(number|string|Array.<number|string>)=} opt_value .
 * @return {(Array.<number|string>|!anychart.core.ui.Background)} .
 */
anychart.core.ui.Background.prototype.corners = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val;
    if (goog.isArray(opt_value)) {
      val = opt_value;
    } else if (goog.isObject(opt_value)) {
      val = [
        anychart.utils.toNumber(opt_value['leftTop']) || 0,
        anychart.utils.toNumber(opt_value['rightTop']) || 0,
        anychart.utils.toNumber(opt_value['rightBottom']) || 0,
        anychart.utils.toNumber(opt_value['leftBottom']) || 0
      ];
    } else {
      val = goog.array.slice(arguments, 0);
    }
    if (!goog.array.equals(val, this.corners_)) {
      this.corners_ = val;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.corners_;
  }
};


/**
 * Getter/setter for cornerType.
 * @param {(anychart.enums.BackgroundCornersType|string)=} opt_value Corner type.
 * @return {anychart.enums.BackgroundCornersType|!anychart.core.ui.Background} Corners type or self for method chaining.
 */
anychart.core.ui.Background.prototype.cornerType = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeBackgroundCornerType(opt_value);
    if (opt_value != this.cornerType_) {
      this.cornerType_ = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    // that is so easy to fix it like that...
    return this.cornerType_;
  }
};


/**
 * Getter/setter for fill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {!(acgraph.vector.Fill|anychart.core.ui.Background)} .
 */
anychart.core.ui.Background.prototype.fill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var val = acgraph.vector.normalizeFill.apply(null, arguments);
    if (!anychart.color.equals(this.fill_, val)) {
      this.fill_ = val;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.fill_ || 'none';
  }
};


/**
 * Getter/setter for stroke.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill .
 * @param {number=} opt_thickness .
 * @param {string=} opt_dashpattern .
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin .
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap .
 * @return {(!anychart.core.ui.Background|acgraph.vector.Stroke)} .
 */
anychart.core.ui.Background.prototype.stroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var val = acgraph.vector.normalizeStroke.apply(null, arguments);
    if (!anychart.color.equals(val, this.stroke_)) {
      var state = anychart.ConsistencyState.APPEARANCE;
      var signal = anychart.Signal.NEEDS_REDRAW;
      if (!this.stroke_ || (acgraph.vector.getThickness(val) != acgraph.vector.getThickness(this.stroke_))) {
        state |= anychart.ConsistencyState.BOUNDS;
        state |= anychart.Signal.BOUNDS_CHANGED;
      }
      this.stroke_ = val;
      this.invalidate(state, signal);
    }
    return this;
  } else {
    return this.stroke_ || 'none';
  }
};


/**
 * Pointer events.
 * @param {boolean=} opt_value
 * @return {!anychart.core.ui.Background|boolean}
 */
anychart.core.ui.Background.prototype.disablePointerEvents = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = !!opt_value;
    if (opt_value != this.disablePointerEvents_) {
      this.disablePointerEvents_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BACKGROUND_POINTER_EVENTS, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.disablePointerEvents_;
  }
};


/**
 * Render background.
 * @return {!anychart.core.ui.Background} {@link anychart.core.ui.Background} instance for method chaining.
 */
anychart.core.ui.Background.prototype.draw = function() {
  if (!this.checkDrawingNeeded())
    return this;

  if (!this.rect_) {
    this.rect_ = acgraph.rect();
    this.registerDisposable(this.rect_);
  }

  var stage = this.container() ? this.container().getStage() : null;
  var manualSuspend = stage && !stage.isSuspended();
  if (manualSuspend) stage.suspend();

  if (this.hasInvalidationState(anychart.ConsistencyState.BACKGROUND_POINTER_EVENTS)) {
    this.rect_.disablePointerEvents(this.disablePointerEvents_);
    this.markConsistent(anychart.ConsistencyState.BACKGROUND_POINTER_EVENTS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    var bounds = this.getPixelBounds();
    var thicknessHalf = this.rect_.strokeThickness() / 2;
    //TODO(Anton Saukh): remove this fix when graphics is fixed.
    if (isNaN(thicknessHalf)) thicknessHalf = .5;
    bounds.left += thicknessHalf;
    bounds.top += thicknessHalf;
    bounds.width -= thicknessHalf + thicknessHalf;
    bounds.height -= thicknessHalf + thicknessHalf;
    this.rect_.setBounds(bounds);
    this.markConsistent(anychart.ConsistencyState.BOUNDS);

    if (goog.isObject(this.fill_) && ('keys' in this.fill_ || 'src' in this.fill_))
      this.invalidate(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    this.rect_.fill(/** @type {acgraph.vector.Fill} */ (this.fill()));
    this.rect_.stroke(/** @type {acgraph.vector.Stroke} */ (this.stroke()));
    switch (this.cornerType_) {
      case anychart.enums.BackgroundCornersType.ROUND:
        this.rect_.round.apply(this.rect_, this.corners_);
        break;
      case anychart.enums.BackgroundCornersType.CUT:
        this.rect_.cut.apply(this.rect_, this.corners_);
        break;
      case anychart.enums.BackgroundCornersType.ROUND_INNER:
        this.rect_.roundInner.apply(this.rect_, this.corners_);
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

  var thickness = anychart.utils.isNone(this.stroke_) ? 0 : acgraph.vector.getThickness(this.stroke_);

  parentBounds.top += thickness;
  parentBounds.left += thickness;
  parentBounds.height -= 2 * thickness;
  parentBounds.width -= 2 * thickness;

  return parentBounds;
};


/** @inheritDoc */
anychart.core.ui.Background.prototype.remove = function() {
  if (this.rect_) this.rect_.parent(null);
};


/** @inheritDoc */
anychart.core.ui.Background.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');

  if (this.fill_) {
    json['fill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill} */(this.fill()));
  }

  if (this.stroke_) {
    json['stroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke} */(this.stroke()));
  }

  if (this.cornerType_)
    json['cornerType'] = this.cornerType();

  var corners = /** @type {Array} */(this.corners());
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
anychart.core.ui.Background.prototype.setupSpecial = function(var_args) {
  var args = arguments;
  if (goog.isString(args[0])) {
    this.fill(args[0]);
    this.stroke(null);
    this.enabled(true);
    return true;
  }
  return anychart.core.VisualBaseWithBounds.prototype.setupSpecial.apply(this, arguments);
};


/** @inheritDoc */
anychart.core.ui.Background.prototype.setupByJSON = function(config) {
  goog.base(this, 'setupByJSON', config);
  this.fill(config['fill']);
  this.stroke(config['stroke']);
  this.cornerType(config['cornerType']);
  this.corners(config['corners']);
};


/** @inheritDoc */
anychart.core.ui.Background.prototype.disposeInternal = function() {
  if (this.rect_) {
    this.rect_.parent(null);
    goog.dispose(this.rect_);
    this.rect_ = null;
  }

  delete this.fill_;
  delete this.stroke_;
  delete this.cornerType_;
  if (this.corners_)
    this.corners_.length = 0;
  delete this.corners_;

  goog.base(this, 'disposeInternal');
};


//exports
anychart.core.ui.Background.prototype['fill'] = anychart.core.ui.Background.prototype.fill;//in docs/final
anychart.core.ui.Background.prototype['stroke'] = anychart.core.ui.Background.prototype.stroke;//in docs/final
anychart.core.ui.Background.prototype['cornerType'] = anychart.core.ui.Background.prototype.cornerType;//in docs/final
anychart.core.ui.Background.prototype['corners'] = anychart.core.ui.Background.prototype.corners;//in docs/final
