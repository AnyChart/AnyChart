//region --- Provide & Require
goog.provide('anychart.core.resource.TimeLine');
goog.require('anychart.core.VisualBaseWithBounds');
goog.require('anychart.core.resource.TimeLineLevelHolidaysSettings');
goog.require('anychart.core.settings');
goog.require('anychart.core.ui.Background');
goog.require('anychart.core.ui.LabelsFactory');
goog.require('anychart.core.ui.Overlay');
goog.require('anychart.core.utils.Padding');
//endregion



/**
 * Resource Chart Timeline element.
 * @constructor
 * @extends {anychart.core.VisualBaseWithBounds}
 * @implements {anychart.core.settings.IObjectWithSettings}
 * @implements {anychart.core.settings.IResolvable}
 */
anychart.core.resource.TimeLine = function() {
  anychart.core.resource.TimeLine.base(this, 'constructor');

  /**
   * Root element of the timeline.
   * @type {acgraph.vector.Layer}
   * @private
   */
  this.rootElement_ = null;

  /**
   * Pixel bounds cache.
   * @type {anychart.math.Rect}
   * @private
   */
  this.pixelBoundsCache_ = null;

  this.overlay_ = new anychart.core.ui.Overlay();
  this.overlay_.listenSignals(this.overlaySignal_, this);

  /**
   * Background.
   * @type {anychart.core.ui.Background}
   * @private
   */
  this.background_ = new anychart.core.ui.Background();
  this.background_.listenSignals(this.handleBackgroundSignal_, this);

  /**
   * Padding.
   * @type {anychart.core.utils.Padding}
   * @private
   */
  this.padding_ = new anychart.core.utils.Padding();
  this.padding_.listenSignals(this.paddingInvalidated_, this);

  /**
   * Holidays settings.
   * @type {anychart.core.resource.TimeLineLevelHolidaysSettings}
   * @private
   */
  this.holidays_ = new anychart.core.resource.TimeLineLevelHolidaysSettings();
  this.holidays_.parent(this);
  this.holidays_.listenSignals(this.holidaysInvalidated_, this);

  /**
   * X scale holder.
   * @type {anychart.scales.DateTimeWithCalendar}
   * @private
   */
  this.xScale_ = null;

  /**
   * Settings holder.
   * @type {!Object}
   */
  this.settings = {};

  /**
   * Default settings holder.
   * @type {!Object}
   */
  this.defaultSettings = {};

  /**
   * Parent title.
   * @type {anychart.core.resource.TimeLine}
   * @private                                                                                        `
   */
  this.parent_ = null;

  /**
   * Resolution chain cache.
   * @type {?Array.<Object|null|undefined>}
   * @private
   */
  this.resolutionChainCache_ = null;
};
goog.inherits(anychart.core.resource.TimeLine, anychart.core.VisualBaseWithBounds);


//region --- Typedefs
//------------------------------------------------------------------------------
//
//  Typedefs
//
//------------------------------------------------------------------------------
/**
 * Time line level definition.
 * @typedef {{
 *   unit: (anychart.enums.Interval|undefined),
 *   count: (number|undefined),
 *   formats: (string|Array.<string>|undefined),
 *   height: (number|string|undefined),
 *   holiday: Object.<{
 *      fill: (acgraph.vector.Fill|undefined),
 *      padding: (Object|Array|number|string|null|undefined),
 *      minFontSize: (number|undefined),
 *      maxFontSize: (number|undefined),
 *      adjustFontSize: (boolean|Array.<boolean, boolean>|{width:boolean,height:boolean}|undefined),
 *      fontSize: (number|undefined),
 *      fontFamily: (string|undefined),
 *      fontColor: (string|undefined),
 *      fontOpacity: (number|undefined),
 *      fontDecoration: (anychart.enums.TextDecoration|string|undefined),
 *      fontStyle: (anychart.enums.FontStyle|string|undefined),
 *      fontVariant: (anychart.enums.FontVariant|string|undefined),
 *      fontWeight: (string|number|undefined),
 *      letterSpacing: (number|string|undefined),
 *      textDirection: (anychart.enums.TextDirection|string|undefined),
 *      lineHeight: (number|string|undefined),
 *      textIndent: (number|undefined),
 *      vAlign: (anychart.enums.VAlign|string|undefined),
 *      hAlign: (anychart.enums.HAlign|string|undefined),
 *      textWrap: (anychart.enums.TextWrap|string|undefined),
 *      textOverflow: (acgraph.vector.Text.TextOverflow|string|undefined),
 *      selectable: (boolean|undefined),
 *      disablePointerEvents: (boolean|undefined),
 *      useHtml: (boolean|undefined),
 *      textFormatter: (Function|undefined)
 *   }>,
 *   fill: (acgraph.vector.Fill|undefined),
 *   padding: (Object|Array|number|string|null|undefined),
 *   minFontSize: (number|undefined),
 *   maxFontSize: (number|undefined),
 *   adjustFontSize: (boolean|Array.<boolean, boolean>|{width:boolean,height:boolean}|undefined),
 *   fontSize: (number|undefined),
 *   fontFamily: (string|undefined),
 *   fontColor: (string|undefined),
 *   fontOpacity: (number|undefined),
 *   fontDecoration: (anychart.enums.TextDecoration|string|undefined),
 *   fontStyle: (anychart.enums.FontStyle|string|undefined),
 *   fontVariant: (anychart.enums.FontVariant|string|undefined),
 *   fontWeight: (string|number|undefined),
 *   letterSpacing: (number|string|undefined),
 *   textDirection: (anychart.enums.TextDirection|string|undefined),
 *   lineHeight: (number|string|undefined),
 *   textIndent: (number|undefined),
 *   vAlign: (anychart.enums.VAlign|string|undefined),
 *   hAlign: (anychart.enums.HAlign|string|undefined),
 *   textWrap: (anychart.enums.TextWrap|string|undefined),
 *   textOverflow: (acgraph.vector.Text.TextOverflow|string|undefined),
 *   selectable: (boolean|undefined),
 *   disablePointerEvents: (boolean|undefined),
 *   useHtml: (boolean|undefined),
 *   textFormatter: (Function|undefined)
 * }}
 */
