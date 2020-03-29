goog.provide('anychart.core.Text');

goog.require('acgraph');
goog.require('anychart.core.VisualBase');
goog.require('anychart.core.settings');
goog.require('anychart.enums');
goog.require('goog.array');



/**
 * This class is responsible of the text formatting, it processes the plain text and the text in HTML format.
 * @constructor
 * @extends {anychart.core.VisualBase}
 * @implements {anychart.core.settings.IResolvable}
 */
anychart.core.Text = function() {
  anychart.core.Text.base(this, 'constructor');

  /**
   * Parent settings storage.
   * @type {?anychart.core.Text}
   * @private
   */
  this.parent_ = null;

  /**
   * @type {Object.<string, anychart.core.Text>}
   */
  this.childTextMap = {};

  /**
   * Resolution chain cache.
   * @type {?Array.<Object|null|undefined>}
   * @private
   */
  this.resolutionChainCache_ = null;

  var boundsState = anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.BOUNDS;
  var noBoundsState = anychart.ConsistencyState.APPEARANCE;
  var boundsSignal = anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED;
  var noBoundsSignal = anychart.Signal.NEEDS_REDRAW;

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['fontSize', boundsState, boundsSignal],
    ['fontFamily', boundsState, boundsSignal],
    ['fontColor', noBoundsState, noBoundsSignal],
    ['fontOpacity', noBoundsState, noBoundsSignal],
    ['fontDecoration', boundsState, boundsSignal],
    ['fontStyle', boundsState, boundsSignal],
    ['fontVariant', boundsState, boundsSignal],
    ['fontWeight', boundsState, boundsSignal],
    ['letterSpacing', boundsState, boundsSignal],
    ['textDirection', boundsState, boundsSignal],
    ['lineHeight', boundsState, boundsSignal],
    ['textIndent', boundsState, boundsSignal],
    ['textShadow', noBoundsState, noBoundsSignal],
    ['vAlign', boundsState, boundsSignal],
    ['hAlign', boundsState, boundsSignal],
    ['wordWrap', boundsState, boundsSignal],
    ['wordBreak', boundsState, boundsSignal],
    ['textOverflow', boundsState, boundsSignal],
    ['selectable', noBoundsState, noBoundsSignal],
    ['disablePointerEvents', noBoundsState, noBoundsSignal],
    ['useHtml', boundsState, boundsSignal]
  ]);
};
goog.inherits(anychart.core.Text, anychart.core.VisualBase);


//region -- Consistency states and signals.
/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.Text.prototype.SUPPORTED_SIGNALS =
    anychart.core.VisualBase.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.BOUNDS_CHANGED;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.Text.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.APPEARANCE;


//endregion
//region -- Descriptors.
/**
 * Base descriptors.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.Text.BASE_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'fontSize', anychart.core.settings.numberOrStringNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'fontFamily', anychart.core.settings.stringNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'fontColor', anychart.core.settings.stringNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'fontOpacity', anychart.core.settings.ratioNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'fontDecoration', anychart.enums.normalizeFontDecoration],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'fontStyle', anychart.enums.normalizeFontStyle],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'fontVariant', anychart.enums.normalizeFontVariant],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'fontWeight', anychart.core.settings.numberOrStringNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'letterSpacing', anychart.core.settings.numberOrStringNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'textDirection', anychart.enums.normalizeTextDirection],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'textShadow', acgraph.vector.normalizeTextShadow],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'lineHeight', anychart.core.settings.numberOrStringNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'textIndent', anychart.core.settings.numberOrStringNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'vAlign', anychart.enums.normalizeVAlign],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'hAlign', anychart.enums.normalizeHAlign],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'wordWrap', anychart.core.settings.stringNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'wordBreak', anychart.core.settings.stringNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'textOverflow', anychart.core.settings.stringNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'selectable', anychart.core.settings.booleanNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'disablePointerEvents', anychart.core.settings.booleanNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'useHtml', anychart.core.settings.booleanNormalizer]
  ]);

  return map;
})();
anychart.core.settings.populate(anychart.core.Text, anychart.core.Text.BASE_DESCRIPTORS);


/**
 * Text descriptors. Adds text() method if needed.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.Text.TEXT_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'text',
      anychart.core.settings.stringOrNullNormalizer);

  return map;
})();


//endregion
//region -- Parental relations.
/**
 * Gets/sets parent tooltip.
 * @param {anychart.core.Text=} opt_value - Parent to set.
 * @return {anychart.core.Text}
 */
anychart.core.Text.prototype.parent = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.parent_ != opt_value) {
      var uid = String(goog.getUid(this));
      if (goog.isNull(opt_value)) { //removing parent.
        //this.parent_ is not null here.
        this.parent_.unlistenSignals(this.parentInvalidated_, this);
        delete this.parent_.childTextMap[uid];
        this.parent_ = null;
      } else {
        if (this.parent_)
          this.parent_.unlistenSignals(this.parentInvalidated_, this);
        this.parent_ = opt_value;
        this.parent_.childTextMap[uid] = this;
        this.parent_.listenSignals(this.parentInvalidated_, this);
      }
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
anychart.core.Text.prototype.parentInvalidated_ = function(e) {
  var state = anychart.ConsistencyState.APPEARANCE;
  var signal = anychart.Signal.NEEDS_REDRAW;

  if (e.hasSignal(anychart.Signal.BOUNDS_CHANGED) || e.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state |= anychart.ConsistencyState.BOUNDS;
    signal |= anychart.Signal.BOUNDS_CHANGED;
  }

  if (e.hasSignal(anychart.Signal.ENABLED_STATE_CHANGED)) {
    state |= anychart.ConsistencyState.ENABLED;
  }

  this.resolutionChainCache_ = null;
  this.invalidate(state, signal);
};


//endregion
//region -- IResolvable impl.
/**
 * @override
 * @param {string} name
 * @return {*}
 */
anychart.core.Text.prototype.getOption = anychart.core.settings.getOption;


/** @inheritDoc */
anychart.core.Text.prototype.resolutionChainCache = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.resolutionChainCache_ = opt_value;
  }
  return this.resolutionChainCache_;
};


