goog.provide('anychart.ganttModule.header.Header');

goog.require('anychart.core.VisualBase');
goog.require('anychart.core.ui.Background');
goog.require('anychart.core.ui.LabelsSettings');
goog.require('anychart.format.FormatSelector');
goog.require('anychart.ganttBaseModule.Overlay');
goog.require('anychart.ganttBaseModule.TimeLineHeaderLevelHolidaysSettings');
goog.require('anychart.ganttModule.header.Level');
goog.require('anychart.math.Rect');



//region -- Constructor.
/**
 * Gantt Chart Timeline header.
 * @param {anychart.ganttModule.TimeLine} timeline - Related timeline.
 * @constructor
 * @extends {anychart.core.VisualBase}
 */
anychart.ganttModule.header.Header = function(timeline) {
  anychart.ganttModule.header.Header.base(this, 'constructor');

  this.addThemes('defaultGanttHeader');

  /**
   * Related timeline.
   * @type {anychart.ganttModule.TimeLine}
   */
  this.timeline = timeline;

  /**
   * Root element of the timeline.
   * @type {acgraph.vector.Layer}
   * @private
   */
  this.rootElement_ = null;

  /**
   * Useless overlay for API compatibility.
   * @type {anychart.ganttBaseModule.Overlay}
   * @private
   */
  this.overlay_ = new anychart.ganttBaseModule.Overlay();

  /**
   * Background.
   * @type {anychart.core.ui.Background}
   * @private
   */
  this.background_ = null;


  /**
   * Labels settings.
   * @type {anychart.core.ui.LabelsSettings}
   * @private
   */
  this.labels_ = null;


  /**
   * Levels.
   * @type {Array.<anychart.ganttModule.header.Level>}
   * @private
   */
  this.levels_ = [];

  /**
   * Holidays settings.
   * TODO (A.Kudryavtsev): Dummy for a while. Will be implemented in future.
   * @type {anychart.ganttBaseModule.TimeLineHeaderLevelHolidaysSettings}
   * @private
   */
  this.holidays_ = new anychart.ganttBaseModule.TimeLineHeaderLevelHolidaysSettings();

  /**
   * Bounds.
   * @type {anychart.math.Rect|anychart.math.BoundsObject}
   * @private
   */
  this.bounds_ = {left: 0, top: 0, width: 0, height: 0};

  /**
   * Format selector.
   * Common selector for levels to avoid multiple format measurements.
   * @type {anychart.format.FormatSelector}
   */
  this.formatSelector = new anychart.format.FormatSelector();
  this.formatSelector.labels(/** @type {anychart.core.ui.LabelsSettings} */ (this.labels()));
  this.formatSelector.selectFormats();
  anychart.measuriator.register(this.formatSelector);

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['stroke', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['levelHeight', anychart.ConsistencyState.RESOURCE_TIMELINE_LEVELS, anychart.Signal.NEEDS_REDRAW, void 0, this.levelHeightBeforeInvalidation_],
    ['drawTopLine', 0, 0],
    ['drawRightLine', 0, 0],
    ['drawBottomLine', 0, 0],
    ['drawLeftLine', 0, 0]
  ]);

};
goog.inherits(anychart.ganttModule.header.Header, anychart.core.VisualBase);


//endregion.
//region -- Consistency and signals.
/**
 * Supported consistency states.
 * @type {number}
 */
anychart.ganttModule.header.Header.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.APPEARANCE | //Redraws stroke.
    anychart.ConsistencyState.RESOURCE_TIMELINE_LEVELS;


/**
 * Supported signals.
 * @type {number}
 */
anychart.ganttModule.header.Header.prototype.SUPPORTED_SIGNALS =
    anychart.core.VisualBase.prototype.SUPPORTED_SIGNALS;


//endregion
//region -- Descriptors.
/**
 * Descriptors.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.ganttModule.header.Header.DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'stroke', anychart.core.settings.strokeNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'levelHeight', anychart.core.settings.numberOrPercentNormalizer]
  ]);
  return map;
})();
anychart.core.settings.populate(anychart.ganttModule.header.Header, anychart.ganttModule.header.Header.DESCRIPTORS);


//endregion
//region -- Aliases.
/*
  Actually is @deprecated Since 8.5.0. Use header.labels() API instead.
 */