anychart.core.resource.TimeLine.Level;


//endregion
//region --- Infrastructure
//------------------------------------------------------------------------------
//
//  Infrastructure
//
//------------------------------------------------------------------------------
/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.resource.TimeLine.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBaseWithBounds.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.RESOURCE_TIMELINE_BACKGROUND |
    anychart.ConsistencyState.RESOURCE_TIMELINE_TICKS |
    anychart.ConsistencyState.RESOURCE_TIMELINE_LABELS |
    anychart.ConsistencyState.RESOURCE_TIMELINE_LEVELS |
    anychart.ConsistencyState.RESOURCE_TIMELINE_OVERLAY;


/**
 * Supported signals.
 * @type {number}
 */
anychart.core.resource.TimeLine.prototype.SUPPORTED_SIGNALS =
    anychart.core.VisualBaseWithBounds.prototype.SUPPORTED_SIGNALS;


//endregion
//region --- Settings
//------------------------------------------------------------------------------
//
//  Settings
//
//------------------------------------------------------------------------------
/**
 * Text descriptors.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.resource.TimeLine.TEXT_DESCRIPTORS =
    anychart.core.settings.createTextPropertiesDescriptors(
        anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.BOUNDS,
        anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.BOUNDS,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED,
        anychart.Signal.NEEDS_REDRAW
    );
anychart.core.resource.TimeLine.TEXT_DESCRIPTORS['textFormatter'] =
    anychart.core.settings.createDescriptor(
        anychart.enums.PropertyHandlerType.SINGLE_ARG,
        'textFormatter',
        anychart.core.settings.asIsNormalizer,
        anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.BOUNDS,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
anychart.core.settings.populate(anychart.core.resource.TimeLine, anychart.core.resource.TimeLine.TEXT_DESCRIPTORS);


/**
 * Properties that should be defined in anychart.core.resource.TimeLine prototype.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.resource.TimeLine.DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  map['stroke'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'stroke',
      anychart.core.settings.strokeNormalizer,
      anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW);

  map['fill'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'fill',
      anychart.core.settings.fillNormalizer,
      anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW);

  map['levelHeight'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'levelHeight',
      anychart.core.settings.numberOrPercentNormalizer,
      anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW);

  map['drawTopLine'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'drawTopLine',
      anychart.core.settings.booleanNormalizer,
      anychart.ConsistencyState.RESOURCE_LIST_ITEMS,
      anychart.Signal.NEEDS_REDRAW);

  map['drawRightLine'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'drawRightLine',
      anychart.core.settings.booleanNormalizer,
      anychart.ConsistencyState.RESOURCE_LIST_ITEMS,
      anychart.Signal.NEEDS_REDRAW);

  map['drawBottomLine'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'drawBottomLine',
      anychart.core.settings.booleanNormalizer,
      anychart.ConsistencyState.RESOURCE_LIST_ITEMS,
      anychart.Signal.NEEDS_REDRAW);

  map['drawLeftLine'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'drawLeftLine',
      anychart.core.settings.booleanNormalizer,
      anychart.ConsistencyState.RESOURCE_LIST_ITEMS,
      anychart.Signal.NEEDS_REDRAW);

  return map;
})();
anychart.core.settings.populate(anychart.core.resource.TimeLine, anychart.core.resource.TimeLine.DESCRIPTORS);


/**
 * Getter/setter for xScale.
 * @param {anychart.scales.DateTimeWithCalendar=} opt_value
 * @return {anychart.scales.DateTimeWithCalendar|anychart.core.resource.TimeLine}
 */
anychart.core.resource.TimeLine.prototype.xScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.xScale_ != opt_value) {
      if (this.xScale_)
        this.xScale_.unlistenSignals(this.handleXScaleSignal_, this);
      this.xScale_ = opt_value;
      if (this.xScale_)
        this.xScale_.listenSignals(this.handleXScaleSignal_, this);
      this.invalidate(anychart.ConsistencyState.RESOURCE_TIMELINE_TICKS, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.xScale_;
};


/**
 * Getter/setter for heights array.
 * @param {Array.<anychart.core.resource.TimeLine.Level>=} opt_value
 * @return {Array.<anychart.core.resource.TimeLine.Level>|anychart.core.resource.TimeLine}
 */
anychart.core.resource.TimeLine.prototype.levels = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.levels_ = opt_value;
    this.invalidate(anychart.ConsistencyState.RESOURCE_TIMELINE_LEVELS, anychart.Signal.NEEDS_REDRAW);
    return this;
  }
  return this.levels_;
};


/**
 * Background getter/setter
 * @param {(string|Object|null|boolean)=} opt_value
 * @return {anychart.core.ui.Background|anychart.core.resource.TimeLine}
 */
