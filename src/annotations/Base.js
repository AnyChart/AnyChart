goog.provide('anychart.annotationsModule.Base');
goog.require('anychart.annotationsModule');
goog.require('anychart.core.IPlot');
goog.require('anychart.core.VisualBaseWithBounds');
goog.require('anychart.core.settings');
goog.require('anychart.core.ui.MarkersFactory');
goog.require('anychart.math.Rect');



/**
 * @param {!anychart.annotationsModule.ChartController} chartController
 * @constructor
 * @extends {anychart.core.VisualBaseWithBounds}
 */
anychart.annotationsModule.Base = function(chartController) {
  anychart.annotationsModule.Base.base(this, 'constructor');
  /**
   * Chart controller reference.
   * @type {!anychart.annotationsModule.ChartController}
   * @private
   */
  this.chartController_ = chartController;

  /**
   * Plot controller reference. Can be changed in drawing process.
   * @type {?anychart.annotationsModule.PlotController}
   * @private
   */
  this.plotController_ = null;

  /**
   * Root annotation layer.
   * @type {?acgraph.vector.Layer}
   */
  this.rootLayer = null;

  /**
   * Annotation state.
   * @type {anychart.PointState|number}
   * @protected
   */
  this.state = anychart.PointState.NORMAL;

  /**
   * A set of defined anchors.
   * @type {(anychart.annotationsModule.AnchorSupport|number)}
   */
  this.anchorsAvailable = 0;

  /**
   * A set of missing anchors.
   * @type {(anychart.annotationsModule.AnchorSupport|number)}
   */
  this.anchorsMissing = this.SUPPORTED_ANCHORS;

  /**
   * A name of X coord that is vacant for last point value.
   * @type {?string}
   */
  this.lastPointXName = !!(this.SUPPORTED_ANCHORS & anychart.annotationsModule.AnchorSupport.X) ? 'xAnchor' : null;

  /**
   * A name of Y coord that is vacant for last point value.
   * @type {?string}
   */
  this.lastPointYName = !!(this.SUPPORTED_ANCHORS & anychart.annotationsModule.AnchorSupport.VALUE) ? 'valueAnchor' : null;

  /**
   * If the dragging draw available in current state.
   * @type {boolean}
   */
  this.dragDrawingAvailable = this.SUPPORTED_ANCHORS >= anychart.annotationsModule.AnchorSupport.TWO_POINTS;

  /**
   * If the annotation is visible (determined only by fixed anchors).
   * @type {boolean}
   */
  this.isVisible = false;

  /**
   * Object with anchor coords by names.
   * @type {Object.<number>}
   */
  this.coords = {};
  this.coords['xAnchor'] = NaN;
  this.coords['valueAnchor'] = NaN;
  this.coords['secondXAnchor'] = NaN;
  this.coords['secondValueAnchor'] = NaN;
  this.coords['thirdXAnchor'] = NaN;
  this.coords['thirdValueAnchor'] = NaN;

  /**
   * Secured coords for dragging.
   * @type {?Object.<number>}
   */
  this.securedCoords = null;

  /**
   * Pixel bounds cache.
   */
  this.pixelBoundsCache = new anychart.math.Rect(0, 0, 0, 0);

  /**
   * If the markers are supported.
   * @type {boolean}
   * @protected
   */
  this.markersSupported = true;

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, anychart.annotationsModule.BASE_DESCRIPTORS_META);
};
goog.inherits(anychart.annotationsModule.Base, anychart.core.VisualBaseWithBounds);
anychart.core.settings.populate(anychart.annotationsModule.Base, anychart.annotationsModule.BASE_DESCRIPTORS);


//region Infrastructure
//----------------------------------------------------------------------------------------------------------------------
//
//  Infrastructure
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Supported consistency states.
 * @type {number}
 */
anychart.annotationsModule.Base.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBaseWithBounds.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.ANNOTATIONS_ANCHORS |
    anychart.ConsistencyState.ANNOTATIONS_LAST_POINT |
    anychart.ConsistencyState.ANNOTATIONS_SHAPES |
    anychart.ConsistencyState.ANNOTATIONS_INTERACTIVITY |
    anychart.ConsistencyState.ANNOTATIONS_MARKERS;


/**
 * Supported signals.
 * @type {number}
 */
anychart.annotationsModule.Base.prototype.SUPPORTED_SIGNALS =
    anychart.core.VisualBaseWithBounds.prototype.SUPPORTED_SIGNALS;


/**
 * Anchors support state.
 * @type {anychart.annotationsModule.AnchorSupport}
 */
anychart.annotationsModule.Base.prototype.SUPPORTED_ANCHORS = anychart.annotationsModule.AnchorSupport.NONE;


/**
 * Visible shapes Z index.
 * @type {number}
 */
anychart.annotationsModule.Base.SHAPES_ZINDEX = 0;


/**
 * Hatch shapes Z index.
 * @type {number}
 */
anychart.annotationsModule.Base.HATCH_ZINDEX = 1;


/**
 * Visible shapes Z index.
 * @type {number}
 */
anychart.annotationsModule.Base.STROKE_ZINDEX = 2;


/**
 * Transparent shapes Z index.
 * @type {number}
 */
anychart.annotationsModule.Base.HOVER_SHAPE_ZINDEX = 3;


/**
 * Markers factory Z index.
 * @type {number}
 */
