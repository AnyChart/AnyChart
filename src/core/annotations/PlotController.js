goog.provide('anychart.core.annotations.PlotController');
goog.require('anychart.core.IPlot');
goog.require('anychart.core.VisualBase');
goog.require('anychart.core.annotations.AndrewsPitchfork');
goog.require('anychart.core.annotations.Ellipse');
goog.require('anychart.core.annotations.FibonacciArc');
goog.require('anychart.core.annotations.FibonacciFan');
goog.require('anychart.core.annotations.FibonacciRetracement');
goog.require('anychart.core.annotations.FibonacciTimezones');
goog.require('anychart.core.annotations.HorizontalLine');
goog.require('anychart.core.annotations.InfiniteLine');
// goog.require('anychart.core.annotations.Label');
goog.require('anychart.core.annotations.Line');
goog.require('anychart.core.annotations.Marker');
goog.require('anychart.core.annotations.Ray');
goog.require('anychart.core.annotations.Rectangle');
goog.require('anychart.core.annotations.TrendChannel');
goog.require('anychart.core.annotations.Triangle');
goog.require('anychart.core.annotations.VerticalLine');
goog.require('goog.array');
goog.require('goog.fx.Dragger');



/**
 *
 * @param {!anychart.core.annotations.ChartController} chartController
 * @param {!anychart.core.IPlot} plot
 * @constructor
 * @extends {anychart.core.VisualBase}
 */
anychart.core.annotations.PlotController = function(chartController, plot) {
  anychart.core.annotations.PlotController.base(this, 'constructor');

  /**
   * Chart-level controller.
   * @type {!anychart.core.annotations.ChartController}
   * @private
   */
  this.controller_ = chartController;
  chartController.registerPlotController(this);

  /**
   * Plot reference.
   * @type {!anychart.core.IPlot}
   * @private
   */
  this.plot_ = plot;

  /**
   * Annotations list.
   * @type {!Array.<anychart.core.annotations.Base>}
   * @private
   */
  this.annotations_ = [];

  /**
   * Layer that holds annotations.
   * @type {acgraph.vector.Layer}
   * @private
   */
  this.annotationsLayer_ = null;

  /**
   * Rect that serves as an overlay events interceptor for drawing mode.
   * @type {acgraph.vector.Rect}
   * @private
   */
  this.drawingOverlayRect_ = null;

  /**
   * If the controller is in drawing mode.
   * @type {boolean}
   */
  this.inDrawing = false;

  /**
   * Last X position of cursor seen in drawing.
   * @type {number}
   */
  this.lastX = NaN;

  /**
   * Last Y position of cursor seen in drawing.
   * @type {number}
   */
  this.lastY = NaN;

  /**
   * Annotations dragger.
   * @type {anychart.core.annotations.PlotController.AnchorDragger}
   * @private
   */
  this.dragger_ = null;

  /**
   * Annotation that was created by chartController.startDrawing and is currently on the plot due to hover.
   * @type {?anychart.core.annotations.Base}
   * @private
   */
  this.temporaryAnnotation_ = null;
};
goog.inherits(anychart.core.annotations.PlotController, anychart.core.VisualBase);


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
anychart.core.annotations.PlotController.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.ANNOTATIONS_CONTROLLER_ANNOTATIONS |
    anychart.ConsistencyState.ANNOTATIONS_CONTROLLER_DRAWING_MODE;
//endregion


//region Public methods
//----------------------------------------------------------------------------------------------------------------------
//
//  Public methods
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Returns assosiated chart controller.
 * @return {!anychart.core.annotations.ChartController}
 */
anychart.core.annotations.PlotController.prototype.getController = function() {
  return this.controller_;
};


/**
 * Returns associated plot.
 * @return {!anychart.core.IPlot}
 */
anychart.core.annotations.PlotController.prototype.getPlot = function() {
  return this.plot_;
};


/**
 * Invalidates all annotations.
 */
anychart.core.annotations.PlotController.prototype.invalidateAnnotations = function() {
  for (var i = 0; i < this.annotations_.length; i++) {
    this.annotations_[i].invalidate(anychart.ConsistencyState.ANNOTATIONS_ANCHORS);
  }
  if (this.temporaryAnnotation_)
    this.temporaryAnnotation_.invalidate(anychart.ConsistencyState.ANNOTATIONS_ANCHORS);
  this.invalidate(anychart.ConsistencyState.ANNOTATIONS_CONTROLLER_ANNOTATIONS);
};


/**
 * Draws everything.
 */
