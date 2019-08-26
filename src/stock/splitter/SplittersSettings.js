goog.provide('anychart.stockModule.splitter.SplittersSettings');

//region -- Requirements.
goog.require('anychart.core.Base');
goog.require('anychart.stockModule.splitter.PreviewSettings');
goog.require('anychart.stockModule.splitter.states.Hovered');
goog.require('anychart.stockModule.splitter.states.Normal');



//endregion
//region -- Constructor.
/**
 *
 * @constructor
 * @extends {anychart.core.Base}
 */
anychart.stockModule.splitter.SplittersSettings = function() {
  anychart.stockModule.splitter.SplittersSettings.base(this, 'constructor');

  /**
   * Preview settings.
   * @type {anychart.stockModule.splitter.PreviewSettings}
   * @private
   */
  this.preview_ = null;

  /**
   * Normal settings.
   * @type {anychart.stockModule.splitter.states.Normal}
   * @private
   */
  this.normal_ = null;

  /**
   * Hovered settings.
   * @type {anychart.stockModule.splitter.states.Hovered}
   * @private
   */
  this.hovered_ = null;

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['enabled', 0, anychart.Signal.NEEDS_REDRAW]
  ]);

};
goog.inherits(anychart.stockModule.splitter.SplittersSettings, anychart.core.Base);
anychart.core.settings.populateAliases(anychart.stockModule.splitter.SplittersSettings, ['stroke'], 'normal');


//endregion
//region -- Signals and Consistency.
/**
 * Supported signals.
 * @type {number}
 */
anychart.stockModule.splitter.SplittersSettings.prototype.SUPPORTED_SIGNALS =
    anychart.Signal.NEEDS_REDRAW;


//endregion
//region -- Descriptors.
/**
 * Simple descriptors.
 * @type {!Object.<anychart.core.settings.PropertyDescriptor>}
 */
anychart.stockModule.splitter.SplittersSettings.DESCRIPTORS = (function() {
  /** @type {!Object.<anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'enabled', anychart.core.settings.booleanNormalizer]
  ]);

  return map;
})();
anychart.core.settings.populate(anychart.stockModule.splitter.SplittersSettings, anychart.stockModule.splitter.SplittersSettings.DESCRIPTORS);


//endregion
//region -- Preview settings.
/**
 * Preview settings.
 * @param {(null|boolean|Object|string)=} opt_value .
 * @return {anychart.stockModule.splitter.SplittersSettings|anychart.stockModule.splitter.PreviewSettings}
 */
anychart.stockModule.splitter.SplittersSettings.prototype.preview = function(opt_value) {
  if (!this.preview_) {
    this.preview_ = new anychart.stockModule.splitter.PreviewSettings();
    this.preview_.listenSignals(this.redraw_, this);
    this.setupCreated('preview', this.preview_);
  }

  if (goog.isDef(opt_value)) {
    this.preview_.setup(opt_value);
    return this;
  } else {
    return this.preview_;
  }
};


/**
 * Internal invalidation handler.
 * @param {anychart.SignalEvent} event - Event object.
 * @private
 */
anychart.stockModule.splitter.SplittersSettings.prototype.redraw_ = function(event) {
  this.dispatchSignal(anychart.Signal.NEEDS_REDRAW);
};


//endregion
//region -- States.
/**
 * Normal state settings.
 * @param {Object=} opt_value - Settings.
 * @return {*}
 */
anychart.stockModule.splitter.SplittersSettings.prototype.normal = function(opt_value) {
  if (!this.normal_) {
    this.normal_ = new anychart.stockModule.splitter.states.Normal();
    this.normal_.addThemes(this.themeSettings);
    this.setupCreated('normal', this.normal_);
    this.normal_.listenSignals(this.redraw_, this);
  }

  if (goog.isDef(opt_value)) {
    this.normal_.setup(opt_value);
    return this;
  }
  return this.normal_;
};


/**
 * Hovered state settings.
 * @param {Object=} opt_value - Settings.
 * @return {*}
 */
anychart.stockModule.splitter.SplittersSettings.prototype.hovered = function(opt_value) {
  if (!this.hovered_) {
    this.hovered_ = new anychart.stockModule.splitter.states.Hovered();
    this.setupCreated('hovered', this.hovered_);
  }

  if (goog.isDef(opt_value)) {
    this.hovered_.setup(opt_value);
    return this;
  }
  return this.hovered_;
};


//endregion
//region -- Serialize/Deserialize.
/** @inheritDoc */
anychart.stockModule.splitter.SplittersSettings.prototype.resolveSpecialValue = function(isDefault, var_args) {
  var arg0 = arguments[0];
  if (goog.isBoolean(arg0) || goog.isNull(arg0)) {
    return {'enabled': !!arg0};
  }
  return null;
};


/** @inheritDoc */
anychart.stockModule.splitter.SplittersSettings.prototype.setupSpecial = function(isDefault, var_args) {
  var resolvedValue = this.resolveSpecialValue(arguments[1]);
  if (resolvedValue) {
    if (isDefault)
      this.themeSettings['enabled'] = resolvedValue['enabled'];
    else
      this.enabled(resolvedValue['enabled']);
    return true;
  }
  return false;
};


/**
 * @inheritDoc
 */
anychart.stockModule.splitter.SplittersSettings.prototype.setupByJSON = function(config, opt_default) {
  anychart.stockModule.splitter.SplittersSettings.base(this, 'setupByJSON', config, opt_default);
  anychart.core.settings.deserialize(this, anychart.stockModule.splitter.SplittersSettings.DESCRIPTORS, config, opt_default);

  if ('normal' in config)
    this.normal().setupInternal(!!opt_default, config['normal']);

  if ('hovered' in config)
    this.hovered().setupInternal(!!opt_default, config['hovered']);

  if ('preview' in config)
    this.preview().setupInternal(!!opt_default, config['normal']);

};


/**
 * @inheritDoc
 */
anychart.stockModule.splitter.SplittersSettings.prototype.serialize = function() {
  var json = anychart.stockModule.splitter.SplittersSettings.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.stockModule.splitter.SplittersSettings.DESCRIPTORS, json, void 0, void 0, true);

  if (this.normal_)
    json['normal'] = this.normal_.serialize();

  if (this.hovered_)
    json['hovered'] = this.hovered_.serialize();

  if (this.preview_)
    json['preview'] = this.preview_.serialize();

  return json;
};


//endregion
//region -- Disposing.
/**
 * @inheritDoc
 */
anychart.stockModule.splitter.SplittersSettings.prototype.disposeInternal = function() {
  goog.disposeAll(this.normal_, this.hovered_, this.preview_);

  this.normal_ = null;
  this.hovered_ = null;
  this.preview_ = null;

  anychart.stockModule.splitter.SplittersSettings.base(this, 'disposeInternal');
};


//endregion
//region -- Exports.

(function() {
  var proto = anychart.stockModule.splitter.SplittersSettings.prototype;
  proto['normal'] = proto.normal;
  proto['hovered'] = proto.hovered;
  proto['preview'] = proto.preview;
})();
//endregion
