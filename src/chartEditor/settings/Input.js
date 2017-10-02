goog.provide('anychart.chartEditorModule.settings.Input');

goog.require('anychart.chartEditorModule.events');

goog.require('goog.Timer');
goog.require('goog.events.KeyHandler');
goog.require('goog.ui.LabelInput');



/**
 * This creates the label input object.
 * @param {string=} opt_label The text to show as the label.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @constructor
 * @extends {goog.ui.LabelInput}
 */
anychart.chartEditorModule.settings.Input = function(opt_label, opt_domHelper) {
  anychart.chartEditorModule.settings.Input.base(this, 'constructor', opt_label, opt_domHelper);

  /**
   * @type {string}
   * @private
   */
  this.lastValue_ = '';
};
goog.inherits(anychart.chartEditorModule.settings.Input, goog.ui.LabelInput);


/**
 * The CSS class name to add to the input when the user has not entered a
 * value.
 */
anychart.chartEditorModule.settings.Input.prototype.labelCssClassName =
    goog.getCssName('anychart-label-input-label');


/**
 * @type {string|Array.<string>}
 * @private
 */
anychart.chartEditorModule.settings.Input.prototype.key_ = '';


/**
 * @type {goog.events.KeyHandler}
 * @private
 */
anychart.chartEditorModule.settings.Input.prototype.keyHandler_ = null;


/** @param {string|Array.<string>} value */
anychart.chartEditorModule.settings.Input.prototype.setKey = function(value) {
  this.key_ = value;
};


/**
 * Creates the DOM nodes needed for the label input.
 * @override
 */
anychart.chartEditorModule.settings.Input.prototype.createDom = function() {
  this.setElementInternal(this.getDomHelper().createDom(
      goog.dom.TagName.INPUT, {
        'type': goog.dom.InputType.TEXT,
        'className': goog.getCssName('anychart-label-input')
      }));
};


/** @inheritDoc */
anychart.chartEditorModule.settings.Input.prototype.disposeInternal = function() {
  if (this.keyHandler_) {
    this.getHandler().unlisten(this.keyHandler_, goog.events.KeyHandler.EventType.KEY, this.onKeyPress_);
    this.keyHandler_.dispose();
    this.keyHandler_ = null;
  }

  anychart.chartEditorModule.settings.Input.base(this, 'disposeInternal');
};


/** @inheritDoc */
anychart.chartEditorModule.settings.Input.prototype.enterDocument = function() {
  anychart.chartEditorModule.settings.Input.base(this, 'enterDocument');

  if (!this.keyHandler_) {
    this.keyHandler_ = new goog.events.KeyHandler(this.getElement());
    this.getHandler().listen(this.keyHandler_, goog.events.KeyHandler.EventType.KEY, this.onKeyPress_);
  }
};


/** @param {anychart.chartEditorModule.steps.Base.Model} model */
anychart.chartEditorModule.settings.Input.prototype.update = function(model) {
  var value = anychart.chartEditorModule.Controller.getset(model, goog.isArray(this.key_) ? this.key_[0] : this.key_);
  this.lastValue_ = value;
  if (goog.isDef(value)) {
    this.setValue(value);
  }
};


/** @private */
anychart.chartEditorModule.settings.Input.prototype.onKeyPress_ = function() {
  goog.Timer.callOnce(function() {
    var value = this.getValue();
    if (value != this.lastValue_) {
      this.lastValue_ = value;
      var caretPosition = goog.dom.selection.getStart(this.getElement());

      var keys = goog.isArray(this.key_) ? this.key_ : [this.key_];
      for (var i = 0, count = keys.length; i < count; i++) {
        this.dispatchEvent({
          type: anychart.chartEditorModule.events.EventType.CHANGE_MODEL,
          key: keys[i],
          value: value
        });
      }
      this.dispatchEvent(anychart.chartEditorModule.events.EventType.UPDATE_EDITOR);

      goog.dom.selection.setCursorPosition(this.getElement(), caretPosition);
    }
  }, 1, this);
};