anychart.annotationsModule.Base.LABELS_ZINDEX = 4;


/**
 * Markers factory Z index.
 * @type {number}
 */
anychart.annotationsModule.Base.MARKERS_ZINDEX = 5;


/**
 * Annotations cache of resolver functions.
 * @type {Object.<string, function(anychart.annotationsModule.Base, number):(acgraph.vector.Fill|acgraph.vector.Stroke|acgraph.vector.PatternFill)>}
 * @private
 */
anychart.annotationsModule.Base.colorResolversCache_ = {};


//endregion
//region Properties
//----------------------------------------------------------------------------------------------------------------------
//
//  Properties
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Annotation type.
 * @type {anychart.enums.AnnotationTypes}
 * @protected
 */
anychart.annotationsModule.Base.prototype.type;


/**
 * Annotation Y scale.
 * @type {anychart.scales.Base}
 * @private
 */
anychart.annotationsModule.Base.prototype.yScale_ = null;


/**
 * Annotation X scale.
 * @type {anychart.scales.IXScale}
 * @private
 */
anychart.annotationsModule.Base.prototype.xScale_ = null;


//endregion
//region Published methods
//----------------------------------------------------------------------------------------------------------------------
//
//  Published methods
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Returns annotation type.
 * @return {anychart.enums.AnnotationTypes}
 */
anychart.annotationsModule.Base.prototype.getType = function() {
  return this.type;
};


/**
 * Returns the chart on which the annotation is drawn.
 * @return {!anychart.core.IChart}
 */
anychart.annotationsModule.Base.prototype.getChart = function() {
  return this.chartController_.getChart();
};


/**
 * Returns the plot on which the annotation is drawn (if any).
 * @return {?anychart.core.IPlot}
 */
anychart.annotationsModule.Base.prototype.getPlot = function() {
  return this.plotController_ && this.plotController_.getPlot();
};


/**
 * Getter/setter for an yScale.
 * @param {anychart.scales.Base=} opt_value
 * @return {anychart.annotationsModule.Base|anychart.scales.Base}
 */
