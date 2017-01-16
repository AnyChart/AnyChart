goog.provide('anychart.charts.Pyramid');

goog.require('anychart.core.PyramidFunnelBase');



/**
 * Pyramid Chart Class.<br/>
 * <b>Note:</b> Use method {@link anychart.pyramid} to get an instance of this class:
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Data for the chart.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @extends {anychart.core.PyramidFunnelBase}
 * @constructor
 */
anychart.charts.Pyramid = function(opt_data, opt_csvSettings) {
  anychart.charts.Pyramid.base(this, 'constructor', opt_data, opt_csvSettings);
};
goog.inherits(anychart.charts.Pyramid, anychart.core.PyramidFunnelBase);


/** @inheritDoc */
anychart.charts.Pyramid.prototype.getType = function() {
  return anychart.enums.ChartTypes.PYRAMID;
};


/**
 * @inheritDoc
 */
anychart.charts.Pyramid.prototype.serialize = function() {
  var json = anychart.charts.Pyramid.base(this, 'serialize');

  json['type'] = anychart.enums.ChartTypes.PYRAMID;
  json['reversed'] = this.reversed();

  return {'chart': json};
};


/**
 * @inheritDoc
 */
anychart.charts.Pyramid.prototype.setupByJSON = function(config, opt_default) {
  this.reversed(config['reversed']);

  anychart.charts.Pyramid.base(this, 'setupByJSON', config, opt_default);
};


//exports
// from PyramidFunnelBase
(function() {
  var proto = anychart.charts.Pyramid.prototype;
  proto['reversed'] = proto.reversed;
  proto['baseWidth'] = proto.baseWidth;
  proto['connectorLength'] = proto.connectorLength;//doc
  proto['connectorStroke'] = proto.connectorStroke;//doc
  proto['data'] = proto.data;//doc|ex
  proto['getType'] = proto.getType;
  proto['overlapMode'] = proto.overlapMode;//doc
  proto['palette'] = proto.palette;//doc|ex
  proto['pointsPadding'] = proto.pointsPadding;//doc
  proto['tooltip'] = proto.tooltip;
  proto['hatchFillPalette'] = proto.hatchFillPalette;//doc|ex
  proto['markerPalette'] = proto.markerPalette;//doc|ex

  proto['fill'] = proto.fill;//doc|ex
  proto['hoverFill'] = proto.hoverFill;//doc|ex
  proto['selectFill'] = proto.selectFill;//doc|ex

  proto['hatchFill'] = proto.hatchFill;//doc|ex
  proto['hoverHatchFill'] = proto.hoverHatchFill;//doc|ex
  proto['selectHatchFill'] = proto.selectHatchFill;//doc|ex

  proto['labels'] = proto.labels;//doc|ex
  proto['hoverLabels'] = proto.hoverLabels;//doc|ex
  proto['selectLabels'] = proto.selectLabels;//doc|ex

  proto['stroke'] = proto.stroke;//doc|ex
  proto['hoverStroke'] = proto.hoverStroke;//doc|ex
  proto['selectStroke'] = proto.selectStroke;//doc|ex

  proto['markers'] = proto.markers;
  proto['hoverMarkers'] = proto.hoverMarkers;
  proto['selectMarkers'] = proto.selectMarkers;

  proto['hover'] = proto.hover;
  proto['unhover'] = proto.unhover;

  proto['select'] = proto.select;
  proto['unselect'] = proto.unselect;
  proto['getPoint'] = proto.getPoint;
})();
