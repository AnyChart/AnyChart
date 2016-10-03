goog.provide('anychart.core.ui.resourceList.ItemsSettings');
goog.require('anychart.core.settings');
goog.require('anychart.core.ui.Background');
goog.require('anychart.core.ui.resourceList.Settings');



/**
 * Items settings class.
 * @extends {anychart.core.ui.resourceList.Settings}
 * @constructor
 */
anychart.core.ui.resourceList.ItemsSettings = function() {
  anychart.core.ui.resourceList.ItemsSettings.base(this, 'constructor');
};
goog.inherits(anychart.core.ui.resourceList.ItemsSettings, anychart.core.ui.resourceList.Settings);


//region --- OWN API ---
/**
 * Getter/setter for background.
 * @param {Object=} opt_value background.
 * @return {anychart.core.ui.Background|anychart.core.ui.resourceList.ItemsSettings} background or self for chaining.
 */
anychart.core.ui.resourceList.ItemsSettings.prototype.background = function(opt_value) {
  if (!this.background_) {
    this.background_ = new anychart.core.ui.Background();
    this.background_.listenSignals(this.backgroundInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    this.background_.setup(opt_value);
    return this;
  } else {
    return this.background_;
  }
};


/**
 * Background invalidation handler.
 * @param {anychart.SignalEvent} event Event.
 * @private
 */
anychart.core.ui.resourceList.ItemsSettings.prototype.backgroundInvalidated_ = function(event) {
  this.dispatchSignal(anychart.Signal.NEEDS_REDRAW);
};
//endregion


//region --- PROPERTIES ---
/**
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.ui.resourceList.ItemsSettings.PROPERTY_DESCRIPTORS = (function() {
  var map = {};

  map[anychart.opt.HEIGHT] = {
    handler: anychart.enums.PropertyHandlerType.SINGLE_ARG,
    propName: anychart.opt.HEIGHT,
    normalizer: anychart.core.settings.numberOrPercentNormalizer,
    consistency: 0,
    signal: anychart.Signal.NEEDS_REDRAW
  };

  map[anychart.opt.MIN_HEIGHT] = {
    handler: anychart.enums.PropertyHandlerType.SINGLE_ARG,
    propName: anychart.opt.MIN_HEIGHT,
    normalizer: anychart.core.settings.numberOrPercentNormalizer,
    consistency: 0,
    signal: anychart.Signal.NEEDS_REDRAW
  };

  map[anychart.opt.MAX_HEIGHT] = {
    handler: anychart.enums.PropertyHandlerType.SINGLE_ARG,
    propName: anychart.opt.MAX_HEIGHT,
    normalizer: anychart.core.settings.numberOrPercentNormalizer,
    consistency: 0,
    signal: anychart.Signal.NEEDS_REDRAW
  };

  return map;
})();
anychart.core.settings.populate(anychart.core.ui.resourceList.ItemsSettings, anychart.core.ui.resourceList.ItemsSettings.PROPERTY_DESCRIPTORS);
//endregion


// region --- SETUP/DISPOSE ---
/** @inheritDoc */
anychart.core.ui.resourceList.ItemsSettings.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.ui.resourceList.ItemsSettings.base(this, 'setupByJSON', config, opt_default);
  if (!opt_default)
    anychart.core.settings.deserialize(this, anychart.core.ui.resourceList.ItemsSettings.PROPERTY_DESCRIPTORS, config);
  if (goog.isDef(config['background']))
    this.background().setupByJSON(config['background'], opt_default);
};


/** @inheritDoc */
anychart.core.ui.resourceList.ItemsSettings.prototype.serialize = function() {
  var json = anychart.core.ui.resourceList.ItemsSettings.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.core.ui.resourceList.ItemsSettings.PROPERTY_DESCRIPTORS, json);
  json['background'] = this.background().serialize();
  return json;
};


/** @inheritDoc */
anychart.core.ui.resourceList.ItemsSettings.prototype.disposeInternal = function() {
  goog.dispose(this.background_);
  anychart.core.ui.resourceList.ItemsSettings.base(this, 'disposeInternal');
};
//endregion

//exports
anychart.core.ui.resourceList.ItemsSettings.prototype['background'] = anychart.core.ui.resourceList.ItemsSettings.prototype.background;
//anychart.core.ui.resourceList.ItemsSettings.prototype['height'] = anychart.core.ui.resourceList.ItemsSettings.prototype.height;
//anychart.core.ui.resourceList.ItemsSettings.prototype['minHeight'] = anychart.core.ui.resourceList.ItemsSettings.prototype.minHeight;
//anychart.core.ui.resourceList.ItemsSettings.prototype['maxHeight'] = anychart.core.ui.resourceList.ItemsSettings.prototype.maxHeight;
