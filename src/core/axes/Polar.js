goog.provide('anychart.core.axes.Polar');
goog.require('acgraph');
goog.require('anychart.color');
goog.require('anychart.core.IStandaloneBackend');
goog.require('anychart.core.VisualBase');
goog.require('anychart.core.axes.RadialTicks');
goog.require('anychart.core.reporting');
goog.require('anychart.core.ui.CircularLabelsFactory');
goog.require('anychart.core.utils.Bounds');
goog.require('anychart.enums');
goog.require('anychart.format.Context');
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
  this.bg_ = acgraph.path();
  this.line_ = acgraph.path();
  this.bindHandlersToGraphics(this.bg_);
  this.bindHandlersToGraphics(this.line_);

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
 * @type {acgraph.vector.Path}
 * @private
 */
anychart.core.axes.Polar.prototype.line_ = null;


/**
 * @type {acgraph.vector.Path}
 * @private
 */
anychart.core.axes.Polar.prototype.bg_ = null;


/**
 * @type {string}
 * @private
 */
anychart.core.axes.Polar.prototype.name_ = 'axis';


/**
 * @type {anychart.core.ui.CircularLabelsFactory}
 * @private
 */
anychart.core.axes.Polar.prototype.labels_ = null;


/**
 * @type {anychart.core.axes.RadialTicks}
 * @private
 */
anychart.core.axes.Polar.prototype.ticks_ = null;


/**
 * @type {anychart.core.ui.CircularLabelsFactory}
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
 * @type {anychart.scales.Base}
 * @private
 */
anychart.core.axes.Polar.prototype.scale_ = null;


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
 * @type {Array.<Array.<number>>}
 * @private
 */
anychart.core.axes.Polar.prototype.labelsBounds_ = null;


/**
 * @type {Array.<Array.<number>>}
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
 * Drops labels calls cache.
 */
anychart.core.axes.Polar.prototype.dropLabelCallsCache = function() {
  if (this.labels_)
    this.labels_.dropCallsCache();
  if (this.minorLabels_)
    this.minorLabels_.dropCallsCache();
};


/**
 * @param {(Object|boolean|null)=} opt_value Axis labels.
 * @return {!(anychart.core.ui.CircularLabelsFactory|anychart.core.axes.Polar)} Axis labels of itself for method chaining.
 */
