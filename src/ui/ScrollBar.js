goog.provide('anychart.ui.ScrollBar');
goog.require('acgraph');
goog.require('anychart.VisualBaseWithBounds');
goog.require('anychart.color');
goog.require('anychart.enums');
goog.require('anychart.math');
goog.require('anychart.ui.Button');
goog.require('anychart.utils');
goog.require('goog.events.Event');
goog.require('goog.math');



/**
 * Scroll bar implementation.
 *
 * TODO (A.Kudryavtsev): Add features list and common functionality.
 *
 * @constructor
 * @extends {anychart.VisualBaseWithBounds}
 */
anychart.ui.ScrollBar = function() {
  goog.base(this);


  /**
   * Base layer.
   * @type {acgraph.vector.Layer}
   * @private
   */
  this.base_ = null;


  /**
   * Background.
   * @type {acgraph.vector.Rect}
   * @private
   */
  this.bg_ = null;


  /**
   * Forward button.
   * @type {anychart.ui.Button}
   * @private
   */
  this.forwardButton_ = null;


  /**
   * Backward button.
   * @type {anychart.ui.Button}
   * @private
   */
  this.backwardButton_ = null;


  /**
   * Slider.
   * @type {acgraph.vector.Rect}
   * @private
   */
  this.slider_ = null;


  /**
   * Layout.
   * @type {anychart.enums.Layout}
   * @private
   */
  this.layout_ = anychart.enums.Layout.VERTICAL;

  /**
   * Pixel bounds cache. Allows to avoid re-calculation of pixel bounds.
   * @type {anychart.math.Rect}
   * @private
   */
  this.pixelBoundsCache_;


  /**
   * Background fill.
   * @type {acgraph.vector.Fill}
   * @private
   */
  this.bgFill_ = acgraph.vector.normalizeFill('#e0e0e0');


  /**
   * Background stroke.
   * @type {acgraph.vector.Stroke}
   * @private
   */
  this.bgStroke_ = acgraph.vector.normalizeStroke('#d5d5d5');


  /**
   * Slider fill.
   * @type {acgraph.vector.Fill}
   * @private
   */
  this.sliderFill_ = acgraph.vector.normalizeFill('#d5d5d5');


  /**
   * Slider stroke.
   * @type {acgraph.vector.Stroke}
   * @private
   */
  this.sliderStroke_ = acgraph.vector.normalizeStroke('#656565');


  /**
   * Start ratio value.
   * NOTE: startRatio_ with endRatio_ and contentBounds_ with visibleBounds_ depend on each other.
   *
   * @type {number}
   * @private
   */
  this.startRatio_ = 0;


  /**
   * End ratio value.
   * NOTE: startRatio_ with endRatio_ and contentBounds_ with visibleBounds_ depend on each other.
   *
   * @type {number}
   * @private
   */
  this.endRatio_ = 1;


  /**
   * Content bounds. Here it is actually a reflection of some real content bounds. Used to calculate a correct positions.
   * NOTE: startRatio_ with endRatio_ and contentBounds_ with visibleBounds_ depend on each other.
   *
   * @type {acgraph.math.Rect}
   * @private
   */
  this.contentBounds_ = null;


  /**
   * Visible bounds in a content bounds. Actually is 'what we can see'. Used to calculate a correct positions.
   * NOTE: startRatio_ with endRatio_ and contentBounds_ with visibleBounds_ depend on each other.
   *
   * @type {acgraph.math.Rect}
   * @private
   */
  this.visibleBounds_ = null;


  /**
   * If the scroll button are visible.
   * @type {boolean}
   * @private
   */
  this.buttonsVisible_ = true;


  /**
   * Timeout id. Used for detached event dispatching.
   * @type {number}
   * @private
   */
  this.tid_ = -1;


};
goog.inherits(anychart.ui.ScrollBar, anychart.VisualBaseWithBounds);


/**
 * Supported signals.
 * @type {number}
 */
anychart.ui.ScrollBar.prototype.SUPPORTED_SIGNALS = anychart.VisualBaseWithBounds.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistence states.
 * @type {number}
 */
anychart.ui.ScrollBar.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.VisualBaseWithBounds.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.POSITION;


/**
 * Scroll pixel step;
 * @type {number}
 */
anychart.ui.ScrollBar.SCROLL_PIXEL_STEP = 40;


/**
 * Scroll ratio step.
 * @type {number}
 */
anychart.ui.ScrollBar.SCROLL_RATIO_STEP = .05;


/**
 * Getter/setter for layout.
 * NOTE: Doesn't modify actual bounds.
 *
 * @param {(anychart.enums.Layout|string)=} opt_value - Value to be set.
 * @return {(anychart.enums.Layout|anychart.ui.ScrollBar)} - Current layout or itself for chaining.
 */
anychart.ui.ScrollBar.prototype.layout = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeLayout(opt_value);
    if (opt_value != this.layout_) {
      this.layout_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.layout_;
};


/**
 * Gets/sets a background stroke.
 *
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill .
 * @param {number=} opt_thickness .
 * @param {string=} opt_dashpattern .
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin .
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap .
 * @return {acgraph.vector.Stroke|anychart.ui.ScrollBar|string} - Current value or itself for chaining.
 */
anychart.ui.ScrollBar.prototype.backgroundStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var val = acgraph.vector.normalizeStroke.apply(null, arguments);
    if (!anychart.color.equals(this.bgStroke_, val)) {
      this.bgStroke_ = val;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.bgStroke_ || 'none';
};


/**
 * Gets/sets a background fill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.ui.ScrollBar|string} - Current value or itself for chaining.
 */
anychart.ui.ScrollBar.prototype.backgroundFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var val = acgraph.vector.normalizeFill.apply(null, arguments);
    if (!anychart.color.equals(this.bgFill_, val)) {
      this.bgFill_ = val;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.bgFill_ || 'none';
};


/**
 * Gets/sets a slider stroke.
 *
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill .
 * @param {number=} opt_thickness .
 * @param {string=} opt_dashpattern .
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin .
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap .
 * @return {acgraph.vector.Stroke|anychart.ui.ScrollBar|string} - Current value or itself for chaining.
 */
