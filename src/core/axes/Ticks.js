goog.provide('anychart.core.axes.Ticks');
goog.require('acgraph');
goog.require('anychart.color');
goog.require('anychart.core.VisualBase');
goog.require('anychart.enums');
goog.require('anychart.utils');



/**
 * Axis ticks class.<br/>
 * You can change position, length and line features.
 * @constructor
 * @extends {anychart.core.VisualBase}
 */
anychart.core.axes.Ticks = function() {
  anychart.core.axes.Ticks.base(this, 'constructor');

  /**
   * Ticks length.
   * @type {number}
   * @private
   */
  this.length_;

  /**
   * Ticks stroke.
   * @type {acgraph.vector.Stroke|string}
   * @private
   */
  this.stroke_;

  /**
   * Ticks position.
   * @type {anychart.enums.SidePosition}
   * @private
   */
  this.position_;

  /**
   * Ticks enabled.
   * @type {anychart.enums.Orientation}
   * @private
   */
  this.orientation_;

  /**
   * Path with ticks.
   * @type {!acgraph.vector.Path}
   * @protected
   */
  this.path = acgraph.path();
  this.bindHandlersToGraphics(this.path);
  this.registerDisposable(this.path);
};
goog.inherits(anychart.core.axes.Ticks, anychart.core.VisualBase);


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.axes.Ticks.prototype.SUPPORTED_SIGNALS = anychart.core.VisualBase.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.axes.Ticks.prototype.SUPPORTED_CONSISTENCY_STATES = anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES; // ENABLED CONTAINER Z_INDEX


//----------------------------------------------------------------------------------------------------------------------
//
//  Properties.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for length.
 * @param {(number|string)=} opt_value .
 * @return {(number|!anychart.core.axes.Ticks)} .
 */
anychart.core.axes.Ticks.prototype.length = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.toNumber(opt_value);
    if (this.length_ != opt_value) {
      this.length_ = opt_value;
      this.dispatchSignal(anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else
    return this.length_;
};


/**
 * Getter/setter for stroke.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {!(anychart.core.axes.Ticks|acgraph.vector.Stroke)} .
 */
anychart.core.axes.Ticks.prototype.stroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var stroke = acgraph.vector.normalizeStroke.apply(null, arguments);
    if (this.stroke_ != stroke) {
      this.stroke_ = stroke;
      this.dispatchSignal(anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.stroke_;
  }
};


/**
 * Getter/setter for position.
 * @param {(anychart.enums.SidePosition|string)=} opt_value .
 * @return {(anychart.enums.SidePosition|string|!anychart.core.axes.Ticks)} .
 */
anychart.core.axes.Ticks.prototype.position = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.position_ = anychart.enums.normalizeSidePosition(opt_value);
    this.dispatchSignal(anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    return this;
  } else
    return this.position_;
};


/**
 * Internal use.
 * Change orientation and set drawer to null.
 * @param {(string|anychart.enums.Orientation)=} opt_value Orientation.
 * @return {anychart.core.axes.Ticks|anychart.enums.Orientation} Orientation or self for chaining.
 */
anychart.core.axes.Ticks.prototype.orientation = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeOrientation(opt_value);
    if (this.orientation_ != opt_value) {
      this.orientation_ = opt_value;
      this.drawer_ = null;
      //TODO:blackart do we need to dispatch anything when orientation is changed?
    }
    return this;
  } else {
    return this.orientation_;
  }
};


/** @inheritDoc */
anychart.core.axes.Ticks.prototype.remove = function() {
  if (this.path) this.path.parent(null);
};


/**
 * Renders ticks.
 * @return {!anychart.core.axes.Ticks} {@link anychart.core.axes.Ticks} instance for method chaining.
 */
anychart.core.axes.Ticks.prototype.draw = function() {
  this.path.clear();
  this.path.stroke(this.stroke_);

  if (!this.checkDrawingNeeded())
    return this;

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    this.path.zIndex(/** @type {number} */ (this.zIndex()));
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    this.path.parent(/** @type {acgraph.vector.ILayer} */ (this.container()));
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  return this;
};


/**
 * Get drawer depends on orientation
 * @return {Function}
 */
anychart.core.axes.Ticks.prototype.getTicksDrawer = function() {
  if (!this.drawer_) {
    switch (this.orientation_) {
      case anychart.enums.Orientation.TOP:
        this.drawer_ = this.drawTopTick;
        break;
      case anychart.enums.Orientation.RIGHT:
        this.drawer_ = this.drawRightTick;
        break;
      case anychart.enums.Orientation.BOTTOM:
        this.drawer_ = this.drawBottomTick;
        break;
      case anychart.enums.Orientation.LEFT:
        this.drawer_ = this.drawLeftTick;
        break;
    }
  }
  return this.drawer_;
};


/**
 * Axis ticks drawer for top orientation.
 * @param {number} ratio Scale ratio.
 * @param {anychart.math.Rect} bounds Axis bounds.
 * @param {anychart.math.Rect} lineBounds Axis line bounds.
 * @param {number} lineThickness Axis line thickness.
 * @param {number} pixelShift Pixel shift for a crisp display.
 * @protected
 */
