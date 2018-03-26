goog.provide('anychart.ui.EditInput');

goog.require('goog.dom');
goog.require('goog.events.EventType');
goog.require('goog.events.KeyHandler');
goog.require('goog.string');
goog.require('goog.style');
goog.require('goog.ui.LabelInput');



/**
 * Edit input.
 * @constructor
 * @extends {goog.ui.LabelInput}
 */
anychart.ui.EditInput = function() {
  anychart.ui.EditInput.base(this, 'constructor');

  /**
   *
   * @type {anychart.math.Rect}
   * @private
   */
  this.bounds_ = null;
};
goog.inherits(anychart.ui.EditInput, goog.ui.LabelInput);


/** @type {string} */
anychart.ui.EditInput.CSS_CLASS = goog.getCssName('anychart-label-input');


/**
 * @type {string}
 */
anychart.ui.EditInput.POSITIONING_STYLE_TEMPLATE = 'padding: 0px; position: absolute; left: %spx; top: %spx; width: %spx; height: %spx';


/** @override */
anychart.ui.EditInput.prototype.createDom = function() {
  anychart.ui.EditInput.base(this, 'createDom');
  this.createDomInternal_();
  this.keyHandler_ = new goog.events.KeyHandler(this.getElement());
};


/**
 *
 * @private
 */
anychart.ui.EditInput.prototype.createDomInternal_ = function() {
  var element = this.getElement();
  var cssName = anychart.ui.EditInput.CSS_CLASS;
  goog.dom.classlist.add(element, cssName);
};


/**
 * Gets/sets input bounds.
 * @param {anychart.math.Rect=} opt_value - Value to set.
 * @return {anychart.math.Rect|anychart.ui.EditInput|null}
 */
anychart.ui.EditInput.prototype.bounds = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.bounds_ = opt_value;
    this.applyBounds_();
    return this;
  }
  return this.bounds_;
};


/**
 * @param {anychart.math.Rect} bounds - Input bounds.
 * @private
 * @return {string}
 */
anychart.ui.EditInput.prototype.getPosStyle_ = function(bounds) {
  return goog.string.subs(anychart.ui.EditInput.POSITIONING_STYLE_TEMPLATE, bounds.left, bounds.top, bounds.width, bounds.height);
};


/**
 * Applies bounds to element.
 * @private
 */
anychart.ui.EditInput.prototype.applyBounds_ = function() {
  var element = this.getElement();
  if (element) {
    goog.dom.setProperties(element, {
      'style': this.getPosStyle_(this.bounds_)
    });
  }
};


/**
 *
 * @param {string=} opt_value - Text value to set.
 * @param {anychart.math.Rect=} opt_bounds - Bounds where to show.
 */
anychart.ui.EditInput.prototype.show = function(opt_value, opt_bounds) {
  var element = this.getElement();
  this.bounds(opt_bounds);
  if (element) {
    this.setValue(opt_value || '');
    goog.style.setElementShown(element, true);
  }
};


/**
 * Hides input element.
 */
anychart.ui.EditInput.prototype.hide = function() {
  var element = this.getElement();
  if (element) {
    goog.style.setElementShown(element, false);
  }
};


/**
 * @param {goog.events.BrowserEvent} e - Browser event.
 * @param {anychart.enums.EventType} type - Type.
 * @private
 * @return {Object}
 */
anychart.ui.EditInput.prototype.wrapEvent_ = function(e, type) {
  return {
    'originalEvent': e,
    'type': type,
    'value': this.getValue()
  };
};


/**
 * Key press handler.
 * @param {goog.events.BrowserEvent} e - Browser event.
 * @private
 */
anychart.ui.EditInput.prototype.keyPressHandler_ = function(e) {
  var evt = this.wrapEvent_(e, anychart.enums.EventType.EDIT_INPUT_KEY_PRESS);
  if (this.dispatchEvent(evt)) {
    if (e.keyCode == goog.events.KeyCodes.ENTER || e.keyCode == goog.events.KeyCodes.ESC) {
      var type = e.keyCode == goog.events.KeyCodes.ENTER ?
          anychart.enums.EventType.EDIT_INPUT_SUBMIT :
          anychart.enums.EventType.EDIT_INPUT_ESCAPE;

      evt = this.wrapEvent_(e, type);
      if (this.dispatchEvent(evt)) {
        this.getElement().blur();
        this.hide();
      }
    }
  }
};


/**
 * Focus handler.
 * @param {goog.events.BrowserEvent} e - Browser event.
 * @private
 */
anychart.ui.EditInput.prototype.focusHandler_ = function(e) {
  var evt = this.wrapEvent_(e, anychart.enums.EventType.EDIT_INPUT_FOCUS);
  this.dispatchEvent(evt);
};


/**
 * Blur handler.
 * @param {goog.events.BrowserEvent} e - Browser event.
 * @private
 */
anychart.ui.EditInput.prototype.blurHandler_ = function(e) {
  var evt = this.wrapEvent_(e, anychart.enums.EventType.EDIT_INPUT_BLUR);
  if (this.dispatchEvent(evt)) {
    evt = this.wrapEvent_(e, anychart.enums.EventType.EDIT_INPUT_BEFORE_HIDE);
    if (this.dispatchEvent(evt)) {
      evt = this.wrapEvent_(e, anychart.enums.EventType.EDIT_INPUT_HIDE);
      if (this.dispatchEvent(evt)) {
        this.hide();
      }
    }
  }
};


/**
 * @inheritDoc
 */
anychart.ui.EditInput.prototype.enterDocument = function() {
  anychart.ui.EditInput.base(this, 'enterDocument');

  //Default this.getHandler() doesn't process ESC key in some reason.
  goog.events.listen(this.keyHandler_, goog.events.KeyHandler.EventType.KEY, this.keyPressHandler_, false, this);

  var handler = this.getHandler();
  handler.listen(this.getElement(), goog.events.EventType.FOCUS, this.focusHandler_);
  handler.listen(this.getElement(), goog.events.EventType.BLUR, this.blurHandler_);
};


/** @inheritDoc */
anychart.ui.EditInput.prototype.exitDocument = function() {
  var handler = this.getHandler();
  goog.events.unlisten(this.keyHandler_, goog.events.KeyHandler.EventType.KEY, this.keyPressHandler_, false, this);
  handler.unlisten(this.getElement(), goog.events.EventType.FOCUS, this.focusHandler_);
  handler.unlisten(this.getElement(), goog.events.EventType.BLUR, this.blurHandler_);

  anychart.ui.EditInput.base(this, 'exitDocument');
};


/**
 * @inheritDoc
 */
anychart.ui.EditInput.prototype.disposeInternal = function() {
  var handler = this.getHandler();
  goog.events.unlisten(this.keyHandler_, goog.events.KeyHandler.EventType.KEY, this.keyPressHandler_, false, this);
  handler.unlisten(this.getElement(), goog.events.EventType.FOCUS, this.focusHandler_);
  handler.unlisten(this.getElement(), goog.events.EventType.BLUR, this.blurHandler_);

  goog.dispose(this.keyHandler_);
  anychart.ui.EditInput.base(this, 'disposeInternal');

};