anychart.core.settings.populateAliases(anychart.ganttModule.header.Header,
    anychart.core.settings.TEXT_PROPS, 'labels');

anychart.core.settings.populateAliases(anychart.ganttModule.header.Header,
    ['fill'], 'background');


//endregion
//region -- Background.
/**
 * Getter/setter for background.
 * @param {(string|Object|null|boolean)=} opt_value .
 * @return {!(anychart.ganttModule.header.Header|anychart.core.ui.Background)} .
 */
anychart.ganttModule.header.Header.prototype.background = function(opt_value) {
  if (!this.background_) {
    this.background_ = new anychart.core.ui.Background();
    this.background_.needsForceSignalsDispatching(true);
    this.background_.addThemes('defaultGanttHeader.background');
    this.background_.listenSignals(this.backgroundInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    this.background_.setup(opt_value);
    return this;
  }
  return this.background_;
};


/**
 * Internal background invalidation handler.
 * @param {anychart.SignalEvent} event - Event object.
 * @private
 */
anychart.ganttModule.header.Header.prototype.backgroundInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
  }
};


//endregion
//region -- Labels.
/**
 * Labels getter/setter.
 * @param {Object=} opt_value - Config.
 * @return {anychart.ganttModule.header.Header|anychart.core.ui.LabelsSettings}
 */
anychart.ganttModule.header.Header.prototype.labels = function(opt_value) {
  if (!this.labels_) {
    this.labels_ = new anychart.core.ui.LabelsSettings();
    this.labels_.addThemes('ganttDefaultSimpleLabelsSettings', 'defaultLevelsLabelsSettings');
    this.labels_.needsForceSignalsDispatching(true);
    this.labels_.listenSignals(this.labelsInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    this.labels_.setup(opt_value);
    this.invalidate(anychart.ConsistencyState.RESOURCE_TIMELINE_LEVELS, anychart.Signal.NEEDS_REDRAW);
    return this;
  }

  return this.labels_;
};


/**
 * Labels invalidation handler.
 * @param {anychart.SignalEvent} e - Signal event.
 * @private
 */
anychart.ganttModule.header.Header.prototype.labelsInvalidated_ = function(e) {
  this.invalidate(anychart.ConsistencyState.RESOURCE_TIMELINE_LEVELS, anychart.Signal.NEEDS_REDRAW);
};


//endregion
//region -- Levels.
/**
 *
 * @param {(Object|boolean|null|number)=} opt_indexOrValue
 * @param {(Object|boolean|null)=} opt_value Chart
 * @return {anychart.ganttModule.header.Header|anychart.ganttModule.header.Level}
 */
anychart.ganttModule.header.Header.prototype.level = function(opt_indexOrValue, opt_value) {
  var value;
  var index = anychart.utils.toNumber(opt_indexOrValue);
  if (isNaN(index)) {
    index = 0;
    value = opt_indexOrValue;
  } else {
    index = /** @type {number} */(opt_indexOrValue);
    value = opt_value;
  }
  var level = this.levels_[index];
  if (!level) {
    this.levels_[index] = level = new anychart.ganttModule.header.Level(this, index);
    level.labels().parent(/** @type {anychart.core.ui.LabelsSettings} */ (this.labels()));
    level.listenSignals(this.levelInvalidated_, this);
    level.addThemes('defaultLevelSettings');
  }
  if (goog.isDef(value)) {
    level.setup(value);
    return this;
  }
  return level;
};


/**
 * Level signals handler.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.ganttModule.header.Header.prototype.levelInvalidated_ = function(e) {
  var state = 0;
  var signal = 0;
  if (e.hasSignal(anychart.Signal.ENABLED_STATE_CHANGED | anychart.Signal.BOUNDS_CHANGED)) {
    this.autoLevelHeight_ = null;
    state |= anychart.ConsistencyState.RESOURCE_TIMELINE_LEVELS;
    signal |= anychart.Signal.NEEDS_REDRAW;
  }

  if (e.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state |= anychart.ConsistencyState.RESOURCE_TIMELINE_LEVELS;
    signal |= anychart.Signal.NEEDS_REDRAW;
  }
  this.invalidate(state, signal);

};


/**
 * Levels getter.
 * @return {Array.<anychart.ganttModule.header.Level>}
 */
anychart.ganttModule.header.Header.prototype.getLevels = function() {
  return this.levels_;
};


/**
 * Internal method, used to propagate zooming settings to levels.
 * @param {Array.<anychart.scales.GanttDateTime.LevelData>} configs - Levels configurations.
 * @return {anychart.ganttModule.header.Header}
 */
anychart.ganttModule.header.Header.prototype.setLevels = function(configs) {
  for (var i = 0; i < configs.length; i++) {
    var config = configs[i];
    var level = this.levels_[i] || this.level(i);
    level.setupLevel(config);
  }
  this.invalidate(anychart.ConsistencyState.RESOURCE_TIMELINE_LEVELS, anychart.Signal.NEEDS_REDRAW);
  return this;
};


/**
 * Resets before autoLevelHeight_.
 * @private
 */
anychart.ganttModule.header.Header.prototype.levelHeightBeforeInvalidation_ = function() {
  this.autoLevelHeight_ = null;
};


//endregion
//region -- Bounds.
/**
 * Bounds setter.
 * NOTE: do not export.
 * @param {anychart.math.Rect|anychart.math.BoundsObject} bounds - Bounds to set.
 * @return {anychart.ganttModule.header.Header} - Self for chaining.
 */
anychart.ganttModule.header.Header.prototype.setBounds = function(bounds) {
  var b = this.bounds_;
  if (b.left != bounds.left || b.top != bounds.top || b.width != bounds.width || b.height != bounds.height) {
    this.bounds_ = bounds;
    this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.BOUNDS_CHANGED | anychart.Signal.NEEDS_REDRAW);
  }
  return this;
};


