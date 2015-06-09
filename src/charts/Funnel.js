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

  this.neckHeight('25%');
  this.neckWidth('30%');
};
goog.inherits(anychart.charts.Funnel, anychart.core.PyramidFunnelBase);


/** @inheritDoc */
anychart.charts.Funnel.prototype.getType = function() {
  return anychart.enums.ChartTypes.FUNNEL;
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
anychart.charts.Funnel.prototype.setupByJSON = function(config) {
  this.neckHeight(config['neckHeight']);
  this.neckWidth(config['neckWidth']);

  goog.base(this, 'setupByJSON', config);
};


//exports
anychart.charts.Funnel.prototype['neckHeight'] = anychart.charts.Funnel.prototype.neckHeight;
anychart.charts.Funnel.prototype['neckWidth'] = anychart.charts.Funnel.prototype.neckWidth;

// from PyramidFunnelBase
anychart.charts.Funnel.prototype['baseWidth'] = anychart.charts.Funnel.prototype.baseWidth;
anychart.charts.Funnel.prototype['connectorLength'] = anychart.charts.Funnel.prototype.connectorLength;//doc
anychart.charts.Funnel.prototype['connectorStroke'] = anychart.charts.Funnel.prototype.connectorStroke;//doc
anychart.charts.Funnel.prototype['data'] = anychart.charts.Funnel.prototype.data;//doc|ex
anychart.charts.Funnel.prototype['fill'] = anychart.charts.Funnel.prototype.fill;//doc|ex
anychart.charts.Funnel.prototype['getType'] = anychart.charts.Funnel.prototype.getType;
anychart.charts.Funnel.prototype['hatchFill'] = anychart.charts.Funnel.prototype.hatchFill;//doc|ex
anychart.charts.Funnel.prototype['hatchFillPalette'] = anychart.charts.Funnel.prototype.hatchFillPalette;//doc|ex
anychart.charts.Funnel.prototype['hoverFill'] = anychart.charts.Funnel.prototype.hoverFill;//doc|ex
anychart.charts.Funnel.prototype['hover'] = anychart.charts.Funnel.prototype.hover;
anychart.charts.Funnel.prototype['hoverHatchFill'] = anychart.charts.Funnel.prototype.hoverHatchFill;//doc|ex
anychart.charts.Funnel.prototype['hoverLabels'] = anychart.charts.Funnel.prototype.hoverLabels;//doc|ex
anychart.charts.Funnel.prototype['hoverMarkers'] = anychart.charts.Funnel.prototype.hoverMarkers;
anychart.charts.Funnel.prototype['hoverStroke'] = anychart.charts.Funnel.prototype.hoverStroke;//doc|ex
anychart.charts.Funnel.prototype['labels'] = anychart.charts.Funnel.prototype.labels;//doc|ex
anychart.charts.Funnel.prototype['markerPalette'] = anychart.charts.Funnel.prototype.markerPalette;//doc|ex
anychart.charts.Funnel.prototype['markers'] = anychart.charts.Funnel.prototype.markers;
anychart.charts.Funnel.prototype['overlapMode'] = anychart.charts.Funnel.prototype.overlapMode;//doc
anychart.charts.Funnel.prototype['palette'] = anychart.charts.Funnel.prototype.palette;//doc|ex
anychart.charts.Funnel.prototype['pointsPadding'] = anychart.charts.Funnel.prototype.pointsPadding;//doc
anychart.charts.Funnel.prototype['stroke'] = anychart.charts.Funnel.prototype.stroke;//doc|ex
anychart.charts.Funnel.prototype['tooltip'] = anychart.charts.Funnel.prototype.tooltip;
anychart.charts.Funnel.prototype['unhover'] = anychart.charts.Funnel.prototype.unhover;
