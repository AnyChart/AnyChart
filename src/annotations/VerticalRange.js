goog.provide('anychart.annotationsModule.VerticalRange');
goog.require('anychart.annotationsModule');
goog.require('anychart.annotationsModule.Base');
goog.require('anychart.core.settings');
goog.require('anychart.enums');



/**
 * VerticalRange annotation.
 * @param {!anychart.annotationsModule.ChartController} chartController
 * @constructor
 * @extends {anychart.annotationsModule.Base}
 */
anychart.annotationsModule.VerticalRange = function(chartController) {
  anychart.annotationsModule.VerticalRange.base(this, 'constructor', chartController);

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
goog.inherits(anychart.annotationsModule.VerticalRange, anychart.annotationsModule.Base);
anychart.core.settings.populateAliases(anychart.annotationsModule.VerticalRange, ['fill', 'hatchFill', 'stroke'], 'normal');
anychart.core.settings.populate(anychart.annotationsModule.VerticalRange, anychart.annotationsModule.X_ANCHOR_DESCRIPTORS);
anychart.core.settings.populate(anychart.annotationsModule.VerticalRange, anychart.annotationsModule.VALUE_ANCHOR_DESCRIPTORS);
anychart.core.settings.populate(anychart.annotationsModule.VerticalRange, anychart.annotationsModule.SECOND_ANCHOR_POINT_DESCRIPTORS);
anychart.annotationsModule.AnnotationTypes[anychart.enums.AnnotationTypes.VERTICAL_RANGE] = anychart.annotationsModule.VerticalRange;


//region Properties
/** @inheritDoc */
anychart.annotationsModule.VerticalRange.prototype.type = anychart.enums.AnnotationTypes.VERTICAL_RANGE;


/**
 * Supported anchors.
 * @type {anychart.annotationsModule.AnchorSupport}
 */
anychart.annotationsModule.VerticalRange.prototype.SUPPORTED_ANCHORS = anychart.annotationsModule.AnchorSupport.TWO_POINTS;


//endregion
//region StateSettings
/** @inheritDoc */
anychart.annotationsModule.VerticalRange.prototype.getNormalDescriptorsMeta = function() {
  var base = anychart.annotationsModule.VerticalRange.base(this, 'getNormalDescriptorsMeta');
  return goog.array.concat(base, anychart.annotationsModule.FILL_STROKE_DESCRIPTORS_META);
};


//endregion
//region Calculation
/** @inheritDoc */
anychart.annotationsModule.VerticalRange.prototype.calculate = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.ANNOTATIONS_ANCHORS)) {
    var xScale, yScale;
    xScale = this.xScale();
    yScale = this.yScale();
    if (!xScale || !yScale) return false;

    var firstX, secondX;
    var availableCoords = 0;
    var missingCoords = 0;

    firstX = this.xRatioToPix(xScale.transform(this.getOwnOption('xAnchor'), 0.5));
    if (isNaN(firstX))
      missingCoords |= anychart.annotationsModule.AnchorSupport.ONE_POINT;
    else
      availableCoords |= anychart.annotationsModule.AnchorSupport.ONE_POINT;

    secondX = this.xRatioToPix(xScale.transform(this.getOwnOption('secondXAnchor'), 0.5));
    if (isNaN(secondX))
      missingCoords |= anychart.annotationsModule.AnchorSupport.SECOND_POINT;
    else
      availableCoords |= anychart.annotationsModule.AnchorSupport.SECOND_POINT;

    // we allow dragging draw if we are missing more than two points
    var dragDrawingAvailable = false;
    var lastPointXName = null;
    if (!!(missingCoords & anychart.annotationsModule.AnchorSupport.ONE_POINT)) {
      lastPointXName = 'xAnchor';
      dragDrawingAvailable = true;
      this.lastPointAnchor = anychart.annotationsModule.AnchorSupport.ONE_POINT;
    } else if (!!(missingCoords & anychart.annotationsModule.AnchorSupport.SECOND_POINT)) {
      lastPointXName = 'secondXAnchor';
      dragDrawingAvailable = false;
      this.lastPointAnchor = anychart.annotationsModule.AnchorSupport.TWO_POINTS;
    } else {
      this.lastPointAnchor = anychart.annotationsModule.AnchorSupport.NONE;
    }

    this.coords['xAnchor'] = firstX;
    this.coords['secondXAnchor'] = secondX;

    this.anchorsAvailable = availableCoords;
    this.lastPointXName = lastPointXName;
    this.lastPointYName = null;
    this.dragDrawingAvailable = dragDrawingAvailable;
    this.isVisible = this.checkVisible();

    if (!isNaN(this.lastPointX) && !isNaN(this.lastPointY))
      this.invalidate(anychart.ConsistencyState.ANNOTATIONS_LAST_POINT);
    this.invalidate(
        anychart.ConsistencyState.ANNOTATIONS_SHAPES |
        anychart.ConsistencyState.ANNOTATIONS_MARKERS);
    this.markConsistent(anychart.ConsistencyState.ANNOTATIONS_ANCHORS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.ANNOTATIONS_LAST_POINT)) {
    if (!isNaN(this.lastPointX) && !isNaN(this.lastPointY)) {
      if (this.lastPointXName) {
        this.coords[this.lastPointXName] = this.lastPointX;
      }
      if (this.lastPointYName) {
        this.coords[this.lastPointYName] = this.lastPointY;
      }
      this.anchorsWithLastPoint = this.anchorsAvailable | this.lastPointAnchor;
    } else {
      this.anchorsWithLastPoint = this.anchorsAvailable;
    }
    this.markConsistent(anychart.ConsistencyState.ANNOTATIONS_LAST_POINT);
    this.invalidate(
        anychart.ConsistencyState.ANNOTATIONS_SHAPES |
        anychart.ConsistencyState.ANNOTATIONS_MARKERS);
    this.markConsistent(anychart.ConsistencyState.ANNOTATIONS_LAST_POINT);
  }

  return this.isVisible || (!isNaN(this.lastPointX) && !isNaN(this.lastPointY));
};


