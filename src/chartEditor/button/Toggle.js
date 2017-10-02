goog.provide('anychart.chartEditorModule.button.Toggle');

goog.require('anychart.chartEditorModule.events');
goog.require('anychart.ui.button.Base');

goog.require('goog.ui.INLINE_BLOCK_CLASSNAME');



/**
 * A toggle button control.
 * Extends {@link anychart.ui.button.Base} by providing checkbox-like semantics.
 * @param {goog.ui.ControlContent=} opt_content
 * @param {goog.ui.ButtonRenderer=} opt_renderer
 * @param {goog.dom.DomHelper=} opt_domHelper
 * @constructor
 * @extends {anychart.ui.button.Base}
 */
anychart.chartEditorModule.button.Toggle = function(opt_content, opt_renderer, opt_domHelper) {
  anychart.chartEditorModule.button.Toggle.base(this, 'constructor', opt_content, opt_renderer, opt_domHelper);

  this.addClassName(goog.ui.INLINE_BLOCK_CLASSNAME);
  this.addClassName('anychart-button-standard');
  this.addClassName(anychart.chartEditorModule.button.Toggle.CSS_CLASS);

  this.setSupportedState(goog.ui.Component.State.CHECKED, true);
  this.setAutoStates(goog.ui.Component.State.CHECKED, false);
};
goog.inherits(anychart.chartEditorModule.button.Toggle, anychart.ui.button.Base);


/** @type {string} */
anychart.chartEditorModule.button.Toggle.CSS_CLASS = goog.getCssName('anychart-button-toggle');


/**
 * @type {*}
 * @private
 */
anychart.chartEditorModule.button.Toggle.prototype.normalValue_ = '';


/** @param {*} value */
anychart.chartEditorModule.button.Toggle.prototype.setNormalValue = function(value) {
  this.normalValue_ = value;
};


/**
 * @type {*}
 * @private
 */
anychart.chartEditorModule.button.Toggle.prototype.checkedValue_ = '';


/** @param {*} value */
anychart.chartEditorModule.button.Toggle.prototype.setCheckedValue = function(value) {
  this.checkedValue_ = value;
};


/** @param {Array.<string>} value */
anychart.chartEditorModule.button.Toggle.prototype.setOptions = function(value) {
  this.options_ = value;
};


/**
 * @type {string|Array.<string>}
 * @private
 */
anychart.chartEditorModule.button.Toggle.prototype.key_ = '';


/** @param {string|Array.<string>} value */
anychart.chartEditorModule.button.Toggle.prototype.setKey = function(value) {
  this.key_ = value;
};


/** @param {anychart.chartEditorModule.steps.Base.Model} model */
anychart.chartEditorModule.button.Toggle.prototype.update = function(model) {
  var value = anychart.chartEditorModule.Controller.getset(model, goog.isArray(this.key_) ? this.key_[0] : this.key_);
  this.setChecked(value == this.checkedValue_);
};


/** @override */
anychart.chartEditorModule.button.Toggle.prototype.enterDocument = function() {
  anychart.chartEditorModule.button.Toggle.base(this, 'enterDocument');
  goog.events.listen(this, goog.ui.Component.EventType.ACTION, this.onAction_, false, this);
};


/** @override */
anychart.chartEditorModule.button.Toggle.prototype.exitDocument = function() {
  goog.events.unlisten(this, goog.ui.Component.EventType.ACTION, this.onAction_, false, this);
  anychart.chartEditorModule.button.Toggle.base(this, 'exitDocument');
};


/**
 * @param {goog.events.Event} evt
 * @private
 */
anychart.chartEditorModule.button.Toggle.prototype.onAction_ = function(evt) {
  evt.stopPropagation();

  var keys = goog.isArray(this.key_) ? this.key_ : [this.key_];
  for (var i = 0, count = keys.length; i < count; i++) {
    this.dispatchEvent({
      type: anychart.chartEditorModule.events.EventType.CHANGE_MODEL,
      key: keys[i],
      value: this.isChecked() ?
          this.normalValue_ :
          this.checkedValue_
    });
  }
  this.dispatchEvent(anychart.chartEditorModule.events.EventType.UPDATE_EDITOR);
};
