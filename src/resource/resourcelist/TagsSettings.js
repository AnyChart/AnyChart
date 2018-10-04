goog.provide('anychart.resourceModule.resourceList.TagsSettings');
goog.require('anychart.core.ui.Background');
goog.require('anychart.core.utils.Padding');
goog.require('anychart.resourceModule.resourceList.TextSettings');



/**
 * Tags settings class.
 * @extends {anychart.resourceModule.resourceList.TextSettings}
 * @constructor
 */
anychart.resourceModule.resourceList.TagsSettings = function() {
  anychart.resourceModule.resourceList.TagsSettings.base(this, 'constructor');
};
goog.inherits(anychart.resourceModule.resourceList.TagsSettings, anychart.resourceModule.resourceList.TextSettings);


//region --- OWN API ---
/**
 * Getter/setter for background.
 * @param {Object=} opt_value background.
 * @return {anychart.core.ui.Background|anychart.resourceModule.resourceList.TagsSettings} background or self for chaining.
 */
anychart.resourceModule.resourceList.TagsSettings.prototype.background = function(opt_value) {
  if (!this.background_) {
    this.background_ = new anychart.core.ui.Background();
    this.background_.serializeOnlyOwn = false; //todo: Should think about it after themes refactoring. Hack for gantt serialize
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
anychart.resourceModule.resourceList.TagsSettings.prototype.backgroundInvalidated_ = function(event) {
  this.dispatchSignal(anychart.Signal.NEEDS_REDRAW);
};


/**
 * Getter/setter for padding setting.
 * @param {(string|number|Array.<number|string>|{top:(number|string),left:(number|string),bottom:(number|string),right:(number|string)})=} opt_spaceOrTopOrTopAndBottom Space object or top or top and bottom
 *    space.
 * @param {(string|number)=} opt_rightOrRightAndLeft Right or right and left space.
 * @param {(string|number)=} opt_bottom Bottom space.
 * @param {(string|number)=} opt_left Left space.
 * @return {!(anychart.resourceModule.resourceList.TagsSettings|anychart.core.utils.Padding)} Padding or self for method chaining.
 */
anychart.resourceModule.resourceList.TagsSettings.prototype.padding = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
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
anychart.resourceModule.resourceList.TagsSettings.prototype.paddingInvalidated_ = function(event) {
  this.dispatchSignal(anychart.Signal.NEEDS_REDRAW);
};


//endregion
//region --- SETUP/DISPOSE ---
/** @inheritDoc */
anychart.resourceModule.resourceList.TagsSettings.prototype.setupByJSON = function(config, opt_default) {
  anychart.resourceModule.resourceList.TagsSettings.base(this, 'setupByJSON', config, opt_default);
  this.padding().setupInternal(!!opt_default, config['padding']);
  this.background().setupInternal(!!opt_default, config['background']);
};


/** @inheritDoc */
anychart.resourceModule.resourceList.TagsSettings.prototype.serialize = function() {
  var json = anychart.resourceModule.resourceList.TagsSettings.base(this, 'serialize');
  json['padding'] = this.padding().serialize();
  json['background'] = this.background().serialize();
  // settings for core.ui.Label in resourceList.Item class. They cant be changed from the outside.
  json['position'] = 'left-top';
  json['anchor'] = 'left-top';
  json['rotation'] = '0';
  return json;
};


/** @inheritDoc */
anychart.resourceModule.resourceList.TagsSettings.prototype.disposeInternal = function() {
  goog.disposeAll(this.padding_, this.background_);
  anychart.resourceModule.resourceList.TagsSettings.base(this, 'disposeInternal');
};


//endregion
//exports
(function() {
  var proto = anychart.resourceModule.resourceList.TagsSettings.prototype;
  proto['background'] = proto.background;
  proto['padding'] = proto.padding;
})();