anychart.core.annotations.PlotController.prototype.draw = function() {
  if (!this.checkDrawingNeeded())
    return;

  this.suspendSignalsDispatching();

  if (!this.annotationsLayer_) {
    this.annotationsLayer_ = acgraph.layer();
    this.annotationsLayer_.listenOnce(acgraph.events.EventType.MOUSEOVER, this.initDragger_, false, this);
    this.annotationsLayer_.listenOnce(acgraph.events.EventType.TOUCHSTART, this.initDragger_, false, this);
    this.annotationsLayer_.listen(acgraph.events.EventType.MOUSEOVER, this.handleAnnotationMouseOver_, false, this);
    this.annotationsLayer_.listen(acgraph.events.EventType.MOUSEOUT, this.handleAnnotationMouseOut_, false, this);

    this.drawingOverlayRect_ = acgraph.rect(0, 0, 0, 0);
    this.drawingOverlayRect_.cursor(acgraph.vector.Cursor.CROSSHAIR);
    this.drawingOverlayRect_.fill(anychart.color.TRANSPARENT_HANDLER);
    this.drawingOverlayRect_.stroke(null);
    this.drawingOverlayRect_.listen(acgraph.events.EventType.MOUSEOVER, this.handleDrawingMouseOver_, false, this);

    /**
     * @type {!acgraph.vector.Rect}
     * @private
     */
    this.counterHighlighter_ = acgraph.rect(0, 0, 0, 0);
    this.counterHighlighter_.fill(anychart.color.TRANSPARENT_HANDLER);
    this.counterHighlighter_.stroke(null);
    this.counterHighlighter_.zIndex(1000);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    /**
     * Parent bounds cache to avoid cloning.
     * @type {anychart.math.Rect}
     * @private
     */
    this.parentBoundsCache_ = /** @type {anychart.math.Rect} */(this.parentBounds());
    this.annotationsLayer_.clip(this.parentBoundsCache_);
    this.drawingOverlayRect_.setBounds(this.parentBoundsCache_);
    this.counterHighlighter_.setBounds(this.parentBoundsCache_);
    this.invalidate(anychart.ConsistencyState.ANNOTATIONS_CONTROLLER_ANNOTATIONS);
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.ANNOTATIONS_CONTROLLER_ANNOTATIONS)) {
    for (var i = 0, len = this.annotations_.length; i < len; i++) {
      var annotation = this.annotations_[i];
      annotation.suspendSignalsDispatching();
      annotation.parentBounds(this.parentBoundsCache_);
      annotation.container(this.annotationsLayer_);
      annotation.draw();
      annotation.resumeSignalsDispatching(false);
    }
    if (this.temporaryAnnotation_) {
      this.temporaryAnnotation_.suspendSignalsDispatching();
      this.temporaryAnnotation_.parentBounds(this.parentBoundsCache_);
      this.temporaryAnnotation_.container(this.annotationsLayer_);
      this.temporaryAnnotation_.draw();
      this.temporaryAnnotation_.resumeSignalsDispatching(false);
    }
    this.markConsistent(anychart.ConsistencyState.ANNOTATIONS_CONTROLLER_ANNOTATIONS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    this.annotationsLayer_.parent(/** @type {acgraph.vector.ILayer} */(this.container()));
    this.invalidate(anychart.ConsistencyState.ANNOTATIONS_CONTROLLER_DRAWING_MODE);
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    var zIndex = /** @type {number} */(this.zIndex());
    this.annotationsLayer_.zIndex(zIndex);
    this.drawingOverlayRect_.zIndex(zIndex + 100);
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.ANNOTATIONS_CONTROLLER_DRAWING_MODE)) {
    if (this.inDrawing) {
      this.drawingOverlayRect_.parent(/** @type {acgraph.vector.ILayer} */(this.container()));
    } else {
      this.drawingOverlayRect_.remove();
    }
    this.markConsistent(anychart.ConsistencyState.ANNOTATIONS_CONTROLLER_DRAWING_MODE);
  }

  this.resumeSignalsDispatching(false);
};


/**
 * Initializes the dragger.
 * @param {acgraph.events.BrowserEvent} e
 * @private
 */
anychart.core.annotations.PlotController.prototype.initDragger_ = function(e) {
  if (!this.dragger_) {
    this.dragger_ = new anychart.core.annotations.PlotController.AnchorDragger(this);
    if (e.type == acgraph.events.EventType.TOUCHSTART)
      this.dragger_.startDrag(e.getOriginalEvent());
  }
};
//endregion


//region Annotations over/out
//----------------------------------------------------------------------------------------------------------------------
//
//  Annotations over/out
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Handles mouse over in drawing mode.
 * @param {acgraph.events.BrowserEvent} e
 * @private
 */
anychart.core.annotations.PlotController.prototype.handleAnnotationMouseOver_ = function(e) {
  e.stopPropagation();
  e.stopWrapperPropagation();
  e.preventDefault();
  var target = e['target'];
  var tag;
  // we suppose that if we have caught the event on the annotation, than it is editable
  // because otherwise it should have had a disablePointerEvents(false) on its layer
  while (target instanceof acgraph.vector.Element) {
    tag = target.tag;
    if (tag instanceof anychart.core.annotations.Base) {
      this.controller_.hover(/** @type {anychart.core.annotations.Base} */(tag));
      return;
    }
    target = target.parent();
  }
  this.controller_.unhover();
};


/**
 * Handles mouse out in drawing mode.
 * @param {acgraph.events.BrowserEvent} e
 * @private
 */
anychart.core.annotations.PlotController.prototype.handleAnnotationMouseOut_ = function(e) {
  e.stopPropagation();
  e.stopWrapperPropagation();
  e.preventDefault();
  this.controller_.unhover();
};
//endregion


//region Drawing handlers
//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing handlers
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Handles mouse over in drawing mode.
 * @param {acgraph.events.BrowserEvent} e
 * @private
 */
