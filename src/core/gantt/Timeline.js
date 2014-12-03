goog.provide('anychart.core.gantt.Timeline');

goog.require('anychart.core.VisualBaseWithBounds');
goog.require('anychart.core.gantt.TimelineHeader');
goog.require('anychart.core.ui.LabelsFactory');
goog.require('anychart.core.ui.MarkersFactory');
goog.require('anychart.core.ui.ScrollBar');
goog.require('anychart.core.utils.TypedLayer');
goog.require('anychart.scales.GanttDateTime');

goog.require('goog.array');



/**
 * Gantt timeline implementation.
 * TODO (A.Kudryavtsev): In current version, timeline can't be instantiated separately. That's why constructor gets controller as parameter.
 *
 * @param {anychart.core.gantt.Controller} controller - Gantt controller.
 * @param {boolean} isResourcesChart - Flag if chart that TL belongs to should be interpreted as resource chart.
 * @constructor
 * @extends {anychart.core.VisualBaseWithBounds}
 */
anychart.core.gantt.Timeline = function(controller, isResourcesChart) {
  goog.base(this);

  /**
   * Gantt controller.
   * TODO (A.Kudryavtsev): Another one can't be set in current version.
   *
   * @type {anychart.core.gantt.Controller}
   * @private
   */
  this.controller_ = controller;


  /**
   * Flag, how to process incoming data.
   * More detailed description see in related flag of gantt chart.
   * @type {boolean}
   * @private
   */
  this.isResourceChart_ = isResourcesChart;

  /**
   * Horizontal scroll bar.
   * @type {anychart.core.ui.ScrollBar}
   * @private
   */
  this.horizontalScrollBar_ = null;

  /**
   * Pixel bounds cache.
   * @type {anychart.math.Rect}
   * @private
   */
  this.pixelBoundsCache_ = null;

  /**
   * Base layer.
   * @type {acgraph.vector.Layer}
   * @private
   */
  this.base_ = null;

  /**
   * Background rect.
   * @type {acgraph.vector.Rect}
   * @private
   */
  this.bgRect_ = null;

  /**
   * Background fill.
   * @type {acgraph.vector.Fill}
   * @private
   */
  this.backgroundFill_ = acgraph.vector.normalizeFill('#ccd7e1');

  /**
   * Cells layer.
   * @type {acgraph.vector.Layer}
   * @private
   */
  this.cellsLayer_ = null;

  /**
   * Separation layer.
   * @type {acgraph.vector.Layer}
   * @private
   */
  this.separationLayer_ = null;

  /**
   * Layer that contains data bars.
   * @type {anychart.core.utils.TypedLayer}
   * @private
   */
  this.dataLayer_ = null;

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
   * Odd cells path.
   * @type {acgraph.vector.Path}
   * @private
   */
  this.oddPath_ = null;

  /**
   * Even cells path.
   * @type {acgraph.vector.Path}
   * @private
   */
  this.evenPath_ = null;

  /**
   * Odd fill.
   * @type {?acgraph.vector.Fill}
   * @private
   */
  this.cellOddFill_ = acgraph.vector.normalizeFill('#fafafa');

  /**
   * Even fill.
   * @type {?acgraph.vector.Fill}
   * @private
   */
  this.cellEvenFill_ = acgraph.vector.normalizeFill('#fff');

  /**
   * Default cells fill.
   * @type {acgraph.vector.Fill}
   * @private
   */
  this.cellFill_ = acgraph.vector.normalizeFill('#fff');

  /**
   * Start index of this.visibleItems_. Actually is a first visible data item of data grid.
   * @type {number}
   * @private
   */
  this.startIndex_ = 0;

  /**
   * End index of this.visibleItems_. Actually is a last visible data item of data grid.
   * @type {number}
   * @private
   */
  this.endIndex_ = 0;

  /**
   * Vertical offset.
   * @type {number}
   * @private
   */
  this.verticalOffset_ = 0;

  /**
   * Array of visible data items.
   * @type {Array.<anychart.data.Tree.DataItem>}
   * @private
   */
  this.visibleItems_ = [];

  /**
   * Separation path.
   * @type {acgraph.vector.Path}
   * @private
   */
  this.separationPath_ = null;

  /**
   * Base fill.
   * @type {acgraph.vector.Fill}
   * @private
   */
  this.baseFill_ = acgraph.vector.normalizeFill(['#3CA0DE', '#3085BC'], -90);

  /**
   * Base stroke.
   * @type {acgraph.vector.Stroke}
   * @private
   */
  this.baseStroke_ = acgraph.vector.normalizeStroke('#0C3F5F');

  /**
   * Baseline fill.
   * @type {acgraph.vector.Fill}
   * @private
   */
  this.baselineFill_ = acgraph.vector.normalizeFill(['#3CA0DE', '#3085BC'], -90);

  /**
   * Base stroke.
   * @type {acgraph.vector.Stroke}
   * @private
   */
  this.baselineStroke_ = acgraph.vector.normalizeStroke('#0C3F5F');

  /**
   * Progress fill.
   * @type {acgraph.vector.Fill}
   * @private
   */
  this.progressFill_ = acgraph.vector.normalizeFill(['#63FF78', '#3DC351', '#188E2D'], -90);

  /**
   * Progress stroke.
   * @type {acgraph.vector.Stroke}
   * @private
   */
  this.progressStroke_ = acgraph.vector.normalizeStroke('#006616');


  /**
   * Milestone fill.
   * @type {acgraph.vector.Fill}
   * @private
   */
  this.milestoneFill_ = acgraph.vector.normalizeFill(['#FAE096', '#EB8344'], -90);

  /**
   * milestone stroke.
   * @type {acgraph.vector.Stroke}
   * @private
   */
  this.milestoneStroke_ = acgraph.vector.normalizeStroke('#000000');


  /**
   * Parent fill.
   * @type {acgraph.vector.Fill}
   * @private
   */
  this.parentFill_ = acgraph.vector.normalizeFill(['#646464', '#282828'], -90);


  /**
   * Parent stroke.
   * @type {acgraph.vector.Stroke}
   * @private
   */
  this.parentStroke_ = acgraph.vector.normalizeStroke('#000000');


  /**
   * Connector arrow fill.
   * @type {acgraph.vector.Fill}
   * @private
   */
  this.connectorFill_ = acgraph.vector.normalizeFill('#000090');


  /**
   * Connector line stroke.
   * @type {acgraph.vector.Stroke}
   * @private
   */
  this.connectorStroke_ = acgraph.vector.normalizeStroke('#000090');


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
  this.header_.resumeSignalsDispatching(false);
  this.registerDisposable(this.header_);

};
goog.inherits(anychart.core.gantt.Timeline, anychart.core.VisualBaseWithBounds);


/**
 * Supported signals.
 * @type {number}
 */
anychart.core.gantt.Timeline.SUPPORTED_SIGNALS = anychart.core.VisualBaseWithBounds.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistence states.
 * @type {number}
 */
anychart.core.gantt.Timeline.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBaseWithBounds.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.SCALES |
    anychart.ConsistencyState.POSITION |
    anychart.ConsistencyState.APPEARANCE;


