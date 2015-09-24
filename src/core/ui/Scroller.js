goog.provide('anychart.core.ui.Scroller');
goog.require('acgraph');
goog.require('anychart.core.VisualBase');
goog.require('anychart.enums');
goog.require('goog.events.EventType');
goog.require('goog.fx.Dragger');
goog.require('goog.style');



/**
 * Scroller ui element
 * @constructor
 * @extends {anychart.core.VisualBase}
 */
anychart.core.ui.Scroller = function() {
  goog.base(this);

  /**
   * If thumbs are shown. Cache to avoid children search.
   * @type {boolean}
   * @private
   */
  this.thumbsShown_ = false;

  /**
   * Root layer element.
   * @type {acgraph.vector.Layer}
   * @protected
   */
  this.rootLayer = null;

  /**
   * Left thumb. Always left - they swap on crossing.
   * @type {acgraph.vector.Path}
   * @private
   */
  this.leftThumb_ = null;

  /**
   * Right thumb. We cannot call them left and right, because they can swap.
   * @type {acgraph.vector.Path}
   * @private
   */
  this.rightThumb_ = null;

  /**
   * Selected range outline path.
   * @type {acgraph.vector.Path}
   * @private
   */
  this.selectedRangeOutline_ = null;

  /**
   * Non selected background rect.
   * @type {acgraph.vector.Rect}
   * @private
   */
  this.nonSelectedBackground_ = null;

  /**
   * Selected background rect.
   * @type {acgraph.vector.Rect}
   * @private
   */
  this.selectedBackground_ = null;

  /**
   * Selected range clip.
   * @type {acgraph.vector.Clip}
   * @protected
   */
  this.selectedClipRect = null;

  /**
   * Start ratio in range [0..anychart.core.ui.Scroller.MAX_RATIO]
   * @type {number}
   * @private
   */
  this.startRatio_ = 0;

  /**
   * End ratio in range [0..anychart.core.ui.Scroller.MAX_RATIO]
   * @type {number}
   * @private
   */
  this.endRatio_ = anychart.core.ui.Scroller.MAX_RATIO;

  /**
   * Cache of pixel bounds. Updated in draw().
   * @type {!anychart.math.Rect}
   * @protected
   */
  this.pixelBoundsCache = new anychart.math.Rect(0, 0, 0, 0);

  /**
   * Left thumb dragger.
   * @type {anychart.core.ui.Scroller.Dragger}
   * @private
   */
  this.leftThumbDragger_ = null;

  /**
   * Right thumb dragger.
   * @type {anychart.core.ui.Scroller.Dragger}
   * @private
   */
  this.rightThumbDragger_ = null;

  /**
   * Selected range dragger.
   * @type {anychart.core.ui.Scroller.Dragger}
   * @private
   */
  this.selectedRangeDragger_ = null;

  /**
   * Indicates if the scroller is in dragging action. Used to avoid thumbs hiding in drag. Not a boolean due to a
   * small possibility to get multiple drag on touch devices.
   * @type {number}
   * @private
   */
  this.isDragging_ = 0;

  /**
   * Indicates that the mouse is over the scroller. Used to control thumbs hiding.
   * @type {boolean}
   * @private
   */
  this.mouseOnScroller_ = false;

  /**
   * Whether the left thumb is hovered.
   * @type {boolean}
   * @private
   */
  this.leftThumbHovered_ = false;

  /**
   * Whether the right thumb is hovered.
   * @type {boolean}
   * @private
   */
  this.rightThumbHovered_ = false;

  /**
   * Thumbs settings reference.
   * @type {anychart.core.ui.Scroller.Thumbs}
   * @private
   */
  this.thumbs_ = null;
};
goog.inherits(anychart.core.ui.Scroller, anychart.core.VisualBase);


/**
 * Scroller uses internal ratio in range [0..anychart.core.ui.Scroller.MAX_RATIO] to lower floating point errors influence.
 * @type {number}
 */
anychart.core.ui.Scroller.MAX_RATIO = 1000000;


/**
 * @typedef {{
 *   type: string,
 *   startRatio: number,
 *   endRatio: number,
 *   source: string
 * }}
 */
anychart.core.ui.Scroller.ScrollerChangeEvent;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.ui.Scroller.prototype.SUPPORTED_SIGNALS = anychart.core.VisualBase.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.ui.Scroller.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.SCROLLER_THUMBS_SHAPE;


/**
 * Scroller min height.
 * @type {number|string|null}
 * @private
 */
anychart.core.ui.Scroller.prototype.minHeight_;


/**
 * Scroller max height.
 * @type {number|string|null}
 * @private
 */
anychart.core.ui.Scroller.prototype.maxHeight_;


/**
 * Scroller height.
 * @type {number|string}
 * @private
 */
anychart.core.ui.Scroller.prototype.height_;


/**
 * Non selected background fill.
 * @type {acgraph.vector.Fill}
 * @private
 */
anychart.core.ui.Scroller.prototype.nonSelectedFill_;


/**
 * selected background fill.
 * @type {acgraph.vector.Fill}
 * @private
 */
anychart.core.ui.Scroller.prototype.selectedFill_;


/**
 * Selected range outline stroke.
 * @type {acgraph.vector.Stroke}
 * @private
 */
anychart.core.ui.Scroller.prototype.selectedRangeOutlineStroke_;


/**
 * Thumbs settings getter/setter.
 * @param {(boolean|Object|null)=} opt_value
 * @return {anychart.core.ui.Scroller.Thumbs|anychart.core.ui.Scroller}
 */
