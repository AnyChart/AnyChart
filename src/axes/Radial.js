goog.provide('anychart.axes.Radial');
goog.require('anychart.core.axes.Radial');



/**
 * @constructor
 * @extends {anychart.core.axes.Radial}
 */
anychart.axes.Radial = function() {
  goog.base(this);
};
goog.inherits(anychart.axes.Radial, anychart.core.axes.Radial);


/** @inheritDoc */
anychart.axes.Radial.prototype.draw = function() {
  this.labels().dropCallsCache();
  this.minorLabels().dropCallsCache();
  return goog.base(this, 'draw');
};


/** @inheritDoc */
anychart.axes.Radial.prototype.setupByJSON = function(config) {
  goog.base(this, 'setupByJSON', config);
  this.startAngle(config['startAngle']);
};


/** @inheritDoc */
anychart.axes.Radial.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  json['startAngle'] = this.startAngle();
  return json;
};


/**
 * Returns axis instance.<br/>
 * <b>Note:</b> Any axis must be bound to a scale.
 * @return {!anychart.axes.Radial}
 */
anychart.axes.radial = function() {
  var res = new anychart.axes.Radial();
  res.setup(anychart.getFullTheme()['standalones']['radialAxis']);
  return res;
};


//exports
goog.exportSymbol('anychart.axes.radial', anychart.axes.radial);
anychart.axes.Radial.prototype['draw'] = anychart.axes.Radial.prototype.draw;
anychart.axes.Radial.prototype['parentBounds'] = anychart.axes.Radial.prototype.parentBounds;
anychart.axes.Radial.prototype['container'] = anychart.axes.Radial.prototype.container;
anychart.axes.Radial.prototype['startAngle'] = anychart.axes.Radial.prototype.startAngle;
