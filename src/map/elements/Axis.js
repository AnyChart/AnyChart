//region --- Requiring and Providing
goog.provide('anychart.mapModule.elements.Axis');
goog.require('anychart.core.VisualBase');
goog.require('anychart.core.settings');
goog.require('anychart.core.ui.LabelsFactory');
goog.require('anychart.core.ui.Title');
goog.require('anychart.format.Context');
goog.require('anychart.mapModule.elements.AxisTicks');
goog.require('anychart.math.Rect');
//endregion



/**
 * @constructor
 * @extends {anychart.core.VisualBase}
 * @implements {anychart.core.settings.IResolvable}
 */
anychart.mapModule.elements.Axis = function() {
  anychart.mapModule.elements.Axis.base(this, 'constructor');

  this.labelsBounds_ = [];

  this.minorLabelsBounds_ = [];

  /**
   * Parent title.
   * @type {anychart.mapModule.elements.AxisSettings}
   * @private
   */
  this.parent_ = null;

  /**
   * Resolution chain cache.
   * @type {?Array.<Object|null|undefined>}
   * @private
   */
  this.resolutionChainCache_ = null;

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
    ['stroke', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['overlapMode',
          anychart.ConsistencyState.APPEARANCE |
          anychart.ConsistencyState.AXIS_TITLE |
          anychart.ConsistencyState.AXIS_LABELS |
          anychart.ConsistencyState.AXIS_TICKS |
          anychart.ConsistencyState.BOUNDS |
          anychart.ConsistencyState.AXIS_OVERLAP,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['drawFirstLabel',
          anychart.ConsistencyState.APPEARANCE |
          anychart.ConsistencyState.AXIS_TITLE |
          anychart.ConsistencyState.AXIS_LABELS |
          anychart.ConsistencyState.AXIS_TICKS |
          anychart.ConsistencyState.BOUNDS |
          anychart.ConsistencyState.AXIS_OVERLAP,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['drawLastLabel',
          anychart.ConsistencyState.APPEARANCE |
          anychart.ConsistencyState.AXIS_TITLE |
          anychart.ConsistencyState.AXIS_LABELS |
          anychart.ConsistencyState.AXIS_TICKS |
          anychart.ConsistencyState.BOUNDS |
          anychart.ConsistencyState.AXIS_OVERLAP,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED]
  ]);
};
goog.inherits(anychart.mapModule.elements.Axis, anychart.core.VisualBase);


//region --- Internal properties
/**
 * Supported consistency states.
 * @type {number}
 */
anychart.mapModule.elements.Axis.prototype.SUPPORTED_CONSISTENCY_STATES =
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
anychart.mapModule.elements.Axis.prototype.SUPPORTED_SIGNALS =
    anychart.core.VisualBase.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.ENABLED_STATE_CHANGED;


/**
 * @type {acgraph.vector.Path}
 * @protected
 */
anychart.mapModule.elements.Axis.prototype.line = null;


/**
 * @type {string}
 * @private
 */
anychart.mapModule.elements.Axis.prototype.name_ = 'axis';


/**
 * @type {anychart.core.ui.LabelsFactory}
 * @private
 */
anychart.mapModule.elements.Axis.prototype.labels_ = null;


/**
 * @type {anychart.mapModule.elements.AxisTicks}
 * @private
 */
anychart.mapModule.elements.Axis.prototype.ticks_ = null;


/**
 * @type {anychart.core.ui.LabelsFactory}
 * @private
 */
anychart.mapModule.elements.Axis.prototype.minorLabels_ = null;


/**
 * @type {anychart.mapModule.elements.AxisTicks}
 * @private
 */
anychart.mapModule.elements.Axis.prototype.minorTicks_ = null;


/**
 * @type {string|acgraph.vector.Stroke}
 * @private
 */
anychart.mapModule.elements.Axis.prototype.stroke_;


/**
 * @type {anychart.mapModule.scales.Geo}
 * @private
 */
anychart.mapModule.elements.Axis.prototype.scale_ = null;


/**
 * @type {anychart.core.utils.Bounds}
 * @private
 */
anychart.mapModule.elements.Axis.prototype.pixelBounds_ = null;


/**
 * @type {Array.<Array.<number>>}
 * @private
 */
anychart.mapModule.elements.Axis.prototype.labelsBounds_ = null;


/**
 * @type {Array.<Array.<number>>}
 * @private
 */
anychart.mapModule.elements.Axis.prototype.minorLabelsBounds_ = null;


//endregion
//region --- IObjectWithSettings overrides
/**
 * @override
 * @param {string} name
 * @return {*}
 */
anychart.mapModule.elements.Axis.prototype.getOption = anychart.core.settings.getOption;


//endregion
//region --- IResolvable implementation
/** @inheritDoc */
anychart.mapModule.elements.Axis.prototype.resolutionChainCache = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.resolutionChainCache_ = opt_value;
  }
  return this.resolutionChainCache_;
};


/** @inheritDoc */
anychart.mapModule.elements.Axis.prototype.getResolutionChain = anychart.core.settings.getResolutionChain;


/** @inheritDoc */
anychart.mapModule.elements.Axis.prototype.getLowPriorityResolutionChain = function() {
  var sett = [this.themeSettings];
  if (this.parent_) {
    sett = goog.array.concat(sett, this.parent_.getLowPriorityResolutionChain());
  }
  return sett;
};


/** @inheritDoc */
anychart.mapModule.elements.Axis.prototype.getHighPriorityResolutionChain = function() {
  var sett = [this.ownSettings];
  if (this.parent_) {
    sett = goog.array.concat(sett, this.parent_.getHighPriorityResolutionChain());
  }
  return sett;
};


//endregion
//region --- Parental relations
/**
 * Gets/sets new parent.
 * @param {anychart.mapModule.elements.AxisSettings=} opt_value - Value to set.
 * @return {anychart.mapModule.elements.AxisSettings|anychart.mapModule.elements.Axis} - Current value or itself for method chaining.
 */
anychart.mapModule.elements.Axis.prototype.parent = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.parent_ != opt_value) {
      if (this.parent_)
        this.parent_.unlistenSignals(this.parentInvalidated_, this);
      this.parent_ = opt_value;
      if (this.parent_)
        this.parent_.listenSignals(this.parentInvalidated_, this);
    }
    return this;
  }
  return this.parent_;
};


/**
 * Parent invalidation handler.
 * @param {anychart.SignalEvent} e - Signal event.
 * @private
 */
