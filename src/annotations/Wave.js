goog.provide('anychart.annotationsModule.Wave');
goog.require('anychart.annotationsModule');
goog.require('anychart.annotationsModule.Base');
goog.require('anychart.core.settings');
goog.require('anychart.enums');



/**
 * Wave annotation.
 * @param {!anychart.annotationsModule.ChartController} chartController
 * @constructor
 * @extends {anychart.annotationsModule.Base}
 */
anychart.annotationsModule.Wave = function(chartController) {
  anychart.annotationsModule.Wave.base(this, 'constructor', chartController);

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
  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, anychart.annotationsModule.VALUE_ANCHOR_DESCRIPTORS_META);
  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, anychart.annotationsModule.SECOND_ANCHOR_POINT_DESCRIPTORS_META);
  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, anychart.annotationsModule.THIRD_ANCHOR_POINT_DESCRIPTORS_META);
  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, anychart.annotationsModule.FOURTH_ANCHOR_POINT_DESCRIPTORS_META);
};
goog.inherits(anychart.annotationsModule.Wave, anychart.annotationsModule.Base);
anychart.core.settings.populateAliases(anychart.annotationsModule.Wave, ['fill', 'stroke'], 'normal');
anychart.core.settings.populate(anychart.annotationsModule.Wave, anychart.annotationsModule.X_ANCHOR_DESCRIPTORS);
anychart.core.settings.populate(anychart.annotationsModule.Wave, anychart.annotationsModule.VALUE_ANCHOR_DESCRIPTORS);
anychart.core.settings.populate(anychart.annotationsModule.Wave, anychart.annotationsModule.SECOND_ANCHOR_POINT_DESCRIPTORS);
anychart.core.settings.populate(anychart.annotationsModule.Wave, anychart.annotationsModule.THIRD_ANCHOR_POINT_DESCRIPTORS);
anychart.core.settings.populate(anychart.annotationsModule.Wave, anychart.annotationsModule.FOURTH_ANCHOR_POINT_DESCRIPTORS);
anychart.annotationsModule.AnnotationTypes[anychart.enums.AnnotationTypes.WAVE] = anychart.annotationsModule.Wave;


//region Properties
//----------------------------------------------------------------------------------------------------------------------
//
//  Properties
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.annotationsModule.Wave.prototype.type = anychart.enums.AnnotationTypes.WAVE;


/**
 * Supported anchors.
 * @type {anychart.annotationsModule.AnchorSupport}
 */
anychart.annotationsModule.Wave.prototype.SUPPORTED_ANCHORS = anychart.annotationsModule.AnchorSupport.FOUR_POINTS;


