goog.provide('anychart.stockModule.Interactivity');
goog.require('anychart.core.utils.Interactivity');



/**
 * Class is settings for interactivity (like hover, select).
 * @param {anychart.core.Chart} parent Maps should be sets as parent.
 * @constructor
 * @extends {anychart.core.utils.Interactivity}
 */
anychart.stockModule.Interactivity = function(parent) {
  anychart.stockModule.Interactivity.base(this, 'constructor', parent);

  /**
   * @type {boolean}
   * @private
   */
  this.zoomOnMouseWheel_;

  /**
   * @type {boolean}
   * @private
   */
  this.scrollOnMouseWheel_;
};
goog.inherits(anychart.stockModule.Interactivity, anychart.core.utils.Interactivity);


//region --- Settings
/**
 * Allows use mouse wheel for zoming.
 * @param {boolean=} opt_value Whether will use mouse wheel.
 * @return {anychart.stockModule.Interactivity|boolean} .
 */
anychart.stockModule.Interactivity.prototype.zoomOnMouseWheel = function(opt_value) {
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
 * Allows use mouse wheel for scrolling.
 * @param {boolean=} opt_value Whether will use mouse wheel.
 * @return {anychart.stockModule.Interactivity|boolean} .
 */
anychart.stockModule.Interactivity.prototype.scrollOnMouseWheel = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = !!opt_value;
    if (opt_value != this.scrollOnMouseWheel_) {
      this.scrollOnMouseWheel_ = opt_value;
    }
    return this;
  }
  return /** @type {boolean} */(this.scrollOnMouseWheel_);
};


//endregion
//region --- Setup and serialize
/** @inheritDoc */
anychart.stockModule.Interactivity.prototype.setupByJSON = function(value, opt_default) {
  anychart.stockModule.Interactivity.base(this, 'setupByJSON', value, opt_default);

  this.zoomOnMouseWheel(value['zoomOnMouseWheel']);
  this.scrollOnMouseWheel(value['scrollOnMouseWheel']);
};


/**
 * @inheritDoc
 */
anychart.stockModule.Interactivity.prototype.serialize = function() {
  var json = anychart.stockModule.Interactivity.base(this, 'serialize');

  json['zoomOnMouseWheel'] = this.zoomOnMouseWheel();
  json['scrollOnMouseWheel'] = this.scrollOnMouseWheel();
  return json;
};


//endregion
//region --- Export
//exports
(function() {
  var proto = anychart.stockModule.Interactivity.prototype;
  proto['zoomOnMouseWheel'] = proto.zoomOnMouseWheel;
  proto['scrollOnMouseWheel'] = proto.scrollOnMouseWheel;
})();
//endregion
