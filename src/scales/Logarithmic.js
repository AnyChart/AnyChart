goog.provide('anychart.scales.Logarithmic');

goog.require('anychart.math');
goog.require('anychart.scales.Linear');



/**
 * @constructor
 * @extends {anychart.scales.Linear}
 */
anychart.scales.Logarithmic = function() {
  goog.base(this);
};
goog.inherits(anychart.scales.Logarithmic, anychart.scales.Linear);


/** @inheritDoc */
anychart.scales.Logarithmic.prototype.transform = function(value, opt_subRangeRatio) {
  this.calculate();
  var result = (anychart.math.log(/** @type {number} */(value)) - anychart.math.log(this.min)) / this.range;
  return this.isInverted ? 1 - result : result;
};


/** @inheritDoc */
anychart.scales.Logarithmic.prototype.inverseTransform = function(ratio) {
  this.calculate();
  return ratio * this.range + this.min;
};


/** @inheritDoc */
anychart.scales.Logarithmic.prototype.calculate = function() {
  goog.base(this, 'calculate');
  this.range = anychart.math.log(this.max) - anychart.math.log(this.min);
};


//----------------------------------------------------------------------------------------------------------------------
//  Shortcut functions
//----------------------------------------------------------------------------------------------------------------------
/**
 * Shortcut way to create logarithmic scale.
 * @return {anychart.scales.Logarithmic} Logarithmic scale.
 */
anychart.scales.log = function() {
  return new anychart.scales.Logarithmic();
};