anychart.annotationsModule.Base.prototype.yScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = opt_value || null;
    if (this.yScale_ != opt_value) {
      if (this.yScale_)
        this.yScale_.unlistenSignals(this.scaleSignalHandler_, this);
      this.yScale_ = opt_value;
      if (this.yScale_)
        this.yScale_.listenSignals(this.scaleSignalHandler_, this);
      this.invalidate(anychart.ConsistencyState.ANNOTATIONS_ANCHORS, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return /** @type {anychart.scales.Base} */((this.yScale_ ? this.yScale_ : (this.getPlot() && this.getPlot().yScale())) || null);
};


/**
 * Getter/setter for an yScale.
 * @param {anychart.scales.Base|anychart.stockModule.scales.Scatter=} opt_value
 * @return {anychart.annotationsModule.Base|anychart.scales.Base|anychart.stockModule.scales.Scatter}
 */
anychart.annotationsModule.Base.prototype.xScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = opt_value || null;
    if (this.xScale_ != opt_value) {
      if (this.xScale_)
        (/** @type {anychart.core.Base} */(this.xScale_)).unlistenSignals(this.scaleSignalHandler_, this);
      this.xScale_ = opt_value;
      if (this.xScale_)
        this.xScale_.listenSignals(this.scaleSignalHandler_, this);
      this.invalidate(anychart.ConsistencyState.ANNOTATIONS_ANCHORS, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return /** @type {anychart.scales.Base|anychart.stockModule.scales.Scatter} */(
      this.xScale_ || this.getChart().xScale());
};


//endregion
//region Public methods
//----------------------------------------------------------------------------------------------------------------------
//
//  Public methods
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Sets plotController.
 * @param {anychart.annotationsModule.PlotController} plotController
 * @param {boolean} allowUnbind
 */
anychart.annotationsModule.Base.prototype.setPlot = function(plotController, allowUnbind) {
  var needInvalidate = this.plotController_ != plotController;
  this.allowUnbindPlot_ = allowUnbind;
  this.plotController_ = plotController;
  if (needInvalidate)
    this.invalidate(anychart.ConsistencyState.ANNOTATIONS_ANCHORS);
};


/**
 * Returns plot controller.
 * @return {?anychart.annotationsModule.PlotController}
 */
anychart.annotationsModule.Base.prototype.getPlotController = function() {
  return this.plotController_;
};


/**
 * If current plot is set temporary and can be unbound.
 * @return {boolean}
 */
anychart.annotationsModule.Base.prototype.canUnbindPlot = function() {
  return this.allowUnbindPlot_;
};


/**
 * Updates last point in drawing mode.
 * @param {number} x
 * @param {number} y
 */
anychart.annotationsModule.Base.prototype.updateLastPoint = function(x, y) {
  this.lastPointX = x;
  this.lastPointY = y;
  this.invalidate(anychart.ConsistencyState.ANNOTATIONS_LAST_POINT);
};


/**
 * Saves last recorded point coords as last point in drawing mode.
 */
anychart.annotationsModule.Base.prototype.saveLastPoint = function() {
  this.calculate();
  if (this.lastPointXName) {
    this.ownSettings[this.lastPointXName] = this.xScale().inverseTransform(
        (this.lastPointX - this.pixelBoundsCache.left) / this.pixelBoundsCache.width);
  }
  if (this.lastPointYName)
    this.ownSettings[this.lastPointYName] = this.yScale().inverseTransform(
        (this.pixelBoundsCache.getBottom() - this.lastPointY) / this.pixelBoundsCache.height);
  this.lastPointX = this.lastPointY = NaN;
  this.allowUnbindPlot_ = false;
  this.invalidate(anychart.ConsistencyState.ANNOTATIONS_ANCHORS);
};


/**
 * Removes last point.
 */
anychart.annotationsModule.Base.prototype.removeLastPoint = function() {
  this.lastPointX = NaN;
  this.lastPointY = NaN;
  this.invalidate(anychart.ConsistencyState.ANNOTATIONS_LAST_POINT);
};


/**
 * Saves a copy of computed coords to allow drag positioning.
 */
anychart.annotationsModule.Base.prototype.secureCurrentPosition = function() {
  this.securedCoords = this.coords;
  this.coords = goog.object.clone(this.coords);
};


/**
 * Moves anchor by the dx and dy.
 * @param {number} anchorId
 * @param {number} dx
 * @param {number} dy
 * @return {anychart.annotationsModule.Base}
 */
anychart.annotationsModule.Base.prototype.moveAnchor = function(anchorId, dx, dy) {
  switch (anchorId) {
    case -1: // moving whole annotation
      if (!!(this.SUPPORTED_ANCHORS & anychart.annotationsModule.AnchorSupport.ONE_POINT)) {
        this.moveAnchor_(
            !!(this.SUPPORTED_ANCHORS & anychart.annotationsModule.AnchorSupport.X) ? 'xAnchor' : null,
            !!(this.SUPPORTED_ANCHORS & anychart.annotationsModule.AnchorSupport.VALUE) ? 'valueAnchor' : null,
            dx, dy);
        if (!!(this.SUPPORTED_ANCHORS & anychart.annotationsModule.AnchorSupport.TWO_POINTS)) {
          this.moveAnchor_('secondXAnchor', 'secondValueAnchor', dx, dy);
          if (!!(this.SUPPORTED_ANCHORS & anychart.annotationsModule.AnchorSupport.THREE_POINTS)) {
            this.moveAnchor_('thirdXAnchor', 'thirdValueAnchor', dx, dy);
          }
        }
      }
      break;
    case 0:
      this.moveAnchor_(
          !!(this.SUPPORTED_ANCHORS & anychart.annotationsModule.AnchorSupport.X) ? 'xAnchor' : null,
          !!(this.SUPPORTED_ANCHORS & anychart.annotationsModule.AnchorSupport.VALUE) ? 'valueAnchor' : null,
          dx, dy);
      break;
    case 1:
      this.moveAnchor_('secondXAnchor', 'secondValueAnchor', dx, dy);
      break;
    case 2:
      this.moveAnchor_('thirdXAnchor', 'thirdValueAnchor', dx, dy);
      break;
  }
  this.invalidate(anychart.ConsistencyState.ANNOTATIONS_SHAPES | anychart.ConsistencyState.ANNOTATIONS_MARKERS);
  this.draw();
  return this;
};


/**
 * Moves particular anchor.
 * @param {?string} xName
 * @param {?string} yName
 * @param {number} dx
 * @param {number} dy
 * @private
 */
anychart.annotationsModule.Base.prototype.moveAnchor_ = function(xName, yName, dx, dy) {
  if (xName) {
    this.coords[xName] = this.securedCoords[xName] + dx;
    this.ownSettings[xName] = this.xScale().inverseTransform(
        (this.coords[xName] - this.pixelBoundsCache.left) / this.pixelBoundsCache.width);
  }
  if (yName) {
    this.coords[yName] = this.securedCoords[yName] + dy;
    this.ownSettings[yName] = this.yScale().inverseTransform(
        (this.pixelBoundsCache.getBottom() - this.coords[yName]) / this.pixelBoundsCache.height);
  }
};


/**
 * If the annotation can be interactively drawn in current state (has any unset anchors).
 * @return {boolean}
 */
anychart.annotationsModule.Base.prototype.isFinished = function() {
  this.calculate();
  return !this.lastPointXName && !this.lastPointYName;
};


/**
 * If the annotation can use dragging draw in current state.
 * @return {boolean}
 */
anychart.annotationsModule.Base.prototype.canUseDraggingDraw = function() {
  this.calculate();
  return this.dragDrawingAvailable;
};


/**
 * Sets annotations state. Internal method.
 * @param {anychart.PointState} state
 */
anychart.annotationsModule.Base.prototype.setState = function(state) {
  this.state = state;
  this.invalidate(anychart.ConsistencyState.ANNOTATIONS_MARKERS | anychart.ConsistencyState.APPEARANCE);
};


//endregion
//region Calculating points
//----------------------------------------------------------------------------------------------------------------------
//
//  Calculating points
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Calculates annotation anchor positions.
 * @return {boolean} Returns boolean whether the annotation should be drawn (checked by a checkVisible cached check).
 */
anychart.annotationsModule.Base.prototype.calculate = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.ANNOTATIONS_ANCHORS)) {
    var xScale, yScale;
    xScale = this.xScale();
    yScale = this.yScale();
    if (!xScale || !yScale) return false;

    var firstX, firstY, secondX, secondY, thirdX, thirdY;
    firstX = firstY = secondX = secondY = thirdX = thirdY = NaN;
    var availableCoords = 0;
    var missingCoords = 0;
    if (!!(this.SUPPORTED_ANCHORS & anychart.annotationsModule.AnchorSupport.X)) {
      firstX = this.xRatioToPix(xScale.transform(this.getOwnOption('xAnchor'), 0.5));
      if (isNaN(firstX))
        missingCoords |= anychart.annotationsModule.AnchorSupport.X;
      else
        availableCoords |= anychart.annotationsModule.AnchorSupport.X;
    }
    if (!!(this.SUPPORTED_ANCHORS & anychart.annotationsModule.AnchorSupport.VALUE)) {
      firstY = this.yRatioToPix(yScale.transform(this.getOwnOption('valueAnchor'), 0.5));
      if (isNaN(firstY))
        missingCoords |= anychart.annotationsModule.AnchorSupport.VALUE;
      else
        availableCoords |= anychart.annotationsModule.AnchorSupport.VALUE;
    }
    if (!!(this.SUPPORTED_ANCHORS & anychart.annotationsModule.AnchorSupport.SECOND_POINT)) {
      secondX = this.xRatioToPix(xScale.transform(this.getOwnOption('secondXAnchor'), 0.5));
      secondY = this.yRatioToPix(yScale.transform(this.getOwnOption('secondValueAnchor'), 0.5));
      if (isNaN(secondX) || isNaN(secondY))
        missingCoords |= anychart.annotationsModule.AnchorSupport.SECOND_POINT;
      else
        availableCoords |= anychart.annotationsModule.AnchorSupport.SECOND_POINT;
    }
    if (!!(this.SUPPORTED_ANCHORS & anychart.annotationsModule.AnchorSupport.THIRD_POINT)) {
      thirdX = this.xRatioToPix(xScale.transform(this.getOwnOption('thirdXAnchor'), 0.5));
      thirdY = this.yRatioToPix(yScale.transform(this.getOwnOption('thirdValueAnchor'), 0.5));
      if (isNaN(thirdX) || isNaN(thirdY))
        missingCoords |= anychart.annotationsModule.AnchorSupport.THIRD_POINT;
      else
        availableCoords |= anychart.annotationsModule.AnchorSupport.THIRD_POINT;
    }

    // we allow dragging draw if we are missing more than two points
    var dragDrawingAvailable = false;
    var lastPointXName = null;
    var lastPointYName = null;
    if (!!(missingCoords & anychart.annotationsModule.AnchorSupport.ONE_POINT)) {
      lastPointXName = !!(this.SUPPORTED_ANCHORS & anychart.annotationsModule.AnchorSupport.X) ? 'xAnchor' : null;
      lastPointYName = !!(this.SUPPORTED_ANCHORS & anychart.annotationsModule.AnchorSupport.VALUE) ? 'valueAnchor' : null;
      dragDrawingAvailable = this.SUPPORTED_ANCHORS > anychart.annotationsModule.AnchorSupport.ONE_POINT;
      this.lastPointAnchor = this.SUPPORTED_ANCHORS & anychart.annotationsModule.AnchorSupport.ONE_POINT;
    } else if (!!(missingCoords & anychart.annotationsModule.AnchorSupport.SECOND_POINT)) {
      lastPointXName = 'secondXAnchor';
      lastPointYName = 'secondValueAnchor';
      dragDrawingAvailable = this.SUPPORTED_ANCHORS > anychart.annotationsModule.AnchorSupport.TWO_POINTS;
      this.lastPointAnchor = anychart.annotationsModule.AnchorSupport.SECOND_POINT;
    } else if (!!(missingCoords & anychart.annotationsModule.AnchorSupport.THIRD_POINT)) {
      lastPointXName = 'thirdXAnchor';
      lastPointYName = 'thirdValueAnchor';
      this.lastPointAnchor = anychart.annotationsModule.AnchorSupport.THIRD_POINT;
    } else {
      this.lastPointAnchor = anychart.annotationsModule.AnchorSupport.NONE;
    }

    this.coords['xAnchor'] = firstX;
    this.coords['valueAnchor'] = firstY;
    this.coords['secondXAnchor'] = secondX;
    this.coords['secondValueAnchor'] = secondY;
    this.coords['thirdXAnchor'] = thirdX;
    this.coords['thirdValueAnchor'] = thirdY;

    this.anchorsAvailable = availableCoords;
    this.lastPointXName = lastPointXName;
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
    this.invalidate(
        anychart.ConsistencyState.ANNOTATIONS_SHAPES |
        anychart.ConsistencyState.ANNOTATIONS_MARKERS);
    this.markConsistent(anychart.ConsistencyState.ANNOTATIONS_LAST_POINT);
  }

  return this.isVisible || (!isNaN(this.lastPointX) && !isNaN(this.lastPointY));
};


