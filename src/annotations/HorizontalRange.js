goog.provide('anychart.annotationsModule.HorizontalRange');
goog.require('anychart.annotationsModule');
goog.require('anychart.annotationsModule.Base');
goog.require('anychart.core.settings');
goog.require('anychart.enums');



/**
 * HorizontalRange annotation.
 * @param {!anychart.annotationsModule.ChartController} chartController
 * @constructor
 * @extends {anychart.annotationsModule.Base}
 */
anychart.annotationsModule.HorizontalRange = function(chartController) {
  anychart.annotationsModule.HorizontalRange.base(this, 'constructor', chartController);

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
goog.inherits(anychart.annotationsModule.HorizontalRange, anychart.annotationsModule.Base);
anychart.core.settings.populateAliases(anychart.annotationsModule.HorizontalRange, ['fill', 'hatchFill', 'stroke'], 'normal');
anychart.core.settings.populate(anychart.annotationsModule.HorizontalRange, anychart.annotationsModule.X_ANCHOR_DESCRIPTORS);
anychart.core.settings.populate(anychart.annotationsModule.HorizontalRange, anychart.annotationsModule.VALUE_ANCHOR_DESCRIPTORS);
anychart.core.settings.populate(anychart.annotationsModule.HorizontalRange, anychart.annotationsModule.SECOND_ANCHOR_POINT_DESCRIPTORS);
anychart.annotationsModule.AnnotationTypes[anychart.enums.AnnotationTypes.HORIZONTAL_RANGE] = anychart.annotationsModule.HorizontalRange;


//region Properties
/** @inheritDoc */
anychart.annotationsModule.HorizontalRange.prototype.type = anychart.enums.AnnotationTypes.HORIZONTAL_RANGE;


/**
 * Supported anchors.
 * @type {anychart.annotationsModule.AnchorSupport}
 */
anychart.annotationsModule.HorizontalRange.prototype.SUPPORTED_ANCHORS = anychart.annotationsModule.AnchorSupport.TWO_POINTS;


//endregion
//region StateSettings
/** @inheritDoc */
anychart.annotationsModule.HorizontalRange.prototype.getNormalDescriptorsMeta = function() {
  var base = anychart.annotationsModule.HorizontalRange.base(this, 'getNormalDescriptorsMeta');
  return goog.array.concat(base, anychart.annotationsModule.FILL_STROKE_DESCRIPTORS_META);
};


//endregion
//region Calculation
/** @inheritDoc */
anychart.annotationsModule.HorizontalRange.prototype.calculate = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.ANNOTATIONS_ANCHORS)) {
    var xScale, yScale;
    xScale = this.xScale();
    yScale = this.yScale();
    if (!xScale || !yScale) return false;

    var firstY, secondY;
    var availableCoords = 0;
    var missingCoords = 0;

    firstY = this.yRatioToPix(yScale.transform(this.getOwnOption('valueAnchor'), 0.5));
    if (isNaN(firstY))
      missingCoords |= anychart.annotationsModule.AnchorSupport.ONE_POINT;
    else
      availableCoords |= anychart.annotationsModule.AnchorSupport.ONE_POINT;

    secondY = this.yRatioToPix(yScale.transform(this.getOwnOption('secondValueAnchor'), 0.5));
    if (isNaN(secondY))
      missingCoords |= anychart.annotationsModule.AnchorSupport.SECOND_POINT;
    else
      availableCoords |= anychart.annotationsModule.AnchorSupport.SECOND_POINT;

    // we allow dragging draw if we are missing more than two points
    var dragDrawingAvailable = false;
    var lastPointYName = null;
    if (!!(missingCoords & anychart.annotationsModule.AnchorSupport.ONE_POINT)) {
      lastPointYName = 'valueAnchor';
      dragDrawingAvailable = true;
      this.lastPointAnchor = anychart.annotationsModule.AnchorSupport.ONE_POINT;
    } else if (!!(missingCoords & anychart.annotationsModule.AnchorSupport.SECOND_POINT)) {
      lastPointYName = 'secondValueAnchor';
      dragDrawingAvailable = false;
      this.lastPointAnchor = anychart.annotationsModule.AnchorSupport.TWO_POINTS;
    } else {
      this.lastPointAnchor = anychart.annotationsModule.AnchorSupport.NONE;
    }

    this.coords['valueAnchor'] = firstY;
    this.coords['secondValueAnchor'] = secondY;

    this.anchorsAvailable = availableCoords;
    this.lastPointXName = null;
    this.lastPointYName = lastPointYName;
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
anychart.annotationsModule.HorizontalRange.prototype.createPositionProviders = function() {
  var res = [];
  var centerX = this.pixelBoundsCache.left + this.pixelBoundsCache.width / 2;
  if (!!(this.SUPPORTED_ANCHORS & this.anchorsWithLastPoint & anychart.annotationsModule.AnchorSupport.ONE_POINT)) {
    res.push({'x': centerX, 'y': this.coords['valueAnchor']});
    if (!!(this.SUPPORTED_ANCHORS & this.anchorsWithLastPoint & anychart.annotationsModule.AnchorSupport.SECOND_POINT)) {
      res.push({'x': centerX, 'y': this.coords['secondValueAnchor']});
    }
  }
  return goog.array.map(res, function(item) { return {'value': item}; });
};


/** @inheritDoc */
anychart.annotationsModule.HorizontalRange.prototype.checkVisible = function() {
  var coords = [];
  coords.push(this.coords['valueAnchor']);
  coords.push(this.coords['secondValueAnchor']);
  var bounds = this.pixelBoundsCache;
  var allTop = true;
  var allBottom = true;
  var coord;
  for (var i = 0; i < coords.length; i++) {
    if (!isNaN(coord = coords[i])) {
      allTop = allTop && coords[i] < bounds.top;
      allBottom = allBottom && coords[i] > bounds.getBottom();
    }
  }
  return !allTop && !allBottom;
};


//endregion
//region Drawing
/** @inheritDoc */
anychart.annotationsModule.HorizontalRange.prototype.ensureCreated = function() {
  anychart.annotationsModule.HorizontalRange.base(this, 'ensureCreated');

  if (!this.paths_) {
    // horizontal lines
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
anychart.annotationsModule.HorizontalRange.prototype.setMarkerCursor = function(marker, index) {
  marker.getDomElement().cursor(/** @type {acgraph.vector.Cursor} */(anychart.enums.Cursor.NS_RESIZE));
};


/** @inheritDoc */
anychart.annotationsModule.HorizontalRange.prototype.drawOnePointShape = function(x, y) {
  y = anychart.utils.applyPixelShift(y, anychart.utils.extractThickness(
      /** @type {acgraph.vector.Stroke} */(this.paths_[0].stroke())));
  this.paths_[0].clear();
  this.paths_[0].moveTo(this.pixelBoundsCache.left, y).lineTo(this.pixelBoundsCache.getRight(), y);
};


/** @inheritDoc */
anychart.annotationsModule.HorizontalRange.prototype.drawTwoPointsShape = function(x1, y1, x2, y2) {
  var thickness = anychart.utils.extractThickness(/** @type {acgraph.vector.Stroke} */(this.paths_[0].stroke()));
  y1 = anychart.utils.applyPixelShift(y1, thickness);
  y2 = anychart.utils.applyPixelShift(y2, thickness);

  var left = this.pixelBoundsCache.left;
  var right = this.pixelBoundsCache.getRight();

  var path = this.paths_[0];
  path.clear()
      .moveTo(left, y1).lineTo(right, y1)
      .moveTo(left, y2).lineTo(right, y2);

  for (var i = 1; i < this.paths_.length; i++) {
    path = this.paths_[i];
    path.clear()
        .moveTo(left, y1)
        .lineTo(right, y1)
        .lineTo(right, y2)
        .lineTo(left, y2)
        .close();
  }
};


/** @inheritDoc */
anychart.annotationsModule.HorizontalRange.prototype.colorize = function(state) {
  anychart.annotationsModule.HorizontalRange.base(this, 'colorize', state);
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
anychart.annotationsModule.HorizontalRange.prototype.serialize = function() {
  var json = anychart.annotationsModule.HorizontalRange.base(this, 'serialize');

  anychart.core.settings.serialize(this, anychart.annotationsModule.X_ANCHOR_DESCRIPTORS, json, 'Annotation');
  anychart.core.settings.serialize(this, anychart.annotationsModule.VALUE_ANCHOR_DESCRIPTORS, json, 'Annotation');
  anychart.core.settings.serialize(this, anychart.annotationsModule.SECOND_ANCHOR_POINT_DESCRIPTORS, json, 'Annotation');

  return json;
};


/** @inheritDoc */
anychart.annotationsModule.HorizontalRange.prototype.setupByJSON = function(config, opt_default) {
  anychart.annotationsModule.HorizontalRange.base(this, 'setupByJSON', config, opt_default);

  anychart.core.settings.deserialize(this, anychart.annotationsModule.X_ANCHOR_DESCRIPTORS, config);
  anychart.core.settings.deserialize(this, anychart.annotationsModule.VALUE_ANCHOR_DESCRIPTORS, config);
  anychart.core.settings.deserialize(this, anychart.annotationsModule.SECOND_ANCHOR_POINT_DESCRIPTORS, config);
};


/** @inheritDoc */
anychart.annotationsModule.HorizontalRange.prototype.disposeInternal = function() {
  anychart.annotationsModule.HorizontalRange.base(this, 'disposeInternal');
  goog.disposeAll(this.paths_);

  delete this.strokeResolver_;
  delete this.fillResolver_;
  delete this.hatchFillResolver_;
};


//endregion
