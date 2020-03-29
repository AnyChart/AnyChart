//region --- Requiring and Providing
goog.provide('anychart.core.ui.LabelsFactory');
goog.provide('anychart.core.ui.LabelsFactory.Label');
goog.provide('anychart.standalones.LabelsFactory');
goog.provide('anychart.standalones.LabelsFactory.Label');
goog.require('acgraph.math');
goog.require('acgraph.vector.Text');
goog.require('anychart.core.IStandaloneBackend');
goog.require('anychart.core.VisualBase');
goog.require('anychart.core.reporting');
goog.require('anychart.core.settings');
goog.require('anychart.core.ui.Background');
goog.require('anychart.core.ui.Text');
goog.require('anychart.core.utils.Padding');
goog.require('anychart.core.utils.TokenParser');
goog.require('anychart.enums');
goog.require('anychart.math.Rect');
goog.require('goog.array');
goog.require('goog.math.Coordinate');
//endregion



/**
 * Class for creation of sets of similar labels and management of such sets.
 * Any individual label can be changed after all labels are displayed.
 *
 * @param {boolean=} opt_skipDefaultThemes
 *
 * @constructor
 * @extends {anychart.core.VisualBase}
 * @implements {anychart.core.IStandaloneBackend}
 */
anychart.core.ui.LabelsFactory = function(opt_skipDefaultThemes) {
  this.suspendSignalsDispatching();
  anychart.core.ui.LabelsFactory.base(this, 'constructor');

  if (!opt_skipDefaultThemes)
    this.addDefaultThemes(anychart.themes.DefaultThemes['labelsFactory']);

  delete this.themeSettings['enabled'];

  /**
   * Labels layer.
   * @type {acgraph.vector.Layer}
   * @private
   */
  this.layer_ = null;

  /**
   * Labels Array.
   * @type {Array.<anychart.core.ui.LabelsFactory.Label>}
   * @private
   */
  this.labels_;

  /**
   * @type {Array.<string>}
   * @protected
   */
  this.settingsFieldsForMerge = [
    'background',
    'padding',
    'height',
    'width',
    'offsetY',
    'offsetX',
    'position',
    'anchor',
    'rotation',
    'format',
    'positionFormatter',
    'minFontSize',
    'maxFontSize',
    'clip',
    'connectorStroke',
    'adjustFontSize',
    'useHtml',
    'fontSize',
    'fontWeight',

    'fontFamily',
    'fontColor',
    'textDirection',
    'textShadow',
    'wordWrap',
    'wordBreak',
    'fontOpacity',
    'fontDecoration',
    'fontStyle',
    'fontVariant',
    'letterSpacing',
    'lineHeight',
    'textIndent',
    'vAlign',
    'hAlign',
    'textOverflow',
    'selectable',
    'disablePointerEvents'
  ];

  /**
   * Auto values of settings set by external controller.
   * @type {!Object}
   */
  this.autoSettings = {};

  this.adjustFontSizeMode('different');

  this.resumeSignalsDispatching(false);

  anychart.core.settings.createTextPropertiesDescriptorsMeta(this.descriptorsMeta,
      anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.BOUNDS,
      anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.BOUNDS,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED,
      anychart.Signal.NEEDS_REDRAW);
  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['format', anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['positionFormatter', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['position', anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['anchor', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['offsetX', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['offsetY', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['connectorStroke', anychart.ConsistencyState.LABELS_FACTORY_CONNECTOR, anychart.Signal.NEEDS_REDRAW],
    ['rotation', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['width', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['height', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['clip', anychart.ConsistencyState.LABELS_FACTORY_CLIP, anychart.Signal.NEEDS_REDRAW]
  ]);
};
goog.inherits(anychart.core.ui.LabelsFactory, anychart.core.VisualBase);


//region --- Class const
/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.ui.LabelsFactory.prototype.SUPPORTED_SIGNALS =
    anychart.core.VisualBase.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.BOUNDS_CHANGED;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.ui.LabelsFactory.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.LABELS_FACTORY_BACKGROUND |
    anychart.ConsistencyState.LABELS_FACTORY_HANDLERS |
    anychart.ConsistencyState.LABELS_FACTORY_CLIP |
    anychart.ConsistencyState.LABELS_FACTORY_CONNECTOR;


/**
 * Enumeration to handle composite event handlers attachment on DOM create.
 * @const {Object.<number>}
 * @private
 */
anychart.core.ui.LabelsFactory.HANDLED_EVENT_TYPES_ = {
  /** Click. */
  'click': 0x01,

  /** Double click. */
  'dblclick': 0x02,

  /** Mouse down */
  'mousedown': 0x04,

  /** Mouse up */
  'mouseup': 0x08,

  /** Mouse over. */
  'mouseover': 0x10,

  /** Mouse out. */
  'mouseout': 0x20,

  /** Mouse move */
  'mousemove': 0x40,

  /** Touch start */
  'touchstart': 0x80,

  /** Touch move */
  'touchmove': 0x100,

  /** Touch end */
  'touchend': 0x200,

  /** Touch cancel.
   * @see http://www.w3.org/TR/2011/WD-touch-events-20110505/#the-touchcancel-event
   */
  'touchcancel': 0x400

  //  /** Tap (fast touchstart-touchend) */
  //  'tap': 0x800
};


/**
 * MAGIC NUMBERS!!! MAGIC NUMBERS!!!111
 * This is a lsh (<< - left shift) second argument to convert simple HANDLED_EVENT_TYPES code to a
 * CAPTURE HANDLED_EVENT_TYPES code! Tada!
 * @type {number}
 * @private
 */
anychart.core.ui.LabelsFactory.HANDLED_EVENT_TYPES_CAPTURE_SHIFT_ = 12;


/**
 * Factory to measure plain text with styles.
 * NOTE: Do not export!
 * @type {?anychart.core.ui.LabelsFactory}
 */
anychart.core.ui.LabelsFactory.measureTextFactory = null;


/**
 * @type {Array.<string>}
 */
anychart.core.ui.LabelsFactory.textFields = [
  'fontSize',
  'fontFamily',
  'fontColor',
  'fontOpacity',
  'textDirection',
  'fontStyle',
  'fontVariant',
  'fontDecoration',
  'fontWeight',
  'letterSpacing',
  'lineHeight',
  'textIndent',
  'vAlign',
  'hAlign',
  'textOverflow',
  'selectable',
  'disablePointerEvents',
  'wordWrap',
  'wordBreak',
  'rotation'
];


//endregion
//region --- Settings
/**
 * Special anchor normalizer that doesn't accept 'auto' and returns undefined in that case.
 * @param {*} value
 * @return {anychart.enums.Anchor|undefined}
 */
anychart.core.ui.LabelsFactory.anchorNoAutoNormalizer = function(value) {
  var res = anychart.enums.normalizeAnchor(value, anychart.enums.Anchor.AUTO);
  if (res == anychart.enums.Anchor.AUTO)
    res = undefined;
  return res;
};


/**
 * Text descriptors.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.ui.LabelsFactory.prototype.TEXT_DESCRIPTORS = anychart.core.settings.createTextPropertiesDescriptors();
anychart.core.settings.populate(anychart.core.ui.LabelsFactory, anychart.core.ui.LabelsFactory.prototype.TEXT_DESCRIPTORS);


/**
 * Simple properties descriptors.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.ui.LabelsFactory.prototype.SIMPLE_PROPS_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'format', anychart.core.settings.stringOrFunctionNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'positionFormatter', anychart.core.settings.stringOrFunctionNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'position', anychart.core.settings.asIsNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'anchor', anychart.core.ui.LabelsFactory.anchorNoAutoNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'offsetX', anychart.core.settings.asIsNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'offsetY', anychart.core.settings.asIsNormalizer],
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'connectorStroke', anychart.core.settings.strokeNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'rotation', anychart.core.settings.numberNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'width', anychart.core.settings.numberOrPercentNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'height', anychart.core.settings.numberOrPercentNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'clip', anychart.core.settings.asIsNormalizer]
  ]);

  return map;
})();
anychart.core.settings.populate(anychart.core.ui.LabelsFactory, anychart.core.ui.LabelsFactory.prototype.SIMPLE_PROPS_DESCRIPTORS);


//----------------------------------------------------------------------------------------------------------------------
//
//  enabled.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for enabled.
 * @param {?boolean=} opt_value Value to set.
 * @return {!anychart.core.ui.LabelsFactory|boolean|null} .
 */
anychart.core.ui.LabelsFactory.prototype.enabled = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var prevEnabledState = this.getOption('enabled');
    if (!goog.isNull(opt_value)) {
      if (goog.isNull(prevEnabledState) && !!opt_value) {
        this.invalidate(anychart.ConsistencyState.ENABLED, this.getEnableChangeSignals());
      }
      anychart.core.ui.LabelsFactory.base(this, 'enabled', /** @type {boolean} */(opt_value));
    } else {
      anychart.core.ui.LabelsFactory.base(this, 'enabled', opt_value);
      this.markConsistent(anychart.ConsistencyState.ENABLED);
    }
    return this;
  }
  return /** @type {?boolean} */(this.getOption('enabled'));
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Background and Padding.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Gets or sets the labels background settings.
 * @param {(string|Object|null|boolean)=} opt_value Background object to set.
 * @return {!(anychart.core.ui.LabelsFactory|anychart.core.ui.Background)} Returns the background or itself for chaining.
 */
anychart.core.ui.LabelsFactory.prototype.background = function(opt_value) {
  if (!this.background_) {
    this.background_ = new anychart.core.ui.Background();
    this.background_.markConsistent(anychart.ConsistencyState.ALL);
    this.background_.listenSignals(this.backgroundInvalidated_, this);

    this.setupCreated('background', this.background_);
  }

  if (goog.isDef(opt_value)) {
    this.background_.setup(opt_value);
    this.ownSettings['background'] = this.background_.ownSettings;
    return this;
  }
  return this.background_;
};


/**
 * Internal background invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.ui.LabelsFactory.prototype.backgroundInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.background_.markConsistent(anychart.ConsistencyState.ALL);
    this.updateComplexSettings();
    this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Labels padding.
 * @param {(string|number|Array.<number|string>|{top:(number|string),left:(number|string),bottom:(number|string),right:(number|string)})=} opt_spaceOrTopOrTopAndBottom Space object or top or top and bottom
 *    space.
 * @param {(string|number)=} opt_rightOrRightAndLeft Right or right and left space.
 * @param {(string|number)=} opt_bottom Bottom space.
 * @param {(string|number)=} opt_left Left space.
 * @return {!(anychart.core.ui.LabelsFactory|anychart.core.utils.Padding)} Padding or LabelsFactory for chaining.
 */
anychart.core.ui.LabelsFactory.prototype.padding = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  if (!this.padding_) {
    this.padding_ = new anychart.core.utils.Padding();
    this.padding_.listenSignals(this.paddingInvalidated_, this);

    this.setupCreated('padding', this.padding_);
  }
  if (goog.isDef(opt_spaceOrTopOrTopAndBottom)) {
    this.padding_.setup.apply(this.padding_, arguments);
    this.ownSettings['padding'] = this.padding_.ownSettings;
    return this;
  }
  return this.padding_;
};


/**
 * Listener for bounds invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.core.ui.LabelsFactory.prototype.paddingInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.updateComplexSettings();
    this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Text formatter.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Gets text formatter.
 * @return {Function|string} Text formatter.
 */
anychart.core.ui.LabelsFactory.prototype.getFormat = function() {
  return /** @type {Function|string} */(this.getOwnOption('format'));
};


/**
 * Sets text formatter.
 * @param {Function|string} value Text formatter value.
 */
anychart.core.ui.LabelsFactory.prototype.setFormat = function(value) {
  this.setOption('format', value);
};


/**
 * Getter/setter for textSettings.
 * @param {(Object|string)=} opt_objectOrName Settings object or settings name or nothing to get complete object.
 * @param {(string|number|boolean|Function)=} opt_value Setting value if used as a setter.
 * @return {!(anychart.core.ui.LabelsFactory|Object|string|number|boolean)} A copy of settings or the title for chaining.
 */
anychart.core.ui.LabelsFactory.prototype.textSettings = function(opt_objectOrName, opt_value) {
  if (goog.isDef(opt_objectOrName)) {
    if (goog.isString(opt_objectOrName)) {
      if (goog.isDef(opt_value)) {
        if (opt_objectOrName in this.TEXT_DESCRIPTORS) {
          this[opt_objectOrName](opt_value);
        }
        return this;
      } else {
        return /** @type {!(Object|boolean|number|string)} */ (this.getOwnOption(opt_objectOrName));
      }
    } else if (goog.isObject(opt_objectOrName)) {
      for (var item in opt_objectOrName) {
        if (item in this.TEXT_DESCRIPTORS)
          this[item](opt_objectOrName[item]);
      }
    }
    return this;
  }

  var res = {};
  for (var key in this.TEXT_DESCRIPTORS) {
    if (key in this.TEXT_DESCRIPTORS) {
      var value = this.getOption(key);
      if (goog.isDef(value))
        res[key] = this.getOption(key);
    }
  }
  return res;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Other settings.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Helper method.
 * @return {boolean} is adjustment enabled.
 */
anychart.core.ui.LabelsFactory.prototype.adjustEnabled = function() {
  var adjustFontSize = this.getOption('adjustFontSize');
  return !!adjustFontSize && (adjustFontSize['width'] || adjustFontSize['height']);
};


/**
 * @param {(anychart.enums.AdjustFontSizeMode|string)=} opt_value Adjust font size mode to set.
 * @return {anychart.enums.AdjustFontSizeMode|anychart.core.ui.LabelsFactory}
 */
anychart.core.ui.LabelsFactory.prototype.adjustFontSizeMode = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeAdjustFontSizeMode(opt_value);
    if (this.adjustFontSizeMode_ != opt_value) {
      this.adjustFontSizeMode_ = opt_value;
      if (this.adjustEnabled())
        this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.adjustFontSizeMode_;
};


/**
 * Sets current ajust font size calculated for current bounds.
 * @param {null|string|number} value Adjusted font size.
 * @return {anychart.core.ui.LabelsFactory} Itself for chaining call.
 */
anychart.core.ui.LabelsFactory.prototype.setAdjustFontSize = function(value) {
  var needInvalidate = this.getOption('fontSize') != value;
  if (goog.isNull(value)) {
    delete this.autoSettings['fontSize'];
  } else {
    this.autoSettings['fontSize'] = value;
  }
  if (needInvalidate)
    this.invalidate(anychart.ConsistencyState.BOUNDS);

  return this;
};


/**
 * Sets labels color that parent series have set for it.
 * @param {string} value Auto color distributed by the series.
 * @return {anychart.core.ui.LabelsFactory} Itself for chaining call.
 */
anychart.core.ui.LabelsFactory.prototype.setAutoColor = function(value) {
  var needInvalidate = this.getOption('fontColor') != value;
  if (goog.isNull(value)) {
    delete this.autoSettings['fontColor'];
  } else {
    this.autoSettings['fontColor'] = value;
  }
  if (needInvalidate)
    this.invalidate(anychart.ConsistencyState.BOUNDS);

  return this;
};


//endregion
//region --- IObjectWithSettings implementation
/**
 * Updating local settings for complex settings.
 */
anychart.core.ui.LabelsFactory.prototype.updateComplexSettings = function() {
  if (this.background_)
    this.ownSettings['background'] = this.background_.ownSettings;
  if (this.padding_)
    this.ownSettings['padding'] = this.padding_.ownSettings;
};


/** @inheritDoc */
anychart.core.ui.LabelsFactory.prototype.hasOwnOption = function(name) {
  return goog.isDefAndNotNull(this.ownSettings[name]);
};


/** @inheritDoc */
anychart.core.ui.LabelsFactory.prototype.getOption = function(name) {
  this.updateComplexSettings();
  return goog.isDef(this.ownSettings[name]) ?
      this.ownSettings[name] :
      goog.isDef(this.autoSettings[name]) ?
          this.autoSettings[name] :
          this.themeSettings[name];
};


/**
 * Returns own and auto option value.
 * @param {string} name .
 * @return {*}
 */
anychart.core.ui.LabelsFactory.prototype.getOwnAndAutoOption = function(name) {
  this.updateComplexSettings();
  return goog.isDef(this.ownSettings[name]) ? this.ownSettings[name] : this.autoSettings[name];
};


//endregion
//region --- Settings management
/**
 * Returns object with changed states.
 * @return {Object.<boolean>}
 */
anychart.core.ui.LabelsFactory.prototype.getSettingsChangedStatesObj = function() {
  return this.ownSettings;
};


/**
 * Returns changed settings.
 * @return {Object}
 */
anychart.core.ui.LabelsFactory.prototype.getChangedSettings = function() {
  var result = {};
  goog.object.forEach(this.ownSettings, function(value, key) {
    if (goog.isDef(value)) {
      if (key == 'adjustByHeight' || key == 'adjustByWidth') {
        key = 'adjustFontSize';
      }

      result[key] = this.getOwnOption(key);
    }
  }, this);
  return result;
};


//endregion
//region --- DOM Elements
/**
 * Returns DOM element.
 * @return {acgraph.vector.Layer}
 */
anychart.core.ui.LabelsFactory.prototype.getDomElement = function() {
  return this.layer_;
};


/**
 * Gets labels factory root layer;
 * @return {acgraph.vector.Layer}
 */
anychart.core.ui.LabelsFactory.prototype.getRootLayer = function() {
  return this.layer_;
};


//endregion
//region --- Labels management
/**
 * Clears an array of labels.
 * @param {number=} opt_index If set, removes only the label that is in passed index.
 * @return {anychart.core.ui.LabelsFactory} Returns itself for chaining.
 */
anychart.core.ui.LabelsFactory.prototype.clear = function(opt_index) {
  if (!this.freeToUseLabelsPool_)
    this.freeToUseLabelsPool_ = [];

  if (this.labels_ && this.labels_.length) {
    if (goog.isDef(opt_index)) {
      if (this.labels_[opt_index]) {
        this.labels_[opt_index].clear();
        this.freeToUseLabelsPool_.push(this.labels_[opt_index]);
        this.dropCallsCache(opt_index);
        delete this.labels_[opt_index];
      }
    } else {
      this.dropCallsCache();
      for (var i = this.labels_.length; i--;) {
        var label = this.labels_[i];
        if (label) {
          label.clear();
          this.freeToUseLabelsPool_.push(label);
        }
      }
      this.labels_.length = 0;
      this.invalidate(anychart.ConsistencyState.LABELS_FACTORY_HANDLERS, anychart.Signal.NEEDS_REDRAW);
    }
  } else
    this.labels_ = [];

  return this;
};


/**
 * Returns label by index (if there is such label).
 * @param {number} index Label index.
 * @return {anychart.core.ui.LabelsFactory.Label} Already existing label.
 */
anychart.core.ui.LabelsFactory.prototype.getLabel = function(index) {
  index = +index;
  return this.labels_ && this.labels_[index] ? this.labels_[index] : null;
};


/**
 * Labels count
 * @return {number}
 */
anychart.core.ui.LabelsFactory.prototype.labelsCount = function() {
  return this.labels_ ? this.labels_.length : 0;
};


/**
 * Creates new instance of anychart.core.ui.LabelsFactory.Label, saves it in the factory
 * and returns it.
 * @param {*} formatProvider Object that provides info for format function.
 * @param {*} positionProvider Object that provides info for positionFormatter function.
 * @param {number=} opt_index Label index.
 * @return {!anychart.core.ui.LabelsFactory.Label} Returns new label instance.
 */
anychart.core.ui.LabelsFactory.prototype.add = function(formatProvider, positionProvider, opt_index) {
  var label, index;
  if (!goog.isDef(this.labels_)) this.labels_ = [];

  if (goog.isDef(opt_index)) {
    index = +opt_index;
    label = this.labels_[index];
  }

  if (label) {
    label.suspendSignalsDispatching();
    label.clear();
  } else {
    label = this.freeToUseLabelsPool_ && this.freeToUseLabelsPool_.length > 0 ?
        this.freeToUseLabelsPool_.pop() :
        this.createLabel();
    label.suspendSignalsDispatching();

    if (goog.isDef(index)) {
      this.labels_[index] = label;
    } else {
      this.labels_.push(label);
      index = this.labels_.length - 1;
    }
    label.setIndex(index);
  }

  label.formatProvider(formatProvider);
  label.positionProvider(positionProvider);
  label.setFactory(this);
  label.state('pointNormal', label);
  label.state('seriesNormal', this);
  label.state('seriesNormalTheme', this.themeSettings);
  label.resumeSignalsDispatching(false);

  return label;
};


/**
 * @protected
 * @return {anychart.core.ui.LabelsFactory.Label}
 */
anychart.core.ui.LabelsFactory.prototype.createLabel = function() {
  return new anychart.core.ui.LabelsFactory.Label();
};


//endregion
//region --- Drawing
/** @inheritDoc */
anychart.core.ui.LabelsFactory.prototype.remove = function() {
  if (this.layer_) this.layer_.parent(null);
};


/**
 * Labels drawing.
 * @return {anychart.core.ui.LabelsFactory} Returns itself for chaining.
 */
anychart.core.ui.LabelsFactory.prototype.draw = function() {
  if (this.isDisposed())
    return this;

  if (!this.layer_) {
    this.layer_ = acgraph.layer();
    this.bindHandlersToGraphics(this.layer_);
  }

  var stage = this.container() ? this.container().getStage() : null;
  var manualSuspend = stage && !stage.isSuspended();
  if (manualSuspend) stage.suspend();

  if (this.labels_) {
    this.firstDraw();
    this.measureLabels();

    goog.array.forEach(this.labels_, function(label, index) {
      if (label) {
        label.container(this.layer_);
        label.draw();
      }
    }, this);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    this.layer_.zIndex(/** @type {number} */(this.zIndex()));
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    this.layer_.parent(/** @type {acgraph.vector.ILayer} */(this.container()));
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  this.markConsistent(anychart.ConsistencyState.ALL);

  if (manualSuspend) stage.resume();
  return this;
};


/**
 * First drawing.
 */
anychart.core.ui.LabelsFactory.prototype.firstDraw = function() {
  goog.array.forEach(this.labels_, function(label, index) {
    label.firstDraw();
  }, this);
};


/**
 * Measure labels.
 */
anychart.core.ui.LabelsFactory.prototype.measureLabels = function() {
  goog.array.forEach(this.labels_, function(label, index) {
    if (label && label.textElement && !label.isComplexText()) {
      label.textElement.getBounds();
    }
  }, this);
};


//endregion
//region --- Measuring
/**
 * Returns label size.
 * @param {*|anychart.core.ui.LabelsFactory.Label} formatProviderOrLabel Object that provides info for format function.
 * @param {*=} opt_positionProvider Object that provides info for positionFormatter function.
 * @param {Object=} opt_settings .
 * @param {number=} opt_cacheIndex .
 * @return {anychart.math.Rect} Label bounds.
 */
anychart.core.ui.LabelsFactory.prototype.getDimension = function(formatProviderOrLabel, opt_positionProvider, opt_settings, opt_cacheIndex) {
  var text;
  var textElementBounds;
  var textWidth;
  var textHeight;
  /** @type {anychart.math.Rect} */
  var outerBounds = new anychart.math.Rect(0, 0, 0, 0);
  var isWidthSet;
  var isHeightSet;
  var parentWidth;
  var parentHeight;
  var formatProvider;
  var positionProvider;

  //define parent bounds
  var parentBounds = /** @type {anychart.math.Rect} */(this.parentBounds());
  if (parentBounds) {
    parentWidth = parentBounds.width;
    parentHeight = parentBounds.height;
  }

  var measureLabel, textElement;
  var padding, widthSettings, heightSettings, offsetY, offsetX, anchor, format, isHtml;
  if (anychart.utils.instanceOf(formatProviderOrLabel, anychart.core.ui.LabelsFactory.Label) && !opt_settings) {
    measureLabel = formatProviderOrLabel;
    textElement = measureLabel.getTextElement();
    formatProvider = measureLabel.formatProvider();
    positionProvider = opt_positionProvider || measureLabel.positionProvider() || {'value': {'x': 0, 'y': 0}};
    var settings = measureLabel.getMergedSettings();

    parentBounds = /** @type {anychart.math.Rect} */(measureLabel.iterateDrawingPlans(function(state, settings) {
      var parentBounds = anychart.utils.instanceOf(settings, anychart.core.ui.LabelsFactory) ? settings.parentBounds() : settings.parentBounds;
      if (parentBounds)
        return parentBounds;
    }, true));

    if (parentBounds) {
      parentWidth = parentBounds.width;
      parentHeight = parentBounds.height;
    }

    isHtml = settings['useHtml'];
    widthSettings = settings['width'];
    heightSettings = settings['height'];
    offsetY = /** @type {number|string} */(settings['offsetY']);
    offsetX = /** @type {number|string} */(settings['offsetX']);
    anchor = /** @type {string} */(settings['anchor']);
    format = /** @type {Function|string} */(settings['format']);
    padding = settings['padding'];

    textElement.style(settings);
  } else {
    if (!this.measureCustomLabel_) {
      this.measureCustomLabel_ = this.createLabel();
      this.measureCustomLabel_.setFactory(this);
    } else {
      this.measureCustomLabel_.clear();
    }
    if (!this.measureTextElement_) {
      this.measureTextElement_ = acgraph.text();
      this.measureTextElement_.attr('aria-hidden', 'true');
    }
    measureLabel = this.measureCustomLabel_;
    textElement = this.measureTextElement_;

    if (anychart.utils.instanceOf(formatProviderOrLabel, anychart.core.ui.LabelsFactory.Label)) {
      var label = (/** @type {anychart.core.ui.LabelsFactory.Label} */(formatProviderOrLabel));
      this.measureCustomLabel_.setup(label.getMergedSettings());
      formatProvider = label.formatProvider();
      positionProvider = opt_positionProvider || label.positionProvider() || {'value': {'x': 0, 'y': 0}};
    } else {
      formatProvider = formatProviderOrLabel;
      positionProvider = opt_positionProvider || {'value': {'x': 0, 'y': 0}};
    }
    this.measureCustomLabel_.setup(opt_settings);
    isHtml = goog.isDef(measureLabel.getOption('useHtml')) ? measureLabel.getOption('useHtml') : this.getOption('useHtml');

    var labelPadding = !goog.object.isEmpty(measureLabel.ownSettings['padding']) || !goog.object.isEmpty(measureLabel.themeSettings['padding']) ?
        measureLabel.padding() : void 0;
    padding = labelPadding || this.padding_ || null;
    widthSettings = goog.isDef(measureLabel.getOption('width')) ? measureLabel.getOption('width') : this.getOption('width');
    heightSettings = goog.isDef(measureLabel.getOption('height')) ? measureLabel.getOption('height') : this.getOption('height');
    offsetY = /** @type {number|string} */(measureLabel.getOption('offsetY') || this.getOption('offsetY')) || 0;
    offsetX = /** @type {number|string} */(measureLabel.getOption('offsetX') || this.getOption('offsetX')) || 0;
    anchor = /** @type {string} */(measureLabel.getOption('anchor') || this.getOption('anchor'));
    format = /** @type {Function|string} */(measureLabel.getOption('format') || this.getOption('format'));

    measureLabel.applyTextSettings(textElement, true, this.themeSettings);
    measureLabel.applyTextSettings.call(this, textElement, false);
    measureLabel.applyTextSettings(textElement, false);
  }
  if (!(anychart.utils.instanceOf(padding, anychart.core.utils.Padding))) {
    padding = this.padding();
  }

  //we should ask text element about bounds only after text format and text settings are applied

  text = this.callFormat(format, formatProvider, opt_cacheIndex);
  textElement.width(null);
  textElement.height(null);
  if (isHtml) {
    textElement.htmlText(goog.isDefAndNotNull(text) ? String(text) : null);
  } else {
    textElement.text(goog.isDefAndNotNull(text) ? String(text) : null);
  }

  //define is width and height set from settings
  isWidthSet = !goog.isNull(widthSettings);
  isHeightSet = !goog.isNull(heightSettings);

  textElementBounds = textElement.getBounds();

  //calculate text width and outer width
  var width;
  if (isWidthSet) {
    width = Math.ceil(anychart.utils.normalizeSize(/** @type {number|string} */(widthSettings), parentWidth));
    textWidth = padding ? padding.tightenWidth(width) : width;
    outerBounds.width = width;
  } else {
    width = textElementBounds.width;
    outerBounds.width = padding ? padding.widenWidth(width) : width;
  }

  if (goog.isDef(textWidth)) textElement.width(textWidth);

  textElementBounds = textElement.getBounds();

  //calculate text height and outer height
  var height;
  if (isHeightSet) {
    height = Math.ceil(anychart.utils.normalizeSize(/** @type {number|string} */(heightSettings), parentHeight));
    textHeight = padding ? padding.tightenHeight(height) : height;
    outerBounds.height = height;
  } else {
    height = textElementBounds.height;
    outerBounds.height = padding ? padding.widenHeight(height) : height;
  }

  if (goog.isDef(textHeight)) textElement.height(textHeight);

  var formattedPosition = goog.object.clone(this.getOption('positionFormatter').call(positionProvider, positionProvider));

  return this.getDimensionInternal(outerBounds, formattedPosition, parentBounds, offsetX, offsetY, anchor);
};


/**
 * Get dimension internal
 * @param {anychart.math.Rect} outerBounds
 * @param {Object} formattedPosition
 * @param {anychart.math.Rect} parentBounds
 * @param {number|string} offsetX
 * @param {number|string} offsetY
 * @param {string} anchor
 * @return {anychart.math.Rect}
 */
anychart.core.ui.LabelsFactory.prototype.getDimensionInternal = function(outerBounds, formattedPosition, parentBounds, offsetX, offsetY, anchor) {
  var parentWidth, parentHeight;
  if (parentBounds) {
    parentWidth = parentBounds.width;
    parentHeight = parentBounds.height;
  }

  var position = new goog.math.Coordinate(formattedPosition['x'], formattedPosition['y']);
  var anchorCoordinate = anychart.utils.getCoordinateByAnchor(
      new anychart.math.Rect(0, 0, outerBounds.width, outerBounds.height),
      /** @type {string} */(anchor));

  position.x -= anchorCoordinate.x;
  position.y -= anchorCoordinate.y;

  offsetX = goog.isDef(offsetX) ? anychart.utils.normalizeSize(offsetX, parentWidth) : 0;
  offsetY = goog.isDef(offsetY) ? anychart.utils.normalizeSize(offsetY, parentHeight) : 0;

  anychart.utils.applyOffsetByAnchor(position, /** @type {anychart.enums.Anchor} */(anchor), offsetX, offsetY);

  outerBounds.left = position.x;
  outerBounds.top = position.y;

  return /** @type {anychart.math.Rect} */(outerBounds);
};


/**
 * Measure labels using formatProvider, positionProvider and returns labels bounds.
 * @param {*|anychart.core.ui.LabelsFactory.Label} formatProviderOrLabel Object that provides info for format function.
 * @param {*=} opt_positionProvider Object that provides info for positionFormatter function.
 * @param {Object=} opt_settings .
 * @param {number=} opt_cacheIndex .
 * @return {anychart.math.Rect} Labels bounds.
 */
anychart.core.ui.LabelsFactory.prototype.measure = function(formatProviderOrLabel, opt_positionProvider, opt_settings, opt_cacheIndex) {
  var arr = this.measureWithTransform(formatProviderOrLabel, opt_positionProvider, opt_settings, opt_cacheIndex);
  return anychart.math.Rect.fromCoordinateBox(arr);
};


/**
 * Measures label in its coordinate system and returns bounds as an array of points in parent coordinate system.
 * @param {*|anychart.core.ui.LabelsFactory.Label} formatProviderOrLabel Object that provides info for format function.
 * @param {*=} opt_positionProvider Object that provides info for positionFormatter function.
 * @param {Object=} opt_settings .
 * @param {number=} opt_cacheIndex .
 * @return {Array.<number>} Label bounds.
 */
anychart.core.ui.LabelsFactory.prototype.measureWithTransform = function(formatProviderOrLabel, opt_positionProvider, opt_settings, opt_cacheIndex) {
  var rotation, anchor;
  if (anychart.utils.instanceOf(formatProviderOrLabel, anychart.core.ui.LabelsFactory.Label)) {
    var labelRotation = formatProviderOrLabel.getOption('rotation');
    rotation = goog.isDef(labelRotation) ? labelRotation : this.getOption('rotation') || 0;
    anchor = formatProviderOrLabel.getOption('anchor') || this.getOption('anchor');
    if (anchor == anychart.enums.Anchor.AUTO && opt_settings && opt_settings['anchor']) {
      anchor = opt_settings['anchor'];
    }
    opt_cacheIndex = goog.isDef(opt_cacheIndex) ? opt_cacheIndex : formatProviderOrLabel.getIndex();
  } else {
    rotation = goog.isDef(opt_settings) && goog.isDef(opt_settings['rotation']) ? opt_settings['rotation'] : this.getOption('rotation') || 0;
    anchor = goog.isDef(opt_settings) && opt_settings['anchor'] || this.getOption('anchor');
  }

  var bounds = this.getDimension(formatProviderOrLabel, opt_positionProvider, opt_settings, opt_cacheIndex);

  var rotationAngle = /** @type {number} */(rotation);
  var point = anychart.utils.getCoordinateByAnchor(bounds, /** @type {anychart.enums.Anchor} */(anchor));
  var tx = goog.math.AffineTransform.getRotateInstance(goog.math.toRadians(rotationAngle), point.x, point.y);

  var arr = bounds.toCoordinateBox() || [];
  tx.transform(arr, 0, arr, 0, 4);

  return arr;
};


//endregion
//region --- Format calls management
/**
 * Calls text formatter in scope of provider, or returns value from cache.
 * @param {Function|string} formatter Text formatter function.
 * @param {*} provider Provider for text formatter.
 * @param {number=} opt_cacheIndex Label index.
 * @return {*}
 */
anychart.core.ui.LabelsFactory.prototype.callFormat = function(formatter, provider, opt_cacheIndex) {
  if (goog.isString(formatter))
    formatter = anychart.core.utils.TokenParser.getInstance().getFormat(formatter);
  if (!this.formatCallsCache_)
    this.formatCallsCache_ = {};
  if (goog.isDefAndNotNull(opt_cacheIndex)) {
    if (!goog.isDef(this.formatCallsCache_[opt_cacheIndex])) {
      if (goog.isDef(provider) && provider['series']) {
        var series = /** @type {{getIterator: Function}} */ (provider['series']);
        var iterator = series.getIterator();
        if (goog.isFunction(iterator.select))
          iterator.select(goog.isDef(provider['index']) ? provider['index'] : opt_cacheIndex);
      }
      this.formatCallsCache_[opt_cacheIndex] = formatter.call(provider, provider);
    }

    return this.formatCallsCache_[opt_cacheIndex];
  }
  return formatter.call(provider, provider);
};


/**
 * Drops tet formatter calls cache.
 * @param {number=} opt_index
 * @return {anychart.core.ui.LabelsFactory} Self for chaining.
 */
anychart.core.ui.LabelsFactory.prototype.dropCallsCache = function(opt_index) {
  if (!goog.isDef(opt_index)) {
    this.formatCallsCache_ = {};
  } else {
    if (this.formatCallsCache_ && goog.isDef(this.formatCallsCache_[opt_index])) {
      delete this.formatCallsCache_[opt_index];
    }
  }
  return this;
};


//endregion
//region --- Interactivity
//----------------------------------------------------------------------------------------------------------------------
//
//  Events
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.ui.LabelsFactory.prototype.makeBrowserEvent = function(e) {
  var res = anychart.core.ui.LabelsFactory.base(this, 'makeBrowserEvent', e);
  var target = res['domTarget'];
  var tag;
  while (anychart.utils.instanceOf(target, acgraph.vector.Element)) {
    tag = target.tag;
    if (anychart.utils.instanceOf(tag, anychart.core.VisualBase) || !anychart.utils.isNaN(tag))
      break;
    target = target.parent();
  }
  res['labelIndex'] = anychart.utils.toNumber(tag);
  return res;
};


//endregion
//region --- Setup & Dispose
/** @inheritDoc */
anychart.core.ui.LabelsFactory.prototype.disposeInternal = function() {
  goog.disposeAll(
      this.labels_,
      this.freeToUseLabelsPool_,
      this.measureCustomLabel_,
      this.layer_,
      this.background_,
      this.padding_,
      this.measureCustomLabel_,
      this.measureTextElement_);

  this.labels_ = null;
  this.freeToUseLabelsPool_ = null;
  this.measureCustomLabel_ = null;
  this.layer_ = null;
  this.background_ = null;
  this.padding_ = null;
  this.measureCustomLabel_ = null;
  this.measureTextElement_ = null;

  anychart.core.ui.LabelsFactory.base(this, 'disposeInternal');
};


/** @inheritDoc */
anychart.core.ui.LabelsFactory.prototype.serialize = function() {
  var json = anychart.core.ui.LabelsFactory.base(this, 'serialize');
  if (!goog.isDef(json['enabled'])) delete json['enabled'];

  var val;
  if (this.hasOwnOption('background') && !goog.object.isEmpty(this.ownSettings['background'])) {
    val = this.background().serialize();
    if (!goog.object.isEmpty(val))
      json['background'] = val;
  }

  if (this.hasOwnOption('padding') && !goog.object.isEmpty(this.ownSettings['padding'])) {
    val = this.padding().serialize();
    if (!goog.object.isEmpty(val))
      json['padding'] = val;
  }

  var adjustFontSize = json['adjustFontSize'];
  if (!(adjustFontSize && (goog.isDef(adjustFontSize['width']) || goog.isDef(adjustFontSize['height']))))
    delete json['adjustFontSize'];

  anychart.core.settings.serialize(this, this.TEXT_DESCRIPTORS, json, 'Labels factory label text', void 0, true);
  anychart.core.settings.serialize(this, this.SIMPLE_PROPS_DESCRIPTORS, json, 'Labels factory label props', void 0, true);

  return json;
};


/** @inheritDoc */
anychart.core.ui.LabelsFactory.prototype.setupByJSON = function(config, opt_default) {
  var enabledState = this.enabled();
  anychart.core.ui.LabelsFactory.base(this, 'setupByJSON', config, opt_default);
  if (opt_default) {
    anychart.core.settings.deserialize(this.themeSettings, this.TEXT_DESCRIPTORS, config);
    anychart.core.settings.deserialize(this.themeSettings, this.SIMPLE_PROPS_DESCRIPTORS, config);
    if ('enabled' in config) this.themeSettings['enabled'] = config['enabled'];
  } else {
    anychart.core.settings.deserialize(this, this.TEXT_DESCRIPTORS, config);
    anychart.core.settings.deserialize(this, this.SIMPLE_PROPS_DESCRIPTORS, config);
    this.enabled('enabled' in config ? config['enabled'] : enabledState);
  }

  var propName = 'background';
  if (propName in config) {
    var background = this.background();
    if (opt_default) {
      background.setupInternal(!!opt_default, config[propName]);
    } else {
      this.background(config[propName]);
    }
    this.themeSettings[propName] = background.themeSettings;
    this.ownSettings[propName] = background.ownSettings;
  }

  propName = 'padding';
  if (propName in config) {
    var padding = this.padding();
    if (opt_default) {
      padding.setupInternal(!!opt_default, config[propName]);
    } else {
      this.padding(config[propName]);
    }
    this.themeSettings[propName] = padding.themeSettings;
    this.ownSettings[propName] = padding.ownSettings;
  }
};
//endregion



/**
 * Class for creation of sets of similar labels and management of such sets.
 * Any individual label can be changed after all labels are displayed.
 * @constructor
 * @extends {anychart.core.VisualBase}
 */
anychart.core.ui.LabelsFactory.Label = function() {
  anychart.core.ui.LabelsFactory.Label.base(this, 'constructor');
  delete this.themeSettings['enabled'];

  /**
   * Label index.
   * @type {number}
   * @private
   */
  this.index_;

  /**
   * Label layer
   * @type {acgraph.vector.Layer}
   * @private
   */
  this.layer_;

  /**
   * @type {acgraph.vector.Text|anychart.core.ui.Text}
   * @protected
   */
  this.textElement;

  /**
   * @type {anychart.core.ui.Background}
   * @private
   */
  this.backgroundElement_;

  /**
   * @type {Object}
   * @protected
   */
  this.mergedSettings;

  /**
   * States.
   * @type {Object}
   * @private
   */
  this.states_ = {};

  /**
   * Auto values of settings set by external controller.
   * @type {!Object}
   */
  this.autoSettings = {};

  /**
   * Default drawing plan.
   * @type {Array.<string|Object|null>}
   * @private
   */
  this.defaultDrawingPlan_ = [
    'pointState',
    'seriesState',
    'chartState',
    'pointNormal',
    'seriesNormal',
    'chartNormal',
    'seriesStateTheme',
    'chartStateTheme',
    'auto',
    'seriesNormalTheme',
    'chartNormalTheme'
  ];

  /**
   * Drawing plan.
   * @type {Array.<string|Object|null>}
   * @private
   */
  this.drawingPlan_ = goog.array.slice(this.defaultDrawingPlan_, 0);

  this.isComplex = true;

  this.resetSettings();

  this.markConsistent(anychart.ConsistencyState.LABELS_FACTORY_CACHE);

  anychart.core.settings.createTextPropertiesDescriptorsMeta(this.descriptorsMeta,
      anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.BOUNDS,
      anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.BOUNDS,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED,
      anychart.Signal.NEEDS_REDRAW);

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['format', anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.LABELS_FACTORY_CACHE, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['positionFormatter', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['position', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['anchor', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['offsetX', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['offsetY', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['connectorStroke', anychart.ConsistencyState.LABELS_FACTORY_CONNECTOR, anychart.Signal.NEEDS_REDRAW],
    ['rotation', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['width', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['height', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['clip', anychart.ConsistencyState.LABELS_FACTORY_CLIP, anychart.Signal.NEEDS_REDRAW],
    ['enabled', anychart.ConsistencyState.ENABLED, anychart.Signal.BOUNDS_CHANGED | anychart.Signal.NEEDS_REDRAW]
  ]);
};
goog.inherits(anychart.core.ui.LabelsFactory.Label, anychart.core.VisualBase);


//region --- Class const
/**
 * Supported signals.
 * @type {number}
 */
anychart.core.ui.LabelsFactory.Label.prototype.SUPPORTED_SIGNALS =
    anychart.core.VisualBase.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.BOUNDS_CHANGED;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.ui.LabelsFactory.Label.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.LABELS_FACTORY_POSITION |
    anychart.ConsistencyState.LABELS_FACTORY_CLIP |
    anychart.ConsistencyState.LABELS_FACTORY_CONNECTOR |
    anychart.ConsistencyState.LABELS_FACTORY_CACHE;


//endregion
//region --- Dom elements
/**
 * Returns DOM element.
 * @return {acgraph.vector.Layer}
 */
anychart.core.ui.LabelsFactory.Label.prototype.getDomElement = function() {
  return this.layer_;
};


/**
 * Returns connector graphics element.
 * @return {acgraph.vector.Layer}
 */
anychart.core.ui.LabelsFactory.Label.prototype.getConnectorElement = function() {
  return this.connector;
};


//endregion
//region --- States
/**
 * Root factory.
 * @param {anychart.core.ui.LabelsFactory} value .
 */
anychart.core.ui.LabelsFactory.Label.prototype.setFactory = function(value) {
  this.factory_ = value;
};


/**
 * Return Root factory.
 * @return {anychart.core.ui.LabelsFactory} .
 */
anychart.core.ui.LabelsFactory.Label.prototype.getFactory = function() {
  return this.factory_;
};


/**
 * Gets/sets parent LabelsFactory.
 * @param {!anychart.core.ui.LabelsFactory=} opt_value labels factory.
 * @return {anychart.core.ui.LabelsFactory|anychart.core.ui.LabelsFactory.Label} Returns LabelsFactory or self
 * for method chainging.
 */
anychart.core.ui.LabelsFactory.Label.prototype.parentLabelsFactory = function(opt_value) {
  if (goog.isDefAndNotNull(opt_value)) {
    if (this.state('seriesNormal') != opt_value) {
      this.setFactory(opt_value);
      this.state('seriesNormal', opt_value);
      this.state('seriesNormalTheme', opt_value ? opt_value.themeSettings : null);
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return /** @type {anychart.core.ui.LabelsFactory} */(this.state('seriesNormal'));
  }
};


/**
 * Gets/sets LabelsFactory to a label.
 * @param {anychart.core.ui.LabelsFactory=} opt_value labels factory.
 * @return {anychart.core.ui.LabelsFactory|anychart.core.ui.LabelsFactory.Label} Returns LabelsFactory or self
 * for method chainging.
 */
anychart.core.ui.LabelsFactory.Label.prototype.currentLabelsFactory = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.state('seriesState') != opt_value) {
      this.state('seriesState', opt_value);
      this.state('seriesStateTheme', opt_value ? opt_value.themeSettings : null);
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return /** @type {anychart.core.ui.LabelsFactory} */(this.state('seriesState'));
  }
};


/**
 * Returns drawing plan.
 * @return {!Array}
 */
anychart.core.ui.LabelsFactory.Label.prototype.getDrawingPlan = function() {
  return this.drawingPlan_ || (this.drawingPlan_ = goog.array.slice(this.defaultDrawingPlan_, 0));
};


/**
 * @param {string} name State name.
 * @param {Object=} opt_value State settings.
 * @param {?number=} opt_priority State settings.
 * @return {anychart.core.ui.LabelsFactory|Object}
 */
anychart.core.ui.LabelsFactory.Label.prototype.state = function(name, opt_value, opt_priority) {
  if (goog.isDef(opt_value)) {
    if (goog.isDef(opt_priority)) {
      opt_priority = anychart.utils.toNumber(opt_priority);
    }
    var drawingPlan = this.getDrawingPlan();
    if (this.states_[name] != opt_value || goog.array.indexOf(drawingPlan, name) != opt_priority) {
      this.states_[name] = opt_value;

      if (!goog.isDef(opt_priority) && goog.array.indexOf(drawingPlan, name) == -1)
        opt_priority = drawingPlan.length;

      if (!isNaN(opt_priority))
        this.stateOrder(name, opt_priority);

      this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.ENABLED,
          anychart.Signal.BOUNDS_CHANGED | anychart.Signal.NEEDS_REDRAW);
    }

    return this;
  }

  return this.states_[name];
};


/**
 * Drawing plan.
 * @param {null|string|Array<anychart.core.ui.LabelsFactory.Label|anychart.core.ui.LabelsFactory|Object|string>} nameOrSet State name or array of states.
 * @param {number=} opt_value Priority value. 0 is more priority than 1. if passed 'null' - auto mode - last priority value.
 * @return {anychart.core.ui.LabelsFactory.Label|number} .
 */
anychart.core.ui.LabelsFactory.Label.prototype.stateOrder = function(nameOrSet, opt_value) {
  var invalidate = false;
  var drawingPlan = this.getDrawingPlan();
  if (goog.isDef(opt_value) && goog.isString(nameOrSet)) {
    opt_value = anychart.utils.toNumber(opt_value);
    var index = goog.array.indexOf(drawingPlan, /** @type {string} */(nameOrSet));

    if (index == opt_value)
      return this;

      var dest = isNaN(opt_value) ? drawingPlan.length - 1 : opt_value;
    if (drawingPlan.length <= dest)
      drawingPlan.length = dest + 1;

    if (index != -1) {
      delete drawingPlan[index];
      drawingPlan[dest] = nameOrSet;
    } else {
      drawingPlan[dest] = nameOrSet;
    }
    invalidate = true;

    return this;
  } else if (goog.isArray(nameOrSet)) {
    this.drawingPlan_ = goog.array.slice(nameOrSet, 0);
    invalidate = true;
  } else if (goog.isNull(nameOrSet)) {
    this.drawingPlan_ = goog.array.slice(this.defaultDrawingPlan_, 0);
    invalidate = true;
  }
  if (invalidate) {
    this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.ENABLED,
        anychart.Signal.BOUNDS_CHANGED | anychart.Signal.NEEDS_REDRAW);
  }

  return goog.array.indexOf(drawingPlan, /** @type {string} */(nameOrSet));
};


/**
 * Invalidation state checker.
 * @param {number} state .
 * @return {boolean} .
 */
anychart.core.ui.LabelsFactory.Label.prototype.checkInvalidationState = function(state) {
  return /** @type {boolean} */(this.iterateDrawingPlans(function(stateOrStateName, settings) {
    if (anychart.utils.instanceOf(settings, anychart.core.ui.LabelsFactory.Label) || anychart.utils.instanceOf(settings, anychart.core.ui.LabelsFactory)) {
      if (settings.hasInvalidationState(state))
        return true;
    }
  }, true) || this.hasInvalidationState(state));
};


//endregion
//region --- Settings
/**
 * Text descriptors.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.ui.LabelsFactory.Label.prototype.TEXT_DESCRIPTORS = anychart.core.settings.createTextPropertiesDescriptors();
anychart.core.settings.populate(anychart.core.ui.LabelsFactory.Label, anychart.core.ui.LabelsFactory.Label.prototype.TEXT_DESCRIPTORS);


/**
 * Simple properties descriptors.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.ui.LabelsFactory.Label.prototype.SIMPLE_PROPS_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'format', anychart.core.settings.stringOrFunctionNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'positionFormatter', anychart.core.settings.stringOrFunctionNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'position', anychart.core.settings.asIsNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'anchor', anychart.core.ui.LabelsFactory.anchorNoAutoNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'offsetX', anychart.core.settings.asIsNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'offsetY', anychart.core.settings.asIsNormalizer],
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'connectorStroke', anychart.core.settings.strokeNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'rotation', anychart.core.settings.numberNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'width', anychart.core.settings.numberOrPercentNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'height', anychart.core.settings.numberOrPercentNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'clip', anychart.core.settings.asIsNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'enabled', anychart.core.settings.boolOrNullNormalizer]
  ]);

  return map;
})();
anychart.core.settings.populate(anychart.core.ui.LabelsFactory.Label, anychart.core.ui.LabelsFactory.Label.prototype.SIMPLE_PROPS_DESCRIPTORS);


//----------------------------------------------------------------------------------------------------------------------
//
//  Internal settings.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Returns label index.
 * @return {number}
 */
anychart.core.ui.LabelsFactory.Label.prototype.getIndex = function() {
  return this.index_;
};


/**
 * Sets labels index.
 * @param {number} index Index to set.
 * @return {anychart.core.ui.LabelsFactory.Label}
 */
anychart.core.ui.LabelsFactory.Label.prototype.setIndex = function(index) {
  this.index_ = +index;
  return this;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Background and Padding.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Gets or sets the Label background settings.
 * @param {(string|Object|null|boolean)=} opt_value Background object to set.
 * @return {!(anychart.core.ui.LabelsFactory.Label|anychart.core.ui.Background)} Returns background or itself for chaining.
 */
anychart.core.ui.LabelsFactory.Label.prototype.background = function(opt_value) {
  var makeDefault = goog.isNull(opt_value);
  if (!makeDefault && !this.background_) {
    this.background_ = new anychart.core.ui.Background();
    this.background_.listenSignals(this.backgroundInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    if (makeDefault) {
      goog.dispose(this.background_);
      delete this.ownSettings['background'];
    } else {
      this.background_.setup(opt_value);
      this.updateComplexSettings();
    }
    return this;
  }
  return this.background_;
};


/**
 * Internal background invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.ui.LabelsFactory.Label.prototype.backgroundInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.updateComplexSettings();
    this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Getter for current label padding.<br/>
 * @param {(null|anychart.core.utils.Padding|string|number|Array.<number|string>|{top:(number|string),left:(number|string),bottom:(number|string),right:(number|string)})=} opt_spaceOrTopOrTopAndBottom .
 * @param {(string|number)=} opt_rightOrRightAndLeft .
 * @param {(string|number)=} opt_bottom .
 * @param {(string|number)=} opt_left .
 * @return {anychart.core.ui.LabelsFactory.Label|anychart.core.utils.Padding} .
 */
anychart.core.ui.LabelsFactory.Label.prototype.padding = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  var makeDefault = goog.isNull(opt_spaceOrTopOrTopAndBottom);
  if (!makeDefault && !this.padding_) {
    this.padding_ = new anychart.core.utils.Padding();
    this.setupCreated('padding', this.padding_);
    this.padding_.listenSignals(this.boundsInvalidated_, this);
  }
  if (goog.isDef(opt_spaceOrTopOrTopAndBottom)) {
    if (makeDefault) {
      goog.dispose(this.padding_);
      delete this.ownSettings['padding'];
    } else if (anychart.utils.instanceOf(opt_spaceOrTopOrTopAndBottom, anychart.core.utils.Padding)) {
      for (var name in anychart.core.utils.Space.SIMPLE_PROPS_DESCRIPTORS) {
        var val = opt_spaceOrTopOrTopAndBottom.getOption(name);
        this.padding_.setOption(name, val);
      }
      this.updateComplexSettings();
    } else {
      this.padding_.setup.apply(this.padding_, arguments);
      this.updateComplexSettings();
    }
    return this;
  }
  return this.padding_;
};


/**
 * Listener for bounds invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.core.ui.LabelsFactory.Label.prototype.boundsInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.updateComplexSettings();
    this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.BOUNDS_CHANGED);
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Auto settings.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Sets labels color that parent series have set for it.
 * @param {number=} opt_value Auto rotation angle.
 * @return {number|anychart.core.ui.LabelsFactory.Label}
 */
anychart.core.ui.LabelsFactory.Label.prototype.autoRotation = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.toNumber(opt_value);
    if (this.autoSettings['rotation'] !== opt_value) {
      this.autoSettings['rotation'] = opt_value;
      if (!goog.isDef(this.ownSettings['rotation']) || isNaN(this.ownSettings['rotation']))
        this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return isNaN(this.autoSettings['rotation']) ? undefined : this.autoSettings['rotation'];
  }
};


/**
 * Getter for label anchor settings.
 * @param {(anychart.enums.Anchor|string)=} opt_value .
 * @return {!anychart.core.ui.LabelsFactory.Label|anychart.enums.Anchor} .
 */
anychart.core.ui.LabelsFactory.Label.prototype.autoAnchor = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var value = anychart.core.ui.LabelsFactory.anchorNoAutoNormalizer(opt_value);
    if (this.autoSettings['anchor'] !== value) {
      this.autoSettings['anchor'] = value;
      if (!goog.isDef(this.ownSettings['anchor']))
        this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.autoSettings['anchor'];
  }
};


/**
 * Defines whether label is vertical.
 * @param {(boolean)=} opt_value .
 * @return {!anychart.core.ui.LabelsFactory.Label|boolean} .
 */
anychart.core.ui.LabelsFactory.Label.prototype.autoVertical = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var value = !!opt_value;
    if (this.autoSettings['vertical'] !== value) {
      this.autoSettings['vertical'] = value;
      if (!goog.isDef(this.autoSettings['vertical']))
        this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.autoSettings['vertical'];
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Providers.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Gets/Sets format provider.
 * @param {*=} opt_value Format provider.
 * @return {*} Format provider or self for chaining.
 */
anychart.core.ui.LabelsFactory.Label.prototype.formatProvider = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.formatProvider_ != opt_value) {
      this.formatProvider_ = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.formatProvider_;
  }
};


/**
 * Gets/Sets position provider.
 * @param {*=} opt_value Position provider.
 * @return {*} Position provider or self for chaining.
 */
anychart.core.ui.LabelsFactory.Label.prototype.positionProvider = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.positionProvider_ != opt_value) {
      this.positionProvider_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS |
        anychart.ConsistencyState.LABELS_FACTORY_POSITION, anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.positionProvider_;
  }
};


//endregion
//region --- IObjectWithSettings implementation
/**
 * Updating local settings for complex settings.
 */
anychart.core.ui.LabelsFactory.Label.prototype.updateComplexSettings = function() {
  if (this.background_)
    this.ownSettings['background'] = this.background_.ownSettings;
  if (this.padding_)
    this.ownSettings['padding'] = this.padding_.ownSettings;
};


/** @inheritDoc */
anychart.core.ui.LabelsFactory.Label.prototype.hasOwnOption = function(name) {
  return goog.isDefAndNotNull(this.ownSettings[name]);
};


/**
 * @override
 * @param {string} name
 * @return {*}
 */
anychart.core.ui.LabelsFactory.Label.prototype.getOption = function(name) {
  this.updateComplexSettings();
  return goog.isDef(this.ownSettings[name]) ? this.ownSettings[name] : this.themeSettings[name];
};


/**
 * Returns own and auto option value.
 * @param {string} name
 * @return {*}
 */
anychart.core.ui.LabelsFactory.Label.prototype.getOwnAndAutoOption = function(name) {
  this.updateComplexSettings();
  return this.ownSettings[name];
};


//endregion
//region --- Settings manipulations
/**
 * Measures plain text on label's settings. NOTE: avoid using string tokens.
 * @param {string} text - Text to measure.
 * @return {anychart.math.Rect}
 */
anychart.core.ui.LabelsFactory.Label.prototype.measureWithText = function(text) {
  var factory;
  if (this.factory_) {
    factory = this.factory_;
  } else {
    if (!anychart.core.ui.LabelsFactory.measureTextFactory) {
      anychart.core.ui.LabelsFactory.measureTextFactory = new anychart.core.ui.LabelsFactory();
      anychart.core.ui.LabelsFactory.measureTextFactory.setOption('positionFormatter', function() {
        return this['value'];
      });
    }
    factory = anychart.core.ui.LabelsFactory.measureTextFactory;
  }

  var sett = this.getMergedSettings();
  sett['format'] = String(text);
  return factory.measure({}, this.positionProvider(), sett);
};


/**
 * Reset settings.
 */
anychart.core.ui.LabelsFactory.Label.prototype.resetSettings = function() {
  goog.disposeAll(this.background_, this.padding_);
  this.background_ = null;
  this.padding_ = null;

  this.themeSettings = {};
  this.ownSettings = {};
  this.autoSettings = {};
  this.states_ = {
    'pointNormal': this
  };
  this.drawingPlan_ = null;
  if (this.factory_) {
    this.states_['seriesNormal'] = this.factory_;
    this.states_['seriesNormalTheme'] = this.factory_.themeSettings;
  }
  this.dropMergedSettings();
};


/**
 * Sets settings.
 * @param {Object=} opt_settings1 Settings1.
 * @param {Object=} opt_settings2 Settings2.
 * @return {anychart.core.ui.LabelsFactory.Label} Returns self for chaining.
 */
anychart.core.ui.LabelsFactory.Label.prototype.setSettings = function(opt_settings1, opt_settings2) {
  if (goog.isDef(opt_settings1)) {
    this.setup(opt_settings1);
  }
  if (goog.isDefAndNotNull(opt_settings2)) {
    this.states_['pointState'] = opt_settings2;
  }

  if (goog.isDef(opt_settings1) || goog.isDef(opt_settings2)) {
    this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.ENABLED,
        anychart.Signal.BOUNDS_CHANGED | anychart.Signal.NEEDS_REDRAW);
  }
  return this;
};


/**
 * Returns final value of settings with passed name.
 * @param {string} value Name of settings.
 * @return {*} settings value.
 */
anychart.core.ui.LabelsFactory.Label.prototype.getFinalSettings = function(value) {
  if (value == 'adjustFontSize') {
    var adjustByWidth = this.resolveSetting_(value, function(value) {
      return value.width;
    });
    var adjustByHeight = this.resolveSetting_(value, function(value) {
      return value.height;
    });
    return {width: adjustByWidth, height: adjustByHeight};
  } else {
    var result = this.resolveSetting_(value);
    if (value == 'background' && !goog.isDef(result))
      result = null;
    return result;
  }
};


/**
 * Drawing plans iterator.
 * @param {Function} processor .
 * @param {boolean=} opt_invert .
 * @param {string=} opt_field .
 * @param {Function=} opt_handler .
 * @return {*}
 */
anychart.core.ui.LabelsFactory.Label.prototype.iterateDrawingPlans = function(processor, opt_invert, opt_field, opt_handler) {
  var iterator = opt_invert ? goog.array.forEachRight : goog.array.forEach;

  var result = void 0;
  var settings = this.getDrawingPlan();

  iterator(settings, function(state, i) {
    var stateSettings = goog.isString(state) ? state == 'auto' ? this.autoSettings : this.states_[state] : state;

    if (!stateSettings)
      return;

    var processedSetting = processor.call(this, state, stateSettings, i, opt_field, opt_handler);
    if (goog.isDef(processedSetting)) {
      if (goog.typeOf(processedSetting) == 'object') {
        if (goog.isDefAndNotNull(result)) {
          opt_invert ? goog.object.extend(result, processedSetting) : goog.object.extend(processedSetting, result);
        } else {
          result = goog.object.clone(processedSetting);
        }
      } else {
        result = processedSetting;
      }
    }
  }, this);

  return result;
};


/**
 * AdjustFontSize normalizer.
 * @param {Object=} opt_value
 * @return {{width:boolean,height:boolean}} .
 */
anychart.core.ui.LabelsFactory.Label.normalizeAdjustFontSize = function(opt_value) {
  var adjustByWidth, adjustByHeight;
  if (goog.isDef(opt_value)) {
    if (goog.isArray(opt_value)) {
      adjustByWidth = opt_value[0];
      adjustByHeight = opt_value[1];
    } else if (goog.isObject(opt_value)) {
      adjustByWidth = opt_value['width'];
      adjustByHeight = opt_value['height'];
    } else {
      adjustByWidth = !!opt_value;
      adjustByHeight = !!opt_value;
    }
  } else {
    adjustByWidth = void 0;
    adjustByHeight = void 0;
  }

  return {width: adjustByWidth, height: adjustByHeight};
};


/**
 * Default function for processing settings.
 * @param {*} state
 * @param {anychart.core.ui.LabelsFactory|anychart.core.ui.LabelsFactory.Label|Object} settings
 * @param {number} index
 * @param {string} field
 * @param {Function=} opt_handler
 * @return {*}
 * @private
 */
anychart.core.ui.LabelsFactory.Label.defaultSettingsProcessor_ = function(state, settings, index, field, opt_handler) {
  var setting;

  if (anychart.utils.instanceOf(settings, anychart.core.ui.LabelsFactory.Label) || anychart.utils.instanceOf(settings, anychart.core.ui.LabelsFactory)) {
    if (field == 'enabled') {
      var result = settings[field]();
      setting = !goog.isNull(result) ? result : undefined;
    } else {
      setting = settings.getOwnAndAutoOption(field);
    }
  } else if (goog.typeOf(settings) == 'object') {
    if (field == 'adjustFontSize') {
      setting = anychart.core.ui.LabelsFactory.Label.normalizeAdjustFontSize(settings[field]);
    } else if (field == 'padding' && goog.isNumber(settings[field])) {
      setting = anychart.core.utils.Space.normalizeSpace(settings[field]);
    } else {
      setting = settings[field];
      if (field == 'enabled' && goog.isNull(setting))
        setting = undefined;
    }
  }
  if (setting) {
    if (goog.isFunction(setting.serialize)) {
      setting = setting.serialize();
    }
  }
  if (opt_handler && goog.isDef(setting))
    setting = opt_handler(setting);
  return setting;
};


/**
 * Settings resolver.
 * @param {string} field
 * @param {Function=} opt_handler
 * @return {*}
 * @private
 */
anychart.core.ui.LabelsFactory.Label.prototype.resolveSetting_ = function(field, opt_handler) {
  return this.iterateDrawingPlans(anychart.core.ui.LabelsFactory.Label.defaultSettingsProcessor_, true, field, opt_handler);
};


/**
 * Drops merged settings.
 */
anychart.core.ui.LabelsFactory.Label.prototype.dropMergedSettings = function() {
  this.mergedSettings = null;
};


/**
 * Returns merged settings.
 * @return {!Object}
 */
anychart.core.ui.LabelsFactory.Label.prototype.getMergedSettings = function() {
  var drawingPlan = this.getDrawingPlan();
  if (drawingPlan.length == 1) {
    var state = drawingPlan[0];
    this.mergedSettings = goog.isString(state) ? this.states_[state] : state;
  }

  if (this.mergedSettings)
    return goog.object.clone(this.mergedSettings);

  var factory = this.factory_;
  var fields = factory.settingsFieldsForMerge;

  var mergedSettings = {};
  for (var i = 0, len = fields.length; i < len; i++) {
    var field = fields[i];
    var finalSettings = this.getFinalSettings(field);

    if (field == 'adjustFontSize') {
      mergedSettings['adjustByWidth'] = finalSettings.width;
      mergedSettings['adjustByHeight'] = finalSettings.height;
    } else {
      mergedSettings[field] = finalSettings;
    }
  }

  this.mergedSettings = mergedSettings;
  return goog.object.clone(this.mergedSettings);
};


//endregion
//region --- Measuring and calculations
/**
 * Adjust font size by width/height.
 * @param {number} originWidth
 * @param {number} originHeight
 * @param {number} minFontSize
 * @param {number} maxFontSize
 * @param {boolean} adjustByWidth
 * @param {boolean} adjustByHeight
 * @return {number}
 */
anychart.core.ui.LabelsFactory.Label.prototype.calculateFontSize = function(originWidth, originHeight, minFontSize, maxFontSize, adjustByWidth, adjustByHeight) {
  /** @type {acgraph.vector.Text} */
  var text = this.createSizeMeasureElement_();

  var evaluator = function(fontSize) {
    text.fontSize(fontSize);
    var bounds = text.getBounds();
    var width = bounds.width;
    var height = bounds.height;
    var res;
    if (adjustByWidth && (width > originWidth) || adjustByHeight && (height > originHeight)) {
      res = -1;
    } else if (adjustByWidth && (width == originWidth) || adjustByHeight && (height == originHeight)) {
      res = 0;
    } else {
      res = 1;
    }
    return res;
  };

  var fonts = goog.array.range(minFontSize, maxFontSize + 1);
  var res = goog.array.binarySelect(fonts, evaluator);
  if (res < 0) {
    res = ~res - 1;
  }
  return fonts[goog.math.clamp(res, 0, fonts.length)];
};


/**
 * Creates and returns size measure element.
 * @return {!acgraph.vector.Text}
 * @private
 */
anychart.core.ui.LabelsFactory.Label.prototype.createSizeMeasureElement_ = function() {
  var mergedSettings = this.getMergedSettings();

  var isHtml = mergedSettings['useHtml'];
  var formatProvider = this.formatProvider();
  if (this.hasInvalidationState(anychart.ConsistencyState.LABELS_FACTORY_CACHE)) {
    this.factory_.dropCallsCache(this.getIndex());
    this.markConsistent(anychart.ConsistencyState.LABELS_FACTORY_CACHE);
  }
  var text = this.factory_.callFormat(mergedSettings['format'], formatProvider, this.getIndex());

  if (!this.fontSizeMeasureElement_) {
    this.fontSizeMeasureElement_ = acgraph.text();
    this.fontSizeMeasureElement_.attr('aria-hidden', 'true');
  }

  if (isHtml) this.fontSizeMeasureElement_.htmlText(goog.isDef(text) ? String(text) : '');
  else this.fontSizeMeasureElement_.text(goog.isDef(text) ? String(text) : '');

  this.iterateDrawingPlans(function(state, settings, index) {
    var isInit = index == 0;
    if (anychart.utils.instanceOf(settings, anychart.core.ui.LabelsFactory) || anychart.utils.instanceOf(settings, anychart.core.ui.LabelsFactory.Label)) {
      this.applyTextSettings.call(settings, this.fontSizeMeasureElement_, isInit);
    } else {
      this.applyTextSettings(this.fontSizeMeasureElement_, isInit, settings);
    }
  }, true);

  return this.fontSizeMeasureElement_;
};


//endregion
//region --- Drawing
/**
 * Resets label to the initial state, but leaves DOM elements intact, but without the parent.
 */
anychart.core.ui.LabelsFactory.Label.prototype.clear = function() {
  this.resetSettings();
  if (this.layer_) {
    this.layer_.parent(null);
    this.layer_.removeAllListeners();
  }
  this.invalidate(anychart.ConsistencyState.CONTAINER);
};


/**
 * Label drawing.
 * @param {anychart.math.Rect} bounds Outter label bounds.
 * @param {anychart.math.Rect} parentBounds Parent bounds.
 */
anychart.core.ui.LabelsFactory.Label.prototype.drawLabel = function(bounds, parentBounds) {
  if (!this.mergedSettings)
    this.getMergedSettings();

  var positionFormatter = this.mergedSettings['positionFormatter'];
  var isTextByPath = this.isComplex && this.textElement.path();
  var anchor = isTextByPath ?
      anychart.enums.Anchor.CENTER :
      anychart.core.ui.LabelsFactory.anchorNoAutoNormalizer(this.mergedSettings['anchor']) || anychart.enums.Anchor.LEFT_TOP;

  var isVertical = this.autoVertical();

  var offsetX = this.mergedSettings['offsetX'];
  var offsetY = this.mergedSettings['offsetY'];

  var parentWidth = 0, parentHeight = 0;
  if (parentBounds) {
    parentWidth = parentBounds.width;
    parentHeight = parentBounds.height;
  }

  var positionProvider = this.positionProvider();
  var formattedPosition = goog.object.clone(positionFormatter.call(positionProvider, positionProvider));
  var position = new goog.math.Coordinate(formattedPosition['x'], formattedPosition['y']);

  var connectorPoint = positionProvider && positionProvider['connectorPoint'];
  if (this.connector) {
    this.connector.clear();
    this.connector.setTransformationMatrix(1, 0, 0, 1, 0, 0);
  }
  if (connectorPoint) {
    if (!this.connector) {
      this.connector = this.layer_.path();
      this.connector.disableStrokeScaling(true);
    }
    this.connector.stroke(this.mergedSettings['connectorStroke']);
    var formattedConnectorPosition = goog.object.clone(positionFormatter.call(connectorPoint, connectorPoint));
    this.connector.moveTo(position.x, position.y).lineTo(formattedConnectorPosition['x'], formattedConnectorPosition['y']);
  }

  var anchorCoordinate = anychart.utils.getCoordinateByAnchor(
      new anychart.math.Rect(0, 0, bounds.width, bounds.height), anchor);

  position.x -= anchorCoordinate.x;
  position.y -= anchorCoordinate.y;

  var offsetXNormalized = goog.isDef(offsetX) ? anychart.utils.normalizeSize(/** @type {number|string} */(offsetX), parentWidth) : 0;
  var offsetYNormalized = goog.isDef(offsetY) ? anychart.utils.normalizeSize(/** @type {number|string} */(offsetY), parentHeight) : 0;

  if (isVertical)
    anychart.utils.applyOffsetByAnchor(position, anchor, offsetYNormalized, offsetXNormalized);
  else
    anychart.utils.applyOffsetByAnchor(position, anchor, offsetXNormalized, offsetYNormalized);

  bounds.left = position.x;
  bounds.top = position.y;

  // if (!this.anchPoint)
  //   this.anchPoint = this.container().circle(position.x, position.y, 2).fill('red').stroke('black').zIndex(1000);
  // this.anchPoint.center({x: position.x, y: position.y});
  //
  // if (!this.labelBounds)
  //   this.labelBounds = this.container().rect().fill('none').stroke('red').zIndex(1000);
  // this.labelBounds.setBounds(new anychart.math.rect(this.bounds_.left, this.bounds_.top, this.bounds_.width, this.bounds_.height));

  if (this.isComplexText()) {
    this.textElement.x(/** @type {number} */(this.textX + position.x)).y(/** @type {number} */(this.textY + position.y));
  } else {
    this.textElement.setPosition(/** @type {number} */(this.textX + position.x), /** @type {number} */(this.textY + position.y));
  }
};


/**
 * Connector drawing.
 */
anychart.core.ui.LabelsFactory.Label.prototype.drawConnector = function() {
  var positionProvider = this.positionProvider();
  var positionFormatter = this.mergedSettings['positionFormatter'];
  var formattedPosition = goog.object.clone(positionFormatter.call(positionProvider, positionProvider));

  var connectorPoint = positionProvider && positionProvider['connectorPoint'];
  if (this.connector) {
    this.connector.clear();
    this.connector.setTransformationMatrix(1, 0, 0, 1, 0, 0);
  }
  if (connectorPoint) {
    if (!this.connector) {
      this.connector = this.layer_.path();
      this.connector.disableStrokeScaling(true);
    }
    this.connector.stroke(this.mergedSettings['connectorStroke']);
    var formattedConnectorPosition = goog.object.clone(positionFormatter.call(connectorPoint, connectorPoint));
    this.connector.moveTo(formattedPosition['x'], formattedPosition['y']).lineTo(formattedConnectorPosition['x'], formattedConnectorPosition['y']);
  }
};


/**
 * Applies text settings to text element.
 * @param {!acgraph.vector.Text|!anychart.core.ui.Text} textElement Text element to apply settings to.
 * @param {boolean} isInitial - Whether is initial operation.
 * @param {Object=} opt_settings .
 * @this {anychart.core.ui.LabelsFactory.Label|anychart.core.ui.LabelsFactory}
 */
anychart.core.ui.LabelsFactory.Label.prototype.applyTextSettings = function(textElement, isInitial, opt_settings) {
  var textVal, useHtml, text;
  var target = goog.isDef(opt_settings) ?
      function(value) { return opt_settings[value]; } :
      anychart.utils.instanceOf(this, anychart.core.ui.LabelsFactory.Label) ?
          this.getOwnOption :
          anychart.core.ui.LabelsFactory.prototype.getOwnAndAutoOption;

  if (anychart.utils.instanceOf(textElement, acgraph.vector.Text)) {
    textVal = target.call(this, 'text');
    useHtml = target.call(this, 'useHtml');

    if (isInitial || goog.isDef(textVal) || goog.isDef(useHtml)) {
      text = /** @type {string} */(textVal);
      if (useHtml) {
        textElement.htmlText(text);
      } else {
        textElement.text(text);
      }
    }

    textElement.fontSize(/** @type {number|string} */ (target.call(this, 'fontSize')));
    textElement.fontFamily(/** @type {string} */ (target.call(this, 'fontFamily')));
    textElement.color(/** @type {string} */ (target.call(this, 'fontColor')));
    textElement.opacity(/** @type {number} */ (target.call(this, 'fontOpacity')));
    textElement.direction(/** @type {string} */ (target.call(this, 'textDirection')));
    textElement.fontStyle(/** @type {string} */ (target.call(this, 'fontStyle')));
    textElement.fontVariant(/** @type {string} */ (target.call(this, 'fontVariant')));
    textElement.decoration(/** @type {string} */ (target.call(this, 'fontDecoration')));
    textElement.fontWeight(/** @type {number|string} */ (target.call(this, 'fontWeight')));
    textElement.letterSpacing(/** @type {number|string} */ (target.call(this, 'letterSpacing')));
    textElement.lineHeight(/** @type {number|string} */ (target.call(this, 'lineHeight')));
    textElement.textIndent(/** @type {number} */ (target.call(this, 'textIndent')));
    textElement.textShadow(/** @type {string} */ (target.call(this, 'textShadow')));
    textElement.vAlign(/** @type {string} */ (target.call(this, 'vAlign')));
    textElement.hAlign(/** @type {string} */ (target.call(this, 'hAlign')));
    textElement.textOverflow(/** @type {string} */ (target.call(this, 'textOverflow')));
    textElement.selectable(/** @type {boolean} */ (target.call(this, 'selectable')));
    textElement.disablePointerEvents(/** @type {boolean} */ (target.call(this, 'disablePointerEvents')));
    textElement.wordWrap(/** @type {string} */ (target.call(this, 'wordWrap')));
    textElement.wordBreak(/** @type {string} */ (target.call(this, 'wordBreak')));
  } else {
    var fields = anychart.core.ui.LabelsFactory.textFields;
    var style = {};

    for (var i = 0, len = fields.length; i < len; i++) {
      var field = fields[i];
      style[field] = target.call(this, field);
    }
    textElement.style(style);
    textElement.applySettings();
  }
};


/**
 * Whether is complex text. The complex text has
 * @return {boolean}
 */
anychart.core.ui.LabelsFactory.Label.prototype.isComplexText = function() {
  if (goog.isBoolean(this.isComplex))
    return this.isComplex;

  var mergedSettings = this.getMergedSettings();

  var isWidthSet = !goog.isNull(mergedSettings['width']);
  var isHeightSet = !goog.isNull(mergedSettings['height']);
  var isHtml = mergedSettings['useHtml'];
  var isTextByPath = this.textElement ? !!this.textElement.path() : false;

  var text = String(this.factory_.callFormat(mergedSettings['format'], this.formatProvider(), this.getIndex()));

  text = goog.string.canonicalizeNewlines(goog.string.normalizeSpaces(text));
  var textArr = text.split(/\n/g);

  return textArr.length != 1 || isWidthSet || isHeightSet || isHtml || isTextByPath;
};


/**
 * @return {boolean}
 */
anychart.core.ui.LabelsFactory.Label.prototype.needChangeDomElement = function() {
  var isComplex = this.isComplexText();
  var isSimpleDom = anychart.utils.instanceOf(this.textElement, anychart.core.ui.Text);
  var isComplexDom = anychart.utils.instanceOf(this.textElement, acgraph.vector.Text);

  return !this.textElement || (isComplex && isSimpleDom) || (!isComplex && isComplexDom);
};


/**
 * First drawing.
 */
anychart.core.ui.LabelsFactory.Label.prototype.firstDraw = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    this.dropMergedSettings();
  }
  var enabled = this.getFinalSettings('enabled');

  if (!this.isComplexText() && enabled) {
    var textElement = this.textElement;

    if (this.needChangeDomElement() || (this.layer_ && !this.layer_.parent())) {
      textElement = this.getTextElement();
      var measurementNode = acgraph.getRenderer().createMeasurement();
      textElement.renderTo(measurementNode);

      if (this.simpleTextLayer) {
        this.simpleTextLayer.content(null);
      }
    }

    var mergedSettings = this.getMergedSettings();
    var text = this.factory_.callFormat(mergedSettings['format'], this.formatProvider(), this.getIndex());
    textElement.text(goog.isDef(text) ? String(text) : '');
    this.applyTextSettings(textElement, true, mergedSettings);
  }
};


/**
 * Label drawing.
 * @return {anychart.core.ui.LabelsFactory.Label} Returns self for chaining.
 */
anychart.core.ui.LabelsFactory.Label.prototype.draw = function() {
  var factory = this.factory_;
  var mergedSettings, isBackgroundEnabled, isComplex;

  if (!this.layer_) this.layer_ = acgraph.layer();
  this.layer_.tag = this.index_;

  var enabled = this.getFinalSettings('enabled');

  if (this.checkInvalidationState(anychart.ConsistencyState.ENABLED)) {
    if (!enabled) {
      if (this.layer_) this.layer_.parent(null);
      this.markConsistent(anychart.ConsistencyState.ENABLED);
      return this;
    } else {
      if (this.container() && !this.layer_.parent())
        this.layer_.parent(/** @type {acgraph.vector.ILayer} */(this.container()));
      this.markConsistent(anychart.ConsistencyState.ENABLED);
    }
  }

  if (!enabled)
    return this;

  if (this.checkInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    if (enabled) {

      if ((!this.factory_.enabled() || (goog.isDef(this.enabled()) && !this.enabled())) && this.factory_.getDomElement()) {
        if (!this.container()) this.container(factory.getDomElement());
        if (!this.container().parent()) {
          this.container().parent(/** @type {acgraph.vector.ILayer} */(factory.container()));
        }
      }

      if (this.container()) {
        isComplex = this.isComplexText();
        if (!isComplex) {
          if (!this.simpleTextLayer) {
            this.simpleTextLayer = acgraph.unmanagedLayer();
            this.simpleTextLayer.zIndex(1);
          }
          this.simpleTextLayer.parent(this.layer_);
          // hack
          this.simpleTextLayer.content(null);
          this.simpleTextLayer.content(this.textElement.getDomElement());
        } else {
          this.layer_.parent(/** @type {acgraph.vector.ILayer} */(this.container()));
        }
      }
    }
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    if (this.container()) this.container().zIndex(/** @type {number} */(factory.zIndex()));
    this.layer_.zIndex(/** @type {number} */(this.zIndex()));
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.LABELS_FACTORY_CACHE)) {
    factory.dropCallsCache(this.getIndex());
    this.markConsistent(anychart.ConsistencyState.LABELS_FACTORY_CACHE);
  }

  if (this.checkInvalidationState(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.BOUNDS)) {
    this.updateComplexSettings();
    this.dropMergedSettings();

    isComplex = this.isComplexText();
    mergedSettings = this.getMergedSettings();

    //define is width and height set from settings
    var isWidthSet = !goog.isNull(mergedSettings['width']);
    var isHeightSet = !goog.isNull(mergedSettings['height']);
    var isHtml = mergedSettings['useHtml'];

    var formatProvider = this.formatProvider();
    var text = factory.callFormat(mergedSettings['format'], formatProvider, this.getIndex());

    this.layer_.setTransformationMatrix(1, 0, 0, 1, 0, 0);

    var bgSettings = mergedSettings['background'];
    var backgroundJson = mergedSettings['background'];

    if (goog.isObject(backgroundJson) && backgroundJson && !('enabled' in backgroundJson))
      backgroundJson['enabled'] = false;

    isBackgroundEnabled = goog.isString(backgroundJson) ||
        goog.isBoolean(backgroundJson) ||
        (backgroundJson && backgroundJson['enabled']);

    if (isBackgroundEnabled || this.backgroundElement_) {
      if (!this.backgroundElement_) {
        this.backgroundElement_ = new anychart.core.ui.Background();
        this.backgroundElement_.zIndex(0);
        this.backgroundElement_.container(this.layer_);
      }
      if (this.initBgSettings)
        this.backgroundElement_.setup(anychart.utils.instanceOf(this.initBgSettings, anychart.core.ui.Background) ? this.initBgSettings.serialize() : this.initBgSettings);
      this.backgroundElement_.setup(backgroundJson);
      this.backgroundElement_.draw();
    } else if (bgSettings) {
      this.initBgSettings = bgSettings;
    }

    this.getTextElement();

    if (!isComplex) {
      if (!this.simpleTextLayer) {
        this.simpleTextLayer = acgraph.unmanagedLayer();
        this.simpleTextLayer.zIndex(1);
      }
      this.simpleTextLayer.parent(this.layer_);
      this.simpleTextLayer.content(this.textElement.getDomElement());
    } else {
      this.textElement.parent(this.layer_);
    }

    //define parent bounds
    var parentWidth, parentHeight;
    this.finalParentBounds = /** @type {anychart.math.Rect} */(this.iterateDrawingPlans(function(state, settings) {
      var parentBounds = anychart.utils.instanceOf(settings, anychart.core.ui.LabelsFactory) ?
        settings.parentBounds() :
        !anychart.utils.instanceOf(settings, anychart.core.ui.LabelsFactory.Label) ?
          settings.parentBounds : null;
      if (parentBounds) {
        return parentBounds;
      }
    }, true));

    if (!this.finalParentBounds) {
      var parentBounds = this.parentBounds();
      if ((factory.container() || parentBounds) && isComplex) {
        this.finalParentBounds = parentBounds ? parentBounds : factory.container().getBounds();
      } else {
        this.finalParentBounds = anychart.math.rect(0, 0, 0, 0);
      }

    }
    if (this.finalParentBounds) {
      parentWidth = this.finalParentBounds.width;
      parentHeight = this.finalParentBounds.height;
    }

    if (isComplex) {
      this.textElement.width(null);
      this.textElement.height(null);

      if (isHtml) this.textElement.htmlText(goog.isDef(text) ? String(text) : '');
      else this.textElement.text(goog.isDef(text) ? String(text) : '');
    } else {
      this.textElement.text(goog.isDef(text) ? String(text) : '');
    }

    this.applyTextSettings(this.textElement, true, mergedSettings);

    /** @type  {anychart.math.Rect} */
    var outerBounds = new anychart.math.Rect(0, 0, 0, 0);
    //calculate text width and outer width

    var padding;
    if (anychart.utils.instanceOf(mergedSettings['padding'], anychart.core.utils.Padding)) {
      padding = mergedSettings['padding'];
    } else if (goog.isObject(mergedSettings['padding']) || goog.isNumber(mergedSettings['padding']) || goog.isString(mergedSettings['padding'])) {
      padding = new anychart.core.utils.Padding();
      this.registerDisposable(padding);
      padding.setup(mergedSettings['padding']);
    }

    var autoWidth, autoHeight;
    var textElementBounds;

    var width, textWidth, height, textHeight;

    if (isWidthSet || isHeightSet) {
      if (isWidthSet) {
        width = Math.ceil(anychart.utils.normalizeSize(/** @type {number|string} */(mergedSettings['width']), parentWidth));
        if (padding) {
          textWidth = padding.tightenWidth(width);
          this.textX = anychart.utils.normalizeSize(padding.getOption('left'), width);
        } else {
          this.textX = 0;
          textWidth = width;
        }
        outerBounds.width = width;
        autoWidth = false;
      } else {
        //we should ask text element about bounds only after text format and text settings are applied
        textElementBounds = this.textElement.getBounds();
        width = textElementBounds.width;
        if (padding) {
          outerBounds.width = padding.widenWidth(width);
          this.textX = anychart.utils.normalizeSize(padding.getOption('left'), outerBounds.width);
        } else {
          this.textX = 0;
          outerBounds.width = width;
        }
        autoWidth = true;
      }

      if (goog.isDef(textWidth)) this.textElement.width(textWidth);

      if (isHeightSet) {
        height = Math.ceil(anychart.utils.normalizeSize(/** @type {number|string} */(mergedSettings['height']), parentHeight));
        if (padding) {
          textHeight = padding.tightenHeight(height);
          this.textY = anychart.utils.normalizeSize(padding.getOption('top'), height);
        } else {
          this.textY = 0;
          textHeight = height;
        }
        outerBounds.height = height;
        autoHeight = false;
      } else {
        //we should ask text element about bounds only after text format and text settings are applied
        textElementBounds = this.textElement.getBounds();
        height = textElementBounds.height;
        if (padding) {
          outerBounds.height = padding.widenHeight(height);
          this.textY = anychart.utils.normalizeSize(padding.getOption('top'), outerBounds.height);
        } else {
          this.textY = 0;
          outerBounds.height = height;
        }
        autoHeight = true;
      }

      if (goog.isDef(textHeight)) this.textElement.height(textHeight);
    } else {
      textElementBounds = this.textElement.getBounds();

      width = textElementBounds.width;
      height = textElementBounds.height;
      if (padding) {
        outerBounds.width = padding.widenWidth(width);
        this.textX = anychart.utils.normalizeSize(padding.getOption('left'), outerBounds.width);
        outerBounds.height = padding.widenHeight(height);
        this.textY = anychart.utils.normalizeSize(padding.getOption('top'), outerBounds.height);
      } else {
        this.textX = 0;
        outerBounds.width = width;
        this.textY = 0;
        outerBounds.height = height;
      }

      autoWidth = true;
      autoHeight = true;
    }

    var canAdjustByWidth = !autoWidth;
    var canAdjustByHeight = !autoHeight;
    var needAdjust = ((canAdjustByWidth && mergedSettings['adjustByHeight']) || (canAdjustByHeight && mergedSettings['adjustByHeight']));

    if (needAdjust) {
      var calculatedFontSize;
      if (factory.adjustFontSizeMode() == anychart.enums.AdjustFontSizeMode.DIFFERENT) {
        calculatedFontSize = this.calculateFontSize(
            textWidth,
            textHeight,
            mergedSettings['minFontSize'],
            mergedSettings['maxFontSize'],
            mergedSettings['adjustByWidth'],
            mergedSettings['adjustByHeight']);
      } else {
        calculatedFontSize = this.iterateDrawingPlans(function(state, settings) {
          if (anychart.utils.instanceOf(settings, anychart.core.ui.LabelsFactory)) {
            if (goog.isDef(settings.autoSettings['fontSize']))
              return settings.autoSettings['fontSize'];
          }
        }, true);
      }

      this.suspendSignalsDispatching();

      this.textElement.fontSize(/** @type {number|string} */(calculatedFontSize));

      //need fix outer bounds after applying adjust font size
      if (isWidthSet) {
        width = Math.ceil(anychart.utils.normalizeSize(/** @type {number|string} */(mergedSettings['width']), parentWidth));
        outerBounds.width = width;
      } else {
        //we should ask text element about bounds only after text format and text settings are applied
        textElementBounds = this.textElement.getBounds();
        width = textElementBounds.width;
        if (padding) {
          outerBounds.width = padding.widenWidth(width);
        } else {
          outerBounds.width = width;
        }
      }

      if (isHeightSet) {
        height = Math.ceil(anychart.utils.normalizeSize(/** @type {number|string} */(mergedSettings['height']), parentHeight));
        outerBounds.height = height;
      } else {
        //we should ask text element about bounds only after text format and text settings are applied
        textElementBounds = this.textElement.getBounds();
        height = textElementBounds.height;
        if (padding) {
          outerBounds.height = padding.widenHeight(height);
        } else {
          outerBounds.height = height;
        }
      }

      this.resumeSignalsDispatching(false);
    }
    this.bounds_ = outerBounds;

    this.invalidate(anychart.ConsistencyState.LABELS_FACTORY_POSITION);
    this.markConsistent(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.BOUNDS);
  }

  if (this.checkInvalidationState(anychart.ConsistencyState.LABELS_FACTORY_POSITION)) {
    this.drawLabel(this.bounds_, this.finalParentBounds);

    if (isBackgroundEnabled) {
      this.backgroundElement_.parentBounds(this.bounds_);
      this.backgroundElement_.draw();
    }

    if (this.mergedSettings['rotation']) {
      var coordinateByAnchor = anychart.utils.getCoordinateByAnchor(this.bounds_, this.mergedSettings['anchor']);
      var tx = goog.math.AffineTransform.getRotateInstance(goog.math.toRadians(/** @type {number} */(this.mergedSettings['rotation'])),
          coordinateByAnchor.x, coordinateByAnchor.y);

      this.layer_.setTransformationMatrix(tx.getScaleX(), tx.getShearY(), tx.getShearX(), tx.getScaleY(), tx.getTranslateX(), tx.getTranslateY());
    }

    this.invalidate(anychart.ConsistencyState.LABELS_FACTORY_CONNECTOR);
    this.markConsistent(anychart.ConsistencyState.LABELS_FACTORY_POSITION);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.LABELS_FACTORY_CONNECTOR)) {
    this.drawConnector();
    this.markConsistent(anychart.ConsistencyState.LABELS_FACTORY_CONNECTOR);
  }

  if (this.checkInvalidationState(anychart.ConsistencyState.LABELS_FACTORY_CLIP)) {
    if (this.layer_)
      this.layer_.clip(this.mergedSettings['clip']);
    this.markConsistent(anychart.ConsistencyState.LABELS_FACTORY_CLIP);
  }
  return this;
};


/**
 * @param {?boolean} value .
 */
anychart.core.ui.LabelsFactory.Label.prototype.setComplex = function(value) {
  this.isComplex = value;
};


/**
 * Returns the textElement.
 * @return {!(acgraph.vector.Text|anychart.core.ui.Text)}
 */
anychart.core.ui.LabelsFactory.Label.prototype.getTextElement = function() {
  var isSimpleDom = anychart.utils.instanceOf(this.textElement, anychart.core.ui.Text);
  var isComplexDom = anychart.utils.instanceOf(this.textElement, acgraph.vector.Text);

  if (this.needChangeDomElement()) {
    if (isSimpleDom && this.simpleTextLayer) {
      this.simpleTextLayer.parent(null);
    } else if (isComplexDom && this.textElement) {
      this.textElement.parent(null);
    }

    if (this.isComplexText()) {
      this.textElement = new acgraph.vector.Text();

      this.textElement.attr('aria-hidden', 'true');
      this.textElement.zIndex(1);
      this.textElement.disablePointerEvents(true);
    } else {
      this.textElement = new anychart.core.ui.Text();
      this.textElement.getDomElement().setAttribute('aria-hidden', 'true');
    }
  }

  return /** @type {!(acgraph.vector.Text|anychart.core.ui.Text)} */(this.textElement);
};


//endregion
//region --- Setup & Dispose
/** @inheritDoc */
anychart.core.ui.LabelsFactory.Label.prototype.serialize = function() {
  var json = anychart.core.ui.LabelsFactory.Label.base(this, 'serialize');
  var val;
  if (goog.isDef(this.getOwnOption('background'))) {
    val = this.background().serialize();
    if (!goog.object.isEmpty(val))
      json['background'] = val;
  }
  if (goog.isDef(this.getOwnOption('padding'))) {
    val = this.padding().serialize();
    if (!goog.object.isEmpty(val))
      json['padding'] = val;
  }

  anychart.core.settings.serialize(this, this.TEXT_DESCRIPTORS, json, 'Labels factory label text');
  anychart.core.settings.serialize(this, this.SIMPLE_PROPS_DESCRIPTORS, json, 'Labels factory label props');

  var adjustFontSize = json['adjustFontSize'];
  if (!(adjustFontSize && (goog.isDef(adjustFontSize['width']) || goog.isDef(adjustFontSize['height']))))
    delete json['adjustFontSize'];

  if (!this.hasOwnOption('enabled'))
    delete json['enabled'];

  return json;
};


/** @inheritDoc */
anychart.core.ui.LabelsFactory.Label.prototype.setupByJSON = function(config, opt_default) {
  var enabledState = this.getOption('enabled');

  anychart.core.settings.deserialize(this, this.TEXT_DESCRIPTORS, config);
  anychart.core.settings.deserialize(this, this.SIMPLE_PROPS_DESCRIPTORS, config);

  anychart.core.ui.LabelsFactory.Label.base(this, 'setupByJSON', config, opt_default);

  if (!goog.isDef(config['enabled'])) delete this.ownSettings['enabled'];
  this.setOption('enabled', 'enabled' in config ? config['enabled'] : enabledState);

  var propName = 'background';
  if (propName in config) {
    var background = this.background();
    if (opt_default) {
      background.setupInternal(!!opt_default, config[propName]);
    } else {
      this.background(config[propName]);
    }
    this.themeSettings[propName] = background.themeSettings;
    this.ownSettings[propName] = background.ownSettings;
  }

  propName = 'padding';
  if (propName in config) {
    var padding = this.padding();
    if (opt_default) {
      padding.setupInternal(!!opt_default, config[propName]);
    } else {
      this.padding(config[propName]);
    }
    this.themeSettings[propName] = padding.themeSettings;
    this.ownSettings[propName] = padding.ownSettings;
  }
};


/** @inheritDoc */
anychart.core.ui.LabelsFactory.Label.prototype.disposeInternal = function() {
  goog.disposeAll(
      this.background_,
      this.padding_,
      this.backgroundElement_,
      this.textElement,
      this.layer_,
      this.fontSizeMeasureElement_);

  this.backgroundElement_ = null;
  this.textElement = null;
  this.background_ = null;
  this.padding_ = null;
  this.layer_ = null;
  this.fontSizeMeasureElement_ = null;

  anychart.core.ui.LabelsFactory.Label.base(this, 'disposeInternal');
};



//endregion
//region --- anychart.standalones.LabelsFactory
//------------------------------------------------------------------------------
//
//  anychart.standalones.LabelsFactory
//
//------------------------------------------------------------------------------
/**
 * @constructor
 * @extends {anychart.core.ui.LabelsFactory}
 */
anychart.standalones.LabelsFactory = function() {
  anychart.standalones.LabelsFactory.base(this, 'constructor');
};
goog.inherits(anychart.standalones.LabelsFactory, anychart.core.ui.LabelsFactory);
anychart.core.makeStandalone(anychart.standalones.LabelsFactory, anychart.core.ui.LabelsFactory);


/** @inheritDoc */
anychart.standalones.LabelsFactory.prototype.createLabel = function() {
  return new anychart.standalones.LabelsFactory.Label();
};



/**
 * @constructor
 * @extends {anychart.core.ui.LabelsFactory.Label}
 */
anychart.standalones.LabelsFactory.Label = function() {
  anychart.standalones.LabelsFactory.Label.base(this, 'constructor');
};
goog.inherits(anychart.standalones.LabelsFactory.Label, anychart.core.ui.LabelsFactory.Label);


/**
 * Constructor function.
 * @return {!anychart.standalones.LabelsFactory}
 */
anychart.standalones.labelsFactory = function() {
  var factory = new anychart.standalones.LabelsFactory();
  factory.setupInternal(true, anychart.getFullTheme('standalones.labelsFactory'));
  return factory;
};


//endregion
//region --- Exports
//exports
(function() {
  var proto = anychart.core.ui.LabelsFactory.prototype;
  proto['background'] = proto.background;
  proto['padding'] = proto.padding;
  proto['enabled'] = proto.enabled;
  proto['getLabel'] = proto.getLabel;
  proto['getLabelsCount'] = proto.labelsCount;
  // proto['textFormatter'] = proto.textFormatter;
  // proto['positionFormatter'] = proto.positionFormatter;
  // proto['position'] = proto.position;
  // proto['anchor'] = proto.anchor;
  // proto['offsetX'] = proto.offsetX;
  // proto['offsetY'] = proto.offsetY;
  // proto['connectorStroke'] = proto.connectorStroke;
  // proto['rotation'] = proto.rotation;
  // proto['width'] = proto.width;
  // proto['height'] = proto.height;
  // proto['adjustFontSize'] = proto.adjustFontSize;
  // proto['minFontSize'] = proto.minFontSize;
  // proto['maxFontSize'] = proto.maxFontSize;

  proto = anychart.core.ui.LabelsFactory.Label.prototype;
  proto['getIndex'] = proto.getIndex;
  proto['padding'] = proto.padding;
  proto['background'] = proto.background;
  proto['clear'] = proto.clear;
  proto['measureWithText'] = proto.measureWithText;
  proto['draw'] = proto.draw;
  // proto['autoAnchor'] = proto.autoAnchor;//don't public
  // proto['autoRotation'] = proto.autoRotation;//don't public
  // proto['rotation'] = proto.rotation;
  // proto['textFormatter'] = proto.textFormatter;
  // proto['positionFormatter'] = proto.positionFormatter;
  // proto['position'] = proto.position;
  // proto['anchor'] = proto.anchor;
  // proto['offsetX'] = proto.offsetX;
  // proto['offsetY'] = proto.offsetY;
  // proto['connectorStroke'] = proto.connectorStroke;
  // proto['width'] = proto.width;
  // proto['height'] = proto.height;
  // proto['enabled'] = proto.enabled;
  // proto['adjustFontSize'] = proto.adjustFontSize;
  // proto['minFontSize'] = proto.minFontSize;
  // proto['maxFontSize'] = proto.maxFontSize;


  proto = anychart.standalones.LabelsFactory.prototype;
  goog.exportSymbol('anychart.standalones.labelsFactory', anychart.standalones.labelsFactory);
  proto['draw'] = proto.draw;
  proto['parentBounds'] = proto.parentBounds;
  proto['container'] = proto.container;
  proto['add'] = proto.add;
  proto['clear'] = proto.clear;
  proto['measure'] = proto.measure;
  proto['measureWithTransform'] = proto.measureWithTransform;
})();
//endregion
