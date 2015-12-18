goog.provide('anychart.core.ui.Timeline');


goog.require('acgraph.vector.Path');
goog.require('anychart.core.gantt.TimelineHeader');
goog.require('anychart.core.ui.BaseGrid');
goog.require('anychart.core.ui.LabelsFactory');
goog.require('anychart.core.ui.MarkersFactory');
goog.require('anychart.core.ui.ScrollBar');
goog.require('anychart.math.Rect');
goog.require('anychart.scales.GanttDateTime');

goog.require('goog.array');
goog.require('goog.fx.Dragger');



/**
 * Gantt timeline implementation.
 * @param {anychart.core.gantt.Controller=} opt_controller - Controller to be set. See full description in parent class.
 * @param {boolean=} opt_isResources - Flag if TL must have a controller that works in 'Resources' mode.
 * @constructor
 * @extends {anychart.core.ui.BaseGrid}
 */
anychart.core.ui.Timeline = function(opt_controller, opt_isResources) {
  goog.base(this, opt_controller, opt_isResources);

  /**
   * Cell border settings.
   * NOTE: This field differs from DG's columnStroke_ and its setter has another functionality
   * and invalidates another states.
   * @type {acgraph.vector.Stroke}
   * @private
   */
  this.columnStroke_;

  /**
   * Labels factory.
   * @type {anychart.core.ui.LabelsFactory}
   * @private
   */
  this.labelsFactory_ = null;

  /**
   * Labels factory.
   * @type {anychart.core.ui.MarkersFactory}
   * @private
   */
  this.markersFactory_ = null;

  /**
   * Separation path.
   * @type {acgraph.vector.Path}
   * @private
   */
  this.separationPath_ = null;

  /**
   * Edit preview path.
   * @type {anychart.core.ui.Timeline.LiveEditControl}
   * @private
   */
  this.editPreviewPath_ = null;

  /**
   * Edit progress path.
   * @type {anychart.core.ui.Timeline.LiveEditControl}
   * @private
   */
  this.editProgressPath_ = null;

  /**
   * Edit left thumb path.
   * @type {anychart.core.ui.Timeline.LiveEditControl}
   * @private
   */
  this.editLeftThumbPath_ = null;

  /**
   * Edit right thumb path.
   * @type {anychart.core.ui.Timeline.LiveEditControl}
   * @private
   */
  this.editRightThumbPath_ = null;

  /**
   * Edit start connector path.
   * @type {anychart.core.ui.Timeline.LiveEditControl}
   * @private
   */
  this.editStartConnectorPath_ = null;

  /**
   * Edit finish connector path.
   * @type {anychart.core.ui.Timeline.LiveEditControl}
   * @private
   */
  this.editFinishConnectorPath_ = null;


  /**
   * Edit connector preview path.
   * @type {acgraph.vector.Path}
   * @private
   */
  this.editConnectorPreviewPath_ = null;

  /**
   * Edit connector preview stroke.
   * @type {acgraph.vector.Stroke}
   * @private
   */
  this.connectorPreviewStroke_;

  /**
   * Edit preview fill.
   * @type {acgraph.vector.Fill}
   * @private
   */
  this.editPreviewFill_;

  /**
   * Edit preview stroke.
   * @type {acgraph.vector.Stroke}
   * @private
   */
  this.editPreviewStroke_;

  /**
   * Edit progress fill.
   * @type {acgraph.vector.Fill}
   * @private
   */
  this.editProgressFill_;

  /**
   * Edit progress stroke.
   * @type {acgraph.vector.Stroke}
   * @private
   */
  this.editProgressStroke_;

  /**
   * Edit interval thumb fill.
   * @type {acgraph.vector.Fill}
   * @private
   */
  this.editIntervalThumbFill_;

  /**
   * Edit interval thumb stroke.
   * @type {acgraph.vector.Stroke}
   * @private
   */
  this.editIntervalThumbStroke_;

  /**
   * Edit connector thumb fill.
   * @type {acgraph.vector.Fill}
   * @private
   */
  this.editConnectorThumbFill_;

  /**
   * Edit connector thumb stroke.
   * @type {acgraph.vector.Stroke}
   * @private
   */
  this.editConnectorThumbStroke_;

  /**
   * Base fill.
   * @type {acgraph.vector.Fill}
   * @private
   */
  this.baseFill_;

  /**
   * Base stroke.
   * @type {acgraph.vector.Stroke}
   * @private
   */
  this.baseStroke_;

  /**
   * Baseline fill.
   * @type {acgraph.vector.Fill}
   * @private
   */
  this.baselineFill_;

  /**
   * Base stroke.
   * @type {acgraph.vector.Stroke}
   * @private
   */
  this.baselineStroke_;

  /**
   * Progress fill.
   * @type {acgraph.vector.Fill}
   * @private
   */
  this.progressFill_;

  /**
   * Progress stroke.
   * @type {acgraph.vector.Stroke}
   * @private
   */
  this.progressStroke_;


  /**
   * Milestone fill.
   * @type {acgraph.vector.Fill}
   * @private
   */
  this.milestoneFill_;

  /**
   * milestone stroke.
   * @type {acgraph.vector.Stroke}
   * @private
   */
  this.milestoneStroke_;


  /**
   * Parent fill.
   * @type {acgraph.vector.Fill}
   * @private
   */
  this.parentFill_;


  /**
   * Parent stroke.
   * @type {acgraph.vector.Stroke}
   * @private
   */
  this.parentStroke_;


  /**
   * Selected element fill.
   * @type {acgraph.vector.Fill}
   * @private
   */
  this.selectedElementFill_;


  /**
   * Selected element stroke.
   * @type {!acgraph.vector.Stroke}
   * @private
   */
  this.selectedElementStroke_;


  /**
   * Connector arrow fill.
   * @type {acgraph.vector.Fill}
   * @private
   */
  this.connectorFill_;


  /**
   * Connector line stroke.
   * @type {acgraph.vector.Stroke}
   * @private
   */
  this.connectorStroke_;

  /**
   * Selected period.
   * @type {(string|number|undefined)}
   * @private
   */
  this.selectedPeriodId_ = void 0;

  /**
   * Minimum gap.
   * @type {number}
   * @private
   */
  this.minimumGap_ = .01;

  /**
   * Maximum gap.
   * @type {number}
   * @private
   */
  this.maximumGap_ = .01;

  /**
   * Whether baseline bar must be placed above the actual interval bar.
   * @type {boolean}
   * @private
   */
  this.baselineAbove_ = false;

  /**
   *
   * @type {boolean}
   */
  this.redrawHeader = false;

  /**
   * Edit preview dragger.
   * @type {anychart.core.ui.Timeline.BarDragger}
   * @private
   */
  this.editPreviewDragger_ = null;

  /**
   * Edit progress dragger.
   * @type {anychart.core.ui.Timeline.ProgressDragger}
   * @private
   */
  this.editProgressDragger_ = null;

  /**
   * Edit left thumb dragger.
   * @type {anychart.core.ui.Timeline.ThumbDragger}
   * @private
   */
  this.editLeftThumbDragger_ = null;

  /**
   * Edit right thumb dragger.
   * @type {anychart.core.ui.Timeline.ThumbDragger}
   * @private
   */
  this.editRightThumbDragger_ = null;

  /**
   * Edit start connector dragger.
   * @type {anychart.core.ui.Timeline.ConnectorDragger}
   * @private
   */
  this.editStartConnectorDragger_ = null;

  /**
   * Edit finish connector dragger.
   * @type {anychart.core.ui.Timeline.ConnectorDragger}
   * @private
   */
  this.editFinishConnectorDragger_ = null;

  /**
   * Whether we are dragging the connector.
   * @type {boolean}
   */
  this.draggingConnector = false;

  /**
   * Whether we are dragging the progress.
   * @type {boolean}
   */
  this.draggingProgress = false;

  /**
   * Whether we are dragging the thumb.
   * @type {anychart.core.ui.Timeline.ThumbDragger}
   * @private
   */
  this.currentThumbDragger_ = null;

  /**
   * Whether we are dragging the connector circle.
   * @type {anychart.core.ui.Timeline.ConnectorDragger}
   * @private
   */
  this.currentConnectorDragger_ = null;

  /**
   * Date time scale.
   * @type {anychart.scales.GanttDateTime}
   * @private
   */
  this.scale_ = new anychart.scales.GanttDateTime();
  this.scale_.listenSignals(this.scaleInvalidated_, this);
  this.registerDisposable(this.scale_);

  this.header_ = new anychart.core.gantt.TimelineHeader();
  this.header_.suspendSignalsDispatching();
  this.header_.scale(this.scale_);
  this.header_.zIndex(anychart.core.ui.Timeline.HEADER_Z_INDEX);
  this.header_.resumeSignalsDispatching(false);
  this.registerDisposable(this.header_);

  this.controller.timeline(this);

};
goog.inherits(anychart.core.ui.Timeline, anychart.core.ui.BaseGrid);


/**
 * Supported signals.
 * @type {number}
 */
anychart.core.ui.Timeline.SUPPORTED_SIGNALS = anychart.core.ui.BaseGrid.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistence states.
 * @type {number}
 */
anychart.core.ui.Timeline.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.ui.BaseGrid.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.TIMELINE_SCALES;


/**
 * Default timeline header height.
 * @type {number}
 */
anychart.core.ui.Timeline.DEFAULT_HEADER_HEIGHT = 70;


/**
 * Baseline path z-index.
 * @type {number}
 */
anychart.core.ui.Timeline.BASELINE_Z_INDEX = 10;


/**
 * Base path z-index.
 * @type {number}
 */
anychart.core.ui.Timeline.BASE_Z_INDEX = 20;


/**
 * Progress path z-index.
 * @type {number}
 */
anychart.core.ui.Timeline.PROGRESS_Z_INDEX = 30;


/**
 * labels factory z-index.
 * @type {number}
 */
anychart.core.ui.Timeline.LABEL_Z_INDEX = 40;


/**
 * Marker factory z-index.
 * @type {number}
 */
anychart.core.ui.Timeline.MARKER_Z_INDEX = 50;


/**
 * Connector z-index.
 * @type {number}
 */
anychart.core.ui.Timeline.CONNECTOR_Z_INDEX = 60;


/**
 * Connector arrow z-index.
 * @type {number}
 */
anychart.core.ui.Timeline.ARROW_Z_INDEX = 70;


/**
 * Timeline header z-index.
 * @type {number}
 */
anychart.core.ui.Timeline.HEADER_Z_INDEX = 80;


/**
 * Arrow margin.
 * @type {number}
 */
anychart.core.ui.Timeline.ARROW_MARGIN = 5;


/**
 * Arrow size.
 * @type {number}
 */
anychart.core.ui.Timeline.ARROW_SIZE = 4;


/**
 * This constant means that bar will have height = DEFAULT_HEIGHT_REDUCTION * this.height;
 * @type {number}
 */
anychart.core.ui.Timeline.DEFAULT_HEIGHT_REDUCTION = 0.7;


/**
 * This constant means that bar will have height = PARENT_HEIGHT_REDUCTION * this.height;
 * @type {number}
 */
anychart.core.ui.Timeline.PARENT_HEIGHT_REDUCTION = 0.4;


/**
 * This constant means that progress bar will have height = PROGRESS_HEIGHT_REDUCTION * barHeight;
 * barHeight is height of bar that progress belongs to.
 * @type {number}
 */
anychart.core.ui.Timeline.PROGRESS_HEIGHT_REDUCTION = 1;


/**
 * Edit preview path z-index.
 * @type {number}
 */
anychart.core.ui.Timeline.EDIT_PREVIEW_Z_INDEX = 0;


/**
 * Edit progress path z-index.
 * @type {number}
 */
anychart.core.ui.Timeline.EDIT_PROGRESS_Z_INDEX = 10;


/**
 * Edit left thumb path z-index.
 * @type {number}
 */
anychart.core.ui.Timeline.EDIT_LEFT_THUMB_Z_INDEX = 20;


/**
 * Edit right thumb path z-index.
 * @type {number}
 */
anychart.core.ui.Timeline.EDIT_RIGHT_THUMB_Z_INDEX = 30;


/**
 * Edit start connector path z-index.
 * @type {number}
 */
anychart.core.ui.Timeline.EDIT_START_CONNECTOR_Z_INDEX = 40;


/**
 * Edit finish connector path z-index.
 * @type {number}
 */
anychart.core.ui.Timeline.EDIT_FINISH_CONNECTOR_Z_INDEX = 50;


/**
 * Edit connector preview path z-index.
 * @type {number}
 */
anychart.core.ui.Timeline.EDIT_CONNECTOR_PREVIEW_Z_INDEX = 60;


/**
 * Pixel height of edit corner.
 * @type {number}
 */
anychart.core.ui.Timeline.EDIT_CORNER_HEIGHT = 5;


/**
 * Pixel width of edit-interval-thumb.
 * @type {number}
 */
anychart.core.ui.Timeline.EDIT_INTERVAL_WIDTH = 3;


/**
 * Pixel width of edit-interval-thumb.
 * @type {number}
 */
anychart.core.ui.Timeline.EDIT_CONNECTOR_RADIUS = 5;


/**
 * Scale invalidation handler.
 * @param {anychart.SignalEvent} event - Signal event.
 * @private
 */
