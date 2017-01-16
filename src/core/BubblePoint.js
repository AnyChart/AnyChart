goog.provide('anychart.core.BubblePoint');
goog.require('anychart.core.SeriesPoint');



/**
 * Point representing bubble points that belongs to cartesian or scatter chart.
 * @param {anychart.core.SeriesBase|anychart.core.series.Cartesian} series Series.
 * @param {number} index Point index in series.
 * @constructor
 * @extends {anychart.core.SeriesPoint}
 */
anychart.core.BubblePoint = function(series, index) {
  anychart.core.BubblePoint.base(this, 'constructor', series, index);
};
goog.inherits(anychart.core.BubblePoint, anychart.core.SeriesPoint);


/**
 * Getter for bubble point radius.
 * @return {number} Radius in pixels.
 */
anychart.core.BubblePoint.prototype.getPixelRadius = function() {
  if (this.series.getBubblePixelRadius) {
    return Math.abs(this.series.getBubblePixelRadius(this.index));
  }
  return /** @type {number} */ (Math.abs(this.series.data().meta(this.index, 'size')));
};


//exports
(function() {
  var proto = anychart.core.BubblePoint.prototype;
  proto['getPixelRadius'] = proto.getPixelRadius;
})();
