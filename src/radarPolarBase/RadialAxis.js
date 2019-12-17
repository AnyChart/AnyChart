//region --- Provide and Require
goog.provide('anychart.radarPolarBaseModule.RadialAxis');
goog.provide('anychart.standalones.axes.Radial');
goog.require('acgraph');
goog.require('anychart.color');
goog.require('anychart.core.IAxis');
goog.require('anychart.core.IStandaloneBackend');
goog.require('anychart.core.VisualBase');
goog.require('anychart.core.reporting');
goog.require('anychart.core.ui.LabelsFactory');
goog.require('anychart.enums');
goog.require('anychart.format.Context');
goog.require('anychart.math.Rect');
goog.require('anychart.radarPolarBaseModule.RadialAxisTicks');
goog.require('anychart.scales');
goog.require('anychart.utils');
//endregion



/**
 * Axis Class.<br/>
 * Any axis must be bound to a scale.<br/>
 * To obtain a new instance of Axis use {@link anychart.standalones.axes.linear}.
 * @example <t>simple-h100</t>
 * anychart.standalones.axes.linear()
 *    .scale(anychart.scales.linear())
 *    .container(stage).draw();
 * @constructor
 * @extends {anychart.core.VisualBase}
 * @implements {anychart.core.IStandaloneBackend}
 * @implements {anychart.core.IAxis}
 */