anychart.core.ui.Scroller.prototype.thumbs = function(opt_value) {
  if (!this.thumbs_) {
    this.thumbs_ = new anychart.core.ui.Scroller.Thumbs(this);
  }
  if (goog.isDef(opt_value)) {
    this.thumbs_.setup(opt_value);
    return this;
  }
  return this.thumbs_;
};


/**
 * Scroller background fill settings. Used to fill the background of non-selected part of the scroller.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.ui.Scroller} .
 */
anychart.core.ui.Scroller.prototype.fill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx,
    opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var fill = acgraph.vector.normalizeFill.apply(null, arguments);
    if (!anychart.color.equals(this.nonSelectedFill_, fill)) {
      this.nonSelectedFill_ = fill;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.nonSelectedFill_;
};


/**
 * Scroller background fill settings for the selected area. Used to fill the background of selected part of the scroller.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.ui.Scroller} .
 */
anychart.core.ui.Scroller.prototype.selectedFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx,
    opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var fill = acgraph.vector.normalizeFill.apply(null, arguments);
    if (!anychart.color.equals(this.selectedFill_, fill)) {
      this.selectedFill_ = fill;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.selectedFill_;
};


/**
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {acgraph.vector.Stroke|anychart.core.ui.Scroller} .
 */
anychart.core.ui.Scroller.prototype.outlineStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern,
    opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var stroke = acgraph.vector.normalizeStroke.apply(null, arguments);
    if (!anychart.color.equals(stroke, this.selectedRangeOutlineStroke_)) {
      this.selectedRangeOutlineStroke_ = stroke;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.selectedRangeOutlineStroke_;
};


/**
 * Getter and setter for scroller height.
 * @param {(number|string)=} opt_value
 * @return {number|string|anychart.core.ui.Scroller}
 */
