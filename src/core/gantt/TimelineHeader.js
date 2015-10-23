goog.provide('anychart.core.gantt.TimelineHeader');

goog.require('acgraph');
goog.require('anychart.core.VisualBaseWithBounds');
goog.require('anychart.core.ui.LabelsFactory');
goog.require('anychart.scales.GanttDateTime');



/**
 * Timeline header implementation. Contains a time levels.
 * @constructor
 * @extends {anychart.core.VisualBaseWithBounds}
 */
anychart.core.gantt.TimelineHeader = function() {
  goog.base(this);

  /**
   * Pixel bounds cache.
   * @type {anychart.math.Rect}
   * @private
   */
  this.pixelBoundsCache_ = null;

  /**
   * Base layer.
   * @type {acgraph.vector.Layer}
   * @private
   */
  this.base_ = null;

  /**
   * Related scale.
   * @type {anychart.scales.GanttDateTime}
   * @private
   */
  this.scale_ = null;

  /**
   * BG rect.
   * @type {acgraph.vector.Rect}
   * @private
   */
  this.bgRect_ = null;

  /**
   * Background fill.
   * @type {acgraph.vector.Fill}
   * @private
   */
  this.backgroundFill_ = acgraph.vector.normalizeFill('#cecece');

  /**
   * Levels of header.
   * TODO (A.Kudryavtsev): In current implementation here are ony three levels.
   *
   * NOTE: Top level has 0 index, mid level has 1 index, low level has 0 index.
   * @type {Array.<anychart.core.gantt.TimelineHeader.Level>}
   * @private
   */
  this.levels_ = new Array(3);

  var topLevel = new anychart.core.gantt.TimelineHeader.Level(this);
  topLevel.container(this.getBase_());
  this.registerDisposable(topLevel);
  this.levels_[0] = topLevel;

  var midLevel = new anychart.core.gantt.TimelineHeader.Level(this);
  midLevel.container(this.getBase_());
  this.registerDisposable(midLevel);
  this.levels_[1] = midLevel;

  var lowLevel = new anychart.core.gantt.TimelineHeader.Level(this);
  lowLevel.container(this.getBase_());
  this.registerDisposable(lowLevel);
  this.levels_[2] = lowLevel;

};
goog.inherits(anychart.core.gantt.TimelineHeader, anychart.core.VisualBaseWithBounds);


/**
 * Supported signals.
 * @type {number}
 */
anychart.core.gantt.TimelineHeader.SUPPORTED_SIGNALS = anychart.core.VisualBaseWithBounds.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistence states.
 * @type {number}
 */
anychart.core.gantt.TimelineHeader.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBaseWithBounds.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.TIMELINE_HEADER_SCALES |
    anychart.ConsistencyState.APPEARANCE;


/**
 * Inner getter for base layer.
 * @private
 * @return {acgraph.vector.Layer}
 */
anychart.core.gantt.TimelineHeader.prototype.getBase_ = function() {
  if (!this.base_) {
    this.base_ = /** @type {acgraph.vector.Layer} */ (acgraph.layer());
    this.registerDisposable(this.base_);
    this.bgRect_ = this.base_.rect();
    this.bgRect_.fill(this.backgroundFill_).stroke(null);
    this.registerDisposable(this.bgRect_);
  }
  return this.base_;
};


/**
 * Getter for top level of header.
 * TODO (A.Kudryavtsev): Remove on advanced leveling implementation.
 * @return {anychart.core.gantt.TimelineHeader.Level} - Top level.
 */
anychart.core.gantt.TimelineHeader.prototype.getTopLevel = function() {
  return this.levels_[0];
};


/**
 * Getter for mid level of header.
 * TODO (A.Kudryavtsev): Remove on advanced leveling implementation.
 * @return {anychart.core.gantt.TimelineHeader.Level} - Mid level.
 */
anychart.core.gantt.TimelineHeader.prototype.getMidLevel = function() {
  return this.levels_[1];
};


/**
 * Getter for low level of header.
 * TODO (A.Kudryavtsev): Remove on advanced leveling implementation.
 * @return {anychart.core.gantt.TimelineHeader.Level} - Low level.
 */
