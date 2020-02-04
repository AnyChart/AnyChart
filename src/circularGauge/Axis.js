goog.provide('anychart.circularGaugeModule.Axis');
goog.require('acgraph');
goog.require('anychart.circularGaugeModule.AxisTicks');
goog.require('anychart.color');
goog.require('anychart.core.VisualBase');
goog.require('anychart.core.ui.CircularLabelsFactory');
goog.require('anychart.enums');
goog.require('anychart.format.Context');
goog.require('anychart.math.Rect');
goog.require('anychart.scales.Base');
goog.require('anychart.utils');



/**
 * Circular axis class.<br/>
 * @extends {anychart.core.VisualBase}
 * @constructor
 */
anychart.circularGaugeModule.Axis = function() {
  anychart.circularGaugeModule.Axis.base(this, 'constructor');

  this.addThemes('defaultAxis');

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

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['overlapMode', this.ALL_VISUAL_STATES_, anychart.Signal.NEEDS_REDRAW],
    ['startAngle', this.ALL_VISUAL_STATES_, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['sweepAngle', this.ALL_VISUAL_STATES_, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['fill', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['width', this.ALL_VISUAL_STATES_, anychart.Signal.NEEDS_REDRAW],
    ['radius', this.ALL_VISUAL_STATES_, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['cornersRounding', this.ALL_VISUAL_STATES_, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['drawFirstLabel', this.ALL_VISUAL_STATES_, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['drawLastLabel', this.ALL_VISUAL_STATES_, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED]
  ]);
};
goog.inherits(anychart.circularGaugeModule.Axis, anychart.core.VisualBase);


/**
 * Circular gauge axis descriptors.
 * @type {!Object<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.circularGaugeModule.Axis.OWN_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  function sweepAngleNormalizer(opt_value) {
    return goog.isNull(opt_value) ? opt_value : goog.math.clamp(anychart.utils.toNumber(opt_value) || 0, -360, 360);
  }

  function startAngleNormalizer(opt_value) {
    return goog.isNull(opt_value) ? opt_value : goog.math.standardAngle(anychart.utils.toNumber(opt_value) || 0);
  }

  function nullPercentNormalizer(opt_value) {
    return goog.isNull(opt_value) ? opt_value : anychart.utils.normalizeToPercent(opt_value);
  }

  var d = anychart.core.settings.descriptors;
  anychart.core.settings.createDescriptors(map, [
    d.FILL,
    d.OVERLAP_MODE,
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'startAngle', startAngleNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'width', nullPercentNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'sweepAngle', sweepAngleNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'radius', nullPercentNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'cornersRounding', anychart.utils.normalizeToPercent],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'drawFirstLabel', anychart.core.settings.booleanNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'drawLastLabel', anychart.core.settings.booleanNormalizer]
  ]);

  return map;
})();
anychart.core.settings.populate(anychart.circularGaugeModule.Axis, anychart.circularGaugeModule.Axis.OWN_DESCRIPTORS);

/**
 * Supported consistency states.
 * @type {number}
 */
anychart.circularGaugeModule.Axis.prototype.SUPPORTED_SIGNALS =
    anychart.core.VisualBase.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.NEEDS_REAPPLICATION;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.circularGaugeModule.Axis.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.AXIS_LABELS |
    anychart.ConsistencyState.AXIS_TICKS |
    anychart.ConsistencyState.AXIS_OVERLAP;


/**
 * Axis line z-index in axis root layer.
 * @type {number}
 */
anychart.circularGaugeModule.Axis.ZINDEX_AXIS_LINE = 1;


/**
 * Tick element z-index in axis root layer.
 * @type {number}
 */
anychart.circularGaugeModule.Axis.ZINDEX_TICK = 2;


/**
 * Tick's Hatch fill z-index in axis root layer.
 * @type {number}
 */
anychart.circularGaugeModule.Axis.ZINDEX_TICK_HATCH_FILL = 3;


/**
 * Label z-index in axis root layer.
 * @type {number}
 */
anychart.circularGaugeModule.Axis.ZINDEX_LABEL = 4;


/**
 * @type {acgraph.vector.Path}
 * @private
 */
anychart.circularGaugeModule.Axis.prototype.line_ = null;


/**
 * @type {anychart.core.ui.CircularLabelsFactory}
 * @private
 */
anychart.circularGaugeModule.Axis.prototype.labels_ = null;


/**
 * @type {anychart.core.ui.CircularLabelsFactory}
 * @private
 */
anychart.circularGaugeModule.Axis.prototype.minorLabels_ = null;


/**
 * @type {anychart.circularGaugeModule.AxisTicks}
 * @private
 */
anychart.circularGaugeModule.Axis.prototype.ticks_ = null;


/**
 * @type {anychart.circularGaugeModule.AxisTicks}
 * @private
 */
anychart.circularGaugeModule.Axis.prototype.minorTicks_ = null;


/**
 * @type {anychart.scales.Base}
 * @private
 */
anychart.circularGaugeModule.Axis.prototype.scale_;


/**
 * Scale.
 * @param {(anychart.enums.GaugeScaleTypes|anychart.scales.Linear|Object)=} opt_value Scale to set.
 * @return {anychart.scales.Linear|anychart.scales.Logarithmic|anychart.circularGaugeModule.Axis} Axis scale value or itself for method chaining.
 */
anychart.circularGaugeModule.Axis.prototype.scale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = anychart.scales.Base.setupScale(this.scale_, opt_value, null, anychart.scales.Base.ScaleTypes.SCATTER, null, this.scaleInvalidated_, this);
    if (val) {
      var dispatch = this.scale_ == val;
      this.scale_ = val;
      val.resumeSignalsDispatching(dispatch);
      if (!dispatch)
        this.invalidate(this.ALL_VISUAL_STATES_, anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  } else {
    if (!this.scale_) {
      this.scale_ = anychart.scales.linear();
      this.scale_.listenSignals(this.scaleInvalidated_, this);
    }
    return /** @type {anychart.scales.Linear|anychart.scales.Logarithmic} */(this.scale_);
  }
};


/**
 * @param {string} value String scale name.
 * @return {anychart.scales.Linear|anychart.scales.Logarithmic} Scale for gauge axis.
 * @private
 */
anychart.circularGaugeModule.Axis.prototype.getGaugeScale_ = function(value) {
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
anychart.circularGaugeModule.Axis.prototype.scaleInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(this.ALL_VISUAL_STATES_, anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEEDS_REAPPLICATION);
  }
};


//----------------------------------------------------------------------------------------------------------------------
//                                                Axis exports methods
//----------------------------------------------------------------------------------------------------------------------
/**
 * @param {(Object|boolean|null)=} opt_value Axis labels.
 * @return {!(anychart.core.ui.CircularLabelsFactory|anychart.circularGaugeModule.Axis)} Axis labels of itself for method chaining.
 */
anychart.circularGaugeModule.Axis.prototype.minorLabels = function(opt_value) {
  if (!this.minorLabels_) {
    this.minorLabels_ = new anychart.core.ui.CircularLabelsFactory();
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
 * @return {!(anychart.core.ui.CircularLabelsFactory|anychart.circularGaugeModule.Axis)} Axis labels of itself for method chaining.
 */
anychart.circularGaugeModule.Axis.prototype.labels = function(opt_value) {
  if (!this.labels_) {
    this.labels_ = new anychart.core.ui.CircularLabelsFactory();
    this.setupCreated('labels', this.labels_);
    this.labels_.setupInternal(true, this.getThemeOption('labels'));
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
anychart.circularGaugeModule.Axis.prototype.labelsInvalidated_ = function(event) {
  this.dropBoundsCache_();
  this.invalidate(anychart.ConsistencyState.AXIS_LABELS | anychart.ConsistencyState.AXIS_TICKS, anychart.Signal.NEEDS_REDRAW);
};


/**
 * @param {(Object|boolean|null)=} opt_value Axis ticks.
 * @return {!(anychart.circularGaugeModule.AxisTicks|anychart.circularGaugeModule.Axis)} Axis ticks or itself for method chaining.
 */
anychart.circularGaugeModule.Axis.prototype.minorTicks = function(opt_value) {
  if (!this.minorTicks_) {
    this.minorTicks_ = new anychart.circularGaugeModule.AxisTicks();
    this.setupCreated('minorTicks', this.minorTicks_);
    this.minorTicks_.setParentEventTarget(this);
    this.minorTicks_.setAxis(this);
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
 * @return {!(anychart.circularGaugeModule.AxisTicks|anychart.circularGaugeModule.Axis)} Axis ticks or itself for method chaining.
 */
anychart.circularGaugeModule.Axis.prototype.ticks = function(opt_value) {
  if (!this.ticks_) {
    this.ticks_ = new anychart.circularGaugeModule.AxisTicks();
    this.setupCreated('ticks', this.ticks_);
    this.ticks_.setParentEventTarget(this);
    this.ticks_.setAxis(this);
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
anychart.circularGaugeModule.Axis.prototype.ticksInvalidated_ = function(event) {
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


//----------------------------------------------------------------------------------------------------------------------
//                                                Axis internal methods
//----------------------------------------------------------------------------------------------------------------------
/**
 * @return {number}
 */
anychart.circularGaugeModule.Axis.prototype.getPixWidth = function() {
  return this.axisWidth_;
};


/**
 * @return {number}
 */
anychart.circularGaugeModule.Axis.prototype.getPixRadius = function() {
  return this.pixRadius_;
};


/**
 * Internal getter for fixed gauge start angle. All for human comfort.
 * @return {number}
 */
anychart.circularGaugeModule.Axis.prototype.getStartAngle = function() {
  var startAngle = this.getOption('startAngle');
  return goog.isDefAndNotNull(startAngle) ?
      startAngle + anychart.circularGaugeModule.Chart.DEFAULT_START_ANGLE :
      this.gauge_.getStartAngle();
};


/**
 * Internal getter for sweep angle. All for human comfort.
 * @return {number}
 */
anychart.circularGaugeModule.Axis.prototype.getSweepAngle = function() {
  var sweepAngle = /** @type {number} */(this.getOption('sweepAngle'));
  return goog.isDef(sweepAngle) ? sweepAngle : /** @type {number} */(this.gauge_.getOption('sweepAngle'));
};


/**
 * @private
 */
anychart.circularGaugeModule.Axis.prototype.dropBoundsCache_ = function() {
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
anychart.circularGaugeModule.Axis.prototype.getOverlappedLabels_ = function() {
  if (!this.overlappedLabels_ || this.hasInvalidationState(anychart.ConsistencyState.AXIS_OVERLAP)) {
    if (this.getOption('overlapMode') == anychart.enums.LabelsOverlapMode.ALLOW_OVERLAP) {
      return false;
    } else {
      var scale = /** @type {anychart.scales.ScatterBase} */(this.scale());
      var labels = [];
      var minorLabels = [];
      var drawFirstLabel = /** @type {boolean} */(this.getOption('drawFirstLabel'));
      var drawLastLabel = /** @type {boolean} */(this.getOption('drawLastLabel'));

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
      var prevDrawableLabel = drawLastLabel && !drawFirstLabel ? ticksArrLen - 1 : -1;
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
            if ((!k && drawFirstLabel) || (k == ticksArrLen - 1 && drawLastLabel) || (k != 0 && k != ticksArrLen - 1))
              bounds1 = this.getLabelBounds_(k, true);
            else
              bounds1 = null;

            //bounds of last drawable label
            if (prevDrawableLabel != -1)
              bounds2 = this.getLabelBounds_(prevDrawableLabel, true);
            else
              bounds2 = null;

            //for circular usage we need compare all labels with first drawable label
            if (drawLastLabel && !drawFirstLabel) {
              bounds3 = k == ticksArrLen - 1 ? null : this.getLabelBounds_(ticksArrLen - 1, true);
            } else if (k != firstDrawableLabel)
              bounds3 = this.getLabelBounds_(firstDrawableLabel, true);
            else
              bounds3 = null;

            if (!(anychart.math.checkRectIntersection(bounds1, bounds2) ||
                anychart.math.checkRectIntersection(bounds1, bounds3))) {
              tempRatio = scale.transform(scaleTicksArr[k]);
              if ((tempRatio <= 0 && drawFirstLabel) || (tempRatio >= 1 && drawLastLabel))
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
anychart.circularGaugeModule.Axis.prototype.getLabelRadius_ = function(height, isMajor, radiusOffset) {
  var ticks = isMajor ? this.ticks() : this.minorTicks();
  var labels = isMajor ? this.labels() : this.minorLabels();

  var labelsPosition = anychart.enums.normalizeGaugeSidePosition(labels.getOption('position'));

  var radius = this.pixRadius_;
  var ticksPosition = /** @type {anychart.enums.GaugeSidePosition} */(ticks.getOption('position'));
  if (labelsPosition == anychart.enums.GaugeSidePosition.OUTSIDE) {
    radius += this.axisWidth_ / 2 + radiusOffset;
    if (ticks.enabled())
      if (ticksPosition == anychart.enums.GaugeSidePosition.OUTSIDE)
        radius += ticks.getPixLength();
      else if (ticksPosition == anychart.enums.GaugeSidePosition.CENTER)
        radius += ticks.getPixLength() > this.axisWidth_ ? (ticks.getPixLength() - this.axisWidth_) / 2 : 0;
  } else if (labelsPosition == anychart.enums.GaugeSidePosition.INSIDE) {
    radius -= this.axisWidth_ / 2 + radiusOffset;
    if (ticks.enabled())
      if (ticksPosition == anychart.enums.GaugeSidePosition.INSIDE)
        radius -= ticks.getPixLength();
      else if (ticksPosition == anychart.enums.GaugeSidePosition.CENTER)
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
anychart.circularGaugeModule.Axis.prototype.getLabelAngle_ = function(angle) {
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
anychart.circularGaugeModule.Axis.prototype.getLabelBoundsWithoutTransform_ = function(index, isMajor) {
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
    boundsWTCache[index] = labels.measureWithoutAutoRotate(label);
  else
    boundsWTCache[index] = labels.measureWithoutAutoRotate(formatProvider, positionProvider);

  return boundsWTCache[index];
};


/**
 * Calculates label bounds and caches actual position coordinates.
 * @param {number} index Label index.
 * @param {boolean} isMajor IsMajor.
 * @return {Array.<number>} Label bounds.
 * @private
 */
anychart.circularGaugeModule.Axis.prototype.getLabelBounds_ = function(index, isMajor) {
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
  var autoRotate = label && goog.isDef(label.getOption('autoRotate')) ? label.getOption('autoRotate') : labels.getOption('autoRotate');
  var offsetX = label && goog.isDef(label.getOption('offsetX')) ? label.getOption('offsetX') : labels.getOption('offsetX');
  var offsetY = label && goog.isDef(label.getOption('offsetY')) ? label.getOption('offsetY') : labels.getOption('offsetY');

  var radius = this.getLabelRadius_(bounds.height, isMajor, autoRotate ? bounds.height : 0);
  radius += anychart.utils.normalizeSize(/** @type {number|string} */(offsetY), this.gauge_.getPixRadius());

  var startAngle = this.getStartAngle();
  var sweepAngle = this.getSweepAngle();

  var angle = goog.math.standardAngle(startAngle + ratio * sweepAngle);
  angle += anychart.utils.normalizeSize(/** @type {number|string} */(offsetX), sweepAngle);

  var angleRad = goog.math.toRadians(angle);

  var x = this.gauge_.getCx() + radius * Math.cos(angleRad);
  var y = this.gauge_.getCy() + radius * Math.sin(angleRad);

  var rotation = label && goog.isDef(label.getOption('rotation')) ?
      label.getOption('rotation') :
      labels.getOption('rotation');

  if (autoRotate)
    rotation += this.getLabelAngle_(angle);

  var anchor = label && goog.isDef(label.getOption('anchor')) ?
      label.getOption('anchor') :
      autoRotate ?
          labels.getOption('anchor') :
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
anychart.circularGaugeModule.Axis.prototype.getLabelsFormatProvider_ = function(index, value) {
  var scale = this.scale();

  var values = {
    'axis': {value: this, type: anychart.enums.TokenType.UNKNOWN},
    'index': {value: index, type: anychart.enums.TokenType.NUMBER},
    'value': {value: scale.roundToTicksPrecision(parseFloat(value)), type: anychart.enums.TokenType.NUMBER},
    'tickValue': {value: parseFloat(value), type: anychart.enums.TokenType.NUMBER},
    'max': {value: goog.isDef(scale.max) ? scale.max : null, type: anychart.enums.TokenType.NUMBER},
    'min': {value: goog.isDef(scale.min) ? scale.min : null, type: anychart.enums.TokenType.NUMBER},
    'scale': {value: scale, type: anychart.enums.TokenType.UNKNOWN}
  };

  var aliases = {};
  aliases[anychart.enums.StringToken.AXIS_SCALE_MAX] = 'max';
  aliases[anychart.enums.StringToken.AXIS_SCALE_MIN] = 'mix';

  var context = new anychart.format.Context(values);
  context.tokenAliases(aliases);

  return context.propagate();
};


/**
 * Anchor for angle of label
 * @param {number} angle Label angle.
 * @return {anychart.enums.Anchor}
 * @private
 */
anychart.circularGaugeModule.Axis.prototype.getAnchorForLabel_ = function(angle) {
  angle = goog.math.standardAngle(anychart.math.specialRound(angle, 6));
  var anchor = anychart.enums.Anchor.CENTER;
  var position = anychart.enums.normalizeGaugeSidePosition(this.labels().getOption('position'));

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
anychart.circularGaugeModule.Axis.prototype.drawLabel_ = function(index, angle, isMajor) {
  var scale = /** @type {anychart.scales.ScatterBase} */(this.scale_);
  var scaleTicksArr = isMajor ? scale.ticks().get() : scale.minorTicks().get();
  var labels = isMajor ? this.labels() : this.minorLabels();
  var label = labels.getLabel(index);
  var autoRotate = label && goog.isDef(label.getOption('autoRotate')) ? label.getOption('autoRotate') : labels.getOption('autoRotate');

  var bounds = this.getLabelBoundsWithoutTransform_(index, isMajor);
  var radius = this.getLabelRadius_(bounds.height, isMajor, autoRotate ? bounds.height : 0);

  var formatProvider = this.getLabelsFormatProvider_(index, scaleTicksArr[index]);
  var positionProvider = {'value': {'angle': angle, 'radius': radius}};
  label = labels.add(formatProvider, positionProvider, index);

  if (!autoRotate) {
    var sweepAngle = this.getSweepAngle();
    var offsetX = label && goog.isDef(label['offsetX']()) ? label['offsetX']() : labels['offsetX']();
    angle += anychart.utils.normalizeSize(/** @type {number|string} */(offsetX), sweepAngle);

    label['anchor'](this.getAnchorForLabel_(angle));
  }
};


/**
 * Set/get link to gauge.
 * @param {anychart.circularGaugeModule.Chart=} opt_gauge Gauge inst for set.
 * @return {anychart.circularGaugeModule.Axis|anychart.circularGaugeModule.Chart}
 */
anychart.circularGaugeModule.Axis.prototype.gauge = function(opt_gauge) {
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
anychart.circularGaugeModule.Axis.prototype.remove = function() {
  if (this.line_) this.line_.parent(null);
  this.ticks().remove();
  this.labels().remove();
  this.minorTicks().remove();
  this.minorLabels().remove();
};


/**
 * Drawing.
 * @return {anychart.circularGaugeModule.Axis}
 */
anychart.circularGaugeModule.Axis.prototype.draw = function() {
  if (!this.checkDrawingNeeded())
    return this;

  var scale = this.scale();

  var ticksDrawer, labelsDrawer, minorTicksDrawer, minorLabelsDrawer;

  var startAngle = this.getStartAngle();
  var sweepAngle = this.getSweepAngle();
  var cx = this.gauge_.getCx();
  var cy = this.gauge_.getCy();

  if (!this.line_) {
    this.line_ = acgraph.path();
    this.bindHandlersToGraphics(this.line_);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    var radius = /** @type {null|string|number} */(this.getOption('radius'));
    var width = /** @type {null|number|string} */(this.getOption('width'));
    this.pixRadius_ = anychart.utils.normalizeSize(
        goog.isDefAndNotNull(radius) ? radius : '100%', this.gauge_.getPixRadius());
    this.axisWidth_ = anychart.utils.normalizeSize(
        goog.isDefAndNotNull(width) ? width : '3%', this.gauge_.getPixRadius());

    var cornersRoundingPix = anychart.utils.normalizeSize(/** @type {string} */ (this.getOption('cornersRounding')), this.axisWidth_);

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
    this.line_.fill(/** @type {acgraph.vector.Fill} */(this.getOption('fill')));
    this.line_.stroke(null);

    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.AXIS_TICKS)) {
    var ticks = /** @type {anychart.circularGaugeModule.AxisTicks} */(this.ticks());
    ticks.invalidate(anychart.ConsistencyState.BOUNDS);
    ticks.startDrawing();
    ticksDrawer = ticks.drawTick;

    var minorTicks = /** @type {anychart.circularGaugeModule.AxisTicks} */(this.minorTicks());
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
    var multiplier = anychart.circularGaugeModule.Chart.ZINDEX_MULTIPLIER * 0.1;
    this.line_.zIndex(zIndex + anychart.circularGaugeModule.Axis.ZINDEX_AXIS_LINE * multiplier);
    this.ticks().zIndex(zIndex);
    this.minorTicks().zIndex(zIndex);
    this.labels().zIndex(zIndex + anychart.circularGaugeModule.Axis.ZINDEX_LABEL * multiplier);
    this.minorLabels().zIndex(zIndex + anychart.circularGaugeModule.Axis.ZINDEX_LABEL * multiplier);

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
          ticksDrawer.call(this.ticks_, angle, tickVal);

        if (drawLabel && labelsDrawer)
          labelsDrawer.call(this, i, angle, true);

        prevMajorRatio = ratio;
        i++;
      } else {
        angle = goog.math.standardAngle(startAngle + minorRatio * sweepAngle);

        drawLabel = goog.isArray(needDrawMinorLabels) ? needDrawMinorLabels[j] : needDrawMinorLabels;
        drawTick = (goog.isArray(needDrawMinorLabels) && needDrawMinorLabels[j]) || goog.isBoolean(needDrawMinorLabels);

        if (drawTick && minorTicksDrawer && prevMajorRatio != minorRatio)
          minorTicksDrawer.call(this.minorTicks_, angle, minorTickVal);

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
anychart.circularGaugeModule.Axis.prototype.serialize = function() {
  var json = anychart.circularGaugeModule.Axis.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.circularGaugeModule.Axis.OWN_DESCRIPTORS, json);

  json['scale'] = this.scale().serialize();

  json['ticks'] = this.ticks().serialize();
  json['minorTicks'] = this.minorTicks().serialize();
  json['labels'] = this.labels().serialize();
  json['minorLabels'] = this.minorLabels().serialize();

  return json;
};


/** @inheritDoc */
anychart.circularGaugeModule.Axis.prototype.setupByJSON = function(config, opt_default) {
  anychart.circularGaugeModule.Axis.base(this, 'setupByJSON', config, opt_default);

  anychart.core.settings.deserialize(this, anychart.circularGaugeModule.Axis.OWN_DESCRIPTORS, config, opt_default);

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

  this.labels().setupInternal(!!opt_default, config['labels']);
  this.minorLabels().setupInternal(!!opt_default, config['minorLabels']);
};


/** @inheritDoc */
anychart.circularGaugeModule.Axis.prototype.disposeInternal = function() {
  goog.disposeAll(this.labels_, this.minorLabels_, this.ticks_, this.minorTicks_, this.line_);
  this.minorLabels_ = null;
  this.labels_ = null;
  this.ticks_ = null;
  this.minorTicks_ = null;
  this.line_ = null;
  anychart.circularGaugeModule.Axis.base(this, 'disposeInternal');
};


//exports
(function() {
  var proto = anychart.circularGaugeModule.Axis.prototype;
  proto['scale'] = proto.scale;

  proto['ticks'] = proto.ticks;
  proto['minorTicks'] = proto.minorTicks;

  proto['labels'] = proto.labels;
  proto['minorLabels'] = proto.minorLabels;

  // auto
  // proto['overlapMode'] = proto.overlapMode;
  // proto['startAngle'] = proto.startAngle;
  // proto['sweepAngle'] = proto.sweepAngle;
  // proto['fill'] = proto.fill;
  // proto['width'] = proto.width;
  // proto['radius'] = proto.radius;
  // proto['cornersRounding'] = proto.cornersRounding;
  // proto['drawFirstLabel'] = proto.drawFirstLabel;
  // proto['drawLastLabel'] = proto.drawLastLabel;
})();


