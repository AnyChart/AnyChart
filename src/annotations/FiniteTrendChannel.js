goog.provide('anychart.annotationsModule.FiniteTrendChannel');
goog.require('anychart.annotationsModule.Base');



/**
 * Finite trend channel. Regular trend channel annotation is
 * inifinite on the second anchor side. Finite trend channel annotation
 * is limited by its anchors.
 *
 * @param {!anychart.annotationsModule.ChartController} chartController 
 * @constructor
 * @extends {anychart.annotationsModule.Base}
 */
anychart.annotationsModule.FiniteTrendChannel = function(chartController) {
  anychart.annotationsModule.FiniteTrendChannel.base(this, 'constructor', chartController);

  /**
   * Whether auto width calculation needed.
   * If true - auto calculate and apply channel width
   * after drawing mode is finished.
   */
  this.needsAutoWidth_ = false;

  /**
   * Paths array.
   * 0 - stroke path
   * 1 - fill path
   * 2 - hatch fill path
   * 3 - transparent handler path
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

  anychart.core.settings.createDescriptorMeta(this.descriptorsMeta, 'channelWidth', anychart.ConsistencyState.ANNOTATIONS_SHAPES | anychart.ConsistencyState.ANNOTATIONS_ANCHORS, anychart.Signal.NEEDS_REDRAW);
  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, anychart.annotationsModule.X_ANCHOR_DESCRIPTORS_META);
  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, anychart.annotationsModule.VALUE_ANCHOR_DESCRIPTORS_META);
  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, anychart.annotationsModule.SECOND_ANCHOR_POINT_DESCRIPTORS_META);
};
goog.inherits(anychart.annotationsModule.FiniteTrendChannel, anychart.annotationsModule.Base);
anychart.annotationsModule.AnnotationTypes[anychart.enums.AnnotationTypes.FINITE_TREND_CHANNEL] = anychart.annotationsModule.FiniteTrendChannel;


anychart.core.settings.populateAliases(anychart.annotationsModule.FiniteTrendChannel, ['fill', 'hatchFill', 'stroke'], 'normal');
anychart.core.settings.populate(anychart.annotationsModule.FiniteTrendChannel, anychart.annotationsModule.X_ANCHOR_DESCRIPTORS);
anychart.core.settings.populate(anychart.annotationsModule.FiniteTrendChannel, anychart.annotationsModule.VALUE_ANCHOR_DESCRIPTORS);
anychart.core.settings.populate(anychart.annotationsModule.FiniteTrendChannel, anychart.annotationsModule.SECOND_ANCHOR_POINT_DESCRIPTORS);

anychart.annotationsModule.FiniteTrendChannel.prototype.SUPPORTED_ANCHORS = anychart.annotationsModule.AnchorSupport.TWO_POINTS;

anychart.annotationsModule.FiniteTrendChannel.OWN_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'channelWidth',
      anychart.core.settings.numberNormalizer);
  return map;
})();

anychart.core.settings.populate(anychart.annotationsModule.FiniteTrendChannel, anychart.annotationsModule.FiniteTrendChannel.OWN_DESCRIPTORS);


/** @inheritDoc */
anychart.annotationsModule.FiniteTrendChannel.prototype.type = anychart.enums.AnnotationTypes.FINITE_TREND_CHANNEL;


/** @inheritDoc */
anychart.annotationsModule.FiniteTrendChannel.prototype.drawOnePointShape = function(x, y) {
  this.clearPaths_();
  var strokePath = this.paths_[0];
  strokePath.moveTo(x, y).lineTo(x, y);
};


/** @inheritDoc */
anychart.annotationsModule.FiniteTrendChannel.prototype.drawTwoPointsShape = function(x1, y1, x2, y2) {

  /*
    This code is responsible for setting auto calculated width after annotation is
    drawn by hand.
   */
  if (this.isFinished() && this.needsAutoWidth_) {
    this.setOption('channelWidth', this.convertPixelWidthToYScaleWidth((y2 - y1) / 2));
    this.needsAutoWidth_ = false;
  }

  this.clearPaths_();
  
  var strokePath = this.paths_[0];
  var pixelWidth = this.getPixelChannelWidth();

  strokePath.moveTo(x1, y1).lineTo(x2, y2);
  strokePath.moveTo(x1, y1 + pixelWidth).lineTo(x2, y2 + pixelWidth);

  for (var i = 1; i < this.paths_.length; i++) {
    var path = this.paths_[i];
    path.moveTo(x1, y1);
    path.lineTo.apply(path, [x2, y2, x2, y2 + pixelWidth, x1, y1 + pixelWidth]);
    path.close();
  }
};


/** @inheritDoc */
anychart.annotationsModule.FiniteTrendChannel.prototype.colorize = function(state) {
  anychart.annotationsModule.FiniteTrendChannel.base(this, 'colorize', state);
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
anychart.annotationsModule.FiniteTrendChannel.prototype.secureCurrentPosition = function() {
  anychart.annotationsModule.FiniteTrendChannel.base(this, 'secureCurrentPosition');
  this.securedChannelWidth = this.getPixelChannelWidth();
};


/** @inheritDoc */
anychart.annotationsModule.FiniteTrendChannel.prototype.moveAnchor = function(anchorId, dx, dy) {
  if (anchorId < 2) {
    return anychart.annotationsModule.FiniteTrendChannel.base(this, 'moveAnchor', anchorId, dx, dy);
  } else {
    this.setOption('channelWidth', this.convertPixelWidthToYScaleWidth(this.securedChannelWidth + dy));
    this.invalidate(anychart.ConsistencyState.ANNOTATIONS_SHAPES | anychart.ConsistencyState.ANNOTATIONS_MARKERS);
    this.draw();
    return this;
  }
};


/** @inheritDoc */
anychart.annotationsModule.FiniteTrendChannel.prototype.ensureCreated = function() {
  anychart.annotationsModule.FiniteTrendChannel.base(this, 'ensureCreated');

  if (!this.paths_) {
    this.paths_ = [
      this.rootLayer.path(), // Stroke
      this.rootLayer.path(), // Fill
      this.rootLayer.path(), // Hatch fill
      this.rootLayer.path()  // Transparent handler
    ];

    this.paths_[0].zIndex(anychart.annotationsModule.Base.STROKE_ZINDEX);
    this.paths_[1].zIndex(anychart.annotationsModule.Base.SHAPES_ZINDEX);
    this.paths_[2].zIndex(anychart.annotationsModule.Base.HATCH_ZINDEX);
    this.paths_[3].zIndex(anychart.annotationsModule.Base.HOVER_SHAPE_ZINDEX);
  }
};


/** @inheritDoc */
anychart.annotationsModule.FiniteTrendChannel.prototype.createPositionProviders = function() {
  var basePositionProviders = anychart.annotationsModule.FiniteTrendChannel.base(this, 'createPositionProviders');

  /*
    Adds third marker for width configuration.
    Third marker is only displayed if second anchor is drawn.
   */
  if (!isNaN(this.coords['secondXAnchor'])) {
    var channelWidthMarkerPos = this.getWidthMarkerPosition();

    // Avoid obfuscation using string keys.
    channelWidthMarkerPos = {
      'x': channelWidthMarkerPos.x,
      'y': channelWidthMarkerPos.y
    };

    basePositionProviders.push({'value': channelWidthMarkerPos});
  }

  return basePositionProviders;
};


/** @inheritDoc */
anychart.annotationsModule.FiniteTrendChannel.prototype.getNormalDescriptorsMeta = function() {
  var base = anychart.annotationsModule.FiniteTrendChannel.base(this, 'getNormalDescriptorsMeta');
  return goog.array.concat(base, anychart.annotationsModule.FILL_STROKE_DESCRIPTORS_META);
};


/** @inheritDoc */
anychart.annotationsModule.FiniteTrendChannel.prototype.setupByJSON = function(config, opt_default) {
  anychart.annotationsModule.FiniteTrendChannel.base(this, 'setupByJSON', config, opt_default);

  anychart.core.settings.deserialize(this, anychart.annotationsModule.FiniteTrendChannel.OWN_DESCRIPTORS, config);

  anychart.core.settings.deserialize(this, anychart.annotationsModule.X_ANCHOR_DESCRIPTORS, config);
  anychart.core.settings.deserialize(this, anychart.annotationsModule.VALUE_ANCHOR_DESCRIPTORS, config);
  anychart.core.settings.deserialize(this, anychart.annotationsModule.SECOND_ANCHOR_POINT_DESCRIPTORS, config);
};


/** @inheritDoc */
anychart.annotationsModule.FiniteTrendChannel.prototype.serialize = function() {
  var json = anychart.annotationsModule.FiniteTrendChannel.base(this, 'serialize');

  anychart.core.settings.serialize(this, anychart.annotationsModule.FiniteTrendChannel.OWN_DESCRIPTORS, json, 'Annotation');

  anychart.core.settings.serialize(this, anychart.annotationsModule.X_ANCHOR_DESCRIPTORS, json, 'Annotation');
  anychart.core.settings.serialize(this, anychart.annotationsModule.VALUE_ANCHOR_DESCRIPTORS, json, 'Annotation');
  anychart.core.settings.serialize(this, anychart.annotationsModule.SECOND_ANCHOR_POINT_DESCRIPTORS, json, 'Annotation');

  return json;
};


/** @inheritDoc */
anychart.annotationsModule.FiniteTrendChannel.prototype.disposeInternal = function() {
  anychart.annotationsModule.FiniteTrendChannel.base(this, 'disposeInternal');

  goog.disposeAll(this.paths_);
  delete this.strokeResolver_;
  delete this.fillResolver_;
  delete this.hatchFillResolver_;
};


/** @inheritDoc */
anychart.annotationsModule.FiniteTrendChannel.prototype.updateLastPoint = function(x, y) {
  /*
    This method is only invoked in drawing mode.
    And after drawing is finished - auto width must be set.
   */
  this.needsAutoWidth_ = true;
  anychart.annotationsModule.FiniteTrendChannel.base(this, 'updateLastPoint', x, y);
};


/**
 * Returns channel width converted to pixel values.
 *
 * @return {number}
 */
anychart.annotationsModule.FiniteTrendChannel.prototype.getPixelChannelWidth = function() {
  /*
    Using value within the scale range for width ratio calculation to
    have valid channel width ratio in cases, like channelWidth == 2 and scale range [90, 100].
   */
  var startRatio = 0.5;
  var startValue = this.yScale().inverseTransform(0.5);

  var scaleChannelWidth = this.getOption('channelWidth');
  var endRatio = this.yScale().transform(startValue + scaleChannelWidth);

  var widthRatio = startRatio - endRatio;

  return widthRatio * this.pixelBoundsCache.height;
};


/**
 * Converts channel width from pixel values to yScale values.
 *
 * @param {number} pixelWidth - Channel width in pixels.
 * @return {number}
 */
anychart.annotationsModule.FiniteTrendChannel.prototype.convertPixelWidthToYScaleWidth = function(pixelWidth) {
  var startRatio = 0.5;
  var startValue = /** @type {number} */(this.yScale().inverseTransform(startRatio));

  var widthRatio = pixelWidth / this.pixelBoundsCache.height;

  var endRatio = startRatio + widthRatio;
  var endValue = /** @type {number} */(this.yScale().inverseTransform(endRatio));

  return startValue - endValue;
};


/**
 * Returns pixel coordinates of the width marker.
 * Width marker is simply a midpoint between anchors, with offset applied
 * to the midpoint Y value by the channel width value.
 *
 * @return {{x: number, y: number}}
 */
anychart.annotationsModule.FiniteTrendChannel.prototype.getWidthMarkerPosition = function() {
  var channelWidth = this.getPixelChannelWidth();
  var x1 = this.coords['xAnchor'];
  var y1 = this.coords['valueAnchor'];
  var x2 = this.coords['secondXAnchor'];
  var y2 = this.coords['secondValueAnchor'];

  // X and Y values of midpoint between (x1, y1) and (x2, y2).
  var midPointX = (x1 + x2) / 2;
  var midPointY = (y1 + y2) / 2;

  // Offset midpoint y value with channel width value to get width marker Y.
  var widthMarkerY = midPointY + channelWidth;

  return {
    x: midPointX,
    y: widthMarkerY
  };
};


/**
 * Clears paths, used before drawing.
 */
anychart.annotationsModule.FiniteTrendChannel.prototype.clearPaths_ = function() {
  for (var i = 0; i < this.paths_.length; i++) {
    this.paths_[i].clear();
  }
};