anychart.core.gantt.TimelineHeader.prototype.getLowLevel = function() {
  return this.levels_[2];
};


/**
 * Scale invalidation handler.
 * @param {anychart.SignalEvent} event - Signal event.
 * @private
 */
anychart.core.gantt.TimelineHeader.prototype.scaleInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION)) {
    this.invalidate(anychart.ConsistencyState.TIMELINE_HEADER_SCALES, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Gets/sets new scale.
 * @param {anychart.scales.GanttDateTime=} opt_value - Value to be set.
 * @return {(anychart.scales.GanttDateTime|anychart.core.gantt.TimelineHeader)} - Current value or itself for method chaining.
 */
anychart.core.gantt.TimelineHeader.prototype.scale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.scale_ != opt_value) {
      if (this.scale_) this.scale_.unlistenSignals(this.scaleInvalidated_, this);
      this.scale_ = opt_value;
      this.scale_.listenSignals(this.scaleInvalidated_, this);
      this.invalidate(anychart.ConsistencyState.TIMELINE_HEADER_SCALES, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.scale_;
};


/**
 * Gets/sets background fill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.gantt.TimelineHeader|string} - Current value or itself for method chaining.
 */
anychart.core.gantt.TimelineHeader.prototype.backgroundFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var val = acgraph.vector.normalizeFill.apply(null, arguments);
    if (!anychart.color.equals(/** @type {acgraph.vector.Fill} */ (this.backgroundFill_), val)) {
      this.backgroundFill_ = val;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.backgroundFill_;
};


/**
 * Draws timeline header.
 * @return {anychart.core.gantt.TimelineHeader} - Itself for method chaining.
 */
anychart.core.gantt.TimelineHeader.prototype.draw = function() {
  if (this.checkDrawingNeeded()) {
    var container = /** @type {acgraph.vector.ILayer} */(this.container());
    var stage = container ? container.getStage() : null;
    var manualSuspend = stage && !stage.isSuspended();
    if (manualSuspend) stage.suspend();
    var i, l, level;
    var counter = 0;

    if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
      this.getBase_().parent(container);
      this.markConsistent(anychart.ConsistencyState.CONTAINER);
    }

    if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
      this.pixelBoundsCache_ = /** @type {acgraph.math.Rect} */ (this.getPixelBounds());
      this.bgRect_.setBounds(/** @type {acgraph.math.Rect} */ (this.pixelBoundsCache_));

      for (i = 0, l = this.levels_.length; i < l; i++) {
        if (this.levels_[i].enabled()) counter++;
      }

      var height = counter ? Math.floor(this.pixelBoundsCache_.height / counter) : 0;

      var actualHeight = 0;
      var top = this.pixelBoundsCache_.top;
      for (i = 0, l = this.levels_.length; i < l; i++) {
        level = this.levels_[i];
        if (level.enabled()) {
          if (i == l - 1) {
            height = this.pixelBoundsCache_.height - actualHeight;
          }
          level.bounds().set(this.pixelBoundsCache_.left, top, this.pixelBoundsCache_.width, height);
          top += (height + 1);
          actualHeight += (height + 1);
        }
      }

      this.markConsistent(anychart.ConsistencyState.BOUNDS);
    }

    if (this.hasInvalidationState(anychart.ConsistencyState.TIMELINE_HEADER_SCALES)) {
      if (!this.scale_) {
        anychart.utils.error(anychart.enums.ErrorCode.SCALE_NOT_SET);
        return this;
      }

      var levelsData = this.scale_.getLevelsData();
      for (i = 0, l = this.levels_.length; i < l; i++) {
        level = this.levels_[i];
        if (level.enabled()) {
          level.anchor(levelsData[i]['anchor']);
          level.interval(levelsData[i]['interval']);
          level.textFormatter(levelsData[i]['formatter']);
          level.invalidate(anychart.ConsistencyState.TIMELINE_HEADER_LEVEL_TICKS); //Scale is changed. It means that ticks must be recalculated anyway.
        }
      }
      this.markConsistent(anychart.ConsistencyState.TIMELINE_HEADER_SCALES);
    }

    if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
      this.bgRect_.fill(this.backgroundFill_);
      this.markConsistent(anychart.ConsistencyState.APPEARANCE);
    }

    if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
      this.getBase_().zIndex(/** @type {number} */ (this.zIndex()));
      this.markConsistent(anychart.ConsistencyState.Z_INDEX);
    }

    for (i = 0, l = this.levels_.length; i < l; i++) {
      level = this.levels_[i];
      if (level.enabled()) {
        level.resumeSignalsDispatching(false);
        level.draw();
      }
    }

    if (manualSuspend) stage.resume();
  }
  return this;
};



