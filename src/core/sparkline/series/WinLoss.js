goog.provide('anychart.core.sparkline.series.WinLoss');

goog.require('anychart.core.sparkline.series.Column');



/**
 * @param {!anychart.charts.Sparkline} chart Chart.
 * @constructor
 * @extends {anychart.core.sparkline.series.Column}
 */
anychart.core.sparkline.series.WinLoss = function(chart) {
  anychart.core.sparkline.series.WinLoss.base(this, 'constructor', chart);
};
goog.inherits(anychart.core.sparkline.series.WinLoss, anychart.core.sparkline.series.Column);
anychart.core.sparkline.series.Base.SeriesTypesMap[anychart.enums.SparklineSeriesType.WIN_LOSS] = anychart.core.sparkline.series.WinLoss;


/** @inheritDoc */
anychart.core.sparkline.series.WinLoss.prototype.startDrawing = function() {
  anychart.core.sparkline.series.WinLoss.base(this, 'startDrawing');

  this.zeroY = Math.round(this.applyRatioToBounds(.5, false));
};


/** @inheritDoc */
anychart.core.sparkline.series.WinLoss.prototype.getReferenceCoords = function() {
  if (!this.enabled()) return null;
  var yScale = /** @type {anychart.scales.Base} */(this.chart.yScale());
  var xScale = /** @type {anychart.scales.Base} */(this.chart.xScale());
  var iterator = this.getIterator();
  var fail = false;

  var xVal = iterator.get('x');
  var yVal = /** @type {number} */(iterator.get('value'));
  yVal = yVal > 0 ? (yScale.inverted() ? 0 : 1) : yVal < 0 ? (yScale.inverted() ? 1 : 0) : .5;

  if (!goog.isDef(xVal) || !goog.isDef(yVal))
    return null;

  if (yScale.isMissing(yVal))
    yVal = NaN;

  var xPix = xScale.isMissing(xVal) ?
      NaN :
      this.applyRatioToBounds(xScale.transform(xVal, .5), true);
  var yPix = this.applyRatioToBounds(yVal, false);

  if (isNaN(xPix) || isNaN(yPix)) fail = true;

  return fail ? null : [xPix, yPix];
};


/** @inheritDoc */
anychart.core.sparkline.series.WinLoss.prototype.getDefaults = function() {
  var settings = anychart.core.sparkline.series.WinLoss.base(this, 'getDefaults');

  if (!settings['markers']) settings['markers'] = {};
  settings['markers']['position'] = anychart.enums.Position.CENTER_TOP;
  settings['markers']['anchor'] = anychart.enums.Position.CENTER_TOP;

  if (!settings['labels']) settings['labels'] = {};
  settings['labels']['position'] = anychart.enums.Position.CENTER_TOP;
  settings['labels']['anchor'] = anychart.enums.Position.CENTER_TOP;

  if (!settings['negativeMarkers']) settings['negativeMarkers'] = {};
  settings['negativeMarkers']['position'] = anychart.enums.Position.CENTER_BOTTOM;
  settings['negativeMarkers']['anchor'] = anychart.enums.Position.CENTER_BOTTOM;

  if (!settings['negativeLabels']) settings['negativeLabels'] = {};
  settings['negativeLabels']['position'] = anychart.enums.Position.CENTER_BOTTOM;
  settings['negativeLabels']['anchor'] = anychart.enums.Position.CENTER_BOTTOM;

  settings['stroke'] = {
    'color': '#64b5f6',
    'thickness': 1.5
  };
  settings['fill'] = {
    'color': '#64b5f6',
    'opacity': 0.7
  };
  settings['negativeFill'] = {
    'color': '#ef6c00',
    'opacity': 0.7
  };

  return settings;
};


