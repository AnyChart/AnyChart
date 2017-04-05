goog.provide('anychart.core.series.Radar');
goog.require('anychart.core.drawers.Area');
goog.require('anychart.core.drawers.Line');
goog.require('anychart.core.drawers.Marker');
goog.require('anychart.core.series.Cartesian');
goog.require('anychart.math');
goog.require('anychart.utils');



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
anychart.core.series.Radar.prototype.hasComplexZero = function() {
  return !!this.innerRadius || this.planIsStacked();
};


/** @inheritDoc */
anychart.core.series.Radar.prototype.getDirectionAngle = function(positive) {
  var startAngle = /** @type {number} */(this.getOption('startAngle'));
  var x = /** @type {number} */(this.getIterator().meta('xRatio'));
  var angle = startAngle - 90 + 360 * x;
  if (!positive)
    angle += 180;
  return angle;
};


/** @inheritDoc */
anychart.core.series.Radar.prototype.checkDirectionIsPositive = function(position) {
  var result;
  var inverted = /** @type {boolean} */(this.yScale().inverted());
  if (position == 'low' || position == 'lowest')
    result = inverted;
  else if (position == 'high' || position == 'highest')
    result = !inverted;
  else
    result = true;
  return result;
};


/** @inheritDoc */
anychart.core.series.Radar.prototype.checkBoundsCollision = function(factory, label) {
  var bounds = factory.measure(label);
  var anchor = /** @type {anychart.enums.Anchor} */(label.autoAnchor());
  var flipped = anychart.utils.flipAnchor(anchor);
  var farPoint = anychart.utils.getCoordinateByAnchor(bounds, flipped);
  var x = farPoint['x'];
  var y = farPoint['y'];
  var distance = (x - this.cx) * (x - this.cx) + (y - this.cy) * (y - this.cy);
  if (distance > this.radius * this.radius)
    label.autoAnchor(flipped);
};


/**
 * Calculates position on the line.
 * @param {anychart.enums.Anchor} anchor
 * @param {number} topX
 * @param {number} top
 * @param {number} bottomX
 * @param {number} bottom
 * @return {Object}
 * @protected
 */
anychart.core.series.Radar.prototype.calcPositionByLine = function(anchor, topX, top, bottomX, bottom) {
  var x, y;
  switch (anchor) {
    case anychart.enums.Anchor.LEFT_CENTER:
    case anychart.enums.Anchor.CENTER:
    case anychart.enums.Anchor.RIGHT_CENTER:
      x = (topX + bottomX) / 2;
      y = (top + bottom) / 2;
      break;
    case anychart.enums.Anchor.LEFT_BOTTOM:
    case anychart.enums.Anchor.CENTER_BOTTOM:
    case anychart.enums.Anchor.RIGHT_BOTTOM:
      x = bottomX;
      y = bottom;
      break;
    default:
      x = topX;
      y = top;
      break;
  }
  return {'x': x, 'y': y};
};


/** @inheritDoc */
anychart.core.series.Radar.prototype.createPositionProviderByGeometry = function(anchor) {
  var iterator = this.getIterator();
  var top = /** @type {number} */(iterator.meta(this.config.anchoredPositionTop));
  var topX = /** @type {number} */(iterator.meta(this.config.anchoredPositionTop + 'X'));
  var bottom = /** @type {number} */(iterator.meta(this.config.anchoredPositionBottom));
  var bottomX = /** @type {number} */(iterator.meta(this.config.anchoredPositionBottom + 'X'));
  return this.calcPositionByLine(anchor, topX, top, bottomX, bottom);
};


/** @inheritDoc */
anychart.core.series.Radar.prototype.createPositionProviderByData = function(position) {
  var iterator = this.getIterator();
  var val = iterator.meta(position);
  var x = iterator.meta(position + 'X');
  var point;
  if (!goog.isDef(val) || !goog.isDef(x)) {
    x = iterator.meta('x');
    val = iterator.get(position);
    if (goog.isDef(val)) {
      if (this.planIsStacked()) {
        val += iterator.meta('stackedZero');
      }
      point = this.transformXY(x, val);
    } else {
      x = val = NaN;
    }
  }
  if (!point)
    point = {'x': x, 'y': val};
  return point;
};


/** @inheritDoc */
anychart.core.series.Radar.prototype.prepareAdditional = function() {
  var bounds = this.pixelBoundsCache;
  var chart = (/** @type {anychart.core.RadarPolarChart} */(this.chart));
  this.radius = Math.min(bounds.width, bounds.height) / 2;
  this.innerRadius = anychart.utils.normalizeSize(/** @type {number|string} */(chart.innerRadius()), this.radius);
  this.cx = Math.round(bounds.left + bounds.width / 2);
  this.cy = Math.round(bounds.top + bounds.height / 2);
  anychart.core.series.Radar.base(this, 'prepareAdditional');
};


/** @inheritDoc */
anychart.core.series.Radar.prototype.prepareMetaMakers = function() {
  anychart.core.series.Radar.base(this, 'prepareMetaMakers');
  if (this.needsZero() && !this.innerRadius) {
    var zero = this.ratiosToPixelPairs(0, [0]);
    this.zeroX = zero[0];
    this.zeroY = zero[1];
  }
};


/** @inheritDoc */
anychart.core.series.Radar.prototype.makeMissing = function(rowInfo, yNames, xRatio) {
  anychart.core.series.Radar.base(this, 'makeMissing', rowInfo, yNames, NaN);
};


/** @inheritDoc */
anychart.core.series.Radar.prototype.makeZeroMeta = function(rowInfo, yNames, yColumns, pointMissing, xRatio) {
  if (this.innerRadius) {
    var zero = this.ratiosToPixelPairs(xRatio, [this.zeroYRatio]);
    rowInfo.meta('zeroX', zero[0]);
    rowInfo.meta('zero', zero[1]);
  } else {
    rowInfo.meta('zeroX', this.zeroX);
    rowInfo.meta('zero', this.zeroY);
  }
  rowInfo.meta('zeroMissing', false);
  return pointMissing;
};


/** @inheritDoc */
anychart.core.series.Radar.prototype.makePointsMetaFromMap = function(rowInfo, map, xRatio) {
  anychart.core.series.Radar.base(this, 'makePointsMetaFromMap', rowInfo, map, xRatio);
  for (var i in map) {
    rowInfo.meta(i + 'Ratio', map[i]);
  }
};


/** @inheritDoc */
anychart.core.series.Radar.prototype.ratiosToPixelPairs = function(x, ys) {
  var result = [];
  var startAngle = /** @type {number} */(this.getOption('startAngle'));
  for (var i = 0; i < ys.length; i++) {
    var y = ys[i];
    var angle = anychart.math.round(goog.math.toRadians(goog.math.modulo(startAngle - 90 + 360 * x, 360)), 4);
    var radius = this.innerRadius + (this.radius - this.innerRadius) * y;
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
