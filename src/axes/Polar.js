goog.provide('anychart.axes.Polar');
goog.require('anychart.core.axes.Polar');



/**
 * @constructor
 * @extends {anychart.core.axes.Polar}
 */
anychart.axes.Polar = function() {
  goog.base(this);
};
goog.inherits(anychart.axes.Polar, anychart.core.axes.Polar);


/** @inheritDoc */
anychart.axes.Polar.prototype.draw = function() {
  this.labels().dropCallsCache();
  this.minorLabels().dropCallsCache();
  return goog.base(this, 'draw');
};


/** @inheritDoc */
anychart.axes.Polar.prototype.setupByJSON = function(config) {
  goog.base(this, 'setupByJSON', config);
  this.startAngle(config['startAngle']);
};


/** @inheritDoc */
anychart.axes.Polar.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  json['startAngle'] = this.startAngle();
  return json;
};


/**
 * Returns axis instance.<br/>
 * <b>Note:</b> Any axis must be bound to a scale.
 * @return {!anychart.axes.Polar}
 */
anychart.axes.polar = function() {
  var res = new anychart.axes.Polar();
  res.setup(anychart.getFullTheme()['standalones']['polarAxis']);
  return res;
};


//exports
goog.exportSymbol('anychart.axes.polar', anychart.axes.polar);
anychart.axes.Polar.prototype['draw'] = anychart.axes.Polar.prototype.draw;
anychart.axes.Polar.prototype['parentBounds'] = anychart.axes.Polar.prototype.parentBounds;
anychart.axes.Polar.prototype['container'] = anychart.axes.Polar.prototype.container;
anychart.axes.Polar.prototype['startAngle'] = anychart.axes.Polar.prototype.startAngle;
