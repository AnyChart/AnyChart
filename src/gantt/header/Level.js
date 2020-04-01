goog.provide('anychart.ganttModule.header.Level');

goog.require('anychart.core.VisualBase');
goog.require('anychart.core.ui.Background');
goog.require('anychart.core.ui.LabelsSettings');
goog.require('anychart.core.ui.OptimizedText');
goog.require('anychart.format.Context');
goog.require('anychart.format.FormatSelector');
goog.require('anychart.math.Rect');
goog.require('goog.date.Interval');
goog.require('goog.date.UtcDateTime');



//region -- Constructor.
/**
 * Gantt Chart Timeline header level.
 * @param {anychart.ganttModule.header.Header} header - Related header.
 * @param {number} index - Level index.
 * @constructor
 * @extends {anychart.core.VisualBase}
 */
anychart.ganttModule.header.Level = function(header, index) {
  anychart.ganttModule.header.Level.base(this, 'constructor');

  /**
   *
   * @type {anychart.ganttModule.header.Header}
   * @private
   */
  this.header_ = header;

  /**
   * Related scale.
   * NOTE: we don't listen to scale because on scroll scale
   *  doesn't dispatch signals to avoid multiple redraw.
   *  Instead, level gets TIMELINE_HEADER_LEVEL_TICKS state from
   *  header (see level.setupLevel()).
   *
   * @type {anychart.scales.GanttDateTime}
   * @private
   */
  this.scale_ = /** @type {anychart.scales.GanttDateTime} */ (this.header_.timeline.scale());

  /**
   * Level index.
   * @type {number}
   * @private
   */
  this.index_ = index;

  /**
   * Attached format selector. Will be created if needed.
   * If not needed (and not created), header's formatSelector
   * will be used.
   * @type {anychart.format.FormatSelector}
   */
  this.formatSelector = null;

  /**
   * Labels settings.
   * @type {anychart.core.ui.LabelsSettings}
   * @private
   */
  this.labels_ = null;

  /**
   * Texts.
   * @type {Array.<anychart.core.ui.OptimizedText>}
   * @private
   */
  this.texts_ = [];

  /**
   * Background.
   * @type {anychart.core.ui.Background}
   * @private
   */
  this.background_ = null;

  /**
   *
   * @type {Array.<anychart.scales.GanttDateTime.Tick>}
   * @private
   */
  this.ticks_ = [];

  /**
   * Selected formats to use.
   * @type {Array.<string>}
   * @private
   */
  this.selectedFormats_ = [];

  /**
   * Selected auto format.
   * @type {string}
   * @private
   */
  this.autoFormat_ = anychart.format.FormatSelector.DEFAULT_FORMAT;

  /**
   * Bounds got from header to define the level position.
   * @type {anychart.math.Rect|anychart.math.BoundsObject}
   * @private
   */
  this.bounds_ = {left: 0, top: 0, width: 0, height: 0};

  /**
   * Level stroke path.
   * @type {acgraph.vector.Path}
   * @private
   */
  this.strokePath_ = null;

  /**
   * User defined formats.
   * @type {?(Array.<string>|string)}
   * @private
   */
  this.formats_ = null;

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['enabled', anychart.ConsistencyState.ENABLED, anychart.Signal.ENABLED_STATE_CHANGED],
    ['stroke', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['height', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED]
  ]);

  /**
   * Unit.
   * @type {anychart.enums.Interval|undefined}
   */
  this.unit = void 0;

  /**
   *
   * @type {number|undefined}
   */
  this.count = void 0;

};
goog.inherits(anychart.ganttModule.header.Level, anychart.core.VisualBase);


//endregion
//region -- Consistency and signals.
/**
 * Supported consistency states.
 * @type {number}
 */
anychart.ganttModule.header.Level.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.TIMELINE_HEADER_LEVEL_TICKS |
    anychart.ConsistencyState.TIMELINE_HEADER_LEVEL_LABELS |
    anychart.ConsistencyState.TIMELINE_HEADER_LEVEL_BACKGROUND |
    anychart.ConsistencyState.TIMELINE_HEADER_LEVEL_ZOOM;


