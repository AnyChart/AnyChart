goog.provide('anychart.mapModule.utils.UnboundRegionsSettings');



/**
 * Class for using in maps. Class is settings for regions that isn't linked to any series.
 * @param {anychart.mapModule.Chart} parent Maps should be sets as parent.
 * @constructor
 */
anychart.mapModule.utils.UnboundRegionsSettings = function(parent) {
  this.parent_ = parent;

  /**
   * @type {boolean}
   * @private
   */
  this.enabled_ = true;

  /**
   * @type {?acgraph.vector.Fill}
   * @private
   */
  this.fill_ = null;

  /**
   * @type {?acgraph.vector.Stroke}
   * @private
   */
  this.stroke_ = null;
};


/**
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.mapModule.utils.UnboundRegionsSettings|acgraph.vector.Stroke} .
 */
anychart.mapModule.utils.UnboundRegionsSettings.prototype.stroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var stroke = acgraph.vector.normalizeStroke.apply(null, arguments);
    if (stroke != this.stroke_) {
      this.stroke_ = stroke;
      this.parent_.invalidate(anychart.ConsistencyState.APPEARANCE,
          anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return /** @type {acgraph.vector.Stroke} */(this.stroke_);
};


/**
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {anychart.mapModule.utils.UnboundRegionsSettings|acgraph.vector.Fill} .
 */
anychart.mapModule.utils.UnboundRegionsSettings.prototype.fill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var fill = acgraph.vector.normalizeFill.apply(null, arguments);
    if (fill != this.fill_) {
      this.fill_ = fill;
      this.parent_.invalidate(anychart.ConsistencyState.APPEARANCE,
          anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return /** @type {acgraph.vector.Fill} */(this.fill_);
};


/**
 * Getter/Setter for the element enabled state.
 * We should not add possible null value of the param and result to the public doc. It is needed for compiler because
 * of overrides.
 * @param {?boolean=} opt_value Value to set.
 * @return {!anychart.mapModule.utils.UnboundRegionsSettings|boolean} .
 */
anychart.mapModule.utils.UnboundRegionsSettings.prototype.enabled = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = !!opt_value;
    if (this.enabled_ != opt_value) {
      this.enabled_ = opt_value;
      this.parent_.invalidate(anychart.ConsistencyState.APPEARANCE,
          anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.enabled_;
};


/**
 * Setups the element using passed configuration value. It can be a JSON object or a special value that setups
 * instances of descendant classes.
 * Note: this method only changes element properties if they are supposed to be changed by the config value -
 * it doesn't reset other properties to their defaults.
 * @param {Object|boolean|null} value Value to setup the instance.
 * @return {anychart.mapModule.utils.UnboundRegionsSettings} Returns itself for chaining.
 */
anychart.mapModule.utils.UnboundRegionsSettings.prototype.setup = function(value) {
  if (goog.isDef(value)) {
    this.parent_.suspendSignalsDispatching();
    if (goog.isBoolean(value) || goog.isNull(value)) {
      this.enabled(!!value);
    } else if (goog.isObject(value)) {
      this.stroke(value['stroke']);
      this.fill(value['fill']);
      this.enabled(value['enabled']);
    }
    this.parent_.resumeSignalsDispatching(true);
  }
  return this;
};


/**
 * Serializes element to JSON.
 * @return {!Object} Serialized JSON object.
 */
anychart.mapModule.utils.UnboundRegionsSettings.prototype.serialize = function() {
  var json = {};
  json['fill'] = this.fill();
  json['enabled'] = this.enabled();
  json['stroke'] = this.stroke();
  return json;
};


//exports
(function() {
  var proto = anychart.mapModule.utils.UnboundRegionsSettings.prototype;
  proto['stroke'] = proto.stroke;
  proto['fill'] = proto.fill;
  proto['enabled'] = proto.enabled;
})();
