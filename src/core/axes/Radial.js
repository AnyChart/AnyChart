goog.provide('anychart.core.axes.Radial');
goog.require('acgraph');
goog.require('anychart.color');
goog.require('anychart.core.IStandaloneBackend');
goog.require('anychart.core.VisualBase');
goog.require('anychart.core.axes.RadialTicks');
goog.require('anychart.core.reporting');
goog.require('anychart.core.ui.LabelsFactory');
goog.require('anychart.core.utils.AxisLabelsContextProvider');
goog.require('anychart.enums');
goog.require('anychart.math.Rect');
goog.require('anychart.scales');



/**
 * Axis Class.<br/>
 * Any axis must be bound to a scale.<br/>
 * To obtain a new instance of Axis use {@link anychart.axes.linear}.
 * @example <t>simple-h100</t>
 * anychart.axes.linear()
 *    .scale(anychart.scales.linear())
 *    .container(stage).draw();
 * @constructor
 * @extends {anychart.core.VisualBase}
 * @implements {anychart.core.IStandaloneBackend}
 */
anychart.core.axes.Radial = function() {
  this.suspendSignalsDispatching();
  anychart.core.axes.Radial.base(this, 'constructor');

  this.labelsBounds_ = [];
  this.minorLabelsBounds_ = [];

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
      anychart.ConsistencyState.BOUNDS |
      anychart.ConsistencyState.AXIS_OVERLAP;
  this.resumeSignalsDispatching(false);
};
goog.inherits(anychart.core.axes.Radial, anychart.core.VisualBase);


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.axes.Radial.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.AXIS_LABELS |
    anychart.ConsistencyState.AXIS_TICKS |
    anychart.ConsistencyState.AXIS_OVERLAP;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.axes.Radial.prototype.SUPPORTED_SIGNALS = anychart.core.VisualBase.prototype.SUPPORTED_SIGNALS;


/**
 * @type {acgraph.vector.Path}
 * @private
 */
anychart.core.axes.Radial.prototype.line_ = null;


/**
 * @type {string}
 * @private
 */
anychart.core.axes.Radial.prototype.name_ = 'axis';


/**
 * @type {anychart.core.ui.LabelsFactory}
 * @private
 */
anychart.core.axes.Radial.prototype.labels_ = null;


/**
 * @type {anychart.core.ui.LabelsFactory}
 * @private
 */
anychart.core.axes.Radial.prototype.minorLabels_ = null;


/**
 * @type {anychart.core.axes.RadialTicks}
 * @private
 */
anychart.core.axes.Radial.prototype.ticks_ = null;


/**
 * @type {anychart.core.axes.RadialTicks}
 * @private
 */
anychart.core.axes.Radial.prototype.minorTicks_ = null;


/**
 * @type {string|acgraph.vector.Stroke}
 * @private
 */
anychart.core.axes.Radial.prototype.stroke_;


/**
 * @type {anychart.scales.Base}
 * @private
 */
anychart.core.axes.Radial.prototype.scale_ = null;


/**
 * @type {anychart.enums.LabelsOverlapMode}
 * @private
 */
anychart.core.axes.Radial.prototype.overlapMode_ = anychart.enums.LabelsOverlapMode.NO_OVERLAP;


/**
 * @type {number}
 * @private
 */
anychart.core.axes.Radial.prototype.length_ = NaN;


/**
 * @type {boolean}
 * @private
 */
anychart.core.axes.Radial.prototype.drawFirstLabel_ = true;


/**
 * @type {boolean}
 * @private
 */
anychart.core.axes.Radial.prototype.drawLastLabel_ = true;


/**
 * @type {Array.<Array.<number>>}
 * @private
 */
anychart.core.axes.Radial.prototype.labelsBounds_ = null;


/**
 * @type {Array.<Array.<number>>}
 * @private
 */
anychart.core.axes.Radial.prototype.minorLabelsBounds_ = null;


/**
 * Getter/setter for labels.
 * @param {(Object|boolean|null)=} opt_value Axis labels.
 * @return {!(anychart.core.ui.LabelsFactory|anychart.core.axes.Radial)} Axis labels of itself for method chaining.
 */
