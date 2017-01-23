goog.provide('anychart.core.axes.Linear');
goog.require('acgraph');
goog.require('anychart.color');
goog.require('anychart.core.IStandaloneBackend');
goog.require('anychart.core.VisualBase');
goog.require('anychart.core.axes.Ticks');
goog.require('anychart.core.reporting');
goog.require('anychart.core.ui.LabelsFactory');
goog.require('anychart.core.ui.Title');
goog.require('anychart.core.utils.AxisLabelsContextProvider');
goog.require('anychart.core.utils.Padding');
goog.require('anychart.enums');
goog.require('anychart.math.Rect');
goog.require('anychart.scales.Base');
goog.require('anychart.scales.ScatterBase');
goog.require('anychart.utils');



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
anychart.core.axes.Linear = function() {
  this.suspendSignalsDispatching();
  anychart.core.axes.Linear.base(this, 'constructor');

  this.labelsBounds_ = [];
  this.minorLabelsBounds_ = [];

  /**
   * @type {acgraph.vector.Element}
   * @protected
   */
  this.line;

  /**
   * Constant to save space.
   * @type {number}
   * @protected
   */
  this.ALL_VISUAL_STATES = anychart.ConsistencyState.APPEARANCE |
      anychart.ConsistencyState.AXIS_TITLE |
      anychart.ConsistencyState.AXIS_LABELS |
      anychart.ConsistencyState.AXIS_TICKS |
      anychart.ConsistencyState.BOUNDS |
      anychart.ConsistencyState.AXIS_OVERLAP;
  this.resumeSignalsDispatching(false);
};
goog.inherits(anychart.core.axes.Linear, anychart.core.VisualBase);


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.axes.Linear.prototype.SUPPORTED_CONSISTENCY_STATES =
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
anychart.core.axes.Linear.prototype.SUPPORTED_SIGNALS = anychart.core.VisualBase.prototype.SUPPORTED_SIGNALS;


/**
 * @type {acgraph.vector.Path}
 * @private
 */
anychart.core.axes.Linear.prototype.line_ = null;


/**
 * @type {string}
 * @private
 */
anychart.core.axes.Linear.prototype.name_ = 'axis';


/**
 * @type {anychart.core.ui.Title}
 * @private
 */
anychart.core.axes.Linear.prototype.title_ = null;


/**
 * @type {anychart.core.ui.LabelsFactory}
 * @private
 */
anychart.core.axes.Linear.prototype.labels_ = null;


/**
 * @type {anychart.core.ui.LabelsFactory}
 * @private
 */
anychart.core.axes.Linear.prototype.minorLabels_ = null;


/**
 * @type {anychart.core.axes.Ticks}
 * @private
 */
anychart.core.axes.Linear.prototype.ticks_ = null;


/**
 * @type {anychart.core.axes.Ticks}
 * @private
 */
anychart.core.axes.Linear.prototype.minorTicks_ = null;


/**
 * @type {string|acgraph.vector.Stroke}
 * @private
 */
anychart.core.axes.Linear.prototype.stroke_;


/**
 * @type {?anychart.enums.Orientation}
 * @private
 */
anychart.core.axes.Linear.prototype.orientation_;


/**
 * @type {anychart.enums.Orientation}
 * @private
 */
anychart.core.axes.Linear.prototype.defaultOrientation_ = anychart.enums.Orientation.TOP;


/**
 * @type {anychart.scales.Base}
 * @protected
 */
anychart.core.axes.Linear.prototype.internalScale = null;


/**
 * @type {anychart.enums.LabelsOverlapMode}
 * @private
 */
anychart.core.axes.Linear.prototype.overlapMode_ = anychart.enums.LabelsOverlapMode.NO_OVERLAP;


/**
 * @type {boolean}
 * @private
 */
anychart.core.axes.Linear.prototype.staggerMode_ = false;


/**
 * @type {?number}
 * @private
 */
anychart.core.axes.Linear.prototype.staggerLines_ = null;


/**
 * @type {?number}
 * @private
 */
anychart.core.axes.Linear.prototype.staggerMaxLines_ = null;


/**
 * @type {number}
 * @private
 */
anychart.core.axes.Linear.prototype.staggerAutoLines_ = 1;


/**
 * @type {anychart.math.Rect}
 * @protected
 */
anychart.core.axes.Linear.prototype.pixelBounds = null;


/**
 * Axis width.
 * @type {?(number|string)}
 * @private
 */
anychart.core.axes.Linear.prototype.width_ = null;


/**
 * Axis padding.
 * @type {anychart.core.utils.Padding}
 * @private
 */
anychart.core.axes.Linear.prototype.padding_ = null;


/**
 * @type {number}
 * @private
 */
anychart.core.axes.Linear.prototype.offsetY_;


/**
 * @type {boolean}
 * @private
 */
anychart.core.axes.Linear.prototype.drawFirstLabel_ = true;


/**
 * @type {boolean}
 * @private
 */
anychart.core.axes.Linear.prototype.drawLastLabel_ = true;


/**
 * @type {Array.<Array.<number>>}
 * @private
 */
anychart.core.axes.Linear.prototype.labelsBounds_ = null;


/**
 * @type {Array.<Array.<number>>}
 * @private
 */
anychart.core.axes.Linear.prototype.minorLabelsBounds_ = null;


/**
 * Getter/setter for title.
 * @param {(null|boolean|Object|string)=} opt_value Axis title.
 * @return {!(anychart.core.ui.Title|anychart.core.axes.Linear)} Axis title or itself for method chaining.
 */
