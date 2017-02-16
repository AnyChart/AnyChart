goog.provide('anychart.core.gauge.pointers.Marker');
goog.require('acgraph');
goog.require('anychart.core.gauge.pointers.Base');
goog.require('anychart.core.reporting');
goog.require('anychart.core.ui.MarkersFactory');
goog.require('anychart.enums');
goog.require('anychart.utils');



/**
 * Marker pointer class.<br/>
 * @constructor
 * @extends {anychart.core.gauge.pointers.Base}
 */
anychart.core.gauge.pointers.Marker = function() {
  anychart.core.gauge.pointers.Marker.base(this, 'constructor');

  /**
   * Pointer size.
   * @type {?string}
   * @private
   */
  this.size_;

  /**
   * Pointer position.
   * @type {anychart.enums.GaugeSidePosition}
   * @private
   */
  this.position_;

  /**
   * Pointer radius.
   * @type {?string}
   * @private
   */
  this.radius_;

  /**
   * Pointer radius.
   * @type {anychart.enums.MarkerType|function(acgraph.vector.Path, number, number, number): acgraph.vector.Path}
   * @private
   */
  this.type_;

  this.domElement = new anychart.core.ui.MarkersFactory();
  // defaults that was deleted form MarkersFactory
  this.domElement.setParentEventTarget(this);
  this.domElement.positionFormatter(anychart.utils.DEFAULT_FORMATTER);
  this.domElement.size(10);
  this.domElement.anchor(anychart.enums.Anchor.CENTER);
  this.domElement.offsetX(0);
  this.domElement.offsetY(0);
  this.domElement.rotation(0);
};
goog.inherits(anychart.core.gauge.pointers.Marker, anychart.core.gauge.pointers.Base);


/**
 * Marker size in percent relative gauge radius.
 * @param {(null|number|string)=} opt_value .
 * @return {(string|anychart.core.gauge.pointers.Marker)} .
 */
anychart.core.gauge.pointers.Marker.prototype.size = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = /** @type {string} */ (anychart.utils.normalizeToPercent(opt_value));
    if (this.size_ != opt_value) {
      this.size_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else
    return this.size_;
};


/**
 * Marker position relative axis - inside, center, outside.
 * @param {(anychart.enums.GaugeSidePosition|string)=} opt_value .
 * @return {(anychart.enums.GaugeSidePosition|string|!anychart.core.gauge.pointers.Marker)} .
 */
anychart.core.gauge.pointers.Marker.prototype.position = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeGaugeSidePosition(opt_value);
    if (this.position_ != opt_value)
      this.position_ = opt_value;
    this.invalidate(anychart.ConsistencyState.BOUNDS,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    return this;
  } else
    return this.position_;
};


/**
 * Pointer radius in percent relative gauge radius.
 * @param {(null|number|string)=} opt_value .
 * @return {(string|anychart.core.gauge.pointers.Marker)} .
 */
anychart.core.gauge.pointers.Marker.prototype.radius = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = goog.isNull(opt_value) ? opt_value : /** @type {string} */ (anychart.utils.normalizeToPercent(opt_value));
    if (this.radius_ != opt_value) {
      this.radius_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.radius_;
  }
};


/**
 * Marker type.
 * @param {(anychart.enums.MarkerType|function(acgraph.vector.Path, number,
 * number, number): acgraph.vector.Path|string)=} opt_value .
 * @return {(!anychart.core.gauge.pointers.Marker|anychart.enums.MarkerType|function(acgraph.vector.Path, number,
 * number, number): acgraph.vector.Path)} .
 */
anychart.core.gauge.pointers.Marker.prototype.type = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = goog.isFunction(opt_value) ?
        opt_value :
        anychart.enums.normalizeMarkerType(opt_value, anychart.enums.MarkerType.LINE);
    if (this.type_ != opt_value) {
      this.type_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else
    return this.type_;
};


