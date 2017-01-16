goog.provide('anychart.core.ui.SimpleSplitter');
goog.provide('anychart.core.ui.Splitter');


goog.require('acgraph');
goog.require('anychart.color');
goog.require('anychart.core.VisualBaseWithBounds');
goog.require('anychart.enums');
goog.require('anychart.math.Rect');
goog.require('anychart.utils');
goog.require('goog.math');



/**
 * Splitter implementation.
 *
 * @constructor
 * @extends {anychart.core.VisualBaseWithBounds}
 */
anychart.core.ui.Splitter = function() {
  anychart.core.ui.Splitter.base(this, 'constructor');


  /**
   * Layout.
   * @type {anychart.enums.Layout}
   * @private
   */
  this.layout_ = anychart.enums.Layout.VERTICAL;


  /**
   * Layer that contains all visual elements.
   * @type {acgraph.vector.Layer}
   * @private
   */
  this.base_ = null;


  /**
   * Center single line.
   * @type {acgraph.vector.Rect}
   * @private
   */
  this.centerLine_ = null;


  /**
   * Area that simplifies drag pointer navigation.
   * Actually it is a transparent rectangle that can be dragged.
   * @type {acgraph.vector.Rect}
   * @private
   */
  this.dragArea_ = null;


  /**
   * Area (rectangle) that appears while dragging a resizer.
   * @type {acgraph.vector.Rect}
   * @private
   */
  this.dragPreview_ = null;


  /**
   * Position ratio of resizer line.
   * @type {number}
   * @private
   */
  this.position_ = .5;


  /**
   * Size of drag area before and after center line.
   * @type {number}
   * @private
   */
  this.dragAreaLength_ = 3;


  /**
   * Pixel bounds cache. Allows to avoid re-calculation of pixel bounds.
   * @type {anychart.math.Rect}
   * @private
   */
  this.pixelBoundsCache_;


  /**
   * In this case start limit is an area at the start side, can't move there with dragging despite the bounds set.
   * For example: here are bounds anychart.math.Rect(0, 0, 100, 50) available for vertical splitter.
   * If we set this.startLimitSize_ = 10, then available drag area becomes anychart.math.Rect(10, 0, 100, 50) because
   * 'start' for vertical splitter is 'left', 'end' is 'right' (for horizontal one - 'start' is 'top', 'end' is 'bottom')
   * @type {number}
   * @private
   */
  this.startLimitSize_ = 0;


  /**
   * In this case end limit  is an area from the end side, can't move there with dragging despite the bounds set.
   * For example: here are bounds anychart.math.Rect(0, 0, 100, 50) available for vertical splitter.
   * If we set this.endLimitSize_ = 10, then available drag area becomes anychart.math.Rect(0, 0, 90, 50) because
   * 'start' for vertical splitter is 'left', 'end' is 'right' (for horizontal one - 'start' is 'top', 'end' is 'bottom')
   * @type {number}
   * @private
   */
  this.endLimitSize_ = 0;


  /**
   * Used to store a new value of start limit size.
   * this.startLimitSize_ can't be set directly because this.startLimitSize_ and this.endLimitSize_ depend on each other
   * and changing one of these values can cause changing of the other one.
   * @type {number}
   * @private
   */
  this.newStartLimitSize_ = 0;


  /**
   * Used to store a new value of end limit size.
   * this.endLimitSize_ can't be set directly because this.startLimitSize_ and this.endLimitSize_ depend on each other
   * and changing one of these values can cause changing of the other one.
   * @type {number}
   * @private
   */
  this.newEndLimitSize_ = 0;


  /**
   * Flag if splitter is currently in a dragging process.
   * @type {boolean}
   * @private
   */
  this.dragging_ = false;


  /**
   * Whether mouse is over.
   * @type {boolean}
   * @private
   */
  this.mouseOver_ = false;

  /**
   * Current cursor (before dragging).
   * @type {string}
   * @private
   */
  this.cursorBackup_ = goog.style.getStyle(goog.global['document']['body'], 'cursor');


  /**
   * Width of the center line (visually is splitter itself).
   * @type {number}
   * @private
   */
  this.splitterWidth_ = 3;


  /**
   * Flag if a splitter width must be considered for this.getStartBounds_() and this.getEndBounds_() calculation.
   * @type {boolean}
   * @private
   */
  this.considerSplitterWidth_ = true;


  /**
   * Center line stroke.
   * @type {acgraph.vector.Stroke}
   * @private
   */
  this.stroke_ = acgraph.vector.normalizeStroke('#acbece');


  /**
   * Center line fill.
   * @type {acgraph.vector.Fill}
   * @private
   */
  this.fill_ = acgraph.vector.normalizeFill(/** @type {acgraph.vector.LinearGradientFill} */({
    'keys': ['0 #9ccae3', '0.5 #a9dbf6', '1 #e3f4fc'],
    'angle': -90,
    'opacity': 1
  }));


  /**
   * Drag preview fill.
   * @type {acgraph.vector.Fill}
   * @private
   */
  this.dragPreviewFill_ = acgraph.vector.normalizeFill('#ccd7e1 0.3');


  /**
   * Drag preview stroke.
   * @type {acgraph.vector.Stroke}
   * @private
   */
  this.dragPreviewStroke_ = acgraph.vector.normalizeStroke(null);


  /**
   * Drag area fill.
   * @type {acgraph.vector.Fill}
   * @private
   */
  this.dragAreaFill_ = acgraph.vector.normalizeFill('#fff 0');


  /**
   * Drag area stroke.
   * @type {acgraph.vector.Stroke}
   * @private
   */
  this.dragAreaStroke_ = acgraph.vector.normalizeStroke(null);


  /**
   * Flag if changing of splitter position must be handled.
   * @type {boolean}
   * @private
   */
  this.handlePositionChange_ = true;

};
goog.inherits(anychart.core.ui.Splitter, anychart.core.VisualBaseWithBounds);


/**
 * Supported signals.
 * @type {number}
 */
anychart.core.ui.Splitter.prototype.SUPPORTED_SIGNALS = anychart.core.VisualBaseWithBounds.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistence states.
 * @type {number}
 */
anychart.core.ui.Splitter.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBaseWithBounds.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.SPLITTER_POSITION;


/**
 * Getter/setter for layout.
 * NOTE: Doesn't modify actual bounds.
 *
 * @param {(anychart.enums.Layout|string)=} opt_value - Value to be set.
 * @return {(anychart.enums.Layout|anychart.core.ui.Splitter)} - Current layout or itself for method chaining.
 */
anychart.core.ui.Splitter.prototype.layout = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeLayout(opt_value);
    if (opt_value != this.layout_) {
      this.layout_ = opt_value;
      this.position(this.position_); //Used to dispatch event.
    }
    return this;
  }
  return this.layout_;
};


//TODO (A.Kudryavtsev): Add to description: position is always limited by this.startLimitSize_ and this.endLimitSize_
/**
 * Sets a position of splitter in its bounds and returns itself or returns a current value.
 * @param {(number|string)=} opt_value - Value to be set. Must be a number [0..1] or a percent value ("57.3%"). Any
 *  unsuitable string values will be ignored, as well as any unsuitable numeric values will be put in [0..1] range.
 * @return {number|anychart.core.ui.Splitter} - Current value or itself for method chaining.
 */
