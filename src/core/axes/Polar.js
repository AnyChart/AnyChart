goog.provide('anychart.core.axes.Polar');
goog.require('acgraph');
goog.require('anychart.color');
goog.require('anychart.core.IStandaloneBackend');
goog.require('anychart.core.VisualBase');
goog.require('anychart.core.axes.RadialTicks');
goog.require('anychart.core.reporting');
goog.require('anychart.core.ui.LabelsFactory');
goog.require('anychart.core.utils.AxisLabelsContextProvider');
goog.require('anychart.core.utils.Bounds');
goog.require('anychart.enums');
goog.require('anychart.math.Rect');



/**
 * Radar axis Class.
 * @constructor
 * @extends {anychart.core.VisualBase}
 * @implements {anychart.core.IStandaloneBackend}
 */
anychart.core.axes.Polar = function() {
  this.suspendSignalsDispatching();
  anychart.core.axes.Polar.base(this, 'constructor');

  this.labelsBounds_ = [];
  this.minorLabelsBounds_ = [];
  this.line_ = acgraph.circle();
  this.bindHandlersToGraphics(this.line_);
  this.registerDisposable(this.line_);

  /**
   * Constant to save space.
   * @type {number}
   * @private
   */
  this.ALL_VISUAL_STATES_ = anychart.ConsistencyState.APPEARANCE |
      anychart.ConsistencyState.AXIS_LABELS |
      anychart.ConsistencyState.AXIS_TICKS |
      anychart.ConsistencyState.BOUNDS;
  this.resumeSignalsDispatching(false);
};
goog.inherits(anychart.core.axes.Polar, anychart.core.VisualBase);


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.axes.Polar.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.AXIS_LABELS |
    anychart.ConsistencyState.AXIS_TICKS;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.axes.Polar.prototype.SUPPORTED_SIGNALS = anychart.core.VisualBase.prototype.SUPPORTED_SIGNALS;


/**
 * @type {anychart.enums.LabelsOverlapMode}
 * @private
 */
anychart.core.axes.Polar.prototype.overlapMode_ = anychart.enums.LabelsOverlapMode.NO_OVERLAP;


/**
 * @type {acgraph.vector.Circle}
 * @private
 */
anychart.core.axes.Polar.prototype.line_ = null;


/**
 * @type {string}
 * @private
 */
anychart.core.axes.Polar.prototype.name_ = 'axis';


/**
 * @type {anychart.core.ui.LabelsFactory}
 * @private
 */
anychart.core.axes.Polar.prototype.labels_ = null;


/**
 * @type {anychart.core.axes.RadialTicks}
 * @private
 */
anychart.core.axes.Polar.prototype.ticks_ = null;


/**
 * @type {anychart.core.ui.LabelsFactory}
 * @private
 */
anychart.core.axes.Polar.prototype.minorLabels_ = null;


/**
 * @type {anychart.core.axes.RadialTicks}
 * @private
 */
anychart.core.axes.Polar.prototype.minorTicks_ = null;


/**
 * @type {string|acgraph.vector.Stroke}
 * @private
 */
anychart.core.axes.Polar.prototype.stroke_;


/**
 * @type {anychart.scales.ScatterBase}
 * @private
 */
anychart.core.axes.Polar.prototype.scale_ = null;


/**
 * @type {anychart.core.utils.Bounds}
 * @private
 */
anychart.core.axes.Polar.prototype.pixelBounds_ = null;


/**
 * @type {number}
 * @private
 */
anychart.core.axes.Polar.prototype.radius_ = NaN;


/**
 *
 * @type {number}
 * @private
 */
anychart.core.axes.Polar.prototype.criticalTickLength_ = NaN;


/**
 * @type {number}
 * @private
 */
anychart.core.axes.Polar.prototype.cx_ = NaN;


/**
 * @type {number}
 * @private
 */
anychart.core.axes.Polar.prototype.cy_ = NaN;


/**
 * @type {number}
 * @private
 */
anychart.core.axes.Polar.prototype.startAngle_ = NaN;


/**
 * @type {Array.<anychart.math.Rect>}
 * @private
 */
anychart.core.axes.Polar.prototype.labelsBounds_ = null;


/**
 * @type {Array.<anychart.math.Rect>}
 * @private
 */
anychart.core.axes.Polar.prototype.minorLabelsBounds_ = null;


/**
 * @param {(anychart.enums.LabelsOverlapMode|string)=} opt_value Value to set.
 * @return {anychart.enums.LabelsOverlapMode|string|anychart.core.axes.Polar} Drawing flag or itself for method chaining.
 */