/**
 * Should check if fixed anchors are visible in current selected range.
 * @return {boolean}
 * @protected
 */
anychart.annotationsModule.Base.prototype.checkVisible = function() {
  var coord;
  var bounds = this.pixelBoundsCache;
  if (this.SUPPORTED_ANCHORS == anychart.annotationsModule.AnchorSupport.VALUE) {
    coord = this.coords['valueAnchor'];
    return coord >= bounds.top && coord <= (bounds.getBottom());
  } else {
    var coords = [];
    coords.push(this.coords['xAnchor']);
    coords.push(this.coords['secondXAnchor']);
    coords.push(this.coords['thirdXAnchor']);
    var allLeft = true;
    var allRight = true;
    for (var i = 0; i < coords.length; i++) {
      if (!isNaN(coord = coords[i])) {
        allLeft = allLeft && coords[i] < bounds.left;
        allRight = allRight && coords[i] > bounds.getRight();
      }
    }
    return !allLeft && !allRight;
  }
};


/**
 * Transforms passed X ratio (usually transformed by a scale) to X pixel position.
 * @param {number} ratio
 * @return {number}
 * @protected
 */
anychart.annotationsModule.Base.prototype.xRatioToPix = function(ratio) {
  return this.pixelBoundsCache.left + ratio * this.pixelBoundsCache.width;
};