anychart.core.axes.Polar.prototype.minorLabels = function(opt_value) {
  if (!this.minorLabels_) {
    this.minorLabels_ = new anychart.core.ui.CircularLabelsFactory();
    this.minorLabels_.sweepAngle(360);
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
 * @return {!(anychart.core.ui.CircularLabelsFactory|anychart.core.axes.Polar)} Axis labels of itself for method chaining.
 */
anychart.core.axes.Polar.prototype.labels = function(opt_value) {
  if (!this.labels_) {
    this.labels_ = new anychart.core.ui.CircularLabelsFactory();
    this.labels_.sweepAngle(360);
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
      var thicknessOld = acgraph.vector.getThickness(this.stroke_);
      var thicknessNew = acgraph.vector.getThickness(opt_strokeOrFill);
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
 * Get/set axis fill settings.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {!(acgraph.vector.Fill|anychart.core.axes.Polar)} Grid even fill settings or Grid instance for method chaining.
 */
anychart.core.axes.Polar.prototype.fill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var val = acgraph.vector.normalizeFill.apply(null, arguments);
    if (!anychart.color.equals(/** @type {acgraph.vector.Fill} */ (this.fill_), val)) {
      this.fill_ = val;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.fill_;
};


/**
 * @param {anychart.scales.Base=} opt_value Scale.
 * @return {anychart.scales.Base|!anychart.core.axes.Polar} Axis scale or itself for method chaining.
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
 * Puts everything in place.
 * @private
 */
anychart.core.axes.Polar.prototype.calculateAxisBounds_ = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.dropBoundsCache_();
    var scale = /** @type {anychart.scales.Ordinal|anychart.scales.ScatterBase} */(this.scale());

    var parentBounds = /** @type {anychart.math.Rect} */(this.parentBounds()) || anychart.math.rect(0, 0, 0, 0);
    this.radius_ = Math.max(Math.round(Math.min(parentBounds.width, parentBounds.height) / 2), 0);
    this.cx_ = Math.round(parentBounds.left + parentBounds.width / 2);
    this.cy_ = Math.round(parentBounds.top + parentBounds.height / 2);
    var majorLabels = /** @type {anychart.core.ui.CircularLabelsFactory} */(this.labels());
    var minorLabels = /** @type {anychart.core.ui.CircularLabelsFactory} */(this.minorLabels());

    majorLabels
        .cx(this.cx_)
        .cy(this.cy_)
        .parentRadius(this.radius_)
        .startAngle(this.startAngle_)
        .clear()
        .parentBounds(parentBounds);

    minorLabels
        .cx(this.cx_)
        .cy(this.cy_)
        .parentRadius(this.radius_)
        .startAngle(this.startAngle_)
        .clear()
        .parentBounds(parentBounds);

    if (scale && this.radius_ && this.enabled()) {
      var isOrdinal = scale instanceof anychart.scales.Ordinal;
      var majorLabelsEnabled = this.labels().enabled();
      var minorLabelsEnabled = this.minorLabels().enabled();
      var lineThickness = acgraph.vector.getThickness(this.stroke_);
      var majorTicksLength = this.ticks().enabled() ? /** @type {number} */(this.ticks().length()) : 0;
      var ignoreMajorTicks;
      if (anychart.utils.isPercent(majorTicksLength)) {
        ignoreMajorTicks = true;
        majorTicksLength = parseFloat(majorTicksLength);
      }
      var majorLabelsOffsetByTicks = isOrdinal ? 0 : majorTicksLength;
      var minorTicksLength = (!isOrdinal && this.minorTicks().enabled()) ?
          /** @type {number} */(this.minorTicks().length()) : 0;
      if (anychart.utils.isPercent(minorTicksLength)) {
        minorTicksLength = parseFloat(minorTicksLength);
      }
      var majorTicksArr = (majorTicksLength || majorLabelsEnabled) ? scale.ticks().get() : [];
      var minorTicksArr = (!isOrdinal && (minorTicksLength || minorLabelsEnabled)) ? scale.minorTicks().get() : [];
      if (!isOrdinal && this.getRatio_(0, majorTicksArr, scale, 0) == 0) {
        if (this.getRatio_(minorTicksArr.length - 1, minorTicksArr, scale, 1) == 1)
          minorTicksArr.pop();
        if (this.getRatio_(majorTicksArr.length - 1, majorTicksArr, scale, 1) == 1)
          majorTicksArr.pop();
      }
      var i, j, index, ratio, isMajor, majorRatio, minorRatio, angle, radius,
          dx, dy, labelsEnabled, tickLength, ticksArr, labelsOffset, boundsCache,
          labels, label, ticksAngles, ignoreTicks, angleRad;
      var labelsOrder = [];
      var majorTickAngles = [];
      var minorTickAngles = [];
      i = j = 0;
      majorRatio = this.getRatio_(i, majorTicksArr, scale, 0.5);
      minorRatio = this.getRatio_(j, minorTicksArr, scale, 0.5);
      var radiusDelta = lineThickness / 2;
      var hasFill = this.fill_ != 'none';
      var boundsChecker = hasFill ? this.checkCrossesParentRadius_ : this.checkCrossesParentBounds_;
      while (!isNaN(majorRatio) || !isNaN(minorRatio)) {
        if (isNaN(minorRatio) || (majorRatio <= minorRatio)) {
          ratio = majorRatio;
          isMajor = true;
          index = i;
          labelsEnabled = majorLabelsEnabled;
          tickLength = majorTicksLength;
          ticksArr = majorTicksArr;
          labelsOffset = majorLabelsOffsetByTicks;
          boundsCache = this.labelsBounds_;
          labels = majorLabels;
          ticksAngles = majorTickAngles;
          ignoreTicks = ignoreMajorTicks;
        } else {
          ratio = minorRatio;
          isMajor = false;
          index = j;
          labelsEnabled = minorLabelsEnabled;
          tickLength = minorTicksLength;
          ticksArr = minorTicksArr;
          labelsOffset = minorTicksLength;
          boundsCache = this.minorLabelsBounds_;
          labels = minorLabels;
          ticksAngles = minorTickAngles;
          ignoreTicks = false;
        }

        angle = anychart.math.round(goog.math.standardAngle(this.startAngle_ - 90 + ratio * 360), 4);
        angleRad = goog.math.toRadians(angle);
        dx = anychart.math.angleDx(angleRad, 1);
        dy = anychart.math.angleDy(angleRad, 1);
        if (labelsEnabled) {
          points = this.configureLabel_(labels, index, ticksArr[index], angle, this.radius_ + labelsOffset, boundsCache);
          radiusDelta = Math.max(boundsChecker.call(this, angle, dx, dy, points), radiusDelta);
          labelsOrder.push(isMajor ? index : ~index);
        }
        if (tickLength) {
          var tickAngle, tickDx, tickDy;
          if (isOrdinal) {
            var tickRatio = this.getRatio_(index, ticksArr, scale, 0);
            tickAngle = anychart.math.round(goog.math.standardAngle(this.startAngle_ - 90 + tickRatio * 360), 4);
            angleRad = goog.math.toRadians(tickAngle);
            tickDx = anychart.math.angleDx(angleRad, 1);
            tickDy = anychart.math.angleDy(angleRad, 1);
          } else {
            tickAngle = angle;
            tickDx = dx;
            tickDy = dy;
          }
          ticksAngles.push(tickAngle);
          if (!ignoreTicks) {
            radius = this.radius_ + tickLength + lineThickness / 2;
            var x = dx * radius + this.cx_;
            var y = dy * radius + this.cy_;
            radiusDelta = Math.max(boundsChecker.call(this, tickAngle, dx, dy, [x, y]), radiusDelta);
          }
        }

        if (!isMajor || majorRatio == minorRatio)
          minorRatio = this.getRatio_(++j, minorTicksArr, scale, 0.5);
        if (isMajor)
          majorRatio = this.getRatio_(++i, majorTicksArr, scale, 0.5);
      }
      this.originalRadius_ = this.radius_;
      this.radius_ = Math.floor(this.radius_ - radiusDelta);
      this.majorTickAngles_ = majorTickAngles;
      this.minorTickAngles_ = minorTickAngles;
      if (radiusDelta) {
        var delta = radiusDelta;
        for (i = 0; i < labelsOrder.length; i++) {
          index = labelsOrder[i];
          if (index < 0) {
            index = ~index;
            labels = minorLabels;
            boundsCache = this.minorLabelsBounds_;
          } else {
            labels = majorLabels;
            boundsCache = this.labelsBounds_;
          }
          var points = boundsCache[index];
          label = labels.getLabel(index);
          var positionProvider = label.positionProvider();
          angle = positionProvider['value']['angle'];
          angleRad = goog.math.toRadians(angle);
          dx = anychart.math.angleDx(angleRad, 1);
          dy = anychart.math.angleDy(angleRad, 1);
          if (hasFill) {
            var projection = goog.array.slice(points, 0);
            anychart.math.projectToLine(projection, dx, dy, this.cx_, this.cy_);
            var rect = anychart.math.Rect.fromCoordinateBox(projection);
            var dRadius = anychart.math.vectorLength(0, 0, rect.width, rect.height);
            delta = radiusDelta - (radiusDelta - dRadius) / 2;
          }
          dx *= delta;
          dy *= delta;
          for (j = 0; j < points.length; j += 2) {
            points[j] -= dx;
            points[j + 1] -= dy;
          }
          positionProvider['value']['radius'] -= delta;
          // One cannot just _set_ a position provider...
          label.positionProvider(null);
          label.positionProvider(positionProvider);

          // this.drawDebugPath_(points, '2 green');
        }
      }
      if (this.overlapMode_ == anychart.enums.LabelsOverlapMode.NO_OVERLAP && labelsOrder.length) {
        var newLabelsOrder = [labelsOrder[0]];
        var lastMajor = labelsOrder[0] < 0 ? NaN : 0;
        var firstMajor = lastMajor;
        var firstMajorBounds = isNaN(lastMajor) ? null : this.getLabelCoordinateBox_(lastMajor);
        var firstBounds = this.getLabelCoordinateBox_(labelsOrder[0]);
        for (i = 1; i < labelsOrder.length; i++) {
          var labelIndex = labelsOrder[i];
          var labelBounds = this.getLabelCoordinateBox_(labelIndex);
          var remove = false;
          if (labelIndex < 0) {
            labels = minorLabels;
            index = ~labelIndex;
            remove = anychart.math.checkRectIntersection(labelBounds, firstBounds) ||
                anychart.math.checkRectIntersection(labelBounds, this.getLabelCoordinateBox_(newLabelsOrder[newLabelsOrder.length - 1]));
          } else {
            labels = majorLabels;
            index = labelIndex;
            remove = !isNaN(lastMajor) && (anychart.math.checkRectIntersection(labelBounds, firstMajorBounds) ||
                anychart.math.checkRectIntersection(labelBounds, this.getLabelCoordinateBox_(newLabelsOrder[lastMajor])));
            if (!remove) {
              var k;
              for (j = newLabelsOrder.length; j--;) {
                k = newLabelsOrder[j];
                if (k < 0 && anychart.math.checkRectIntersection(labelBounds, this.getLabelCoordinateBox_(newLabelsOrder[j]))) {
                  minorLabels.getLabel(~k).enabled(false);
                  newLabelsOrder.pop();
                } else {
                  break;
                }
              }
              for (j = 0; j < firstMajor; j++) {
                k = newLabelsOrder[j];
                if (k < 0 && anychart.math.checkRectIntersection(labelBounds, this.getLabelCoordinateBox_(newLabelsOrder[j]))) {
                  minorLabels.getLabel(~k).enabled(false);
                } else {
                  break;
                }
              }
              if (j > 0) {
                newLabelsOrder.splice(0, j);
              }
            }
          }
          if (remove) {
            labels.getLabel(index).enabled(false);
          } else {
            newLabelsOrder.push(labelIndex);
            if (labelIndex >= 0) {
              lastMajor = newLabelsOrder.length - 1;
              if (!firstMajorBounds) {
                firstMajor = lastMajor;
                firstMajorBounds = labelBounds;
              }
            }
          }
        }
      }
    }

    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }
};


/**
 * Checks if the passed rectangle crosses the parent bounds and returns the radius difference
 * that should be applied to remove the crossing at specified angle.
 * @param {number} angle
 * @param {number} dx
 * @param {number} dy
 * @param {Array.<number>} points
 * @return {number}
 * @private
 */
anychart.core.axes.Polar.prototype.checkCrossesParentRadius_ = function(angle, dx, dy, points) {
  var result = 0;
  for (var i = 0; i < points.length; i += 2) {
    var dist = anychart.math.vectorLength(this.cx_, this.cy_, points[i], points[i + 1]);
    result = Math.max(result, dist - this.radius_);
  }
  return result;
};


/**
 * Checks if the passed rectangle crosses the parent bounds and returns the radius difference
 * that should be applied to remove the crossing at specified angle.
 * @param {number} angle
 * @param {number} dx
 * @param {number} dy
 * @param {Array.<number>} points
 * @return {number}
 * @private
 */
anychart.core.axes.Polar.prototype.checkCrossesParentBounds_ = function(angle, dx, dy, points) {
  var parentBounds = this.parentBounds();
  var bounds = anychart.math.Rect.fromCoordinateBox(points);
  var left = bounds.left;
  var width = bounds.width;
  var top = bounds.top;
  var height = bounds.height;
  var right = left + width;
  var bottom = top + height;
  var result = 0;
  if (angle > 90 && angle < 270) {
    if (left < parentBounds.left) {
      result = (parentBounds.left - left) / -dx;
    }
  } else {
    var parentBoundsRight = parentBounds.left + parentBounds.width;
    if (right > parentBoundsRight) {
      result = (right - parentBoundsRight) / dx;
    }
  }
  if (angle > 0 && angle < 180) {
    var parentBoundsBottom = parentBounds.top + parentBounds.height;
    if (bottom > parentBoundsBottom) {
      result = Math.max(result, (bottom - parentBoundsBottom) / dy);
    }
  } else {
    if (top < parentBounds.top) {
      result = Math.max(result, (parentBounds.top - top) / -dy);
    }
  }
  return result;
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
      var lineThickness = acgraph.vector.getThickness(this.stroke_);
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
 * Helper function to calculate ratios.
 * @param {number} i
 * @param {Array} ticksArr
 * @param {anychart.scales.Base} scale
 * @param {number} subRatio
 * @return {number}
 * @private
 */
anychart.core.axes.Polar.prototype.getRatio_ = function(i, ticksArr, scale, subRatio) {
  return (i < ticksArr.length) ? scale.transform(ticksArr[i], subRatio) : NaN;
};


/**
 * Configures the label. Returns label bounds coordinate box.
 * @param {anychart.core.ui.CircularLabelsFactory} labels
 * @param {number} index
 * @param {string|number} value
 * @param {number} angle
 * @param {number} radius
 * @param {Array} cache
 * @return {Array.<number>} Label coordinate box.
 * @private
 */
anychart.core.axes.Polar.prototype.configureLabel_ = function(labels, index, value, angle, radius, cache) {
  var formatProvider = this.getLabelsFormatProvider_(index, value);
  var positionProvider = {'value': {'angle': angle, 'radius': radius}};
  var label = labels.getLabel(index);
  if (label) {
    label.suspendSignalsDispatching();
    label.formatProvider(formatProvider);
    label.positionProvider(positionProvider);
    label.state('pointState', null);
  } else {
    label = labels.add(formatProvider, positionProvider, index);
    label.suspendSignalsDispatching();
  }
  var autoRotate = label.getFinalSettings('autoRotate');
  if (label.getFinalSettings('anchor') == anychart.enums.Anchor.AUTO)
    label.state('pointState', {
      'anchor': autoRotate ?
          anychart.enums.Anchor.CENTER :
          anychart.utils.getAnchorForAngle(angle - /** @type {number} */(label.getFinalSettings('rotation')))
    });
  var points = labels.measureWithTransform(label);

  // this.drawDebugPath_(points, '2 red');

  if (autoRotate) {
    var angleRad = goog.math.toRadians(angle);
    var dx = anychart.math.angleDx(angleRad, 1);
    var dy = anychart.math.angleDy(angleRad, 1);
    var projection = goog.array.slice(points, 0);
    anychart.math.projectToLine(projection, dx, dy, this.cx_, this.cy_);
    var rect = anychart.math.Rect.fromCoordinateBox(projection);
    var dRadius = anychart.math.vectorLength(0, 0, rect.width, rect.height) / 2;
    positionProvider['value']['radius'] = radius + dRadius;
    // One cannot just _set_ a position provider...
    label.positionProvider(null);
    label.positionProvider(positionProvider);
    // adjusting points to avoid remeasuring label
    dx *= dRadius;
    dy *= dRadius;
    for (var i = 0; i < points.length; i += 2) {
      points[i] += dx;
      points[i + 1] += dy;
    }
  }
  cache[index] = points;

  label.resumeSignalsDispatching(true);
  return points;
};


/**
 * Returns label coordinate box as an array of coordinate pairs.
 * @param {number} index
 * @return {Array.<number>}
 * @private
 */
anychart.core.axes.Polar.prototype.getLabelCoordinateBox_ = function(index) {
  var cache, labels;
  if (index < 0) {
    index = ~index;
    cache = this.minorLabelsBounds_;
    labels = this.labels();
  } else {
    cache = this.labelsBounds_;
    labels = this.minorLabels();
  }
  var result;
  if (cache[index]) {
    result = cache[index];
  } else {
    result = cache[index] = labels.measureWithTransform(labels.getLabel(index));
  }
  return result;
};


/**
 * Gets format provider for label.
 * @param {number} index Label index.
 * @param {string|number} value Label value.
 * @return {Object} Labels format provider.
 * @private
 */
anychart.core.axes.Polar.prototype.getLabelsFormatProvider_ = function(index, value) {
  var scale = this.scale();

  var labelText, labelValue;
  var addRange = true;
  if (scale instanceof anychart.scales.Ordinal) {
    labelText = scale.ticks().names()[index];
    labelValue = value;
    addRange = false;
  } else if (scale instanceof anychart.scales.DateTime) {
    labelText = anychart.format.date(/** @type {number} */(value));
    labelValue = value;
  } else {
    labelText = parseFloat(value);
    labelValue = parseFloat(value);
  }

  var values = {
    'axis': {value: this, type: anychart.enums.TokenType.UNKNOWN},
    'index': {value: index, type: anychart.enums.TokenType.NUMBER},
    'value': {value: labelText, type: anychart.enums.TokenType.NUMBER},
    'tickValue': {value: labelValue, type: anychart.enums.TokenType.NUMBER},
    'scale': {value: scale, type: anychart.enums.TokenType.UNKNOWN}
  };

  if (addRange) {
    values['min'] = {
      value: goog.isDef(scale.min) ? scale.min : null,
      type: anychart.enums.TokenType.NUMBER
    };
    values['max'] = {
      value: goog.isDef(scale.max) ? scale.max : null,
      type: anychart.enums.TokenType.NUMBER
    };
  }

  var aliases = {};
  aliases[anychart.enums.StringToken.AXIS_SCALE_MAX] = 'max';
  aliases[anychart.enums.StringToken.AXIS_SCALE_MIN] = 'max';

  var context = new anychart.format.Context(values);
  context.tokenAliases(aliases);

  return context.propagate();
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
  var scale = /** @type {anychart.scales.ScatterBase|anychart.scales.Ordinal} */(this.scale());

  if (!scale) {
    anychart.core.reporting.error(anychart.enums.ErrorCode.SCALE_NOT_SET);
    return this;
  }

  if (!this.checkDrawingNeeded())
    return this;

  this.calculateAxisBounds_();

  this.labels().suspendSignalsDispatching();
  this.minorLabels().suspendSignalsDispatching();
  this.ticks().suspendSignalsDispatching();
  this.minorTicks().suspendSignalsDispatching();

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    this.line_.stroke(this.stroke_);
    this.line_.fill('none');
    this.line_.clear();
    this.line_.moveTo(this.cx_ + this.radius_, this.cy_);
    this.line_.circularArc(this.cx_, this.cy_, this.radius_, this.radius_, 0, 360);

    this.bg_.stroke('none');
    this.bg_.fill(this.fill_);
    this.bg_.clear();
    this.bg_.moveTo(this.cx_ + this.radius_, this.cy_);
    this.bg_.circularArc(this.cx_, this.cy_, this.radius_, this.radius_, 0, 360);
    this.bg_.moveTo(this.cx_ + this.originalRadius_, this.cy_);
    this.bg_.circularArc(this.cx_, this.cy_, this.originalRadius_, this.originalRadius_, 0, -360);

    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    var zIndex = /** @type {number} */(this.zIndex());
    this.bg_.zIndex(zIndex);
    this.line_.zIndex(zIndex);
    this.ticks().zIndex(zIndex);
    this.minorTicks().zIndex(zIndex);
    this.labels().zIndex(zIndex);
    this.minorLabels().zIndex(zIndex);

    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  var container = /** @type {acgraph.vector.ILayer} */(this.container());
  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    this.bg_.parent(container);
    this.line_.parent(container);
    this.ticks().container(container);
    this.labels().container(container);
    this.minorTicks().container(container);
    this.minorLabels().container(container);

    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.AXIS_TICKS)) {
    var isOrdinal = this.scale() instanceof anychart.scales.Ordinal;
    var lineThickness = acgraph.vector.getThickness(this.stroke_);
    var ticks = /** @type {anychart.core.axes.RadialTicks} */(this.ticks());
    ticks.draw();
    var tickThickness = acgraph.vector.getThickness(/** @type {acgraph.vector.Stroke} */(ticks.stroke()));
    var tickLen = /** @type {number} */(ticks.length());
    if (anychart.utils.isPercent(tickLen)) {
      tickLen = isOrdinal ? anychart.utils.normalizeSize(tickLen, this.originalRadius_ - this.radius_) : parseFloat(tickLen);
    }
    for (var i = 0; i < this.majorTickAngles_.length; i++) {
      this.drawTick_(ticks, this.majorTickAngles_[i], lineThickness, tickThickness, tickLen);
    }

    ticks = /** @type {anychart.core.axes.RadialTicks} */(this.minorTicks());
    ticks.draw();
    tickThickness = acgraph.vector.getThickness(/** @type {acgraph.vector.Stroke} */(ticks.stroke()));
    tickLen = /** @type {number} */(ticks.length());
    if (anychart.utils.isPercent(tickLen)) {
      tickLen = parseFloat(tickLen);
    }
    for (i = 0; i < this.minorTickAngles_.length; i++) {
      this.drawTick_(ticks, this.minorTickAngles_[i], lineThickness, tickThickness, tickLen);
    }

    this.markConsistent(anychart.ConsistencyState.AXIS_TICKS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.AXIS_LABELS)) {
    this.labels().draw();
    this.minorLabels().draw();

    this.markConsistent(anychart.ConsistencyState.AXIS_LABELS);
  }

  // this.drawDebugPath_(this.parentBounds().toCoordinateBox(), 'black');
  // this.drawDebugPath_(anychart.math.rect(this.cx_ - this.radius_, this.cy_ - this.radius_, this.radius_ + this.radius_, this.radius_ + this.radius_).toCoordinateBox(), 'gray');

  this.labels().resumeSignalsDispatching(false);
  this.ticks().resumeSignalsDispatching(false);
  this.minorLabels().resumeSignalsDispatching(false);
  this.minorTicks().resumeSignalsDispatching(false);

  return this;
};


/**
 * Draws the tick.
 * @param {anychart.core.axes.RadialTicks} ticks
 * @param {number} angle
 * @param {number} lineThickness
 * @param {number} tickThickness
 * @param {number} tickLen
 * @private
 */
anychart.core.axes.Polar.prototype.drawTick_ = function(ticks, angle, lineThickness, tickThickness, tickLen) {
  var angleRad = goog.math.toRadians(angle);
  var sin = Math.sin(angleRad);
  var cos = Math.cos(angleRad);
  var xPixelShift = 0;
  var yPixelShift = 0;

  var halfThickness = Math.floor(lineThickness / 2);
  if ((tickThickness % 2) && !(angle % 90)) {
    yPixelShift = -Math.round(cos) / 2;
    xPixelShift = -Math.round(sin) / 2;
  }

  var radius = this.radius_ + halfThickness;
  var x0Ticks = Math.round(this.cx_ + radius * cos) + xPixelShift;
  var y0Ticks = Math.round(this.cy_ + radius * sin) + yPixelShift;

  radius = this.radius_ + tickLen + halfThickness;
  var x1Ticks = Math.round(this.cx_ + radius * cos) + xPixelShift;
  var y1Ticks = Math.round(this.cy_ + radius * sin) + yPixelShift;

  ticks.drawTick(x0Ticks, y0Ticks, x1Ticks, y1Ticks);
};


/** @inheritDoc */
anychart.core.axes.Polar.prototype.remove = function() {
  if (this.line_) this.line_.parent(null);
  if (this.bg_) this.bg_.parent(null);
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
  json['fill'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke} */(this.fill()));
  //json['startAngle'] = this.startAngle();
  json['overlapMode'] = this.overlapMode();
  return json;
};


