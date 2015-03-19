goog.provide('anychart.core.gantt.Timeline');

goog.require('anychart.core.VisualBaseWithBounds');
goog.require('anychart.core.gantt.TimelineHeader');
goog.require('anychart.core.ui.LabelsFactory');
goog.require('anychart.core.ui.MarkersFactory');
goog.require('anychart.core.ui.ScrollBar');
goog.require('anychart.core.ui.Tooltip');
goog.require('anychart.core.utils.TypedLayer');
goog.require('anychart.scales.GanttDateTime');

goog.require('goog.array');
goog.require('goog.events');
goog.require('goog.events.MouseWheelHandler');



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
   * Mouse wheel handler object.
   * @type {goog.events.MouseWheelHandler}
   * @private
   */
  this.mwh_ = null;


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
   * Hover path.
   * @type {acgraph.vector.Path}
   * @private
   */
  this.hoverPath_ = null;

  /**
   * Selected row path.
   * @type {acgraph.vector.Path}
   * @private
   */
  this.selectedPath_ = null;

  /**
   * Odd fill.
   * @type {?acgraph.vector.Fill}
   * @private
   */
  this.rowOddFill_ = acgraph.vector.normalizeFill('#fff');

  /**
   * Even fill.
   * @type {?acgraph.vector.Fill}
   * @private
   */
  this.rowEvenFill_ = acgraph.vector.normalizeFill('#fafafa');

  /**
   * Default rows fill.
   * @type {acgraph.vector.Fill}
   * @private
   */
  this.rowFill_ = acgraph.vector.normalizeFill('#fff');

  /**
   * Default hover fill.
   * @type {acgraph.vector.Fill}
   * @private
   */
  this.hoverFill_ = acgraph.vector.normalizeFill('#edf8ff');

  /**
   * Default row selected fill.
   * @type {acgraph.vector.Fill}
   * @private
   */
  this.rowSelectedFill_ = acgraph.vector.normalizeFill('#d2eafa');

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
  this.baselineFill_ = acgraph.vector.normalizeFill(['#E1E1E1', '#A1A1A1'], -90);

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
   * Selected element fill.
   * @type {acgraph.vector.Fill}
   * @private
   */
  this.selectedElementFill_ = acgraph.vector.normalizeFill(['#f1b8b9', '#f07578'], -90);


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
   * Contains the sequence of heights of grid. Used to quickly calculate this.hoveredIndex_ on mouse over event
   * for row highlighting purposes.
   * @type {Array.<number>}
   * @private
   */
  this.gridHeightCache_ = [];

  /**
   * Index of currently hovered row.
   * @type {number|undefined}
   * @private
   */
  this.hoveredIndex_ = -1;

  /**
   * Currently selected data item.
   * @type {anychart.data.Tree.DataItem}
   * @private
   */
  this.selectedItem_ = null;

  /**
   * Selected period.
   * @type {string}
   * @private
   */
  this.selectedPeriodId_ = '';

  /**
   * Vertical upper coordinate (top) of highlighted row.
   * @type {number|undefined}
   * @private
   */
  this.hoverStartY_ = 0;

  /**
   * Vertical lower coordinate (top + height) of highlighted row.
   * @type {number|undefined}
   * @private
   */
  this.hoverEndY_ = 0;

  /**
   * Timeline tooltip.
   * @type {anychart.core.ui.Tooltip}
   * @private
   */
  this.tooltip_ = null;


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
  this.header_.zIndex(anychart.core.gantt.Timeline.HEADER_Z_INDEX);
  this.header_.resumeSignalsDispatching(false);
  this.registerDisposable(this.header_);


  var tooltip = /** @type {anychart.core.ui.Tooltip} */(this.tooltip());
  tooltip.suspendSignalsDispatching();
  tooltip.isFloating(true);
  tooltip.anchor(anychart.enums.Anchor.LEFT_TOP);
  tooltip.content().hAlign(anychart.enums.Align.LEFT);
  tooltip.contentFormatter(function(data) {
    /*
      Argument data is an instance of TreeDataItem (ProjectChart) or an object like this (ResourceChart):
      {
        'item': TreeDataItem,
        'period': { ..RawPeriodObject.. }
      }
     */
    var isTreeDataItem = data instanceof anychart.data.Tree.DataItem; //If item is tree data item.
    return isTreeDataItem ?
        (data.get(anychart.enums.GanttDataFields.NAME) + '') :
        (data['item'].get(anychart.enums.GanttDataFields.NAME) + '');
  });
  tooltip.resumeSignalsDispatching(false);

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
    anychart.ConsistencyState.TIMELINE_SCALES |
    anychart.ConsistencyState.TIMELINE_POSITION |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.TIMELINE_HOVER;


/**
 * Default timeline header height.
 * @type {number}
 */
anychart.core.gantt.Timeline.DEFAULT_HEADER_HEIGHT = 70;


/**
 * Baseline path z-index.
 * @type {number}
 */
anychart.core.gantt.Timeline.BASELINE_Z_INDEX = 10;


/**
 * Base path z-index.
 * @type {number}
 */
anychart.core.gantt.Timeline.BASE_Z_INDEX = 20;


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
 * Timeline header z-index.
 * @type {number}
 */
anychart.core.gantt.Timeline.HEADER_Z_INDEX = 80;


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
    this.invalidate(anychart.ConsistencyState.TIMELINE_SCALES, anychart.Signal.NEEDS_REDRAW);
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
 * Gets/sets a default rows fill. Resets odd fill and even fill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.gantt.Timeline|string} - Current value or itself for method chaining.
 */
anychart.core.gantt.Timeline.prototype.rowFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var val = acgraph.vector.normalizeFill.apply(null, arguments);
    if (!anychart.color.equals(/** @type {acgraph.vector.Fill} */ (this.rowFill_), val)) {
      this.rowFill_ = val;
      this.rowOddFill_ = null;
      this.rowEvenFill_ = null;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.rowFill_;
};


/**
 * Gets/sets a default rows fill. Resets odd fill and even fill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.gantt.Timeline|string} - Current value or itself for method chaining.
 * @deprecated - Use {@link rowFill} instead.
 */
