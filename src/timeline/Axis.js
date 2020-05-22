goog.provide('anychart.timelineModule.Axis');

goog.require('anychart.core.VisualBase');
goog.require('anychart.core.ui.LabelsSettings');
goog.require('anychart.core.ui.OptimizedText');
goog.require('anychart.format.Context');
goog.require('anychart.format.FormatSelector');
goog.require('anychart.math.Rect');
goog.require('anychart.reflow.IMeasurementsTargetProvider');
goog.require('anychart.timelineModule.AxisTicks');
goog.require('goog.math.Rect');



/**
 * Timeline Axis class.
 * @constructor
 * @extends {anychart.core.VisualBase}
 * @implements {anychart.reflow.IMeasurementsTargetProvider}
 */
anychart.timelineModule.Axis = function() {
  anychart.timelineModule.Axis.base(this, 'constructor');

  /**
   * Pixel coordinates of zero line.
   * Axis is drawn around this zero line.
   * @type {number}
   * @private
   */
  this.zero_ = 0;

  /**
   *
   * @type {Array.<anychart.core.ui.OptimizedText>}
   * @private
   */
  this.texts_ = [];

  /**
   * For reference take a look at {anychart.timelineModule.Axis.prototype.offset}
   * @type {number}
   * @private
   */
  this.offset_ = 0;

  /**
   * Format provider for labels
   * @type {anychart.format.Context}
   * @private
   */
  this.formatProvider_ = new anychart.format.Context();

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['stroke', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['fill', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['height', anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.AXIS_TICKS | anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEEDS_RECALCULATION]
  ]);
};
goog.inherits(anychart.timelineModule.Axis, anychart.core.VisualBase);


/**
 * Timeline Axis property descriptors.
 * @type {!Object<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.timelineModule.Axis.PROPERTY_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  var d = anychart.core.settings.descriptors;
  anychart.core.settings.createDescriptors(map, [
    d.STROKE,
    d.FILL,
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'height', anychart.core.settings.numberNormalizer]
  ]);

  return map;
})();
anychart.core.settings.populate(anychart.timelineModule.Axis, anychart.timelineModule.Axis.PROPERTY_DESCRIPTORS);


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.timelineModule.Axis.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES |
        anychart.ConsistencyState.APPEARANCE |
        anychart.ConsistencyState.AXIS_TITLE |
        anychart.ConsistencyState.AXIS_LABELS |
        anychart.ConsistencyState.AXIS_TICKS;


/**
 * Supported signals.
 * @type {number}
 */
anychart.timelineModule.Axis.prototype.SUPPORTED_SIGNALS =
    anychart.core.VisualBase.prototype.SUPPORTED_SIGNALS |
        anychart.Signal.NEEDS_RECALCULATION;


/**
 * Default format.
 * @type {string}
 * @const
 */
anychart.timelineModule.Axis.DEFAULT_FORMAT = 'yyyy/MM/dd\'T\'HH:mm:ss.SSS';


/**
 * Offset is a numeric value, representing current range offset.
 * The need for offset emerged from idea to draw only those ticks/labels, that are in current viewport.
 * This is because on high zoom values we receive as many, as thousands and even tens thousands ticks.
 * And drawing that much ticks/labels drastically slows rendering even with fast labels.
 * @param {number=} opt_value
 * @return {anychart.timelineModule.Axis|number}
 */
anychart.timelineModule.Axis.prototype.offset = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.offset_ != opt_value) {
      this.offset_ = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.AXIS_TICKS | anychart.ConsistencyState.AXIS_LABELS);
    }
    return this;
  }

  return this.offset_;
};


/**
 *
 * @param {Object=} opt_value
 * @return {anychart.scales.GanttDateTime|anychart.timelineModule.Axis}
 */
anychart.timelineModule.Axis.prototype.scale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (opt_value != this.scale_) {
      if (this.scale_) {
        this.scale_.unlistenSignals(this.scaleInvalidated_, this);
      }
      this.scale_ = opt_value;
      this.scale_.listenSignals(this.scaleInvalidated_, this);

    }
    return this;
  }

  return this.scale_;
};


/**
 * Scale signals listener.
 * @param {anychart.SignalEvent} event - Signal event.
 * @private
 */
anychart.timelineModule.Axis.prototype.scaleInvalidated_ = function(event) {
  this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.AXIS_TICKS | anychart.ConsistencyState.AXIS_LABELS, 0);
};


