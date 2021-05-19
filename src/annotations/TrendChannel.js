goog.provide('anychart.annotationsModule.TrendChannel');
goog.require('anychart.annotationsModule');
goog.require('anychart.annotationsModule.Base');
goog.require('anychart.core.settings');
goog.require('anychart.enums');



/**
 * TrendChannel annotation.
 * @param {!anychart.annotationsModule.ChartController} chartController
 * @constructor
 * @extends {anychart.annotationsModule.Base}
 */
anychart.annotationsModule.TrendChannel = function(chartController) {
  anychart.annotationsModule.TrendChannel.base(this, 'constructor', chartController);

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
  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, anychart.annotationsModule.THIRD_ANCHOR_POINT_DESCRIPTORS_META);
};
goog.inherits(anychart.annotationsModule.TrendChannel, anychart.annotationsModule.Base);
anychart.core.settings.populateAliases(anychart.annotationsModule.TrendChannel, ['fill', 'hatchFill', 'stroke'], 'normal');
anychart.core.settings.populate(anychart.annotationsModule.TrendChannel, anychart.annotationsModule.X_ANCHOR_DESCRIPTORS);
anychart.core.settings.populate(anychart.annotationsModule.TrendChannel, anychart.annotationsModule.VALUE_ANCHOR_DESCRIPTORS);
anychart.core.settings.populate(anychart.annotationsModule.TrendChannel, anychart.annotationsModule.SECOND_ANCHOR_POINT_DESCRIPTORS);
anychart.core.settings.populate(anychart.annotationsModule.TrendChannel, anychart.annotationsModule.THIRD_ANCHOR_POINT_DESCRIPTORS);
anychart.annotationsModule.AnnotationTypes[anychart.enums.AnnotationTypes.TREND_CHANNEL] = anychart.annotationsModule.TrendChannel;


//region Properties
//----------------------------------------------------------------------------------------------------------------------
//
//  Properties
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.annotationsModule.TrendChannel.prototype.type = anychart.enums.AnnotationTypes.TREND_CHANNEL;


/**
 * Supported anchors.
 * @type {anychart.annotationsModule.AnchorSupport}
 */
anychart.annotationsModule.TrendChannel.prototype.SUPPORTED_ANCHORS = anychart.annotationsModule.AnchorSupport.THREE_POINTS;


