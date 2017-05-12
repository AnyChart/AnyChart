goog.provide('anychart.core.utils.Crossing');
goog.require('anychart.core.Base');



/**
 * Settings class for crossing.
 * @extends {anychart.core.Base}
 * @constructor
 */
anychart.core.utils.Crossing = function() {
  anychart.core.utils.Crossing.base(this, 'constructor');
};
goog.inherits(anychart.core.utils.Crossing, anychart.core.Base);


//region --- infrastructure
/** @inheritDoc */
anychart.core.utils.Crossing.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.Base.prototype.SUPPORTED_CONSISTENCY_STATES;


/** @inheritDoc */
anychart.core.utils.Crossing.prototype.SUPPORTED_SIGNALS =
    anychart.core.Base.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.NEEDS_REDRAW;


//endregion
//region --- api
/**
 * Getter/setter for crosslines stroke.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.core.utils.Crossing|acgraph.vector.Stroke} .
 */
anychart.core.utils.Crossing.prototype.stroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var stroke = acgraph.vector.normalizeStroke.apply(null, arguments);
    if (stroke != this.stroke_) {
      this.stroke_ = stroke;
      this.dispatchSignal(anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.stroke_;
};


//endregion
//region --- setup/dispose
/** @inheritDoc */
anychart.core.utils.Crossing.prototype.serialize = function() {
  var json = anychart.core.utils.Crossing.base(this, 'serialize');
  json['stroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.stroke()));
  return json;
};


/** @inheritDoc */
anychart.core.utils.Crossing.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.utils.Crossing.base(this, 'setupByJSON', config, opt_default);
  this.stroke(config['stroke']);
};


/** @inheritDoc */
anychart.core.utils.Crossing.prototype.disposeInternal = function() {
  this.stroke_ = null;
  anychart.core.utils.Crossing.base(this, 'disposeInternal');
};
//endregion