/** @inheritDoc */
anychart.core.Text.prototype.getResolutionChain = anychart.core.settings.getResolutionChain;


/** @inheritDoc */
anychart.core.Text.prototype.getLowPriorityResolutionChain = function() {
  var sett = [this.themeSettings];
  if (this.parent_)
    sett = goog.array.concat(sett, this.parent_.getLowPriorityResolutionChain());
  return sett;
};


/** @inheritDoc */
anychart.core.Text.prototype.getHighPriorityResolutionChain = function() {
  var sett = [this.ownSettings];
  if (this.parent_) {
    sett = goog.array.concat(sett, this.parent_.getHighPriorityResolutionChain());
  }
  return sett;
};


//endregion
//region -- Working with text props.
/**
 * Getter/setter for textSettings.
 * @param {(Object|string)=} opt_objectOrName Settings object or settings name or nothing to get complete object.
 * @param {(string|number|boolean|Function)=} opt_value Setting value if used as a setter.
 * @return {!(anychart.core.Text|Object|string|number|boolean)} A copy of settings or the Text for chaining.
 */
anychart.core.Text.prototype.textSettings = function(opt_objectOrName, opt_value) {
  if (goog.isDef(opt_objectOrName)) {
    if (goog.isString(opt_objectOrName)) {
      if (goog.isDef(opt_value)) {
        if (opt_objectOrName in anychart.core.Text.BASE_DESCRIPTORS)
          this[opt_objectOrName](opt_value);
        return this;
      } else {
        return this.ownSettings[opt_objectOrName];
      }
    } else if (goog.isObject(opt_objectOrName)) {
      this.suspendSignalsDispatching();
      for (var item in opt_objectOrName) {
        if (opt_objectOrName.hasOwnProperty(item))
          this.textSettings(item, opt_objectOrName[item]);
      }
      this.resumeSignalsDispatching(true);
    }
    return this;
  }
  var newMap = {};
  for (var name in anychart.core.Text.BASE_DESCRIPTORS) {
    var val = this.getOption(name);
    if (goog.isDef(val)) {
      newMap[name] = val;
    }
  }
  return newMap;
};


/**
 * Applies known changes in settings.
 * @param {!acgraph.vector.Text} textElement Text element to apply settings to.
 * @param {boolean} isInitial If the text element needs initial settings application.
 * @protected
 */
anychart.core.Text.prototype.applyTextSettings = function(textElement, isInitial) {
  var key;
  for (key in anychart.core.Text.BASE_DESCRIPTORS) {
    if (anychart.core.Text.BASE_DESCRIPTORS.hasOwnProperty(key)) {
      var textElementKey;
      switch (key) {
        case 'fontColor':
          textElementKey = 'color';
          break;
        case 'textDirection':
          textElementKey = 'direction';
          break;
        case 'fontOpacity':
          textElementKey = 'opacity';
          break;
        case 'fontDecoration':
          textElementKey = 'decoration';
          break;
        default:
          textElementKey = key;
      }

      if (textElementKey != 'useHtml' && (isInitial || textElement[textElementKey]() !== this.getOption(key)))
        textElement[textElementKey](this.getOption(key));
    }
  }

  if ('text' in this.descriptorsMeta) {
    var text = /** @type {string|undefined} */ (this.getOption('text'));
    var useHtml = !!this.getOption('useHtml');
    var textElementText = useHtml ? textElement.htmlText() : textElement.text();

    if (isInitial || text !== textElementText) {
      if (useHtml)
        textElement.htmlText(text);
      else
        textElement.text(text);
    }
  }
};


//endregion
//region -- Serialization/Deserialization.
/** @inheritDoc */
anychart.core.Text.prototype.enabled = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.ownSettings['enabled'] != opt_value) {
      this.ownSettings['enabled'] = opt_value;
      this.invalidate(anychart.ConsistencyState.ENABLED,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED | anychart.Signal.ENABLED_STATE_CHANGED);
      if (this.ownSettings['enabled']) {
        this.doubleSuspension = false;
        this.resumeSignalsDispatching(true);
      } else {
        if (isNaN(this.suspendedDispatching)) {
          this.suspendSignalsDispatching();
        } else {
          this.doubleSuspension = true;
        }
      }
    }
    return this;
  } else {
    return /** @type {boolean} */(this.getOption('enabled'));
  }
};


/** @inheritDoc */
anychart.core.Text.prototype.serialize = function() {
  var json = anychart.core.Text.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.core.Text.BASE_DESCRIPTORS, json, 'Text');
  return json;
};


/** @inheritDoc */
anychart.core.Text.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.Text.base(this, 'setupByJSON', config, opt_default);
  if (opt_default) {
    anychart.core.settings.copy(this.themeSettings, anychart.core.Text.BASE_DESCRIPTORS, config);
  } else {
    anychart.core.settings.deserialize(this, anychart.core.Text.BASE_DESCRIPTORS, config);
  }
};


//endregion
// exports
(function() {
  var proto = anychart.core.Text.prototype;
  proto['textSettings'] = proto.textSettings;//in docs/final
})();