anychart.core.ui.Splitter.prototype.position = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var pos = anychart.utils.isPercent(opt_value) ? parseFloat(opt_value) / 100 : opt_value;

    var startLimitPos = 0, endLimitPos = 1;

    if (this.pixelBoundsCache_) { //Init check condition: we don't trigger event if there is no init position.
      var isVertical = this.isVertical_();
      var sideSize = isVertical ? this.pixelBoundsCache_.getWidth() : this.pixelBoundsCache_.getHeight();
      startLimitPos = this.startLimitSize_ / sideSize;
      endLimitPos = (sideSize - this.endLimitSize_) / sideSize;
    }

    pos = goog.math.clamp(/** @type {number} */ (pos), startLimitPos, endLimitPos);

    //No condition (this.position_ != pos) because changing the startLimit and endLimit calls this.position(this.position_).
    //In this case, visual offset can be absent, but new drag bounds must be applied: this.invalidate() must be called.
    if (!isNaN(pos)) {
      if (this.pixelBoundsCache_) { //TODO (A.Kudryavtsev): Move after this.invalidate() ?
        this.position_ = pos; //Here we must do it before handler call.
        if (this.handlePositionChange_) this.dispatchEvent(anychart.enums.EventType.SPLITTER_CHANGE); //Trigger user defined event if offset is not zero.
      }
      this.position_ = pos;
      this.invalidate(anychart.ConsistencyState.SPLITTER_POSITION, anychart.Signal.NEEDS_REDRAW);

    }

    return this;
  }
  return this.position_;
};


/**
 * Gets/sets a drag area length.
 * Drag area is actually an invisible area around visible splitter's line to simplify mouse targeting.
 * @param {number=} opt_value - Value to be set.
 * @return {number|anychart.core.ui.Splitter} - Current value or itself for method chaining.
 */
anychart.core.ui.Splitter.prototype.dragAreaLength = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = +opt_value;
    if (!isNaN(opt_value)) {
      opt_value = Math.abs(opt_value);
      if (this.dragAreaLength_ != opt_value) {
        this.dragAreaLength_ = opt_value;
        this.invalidate(anychart.ConsistencyState.SPLITTER_POSITION, anychart.Signal.NEEDS_REDRAW);
      }
    }
    return this;
  }
  return this.dragAreaLength_;
};


/**
 * Gets/sets a center line stroke.
 *
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill .
 * @param {number=} opt_thickness .
 * @param {string=} opt_dashpattern .
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin .
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap .
 * @return {acgraph.vector.Stroke|anychart.core.ui.Splitter|string} - Current value or itself for chaining.
 */
anychart.core.ui.Splitter.prototype.stroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var val = acgraph.vector.normalizeStroke.apply(null, arguments);
    if (!anychart.color.equals(this.stroke_, val)) {
      this.stroke_ = val;
      //Invalidates a position because changed line thickness affects a changes in drag area and line's positioning.
      this.invalidate(anychart.ConsistencyState.SPLITTER_POSITION | anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.stroke_ || 'none';
};


/**
 * Gets/sets a center line fill.
 *
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.ui.Splitter|string} - Current value or itself for chaining.
 */
anychart.core.ui.Splitter.prototype.fill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var val = acgraph.vector.normalizeFill.apply(null, arguments);
    if (!anychart.color.equals(this.fill_, val)) {
      this.fill_ = val;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.fill_ || 'none';
};


/**
 * Gets/sets a drag preview stroke.
 *
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill .
 * @param {number=} opt_thickness .
 * @param {string=} opt_dashpattern .
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin .
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap .
 * @return {acgraph.vector.Stroke|anychart.core.ui.Splitter|string} - Current value or itself for method chaining.
 */
anychart.core.ui.Splitter.prototype.dragPreviewStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var val = acgraph.vector.normalizeStroke.apply(null, arguments);
    if (!anychart.color.equals(this.dragPreviewStroke_, val)) {
      this.dragPreviewStroke_ = val;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.dragPreviewStroke_ || 'none';
};


/**
 * Gets/sets a drag preview fill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.ui.Splitter|string} - Current value or itself for method chaining.
 */
anychart.core.ui.Splitter.prototype.dragPreviewFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var val = acgraph.vector.normalizeFill.apply(null, arguments);
    if (!anychart.color.equals(this.dragPreviewFill_, val)) {
      this.dragPreviewFill_ = val;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.dragPreviewFill_ || 'none';
};


/**
 * Gets/sets a drag area stroke.
 *
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill .
 * @param {number=} opt_thickness .
 * @param {string=} opt_dashpattern .
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin .
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap .
 * @return {acgraph.vector.Stroke|anychart.core.ui.Splitter|string} - Current value or itself for method chaining.
 */
anychart.core.ui.Splitter.prototype.dragAreaStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var val = acgraph.vector.normalizeStroke.apply(null, arguments);
    if (!anychart.color.equals(this.dragAreaStroke_, val)) {
      this.dragAreaStroke_ = val;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.dragAreaStroke_ || 'none';
};


/**
 * Gets/sets a drag area fill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.ui.Splitter|string} - Current value or itself for method chaining.
 */
anychart.core.ui.Splitter.prototype.dragAreaFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var val = acgraph.vector.normalizeFill.apply(null, arguments);
    if (!anychart.color.equals(this.dragAreaFill_, val)) {
      this.dragAreaFill_ = val;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.dragAreaFill_ || 'none';
};


/**
 * Gets/sets a flag if splitter position change must be handled.
 * @param {boolean=} opt_value - Value to be set.
 * @return {boolean|anychart.core.ui.Splitter} - Current value or itself for method chaining.
 */
anychart.core.ui.Splitter.prototype.handlePositionChange = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (goog.isBoolean(opt_value)) this.handlePositionChange_ = opt_value;
    return this;
  }
  return this.handlePositionChange_;
};


/**
 * Gets/sets a flag if a splitter's width must be considered for sizes calculation.
 * @param {boolean=} opt_value - Value to be set.
 * @return {anychart.core.ui.Splitter|boolean} - Current value or itself for method chaining.
 */
anychart.core.ui.Splitter.prototype.considerSplitterWidth = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (goog.isBoolean(opt_value) && this.considerSplitterWidth_ != opt_value) {
      this.considerSplitterWidth_ = opt_value;
      this.position(this.position_);
    }
    return this;
  }
  return this.considerSplitterWidth_;
};


/**
 * Gets/sets a splitter width.
 * @param {number=} opt_value - Value to be set.
 * @return {number|anychart.core.ui.Splitter} - Current value or itself for method chaining.
 */
