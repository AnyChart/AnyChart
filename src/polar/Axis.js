//region --- Provide and Require
goog.provide('anychart.polarModule.Axis');
goog.provide('anychart.standalones.axes.Polar');
goog.require('acgraph');
goog.require('anychart.color');
goog.require('anychart.core.IAxis');
goog.require('anychart.core.IStandaloneBackend');
goog.require('anychart.core.VisualBase');
goog.require('anychart.core.reporting');
goog.require('anychart.core.ui.LabelsFactory');
goog.require('anychart.core.utils.Bounds');
goog.require('anychart.core.utils.Padding');
goog.require('anychart.enums');
goog.require('anychart.format.Context');
goog.require('anychart.math.Rect');
goog.require('anychart.radarPolarBaseModule.RadialAxisTicks');
//endregion



/**
 * Radar axis Class.
 * @constructor
 * @extends {anychart.core.VisualBase}
 * @implements {anychart.core.IStandaloneBackend}
 * @implements {anychart.core.IAxis}
 */
anychart.polarModule.Axis = function() {
  this.suspendSignalsDispatching();
  anychart.polarModule.Axis.base(this, 'constructor');

  this.addThemes(anychart.themes.DefaultThemes['axis']);

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

  var beforeInvalidationHook = function() {
    this.dropBoundsCache_();
  };

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['overlapMode', this.ALL_VISUAL_STATES_, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED, 0, beforeInvalidationHook],
    ['fill', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['stroke', this.ALL_VISUAL_STATES_, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED, 0, beforeInvalidationHook],
    ['startAngle', this.ALL_VISUAL_STATES_, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED, 0, beforeInvalidationHook]
  ]);
};
goog.inherits(anychart.polarModule.Axis, anychart.core.VisualBase);


/**
 * Properties descriptors.
 * @type {!Object<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.polarModule.Axis.PROPERTY_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  var descriptors = anychart.core.settings.descriptors;
  anychart.core.settings.createDescriptors(map, [
    descriptors.OVERLAP_MODE,
    descriptors.FILL,
    descriptors.STROKE,
    descriptors.START_ANGLE
  ]);

  return map;
})();
anychart.core.settings.populate(anychart.polarModule.Axis, anychart.polarModule.Axis.PROPERTY_DESCRIPTORS);


//region --- States and Signals
/**
 * Supported consistency states.
 * @type {number}
 */
anychart.polarModule.Axis.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.AXIS_LABELS |
    anychart.ConsistencyState.AXIS_TICKS;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.polarModule.Axis.prototype.SUPPORTED_SIGNALS = anychart.core.VisualBase.prototype.SUPPORTED_SIGNALS;


//endregion
//region --- Properties
/**
 * @type {acgraph.vector.Path}
 * @private
 */
anychart.polarModule.Axis.prototype.line_ = null;


/**
 * @type {acgraph.vector.Path}
 * @private
 */
anychart.polarModule.Axis.prototype.bg_ = null;


/**
 * @type {string}
 * @private
 */
anychart.polarModule.Axis.prototype.name_ = 'axis';


/**
 * @type {anychart.core.ui.LabelsFactory}
 * @private
 */
anychart.polarModule.Axis.prototype.labels_ = null;


/**
 * @type {anychart.radarPolarBaseModule.RadialAxisTicks}
 * @private
 */
anychart.polarModule.Axis.prototype.ticks_ = null;


/**
 * @type {anychart.core.ui.LabelsFactory}
 * @private
 */
anychart.polarModule.Axis.prototype.minorLabels_ = null;


/**
 * @type {anychart.radarPolarBaseModule.RadialAxisTicks}
 * @private
 */
anychart.polarModule.Axis.prototype.minorTicks_ = null;


/**
 * @type {anychart.scales.Base}
 * @private
 */
anychart.polarModule.Axis.prototype.scale_ = null;


/**
 * @type {number}
 * @private
 */
anychart.polarModule.Axis.prototype.radius_ = NaN;


/**
 *
 * @type {number}
 * @private
 */
anychart.polarModule.Axis.prototype.criticalTickLength_ = NaN;


/**
 * @type {number}
 * @private
 */
anychart.polarModule.Axis.prototype.cx_ = NaN;


/**
 * @type {number}
 * @private
 */
anychart.polarModule.Axis.prototype.cy_ = NaN;


/**
 * @type {Array.<Array.<number>>}
 * @private
 */
anychart.polarModule.Axis.prototype.labelsBounds_ = null;


/**
 * @type {Array.<Array.<number>>}
 * @private
 */
anychart.polarModule.Axis.prototype.minorLabelsBounds_ = null;


//endregion
//region --- API
/**
 * Drops labels calls cache.
 */
anychart.polarModule.Axis.prototype.dropLabelCallsCache = function() {
  if (this.labels_)
    this.labels_.dropCallsCache();
  if (this.minorLabels_)
    this.minorLabels_.dropCallsCache();
};


