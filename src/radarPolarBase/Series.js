goog.provide('anychart.radarPolarBaseModule.Series');
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
anychart.radarPolarBaseModule.Series = function(chart, plot, type, config, sortedMode) {
  anychart.radarPolarBaseModule.Series.base(this, 'constructor', chart, plot, type, config, sortedMode);
};
goog.inherits(anychart.radarPolarBaseModule.Series, anychart.core.series.Cartesian);


/**
 * @type {number}
 */
anychart.radarPolarBaseModule.Series.prototype.radius;


/**
 * @type {number}
 */
anychart.radarPolarBaseModule.Series.prototype.cx;


/**
 * @type {number}
 */
anychart.radarPolarBaseModule.Series.prototype.cy;


/** @inheritDoc */
anychart.radarPolarBaseModule.Series.prototype.hasComplexZero = function() {
  return (this.isDiscreteBased() && !!this.innerRadius) || this.planIsStacked();
};


/** @inheritDoc */
anychart.radarPolarBaseModule.Series.prototype.getDirectionAngle = function(positive) {
  var startAngle = /** @type {number} */(this.getOption('startAngle'));
  var x = /** @type {number} */(this.getIterator().meta('xRatio'));
  var angle = startAngle - 90 + 360 * x;
  if (!positive)
    angle += 180;
  if (this.yScale().inverted())
    angle += 180;
  return goog.math.standardAngle(angle);
};


