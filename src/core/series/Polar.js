goog.provide('anychart.core.series.Polar');
goog.require('anychart.core.drawers.Area');
goog.require('anychart.core.drawers.Line');
goog.require('anychart.core.drawers.Marker');
goog.require('anychart.core.drawers.PolarArea');
goog.require('anychart.core.drawers.PolarColumn');
goog.require('anychart.core.drawers.PolarLine');
goog.require('anychart.core.drawers.PolarRangeColumn');
goog.require('anychart.core.series.Radar');



/**
 * Class that represents a polar series for the user.
 * @param {!anychart.core.IChart} chart
 * @param {!anychart.core.IPlot} plot
 * @param {string} type
 * @param {anychart.core.series.TypeConfig} config
 * @param {boolean} sortedMode
 * @constructor
 * @extends {anychart.core.series.Radar}
 */
anychart.core.series.Polar = function(chart, plot, type, config, sortedMode) {
  anychart.core.series.Polar.base(this, 'constructor', chart, plot, type, config, sortedMode);
};
goog.inherits(anychart.core.series.Polar, anychart.core.series.Radar);


/**
 * Properties that should be defined in series.Polar prototype.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.series.Polar.PROPERTY_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'closed',
      anychart.core.settings.booleanNormalizer,
      anychart.ConsistencyState.SERIES_POINTS,
      anychart.Signal.NEEDS_REDRAW,
      anychart.core.series.Capabilities.ANY);
  return map;
})();
anychart.core.settings.populate(anychart.core.series.Polar, anychart.core.series.Polar.PROPERTY_DESCRIPTORS);


/** @inheritDoc */
anychart.core.series.Polar.prototype.getCategoryWidth = function() {
  return (this.xScale().getPointWidthRatio() || (this.xScale().getZoomFactor() / this.getIterator().getRowsCount())) *
      360;
};


/** @inheritDoc */
anychart.core.series.Polar.prototype.createPositionProviderByGeometry = function(anchor) {
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
    var diff = this.pointWidthCache / (Math.PI * 4);
    var x = /** @type {number} */(iterator.meta('xRatio'));
    var top = /** @type {number} */(iterator.meta(this.config.anchoredPositionTop + 'Ratio'));
    var bottom = /** @type {number} */(iterator.meta(this.config.anchoredPositionBottom + 'Ratio'));
    if (anchor == anychart.enums.Anchor.LEFT_TOP ||
        anchor == anychart.enums.Anchor.LEFT_CENTER ||
        anchor == anychart.enums.Anchor.LEFT_BOTTOM) {
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
anychart.core.series.Polar.prototype.makeXRatioMeta = function(rowInfo, yNames, yColumns, pointMissing, xRatio) {
  rowInfo.meta('xRatio', goog.math.modulo(xRatio, 1));
  return pointMissing;
};


/** @inheritDoc */
anychart.core.series.Polar.prototype.prepareMetaMakers = function(yNames, yColumns) {
  anychart.core.series.Polar.base(this, 'prepareMetaMakers', yNames, yColumns);
  this.metaMakers.push(this.makeXRatioMeta);
};


/** @inheritDoc */
anychart.core.series.Polar.prototype.getXPointPosition = function() {
  return /** @type {number} */(this.getOption('xPointPosition'));
};


/** @inheritDoc */
anychart.core.series.Polar.prototype.makeZeroMeta = function(rowInfo, yNames, yColumns, pointMissing, xRatio) {
  rowInfo.meta('zeroRatio', this.zeroYRatio);
  return anychart.core.series.Polar.base(this, 'makeZeroMeta', rowInfo, yNames, yColumns, pointMissing, xRatio);
};


/** @inheritDoc */
anychart.core.series.Polar.prototype.serialize = function() {
  var json = anychart.core.series.Polar.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.core.series.Polar.PROPERTY_DESCRIPTORS, json);
  return json;
};


/** @inheritDoc */
anychart.core.series.Polar.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.settings.deserialize(this, anychart.core.series.Polar.PROPERTY_DESCRIPTORS, config);
  anychart.core.series.Polar.base(this, 'setupByJSON', config, opt_default);
};


//exports
// from descriptors:
//proto['closed'] = proto.closed;