/** @inheritDoc */
anychart.annotationsModule.VerticalRange.prototype.createPositionProviders = function() {
  var res = [];
  var centerY = this.pixelBoundsCache.top + this.pixelBoundsCache.height / 2;
  if (!!(this.SUPPORTED_ANCHORS & this.anchorsWithLastPoint & anychart.annotationsModule.AnchorSupport.ONE_POINT)) {
    res.push({'x': this.coords['xAnchor'], 'y': centerY});
    if (!!(this.SUPPORTED_ANCHORS & this.anchorsWithLastPoint & anychart.annotationsModule.AnchorSupport.SECOND_POINT)) {
      res.push({'x': this.coords['secondXAnchor'], 'y': centerY});
    }
  }
  return goog.array.map(res, function(item) { return {'value': item}; });
};


/** @inheritDoc */
anychart.annotationsModule.VerticalRange.prototype.checkVisible = function() {
  var coords = [];
  coords.push(this.coords['xAnchor']);
  coords.push(this.coords['secondXAnchor']);
  var bounds = this.pixelBoundsCache;
  var allLeft = true;
  var allRight = true;
  var coord;
  for (var i = 0; i < coords.length; i++) {
    if (!isNaN(coord = coords[i])) {
      allLeft = allLeft && coords[i] < bounds.left;
      allRight = allRight && coords[i] > bounds.getRight();
    }
  }
  return !allLeft && !allRight;
};


//endregion
//region Drawing
/** @inheritDoc */
anychart.annotationsModule.VerticalRange.prototype.ensureCreated = function() {
  anychart.annotationsModule.VerticalRange.base(this, 'ensureCreated');

  if (!this.paths_) {
    // vertical lines
    // rect fill
    // rect hatch
    // hover
    this.paths_ = [this.rootLayer.path(), this.rootLayer.path(), this.rootLayer.path(), this.rootLayer.path()];
    this.paths_[0].zIndex(anychart.annotationsModule.Base.STROKE_ZINDEX);
    this.paths_[1].zIndex(anychart.annotationsModule.Base.SHAPES_ZINDEX);
    this.paths_[2].zIndex(anychart.annotationsModule.Base.HATCH_ZINDEX);
    this.paths_[3].zIndex(anychart.annotationsModule.Base.HOVER_SHAPE_ZINDEX);
  }
};


