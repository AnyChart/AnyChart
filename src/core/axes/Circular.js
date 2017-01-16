goog.provide('anychart.core.axes.Circular');
goog.require('acgraph');
goog.require('anychart.color');
goog.require('anychart.core.VisualBase');
goog.require('anychart.core.axes.CircularTicks');
goog.require('anychart.core.ui.CircularLabelsFactory');
goog.require('anychart.core.utils.AxisLabelsContextProvider');
goog.require('anychart.enums');
goog.require('anychart.math.Rect');
goog.require('anychart.scales.Base');
goog.require('anychart.utils');



/**
 * Circular axis class.<br/>
 * @extends {anychart.core.VisualBase}
 * @constructor
 */
anychart.core.axes.Circular = function() {
  anychart.core.axes.Circular.base(this, 'constructor');

  /**
   * @type {Array.<Array.<number>>}
   * @private
   */
  this.labelsBounds_ = [];

  /**
   * @type {Array.<Array.<number>>}
   * @private
   */
  this.minorLabelsBounds_ = [];

  /**
   * @type {Array.<anychart.math.Rect>}
   * @private
   */
  this.labelsBoundsWithoutTransform_ = [];

  /**
   * @type {Array.<anychart.math.Rect>}
   * @private
   */
  this.minorLabelsBoundsWithoutTransform_ = [];

  /**
   * Constant to save space.
   * @type {number}
   * @private
   */
  this.ALL_VISUAL_STATES_ =
      anychart.ConsistencyState.AXIS_LABELS |
      anychart.ConsistencyState.AXIS_TICKS |
      anychart.ConsistencyState.BOUNDS;
};
goog.inherits(anychart.core.axes.Circular, anychart.core.VisualBase);


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.axes.Circular.prototype.SUPPORTED_SIGNALS =
    anychart.core.VisualBase.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.NEEDS_REAPPLICATION;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.axes.Circular.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.AXIS_LABELS |
    anychart.ConsistencyState.AXIS_TICKS |
    anychart.ConsistencyState.AXIS_OVERLAP;


/**
 * Axis line z-index in axis root layer.
 * @type {number}
 */
anychart.core.axes.Circular.ZINDEX_AXIS_LINE = 1;


/**
 * Tick element z-index in axis root layer.
 * @type {number}
 */
anychart.core.axes.Circular.ZINDEX_TICK = 2;


/**
 * Tick's Hatch fill z-index in axis root layer.
 * @type {number}
 */
anychart.core.axes.Circular.ZINDEX_TICK_HATCH_FILL = 3;


/**
 * Label z-index in axis root layer.
 * @type {number}
 */
anychart.core.axes.Circular.ZINDEX_LABEL = 4;


/**
 * @type {acgraph.vector.Path}
 * @private
 */
anychart.core.axes.Circular.prototype.line_ = null;


/**
 * @type {anychart.core.ui.CircularLabelsFactory}
 * @private
 */
anychart.core.axes.Circular.prototype.labels_ = null;


/**
 * @type {anychart.core.ui.CircularLabelsFactory}
 * @private
 */
anychart.core.axes.Circular.prototype.minorLabels_ = null;


/**
 * @type {anychart.core.axes.CircularTicks}
 * @private
 */
anychart.core.axes.Circular.prototype.ticks_ = null;


/**
 * @type {anychart.core.axes.CircularTicks}
 * @private
 */
anychart.core.axes.Circular.prototype.minorTicks_ = null;


/**
 * @type {string|acgraph.vector.Fill}
 * @private
 */
anychart.core.axes.Circular.prototype.fill_;


/**
 * @type {anychart.scales.Base}
 * @private
 */
anychart.core.axes.Circular.prototype.scale_;


/**
 * @type {anychart.enums.LabelsOverlapMode}
 * @private
 */
anychart.core.axes.Circular.prototype.overlapMode_;


/**
 * Scale.
 * @param {(anychart.enums.GaugeScaleTypes|anychart.scales.Linear|anychart.scales.Logarithmic)=} opt_value Scale to set.
 * @return {anychart.scales.Linear|anychart.scales.Logarithmic|anychart.core.axes.Circular} Axis scale value or itself for method chaining.
 */
anychart.core.axes.Circular.prototype.scale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (goog.isString(opt_value)) {
      opt_value = this.getGaugeScale_(opt_value);
    }
    if (this.scale_ != opt_value) {
      if (this.scale_)
        this.scale_.unlistenSignals(this.scaleInvalidated_, this);

      this.scale_ = opt_value;
      this.scale_.listenSignals(this.scaleInvalidated_, this);
      this.invalidate(this.ALL_VISUAL_STATES_, anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  } else {
    if (!this.scale_) {
      this.scale_ = anychart.scales.linear();
      this.scale_.listenSignals(this.scaleInvalidated_, this);
    }
    return /** @type {anychart.scales.Linear|anychart.scales.Logarithmic}*/(this.scale_);
  }
};


/**
 * @param {string} value String scale name.
 * @return {anychart.scales.Linear|anychart.scales.Logarithmic} Scale for gauge axis.
 * @private
 */
anychart.core.axes.Circular.prototype.getGaugeScale_ = function(value) {
  switch (anychart.enums.normalizeGaugeScaleTypes(value)) {
    case anychart.enums.GaugeScaleTypes.LINEAR:
      return anychart.scales.linear();
      break;
    case anychart.enums.GaugeScaleTypes.LOG:
      return anychart.scales.log();
      break;
  }

  return anychart.scales.linear();
};