anychart.core.annotations.PlotController.prototype.handleDrawingMouseOver_ = function(e) {
  var annotation = this.controller_.getSelectedAnnotation();
  var plot = annotation.getPlotController();
  if (plot && plot != this) return;

  if (annotation.isFinished()) {
    this.controller_.setupDrawing(false);
  } else {
    this.drawingOverlayRect_.listen(acgraph.events.EventType.MOUSEOUT, this.handleDrawingMouseOut_, false, this);
    this.drawingOverlayRect_.listen(acgraph.events.EventType.MOUSEDOWN, this.handleDrawingMouseDown_, false, this);
    acgraph.events.listen(goog.global, acgraph.events.EventType.MOUSEMOVE, this.handleDrawingMouseMove_, false, this);

    e.stopPropagation();
    e.stopWrapperPropagation();
    e.preventDefault();

    this.updateLastCoords_(e);
    this.mouseIsOut = false;

    annotation.updateLastPoint(this.lastX, this.lastY);
    if (annotation.getPlot()) {
      annotation.draw();
    } else {
      this.bindAnnotation(annotation, false);
    }
  }
};


/**
 * Handles mouse out in drawing mode.
 * @param {acgraph.events.BrowserEvent} e
 * @private
 */
anychart.core.annotations.PlotController.prototype.handleDrawingMouseOut_ = function(e) {
  this.drawingOverlayRect_.unlisten(acgraph.events.EventType.MOUSEOUT, this.handleDrawingMouseOut_, false, this);
  this.drawingOverlayRect_.unlisten(acgraph.events.EventType.MOUSEDOWN, this.handleDrawingMouseDown_, false, this);

  e.stopPropagation();
  e.stopWrapperPropagation();
  e.preventDefault();

  this.updateLastCoords_(e);
  this.mouseIsOut = true;

  if (!this.inDraggingDraw) {
    acgraph.events.unlisten(goog.global, acgraph.events.EventType.MOUSEMOVE, this.handleDrawingMouseMove_, false, this);

    var annotation = this.controller_.getSelectedAnnotation();
    annotation.removeLastPoint();
    if (annotation.canUnbindPlot())
      this.unbindAnnotation(annotation);
    annotation.draw();
  }
};


/**
 * Handles mouse down in drawing mode.
 * @param {acgraph.events.BrowserEvent} e
 * @private
 */
anychart.core.annotations.PlotController.prototype.handleDrawingMouseDown_ = function(e) {
  acgraph.events.listen(goog.global, acgraph.events.EventType.MOUSEUP, this.handleDrawingMouseUp_, false, this);

  e.stopPropagation();
  e.stopWrapperPropagation();
  e.preventDefault();

  this.updateLastCoords_(e);
  this.mouseDownX = this.lastX;
  this.mouseDownY = this.lastY;
  this.inDraggingDraw = false;

  var annotation = this.controller_.getSelectedAnnotation();
  annotation.updateLastPoint(this.lastX, this.lastY);
  annotation.draw();
};


/**
 * Handles mouse up in drawing mode.
 * @param {goog.events.BrowserEvent} e
 * @private
 */
anychart.core.annotations.PlotController.prototype.handleDrawingMouseUp_ = function(e) {
  acgraph.events.unlisten(goog.global, acgraph.events.EventType.MOUSEUP, this.handleDrawingMouseUp_, false, this);

  e.stopPropagation();
  e.preventDefault();

  this.updateLastCoords_(e);
  this.mouseDownX = NaN;
  this.mouseDownY = NaN;
  this.inDraggingDraw = false;

  var annotation = this.controller_.getSelectedAnnotation();
  if (annotation.canUnbindPlot())
    this.bindAnnotation(annotation, true);
  annotation.saveLastPoint();
  var finished = false;
  if (annotation.isFinished()) {
    finished = true;
  } else if (!this.mouseIsOut) {
    annotation.updateLastPoint(this.lastX, this.lastY);
  }
  annotation.draw();
  if (finished) {
    this.controller_.setupDrawing(false);
    this.controller_.getChart().dispatchEvent({
      'type': anychart.enums.EventType.ANNOTATION_DRAWING_FINISH,
      'annotation': annotation
    });
  }
};


/**
 * Handles mouse move in drawing mode.
 * @param {goog.events.BrowserEvent} e
 * @private
 */
anychart.core.annotations.PlotController.prototype.handleDrawingMouseMove_ = function(e) {
  e.stopPropagation();
  e.preventDefault();

  this.updateLastCoords_(e);

  var annotation = this.controller_.getSelectedAnnotation();
  if (annotation.canUseDraggingDraw() && !isNaN(this.mouseDownX) && !isNaN(this.mouseDownY) && !this.inDraggingDraw) {
    var distance = (this.mouseDownX - this.lastX) * (this.mouseDownX - this.lastX) +
        (this.mouseDownY - this.lastY) * (this.mouseDownY - this.lastY);
    if (distance >= 16) {
      this.inDraggingDraw = true;
      // currently we have mouseDownX, mouseDownY there
      if (annotation.canUnbindPlot())
        this.bindAnnotation(annotation, true);
      annotation.saveLastPoint();
      annotation.updateLastPoint(this.lastX, this.lastY);
      annotation.draw();
    }
  } else {
    annotation.updateLastPoint(this.lastX, this.lastY);
    annotation.draw();
  }
};


/**
 * Updates last known mouse coords.
 * @param {goog.events.BrowserEvent|acgraph.events.BrowserEvent} e
 * @private
 */
anychart.core.annotations.PlotController.prototype.updateLastCoords_ = function(e) {
  var stageReferencePoint = this.container().getStage().getClientPosition();
  this.lastX = e['clientX'] - stageReferencePoint.x;
  this.lastY = e['clientY'] - stageReferencePoint.y;
};
//endregion


