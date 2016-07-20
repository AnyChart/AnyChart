goog.provide('anychart.core.utils.MapConnectorPointContextProvider');
goog.require('anychart.core.utils.MapPointContextProvider');



/**
 * Series point context provider.
 * @param {(anychart.core.SeriesBase|anychart.core.sparkline.series.Base)} series Series.
 * @param {Array.<string>} referenceValueNames Reference value names to be applied.
 * @extends {anychart.core.utils.MapPointContextProvider}
 * @constructor
 */
anychart.core.utils.MapConnectorPointContextProvider = function(series, referenceValueNames) {
  anychart.core.utils.MapConnectorPointContextProvider.base(this, 'constructor', series, referenceValueNames);
};
goog.inherits(anychart.core.utils.MapConnectorPointContextProvider, anychart.core.utils.MapPointContextProvider);


/** @inheritDoc */
anychart.core.utils.MapConnectorPointContextProvider.prototype.applyReferenceValues = function() {
  var iterator = this['series'].getIterator();
  var value, i, len;
  this['index'] = iterator.getIndex();
  for (i = 0; i < this.referenceValueNames.length; i++) {
    value = this.referenceValueNames[i];
    this[value] = iterator.get(value);
  }

  var pointsWithoutMissing = iterator.meta('pointsWithoutMissing');
  if (pointsWithoutMissing && pointsWithoutMissing.length) {
    this['startPoint'] = {'lat': pointsWithoutMissing[0], 'long': pointsWithoutMissing[1]};
    this['endPoint'] = {'lat': pointsWithoutMissing[pointsWithoutMissing.length - 2], 'long': pointsWithoutMissing[pointsWithoutMissing.length - 1]};

    var connectorPoints = [];
    for (i = 0, len = pointsWithoutMissing.length; i < len; i += 2) {
      connectorPoints.push({'lat': pointsWithoutMissing[i], 'long': pointsWithoutMissing[i + 1]});
    }
    this['connectorPoints'] = connectorPoints;
  }

  if (this['series'].name)
    this['seriesName'] = this['series'].name() || 'Series: ' + this['series'].index();
};