anychart.core.gantt.Timeline.prototype.cellFill = anychart.core.gantt.Timeline.prototype.rowFill;


/**
 * Gets/sets row odd fill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.gantt.Timeline|string} - Current value or itself for method chaining.
 */
anychart.core.gantt.Timeline.prototype.rowOddFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var val = acgraph.vector.normalizeFill.apply(null, arguments);
    if (!anychart.color.equals(/** @type {acgraph.vector.Fill} */ (this.rowOddFill_), val)) {
      this.rowOddFill_ = val;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.rowOddFill_;
};


/**
 * Gets/sets row odd fill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.gantt.Timeline|string} - Current value or itself for method chaining.
 * @deprecated - Use {@link rowOddFill} instead.
 */
anychart.core.gantt.Timeline.prototype.cellOddFill = anychart.core.gantt.Timeline.prototype.rowOddFill;


/**
 * Gets/sets row even fill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.gantt.Timeline|string} - Current value or itself for method chaining.
 */
anychart.core.gantt.Timeline.prototype.rowEvenFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var val = acgraph.vector.normalizeFill.apply(null, arguments);
    if (!anychart.color.equals(/** @type {acgraph.vector.Fill} */ (this.rowEvenFill_), val)) {
      this.rowEvenFill_ = val;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.rowEvenFill_;
};


/**
 * Gets/sets row even fill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.gantt.Timeline|string} - Current value or itself for method chaining.
 * @deprecated - Use {@link rowEvenFill} instead.
 */
anychart.core.gantt.Timeline.prototype.cellEvenFill = anychart.core.gantt.Timeline.prototype.rowEvenFill;


/**
 * Gets/sets row hover fill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.gantt.Timeline|string} - Current value or itself for method chaining.
 */
anychart.core.gantt.Timeline.prototype.rowHoverFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var val = acgraph.vector.normalizeFill.apply(null, arguments);
    if (!anychart.color.equals(/** @type {acgraph.vector.Fill} */ (this.hoverFill_), val)) {
      //NOTE: this value will be applied on mouse event. That's why we do not invalidate anything.
      this.hoverFill_ = val;
      this.getHoverPath_().fill(this.hoverFill_);
    }
    return this;
  }
  return this.hoverFill_;
};


/**
 * Gets/sets row selected fill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.gantt.Timeline|string} - Current value or itself for method chaining.
 */
anychart.core.gantt.Timeline.prototype.rowSelectedFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var val = acgraph.vector.normalizeFill.apply(null, arguments);
    if (!anychart.color.equals(/** @type {acgraph.vector.Fill} */ (this.rowSelectedFill_), val)) {
      this.rowSelectedFill_ = val;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.rowSelectedFill_;
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
 * Getter for this.hoverPath_.
 * @return {acgraph.vector.Path}
 * @private
 */
anychart.core.gantt.Timeline.prototype.getHoverPath_ = function() {
  if (!this.hoverPath_) {
    this.hoverPath_ = /** @type {acgraph.vector.Path} */ (this.getCellsLayer_().path());
    this.hoverPath_.stroke(null).fill(this.hoverFill_).zIndex(10);
    this.registerDisposable(this.hoverPath_);
  }
  return this.hoverPath_;
};


/**
 * Getter for this.hoverPath_.
 * @return {acgraph.vector.Path}
 * @private
 */
anychart.core.gantt.Timeline.prototype.getSelectedPath_ = function() {
  if (!this.selectedPath_) {
    this.selectedPath_ = /** @type {acgraph.vector.Path} */ (this.getCellsLayer_().path());
    this.selectedPath_.stroke(null).fill(this.rowSelectedFill_).zIndex(11);
    this.registerDisposable(this.selectedPath_);
  }
  return this.selectedPath_;
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
    var ths = this;
    this.dataLayer_ = new anychart.core.utils.TypedLayer(function() {
      var path = acgraph.path();
      acgraph.events.listen(path, acgraph.events.EventType.MOUSEMOVE, ths.mouseMoveTooltipHandler_, false, ths);
      acgraph.events.listen(path, acgraph.events.EventType.MOUSEOUT, ths.mouseOutTooltipHandler_, false, ths);
      acgraph.events.listen(path, acgraph.events.EventType.CLICK, ths.mouseClickElementHandler_, false, ths);
      return path;
    }, function(child) {
      (/** @type {acgraph.vector.Path} */ (child)).fill(null).stroke(null).clear();
    });
    this.registerDisposable(this.dataLayer_);
  }
  return this.dataLayer_;
};


/**
 * Handler for tooltip mouse move.
 * @param {acgraph.events.Event} event - Event.
 * @private
 */
anychart.core.gantt.Timeline.prototype.mouseMoveTooltipHandler_ = function(event) {
  var tooltip = /** @type {anychart.core.ui.Tooltip} */(this.tooltip());

  var path = event['target'];
  var id = path['__id'];
  if (goog.isDef(id)) {
    var map = this.isResourceChart_ ? this.controller_.getPeriodsMap() : this.controller_.getVisibleItemsMap();
    var mapItem = map[id];
    var item = this.isResourceChart_ ? {
      'item': this.visibleItems_[mapItem['index']],
      'period': mapItem['period']
    } : mapItem['item'];
    if (item) {
      var position = tooltip.isFloating() ? new acgraph.math.Coordinate(event.clientX, event.clientY) : new acgraph.math.Coordinate(0, 0);
      tooltip.show(item, position);
    }
  }
};


/**
 * Handler for tooltip mouse out.
 * @param {acgraph.events.Event} event - Event.
 * @private
 */
anychart.core.gantt.Timeline.prototype.mouseOutTooltipHandler_ = function(event) {
  this.tooltip().hide();
};


/**
 * Handler for UI element mouse click.
 * UI element is any time bar/milestone rhombus on timeline.
 * @param {acgraph.events.Event} event - Event.
 * @private
 */
