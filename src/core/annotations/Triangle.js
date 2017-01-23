goog.provide('anychart.core.annotations.Triangle');
goog.require('anychart.core.annotations');
goog.require('anychart.core.annotations.Base');
goog.require('anychart.core.settings');
goog.require('anychart.enums');



/**
 * Triangle annotation.
 * @param {!anychart.core.annotations.ChartController} chartController
 * @constructor
 * @extends {anychart.core.annotations.Base}
 */
anychart.core.annotations.Triangle = function(chartController) {
  anychart.core.annotations.Triangle.base(this, 'constructor', chartController);

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

  /**
   * Fill resolver.
   * @param {anychart.core.annotations.Base} annotation
   * @param {number} state
   * @return {acgraph.vector.Fill}
   * @private
   */
  this.fillResolver_ = /** @type {function(anychart.core.annotations.Base,number):acgraph.vector.Fill} */(
      anychart.core.annotations.Base.getColorResolver(
          ['fill', 'hoverFill', 'selectFill'],
          anychart.enums.ColorType.FILL));

  /**
   * Hatch fill resolver.
   * @param {anychart.core.annotations.Base} annotation
   * @param {number} state
   * @return {acgraph.vector.PatternFill}
   * @private
   */
  this.hatchFillResolver_ = /** @type {function(anychart.core.annotations.Base,number):acgraph.vector.PatternFill} */(
      anychart.core.annotations.Base.getColorResolver(
          ['hatchFill', 'hoverHatchFill', 'selectHatchFill'],
          anychart.enums.ColorType.HATCH_FILL));
};
goog.inherits(anychart.core.annotations.Triangle, anychart.core.annotations.Base);
anychart.core.settings.populate(anychart.core.annotations.Triangle, anychart.core.annotations.X_ANCHOR_DESCRIPTORS);
anychart.core.settings.populate(anychart.core.annotations.Triangle, anychart.core.annotations.VALUE_ANCHOR_DESCRIPTORS);
anychart.core.settings.populate(anychart.core.annotations.Triangle, anychart.core.annotations.SECOND_ANCHOR_POINT_DESCRIPTORS);
anychart.core.settings.populate(anychart.core.annotations.Triangle, anychart.core.annotations.THIRD_ANCHOR_POINT_DESCRIPTORS);
anychart.core.settings.populate(anychart.core.annotations.Triangle, anychart.core.annotations.STROKE_DESCRIPTORS);
anychart.core.settings.populate(anychart.core.annotations.Triangle, anychart.core.annotations.FILL_DESCRIPTORS);
anychart.core.annotations.AnnotationTypes[anychart.enums.AnnotationTypes.TRIANGLE] = anychart.core.annotations.Triangle;


//region Properties
//----------------------------------------------------------------------------------------------------------------------
//
//  Properties
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.annotations.Triangle.prototype.type = anychart.enums.AnnotationTypes.TRIANGLE;


/**
 * Supported anchors.
 * @type {anychart.core.annotations.AnchorSupport}
 */
anychart.core.annotations.Triangle.prototype.SUPPORTED_ANCHORS = anychart.core.annotations.AnchorSupport.THREE_POINTS;
//endregion


//region Drawing
//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.annotations.Triangle.prototype.ensureCreated = function() {
  anychart.core.annotations.Triangle.base(this, 'ensureCreated');

  if (!this.paths_) {
    // main, hatch, hover
    this.paths_ = [this.rootLayer.path(), this.rootLayer.path(), this.rootLayer.path()];
    this.paths_[0].zIndex(anychart.core.annotations.Base.SHAPES_ZINDEX);
    this.paths_[1].zIndex(anychart.core.annotations.Base.HATCH_ZINDEX);
    this.paths_[2].zIndex(anychart.core.annotations.Base.HOVER_SHAPE_ZINDEX);
  }
};


/** @inheritDoc */
anychart.core.annotations.Triangle.prototype.drawOnePointShape = function(x, y) {
  for (var i = 0; i < this.paths_.length; i++) {
    var path = this.paths_[i];
    path.clear();
    path.moveTo(x, y).lineTo(x, y);
  }
};


/** @inheritDoc */
anychart.core.annotations.Triangle.prototype.drawTwoPointsShape = function(firstX, firstY, secondX, secondY) {
  for (var i = 0; i < this.paths_.length; i++) {
    var path = this.paths_[i];
    path.clear();
    path.moveTo(firstX, firstY).lineTo(secondX, secondY);
  }
};


/** @inheritDoc */
anychart.core.annotations.Triangle.prototype.drawThreePointsShape = function(firstX, firstY, secondX, secondY, thirdX, thirdY) {
  for (var i = 0; i < this.paths_.length; i++) {
    var path = this.paths_[i];
    path.clear();
    path.moveTo(firstX, firstY).lineTo(secondX, secondY).lineTo(thirdX, thirdY).close();
  }
};


/** @inheritDoc */
anychart.core.annotations.Triangle.prototype.colorize = function(state) {
  anychart.core.annotations.Triangle.base(this, 'colorize', state);
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
anychart.core.annotations.Triangle.prototype.serialize = function() {
  var json = anychart.core.annotations.Triangle.base(this, 'serialize');

  anychart.core.settings.serialize(this, anychart.core.annotations.FILL_DESCRIPTORS, json, 'Annotation');
  anychart.core.settings.serialize(this, anychart.core.annotations.STROKE_DESCRIPTORS, json, 'Annotation');
  anychart.core.settings.serialize(this, anychart.core.annotations.X_ANCHOR_DESCRIPTORS, json, 'Annotation');
  anychart.core.settings.serialize(this, anychart.core.annotations.VALUE_ANCHOR_DESCRIPTORS, json, 'Annotation');
  anychart.core.settings.serialize(this, anychart.core.annotations.SECOND_ANCHOR_POINT_DESCRIPTORS, json, 'Annotation');
  anychart.core.settings.serialize(this, anychart.core.annotations.THIRD_ANCHOR_POINT_DESCRIPTORS, json, 'Annotation');

  return json;
};


/** @inheritDoc */
anychart.core.annotations.Triangle.prototype.setupByJSON = function(config, opt_default) {

  anychart.core.settings.deserialize(this, anychart.core.annotations.FILL_DESCRIPTORS, config);
  anychart.core.settings.deserialize(this, anychart.core.annotations.STROKE_DESCRIPTORS, config);
  anychart.core.settings.deserialize(this, anychart.core.annotations.X_ANCHOR_DESCRIPTORS, config);
  anychart.core.settings.deserialize(this, anychart.core.annotations.VALUE_ANCHOR_DESCRIPTORS, config);
  anychart.core.settings.deserialize(this, anychart.core.annotations.SECOND_ANCHOR_POINT_DESCRIPTORS, config);
  anychart.core.settings.deserialize(this, anychart.core.annotations.THIRD_ANCHOR_POINT_DESCRIPTORS, config);

  anychart.core.annotations.Triangle.base(this, 'setupByJSON', config, opt_default);
};


/** @inheritDoc */
anychart.core.annotations.Triangle.prototype.disposeInternal = function() {
  anychart.core.annotations.Triangle.base(this, 'disposeInternal');

  goog.disposeAll(this.paths_);
  delete this.strokeResolver_;
  delete this.fillResolver_;
  delete this.hatchFillResolver_;
};
//endregion