anychart.core.axes.Linear.prototype.title = function(opt_value) {
  if (!this.title_) {
    this.title_ = new anychart.core.ui.Title();
    this.title_.setParentEventTarget(this);
    this.title_.listenSignals(this.titleInvalidated_, this);
    this.registerDisposable(this.title_);
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
anychart.core.axes.Linear.prototype.titleInvalidated_ = function(event) {
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
 * @return {!(anychart.core.ui.LabelsFactory|anychart.core.axes.Linear)} Axis labels of itself for method chaining.
 */
anychart.core.axes.Linear.prototype.labels = function(opt_value) {
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
anychart.core.axes.Linear.prototype.labelsInvalidated_ = function(event) {
  var state = 0;
  var signal = 0;
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state = this.ALL_VISUAL_STATES;
    signal = anychart.Signal.BOUNDS_CHANGED | anychart.Signal.NEEDS_REDRAW;
  } else if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state = anychart.ConsistencyState.AXIS_LABELS | anychart.ConsistencyState.AXIS_TICKS;
    signal = anychart.Signal.NEEDS_REDRAW;
  }
  this.dropStaggeredLabelsCache_();
  this.dropBoundsCache();
  this.invalidate(state, signal);
};


/**
 * Getter/setter for minorLabels.
 * @param {(Object|boolean|null)=} opt_value Axis labels.
 * @return {!(anychart.core.ui.LabelsFactory|anychart.core.axes.Linear)} Axis labels of itself for method chaining.
 */
anychart.core.axes.Linear.prototype.minorLabels = function(opt_value) {
  if (!this.minorLabels_) {
    this.minorLabels_ = new anychart.core.ui.LabelsFactory();
    this.minorLabels_.setParentEventTarget(this);
    this.isHorizontal() ? this.minorLabels_.rotation(0) : this.minorLabels_.rotation(-90);
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
anychart.core.axes.Linear.prototype.minorLabelsInvalidated_ = function(event) {
  var state = 0;
  var signal = 0;
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state = this.ALL_VISUAL_STATES;
    signal = anychart.Signal.BOUNDS_CHANGED | anychart.Signal.NEEDS_REDRAW;
  } else if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state = anychart.ConsistencyState.AXIS_LABELS;
    signal = anychart.Signal.NEEDS_REDRAW;
  }
  this.dropBoundsCache();
  this.invalidate(state, signal);
};


/**
 * Create new ticks instance.
 * @return {anychart.core.axes.Ticks}
 * @protected
 */
anychart.core.axes.Linear.prototype.createTicks = function() {
  return new anychart.core.axes.Ticks();
};


/**
 * Create line.
 * @return {acgraph.vector.Element}
 * @protected
 */
anychart.core.axes.Linear.prototype.getLine = function() {
  return this.line ? this.line : this.line = /** @type {acgraph.vector.Element} */(acgraph.path());
};


/**
 * Getter/setter for ticks.
 * @param {(Object|boolean|null)=} opt_value Axis ticks.
 * @return {!(anychart.core.axes.Ticks|anychart.core.axes.Linear)} Axis ticks or itself for method chaining.
 */
anychart.core.axes.Linear.prototype.ticks = function(opt_value) {
  if (!this.ticks_) {
    this.ticks_ = this.createTicks();
    this.ticks_.setParentEventTarget(this);
    this.ticks_.listenSignals(this.ticksInvalidated, this);
    this.registerDisposable(this.ticks_);
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
 * @return {!(anychart.core.axes.Ticks|anychart.core.axes.Linear)} Axis ticks or itself for method chaining.
 */
anychart.core.axes.Linear.prototype.minorTicks = function(opt_value) {
  if (!this.minorTicks_) {
    this.minorTicks_ = this.createTicks();
    this.minorTicks_.setParentEventTarget(this);
    this.minorTicks_.listenSignals(this.ticksInvalidated, this);
    this.registerDisposable(this.minorTicks_);
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
anychart.core.axes.Linear.prototype.ticksInvalidated = function(event) {
  var state = 0;
  var signal = 0;
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state = this.ALL_VISUAL_STATES;
    signal = anychart.Signal.BOUNDS_CHANGED | anychart.Signal.NEEDS_REDRAW;
  } else if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state = anychart.ConsistencyState.AXIS_TICKS;
    signal = anychart.Signal.NEEDS_REDRAW;
  }
  this.invalidate(state, signal);
};


/**
 * Getter/setter for stroke.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {!(anychart.core.axes.Linear|acgraph.vector.Stroke)} .
 */
anychart.core.axes.Linear.prototype.stroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    opt_strokeOrFill = acgraph.vector.normalizeStroke.apply(null, arguments);
    if (this.stroke_ != opt_strokeOrFill) {
      var thicknessOld = goog.isObject(this.stroke_) ? this.stroke_['thickness'] || 1 : 1;
      var thicknessNew = goog.isObject(opt_strokeOrFill) ? opt_strokeOrFill['thickness'] || 1 : 1;
      this.stroke_ = opt_strokeOrFill;
      if (thicknessNew == thicknessOld)
        this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
      else
        this.invalidate(this.ALL_VISUAL_STATES, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.stroke_;
  }
};


/**
 * Getter/setter for orientation.
 * @param {(string|anychart.enums.Orientation|null)=} opt_value Axis orientation.
 * @return {anychart.enums.Orientation|!anychart.core.axes.Linear} Axis orientation or itself for method chaining.
 */
anychart.core.axes.Linear.prototype.orientation = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var orientation = goog.isNull(opt_value) ? null : anychart.enums.normalizeOrientation(opt_value);
    if (this.orientation_ != orientation) {
      this.orientation_ = orientation;
      this.dropStaggeredLabelsCache_();
      this.invalidate(this.ALL_VISUAL_STATES, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.orientation_ || this.defaultOrientation_;
  }
};


/**
 * Set axis default orientation.
 * @param {anychart.enums.Orientation} value Default orientation value.
 */
anychart.core.axes.Linear.prototype.setDefaultOrientation = function(value) {
  var needInvalidate = (this.defaultOrientation_ != value && !this.orientation_);
  this.defaultOrientation_ = value;
  if (needInvalidate)
    this.invalidate(this.ALL_VISUAL_STATES);
};


/**
 * Getter/setter for scale.
 * @param {anychart.scales.Base=} opt_value Scale.
 * @return {anychart.scales.Base|!anychart.core.axes.Linear} Axis scale or itself for method chaining.
 */
anychart.core.axes.Linear.prototype.scale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.internalScale != opt_value) {
      if (this.internalScale)
        this.internalScale.unlistenSignals(this.scaleInvalidated_, this);
      this.internalScale = opt_value;
      if (this.internalScale)
        this.internalScale.listenSignals(this.scaleInvalidated_, this);
      this.dropStaggeredLabelsCache_();
      this.dropBoundsCache();
      this.labels().dropCallsCache();
      this.minorLabels().dropCallsCache();
      this.invalidate(this.ALL_VISUAL_STATES, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.internalScale;
  }
};


/**
 * Internal ticks invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.axes.Linear.prototype.scaleInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.dropStaggeredLabelsCache_();
    this.dropBoundsCache();
    this.labels().dropCallsCache();
    this.minorLabels().dropCallsCache();
    this.invalidate(this.ALL_VISUAL_STATES, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
  }
};


/**
 * @param {?(number|string)=} opt_value .
 * @return {anychart.core.axes.Linear|number|string|null} .
 */
anychart.core.axes.Linear.prototype.width = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.width_ != opt_value) {
      this.width_ = opt_value;
      this.invalidate(this.ALL_VISUAL_STATES, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.width_;
};


/**
 * @param {(string|number|Array.<number|string>|{top:(number|string),left:(number|string),bottom:(number|string),right:(number|string)})=} opt_spaceOrTopOrTopAndBottom .
 * @param {(string|number)=} opt_rightOrRightAndLeft .
 * @param {(string|number)=} opt_bottom .
 * @param {(string|number)=} opt_left .
 * @return {!(anychart.core.axes.Linear|anychart.core.utils.Padding)} .
 */
anychart.core.axes.Linear.prototype.padding = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  if (!this.padding_) {
    this.padding_ = new anychart.core.utils.Padding();
    this.registerDisposable(this.padding_);
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
anychart.core.axes.Linear.prototype.paddingInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.dropStaggeredLabelsCache_();
    this.dropBoundsCache();
    this.invalidate(this.ALL_VISUAL_STATES,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);

  }
};


/** @inheritDoc */
anychart.core.axes.Linear.prototype.invalidateParentBounds = function() {
  this.dropStaggeredLabelsCache_();
  this.dropBoundsCache();
  this.invalidate(this.ALL_VISUAL_STATES, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
};


/**
 * Drop bounds cache.
 */
anychart.core.axes.Linear.prototype.dropBoundsCache = function() {
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
anychart.core.axes.Linear.prototype.getOverlappedLabels_ = function(opt_bounds) {
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
                if ((!k && this.drawFirstLabel()) || (k == ticksArrLen - 1 && this.drawLastLabel()) || (k != 0 && k != ticksArrLen - 1))
                  bounds1 = this.getLabelBounds_(k, true, scaleTicksArr, opt_bounds);
                else
                  bounds1 = null;

                if (prevDrawableLabel != -1)
                  bounds2 = this.getLabelBounds_(prevDrawableLabel, true, scaleTicksArr, opt_bounds);
                else
                  bounds2 = null;

                if (k != ticksArrLen - 1 && this.drawLastLabel())
                  bounds3 = this.getLabelBounds_(ticksArrLen - 1, true, scaleTicksArr, opt_bounds);
                else
                  bounds3 = null;

                if (bounds1 && !(anychart.math.checkRectIntersection(bounds1, bounds2) ||
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
              if (isLabels && i == nextDrawableLabel) {
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
        } else if (scale instanceof anychart.scales.Base) {
          for (i = 0; i < ticksArrLen; i++) {
            if (isLabels) {
              if ((!i && this.drawFirstLabel()) || (i == ticksArrLen - 1 && this.drawLastLabel()) || (i != 0 && i != ticksArrLen - 1))
                bounds1 = this.getLabelBounds_(i, true, scaleTicksArr, opt_bounds);
              else
                bounds1 = null;

              if (prevDrawableLabel != -1)
                bounds2 = this.getLabelBounds_(prevDrawableLabel, true, scaleTicksArr, opt_bounds);
              else
                bounds2 = null;

              if (i != ticksArrLen - 1 && this.drawLastLabel())
                bounds3 = this.getLabelBounds_(ticksArrLen - 1, true, scaleTicksArr, opt_bounds);
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
 * @private
 */
anychart.core.axes.Linear.prototype.dropStaggeredLabelsCache_ = function() {
  this.staggeredLabels_ = null;
};


/**
 * Applies stagger labels mode and returns an object with indexes of labels to draw.
 * @param {anychart.math.Rect=} opt_bounds Parent bounds.
 * @return {boolean|Object.<string, boolean|Array.<boolean>>} Object with indexes of labels to draw.
 * or Boolean when there are no labels.
 * @private
 */
anychart.core.axes.Linear.prototype.applyStaggerMode_ = function(opt_bounds) {
  if (!this.staggeredLabels_) {
    var scale = /** @type {anychart.scales.ScatterBase|anychart.scales.Ordinal} */(this.scale());
    if (!(scale && this.labels().enabled()))
      return this.staggeredLabels_ = {labels: false, minorLabels: false};

    this.staggerAutoLines_ = 1;
    this.currentStageLines_ = 1;
    var labels;
    var scaleTicksArr = scale.ticks().get();
    var ticksArrLen = scaleTicksArr.length;
    var i, j, k, bounds1, bounds2, bounds3, states;

    if (!goog.isNull(this.staggerLines_)) {
      this.currentStageLines_ = this.staggerLines_;
    } else {
      var isConvergence = false;
      i = 1;
      while (!isConvergence && i <= ticksArrLen) {
        isConvergence = true;

        for (k = 0; k < i; k++) {
          for (j = k; j < ticksArrLen - i; j = j + i) {
            bounds1 = this.getLabelBounds_(j, true, scaleTicksArr, opt_bounds);
            bounds2 = this.getLabelBounds_(j + i, true, scaleTicksArr, opt_bounds);

            if (anychart.math.checkRectIntersection(bounds1, bounds2)) {
              isConvergence = false;
              i++;
              break;
            }
          }
          if (!isConvergence) break;
        }
      }
      this.staggerAutoLines_ = isConvergence ? i : ticksArrLen;

      if (!goog.isNull(this.staggerMaxLines_) && this.staggerAutoLines_ > this.staggerMaxLines_) {
        this.currentStageLines_ = this.staggerMaxLines_;
      } else {
        this.currentStageLines_ = this.staggerAutoLines_;
      }
    }

    var limitedLineNumber = (!goog.isNull(this.staggerLines_) ||
        !goog.isNull(this.staggerMaxLines_) && this.staggerAutoLines_ > this.staggerMaxLines_);

    if (limitedLineNumber && this.overlapMode() == anychart.enums.LabelsOverlapMode.NO_OVERLAP) {
      states = [];
      for (j = 0; j < this.currentStageLines_; j++) {
        var prevDrawableLabel = -1;
        for (i = j; i < ticksArrLen; i = i + this.currentStageLines_) {
          bounds1 = this.getLabelBounds_(i, true, scaleTicksArr, opt_bounds);

          if (prevDrawableLabel != -1)
            bounds2 = this.getLabelBounds_(prevDrawableLabel, true, scaleTicksArr, opt_bounds);
          else
            bounds2 = null;

          if (i != ticksArrLen - 1 && this.drawLastLabel())
            bounds3 = this.getLabelBounds_(ticksArrLen - 1, true, scaleTicksArr, opt_bounds);
          else
            bounds3 = null;

          if (!i) {
            if (this.drawFirstLabel()) {
              prevDrawableLabel = i;
              states[i] = true;
            } else {
              states[i] = false;
            }
          } else if (i == ticksArrLen - 1) {
            if (this.drawLastLabel()) {
              prevDrawableLabel = i;
              states[i] = true;
            } else {
              states[i] = false;
            }
          } else if (!(anychart.math.checkRectIntersection(bounds1, bounds2) ||
              anychart.math.checkRectIntersection(bounds1, bounds3))) {
            prevDrawableLabel = i;
            states[i] = true;
          } else {
            states[i] = false;
          }
        }
      }
      if (!this.drawFirstLabel()) states[0] = false;
      if (!this.drawLastLabel()) states[states.length - 1] = false;
      labels = {labels: states, minorLabels: false};
    } else {
      if (!this.drawFirstLabel() || !this.drawLastLabel()) {
        states = [];
        for (i = 0; i < ticksArrLen; i++) {
          if (!i && !this.drawFirstLabel()) states[i] = false;
          else if (i == ticksArrLen - 1 && !this.drawLastLabel()) states[i] = false;
          else states[i] = true;
        }
      }
      labels = {labels: states ? states : true, minorLabels: false};
    }

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

    return this.staggeredLabels_ = labels;
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
anychart.core.axes.Linear.prototype.calcLabels_ = function(opt_bounds) {
  return this.staggerMode() ?
      this.applyStaggerMode_(opt_bounds) :
      this.getOverlappedLabels_(opt_bounds);
};


/**
 * Returns ticks length that affects axis size calculation.
 * @param {!anychart.core.axes.Ticks} ticks Ticks instance.
 * @param {number=} opt_side If value greater than 0 - calculates offset relative outside position,
 * less then 0 - relative inside position, equal to 0 - relative both sides.
 * @return {number} Ticks length.
 */
anychart.core.axes.Linear.prototype.getAffectBoundsTickLength = function(ticks, opt_side) {
  var length = 0;
  if (ticks.enabled()) {
    if (ticks.position() == anychart.enums.SidePosition.OUTSIDE) {
      length = ticks.length();
    } else if (ticks.position() == anychart.enums.SidePosition.CENTER) {
      length = ticks.length() / 2;
    } else {
      length = 0;
    }
  }
  return /** @type {number} */(length);
};


/**
 * Calculates the size which affects the axis bounds.
 * @param {number} maxLabelSize Max size among of labels.
 * @param {number} maxMinorLabelSize Max size among of minor labels.
 * @return {number}
 * @protected
 */
anychart.core.axes.Linear.prototype.calcSize = function(maxLabelSize, maxMinorLabelSize) {
  var ticks = /** @type {!anychart.core.axes.Ticks} */(this.ticks());
  var minorTicks = /** @type {!anychart.core.axes.Ticks} */(this.minorTicks());

  var ticksLength = this.getAffectBoundsTickLength(ticks);
  var minorTicksLength = this.getAffectBoundsTickLength(minorTicks);

  var sumTicksAndLabelsSizes = 0, sumMinorTicksAndLabelsSizes = 0;
  if (ticks.position() == anychart.enums.SidePosition.OUTSIDE) {
    sumTicksAndLabelsSizes = maxLabelSize + ticksLength;
    if (minorTicks.position() == anychart.enums.SidePosition.OUTSIDE)
      sumMinorTicksAndLabelsSizes = maxMinorLabelSize + minorTicksLength;
    else if (minorTicks.position() == anychart.enums.SidePosition.CENTER)
      sumMinorTicksAndLabelsSizes = maxMinorLabelSize + minorTicksLength / 2;
    else
      sumMinorTicksAndLabelsSizes = maxMinorLabelSize;
  } else if (ticks.position() == anychart.enums.SidePosition.CENTER) {
    sumTicksAndLabelsSizes = maxLabelSize + ticksLength / 2;
    if (minorTicks.position() == anychart.enums.SidePosition.OUTSIDE)
      sumMinorTicksAndLabelsSizes = maxMinorLabelSize + minorTicksLength;
    else if (minorTicks.position() == anychart.enums.SidePosition.CENTER)
      sumMinorTicksAndLabelsSizes = maxMinorLabelSize + minorTicksLength / 2;
    else
      sumMinorTicksAndLabelsSizes = maxMinorLabelSize;
  } else {
    sumTicksAndLabelsSizes = maxLabelSize;
    if (minorTicks.position() == anychart.enums.SidePosition.OUTSIDE)
      sumMinorTicksAndLabelsSizes = maxMinorLabelSize + minorTicksLength;
    else if (minorTicks.position() == anychart.enums.SidePosition.CENTER)
      sumMinorTicksAndLabelsSizes = maxMinorLabelSize + minorTicksLength / 2;
    else
      sumMinorTicksAndLabelsSizes = maxMinorLabelSize;
  }

  return Math.max(sumTicksAndLabelsSizes, sumMinorTicksAndLabelsSizes);
};


/**
 * Calculates the size of an axis (for horizontal - height, for vertical - width)
 * @param {anychart.math.Rect} parentBounds Parent bounds.
 * @param {number} length Axis length.
 * @return {number} Size.
 * @protected
 */
anychart.core.axes.Linear.prototype.getSize = function(parentBounds, length) {
  var bounds, size, i, delta, len;
  var maxLabelSize = 0;
  var maxMinorLabelSize = 0;
  var titleSize = 0;

  var title = this.title();
  var labels = this.labels();
  var minorLabels = this.minorLabels();
  var orientation = /** @type {anychart.enums.Orientation} */(this.orientation());

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
  var isMinorLabels = /** @type {boolean} */(minorLabels.enabled() && goog.isDef(scale) && scale instanceof anychart.scales.ScatterBase);

  var width = this.isHorizontal() ? length : 0;
  var height = this.isHorizontal() ? 0 : length;

  var tempBounds = new anychart.math.Rect(0, 0, width, height);

  var overlappedLabels = this.calcLabels_(tempBounds);
  var ticksArr;

  if (isLabels && scale) {
    ticksArr = scale.ticks().get();
    var drawLabels = goog.isObject(overlappedLabels) ? overlappedLabels.labels : !overlappedLabels;
    if (this.staggerMode()) {
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

  if (isMinorLabels && !this.staggerMode()) {
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

  delta = this.calcSize(maxLabelSize, maxMinorLabelSize) + titleSize;
  return /** @type {number} */(delta);
};


/**
 * Axis length calculation.
 * @param {number} parentLength Parent length.
 * @return {number}
 * @protected
 */
anychart.core.axes.Linear.prototype.getLength = function(parentLength) {
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
 * var axis = anychart.axes.linear();
 * axis
 *     .orientation('left')
 *     .scale(anychart.scales.ordinal().values([1,2,3]))
 *     .container(stage).draw();
 * var label = anychart.ui.label();
 * label
 *     .parentBounds(axis.getRemainingBounds())
 *     .width('100%')
 *     .height('100%')
 *     .padding(15)
 *     .background()
 *       .enabled(true)
 *       .fill('blue 0.2')
 * label.container(stage).draw();
 * @return {!anychart.math.Rect} Parent bounds without the space used by the title.
 */
anychart.core.axes.Linear.prototype.getRemainingBounds = function() {
  var parentBounds = this.parentBounds();

  if (parentBounds) {
    var remainingBounds = parentBounds.clone();

    if (this.scale() && this.enabled()) {
      var axisBounds = this.getPixelBounds();
      var padding = this.padding();
      var heightOffset = parentBounds.height - padding.tightenHeight(parentBounds.height) + axisBounds.height;
      var widthOffset = parentBounds.width - padding.tightenWidth(parentBounds.width) + axisBounds.width;

      switch (this.orientation()) {
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
 * @return {number} Calculated size.
 */
anychart.core.axes.Linear.prototype.calculateSize = function(parentSize, length, parentBounds) {
  return this.width_ ?
      anychart.utils.normalizeSize(this.width_, parentSize) :
      this.getSize(parentBounds, length);
};


/**
 * Gets axis pixel bounds.
 * @return {anychart.math.Rect} Pixel bounds.
 */
anychart.core.axes.Linear.prototype.getPixelBounds = function() {
  if (!this.pixelBounds || this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
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
      var size = this.calculateSize(parentSize, length, parentBounds);

      var x, y;
      var padding = this.padding();
      var topPad = anychart.utils.normalizeSize(/** @type {number|string} */(padding.getOption('top')), parentBounds.height);
      var rightPad = anychart.utils.normalizeSize(/** @type {number|string} */(padding.getOption('right')), parentBounds.width);
      var bottomPad = anychart.utils.normalizeSize(/** @type {number|string} */(padding.getOption('bottom')), parentBounds.height);
      var leftPad = anychart.utils.normalizeSize(/** @type {number|string} */(padding.getOption('left')), parentBounds.width);

      var width, height;
      switch (this.orientation()) {
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
      this.pixelBounds = new anychart.math.Rect(Math.round(x), Math.round(y), Math.round(width), Math.round(height));
    } else {
      this.pixelBounds = new anychart.math.Rect(0, 0, 0, 0);
    }
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }
  return this.pixelBounds;
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
anychart.core.axes.Linear.prototype.getLabelBounds_ = function(index, isMajor, ticksArray, opt_parentBounds) {
  if (!isMajor && this.scale() && !(this.scale() instanceof anychart.scales.ScatterBase))
    return null;

  var boundsCache = isMajor ? this.labelsBounds_ : this.minorLabelsBounds_;
  if (goog.isDef(boundsCache[index]))
    return boundsCache[index];

  var bounds = goog.isDef(opt_parentBounds) ? opt_parentBounds : this.getPixelBounds();
  var lineBounds = goog.isDef(opt_parentBounds) ? opt_parentBounds : this.line.getBounds();
  var ticks = isMajor ? this.ticks() : this.minorTicks();
  var ticksLength = ticks.length();
  var stroke = this.stroke();
  var lineThickness = !stroke || anychart.utils.isNone(stroke) ? 0 : stroke['thickness'] ? parseFloat(this.stroke()['thickness']) : 1;

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

  var isEnabled = ticks.enabled();
  var position = ticks.position();

  switch (this.orientation()) {
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

  var formatProvider = this.getLabelsFormatProvider(index, value);
  var positionProvider = {'value': {'x': x, 'y': y}};

  var labelBounds = labels.measure(formatProvider, positionProvider, undefined, index);

  switch (this.orientation()) {
    case anychart.enums.Orientation.TOP:
      labelBounds.top += labelBounds.height / 2;
      break;
    case anychart.enums.Orientation.RIGHT:
      labelBounds.left += labelBounds.width / 2;
      break;
    case anychart.enums.Orientation.BOTTOM:
      labelBounds.top += labelBounds.height / 2;
      break;
    case anychart.enums.Orientation.LEFT:
      labelBounds.left += labelBounds.width / 2;
      break;
  }


  return boundsCache[index] = labelBounds.toCoordinateBox();
};


/**
 * Getter/setter for drawFirstLabel.
 * @param {boolean=} opt_value Drawing flag.
 * @return {boolean|!anychart.core.axes.Linear} Drawing flag or itself for method chaining.
 */
anychart.core.axes.Linear.prototype.drawFirstLabel = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.drawFirstLabel_ != opt_value) {
      this.drawFirstLabel_ = opt_value;
      this.dropStaggeredLabelsCache_();
      this.invalidate(this.ALL_VISUAL_STATES, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.drawFirstLabel_;
};


/**
 * Getter/setter for drawLastLabel.
 * @param {boolean=} opt_value Drawing flag.
 * @return {boolean|!anychart.core.axes.Linear} Drawing flag or itself for method chaining.
 */
anychart.core.axes.Linear.prototype.drawLastLabel = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.drawLastLabel_ != opt_value) {
      this.drawLastLabel_ = opt_value;
      this.dropStaggeredLabelsCache_();
      this.invalidate(this.ALL_VISUAL_STATES, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.drawLastLabel_;
};


/**
 * Getter/setter for overlapMode.
 * @param {(anychart.enums.LabelsOverlapMode|string)=} opt_value Value to set.
 * @return {anychart.enums.LabelsOverlapMode|!anychart.core.axes.Linear} Drawing flag or itself for method chaining.
 */
anychart.core.axes.Linear.prototype.overlapMode = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var overlap = anychart.enums.normalizeLabelsOverlapMode(opt_value, this.overlapMode_);
    if (this.overlapMode_ != overlap) {
      this.overlapMode_ = overlap;
      this.invalidate(this.ALL_VISUAL_STATES, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.overlapMode_;
};


/**
 * Getter/setter for staggerMode.
 * @param {boolean=} opt_value On/off.
 * @return {boolean|!anychart.core.axes.Linear} .
 */
anychart.core.axes.Linear.prototype.staggerMode = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.staggerMode_ != opt_value) {
      this.staggerMode_ = opt_value;
      this.invalidate(this.ALL_VISUAL_STATES, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.staggerMode_;
};


/**
 * Getter/setter for staggerLines.
 * @param {?number=} opt_value Fixed/auto.
 * @return {null|number|!anychart.core.axes.Linear} .
 */
anychart.core.axes.Linear.prototype.staggerLines = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = goog.isNull(opt_value) ? null : anychart.utils.normalizeToNaturalNumber(opt_value);
    if (this.staggerLines_ != opt_value) {
      this.staggerLines_ = opt_value;
      this.dropStaggeredLabelsCache_();
      if (this.staggerMode_)
        this.invalidate(this.ALL_VISUAL_STATES, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.staggerLines_;
};


/**
 * Getter/setter for staggerMaxLines.
 * @param {?number=} opt_value .
 * @return {null|number|!anychart.core.axes.Linear} .
 */
anychart.core.axes.Linear.prototype.staggerMaxLines = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.normalizeToNaturalNumber(opt_value);
    if (this.staggerMaxLines_ != opt_value) {
      this.staggerMaxLines_ = opt_value;
      this.dropStaggeredLabelsCache_();
      if (this.staggerMode_)
        this.invalidate(this.ALL_VISUAL_STATES, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.staggerMaxLines_;
};


/**
 * Whether an axis is horizontal.
 * @return {boolean} If the axis is horizontal.
 */
anychart.core.axes.Linear.prototype.isHorizontal = function() {
  var orientation = this.orientation();
  return orientation == anychart.enums.Orientation.TOP ||
      orientation == anychart.enums.Orientation.BOTTOM;
};


/**
 * Axis line drawer for top orientation.
 * @param {anychart.math.Rect} bounds Bounds.
 * @param {number} pixelShift Pixel shift.
 * @param {number} lineThickness Stroke thickness.
 * @param {number} offset Offset.
 * @param {number} size Size.
 * @protected
 */
anychart.core.axes.Linear.prototype.drawTopLine = function(bounds, pixelShift, lineThickness, offset, size) {
  var y = bounds.top + bounds.height + lineThickness / 2;
  this.line
      .moveTo(bounds.left + pixelShift, y)
      .lineTo(bounds.left - pixelShift + bounds.width, y);
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
anychart.core.axes.Linear.prototype.drawRightLine = function(bounds, pixelShift, lineThickness, offset, size) {
  var x = bounds.left - lineThickness / 2;
  this.line
      .moveTo(x, bounds.top + pixelShift)
      .lineTo(x, bounds.top - pixelShift + bounds.height);
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
anychart.core.axes.Linear.prototype.drawBottomLine = function(bounds, pixelShift, lineThickness, offset, size) {
  var y = bounds.top - lineThickness / 2;
  this.line
      .moveTo(bounds.left + pixelShift, y)
      .lineTo(bounds.left - pixelShift + bounds.width, y);
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
anychart.core.axes.Linear.prototype.drawLeftLine = function(bounds, pixelShift, lineThickness, offset, size) {
  var x = bounds.left + bounds.width + lineThickness / 2;
  this.line
      .moveTo(x, bounds.top + pixelShift)
      .lineTo(x, bounds.top - pixelShift + bounds.height);
};


/**
 * Draws axis line.
 * @protected
 */
anychart.core.axes.Linear.prototype.drawLine = function() {
  this.getLine().clear();

  var orientation = /** @type {anychart.enums.Orientation} */(this.orientation());

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

  var stroke = this.stroke();
  var lineThickness = stroke && stroke['thickness'] ? parseFloat(stroke['thickness']) : 1;
  var pixelShift = lineThickness % 2 == 0 ? 0 : 0.5;
  var bounds = this.getPixelBounds();

  lineDrawer.call(this, bounds, pixelShift, lineThickness, 0, 0);

  this.line.stroke(/** @type {acgraph.vector.Stroke} */(this.stroke()));
};


/**
 * Gets format provider for label.
 * @param {number} index Label index.
 * @param {string|number} value Label value.
 * @return {Object} Labels format provider.
 * @protected
 */
anychart.core.axes.Linear.prototype.getLabelsFormatProvider = function(index, value) {
  return new anychart.core.utils.AxisLabelsContextProvider(this, index, value);
};


/**
 * Axis labels drawer.
 * @param {number|string} value Scale ratio.
 * @param {number} ratio Scale ratio.
 * @param {number} index Scale label index.
 * @param {number} pixelShift Pixel shift for sharp display.
 * @param {boolean} isMajor Is major label.
 * @param {Array} ticksArr
 * @private
 */
anychart.core.axes.Linear.prototype.drawLabel_ = function(value, ratio, index, pixelShift, isMajor, ticksArr) {
  var bounds = this.getPixelBounds();
  var lineBounds = this.line.getBounds();

  var labels, ticks;
  if (isMajor) {
    ticks = /** @type {!anychart.core.axes.Ticks} */(this.ticks());
    labels = this.labels();
  } else {
    ticks = /** @type {!anychart.core.axes.Ticks} */(this.minorTicks());
    labels = this.minorLabels();
  }

  var stroke = this.stroke();
  var lineThickness = !stroke || anychart.utils.isNone(stroke) ? 0 : stroke['thickness'] ? parseFloat(stroke['thickness']) : 1;
  var labelBounds = anychart.math.Rect.fromCoordinateBox(this.getLabelBounds_(index, isMajor, ticksArr));
  var orientation = this.orientation();
  var staggerSize = 0;

  if (isMajor) {
    var incSize = true;
    if (this.currentStageLines_ > 1 && this.staggerMode()) {
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

  var x, y;
  var tickLength = this.getAffectBoundsTickLength(ticks, -1);
  switch (orientation) {
    case anychart.enums.Orientation.TOP:
      x = Math.round(bounds.left + ratio * bounds.width) + pixelShift;
      y = lineBounds.top - lineThickness / 2 - labelBounds.height / 2 - staggerSize - tickLength;
      break;
    case anychart.enums.Orientation.RIGHT:
      x = lineBounds.getRight() + lineThickness / 2 + labelBounds.width / 2 + staggerSize + tickLength;
      y = Math.round(bounds.top + bounds.height - ratio * bounds.height) + pixelShift;
      break;
    case anychart.enums.Orientation.BOTTOM:
      x = Math.round(bounds.left + ratio * bounds.width) + pixelShift;
      y = lineBounds.getBottom() + lineThickness / 2 + labelBounds.height / 2 + staggerSize + tickLength;
      break;
    case anychart.enums.Orientation.LEFT:
      x = lineBounds.left - lineThickness / 2 - labelBounds.width / 2 - staggerSize - tickLength;
      y = Math.round(bounds.top + bounds.height - ratio * bounds.height) + pixelShift;
      break;
  }

  var formatProvider = this.getLabelsFormatProvider(index, value);
  var positionProvider = {'value': {x: x, y: y}};

  labels.add(formatProvider, positionProvider, index);
};


/** @inheritDoc */
anychart.core.axes.Linear.prototype.checkDrawingNeeded = function() {
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
 * Axis drawing.
 * @return {anychart.core.axes.Linear} An instance of {@link anychart.core.axes.Linear} class for method chaining.
 */
anychart.core.axes.Linear.prototype.draw = function() {
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
  var orientation = /** @type {anychart.enums.Orientation} */(this.orientation());

  this.title().suspendSignalsDispatching();
  this.labels().suspendSignalsDispatching();
  this.minorLabels().suspendSignalsDispatching();
  this.ticks().suspendSignalsDispatching();
  this.minorTicks().suspendSignalsDispatching();

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    this.drawLine();
    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    var zIndex = /** @type {number} */(this.zIndex());
    this.title().zIndex(zIndex);
    this.line.zIndex(zIndex);
    this.ticks().zIndex(zIndex);
    this.minorTicks().zIndex(zIndex);
    this.labels().zIndex(zIndex);
    this.minorLabels().zIndex(zIndex);
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    var container = /** @type {acgraph.vector.ILayer} */(this.container());
    this.title().container(container);
    this.line.parent(container);
    this.ticks().container(container);
    this.minorTicks().container(container);

    this.labels().container(container);
    this.minorLabels().container(container);
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.AXIS_TITLE)) {
    var title = this.title();
    title.parentBounds(this.getPixelBounds());
    title.defaultOrientation(orientation);
    title.draw();
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
    labels.clear();

    var minorLabels = this.minorLabels();
    if (!minorLabels.container()) minorLabels.container(/** @type {acgraph.vector.ILayer} */(this.container()));
    minorLabels.parentBounds(/** @type {anychart.math.Rect} */(this.parentBounds()));
    minorLabels.clear();

    this.markConsistent(anychart.ConsistencyState.AXIS_LABELS);
  }

  if (goog.isDef(ticksDrawer) || goog.isDef(minorTicksDrawer)) {
    var i, j, overlappedLabels, needDrawLabels, needDrawMinorLabels;

    var scaleTicksArr = scale.ticks().get();
    var ticksArrLen = scaleTicksArr.length;
    var tickThickness = this.ticks().stroke() && this.ticks().stroke()['thickness'] ? parseFloat(this.ticks_.stroke()['thickness']) : 1;
    var tickVal, ratio, drawLabel, drawTick;
    var pixelBounds = this.getPixelBounds();
    var lineBounds = this.line.getBounds();
    var stroke = this.stroke();
    lineThickness = !stroke || anychart.utils.isNone(stroke) ? 0 : stroke['thickness'] ? parseFloat(stroke['thickness']) : 1;

    if (scale instanceof anychart.scales.ScatterBase) {
      overlappedLabels = this.calcLabels_();

      if (goog.isObject(overlappedLabels)) {
        needDrawLabels = overlappedLabels.labels;
        needDrawMinorLabels = overlappedLabels.minorLabels;
      } else {
        needDrawLabels = !overlappedLabels;
        needDrawMinorLabels = !overlappedLabels;
      }

      var scaleMinorTicksArr = scale.minorTicks().get();
      var minorTickThickness = this.minorTicks_.stroke() && this.minorTicks_.stroke()['thickness'] ? parseFloat(this.minorTicks_.stroke()['thickness']) : 1;

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

          if (drawLabel)
            this.drawLabel_(tickVal, scale.transform(tickVal, .5), i, majorPixelShift, true, scaleTicksArr);
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

          if (drawLabel && prevMajorRatio != minorRatio)
            this.drawLabel_(minorTickVal, scale.transform(minorTickVal, .5), j, minorPixelShift, false, scaleMinorTicksArr);
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
        ratio = scale.transform(leftTick, 0);

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
        if (drawLabel && labelPosition >= 0 && labelPosition <= 1)
          this.drawLabel_(leftTick, labelPosition, i, pixelShift, true, scaleTicksArr);
      }
    }

    this.labels().draw();
  }

  this.title().resumeSignalsDispatching(false);
  this.labels().resumeSignalsDispatching(false);
  this.minorLabels().resumeSignalsDispatching(false);
  this.ticks().resumeSignalsDispatching(false);
  this.minorTicks().resumeSignalsDispatching(false);

  return this;
};


/** @inheritDoc */
anychart.core.axes.Linear.prototype.remove = function() {
  if (this.title_) this.title_.remove();
  if (this.line) this.line.parent(null);
  this.ticks().remove();
  this.minorTicks().remove();
  if (this.labels_) this.labels_.remove();
  if (this.minorLabels_) this.minorLabels_.remove();
};


/** @inheritDoc */
anychart.core.axes.Linear.prototype.serialize = function() {
  var json = anychart.core.axes.Linear.base(this, 'serialize');
  json['title'] = this.title().serialize();
  json['labels'] = this.labels().serialize();
  json['minorLabels'] = this.minorLabels().serialize();
  json['ticks'] = this.ticks().serialize();
  json['minorTicks'] = this.minorTicks().serialize();
  json['stroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke} */(this.stroke()));
  json['staggerMode'] = this.staggerMode();
  json['staggerLines'] = this.staggerLines();
  json['staggerMaxLines'] = this.staggerMaxLines();
  json['width'] = this.width();
  if (this.orientation_) json['orientation'] = this.orientation_;
  json['drawFirstLabel'] = this.drawFirstLabel();
  json['drawLastLabel'] = this.drawLastLabel();
  json['overlapMode'] = this.overlapMode();
  return json;
};


/** @inheritDoc */
anychart.core.axes.Linear.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.axes.Linear.base(this, 'setupByJSON', config, opt_default);

  if ('title' in config)
    this.title(config['title']);

  this.labels().setup(config['labels']);
  this.minorLabels().setup(config['minorLabels']);
  this.ticks(config['ticks']);
  this.minorTicks(config['minorTicks']);
  this.staggerMode(config['staggerMode']);
  this.staggerLines(config['staggerLines']);
  this.staggerMaxLines(config['staggerMaxLines']);
  this.stroke(config['stroke']);
  this.width(config['width']);
  this.orientation(config['orientation']);
  this.drawFirstLabel(config['drawFirstLabel']);
  this.drawLastLabel(config['drawLastLabel']);
  this.overlapMode(config['overlapMode']);
};


/** @inheritDoc */
anychart.core.axes.Linear.prototype.disposeInternal = function() {
  anychart.core.axes.Linear.base(this, 'disposeInternal');

  if (this.internalScale)
    this.internalScale.unlistenSignals(this.scaleInvalidated_, this);
  delete this.internalScale;
  this.labelsBounds_ = null;
  this.minorLabelsBounds_ = null;

  this.title_ = null;

  goog.disposeAll(this.padding_, this.line, this.labels_, this.minorLabels_);

  this.padding_ = null;
  this.line = null;
  this.ticks_ = null;
  this.minorTicks_ = null;
  this.pixelBounds = null;
  this.labels_ = null;
  this.minorLabels_ = null;
};


//exports
(function() {
  var proto = anychart.core.axes.Linear.prototype;
  proto['staggerMode'] = proto.staggerMode;
  proto['staggerLines'] = proto.staggerLines;
  proto['staggerMaxLines'] = proto.staggerMaxLines;
  proto['title'] = proto.title;
  proto['labels'] = proto.labels;
  proto['minorLabels'] = proto.minorLabels;
  proto['ticks'] = proto.ticks;
  proto['minorTicks'] = proto.minorTicks;
  proto['stroke'] = proto.stroke;
  proto['orientation'] = proto.orientation;
  proto['scale'] = proto.scale;
  proto['width'] = proto.width;
  proto['getRemainingBounds'] = proto.getRemainingBounds;
  proto['drawFirstLabel'] = proto.drawFirstLabel;
  proto['drawLastLabel'] = proto.drawLastLabel;
  proto['overlapMode'] = proto.overlapMode;
  proto['isHorizontal'] = proto.isHorizontal;
  proto['padding'] = proto.padding;
})();