/**
 * Supported signals.
 * @type {number}
 */
anychart.ganttModule.header.Level.prototype.SUPPORTED_SIGNALS =
    anychart.core.VisualBase.prototype.SUPPORTED_SIGNALS;


//endregion
//region -- Descriptors.
/**
 * Simple properties descriptors.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.ganttModule.header.Level.DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'enabled', anychart.core.settings.boolOrNullNormalizer],
    anychart.core.settings.descriptors.STROKE,
    anychart.core.settings.descriptors.HEIGHT
  ]);

  return map;
})();
anychart.core.settings.populate(anychart.ganttModule.header.Level, anychart.ganttModule.header.Level.DESCRIPTORS);


//endregion
//region -- Aliases.
anychart.core.settings.populateAliases(anychart.ganttModule.header.Level,
    anychart.core.settings.TEXT_PROPS, 'labels');

anychart.core.settings.populateAliases(anychart.ganttModule.header.Level,
    ['fill'], 'background');


//endregion
//region -- Background.
/**
 * Getter/setter for background.
 * @param {(string|Object|null|boolean)=} opt_value .
 * @return {!(anychart.ganttModule.header.Level|anychart.core.ui.Background)} .
 */
anychart.ganttModule.header.Level.prototype.background = function(opt_value) {
  if (!this.background_) {
    this.background_ = new anychart.core.ui.Background();
    this.background_.dropThemes();
    this.background_.parent(/** @type {anychart.core.ui.Background} */ (this.header_.background()));
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
anychart.ganttModule.header.Level.prototype.backgroundInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.invalidate(anychart.ConsistencyState.TIMELINE_HEADER_LEVEL_BACKGROUND, anychart.Signal.NEEDS_REDRAW);
  }
};


//endregion
//region -- Bounds.
/**
 * Sets bounds.
 * @param {anychart.math.Rect|anychart.math.BoundsObject} bounds - Bounds.
 * @return {anychart.ganttModule.header.Level}
 */
anychart.ganttModule.header.Level.prototype.setBounds = function(bounds) {
  var b = this.bounds_;
  if (b.left != bounds.left || b.top != bounds.top || b.width != bounds.width || b.height != bounds.height) {
    this.bounds_ = bounds;
    this.invalidate(anychart.ConsistencyState.BOUNDS);
  }
  return this;
};


//endregion
//region -- Formats.
/**
 * User defined formats getter-setter.
 * @param {?(Array.<string>|string)=} opt_value - Value to set. Setting the null value resets formats to
 *  the list defined in locale.
 * @return {?(anychart.ganttModule.header.Level|Array.<string>|string)}
 */
anychart.ganttModule.header.Level.prototype.formats = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.formats_ != opt_value) {
      this.formats_ = opt_value;
      this.initFormatSelector();
      if (this.formatSelector) {
        this.formatSelector.formats(this.formats_);
      }
      //Here TIMELINE_HEADER_LEVEL_ZOOM is invalidated to make level recalculate autoformat.
      this.invalidate(anychart.ConsistencyState.TIMELINE_HEADER_LEVEL_ZOOM | anychart.ConsistencyState.TIMELINE_HEADER_LEVEL_LABELS,
          anychart.Signal.NEEDS_REDRAW);
      return this;
    }
  }
  return this.formats_;
};


//endregion
//region -- Format selector.
/**
 * Initializes own format selector if needed.
 */
anychart.ganttModule.header.Level.prototype.initFormatSelector = function() {
  if (!this.formatSelector) {
    var createOwnFormatSelector = goog.isDefAndNotNull(this.formats_);
    if (this.labels_ && !goog.object.isEmpty(this.labels_.ownSettings))
      createOwnFormatSelector = true;

    if (createOwnFormatSelector) {
      this.formatSelector = new anychart.format.FormatSelector();
      this.formatSelector.labels(/** @type {anychart.core.ui.LabelsSettings} */ (this.labels()));
      anychart.measuriator.register(this.formatSelector);
    }
  }
};


//endregion
////region -- Labels.
/**
 * Labels getter/setter.
 * @param {Object=} opt_value - Config.
 * @return {anychart.ganttModule.header.Level|anychart.core.ui.LabelsSettings}
 */