//----------------------------------------------------------------------------------------------------------------------
//
//  Timeline header level.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Single timeline header level.
 * @param {anychart.core.gantt.TimelineHeader} header - Parent header.
 * @constructor
 * @extends {anychart.core.VisualBaseWithBounds}
 */
anychart.core.gantt.TimelineHeader.Level = function(header) {
  goog.base(this);

  /**
   * Related scale.
   * @type {anychart.core.gantt.TimelineHeader}
   * @private
   */
  this.timelineHeader_ = header;

  /**
   * Level interval.
   * @type {goog.date.Interval}
   * @private
   */
  this.interval_ = null;

  /**
   * Anchor date.
   * @type {Date}
   * @private
   */
  this.anchor_ = null;

  /**
   * Labels factory.
   * @type {anychart.core.ui.LabelsFactory}
   * @private
   */
  this.labelsFactory_ = null;

  /**
   * Base layer.
   * @type {acgraph.vector.Layer}
   * @private
   */
  this.base_ = null;

  /**
   * Background rect.
   * @type {acgraph.vector.Path}
   * @private
   */
  this.bgRect_ = null;

  /**
   * Data grid bg.
   * @type {acgraph.vector.Fill}
   * @private
   */
  //this.backgroundFill_ = acgraph.vector.normalizeFill(['#f8f8f8', '#fff'], 90);
  this.backgroundFill_ = '#f7f7f7';

  /**
   * Ticks cache.
   * @type {Array.<number>}
   * @private
   */
  this.ticks_ = [];

  /**
   * Function that returns a text value for the tile.
   * Takes four arguments:
   *  1) Tile start date timestamp.
   *  2) Tile end date timestamp.
   *  3) Straight index of tile.
   *
   * @type {function(number, number, number):string}
   * @private
   */
  this.textFormatter_ = this.defaultTextFormatter_;

};
goog.inherits(anychart.core.gantt.TimelineHeader.Level, anychart.core.VisualBaseWithBounds);


/**
 * Supported signals.
 * @type {number}
 */
anychart.core.gantt.TimelineHeader.Level.SUPPORTED_SIGNALS = anychart.core.VisualBaseWithBounds.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistence states.
 * @type {number}
 */
anychart.core.gantt.TimelineHeader.Level.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBaseWithBounds.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.TIMELINE_HEADER_LEVEL_LABELS |
    anychart.ConsistencyState.TIMELINE_HEADER_LEVEL_TICKS;


/**
 * Default text formatter.
 * @param {number} startDate - Start date of tile timestamp.
 * @param {number} endDate - End date of tile timestamp.
 * @param {number} index - Straight index of tile.
 * @private
 * @return {string} - Formatted value.
 */
anychart.core.gantt.TimelineHeader.Level.prototype.defaultTextFormatter_ = function(startDate, endDate, index) {
  return (new Date(startDate)).toUTCString();
};


/**
 * Sets new text formatter.
 * @param {(function(number, number, number):string)=} opt_value - Value to be set.
 * @return {(function(number, number, number):string|anychart.core.gantt.TimelineHeader.Level)} - Current function or itself
 *  for method chaining.
 */
anychart.core.gantt.TimelineHeader.Level.prototype.textFormatter = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (goog.isFunction(opt_value)) {
      this.textFormatter_ = opt_value;
    } else {
      this.textFormatter_ = this.defaultTextFormatter_;
    }
    this.invalidate(anychart.ConsistencyState.TIMELINE_HEADER_LEVEL_LABELS, anychart.Signal.NEEDS_REDRAW);
    return this;
  }
  return this.textFormatter_;
};


/**
 * Inner getter for base layer.
 * @private
 * @return {acgraph.vector.Layer}
 */