/** @inheritDoc */
anychart.radarPolarBaseModule.Series.prototype.checkBoundsCollision = function(factory, label) {
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
anychart.radarPolarBaseModule.Series.prototype.calcPositionByLine = function(anchor, topX, top, bottomX, bottom) {
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
anychart.radarPolarBaseModule.Series.prototype.createPositionProviderByGeometry = function(anchor) {
  var iterator = this.getIterator();
  var top = /** @type {number} */(iterator.meta(this.config.anchoredPositionTop));
  var topX = /** @type {number} */(iterator.meta(this.config.anchoredPositionTop + 'X'));
  var bottom = /** @type {number} */(iterator.meta(this.config.anchoredPositionBottom));
  var bottomX = /** @type {number} */(iterator.meta(this.config.anchoredPositionBottom + 'X'));
  return this.calcPositionByLine(anchor, topX, top, bottomX, bottom);
};


/** @inheritDoc */
anychart.radarPolarBaseModule.Series.prototype.createPositionProviderByData = function(position) {
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
anychart.radarPolarBaseModule.Series.prototype.prepareAdditional = function() {
  var bounds = this.pixelBoundsCache;
  var chart = (/** @type {anychart.radarPolarBaseModule.Chart} */(this.chart));
  this.radius = Math.min(bounds.width, bounds.height) / 2;
  this.innerRadius = anychart.utils.normalizeSize(/** @type {number|string} */(chart.getOption('innerRadius')), this.radius);
  this.cx = Math.round(bounds.left + bounds.width / 2);
  this.cy = Math.round(bounds.top + bounds.height / 2);
  anychart.radarPolarBaseModule.Series.base(this, 'prepareAdditional');
};


/** @inheritDoc */
anychart.radarPolarBaseModule.Series.prototype.prepareMetaMakers = function(yNames, yColumns) {
  anychart.radarPolarBaseModule.Series.base(this, 'prepareMetaMakers', yNames, yColumns);
  this.metaMakers.push(this.makeXRatioMeta);
  if (this.needsZero() && !this.innerRadius) {
    var zero = this.ratiosToPixelPairs(0, [0]);
    this.zeroX = zero[0];
    this.zeroY = zero[1];
  }
};


/** @inheritDoc */
anychart.radarPolarBaseModule.Series.prototype.makeMissing = function(rowInfo, yNames, xRatio) {
  anychart.radarPolarBaseModule.Series.base(this, 'makeMissing', rowInfo, yNames, NaN);
};


/** @inheritDoc */
anychart.radarPolarBaseModule.Series.prototype.makeZeroMeta = function(rowInfo, yNames, yColumns, pointMissing, xRatio) {
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


/**
 * Prepares xRatio part of point meta.
 * @param {anychart.data.IRowInfo} rowInfo
 * @param {Array.<string>} yNames
 * @param {Array.<string|number>} yColumns
 * @param {number} pointMissing
 * @param {number} xRatio
 * @return {number} - pointMissing updated value.
 * @protected
 */
anychart.radarPolarBaseModule.Series.prototype.makeXRatioMeta = function(rowInfo, yNames, yColumns, pointMissing, xRatio) {
  rowInfo.meta('xRatio', goog.math.modulo(xRatio, 1));
  return pointMissing;
};


/** @inheritDoc */
anychart.radarPolarBaseModule.Series.prototype.makePointsMetaFromMap = function(rowInfo, map, xRatio) {
  anychart.radarPolarBaseModule.Series.base(this, 'makePointsMetaFromMap', rowInfo, map, xRatio);
  for (var i in map) {
    rowInfo.meta(i + 'Ratio', map[i]);
  }
};


/** @inheritDoc */
anychart.radarPolarBaseModule.Series.prototype.ratiosToPixelPairs = function(x, ys) {
  var result = [];
  var startAngle = /** @type {number} */(this.getOption('startAngle'));
  for (var i = 0; i < ys.length; i++) {
    var y = ys[i];
    var angleDegrees = goog.math.modulo(startAngle - 90 + 360 * x, 360);
    var angle = anychart.math.round(goog.math.toRadians(angleDegrees), 4);

    var xPixelShift = 0;
    angleDegrees = Math.round(angleDegrees);
    if (angleDegrees == 90) {
      xPixelShift = -.5;
    } else if (angleDegrees == 270) {
      xPixelShift = .5;
    }

    var radius = this.innerRadius + (this.radius - this.innerRadius) * y;
    result.push(
        this.cx + radius * Math.cos(angle) + xPixelShift,
        this.cy + radius * Math.sin(angle)
    );
  }
  return result;
};


/** @inheritDoc */
anychart.radarPolarBaseModule.Series.prototype.getXPointPosition = function() {
  return 0;
};


/**
 * Returns if the chart is sorted mode.
 * @return {boolean}
 */
anychart.radarPolarBaseModule.Series.prototype.sortedMode = function() {
  return true;
};


/** @inheritDoc */
anychart.radarPolarBaseModule.Series.prototype.makeBrowserEvent = function(e) {
  //this method is invoked only for events from data layer
  var res = anychart.core.VisualBase.prototype.makeBrowserEvent.call(this, e);
  if (this.isDiscreteBased()) {
    res['pointIndex'] = anychart.utils.toNumber(anychart.utils.extractTag(res['domTarget']).index);
  } else if (this.sortedMode()) {
    var clientX = e['clientX'];
    var clientY = e['clientY'];

    var containerOffset = this.container().getStage().getClientPosition();

    var x = clientX - containerOffset.x;
    var y = clientY - containerOffset.y;

    var cx = Math.round(this.pixelBoundsCache.left + this.pixelBoundsCache.width / 2);
    var cy = Math.round(this.pixelBoundsCache.top + this.pixelBoundsCache.height / 2);

    var dx = x - cx;
    var dy = y - cy;
    var angle = Math.PI / 2 + Math.atan2(dy, -dx) + goog.math.toRadians(/** @type {number} */(this.getOption('startAngle')));
    angle = goog.math.modulo(angle, Math.PI * 2);

    var ratio = 1 - (angle / (Math.PI * 2));
    var value = this.xScale().inverseTransform(ratio);
    var index = this.findX(value);
    if (index < 0) index = NaN;

    res['pointIndex'] = /** @type {number} */(index);
  }

  return res;
};


/**
 * Transforms values to pix coords.
 * @param {*} xVal
 * @param {*} yVal
 * @param {number=} opt_xSubRangeRatio
 * @return {Object.<string, number>} Pix values.
 */
anychart.radarPolarBaseModule.Series.prototype.transformXY = function(xVal, yVal, opt_xSubRangeRatio) {
  var xScale = /** @type {anychart.scales.Base} */(this.xScale());
  var yScale = /** @type {anychart.scales.Base} */(this.yScale());
  var points = this.ratiosToPixelPairs(xScale.transform(xVal, opt_xSubRangeRatio || 0), [yScale.transform(yVal, .5)]);
  return {'x': points[0], 'y': points[1]};
};


//exports
(function() {
  var proto = anychart.radarPolarBaseModule.Series.prototype;
  proto['transformXY'] = proto.transformXY;
})();