anychart.ganttModule.header.Level.prototype.labels = function(opt_value) {
  if (!this.labels_) {
    this.labels_ = new anychart.core.ui.LabelsSettings();
    this.labels_.addThemes('ganttDefaultSimpleLabelsSettings', 'defaultLevelsLabelsSettings');
    this.labels_.parent(/** @type {anychart.core.ui.LabelsSettings} */ (this.header_.labels()));
    this.labels_.listenSignals(this.labelsInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    this.labels_.setup(opt_value);
    this.invalidate(anychart.ConsistencyState.TIMELINE_HEADER_LEVEL_LABELS, anychart.Signal.NEEDS_REDRAW);
    return this;
  }

  return this.labels_;
};


/**
 * Labels invalidation handler.
 * @param {anychart.SignalEvent} e - Signal event.
 * @private
 */
anychart.ganttModule.header.Level.prototype.labelsInvalidated_ = function(e) {
  var justCreated = false;
  if (!this.formatSelector) {
    this.initFormatSelector();
    justCreated = !!this.formatSelector;
  }

  //This condition allows to avoid double labels signals dispatching from formatSelector.
  if (justCreated) {
    this.formatSelector.dispatchSignal(anychart.Signal.MEASURE_COLLECT | anychart.Signal.MEASURE_BOUNDS);
    this.formatSelector.labelsInvalidated(e);
  }

  this.invalidate(anychart.ConsistencyState.TIMELINE_HEADER_LEVEL_LABELS, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Gets format provider for label.
 * @param {anychart.scales.GanttDateTime.Tick} tick - tick.
 * @param {string} format Label format.
 * @return {anychart.core.BaseContext} Labels format provider.
 * @private
 */
anychart.ganttModule.header.Level.prototype.getLabelsFormatProvider_ = function(tick, format) {
  var start = tick['start'];
  var end = tick['end'];

  var startLabelText = anychart.format.dateTime(start, format);
  var endLabelText = anychart.format.dateTime(end, format);

  var fiscalStartLabelText = startLabelText;
  var fiscalStartMonth = /** @type {number} */ (this.scale_.fiscalYearStartMonth());

  // DVF-4399.
  var fiscalYearShift = /** @type {number} */ (this.scale_.fiscalYearOffset());

  if (fiscalStartMonth > 1) {
    var fiscalStart;
    if (this.unit === anychart.enums.Interval.YEAR ||
        this.unit === anychart.enums.Interval.SEMESTER ||
        this.unit === anychart.enums.Interval.QUARTER) {
      // DVF-4399.
      fiscalStart = anychart.utils.getFiscalDate(start, fiscalStartMonth, fiscalYearShift);
      fiscalStartLabelText = anychart.format.dateTime(fiscalStart, format);
    } else if (goog.string.contains(format, 'y') || goog.string.contains(format, 'Q')) {
      var utcStartDate = new goog.date.UtcDateTime(new Date(start));
      var month = utcStartDate.getMonth() + 1;

      // DVF-4399.
      var yearChangeShift = month < fiscalStartMonth ? -1 : 0;
      fiscalStart = anychart.utils.shiftDateByInterval(start, anychart.enums.Interval.YEAR, fiscalYearShift + yearChangeShift);
      fiscalStartLabelText = anychart.format.dateTime(fiscalStart, format);
    }
  }

  //TODO (A.Kudryavtsev): Add fiscal formatted values.
  var context = new anychart.format.Context({
    'value': {value: fiscalStartLabelText, type: anychart.enums.TokenType.STRING},
    'tickValue': {value: start, type: anychart.enums.TokenType.NUMBER},
    'scale': {value: this.scale_, type: anychart.enums.TokenType.UNKNOWN},
    'end': {value: end, type: anychart.enums.TokenType.NUMBER},
    'endValue': {value: endLabelText, type: anychart.enums.TokenType.STRING},
    'unit': {value: this.unit, type: anychart.enums.TokenType.STRING},
    'count': {value: this.count, type: anychart.enums.TokenType.NUMBER}
  });

  return context.propagate();
};


//endregion
//region -- Scale.
/**
 * Level zooming setup.
 * @param {anychart.scales.GanttDateTime.LevelData} config - Level config.
 */
anychart.ganttModule.header.Level.prototype.setupLevel = function(config) {
  if (this.unit != config['unit'] || this.count != config['count']) {
    this.unit = config['unit'];
    this.count = config['count'];
    this.invalidate(anychart.ConsistencyState.TIMELINE_HEADER_LEVEL_ZOOM);
  }
  this.invalidate(anychart.ConsistencyState.TIMELINE_HEADER_LEVEL_TICKS);
};


//endregion
//region -- Utils.
/**
 * The lowest level has lowest index.
 * @return {?anychart.ganttModule.header.Level} - Parent level.
 */
anychart.ganttModule.header.Level.prototype.getParentLevel = function() {
  var levels = this.header_.getLevels();
  for (var i = this.index_; i < levels.length; i++) {
    var level = levels[i + 1];
    if (level) {
      return level;
    }
  }
  return null;
};


//endregion
//region -- DOM.
/**
 * Initializes DOM elements.
 */
anychart.ganttModule.header.Level.prototype.initDom = function() {
  if (!this.rootLayer_) {
    this.rootLayer_ = acgraph.layer();

    this.background().container(this.rootLayer_);

    this.labelsLayerEl_ = acgraph.getRenderer().createLayerElement();
    this.labelsLayer_ = acgraph.unmanagedLayer(this.labelsLayerEl_);
    this.labelsLayer_.zIndex(1);
    this.labelsLayer_.parent(this.rootLayer_);

    this.strokePath_ = this.rootLayer_.path();
    this.strokePath_.zIndex(2);

  }
};


//endregion
//region -- Drawing.
/**
 * Draw.
 */
anychart.ganttModule.header.Level.prototype.draw = function() {
  if (this.checkDrawingNeeded()) {
    var i, tick, left, width;

    this.initDom();

    if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
      this.rootLayer_.parent(/** @type {acgraph.vector.ILayer} */(this.container()));
      this.markConsistent(anychart.ConsistencyState.CONTAINER);
    }

    if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
      this.invalidate(anychart.ConsistencyState.TIMELINE_HEADER_LEVEL_TICKS |
              anychart.ConsistencyState.TIMELINE_HEADER_LEVEL_ZOOM |
              anychart.ConsistencyState.TIMELINE_HEADER_LEVEL_BACKGROUND);
      this.markConsistent(anychart.ConsistencyState.BOUNDS);
    }

    if (this.hasInvalidationState(anychart.ConsistencyState.TIMELINE_HEADER_LEVEL_BACKGROUND)) {
      var background = this.background();
      background.suspendSignalsDispatching();
      background.parentBounds(this.bounds_);
      background.draw();
      background.resumeSignalsDispatching(false);
      this.markConsistent(anychart.ConsistencyState.TIMELINE_HEADER_LEVEL_BACKGROUND);
    }

    if (this.hasInvalidationState(anychart.ConsistencyState.TIMELINE_HEADER_LEVEL_ZOOM)) {
      if (goog.isDefAndNotNull(this.formats_)) {
        this.selectedFormats_ = goog.isArray(this.formats_) ? this.formats_ : [this.formats_];
      } else {
        var parentLevel = this.getParentLevel();
        var parentLevelUnit;
        if (parentLevel) {
          parentLevelUnit = /** @type {anychart.enums.Interval} */ (parentLevel.unit);
          if (parentLevelUnit != this.unit)
            parentLevelUnit = anychart.utils.getParentInterval(parentLevelUnit, -1);
        }
        var id = anychart.format.getIntervalIdentifier(/** @type {anychart.enums.Interval} */ (this.unit), parentLevelUnit, 'timeline');
        this.selectedFormats_ = anychart.format.getDateTimeFormats(id);
      }
      this.autoFormat_ = this.selectedFormats_[0] || this.autoFormat_;

      this.invalidate(anychart.ConsistencyState.TIMELINE_HEADER_LEVEL_TICKS);
      this.markConsistent(anychart.ConsistencyState.TIMELINE_HEADER_LEVEL_ZOOM);
    }

    //Getting ticks.
    if (this.hasInvalidationState(anychart.ConsistencyState.TIMELINE_HEADER_LEVEL_TICKS)) {
      this.ticks_ = this.scale_.getTicks(NaN, NaN, /** @type {anychart.enums.Interval} */ (this.unit), /** @type {number} */ (this.count));
      var firstTick = this.ticks_[0];

      var startPx = this.bounds_.left + this.scale_.transform(firstTick['start']) * this.bounds_.width;
      var endPx = this.bounds_.left + this.scale_.transform(firstTick['end']) * this.bounds_.width;

      /*
        width and w (see below) are taken as Math.ceil() to skip the difference
        less than 1 pixel and maximize the available width. In this case we will
        see not more than singe pixel text fade for text overflow.

        Also take a look at condition below:
          {code}
            if (w <= width)
              ...
          {code}
        Value, rounded with Math.ceil() suits this condition even if text actual
        width exceeds row width. The difference is still not more than one pixel.
       */
      width = Math.ceil(this.labels().padding().tightenWidth(endPx - startPx));

      var formatSelector = this.formatSelector || this.header_.formatSelector;
      formatSelector.syncBoundsAfterMeasurement();

      var formatIsSelected = false;
      var minFormatWidth = Infinity;
      var minWidthFormat = this.autoFormat_;

      for (i = 0; i < this.selectedFormats_.length; i++) {
        var format = this.selectedFormats_[i];
        var autoFormatsMap = formatSelector.formatsMap;
        if (format in autoFormatsMap) {
          var w = Math.ceil(autoFormatsMap[format].width);
          if (anychart.DEBUG_MEASUREMENTS && isNaN(w))
            anychart.core.reporting.callLog('warn', 'DEBUG: Got NaN from format selector');
          if (w <= width) {
            this.autoFormat_ = format;
            formatIsSelected = true;
            break;
          }
          if (w <= minFormatWidth) {
            minFormatWidth = w;
            minWidthFormat = format;
          }
        } else if (anychart.DEBUG_MEASUREMENTS)
          anychart.core.reporting.callLog('warn', 'DEBUG: Auto format selection issue to debug.');
      }

      if (!formatIsSelected) {
        /*
          This case is possible when all formats widths exceed width of level tile.
          In this case we just select minimum width format.
         */
        this.autoFormat_ = minWidthFormat;
      }
      this.invalidate(anychart.ConsistencyState.TIMELINE_HEADER_LEVEL_LABELS | anychart.ConsistencyState.APPEARANCE);
      this.markConsistent(anychart.ConsistencyState.TIMELINE_HEADER_LEVEL_TICKS);
    }

    //Decorating labels.
    if (this.hasInvalidationState(anychart.ConsistencyState.TIMELINE_HEADER_LEVEL_LABELS)) {
      for (i = 0; i < this.ticks_.length; i++) {
        tick = this.ticks_[i];
        var t = this.texts_[i] || (this.texts_[i] = new anychart.core.ui.OptimizedText());
        var context = this.getLabelsFormatProvider_(tick, this.autoFormat_);
        var textVal = this.labels().getText(/** @type {anychart.format.Context} */ (context));
        t.text(textVal);
        t.style(this.labels().flatten());

        /*
          DEV NOTE: these texts are not ready to provide complex text
          features like aligning or multiline with \n or wordBreak.
          That's why we don't use prepareComplexity() and finalizeComplexity(),
          that's why level itself is not anychart.reflow.IMeasurementsTargetProvider
          and this.texts_ is an array of not measured texts.

          Probably, it is an issue for future improvements.
         */

        t.applySettings();
        t.renderTo(this.labelsLayerEl_);

        var ratio = Math.max(0, this.scale_.transform(tick['start']));
        left = this.bounds_.left + ratio * this.bounds_.width;
        left = /** @type {number} */ (left + this.labels().padding().getOption('left'));
        var right = this.bounds_.left + this.scale_.transform(tick['end']) * this.bounds_.width;
        var rightPadding = /** @type {number} */ (this.labels().padding().getOption('right'));
        width = Math.max(0, right - left - rightPadding);
        var bounds = new anychart.math.Rect(left, this.bounds_.top, width, this.bounds_.height);
        t.putAt(bounds, this.container().getStage());
      }
      for (var j = i, l = this.texts_.length; j < l; j++) {
        var textToHide = this.texts_[j];
        textToHide.renderTo(null);
        textToHide.removeFadeGradient();
      }

      this.markConsistent(anychart.ConsistencyState.TIMELINE_HEADER_LEVEL_LABELS);
    }

    if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
      this.strokePath_.clear();
      var stroke = /** @type {acgraph.vector.Stroke} */ (this.getOption('stroke') || this.header_.getOption('stroke'));
      var thickness = anychart.utils.extractThickness(stroke);
      var top = anychart.utils.applyPixelShift(this.bounds_.top, thickness);
      this.strokePath_
          .stroke(stroke)
          .moveTo(this.bounds_.left, top)
          .lineTo(this.bounds_.left + this.bounds_.width, top);

      for (i = 0; i < this.ticks_.length; i++) {
        tick = this.ticks_[i];
        left = this.bounds_.left + this.scale_.transform(tick['start']) * this.bounds_.width;
        left = anychart.utils.applyPixelShift(left, thickness);
        this.strokePath_
            .moveTo(left, top)
            .lineTo(left, this.bounds_.top + this.bounds_.height);
      }

      this.markConsistent(anychart.ConsistencyState.APPEARANCE);
    }

  }
};


