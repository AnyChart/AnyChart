goog.provide('anychart.core.series.Radar');
goog.require('anychart.core.drawers.Area');
goog.require('anychart.core.drawers.Line');
goog.require('anychart.core.drawers.Marker');
goog.require('anychart.core.series.Cartesian');
goog.require('anychart.math');



/**
 * Class that represents a radar series for the user.
 * @param {!anychart.core.IChart} chart
 * @param {!anychart.core.IPlot} plot
 * @param {string} type
 * @param {anychart.core.series.TypeConfig} config
 * @param {boolean} sortedMode
 * @constructor
 * @extends {anychart.core.series.Cartesian}
 */
anychart.core.series.Radar = function(chart, plot, type, config, sortedMode) {
  anychart.core.series.Radar.base(this, 'constructor', chart, plot, type, config, sortedMode);
};
goog.inherits(anychart.core.series.Radar, anychart.core.series.Cartesian);


/**
 * @type {number}
 */
anychart.core.series.Radar.prototype.radius;


/**
 * @type {number}
 */
anychart.core.series.Radar.prototype.cx;


/**
 * @type {number}
 */
anychart.core.series.Radar.prototype.cy;


/** @inheritDoc */
anychart.core.series.Radar.prototype.startDrawing = function() {
  var bounds = this.pixelBoundsCache;
  this.radius = Math.min(bounds.width, bounds.height) / 2;
  this.cx = Math.round(bounds.left + bounds.width / 2);
  this.cy = Math.round(bounds.top + bounds.height / 2);
  if (this.needsZero()) {
    var zero = this.ratiosToPixelPairs(0, [0]);
    this.zeroX = zero[0];
    this.zeroY = zero[1];
  }
  anychart.core.series.Radar.base(this, 'startDrawing');
};


/** @inheritDoc */
anychart.core.series.Radar.prototype.makeMissing = function(rowInfo, yNames, xRatio) {
  anychart.core.series.Radar.base(this, 'makeMissing', rowInfo, yNames, NaN);
};


/** @inheritDoc */
anychart.core.series.Radar.prototype.makeZeroMeta = function(rowInfo, yNames, yColumns, pointMissing, xRatio) {
  /* other interesting behavior
  var zero = this.ratiosToPixelPairs(xRatio, [this.zeroYRatio]);
  rowInfo.meta('zeroX', zero[0]);
  rowInfo.meta('zero', zero[1]);
  /*/
  rowInfo.meta('zeroX', this.zeroX);
  rowInfo.meta('zero', this.zeroY);
  //*/
  rowInfo.meta('zeroMissing', false);
  return pointMissing;
};


/** @inheritDoc */
anychart.core.series.Radar.prototype.ratiosToPixelPairs = function(x, ys) {
  var result = [];
  var startAngle = /** @type {number} */(this.getOption('startAngle'));
  for (var i = 0; i < ys.length; i++) {
    var y = ys[i];
    var angle = anychart.math.round(goog.math.toRadians(goog.math.modulo(startAngle - 90 + 360 * x, 360)), 4);
    var radius = this.radius * y;
    result.push(
        this.cx + radius * Math.cos(angle),
        this.cy + radius * Math.sin(angle)
    );
  }
  return result;
};


/** @inheritDoc */
anychart.core.series.Radar.prototype.getXPointPosition = function() {
  return 0;
};


/**
 * Transforms values to pix coords.
 * @param {*} xVal
 * @param {*} yVal
 * @param {number=} opt_xSubRangeRatio
 * @return {Object.<string, number>} Pix values.
 */
anychart.core.series.Radar.prototype.transformXY = function(xVal, yVal, opt_xSubRangeRatio) {
  var xScale = /** @type {anychart.scales.Base} */(this.xScale());
  var yScale = /** @type {anychart.scales.Base} */(this.yScale());
  var points = this.ratiosToPixelPairs(xScale.transform(xVal, opt_xSubRangeRatio || 0), [yScale.transform(yVal, .5)]);
  return {'x': points[0], 'y': points[1]};
};


//exports
(function() {
  var proto = anychart.core.series.Radar.prototype;
  proto['transformXY'] = proto.transformXY;
})();