//endregion
//region State settings
/** @inheritDoc */
anychart.annotationsModule.Wave.prototype.getNormalDescriptorsMeta = function() {
  var base = anychart.annotationsModule.Wave.base(this, 'getNormalDescriptorsMeta');
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
anychart.annotationsModule.Wave.prototype.ensureCreated = function() {
  anychart.annotationsModule.Wave.base(this, 'ensureCreated');

  if (!this.paths_) {
    // main, hover
    this.paths_ = [this.rootLayer.path(), this.rootLayer.path()];
    this.paths_[0].zIndex(anychart.annotationsModule.Base.SHAPES_ZINDEX);
    this.paths_[1].zIndex(anychart.annotationsModule.Base.HOVER_SHAPE_ZINDEX);
  }
};


/** @inheritDoc */
anychart.annotationsModule.Wave.prototype.drawOnePointShape = function(x, y) {
  for (var i = 0; i < this.paths_.length; i++) {
    var path = this.paths_[i];
    path.clear();
    path.moveTo(x, y).lineTo(x, y);
  }
};


/** @inheritDoc */
anychart.annotationsModule.Wave.prototype.drawTwoPointsShape = function(x1, y1, x2, y2) {
  for (var i = 0; i < this.paths_.length; i++) {
    var path = this.paths_[i];
    path.clear();
    path.moveTo(x1, y1).lineTo(x2, y2);
  }
};


/** @inheritDoc */
anychart.annotationsModule.Wave.prototype.drawThreePointsShape = function(x1, y1, x2, y2, x3, y3) {
  for (var i = 0; i < this.paths_.length; i++) {
    var path = this.paths_[i];
    path.clear();
    path.moveTo(x1, y1).lineTo(x2, y2).lineTo(x3, y3);
  }
};


/** @inheritDoc */
anychart.annotationsModule.Wave.prototype.drawFourPointsShape = function(x1, y1, x2, y2, x3, y3, x4, y4) {
  // arrow median point (sits on the last segment, 10% of its length)
  var axm = x4 - (x4 - x3) * 0.1;
  var aym = y4 - (y4 - y3) * 0.1;

  // arrow corners (rotate median segment by 30° -> PI/6 in radians)
  var ax1 = Math.cos(Math.PI / 6) * (x4 - axm) - Math.sin(Math.PI / 6) * (y4 - aym);
  var ay1 = Math.sin(Math.PI / 6) * (x4 - axm) + Math.cos(Math.PI / 6) * (y4 - aym);

  var ax2 = Math.cos(Math.PI / -6) * (x4 - axm) - Math.sin(Math.PI / -6) * (y4 - aym);
  var ay2 = Math.sin(Math.PI / -6) * (x4 - axm) + Math.cos(Math.PI / -6) * (y4 - aym);

  for (var i = 0; i < this.paths_.length; i++) {
    var path = this.paths_[i];
    path.clear();
    // 3 segment wave
    path.moveTo(x1, y1)
        .lineTo(x2, y2)
        .lineTo(x3, y3)
        .lineTo(x4, y4);

    // arrow tip
    path.moveTo(x4, y4)
        .lineTo(x4 - ax1, y4 - ay1);
    path.moveTo(x4, y4)
        .lineTo(x4 - ax2, y4 - ay2);
  }
};


/** @inheritDoc */
anychart.annotationsModule.Wave.prototype.colorize = function(state) {
  anychart.annotationsModule.Wave.base(this, 'colorize', state);
  this.paths_[0].stroke(this.strokeResolver_(this, state));
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
anychart.annotationsModule.Wave.prototype.serialize = function() {
  var json = anychart.annotationsModule.Wave.base(this, 'serialize');

  anychart.core.settings.serialize(this, anychart.annotationsModule.X_ANCHOR_DESCRIPTORS, json, 'Annotation');
  anychart.core.settings.serialize(this, anychart.annotationsModule.VALUE_ANCHOR_DESCRIPTORS, json, 'Annotation');
  anychart.core.settings.serialize(this, anychart.annotationsModule.SECOND_ANCHOR_POINT_DESCRIPTORS, json, 'Annotation');
  anychart.core.settings.serialize(this, anychart.annotationsModule.THIRD_ANCHOR_POINT_DESCRIPTORS, json, 'Annotation');
  anychart.core.settings.serialize(this, anychart.annotationsModule.FOURTH_ANCHOR_POINT_DESCRIPTORS, json, 'Annotation');

  return json;
};


/** @inheritDoc */
anychart.annotationsModule.Wave.prototype.setupByJSON = function(config, opt_default) {
  anychart.annotationsModule.Wave.base(this, 'setupByJSON', config, opt_default);

  anychart.core.settings.deserialize(this, anychart.annotationsModule.X_ANCHOR_DESCRIPTORS, config);
  anychart.core.settings.deserialize(this, anychart.annotationsModule.VALUE_ANCHOR_DESCRIPTORS, config);
  anychart.core.settings.deserialize(this, anychart.annotationsModule.SECOND_ANCHOR_POINT_DESCRIPTORS, config);
  anychart.core.settings.deserialize(this, anychart.annotationsModule.THIRD_ANCHOR_POINT_DESCRIPTORS, config);
  anychart.core.settings.deserialize(this, anychart.annotationsModule.FOURTH_ANCHOR_POINT_DESCRIPTORS, config);
};


/** @inheritDoc */
anychart.annotationsModule.Wave.prototype.disposeInternal = function() {
  anychart.annotationsModule.Wave.base(this, 'disposeInternal');

  goog.disposeAll(this.paths_);
  delete this.strokeResolver_;
};
//endregion