anychart.mapModule.elements.Axis.prototype.parentInvalidated_ = function(e) {
  var state = 0;
  var signal = 0;

  if (e.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state |= anychart.ConsistencyState.APPEARANCE;
    signal |= anychart.Signal.NEEDS_REDRAW;
  }

  if (e.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state |= this.ALL_VISUAL_STATES;
    signal |= anychart.Signal.BOUNDS_CHANGED;
  }

  if (e.hasSignal(anychart.Signal.ENABLED_STATE_CHANGED)) {
    state |= anychart.ConsistencyState.ENABLED;
    signal |= anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED;
  }

  this.resolutionChainCache_ = null;

  this.invalidate(state, signal);
};


//endregion
//region --- Optimized props descriptors
/**
 * Simple properties descriptors.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.mapModule.elements.Axis.SIMPLE_PROPS_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'stroke',
      anychart.core.settings.strokeNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'overlapMode',
      anychart.enums.normalizeLabelsOverlapMode);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'drawFirstLabel',
      anychart.core.settings.booleanNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'drawLastLabel',
      anychart.core.settings.booleanNormalizer);

  return map;
})();
anychart.core.settings.populate(anychart.mapModule.elements.Axis, anychart.mapModule.elements.Axis.SIMPLE_PROPS_DESCRIPTORS);


//endregion
//region --- Public complex settings
/**
 * Getter/setter for title.
 * @param {(null|boolean|Object|string)=} opt_value Axis title.
 * @return {!(anychart.core.ui.Title|anychart.mapModule.elements.Axis)} Axis title or itself for method chaining.
 */