/** @inheritDoc */
anychart.core.axes.Polar.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.axes.Polar.base(this, 'setupByJSON', config, opt_default);
  this.labels().setupByVal(config['labels'], opt_default);
  this.minorLabels().setupByVal(config['minorLabels'], opt_default);
  this.ticks(config['ticks']);
  this.minorTicks(config['minorTicks']);
  //this.startAngle(config['startAngle']);
  this.stroke(config['stroke']);
  this.fill(config['fill']);
  this.overlapMode(config['overlapMode']);
};


/** @inheritDoc */
anychart.core.axes.Polar.prototype.disposeInternal = function() {
  anychart.core.axes.Polar.base(this, 'disposeInternal');

  delete this.scale_;
  this.labelsBounds_ = null;

  this.title_ = null;

  goog.disposeAll(this.line_, this.bg_);
  this.line_ = this.bg_ = null;

  this.ticks_ = null;
  this.minorTicks_ = null;

  this.labels_ = null;
  this.minorLabels_ = null;
};


// /**
//  * Debug method.
//  * @param {Array.<number>} points
//  * @param {acgraph.vector.Stroke=} opt_stroke
//  * @private
//  */
// anychart.core.axes.Polar.prototype.drawDebugPath_ = function(points, opt_stroke) {
//   points = points.slice(0);
//   var container = this.container();
//   var func = function() {
//     if (container) {
//       var path = container.getStage().path().zIndex(10000).stroke(opt_stroke || 'red').fill('none');
//       path.moveTo(points[0], points[1]);
//       path.lineTo.apply(path, points).close();
//     } else {
//       setTimeout(func, 0);
//     }
//   };
//   func();
// };


//proto['startAngle'] = proto.startAngle;
//exports
(function() {
  var proto = anychart.core.axes.Polar.prototype;
  proto['labels'] = proto.labels;
  proto['minorLabels'] = proto.minorLabels;
  proto['ticks'] = proto.ticks;
  proto['minorTicks'] = proto.minorTicks;
  proto['stroke'] = proto.stroke;
  proto['fill'] = proto.fill;
  proto['scale'] = proto.scale;
  proto['overlapMode'] = proto.overlapMode;
  proto['getRemainingBounds'] = proto.getRemainingBounds;
})();