/** @inheritDoc */
anychart.annotationsModule.VerticalRange.prototype.setMarkerCursor = function(marker, index) {
  marker.getDomElement().cursor(/** @type {acgraph.vector.Cursor} */(anychart.enums.Cursor.EW_RESIZE));
};


/** @inheritDoc */
anychart.annotationsModule.VerticalRange.prototype.drawOnePointShape = function(x, y) {
  x = anychart.utils.applyPixelShift(x, anychart.utils.extractThickness(
      /** @type {acgraph.vector.Stroke} */(this.paths_[0].stroke())));
  this.paths_[0].clear();
  this.paths_[0].moveTo(x, this.pixelBoundsCache.top).lineTo(x, this.pixelBoundsCache.getBottom());
};


/** @inheritDoc */
anychart.annotationsModule.VerticalRange.prototype.drawTwoPointsShape = function(x1, y1, x2, y2) {
  var thickness = anychart.utils.extractThickness(/** @type {acgraph.vector.Stroke} */(this.paths_[0].stroke()));
  x1 = anychart.utils.applyPixelShift(x1, thickness);
  x2 = anychart.utils.applyPixelShift(x2, thickness);

  var top = this.pixelBoundsCache.top;
  var bottom = this.pixelBoundsCache.getBottom();

  var path = this.paths_[0];
  path.clear()
      .moveTo(x1, top).lineTo(x1, bottom)
      .moveTo(x2, top).lineTo(x2, bottom);

  for (var i = 1; i < this.paths_.length; i++) {
    path = this.paths_[i];
    path.clear()
        .moveTo(x1, top)
        .lineTo(x2, top)
        .lineTo(x2, bottom)
        .lineTo(x1, bottom)
        .close();
  }
};


/** @inheritDoc */
anychart.annotationsModule.VerticalRange.prototype.colorize = function(state) {
  anychart.annotationsModule.VerticalRange.base(this, 'colorize', state);
  this.paths_[0]
      .stroke(this.strokeResolver_(this, state))
      .fill(null);
  this.paths_[1]
      .stroke(null)
      .fill(this.fillResolver_(this, state));
  this.paths_[2]
      .stroke(null)
      .fill(this.hatchFillResolver_(this, state));
  this.paths_[3]
      .stroke(/** @type {acgraph.vector.SolidFill} */(anychart.color.TRANSPARENT_HANDLER), this['hoverGap']() * 2)
      .fill(anychart.color.TRANSPARENT_HANDLER);
};


//endregion
//region Serialize / Setup / Dispose
/** @inheritDoc */
anychart.annotationsModule.VerticalRange.prototype.serialize = function() {
  var json = anychart.annotationsModule.VerticalRange.base(this, 'serialize');

  anychart.core.settings.serialize(this, anychart.annotationsModule.X_ANCHOR_DESCRIPTORS, json, 'Annotation');
  anychart.core.settings.serialize(this, anychart.annotationsModule.VALUE_ANCHOR_DESCRIPTORS, json, 'Annotation');
  anychart.core.settings.serialize(this, anychart.annotationsModule.SECOND_ANCHOR_POINT_DESCRIPTORS, json, 'Annotation');

  return json;
};


/** @inheritDoc */
anychart.annotationsModule.VerticalRange.prototype.setupByJSON = function(config, opt_default) {
  anychart.annotationsModule.VerticalRange.base(this, 'setupByJSON', config, opt_default);

  anychart.core.settings.deserialize(this, anychart.annotationsModule.X_ANCHOR_DESCRIPTORS, config);
  anychart.core.settings.deserialize(this, anychart.annotationsModule.VALUE_ANCHOR_DESCRIPTORS, config);
  anychart.core.settings.deserialize(this, anychart.annotationsModule.SECOND_ANCHOR_POINT_DESCRIPTORS, config);
};


/** @inheritDoc */
anychart.annotationsModule.VerticalRange.prototype.disposeInternal = function() {
  anychart.annotationsModule.VerticalRange.base(this, 'disposeInternal');
  goog.disposeAll(this.paths_);

  delete this.strokeResolver_;
  delete this.fillResolver_;
  delete this.hatchFillResolver_;
};


//endregion