/**
 * Default timeline header height.
 * @type {number}
 */
anychart.core.gantt.Timeline.DEFAULT_HEADER_HEIGHT = 70;


/**
 * Base path z-index.
 * @type {number}
 */
anychart.core.gantt.Timeline.BASE_Z_INDEX = 10;


/**
 * Baseline path z-index.
 * @type {number}
 */
anychart.core.gantt.Timeline.BASELINE_Z_INDEX = 20;


/**
 * Progress path z-index.
 * @type {number}
 */
anychart.core.gantt.Timeline.PROGRESS_Z_INDEX = 30;


/**
 * labels factory z-index.
 * @type {number}
 */
anychart.core.gantt.Timeline.LABEL_Z_INDEX = 40;


/**
 * Marker factory z-index.
 * @type {number}
 */
anychart.core.gantt.Timeline.MARKER_Z_INDEX = 50;


/**
 * Connector z-index.
 * @type {number}
 */
anychart.core.gantt.Timeline.CONNECTOR_Z_INDEX = 60;


/**
 * Connector arrow z-index.
 * @type {number}
 */
anychart.core.gantt.Timeline.ARROW_Z_INDEX = 70;


/**
 * Arrow margin.
 * @type {number}
 */
anychart.core.gantt.Timeline.ARROW_MARGIN = 5;


/**
 * Arrow size.
 * @type {number}
 */
anychart.core.gantt.Timeline.ARROW_SIZE = 4;


/**
 * This constant means that bar will have height = DEFAULT_HEIGHT_REDUCTION * this.height;
 * @type {number}
 */
anychart.core.gantt.Timeline.DEFAULT_HEIGHT_REDUCTION = 0.7;


/**
 * This constant means that bar will have height = PARENT_HEIGHT_REDUCTION * this.height;
 * @type {number}
 */
anychart.core.gantt.Timeline.PARENT_HEIGHT_REDUCTION = 0.4;


/**
 * This constant means that progress bar will have height = PROGRESS_HEIGHT_REDUCTION * barHeight;
 * barHeight is height of bar that progress belongs to.
 * @type {number}
 */
anychart.core.gantt.Timeline.PROGRESS_HEIGHT_REDUCTION = 1;


/**
 * 'Needs reapplication' handler.
 *  @param {anychart.SignalEvent} event - Incoming event.
 * @private
 */