/**
 * @param {(Object|boolean|null)=} opt_value Axis labels.
 * @return {!(anychart.core.ui.LabelsFactory|anychart.polarModule.Axis)} Axis labels of itself for method chaining.
 */
anychart.polarModule.Axis.prototype.minorLabels = function(opt_value) {
  if (!this.minorLabels_) {
    this.minorLabels_ = new anychart.core.ui.LabelsFactory();
    this.setupCreated('minorLabels', this.minorLabels_);
    this.minorLabels_.setParentEventTarget(this);
    this.minorLabels_.listenSignals(this.labelsInvalidated_, this);
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
 * @return {!(anychart.core.ui.LabelsFactory|anychart.polarModule.Axis)} Axis labels of itself for method chaining.
 */
anychart.polarModule.Axis.prototype.labels = function(opt_value) {
  if (!this.labels_) {
    this.labels_ = new anychart.core.ui.LabelsFactory();
    this.setupCreated('labels', this.labels_);
    this.labels_.setParentEventTarget(this);
    this.labels_.listenSignals(this.labelsInvalidated_, this);
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
anychart.polarModule.Axis.prototype.labelsInvalidated_ = function(event) {
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
 * @return {!(anychart.radarPolarBaseModule.RadialAxisTicks|anychart.polarModule.Axis)} Axis ticks or itself for method chaining.
 */
anychart.polarModule.Axis.prototype.minorTicks = function(opt_value) {
  if (!this.minorTicks_) {
    this.minorTicks_ = new anychart.radarPolarBaseModule.RadialAxisTicks();
    this.setupCreated('minorTicks', this.minorTicks_);
    this.minorTicks_.setParentEventTarget(this);
    this.minorTicks_.listenSignals(this.ticksInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    this.minorTicks_.setup(opt_value);
    return this;
  }
  return this.minorTicks_;
};


/**
 * @param {(Object|boolean|null)=} opt_value Axis ticks.
 * @return {!(anychart.radarPolarBaseModule.RadialAxisTicks|anychart.polarModule.Axis)} Axis ticks or itself for method chaining.
 */
anychart.polarModule.Axis.prototype.ticks = function(opt_value) {
  if (!this.ticks_) {
    this.ticks_ = new anychart.radarPolarBaseModule.RadialAxisTicks();
    this.setupCreated('ticks', this.ticks_);
    this.ticks_.setParentEventTarget(this);
    this.ticks_.listenSignals(this.ticksInvalidated_, this);
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
anychart.polarModule.Axis.prototype.ticksInvalidated_ = function(event) {
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
 * @param {(anychart.scales.Base|anychart.enums.ScaleTypes|Object)=} opt_value Scale.
 * @return {anychart.scales.Base|!anychart.polarModule.Axis} Axis scale or itself for method chaining.
 */
anychart.polarModule.Axis.prototype.scale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = anychart.scales.Base.setupScale(this.scale_, opt_value, null,
        anychart.scales.Base.ScaleTypes.ALL_DEFAULT, null, this.scaleInvalidated_, this);
    if (val) {
      var dispatch = this.scale_ == val;
      this.scale_ = /** @type {anychart.scales.Base} */(val);
      this.scale_.resumeSignalsDispatching(dispatch);
      if (!dispatch) {
        this.dropBoundsCache_();
        this.invalidate(this.ALL_VISUAL_STATES_, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
      }
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
anychart.polarModule.Axis.prototype.scaleInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.dropBoundsCache_();
    this.invalidate(this.ALL_VISUAL_STATES_, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
  }
};


//endregion
//region --- Bounds
/** @inheritDoc */
anychart.polarModule.Axis.prototype.invalidateParentBounds = function() {
  this.invalidate(this.ALL_VISUAL_STATES_, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
};


/**
 * @private
 */
anychart.polarModule.Axis.prototype.dropBoundsCache_ = function() {
  this.labelsBounds_.length = 0;
  this.minorLabelsBounds_.length = 0;
  this.overlappedLabels_ = null;
};


/**
 * Puts everything in place.
 * @private
 */
anychart.polarModule.Axis.prototype.calculateAxisBounds_ = function() {
  var points;
  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.dropBoundsCache_();
    var scale = /** @type {anychart.scales.Ordinal|anychart.scales.ScatterBase} */(this.scale());

    var parentBounds = /** @type {anychart.math.Rect} */(this.parentBounds()) || anychart.math.rect(0, 0, 0, 0);

    this.radius_ = Math.max(Math.round(Math.min(parentBounds.width, parentBounds.height) / 2), 0);
    this.cx_ = Math.round(parentBounds.left + parentBounds.width / 2);
    this.cy_ = Math.round(parentBounds.top + parentBounds.height / 2);

    var majorLabels = /** @type {anychart.core.ui.LabelsFactory} */(this.labels());
    var majorLabelsPosition = /** @type {anychart.enums.SidePosition} */(majorLabels.getOption('position'));
    var majorLabelsSidePosition = majorLabelsPosition == 'normal' ? 1 : anychart.utils.sidePositionToNumber(majorLabelsPosition);

    var minorLabels = /** @type {anychart.core.ui.LabelsFactory} */(this.minorLabels());
    var minorLabelsPosition = /** @type {anychart.enums.SidePosition} */(majorLabels.getOption('position'));
    var minorLabelsSidePosition = minorLabelsPosition == 'normal' ? 1 : anychart.utils.sidePositionToNumber(minorLabelsPosition);

    majorLabels
        .clear()
        .parentBounds(parentBounds);

    minorLabels
        .clear()
        .parentBounds(parentBounds);

    this.markConsistent(anychart.ConsistencyState.BOUNDS);

    if (scale && this.radius_ && this.enabled()) {
      var ticks = /** @type {!anychart.radarPolarBaseModule.RadialAxisTicks} */(this.ticks());
      var isOrdinal = anychart.utils.instanceOf(scale, anychart.scales.Ordinal);

      var majorLabelsEnabled = majorLabels.enabled();
      var minorLabelsEnabled = minorLabels.enabled();

      var lineThickness = anychart.utils.extractThickness(/** @type {acgraph.vector.Stroke} */(this.getOption('stroke')));

      var majorTicksLength = anychart.utils.getAffectBoundsTickLength(ticks);
      var ignoreMajorTicks;
      if (anychart.utils.isPercent(majorTicksLength)) {
        ignoreMajorTicks = true;
        majorTicksLength = parseFloat(majorTicksLength);
      }

      var majorAffectsRadiusTicksLength = parseFloat(anychart.utils.getAffectBoundsTickLength(ticks, majorLabelsSidePosition));
      var minorTicks = /** @type {!anychart.radarPolarBaseModule.RadialAxisTicks} */(this.minorTicks());
      // var majorLabelsOffsetByTicks = isOrdinal ? 0 : majorTicksLength;
      var minorTicksLength = isOrdinal ? 0 : anychart.utils.getAffectBoundsTickLength(minorTicks);
      if (anychart.utils.isPercent(minorTicksLength)) {
        minorTicksLength = parseFloat(minorTicksLength);
      }
      var minorAffectsRadiusTicksLength = isOrdinal ? 0 : parseFloat(anychart.utils.getAffectBoundsTickLength(minorTicks, minorLabelsSidePosition));

      var majorTicksArr = (majorTicksLength || majorLabelsEnabled) ? scale.ticks().get() : [];
      var minorTicksArr = (!isOrdinal && (minorTicksLength || minorLabelsEnabled)) ? scale.minorTicks().get() : [];

      if (!isOrdinal && !this.getRatio_(0, majorTicksArr, scale, 0)) {
        if (this.getRatio_(minorTicksArr.length - 1, minorTicksArr, scale, 1) == 1)
          minorTicksArr.pop();
        if (this.getRatio_(majorTicksArr.length - 1, majorTicksArr, scale, 1) == 1)
          majorTicksArr.pop();
      }

      var i, j, index, ratio, isMajor, majorRatio, minorRatio, angle, radius,
          dx, dy, labelsEnabled, tickLength, affectsRadiusTicksLength, ticksArr, boundsCache,
          labels, label, ticksAngles, ignoreTicks, angleRad;

      var labelsOrder = [];
      var majorTickAngles = [];
      var minorTickAngles = [];
      var radiusDelta = lineThickness / 2;
      var hasFill = /** @type {acgraph.vector.Fill} */(this.getOption('fill')) != 'none';
      var boundsChecker = hasFill ? this.checkCrossesParentRadius_ : this.checkCrossesParentBounds_;
      var overlapMode = !isOrdinal ?
                anychart.enums.LabelsOverlapMode.NO_OVERLAP :
                /** @type {anychart.enums.LabelsOverlapMode} */(this.getOption('overlapMode'));

      var padding, commonIndex, radiusChanged, labelsOriginRadius;
      var changerIndex = NaN;
      var iterateStep = 0;

      var maxAttempts = 10;
      do {
        radiusChanged = false;
        i = j = 0;
        majorRatio = this.getRatio_(i, majorTicksArr, scale, 0.5);
        minorRatio = this.getRatio_(j, minorTicksArr, scale, 0.5);

        while (!isNaN(majorRatio) || !isNaN(minorRatio)) {
          if (isNaN(minorRatio) || (majorRatio <= minorRatio)) {
            ratio = majorRatio;
            isMajor = true;
            index = i;
            labelsEnabled = majorLabelsEnabled;
            affectsRadiusTicksLength = majorAffectsRadiusTicksLength;
            tickLength = majorTicksLength;
            ticksArr = majorTicksArr;
            // labelsOffset = majorLabelsOffsetByTicks;
            boundsCache = this.labelsBounds_;
            labels = majorLabels;
            ticksAngles = majorTickAngles;
            ignoreTicks = ignoreMajorTicks;
          } else {
            ratio = minorRatio;
            isMajor = false;
            index = j;
            labelsEnabled = minorLabelsEnabled;
            affectsRadiusTicksLength = minorAffectsRadiusTicksLength;
            tickLength = minorTicksLength;
            ticksArr = minorTicksArr;
            // labelsOffset = minorTicksLength;
            boundsCache = this.minorLabelsBounds_;
            labels = minorLabels;
            ticksAngles = minorTickAngles;
            ignoreTicks = false;
          }

          labelsOriginRadius = isOrdinal ? this.radius_ : this.radius_ + affectsRadiusTicksLength;
          commonIndex = isMajor ? index : ~index;
          angle = anychart.math.round(goog.math.standardAngle(/** @type {number} */(this.getOption('startAngle')) - 90 + ratio * 360), 4);
          angleRad = goog.math.toRadians(angle);
          dx = anychart.math.angleDx(angleRad, 1);
          dy = anychart.math.angleDy(angleRad, 1);
          if (labelsEnabled) {
            this.configureLabel_(labels, index, ticksArr, angle, labelsOriginRadius, radiusDelta);
            label = labels.getLabel(index);

            /*
              iterateStep > maxAttempts condition fixes DVF-4218.
              This method is undebuggable shit without any comments, that why
              we just break the endless cycle here.
             */
            if (label.getFinalSettings('position') == 'normal' || iterateStep > maxAttempts) {
              points = labels.measureWithTransform(label);
              boundsCache[index] = points;
              radiusDelta = Math.max(boundsChecker.call(this, angle, dx, dy, points), radiusDelta);
            } else {
              padding = new anychart.core.utils.Padding().setup(label.getFinalSettings('padding'));
              labels.measureWithTransform(label);
              this.calcLabelTextPath(label, i, ticksArr);

              var prevRadiusDelta = radiusDelta;

              if (hasFill) {
                radiusDelta = Math.min(Math.max(padding.widenHeight(label.getTextElement().getTextHeight()), radiusDelta), labelsOriginRadius / 1.25);
              } else {
                var bounds = padding.widenBounds(label.getTextElement().getBounds());

                //Debug info
                // var ___name = 'lbl_fb' + (isMajor ? 'm' + index : index);
                // if (!this[___name]) this[___name] = stage.rect().zIndex(1000).setBounds(bounds).stroke('blue');
                // this[___name].setBounds(bounds);

                var leftDelta = parentBounds.left - bounds.left;
                var topDelta = parentBounds.top - bounds.top;
                var rightDelta = bounds.getRight() - parentBounds.getRight();
                var bottomDelta = bounds.getBottom() - parentBounds.getBottom();
                var max = Math.max(leftDelta, topDelta, rightDelta, bottomDelta, 0);
                radiusDelta += max;
              }
              goog.dispose(padding);
              padding = null;

              var deltaChanged = radiusDelta > prevRadiusDelta;
              if (deltaChanged) {
                changerIndex = commonIndex;
              } else if (changerIndex == commonIndex) {
                break;
              }
              radiusChanged = radiusChanged || deltaChanged;
            }
            if (!iterateStep)
              labelsOrder.push(commonIndex);
          }
          if (tickLength) {
            var tickAngle, tickDx, tickDy;
            if (isOrdinal) {
              var tickRatio = this.getRatio_(index, ticksArr, scale, 0);
              tickAngle = anychart.math.round(goog.math.standardAngle(/** @type {number} */(this.getOption('startAngle')) - 90 + tickRatio * 360), 4);
              angleRad = goog.math.toRadians(tickAngle);
              tickDx = anychart.math.angleDx(angleRad, 1);
              tickDy = anychart.math.angleDy(angleRad, 1);
            } else {
              tickAngle = angle;
              tickDx = dx;
              tickDy = dy;
            }
            if (!iterateStep)
              ticksAngles.push(tickAngle);
            if (!ignoreTicks) {
              radius = this.radius_ + tickLength + lineThickness / 2;
              var x = tickDx * radius + this.cx_;
              var y = tickDy * radius + this.cy_;

              //debug shapes
              // if (!this['lbl_fb99' + index]) this['lbl_fb99' + index] = stage.circle().zIndex(1000).radius(2).stroke('blue');
              // this['lbl_fb99' + index].centerX(x).centerY(y);

              prevRadiusDelta = radiusDelta;
              var checked = boundsChecker.call(this, tickAngle, tickDx, tickDy, [x, y]);
              radiusDelta = Math.max(checked, radiusDelta);

              //DVF-4218. Prevents endless growth of radius.
              radiusDelta = Math.min(radiusDelta, this.radius_);

              deltaChanged = radiusDelta > prevRadiusDelta;
              if (deltaChanged) {
                changerIndex = NaN;
              }
              radiusChanged = radiusChanged || deltaChanged;
            }
          }

          if (!isMajor || majorRatio == minorRatio)
            minorRatio = this.getRatio_(++j, minorTicksArr, scale, 0.5);
          if (isMajor)
            majorRatio = this.getRatio_(++i, majorTicksArr, scale, 0.5);
        }

        iterateStep++;
        if (iterateStep > maxAttempts) { // DVF-4218.
          radiusChanged = false;
        }

      } while (radiusChanged);

      this.originalRadius_ = this.radius_;
      this.radius_ = Math.max(0, Math.floor(this.radius_ - radiusDelta));
      this.majorTickAngles_ = majorTickAngles;
      this.minorTickAngles_ = minorTickAngles;

      radiusDelta = Math.min(radiusDelta, this.originalRadius_);

      var isCircularInsidePosition = label && label.getFinalSettings('position') != 'normal' && hasFill;
      if (radiusDelta) {
        var delta = radiusDelta;
        for (i = 0; i < labelsOrder.length; i++) {
          index = labelsOrder[i];
          if (index < 0) {
            index = ~index;
            labels = minorLabels;
            boundsCache = this.minorLabelsBounds_;
            // labelsOffset = minorTicksLength;
          } else {
            labels = majorLabels;
            boundsCache = this.labelsBounds_;
            // labelsOffset = majorLabelsOffsetByTicks;
          }
          label = labels.getLabel(index);
          var positionProvider = label.positionProvider();
          angle = positionProvider['value']['angle'];

          if (label.getFinalSettings('position') == 'normal') {
            points = boundsCache[index];
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

            dx = anychart.math.angleDx(goog.math.toRadians(angle), positionProvider['value']['radius'], this.cx_);
            dy = anychart.math.angleDy(goog.math.toRadians(angle), positionProvider['value']['radius'], this.cy_);

            positionProvider['value']['x'] = dx;
            positionProvider['value']['y'] = dy;

            //One cannot just _set_ a position provider...
            label.positionProvider(null);
            label.positionProvider(positionProvider);
          } else {
            label.height(radiusDelta);
          }
          // this.drawDebugPath_(points, '2 green');
        }
      }

      if (overlapMode == anychart.enums.LabelsOverlapMode.NO_OVERLAP && labelsOrder.length && !isCircularInsidePosition) {
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
    } else {
      this.originalRadius_ = this.radius_;
      this.majorTickAngles_ = [];
      this.minorTickAngles_ = [];
    }
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
anychart.polarModule.Axis.prototype.checkCrossesParentRadius_ = function(angle, dx, dy, points) {
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
anychart.polarModule.Axis.prototype.checkCrossesParentBounds_ = function(angle, dx, dy, points) {
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
anychart.polarModule.Axis.prototype.getRemainingBounds = function() {
  var parentBounds = this.parentBounds();

  if (parentBounds) {
    if (this.enabled()) {
      this.calculateAxisBounds_();
      var lineThickness = acgraph.vector.getThickness(/** @type {acgraph.vector.Stroke} */(this.getOption('stroke')));
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


//endregion
//region --- Labels
/**
 * Configures the label. Returns label bounds coordinate box.
 * @param {anychart.core.ui.LabelsFactory} labels
 * @param {number} index
 * @param {Array.<number|string>} ticksArr
 * @param {number} angle
 * @param {number} radius
 * @param {number} radiusDelta
 * @private
 */
anychart.polarModule.Axis.prototype.configureLabel_ = function(labels, index, ticksArr, angle, radius, radiusDelta) {
  var value = ticksArr[index];
  var hasFill = /** @type {acgraph.vector.Fill} */(this.getOption('fill')) != 'none';
  var formatProvider = this.getLabelsFormatProvider_(index, value);
  var label = labels.getLabel(index);
  if (label) {
    label.suspendSignalsDispatching();
    label.formatProvider(formatProvider);
    label.state('pointState', null);
    label.state('seriesState', null);
  } else {
    label = labels.add(formatProvider, null, index);
    label.suspendSignalsDispatching();
  }
  label.height(null);

  var pointState = {};
  if (label.getFinalSettings('position') != 'normal') {
    var padding = label.getFinalSettings('padding');
    var dr;
    var vAlign = label.getFinalSettings('vAlign');
    if (angle > 0 && angle < 180) {
      if (label.getFinalSettings('vAlign') == 'top')
        label.state('seriesState', {'vAlign': 'bottom'});
      else if (label.getFinalSettings('vAlign') == 'bottom')
        label.state('seriesState', {'vAlign': 'top'});
    }
    if (hasFill) {
      pointState['adjustFontSize'] = false;
      dr = -(vAlign == acgraph.vector.Text.VAlign.MIDDLE ?
          radiusDelta / 2 : vAlign == acgraph.vector.Text.VAlign.BOTTOM ? radiusDelta - padding.bottom : padding.top);
    } else {
      labels.measureWithTransform(label);
      this.calcLabelTextPath(label, index, ticksArr, radius, angle);
      var height = label.getTextElement().getTextHeight();

      var dh = vAlign == acgraph.vector.Text.VAlign.MIDDLE ?
          height / 2 + padding.bottom : vAlign == acgraph.vector.Text.VAlign.BOTTOM ? padding.top : height + padding.bottom;
      dr = dh - radiusDelta;
    }

    radius = radius + dr;
  } else {
    label.getTextElement().path(null);
  }

  var dx = anychart.math.angleDx(goog.math.toRadians(angle), radius, this.cx_);
  var dy = anychart.math.angleDy(goog.math.toRadians(angle), radius, this.cy_);

  var positionProvider = {'value': {'angle': angle, 'radius': radius, 'x': dx, 'y': dy}};
  label.positionProvider(positionProvider);

  if (label.getFinalSettings('anchor') == anychart.enums.Anchor.AUTO) {
    pointState['anchor'] = anychart.utils.getAnchorForAngle(angle - /** @type {number} */(label.getFinalSettings('rotation')));
  }

  label.state('pointState', pointState);
  label.resumeSignalsDispatching(true);
};


/**
 * Returns label coordinate box as an array of coordinate pairs.
 * @param {number} index
 * @return {Array.<number>}
 * @private
 */
anychart.polarModule.Axis.prototype.getLabelCoordinateBox_ = function(index) {
  var cache, labels;
  if (index < 0) {
    index = ~index;
    cache = this.minorLabelsBounds_;
    labels = this.minorLabels();
  } else {
    cache = this.labelsBounds_;
    labels = this.labels();
  }
  var result;
  if (cache[index]) {
    result = cache[index];
  } else {
    var label = labels.getLabel(index);
    result = labels.measureWithTransform(label);
    if (label.getFinalSettings('position') != 'normal') {
      var bounds = label.getTextElement().getBounds();

      var rotation = label.getFinalSettings('rotation') || 0;
      if (rotation) {
        var anchor = 'center';
        var point = anychart.utils.getCoordinateByAnchor(bounds, /** @type {anychart.enums.Anchor} */(anchor));
        var tx = goog.math.AffineTransform.getRotateInstance(goog.math.toRadians(/** @type {number} */(rotation)), point.x, point.y);

        result = bounds.toCoordinateBox() || [];
        tx.transform(result, 0, result, 0, 4);
      } else {
        result = bounds.toCoordinateBox() || [];
      }
    }
    cache[index] = result;

    //debug purpose
    // if (!this['lbl_lcb' + index]) this['lbl_lcb' + index] = stage.rect().zIndex(1000);
    // this['lbl_lcb' + index].setBounds(anychart.math.Rect.fromCoordinateBox(result));
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
anychart.polarModule.Axis.prototype.getLabelsFormatProvider_ = function(index, value) {
  var scale = this.scale();

  var labelText, labelValue;
  var addRange = true;
  if (anychart.utils.instanceOf(scale, anychart.scales.Ordinal)) {
    labelText = scale.ticks().names()[index];
    labelValue = value;
    addRange = false;
  } else if (anychart.utils.instanceOf(scale, anychart.scales.DateTime)) {
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
  aliases[anychart.enums.StringToken.AXIS_SCALE_MIN] = 'min';

  var context = new anychart.format.Context(values);
  context.tokenAliases(aliases);

  return context.propagate();
};


/**
 * Calculating text path.
 * @param {anychart.core.ui.LabelsFactory.Label} label .
 * @param {number} index
 * @param {Array.<number>} ticksArr
 * @param {number=} opt_radius
 * @param {number=} opt_angle
 * @return {!acgraph.vector.Path}
 */
anychart.polarModule.Axis.prototype.calcLabelTextPath = function(label, index, ticksArr, opt_radius, opt_angle) {
  var scale = /** @type {anychart.scales.Ordinal|anychart.scales.ScatterBase} */(this.scale());
  var radius = goog.isDef(opt_radius) ? opt_radius : label.positionProvider()['value']['radius'];
  var angle = goog.isDef(opt_angle) ? opt_angle : label.positionProvider()['value']['angle'];
  var padding = new anychart.core.utils.Padding().setup(label.getFinalSettings('padding'));
  var pxPerDegree = (2 * Math.PI * radius) / 360;
  var startAngle, endAngle;

  if (anychart.utils.instanceOf(scale, anychart.scales.Ordinal)) {
    startAngle = /** @type {number} */(this.getOption('startAngle')) - 90 + this.getRatio_(index, ticksArr, scale, 0) * 360;
    endAngle = /** @type {number} */(this.getOption('startAngle')) - 90 + this.getRatio_(index, ticksArr, scale, 1) * 360;

    var ticks = /** @type {anychart.radarPolarBaseModule.RadialAxisTicks} */(this.ticks());
    var ticksStroke = /** @type {acgraph.vector.Stroke} */(ticks.getOption('stroke'));

    var tmpSweep = Math.abs(endAngle - startAngle);
    var dw = ((tmpSweep - (padding.tightenWidth(tmpSweep * pxPerDegree) - acgraph.vector.getThickness(ticksStroke)) / pxPerDegree)) / 2;

    startAngle += dw;
    endAngle -= dw;
  } else {
    var da = 360 / ticksArr.length;
    startAngle = angle - da;
    endAngle = angle + da;
  }
  goog.dispose(padding);
  padding = null;

  if (angle > 0 && angle < 180) {
    var tmpA = startAngle;
    startAngle = endAngle;
    endAngle = tmpA;
  }

  var startAngleRad = goog.math.toRadians(startAngle);
  var dx = anychart.math.angleDx(startAngleRad, radius, this.cx_);
  var dy = anychart.math.angleDy(startAngleRad, radius, this.cy_);

  var path = /** @type {acgraph.vector.Path} */ (label.getTextElement().path());
  if (path) {
    path.clear();
  } else {
    path = acgraph.path();
    // since this anonymous path not managed anywhere
    // by axis, we register it to dispose with axis
    this.registerDisposable(path);
  }
  path
      .moveTo(dx, dy)
      .arcToAsCurves(radius, radius, startAngle, endAngle - startAngle);

  //Debug text path
  // (this['lbl' + index] || (this['lbl' + index] = stage.path())).deserialize(path.serializePathArgs());
  // stage.path().deserialize(path.serializePathArgs());

  label.getTextElement().path(path);

  //Debug full bounds
  // var bounds = label.getTextElement().getBounds();
  // if (!this['lbl_fb' + index]) this['lbl_fb' + index] = stage.rect().zIndex(1000);
  // this['lbl_fb' + index].setBounds(bounds);

  return path;
};


//endregion
//region --- Utils
/**
 * Helper function to calculate ratios.
 * @param {number} i
 * @param {Array} ticksArr
 * @param {anychart.scales.Base} scale
 * @param {number} subRatio
 * @return {number}
 * @private
 */
anychart.polarModule.Axis.prototype.getRatio_ = function(i, ticksArr, scale, subRatio) {
  return (i < ticksArr.length) ? scale.transform(ticksArr[i], subRatio) : NaN;
};


//endregion
//region --- Drawing
/** @inheritDoc */
anychart.polarModule.Axis.prototype.isAxisMarkerProvider = function() {
  return false;
};


/** @inheritDoc */
anychart.polarModule.Axis.prototype.checkDrawingNeeded = function() {
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
 * @return {anychart.polarModule.Axis} An instance of {@link anychart.polarModule.Axis} class for method chaining.
 */
anychart.polarModule.Axis.prototype.draw = function() {
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

  var stroke = /** @type {acgraph.vector.Stroke} */(this.getOption('stroke'));

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    this.line_.stroke(stroke);
    this.line_.fill('none');
    this.line_.clear();
    this.line_.moveTo(this.cx_ + this.radius_, this.cy_);
    this.line_.circularArc(this.cx_, this.cy_, this.radius_, this.radius_, 0, 360);

    this.bg_.stroke('none');
    this.bg_.fill(/** @type {acgraph.vector.Fill} */(this.getOption('fill')));
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
    var isOrdinal = anychart.utils.instanceOf(this.scale(), anychart.scales.Ordinal);
    var lineThickness = acgraph.vector.getThickness(stroke);
    var ticks = /** @type {anychart.radarPolarBaseModule.RadialAxisTicks} */(this.ticks());
    ticks.draw();
    var tickThickness = acgraph.vector.getThickness(/** @type {acgraph.vector.Stroke} */(ticks.getOption('stroke')));
    var tickLen = /** @type {number} */(ticks.getOption('length'));
    if (anychart.utils.isPercent(tickLen)) {
      tickLen = isOrdinal ? anychart.utils.normalizeSize(tickLen, this.originalRadius_ - this.radius_) : parseFloat(tickLen);
    }
    for (var i = 0; i < this.majorTickAngles_.length; i++) {
      this.drawTick_(ticks, this.majorTickAngles_[i], lineThickness, tickThickness, tickLen);
    }

    ticks = /** @type {anychart.radarPolarBaseModule.RadialAxisTicks} */(this.minorTicks());
    ticks.draw();
    tickThickness = acgraph.vector.getThickness(/** @type {acgraph.vector.Stroke} */(ticks.getOption('stroke')));
    tickLen = /** @type {number} */(ticks.getOption('length'));
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
 * @param {anychart.radarPolarBaseModule.RadialAxisTicks} ticks
 * @param {number} angle
 * @param {number} lineThickness
 * @param {number} tickThickness
 * @param {number} tickLen
 * @private
 */
anychart.polarModule.Axis.prototype.drawTick_ = function(ticks, angle, lineThickness, tickThickness, tickLen) {
  var ticksPosition = /** @type {anychart.enums.SidePosition} */(ticks.getOption('position'));
  var ticksSidePosition = anychart.utils.sidePositionToNumber(ticksPosition);

  var angleRad = goog.math.toRadians(angle);

  var sin = Math.sin(angleRad);
  var cos = Math.cos(angleRad);

  var xPixelShift = 0;
  var yPixelShift = 0;

  var halfThickness = ticksSidePosition >= 0 ? Math.floor(lineThickness / 2) : Math.ceil(lineThickness / 2);
  if ((tickThickness % 2) && !(angle % 90)) {
    yPixelShift = -Math.round(cos) / 2;
    xPixelShift = -Math.round(sin) / 2;
  }

  var radius = this.radius_;
  var x = this.cx_ + radius * cos;
  var y = this.cy_ + radius * sin;

  var startLength = ticksSidePosition ? ticksSidePosition * halfThickness : -tickLen / 2;
  var endLength = ticksSidePosition ? ticksSidePosition * tickLen : tickLen;

  var dx, dy;

  dx = startLength * cos;
  dy = startLength * sin;

  var xStart = Math.round(x + dx) + xPixelShift;
  var yStart = Math.round(y + dy) + yPixelShift;

  dx = endLength * cos;
  dy = endLength * sin;

  var xEnd = xStart + dx;
  var yEnd = yStart + dy;

  ticks.drawTick(xStart, yStart, xEnd, yEnd);
};


/** @inheritDoc */
anychart.polarModule.Axis.prototype.remove = function() {
  if (this.line_) this.line_.parent(null);
  if (this.bg_) this.bg_.parent(null);
  this.ticks().remove();
  this.minorTicks().remove();
  if (this.labels_) this.labels_.remove();
  if (this.minorLabels_) this.minorLabels_.remove();
};


//endregion
//region --- Setup and Serialize
/** @inheritDoc */
anychart.polarModule.Axis.prototype.serialize = function() {
  var json = anychart.polarModule.Axis.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.polarModule.Axis.PROPERTY_DESCRIPTORS, json);
  json['labels'] = this.labels().serialize();
  json['minorLabels'] = this.minorLabels().serialize();
  json['ticks'] = this.ticks().serialize();
  json['minorTicks'] = this.minorTicks().serialize();
  return json;
};


/** @inheritDoc */
anychart.polarModule.Axis.prototype.setupByJSON = function(config, opt_default) {
  anychart.polarModule.Axis.base(this, 'setupByJSON', config, opt_default);
  anychart.core.settings.deserialize(this, anychart.polarModule.Axis.PROPERTY_DESCRIPTORS, config, opt_default);
  this.labels().setupInternal(!!opt_default, config['labels']);
  this.minorLabels().setupInternal(!!opt_default, config['minorLabels']);
  this.ticks(config['ticks']);
  this.minorTicks(config['minorTicks']);
};


/** @inheritDoc */
anychart.polarModule.Axis.prototype.disposeInternal = function() {
  goog.disposeAll(
      this.minorLabels_,
      this.labels_,
      this.minorTicks_,
      this.ticks_,
      this.line_,
      this.bg_);

  delete this.scale_;
  this.minorLabels_ = null;
  this.labels_ = null;
  this.minorTicks_ = null;
  this.ticks_ = null;
  this.line_ = this.bg_ = null;
  this.labelsBounds_ = null;

  anychart.polarModule.Axis.base(this, 'disposeInternal');
};


//endregion
//region --- Debug
// /**
//  * Debug method.
//  * @param {Array.<number>} points
//  * @param {acgraph.vector.Stroke=} opt_stroke
//  * @private
//  */
// anychart.polarModule.Axis.prototype.drawDebugPath_ = function(points, opt_stroke) {
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


//endregion
//region --- Standalone
//------------------------------------------------------------------------------
//
//  Standalone
//
//------------------------------------------------------------------------------
/**
 * @constructor
 * @extends {anychart.polarModule.Axis}
 */
anychart.standalones.axes.Polar = function() {
  anychart.standalones.axes.Polar.base(this, 'constructor');
};
goog.inherits(anychart.standalones.axes.Polar, anychart.polarModule.Axis);
anychart.core.makeStandalone(anychart.standalones.axes.Polar, anychart.polarModule.Axis);


/**
 * Returns axis instance.<br/>
 * <b>Note:</b> Any axis must be bound to a scale.
 * @return {!anychart.standalones.axes.Polar}
 */
anychart.standalones.axes.polar = function() {
  var axis = new anychart.standalones.axes.Polar();
  axis.addThemes('standalones.polarAxis');
  return axis;
};


//endregion
//region --- Export
//proto['startAngle'] = proto.startAngle;
//exports
(function() {
  var proto = anychart.polarModule.Axis.prototype;
  proto['labels'] = proto.labels;
  proto['minorLabels'] = proto.minorLabels;
  proto['ticks'] = proto.ticks;
  proto['minorTicks'] = proto.minorTicks;
  proto['scale'] = proto.scale;
  proto['getRemainingBounds'] = proto.getRemainingBounds;
  // auto
  // proto['stroke'] = proto.stroke
  // proto['fill'] = proto.fill;
  // proto['overlapMode'] = proto.overlapMode;

  proto = anychart.standalones.axes.Polar.prototype;
  goog.exportSymbol('anychart.standalones.axes.polar', anychart.standalones.axes.polar);
  proto['draw'] = proto.draw;
  proto['parentBounds'] = proto.parentBounds;
  proto['container'] = proto.container;
  // auto
  // proto['startAngle'] = proto.startAngle;
})();
//endregion