anychart.core.ui.Splitter.prototype.splitterWidth = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = +opt_value;
    if (!isNaN(opt_value) && this.splitterWidth_ != opt_value) {
      this.splitterWidth_ = opt_value;
      this.invalidate(anychart.ConsistencyState.SPLITTER_POSITION, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.splitterWidth_;
};


/**
 * Sets a new start limit for bounds set.
 * @param {number=} opt_value - New value to be set.
 * @return {number|anychart.core.ui.Splitter} - Current value or itself for method chaining.
 * @private
 */
anychart.core.ui.Splitter.prototype.startLimit_ = function(opt_value) {
  if (goog.isDef((opt_value))) {
    opt_value = +opt_value;
    if (!isNaN(opt_value)) {
      opt_value = Math.abs(opt_value);
      if (this.startLimitSize_ != opt_value) {
        this.newStartLimitSize_ = opt_value;
        this.invalidate(anychart.ConsistencyState.SPLITTER_POSITION, anychart.Signal.NEEDS_REDRAW);
      }
    }
    return this;
  }
  return this.startLimitSize_;
};


/**
 * Sets a new end limit for bounds set.
 * @param {number=} opt_value - New value to be set.
 * @return {number|anychart.core.ui.Splitter} - Current value or itself for method chaining.
 * @private
 */
anychart.core.ui.Splitter.prototype.endLimit_ = function(opt_value) {
  if (goog.isDef((opt_value))) {
    opt_value = +opt_value;
    if (!isNaN(opt_value)) {
      opt_value = Math.abs(opt_value);
      if (this.endLimitSize_ != opt_value) {
        this.newEndLimitSize_ = opt_value;
        this.invalidate(anychart.ConsistencyState.SPLITTER_POSITION, anychart.Signal.NEEDS_REDRAW);
      }
    }
    return this;
  }
  return this.endLimitSize_;
};


/**
 * Actual applying limit size changes.
 * @private
 */
anychart.core.ui.Splitter.prototype.drawStartLimit_ = function() {
  if (this.startLimitSize_ != this.newStartLimitSize_) {
    var isVertical = this.isVertical_();

    var size = isVertical ? this.pixelBoundsCache_.getWidth() : this.pixelBoundsCache_.getHeight();

    if (this.newStartLimitSize_ <= size) {
      this.startLimitSize_ = this.newStartLimitSize_;
      if (this.newStartLimitSize_ > size - this.endLimitSize_) {
        this.newEndLimitSize_ = size - this.newStartLimitSize_;
      }

      //This will automatically recalculate new position to fit a new limit.
      this.position(this.position_);
    }
  }
};


/**
 * Actual applying limit size changes.
 * @private
 */
anychart.core.ui.Splitter.prototype.drawEndLimit_ = function() {
  if (this.endLimitSize_ != this.newEndLimitSize_) {
    var isVertical = this.isVertical_();

    var size = isVertical ? this.pixelBoundsCache_.getWidth() : this.pixelBoundsCache_.getHeight();

    if (this.newEndLimitSize_ <= size) {
      this.endLimitSize_ = this.newEndLimitSize_;
      if (this.newEndLimitSize_ > size - this.startLimitSize_) {
        this.newStartLimitSize_ = size - this.newEndLimitSize_;
      }

      //This will automatically recalculate a new position to fit new limit.
      this.position(this.position_);
    }
  }
};


/**
 * Gets/sets a new value to left limit size.
 * @param {number=} opt_value - value to be set.
 * @return {number|anychart.core.ui.Splitter} - Current value or itself for method chaining.
 */
anychart.core.ui.Splitter.prototype.leftLimitSize = function(opt_value) {
  return this.startLimit_(opt_value);
};


/**
 * Gets/sets a new value to top limit size.
 * @param {number=} opt_value - value to be set.
 * @return {number|anychart.core.ui.Splitter} - Current value or itself for method chaining.
 */
anychart.core.ui.Splitter.prototype.topLimitSize = function(opt_value) {
  return this.startLimit_(opt_value);
};


/**
 * Gets/sets a new value to left limit size.
 * @param {number=} opt_value - value to be set.
 * @return {number|anychart.core.ui.Splitter} - Current value or itself for method chaining.
 */
anychart.core.ui.Splitter.prototype.rightLimitSize = function(opt_value) {
  return this.endLimit_(opt_value);
};


/**
 * Gets/sets a new value to bottom limit size.
 * @param {number=} opt_value - value to be set.
 * @return {number|anychart.core.ui.Splitter} - Current value or itself for method chaining.
 */
anychart.core.ui.Splitter.prototype.bottomLimitSize = function(opt_value) {
  return this.endLimit_(opt_value);
};


/**
 * Calculates a currents start bounds.
 * Start bounds is lefter rectangle for vertical splitting and an upper rectangle for horizontal splitting.
 *
 * @return {anychart.math.Rect} - Start bounds rect.
 * @private
 */
anychart.core.ui.Splitter.prototype.getStartBounds_ = function() {
  if (!this.pixelBoundsCache_) this.pixelBoundsCache_ = /** @type {goog.math.Rect} */ (this.getPixelBounds());
  var add = this.considerSplitterWidth_ ? this.splitterWidth_ : 0;
  if (this.isVertical_()) {
    return new anychart.math.Rect(
        anychart.math.round(this.pixelBoundsCache_.getLeft(), 1),
        anychart.math.round(this.pixelBoundsCache_.getTop(), 1),
        anychart.math.round((this.pixelBoundsCache_.getWidth() - add) * this.position_, 1),
        anychart.math.round(this.pixelBoundsCache_.getHeight(), 1)
    );
  } else {
    return new anychart.math.Rect(
        anychart.math.round(this.pixelBoundsCache_.getLeft(), 1),
        anychart.math.round(this.pixelBoundsCache_.getTop(), 1),
        anychart.math.round(this.pixelBoundsCache_.getWidth(), 1),
        anychart.math.round((this.pixelBoundsCache_.getHeight() - add) * this.position_, 1)
    );
  }

};


/**
 * Calculates a currents end bounds.
 * End bounds is righter rectangle for vertical splitting and an lower rectangle for horizontal splitting.
 *
 * @return {anychart.math.Rect} - End bounds rect.
 * @private
 */
anychart.core.ui.Splitter.prototype.getEndBounds_ = function() {
  var w, h;
  if (!this.pixelBoundsCache_) this.pixelBoundsCache_ = /** @type {goog.math.Rect} */ (this.getPixelBounds());
  if (this.considerSplitterWidth_) {
    w = anychart.math.round((this.pixelBoundsCache_.getWidth() - this.splitterWidth_) * this.position_, 1);
    h = anychart.math.round((this.pixelBoundsCache_.getHeight() - this.splitterWidth_) * this.position_, 1);

    if (this.isVertical_()) {
      w += this.splitterWidth_;
      return new anychart.math.Rect(
          anychart.math.round(this.pixelBoundsCache_.getLeft() + w, 1),
          anychart.math.round(this.pixelBoundsCache_.getTop(), 1),
          anychart.math.round(this.pixelBoundsCache_.getWidth() - w, 1),
          anychart.math.round(this.pixelBoundsCache_.getHeight(), 1)
      );
    } else {
      h += this.splitterWidth_;
      return new anychart.math.Rect(
          anychart.math.round(this.pixelBoundsCache_.getLeft(), 1),
          anychart.math.round(this.pixelBoundsCache_.getTop() + h, 1),
          anychart.math.round(this.pixelBoundsCache_.getWidth(), 1),
          anychart.math.round(this.pixelBoundsCache_.getHeight() - h, 1)
      );

    }
  } else {
    if (this.isVertical_()) {
      w = this.pixelBoundsCache_.getWidth() * this.position_;
      return new anychart.math.Rect(
          anychart.math.round(this.pixelBoundsCache_.getLeft() + w, 1),
          anychart.math.round(this.pixelBoundsCache_.getTop(), 1),
          anychart.math.round(this.pixelBoundsCache_.getWidth() - w, 1),
          anychart.math.round(this.pixelBoundsCache_.getHeight(), 1)
      );
    } else {
      h = this.pixelBoundsCache_.getHeight() * this.position_;
      return new anychart.math.Rect(
          anychart.math.round(this.pixelBoundsCache_.getLeft(), 1),
          anychart.math.round(this.pixelBoundsCache_.getTop() + h, 1),
          anychart.math.round(this.pixelBoundsCache_.getWidth(), 1),
          anychart.math.round(this.pixelBoundsCache_.getHeight() - h, 1)
      );

    }
  }

};


/**
 * Calculates a bounds of rectangle placed by the left side of vertical splitter.
 * @return {anychart.math.Rect} - Bounds rect.
 */
anychart.core.ui.Splitter.prototype.getLeftBounds = function() {
  return this.getStartBounds_();
};


/**
 * Calculates a bounds of rectangle placed by the upper side of horizontal splitter.
 * @return {anychart.math.Rect} - Bounds rect.
 */
anychart.core.ui.Splitter.prototype.getTopBounds = function() {
  return this.getStartBounds_();
};


/**
 * Calculates a bounds of rectangle placed by the right side of vertical splitter.
 * @return {anychart.math.Rect} - Bounds rect.
 */
anychart.core.ui.Splitter.prototype.getRightBounds = function() {
  return this.getEndBounds_();
};


/**
 * Calculates a bounds of rectangle placed by the lower side of horizontal splitter.
 * @return {anychart.math.Rect} - Bounds rect.
 */
anychart.core.ui.Splitter.prototype.getBottomBounds = function() {
  return this.getEndBounds_();
};


/**
 * Sets and resets a cursor.
 * @param {boolean=} opt_isVertical - Whether the layout is vertical.
 * @param {boolean=} opt_clear - Whether the cursor state must be restored.
 * @private
 */
anychart.core.ui.Splitter.prototype.globalCursor_ = function(opt_isVertical, opt_clear) {
  var cursor = opt_isVertical ? acgraph.vector.Cursor.E_RESIZE : acgraph.vector.Cursor.N_RESIZE;
  goog.style.setStyle(goog.global['document']['body'], 'cursor', opt_clear ? this.cursorBackup_ : cursor);

  //TODO (A.Kudryavtsev): Check: Some old browsers don't change cursor over the stage if cursor was changed globally.
  //TODO (A.Kudryavtsev): In this case something like this can be used: this.base_.parent().cursor(opt_clear ? acgraph.vector.Cursor.DEFAULT : cursor);
};


/**
 * Draws a visual appearance of splitter.
 * @private
 */
anychart.core.ui.Splitter.prototype.drawVisualSplitter_ = function() {
  var isVertical = this.isVertical_();
  this.base_.cursor(isVertical ? acgraph.vector.Cursor.E_RESIZE : acgraph.vector.Cursor.N_RESIZE);

  var splitterX, splitterY, splitterWidth, splitterHeight;
  var dragAreaX, dragAreaY, dragAreaWidth, dragAreaHeight;
  var dragX, dragY, dragWidth, dragHeight;
  var b = this.pixelBoundsCache_;

  if (this.considerSplitterWidth_) {
    splitterX = isVertical ?
        (b.getLeft() + this.position_ * (b.getWidth() - this.splitterWidth_)) :
        (b.getLeft());

    splitterY = isVertical ? b.getTop() : b.getTop() + this.position_ * (b.getHeight() - this.splitterWidth_);

    dragX = isVertical ? b.getLeft() + this.startLimitSize_ - this.dragAreaLength_ : b.getLeft();
    dragY = isVertical ? b.getTop() : b.getTop() + this.startLimitSize_ - this.dragAreaLength_;
    dragWidth = isVertical ? b.getWidth() - this.startLimitSize_ - this.endLimitSize_ + 2 * this.dragAreaLength_ : b.getWidth();
    dragHeight = isVertical ? b.getHeight() : b.getHeight() - this.startLimitSize_ - this.endLimitSize_ + 2 * this.dragAreaLength_;

  } else {
    splitterX = isVertical ? b.getLeft() + this.position_ * b.getWidth() - this.splitterWidth_ / 2 : b.getLeft();

    splitterY = isVertical ? b.getTop() : b.getTop() + this.position_ * b.getHeight() - this.splitterWidth_ / 2;

    dragX = isVertical ? b.getLeft() + this.startLimitSize_ - this.dragAreaLength_ - this.splitterWidth_ / 2 : b.getLeft();
    dragY = isVertical ? b.getTop() : b.getTop() + this.startLimitSize_ - this.dragAreaLength_ - this.splitterWidth_ / 2;
    dragWidth = isVertical ? b.getWidth() - this.startLimitSize_ - this.endLimitSize_ + 2 * this.dragAreaLength_ + this.splitterWidth_ : b.getWidth();
    dragHeight = isVertical ? b.getHeight() : b.getHeight() - this.startLimitSize_ - this.endLimitSize_ + 2 * this.dragAreaLength_ + this.splitterWidth_;

  }

  splitterWidth = isVertical ? this.splitterWidth_ : b.getWidth();
  splitterHeight = isVertical ? b.getHeight() : this.splitterWidth_;

  dragAreaX = isVertical ? splitterX - this.dragAreaLength_ : b.getLeft();
  dragAreaY = isVertical ? b.getTop() : splitterY - this.dragAreaLength_;
  dragAreaWidth = isVertical ? this.splitterWidth_ + 2 * this.dragAreaLength_ : b.getWidth();
  dragAreaHeight = isVertical ? b.getHeight() : this.splitterWidth_ + 2 * this.dragAreaLength_;

  var drag = new anychart.math.Rect(dragX, dragY, dragWidth, dragHeight);


  this.centerLine_
      .setX(splitterX)
      .setY(splitterY)
      .setWidth(splitterWidth)
      .setHeight(splitterHeight);

  this.dragArea_
      .setX(dragAreaX)
      .setY(dragAreaY)
      .setWidth(dragAreaWidth)
      .setHeight(dragAreaHeight)
      .drag(drag);

};


/**
 * Inner getter for this.base_.
 * @return {acgraph.vector.Layer}
 * @private
 */
anychart.core.ui.Splitter.prototype.getBase_ = function() {
  if (!this.base_) {
    this.base_ = /** @type {acgraph.vector.Layer} */ (acgraph.layer());
    this.registerDisposable(this.base_);
  }
  return this.base_;
};


/**
 * Drag start handler.
 * @private
 */
anychart.core.ui.Splitter.prototype.dragStartHandler_ = function() {
  this.dragging_ = true;
  this.getDragPreview_().visible(true);
  var isVertical = this.isVertical_();

  this.cursorBackup_ = goog.style.getStyle(goog.global['document']['body'], 'cursor');

  if (isVertical) {
    this.dragPreview_ //It is initiated already.
        .setX(this.position_ * this.pixelBoundsCache_.getWidth() + this.pixelBoundsCache_.getLeft())
        .setY(this.pixelBoundsCache_.getTop())
        .setWidth(0)
        .setHeight(this.pixelBoundsCache_.getHeight());
  } else {
    this.dragPreview_
        .setX(this.pixelBoundsCache_.getLeft())
        .setY(this.position_ * this.pixelBoundsCache_.getHeight() + this.pixelBoundsCache_.getTop())
        .setWidth(this.pixelBoundsCache_.getWidth())
        .setHeight(0);

  }
};


/**
 * Drag handler.
 * @private
 */
anychart.core.ui.Splitter.prototype.dragHandler_ = function() {
  var currentBounds = this.dragArea_.getBounds();
  var isVertical = this.isVertical_();
  var width = this.splitterWidth_ / 2;

  this.globalCursor_(isVertical);

  var oldPos = isVertical ?
      (this.position_ * this.pixelBoundsCache_.getWidth() + this.pixelBoundsCache_.getLeft()) :
      (this.position_ * this.pixelBoundsCache_.getHeight() + this.pixelBoundsCache_.getTop());

  var newPos = isVertical ?
      (currentBounds.getLeft() + currentBounds.getWidth() / 2) : //X axis for vertical.
      (currentBounds.getTop() + currentBounds.getHeight() / 2);  //Y axis for horizontal.

  if (isVertical) {
    this.dragPreview_
        .setX(Math.min(oldPos, newPos))
        .setWidth(Math.abs(oldPos - newPos));
    this.centerLine_.setX(newPos - width);
  } else {
    this.dragPreview_
        .setY(Math.min(oldPos, newPos))
        .setHeight(Math.abs(oldPos - newPos));
    this.centerLine_.setY(newPos - width);
  }
};


/**
 * Drag end handler.
 * @private
 */
anychart.core.ui.Splitter.prototype.dragEndHandler_ = function() {
  this.dragging_ = false;
  this.getDragPreview_().visible(false);

  var currentBounds = this.dragArea_.getBounds();
  var isVertical = this.isVertical_();

  var newPos, newRatio;

  if (!this.mouseOver_) this.globalCursor_(isVertical, true);

  if (this.considerSplitterWidth_) {
    newPos = isVertical ?
        (currentBounds.left + this.dragAreaLength_ - this.pixelBoundsCache_.left) :
        (currentBounds.top + this.dragAreaLength_ - this.pixelBoundsCache_.top);

    newRatio = isVertical ?
        (newPos / (this.pixelBoundsCache_.width - this.splitterWidth_)) :
        (newPos / (this.pixelBoundsCache_.height - this.splitterWidth_));

  } else {
    newPos = isVertical ?
        (currentBounds.left + currentBounds.width / 2 - this.pixelBoundsCache_.left) :
        (currentBounds.top + currentBounds.height / 2 - this.pixelBoundsCache_.top);

    newRatio = isVertical ? newPos / this.pixelBoundsCache_.width : newPos / this.pixelBoundsCache_.height;
  }

  this.position(anychart.math.round(newRatio, 4));
};


/**
 * Default mouse move handler.
 * @private
 */
anychart.core.ui.Splitter.prototype.mouseMoveHandler_ = function() {
  this.mouseOver_ = true;
};


/**
 * Default mouse dbl click handler.
 * @param {acgraph.events.BrowserEvent} e - Event.
 * @private
 */
anychart.core.ui.Splitter.prototype.mouseDblClickHandler_ = function(e) {
  var evt = {
    'type': acgraph.events.EventType.DBLCLICK,
    'originalEvent': e
  };
  this.dispatchEvent(evt);
};


/**
 * Default mouse out handler.
 * @private
 */
anychart.core.ui.Splitter.prototype.mouseOutHandler_ = function() {
  this.mouseOver_ = false;
  if (!this.dragging_) this.globalCursor_(this.isVertical_(), true);
};


/**
 * Inner getter for this.dragArea_.
 * @return {acgraph.vector.Rect}
 * @private
 */
anychart.core.ui.Splitter.prototype.getDragArea_ = function() {
  if (!this.dragArea_) {
    this.dragArea_ = /** @type {acgraph.vector.Rect} */ (acgraph.rect()
        .stroke(this.dragAreaStroke_)
        .fill(this.dragAreaFill_));

    acgraph.events.listen(this.dragArea_, acgraph.events.EventType.DBLCLICK, this.mouseDblClickHandler_, false, this);

    acgraph.events.listen(this.dragArea_, acgraph.events.EventType.MOUSEMOVE, this.mouseMoveHandler_, false, this);
    acgraph.events.listen(this.dragArea_, acgraph.events.EventType.MOUSEOUT, this.mouseOutHandler_, false, this);
    acgraph.events.listen(this.dragArea_, acgraph.events.EventType.DRAG_START, this.dragStartHandler_, false, this);
    acgraph.events.listen(this.dragArea_, acgraph.events.EventType.DRAG, this.dragHandler_, false, this);
    acgraph.events.listen(this.dragArea_, acgraph.events.EventType.DRAG_END, this.dragEndHandler_, false, this);

    this.registerDisposable(this.dragArea_);
  }
  return this.dragArea_;
};


/**
 * Inner getter for this.dragPreview_.
 * @return {acgraph.vector.Rect}
 * @private
 */
anychart.core.ui.Splitter.prototype.getDragPreview_ = function() {
  if (!this.dragPreview_) {
    this.dragPreview_ = /** @type {acgraph.vector.Rect} */ (acgraph.rect()
        .visible(false));

    this.registerDisposable(this.dragPreview_);
  }
  return this.dragPreview_;
};


/**
 * Inner getter for this.centerLine_.
 * @return {acgraph.vector.Rect}
 * @private
 */
anychart.core.ui.Splitter.prototype.getCenterLine_ = function() {
  if (!this.centerLine_) {
    this.centerLine_ = /** @type {acgraph.vector.Rect} */ (acgraph.rect()
        .disablePointerEvents(true)
        .fill(this.fill_)
        .stroke(this.stroke_));

    this.registerDisposable(this.centerLine_);
  }
  return this.centerLine_;
};


/**
 * Draws splitter.
 *
 * @return {anychart.core.ui.Splitter} - Itself for chaining.
 */
anychart.core.ui.Splitter.prototype.draw = function() {
  if (this.checkDrawingNeeded()) {
    var container = /** @type {acgraph.vector.ILayer} */(this.container());
    var stage = container ? container.getStage() : null;
    var manualSuspend = stage && !stage.isSuspended();
    if (manualSuspend) stage.suspend();

    //Ensure DOM structure is created.
    if (!this.getBase_().numChildren()) {
      this.getBase_()
          .addChild(/** @type {!acgraph.vector.Element} */ (this.getDragPreview_()))
          .addChild(/** @type {!acgraph.vector.Element} */ (this.getDragArea_()))
          .addChild(/** @type {!acgraph.vector.Element} */ (this.getCenterLine_()));
    }

    if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
      this.getBase_().parent(container);
      this.markConsistent(anychart.ConsistencyState.CONTAINER);
    }


    if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
      this.pixelBoundsCache_ = /** @type {goog.math.Rect} */ (this.getPixelBounds());
      if (this.handlePositionChange_) this.dispatchEvent(anychart.enums.EventType.SPLITTER_CHANGE); //Trigger user defined event if offset is not zero.
      this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.SPLITTER_POSITION);
      this.markConsistent(anychart.ConsistencyState.BOUNDS);
    }

    if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
      this.centerLine_
          .stroke(this.stroke_)
          .fill(this.fill_);

      this.dragPreview_
          .fill(this.dragPreviewFill_)
          .stroke(this.dragPreviewStroke_);

      this.dragArea_
          .fill(this.dragAreaFill_)
          .stroke(this.dragAreaStroke_);
      this.markConsistent(anychart.ConsistencyState.APPEARANCE);
    }

    if (this.hasInvalidationState(anychart.ConsistencyState.SPLITTER_POSITION)) {
      this.getDragArea_().setTransformationMatrix(1, 0, 0, 1, 0, 0);
      this.drawStartLimit_();
      this.drawEndLimit_();
      this.drawVisualSplitter_();
      this.markConsistent(anychart.ConsistencyState.SPLITTER_POSITION);
    }

    if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
      this.getBase_().zIndex(/** @type {number} */ (this.zIndex()));
      this.drawVisualSplitter_();
      this.markConsistent(anychart.ConsistencyState.Z_INDEX);
    }

    if (manualSuspend) stage.resume();
  }

  return this;
};


