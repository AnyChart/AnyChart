//region --- Provide and Require
goog.provide('anychart.stockModule.Axis');
goog.require('acgraph');
goog.require('anychart.core.AxisTicks');
goog.require('anychart.core.IAxis');
goog.require('anychart.core.IGroupingProvider');
goog.require('anychart.core.VisualBase');
goog.require('anychart.core.ui.Background');
goog.require('anychart.core.ui.LabelsFactory');
goog.require('anychart.format.Context');
goog.require('anychart.math.Rect');
//endregion



/**
 * Stock date time axis class.
 * @param {anychart.core.IGroupingProvider} groupingProvider
 * @param {boolean=} opt_disableInteractivity
 * @constructor
 * @implements {anychart.core.IAxis}
 * @extends {anychart.core.VisualBase}
 */
anychart.stockModule.Axis = function(groupingProvider, opt_disableInteractivity) {
  anychart.stockModule.Axis.base(this, 'constructor');

  this.addThemes(anychart.themes.DefaultThemes['axis']);

  /**
   * Grouping provider
   * @type {anychart.core.IGroupingProvider}
   * @private
   */
  this.groupingProvider_ = groupingProvider;

  /**
   * Axis labels.
   * @type {anychart.core.ui.LabelsFactory}
   * @private
   */
  this.labels_ = null;

  /**
   * Axis minor labels.
   * @type {anychart.core.ui.LabelsFactory}
   * @private
   */
  this.minorLabels_ = null;

  /**
   * Background settings.
   * @type {anychart.core.ui.Background}
   * @private
   */
  this.background_ = null;


  /**
   * Root axis layer.
   * @type {acgraph.vector.Layer}
   * @private
   */
  this.rootLayer_ = null;

  /**
   * If the axis should be interactive.
   * @type {boolean}
   * @private
   */
  this.interactive_ = !opt_disableInteractivity;

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['height', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['showHelperLabel', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['overlapMode', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW]
  ]);
};
goog.inherits(anychart.stockModule.Axis, anychart.core.VisualBase);


/**
 * Simple properties descriptors.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.stockModule.Axis.prototype.SIMPLE_PROPS_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'height', anychart.core.settings.numberNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'showHelperLabel', anychart.core.settings.booleanNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'overlapMode', anychart.enums.normalizeStockLabelsOverlapMode]
  ]);

  return map;
})();
anychart.core.settings.populate(anychart.stockModule.Axis, anychart.stockModule.Axis.prototype.SIMPLE_PROPS_DESCRIPTORS);

//region --- States and Signals
/**
 * Supported consistency states.
 * @type {number}
 */
anychart.stockModule.Axis.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.STOCK_DTAXIS_BACKGROUND;


/**
 * Supported signals.
 * @type {number}
 */
anychart.stockModule.Axis.prototype.SUPPORTED_SIGNALS = anychart.core.VisualBase.prototype.SUPPORTED_SIGNALS;


//endregion
//region --- API
/**
 * Axis background settings.
 * @param {(Object|boolean|null)=} opt_value
 * @return {!(anychart.core.ui.Background|anychart.stockModule.Axis)}
 */
anychart.stockModule.Axis.prototype.background = function(opt_value) {
  if (!this.background_) {
    this.background_ = new anychart.core.ui.Background();
    this.setupCreated('background', this.background_);
    this.background_.listenSignals(this.backgroundInvalidated_, this);
  }
  if (goog.isDef(opt_value)) {
    this.background_.setup(opt_value);
    return this;
  }
  return this.background_;
};


/**
 * Background invalidation handler.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.stockModule.Axis.prototype.backgroundInvalidated_ = function(e) {
  if (e.hasSignal(anychart.Signal.NEEDS_REDRAW))
    this.invalidate(anychart.ConsistencyState.STOCK_DTAXIS_BACKGROUND, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Labels settings.
 * @param {(Object|boolean|null)=} opt_value Axis labels.
 * @return {!(anychart.core.ui.LabelsFactory|anychart.stockModule.Axis)} Axis labels of itself for method chaining.
 */