anychart.ui.ScrollBar.prototype.sliderStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var val = acgraph.vector.normalizeStroke.apply(null, arguments);
    if (!anychart.color.equals(this.sliderStroke_, val)) {
      this.sliderStroke_ = val;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.sliderStroke_ || 'none';
};


/**
 * Gets/sets a slider fill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.ui.ScrollBar|string} - Current value or itself for chaining.
 */
anychart.ui.ScrollBar.prototype.sliderFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var val = acgraph.vector.normalizeFill.apply(null, arguments);
    if (!anychart.color.equals(this.sliderFill_, val)) {
      this.sliderFill_ = val;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.sliderFill_ || 'none';
};


/**
 * Gets/sets a content bounds.
 * Content bounds in this case is a reflection of some real bounds that express a real content's sizes.
 *
 * @param {acgraph.math.Rect=} opt_value - Value to be set.
 * @param {string=} opt_eventSource - Scroll event source. Additional information to be attached to event object. Used
 *  for advanced events manipulations.
 * @return {anychart.ui.ScrollBar|acgraph.math.Rect} - Current value or itself for chaining.
 */
anychart.ui.ScrollBar.prototype.contentBounds = function(opt_value, opt_eventSource) {
  if (goog.isDef(opt_value)) {
    if (!acgraph.math.Rect.equals(this.contentBounds_, opt_value)) {
      this.contentBounds_ = opt_value.clone();
      if (!this.visibleBounds_) {
        this.visibleBounds_ = this.contentBounds_.clone();
      } else {
        this.synchronizeBounds_();
      }
      this.synchronizeRatioToBounds_();
      this.invalidate(anychart.ConsistencyState.POSITION, anychart.Signal.NEEDS_REDRAW);
      this.dispatchScrollEvent_(opt_eventSource || 'api');
    }
    return this;
  }
  return this.contentBounds_;
};


/**
 * Gets/sets a visible bounds.
 * Visible bounds in this case is a reflection of some real bounds visible in a real content's bounds.
 *
 * @param {acgraph.math.Rect=} opt_value - Value to be set.
 * @param {string=} opt_eventSource - Scroll event source. Additional information to be attached to event object. Used
 *  for advanced events manipulations.
 * @return {anychart.ui.ScrollBar|acgraph.math.Rect} - Current value or itself for chaining.
 */
anychart.ui.ScrollBar.prototype.visibleBounds = function(opt_value, opt_eventSource) {
  if (goog.isDef(opt_value)) {
    if (!acgraph.math.Rect.equals(this.visibleBounds_, opt_value)) {
      this.visibleBounds_ = opt_value.clone();
      if (!this.contentBounds_) {
        this.contentBounds_ = this.visibleBounds_.clone();
      } else {
        this.synchronizeBounds_();
      }
      this.synchronizeRatioToBounds_();
      this.invalidate(anychart.ConsistencyState.POSITION, anychart.Signal.NEEDS_REDRAW);
      this.dispatchScrollEvent_(opt_eventSource || 'api');
    }
    return this;
  }
  return this.visibleBounds_;
};


/**
 * Gets/sets a start ratio.
 * To set startRatio and endRatio both in a same moment, use {@link setRatio} instead.
 *
 * NOTE: Start ratio value can't exceed an end ratio value. That's why the following behavior is implemented (please be careful here):
 *  1) startRatio can't be set to 1. If you try to set startRatio(1) then new value will not be set.
 *
 *  2) If you try to set startRatio > endRatio, the minimal value becomes startRatio, the maximal one becomes endRatio.
 *     For example:
 *     startRatio = 0.3;
 *     endRatio = 0.5;
 *
 *     Call startRatio(0.6) :
 *     startRatio = 0.5; //Swapped with endRatio.
 *     endRatio = 0.6; //Newly set value.
 *
 *   3) If you try to set startRatio equal to current endRatio, then endRatio becomes 1.
 *      It is so because the difference between startRatio and endRatio as actually a visible range in some real bounds.
 *      This range can't be 0 (dividing by 0 means that content bounds are infinity).
 *      At the same time, user must have a possibility to set startRatio to current endRatio value excepting startRatio = 1.
 *      So, be careful here.
 *
 *      For example:
 *      startRatio = 0.3;
 *      endRatio = 0.5;
 *
 *      Call startRatio(0.5) :
 *      startRatio = 0.5; //Newly set value.
 *      endRatio = 1; //Force 1.
 *
 *      Usage:
 *      Initial startRatio = 0.3;
 *      Initial endRatio = 0.5;
 *
 *      scrollBar
 *        .startRatio(0.5)  //Here startRatio = 0.5 , endRatio becomes 1.
 *        .endRatio(0.9);   //startRatio is still 0.5, endRatio becomes 0.9 - everything is fine.
 *
 * @param {number=} opt_value - Value to be set.
 * @param {string=} opt_eventSource - Scroll event source. Additional information to be attached to event object. Used
 *  for advanced events manipulations.
 * @return {number|anychart.ui.ScrollBar} - Current value or itself for chaining.
 */
anychart.ui.ScrollBar.prototype.startRatio = function(opt_value, opt_eventSource) {
  if (goog.isDef(opt_value)) {
    opt_value = +opt_value;
    if (!isNaN(opt_value) && this.startRatio_ != opt_value && opt_value >= 0 && opt_value < 1) {
      if (opt_value == this.endRatio_) {
        this.endRatio_ = 1;
        this.startRatio_ = opt_value;
      } else {
        this.startRatio_ = Math.min(opt_value, this.endRatio_);
        this.endRatio_ = Math.max(opt_value, this.endRatio_);
      }
      this.synchronizeBoundsToRatio_();
      this.invalidate(anychart.ConsistencyState.POSITION, anychart.Signal.NEEDS_REDRAW);
      this.dispatchScrollEvent_(opt_eventSource || 'api');
    }
    return this;
  }
  return this.startRatio_;
};