/**
 * If current layout is vertical.
 * @return {boolean}
 * @private
 */
anychart.core.ui.Splitter.prototype.isVertical_ = function() {
  //Is horizontal if layout is directly set as 'horizontal'. Is vertical in all of other cases.
  return !(this.layout_.toLowerCase() == anychart.enums.Layout.HORIZONTAL);
};


/** @inheritDoc */
anychart.core.ui.Splitter.prototype.remove = function() {
  //this.base_ is actually a layer. All the other elements are children of this.base_.
  if (this.base_) this.base_.parent(null);
};



//----------------------------------------------------------------------------------------------------------------------
//
//  Simple gantt splitter implementation.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Simple gantt splitter implementation.
 *
 * - Can be vertical only.
 * - Doesn't have limits.
 * - Split line is a simple line path.
 * - Always considers splitter width.
 * - Drag preview doesn't have stroke.
 * - Draw area is always transparent and doesn't have a stroke.
 * - Position is always a left pixel offset.
 *
 * @constructor
 * @extends {anychart.core.VisualBaseWithBounds}
 */
anychart.core.ui.SimpleSplitter = function() {
  anychart.core.ui.SimpleSplitter.base(this, 'constructor');

  /**
   * Layer that contains all visual elements.
   * @type {acgraph.vector.Layer}
   * @private
   */
  this.base_ = null;

  /**
   * Center single line.
   * @type {acgraph.vector.Path}
   * @private
   */
  this.centerLine_ = null;

  /**
   * Area that simplifies drag pointer navigation.
   * Actually it is a transparent rectangle that can be dragged.
   * @type {acgraph.vector.Path}
   * @private
   */
  this.dragArea_ = null;

  /**
   * Area (rectangle) that appears while dragging a resizer.
   * @type {acgraph.vector.Path}
   * @private
   */
  this.dragPreview_ = null;

  /**
   * Position ratio of resizer line.
   * @type {number}
   * @private
   */
  this.position_ = NaN;

  /**
   * Size of drag area before and after center line.
   * @type {number}
   * @private
   */
  this.dragAreaLength_ = 3;

  /**
   * Pixel bounds cache. Allows to avoid re-calculation of pixel bounds.
   * @type {anychart.math.Rect}
   * @private
   */
  this.pixelBoundsCache_;

  /**
   * Flag if splitter is currently in a dragging process.
   * @type {boolean}
   * @private
   */
  this.dragging_ = false;

  /**
   * Whether mouse is over.
   * @type {boolean}
   * @private
   */
  this.mouseOver_ = false;

  /**
   * Current cursor (before dragging).
   * @type {string}
   * @private
   */
  this.cursorBackup_ = goog.style.getStyle(goog.global['document']['body'], 'cursor');

  /**
   * Center line stroke.
   * @type {acgraph.vector.Stroke}
   * @private
   */
  this.stroke_ = acgraph.vector.normalizeStroke('1 #acbece');

  /**
   * Thickness of row stroke.
   * It is used to avoid multiple thickness extraction from rowStroke_.
   * @type {number}
   * @private
   */
  this.strokeThickness_ = 1;

  /**
   * Drag preview fill.
   * @type {acgraph.vector.Fill}
   * @private
   */
  this.dragPreviewFill_ = acgraph.vector.normalizeFill('#ccd7e1 0.3');

  /**
   * Drag area fill.
   * @type {acgraph.vector.Fill}
   * @private
   */
  this.dragAreaFill_ = acgraph.vector.normalizeFill('#fff 0.00001');

  /**
   * Flag if changing of splitter position must be handled.
   * @type {boolean}
   * @private
   */
  this.handlePositionChange_ = true;

};
goog.inherits(anychart.core.ui.SimpleSplitter, anychart.core.VisualBaseWithBounds);