/** @inheritDoc */
anychart.core.gauge.pointers.Marker.prototype.draw = function() {
  var gauge = this.gauge();
  var axis = gauge.getAxis(/** @type {number} */(this.axisIndex()));
  if (!this.checkDrawingNeeded())
    return this;

  if (!axis || !axis.enabled()) {
    if (this.domElement) this.domElement.clear();
    if (this.hatchFillElement) this.hatchFillElement.clear();
    return this;
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.GAUGE_HATCH_FILL)) {
    var fill = /** @type {acgraph.vector.PatternFill|acgraph.vector.HatchFill} */(this.hatchFill());
    if (!this.hatchFillElement && !anychart.utils.isNone(fill)) {
      this.hatchFillElement = new anychart.core.ui.MarkersFactory();
      this.hatchFillElement.positionFormatter(anychart.utils.DEFAULT_FORMATTER);
      this.hatchFillElement.size(10);
      this.hatchFillElement.anchor(anychart.enums.Anchor.CENTER);
      this.hatchFillElement.offsetX(0);
      this.hatchFillElement.offsetY(0);
      this.hatchFillElement.rotation(0);
      this.hatchFillElement.container(/** @type {acgraph.vector.ILayer} */(this.container()));
      this.hatchFillElement.zIndex(/** @type {number} */(this.zIndex() + 1));
    }

    if (this.hatchFillElement) {
      this.hatchFillElement.disablePointerEvents(true);
      this.hatchFillElement.fill(fill);
      this.hatchFillElement.stroke(null);
      this.hatchFillElement.size(this.pixSize_);
      this.hatchFillElement.type(this.type_);

      this.invalidate(anychart.ConsistencyState.BOUNDS);
    }

    this.markConsistent(anychart.ConsistencyState.GAUGE_HATCH_FILL);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    var cx = gauge.getCx();
    var cy = gauge.getCy();

    var scale = axis.scale();

    var iterator = gauge.getResetIterator();
    iterator.select(/** @type {number} */(this.dataIndex()));
    var value = parseFloat(iterator.get('value'));

    if (scale.isMissing(value)) {
      if (this.domElement) this.domElement.clear();
      if (this.hatchFillElement) this.hatchFillElement.clear();

      this.markConsistent(anychart.ConsistencyState.BOUNDS);
      return this;
    }

    var axisRadius = axis.getPixRadius();
    var axisWidth = axis.getPixWidth();
    var axisStartAngle = /** @type {number} */(goog.isDef(axis.startAngle()) ? axis.getStartAngle() : gauge.getStartAngle());
    var axisSweepAngle = /** @type {number} */(goog.isDef(axis.sweepAngle()) ? axis.sweepAngle() : gauge.sweepAngle());

    var pixRadius = goog.isDefAndNotNull(this.radius_) ?
        anychart.utils.normalizeSize(this.radius_, gauge.getPixRadius()) :
        axisRadius;
    this.pixSize_ = goog.isDefAndNotNull(this.size_) ?
        anychart.utils.normalizeSize(this.size_, gauge.getPixRadius()) :
        axisWidth;

    if (this.position_ == anychart.enums.GaugeSidePosition.OUTSIDE)
      pixRadius += this.pixSize_ + axisWidth / 2;
    else if (this.position_ == anychart.enums.GaugeSidePosition.INSIDE)
      pixRadius -= this.pixSize_ + axisWidth / 2;

    var valueRatio = goog.math.clamp(scale.transform(value), 0, 1);

    var angle = goog.math.standardAngle(axisStartAngle + valueRatio * axisSweepAngle);
    var angleRad = goog.math.toRadians(angle);

    var x = cx + pixRadius * Math.cos(angleRad);
    var y = cy + pixRadius * Math.sin(angleRad);


    this.contextProvider['cx'] = cx;
    this.contextProvider['cy'] = cy;
    this.contextProvider['radius'] = pixRadius;
    this.contextProvider['size'] = this.pixSize_;
    //we shouldn't opening secret for mere mortals
    this.contextProvider['angle'] = goog.math.standardAngle(angle - anychart.charts.CircularGauge.DEFAULT_START_ANGLE);


    this.domElement.size(this.pixSize_);
    this.domElement.type(this.type_);

    var marker = this.domElement.add({'value': {'x': x, 'y': y}}, 0);
    marker.rotation(angle + 90);

    if (this.hatchFillElement) {
      this.hatchFillElement.size(this.pixSize_);
      this.hatchFillElement.type(this.type_);

      var hatchFill = this.hatchFillElement.add({'value': {'x': x, 'y': y}}, 0);
      hatchFill.rotation(angle + 90);
    }

    if (goog.isFunction(this.fill()) || goog.isFunction(this.stroke()))
      this.invalidate(anychart.ConsistencyState.APPEARANCE);

    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  anychart.core.gauge.pointers.Marker.base(this, 'draw');

  this.domElement.draw();
  if (this.hatchFillElement) this.hatchFillElement.draw();


  if (marker && marker.getDomElement())
    marker.getDomElement().tag = iterator.getIndex();

  return this;
};


//----------------------------------------------------------------------------------------------------------------------
//  Serialize & Deserialize
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.gauge.pointers.Marker.prototype.serialize = function() {
  var json = anychart.core.gauge.pointers.Marker.base(this, 'serialize');

  json['position'] = this.position();
  json['size'] = this.size();
  if (goog.isFunction(this.type())) {
    anychart.core.reporting.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Gauge marker pointer type']
    );
  } else {
    json['type'] = this.type();
  }
  if (goog.isDef(this.radius())) json['radius'] = this.radius();

  return json;
};


/** @inheritDoc */
anychart.core.gauge.pointers.Marker.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.gauge.pointers.Marker.base(this, 'setupByJSON', config, opt_default);

  this.size(config['size']);
  this.position(config['position']);
  this.type(config['type']);
  this.radius(config['radius']);
};


//exports
(function() {
  var proto = anychart.core.gauge.pointers.Marker.prototype;
  proto['size'] = proto.size;
  proto['position'] = proto.position;
  proto['radius'] = proto.radius;
  proto['type'] = proto.type;
})();