anychart.stockModule.Axis.prototype.labels = function(opt_value) {
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
 * Minor labels settings.
 * @param {(Object|boolean|null)=} opt_value Axis labels.
 * @return {!(anychart.core.ui.LabelsFactory|anychart.stockModule.Axis)} Axis labels of itself for method chaining.
 */
anychart.stockModule.Axis.prototype.minorLabels = function(opt_value) {
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
 * Labels invalidation handler.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.stockModule.Axis.prototype.labelsInvalidated_ = function(e) {
  var state = 0;
  var signal = 0;
  if (e.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state = anychart.ConsistencyState.APPEARANCE;
    signal = anychart.Signal.NEEDS_REDRAW;
  }
  if (e.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state |= anychart.ConsistencyState.BOUNDS;
    signal |= anychart.Signal.BOUNDS_CHANGED;
  }
  this.invalidate(state, signal);
};


/**
 * @param {(Object|boolean|null)=} opt_value Axis ticks.
 * @return {!(anychart.core.AxisTicks|anychart.stockModule.Axis)} Axis ticks or itself for method chaining.
 */
anychart.stockModule.Axis.prototype.ticks = function(opt_value) {
  if (!this.ticks_) {
    this.ticks_ = new anychart.core.AxisTicks();
    this.ticks_.orientation('top');
    this.ticks_.setupSpecial(true, false);
    this.ticks_.setParentEventTarget(this);
    this.setupCreated('ticks', this.ticks_);
    this.ticks_.listenSignals(this.ticksInvalidated, this);
  }

  if (goog.isDef(opt_value)) {
    this.ticks_.setup(opt_value);
    return this;
  }
  return this.ticks_;
};


/**
 * @param {(Object|boolean|null)=} opt_value Axis ticks.
 * @return {!(anychart.core.AxisTicks|anychart.stockModule.Axis)} Axis ticks or itself for method chaining.
 */
anychart.stockModule.Axis.prototype.minorTicks = function(opt_value) {
  if (!this.minorTicks_) {
    this.minorTicks_ = new anychart.core.AxisTicks();
    this.minorTicks_.orientation('top');
    this.minorTicks_.setupSpecial(true, false);
    this.minorTicks_.setParentEventTarget(this);
    this.setupCreated('minorTicks', this.minorTicks_);
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
anychart.stockModule.Axis.prototype.ticksInvalidated = function(event) {
  this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Scale getter/setter. Currently internal.
 * @param {anychart.stockModule.scales.Scatter=} opt_value
 * @return {anychart.stockModule.scales.Scatter|anychart.stockModule.Axis}
 */
anychart.stockModule.Axis.prototype.scale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.scale_ != opt_value) {
      if (this.scale_)
        this.scale_.unlistenSignals(this.scaleInvalidated_, this);
      this.scale_ = opt_value;
      if (this.scale_)
        this.scale_.listenSignals(this.scaleInvalidated_, this);
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.scale_;
};


/**
 * Scale invalidation handler.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.stockModule.Axis.prototype.scaleInvalidated_ = function(e) {
  if (e.hasSignal(anychart.Signal.NEED_UPDATE_TICK_DEPENDENT)) {
    this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Currently does nothing. Method is added to support stock chart crosshair.
 * @param {anychart.enums.Orientation=} opt_value - Currently sets nothing.
 * @return {anychart.enums.Orientation|anychart.stockModule.Axis} - Currently returns axis instance or anychart.enums.Orientation.BOTTOM.
 */
anychart.stockModule.Axis.prototype.orientation = function(opt_value) {
  if (goog.isDef(opt_value)) {
    //TODO (A.Kudryavtsev): Currently does nothing. Method is added to support stock chart crosshair.
    return this;
  }
  return anychart.enums.Orientation.BOTTOM;
};


//endregion
//region --- Bounds
/**
 * Gets pixel bounds.
 * @return {anychart.math.Rect}
 */
anychart.stockModule.Axis.prototype.getPixelBounds = function() {
  var res = /** @type {anychart.math.Rect} */(this.parentBounds());
  if (!res)
    return new anychart.math.Rect(0, 0, 0, 0);
  if (this.enabled()) {
    res.top = res.top + res.height - /** @type {number} */(this.getOption('height')) + 1;
  }
  return res;
};


/**
 * Returns remaining bounds.
 * @return {!anychart.math.Rect}
 */
anychart.stockModule.Axis.prototype.getRemainingBounds = function() {
  var res = /** @type {anychart.math.Rect} */(this.parentBounds());
  if (!res)
    return new anychart.math.Rect(0, 0, 0, 0);
  if (this.enabled())
    res.height -= /** @type {number} */(this.getOption('height'));
  return res;
};


//endregion
//region --- Labels
/**
 * Draws labels.
 * @param {anychart.math.Rect} bounds
 * @param {anychart.stockModule.scales.ScatterTicksIterator} iterator
 * @private
 */
anychart.stockModule.Axis.prototype.drawLabels_ = function(bounds, iterator) {
  // interval info
  var majorUnit = this.scale_.getMajorIntervalUnit();
  var majorUnitCount = this.scale_.getMajorIntervalUnitCount();
  var minorUnit = this.scale_.getMinorIntervalUnit();
  var minorUnitCount = this.scale_.getMinorIntervalUnitCount();

  // bounds used to handle helper label
  var firstMajorLabelBounds = null;
  var allMinorBounds = [];

  // bounds used to handle overlap checking
  var prevMajorBounds = null;
  var prevMinor = [];
  var prevMinorBounds = [];
  var prevMinorIndexes = [];

  // current tick info
  var curr = NaN;
  var currIsMajor = false;
  var currBounds = null;

  // ticks that should be drawn and their indexes in factories
  var majorToDraw = [];
  var minorToDraw = [];
  var majorIndexes = [];
  var minorIndexes = [];

  var majorTicksDrawer = (this.ticks_ && this.ticks_.enabled()) ? this.ticks_.getTicksDrawer() : null;
  var minorTicksDrawer = (this.minorTicks_ && this.minorTicks_.enabled()) ? this.minorTicks_.getTicksDrawer() : null;

  var allowMajor = !!(this.labels_ && this.labels_.enabled());
  var allowMinor = !!(this.minorLabels_ && this.minorLabels_.enabled());
  var i;
  var majorIndex = 1;
  var minorIndex = 0;
  iterator.reset();
  while (iterator.advance()) {
    curr = iterator.getCurrent();
    currIsMajor = allowMajor && iterator.getCurrentIsMajor();

    if (currIsMajor && majorTicksDrawer)
      majorTicksDrawer.call(this.ticks_, this.scale_.transformAligned(curr), bounds, bounds, 0, 0.5);
    else if (minorTicksDrawer)
      minorTicksDrawer.call(this.minorTicks_, this.scale_.transformAligned(curr), bounds, bounds, 0, 0.5);


    if (this.getOption('overlapMode') == anychart.enums.StockLabelsOverlapMode.ALLOW_OVERLAP) {
      if (currIsMajor) {
        majorToDraw.push(curr);
        majorIndexes.push(majorIndex);
        if (!firstMajorLabelBounds)
          firstMajorLabelBounds = this.getLabelBounds_(curr, currIsMajor, bounds,
              majorUnit, majorUnitCount, minorUnit, minorUnitCount, 0);
      } else if (allowMinor) {
        minorToDraw.push(curr);
        minorIndexes.push(minorIndex);
        allMinorBounds.push(this.getLabelBounds_(curr, currIsMajor, bounds,
            majorUnit, majorUnitCount, minorUnit, minorUnitCount, 0));
      }
    } else {
      currBounds = this.getLabelBounds_(curr, currIsMajor, bounds,
          majorUnit, majorUnitCount, minorUnit, minorUnitCount, currIsMajor ? majorIndex : minorIndex);
      if (currIsMajor) {
        if (this.getOption('overlapMode') == anychart.enums.StockLabelsOverlapMode.ALLOW_MAJOR_OVERLAP ||
            !prevMajorBounds || !prevMajorBounds.intersects(currBounds)) {
          for (i = prevMinorBounds.length; i--;) {
            if (currBounds.intersects(prevMinorBounds[i])) {
              prevMinor.pop();
              prevMinorBounds.pop();
              prevMinorIndexes.pop();
            } else {
              break;
            }
          }
          majorToDraw.push(curr);
          majorIndexes.push(majorIndex);
          minorToDraw.push.apply(minorToDraw, prevMinor);
          minorIndexes.push.apply(minorIndexes, prevMinorIndexes);
          allMinorBounds.push.apply(allMinorBounds, prevMinorBounds);
          prevMajorBounds = currBounds;
          if (!firstMajorLabelBounds) firstMajorLabelBounds = currBounds;
        }
        prevMinor.length = prevMinorBounds.length = prevMinorIndexes.length = 0;
      } else if (allowMinor) {
        if (!(prevMajorBounds && prevMajorBounds.intersects(currBounds) ||
            (this.getOption('overlapMode') != anychart.enums.StockLabelsOverlapMode.ALLOW_MINOR_OVERLAP) &&
            prevMinorBounds.length && prevMinorBounds[prevMinorBounds.length - 1].intersects(currBounds))) {
          prevMinor.push(curr);
          prevMinorIndexes.push(minorIndex);
          prevMinorBounds.push(currBounds);
        }
      }
    }
    if (currIsMajor)
      majorIndex++;
    else
      minorIndex++;
  }
  if (prevMinor.length) {
    minorToDraw.push.apply(minorToDraw, prevMinor);
    minorIndexes.push.apply(minorIndexes, prevMinorIndexes);
    allMinorBounds.push.apply(allMinorBounds, prevMinorBounds);
  }

  this.labels().dropCallsCache();
  this.minorLabels().dropCallsCache();

  curr = iterator.getPreFirstMajor();
  if (this.getOption('showHelperLabel') && !isNaN(curr)) {
    currBounds = this.getLabelBounds_(curr, true, bounds,
        majorUnit, majorUnitCount, minorUnit, minorUnitCount, 0);
    if (currBounds && (!firstMajorLabelBounds || !currBounds.intersects(firstMajorLabelBounds))) {
      if (this.getOption('overlapMode') != anychart.enums.StockLabelsOverlapMode.ALLOW_OVERLAP) {
        for (i = 0; i < allMinorBounds.length; i++) {
          if (!currBounds.intersects(allMinorBounds[i]))
            break;
        }
        if (i) {
          goog.array.splice(allMinorBounds, 0, i);
          goog.array.splice(minorToDraw, 0, i);
          goog.array.splice(minorIndexes, 0, i);
        }
      }
      this.drawLabel_(curr, true, bounds,
          majorUnit, majorUnitCount, minorUnit, minorUnitCount, 0);
    }

  }

  for (i = 0; i < majorToDraw.length; i++) {
    this.drawLabel_(majorToDraw[i], true, bounds,
        majorUnit, majorUnitCount, minorUnit, minorUnitCount, majorIndexes[i]);
  }
  for (i = 0; i < minorToDraw.length; i++) {
    this.drawLabel_(minorToDraw[i], false, bounds,
        majorUnit, majorUnitCount, minorUnit, minorUnitCount, minorIndexes[i]);
  }
};


/**
 * Draws the label.
 * @param {number} value
 * @param {boolean} isMajor
 * @param {anychart.math.Rect} bounds
 * @param {anychart.enums.Interval} majorUnit
 * @param {number} majorUnitCount
 * @param {anychart.enums.Interval} minorUnit
 * @param {number} minorUnitCount
 * @param {number} index
 * @private
 */
anychart.stockModule.Axis.prototype.drawLabel_ = function(value, isMajor, bounds, majorUnit, majorUnitCount, minorUnit, minorUnitCount, index) {
  var labels = isMajor ? this.labels() : this.minorLabels();

  var dataIndex = this.scale_.getIndexByKey(value);
  if (this.scale_.getType() == anychart.enums.ScaleTypes.STOCK_ORDINAL_DATE_TIME)
    dataIndex = Math.ceil(dataIndex);

  var realValue = this.scale_.getKeyByIndex(dataIndex);
  var ratio = this.scale_.transformInternal(realValue, dataIndex);

  var x = Math.round(bounds.left + ratio * bounds.width);
  var y = bounds.top;

  var formatProvider = this.getLabelsFormatProvider_(value, realValue, majorUnit, majorUnitCount, minorUnit, minorUnitCount);
  var positionProvider = {'value': {'x': x, 'y': y}};

  var labelBounds = labels.measure(formatProvider, positionProvider, undefined, index);

  if (!isNaN(labelBounds.left)) {
    var diff = bounds.left - labelBounds.left;
    if (diff > 0)
      positionProvider['value']['x'] += diff;
    var label = labels.add(formatProvider, positionProvider, index);
    label.stateOrder([label.ownSettings, labels.ownSettings, label.autoSettings, labels.themeSettings]);

    if (!anychart.utils.instanceOf(this.groupingProvider_, anychart.stockModule.Scroller)) {
      var labelsPosition = /** @type {anychart.enums.SidePosition} */(labels.getOption('position'));
      var labelsSidePosition = anychart.utils.sidePositionToNumber(labelsPosition);

      var anchor = labelsSidePosition < 0 ?
          anychart.enums.Anchor.CENTER_BOTTOM :
          labelsSidePosition > 0 ?
              anychart.enums.Anchor.CENTER_TOP :
              anychart.enums.Anchor.CENTER;
      label.autoAnchor(anchor);
    }
  }
};


/**
 * Returns label bounds.
 * @param {number} value
 * @param {boolean} isMajor
 * @param {anychart.math.Rect} bounds
 * @param {anychart.enums.Interval} majorUnit
 * @param {number} majorUnitCount
 * @param {anychart.enums.Interval} minorUnit
 * @param {number} minorUnitCount
 * @param {number} index
 * @return {anychart.math.Rect}
 * @private
 */
anychart.stockModule.Axis.prototype.getLabelBounds_ = function(value, isMajor, bounds, majorUnit, majorUnitCount, minorUnit, minorUnitCount, index) {
  var labels = isMajor ? this.labels() : this.minorLabels();
  if (!labels.enabled()) return null;

  var dataIndex = this.scale_.getIndexByKey(value);
  if (this.scale_.getType() == anychart.enums.ScaleTypes.STOCK_ORDINAL_DATE_TIME)
    dataIndex = Math.ceil(dataIndex);

  var realValue = this.scale_.getKeyByIndex(dataIndex);
  var ratio = this.scale_.transformInternal(realValue, dataIndex);
  var x = Math.round(bounds.left + ratio * bounds.width);
  var y = bounds.top;

  var formatProvider = this.getLabelsFormatProvider_(value, realValue, majorUnit, majorUnitCount, minorUnit, minorUnitCount);
  var positionProvider = {'value': {'x': x, 'y': y}};

  var labelBounds = labels.measure(formatProvider, positionProvider, undefined, index);

  labelBounds.left = Math.max(labelBounds.left, bounds.left);
  return labelBounds;
};


/**
 * Gets format provider for label.
 * @param {number} value Label value.
 * @param {number} existValue Exist data value.
 * @param {anychart.enums.Interval} majorUnit
 * @param {number} majorUnitCount
 * @param {anychart.enums.Interval} minorUnit
 * @param {number} minorUnitCount
 * @return {Object} Labels format provider.
 * @private
 */
anychart.stockModule.Axis.prototype.getLabelsFormatProvider_ = function(value, existValue,
    majorUnit, majorUnitCount, minorUnit, minorUnitCount) {

  var labelText = anychart.format.date(value);

  var grouping = this.groupingProvider_.grouping();

  var values = {
    'dataIntervalUnit': {
      value: grouping.getCurrentDataInterval()['unit'],
      type: anychart.enums.TokenType.STRING
    },
    'dataIntervalUnitCount': {
      value: grouping.getCurrentDataInterval()['count'],
      type: anychart.enums.TokenType.NUMBER
    },
    'dataIsGrouped': {
      value: grouping.isGrouped(),
      type: anychart.enums.TokenType.STRING
    },
    'majorIntervalUnit': {
      value: majorUnit,
      type: anychart.enums.TokenType.STRING
    },
    'majorIntervalUnitCount': {
      value: minorUnitCount,
      type: anychart.enums.TokenType.NUMBER
    },
    'minorIntervalUnit': {
      value: minorUnit,
      type: anychart.enums.TokenType.STRING
    },
    'minorIntervalUnitCount': {
      value: minorUnitCount,
      type: anychart.enums.TokenType.NUMBER
    },
    'value': {
      value: labelText,
      type: anychart.enums.TokenType.STRING
    },
    'tickValue': {
      value: value,
      type: anychart.enums.TokenType.NUMBER
    },
    'dataValue': {
      value: existValue,
      type: anychart.enums.TokenType.NUMBER
    },
    'max': {
      value: this.scale_.getMaximum(),
      type: anychart.enums.TokenType.NUMBER
    },
    'min': {
      value: this.scale_.getMinimum(),
      type: anychart.enums.TokenType.NUMBER
    },
    'scale': {
      value: this.scale_,
      type: anychart.enums.TokenType.UNKNOWN
    }
  };

  var aliases = {};
  aliases[anychart.enums.StringToken.AXIS_SCALE_MAX] = 'max';
  aliases[anychart.enums.StringToken.AXIS_SCALE_MIN] = 'min';

  var context = new anychart.format.Context(values);
  context.tokenAliases(aliases);

  return context.propagate();
};


//endregion
//region --- Drawing
/** @inheritDoc */
anychart.stockModule.Axis.prototype.remove = function() {
  if (this.rootLayer_)
    this.rootLayer_.remove();
};


/**
 * Draws the axis.
 * @return {anychart.stockModule.Axis}
 */
anychart.stockModule.Axis.prototype.draw = function() {
  if (!this.checkDrawingNeeded())
    return this;

  if (!this.rootLayer_) {
    this.rootLayer_ = acgraph.layer();
    if (!this.interactive_)
      this.rootLayer_.disablePointerEvents(true);
  }

  var background = this.getCreated('background');
  var labels = this.getCreated('labels');
  var minorLabels = this.getCreated('minorLabels');
  var ticks = this.getCreated('ticks');
  var minorTicks = this.getCreated('minorTicks');

  if (background)
    background.suspendSignalsDispatching();
  if (labels)
    labels.suspendSignalsDispatching();
  if (minorLabels)
    minorLabels.suspendSignalsDispatching();

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    if (background) {
      var bgBounds = /** @type {anychart.math.Rect} */(this.parentBounds().clone().round());
      bgBounds.top = bgBounds.top + bgBounds.height - /** @type {number} */(this.getOption('height'));
      bgBounds.height = /** @type {number} */(this.getOption('height'));
      // fixes axis background being 1px shorter than axis line
      bgBounds.width = Math.ceil(anychart.utils.applyPixelShift(bgBounds.getRight(), 1)) - bgBounds.left;
      background.parentBounds(bgBounds);
    }
    this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.STOCK_DTAXIS_BACKGROUND);
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.STOCK_DTAXIS_BACKGROUND)) {
    if (background) {
      background.container(this.rootLayer_);
      background.draw();
    }
    this.markConsistent(anychart.ConsistencyState.STOCK_DTAXIS_BACKGROUND);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    if (this.scale_) {
      var bounds;
      if (background) {
        bounds = background.getRemainingBounds();
      } else {
        bounds = /** @type {anychart.math.Rect} */(this.parentBounds());
        bounds.top = bounds.top + bounds.height - /** @type {number} */(this.getOption('height'));
        bounds.height = /** @type {number} */(this.getOption('height'));
      }

      if (labels) {
        labels.clear();
        labels.dropCallsCache();
      }

      if (minorLabels) {
        minorLabels.clear();
        minorLabels.dropCallsCache();
      }

      if (ticks) {
        ticks.length(bounds.height);
        ticks.container(this.rootLayer_);
        ticks.draw();
      }

      if (minorTicks) {
        minorTicks.length(bounds.height);
        minorTicks.container(this.rootLayer_);
        minorTicks.draw();
      }

      var drawMajor = labels && labels.enabled();
      var drawMinor = minorLabels && minorLabels.enabled();
      if (drawMajor || drawMinor) {
        this.drawLabels_(bounds, this.scale_.getTicks());
      }

      if (!this.clipElement_)
        this.clipElement_ = acgraph.clip();
      this.clipElement_.shape(bounds);

      var tmp;
      if (labels) {
        labels.container(this.rootLayer_);
        labels.draw();
        tmp = labels.getRootLayer();
        if (tmp) tmp.clip(labels.getOption('position') == 'outside' ? this.clipElement_ : null);
      }
      if (minorLabels) {
        minorLabels.container(this.rootLayer_);
        minorLabels.draw();
        tmp = minorLabels.getRootLayer();
        if (tmp) tmp.clip(minorLabels.getOption('position') == 'outside' ? this.clipElement_ : null);
      }
    }
    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    this.rootLayer_.zIndex(/** @type {number} */(this.zIndex()));
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    this.rootLayer_.parent(/** @type {acgraph.vector.ILayer} */(this.container()));
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  if (background)
    background.resumeSignalsDispatching(false);
  if (labels)
    labels.resumeSignalsDispatching(false);
  if (minorLabels)
    minorLabels.resumeSignalsDispatching(false);

  return this;
};


//endregion
//region --- Utils
/**
 * Whether axis is horizontal.
 * @return {boolean}
 */
anychart.stockModule.Axis.prototype.isHorizontal = function() {
  return true;
};


/** @inheritDoc */
anychart.stockModule.Axis.prototype.isAxisMarkerProvider = function() {
  return true;
};


//endregion
//region --- Setup and Serialize
/** @inheritDoc */
anychart.stockModule.Axis.prototype.disposeInternal = function() {
  goog.disposeAll(this.labels_, this.minorLabels_, this.ticks_, this.minorTicks_, this.background_, this.rootLayer_, this.scale_);

  this.labels_ = null;
  this.minorLabels_ = null;
  this.ticks_ = null;
  this.minorTicks_ = null;
  this.background_ = null;
  this.rootLayer_ = null;
  this.scale_ = null;

  anychart.stockModule.Axis.base(this, 'disposeInternal');
};


/** @inheritDoc */
anychart.stockModule.Axis.prototype.serialize = function() {
  var json = anychart.stockModule.Axis.base(this, 'serialize');
  anychart.core.settings.serialize(this, this.SIMPLE_PROPS_DESCRIPTORS, json);

  json['labels'] = this.labels().serialize();
  json['minorLabels'] = this.minorLabels().serialize();
  json['ticks'] = this.ticks().serialize();
  json['minorTicks'] = this.minorTicks().serialize();
  json['background'] = this.background().serialize();

  return json;
};


/** @inheritDoc */
anychart.stockModule.Axis.prototype.setupByJSON = function(config, opt_default) {
  anychart.stockModule.Axis.base(this, 'setupByJSON', config, opt_default);
  anychart.core.settings.deserialize(this, this.SIMPLE_PROPS_DESCRIPTORS, config, opt_default);

  this.labels().setupInternal(!!opt_default, config['labels']);
  this.minorLabels().setupInternal(!!opt_default, config['minorLabels']);
  this.ticks(config['ticks']);
  this.minorTicks(config['minorTicks']);
  this.background(config['background']);
};


//endregion
//region --- Export
//exports
(function() {
  var proto = anychart.stockModule.Axis.prototype;
  proto['labels'] = proto.labels;
  proto['minorLabels'] = proto.minorLabels;
  proto['ticks'] = proto.ticks;
  proto['minorTicks'] = proto.minorTicks;
  proto['background'] = proto.background;

  // auto generated
  // proto['height'] = proto.height;
  // proto['showHelperLabel'] = proto.showHelperLabel;
  // proto['overlapMode'] = proto.overlapMode;
})();
//endregion
