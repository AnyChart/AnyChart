goog.provide('anychart.polarModule.Series');
goog.require('anychart.core.drawers.Area');
goog.require('anychart.core.drawers.Line');
goog.require('anychart.core.drawers.Marker');
goog.require('anychart.polarModule.drawers.Area');
goog.require('anychart.polarModule.drawers.Column');
goog.require('anychart.polarModule.drawers.Line');
goog.require('anychart.polarModule.drawers.RangeColumn');
goog.require('anychart.radarPolarBaseModule.Series');



/**
 * Class that represents a polar series for the user.
 * @param {!anychart.core.IChart} chart
 * @param {!anychart.core.IPlot} plot
 * @param {string} type
 * @param {anychart.core.series.TypeConfig} config
 * @param {boolean} sortedMode
 * @constructor
 * @extends {anychart.radarPolarBaseModule.Series}
 */
anychart.polarModule.Series = function(chart, plot, type, config, sortedMode) {
  anychart.polarModule.Series.base(this, 'constructor', chart, plot, type, config, sortedMode);

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['closed',
      anychart.ConsistencyState.SERIES_POINTS,
      anychart.Signal.NEEDS_REDRAW,
      anychart.core.series.Capabilities.ANY]
  ]);
};
goog.inherits(anychart.polarModule.Series, anychart.radarPolarBaseModule.Series);


/**
 * Properties that should be defined in series.Polar prototype.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.polarModule.Series.PROPERTY_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'closed',
      anychart.core.settings.booleanNormalizer);
  return map;
})();
anychart.core.settings.populate(anychart.polarModule.Series, anychart.polarModule.Series.PROPERTY_DESCRIPTORS);


/** @inheritDoc */
anychart.polarModule.Series.prototype.getCategoryWidth = function(opt_categoryIndex) {
  var ratio;
  if (goog.isDef(opt_categoryIndex) && anychart.utils.instanceOf(this.xScale(), anychart.scales.Ordinal)) {
    ratio = this.xScale().weightRatios()[opt_categoryIndex];
  } else {
    ratio = this.xScale().getPointWidthRatio();
  }
  return (ratio || (this.xScale().getZoomFactor() / this.getIterator().getRowsCount())) *
      360;
};


/** @inheritDoc */
anychart.polarModule.Series.prototype.resolveAutoAnchorForPosition = function(position) {
  if (position == anychart.enums.Position.CENTER)
    return anychart.enums.Anchor.CENTER;
  var startAngle = /** @type {number} */(this.getOption('startAngle'));
  var x = /** @type {number} */(this.getIterator().meta('xRatio'));
  var angle = startAngle - 90 + 360 * x;
  if (this.isWidthBased()) {
    if (anychart.utils.isLeftAnchor(/** @type {anychart.enums.Anchor} */(position))) {
      angle -= this.pointWidthCache / 2;
    } else if (anychart.utils.isRightAnchor(/** @type {anychart.enums.Anchor} */(position))) {
      angle += this.pointWidthCache / 2;
    }
  }
  var anchor = anychart.utils.getAnchorForAngle(angle);
  anchor = anychart.utils.rotateAnchorByPosition(anchor, position);
  return anchor;
};


/** @inheritDoc */
anychart.polarModule.Series.prototype.createPositionProviderByGeometry = function(anchor) {
  var iterator = this.getIterator();
  var topY, topX, bottomY, bottomX;
  if (!this.isWidthBased() ||
      anchor == anychart.enums.Anchor.AUTO ||
      anchor == anychart.enums.Anchor.CENTER_TOP ||
      anchor == anychart.enums.Anchor.CENTER ||
      anchor == anychart.enums.Anchor.CENTER_BOTTOM) {
    topY = /** @type {number} */(iterator.meta(this.config.anchoredPositionTop));
    topX = /** @type {number} */(iterator.meta(this.config.anchoredPositionTop + 'X'));
    bottomY = /** @type {number} */(iterator.meta(this.config.anchoredPositionBottom));
    bottomX = /** @type {number} */(iterator.meta(this.config.anchoredPositionBottom + 'X'));
  } else {
    var diff = this.pointWidthCache / 720;
    var x = /** @type {number} */(iterator.meta('xRatio'));
    var top = /** @type {number} */(iterator.meta(this.config.anchoredPositionTop + 'Ratio'));
    var bottom = /** @type {number} */(iterator.meta(this.config.anchoredPositionBottom + 'Ratio'));
    if (anychart.utils.isLeftAnchor(anchor)) {
      x -= diff;
    } else { // RIGHT_*
      x += diff;
    }
    var res = this.ratiosToPixelPairs(x, [top, bottom]);
    topX = res[0];
    topY = res[1];
    bottomX = res[2];
    bottomY = res[3];
  }

  return this.calcPositionByLine(anchor, topX, topY, bottomX, bottomY);
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
anychart.polarModule.Series.prototype.makeXRatioMeta = function(rowInfo, yNames, yColumns, pointMissing, xRatio) {
  rowInfo.meta('xRatio', goog.math.modulo(xRatio, 1));
  return pointMissing;
};


/** @inheritDoc */
anychart.polarModule.Series.prototype.prepareMetaMakers = function(yNames, yColumns) {
  anychart.polarModule.Series.base(this, 'prepareMetaMakers', yNames, yColumns);
  this.metaMakers.push(this.makeXRatioMeta);
};


/**
 * Returns if the chart is sorted mode.
 * @return {boolean}
 */
anychart.polarModule.Series.prototype.sortedMode = function() {
  return /** @type {boolean} */(this.chart.sortPointsByX());
};


/** @inheritDoc */
anychart.polarModule.Series.prototype.getXPointPosition = function() {
  return /** @type {number} */(this.getOption('xPointPosition'));
};


/** @inheritDoc */
anychart.polarModule.Series.prototype.makeZeroMeta = function(rowInfo, yNames, yColumns, pointMissing, xRatio) {
  rowInfo.meta('zeroRatio', this.zeroYRatio);
  return anychart.polarModule.Series.base(this, 'makeZeroMeta', rowInfo, yNames, yColumns, pointMissing, xRatio);
};


/** @inheritDoc */
anychart.polarModule.Series.prototype.serialize = function() {
  var json = anychart.polarModule.Series.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.polarModule.Series.PROPERTY_DESCRIPTORS, json);
  return json;
};


/** @inheritDoc */
anychart.polarModule.Series.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.settings.deserialize(this, anychart.polarModule.Series.PROPERTY_DESCRIPTORS, config);
  anychart.polarModule.Series.base(this, 'setupByJSON', config, opt_default);
};


//exports
// from descriptors:
//proto['closed'] = proto.closed;
