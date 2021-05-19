goog.provide('anychart.surfaceModule.markers.droplines.Dropline');

goog.require('anychart.core.VisualBase');



/**
 * Drawable dropline.
 * Dropline represented as line that drawn from point coordinate into chart z minimum.
 *
 * @param {anychart.surfaceModule.markers.droplines.Controller} controller
 *
 * @constructor
 * @extends {anychart.core.VisualBase}
 */
anychart.surfaceModule.markers.droplines.Dropline = function(controller) {
  anychart.surfaceModule.markers.droplines.Dropline.base(this, 'constructor');

  /**
   * Dropline controller reference.
   *
   * @type {anychart.surfaceModule.markers.droplines.Controller}
   * @private
   */
  this.controller_ = controller;

  /**
   * Path used for dropline drawing.
   *
   * @type {acgraph.vector.Path}
   * @private
   */
  this.path_ = acgraph.path();
};
goog.inherits(anychart.surfaceModule.markers.droplines.Dropline, anychart.core.VisualBase);


//region --- Drawing
/**
 * Draw line.
 *
 * @private
 */
anychart.surfaceModule.markers.droplines.Dropline.prototype.drawLine_ = function() {
  this.path_.moveTo(this.coordinates_.from[1], this.coordinates_.from[2]);
  this.path_.lineTo(this.coordinates_.to[1], this.coordinates_.to[2]);
};


/**
 * Apply dropline appearance.
 *
 * @private
 */
anychart.surfaceModule.markers.droplines.Dropline.prototype.applyAppearance_ = function() {
  this.path_.stroke(this.controller_.resolveColor(this));
};


/**
 * Draw dropline.
 */
anychart.surfaceModule.markers.droplines.Dropline.prototype.draw = function() {
  if (this.controller_.getOption('enabled')) {
    this.path_.clear();
    this.path_.parent(/**@type {acgraph.vector.Layer}*/(this.container()));
    this.drawLine_();
    this.applyAppearance_();
  } else {
    this.path_.parent(null);
  }
};


//endregion
//region --- Setters/Getters
/**
 * Getter/Setter for dropline coordinates.
 *
 * @param {{
 *   from: Array.<number>,
 *   to: Array.<number>
 * }=} opt_coordinates - Object that contains coordinates for line drawing.
 *
 * @return {{
 *   from: Array.<number>,
 *   to: Array.<number>
 * } | anychart.surfaceModule.markers.droplines.Dropline}
 */
anychart.surfaceModule.markers.droplines.Dropline.prototype.coordinates = function(opt_coordinates) {
  if (opt_coordinates) {
    this.coordinates_ = opt_coordinates;
    return this;
  }

  return this.coordinates_;
};


//endregion
//region --- Dispose
/**
 * Dispose created dom elements.
 */
anychart.surfaceModule.markers.droplines.Dropline.prototype.disposeInternal = function() {
  goog.dispose(this.path_);
  this.path_ = null;

  anychart.surfaceModule.markers.droplines.Dropline.base(this, 'disposeInternal');
};
//endregion