/**
 * Internal ticks invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.axes.Circular.prototype.scaleInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(this.ALL_VISUAL_STATES_, anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEEDS_REAPPLICATION);
  }
};


//----------------------------------------------------------------------------------------------------------------------
//                                                Axis exports methods
//----------------------------------------------------------------------------------------------------------------------
/**
 * @param {(Object|boolean|null)=} opt_value Axis labels.
 * @return {!(anychart.core.ui.CircularLabelsFactory|anychart.core.axes.Circular)} Axis labels of itself for method chaining.
 */
anychart.core.axes.Circular.prototype.minorLabels = function(opt_value) {
  if (!this.minorLabels_) {
    this.minorLabels_ = new anychart.core.ui.CircularLabelsFactory();
    this.minorLabels_.setParentEventTarget(this);
    this.minorLabels_.listenSignals(this.labelsInvalidated_, this);
    this.registerDisposable(this.minorLabels_);
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.minorLabels_.setup(opt_value);
    return this;
  }
  return this.minorLabels_;
};


/**
 * @param {(Object|boolean|null)=} opt_value Axis labels.
 * @return {!(anychart.core.ui.CircularLabelsFactory|anychart.core.axes.Circular)} Axis labels of itself for method chaining.
 */
anychart.core.axes.Circular.prototype.labels = function(opt_value) {
  if (!this.labels_) {
    this.labels_ = new anychart.core.ui.CircularLabelsFactory();
    this.labels_.setParentEventTarget(this);
    this.labels_.listenSignals(this.labelsInvalidated_, this);
    this.registerDisposable(this.labels_);
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.labels_.setup(opt_value);
    return this;
  }
  return this.labels_;
};


/**
 * Internal label invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.axes.Circular.prototype.labelsInvalidated_ = function(event) {
  this.dropBoundsCache_();
  this.invalidate(anychart.ConsistencyState.AXIS_LABELS | anychart.ConsistencyState.AXIS_TICKS, anychart.Signal.NEEDS_REDRAW);
};


/**
 * @param {boolean=} opt_value Drawing flag.
 * @return {boolean|!anychart.core.axes.Circular} Drawing flag or itself for method chaining.
 */
