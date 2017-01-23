goog.provide('anychart.core.annotations.Marker');
goog.require('anychart.core.annotations');
goog.require('anychart.core.annotations.Base');
goog.require('anychart.core.settings');
goog.require('anychart.enums');



/**
 * Marker annotation.
 * @param {!anychart.core.annotations.ChartController} chartController
 * @constructor
 * @extends {anychart.core.annotations.Base}
 */
anychart.core.annotations.Marker = function(chartController) {
  anychart.core.annotations.Marker.base(this, 'constructor', chartController);

  this.markersSupported = false;

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
goog.inherits(anychart.core.annotations.Marker, anychart.core.annotations.Base);
anychart.core.settings.populate(anychart.core.annotations.Marker, anychart.core.annotations.X_ANCHOR_DESCRIPTORS);
anychart.core.settings.populate(anychart.core.annotations.Marker, anychart.core.annotations.VALUE_ANCHOR_DESCRIPTORS);
anychart.core.settings.populate(anychart.core.annotations.Marker, anychart.core.annotations.STROKE_DESCRIPTORS);
anychart.core.settings.populate(anychart.core.annotations.Marker, anychart.core.annotations.FILL_DESCRIPTORS);
anychart.core.settings.populate(anychart.core.annotations.Marker, anychart.core.annotations.MARKER_DESCRIPTORS);
anychart.core.annotations.AnnotationTypes[anychart.enums.AnnotationTypes.MARKER] = anychart.core.annotations.Marker;


//region Properties
//----------------------------------------------------------------------------------------------------------------------
//
//  Properties
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.annotations.Marker.prototype.type = anychart.enums.AnnotationTypes.MARKER;


/**
 * Supported anchors.
 * @type {anychart.core.annotations.AnchorSupport}
 */
anychart.core.annotations.Marker.prototype.SUPPORTED_ANCHORS = anychart.core.annotations.AnchorSupport.ONE_POINT;
//endregion


//region Infrastructure
//----------------------------------------------------------------------------------------------------------------------
//
//  Infrastructure
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.annotations.Marker.prototype.setState = function(state) {
  anychart.core.annotations.Marker.base(this, 'setState', state);
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
anychart.core.annotations.Marker.prototype.ensureCreated = function() {
  anychart.core.annotations.Marker.base(this, 'ensureCreated');

  if (!this.paths_) {
    // main, hatch, hover
    this.paths_ = [this.rootLayer.path(), this.rootLayer.path(), this.rootLayer.path()];
    this.paths_[0].zIndex(anychart.core.annotations.Base.SHAPES_ZINDEX);
    this.paths_[1].zIndex(anychart.core.annotations.Base.HATCH_ZINDEX);
    this.paths_[2].zIndex(anychart.core.annotations.Base.HOVER_SHAPE_ZINDEX);
  }
};


/** @inheritDoc */
anychart.core.annotations.Marker.prototype.drawOnePointShape = function(x, y) {
  var size;
  if (!!(this.state & anychart.PointState.SELECT)) {
    size = this.getOption('selectSize');
  } else if (!!(this.state & anychart.PointState.HOVER)) {
    size = this.getOption('hoverSize');
  }
  size = /** @type {number} */(isNaN(size) ? this.getOption('size') : size);
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
anychart.core.annotations.Marker.prototype.colorize = function(state) {
  anychart.core.annotations.Marker.base(this, 'colorize', state);
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
anychart.core.annotations.Marker.prototype.serialize = function() {
  var json = anychart.core.annotations.Marker.base(this, 'serialize');

  anychart.core.settings.serialize(this, anychart.core.annotations.MARKER_DESCRIPTORS, json, 'Annotation');
  anychart.core.settings.serialize(this, anychart.core.annotations.FILL_DESCRIPTORS, json, 'Annotation');
  anychart.core.settings.serialize(this, anychart.core.annotations.STROKE_DESCRIPTORS, json, 'Annotation');
  anychart.core.settings.serialize(this, anychart.core.annotations.X_ANCHOR_DESCRIPTORS, json, 'Annotation');
  anychart.core.settings.serialize(this, anychart.core.annotations.VALUE_ANCHOR_DESCRIPTORS, json, 'Annotation');

  return json;
};


/** @inheritDoc */
anychart.core.annotations.Marker.prototype.setupByJSON = function(config, opt_default) {

  anychart.core.settings.deserialize(this, anychart.core.annotations.MARKER_DESCRIPTORS, config);
  anychart.core.settings.deserialize(this, anychart.core.annotations.FILL_DESCRIPTORS, config);
  anychart.core.settings.deserialize(this, anychart.core.annotations.STROKE_DESCRIPTORS, config);
  anychart.core.settings.deserialize(this, anychart.core.annotations.X_ANCHOR_DESCRIPTORS, config);
  anychart.core.settings.deserialize(this, anychart.core.annotations.VALUE_ANCHOR_DESCRIPTORS, config);

  anychart.core.annotations.Marker.base(this, 'setupByJSON', config, opt_default);
};


/** @inheritDoc */
anychart.core.annotations.Marker.prototype.disposeInternal = function() {
  anychart.core.annotations.Marker.base(this, 'disposeInternal');

  goog.disposeAll(this.paths_);
  delete this.strokeResolver_;
  delete this.fillResolver_;
  delete this.hatchFillResolver_;
};
//endregion
