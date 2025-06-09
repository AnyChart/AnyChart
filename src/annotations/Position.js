goog.provide('anychart.annotationsModule.Position');
goog.require('anychart.annotationsModule');
goog.require('anychart.annotationsModule.Base');
goog.require('anychart.core.settings');
goog.require('anychart.enums');



/**
 * Position annotation.
 * @param {!anychart.annotationsModule.ChartController} chartController
 * @constructor
 * @extends {anychart.annotationsModule.Base}
 */
anychart.annotationsModule.Position = function(chartController) {
  anychart.annotationsModule.Position.base(this, 'constructor', chartController);

  /**
   * Paths long array.
   * @type {Array.<acgraph.vector.Path>}
   * @private
   */
  this.pathsLong_ = null;

  /**
   * Paths short array.
   * @type {Array.<acgraph.vector.Path>}
   * @private
   */
  this.pathsShort_ = null;

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
   * Long Fill resolver.
   * @param {anychart.annotationsModule.Base} annotation
   * @param {number} state
   * @return {acgraph.vector.Fill}
   * @private
   */
  this.winFillResolver_ = /** @type {function(anychart.annotationsModule.Base,number):acgraph.vector.Fill} */(
      anychart.annotationsModule.Base.getColorResolver('winFill', anychart.enums.ColorType.FILL, true));

  /**
   * Short Fill resolver.
   * @param {anychart.annotationsModule.Base} annotation
   * @param {number} state
   * @return {acgraph.vector.Fill}
   * @private
   */
  this.lossFillResolver_ = /** @type {function(anychart.annotationsModule.Base,number):acgraph.vector.Fill} */(
      anychart.annotationsModule.Base.getColorResolver('lossFill', anychart.enums.ColorType.FILL, true));

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, anychart.annotationsModule.X_ANCHOR_DESCRIPTORS_META);
  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, anychart.annotationsModule.VALUE_ANCHOR_DESCRIPTORS_META);
  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, anychart.annotationsModule.SECOND_ANCHOR_POINT_DESCRIPTORS_META);
  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, anychart.annotationsModule.THIRD_ANCHOR_POINT_DESCRIPTORS_META);
};
goog.inherits(anychart.annotationsModule.Position, anychart.annotationsModule.Base);
anychart.core.settings.populateAliases(anychart.annotationsModule.Position, ['winFill', 'lossFill', 'stroke'], 'normal');
anychart.core.settings.populate(anychart.annotationsModule.Position, anychart.annotationsModule.X_ANCHOR_DESCRIPTORS);
anychart.core.settings.populate(anychart.annotationsModule.Position, anychart.annotationsModule.VALUE_ANCHOR_DESCRIPTORS);
anychart.core.settings.populate(anychart.annotationsModule.Position, anychart.annotationsModule.SECOND_ANCHOR_POINT_DESCRIPTORS);
anychart.core.settings.populate(anychart.annotationsModule.Position, anychart.annotationsModule.THIRD_ANCHOR_POINT_DESCRIPTORS);
anychart.annotationsModule.AnnotationTypes[anychart.enums.AnnotationTypes.POSITION] = anychart.annotationsModule.Position;


//region Properties
//----------------------------------------------------------------------------------------------------------------------
//
//  Properties
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.annotationsModule.Position.prototype.type = anychart.enums.AnnotationTypes.POSITION;


/**
 * Supported anchors.
 * @type {anychart.annotationsModule.AnchorSupport}
 */
anychart.annotationsModule.Position.prototype.SUPPORTED_ANCHORS = anychart.annotationsModule.AnchorSupport.THREE_POINTS;


//endregion
//region State settings
/** @inheritDoc */
anychart.annotationsModule.Position.prototype.getNormalDescriptorsMeta = function() {
  var base = anychart.annotationsModule.Position.base(this, 'getNormalDescriptorsMeta');
  return goog.array.concat(
    base,
    anychart.annotationsModule.STROKE_DESCRIPTORS_META,
    [
        ['winFill', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
        ['lossFill', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW]
    ]
  );
};


//endregion
//region Drawing
//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.annotationsModule.Position.prototype.ensureCreated = function() {
  anychart.annotationsModule.Position.base(this, 'ensureCreated');

  // LONG
  if (!this.pathsLong_) {
    // main, hover
    this.pathsLong_  = [this.rootLayer.path(), this.rootLayer.path(), this.rootLayer.path()];

    this.pathsLong_[0].zIndex(anychart.annotationsModule.Base.STROKE_ZINDEX); // stroke
    this.pathsLong_[1].zIndex(anychart.annotationsModule.Base.SHAPES_ZINDEX); // fill
    this.pathsLong_[2].zIndex(anychart.annotationsModule.Base.HOVER_SHAPE_ZINDEX);
  }

  // SHORT
  if (!this.pathsShort_) {
    this.pathsShort_ = [this.rootLayer.path(), this.rootLayer.path(), this.rootLayer.path()];

    this.pathsShort_[0].zIndex(anychart.annotationsModule.Base.STROKE_ZINDEX); // stroke
    this.pathsShort_[1].zIndex(anychart.annotationsModule.Base.SHAPES_ZINDEX); // fill
    this.pathsShort_[2].zIndex(anychart.annotationsModule.Base.HOVER_SHAPE_ZINDEX);
  }
};


/** @inheritDoc */
anychart.annotationsModule.Position.prototype.drawOnePointShape = function(x, y) {
  for (var i = 0; i < this.pathsLong_.length; i++) {
    var path = this.pathsLong_[i];
    path.clear();
    path.moveTo(x, y).lineTo(x, y);
  }
};


