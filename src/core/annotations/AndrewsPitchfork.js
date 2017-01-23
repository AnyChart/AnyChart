goog.provide('anychart.core.annotations.AndrewsPitchfork');
goog.require('anychart.core.annotations');
goog.require('anychart.core.annotations.Base');
goog.require('anychart.core.settings');
goog.require('anychart.enums');



/**
 * AndrewsPitchfork annotation.
 * @param {!anychart.core.annotations.ChartController} chartController
 * @constructor
 * @extends {anychart.core.annotations.Base}
 */
anychart.core.annotations.AndrewsPitchfork = function(chartController) {
  anychart.core.annotations.AndrewsPitchfork.base(this, 'constructor', chartController);

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
goog.inherits(anychart.core.annotations.AndrewsPitchfork, anychart.core.annotations.Base);
anychart.core.settings.populate(anychart.core.annotations.AndrewsPitchfork, anychart.core.annotations.X_ANCHOR_DESCRIPTORS);
anychart.core.settings.populate(anychart.core.annotations.AndrewsPitchfork, anychart.core.annotations.VALUE_ANCHOR_DESCRIPTORS);
anychart.core.settings.populate(anychart.core.annotations.AndrewsPitchfork, anychart.core.annotations.SECOND_ANCHOR_POINT_DESCRIPTORS);
anychart.core.settings.populate(anychart.core.annotations.AndrewsPitchfork, anychart.core.annotations.THIRD_ANCHOR_POINT_DESCRIPTORS);
anychart.core.settings.populate(anychart.core.annotations.AndrewsPitchfork, anychart.core.annotations.STROKE_DESCRIPTORS);
anychart.core.annotations.AnnotationTypes[anychart.enums.AnnotationTypes.ANDREWS_PITCHFORK] = anychart.core.annotations.AndrewsPitchfork;


//region Properties
//----------------------------------------------------------------------------------------------------------------------
//
//  Properties
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.annotations.AndrewsPitchfork.prototype.type = anychart.enums.AnnotationTypes.ANDREWS_PITCHFORK;


/**
 * Supported anchors.
 * @type {anychart.core.annotations.AnchorSupport}
 */
anychart.core.annotations.AndrewsPitchfork.prototype.SUPPORTED_ANCHORS = anychart.core.annotations.AnchorSupport.THREE_POINTS;
//endregion


//region Drawing
//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.annotations.AndrewsPitchfork.prototype.ensureCreated = function() {
  anychart.core.annotations.AndrewsPitchfork.base(this, 'ensureCreated');

  if (!this.paths_) {
    // main, hatch, hover
    this.paths_ = [this.rootLayer.path(), this.rootLayer.path()];
    this.paths_[0].zIndex(anychart.core.annotations.Base.SHAPES_ZINDEX);
    this.paths_[1].zIndex(anychart.core.annotations.Base.HOVER_SHAPE_ZINDEX);
  }
};


/** @inheritDoc */
anychart.core.annotations.AndrewsPitchfork.prototype.drawOnePointShape = function(x, y) {
  for (var i = 0; i < this.paths_.length; i++) {
    var path = this.paths_[i];
    path.clear();
    path.moveTo(x, y).lineTo(x, y);
  }
};


/** @inheritDoc */
anychart.core.annotations.AndrewsPitchfork.prototype.drawTwoPointsShape = function(firstX, firstY, secondX, secondY) {
  for (var i = 0; i < this.paths_.length; i++) {
    var path = this.paths_[i];
    path.clear();
    path.moveTo(firstX, firstY).lineTo(firstX, firstY);
    path.moveTo(secondX, secondY).lineTo(secondX, secondY);
  }
};


