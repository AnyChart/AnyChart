goog.provide('anychart.core.annotations.ChartController');
goog.require('anychart.core.Base');
goog.require('anychart.core.IChartWithAnnotations');
goog.require('anychart.core.annotations.Base');
goog.require('goog.array');



/**
 *
 * @param {!anychart.core.IChartWithAnnotations} chart
 * @constructor
 * @extends {anychart.core.Base}
 */
anychart.core.annotations.ChartController = function(chart) {
  anychart.core.annotations.ChartController.base(this, 'constructor');

  /**
   * Chart reference.
   * @type {!anychart.core.IChartWithAnnotations}
   * @private
   */
  this.chart_ = chart;

  /**
   * Currently selected annotation.
   * @type {anychart.core.annotations.Base}
   * @private
   */
  this.selectedAnnotation_ = null;

  /**
   * Currently hovered annotation.
   * @type {anychart.core.annotations.Base}
   * @private
   */
  this.hoveredAnnotation_ = null;

  /**
   * If the controller is in drawing mode.
   * @type {boolean}
   * @private
   */
  this.inDrawing_ = false;

  /**
   * Adjacent plot controllers.
   * @type {Array.<!anychart.core.annotations.PlotController>}
   * @private
   */
  this.plotControllers_ = [];

  this.ready(false);
};
goog.inherits(anychart.core.annotations.ChartController, anychart.core.Base);


//region Internal methods
//----------------------------------------------------------------------------------------------------------------------
//
//  Internal methods
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Returns the chart that created this controller.
 * @return {!anychart.core.IChartWithAnnotations}
 */
anychart.core.annotations.ChartController.prototype.getChart = function() {
  return this.chart_;
};


/**
 * Registers plot controller.
 * @param {!anychart.core.annotations.PlotController} plotController
 */
anychart.core.annotations.ChartController.prototype.registerPlotController = function(plotController) {
  if (this.plotControllers_)
    this.plotControllers_.push(plotController);
};


/**
 * Removes plot controller registration.
 * @param {!anychart.core.annotations.PlotController} plotController
 */
anychart.core.annotations.ChartController.prototype.deregisterPlotController = function(plotController) {
  if (this.plotControllers_)
    goog.array.remove(this.plotControllers_, plotController);
};
//endregion


//region Annotations interactivity
//----------------------------------------------------------------------------------------------------------------------
//
//  Annotations interactivity
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Hovers annotation.
 * @param {anychart.core.annotations.Base} annotation
 */
anychart.core.annotations.ChartController.prototype.hover = function(annotation) {
  if (this.selectedAnnotation_ != annotation && this.hoveredAnnotation_ != annotation) {
    this.unhover();
    annotation.setState(anychart.PointState.HOVER);
    if (this.ready())
      annotation.draw();
  }
  this.hoveredAnnotation_ = annotation;
};


/**
 * Unhovers annotations.
 */
anychart.core.annotations.ChartController.prototype.unhover = function() {
  if (this.hoveredAnnotation_) {
    if (this.hoveredAnnotation_ != this.selectedAnnotation_) {
      this.hoveredAnnotation_.setState(anychart.PointState.NORMAL);
      if (this.ready())
        this.hoveredAnnotation_.draw();
    }
    this.hoveredAnnotation_ = null;
  }
};


/**
 * Selects annotation.
 * @param {anychart.core.annotations.Base} annotation
 * @return {anychart.core.annotations.ChartController}
 */
anychart.core.annotations.ChartController.prototype.select = function(annotation) {
  if (this.selectedAnnotation_ != annotation) {
    this.unselect();
    if (this.selectedAnnotation_)
      return this;
    if (this.chart_.dispatchEvent(
        {
          'type': anychart.enums.EventType.ANNOTATION_SELECT,
          'annotation': annotation
        })) {
      this.selectedAnnotation_ = annotation;
      annotation.setState(anychart.PointState.SELECT);
      if (this.ready() && annotation.isFinished()) {
        annotation.draw();
      } else {
        this.setupDrawing(true);
      }
    }
  }
  return this;
};


/**
 * Unselects annotations.
 * @return {anychart.core.annotations.ChartController}
 */
anychart.core.annotations.ChartController.prototype.unselect = function() {
  if (this.selectedAnnotation_ &&
      this.chart_.dispatchEvent({
        'type': anychart.enums.EventType.ANNOTATION_UNSELECT,
        'annotation': this.selectedAnnotation_
      })) {
    this.selectedAnnotation_.setState(
        (this.hoveredAnnotation_ == this.selectedAnnotation_) ?
            anychart.PointState.HOVER :
            anychart.PointState.NORMAL);
    if (this.ready())
      this.selectedAnnotation_.draw();
    this.selectedAnnotation_ = null;
    this.setupDrawing(false);
  }
  return this;
};


