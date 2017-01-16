goog.provide('anychart.core.axisMarkers.Range');
goog.require('acgraph');
goog.require('anychart.color');
goog.require('anychart.core.axisMarkers.PathBase');



/**
 * Range marker.
 * @constructor
 * @extends {anychart.core.axisMarkers.PathBase}
 */
anychart.core.axisMarkers.Range = function() {
  anychart.core.axisMarkers.Range.base(this, 'constructor');

  /**
   * @type {anychart.core.axisMarkers.PathBase.Range}
   */
  this.val = {from: 0, to: 0};

  /**
   * @type {string|acgraph.vector.Fill}
   * @private
   */
  this.fill_;

  /**
   * @type {string|acgraph.vector.Fill}
   * @private
   */
  this.defaultFill_ = 'black';

  /**
   * @type {anychart.enums.Layout}
   * @private
   */
  this.layout_;

  /**
   * @type {anychart.enums.Layout}
   * @private
   */
  this.defaultLayout_ = anychart.enums.Layout.HORIZONTAL;

  this.setDefaultFill('#c1c1c1 0.4');
};
goog.inherits(anychart.core.axisMarkers.Range, anychart.core.axisMarkers.PathBase);


//----------------------------------------------------------------------------------------------------------------------
//  States and signals.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Supported signals.
 * @type {number}
 */
anychart.core.axisMarkers.Range.prototype.SUPPORTED_SIGNALS =
    anychart.core.axisMarkers.PathBase.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.axisMarkers.Range.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.axisMarkers.PathBase.prototype.SUPPORTED_CONSISTENCY_STATES;


//----------------------------------------------------------------------------------------------------------------------
//  Layout.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Get/set layout.
 * @param {anychart.enums.Layout=} opt_value - RangeMarker layout.
 * @return {anychart.enums.Layout|anychart.core.axisMarkers.Range} - Layout or this.
 */
anychart.core.axisMarkers.Range.prototype.layout = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var layout = anychart.enums.normalizeLayout(opt_value);
    if (this.layout_ != layout) {
      this.layout_ = layout;
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else if (this.layout_) {
    return this.layout_;
  } else if (this.axis()) {
    var axisOrientation = this.axis().orientation();
    var isHorizontal = (axisOrientation == anychart.enums.Orientation.LEFT || axisOrientation == anychart.enums.Orientation.RIGHT);
    return isHorizontal ? anychart.enums.Layout.HORIZONTAL : anychart.enums.Layout.VERTICAL;
  } else {
    return this.defaultLayout_;
  }
};


/**
 * Set Default layout.
 * @param {anychart.enums.Layout} value Layout value.
 */
anychart.core.axisMarkers.Range.prototype.setDefaultLayout = function(value) {
  var needInvalidate = !this.layout_ && this.defaultLayout_ != value;
  this.defaultLayout_ = value;
  if (needInvalidate)
    this.invalidate(anychart.ConsistencyState.BOUNDS);
};


//----------------------------------------------------------------------------------------------------------------------
//  Scale.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for scale.
 * @param {anychart.scales.Base=} opt_value Scale.
 * @return {anychart.scales.Base|!anychart.core.axisMarkers.Range} Axis scale or itself for method chaining.
 */
anychart.core.axisMarkers.Range.prototype.scale = function(opt_value) {
  return /** @type {anychart.scales.Base|!anychart.core.axisMarkers.Range} */ (this.scaleInternal(opt_value));
};


//----------------------------------------------------------------------------------------------------------------------
//  Settings.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Get/set range marker fill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {!(acgraph.vector.Fill|anychart.core.axisMarkers.Range)} .
 */
anychart.core.axisMarkers.Range.prototype.fill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var fill = acgraph.vector.normalizeFill.apply(null, arguments);
    if (fill != this.fill_) {
      this.fill_ = fill;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.fill_ || this.defaultFill_;
};


/**
 * @param {acgraph.vector.Fill} value Default fill value.
 */
anychart.core.axisMarkers.Range.prototype.setDefaultFill = function(value) {
  var needInvalidate = !this.fill_ && this.defaultFill_ != value;
  this.defaultFill_ = value;
  if (needInvalidate)
    this.invalidate(anychart.ConsistencyState.APPEARANCE);
};


/**
 * Get/set starting marker value.
 * @param {number=} opt_newValue RangeMarker value settings.
 * @return {number|anychart.core.axisMarkers.Range} RangeMarker value settings or RangeMarker instance for method chaining.
 */
anychart.core.axisMarkers.Range.prototype.from = function(opt_newValue) {
  if (goog.isDef(opt_newValue)) {
    if (this.val.from != opt_newValue) {
      this.val.from = opt_newValue;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }

  return /** @type {number} */ (this.val.from);
};


/**
 * Get/set ending marker value.
 * @param {number=} opt_newValue RangeMarker value settings.
 * @return {number|anychart.core.axisMarkers.Range} RangeMarker value settings or RangeMarker instance for method chaining.
 */
anychart.core.axisMarkers.Range.prototype.to = function(opt_newValue) {
  if (goog.isDef(opt_newValue)) {
    if (this.val.to != opt_newValue) {
      this.val.to = opt_newValue;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }

  return /** @type {number} */ (this.val.to);
};


//----------------------------------------------------------------------------------------------------------------------
//  Drawing.
//----------------------------------------------------------------------------------------------------------------------
/**
 * @inheritDoc
 */
anychart.core.axisMarkers.Range.prototype.boundsInvalidated = function() {
  this.drawRange();
};


/**
 * @inheritDoc
 */
anychart.core.axisMarkers.Range.prototype.appearanceInvalidated = function() {
  this.markerElement().stroke(null).fill(/** @type {acgraph.vector.Fill} */(this.fill()));
};


//----------------------------------------------------------------------------------------------------------------------
//  Disposing.
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.axisMarkers.Range.prototype.disposeInternal = function() {
  delete this.fill_;
  anychart.core.axisMarkers.Range.base(this, 'disposeInternal');
};


/** @inheritDoc */
anychart.core.axisMarkers.Range.prototype.serialize = function() {
  var json = anychart.core.axisMarkers.Range.base(this, 'serialize');
  json['from'] = this.from();
  json['to'] = this.to();
  if (this.fill_) json['fill'] = anychart.color.serialize(this.fill_);
  if (this.layout_) json['layout'] = this.layout_;
  return json;
};


/** @inheritDoc */
anychart.core.axisMarkers.Range.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.axisMarkers.Range.base(this, 'setupByJSON', config, opt_default);
  this.from(config['from']);
  this.to(config['to']);
  this.fill(config['fill']);
};


//exports
(function() {
  var proto = anychart.core.axisMarkers.Range.prototype;
  proto['from'] = proto.from;
  proto['to'] = proto.to;
  proto['scale'] = proto.scale;
  proto['axis'] = proto.axis;
  proto['layout'] = proto.layout;
  proto['fill'] = proto.fill;
  proto['isHorizontal'] = proto.isHorizontal;
})();