/**
 * Supported signals.
 * @type {number}
 */
anychart.core.ui.SimpleSplitter.prototype.SUPPORTED_SIGNALS = anychart.core.VisualBaseWithBounds.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistence states.
 * @type {number}
 */
anychart.core.ui.SimpleSplitter.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBaseWithBounds.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.SPLITTER_POSITION;


/** @inheritDoc */
anychart.core.ui.SimpleSplitter.prototype.remove = function() {
  //this.base_ is actually a layer. All the other elements are children of this.base_.
  if (this.base_) this.base_.parent(null);
};


/**
 * Sets a position of splitter in its bounds and returns itself or returns a current value.
 * NOTE: Takes not the same parameters as anychart.core.ui.Splitter!!!
 *
 * @param {number=} opt_value - Value to be set. Must be a number (left px offset) or a percent value ("57.3%").
 * @return {number|anychart.core.ui.SimpleSplitter} - Current value or itself for method chaining.
 */
anychart.core.ui.SimpleSplitter.prototype.position = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.position_ != opt_value) {
      this.position_ = opt_value;
      this.invalidate(anychart.ConsistencyState.SPLITTER_POSITION, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.position_;
};


/**
 * Gets/sets a drag area length.
 * Drag area is actually an invisible area around visible splitter's line to simplify mouse targeting.
 * @param {number=} opt_value - Value to be set.
 * @return {number|anychart.core.ui.SimpleSplitter} - Current value or itself for method chaining.
 */
anychart.core.ui.SimpleSplitter.prototype.dragAreaLength = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = +opt_value;
    if (!isNaN(opt_value)) {
      opt_value = Math.abs(opt_value);
      if (this.dragAreaLength_ != opt_value) {
        this.dragAreaLength_ = opt_value;
        this.invalidate(anychart.ConsistencyState.SPLITTER_POSITION, anychart.Signal.NEEDS_REDRAW);
      }
    }
    return this;
  }
  return this.dragAreaLength_;
};