anychart.core.resource.TimeLine.prototype.background = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.background_.setup(opt_value);
    return this;
  }
  return this.background_;
};


/**
 * Getter/setter for padding.
 * @param {(string|number|Array.<number|string>|anychart.core.utils.Space.NormalizedSpace)=} opt_spaceOrTopOrTopAndBottom .
 * @param {(string|number)=} opt_rightOrRightAndLeft .
 * @param {(string|number)=} opt_bottom .
 * @param {(string|number)=} opt_left .
 * @return {!(anychart.core.resource.TimeLine|anychart.core.utils.Padding)} .
 */
anychart.core.resource.TimeLine.prototype.padding = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  if (goog.isDef(opt_spaceOrTopOrTopAndBottom)) {
    this.padding_.setup.apply(this.padding_, arguments);
    return this;
  }
  return /** @type {!anychart.core.utils.Padding} */(this.padding_);
};


/**
 * Background getter/setter
 * @param {Object=} opt_value
 * @return {anychart.core.resource.TimeLineLevelHolidaysSettings|anychart.core.resource.TimeLine}
 */
anychart.core.resource.TimeLine.prototype.holidays = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.holidays_.setup(opt_value);
    return this;
  }
  return this.holidays_;
};


/**
 * Overlay element.
 * @param {(string|Object|null|boolean)=} opt_value .
 * @return {anychart.core.resource.TimeLine|anychart.core.ui.Overlay}
 */
anychart.core.resource.TimeLine.prototype.overlay = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.overlay_.setup(opt_value);
    this.invalidate(anychart.ConsistencyState.RESOURCE_TIMELINE_OVERLAY, anychart.Signal.NEEDS_REDRAW);
    return this;
  }
  return this.overlay_;
};


//endregion
//region --- IObjectWithSettings impl
/**
 * Returns option value if it was set directly to the object.
 * @param {string} name
 * @return {*}
 */
anychart.core.resource.TimeLine.prototype.getOwnOption = function(name) {
  return this.settings[name];
};


/**
 * Returns true if the option value was set directly to the object.
 * @param {string} name
 * @return {boolean}
 */
anychart.core.resource.TimeLine.prototype.hasOwnOption = function(name) {
  return goog.isDefAndNotNull(this.settings[name]);
};


/**
 * Returns option value from the theme if any.
 * @param {string} name
 * @return {*}
 */
anychart.core.resource.TimeLine.prototype.getThemeOption = function(name) {
  return this.defaultSettings[name];
};


/**
 * Returns option value by priorities.
 * @param {string} name
 * @return {*}
 */
anychart.core.resource.TimeLine.prototype.getOption = function(name) {
  return goog.isDefAndNotNull(this.settings[name]) ? this.settings[name] : this.defaultSettings[name];
};


/**
 * Sets option value to the instance.
 * @param {string} name
 * @param {*} value
 */
anychart.core.resource.TimeLine.prototype.setOption = function(name, value) {
  this.settings[name] = value;
};


/**
 * Performs checks on the instance to determine whether the state should be invalidated after option change.
 * @param {number} flags
 * @return {boolean}
 */
anychart.core.resource.TimeLine.prototype.check = function(flags) {
  return true;
};


//endregion
//region --- IResolvable implementation
/** @inheritDoc */
anychart.core.resource.TimeLine.prototype.resolutionChainCache = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.resolutionChainCache_ = opt_value;
  }
  return this.resolutionChainCache_;
};


/** @inheritDoc */
anychart.core.resource.TimeLine.prototype.getResolutionChain = anychart.core.settings.getResolutionChain;


/** @inheritDoc */
anychart.core.resource.TimeLine.prototype.getLowPriorityResolutionChain = function() {
  var sett = [this.defaultSettings];
  if (this.parent_) {
    sett = goog.array.concat(sett, this.parent_.getLowPriorityResolutionChain());
  }
  return sett;
};


/** @inheritDoc */
anychart.core.resource.TimeLine.prototype.getHighPriorityResolutionChain = function() {
  var sett = [this.settings];
  if (this.parent_) {
    sett = goog.array.concat(sett, this.parent_.getHighPriorityResolutionChain());
  }
  return sett;
};


//endregion
//region --- Parental relations
/**
 * Gets/sets new parent.
 * @param {anychart.core.resource.TimeLine=} opt_value - Value to set.
 * @return {anychart.core.resource.TimeLine|anychart.core.resource.TimeLine} - Current value or itself for method chaining.
 */