/**
 * Gets/sets an end ratio.
 * To set startRatio and endRatio both in a same moment, use {@link setRatio} instead.
 *
 * NOTE: Start ratio value can't exceed an end ratio value. That's why the following behavior is implemented (please be careful here):
 *  1) endRatio can't be set to 0. If you try to set endRatio(0) then new value will not be set.
 *
 *  2) If you try to set endRatio < startRatio, the minimal value becomes startRatio, the maximal one becomes endRatio.
 *     For example:
 *     startRatio = 0.3;
 *     endRatio = 0.5;
 *
 *     Call endRatio(0.2) :
 *     startRatio = 0.2; //Newly set value.
 *     endRatio = 0.3; //Swapped with startRatio.
 *
 *   3) If you try to set endRatio equal to current startRatio, then startRatio becomes 0.
 *      It is so because the difference between startRatio and endRatio as actually a visible range in some real bounds.
 *      This range can't be 0 (dividing by 0 means that content bounds are infinity).
 *      At the same time, user must have a possibility to set endRatio to current startRatio value excepting endRatio = 0.
 *      So, be careful here.
 *
 *      For example:
 *      startRatio = 0.3;
 *      endRatio = 0.5;
 *
 *      Call endRatio(0.3) :
 *      startRatio = 0; //Force 0.
 *      endRatio = 0.3; //Newly set value.
 *
 *      Usage:
 *      Initial startRatio = 0.3;
 *      Initial endRatio = 0.5;
 *
 *      scrollBar
 *        .endRatio(0.3)      //Here startRatio becomes 0 , endRatio becomes 0.3.
 *        .startRatio(0.1);   //startRatio becomes 0.1, endRatio is still 0.3 - everything is fine.
 *
 * @param {number=} opt_value - Value to be set.
 * @param {string=} opt_eventSource - Scroll event source. Additional information to be attached to event object. Used
 *  for advanced events manipulations.
 * @return {number|anychart.ui.ScrollBar} - Current value or itself for chaining.
 */
anychart.ui.ScrollBar.prototype.endRatio = function(opt_value, opt_eventSource) {
  if (goog.isDef(opt_value)) {
    opt_value = +opt_value;
    if (!isNaN(opt_value) && this.endRatio_ != opt_value && opt_value > 0 && opt_value <= 1) {
      if (opt_value == this.startRatio_) {
        this.startRatio_ = 0;
        this.endRatio_ = opt_value;
      } else {
        this.endRatio_ = Math.max(opt_value, this.startRatio_);
        this.startRatio_ = Math.min(opt_value, this.startRatio_);
      }
      this.synchronizeBoundsToRatio_();
      this.invalidate(anychart.ConsistencyState.POSITION, anychart.Signal.NEEDS_REDRAW);
      this.dispatchScrollEvent_(opt_eventSource || 'api');
    }
    return this;
  }
  return this.endRatio_;
};


/**
 * Sets startRatio and endRatio.
 * If you try to set startRatio < endRatio, the minimal value becomes startRatio, the maximal one becomes endRatio.
 * If you try to set startRatio == endRatio, new values will not be set.
 *
 * NOTE:
 * This method is created to simplify usage of a scroll bar.
 * Example:
 *    startRatio = 0;
 *    endRatio = 0.4;
 *
 *    Than we call:
 *    scrollBar.startRatio(0.6).endRatio(1);
 *
 *    By the first look, we're expecting that the values will be
 *      startRatio = 0.6;
 *      endRatio = 1;
 *    but it is not correct in this case:
 *
 *    Calling the first scrollBar.startRatio(0.6) gives the following values:
 *      startRatio = 0.4; //Swapped with current endRatio value. See {@link startRatio} description.
 *      endRatio = 0.6; //Newly set value.
 *
 *    Then call .endRatio(1) and values become:
 *      startRatio = 0.4; //Not changes after the previous operation.
 *      endRatio = 1; //Newly set value.
 *
 * Using this method allows to avoid such a strange situations.
 *
 * @param {number} startRatio - New value for start ratio. Must be in [0 .. endRatio) range.
 * @param {number} endRatio - New value for end ratio. Must be in (startRatio .. 1] range.
 * @param {string=} opt_eventSource - Scroll event source. Additional information to be attached to event object. Used
 *  for advanced events manipulations.
 *
 * @return {anychart.ui.ScrollBar} - Itself for chaining.
 */
anychart.ui.ScrollBar.prototype.setRatio = function(startRatio, endRatio, opt_eventSource) {
  startRatio = +startRatio;
  endRatio = +endRatio;
  if (!isNaN(startRatio) && !isNaN(endRatio)) {
    startRatio = goog.math.clamp(startRatio, 0, 1);
    endRatio = goog.math.clamp(endRatio, 0, 1);

    var newStartRatio = Math.min(startRatio, endRatio);
    var newEndRatio = Math.max(startRatio, endRatio);
    if ((newStartRatio != newEndRatio) && !(this.startRatio_ == newStartRatio && this.endRatio_ == newEndRatio)) {
      this.startRatio_ = newStartRatio;
      this.endRatio_ = newEndRatio;
      this.synchronizeBoundsToRatio_();
      this.invalidate(anychart.ConsistencyState.POSITION, anychart.Signal.NEEDS_REDRAW);
      this.dispatchScrollEvent_(opt_eventSource || 'api');
    }
  }
  return this;
};


/**
 * Tries to set new value of start ratio.
 * This method keeps a difference between end ratio and start ratio constant, that's why this method can't be used as
 * direct value setter.
 * @param {number} value - New value, where method tries to scroll start ratio to. //TODO Bad english :'( .
 * @param {string=} opt_eventSource - Scroll event source. Additional information to be attached to event object. Used
 *  for advanced events manipulations.
 * @return {anychart.ui.ScrollBar} - Itself for chaining.
 */
anychart.ui.ScrollBar.prototype.scrollStartTo = function(value, opt_eventSource) {
  value = +value;
  if (!isNaN(value)) {
    value = goog.math.clamp(value, 0, 1);
    var ratioDiff = this.endRatio_ - this.startRatio_; //If here are no bugs, ratioDiff != 0;

    //Bad JS math.
    var newEndRatio = anychart.math.round(goog.math.clamp(value + ratioDiff, 0, 1), 4);
    var newStartRatio = anychart.math.round(newEndRatio - ratioDiff, 4);

    if (!(this.startRatio_ == newStartRatio && this.endRatio_ == newEndRatio)) {
      this.startRatio_ = newStartRatio;
      this.endRatio_ = newEndRatio;
      this.synchronizeBoundsToRatio_();
      this.invalidate(anychart.ConsistencyState.POSITION, anychart.Signal.NEEDS_REDRAW);
      this.dispatchScrollEvent_(opt_eventSource || 'api');
    }
  }
  return this;
};