//region Drawing infrastructure
//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing infrastructure
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.annotations.PlotController.prototype.remove = function() {
  if (this.annotationsLayer_) {
    this.annotationsLayer_.remove();
    this.drawingOverlayRect_.remove();
  }
};


/**
 * Invalidates certain states to turn drawing mode on or off.
 * @param {boolean} active
 */
anychart.core.annotations.PlotController.prototype.setupDrawing = function(active) {
  if (this.inDrawing != active) {
    this.inDrawing = active;
    if (!active && this.drawingOverlayRect_) {
      this.drawingOverlayRect_.unlisten(acgraph.events.EventType.MOUSEOUT, this.handleDrawingMouseOut_, false, this);
      this.drawingOverlayRect_.unlisten(acgraph.events.EventType.MOUSEDOWN, this.handleDrawingMouseDown_, false, this);
      acgraph.events.unlisten(goog.global, acgraph.events.EventType.MOUSEUP, this.handleDrawingMouseMove_, false, this);
      acgraph.events.unlisten(goog.global, acgraph.events.EventType.MOUSEMOVE, this.handleDrawingMouseMove_, false, this);
    }
    this.invalidate(anychart.ConsistencyState.ANNOTATIONS_CONTROLLER_DRAWING_MODE, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Binds annotation to the plot.
 * @param {anychart.core.annotations.Base} annotation
 * @param {boolean} permanent
 */
anychart.core.annotations.PlotController.prototype.bindAnnotation = function(annotation, permanent) {
  var needInvalidate = !permanent || (annotation != this.temporaryAnnotation_);
  if (permanent) {
    this.annotations_.push(annotation);
    this.temporaryAnnotation_ = null;
    if (this.annotationsLayer_)
      annotation.container(this.annotationsLayer_);
  } else {
    this.temporaryAnnotation_ = annotation;
  }
  annotation.setPlot(this, !permanent);
  annotation.setParentEventTarget(this);
  annotation.listenSignals(this.annotationInvalidated_, this);
  if (needInvalidate) {
    this.invalidate(anychart.ConsistencyState.ANNOTATIONS_CONTROLLER_ANNOTATIONS, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Unbinds annotation from the plot.
 * @param {anychart.core.annotations.Base} annotation
 */
anychart.core.annotations.PlotController.prototype.unbindAnnotation = function(annotation) {
  annotation.setPlot(null, true);
  annotation.setParentEventTarget(null);
  annotation.unlistenSignals(this.annotationInvalidated_, this);
  this.temporaryAnnotation_ = null;
  this.invalidate(anychart.ConsistencyState.ANNOTATIONS_CONTROLLER_ANNOTATIONS, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Prevents highlight on plot.
 * @param {boolean} activate
 */
anychart.core.annotations.PlotController.prototype.preventHighlight = function(activate) {
  if (activate)
    this.counterHighlighter_.parent(this.annotationsLayer_);
  else
    this.counterHighlighter_.remove();
};
//endregion


//region Annotations manipulations
//----------------------------------------------------------------------------------------------------------------------
//
//  Annotations manipulations
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Selects annotation.
 * @param {anychart.core.annotations.Base} annotation
 * @return {anychart.core.annotations.PlotController}
 */
anychart.core.annotations.PlotController.prototype.select = function(annotation) {
  this.controller_.select(annotation);
  return this;
};


/**
 * Unselects annotations.
 * @return {anychart.core.annotations.PlotController}
 */
anychart.core.annotations.PlotController.prototype.unselect = function() {
  this.controller_.unselect();
  return this;
};


/**
 * Returns currently selected annotation.
 * @return {?anychart.core.annotations.Base}
 */
anychart.core.annotations.PlotController.prototype.getSelectedAnnotation = function() {
  return this.controller_.getSelectedAnnotation();
};


/**
 * Gets annotation by its index.
 * @param {number} index Index of the annotation.
 * @return {?anychart.core.annotations.Base} Annotation instance.
 */
anychart.core.annotations.PlotController.prototype.getAnnotationAt = function(index) {
  return this.annotations_[index] || null;
};


/**
 * Returns annotations count.
 * @return {number} Number of annotations.
 */
anychart.core.annotations.PlotController.prototype.getAnnotationsCount = function() {
  return this.annotations_.length;
};


/**
 * Removes one of annotations from plot by its instance.
 * @param {anychart.core.annotations.Base} annotation
 * @return {anychart.core.annotations.PlotController}
 */
anychart.core.annotations.PlotController.prototype.removeAnnotation = function(annotation) {
  if (this.temporaryAnnotation_ == annotation) {
    this.temporaryAnnotation_ = null;
    goog.dispose(annotation);
    return this;
  }
  return this.removeAnnotationAt(goog.array.indexOf(this.annotations_, annotation));
};


/**
 * Removes one of annotations from plot by its index.
 * @param {number} index Annotations index.
 * @return {anychart.core.annotations.PlotController}
 */
anychart.core.annotations.PlotController.prototype.removeAnnotationAt = function(index) {
  var annotation = this.annotations_[index];
  if (annotation) {
    goog.array.splice(this.annotations_, index, 1);
    goog.dispose(annotation);
    this.invalidate(anychart.ConsistencyState.ANNOTATIONS_CONTROLLER_ANNOTATIONS, anychart.Signal.NEEDS_REDRAW);
  }
  return this;
};


/**
 * Removes all annotations from plot.
 * @return {anychart.core.annotations.PlotController} Self for method chaining.
 */
anychart.core.annotations.PlotController.prototype.removeAllAnnotations = function() {
  if (this.annotations_.length) {
    goog.disposeAll(this.annotations_);
    this.annotations_.length = 0;
    this.invalidate(anychart.ConsistencyState.ANNOTATIONS_CONTROLLER_ANNOTATIONS, anychart.Signal.NEEDS_REDRAW);
  }
  return this;
};
//endregion


//region Constructors
//----------------------------------------------------------------------------------------------------------------------
//
//  Constructors
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Starts annotation drawing. Works only AFTER draw.
 * @param {anychart.enums.AnnotationTypes|anychart.core.annotations.AnnotationJSONFormat} annotationTypeOrConfig
 * @return {anychart.core.annotations.Base}
 */
anychart.core.annotations.PlotController.prototype.startDrawing = function(annotationTypeOrConfig) {
  if (this.controller_.ready()) {
    this.controller_.getChart().suspendSignalsDispatching();
    var annotation = this.controller_.createAnnotationByType(annotationTypeOrConfig);
    this.bindAnnotation(annotation, true);
    this.controller_.select(annotation);
    if (!this.controller_.getSelectedAnnotation()) {
      goog.dispose(annotation);
      annotation = null;
    }
    this.controller_.getChart().resumeSignalsDispatching(true);
    return annotation;
  }
  return null;
};


/**
 * Adds annotation on the plot. If it is not finished - you should select it manually to start drawing.
 * @param {anychart.enums.AnnotationTypes|anychart.core.annotations.AnnotationJSONFormat} annotationTypeOrConfig
 * @return {anychart.core.annotations.Base}
 */
anychart.core.annotations.PlotController.prototype.add = function(annotationTypeOrConfig) {
  this.controller_.getChart().suspendSignalsDispatching();
  var annotation = this.controller_.createAnnotationByType(annotationTypeOrConfig);
  this.bindAnnotation(annotation, true);
  this.controller_.getChart().resumeSignalsDispatching(true);
  return annotation;
};


/**
 * Cancels current drawing if any.
 */
anychart.core.annotations.PlotController.prototype.cancelDrawing = function() {
  this.controller_.cancelDrawing();
};


/**
 * Creates and returns a ray annotation.
 * @param {Object=} opt_config
 * @return {anychart.core.annotations.Ray}
 */
anychart.core.annotations.PlotController.prototype.ray = function(opt_config) {
  var annotation = /** @type {anychart.core.annotations.Ray} */(
      this.controller_.createAnnotationByType(anychart.enums.AnnotationTypes.RAY));
  annotation.setup(opt_config);
  this.bindAnnotation(annotation, true);
  return annotation;
};


/**
 * Creates and returns a line annotation.
 * @param {Object=} opt_config
 * @return {anychart.core.annotations.Line}
 */
anychart.core.annotations.PlotController.prototype.line = function(opt_config) {
  var annotation = /** @type {anychart.core.annotations.Line} */(
      this.controller_.createAnnotationByType(anychart.enums.AnnotationTypes.LINE));
  annotation.setup(opt_config);
  this.bindAnnotation(annotation, true);
  return annotation;
};


/**
 * Creates and returns a infiniteLine annotation.
 * @param {Object=} opt_config
 * @return {anychart.core.annotations.InfiniteLine}
 */
anychart.core.annotations.PlotController.prototype.infiniteLine = function(opt_config) {
  var annotation = /** @type {anychart.core.annotations.InfiniteLine} */(
      this.controller_.createAnnotationByType(anychart.enums.AnnotationTypes.INFINITE_LINE));
  annotation.setup(opt_config);
  this.bindAnnotation(annotation, true);
  return annotation;
};


/**
 * Creates and returns a verticalLine annotation.
 * @param {Object=} opt_config
 * @return {anychart.core.annotations.VerticalLine}
 */
anychart.core.annotations.PlotController.prototype.verticalLine = function(opt_config) {
  var annotation = /** @type {anychart.core.annotations.VerticalLine} */(
      this.controller_.createAnnotationByType(anychart.enums.AnnotationTypes.VERTICAL_LINE));
  annotation.setup(opt_config);
  this.bindAnnotation(annotation, true);
  return annotation;
};


/**
 * Creates and returns a horizontalLine annotation.
 * @param {Object=} opt_config
 * @return {anychart.core.annotations.HorizontalLine}
 */
anychart.core.annotations.PlotController.prototype.horizontalLine = function(opt_config) {
  var annotation = /** @type {anychart.core.annotations.HorizontalLine} */(
      this.controller_.createAnnotationByType(anychart.enums.AnnotationTypes.HORIZONTAL_LINE));
  annotation.setup(opt_config);
  this.bindAnnotation(annotation, true);
  return annotation;
};


/**
 * Creates and returns a rectangle annotation.
 * @param {Object=} opt_config
 * @return {anychart.core.annotations.Rectangle}
 */
anychart.core.annotations.PlotController.prototype.rectangle = function(opt_config) {
  var annotation = /** @type {anychart.core.annotations.Rectangle} */(
      this.controller_.createAnnotationByType(anychart.enums.AnnotationTypes.RECTANGLE));
  annotation.setup(opt_config);
  this.bindAnnotation(annotation, true);
  return annotation;
};


/**
 * Creates and returns a ellipse annotation.
 * @param {Object=} opt_config
 * @return {anychart.core.annotations.Ellipse}
 */
anychart.core.annotations.PlotController.prototype.ellipse = function(opt_config) {
  var annotation = /** @type {anychart.core.annotations.Ellipse} */(
      this.controller_.createAnnotationByType(anychart.enums.AnnotationTypes.ELLIPSE));
  annotation.setup(opt_config);
  this.bindAnnotation(annotation, true);
  return annotation;
};


/**
 * Creates and returns a triangle annotation.
 * @param {Object=} opt_config
 * @return {anychart.core.annotations.Triangle}
 */
anychart.core.annotations.PlotController.prototype.triangle = function(opt_config) {
  var annotation = /** @type {anychart.core.annotations.Triangle} */(
      this.controller_.createAnnotationByType(anychart.enums.AnnotationTypes.TRIANGLE));
  annotation.setup(opt_config);
  this.bindAnnotation(annotation, true);
  return annotation;
};


/**
 * Creates and returns a trendChannel annotation.
 * @param {Object=} opt_config
 * @return {anychart.core.annotations.TrendChannel}
 */
anychart.core.annotations.PlotController.prototype.trendChannel = function(opt_config) {
  var annotation = /** @type {anychart.core.annotations.TrendChannel} */(
      this.controller_.createAnnotationByType(anychart.enums.AnnotationTypes.TREND_CHANNEL));
  annotation.setup(opt_config);
  this.bindAnnotation(annotation, true);
  return annotation;
};


/**
 * Creates and returns a andrewsPitchfork annotation.
 * @param {Object=} opt_config
 * @return {anychart.core.annotations.AndrewsPitchfork}
 */
anychart.core.annotations.PlotController.prototype.andrewsPitchfork = function(opt_config) {
  var annotation = /** @type {anychart.core.annotations.AndrewsPitchfork} */(
      this.controller_.createAnnotationByType(anychart.enums.AnnotationTypes.ANDREWS_PITCHFORK));
  annotation.setup(opt_config);
  this.bindAnnotation(annotation, true);
  return annotation;
};


/**
 * Creates and returns a fibonacciFan annotation.
 * @param {Object=} opt_config
 * @return {anychart.core.annotations.FibonacciFan}
 */
anychart.core.annotations.PlotController.prototype.fibonacciFan = function(opt_config) {
  var annotation = /** @type {anychart.core.annotations.FibonacciFan} */(
      this.controller_.createAnnotationByType(anychart.enums.AnnotationTypes.FIBONACCI_FAN));
  annotation.setup(opt_config);
  this.bindAnnotation(annotation, true);
  return annotation;
};


/**
 * Creates and returns a fibonacciArc annotation.
 * @param {Object=} opt_config
 * @return {anychart.core.annotations.FibonacciArc}
 */
anychart.core.annotations.PlotController.prototype.fibonacciArc = function(opt_config) {
  var annotation = /** @type {anychart.core.annotations.FibonacciArc} */(
      this.controller_.createAnnotationByType(anychart.enums.AnnotationTypes.FIBONACCI_ARC));
  annotation.setup(opt_config);
  this.bindAnnotation(annotation, true);
  return annotation;
};


/**
 * Creates and returns a fibonacciRetracement annotation.
 * @param {Object=} opt_config
 * @return {anychart.core.annotations.FibonacciRetracement}
 */
anychart.core.annotations.PlotController.prototype.fibonacciRetracement = function(opt_config) {
  var annotation = /** @type {anychart.core.annotations.FibonacciRetracement} */(
      this.controller_.createAnnotationByType(anychart.enums.AnnotationTypes.FIBONACCI_RETRACEMENT));
  annotation.setup(opt_config);
  this.bindAnnotation(annotation, true);
  return annotation;
};


/**
 * Creates and returns a fibonacciTimezones annotation.
 * @param {Object=} opt_config
 * @return {anychart.core.annotations.FibonacciTimezones}
 */
anychart.core.annotations.PlotController.prototype.fibonacciTimezones = function(opt_config) {
  var annotation = /** @type {anychart.core.annotations.FibonacciTimezones} */(
      this.controller_.createAnnotationByType(anychart.enums.AnnotationTypes.FIBONACCI_TIMEZONES));
  annotation.setup(opt_config);
  this.bindAnnotation(annotation, true);
  return annotation;
};


/**
 * Creates and returns a marker annotation.
 * @param {Object=} opt_config
 * @return {anychart.core.annotations.Marker}
 */
anychart.core.annotations.PlotController.prototype.marker = function(opt_config) {
  var annotation = /** @type {anychart.core.annotations.Marker} */(
      this.controller_.createAnnotationByType(anychart.enums.AnnotationTypes.MARKER));
  annotation.setup(opt_config);
  this.bindAnnotation(annotation, true);
  return annotation;
};


// /**
//  * Creates and returns a label annotation.
//  * @param {Object=} opt_config
//  * @return {anychart.core.annotations.Label}
//  */
// anychart.core.annotations.PlotController.prototype.label = function(opt_config) {
//   var annotation = /** @type {anychart.core.annotations.Label} */(
//       this.controller_.createAnnotationByType(anychart.enums.AnnotationTypes.LABEL));
//   annotation.setup(opt_config);
//   this.bindAnnotation(annotation, true);
//   return annotation;
// };
//endregion


//region Private methods
//----------------------------------------------------------------------------------------------------------------------
//
//  Private methods
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Annotation invalidation handler.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.core.annotations.PlotController.prototype.annotationInvalidated_ = function(e) {
  if (e.hasSignal(anychart.Signal.NEEDS_REDRAW))
    this.invalidate(anychart.ConsistencyState.ANNOTATIONS_CONTROLLER_ANNOTATIONS, anychart.Signal.NEEDS_REDRAW);
};
//endregion


//region Serialization / Deserialization / XML / JSON / Disposing
//----------------------------------------------------------------------------------------------------------------------
//
//  Serialization / Deserialization / XML / JSON / Disposing
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.annotations.PlotController.prototype.serialize = function() {
  var json = anychart.core.annotations.PlotController.base(this, 'serialize');

  json['annotationsList'] = this.annotationsJson_();

  return json;
};


/** @inheritDoc */
anychart.core.annotations.PlotController.prototype.setupSpecial = function(var_args) {
  var arg0 = arguments[0];
  if (goog.isArray(arg0)) {
    this.annotationsJson_(arg0);
    return true;
  }
  return anychart.core.Base.prototype.setupSpecial.apply(this, arguments);
};


/** @inheritDoc */
anychart.core.annotations.PlotController.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.annotations.PlotController.base(this, 'setupByJSON', config, opt_default);

  var list = config['annotationsList'];
  if (goog.isArray(list)) {
    this.annotationsJson_(list);
  }
};


/**
 * Return plot annotations configuration as JSON object or string.
 * @param {boolean=} opt_stringify
 * @param {boolean=} opt_includeTheme
 * @return {Object|string}
 */
anychart.core.annotations.PlotController.prototype.toJson = function(opt_stringify, opt_includeTheme) {
  var data = this.isDisposed() ? {} : { 'annotationsList': this.annotationsJson_() };
  if (!opt_includeTheme) {
    var defaultTheme = {
      'defaultAnnotationSettings': this.getController().getChart().defaultAnnotationSettings()
    };
    data = /** @type {!Object} */(anychart.themes.merging.demerge(
        data, defaultTheme)) || {};
  }
  return opt_stringify ?
      goog.json.hybrid.stringify(data) :
      data;
};


/**
 * Return chart configuration as XML string or XMLNode.
 * @param {boolean=} opt_asXmlNode Return XML as XMLNode.
 * @param {boolean=} opt_includeTheme If the current theme properties should be included into the result.
 * @return {string|Node} Chart configuration.
 */
anychart.core.annotations.PlotController.prototype.toXml = function(opt_asXmlNode, opt_includeTheme) {
  var data = this.toJson(false, opt_includeTheme);
  return anychart.utils.json2xml(data, 'annotations', opt_asXmlNode);
};


/**
 * Replaces current annotations list with the annotations list passed as a JSON.
 * @param {Object|string} config
 * @return {anychart.core.annotations.PlotController} Chaining.
 */
anychart.core.annotations.PlotController.prototype.fromJson = function(config) {
  var json;
  if (goog.isString(config)) {
    json = goog.json.hybrid.parse(config);
  } else if (goog.isObject(config) && !goog.isFunction(config)) {
    json = config;
  }
  json = goog.isObject(json) ? json['annotationsList'] : json;
  this.annotationsJson_(json);
  return this;
};


/**
 * Replaces current annotations list with the annotations list passed as an XML.
 * @param {string|Node} config
 * @return {anychart.core.annotations.PlotController} Chaining.
 */
anychart.core.annotations.PlotController.prototype.fromXml = function(config) {
  var json = anychart.utils.xml2json(config);
  this.fromJson(json);
  return this;
};


/**
 * Annotations list getter/setter. If anything passed, removes all current annotations and if that was an array - tries
 * to create an annotations using each array element as a json or string type.
 * @param {(*|Array.<Object>)=} opt_list
 * @return {anychart.core.annotations.PlotController|Array.<Object>}
 * @private
 */
anychart.core.annotations.PlotController.prototype.annotationsJson_ = function(opt_list) {
  if (goog.isDef(opt_list)) {
    goog.disposeAll(this.annotations_);
    if (goog.isArray(opt_list)) {
      for (var i = 0; i < opt_list.length; i++) {
        this.bindAnnotation(this.controller_.createAnnotationByType(opt_list[i]), true);
      }
    }
    return this;
  }
  return goog.array.map(
      this.annotations_,
      function(annotation) {
        return annotation.serialize();
      });
};


/** @inheritDoc */
anychart.core.annotations.PlotController.prototype.disposeInternal = function() {
  anychart.core.annotations.PlotController.base(this, 'disposeInternal');
  this.controller_.deregisterPlotController(this);

  goog.disposeAll(this.annotations_, this.temporaryAnnotation_);
};
//endregion



//region anychart.core.annotations.PlotController.AnchorDragger
//----------------------------------------------------------------------------------------------------------------------
//
//  anychart.core.annotations.PlotController.AnchorDragger
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Dragger for plot thumbs.
 * @param {anychart.core.annotations.PlotController} plotController
 * @constructor
 * @extends {goog.fx.Dragger}
 */
anychart.core.annotations.PlotController.AnchorDragger = function(plotController) {
  /**
   * Controller.
   * @type {anychart.core.annotations.PlotController}
   * @private
   */
  this.controller_ = plotController;

  /**
   * Annotation that is dragged now.
   * @type {anychart.core.annotations.Base}
   * @private
   */
  this.annotation_ = null;

  /**
   * Annotation anchor identifier. Can be:
   *   NaN - no anchor;
   *   -1 - moving whole annotation;
   *   0 - moving first annotation anchor;
   *   1 - moving second annotation anchor;
   *   2 - moving third annotation anchor;
   * @type {number}
   * @private
   */
  this.anchorId_ = NaN;

  anychart.core.annotations.PlotController.AnchorDragger.base(this, 'constructor',
      plotController.annotationsLayer_.domElement());

  this.listen(goog.fx.Dragger.EventType.START, this.handleDragStart_, false, this);
  this.listen(goog.fx.Dragger.EventType.END, this.handleDragEnd_, false, this);
};
goog.inherits(anychart.core.annotations.PlotController.AnchorDragger, goog.fx.Dragger);


/** @inheritDoc */
anychart.core.annotations.PlotController.AnchorDragger.prototype.startDrag = function(e) {
  if (this.extractTarget(e)) {
    if (this.annotation_.isFinished()) {
      anychart.core.annotations.PlotController.AnchorDragger.base(this, 'startDrag', e);
      if (this.isDragging())
        e.stopPropagation();
    } else { // we should just select the annotation and the ChartController will do the trick, no drag
      this.controller_.controller_.select(this.annotation_);
      this.annotation_ = null;
      this.anchorId_ = NaN;
    }
  }
};


/**
 * Extracts annotation and anchor from a browser event.
 * @param {goog.events.BrowserEvent} e
 * @return {boolean}
 */
anychart.core.annotations.PlotController.AnchorDragger.prototype.extractTarget = function(e) {
  var target = acgraph.getWrapperForDOM(/** @type {Element} */(e.target), this.controller_.annotationsLayer_.getStage());
  var tag, anchorId = NaN;
  // we suppose that if we have caught the event on the annotation, than it is editable
  // because otherwise it should have had a disablePointerEvents(false) on its layer
  while (target instanceof acgraph.vector.Element) {
    tag = target.tag;
    if (!anychart.utils.isNaN(tag)) {
      anchorId = anychart.utils.toNumber(tag);
    } else if (tag instanceof anychart.core.annotations.Base) {
      this.annotation_ = tag;
      if (isNaN(anchorId))
        anchorId = -1;
      this.anchorId_ = anchorId;
      return true;
    }
    target = target.parent();
  }
  this.annotation_ = null;
  this.anchorId_ = NaN;
  return false;
};


/** @inheritDoc */
anychart.core.annotations.PlotController.AnchorDragger.prototype.computeInitialPosition = function() {
  this.annotation_.secureCurrentPosition();
  this.deltaX = 0;
  this.deltaY = 0;
};


/** @inheritDoc */
anychart.core.annotations.PlotController.AnchorDragger.prototype.defaultAction = function(x, y) {
  this.annotation_.moveAnchor(this.anchorId_, x, y);
};


/**
 * Annotation drag start handler.
 * @param {goog.fx.DragEvent} e
 * @private
 */
anychart.core.annotations.PlotController.AnchorDragger.prototype.handleDragStart_ = function(e) {
  this.controller_.getController().select(this.annotation_);
  this.controller_.preventHighlight(true);
};


/**
 * Annotation drag end handler.
 * @param {goog.fx.DragEvent} e
 * @private
 */
anychart.core.annotations.PlotController.AnchorDragger.prototype.handleDragEnd_ = function(e) {
  this.annotation_.invalidate(anychart.ConsistencyState.ANNOTATIONS_ANCHORS);
  this.annotation_.draw();
  this.annotation_ = null;
  this.anchorId_ = NaN;
  this.controller_.preventHighlight(false);
};
//endregion


//exports
(function() {
  var proto = anychart.core.annotations.PlotController.prototype;
  proto['add'] = proto.add;
  proto['startDrawing'] = proto.startDrawing;
  proto['cancelDrawing'] = proto.cancelDrawing;
  proto['getAnnotationAt'] = proto.getAnnotationAt;
  proto['getAnnotationsCount'] = proto.getAnnotationsCount;
  proto['removeAnnotation'] = proto.removeAnnotation;
  proto['removeAnnotationAt'] = proto.removeAnnotationAt;
  proto['removeAllAnnotations'] = proto.removeAllAnnotations;
  proto['getSelectedAnnotation'] = proto.getSelectedAnnotation;
  proto['select'] = proto.select;
  proto['unselect'] = proto.unselect;
  proto['ray'] = proto.ray;
  proto['line'] = proto.line;
  proto['infiniteLine'] = proto.infiniteLine;
  proto['verticalLine'] = proto.verticalLine;
  proto['horizontalLine'] = proto.horizontalLine;
  proto['rectangle'] = proto.rectangle;
  proto['ellipse'] = proto.ellipse;
  proto['triangle'] = proto.triangle;
  proto['trendChannel'] = proto.trendChannel;
  proto['andrewsPitchfork'] = proto.andrewsPitchfork;
  proto['fibonacciFan'] = proto.fibonacciFan;
  proto['fibonacciArc'] = proto.fibonacciArc;
  proto['fibonacciRetracement'] = proto.fibonacciRetracement;
  proto['fibonacciTimezones'] = proto.fibonacciTimezones;
  proto['marker'] = proto.marker;
  // proto['label'] = proto.label;
  proto['fromJson'] = proto.fromJson;
  proto['toJson'] = proto.toJson;
  proto['fromXml'] = proto.fromXml;
  proto['toXml'] = proto.toXml;
})();