anychart.core.axes.Circular.prototype.drawFirstLabel = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.drawFirstLabel_ != opt_value) {
      this.drawFirstLabel_ = opt_value;
      this.invalidate(this.ALL_VISUAL_STATES_, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.drawFirstLabel_;
};


/**
 * @param {boolean=} opt_value Drawing flag.
 * @return {boolean|!anychart.core.axes.Circular} Drawing flag or itself for method chaining.
 */
anychart.core.axes.Circular.prototype.drawLastLabel = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.drawLastLabel_ != opt_value) {
      this.drawLastLabel_ = opt_value;
      this.invalidate(this.ALL_VISUAL_STATES_, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.drawLastLabel_;
};


/**
 * @param {(Object|boolean|null)=} opt_value Axis ticks.
 * @return {!(anychart.core.axes.CircularTicks|anychart.core.axes.Circular)} Axis ticks or itself for method chaining.
 */
anychart.core.axes.Circular.prototype.minorTicks = function(opt_value) {
  if (!this.minorTicks_) {
    this.minorTicks_ = new anychart.core.axes.CircularTicks();
    this.minorTicks_.setParentEventTarget(this);
    this.minorTicks_.setAxis(this);
    this.minorTicks_.listenSignals(this.ticksInvalidated_, this);
    this.registerDisposable(this.minorTicks_);
  }

  if (goog.isDef(opt_value)) {
    this.minorTicks_.setup(opt_value);
    return this;
  }
  return this.minorTicks_;
};


/**
 * @param {(Object|boolean|null)=} opt_value Axis ticks.
 * @return {!(anychart.core.axes.CircularTicks|anychart.core.axes.Circular)} Axis ticks or itself for method chaining.
 */
anychart.core.axes.Circular.prototype.ticks = function(opt_value) {
  if (!this.ticks_) {
    this.ticks_ = new anychart.core.axes.CircularTicks();
    this.ticks_.setParentEventTarget(this);
    this.ticks_.setAxis(this);
    this.ticks_.listenSignals(this.ticksInvalidated_, this);
    this.registerDisposable(this.ticks_);
  }

  if (goog.isDef(opt_value)) {
    this.ticks_.setup(opt_value);
    return this;
  }
  return this.ticks_;
};


/**
 * Internal ticks invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.axes.Circular.prototype.ticksInvalidated_ = function(event) {
  var state = 0;
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state = anychart.ConsistencyState.AXIS_LABELS | anychart.ConsistencyState.AXIS_TICKS;
    this.dropBoundsCache_();
  }
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state |= anychart.ConsistencyState.AXIS_TICKS;
  }
  this.invalidate(state, anychart.Signal.NEEDS_REDRAW);
};


/**
 * @param {(null|string|number)=} opt_value .
 * @return {(number|anychart.core.axes.Circular)} .
 */
anychart.core.axes.Circular.prototype.startAngle = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = goog.isNull(opt_value) ? opt_value : goog.math.standardAngle(anychart.utils.toNumber(opt_value) || 0);
    if (this.startAngle_ != opt_value) {
      this.startAngle_ = opt_value;
      this.invalidate(this.ALL_VISUAL_STATES_, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.startAngle_;
  }
};


/**
 * @param {(null|string|number)=} opt_value .
 * @return {(number|anychart.core.axes.Circular)} .
 */
anychart.core.axes.Circular.prototype.sweepAngle = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = goog.isNull(opt_value) ? opt_value : goog.math.clamp(anychart.utils.toNumber(opt_value) || 0, -360, 360);
    if (this.sweepAngle_ != opt_value) {
      this.sweepAngle_ = opt_value;
      this.invalidate(this.ALL_VISUAL_STATES_, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.sweepAngle_;
  }
};


/**
 * Axis radius.
 * @param {(null|number|string)=} opt_value .
 * @return {string|anychart.core.axes.Circular} .
 */
anychart.core.axes.Circular.prototype.radius = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = goog.isNull(opt_value) ? opt_value : anychart.utils.normalizeToPercent(opt_value);
    if (this.radius_ != opt_value) {
      this.radius_ = opt_value;
      this.invalidate(this.ALL_VISUAL_STATES_, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.radius_;
  }
};


/**
 * Axis ends radius.
 * @param {(null|number|string)=} opt_value .
 * @return {string|anychart.core.axes.Circular} .
 */
anychart.core.axes.Circular.prototype.cornersRounding = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.normalizeToPercent(opt_value);
    if (this.cornersRounding_ != opt_value) {
      this.cornersRounding_ = opt_value;
      this.invalidate(this.ALL_VISUAL_STATES_, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.cornersRounding_;
  }
};


/**
 * Axis width.
 * @param {(null|number|string)=} opt_value .
 * @return {string|anychart.core.axes.Circular} .
 */
anychart.core.axes.Circular.prototype.width = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = goog.isNull(opt_value) ? opt_value : anychart.utils.normalizeToPercent(opt_value);
    if (this.width_ != opt_value) {
      this.width_ = opt_value;
      this.invalidate(this.ALL_VISUAL_STATES_, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.width_;
  }
};


/**
 * Axis fill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.axes.Circular} .
 */
anychart.core.axes.Circular.prototype.fill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var fill = acgraph.vector.normalizeFill.apply(null, arguments);
    if (fill != this.fill_) {
      this.fill_ = fill;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.fill_;
};


/**
 * @param {(anychart.enums.LabelsOverlapMode|string|boolean)=} opt_value Value to set.
 * @return {anychart.enums.LabelsOverlapMode|string|anychart.core.axes.Circular} Drawing flag or itself for method chaining.
 */
anychart.core.axes.Circular.prototype.overlapMode = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var overlap = anychart.enums.normalizeLabelsOverlapMode(opt_value, this.overlapMode_);
    if (this.overlapMode_ != overlap) {
      this.overlapMode_ = overlap;
      this.invalidate(this.ALL_VISUAL_STATES_, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.overlapMode_;
};


//----------------------------------------------------------------------------------------------------------------------
//                                                Axis internal methods
//----------------------------------------------------------------------------------------------------------------------
/**
 * @return {number}
 */
anychart.core.axes.Circular.prototype.getPixWidth = function() {
  return this.axisWidth_;
};


/**
 * @return {number}
 */
anychart.core.axes.Circular.prototype.getPixRadius = function() {
  return this.pixRadius_;
};


/**
 * Internal getter for fixed gauge start angle. All for human comfort.
 * @return {number}
 */
anychart.core.axes.Circular.prototype.getStartAngle = function() {
  return goog.isDefAndNotNull(this.startAngle_) ?
      this.startAngle_ + anychart.charts.CircularGauge.DEFAULT_START_ANGLE :
      this.gauge_.getStartAngle();
};


/**
 * @private
 */
anychart.core.axes.Circular.prototype.dropBoundsCache_ = function() {
  this.labelsBounds_.length = 0;
  this.minorLabelsBounds_.length = 0;
  this.labelsBoundsWithoutTransform_.length = 0;
  this.minorLabelsBoundsWithoutTransform_.length = 0;
  this.overlappedLabels_ = null;
};


/**
 * Returns an object with indexes of labels to draw.
 * @return {boolean|Object.<string, Array.<boolean>>} Object with indexes of labels to draw.
 * or Boolean when there are no labels.
 * @private
 */
anychart.core.axes.Circular.prototype.getOverlappedLabels_ = function() {
  if (!this.overlappedLabels_ || this.hasInvalidationState(anychart.ConsistencyState.AXIS_OVERLAP)) {
    if (this.overlapMode_ == anychart.enums.LabelsOverlapMode.ALLOW_OVERLAP) {
      return false;
    } else {
      var scale = /** @type {anychart.scales.ScatterBase} */(this.scale());
      var labels = [];
      var minorLabels = [];

      var scaleTicksArr = scale.ticks().get();
      var ticksArrLen = scaleTicksArr.length;

      /**
       * Index of first label which is displayed.
       * @type {number}
       */
      var firstDrawableLabel = -1;
      /**
       * Index of previous major label which is displayed.
       * @type {number}
       */
      var prevDrawableLabel = this.drawLastLabel() && !this.drawFirstLabel() ? ticksArrLen - 1 : -1;
      /**
       * Index of the next label, which we should display and it doesn't overlap previous major label and the
       * very last if it is on.
       * @type {number}
       */
      var nextDrawableLabel = -1;
      /**
       * Index of previous minor label which is displayed.
       * @type {number}
       */
      var prevDrawableMinorLabel = -1;


      var tickVal, ratio, bounds1, bounds2, bounds3, bounds4;
      var tempRatio;
      var k = -1;
      var isLabels = this.labels().enabled();

      var scaleMinorTicksArr = scale.minorTicks().get();
      var i = 0;
      var j = 0;
      var minorTicksArrLen = scaleMinorTicksArr.length;
      var minorTickVal, minorRatio;
      var isMinorLabels = this.minorLabels().enabled();

      while (i < ticksArrLen || j < minorTicksArrLen) {
        tickVal = scaleTicksArr[i];
        minorTickVal = scaleMinorTicksArr[j];
        ratio = scale.transform(tickVal);
        minorRatio = scale.transform(minorTickVal);
        bounds1 = bounds2 = bounds3 = bounds4 = null;

        if (nextDrawableLabel == -1 && isLabels) {
          k = i;
          while (nextDrawableLabel == -1 && k < ticksArrLen) {
            //bounds of current label
            if ((!k && this.drawFirstLabel()) || (k == ticksArrLen - 1 && this.drawLastLabel()) || (k != 0 && k != ticksArrLen - 1))
              bounds1 = this.getLabelBounds_(k, true);
            else
              bounds1 = null;

            //bounds of last drawable label
            if (prevDrawableLabel != -1)
              bounds2 = this.getLabelBounds_(prevDrawableLabel, true);
            else
              bounds2 = null;

            //for circular usage we need compare all labels with first drawable label
            if (this.drawLastLabel() && !this.drawFirstLabel()) {
              bounds3 = k == ticksArrLen - 1 ? null : this.getLabelBounds_(ticksArrLen - 1, true);
            } else if (k != firstDrawableLabel)
              bounds3 = this.getLabelBounds_(firstDrawableLabel, true);
            else
              bounds3 = null;

            if (!(anychart.math.checkRectIntersection(bounds1, bounds2) ||
                anychart.math.checkRectIntersection(bounds1, bounds3))) {
              tempRatio = scale.transform(scaleTicksArr[k]);
              if ((tempRatio <= 0 && this.drawFirstLabel()) || (tempRatio >= 1 && this.drawLastLabel()))
                nextDrawableLabel = k;
              else if (tempRatio > 0 && tempRatio < 1)
                nextDrawableLabel = k;
            }
            k++;
          }
        }

        if (((ratio <= minorRatio && i < ticksArrLen) || j == minorTicksArrLen)) {
          if (isLabels && i == nextDrawableLabel && this.labels().enabled()) {
            if (firstDrawableLabel == -1) firstDrawableLabel = i;
            prevDrawableLabel = i;
            nextDrawableLabel = -1;
            labels.push(true);
          } else {
            labels.push(false);
          }
          i++;
          if (ratio == minorRatio && (this.labels().enabled() || this.ticks().enabled())) {
            minorLabels.push(false);
            j++;
          }
        } else {
          if (isMinorLabels) {
            bounds1 = this.getLabelBounds_(j, false);

            if (prevDrawableLabel != -1)
              bounds2 = this.getLabelBounds_(prevDrawableLabel, true);

            if (nextDrawableLabel != -1)
              bounds3 = this.getLabelBounds_(nextDrawableLabel, true);

            if (prevDrawableMinorLabel != -1)
              bounds4 = this.getLabelBounds_(prevDrawableMinorLabel, false);

            var label = this.minorLabels().getLabel(j);
            var isLabelEnabled = label ?
                goog.isDef(label.enabled()) ?
                    label.enabled() :
                    true :
                true;

            if (!(anychart.math.checkRectIntersection(bounds1, bounds2) ||
                anychart.math.checkRectIntersection(bounds1, bounds3) ||
                anychart.math.checkRectIntersection(bounds1, bounds4)) && isLabelEnabled) {

              tempRatio = scale.transform(scaleMinorTicksArr[j]);
              if (tempRatio <= 0 || tempRatio >= 1) {
                if (firstDrawableLabel == -1) firstDrawableLabel = j;
                prevDrawableMinorLabel = j;
                minorLabels.push(true);
              } else if (tempRatio > 0 && tempRatio < 1) {
                if (firstDrawableLabel == -1) firstDrawableLabel = j;
                prevDrawableMinorLabel = j;
                minorLabels.push(true);
              } else {
                minorLabels.push(false);
              }

            } else {
              minorLabels.push(false);
            }
          } else {
            minorLabels.push(false);
          }
          j++;
        }
      }
      if (!isMinorLabels) minorLabels = false;
      if (!isLabels) labels = false;

      this.overlappedLabels_ = {labels: labels, minorLabels: minorLabels};
    }
    this.markConsistent(anychart.ConsistencyState.AXIS_OVERLAP);
  }
  return this.overlappedLabels_;
};


/**
 * @param {number} height .
 * @param {boolean} isMajor .
 * @param {number} radiusOffset .
 * @return {number} .
 * @private
 */
anychart.core.axes.Circular.prototype.getLabelRadius_ = function(height, isMajor, radiusOffset) {
  var ticks = isMajor ? this.ticks() : this.minorTicks();
  var labels = isMajor ? this.labels() : this.minorLabels();

  var position = anychart.enums.normalizeGaugeSidePosition(labels.position());

  var radius = this.pixRadius_;
  if (position == anychart.enums.GaugeSidePosition.OUTSIDE) {
    radius += this.axisWidth_ / 2 + radiusOffset;
    if (ticks.enabled())
      if (ticks.position() == anychart.enums.GaugeSidePosition.OUTSIDE)
        radius += ticks.getPixLength();
      else if (ticks.position() == anychart.enums.GaugeSidePosition.CENTER)
        radius += ticks.getPixLength() > this.axisWidth_ ? (ticks.getPixLength() - this.axisWidth_) / 2 : 0;
  } else if (position == anychart.enums.GaugeSidePosition.INSIDE) {
    radius -= this.axisWidth_ / 2 + radiusOffset;
    if (ticks.enabled())
      if (ticks.position() == anychart.enums.GaugeSidePosition.INSIDE)
        radius -= ticks.getPixLength();
      else if (ticks.position() == anychart.enums.GaugeSidePosition.CENTER)
        radius -= ticks.getPixLength() > this.axisWidth_ ? (ticks.getPixLength() - this.axisWidth_) / 2 : 0;
  }

  return radius;
};


/**
 * Returns angle for labels.
 * @param {number} angle .
 * @return {number} .
 * @private
 */
anychart.core.axes.Circular.prototype.getLabelAngle_ = function(angle) {
  if (angle > 0 && angle < 180)
    return angle + 270;
  else
    return angle + 90;
};


/**
 * @param {number} index Label index.
 * @param {boolean} isMajor IsMajor.
 * @return {anychart.math.Rect} Label bounds.
 * @private
 */
anychart.core.axes.Circular.prototype.getLabelBoundsWithoutTransform_ = function(index, isMajor) {
  var boundsWTCache = isMajor ? this.labelsBoundsWithoutTransform_ : this.minorLabelsBoundsWithoutTransform_;
  if (goog.isDef(boundsWTCache[index]))
    return boundsWTCache[index];

  var labels = isMajor ? this.labels() : this.minorLabels();
  var label = labels.getLabel(index);
  var scale = /** @type {anychart.scales.ScatterBase} */(this.scale_);
  var scaleTicks = isMajor ? scale.ticks() : scale.minorTicks();

  var value = scaleTicks.get()[index];

  var formatProvider = this.getLabelsFormatProvider_(index, value);
  var positionProvider = {'value': {'angle': 0, 'radius': 0}};

  if (label)
    boundsWTCache[index] = labels.measure(label);
  else
    boundsWTCache[index] = labels.measure(formatProvider, positionProvider);

  return boundsWTCache[index];
};


/**
 * Calculates label bounds and caches actual position coordinates.
 * @param {number} index Label index.
 * @param {boolean} isMajor IsMajor.
 * @return {Array.<number>} Label bounds.
 * @private
 */
anychart.core.axes.Circular.prototype.getLabelBounds_ = function(index, isMajor) {
  var boundsCache = isMajor ? this.labelsBounds_ : this.minorLabelsBounds_;
  if (goog.isDef(boundsCache[index]))
    return boundsCache[index];

  var bounds = this.getLabelBoundsWithoutTransform_(index, isMajor);

  var labels = isMajor ? this.labels() : this.minorLabels();
  var scale = /** @type {anychart.scales.ScatterBase} */(this.scale_);
  var scaleTicks = isMajor ? scale.ticks() : scale.minorTicks();

  var value = scaleTicks.get()[index];
  var ratio = scale.transform(value);

  var label = labels.getLabel(index);
  var autoRotate = label && goog.isDef(label.autoRotate()) ? label.autoRotate() : labels.autoRotate();
  var offsetX = label && goog.isDef(label.offsetX()) ? label.offsetX() : labels.offsetX();
  var offsetY = label && goog.isDef(label.offsetY()) ? label.offsetY() : labels.offsetY();

  var radius = this.getLabelRadius_(bounds.height, isMajor, autoRotate ? bounds.height : 0);
  radius += anychart.utils.normalizeSize(/** @type {number|string} */(offsetY), this.gauge_.getPixRadius());

  var startAngle = this.getStartAngle();
  var sweepAngle = goog.isDef(this.sweepAngle_) ? this.sweepAngle_ : this.gauge_.sweepAngle();

  var angle = goog.math.standardAngle(startAngle + ratio * sweepAngle);
  angle += anychart.utils.normalizeSize(/** @type {number|string} */(offsetX), sweepAngle);

  var angleRad = goog.math.toRadians(angle);

  var x = this.gauge_.getCx() + radius * Math.cos(angleRad);
  var y = this.gauge_.getCy() + radius * Math.sin(angleRad);

  var rotation = label && goog.isDef(label.rotation()) ?
      label.rotation() :
      labels.rotation();

  if (autoRotate)
    rotation += this.getLabelAngle_(angle);

  var anchor = label && goog.isDef(label.anchor()) ?
      label.anchor() :
      autoRotate ?
          labels.anchor() :
          this.getAnchorForLabel_(/** @type {number} */(angle));

  bounds.left = x;
  bounds.top = y;

  var anchorCoordinate = anychart.utils.getCoordinateByAnchor(
      new anychart.math.Rect(0, 0, bounds.width, bounds.height),
      /** @type {anychart.enums.Anchor} */(anchor));

  bounds.left -= anchorCoordinate.x;
  bounds.top -= anchorCoordinate.y;

  var point = anychart.utils.getCoordinateByAnchor(bounds, /** @type {anychart.enums.Anchor} */(anchor));
  var tx = goog.math.AffineTransform.getRotateInstance(goog.math.toRadians(/** @type {number} */(rotation)), point.x, point.y);

  var arr = bounds.toCoordinateBox();
  tx.transform(arr, 0, arr, 0, 4);

  return boundsCache[index] = arr;
};


/**
 * Gets format provider for label.
 * @param {number} index Label index.
 * @param {string|number} value Label value.
 * @return {Object} Labels format provider.
 * @private
 */
anychart.core.axes.Circular.prototype.getLabelsFormatProvider_ = function(index, value) {
  return new anychart.core.utils.AxisLabelsContextProvider(this, index, value);
};


/**
 * Anchor for angle of label
 * @param {number} angle Label angle.
 * @return {anychart.enums.Anchor}
 * @private
 */
anychart.core.axes.Circular.prototype.getAnchorForLabel_ = function(angle) {
  angle = goog.math.standardAngle(angle);
  var anchor = anychart.enums.Anchor.CENTER;
  var position = anychart.enums.normalizeGaugeSidePosition(this.labels().position());

  if (position == 'inside') {
    if (!angle) {
      anchor = anychart.enums.Anchor.RIGHT_CENTER;
    } else if (angle > 0 && angle < 90) {
      anchor = anychart.enums.Anchor.RIGHT_BOTTOM;
    } else if (angle == 90) {
      anchor = anychart.enums.Anchor.CENTER_BOTTOM;
    } else if (angle > 90 && angle < 180) {
      anchor = anychart.enums.Anchor.LEFT_BOTTOM;
    } else if (angle == 180) {
      anchor = anychart.enums.Anchor.LEFT_CENTER;
    } else if (angle > 180 && angle < 270) {
      anchor = anychart.enums.Anchor.LEFT_TOP;
    } else if (angle == 270) {
      anchor = anychart.enums.Anchor.CENTER_TOP;
    } else if (angle > 270) {
      anchor = anychart.enums.Anchor.RIGHT_TOP;
    }
  } else if (position == 'outside') {
    if (!angle) {
      anchor = anychart.enums.Anchor.LEFT_CENTER;
    } else if (angle > 0 && angle < 90) {
      anchor = anychart.enums.Anchor.LEFT_TOP;
    } else if (angle == 90) {
      anchor = anychart.enums.Anchor.CENTER_TOP;
    } else if (angle > 90 && angle < 180) {
      anchor = anychart.enums.Anchor.RIGHT_TOP;
    } else if (angle == 180) {
      anchor = anychart.enums.Anchor.RIGHT_CENTER;
    } else if (angle > 180 && angle < 270) {
      anchor = anychart.enums.Anchor.RIGHT_BOTTOM;
    } else if (angle == 270) {
      anchor = anychart.enums.Anchor.CENTER_BOTTOM;
    } else if (angle > 270) {
      anchor = anychart.enums.Anchor.LEFT_BOTTOM;
    }
  }
  return anchor;
};


/**
 * Axis labels drawer.
 * @param {number} index Label index.
 * @param {number} angle Label angle.
 * @param {boolean} isMajor Is major.
 * @private
 */
anychart.core.axes.Circular.prototype.drawLabel_ = function(index, angle, isMajor) {
  var scale = /** @type {anychart.scales.ScatterBase} */(this.scale_);
  var scaleTicksArr = isMajor ? scale.ticks().get() : scale.minorTicks().get();
  var labels = isMajor ? this.labels() : this.minorLabels();
  var label = labels.getLabel(index);
  var autoRotate = label && goog.isDef(label.autoRotate()) ? label.autoRotate() : labels.autoRotate();

  var bounds = this.getLabelBoundsWithoutTransform_(index, isMajor);
  var radius = this.getLabelRadius_(bounds.height, isMajor, autoRotate ? bounds.height : 0);

  var formatProvider = this.getLabelsFormatProvider_(index, scaleTicksArr[index]);
  var positionProvider = {'value': {'angle': angle, 'radius': radius}};
  label = labels.add(formatProvider, positionProvider, index);

  if (!autoRotate) {
    var sweepAngle = goog.isDef(this.sweepAngle_) ? this.sweepAngle_ : this.gauge_.sweepAngle();
    var offsetX = label && goog.isDef(label.offsetX()) ? label.offsetX() : labels.offsetX();
    angle += anychart.utils.normalizeSize(/** @type {number|string} */(offsetX), sweepAngle);

    label.anchor(this.getAnchorForLabel_(angle));
  }
};


/**
 * Set/get link to gauge.
 * @param {anychart.charts.CircularGauge=} opt_gauge Gauge inst for set.
 * @return {anychart.core.axes.Circular|anychart.charts.CircularGauge}
 */
anychart.core.axes.Circular.prototype.gauge = function(opt_gauge) {
  if (goog.isDef(opt_gauge)) {
    if (this.gauge_ != opt_gauge) {
      this.gauge_ = opt_gauge;
    }
    return this;
  } else {
    return this.gauge_;
  }
};


/** @inheritDoc */
anychart.core.axes.Circular.prototype.remove = function() {
  if (this.line_) this.line_.parent(null);
  this.ticks().remove();
  this.labels().remove();
  this.minorTicks().remove();
  this.minorLabels().remove();
};


/**
 * Drawing.
 * @return {anychart.core.axes.Circular}
 */
anychart.core.axes.Circular.prototype.draw = function() {
  if (!this.checkDrawingNeeded())
    return this;

  var scale = this.scale();

  var ticksDrawer, labelsDrawer, minorTicksDrawer, minorLabelsDrawer;

  var startAngle = this.getStartAngle();
  var sweepAngle = goog.isDefAndNotNull(this.sweepAngle_) ? this.sweepAngle_ : this.gauge_.sweepAngle();
  var cx = this.gauge_.getCx();
  var cy = this.gauge_.getCy();

  if (!this.line_) {
    this.line_ = acgraph.path();
    this.bindHandlersToGraphics(this.line_);
    this.registerDisposable(this.line_);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.pixRadius_ = anychart.utils.normalizeSize(
        goog.isDefAndNotNull(this.radius_) ? this.radius_ : '100%', this.gauge_.getPixRadius());
    this.axisWidth_ = anychart.utils.normalizeSize(
        goog.isDefAndNotNull(this.width_) ? this.width_ : '3%', this.gauge_.getPixRadius());

    var cornersRoundingPix = anychart.utils.normalizeSize(/** @type {string} */ (this.cornersRounding()), this.axisWidth_);

    var x, y;
    var innerR = this.pixRadius_ - this.axisWidth_ / 2;
    var outerR = this.pixRadius_ + this.axisWidth_ / 2;

    this.line_.clear();
    this.line_.circularArc(
        cx,
        cy,
        this.pixRadius_ - this.axisWidth_ / 2,
        this.pixRadius_ - this.axisWidth_ / 2,
        startAngle,
        sweepAngle);

    if (cornersRoundingPix) {
      x = cx + goog.math.angleDx(startAngle + sweepAngle, outerR);
      y = cy + goog.math.angleDy(startAngle + sweepAngle, outerR);
      if (cornersRoundingPix < this.axisWidth_ / 2)
        this.line_.arcToByEndPoint(x, y, this.axisWidth_ - cornersRoundingPix, this.axisWidth_ - cornersRoundingPix, false, false);
      else
        this.line_.arcToByEndPoint(x, y, cornersRoundingPix, cornersRoundingPix, true, false);
    }

    this.line_.circularArc(
        cx,
        cy,
        this.pixRadius_ + this.axisWidth_ / 2,
        this.pixRadius_ + this.axisWidth_ / 2,
        startAngle + sweepAngle,
        -sweepAngle, !cornersRoundingPix);

    if (cornersRoundingPix) {
      x = cx + goog.math.angleDx(startAngle, innerR);
      y = cy + goog.math.angleDy(startAngle, innerR);
      if (cornersRoundingPix < this.axisWidth_ / 2)
        this.line_.arcToByEndPoint(x, y, this.axisWidth_ - cornersRoundingPix, this.axisWidth_ - cornersRoundingPix, false, false);
      else
        this.line_.arcToByEndPoint(x, y, cornersRoundingPix, cornersRoundingPix, true, false);
    }

    this.line_.close();

    this.dropBoundsCache_();
    this.invalidate(anychart.ConsistencyState.AXIS_TICKS | anychart.ConsistencyState.AXIS_LABELS);
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  this.labels().suspendSignalsDispatching();
  this.minorLabels().suspendSignalsDispatching();
  this.ticks().suspendSignalsDispatching();
  this.minorTicks().suspendSignalsDispatching();

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    this.line_.fill(this.fill_);
    this.line_.stroke(null);

    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.AXIS_TICKS)) {
    var ticks = /** @type {anychart.core.axes.CircularTicks} */(this.ticks());
    ticks.invalidate(anychart.ConsistencyState.BOUNDS);
    ticks.startDrawing();
    ticksDrawer = ticks.drawTick;

    var minorTicks = /** @type {anychart.core.axes.CircularTicks} */(this.minorTicks());
    minorTicks.invalidate(anychart.ConsistencyState.BOUNDS);
    minorTicks.startDrawing();
    minorTicksDrawer = minorTicks.drawTick;

    this.markConsistent(anychart.ConsistencyState.AXIS_TICKS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.AXIS_LABELS)) {
    var labels = this.labels();
    labels.parentBounds(this.gauge_.getGaugeBounds());
    labels.cx(cx);
    labels.cy(cy);
    labels.startAngle(startAngle);
    labels.sweepAngle(sweepAngle);
    labels.parentRadius(this.gauge_.getPixRadius());
    labels.clear();
    labelsDrawer = this.drawLabel_;

    var minorLabels = this.minorLabels();
    minorLabels.parentBounds(this.gauge_.getGaugeBounds());
    minorLabels.cx(cx);
    minorLabels.cy(cy);
    minorLabels.startAngle(startAngle);
    minorLabels.sweepAngle(sweepAngle);
    minorLabels.parentRadius(this.gauge_.getPixRadius());
    minorLabels.clear();
    minorLabelsDrawer = this.drawLabel_;
    this.markConsistent(anychart.ConsistencyState.AXIS_LABELS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    var zIndex = /** @type {number} */(this.zIndex());
    var multiplier = anychart.charts.CircularGauge.ZINDEX_MULTIPLIER * 0.1;
    this.line_.zIndex(zIndex + anychart.core.axes.Circular.ZINDEX_AXIS_LINE * multiplier);
    this.ticks().zIndex(zIndex);
    this.minorTicks().zIndex(zIndex);
    this.labels().zIndex(zIndex + anychart.core.axes.Circular.ZINDEX_LABEL * multiplier);
    this.minorLabels().zIndex(zIndex + anychart.core.axes.Circular.ZINDEX_LABEL * multiplier);

    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    var container = /** @type {acgraph.vector.ILayer} */(this.container());
    this.line_.parent(container);
    this.ticks().container(container);
    this.minorTicks().container(container);
    this.labels().container(container);
    this.minorLabels().container(container);

    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  if (ticksDrawer || labelsDrawer || minorTicksDrawer || minorLabelsDrawer) {
    var angle;
    var i, j, overlappedLabels, needDrawLabels, needDrawMinorLabels;
    var tickVal, ratio, drawLabel, drawTick;

    var scaleTicksArr = scale.ticks().get();
    var ticksArrLen = scaleTicksArr.length;
    var scaleMinorTicksArr = scale.minorTicks().get();
    var minorTicksArrLen = scaleMinorTicksArr.length;

    overlappedLabels = this.getOverlappedLabels_();

    if (goog.isObject(overlappedLabels)) {
      needDrawLabels = overlappedLabels.labels;
      needDrawMinorLabels = overlappedLabels.minorLabels;
    } else {
      needDrawLabels = !overlappedLabels;
      needDrawMinorLabels = !overlappedLabels;
    }

    i = 0;
    j = 0;

    var minorTickVal, minorRatio, prevMajorRatio;

    while (i < ticksArrLen || j < minorTicksArrLen) {
      tickVal = scaleTicksArr[i];
      minorTickVal = scaleMinorTicksArr[j];
      ratio = scale.transform(tickVal);
      minorRatio = scale.transform(minorTickVal);

      if (((ratio <= minorRatio && i < ticksArrLen) || j == minorTicksArrLen)) {
        angle = goog.math.standardAngle(startAngle + ratio * sweepAngle);

        drawLabel = goog.isArray(needDrawLabels) ? needDrawLabels[i] : needDrawLabels;
        drawTick = (goog.isArray(needDrawLabels) && needDrawLabels[i]) || goog.isBoolean(needDrawLabels);

        if (drawTick && ticksDrawer)
          ticksDrawer.call(this.ticks_, angle);

        if (drawLabel && labelsDrawer)
          labelsDrawer.call(this, i, angle, true);

        prevMajorRatio = ratio;
        i++;
      } else {
        angle = goog.math.standardAngle(startAngle + minorRatio * sweepAngle);

        drawLabel = goog.isArray(needDrawMinorLabels) ? needDrawMinorLabels[j] : needDrawMinorLabels;
        drawTick = (goog.isArray(needDrawMinorLabels) && needDrawMinorLabels[j]) || goog.isBoolean(needDrawMinorLabels);

        if (drawTick && minorTicksDrawer && prevMajorRatio != minorRatio)
          minorTicksDrawer.call(this.minorTicks_, angle);

        if (drawLabel && minorLabelsDrawer && prevMajorRatio != minorRatio)
          minorLabelsDrawer.call(this, j, angle, false);

        j++;
      }
    }
  }

  if (ticksDrawer) this.ticks().finalizeDrawing();
  if (minorTicksDrawer) this.minorTicks().finalizeDrawing();
  if (labelsDrawer) this.labels().draw();
  if (minorLabelsDrawer) this.minorLabels().draw();

  this.labels().resumeSignalsDispatching(false);
  this.minorLabels().resumeSignalsDispatching(false);
  this.ticks().resumeSignalsDispatching(false);
  this.minorTicks().resumeSignalsDispatching(false);

  return this;
};


//----------------------------------------------------------------------------------------------------------------------
//  Serialize & Deserialize
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.axes.Circular.prototype.serialize = function() {
  var json = anychart.core.axes.Circular.base(this, 'serialize');

  json['scale'] = this.scale().serialize();

  json['ticks'] = this.ticks().serialize();
  json['minorTicks'] = this.minorTicks().serialize();
  json['labels'] = this.labels().serialize();
  json['minorLabels'] = this.minorLabels().serialize();

  if (goog.isDef(this.startAngle()))
    json['startAngle'] = this.startAngle();
  if (goog.isDef(this.sweepAngle()))
    json['sweepAngle'] = this.sweepAngle();

  if (goog.isDef(this.width()))
    json['width'] = this.width();
  if (goog.isDef(this.radius()))
    json['radius'] = this.radius();
  if (goog.isDef(this.cornersRounding()))
    json['cornersRounding'] = this.cornersRounding();

  json['fill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill} */(this.fill()));
  json['overlapMode'] = this.overlapMode();

  json['drawFirstLabel'] = this.drawFirstLabel();
  json['drawLastLabel'] = this.drawLastLabel();

  return json;
};


/** @inheritDoc */
anychart.core.axes.Circular.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.axes.Circular.base(this, 'setupByJSON', config, opt_default);

  var scale;
  var json = config['scale'];
  if (goog.isString(json)) {
    scale = this.getGaugeScale_(json);
  } else if (goog.isObject(json)) {
    scale = this.getGaugeScale_(json['type']);
    scale.setup(json);
  } else {
    scale = null;
  }
  if (scale)
    this.scale(scale);

  this.ticks(config['ticks']);
  this.minorTicks(config['minorTicks']);

  this.labels().setup(config['labels']);
  this.minorLabels().setup(config['minorLabels']);

  this.startAngle(config['startAngle']);
  this.sweepAngle(config['sweepAngle']);

  this.overlapMode(config['overlapMode']);
  this.fill(config['fill']);
  this.width(config['width']);
  this.radius(config['radius']);
  this.cornersRounding(config['cornersRounding']);

  this.drawFirstLabel(config['drawFirstLabel']);
  this.drawLastLabel(config['drawLastLabel']);
};


//exports
(function() {
  var proto = anychart.core.axes.Circular.prototype;
  proto['scale'] = proto.scale;

  proto['overlapMode'] = proto.overlapMode;

  proto['ticks'] = proto.ticks;
  proto['minorTicks'] = proto.minorTicks;

  proto['labels'] = proto.labels;
  proto['minorLabels'] = proto.minorLabels;

  proto['startAngle'] = proto.startAngle;
  proto['sweepAngle'] = proto.sweepAngle;

  proto['fill'] = proto.fill;
  proto['width'] = proto.width;
  proto['radius'] = proto.radius;
  proto['cornersRounding'] = proto.cornersRounding;

  proto['drawFirstLabel'] = proto.drawFirstLabel;
  proto['drawLastLabel'] = proto.drawLastLabel;
})();