/**
 *
 * @param {Object=} opt_config
 * @return {anychart.timelineModule.AxisTicks|anychart.timelineModule.Axis}
 */
anychart.timelineModule.Axis.prototype.ticks = function(opt_config) {
  if (!this.ticks_) {
    this.ticks_ = new anychart.timelineModule.AxisTicks();
    this.setupCreated('ticks', this.ticks_);
    this.ticks_.listenSignals(this.ticksInvalidated_, this);
  }

  if (goog.isDef(opt_config)) {
    this.ticks_.setup(opt_config);
    return this;
  }

  return this.ticks_;
};


/**
 * Axis tick signals handler.
 * @param {anychart.SignalEvent} event - Signal event.
 * @private
 */
anychart.timelineModule.Axis.prototype.ticksInvalidated_ = function(event) {
  this.invalidate(anychart.ConsistencyState.AXIS_TICKS, anychart.Signal.NEEDS_REDRAW);
};


/**
 *
 * @param {Object=} opt_config
 * @return {anychart.core.ui.LabelsSettings|anychart.timelineModule.Axis}
 */
anychart.timelineModule.Axis.prototype.labels = function(opt_config) {
  if (!this.labelsSettings_) {
    this.labelsSettings_ = new anychart.core.ui.LabelsSettings();
    this.labelsSettings_.listenSignals(this.labelsSettingsInvalidated_, this);
    this.setupCreated('labels', this.labelsSettings_);
  }

  if (goog.isDef(opt_config)) {
    this.labelsSettings_.setup(opt_config);
    return this;
  }

  return this.labelsSettings_;
};


/**
 *
 * @param {anychart.SignalEvent} event - Signal event.
 * @private
 */