/** @inheritDoc */
anychart.core.annotations.AndrewsPitchfork.prototype.drawThreePointsShape = function(x1, y1, x2, y2, x3, y3) {
  // dx and dy is a vector of the fork
  var dx = (x2 + x3) / 2 - x1;
  var dy = (y2 + y3) / 2 - y1;
  // if the vector is zero, let the fork go right horizontal
  if (!dx && !dy) {
    dx = 10;
  }
  var line1 = anychart.math.clipRayByRect(x1, y1, x1 + dx, y1 + dy, this.pixelBoundsCache);
  var line2 = anychart.math.clipRayByRect(x2, y2, x2 + dx, y2 + dy, this.pixelBoundsCache);
  var line3 = anychart.math.clipRayByRect(x3, y3, x3 + dx, y3 + dy, this.pixelBoundsCache);
  var handle = anychart.math.clipSegmentByRect(x2, y2, x3, y3, this.pixelBoundsCache);

  for (var i = 0; i < this.paths_.length; i++) {
    var path = this.paths_[i];
    path.clear();
    var hadMoveTo = false;
    if (line2) {
      path.moveTo(line2[2], line2[3]).lineTo(line2[0], line2[1]);
      hadMoveTo = true;
    }
    if (handle) {
      if (hadMoveTo) {
        path.lineTo(handle[0], handle[1]);
      } else {
        path.moveTo(handle[0], handle[1]);
      }
      path.lineTo(handle[2], handle[3]);
      hadMoveTo = true;
    } else {
      hadMoveTo = false;
    }
    if (line3) {
      if (hadMoveTo) {
        path.lineTo(line3[0], line3[1]);
      } else {
        path.moveTo(line3[0], line3[1]);
      }
      path.lineTo(line3[2], line3[3]);
    }
    if (line1) {
      path.moveTo(line1[0], line1[1]).lineTo(line1[2], line1[3]);
    }
  }
};


/** @inheritDoc */
anychart.core.annotations.AndrewsPitchfork.prototype.colorize = function(state) {
  anychart.core.annotations.AndrewsPitchfork.base(this, 'colorize', state);
  this.paths_[0]
      .fill(null)
      .stroke(this.strokeResolver_(this, state));
  this.paths_[1]
      .fill(anychart.color.TRANSPARENT_HANDLER)
      .stroke(/** @type {acgraph.vector.SolidFill} */(anychart.color.TRANSPARENT_HANDLER), this['hoverGap']() * 2);
};


/** @inheritDoc */
anychart.core.annotations.AndrewsPitchfork.prototype.checkVisible = function() {
  var res = anychart.core.annotations.AndrewsPitchfork.base(this, 'checkVisible');
  if (!res) {
    var x1 = this.coords['xAnchor'];
    var x2 = this.coords['secondXAnchor'];
    var x3 = this.coords['thirdXAnchor'];
    var dx = (x2 + x3) / 2 - x1;
    res = !isNaN(dx) && !((x1 < this.pixelBoundsCache.left && dx <= 0) ||
        (x1 > this.pixelBoundsCache.getRight() && dx >= 0));
  }
  return res;
};
//endregion


//region Serialization / Deserialization / Disposing
//----------------------------------------------------------------------------------------------------------------------
//
//  Serialization / Deserialization / Disposing
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.annotations.AndrewsPitchfork.prototype.serialize = function() {
  var json = anychart.core.annotations.AndrewsPitchfork.base(this, 'serialize');

  anychart.core.settings.serialize(this, anychart.core.annotations.STROKE_DESCRIPTORS, json, 'Annotation');
  anychart.core.settings.serialize(this, anychart.core.annotations.X_ANCHOR_DESCRIPTORS, json, 'Annotation');
  anychart.core.settings.serialize(this, anychart.core.annotations.VALUE_ANCHOR_DESCRIPTORS, json, 'Annotation');
  anychart.core.settings.serialize(this, anychart.core.annotations.SECOND_ANCHOR_POINT_DESCRIPTORS, json, 'Annotation');
  anychart.core.settings.serialize(this, anychart.core.annotations.THIRD_ANCHOR_POINT_DESCRIPTORS, json, 'Annotation');

  return json;
};


/** @inheritDoc */
anychart.core.annotations.AndrewsPitchfork.prototype.setupByJSON = function(config, opt_default) {

  anychart.core.settings.deserialize(this, anychart.core.annotations.STROKE_DESCRIPTORS, config);
  anychart.core.settings.deserialize(this, anychart.core.annotations.X_ANCHOR_DESCRIPTORS, config);
  anychart.core.settings.deserialize(this, anychart.core.annotations.VALUE_ANCHOR_DESCRIPTORS, config);
  anychart.core.settings.deserialize(this, anychart.core.annotations.SECOND_ANCHOR_POINT_DESCRIPTORS, config);
  anychart.core.settings.deserialize(this, anychart.core.annotations.THIRD_ANCHOR_POINT_DESCRIPTORS, config);

  anychart.core.annotations.AndrewsPitchfork.base(this, 'setupByJSON', config, opt_default);
};


/** @inheritDoc */
anychart.core.annotations.AndrewsPitchfork.prototype.disposeInternal = function() {
  anychart.core.annotations.AndrewsPitchfork.base(this, 'disposeInternal');

  goog.disposeAll(this.paths_);
  delete this.strokeResolver_;
};
//endregion