//endregion
//region -- Remove.
/**
 * Remove.
 */
anychart.ganttModule.header.Level.prototype.remove = function() {
  if (this.rootLayer_) this.rootLayer_.parent(null);
};


//endregion
//region -- Serialize/Deserialize.
/**
 * @inheritDoc
 */
anychart.ganttModule.header.Level.prototype.serialize = function() {
  var json = anychart.ganttModule.header.Level.base(this, 'serialize');

  anychart.core.settings.serialize(this, anychart.ganttModule.header.Level.DESCRIPTORS, json);

  if (!goog.object.isEmpty(this.background().ownSettings)) {
    json['background'] = this.background().serialize();
  }

  var labels = this.labels().serialize();
  if (!goog.object.isEmpty(labels))
    json['labels'] = labels;

  if (this.formats_)
    json['formats'] = this.formats_;

  return json;
};


/**
 * @inheritDoc
 */
anychart.ganttModule.header.Level.prototype.setupByJSON = function(config, opt_default) {
  anychart.ganttModule.header.Level.base(this, 'setupByJSON', config, opt_default);

  anychart.core.settings.deserialize(this, anychart.ganttModule.header.Level.DESCRIPTORS, config, opt_default);

  this.labels().suspendSignalsDispatching();
  for (var i = 0; i < anychart.core.settings.TEXT_PROPS.length; i++) {
    var prop = anychart.core.settings.TEXT_PROPS[i];
    if (prop in config) {
      this.labels()[prop](config[prop]);
    }
  }
  this.labels_.resumeSignalsDispatching(true);

  this.background().setupInternal(!!opt_default, config['background']);
  this.labels_.setupInternal(!!opt_default, config['labels']);

  if ('formats' in config)
    this.formats(config['formats']);
};


//endregion
//region -- Disposing.
/**
 * @inheritDoc
 */
anychart.ganttModule.header.Level.prototype.disposeInternal = function() {
  goog.disposeAll(this.strokePath_, this.background_);

  if (this.formatSelector) {
    goog.dispose(this.formatSelector);
  }

  this.strokePath_ = null;
  this.background_ = null;
  this.header_ = null;
  this.scale_ = null;
  this.formatSelector = null;

  for (var i = 0; i < this.texts_.length; i++) {
    var t = this.texts_[i];
    t.dispose();
  }

  anychart.ganttModule.header.Level.base(this, 'disposeInternal');
};


//endregion
//region -- Exports.
//exports
/**
 * @suppress {deprecated}
 */
(function() {
  var proto = anychart.ganttModule.header.Level.prototype;
  proto['labels'] = proto.labels;
  proto['background'] = proto.background;
  proto['formats'] = proto.formats;
})();


//endregion