/** @inheritDoc */
anychart.annotationsModule.Position.prototype.drawTwoPointsShape = function(x1, y1, x2, y2) {
    var thickness = anychart.utils.extractThickness(/** @type {acgraph.vector.Stroke} */(this.pathsLong_[0].stroke()));
    x1 = anychart.utils.applyPixelShift(x1, thickness);
    y1 = anychart.utils.applyPixelShift(y1, thickness);
    x2 = anychart.utils.applyPixelShift(x2, thickness);
    y2 = anychart.utils.applyPixelShift(y2, thickness);

    this.pathsLong_[0].clear();

    // stroke direction for long
    this.pathsLong_[0].moveTo(x1, y1).lineTo(x2, y2);
    // draw separator on long layer
    this.pathsLong_[0].moveTo(x1, y1).lineTo(x2, y1);

    // draw rectangle
    for (var i = 1; i < this.pathsLong_.length; i++) {
      var path = this.pathsLong_[i];
      path.clear();
      path.moveTo(x1, y1)
          .lineTo(x2, y1)
          .lineTo(x2, y2)
          .lineTo(x1, y2)
          .close();
    }
};


/** @inheritDoc */
anychart.annotationsModule.Position.prototype.drawThreePointsShape = function(x1, y1, x2, y2, x3, y3) {
    var thickness = anychart.utils.extractThickness(/** @type {acgraph.vector.Stroke} */(this.pathsLong_[0].stroke()));
    x1 = anychart.utils.applyPixelShift(x1, thickness);
    y1 = anychart.utils.applyPixelShift(y1, thickness);
    x2 = anychart.utils.applyPixelShift(x2, thickness);
    y2 = anychart.utils.applyPixelShift(y2, thickness);

    var lx, rx;
    lx = Math.max(x1, x2, x3);
    rx = Math.min(x1, x2, x3);

    this.pathsLong_[0].clear();
    this.pathsShort_[0].clear();

    // stroke direction for long
    this.pathsLong_[0].moveTo(x1, y1).lineTo(x2, y2);
    // stroke direction for short
    this.pathsShort_[0].moveTo(x1, y1).lineTo(x3, y3);
    // draw separator on long layer
    this.pathsLong_[0].moveTo(lx, y1).lineTo(rx, y1);

    // draw rectangle for long
    for (var i = 1; i < this.pathsLong_.length; i++) {
      var path = this.pathsLong_[i];
      path.clear();
      path.moveTo(lx, y1)
          .lineTo(rx, y1)
          .lineTo(rx, y2)
          .lineTo(lx, y2)
          .close();
    }

    // draw rectangle for short
    for (var i = 1; i < this.pathsShort_.length; i++) {
      var path = this.pathsShort_[i];
      path.clear();
      path.moveTo(lx, y1)
          .lineTo(rx, y1)
          .lineTo(rx, y3)
          .lineTo(lx, y3)
          .close();
    }
};


/** @inheritDoc */
anychart.annotationsModule.Position.prototype.colorize = function(state) {
  anychart.annotationsModule.Position.base(this, 'colorize', state);
  this.pathsLong_[0]
      .fill(null)
      .stroke(this.strokeResolver_(this, state));
  this.pathsLong_[1]
      .stroke(null)
      .fill(this.winFillResolver_(this, state));
  this.pathsLong_[2]
      .fill(anychart.color.TRANSPARENT_HANDLER)
      .stroke(/** @type {acgraph.vector.SolidFill} */(anychart.color.TRANSPARENT_HANDLER), this['hoverGap']() * 2);

  this.pathsShort_[0]
      .fill(null)
      .stroke(this.strokeResolver_(this, state));
  this.pathsShort_[1]
      .stroke(null)
      .fill(this.lossFillResolver_(this, state));
  this.pathsShort_[2]
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
anychart.annotationsModule.Position.prototype.serialize = function() {
  var json = anychart.annotationsModule.Position.base(this, 'serialize');

  anychart.core.settings.serialize(this, anychart.annotationsModule.X_ANCHOR_DESCRIPTORS, json, 'Annotation');
  anychart.core.settings.serialize(this, anychart.annotationsModule.VALUE_ANCHOR_DESCRIPTORS, json, 'Annotation');
  anychart.core.settings.serialize(this, anychart.annotationsModule.SECOND_ANCHOR_POINT_DESCRIPTORS, json, 'Annotation');
  anychart.core.settings.serialize(this, anychart.annotationsModule.THIRD_ANCHOR_POINT_DESCRIPTORS, json, 'Annotation');

  return json;
};


/** @inheritDoc */
anychart.annotationsModule.Position.prototype.setupByJSON = function(config, opt_default) {
  anychart.annotationsModule.Position.base(this, 'setupByJSON', config, opt_default);

  anychart.core.settings.deserialize(this, anychart.annotationsModule.X_ANCHOR_DESCRIPTORS, config);
  anychart.core.settings.deserialize(this, anychart.annotationsModule.VALUE_ANCHOR_DESCRIPTORS, config);
  anychart.core.settings.deserialize(this, anychart.annotationsModule.SECOND_ANCHOR_POINT_DESCRIPTORS, config);
  anychart.core.settings.deserialize(this, anychart.annotationsModule.THIRD_ANCHOR_POINT_DESCRIPTORS, config);
};


/** @inheritDoc */
anychart.annotationsModule.Position.prototype.disposeInternal = function() {
  anychart.annotationsModule.Position.base(this, 'disposeInternal');

  goog.disposeAll(this.pathsLong_);
  goog.disposeAll(this.pathsShort_);
  delete this.strokeResolver_;
  delete this.winFillResolver_;
  delete this.lossFillResolver_;
};
//endregion
