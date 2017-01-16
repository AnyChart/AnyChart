goog.provide('anychart.core.axes.Radar');
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
goog.require('anychart.scales.Base');



/**
 * Radar axis Class.
 * @constructor
 * @extends {anychart.core.VisualBase}
 * @implements {anychart.core.IStandaloneBackend}
 */
anychart.core.axes.Radar = function() {
  this.suspendSignalsDispatching();
  anychart.core.axes.Radar.base(this, 'constructor');

  this.labelsBounds_ = [];
  this.line_ = acgraph.path();
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
goog.inherits(anychart.core.axes.Radar, anychart.core.VisualBase);


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.axes.Radar.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.AXIS_LABELS |
    anychart.ConsistencyState.AXIS_TICKS;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.axes.Radar.prototype.SUPPORTED_SIGNALS = anychart.core.VisualBase.prototype.SUPPORTED_SIGNALS;


/**
 * @type {acgraph.vector.Path}
 * @private
 */
anychart.core.axes.Radar.prototype.line_ = null;


/**
 * @type {string}
 * @private
 */
anychart.core.axes.Radar.prototype.name_ = 'axis';


/**
 * @type {anychart.core.ui.LabelsFactory}
 * @private
 */
anychart.core.axes.Radar.prototype.labels_ = null;


/**
 * @type {anychart.core.axes.RadialTicks}
 * @private
 */
anychart.core.axes.Radar.prototype.ticks_ = null;


/**
 * @type {string|acgraph.vector.Stroke}
 * @private
 */
anychart.core.axes.Radar.prototype.stroke_;


/**
 * @type {anychart.scales.Base}
 * @private
 */
anychart.core.axes.Radar.prototype.scale_ = null;


/**
 * @type {anychart.core.utils.Bounds}
 * @private
 */
anychart.core.axes.Radar.prototype.pixelBounds_ = null;


/**
 * @type {number}
 * @private
 */
anychart.core.axes.Radar.prototype.radius_ = NaN;


/**
 *
 * @type {number}
 * @private
 */
anychart.core.axes.Radar.prototype.criticalTickLength_ = NaN;


/**
 * @type {number}
 * @private
 */
anychart.core.axes.Radar.prototype.cx_ = NaN;


/**
 * @type {number}
 * @private
 */
anychart.core.axes.Radar.prototype.cy_ = NaN;


/**
 * @type {number}
 * @private
 */
anychart.core.axes.Radar.prototype.startAngle_ = NaN;


/**
 * @type {Array.<anychart.math.Rect>}
 * @private
 */
anychart.core.axes.Radar.prototype.labelsBounds_ = null;


/**
 * @param {(Object|boolean|null)=} opt_value Axis labels.
 * @return {!(anychart.core.ui.LabelsFactory|anychart.core.axes.Radar)} Axis labels of itself for method chaining.
 */
anychart.core.axes.Radar.prototype.labels = function(opt_value) {
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
anychart.core.axes.Radar.prototype.labelsInvalidated_ = function(event) {
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
 * @return {!(anychart.core.axes.RadialTicks|anychart.core.axes.Radar)} Axis ticks or itself for method chaining.
 */
anychart.core.axes.Radar.prototype.ticks = function(opt_value) {
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
anychart.core.axes.Radar.prototype.ticksInvalidated_ = function(event) {
  var state = 0;
  var signal = 0;
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state = this.ALL_VISUAL_STATES_;
    signal = anychart.Signal.BOUNDS_CHANGED | anychart.Signal.NEEDS_REDRAW;
  } else if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state = anychart.ConsistencyState.AXIS_TICKS | anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.BOUNDS;
    signal = anychart.Signal.NEEDS_REDRAW;
  }
  this.invalidate(state, signal);
};


/**
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.core.axes.Radar|acgraph.vector.Stroke|Function} .
 */
anychart.core.axes.Radar.prototype.stroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    opt_strokeOrFill = acgraph.vector.normalizeStroke.apply(null, arguments);
    if (this.stroke_ != opt_strokeOrFill) {
      var thicknessOld = goog.isObject(this.stroke_) ? this.stroke_['thickness'] || 1 : 1;
      var thicknessNew = goog.isObject(opt_strokeOrFill) ? opt_strokeOrFill['thickness'] || 1 : 1;
      this.stroke_ = opt_strokeOrFill;
      if (thicknessNew == thicknessOld)
        this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
      else
        this.invalidate(this.ALL_VISUAL_STATES_, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.stroke_;
  }
};


/**
 * @param {anychart.scales.Base=} opt_value Scale.
 * @return {anychart.scales.Base|!anychart.core.axes.Radar} Axis scale or itself for method chaining.
 */
anychart.core.axes.Radar.prototype.scale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.scale_ != opt_value) {
      this.scale_ = opt_value;
      this.scale_.listenSignals(this.scaleInvalidated_, this);
      this.invalidate(this.ALL_VISUAL_STATES_, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
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
anychart.core.axes.Radar.prototype.scaleInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.dropBoundsCache_();
    this.invalidate(this.ALL_VISUAL_STATES_, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
  }
};


/**
 * @param {(string|number)=} opt_value .
 * @return {(string|number|anychart.core.axes.Radar)} .
 */
anychart.core.axes.Radar.prototype.startAngle = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = goog.math.standardAngle((goog.isNull(opt_value) || isNaN(+opt_value)) ? 0 : +opt_value);
    if (this.startAngle_ != opt_value) {
      this.startAngle_ = opt_value;
      this.invalidate(this.ALL_VISUAL_STATES_, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.startAngle_;
  }
};


/** @inheritDoc */
anychart.core.axes.Radar.prototype.invalidateParentBounds = function() {
  this.invalidate(this.ALL_VISUAL_STATES_, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
};


/**
 * @private
 */
anychart.core.axes.Radar.prototype.dropBoundsCache_ = function() {
  if (this.labelsBoundingRects_) this.labelsBoundingRects_.length = 0;
  this.labelsBounds_.length = 0;
  this.overlappedLabels_ = null;
};


/**
 * Calculate axis bounds, center, radius.
 * @return {anychart.core.utils.Bounds}
 * @private
 */
anychart.core.axes.Radar.prototype.calculateAxisBounds_ = function() {
  if (!this.pixelBounds_ || this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    var parentBounds = this.parentBounds();

    if (parentBounds) {
      this.radius_ = Math.round(Math.min(parentBounds.width, parentBounds.height) / 2);
      this.cx_ = Math.round(parentBounds.left + parentBounds.width / 2);
      this.cy_ = Math.round(parentBounds.top + parentBounds.height / 2);

      var scale = /** @type {anychart.scales.ScatterBase|anychart.scales.Ordinal} */(this.scale());

      if (scale) {
        var delta = 0;
        if (this.enabled()) {
          var i;
          var scaleTicksArr = scale.ticks().get();
          var ticksArrLen = scaleTicksArr.length;

          var startAngle = goog.math.standardAngle(this.startAngle() - 90);
          var angle;

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

          this.dropBoundsCache_();
          this.criticalTickLength_ = NaN;
          var tickVal, ratio;

          for (i = 0; i < ticksArrLen; i++) {
            var x, y, x1, y1, lineThickness, angleRad, radius, tickLen;
            tickVal = scaleTicksArr[i];
            ratio = scale.transform(tickVal);
            angle = goog.math.standardAngle(startAngle + ratio * 360);
            angleRad = angle * Math.PI / 180;
            if (this.labels().enabled()) {
              var labelBounds = this.getLabelBounds_(i);

              x = labelBounds.getLeft();
              y = labelBounds.getTop();
              x1 = labelBounds.getRight();
              y1 = labelBounds.getBottom();
            } else if (this.ticks().enabled()) {
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
            }
            if (isNaN(topExtreme) || y < topExtreme) {
              topExtreme = y;
              topExtremeLabelIndex = i;
              topExtremeAngle = angle;
            }
            if (isNaN(rightExtreme) || x1 > rightExtreme) {
              rightExtreme = x1;
              rightExtremeLabelIndex = i;
              rightExtremeAngle = angle;
            }
            if (isNaN(bottomExtreme) || y1 > bottomExtreme) {
              bottomExtreme = y1;
              bottomExtremeLabelIndex = i;
              bottomExtremeAngle = angle;
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

          if (delta > 0) {
            this.radius_ -= delta;
            if (this.radius_ < 0) {
              this.radius_ = 0;
              var labelSize = 0;
              if (this.labels().enabled()) {
                var extremeLabelIndex = NaN, isHorizontal;
                if (delta == leftDelta) {
                  extremeLabelIndex = leftExtremeLabelIndex;
                  isHorizontal = true;
                } else if (delta == topDelta) {
                  extremeLabelIndex = topExtremeLabelIndex;
                  isHorizontal = false;
                } else if (delta == rightDelta) {
                  extremeLabelIndex = rightExtremeLabelIndex;
                  isHorizontal = true;
                } else if (delta == bottomDelta) {
                  extremeLabelIndex = bottomExtremeLabelIndex;
                  isHorizontal = false;
                }
                var extremeLabelBounds = this.getLabelBounds_(extremeLabelIndex);
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
anychart.core.axes.Radar.prototype.getRemainingBounds = function() {
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
anychart.core.axes.Radar.prototype.getLabelPositionOffsetForAngle_ = function(angle, bounds) {
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
 * Calculate label bounds.
 * @param {number} index Label index.
 * @return {anychart.math.Rect} Label bounds.
 * @private
 */
anychart.core.axes.Radar.prototype.getLabelBounds_ = function(index) {
  var boundsCache = this.labelsBounds_;
  if (goog.isDef(boundsCache[index]))
    return boundsCache[index];

  var lineThickness = this.line_.stroke()['thickness'] ? this.line_.stroke()['thickness'] : 1;
  var ticks = this.ticks();
  var labels = this.labels();
  var scale = /** @type {anychart.scales.ScatterBase|anychart.scales.Ordinal} */(this.scale());
  var scaleTicks = scale.ticks();

  var value = scaleTicks.get()[index];
  var ratio = scale.transform(value);

  var angle = goog.math.standardAngle(this.startAngle() - 90 + ratio * 360);
  var angleRad = angle * Math.PI / 180;
  var tickLen = ticks.enabled() ? isNaN(this.criticalTickLength_) ? this.ticks().length() : this.criticalTickLength_ : 0;
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
 * Line drawer.
 * @param {number} index .
 * @param {number} x .
 * @param {number} y .
 * @private
 */
anychart.core.axes.Radar.prototype.drawLine_ = function(index, x, y) {
  if (!index)
    this.line_.moveTo(x, y);
  else
    this.line_.lineTo(x, y);
};


/**
 * Gets format provider for label.
 * @param {number} index Label index.
 * @param {string|number} value Label value.
 * @return {Object} Labels format provider.
 * @private
 */
anychart.core.axes.Radar.prototype.getLabelsFormatProvider_ = function(index, value) {
  return new anychart.core.utils.AxisLabelsContextProvider(this, index, value);
};


/**
 * Axis labels drawer.
 * @param {number} index Label index.
 * @param {number} x X coordinate.
 * @param {number} y Y coordinate.
 * @private
 */
anychart.core.axes.Radar.prototype.drawLabel_ = function(index, x, y) {
  var scale = /** @type {anychart.scales.Linear|anychart.scales.Ordinal} */(this.scale());
  var scaleTicksArr = scale.ticks().get();

  var formatProvider = this.getLabelsFormatProvider_(index, scaleTicksArr[index]);
  var positionProvider = {'value': {x: x, y: y}};
  this.labels().add(formatProvider, positionProvider, index);
};


/** @inheritDoc */
anychart.core.axes.Radar.prototype.checkDrawingNeeded = function() {
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
 * @return {anychart.core.axes.Radar} An instance of {@link anychart.core.axes.Radar} class for method chaining.
 */
anychart.core.axes.Radar.prototype.draw = function() {
  var scale = /** @type {anychart.scales.Linear|anychart.scales.Ordinal} */(this.scale());

  if (!scale) {
    anychart.core.reporting.error(anychart.enums.ErrorCode.SCALE_NOT_SET);
    return this;
  }

  if (!this.checkDrawingNeeded())
    return this;

  var lineDrawer, ticksDrawer, labelsDrawer;

  this.labels().suspendSignalsDispatching();
  this.ticks().suspendSignalsDispatching();

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    this.line_.clear();
    this.line_.stroke(this.stroke_);

    lineDrawer = this.drawLine_;
    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    var zIndex = /** @type {number} */(this.zIndex());
    this.line_.zIndex(zIndex);
    this.ticks().zIndex(zIndex);
    this.labels().zIndex(zIndex);

    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    var container = /** @type {acgraph.vector.ILayer} */(this.container());
    this.line_.parent(container);
    this.ticks().container(container);
    this.labels().container(container);

    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.AXIS_TICKS)) {
    var ticks = /** @type {anychart.core.axes.RadialTicks} */(this.ticks());
    ticks.draw();

    ticksDrawer = ticks.drawTick;
    this.markConsistent(anychart.ConsistencyState.AXIS_TICKS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.AXIS_LABELS)) {
    var labels = this.labels();
    if (!labels.container()) labels.container(/** @type {acgraph.vector.ILayer} */(this.container()));
    labels.parentBounds(/** @type {anychart.math.Rect} */(this.parentBounds()));
    labels.clear();

    labelsDrawer = this.drawLabel_;
    this.markConsistent(anychart.ConsistencyState.AXIS_LABELS);
  }

  if (goog.isDef(ticksDrawer) || goog.isDef(lineDrawer) || goog.isDef(labelsDrawer)) {
    this.calculateAxisBounds_();
    var i;
    var scaleTicksArr = scale.ticks().get();
    var ticksArrLen = scaleTicksArr.length;
    var startAngle = goog.math.standardAngle(this.startAngle() - 90);
    var tickLen = this.ticks().enabled() ? isNaN(this.criticalTickLength_) ? this.ticks().length() : this.criticalTickLength_ : 0;
    var lineThickness = this.line_.stroke()['thickness'] ? this.line_.stroke()['thickness'] : 1;
    var angle, angleRad, tickVal, ratio;

    for (i = 0; i < ticksArrLen; i++) {
      tickVal = scaleTicksArr[i];
      ratio = scale.transform(tickVal);
      angle = goog.math.standardAngle(startAngle + ratio * 360);
      angleRad = angle * Math.PI / 180;

      if (lineDrawer) {
        var x = Math.round(this.cx_ + this.radius_ * Math.cos(angleRad));
        var y = Math.round(this.cy_ + this.radius_ * Math.sin(angleRad));

        lineDrawer.call(this, i, x, y);
      }

      if (ticksDrawer || labelsDrawer) {
        var ticksThickness = this.ticks().stroke()['thickness'] ? parseFloat(this.ticks().stroke()['thickness']) : 1;
        var xPixelShift = 0;
        var yPixelShift = 0;
        if (!angle) {
          yPixelShift = ticksThickness % 2 == 0 ? 0 : -.5;
        } else if (angle == 90) {
          xPixelShift = ticksThickness % 2 == 0 ? 0 : -.5;
        } else if (angle == 180) {
          yPixelShift = ticksThickness % 2 == 0 ? 0 : .5;
        } else if (angle == 270) {
          xPixelShift = ticksThickness % 2 == 0 ? 0 : .5;
        }

        var halfThickness = Math.floor(lineThickness / 2);

        var radius = this.radius_ + halfThickness;
        var x0Ticks = Math.round(this.cx_ + radius * Math.cos(angleRad)) + xPixelShift;
        var y0Ticks = Math.round(this.cy_ + radius * Math.sin(angleRad)) + yPixelShift;

        radius = this.radius_ + tickLen + halfThickness;
        var x1Ticks = Math.round(this.cx_ + radius * Math.cos(angleRad)) + xPixelShift;
        var y1Ticks = Math.round(this.cy_ + radius * Math.sin(angleRad)) + yPixelShift;

        if (ticksDrawer) ticksDrawer.call(ticks, x0Ticks, y0Ticks, x1Ticks, y1Ticks);
        if (labelsDrawer) {
          var offset = this.getLabelPositionOffsetForAngle_(angle, this.getLabelBounds_(i));
          labelsDrawer.call(this, i, x1Ticks + offset.x, y1Ticks + offset.y);
        }
      }
    }
    if (i != 0) this.line_.close();
    this.labels().draw();
  }

  this.labels().resumeSignalsDispatching(false);
  this.ticks().resumeSignalsDispatching(false);

  return this;
};


/** @inheritDoc */
anychart.core.axes.Radar.prototype.remove = function() {
  if (this.line_) this.line_.parent(null);
  this.ticks().remove();
  if (this.labels_) this.labels_.remove();
};


/** @inheritDoc */
anychart.core.axes.Radar.prototype.serialize = function() {
  var json = anychart.core.axes.Radar.base(this, 'serialize');
  json['labels'] = this.labels().serialize();
  json['ticks'] = this.ticks().serialize();
  //json['startAngle'] = this.startAngle();
  json['stroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke} */(this.stroke()));
  return json;
};


/** @inheritDoc */
anychart.core.axes.Radar.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.axes.Radar.base(this, 'setupByJSON', config, opt_default);
  //this.startAngle(config['startAngle']);
  this.labels().setup(config['labels']);
  this.ticks(config['ticks']);
  this.stroke(config['stroke']);
};


/** @inheritDoc */
anychart.core.axes.Radar.prototype.disposeInternal = function() {
  anychart.core.axes.Radar.base(this, 'disposeInternal');

  delete this.scale_;
  this.labelsBounds_ = null;

  this.title_ = null;

  goog.dispose(this.line_);
  this.line_ = null;

  this.ticks_ = null;

  this.pixelBounds_ = null;

  this.labels_ = null;
};


//proto['startAngle'] = proto.startAngle;
//exports
(function() {
  var proto = anychart.core.axes.Radar.prototype;
  proto['labels'] = proto.labels;
  proto['ticks'] = proto.ticks;
  proto['stroke'] = proto.stroke;
  proto['scale'] = proto.scale;
  proto['getRemainingBounds'] = proto.getRemainingBounds;
})();
