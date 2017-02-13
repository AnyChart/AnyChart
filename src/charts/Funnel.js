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
  anychart.charts.Funnel.base(this, 'constructor', opt_data, opt_csvSettings);

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
  return anychart.getFullTheme('funnel');
};


/**
 * @inheritDoc
 */
anychart.charts.Funnel.prototype.serialize = function() {
  var json = anychart.charts.Funnel.base(this, 'serialize');

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

  anychart.charts.Funnel.base(this, 'setupByJSON', config, opt_default);
};


//exports
(function() {
  var proto = anychart.charts.Funnel.prototype;
  proto['neckHeight'] = proto.neckHeight;
  proto['neckWidth'] = proto.neckWidth;

  // from PyramidFunnelBase
  proto['baseWidth'] = proto.baseWidth;
  proto['connectorLength'] = proto.connectorLength;
  proto['connectorStroke'] = proto.connectorStroke;
  proto['data'] = proto.data;
  proto['getType'] = proto.getType;
  proto['overlapMode'] = proto.overlapMode;
  proto['palette'] = proto.palette;
  proto['pointsPadding'] = proto.pointsPadding;
  proto['tooltip'] = proto.tooltip;

  proto['hatchFillPalette'] = proto.hatchFillPalette;
  proto['markerPalette'] = proto.markerPalette;

  proto['fill'] = proto.fill;
  proto['hoverFill'] = proto.hoverFill;
  proto['selectFill'] = proto.selectFill;

  proto['hatchFill'] = proto.hatchFill;
  proto['hoverHatchFill'] = proto.hoverHatchFill;
  proto['selectHatchFill'] = proto.selectHatchFill;

  proto['labels'] = proto.labels;
  proto['hoverLabels'] = proto.hoverLabels;
  proto['selectLabels'] = proto.selectLabels;

  proto['markers'] = proto.markers;
  proto['hoverMarkers'] = proto.hoverMarkers;
  proto['selectMarkers'] = proto.selectMarkers;

  proto['stroke'] = proto.stroke;
  proto['hoverStroke'] = proto.hoverStroke;
  proto['selectStroke'] = proto.selectStroke;

  proto['unhover'] = proto.unhover;
  proto['hover'] = proto.hover;

  proto['unselect'] = proto.unselect;
  proto['select'] = proto.select;
  proto['getPoint'] = proto.getPoint;
})();