anychart.timelineModule.Axis.prototype.labelsSettingsInvalidated_ = function(event) {
  this.invalidate(anychart.ConsistencyState.AXIS_LABELS, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Timeline axis drawing.
 * @return {anychart.timelineModule.Axis}
 */
anychart.timelineModule.Axis.prototype.draw = function() {
  var scale = this.scale();

  this.provideMeasurements();

  if (!scale) {
    anychart.core.reporting.error(anychart.enums.ErrorCode.SCALE_NOT_SET);
    return this;
  }

  if (!this.checkDrawingNeeded()) {
    return this;
  }

  if (!this.rootElement) {
    this.rootElement = this.container().layer();
    if (!this.axisPath_) {
      this.axisPath_ = this.rootElement.path();
      this.axisStrokePath_ = this.rootElement.path();
      // One above default ticks z-index.
      this.axisStrokePath_.zIndex(37);
    }
    this.rootElement.addChild(this.getLabelsLayer_());
  }

  if (!this.formatSelector) {
    this.formatSelector = new anychart.format.FormatSelector();
    this.formatSelector.labels(/** @type {anychart.core.ui.LabelsSettings} */ (this.labels()));
    this.formatSelector.selectFormats();
    anychart.measuriator.register(this.formatSelector);
    this.formatSelector.dispatchSignal(anychart.Signal.MEASURE_COLLECT | anychart.Signal.MEASURE_BOUNDS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    this.rootElement.parent(this.container());
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    this.rootElement.zIndex(this.zIndex());
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.calculateZero();
    var bounds = this.parentBounds();
    var x = bounds.left;
    var height = /** @type {number} */(this.getOption('height'));
    var y = this.zero_ - height / 2;
    var width = bounds.width;
    this.axisBounds_ = new anychart.math.Rect(x, y, width, height);

    this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.AXIS_TICKS | anychart.ConsistencyState.AXIS_LABELS);
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    this.drawAxis();
    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.AXIS_TICKS)) {
    var axisTicks = this.getCreated('ticks');
    if (axisTicks) {
      axisTicks.container(this.rootElement);
      axisTicks.draw();

      var ticksArray = this.getTicks();
      var totalRange = this.scale().getTotalRange();

      var emptyScale = scale.isEmpty();

      if (emptyScale) {
        // in case of empty scale we only draw first tick
        ticksArray.length = 1;
      }

      for (var i = 0; i < ticksArray.length; i++) {
        var tick = ticksArray[i];
        var tickRatio = this.scale().transform(tick['start']);
        if (tick['start'] >= totalRange.min /*&& tick['start'] < totalRange['max']*/)
          axisTicks.drawTick(tickRatio, this.axisBounds_);
      }
    }

    this.markConsistent(anychart.ConsistencyState.AXIS_TICKS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.AXIS_TITLE)) {

    this.markConsistent(anychart.ConsistencyState.AXIS_TITLE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.AXIS_LABELS)) {
    if (this.labels().enabled()) {
      this.labelsLayer_.parent(this.rootElement);
      this.drawLabels();
    } else {
      this.labelsLayer_.parent(null);
    }
    this.markConsistent(anychart.ConsistencyState.AXIS_LABELS);
  }

  return this;
};


/**
 * Intervals in ascending order by their duration.
 * @type {Array.<anychart.enums.Interval>}
 * @private
 */
anychart.timelineModule.Axis.intervalsAscending_ = [
  anychart.enums.Interval.MILLISECOND,
  anychart.enums.Interval.SECOND,
  anychart.enums.Interval.MINUTE,
  anychart.enums.Interval.HOUR,
  anychart.enums.Interval.DAY,
  anychart.enums.Interval.WEEK,
  anychart.enums.Interval.THIRD_OF_MONTH,
  anychart.enums.Interval.MONTH,
  anychart.enums.Interval.QUARTER,
  anychart.enums.Interval.SEMESTER,
  anychart.enums.Interval.YEAR
];


/**
 * Returns ticks obtained from ganttDateTime scale.
 * @return {Array}
 */
anychart.timelineModule.Axis.prototype.getTicks = function() {
  var i;
  var ticksArray = [];
  var scale = this.scale();
  var zoomLevels = scale.getLevelsData();
  var range = scale.getRange();
  var minTicks = 4;
  var maxTicks = 10;


  for (i = 0; i < zoomLevels.length; i++) {
    ticksArray = scale.getTicks(void 0, void 0, zoomLevels[i]['unit'], zoomLevels[i]['count'], range);
    /*
    We do not want to have more than 10 ticks, normally.
    But if there are less than 3 ticks, we prefer to rollback to previous zoomLevel.
     */
    if (ticksArray.length <= maxTicks) {
      if (ticksArray.length < minTicks && i > 0) {
        ticksArray = scale.getTicks(void 0, void 0, zoomLevels[i - 1]['unit'], zoomLevels[i - 1]['count'], range);
        i--;
      }
      break;
    }
  }

  if (i == zoomLevels.length) {
    i--;
  }

  var unit = zoomLevels[i]['unit'];
  var count = zoomLevels[i]['count'];

  this.currentZoomLevel_ = {
    'unit': unit,
    'count': count
  };

  //apply offset to get ticks in the viewport
  range['min'] += this.offset_;
  range['max'] += this.offset_;

  ticksArray = scale.getTicks(void 0, void 0, unit, count, range);

  return ticksArray;
};


/**
 * Calculate zero line position.
 */
anychart.timelineModule.Axis.prototype.calculateZero = function() {
  var bounds = this.parentBounds();
  this.zero_ = bounds.top + bounds.height / 2;
};


/**
 *
 * @return {acgraph.vector.UnmanagedLayer}
 * @private
 */
anychart.timelineModule.Axis.prototype.getLabelsLayer_ = function() {
  if (!this.labelsLayer_) {
    this.labelsLayerEl_ = acgraph.getRenderer().createLayerElement();
    this.labelsLayer_ = acgraph.unmanagedLayer(this.labelsLayerEl_);
  }

  return this.labelsLayer_;
};


/**
 * Test draw ticks.
 */
anychart.timelineModule.Axis.prototype.drawLabels = function() {
  var ticksArray = this.getTicks();

  var scale = this.scale();

  var bounds = this.parentBounds();
  var height = /** @type {number} */(this.getOption('height'));
  var totalRange = scale.getTotalRange();
  var labelsSettings = this.labels();
  var currentUnit = this.currentZoomLevel_['unit'];
  var emptyScale = scale.isEmpty();
  if (emptyScale) {
    ticksArray.length = 1;
  }

  anychart.measuriator.measure();

  this.formatSelector.syncBoundsAfterMeasurement();

  for (var i = 0; i < ticksArray.length; i++) {
    var text = this.texts_[i];

    text.text(textString);
    text.style(labelsSettings.flatten());
    // text.prepareComplexity();
    text.applySettings();
    /*
    2 small lines of code and one big hack for the gradients.
    While playing with axis labels redrawing on scroll, wild bug appeared.
    If you zoom in and start scrolling to the right, when leftmost tick touches
    left viewport side all ticks disappear, but the last one.
    While they are drawn, they lack the fade gradient. Fade gradient id is set
    to the element, but it's not on the html page.
    What happens:
      1) we start drawing our label, set all the settings and call texts[i].putAt()
      2) texts[i] removes it's own gradient while processing putAt(), to be precise, it happens in texts[i].setupFadeGradient()
      3) while getting new gradient it grabs gradient of the texts[i + 1]
        (this happens, because new bounds and FadeGradientKeys happen to equal to those of the next text)
      4) i++
      5) goto 1; (texts[i + 1] happily removes it's own gradient, which is already given to previous text)
    Now, because we know all of that, we simply make first move and remove next text's gradient ourselves.
    Performance shouldn't be an issue, as in current implementation there shouldn't be more than ~15 texts.
     */
    if (i < ticksArray.length - 1)
      this.texts_[i + 1].removeFadeGradient();


    var tick = ticksArray[i];
    /*getTicks method almost always returns one tick that is below total range minimum.
    For now we skip it.*/
    if (tick['start'] < totalRange['min']) {
      text.renderTo(null);
      continue;
    }

    var parentUnit;

    switch (currentUnit) {
      case anychart.enums.Interval.MINUTE:
        parentUnit = anychart.enums.Interval.HOUR;
        break;
      case anychart.enums.Interval.HOUR:
        parentUnit = anychart.enums.Interval.DAY;
        break;
      case anychart.enums.Interval.DAY:
        parentUnit = anychart.enums.Interval.MONTH;
        break;
      default:
        parentUnit = anychart.enums.Interval.YEAR;
        break;
    }

    if (emptyScale) {
      currentUnit = anychart.enums.Interval.DAY;
      parentUnit = anychart.enums.Interval.YEAR;
    }

    var id = anychart.format.getIntervalIdentifier(/** @type {anychart.enums.Interval} */ (currentUnit), parentUnit, 'timeline');
    var selectedFormats = anychart.format.getDateTimeFormats(id);

    var startPx = bounds.left + bounds.width * scale.transform(tick['start']);
    var endPx = emptyScale ? bounds.left + bounds.width : bounds.left + bounds.width * scale.transform(tick['end']);
    var width = this.labels().padding().tightenWidth(endPx - startPx);

    var autoFormat;
    var formatIsSelected = false;
    var minFormatWidth = Infinity;
    var minWidthFormat = anychart.timelineModule.Axis.DEFAULT_FORMAT;

    for (var formatId = 0; formatId < selectedFormats.length; formatId++) {
      var format = selectedFormats[formatId];
      var autoFormatsMap = this.formatSelector.formatsMap;
      if (format in autoFormatsMap) {
        var w = Math.ceil(autoFormatsMap[format].width);
        if (anychart.DEBUG_MEASUREMENTS && isNaN(w))
          anychart.core.reporting.callLog('warn', 'DEBUG: Got NaN from format selector');
        if (w <= width) {
          autoFormat = format;
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
      autoFormat = minWidthFormat;
    }

    var textString = this.labels().getText(/** @type {anychart.format.Context} */(this.formatProvider_.propagate({
      'value': { value: anychart.format.dateTime(tick['start'], autoFormat), type: anychart.enums.TokenType.STRING},
      'tickValue': { value: tick['start'], type: anychart.enums.TokenType.NUMBER}
    })));

    text.text(textString);
    text.style(labelsSettings.flatten());
    // text.prepareComplexity();
    text.applySettings();

    var tickRatio = scale.transform(tick['start']);
    var tickEndTimestamp = Math.min(tick['end'], totalRange['max'] + this.offset_);
    var nextTickRatio = (scale.transform(tickEndTimestamp));

    if (height != 0) {
      text.renderTo(this.labelsLayerEl_);
    } else {
      text.renderTo(null);
    }

    var padding = this.labels().padding();

    var x = anychart.utils.applyPixelShift(bounds.left + bounds.width * tickRatio, 1);
    var y = Math.floor(this.zero_ - height / 2);
    var textHeight = height;
    width = endPx - startPx;
    var textBounds = padding.tightenBounds(new anychart.math.Rect(x, y, width, textHeight));
    text.putAt(textBounds, this.rootElement.getStage());
    // text.finalizeComplexity();
  }

  for (var i = ticksArray.length; i < this.texts_.length; i++) {
    this.texts_[i].renderTo(null);
  }
};


/**
 * Draws axis rectangle.
 */
anychart.timelineModule.Axis.prototype.drawAxis = function() {
  var bounds = this.parentBounds();
  var center = this.zero_;

  var height = /** @type {number} */(this.getOption('height'));
  var halfHeight = height / 2;
  this.axisPath_.clear();
  this.axisStrokePath_.clear();

  var stroke = /** @type {acgraph.vector.Stroke} */(this.getOption('stroke'));
  var fill = /** @type {acgraph.vector.Fill} */(this.getOption('fill'));

  var thickness = anychart.utils.extractThickness(stroke);

  var totalRange = this.scale().getTotalRange();
  var min = this.scale().transform(totalRange['min']);
  var max = this.scale().transform(totalRange['max'] + this.offset_);

  min = bounds.width * min;
  max = bounds.width * max;

  var left = min + bounds.left;
  var right = max + bounds.left;
  var top = center - halfHeight;
  var bottom = center + halfHeight;

  left = anychart.utils.applyPixelShift(left, thickness);
  right = anychart.utils.applyPixelShift(right, thickness);
  top = anychart.utils.applyPixelShift(top, thickness);
  bottom = anychart.utils.applyPixelShift(bottom, thickness);

  var clipRect = new goog.math.Rect(Math.floor(left), Math.floor(top),
      Math.ceil(right) - Math.floor(left),
      Math.ceil(bottom) - Math.floor(top));

  this.rootElement.clip(clipRect);

  if (height != 0) {
    this.axisPath_.moveTo(left, top).
        lineTo(right, top).
        lineTo(right, bottom).
        lineTo(left, bottom).close();

    this.axisStrokePath_.moveTo(left, top).
        lineTo(right, top).
        lineTo(right, bottom).
        lineTo(left, bottom).close();

    this.axisStrokePath_.stroke(stroke);
    this.axisPath_.fill(fill);
    this.axisPath_.stroke('none');
  }
};


/** @inheritDoc */
anychart.timelineModule.Axis.prototype.checkDrawingNeeded = function() {
  if (this.isConsistent())
    return false;

  if (!this.enabled()) {
    if (this.hasInvalidationState(anychart.ConsistencyState.ENABLED)) {
      this.remove();
      this.markConsistent(anychart.ConsistencyState.ENABLED);
      // this.title().invalidate(anychart.ConsistencyState.CONTAINER);
      // this.ticks().invalidate(anychart.ConsistencyState.CONTAINER);
      // this.minorTicks().invalidate(anychart.ConsistencyState.CONTAINER);
      // this.labels().invalidate(anychart.ConsistencyState.CONTAINER);
      // this.minorLabels().invalidate(anychart.ConsistencyState.CONTAINER);
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
anychart.timelineModule.Axis.prototype.remove = function() {
  if (this.rootElement) {
    this.rootElement.parent(null);
  }
};


/** @inheritDoc */
anychart.timelineModule.Axis.prototype.provideMeasurements = function() {
  var ticksArray = this.getTicks();
  if (!this.texts_.length) {
    for (var i = 0; i < ticksArray.length; i++) {
      var text = new anychart.core.ui.OptimizedText();
      this.texts_.push(text);
    }
  }

  // if there are not enough text elements - create additional texts.
  if (this.texts_.length < ticksArray.length) {
    for (var i = this.texts_.length; i < ticksArray.length; i++) {
      this.texts_.push(new anychart.core.ui.OptimizedText());
    }
  }

  return this.texts_;
};


/** @inheritDoc */
anychart.timelineModule.Axis.prototype.disposeInternal = function() {
  goog.disposeAll(this.ticks_, this.axisPath_, this.axisStrokePath_, this.labelsSettings_, this.texts_);
  this.ticks_ = null;
  this.axisPath_ = null;
  this.axisStrokePath_ = null;
  this.labelsSettings_ = null;
  this.texts_.length = 0;
  anychart.timelineModule.Axis.base(this, 'disposeInternal');
};


//region -- Exports
//exports
(function() {
  var proto = anychart.timelineModule.Axis.prototype;
  proto['ticks'] = proto.ticks;
  proto['labels'] = proto.labels;
  //auto
  //proto['stroke'] = proto.stroke;
  //proto['fill'] = proto.fill;
  //proto['height'] = proto.height;
})();
//exports
//endregion