/**
 * Returns currently selected annotation.
 * @return {?anychart.core.annotations.Base}
 */
anychart.core.annotations.ChartController.prototype.getSelectedAnnotation = function() {
  return this.selectedAnnotation_;
};


/**
 * Setups drawing mode on all plots.
 * @param {boolean} active
 */
anychart.core.annotations.ChartController.prototype.setupDrawing = function(active) {
  if (this.inDrawing_ != active) {
    this.inDrawing_ = active;
    this.chart_.suspendSignalsDispatching();
    for (var i = 0; i < this.plotControllers_.length; i++) {
      this.plotControllers_[i].setupDrawing(active);
    }
    this.chart_.resumeSignalsDispatching(true);
  }
};


/**
 * If the controller is ready to draw annotations.
 * @param {boolean=} opt_value
 * @return {boolean|anychart.core.annotations.ChartController}
 */
anychart.core.annotations.ChartController.prototype.ready = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.ready_ = !!opt_value;
    return this;
  }
  return this.ready_;
};

//endregion


//region Annotations removing
//----------------------------------------------------------------------------------------------------------------------
//
//  Annotations removing
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Removes all annotations from the chart.
 * @return {anychart.core.annotations.ChartController} Self for method chaining.
 */
anychart.core.annotations.ChartController.prototype.removeAllAnnotations = function() {
  for (var i = 0; i < this.plotControllers_.length; i++)
    this.plotControllers_[i].removeAllAnnotations();
  return this;
};


/**
 * Removes one of annotations from plot by its instance.
 * @param {anychart.core.annotations.Base} annotation
 * @return {anychart.core.annotations.ChartController}
 */
anychart.core.annotations.ChartController.prototype.removeAnnotation = function(annotation) {
  var plotController = annotation.getPlotController();
  if (plotController) {
    plotController.removeAnnotation(annotation);
  } else {
    goog.dispose(annotation);
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
anychart.core.annotations.ChartController.prototype.startDrawing = function(annotationTypeOrConfig) {
  if (this.ready()) {
    this.cancelDrawing();
    var annotation = this.createAnnotationByType(annotationTypeOrConfig);
    this.select(annotation);
    if (!this.selectedAnnotation_) {
      goog.dispose(annotation);
      annotation = null;
    }
    return annotation;
  }
  return null;
};


/**
 * Cancels current drawing if any.
 */
anychart.core.annotations.ChartController.prototype.cancelDrawing = function() {
  this.chart_.suspendSignalsDispatching();
  if (this.selectedAnnotation_ && !this.selectedAnnotation_.isFinished()) {
    var plotController = this.selectedAnnotation_.getPlotController();
    if (plotController) {
      plotController.removeAnnotation(this.selectedAnnotation_);
    } else {
      goog.dispose(this.selectedAnnotation_);
    }
    this.selectedAnnotation_ = null;
  }
  this.setupDrawing(false);
  this.chart_.resumeSignalsDispatching(true);
};


/**
 * Creates annotation by type.
 * @param {string|Object} typeOrConfig
 * @return {anychart.core.annotations.Base}
 */
anychart.core.annotations.ChartController.prototype.createAnnotationByType = function(typeOrConfig) {
  var type, config;
  if (goog.isString(typeOrConfig)) {
    type = typeOrConfig;
    config = undefined;
  } else if (goog.isObject(typeOrConfig)) {
    type = typeOrConfig['type'];
    config = typeOrConfig;
  }
  type = anychart.enums.normalizeAnnotationType(type);
  var annotation = /** @type {anychart.core.annotations.Base} */(new anychart.core.annotations.AnnotationTypes[type](this));
  annotation.setDefaultSettings(this.chart_.defaultAnnotationSettings()[annotation.getType()]);
  annotation.setup(config);
  return annotation;
};
//endregion


//region Serialization / Deserialization / Disposing
//----------------------------------------------------------------------------------------------------------------------
//
//  Serialization / Deserialization / Disposing
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.annotations.ChartController.prototype.disposeInternal = function() {
  goog.disposeAll(this.plotControllers_);
  this.plotControllers_ = null;

  anychart.core.annotations.ChartController.base(this, 'disposeInternal');
};
//endregion


//exports
(function() {
  var proto = anychart.core.annotations.ChartController.prototype;
  proto['startDrawing'] = proto.startDrawing;
  proto['cancelDrawing'] = proto.cancelDrawing;
  proto['getSelectedAnnotation'] = proto.getSelectedAnnotation;
  proto['removeAnnotation'] = proto.removeAnnotation;
  proto['removeAllAnnotations'] = proto.removeAllAnnotations;
  proto['select'] = proto.select;
  proto['unselect'] = proto.unselect;
})();
