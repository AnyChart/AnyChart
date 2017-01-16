goog.provide('anychart.core.utils.Interactivity');
goog.require('anychart.core.Base');



/**
 * Class is settings for interactivity (like hover, select).
 * @param {anychart.core.Chart} parent Maps should be sets as parent.
 * @constructor
 * @extends {anychart.core.Base}
 */
anychart.core.utils.Interactivity = function(parent) {
  anychart.core.utils.Interactivity.base(this, 'constructor');

  /**
   * @type {anychart.core.Chart}
   * @private
   */
  this.parent_ = parent;

  /**
   * @type {anychart.enums.HoverMode}
   * @private
   */
  this.hoverMode_;

  /**
   * @type {anychart.enums.SelectionMode}
   * @private
   */
  this.selectionMode_;

  /**
   * @type {boolean}
   * @private
   */
  this.allowMultiSeriesSelection_;

  /**
   * @type {number}
   * @private
   */
  this.spotRadius_;
};
goog.inherits(anychart.core.utils.Interactivity, anychart.core.Base);


/**
 * Supported signals.
 * @type {number}
 */
anychart.core.utils.Interactivity.prototype.SUPPORTED_SIGNALS = anychart.Signal.NEEDS_REAPPLICATION;


/**
 * @param {(anychart.enums.HoverMode|string)=} opt_value Hover mode.
 * @return {anychart.core.utils.Interactivity|anychart.enums.HoverMode} .
 */
anychart.core.utils.Interactivity.prototype.hoverMode = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeHoverMode(opt_value);
    if (opt_value != this.hoverMode_) {
      this.hoverMode_ = opt_value;
      this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  }
  return /** @type {anychart.enums.HoverMode}*/(this.hoverMode_);
};


/**
 * @param {(anychart.enums.SelectionMode|string)=} opt_value Selection mode.
 * @return {anychart.core.utils.Interactivity|anychart.enums.SelectionMode} .
 */
anychart.core.utils.Interactivity.prototype.selectionMode = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeSelectMode(opt_value);
    if (opt_value != this.selectionMode_) {
      this.selectionMode_ = opt_value;
    }
    return this;
  }
  return /** @type {anychart.enums.SelectionMode}*/(this.selectionMode_);
};


/**
 * @param {number=} opt_value Spot radius.
 * @return {anychart.core.utils.Interactivity|number} .
 */
anychart.core.utils.Interactivity.prototype.spotRadius = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.toNumber(opt_value);
    if (opt_value != this.spotRadius_) {
      this.spotRadius_ = opt_value;
    }
    return this;
  }
  return /** @type {number}*/(this.spotRadius_);
};


/**
 * todo (blackart) not implemented yet, I don't remember what it should be to do.
 * @param {boolean=} opt_value Allow selects more then one series on a chart or not.
 * @return {anychart.core.utils.Interactivity|boolean} .
 */
anychart.core.utils.Interactivity.prototype.allowMultiSeriesSelection = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = !!opt_value;
    if (opt_value != this.allowMultiSeriesSelection_) {
      this.allowMultiSeriesSelection_ = opt_value;
    }
    return this;
  }
  return /** @type {boolean}*/(this.allowMultiSeriesSelection_);
};


/**
 * @inheritDoc
 */
anychart.core.utils.Interactivity.prototype.setupByJSON = function(value, opt_default) {
  anychart.core.utils.Interactivity.base(this, 'setupByJSON', value, opt_default);

  this.parent_.suspendSignalsDispatching();
  this.hoverMode(value['hoverMode']);
  this.selectionMode(value['selectionMode']);
  this.spotRadius(value['spotRadius']);
  this.allowMultiSeriesSelection(value['allowMultiSeriesSelection']);
  this.parent_.resumeSignalsDispatching(true);
};


/**
 * Serializes element to JSON.
 * @return {!Object} Serialized JSON object.
 */
anychart.core.utils.Interactivity.prototype.serialize = function() {
  var json = {};
  json['hoverMode'] = this.hoverMode();
  json['selectionMode'] = this.selectionMode();
  json['spotRadius'] = this.spotRadius();
  json['allowMultiSeriesSelection'] = this.allowMultiSeriesSelection();
  return json;
};


//exports
(function() {
  var proto = anychart.core.utils.Interactivity.prototype;
  //proto['allowMultiSeriesSelection'] = proto.allowMultiSeriesSelection;
  proto['hoverMode'] = proto.hoverMode;
  proto['selectionMode'] = proto.selectionMode;
  proto['spotRadius'] = proto.spotRadius;
})();
