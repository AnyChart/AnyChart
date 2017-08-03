goog.provide('anychart.pieModule.Point');
goog.require('anychart.core.Point');



/**
 * Point representing pie point.
 * @param {anychart.pieModule.Chart} chart Pie chart.
 * @param {number} index Point index in chart.
 * @constructor
 * @extends {anychart.core.Point}
 */
anychart.pieModule.Point = function(chart, index) {
  anychart.pieModule.Point.base(this, 'constructor', chart, index);
};
goog.inherits(anychart.pieModule.Point, anychart.core.Point);


/**
 * Gets start angle of the point.
 * @return {number}
 */
anychart.pieModule.Point.prototype.getStartAngle = function() {
  return /** @type {number} */ (this.chart.data().meta(this.index, 'start'));
};


/**
 * Gets end angle of the point.
 * @return {number}
 */
anychart.pieModule.Point.prototype.getEndAngle = function() {
  var data = this.chart.data();
  var start = data.meta(this.index, 'start');
  var sweep = data.meta(this.index, 'sweep');
  return /** @type {number} */ (start + sweep);
};


/** @inheritDoc */
anychart.pieModule.Point.prototype.selected = function(opt_value) {
  //TODO(AntonKagakin): pie chart cant select points in the new interactivity model
  if (goog.isDef(opt_value)) {
    this.getChart().explodeSlice(this.index, !!opt_value);
    return this;
  } else
    return /** @type {boolean} */ (this.chart.data().meta(this.index, 'exploded'));
};


/**
 * Alias-method
 */
anychart.pieModule.Point.prototype.exploded = anychart.pieModule.Point.prototype.selected;


//exports
(function() {
  var proto = anychart.pieModule.Point.prototype;
  proto['getStartAngle'] = proto.getStartAngle;
  proto['getEndAngle'] = proto.getEndAngle;
  proto['hovered'] = proto.hovered;
  proto['selected'] = proto.selected;
  proto['exploded'] = proto.exploded;
})();
