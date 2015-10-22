goog.provide('anychart.ui.Scroller');
goog.require('anychart.core.ui.Scroller');



/**
 * Scroller standalone class.
 * @constructor
 * @extends {anychart.core.ui.Scroller}
 */
anychart.ui.Scroller = function() {
  goog.base(this);

  this.listenSignals(this.listenSignals_, this);
};
goog.inherits(anychart.ui.Scroller, anychart.core.ui.Scroller);


/**
 * Changes current selected range to the passed one.
 * @param {number} startRatio Clamped to [0..1].
 * @param {number} endRatio Clamped to [0..1].
 * @return {anychart.ui.Scroller}
 */
anychart.ui.Scroller.prototype.setRange = function(startRatio, endRatio) {
  this.setRangeInternal(startRatio, endRatio);
  return this;
};


/**
 * Getter and setter for starting ratio. Note that it is always less than the endRatio.
 * @param {number=} opt_value
 * @return {anychart.ui.Scroller|number}
 */
anychart.ui.Scroller.prototype.startRatio = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.setRangeInternal(opt_value, this.getEndRatio());
    return this;
  }
  return this.getStartRatio();
};


/**
 * Getter and setter for ending ratio. Note that it is always greater than the startRatio.
 * @param {number=} opt_value
 * @return {anychart.ui.Scroller|number}
 */
anychart.ui.Scroller.prototype.endRatio = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.setRangeInternal(this.getStartRatio(), opt_value);
    return this;
  }
  return this.getEndRatio();
};


/**
 * Signal listener.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.ui.Scroller.prototype.listenSignals_ = function(e) {
  this.draw();
};


/**
 * Scroller standalone constructor.
 * @return {anychart.ui.Scroller}
 */
anychart.ui.scroller = function() {
  var res = new anychart.ui.Scroller();
  res.setup(anychart.getFullTheme()['standalones']['scroller']);
  return res;
};


//exports
goog.exportSymbol('anychart.ui.scroller', anychart.ui.scroller);
anychart.ui.Scroller.prototype['setRange'] = anychart.ui.Scroller.prototype.setRange;
anychart.ui.Scroller.prototype['startRatio'] = anychart.ui.Scroller.prototype.startRatio;
anychart.ui.Scroller.prototype['endRatio'] = anychart.ui.Scroller.prototype.endRatio;
anychart.ui.Scroller.prototype['parentBounds'] = anychart.ui.Scroller.prototype.parentBounds;
anychart.ui.Scroller.prototype['getRemainingBounds'] = anychart.ui.Scroller.prototype.getRemainingBounds;
anychart.ui.Scroller.prototype['container'] = anychart.ui.Scroller.prototype.container;
anychart.ui.Scroller.prototype['padding'] = anychart.ui.Scroller.prototype.padding;
anychart.ui.Scroller.prototype['draw'] = anychart.ui.Scroller.prototype.draw;