/**
 * Tries to set new value of start pixel of visible bounds.
 * This method keeps a difference between end value of visible bounds and its start value constant, that's why this
 * method can't be used as direct value setter.
 * NOTE: In this case start value for horizontal layout is 'left' coordinate of visible bounds and 'top' for vertical layout.
 *
 * @param {number} value - New value, where method tries to scroll start value of visible bounds to. //TODO Bad english :'( .
 * @param {string=} opt_eventSource - Scroll event source. Additional information to be attached to event object. Used
 *  for advanced events manipulations.
 * @return {anychart.ui.ScrollBar} - Itself for chaining.
 */
anychart.ui.ScrollBar.prototype.scrollPixelStartTo = function(value, opt_eventSource) {
  value = +value;
  if (this.visibleBounds_ && !isNaN(value)) {
    var isVertical = this.isVertical_();
    var move = value != (isVertical ? this.visibleBounds_.top : this.visibleBounds_.left);

    if (move) {
      isVertical ?
          (this.visibleBounds_.top = value) :
          (this.visibleBounds_.left = value);

      this.synchronizeBounds_();
      this.synchronizeRatioToBounds_();

      this.invalidate(anychart.ConsistencyState.POSITION, anychart.Signal.NEEDS_REDRAW);
      this.dispatchScrollEvent_(opt_eventSource || 'api');
    }
  }
  return this;
};


/**
 * Tries to set new value of end ratio.
 * This method keeps a difference between end ratio and start ratio constant, that's why this method can't be used as
 * direct value setter.
 * @param {number} value - New value, where method tries to scroll end ratio to. //TODO Bad english :'( .
 * @param {string=} opt_eventSource - Scroll event source. Additional information to be attached to event object. Used
 *  for advanced events manipulations.
 * @return {anychart.ui.ScrollBar} - Itself for chaining.
 */
anychart.ui.ScrollBar.prototype.scrollEndTo = function(value, opt_eventSource) {
  value = +value;
  if (!isNaN(value)) {
    value = goog.math.clamp(value, 0, 1);
    var ratioDiff = this.endRatio_ - this.startRatio_; //If here are no bugs, ratioDiff != 0;

    //Bad JS math.
    var newStartRatio = anychart.math.round(goog.math.clamp(value - ratioDiff, 0, 1), 4);
    var newEndRatio = anychart.math.round(newStartRatio + ratioDiff, 4);

    if (!(this.startRatio_ == newStartRatio && this.endRatio_ == newEndRatio)) {
      this.startRatio_ = newStartRatio;
      this.endRatio_ = newEndRatio;
      this.synchronizeBoundsToRatio_();
      this.invalidate(anychart.ConsistencyState.POSITION, anychart.Signal.NEEDS_REDRAW);
      this.dispatchScrollEvent_(opt_eventSource || 'api');
    }
  }
  return this;
};


/**
 * Tries to set new value of end pixel of visible bounds.
 * This method keeps a difference between end value of visible bounds and its start value constant, that's why this
 * method can't be used as direct value setter.
 * NOTE: In this case end value for horizontal layout is 'left + width' of visible bounds and 'top + height' for vertical layout.
 *
 * @param {number} value - New value, where method tries to scroll end value of visible bounds to. //TODO Bad english :'( .
 * @param {string=} opt_eventSource - Scroll event source. Additional information to be attached to event object. Used
 *  for advanced events manipulations.
 * @return {anychart.ui.ScrollBar} - Itself for chaining.
 */
anychart.ui.ScrollBar.prototype.scrollPixelEndTo = function(value, opt_eventSource) {
  value = +value;
  if (this.visibleBounds_ && !isNaN(value)) {
    var isVertical = this.isVertical_();

    var diff = value - (isVertical ?
        (this.visibleBounds_.top + this.visibleBounds_.height) :
        (this.visibleBounds_.left + this.visibleBounds_.width)
        );

    if (diff) {
      isVertical ?
          (this.visibleBounds_.top += diff) :
          (this.visibleBounds_.left += diff);

      this.synchronizeBounds_();
      this.synchronizeRatioToBounds_();
      this.invalidate(anychart.ConsistencyState.POSITION, anychart.Signal.NEEDS_REDRAW);
      this.dispatchScrollEvent_(opt_eventSource || 'api');
    }
  }
  return this;
};


/**
 * Performs the pixel step scroll.
 * NOTE: Negative step-parameter value is backward, positive one is forward.
 * NOTE 2: If the visible bounds are not set, nothing will be done.
 * @param {number=} opt_step - Ratio scroll step value.
 * @param {string=} opt_eventSource - Event source. Additional information to be attached to event object. Used
 *  for advanced events manipulations.
 * @return {anychart.ui.ScrollBar} - Itself for chaining.
 */
anychart.ui.ScrollBar.prototype.scrollPixel = function(opt_step, opt_eventSource) {
  opt_step = +opt_step;
  var step = isNaN(opt_step) ? anychart.ui.ScrollBar.SCROLL_PIXEL_STEP : opt_step;
  if (this.visibleBounds_ && step) { //step != 0.
    return this.scrollPixelStartTo(step + (this.isVertical_() ? this.visibleBounds_.top : this.visibleBounds_.left),
        opt_eventSource);
  }
  return this;
};


/**
 * Performs the ratio step scroll.
 * NOTE: Negative step-parameter value is backward, positive one is forward.
 * @param {number=} opt_step - Ratio scroll step value.
 * @param {string=} opt_eventSource - Event source. Additional information to be attached to event object. Used
 *  for advanced events manipulations.
 * @return {anychart.ui.ScrollBar} - Itself for chaining.
 */
