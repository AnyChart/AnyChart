goog.provide('anychart.linearGaugeModule.Point');
goog.require('anychart.core.Point');



/**
 * Class that wraps pointer of the gauge.
 * @param {anychart.linearGaugeModule.Chart} chart Linear gauge.
 * @param {number} index Pointer index.
 * @constructor
 * @extends {anychart.core.Point}
 */
anychart.linearGaugeModule.Point = function(chart, index) {
  anychart.linearGaugeModule.Point.base(this, 'constructor', chart, index);
};
goog.inherits(anychart.linearGaugeModule.Point, anychart.core.Point);


/** @inheritDoc */
anychart.linearGaugeModule.Point.prototype.hovered = function(opt_value) {
  var pointer = /** @type {anychart.linearGaugeModule.pointers.Base} */ (this.getChart().getPointerByAutoIndex(this.index));
  var state = pointer.state.hasPointStateByPointIndex(anychart.PointState.HOVER, 0);
  if (goog.isDef(opt_value)) {
    if (state != opt_value) {
      if (opt_value)
        pointer.hoverPoint();
      else
        pointer.unhover();
      return this;
    }
  }
  return state;
};


/** @inheritDoc */
anychart.linearGaugeModule.Point.prototype.selected = function(opt_value) {
  var pointer = /** @type {anychart.linearGaugeModule.pointers.Base} */ (this.getChart().getPointerByAutoIndex(this.index));
  var state = pointer.state.hasPointStateByPointIndex(anychart.PointState.SELECT, 0);
  if (goog.isDef(opt_value)) {
    if (state != opt_value) {
      if (opt_value)
        pointer.selectPoint();
      else
        pointer.unselect();
      return this;
    }
  }
  return state;
};


//exports
(function() {
  var proto = anychart.linearGaugeModule.Point.prototype;
  proto['hovered'] = proto.hovered;
  proto['selected'] = proto.selected;
})();