anychart.core.axes.Polar.prototype.overlapMode = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var overlap = anychart.enums.normalizeLabelsOverlapMode(opt_value, this.overlapMode_);
    if (this.overlapMode_ != overlap) {
      this.overlapMode_ = overlap;
      this.dropBoundsCache_();
      this.invalidate(this.ALL_VISUAL_STATES_, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.overlapMode_;
};


/**
 * @param {(Object|boolean|null)=} opt_value Axis labels.
 * @return {!(anychart.core.ui.LabelsFactory|anychart.core.axes.Polar)} Axis labels of itself for method chaining.
 */
anychart.core.axes.Polar.prototype.minorLabels = function(opt_value) {
  if (!this.minorLabels_) {
    this.minorLabels_ = new anychart.core.ui.LabelsFactory();
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
 * @return {!(anychart.core.ui.LabelsFactory|anychart.core.axes.Polar)} Axis labels of itself for method chaining.
 */
anychart.core.axes.Polar.prototype.labels = function(opt_value) {
  if (!this.labels_) {
    this.labels_ = new anychart.core.ui.LabelsFactory();
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
anychart.core.axes.Polar.prototype.labelsInvalidated_ = function(event) {
  var state = 0;
  var signal = 0;
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state = this.ALL_VISUAL_STATES_;
    signal = anychart.Signal.BOUNDS_CHANGED | anychart.Signal.NEEDS_REDRAW;
  } else if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state = anychart.ConsistencyState.AXIS_LABELS;
    signal = anychart.Signal.NEEDS_REDRAW;
  }
  this.dropBoundsCache_();

  this.invalidate(state, signal);
};


/**
 * @param {(Object|boolean|null)=} opt_value Axis ticks.
 * @return {!(anychart.core.axes.RadialTicks|anychart.core.axes.Polar)} Axis ticks or itself for method chaining.
 */
anychart.core.axes.Polar.prototype.minorTicks = function(opt_value) {
  if (!this.minorTicks_) {
    this.minorTicks_ = new anychart.core.axes.RadialTicks();
    this.minorTicks_.setParentEventTarget(this);
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
 * @return {!(anychart.core.axes.RadialTicks|anychart.core.axes.Polar)} Axis ticks or itself for method chaining.
 */
anychart.core.axes.Polar.prototype.ticks = function(opt_value) {
  if (!this.ticks_) {
    this.ticks_ = new anychart.core.axes.RadialTicks();
    this.ticks_.setParentEventTarget(this);
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
anychart.core.axes.Polar.prototype.ticksInvalidated_ = function(event) {
  var state = 0;
  var signal = 0;
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state = this.ALL_VISUAL_STATES_;
    signal = anychart.Signal.BOUNDS_CHANGED | anychart.Signal.NEEDS_REDRAW;
  }
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state |= anychart.ConsistencyState.AXIS_TICKS | anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.BOUNDS;
    signal |= anychart.Signal.NEEDS_REDRAW;
  }
  this.dropBoundsCache_();
  this.invalidate(state, signal);
};


/**
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.core.axes.Polar|acgraph.vector.Stroke|Function} .
 */
anychart.core.axes.Polar.prototype.stroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    opt_strokeOrFill = acgraph.vector.normalizeStroke.apply(null, arguments);
    if (this.stroke_ != opt_strokeOrFill) {
      var thicknessOld = goog.isObject(this.stroke_) ? this.stroke_['thickness'] || 1 : 1;
      var thicknessNew = goog.isObject(opt_strokeOrFill) ? opt_strokeOrFill['thickness'] || 1 : 1;
      this.stroke_ = opt_strokeOrFill;
      if (thicknessNew == thicknessOld)
        this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
      else {
        this.dropBoundsCache_();
        this.invalidate(this.ALL_VISUAL_STATES_, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
      }
    }
    return this;
  } else {
    return this.stroke_;
  }
};


/**
 * @param {anychart.scales.ScatterBase=} opt_value Scale.
 * @return {anychart.scales.ScatterBase|!anychart.core.axes.Polar} Axis scale or itself for method chaining.
 */
anychart.core.axes.Polar.prototype.scale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.scale_ != opt_value) {
      this.scale_ = opt_value;
      this.scale_.listenSignals(this.scaleInvalidated_, this);
      this.invalidate(this.ALL_VISUAL_STATES_, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
      this.dropBoundsCache_();
    }
    return this;
  } else {
    return this.scale_;
  }
};


/**
 * Internal ticks invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.axes.Polar.prototype.scaleInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.dropBoundsCache_();
    this.invalidate(this.ALL_VISUAL_STATES_, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
  }
};


/**
 * @param {(string|number)=} opt_value .
 * @return {(string|number|anychart.core.axes.Polar)} .
 */
anychart.core.axes.Polar.prototype.startAngle = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = goog.math.standardAngle((goog.isNull(opt_value) || isNaN(+opt_value)) ? 0 : +opt_value);
    if (this.startAngle_ != opt_value) {
      this.startAngle_ = opt_value;
      this.invalidate(this.ALL_VISUAL_STATES_, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    this.dropBoundsCache_();
    return this;
  } else {
    return this.startAngle_;
  }
};


/** @inheritDoc */
anychart.core.axes.Polar.prototype.invalidateParentBounds = function() {
  this.invalidate(this.ALL_VISUAL_STATES_, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
};


/**
 * @private
 */
anychart.core.axes.Polar.prototype.dropBoundsCache_ = function() {
  this.labelsBounds_.length = 0;
  this.minorLabelsBounds_.length = 0;
  this.overlappedLabels_ = null;
};


/**
 * Calculate axis bounds, center, radius.
 * @return {anychart.core.utils.Bounds}
 * @private
 */
anychart.core.axes.Polar.prototype.calculateAxisBounds_ = function() {
  if (!this.pixelBounds_ || this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    var parentBounds = this.parentBounds();

    if (parentBounds) {
      var radius = Math.round(Math.min(parentBounds.width, parentBounds.height) / 2);
      if (isNaN(radius) || radius < 0) radius = 0;
      this.radius_ = radius;
      this.cx_ = Math.round(parentBounds.left + parentBounds.width / 2);
      this.cy_ = Math.round(parentBounds.top + parentBounds.height / 2);

      var scale = /** @type {anychart.scales.ScatterBase} */(this.scale());

      if (scale) {
        var delta = 0;
        if (this.enabled()) {
          this.dropBoundsCache_();
          var x, y, x1, y1, lineThickness, tickLen, labelBounds;
          var i, j, overlappedLabels, needDrawLabels, needDrawMinorLabels;

          var leftExtreme = NaN;
          var topExtreme = NaN;
          var rightExtreme = NaN;
          var bottomExtreme = NaN;

          var leftExtremeLabelIndex = NaN;
          var topExtremeLabelIndex = NaN;
          var rightExtremeLabelIndex = NaN;
          var bottomExtremeLabelIndex = NaN;

          var leftExtremeAngle = NaN;
          var topExtremeAngle = NaN;
          var rightExtremeAngle = NaN;
          var bottomExtremeAngle = NaN;

          var leftExtremeIsMajor = true;
          var topExtremeIsMajor = true;
          var rightExtremeIsMajor = true;
          var bottomExtremeIsMajor = true;

          var scaleTicksArr = scale.ticks().get();
          var ticksArrLen = scaleTicksArr.length;

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
          var scaleMinorTicksArr = scale.minorTicks().get();
          var minorTicksArrLen = scaleMinorTicksArr.length;
          var minorTickVal, minorRatio, prevMajorRatio;
          var tickVal, ratio, drawLabel, drawTick;

          var angleRad, minorAngleRad;
          var startAngle = goog.math.standardAngle(this.startAngle() - 90);
          var angle, minorAngle;

          while (i < ticksArrLen || j < minorTicksArrLen) {
            tickVal = scaleTicksArr[i];
            minorTickVal = scaleMinorTicksArr[j];
            ratio = scale.transform(tickVal);
            minorRatio = scale.transform(minorTickVal);

            if (((ratio <= minorRatio && i < ticksArrLen) || j == minorTicksArrLen)) {
              angle = goog.math.standardAngle(startAngle + ratio * 360);
              angleRad = angle * Math.PI / 180;

              drawLabel = goog.isArray(needDrawLabels) ? needDrawLabels[i] : needDrawLabels;
              drawTick = (goog.isArray(needDrawLabels) && needDrawLabels[i]) || goog.isBoolean(needDrawLabels);

              if (drawLabel && this.labels().enabled()) {
                labelBounds = this.getLabelBounds_(i, true);
                x = labelBounds.getLeft();
                y = labelBounds.getTop();
                x1 = labelBounds.getRight();
                y1 = labelBounds.getBottom();
              } else if (drawTick && this.ticks().enabled()) {
                lineThickness = this.line_.stroke()['thickness'] ? this.line_.stroke()['thickness'] : 1;
                tickLen = this.ticks().enabled() ? this.ticks().length() : 0;
                radius = this.radius_ + tickLen + lineThickness / 2;
                x = x1 = Math.round(this.cx_ + radius * Math.cos(angleRad));
                y = y1 = Math.round(this.cy_ + radius * Math.sin(angleRad));
              } else {
                lineThickness = this.line_.stroke()['thickness'] ? this.line_.stroke()['thickness'] : 1;
                radius = this.radius_ + lineThickness / 2;
                x = x1 = Math.round(this.cx_ + radius * Math.cos(angleRad));
                y = y1 = Math.round(this.cy_ + radius * Math.sin(angleRad));
              }

              if (isNaN(leftExtreme) || x < leftExtreme) {
                leftExtreme = x;
                leftExtremeLabelIndex = i;
                leftExtremeAngle = angle;
                leftExtremeIsMajor = true;
              }
              if (isNaN(topExtreme) || y < topExtreme) {
                topExtreme = y;
                topExtremeLabelIndex = i;
                topExtremeAngle = angle;
                topExtremeIsMajor = true;
              }
              if (isNaN(rightExtreme) || x1 > rightExtreme) {
                rightExtreme = x1;
                rightExtremeLabelIndex = i;
                rightExtremeAngle = angle;
                rightExtremeIsMajor = true;
              }
              if (isNaN(bottomExtreme) || y1 > bottomExtreme) {
                bottomExtreme = y1;
                bottomExtremeLabelIndex = i;
                bottomExtremeAngle = angle;
                bottomExtremeIsMajor = true;
              }
              prevMajorRatio = ratio;
              i++;
            } else {
              minorAngle = goog.math.standardAngle(startAngle + minorRatio * 360);
              minorAngleRad = minorAngle * Math.PI / 180;

              drawLabel = goog.isArray(needDrawMinorLabels) ? needDrawMinorLabels[j] : needDrawMinorLabels;
              drawTick = (goog.isArray(needDrawMinorLabels) && needDrawMinorLabels[j]) || goog.isBoolean(needDrawMinorLabels);

              if (drawLabel && prevMajorRatio != minorRatio) {
                labelBounds = this.getLabelBounds_(j, false);
                x = labelBounds.getLeft();
                y = labelBounds.getTop();
                x1 = labelBounds.getRight();
                y1 = labelBounds.getBottom();
              } else if (drawTick && this.minorTicks().enabled() && prevMajorRatio != minorRatio) {
                lineThickness = this.line_.stroke()['thickness'] ? this.line_.stroke()['thickness'] : 1;
                tickLen = this.minorTicks().enabled() ? this.minorTicks().length() : 0;
                radius = this.radius_ + tickLen + lineThickness / 2;
                x = x1 = Math.round(this.cx_ + radius * Math.cos(minorAngleRad));
                y = y1 = Math.round(this.cy_ + radius * Math.sin(minorAngleRad));
              }

              if (isNaN(leftExtreme) || x < leftExtreme) {
                leftExtreme = x;
                leftExtremeLabelIndex = j;
                leftExtremeAngle = minorAngle;
                leftExtremeIsMajor = false;
              }
              if (isNaN(topExtreme) || y < topExtreme) {
                topExtreme = y;
                topExtremeLabelIndex = j;
                topExtremeAngle = minorAngle;
                topExtremeIsMajor = false;
              }
              if (isNaN(rightExtreme) || x1 > rightExtreme) {
                rightExtreme = x1;
                rightExtremeLabelIndex = j;
                rightExtremeAngle = minorAngle;
                rightExtremeIsMajor = false;
              }
              if (isNaN(bottomExtreme) || y1 > bottomExtreme) {
                bottomExtreme = y1;
                bottomExtremeLabelIndex = j;
                bottomExtremeAngle = minorAngle;
                bottomExtremeIsMajor = false;
              }
              j++;
            }
          }

          var leftDelta = 0;
          var topDelta = 0;
          var rightDelta = 0;
          var bottomDelta = 0;

          leftExtreme = Math.round(leftExtreme);
          topExtreme = Math.round(topExtreme);
          rightExtreme = Math.round(rightExtreme);
          bottomExtreme = Math.round(bottomExtreme);

          var a;
          if (leftExtreme < parentBounds.getLeft()) {
            a = leftExtremeAngle < 180 ?
                Math.sin((leftExtremeAngle - 90) * Math.PI / 180) :
                Math.cos((leftExtremeAngle - 180) * Math.PI / 180);
            leftDelta = Math.round((parentBounds.getLeft() - leftExtreme) / a);
          }
          if (topExtreme < parentBounds.getTop()) {
            a = topExtremeAngle < 270 ?
                Math.sin((topExtremeAngle - 180) * Math.PI / 180) :
                Math.cos((topExtremeAngle - 270) * Math.PI / 180);
            topDelta = Math.round((parentBounds.getTop() - topExtreme) / a);
          }
          if (rightExtreme > parentBounds.getRight()) {
            a = rightExtremeAngle < 360 ?
                Math.sin((rightExtremeAngle - 270) * Math.PI / 180) :
                Math.cos(rightExtremeAngle * Math.PI / 180);
            rightDelta = Math.round((rightExtreme - parentBounds.getRight()) / a);
          }
          if (bottomExtreme > parentBounds.getBottom()) {
            a = bottomExtremeAngle < 90 ?
                Math.sin(bottomExtremeAngle * Math.PI / 180) :
                Math.cos((bottomExtremeAngle - 90) * Math.PI / 180);
            bottomDelta = Math.round((bottomExtreme - parentBounds.getBottom()) / a);
          }

          delta = Math.max(leftDelta, topDelta, rightDelta, bottomDelta);

          this.criticalTickLength_ = NaN;
          if (delta > 0) {
            this.radius_ -= delta;
            if (this.radius_ < 0) {
              this.radius_ = 0;
              var labelSize = 0;
              if (this.labels().enabled()) {
                var extremeLabelIndex = NaN, isHorizontal, isMajor = true;
                if (delta == leftDelta) {
                  extremeLabelIndex = leftExtremeLabelIndex;
                  isMajor = leftExtremeIsMajor;
                  isHorizontal = true;
                } else if (delta == topDelta) {
                  extremeLabelIndex = topExtremeLabelIndex;
                  isMajor = topExtremeIsMajor;
                  isHorizontal = false;
                } else if (delta == rightDelta) {
                  extremeLabelIndex = rightExtremeLabelIndex;
                  isMajor = rightExtremeIsMajor;
                  isHorizontal = true;
                } else if (delta == bottomDelta) {
                  extremeLabelIndex = bottomExtremeLabelIndex;
                  isMajor = bottomExtremeIsMajor;
                  isHorizontal = false;
                }
                var extremeLabelBounds = this.getLabelBounds_(extremeLabelIndex, isMajor);
                labelSize = isHorizontal ? extremeLabelBounds.width : extremeLabelBounds.height;
              }
              lineThickness = this.line_.stroke()['thickness'] ? this.line_.stroke()['thickness'] : 1;
              this.criticalTickLength_ = Math.min(parentBounds.width, parentBounds.height) / 2 - labelSize - lineThickness;
            }
            this.dropBoundsCache_();
          }
        }
        var outerRadius = this.radius_ + delta;
        var outerDiameter = outerRadius * 2;
        this.pixelBounds_ = new anychart.core.utils.Bounds(
            this.cx_ - outerRadius,
            this.cy_ - outerRadius,
            outerDiameter,
            outerDiameter);
      } else {
        this.pixelBounds_ = new anychart.core.utils.Bounds(
            this.cx_ - this.radius_,
            this.cy_ - this.radius_,
            this.radius_ * 2,
            this.radius_ * 2);
      }
    } else {
      this.radius_ = 0;
      this.cx_ = 0;
      this.cy_ = 0;
      this.pixelBounds_ = new anychart.core.utils.Bounds(0, 0, 0, 0);
    }
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }
  return this.pixelBounds_;
};


/**
 * Returns remaining parent bounds to use elsewhere.
 * @return {anychart.math.Rect} Parent bounds without the space used by the title.
 */
anychart.core.axes.Polar.prototype.getRemainingBounds = function() {
  var parentBounds = this.parentBounds();

  if (parentBounds) {
    if (this.enabled()) {
      this.calculateAxisBounds_();
      var lineThickness = this.line_.stroke()['thickness'] ? this.line_.stroke()['thickness'] : 1;
      var halfThickness = Math.floor(lineThickness / 2);
      return new anychart.math.Rect(
          this.cx_ - this.radius_ + halfThickness,
          this.cy_ - this.radius_ + halfThickness,
          (this.radius_ - halfThickness) * 2,
          (this.radius_ - halfThickness) * 2);
    } else {
      return /** @type {anychart.math.Rect} */(parentBounds);
    }
  } else
    return new anychart.math.Rect(0, 0, 0, 0);
};


/**
 * Returns labels anchor for angle.
 * @param {number} angle .
 * @param {anychart.math.Rect} bounds .
 * @return {{x: number, y: number}} .
 * @private
 */
anychart.core.axes.Polar.prototype.getLabelPositionOffsetForAngle_ = function(angle, bounds) {
  var width = bounds.width, height = bounds.height;

  var offset = {x: 0, y: 0};
  if (!angle) {
    offset.x += width / 2;
  } else if (angle > 0 && angle < 90) {
    offset.x += width / 2;
    offset.y += height / 2;
  } else if (angle == 90) {
    offset.y += height / 2;
  } else if (angle > 90 && angle < 180) {
    offset.y += height / 2;
    offset.x -= width / 2;
  } else if (angle == 180) {
    offset.x -= width / 2;
  } else if (angle > 180 && angle < 270) {
    offset.y -= height / 2;
    offset.x -= width / 2;
  } else if (angle == 270) {
    offset.y -= height / 2;
  } else if (angle > 270) {
    offset.y -= height / 2;
    offset.x += width / 2;
  }

  return offset;
};


/**
 * Returns an object with indexes of labels to draw.
 * @return {boolean|Object.<string, Array.<boolean>>} Object with indexes of labels to draw.
 * or Boolean when there are no labels.
 * @private
 */
anychart.core.axes.Polar.prototype.getOverlappedLabels_ = function() {
  if (!this.overlappedLabels_ || this.hasInvalidationState(anychart.ConsistencyState.AXIS_OVERLAP)) {
    if (this.overlapMode_ == anychart.enums.LabelsOverlapMode.ALLOW_OVERLAP) {
      return false;
    } else {
      var scale = /** @type {anychart.scales.ScatterBase} */(this.scale());
      var labels = [];
      var minorLabels = [];

      if (scale) {
        var i, j;

        /**
         * Index of previous major label which is displayed.
         * @type {number}
         */
        var prevDrawableLabel = -1;
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

        var scaleTicksArr = scale.ticks().get();
        var ticksArrLen = scaleTicksArr.length;
        var tickVal, ratio, bounds1, bounds2, bounds3, bounds4;
        var tempRatio;
        var k = -1;
        var isLabels = this.labels().enabled();

        if (scale instanceof anychart.scales.ScatterBase) {
          var scaleMinorTicksArr = scale.minorTicks().get();
          i = 0;
          j = 0;
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
                bounds1 = this.getLabelBounds_(k, true).toCoordinateBox();

                if (prevDrawableLabel != -1)
                  bounds2 = this.getLabelBounds_(prevDrawableLabel, true).toCoordinateBox();

                if (k == ticksArrLen - 1)
                  bounds3 = this.getLabelBounds_(0, true).toCoordinateBox();

                if (!(anychart.math.checkRectIntersection(bounds1, bounds2) ||
                    anychart.math.checkRectIntersection(bounds1, bounds3))) {
                  tempRatio = scale.transform(scaleTicksArr[k]);
                  if (tempRatio <= 0 || tempRatio >= 1)
                    nextDrawableLabel = k;
                  else if (tempRatio > 0 && tempRatio < 1)
                    nextDrawableLabel = k;
                }
                k++;
              }
            }

            if (((ratio <= minorRatio && i < ticksArrLen) || j == minorTicksArrLen)) {
              if (isLabels && i == nextDrawableLabel && this.labels().enabled()) {
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
                bounds1 = this.getLabelBounds_(j, false).toCoordinateBox();

                if (prevDrawableLabel != -1)
                  bounds2 = this.getLabelBounds_(prevDrawableLabel, true).toCoordinateBox();

                if (nextDrawableLabel != -1)
                  bounds3 = this.getLabelBounds_(nextDrawableLabel, true).toCoordinateBox();

                if (prevDrawableMinorLabel != -1)
                  bounds4 = this.getLabelBounds_(prevDrawableMinorLabel, false).toCoordinateBox();

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
                    prevDrawableMinorLabel = j;
                    minorLabels.push(true);
                  } else if (tempRatio > 0 && tempRatio < 1) {
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
        }
      }
      if (!isLabels) labels = false;
      this.overlappedLabels_ = {labels: labels, minorLabels: minorLabels};
    }
    this.markConsistent(anychart.ConsistencyState.AXIS_OVERLAP);
  }
  return this.overlappedLabels_;
};


/**
 * Calculate label bounds.
 * @param {number} index Label index.
 * @param {boolean} isMajor IsMajor.
 * @return {anychart.math.Rect} Label bounds.
 * @private
 */
anychart.core.axes.Polar.prototype.getLabelBounds_ = function(index, isMajor) {
  var boundsCache = isMajor ? this.labelsBounds_ : this.minorLabelsBounds_;
  if (goog.isDef(boundsCache[index]))
    return boundsCache[index];

  var lineThickness = this.line_.stroke()['thickness'] ? this.line_.stroke()['thickness'] : 1;
  var ticks = isMajor ? this.ticks() : this.minorTicks();
  var labels = isMajor ? this.labels() : this.minorLabels();
  var scale = /** @type {anychart.scales.ScatterBase} */(this.scale());
  var scaleTicks = isMajor ? scale.ticks() : scale.minorTicks();

  var value = scaleTicks.get()[index];
  var ratio = scale.transform(value);

  var angle = goog.math.standardAngle(this.startAngle() - 90 + ratio * 360);
  var angleRad = angle * Math.PI / 180;
  var tickLen = ticks.enabled() ? isNaN(this.criticalTickLength_) ? ticks.length() : this.criticalTickLength_ : 0;
  var radius = this.radius_ + tickLen + lineThickness / 2;
  var x = Math.round(this.cx_ + radius * Math.cos(angleRad));
  var y = Math.round(this.cy_ + radius * Math.sin(angleRad));

  var formatProvider = this.getLabelsFormatProvider_(index, value);
  var positionProvider = {'value': {'x': x, 'y': y}};
  var bounds = labels.measure(formatProvider, positionProvider, undefined, index);
  var offset = this.getLabelPositionOffsetForAngle_(angle, bounds);
  bounds.left += offset.x;
  bounds.top += offset.y;

  return boundsCache[index] = bounds;
};


/**
 * Gets format provider for label.
 * @param {number} index Label index.
 * @param {string|number} value Label value.
 * @return {Object} Labels format provider.
 * @private
 */
anychart.core.axes.Polar.prototype.getLabelsFormatProvider_ = function(index, value) {
  return new anychart.core.utils.AxisLabelsContextProvider(this, index, value);
};


/**
 * Axis labels drawer.
 * @param {number} index Label index.
 * @param {number} x X coordinate.
 * @param {number} y Y coordinate.
 * @param {boolean} isMajor Is major.
 * @private
 */
anychart.core.axes.Polar.prototype.drawLabel_ = function(index, x, y, isMajor) {
  var scale = /** @type {anychart.scales.ScatterBase} */(this.scale());
  var scaleTicksArr = isMajor ? scale.ticks().get() : scale.minorTicks().get();
  var labels = isMajor ? this.labels() : this.minorLabels();

  var formatProvider = this.getLabelsFormatProvider_(index, scaleTicksArr[index]);
  var positionProvider = {'value': {x: x, y: y}};
  labels.add(formatProvider, positionProvider, index);
};


/** @inheritDoc */
anychart.core.axes.Polar.prototype.checkDrawingNeeded = function() {
  if (this.isConsistent())
    return false;

  if (!this.enabled()) {
    if (this.hasInvalidationState(anychart.ConsistencyState.ENABLED)) {
      this.remove();
      this.markConsistent(anychart.ConsistencyState.ENABLED);
      this.ticks().invalidate(anychart.ConsistencyState.CONTAINER);
      this.labels().invalidate(anychart.ConsistencyState.CONTAINER);
      this.invalidate(
          anychart.ConsistencyState.CONTAINER |
          anychart.ConsistencyState.AXIS_TICKS |
          anychart.ConsistencyState.AXIS_LABELS
      );
    }
    return false;
  }
  this.markConsistent(anychart.ConsistencyState.ENABLED);
  return true;
};


/**
 * Axis drawing.
 * @return {anychart.core.axes.Polar} An instance of {@link anychart.core.axes.Polar} class for method chaining.
 */
anychart.core.axes.Polar.prototype.draw = function() {
  var scale = /** @type {anychart.scales.ScatterBase} */(this.scale());

  if (!scale) {
    anychart.core.reporting.error(anychart.enums.ErrorCode.SCALE_NOT_SET);
    return this;
  }

  if (!this.checkDrawingNeeded())
    return this;

  var ticksDrawer, labelsDrawer, minorTicksDrawer, minorLabelsDrawer;

  this.labels().suspendSignalsDispatching();
  this.minorLabels().suspendSignalsDispatching();
  this.ticks().suspendSignalsDispatching();
  this.minorTicks().suspendSignalsDispatching();

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    this.line_.stroke(this.stroke_);

    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    var zIndex = /** @type {number} */(this.zIndex());
    this.line_.zIndex(zIndex);
    this.ticks().zIndex(zIndex);
    this.minorTicks().zIndex(zIndex);
    this.labels().zIndex(zIndex);
    this.minorLabels().zIndex(zIndex);

    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    var container = /** @type {acgraph.vector.ILayer} */(this.container());
    this.line_.parent(container);
    this.ticks().container(container);
    this.labels().container(container);
    this.minorTicks().container(container);
    this.minorLabels().container(container);

    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.AXIS_TICKS)) {
    var ticks = /** @type {anychart.core.axes.RadialTicks} */(this.ticks());
    ticks.draw();
    ticksDrawer = ticks.drawTick;

    var minorTicks = /** @type {anychart.core.axes.RadialTicks} */(this.minorTicks());
    minorTicks.draw();
    minorTicksDrawer = minorTicks.drawTick;

    this.markConsistent(anychart.ConsistencyState.AXIS_TICKS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.AXIS_LABELS)) {
    var labels = this.labels();
    if (!labels.container()) labels.container(/** @type {acgraph.vector.ILayer} */(this.container()));
    labels.parentBounds(/** @type {anychart.math.Rect} */(this.parentBounds()));
    labels.clear();
    labelsDrawer = this.drawLabel_;

    var minorLabels = this.minorLabels();
    if (!minorLabels.container()) minorLabels.container(/** @type {acgraph.vector.ILayer} */(this.container()));
    minorLabels.parentBounds(/** @type {anychart.math.Rect} */(this.parentBounds()));
    minorLabels.clear();
    minorLabelsDrawer = this.drawLabel_;

    this.markConsistent(anychart.ConsistencyState.AXIS_LABELS);
  }

  if (goog.isDef(ticksDrawer) || goog.isDef(labelsDrawer) || goog.isDef(minorLabelsDrawer) || goog.isDef(minorTicksDrawer)) {
    this.calculateAxisBounds_();
    var angleRad, minorAngleRad;
    var startAngle = goog.math.standardAngle(this.startAngle() - 90);
    var angle, minorAngle;

    this.line_.radius(this.radius_);
    this.line_.centerX(this.cx_);
    this.line_.centerY(this.cy_);

    var x0Ticks, y0Ticks, x1Ticks, y1Ticks, radius;
    var xPixelShift, yPixelShift;
    var halfThickness, offset;

    var i, j, overlappedLabels, needDrawLabels, needDrawMinorLabels;

    var scaleTicksArr = scale.ticks().get();
    var ticksArrLen = scaleTicksArr.length;
    var tickThickness = this.ticks().stroke()['thickness'] ? parseFloat(this.ticks_.stroke()['thickness']) : 1;
    var tickLen = this.ticks().enabled() ? isNaN(this.criticalTickLength_) ? this.ticks().length() : this.criticalTickLength_ : 0;
    var tickVal, ratio, drawLabel, drawTick;
    var lineThickness = this.line_.stroke()['thickness'] ? this.line_.stroke()['thickness'] : 1;


    if (scale instanceof anychart.scales.ScatterBase) {
      overlappedLabels = this.getOverlappedLabels_();
      if (goog.isObject(overlappedLabels)) {
        needDrawLabels = overlappedLabels.labels;
        needDrawMinorLabels = overlappedLabels.minorLabels;
      } else {
        needDrawLabels = !overlappedLabels;
        needDrawMinorLabels = !overlappedLabels;
      }

      var scaleMinorTicksArr = scale.minorTicks().get();
      var minorTickThickness = this.minorTicks_.stroke()['thickness'] ? parseFloat(this.minorTicks_.stroke()['thickness']) : 1;
      var minorTickLen = this.minorTicks().enabled() ? isNaN(this.criticalTickLength_) ? this.minorTicks().length() : this.criticalTickLength_ : 0;

      i = 0;
      j = 0;
      var minorTicksArrLen = scaleMinorTicksArr.length;
      var minorTickVal, minorRatio, prevMajorRatio;

      while (i < ticksArrLen || j < minorTicksArrLen) {
        tickVal = scaleTicksArr[i];
        minorTickVal = scaleMinorTicksArr[j];
        ratio = scale.transform(tickVal);
        minorRatio = scale.transform(minorTickVal);

        if (((ratio <= minorRatio && i < ticksArrLen) || j == minorTicksArrLen)) {
          angle = goog.math.standardAngle(startAngle + ratio * 360);
          angleRad = angle * Math.PI / 180;

          xPixelShift = 0;
          yPixelShift = 0;

          halfThickness = Math.floor(lineThickness / 2);
          if (!angle) {
            yPixelShift = tickThickness % 2 == 0 ? 0 : -.5;
          } else if (angle == 90) {
            xPixelShift = tickThickness % 2 == 0 ? 0 : -.5;
          } else if (angle == 180) {
            yPixelShift = tickThickness % 2 == 0 ? 0 : .5;
          } else if (angle == 270) {
            xPixelShift = tickThickness % 2 == 0 ? 0 : .5;
          }

          radius = this.radius_ + halfThickness;
          x0Ticks = this.cx_ + radius * Math.cos(angleRad);
          y0Ticks = this.cy_ + radius * Math.sin(angleRad);

          radius = this.radius_ + tickLen + halfThickness;
          x1Ticks = this.cx_ + radius * Math.cos(angleRad);
          y1Ticks = this.cy_ + radius * Math.sin(angleRad);

          if (angle % 90 == 0) {
            x0Ticks = Math.round(x0Ticks);
            y0Ticks = Math.round(y0Ticks);
            x1Ticks = Math.round(x1Ticks);
            y1Ticks = Math.round(y1Ticks);
          }

          x0Ticks += xPixelShift;
          y0Ticks += yPixelShift;
          x1Ticks += xPixelShift;
          y1Ticks += yPixelShift;

          drawLabel = goog.isArray(needDrawLabels) ? needDrawLabels[i] : needDrawLabels;
          drawTick = (goog.isArray(needDrawLabels) && needDrawLabels[i]) || goog.isBoolean(needDrawLabels);

          if (drawTick && ticksDrawer)
            ticksDrawer.call(ticks, x0Ticks, y0Ticks, x1Ticks, y1Ticks);

          if (drawLabel) {
            offset = this.getLabelPositionOffsetForAngle_(angle, this.getLabelBounds_(i, true));
            labelsDrawer.call(this, i, x1Ticks + offset.x, y1Ticks + offset.y, true);
          }

          prevMajorRatio = ratio;
          i++;
        } else {
          minorAngle = goog.math.standardAngle(startAngle + minorRatio * 360);
          minorAngleRad = minorAngle * Math.PI / 180;

          xPixelShift = 0;
          yPixelShift = 0;

          halfThickness = Math.floor(lineThickness / 2);
          if (!minorAngle) {
            yPixelShift = minorTickThickness % 2 == 0 ? 0 : -.5;
          } else if (minorAngle == 90) {
            xPixelShift = minorTickThickness % 2 == 0 ? 0 : -.5;
          } else if (minorAngle == 180) {
            yPixelShift = minorTickThickness % 2 == 0 ? 0 : .5;
          } else if (minorAngle == 270) {
            xPixelShift = minorTickThickness % 2 == 0 ? 0 : .5;
          }

          radius = this.radius_ + halfThickness;
          x0Ticks = this.cx_ + radius * Math.cos(minorAngleRad);
          y0Ticks = this.cy_ + radius * Math.sin(minorAngleRad);

          radius = this.radius_ + minorTickLen + halfThickness;
          x1Ticks = this.cx_ + radius * Math.cos(minorAngleRad);
          y1Ticks = this.cy_ + radius * Math.sin(minorAngleRad);

          if (minorAngle % 90 == 0) {
            x0Ticks = Math.round(x0Ticks);
            y0Ticks = Math.round(y0Ticks);
            x1Ticks = Math.round(x1Ticks);
            y1Ticks = Math.round(y1Ticks);
          }

          x0Ticks += xPixelShift;
          y0Ticks += yPixelShift;
          x1Ticks += xPixelShift;
          y1Ticks += yPixelShift;

          drawLabel = goog.isArray(needDrawMinorLabels) ? needDrawMinorLabels[j] : needDrawMinorLabels;
          drawTick = (goog.isArray(needDrawMinorLabels) && needDrawMinorLabels[j]) || goog.isBoolean(needDrawMinorLabels);

          if (drawTick && minorTicksDrawer && prevMajorRatio != minorRatio)
            minorTicksDrawer.call(minorTicks, x0Ticks, y0Ticks, x1Ticks, y1Ticks);

          if (drawLabel && prevMajorRatio != minorRatio) {
            offset = this.getLabelPositionOffsetForAngle_(minorAngle, this.getLabelBounds_(j, false));
            minorLabelsDrawer.call(this, j, x1Ticks + offset.x, y1Ticks + offset.y, false);
          }
          j++;
        }
      }
      this.minorLabels().draw();
    }
    this.labels().draw();
  }

  this.labels().resumeSignalsDispatching(false);
  this.ticks().resumeSignalsDispatching(false);
  this.minorLabels().resumeSignalsDispatching(false);
  this.minorTicks().resumeSignalsDispatching(false);

  return this;
};


/** @inheritDoc */
anychart.core.axes.Polar.prototype.remove = function() {
  if (this.line_) this.line_.parent(null);
  this.ticks().remove();
  this.minorTicks().remove();
  if (this.labels_) this.labels_.remove();
  if (this.minorLabels_) this.minorLabels_.remove();
};


/** @inheritDoc */
anychart.core.axes.Polar.prototype.serialize = function() {
  var json = anychart.core.axes.Polar.base(this, 'serialize');
  json['labels'] = this.labels().serialize();
  json['minorLabels'] = this.minorLabels().serialize();
  json['ticks'] = this.ticks().serialize();
  json['minorTicks'] = this.minorTicks().serialize();
  json['stroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke} */(this.stroke()));
  //json['startAngle'] = this.startAngle();
  json['overlapMode'] = this.overlapMode();
  return json;
};


/** @inheritDoc */
anychart.core.axes.Polar.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.axes.Polar.base(this, 'setupByJSON', config, opt_default);
  this.labels().setup(config['labels']);
  this.minorLabels().setup(config['minorLabels']);
  this.ticks(config['ticks']);
  this.minorTicks(config['minorTicks']);
  //this.startAngle(config['startAngle']);
  this.stroke(config['stroke']);
  this.overlapMode(config['overlapMode']);
};


/** @inheritDoc */
anychart.core.axes.Polar.prototype.disposeInternal = function() {
  anychart.core.axes.Polar.base(this, 'disposeInternal');

  delete this.scale_;
  this.labelsBounds_ = null;

  this.title_ = null;

  goog.dispose(this.line_);
  this.line_ = null;

  this.ticks_ = null;
  this.minorTicks_ = null;

  this.pixelBounds_ = null;

  this.labels_ = null;
  this.minorLabels_ = null;
};


//proto['startAngle'] = proto.startAngle;
//exports
(function() {
  var proto = anychart.core.axes.Polar.prototype;
  proto['labels'] = proto.labels;
  proto['minorLabels'] = proto.minorLabels;
  proto['ticks'] = proto.ticks;
  proto['minorTicks'] = proto.minorTicks;
  proto['stroke'] = proto.stroke;
  proto['scale'] = proto.scale;
  proto['overlapMode'] = proto.overlapMode;
  proto['getRemainingBounds'] = proto.getRemainingBounds;
})();
