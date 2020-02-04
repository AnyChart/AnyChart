//region --- Provide and Require
goog.provide('anychart.core.Axis');
goog.provide('anychart.standalones.axes.Linear');
goog.require('acgraph');
goog.require('anychart.color');
goog.require('anychart.core.AxisTicks');
goog.require('anychart.core.IAxis');
goog.require('anychart.core.IStandaloneBackend');
goog.require('anychart.core.VisualBase');
goog.require('anychart.core.reporting');
goog.require('anychart.core.ui.LabelsFactory');
goog.require('anychart.core.ui.Text');
goog.require('anychart.core.ui.Title');
goog.require('anychart.core.utils.Padding');
goog.require('anychart.enums');
goog.require('anychart.format.Context');
goog.require('anychart.math.Rect');
goog.require('anychart.scales.Base');
goog.require('anychart.scales.DateTime');
goog.require('anychart.scales.Linear');
goog.require('anychart.scales.Ordinal');
goog.require('anychart.scales.ScatterBase');
goog.require('anychart.utils');
goog.require('goog.math.Coordinate');
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
anychart.core.Axis = function() {
  this.suspendSignalsDispatching();
  anychart.core.Axis.base(this, 'constructor');

  this.addThemes(anychart.themes.DefaultThemes['axis']);

  this.labelsBounds_ = [];
  this.minorLabelsBounds_ = [];

  /**
   * Auto values of settings set by external controller.
   * @type {!Object}
   */
  this.autoSettings = {};
  this.autoSettings['orientation'] = anychart.enums.Orientation.TOP;

  /**
   * @type {acgraph.vector.Element}
   * @protected
   */
  this.line;

  /**
   * Constant to save space.
   * @type {number}
   */
  this.ALL_VISUAL_STATES = anychart.ConsistencyState.APPEARANCE |
      anychart.ConsistencyState.AXIS_TITLE |
      anychart.ConsistencyState.AXIS_LABELS |
      anychart.ConsistencyState.AXIS_TICKS |
      anychart.ConsistencyState.BOUNDS |
      anychart.ConsistencyState.AXIS_OVERLAP;

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['width', this.ALL_VISUAL_STATES, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['drawFirstLabel', this.ALL_VISUAL_STATES, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED, 0, function() {
      this.dropBoundsCache();
      this.dropStaggeredLabelsCache_();
    }, this],
    ['drawLastLabel', this.ALL_VISUAL_STATES, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED, 0, function() {
      this.dropBoundsCache();
      this.dropStaggeredLabelsCache_();
    }, this],
    ['staggerMode', this.ALL_VISUAL_STATES, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED, 0, this.dropBoundsCache, this],
    ['overlapMode', this.ALL_VISUAL_STATES, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['staggerMaxLines', 0, 0, 0, function() {
      this.dropBoundsCache();
      this.dropStaggeredLabelsCache_();
      if (this.getOption('staggerMode'))
        this.invalidate(this.ALL_VISUAL_STATES, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }, this],
    ['staggerLines', 0, 0, 0, function() {
      this.dropBoundsCache();
      this.dropStaggeredLabelsCache_();
      if (this.getOption('staggerMode'))
        this.invalidate(this.ALL_VISUAL_STATES, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }, this],
    ['orientation', this.ALL_VISUAL_STATES, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED, 0, this.dropStaggeredLabelsCache_, this],
    ['stroke', this.ALL_VISUAL_STATES, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED]
  ]);

  this.resumeSignalsDispatching(false);
};
goog.inherits(anychart.core.Axis, anychart.core.VisualBase);


/** @inheritDoc */
anychart.core.Axis.prototype.getOption = function(name) {
  var res = anychart.core.Axis.base(this, 'getOption', name);

  if ((name == 'orientation' && !goog.isDefAndNotNull(res)) || !goog.isDef(res)) {
    res = this.autoSettings[name];
  }
  return res;
};


/**
 * Simple properties descriptors.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.Axis.SIMPLE_PROPS_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  var descriptors = anychart.core.settings.descriptors;

  anychart.core.settings.createDescriptors(map, [
    descriptors.WIDTH,
    descriptors.DRAW_FIRST_LABEL,
    descriptors.DRAW_LAST_LABEL,
    descriptors.OVERLAP_MODE,
    descriptors.STROKE,
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'staggerMode', anychart.core.settings.booleanNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'staggerMaxLines', anychart.core.settings.numberOrNullNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'staggerLines', anychart.core.settings.numberOrNullNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'orientation', anychart.core.settings.orientationNormalizer]
  ]);

  return map;
})();
anychart.core.settings.populate(anychart.core.Axis, anychart.core.Axis.SIMPLE_PROPS_DESCRIPTORS);


//region --- States and Signals
/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.Axis.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES |
        anychart.ConsistencyState.APPEARANCE |
        anychart.ConsistencyState.AXIS_TITLE |
        anychart.ConsistencyState.AXIS_LABELS |
        anychart.ConsistencyState.AXIS_TICKS |
        anychart.ConsistencyState.AXIS_OVERLAP;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.Axis.prototype.SUPPORTED_SIGNALS = anychart.core.VisualBase.prototype.SUPPORTED_SIGNALS;


//endregion
//region --- Properties
/**
 * @type {acgraph.vector.Path}
 * @private
 */
anychart.core.Axis.prototype.line_ = null;


/**
 * @type {string}
 * @private
 */
anychart.core.Axis.prototype.name_ = 'axis';


/**
 * @type {anychart.core.ui.Title}
 * @private
 */
anychart.core.Axis.prototype.title_ = null;


/**
 * @type {anychart.core.ui.LabelsFactory}
 * @private
 */
anychart.core.Axis.prototype.labels_ = null;


/**
 * @type {anychart.core.ui.LabelsFactory}
 * @private
 */
anychart.core.Axis.prototype.minorLabels_ = null;


/**
 * @type {anychart.core.AxisTicks}
 * @private
 */
anychart.core.Axis.prototype.ticks_ = null;


/**
 * @type {anychart.core.AxisTicks}
 * @private
 */
anychart.core.Axis.prototype.minorTicks_ = null;


/**
 * @type {anychart.scales.Base}
 * @protected
 */
anychart.core.Axis.prototype.internalScale = null;


/**
 * @type {number}
 * @private
 */
anychart.core.Axis.prototype.staggerAutoLines_ = 1;


/**
 * @type {anychart.math.Rect}
 * @protected
 */
anychart.core.Axis.prototype.pixelBounds = null;


/**
 * @type {anychart.math.Rect}
 * @private
 */
anychart.core.Axis.prototype.insideBounds_ = null;


/**
 * Axis padding.
 * @type {anychart.core.utils.Padding}
 * @private
 */
anychart.core.Axis.prototype.padding_ = null;


/**
 * @type {number}
 * @private
 */
anychart.core.Axis.prototype.offsetY_;


/**
 * @type {Array.<Array.<number>>}
 * @private
 */
anychart.core.Axis.prototype.labelsBounds_ = null;


/**
 * @type {Array.<Array.<number>>}
 * @private
 */
anychart.core.Axis.prototype.minorLabelsBounds_ = null;


//endregion
//region --- Settings
/**
 * Getter/setter for title.
 * @param {(null|boolean|Object|string)=} opt_value Axis title.
 * @return {!(anychart.core.ui.Title|anychart.core.Axis)} Axis title or itself for method chaining.
 */
anychart.core.Axis.prototype.title = function(opt_value) {
  if (!this.title_) {
    this.title_ = new anychart.core.ui.Title();
    this.setupCreated('title', this.title_);
    this.title_.setParentEventTarget(this);
    this.title_.listenSignals(this.titleInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    this.title_.setup(opt_value);
    return this;
  }
  return this.title_;
};


/**
 * Internal title invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.Axis.prototype.titleInvalidated_ = function(event) {
  var state = 0;
  var signal = 0;
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state = this.ALL_VISUAL_STATES;
    signal = anychart.Signal.BOUNDS_CHANGED | anychart.Signal.NEEDS_REDRAW;
  } else if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state = anychart.ConsistencyState.AXIS_TITLE;
    signal = anychart.Signal.NEEDS_REDRAW;
  }
  this.invalidate(state, signal);
};


/**
 * Getter/setter for labels.
 * @param {(Object|boolean|null)=} opt_value Axis labels.
 * @return {!(anychart.core.ui.LabelsFactory|anychart.core.Axis)} Axis labels of itself for method chaining.
 */
anychart.core.Axis.prototype.labels = function(opt_value) {
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
anychart.core.Axis.prototype.labelsInvalidated_ = function(event) {
  var state = 0;
  var signal = 0;
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state = this.ALL_VISUAL_STATES;
    signal = anychart.Signal.BOUNDS_CHANGED | anychart.Signal.NEEDS_REDRAW;
  } else if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state = anychart.ConsistencyState.AXIS_LABELS | anychart.ConsistencyState.AXIS_TICKS;
    signal = anychart.Signal.NEEDS_REDRAW;
  }
  this.labels().clear();
  this.dropStaggeredLabelsCache_();
  this.dropOverlappedLabelsCache_();
  this.dropBoundsCache();

  this.invalidate(state, signal);
};


/**
 * Getter/setter for minorLabels.
 * @param {(Object|boolean|null)=} opt_value Axis labels.
 * @return {!(anychart.core.ui.LabelsFactory|anychart.core.Axis)} Axis labels of itself for method chaining.
 */
anychart.core.Axis.prototype.minorLabels = function(opt_value) {
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
anychart.core.Axis.prototype.minorLabelsInvalidated_ = function(event) {
  var state = 0;
  var signal = 0;
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state = this.ALL_VISUAL_STATES;
    signal = anychart.Signal.BOUNDS_CHANGED | anychart.Signal.NEEDS_REDRAW;
  } else if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state = anychart.ConsistencyState.AXIS_LABELS;
    signal = anychart.Signal.NEEDS_REDRAW;
  }
  this.dropOverlappedLabelsCache_();
  this.dropBoundsCache();
  this.minorLabels().clear();
  this.invalidate(state, signal);
};


/**
 * Create new ticks instance.
 * @return {anychart.core.AxisTicks}
 * @protected
 */
anychart.core.Axis.prototype.createTicks = function() {
  return new anychart.core.AxisTicks();
};


/**
 * Create line.
 * @return {acgraph.vector.Element}
 * @protected
 */
anychart.core.Axis.prototype.getLine = function() {
  return this.line ? this.line : this.line = /** @type {acgraph.vector.Element} */(acgraph.path());
};


/**
 * Getter/setter for ticks.
 * @param {(Object|boolean|null)=} opt_value Axis ticks.
 * @return {!(anychart.core.AxisTicks|anychart.core.Axis)} Axis ticks or itself for method chaining.
 */
anychart.core.Axis.prototype.ticks = function(opt_value) {
  if (!this.ticks_) {
    this.ticks_ = this.createTicks();
    this.setupCreated('ticks', this.ticks_);
    this.ticks_.setParentEventTarget(this);
    this.ticks_.listenSignals(this.ticksInvalidated, this);
  }

  if (goog.isDef(opt_value)) {
    this.ticks_.setup(opt_value);
    return this;
  }
  return this.ticks_;
};


/**
 * Getter/setter for minorTicks.
 * @param {(Object|boolean|null)=} opt_value Axis ticks.
 * @return {!(anychart.core.AxisTicks|anychart.core.Axis)} Axis ticks or itself for method chaining.
 */
anychart.core.Axis.prototype.minorTicks = function(opt_value) {
  if (!this.minorTicks_) {
    this.minorTicks_ = this.createTicks();
    this.setupCreated('minorTicks', this.minorTicks_);
    this.minorTicks_.setParentEventTarget(this);
    this.minorTicks_.listenSignals(this.ticksInvalidated, this);
  }

  if (goog.isDef(opt_value)) {
    this.minorTicks_.setup(opt_value);
    return this;
  }
  return this.minorTicks_;
};


/**
 * Internal ticks invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @protected
 */
anychart.core.Axis.prototype.ticksInvalidated = function(event) {
  var state = 0;
  var signal = 0;
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state = this.ALL_VISUAL_STATES;
    signal = anychart.Signal.BOUNDS_CHANGED | anychart.Signal.NEEDS_REDRAW;
    this.dropBoundsCache();
  } else if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state = anychart.ConsistencyState.AXIS_TICKS;
    signal = anychart.Signal.NEEDS_REDRAW;
  }
  this.invalidate(state, signal);
};