/**
 * Transforms passed Y ratio (usually transformed by a scale) to Y pixel position.
 * @param {number} ratio
 * @return {number}
 * @protected
 */
anychart.annotationsModule.Base.prototype.yRatioToPix = function(ratio) {
  return this.pixelBoundsCache.getBottom() - ratio * this.pixelBoundsCache.height;
};


//endregion
//region Drawing
//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Draws the annotation.
 * @return {anychart.annotationsModule.Base}
 */
anychart.annotationsModule.Base.prototype.draw = function() {
  // calculate is called here also
  if (!this.checkDrawingNeeded())
    return this;

  this.suspendSignalsDispatching();

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.pixelBoundsCache = this.getPixelBounds();
    this.invalidate(anychart.ConsistencyState.ANNOTATIONS_ANCHORS);
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  this.ensureCreated();
  var visible = this.calculate();
  this.resolveCustomPreDrawingStates();

  // we often need stroke thickness to draw more sharply
  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    this.colorize(this.state);
    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.ANNOTATIONS_SHAPES)) {
    if (visible) {
      if (this.SUPPORTED_ANCHORS == anychart.annotationsModule.AnchorSupport.THREE_POINTS &&
          this.anchorsWithLastPoint == anychart.annotationsModule.AnchorSupport.THREE_POINTS) {
        this.drawThreePointsShape(
            this.coords['xAnchor'],
            this.coords['valueAnchor'],
            this.coords['secondXAnchor'],
            this.coords['secondValueAnchor'],
            this.coords['thirdXAnchor'],
            this.coords['thirdValueAnchor']);
      } else if (this.SUPPORTED_ANCHORS >= anychart.annotationsModule.AnchorSupport.TWO_POINTS &&
          this.anchorsWithLastPoint >= anychart.annotationsModule.AnchorSupport.TWO_POINTS) {
        this.drawTwoPointsShape(
            this.coords['xAnchor'],
            this.coords['valueAnchor'],
            this.coords['secondXAnchor'],
            this.coords['secondValueAnchor']);
      } else if (this.SUPPORTED_ANCHORS >= anychart.annotationsModule.AnchorSupport.ONE_POINT &&
          this.anchorsWithLastPoint >= anychart.annotationsModule.AnchorSupport.ONE_POINT ||
          this.anchorsWithLastPoint == this.SUPPORTED_ANCHORS) {
        this.drawOnePointShape(
            this.coords['xAnchor'],
            this.coords['valueAnchor']);
      }
    } else {
      this.remove();
      this.invalidate(anychart.ConsistencyState.CONTAINER);
      this.resumeSignalsDispatching(false);
      return this;
    }
    this.markConsistent(anychart.ConsistencyState.ANNOTATIONS_SHAPES);
  }


  if (this.hasInvalidationState(anychart.ConsistencyState.ANNOTATIONS_INTERACTIVITY)) {
    this.rootLayer.disablePointerEvents(!this.getOption('allowEdit'));
    this.markConsistent(anychart.ConsistencyState.ANNOTATIONS_INTERACTIVITY);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.ANNOTATIONS_MARKERS)) {
    if (this.markersSupported) {
      var factory = /** @type {anychart.core.ui.MarkersFactory} */(this.markers());
      var stateFactoriesEnabled = /** @type {boolean} */(this.hoverMarkers().enabled() || /** @type {anychart.core.ui.MarkersFactory} */(this.selectMarkers()).enabled());
      factory.suspendSignalsDispatching();
      if ((factory.enabled() !== false) || stateFactoriesEnabled) {
        factory.container(this.rootLayer);
        factory.clear();
        factory.parentBounds(this.pixelBoundsCache);
        factory.setAutoZIndex(anychart.annotationsModule.Base.MARKERS_ZINDEX);
        this.drawMarkers_(this.state);
      } else {
        factory.clear();
        factory.container(null);
      }
      factory.draw();
      factory.resumeSignalsDispatching(false);
    }
    this.markConsistent(anychart.ConsistencyState.ANNOTATIONS_MARKERS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    this.rootLayer.zIndex(/** @type {number} */(this.zIndex()));
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    this.rootLayer.parent(/** @type {acgraph.vector.ILayer} */(this.container()));
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  this.resumeSignalsDispatching(false);

  return this;
};


/**
 * Resolves custom draw states, that should be resolved before shapes drawing, if any.
 */
anychart.annotationsModule.Base.prototype.resolveCustomPreDrawingStates = function() {
};


/** @inheritDoc */
anychart.annotationsModule.Base.prototype.checkDrawingNeeded = function() {
  var res = anychart.annotationsModule.Base.base(this, 'checkDrawingNeeded');
  if (res && (!this.plotController_ || !this.xScale() || !this.yScale())) {
    this.remove();
    this.invalidate(anychart.ConsistencyState.CONTAINER);
    res = false;
  }
  return res;
};


/** @inheritDoc */
anychart.annotationsModule.Base.prototype.remove = function() {
  if (this.rootLayer)
    this.rootLayer.remove();
  if (this.markers_) {
    this.markers_.remove();
    this.markers_.invalidate(anychart.ConsistencyState.CONTAINER);
  }
};


/**
 * Ensures that all visual objects are created.
 * @protected
 */
anychart.annotationsModule.Base.prototype.ensureCreated = function() {
  if (!this.rootLayer) {
    this.rootLayer = acgraph.layer();
    this.rootLayer.cursor(acgraph.vector.Cursor.MOVE);
    this.rootLayer.tag = this;
  }
};


/**
 * Draws current annotation with one point defined.
 * @param {number} x
 * @param {number} y
 * @protected
 */
anychart.annotationsModule.Base.prototype.drawOnePointShape = function(x, y) {};


/**
 * Draws current annotation with two points defined.
 * @param {number} firstX
 * @param {number} firstY
 * @param {number} secondX
 * @param {number} secondY
 * @protected
 */
anychart.annotationsModule.Base.prototype.drawTwoPointsShape = function(firstX, firstY, secondX, secondY) {
  // this is a fallback for an unimplemented case.
  this.drawOnePointShape(firstX, firstY);
};


/**
 * Draws current annotation with one point defined.
 * @param {number} firstX
 * @param {number} firstY
 * @param {number} secondX
 * @param {number} secondY
 * @param {number} thirdX
 * @param {number} thirdY
 * @protected
 */
anychart.annotationsModule.Base.prototype.drawThreePointsShape = function(firstX, firstY, secondX, secondY, thirdX, thirdY) {
  // this is a fallback for an unimplemented case.
  this.drawTwoPointsShape(firstX, firstY, secondX, secondY);
};


/**
 * Colorizes annotations paths.
 * @param {anychart.PointState|number} state
 * @protected
 */
anychart.annotationsModule.Base.prototype.colorize = function(state) {};


//endregion
//region Color resolution
//----------------------------------------------------------------------------------------------------------------------
//
//  Color resolution
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Returns a color resolver for passed color names and type.
 * @param {?Array.<string>} colorNames
 * @param {anychart.enums.ColorType} colorType
 * @return {function(anychart.annotationsModule.Base, number, number=):acgraph.vector.AnyColor}
 */
anychart.annotationsModule.Base.getColorResolver = function(colorNames, colorType) {
  if (!colorNames) return anychart.annotationsModule.Base.getNullColor_;
  var hash = colorType + '|' + colorNames.join('|');
  var result = anychart.annotationsModule.Base.colorResolversCache_[hash];
  if (!result) {
    /** @type {!Function} */
    var normalizerFunc;
    switch (colorType) {
      case anychart.enums.ColorType.STROKE:
        normalizerFunc = anychart.core.settings.strokeOrFunctionSimpleNormalizer;
        break;
      case anychart.enums.ColorType.HATCH_FILL:
        normalizerFunc = anychart.core.settings.hatchFillOrFunctionSimpleNormalizer;
        break;
      default:
      case anychart.enums.ColorType.FILL:
        normalizerFunc = anychart.core.settings.fillOrFunctionSimpleNormalizer;
        break;
    }
    anychart.annotationsModule.Base.colorResolversCache_[hash] = result = goog.partial(anychart.annotationsModule.Base.getColor_,
        colorNames, normalizerFunc, colorType == anychart.enums.ColorType.HATCH_FILL);
  }
  return result;
};


/**
 * Returns final color or hatch fill for passed params.
 * @param {Array.<string>} colorNames
 * @param {!Function} normalizer
 * @param {boolean} isHatchFill
 * @param {anychart.annotationsModule.Base} annotation
 * @param {number} state
 * @param {number=} opt_level
 * @return {acgraph.vector.Fill|acgraph.vector.Stroke|acgraph.vector.PatternFill}
 * @private
 */
anychart.annotationsModule.Base.getColor_ = function(colorNames, normalizer, isHatchFill, annotation, state, opt_level) {
  var stateColor, context;
  state = anychart.core.utils.InteractivityState.clarifyState(state);
  if (state != anychart.PointState.NORMAL && colorNames.length > 1) {
    stateColor = annotation.getOption(colorNames[state]);
    if (isHatchFill && stateColor === true)
      stateColor = normalizer(annotation.getAutoHatchFill());
    if (goog.isDef(stateColor)) {
      if (!goog.isFunction(stateColor))
        return /** @type {acgraph.vector.Fill|acgraph.vector.Stroke|acgraph.vector.PatternFill} */(stateColor);
      else if (isHatchFill) { // hatch fills set as function some why cannot nest by initial implementation
        context = annotation.getHatchFillResolutionContext();
        return /** @type {acgraph.vector.PatternFill} */(normalizer(stateColor.call(context, context)));
      }
    }
  }
  // we can get here only if state color is undefined or is a function
  var color = annotation.getOption(colorNames[0]);
  if (isHatchFill && color === true)
    color = normalizer(annotation.getAutoHatchFill());
  if (goog.isFunction(color)) {
    context = isHatchFill ?
        annotation.getHatchFillResolutionContext() :
        annotation.getColorResolutionContext(undefined, opt_level);
    color = /** @type {acgraph.vector.Fill|acgraph.vector.Stroke|acgraph.vector.PatternFill} */(normalizer(color.call(context, context)));
  }
  if (stateColor) { // it is a function and not a hatch fill here
    context = annotation.getColorResolutionContext(/** @type {acgraph.vector.Fill|acgraph.vector.Stroke} */(color), opt_level);
    color = normalizer(stateColor.call(context, context));
  }
  return /** @type {acgraph.vector.Fill|acgraph.vector.Stroke|acgraph.vector.PatternFill} */(color);
};


/**
 * Returns normalized null stroke or fill.
 * @return {string}
 * @private
 */
anychart.annotationsModule.Base.getNullColor_ = function() {
  return 'none';
};


/**
 * Returns color resolution context.
 * This context is used to resolve a fill or stroke set as a function for current point.
 * @param {(acgraph.vector.Fill|acgraph.vector.Stroke)=} opt_baseColor
 * @param {number=} opt_level
 * @return {Object}
 */
anychart.annotationsModule.Base.prototype.getColorResolutionContext = function(opt_baseColor, opt_level) {
  return {
    'sourceColor': opt_baseColor || this.getOption('color') || 'blue'
  };
};


/**
 * Returns hatch fill resolution context.
 * This context is used to resolve a hatch fill set as a function for current point.
 * @return {Object}
 */
anychart.annotationsModule.Base.prototype.getHatchFillResolutionContext = function() {
  return {
    'sourceHatchFill': this.getAutoHatchFill()
  };
};


/**
 * Returns default series hatch fill.
 * @return {acgraph.vector.PatternFill}
 */
anychart.annotationsModule.Base.prototype.getAutoHatchFill = function() {
  return /*this.autoHatchFill || */acgraph.vector.normalizeHatchFill(acgraph.vector.HatchFill.HatchFillType.DIAGONAL_BRICK);
};


//endregion
//region Private methods
//----------------------------------------------------------------------------------------------------------------------
//
//  Private methods
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Scale signal handler
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.annotationsModule.Base.prototype.scaleSignalHandler_ = function(e) {
  if (e.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.ANNOTATIONS_ANCHORS, anychart.Signal.NEEDS_REDRAW);
  }
};