anychart.ui.ScrollBar.prototype.scroll = function(opt_step, opt_eventSource) {
  opt_step = +opt_step;
  var step = isNaN(opt_step) ? anychart.ui.ScrollBar.SCROLL_RATIO_STEP : goog.math.clamp(opt_step, -1, 1);
  if (step) { //step != 0.
    return this.scrollStartTo(this.startRatio_ + step, opt_eventSource);
  }
  return this;
};


/**
 * Adds/removes scroll buttons from scroll bar.
 * @param {boolean=} opt_value - Whether show or hide the scroll buttons.
 * @return {boolean|anychart.ui.ScrollBar} - Current value or itself for chaining.
 */
anychart.ui.ScrollBar.prototype.buttonsVisible = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (goog.isBoolean(opt_value) && this.buttonsVisible_ != opt_value) {
      this.buttonsVisible_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.buttonsVisible_;
};


/**
 * Inner getter for this.base_.
 * @return {acgraph.vector.Layer} - Base layer. Actually is container for all of DOM structure of slider.
 * @private
 */
anychart.ui.ScrollBar.prototype.getBase_ = function() {
  if (!this.base_) {
    this.base_ = /** @type {acgraph.vector.Layer} */ (acgraph.layer());
    this.registerDisposable(this.base_);
  }
  return this.base_;
};


/**
 * Inner getter for this.bg_.
 * @return {acgraph.vector.Rect} - Background. Actually is a rectangle.
 * @private
 */
anychart.ui.ScrollBar.prototype.getBg_ = function() {
  if (!this.bg_) {
    this.bg_ = /** @type {acgraph.vector.Rect} */ (acgraph.rect());
    acgraph.events.listen(this.bg_, acgraph.events.EventType.CLICK, this.bgClickHandler_, false, this);

    this.registerDisposable(this.bg_);
  }
  return this.bg_;
};


/**
 * Inner getter for forwardButton.
 * @return {anychart.ui.Button} - Forward button.
 * @private
 */
anychart.ui.ScrollBar.prototype.getForwardButton_ = function() {
  if (!this.forwardButton_) {
    this.forwardButton_ = new anychart.ui.Button();
    this.forwardButton_.supportedStates(anychart.ui.Button.State.CHECKED, false);
    var ths = this;

    this.forwardButton_.listenSignals(function() {
      ths.forwardButton_.draw();
    });

    this.forwardButton_.setOnClickListener(function() {
      if (ths.visibleBounds()) {
        ths.scrollPixel(anychart.ui.ScrollBar.SCROLL_PIXEL_STEP, 'user_action');
      } else {
        ths.scroll(anychart.ui.ScrollBar.SCROLL_RATIO_STEP, 'user_action');
      }
    });

    this.registerDisposable(this.forwardButton_);
  }
  return this.forwardButton_;
};


/**
 * Inner getter for backwardButton.
 * @return {anychart.ui.Button} - Backward button.
 * @private
 */
anychart.ui.ScrollBar.prototype.getBackwardButton_ = function() {
  if (!this.backwardButton_) {
    this.backwardButton_ = new anychart.ui.Button();
    this.backwardButton_.supportedStates(anychart.ui.Button.State.CHECKED, false);
    var ths = this;

    this.backwardButton_.listenSignals(function() {
      ths.backwardButton_.draw();
    });

    this.backwardButton_.setOnClickListener(function() {
      if (ths.visibleBounds()) {
        ths.scrollPixel(-anychart.ui.ScrollBar.SCROLL_PIXEL_STEP, 'user_action');
      } else {
        ths.scroll(-anychart.ui.ScrollBar.SCROLL_RATIO_STEP, 'user_action');
      }
    });

    this.registerDisposable(this.backwardButton_);
  }
  return this.backwardButton_;
};


/**
 * Inner getter for this.slider_.
 * @return {acgraph.vector.Rect} - Slider. Actually is a rectangle.
 * @private
 */
anychart.ui.ScrollBar.prototype.getSlider_ = function() {
  if (!this.slider_) {
    this.slider_ = /** @type {acgraph.vector.Rect} */ (acgraph.rect());

    acgraph.events.listen(this.slider_, acgraph.events.EventType.DRAG, this.dragHandler_, false, this);
    acgraph.events.listen(this.slider_, acgraph.events.EventType.DRAG_END, this.dragEndHandler_, false, this);

    this.registerDisposable(this.slider_);
  }
  return this.slider_;
};


/**
 * Drag handler.
 * @param {Event} e - Event.
 * @private
 */
anychart.ui.ScrollBar.prototype.dragHandler_ = function(e) {
  this.drawWrapper_(true);
};


/**
 * Drag end handler.
 * @param {Event} e - Event.
 * @private
 */
anychart.ui.ScrollBar.prototype.dragEndHandler_ = function(e) {
  this.drawWrapper_(false);
};


/**
 * Background click handler.
 * @param {Event} e - Event.
 * @private
 */
anychart.ui.ScrollBar.prototype.bgClickHandler_ = function(e) {
  var isVertical = this.isVertical_();
  var sliderBounds = this.slider_.getBounds();
  var dragBounds = this.slider_.drag();

  var mouseCoord = isVertical ? e['offsetY'] : e['offsetX'];
  var backward = isVertical ? (mouseCoord <= sliderBounds.top) : (mouseCoord <= sliderBounds.left);
  var newRatio = isVertical ?
      anychart.math.round((mouseCoord - dragBounds.top) / dragBounds.height, 4) :
      anychart.math.round((mouseCoord - dragBounds.left) / dragBounds.width, 4);

  backward ?
      this.scrollStartTo(newRatio, 'user_action') :
      this.scrollEndTo(newRatio, 'user_action');
};


/**
 * Calculates and performs a dragging process.
 * Usage: we don't calculate and don't re-render scroll slider while dragging (opt_dragging is 'true').
 * @param {boolean=} opt_dragging - State of scroll bar.
 * @private
 */