anychart.core.resource.TimeLine.prototype.parent = function(opt_value) {
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
anychart.core.resource.TimeLine.prototype.parentInvalidated_ = function(e) {
  var state = 0;
  var signal = 0;

  if (e.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state |= anychart.ConsistencyState.APPEARANCE;
    signal |= anychart.Signal.NEEDS_REDRAW;
  }

  if (e.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    // state |= this.ALL_VISUAL_STATES;
    signal |= anychart.Signal.BOUNDS_CHANGED;
  }

  if (e.hasSignal(anychart.Signal.ENABLED_STATE_CHANGED)) {
    state |= anychart.ConsistencyState.ENABLED;
    signal |= anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED;
  }

  this.invalidate(state, signal);
};


//endregion
//region --- Signals handling
//------------------------------------------------------------------------------
//
//  Signals handling
//
//------------------------------------------------------------------------------
/**
 * XScale signals handler.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.core.resource.TimeLine.prototype.handleXScaleSignal_ = function(e) {
  var signal = anychart.Signal.NEEDS_REDRAW;
  var state = 0;

  if (e.hasSignal(anychart.Signal.NEEDS_RECALCULATION)) {
    state |= anychart.ConsistencyState.RESOURCE_TIMELINE_LEVELS;
  }

  if (e.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    state |= anychart.ConsistencyState.RESOURCE_TIMELINE_TICKS | anychart.ConsistencyState.RESOURCE_TIMELINE_LABELS;
  }

  this.invalidate(state, signal);
};


/**
 * Background signals handler.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.core.resource.TimeLine.prototype.handleBackgroundSignal_ = function(e) {
  this.invalidate(anychart.ConsistencyState.RESOURCE_TIMELINE_BACKGROUND, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Listener for bounds invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.core.resource.TimeLine.prototype.paddingInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.BOUNDS,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
  }
};


/**
 * Holidays settings signals handler.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.core.resource.TimeLine.prototype.holidaysInvalidated_ = function(e) {
  this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Overlay signals handler.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.core.resource.TimeLine.prototype.overlaySignal_ = function(e) {
  this.invalidate(anychart.ConsistencyState.RESOURCE_TIMELINE_OVERLAY, anychart.Signal.NEEDS_REDRAW);
};


//endregion
//region --- Labels operations
/**
 * Gets index of format for level labels.
 * @param {number} value Label value.
 * @param {anychart.core.ui.LabelsFactory} labelFactory Labels factory.
 * @param {Object} labelSettings Label settings.
 * @param {anychart.math.Rect} bounds Label parent bounds.
 * @param {Array.<string>} formats Label formats.
 * @return {number} Labels format index.
 * @private
 */
anychart.core.resource.TimeLine.prototype.getLabelFormatIndex_ = function(value, labelFactory, labelSettings, bounds, formats) {
  for (var formatIndex = 0, formatsCount = formats.length; formatIndex < formatsCount; formatIndex++) {
    var format = formats[formatIndex];
    var labelText = anychart.format.dateTime(value, format);

    labelSettings['width'] = null;
    labelSettings['height'] = null;

    var labelBounds = labelFactory.measure({'value': labelText}, undefined, labelSettings);

    if (labelBounds.width < bounds.width) {
      return formatIndex;
    }
  }

  return formatsCount - 1;
};


/**
 * Gets format provider for label.
 * @param {number} value Label value.
 * @param {string} format Label format.
 * @return {Object} Labels format provider.
 * @private
 */
anychart.core.resource.TimeLine.prototype.getLabelsFormatProvider_ = function(value, format) {
  var labelText = anychart.format.dateTime(value, format);
  return {
    'value': labelText,
    'tickValue': value,
    'scale': this.xScale_
  };
};


/**
 * Level labels configuration.
 * @param {number} row Level index.
 * @param {number} col Tick index.
 * @param {anychart.scales.DateTimeWithCalendar.Tick} tick .
 * @param {boolean} holiday Whether holiday.
 * @param {number} left Pixel horizontal start position.
 * @param {number} right Pixel horizontal end position.
 * @param {number} from Pixel vertical start position.
 * @param {number} to Pixel vertical end position.
 */
anychart.core.resource.TimeLine.prototype.labelsConfiguration = function(row, col, tick, holiday, left, right, from, to) {
  var settings = holiday ? this.holidaysLabelSettings[row] : this.weekdaysLabelSettings[row];

  var padding = settings['padding'];
  if (padding && !(padding instanceof anychart.core.utils.Padding)) {
    if (!this.tempPadding_) this.tempPadding_ = new anychart.core.utils.Padding();
    this.tempPadding_.setup(settings['padding']);
    padding = this.tempPadding_;
  }

  var levelHeight = this.heights_[row];
  var labels = this.labels_[row];

  var x = left + (right - left) / 2;
  var y = to + levelHeight / 2;
  var positionProvider = {'value': {'x': x, 'y': y}};

  var left_ = Math.max(left, this.pixelBoundsCache_.left);
  var right_ = Math.min(right, this.pixelBoundsCache_.getRight());
  var bounds = anychart.math.rect(
      left_,
      to,
      right_ - left_,
      levelHeight);
  var sourceBounds = anychart.math.rect(left, to, right - left, levelHeight);

  var label = labels.add({'tickValue': tick['start']}, positionProvider, col);
  settings['width'] = bounds.width;
  settings['height'] = bounds.height;

  if (padding)
    label.cellBoundsWithPadding = padding.tightenBounds(bounds);
  label.cellBounds = bounds;
  label.sourceBounds = sourceBounds;

  label.clip(bounds);
  label.setSettings(settings);

  if (!this.choosenFormats_[row] && this.formatIndex_ != this.sourceFormats_[row].length - 1) {
    this.formatIndex_ = Math.max(
        this.formatIndex_,
        this.getLabelFormatIndex_(
            tick['start'],
            labels,
            settings,
            label.sourceBounds,
            this.sourceFormats_[row]));
  }
};


/**
 * Draw level labels.
 * @param {number} row Index of level.
 */
anychart.core.resource.TimeLine.prototype.drawLabels = function(row) {
  var x, y;
  var labels = this.labels_[row];
  var format = this.choosenFormats_[row] ? this.choosenFormats_[row] : this.choosenFormats_[row] = this.sourceFormats_[row][this.formatIndex_];
  for (var i = 0, len = labels.labelsCount(); i < len; i++) {
    var label = labels.getLabel(i);
    var tickValue = label.formatProvider()['tickValue'];
    label.formatProvider(this.getLabelsFormatProvider_(tickValue, format));

    if (!i || i == len - 1) {
      var settings = label.getMergedSettings();
      settings['width'] = null;
      settings['height'] = null;

      var labelBounds = labels.measure(label, undefined, settings);
      var parentBounds = label.cellBounds;

      var hAlign = label.getFinalSettings('hAlign');
      var width = label.getFinalSettings('width');

      if (hAlign == 'start' || hAlign == 'left') {
        labelBounds.left = label.sourceBounds.left;
      } else if (hAlign == 'end' || hAlign == 'right') {
        labelBounds.left = label.sourceBounds.getRight() - labelBounds.width;
      }

      // if (!this['lbl' + i + '_' + row + 'pb']) this['lbl' + i + '_' + row + 'pb'] = this.container().rect().zIndex(1000);
      // this['lbl' + i + '_' + row + 'pb'].setBounds(parentBounds);
      //
      // if (!this['lbl' + i + '_' + row + 'lb']) this['lbl' + i + '_' + row + 'lb'] = this.container().rect().zIndex(1000);
      // this['lbl' + i + '_' + row + 'lb'].setBounds(labelBounds);

      var bounds = parentBounds;
      if (labelBounds.left < parentBounds.left) {
        bounds = labelBounds;
        bounds.left = parentBounds.left;

        x = bounds.left + bounds.width / 2;
        y = bounds.top + bounds.height / 2;

        label.positionProvider({'value': {'x': x, 'y': y}});
        label.settingsObj['width'] = labelBounds.width;
      } else if (labelBounds.getRight() > parentBounds.getRight()) {
        bounds = labelBounds;

        if (labelBounds.width >= parentBounds.width) {
          bounds.left = parentBounds.left;
        } else {
          bounds.left = parentBounds.getRight() - labelBounds.width;
        }

        x = bounds.left + bounds.width / 2;
        y = bounds.top + bounds.height / 2;

        label.positionProvider({'value': {'x': x, 'y': y}});
        label.settingsObj['width'] = labelBounds.width;
      } else if (hAlign != 'center') {
        x = bounds.left + bounds.width / 2;
        y = bounds.top + bounds.height / 2;

        label.positionProvider({'value': {'x': x, 'y': y}});
      }

      label.clip(label.cellBoundsWithPadding);
    }
  }
  labels.dropCallsCache();
  labels.draw();
};


//endregion
//region --- Drawing
//------------------------------------------------------------------------------
//
//  Drawing
//
//------------------------------------------------------------------------------
/**
 * Draws the grid.
 */
anychart.core.resource.TimeLine.prototype.draw = function() {
  if (!this.checkDrawingNeeded())
    return;

  var drawTicks = false;
  var drawLabels = false;
  var rowCount, levelsPathsCount, level, weekdaysPath, holidaysPath, weekdaysStrokePath, holidaysStrokePath, labels, i;

  if (!this.rootElement_) {
    this.rootElement_ = acgraph.layer();

    this.clip_ = acgraph.clip();
    this.rootElement_.clip(this.clip_);

    this.levelsLayer_ = this.rootElement_.layer();

    this.levelsWeekdaysPaths_ = [];
    this.levelsHolidaysPaths_ = [];

    this.levelsWeekdaysStrokePaths_ = [];
    this.levelsHolidaysStrokePaths_ = [];

    this.labelsLayer_ = this.rootElement_.layer();
    this.labels_ = [];

    this.heights_ = [];

    this.weekdaysLabelSettings = [];
    this.holidaysLabelSettings = [];

    this.sourceFormats_ = [];
    this.choosenFormats_ = [];
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    this.rootElement_.parent(/** @type {acgraph.vector.ILayer} */(this.container()));
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    this.rootElement_.zIndex(/** @type {number} */(this.zIndex()));
    this.background_.zIndex(0);
    this.levelsLayer_.zIndex(1);
    this.labelsLayer_.zIndex(2);
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.pixelBoundsCache_ = this.getPixelBounds();
    anychart.utils.applyPixelShiftToRect(this.pixelBoundsCache_, 0);
    this.clip_.shape(this.pixelBoundsCache_);
    this.invalidate(
        anychart.ConsistencyState.RESOURCE_TIMELINE_BACKGROUND |
        anychart.ConsistencyState.RESOURCE_TIMELINE_TICKS |
        anychart.ConsistencyState.RESOURCE_TIMELINE_LABELS |
        anychart.ConsistencyState.RESOURCE_TIMELINE_OVERLAY);
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.RESOURCE_TIMELINE_LEVELS)) {
    rowCount = this.levels_.length;
    levelsPathsCount = this.levelsWeekdaysPaths_.length;
    this.choosenFormats_.length = 0;
    this.sourceFormats_.length = 0;
    this.weekdaysLabelSettings.length = 0;
    this.holidaysLabelSettings.length = 0;
    this.heights_.length = 0;
    var accumulatedHeight = 0;
    var rowAutoHeightCount = 0;

    var length = Math.max(rowCount, levelsPathsCount);

    for (i = 0; i < length; i++) {
      level = this.levels_[i];
      labels = this.labels_[i];
      weekdaysPath = this.levelsWeekdaysPaths_[i];
      holidaysPath = this.levelsHolidaysPaths_[i];
      weekdaysStrokePath = this.levelsWeekdaysStrokePaths_[i];
      holidaysStrokePath = this.levelsHolidaysStrokePaths_[i];

      if (level) {
        var height = 'height' in level ? level['height'] : null;
        if (!goog.isNull(height)) {
          this.heights_[i] = anychart.utils.normalizeSize(height, this.pixelBoundsCache_.height);
          accumulatedHeight += this.heights_[i];
        } else {
          this.heights_[i] = null;
          rowAutoHeightCount++;
        }

        if ('formats' in level) {
          this.sourceFormats_[i] = level['formats'];
        } else {
          var parentLevelUnit = this.levels_[i + 1] ? this.levels_[i + 1]['unit'] : undefined;
          var id = anychart.format.getIntervalIdentifier(level['unit'], parentLevelUnit, 'timeline');
          this.sourceFormats_[i] = anychart.format.getDateTimeFormats(id);
        }


        if (weekdaysPath) {
          weekdaysPath.clear().parent(this.levelsLayer_);
        } else {
          weekdaysPath = this.levelsLayer_.path();
          this.levelsWeekdaysPaths_.push(weekdaysPath);
        }

        if (holidaysPath) {
          holidaysPath.clear().parent(this.levelsLayer_);
        } else {
          holidaysPath = this.levelsLayer_.path();
          this.levelsHolidaysPaths_.push(holidaysPath);
        }

        if (weekdaysStrokePath) {
          weekdaysStrokePath.clear().parent(this.levelsLayer_);
        } else {
          weekdaysStrokePath = this.levelsLayer_.path();
          this.levelsWeekdaysStrokePaths_.push(weekdaysStrokePath);
        }

        if (holidaysStrokePath) {
          holidaysStrokePath.clear().parent(this.levelsLayer_);
        } else {
          holidaysStrokePath = this.levelsLayer_.path();
          this.levelsHolidaysStrokePaths_.push(holidaysStrokePath);
        }

        if (labels) {
          labels.clear();
        } else {
          var defaultTextFormatter = /** @type {Function} */(anychart.getFullTheme('defaultLabelFactory.textFormatter'));
          var defaultPositionFormatter = /** @type {Function} */(anychart.getFullTheme('defaultLabelFactory.positionFormatter'));

          labels = new anychart.core.ui.LabelsFactory();
          labels
              .textFormatter(defaultTextFormatter)
              .positionFormatter(defaultPositionFormatter);

          labels.enabled(true);
          labels.container(this.labelsLayer_);
          this.labels_.push(labels);
        }
      } else {
        if (weekdaysPath) {
          weekdaysPath.clear().parent(null);
        }
        if (holidaysPath) {
          holidaysPath.clear().parent(null);
        }
        if (weekdaysStrokePath) {
          weekdaysStrokePath.clear().parent(null);
        }
        if (holidaysStrokePath) {
          holidaysStrokePath.clear().parent(null);
        }
        if (labels) {
          labels.clear();
        }
      }
    }
    this.autoLevelHeight_ = (this.pixelBoundsCache_.height - accumulatedHeight) / rowAutoHeightCount;

    this.invalidate(
        anychart.ConsistencyState.APPEARANCE |
        anychart.ConsistencyState.RESOURCE_TIMELINE_TICKS |
        anychart.ConsistencyState.RESOURCE_TIMELINE_LABELS);

    this.markConsistent(anychart.ConsistencyState.RESOURCE_TIMELINE_LEVELS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    var themeLabelsSettings = /** @type {Object} */(anychart.getFullTheme('defaultLabelFactory'));
    var timeLineWeekdaysLabelsSettings = {};
    anychart.core.settings.serialize(this, anychart.core.resource.TimeLine.TEXT_DESCRIPTORS, timeLineWeekdaysLabelsSettings);
    timeLineWeekdaysLabelsSettings['padding'] = this.padding();
    var timeLineHolidaysLabelsSettings = {};
    anychart.core.settings.serialize(
        /** @type {!anychart.core.settings.IObjectWithSettings} */(this.holidays_),
        anychart.core.resource.TimeLine.TEXT_DESCRIPTORS,
        timeLineHolidaysLabelsSettings);
    timeLineHolidaysLabelsSettings['padding'] = this.holidays_.padding();

    rowCount = this.levels_.length;

    for (i = 0; i < rowCount; i++) {
      level = this.levels_[i];
      labels = this.labels_[i];
      weekdaysPath = this.levelsWeekdaysPaths_[i];
      holidaysPath = this.levelsHolidaysPaths_[i];
      weekdaysStrokePath = this.levelsWeekdaysStrokePaths_[i];
      holidaysStrokePath = this.levelsHolidaysStrokePaths_[i];

      var weekdaysLabelSettings = {};
      goog.object.extend(weekdaysLabelSettings, themeLabelsSettings);
      goog.object.extend(weekdaysLabelSettings, timeLineWeekdaysLabelsSettings);
      var levelWeekDaysLabelsSettings = {};
      anychart.core.settings.copy(levelWeekDaysLabelsSettings, anychart.core.resource.TimeLine.TEXT_DESCRIPTORS, level);
      if ('padding' in level) levelWeekDaysLabelsSettings['padding'] = level['padding'];
      goog.object.extend(weekdaysLabelSettings, levelWeekDaysLabelsSettings);
      weekdaysLabelSettings['enabled'] = true;
      this.weekdaysLabelSettings[i] = weekdaysLabelSettings;

      var holidaysLabelSettings = {};
      goog.object.extend(holidaysLabelSettings, themeLabelsSettings);
      goog.object.extend(holidaysLabelSettings, timeLineWeekdaysLabelsSettings);
      goog.object.extend(holidaysLabelSettings, timeLineHolidaysLabelsSettings);
      goog.object.extend(holidaysLabelSettings, levelWeekDaysLabelsSettings);
      var levelHoliday = level['holiday'];
      if (levelHoliday) {
        //levelHolidaysLabelsSettings;
        anychart.core.settings.copy(holidaysLabelSettings, anychart.core.resource.TimeLine.TEXT_DESCRIPTORS, levelHoliday);
        if ('padding' in levelHoliday) holidaysLabelSettings['padding'] = levelHoliday['padding'];
      }
      holidaysLabelSettings['enabled'] = true;
      this.holidaysLabelSettings[i] = holidaysLabelSettings;

      var weekdayStroke = 'stroke' in level ? level['stroke'] : this.getOption('stroke');
      var weekdayFill = 'fill' in level ? level['fill'] : this.getOption('fill');
      weekdaysStrokePath.fill(null).stroke(weekdayStroke);
      weekdaysPath.fill(weekdayFill).stroke(null);

      var holidayFill = levelHoliday && 'fill' in levelHoliday ? levelHoliday['fill'] : this.holidays_.getOwnOption('fill');
      if (!holidayFill) {
        holidayFill = weekdayFill;
      }
      holidaysStrokePath.fill(null).stroke(weekdayStroke);
      holidaysPath.fill(holidayFill).stroke(null);
    }
    this.invalidate(anychart.ConsistencyState.RESOURCE_TIMELINE_LABELS);
    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.RESOURCE_TIMELINE_BACKGROUND)) {
    this.background_.parentBounds(this.pixelBoundsCache_);
    this.background_.container(this.rootElement_);
    this.background_.draw();
    this.markConsistent(anychart.ConsistencyState.RESOURCE_TIMELINE_BACKGROUND);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.RESOURCE_TIMELINE_TICKS)) {
    drawTicks = true;
    this.markConsistent(anychart.ConsistencyState.RESOURCE_TIMELINE_TICKS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.RESOURCE_TIMELINE_LABELS)) {
    drawLabels = true;
    this.markConsistent(anychart.ConsistencyState.RESOURCE_TIMELINE_LABELS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.RESOURCE_TIMELINE_OVERLAY)) {
    this.overlay_.target(this.container().getStage().getDomWrapper());
    this.overlay_.setBounds(this.getPixelBounds());
    this.overlay_.draw();
    this.markConsistent(anychart.ConsistencyState.RESOURCE_TIMELINE_OVERLAY);
  }

  if (this.xScale_ && (drawTicks || drawLabels)) {
    rowCount = this.levels_.length;
    var lastRow = rowCount - 1;

    var from = this.pixelBoundsCache_.height + this.pixelBoundsCache_.top;
    var to = 0;
    var drawTop = !!this.getOption('drawTopLine');
    var drawRight = !!this.getOption('drawRightLine');
    var drawBottom = !!this.getOption('drawBottomLine');
    var drawLeft = !!this.getOption('drawLeftLine');
    var pixelShiftFrom = 0;
    var pixelShiftTo = 0;

    for (var row = 0; row < rowCount; row++) {
      var isLastRow = row == lastRow;
      var levelHeight = goog.isNull(this.heights_[row]) ? this.heights_[row] = this.autoLevelHeight_ : this.heights_[row];
      level = this.levels_[row];

      weekdaysPath = this.levelsWeekdaysPaths_[row].clear();
      holidaysPath = this.levelsHolidaysPaths_[row].clear();
      weekdaysStrokePath = this.levelsWeekdaysStrokePaths_[row].clear();
      holidaysStrokePath = this.levelsHolidaysStrokePaths_[row].clear();
      if (drawLabels) {
        labels = this.labels_[row];
        labels.clear();
      }

      var horzTicks = this.xScale_.getTicks(0, this.pixelBoundsCache_.width, level['unit'], level['count']);
      var colsCount = horzTicks.length;
      var lastCol = colsCount - 1;

      var thickness = acgraph.vector.getThickness(/** @type {acgraph.vector.Stroke} */(weekdaysStrokePath.stroke()));

      pixelShiftFrom = !row && drawBottom ? thickness / 2 : row ? Math.ceil(thickness / 2) : 0;
      from = anychart.utils.applyPixelShift(from - pixelShiftFrom, thickness);

      pixelShiftTo = isLastRow && drawTop ? thickness / 2 : !isLastRow ? Math.floor(thickness / 2) : 0;
      levelHeight -= (row ? pixelShiftFrom / 2 : pixelShiftFrom) + (isLastRow ? pixelShiftTo : pixelShiftTo / 2);
      to = anychart.utils.applyPixelShift(from - levelHeight, thickness, true);

      this.formatIndex_ = 0;
      for (var col = 0; col < colsCount; col++) {
        var isLastCol = col == lastCol;
        var tick = horzTicks[col];
        var holiday = tick['holiday'];
        var strokePath = holiday ? holidaysStrokePath : weekdaysStrokePath;

        thickness = acgraph.vector.getThickness(/** @type {acgraph.vector.Stroke} */(strokePath.stroke()));

        var left = anychart.utils.applyPixelShift(this.xScale_.dateToPix(tick['start']) + this.pixelBoundsCache_.left, thickness);
        var right = anychart.utils.applyPixelShift(this.xScale_.dateToPix(tick['end']) + this.pixelBoundsCache_.left, thickness);

        var l = Math.floor(left);
        var r = Math.ceil(right);
        var t = (drawTop || !isLastRow) ? Math.ceil(to) : Math.floor(to);
        var b = (drawBottom && !row) ? Math.floor(from) : Math.ceil(from);

        if (drawLeft && !col)
          strokePath
              .moveTo(left, t)
              .lineTo(left, b);
        if (drawRight || !isLastCol)
          strokePath
              .moveTo(right, t)
              .lineTo(right, b);
        if (drawTop || !isLastRow)
          strokePath
              .moveTo(l, to)
              .lineTo(r, to);
        if (drawBottom && !row)
          strokePath
              .moveTo(l, from)
              .lineTo(r, from);

        var path = holiday ? holidaysPath : weekdaysPath;
        path
            .moveTo(l, b)
            .lineTo(r, b)
            .lineTo(r, t)
            .lineTo(l, t)
            .close();

        if (drawLabels) {
          this.labelsConfiguration(row, col, tick, holiday, left, right, from, to);
        }
      }

      if (drawLabels) {
        this.drawLabels(row);
      }
      from = to;
    }
  }
};