/**
 * Gets/sets a center line stroke.
 *
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill .
 * @param {number=} opt_thickness .
 * @param {string=} opt_dashpattern .
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin .
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap .
 * @return {acgraph.vector.Stroke|anychart.core.ui.SimpleSplitter|string} - Current value or itself for chaining.
 */
anychart.core.ui.SimpleSplitter.prototype.stroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var val = acgraph.vector.normalizeStroke.apply(null, arguments);
    var newThickness = anychart.utils.extractThickness(val);

    if (!anychart.color.equals(this.stroke_, val) || newThickness != this.strokeThickness_) {
      this.stroke_ = val;
      this.strokeThickness_ = newThickness;
      //Invalidates a position because changed line thickness affects a changes in drag area and line's positioning.
      this.invalidate(anychart.ConsistencyState.SPLITTER_POSITION | anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.stroke_ || 'none';
};


/**
 * Gets/sets a drag preview fill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.ui.SimpleSplitter|string} - Current value or itself for method chaining.
 */
anychart.core.ui.SimpleSplitter.prototype.dragPreviewFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var val = acgraph.vector.normalizeFill.apply(null, arguments);
    if (!anychart.color.equals(this.dragPreviewFill_, val)) {
      this.dragPreviewFill_ = val;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.dragPreviewFill_ || 'none';
};


/**
 * Gets/sets a flag if splitter position change must be handled.
 * @param {boolean=} opt_value - Value to be set.
 * @return {boolean|anychart.core.ui.SimpleSplitter} - Current value or itself for method chaining.
 */
anychart.core.ui.SimpleSplitter.prototype.handlePositionChange = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (goog.isBoolean(opt_value)) this.handlePositionChange_ = opt_value;
    return this;
  }
  return this.handlePositionChange_;
};


