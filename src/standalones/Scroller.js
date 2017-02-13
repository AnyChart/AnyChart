goog.provide('anychart.standalones.Scroller');
goog.require('anychart.core.ui.Scroller');



/**
 * Scroller standalone class.
 * @constructor
 * @extends {anychart.core.ui.Scroller}
 */
anychart.standalones.Scroller = function() {
  anychart.standalones.Scroller.base(this, 'constructor');
};
goog.inherits(anychart.standalones.Scroller, anychart.core.ui.Scroller);
anychart.core.makeStandalone(anychart.standalones.Scroller, anychart.core.ui.Scroller);


/**
 * Changes current selected range to the passed one.
 * @param {number} startRatio Clamped to [0..1].
 * @param {number} endRatio Clamped to [0..1].
 * @return {anychart.standalones.Scroller}
 */
anychart.standalones.Scroller.prototype.setRange = function(startRatio, endRatio) {
  this.setRangeInternal(startRatio, endRatio);
  return this;
};


/**
 * Getter and setter for starting ratio. Note that it is always less than the endRatio.
 * @param {number=} opt_value
 * @return {anychart.standalones.Scroller|number}
 */
anychart.standalones.Scroller.prototype.startRatio = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.setRangeInternal(opt_value, this.getEndRatio());
    return this;
  }
  return this.getStartRatio();
};


/**
 * Getter and setter for ending ratio. Note that it is always greater than the startRatio.
 * @param {number=} opt_value
 * @return {anychart.standalones.Scroller|number}
 */
anychart.standalones.Scroller.prototype.endRatio = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.setRangeInternal(this.getStartRatio(), opt_value);
    return this;
  }
  return this.getEndRatio();
};


/**
 * Scroller standalone constructor.
 * @return {anychart.standalones.Scroller}
 */
anychart.standalones.scroller = function() {
  var scroller = new anychart.standalones.Scroller();
  scroller.setup(anychart.getFullTheme('standalones.scroller'));
  return scroller;
};


/**
 * Scroller standalone constructor.
 * @return {anychart.standalones.Scroller}
 * @deprecated Since 7.12.0. Use anychart.standalones.scroller instead.
 */
anychart.ui.scroller = function() {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null, ['anychart.ui.scroller()', 'anychart.standalones.scroller()', null, 'Constructor'], true);
  return anychart.standalones.scroller();
};


//exports
/** @suppress {deprecated} */
(function() {
  var proto = anychart.standalones.Scroller.prototype;
  goog.exportSymbol('anychart.ui.scroller', anychart.ui.scroller);
  goog.exportSymbol('anychart.standalones.scroller', anychart.standalones.scroller);
  proto['setRange'] = proto.setRange;
  proto['startRatio'] = proto.startRatio;
  proto['endRatio'] = proto.endRatio;
  proto['parentBounds'] = proto.parentBounds;
  proto['getRemainingBounds'] = proto.getRemainingBounds;
  proto['container'] = proto.container;
  proto['padding'] = proto.padding;
  proto['draw'] = proto.draw;
})();