anychart.radarPolarBaseModule.RadialAxis = function() {
  this.suspendSignalsDispatching();
  anychart.radarPolarBaseModule.RadialAxis.base(this, 'constructor');

  this.addThemes(anychart.themes.DefaultThemes['axis']);

  this.labelsBounds_ = [];
  this.minorLabelsBounds_ = [];

  this.line_ = acgraph.path();
  this.bindHandlersToGraphics(this.line_);

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

  function beforeInvalidationHook() {
    this.dropBoundsCache_();
  }

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['drawFirstLabel', this.ALL_VISUAL_STATES_, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['drawLastLabel', this.ALL_VISUAL_STATES_, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['overlapMode', this.ALL_VISUAL_STATES_, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['stroke', this.ALL_VISUAL_STATES_, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['startAngle', this.ALL_VISUAL_STATES_, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED, 0, beforeInvalidationHook],
    ['innerRadius', this.ALL_VISUAL_STATES_, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED]
  ]);
};
goog.inherits(anychart.radarPolarBaseModule.RadialAxis, anychart.core.VisualBase);


/**
 * Properties descriptors.
 * @type {!Object<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.radarPolarBaseModule.RadialAxis.PROPERTY_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  var descriptors = anychart.core.settings.descriptors;

  function innerRadiusNormalizer(opt_value) {
    return anychart.utils.normalizeNumberOrPercent(opt_value, this.getOption('innerRadius'));
  }

  anychart.core.settings.createDescriptors(map, [
    descriptors.START_ANGLE,
    descriptors.OVERLAP_MODE,
    descriptors.STROKE,
    descriptors.DRAW_FIRST_LABEL,
    descriptors.DRAW_LAST_LABEL,
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'innerRadius', innerRadiusNormalizer]
  ]);

  return map;
})();
anychart.core.settings.populate(anychart.radarPolarBaseModule.RadialAxis, anychart.radarPolarBaseModule.RadialAxis.PROPERTY_DESCRIPTORS);


//region --- States and Signals
/**
 * Supported consistency states.
 * @type {number}
 */
anychart.radarPolarBaseModule.RadialAxis.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.AXIS_LABELS |
    anychart.ConsistencyState.AXIS_TICKS |
    anychart.ConsistencyState.AXIS_OVERLAP;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.radarPolarBaseModule.RadialAxis.prototype.SUPPORTED_SIGNALS = anychart.core.VisualBase.prototype.SUPPORTED_SIGNALS;


//endregion
//region --- Properties
/**
 * @type {acgraph.vector.Path}
 * @private
 */
anychart.radarPolarBaseModule.RadialAxis.prototype.line_ = null;


/**
 * @type {string}
 * @private
 */
anychart.radarPolarBaseModule.RadialAxis.prototype.name_ = 'axis';


/**
 * @type {anychart.core.ui.LabelsFactory}
 * @private
 */
anychart.radarPolarBaseModule.RadialAxis.prototype.labels_ = null;


/**
 * @type {anychart.core.ui.LabelsFactory}
 * @private
 */
anychart.radarPolarBaseModule.RadialAxis.prototype.minorLabels_ = null;


/**
 * @type {anychart.radarPolarBaseModule.RadialAxisTicks}
 * @private
 */
anychart.radarPolarBaseModule.RadialAxis.prototype.ticks_ = null;


/**
 * @type {anychart.radarPolarBaseModule.RadialAxisTicks}
 * @private
 */
anychart.radarPolarBaseModule.RadialAxis.prototype.minorTicks_ = null;


/**
 * @type {string|acgraph.vector.Stroke}
 * @private
 */
anychart.radarPolarBaseModule.RadialAxis.prototype.stroke_;


/**
 * @type {anychart.scales.Base}
 * @private
 */
anychart.radarPolarBaseModule.RadialAxis.prototype.scale_ = null;


/**
 * @type {anychart.enums.LabelsOverlapMode}
 * @private
 */
anychart.radarPolarBaseModule.RadialAxis.prototype.overlapMode_ = anychart.enums.LabelsOverlapMode.NO_OVERLAP;


/**
 * @type {number}
 * @private
 */
anychart.radarPolarBaseModule.RadialAxis.prototype.length_ = NaN;


/**
 * @type {boolean}
 * @private
 */
anychart.radarPolarBaseModule.RadialAxis.prototype.drawFirstLabel_ = true;


/**
 * @type {boolean}
 * @private
 */
anychart.radarPolarBaseModule.RadialAxis.prototype.drawLastLabel_ = true;


/**
 * @type {Array.<Array.<number>>}
 * @private
 */
anychart.radarPolarBaseModule.RadialAxis.prototype.labelsBounds_ = null;


/**
 * @type {Array.<Array.<number>>}
 * @private
 */
anychart.radarPolarBaseModule.RadialAxis.prototype.minorLabelsBounds_ = null;


//endregion
//region --- Settings
/**
 * Getter/setter for labels.
 * @param {(Object|boolean|null)=} opt_value Axis labels.
 * @return {!(anychart.core.ui.LabelsFactory|anychart.radarPolarBaseModule.RadialAxis)} Axis labels of itself for method chaining.
 */
anychart.radarPolarBaseModule.RadialAxis.prototype.labels = function(opt_value) {
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
anychart.radarPolarBaseModule.RadialAxis.prototype.labelsInvalidated_ = function(event) {
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
 * @return {!(anychart.core.ui.LabelsFactory|anychart.radarPolarBaseModule.RadialAxis)} Axis labels of itself for method chaining.
 */
anychart.radarPolarBaseModule.RadialAxis.prototype.minorLabels = function(opt_value) {
  if (!this.minorLabels_) {
    this.minorLabels_ = new anychart.core.ui.LabelsFactory();
    this.setupCreated('minorLabels', this.minorLabels_);
    this.minorLabels_.setParentEventTarget(this);
    this.minorLabels_.listenSignals(this.minorLabelsInvalidated_, this);
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
anychart.radarPolarBaseModule.RadialAxis.prototype.minorLabelsInvalidated_ = function(event) {
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
 * @return {!(anychart.radarPolarBaseModule.RadialAxisTicks|anychart.radarPolarBaseModule.RadialAxis)} Axis ticks or itself for method chaining.
 */
anychart.radarPolarBaseModule.RadialAxis.prototype.ticks = function(opt_value) {
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
anychart.radarPolarBaseModule.RadialAxis.prototype.ticksInvalidated_ = function(event) {
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
 * @return {!(anychart.radarPolarBaseModule.RadialAxisTicks|anychart.radarPolarBaseModule.RadialAxis)} Axis ticks or itself for method chaining.
 */
anychart.radarPolarBaseModule.RadialAxis.prototype.minorTicks = function(opt_value) {
  if (!this.minorTicks_) {
    this.minorTicks_ = new anychart.radarPolarBaseModule.RadialAxisTicks();
    this.setupCreated('minorTicks', this.minorTicks_);
    this.minorTicks_.setParentEventTarget(this);
    this.minorTicks_.listenSignals(this.minorTicksInvalidated_, this);
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
anychart.radarPolarBaseModule.RadialAxis.prototype.minorTicksInvalidated_ = function(event) {
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
 * Getter/setter for scale.
 * @param {(anychart.scales.Base|anychart.enums.ScaleTypes|Object)=} opt_value Scale.
 * @return {anychart.scales.Base|!anychart.radarPolarBaseModule.RadialAxis} Axis scale or itself for method chaining.
 */
anychart.radarPolarBaseModule.RadialAxis.prototype.scale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = anychart.scales.Base.setupScale(this.scale_, opt_value, null,
        anychart.scales.Base.ScaleTypes.ALL_DEFAULT, null, this.scaleInvalidated_, this);
    if (val) {
      var dispatch = this.scale_ == val;
      this.scale_ = /** @type {anychart.scales.Linear} */(val);
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
anychart.radarPolarBaseModule.RadialAxis.prototype.scaleInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.dropBoundsCache_();
    this.invalidate(this.ALL_VISUAL_STATES_, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
  }
};


//endregion
//region --- Utils
/** @inheritDoc */
anychart.radarPolarBaseModule.RadialAxis.prototype.invalidateParentBounds = function() {
  this.invalidate(this.ALL_VISUAL_STATES_, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
};


/**
 * Drops labels calls cache.
 */
anychart.radarPolarBaseModule.RadialAxis.prototype.dropLabelCallsCache = function() {
  if (this.labels_)
    this.labels_.dropCallsCache();
  if (this.minorLabels_)
    this.minorLabels_.dropCallsCache();
};


/**
 * @private
 */
anychart.radarPolarBaseModule.RadialAxis.prototype.dropBoundsCache_ = function() {
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
anychart.radarPolarBaseModule.RadialAxis.prototype.getOverlappedLabels_ = function(opt_bounds) {
  if (!this.overlappedLabels_ || this.hasInvalidationState(anychart.ConsistencyState.AXIS_OVERLAP)) {
    if (this.getOption('overlapMode') == anychart.enums.LabelsOverlapMode.ALLOW_OVERLAP) {
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

        var drawFirstLabel = /** @type {boolean} */(this.getOption('drawFirstLabel'));
        var drawLastLabel = /** @type {boolean} */(this.getOption('drawLastLabel'));
        if (anychart.utils.instanceOf(scale, anychart.scales.ScatterBase)) {
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

                if (k != ticksArrLen - 1 && drawLastLabel)
                  bounds3 = this.getLabelBounds_(ticksArrLen - 1, true);

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
                  if ((tempRatio <= 0 && drawFirstLabel) || (tempRatio >= 1 && drawLastLabel)) {
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
        } else if (anychart.utils.instanceOf(scale, anychart.scales.Ordinal)) {
          for (i = 0; i < ticksArrLen; i++) {
            if (isLabels) {
              bounds1 = this.getLabelBounds_(i, true);

              if (prevDrawableLabel != -1)
                bounds2 = this.getLabelBounds_(prevDrawableLabel, true);

              if (i != ticksArrLen - 1 && drawLastLabel)
                bounds3 = this.getLabelBounds_(ticksArrLen - 1, true);
              else
                bounds3 = null;

              if (!i) {
                if (drawFirstLabel) {
                  prevDrawableLabel = i;
                  labels.push(true);
                } else {
                  labels.push(false);
                }
              } else if (i == ticksArrLen - 1) {
                if (drawLastLabel) {
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
anychart.radarPolarBaseModule.RadialAxis.prototype.calcLabels_ = function(opt_bounds) {
  return this.getOverlappedLabels_(opt_bounds);
};


/**
 * Axis calculation.
 * @private
 */
anychart.radarPolarBaseModule.RadialAxis.prototype.calculateAxis_ = function() {
  var parentBounds = this.parentBounds();
  this.length_ = Math.min(parentBounds.width, parentBounds.height) / 2;
  this.innerLength_ = anychart.utils.normalizeSize(/** @type {number} */(this.getOption('innerRadius')), this.length_);
  if (this.innerLength_ == this.length_) this.innerLength_--;
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
anychart.radarPolarBaseModule.RadialAxis.prototype.getLabelBounds_ = function(index, isMajor) {
  var boundsCache = isMajor ? this.labelsBounds_ : this.minorLabelsBounds_;
  if (goog.isDef(boundsCache[index]))
    return boundsCache[index];

  var ticks = /** @type {!anychart.radarPolarBaseModule.RadialAxisTicks} */(isMajor ? this.ticks() : this.minorTicks());
  var ticksPosition = /** @type {anychart.enums.SidePosition} */(ticks.getOption('position'));
  var ticksSidePosition = anychart.utils.sidePositionToNumber(ticksPosition);

  var lineThickness = anychart.utils.extractThickness(/** @type {acgraph.vector.Stroke} */(this.getOption('stroke')));
  var halfThickness = ticksSidePosition < 0 ? Math.ceil(lineThickness / 2) : Math.floor(lineThickness / 2);
  var labels = /** @type {anychart.core.ui.LabelsFactory} */(isMajor ? this.labels() : this.minorLabels());
  var labelsPosition = /** @type {anychart.enums.SidePosition} */(labels.getOption('position'));
  var labelsSidePosition = anychart.utils.sidePositionToNumber(labelsPosition);

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
  var formatProvider = this.getLabelsFormatProvider_(index, value);
  var positionProvider = {'value': {'x': 0, 'y': 0}};
  var labelBounds = labels.measure(formatProvider, positionProvider, undefined, index);

  var radius = this.innerLength_ + (this.length_ - this.innerLength_) * ratio;
  var angle = goog.math.standardAngle(/** @type {number} */(this.getOption('startAngle')) - 90);
  var angleRad = goog.math.toRadians(angle);

  var x = this.cx_ + radius * Math.cos(angleRad);
  var y = this.cy_ + radius * Math.sin(angleRad);

  var angle_ = goog.math.toRadians(goog.math.standardAngle(90 - angle - 270));

  var ticksLength = anychart.utils.getAffectBoundsTickLength(ticks, labelsSidePosition);

  var ticksDx = ticksLength * Math.sin(angle_);
  var ticksDy = ticksLength * Math.cos(angle_);

  var lineDx = labelsSidePosition * halfThickness * Math.sin(angle_);
  var lineDy = labelsSidePosition * halfThickness * Math.cos(angle_);

  var offset = this.getLabelPositionOffsetForAngle_(goog.math.standardAngle(angle + 90), labelBounds);
  var labelDx = offset.x * labelsSidePosition;
  var labelDy = offset.y * labelsSidePosition;

  positionProvider['value']['x'] = x + labelDx + ticksDx + lineDx;
  positionProvider['value']['y'] = y + labelDy + ticksDy + lineDy;

  return boundsCache[index] = labels.measureWithTransform(formatProvider, positionProvider, undefined, index);
};


/**
 * Returns labels anchor for angle.
 * @param {number} angle .
 * @param {anychart.math.Rect} bounds .
 * @return {{x: number, y: number}} .
 * @private
 */
anychart.radarPolarBaseModule.RadialAxis.prototype.getLabelPositionOffsetForAngle_ = function(angle, bounds) {
  var width = bounds.width, height = bounds.height;

  var scale = this.scale();
  var offset = {x: 0, y: 0};
  if (anychart.utils.instanceOf(scale, anychart.scales.ScatterBase)) {
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
  } else if (anychart.utils.instanceOf(scale, anychart.scales.Ordinal)) {
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
 * Gets format provider for label.
 * @param {number} index Label index.
 * @param {string|number} value Label value.
 * @return {Object} Labels format provider.
 * @private
 */
anychart.radarPolarBaseModule.RadialAxis.prototype.getLabelsFormatProvider_ = function(index, value) {
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
    values['max'] = {value: goog.isDef(scale.max) ? scale.max : null, type: anychart.enums.TokenType.NUMBER};
    values['min'] = {value: goog.isDef(scale.min) ? scale.min : null, type: anychart.enums.TokenType.NUMBER};
  }

  var aliases = {};
  aliases[anychart.enums.StringToken.AXIS_SCALE_MAX] = 'max';
  aliases[anychart.enums.StringToken.AXIS_SCALE_MIN] = 'min';

  var context = new anychart.format.Context(values);
  context.tokenAliases(aliases);

  return context.propagate();
};


//endregion
//region --- Drawing
/**
 * Axis line drawer.
 * @private
 */
anychart.radarPolarBaseModule.RadialAxis.prototype.drawLine_ = function() {
  var angle = goog.math.standardAngle(/** @type {number} */(this.getOption('startAngle')) - 90);
  var angleRad = goog.math.toRadians(angle);

  var xPixelShift = 0;
  var yPixelShift = 0;

  var lineThickness = anychart.utils.extractThickness(/** @type {acgraph.vector.Stroke} */(this.getOption('stroke')));
  if (!angle) {
    yPixelShift = lineThickness % 2 == 0 ? 0 : -.5;
  } else if (angle == 90) {
    xPixelShift = lineThickness % 2 == 0 ? 0 : -.5;
  } else if (angle == 180) {
    yPixelShift = lineThickness % 2 == 0 ? 0 : .5;
  } else if (angle == 270) {
    xPixelShift = lineThickness % 2 == 0 ? 0 : .5;
  }

  var x = Math.round(this.cx_ + this.length_ * Math.cos(angleRad));
  var y = Math.round(this.cy_ + this.length_ * Math.sin(angleRad));
  var zeroX = Math.round(this.cx_ + this.innerLength_ * Math.cos(angleRad));
  var zeroY = Math.round(this.cy_ + this.innerLength_ * Math.sin(angleRad));

  this.line_
      .moveTo(zeroX + xPixelShift, zeroY + yPixelShift)
      .lineTo(x + xPixelShift, y + yPixelShift);
};


/**
 * Ticks drawer.
 * @param {number} ratio Ratio.
 * @param {boolean} isMajor Is major label.
 * @private
 */
anychart.radarPolarBaseModule.RadialAxis.prototype.drawTick_ = function(ratio, isMajor) {
  var angle = goog.math.standardAngle(/** @type {number} */(this.getOption('startAngle')) - 90);
  var angleRad = goog.math.toRadians(angle);
  var ticks = /** @type {!anychart.radarPolarBaseModule.RadialAxisTicks} */(isMajor ? this.ticks() : this.minorTicks());

  var ticksLength = /** @type {number} */(ticks.getOption('length'));
  var ticksStroke = /** @type {acgraph.vector.Stroke} */(ticks.getOption('stroke'));
  var ticksPosition = /** @type {anychart.enums.SidePosition} */(ticks.getOption('position'));
  var ticksSidePosition = anychart.utils.sidePositionToNumber(ticksPosition);

  var ticksThickness = ticksStroke['thickness'] ? parseFloat(ticksStroke['thickness']) : 1;
  var lineThickness = anychart.utils.extractThickness(/** @type {acgraph.vector.Stroke} */(this.getOption('stroke')));

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

  var radius = this.innerLength_ + (this.length_ - this.innerLength_) * ratio;

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

  var halfThickness = ticksSidePosition < 0 ? Math.ceil(lineThickness / 2) : Math.floor(lineThickness / 2);

  var startLength = ticksSidePosition ? ticksSidePosition * halfThickness : -ticksLength / 2;
  var endLength = ticksSidePosition ? ticksSidePosition * ticksLength : ticksLength;

  dx = startLength * Math.sin(angle_);
  dy = startLength * Math.cos(angle_);

  var xStart = x + dx + xPixelShift;
  var yStart = y + dy + yPixelShift;

  dx = endLength * Math.sin(angle_);
  dy = endLength * Math.cos(angle_);

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
anychart.radarPolarBaseModule.RadialAxis.prototype.drawLabel_ = function(index, isMajor) {
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

  var positionProvider = {'value': {'x': x, 'y': y}};
  labels.add(formatProvider, positionProvider, index);
};


/** @inheritDoc */
anychart.radarPolarBaseModule.RadialAxis.prototype.checkDrawingNeeded = function() {
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


/** @inheritDoc */
anychart.radarPolarBaseModule.RadialAxis.prototype.isAxisMarkerProvider = function() {
  return false;
};


/**
 * Axis drawing.
 * @return {anychart.radarPolarBaseModule.RadialAxis} An instance of {@link anychart.radarPolarBaseModule.RadialAxis} class for method chaining.
 */
anychart.radarPolarBaseModule.RadialAxis.prototype.draw = function() {
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
    this.line_.stroke(/** @type {acgraph.vector.Stroke} */(this.getOption('stroke')));

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

  if (anychart.utils.instanceOf(scale, anychart.scales.ScatterBase)) {
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
  } else if (anychart.utils.instanceOf(scale, anychart.scales.Ordinal)) {
    if (ticksDrawer || labelsDrawer) {
      var labelsStates = this.calcLabels_();
      needDrawLabels = goog.isObject(labelsStates) ? labelsStates.labels : !overlappedLabels;

      for (i = 0; i < ticksArrLen; i++) {
        tickVal = scaleTicksArr[i];
        var leftTick;
        if (goog.isArray(tickVal)) {
          leftTick = tickVal[0];
          // rightTick = tickVal[1];
          // labelPosition = (scale.transform(tickVal[0], 0) + scale.transform(tickVal[1], 1)) / 2;
        } else {
          leftTick = tickVal;
          // rightTick = = tickVal;
          // labelPosition = scale.transform(tickVal, .5);
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
anychart.radarPolarBaseModule.RadialAxis.prototype.remove = function() {
  if (this.line_) this.line_.parent(null);
  this.ticks().remove();
  this.minorTicks().remove();
  if (this.labels_) this.labels_.remove();
  if (this.minorLabels_) this.minorLabels_.remove();
};


//endregion
//region --- Setup and Serialize
/** @inheritDoc */
anychart.radarPolarBaseModule.RadialAxis.prototype.serialize = function() {
  var json = anychart.radarPolarBaseModule.RadialAxis.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.radarPolarBaseModule.RadialAxis.PROPERTY_DESCRIPTORS, json);
  json['labels'] = this.labels().serialize();
  json['minorLabels'] = this.minorLabels().serialize();
  json['ticks'] = this.ticks().serialize();
  json['minorTicks'] = this.minorTicks().serialize();
  return json;
};


/** @inheritDoc */
anychart.radarPolarBaseModule.RadialAxis.prototype.setupByJSON = function(config, opt_default) {
  anychart.radarPolarBaseModule.RadialAxis.base(this, 'setupByJSON', config, opt_default);
  anychart.core.settings.deserialize(this, anychart.radarPolarBaseModule.RadialAxis.PROPERTY_DESCRIPTORS, config, opt_default);
  this.labels().setupInternal(!!opt_default, config['labels']);
  this.minorLabels().setupInternal(!!opt_default, config['minorLabels']);
  this.ticks(config['ticks']);
  this.minorTicks(config['minorTicks']);
};


/** @inheritDoc */
anychart.radarPolarBaseModule.RadialAxis.prototype.disposeInternal = function() {
  goog.disposeAll(this.line_, this.labels_, this.minorLabels_, this.ticks_, this.minorTicks_);

  delete this.scale_;
  this.labelsBounds_ = null;
  this.minorLabelsBounds_ = null;
  this.line_ = null;
  this.ticks_ = null;
  this.minorTicks_ = null;
  this.labels_ = null;
  this.minorLabels_ = null;

  anychart.radarPolarBaseModule.RadialAxis.base(this, 'disposeInternal');
};


//endregion
//region --- Standalone
//------------------------------------------------------------------------------
//
//  Standalone
//
//------------------------------------------------------------------------------
/**
 * @constructor
 * @extends {anychart.radarPolarBaseModule.RadialAxis}
 */
anychart.standalones.axes.Radial = function() {
  anychart.standalones.axes.Radial.base(this, 'constructor');
};
goog.inherits(anychart.standalones.axes.Radial, anychart.radarPolarBaseModule.RadialAxis);
anychart.core.makeStandalone(anychart.standalones.axes.Radial, anychart.radarPolarBaseModule.RadialAxis);


/**
 * Returns axis instance.<br/>
 * <b>Note:</b> Any axis must be bound to a scale.
 * @return {!anychart.standalones.axes.Radial}
 */
anychart.standalones.axes.radial = function() {
  var axis = new anychart.standalones.axes.Radial();
  axis.addThemes('standalones.radialAxis');
  return axis;
};


//endregion
//region --- Export
//exports
(function() {
  var proto = anychart.radarPolarBaseModule.RadialAxis.prototype;
  proto['labels'] = proto.labels;
  proto['minorLabels'] = proto.minorLabels;
  proto['ticks'] = proto.ticks;
  proto['minorTicks'] = proto.minorTicks;
  proto['scale'] = proto.scale;
  // auto
  // proto['stroke'] = proto.stroke;
  // proto['drawFirstLabel'] = proto.drawFirstLabel;
  // proto['drawLastLabel'] = proto.drawLastLabel;
  // proto['overlapMode'] = proto.overlapMode;

  proto = anychart.standalones.axes.Radial.prototype;
  goog.exportSymbol('anychart.standalones.axes.radial', anychart.standalones.axes.radial);
  proto['draw'] = proto.draw;
  proto['parentBounds'] = proto.parentBounds;
  proto['container'] = proto.container;
  // auto
  // proto['startAngle'] = proto.startAngle;
  // proto['innerRadius'] = proto.innerRadius;
})();
//endregion