anychart.core.gantt.TimelineHeader.Level.prototype.getBase_ = function() {
  if (!this.base_) {
    this.base_ = /** @type {acgraph.vector.Layer} */ (acgraph.layer());
    this.registerDisposable(this.base_);
  }
  return this.base_;
};


/**
 * Gets/sets new interval for level.
 * @param {goog.date.Interval=} opt_value - Value to be set.
 * @return {(goog.date.Interval|anychart.core.gantt.TimelineHeader.Level)} - Current value or itself for method chaining.
 */
anychart.core.gantt.TimelineHeader.Level.prototype.interval = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.interval_ != opt_value) {
      this.interval_ = opt_value;
      this.invalidate(anychart.ConsistencyState.TIMELINE_HEADER_LEVEL_TICKS, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.interval_;
};


/**
 * Gets/sets new anchor for level.
 * @param {Date=} opt_value - Value to be set.
 * @return {(Date|anychart.core.gantt.TimelineHeader.Level)} - Current value or itself for method chaining.
 */
anychart.core.gantt.TimelineHeader.Level.prototype.anchor = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.anchor_ != opt_value) {
      this.anchor_ = opt_value;
      this.invalidate(anychart.ConsistencyState.TIMELINE_HEADER_LEVEL_TICKS, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.anchor_;
};


/**
 * Gets current ticks.
 * @return {Array.<number>} - Ticks.
 */
anychart.core.gantt.TimelineHeader.Level.prototype.getTicks = function() {
  return this.ticks_;
};


/**
 * Inner getter for labels factory.
 * @private
 * @return {anychart.core.ui.LabelsFactory}
 */
anychart.core.gantt.TimelineHeader.Level.prototype.getLabelsFactory_ = function() {
  if (!this.labelsFactory_) {
    this.labelsFactory_ = new anychart.core.ui.LabelsFactory();
    var theme = anychart.getFullTheme();
    var lfGlobalConfig = theme['gantt']['base']['timeline']['header']['labelsFactory'];
    this.labelsFactory_.setup(lfGlobalConfig);

    this.labelsFactory_.container(this.getBase_());
    this.registerDisposable(this.labelsFactory_);
  }
  return this.labelsFactory_;
};


/**
 * Gets/sets background fill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.gantt.TimelineHeader.Level|string} - Current value or itself for method chaining.
 */
anychart.core.gantt.TimelineHeader.Level.prototype.backgroundFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var val = acgraph.vector.normalizeFill.apply(null, arguments);
    if (!anychart.color.equals(/** @type {acgraph.vector.Fill} */ (this.backgroundFill_), val)) {
      this.backgroundFill_ = val;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.backgroundFill_;
};


/**
 * Draws level.
 * @return {anychart.core.gantt.TimelineHeader.Level} - Itself for method chaining.
 */
anychart.core.gantt.TimelineHeader.Level.prototype.draw = function() {
  if (this.checkDrawingNeeded()) {
    var scale = this.timelineHeader_.scale();
    if (!scale) {
      anychart.utils.error(anychart.enums.ErrorCode.SCALE_NOT_SET);
      return this;
    }

    var redrawTicks = this.hasInvalidationState(anychart.ConsistencyState.BOUNDS) ||
        this.hasInvalidationState(anychart.ConsistencyState.TIMELINE_HEADER_LEVEL_TICKS) ||
        this.hasInvalidationState(anychart.ConsistencyState.TIMELINE_HEADER_LEVEL_LABELS);

    var container = /** @type {acgraph.vector.ILayer} */(this.container());
    var stage = container ? container.getStage() : null;
    var manualSuspend = stage && !stage.isSuspended();
    if (manualSuspend) stage.suspend();

    //Ensure DOM structure is created.
    if (!this.getBase_().numChildren()) {
      this.bgRect_ = this.getBase_().path();
      this.bgRect_.fill(this.backgroundFill_).stroke(null);
    }

    if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
      this.getBase_().parent(container);
      this.markConsistent(anychart.ConsistencyState.CONTAINER);
    }

    if (this.hasInvalidationState(anychart.ConsistencyState.TIMELINE_HEADER_LEVEL_TICKS)) {
      this.ticks_.length = 0;
      this.ticks_ = scale.getTicks(this.anchor_, this.interval_);
      this.markConsistent(anychart.ConsistencyState.TIMELINE_HEADER_LEVEL_TICKS);
    }

    if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
      this.pixelBoundsCache_ = this.getPixelBounds();
      this.getBase_().clip(/** @type {acgraph.math.Rect} */ (this.pixelBoundsCache_));
      this.markConsistent(anychart.ConsistencyState.BOUNDS);
    }

    if (this.hasInvalidationState(anychart.ConsistencyState.TIMELINE_HEADER_LEVEL_LABELS)) {
      this.markConsistent(anychart.ConsistencyState.TIMELINE_HEADER_LEVEL_LABELS);
    }

    if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
      this.bgRect_.fill(this.backgroundFill_);
      this.markConsistent(anychart.ConsistencyState.APPEARANCE);
    }

    if (redrawTicks) {
      this.bgRect_.clear();

      this.getLabelsFactory_().suspendSignalsDispatching();
      this.getLabelsFactory_().clear();

      for (var i = 0, l = this.ticks_.length - 1; i < l; i++) { //this.ticks_.length >= 2 anyway.
        var startTick = this.ticks_[i];
        var endTick = this.ticks_[i + 1];
        var startRatio = scale.timestampToRatio(startTick);
        var endRatio = scale.timestampToRatio(endTick);

        var left = this.pixelBoundsCache_.left + startRatio * this.pixelBoundsCache_.width;

        var tileActualWidth = this.pixelBoundsCache_.width * (endRatio - startRatio);

        this.bgRect_
            .moveTo(left + .5, this.pixelBoundsCache_.top)
            .lineTo(left + tileActualWidth - .5, this.pixelBoundsCache_.top)
            .lineTo(left + tileActualWidth - .5, this.pixelBoundsCache_.top + this.pixelBoundsCache_.height)
            .lineTo(left + .5, this.pixelBoundsCache_.top + this.pixelBoundsCache_.height)
            .close();

        var formatProvider = {'value': this.textFormatter_(startTick, endTick, i)};
        var labelWidth = this.getLabelsFactory_().measure(formatProvider).width;

        var labelLeft = this.calculateTileTextLeft_(left, tileActualWidth, labelWidth);

        var label = this.getLabelsFactory_().add(formatProvider,
            {'value': {'x': labelLeft, 'y': this.pixelBoundsCache_.top}});

        label.suspendSignalsDispatching();

        label.height(this.pixelBoundsCache_.height);

        startRatio = Math.max(startRatio, 0); //This aligns negative ratio to a visible area of level.
        endRatio = Math.min(endRatio, 1); //This prevents label overflow.
        var tileVisibleWidth = this.pixelBoundsCache_.width * (endRatio - startRatio);

        label.width(tileVisibleWidth);

        label.resumeSignalsDispatching(false);
      }

      this.getLabelsFactory_().resumeSignalsDispatching(false);
      this.getLabelsFactory_().draw();
    }

    if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
      this.markConsistent(anychart.ConsistencyState.Z_INDEX);
    }

    if (manualSuspend) stage.resume();

  }
  return this;
};


/**
 * Places a text in a tile correctly.
 * TODO (A.Kudryavtsev): Add illustrations.
 * @param {number} tileLeft - Tile left coordinate.
 * @param {number} tileWidth - Width of tile.
 * @param {number} textWidth - Width of text in label.
 * @return {number} - Left coordinate for label.
 * @private
 */
anychart.core.gantt.TimelineHeader.Level.prototype.calculateTileTextLeft_ = function(tileLeft, tileWidth, textWidth) {
  if (textWidth >= tileWidth) return tileLeft;

  var visLeft = this.pixelBoundsCache_.left;
  var visWidth = this.pixelBoundsCache_.width;

  var centeredLeft = tileLeft + (tileWidth - textWidth) / 2;

  if (centeredLeft < visLeft) return visLeft;
  if (centeredLeft + textWidth > visLeft + visWidth) return Math.max(visLeft + visWidth - textWidth, tileLeft); //This places label inside a tile.
  return centeredLeft;
};