/**
 * Set axis default orientation.
 * @param {anychart.enums.Orientation} value Default orientation value.
 */
anychart.core.Axis.prototype.setDefaultOrientation = function(value) {
  if (goog.isDef(value)) {
    var needInvalidate = this.getOption('orientation') != value;
    this.autoSettings['orientation'] = value;
    if (needInvalidate)
      this.invalidate(this.ALL_VISUAL_STATES);
  }
};


/**
 * Getter/setter for scale.
 * @param {(anychart.scales.Base|Object|anychart.enums.ScaleTypes|string)=} opt_value Scale.
 * @return {anychart.scales.Base|!anychart.core.Axis} Axis scale or itself for method chaining.
 */
anychart.core.Axis.prototype.scale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.internalScale != opt_value) { //Check for trying to set the same scale.
      var val = anychart.scales.Base.setupScale(
          /** @type {anychart.scales.Base} */(this.scale()),
          opt_value, null, this.getAllowedScaleTypes(), null, this.scaleInvalidated, this);
      if (val) {
        var dispatch = this.internalScale == val;
        this.internalScale = val;
        this.dropStaggeredLabelsCache_();
        this.dropOverlappedLabelsCache_();
        this.dropBoundsCache();
        this.labels().clear();
        this.minorLabels().clear();
        val.resumeSignalsDispatching(dispatch);
        if (!dispatch)
          this.invalidate(this.ALL_VISUAL_STATES, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
      }
    }
    return this;
  } else {
    return this.internalScale;
  }
};


/**
 * @return {anychart.scales.Base.ScaleTypes}
 * @protected
 */
anychart.core.Axis.prototype.getAllowedScaleTypes = function() {
  return anychart.scales.Base.ScaleTypes.ALL_DEFAULT;
};


/**
 * Internal ticks invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @protected
 */
anychart.core.Axis.prototype.scaleInvalidated = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.dropStaggeredLabelsCache_();
    this.dropOverlappedLabelsCache_();
    this.dropBoundsCache();
    this.labels().clear();
    this.minorLabels().clear();
    this.invalidate(this.ALL_VISUAL_STATES, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
  }
};


/**
 * @param {(string|number|Array.<number|string>|{top:(number|string),left:(number|string),bottom:(number|string),right:(number|string)})=} opt_spaceOrTopOrTopAndBottom .
 * @param {(string|number)=} opt_rightOrRightAndLeft .
 * @param {(string|number)=} opt_bottom .
 * @param {(string|number)=} opt_left .
 * @return {!(anychart.core.Axis|anychart.core.utils.Padding)} .
 */
anychart.core.Axis.prototype.padding = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  if (!this.padding_) {
    this.padding_ = new anychart.core.utils.Padding();
    this.setupCreated('padding', this.padding_);
    this.padding_.listenSignals(this.paddingInvalidated_, this);
  }
  if (goog.isDef(opt_spaceOrTopOrTopAndBottom)) {
    this.padding_.setup.apply(this.padding_, arguments);
    return this;
  }
  return this.padding_;
};


/**
 * Listener for padding invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.core.Axis.prototype.paddingInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.dropStaggeredLabelsCache_();
    this.dropOverlappedLabelsCache_();
    this.dropBoundsCache();
    this.invalidate(this.ALL_VISUAL_STATES,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);

  }
};


//endregion
//region --- IAxis implementation
/** @inheritDoc */
anychart.core.Axis.prototype.isAxisMarkerProvider = function() {
  return true;
};


//endregion
//region --- Labels calculating
/**
 * @private
 */
anychart.core.Axis.prototype.dropStaggeredLabelsCache_ = function() {
  this.staggeredLabels_ = null;
};


/**
 * @private
 */
anychart.core.Axis.prototype.dropOverlappedLabelsCache_ = function() {
  this.overlappedLabels_ = null;
};


/**
 * Returns an object with indexes of labels to draw.
 * @param {anychart.math.Rect=} opt_bounds Parent bounds.
 * @return {boolean|Object.<string, Array.<boolean>>} Object with indexes of labels to draw.
 * or Boolean when there are no labels.
 * @private
 */
