goog.provide('anychart.axes.Radar');
goog.require('anychart.core.axes.Radar');



/**
 * @constructor
 * @extends {anychart.core.axes.Radar}
 */
anychart.axes.Radar = function() {
  goog.base(this);
};
goog.inherits(anychart.axes.Radar, anychart.core.axes.Radar);


/** @inheritDoc */
anychart.axes.Radar.prototype.draw = function() {
  this.labels().dropCallsCache();
  return goog.base(this, 'draw');
};


/** @inheritDoc */
anychart.axes.Radar.prototype.setupByJSON = function(config) {
  goog.base(this, 'setupByJSON', config);
  this.startAngle(config['startAngle']);
};


/** @inheritDoc */
anychart.axes.Radar.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  json['startAngle'] = this.startAngle();
  return json;
};


/**
 * Returns axis instance.<br/>
 * <b>Note:</b> Any axis must be bound to a scale.
 * @return {!anychart.axes.Radar}
 */
anychart.axes.radar = function() {
  var res = new anychart.axes.Radar();
  res.setup(anychart.getFullTheme()['standalones']['radarAxis']);
  return res;
};


//exports
goog.exportSymbol('anychart.axes.radar', anychart.axes.radar);
anychart.axes.Radar.prototype['draw'] = anychart.axes.Radar.prototype.draw;
anychart.axes.Radar.prototype['parentBounds'] = anychart.axes.Radar.prototype.parentBounds;
anychart.axes.Radar.prototype['container'] = anychart.axes.Radar.prototype.container;
anychart.axes.Radar.prototype['startAngle'] = anychart.axes.Radar.prototype.startAngle;
