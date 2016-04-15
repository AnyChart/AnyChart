goog.provide('anychart.core.map.projections.TwinProjection');
goog.require('anychart.core.map.projections.Base');



/**
 * Twin projection.
 * @param {anychart.core.map.projections.Base} curProjection Source projection.
 * @param {anychart.core.map.projections.Base} destProjection Destination projection.
 * @param {number=} opt_ratio Ratio[0..1].
 * @extends {anychart.core.map.projections.Base}
 * @constructor
 */
anychart.core.map.projections.TwinProjection = function(curProjection, destProjection, opt_ratio) {
  anychart.core.map.projections.TwinProjection.base(this, 'constructor');

  this.ratio_ = opt_ratio || 0;
  this.curProjection = curProjection;
  this.destProjection = destProjection;
};
goog.inherits(anychart.core.map.projections.TwinProjection, anychart.core.map.projections.Base);


/**
 * Ratio from 0 to 1.
 * @param {number=} opt_value .
 * @return {anychart.core.map.projections.TwinProjection|number}
 */
anychart.core.map.projections.TwinProjection.prototype.ratio = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.toNumber(opt_value) || 0;
    if (this.ratio_ != opt_value) {
      this.ratio_ = opt_value;
    }
    return this;
  }

  return this.ratio_;
};


/** @inheritDoc */
anychart.core.map.projections.TwinProjection.prototype.forward = function(x, y) {
  var p0 = this.curProjection.forward(x, y);
  var p1 = this.destProjection.forward(x, y);

  x = (1 - this.ratio_) * p0[0] + this.ratio_ * p1[0];
  y = (1 - this.ratio_) * p0[1] + this.ratio_ * p1[1];

  return [x, y];
};


/** @inheritDoc */
anychart.core.map.projections.TwinProjection.prototype.invert = function(x, y) {
  var p0 = this.curProjection.invert(x, y);
  var p1 = this.destProjection.invert(x, y);

  x = (1 - this.ratio_) * p0[0] + this.ratio_ * p1[0];
  y = (1 - this.ratio_) * p0[1] + this.ratio_ * p1[1];

  return [x, y];
};
