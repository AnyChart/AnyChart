goog.provide('anychart.annotationsModule.VerticalLine');
goog.require('anychart.annotationsModule');
goog.require('anychart.annotationsModule.Base');
goog.require('anychart.core.settings');
goog.require('anychart.enums');



/**
 * VerticalLine annotation.
 * @param {!anychart.annotationsModule.ChartController} chartController
 * @constructor
 * @extends {anychart.annotationsModule.Base}
 */
anychart.annotationsModule.VerticalLine = function(chartController) {
  anychart.annotationsModule.VerticalLine.base(this, 'constructor', chartController);

  /**
   * Paths array.
   * @type {Array.<acgraph.vector.Path>}
   * @private
   */
  this.paths_ = null;

  /**
   * Stroke resolver.
   * @param {anychart.annotationsModule.Base} annotation
   * @param {number} state
   * @return {acgraph.vector.Stroke}
   * @private
   */
  this.strokeResolver_ = /** @type {function(anychart.annotationsModule.Base,number):acgraph.vector.Stroke} */(
      anychart.annotationsModule.Base.getColorResolver('stroke', anychart.enums.ColorType.STROKE, true));
  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, anychart.annotationsModule.X_ANCHOR_DESCRIPTORS_META);
};
goog.inherits(anychart.annotationsModule.VerticalLine, anychart.annotationsModule.Base);
anychart.core.settings.populateAliases(anychart.annotationsModule.VerticalLine, ['stroke'], 'normal');
anychart.core.settings.populate(anychart.annotationsModule.VerticalLine, anychart.annotationsModule.X_ANCHOR_DESCRIPTORS);
anychart.annotationsModule.AnnotationTypes[anychart.enums.AnnotationTypes.VERTICAL_LINE] = anychart.annotationsModule.VerticalLine;


//region Properties
//----------------------------------------------------------------------------------------------------------------------
//
//  Properties
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.annotationsModule.VerticalLine.prototype.type = anychart.enums.AnnotationTypes.VERTICAL_LINE;


/**
 * Supported anchors.
 * @type {anychart.annotationsModule.AnchorSupport}
 */
anychart.annotationsModule.VerticalLine.prototype.SUPPORTED_ANCHORS = anychart.annotationsModule.AnchorSupport.X;


//endregion
//region State settings
/** @inheritDoc */
anychart.annotationsModule.VerticalLine.prototype.getNormalDescriptorsMeta = function() {
  var base = anychart.annotationsModule.VerticalLine.base(this, 'getNormalDescriptorsMeta');
  return goog.array.concat(base, anychart.annotationsModule.STROKE_DESCRIPTORS_META);
};


//endregion
//region Drawing
//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.annotationsModule.VerticalLine.prototype.ensureCreated = function() {
  anychart.annotationsModule.VerticalLine.base(this, 'ensureCreated');

  if (!this.paths_) {
    // main, hatch, hover
    this.paths_ = [this.rootLayer.path(), this.rootLayer.path()];
    this.paths_[0].zIndex(anychart.annotationsModule.Base.SHAPES_ZINDEX);
    this.paths_[1].zIndex(anychart.annotationsModule.Base.HOVER_SHAPE_ZINDEX);
  }
};


/** @inheritDoc */
anychart.annotationsModule.VerticalLine.prototype.drawOnePointShape = function(x, y) {
  x = anychart.utils.applyPixelShift(x, anychart.utils.extractThickness(
      /** @type {acgraph.vector.Stroke} */(this.paths_[0].stroke())));
  for (var i = 0; i < this.paths_.length; i++) {
    var path = this.paths_[i];
    path.clear();
    path.moveTo(x, this.pixelBoundsCache.top).lineTo(x, this.pixelBoundsCache.getBottom());
  }
};


/** @inheritDoc */
anychart.annotationsModule.VerticalLine.prototype.colorize = function(state) {
  anychart.annotationsModule.VerticalLine.base(this, 'colorize', state);
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
anychart.annotationsModule.VerticalLine.prototype.serialize = function() {
  var json = anychart.annotationsModule.VerticalLine.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.annotationsModule.X_ANCHOR_DESCRIPTORS, json, 'Annotation');
  return json;
};


/** @inheritDoc */
anychart.annotationsModule.VerticalLine.prototype.setupByJSON = function(config, opt_default) {
  anychart.annotationsModule.VerticalLine.base(this, 'setupByJSON', config, opt_default);
  anychart.core.settings.deserialize(this, anychart.annotationsModule.X_ANCHOR_DESCRIPTORS, config);
};


/** @inheritDoc */
anychart.annotationsModule.VerticalLine.prototype.disposeInternal = function() {
  anychart.annotationsModule.VerticalLine.base(this, 'disposeInternal');

  goog.disposeAll(this.paths_);
  delete this.strokeResolver_;
};
//endregion
