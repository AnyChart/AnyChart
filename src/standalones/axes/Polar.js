goog.provide('anychart.standalones.axes.Polar');
goog.require('anychart.core.axes.Polar');



/**
 * @constructor
 * @extends {anychart.core.axes.Polar}
 */
anychart.standalones.axes.Polar = function() {
  anychart.standalones.axes.Polar.base(this, 'constructor');
};
goog.inherits(anychart.standalones.axes.Polar, anychart.core.axes.Polar);
anychart.core.makeStandalone(anychart.standalones.axes.Polar, anychart.core.axes.Polar);


/** @inheritDoc */
anychart.standalones.axes.Polar.prototype.setupByJSON = function(config, opt_default) {
  anychart.standalones.axes.Polar.base(this, 'setupByJSON', config, opt_default);
  this.startAngle(config['startAngle']);
};


/** @inheritDoc */
anychart.standalones.axes.Polar.prototype.serialize = function() {
  var json = anychart.standalones.axes.Polar.base(this, 'serialize');
  json['startAngle'] = this.startAngle();
  return json;
};


/**
 * Returns axis instance.<br/>
 * <b>Note:</b> Any axis must be bound to a scale.
 * @return {!anychart.standalones.axes.Polar}
 */
anychart.standalones.axes.polar = function() {
  var axis = new anychart.standalones.axes.Polar();
  axis.setup(anychart.getFullTheme('standalones.polarAxis'));
  return axis;
};


/**
 * Returns axis instance.<br/>
 * <b>Note:</b> Any axis must be bound to a scale.
 * @return {!anychart.standalones.axes.Polar}
 * @deprecated Since 7.12.0. Use anychart.standalones.axes.polar instead.
 */
anychart.axes.polar = function() {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null, ['anychart.axes.polar()', 'anychart.standalones.axes.polar()', null, 'Constructor'], true);
  return anychart.standalones.axes.polar();
};


//exports
/** @suppress {deprecated} */
(function() {
  var proto = anychart.standalones.axes.Polar.prototype;
  goog.exportSymbol('anychart.axes.polar', anychart.axes.polar);
  goog.exportSymbol('anychart.standalones.axes.polar', anychart.standalones.axes.polar);
  proto['draw'] = proto.draw;
  proto['parentBounds'] = proto.parentBounds;
  proto['container'] = proto.container;
  proto['startAngle'] = proto.startAngle;
})();