/**
 * Gets pixel bounds.
 * @return {anychart.math.Rect|anychart.math.BoundsObject} - Pixel bounds.
 */
anychart.ganttModule.header.Header.prototype.getPixelBounds = function() {
  return this.bounds_;
};


//endregion
//region -- Holidays.
/**
 * Holidays getter/setter.
 * Doesn't work for a while. Will be implemented later.
 * @param {Object=} opt_value
 * @return {anychart.ganttBaseModule.TimeLineHeaderLevelHolidaysSettings|anychart.ganttModule.header.Header}
 */
anychart.ganttModule.header.Header.prototype.holidays = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.holidays_.setup(opt_value);
    return this;
  }
  return this.holidays_;
};


//endregion
//region -- Draw.
/**
 * @private
 */
anychart.ganttModule.header.Header.prototype.ensureVisualReady_ = function() {
  if (!this.rootElement_) {
    this.rootElement_ = acgraph.layer();

    this.clip_ = acgraph.clip();
    this.rootElement_.clip(this.clip_);

    this.levelsLayer_ = this.rootElement_.layer();
  }
};


/**
 * Draws the header.
 */
anychart.ganttModule.header.Header.prototype.draw = function() {
  if (this.checkDrawingNeeded()) {
    var i, level;

    this.ensureVisualReady_();

    if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
      this.rootElement_.parent(/** @type {acgraph.vector.ILayer} */(this.container()));
      this.markConsistent(anychart.ConsistencyState.CONTAINER);
    }

    if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
      this.rootElement_.zIndex(/** @type {number} */(this.zIndex()));
      this.markConsistent(anychart.ConsistencyState.Z_INDEX);
    }

    if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
      this.formatSelector.syncBoundsAfterMeasurement();
      this.clip_.shape(this.bounds_);
      this.autoLevelHeight_ = null;

      this.invalidate(anychart.ConsistencyState.RESOURCE_TIMELINE_LEVELS);
      this.markConsistent(anychart.ConsistencyState.BOUNDS);
    }

    var redrawLevels = false;
    if (this.hasInvalidationState(anychart.ConsistencyState.RESOURCE_TIMELINE_LEVELS)) {
      redrawLevels = true;
      if (!goog.isDefAndNotNull(this.autoLevelHeight_)) { //block is used to define this.autoLevelHeight_.
        var definedHeightSum = 0;
        var autoHeightCount = 0;
        this.levelsHeights_ = [];

        for (i = 0; i < this.levels_.length; i++) {
          level = this.levels_[i];
          if (level && level['enabled']()) {
            var lHeight = /** @type {number|string} */ (level.getOption('height') || this.getOption('levelHeight'));
            if (goog.isDefAndNotNull(lHeight)) {
              lHeight = anychart.utils.normalizeSize(lHeight, this.bounds_.height);
              this.levelsHeights_[i] = lHeight;
              definedHeightSum += lHeight;
            } else {
              this.levelsHeights_[i] = null;
              autoHeightCount++;
            }
          }
        }

        this.autoLevelHeight_ = autoHeightCount ? Math.max(0, (this.bounds_.height - definedHeightSum) / autoHeightCount) : 0;
      }

      var accumulatedTop = this.bounds_.top + this.bounds_.height;
      for (i = 0; i < this.levels_.length; i++) {
        level = this.levels_[i];
        if (level) {
          if (level['enabled']()) {
            level.suspendSignalsDispatching();
            level.container(this.levelsLayer_);
            var h = this.levelsHeights_[i];
            h = goog.isDefAndNotNull(h) ? h : this.autoLevelHeight_;
            var top = accumulatedTop - h;
            var b = new anychart.math.Rect(this.bounds_.left, top, this.bounds_.width, h);
            anychart.utils.applyPixelShiftToRect(b, 0);
            level.setBounds(b);
            level.resumeSignalsDispatching(false);
            accumulatedTop -= h;
          } else {
            level.remove();
          }
        }
      }
      this.markConsistent(anychart.ConsistencyState.RESOURCE_TIMELINE_LEVELS);
    }

    if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
      redrawLevels = true;
      for (i = 0; i < this.levels_.length; i++) {
        level = this.levels_[i];
        if (level) {
          level.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.TIMELINE_HEADER_LEVEL_BACKGROUND);
        }
      }
      this.markConsistent(anychart.ConsistencyState.APPEARANCE);
    }

    if (redrawLevels) {
      for (i = 0; i < this.levels_.length; i++) {
        level = this.levels_[i];
        if (level) {
          level.draw();
        }
      }
    }

  }
};


