goog.provide('anychart.core.linearGauge.pointers.Marker');
goog.require('anychart.core.linearGauge.pointers.Base');



/**
 * Marker pointer class.
 * @param {anychart.charts.LinearGauge} gauge Gauge.
 * @param {number} dataIndex Pointer data index.
 * @extends {anychart.core.linearGauge.pointers.Base}
 * @constructor
 */
anychart.core.linearGauge.pointers.Marker = function(gauge, dataIndex) {
  anychart.core.linearGauge.pointers.Marker.base(this, 'constructor', gauge, dataIndex);
};
goog.inherits(anychart.core.linearGauge.pointers.Marker, anychart.core.linearGauge.pointers.Base);


//region --- DRAWING ---
/** @inheritDoc */
anychart.core.linearGauge.pointers.Marker.prototype.drawVertical = function() {
  var bounds = /** @type {anychart.math.Rect} */ (this.parentBounds());
  var drawer = anychart.utils.getMarkerDrawer(this.type());

  var isVertical = this.isVertical();
  var cx, cy;
  if (isVertical) {
    cx = bounds.left + bounds.width / 2;
    cy = this.applyRatioToBounds(this.getEndRatio());
  } else {
    cx = this.applyRatioToBounds(this.getEndRatio());
    cy = bounds.top + bounds.height / 2;
  }
  var size = /** @type {number} */ (isVertical ? bounds.width : bounds.height);
  this.pointerBounds.left = cx - size / 2;
  this.pointerBounds.top = cy - size / 2;
  this.pointerBounds.width = size;
  this.pointerBounds.height = size;

  this.path.clear();
  drawer.call(null, /** @type {!acgraph.vector.Path} */ (this.path), cx, cy, size / 2);
  this.hatch.deserialize(this.path.serialize());
};


/** @inheritDoc */
anychart.core.linearGauge.pointers.Marker.prototype.drawHorizontal = anychart.core.linearGauge.pointers.Marker.prototype.drawVertical;
//endregion


//region --- INHERITED API ---
/** @inheritDoc */
anychart.core.linearGauge.pointers.Marker.prototype.getType = function() {
  return anychart.enums.LinearGaugePointerType.MARKER;
};
//endregion


//region --- SPECIFIC API ---
/**
 * Getter/setter for marker type.
 * @param {string=} opt_value Marker type.
 * @return {string|anychart.core.linearGauge.pointers.Marker} Type of marker or self for chaining.
 */
anychart.core.linearGauge.pointers.Marker.prototype.type = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.type_ != opt_value) {
      if (!goog.isNull(opt_value))
        opt_value = anychart.enums.normalizeMarkerType(opt_value, anychart.enums.MarkerType.STAR5);
      this.type_ = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.type_ || this.autoType_;
};


/**
 * Getter/setter for marker pointer auto type setting.
 * @param {anychart.enums.MarkerType=} opt_value Auto type for marker.
 * @return {anychart.enums.MarkerType|anychart.core.linearGauge.pointers.Marker} Auto type or self for chaining.
 */
anychart.core.linearGauge.pointers.Marker.prototype.autoType = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.autoType_ = opt_value;
    return this;
  }
  return this.autoType_;
};
//endregion


//region --- SETUP/DISPOSING ---
/** @inheritDoc */
anychart.core.linearGauge.pointers.Marker.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.linearGauge.pointers.Marker.base(this, 'setupByJSON', config, opt_default);
  this.type(config['type']);
};


/** @inheritDoc */
anychart.core.linearGauge.pointers.Marker.prototype.serialize = function() {
  var json = anychart.core.linearGauge.pointers.Marker.base(this, 'serialize');
  if (this.type_)
    json['type'] = this.type();
  return json;
};
//endregion


//exports
(function() {
  var proto = anychart.core.linearGauge.pointers.Marker.prototype;
  proto['type'] = proto.type;
})();
