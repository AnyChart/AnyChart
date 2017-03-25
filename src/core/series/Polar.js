goog.provide('anychart.core.series.Polar');
goog.require('anychart.core.drawers.Marker');
goog.require('anychart.core.drawers.PolarArea');
goog.require('anychart.core.drawers.PolarLine');
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
  map['closed'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'closed',
      anychart.core.settings.booleanNormalizer,
      anychart.ConsistencyState.SERIES_POINTS,
      anychart.Signal.NEEDS_REDRAW,
      anychart.core.series.Capabilities.ANY);
  return map;
})();
anychart.core.settings.populate(anychart.core.series.Polar, anychart.core.series.Polar.PROPERTY_DESCRIPTORS);


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
anychart.core.series.Polar.prototype.makePointsMetaFromMap = function(rowInfo, map, xRatio) {
  anychart.core.series.Polar.base(this, 'makePointsMetaFromMap', rowInfo, map, xRatio);
  for (var i in map) {
    rowInfo.meta(i + 'Ratio', map[i]);
  }
};


/** @inheritDoc */
anychart.core.series.Polar.prototype.prepareMetaMakers = function() {
  anychart.core.series.Polar.base(this, 'prepareMetaMakers');
  this.metaMakers.push(this.makeXRatioMeta);
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
