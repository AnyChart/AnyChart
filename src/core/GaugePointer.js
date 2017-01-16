goog.provide('anychart.core.GaugePointer');
goog.require('anychart.core.Point');



/**
 * Class that wraps pointer of the gauge.
 * @param {anychart.charts.LinearGauge} chart Linear gauge.
 * @param {number} index Pointer index.
 * @constructor
 * @extends {anychart.core.Point}
 */
anychart.core.GaugePointer = function(chart, index) {
  anychart.core.GaugePointer.base(this, 'constructor', chart, index);
};
goog.inherits(anychart.core.GaugePointer, anychart.core.Point);


/** @inheritDoc */
anychart.core.GaugePointer.prototype.hovered = function(opt_value) {
  var pointer = /** @type {anychart.core.linearGauge.pointers.Base} */ (this.getChart().getPointerByAutoIndex(this.index));
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
anychart.core.GaugePointer.prototype.selected = function(opt_value) {
  var pointer = /** @type {anychart.core.linearGauge.pointers.Base} */ (this.getChart().getPointerByAutoIndex(this.index));
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
  var proto = anychart.core.GaugePointer.prototype;
  proto['hovered'] = proto.hovered;
  proto['selected'] = proto.selected;
})();