/** @inheritDoc */
anychart.core.resource.TimeLine.prototype.remove = function() {
  if (this.rootElement_)
    this.rootElement_.parent(null);
};


//endregion
//region --- Serialization / Deserialization / Disposing
//------------------------------------------------------------------------------
//
//  Serialization / Deserialization / Disposing
//
//------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.resource.TimeLine.prototype.specialSetupByVal = function(value, opt_default) {
  if (goog.isBoolean(value) || goog.isNull(value)) {
    if (opt_default) {
      this.defaultSettings['enabled'] = !!value;
    } else {
      this.enabled(!!value);
    }
    return true;
  }
  return anychart.core.Base.prototype.specialSetupByVal.apply(this, arguments);
};


/**
 * Sets default settings.
 * @param {!Object} config
 */
anychart.core.resource.TimeLine.prototype.setThemeSettings = function(config) {
  anychart.core.settings.copy(this.defaultSettings, anychart.core.resource.TimeLine.DESCRIPTORS, config);
  anychart.core.settings.copy(this.defaultSettings, anychart.core.resource.TimeLine.TEXT_DESCRIPTORS, config);
};


/** @inheritDoc */
anychart.core.resource.TimeLine.prototype.serialize = function() {
  var json = anychart.core.resource.TimeLine.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.core.resource.TimeLine.DESCRIPTORS, json, 'Resource Timeline');
  anychart.core.settings.serialize(this, anychart.core.resource.TimeLine.TEXT_DESCRIPTORS, json, 'Resource Timeline text settings');

  json['background'] = this.background_.serialize();
  json['padding'] = this.padding_.serialize();
  json['holidays'] = this.holidays_.serialize();
  json['overlay'] = this.overlay_.serialize();
  return json;
};


