goog.provide('anychart.annotationsModule.Rectangle');
goog.require('anychart.annotationsModule');
goog.require('anychart.annotationsModule.Base');
goog.require('anychart.core.settings');
goog.require('anychart.enums');



/**
 * Rectangle annotation.
 * @param {!anychart.annotationsModule.ChartController} chartController
 * @constructor
 * @extends {anychart.annotationsModule.Base}
 */
anychart.annotationsModule.Rectangle = function(chartController) {
  anychart.annotationsModule.Rectangle.base(this, 'constructor', chartController);

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

  /**
   * Fill resolver.
   * @param {anychart.annotationsModule.Base} annotation
   * @param {number} state
   * @return {acgraph.vector.Fill}
   * @private
   */
  this.fillResolver_ = /** @type {function(anychart.annotationsModule.Base,number):acgraph.vector.Fill} */(
      anychart.annotationsModule.Base.getColorResolver('fill', anychart.enums.ColorType.FILL, true));

  /**
   * Hatch fill resolver.
   * @param {anychart.annotationsModule.Base} annotation
   * @param {number} state
   * @return {acgraph.vector.PatternFill}
   * @private
   */
  this.hatchFillResolver_ = /** @type {function(anychart.annotationsModule.Base,number):acgraph.vector.PatternFill} */(
      anychart.annotationsModule.Base.getColorResolver('hatchFill', anychart.enums.ColorType.HATCH_FILL, true));
  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, anychart.annotationsModule.X_ANCHOR_DESCRIPTORS_META);
  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, anychart.annotationsModule.VALUE_ANCHOR_DESCRIPTORS_META);
  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, anychart.annotationsModule.SECOND_ANCHOR_POINT_DESCRIPTORS_META);
};
goog.inherits(anychart.annotationsModule.Rectangle, anychart.annotationsModule.Base);
anychart.core.settings.populateAliases(anychart.annotationsModule.Rectangle, ['fill', 'hatchFill', 'stroke'], 'normal');
anychart.core.settings.populate(anychart.annotationsModule.Rectangle, anychart.annotationsModule.X_ANCHOR_DESCRIPTORS);
anychart.core.settings.populate(anychart.annotationsModule.Rectangle, anychart.annotationsModule.VALUE_ANCHOR_DESCRIPTORS);
anychart.core.settings.populate(anychart.annotationsModule.Rectangle, anychart.annotationsModule.SECOND_ANCHOR_POINT_DESCRIPTORS);
anychart.annotationsModule.AnnotationTypes[anychart.enums.AnnotationTypes.RECTANGLE] = anychart.annotationsModule.Rectangle;


//region Properties
//----------------------------------------------------------------------------------------------------------------------
//
//  Properties
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.annotationsModule.Rectangle.prototype.type = anychart.enums.AnnotationTypes.RECTANGLE;


/**
 * Supported anchors.
 * @type {anychart.annotationsModule.AnchorSupport}
 */
anychart.annotationsModule.Rectangle.prototype.SUPPORTED_ANCHORS = anychart.annotationsModule.AnchorSupport.TWO_POINTS;


//endregion
//region State settings
/** @inheritDoc */
anychart.annotationsModule.Rectangle.prototype.getNormalDescriptorsMeta = function() {
  var base = anychart.annotationsModule.Rectangle.base(this, 'getNormalDescriptorsMeta');
  return goog.array.concat(base, anychart.annotationsModule.FILL_STROKE_DESCRIPTORS_META);
};


//endregion
//region Drawing
//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.annotationsModule.Rectangle.prototype.ensureCreated = function() {
  anychart.annotationsModule.Rectangle.base(this, 'ensureCreated');

  if (!this.paths_) {
    // main, hatch, hover
    this.paths_ = [this.rootLayer.path(), this.rootLayer.path(), this.rootLayer.path()];
    this.paths_[0].zIndex(anychart.annotationsModule.Base.SHAPES_ZINDEX);
    this.paths_[1].zIndex(anychart.annotationsModule.Base.HATCH_ZINDEX);
    this.paths_[2].zIndex(anychart.annotationsModule.Base.HOVER_SHAPE_ZINDEX);
  }
};


/** @inheritDoc */
anychart.annotationsModule.Rectangle.prototype.drawOnePointShape = function(x, y) {
  for (var i = 0; i < this.paths_.length; i++) {
    var path = this.paths_[i];
    path.clear();
    path.moveTo(x, y).lineTo(x, y);
  }
};


/** @inheritDoc */
anychart.annotationsModule.Rectangle.prototype.drawTwoPointsShape = function(x1, y1, x2, y2) {
  var thickness = anychart.utils.extractThickness(/** @type {acgraph.vector.Stroke} */(this.paths_[0].stroke()));
  x1 = anychart.utils.applyPixelShift(x1, thickness);
  y1 = anychart.utils.applyPixelShift(y1, thickness);
  x2 = anychart.utils.applyPixelShift(x2, thickness);
  y2 = anychart.utils.applyPixelShift(y2, thickness);
  for (var i = 0; i < this.paths_.length; i++) {
    var path = this.paths_[i];
    path.clear();
    path.moveTo(x1, y1)
        .lineTo(x2, y1)
        .lineTo(x2, y2)
        .lineTo(x1, y2)
        .close();
  }
};


/** @inheritDoc */
anychart.annotationsModule.Rectangle.prototype.colorize = function(state) {
  anychart.annotationsModule.Rectangle.base(this, 'colorize', state);
  this.paths_[0].stroke(this.strokeResolver_(this, state));
  this.paths_[0].fill(this.fillResolver_(this, state));
  this.paths_[1]
      .stroke(null)
      .fill(this.hatchFillResolver_(this, state));
  this.paths_[2]
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
anychart.annotationsModule.Rectangle.prototype.serialize = function() {
  var json = anychart.annotationsModule.Rectangle.base(this, 'serialize');

  anychart.core.settings.serialize(this, anychart.annotationsModule.X_ANCHOR_DESCRIPTORS, json, 'Annotation');
  anychart.core.settings.serialize(this, anychart.annotationsModule.VALUE_ANCHOR_DESCRIPTORS, json, 'Annotation');
  anychart.core.settings.serialize(this, anychart.annotationsModule.SECOND_ANCHOR_POINT_DESCRIPTORS, json, 'Annotation');

  return json;
};


/** @inheritDoc */
anychart.annotationsModule.Rectangle.prototype.setupByJSON = function(config, opt_default) {
  anychart.annotationsModule.Rectangle.base(this, 'setupByJSON', config, opt_default);

  anychart.core.settings.deserialize(this, anychart.annotationsModule.X_ANCHOR_DESCRIPTORS, config);
  anychart.core.settings.deserialize(this, anychart.annotationsModule.VALUE_ANCHOR_DESCRIPTORS, config);
  anychart.core.settings.deserialize(this, anychart.annotationsModule.SECOND_ANCHOR_POINT_DESCRIPTORS, config);
};


/** @inheritDoc */
anychart.annotationsModule.Rectangle.prototype.disposeInternal = function() {
  anychart.annotationsModule.Rectangle.base(this, 'disposeInternal');

  goog.disposeAll(this.paths_);
  delete this.strokeResolver_;
  delete this.fillResolver_;
  delete this.hatchFillResolver_;
};
//endregion
