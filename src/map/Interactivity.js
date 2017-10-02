goog.provide('anychart.mapModule.Interactivity');
goog.require('anychart.core.utils.Interactivity');



/**
 * Class is settings for interactivity (like hover, select).
 * @param {anychart.core.Chart} parent Maps should be sets as parent.
 * @constructor
 * @extends {anychart.core.utils.Interactivity}
 */
anychart.mapModule.Interactivity = function(parent) {
  anychart.mapModule.Interactivity.base(this, 'constructor', parent);

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
  this.copyFormat_;
};
goog.inherits(anychart.mapModule.Interactivity, anychart.core.utils.Interactivity);


//region --- Settings
/**
 * Allows use mouse wheel for zoming.
 * @param {boolean=} opt_value Whether will use mouse wheel.
 * @return {anychart.core.utils.Interactivity|boolean} .
 */
anychart.mapModule.Interactivity.prototype.zoomOnMouseWheel = function(opt_value) {
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
 * Allows use double click for zoom.
 * @param {boolean=} opt_value Whether will use dbl click for zoom.
 * @return {anychart.core.utils.Interactivity|boolean} .
 */
anychart.mapModule.Interactivity.prototype.zoomOnDoubleClick = function(opt_value) {
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
anychart.mapModule.Interactivity.prototype.keyboardZoomAndMove = function(opt_value) {
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
anychart.mapModule.Interactivity.prototype.drag = function(opt_value) {
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
anychart.mapModule.Interactivity.prototype.copyFormat = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (opt_value != this.copyFormat_) {
      this.copyFormat_ = opt_value;
    }
    return this;
  }
  return /** @type {Function} */(this.copyFormat_);
};


//endregion
//region --- Setup and serialize
/** @inheritDoc */
anychart.mapModule.Interactivity.prototype.setupByJSON = function(value, opt_default) {
  anychart.mapModule.Interactivity.base(this, 'setupByJSON', value, opt_default);

  this.zoomOnMouseWheel(value['zoomOnMouseWheel']);
  this.keyboardZoomAndMove(value['keyboardZoomAndMove']);
  this.zoomOnDoubleClick(value['zoomOnDoubleClick']);
  this.drag(value['drag']);
  this.copyFormat(value['copyFormat']);
};


/**
 * @inheritDoc
 */
anychart.mapModule.Interactivity.prototype.serialize = function() {
  var json = anychart.mapModule.Interactivity.base(this, 'serialize');

  json['zoomOnMouseWheel'] = this.zoomOnMouseWheel();
  json['keyboardZoomAndMove'] = this.keyboardZoomAndMove();
  json['zoomOnDoubleClick'] = this.zoomOnDoubleClick();
  json['drag'] = this.drag();
  if (!goog.isFunction(this.copyFormat()))
    json['copyFormat'] = this.copyFormat();
  return json;
};


//endregion
//region --- Export
//exports
(function() {
  var proto = anychart.mapModule.Interactivity.prototype;
  proto['zoomOnMouseWheel'] = proto.zoomOnMouseWheel;
  proto['keyboardZoomAndMove'] = proto.keyboardZoomAndMove;
  proto['zoomOnDoubleClick'] = proto.zoomOnDoubleClick;
  proto['drag'] = proto.drag;
  proto['copyFormat'] = proto.copyFormat;
})();
//endregion
