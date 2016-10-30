goog.provide('anychart.charts.Funnel');

goog.require('anychart.core.PyramidFunnelBase');



/**
 * Funnel Chart Class.<br/>
 * <b>Note:</b> Use method {@link anychart.funnel} to get an instance of this class:
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Data for the chart.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @extends {anychart.core.PyramidFunnelBase}
 * @constructor
 */
anychart.charts.Funnel = function(opt_data, opt_csvSettings) {
  goog.base(this, opt_data, opt_csvSettings);

  // Funnel looks like reversed pyramid
  this.reversed(true);
};
goog.inherits(anychart.charts.Funnel, anychart.core.PyramidFunnelBase);


/** @inheritDoc */
anychart.charts.Funnel.prototype.getType = function() {
  return anychart.enums.ChartTypes.FUNNEL;
};


/** @inheritDoc */
anychart.charts.Funnel.prototype.getProperThemePart = function() {
  return anychart.getFullTheme()['funnel'];
};


/**
 * @inheritDoc
 */
anychart.charts.Funnel.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');

  json['type'] = anychart.enums.ChartTypes.FUNNEL;
  json['neckHeight'] = this.neckHeight();
  json['neckWidth'] = this.neckWidth();

  return {'chart': json};
};


/**
 * @inheritDoc
 */
anychart.charts.Funnel.prototype.setupByJSON = function(config, opt_default) {
  this.neckHeight(config['neckHeight']);
  this.neckWidth(config['neckWidth']);

  goog.base(this, 'setupByJSON', config, opt_default);
};


//exports
anychart.charts.Funnel.prototype['neckHeight'] = anychart.charts.Funnel.prototype.neckHeight;
anychart.charts.Funnel.prototype['neckWidth'] = anychart.charts.Funnel.prototype.neckWidth;

// from PyramidFunnelBase
anychart.charts.Funnel.prototype['baseWidth'] = anychart.charts.Funnel.prototype.baseWidth;
anychart.charts.Funnel.prototype['connectorLength'] = anychart.charts.Funnel.prototype.connectorLength;
anychart.charts.Funnel.prototype['connectorStroke'] = anychart.charts.Funnel.prototype.connectorStroke;
anychart.charts.Funnel.prototype['data'] = anychart.charts.Funnel.prototype.data;
anychart.charts.Funnel.prototype['getType'] = anychart.charts.Funnel.prototype.getType;
anychart.charts.Funnel.prototype['overlapMode'] = anychart.charts.Funnel.prototype.overlapMode;
anychart.charts.Funnel.prototype['palette'] = anychart.charts.Funnel.prototype.palette;
anychart.charts.Funnel.prototype['pointsPadding'] = anychart.charts.Funnel.prototype.pointsPadding;
anychart.charts.Funnel.prototype['tooltip'] = anychart.charts.Funnel.prototype.tooltip;

anychart.charts.Funnel.prototype['hatchFillPalette'] = anychart.charts.Funnel.prototype.hatchFillPalette;
anychart.charts.Funnel.prototype['markerPalette'] = anychart.charts.Funnel.prototype.markerPalette;

anychart.charts.Funnel.prototype['fill'] = anychart.charts.Funnel.prototype.fill;
anychart.charts.Funnel.prototype['hoverFill'] = anychart.charts.Funnel.prototype.hoverFill;
anychart.charts.Funnel.prototype['selectFill'] = anychart.charts.Funnel.prototype.selectFill;

anychart.charts.Funnel.prototype['hatchFill'] = anychart.charts.Funnel.prototype.hatchFill;
anychart.charts.Funnel.prototype['hoverHatchFill'] = anychart.charts.Funnel.prototype.hoverHatchFill;
anychart.charts.Funnel.prototype['selectHatchFill'] = anychart.charts.Funnel.prototype.selectHatchFill;

anychart.charts.Funnel.prototype['labels'] = anychart.charts.Funnel.prototype.labels;
anychart.charts.Funnel.prototype['hoverLabels'] = anychart.charts.Funnel.prototype.hoverLabels;
anychart.charts.Funnel.prototype['selectLabels'] = anychart.charts.Funnel.prototype.selectLabels;

anychart.charts.Funnel.prototype['markers'] = anychart.charts.Funnel.prototype.markers;
anychart.charts.Funnel.prototype['hoverMarkers'] = anychart.charts.Funnel.prototype.hoverMarkers;
anychart.charts.Funnel.prototype['selectMarkers'] = anychart.charts.Funnel.prototype.selectMarkers;

anychart.charts.Funnel.prototype['stroke'] = anychart.charts.Funnel.prototype.stroke;
anychart.charts.Funnel.prototype['hoverStroke'] = anychart.charts.Funnel.prototype.hoverStroke;
anychart.charts.Funnel.prototype['selectStroke'] = anychart.charts.Funnel.prototype.selectStroke;

anychart.charts.Funnel.prototype['unhover'] = anychart.charts.Funnel.prototype.unhover;
anychart.charts.Funnel.prototype['hover'] = anychart.charts.Funnel.prototype.hover;

anychart.charts.Funnel.prototype['unselect'] = anychart.charts.Funnel.prototype.unselect;
anychart.charts.Funnel.prototype['select'] = anychart.charts.Funnel.prototype.select;
anychart.charts.Funnel.prototype['getPoint'] = anychart.charts.Funnel.prototype.getPoint;
