goog.provide('anychart.core.annotations.Line');
goog.require('anychart.core.annotations');
goog.require('anychart.core.annotations.Base');
goog.require('anychart.core.settings');
goog.require('anychart.enums');



/**
 * Line annotation.
 * @param {!anychart.core.annotations.ChartController} chartController
 * @constructor
 * @extends {anychart.core.annotations.Base}
 */
anychart.core.annotations.Line = function(chartController) {
  anychart.core.annotations.Line.base(this, 'constructor', chartController);

  /**
   * Paths array.
   * @type {Array.<acgraph.vector.Path>}
   * @private
   */
  this.paths_ = null;

  /**
   * Stroke resolver.
   * @param {anychart.core.annotations.Base} annotation
   * @param {number} state
   * @return {acgraph.vector.Stroke}
   * @private
   */
  this.strokeResolver_ = /** @type {function(anychart.core.annotations.Base,number):acgraph.vector.Stroke} */(
      anychart.core.annotations.Base.getColorResolver(
          ['stroke', 'hoverStroke', 'selectStroke'],
          anychart.enums.ColorType.STROKE));
};
goog.inherits(anychart.core.annotations.Line, anychart.core.annotations.Base);
anychart.core.settings.populate(anychart.core.annotations.Line, anychart.core.annotations.X_ANCHOR_DESCRIPTORS);
anychart.core.settings.populate(anychart.core.annotations.Line, anychart.core.annotations.VALUE_ANCHOR_DESCRIPTORS);
anychart.core.settings.populate(anychart.core.annotations.Line, anychart.core.annotations.SECOND_ANCHOR_POINT_DESCRIPTORS);
anychart.core.settings.populate(anychart.core.annotations.Line, anychart.core.annotations.STROKE_DESCRIPTORS);
anychart.core.annotations.AnnotationTypes[anychart.enums.AnnotationTypes.LINE] = anychart.core.annotations.Line;


//region Properties
//----------------------------------------------------------------------------------------------------------------------
//
//  Properties
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.annotations.Line.prototype.type = anychart.enums.AnnotationTypes.LINE;


/**
 * Supported anchors.
 * @type {anychart.core.annotations.AnchorSupport}
 */
anychart.core.annotations.Line.prototype.SUPPORTED_ANCHORS = anychart.core.annotations.AnchorSupport.TWO_POINTS;
//endregion


//region Drawing
//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.annotations.Line.prototype.ensureCreated = function() {
  anychart.core.annotations.Line.base(this, 'ensureCreated');

  if (!this.paths_) {
    // main, hatch, hover
    this.paths_ = [this.rootLayer.path(), this.rootLayer.path()];
    this.paths_[0].zIndex(anychart.core.annotations.Base.SHAPES_ZINDEX);
    this.paths_[1].zIndex(anychart.core.annotations.Base.HOVER_SHAPE_ZINDEX);
  }
};


/** @inheritDoc */
anychart.core.annotations.Line.prototype.drawOnePointShape = function(x, y) {
  for (var i = 0; i < this.paths_.length; i++) {
    var path = this.paths_[i];
    path.clear();
    path.moveTo(x, y).lineTo(x, y);
  }
};


/** @inheritDoc */
anychart.core.annotations.Line.prototype.drawTwoPointsShape = function(x1, y1, x2, y2) {
  var thickness = anychart.utils.extractThickness(/** @type {acgraph.vector.Stroke} */(this.paths_[0].stroke()));
  if (x1 == x2) {
    x1 = x2 = anychart.utils.applyPixelShift(x1, thickness);
  }
  if (y1 == y2) {
    y1 = y2 = anychart.utils.applyPixelShift(y1, thickness);
  }
  var line = anychart.math.clipSegmentByRect(x1, y1, x2, y2, this.pixelBoundsCache);

  for (var i = 0; i < this.paths_.length; i++) {
    var path = this.paths_[i];
    path.clear();
    if (line)
      path.moveTo(line[0], line[1]).lineTo(line[2], line[3]);
  }
};


/** @inheritDoc */
anychart.core.annotations.Line.prototype.colorize = function(state) {
  anychart.core.annotations.Line.base(this, 'colorize', state);
  this.paths_[0]
      .fill(null)
      .stroke(this.strokeResolver_(this, state));
  this.paths_[1]
      .fill(anychart.color.TRANSPARENT_HANDLER)
      .stroke(/** @type {acgraph.vector.SolidFill} */(anychart.color.TRANSPARENT_HANDLER), this['hoverGap']() * 2);
};
//endregion


//region Serialization / Deserialization / Disposing
//----------------------------------------------------------------------------------------------------------------------
//
//  Serialization / Deserialization / Disposing
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.annotations.Line.prototype.serialize = function() {
  var json = anychart.core.annotations.Line.base(this, 'serialize');

  anychart.core.settings.serialize(this, anychart.core.annotations.STROKE_DESCRIPTORS, json, 'Annotation');
  anychart.core.settings.serialize(this, anychart.core.annotations.X_ANCHOR_DESCRIPTORS, json, 'Annotation');
  anychart.core.settings.serialize(this, anychart.core.annotations.VALUE_ANCHOR_DESCRIPTORS, json, 'Annotation');
  anychart.core.settings.serialize(this, anychart.core.annotations.SECOND_ANCHOR_POINT_DESCRIPTORS, json, 'Annotation');

  return json;
};


/** @inheritDoc */
anychart.core.annotations.Line.prototype.setupByJSON = function(config, opt_default) {

  anychart.core.settings.deserialize(this, anychart.core.annotations.STROKE_DESCRIPTORS, config);
  anychart.core.settings.deserialize(this, anychart.core.annotations.X_ANCHOR_DESCRIPTORS, config);
  anychart.core.settings.deserialize(this, anychart.core.annotations.VALUE_ANCHOR_DESCRIPTORS, config);
  anychart.core.settings.deserialize(this, anychart.core.annotations.SECOND_ANCHOR_POINT_DESCRIPTORS, config);

  anychart.core.annotations.Line.base(this, 'setupByJSON', config, opt_default);
};


/** @inheritDoc */
anychart.core.annotations.Line.prototype.disposeInternal = function() {
  anychart.core.annotations.Line.base(this, 'disposeInternal');

  goog.disposeAll(this.paths_);
  delete this.strokeResolver_;
};
//endregion