anychart.core.ui.Timeline.prototype.scaleInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION)) {
    this.invalidate(anychart.ConsistencyState.TIMELINE_SCALES, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Gets timeline's gantt date time scale.
 * @return {anychart.scales.GanttDateTime} - Scale.
 */
anychart.core.ui.Timeline.prototype.getScale = function() {
  return this.scale_;
};


/**
 * Gets/sets a connector preview stroke.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill .
 * @param {number=} opt_thickness .
 * @param {string=} opt_dashpattern .
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin .
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap .
 * @return {acgraph.vector.Stroke|anychart.core.ui.Timeline|string} - Current value or itself for chaining.
 */
anychart.core.ui.Timeline.prototype.connectorPreviewStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var val = acgraph.vector.normalizeStroke.apply(null, arguments);
    if (!anychart.color.equals(this.connectorPreviewStroke_, val)) {
      this.connectorPreviewStroke_ = val;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.connectorPreviewStroke_ || 'none';
};


/**
 * Gets/sets edit preview fill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.ui.Timeline|string} - Current value or itself for method chaining.
 */
anychart.core.ui.Timeline.prototype.editPreviewFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var val = acgraph.vector.normalizeFill.apply(null, arguments);
    if (!anychart.color.equals(/** @type {acgraph.vector.Fill} */ (this.editPreviewFill_), val)) {
      this.editPreviewFill_ = val;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.editPreviewFill_ || 'none';
};


/**
 * Gets/sets a edit preview stroke.
 * Base stroke is a stroke of simple time bar on timeline.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill .
 * @param {number=} opt_thickness .
 * @param {string=} opt_dashpattern .
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin .
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap .
 * @return {acgraph.vector.Stroke|anychart.core.ui.Timeline|string} - Current value or itself for chaining.
 */
anychart.core.ui.Timeline.prototype.editPreviewStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var val = acgraph.vector.normalizeStroke.apply(null, arguments);
    if (!anychart.color.equals(this.editPreviewStroke_, val)) {
      this.editPreviewStroke_ = val;
      this.invalidate(anychart.ConsistencyState.GRIDS_POSITION, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.editPreviewStroke_ || 'none';
};


/**
 * Gets/sets edit progress fill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.ui.Timeline|string} - Current value or itself for method chaining.
 */
anychart.core.ui.Timeline.prototype.editProgressFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var val = acgraph.vector.normalizeFill.apply(null, arguments);
    if (!anychart.color.equals(/** @type {acgraph.vector.Fill} */ (this.editProgressFill_), val)) {
      this.editProgressFill_ = val;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.editProgressFill_ || 'none';
};


/**
 * Gets/sets a edit progress stroke.
 * Base stroke is a stroke of simple time bar on timeline.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill .
 * @param {number=} opt_thickness .
 * @param {string=} opt_dashpattern .
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin .
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap .
 * @return {acgraph.vector.Stroke|anychart.core.ui.Timeline|string} - Current value or itself for chaining.
 */
anychart.core.ui.Timeline.prototype.editProgressStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var val = acgraph.vector.normalizeStroke.apply(null, arguments);
    if (!anychart.color.equals(this.editProgressStroke_, val)) {
      this.editProgressStroke_ = val;
      this.invalidate(anychart.ConsistencyState.GRIDS_POSITION, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.editProgressStroke_ || 'none';
};


/**
 * Gets/sets edit interval thumb fill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.ui.Timeline|string} - Current value or itself for method chaining.
 */
anychart.core.ui.Timeline.prototype.editIntervalThumbFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var val = acgraph.vector.normalizeFill.apply(null, arguments);
    if (!anychart.color.equals(/** @type {acgraph.vector.Fill} */ (this.editIntervalThumbFill_), val)) {
      this.editIntervalThumbFill_ = val;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.editIntervalThumbFill_ || 'none';
};


/**
 * Gets/sets a edit interval thumb stroke.
 * Base stroke is a stroke of simple time bar on timeline.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill .
 * @param {number=} opt_thickness .
 * @param {string=} opt_dashpattern .
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin .
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap .
 * @return {acgraph.vector.Stroke|anychart.core.ui.Timeline|string} - Current value or itself for chaining.
 */
anychart.core.ui.Timeline.prototype.editIntervalThumbStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var val = acgraph.vector.normalizeStroke.apply(null, arguments);
    if (!anychart.color.equals(this.editIntervalThumbStroke_, val)) {
      this.editIntervalThumbStroke_ = val;
      this.invalidate(anychart.ConsistencyState.GRIDS_POSITION, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.editIntervalThumbStroke_ || 'none';
};


/**
 * Gets/sets edit connector thumb fill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.ui.Timeline|string} - Current value or itself for method chaining.
 */
anychart.core.ui.Timeline.prototype.editConnectorThumbFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var val = acgraph.vector.normalizeFill.apply(null, arguments);
    if (!anychart.color.equals(/** @type {acgraph.vector.Fill} */ (this.editConnectorThumbFill_), val)) {
      this.editConnectorThumbFill_ = val;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.editConnectorThumbFill_ || 'none';
};


/**
 * Gets/sets a edit connector thumb stroke.
 * Base stroke is a stroke of simple time bar on timeline.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill .
 * @param {number=} opt_thickness .
 * @param {string=} opt_dashpattern .
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin .
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap .
 * @return {acgraph.vector.Stroke|anychart.core.ui.Timeline|string} - Current value or itself for chaining.
 */
anychart.core.ui.Timeline.prototype.editConnectorThumbStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var val = acgraph.vector.normalizeStroke.apply(null, arguments);
    if (!anychart.color.equals(this.editConnectorThumbStroke_, val)) {
      this.editConnectorThumbStroke_ = val;
      this.invalidate(anychart.ConsistencyState.GRIDS_POSITION, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.editConnectorThumbStroke_ || 'none';
};


/**
 * Gets/sets base fill.
 * Base fill is a fill of simple time bar on timeline.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.ui.Timeline|string} - Current value or itself for method chaining.
 */
anychart.core.ui.Timeline.prototype.baseFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var val = acgraph.vector.normalizeFill.apply(null, arguments);
    if (!anychart.color.equals(/** @type {acgraph.vector.Fill} */ (this.baseFill_), val)) {
      this.baseFill_ = val;
      this.invalidate(anychart.ConsistencyState.GRIDS_POSITION, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.baseFill_ || 'none';
};


/**
 * Gets/sets a base stroke.
 * Base stroke is a stroke of simple time bar on timeline.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill .
 * @param {number=} opt_thickness .
 * @param {string=} opt_dashpattern .
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin .
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap .
 * @return {acgraph.vector.Stroke|anychart.core.ui.Timeline|string} - Current value or itself for chaining.
 */
anychart.core.ui.Timeline.prototype.baseStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var val = acgraph.vector.normalizeStroke.apply(null, arguments);
    if (!anychart.color.equals(this.baseStroke_, val)) {
      this.baseStroke_ = val;
      this.invalidate(anychart.ConsistencyState.GRIDS_POSITION, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.baseStroke_ || 'none';
};


/**
 * Gets/sets baseline fill.
 * Baseline fill is a fill of baseline bar on timeline.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.ui.Timeline|string} - Current value or itself for method chaining.
 */
anychart.core.ui.Timeline.prototype.baselineFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var val = acgraph.vector.normalizeFill.apply(null, arguments);
    if (!anychart.color.equals(/** @type {acgraph.vector.Fill} */ (this.baselineFill_), val)) {
      this.baselineFill_ = val;
      this.invalidate(anychart.ConsistencyState.GRIDS_POSITION, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.baselineFill_ || 'none';
};


/**
 * Gets/sets a baseline stroke.
 * Baseline stroke is a stroke of baseline bar on timeline.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill .
 * @param {number=} opt_thickness .
 * @param {string=} opt_dashpattern .
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin .
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap .
 * @return {acgraph.vector.Stroke|anychart.core.ui.Timeline|string} - Current value or itself for chaining.
 */
anychart.core.ui.Timeline.prototype.baselineStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var val = acgraph.vector.normalizeStroke.apply(null, arguments);
    if (!anychart.color.equals(this.baselineStroke_, val)) {
      this.baselineStroke_ = val;
      this.invalidate(anychart.ConsistencyState.GRIDS_POSITION, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.baselineStroke_ || 'none';
};


/**
 * Gets/sets progress bar fill.
 * Progress fill is a fill of progress bar on timeline.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.ui.Timeline|string} - Current value or itself for method chaining.
 */
anychart.core.ui.Timeline.prototype.progressFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var val = acgraph.vector.normalizeFill.apply(null, arguments);
    if (!anychart.color.equals(/** @type {acgraph.vector.Fill} */ (this.progressFill_), val)) {
      this.progressFill_ = val;
      this.invalidate(anychart.ConsistencyState.GRIDS_POSITION, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.progressFill_ || 'none';
};


/**
 * Gets/sets a progress bar stroke.
 * Progress stroke is a stroke of progress bar on timeline.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill .
 * @param {number=} opt_thickness .
 * @param {string=} opt_dashpattern .
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin .
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap .
 * @return {acgraph.vector.Stroke|anychart.core.ui.Timeline|string} - Current value or itself for chaining.
 */
anychart.core.ui.Timeline.prototype.progressStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var val = acgraph.vector.normalizeStroke.apply(null, arguments);
    if (!anychart.color.equals(this.progressStroke_, val)) {
      this.progressStroke_ = val;
      this.invalidate(anychart.ConsistencyState.GRIDS_POSITION, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.progressStroke_ || 'none';
};


/**
 * Gets/sets a milestone fill.
 * Milestone fill is a fill of milestone on timeline.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.ui.Timeline|string} - Current value or itself for method chaining.
 */
anychart.core.ui.Timeline.prototype.milestoneFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var val = acgraph.vector.normalizeFill.apply(null, arguments);
    if (!anychart.color.equals(/** @type {acgraph.vector.Fill} */ (this.milestoneFill_), val)) {
      this.milestoneFill_ = val;
      this.invalidate(anychart.ConsistencyState.GRIDS_POSITION, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.milestoneFill_ || 'none';
};


/**
 * Gets/sets a milestone stroke.
 * Milestone stroke is a stroke of milestone on timeline.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill .
 * @param {number=} opt_thickness .
 * @param {string=} opt_dashpattern .
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin .
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap .
 * @return {acgraph.vector.Stroke|anychart.core.ui.Timeline|string} - Current value or itself for chaining.
 */
anychart.core.ui.Timeline.prototype.milestoneStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var val = acgraph.vector.normalizeStroke.apply(null, arguments);
    if (!anychart.color.equals(this.milestoneStroke_, val)) {
      this.milestoneStroke_ = val;
      this.invalidate(anychart.ConsistencyState.GRIDS_POSITION, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.milestoneStroke_ || 'none';
};


/**
 * Gets/sets a parent fill.
 * Parent fill is a fill of summary (parent) task bar on timeline.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.ui.Timeline|string} - Current value or itself for method chaining.
 */
anychart.core.ui.Timeline.prototype.parentFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var val = acgraph.vector.normalizeFill.apply(null, arguments);
    if (!anychart.color.equals(/** @type {acgraph.vector.Fill} */ (this.parentFill_), val)) {
      this.parentFill_ = val;
      this.invalidate(anychart.ConsistencyState.GRIDS_POSITION, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.parentFill_ || 'none';
};


/**
 * Gets/sets a parent stroke.
 * Parent stroke is a stroke of summary (parent) task bar on timeline.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill .
 * @param {number=} opt_thickness .
 * @param {string=} opt_dashpattern .
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin .
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap .
 * @return {acgraph.vector.Stroke|anychart.core.ui.Timeline|string} - Current value or itself for chaining.
 */
anychart.core.ui.Timeline.prototype.parentStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var val = acgraph.vector.normalizeStroke.apply(null, arguments);
    if (!anychart.color.equals(this.parentStroke_, val)) {
      this.parentStroke_ = val;
      this.invalidate(anychart.ConsistencyState.GRIDS_POSITION, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.parentStroke_ || 'none';
};


/**
 * Gets/sets a connector arrow fill.
 * Connector fill is a fill of arrow of connector on timeline.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.ui.Timeline|string} - Current value or itself for method chaining.
 */
anychart.core.ui.Timeline.prototype.connectorFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var val = acgraph.vector.normalizeFill.apply(null, arguments);
    if (!anychart.color.equals(/** @type {acgraph.vector.Fill} */ (this.connectorFill_), val)) {
      this.connectorFill_ = val;
      this.invalidate(anychart.ConsistencyState.GRIDS_POSITION, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.connectorFill_ || 'none';
};


/**
 * Gets/sets a connector stroke.
 * Connector stroke is a stroke of connector's line on timeline.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill .
 * @param {number=} opt_thickness .
 * @param {string=} opt_dashpattern .
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin .
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap .
 * @return {acgraph.vector.Stroke|anychart.core.ui.Timeline|string} - Current value or itself for chaining.
 */
anychart.core.ui.Timeline.prototype.connectorStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var val = acgraph.vector.normalizeStroke.apply(null, arguments);
    if (!anychart.color.equals(this.connectorStroke_, val)) {
      this.connectorStroke_ = val;
      this.invalidate(anychart.ConsistencyState.GRIDS_POSITION, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.connectorStroke_ || 'none';
};


/**
 * Gets/sets selected element fill.
 * Selected element fill is fill of selected element (whole data item or period) on timeline.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.ui.Timeline|string} - Current value or itself for method chaining.
 */
anychart.core.ui.Timeline.prototype.selectedElementFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var val = acgraph.vector.normalizeFill.apply(null, arguments);
    if (!anychart.color.equals(/** @type {acgraph.vector.Fill} */ (this.selectedElementFill_), val)) {
      this.selectedElementFill_ = val;
      this.invalidate(anychart.ConsistencyState.GRIDS_POSITION, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.selectedElementFill_ || 'none';
};


/**
 * Gets/sets selected element stroke.
 * Selected element stroke is stroke of selected element (whole data item or period) on timeline.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill .
 * @param {number=} opt_thickness .
 * @param {string=} opt_dashpattern .
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin .
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap .
 * @return {acgraph.vector.Stroke|anychart.core.ui.Timeline|string} - Current value or itself for chaining.
 */
anychart.core.ui.Timeline.prototype.selectedElementStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var val = acgraph.vector.normalizeStroke.apply(null, arguments);
    if (!anychart.color.equals(this.selectedElementStroke_, val)) {
      this.selectedElementStroke_ = val;
      this.invalidate(anychart.ConsistencyState.GRIDS_POSITION, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.selectedElementStroke_ || 'none';
};


/**
 * Gets/sets column stroke.
 * @param {(acgraph.vector.Stroke|string)=} opt_value - Value to be set.
 * @return {(string|acgraph.vector.Stroke|anychart.core.ui.Timeline)} - Current value or itself for method chaining.
 */
anychart.core.ui.Timeline.prototype.columnStroke = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = acgraph.vector.normalizeStroke.apply(null, arguments);

    //TODO (A.Kudryavtsev): In current moment (15 June 2015) method anychart.color.equals works pretty bad.
    //TODO (A.Kudryavtsev): That's why here I check thickness as well.
    var oldThickness = anychart.utils.extractThickness(this.columnStroke_);
    var newThickness = anychart.utils.extractThickness(val);

    if (!anychart.color.equals(this.columnStroke_, val) || newThickness != oldThickness) {
      this.columnStroke_ = val;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.columnStroke_;
};


/**
 * Gets/sets minimum gap.
 * @param {number=} opt_value - Value to be set.
 * @return {number|anychart.core.ui.Timeline} - Current value or itself for method chaining.
 */
anychart.core.ui.Timeline.prototype.minimumGap = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = +opt_value || 0;
    if (this.minimumGap_ != opt_value) {
      this.minimumGap_ = opt_value;
      this.invalidate(anychart.ConsistencyState.TIMELINE_SCALES, anychart.Signal.NEEDS_REDRAW);
      return this;
    }
  }
  return this.minimumGap_;
};


/**
 * Gets/sets maximum gap.
 * @param {number=} opt_value - Value to be set.
 * @return {number|anychart.core.ui.Timeline} - Current value or itself for method chaining.
 */
anychart.core.ui.Timeline.prototype.maximumGap = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = +opt_value || 0;
    if (this.maximumGap_ != opt_value) {
      this.maximumGap_ = opt_value;
      this.invalidate(anychart.ConsistencyState.TIMELINE_SCALES, anychart.Signal.NEEDS_REDRAW);
      return this;
    }
  }
  return this.maximumGap_;
};


/**
 * Inner labels factory getter.
 * @param {Object=} opt_value - Value to be set.
 * @return {anychart.core.ui.Timeline|anychart.core.ui.LabelsFactory} - Current value or itself for method chaining.
 */
anychart.core.ui.Timeline.prototype.labelsFactory = function(opt_value) {
  if (!this.labelsFactory_) {
    this.labelsFactory_ = new anychart.core.ui.LabelsFactory();
    this.labelsFactory_.setParentEventTarget(this);
  }

  if (goog.isDef(opt_value)) {
    var redraw = true;
    if (opt_value instanceof anychart.core.ui.LabelsFactory) {
      this.labelsFactory_.setup(opt_value.serialize());
    } else if (goog.isObject(opt_value)) {
      this.labelsFactory_.setup(opt_value);
    } else if (anychart.utils.isNone(opt_value)) {
      this.labelsFactory_.enabled(false);
    } else {
      redraw = false;
    }
    if (redraw) {

      this.invalidate(anychart.ConsistencyState.GRIDS_POSITION, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }

  return this.labelsFactory_;
};


/**
 * Gets/sets 'baseline above' flag.
 * If the flag is set to 'true', baseline bar will be displayed abode an actual time bar.
 * @param {boolean=} opt_value - Value to be set.
 * @return {boolean|anychart.core.ui.Timeline} - Current value or itself for method chaining.
 */
anychart.core.ui.Timeline.prototype.baselineAbove = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.baselineAbove_ != opt_value) {
      this.baselineAbove_ = opt_value;
      this.invalidate(anychart.ConsistencyState.GRIDS_POSITION, anychart.Signal.NEEDS_REDRAW);
      return this;
    }
  }
  return this.baselineAbove_;
};


/**
 * Getter for this.separationPath_.
 * @return {acgraph.vector.Path}
 * @private
 */
anychart.core.ui.Timeline.prototype.getSeparationPath_ = function() {
  if (!this.separationPath_) {
    this.separationPath_ = /** @type {acgraph.vector.Path} */ (this.getClipLayer().path());
    this.separationPath_.stroke(this.columnStroke_);
    this.registerDisposable(this.separationPath_);
  }
  return this.separationPath_;
};


/**
 * Getter for this.editPreviewPath_.
 * @return {anychart.core.ui.Timeline.LiveEditControl}
 * @private
 */
anychart.core.ui.Timeline.prototype.getEditPreviewPath_ = function() {
  if (!this.editPreviewPath_) {
    this.editPreviewPath_ = new anychart.core.ui.Timeline.LiveEditControl(this.getEditLayer());
    this.editPreviewPath_
        .zIndex(anychart.core.ui.Timeline.EDIT_PREVIEW_Z_INDEX)
        .cursor(acgraph.vector.Cursor.EW_RESIZE);

    this.eventsHandler.listen(this.editPreviewPath_, acgraph.events.EventType.MOUSEDOWN, function(e) {
      e.stopPropagation();
    });

    this.editPreviewPath_.listenOnce(acgraph.events.EventType.MOUSEDOWN, this.editPreviewDragMouseDown_, false, this);

    this.registerDisposable(this.editPreviewPath_);
  }
  return this.editPreviewPath_;
};


/**
 * Getter for this.editProgressPath_.
 * @return {anychart.core.ui.Timeline.LiveEditControl}
 * @private
 */
anychart.core.ui.Timeline.prototype.getEditProgressPath_ = function() {
  if (!this.editProgressPath_) {
    this.editProgressPath_ = new anychart.core.ui.Timeline.LiveEditControl(this.getEditLayer());
    this.editProgressPath_
        .zIndex(anychart.core.ui.Timeline.EDIT_PROGRESS_Z_INDEX);

    this.eventsHandler.listen(this.editProgressPath_, acgraph.events.EventType.MOUSEDOWN, function(e) {
      e.stopPropagation();
    });

    this.editProgressPath_.listenOnce(acgraph.events.EventType.MOUSEDOWN, this.editProgressDragMouseDown_, false, this);

    this.registerDisposable(this.editProgressPath_);
  }
  return this.editProgressPath_;
};


/**
 * Getter for this.editLeftThumbPath_.
 * @return {anychart.core.ui.Timeline.LiveEditControl}
 * @private
 */
anychart.core.ui.Timeline.prototype.getEditLeftThumbPath_ = function() {
  if (!this.editLeftThumbPath_) {
    this.editLeftThumbPath_ = new anychart.core.ui.Timeline.LiveEditControl(this.getEditLayer());
    this.editLeftThumbPath_
        .zIndex(anychart.core.ui.Timeline.EDIT_LEFT_THUMB_Z_INDEX)
        .cursor(/** @type {acgraph.vector.Cursor} */ ('col-resize')); //TODO (A.Kudryavtsev): Kind of crossbrowser issue?

    this.editLeftThumbPath_.preview = this.getEditPreviewPath_();

    this.eventsHandler.listen(this.editLeftThumbPath_, acgraph.events.EventType.MOUSEDOWN, function(e) {
      e.stopPropagation();
    });

    this.editLeftThumbPath_.listenOnce(acgraph.events.EventType.MOUSEDOWN, this.editLeftThumbDragMouseDown_, false, this);

    this.registerDisposable(this.editLeftThumbPath_);
  }
  return this.editLeftThumbPath_;
};


/**
 * Getter for this.editLeftThumbPath_.
 * @return {anychart.core.ui.Timeline.LiveEditControl}
 * @private
 */
anychart.core.ui.Timeline.prototype.getEditRightThumbPath_ = function() {
  if (!this.editRightThumbPath_) {
    this.editRightThumbPath_ = new anychart.core.ui.Timeline.LiveEditControl(this.getEditLayer());
    this.editRightThumbPath_
        .zIndex(anychart.core.ui.Timeline.EDIT_RIGHT_THUMB_Z_INDEX)
        .cursor(/** @type {acgraph.vector.Cursor} */ ('col-resize')); //TODO (A.Kudryavtsev): Kind of crossbrowser issue?

    this.editRightThumbPath_.preview = this.getEditPreviewPath_();

    this.eventsHandler.listen(this.editRightThumbPath_, acgraph.events.EventType.MOUSEDOWN, function(e) {
      e.stopPropagation();
    });

    this.editRightThumbPath_.listenOnce(acgraph.events.EventType.MOUSEDOWN, this.editRightThumbDragMouseDown_, false, this);

    this.registerDisposable(this.editRightThumbPath_);
  }
  return this.editRightThumbPath_;
};


/**
 * Getter for this.editStartConnectorPath_.
 * @return {anychart.core.ui.Timeline.LiveEditControl}
 * @private
 */
anychart.core.ui.Timeline.prototype.getEditStartConnectorPath_ = function() {
  if (!this.editStartConnectorPath_) {
    this.editStartConnectorPath_ = new anychart.core.ui.Timeline.LiveEditControl(this.getEditLayer());
    this.editStartConnectorPath_
        .zIndex(anychart.core.ui.Timeline.EDIT_START_CONNECTOR_Z_INDEX)
        .cursor(acgraph.vector.Cursor.MOVE);

    this.eventsHandler.listen(this.editStartConnectorPath_, acgraph.events.EventType.MOUSEDOWN, function(e) {
      e.stopPropagation();
    });

    this.editStartConnectorPath_.listenOnce(acgraph.events.EventType.MOUSEDOWN, this.editStartConnectorMouseDown_, false, this);

    this.registerDisposable(this.editStartConnectorPath_);
  }
  return this.editStartConnectorPath_;
};


/**
 * Getter for this.editLeftThumbPath_.
 * @return {anychart.core.ui.Timeline.LiveEditControl}
 * @private
 */
anychart.core.ui.Timeline.prototype.getEditFinishConnectorPath_ = function() {
  if (!this.editFinishConnectorPath_) {
    this.editFinishConnectorPath_ = new anychart.core.ui.Timeline.LiveEditControl(this.getEditLayer());
    this.editFinishConnectorPath_
        .zIndex(anychart.core.ui.Timeline.EDIT_FINISH_CONNECTOR_Z_INDEX)
        .cursor(acgraph.vector.Cursor.MOVE);

    this.eventsHandler.listen(this.editFinishConnectorPath_, acgraph.events.EventType.MOUSEDOWN, function(e) {
      e.stopPropagation();
    });

    this.editFinishConnectorPath_.listenOnce(acgraph.events.EventType.MOUSEDOWN, this.editFinishConnectorMouseDown_, false, this);

    this.registerDisposable(this.editFinishConnectorPath_);
  }
  return this.editFinishConnectorPath_;
};


/**
 * Getter for this.editConnectorPreviewPath_.
 * @return {acgraph.vector.Path}
 * @private
 */
anychart.core.ui.Timeline.prototype.getEditConnectorPreviewPath_ = function() {
  if (!this.editConnectorPreviewPath_) {
    this.editConnectorPreviewPath_ = /** @type {acgraph.vector.Path} */ (this.getEditLayer().path());
    this.editConnectorPreviewPath_
        .stroke(this.connectorPreviewStroke_)
        .zIndex(anychart.core.ui.Timeline.EDIT_CONNECTOR_PREVIEW_Z_INDEX);

    this.registerDisposable(this.editConnectorPreviewPath_);
  }
  return this.editConnectorPreviewPath_;
};


/**
 * Clears edit controls.
 * @private
 */
anychart.core.ui.Timeline.prototype.clearEdit_ = function() {
  this.getEditPreviewPath_().clear().setTransformationMatrix(1, 0, 0, 1, 0, 0);
  this.getEditProgressPath_().clear().setTransformationMatrix(1, 0, 0, 1, 0, 0);
  this.getEditRightThumbPath_().clear().setTransformationMatrix(1, 0, 0, 1, 0, 0);
  this.getEditLeftThumbPath_().clear().setTransformationMatrix(1, 0, 0, 1, 0, 0);
  this.getEditFinishConnectorPath_().clear().setTransformationMatrix(1, 0, 0, 1, 0, 0);
  this.getEditStartConnectorPath_().clear().setTransformationMatrix(1, 0, 0, 1, 0, 0);
  this.getEditConnectorPreviewPath_().clear();
};


/**
 * Drag preview mouse down handler.
 * Initializes drag events.
 * @param {acgraph.events.BrowserEvent} e - Event.
 * @private
 */
anychart.core.ui.Timeline.prototype.editPreviewDragMouseDown_ = function(e) {
  this.editPreviewDragger_ = new anychart.core.ui.Timeline.BarDragger(this.getEditPreviewPath_());
  this.registerDisposable(this.editPreviewDragger_);

  this.editPreviewDragger_.listen(goog.fx.Dragger.EventType.START, this.editPreviewDragStart_, false, this);
  this.editPreviewDragger_.listen(goog.fx.Dragger.EventType.DRAG, this.editPreviewDrag_, false, this);
  this.editPreviewDragger_.listen(goog.fx.Dragger.EventType.END, this.editPreviewEnd_, false, this);
  this.editPreviewDragger_.startDrag(e.getOriginalEvent());
};


/**
 * Drag progress mouse down handler.
 * Initializes drag events.
 * @param {acgraph.events.BrowserEvent} e - Event.
 * @private
 */
anychart.core.ui.Timeline.prototype.editProgressDragMouseDown_ = function(e) {
  this.editProgressDragger_ = new anychart.core.ui.Timeline.ProgressDragger(this.getEditProgressPath_());
  this.registerDisposable(this.editProgressDragger_);

  this.editProgressDragger_.listen(goog.fx.Dragger.EventType.START, this.editProgressDragStart_, false, this);
  this.editProgressDragger_.listen(goog.fx.Dragger.EventType.DRAG, this.editProgressDrag_, false, this);
  this.editProgressDragger_.listen(goog.fx.Dragger.EventType.END, this.editProgressDragEnd_, false, this);
  this.editProgressDragger_.startDrag(e.getOriginalEvent());
};


/**
 * Drag left thumb mouse down handler.
 * Initializes drag events.
 * @param {acgraph.events.BrowserEvent} e - Event.
 * @private
 */
anychart.core.ui.Timeline.prototype.editLeftThumbDragMouseDown_ = function(e) {
  this.editLeftThumbDragger_ = new anychart.core.ui.Timeline.ThumbDragger(this.getEditLeftThumbPath_(), true);
  this.registerDisposable(this.editLeftThumbDragger_);

  this.editLeftThumbDragger_.listen(goog.fx.Dragger.EventType.START, this.editLeftThumbDragStart_, false, this);
  this.editLeftThumbDragger_.listen(goog.fx.Dragger.EventType.DRAG, this.editThumbDrag_, false, this);
  this.editLeftThumbDragger_.listen(goog.fx.Dragger.EventType.END, this.editThumbDragEnd_, false, this);
  this.editLeftThumbDragger_.startDrag(e.getOriginalEvent());
};


/**
 * Drag right thumb mouse down handler.
 * Initializes drag events.
 * @param {acgraph.events.BrowserEvent} e - Event.
 * @private
 */
anychart.core.ui.Timeline.prototype.editRightThumbDragMouseDown_ = function(e) {
  this.editRightThumbDragger_ = new anychart.core.ui.Timeline.ThumbDragger(this.getEditRightThumbPath_(), false);
  this.registerDisposable(this.editRightThumbDragger_);

  this.editRightThumbDragger_.listen(goog.fx.Dragger.EventType.START, this.editRightThumbDragStart_, false, this);
  this.editRightThumbDragger_.listen(goog.fx.Dragger.EventType.DRAG, this.editThumbDrag_, false, this);
  this.editRightThumbDragger_.listen(goog.fx.Dragger.EventType.END, this.editThumbDragEnd_, false, this);
  this.editRightThumbDragger_.startDrag(e.getOriginalEvent());
};


/**
 * Drag start connector mouse down handler.
 * Initializes drag events.
 * @param {acgraph.events.BrowserEvent} e - Event.
 * @private
 */
anychart.core.ui.Timeline.prototype.editStartConnectorMouseDown_ = function(e) {
  this.editStartConnectorDragger_ = new anychart.core.ui.Timeline.ConnectorDragger(this, this.getEditStartConnectorPath_(), true);
  this.registerDisposable(this.editStartConnectorDragger_);

  this.editStartConnectorDragger_.listen(goog.fx.Dragger.EventType.START, this.editConnectorDragStart_, false, this);
  this.editStartConnectorDragger_.listen(goog.fx.Dragger.EventType.DRAG, this.editConnectorDrag_, false, this);
  this.editStartConnectorDragger_.listen(goog.fx.Dragger.EventType.END, this.editConnectorDragEnd_, false, this);
  this.editStartConnectorDragger_.startDrag(e.getOriginalEvent());
};


/**
 * Drag finish connector mouse down handler.
 * Initializes drag events.
 * @param {acgraph.events.BrowserEvent} e - Event.
 * @private
 */
anychart.core.ui.Timeline.prototype.editFinishConnectorMouseDown_ = function(e) {
  this.editFinishConnectorDragger_ = new anychart.core.ui.Timeline.ConnectorDragger(this, this.getEditFinishConnectorPath_(), false);
  this.registerDisposable(this.editFinishConnectorDragger_);

  this.editFinishConnectorDragger_.listen(goog.fx.Dragger.EventType.START, this.editConnectorDragStart_, false, this);
  this.editFinishConnectorDragger_.listen(goog.fx.Dragger.EventType.DRAG, this.editConnectorDrag_, false, this);
  this.editFinishConnectorDragger_.listen(goog.fx.Dragger.EventType.END, this.editConnectorDragEnd_, false, this);
  this.editFinishConnectorDragger_.startDrag(e.getOriginalEvent());
};


/**
 * Edit preview drag start handler.
 * @param {goog.fx.DragEvent} e - Event.
 * @private
 */
anychart.core.ui.Timeline.prototype.editPreviewDragStart_ = function(e) {
  if (this.scrollDragger) this.scrollDragger.setEnabled(false);
  this.tooltip().hide().enabled(false);
  this.interactivityHandler.highlight();
  this.getEditProgressPath_().clear();
  this.getEditLeftThumbPath_().clear();
  this.getEditRightThumbPath_().clear();
  this.getEditStartConnectorPath_().clear();
  this.getEditFinishConnectorPath_().clear();

  goog.style.setStyle(goog.global['document']['body'], 'cursor', acgraph.vector.Cursor.EW_RESIZE);
};


/**
 * Edit preview drag handler.
 * @param {goog.fx.DragEvent} e - Event.
 * @private
 */
anychart.core.ui.Timeline.prototype.editPreviewDrag_ = function(e) {
  this.dragging = true;
  this.interactive = false;
};


/**
 * Edit preview drag end handler.
 * @param {goog.fx.DragEvent} e - Event.
 * @private
 */
anychart.core.ui.Timeline.prototype.editPreviewEnd_ = function(e) {
  if (this.dragging) {
    if (this.scrollDragger) this.scrollDragger.setEnabled(true);
    this.tooltip().enabled(true);
    var draggedBounds = this.getEditPreviewPath_().getBounds();

    this.clearEdit_();

    var dragger = e.target;
    var el = /** @type {anychart.core.ui.Timeline.LiveEditControl} */ (dragger.element);
    var dataItem = el.item;
    var tree = dataItem.tree();

    tree.suspendSignalsDispatching();

    var newActualStartRatio = (el.type == anychart.enums.TLElementTypes.MILESTONE) ?
        ((draggedBounds.left + draggedBounds.width / 2 - this.pixelBoundsCache.left) / (this.pixelBoundsCache.width)) :
        ((draggedBounds.left - this.pixelBoundsCache.left) / (this.pixelBoundsCache.width));
    var newActualStart = this.scale_.ratioToTimestamp(newActualStartRatio);

    /*
      This check is for rare case:
      Sometimes we can get NaN values by some unknown factors that I can't catch and reproduce (drag issues?).
      This condition prevents setting NaN values.
     */
    if (!isNaN(newActualStart)) {
      var delta = 0;

      switch (el.type) {
        case anychart.enums.TLElementTypes.MILESTONE:
          dataItem.set(anychart.enums.GanttDataFields.ACTUAL_START, newActualStart);
          if (goog.isDef(dataItem.get(anychart.enums.GanttDataFields.ACTUAL_END)))
            dataItem.set(anychart.enums.GanttDataFields.ACTUAL_END, newActualStart);
          break;
        case anychart.enums.TLElementTypes.PERIOD:
          var period = el.period;
          var periodIndex = el.periodIndex;
          var periodStart = anychart.utils.normalizeTimestamp(period[anychart.enums.GanttDataFields.START]);
          var periodEnd = anychart.utils.normalizeTimestamp(period[anychart.enums.GanttDataFields.END]);
          delta = newActualStart - periodStart;
          var newPeriodEnd = periodEnd + delta;
          if (!isNaN(newPeriodEnd)) {
            dataItem.set(anychart.enums.GanttDataFields.PERIODS, periodIndex, anychart.enums.GanttDataFields.START, newActualStart);
            dataItem.set(anychart.enums.GanttDataFields.PERIODS, periodIndex, anychart.enums.GanttDataFields.END, newPeriodEnd);
          }
          break;
        case anychart.enums.TLElementTypes.BASELINE:
          var baselineStart = anychart.utils.normalizeTimestamp(dataItem.get(anychart.enums.GanttDataFields.BASELINE_START));
          var baselineEnd = anychart.utils.normalizeTimestamp(dataItem.get(anychart.enums.GanttDataFields.BASELINE_END));
          delta = newActualStart - baselineStart;
          var newBaselineEnd = baselineEnd + delta;
          if (!isNaN(newBaselineEnd))
            dataItem.set(anychart.enums.GanttDataFields.BASELINE_START, newActualStart);
          dataItem.set(anychart.enums.GanttDataFields.BASELINE_END, baselineEnd + delta);
          break;
        default:
          var actualStart = /** @type {number} */ (goog.isDef(dataItem.get(anychart.enums.GanttDataFields.ACTUAL_START)) ?
              anychart.utils.normalizeTimestamp(dataItem.get(anychart.enums.GanttDataFields.ACTUAL_START)) :
              dataItem.meta('autoStart'));

          var actualEnd = goog.isDef(dataItem.get(anychart.enums.GanttDataFields.ACTUAL_END)) ?
              anychart.utils.normalizeTimestamp(dataItem.get(anychart.enums.GanttDataFields.ACTUAL_END)) :
              dataItem.meta('autoEnd');
          delta = newActualStart - actualStart;
          var newActualEnd = actualEnd + delta;
          if (!isNaN(newActualEnd)) {
            dataItem.set(anychart.enums.GanttDataFields.ACTUAL_START, newActualStart);
            dataItem.set(anychart.enums.GanttDataFields.ACTUAL_END, newActualEnd);
          }
      }
    }


    tree.resumeSignalsDispatching(true);

    this.initScale_();

    this.dragging = false;
    clearInterval(this.scrollInterval);
    this.scrollInterval = null;
  }
  goog.style.setStyle(goog.global['document']['body'], 'cursor', ''); //TODO (A.Kudryavtsev): Do we reset old CSS cursor here?
};


/**
 * Edit progress drag start handler.
 * @param {goog.fx.DragEvent} e - Event.
 * @private
 */
anychart.core.ui.Timeline.prototype.editProgressDragStart_ = function(e) {
  if (this.scrollDragger) this.scrollDragger.setEnabled(false);
  this.draggingProgress = true;
  this.tooltip().hide().enabled(false);
  this.getEditLeftThumbPath_().clear();
  this.getEditRightThumbPath_().clear();
  this.getEditStartConnectorPath_().clear();
  this.getEditFinishConnectorPath_().clear();
  this.getEditPreviewPath_().clear();
};


/**
 * Edit progress drag handler.
 * @param {goog.fx.DragEvent} e - Event.
 * @private
 */
anychart.core.ui.Timeline.prototype.editProgressDrag_ = function(e) {
  this.dragging = true;
  this.interactive = false;
};


/**
 * Edit progress drag end handler.
 * @param {goog.fx.DragEvent} e - Event.
 * @private
 */
anychart.core.ui.Timeline.prototype.editProgressDragEnd_ = function(e) {
  if (this.dragging) {
    if (this.scrollDragger) this.scrollDragger.setEnabled(true);
    this.tooltip().enabled(true);

    this.clearEdit_();

    var dragger = e.target;
    var el = dragger.element;
    if (!isNaN(dragger.progress)) {
      var prog = anychart.math.round(dragger.progress * 100, 2) + '%';
      el.item.set(anychart.enums.GanttDataFields.PROGRESS_VALUE, prog);
    }
    this.dragging = false;
    clearInterval(this.scrollInterval);
    this.scrollInterval = null;
    this.draggingProgress = false;
  }
};


/**
 * Edit thumb drag start handler.
 * @param {goog.fx.DragEvent} e - Event.
 * @private
 */
anychart.core.ui.Timeline.prototype.editRightThumbDragStart_ = function(e) {
  if (this.scrollDragger) this.scrollDragger.setEnabled(false);
  this.tooltip().hide().enabled(false);
  this.getEditProgressPath_().clear();
  this.getEditLeftThumbPath_().clear();
  this.getEditRightThumbPath_().clear();
  this.getEditStartConnectorPath_().clear();
  this.getEditFinishConnectorPath_().clear();

  goog.style.setStyle(goog.global['document']['body'], 'cursor', 'col-resize');
  this.editPreviewPath_.cursor(/** @type {acgraph.vector.Cursor} */ ('col-resize'));
};


/**
 * Edit thumb drag start handler.
 * @param {goog.fx.DragEvent} e - Event.
 * @private
 */
anychart.core.ui.Timeline.prototype.editLeftThumbDragStart_ = function(e) {
  if (this.scrollDragger) this.scrollDragger.setEnabled(false);
  this.tooltip().hide().enabled(false);
  this.getEditProgressPath_().clear();
  this.getEditLeftThumbPath_().clear();
  this.getEditRightThumbPath_().clear();
  this.getEditStartConnectorPath_().clear();
  this.getEditFinishConnectorPath_().clear();

  goog.style.setStyle(goog.global['document']['body'], 'cursor', 'col-resize');
  this.editPreviewPath_.cursor(/** @type {acgraph.vector.Cursor} */ ('col-resize'));

};


/**
 * Draws thumb preview.
 * @param {goog.fx.DragEvent} event - Event.
 * @param {number=} opt_scrolling - Negative value means scrolling left, otherwise is scrolling right. Zero is not a scrolling.
 * @private
 */
anychart.core.ui.Timeline.prototype.drawThumbPreview_ = function(event, opt_scrolling) {
  if (this.currentThumbDragger_) {
    var path = this.currentThumbDragger_.isLeft ? this.editLeftThumbPath_ : this.editRightThumbPath_;

    var item = path.item;
    var type = path.type;
    var period = path.period;
    var bounds = path.bounds;

    var time;

    switch (type) {
      case anychart.enums.TLElementTypes.BASELINE:
        time = this.currentThumbDragger_.isLeft ?
            anychart.utils.normalizeTimestamp(item.get(anychart.enums.GanttDataFields.BASELINE_END)) :
            anychart.utils.normalizeTimestamp(item.get(anychart.enums.GanttDataFields.BASELINE_START));
        break;
      case anychart.enums.TLElementTypes.PERIOD:
        time = this.currentThumbDragger_.isLeft ?
            anychart.utils.normalizeTimestamp(period[anychart.enums.GanttDataFields.END]) :
            anychart.utils.normalizeTimestamp(period[anychart.enums.GanttDataFields.START]);
        break;
      default:
        if (this.currentThumbDragger_.isLeft) {
          time = goog.isDef(item.get(anychart.enums.GanttDataFields.ACTUAL_END)) ?
              anychart.utils.normalizeTimestamp(item.get(anychart.enums.GanttDataFields.ACTUAL_END)) :
              item.meta('autoEnd');
        } else {
          time = goog.isDef(item.get(anychart.enums.GanttDataFields.ACTUAL_START)) ?
              anychart.utils.normalizeTimestamp(item.get(anychart.enums.GanttDataFields.ACTUAL_START)) :
              item.meta('autoStart');
        }
    }

    var left = goog.style.getClientPosition(/** @type {Element} */(this.container().getStage().container())).x;

    var mouseLeft;
    if (opt_scrolling) {
      mouseLeft = opt_scrolling < 0 ? this.pixelBoundsCache.left : this.pixelBoundsCache.left + this.pixelBoundsCache.width;
    } else {
      mouseLeft = event.clientX - left;
    }

    var ratio = this.scale_.timestampToRatio(time);
    var ratioLeft = this.pixelBoundsCache.left + this.pixelBoundsCache.width * ratio;

    this.editPreviewPath_
        .clear()
        .moveTo(ratioLeft, bounds.top)
        .lineTo(mouseLeft, bounds.top)
        .lineTo(mouseLeft, bounds.top + bounds.height)
        .lineTo(ratioLeft, bounds.top + bounds.height)
        .close();
  }
};


/**
 * Draws connector preview.
 * @param {goog.fx.DragEvent} event - Event.
 * @param {number=} opt_scrollOffsetX - Negative value means scrolling left, otherwise is scrolling right. Zero is not a scrolling.
 * @param {number=} opt_scrollOffsetY - Negative value means scrolling left, otherwise is scrolling right. Zero is not a scrolling.
 * @private
 */
anychart.core.ui.Timeline.prototype.drawConnectorPreview_ = function(event, opt_scrollOffsetX, opt_scrollOffsetY) {
  if (this.currentConnectorDragger_) {
    var circle = this.currentConnectorDragger_.isStart ? this.editStartConnectorPath_ : this.editFinishConnectorPath_;

    var index = circle.index;
    var period = circle.period;

    var containerLeft = goog.style.getClientPosition(/** @type {Element} */(this.container().getStage().container())).x;
    var containerTop = goog.style.getClientPosition(/** @type {Element} */(this.container().getStage().container())).y;

    var mouseLeft, mouseTop;

    if (opt_scrollOffsetX || opt_scrollOffsetY) { //Whether we draw it all on scolling when mouse is actually not moving.
      mouseLeft = this.currentConnectorDragger_.lastTrackedMouseX - containerLeft;
      mouseTop = this.currentConnectorDragger_.lastTrackedMouseY - containerTop;
    } else {
      mouseLeft = event.clientX - containerLeft;
      mouseTop = event.clientY - containerTop;
    }

    var initItemsBounds = this.getItemBounds_(index, period);

    var previewThickness = anychart.utils.extractThickness(this.connectorPreviewStroke_);
    var pixelShift = (previewThickness % 2 && acgraph.type() === acgraph.StageType.SVG) ? 0.5 : 0;

    var startLeft = this.currentConnectorDragger_.isStart ? initItemsBounds.left : initItemsBounds.left + initItemsBounds.width;
    var startTop = initItemsBounds.top + initItemsBounds.height / 2 + pixelShift;

    this.getEditConnectorPreviewPath_()
        .clear()
        .moveTo(startLeft, startTop)
        .lineTo(mouseLeft, mouseTop);
  }
};


/**
 * Edit thumb drag handler.
 * @param {goog.fx.DragEvent} e - Event.
 * @private
 */
anychart.core.ui.Timeline.prototype.editThumbDrag_ = function(e) {
  this.dragging = true;
  this.interactive = false;
  this.currentThumbDragger_ = /** @type {anychart.core.ui.Timeline.ThumbDragger} */ (e.target);
  this.drawThumbPreview_(e);
};


/**
 * Edit thumb drag end handler.
 * @param {goog.fx.DragEvent} e - Event.
 * @private
 */
anychart.core.ui.Timeline.prototype.editThumbDragEnd_ = function(e) {
  if (this.dragging) {
    if (this.scrollDragger) this.scrollDragger.setEnabled(true);
    this.tooltip().enabled(true);
    var dragPreviewBounds = this.editPreviewPath_.getBounds();

    this.clearEdit_();

    var dragger = e.target;
    var el = dragger.element;
    var dataItem = el.item;
    var periodIndex = el.periodIndex;
    var tree = dataItem.tree();

    tree.suspendSignalsDispatching();

    var left = dragPreviewBounds.left;
    var right = dragPreviewBounds.left + dragPreviewBounds.width;
    var leftRatio = (left - this.pixelBoundsCache.left) / this.pixelBoundsCache.width;
    var rightRatio = (right - this.pixelBoundsCache.left) / this.pixelBoundsCache.width;
    var newStart = this.scale_.ratioToTimestamp(leftRatio);
    var newEnd = this.scale_.ratioToTimestamp(rightRatio);

    if (!isNaN(newStart) && !isNaN(newEnd)) {
      switch (el.type) {
        case anychart.enums.TLElementTypes.PERIOD:
          dataItem.set(anychart.enums.GanttDataFields.PERIODS, periodIndex, anychart.enums.GanttDataFields.START, newStart);
          dataItem.set(anychart.enums.GanttDataFields.PERIODS, periodIndex, anychart.enums.GanttDataFields.END, newEnd);
          break;
        case anychart.enums.TLElementTypes.BASELINE:
          dataItem.set(anychart.enums.GanttDataFields.BASELINE_START, newStart);
          dataItem.set(anychart.enums.GanttDataFields.BASELINE_END, newEnd);
          break;
        default:
          dataItem.set(anychart.enums.GanttDataFields.ACTUAL_START, newStart);
          dataItem.set(anychart.enums.GanttDataFields.ACTUAL_END, newEnd);
      }
    }

    tree.resumeSignalsDispatching(true);
    this.initScale_();

    this.currentThumbDragger_ = null;
    this.dragging = false;
    clearInterval(this.scrollInterval);
    this.scrollInterval = null;
  }

  goog.style.setStyle(goog.global['document']['body'], 'cursor', '');
  this.editPreviewPath_.cursor(acgraph.vector.Cursor.EW_RESIZE);
};


/**
 * @param {goog.fx.DragEvent} e - Event.
 * @private
 */
anychart.core.ui.Timeline.prototype.editConnectorDragStart_ = function(e) {
  if (this.scrollDragger) this.scrollDragger.setEnabled(false);
  this.tooltip().hide().enabled(false);
  this.interactivityHandler.highlight();
  this.currentConnectorDragger_ = /** @type {anychart.core.ui.Timeline.ConnectorDragger} */ (e.target);
  this.clearEdit_();
};


/**
 * @param {goog.fx.DragEvent} e - Event.
 * @private
 */
anychart.core.ui.Timeline.prototype.editConnectorDrag_ = function(e) {
  this.dragging = true;
  this.draggingConnector = true;
  this.interactive = false;
  this.currentConnectorDragger_.lastTrackedMouseX = e.clientX;
  this.currentConnectorDragger_.lastTrackedMouseY = e.clientY;
};


/**
 * @param {goog.fx.DragEvent} e - Event.
 * @private
 */
anychart.core.ui.Timeline.prototype.editConnectorDragEnd_ = function(e) {
  if (this.dragging) {
    if (this.scrollDragger) this.scrollDragger.setEnabled(true);
    this.tooltip().enabled(true);
    this.getEditConnectorPreviewPath_().clear();
    this.dragging = false;
    clearInterval(this.scrollInterval);
    this.scrollInterval = null;
  }
  //Moved nulling of this.currentConnectorDragger_ to additional mouse up actions (see addMouseUp() method).
};


/**
 * @inheritDoc
 */
anychart.core.ui.Timeline.prototype.addMouseMoveAndOver = function(evt) {
  if (this.editable && evt) {
    var el;
    if (evt['originalEvent']['domTarget'] && evt['originalEvent']['domTarget'] instanceof anychart.core.ui.BaseGrid.Element) {
      el = /** @type {anychart.core.ui.BaseGrid.Element} */ (evt['originalEvent']['domTarget']);
      var dataItem = evt['item'];
      var period = evt['period'];
      var periodIndex = evt['periodIndex'];

      if (el.currBounds && !this.dragging) {
        var b = el.currBounds;

        this.getEditPreviewPath_()
            .clear()
            .moveTo(b.left, b.top)
            .lineTo(b.left + b.width, b.top)
            .lineTo(b.left + b.width, b.top + b.height)
            .lineTo(b.left, b.top + b.height)
            .close();

        this.editPreviewPath_.item = dataItem;
        this.editPreviewPath_.type = el.type;

        if (period) this.editPreviewPath_.period = period;

        if (goog.isDef(periodIndex)) this.editPreviewPath_.periodIndex = periodIndex;

        // ------ Drawing progress ------
        if (dataItem && (el.type == anychart.enums.TLElementTypes.BASE || el.type == anychart.enums.TLElementTypes.PARENT ||
            el.type == anychart.enums.TLElementTypes.PROGRESS)) {
          var progressValue = goog.isDef(dataItem.get(anychart.enums.GanttDataFields.PROGRESS_VALUE)) ?
              (parseFloat(dataItem.get(anychart.enums.GanttDataFields.PROGRESS_VALUE)) / 100) :
              anychart.math.round(/** @type {number} */ (dataItem.meta('autoProgress')), 2);

          progressValue = progressValue || 0;
          var progressLeft = b.left + progressValue * b.width;
          var top = b.top + b.height;

          this.getEditProgressPath_()
              .clear()
              .moveTo(progressLeft, top - anychart.core.ui.Timeline.EDIT_CORNER_HEIGHT)
              .lineTo(progressLeft + anychart.core.ui.Timeline.EDIT_CORNER_HEIGHT, top)
              .lineTo(progressLeft + anychart.core.ui.Timeline.EDIT_CORNER_HEIGHT, top + anychart.core.ui.Timeline.EDIT_CORNER_HEIGHT)
              .lineTo(progressLeft - anychart.core.ui.Timeline.EDIT_CORNER_HEIGHT, top + anychart.core.ui.Timeline.EDIT_CORNER_HEIGHT)
              .lineTo(progressLeft - anychart.core.ui.Timeline.EDIT_CORNER_HEIGHT, top)
              .close();

          this.editProgressPath_.bounds = b;
          this.editProgressPath_.item = dataItem;

        } else {
          this.getEditProgressPath_().clear();
        }

        var right = b.left + b.width;

        // ------ Drawing any resizeable bar ------
        if (dataItem && el.type != anychart.enums.TLElementTypes.MILESTONE) {
          this.getEditRightThumbPath_()
              .clear()
              .moveTo(right + 1, b.top)
              .lineTo(right + 1 - anychart.core.ui.Timeline.EDIT_INTERVAL_WIDTH, b.top)
              .lineTo(right + 1 - anychart.core.ui.Timeline.EDIT_INTERVAL_WIDTH, b.top + b.height)
              .lineTo(right + 1, b.top + b.height)
              .close();

          this.getEditLeftThumbPath_()
              .clear()
              .moveTo(b.left - 1, b.top)
              .lineTo(b.left - 1 + anychart.core.ui.Timeline.EDIT_INTERVAL_WIDTH, b.top)
              .lineTo(b.left - 1 + anychart.core.ui.Timeline.EDIT_INTERVAL_WIDTH, b.top + b.height)
              .lineTo(b.left - 1, b.top + b.height)
              .close();

          this.editRightThumbPath_.bounds = b;
          this.editRightThumbPath_.item = dataItem;
          this.editRightThumbPath_.type = el.type;
          this.editLeftThumbPath_.bounds = b;
          this.editLeftThumbPath_.item = dataItem;
          this.editLeftThumbPath_.type = el.type;

          if (period) {
            this.editRightThumbPath_.period = period;
            this.editLeftThumbPath_.period = period;
          }

          if (goog.isDef(periodIndex)) {
            this.editRightThumbPath_.periodIndex = periodIndex;
            this.editLeftThumbPath_.periodIndex = periodIndex;
          }

        } else {
          this.getEditLeftThumbPath_().clear();
          this.getEditRightThumbPath_().clear();
        }

        if (dataItem && el.type != anychart.enums.TLElementTypes.BASELINE) {
          var rTop = b.top + b.height / 2;
          this.getEditFinishConnectorPath_()
              .drawAsCircle(right + anychart.core.ui.Timeline.EDIT_CONNECTOR_RADIUS, rTop, anychart.core.ui.Timeline.EDIT_CONNECTOR_RADIUS);

          this.getEditStartConnectorPath_()
              .drawAsCircle(b.left - anychart.core.ui.Timeline.EDIT_CONNECTOR_RADIUS, rTop, anychart.core.ui.Timeline.EDIT_CONNECTOR_RADIUS);

          this.editFinishConnectorPath_.item = dataItem;
          this.editFinishConnectorPath_.type = el.type;
          this.editFinishConnectorPath_.index = evt['hoveredIndex'] + this.controller.startIndex();
          this.editStartConnectorPath_.item = dataItem;
          this.editStartConnectorPath_.type = el.type;
          this.editStartConnectorPath_.index = evt['hoveredIndex'] + this.controller.startIndex();

          if (period) {
            this.editStartConnectorPath_.period = period;
            this.editFinishConnectorPath_.period = period;
          }

          if (goog.isDef(periodIndex)) {
            this.editStartConnectorPath_.periodIndex = periodIndex;
            this.editFinishConnectorPath_.periodIndex = periodIndex;
          }
        } else {
          this.getEditFinishConnectorPath_().clear();
          this.getEditStartConnectorPath_().clear();
        }
      } else if (this.draggingConnector && dataItem) {//dataItem here is destination item.
        var path = this.currentConnectorDragger_.isStart ? this.editStartConnectorPath_ : this.editFinishConnectorPath_;

        var startItem = path.item;
        var startIndex = path.index;

        if (el.type != anychart.enums.TLElementTypes.BASELINE &&
            el.type != anychart.enums.TLElementTypes.CONNECTOR) {

          var from, to;

          if (period) {
            var startPeriod = path.period;
            var startPeriodIndex = path.periodIndex;
            from = {'period': startPeriod, 'index': startIndex, 'periodIndex': startPeriodIndex};
            to = {
              'period': period,
              'index': evt['hoveredIndex'] + this.controller.startIndex(),
              'periodIndex': periodIndex
            };
          } else {
            from = {'item': startItem, 'index': startIndex};
            to = {'item': dataItem, 'index': evt['hoveredIndex'] + this.controller.startIndex()};
          }

          var originalEvent = evt['originalEvent'];
          var left = originalEvent.clientX - goog.style.getClientPosition(/** @type {Element} */(this.container().getStage().container())).x;
          var elBounds = el.currBounds;
          var dropRatio = (left - elBounds.left) / elBounds.width;
          var startStart = this.currentConnectorDragger_.isStart;
          var dropStart = dropRatio < .5;
          var connType;
          if (startStart) {
            connType = dropStart ? anychart.enums.ConnectorType.START_START : anychart.enums.ConnectorType.START_FINISH;
          } else {
            connType = dropStart ? anychart.enums.ConnectorType.FINISH_START : anychart.enums.ConnectorType.FINISH_FINISH;
          }


          this.getEditConnectorPreviewPath_().clear();
          this.connectItems_(from, to, connType, void 0, this.editConnectorPreviewPath_);
        } else {
          this.drawConnectorPreview_(evt['originalEvent']);
        }
      }
    } else if (evt['originalEvent']['domTarget'] != this.getEditPreviewPath_() &&
        evt['originalEvent']['domTarget'] != this.getEditProgressPath_() &&
        evt['originalEvent']['domTarget'] != this.getEditRightThumbPath_() &&
        evt['originalEvent']['domTarget'] != this.getEditLeftThumbPath_() &&
        evt['originalEvent']['domTarget'] != this.getEditFinishConnectorPath_() &&
        evt['originalEvent']['domTarget'] != this.getEditStartConnectorPath_() && !this.dragging) {
      this.clearEdit_();
    } else if (this.draggingConnector) {
      this.drawConnectorPreview_(evt['originalEvent']);
    }
  }

};


/** @inheritDoc */
anychart.core.ui.Timeline.prototype.rowMouseDown = function(evt) {
  this.mouseDown(evt);
};


/**
 * Actually reacts on mouse down.
 * @param {Object} evt - Event object.
 */
anychart.core.ui.Timeline.prototype.mouseDown = function(evt) {
  if (this.editable) this.draggingItem = evt['item'];
};


/**
 * Creates connector.
 * If connector with same parameters already exists, nothing will happen.
 * If connector's data is incorrect, nothing will happen.
 * TODO (A.Kudryavtsev): Do we need to export this method?
 * @param {anychart.data.Tree.DataItem|number|string} startItem - Start data item or its ID.
 * @param {anychart.data.Tree.DataItem|number|string} targetItem - Destination data item or its ID.
 * @param {anychart.enums.ConnectorType=} opt_type - Connection type. anychart.enums.ConnectorType.FINISH_START is default.
 * @param {number=} opt_startPeriodIndex - Index of start period.
 * @param {number=} opt_targetPeriodIndex - Index of destination period.
 * TODO (A.Kudryavtsev): Add connector coloring settings?
 * @return {anychart.core.ui.Timeline} - Itself for method chaining.
 */
anychart.core.ui.Timeline.prototype.addConnector = function(startItem, targetItem, opt_type, opt_startPeriodIndex, opt_targetPeriodIndex) {
  opt_type = opt_type || anychart.enums.ConnectorType.FINISH_START;
  if (!(startItem instanceof anychart.data.Tree.DataItem)) {
    var soughtStart = this.controller.data().searchItems(anychart.enums.GanttDataFields.ID, /** @type {number|string} */ (startItem));
    startItem = soughtStart.length ? soughtStart[0] : null;
  }
  if (!startItem) return this; //TODO (A.Kudryavtsev): Add warning?

  if (!(targetItem instanceof anychart.data.Tree.DataItem)) {
    var soughtTarget = this.controller.data().searchItems(anychart.enums.GanttDataFields.ID, /** @type {number|string} */ (targetItem));
    targetItem = soughtTarget.length ? soughtTarget[0] : null;
  }
  if (!targetItem) return this; //TODO (A.Kudryavtsev): Add warning?

  var to = anychart.enums.GanttDataFields.CONNECT_TO;
  var connType = anychart.enums.GanttDataFields.CONNECTOR_TYPE;

  //TODO (A.Kudryavtsev): Add checking of existing connector.
  this.controller.data().suspendSignalsDispatching();

  var conn, connectTo, connectorToBeAdded, connLength, oldConnector, oldConnectorVisualSettings, connEvent;
  var renewConnectorData = false;

  if (this.controller.isResources()) {
    var startPeriod = startItem.get(anychart.enums.GanttDataFields.PERIODS)[opt_startPeriodIndex];
    var targetPeriod = targetItem.get(anychart.enums.GanttDataFields.PERIODS)[opt_targetPeriodIndex];

    if (goog.isDef(startPeriod) && goog.isDef(targetPeriod)) {
      conn = startPeriod[anychart.enums.GanttDataFields.CONNECTOR];
      connectorToBeAdded = {};
      connectorToBeAdded[to] = targetPeriod[anychart.enums.GanttDataFields.ID];
      connectorToBeAdded[connType] = opt_type;
      if (conn) {
        if (goog.isArray(conn)) { //New behaviour.
          connLength = conn.length;
        } else { //Deprecated behaviour.
          oldConnectorVisualSettings = goog.object.clone(conn);
          oldConnector = {};
          oldConnector[to] = startPeriod[anychart.enums.GanttDataFields.CONNECT_TO];
          oldConnector[connType] = startPeriod[anychart.enums.GanttDataFields.CONNECTOR_TYPE] || anychart.enums.ConnectorType.FINISH_START;
          goog.object.extend(oldConnector, oldConnectorVisualSettings);
          connLength = 1;
          renewConnectorData = true;
        }
      } else {
        connectTo = startPeriod[anychart.enums.GanttDataFields.CONNECT_TO];
        if (goog.isDef(connectTo)) { //Deprecated behaviour.
          oldConnector = {};
          oldConnector[to] = connectTo;
          oldConnector[connType] = startPeriod[anychart.enums.GanttDataFields.CONNECTOR_TYPE] || anychart.enums.ConnectorType.FINISH_START;
          connLength = 1;
          renewConnectorData = true;
        } else { //New behaviour.
          connLength = 0;
        }
      }

      connEvent = {
        'type': anychart.enums.EventType.BEFORE_CREATE_CONNECTOR,
        'target': targetItem,
        'source': startItem,
        'connectorType': opt_type,
        'targetPeriod': targetPeriod,
        'targetPeriodIndex': opt_targetPeriodIndex,
        'sourcePeriod': startPeriod,
        'sourcePeriodIndex': opt_startPeriodIndex
      };

      if (this.interactivityHandler.dispatchEvent(connEvent)) {
        if (renewConnectorData) {
          startItem.set(anychart.enums.GanttDataFields.PERIODS, opt_startPeriodIndex,
              anychart.enums.GanttDataFields.CONNECTOR, [oldConnector]);
        }
        startItem.set(anychart.enums.GanttDataFields.PERIODS, opt_startPeriodIndex,
            anychart.enums.GanttDataFields.CONNECTOR, connLength, connectorToBeAdded);
      }


    } //TODO (A.Kudryavtsev): Do we need to add some warning here?
  } else {
    conn = startItem.get(anychart.enums.GanttDataFields.CONNECTOR);
    connectorToBeAdded = {};
    connectorToBeAdded[to] = targetItem.get(anychart.enums.GanttDataFields.ID);
    connectorToBeAdded[connType] = opt_type;
    if (conn) {
      if (goog.isArray(conn)) { //New behaviour.
        connLength = conn.length;
      } else { //Deprecated behaviour.
        oldConnectorVisualSettings = goog.object.clone(/** @type {Object} */(conn));
        oldConnector = {};
        oldConnector[to] = startItem.get(anychart.enums.GanttDataFields.CONNECT_TO);
        oldConnector[connType] = startItem.get(anychart.enums.GanttDataFields.CONNECTOR_TYPE) || anychart.enums.ConnectorType.FINISH_START;
        goog.object.extend(oldConnector, oldConnectorVisualSettings);
        connLength = 1;
        renewConnectorData = true;
      }
    } else {
      connectTo = startItem.get(anychart.enums.GanttDataFields.CONNECT_TO);
      if (goog.isDef(connectTo)) { //Deprecated behaviour.
        oldConnector = {};
        oldConnector[to] = connectTo;
        oldConnector[connType] = startItem.get(anychart.enums.GanttDataFields.CONNECTOR_TYPE) || anychart.enums.ConnectorType.FINISH_START;
        connLength = 1;
        renewConnectorData = true;
      } else { //New behaviour.
        connLength = 0;
      }
    }

    connEvent = {
      'type': anychart.enums.EventType.BEFORE_CREATE_CONNECTOR,
      'target': targetItem,
      'source': startItem,
      'connectorType': opt_type
    };

    if (this.interactivityHandler.dispatchEvent(connEvent)) {
      if (renewConnectorData) {
        startItem.set(anychart.enums.GanttDataFields.CONNECTOR, [oldConnector]);
      }
      startItem.set(anychart.enums.GanttDataFields.CONNECTOR, connLength, connectorToBeAdded);
    }
  }

  this.controller.data().resumeSignalsDispatching(true);

  return this;
};


/**
 * @inheritDoc
 */
anychart.core.ui.Timeline.prototype.addMouseUp = function(evt) {
  if (this.editable && this.draggingConnector) {
    var destinationItem = evt['item'];
    var destinationPeriodIndex = evt['periodIndex'];
    var originalEvent = evt['originalEvent'];
    var domTarget = originalEvent['domTarget'];
    if (domTarget instanceof anychart.core.ui.BaseGrid.Element && domTarget.type != anychart.enums.TLElementTypes.BASELINE) {
      var left = originalEvent.clientX - goog.style.getClientPosition(/** @type {Element} */(this.container().getStage().container())).x;
      var elBounds = domTarget.currBounds;
      var dropRatio = (left - elBounds.left) / elBounds.width;

      var circle = this.currentConnectorDragger_.isStart ? this.editStartConnectorPath_ : this.editFinishConnectorPath_;

      var startItem = circle.item;
      var startPeriodIndex = circle.periodIndex;

      var startStart = this.currentConnectorDragger_.isStart;
      var dropStart = dropRatio < .5;
      var connType;
      if (startStart) {
        connType = dropStart ? anychart.enums.ConnectorType.START_START : anychart.enums.ConnectorType.START_FINISH;
      } else {
        connType = dropStart ? anychart.enums.ConnectorType.FINISH_START : anychart.enums.ConnectorType.FINISH_FINISH;
      }

      this.addConnector(startItem, destinationItem, connType, startPeriodIndex, destinationPeriodIndex);
    }
    this.draggingConnector = false;
  }
  this.currentConnectorDragger_ = null;
};


/** @inheritDoc */
anychart.core.ui.Timeline.prototype.mouseOutMove = function(e) {
  if (this.dragging && !this.draggingProgress && (this.scrollOffsetX || this.scrollOffsetY)) {
    var scrollX = 0;
    var scrollY = 0;
    if (this.scrollOffsetX)
      scrollX = this.scrollOffsetX > 0 ? anychart.core.ui.BaseGrid.SCROLL_STEP : -anychart.core.ui.BaseGrid.SCROLL_STEP;

    if (this.draggingConnector && this.scrollOffsetY) {
      scrollY = this.scrollOffsetY > 0 ? anychart.core.ui.BaseGrid.SCROLL_STEP : -anychart.core.ui.BaseGrid.SCROLL_STEP;
    }

    this.scroll(scrollX, scrollY, true);
    this.drawThumbPreview_(/** @type {goog.fx.DragEvent} */ (e), this.scrollOffsetX);
    this.drawConnectorPreview_(/** @type {goog.fx.DragEvent} */ (e), this.scrollOffsetX, this.scrollOffsetY);
  }
};


/**
 * Handles row selection.
 * @param {Object} event - Dispatched event object.
 * @override
 */
anychart.core.ui.Timeline.prototype.rowSelect = function(event) {
  var item = event['item'];
  var period = event['period'];
  var periodId = period ? period[anychart.enums.GanttDataFields.ID] : void 0;

  if (this.selectTimelineRow(item, periodId)) {
    var eventObj = goog.object.clone(event);
    eventObj['type'] = anychart.enums.EventType.ROW_SELECT;
    (/** @type {anychart.core.ui.IInteractiveGrid} */ (this.interactivityHandler)).dispatchEvent(eventObj);
  }
};


/**
 * @inheritDoc
 */
anychart.core.ui.Timeline.prototype.rowUnselect = function(event) {
  if (this.selectedItem || goog.isDefAndNotNull(this.selectedPeriodId_)) {
    this.selectedPeriodId_ = void 0;
    goog.base(this, 'rowUnselect', event);
  }
};


/**
 * @inheritDoc
 */
anychart.core.ui.Timeline.prototype.getInteractivityEvent = function(event) {
  var evt = goog.base(this, 'getInteractivityEvent', event);
  var target = (evt && evt['originalEvent']) ? evt['originalEvent']['domTarget'] : null;

  if (evt && target && this.controller.isResources()) {
    if (goog.isObject(target.period) && goog.isDef(target.periodIndex)) { //Usually this is Live Edit case.
      evt['period'] = target.period;
      evt['periodIndex'] = target.periodIndex;
    } else { //Otherwise.
      var id = target.tag;
      if (goog.isDefAndNotNull(target.tag)) {
        var periodData = this.controller.getPeriodsMap()[id];
        if (periodData) {
          evt['period'] = periodData['period'];
          evt['periodIndex'] = periodData['periodIndex'];
        }
      }
    }
  }
  return evt;
};


/**
 * Selects row and/or period.
 * @param {anychart.data.Tree.DataItem} item - New selected data item.
 * @param {string=} opt_periodId - Id of period to be selected.
 * @return {boolean} - Whether has been selected.
 */
anychart.core.ui.Timeline.prototype.selectTimelineRow = function(item, opt_periodId) {
  var itemSelected = false;
  var periodSelected = false;

  if (item && item != this.selectedItem) {
    item.tree().suspendSignalsDispatching();
    item.meta('selected', true);
    if (this.selectedItem) this.selectedItem.meta('selected', false); //selectedItem has the same tree as item.
    this.selectedItem = item;
    item.tree().resumeSignalsDispatching(false);
    itemSelected = true;
  }

  if (this.selectedPeriodId_ !== opt_periodId) {
    this.selectedPeriodId_ = opt_periodId;
    periodSelected = true;
  }

  if (itemSelected || periodSelected) {
    this.invalidate(anychart.ConsistencyState.BASE_GRID_CLICK, anychart.Signal.NEEDS_REDRAW);
    return true;
  }
  return false;
};


/**
 * Inner labels factory getter.
 * @return {anychart.core.ui.LabelsFactory}
 * @private
 */
anychart.core.ui.Timeline.prototype.getLabelsFactory_ = function() {
  if (!this.labelsFactory_) {
    this.labelsFactory_ = new anychart.core.ui.LabelsFactory();
    this.labelsFactory_
        .zIndex(anychart.core.ui.Timeline.LABEL_Z_INDEX)
        .anchor(anychart.enums.Anchor.LEFT_CENTER)
        .position(anychart.enums.Position.RIGHT_CENTER)
        .padding(3, anychart.core.ui.Timeline.ARROW_MARGIN);

    this.labelsFactory_.setParentEventTarget(this);

  }
  return this.labelsFactory_;
};


/**
 * Inner getter for markers factory.
 * @return {anychart.core.ui.MarkersFactory}
 * @private
 */
anychart.core.ui.Timeline.prototype.getMarkersFactory_ = function() {
  if (!this.markersFactory_) {
    this.markersFactory_ = new anychart.core.ui.MarkersFactory();
    this.markersFactory_
        .anchor(anychart.enums.Anchor.CENTER_TOP)
        .zIndex(anychart.core.ui.Timeline.MARKER_Z_INDEX)
        .enabled(true)
        .type(anychart.enums.MarkerType.STAR4);

    this.markersFactory_.setParentEventTarget(this);
  }
  return this.markersFactory_;
};


/**
 * Draws timeline bars.
 * @private
 */
anychart.core.ui.Timeline.prototype.drawTimelineElements_ = function() {
  this.getDrawLayer().clear();
  this.getLabelsFactory_().clear();
  this.getMarkersFactory_().clear();

  if (this.controller.isResources()) {
    this.drawResourceTimeline_();
  } else {
    this.drawProjectTimeline_();
  }

  this.getLabelsFactory_().draw();
  this.getMarkersFactory_().draw();

  this.drawConnectors_();
};


/**
 * Draws a single bar with its markers and labels.
 * @param {anychart.math.Rect} bounds - Bounds of bar.
 * @param {(anychart.data.Tree.DataItem|Object)} item - Related tree data item or raw object.
 * @param {anychart.enums.TLElementTypes} type - Type of bar.
 * @param {anychart.enums.GanttDataFields=} opt_field - Field that contains a setting for fill, stroke, labels and markers.
 * @return {!acgraph.vector.Element} - Bar itself.
 * @private
 */
anychart.core.ui.Timeline.prototype.drawBar_ = function(bounds, item, type, opt_field) {
  var isTreeDataItem = item instanceof anychart.data.Tree.DataItem; //If item is tree data item. Else: item is period (raw object).

  var settings; //It is always a raw object.
  if (opt_field) {
    settings = isTreeDataItem ? item.get(opt_field) : item[opt_field];
  } else {
    /*
      Here field is not specified.
      It means that if it is an instance of tree data item, we color a bar with default color.
      If it is not tree data item (it is period - actually a raw object), it contains all visual settings in itself.
      TODO (A.Kudryavtsev): Bad english.
     */
    settings = isTreeDataItem ? null : item;
  }

  var isBaseline = false;
  var isActualBaseline = false;
  var isParent = false;
  var isProgress = false;
  var selectedBar = isTreeDataItem ?
      (this.selectedItem == item) :
      (this.selectedPeriodId_ == item[anychart.enums.GanttDataFields.ID]);


  var zIndex, defaultFill, defaultStroke;

  switch (opt_field) {
    case anychart.enums.GanttDataFields.BASELINE:
      zIndex = anychart.core.ui.Timeline.BASELINE_Z_INDEX;
      defaultFill = this.baselineFill_;
      defaultStroke = this.baselineStroke_;
      isBaseline = true;
      break;
    case anychart.enums.GanttDataFields.PROGRESS:
      zIndex = anychart.core.ui.Timeline.PROGRESS_Z_INDEX;
      defaultFill = this.progressFill_;
      defaultStroke = this.progressStroke_;
      isProgress = true;
      break;
    default:
      zIndex = anychart.core.ui.Timeline.BASE_Z_INDEX;
      isParent = (isTreeDataItem && item.numChildren());
      //Milestone is not bar, so it doesn't use drawBar_ method.
      defaultFill = isParent ? this.parentFill_ : this.baseFill_;
      defaultStroke = isParent ? this.parentStroke_ : this.baseStroke_;

      //It is not in "case anychart.enums.GanttDataFields.BASELINE:"section because this flag is for label coloring.
      //Label belongs to "actual" bar, not to "baseline" bar.
      isActualBaseline = (isTreeDataItem && item.get(anychart.enums.GanttDataFields.BASELINE_START) && item.get(anychart.enums.GanttDataFields.BASELINE_END));
  }

  var stroke = /** @type {acgraph.vector.Stroke} */ (settings && goog.isDef(settings[anychart.enums.GanttDataFields.STROKE]) ?
      acgraph.vector.normalizeStroke(settings[anychart.enums.GanttDataFields.STROKE]) :
      defaultStroke);

  var rawLabel = settings ? settings[anychart.enums.GanttDataFields.LABEL] : void 0;
  var textValue;
  if (rawLabel && goog.isDef(rawLabel['value'])) {
    textValue = rawLabel['value'] + '';
  } else {
    textValue = (isTreeDataItem && !isProgress && !isBaseline) ?
        (item.get(anychart.enums.GanttDataFields.PROGRESS_VALUE) ||
        (anychart.math.round(/** @type {number} */ (item.meta('autoProgress')) * 100, 2)) + '%') :
        '';
  }

  if (textValue) {
    var position;

    if (rawLabel && rawLabel['position']) {
      position = rawLabel['position'];
    } else {
      position = this.getLabelsFactory_().position();
      if (isActualBaseline) {
        position = anychart.enums.Position.CENTER;
      } else if (isParent) {
        position = anychart.enums.Position.RIGHT_BOTTOM;
      }
    }

    position = anychart.enums.normalizeAnchor(position);
    var positionProvider = {'value': anychart.utils.getCoordinateByAnchor(bounds, position)};
    var formatProvider = {'value': textValue};
    var label = this.getLabelsFactory_().add(formatProvider, positionProvider);
    if (isActualBaseline) {
      label.fontColor('#fff');
      label.anchor(anychart.enums.Anchor.CENTER);
    }
    if (rawLabel) label.setup(rawLabel);
  }

  var bar = this.getDrawLayer().genNextChild();
  bar.tag = isTreeDataItem ? item.get(anychart.enums.GanttDataFields.ID) : item[anychart.enums.GanttDataFields.ID];
  bar.type = type;

  var lineThickness = anychart.utils.extractThickness(/** @type {acgraph.vector.Stroke} */ (stroke));

  var pixelShift = (lineThickness % 2 && acgraph.type() === acgraph.StageType.SVG) ? 0.5 : 0;

  var roundLeft = Math.round(bounds.left) + pixelShift;
  var roundTop = Math.round(bounds.top) + pixelShift;
  var roundRight = Math.round(bounds.left + bounds.width) + pixelShift;
  var roundHeight = Math.round(bounds.top + bounds.height) + pixelShift;
  bar.currBounds = new anychart.math.Rect(roundLeft, roundTop, roundRight - roundLeft, roundHeight - roundTop);

  bar
      .zIndex(zIndex)
      .moveTo(roundLeft, roundTop)
      .lineTo(roundRight, roundTop);

  if (isParent) {
    var roundHeight2 = (bounds.top + bounds.height * 1.4) + pixelShift;
    bar
        .lineTo(roundRight, roundHeight2)
        .lineTo(roundRight - 1, roundHeight2)
        .lineTo(roundRight - 1, roundHeight)
        .lineTo(roundLeft + 1, roundHeight)
        .lineTo(roundLeft + 1, roundHeight2)
        .lineTo(roundLeft, roundHeight2);
  } else {
    bar
        .lineTo(roundRight, roundHeight)
        .lineTo(roundLeft, roundHeight);
  }
  bar.close();

  if (settings) {
    var rawStartMarker = settings[anychart.enums.GanttDataFields.START_MARKER];
    if (rawStartMarker) {
      var startMarker = this.getMarkersFactory_().add({value: {x: bounds.left, y: bounds.top}});
      startMarker
          .size(bounds.height / 2)
          .setup(rawStartMarker);
    }

    var rawEndMarker = settings[anychart.enums.GanttDataFields.END_MARKER];
    if (rawEndMarker) {
      var endMarker = this.getMarkersFactory_().add({value: {x: bounds.left + bounds.width, y: bounds.top}});
      endMarker
          .size(bounds.height / 2)
          .setup(rawEndMarker);
    }

    var fill;
    if (selectedBar) {
      fill = this.selectedElementFill_;
      stroke = this.selectedElementStroke_;
    } else {
      fill = goog.isDef(settings[anychart.enums.GanttDataFields.FILL]) ?
          acgraph.vector.normalizeFill(settings[anychart.enums.GanttDataFields.FILL]) :
          defaultFill;
    }

    bar.fill(fill).stroke(stroke);
  } else { //Default coloring.
    bar
        .fill(selectedBar ? this.selectedElementFill_ : defaultFill)
        .stroke(selectedBar ? this.selectedElementStroke_ : defaultStroke);
  }

  return bar;
};


/**
 * Internal resource timeline drawer.
 * @private
 */
anychart.core.ui.Timeline.prototype.drawResourceTimeline_ = function() {
  var totalTop = /** @type {number} */ (this.pixelBoundsCache.top + this.headerHeight() + 1 - this.controller.verticalOffset());
  var visibleItems = this.controller.getVisibleItems();
  for (var i = this.controller.startIndex(); i <= this.controller.endIndex(); i++) {
    var item = visibleItems[i];
    if (!item) break;

    var itemHeight = anychart.core.gantt.Controller.getItemHeight(item);
    var newTop = /** @type {number} */ (totalTop + itemHeight);

    this.drawAsPeriods_(item, totalTop, itemHeight);

    totalTop = (newTop + this.rowStrokeThickness);
  }
};


/**
 * Internal project timeline drawer.
 * @private
 */
anychart.core.ui.Timeline.prototype.drawProjectTimeline_ = function() {
  var totalTop = /** @type {number} */ (this.pixelBoundsCache.top + this.headerHeight() + 1 - this.controller.verticalOffset());
  var visibleItems = this.controller.getVisibleItems();

  for (var i = this.controller.startIndex(); i <= this.controller.endIndex(); i++) {
    var item = visibleItems[i];
    if (!item) break;

    var itemHeight = anychart.core.gantt.Controller.getItemHeight(item);
    var newTop = /** @type {number} */ (totalTop + itemHeight);

    var baselineStart = item.get(anychart.enums.GanttDataFields.BASELINE_START);
    var baselineEnd = item.get(anychart.enums.GanttDataFields.BASELINE_END);

    if (goog.isDef(baselineStart) && goog.isDef(baselineEnd)) {
      this.drawAsBaseline_(item, totalTop, itemHeight);
    } else {
      if (item.numChildren()) {
        this.drawAsParent_(item, totalTop, itemHeight);
      } else {
        if (anychart.core.ui.BaseGrid.isMilestone(item)) {
          this.drawAsMilestone_(item, totalTop, itemHeight);
        } else {
          this.drawAsProgress_(item, totalTop, itemHeight);
        }
      }
    }

    totalTop = (newTop + this.rowStrokeThickness);
  }
};


/**
 * Draws data item as periods.
 * @param {anychart.data.Tree.DataItem} dataItem - Current tree data item.
 * @param {number} totalTop - Pixel value of total top. Is needed to place item correctly.
 * @param {number} itemHeight - Height of row.
 * @private
 */
anychart.core.ui.Timeline.prototype.drawAsPeriods_ = function(dataItem, totalTop, itemHeight) {
  var periods = /** @type {Array.<Object>} */(dataItem.get(anychart.enums.GanttDataFields.PERIODS));
  if (periods) {
    for (var j = 0; j < periods.length; j++) {
      var period = periods[j];
      var start = anychart.utils.normalizeTimestamp(period[anychart.enums.GanttDataFields.START]);
      var end = anychart.utils.normalizeTimestamp(period[anychart.enums.GanttDataFields.END]);

      if (!isNaN(start) && !isNaN(end)) {
        var startRatio = this.scale_.timestampToRatio(start);
        var endRatio = this.scale_.timestampToRatio(end);

        if (endRatio > 0 && startRatio < 1) { //Is visible
          var left = this.pixelBoundsCache.left + this.pixelBoundsCache.width * startRatio;
          var right = this.pixelBoundsCache.left + this.pixelBoundsCache.width * endRatio;
          var height = itemHeight * anychart.core.ui.Timeline.DEFAULT_HEIGHT_REDUCTION;
          var top = totalTop + (itemHeight - height) / 2;
          this.drawBar_(new anychart.math.Rect(left, top, (right - left), height), period, anychart.enums.TLElementTypes.PERIOD);
        }
      }
    }
  }
};


/**
 * Draws data item as baseline.
 * @param {anychart.data.Tree.DataItem} dataItem - Current tree data item.
 * @param {number} totalTop - Pixel value of total top. Is needed to place item correctly.
 * @param {number} itemHeight - Height of row.
 * @private
 */
anychart.core.ui.Timeline.prototype.drawAsBaseline_ = function(dataItem, totalTop, itemHeight) {
  var actualStart = goog.isDef(dataItem.get(anychart.enums.GanttDataFields.ACTUAL_START)) ?
      anychart.utils.normalizeTimestamp(dataItem.get(anychart.enums.GanttDataFields.ACTUAL_START)) :
      dataItem.meta('autoStart');
  var actualEnd = goog.isDef(dataItem.get(anychart.enums.GanttDataFields.ACTUAL_END)) ?
      anychart.utils.normalizeTimestamp(dataItem.get(anychart.enums.GanttDataFields.ACTUAL_END)) :
      dataItem.meta('autoEnd');
  var baselineStart = anychart.utils.normalizeTimestamp(dataItem.get(anychart.enums.GanttDataFields.BASELINE_START));
  var baselineEnd = anychart.utils.normalizeTimestamp(dataItem.get(anychart.enums.GanttDataFields.BASELINE_END));

  var actualStartRatio = this.scale_.timestampToRatio(actualStart);
  var actualEndRatio = this.scale_.timestampToRatio(actualEnd);
  var baselineStartRatio = this.scale_.timestampToRatio(baselineStart);
  var baselineEndRatio = this.scale_.timestampToRatio(baselineEnd);

  if ((actualEndRatio > 0 && actualStartRatio < 1) || (baselineEndRatio > 0 && baselineStartRatio < 1)) {
    var b = this.pixelBoundsCache;
    var actualLeft = b.left + b.width * actualStartRatio;
    var actualRight = b.left + b.width * actualEndRatio;
    var actualTop = totalTop + itemHeight * (1 - anychart.core.ui.Timeline.DEFAULT_HEIGHT_REDUCTION) / 2;
    var actualHeight = itemHeight * anychart.core.ui.Timeline.DEFAULT_HEIGHT_REDUCTION / 2;

    var baselineLeft = b.left + b.width * baselineStartRatio;
    var baselineRight = b.left + b.width * baselineEndRatio;
    var baselineTop = actualTop + actualHeight;
    var baselineHeight = actualHeight;

    if (this.baselineAbove_) {
      var tmp = actualTop;
      actualTop = baselineTop;
      baselineTop = tmp;
    }

    var actualBounds = new anychart.math.Rect(actualLeft, actualTop, (actualRight - actualLeft), actualHeight);

    var actualBar = this.drawBar_(actualBounds, dataItem, anychart.enums.TLElementTypes.BASE, anychart.enums.GanttDataFields.ACTUAL);

    this.drawBar_(new anychart.math.Rect(baselineLeft, baselineTop, (baselineRight - baselineLeft), baselineHeight),
        dataItem, anychart.enums.TLElementTypes.BASELINE, anychart.enums.GanttDataFields.BASELINE);

    var progressHeight = actualHeight * anychart.core.ui.Timeline.PROGRESS_HEIGHT_REDUCTION;
    var progressTop = actualTop + (actualHeight - progressHeight) / 2;

    var progressValue = goog.isDef(dataItem.get(anychart.enums.GanttDataFields.PROGRESS_VALUE)) ?
        (parseFloat(dataItem.get(anychart.enums.GanttDataFields.PROGRESS_VALUE)) / 100) :
        anychart.math.round(/** @type {number} */ (dataItem.meta('autoProgress')), 2);

    if (progressValue) { //Draw progress.
      var progressWidth = progressValue * (actualRight - actualLeft);
      var progressBar = this.drawBar_(new anychart.math.Rect(actualLeft, progressTop, progressWidth, progressHeight), dataItem,
          anychart.enums.TLElementTypes.PROGRESS, anychart.enums.GanttDataFields.PROGRESS);
      progressBar.currBounds = actualBar.currBounds;
    }

  }

};


/**
 * Draws data item as parent.
 * @param {anychart.data.Tree.DataItem} dataItem - Current tree data item.
 * @param {number} totalTop - Pixel value of total top. Is needed to place item correctly.
 * @param {number} itemHeight - Height of row.
 * @private
 */
anychart.core.ui.Timeline.prototype.drawAsParent_ = function(dataItem, totalTop, itemHeight) {
  var actualStart = goog.isDef(dataItem.get(anychart.enums.GanttDataFields.ACTUAL_START)) ?
      anychart.utils.normalizeTimestamp(dataItem.get(anychart.enums.GanttDataFields.ACTUAL_START)) :
      dataItem.meta('autoStart');
  var actualEnd = goog.isDef(dataItem.get(anychart.enums.GanttDataFields.ACTUAL_END)) ?
      anychart.utils.normalizeTimestamp(dataItem.get(anychart.enums.GanttDataFields.ACTUAL_END)) :
      dataItem.meta('autoEnd');
  var startRatio = this.scale_.timestampToRatio(actualStart);
  var endRatio = this.scale_.timestampToRatio(actualEnd);

  if (endRatio > 0 && startRatio < 1) { //Is visible
    var left = this.pixelBoundsCache.left + this.pixelBoundsCache.width * startRatio;
    var right = this.pixelBoundsCache.left + this.pixelBoundsCache.width * endRatio;
    var top = totalTop + itemHeight * (1 - anychart.core.ui.Timeline.DEFAULT_HEIGHT_REDUCTION) / 2;
    var height = itemHeight * anychart.core.ui.Timeline.PARENT_HEIGHT_REDUCTION;

    var bounds = new anychart.math.Rect(left, top, (right - left), height);
    var actualBar = this.drawBar_(bounds, dataItem, anychart.enums.TLElementTypes.PARENT,
        anychart.enums.GanttDataFields.ACTUAL);

    var progressHeight = height * anychart.core.ui.Timeline.PROGRESS_HEIGHT_REDUCTION;
    var progressTop = top + (height - progressHeight) / 2;

    var progressValue = goog.isDef(dataItem.get(anychart.enums.GanttDataFields.PROGRESS_VALUE)) ?
        (parseFloat(dataItem.get(anychart.enums.GanttDataFields.PROGRESS_VALUE)) / 100) :
        anychart.math.round(/** @type {number} */ (dataItem.meta('autoProgress')), 2);

    if (progressValue) { //Draw progress.
      var progressWidth = progressValue * (right - left);
      var progressBar = this.drawBar_(new anychart.math.Rect(left, progressTop, progressWidth, progressHeight), dataItem, anychart.enums.TLElementTypes.PROGRESS,
          anychart.enums.GanttDataFields.PROGRESS);
      progressBar.currBounds = actualBar.currBounds;
    }

  }
};


/**
 * Draws data item as progress.
 * @param {anychart.data.Tree.DataItem} dataItem - Current tree data item.
 * @param {number} totalTop - Pixel value of total top. Is needed to place item correctly.
 * @param {number} itemHeight - Height of row.
 * @private
 */
anychart.core.ui.Timeline.prototype.drawAsProgress_ = function(dataItem, totalTop, itemHeight) {
  var actualStart = goog.isDef(dataItem.get(anychart.enums.GanttDataFields.ACTUAL_START)) ?
      anychart.utils.normalizeTimestamp(dataItem.get(anychart.enums.GanttDataFields.ACTUAL_START)) :
      dataItem.meta('autoStart');
  var actualEnd = goog.isDef(dataItem.get(anychart.enums.GanttDataFields.ACTUAL_END)) ?
      anychart.utils.normalizeTimestamp(dataItem.get(anychart.enums.GanttDataFields.ACTUAL_END)) :
      dataItem.meta('autoEnd');

  var startRatio = this.scale_.timestampToRatio(actualStart);
  var endRatio = this.scale_.timestampToRatio(actualEnd);

  if (endRatio > 0 && startRatio < 1) { //Is visible
    var left = this.pixelBoundsCache.left + this.pixelBoundsCache.width * startRatio;
    var right = this.pixelBoundsCache.left + this.pixelBoundsCache.width * endRatio;
    var height = itemHeight * anychart.core.ui.Timeline.DEFAULT_HEIGHT_REDUCTION;
    var top = totalTop + (itemHeight - height) / 2;

    var bounds = new anychart.math.Rect(left, top, (right - left), height);
    var actualBar = this.drawBar_(bounds, dataItem, anychart.enums.TLElementTypes.BASE,
        anychart.enums.GanttDataFields.ACTUAL);

    var progressHeight = height * anychart.core.ui.Timeline.PROGRESS_HEIGHT_REDUCTION;
    var progressTop = top + (height - progressHeight) / 2;
    var progressValue = parseFloat(dataItem.get(anychart.enums.GanttDataFields.PROGRESS_VALUE));

    if (progressValue) { //Draw progress.
      var progressWidth = progressValue * (right - left) / 100;
      var progressBar = this.drawBar_(new anychart.math.Rect(left, progressTop, progressWidth, progressHeight), dataItem, anychart.enums.TLElementTypes.PROGRESS,
          anychart.enums.GanttDataFields.PROGRESS);
      progressBar.currBounds = actualBar.currBounds;
    }

  }
};


/**
 * Draws data item as milestone.
 * @param {anychart.data.Tree.DataItem} dataItem - Current tree data item.
 * @param {number} totalTop - Pixel value of total top. Is needed to place item correctly.
 * @param {number} itemHeight - Height of row.
 * @private
 */
anychart.core.ui.Timeline.prototype.drawAsMilestone_ = function(dataItem, totalTop, itemHeight) {
  var actualStart = dataItem.get(anychart.enums.GanttDataFields.ACTUAL_START);
  var ratio = this.scale_.timestampToRatio(actualStart);
  if (ratio >= 0 && ratio <= 1) { //Is visible
    var settings = dataItem.get(anychart.enums.GanttDataFields.MILESTONE);

    var stroke = /** @type {acgraph.vector.Stroke} */ (settings && goog.isDef(settings[anychart.enums.GanttDataFields.STROKE]) ?
        acgraph.vector.normalizeStroke(settings[anychart.enums.GanttDataFields.STROKE]) :
        this.milestoneStroke_);

    var lineThickness = anychart.utils.isNone(stroke) ? 0 :
        goog.isString(stroke) ? 1 :
            stroke['thickness'] ? stroke['thickness'] : 1;

    var pixelShift = (lineThickness % 2 && acgraph.type() === acgraph.StageType.SVG) ? 0.5 : 0;


    var halfHeight = Math.round(itemHeight * anychart.core.ui.Timeline.DEFAULT_HEIGHT_REDUCTION / 2);
    var centerLeft = Math.round(this.pixelBoundsCache.left + this.pixelBoundsCache.width * ratio) + pixelShift;
    var centerTop = Math.round(totalTop + itemHeight / 2) + pixelShift;

    var milestone = this.getDrawLayer().genNextChild();
    milestone.tag = dataItem.get(anychart.enums.GanttDataFields.ID);
    milestone.type = anychart.enums.TLElementTypes.MILESTONE;

    var left = centerLeft - halfHeight;
    var top = centerTop - halfHeight;
    var right = centerLeft + halfHeight;
    var bottom = centerTop + halfHeight;
    var diagonal = halfHeight + halfHeight;
    milestone
        .zIndex(anychart.core.ui.Timeline.BASE_Z_INDEX)
        .moveTo(left, centerTop) //left corner
        .lineTo(centerLeft, top) //top corner
        .lineTo(right, centerTop) //right corner
        .lineTo(centerLeft, bottom) //bottom corner
        .close();

    var bounds = new anychart.math.Rect(left, top, diagonal, diagonal);
    milestone.currBounds = bounds;

    var rawLabel = settings ? settings[anychart.enums.GanttDataFields.LABEL] : void 0;
    var textValue;
    if (rawLabel && goog.isDef(rawLabel['value'])) {
      textValue = rawLabel['value'] + '';
    } else {
      textValue = dataItem.get(anychart.enums.GanttDataFields.NAME) || '';
    }

    if (textValue) {
      var position = (rawLabel && rawLabel['position']) ? rawLabel['position'] : this.getLabelsFactory_().position();
      position = anychart.enums.normalizeAnchor(position);
      var positionProvider = {'value': anychart.utils.getCoordinateByAnchor(bounds, position)};
      var formatProvider = {'value': textValue};
      var label = this.getLabelsFactory_().add(formatProvider, positionProvider);
      if (rawLabel) label.setup(rawLabel);
    }

    var isSelected = dataItem == this.selectedItem;

    if (settings) {
      var fill;
      if (isSelected) {
        fill = this.selectedElementFill_;
        stroke = this.selectedElementStroke_;

      } else {
        fill = goog.isDef(settings[anychart.enums.GanttDataFields.FILL]) ?
            acgraph.vector.normalizeFill(settings[anychart.enums.GanttDataFields.FILL]) :
            this.milestoneFill_;
      }

      milestone.fill(fill).stroke(stroke);
    } else {
      milestone
          .fill(isSelected ? this.selectedElementFill_ : this.milestoneFill_)
          .stroke(isSelected ? this.selectedElementStroke_ : this.milestoneStroke_);
    }

  }
};


/**
 * Calculates bounds of item in current scale and controller's state depending on item's type.
 *
 * @param {number} index - Linear index of item in controller's visible items. If is period, index
 *  is linear index of treeDataItem that period belongs to.
 * @param {Object=} opt_period - Period object. Required if chart is resources chart.

 * @return {?anychart.math.Rect} - Bounds in current scale's state or null if data object contains some wrong data.
 * @private
 */
anychart.core.ui.Timeline.prototype.getItemBounds_ = function(index, opt_period) {
  var totalTop = /** @type {number} */ (this.pixelBoundsCache.top + this.headerHeight() + 1);
  var heightCache = this.controller.getHeightCache();
  var startIndex = this.controller.startIndex();
  var visibleItems = this.controller.getVisibleItems();
  var verticalOffset = this.controller.verticalOffset();

  //relativeHeight in this case is height of rows hidden over the top line of visible area (this.pixelBoundsCache)
  var relativeHeight = startIndex ? heightCache[startIndex - 1] : 0;
  relativeHeight += verticalOffset;

  var item = visibleItems[index];

  //Lines below turn heights got from controller to Y-coordinates on screen.
  var relativeTop = index ? heightCache[index - 1] : 0;

  var actualTop = (relativeTop - relativeHeight) + totalTop;
  var rowHeight = anychart.core.gantt.Controller.getItemHeight(item);

  var actStart = goog.isDef(item.get(anychart.enums.GanttDataFields.ACTUAL_START)) ?
      anychart.utils.normalizeTimestamp(item.get(anychart.enums.GanttDataFields.ACTUAL_START)) :
      item.meta('autoStart');

  var actEnd = goog.isDef(item.get(anychart.enums.GanttDataFields.ACTUAL_END)) ?
      anychart.utils.normalizeTimestamp(item.get(anychart.enums.GanttDataFields.ACTUAL_END)) :
      item.meta('autoEnd');

  var startTimestamp = this.controller.isResources() ?
      anychart.utils.normalizeTimestamp(opt_period[anychart.enums.GanttDataFields.START]) :
      actStart;

  var endTimestamp = this.controller.isResources() ?
      anychart.utils.normalizeTimestamp(opt_period[anychart.enums.GanttDataFields.END]) :
      actEnd;

  var milestoneHalfWidth = 0;
  if (isNaN(endTimestamp) || startTimestamp == endTimestamp) {
    endTimestamp = startTimestamp;
    milestoneHalfWidth = rowHeight * anychart.core.ui.Timeline.DEFAULT_HEIGHT_REDUCTION / 2;
  }

  if (isNaN(endTimestamp) || isNaN(startTimestamp)) {
    return null;
  } else {
    var left = this.scale_.timestampToRatio(startTimestamp) * this.pixelBoundsCache.width +
        this.pixelBoundsCache.left - milestoneHalfWidth;
    var right = this.scale_.timestampToRatio(endTimestamp) * this.pixelBoundsCache.width +
        this.pixelBoundsCache.left + milestoneHalfWidth;


    if (!this.controller.isResources()) {
      if (item.get(anychart.enums.GanttDataFields.BASELINE_START) &&
          item.get(anychart.enums.GanttDataFields.BASELINE_END)) {
        rowHeight = this.baselineAbove_ ?
            (rowHeight * (2 + anychart.core.ui.Timeline.DEFAULT_HEIGHT_REDUCTION) / 2) :
            (rowHeight * (1 - anychart.core.ui.Timeline.DEFAULT_HEIGHT_REDUCTION / 2));
      } else if (item.numChildren()) {
        rowHeight = rowHeight * (1 - anychart.core.ui.Timeline.DEFAULT_HEIGHT_REDUCTION + anychart.core.ui.Timeline.PARENT_HEIGHT_REDUCTION);
      }
    }

    return new anychart.math.Rect(left, actualTop, (right - left), rowHeight);
  }
};


/**
 * Connects two bars.
 * @param {Object} from - Start map object. Contains item (or period) to be connected from and it's index.
 *    <code>
 *      {'item':item, 'index':index}
 *        or
 *      {'period':period, 'index':index}.
 *    </code>
 * @param {Object} to - Finish map object. Contains item (or period) to be connected from and it's index. Code is the same.
 * @param {anychart.enums.ConnectorType=} opt_connType - Connection type.
 * @param {Object=} opt_connSettings - Connector visual appearance settings.
 * @param {acgraph.vector.Path=} opt_path - Path to be used. If not set, it will be generated from typed layer.
 * @private
 */
anychart.core.ui.Timeline.prototype.connectItems_ = function(from, to, opt_connType, opt_connSettings, opt_path) {
  opt_connType = opt_connType || anychart.enums.ConnectorType.FINISH_START;

  //Here 'to' is {'item':period, 'index':index} or {'period':period, 'index':index}. 'from' is as well.
  var fromIndex = from['index'];
  var toIndex = to['index'];

  var fromBounds = this.getItemBounds_(fromIndex, from['period']);
  var toBounds = this.getItemBounds_(toIndex, to['period']);

  if (fromBounds && toBounds) {
    var fill, stroke;

    fill = (opt_connSettings && opt_connSettings[anychart.enums.GanttDataFields.FILL]) ?
        acgraph.vector.normalizeFill(opt_connSettings[anychart.enums.GanttDataFields.FILL]) :
        this.connectorFill_;

    stroke = (opt_connSettings && opt_connSettings[anychart.enums.GanttDataFields.STROKE]) ?
        acgraph.vector.normalizeStroke(opt_connSettings[anychart.enums.GanttDataFields.STROKE]) :
        this.connectorStroke_;

    this.drawConnector_(fromBounds, toBounds, opt_connType, /** @type {acgraph.vector.Fill} */ (fill),
        /** @type {acgraph.vector.Stroke} */ (stroke), opt_path);
  }
};


/**
 * Draws connectors.
 * @private
 */
anychart.core.ui.Timeline.prototype.drawConnectors_ = function() {
  var connectorsData = this.controller.getConnectorsData();

  var l = connectorsData.length;
  var connData;

  var map = this.controller.isResources() ? this.controller.getPeriodsMap() : this.controller.getVisibleItemsMap();

  while (l--) {
    connData = connectorsData[l];
    var to = connData['to'];
    if (!goog.isObject(to)) to = map[to]; //destination becomes an object instead of string.

    if (goog.isDef(to)) {
      connData['to'] = to; //Replacing a string record with link to object for further connectors draw cycles.

      this.connectItems_(connData['from'], to, connData['type'], connData['connSettings']);
    } else {
      /*
        Destination is not found. We don't need this connector record anymore.
        Destination can be not found in two cases:
          1) Wrong incoming data.
          2) Destination is currently hidden by collapsed parent.
       In both cases we do not need this connectors record at all.
      */
      goog.array.splice(connectorsData, l, 1);
    }
  }
};


/**
 * Draws a single connector.
 * @param {anychart.math.Rect} fromBounds - Bounds of start item (see illustration).
 * @param {anychart.math.Rect} toBounds - Bounds of end item (see illustration).
 * @param {anychart.enums.ConnectorType} connType - Connection type.
 * @param {acgraph.vector.Fill} fill - Fill settings.
 * @param {acgraph.vector.Stroke} stroke - Stroke settings.
 * @param {acgraph.vector.Path=} opt_path - Path to be used to draw connector.
 * @private
 */
anychart.core.ui.Timeline.prototype.drawConnector_ = function(fromBounds, toBounds, connType, fill, stroke, opt_path) {
  /*
    Bounds in this case are not bounds of bar.
    Bounds are an area of whole row to simplify the calculations of connectors:

    +--------------------------------------+
    | This is an area in row above the bar |
    +--------------------------------------+
    |\\\\\\\\\ This is a bar itself \\\\\\\|        <- this is an incoming bounds.
    +--------------------------------------+
    | This is an area in row below the bar |
    +--------------------------------------+

   */

  var drawPreview = goog.isDefAndNotNull(opt_path);

  var fromLeft, fromTop, toLeft, toTop, orientation;
  var am = anychart.core.ui.Timeline.ARROW_MARGIN;
  var size = anychart.core.ui.Timeline.ARROW_SIZE;
  var path = /** @type {?acgraph.vector.Path} */ (opt_path || null);
  var arrow = drawPreview ? path : null;
  //var arrow = null;
  var segmentLeft0, segmentLeft1; //Util variables, temporary segment X-coordinate storage.
  var segmentTop0; //Util variable, temporary segment Y-coordinate storage.
  var aboveSequence = true; //If 'from' bar is above the 'to' bar.

  var lineThickness = anychart.utils.extractThickness(stroke);

  var pixelShift = (lineThickness % 2 && acgraph.type() === acgraph.StageType.SVG) ? 0.5 : 0;

  switch ((connType + '').toLowerCase()) {
    case anychart.enums.ConnectorType.FINISH_FINISH:
      fromLeft = Math.round(fromBounds.left + fromBounds.width) + pixelShift;
      fromTop = Math.round(fromBounds.top + fromBounds.height / 2) + pixelShift;
      toLeft = Math.round(toBounds.left + toBounds.width) + pixelShift;
      toTop = Math.round(toBounds.top + toBounds.height / 2) + pixelShift;
      orientation = anychart.enums.Orientation.LEFT;

      if (fromBounds.top == toBounds.top) { //Same line
        path = this.drawSegment_(fromLeft, fromTop, toLeft, toTop, path);
        if (fromLeft > toLeft) orientation = anychart.enums.Orientation.RIGHT;
      } else {
        segmentLeft0 = Math.max(fromLeft + size + am, toLeft + size + am);
        path = this.drawSegment_(fromLeft, fromTop, segmentLeft0, fromTop, path);
        path = this.drawSegment_(segmentLeft0, fromTop, segmentLeft0, toTop, path);
        path = this.drawSegment_(segmentLeft0, toTop, toLeft, toTop, path);
      }
      arrow = this.drawArrow_(toLeft, toTop, orientation, arrow);
      break;

    case anychart.enums.ConnectorType.START_FINISH:
      fromLeft = Math.round(fromBounds.left) + pixelShift;
      fromTop = Math.round(fromBounds.top + fromBounds.height / 2) + pixelShift;
      toLeft = Math.round(toBounds.left + toBounds.width) + pixelShift;
      toTop = Math.round(toBounds.top + toBounds.height / 2) + pixelShift;
      orientation = anychart.enums.Orientation.LEFT;

      if (fromLeft - am - am - size > toLeft) {
        segmentLeft0 = toLeft + am + size;
        path = this.drawSegment_(fromLeft, fromTop, segmentLeft0, fromTop, path);
        path = this.drawSegment_(segmentLeft0, fromTop, segmentLeft0, toTop, path);
        path = this.drawSegment_(segmentLeft0, toTop, toLeft, toTop, path);
      } else {
        aboveSequence = toBounds.top >= fromBounds.top;

        segmentLeft0 = fromLeft - am;
        segmentLeft1 = toLeft + am + size;
        segmentTop0 = Math.round(aboveSequence ? toBounds.top : toBounds.top + toBounds.height) + pixelShift;

        path = this.drawSegment_(fromLeft, fromTop, segmentLeft0, fromTop, path);
        path = this.drawSegment_(segmentLeft0, fromTop, segmentLeft0, segmentTop0, path);
        path = this.drawSegment_(segmentLeft0, segmentTop0, segmentLeft1, segmentTop0, path);
        path = this.drawSegment_(segmentLeft1, segmentTop0, segmentLeft1, toTop, path);
        path = this.drawSegment_(segmentLeft1, toTop, toLeft, toTop, path);

      }

      arrow = this.drawArrow_(toLeft, toTop, orientation, arrow);

      break;

    case anychart.enums.ConnectorType.START_START:
      fromLeft = Math.round(fromBounds.left) + pixelShift;
      fromTop = Math.round(fromBounds.top + fromBounds.height / 2) + pixelShift;
      toLeft = Math.round(toBounds.left) + pixelShift;
      toTop = Math.round(toBounds.top + toBounds.height / 2) + pixelShift;
      orientation = anychart.enums.Orientation.RIGHT;

      if (fromBounds.top == toBounds.top) { //Same line
        path = this.drawSegment_(fromLeft, fromTop, toLeft, toTop, path);
        if (fromLeft > toLeft) orientation = anychart.enums.Orientation.LEFT;
      } else {
        segmentLeft0 = Math.min(fromLeft - size - am, toLeft - size - am);
        path = this.drawSegment_(fromLeft, fromTop, segmentLeft0, fromTop, path);
        path = this.drawSegment_(segmentLeft0, fromTop, segmentLeft0, toTop, path);
        path = this.drawSegment_(segmentLeft0, toTop, toLeft, toTop, path);
      }
      arrow = this.drawArrow_(toLeft, toTop, orientation, arrow);
      break;

    default: //anychart.enums.ConnectorType.FINISH_START:
      fromLeft = Math.round(fromBounds.left + fromBounds.width) + pixelShift;
      fromTop = Math.round(fromBounds.top + fromBounds.height / 2) + pixelShift;
      toLeft = Math.round(toBounds.left) + pixelShift;
      var extraEndY;

      if (toLeft >= fromLeft) {
        toLeft = Math.min(toLeft + am, Math.round(toBounds.left + toBounds.width / 2) + pixelShift);
        if (toBounds.top > fromBounds.top) {
          extraEndY = Math.round(toBounds.top) + pixelShift;
          path = this.drawSegment_(fromLeft, fromTop, toLeft, fromTop, path);
          path = this.drawSegment_(toLeft, fromTop, toLeft, extraEndY, path);
          arrow = this.drawArrow_(toLeft, extraEndY, anychart.enums.Orientation.BOTTOM, arrow);
        } else if (toBounds.top < fromBounds.top) {
          extraEndY = Math.round(toBounds.top + toBounds.height) + pixelShift;
          path = this.drawSegment_(fromLeft, fromTop, toLeft, fromTop, path);
          path = this.drawSegment_(toLeft, fromTop, toLeft, extraEndY, path);
          arrow = this.drawArrow_(toLeft, extraEndY, anychart.enums.Orientation.TOP, arrow);
        } else { //Same line
          toLeft = Math.round(toBounds.left) + pixelShift;
          toTop = Math.round(toBounds.top + toBounds.height / 2) + pixelShift;
          path = this.drawSegment_(fromLeft, fromTop, toLeft, toTop, path);
          arrow = this.drawArrow_(toLeft, toTop, anychart.enums.Orientation.RIGHT, arrow);
        }

      } else { //if toLeft < fromLeft
        extraEndY = Math.round(toBounds.top + toBounds.height / 2) + pixelShift;
        segmentTop0 = Math.round((toBounds.top > fromBounds.top) ? toBounds.top : (toBounds.top + toBounds.height)) + pixelShift;
        segmentLeft0 = fromLeft + am;
        segmentLeft1 = toLeft - am - size;

        path = this.drawSegment_(fromLeft, fromTop, segmentLeft0, fromTop, path);
        path = this.drawSegment_(segmentLeft0, fromTop, segmentLeft0, segmentTop0, path);
        path = this.drawSegment_(segmentLeft0, segmentTop0, segmentLeft1, segmentTop0, path);
        path = this.drawSegment_(segmentLeft1, segmentTop0, segmentLeft1, extraEndY, path);
        path = this.drawSegment_(segmentLeft1, extraEndY, toLeft, extraEndY, path);

        arrow = this.drawArrow_(toLeft, extraEndY, anychart.enums.Orientation.RIGHT, arrow);
      }
  }

  if (path && !drawPreview) {
    path.stroke(/** @type {acgraph.vector.Stroke} */ (stroke));
    path.tag = void 0; //Tooltip will not appear on connector mouse over.
    path.type = anychart.enums.TLElementTypes.CONNECTOR;
    path.currBounds = null; //TODO (A.Kudryavtsev): Maybe make connector editable somehow?
  }
  if (arrow && !drawPreview) {
    arrow.fill(/** @type {acgraph.vector.Fill} */ (fill)).stroke(/** @type {acgraph.vector.Stroke} */ (stroke));
    arrow.tag = void 0; //Tooltip will not appear on connector arrow mouse over.
    arrow.type = anychart.enums.TLElementTypes.CONNECTOR;
    arrow.currBounds = null; //TODO (A.Kudryavtsev): Maybe make connector editable somehow?
  }
};


/**
 * Draws a segment of connector.
 * @param {number} fromLeft - Start left coordinate.
 * @param {number} fromTop - Start top coordinate.
 * @param {number} toLeft - End left coordinate.
 * @param {number} toTop - End top coordinate.
 * @param {acgraph.vector.Path} path - Path to be drawn.
 * @return {acgraph.vector.Path} - If the segment is drawn, return a path for connector.
 * @private
 */
anychart.core.ui.Timeline.prototype.drawSegment_ = function(fromLeft, fromTop, toLeft, toTop, path) {
  /*
    Here we should know that connector basically can be drawn maximum in 5 segments:

                         +---------------+
                         |               | 1
                         |               +---+
                         |               |   |
                         +---------------+   | 2
                                             |
            +--------------- 3 --------------+
            |
          4 |     +-------------+
            |     |             |
            +---> +             |
              5   |             |
                  +-------------+


    Path will be drawn anyway in case:
    1) We draw a segment only if it is visible.
    2) If a segment becomes visible, it means that even if one of the next segments becomes invisible, we should not lose
    the sequence of segments to avoid appearance of diagonal connectors.
   */

  if (path) {
    try {
      path.lineTo(toLeft, toTop);
    } catch (e) {
      path
          .moveTo(fromLeft, fromTop)
          .lineTo(toLeft, toTop);
    }

  } else {
    var left = Math.min(fromLeft, toLeft);
    var right = Math.max(fromLeft, toLeft);
    var top = Math.min(fromTop, toTop);
    var bottom = Math.max(fromTop, toTop);

    if (left < (this.pixelBoundsCache.left + this.pixelBoundsCache.width) &&
        right > this.pixelBoundsCache.left &&
        top < (this.pixelBoundsCache.top + this.pixelBoundsCache.height) &&
        bottom > this.pixelBoundsCache.top) { //Segment or the part of it is visible.

      path = /** @type {acgraph.vector.Path} */ (this.getDrawLayer().genNextChild());

      path
          .zIndex(anychart.core.ui.Timeline.CONNECTOR_Z_INDEX)
          .moveTo(fromLeft, fromTop)
          .lineTo(toLeft, toTop);
    }
  }

  return path;
};


/**
 * Draws an arrow.
 * @param {number} left - Left coordinate.
 * @param {number} top - Top coordinate.
 * @param {anychart.enums.Orientation} orientation - Arrow direction.
 * @param {acgraph.vector.Path=} opt_path - Path to be used.
 * @private
 * @return {acgraph.vector.Path} - Arrow path or null if path is not drawn.
 */
anychart.core.ui.Timeline.prototype.drawArrow_ = function(left, top, orientation, opt_path) {
  var drawPreview = goog.isDefAndNotNull(opt_path);

  var path = /** @type {?acgraph.vector.Path} */ (opt_path || null);

  if (left >= this.pixelBoundsCache.left &&
      left <= this.pixelBoundsCache.left + this.pixelBoundsCache.width &&
      top >= this.pixelBoundsCache.top &&
      top <= this.pixelBoundsCache.top + this.pixelBoundsCache.height) { //Is in visible area.

    var arrSize = anychart.core.ui.Timeline.ARROW_SIZE;
    var left1 = 0;
    var top1 = 0;
    var left2 = 0;
    var top2 = 0;

    switch (orientation) {
      case anychart.enums.Orientation.LEFT:
        left = left + 1;
        left1 = left + arrSize;
        top1 = top - arrSize;
        left2 = left1;
        top2 = top + arrSize;
        break;
      case anychart.enums.Orientation.TOP:
        top = top + 1;
        left1 = left - arrSize;
        top1 = top + arrSize;
        left2 = left + arrSize;
        top2 = top1;
        break;
      case anychart.enums.Orientation.RIGHT:
        left = left - 1;
        left1 = left - arrSize;
        top1 = top - arrSize;
        left2 = left1;
        top2 = top + arrSize;
        break;
      case anychart.enums.Orientation.BOTTOM:
        top = top - 1;
        left1 = left - arrSize;
        top1 = top - arrSize;
        left2 = left + arrSize;
        top2 = top1;
        break;
    }

    if (!drawPreview) path = /** @type {acgraph.vector.Path} */ (this.getDrawLayer().genNextChild());
    path
        .zIndex(anychart.core.ui.Timeline.ARROW_Z_INDEX)
        .moveTo(left, top)
        .lineTo(left1, top1)
        .lineTo(left2, top2)
        .lineTo(left, top);

  }

  return path;
};


/**
 * Redraws vertical lines.
 * @param {Array.<number>} ticks - Ticks.
 * @private
 */
anychart.core.ui.Timeline.prototype.drawLowTicks_ = function(ticks) {
  if (ticks.length) {
    var path = this.getSeparationPath_().clear();

    for (var i = 0, l = ticks.length - 1; i < l; i++) {
      var tick = ticks[i];
      var ratio = this.scale_.timestampToRatio(tick);
      var left = this.pixelBoundsCache.left + this.pixelBoundsCache.width * ratio;
      path
          .moveTo(left, this.pixelBoundsCache.top)
          .lineTo(left, this.pixelBoundsCache.top + this.pixelBoundsCache.height);
    }
  }
};


/**
 * Recalculates scale depending on current controller's state.
 * @private
 */
anychart.core.ui.Timeline.prototype.initScale_ = function() {
  var totalMin = this.controller.getMinDate();
  var totalMax = this.controller.getMaxDate();

  var minGap = this.minimumGap() * (totalMax - totalMin);
  var maxGap = this.maximumGap() * (totalMax - totalMin);

  var newScale = this.scale_.isEmpty();
  var newTotalMin = totalMin - minGap;
  var newTotalMax = totalMax + maxGap;

  var delta = 0;
  var min = 0, max = 0;
  if (!newScale) {
    var range = this.scale_.getRange();
    max = range['max'];
    min = range['min'];
    delta = max - min;
  }

  this.scale_.setTotalRange(newTotalMin, newTotalMax);

  if (delta) { //this saves currently visible range after totalRange changes.
    range = this.scale_.getRange();
    min = range['min'];
    this.scale_.zoomTo(min, min + delta);
  }

  if (newScale) {
    var newRange = Math.round((totalMax - totalMin) / 10);
    this.scale_.setRange(newTotalMin, totalMin + newRange); // Initial visible range: 10% of total range.
  }
};


/**
 * @override
 */
anychart.core.ui.Timeline.prototype.initDom = function() {
  this.getClipLayer().zIndex(anychart.core.ui.BaseGrid.DRAW_Z_INDEX - 1); //Put it under draw layer.
  this.getMarkersFactory_().container(this.getContentLayer());
  this.getLabelsFactory_().container(this.getContentLayer());
  this.header_.container(this.getBase());
  this.initScale_();
};


/**
 * @override
 */
anychart.core.ui.Timeline.prototype.boundsInvalidated = function() {
  this.header_
      .bounds()
      .set(this.pixelBoundsCache.left, this.pixelBoundsCache.top,
      this.pixelBoundsCache.width, /** @type {number} */ (this.headerHeight()));
  this.redrawHeader = true;
};


/**
 * @override
 */
anychart.core.ui.Timeline.prototype.appearanceInvalidated = function() {
  this.getSeparationPath_().stroke(this.columnStroke_);

  this.getEditConnectorPreviewPath_()
      .stroke(this.connectorPreviewStroke_);

  this.getEditPreviewPath_()
      .fill(this.editPreviewFill_)
      .stroke(this.editPreviewStroke_);

  this.getEditProgressPath_()
      .fill(this.editProgressFill_)
      .stroke(this.editProgressStroke_);

  this.getEditLeftThumbPath_()
      .fill(this.editIntervalThumbFill_)
      .stroke(this.editIntervalThumbStroke_);

  this.getEditRightThumbPath_()
      .fill(this.editIntervalThumbFill_)
      .stroke(this.editIntervalThumbStroke_);

  this.getEditStartConnectorPath_()
      .fill(this.editConnectorThumbFill_)
      .stroke(this.editConnectorThumbStroke_);

  this.getEditFinishConnectorPath_()
      .fill(this.editConnectorThumbFill_)
      .stroke(this.editConnectorThumbStroke_);
};


/**
 * @override
 */
anychart.core.ui.Timeline.prototype.specialInvalidated = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.TIMELINE_SCALES)) {
    this.redrawPosition = true;
    this.redrawHeader = true;
    this.markConsistent(anychart.ConsistencyState.TIMELINE_SCALES);
  }

  if (this.redrawHeader) {
    this.header_.invalidate(anychart.ConsistencyState.TIMELINE_HEADER_SCALES);
    this.header_.draw();
    var ticks = this.header_.getLowLevel().getTicks();
    this.drawLowTicks_(ticks);

    var totalRange = this.scale_.getTotalRange();
    var visibleRange = this.scale_.getRange();

    var totMin = this.scale_.timestampToRatio(totalRange['min']) * this.pixelBoundsCache.width;
    var totMax = this.scale_.timestampToRatio(totalRange['max']) * this.pixelBoundsCache.width;
    var visibleMin = this.scale_.timestampToRatio(visibleRange['min']) * this.pixelBoundsCache.width;
    var visibleMax = this.scale_.timestampToRatio(visibleRange['max']) * this.pixelBoundsCache.width;

    if (this.horizontalScrollBar_) {
      var contentBoundsSimulation = new anychart.math.Rect(totMin, 0, totMax - totMin, 0);
      var visibleBoundsSimulation = new anychart.math.Rect(visibleMin, 0, visibleMax - visibleMin, 0);

      this.horizontalScrollBar_
          .suspendSignalsDispatching()
          .handlePositionChange(false)
          .contentBounds(contentBoundsSimulation)
          .visibleBounds(visibleBoundsSimulation)
          .draw()
          .handlePositionChange(true)
          .resumeSignalsDispatching(false);

      if (this.horizontalScrollBar_.container()) this.horizontalScrollBar_.draw();
    }
  }
};


/**
 * @override
 */
anychart.core.ui.Timeline.prototype.positionFinal = function() {
  if (this.redrawPosition || this.redrawHeader) {
    this.drawTimelineElements_();
    this.redrawHeader = false;
  }
};


/**
 * Generates horizontal scroll bar.
 * @return {anychart.core.ui.ScrollBar} - Scroll bar.
 */
anychart.core.ui.Timeline.prototype.getHorizontalScrollBar = function() {
  if (!this.horizontalScrollBar_) {
    this.horizontalScrollBar_ = new anychart.core.ui.ScrollBar();
    this.horizontalScrollBar_
        .layout(anychart.enums.Layout.HORIZONTAL)
        .buttonsVisible(false)
        .mouseOutOpacity(.25)
        .mouseOverOpacity(.45);

    var scale = this.scale_;
    this.horizontalScrollBar_.listen(anychart.enums.EventType.SCROLL_CHANGE, function(e) {
      var startRatio = e['startRatio'];
      var endRatio = e['endRatio'];

      var range = scale.getTotalRange();
      var totalMin = range['min'];
      var totalMax = range['max'];
      var msRange = totalMax - totalMin;
      var start = Math.round(totalMin + startRatio * msRange);
      var end = Math.round(totalMin + endRatio * msRange);
      scale.setRange(start, end);
    });
  }
  return this.horizontalScrollBar_;
};


/**
 * Performs scroll to pixel offsets.
 * @param {number} horizontalPixelOffset - Horizontal pixel offset.
 * @param {number} verticalPixelOffset - Vertical pixel offset.
 * @param {boolean=} opt_dragScrolling - Whether TL is in drag scrolling.
 */
anychart.core.ui.Timeline.prototype.scroll = function(horizontalPixelOffset, verticalPixelOffset, opt_dragScrolling) {
  anychart.core.Base.suspendSignalsDispatching(this, this.scale_, this.controller);

  if (!opt_dragScrolling) {
    this.dragging = false;
    clearInterval(this.scrollInterval);
    this.scrollInterval = null;
    this.clearEdit_();
  }

  var heightCache = this.controller.getHeightCache();
  var totalVerticalStartOffset = this.controller.startIndex() ? heightCache[this.controller.startIndex() - 1] : 0;
  totalVerticalStartOffset += (this.controller.verticalOffset() + verticalPixelOffset);
  this.controller.scrollTo(/** @type {number} */ (totalVerticalStartOffset));

  var ratio = horizontalPixelOffset / this.pixelBoundsCache.width;
  if (opt_dragScrolling && !this.draggingConnector) {
    this.scale_.ratioForceScroll(ratio);
  } else {
    this.scale_.ratioScroll(ratio);
  }

  anychart.core.Base.resumeSignalsDispatchingTrue(this, this.scale_, this.controller);
};


/** @inheritDoc */
anychart.core.ui.Timeline.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');

  json['scale'] = this.scale_.serialize();

  json['columnStroke'] = anychart.color.serialize(this.columnStroke_);

  json['baselineAbove'] = this.baselineAbove_;

  json['baseFill'] = anychart.color.serialize(this.baseFill_);
  json['baseStroke'] = anychart.color.serialize(this.baseStroke_);
  json['baselineFill'] = anychart.color.serialize(this.baselineFill_);
  json['baselineStroke'] = anychart.color.serialize(this.baselineStroke_);
  json['milestoneFill'] = anychart.color.serialize(this.milestoneFill_);
  json['milestoneStroke'] = anychart.color.serialize(this.milestoneStroke_);
  json['parentFill'] = anychart.color.serialize(this.parentFill_);
  json['parentStroke'] = anychart.color.serialize(this.parentStroke_);
  json['progressFill'] = anychart.color.serialize(this.progressFill_);
  json['progressStroke'] = anychart.color.serialize(this.progressStroke_);
  json['connectorFill'] = anychart.color.serialize(this.connectorFill_);
  json['connectorStroke'] = anychart.color.serialize(this.connectorStroke_);
  json['selectedElementFill'] = anychart.color.serialize(this.selectedElementFill_);
  json['selectedElementStroke'] = anychart.color.serialize(this.selectedElementStroke_);

  json['connectorPreviewStroke'] = anychart.color.serialize(this.connectorPreviewStroke_);
  json['editPreviewFill'] = anychart.color.serialize(this.editPreviewFill_);
  json['editPreviewStroke'] = anychart.color.serialize(this.editPreviewStroke_);
  json['editProgressFill'] = anychart.color.serialize(this.editProgressFill_);
  json['editProgressStroke'] = anychart.color.serialize(this.editProgressStroke_);
  json['editIntervalThumbFill'] = anychart.color.serialize(this.editIntervalThumbFill_);
  json['editIntervalThumbStroke'] = anychart.color.serialize(this.editIntervalThumbStroke_);
  json['editConnectorThumbFill'] = anychart.color.serialize(this.editConnectorThumbFill_);
  json['editConnectorThumbStroke'] = anychart.color.serialize(this.editConnectorThumbStroke_);

  return json;
};


/** @inheritDoc */
anychart.core.ui.Timeline.prototype.setupByJSON = function(config) {
  goog.base(this, 'setupByJSON', config);

  if ('scale' in config) this.scale_.setup(config['scale']);
  if ('labelsFactory' in config) this.labelsFactory(config['labelsFactory']);

  this.columnStroke(config['columnStroke']);
  this.baselineAbove(config['baselineAbove']);

  this.baseFill(config['baseFill']);
  this.baseStroke(config['baseStroke']);
  this.baselineFill(config['baselineFill']);
  this.baselineStroke(config['baselineStroke']);
  this.milestoneFill(config['milestoneFill']);
  this.milestoneStroke(config['milestoneStroke']);
  this.parentFill(config['parentFill']);
  this.parentStroke(config['parentStroke']);
  this.progressFill(config['progressFill']);
  this.progressStroke(config['progressStroke']);
  this.connectorFill(config['connectorFill']);
  this.connectorStroke(config['connectorStroke']);
  this.selectedElementFill(config['selectedElementFill']);
  this.selectedElementStroke(config['selectedElementStroke']);

  this.connectorPreviewStroke(config['connectorPreviewStroke']);
  this.editPreviewFill(config['editPreviewFill']);
  this.editPreviewStroke(config['editPreviewStroke']);
  this.editProgressFill(config['editProgressFill']);
  this.editProgressStroke(config['editProgressStroke']);
  this.editIntervalThumbFill(config['editIntervalThumbFill']);
  this.editIntervalThumbStroke(config['editIntervalThumbStroke']);
  this.editConnectorThumbFill(config['editConnectorThumbFill']);
  this.editConnectorThumbStroke(config['editConnectorThumbStroke']);

};



/**
 * Live edit control. Extends path to add some data to be stored in usage process.
 * @param {acgraph.vector.Layer} parent - Parent layer.
 * @constructor
 * @extends {acgraph.vector.Path}
 */
anychart.core.ui.Timeline.LiveEditControl = function(parent) {
  goog.base(this);

  this.parent(parent);
};
goog.inherits(anychart.core.ui.Timeline.LiveEditControl, acgraph.vector.Path);


/**
 * @type {anychart.data.Tree.DataItem}
 */
anychart.core.ui.Timeline.LiveEditControl.prototype.item;


/**
 * @type {number}
 */
anychart.core.ui.Timeline.LiveEditControl.prototype.index = -1;


/**
 * @type {anychart.enums.TLElementTypes}
 */
anychart.core.ui.Timeline.LiveEditControl.prototype.type;


/**
 * @type {Object}
 */
anychart.core.ui.Timeline.LiveEditControl.prototype.period;


/**
 * @type {number}
 */
anychart.core.ui.Timeline.LiveEditControl.prototype.periodIndex = -1;


/**
 * @type {anychart.math.Rect}
 */
anychart.core.ui.Timeline.LiveEditControl.prototype.bounds;


/**
 * @type {anychart.core.ui.Timeline.LiveEditControl}
 */
anychart.core.ui.Timeline.LiveEditControl.prototype.preview;


/**
 * Draws path as circle.
 * @param {number} cx - Center X.
 * @param {number} cy - Center Y.
 * @param {number} radius - Radius.
 * @return {anychart.core.ui.Timeline.LiveEditControl} - Itself for method chaining.
 */
anychart.core.ui.Timeline.LiveEditControl.prototype.drawAsCircle = function(cx, cy, radius) {
  this
      .moveTo(cx + radius, cy)
      .arcTo(radius, radius, 0, 360);

  return this;
};



/**
 * Bar dragger.
 * @param {acgraph.vector.Element} target - Target element.
 * @constructor
 * @extends {goog.fx.Dragger}
 */
anychart.core.ui.Timeline.BarDragger = function(target) {
  goog.base(this, target.domElement());

  this.element = target;

  /**
   * X.
   * @type {number}
   */
  this.x = 0;

  /**
   * Y.
   * @type {number}
   */
  this.y = 0;
};
goog.inherits(anychart.core.ui.Timeline.BarDragger, goog.fx.Dragger);


/**
 * @override
 */
anychart.core.ui.Timeline.BarDragger.prototype.computeInitialPosition = function() {
  this.deltaX = 0;
  this.deltaY = 0;
};


/**
 * @override
 */
anychart.core.ui.Timeline.BarDragger.prototype.defaultAction = function(x, y) {
  this.element.setTransformationMatrix(1, 0, 0, 1, x, 0);
};


/**
 * @override
 */
anychart.core.ui.Timeline.BarDragger.prototype.limitY = function(y) {
  return 0;
};



/**
 * Progress dragger.
 * @param {anychart.core.ui.Timeline.LiveEditControl} target - Target element.
 * @constructor
 * @extends {goog.fx.Dragger}
 */
anychart.core.ui.Timeline.ProgressDragger = function(target) {
  goog.base(this, target.domElement());

  /**
   * Element.
   * @type {anychart.core.ui.Timeline.LiveEditControl}
   */
  this.element = target;

  /**
   * Progress value to be applied after edit.
   * @type {number}
   */
  this.progress = NaN;
};
goog.inherits(anychart.core.ui.Timeline.ProgressDragger, goog.fx.Dragger);


/**
 * @override
 */
anychart.core.ui.Timeline.ProgressDragger.prototype.computeInitialPosition = function() {
  this.deltaX = 0;
  this.deltaY = 0;
};


/**
 * @override
 */
anychart.core.ui.Timeline.ProgressDragger.prototype.defaultAction = function(x, y) {
  this.element.setTransformationMatrix(1, 0, 0, 1, x, 0);
  var progressLeft = x - this.limits.left;
  this.progress = progressLeft / this.limits.width;
};


/**
 * @override
 */
anychart.core.ui.Timeline.ProgressDragger.prototype.limitX = function(x) {
  var b = this.element.bounds;
  var dataItem = this.element.item;

  var progressValue = goog.isDef(dataItem.get(anychart.enums.GanttDataFields.PROGRESS_VALUE)) ?
      (parseFloat(dataItem.get(anychart.enums.GanttDataFields.PROGRESS_VALUE)) / 100) :
      anychart.math.round(/** @type {number} */ (dataItem.meta('autoProgress')), 2);

  progressValue = progressValue || 0;
  var progress = b.width * progressValue;
  this.limits.left = -progress;
  this.limits.width = b.width;

  return goog.math.clamp(x, -progress, b.width - progress);
};


/**
 * @override
 */
anychart.core.ui.Timeline.ProgressDragger.prototype.limitY = function(y) {
  return 0;
};



/**
 * Edit time interval dragger.
 * @param {acgraph.vector.Element} target - Target element.
 * @param {boolean=} opt_isLeft - Whether it is a left-oriented thumb. Otherwise - is right.
 * @constructor
 * @extends {goog.fx.Dragger}
 */
anychart.core.ui.Timeline.ThumbDragger = function(target, opt_isLeft) {
  goog.base(this, target.domElement());

  /**
   * Element.
   * @type {acgraph.vector.Element}
   */
  this.element = target;

  /**
   * Orientation of thumb.
   * @type {boolean}
   */
  this.isLeft = !!opt_isLeft;

};
goog.inherits(anychart.core.ui.Timeline.ThumbDragger, goog.fx.Dragger);


/**
 * @override
 */
anychart.core.ui.Timeline.ThumbDragger.prototype.limitY = function(y) {
  return 0;
};



/**
 * Edit connector dragger.
 * @param {anychart.core.ui.Timeline} timeline - Related TL.
 * @param {acgraph.vector.Element} target - Target element.
 * @param {boolean=} opt_isStart - Whether it is a 'start'-connector. Otherwise - is 'finish'.
 * @constructor
 * @extends {goog.fx.Dragger}
 */
anychart.core.ui.Timeline.ConnectorDragger = function(timeline, target, opt_isStart) {
  goog.base(this, target.domElement());

  /**
   * Related TL.
   * @type {anychart.core.ui.Timeline}
   */
  this.timeline = timeline;

  /**
   * Element.
   * @type {acgraph.vector.Element}
   */
  this.element = target;

  /**
   * Orientation of thumb.
   * @type {boolean}
   */
  this.isStart = !!opt_isStart;


  /**
   * Last tracked X coordinate from mouseEvent.
   * @type {number}
   */
  this.lastTrackedMouseX = NaN;


  /**
   * Last tracked Y coordinate from mouseEvent.
   * @type {number}
   */
  this.lastTrackedMouseY = NaN;
};
goog.inherits(anychart.core.ui.Timeline.ConnectorDragger, goog.fx.Dragger);


/**
 * @override
 */
anychart.core.ui.Timeline.ConnectorDragger.prototype.computeInitialPosition = function() {
  this.deltaX = 0;
  this.deltaY = 0;
};


//exports
anychart.core.ui.Timeline.prototype['backgroundFill'] = anychart.core.ui.Timeline.prototype.backgroundFill;
anychart.core.ui.Timeline.prototype['cellOddFill'] = anychart.core.ui.Timeline.prototype.cellOddFill; //deprecated
anychart.core.ui.Timeline.prototype['cellEvenFill'] = anychart.core.ui.Timeline.prototype.cellEvenFill; //deprecated
anychart.core.ui.Timeline.prototype['cellFill'] = anychart.core.ui.Timeline.prototype.cellFill; //deprecated
anychart.core.ui.Timeline.prototype['columnStroke'] = anychart.core.ui.Timeline.prototype.columnStroke;
anychart.core.ui.Timeline.prototype['rowFill'] = anychart.core.ui.Timeline.prototype.rowFill;
anychart.core.ui.Timeline.prototype['rowEvenFill'] = anychart.core.ui.Timeline.prototype.rowEvenFill;
anychart.core.ui.Timeline.prototype['rowOddFill'] = anychart.core.ui.Timeline.prototype.rowOddFill;
anychart.core.ui.Timeline.prototype['rowHoverFill'] = anychart.core.ui.Timeline.prototype.rowHoverFill;
anychart.core.ui.Timeline.prototype['rowSelectedFill'] = anychart.core.ui.Timeline.prototype.rowSelectedFill;
anychart.core.ui.Timeline.prototype['editing'] = anychart.core.ui.Timeline.prototype.editing;

anychart.core.ui.Timeline.prototype['baselineAbove'] = anychart.core.ui.Timeline.prototype.baselineAbove;

anychart.core.ui.Timeline.prototype['baseFill'] = anychart.core.ui.Timeline.prototype.baseFill;
anychart.core.ui.Timeline.prototype['baseStroke'] = anychart.core.ui.Timeline.prototype.baseStroke;
anychart.core.ui.Timeline.prototype['baselineFill'] = anychart.core.ui.Timeline.prototype.baselineFill;
anychart.core.ui.Timeline.prototype['baselineStroke'] = anychart.core.ui.Timeline.prototype.baselineStroke;
anychart.core.ui.Timeline.prototype['milestoneFill'] = anychart.core.ui.Timeline.prototype.milestoneFill;
anychart.core.ui.Timeline.prototype['milestoneStroke'] = anychart.core.ui.Timeline.prototype.milestoneStroke;
anychart.core.ui.Timeline.prototype['parentFill'] = anychart.core.ui.Timeline.prototype.parentFill;
anychart.core.ui.Timeline.prototype['parentStroke'] = anychart.core.ui.Timeline.prototype.parentStroke;
anychart.core.ui.Timeline.prototype['progressFill'] = anychart.core.ui.Timeline.prototype.progressFill;
anychart.core.ui.Timeline.prototype['progressStroke'] = anychart.core.ui.Timeline.prototype.progressStroke;
anychart.core.ui.Timeline.prototype['connectorFill'] = anychart.core.ui.Timeline.prototype.connectorFill;
anychart.core.ui.Timeline.prototype['connectorStroke'] = anychart.core.ui.Timeline.prototype.connectorStroke;
anychart.core.ui.Timeline.prototype['selectedElementFill'] = anychart.core.ui.Timeline.prototype.selectedElementFill;
anychart.core.ui.Timeline.prototype['selectedElementStroke'] = anychart.core.ui.Timeline.prototype.selectedElementStroke;
anychart.core.ui.Timeline.prototype['tooltip'] = anychart.core.ui.Timeline.prototype.tooltip;
anychart.core.ui.Timeline.prototype['minimumGap'] = anychart.core.ui.Timeline.prototype.minimumGap;
anychart.core.ui.Timeline.prototype['maximumGap'] = anychart.core.ui.Timeline.prototype.maximumGap;

anychart.core.ui.Timeline.prototype['connectorPreviewStroke'] = anychart.core.ui.Timeline.prototype.connectorPreviewStroke;
anychart.core.ui.Timeline.prototype['editPreviewFill'] = anychart.core.ui.Timeline.prototype.editPreviewFill;
anychart.core.ui.Timeline.prototype['editPreviewStroke'] = anychart.core.ui.Timeline.prototype.editPreviewStroke;
anychart.core.ui.Timeline.prototype['editProgressFill'] = anychart.core.ui.Timeline.prototype.editProgressFill;
anychart.core.ui.Timeline.prototype['editProgressStroke'] = anychart.core.ui.Timeline.prototype.editProgressStroke;
anychart.core.ui.Timeline.prototype['editIntervalThumbFill'] = anychart.core.ui.Timeline.prototype.editIntervalThumbFill;
anychart.core.ui.Timeline.prototype['editIntervalThumbStroke'] = anychart.core.ui.Timeline.prototype.editIntervalThumbStroke;
anychart.core.ui.Timeline.prototype['editConnectorThumbFill'] = anychart.core.ui.Timeline.prototype.editConnectorThumbFill;
anychart.core.ui.Timeline.prototype['editConnectorThumbStroke'] = anychart.core.ui.Timeline.prototype.editConnectorThumbStroke;