/**
 * Calculates a current left bounds.
 * @return {anychart.math.Rect} - Start bounds rect.
 */
anychart.core.ui.SimpleSplitter.prototype.getLeftBounds = function() {
  if (!this.pixelBoundsCache_) this.pixelBoundsCache_ = /** @type {goog.math.Rect} */ (this.getPixelBounds());
  return new anychart.math.Rect(
      anychart.math.round(this.pixelBoundsCache_.left, 1),
      anychart.math.round(this.pixelBoundsCache_.top, 1),
      anychart.math.round(Math.min(this.position_, this.pixelBoundsCache_.width - this.strokeThickness_), 1),
      anychart.math.round(this.pixelBoundsCache_.height, 1)
  );
};


/**
 * Calculates a currents right bounds.
 * @return {anychart.math.Rect} - End bounds rect.
 */
anychart.core.ui.SimpleSplitter.prototype.getRightBounds = function() {
  if (!this.pixelBoundsCache_) this.pixelBoundsCache_ = /** @type {goog.math.Rect} */ (this.getPixelBounds());
  return new anychart.math.Rect(
      anychart.math.round(this.pixelBoundsCache_.left + this.position_ + this.strokeThickness_, 1),
      anychart.math.round(this.pixelBoundsCache_.top, 1),
      anychart.math.round(Math.max(this.pixelBoundsCache_.width - this.strokeThickness_ - this.position_, 0), 1),
      anychart.math.round(this.pixelBoundsCache_.height, 1)
  );
};


/**
 * Sets and resets a cursor.
 * @param {boolean=} opt_clear - Whether the cursor state must be restored.
 * @private
 */
anychart.core.ui.SimpleSplitter.prototype.globalCursor_ = function(opt_clear) {
  goog.style.setStyle(goog.global['document']['body'], 'cursor',
      opt_clear ? this.cursorBackup_ : acgraph.vector.Cursor.E_RESIZE);

  //TODO (A.Kudryavtsev): Check: Some old browsers don't change cursor over the stage if cursor was changed globally.
  //TODO (A.Kudryavtsev): In this case something like this can be used: this.base_.parent().cursor(opt_clear ? acgraph.vector.Cursor.DEFAULT : cursor);
};


/**
 * Inner getter for this.base_.
 * @return {acgraph.vector.Layer}
 * @private
 */
anychart.core.ui.SimpleSplitter.prototype.getBase_ = function() {
  if (!this.base_) {
    this.base_ = /** @type {acgraph.vector.Layer} */ (acgraph.layer());
    this.registerDisposable(this.base_);
  }
  return this.base_;
};


/**
 * Drag start handler.
 * @private
 */
anychart.core.ui.SimpleSplitter.prototype.dragStartHandler_ = function() {
  this.dragging_ = true;
  this.cursorBackup_ = goog.style.getStyle(goog.global['document']['body'], 'cursor');
  this.getDragPreview_().clear();
};


/**
 * Drag handler.
 * @private
 */
anychart.core.ui.SimpleSplitter.prototype.dragHandler_ = function() {
  var currentBounds = this.dragArea_.getBounds();
  this.globalCursor_();

  var oldLeft = this.pixelBoundsCache_.left + this.position_ + this.strokeThickness_ / 2;
  var newLeft = currentBounds.getLeft() + currentBounds.getWidth() / 2;

  this.dragPreview_
      .clear()
      .moveTo(oldLeft, this.pixelBoundsCache_.top)
      .lineTo(newLeft, this.pixelBoundsCache_.top)
      .lineTo(newLeft, this.pixelBoundsCache_.top + this.pixelBoundsCache_.height)
      .lineTo(oldLeft, this.pixelBoundsCache_.top + this.pixelBoundsCache_.height)
      .close();

  this.centerLine_
      .clear()
      .moveTo(newLeft, this.pixelBoundsCache_.top)
      .lineTo(newLeft, this.pixelBoundsCache_.top + this.pixelBoundsCache_.height);
};


/**
 * Drag end handler.
 * @private
 */
anychart.core.ui.SimpleSplitter.prototype.dragEndHandler_ = function() {
  this.dragging_ = false;
  this.dragPreview_.clear();

  var currentBounds = this.dragArea_.getBounds();

  if (!this.mouseOver_) this.globalCursor_(true);

  this.position(currentBounds.left + this.dragAreaLength_ - this.pixelBoundsCache_.left);
};


/**
 * Mouse up handler.
 * @param {acgraph.events.BrowserEvent} event - Event.
 * @private
 */
anychart.core.ui.SimpleSplitter.prototype.mouseUpHandler_ = function(event) {
  event.preventDefault();
  this.handleBrowserEvent(event);
};


/**
 * Draws a visual appearance of splitter.
 * @private
 */