//endregion
//region -- Serialization/deserialization.
/** @inheritDoc */
anychart.ganttModule.header.Header.prototype.serialize = function() {
  var json = anychart.ganttModule.header.Header.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.ganttModule.header.Header.DESCRIPTORS, json);

  json['levels'] = [];
  for (var i = 0; i < this.levels_.length; i++) {
    var level = this.levels_[i];
    if (level) {
      json['levels'].push(level.serialize());
    }
  }

  json['labels'] = this.labels().serialize();
  json['background'] = this.background().serialize();

  return json;
};


/** @inheritDoc */
anychart.ganttModule.header.Header.prototype.setupByJSON = function(config, opt_default) {
  anychart.ganttModule.header.Header.base(this, 'setupByJSON', config, opt_default);

  anychart.core.settings.deserialize(this, anychart.ganttModule.header.Header.DESCRIPTORS, config, opt_default);

  this.background().setupInternal(!!opt_default, config['background']);
  this.labels().setupInternal(!!opt_default, config['labels']);

  var levels = config['levels'];
  if (goog.isArray(levels)) {
    for (var i = 0; i < levels.length; i++) {
      this.level(i, levels[i]);
    }
  }

};


//endregion
//region -- Disposing.
/**
 * @inheritDoc
 */
anychart.ganttModule.header.Header.prototype.disposeInternal = function() {
  this.timeline = null;
  goog.disposeAll(this.levels_, this.formatSelector, this.holidays_, this.overlay_);
  this.levels_.length = 0;

  this.holidays_ = null;
  this.overlay_ = null;
  this.formatSelector = null;

  anychart.ganttModule.header.Header.base(this, 'disposeInternal');
};


//endregion
//exports
/**
 * @suppress {deprecated}
 */
(function() {
  var proto = anychart.ganttModule.header.Header.prototype;
  proto['background'] = proto.background;
  proto['level'] = proto.level;
  proto['labels'] = proto.labels;
  proto['getPixelBounds'] = proto.getPixelBounds;
})();


//endregion