anychart.ui.ScrollBar.prototype.drawWrapper_ = function(opt_dragging) {
  var isVertical = this.isVertical_();
  var dragArea = this.slider_.drag();
  var sliderBounds = this.slider_.getBounds();
  var dragging = !!opt_dragging;


  var areaMin = isVertical ? dragArea.top : dragArea.left;
  var areaLength = isVertical ? dragArea.height : dragArea.width;

  var minPos = isVertical ? sliderBounds.top : sliderBounds.left;
  var maxPos = minPos + (isVertical ? sliderBounds.height : sliderBounds.width);

  this.startRatio_ = anychart.math.round((minPos - areaMin) / areaLength, 5);
  this.endRatio_ = anychart.math.round((maxPos - areaMin) / areaLength, 5);

  this.synchronizeBoundsToRatio_();

  if (!dragging) this.invalidate(anychart.ConsistencyState.POSITION, anychart.Signal.NEEDS_REDRAW);

  this.dispatchScrollEvent_();

};


/**
 * If the button's size must be reduces.
 * How it works:
 * 1) We suppose that scroll bar visually has a three parts:
 *    - Forward button
 *    - Some area for slider (where the slider moves)
 *    - Backward button
 *
 * 2) Without any overlaps and if the scroll bar is long enough, forward and backward buttons have a square shape and fill
 * all available width.
 *
 * 3) In this case we take as fact that minimally shortened scroll bar is divided on three equal parts: square forward button,
 * square slider move area, square backward button. In this case the minimal ratio of (height / width) is 3.
 *
 * 4) What if the scroll bar is shortened much more? For example, if we've got a square scroll bar itself? In this case,
 * the buttons become rectangles and take 1/3 part of available length.
 *
 * @param {acgraph.math.Rect} pixelBounds - Scroll bar's pixel bounds.
 * @param {boolean} isVertical - If current layout is vertical.
 * @private
 * @return {boolean} - If the buttons' sizes must be reduced.
 */
anychart.ui.ScrollBar.prototype.reduceButtons_ = function(pixelBounds, isVertical) {
  var longSide = isVertical ? pixelBounds.height : pixelBounds.width;
  var shortSide = isVertical ? pixelBounds.width : pixelBounds.height;
  return (longSide / shortSide) < 3;
};


/**
 * Synchronizes this.visibleBounds_ to this.startRatio_ and this.endRatio_ depending on this.contentBounds_ set.
 * Must be used if new startRatio_ or new endRatio_ is set.
 * NOTE: Modifies this.visibleBounds_ and nothing else.
 * @private
 */
anychart.ui.ScrollBar.prototype.synchronizeBoundsToRatio_ = function() {
  if (this.contentBounds_ && this.visibleBounds_) {
    var size;
    if (this.isVertical_()) {
      size = this.contentBounds_.height;
      var newTop = anychart.math.round(this.startRatio_ * size, 1) + this.contentBounds_.top;
      var newHeight = anychart.math.round((this.endRatio_ - this.startRatio_) * size, 1);
      this.visibleBounds_.top = newTop;
      this.visibleBounds_.height = newHeight;
    } else {
      size = this.contentBounds_.width;
      var newLeft = anychart.math.round(this.startRatio_ * size, 1) + this.contentBounds_.left;
      var newWidth = anychart.math.round((this.endRatio_ - this.startRatio_) * size, 1);
      this.visibleBounds_.left = newLeft;
      this.visibleBounds_.width = newWidth;
    }
  }
};


/**
 * Synchronizes this.startRatio_ and this.endRatio_ to this.visibleBounds_ depending on this.contentBounds_ set.
 * Must be used if new visibleBounds_ or contentBounds_ is set.
 * NOTE: Modifies this.startRatio_ and this.endRatio_ both and nothing else.
 * @private
 */
anychart.ui.ScrollBar.prototype.synchronizeRatioToBounds_ = function() {
  if (this.contentBounds_ && this.visibleBounds_) {
    var isVertical = this.isVertical_();
    var min = isVertical ?
        (this.visibleBounds_.top - this.contentBounds_.top) :
        (this.visibleBounds_.left - this.contentBounds_.left);

    var max = isVertical ?
        (min + this.visibleBounds_.height) :
        (min + this.visibleBounds_.width);

    var size = isVertical ? this.contentBounds_.height : this.contentBounds_.width;

    //Make sure that you handle consistence states from the outside!
    this.startRatio_ = anychart.math.round(min / size, 4);
    this.endRatio_ = anychart.math.round(max / size, 4);
  }
};


/**
 * Synchronizes a bounds. Here we suppose that visibleBounds_ are always within contentBounds_:
 *
 * 1)
 *          +--------+           +--------+
 *          |        |           |        |
 *      +---+--------+---+       +--------+
 *      |   |        |   |   =>  |        |
 *      +---+--------+---+       +--------+
 *          |        |           |        |
 *          +--------+           +--------+
 *
 * 2)
 *      +----------------+         +----------------+
 *      |                |         |                |
 *      |             +--+--+      |          +-----+
 *      |             |  |  |  =>  |          |     |
 *      |             +--+--+      |          +-----+
 *      |                |         |                |
 *      +----------------+         +----------------+
 *
 * @private
 */
anychart.ui.ScrollBar.prototype.synchronizeBounds_ = function() {
  var v = this.visibleBounds_;
  var c = this.contentBounds_;

  if (v.width > c.width) v.width = c.width;
  if (v.height > c.height) v.height = c.height;

  if ((v.top + v.height) > (c.top + c.height)) {
    v.top -= (v.top + v.height) - (c.top + c.height);
  }

  if ((v.left + v.width) > (c.left + c.width)) {
    v.left -= (v.left + v.width) - (c.left + c.width);
  }

  if (v.top < c.top) v.top = c.top;
  if (v.left < c.left) v.left = c.left;

};


/**
 * Places the buttons.
 * @private
 */
