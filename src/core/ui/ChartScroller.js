goog.provide('anychart.core.ui.ChartScroller');
goog.require('anychart.core.ui.Scroller');
goog.require('anychart.enums');



/**
 * Chart scroller class that also exposes position method that is used by chart.
 * @constructor
 * @extends {anychart.core.ui.Scroller}
 */
anychart.core.ui.ChartScroller = function() {
  anychart.core.ui.ChartScroller.base(this, 'constructor', true);

  /**
   * Position.
   * @type {anychart.enums.ChartScrollerPosition}
   * @private
   */
  this.position_ = anychart.enums.ChartScrollerPosition.AFTER_AXES;
};
goog.inherits(anychart.core.ui.ChartScroller, anychart.core.ui.Scroller);


/**
 * Position getter/setter.
 * @param {anychart.enums.ChartScrollerPosition=} opt_value
 * @return {anychart.enums.ChartScrollerPosition|anychart.core.ui.ChartScroller}
 */
anychart.core.ui.ChartScroller.prototype.position = function(opt_value) {
  if (goog.isDef(opt_value)) {
    /** @type {anychart.enums.ChartScrollerPosition} */
    var value = anychart.enums.normalizeChartScrollerPosition(opt_value);
    if (value != this.position_) {
      this.position_ = value;
      this.invalidate(anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.APPEARANCE,
          anychart.Signal.BOUNDS_CHANGED | anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.position_;
};


/** @inheritDoc */
anychart.core.ui.ChartScroller.prototype.serialize = function() {
  var json = anychart.core.ui.ChartScroller.base(this, 'serialize');
  json['position'] = this.position();
  json['inverted'] = this.inverted();
  return json;
};


/** @inheritDoc */
anychart.core.ui.ChartScroller.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.ui.ChartScroller.base(this, 'setupByJSON', config, opt_default);
  this.position(config['position']);
  this.inverted(config['inverted']);
};


//exports
(function() {
  var proto = anychart.core.ui.ChartScroller.prototype;
  proto['position'] = proto.position;
  proto['inverted'] = proto.inverted;
})();