anychart.core.Axis.prototype.getOverlappedLabels_ = function(opt_bounds) {
  if (!this.overlappedLabels_ || this.hasInvalidationState(anychart.ConsistencyState.AXIS_OVERLAP)) {
    var scale = /** @type {anychart.scales.ScatterBase|anychart.scales.Ordinal} */(this.scale());
    if (scale) {
      var scaleTicksArr, ticksArrLen, labels, isLabels;
      labels = /** @type {anychart.core.ui.LabelsFactory} */(this.labels());
      isLabels = labels.enabled();
      scaleTicksArr = scale.ticks().get();
      ticksArrLen = scaleTicksArr.length;

      if (isLabels) {
        var i, j, len;
        for (i = 0, len = ticksArrLen; i < len; i++) {
          if ((i == 0 && this.getOption('drawFirstLabel')) || (i == ticksArrLen - 1 && this.getOption('drawLastLabel')) || (i > 0 && i < ticksArrLen - 1)) {
            this.getLabel(i, true, scaleTicksArr, opt_bounds);
          }
        }
      }

      var scaleMinorTicksArr, minorTicksArrLen, minorLabels, isMinorLabels;
      if (anychart.utils.instanceOf(scale, anychart.scales.ScatterBase)) {
        minorLabels = /** @type {anychart.core.ui.LabelsFactory} */(this.minorLabels());
        isMinorLabels = minorLabels.enabled();
        scaleMinorTicksArr = scale.minorTicks().get();
        minorTicksArrLen = scaleMinorTicksArr.length;

        if (isMinorLabels) {
          for (i = 0, len = minorTicksArrLen; i < len; i++) {
            this.getLabel(i, false, scaleMinorTicksArr, opt_bounds);
          }
        }
      }
    }

    if (this.getOption('overlapMode') == anychart.enums.LabelsOverlapMode.ALLOW_OVERLAP) {
      return {labels: isLabels, minorLabels: isMinorLabels};
    } else {
      var overlappedLabels = [];
      var overlappedMinorLabels = [];

      if (scale) {
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

        var tickVal, ratio, bounds1, bounds2, bounds3, bounds4;
        var tempRatio;
        var k = -1;
        var labelsPosition = /** @type {anychart.enums.SidePosition} */(labels.getOption('position'));
        var insideLabelSpace = this.insideBounds_ && anychart.utils.sidePositionToNumber(labelsPosition) < 0 ?
            this.insideBounds_ : null;
        var isLabelInInsideSpace;

        var drawFirstLabel = this.getOption('drawFirstLabel');
        var drawLastLabel = this.getOption('drawLastLabel');

        if (anychart.utils.instanceOf(scale, anychart.scales.ScatterBase)) {
          i = 0;
          j = 0;
          var minorTickVal, minorRatio;
          while (i < ticksArrLen || j < minorTicksArrLen) {
            tickVal = scaleTicksArr[i];
            minorTickVal = scaleMinorTicksArr[j];
            ratio = scale.transform(tickVal);
            minorRatio = scale.transform(minorTickVal);
            bounds1 = bounds2 = bounds3 = bounds4 = null;

            if (nextDrawableLabel == -1 && isLabels) {
              k = i;
              while (nextDrawableLabel == -1 && k < ticksArrLen) {
                if ((!k && drawFirstLabel) || (k == ticksArrLen - 1 && drawLastLabel) || (k != 0 && k != ticksArrLen - 1))
                  bounds1 = this.getLabelBounds_(k, true, scaleTicksArr, opt_bounds);
                else
                  bounds1 = null;

                if (prevDrawableLabel != -1)
                  bounds2 = this.getLabelBounds_(prevDrawableLabel, true, scaleTicksArr, opt_bounds);
                else
                  bounds2 = null;

                if (k != ticksArrLen - 1 && drawLastLabel)
                  bounds3 = this.getLabelBounds_(ticksArrLen - 1, true, scaleTicksArr, opt_bounds);
                else
                  bounds3 = null;

                isLabelInInsideSpace = insideLabelSpace ? !this.hasIntersectionLabelsSpace(insideLabelSpace, bounds1) : true;
                if (bounds1 &&
                    isLabelInInsideSpace &&
                    !(anychart.math.checkRectIntersection(bounds1, bounds2) ||
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
              if (isLabels && i == nextDrawableLabel) {
                prevDrawableLabel = i;
                nextDrawableLabel = -1;
                overlappedLabels.push(true);
              } else {
                overlappedLabels.push(false);
              }
              i++;
              if (ratio == minorRatio && (isLabels || this.ticks().enabled())) {
                overlappedMinorLabels.push(false);
                j++;
              }
            } else {
              if (isMinorLabels) {
                bounds1 = this.getLabelBounds_(j, false, scaleMinorTicksArr, opt_bounds);

                if (prevDrawableLabel != -1)
                  bounds2 = this.getLabelBounds_(prevDrawableLabel, true, scaleTicksArr, opt_bounds);

                if (nextDrawableLabel != -1)
                  bounds3 = this.getLabelBounds_(nextDrawableLabel, true, scaleTicksArr, opt_bounds);

                if (prevDrawableMinorLabel != -1)
                  bounds4 = this.getLabelBounds_(prevDrawableMinorLabel, false, scaleMinorTicksArr, opt_bounds);

                var label = this.minorLabels().getLabel(j);
                var isLabelEnabled = label ?
                    goog.isDef(label.enabled()) ?
                        label.enabled() :
                        true :
                    true;

                isLabelInInsideSpace = insideLabelSpace ? !this.hasIntersectionLabelsSpace(insideLabelSpace, bounds1) : true;
                if (isLabelInInsideSpace &&
                    !(anychart.math.checkRectIntersection(bounds1, bounds2) ||
                        anychart.math.checkRectIntersection(bounds1, bounds3) ||
                        anychart.math.checkRectIntersection(bounds1, bounds4)) && isLabelEnabled) {

                  tempRatio = scale.transform(scaleMinorTicksArr[j]);
                  if ((tempRatio <= 0 && drawFirstLabel) || (tempRatio >= 1 && drawLastLabel)) {
                    prevDrawableMinorLabel = j;
                    overlappedMinorLabels.push(true);
                  } else if (tempRatio > 0 && tempRatio < 1) {
                    prevDrawableMinorLabel = j;
                    overlappedMinorLabels.push(true);
                  } else {
                    overlappedMinorLabels.push(false);
                  }

                } else {
                  overlappedMinorLabels.push(false);
                }
              } else {
                overlappedMinorLabels.push(false);
              }
              j++;
            }
          }
          if (!isMinorLabels) overlappedMinorLabels = false;
        } else if (anychart.utils.instanceOf(scale, anychart.scales.Base)) {
          if (drawLastLabel) {
            bounds3 = this.getLabelBounds_(ticksArrLen - 1, true, scaleTicksArr, opt_bounds);
            bounds3 = insideLabelSpace ?
                (!this.hasIntersectionLabelsSpace(insideLabelSpace, bounds3) ? bounds3 : null) :
                bounds3;
          } else
            bounds3 = null;

          for (i = 0; i < ticksArrLen; i++) {
            if (isLabels) {
              if ((!i && drawFirstLabel) || (i == ticksArrLen - 1 && drawLastLabel) || (i != 0 && i != ticksArrLen - 1))
                bounds1 = this.getLabelBounds_(i, true, scaleTicksArr, opt_bounds);
              else
                bounds1 = null;

              if (prevDrawableLabel != -1)
                bounds2 = this.getLabelBounds_(prevDrawableLabel, true, scaleTicksArr, opt_bounds);
              else
                bounds2 = null;

              isLabelInInsideSpace = insideLabelSpace ? !this.hasIntersectionLabelsSpace(insideLabelSpace, bounds1) : true;
              if (!i) {
                if (drawFirstLabel && isLabelInInsideSpace) {
                  prevDrawableLabel = i;
                  overlappedLabels.push(true);
                } else {
                  overlappedLabels.push(false);
                }
              } else if (i == ticksArrLen - 1) {
                if (drawLastLabel && isLabelInInsideSpace) {
                  prevDrawableLabel = i;
                  overlappedLabels.push(true);
                } else {
                  overlappedLabels.push(false);
                }
              } else if (isLabelInInsideSpace && !(anychart.math.checkRectIntersection(bounds1, bounds2) ||
                  anychart.math.checkRectIntersection(bounds1, bounds3))) {
                prevDrawableLabel = i;
                overlappedLabels.push(true);
              } else {
                overlappedLabels.push(false);
              }
            } else {
              overlappedLabels.push(false);
            }
          }
        }
      }
      if (!isLabels) overlappedLabels = false;
      this.overlappedLabels_ = {labels: overlappedLabels, minorLabels: overlappedMinorLabels};
    }

    this.invalidate(this.ALL_VISUAL_STATES);
    this.markConsistent(anychart.ConsistencyState.AXIS_OVERLAP);
  }
  return this.overlappedLabels_;
};


/**
 * Applies stagger labels mode and returns an object with indexes of labels to draw.
 * @param {anychart.math.Rect=} opt_bounds Parent bounds.
 * @return {boolean|Object.<string, boolean|Array.<boolean>>} Object with indexes of labels to draw.
 * or Boolean when there are no labels.
 * @private
 */
anychart.core.Axis.prototype.applyStaggerMode_ = function(opt_bounds) {
  if (!this.staggeredLabels_) {
    var labels = /** @type {anychart.core.ui.LabelsFactory} */(this.labels());

    var scale = /** @type {anychart.scales.ScatterBase|anychart.scales.Ordinal} */(this.scale());
    if (!(scale && labels.enabled()))
      return this.staggeredLabels_ = {labels: false, minorLabels: false};

    this.staggerAutoLines_ = 1;
    this.currentStageLines_ = 1;
    var staggeredLabels;
    var scaleTicksArr = scale.ticks().get();
    var ticksArrLen = scaleTicksArr.length;
    var j, k, bounds1, bounds2, bounds3, states;

    for (var i = 0, len = ticksArrLen; i < len; i++) {
      this.getLabel(i, true, scaleTicksArr, opt_bounds);
    }

    var labelsPosition = /** @type {anychart.enums.SidePosition} */(labels.getOption('position'));
    var insideLabelSpace = this.insideBounds_ && anychart.utils.sidePositionToNumber(labelsPosition) < 0 ?
        this.insideBounds_ : null;
    var isLabelInInsideSpace;
    var staggerMaxLines = /** @type {?number} */(this.getOption('staggerMaxLines'));
    var staggerLines = /** @type {?number} */(this.getOption('staggerLines'));

    var drawFirstLabel = this.getOption('drawFirstLabel');
    var drawLastLabel = this.getOption('drawLastLabel');
    states = [];
    for (var tickIndex = 0; tickIndex < ticksArrLen; tickIndex++) {
      //check for needs drawing first and last label
      if ((!tickIndex && !drawFirstLabel) || (tickIndex == ticksArrLen - 1 && !drawLastLabel)) {
        states[tickIndex] = false;
      } else {
        var labelBounds = this.getLabelBounds_(tickIndex, true, scaleTicksArr, opt_bounds);
        states[tickIndex] = insideLabelSpace ? !this.hasIntersectionLabelsSpace(insideLabelSpace, labelBounds) : true;
      }
    }

    if (!goog.isNull(staggerLines)) {
      this.currentStageLines_ = staggerLines;
    } else {
      var isConvergence = false;
      i = 1;
      while (!isConvergence && i <= ticksArrLen) {
        isConvergence = true;
        for (k = 0; k < i; k++) {
          for (j = k; j < ticksArrLen - i; j = j + i) {
            bounds1 = this.getLabelBounds_(j, true, scaleTicksArr, opt_bounds);
            bounds2 = this.getLabelBounds_(j + i, true, scaleTicksArr, opt_bounds);

            if (states[j] && anychart.math.checkRectIntersection(bounds1, bounds2)) {
              isConvergence = false;
              i++;
              break;
            }
          }
          if (!isConvergence) break;
        }
      }
      this.staggerAutoLines_ = isConvergence ? i : ticksArrLen;

      if (!goog.isNull(staggerMaxLines) && this.staggerAutoLines_ > staggerMaxLines) {
        this.currentStageLines_ = staggerMaxLines;
      } else {
        this.currentStageLines_ = this.staggerAutoLines_;
      }
    }

    var limitedLineNumber = (!goog.isNull(staggerLines) ||
        !goog.isNull(staggerMaxLines) && this.staggerAutoLines_ > staggerMaxLines);

    if (limitedLineNumber && this.getOption('overlapMode') == anychart.enums.LabelsOverlapMode.NO_OVERLAP) {
      for (j = 0; j < this.currentStageLines_; j++) {
        var prevDrawableLabel = -1;
        for (i = j; i < ticksArrLen; i = i + this.currentStageLines_) {
          bounds1 = this.getLabelBounds_(i, true, scaleTicksArr, opt_bounds);

          if (prevDrawableLabel != -1)
            bounds2 = this.getLabelBounds_(prevDrawableLabel, true, scaleTicksArr, opt_bounds);
          else
            bounds2 = null;

          if (i != ticksArrLen - 1 && this.getOption('drawLastLabel'))
            bounds3 = this.getLabelBounds_(ticksArrLen - 1, true, scaleTicksArr, opt_bounds);
          else
            bounds3 = null;

          isLabelInInsideSpace = insideLabelSpace ? !this.hasIntersectionLabelsSpace(insideLabelSpace, bounds1) : true;
          if (!i) {
            if (drawFirstLabel && isLabelInInsideSpace) {
              prevDrawableLabel = i;
              states[i] = true;
            } else {
              states[i] = false;
            }
          } else if (i == ticksArrLen - 1) {
            if (drawLastLabel && isLabelInInsideSpace) {
              prevDrawableLabel = i;
              states[i] = true;
            } else {
              states[i] = false;
            }
          } else if (isLabelInInsideSpace && !(anychart.math.checkRectIntersection(bounds1, bounds2) ||
              anychart.math.checkRectIntersection(bounds1, bounds3))) {
            prevDrawableLabel = i;
            states[i] = true;
          } else {
            states[i] = false;
          }
        }
      }
      if (!drawFirstLabel) states[0] = false;
      if (!drawLastLabel) states[states.length - 1] = false;
    }
    staggeredLabels = {labels: states, minorLabels: false};

    this.linesSize_ = [];
    this.staggerLabelslines_ = [];
    if (!this.labelsBoundingRects_) this.labelsBoundingRects_ = [];
    var bounds;
    k = 0;
    for (i = 0; i < ticksArrLen; i++) {
      if (!states || (states && states[i])) {
        if (this.labelsBoundingRects_[i]) {
          bounds = this.labelsBoundingRects_[i];
        } else {
          var points = this.getLabelBounds_(i, true, scaleTicksArr, opt_bounds);
          this.labelsBoundingRects_[i] = bounds = anychart.math.Rect.fromCoordinateBox(points);
        }

        var size = this.isHorizontal() ? bounds.height : bounds.width;
        if (!this.linesSize_[k] || this.linesSize_[k] < size) this.linesSize_[k] = size;
        if (!this.staggerLabelslines_[k]) this.staggerLabelslines_[k] = [];
        this.staggerLabelslines_[k].push(i);
        if (!((k + 1) % this.currentStageLines_))
          k = 0;
        else
          k++;
      }
    }

    return this.staggeredLabels_ = staggeredLabels;
  } else {
    return this.staggeredLabels_;
  }
};


/**
 * Calculate labels to draw.
 * @param {anychart.math.Rect=} opt_bounds Parent bounds.
 * @return {boolean|Object.<string, boolean|Array.<boolean>>} Object with indexes of labels to draw.
 * or Boolean when there are no labels.
 * @private
 */
anychart.core.Axis.prototype.calcLabels_ = function(opt_bounds) {
  return this.labels().enabled() || this.minorLabels().enabled() ?
      this.getOption('staggerMode') ? this.applyStaggerMode_(opt_bounds) : this.getOverlappedLabels_(opt_bounds) :
      true; //Means that here are no labels.
};


/**
 * Returns label.
 * @param {number} index
 * @param {boolean} isMajor
 * @param {Array.<number>} ticksArray
 * @param {anychart.math.Rect=} opt_parentBounds
 * @return {*}
 */
anychart.core.Axis.prototype.getLabel = function(index, isMajor, ticksArray, opt_parentBounds) {
  if (!isMajor && this.scale() && !(anychart.utils.instanceOf(this.scale(), anychart.scales.ScatterBase)))
    return null;

  var labels = isMajor ? this.labels() : this.minorLabels();

  var label = labels.getLabel(index);

  if (!label) {
    var bounds = goog.isDef(opt_parentBounds) ? opt_parentBounds : this.getPixelBounds();
    var lineBounds = goog.isDef(opt_parentBounds) ? opt_parentBounds : this.line.getBounds();
    var ticks = /** @type {!anychart.core.AxisTicks} */(isMajor ? this.ticks() : this.minorTicks());
    var stroke = /** @type {acgraph.vector.Stroke} */(this.getOption('stroke'));
    var lineThickness = anychart.utils.extractThickness(stroke);

    var x, y;
    var scale = /** @type {anychart.scales.ScatterBase|anychart.scales.Ordinal} */(this.scale());

    var value = ticksArray[index];
    var ratio;
    if (goog.isArray(value)) {
      ratio = (scale.transform(value[0], 0) + scale.transform(value[1], 1)) / 2;
      value = value[0];
    } else {
      ratio = scale.transform(value, .5);
    }

    if (ratio < 0 || ratio > 1) return [0, 0];

    var labelPosition = /** @type {anychart.enums.SidePosition} */(labels.getOption('position'));
    var side = anychart.utils.sidePositionToNumber(labelPosition);
    var tickLength = anychart.utils.getAffectBoundsTickLength(ticks, side);

    switch (this.getOption('orientation')) {
      case anychart.enums.Orientation.TOP:
        x = Math.round(bounds.left + ratio * bounds.width);
        y = lineBounds.top - lineThickness / 2 - tickLength;
        break;
      case anychart.enums.Orientation.RIGHT:
        x = lineBounds.getRight() + lineThickness / 2 + tickLength;
        y = Math.round(bounds.getBottom() - ratio * bounds.height);
        break;
      case anychart.enums.Orientation.BOTTOM:
        x = Math.round(bounds.left + ratio * bounds.width);
        y = lineBounds.getBottom() + lineThickness / 2 + tickLength;
        break;
      case anychart.enums.Orientation.LEFT:
        x = lineBounds.left - lineThickness / 2 - tickLength;
        y = Math.round(bounds.getBottom() - ratio * bounds.height);
        break;
    }

    var formatProvider = this.getLabelsFormatProvider(index, value);
    var positionProvider = {'value': {'x': x, 'y': y}};

    label = labels.add(formatProvider, positionProvider, index);
    label.ownSettings.parentBounds = this.parentBounds();
    label.setComplex(null);

    label.stateOrder([label.ownSettings, labels.ownSettings, labels.themeSettings]);

    label.firstDraw();
  }

  return label;
};


/**
 * Calculate label bounds.
 * @param {number} index Label index.
 * @param {boolean} isMajor Major labels or minor.
 * @param {Array} ticksArray Array with ticks.
 * @param {anychart.math.Rect=} opt_parentBounds Parent bounds.
 * @return {Array.<number>} Label bounds.
 * @private
 */
anychart.core.Axis.prototype.getLabelBounds_ = function(index, isMajor, ticksArray, opt_parentBounds) {
  if ((!isMajor && this.scale() && !(anychart.utils.instanceOf(this.scale(), anychart.scales.ScatterBase))) || index < 0)
    return null;

  var boundsCache = isMajor ? this.labelsBounds_ : this.minorLabelsBounds_;
  if (goog.isDef(boundsCache[index]))
    return boundsCache[index];

  var bounds = goog.isDef(opt_parentBounds) ? opt_parentBounds : this.getPixelBounds();
  var lineBounds = goog.isDef(opt_parentBounds) ? opt_parentBounds : this.line.getBounds();
  var ticks = /** @type {!anychart.core.AxisTicks} */(isMajor ? this.ticks() : this.minorTicks());
  var stroke = /** @type {acgraph.vector.Stroke} */(this.getOption('stroke'));
  var lineThickness = anychart.utils.extractThickness(stroke);

  var labels = isMajor ? this.labels() : this.minorLabels();

  var x, y;
  var scale = /** @type {anychart.scales.ScatterBase|anychart.scales.Ordinal} */(this.scale());

  var value = ticksArray[index];
  var ratio;
  if (goog.isArray(value)) {
    ratio = (scale.transform(value[0], 0) + scale.transform(value[1], 1)) / 2;
    value = value[0];
  } else {
    ratio = scale.transform(value, .5);
  }

  if (ratio < 0 || ratio > 1) return [0, 0];

  var labelPosition = /** @type {anychart.enums.SidePosition} */(labels.getOption('position'));
  var side = anychart.utils.sidePositionToNumber(labelPosition);
  var tickLength = anychart.utils.getAffectBoundsTickLength(ticks, side);


  var labelPositionXY = this.getLabelPositionXY(bounds, ratio, lineThickness, tickLength, lineBounds);
  x = labelPositionXY.x;
  y = labelPositionXY.y;

  var positionProvider = {'value': {'x': x, 'y': y}};

  var label = this.getLabel(index, isMajor, ticksArray, opt_parentBounds);
  label.positionProvider(positionProvider);

  var labelBounds;
  var isComplexLabel = label.isComplexText();
  if (isComplexLabel) {
    label.ownSettings.parentBounds = this.parentBounds();
    label.stateOrder([label.ownSettings, labels.ownSettings, labels.themeSettings]);
    labelBounds = labels.measure(label, undefined, undefined, index);
  } else {
    var textEl = /** @type {anychart.core.ui.Text} */ (label.getTextElement());

    //TODO (A.Kudryavtsev): Looks like an issue.
    if (textEl.bounds) {
      var measurementNode = acgraph.getRenderer().createMeasurement();
      textEl.renderTo(measurementNode);
      label.invalidate(anychart.ConsistencyState.CONTAINER);
      textEl.dropBounds();
      textEl.setPosition(0, 0);
    }

    labelBounds = textEl.getBounds();

    var padding = label.getFinalSettings('padding');
    if (padding && !goog.object.isEmpty(padding)) {
      labelBounds = anychart.core.utils.Padding.widenBounds(labelBounds, padding);
    }

    labelBounds.left = x;
    labelBounds.top = y;
  }

  var labelsSidePosition = anychart.utils.sidePositionToNumber(labelPosition);

  switch (this.getOption('orientation')) {
    case anychart.enums.Orientation.TOP:
      labelBounds.top -= labelsSidePosition * labelBounds.height / 2;
      break;
    case anychart.enums.Orientation.RIGHT:
      labelBounds.left += labelsSidePosition * labelBounds.width / 2;
      break;
    case anychart.enums.Orientation.BOTTOM:
      labelBounds.top += labelsSidePosition * labelBounds.height / 2;
      break;
    case anychart.enums.Orientation.LEFT:
      labelBounds.left -= labelsSidePosition * labelBounds.width / 2;
      break;
  }

  var coordBox;
  if (isComplexLabel) {
    coordBox = labelBounds.toCoordinateBox();
  } else {
    var mergedSettings = label.getMergedSettings();

    var anchor = mergedSettings['anchor'] || anychart.enums.Anchor.LEFT_TOP;

    var anchorCoordinate = anychart.utils.getCoordinateByAnchor(new anychart.math.Rect(0, 0, labelBounds.width, labelBounds.height), anchor);

    labelBounds.left -= anchorCoordinate.x;
    labelBounds.top -= anchorCoordinate.y;

    anchorCoordinate = anychart.utils.getCoordinateByAnchor(/** @type {anychart.math.Rect} */(labelBounds), anchor);

    var parentBounds = this.parentBounds();
    var offsetX = mergedSettings['offsetX'];
    var offsetY = mergedSettings['offsetY'];

    var offsetXNormalized = goog.isDef(offsetX) ? anychart.utils.normalizeSize(/** @type {number|string} */(offsetX), parentBounds.width) : 0;
    var offsetYNormalized = goog.isDef(offsetY) ? anychart.utils.normalizeSize(/** @type {number|string} */(offsetY), parentBounds.height) : 0;

    var position = new goog.math.Coordinate(labelBounds.left, labelBounds.top);

    anychart.utils.applyOffsetByAnchor(position, anchor, offsetXNormalized, offsetYNormalized);

    labelBounds.left = position.x;
    labelBounds.top = position.y;

    coordBox = labelBounds.toCoordinateBox();

    if (mergedSettings['rotation']) {
      var tx = goog.math.AffineTransform.getRotateInstance(goog.math.toRadians(/** @type {number} */(mergedSettings['rotation'])),
          anchorCoordinate.x, anchorCoordinate.y);

      tx.transform(coordBox, 0, coordBox, 0, 4);
    }

    //  debug purpose
    // var ___name = 'lbl_a' + index + ' ' + isMajor;
    // if (!this[___name])
    //   this[___name] = stage.circle(anchorCoordinate.x, anchorCoordinate.y, 2)
    //     .fill('none').stroke('red').zIndex(1000);
    // this[___name].center({x: anchorCoordinate.x, y: anchorCoordinate.y});
    //
    // var ___name = 'lbl_b' + index + ' ' + isMajor;
    // if (!this[___name]) this[___name] = stage.rect().fill('none').stroke('red').zIndex(1000);
    // this[___name].setBounds(labelBounds);
    //
  }

  // var ___name = 'lbl' + index + ' ' + isMajor;
  // if (!this[___name]) this[___name] = stage.path()
  //   .fill('none').stroke('green').zIndex(1000);
  // this[___name].clear()
  //   .moveTo(coordBox[0], coordBox[1])
  //   .lineTo(coordBox[2], coordBox[3])
  //   .lineTo(coordBox[4], coordBox[5])
  //   .lineTo(coordBox[6], coordBox[7])
  //   .lineTo(coordBox[0], coordBox[1]);

  return boundsCache[index] = coordBox;
};


/**
 * Calculates label position and returns it's coordinates.
 * @param {goog.math.Rect} bounds where label is drawn.
 * @param {number} ratio is a position along axis.
 * @param {number} lineThickness of axis.
 * @param {number} tickLength length of tick.
 * @param {goog.math.Rect} lineBounds bounds of axis line.
 * @return {{x: number, y: number}} position of label.
 * @protected
 */
anychart.core.Axis.prototype.getLabelPositionXY = function(bounds, ratio, lineThickness, tickLength, lineBounds) {
  var x = 0;
  var y = 0;
  switch (this.getOption('orientation')) {
    case anychart.enums.Orientation.TOP:
      x = Math.round(bounds.left + ratio * bounds.width);
      y = lineBounds.top - lineThickness / 2 - tickLength;
      break;
    case anychart.enums.Orientation.RIGHT:
      x = lineBounds.getRight() + lineThickness / 2 + tickLength;
      y = Math.round(bounds.getBottom() - ratio * bounds.height);
      break;
    case anychart.enums.Orientation.BOTTOM:
      x = Math.round(bounds.left + ratio * bounds.width);
      y = lineBounds.getBottom() + lineThickness / 2 + tickLength;
      break;
    case anychart.enums.Orientation.LEFT:
      x = lineBounds.left - lineThickness / 2 - tickLength;
      y = Math.round(bounds.getBottom() - ratio * bounds.height);
      break;
  }
  return {x: x, y: y};
};


//endregion
//region --- Bounds
/**
 * Drop bounds cache.
 */
anychart.core.Axis.prototype.dropBoundsCache = function() {
  if (this.labelsBoundingRects_) this.labelsBoundingRects_.length = 0;
  this.labelsBounds_.length = 0;
  this.minorLabelsBounds_.length = 0;

  // todo: (chernetsky) Performance bottleneck from DVF-2825-axis-posiion-inside
  this.pixelBoundsWithInside = null;
  this.pixelBounds = null;
  // todo
};


/**
 * Calculates the size which affects the axis bounds.
 * @param {number} maxLabelSize Max size among of labels.
 * @param {number} maxMinorLabelSize Max size among of minor labels.
 * @param {boolean=} opt_includeInsideContent .
 * @return {number}
 * @protected
 */
anychart.core.Axis.prototype.calcSize = function(maxLabelSize, maxMinorLabelSize, opt_includeInsideContent) {
  var ticks = /** @type {!anychart.core.AxisTicks} */(this.ticks());
  var minorTicks = /** @type {!anychart.core.AxisTicks} */(this.minorTicks());

  var sumTicksAndLabelsSizes = 0, sumMinorTicksAndLabelsSizes = 0;

  var labelsPosition = /** @type {anychart.enums.SidePosition} */(this.labels().getOption('position'));
  var minorLabelsPosition = /** @type {anychart.enums.SidePosition} */(this.minorLabels().getOption('position'));
  var ticksPosition = /** @type {anychart.enums.SidePosition} */(ticks.getOption('position'));
  var minorTicksPosition = /** @type {anychart.enums.SidePosition} */(minorTicks.getOption('position'));

  var labelsSide = anychart.utils.sidePositionToNumber(labelsPosition);
  var minorLabelsSide = anychart.utils.sidePositionToNumber(minorLabelsPosition);
  var ticksSide = anychart.utils.sidePositionToNumber(ticksPosition);
  var minorTicksSide = anychart.utils.sidePositionToNumber(minorTicksPosition);

  if (opt_includeInsideContent) {
    var ticksLength = ticks.enabled() ? /** @type {number} */(ticks.getOption('length')) : 0;
    var minorTicksLength = minorTicks.enabled() ? /** @type {number} */(minorTicks.getOption('length')) : 0;

    if (!ticksSide && !labelsSide) {
      sumTicksAndLabelsSizes = Math.max(maxLabelSize, ticksLength);
    } else if (!labelsSide) {
      sumTicksAndLabelsSizes = maxLabelSize / 2 + Math.max(maxLabelSize / 2, ticksLength);
    } else {
      sumTicksAndLabelsSizes = maxLabelSize + ticksLength;
    }

    if (!minorTicksSide && !minorLabelsSide) {
      sumMinorTicksAndLabelsSizes = Math.max(maxMinorLabelSize, minorTicksLength);
    } else if (!labelsSide) {
      sumMinorTicksAndLabelsSizes = maxMinorLabelSize / 2 + Math.max(maxMinorLabelSize / 2, minorTicksLength);
    } else {
      sumMinorTicksAndLabelsSizes = maxMinorLabelSize + minorTicksLength;
    }
  } else {
    ticksLength = anychart.utils.getAffectBoundsTickLength(ticks, 1);
    minorTicksLength = anychart.utils.getAffectBoundsTickLength(minorTicks, 1);

    sumTicksAndLabelsSizes = ticksLength;
    sumMinorTicksAndLabelsSizes = minorTicksLength;

    if (labelsPosition == anychart.enums.SidePosition.OUTSIDE) {
      sumTicksAndLabelsSizes += maxLabelSize;
    } else if (labelsPosition == anychart.enums.SidePosition.CENTER) {
      sumTicksAndLabelsSizes = Math.max(sumTicksAndLabelsSizes, maxLabelSize / 2);
    } else if (labelsPosition == anychart.enums.SidePosition.INSIDE) {
      sumTicksAndLabelsSizes += 0;
    }

    if (minorLabelsPosition == anychart.enums.SidePosition.OUTSIDE) {
      sumMinorTicksAndLabelsSizes += maxMinorLabelSize;
    } else if (minorLabelsPosition == anychart.enums.SidePosition.CENTER) {
      sumMinorTicksAndLabelsSizes = Math.max(sumMinorTicksAndLabelsSizes, maxMinorLabelSize / 2);
    } else if (minorLabelsPosition == anychart.enums.SidePosition.INSIDE) {
      sumMinorTicksAndLabelsSizes += 0;
    }
  }
  return Math.max(sumTicksAndLabelsSizes, sumMinorTicksAndLabelsSizes);
};


/**
 * Calculates the size of an axis (for horizontal - height, for vertical - width)
 * @param {anychart.math.Rect} parentBounds Parent bounds.
 * @param {number} length Axis length.
 * @param {boolean=} opt_includeInsideContent .
 * @return {number} Size.
 * @protected
 */
anychart.core.Axis.prototype.getSize = function(parentBounds, length, opt_includeInsideContent) {
  var bounds, size, i, delta, len;
  var maxLabelSize = 0;
  var maxMinorLabelSize = 0;
  var titleSize = 0;

  var title = this.title();
  var labels = this.labels();
  var minorLabels = this.minorLabels();
  var orientation = /** @type {anychart.enums.Orientation} */(this.getOption('orientation'));

  if (title.enabled()) {
    if (!title.container()) title.container(/** @type {acgraph.vector.ILayer} */(this.container()));
    title.suspendSignalsDispatching();
    title.parentBounds(parentBounds);
    title.defaultOrientation(orientation);
    titleSize = this.isHorizontal() ? title.getContentBounds().height : title.getContentBounds().width;
    title.resumeSignalsDispatching(false);
  }

  var scale = /** @type {anychart.scales.ScatterBase|anychart.scales.Ordinal} */(this.scale());

  var isLabels = /** @type {boolean} */(labels.enabled() && goog.isDef(scale));
  var isMinorLabels = /** @type {boolean} */(minorLabels.enabled() && goog.isDef(scale) && anychart.utils.instanceOf(scale, anychart.scales.ScatterBase));

  var width = this.isHorizontal() ? length : 0;
  var height = this.isHorizontal() ? 0 : length;
  var left = (parentBounds ? parentBounds.left : 0);
  var top = (parentBounds ? parentBounds.top : 0);

  var padding = this.padding();
  var topPad = anychart.utils.normalizeSize(/** @type {number|string} */(padding.getOption('top')), parentBounds.height);
  var rightPad = anychart.utils.normalizeSize(/** @type {number|string} */(padding.getOption('right')), parentBounds.width);
  var bottomPad = anychart.utils.normalizeSize(/** @type {number|string} */(padding.getOption('bottom')), parentBounds.height);
  var leftPad = anychart.utils.normalizeSize(/** @type {number|string} */(padding.getOption('left')), parentBounds.width);

  switch (orientation) {
    case anychart.enums.Orientation.TOP:
      left += leftPad;
      top += topPad;
      break;
    case anychart.enums.Orientation.RIGHT:
      left += width - rightPad;
      top += topPad;
      break;
    case anychart.enums.Orientation.BOTTOM:
      left += leftPad;
      top += height - bottomPad;
      break;
    case anychart.enums.Orientation.LEFT:
      left += leftPad;
      top += topPad;
      break;
  }

  var tempBounds = new anychart.math.Rect(left, top, width, height);

  var overlappedLabels = this.calcLabels_(tempBounds);
  var ticksArr;

  var staggerMode = this.getOption('staggerMode');

  if (isLabels && scale) {
    ticksArr = scale.ticks().get();
    var drawLabels = goog.isObject(overlappedLabels) ? overlappedLabels.labels : !overlappedLabels;
    if (staggerMode) {
      for (i = 0; i < this.linesSize_.length; i++) {
        maxLabelSize += this.linesSize_[i];
      }
    } else {
      for (i = 0, len = ticksArr.length; i < len; i++) {
        var drawLabel = goog.isArray(drawLabels) ? drawLabels[i] : drawLabels;
        if (drawLabel) {
          bounds = goog.math.Rect.fromCoordinateBox(this.getLabelBounds_(i, true, ticksArr, tempBounds));
          size = this.isHorizontal() ? bounds.height : bounds.width;
          if (size > maxLabelSize) maxLabelSize = size;
        }
      }
    }
  }

  if (isMinorLabels && !staggerMode) {
    var drawMinorLabels = goog.isObject(overlappedLabels) ? overlappedLabels.minorLabels : !overlappedLabels;
    ticksArr = scale.minorTicks().get();
    for (i = 0, len = drawMinorLabels.length; i < len; i++) {
      var drawMinorLabel = goog.isArray(drawMinorLabels) ? drawMinorLabels[i] : drawMinorLabels;
      if (drawMinorLabel) {
        bounds = goog.math.Rect.fromCoordinateBox(this.getLabelBounds_(i, false, ticksArr, tempBounds));
        size = this.isHorizontal() ? bounds.height : bounds.width;
        if (size > maxMinorLabelSize) maxMinorLabelSize = size;
      }
    }
  }

  delta = this.calcSize(maxLabelSize, maxMinorLabelSize, opt_includeInsideContent) + titleSize;
  return /** @type {number} */(delta);
};


/**
 * Axis length calculation.
 * @param {number} parentLength Parent length.
 * @return {number}
 * @protected
 */
anychart.core.Axis.prototype.getLength = function(parentLength) {
  var length;
  if (this.isHorizontal()) {
    length = this.padding().tightenWidth(parentLength);
  } else {
    length = this.padding().tightenHeight(parentLength);
  }

  return length;
};


/**
 * Returns remaining parent bounds to use elsewhere.
 * @example <t>simple-h100</t>
 * var axis = anychart.standalones.axes.linear();
 * axis
 *     .orientation('left')
 *     .scale(anychart.scales.ordinal().values([1,2,3]))
 *     .container(stage).draw();
 * var label = anychart.standalones.label();
 * label
 *     .parentBounds(axis.getRemainingBounds())
 *     .width('100%')
 *     .height('100%')
 *     .padding(15)
 *     .background()
 *       .enabled(true)
 *       .fill('blue 0.2')
 * label.container(stage).draw();
 * @param {boolean=} opt_includeInsideContent .
 * @return {!anychart.math.Rect} Parent bounds without the space used by the title.
 */
anychart.core.Axis.prototype.getRemainingBounds = function(opt_includeInsideContent) {
  var parentBounds = this.parentBounds();

  if (parentBounds) {
    var remainingBounds = parentBounds.clone();

    if (this.scale() && this.enabled()) {
      var axisBounds = this.getPixelBounds(opt_includeInsideContent);
      var padding = this.padding();
      var heightOffset = parentBounds.height - padding.tightenHeight(parentBounds.height) + axisBounds.height;
      var widthOffset = parentBounds.width - padding.tightenWidth(parentBounds.width) + axisBounds.width;

      switch (this.getOption('orientation')) {
        case anychart.enums.Orientation.TOP:
          remainingBounds.height -= heightOffset;
          remainingBounds.top += heightOffset;
          break;
        case anychart.enums.Orientation.RIGHT:
          remainingBounds.width -= widthOffset;
          break;
        case anychart.enums.Orientation.BOTTOM:
          remainingBounds.height -= heightOffset;
          break;
        case anychart.enums.Orientation.LEFT:
          remainingBounds.width -= widthOffset;
          remainingBounds.left += widthOffset;
          break;
      }
    }

    return remainingBounds;
  } else
    return new anychart.math.Rect(0, 0, 0, 0);
};


/**
 * Calculates size.
 * @param {number} parentSize Parent size.
 * @param {number} length Length.
 * @param {anychart.math.Rect} parentBounds Parent bounds.
 * @param {boolean=} opt_includeInsideContent .
 * @return {number} Calculated size.
 */
anychart.core.Axis.prototype.calculateSize = function(parentSize, length, parentBounds, opt_includeInsideContent) {
  var width = this.getOption('width');
  return width ?
      anychart.utils.normalizeSize(/** @type {number|null|string} */(width), parentSize) :
      this.getSize(parentBounds, length, opt_includeInsideContent);
};


/**
 * Gets axis pixel bounds.
 * @param {boolean=} opt_includeInsideContent .
 * @return {anychart.math.Rect} Pixel bounds.
 */
anychart.core.Axis.prototype.getPixelBounds = function(opt_includeInsideContent) {
  var affectInsideContent = opt_includeInsideContent && this.hasInsideElements();
  var bounds = affectInsideContent ? this.pixelBoundsWithInside : this.pixelBounds;

  if (!bounds || this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    var parentBounds = /** @type {anychart.math.Rect} */(this.parentBounds());
    if (parentBounds) {
      var parentLength, parentSize;
      parentBounds.top = Math.round(parentBounds.top);
      parentBounds.left = Math.round(parentBounds.left);
      parentBounds.width = Math.round(parentBounds.width);
      parentBounds.height = Math.round(parentBounds.height);
      if (this.isHorizontal()) {
        parentLength = parentBounds.width;
        parentSize = parentBounds.height;
      } else {
        parentLength = parentBounds.height;
        parentSize = parentBounds.width;
      }

      var length = this.getLength(parentLength);
      var size = this.calculateSize(parentSize, length, parentBounds, opt_includeInsideContent);

      var padding = this.padding();
      var topPad = anychart.utils.normalizeSize(/** @type {number|string} */(padding.getOption('top')), parentBounds.height);
      var rightPad = anychart.utils.normalizeSize(/** @type {number|string} */(padding.getOption('right')), parentBounds.width);
      var bottomPad = anychart.utils.normalizeSize(/** @type {number|string} */(padding.getOption('bottom')), parentBounds.height);
      var leftPad = anychart.utils.normalizeSize(/** @type {number|string} */(padding.getOption('left')), parentBounds.width);

      var x = 0, y = 0, width = 0, height = 0;
      switch (this.getOption('orientation')) {
        case anychart.enums.Orientation.TOP:
          y = parentBounds.top + topPad;
          x = parentBounds.left + leftPad;
          height = size;
          width = length;
          break;
        case anychart.enums.Orientation.RIGHT:
          y = parentBounds.top + topPad;
          x = parentBounds.left + parentBounds.width - size - rightPad;
          height = length;
          width = size;
          break;
        case anychart.enums.Orientation.BOTTOM:
          y = parentBounds.top + parentBounds.height - size - bottomPad;
          x = parentBounds.left + leftPad;
          height = size;
          width = length;
          break;
        case anychart.enums.Orientation.LEFT:
          y = parentBounds.top + topPad;
          x = parentBounds.left + leftPad;
          height = length;
          width = size;
          break;
      }

      bounds = new anychart.math.Rect(x, y, width, height);
      bounds.round();

      if (affectInsideContent)
        this.pixelBoundsWithInside = bounds;
      else
        this.pixelBounds = bounds;

    } else {
      this.pixelBounds = new anychart.math.Rect(0, 0, 0, 0);
      this.pixelBoundsWithInside = new anychart.math.Rect(0, 0, 0, 0);
    }
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }
  return affectInsideContent ? this.pixelBoundsWithInside : this.pixelBounds;
};


/**
 * Inside bounds.
 * @param {anychart.math.Rect=} opt_value
 * @return {anychart.core.Axis|anychart.math.Rect}
 */
anychart.core.Axis.prototype.insideBounds = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.insideBounds_ = opt_value;

    // todo: (chernetsky) Performance bottleneck from DVF-2825-axis-posiion-inside
    this.dropOverlappedLabelsCache_();
    this.dropStaggeredLabelsCache_();
    this.dropBoundsCache();
    // todo
    return this;
  }

  return this.insideBounds_;
};


//endregion
//region --- Drawing
/**
 * Axis line drawer for top orientation.
 * @param {anychart.math.Rect} bounds Bounds.
 * @param {number} pixelShift Pixel shift.
 * @param {number} lineThickness Stroke thickness.
 * @param {number} offset Offset.
 * @param {number} size Size.
 * @protected
 */
anychart.core.Axis.prototype.drawTopLine = function(bounds, pixelShift, lineThickness, offset, size) {
  var y = bounds.getBottom();
  // axes lines grow inside content area
  y += lineThickness / 2;
  this.line
      // pixel shifts here to draw line from first tick to last
      .moveTo(anychart.utils.applyPixelShift(bounds.left, 1) - 0.5, y)
      .lineTo(anychart.utils.applyPixelShift(bounds.getRight(), 1) + 0.5, y);
};


/**
 * Axis line drawer for right orientation.
 * @param {anychart.math.Rect} bounds Bounds.
 * @param {number} pixelShift Pixel shift.
 * @param {number} lineThickness Stroke thickness.
 * @param {number} offset Offset.
 * @param {number} size Size.
 * @protected
 */
anychart.core.Axis.prototype.drawRightLine = function(bounds, pixelShift, lineThickness, offset, size) {
  var x = bounds.left;
  // axes lines grow inside content area
  x -= lineThickness / 2 - 1;
  this.line
      // should fix line going out of top tick on retina
      .moveTo(x, anychart.utils.applyPixelShift(bounds.top, 1) - 0.5)
      // draw line till bottom tick
      .lineTo(x, anychart.utils.applyPixelShift(bounds.getBottom(), 1) + 0.5);
};


/**
 * Axis line drawer for bottom orientation.
 * @param {anychart.math.Rect} bounds Bounds.
 * @param {number} pixelShift Pixel shift.
 * @param {number} lineThickness Stroke thickness.
 * @param {number} offset Offset.
 * @param {number} size Size.
 * @protected
 */
anychart.core.Axis.prototype.drawBottomLine = function(bounds, pixelShift, lineThickness, offset, size) {
  var y = bounds.top;
  // axes lines grow inside content area
  y -= lineThickness / 2 - 1;
  this.line
      // pixel shifts here to draw line from first tick to last
      .moveTo(anychart.utils.applyPixelShift(bounds.left, 1) - 0.5, y)
      .lineTo(anychart.utils.applyPixelShift(bounds.getRight(), 1) + 0.5, y);
};


/**
 * Axis line drawer for left orientation.
 * @param {anychart.math.Rect} bounds Bounds.
 * @param {number} pixelShift Pixel shift.
 * @param {number} lineThickness Stroke thickness.
 * @param {number} offset Offset.
 * @param {number} size Size.
 * @protected
 */
anychart.core.Axis.prototype.drawLeftLine = function(bounds, pixelShift, lineThickness, offset, size) {
  var x = bounds.getRight();
  // axes lines grow inside content area
  x += lineThickness / 2;
  this.line
      // should fix line going out of top tick on retina
      .moveTo(x, anychart.utils.applyPixelShift(bounds.top, 1) - 0.5)
      // draw line till bottom tick
      .lineTo(x, anychart.utils.applyPixelShift(bounds.getBottom(), 1) + 0.5);
};


/**
 * Draws axis line.
 * @protected
 */
anychart.core.Axis.prototype.drawLine = function() {
  this.getLine().clear();

  var orientation = /** @type {anychart.enums.Orientation} */(this.getOption('orientation'));

  var lineDrawer;
  switch (orientation) {
    case anychart.enums.Orientation.TOP:
      lineDrawer = this.drawTopLine;
      break;
    case anychart.enums.Orientation.RIGHT:
      lineDrawer = this.drawRightLine;
      break;
    case anychart.enums.Orientation.BOTTOM:
      lineDrawer = this.drawBottomLine;
      break;
    case anychart.enums.Orientation.LEFT:
      lineDrawer = this.drawLeftLine;
      break;
  }

  var stroke = /** @type {acgraph.vector.Stroke} */(this.getOption('stroke'));
  var lineThickness = anychart.utils.extractThickness(stroke);
  lineThickness = lineThickness ? lineThickness : 1; // this is to keep old behaviour

  var pixelShift = lineThickness % 2 == 0 ? 0 : 0.5;
  var bounds = this.getPixelBounds();

  lineDrawer.call(this, bounds, pixelShift, lineThickness, 0, 0);

  this.line.stroke(/** @type {acgraph.vector.Stroke} */(stroke));
};


/**
 * Calculates and returns position for label to draw in.
 * @param {number} ratio along axis.
 * @param {goog.math.Rect} labelBounds label size.
 * @param {number} staggerSize
 * @param {number} tickLength length of tick at the label position.
 * @param {number} pixelShift amount of shift for cripier svg look.
 * @param {number} labelsSidePosition where labels go to.
 * @param {boolean} isMajor whether this is major tick label.
 * @return {{x: number, y: number}} value to be used as label position provider.
 * @protected
 */
anychart.core.Axis.prototype.getLabelDrawPosition = function(ratio, labelBounds, staggerSize, tickLength, pixelShift, labelsSidePosition, isMajor) {
  var bounds = this.getPixelBounds();
  var lineBounds = this.line.getBounds();
  var stroke = /** @type {acgraph.vector.Stroke} */(this.getOption('stroke'));
  var lineThickness = anychart.utils.extractThickness(stroke);
  var orientation = this.getOption('orientation');
  var x = 0;
  var y = 0;
  switch (orientation) {
    case anychart.enums.Orientation.TOP:
      x = Math.round(bounds.left + ratio * bounds.width) + pixelShift;
      y = lineBounds.top - labelsSidePosition * (lineThickness / 2 + labelBounds.height / 2 + staggerSize) - tickLength;
      break;
    case anychart.enums.Orientation.RIGHT:
      x = lineBounds.getRight() + labelsSidePosition * (lineThickness / 2 + labelBounds.width / 2 + staggerSize) + tickLength;
      y = Math.round(bounds.top + bounds.height - ratio * bounds.height) + pixelShift;
      break;
    case anychart.enums.Orientation.BOTTOM:
      x = Math.round(bounds.left + ratio * bounds.width) + pixelShift;
      y = lineBounds.getBottom() + labelsSidePosition * (lineThickness / 2 + labelBounds.height / 2 + staggerSize) + tickLength;
      break;
    case anychart.enums.Orientation.LEFT:
      x = lineBounds.left - labelsSidePosition * (lineThickness / 2 + labelBounds.width / 2 + staggerSize) - tickLength;
      y = Math.round(bounds.top + bounds.height - ratio * bounds.height) + pixelShift;
      break;
  }
  return {x: x, y: y};
};


/**
 * Axis labels drawer.
 * @param {number|string} value Scale ratio.
 * @param {number} ratio Scale ratio.
 * @param {number} index Scale label index.
 * @param {number} pixelShift Pixel shift for sharp display.
 * @param {boolean} isMajor Is major label.
 * @param {Array} ticksArr
 * @param {boolean} enabled
 * @private
 */
anychart.core.Axis.prototype.drawLabel_ = function(value, ratio, index, pixelShift, isMajor, ticksArr, enabled) {
  var labels, ticks;
  if (isMajor) {
    ticks = /** @type {!anychart.core.AxisTicks} */(this.ticks());
    labels = this.labels();
  } else {
    ticks = /** @type {!anychart.core.AxisTicks} */(this.minorTicks());
    labels = this.minorLabels();
  }

  if (!enabled) {
    labels.clear(index);
    return;
  }

  var labelBounds = anychart.math.Rect.fromCoordinateBox(this.getLabelBounds_(index, isMajor, ticksArr));
  var staggerSize = 0;

  if (isMajor) {
    var incSize = true;
    if (this.currentStageLines_ > 1 && this.getOption('staggerMode')) {
      for (var i = 0, len = this.staggerLabelslines_.length; i < len; i++) {
        var line = this.staggerLabelslines_[i];
        for (var j = 0, len_ = line.length; j < len_; j++) {
          if (index == line[j]) {
            incSize = false;
            break;
          }
        }
        if (!incSize) break;
        staggerSize += this.linesSize_[i];
      }
    }
  }

  var labelsSidePosition = anychart.utils.sidePositionToNumber(/** @type {anychart.enums.SidePosition} */(labels.getOption('position')));
  var tickLength = anychart.utils.getAffectBoundsTickLength(ticks, labelsSidePosition);

  var drawPosition = this.getLabelDrawPosition(ratio, labelBounds, staggerSize, tickLength, pixelShift, labelsSidePosition, isMajor);
  var positionProvider = {'value': drawPosition};
  var label = labels.getLabel(index);
  if (!label) {
    var formatProvider = this.getLabelsFormatProvider(index, value);
    label = labels.add(formatProvider, positionProvider, index);
    label.stateOrder([label.ownSettings, labels.ownSettings, labels.themeSettings]);
  }
  label.positionProvider(positionProvider);
};


/** @inheritDoc */
anychart.core.Axis.prototype.checkDrawingNeeded = function() {
  if (this.isConsistent())
    return false;

  if (!this.enabled()) {
    if (this.hasInvalidationState(anychart.ConsistencyState.ENABLED)) {
      this.remove();
      this.markConsistent(anychart.ConsistencyState.ENABLED);
      this.title().invalidate(anychart.ConsistencyState.CONTAINER);
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
 * Title drawing for inheritance.
 * @protected
 */
anychart.core.Axis.prototype.drawTitle = function() {
  var title = this.title();
  title.parentBounds(this.getPixelBounds());
  title.defaultOrientation(/** @type {anychart.enums.Orientation} */(this.getOption('orientation')));
  title.draw();
};


/**
 * Updates line z index.
 * @protected
 */
anychart.core.Axis.prototype.updateZIndex = function() {
  var zIndex = /** @type {number} */(this.zIndex());
  this.line.zIndex(zIndex);
  this.title().zIndex(zIndex);
  this.ticks().zIndex(zIndex);
  this.minorTicks().zIndex(zIndex);
  this.labels().zIndex(zIndex);
  this.minorLabels().zIndex(zIndex);
};


/**
 * Axis drawing.
 * @return {anychart.core.Axis} An instance of {@link anychart.core.Axis} class for method chaining.
 */
anychart.core.Axis.prototype.draw = function() {
  var scale = /** @type {anychart.scales.Linear|anychart.scales.Ordinal} */(this.scale());

  if (!scale) {
    anychart.core.reporting.error(anychart.enums.ErrorCode.SCALE_NOT_SET);
    return this;
  }

  if (!this.checkDrawingNeeded())
    return this;

  var ticksDrawer, minorTicksDrawer, pixelShift;
  var minorTicks, ticks;
  var lineThickness;
  var orientation = /** @type {anychart.enums.Orientation} */(this.getOption('orientation'));
  var axisTicks = /** @type {anychart.core.AxisTicks} */(this.ticks());
  var axisMinorTicks = /** @type {anychart.core.AxisTicks} */(this.minorTicks());

  this.title().suspendSignalsDispatching();
  this.labels().suspendSignalsDispatching();
  this.minorLabels().suspendSignalsDispatching();
  axisTicks.suspendSignalsDispatching();
  axisMinorTicks.suspendSignalsDispatching();

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    this.drawLine();
    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    this.updateZIndex();
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    var container = /** @type {acgraph.vector.ILayer} */(this.container());
    this.title().container(container);
    this.line.parent(container);
    axisTicks.container(container);
    axisMinorTicks.container(container);

    this.labels().container(container);
    this.minorLabels().container(container);
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.AXIS_TITLE)) {
    this.drawTitle();
    this.markConsistent(anychart.ConsistencyState.AXIS_TITLE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.AXIS_TICKS)) {
    ticks = this.ticks();
    ticks.orientation(/** @type {anychart.enums.Orientation} */ (orientation));
    ticks.draw();
    ticksDrawer = ticks.getTicksDrawer();

    minorTicks = this.minorTicks();
    minorTicks.orientation(/** @type {anychart.enums.Orientation} */ (orientation));
    minorTicks.draw();
    minorTicksDrawer = minorTicks.getTicksDrawer();

    this.markConsistent(anychart.ConsistencyState.AXIS_TICKS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.AXIS_LABELS)) {
    var labels = this.labels();
    if (!labels.container()) labels.container(/** @type {acgraph.vector.ILayer} */(this.container()));
    labels.parentBounds(/** @type {anychart.math.Rect} */(this.parentBounds()));
    // labels.clear();

    var minorLabels = this.minorLabels();
    if (!minorLabels.container()) minorLabels.container(/** @type {acgraph.vector.ILayer} */(this.container()));
    minorLabels.parentBounds(/** @type {anychart.math.Rect} */(this.parentBounds()));
    // minorLabels.clear();

    this.markConsistent(anychart.ConsistencyState.AXIS_LABELS);
  }

  if (goog.isDef(ticksDrawer) || goog.isDef(minorTicksDrawer)) {
    var i, j, overlappedLabels, needDrawLabels, needDrawMinorLabels;

    var scaleTicksArr = scale.ticks().get();
    var ticksArrLen = scaleTicksArr.length;
    var ticksStroke = axisTicks.getOption('stroke');
    var tickThickness = ticksStroke && ticksStroke['thickness'] ? parseFloat(ticksStroke['thickness']) : 1;
    var tickVal, ratio, drawLabel, drawTick;
    var pixelBounds = this.getPixelBounds();
    var lineBounds = this.line.getBounds();
    var stroke =  /** @type {acgraph.vector.Stroke} */(this.getOption('stroke'));
    stroke = acgraph.vector.normalizeStroke(stroke);
    lineThickness = anychart.utils.extractThickness(stroke);
    var isOrdinal = anychart.utils.instanceOf(scale, anychart.scales.Ordinal);

    if (anychart.utils.instanceOf(scale, anychart.scales.ScatterBase)) {
      overlappedLabels = this.calcLabels_();

      if (goog.isObject(overlappedLabels)) {
        needDrawLabels = overlappedLabels.labels;
        needDrawMinorLabels = overlappedLabels.minorLabels;
      } else {
        needDrawLabels = !overlappedLabels;
        needDrawMinorLabels = !overlappedLabels;
      }

      var scaleMinorTicksArr = scale.minorTicks().get();
      var minorTicksStroke = axisMinorTicks.getOption('stroke');
      var minorTickThickness = minorTicksStroke && minorTicksStroke['thickness'] ? parseFloat(minorTicksStroke['thickness']) : 1;

      i = 0;
      j = 0;
      var minorTicksArrLen = scaleMinorTicksArr.length;
      var minorTickVal, minorRatio, prevMajorRatio;

      while (i < ticksArrLen || j < minorTicksArrLen) {
        tickVal = scaleTicksArr[i];
        minorTickVal = scaleMinorTicksArr[j];
        ratio = scale.transform(tickVal);
        minorRatio = scale.transform(minorTickVal);
        /*
        Fix for logarithmic scale, bc sometimes it returns nonzero ratio for scale.minimum() value,
        like this: "7.230440002281568e-8", or this "-1.0641554004653386e-7"
        This leads to missing first tick or problems with pixel shift when yAxis tick,
        or grid line in {value == scale.minimum()} is drawn one pixel above xAxis.
        */
        if (scale.getType() == 'log') {
          ratio = anychart.math.round(ratio, 6);
          minorRatio = anychart.math.round(minorRatio, 6);
        }
        if (((ratio <= minorRatio && i < ticksArrLen) || j == minorTicksArrLen)) {
          var majorPixelShift = tickThickness % 2 == 0 ? 0 : -.5;
          drawLabel = goog.isArray(needDrawLabels) ? needDrawLabels[i] : needDrawLabels;
          drawTick = (goog.isArray(needDrawLabels) && needDrawLabels[i]) || goog.isBoolean(needDrawLabels);
          if (drawTick && ticksDrawer)
            ticksDrawer.call(
                ticks,
                ratio,
                pixelBounds,
                lineBounds,
                lineThickness,
                majorPixelShift);

          this.drawLabel_(
              tickVal,
              scale.transform(tickVal, .5),
              i,
              majorPixelShift,
              true,
              scaleTicksArr,
              drawLabel);
          prevMajorRatio = ratio;
          i++;
        } else {
          var minorPixelShift = minorTickThickness % 2 == 0 ? 0 : -.5;
          drawLabel = goog.isArray(needDrawMinorLabels) ? needDrawMinorLabels[j] : needDrawMinorLabels;
          drawTick = (goog.isArray(needDrawMinorLabels) && needDrawMinorLabels[j]) || goog.isBoolean(needDrawMinorLabels);

          if (drawTick && minorTicksDrawer && prevMajorRatio != minorRatio)
            minorTicksDrawer.call(
                minorTicks,
                minorRatio,
                pixelBounds,
                lineBounds,
                lineThickness,
                minorPixelShift);


          this.drawLabel_(
              minorTickVal,
              scale.transform(minorTickVal, .5),
              j,
              minorPixelShift,
              false,
              scaleMinorTicksArr,
              drawLabel && prevMajorRatio != minorRatio);
          j++;
        }
      }
      if (needDrawMinorLabels) this.minorLabels().draw();

    } else {
      var labelsStates = this.calcLabels_();

      needDrawLabels = goog.isObject(labelsStates) ? labelsStates.labels : !labelsStates;
      pixelShift = tickThickness % 2 == 0 ? 0 : -.5;

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
        var subRangeRatio = (isOrdinal && scale.mode() == anychart.enums.OrdinalScaleMode.CONTINUOUS) ? 0.5 : 0;
        ratio = scale.transform(leftTick, subRangeRatio);

        if (ticksDrawer) {
          if (0 <= ratio && ratio <= 1)
            ticksDrawer.call(
                ticks,
                ratio,
                pixelBounds,
                lineBounds,
                lineThickness,
                pixelShift);

          if (i == ticksArrLen - 1) {
            ratio = scale.transform(rightTick, 1);
            if (0 <= ratio && ratio <= 1)
              ticksDrawer.call(
                  ticks,
                  ratio,
                  pixelBounds,
                  lineBounds,
                  lineThickness,
                  pixelShift);
          }
        }

        drawLabel = goog.isArray(needDrawLabels) ? needDrawLabels[i] : needDrawLabels;
        this.drawLabel_(
            leftTick,
            labelPosition,
            i,
            pixelShift,
            true,
            scaleTicksArr,
            drawLabel && labelPosition >= 0 && labelPosition <= 1);
      }
    }

    this.labels().draw();
  }

  this.title().resumeSignalsDispatching(false);
  this.labels().resumeSignalsDispatching(false);
  this.minorLabels().resumeSignalsDispatching(false);
  axisTicks.resumeSignalsDispatching(false);
  axisMinorTicks.resumeSignalsDispatching(false);

  return this;
};


/** @inheritDoc */
anychart.core.Axis.prototype.remove = function() {
  if (this.title_) this.title_.remove();
  if (this.line) this.line.parent(null);
  this.ticks().remove();
  this.minorTicks().remove();
  if (this.labels_) this.labels_.remove();
  if (this.minorLabels_) this.minorLabels_.remove();
};


//endregion
//region --- Utils
/** @inheritDoc */
anychart.core.Axis.prototype.invalidateParentBounds = function() {
  this.dropStaggeredLabelsCache_();
  this.dropOverlappedLabelsCache_();
  this.dropBoundsCache();
  this.invalidate(this.ALL_VISUAL_STATES, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
};


/**
 * Gets format provider for label.
 * @param {number} index Label index.
 * @param {string|number} value Label value.
 * @return {Object} Labels format provider.
 * @protected
 */
anychart.core.Axis.prototype.getLabelsFormatProvider = function(index, value) {
  var scale = this.scale();

  var labelText, labelValue;
  var valueType, tickValueType;
  var addRange = true;
  var addIntervals = false;
  if (anychart.utils.instanceOf(scale, anychart.scales.Ordinal)) {
    labelText = scale.ticks().names()[index];
    labelValue = value;
    tickValueType = valueType = anychart.enums.TokenType.STRING;
    addRange = false;
  } else if (anychart.utils.instanceOf(scale, anychart.scales.DateTime)) {
    labelText = anychart.format.date(/** @type {number} */(value));
    valueType = anychart.enums.TokenType.STRING; //Not DATE_TIME because it's already formatted.
    tickValueType = anychart.enums.TokenType.DATE_TIME;
    labelValue = value;
    addIntervals = true;
  } else {
    labelText = parseFloat(value);
    labelValue = parseFloat(value);
    valueType = tickValueType = anychart.enums.TokenType.NUMBER;
  }

  var values = {
    'axis': {value: this, type: anychart.enums.TokenType.UNKNOWN},
    'index': {value: index, type: anychart.enums.TokenType.NUMBER},
    'value': {value: labelText, type: valueType},
    'tickValue': {value: labelValue, type: tickValueType},
    'scale': {value: scale, type: anychart.enums.TokenType.UNKNOWN}
  };

  if (addRange) {
    values['max'] = {value: goog.isDef(scale.max) ? scale.max : null, type: anychart.enums.TokenType.NUMBER};
    values['min'] = {value: goog.isDef(scale.min) ? scale.min : null, type: anychart.enums.TokenType.NUMBER};
  }

  if (addIntervals) {
    var ticks = /** @type {anychart.scales.DateTimeTicks} */((/** @type {anychart.scales.DateTime} */(scale)).ticks());
    values['intervalUnit'] = {value: ticks.getIntervalUnit(), type: anychart.enums.TokenType.STRING};
    values['intervalUnitCount'] = {value: ticks.getIntervalUnitCount(), type: anychart.enums.TokenType.NUMBER};
    ticks = /** @type {anychart.scales.DateTimeTicks} */((/** @type {anychart.scales.DateTime} */(scale)).minorTicks());
    values['minorIntervalUnit'] = {value: ticks.getIntervalUnit(), type: anychart.enums.TokenType.STRING};
    values['minorIntervalUnitCount'] = {value: ticks.getIntervalUnitCount(), type: anychart.enums.TokenType.NUMBER};
  }

  var aliases = {};
  aliases[anychart.enums.StringToken.AXIS_SCALE_MAX] = 'max';
  aliases[anychart.enums.StringToken.AXIS_SCALE_MIN] = 'min';

  var tokenCustomValues = {};
  tokenCustomValues[anychart.enums.StringToken.AXIS_NAME] = {value: this.title().text(), type: anychart.enums.TokenType.STRING};

  var context = new anychart.format.Context(values);
  context.tokenAliases(aliases);
  context.tokenCustomValues(tokenCustomValues);

  return context.propagate();
};


/**
 * Returns position provider.
 * @param {number} index Label index.
 * @param {boolean} isMajor Major labels or minor.
 * @param {Array} ticksArray Array with ticks.
 * @param {anychart.math.Rect=} opt_parentBounds Parent bounds.
 * @return {Object} Label bounds.
 */
anychart.core.Axis.prototype.getLabelsPositionProvider = function(index, isMajor, ticksArray, opt_parentBounds) {
  var bounds = goog.isDef(opt_parentBounds) ? opt_parentBounds : this.getPixelBounds(true);
  var lineBounds = goog.isDef(opt_parentBounds) ? opt_parentBounds : this.line.getBounds();
  var ticks = /** @type {anychart.core.AxisTicks} */(isMajor ? this.ticks() : this.minorTicks());
  var ticksLength = /** @type {number} */(ticks.getOption('length'));
  var stroke = /** @type {acgraph.vector.Stroke} */(this.getOption('stroke'));
  var lineThickness = anychart.utils.extractThickness(stroke);

  var isEnabled = ticks.enabled();
  var position = /** @type {anychart.enums.SidePosition} */(ticks.getOption('position'));
  var x, y;
  var scale = /** @type {anychart.scales.ScatterBase|anychart.scales.Ordinal} */(this.scale());

  var value = ticksArray[index];
  var ratio;
  if (goog.isArray(value)) {
    ratio = (scale.transform(value[0], 0) + scale.transform(value[1], 1)) / 2;
  } else {
    ratio = scale.transform(value, .5);
  }

  switch (this.getOption('orientation')) {
    case anychart.enums.Orientation.TOP:
      x = Math.round(bounds.left + ratio * bounds.width);
      y = lineBounds.top - lineThickness / 2;
      if (position == anychart.enums.SidePosition.OUTSIDE && isEnabled) {
        y -= ticksLength;
      }
      break;
    case anychart.enums.Orientation.RIGHT:
      x = lineBounds.getRight() + lineThickness / 2;
      y = Math.round(bounds.top + ratio * bounds.height);

      if (position == anychart.enums.SidePosition.OUTSIDE && isEnabled) {
        x += ticksLength;
      }
      break;
    case anychart.enums.Orientation.BOTTOM:
      x = Math.round(bounds.left + ratio * bounds.width);
      y = lineBounds.getBottom() + lineThickness / 2;

      if (position == anychart.enums.SidePosition.OUTSIDE && isEnabled) {
        y += ticksLength;
      }
      break;
    case anychart.enums.Orientation.LEFT:
      x = lineBounds.left - lineThickness / 2;
      y = Math.round(bounds.top + ratio * bounds.height);

      if (position == anychart.enums.SidePosition.OUTSIDE && isEnabled) {
        x -= ticksLength;
      }
      break;
  }

  return {'value': {'x': x, 'y': y}};
};


/**
 * Whether an axis is horizontal.
 * @return {boolean} If the axis is horizontal.
 */
anychart.core.Axis.prototype.isHorizontal = function() {
  var orientation = this.getOption('orientation');
  return orientation == anychart.enums.Orientation.TOP ||
      orientation == anychart.enums.Orientation.BOTTOM;
};


/**
 * @param {anychart.math.Rect} insideLabelSpace
 * @param {Array.<number>} bounds1
 * @return {boolean}
 */
anychart.core.Axis.prototype.hasIntersectionLabelsSpace = function(insideLabelSpace, bounds1) {
  var intersected = false;
  switch (this.getOption('orientation')) {
    case anychart.enums.Orientation.TOP:
    case anychart.enums.Orientation.BOTTOM:
      intersected = insideLabelSpace.left > bounds1[0] || insideLabelSpace.getRight() < bounds1[2];
      break;
    case anychart.enums.Orientation.RIGHT:
    case anychart.enums.Orientation.LEFT:
      intersected = insideLabelSpace.top > bounds1[1] || insideLabelSpace.getBottom() < bounds1[7];
      break;
  }

  return intersected;
};


/**
 * @return {boolean}
 */
anychart.core.Axis.prototype.hasInsideElements = function() {
  return ((this.labels().enabled() ? anychart.utils.sidePositionToNumber(/** @type {anychart.enums.SidePosition} */(this.labels().getOption('position'))) : 1) +
      (this.minorLabels().enabled() ? anychart.utils.sidePositionToNumber(/** @type {anychart.enums.SidePosition} */(this.minorLabels().getOption('position'))) : 1) +
      (this.ticks().enabled() ? anychart.utils.sidePositionToNumber(/** @type {anychart.enums.SidePosition} */(this.ticks().getOption('position'))) : 1) +
      (this.minorTicks().enabled() ? anychart.utils.sidePositionToNumber(/** @type {anychart.enums.SidePosition} */(this.minorTicks().getOption('position'))) : 1)) != 4;
};


//endregion
//region --- Setup and Serialize
/** @inheritDoc */
anychart.core.Axis.prototype.serialize = function() {
  var json = anychart.core.Axis.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.core.Axis.SIMPLE_PROPS_DESCRIPTORS, json);
  json['title'] = this.title().serialize();
  json['labels'] = this.labels().serialize();
  json['minorLabels'] = this.minorLabels().serialize();
  json['ticks'] = this.ticks().serialize();
  json['minorTicks'] = this.minorTicks().serialize();
  return json;
};


/** @inheritDoc */
anychart.core.Axis.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.Axis.base(this, 'setupByJSON', config, opt_default);
  anychart.core.settings.deserialize(this, anychart.core.Axis.SIMPLE_PROPS_DESCRIPTORS, config, opt_default);

  if ('title' in config)
    this.title().setupInternal(!!opt_default, config['title']);

  if ('padding' in config)
    this.padding(config['padding']);

  this.labels().setupInternal(!!opt_default, config['labels']);
  this.minorLabels().setupInternal(!!opt_default, config['minorLabels']);
  this.ticks(config['ticks']);
  this.minorTicks(config['minorTicks']);
};