anychart.core.ui.Scroller.prototype.height = function(opt_value) {
  if (goog.isDef(opt_value)) {
    // we won't set if the value is invalid
    var val = anychart.utils.toNumberOrString(opt_value) || this.height_;
    if (val != this.height_) {
      this.height_ = val;
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.BOUNDS_CHANGED | anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.height_;
};


/**
 * Getter and setter for scroller height.
 * @param {(number|string|null)=} opt_value
 * @return {number|string|null|anychart.core.ui.Scroller}
 */
anychart.core.ui.Scroller.prototype.minHeight = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = anychart.utils.toNumberOrStringOrNull(opt_value);
    if (val !== this.minHeight_) {
      this.minHeight_ = val;
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.BOUNDS_CHANGED | anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.minHeight_;
};


/**
 * Getter and setter for scroller height.
 * @param {(number|string|null)=} opt_value
 * @return {number|string|null|anychart.core.ui.Scroller}
 */
anychart.core.ui.Scroller.prototype.maxHeight = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = anychart.utils.toNumberOrStringOrNull(opt_value);
    if (val !== this.maxHeight_) {
      this.maxHeight_ = val;
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.BOUNDS_CHANGED | anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.maxHeight_;
};


/**
 * Draws the scroller.
 * @return {anychart.core.ui.Scroller}
 */
anychart.core.ui.Scroller.prototype.draw = function() {
  if (!this.checkDrawingNeeded())
    return this;

  if (!this.rootLayer) {
    this.rootLayer = acgraph.layer();

    this.leftThumb_ = acgraph.path();
    this.leftThumb_.zIndex(100);
    this.leftThumb_.cursor(acgraph.vector.Cursor.EW_RESIZE);

    this.rightThumb_ = acgraph.path();
    this.rightThumb_.zIndex(100);
    this.rightThumb_.cursor(acgraph.vector.Cursor.EW_RESIZE);

    this.nonSelectedBackground_ = this.rootLayer.rect();
    this.nonSelectedBackground_.zIndex(0);

    this.selectedBackground_ = this.rootLayer.rect();
    this.selectedBackground_.zIndex(50);
    this.selectedBackground_.cursor(acgraph.vector.Cursor.EW_RESIZE);

    this.selectedClipRect = acgraph.clip();
    this.selectedBackground_.clip(this.selectedClipRect);

    this.selectedRangeOutline_ = this.rootLayer.path();
    this.selectedRangeOutline_.zIndex(99);

    this.bindHandlersToGraphics(this.rootLayer, this.mouseOver_, this.mouseOut_);

    this.eventsHandler.listen(this.leftThumb_, acgraph.events.EventType.MOUSEOVER, this.thumbMouseOver_);
    this.eventsHandler.listen(this.leftThumb_, acgraph.events.EventType.MOUSEOUT, this.thumbMouseOut_);
    this.eventsHandler.listenOnce(this.leftThumb_, acgraph.events.EventType.MOUSEDOWN, this.thumbOrRangeMouseDown_);
    this.eventsHandler.listenOnce(this.leftThumb_, acgraph.events.EventType.TOUCHSTART, this.thumbOrRangeMouseDown_);

    this.eventsHandler.listen(this.rightThumb_, acgraph.events.EventType.MOUSEOVER, this.thumbMouseOver_);
    this.eventsHandler.listen(this.rightThumb_, acgraph.events.EventType.MOUSEOUT, this.thumbMouseOut_);
    this.eventsHandler.listenOnce(this.rightThumb_, acgraph.events.EventType.MOUSEDOWN, this.thumbOrRangeMouseDown_);
    this.eventsHandler.listenOnce(this.rightThumb_, acgraph.events.EventType.TOUCHSTART, this.thumbOrRangeMouseDown_);

    this.eventsHandler.listenOnce(this.selectedBackground_, acgraph.events.EventType.MOUSEDOWN,
        this.thumbOrRangeMouseDown_);
    this.eventsHandler.listenOnce(this.selectedBackground_, acgraph.events.EventType.TOUCHSTART,
        this.thumbOrRangeMouseDown_);

    this.eventsHandler.listen(this.nonSelectedBackground_, acgraph.events.EventType.CLICK, this.nonSelectedRangeClick_);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    this.rootLayer.parent(/** @type {acgraph.vector.ILayer} */(this.container()));
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    this.rootLayer.zIndex(/** @type {number} */(this.zIndex()));
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.updateBoundsCache();
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.SCROLLER_THUMBS_SHAPE)) {
    this.prepareThumbs_();
    this.invalidate(anychart.ConsistencyState.APPEARANCE);
    this.markConsistent(anychart.ConsistencyState.SCROLLER_THUMBS_SHAPE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    // a bit redundant, but allows clearing BOUNDS state without initializing visual components (see getRemainingBounds())
    this.nonSelectedBackground_.setBounds(this.pixelBoundsCache);
    this.selectedBackground_.setBounds(this.pixelBoundsCache);

    this.nonSelectedBackground_.fill(this.nonSelectedFill_ == 'none' ?
        anychart.color.TRANSPARENT_HANDLER : this.nonSelectedFill_).stroke(null);
    this.selectedBackground_.fill(this.selectedFill_ == 'none' ?
        anychart.color.TRANSPARENT_HANDLER : this.selectedFill_).stroke(null);
    this.selectedRangeOutline_.stroke(this.selectedRangeOutlineStroke_).fill(null);

    var bounds = this.pixelBoundsCache;
    var leftX = bounds.left + bounds.width * this.startRatio_ / anychart.core.ui.Scroller.MAX_RATIO;
    var rightX = bounds.left + bounds.width * this.endRatio_ / anychart.core.ui.Scroller.MAX_RATIO;

    this.leftThumb_.setTransformationMatrix(1, 0, 0, 1, leftX, 0);
    this.rightThumb_.setTransformationMatrix(1, 0, 0, 1, rightX, 0);

    this.selectedClipRect.bounds(leftX, bounds.top, rightX - leftX, bounds.height);

    this.selectedRangeOutline_
        .clear()
        .moveTo(bounds.left, bounds.top)
        .lineTo(leftX, bounds.top)
        .lineTo(leftX, bounds.top + bounds.height)
        .lineTo(rightX, bounds.top + bounds.height)
        .lineTo(rightX, bounds.top)
        .lineTo(bounds.left + bounds.width, bounds.top);

    this.colorizeThumb_(this.leftThumb_, this.leftThumbHovered_);
    this.colorizeThumb_(this.rightThumb_, this.rightThumbHovered_);

    if (!this.thumbs().autoHide())
      this.showThumbs_();

    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  return this;
};


/**
 * Sets range and invalidates what is needed to be invalidated.
 * @param {number} startRatio
 * @param {number} endRatio
 */
anychart.core.ui.Scroller.prototype.setRangeInternal = function(startRatio, endRatio) {
  startRatio = this.toInternalRatio_(startRatio);
  endRatio = this.toInternalRatio_(endRatio);
  if (startRatio > endRatio) {
    var tmp = startRatio;
    startRatio = endRatio;
    endRatio = tmp;
  }
  if (startRatio != this.startRatio_ || endRatio != this.endRatio_) {
    this.startRatio_ = startRatio;
    this.endRatio_ = endRatio;
    this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * @return {number}
 */
anychart.core.ui.Scroller.prototype.getStartRatio = function() {
  return this.startRatio_ / anychart.core.ui.Scroller.MAX_RATIO;
};


/**
 * @return {number}
 */
anychart.core.ui.Scroller.prototype.getEndRatio = function() {
  return this.endRatio_ / anychart.core.ui.Scroller.MAX_RATIO;
};


/**
 * Returns new rect with bounds remaining after scroller placement.
 * @return {anychart.math.Rect}
 */
anychart.core.ui.Scroller.prototype.getRemainingBounds = function() {
  var parentBounds = /** @type {anychart.math.Rect} */(this.parentBounds());
  if (parentBounds)
    parentBounds = parentBounds.clone();
  else
    parentBounds = anychart.math.rect(0, 0, 0, 0);

  if (this.enabled()) {
    if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
      this.updateBoundsCache();
      this.markConsistent(anychart.ConsistencyState.BOUNDS);
    }
    parentBounds.height -= this.pixelBoundsCache.height;
  }
  return parentBounds;
};


/**
 * Updates this.pixelBoundsCache to match current settings.
 * @protected
 */
anychart.core.ui.Scroller.prototype.updateBoundsCache = function() {
  var parentBounds = this.parentBounds();
  var height = anychart.utils.normalizeSize(this.height_, parentBounds.height);
  if (!goog.isNull(this.minHeight_))
    height = Math.max(height, anychart.utils.normalizeSize(this.minHeight_, parentBounds.height));
  if (!goog.isNull(this.maxHeight_))
    height = Math.min(height, anychart.utils.normalizeSize(this.maxHeight_, parentBounds.height));
  this.pixelBoundsCache.left = parentBounds.left;
  this.pixelBoundsCache.width = parentBounds.width;
  this.pixelBoundsCache.top = parentBounds.top + parentBounds.height - height;
  this.pixelBoundsCache.height = height;
  this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.SCROLLER_THUMBS_SHAPE);
};


/**
 * MouseOver handler.
 * @param {acgraph.events.BrowserEvent} e
 * @private
 */
anychart.core.ui.Scroller.prototype.mouseOver_ = function(e) {
  e.stopWrapperPropagation();
  if (!anychart.utils.checkIfParent(/** @type {!goog.events.EventTarget} */(this.rootLayer), e['relatedTarget']) &&
      this.handleBrowserEvent(e)) {
    this.mouseOnScroller_ = true;
    this.showThumbs_();
  }
};


/**
 * MouseOut handler.
 * @param {acgraph.events.BrowserEvent} e
 * @private
 */
anychart.core.ui.Scroller.prototype.mouseOut_ = function(e) {
  e.stopWrapperPropagation();
  if (!anychart.utils.checkIfParent(/** @type {!goog.events.EventTarget} */(this.rootLayer), e['relatedTarget']) &&
      this.handleBrowserEvent(e)) {
    this.mouseOnScroller_ = false;
    this.maybeHideThumbs_();
  }
};


/**
 * Thumb mouseover handler.
 * @param {acgraph.events.BrowserEvent} e
 * @private
 */
anychart.core.ui.Scroller.prototype.thumbMouseOver_ = function(e) {
  var target = e['target'];
  if (target instanceof acgraph.vector.Path) {
    if (target == this.leftThumb_) {
      this.colorizeThumb_(this.leftThumb_, this.leftThumbHovered_ = true);
    } else if (target == this.rightThumb_) {
      this.colorizeThumb_(this.rightThumb_, this.rightThumbHovered_ = true);
    }
  }
};


/**
 * Thumb mouseout handler.
 * @param {acgraph.events.BrowserEvent} e
 * @private
 */
anychart.core.ui.Scroller.prototype.thumbMouseOut_ = function(e) {
  var target = e['target'];
  if (target instanceof acgraph.vector.Path) {
    if (target == this.leftThumb_) {
      this.colorizeThumb_(this.leftThumb_, this.leftThumbHovered_ = false);
    } else if (target == this.rightThumb_) {
      this.colorizeThumb_(this.rightThumb_, this.rightThumbHovered_ = false);
    }
  }
};


/**
 * Thumbs and range mousedown handler.
 * @param {acgraph.events.BrowserEvent} e
 * @private
 */
anychart.core.ui.Scroller.prototype.thumbOrRangeMouseDown_ = function(e) {
  if (e['currentTarget'] instanceof acgraph.vector.Element) {
    var target = (/** @type {acgraph.vector.Element} */(e['currentTarget']));
    var dragger;
    if (target == this.leftThumb_ && !this.leftThumbDragger_) {
      this.leftThumbDragger_ = dragger = new anychart.core.ui.Scroller.Dragger(this, this.leftThumb_, true);
    } else if (target == this.rightThumb_ && !this.rightThumbDragger_) {
      this.rightThumbDragger_ = dragger = new anychart.core.ui.Scroller.Dragger(this, this.rightThumb_, true);
    } else if (target == this.selectedBackground_ && !this.selectedRangeDragger_) {
      this.selectedRangeDragger_ = dragger = new anychart.core.ui.Scroller.Dragger(this, this.selectedBackground_, false);
    }
    if (dragger) {
      this.eventsHandler.listen(dragger, goog.fx.Dragger.EventType.START, this.dragStartHandler_);
      this.eventsHandler.listen(dragger, goog.fx.Dragger.EventType.END, this.dragEndHandler_);
      dragger.startDrag(e.getOriginalEvent());
    }
  }
};


/**
 * Handler for clicks on scroller out of the selected range.
 * @param {acgraph.events.BrowserEvent} e
 * @private
 */
anychart.core.ui.Scroller.prototype.nonSelectedRangeClick_ = function(e) {
  // assume we have a stage here
  var x = e['clientX'] - goog.style.getClientPosition(/** @type {Element} */(this.rootLayer.getStage().container())).x;
  if (this.dispatchRangeChange_(anychart.enums.ScrollerRangeChangeSource.BACKGROUND_CLICK,
      anychart.enums.EventType.SCROLLER_CHANGE_START)) {
    this.moveHandleTo_(false, x);
    this.dispatchRangeChange_(anychart.enums.ScrollerRangeChangeSource.BACKGROUND_CLICK,
        anychart.enums.EventType.SCROLLER_CHANGE_FINISH);
  }
};


/**
 * Drag start handler.
 * @param {goog.fx.DragEvent} e
 * @return {boolean}
 * @private
 */
anychart.core.ui.Scroller.prototype.dragStartHandler_ = function(e) {
  var cursor, source;
  if (e.dragger == this.selectedRangeDragger_) {
    cursor = acgraph.vector.Cursor.EW_RESIZE;
    source = anychart.enums.ScrollerRangeChangeSource.SELECTED_RANGE_DRAG;
  } else {
    cursor = acgraph.vector.Cursor.EW_RESIZE;
    source = anychart.enums.ScrollerRangeChangeSource.THUMB_DRAG;
  }
  var res = this.dispatchRangeChange_(source, anychart.enums.EventType.SCROLLER_CHANGE_START);
  if (res) {
    this.isDragging_++;
    this.leftThumb_.cursor(null);
    this.rightThumb_.cursor(null);
    this.selectedBackground_.cursor(null);
    goog.style.setStyle(document['body'], 'cursor', cursor);
  }
  return res;
};


/**
 * Drag end handler.
 * @param {goog.fx.DragEvent} e
 * @private
 */
anychart.core.ui.Scroller.prototype.dragEndHandler_ = function(e) {
  this.isDragging_ = Math.max(this.isDragging_ - 1, 0);
  this.maybeHideThumbs_();
  this.leftThumb_.cursor(acgraph.vector.Cursor.EW_RESIZE);
  this.rightThumb_.cursor(acgraph.vector.Cursor.EW_RESIZE);
  this.selectedBackground_.cursor(acgraph.vector.Cursor.EW_RESIZE);
  goog.style.setStyle(document['body'], 'cursor', '');
  var source;
  if (e.dragger == this.selectedRangeDragger_) {
    source = anychart.enums.ScrollerRangeChangeSource.SELECTED_RANGE_DRAG;
  } else {
    source = anychart.enums.ScrollerRangeChangeSource.THUMB_DRAG;
  }
  this.dispatchRangeChange_(source, anychart.enums.EventType.SCROLLER_CHANGE_FINISH);
};


/**
 * Shows thumbs if necessary.
 * @private
 */
anychart.core.ui.Scroller.prototype.showThumbs_ = function() {
  if (!this.thumbsShown_) {
    this.rootLayer.addChild(/** @type {!acgraph.vector.Path} */(this.leftThumb_));
    this.rootLayer.addChild(/** @type {!acgraph.vector.Path} */(this.rightThumb_));
    this.thumbsShown_ = true;
  }
};


/**
 * Hides thumbs if necessary.
 * @private
 */
anychart.core.ui.Scroller.prototype.maybeHideThumbs_ = function() {
  if (this.thumbsShown_ && this.thumbs().autoHide() && !this.isDragging_ && !this.mouseOnScroller_) {
    this.rootLayer.removeChild(/** @type {!acgraph.vector.Path} */(this.leftThumb_));
    this.rootLayer.removeChild(/** @type {!acgraph.vector.Path} */(this.rightThumb_));
    this.thumbsShown_ = false;
  }
};


/**
 * Prepares thumbs according to current bounds. Thumb X positioning is made by transformation.
 * @private
 */
anychart.core.ui.Scroller.prototype.prepareThumbs_ = function() {
  var top = this.pixelBoundsCache.top;
  if (this.thumbs().enabled()) {
    var y = top + this.pixelBoundsCache.height / 2;
    this.leftThumb_.clear()
        .moveTo(-4, y - 6)
        .lineTo(-2, y - 8)
        .lineTo(2, y - 8)
        .lineTo(4, y - 6)
        .lineTo(4, y + 6)
        .lineTo(2, y + 8)
        .lineTo(-2, y + 8)
        .lineTo(-4, y + 6)
        .close()
        .moveTo(-1, y - 5)
        .lineTo(-1, y + 5)
        .moveTo(1, y - 5)
        .lineTo(1, y + 5);
    this.rightThumb_.clear()
        .moveTo(-4, y - 6)
        .lineTo(-2, y - 8)
        .lineTo(2, y - 8)
        .lineTo(4, y - 6)
        .lineTo(4, y + 6)
        .lineTo(2, y + 8)
        .lineTo(-2, y + 8)
        .lineTo(-4, y + 6)
        .close()
        .moveTo(-1, y - 5)
        .lineTo(-1, y + 5)
        .moveTo(1, y - 5)
        .lineTo(1, y + 5);
  } else {
    var bottom = top + this.pixelBoundsCache.height;
    var thicknessHalf = (Math.max(acgraph.vector.getThickness(this.selectedRangeOutlineStroke_), 5) - 1) / 2;
    this.leftThumb_.clear()
        .moveTo(-thicknessHalf, top)
        .lineTo(thicknessHalf, top)
        .lineTo(thicknessHalf, bottom)
        .lineTo(-thicknessHalf, bottom)
        .close();
    this.rightThumb_.clear()
        .moveTo(-thicknessHalf, top)
        .lineTo(thicknessHalf, top)
        .lineTo(thicknessHalf, bottom)
        .lineTo(-thicknessHalf, bottom)
        .close();
  }
};


/**
 * Colorizes passed thumb.
 * @param {acgraph.vector.Path} thumb
 * @param {boolean} isHovered
 * @private
 */
anychart.core.ui.Scroller.prototype.colorizeThumb_ = function(thumb, isHovered) {
  var thumbs = this.thumbs();
  var fill, stroke;
  if (isHovered) {
    fill = /** @type {acgraph.vector.Fill} */(thumbs.hoverFill());
    stroke = /** @type {acgraph.vector.Stroke} */(thumbs.hoverStroke());
  } else {
    fill = /** @type {acgraph.vector.Fill} */(thumbs.fill());
    stroke = /** @type {acgraph.vector.Stroke} */(thumbs.stroke());
  }
  thumb.fill(fill);
  thumb.stroke(stroke);
};


/**
 * Transforms [0..1] ratio to internal ratio.
 * @param {number} ratio
 * @return {number}
 * @private
 */
anychart.core.ui.Scroller.prototype.toInternalRatio_ = function(ratio) {
  return goog.math.clamp(Math.round(ratio * anychart.core.ui.Scroller.MAX_RATIO), 0,
      anychart.core.ui.Scroller.MAX_RATIO);
};


/**
 * Transforms internal ratio to [0..1] ratio. Internal ratio keeps distances but rounds them:
 * this.fromInternalRatio_(this.toInternalRatio_(a) - this.toInternalRatio_(b)) = a - b;
 * @param {number} internalRatio
 * @return {number}
 * @private
 */
anychart.core.ui.Scroller.prototype.fromInternalRatio_ = function(internalRatio) {
  return internalRatio / anychart.core.ui.Scroller.MAX_RATIO;
};


/**
 * Makes range change event. An extending point.
 * @param {string} type
 * @param {number} startRatio
 * @param {number} endRatio
 * @param {string} source
 * @return {goog.events.EventLike}
 * @protected
 */
anychart.core.ui.Scroller.prototype.makeRangeChangeEvent = function(type, startRatio, endRatio, source) {
  return {
    'type': type,
    'startRatio': startRatio,
    'endRatio': endRatio,
    'source': source
  };
};


/**
 * Dispatches SCROLLER_CHANGE event.
 * @param {string} source
 * @param {anychart.enums.EventType} type
 * @param {number=} opt_start
 * @param {number=} opt_end
 * @return {boolean}
 * @private
 */
anychart.core.ui.Scroller.prototype.dispatchRangeChange_ = function(source, type, opt_start, opt_end) {
  var start = goog.isDef(opt_start) ? opt_start : this.fromInternalRatio_(this.startRatio_);
  var end = goog.isDef(opt_end) ? opt_end : this.fromInternalRatio_(this.endRatio_);
  return this.dispatchEvent(this.makeRangeChangeEvent(type, start, end, source));
};


/**
 * Moves the thumb. Considered internal.
 * @param {acgraph.vector.Element|boolean} handle true - selectedRange, false - background, element - corresponding thumb.
 * @param {number} x
 * @private
 */
anychart.core.ui.Scroller.prototype.moveHandleTo_ = function(handle, x) {
  x = this.limitX_(handle, x);
  var bounds = this.pixelBoundsCache;
  var ratio = (x - bounds.left) / bounds.width;
  var startRatio, endRatio, source;
  if (handle == this.leftThumb_) {
    startRatio = ratio;
    endRatio = this.fromInternalRatio_(this.endRatio_);
    source = anychart.enums.ScrollerRangeChangeSource.THUMB_DRAG;
  } else if (handle == this.rightThumb_) {
    startRatio = this.fromInternalRatio_(this.startRatio_);
    endRatio = ratio;
    source = anychart.enums.ScrollerRangeChangeSource.THUMB_DRAG;
  } else {
    var halfRange = this.fromInternalRatio_(this.endRatio_ - this.startRatio_) / 2;
    startRatio = ratio - halfRange;
    endRatio = ratio + halfRange;
    source = handle === true ?
        anychart.enums.ScrollerRangeChangeSource.SELECTED_RANGE_DRAG :
        anychart.enums.ScrollerRangeChangeSource.BACKGROUND_CLICK;
  }
  if (startRatio > endRatio) {
    var tmp = this.leftThumb_;
    this.leftThumb_ = this.rightThumb_;
    this.rightThumb_ = tmp;
    // we should also swap draggers to properly initialize them
    tmp = this.leftThumbDragger_;
    this.leftThumbDragger_ = this.rightThumbDragger_;
    this.rightThumbDragger_ = tmp;
  }
  if ((startRatio != this.startRatio_ || endRatio != this.endRatio_) &&
      this.dispatchRangeChange_(source, anychart.enums.EventType.SCROLLER_CHANGE, startRatio, endRatio)) {
    this.startRatio_ = this.toInternalRatio_(startRatio);
    this.endRatio_ = this.toInternalRatio_(endRatio);
    this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Limits possible X position of the handle. Handle may be scroller.leftThumb_ path, scroller.rightThumb_ path or true
 * for selected range center. It is supposed to be false for nonSelectedBackground.
 * @param {acgraph.vector.Element|boolean} handle
 * @param {number} x
 * @return {number}
 * @private
 */
anychart.core.ui.Scroller.prototype.limitX_ = function(handle, x) {
  var bounds = this.pixelBoundsCache;
  var diff;
  if (goog.isBoolean(handle)) {
    diff = this.fromInternalRatio_(this.endRatio_ - this.startRatio_) * bounds.width / 2;
  } else {
    diff = 0;
  }
  return goog.math.clamp(x, bounds.left + diff, bounds.left + bounds.width - diff);
};


/**
 * Returns current position of a handle. Handle may be scroller.leftThumb_ path, scroller.rightThumb_ path or null for
 * selected range center.
 * @param {?acgraph.vector.Element} handle
 * @return {number}
 * @private
 */
anychart.core.ui.Scroller.prototype.getCurrentPosition_ = function(handle) {
  var ratio;
  if (handle == this.leftThumb_) {
    ratio = this.startRatio_;
  } else if (handle == this.rightThumb_) {
    ratio = this.endRatio_;
  } else {
    ratio = (this.startRatio_ + this.endRatio_) / 2;
  }
  ratio = this.fromInternalRatio_(ratio);
  var bounds = this.pixelBoundsCache;
  return bounds.left + bounds.width * ratio;
};


/** @inheritDoc */
anychart.core.ui.Scroller.prototype.disposeInternal = function() {
  goog.dispose(this.rootLayer);
  this.rootLayer = null;
  this.leftThumb_ = null;
  this.rightThumb_ = null;
  this.selectedRangeOutline_ = null;
  this.nonSelectedBackground_ = null;
  this.selectedBackground_ = null;

  goog.dispose(this.leftThumbDragger_);
  this.leftThumbDragger_ = null;
  goog.dispose(this.rightThumbDragger_);
  this.rightThumbDragger_ = null;
  goog.dispose(this.selectedRangeDragger_);
  this.selectedRangeDragger_ = null;

  goog.dispose(this.thumbs_);
  this.thumbs_ = null;

  goog.base(this, 'disposeInternal');
};


/** @inheritDoc */
anychart.core.ui.Scroller.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  json['fill'] = this.fill();
  json['selectedFill'] = this.selectedFill();
  json['outlineStroke'] = this.outlineStroke();
  json['height'] = this.height();
  json['minHeight'] = this.minHeight();
  json['maxHeight'] = this.maxHeight();
  json['thumbs'] = this.thumbs().serialize();
  return json;
};


/** @inheritDoc */
anychart.core.ui.Scroller.prototype.setupByJSON = function(config) {
  goog.base(this, 'setupByJSON', config);
  this.fill(config['fill']);
  this.selectedFill(config['selectedFill']);
  this.outlineStroke(config['outlineStroke']);
  this.height(config['height']);
  this.minHeight(config['minHeight']);
  this.maxHeight(config['maxHeight']);
  this.thumbs(config['thumbs']);
};



/**
 * Dragger for scroller thumbs.
 * @param {anychart.core.ui.Scroller} scroller
 * @param {acgraph.vector.Element} target
 * @param {boolean} isThumb
 * @constructor
 * @extends {goog.fx.Dragger}
 */
anychart.core.ui.Scroller.Dragger = function(scroller, target, isThumb) {
  goog.base(this, target.domElement());

  /**
   * Scroller reference.
   * @type {anychart.core.ui.Scroller}
   * @private
   */
  this.scroller_ = scroller;

  /**
   * If the target is thumb, stores the target thumb. Or null otherwise.
   * @type {acgraph.vector.Element}
   * @private
   */
  this.targetThumb_ = isThumb ? target : null;
};
goog.inherits(anychart.core.ui.Scroller.Dragger, goog.fx.Dragger);


/** @inheritDoc */
anychart.core.ui.Scroller.Dragger.prototype.computeInitialPosition = function() {
  this.deltaX = this.scroller_.getCurrentPosition_(this.targetThumb_);
  this.deltaY = 0;
};


/** @inheritDoc */
anychart.core.ui.Scroller.Dragger.prototype.defaultAction = function(x, y) {
  this.scroller_.moveHandleTo_(this.targetThumb_ || true, x);
};


/** @inheritDoc */
anychart.core.ui.Scroller.Dragger.prototype.limitX = function(x) {
  return this.scroller_.limitX_(this.targetThumb_, x);
};


/** @inheritDoc */
anychart.core.ui.Scroller.Dragger.prototype.limitY = function(y) {
  return 0;
};



/**
 * Thumbs settings. Doesn't draw anything, just contains settings and notifies the scroller about their change.
 * @param {!anychart.core.ui.Scroller} scroller
 * @constructor
 */
anychart.core.ui.Scroller.Thumbs = function(scroller) {
  /**
   * @type {!anychart.core.ui.Scroller}
   * @private
   */
  this.scroller_ = scroller;
};


/**
 * Whether thumbs are enabled.
 * @type {boolean}
 * @private
 */
anychart.core.ui.Scroller.Thumbs.prototype.enabled_;


/**
 * Whether the thumbs should hide on scroller mouse out.
 * @type {boolean}
 * @private
 */
anychart.core.ui.Scroller.Thumbs.prototype.autoHide_;


/**
 * Thumbs fill color.
 * @type {acgraph.vector.Fill}
 * @private
 */
anychart.core.ui.Scroller.Thumbs.prototype.fill_;


/**
 * Thumbs stroke color.
 * @type {acgraph.vector.Stroke}
 * @private
 */
anychart.core.ui.Scroller.Thumbs.prototype.stroke_;


/**
 * Thumbs hover fill color.
 * @type {acgraph.vector.Fill}
 * @private
 */
anychart.core.ui.Scroller.Thumbs.prototype.hoverFill_;


/**
 * Thumbs hover stroke color.
 * @type {acgraph.vector.Stroke}
 * @private
 */
anychart.core.ui.Scroller.Thumbs.prototype.hoverStroke_;


/**
 * Whether the thumbs should be drawn.
 * @param {boolean=} opt_value
 * @return {boolean|anychart.core.ui.Scroller.Thumbs}
 */
anychart.core.ui.Scroller.Thumbs.prototype.enabled = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = !!opt_value;
    if (this.enabled_ != opt_value) {
      this.enabled_ = opt_value;
      this.scroller_.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.enabled_;
};


/**
 * Whether the thumbs should be hidden on scroller mouse out event.
 * @param {boolean=} opt_value
 * @return {boolean|anychart.core.ui.Scroller.Thumbs}
 */
anychart.core.ui.Scroller.Thumbs.prototype.autoHide = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = !!opt_value;
    if (this.autoHide_ != opt_value) {
      this.autoHide_ = opt_value;
      this.scroller_.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.autoHide_;
};


/**
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.ui.Scroller.Thumbs} .
 */
anychart.core.ui.Scroller.Thumbs.prototype.fill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx,
    opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var fill = acgraph.vector.normalizeFill.apply(null, arguments);
    if (!anychart.color.equals(this.thumbFill_, fill)) {
      this.thumbFill_ = fill;
      this.scroller_.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.thumbFill_;
};


/**
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {acgraph.vector.Stroke|anychart.core.ui.Scroller.Thumbs} .
 */
anychart.core.ui.Scroller.Thumbs.prototype.stroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern,
    opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var stroke = acgraph.vector.normalizeStroke.apply(null, arguments);
    if (!anychart.color.equals(stroke, this.thumbStroke_)) {
      this.thumbStroke_ = stroke;
      this.scroller_.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.thumbStroke_;
};


/**
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.ui.Scroller.Thumbs} .
 */
anychart.core.ui.Scroller.Thumbs.prototype.hoverFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx,
    opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var fill = acgraph.vector.normalizeFill.apply(null, arguments);
    if (!anychart.color.equals(this.thumbHoverFill_, fill)) {
      this.thumbHoverFill_ = fill;
      this.scroller_.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.thumbHoverFill_;
};


/**
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {acgraph.vector.Stroke|anychart.core.ui.Scroller.Thumbs} .
 */
anychart.core.ui.Scroller.Thumbs.prototype.hoverStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern,
    opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var stroke = acgraph.vector.normalizeStroke.apply(null, arguments);
    if (!anychart.color.equals(stroke, this.thumbHoverStroke_)) {
      this.thumbHoverStroke_ = stroke;
      this.scroller_.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.thumbHoverStroke_;
};


/**
 * @return {!Object}
 */
anychart.core.ui.Scroller.Thumbs.prototype.serialize = function() {
  var json = {};
  json['fill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill} */(this.fill()));
  json['stroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke} */(this.stroke()));
  json['hoverFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill} */(this.hoverFill()));
  json['hoverStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke} */(this.hoverStroke()));
  json['enabled'] = this.enabled();
  json['autoHide'] = this.autoHide();
  return json;
};


/**
 * @param {Object} config
 */
anychart.core.ui.Scroller.Thumbs.prototype.setupByJSON = function(config) {
  this.enabled('enabled' in config ? !!config['enabled'] : true);
  this.fill(config['fill']);
  this.stroke(config['stroke']);
  this.hoverFill(config['hoverFill']);
  this.hoverStroke(config['hoverStroke']);
  this.autoHide(config['autoHide']);
};


/**
 * @param {...*} var_args
 * @return {boolean}
 */
anychart.core.ui.Scroller.Thumbs.prototype.setupSpecial = function(var_args) {
  var arg0 = arguments[0];
  if (goog.isBoolean(arg0) || goog.isNull(arg0)) {
    this.enabled(!!arg0);
    return true;
  }
  return false;
};


/**
 * Setups the element using passed configuration value. It can be a JSON object or a special value that setups
 * instances of descendant classes.
 * Note: this method only changes element properties if they are supposed to be changed by the config value -
 * it doesn't reset other properties to their defaults.
 * @param {...(Object|Array|number|string|undefined|boolean|null)} var_args Arguments to setup the instance.
 * @return {anychart.core.ui.Scroller.Thumbs} Returns itself for chaining.
 */
anychart.core.ui.Scroller.Thumbs.prototype.setup = function(var_args) {
  var arg0 = arguments[0];
  if (goog.isDef(arg0)) {
    if (!this.setupSpecial.apply(this, arguments) && goog.isObject(arg0)) {
      //if (arg0 instanceof anychart.core.Base)
      //  throw 'Instance of object is passed to setter. You should use JSON instead';
      this.setupByJSON(/** @type {!Object} */(arguments[0]));
    }
  }
  return this;
};


//exports
anychart.core.ui.Scroller.prototype['fill'] = anychart.core.ui.Scroller.prototype.fill;
anychart.core.ui.Scroller.prototype['selectedFill'] = anychart.core.ui.Scroller.prototype.selectedFill;
anychart.core.ui.Scroller.prototype['outlineStroke'] = anychart.core.ui.Scroller.prototype.outlineStroke;
anychart.core.ui.Scroller.prototype['height'] = anychart.core.ui.Scroller.prototype.height;
anychart.core.ui.Scroller.prototype['minHeight'] = anychart.core.ui.Scroller.prototype.minHeight;
anychart.core.ui.Scroller.prototype['maxHeight'] = anychart.core.ui.Scroller.prototype.maxHeight;
anychart.core.ui.Scroller.prototype['thumbs'] = anychart.core.ui.Scroller.prototype.thumbs;

anychart.core.ui.Scroller.Thumbs.prototype['enabled'] = anychart.core.ui.Scroller.Thumbs.prototype.enabled;
anychart.core.ui.Scroller.Thumbs.prototype['autoHide'] = anychart.core.ui.Scroller.Thumbs.prototype.autoHide;
anychart.core.ui.Scroller.Thumbs.prototype['fill'] = anychart.core.ui.Scroller.Thumbs.prototype.fill;
anychart.core.ui.Scroller.Thumbs.prototype['stroke'] = anychart.core.ui.Scroller.Thumbs.prototype.stroke;
anychart.core.ui.Scroller.Thumbs.prototype['hoverFill'] = anychart.core.ui.Scroller.Thumbs.prototype.hoverFill;
anychart.core.ui.Scroller.Thumbs.prototype['hoverStroke'] = anychart.core.ui.Scroller.Thumbs.prototype.hoverStroke;
