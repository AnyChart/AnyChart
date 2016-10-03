goog.provide('anychart.core.ui.resourceList.TagsSettings');
goog.require('anychart.core.ui.Background');
goog.require('anychart.core.ui.resourceList.TextSettings');
goog.require('anychart.core.utils.Padding');



/**
 * Tags settings class.
 * @extends {anychart.core.ui.resourceList.TextSettings}
 * @constructor
 */
anychart.core.ui.resourceList.TagsSettings = function() {
  anychart.core.ui.resourceList.TagsSettings.base(this, 'constructor');
};
goog.inherits(anychart.core.ui.resourceList.TagsSettings, anychart.core.ui.resourceList.TextSettings);


//region --- OWN API ---
/**
 * Getter/setter for background.
 * @param {Object=} opt_value background.
 * @return {anychart.core.ui.Background|anychart.core.ui.resourceList.TagsSettings} background or self for chaining.
 */
anychart.core.ui.resourceList.TagsSettings.prototype.background = function(opt_value) {
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
anychart.core.ui.resourceList.TagsSettings.prototype.backgroundInvalidated_ = function(event) {
  this.dispatchSignal(anychart.Signal.NEEDS_REDRAW);
};


/**
 * Getter/setter for padding setting.
 * @param {(string|number|Array.<number|string>|{top:(number|string),left:(number|string),bottom:(number|string),right:(number|string)})=} opt_spaceOrTopOrTopAndBottom Space object or top or top and bottom
 *    space.
 * @param {(string|number)=} opt_rightOrRightAndLeft Right or right and left space.
 * @param {(string|number)=} opt_bottom Bottom space.
 * @param {(string|number)=} opt_left Left space.
 * @return {!(anychart.core.ui.resourceList.TagsSettings|anychart.core.utils.Padding)} Padding or self for method chaining.
 */
anychart.core.ui.resourceList.TagsSettings.prototype.padding = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  if (!this.padding_) {
    this.padding_ = new anychart.core.utils.Padding();
    this.padding_.listenSignals(this.paddingInvalidated_, this);
  }
  if (goog.isDef(opt_spaceOrTopOrTopAndBottom)) {
    this.padding_.setup.apply(this.padding_, arguments);
    return this;
  }
  return this.padding_;
};


/**
 * Padding invalidation handler.
 * @param {anychart.SignalEvent} event
 * @private
 */
anychart.core.ui.resourceList.TagsSettings.prototype.paddingInvalidated_ = function(event) {
  this.dispatchSignal(anychart.Signal.NEEDS_REDRAW);
};
//endregion


//region --- SETUP/DISPOSE ---
/** @inheritDoc */
anychart.core.ui.resourceList.TagsSettings.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.ui.resourceList.TagsSettings.base(this, 'setupByJSON', config, opt_default);
  if (goog.isDef(config['padding']))
    this.padding().setupByJSON(config['padding'], opt_default);
  if (goog.isDef(config['background']))
    this.background().setupByJSON(config['background'], opt_default);
};


/** @inheritDoc */
anychart.core.ui.resourceList.TagsSettings.prototype.serialize = function() {
  var json = anychart.core.ui.resourceList.TagsSettings.base(this, 'serialize');
  json['padding'] = this.padding().serialize();
  json['background'] = this.background().serialize();
  // settings for core.ui.Label in resourceList.Item class. They cant be changed from the outside.
  json['position'] = 'leftTop';
  json['anchor'] = 'leftTop';
  json['rotation'] = '0';
  return json;
};


/** @inheritDoc */
anychart.core.ui.resourceList.TagsSettings.prototype.disposeInternal = function() {
  goog.dispose(this.padding_);
  goog.dispose(this.background_);
  anychart.core.ui.resourceList.TagsSettings.base(this, 'disposeInternal');
};
//endregion


//exports
anychart.core.ui.resourceList.TagsSettings.prototype['background'] = anychart.core.ui.resourceList.TagsSettings.prototype.background;
anychart.core.ui.resourceList.TagsSettings.prototype['padding'] = anychart.core.ui.resourceList.TagsSettings.prototype.padding;