//endregion
//region State settings
/** @inheritDoc */
anychart.annotationsModule.TrendChannel.prototype.getNormalDescriptorsMeta = function() {
  var base = anychart.annotationsModule.TrendChannel.base(this, 'getNormalDescriptorsMeta');
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
anychart.annotationsModule.TrendChannel.prototype.ensureCreated = function() {
  anychart.annotationsModule.TrendChannel.base(this, 'ensureCreated');

  if (!this.paths_) {
    // main, hatch, hover
    this.paths_ = [this.rootLayer.path(), this.rootLayer.path(), this.rootLayer.path(), this.rootLayer.path()];
    this.paths_[0].zIndex(anychart.annotationsModule.Base.STROKE_ZINDEX); // stroke
    this.paths_[1].zIndex(anychart.annotationsModule.Base.SHAPES_ZINDEX); // fill
    this.paths_[2].zIndex(anychart.annotationsModule.Base.HATCH_ZINDEX);
    this.paths_[3].zIndex(anychart.annotationsModule.Base.HOVER_SHAPE_ZINDEX);
  }
};


/** @inheritDoc */
anychart.annotationsModule.TrendChannel.prototype.drawOnePointShape = function(x, y) {
  for (var i = 0; i < this.paths_.length; i++) {
    var path = this.paths_[i];
    path.clear();
  }
  this.paths_[0].moveTo(x, y).lineTo(x, y);
  this.paths_[3].moveTo(x, y).lineTo(x, y);
};


/** @inheritDoc */
anychart.annotationsModule.TrendChannel.prototype.drawTwoPointsShape = function(firstX, firstY, secondX, secondY) {
  var ray = anychart.math.clipRayByRect(firstX, firstY, secondX, secondY, this.pixelBoundsCache);

  for (var i = 0; i < this.paths_.length; i++) {
    var path = this.paths_[i];
    path.clear();
  }
  if (ray) {
    this.paths_[0].moveTo(ray[0], ray[1]).lineTo(ray[2], ray[3]);
    this.paths_[3].moveTo(ray[0], ray[1]).lineTo(ray[2], ray[3]);
  }
};


/** @inheritDoc */
anychart.annotationsModule.TrendChannel.prototype.drawThreePointsShape = function(x1, y1, x2, y2, x3, y3) {
  var line1, line2, shapeStart, shapeLineTos, tmp, left, right;
  var bL = this.pixelBoundsCache.left; // bounds left
  var bR = this.pixelBoundsCache.getRight(); // bounds right
  var bT = this.pixelBoundsCache.top; // bounds top
  var bB = this.pixelBoundsCache.getBottom(); // bounds bottom
  if (x2 == x1) { // drawing two vertical lines
    var direction = (y2 - y1) || 1; // let zero direction to be positive
    if (!(x1 < bL && x3 < bL || x1 > bR && x3 > bR)) { // something is in bounds
      line1 = anychart.math.clipLineByRect(x1, y1, x1, y1 + direction, this.pixelBoundsCache);
      line2 = anychart.math.clipLineByRect(x3, y3, x3, y3 + direction, this.pixelBoundsCache);
      left = Math.max(Math.min(x1, x3), bL);
      right = Math.min(Math.max(x1, x3), bR);
      shapeStart = [left, bT];
      shapeLineTos = [
        right, bT,
        right, bB,
        left, bB,
        left, bT];
    } else {
      line1 = line2 = shapeStart = shapeLineTos = null;
    }
  } else {
    var k = (y2 - y1) / (x2 - x1);
    var b1 = y1 - k * x1;
    var b2 = y3 - k * x3;
    if (b1 > b2) { // we want line1 to be the top one
      tmp = b1;
      b1 = b2;
      b2 = tmp;
    }
    var sx = x2 > x1 ? Math.min(x1, x3) : Math.max(x1, x3);
    var ex = x2;
    if (ex > sx && sx > bR || ex < sx && sx < bL) {
      line1 = line2 = shapeStart = shapeLineTos = null;
    } else {
      if (ex > sx) {
        sx = Math.max(sx, bL);
        ex = bR;
      } else {
        ex = Math.min(sx, bR);
        sx = bL;
      }
      // now sx is guaranteed to be to the left
      var sy1 = k * sx + b1;
      var sy2 = k * sx + b2;
      var ey1 = k * ex + b1;
      var ey2 = k * ex + b2;
      if (sy2 < bT && ey2 < bT || sy1 > bB && ey1 > bB) { // both lines are above or below
        line1 = line2 = shapeStart = shapeLineTos = null;
      } else {
        line1 = anychart.math.clipSegmentByRect(sx, sy1, ex, ey1, this.pixelBoundsCache);
        line2 = anychart.math.clipSegmentByRect(sx, sy2, ex, ey2, this.pixelBoundsCache);
        var lx, rx;
        if (k < 0) {
          lx = Math.max(sx, (bB - b1) / k);
          rx = Math.min(ex, (bT - b2) / k);
          // drawing top side
          if (line1) {
            shapeStart = [line1[0], line1[1]];
            shapeLineTos = [line1[2], line1[3], rx, line1[3]];
          } else {
            shapeStart = [sx, bT];
            shapeLineTos = [rx, bT];
          }
          // drawing right and bottom sides
          if (line2) {
            shapeLineTos.push(rx, line2[3], line2[0], line2[1], lx, line2[1]);
          } else {
            shapeLineTos.push(rx, bB, lx, bB);
          }
          // the left side is just a close
        } else if (k > 0) {
          // drawing counterclockwise is easier in this case
          lx = Math.max(sx, (bT - b2) / k);
          rx = Math.min(ex, (bB - b1) / k);
          // drawing top side
          if (line1) {
            shapeStart = [line1[2], line1[3]];
            shapeLineTos = [line1[0], line1[1], lx, line1[1]];
          } else {
            shapeStart = [ex, bT];
            shapeLineTos = [lx, bT];
          }
          // drawing left and bottom sides
          if (line2) {
            shapeLineTos.push(lx, line2[1], line2[2], line2[3], rx, line2[3]);
          } else {
            shapeLineTos.push(lx, bB, rx, bB);
          }
          // the left side is just a close
        } else { // horizontal rect
          var ty = line1 ? line1[1] : bT;
          var by = line2 ? line2[1] : bB;
          shapeStart = [sx, ty];
          shapeLineTos = [ex, ty, ex, by, sx, by];
        }
      }
    }
  }

  var i;
  for (i = 0; i < this.paths_.length; i++) {
    this.paths_[i].clear();
  }
  var strokePath = this.paths_[0];
  if (line1)
    strokePath.moveTo(line1[0], line1[1]).lineTo(line1[2], line1[3]);
  if (line2)
    strokePath.moveTo(line2[0], line2[1]).lineTo(line2[2], line2[3]);
  if (shapeStart && shapeLineTos) {
    var path;
    for (i = 1; i < this.paths_.length; i++) {
      path = this.paths_[i];
      path.moveTo(shapeStart[0], shapeStart[1]);
      path.lineTo.apply(path, shapeLineTos);
      path.close();
    }
  }
};


/** @inheritDoc */
anychart.annotationsModule.TrendChannel.prototype.colorize = function(state) {
  anychart.annotationsModule.TrendChannel.base(this, 'colorize', state);
  this.paths_[0]
      .fill(null)
      .stroke(this.strokeResolver_(this, state));
  this.paths_[1]
      .stroke(null)
      .fill(this.fillResolver_(this, state));
  this.paths_[2]
      .stroke(null)
      .fill(this.hatchFillResolver_(this, state));
  this.paths_[3]
      .fill(anychart.color.TRANSPARENT_HANDLER)
      .stroke(/** @type {acgraph.vector.SolidFill} */(anychart.color.TRANSPARENT_HANDLER), this['hoverGap']() * 2);
};


/** @inheritDoc */
anychart.annotationsModule.TrendChannel.prototype.checkVisible = function() {
  if (this.anchorsAvailable == anychart.annotationsModule.AnchorSupport.THREE_POINTS) {
    var isInsideBounds = anychart.annotationsModule.TrendChannel.base(this, 'checkVisible');
    var isNotPerpendicularToX = this.coords['secondXAnchor'] != this.coords['xAnchor'];
    return isInsideBounds || isNotPerpendicularToX;
  }

  return false;
};


//endregion
//region Serialization / Deserialization / Disposing
//----------------------------------------------------------------------------------------------------------------------
//
//  Serialization / Deserialization / Disposing
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.annotationsModule.TrendChannel.prototype.serialize = function() {
  var json = anychart.annotationsModule.TrendChannel.base(this, 'serialize');

  anychart.core.settings.serialize(this, anychart.annotationsModule.X_ANCHOR_DESCRIPTORS, json, 'Annotation');
  anychart.core.settings.serialize(this, anychart.annotationsModule.VALUE_ANCHOR_DESCRIPTORS, json, 'Annotation');
  anychart.core.settings.serialize(this, anychart.annotationsModule.SECOND_ANCHOR_POINT_DESCRIPTORS, json, 'Annotation');
  anychart.core.settings.serialize(this, anychart.annotationsModule.THIRD_ANCHOR_POINT_DESCRIPTORS, json, 'Annotation');

  return json;
};


/** @inheritDoc */
anychart.annotationsModule.TrendChannel.prototype.setupByJSON = function(config, opt_default) {
  anychart.annotationsModule.TrendChannel.base(this, 'setupByJSON', config, opt_default);

  anychart.core.settings.deserialize(this, anychart.annotationsModule.X_ANCHOR_DESCRIPTORS, config);
  anychart.core.settings.deserialize(this, anychart.annotationsModule.VALUE_ANCHOR_DESCRIPTORS, config);
  anychart.core.settings.deserialize(this, anychart.annotationsModule.SECOND_ANCHOR_POINT_DESCRIPTORS, config);
  anychart.core.settings.deserialize(this, anychart.annotationsModule.THIRD_ANCHOR_POINT_DESCRIPTORS, config);
};


/** @inheritDoc */
anychart.annotationsModule.TrendChannel.prototype.disposeInternal = function() {
  anychart.annotationsModule.TrendChannel.base(this, 'disposeInternal');

  goog.disposeAll(this.paths_);
  delete this.strokeResolver_;
  delete this.fillResolver_;
  delete this.hatchFillResolver_;
};
//endregion
