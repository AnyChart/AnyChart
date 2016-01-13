goog.provide('anychart.core.utils.MapInteractivity');
goog.require('anychart.core.utils.Interactivity');



/**
 * Class is settings for interactivity (like hover, select).
 * @param {anychart.core.Chart} parent Maps should be sets as parent.
 * @constructor
 * @extends {anychart.core.utils.Interactivity}
 */
anychart.core.utils.MapInteractivity = function(parent) {
  goog.base(this, parent);

  /**
   * @type {boolean}
   * @private
   */
  this.mouseWheel_;

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


/**
 * Allows use mouse wheel
 * @param {boolean=} opt_value Whether will use mouse wheel.
 * @return {anychart.core.utils.Interactivity|boolean} .
 */
anychart.core.utils.MapInteractivity.prototype.mouseWheel = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = !!opt_value;
    if (opt_value != this.mouseWheel_) {
      this.mouseWheel_ = opt_value;
    }
    return this;
  }
  return /** @type {boolean} */(this.mouseWheel_);
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


/**
 * @inheritDoc
 */
anychart.core.utils.MapInteractivity.prototype.setup = function(value) {
  if (goog.isDef(value) && goog.isObject(value)) {
    this.mouseWheel(value['mouseWheel']);
    this.drag(value['drag']);
    this.copyFormatter(value['copyFormatter']);
  }
  goog.base(this, 'setup', value);
  return this;
};


/**
 * @inheritDoc
 */
anychart.core.utils.MapInteractivity.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  json['mouseWheel'] = this.mouseWheel();
  json['drag'] = this.drag();
  if (!goog.isFunction(this.copyFormatter()))
    json['copyFormatter'] = this.copyFormatter();
  return json;
};


//exports
anychart.core.utils.MapInteractivity.prototype['mouseWheel'] = anychart.core.utils.MapInteractivity.prototype.mouseWheel;
anychart.core.utils.MapInteractivity.prototype['drag'] = anychart.core.utils.MapInteractivity.prototype.drag;
anychart.core.utils.MapInteractivity.prototype['copyFormatter'] = anychart.core.utils.MapInteractivity.prototype.copyFormatter;


