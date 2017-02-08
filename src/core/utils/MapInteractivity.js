goog.provide('anychart.core.utils.MapInteractivity');
goog.require('anychart.core.utils.Interactivity');



/**
 * Class is settings for interactivity (like hover, select).
 * @param {anychart.core.Chart} parent Maps should be sets as parent.
 * @constructor
 * @extends {anychart.core.utils.Interactivity}
 */
anychart.core.utils.MapInteractivity = function(parent) {
  anychart.core.utils.MapInteractivity.base(this, 'constructor', parent);

  /**
   * @type {boolean}
   * @private
   */
  this.zoomOnMouseWheel_;

  /**
   * @type {boolean}
   * @private
   */
  this.zoomOnDoubleClick_;

  /**
   * @type {boolean}
   * @private
   */
  this.keyboardZoomAndMove_;

  /**
   * @type {boolean}
   * @private
   */
  this.drag_;

  /**
   * @type {Function}
   * @private
   */
  this.copyFormatter_;
};
goog.inherits(anychart.core.utils.MapInteractivity, anychart.core.utils.Interactivity);


//region --- Settings
/**
 * Allows use mouse wheel for zoming.
 * @param {boolean=} opt_value Whether will use mouse wheel.
 * @return {anychart.core.utils.Interactivity|boolean} .
 */
anychart.core.utils.MapInteractivity.prototype.zoomOnMouseWheel = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = !!opt_value;
    if (opt_value != this.zoomOnMouseWheel_) {
      this.zoomOnMouseWheel_ = opt_value;
    }
    return this;
  }
  return /** @type {boolean} */(this.zoomOnMouseWheel_);
};


/**
 * Allows use mouse wheel
 * @param {boolean=} opt_value Whether will use mouse wheel.
 * @return {anychart.core.utils.Interactivity|boolean} .
 * @deprecated Since 7.11.0. Use zoomOnMouseWheel() method instead.
 */
anychart.core.utils.MapInteractivity.prototype.mouseWheel = function(opt_value) {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null, ['mouseWheel()', 'zoomOnMouseWheel()'], true);
  return this.zoomOnMouseWheel(opt_value);
};


/**
 * Allows use double click for zoom.
 * @param {boolean=} opt_value Whether will use dbl click for zoom.
 * @return {anychart.core.utils.Interactivity|boolean} .
 */
anychart.core.utils.MapInteractivity.prototype.zoomOnDoubleClick = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = !!opt_value;
    if (opt_value != this.zoomOnDoubleClick_) {
      this.zoomOnDoubleClick_ = opt_value;
    }
    return this;
  }
  return /** @type {boolean} */(this.zoomOnDoubleClick_);
};


/**
 * Allows use keyboard for zoom and move.
 * @param {boolean=} opt_value Whether will use dbl click for zoom.
 * @return {anychart.core.utils.Interactivity|boolean} .
 */
anychart.core.utils.MapInteractivity.prototype.keyboardZoomAndMove = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = !!opt_value;
    if (opt_value != this.keyboardZoomAndMove_) {
      this.keyboardZoomAndMove_ = opt_value;
    }
    return this;
  }
  return /** @type {boolean} */(this.keyboardZoomAndMove_);
};


/**
 * Allows use drag for map.
 * @param {boolean=} opt_value Allow drag map.
 * @return {anychart.core.utils.Interactivity|boolean} .
 */
anychart.core.utils.MapInteractivity.prototype.drag = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = !!opt_value;
    if (opt_value != this.drag_) {
      this.drag_ = opt_value;
    }
    return this;
  }
  return /** @type {boolean} */(this.drag_);
};


/**
 * Copy formatter. Data formatter for feature copy operation.
 * @param {Function=} opt_value Formatter.
 * @return {anychart.core.utils.Interactivity|Function} .
 */
anychart.core.utils.MapInteractivity.prototype.copyFormatter = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (opt_value != this.copyFormatter_) {
      this.copyFormatter_ = opt_value;
    }
    return this;
  }
  return /** @type {Function} */(this.copyFormatter_);
};


//endregion
//region --- Setup and serialize
/**
 * @inheritDoc
 * @suppress {deprecated}
 */
anychart.core.utils.MapInteractivity.prototype.setupByJSON = function(value, opt_default) {
  anychart.core.utils.MapInteractivity.base(this, 'setupByJSON', value, opt_default);

  if (goog.isDef(value['mouseWheel']))
    this.mouseWheel(value['mouseWheel']);
  this.zoomOnMouseWheel(value['zoomOnMouseWheel']);
  this.keyboardZoomAndMove(value['keyboardZoomAndMove']);
  this.zoomOnDoubleClick(value['zoomOnDoubleClick']);
  this.drag(value['drag']);
  this.copyFormatter(value['copyFormatter']);
};


/**
 * @inheritDoc
 */
anychart.core.utils.MapInteractivity.prototype.serialize = function() {
  var json = anychart.core.utils.MapInteractivity.base(this, 'serialize');

  json['zoomOnMouseWheel'] = this.zoomOnMouseWheel();
  json['keyboardZoomAndMove'] = this.keyboardZoomAndMove();
  json['zoomOnDoubleClick'] = this.zoomOnDoubleClick();
  json['drag'] = this.drag();
  if (!goog.isFunction(this.copyFormatter()))
    json['copyFormatter'] = this.copyFormatter();
  return json;
};


//endregion
//region --- Export
//exports
/** @suppress {deprecated} */
(function() {
  var proto = anychart.core.utils.MapInteractivity.prototype;
  proto['mouseWheel'] = proto.mouseWheel;               //deprecated
  proto['zoomOnMouseWheel'] = proto.zoomOnMouseWheel;
  proto['keyboardZoomAndMove'] = proto.keyboardZoomAndMove;
  proto['zoomOnDoubleClick'] = proto.zoomOnDoubleClick;
  proto['drag'] = proto.drag;
  proto['copyFormatter'] = proto.copyFormatter;
})();
//endregion
