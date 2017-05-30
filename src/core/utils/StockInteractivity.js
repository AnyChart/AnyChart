goog.provide('anychart.core.utils.StockInteractivity');
goog.require('anychart.core.utils.Interactivity');



/**
 * Class is settings for interactivity (like hover, select).
 * @param {anychart.core.Chart} parent Maps should be sets as parent.
 * @constructor
 * @extends {anychart.core.utils.Interactivity}
 */
anychart.core.utils.StockInteractivity = function(parent) {
  anychart.core.utils.StockInteractivity.base(this, 'constructor', parent);

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
goog.inherits(anychart.core.utils.StockInteractivity, anychart.core.utils.Interactivity);


//region --- Settings
/**
 * Allows use mouse wheel for zoming.
 * @param {boolean=} opt_value Whether will use mouse wheel.
 * @return {anychart.core.utils.StockInteractivity|boolean} .
 */
anychart.core.utils.StockInteractivity.prototype.zoomOnMouseWheel = function(opt_value) {
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
 * @return {anychart.core.utils.StockInteractivity|boolean} .
 */
anychart.core.utils.StockInteractivity.prototype.scrollOnMouseWheel = function(opt_value) {
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
/**
 * @inheritDoc
 * @suppress {deprecated}
 */
anychart.core.utils.StockInteractivity.prototype.setupByJSON = function(value, opt_default) {
  anychart.core.utils.StockInteractivity.base(this, 'setupByJSON', value, opt_default);

  this.zoomOnMouseWheel(value['zoomOnMouseWheel']);
  this.scrollOnMouseWheel(value['scrollOnMouseWheel']);
};


/**
 * @inheritDoc
 */
anychart.core.utils.StockInteractivity.prototype.serialize = function() {
  var json = anychart.core.utils.StockInteractivity.base(this, 'serialize');

  json['zoomOnMouseWheel'] = this.zoomOnMouseWheel();
  json['scrollOnMouseWheel'] = this.scrollOnMouseWheel();
  return json;
};


//endregion
//region --- Export
//exports
(function() {
  var proto = anychart.core.utils.StockInteractivity.prototype;
  proto['zoomOnMouseWheel'] = proto.zoomOnMouseWheel;
  proto['scrollOnMouseWheel'] = proto.scrollOnMouseWheel;
})();
//endregion
