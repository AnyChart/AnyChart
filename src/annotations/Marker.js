goog.provide('anychart.annotationsModule.Marker');
goog.require('anychart.annotationsModule');
goog.require('anychart.annotationsModule.Base');
goog.require('anychart.core.settings');
goog.require('anychart.enums');



/**
 * Marker annotation.
 * @param {!anychart.annotationsModule.ChartController} chartController
 * @constructor
 * @extends {anychart.annotationsModule.Base}
 */
anychart.annotationsModule.Marker = function(chartController) {
  anychart.annotationsModule.Marker.base(this, 'constructor', chartController);

  this.markersSupported = false;

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
  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, anychart.annotationsModule.MARKER_DESCRIPTORS_META);
};
goog.inherits(anychart.annotationsModule.Marker, anychart.annotationsModule.Base);
anychart.core.settings.populateAliases(anychart.annotationsModule.Marker, ['stroke', 'fill', 'hatchFill', 'size'], 'normal');
anychart.core.settings.populate(anychart.annotationsModule.Marker, anychart.annotationsModule.X_ANCHOR_DESCRIPTORS);
anychart.core.settings.populate(anychart.annotationsModule.Marker, anychart.annotationsModule.VALUE_ANCHOR_DESCRIPTORS);
anychart.core.settings.populate(anychart.annotationsModule.Marker, anychart.annotationsModule.MARKER_DESCRIPTORS);
anychart.annotationsModule.AnnotationTypes[anychart.enums.AnnotationTypes.MARKER] = anychart.annotationsModule.Marker;


//region Properties
//----------------------------------------------------------------------------------------------------------------------
//
//  Properties
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.annotationsModule.Marker.prototype.type = anychart.enums.AnnotationTypes.MARKER;


/**
 * Supported anchors.
 * @type {anychart.annotationsModule.AnchorSupport}
 */
anychart.annotationsModule.Marker.prototype.SUPPORTED_ANCHORS = anychart.annotationsModule.AnchorSupport.ONE_POINT;


//endregion
//region State settings
/** @inheritDoc */
anychart.annotationsModule.Marker.prototype.getNormalDescriptorsMeta = function() {
  return goog.array.concat(
      anychart.annotationsModule.FILL_STROKE_DESCRIPTORS_META,
      anychart.annotationsModule.MARKER_DESCRIPTORS_STATE_META);
};


//endregion
//region Infrastructure
//----------------------------------------------------------------------------------------------------------------------
//
//  Infrastructure
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.annotationsModule.Marker.prototype.setState = function(state) {
  anychart.annotationsModule.Marker.base(this, 'setState', state);
  this.invalidate(anychart.ConsistencyState.ANNOTATIONS_SHAPES);
};


//endregion
//region Drawing
//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.annotationsModule.Marker.prototype.ensureCreated = function() {
  anychart.annotationsModule.Marker.base(this, 'ensureCreated');

  if (!this.paths_) {
    // main, hatch, hover
    this.paths_ = [this.rootLayer.path(), this.rootLayer.path(), this.rootLayer.path()];
    this.paths_[0].zIndex(anychart.annotationsModule.Base.SHAPES_ZINDEX);
    this.paths_[1].zIndex(anychart.annotationsModule.Base.HATCH_ZINDEX);
    this.paths_[2].zIndex(anychart.annotationsModule.Base.HOVER_SHAPE_ZINDEX);
  }
};


/** @inheritDoc */
anychart.annotationsModule.Marker.prototype.drawOnePointShape = function(x, y) {
  var size;
  if (!!(this.state & anychart.PointState.SELECT)) {
    size = this.selected_.getOption('size');
  } else if (!!(this.state & anychart.PointState.HOVER)) {
    size = this.hovered_.getOption('size');
  }
  size = /** @type {number} */(isNaN(size) ? this.normal_.getOption('size') : size);
  var drawer = anychart.utils.getMarkerDrawer(this.getOption('markerType'));
  var anchor = /** @type {anychart.enums.Anchor} */(this.getOption('anchor'));
  var position = {x: x, y: y};
  anychart.utils.applyOffsetByAnchor(position, anchor,
      /** @type {number} */(this.getOption('offsetX')),
      /** @type {number} */(this.getOption('offsetY')));
  var d = size / 2;
  switch (anchor) {
    case anychart.enums.Anchor.LEFT_TOP:
    case anychart.enums.Anchor.CENTER_TOP:
    case anychart.enums.Anchor.RIGHT_TOP:
      position.y += d;
      break;
    case anychart.enums.Anchor.LEFT_BOTTOM:
    case anychart.enums.Anchor.CENTER_BOTTOM:
    case anychart.enums.Anchor.RIGHT_BOTTOM:
      position.y -= d;
      break;
  }
  switch (anchor) {
    case anychart.enums.Anchor.LEFT_TOP:
    case anychart.enums.Anchor.LEFT_CENTER:
    case anychart.enums.Anchor.LEFT_BOTTOM:
      position.x += d;
      break;
    case anychart.enums.Anchor.RIGHT_TOP:
    case anychart.enums.Anchor.RIGHT_CENTER:
    case anychart.enums.Anchor.RIGHT_BOTTOM:
      position.x -= d;
      break;
  }
  var strokeThickness = anychart.utils.extractThickness(/** @type {acgraph.vector.Stroke} */(this.paths_[0].stroke()));
  for (var i = 0; i < this.paths_.length; i++) {
    var path = /** @type {acgraph.vector.Path} */(this.paths_[i]);
    path.clear();
    drawer(path, position.x, position.y, size, strokeThickness);
  }
};


/** @inheritDoc */
anychart.annotationsModule.Marker.prototype.colorize = function(state) {
  anychart.annotationsModule.Marker.base(this, 'colorize', state);
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
anychart.annotationsModule.Marker.prototype.serialize = function() {
  var json = anychart.annotationsModule.Marker.base(this, 'serialize');

  anychart.core.settings.serialize(this, anychart.annotationsModule.MARKER_DESCRIPTORS, json, 'Annotation');
  anychart.core.settings.serialize(this, anychart.annotationsModule.X_ANCHOR_DESCRIPTORS, json, 'Annotation');
  anychart.core.settings.serialize(this, anychart.annotationsModule.VALUE_ANCHOR_DESCRIPTORS, json, 'Annotation');

  return json;
};


/** @inheritDoc */
anychart.annotationsModule.Marker.prototype.setupByJSON = function(config, opt_default) {
  anychart.annotationsModule.Marker.base(this, 'setupByJSON', config, opt_default);

  anychart.core.settings.deserialize(this, anychart.annotationsModule.MARKER_DESCRIPTORS, config);
  anychart.core.settings.deserialize(this, anychart.annotationsModule.X_ANCHOR_DESCRIPTORS, config);
  anychart.core.settings.deserialize(this, anychart.annotationsModule.VALUE_ANCHOR_DESCRIPTORS, config);
};


/** @inheritDoc */
anychart.annotationsModule.Marker.prototype.disposeInternal = function() {
  anychart.annotationsModule.Marker.base(this, 'disposeInternal');

  goog.disposeAll(this.paths_);
  delete this.strokeResolver_;
  delete this.fillResolver_;
  delete this.hatchFillResolver_;
};
//endregion