anychart.core.gantt.Timeline.prototype.mouseClickElementHandler_ = function(event) {
  //This will set event.defaultPrevented to 'false'. Will be used by browser and base layer click handler.
  event.preventDefault();

  var path = event['target'];
  var id = path['__id'];
  if (goog.isDef(id)) {
    var map = this.isResourceChart_ ? this.controller_.getPeriodsMap() : this.controller_.getVisibleItemsMap();
    var mapItem = map[id];

    var item, period, eventObj;

    if (this.isResourceChart_) {
      item = this.visibleItems_[mapItem['index']];
      period = mapItem['period'];

      if (item && this.selectedPeriodId_ != id) {
        eventObj = {
          'type': anychart.enums.EventType.ROW_CLICK,
          'item': item,
          'period': period
        };
      }
      this.selectedPeriodId_ = id;
    } else {
      item = mapItem['item'];
      if (item && !item.meta('selected')) {
        eventObj = {
          'type': anychart.enums.EventType.ROW_CLICK,
          'item': item
        };
      }
    }

    if (eventObj) {
      this.selectRow(item);
      this.dispatchEvent(eventObj);
      this.invalidate(anychart.ConsistencyState.TIMELINE_POSITION, anychart.Signal.NEEDS_REDRAW);
    }
  }
};


/**
 * Getter for tooltip settings.
 * @param {(Object|boolean|null)=} opt_value - Tooltip settings.
 * @return {!(anychart.core.gantt.Timeline|anychart.core.ui.Tooltip)} - Tooltip instance or self for method chaining.
 */
anychart.core.gantt.Timeline.prototype.tooltip = function(opt_value) {
  if (!this.tooltip_) {
    this.tooltip_ = new anychart.core.ui.Tooltip();
    this.registerDisposable(this.tooltip_);
    this.tooltip_.listenSignals(this.onTooltipSignal_, this);
  }
  if (goog.isDef(opt_value)) {
    this.tooltip_.setup(opt_value);
    return this;
  } else {
    return this.tooltip_;
  }
};


/**
 * Tooltip invalidation handler.
 * @param {anychart.SignalEvent} event - Event object.
 * @private
 */
anychart.core.gantt.Timeline.prototype.onTooltipSignal_ = function(event) {
  var tooltip = /** @type {anychart.core.ui.Tooltip} */(this.tooltip());
  tooltip.redraw();
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
        .padding(3, anychart.core.gantt.Timeline.ARROW_MARGIN);
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

    acgraph.events.listen(this.base_, acgraph.events.EventType.MOUSEMOVE, this.mouseMoveHandler_, false, this);
    acgraph.events.listen(this.base_, acgraph.events.EventType.MOUSEOUT, this.mouseOutHandler_, false, this);
    acgraph.events.listen(this.base_, acgraph.events.EventType.CLICK, this.mouseClickHandler_, false, this);
  }
  return this.base_;
};


/**
 * Handler for mouse move.
 * @param {acgraph.events.Event} event - Event.
 * @private
 */
anychart.core.gantt.Timeline.prototype.mouseMoveHandler_ = function(event) {
  var headerHeight = this.header_.getPixelBounds().height;
  var initialTop = /** @type {number} */ (this.pixelBoundsCache_.top + headerHeight + anychart.core.ui.DataGrid.ROW_SPACE - this.verticalOffset_);

  var mouseHeight = event.offsetY - headerHeight - this.pixelBoundsCache_.top;

  if (this.gridHeightCache_.length) {
    var totalHeight = this.gridHeightCache_[this.gridHeightCache_.length - 1];
    if (mouseHeight > 0 && mouseHeight < totalHeight) { //Triggered over the rows only.
      var index = goog.array.binarySearch(this.gridHeightCache_, mouseHeight + this.verticalOffset_);
      index = index >= 0 ? index : ~index; //Index of row under mouse.

      if (index != this.hoveredIndex_) {
        var startHeight = index ? this.gridHeightCache_[index - 1] : 0;
        var startY = initialTop + startHeight;
        var endY = startY + (this.gridHeightCache_[index] - startHeight - anychart.core.ui.DataGrid.ROW_SPACE);
        this.highlight(index, startY, endY);
      }

    } else {
      this.highlight();
      this.hoveredIndex_ = -1;
    }

  }
};


/**
 * Handler for mouse out.
 * @param {acgraph.events.Event} event - Event.
 * @private
 */
anychart.core.gantt.Timeline.prototype.mouseOutHandler_ = function(event) {
  this.highlight();
  this.hoveredIndex_ = -1;
};


/**
 * Handler for mouse click.
 * @param {acgraph.events.Event} event - Event.
 * @private
 */
anychart.core.gantt.Timeline.prototype.mouseClickHandler_ = function(event) {
  var headerHeight = this.header_.getPixelBounds().height;

  var mouseHeight = event.offsetY - headerHeight - this.pixelBoundsCache_.top;

  if (this.gridHeightCache_.length) {
    var totalHeight = this.gridHeightCache_[this.gridHeightCache_.length - 1];
    if (mouseHeight > 0 && mouseHeight < totalHeight) { //Triggered over the rows only.
      var index = goog.array.binarySearch(this.gridHeightCache_, mouseHeight + this.verticalOffset_);
      index = index >= 0 ? index : ~index; //Index of row under mouse.

      var item = this.visibleItems_[this.startIndex_ + index]; //Theoretically, here must not be any exceptions.
      if (!item.meta('selected')) {
        this.selectRow(item);

        if (!event.defaultPrevented) this.dispatchEvent({
          'type': anychart.enums.EventType.ROW_CLICK,
          'item': item
        });

        this.invalidate(anychart.ConsistencyState.TIMELINE_POSITION, anychart.Signal.NEEDS_REDRAW);
      }
    }
  }
};


/**
 * Highlights selected vertical range.
 * @param {number=} opt_index - Index of row.
 * @param {number=} opt_startY - Start Y to be highlighted.
 * @param {number=} opt_endY - End Y to be highlighted.
 * @param {boolean=} opt_preventDispatching - If dispatching should be prevented.
 */