/** @inheritDoc */
anychart.core.resource.TimeLine.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.resource.TimeLine.base(this, 'setupByJSON', config, opt_default);
  if (opt_default) {
    this.setThemeSettings(config);
  } else {
    anychart.core.settings.deserialize(this, anychart.core.resource.TimeLine.DESCRIPTORS, config);
    anychart.core.settings.deserialize(this, anychart.core.resource.TimeLine.TEXT_DESCRIPTORS, config);
  }

  if ('background' in config) this.background_.setupByVal(config['background'], opt_default);
  if ('padding' in config) this.padding_.setupByVal(config['padding'], opt_default);
  //todo (blackart)
  if ('holidays' in config) this.holidays_.setupByJSON(config['holidays'], opt_default);
  if ('overlay' in config) this.overlay_.setupByVal(config['overlay'], opt_default);
};


/** @inheritDoc */
anychart.core.resource.TimeLine.prototype.disposeInternal = function() {
  goog.dispose(this.rootElement_);
  this.rootElement_ = null;
  goog.dispose(this.background_);
  this.background_ = null;
  goog.dispose(this.padding_);
  this.padding_ = null;
  goog.dispose(this.clip_);
  this.clip_ = null;
  goog.dispose(this.holidays_);
  this.holidays_ = null;
  goog.disposeAll(this.levelsWeekdaysPaths_);
  this.levelsWeekdaysPaths_ = null;
  goog.disposeAll(this.levelsHolidaysPaths_);
  this.levelsHolidaysPaths_ = null;
  goog.disposeAll(this.labels_);
  this.labels_ = null;
  goog.dispose(this.overlay_);
  this.overlay_ = null;

  this.levelsLayer_ = null;
  this.labelsLayer_ = null;

  anychart.core.resource.TimeLine.base(this, 'disposeInternal');
};


//endregion
//region --- Exports
//------------------------------------------------------------------------------
//
//  Exports
//
//------------------------------------------------------------------------------
//exports
(function() {
  var proto = anychart.core.resource.TimeLine.prototype;
  proto['background'] = proto.background;
  proto['padding'] = proto.padding;
  proto['holidays'] = proto.holidays;
  proto['overlay'] = proto.overlay;
  // descriptors
  // proto['fill'] = proto.fill;
  // proto['stroke'] = proto.stroke;
  // proto['levelHeight'] = proto.levelHeight;
})();


//endregion