anychart.core.ui.SimpleSplitter.prototype.drawVisualSplitter_ = function() {
  this.base_.cursor(acgraph.vector.Cursor.E_RESIZE);
  var left = this.pixelBoundsCache_.left + this.position_ + this.strokeThickness_ / 2;

  var drag = new anychart.math.Rect(this.pixelBoundsCache_.left - this.dragAreaLength_,
      this.pixelBoundsCache_.top,
      this.pixelBoundsCache_.width + 2 * this.dragAreaLength_,
      this.pixelBoundsCache_.height);

  this.centerLine_
      .clear()
      .moveTo(left, this.pixelBoundsCache_.top)
      .lineTo(left, this.pixelBoundsCache_.top + this.pixelBoundsCache_.height);

  var dragAreaLeft = this.pixelBoundsCache_.left + this.position_ - this.dragAreaLength_;
  var dragAreaRight = this.pixelBoundsCache_.left + this.position_ + this.strokeThickness_ + this.dragAreaLength_;

  this.dragArea_.setTransformationMatrix(1, 0, 0, 1, 0, 0);

  this.dragArea_
      .clear()
      .moveTo(dragAreaLeft, this.pixelBoundsCache_.top)
      .lineTo(dragAreaRight, this.pixelBoundsCache_.top)
      .lineTo(dragAreaRight, this.pixelBoundsCache_.top + this.pixelBoundsCache_.height)
      .lineTo(dragAreaLeft, this.pixelBoundsCache_.top + this.pixelBoundsCache_.height)
      .close()
      .drag(drag);
};


/**
 * Default mouse move handler.
 * @private
 */
anychart.core.ui.SimpleSplitter.prototype.mouseMoveHandler_ = function() {
  this.mouseOver_ = true;
};


/**
 * Default mouse out handler.
 * @private
 */
anychart.core.ui.SimpleSplitter.prototype.mouseOutHandler_ = function() {
  this.mouseOver_ = false;
  if (!this.dragging_) this.globalCursor_(true);
};


/**
 * Inner getter for this.dragArea_.
 * @return {acgraph.vector.Path}
 * @private
 */
anychart.core.ui.SimpleSplitter.prototype.getDragArea_ = function() {
  if (!this.dragArea_) {
    this.dragArea_ = /** @type {acgraph.vector.Path} */ (acgraph.path()
        .fill(this.dragAreaFill_).stroke(null));

    acgraph.events.listen(this.dragArea_, acgraph.events.EventType.DRAG_START, this.dragStartHandler_, false, this);
    acgraph.events.listen(this.dragArea_, acgraph.events.EventType.DRAG, this.dragHandler_, false, this);
    acgraph.events.listen(this.dragArea_, acgraph.events.EventType.DRAG_END, this.dragEndHandler_, false, this);

    this.bindHandlersToGraphics(this.dragArea_, null, this.mouseOutHandler_, null, this.mouseMoveHandler_, null, this.mouseUpHandler_);

    this.registerDisposable(this.dragArea_);
  }
  return this.dragArea_;
};


/**
 * Inner getter for this.dragPreview_.
 * @return {acgraph.vector.Path}
 * @private
 */
anychart.core.ui.SimpleSplitter.prototype.getDragPreview_ = function() {
  if (!this.dragPreview_) {
    this.dragPreview_ = /** @type {acgraph.vector.Path} */ (acgraph.path());
    this.dragPreview_.fill(this.dragPreviewFill_).stroke(null);
    this.registerDisposable(this.dragPreview_);
  }
  return this.dragPreview_;
};


/**
 * Inner getter for this.centerLine_.
 * @return {acgraph.vector.Path}
 * @private
 */
anychart.core.ui.SimpleSplitter.prototype.getCenterLine_ = function() {
  if (!this.centerLine_) {
    this.centerLine_ = /** @type {acgraph.vector.Path} */ (acgraph.path()
        .disablePointerEvents(true)
        .stroke(this.stroke_));

    this.registerDisposable(this.centerLine_);
  }
  return this.centerLine_;
};


/**
 * Draws splitter.
 *
 * @return {anychart.core.ui.SimpleSplitter} - Itself for chaining.
 */
anychart.core.ui.SimpleSplitter.prototype.draw = function() {
  if (this.checkDrawingNeeded()) {
    var container = /** @type {acgraph.vector.ILayer} */(this.container());
    var stage = container ? container.getStage() : null;
    var manualSuspend = stage && !stage.isSuspended();
    if (manualSuspend) stage.suspend();

    //Ensure DOM structure is created.
    if (!this.getBase_().numChildren()) {
      this.getBase_()
          .addChild(/** @type {!acgraph.vector.Element} */ (this.getDragPreview_()))
          .addChild(/** @type {!acgraph.vector.Element} */ (this.getDragArea_()))
          .addChild(/** @type {!acgraph.vector.Element} */ (this.getCenterLine_()));
    }

    if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
      this.getBase_().parent(container);
      this.markConsistent(anychart.ConsistencyState.CONTAINER);
    }


    if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
      this.pixelBoundsCache_ = /** @type {goog.math.Rect} */ (this.getPixelBounds());
      if (this.handlePositionChange_) this.dispatchEvent(anychart.enums.EventType.SPLITTER_CHANGE); //Trigger user defined event if offset is not zero.
      this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.SPLITTER_POSITION);
      this.markConsistent(anychart.ConsistencyState.BOUNDS);
    }

    if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
      this.centerLine_
          .stroke(this.stroke_);

      this.dragPreview_
          .fill(this.dragPreviewFill_);

      this.dragArea_
          .fill(this.dragAreaFill_);
      this.markConsistent(anychart.ConsistencyState.APPEARANCE);
    }

    if (this.hasInvalidationState(anychart.ConsistencyState.SPLITTER_POSITION)) {
      if (isNaN(this.position_)) this.position_ = Math.round((this.pixelBoundsCache_.width - this.strokeThickness_) / 2);
      if (this.handlePositionChange_) {
        this.dispatchEvent(anychart.enums.EventType.SPLITTER_CHANGE);
      } //Trigger user defined event if offset is not zero.
      this.drawVisualSplitter_();
      this.markConsistent(anychart.ConsistencyState.SPLITTER_POSITION);
    }

    if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
      this.getBase_().zIndex(/** @type {number} */ (this.zIndex()));
      this.drawVisualSplitter_();
      this.markConsistent(anychart.ConsistencyState.Z_INDEX);
    }

    if (manualSuspend) stage.resume();
  }

  return this;
};



//proto['layout'] = proto.layout;
//proto['position'] = proto.position;
//proto['dragAreaLength'] = proto.dragAreaLength;
//proto['stroke'] = proto.stroke;
//proto['fill'] = proto.fill;
//proto['dragPreviewStroke'] = proto.dragPreviewStroke;
//proto['dragPreviewFill'] = proto.dragPreviewFill;
//proto['dragAreaStroke'] = proto.dragAreaStroke;
//proto['dragAreaFill'] = proto.dragAreaFill;
//proto['handlePositionChange'] = proto.handlePositionChange;
//proto['considerSplitterWidth'] = proto.considerSplitterWidth;
//proto['splitterWidth'] = proto.splitterWidth;
//proto['leftLimitSize'] = proto.leftLimitSize;
//proto['topLimitSize'] = proto.topLimitSize;
//proto['rightLimitSize'] = proto.rightLimitSize;
//proto['bottomLimitSize'] = proto.bottomLimitSize;
//proto['getLeftBounds'] = proto.getLeftBounds;
//proto['getTopBounds'] = proto.getTopBounds;
//proto['getRightBounds'] = proto.getRightBounds;
//proto['getBottomBounds'] = proto.getBottomBounds;
//proto['draw'] = proto.draw;
//exports