//endregion
//region Markers
//----------------------------------------------------------------------------------------------------------------------
//
//  Markers
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for markers.
 * @param {(Object|boolean|null|string)=} opt_value Series data markers settings.
 * @return {!(anychart.core.ui.MarkersFactory|anychart.annotationsModule.Base)} Markers instance or itself for chaining call.
 */
anychart.annotationsModule.Base.prototype.markers = function(opt_value) {
  if (!this.markers_) {
    this.markers_ = new anychart.core.ui.MarkersFactory(true, true);
    this.markers_.setParentEventTarget(this);
    this.markers_.listenSignals(this.markersInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.markers_.setup(opt_value);
    return this;
  }
  return this.markers_;
};


/**
 * Getter/setter for hoverMarkers.
 * @param {(Object|boolean|null|string)=} opt_value Series data markers settings.
 * @return {!(anychart.core.ui.MarkersFactory|anychart.annotationsModule.Base)} Markers instance or itself for chaining call.
 */
anychart.annotationsModule.Base.prototype.hoverMarkers = function(opt_value) {
  if (!this.hoverMarkers_) {
    this.hoverMarkers_ = new anychart.core.ui.MarkersFactory(true, true);
    // don't listen to it, for it will be reapplied at the next hover
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.hoverMarkers_.setup(opt_value);
    return this;
  }
  return this.hoverMarkers_;
};


/**
 * @param {(Object|boolean|null|string)=} opt_value Series data markers settings.
 * @return {!(anychart.core.ui.MarkersFactory|anychart.annotationsModule.Base)} Markers instance or itself for chaining call.
 */
anychart.annotationsModule.Base.prototype.selectMarkers = function(opt_value) {
  if (!this.selectMarkers_) {
    this.selectMarkers_ = new anychart.core.ui.MarkersFactory(true, true);
    // don't listen to it, for it will be reapplied at the next hover
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.selectMarkers_.setup(opt_value);
    return this;
  }
  return this.selectMarkers_;
};


/**
 * Listener for markers invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.annotationsModule.Base.prototype.markersInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.invalidate(anychart.ConsistencyState.ANNOTATIONS_MARKERS, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Draws element(s) for point.
 * @param {anychart.PointState|number} state
 * @private
 */
anychart.annotationsModule.Base.prototype.drawMarkers_ = function(state) {
  var mainFactory = /** @type {anychart.core.ui.MarkersFactory} */(this.markers());

  var stateFactory;
  state = anychart.core.utils.InteractivityState.clarifyState(state);

  switch (state) {
    case anychart.PointState.HOVER:
      stateFactory = /** @type {anychart.core.ui.MarkersFactory} */(this.hoverMarkers());
      break;
    case anychart.PointState.SELECT:
      stateFactory = /** @type {anychart.core.ui.MarkersFactory} */(this.selectMarkers());
      break;
    default:
      stateFactory = null;
      break;
  }

  var isDraw = (!stateFactory || goog.isNull(stateFactory.enabled())) ?
      mainFactory.enabled() :
      stateFactory.enabled();

  if (isDraw) {
    var positionProviders = this.createPositionProviders();
    for (var i = 0; i < positionProviders.length; i++) {
      var positionProvider = positionProviders[i];
      var element = mainFactory.getMarker(/** @type {number} */(i));
      if (element) {
        element.positionProvider(positionProvider);
      } else {
        element = mainFactory.add(positionProvider, i);
      }
      element.resetSettings();
      element.currentMarkersFactory(stateFactory || mainFactory);
      element.setSettings();
      element.draw();
    }
  } else {
    mainFactory.clear();
  }
};


/**
 * Returns an array of position providers
 * @return {Array.<Object>}
 * @protected
 */
anychart.annotationsModule.Base.prototype.createPositionProviders = function() {
  var res = [];
  if (this.SUPPORTED_ANCHORS == anychart.annotationsModule.AnchorSupport.X) {
    var firstX = this.coords['xAnchor'];
    if (!isNaN(firstX)) {
      res.push({'x': firstX, 'y': this.pixelBoundsCache.top + this.pixelBoundsCache.height / 2});
    }
  } else if (this.SUPPORTED_ANCHORS == anychart.annotationsModule.AnchorSupport.VALUE) {
    var firstY = this.coords['valueAnchor'];
    if (!isNaN(firstY)) {
      res.push({'x': this.pixelBoundsCache.left + this.pixelBoundsCache.width / 2, 'y': firstY});
    }
  } else if (!!(this.SUPPORTED_ANCHORS & this.anchorsWithLastPoint & anychart.annotationsModule.AnchorSupport.ONE_POINT)) {
    res.push({'x': this.coords['xAnchor'], 'y': this.coords['valueAnchor']});
    if (!!(this.SUPPORTED_ANCHORS & this.anchorsWithLastPoint & anychart.annotationsModule.AnchorSupport.SECOND_POINT)) {
      res.push({'x': this.coords['secondXAnchor'], 'y': this.coords['secondValueAnchor']});
      if (!!(this.SUPPORTED_ANCHORS & this.anchorsWithLastPoint & anychart.annotationsModule.AnchorSupport.THIRD_POINT)) {
        res.push({'x': this.coords['thirdXAnchor'], 'y': this.coords['thirdValueAnchor']});
      }
    }
  }
  return goog.array.map(res, function(item) { return {'value': item}; });
};


//endregion
//region Select/deselect
//----------------------------------------------------------------------------------------------------------------------
//
//  Select/deselect
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Selects current annotation.
 */
anychart.annotationsModule.Base.prototype.select = function() {
  this.plotController_.getController().select(this);
};


/**
 * Unselects annotation.
 */
anychart.annotationsModule.Base.prototype.unselect = function() {
  this.plotController_.getController().unselect();
};


//endregion
//region IObjectWithSettings impl
//----------------------------------------------------------------------------------------------------------------------
//
//  IObjectWithSettings impl
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.annotationsModule.Base.prototype.hasOwnOption = function(name) {
  return goog.isDefAndNotNull(this.ownSettings[name]);
};


//endregion
//region Serialization / Deserialization / Disposing
//----------------------------------------------------------------------------------------------------------------------
//
//  Serialization / Deserialization / Disposing
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Sets default annotation settings.
 * @param {!Object} value
 */
anychart.annotationsModule.Base.prototype.setDefaultSettings = function(value) {
  this.themeSettings = value;
  this.markers().setup(value['markers']);
  this.hoverMarkers().setup(value['hoverMarkers']);
  this.selectMarkers().setup(value['selectMarkers']);
};


/** @inheritDoc */
anychart.annotationsModule.Base.prototype.serialize = function() {
  var json = anychart.annotationsModule.Base.base(this, 'serialize');

  json['type'] = this.getType();

  anychart.core.settings.serialize(this, anychart.annotationsModule.BASE_DESCRIPTORS, json, 'Annotation');
  json['markers'] = this.markers().serialize();
  json['hoverMarkers'] = this.hoverMarkers().serialize();
  json['selectMarkers'] = this.selectMarkers().serialize();

  return json;
};


/** @inheritDoc */
anychart.annotationsModule.Base.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.settings.deserialize(this, anychart.annotationsModule.BASE_DESCRIPTORS, config);
  this.markers().setup(config['markers']);
  this.hoverMarkers().setup(config['hoverMarkers']);
  this.selectMarkers().setup(config['selectMarkers']);

  anychart.annotationsModule.Base.base(this, 'setupByJSON', config, opt_default);
};


/** @inheritDoc */
anychart.annotationsModule.Base.prototype.disposeInternal = function() {
  goog.dispose(this.rootLayer);
  this.rootLayer = null;

  delete this.chartController_;
  this.plotController_ = null;
  this.xScale_ = null;
  this.yScale_ = null;
  delete this.ownSettings;
  delete this.themeSettings;

  anychart.annotationsModule.Base.base(this, 'disposeInternal');
};


//endregion
//exports
(function() {
  var proto = anychart.annotationsModule.Base.prototype;
  proto['getType'] = proto.getType;
  proto['getChart'] = proto.getChart;
  proto['getPlot'] = proto.getPlot;
  proto['yScale'] = proto.yScale;
  proto['xScale'] = proto.xScale;
  proto['select'] = proto.select;
  proto['markers'] = proto.markers;
  proto['hoverMarkers'] = proto.hoverMarkers;
  proto['selectMarkers'] = proto.selectMarkers;
})();