anychart.ui.ScrollBar.prototype.placeButtons_ = function() {
  if (this.buttonsVisible_) {
    if (!this.getForwardButton_().container()) this.forwardButton_.container(this.base_);
    if (!this.getBackwardButton_().container()) this.backwardButton_.container(this.base_);
  } else {
    if (this.forwardButton_ && this.forwardButton_.container()) this.forwardButton_.container(null);
    if (this.backwardButton_ && this.backwardButton_.container()) this.backwardButton_.container(null);
  }

  if (this.buttonsVisible_ && this.forwardButton_ && this.backwardButton_) {
    this.forwardButton_.suspendSignalsDispatching();
    this.backwardButton_.suspendSignalsDispatching();

    var isVertical = this.isVertical_();
    var b = this.pixelBoundsCache_;

    var buttonWidth, buttonHeight;
    var forwardButtonLeft, backwardButtonLeft, forwardButtonTop, backwardButtonTop;

    var reduce = this.reduceButtons_(b, isVertical);

    buttonWidth = buttonHeight = isVertical ? b.width : b.height;

    backwardButtonLeft = b.left;
    backwardButtonTop = b.top;

    if (reduce) {
      if (isVertical) {
        buttonHeight = anychart.math.round(b.height / 3, 1);
      } else {
        buttonWidth = anychart.math.round(b.width / 3, 1);
      }
    }

    forwardButtonLeft = isVertical ? b.left : b.left + b.width - buttonWidth;
    forwardButtonTop = isVertical ? b.top + b.height - buttonHeight : b.top;

    this.forwardButton_
        .parentBounds(b) //TODO (A.Kudryavtsev): parent bounds from VisualBaseWithBounds are not implemented yet.
        .position({'x': forwardButtonLeft, 'y': forwardButtonTop})
        .width(buttonWidth)
        .height(buttonHeight)
        .draw();

    this.backwardButton_
        .parentBounds(b) //TODO TODO (A.Kudryavtsev): parent bounds from VisualBaseWithBounds are not implemented yet.
        .position({'x': backwardButtonLeft, 'y': backwardButtonTop})
        .width(buttonWidth)
        .height(buttonHeight)
        .draw();

    this.forwardButton_.resumeSignalsDispatching(false);
    this.backwardButton_.resumeSignalsDispatching(false);

  }

};


/**
 * Draws scroll bar with current settings.
 * @private
 */
anychart.ui.ScrollBar.prototype.drawInternal_ = function() {
  var isVertical = this.isVertical_();
  var b = this.pixelBoundsCache_;

  this.bg_.setBounds(b);
  var sliderLeft, sliderTop, sliderWidth, sliderHeight;
  var drag, dragLeft, dragTop, dragWidth, dragHeight;

  if (this.buttonsVisible_) {
    var buttonWidth = this.forwardButton_.width();
    var buttonHeight = this.forwardButton_.height();

    dragLeft = isVertical ?
        b.left :
        b.left + buttonWidth + 1;

    dragTop = isVertical ?
        b.top + buttonHeight + 1 :
        b.top;

    dragWidth = isVertical ?
        b.width :
        b.width - 2 * (buttonWidth + 1);

    dragHeight = isVertical ?
        b.height - 2 * (buttonHeight + 1) :
        b.height;

    drag = new acgraph.math.Rect(/** @type {number} */ (dragLeft), /** @type {number} */ (dragTop), dragWidth, dragHeight);

  } else {
    drag = b.clone();
  }

  sliderLeft = isVertical ?
      b.left :
      anychart.math.round(drag.left + this.startRatio_ * drag.width, 1);

  sliderTop = isVertical ?
      anychart.math.round(drag.top + this.startRatio_ * drag.height, 1) :
      b.top;

  sliderWidth = isVertical ?
      b.width :
      anychart.math.round(drag.width * (this.endRatio_ - this.startRatio_), 1);

  sliderHeight = isVertical ?
      anychart.math.round(drag.height * (this.endRatio_ - this.startRatio_), 1) :
      b.height;

  this.slider_
      .setX(sliderLeft)
      .setY(sliderTop)
      .setWidth(sliderWidth)
      .setHeight(sliderHeight)
      .drag(drag);

  this.slider_.setTransformationMatrix(1, 0, 0, 1, 0, 0);
};


/**
 * Draws scroll bar.
 * @return {anychart.ui.ScrollBar} - Itself for chaining.
 */
anychart.ui.ScrollBar.prototype.draw = function() {
  if (this.checkDrawingNeeded()) {
    var container = /** @type {acgraph.vector.ILayer} */(this.container());
    var stage = container ? container.getStage() : null;
    var manualSuspend = stage && !stage.isSuspended();
    if (manualSuspend) stage.suspend();

    if (!this.getBase_().numChildren()) {
      this.base_.addChild(/** @type {!acgraph.vector.Element} */ (this.getBg_()));
      this.base_.addChild(/** @type {!acgraph.vector.Element} */ (this.getSlider_()));
    }

    if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
      this.getBase_().parent(container);
      this.markConsistent(anychart.ConsistencyState.CONTAINER);
    }

    if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
      this.pixelBoundsCache_ = /** @type {goog.math.Rect} */ (this.getPixelBounds());
      this.placeButtons_();
      this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.POSITION);
      this.markConsistent(anychart.ConsistencyState.BOUNDS);
    }

    if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
      this.bg_
          .fill(this.bgFill_)
          .stroke(this.bgStroke_);

      this.slider_
          .fill(this.sliderFill_)
          .stroke(this.sliderStroke_);

      this.markConsistent(anychart.ConsistencyState.APPEARANCE);
    }

    if (this.hasInvalidationState(anychart.ConsistencyState.POSITION)) {
      this.drawInternal_();
      this.markConsistent(anychart.ConsistencyState.POSITION);
    }

    if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
      this.getBase_().zIndex(/** @type {number} */ (this.zIndex()));
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
anychart.ui.ScrollBar.prototype.isVertical_ = function() {
  //Is "horizontal" if layout is directly set as "horizontal". Is "vertical" in all of other cases.
  return !(this.layout_.toLowerCase() == anychart.enums.Layout.HORIZONTAL);
};


/** @inheritDoc */
anychart.ui.ScrollBar.prototype.remove = function() {
  //this.base_ is actually a layer. All the other elements are children of this.base_.
  if (this.base_) this.base_.parent(null);
};


