goog.provide('anychart.core.utils.MapPointContextProvider');
goog.require('anychart.core.utils.SeriesPointContextProvider');



/**
 * Series point context provider.
 * @param {(anychart.core.SeriesBase|anychart.core.sparkline.series.Base)} series Series.
 * @param {Array.<string>} referenceValueNames Reference value names to be applied.
 * @extends {anychart.core.utils.SeriesPointContextProvider}
 * @constructor
 */
anychart.core.utils.MapPointContextProvider = function(series, referenceValueNames) {
  anychart.core.utils.MapPointContextProvider.base(this, 'constructor', series, referenceValueNames, false);
};
goog.inherits(anychart.core.utils.MapPointContextProvider, anychart.core.utils.SeriesPointContextProvider);


/** @inheritDoc */
anychart.core.utils.MapPointContextProvider.prototype.getTokenValue = function(name) {
  var tokenResult = anychart.core.utils.MapPointContextProvider.base(this, 'getTokenValue', name);
  if (!goog.isDef(tokenResult)) {
    var iterator = this['series'].getIterator();
    var features = iterator.meta('features');
    var pointGeoProp = features && features.length ? features[0]['properties'] : null;
    if (pointGeoProp)
      tokenResult = pointGeoProp[name.substr(1)];
  }
  return tokenResult;
};


/** @inheritDoc */
anychart.core.utils.MapPointContextProvider.prototype.applyReferenceValues = function() {
  var iterator = this['series'].getIterator();
  var value;
  this['index'] = iterator.getIndex();
  for (var i = 0; i < this.referenceValueNames.length; i++) {
    value = this.referenceValueNames[i];
    this[value] = iterator.get(value);
  }

  var regionId = iterator.meta('regionId');
  if (regionId)
    this['id'] = regionId;

  if (this['series'].name)
    this['seriesName'] = this['series'].name() || 'Series: ' + this['series'].index();

  var features = iterator.meta('features');
  var pointGeoProp = features && features.length ? features[0]['properties'] : null;
  if (pointGeoProp) {
    this['name'] = pointGeoProp['name'];
    this['regionProperties'] = pointGeoProp;
  }
};


//exports
(function() {
  var proto = anychart.core.utils.MapPointContextProvider.prototype;
  proto['getTokenValue'] = proto.getTokenValue;
})();
