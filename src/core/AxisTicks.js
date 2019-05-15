goog.provide('anychart.core.AxisTicks');
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
anychart.core.AxisTicks = function() {
  anychart.core.AxisTicks.base(this, 'constructor');

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['stroke', 0, anychart.Signal.NEEDS_REDRAW],
    ['length', 0, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['position', 0, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED]
  ]);

  /**
   * Ticks enabled.
   * @type {anychart.enums.Orientation}
   * @private
   */
  this.orientation_;

  /**
   * Path with ticks.
   * @type {acgraph.vector.Path}
   * @protected
   */
  this.path = acgraph.path();
  this.bindHandlersToGraphics(this.path);
};
goog.inherits(anychart.core.AxisTicks, anychart.core.VisualBase);


//region --- States and Signals


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.AxisTicks.prototype.SUPPORTED_SIGNALS = anychart.core.VisualBase.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.AxisTicks.prototype.SUPPORTED_CONSISTENCY_STATES = anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES; // ENABLED CONTAINER Z_INDEX


//endregion
//region --- Descriptors
/**
 * Simple descriptors.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.AxisTicks.prototype.SIMPLE_PROPS_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'stroke', anychart.core.settings.strokeNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'length', anychart.utils.normalizeNumberOrPercent],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'position', anychart.enums.normalizeSidePosition]
  ]);

  return map;
})();
anychart.core.settings.populate(anychart.core.AxisTicks, anychart.core.AxisTicks.prototype.SIMPLE_PROPS_DESCRIPTORS);


//endregion
//region --- Internal API
/**
 * Internal use.
 * Change orientation and set drawer to null.
 * @param {(string|anychart.enums.Orientation)=} opt_value Orientation.
 * @return {anychart.core.AxisTicks|anychart.enums.Orientation} Orientation or self for chaining.
 */
anychart.core.AxisTicks.prototype.orientation = function(opt_value) {
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


//endregion
//region --- Drawing
/** @inheritDoc */
anychart.core.AxisTicks.prototype.remove = function() {
  if (this.path) this.path.parent(null);
};


/**
 * Renders ticks.
 * @return {!anychart.core.AxisTicks} {@link anychart.core.AxisTicks} instance for method chaining.
 */
anychart.core.AxisTicks.prototype.draw = function() {
  this.path.clear();
  this.path.stroke(/** @type {acgraph.vector.Stroke} */(this.getOption('stroke')));

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


//endregion
//region --- Drawers
/**
 * Get drawer depends on orientation
 * @return {Function}
 */
anychart.core.AxisTicks.prototype.getTicksDrawer = function() {
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
anychart.core.AxisTicks.prototype.drawTopTick = function(ratio, bounds, lineBounds, lineThickness, pixelShift) {
  /** @type {number} */
  var x = bounds.left + ratio * bounds.width;
  /** @type {number} */
  var y = lineBounds.top;
  /** @type {number} */
  var dy;

  x = anychart.utils.applyPixelShift(x, /** @type {number} */(this.path.strokeThickness()));

  var position = /** @type {anychart.enums.SidePosition} */(this.getOption('position'));
  var length = /** @type {number} */(this.getOption('length'));

  if (position == anychart.enums.SidePosition.OUTSIDE) {
    y -= lineThickness / 2;
    dy = /** @type {number} */(-length);
  } else if (position == anychart.enums.SidePosition.CENTER) {
    y += (lineBounds.height - length) / 2;
    dy = /** @type {number} */(length);
  } else {
    y += lineThickness / 2;
    dy = /** @type {number} */(length);
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
anychart.core.AxisTicks.prototype.drawRightTick = function(ratio, bounds, lineBounds, lineThickness, pixelShift) {
  /** @type {number} */
  var x = lineBounds.left;
  /** @type {number} */
  var y = bounds.top + bounds.height - ratio * bounds.height;
  /** @type {number} */
  var dx;

  y = anychart.utils.applyPixelShift(y, /** @type {number} */(this.path.strokeThickness()));

  var position = /** @type {anychart.enums.SidePosition} */(this.getOption('position'));
  var length = /** @type {number} */(this.getOption('length'));

  if (position == anychart.enums.SidePosition.OUTSIDE) {
    x += lineThickness / 2;
    dx = /** @type {number} */(length);
  } else if (position == anychart.enums.SidePosition.CENTER) {
    x -= length / 2;
    dx = /** @type {number} */(length);
  } else {
    x -= lineThickness / 2;
    dx = /** @type {number} */(-length);
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
anychart.core.AxisTicks.prototype.drawBottomTick = function(ratio, bounds, lineBounds, lineThickness, pixelShift) {
  /** @type {number} */
  var x = bounds.left + ratio * (bounds.width);
  /** @type {number} */
  var y = lineBounds.top;
  /** @type {number} */
  var dy;
  x = anychart.utils.applyPixelShift(x, /** @type {number} */(this.path.strokeThickness()));

  var position = /** @type {anychart.enums.SidePosition} */(this.getOption('position'));
  var length = /** @type {number} */(this.getOption('length'));

  if (position == anychart.enums.SidePosition.OUTSIDE) {
    y += lineThickness / 2;
    dy = /** @type {number} */(length);
  } else if (position == anychart.enums.SidePosition.CENTER) {
    y -= length / 2;
    dy = /** @type {number} */(length);
  } else {
    y -= lineThickness / 2;
    dy = /** @type {number} */(-length);
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
anychart.core.AxisTicks.prototype.drawLeftTick = function(ratio, bounds, lineBounds, lineThickness, pixelShift) {
  /** @type {number} */
  var x = lineBounds.left;
  /** @type {number} */
  var y = bounds.top + bounds.height - ratio * bounds.height;
  /** @type {number} */
  var dx;

  y = anychart.utils.applyPixelShift(y, /** @type {number} */(this.path.strokeThickness()));

  var position = /** @type {anychart.enums.SidePosition} */(this.getOption('position'));
  var length = /** @type {number} */(this.getOption('length'));

  if (position == anychart.enums.SidePosition.OUTSIDE) {
    x -= lineThickness / 2;
    dx = /** @type {number} */(-length);
  } else if (position == anychart.enums.SidePosition.CENTER) {
    x -= length / 2;
    dx = /** @type {number} */(length);
  } else {
    x += lineThickness / 2;
    dx = /** @type {number} */(length);
  }

  this.path.moveTo(x, y);
  this.path.lineTo(x + dx, y);
};


//endregion
//region --- Setup and Serialize
/** @inheritDoc */
anychart.core.AxisTicks.prototype.serialize = function() {
  var json = anychart.core.AxisTicks.base(this, 'serialize');
  anychart.core.settings.serialize(this, this.SIMPLE_PROPS_DESCRIPTORS, json, 'AxisTicks');
  return json;
};


/** @inheritDoc */
anychart.core.AxisTicks.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.AxisTicks.base(this, 'setupByJSON', config, opt_default);
  anychart.core.settings.deserialize(this, this.SIMPLE_PROPS_DESCRIPTORS, config, opt_default);
};


/** @inheritDoc */
anychart.core.AxisTicks.prototype.disposeInternal = function() {
  goog.dispose(this.path);
  this.path = null;
  anychart.core.AxisTicks.base(this, 'disposeInternal');
};


//endregion
//region --- Export
//exports
// (function() {
//   var proto = anychart.core.AxisTicks.prototype;
  // proto['length'] = proto.length;
  // proto['stroke'] = proto.stroke;
  // proto['position'] = proto.position;
// })();
//endregion
