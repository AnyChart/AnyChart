goog.provide('anychart.timelineModule.AxisTicks');

goog.require('anychart.core.VisualBase');



/**
 * Timeline axis ticks.
 * @constructor
 * @extends {anychart.core.VisualBase}
 */
anychart.timelineModule.AxisTicks = function() {
  anychart.timelineModule.AxisTicks.base(this, 'constructor');

  /**
   * Ticks path.
   * @type {?acgraph.vector.Path}
   */
  this.path = acgraph.path();

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['stroke', 0, anychart.Signal.NEEDS_REDRAW]
  ]);
};
goog.inherits(anychart.timelineModule.AxisTicks, anychart.core.VisualBase);


/**
 *
 * @type {!Object<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.timelineModule.AxisTicks.PROPERTY_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  var d = anychart.core.settings.descriptors;
  anychart.core.settings.createDescriptors(map, [
    d.STROKE
  ]);
  return map;
})();
anychart.core.settings.populate(anychart.timelineModule.AxisTicks, anychart.timelineModule.AxisTicks.PROPERTY_DESCRIPTORS);


/**
 *
 * @return {anychart.timelineModule.AxisTicks}
 */
anychart.timelineModule.AxisTicks.prototype.draw = function() {
  this.path.clear();
  this.path.stroke(/** @type {acgraph.vector.Stroke} */(this.getOption('stroke')));

  if (!this.checkDrawingNeeded())
    return this;

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    this.path.zIndex(/** @type {number} */(this.zIndex()));
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    this.path.parent(/** @type {acgraph.vector.ILayer} */(this.container()));
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  return this;
};


/**
 * Draws tick with given ration in given bounds.
 * @param {number} ratio in between 0 and 1
 * @param {anychart.math.Rect} bounds
 */
anychart.timelineModule.AxisTicks.prototype.drawTick = function(ratio, bounds) {
  if (bounds.height != 0) {
    var thickness = anychart.utils.extractThickness(/** @type {acgraph.vector.Stroke} */(this.getOption('stroke')));
    var x = anychart.utils.applyPixelShift(bounds.left + ratio * bounds.width, thickness);
    var top = Math.floor(anychart.utils.applyPixelShift(bounds.top, 1));
    var bottom = Math.ceil(anychart.utils.applyPixelShift(bounds.getBottom(), 1));
    this.path.moveTo(x, bottom).lineTo(x, top);
  }
};


/** @inheritDoc */
anychart.timelineModule.AxisTicks.prototype.remove = function() {
  if (this.path) this.path.parent(null);
};


/** @inheritDoc */
anychart.timelineModule.AxisTicks.prototype.disposeInternal = function() {
  goog.disposeAll(this.path);
  this.path = null;
  anychart.timelineModule.AxisTicks.base(this, 'disposeInternal');
};