anychart.mapModule.elements.Axis.prototype.title = function(opt_value) {
  if (!this.title_) {
    this.title_ = new anychart.core.ui.Title();
    this.title_.dropThemes();
    this.title_.padding().dropThemes();
    this.title_.margin().dropThemes();
    this.setupCreated('title', this.title_);
    this.title_.setParentEventTarget(this);
    this.title_.parent(/** @type {anychart.core.ui.Title} */(this.parent().title()));
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
anychart.mapModule.elements.Axis.prototype.titleInvalidated_ = function(event) {
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
 * @return {!(anychart.core.ui.LabelsFactory|anychart.mapModule.elements.Axis)} Axis labels of itself for method chaining.
 */
anychart.mapModule.elements.Axis.prototype.labels = function(opt_value) {
  if (!this.labels_) {
    this.labels_ = new anychart.core.ui.LabelsFactory();
    this.labels_.dropThemes();
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
anychart.mapModule.elements.Axis.prototype.labelsInvalidated_ = function(event) {
  var state = 0;
  var signal = 0;
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state = this.ALL_VISUAL_STATES;
    signal = anychart.Signal.BOUNDS_CHANGED | anychart.Signal.NEEDS_REDRAW;
  } else if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state = anychart.ConsistencyState.AXIS_LABELS | anychart.ConsistencyState.AXIS_TICKS;
    signal = anychart.Signal.NEEDS_REDRAW;
  }

  this.dropBoundsCache();
  this.invalidate(state, signal);
};


/**
 * Getter/setter for minorLabels.
 * @param {(Object|boolean|null)=} opt_value Axis labels.
 * @return {!(anychart.core.ui.LabelsFactory|anychart.mapModule.elements.Axis)} Axis labels of itself for method chaining.
 */
anychart.mapModule.elements.Axis.prototype.minorLabels = function(opt_value) {
  if (!this.minorLabels_) {
    this.minorLabels_ = new anychart.core.ui.LabelsFactory();
    this.minorLabels_.dropThemes();
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
anychart.mapModule.elements.Axis.prototype.minorLabelsInvalidated_ = function(event) {
  var state = 0;
  var signal = 0;
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state = this.ALL_VISUAL_STATES;
    signal = anychart.Signal.BOUNDS_CHANGED | anychart.Signal.NEEDS_REDRAW;
  } else if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state = anychart.ConsistencyState.AXIS_LABELS | anychart.ConsistencyState.AXIS_TICKS;
    signal = anychart.Signal.NEEDS_REDRAW;
  }
  this.dropBoundsCache();
  this.invalidate(state, signal);
};


/**
 * Create new ticks instance.
 * @return {!anychart.mapModule.elements.AxisTicks}
 * @protected
 */
anychart.mapModule.elements.Axis.prototype.createTicks = function() {
  var ticks = new anychart.mapModule.elements.AxisTicks();
  ticks.orientation(/** @type {anychart.enums.Orientation} */ (this.orientation_));
  ticks.setParentEventTarget(this);
  ticks.listenSignals(this.ticksInvalidated, this);
  return ticks;
};


/**
 * Getter/setter for ticks.
 * @param {(Object|boolean|null)=} opt_value Axis ticks.
 * @return {!(anychart.mapModule.elements.AxisTicks|anychart.mapModule.elements.Axis)} Axis ticks or itself for method chaining.
 */
anychart.mapModule.elements.Axis.prototype.ticks = function(opt_value) {
  if (!this.ticks_) {
    this.ticks_ = this.createTicks();
    this.ticks_.dropThemes();
    this.setupCreated('ticks', this.ticks_);
    this.ticks_.parent(/** @type {anychart.mapModule.elements.AxisTicks} */(this.parent().ticks()));
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
 * @return {!(anychart.mapModule.elements.AxisTicks|anychart.mapModule.elements.Axis)} Axis ticks or itself for method chaining.
 */
anychart.mapModule.elements.Axis.prototype.minorTicks = function(opt_value) {
  if (!this.minorTicks_) {
    this.minorTicks_ = this.createTicks();
    this.minorTicks_.dropThemes();
    this.setupCreated('minorTicks', this.minorTicks_);
    this.minorTicks_.parent(/** @type {anychart.mapModule.elements.AxisTicks} */(this.parent().minorTicks()));
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
anychart.mapModule.elements.Axis.prototype.ticksInvalidated = function(event) {
  var state = 0;
  var signal = 0;
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state = this.ALL_VISUAL_STATES;
    signal = anychart.Signal.BOUNDS_CHANGED | anychart.Signal.NEEDS_REDRAW;
  } else if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state = anychart.ConsistencyState.AXIS_LABELS | anychart.ConsistencyState.AXIS_TICKS;
    signal = anychart.Signal.NEEDS_REDRAW;
  }
  this.dropBoundsCache();
  this.invalidate(state, signal);
};


/**
 * Getter/setter for scale.
 * @param {anychart.mapModule.scales.Geo=} opt_value Scale.
 * @return {anychart.mapModule.scales.Geo|!anychart.mapModule.elements.Axis} Axis scale or itself for method chaining.
 */
anychart.mapModule.elements.Axis.prototype.scale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.internalScale != opt_value) {
      if (this.internalScale)
        this.internalScale.unlistenSignals(this.scaleInvalidated_, this);
      this.internalScale = opt_value;
      if (this.internalScale)
        this.internalScale.listenSignals(this.scaleInvalidated_, this);
      this.dropBoundsCache();
      this.labels().dropCallsCache();
      this.minorLabels().dropCallsCache();
      this.ticks().setScale(this.internalScale);
      this.minorTicks().setScale(this.internalScale);
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
anychart.mapModule.elements.Axis.prototype.scaleInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.dropBoundsCache();
    this.labels().dropCallsCache();
    this.minorLabels().dropCallsCache();
    this.invalidate(this.ALL_VISUAL_STATES, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
  }
};


//endregion
//region --- Support methods


/**
 * Getter/setter for orientation.
 * @param {(string|anychart.enums.Orientation)=} opt_value Axis orientation.
 * @return {anychart.enums.Orientation|!anychart.mapModule.elements.Axis} Axis orientation or itself for method chaining.
 */
anychart.mapModule.elements.Axis.prototype.orientation = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.orientation_ = opt_value;
    return this;
  } else {
    return this.orientation_;
  }
};


/**
 * Whether an axis is horizontal.
 * @return {boolean} If the axis is horizontal.
 */
anychart.mapModule.elements.Axis.prototype.isHorizontal = function() {
  return this.orientation_ == anychart.enums.Orientation.TOP ||
      this.orientation_ == anychart.enums.Orientation.BOTTOM;
};


//endregion
//region --- Interactivity
/**
 * Update grid on zoom or move.
 * @param {goog.math.AffineTransform} tx .
 */
anychart.mapModule.elements.Axis.prototype.updateOnZoomOrMove = function(tx) {
  if (this.rootLayer_) this.rootLayer_.setTransformationMatrix(tx.getScaleX(), tx.getShearX(), tx.getShearY(), tx.getScaleY(), tx.getTranslateX(), tx.getTranslateY());
};


//endregion
//region --- Labels calculation
/**
 * Returns an object with indexes of labels to draw.
 * @return {boolean|Object.<string, Array.<boolean>>} Object with indexes of labels to draw.
 * or Boolean when there are no labels.
 * @private
 */
anychart.mapModule.elements.Axis.prototype.getOverlappedLabels_ = function() {
  if (!this.overlappedLabels_ || this.hasInvalidationState(anychart.ConsistencyState.AXIS_OVERLAP)) {
    var overlapMode = this.getOption('overlapMode');
    if (overlapMode == anychart.enums.LabelsOverlapMode.ALLOW_OVERLAP) {
      return false;
    } else {
      var scale = /** @type {anychart.mapModule.scales.Geo} */(this.scale());
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

        var scaleTicks;
        if (this.isHorizontal()) {
          scaleTicks = this.scale().xTicks();
        } else {
          scaleTicks = this.scale().yTicks();
        }

        var scaleTicksArr = scaleTicks.get();
        var ticksArrLen = scaleTicksArr.length;
        var tickVal, ratio, bounds1, bounds2, bounds3, bounds4;
        var tempRatio;
        var k = -1;

        var parentLabels = this.parent().labels();
        var labelsEnabledState = this.labels().getOwnOption('enabled');
        var isLabels = labelsEnabledState == void 0 ? parentLabels.enabled() : labelsEnabledState;

        var scaleMinorTicks;
        if (this.isHorizontal()) {
          scaleMinorTicks = this.scale().xMinorTicks();
        } else {
          scaleMinorTicks = this.scale().yMinorTicks();
        }

        var drawFirstLabel = this.getOption('drawFirstLabel');
        var drawLastLabel = this.getOption('drawLastLabel');

        var scaleMinorTicksArr = scaleMinorTicks.get();
        i = 0;
        j = 0;
        var minorTicksArrLen = scaleMinorTicksArr.length;
        var minorTickVal, minorRatio;

        var parentMinorLabels = this.parent().minorLabels();
        var minorLabelsEnabledState = this.minorLabels().getOwnOption('enabled');
        var isMinorLabels = minorLabelsEnabledState == void 0 ? parentMinorLabels.enabled() : minorLabelsEnabledState;

        while (i < ticksArrLen || j < minorTicksArrLen) {
          tickVal = parseFloat(scaleTicksArr[i]);
          minorTickVal = parseFloat(scaleMinorTicksArr[j]);
          if (this.isHorizontal()) {
            ratio = scale.transformX(tickVal);
            minorRatio = scale.transformX(minorTickVal);
          } else {
            ratio = scale.transformY(tickVal);
            minorRatio = scale.transformY(minorTickVal);
          }
          bounds1 = bounds2 = bounds3 = bounds4 = null;

          if (nextDrawableLabel == -1 && isLabels) {
            k = i;
            while (nextDrawableLabel == -1 && k < ticksArrLen) {
              if ((!k && drawFirstLabel) || (k == ticksArrLen - 1 && drawLastLabel) || (k != 0 && k != ticksArrLen - 1))
                bounds1 = this.getLabelBounds_(k, true, scaleTicksArr);
              else
                bounds1 = null;

              if (prevDrawableLabel != -1)
                bounds2 = this.getLabelBounds_(prevDrawableLabel, true, scaleTicksArr);
              else
                bounds2 = null;

              if (k != ticksArrLen - 1 && drawLastLabel)
                bounds3 = this.getLabelBounds_(ticksArrLen - 1, true, scaleTicksArr);
              else
                bounds3 = null;

              if (bounds1 && !(anychart.math.checkRectIntersection(bounds1, bounds2) ||
                  anychart.math.checkRectIntersection(bounds1, bounds3))) {
                tempRatio = this.isHorizontal() ? scale.transformX(scaleTicksArr[k]) : scale.transformY(scaleTicksArr[k]);
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
              labels.push(true);
            } else {
              labels.push(false);
            }
            i++;
            if (ratio == minorRatio && (isLabels || this.ticks().enabled())) {
              minorLabels.push(false);
              j++;
            }
          } else {
            if (isMinorLabels) {
              bounds1 = this.getLabelBounds_(j, false, scaleMinorTicksArr);

              if (prevDrawableLabel != -1)
                bounds2 = this.getLabelBounds_(prevDrawableLabel, true, scaleTicksArr);

              if (nextDrawableLabel != -1)
                bounds3 = this.getLabelBounds_(nextDrawableLabel, true, scaleTicksArr);

              if (prevDrawableMinorLabel != -1)
                bounds4 = this.getLabelBounds_(prevDrawableMinorLabel, false, scaleMinorTicksArr);

              var label = this.minorLabels().getLabel(j);
              var isLabelEnabled = label ?
                  goog.isDef(label.enabled()) ?
                      label.enabled() :
                      true :
                  true;

              if (!(anychart.math.checkRectIntersection(bounds1, bounds2) ||
                  anychart.math.checkRectIntersection(bounds1, bounds3) ||
                  anychart.math.checkRectIntersection(bounds1, bounds4)) && isLabelEnabled) {

                tempRatio = this.isHorizontal() ? scale.transformX(scaleMinorTicksArr[j]) : tempRatio = scale.transformY(scaleMinorTicksArr[j]);
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
      }
      if (!isLabels) labels = false;
      this.overlappedLabels_ = {labels: labels, minorLabels: minorLabels};
    }
    this.markConsistent(anychart.ConsistencyState.AXIS_OVERLAP);
  }
  return this.overlappedLabels_;
};


/**
 * Gets format provider for label.
 * @param {number} index Label index.
 * @param {string|number} value Label value.
 * @return {Object} Labels format provider.
 * @protected
 */
anychart.mapModule.elements.Axis.prototype.getLabelsFormatProvider = function(index, value) {
  var labelText, sideOfTheWorld;
  value = parseFloat(value);

  var grad, minutes, seconds;
  var decimal = Math.abs(value) % 1;

  grad = Math.floor(Math.abs(value));
  minutes = Math.floor(60 * decimal);
  seconds = Math.floor(60 * ((60 * decimal) % 1));

  labelText = grad + '\u00B0';
  if (seconds || minutes) {
    if (minutes < 10)
      minutes = '0' + minutes;
    labelText += minutes + '\'';
  }

  if (this.isHorizontal()) {
    sideOfTheWorld = value > 0 ? 'E' : 'W';
  } else {
    sideOfTheWorld = value > 0 ? 'N' : 'S';
  }

  labelText += sideOfTheWorld;
  var scale = this.scale();

  var values = {
    'axis': {value: this, type: anychart.enums.TokenType.UNKNOWN},
    'scale': {value: scale, type: anychart.enums.TokenType.UNKNOWN},
    'index': {value: index, type: anychart.enums.TokenType.NUMBER},
    'value': {value: labelText, type: anychart.enums.TokenType.STRING},
    'tickValue': {value: value, type: anychart.enums.TokenType.NUMBER},
    'max': {value: goog.isDef(scale.max) ? scale.max : null, type: anychart.enums.TokenType.NUMBER},
    'min': {value: goog.isDef(scale.min) ? scale.min : null, type: anychart.enums.TokenType.NUMBER}
  };

  var tokenAliases = {};
  tokenAliases[anychart.enums.StringToken.AXIS_SCALE_MAX] = 'max';
  tokenAliases[anychart.enums.StringToken.AXIS_SCALE_MIN] = 'min';

  var tokenCustomValues = {};
  tokenCustomValues[anychart.enums.StringToken.AXIS_NAME] = {value: this.title().text(), type: anychart.enums.TokenType.STRING};

  var context = new anychart.format.Context(values);
  context
      .tokenAliases(tokenAliases)
      .tokenCustomValues(tokenCustomValues);

  return context.propagate();
};


/**
 * Returns anchor for label.
 * @param {boolean} isMajor .
 * @return {anychart.enums.Anchor}
 * @private
 */
anychart.mapModule.elements.Axis.prototype.getLabelAnchor_ = function(isMajor) {
  var labels = isMajor ? this.labels() : this.minorLabels();
  var position = labels.getOption('position');

  if (position == 'center') {
    anchor = anychart.enums.Anchor.CENTER;
  } else {
    var isPositionInside = position == 'inside';
    var anchor;
    switch (this.orientation_) {
      case anychart.enums.Orientation.TOP:
        anchor = anychart.enums.Anchor.CENTER_BOTTOM;
        break;
      case anychart.enums.Orientation.RIGHT:
        anchor = anychart.enums.Anchor.LEFT_CENTER;
        break;
      case anychart.enums.Orientation.BOTTOM:
        anchor = anychart.enums.Anchor.CENTER_TOP;
        break;
      case anychart.enums.Orientation.LEFT:
        anchor = isPositionInside ? anychart.enums.Anchor.LEFT_CENTER : anychart.enums.Anchor.RIGHT_CENTER;
        break;
    }
  }

  return /** @type {anychart.enums.Anchor} */(anchor);
};


/**
 * Returns rotation angle for label.
 * @param {number} tickAngle .
 * @param {boolean} isMajor .
 * @return {number}
 * @private
 */
anychart.mapModule.elements.Axis.prototype.getLabelRotation_ = function(tickAngle, isMajor) {
  var angle;
  switch (this.orientation_) {
    case anychart.enums.Orientation.TOP:
      angle = goog.math.toDegrees(tickAngle) + 90;
      break;
    case anychart.enums.Orientation.RIGHT:
      angle = goog.math.toDegrees(tickAngle);
      break;
    case anychart.enums.Orientation.BOTTOM:
      angle = goog.math.toDegrees(tickAngle) - 90;
      break;
    case anychart.enums.Orientation.LEFT:
      angle = goog.math.toDegrees(tickAngle) - 180;
      break;
  }

  var ticks = isMajor ? this.ticks() : this.minorTicks();
  var tickPosition = ticks.getOption('position');

  if (tickPosition == anychart.enums.SidePosition.INSIDE || tickPosition == anychart.enums.SidePosition.CENTER) {
    angle += 180;
  }

  return /** @type {number} */(angle);
};


/**
 * Calculate label bounds.
 * @param {number} index Label index.
 * @param {boolean} isMajor Major labels or minor.
 * @param {Array} ticksArray Array with ticks.
 * @return {Array.<number>} Label bounds.
 * @private
 */
anychart.mapModule.elements.Axis.prototype.getLabelBounds_ = function(index, isMajor, ticksArray) {
  var boundsCache = isMajor ? this.labelsBounds_ : this.minorLabelsBounds_;
  if (goog.isDef(boundsCache[index]))
    return boundsCache[index];

  var ticks = isMajor ? this.ticks() : this.minorTicks();
  var labels = isMajor ? this.labels() : this.minorLabels();
  var parentLabels = isMajor ? this.parent().labels() : this.parent().minorLabels();

  var x, y;

  var value = parseFloat(ticksArray[index]);
  var coords = ticks.calcTick(value);

  var labelsPosition = /** @type {anychart.enums.SidePosition} */(labels.getOption('position') || parentLabels.getOption('position'));
  var labelsSidePosition = anychart.utils.sidePositionToNumber(labelsPosition);
  var ticksPosition = /** @type {anychart.enums.SidePosition} */(ticks.getOption('position'));
  var ticksSidePosition = anychart.utils.sidePositionToNumber(ticksPosition);

  if (ticks.enabled()) {
    if (ticksSidePosition * labelsSidePosition > 0) {
      x = coords[2];
      y = coords[3];
    } else if (ticksSidePosition * labelsSidePosition < 0 || ticksSidePosition) {
      x = coords[0];
      y = coords[1];
    } else {
      x = coords[0] + (coords[2] - coords[0]) / 2;
      y = coords[1] + (coords[3] - coords[1]) / 2;
    }
  } else {
    x = coords[0];
    y = coords[1];
  }

  var formatProvider = this.getLabelsFormatProvider(index, value);
  var positionProvider = {'value': {'x': x, 'y': y}};

  var parentSettings = parentLabels.getChangedSettings();
  var settings = labels.getChangedSettings();

  var autoRotation = this.getLabelRotation_(coords[4], isMajor);
  var autoAnchor = this.getLabelAnchor_(isMajor);

  goog.object.extend(parentSettings, settings);

  if (!goog.isDef(parentSettings['rotation']))
    parentSettings['rotation'] = autoRotation;
  if (!goog.isDef(parentSettings['anchor']))
    parentSettings['anchor'] = autoAnchor;

  var labelBounds = parentLabels.measureWithTransform(formatProvider, positionProvider, parentSettings, index);

  //todo (blackart) don't remove - debug purpose.
  // if (!this['labelPath' + isMajor + index]) this['labelPath' + isMajor + index] = stage.path().zIndex(1000);
  // this['labelPath' + isMajor + index].clear().moveTo(labelBounds[0], labelBounds[1]).lineTo.apply(this['labelPath' + isMajor + index], labelBounds);
  // this['labelPath' + isMajor + index].close();

  return boundsCache[index] = labelBounds;
};


//endregion
//region --- Bounds
/**
 * Returns bounds affected for axis.
 * @param {anychart.math.Rect=} opt_bounds Bounds for calculation.
 * @return {!anychart.math.Rect}
 */
anychart.mapModule.elements.Axis.prototype.getAffectingBounds = function(opt_bounds) {
  if (!this.pixelBounds || this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    var i, len;

    var parentBounds = /** @type {anychart.math.Rect} */(this.parentBounds());

    var scale = /** @type {anychart.mapModule.scales.Geo} */(this.scale());
    if (goog.isDef(opt_bounds)) {
      scale.setBounds(opt_bounds);
    }
    scale.calculate();

    var scaleTicks, scaleMinorTicks;
    if (this.isHorizontal()) {
      scaleTicks = this.scale().xTicks();
      scaleMinorTicks = this.scale().xMinorTicks();
    } else {
      scaleTicks = this.scale().yTicks();
      scaleMinorTicks = this.scale().yMinorTicks();
    }

    var ticksArr = scaleTicks.get();
    var minorTicksArr = scaleMinorTicks.get();

    var title = this.title();
    var labels = this.labels();
    var parentLabels = this.parent().labels();
    var labelsEnabledState = labels.getOwnOption('enabled');
    var labelsEnabled = labelsEnabledState == void 0 ? parentLabels.enabled() : labelsEnabledState;

    var minorLabels = this.minorLabels();
    var parentMinorLabels = this.parent().minorLabels();
    var minorLabelsEnabledState = minorLabels.getOwnOption('enabled');
    var minorLabelsEnabled = minorLabelsEnabledState == void 0 ? parentMinorLabels.enabled() : minorLabelsEnabledState;

    var axisTicks = this.ticks();
    axisTicks.setScale(scale);
    var axisMinorTicks = this.minorTicks();
    axisMinorTicks.setScale(scale);

    var ticksPosition = /** @type {anychart.enums.SidePosition} */(axisTicks.getOption('position'));
    var ticksSidePosition = anychart.utils.sidePositionToNumber(ticksPosition);
    var minorTicksPosition = /** @type {anychart.enums.SidePosition} */(axisMinorTicks.getOption('position'));
    var minorTicksSidePosition = anychart.utils.sidePositionToNumber(minorTicksPosition);

    var resultBounds;
    var labelBounds, tickBounds, titleBounds;

    this.dropBoundsCache();

    if (labelsEnabled) {
      labels.dropCallsCache();
      for (i = 0, len = ticksArr.length; i < len; i++) {
        labelBounds = goog.math.Rect.fromCoordinateBox(this.getLabelBounds_(i, true, ticksArr));
        if (!resultBounds) {
          resultBounds = labelBounds;
        } else {
          resultBounds.boundingRect(labelBounds);
        }
      }
    } else if (axisTicks.enabled() && ticksSidePosition >= 0) {
      for (i = 0, len = ticksArr.length; i < len; i++) {
        tickBounds = axisTicks.getTickBounds(parseFloat(ticksArr[i]));
        if (!resultBounds) {
          resultBounds = tickBounds;
        } else {
          resultBounds.boundingRect(tickBounds);
        }
      }
    }

    if (minorLabelsEnabled) {
      minorLabels.dropCallsCache();
      for (i = 0, len = minorTicksArr.length; i < len; i++) {
        labelBounds = goog.math.Rect.fromCoordinateBox(this.getLabelBounds_(i, false, minorTicksArr));
        if (!resultBounds) {
          resultBounds = labelBounds;
        } else {
          resultBounds.boundingRect(labelBounds);
        }
      }
    } else if (axisMinorTicks.enabled() && minorTicksSidePosition >= 0) {
      for (i = 0, len = minorTicksArr.length; i < len; i++) {
        tickBounds = axisMinorTicks.getTickBounds(minorTicksArr[i]);
        if (!resultBounds) {
          resultBounds = tickBounds;
        } else {
          resultBounds.boundingRect(tickBounds);
        }
      }
    }

    if (title.enabled()) {
      if (!title.container()) title.container(/** @type {acgraph.vector.ILayer} */(this.container()));
      title.suspendSignalsDispatching();
      title.defaultOrientation(this.orientation_);
      title.parentBounds(parentBounds);
      titleBounds = title.getContentBounds();

      switch (this.orientation_) {
        case anychart.enums.Orientation.TOP:
          resultBounds.top -= titleBounds.height;
          resultBounds.height += titleBounds.height;
          break;
        case anychart.enums.Orientation.RIGHT:
          resultBounds.width += titleBounds.width;
          break;
        case anychart.enums.Orientation.BOTTOM:
          resultBounds.height += titleBounds.height;
          break;
        case anychart.enums.Orientation.LEFT:
          resultBounds.left -= titleBounds.width;
          resultBounds.width += titleBounds.width;
          break;
      }
      title.resumeSignalsDispatching(false);
    }

    if (!resultBounds) {
      resultBounds = new anychart.math.Rect(0, 0, 0, 0);
    }

    this.pixelBounds = resultBounds;

    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  return this.pixelBounds.clone();
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
 * @return {!anychart.math.Rect} Parent bounds without the space used by the title.
 */
anychart.mapModule.elements.Axis.prototype.getRemainingBounds = function() {
  var parentBounds = /** @type {anychart.math.Rect} */(this.parentBounds());

  if (parentBounds) {
    var remainingBounds;
    if (this.scale() && this.getOption('enabled')) {
      remainingBounds = this.getAffectingBounds(parentBounds);
    } else {
      remainingBounds = parentBounds.clone();
    }

    return remainingBounds;
  } else
    return new anychart.math.Rect(0, 0, 0, 0);
};


/** @inheritDoc */
anychart.mapModule.elements.Axis.prototype.invalidateParentBounds = function() {
  this.dropBoundsCache();
  this.invalidate(this.ALL_VISUAL_STATES, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
};


/**
 * Drop bounds cache.
 */
anychart.mapModule.elements.Axis.prototype.dropBoundsCache = function() {
  this.labelsBounds_.length = 0;
  this.minorLabelsBounds_.length = 0;
  this.overlappedLabels_ = null;
};


/**
 * Create line.
 * @return {acgraph.vector.Path}
 * @protected
 */
anychart.mapModule.elements.Axis.prototype.getLine = function() {
  return this.line ? this.line : /** @type {acgraph.vector.Path} */(this.line = /** @type {acgraph.vector.Path} */(acgraph.path().disablePointerEvents(true).disableStrokeScaling(true)));
};


//endregion
//region --- Drawing
/**
 * Axis labels drawer.
 * @param {number} value Tick value.
 * @param {boolean} isMajor Is major label.
 * @param {number} index Scale label index.
 * @private
 */
anychart.mapModule.elements.Axis.prototype.drawLabel_ = function(value, isMajor, index) {
  var ticks = isMajor ? this.ticks() : this.minorTicks();
  var labels = isMajor ? this.labels() : this.minorLabels();
  var parentLabels = isMajor ? this.parent().labels() : this.parent().minorLabels();

  var coords = ticks.calcTick(value);

  var labelsPosition = /** @type {anychart.enums.SidePosition} */(labels.getOption('position') || parentLabels.getOption('position'));
  var labelsSidePosition = anychart.utils.sidePositionToNumber(labelsPosition);
  var ticksPosition = /** @type {anychart.enums.SidePosition} */(ticks.getOption('position'));
  var ticksSidePosition = anychart.utils.sidePositionToNumber(ticksPosition);

  var x, y;
  if (ticks.enabled()) {
    if (!ticksSidePosition && !labelsSidePosition) {
      x = coords[0] + (coords[2] - coords[0]) / 2;
      y = coords[1] + (coords[3] - coords[1]) / 2;
    } else if (ticksSidePosition * labelsSidePosition > 0 || (!ticksSidePosition && labelsSidePosition < 0)) {
      x = coords[2];
      y = coords[3];
    } else if (ticksSidePosition * labelsSidePosition < 0 || !labelsSidePosition || (!ticksSidePosition && labelsSidePosition > 0)) {
      x = coords[0];
      y = coords[1];
    }
  } else {
    x = coords[0];
    y = coords[1];
  }

  var formatProvider = this.getLabelsFormatProvider(index, value);
  var positionProvider = {'value': {x: x, y: y}};

  var label = labels.add(formatProvider, positionProvider, index);
  label.autoRotation(this.getLabelRotation_(coords[4], isMajor));
  label.autoAnchor(this.getLabelAnchor_(isMajor));

  var labelChangedSettings = labels.getChangedSettings();
  if (goog.isDef(labelChangedSettings['enabled']) && labelChangedSettings['enabled'] == null)
    delete labelChangedSettings['enabled'];

  label.stateOrder([label, labelChangedSettings, 'auto', parentLabels, labels.themeSettings, parentLabels.themeSettings]);


};


/**
 * Axis line drawer for top orientation.
 * @protected
 */
anychart.mapModule.elements.Axis.prototype.drawTopLine = function() {
  var scale = this.scale();
  var xy, x, y;
  var precision = scale.precision()[0];

  var minimumX = /** @type {number} */(scale.minimumX());
  var maximumX = /** @type {number} */(scale.maximumX());
  var maximumY = /** @type {number} */(scale.maximumY());

  var currLong = minimumX;
  if (isNaN(currLong)) return;

  if (anychart.mapModule.projections.isBaseProjection(scale.tx['default'].crs)) {
    xy = scale.transform(minimumX, maximumY, null);
    this.line.moveTo(xy[0], xy[1]);
    xy = scale.transform(maximumX, maximumY, null);
    this.line.lineTo(xy[0], xy[1]);
  } else {
    while (currLong < maximumX) {
      xy = scale.transform(currLong, maximumY, null);
      x = xy[0];
      y = xy[1];

      if (currLong == minimumX) {
        this.line.moveTo(x, y);
      } else {
        this.line.lineTo(x, y);
      }
      currLong += precision;
    }
    xy = scale.transform(maximumX, maximumY, null);
    x = Math.round(xy[0]);
    y = Math.round(xy[1]);

    this.line.lineTo(x, y);
  }
};


/**
 * Axis line drawer for right orientation.
 * @protected
 */
anychart.mapModule.elements.Axis.prototype.drawRightLine = function() {
  var scale = this.scale();
  var xy, x, y;
  var precision = scale.precision()[1];

  var maximumX = /** @type {number} */(scale.maximumX());
  var minimumY = /** @type {number} */(scale.minimumY());
  var maximumY = /** @type {number} */(scale.maximumY());

  var currLat = minimumY;
  if (isNaN(currLat)) return;

  if (anychart.mapModule.projections.isBaseProjection(scale.tx['default'].crs)) {
    xy = scale.transform(maximumX, minimumY, null);
    this.line.moveTo(xy[0], xy[1]);
    xy = scale.transform(maximumX, maximumY, null);
    this.line.lineTo(xy[0], xy[1]);
  } else {
    while (currLat < maximumY) {
      xy = scale.transform(maximumX, currLat, null);
      x = xy[0];
      y = xy[1];

      if (currLat == minimumY) {
        this.line.moveTo(x, y);
      } else {
        this.line.lineTo(x, y);
      }
      currLat += precision;
    }
    xy = scale.transform(maximumX, maximumY, null);
    x = Math.round(xy[0]);
    y = Math.round(xy[1]);

    this.line.lineTo(x, y);
  }
};


/**
 * Axis line drawer for bottom orientation.
 * @protected
 */
anychart.mapModule.elements.Axis.prototype.drawBottomLine = function() {
  var scale = this.scale();
  var xy, x, y;
  var precision = scale.precision()[0];

  var minimumX = /** @type {number} */(scale.minimumX());
  var maximumX = /** @type {number} */(scale.maximumX());
  var minimumY = /** @type {number} */(scale.minimumY());

  var currLong = minimumX;
  if (isNaN(currLong)) return;

  if (anychart.mapModule.projections.isBaseProjection(scale.tx['default'].crs)) {
    xy = scale.transform(minimumX, minimumY, null);
    this.line.moveTo(xy[0], xy[1]);
    xy = scale.transform(maximumX, minimumY, null);
    this.line.lineTo(xy[0], xy[1]);
  } else {
    while (currLong < maximumX) {
      xy = scale.transform(currLong, minimumY, null);
      x = xy[0];
      y = xy[1];

      if (currLong == minimumX) {
        this.line.moveTo(x, y);
      } else {
        this.line.lineTo(x, y);
      }
      currLong += precision;
    }
    xy = scale.transform(maximumX, minimumY, null);
    x = Math.round(xy[0]);
    y = Math.round(xy[1]);

    this.line.lineTo(x, y);
  }
};


/**
 * Axis line drawer for left orientation.
 * @protected
 */
anychart.mapModule.elements.Axis.prototype.drawLeftLine = function() {
  var scale = this.scale();
  var xy, x, y;
  var precision = scale.precision()[1];

  var minimumX = /** @type {number} */(scale.minimumX());
  var minimumY = /** @type {number} */(scale.minimumY());
  var maximumY = /** @type {number} */(scale.maximumY());

  var currLat = minimumY;
  if (isNaN(currLat)) return;

  if (anychart.mapModule.projections.isBaseProjection(scale.tx['default'].crs)) {
    xy = scale.transform(minimumX, minimumY, null);
    this.line.moveTo(xy[0], xy[1]);
    xy = scale.transform(minimumX, maximumY, null);
    this.line.lineTo(xy[0], xy[1]);
  } else {
    while (currLat < maximumY) {
      xy = scale.transform(minimumX, currLat, null);
      x = xy[0];
      y = xy[1];

      if (currLat == minimumY) {
        this.line.moveTo(x, y);
      } else {
        this.line.lineTo(x, y);
      }
      currLat += precision;
    }
    xy = scale.transform(minimumX, maximumY, null);
    x = Math.round(xy[0]);
    y = Math.round(xy[1]);

    this.line.lineTo(x, y);
  }
};


/**
 * Draws axis line.
 * @protected
 */
anychart.mapModule.elements.Axis.prototype.drawLine = function() {
  this.getLine().clear();

  var orientation = /** @type {anychart.enums.Orientation} */(this.orientation_);

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

  lineDrawer.call(this);
  this.line.stroke(/** @type {acgraph.vector.Stroke} */(this.getOption('stroke')));
};


/** @inheritDoc */
anychart.mapModule.elements.Axis.prototype.remove = function() {
  if (this.rootLayer_) this.rootLayer_.parent(null);
};


/** @inheritDoc */
anychart.mapModule.elements.Axis.prototype.checkDrawingNeeded = function() {
  if (this.isConsistent())
    return false;

  if (!this.getOption('enabled')) {
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
          this.ALL_VISUAL_STATES
      );
    }
    return false;
  }
  this.markConsistent(anychart.ConsistencyState.ENABLED);
  return true;
};


/**
 * Axis drawing.
 * @return {anychart.mapModule.elements.Axis} An instance of {@link anychart.mapModule.elements.Axis} class for method chaining.
 */
anychart.mapModule.elements.Axis.prototype.draw = function() {
  var scale = /** @type {anychart.mapModule.scales.Geo} */(this.scale());

  if (!scale) {
    anychart.core.reporting.error(anychart.enums.ErrorCode.SCALE_NOT_SET);
    return this;
  }

  scale.calculate();

  if (!this.checkDrawingNeeded())
    return this;

  if (!this.rootLayer_) {
    this.rootLayer_ = acgraph.layer();

    this.title().container(this.rootLayer_);
    this.getLine().parent(this.rootLayer_);
    this.ticks().container(this.rootLayer_);
    this.minorTicks().container(this.rootLayer_);
    this.labels().container(this.rootLayer_);
    this.minorLabels().container(this.rootLayer_);
  }

  var ticksDrawer, minorTicksDrawer;
  var minorTicks, ticks, minorLabels, labels, minorLabelsEnabled, labelsEnabled;
  var orientation = /** @type {anychart.enums.Orientation} */(this.orientation_);

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
    this.rootLayer_.zIndex(zIndex);
    this.getLine().zIndex(1);
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    var container = /** @type {acgraph.vector.ILayer} */(this.container());
    this.rootLayer_.parent(container);
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.AXIS_TITLE)) {
    var title = this.title();
    if (title.getOption('enabled'))
      title.parentBounds(this.getAffectingBounds());
    title.defaultOrientation(orientation);
    title.draw();
    this.markConsistent(anychart.ConsistencyState.AXIS_TITLE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.AXIS_TICKS)) {
    ticks = this.ticks();
    ticks.draw();
    if (ticks.enabled())
      ticksDrawer = ticks.drawTick;

    minorTicks = this.minorTicks();
    minorTicks.draw();
    if (minorTicks.enabled())
      minorTicksDrawer = ticks.drawTick;

    this.markConsistent(anychart.ConsistencyState.AXIS_TICKS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.AXIS_LABELS)) {
    labels = this.labels();
    if (!labels.container()) labels.container(/** @type {acgraph.vector.ILayer} */(this.container()));
    labels.parentBounds(/** @type {anychart.math.Rect} */(this.parentBounds()));
    labels.clear();
    var labelsEnabledState = this.labels().getOwnOption('enabled');
    labelsEnabled = labelsEnabledState == void 0 ? this.parent().labels().enabled() : labelsEnabledState;

    minorLabels = this.minorLabels();
    if (!minorLabels.container()) minorLabels.container(/** @type {acgraph.vector.ILayer} */(this.container()));
    minorLabels.parentBounds(/** @type {anychart.math.Rect} */(this.parentBounds()));
    minorLabels.clear();
    var minorLabelsEnabledState = this.minorLabels().getOwnOption('enabled');
    minorLabelsEnabled = minorLabelsEnabledState == void 0 ? this.parent().minorLabels().enabled() : minorLabelsEnabledState;

    this.markConsistent(anychart.ConsistencyState.AXIS_LABELS);
  }

  if (goog.isDef(ticksDrawer) || goog.isDef(minorTicksDrawer) || labelsEnabled || minorLabelsEnabled) {
    var i, j, overlappedLabels, needDrawLabels, needDrawMinorLabels;

    var scaleTicks;
    if (this.isHorizontal()) {
      scaleTicks = this.scale().xTicks();
    } else {
      scaleTicks = this.scale().yTicks();
    }

    var scaleTicksArr = scaleTicks.get();
    var ticksArrLen = scaleTicksArr.length;

    var tickVal, ratio, drawLabel, drawTick, drawMinorTick, drawMinorLabel;

    overlappedLabels = this.getOverlappedLabels_();

    if (goog.isObject(overlappedLabels)) {
      needDrawLabels = overlappedLabels.labels;
      needDrawMinorLabels = overlappedLabels.minorLabels;
    } else {
      needDrawLabels = !overlappedLabels;
      needDrawMinorLabels = !overlappedLabels;
    }

    var scaleMinorTicks;
    if (this.isHorizontal()) {
      scaleMinorTicks = this.scale().xMinorTicks();
    } else {
      scaleMinorTicks = this.scale().yMinorTicks();
    }

    var scaleMinorTicksArr = scaleMinorTicks.get();

    i = 0;
    j = 0;
    var minorTicksArrLen = scaleMinorTicksArr.length;
    var minorTickVal, minorRatio, prevMajorRatio;

    while (i < ticksArrLen || j < minorTicksArrLen) {
      tickVal = parseFloat(scaleTicksArr[i]);
      minorTickVal = parseFloat(scaleMinorTicksArr[j]);

      if (this.isHorizontal()) {
        ratio = scale.transformX(tickVal);
        minorRatio = scale.transformX(minorTickVal);
      } else {
        ratio = scale.transformY(tickVal);
        minorRatio = scale.transformY(minorTickVal);
      }

      if (((ratio <= minorRatio && i < ticksArrLen) || j == minorTicksArrLen)) {
        drawLabel = goog.isArray(needDrawLabels) ? needDrawLabels[i] : needDrawLabels;
        if (goog.isBoolean(needDrawLabels)) {
          if (!i) drawLabel = drawLabel && this.getOption('drawFirstLabel');
          if (i == ticksArrLen - 1) drawLabel = drawLabel && this.getOption('drawLastLabel');
        }
        drawTick = (goog.isArray(needDrawLabels) && needDrawLabels[i]) || goog.isBoolean(needDrawLabels);

        if (drawTick && ticksDrawer)
          ticksDrawer.call(/** @type {anychart.mapModule.elements.AxisTicks} */(ticks), tickVal);

        if (drawLabel)
          this.drawLabel_(tickVal, true, i);
        prevMajorRatio = ratio;
        i++;
      } else {
        if (!((ticksDrawer || labelsEnabled) && prevMajorRatio == minorRatio)) {
          drawMinorLabel = goog.isArray(needDrawMinorLabels) ? needDrawMinorLabels[j] : needDrawMinorLabels;
          drawMinorTick = (goog.isArray(needDrawMinorLabels) && needDrawMinorLabels[j]) || goog.isBoolean(needDrawMinorLabels);

          if (drawMinorTick && minorTicksDrawer)
            minorTicksDrawer.call(/** @type {anychart.mapModule.elements.AxisTicks} */(minorTicks), minorTickVal);

          if (drawMinorLabel)
            this.drawLabel_(minorTickVal, false, j);
        }
        j++;
      }
    }

    if (needDrawMinorLabels) {
      this.parent().minorLabels().dropCallsCache();
      this.minorLabels().dropCallsCache();
      this.minorLabels().draw();
    }
    this.parent().labels().dropCallsCache();
    this.labels().dropCallsCache();
    this.labels().draw();
  }

  this.title().resumeSignalsDispatching(false);
  this.labels().resumeSignalsDispatching(false);
  this.minorLabels().resumeSignalsDispatching(false);
  this.ticks().resumeSignalsDispatching(false);
  this.minorTicks().resumeSignalsDispatching(false);

  this.markConsistent(anychart.ConsistencyState.BOUNDS);

  return this;
};


//endregion
//region --- Setup and Dispose
/** @inheritDoc */
anychart.mapModule.elements.Axis.prototype.setupByJSON = function(config, opt_default) {
  anychart.mapModule.elements.Axis.base(this, 'setupByJSON', config, opt_default);
  anychart.core.settings.deserialize(this, anychart.mapModule.elements.Axis.SIMPLE_PROPS_DESCRIPTORS, config, opt_default);

  this.title().setupInternal(!!opt_default, config['title']);

  this.labels().setupInternal(!!opt_default, config['labels']);
  this.minorLabels().setupInternal(!!opt_default, config['minorLabels']);

  this.ticks().setupInternal(!!opt_default, config['ticks']);
  this.minorTicks().setupInternal(!!opt_default, config['minorTicks']);
};


/** @inheritDoc */
anychart.mapModule.elements.Axis.prototype.serialize = function() {
  var json = anychart.mapModule.elements.Axis.base(this, 'serialize');

  var titleConfig = this.title().serialize();
  if (!goog.object.isEmpty(titleConfig))
    json['title'] = titleConfig;

  var ticksConfig = this.ticks().serialize();
  if (!goog.object.isEmpty(ticksConfig))
    json['ticks'] = ticksConfig;

  var minorTicksConfig = this.minorTicks().serialize();
  if (!goog.object.isEmpty(minorTicksConfig))
    json['minorTicks'] = minorTicksConfig;

  var labelsConfig = this.labels().getChangedSettings();
  if (!goog.object.isEmpty(labelsConfig))
    json['labels'] = labelsConfig;

  var minorLabelsConfig = this.minorLabels().getChangedSettings();
  if (!goog.object.isEmpty(minorLabelsConfig))
    json['minorLabels'] = minorLabelsConfig;

  anychart.core.settings.serialize(this, anychart.mapModule.elements.Axis.SIMPLE_PROPS_DESCRIPTORS, json, 'Map ' + this.orientation_ + ' axis props');

  return json;
};


/** @inheritDoc */
anychart.mapModule.elements.Axis.prototype.disposeInternal = function() {
  goog.disposeAll(
      this.title_,
      this.labels_,
      this.minorLabels_,
      this.ticks_,
      this.minorTicks_);
  this.title_ = null;
  this.labels_ = null;
  this.minorLabels_ = null;
  this.ticks_ = null;
  this.minorTicks_ = null;
  anychart.mapModule.elements.Axis.base(this, 'disposeInternal');
};


//endregion
//region --- Exports

//exports
(function() {
  var proto = anychart.mapModule.elements.Axis.prototype;
  proto['title'] = proto.title;
  proto['labels'] = proto.labels;
  proto['minorLabels'] = proto.minorLabels;
  proto['ticks'] = proto.ticks;
  proto['minorTicks'] = proto.minorTicks;
  // proto['stroke'] = proto.stroke;
  // proto['drawFirstLabel'] = proto.drawFirstLabel;
  // proto['drawLastLabel'] = proto.drawLastLabel;
  // proto['overlapMode'] = proto.overlapMode;
})();
//endregion
