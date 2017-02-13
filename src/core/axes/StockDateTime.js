goog.provide('anychart.core.axes.StockDateTime');
goog.require('acgraph');
goog.require('anychart.core.IGroupingProvider');
goog.require('anychart.core.VisualBase');
goog.require('anychart.core.axes.StockTicks');
goog.require('anychart.core.ui.Background');
goog.require('anychart.core.ui.LabelsFactory');
goog.require('anychart.math.Rect');



/**
 * Stock date time axis class.
 * @param {anychart.core.IGroupingProvider} groupingProvider
 * @param {boolean=} opt_disableInteractivity
 * @constructor
 * @extends {anychart.core.VisualBase}
 */
anychart.core.axes.StockDateTime = function(groupingProvider, opt_disableInteractivity) {
  anychart.core.axes.StockDateTime.base(this, 'constructor');

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
   * Axis height. Unfortunately we cannot autocalc it now:(
   * @type {number}
   * @private
   */
  this.height_ = 18;

  /**
   * Whether to draw helper label.
   * @type {boolean}
   * @private
   */
  this.drawHelperLabel_ = true;

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

  /**
   * Labels overlap mode.
   * @type {anychart.enums.StockLabelsOverlapMode}
   * @private
   */
  this.labelsOverlapMode_ = anychart.enums.StockLabelsOverlapMode.NO_OVERLAP;
};
goog.inherits(anychart.core.axes.StockDateTime, anychart.core.VisualBase);


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.axes.StockDateTime.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.STOCK_DTAXIS_BACKGROUND;


/**
 * Supported signals.
 * @type {number}
 */
anychart.core.axes.StockDateTime.prototype.SUPPORTED_SIGNALS = anychart.core.VisualBase.prototype.SUPPORTED_SIGNALS;


/**
 * Axis height getter/setter.
 * @param {number=} opt_value
 * @return {number|anychart.core.axes.StockDateTime}
 */
anychart.core.axes.StockDateTime.prototype.height = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.toNumber(opt_value);
    if (this.height_ != opt_value) {
      this.height_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.height_;
};


/**
 * Axis background settings.
 * @param {(Object|boolean|null)=} opt_value
 * @return {!(anychart.core.ui.Background|anychart.core.axes.StockDateTime)}
 */
anychart.core.axes.StockDateTime.prototype.background = function(opt_value) {
  if (!this.background_) {
    this.background_ = new anychart.core.ui.Background();
    this.background_.setThemeSettings(/** @type {!Object} */(anychart.getFullTheme('defaultBackground')));
    this.background_.listenSignals(this.backgroundInvalidated_, this);
  }
  if (goog.isDef(opt_value)) {
    this.background_.setup(opt_value);
    return this;
  }
  return this.background_;
};


/**
 * Labels settings.
 * @param {(Object|boolean|null)=} opt_value Axis labels.
 * @return {!(anychart.core.ui.LabelsFactory|anychart.core.axes.StockDateTime)} Axis labels of itself for method chaining.
 */
anychart.core.axes.StockDateTime.prototype.labels = function(opt_value) {
  if (!this.labels_) {
    this.labels_ = new anychart.core.ui.LabelsFactory();
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
 * @return {!(anychart.core.ui.LabelsFactory|anychart.core.axes.StockDateTime)} Axis labels of itself for method chaining.
 */
anychart.core.axes.StockDateTime.prototype.minorLabels = function(opt_value) {
  if (!this.minorLabels_) {
    this.minorLabels_ = new anychart.core.ui.LabelsFactory();
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
 * @param {(Object|boolean|null)=} opt_value Axis ticks.
 * @return {!(anychart.core.axes.StockTicks|anychart.core.axes.StockDateTime)} Axis ticks or itself for method chaining.
 */
anychart.core.axes.StockDateTime.prototype.ticks = function(opt_value) {
  if (!this.ticks_) {
    this.ticks_ = new anychart.core.axes.StockTicks();
    this.ticks_.orientation('top');
    this.ticks_.enabled(false);
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
 * @param {(Object|boolean|null)=} opt_value Axis ticks.
 * @return {!(anychart.core.axes.StockTicks|anychart.core.axes.StockDateTime)} Axis ticks or itself for method chaining.
 */
anychart.core.axes.StockDateTime.prototype.minorTicks = function(opt_value) {
  if (!this.minorTicks_) {
    this.minorTicks_ = new anychart.core.axes.StockTicks();
    this.minorTicks_.orientation('top');
    this.minorTicks_.enabled(false);
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
anychart.core.axes.StockDateTime.prototype.ticksInvalidated = function(event) {
  this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Whether to draw helper label (leftmost hanging label).
 * @param {boolean=} opt_value
 * @return {anychart.core.axes.StockDateTime|boolean}
 */
anychart.core.axes.StockDateTime.prototype.showHelperLabel = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = !!opt_value;
    if (this.drawHelperLabel_ != opt_value) {
      this.drawHelperLabel_ = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.drawHelperLabel_;
};


/**
 * Whether to allow labels to overlap.
 * @param {anychart.enums.StockLabelsOverlapMode=} opt_value
 * @return {anychart.enums.StockLabelsOverlapMode|anychart.core.axes.StockDateTime}
 */
anychart.core.axes.StockDateTime.prototype.overlapMode = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = anychart.enums.normalizeStockLabelsOverlapMode(opt_value);
    if (this.labelsOverlapMode_ != val) {
      this.labelsOverlapMode_ = val;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
      return this;
    }
  }
  return this.labelsOverlapMode_;
};


/**
 * Scale getter/setter. Currently internal.
 * @param {anychart.scales.StockScatterDateTime=} opt_value
 * @return {anychart.scales.StockScatterDateTime|anychart.core.axes.StockDateTime}
 */
anychart.core.axes.StockDateTime.prototype.scale = function(opt_value) {
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
 * Returns remaining bounds.
 * @return {!anychart.math.Rect}
 */
anychart.core.axes.StockDateTime.prototype.getRemainingBounds = function() {
  var res = /** @type {anychart.math.Rect} */(this.parentBounds());
  if (!res)
    return new anychart.math.Rect(0, 0, 0, 0);
  if (this.enabled())
    res.height -= this.height_;
  return res;
};


/**
 * Scale invalidation handler.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.core.axes.StockDateTime.prototype.scaleInvalidated_ = function(e) {
  //if (e.hasSignal(anychart.Signal.NEED_UPDATE_TICK_DEPENDENT)) {
  //  this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
  //}
};


/**
 * Background invalidation handler.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.core.axes.StockDateTime.prototype.backgroundInvalidated_ = function(e) {
  if (e.hasSignal(anychart.Signal.NEEDS_REDRAW))
    this.invalidate(anychart.ConsistencyState.STOCK_DTAXIS_BACKGROUND, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Labels invalidation handler.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.core.axes.StockDateTime.prototype.labelsInvalidated_ = function(e) {
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
 * Draws the axis.
 * @return {anychart.core.axes.StockDateTime}
 */
anychart.core.axes.StockDateTime.prototype.draw = function() {
  if (!this.checkDrawingNeeded())
    return this;

  if (!this.rootLayer_) {
    this.rootLayer_ = acgraph.layer();
    if (!this.interactive_)
      this.rootLayer_.disablePointerEvents(true);
  }

  if (this.background_)
    this.background_.suspendSignalsDispatching();
  if (this.labels_)
    this.labels_.suspendSignalsDispatching();
  if (this.minorLabels_)
    this.minorLabels_.suspendSignalsDispatching();

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    if (this.background_) {
      var bgBounds = /** @type {anychart.math.Rect} */(this.parentBounds());
      bgBounds.top = bgBounds.top + bgBounds.height - this.height_;
      bgBounds.height = this.height_;
      this.background_.parentBounds(bgBounds);
    }
    this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.STOCK_DTAXIS_BACKGROUND);
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.STOCK_DTAXIS_BACKGROUND)) {
    if (this.background_) {
      this.background_.container(this.rootLayer_);
      this.background_.draw();
    }
    this.markConsistent(anychart.ConsistencyState.STOCK_DTAXIS_BACKGROUND);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    if (this.scale_) {
      var bounds;
      if (this.background_) {
        bounds = this.background_.getRemainingBounds();
      } else {
        bounds = /** @type {anychart.math.Rect} */(this.parentBounds());
        bounds.top = bounds.top + bounds.height - this.height_;
        bounds.height = this.height_;
      }
      if (this.labels_) this.labels_.clear();
      if (this.minorLabels_) this.minorLabels_.clear();

      if (this.ticks_) {
        this.ticks_.length(bounds.height);
        this.ticks_.container(this.rootLayer_);
        this.ticks_.draw();
      }
      if (this.minorTicks_) {
        this.minorTicks_.length(bounds.height);
        this.minorTicks_.container(this.rootLayer_);
        this.minorTicks_.draw();
      }

      var drawMajor = this.labels_ && this.labels_.enabled();
      var drawMinor = this.minorLabels_ && this.minorLabels_.enabled();
      if (drawMajor || drawMinor) {
        this.drawLabels_(bounds, this.scale_.getTicks());
      }

      if (!this.clipElement_)
        this.clipElement_ = acgraph.clip();
      this.clipElement_.shape(bounds);

      var tmp;
      if (this.labels_) {
        this.labels_.container(this.rootLayer_);
        this.labels_.draw();
        tmp = this.labels_.getRootLayer();
        if (tmp) tmp.clip(this.clipElement_);
      }
      if (this.minorLabels_) {
        this.minorLabels_.container(this.rootLayer_);
        this.minorLabels_.draw();
        tmp = this.minorLabels_.getRootLayer();
        if (tmp) tmp.clip(this.clipElement_);
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

  if (this.background_)
    this.background_.resumeSignalsDispatching(false);
  if (this.labels_)
    this.labels_.resumeSignalsDispatching(false);
  if (this.minorLabels_)
    this.minorLabels_.resumeSignalsDispatching(false);

  return this;
};


/**
 * Draws labels.
 * @param {anychart.math.Rect} bounds
 * @param {anychart.scales.StockScatterTicksIterator} iterator
 * @private
 */
anychart.core.axes.StockDateTime.prototype.drawLabels_ = function(bounds, iterator) {
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


    if (this.labelsOverlapMode_ == anychart.enums.StockLabelsOverlapMode.ALLOW_OVERLAP) {
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
        if (this.labelsOverlapMode_ == anychart.enums.StockLabelsOverlapMode.ALLOW_MAJOR_OVERLAP ||
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
            (this.labelsOverlapMode_ != anychart.enums.StockLabelsOverlapMode.ALLOW_MINOR_OVERLAP) &&
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

  curr = iterator.getPreFirstMajor();
  if (this.drawHelperLabel_ && !isNaN(curr)) {
    currBounds = this.getLabelBounds_(curr, true, bounds,
        majorUnit, majorUnitCount, minorUnit, minorUnitCount, 0);
    if (currBounds && (!firstMajorLabelBounds || !currBounds.intersects(firstMajorLabelBounds))) {
      if (this.labelsOverlapMode_ != anychart.enums.StockLabelsOverlapMode.ALLOW_OVERLAP) {
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
anychart.core.axes.StockDateTime.prototype.drawLabel_ = function(value, isMajor, bounds,
    majorUnit, majorUnitCount, minorUnit, minorUnitCount, index) {
  var labels;
  if (isMajor) {
    labels = this.labels();
  } else {
    labels = this.minorLabels();
  }

  var x = Math.round(bounds.left + this.scale_.transformAligned(value) * bounds.width);
  var y = bounds.top;

  var formatProvider = this.getLabelsFormatProvider_(value, majorUnit, majorUnitCount, minorUnit, minorUnitCount);
  var positionProvider = {'value': {'x': x, 'y': y}};

  var labelBounds = labels.measure(formatProvider, positionProvider, undefined, index);
  if (!isNaN(labelBounds.left)) {
    var diff = bounds.left - labelBounds.left;
    if (diff > 0)
      positionProvider['value']['x'] += diff;
    labels.add(formatProvider, positionProvider, index);
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
anychart.core.axes.StockDateTime.prototype.getLabelBounds_ = function(value, isMajor, bounds,
    majorUnit, majorUnitCount, minorUnit, minorUnitCount, index) {
  var labels = isMajor ? this.labels() : this.minorLabels();
  if (!labels.enabled()) return null;

  var x = Math.round(bounds.left + this.scale_.transformAligned(value) * bounds.width);
  var y = bounds.top;

  var formatProvider = this.getLabelsFormatProvider_(value, majorUnit, majorUnitCount, minorUnit, minorUnitCount);
  var positionProvider = {'value': {'x': x, 'y': y}};

  var labelBounds = labels.measure(formatProvider, positionProvider, undefined, index);
  labelBounds.left = Math.max(labelBounds.left, bounds.left);
  return labelBounds;
};


/**
 * Gets format provider for label.
 * @param {number} value Label value.
 * @param {anychart.enums.Interval} majorUnit
 * @param {number} majorUnitCount
 * @param {anychart.enums.Interval} minorUnit
 * @param {number} minorUnitCount
 * @return {Object} Labels format provider.
 * @private
 */
anychart.core.axes.StockDateTime.prototype.getLabelsFormatProvider_ = function(value,
    majorUnit, majorUnitCount, minorUnit, minorUnitCount) {
  var labelText;
  var date = new Date(value);
  var mm = date.getMonth() + 1;
  var dd = date.getDate();
  var yy = date.getFullYear();

  mm = mm < 10 ? '0' + mm : '' + mm;
  dd = dd < 10 ? '0' + dd : '' + dd;

  labelText = mm + '-' + dd + '-' + yy;

  var grouping = this.groupingProvider_.grouping();
  return {
    'dataIntervalUnit': grouping.getCurrentDataInterval()['unit'],
    'dataIntervalUnitCount': grouping.getCurrentDataInterval()['count'],
    'dataIsGrouped': grouping.isGrouped(),
    'majorIntervalUnit': majorUnit,
    'majorIntervalUnitCount': minorUnitCount,
    'minorIntervalUnit': minorUnit,
    'minorIntervalUnitCount': minorUnitCount,
    'value': labelText,
    'tickValue': value,
    'max': this.scale_.getMaximum(),
    'min': this.scale_.getMinimum(),
    'scale': this.scale_
  };
};


/** @inheritDoc */
anychart.core.axes.StockDateTime.prototype.disposeInternal = function() {
  goog.dispose(this.labels_);
  this.labels_ = null;

  goog.dispose(this.minorLabels_);
  this.minorLabels_ = null;

  goog.dispose(this.background_);
  this.background_ = null;

  goog.dispose(this.rootLayer_);
  this.rootLayer_ = null;

  this.scale_ = null;

  anychart.core.axes.StockDateTime.base(this, 'disposeInternal');
};


/** @inheritDoc */
anychart.core.axes.StockDateTime.prototype.serialize = function() {
  var json = anychart.core.axes.StockDateTime.base(this, 'serialize');
  json['height'] = this.height();
  json['labels'] = this.labels().serialize();
  json['minorLabels'] = this.minorLabels().serialize();
  json['ticks'] = this.ticks().serialize();
  json['minorTicks'] = this.minorTicks().serialize();
  json['background'] = this.background().serialize();
  json['showHelperLabel'] = this.showHelperLabel();
  json['overlapMode'] = this.overlapMode();
  return json;
};


/** @inheritDoc */
anychart.core.axes.StockDateTime.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.axes.StockDateTime.base(this, 'setupByJSON', config, opt_default);
  this.height(config['height']);
  this.labels().setup(config['labels']);
  this.minorLabels().setup(config['minorLabels']);
  this.ticks(config['ticks']);
  this.minorTicks(config['minorTicks']);
  this.background(config['background']);
  this.showHelperLabel(config['showHelperLabel']);
  this.overlapMode(config['overlapMode']);
};



//exports
(function() {
  var proto = anychart.core.axes.StockDateTime.prototype;
  proto['height'] = proto.height;
  proto['labels'] = proto.labels;
  proto['minorLabels'] = proto.minorLabels;
  proto['ticks'] = proto.ticks;
  proto['minorTicks'] = proto.minorTicks;
  proto['background'] = proto.background;
  proto['showHelperLabel'] = proto.showHelperLabel;
  proto['overlapMode'] = proto.overlapMode;
})();
