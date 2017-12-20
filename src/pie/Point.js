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


/**
 * Getter/setter for select point state.
 * @param {boolean=} opt_value Select state to set.
 * @return {(boolean|anychart.core.Point)} Select state of self for chaining.
 * @deprecated since 8.1.0 use selected() instead. DVF-3404
 */
anychart.pieModule.Point.prototype.exploded = function(opt_value) {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null, ['exploded()', 'selected()'], true);
  return this.selected(opt_value);
};


//exports
/**
 * @suppress {deprecated}
 */
(function() {
  var proto = anychart.pieModule.Point.prototype;
  proto['getStartAngle'] = proto.getStartAngle;
  proto['getEndAngle'] = proto.getEndAngle;
  proto['hovered'] = proto.hovered;
  proto['selected'] = proto.selected; //deprecated
  proto['exploded'] = proto.exploded;
})();
