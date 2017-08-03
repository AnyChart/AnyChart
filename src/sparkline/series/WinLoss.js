goog.provide('anychart.sparklineModule.series.WinLoss');

goog.require('anychart.sparklineModule.series.Column');



/**
 * @param {!anychart.sparklineModule.Chart} chart Chart.
 * @constructor
 * @extends {anychart.sparklineModule.series.Column}
 */
anychart.sparklineModule.series.WinLoss = function(chart) {
  anychart.sparklineModule.series.WinLoss.base(this, 'constructor', chart);
};
goog.inherits(anychart.sparklineModule.series.WinLoss, anychart.sparklineModule.series.Column);
anychart.sparklineModule.series.Base.SeriesTypesMap[anychart.enums.SparklineSeriesType.WIN_LOSS] = anychart.sparklineModule.series.WinLoss;


/** @inheritDoc */
anychart.sparklineModule.series.WinLoss.prototype.startDrawing = function() {
  anychart.sparklineModule.series.WinLoss.base(this, 'startDrawing');

  this.zeroY = Math.round(this.applyRatioToBounds(.5, false));
};


/** @inheritDoc */
anychart.sparklineModule.series.WinLoss.prototype.getReferenceCoords = function() {
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
anychart.sparklineModule.series.WinLoss.prototype.getDefaults = function() {
  var settings = anychart.sparklineModule.series.WinLoss.base(this, 'getDefaults');

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