anychart.core.axes.Ticks.prototype.drawTopTick = function(ratio, bounds, lineBounds, lineThickness, pixelShift) {
  /** @type {number} */
  var x = Math.round(bounds.left + ratio * bounds.width);
  /** @type {number} */
  var y = lineBounds.top;
  /** @type {number} */
  var dy;

  if (ratio == 1) x += pixelShift;
  else x -= pixelShift;

  if (this.position_ == anychart.enums.SidePosition.OUTSIDE) {
    y -= lineThickness / 2;
    dy = /** @type {number} */(-this.length_);
  } else if (this.position_ == anychart.enums.SidePosition.CENTER) {
    y = lineBounds.top + lineBounds.height / 2 - this.length_ / 2;
    dy = /** @type {number} */(this.length_);
  } else {
    y += lineThickness / 2;
    dy = /** @type {number} */(this.length_);
  }

  this.path.moveTo(x, y);
  this.path.lineTo(x, y + dy);
};


/**
 * Axis ticks drawer for right orientation.
 * @param {number} ratio Scale ratio.
 * @param {anychart.math.Rect} bounds Axis bounds.
 * @param {anychart.math.Rect} lineBounds Axis line bounds.
 * @param {number} lineThickness Axis line thickness.
 * @param {number} pixelShift Pixel shift for a crisp display.
 * @protected
 */
anychart.core.axes.Ticks.prototype.drawRightTick = function(ratio, bounds, lineBounds, lineThickness, pixelShift) {
  /** @type {number} */
  var x = lineBounds.left;
  /** @type {number} */
  var y = Math.round(bounds.top + bounds.height - ratio * bounds.height);
  /** @type {number} */
  var dx;

  if (ratio == 1) y -= pixelShift;
  else y += pixelShift;

  if (this.position_ == anychart.enums.SidePosition.OUTSIDE) {
    x += lineThickness / 2;
    dx = /** @type {number} */(this.length_);
  } else if (this.position_ == anychart.enums.SidePosition.CENTER) {
    x -= this.length_ / 2;
    dx = /** @type {number} */(this.length_);
  } else {
    x -= lineThickness / 2;
    dx = /** @type {number} */(-this.length_);
  }

  this.path.moveTo(x, y);
  this.path.lineTo(x + dx, y);
};


/**
 * Axis ticks drawer for bottom orientation.
 * @param {number} ratio Scale ratio.
 * @param {anychart.math.Rect} bounds Axis bounds.
 * @param {anychart.math.Rect} lineBounds Axis line bounds.
 * @param {number} lineThickness Axis line thickness.
 * @param {number} pixelShift Pixel shift for a crisp display.
 * @protected
 */
anychart.core.axes.Ticks.prototype.drawBottomTick = function(ratio, bounds, lineBounds, lineThickness, pixelShift) {
  /** @type {number} */
  var x = Math.round(bounds.left + ratio * (bounds.width));
  /** @type {number} */
  var y = lineBounds.top;
  /** @type {number} */
  var dy;

  if (ratio == 1) x += pixelShift;
  else x -= pixelShift;

  if (this.position_ == anychart.enums.SidePosition.OUTSIDE) {
    y += lineThickness / 2;
    dy = /** @type {number} */(this.length_);
  } else if (this.position_ == anychart.enums.SidePosition.CENTER) {
    y -= this.length_ / 2;
    dy = /** @type {number} */(this.length_);
  } else {
    y -= lineThickness / 2;
    dy = /** @type {number} */(-this.length_);
  }

  this.path.moveTo(x, y);
  this.path.lineTo(x, y + dy);
};


/**
 * Axis ticks drawer for left orientation.
 * @param {number} ratio Scale ratio.
 * @param {anychart.math.Rect} bounds Axis bounds.
 * @param {anychart.math.Rect} lineBounds Axis line bounds.
 * @param {number} lineThickness Axis line thickness.
 * @param {number} pixelShift Pixel shift for a crisp display.
 * @protected
 */
anychart.core.axes.Ticks.prototype.drawLeftTick = function(ratio, bounds, lineBounds, lineThickness, pixelShift) {
  /** @type {number} */
  var x = lineBounds.left;
  /** @type {number} */
  var y = Math.round(bounds.top + bounds.height - ratio * (bounds.height));
  /** @type {number} */
  var dx;

  if (ratio == 1) y -= pixelShift;
  else y += pixelShift;

  if (this.position_ == anychart.enums.SidePosition.OUTSIDE) {
    x -= lineThickness / 2;
    dx = /** @type {number} */(-this.length_);
  } else if (this.position_ == anychart.enums.SidePosition.CENTER) {
    x -= this.length_ / 2;
    dx = /** @type {number} */(this.length_);
  } else {
    x += lineThickness / 2;
    dx = /** @type {number} */(this.length_);
  }

  this.path.moveTo(x, y);
  this.path.lineTo(x + dx, y);
};


/** @inheritDoc */
anychart.core.axes.Ticks.prototype.serialize = function() {
  var json = anychart.core.axes.Ticks.base(this, 'serialize');
  json['stroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke} */(this.stroke()));
  json['length'] = this.length();
  json['position'] = this.position();
  return json;
};


/** @inheritDoc */
anychart.core.axes.Ticks.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.axes.Ticks.base(this, 'setupByJSON', config, opt_default);
  this.length(config['length']);
  this.stroke(config['stroke']);
  this.position(config['position']);
};


//exports
(function() {
  var proto = anychart.core.axes.Ticks.prototype;
  proto['length'] = proto.length;//in docs/
  proto['stroke'] = proto.stroke;//in docs/
  proto['position'] = proto.position;//in docs/
})();
