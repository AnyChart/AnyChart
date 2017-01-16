goog.provide('anychart.ui.chartEditor.settings.Input');

goog.require('anychart.ui.chartEditor.events');

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
anychart.ui.chartEditor.settings.Input = function(opt_label, opt_domHelper) {
  anychart.ui.chartEditor.settings.Input.base(this, 'constructor', opt_label, opt_domHelper);

  /**
   * @type {string}
   * @private
   */
  this.lastValue_ = '';
};
goog.inherits(anychart.ui.chartEditor.settings.Input, goog.ui.LabelInput);


/**
 * The CSS class name to add to the input when the user has not entered a
 * value.
 */
anychart.ui.chartEditor.settings.Input.prototype.labelCssClassName =
    goog.getCssName('anychart-label-input-label');


/**
 * @type {string|Array.<string>}
 * @private
 */
anychart.ui.chartEditor.settings.Input.prototype.key_ = '';


/**
 * @type {goog.events.KeyHandler}
 * @private
 */
anychart.ui.chartEditor.settings.Input.prototype.keyHandler_ = null;


/** @param {string|Array.<string>} value */
anychart.ui.chartEditor.settings.Input.prototype.setKey = function(value) {
  this.key_ = value;
};


/**
 * Creates the DOM nodes needed for the label input.
 * @override
 */
anychart.ui.chartEditor.settings.Input.prototype.createDom = function() {
  this.setElementInternal(this.getDomHelper().createDom(
      goog.dom.TagName.INPUT, {
        'type': goog.dom.InputType.TEXT,
        'className': goog.getCssName('anychart-label-input')
      }));
};


/** @inheritDoc */
anychart.ui.chartEditor.settings.Input.prototype.disposeInternal = function() {
  if (this.keyHandler_) {
    this.getHandler().unlisten(this.keyHandler_, goog.events.KeyHandler.EventType.KEY, this.onKeyPress_);
    this.keyHandler_.dispose();
    this.keyHandler_ = null;
  }

  anychart.ui.chartEditor.settings.Input.base(this, 'disposeInternal');
};


/** @inheritDoc */
anychart.ui.chartEditor.settings.Input.prototype.enterDocument = function() {
  anychart.ui.chartEditor.settings.Input.base(this, 'enterDocument');

  if (!this.keyHandler_) {
    this.keyHandler_ = new goog.events.KeyHandler(this.getElement());
    this.getHandler().listen(this.keyHandler_, goog.events.KeyHandler.EventType.KEY, this.onKeyPress_);
  }
};


/** @param {anychart.ui.chartEditor.steps.Base.Model} model */
anychart.ui.chartEditor.settings.Input.prototype.update = function(model) {
  var value = anychart.ui.chartEditor.Controller.getset(model, goog.isArray(this.key_) ? this.key_[0] : this.key_);
  this.lastValue_ = value;
  if (goog.isDef(value)) {
    this.setValue(value);
  }
};


/** @private */
anychart.ui.chartEditor.settings.Input.prototype.onKeyPress_ = function() {
  goog.Timer.callOnce(function() {
    var value = this.getValue();
    if (value != this.lastValue_) {
      this.lastValue_ = value;
      var caretPosition = goog.dom.selection.getStart(this.getElement());

      var keys = goog.isArray(this.key_) ? this.key_ : [this.key_];
      for (var i = 0, count = keys.length; i < count; i++) {
        this.dispatchEvent({
          type: anychart.ui.chartEditor.events.EventType.CHANGE_MODEL,
          key: keys[i],
          value: value
        });
      }
      this.dispatchEvent(anychart.ui.chartEditor.events.EventType.UPDATE_EDITOR);

      goog.dom.selection.setCursorPosition(this.getElement(), caretPosition);
    }
  }, 1, this);
};