/** @inheritDoc */
anychart.ui.ScrollBar.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');

  json['layout'] = this.layout_;

  json['bgFill'] = anychart.color.serialize(this.bgFill_);
  json['bgStroke'] = anychart.color.serialize(this.bgStroke_);
  json['sliderFill'] = anychart.color.serialize(this.sliderFill_);
  json['sliderStroke'] = anychart.color.serialize(this.sliderStroke_);

  json['contentBounds'] = this.contentBounds_ ? this.contentBounds_.serialize() : null;
  json['visibleBounds'] = this.visibleBounds_ ? this.visibleBounds_.serialize() : null;
  json['startRatio'] = this.startRatio_;
  json['endRatio'] = this.endRatio_;
  json['buttonsVisible'] = this.buttonsVisible_;

  return json;
};


/** @inheritDoc */
anychart.ui.ScrollBar.prototype.deserialize = function(config) {
  this.suspendSignalsDispatching();
  goog.base(this, 'deserialize', config);

  this.layout(config['layout']);
  this.backgroundFill(config['bgFill']);
  this.backgroundStroke(config['bgStroke']);
  this.sliderFill(config['sliderFill']);
  this.sliderStroke(config['sliderStroke']);
  this.contentBounds(config['contentBounds']);
  this.visibleBounds(config['visibleBounds']);
  this.setRatio(config['startRatio'], config['endRatio']); //True way for setting the both values. Even though the values must be correct after serialization.
  this.buttonsVisible(config['buttonsVisible']);

  this.resumeSignalsDispatching(true);
  return this;
};


/**
 * Dispatches scroll event.
 * Uses detached dispatching for scrolling purposes. TODO (A.Kudryavtsev): Explain why?
 * @param {string=} opt_source - Event source.
 * @private
 */
anychart.ui.ScrollBar.prototype.dispatchScrollEvent_ = function(opt_source) {
  var ths = this;
  if (this.tid_ >= 0) {
    clearTimeout(this.tid_);
    this.tid_ = -1;
  }
  this.tid_ = setTimeout(function() {
    var event = new anychart.ui.ScrollBar.ScrollEvent(ths);
    event['startRatio'] = ths.startRatio_;
    event['endRatio'] = ths.endRatio_;
    event['visibleBounds'] = ths.visibleBounds_;
    event['source'] = opt_source || 'user_action';
    ths.dispatchEvent(event);
    ths.tid_ = -1;
  }, 0);
};



/**
 * Custom scroll event.
 * @param {Object=} opt_target - Reference to the target.
 * @constructor
 * @extends {goog.events.Event}
 */
anychart.ui.ScrollBar.ScrollEvent = function(opt_target) {
  goog.base(this, anychart.enums.EventType.SCROLL_CHANGE, opt_target);
};
goog.inherits(anychart.ui.ScrollBar.ScrollEvent, goog.events.Event);


/**
 * Start ratio.
 * @type {number}
 */
anychart.ui.ScrollBar.ScrollEvent.prototype['startRatio'] = 0;


/**
 * End ratio.
 * @type {number}
 */
anychart.ui.ScrollBar.ScrollEvent.prototype['endRatio'] = 0;


/**
 * Visible bounds.
 * @type {?acgraph.math.Rect}
 */
anychart.ui.ScrollBar.ScrollEvent.prototype['visibleBounds'] = null;


/**
 * Visible bounds.
 * @type {string}
 */
anychart.ui.ScrollBar.ScrollEvent.prototype['source'] = '';


/**
 * Constructor function.
 * @return {!anychart.ui.ScrollBar}
 */
anychart.ui.scrollBar = function() {
  return new anychart.ui.ScrollBar();
};


//exports
goog.exportSymbol('anychart.ui.scrollBar', anychart.ui.scrollBar);
goog.exportSymbol('anychart.ui.ScrollBar.SCROLL_PIXEL_STEP', anychart.ui.ScrollBar.SCROLL_PIXEL_STEP);
goog.exportSymbol('anychart.ui.ScrollBar.SCROLL_RATIO_STEP', anychart.ui.ScrollBar.SCROLL_RATIO_STEP);
anychart.ui.ScrollBar.prototype['layout'] = anychart.ui.ScrollBar.prototype.layout;
anychart.ui.ScrollBar.prototype['backgroundStroke'] = anychart.ui.ScrollBar.prototype.backgroundStroke;
anychart.ui.ScrollBar.prototype['backgroundFill'] = anychart.ui.ScrollBar.prototype.backgroundFill;
anychart.ui.ScrollBar.prototype['sliderStroke'] = anychart.ui.ScrollBar.prototype.sliderStroke;
anychart.ui.ScrollBar.prototype['sliderFill'] = anychart.ui.ScrollBar.prototype.sliderFill;
anychart.ui.ScrollBar.prototype['contentBounds'] = anychart.ui.ScrollBar.prototype.contentBounds;
anychart.ui.ScrollBar.prototype['visibleBounds'] = anychart.ui.ScrollBar.prototype.visibleBounds;
anychart.ui.ScrollBar.prototype['startRatio'] = anychart.ui.ScrollBar.prototype.startRatio;
anychart.ui.ScrollBar.prototype['endRatio'] = anychart.ui.ScrollBar.prototype.endRatio;
anychart.ui.ScrollBar.prototype['setRatio'] = anychart.ui.ScrollBar.prototype.setRatio;
anychart.ui.ScrollBar.prototype['scrollPixelStartTo'] = anychart.ui.ScrollBar.prototype.scrollPixelStartTo;
anychart.ui.ScrollBar.prototype['scrollStartTo'] = anychart.ui.ScrollBar.prototype.scrollStartTo;
anychart.ui.ScrollBar.prototype['scrollPixelEndTo'] = anychart.ui.ScrollBar.prototype.scrollPixelEndTo;
anychart.ui.ScrollBar.prototype['scrollEndTo'] = anychart.ui.ScrollBar.prototype.scrollEndTo;
anychart.ui.ScrollBar.prototype['scrollPixel'] = anychart.ui.ScrollBar.prototype.scrollPixel;
anychart.ui.ScrollBar.prototype['scroll'] = anychart.ui.ScrollBar.prototype.scroll;
anychart.ui.ScrollBar.prototype['buttonsVisible'] = anychart.ui.ScrollBar.prototype.buttonsVisible;
anychart.ui.ScrollBar.prototype['draw'] = anychart.ui.ScrollBar.prototype.draw;