anychart.core.axes.Radial.prototype.labels = function(opt_value) {
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
anychart.core.axes.Radial.prototype.labelsInvalidated_ = function(event) {
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
 * Getter/setter for minorLabels.
 * @param {(Object|boolean|null)=} opt_value Axis labels.
 * @return {!(anychart.core.ui.LabelsFactory|anychart.core.axes.Radial)} Axis labels of itself for method chaining.
 */
anychart.core.axes.Radial.prototype.minorLabels = function(opt_value) {
  if (!this.minorLabels_) {
    this.minorLabels_ = new anychart.core.ui.LabelsFactory();
    this.minorLabels_.setParentEventTarget(this);
    this.minorLabels_.listenSignals(this.minorLabelsInvalidated_, this);
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
 * Internal minor label invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.axes.Radial.prototype.minorLabelsInvalidated_ = function(event) {
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
 * Getter/setter for ticks.
 * @param {(Object|boolean|null)=} opt_value Axis ticks.
 * @return {!(anychart.core.axes.RadialTicks|anychart.core.axes.Radial)} Axis ticks or itself for method chaining.
 */
anychart.core.axes.Radial.prototype.ticks = function(opt_value) {
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
anychart.core.axes.Radial.prototype.ticksInvalidated_ = function(event) {
  var state = 0;
  var signal = 0;
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state = this.ALL_VISUAL_STATES_;
    signal = anychart.Signal.BOUNDS_CHANGED | anychart.Signal.NEEDS_REDRAW;
  } else if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state = anychart.ConsistencyState.AXIS_TICKS | anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.BOUNDS;
    signal = anychart.Signal.NEEDS_REDRAW;
  }
  this.dropBoundsCache_();
  this.invalidate(state, signal);
};


/**
 * Getter/setter for minorTicks.
 * @param {(Object|boolean|null)=} opt_value Axis ticks.
 * @return {!(anychart.core.axes.RadialTicks|anychart.core.axes.Radial)} Axis ticks or itself for method chaining.
 */
anychart.core.axes.Radial.prototype.minorTicks = function(opt_value) {
  if (!this.minorTicks_) {
    this.minorTicks_ = new anychart.core.axes.RadialTicks();
    this.minorTicks_.setParentEventTarget(this);
    this.minorTicks_.listenSignals(this.minorTicksInvalidated_, this);
    this.registerDisposable(this.minorTicks_);
  }

  if (goog.isDef(opt_value)) {
    this.minorTicks_.setup(opt_value);
    return this;
  }
  return this.minorTicks_;
};


/**
 * Internal minor ticks invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.axes.Radial.prototype.minorTicksInvalidated_ = function(event) {
  var state = 0;
  var signal = 0;
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state = this.ALL_VISUAL_STATES_;
    signal = anychart.Signal.BOUNDS_CHANGED | anychart.Signal.NEEDS_REDRAW;
  } else if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state = anychart.ConsistencyState.AXIS_TICKS;
    signal = anychart.Signal.NEEDS_REDRAW;
  }
  this.dropBoundsCache_();
  this.invalidate(state, signal);
};


/**
 * Getter/setter for stroke.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.core.axes.Radial|acgraph.vector.Stroke|Function} .
 */
anychart.core.axes.Radial.prototype.stroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
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
 * Getter/setter for scale.
 * @param {anychart.scales.Base=} opt_value Scale.
 * @return {anychart.scales.Base|!anychart.core.axes.Radial} Axis scale or itself for method chaining.
 */
anychart.core.axes.Radial.prototype.scale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.scale_ != opt_value) {
      this.scale_ = opt_value;
      this.scale_.listenSignals(this.scaleInvalidated_, this);
      this.dropBoundsCache_();
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
anychart.core.axes.Radial.prototype.scaleInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.dropBoundsCache_();
    this.invalidate(this.ALL_VISUAL_STATES_, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
  }
};


/** @inheritDoc */
anychart.core.axes.Radial.prototype.invalidateParentBounds = function() {
  this.invalidate(this.ALL_VISUAL_STATES_, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
};


/**
 * @param {(string|number)=} opt_value .
 * @return {(string|number|anychart.core.axes.Radial)} .
 */
anychart.core.axes.Radial.prototype.startAngle = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = goog.math.standardAngle((goog.isNull(opt_value) || isNaN(+opt_value)) ? 0 : +opt_value);
    if (this.startAngle_ != opt_value) {
      this.startAngle_ = opt_value;
      this.dropBoundsCache_();
      this.invalidate(this.ALL_VISUAL_STATES_, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.startAngle_;
  }
};


/**
 * @private
 */
anychart.core.axes.Radial.prototype.dropBoundsCache_ = function() {
  if (this.labelsBoundingRects_) this.labelsBoundingRects_.length = 0;
  this.labelsBounds_.length = 0;
  this.minorLabelsBounds_.length = 0;
  this.overlappedLabels_ = null;
};


/**
 * Returns an object with indexes of labels to draw.
 * @param {anychart.math.Rect=} opt_bounds Parent bounds.
 * @return {boolean|Object.<string, Array.<boolean>>} Object with indexes of labels to draw.
 * or Boolean when there are no labels.
 * @private
 */
anychart.core.axes.Radial.prototype.getOverlappedLabels_ = function(opt_bounds) {
  if (!this.overlappedLabels_ || this.hasInvalidationState(anychart.ConsistencyState.AXIS_OVERLAP)) {
    if (this.overlapMode_ == anychart.enums.LabelsOverlapMode.ALLOW_OVERLAP) {
      return false;
    } else {
      var scale = /** @type {anychart.scales.ScatterBase|anychart.scales.Ordinal} */(this.scale());
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
                bounds1 = this.getLabelBounds_(k, true);

                if (prevDrawableLabel != -1)
                  bounds2 = this.getLabelBounds_(prevDrawableLabel, true);

                if (k != ticksArrLen - 1 && this.drawLastLabel())
                  bounds3 = this.getLabelBounds_(ticksArrLen - 1, true);

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
                  if ((tempRatio <= 0 && this.drawFirstLabel()) || (tempRatio >= 1 && this.drawLastLabel())) {
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
        } else if (scale instanceof anychart.scales.Ordinal) {
          for (i = 0; i < ticksArrLen; i++) {
            if (isLabels) {
              bounds1 = this.getLabelBounds_(i, true);

              if (prevDrawableLabel != -1)
                bounds2 = this.getLabelBounds_(prevDrawableLabel, true);

              if (i != ticksArrLen - 1 && this.drawLastLabel())
                bounds3 = this.getLabelBounds_(ticksArrLen - 1, true);
              else
                bounds3 = null;

              if (!i) {
                if (this.drawFirstLabel()) {
                  prevDrawableLabel = i;
                  labels.push(true);
                } else {
                  labels.push(false);
                }
              } else if (i == ticksArrLen - 1) {
                if (this.drawLastLabel()) {
                  prevDrawableLabel = i;
                  labels.push(true);
                } else {
                  labels.push(false);
                }
              } else if (!(anychart.math.checkRectIntersection(bounds1, bounds2) ||
                  anychart.math.checkRectIntersection(bounds1, bounds3))) {
                prevDrawableLabel = i;
                labels.push(true);
              } else {
                labels.push(false);
              }
            } else {
              labels.push(false);
            }
          }
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
 * Calculate labels to draw.
 * @param {anychart.math.Rect=} opt_bounds Parent bounds.
 * @return {boolean|Object.<string, boolean|Array.<boolean>>} Object with indexes of labels to draw.
 * or Boolean when there are no labels.
 * @private
 */
anychart.core.axes.Radial.prototype.calcLabels_ = function(opt_bounds) {
  return this.getOverlappedLabels_(opt_bounds);
};


/**
 * Axis calculation.
 * @private
 */
anychart.core.axes.Radial.prototype.calculateAxis_ = function() {
  var parentBounds = this.parentBounds();
  this.length_ = Math.min(parentBounds.width, parentBounds.height) / 2;
  this.cx_ = Math.round(parentBounds.left + parentBounds.width / 2);
  this.cy_ = Math.round(parentBounds.top + parentBounds.height / 2);
};


/**
 * Calculate label bounds.
 * @param {number} index Label index.
 * @param {boolean} isMajor Major labels or minor.
 * @return {Array.<number>} Label bounds.
 * @private
 */
anychart.core.axes.Radial.prototype.getLabelBounds_ = function(index, isMajor) {
  var boundsCache = isMajor ? this.labelsBounds_ : this.minorLabelsBounds_;
  if (goog.isDef(boundsCache[index]))
    return boundsCache[index];

  var ticks = isMajor ? this.ticks() : this.minorTicks();
  var ticksLength = ticks.length();
  var lineThickness = this.stroke()['thickness'] ? this.stroke()['thickness'] : 1;
  var halfThickness = Math.floor(lineThickness / 2);
  var labels = isMajor ? this.labels() : this.minorLabels();

  var scale = /** @type {anychart.scales.ScatterBase|anychart.scales.Ordinal} */(this.scale());
  var scaleTicks = isMajor ? scale.ticks() : scale.minorTicks();

  var value = scaleTicks.get()[index];
  var ratio;
  if (goog.isArray(value)) {
    ratio = (scale.transform(value[0], 0) + scale.transform(value[1], 1)) / 2;
    value = value[0];
  } else {
    ratio = scale.transform(value, .5);
  }

  var radius = this.length_ * ratio;
  var angle = goog.math.standardAngle(this.startAngle() - 90);
  var angleRad = goog.math.toRadians(angle);

  var x = this.cx_ + radius * Math.cos(angleRad);
  var y = this.cy_ + radius * Math.sin(angleRad);

  var angle_ = goog.math.toRadians(goog.math.standardAngle(90 - angle - 270));

  var dx = (ticksLength + halfThickness) * Math.sin(angle_);
  var dy = (ticksLength + halfThickness) * Math.cos(angle_);

  var xTick = x + dx;
  var yTick = y + dy;

  var formatProvider = this.getLabelsFormatProvider_(index, value);
  var positionProvider = {'value': {'x': xTick, 'y': yTick}};
  var labelBounds = labels.measure(formatProvider, positionProvider, undefined, index);

  var offset = this.getLabelPositionOffsetForAngle_(goog.math.standardAngle(angle + 90), labelBounds);
  labelBounds.left += offset.x + labelBounds.width / 2;
  labelBounds.top += offset.y + labelBounds.height / 2;

  positionProvider['value']['x'] = labelBounds.left;
  positionProvider['value']['y'] = labelBounds.top;

  return boundsCache[index] = labels.measureWithTransform(formatProvider, positionProvider, undefined, index);
};


/**
 * Returns labels anchor for angle.
 * @param {number} angle .
 * @param {anychart.math.Rect} bounds .
 * @return {{x: number, y: number}} .
 * @private
 */
anychart.core.axes.Radial.prototype.getLabelPositionOffsetForAngle_ = function(angle, bounds) {
  var width = bounds.width, height = bounds.height;

  var scale = this.scale();
  var offset = {x: 0, y: 0};
  if (scale instanceof anychart.scales.ScatterBase) {
    if (!angle) {
      offset.x -= width / 2;
    } else if (angle > 0 && angle < 90) {
      offset.x -= width / 2;
      offset.y -= height / 2;
    } else if (angle == 90) {
      offset.y -= height / 2;
    } else if (angle > 90 && angle < 180) {
      offset.y -= height / 2;
      offset.x += width / 2;
    } else if (angle == 180) {
      offset.x += width / 2;
    } else if (angle > 180 && angle < 270) {
      offset.y += height / 2;
      offset.x += width / 2;
    } else if (angle == 270) {
      offset.y += height / 2;
    } else if (angle > 270) {
      offset.y += height / 2;
      offset.x -= width / 2;
    }
  } else if (scale instanceof anychart.scales.Ordinal) {
    if (!angle) {
      offset.x -= width / 2;
    } else if (angle > 0 && angle < 45) {
      offset.x -= width / 2;
    } else if (angle == 45) {
      offset.x -= width / 2;
      offset.y -= height / 2;
    } else if (angle > 45 && angle < 90) {
      offset.y -= height / 2;
    } else if (angle == 90) {
      offset.y -= height / 2;
    } else if (angle > 90 && angle < 135) {
      offset.y -= height / 2;
    } else if (angle == 135) {
      offset.y -= height / 2;
      offset.x += width / 2;
    } else if (angle > 135 && angle < 180) {
      offset.x += width / 2;
    } else if (angle == 180) {
      offset.x += width / 2;
    } else if (angle > 180 && angle < 225) {
      offset.x += width / 2;
    } else if (angle == 225) {
      offset.y += height / 2;
      offset.x += width / 2;
    } else if (angle > 225 && angle < 270) {
      offset.y += height / 2;
    } else if (angle == 270) {
      offset.y += height / 2;
    } else if (angle > 270 && angle < 315) {
      offset.y += height / 2;
    } else if (angle == 315) {
      offset.y += height / 2;
      offset.x -= width / 2;
    } else if (angle > 315) {
      offset.x -= width / 2;
    }
  }

  return offset;
};


/**
 * Getter/setter for drawFirstLabel.
 * @param {boolean=} opt_value Drawing flag.
 * @return {boolean|anychart.core.axes.Radial} Drawing flag or itself for method chaining.
 */
anychart.core.axes.Radial.prototype.drawFirstLabel = function(opt_value) {
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
 * Getter/setter for drawLastLabel.
 * @param {boolean=} opt_value Drawing flag.
 * @return {boolean|anychart.core.axes.Radial} Drawing flag or itself for method chaining.
 */
anychart.core.axes.Radial.prototype.drawLastLabel = function(opt_value) {
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
 * Getter/setter for overlapMode.
 * @param {(anychart.enums.LabelsOverlapMode|string)=} opt_value Value to set.
 * @return {anychart.enums.LabelsOverlapMode|string|anychart.core.axes.Radial} Drawing flag or itself for method chaining.
 */
anychart.core.axes.Radial.prototype.overlapMode = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var overlap = anychart.enums.normalizeLabelsOverlapMode(opt_value, this.overlapMode_);
    if (this.overlapMode_ != overlap) {
      this.overlapMode_ = overlap;
      this.invalidate(this.ALL_VISUAL_STATES_, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.overlapMode_;
};


/**
 * Axis line drawer.
 * @private
 */
anychart.core.axes.Radial.prototype.drawLine_ = function() {
  var angle = goog.math.standardAngle(this.startAngle() - 90);
  var angleRad = goog.math.toRadians(angle);

  var xPixelShift = 0;
  var yPixelShift = 0;

  var lineThickness = this.stroke()['thickness'] ? parseFloat(this.stroke()['thickness']) : 1;
  if (!angle) {
    yPixelShift = lineThickness % 2 == 0 ? 0 : -.5;
  } else if (angle == 90) {
    xPixelShift = lineThickness % 2 == 0 ? 0 : -.5;
  } else if (angle == 180) {
    yPixelShift = lineThickness % 2 == 0 ? 0 : .5;
  } else if (angle == 270) {
    xPixelShift = lineThickness % 2 == 0 ? 0 : .5;
  }

  var x, y;
  x = this.cx_ + this.length_ * Math.cos(angleRad);
  y = this.cy_ + this.length_ * Math.sin(angleRad);

  //if (angle == 180) {
  //  x = Math.floor(x);
  //  y = Math.floor(y);
  //} else {
  x = Math.round(x);
  y = Math.round(y);
  //}

  this.line_
      .moveTo(this.cx_ + xPixelShift, this.cy_ + yPixelShift)
      .lineTo(x + xPixelShift, y + yPixelShift);
};


/**
 * Ticks drawer.
 * @param {number} ratio Ratio.
 * @param {boolean} isMajor Is major label.
 * @private
 */
anychart.core.axes.Radial.prototype.drawTick_ = function(ratio, isMajor) {
  var angle = goog.math.standardAngle(this.startAngle() - 90);
  var angleRad = goog.math.toRadians(angle);
  var ticks = isMajor ? this.ticks() : this.minorTicks();
  var ticksLength = ticks.length();

  var ticksThickness = ticks.stroke()['thickness'] ? parseFloat(ticks.stroke()['thickness']) : 1;
  var lineThickness = this.stroke()['thickness'] ? parseFloat(this.stroke()['thickness']) : 1;

  var xPixelShift = 0;
  var yPixelShift = 0;

  if (!angle) {
    xPixelShift = ticksThickness % 2 == 0 ? 0 : -.5;
  } else if (angle == 90) {
    yPixelShift = ticksThickness % 2 == 0 ? 0 : -.5;
  } else if (angle == 180) {
    xPixelShift = ticksThickness % 2 == 0 ? 0 : .5;
  } else if (angle == 270) {
    yPixelShift = ticksThickness % 2 == 0 ? 0 : .5;
  }

  if (!ratio) {
    xPixelShift *= -1;
    yPixelShift *= -1;
  }

  var radius = this.length_ * ratio;

  var x = this.cx_ + radius * Math.cos(angleRad);
  var y = this.cy_ + radius * Math.sin(angleRad);

  if (angle == 180) {
    x = Math.floor(x);
    y = Math.floor(y);
  } else {
    x = Math.ceil(x);
    y = Math.ceil(y);
  }

  var angle_ = goog.math.toRadians(goog.math.standardAngle(90 - angle - 270));

  var dx, dy;

  var halfThickness = Math.floor(lineThickness / 2);

  dx = halfThickness * Math.sin(angle_);
  dy = halfThickness * Math.cos(angle_);

  var xStart = x + dx + xPixelShift;
  var yStart = y + dy + yPixelShift;

  dx = ticksLength * Math.sin(angle_);
  dy = ticksLength * Math.cos(angle_);

  var xEnd = xStart + dx;
  var yEnd = yStart + dy;

  ticks.drawTick(xStart, yStart, xEnd, yEnd);
};


/**
 * Axis labels drawer.
 * @param {number} index Scale label index.
 * @param {boolean} isMajor Is major label.
 * @private
 */
anychart.core.axes.Radial.prototype.drawLabel_ = function(index, isMajor) {
  var ticks, labels;
  var scale = /** @type {anychart.scales.ScatterBase|anychart.scales.Ordinal} */(this.scale());
  if (isMajor) {
    ticks = scale.ticks();
    labels = this.labels();
  } else {
    ticks = scale.minorTicks();
    labels = this.minorLabels();
  }
  var scaleTicksArr = ticks.get();

  var formatProvider = this.getLabelsFormatProvider_(index, scaleTicksArr[index]);
  var bounds = anychart.math.Rect.fromCoordinateBox(this.getLabelBounds_(index, isMajor));

  var x = bounds.left + bounds.width / 2;
  var y = bounds.top + bounds.height / 2;

  var positionProvider = {'value': {x: x, y: y}};
  labels.add(formatProvider, positionProvider, index);
};


/**
 * Gets format provider for label.
 * @param {number} index Label index.
 * @param {string|number} value Label value.
 * @return {Object} Labels format provider.
 * @private
 */
anychart.core.axes.Radial.prototype.getLabelsFormatProvider_ = function(index, value) {
  return new anychart.core.utils.AxisLabelsContextProvider(this, index, value);
};


/** @inheritDoc */
anychart.core.axes.Radial.prototype.checkDrawingNeeded = function() {
  if (this.isConsistent())
    return false;

  if (!this.enabled()) {
    if (this.hasInvalidationState(anychart.ConsistencyState.ENABLED)) {
      this.remove();
      this.markConsistent(anychart.ConsistencyState.ENABLED);
      this.ticks().invalidate(anychart.ConsistencyState.CONTAINER);
      this.minorTicks().invalidate(anychart.ConsistencyState.CONTAINER);
      this.labels().invalidate(anychart.ConsistencyState.CONTAINER);
      this.minorLabels().invalidate(anychart.ConsistencyState.CONTAINER);
      this.invalidate(
          anychart.ConsistencyState.CONTAINER |
          anychart.ConsistencyState.AXIS_TITLE |
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
 * @return {anychart.core.axes.Radial} An instance of {@link anychart.core.axes.Radial} class for method chaining.
 */
anychart.core.axes.Radial.prototype.draw = function() {
  var scale = /** @type {anychart.scales.ScatterBase|anychart.scales.Ordinal} */(this.scale());

  if (!scale) {
    anychart.core.reporting.error(anychart.enums.ErrorCode.SCALE_NOT_SET);
    return this;
  }

  if (!this.checkDrawingNeeded())
    return this;

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.dropBoundsCache_();
    this.calculateAxis_();
  }

  var lineDrawer, ticksDrawer, minorTicksDrawer, labelsDrawer, minorLabelsDrawer;
  var minorTicks, ticks;

  this.labels().suspendSignalsDispatching();
  this.minorLabels().suspendSignalsDispatching();
  this.ticks().suspendSignalsDispatching();
  this.minorTicks().suspendSignalsDispatching();

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
    this.minorTicks().zIndex(zIndex);
    this.labels().zIndex(zIndex);
    this.minorLabels().zIndex(zIndex);
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

  if (this.hasInvalidationState(anychart.ConsistencyState.AXIS_TICKS)) {
    ticks = this.ticks();
    ticks.draw();
    ticksDrawer = ticks.drawTick;

    minorTicks = this.minorTicks();
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

  if (lineDrawer) lineDrawer.call(this);
  var i, j, overlappedLabels, needDrawLabels, needDrawMinorLabels;
  var scaleTicksArr = scale.ticks().get();
  var ticksArrLen = scaleTicksArr.length;
  var tickVal, ratio, drawLabel, drawTick;

  if (scale instanceof anychart.scales.ScatterBase) {
    if (ticksDrawer || labelsDrawer || minorTicksDrawer || minorLabelsDrawer) {
      overlappedLabels = this.calcLabels_();

      if (goog.isObject(overlappedLabels)) {
        needDrawLabels = overlappedLabels.labels;
        needDrawMinorLabels = overlappedLabels.minorLabels;
      } else {
        needDrawLabels = !overlappedLabels;
        needDrawMinorLabels = !overlappedLabels;
      }

      var scaleMinorTicksArr = scale.minorTicks().get();

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
          drawLabel = goog.isArray(needDrawLabels) ? needDrawLabels[i] : needDrawLabels;
          drawTick = (goog.isArray(needDrawLabels) && needDrawLabels[i]) || goog.isBoolean(needDrawLabels);

          if (drawTick && ticksDrawer)
            this.drawTick_(ratio, true);

          if (drawLabel)
            labelsDrawer.call(this, i, true);

          prevMajorRatio = ratio;
          i++;
        } else {
          drawLabel = goog.isArray(needDrawMinorLabels) ? needDrawMinorLabels[j] : needDrawMinorLabels;
          drawTick = (goog.isArray(needDrawMinorLabels) && needDrawMinorLabels[j]) || goog.isBoolean(needDrawMinorLabels);

          if (drawTick && minorTicksDrawer && prevMajorRatio != minorRatio)
            this.drawTick_(minorRatio, false);

          if (drawLabel && minorLabelsDrawer && prevMajorRatio != minorRatio)
            labelsDrawer.call(this, j, false);
          j++;
        }
      }
      if (minorLabelsDrawer) this.minorLabels().draw();
    }
  } else if (scale instanceof anychart.scales.Ordinal) {
    if (ticksDrawer || labelsDrawer) {
      var labelsStates = this.calcLabels_();
      needDrawLabels = goog.isObject(labelsStates) ? labelsStates.labels : !overlappedLabels;

      for (i = 0; i < ticksArrLen; i++) {
        tickVal = scaleTicksArr[i];
        var leftTick, rightTick, labelPosition;
        if (goog.isArray(tickVal)) {
          leftTick = tickVal[0];
          rightTick = tickVal[1];
          labelPosition = (scale.transform(tickVal[0], 0) + scale.transform(tickVal[1], 1)) / 2;
        } else {
          leftTick = rightTick = tickVal;
          labelPosition = scale.transform(tickVal, .5);
        }
        ratio = scale.transform(leftTick, 0);

        if (ticksDrawer) {
          this.drawTick_(ratio, true);

          if (i == ticksArrLen - 1) {
            ratio = scale.transform(leftTick, 1);
            this.drawTick_(ratio, true);
          }

          drawLabel = goog.isArray(needDrawLabels) ? needDrawLabels[i] : needDrawLabels;
          if (labelsDrawer && drawLabel) {
            labelsDrawer.call(this, i, true);
          }
        }
      }
    }
  }
  if (labelsDrawer) this.labels().draw();

  this.labels().resumeSignalsDispatching(false);
  this.minorLabels().resumeSignalsDispatching(false);
  this.ticks().resumeSignalsDispatching(false);
  this.minorTicks().resumeSignalsDispatching(false);

  return this;
};


/** @inheritDoc */
anychart.core.axes.Radial.prototype.remove = function() {
  if (this.line_) this.line_.parent(null);
  this.ticks().remove();
  this.minorTicks().remove();
  if (this.labels_) this.labels_.remove();
  if (this.minorLabels_) this.minorLabels_.remove();
};


/** @inheritDoc */
anychart.core.axes.Radial.prototype.serialize = function() {
  var json = anychart.core.axes.Radial.base(this, 'serialize');
  json['labels'] = this.labels().serialize();
  json['minorLabels'] = this.minorLabels().serialize();
  json['ticks'] = this.ticks().serialize();
  json['minorTicks'] = this.minorTicks().serialize();
  json['stroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke} */(this.stroke()));
  //json['startAngle'] = this.startAngle();
  json['drawFirstLabel'] = this.drawFirstLabel();
  json['drawLastLabel'] = this.drawLastLabel();
  json['overlapMode'] = this.overlapMode();
  return json;
};


/** @inheritDoc */
anychart.core.axes.Radial.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.axes.Radial.base(this, 'setupByJSON', config, opt_default);
  this.labels().setup(config['labels']);
  this.minorLabels().setup(config['minorLabels']);
  this.ticks(config['ticks']);
  this.minorTicks(config['minorTicks']);
  this.stroke(config['stroke']);
  //this.startAngle(config['startAngle']);
  this.drawFirstLabel(config['drawFirstLabel']);
  this.drawLastLabel(config['drawLastLabel']);
  this.overlapMode(config['overlapMode']);
};


/** @inheritDoc */
anychart.core.axes.Radial.prototype.disposeInternal = function() {
  anychart.core.axes.Radial.base(this, 'disposeInternal');

  delete this.scale_;
  this.labelsBounds_ = null;
  this.minorLabelsBounds_ = null;

  goog.dispose(this.line_);
  this.line_ = null;

  this.ticks_ = null;

  this.minorTicks_ = null;

  this.labels_ = null;
  this.minorLabels_ = null;
};


//proto['startAngle'] = proto.startAngle;
//exports
(function() {
  var proto = anychart.core.axes.Radial.prototype;
  proto['labels'] = proto.labels;
  proto['minorLabels'] = proto.minorLabels;
  proto['ticks'] = proto.ticks;
  proto['minorTicks'] = proto.minorTicks;
  proto['stroke'] = proto.stroke;
  proto['scale'] = proto.scale;
  proto['drawFirstLabel'] = proto.drawFirstLabel;
  proto['drawLastLabel'] = proto.drawLastLabel;
  proto['overlapMode'] = proto.overlapMode;
})();