/** @inheritDoc */
anychart.core.Axis.prototype.disposeInternal = function() {
  // since we can't be sure that this instance isn't created by user
  // (e.g. standalone scale) - disposing is not an option. We just
  // unlisten signals and null it.
  if (this.internalScale)
    this.internalScale.unlistenSignals(this.scaleInvalidated, this);
  this.internalScale = null;

  goog.disposeAll(
      this.title_,
      this.padding_,
      this.line,
      this.labels_,
      this.minorLabels_,
      this.ticks_,
      this.minorTicks_);

  this.title_ = null;
  this.padding_ = null;

  this.line = null;
  this.labels_ = null;
  this.minorLabels_ = null;
  this.ticks_ = null;
  this.minorTicks_ = null;

  this.labelsBounds_.length = 0;
  this.minorLabelsBounds_.length = 0;
  this.pixelBounds = null;

  anychart.core.Axis.base(this, 'disposeInternal');
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
 * @extends {anychart.core.Axis}
 */
anychart.standalones.axes.Linear = function() {
  anychart.standalones.axes.Linear.base(this, 'constructor');
};
goog.inherits(anychart.standalones.axes.Linear, anychart.core.Axis);
anychart.core.makeStandalone(anychart.standalones.axes.Linear, anychart.core.Axis);


/**
 * Returns axis instance.<br/>
 * <b>Note:</b> Any axis must be bound to a scale.
 * @example <t>simple-h100</t>
 * anychart.standalones.axes.linear()
 *    .scale(anychart.scales.linear())
 *    .container(stage).draw();
 * @return {!anychart.standalones.axes.Linear}
 */
anychart.standalones.axes.linear = function() {
  var axis = new anychart.standalones.axes.Linear();
  axis.addThemes('standalones.linearAxis');
  return axis;
};


//endregion
//region --- Export
//exports
(function() {
  var proto = anychart.core.Axis.prototype;
  proto['title'] = proto.title;
  proto['labels'] = proto.labels;
  proto['minorLabels'] = proto.minorLabels;
  proto['ticks'] = proto.ticks;
  proto['minorTicks'] = proto.minorTicks;
  proto['scale'] = proto.scale;
  proto['getRemainingBounds'] = proto.getRemainingBounds;
  proto['isHorizontal'] = proto.isHorizontal;
  proto['padding'] = proto.padding;
  proto['getPixelBounds'] = proto.getPixelBounds;
  proto = anychart.standalones.axes.Linear.prototype;
  goog.exportSymbol('anychart.standalones.axes.linear', anychart.standalones.axes.linear);
  proto['padding'] = proto.padding;
  proto['draw'] = proto.draw;
  proto['parentBounds'] = proto.parentBounds;
  proto['container'] = proto.container;
})();
//endregion