anychart.core.gantt.Timeline.prototype.needsReapplicationHandler_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.dispatchSignal(anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Scale invalidation handler.
 * @param {anychart.SignalEvent} event - Signal event.
 * @private
 */
anychart.core.gantt.Timeline.prototype.scaleInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION)) {
    this.invalidate(anychart.ConsistencyState.SCALES, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Gets timeline's gantt date time scale.
 * @return {anychart.scales.GanttDateTime} - Scale.
 */
anychart.core.gantt.Timeline.prototype.getScale = function() {
  return this.scale_;
};


/**
 * Gets/sets a default cell fill. Resets cells odd fill and cells even fill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.gantt.Timeline|string} - Current value or itself for method chaining.
 */
anychart.core.gantt.Timeline.prototype.cellFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var val = acgraph.vector.normalizeFill.apply(null, arguments);
    if (!anychart.color.equals(/** @type {acgraph.vector.Fill} */ (this.cellFill_), val)) {
      this.cellFill_ = val;
      this.cellOddFill_ = null;
      this.cellEvenFill_ = null;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.cellFill_;
};


/**
 * Gets/sets a odd cell fill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.gantt.Timeline|string} - Current value or itself for method chaining.
 */
anychart.core.gantt.Timeline.prototype.cellOddFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var val = acgraph.vector.normalizeFill.apply(null, arguments);
    if (!anychart.color.equals(/** @type {acgraph.vector.Fill} */ (this.cellOddFill_), val)) {
      this.cellOddFill_ = val;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.cellOddFill_;
};


/**
 * Gets/sets an even cell fill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.gantt.Timeline|string} - Current value or itself for method chaining.
 */
anychart.core.gantt.Timeline.prototype.cellEvenFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var val = acgraph.vector.normalizeFill.apply(null, arguments);
    if (!anychart.color.equals(/** @type {acgraph.vector.Fill} */ (this.cellEvenFill_), val)) {
      this.cellEvenFill_ = val;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.cellEvenFill_;
};


/**
 * Gets/sets background fill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.gantt.Timeline|string} - Current value or itself for method chaining.
 */
anychart.core.gantt.Timeline.prototype.backgroundFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var val = acgraph.vector.normalizeFill.apply(null, arguments);
    if (!anychart.color.equals(/** @type {acgraph.vector.Fill} */ (this.backgroundFill_), val)) {
      this.backgroundFill_ = val;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.backgroundFill_;
};


/**
 * Getter for this.oddPath_.
 * @return {acgraph.vector.Path}
 * @private
 */
anychart.core.gantt.Timeline.prototype.getOddPath_ = function() {
  if (!this.oddPath_) {
    this.oddPath_ = /** @type {acgraph.vector.Path} */ (this.getCellsLayer_().path());
    this.oddPath_.stroke(null);
    this.registerDisposable(this.oddPath_);
  }
  return this.oddPath_;
};


/**
 * Getter for this.evenPath_.
 * @return {acgraph.vector.Path}
 * @private
 */
anychart.core.gantt.Timeline.prototype.getEvenPath_ = function() {
  if (!this.evenPath_) {
    this.evenPath_ = /** @type {acgraph.vector.Path} */ (this.getCellsLayer_().path());
    this.evenPath_.stroke(null);
    this.registerDisposable(this.evenPath_);
  }
  return this.evenPath_;
};


/**
 * Getter for this.separationPath_.
 * @return {acgraph.vector.Path}
 * @private
 */
anychart.core.gantt.Timeline.prototype.getSeparationPath_ = function() {
  if (!this.separationPath_) {
    this.separationPath_ = /** @type {acgraph.vector.Path} */ (this.getSeparationLayer_().path());
    this.separationPath_.stroke('#ccd7e1');
    this.registerDisposable(this.separationPath_);
  }
  return this.separationPath_;
};


/**
 * Inner getter for this.cellsLayer_.
 * @return {acgraph.vector.Layer}
 * @private
 */
anychart.core.gantt.Timeline.prototype.getCellsLayer_ = function() {
  if (!this.cellsLayer_) {
    this.cellsLayer_ = /** @type {acgraph.vector.Layer} */ (acgraph.layer());
    this.registerDisposable(this.cellsLayer_);
  }
  return this.cellsLayer_;
};


/**
 * Inner getter for this.separationLayer_.
 * @return {acgraph.vector.Layer}
 * @private
 */
anychart.core.gantt.Timeline.prototype.getSeparationLayer_ = function() {
  if (!this.separationLayer_) {
    this.separationLayer_ = /** @type {acgraph.vector.Layer} */ (acgraph.layer());
    this.registerDisposable(this.separationLayer_);
  }
  return this.separationLayer_;
};


/**
 * Inner getter for this.dataLayer_.
 * @return {anychart.core.utils.TypedLayer}
 * @private
 */
anychart.core.gantt.Timeline.prototype.getDataLayer_ = function() {
  if (!this.dataLayer_) {
    this.dataLayer_ = new anychart.core.utils.TypedLayer(function() {
      return acgraph.path();
    }, function(child) {
      (/** @type {acgraph.vector.Path} */ (child)).fill(null).stroke(null).clear();
    });
    this.registerDisposable(this.dataLayer_);
  }
  return this.dataLayer_;
};


/**
 * Inner labels factory getter.
 * @return {anychart.core.ui.LabelsFactory}
 * @private
 */
anychart.core.gantt.Timeline.prototype.getLabelsFactory_ = function() {
  if (!this.labelsFactory_) {
    this.labelsFactory_ = new anychart.core.ui.LabelsFactory();
    this.labelsFactory_
        .zIndex(anychart.core.gantt.Timeline.LABEL_Z_INDEX)
        .anchor(anychart.enums.Anchor.LEFT_CENTER)
        .position(anychart.enums.Position.RIGHT_CENTER)
        .padding(3, 10)
        .container(this.getBase_());
  }
  return this.labelsFactory_;
};


/**
 * Inner getter for markers factory.
 * @return {anychart.core.ui.MarkersFactory}
 * @private
 */
anychart.core.gantt.Timeline.prototype.getMarkersFactory_ = function() {
  if (!this.markersFactory_) {
    this.markersFactory_ = new anychart.core.ui.MarkersFactory();
    this.markersFactory_
        .container(this.getBase_())
        .anchor(anychart.enums.Anchor.CENTER_TOP)
        .zIndex(anychart.core.gantt.Timeline.MARKER_Z_INDEX)
        .enabled(true)
        .type(anychart.enums.MarkerType.STAR4);
  }
  return this.markersFactory_;
};


/**
 * Inner getter for this.base_.
 * @return {acgraph.vector.Layer}
 * @private
 */
anychart.core.gantt.Timeline.prototype.getBase_ = function() {
  if (!this.base_) {
    this.base_ = /** @type {acgraph.vector.Layer} */ (acgraph.layer());
    this.registerDisposable(this.base_);
  }
  return this.base_;
};


/**
 * Turns a numeric value to its integral part plus 0.5, method is used to fix a pixel coordinates to avoid a slim line blurring.
 * NOTE: For 1px line only!
 *
 * @param {number} actualPx - Actual pixel coordinate.
 * @return {number} - Value for not blurred line.
 */
anychart.core.gantt.Timeline.prototype.halfPixel = function(actualPx) {
  return (acgraph.type() === acgraph.StageType.SVG) ? (Math.floor(actualPx) + .5) : Math.floor(actualPx);
};


/**
 * Draws cells depending on data.
 * @private
 */
anychart.core.gantt.Timeline.prototype.drawRowFills_ = function() {
  var headerHeight = this.header_.getPixelBounds().height;
  var totalTop = /** @type {number} */ (this.pixelBoundsCache_.top + headerHeight + anychart.core.ui.DataGrid.ROW_SPACE - this.verticalOffset_);

  this.getEvenPath_().clear();
  this.getOddPath_().clear();
  for (var i = this.startIndex_; i <= this.endIndex_; i++) {
    var item = this.visibleItems_[i];
    if (!item) break;

    var height = anychart.core.gantt.Controller.getItemHeight(item);

    var path = i % 2 ? this.oddPath_ : this.evenPath_;

    var newTop = /** @type {number} */ (totalTop + height);
    path
        .moveTo(this.pixelBoundsCache_.left, totalTop)
        .lineTo(this.pixelBoundsCache_.left + this.pixelBoundsCache_.width, totalTop)
        .lineTo(this.pixelBoundsCache_.left + this.pixelBoundsCache_.width, newTop)
        .lineTo(this.pixelBoundsCache_.left, newTop)
        .close();

    totalTop = (newTop + anychart.core.ui.DataGrid.ROW_SPACE);
  }
};


/**
 * Draws timeline bars.
 * @private
 */
anychart.core.gantt.Timeline.prototype.drawTimelineElements_ = function() {
  this.getDataLayer_().clear();
  this.getLabelsFactory_().clear();
  this.getMarkersFactory_().clear();

  if (this.isResourceChart_) {
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
 * @param {anychart.enums.GanttDataFields=} opt_field - Field that contains a setting for fill, stroke, labels and markers.
 * @return {!acgraph.vector.Element} - Bar itself.
 * @private
 */
anychart.core.gantt.Timeline.prototype.drawBar_ = function(bounds, item, opt_field) {
  var isTreeDataItem = item instanceof anychart.data.Tree.DataItem; //If item is tree data item. Else: item is period (raw object).

  var zIndex, defaultFill, defaultStroke;

  switch (opt_field) {
    case anychart.enums.GanttDataFields.BASELINE:
      zIndex = anychart.core.gantt.Timeline.BASELINE_Z_INDEX;
      defaultFill = this.baselineFill_;
      defaultStroke = this.baselineStroke_;
      break;
    case anychart.enums.GanttDataFields.PROGRESS:
      zIndex = anychart.core.gantt.Timeline.PROGRESS_Z_INDEX;
      defaultFill = this.progressFill_;
      defaultStroke = this.progressStroke_;
      break;
    default:
      zIndex = anychart.core.gantt.Timeline.BASE_Z_INDEX;
      var isParent = (isTreeDataItem && item.numChildren());
      //Milestone is not bar, so it doesn't use drawBar_ method.
      defaultFill = isParent ? this.parentFill_ : this.baseFill_;
      defaultStroke = isParent ? this.parentStroke_ : this.baseStroke_;
  }

  var bar = this.getDataLayer_().genNextChild();

  bar
      .zIndex(zIndex)
      .moveTo(bounds.left, bounds.top)
      .lineTo(bounds.left + bounds.width, bounds.top)
      .lineTo(bounds.left + bounds.width, bounds.top + bounds.height)
      .lineTo(bounds.left, bounds.top + bounds.height)
      .close();

  var settings;
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

  if (settings) {
    var rawLabel = settings[anychart.enums.GanttDataFields.LABEL];
    if (rawLabel) {
      var position = rawLabel['position'] || this.getLabelsFactory_().position();
      position = anychart.enums.normalizeAnchor(position);
      var positionProvider = {'value': anychart.utils.getCoordinateByAnchor(bounds, position)};
      var textValue = rawLabel['value'] || ''; //TODO (A.Kudryavtsev): Тут неясно. Для LF текст берется из провайдера. В гантах надо задавать текст в данных.
      var formatProvider = {'value': textValue};
      var label = this.getLabelsFactory_().add(formatProvider, positionProvider);
      label.deserialize(rawLabel);
    }

    var rawStartMarker = settings[anychart.enums.GanttDataFields.START_MARKER];
    if (rawStartMarker) {
      var startMarker = this.getMarkersFactory_().add({value: {x: bounds.left, y: bounds.top}});
      startMarker
          .size(bounds.height / 2)
          .deserialize(rawStartMarker);
    }

    var rawEndMarker = settings[anychart.enums.GanttDataFields.END_MARKER];
    if (rawEndMarker) {
      var endMarker = this.getMarkersFactory_().add({value: {x: bounds.left + bounds.width, y: bounds.top}});
      endMarker
          .size(bounds.height / 2)
          .deserialize(rawEndMarker);
    }

    var fill = goog.isDef(settings[anychart.enums.GanttDataFields.FILL]) ?
        acgraph.vector.normalizeFill(settings[anychart.enums.GanttDataFields.FILL]) :
        defaultFill;

    var stroke = goog.isDef(settings[anychart.enums.GanttDataFields.STROKE]) ?
        acgraph.vector.normalizeFill(settings[anychart.enums.GanttDataFields.STROKE]) :
        defaultStroke;

    bar.fill(fill).stroke(stroke);
  } else { //Default coloring.
    bar.fill(defaultFill).stroke(defaultStroke);
  }

  return bar;
};


/**
 * Internal resource timeline drawer.
 * @private
 */
anychart.core.gantt.Timeline.prototype.drawResourceTimeline_ = function() {
  var headerHeight = this.header_.getPixelBounds().height;
  var totalTop = /** @type {number} */ (this.pixelBoundsCache_.top + headerHeight + anychart.core.ui.DataGrid.ROW_SPACE - this.verticalOffset_);
  for (var i = this.startIndex_; i <= this.endIndex_; i++) {
    var item = this.visibleItems_[i];
    if (!item) break;

    var itemHeight = anychart.core.gantt.Controller.getItemHeight(item);
    var newTop = /** @type {number} */ (totalTop + itemHeight);

    this.drawAsPeriods_(item, totalTop, itemHeight);

    totalTop = (newTop + anychart.core.ui.DataGrid.ROW_SPACE);
  }
};


/**
 * Internal project timeline drawer.
 * @private
 */
anychart.core.gantt.Timeline.prototype.drawProjectTimeline_ = function() {
  var headerHeight = this.header_.getPixelBounds().height;
  var totalTop = /** @type {number} */ (this.pixelBoundsCache_.top + headerHeight + anychart.core.ui.DataGrid.ROW_SPACE - this.verticalOffset_);
  for (var i = this.startIndex_; i <= this.endIndex_; i++) {
    var item = this.visibleItems_[i];
    if (!item) break;

    var itemHeight = anychart.core.gantt.Controller.getItemHeight(item);
    var newTop = /** @type {number} */ (totalTop + itemHeight);

    var actualStart = item.get(anychart.enums.GanttDataFields.ACTUAL_START);
    var actualEnd = item.get(anychart.enums.GanttDataFields.ACTUAL_END);
    if (goog.isDefAndNotNull(actualEnd) && (actualEnd != actualStart)) {
      var baselineStart = item.get(anychart.enums.GanttDataFields.BASELINE_START);
      var baselineEnd = item.get(anychart.enums.GanttDataFields.BASELINE_END);

      if (goog.isDefAndNotNull(baselineStart) && goog.isDefAndNotNull(baselineEnd)) {
        this.drawAsBaseline_(item, totalTop, itemHeight);
      } else {
        if (item.numChildren()) {
          this.drawAsParent_(item, totalTop, itemHeight);
        } else {
          this.drawAsProgress_(item, totalTop, itemHeight);
        }
      }
    } else {
      this.drawAsMilestone_(item, totalTop, itemHeight);
    }

    totalTop = (newTop + anychart.core.ui.DataGrid.ROW_SPACE);
  }
};


/**
 * Draws data item as periods.
 * @param {anychart.data.Tree.DataItem} dataItem - Current tree data item.
 * @param {number} totalTop - Pixel value of total top. Is needed to place item correctly.
 * @param {number} itemHeight - Height of row.
 * @private
 */
anychart.core.gantt.Timeline.prototype.drawAsPeriods_ = function(dataItem, totalTop, itemHeight) {
  var periods = /** @type {Array.<Object>} */(dataItem.get(anychart.enums.GanttDataFields.PERIODS));
  if (periods) {
    for (var j = 0; j < periods.length; j++) {
      var period = periods[j];
      var start = period[anychart.enums.GanttDataFields.START];
      var end = period[anychart.enums.GanttDataFields.END];
      var startRatio = this.scale_.timestampToRatio(start);
      var endRatio = this.scale_.timestampToRatio(end);

      if (endRatio > 0 && startRatio < 1) { //Is visible
        var left = this.halfPixel(this.pixelBoundsCache_.left + this.pixelBoundsCache_.width * startRatio);
        var right = this.halfPixel(this.pixelBoundsCache_.left + this.pixelBoundsCache_.width * endRatio);
        var height = Math.round(itemHeight * anychart.core.gantt.Timeline.DEFAULT_HEIGHT_REDUCTION);
        var top = this.halfPixel(totalTop + (itemHeight - height) / 2);
        var bar = this.drawBar_(new anychart.math.Rect(left, top, (right - left), height), period);

        var fill = goog.isDef(period[anychart.enums.GanttDataFields.FILL]) ?
            acgraph.vector.normalizeFill(period[anychart.enums.GanttDataFields.FILL]) :
            this.baseFill_;

        var stroke = goog.isDef(period[anychart.enums.GanttDataFields.STROKE]) ?
            acgraph.vector.normalizeFill(period[anychart.enums.GanttDataFields.STROKE]) :
            this.baseStroke_;

        bar.fill(fill).stroke(stroke);
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
anychart.core.gantt.Timeline.prototype.drawAsBaseline_ = function(dataItem, totalTop, itemHeight) {

};


/**
 * Draws data item as parent.
 * @param {anychart.data.Tree.DataItem} dataItem - Current tree data item.
 * @param {number} totalTop - Pixel value of total top. Is needed to place item correctly.
 * @param {number} itemHeight - Height of row.
 * @private
 */
anychart.core.gantt.Timeline.prototype.drawAsParent_ = function(dataItem, totalTop, itemHeight) {
  var actualStart = dataItem.get(anychart.enums.GanttDataFields.ACTUAL_START);
  var actualEnd = dataItem.get(anychart.enums.GanttDataFields.ACTUAL_END);
  var startRatio = this.scale_.timestampToRatio(actualStart);
  var endRatio = this.scale_.timestampToRatio(actualEnd);

  if (endRatio > 0 && startRatio < 1) { //Is visible
    var left = this.halfPixel(this.pixelBoundsCache_.left + this.pixelBoundsCache_.width * startRatio);
    var right = this.halfPixel(this.pixelBoundsCache_.left + this.pixelBoundsCache_.width * endRatio);
    var top = this.halfPixel(totalTop + itemHeight * (1 - anychart.core.gantt.Timeline.DEFAULT_HEIGHT_REDUCTION) / 2);
    var height = Math.round(itemHeight * anychart.core.gantt.Timeline.PARENT_HEIGHT_REDUCTION);

    this.drawBar_(new anychart.math.Rect(left, top, (right - left), height), dataItem, anychart.enums.GanttDataFields.ACTUAL);

    var progressHeight = Math.round(height * anychart.core.gantt.Timeline.PROGRESS_HEIGHT_REDUCTION);
    var progressTop = this.halfPixel(top + (height - progressHeight) / 2);

    var progressValue = parseFloat(dataItem.get(anychart.enums.GanttDataFields.PROGRESS_VALUE));
    if (progressValue) { //Draw progress.
      var progressWidth = Math.round(progressValue * (right - left) / 100);
      this.drawBar_(new anychart.math.Rect(left, progressTop, progressWidth, progressHeight), dataItem, anychart.enums.GanttDataFields.PROGRESS);
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
anychart.core.gantt.Timeline.prototype.drawAsProgress_ = function(dataItem, totalTop, itemHeight) {
  var actualStart = dataItem.get(anychart.enums.GanttDataFields.ACTUAL_START);
  var actualEnd = dataItem.get(anychart.enums.GanttDataFields.ACTUAL_END);
  var startRatio = this.scale_.timestampToRatio(actualStart);
  var endRatio = this.scale_.timestampToRatio(actualEnd);

  if (endRatio > 0 && startRatio < 1) { //Is visible
    var left = this.halfPixel(this.pixelBoundsCache_.left + this.pixelBoundsCache_.width * startRatio);
    var right = this.halfPixel(this.pixelBoundsCache_.left + this.pixelBoundsCache_.width * endRatio);
    var height = Math.round(itemHeight * anychart.core.gantt.Timeline.DEFAULT_HEIGHT_REDUCTION);
    var top = this.halfPixel(totalTop + (itemHeight - height) / 2);

    this.drawBar_(new anychart.math.Rect(left, top, (right - left), height), dataItem, anychart.enums.GanttDataFields.ACTUAL);

    var progressHeight = Math.round(height * anychart.core.gantt.Timeline.PROGRESS_HEIGHT_REDUCTION);
    var progressTop = this.halfPixel(top + (height - progressHeight) / 2);
    var progressValue = parseFloat(dataItem.get(anychart.enums.GanttDataFields.PROGRESS_VALUE));

    if (progressValue) { //Draw progress.
      var progressWidth = Math.round(progressValue * (right - left) / 100);
      this.drawBar_(new anychart.math.Rect(left, progressTop, progressWidth, progressHeight), dataItem, anychart.enums.GanttDataFields.PROGRESS);
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
anychart.core.gantt.Timeline.prototype.drawAsMilestone_ = function(dataItem, totalTop, itemHeight) {
  var actualStart = dataItem.get(anychart.enums.GanttDataFields.ACTUAL_START);
  var ratio = this.scale_.timestampToRatio(actualStart);
  if (ratio >= 0 && ratio <= 1) { //Is visible
    var halfHeight = Math.round(itemHeight * anychart.core.gantt.Timeline.DEFAULT_HEIGHT_REDUCTION / 2);
    var centerLeft = this.halfPixel(this.pixelBoundsCache_.left + this.pixelBoundsCache_.width * ratio);
    var centerTop = this.halfPixel(totalTop + itemHeight / 2);

    var milestone = this.getDataLayer_().genNextChild();

    milestone
        .zIndex(anychart.core.gantt.Timeline.BASE_Z_INDEX)
        .moveTo(centerLeft - halfHeight, centerTop) //left corner
        .lineTo(centerLeft, centerTop - halfHeight) //top corner
        .lineTo(centerLeft + halfHeight, centerTop) //right corner
        .lineTo(centerLeft, centerTop + halfHeight) //bottom corner
        .close();

    var settings = dataItem.get(anychart.enums.GanttDataFields.MILESTONE);
    if (settings) {
      var fill = goog.isDef(settings[anychart.enums.GanttDataFields.FILL]) ?
          acgraph.vector.normalizeFill(settings[anychart.enums.GanttDataFields.FILL]) :
          this.milestoneFill_;

      var stroke = goog.isDef(settings[anychart.enums.GanttDataFields.STROKE]) ?
          acgraph.vector.normalizeStroke(settings[anychart.enums.GanttDataFields.STROKE]) :
          this.milestoneStroke_;

      var rawLabel = settings[anychart.enums.GanttDataFields.LABEL];
      if (rawLabel) {
        var bounds = new acgraph.math.Rect(centerLeft, centerTop, (halfHeight + halfHeight), (halfHeight + halfHeight));
        var position = rawLabel['position'] || this.getLabelsFactory_().position();
        position = anychart.enums.normalizeAnchor(position);
        var positionProvider = {'value': anychart.utils.getCoordinateByAnchor(bounds, position)};
        var textValue = rawLabel['value'] || ''; //TODO (A.Kudryavtsev): Тут неясно. Для LF текст берется из провайдера. В гантах надо задавать текст в данных.
        var formatProvider = {'value': textValue};
        var label = this.getLabelsFactory_().add(formatProvider, positionProvider);
        label.deserialize(rawLabel);
      }

      milestone.fill(fill).stroke(stroke);
    } else {
      milestone.fill(this.milestoneFill_).stroke(this.milestoneStroke_);
    }

  }
};


/**
 * Draws connectors.
 * @private
 */
anychart.core.gantt.Timeline.prototype.drawConnectors_ = function() {
  var connectorsData = this.controller_.getConnectorsData();
  var headerHeight = this.header_.getPixelBounds().height;
  var totalTop = /** @type {number} */ (this.pixelBoundsCache_.top + headerHeight + anychart.core.ui.DataGrid.ROW_SPACE);

  var l = connectorsData.length;
  var connData, connType;

  var map = this.isResourceChart_ ? this.controller_.getPeriodsMap() : this.controller_.getVisibleItemsMap();
  while (l--) {
    connData = connectorsData[l];
    var to = connData['to'];
    if (goog.isString(to)) to = map[to]; //destination becomes an object instead of string.

    if (to) {
      connData['to'] = to; //Replacing a string record with link to object for further connectors draw cycles.
      var from = connData['from'];
      connType = connData['type'];

      //Here 'to' is {'item':period, 'index':index} or {'period':period, 'index':index}. 'from' is as well.
      var fromIndex = from['index'];
      var toIndex = to['index'];

      var heightCache = this.controller_.getHeightCache();

      //relativeHeight in this case is height of rows hidden over the top line of visible area (this.pixelBoundsCache_)
      var relativeHeight = this.startIndex_ ? heightCache[this.startIndex_ - 1] : 0;
      relativeHeight += this.verticalOffset_;

      var startItem = this.visibleItems_[fromIndex];
      var endItem = this.visibleItems_[toIndex];

      //Lines below turn heights got from controller to Y-coordinates on screen.
      var relativeFromTop = fromIndex ? heightCache[fromIndex - 1] : 0;
      var relativeToTop = toIndex ? heightCache[toIndex - 1] : 0;
      var actualFromTop = (relativeFromTop - relativeHeight) + totalTop;
      var actualToTop = (relativeToTop - relativeHeight) + totalTop;
      var fromRowHeight = anychart.core.gantt.Controller.getItemHeight(startItem);
      var toRowHeight = anychart.core.gantt.Controller.getItemHeight(endItem);

      var fromStartTimestamp = this.isResourceChart_ ?
          from['period'][anychart.enums.GanttDataFields.ACTUAL_START] :
          from['item'].get(anychart.enums.GanttDataFields.ACTUAL_START);

      var fromEndTimestamp = this.isResourceChart_ ?
          from['period'][anychart.enums.GanttDataFields.ACTUAL_END] :
          from['item'].get(anychart.enums.GanttDataFields.ACTUAL_END);

      var toStartTimestamp = this.isResourceChart_ ?
          to['period'][anychart.enums.GanttDataFields.ACTUAL_START] :
          to['item'].get(anychart.enums.GanttDataFields.ACTUAL_START);

      var toEndTimestamp = this.isResourceChart_ ?
          to['period'][anychart.enums.GanttDataFields.ACTUAL_END] :
          to['item'].get(anychart.enums.GanttDataFields.ACTUAL_END);

      fromEndTimestamp = fromEndTimestamp || fromStartTimestamp; //Milestone.
      toEndTimestamp = toEndTimestamp || fromStartTimestamp; //Milestone.

      var fromMilestoneHalfWidth = 0;
      var toMilestoneHalfWidth = 0;
      if (!fromEndTimestamp || fromStartTimestamp == fromEndTimestamp) {
        fromEndTimestamp = fromStartTimestamp;
        fromMilestoneHalfWidth = fromRowHeight * anychart.core.gantt.Timeline.DEFAULT_HEIGHT_REDUCTION / 2;
      }

      if (!toEndTimestamp || toStartTimestamp == toEndTimestamp) {
        toEndTimestamp = toStartTimestamp;
        toMilestoneHalfWidth = toRowHeight * anychart.core.gantt.Timeline.DEFAULT_HEIGHT_REDUCTION / 2;
      }

      var fromLeft = this.scale_.timestampToRatio(fromStartTimestamp) * this.pixelBoundsCache_.width +
          this.pixelBoundsCache_.left - fromMilestoneHalfWidth;
      var fromRight = this.scale_.timestampToRatio(fromEndTimestamp) * this.pixelBoundsCache_.width +
          this.pixelBoundsCache_.left + fromMilestoneHalfWidth;
      var toLeft = this.scale_.timestampToRatio(toStartTimestamp) * this.pixelBoundsCache_.width +
          this.pixelBoundsCache_.left - toMilestoneHalfWidth;
      var toRight = this.scale_.timestampToRatio(toEndTimestamp) * this.pixelBoundsCache_.width +
          this.pixelBoundsCache_.left + toMilestoneHalfWidth;

      var fill, stroke, connSettings;

      connSettings = this.isResourceChart_ ?
          from['period'][anychart.enums.GanttDataFields.CONNECTOR] :
          from['item'].get(anychart.enums.GanttDataFields.CONNECTOR);

      fill = (connSettings && connSettings[anychart.enums.GanttDataFields.FILL]) ?
          acgraph.vector.normalizeFill(connSettings[anychart.enums.GanttDataFields.FILL]) :
          this.connectorFill_;

      stroke = (connSettings && connSettings[anychart.enums.GanttDataFields.STROKE]) ?
          acgraph.vector.normalizeStroke(connSettings[anychart.enums.GanttDataFields.FILL]) :
          this.connectorStroke_;

      this.drawConnector_(
          new anychart.math.Rect(fromLeft, actualFromTop, (fromRight - fromLeft), fromRowHeight),
          new anychart.math.Rect(toLeft, actualToTop, (toRight - toLeft), toRowHeight),
          connType, /** @type {acgraph.vector.Fill} */ (fill), /** @type {acgraph.vector.Stroke} */ (stroke));

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
 * @private
 */
anychart.core.gantt.Timeline.prototype.drawConnector_ = function(fromBounds, toBounds, connType, fill, stroke) {
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


  var fromLeft, fromTop, toLeft, toTop, orientation;
  var am = anychart.core.gantt.Timeline.ARROW_MARGIN;
  var as = anychart.core.gantt.Timeline.ARROW_SIZE;
  var path = null;
  var arrow = null;
  var segmentLeft0, segmentLeft1; //Util variables, temporary segment X-coordinate storage.
  var segmentTop0; //Util variable, temporary segment Y-coordinate storage.
  var aboveSequence = true; //If 'from' bar is above the 'to' bar.

  switch ((connType + '').toLowerCase()) {
    case anychart.enums.ConnectorType.FINISH_FINISH:
      fromLeft = this.halfPixel(fromBounds.left + fromBounds.width);
      fromTop = this.halfPixel(fromBounds.top + fromBounds.height / 2);
      toLeft = this.halfPixel(toBounds.left + toBounds.width);
      toTop = this.halfPixel(toBounds.top + toBounds.height / 2);
      orientation = anychart.enums.Orientation.LEFT;

      if (fromBounds.top == toBounds.top) { //Same line
        path = this.drawSegment_(fromLeft, fromTop, toLeft, toTop, path);
        if (fromLeft > toLeft) orientation = anychart.enums.Orientation.RIGHT;
      } else {
        segmentLeft0 = Math.max(fromLeft + as + am, toLeft + as + am);
        path = this.drawSegment_(fromLeft, fromTop, segmentLeft0, fromTop, path);
        path = this.drawSegment_(segmentLeft0, fromTop, segmentLeft0, toTop, path);
        path = this.drawSegment_(segmentLeft0, toTop, toLeft, toTop, path);
      }
      arrow = this.drawArrow_(toLeft, toTop, orientation);
      break;

    case anychart.enums.ConnectorType.START_FINISH:
      fromLeft = this.halfPixel(fromBounds.left);
      fromTop = this.halfPixel(fromBounds.top + fromBounds.height / 2);
      toLeft = this.halfPixel(toBounds.left + toBounds.width);
      toTop = this.halfPixel(toBounds.top + toBounds.height / 2);
      orientation = anychart.enums.Orientation.LEFT;

      if (fromLeft - am - am - as > toLeft) {
        segmentLeft0 = toLeft + am + as;
        path = this.drawSegment_(fromLeft, fromTop, segmentLeft0, fromTop, path);
        path = this.drawSegment_(segmentLeft0, fromTop, segmentLeft0, toTop, path);
        path = this.drawSegment_(segmentLeft0, toTop, toLeft, toTop, path);
      } else {
        aboveSequence = toBounds.top >= fromBounds.top;

        segmentLeft0 = this.halfPixel(fromLeft - am);
        segmentLeft1 = this.halfPixel(toLeft + am + as);
        segmentTop0 = this.halfPixel(aboveSequence ? toBounds.top : toBounds.top + toBounds.height);

        path = this.drawSegment_(fromLeft, fromTop, segmentLeft0, fromTop, path);
        path = this.drawSegment_(segmentLeft0, fromTop, segmentLeft0, segmentTop0, path);
        path = this.drawSegment_(segmentLeft0, segmentTop0, segmentLeft1, segmentTop0, path);
        path = this.drawSegment_(segmentLeft1, segmentTop0, segmentLeft1, toTop, path);
        path = this.drawSegment_(segmentLeft1, toTop, toLeft, toTop, path);

      }

      //TODO (A.Kudryavtsev): Test this behaviour carefully.
      arrow = this.drawArrow_(toLeft, toTop, orientation);

      break;

    case anychart.enums.ConnectorType.START_START:
      fromLeft = this.halfPixel(fromBounds.left);
      fromTop = this.halfPixel(fromBounds.top + fromBounds.height / 2);
      toLeft = this.halfPixel(toBounds.left);
      toTop = this.halfPixel(toBounds.top + toBounds.height / 2);
      orientation = anychart.enums.Orientation.RIGHT;

      if (fromBounds.top == toBounds.top) { //Same line
        path = this.drawSegment_(fromLeft, fromTop, toLeft, toTop, path);
        if (fromLeft > toLeft) orientation = anychart.enums.Orientation.LEFT;
      } else {
        segmentLeft0 = Math.min(fromLeft - as - am, toLeft - as - am);
        path = this.drawSegment_(fromLeft, fromTop, segmentLeft0, fromTop, path);
        path = this.drawSegment_(segmentLeft0, fromTop, segmentLeft0, toTop, path);
        path = this.drawSegment_(segmentLeft0, toTop, toLeft, toTop, path);
      }
      arrow = this.drawArrow_(toLeft, toTop, orientation);

      break;

    default: //anychart.enums.ConnectorType.FINISH_START:
      fromLeft = this.halfPixel(fromBounds.left + fromBounds.width);
      fromTop = this.halfPixel(fromBounds.top + fromBounds.height / 2);
      toLeft = this.halfPixel(toBounds.left);
      var extraEndY;

      if (toLeft >= fromLeft) {
        toLeft = this.halfPixel(Math.min(toLeft + am, toBounds.left + toBounds.width / 2));
        if (toBounds.top > fromBounds.top) {
          extraEndY = this.halfPixel(toBounds.top);
          path = this.drawSegment_(fromLeft, fromTop, toLeft, fromTop, path);
          path = this.drawSegment_(toLeft, fromTop, toLeft, extraEndY, path);
          arrow = this.drawArrow_(toLeft, extraEndY, anychart.enums.Orientation.BOTTOM);
        } else if (toBounds.top < fromBounds.top) {
          extraEndY = this.halfPixel(toBounds.top + toBounds.height);
          path = this.drawSegment_(fromLeft, fromTop, toLeft, fromTop, path);
          path = this.drawSegment_(toLeft, fromTop, toLeft, extraEndY, path);
          arrow = this.drawArrow_(toLeft, extraEndY, anychart.enums.Orientation.TOP);
        } else { //Same line
          toLeft = this.halfPixel(toBounds.left);
          toTop = this.halfPixel(toBounds.top + toBounds.height / 2);
          path = this.drawSegment_(fromLeft, fromTop, toLeft, toTop, path);
          arrow = this.drawArrow_(toLeft, toTop, anychart.enums.Orientation.RIGHT);
        }

      } else { //if toLeft < fromLeft
        extraEndY = this.halfPixel(toBounds.top + toBounds.height / 2);
        segmentTop0 = this.halfPixel((toBounds.top > fromBounds.top) ? toBounds.top : (toBounds.top + toBounds.height));
        segmentLeft0 = this.halfPixel(fromLeft + am);
        segmentLeft1 = this.halfPixel(toLeft - am - as);

        path = this.drawSegment_(fromLeft, fromTop, segmentLeft0, fromTop, path);
        path = this.drawSegment_(segmentLeft0, fromTop, segmentLeft0, segmentTop0, path);
        path = this.drawSegment_(segmentLeft0, segmentTop0, segmentLeft1, segmentTop0, path);
        path = this.drawSegment_(segmentLeft1, segmentTop0, segmentLeft1, extraEndY, path);
        path = this.drawSegment_(segmentLeft1, extraEndY, toLeft, extraEndY, path);

        arrow = this.drawArrow_(toLeft, extraEndY, anychart.enums.Orientation.RIGHT);
      }
  }

  if (path) path.stroke(/** @type {acgraph.vector.Stroke} */ (stroke));
  if (arrow) arrow.fill(/** @type {acgraph.vector.Fill} */ (fill)).stroke(/** @type {acgraph.vector.Stroke} */ (stroke));
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
anychart.core.gantt.Timeline.prototype.drawSegment_ = function(fromLeft, fromTop, toLeft, toTop, path) {
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
    path.lineTo(toLeft, toTop);
  } else {
    var left = Math.min(fromLeft, toLeft);
    var right = Math.max(fromLeft, toLeft);
    var top = Math.min(fromTop, toTop);
    var bottom = Math.max(fromTop, toTop);

    if (left < (this.pixelBoundsCache_.left + this.pixelBoundsCache_.width) &&
        right > this.pixelBoundsCache_.left &&
        top < (this.pixelBoundsCache_.top + this.pixelBoundsCache_.height) &&
        bottom > this.pixelBoundsCache_.top) { //Segment or the part of it is visible.

      path = /** @type {acgraph.vector.Path} */ (this.getDataLayer_().genNextChild());

      path
          .zIndex(anychart.core.gantt.Timeline.CONNECTOR_Z_INDEX)
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
 * @private
 * @return {acgraph.vector.Path} - Arrow path or null if path is not drawn.
 */
anychart.core.gantt.Timeline.prototype.drawArrow_ = function(left, top, orientation) {
  var path = null;

  /*
    TODO (A.Kudryavtsev): Change this algorithm like this:
    Now we can't see the part of an arrow. We must be able to see it. It means that we have to pre-calclate bounds of
    arrow to define if it crosses the visible area.
   */
  if (left >= this.pixelBoundsCache_.left &&
      left <= this.pixelBoundsCache_.left + this.pixelBoundsCache_.width &&
      top >= this.pixelBoundsCache_.top &&
      top <= this.pixelBoundsCache_.top + this.pixelBoundsCache_.height) { //Is in visible area.

    var as = anychart.core.gantt.Timeline.ARROW_SIZE;
    var left1 = 0;
    var top1 = 0;
    var left2 = 0;
    var top2 = 0;

    switch (orientation) {
      case anychart.enums.Orientation.LEFT:
        left = left + 1;
        left1 = left + as;
        top1 = top - as;
        left2 = left1;
        top2 = top + as;
        break;
      case anychart.enums.Orientation.TOP:
        top = top + 1;
        left1 = left - as;
        top1 = top + as;
        left2 = left + as;
        top2 = top1;
        break;
      case anychart.enums.Orientation.RIGHT:
        left = left - 1;
        left1 = left - as;
        top1 = top - as;
        left2 = left1;
        top2 = top + as;
        break;
      case anychart.enums.Orientation.BOTTOM:
        top = top - 1;
        left1 = left - as;
        top1 = top - as;
        left2 = left + as;
        top2 = top1;
        break;
    }

    path = /** @type {acgraph.vector.Path} */ (this.dataLayer_.genNextChild());
    path
        .zIndex(anychart.core.gantt.Timeline.ARROW_Z_INDEX)
        .moveTo(this.halfPixel(left), this.halfPixel(top))
        .lineTo(this.halfPixel(left1), this.halfPixel(top1))
        .lineTo(this.halfPixel(left2), this.halfPixel(top2))
        .close();

  }

  return path;
};


/**
 * Redraws vertical lines.
 * @param {Array.<number>} ticks - Ticks.
 * @private
 */
anychart.core.gantt.Timeline.prototype.drawLowTicks_ = function(ticks) {
  if (ticks.length) {
    var path = this.getSeparationPath_().clear();
    for (var i = 0, l = ticks.length - 1; i < l; i++) {
      var tick = ticks[i];
      var ratio = this.scale_.timestampToRatio(tick);
      var left = this.pixelBoundsCache_.left + this.pixelBoundsCache_.width * ratio;
      path
          .moveTo(left, this.pixelBoundsCache_.top)
          .lineTo(left, this.pixelBoundsCache_.top + this.pixelBoundsCache_.height);
    }
  }
};


/**
 * Draws timeline.
 * @return {anychart.core.gantt.Timeline}
 */
anychart.core.gantt.Timeline.prototype.draw = function() {
  this.controller_.run();
  return this;
};


/**
 * Draws visible items.
 * @param {Array.<anychart.data.Tree.DataItem>} visibleItems - Linear array of data items prepared to be displayed in data grid.
 * @param {number} startIndex - Start index of visible data items to be displayed in data grid.
 * @param {number} endIndex - End index of visible data items to be displayed in data grid.
 * @param {number} verticalOffset - Vertical offset.
 * @param {number} availableHeight - Available height.
 * @param {number} totalMin - Calculated total min timestamp..
 * @param {number} totalMax - Calculated total max timestamp..
 * @param {boolean=} opt_positionRecalculated - If there were changes and data grid must get invalidation state.
 * @return {anychart.core.gantt.Timeline} - Itself for method chaining.
 */
anychart.core.gantt.Timeline.prototype.drawInternal = function(visibleItems, startIndex, endIndex, verticalOffset, availableHeight, totalMin, totalMax, opt_positionRecalculated) {
  var gap = Math.round((totalMax - totalMin) / 100);
  this.scale_.setTotalRange(totalMin - gap, totalMax + gap);
  var redrawHeader = false;

  this.visibleItems_ = visibleItems;
  this.startIndex_ = startIndex;
  this.endIndex_ = endIndex;
  this.verticalOffset_ = verticalOffset;

  if (opt_positionRecalculated) this.invalidate(anychart.ConsistencyState.POSITION);

  if (this.checkDrawingNeeded()) {
    var container = /** @type {acgraph.vector.ILayer} */(this.container());
    var stage = container ? container.getStage() : null;
    var manualSuspend = stage && !stage.isSuspended();
    if (manualSuspend) stage.suspend();


    //Ensure DOM structure is created.
    if (!this.getBase_().numChildren()) {
      this.bgRect_ = this.getBase_().rect();
      this.bgRect_.fill(this.backgroundFill_).stroke(null);

      this.getBase_()
          .addChild(/** @type {!acgraph.vector.Layer} */ (this.getCellsLayer_()))
          .addChild(/** @type {!acgraph.vector.Layer} */ (this.getSeparationLayer_()))
          .addChild(/** @type {!acgraph.vector.Layer} */ (this.getDataLayer_()));

      this.header_.container(this.getBase_());

      this.separationPath_ = this.getSeparationLayer_().path();
      this.separationPath_.stroke('#dedede'); //TODO (A.Kudryavtsev): In current version it is not settable, that's why we color it here but not in APPEARANCE.

      var range = Math.round((totalMax - totalMin) / 10);
      this.scale_.setRange(totalMin - gap, totalMin + range); // Initial visible range: 10% of total range.
    }

    if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
      this.getBase_().parent(container);
      this.markConsistent(anychart.ConsistencyState.CONTAINER);
    }

    if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
      this.pixelBoundsCache_ = /** @type {acgraph.math.Rect} */ (this.getPixelBounds());

      var headerHeight = this.pixelBoundsCache_.height - availableHeight;
      this.header_.bounds().set(this.pixelBoundsCache_.left, this.pixelBoundsCache_.top, this.pixelBoundsCache_.width, headerHeight);
      redrawHeader = true;

      this.getBase_().clip(/** @type {acgraph.math.Rect} */ (this.pixelBoundsCache_));
      this.bgRect_.setBounds(/** @type {acgraph.math.Rect} */ (this.pixelBoundsCache_));
      this.markConsistent(anychart.ConsistencyState.BOUNDS);
    }

    if (this.hasInvalidationState(anychart.ConsistencyState.SCALES)) {
      //TODO (A.Kudryavtsev): Redraw all.
      redrawHeader = true;
      this.markConsistent(anychart.ConsistencyState.SCALES);
    }

    if (redrawHeader) {
      this.header_.invalidate(anychart.ConsistencyState.SCALES);
      this.header_.draw();
      var ticks = this.header_.getLowLevel().getTicks();
      this.drawLowTicks_(ticks);

      var totalRange = this.scale_.getTotalRange();
      var visibleRange = this.scale_.getRange();
      var contentBoundsSimulation = new acgraph.math.Rect(totalRange['min'], 0, totalRange['max'] - totalRange['min'], 0);
      var visibleBoundsSimulation = new acgraph.math.Rect(visibleRange['min'], 0, visibleRange['max'] - visibleRange['min'], 0);
      this.horizontalScrollBar_
          .suspendSignalsDispatching()
          .handlePositionChange(false)
          .contentBounds(contentBoundsSimulation)
          .visibleBounds(visibleBoundsSimulation)
          .draw()
          .handlePositionChange(true)
          .resumeSignalsDispatching(false);

    }

    if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
      this.bgRect_.fill(this.backgroundFill_);
      this.getOddPath_().fill(this.cellOddFill_ || this.cellFill_);
      this.getEvenPath_().fill(this.cellEvenFill_ || this.cellFill_);


      this.markConsistent(anychart.ConsistencyState.APPEARANCE);
    }

    var redrawPosition = false;

    if (this.hasInvalidationState(anychart.ConsistencyState.POSITION)) {
      redrawPosition = true;
      this.markConsistent(anychart.ConsistencyState.POSITION);
    }

    if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
      this.getBase_().zIndex(/** @type {number} */ (this.zIndex()));
      this.markConsistent(anychart.ConsistencyState.Z_INDEX);
    }

    if (redrawHeader || redrawPosition) {
      this.drawRowFills_();
      this.drawTimelineElements_();
    }


    if (manualSuspend) stage.resume();

  }

  return this;
};


/**
 * Generates horizontal scroll bar.
 * @return {anychart.core.ui.ScrollBar} - Scroll bar.
 */
anychart.core.gantt.Timeline.prototype.getScrollBar = function() {
  if (!this.horizontalScrollBar_) {
    this.horizontalScrollBar_ = new anychart.core.ui.ScrollBar();
    this.horizontalScrollBar_.layout(anychart.enums.Layout.HORIZONTAL);

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



//exports
anychart.core.gantt.Timeline.prototype['cellOddFill'] = anychart.core.gantt.Timeline.prototype.cellOddFill;
anychart.core.gantt.Timeline.prototype['cellEvenFill'] = anychart.core.gantt.Timeline.prototype.cellEvenFill;
anychart.core.gantt.Timeline.prototype['cellFill'] = anychart.core.gantt.Timeline.prototype.cellFill;
anychart.core.gantt.Timeline.prototype['backgroundFill'] = anychart.core.gantt.Timeline.prototype.backgroundFill;