anychart.core.gantt.Timeline.prototype.highlight = function(opt_index, opt_startY, opt_endY, opt_preventDispatching) {
  var definedValues = goog.isDef(opt_index) && goog.isDef(opt_startY) && goog.isDef(opt_endY);
  if (definedValues || (!definedValues && this.hoveredIndex_ >= 0)) {
    this.hoveredIndex_ = opt_index;
    this.hoverStartY_ = opt_startY;
    this.hoverEndY_ = opt_endY;

    if (!opt_preventDispatching) this.dispatchEvent({
      'type': anychart.enums.EventType.ROW_HOVER,
      'index': opt_index,
      'startY': opt_startY,
      'endY': opt_endY
    });
    this.invalidate(anychart.ConsistencyState.TIMELINE_HOVER, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Method to select row from outside.
 * @param {anychart.data.Tree.DataItem} item - New selected data item.
 */
anychart.core.gantt.Timeline.prototype.selectRow = function(item) {
  if (item != this.selectedItem_) {
    item.tree().suspendSignalsDispatching();
    if (this.selectedItem_) this.selectedItem_.meta('selected', false); //selectedItem_ has the same tree as item.
    item.meta('selected', true);
    this.selectedItem_ = item;
    item.tree().resumeSignalsDispatching(false);
  }
};


/**
 * Draws cells depending on data.
 * @private
 */
anychart.core.gantt.Timeline.prototype.drawRowFills_ = function() {
  var headerHeight = this.header_.getPixelBounds().height;
  var initialTop = /** @type {number} */ (this.pixelBoundsCache_.top + headerHeight + anychart.core.ui.DataGrid.ROW_SPACE - this.verticalOffset_);
  var totalTop = initialTop;
  this.highlight();
  this.gridHeightCache_.length = 0;
  this.hoveredIndex_ = -1;

  this.getEvenPath_().clear();
  this.getOddPath_().clear();
  this.getSelectedPath_().clear();
  for (var i = this.startIndex_; i <= this.endIndex_; i++) {
    var item = this.visibleItems_[i];
    if (!item) break;

    var height = anychart.core.gantt.Controller.getItemHeight(item);

    /*
      Note: Straight indexing starts with 0 (this.visibleItems_[0], this.visibleItems_[1], this.visibleItems_[2]...).
      But for user numeration starts with 1 and looks like
        1. Item0
        2. Item1
        3. Item2

      That's why evenPath highlights odd value of i, and oddPath highlights even value of i.
     */
    var path = i % 2 ? this.evenPath_ : this.oddPath_;

    var newTop = /** @type {number} */ (totalTop + height);
    path
        .moveTo(this.pixelBoundsCache_.left, totalTop)
        .lineTo(this.pixelBoundsCache_.left + this.pixelBoundsCache_.width, totalTop)
        .lineTo(this.pixelBoundsCache_.left + this.pixelBoundsCache_.width, newTop)
        .lineTo(this.pixelBoundsCache_.left, newTop)
        .close();

    if (item.meta('selected')) {
      this.selectedPath_
          .moveTo(this.pixelBoundsCache_.left, totalTop)
          .lineTo(this.pixelBoundsCache_.left + this.pixelBoundsCache_.width, totalTop)
          .lineTo(this.pixelBoundsCache_.left + this.pixelBoundsCache_.width, newTop)
          .lineTo(this.pixelBoundsCache_.left, newTop)
          .close();
    }

    totalTop = (newTop + anychart.core.ui.DataGrid.ROW_SPACE);
    this.gridHeightCache_.push(totalTop - initialTop);
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
      (this.selectedItem_ == item) :
      (this.selectedPeriodId_ == item[anychart.enums.GanttDataFields.ID]);


  var zIndex, defaultFill, defaultStroke;

  switch (opt_field) {
    case anychart.enums.GanttDataFields.BASELINE:
      zIndex = anychart.core.gantt.Timeline.BASELINE_Z_INDEX;
      defaultFill = this.baselineFill_;
      defaultStroke = this.baselineStroke_;
      isBaseline = true;
      break;
    case anychart.enums.GanttDataFields.PROGRESS:
      zIndex = anychart.core.gantt.Timeline.PROGRESS_Z_INDEX;
      defaultFill = this.progressFill_;
      defaultStroke = this.progressStroke_;
      isProgress = true;
      break;
    default:
      zIndex = anychart.core.gantt.Timeline.BASE_Z_INDEX;
      isParent = (isTreeDataItem && item.numChildren());
      //Milestone is not bar, so it doesn't use drawBar_ method.
      defaultFill = isParent ? this.parentFill_ : this.baseFill_;
      defaultStroke = isParent ? this.parentStroke_ : this.baseStroke_;

      //It is not in "case anychart.enums.GanttDataFields.BASELINE:"section because this flag is for label coloring.
      //Label belongs to "actual" bar, not to "baseline" bar.
      isActualBaseline = (isTreeDataItem && item.get(anychart.enums.GanttDataFields.BASELINE_START) && item.get(anychart.enums.GanttDataFields.BASELINE_END));

  }

  var stroke = settings && goog.isDef(settings[anychart.enums.GanttDataFields.STROKE]) ?
      acgraph.vector.normalizeStroke(settings[anychart.enums.GanttDataFields.STROKE]) :
      defaultStroke;

  var rawLabel = settings ? settings[anychart.enums.GanttDataFields.LABEL] : void 0;
  var textValue;
  if (rawLabel && goog.isDef(rawLabel['value'])) {
    textValue = rawLabel['value'] + '';
  } else {
    textValue = (isTreeDataItem && !isProgress && !isBaseline) ? (item.get(anychart.enums.GanttDataFields.PROGRESS_VALUE) || '') : '';
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

  var bar = this.getDataLayer_().genNextChild();
  bar['__id'] = isTreeDataItem ? item.get(anychart.enums.GanttDataFields.ID) : item[anychart.enums.GanttDataFields.ID];

  var lineThickness = anychart.utils.isNone(stroke) ? 0 :
      goog.isString(stroke) ? 1 :
          stroke['thickness'] ? stroke['thickness'] : 1;

  var pixelShift = (lineThickness % 2) ? 0.5 : 0;

  var roundLeft = Math.round(bounds.left) + pixelShift;
  var roundTop = Math.round(bounds.top) + pixelShift;
  var roundRight = Math.round(bounds.left + bounds.width) + pixelShift;
  var roundHeight = Math.round(bounds.top + bounds.height) + pixelShift;

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
    } else {
      fill = goog.isDef(settings[anychart.enums.GanttDataFields.FILL]) ?
          acgraph.vector.normalizeFill(settings[anychart.enums.GanttDataFields.FILL]) :
          defaultFill;
    }

    bar.fill(fill).stroke(stroke);
  } else { //Default coloring.
    bar.fill(selectedBar ? this.selectedElementFill_ : defaultFill).stroke(defaultStroke);
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
        var left = this.pixelBoundsCache_.left + this.pixelBoundsCache_.width * startRatio;
        var right = this.pixelBoundsCache_.left + this.pixelBoundsCache_.width * endRatio;
        var height = itemHeight * anychart.core.gantt.Timeline.DEFAULT_HEIGHT_REDUCTION;
        var top = totalTop + (itemHeight - height) / 2;
        this.drawBar_(new anychart.math.Rect(left, top, (right - left), height), period);
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
  var actualStart = dataItem.get(anychart.enums.GanttDataFields.ACTUAL_START);
  var actualEnd = dataItem.get(anychart.enums.GanttDataFields.ACTUAL_END);
  var baselineStart = dataItem.get(anychart.enums.GanttDataFields.BASELINE_START);
  var baselineEnd = dataItem.get(anychart.enums.GanttDataFields.BASELINE_END);
  var actualStartRatio = this.scale_.timestampToRatio(actualStart);
  var actualEndRatio = this.scale_.timestampToRatio(actualEnd);
  var baselineStartRatio = this.scale_.timestampToRatio(baselineStart);
  var baselineEndRatio = this.scale_.timestampToRatio(baselineEnd);

  if ((actualEndRatio > 0 && actualStartRatio < 1) || (baselineEndRatio > 0 && baselineStartRatio < 1)) {
    var b = this.pixelBoundsCache_;
    var actualLeft = b.left + b.width * actualStartRatio;
    var actualRight = b.left + b.width * actualEndRatio;
    var actualTop = totalTop + itemHeight * (1 - anychart.core.gantt.Timeline.DEFAULT_HEIGHT_REDUCTION) / 2;
    var actualHeight = itemHeight * anychart.core.gantt.Timeline.DEFAULT_HEIGHT_REDUCTION / 2;

    var baselineLeft = b.left + b.width * baselineStartRatio;
    var baselineRight = b.left + b.width * baselineEndRatio;
    var baselineTop = actualTop + actualHeight;
    var baselineHeight = actualHeight;

    this.drawBar_(new anychart.math.Rect(actualLeft, actualTop, (actualRight - actualLeft), actualHeight),
        dataItem, anychart.enums.GanttDataFields.ACTUAL);

    this.drawBar_(new anychart.math.Rect(baselineLeft, baselineTop, (baselineRight - baselineLeft), baselineHeight),
        dataItem, anychart.enums.GanttDataFields.BASELINE);

    var progressHeight = actualHeight * anychart.core.gantt.Timeline.PROGRESS_HEIGHT_REDUCTION;
    var progressTop = actualTop + (actualHeight - progressHeight) / 2;

    var progressValue = parseFloat(dataItem.get(anychart.enums.GanttDataFields.PROGRESS_VALUE));
    if (progressValue) { //Draw progress.
      var progressWidth = progressValue * (actualRight - actualLeft) / 100;
      this.drawBar_(new anychart.math.Rect(actualLeft, progressTop, progressWidth, progressHeight), dataItem,
          anychart.enums.GanttDataFields.PROGRESS);
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
anychart.core.gantt.Timeline.prototype.drawAsParent_ = function(dataItem, totalTop, itemHeight) {
  var actualStart = dataItem.get(anychart.enums.GanttDataFields.ACTUAL_START);
  var actualEnd = dataItem.get(anychart.enums.GanttDataFields.ACTUAL_END);
  var startRatio = this.scale_.timestampToRatio(actualStart);
  var endRatio = this.scale_.timestampToRatio(actualEnd);

  if (endRatio > 0 && startRatio < 1) { //Is visible
    var left = this.pixelBoundsCache_.left + this.pixelBoundsCache_.width * startRatio;
    var right = this.pixelBoundsCache_.left + this.pixelBoundsCache_.width * endRatio;
    var top = totalTop + itemHeight * (1 - anychart.core.gantt.Timeline.DEFAULT_HEIGHT_REDUCTION) / 2;
    var height = itemHeight * anychart.core.gantt.Timeline.PARENT_HEIGHT_REDUCTION;

    this.drawBar_(new anychart.math.Rect(left, top, (right - left), height), dataItem, anychart.enums.GanttDataFields.ACTUAL);

    var progressHeight = height * anychart.core.gantt.Timeline.PROGRESS_HEIGHT_REDUCTION;
    var progressTop = top + (height - progressHeight) / 2;

    var progressValue = parseFloat(dataItem.get(anychart.enums.GanttDataFields.PROGRESS_VALUE));
    if (progressValue) { //Draw progress.
      var progressWidth = progressValue * (right - left) / 100;
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
    var left = this.pixelBoundsCache_.left + this.pixelBoundsCache_.width * startRatio;
    var right = this.pixelBoundsCache_.left + this.pixelBoundsCache_.width * endRatio;
    var height = itemHeight * anychart.core.gantt.Timeline.DEFAULT_HEIGHT_REDUCTION;
    var top = totalTop + (itemHeight - height) / 2;

    this.drawBar_(new anychart.math.Rect(left, top, (right - left), height), dataItem, anychart.enums.GanttDataFields.ACTUAL);

    var progressHeight = height * anychart.core.gantt.Timeline.PROGRESS_HEIGHT_REDUCTION;
    var progressTop = top + (height - progressHeight) / 2;
    var progressValue = parseFloat(dataItem.get(anychart.enums.GanttDataFields.PROGRESS_VALUE));

    if (progressValue) { //Draw progress.
      var progressWidth = progressValue * (right - left) / 100;
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
    var settings = dataItem.get(anychart.enums.GanttDataFields.MILESTONE);

    var stroke = settings && goog.isDef(settings[anychart.enums.GanttDataFields.STROKE]) ?
        acgraph.vector.normalizeStroke(settings[anychart.enums.GanttDataFields.STROKE]) :
        this.milestoneStroke_;

    var lineThickness = anychart.utils.isNone(stroke) ? 0 :
        goog.isString(stroke) ? 1 :
            stroke['thickness'] ? stroke['thickness'] : 1;

    var pixelShift = (lineThickness % 2) ? 0.5 : 0;


    var halfHeight = Math.round(itemHeight * anychart.core.gantt.Timeline.DEFAULT_HEIGHT_REDUCTION / 2);
    var centerLeft = Math.round(this.pixelBoundsCache_.left + this.pixelBoundsCache_.width * ratio) + pixelShift;
    var centerTop = Math.round(totalTop + itemHeight / 2) + pixelShift;

    var milestone = this.getDataLayer_().genNextChild();
    milestone['__id'] = dataItem.get(anychart.enums.GanttDataFields.ID);

    milestone
        .zIndex(anychart.core.gantt.Timeline.BASE_Z_INDEX)
        .moveTo(centerLeft - halfHeight, centerTop) //left corner
        .lineTo(centerLeft, centerTop - halfHeight) //top corner
        .lineTo(centerLeft + halfHeight, centerTop) //right corner
        .lineTo(centerLeft, centerTop + halfHeight) //bottom corner
        .close();


    var rawLabel = settings ? settings[anychart.enums.GanttDataFields.LABEL] : void 0;
    var textValue;
    if (rawLabel && goog.isDef(rawLabel['value'])) {
      textValue = rawLabel['value'] + '';
    } else {
      textValue = dataItem.get(anychart.enums.GanttDataFields.NAME) || '';
    }

    if (textValue) {
      var bounds = new acgraph.math.Rect(centerLeft - halfHeight, centerTop - halfHeight, (halfHeight + halfHeight), (halfHeight + halfHeight));
      var position = (rawLabel && rawLabel['position']) ? rawLabel['position'] : this.getLabelsFactory_().position();
      position = anychart.enums.normalizeAnchor(position);
      var positionProvider = {'value': anychart.utils.getCoordinateByAnchor(bounds, position)};
      var formatProvider = {'value': textValue};
      var label = this.getLabelsFactory_().add(formatProvider, positionProvider);
      if (rawLabel) label.setup(rawLabel);
    }

    var isSelected = dataItem == this.selectedItem_;

    if (settings) {
      var fill;
      if (isSelected) {
        fill = this.selectedElementFill_;
      } else {
        fill = goog.isDef(settings[anychart.enums.GanttDataFields.FILL]) ?
            acgraph.vector.normalizeFill(settings[anychart.enums.GanttDataFields.FILL]) :
            this.milestoneFill_;
      }

      milestone.fill(fill).stroke(stroke);
    } else {
      milestone.fill(isSelected ? this.selectedElementFill_ : this.milestoneFill_).stroke(this.milestoneStroke_);
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
          from['period'][anychart.enums.GanttDataFields.START] :
          from['item'].get(anychart.enums.GanttDataFields.ACTUAL_START);

      var fromEndTimestamp = this.isResourceChart_ ?
          from['period'][anychart.enums.GanttDataFields.END] :
          from['item'].get(anychart.enums.GanttDataFields.ACTUAL_END);

      var toStartTimestamp = this.isResourceChart_ ?
          to['period'][anychart.enums.GanttDataFields.START] :
          to['item'].get(anychart.enums.GanttDataFields.ACTUAL_START);

      var toEndTimestamp = this.isResourceChart_ ?
          to['period'][anychart.enums.GanttDataFields.END] :
          to['item'].get(anychart.enums.GanttDataFields.ACTUAL_END);

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
          acgraph.vector.normalizeStroke(connSettings[anychart.enums.GanttDataFields.STROKE]) :
          this.connectorStroke_;


      if (!this.isResourceChart_) {
        if (from['item'].get(anychart.enums.GanttDataFields.BASELINE_START) &&
            from['item'].get(anychart.enums.GanttDataFields.BASELINE_END)) {
          fromRowHeight = fromRowHeight * (1 - anychart.core.gantt.Timeline.DEFAULT_HEIGHT_REDUCTION / 2);
        } else if (from['item'].numChildren()) {
          fromRowHeight = fromRowHeight * (1 - anychart.core.gantt.Timeline.DEFAULT_HEIGHT_REDUCTION + anychart.core.gantt.Timeline.PARENT_HEIGHT_REDUCTION);
        }

        if (to['item'].get(anychart.enums.GanttDataFields.BASELINE_START) &&
            to['item'].get(anychart.enums.GanttDataFields.BASELINE_END)) {
          toRowHeight = toRowHeight * (1 - anychart.core.gantt.Timeline.DEFAULT_HEIGHT_REDUCTION / 2);
        } else if (to['item'].numChildren()) {
          toRowHeight = toRowHeight * (1 - anychart.core.gantt.Timeline.DEFAULT_HEIGHT_REDUCTION + anychart.core.gantt.Timeline.PARENT_HEIGHT_REDUCTION);
        }
      }

      this.drawConnector_(
          new anychart.math.Rect(fromLeft, actualFromTop, (fromRight - fromLeft), fromRowHeight),
          new anychart.math.Rect(toLeft, actualToTop, (toRight - toLeft), toRowHeight),
          connType,
          /** @type {acgraph.vector.Fill} */ (fill),
          /** @type {acgraph.vector.Stroke} */ (stroke));

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

  var lineThickness = anychart.utils.isNone(stroke) ? 0 :
      goog.isString(stroke) ? 1 :
          stroke['thickness'] ? stroke['thickness'] : 1;

  var pixelShift = (lineThickness % 2) ? 0.5 : 0;

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
        segmentLeft0 = Math.max(fromLeft + as + am, toLeft + as + am);
        path = this.drawSegment_(fromLeft, fromTop, segmentLeft0, fromTop, path);
        path = this.drawSegment_(segmentLeft0, fromTop, segmentLeft0, toTop, path);
        path = this.drawSegment_(segmentLeft0, toTop, toLeft, toTop, path);
      }
      arrow = this.drawArrow_(toLeft, toTop, orientation);
      break;

    case anychart.enums.ConnectorType.START_FINISH:
      fromLeft = Math.round(fromBounds.left) + pixelShift;
      fromTop = Math.round(fromBounds.top + fromBounds.height / 2) + pixelShift;
      toLeft = Math.round(toBounds.left + toBounds.width) + pixelShift;
      toTop = Math.round(toBounds.top + toBounds.height / 2) + pixelShift;
      orientation = anychart.enums.Orientation.LEFT;

      if (fromLeft - am - am - as > toLeft) {
        segmentLeft0 = toLeft + am + as;
        path = this.drawSegment_(fromLeft, fromTop, segmentLeft0, fromTop, path);
        path = this.drawSegment_(segmentLeft0, fromTop, segmentLeft0, toTop, path);
        path = this.drawSegment_(segmentLeft0, toTop, toLeft, toTop, path);
      } else {
        aboveSequence = toBounds.top >= fromBounds.top;

        segmentLeft0 = fromLeft - am;
        segmentLeft1 = toLeft + am + as;
        segmentTop0 = Math.round(aboveSequence ? toBounds.top : toBounds.top + toBounds.height) + pixelShift;

        path = this.drawSegment_(fromLeft, fromTop, segmentLeft0, fromTop, path);
        path = this.drawSegment_(segmentLeft0, fromTop, segmentLeft0, segmentTop0, path);
        path = this.drawSegment_(segmentLeft0, segmentTop0, segmentLeft1, segmentTop0, path);
        path = this.drawSegment_(segmentLeft1, segmentTop0, segmentLeft1, toTop, path);
        path = this.drawSegment_(segmentLeft1, toTop, toLeft, toTop, path);

      }

      arrow = this.drawArrow_(toLeft, toTop, orientation);

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
        segmentLeft0 = Math.min(fromLeft - as - am, toLeft - as - am);
        path = this.drawSegment_(fromLeft, fromTop, segmentLeft0, fromTop, path);
        path = this.drawSegment_(segmentLeft0, fromTop, segmentLeft0, toTop, path);
        path = this.drawSegment_(segmentLeft0, toTop, toLeft, toTop, path);
      }
      arrow = this.drawArrow_(toLeft, toTop, orientation);

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
          arrow = this.drawArrow_(toLeft, extraEndY, anychart.enums.Orientation.BOTTOM);
        } else if (toBounds.top < fromBounds.top) {
          extraEndY = Math.round(toBounds.top + toBounds.height) + pixelShift;
          path = this.drawSegment_(fromLeft, fromTop, toLeft, fromTop, path);
          path = this.drawSegment_(toLeft, fromTop, toLeft, extraEndY, path);
          arrow = this.drawArrow_(toLeft, extraEndY, anychart.enums.Orientation.TOP);
        } else { //Same line
          toLeft = Math.round(toBounds.left) + pixelShift;
          toTop = Math.round(toBounds.top + toBounds.height / 2) + pixelShift;
          path = this.drawSegment_(fromLeft, fromTop, toLeft, toTop, path);
          arrow = this.drawArrow_(toLeft, toTop, anychart.enums.Orientation.RIGHT);
        }

      } else { //if toLeft < fromLeft
        extraEndY = Math.round(toBounds.top + toBounds.height / 2) + pixelShift;
        segmentTop0 = Math.round((toBounds.top > fromBounds.top) ? toBounds.top : (toBounds.top + toBounds.height)) + pixelShift;
        segmentLeft0 = fromLeft + am;
        segmentLeft1 = toLeft - am - as;

        path = this.drawSegment_(fromLeft, fromTop, segmentLeft0, fromTop, path);
        path = this.drawSegment_(segmentLeft0, fromTop, segmentLeft0, segmentTop0, path);
        path = this.drawSegment_(segmentLeft0, segmentTop0, segmentLeft1, segmentTop0, path);
        path = this.drawSegment_(segmentLeft1, segmentTop0, segmentLeft1, extraEndY, path);
        path = this.drawSegment_(segmentLeft1, extraEndY, toLeft, extraEndY, path);

        arrow = this.drawArrow_(toLeft, extraEndY, anychart.enums.Orientation.RIGHT);
      }
  }

  if (path) {
    path.stroke(/** @type {acgraph.vector.Stroke} */ (stroke));
    path['__id'] = void 0; //Tooltip will not appear on connector mouse over.
  }
  if (arrow) {
    arrow.fill(/** @type {acgraph.vector.Fill} */ (fill)).stroke(/** @type {acgraph.vector.Stroke} */ (stroke));
    arrow['__id'] = void 0; //Tooltip will not appear on connector arrow mouse over.
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
        .moveTo(left, top)
        .lineTo(left1, top1)
        .lineTo(left2, top2)
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

  if (opt_positionRecalculated) this.invalidate(anychart.ConsistencyState.TIMELINE_POSITION);

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

      this.getMarkersFactory_().container(this.getBase_());
      this.getLabelsFactory_().container(this.getBase_());

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

    if (this.hasInvalidationState(anychart.ConsistencyState.TIMELINE_SCALES)) {
      //TODO (A.Kudryavtsev): Redraw all.
      redrawHeader = true;
      this.markConsistent(anychart.ConsistencyState.TIMELINE_SCALES);
    }

    if (redrawHeader) {
      this.header_.invalidate(anychart.ConsistencyState.TIMELINE_HEADER_SCALES);
      this.header_.draw();
      var ticks = this.header_.getLowLevel().getTicks();
      this.drawLowTicks_(ticks);

      var totalRange = this.scale_.getTotalRange();
      var visibleRange = this.scale_.getRange();

      var totMin = this.scale_.timestampToRatio(totalRange['min']) * this.pixelBoundsCache_.width;
      var totMax = this.scale_.timestampToRatio(totalRange['max']) * this.pixelBoundsCache_.width;
      var visibleMin = this.scale_.timestampToRatio(visibleRange['min']) * this.pixelBoundsCache_.width;
      var visibleMax = this.scale_.timestampToRatio(visibleRange['max']) * this.pixelBoundsCache_.width;

      var contentBoundsSimulation = new acgraph.math.Rect(totMin, 0, totMax - totMin, 0);
      var visibleBoundsSimulation = new acgraph.math.Rect(visibleMin, 0, visibleMax - visibleMin, 0);
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
      this.getOddPath_().fill(this.rowOddFill_ || this.rowFill_);
      this.getEvenPath_().fill(this.rowEvenFill_ || this.rowFill_);
      this.getSelectedPath_().fill(this.rowSelectedFill_);
      this.markConsistent(anychart.ConsistencyState.APPEARANCE);
    }

    if (this.hasInvalidationState(anychart.ConsistencyState.TIMELINE_HOVER)) {
      if (this.hoveredIndex_ >= 0 && goog.isDef(this.hoverStartY_) && goog.isDef(this.hoverEndY_) && goog.isDef(this.hoveredIndex_)) {
        this.getHoverPath_()
            .clear()
            .moveTo(this.pixelBoundsCache_.left, this.hoverStartY_)
            .lineTo(this.pixelBoundsCache_.left + this.pixelBoundsCache_.width, this.hoverStartY_)
            .lineTo(this.pixelBoundsCache_.left + this.pixelBoundsCache_.width, this.hoverEndY_)
            .lineTo(this.pixelBoundsCache_.left, this.hoverEndY_)
            .close();
      } else {
        this.getHoverPath_().clear();
      }
      this.markConsistent(anychart.ConsistencyState.TIMELINE_HOVER);
    }

    var redrawPosition = false;

    if (this.hasInvalidationState(anychart.ConsistencyState.TIMELINE_POSITION)) {
      redrawPosition = true;
      this.markConsistent(anychart.ConsistencyState.TIMELINE_POSITION);
    }

    if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
      this.getBase_().zIndex(/** @type {number} */ (this.zIndex()));
      this.markConsistent(anychart.ConsistencyState.Z_INDEX);
    }

    if (redrawHeader || redrawPosition) {
      this.tooltip().hide();
      this.drawRowFills_();
      this.drawTimelineElements_();
    }

    if (manualSuspend) stage.resume();
  }

  this.initMouseFeatures_();

  return this;
};


/**
 * Initializes mouse wheel scrolling and mouse drag scrolling.
 * TODO (A.Kudryavtsev): In current implementation (04 Dec 2014) mouse drag scrolling is not available.
 * @private
 */
anychart.core.gantt.Timeline.prototype.initMouseFeatures_ = function() {
  if (!this.mwh_) {
    var element = this.getBase_().domElement();
    if (element) {
      this.mwh_ = new goog.events.MouseWheelHandler(element);
      var mouseWheelEvent = goog.events.MouseWheelHandler.EventType.MOUSEWHEEL;
      goog.events.listen(this.mwh_, mouseWheelEvent, this.mouseWheelHandler_, false, this);
      var ths = this;

      goog.events.listen(window, 'unload', function(e) {
        goog.events.unlisten(ths.mwh_, mouseWheelEvent, ths.mouseWheelHandler_, false, this);
      });
    }
  }
};


/**
 * Mouse wheel default handler.
 * @param {goog.events.MouseWheelEvent} e - Mouse wheel event.
 * @private
 */
anychart.core.gantt.Timeline.prototype.mouseWheelHandler_ = function(e) {
  this.scroll(e.deltaX, e.deltaY);
  e.preventDefault();
};


/**
 * Generates horizontal scroll bar.
 * @return {anychart.core.ui.ScrollBar} - Scroll bar.
 */
anychart.core.gantt.Timeline.prototype.getScrollBar = function() {
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
 */
anychart.core.gantt.Timeline.prototype.scroll = function(horizontalPixelOffset, verticalPixelOffset) {
  anychart.core.Base.suspendSignalsDispatching(this, this.scale_, this.controller_);

  var heightCache = this.controller_.getHeightCache();
  var totalVerticalStartOffset = this.startIndex_ ? heightCache[this.startIndex_ - 1] : 0;
  totalVerticalStartOffset += (this.verticalOffset_ + verticalPixelOffset);
  this.controller_.scrollTo(totalVerticalStartOffset);

  var ratio = horizontalPixelOffset / this.pixelBoundsCache_.width;
  this.scale_.ratioScroll(ratio);

  anychart.core.Base.resumeSignalsDispatchingTrue(this, this.scale_, this.controller_);
};



//exports
anychart.core.gantt.Timeline.prototype['cellOddFill'] = anychart.core.gantt.Timeline.prototype.cellOddFill; //deprecated
anychart.core.gantt.Timeline.prototype['cellEvenFill'] = anychart.core.gantt.Timeline.prototype.cellEvenFill; //deprecated
anychart.core.gantt.Timeline.prototype['cellFill'] = anychart.core.gantt.Timeline.prototype.cellFill; //deprecated
anychart.core.gantt.Timeline.prototype['rowFill'] = anychart.core.gantt.Timeline.prototype.rowFill;
anychart.core.gantt.Timeline.prototype['rowEvenFill'] = anychart.core.gantt.Timeline.prototype.rowEvenFill;
anychart.core.gantt.Timeline.prototype['rowOddFill'] = anychart.core.gantt.Timeline.prototype.rowOddFill;
anychart.core.gantt.Timeline.prototype['rowHoverFill'] = anychart.core.gantt.Timeline.prototype.rowHoverFill;
anychart.core.gantt.Timeline.prototype['backgroundFill'] = anychart.core.gantt.Timeline.prototype.backgroundFill;
anychart.core.gantt.Timeline.prototype['tooltip'] = anychart.core.gantt.Timeline.prototype.tooltip;
