goog.provide('anychart.ganttModule.BaseGrid');

goog.require('acgraph.vector.Path');
goog.require('anychart.core.IStandaloneBackend');
goog.require('anychart.core.VisualBaseWithBounds');
goog.require('anychart.core.reporting');
goog.require('anychart.core.ui.Tooltip');
goog.require('anychart.format.Context');
goog.require('anychart.ganttModule.Controller');
goog.require('anychart.ganttModule.IInteractiveGrid');
goog.require('anychart.ganttModule.ScrollBar');
goog.require('anychart.math.Rect');
goog.require('goog.events.KeyHandler');
goog.require('goog.events.MouseWheelHandler');
goog.require('goog.fx.Dragger');
goog.require('goog.labs.userAgent.device');



/**
 * Base class for grid-like classes like DataGrid and Timeline.
 * Has a header area and interactive grid area.
 * @param {anychart.ganttModule.Controller=} opt_controller - Controller to be set. Setting this parameter has a key
 *  meaning:
 *  - If controller is set, in means that this grid (DG or TL) is not standalone (it is part of higher entity
 *    with its own controller like Gantt Chart). It means that controller must be already created before this grid.
 *  - If controller is not set, the grid becomes standalone and creates its own controller.
 * @param {boolean=} opt_isResource - If opt_controller is not set, this flag says what kind of controller to create.
 * @constructor
 * @extends {anychart.core.VisualBaseWithBounds}
 * @implements {anychart.ganttModule.IInteractiveGrid}
 * @implements {anychart.core.IStandaloneBackend}
 */
anychart.ganttModule.BaseGrid = function(opt_controller, opt_isResource) {
  anychart.ganttModule.BaseGrid.base(this, 'constructor');

  /**
   * Mouse wheel handler object.
   * @type {goog.events.MouseWheelHandler}
   * @private
   */
  this.mwh_ = null;

  /**
   * Whether current device is desktop device.
   * @type {boolean}
   */
  this.isDesktop = goog.labs.userAgent.device.isDesktop();

  /**
   * Current dragger.
   * @type {anychart.ganttModule.BaseGrid.Dragger}
   */
  this.scrollDragger = null;

  /**
   * Interactivity handler.
   * @type {!anychart.ganttModule.IInteractiveGrid}
   */
  this.interactivityHandler = /** @type {!anychart.ganttModule.IInteractiveGrid} */ (this);

  /**
   * Flag whether grid is standalone.
   * @type {boolean}
   */
  this.isStandalone = true;

  /**
   * Gantt controller.
   * @type {anychart.ganttModule.Controller}
   */
  this.controller = null;

  if (opt_controller && anychart.utils.instanceOf(opt_controller, anychart.ganttModule.Controller)) {
    this.controller = opt_controller;
    this.isStandalone = false;
  } else {
    this.createController(opt_isResource);
  }

  /**
   * Pixel bounds cache.
   * @type {anychart.math.Rect}
   */
  this.pixelBoundsCache = null;

  /**
   * Row vertical line separation path.
   * @type {acgraph.vector.Stroke}
   * @private
   */
  this.rowStroke_;

  /**
   * Thickness of row stroke.
   * It is used to avoid multiple thickness extraction from rowStroke_.
   * @type {number}
   */
  this.rowStrokeThickness = 1;

  /**
   * Row stroke path.
   * @type {acgraph.vector.Path}
   * @private
   */
  this.rowStrokePath_ = null;


  /**
   * Path that separates header of grid's body.
   * Takes color from this.rowStroke_.
   * @type {acgraph.vector.Path}
   * @private
   */
  this.headerSeparationPath_ = null;

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
   * Invisible background rect to handle mouse events when visible bg id disabled.
   * @type {acgraph.vector.Rect}
   * @private
   */
  this.eventsRect_ = null;

  /**
   * Cells layer. Contains a grid itself.
   * @type {acgraph.vector.Layer}
   * @private
   */
  this.cellsLayer_ = null;

  /**
   * Content layer. Contains main content.
   * @type {acgraph.vector.Layer}
   * @private
   */
  this.contentLayer_ = null;

  /**
   * Edit layer. Contains edit elements.
   * @type {acgraph.vector.Layer}
   * @private
   */
  this.editLayer_ = null;

  /**
   * Layer that contains elements to be drawn with paths.
   * @type {acgraph.vector.Layer}
   * @private
   */
  this.drawLayer_ = null;

  /**
   * Edit structure preview fill.
   * @type {acgraph.vector.Fill}
   * @private
   */
  this.editStructurePreviewFill_;

  /**
   * Edit structure preview stroke.
   * @type {acgraph.vector.Stroke}
   * @private
   */
  this.editStructurePreviewStroke_;


  /**
   * Edit structure preview stroke.
   * @type {acgraph.vector.Stroke}
   * @private
   */
  this.editStructurePreviewDashStroke_;

  /**
   * Edit structure preview path.
   * @type {acgraph.vector.Path}
   * @private
   */
  this.editStructurePreviewPath_ = null;

  /**
   * Layer that will be clipped by height. Use it for something that
   * must have the height of currently visible rows.
   * @type {acgraph.vector.Layer}
   * @private
   */
  this.clipLayer_ = null;

  /**
   * Scrolls layer. Contains scroll bars.
   * @type {acgraph.vector.Layer}
   * @private
   */
  this.scrollsLayer_ = null;

  /**
   * Header height.
   * @type {number}
   * @private
   */
  this.headerHeight_ = 45;

  /**
   * Width of grids.
   * Used for case when rows do not take all available width.
   * Use case: calculation of ratios of horizontal scroll in DG.
   * @type {number}
   */
  this.totalGridsWidth = 0;

  /**
   * Height of grids.
   * @type {number}
   */
  this.totalGridsHeight = 0;

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
   * Contains the sequence of heights of grid. Used to quickly calculate this.hoveredIndex on mouse over event
   * for row highlighting purposes.
   * @type {Array.<number>}
   * @private
   */
  this.gridHeightCache_ = [];

  /**
   * Index of currently hovered row.
   * @type {number|undefined}
   */
  this.hoveredIndex = -1;

  /**
   * Currently selected data item.
   * @type {anychart.treeDataModule.Tree.DataItem}
   */
  this.selectedItem = null;

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
   * Flag whether the position must be redrawn.
   * @type {boolean}
   * @protected
   */
  this.redrawPosition = false;

  /**
   * Flag whether grid is in dragging progress.
   * NOTE: this flag indicates any dragging progress to avoid triggering rowSelect action on drag end.
   * @type {boolean}
   */
  this.dragging = false;

  /**
   * Item that is currently under dragging.
   * @type {anychart.treeDataModule.Tree.DataItem}
   */
  this.draggingItem = null;

  /**
   * Flag whether alt is pressed.
   * @type {boolean}
   */
  this.altKey = false;

  /**
   * Current scroll interval.
   * @type {?number}
   */
  this.scrollInterval = null;

  /**
   * Scroll offset X.
   * @type {number}
   */
  this.scrollOffsetX = 0;

  /**
   * Scroll offset Y.
   * @type {number}
   */
  this.scrollOffsetY = 0;


  /**
   * Whether chart is interactive.
   * @type {boolean}
   */
  this.interactive = true;


  /**
   * Whether grid is editable.
   * @type {boolean}
   */
  this.editable = false;

  /**
   * Context provider.
   * @type {anychart.format.Context}
   * @private
   */
  this.formatProvider_ = null;

  /**
   * Tooltip.
   * @type {anychart.core.ui.Tooltip}
   * @private
   */
  this.tooltip_ = null;

  /**
   * @type {boolean}
   */
  this.preventClickAfterDrag = false;

  this.bindHandlersToComponent(this, this.handleMouseOverAndMove_, this.handleMouseOut_, this.handleMouseClick_,
      this.handleMouseOverAndMove_, this.handleAll_);

  function beforeRowFillInvalidation() {
    this.setOption('rowOddFill', null);
    this.setOption('rowEvenFill', null);
  }
  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['backgroundFill', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['rowFill', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW, void 0, beforeRowFillInvalidation],
    ['rowEvenFill', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['rowOddFill', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['rowHoverFill', 0, 0],
    ['rowSelectedFill', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW]
  ]);
};
goog.inherits(anychart.ganttModule.BaseGrid, anychart.core.VisualBaseWithBounds);


//----------------------------------------------------------------------------------------------------------------------
//
//  General.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Supported signals.
 * @type {number}
 */
anychart.ganttModule.BaseGrid.SUPPORTED_SIGNALS = anychart.core.VisualBaseWithBounds.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistence states.
 * @type {number}
 */
anychart.ganttModule.BaseGrid.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBaseWithBounds.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.APPEARANCE | //Coloring.
    anychart.ConsistencyState.GRIDS_POSITION | //Any vertical grid position change.
    anychart.ConsistencyState.BASE_GRID_REDRAW; //Light redraw. We use this state to highlight a row without redrawing all or smth like that.


/**
 * Background rect z-index.
 * @type {number}
 */
anychart.ganttModule.BaseGrid.BG_RECT_Z_INDEX = 10;


/**
 * Events rect z-index.
 * @type {number}
 */
anychart.ganttModule.BaseGrid.EVENTS_RECT_Z_INDEX = 20;


/**
 * Cells layer z-index.
 * @type {number}
 */
anychart.ganttModule.BaseGrid.CELLS_Z_INDEX = 30;


/**
 * Draw layer z-index.
 * @type {number}
 */
anychart.ganttModule.BaseGrid.DRAW_Z_INDEX = 35;


/**
 * Content layer z-index.
 * @type {number}
 */
anychart.ganttModule.BaseGrid.CONTENT_Z_INDEX = 40;


/**
 * Edit layer z-index.
 * @type {number}
 */
anychart.ganttModule.BaseGrid.EDIT_Z_INDEX = 45;


/**
 * Additional layer z-index.
 * @type {number}
 */
anychart.ganttModule.BaseGrid.CLIP_Z_INDEX = 50;


/**
 * Tooltip z-index.
 * @type {number}
 */
anychart.ganttModule.BaseGrid.TOOLTIP_Z_INDEX = 50;


/**
 * Scrolls layer z-index.
 * @type {number}
 */
anychart.ganttModule.BaseGrid.SCROLLS_Z_INDEX = 60;


/**
 * The scroll timer step in ms.
 * @type {number}
 */
anychart.ganttModule.BaseGrid.TIMER_STEP = 100;


/**
 * The scroll step in px.
 * @type {number}
 */
anychart.ganttModule.BaseGrid.SCROLL_STEP = 30;


/**
 * The suggested scrolling margin.
 * @type {number}
 */
anychart.ganttModule.BaseGrid.MARGIN = 32;


/**
 * We start scrolling on mouse move event when mouse leaves container's bounds.
 * This value is a border inside of bounds when scrolling starts.
 * @type {number}
 */
anychart.ganttModule.BaseGrid.SCROLL_MOUSE_OUT_INSIDE_LENGTH = 10;


/**
 * Lower drag edit ratio.
 * TODO (A.Kudryavtsev): Describe.
 * @type {number}
 */
anychart.ganttModule.BaseGrid.LOWER_DRAG_EDIT_RATIO = .2;


/**
 * Higher drag edit ratio.
 * TODO (A.Kudryavtsev): Describe.
 * @type {number}
 */
anychart.ganttModule.BaseGrid.HIGHER_DRAG_EDIT_RATIO = 1 - anychart.ganttModule.BaseGrid.LOWER_DRAG_EDIT_RATIO;


/**
 * Checks whether tree data item is actually a milestone.
 * @param {(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)} treeDataItem - Tree data item.
 * @return {boolean} - Whether tree data item is milestone.
 */
anychart.ganttModule.BaseGrid.isMilestone = function(treeDataItem) {
  var actualStart = treeDataItem.meta(anychart.enums.GanttDataFields.ACTUAL_START);
  var actualEnd = treeDataItem.meta(anychart.enums.GanttDataFields.ACTUAL_END);
  return goog.isDef(actualStart) && ((!isNaN(actualStart) && !goog.isDef(actualEnd)) || (actualStart == actualEnd));
};


/** @inheritDoc */
anychart.ganttModule.BaseGrid.prototype.createFormatProvider = function(item, opt_period, opt_periodIndex) {
  if (!this.formatProvider_)
    this.formatProvider_ = new anychart.format.Context();

  var isResources = this.controller.isResources();
  var values = {
    'item': {value: item, type: anychart.enums.TokenType.UNKNOWN},
    'name': {value: item.get(anychart.enums.GanttDataFields.NAME), type: anychart.enums.TokenType.STRING},
    'id': {value: item.get(anychart.enums.GanttDataFields.ID), type: anychart.enums.TokenType.STRING}
  };

  if (isResources) {
    values['minPeriodDate'] = {value: item.meta('minPeriodDate'), type: anychart.enums.TokenType.DATE_TIME};
    values['maxPeriodDate'] = {value: item.meta('maxPeriodDate'), type: anychart.enums.TokenType.DATE_TIME};
    values['period'] = {value: opt_period, type: anychart.enums.TokenType.UNKNOWN};
    values['periodIndex'] = {
      value: (goog.isDefAndNotNull(opt_periodIndex) && opt_periodIndex > 0) ? opt_periodIndex : void 0,
      type: anychart.enums.TokenType.NUMBER
    };
    values['periodStart'] = {
      value: opt_period ?
          item.getMeta(anychart.enums.GanttDataFields.PERIODS, opt_periodIndex, anychart.enums.GanttDataFields.START) :
          void 0, type: anychart.enums.TokenType.DATE_TIME
    };
    values['periodEnd'] = {
      value: opt_period ?
          item.getMeta(anychart.enums.GanttDataFields.PERIODS, opt_periodIndex, anychart.enums.GanttDataFields.END) :
          void 0, type: anychart.enums.TokenType.DATE_TIME
    };
    values['start'] = {value: values['periodStart'].value || values['minPeriodDate'].value, type: anychart.enums.TokenType.DATE_TIME};
    values['end'] = {value: values['periodEnd'].value || values['maxPeriodDate'].value, type: anychart.enums.TokenType.DATE_TIME};
    values['barBounds'] = {value: item.getMeta('periodBounds', opt_periodIndex), type: anychart.enums.TokenType.UNKNOWN};
  } else {
    values['actualStart'] = {value: item.meta(anychart.enums.GanttDataFields.ACTUAL_START), type: anychart.enums.TokenType.DATE_TIME};
    values['actualEnd'] = {value: item.meta(anychart.enums.GanttDataFields.ACTUAL_END), type: anychart.enums.TokenType.DATE_TIME};
    values['progressValue'] = {value: item.get(anychart.enums.GanttDataFields.PROGRESS_VALUE), type: anychart.enums.TokenType.PERCENT};

    var isParent = !!item.numChildren();
    values['autoStart'] = {value: isParent ? item.meta('autoStart') : void 0, type: anychart.enums.TokenType.DATE_TIME};
    values['autoEnd'] = {value: isParent ? item.meta('autoEnd') : void 0, type: anychart.enums.TokenType.DATE_TIME};
    values['autoProgress'] = {value: isParent ? item.meta('autoProgress') : void 0, type: anychart.enums.TokenType.PERCENT};
    values['barBounds'] = {value: item.meta('relBounds'), type: anychart.enums.TokenType.UNKNOWN};

    var progress = item.meta(anychart.enums.GanttDataFields.PROGRESS_VALUE);
    var progressPresents = goog.isDef(progress);
    var autoProgress = item.meta('autoProgress');
    var autoProgressPresents = goog.isDef(autoProgress);
    var resultProgress = progressPresents ? progress : (autoProgressPresents ? autoProgress : 0);
    resultProgress = anychart.utils.isPercent(resultProgress) ? parseFloat(resultProgress) / 100 : Number(resultProgress);
    values['progress'] = {value: resultProgress, type: anychart.enums.TokenType.PERCENT};

    if (goog.isDef(item.get(anychart.enums.GanttDataFields.BASELINE_START)))
      values['baselineStart'] = {value: item.get(anychart.enums.GanttDataFields.BASELINE_START), type: anychart.enums.TokenType.DATE_TIME};
    if (goog.isDef(item.get(anychart.enums.GanttDataFields.BASELINE_END)))
      values['baselineEnd'] = {value: item.get(anychart.enums.GanttDataFields.BASELINE_END), type: anychart.enums.TokenType.DATE_TIME};
  }

  this.formatProvider_
      .values(values)
      .dataSource(item);

  return this.formatProvider_.propagate();
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Interactivity.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Mouse click internal handler.
 * @param {anychart.core.MouseEvent} event - Event object.
 * @private
 */
anychart.ganttModule.BaseGrid.prototype.handleMouseClick_ = function(event) {
  if (!this.preventClickAfterDrag) {
    if (this.interactive) {
      var click = this.getInteractivityEvent(event);

      if (click && !this.interactivityHandler.altKey) {
        var mouseUp = goog.object.clone(click);
        mouseUp['type'] = anychart.enums.EventType.ROW_MOUSE_UP;
        var upDispatched = this.interactivityHandler.dispatchEvent(mouseUp);
        var clickDispatched = this.interactivityHandler.dispatchEvent(click);
        if (upDispatched && clickDispatched) {
          this.interactivityHandler.rowClick(click);
        }
      } else {
        this.interactivityHandler.rowUnselect(click);
      }
    } else {
      this.interactive = true;
    }
  }
  this.preventClickAfterDrag = false;
};


/**
 * Additional actions for inherited classes on mouse move while dragging.
 * @param {Object} evt - Event object.
 */
anychart.ganttModule.BaseGrid.prototype.addDragMouseMove = goog.nullFunction;


/**
 * Additional actions for inherited classes on mouse up after dragging.
 * @param {Object} evt - Event object.
 */
anychart.ganttModule.BaseGrid.prototype.addDragMouseUp = goog.nullFunction;


/**
 * Additional actions for inherited classes on mouse move and over.
 * @param {?Object} evt - Event object.
 */
anychart.ganttModule.BaseGrid.prototype.addMouseMoveAndOver = goog.nullFunction;


/**
 * Additional actions for inherited classes on mouse down.
 * @param {?Object} evt - Event object.
 */
anychart.ganttModule.BaseGrid.prototype.addMouseDown = goog.nullFunction;


/**
 * Additional actions for inherited classes on mouse up.
 * @param {?Object} evt - Event object.
 */
anychart.ganttModule.BaseGrid.prototype.addMouseUp = goog.nullFunction;


/**
 * Additional actions for inherited classes on mouse double click.
 * @param {?Object} evt - Event object.
 */
anychart.ganttModule.BaseGrid.prototype.addMouseDblClick = goog.nullFunction;


/**
 * Mouse over and move internal handler.
 * @param {anychart.core.MouseEvent} event - Event object.
 * @private
 */
anychart.ganttModule.BaseGrid.prototype.handleMouseOverAndMove_ = function(event) {
  var evt = this.getInteractivityEvent(event);
  this.addMouseMoveAndOver(evt);
  if (evt && this.interactive && this.interactivityHandler.dispatchEvent(evt)) {
    this.interactivityHandler.rowMouseMove(evt);
  }
};


/**
 * "All" internal handler.
 * @param {anychart.core.MouseEvent} event - Event object.
 * @private
 */
anychart.ganttModule.BaseGrid.prototype.handleAll_ = function(event) {
  var type = event['type'];
  switch (type) {
    case acgraph.events.EventType.DBLCLICK:
      this.handleDblMouseClick_(event);
      break;
    case acgraph.events.EventType.MOUSEDOWN:
    case acgraph.events.EventType.TOUCHSTART:
      this.handleMouseDown_(event);
      break;
    case acgraph.events.EventType.MOUSEUP:
    case acgraph.events.EventType.TOUCHEND:
      this.handleMouseUp_(event);
      break;
    case acgraph.events.EventType.CONTEXTMENU:
      this.interactivityHandler.dispatchEvent(event);
  }
};


/**
 * Mouse double click internal handler.
 * @param {anychart.core.MouseEvent} event - Event object.
 * @private
 */
anychart.ganttModule.BaseGrid.prototype.handleDblMouseClick_ = function(event) {
  var evt = this.getInteractivityEvent(event);
  this.addMouseDblClick(evt);
  if (this.interactive) {
    if (evt && this.interactivityHandler.dispatchEvent(evt))
      this.interactivityHandler.rowDblClick(evt);
  } else {
    this.interactive = true;
  }
};


/**
 * Mouse out internal handler.
 * @param {anychart.core.MouseEvent} event - Event object.
 * @private
 */
anychart.ganttModule.BaseGrid.prototype.handleMouseOut_ = function(event) {
  if (this.interactive) {
    var evt = this.getInteractivityEvent(event);
    if (evt && this.interactivityHandler.dispatchEvent(evt)) {
      this.interactivityHandler.rowMouseOut(evt);
    }
  }
};


/**
 * Mouse down internal handler.
 * @param {anychart.core.MouseEvent} event - Event object.
 * @private
 */
anychart.ganttModule.BaseGrid.prototype.handleMouseDown_ = function(event) {
  var evt = this.getInteractivityEvent(event);
  this.addMouseDown(evt);
  if (this.interactive) {
    event.preventDefault();
    if (evt && this.interactivityHandler.dispatchEvent(evt)) {
      this.interactivityHandler.rowMouseDown(evt);
    }
  }
};


/**
 * Mouse up internal handler.
 * @param {anychart.core.MouseEvent} event - Event object.
 * @private
 */
anychart.ganttModule.BaseGrid.prototype.handleMouseUp_ = function(event) {
  var evt = this.getInteractivityEvent(event);
  this.addMouseUp(evt);
  if (this.interactive) {
    if (evt && this.interactivityHandler.dispatchEvent(evt)) {
      this.interactivityHandler.rowMouseUp(evt);
    }
  }
  this.tooltip().hide();
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Interface.
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.ganttModule.BaseGrid.prototype.rowClick = function(event) {
  this.rowSelect(event);
};


/** @inheritDoc */
anychart.ganttModule.BaseGrid.prototype.rowDblClick = function(event) {
  this.rowExpandCollapse(event);
};


/** @inheritDoc */
anychart.ganttModule.BaseGrid.prototype.rowSelect = function(event) {
  if (this.interactive) {
    var item = event['item'];
    if (this.selectRow(item)) {
      var eventObj = goog.object.clone(event);
      eventObj['type'] = anychart.enums.EventType.ROW_SELECT;
      this.interactivityHandler.dispatchEvent(eventObj);
    }
  }
};


/** @inheritDoc */
anychart.ganttModule.BaseGrid.prototype.rowExpandCollapse = function(event) {
  var item = event['item'];
  if (item && item.numChildren()) {
    var value = !item.meta(anychart.enums.GanttDataFields.COLLAPSED);
    var evtObj = {
      'type': anychart.enums.EventType.ROW_COLLAPSE_EXPAND,
      'item': item,
      'collapsed': value
    };

    if (this.interactivityHandler.dispatchEvent(evtObj))
      item.meta(anychart.enums.GanttDataFields.COLLAPSED, value);
  }
};


/** @inheritDoc */
anychart.ganttModule.BaseGrid.prototype.rowMouseMove = function(event) {
  if (!this.dragging) {
    this.interactivityHandler.highlight(event['hoveredIndex'], event['startY'], event['endY']);
    var tooltip = /** @type {anychart.core.ui.Tooltip} */(this.tooltip());
    var formatProvider = this.interactivityHandler.createFormatProvider(event['item'], event['period'], event['periodIndex']);
    tooltip.showFloat(event['originalEvent']['clientX'], event['originalEvent']['clientY'], formatProvider);
  }
};


/** @inheritDoc */
anychart.ganttModule.BaseGrid.prototype.rowMouseOver = goog.nullFunction;


/** @inheritDoc */
anychart.ganttModule.BaseGrid.prototype.rowMouseOut = function(event) {
  this.interactivityHandler.highlight();
  this.tooltip().hide();
};


/** @inheritDoc */
anychart.ganttModule.BaseGrid.prototype.rowMouseUp = goog.nullFunction;


/** @inheritDoc */
anychart.ganttModule.BaseGrid.prototype.rowMouseDown = goog.nullFunction;


/**
 * Calls this method when we move the mouse out of grid. That's why both offsetX and offsetY can't equal 0.
 * @param {goog.fx.DragEvent=} opt_event - Event.
 */
/*
  Illustration for this method:
  (Grid is rectangle in center)

    offsetX < 0  |  !offsetX      |  offsetX > 0
    offsetY < 0  |  offsetY < 0   |  offsetY < 0

    ------------ +----------------+ --------------
                 |                |
    offsetX < 0  |  !offsetX      |  offsetX > 0
    !offsetY     |  !offsetX      |  !offsetY
                 |                |
    ------------ +----------------+ --------------

    offsetX < 0  |  !offsetX      |  offsetX > 0
    offsetY > 0  |  offsetY > 0   |  offsetY > 0

 */
anychart.ganttModule.BaseGrid.prototype.mouseOutMove = goog.nullFunction;


/**
 * Creates new event object to be dispatched.
 * @param {anychart.core.MouseEvent|goog.fx.DragEvent} event - Incoming event.
 * @return {?Object} - New event object to be dispatched.
 */
anychart.ganttModule.BaseGrid.prototype.getInteractivityEvent = function(event) {
  if (this.gridHeightCache_.length) {
    var visibleItems = this.controller.getVisibleItems();
    var startIndex = /** @type {number} */(this.controller.startIndex());
    var item;
    var type = event.type;
    switch (type) {
      case acgraph.events.EventType.MOUSEOUT:
        type = anychart.enums.EventType.ROW_MOUSE_OUT;
        if (this.hoveredIndex >= 0) item = visibleItems[startIndex + this.hoveredIndex];
        break;
      case acgraph.events.EventType.MOUSEOVER:
        type = anychart.enums.EventType.ROW_MOUSE_OVER;
        break;
      case acgraph.events.EventType.MOUSEMOVE:
      case acgraph.events.EventType.TOUCHMOVE:
        type = anychart.enums.EventType.ROW_MOUSE_MOVE;
        break;
      case acgraph.events.EventType.MOUSEDOWN:
      case acgraph.events.EventType.TOUCHSTART:
        type = anychart.enums.EventType.ROW_MOUSE_DOWN;
        break;
      case acgraph.events.EventType.MOUSEUP:
      case acgraph.events.EventType.TOUCHEND:
        type = anychart.enums.EventType.ROW_MOUSE_UP;
        break;
      case acgraph.events.EventType.CLICK:
        type = anychart.enums.EventType.ROW_CLICK;
        break;
      case acgraph.events.EventType.DBLCLICK:
        type = anychart.enums.EventType.ROW_DBL_CLICK;
        break;
    }

    var newEvent = {
      'type': type,
      'actualTarget': event.target,
      'target': this,
      'originalEvent': event
    };

    var initialTop = /** @type {number} */ (this.pixelBoundsCache.top + this.headerHeight_ + 1);

    var min = this.pixelBoundsCache.top +
        this.container().getStage().getClientPosition().y +
        this.headerHeight_;

    var mouseHeight = event.clientY - min;

    var totalHeight = this.gridHeightCache_.length ? this.gridHeightCache_[this.gridHeightCache_.length - 1] : 0;

    if (item) {
      newEvent['item'] = item;
    } else if (mouseHeight < 0 || mouseHeight > totalHeight) {
      return null;
    } else {
      var index = goog.array.binarySearch(this.gridHeightCache_, mouseHeight);
      index = index >= 0 ? index : ~index; //Index of row under mouse.
      this.hoveredIndex = index;

      var startHeight = index ? this.gridHeightCache_[index - 1] : 0;
      var startY = initialTop + startHeight;
      var endY = startY + (this.gridHeightCache_[index] - startHeight - this.rowStrokeThickness);

      newEvent['item'] = visibleItems[startIndex + index];
      newEvent['startY'] = startY;
      newEvent['endY'] = endY;
      newEvent['hoveredIndex'] = this.hoveredIndex;
      newEvent['index'] = startIndex + index;
      newEvent['itemHeightMouseRatio'] = (mouseHeight - startHeight) / (this.gridHeightCache_[index] - startHeight);
    }
    return newEvent;
  }
  return null;
};


/**
 * @inheritDoc
 */
anychart.ganttModule.BaseGrid.prototype.editing = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.editable != opt_value) {
      this.editable = opt_value;

      if (this.editable)
        goog.events.listen(anychart.document, goog.events.EventType.MOUSEMOVE, this.docMouseMoveListener_, false, this);
      else
        goog.events.unlisten(anychart.document, goog.events.EventType.MOUSEMOVE, this.docMouseMoveListener_, false, this);

      //for Timeline instance this state wil initiate connectors redraw (will set new cursors for connectors).
      this.invalidate(anychart.ConsistencyState.BASE_GRID_REDRAW, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.editable;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  DOM init.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Inner getter for this.base_.
 * Initializes and returns base layer.
 * @return {acgraph.vector.Layer}
 */
anychart.ganttModule.BaseGrid.prototype.getBase = function() {
  if (!this.base_) {
    this.base_ = /** @type {acgraph.vector.Layer} */ (acgraph.layer());
    //We handle mouseDown here to prevent double click selection.
    this.bindHandlersToGraphics(this.base_, null, null, null, null, /** @type {Function} */ (this.handleMouseDown_));

    this.registerDisposable(this.base_);
  }
  return this.base_;
};


/**
 * Inner getter for this.cellsLayer_.
 * @return {acgraph.vector.Layer}
 */
anychart.ganttModule.BaseGrid.prototype.getCellsLayer = function() {
  if (!this.cellsLayer_) {
    this.cellsLayer_ = /** @type {acgraph.vector.Layer} */ (acgraph.layer());
    this.cellsLayer_.zIndex(anychart.ganttModule.BaseGrid.CELLS_Z_INDEX);
    this.registerDisposable(this.cellsLayer_);
  }
  return this.cellsLayer_;
};


/**
 * Inner getter for this.drawLayer_.
 * @return {acgraph.vector.Layer}
 */
anychart.ganttModule.BaseGrid.prototype.getDrawLayer = function() {
  if (!this.drawLayer_) {
    this.drawLayer_ = /** @type {acgraph.vector.Layer} */ (acgraph.layer());
    this.drawLayer_.zIndex(anychart.ganttModule.BaseGrid.DRAW_Z_INDEX);
    this.registerDisposable(this.drawLayer_);
  }
  return this.drawLayer_;
};


/**
 * Inner getter for this.contentLayer_.
 * @return {acgraph.vector.Layer}
 */
anychart.ganttModule.BaseGrid.prototype.getContentLayer = function() {
  if (!this.contentLayer_) {
    this.contentLayer_ = /** @type {acgraph.vector.Layer} */ (acgraph.layer());
    this.contentLayer_.zIndex(anychart.ganttModule.BaseGrid.CONTENT_Z_INDEX);
    this.registerDisposable(this.contentLayer_);
  }
  return this.contentLayer_;
};


/**
 * Inner getter for this.editLayer_.
 * @return {acgraph.vector.Layer}
 */
anychart.ganttModule.BaseGrid.prototype.getEditLayer = function() {
  if (!this.editLayer_) {
    this.editLayer_ = /** @type {acgraph.vector.Layer} */ (acgraph.layer());
    this.editLayer_.zIndex(anychart.ganttModule.BaseGrid.EDIT_Z_INDEX);
    this.registerDisposable(this.editLayer_);
  }
  return this.editLayer_;
};


/**
 * Inner getter for this.clipLayer_.
 * @return {acgraph.vector.Layer}
 */
anychart.ganttModule.BaseGrid.prototype.getClipLayer = function() {
  if (!this.clipLayer_) {
    this.clipLayer_ = /** @type {acgraph.vector.Layer} */ (acgraph.layer());
    this.clipLayer_.zIndex(anychart.ganttModule.BaseGrid.CLIP_Z_INDEX);
    this.registerDisposable(this.clipLayer_);
  }
  return this.clipLayer_;
};


/**
 * Inner getter for this.scrollsLayer_.
 * @return {acgraph.vector.Layer}
 */
anychart.ganttModule.BaseGrid.prototype.getScrollsLayer = function() {
  if (!this.scrollsLayer_) {
    this.scrollsLayer_ = /** @type {acgraph.vector.Layer} */ (acgraph.layer());
    this.scrollsLayer_.zIndex(anychart.ganttModule.BaseGrid.SCROLLS_Z_INDEX);
    this.registerDisposable(this.scrollsLayer_);
  }
  return this.scrollsLayer_;
};


/**
 * Getter for this.oddPath_.
 * @return {acgraph.vector.Path}
 */
anychart.ganttModule.BaseGrid.prototype.getOddPath = function() {
  if (!this.oddPath_) {
    this.oddPath_ = /** @type {acgraph.vector.Path} */ (this.getCellsLayer().path());
    this.oddPath_.stroke(null).zIndex(1);
    this.registerDisposable(this.oddPath_);
  }
  return this.oddPath_;
};


/**
 * Getter for this.evenPath_.
 * @return {acgraph.vector.Path}
 */
anychart.ganttModule.BaseGrid.prototype.getEvenPath = function() {
  if (!this.evenPath_) {
    this.evenPath_ = /** @type {acgraph.vector.Path} */ (this.getCellsLayer().path());
    this.evenPath_.stroke(null).zIndex(1);
    this.registerDisposable(this.evenPath_);
  }
  return this.evenPath_;
};


/**
 * Getter for this.hoverPath_.
 * @return {acgraph.vector.Path}
 */
anychart.ganttModule.BaseGrid.prototype.getHoverPath = function() {
  if (!this.hoverPath_) {
    this.hoverPath_ = /** @type {acgraph.vector.Path} */ (this.getCellsLayer().path());
    this.hoverPath_.stroke(null)/*.fill(/!** @type {acgraph.vector.Fill} *!/(this.getOption('rowHoverFill')))*/.zIndex(2);
    this.registerDisposable(this.hoverPath_);
  }
  return this.hoverPath_;
};


/**
 * Getter for this.selectedPath_.
 * @return {acgraph.vector.Path}
 */
anychart.ganttModule.BaseGrid.prototype.getSelectedPath = function() {
  if (!this.selectedPath_) {
    this.selectedPath_ = /** @type {acgraph.vector.Path} */ (this.getCellsLayer().path());
    this.selectedPath_.stroke(null)/*.fill(/!** @type {acgraph.vector.Fill} *!/(this.getOption('rowSelectedFill')))*/.zIndex(3);
    this.registerDisposable(this.selectedPath_);
  }
  return this.selectedPath_;
};


/**
 * Getter for this.rowStrokePath_.
 * @return {acgraph.vector.Path}
 */
anychart.ganttModule.BaseGrid.prototype.getRowStrokePath = function() {
  if (!this.rowStrokePath_) {
    this.rowStrokePath_ = /** @type {acgraph.vector.Path} */ (this.getCellsLayer().path());
    this.rowStrokePath_.stroke(this.rowStroke_).zIndex(4);
    this.registerDisposable(this.rowStrokePath_);
  }
  return this.rowStrokePath_;
};


/**
 * Inner getter for this.editStructurePreviewPath_.
 * @return {acgraph.vector.Path}
 * @private
 */
anychart.ganttModule.BaseGrid.prototype.getEditStructurePreviewPath_ = function() {
  if (!this.editStructurePreviewPath_) {
    this.editStructurePreviewPath_ = this.getEditLayer().path();
    this.registerDisposable(this.editStructurePreviewPath_);
  }
  return this.editStructurePreviewPath_;
};


/**
 * Getter for this.headerSeparationPath_.
 * @return {acgraph.vector.Path}
 */
anychart.ganttModule.BaseGrid.prototype.getHeaderSeparationPath = function() {
  if (!this.headerSeparationPath_) {
    this.headerSeparationPath_ = /** @type {acgraph.vector.Path} */ (this.getCellsLayer().path());
    this.headerSeparationPath_.zIndex(40);
    this.registerDisposable(this.headerSeparationPath_);
  }
  return this.headerSeparationPath_;
};


//region --- Coloring
/**
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.ganttModule.BaseGrid.COLOR_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  anychart.core.settings.createDescriptors(map, [
    // grid coloring
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'backgroundFill', anychart.core.settings.fillNormalizer],

    // row coloring
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'rowFill', anychart.core.settings.fillNormalizer],
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'rowEvenFill', anychart.core.settings.fillNormalizer],
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'rowOddFill', anychart.core.settings.fillNormalizer],
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'rowHoverFill', anychart.core.settings.fillOrFunctionNormalizer],
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'rowSelectedFill', anychart.core.settings.fillOrFunctionNormalizer]
  ]);
  return map;
})();
anychart.core.settings.populate(anychart.ganttModule.BaseGrid, anychart.ganttModule.BaseGrid.COLOR_DESCRIPTORS);


/**
 * Annotations cache of resolver functions.
 * @type {Object.<string, function(anychart.ganttModule.BaseGrid, number, (anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)=, (anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)=, anychart.enums.ConnectorType=, number=, number=):(acgraph.vector.Fill|acgraph.vector.Stroke|acgraph.vector.PatternFill)>}
 * @private
 */
anychart.ganttModule.BaseGrid.colorResolversCache_ = {};


/**
 * Returns a color resolver for passed color names and type.
 * @param {(string|null|boolean)} colorName
 * @param {anychart.enums.ColorType} colorType
 * @param {boolean} canBeHoveredSelected Whether need to resolve hovered selected colors
 * @return {function(anychart.ganttModule.BaseGrid, number, (anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)=, (anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)=, anychart.enums.ConnectorType=, number=, number=):acgraph.vector.AnyColor}
 */
anychart.ganttModule.BaseGrid.getColorResolver = function(colorName, colorType, canBeHoveredSelected) {
  if (!colorName) return anychart.color.getNullColor;
  var hash = colorType + '|' + colorName + '|' + canBeHoveredSelected;
  var result = anychart.ganttModule.BaseGrid.colorResolversCache_[hash];
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
    anychart.ganttModule.BaseGrid.colorResolversCache_[hash] = result = goog.partial(anychart.ganttModule.BaseGrid.getColor_,
        colorName, normalizerFunc, colorType == anychart.enums.ColorType.HATCH_FILL, canBeHoveredSelected);
  }
  return result;
};


/**
 * Returns final color or hatch fill for passed params.
 * @param {string} colorName
 * @param {!Function} normalizer
 * @param {boolean} isHatchFill
 * @param {boolean} canBeHoveredSelected
 * @param {anychart.ganttModule.BaseGrid} baseGrid
 * @param {number} state
 * @param {(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)=} opt_dataItem
 * @param {(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)=} opt_dataItemTo
 * @param {anychart.enums.ConnectorType=} opt_connType
 * @param {number=} opt_periodIndex
 * @param {number=} opt_periodIndexTo
 * @return {acgraph.vector.Fill|acgraph.vector.Stroke|acgraph.vector.PatternFill}
 * @private
 */
anychart.ganttModule.BaseGrid.getColor_ = function(colorName, normalizer, isHatchFill, canBeHoveredSelected, baseGrid, state, opt_dataItem,  opt_dataItemTo, opt_connType, opt_periodIndex, opt_periodIndexTo) {
  var stateColor, context;
  state = anychart.core.utils.InteractivityState.clarifyState(state);
  if (canBeHoveredSelected && (state != anychart.PointState.NORMAL)) {
    stateColor = baseGrid.resolveOption(colorName, state, normalizer);
    if (isHatchFill && stateColor === true)
      stateColor = normalizer(baseGrid.getAutoHatchFill());
    if (goog.isDef(stateColor)) {
      if (!goog.isFunction(stateColor))
        return /** @type {acgraph.vector.Fill|acgraph.vector.Stroke|acgraph.vector.PatternFill} */(stateColor);
      else if (isHatchFill) { // hatch fills set as function some why cannot nest by initial implementation
        context = baseGrid.getHatchFillResolutionContext();
        return /** @type {acgraph.vector.PatternFill} */(normalizer(stateColor.call(context, context)));
      }
    }
  }
  // we can get here only if state color is undefined or is a function
  var color = baseGrid.resolveOption(colorName, 0, normalizer);
  if (isHatchFill && color === true)
    color = normalizer(baseGrid.getAutoHatchFill());
  if (goog.isFunction(color)) {
    context = isHatchFill ?
        baseGrid.getHatchFillResolutionContext() :
        baseGrid.getColorResolutionContext(colorName, opt_dataItem, opt_dataItemTo, opt_connType, opt_periodIndex, opt_periodIndexTo);
    color = /** @type {acgraph.vector.Fill|acgraph.vector.Stroke|acgraph.vector.PatternFill} */(normalizer(color.call(context, context)));
  }
  if (stateColor) { // it is a function and not a hatch fill here
    context = baseGrid.getColorResolutionContext(colorName, opt_dataItem, opt_dataItemTo, opt_connType);
    color = normalizer(stateColor.call(context, context));
  }
  return /** @type {acgraph.vector.Fill|acgraph.vector.Stroke|acgraph.vector.PatternFill} */(color);
};


/**
 * Implements option inheritance from base bar settings.
 * @param {string} name - .
 * @param {string} defaultName - .
 * @return {*}
 */
anychart.ganttModule.BaseGrid.prototype.getInheritedOption = function(name, defaultName) {
  var val = this.getOption(name);
  return goog.isDefAndNotNull(val) ? val : this.getOption(defaultName);
};


/**
 * Resolve annotation color option.
 * @param {string} name
 * @param {number} state
 * @param {Function} normalizer
 * @return {*}
 */
anychart.ganttModule.BaseGrid.prototype.resolveOption = function(name, state, normalizer) {
  if (name == 'rowSelectedFill' || name == 'rowHoverFill' || name == 'selectedElementFill' || name == 'selectedElementStroke') {
    return normalizer(this.getOption(name));
  } else {
    var isFill = goog.string.contains(name, 'Fill');
    var defaultName = isFill ? 'baseFill' : 'baseStroke';
    return normalizer(this.getInheritedOption(name, defaultName));
  }
};


/**
 * Returns source color for colorName.
 * @param {string} colorName
 * @param {anychart.palettes.RangeColors|anychart.palettes.DistinctColors} palette
 * @return {acgraph.vector.AnyColor}
 */
anychart.ganttModule.BaseGrid.prototype.getSourceColorFor = function(colorName, palette) {
  var sourceColor;
  switch (colorName) {
    case 'baseFill':
      sourceColor = palette.itemAt(0);
      break;
    case 'baseStroke':
      sourceColor = anychart.color.lighten(palette.itemAt(0));
      break;
    case 'progressFill':
      sourceColor = palette.itemAt(1);
      break;
    case 'progressStroke':
      sourceColor = {
        'color': '#fff',
        'opacity': 0.00001
      };
      break;
    case 'baselineFill':
      sourceColor = anychart.color.lighten(palette.itemAt(1), 0.7);
      break;
    case 'baselineStroke':
      sourceColor = anychart.color.darken(anychart.color.lighten(palette.itemAt(1), 0.7));
      break;
    case 'parentFill':
      sourceColor = palette.itemAt(4);
      break;
    case 'parentStroke':
      sourceColor = anychart.color.lighten(palette.itemAt(4));
      break;
    case 'milestoneFill':
      sourceColor = palette.itemAt(9);
      break;
    case 'milestoneStroke':
      sourceColor = anychart.color.darken(palette.itemAt(9));
      break;
    case 'selectedElementFill':
      sourceColor = palette.itemAt(2);
      break;
    case 'selectedElementStroke':
      sourceColor = anychart.color.darken(palette.itemAt(2));
      break;
    case 'selectedConnectorStroke':
      sourceColor = anychart.color.setThickness(/** @type {acgraph.vector.Stroke} */(anychart.color.lighten(palette.itemAt(2))), 2);
      break;
    case 'rowHoverFill':
      sourceColor = anychart.getFullTheme('ganttBase.defaultRowHoverFill');
      break;
    case 'rowSelectedFill':
      sourceColor = anychart.getFullTheme('ganttBase.defaultRowSelectedFill');
      break;
    default:
      sourceColor = 'blue';
  }
  return /** @type {acgraph.vector.AnyColor} */(sourceColor);
};


/**
 * Returns color resolution context.
 * This context is used to resolve a fill or stroke set as a function for current point.
 * @param {string} colorName
 * @param {(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)=} opt_dataItem
 * @param {(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)=} opt_dataItemTo
 * @param {anychart.enums.ConnectorType=} opt_connType
 * @param {number=} opt_periodIndex
 * @param {number=} opt_periodIndexTo
 * @return {Object}
 */
anychart.ganttModule.BaseGrid.prototype.getColorResolutionContext = function(colorName, opt_dataItem, opt_dataItemTo, opt_connType, opt_periodIndex, opt_periodIndexTo) {
  var palette = (/** @type {anychart.ganttModule.IInteractiveGrid} */(this.interactivityHandler)).palette();
  var sourceColor = this.getSourceColorFor(colorName, /** @type {anychart.palettes.RangeColors|anychart.palettes.DistinctColors} */ (palette));
  var rv = {
    'sourceColor': sourceColor
  };
  if (goog.isDefAndNotNull(opt_dataItem)) {
    if (goog.isDef(opt_connType)) {
      rv['fromItem'] = opt_dataItem;
      rv['fromItemIndex'] = opt_dataItem.meta('index');
      rv['toItem'] = opt_dataItemTo;
      rv['toItemIndex'] = opt_dataItemTo.meta('index');
      rv['connType'] = opt_connType;
    } else {
      rv['item'] = opt_dataItem;
      rv['itemIndex'] = opt_dataItem.meta('index');
    }

    if (goog.isDef(opt_periodIndex)) {
      if (goog.isDef(opt_periodIndexTo)) {
        var fromPeriod = opt_dataItem.get(anychart.enums.GanttDataFields.PERIODS)[opt_periodIndex];
        var toPeriod = opt_dataItemTo.get(anychart.enums.GanttDataFields.PERIODS)[opt_periodIndexTo];
        rv['fromPeriod'] = fromPeriod;
        rv['fromPeriodIndex'] = opt_periodIndex;
        rv['toPeriod'] = toPeriod;
        rv['toPeriodIndex'] = opt_periodIndexTo;
      } else {
        var period = opt_dataItem.get(anychart.enums.GanttDataFields.PERIODS)[opt_periodIndex];
        rv['period'] = period;
        rv['periodIndex'] = opt_periodIndex;
      }
    }
  }
  return rv;
};


/**
 * Returns hatch fill resolution context.
 * This context is used to resolve a hatch fill set as a function for current point.
 * @return {Object}
 */
anychart.ganttModule.BaseGrid.prototype.getHatchFillResolutionContext = function() {
  return {
    'sourceHatchFill': this.getAutoHatchFill()
  };
};


/**
 * Returns default hatch fill.
 * @return {acgraph.vector.PatternFill}
 */
anychart.ganttModule.BaseGrid.prototype.getAutoHatchFill = function() {
  return /*this.autoHatchFill || */acgraph.vector.normalizeHatchFill(acgraph.vector.HatchFill.HatchFillType.DIAGONAL_BRICK);
};


/** @inheritDoc */
anychart.ganttModule.BaseGrid.prototype.palette = function(opt_value) {
  if (anychart.utils.instanceOf(opt_value, anychart.palettes.RangeColors)) {
    this.setupPalette_(anychart.palettes.RangeColors, /** @type {anychart.palettes.RangeColors} */(opt_value));
    return this;
  } else if (anychart.utils.instanceOf(opt_value, anychart.palettes.DistinctColors)) {
    this.setupPalette_(anychart.palettes.DistinctColors, /** @type {anychart.palettes.DistinctColors} */(opt_value));
    return this;
  } else if (goog.isObject(opt_value) && opt_value['type'] == 'range') {
    this.setupPalette_(anychart.palettes.RangeColors);
  } else if (goog.isObject(opt_value) || this.palette_ == null)
    this.setupPalette_(anychart.palettes.DistinctColors);

  if (goog.isDef(opt_value)) {
    this.palette_.setup(opt_value);
    return this;
  }

  return /** @type {!(anychart.palettes.RangeColors|anychart.palettes.DistinctColors)} */(this.palette_);
};


/**
 * @param {Function} cls Palette constructor.
 * @param {(anychart.palettes.RangeColors|anychart.palettes.DistinctColors)=} opt_cloneFrom Settings to clone from.
 * @private
 */
anychart.ganttModule.BaseGrid.prototype.setupPalette_ = function(cls, opt_cloneFrom) {
  if (anychart.utils.instanceOf(this.palette_, cls)) {
    if (opt_cloneFrom)
      this.palette_.setup(opt_cloneFrom);
  } else {
    // we dispatch only if we replace existing palette.
    var doDispatch = !!this.palette_;
    goog.dispose(this.palette_);
    this.palette_ = new cls();
    if (opt_cloneFrom)
      this.palette_.setup(opt_cloneFrom);
    this.palette_.listenSignals(this.paletteInvalidated_, this);
    if (doDispatch)
      this.invalidate(anychart.ConsistencyState.BASE_GRID_REDRAW, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Internal palette invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.ganttModule.BaseGrid.prototype.paletteInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.BASE_GRID_REDRAW, anychart.Signal.NEEDS_REDRAW);
  }
};
//endregion


/**
 * Gets/sets a default editStructurePreviewFill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.ganttModule.BaseGrid|string} - Current value or itself for method chaining.
 */
anychart.ganttModule.BaseGrid.prototype.editStructurePreviewFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var val = acgraph.vector.normalizeFill.apply(null, arguments);
    if (!anychart.color.equals(/** @type {acgraph.vector.Fill} */ (this.editStructurePreviewFill_), val)) {
      this.editStructurePreviewFill_ = val;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.editStructurePreviewFill_;
};


/**
 * Gets/sets editStructurePreviewStroke.
 * @param {(acgraph.vector.Stroke|string)=} opt_value - Value to be set.
 * @return {(string|acgraph.vector.Stroke|anychart.ganttModule.BaseGrid)} - Current value or itself for method chaining.
 */
anychart.ganttModule.BaseGrid.prototype.editStructurePreviewStroke = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = acgraph.vector.normalizeStroke.apply(null, arguments);
    if (!anychart.color.equals(/** @type {acgraph.vector.Stroke} */ (this.editStructurePreviewStroke_), val)) {
      this.editStructurePreviewStroke_ = val;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }

    return this;
  }
  return this.editStructurePreviewStroke_;
};


/**
 * Gets/sets editStructurePreviewDashStroke.
 * @param {(acgraph.vector.Stroke|string)=} opt_value - Value to be set.
 * @return {(string|acgraph.vector.Stroke|anychart.ganttModule.BaseGrid)} - Current value or itself for method chaining.
 */
anychart.ganttModule.BaseGrid.prototype.editStructurePreviewDashStroke = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = acgraph.vector.normalizeStroke.apply(null, arguments);
    if (!anychart.color.equals(/** @type {acgraph.vector.Stroke} */ (this.editStructurePreviewDashStroke_), val)) {
      this.editStructurePreviewDashStroke_ = val;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }

    return this;
  }
  return this.editStructurePreviewDashStroke_;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Private.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Events rect mouse down handler.
 * @param {acgraph.events.BrowserEvent} e
 * @private
 */
anychart.ganttModule.BaseGrid.prototype.dragMouseDown_ = function(e) {
  if (anychart.utils.instanceOf(e.currentTarget, acgraph.vector.Element) && !this.scrollDragger) {
    this.scrollDragger = new anychart.ganttModule.BaseGrid.Dragger(this.base_, this);
    this.registerDisposable(this.scrollDragger);
    //this.scrollDragger.listen(goog.fx.Dragger.EventType.START, this.dragStartHandler_, false, this);

    this.scrollDragger.listen(goog.fx.Dragger.EventType.DRAG, this.dragHandler_, false, this);

    this.scrollDragger.listen(goog.fx.Dragger.EventType.END, this.dragEndHandler_, false, this);
    this.scrollDragger.startDrag(e.getOriginalEvent());
  }
};


/**
 * Drag start handler.
 * @param {goog.fx.DragEvent} e
 * @private
 */
anychart.ganttModule.BaseGrid.prototype.dragStartHandler_ = function(e) {
  this.scrollDragger.reset();
};


/**
 * Drag handler.
 * @param {goog.fx.DragEvent} e
 * @private
 */
anychart.ganttModule.BaseGrid.prototype.dragHandler_ = function(e) {
  this.dragging = true;
  if (this.editable && !this.denyDragScrolling) {
    this.interactive = false;
    this.interactivityHandler.highlight();
    this.tooltip().hide();
    var evt = this.getInteractivityEvent(e);
    if (evt) {
      var destinationItem = evt['item'];

      var itemHeightMouseRatio = evt['itemHeightMouseRatio'];
      var startY = evt['startY'];
      var endY = evt['endY'];

      if (this.draggingItem && destinationItem && destinationItem != this.draggingItem && !destinationItem.isChildOf(this.draggingItem)) {
        if (itemHeightMouseRatio < anychart.ganttModule.BaseGrid.LOWER_DRAG_EDIT_RATIO ||
            itemHeightMouseRatio > anychart.ganttModule.BaseGrid.HIGHER_DRAG_EDIT_RATIO) {
          var top = itemHeightMouseRatio < anychart.ganttModule.BaseGrid.LOWER_DRAG_EDIT_RATIO ? startY : endY;
          this.interactivityHandler.editStructureHighlight(top, void 0, 'auto');
        } else {
          if (anychart.ganttModule.BaseGrid.isMilestone(destinationItem)) {
            this.interactivityHandler.editStructureHighlight(void 0, void 0, 'not-allowed');
          } else {
            this.interactivityHandler.editStructureHighlight(startY, endY, 'auto');
          }
        }
      } else {
        this.interactivityHandler.editStructureHighlight(void 0, void 0, 'not-allowed');
      }
      this.addDragMouseMove(evt);
    }
  }
  this.tooltip().hide();
  this.preventClickAfterDrag = true;
};


/**
 * Drag end handler.
 * @param {goog.fx.DragEvent} e
 * @private
 */
anychart.ganttModule.BaseGrid.prototype.dragEndHandler_ = function(e) {
  if (this.editable && !this.denyDragScrolling) {
    var evt = this.getInteractivityEvent(e);

    this.addDragMouseUp(evt);

    if (evt) {
      var destinationItem = evt['item'];
      var hoveredIndex = evt['hoveredIndex'];
      var totalIndex = this.controller.startIndex() + hoveredIndex;

      var visibleItems = this.controller.getVisibleItems();


      var itemHeightMouseRatio = evt['itemHeightMouseRatio'];
      var firstItem, secondItem; //We drop item between these two.

      if (this.draggingItem && destinationItem && destinationItem != this.draggingItem && !anychart.ganttModule.BaseGrid.isMilestone(destinationItem) && !destinationItem.isChildOf(this.draggingItem)) {
        if (itemHeightMouseRatio < anychart.ganttModule.BaseGrid.LOWER_DRAG_EDIT_RATIO || itemHeightMouseRatio > anychart.ganttModule.BaseGrid.HIGHER_DRAG_EDIT_RATIO) {
          if (itemHeightMouseRatio < anychart.ganttModule.BaseGrid.LOWER_DRAG_EDIT_RATIO) {
            firstItem = visibleItems[totalIndex - 1];
            secondItem = destinationItem;
          } else {
            firstItem = destinationItem;
            secondItem = visibleItems[totalIndex + 1];
          }

          if (firstItem && secondItem) {
            var firstDepth = firstItem.meta('depth');
            var secondDepth = secondItem.meta('depth');
            var destIndex, tree;

            if (firstDepth == secondDepth) {
              var secondParent = secondItem.getParent() || secondItem.tree();
              destIndex = secondParent.indexOfChild(secondItem);

              var dragParent = this.draggingItem.getParent() || this.draggingItem.tree();
              if (dragParent == secondParent) {
                var dragIndex = dragParent.indexOfChild(this.draggingItem);
                if (dragIndex < destIndex) destIndex = Math.max(0, destIndex - 1);
              }

              //if firstDepth equals secondDepth, then the firstParent is the secondParent in this case.
              secondParent.addChildAt(this.draggingItem, destIndex);
            } else {
              if (firstDepth < secondDepth) { //Here firstItem is parent of secondItem.
                firstItem.addChildAt(this.draggingItem, 0); //The only case if firstItem is neighbour of secondItem.
              } else {
                var firstParent = firstItem.getParent() || firstItem.tree();
                destIndex = firstParent.indexOfChild(firstItem) + 1;
                firstParent.addChildAt(this.draggingItem, destIndex);
              }
            }
          } else if (secondItem) { //First item is undefined.
            //The only case - is when we drop between very first item and header of data grid.
            tree = secondItem.tree();
            tree.addChildAt(this.draggingItem, 0);
          } else if (firstItem) { //Second item is undefined.
            //The only case - is when we drop in the end of very last item of DG.
            tree = firstItem.getParent() || firstItem.tree();
            destIndex = tree.indexOfChild(firstItem) + 1;
            tree.addChildAt(this.draggingItem, destIndex);
          }
        } else {
          //Dropping data item inside. Setting dragged data item as child of destinationItem.
          destinationItem.addChild(this.draggingItem);
        }
      }
    }

    this.interactivityHandler.editStructureHighlight(void 0, void 0, 'auto');

    this.draggingItem = null;
  }
  this.scrollDragger.reset();
  this.dragging = false;
  this.interactive = true;
  clearInterval(this.scrollInterval);
  this.scrollInterval = null;
};


/**
 * Draws cells depending on data.
 * @private
 */
anychart.ganttModule.BaseGrid.prototype.drawRowFills_ = function() {
  var header = this.pixelBoundsCache.top + this.headerHeight_ + 1; //1px line always separates header from content

  var verticalOffset = this.controller.verticalOffset();
  var startIndex = /** @type {number} */(this.controller.startIndex());
  var endIndex = /** @type {number} */(this.controller.endIndex());
  var visibleItems = this.controller.getVisibleItems();

  var totalTop = (header - verticalOffset);
  this.interactivityHandler.highlight();
  this.gridHeightCache_.length = 0;

  this.getEvenPath().clear();
  this.getOddPath().clear();
  this.getSelectedPath().clear();
  this.getRowStrokePath().clear();

  var pixelShift = (this.rowStrokeThickness % 2 && acgraph.type() === acgraph.StageType.SVG) ? 0.5 : 0;

  for (var i = startIndex; i <= endIndex; i++) {
    var item = visibleItems[i];
    if (!item) break;

    var firstCell = (i == startIndex);

    var top = firstCell ? header : totalTop;

    var height = this.controller.getItemHeight(item);
    height = firstCell ? height - verticalOffset + 1 : height;

    /*
      Note: Straight indexing starts with 0 (this.visibleItems_[0], this.visibleItems_[1], this.visibleItems_[2]...).
      But for user numeration starts with 1 and looks like
        1. Item0
        2. Item1
        3. Item2

      That's why evenPath highlights odd value of i, and oddPath highlights even value of i.
     */
    var path = i % 2 ? this.evenPath_ : this.oddPath_;

    var newTop = /** @type {number} */ (top + height);
    path
        .moveTo(this.pixelBoundsCache.left, top)
        .lineTo(this.pixelBoundsCache.left + this.totalGridsWidth, top)
        .lineTo(this.pixelBoundsCache.left + this.totalGridsWidth, newTop)
        .lineTo(this.pixelBoundsCache.left, newTop)
        .close();

    if (item.meta('selected')) {
      this.selectedItem_ = item; //In case of restoration from XML/JSON, this allows to save selected item state.
      this.selectedPath_
          .moveTo(this.pixelBoundsCache.left, top)
          .lineTo(this.pixelBoundsCache.left + this.pixelBoundsCache.width, top)
          .lineTo(this.pixelBoundsCache.left + this.pixelBoundsCache.width, newTop)
          .lineTo(this.pixelBoundsCache.left, newTop)
          .close();
    }

    totalTop = (newTop + this.rowStrokeThickness);

    var strokePathTop = Math.floor(totalTop - this.rowStrokeThickness / 2) + pixelShift;
    this.rowStrokePath_
        .moveTo(this.pixelBoundsCache.left, strokePathTop)
        .lineTo(this.pixelBoundsCache.left + this.totalGridsWidth, strokePathTop);

    var h = totalTop - header;
    this.gridHeightCache_.push(h);
    this.totalGridsHeight = h;
  }

  var clipRect = new anychart.math.Rect(this.pixelBoundsCache.left, this.pixelBoundsCache.top - 1,
      this.pixelBoundsCache.width, totalTop - this.pixelBoundsCache.top + 1);
  this.getClipLayer().clip(clipRect);
  // this.getCellsLayer().clip(clipRect);
  this.getDrawLayer().clip(clipRect);

};


/**
 * Mouse wheel default handler.
 * TODO (A.Kudryavtsev): Test it carefully on Windows OS!
 * @param {goog.events.MouseWheelEvent} e - Mouse wheel event.
 * @private
 */
anychart.ganttModule.BaseGrid.prototype.mouseWheelHandler_ = function(e) {
  if (anychart.window['anychart']['ui']['ContextMenu']) {
    if (this.interactivityHandler.contextMenu) {
      var menu = this.interactivityHandler.contextMenu();
      if (menu.isVisible()) menu.hide();
    }
  }

  var dx = e.deltaX;
  var dy = e.deltaY;

  var scrollsVertically = Math.abs(dy) > 0;
  var scrollsHorizontally = Math.abs(dx) > 0;

  if (goog.userAgent.WINDOWS || goog.userAgent.GECKO) {
    dx = dx * 18;
    dy = dy * 18;
  }

  var denyBodyScrollLeft = !anychart.document['body']['scrollLeft'];
  var horizontalScroll = this.horizontalScrollBar();
  var verticalScroll = this.controller.getScrollBar();

  var scrollsUp, scrollsLeft;
  var preventHorizontally = false;
  var preventVertically = false;

  if (scrollsVertically) {
    scrollsUp = dy < 0;
    var vStart = verticalScroll.startRatio();
    var vEnd = verticalScroll.endRatio();
    preventVertically = (!vStart && vEnd == 1) ? false :
        ((vStart > 0 && vEnd < 1) ||
        (!vStart && !scrollsUp && vEnd != 1) ||
        (vEnd == 1 && scrollsUp && vStart != 0));
  }

  if (scrollsHorizontally) {
    scrollsLeft = dx < 0;
    var hStart = horizontalScroll.startRatio();
    var hEnd = horizontalScroll.endRatio();
    if (scrollsLeft) {
      preventHorizontally = (!hStart && hEnd == 1) ? denyBodyScrollLeft :
          (hStart > 0 && hEnd < 1) ||
          (hEnd == 1 && hStart != 0) ||
          (!hStart && denyBodyScrollLeft);
    } else {
      preventHorizontally = (!hStart && hEnd == 1) ? false :
          (hStart > 0 && hEnd < 1) ||
          (!hStart && hEnd != 1);
    }
  }

  /*
    Literally means that default page scrolling must be prevented and we scroll BaseGrid instead.
   */
  if (preventVertically || preventHorizontally) {
    e.preventDefault();
    this.scroll(dx, dy);
  }
};


/**
 * 'Needs reapplication' handler.
 * @param {anychart.SignalEvent} event - Incoming event.
 * @private
 */
anychart.ganttModule.BaseGrid.prototype.needsReapplicationHandler_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.dispatchSignal(anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Tooltip invalidation handler.
 * @param {anychart.SignalEvent} event - Event object.
 * @private
 */
anychart.ganttModule.BaseGrid.prototype.onTooltipSignal_ = function(event) {
  var tooltip = /** @type {anychart.core.ui.Tooltip} */(this.tooltip());
  tooltip.draw();
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Public.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Additional actions on appearance invalidation.
 */
anychart.ganttModule.BaseGrid.prototype.appearanceInvalidated = goog.nullFunction;


/**
 * Additional actions on bounds invalidation.
 */
anychart.ganttModule.BaseGrid.prototype.boundsInvalidated = goog.nullFunction;


/**
 * @inheritDoc
 */
anychart.ganttModule.BaseGrid.prototype.defaultRowHeight = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.controller.defaultRowHeight(opt_value);
    return this;
  }
  return /** @type {number} */ (this.controller.defaultRowHeight());
};


/**
 * Creates new controller.
 * @param {boolean=} opt_isResources - Whether controller must work in resources chart mode.
 * @protected
 */
anychart.ganttModule.BaseGrid.prototype.createController = function(opt_isResources) {
  this.controller = new anychart.ganttModule.Controller(opt_isResources);
  this.registerDisposable(this.controller);
  this.controller.listenSignals(this.needsReapplicationHandler_, this);
};


/**
 * This method actually draws a grid by this scheme:
 * grid.draw() --calls--> controller.run() --calls--> grid.drawInternal();
 *
 * NOTE: Inherited classes don't have drawInternal method, but the have an empty
 * methods to be overridden, included into base grid's drawInternal:
 * 1) initDom()
 * 2) boundsInvalidated()
 * 3) positionInvalidated()
 * 4) appearanceInvalidated()
 * 5) specialInvalidated()
 * 6) positionFinal()
 *
 * @param {boolean} positionRecalculated - If the vertical position was really recalculated.
 * @return {anychart.ganttModule.BaseGrid} - Itself for method chaining.
 */
anychart.ganttModule.BaseGrid.prototype.drawInternal = function(positionRecalculated) {
  if (positionRecalculated) this.invalidate(anychart.ConsistencyState.GRIDS_POSITION);

  if (!this.checkDrawingNeeded()) return this;

  var container = /** @type {acgraph.vector.ILayer} */(this.container());
  var stage = container ? container.getStage() : null;
  var manualSuspend = stage && !stage.isSuspended();
  if (manualSuspend) stage.suspend();

  var verticalScrollBar, horizontalScrollBar;

  //---------- Creating DOM structure ---------------
  if (!this.getBase().numChildren()) {
    this.bgRect_ = this.base_.rect();
    this.registerDisposable(this.bgRect_);
    this.bgRect_
        .fill(/** @type {acgraph.vector.Fill} */(this.getOption('backgroundFill')))
        .stroke(null)
        .zIndex(anychart.ganttModule.BaseGrid.BG_RECT_Z_INDEX);

    this.eventsRect_ = this.base_.rect();
    this.registerDisposable(this.eventsRect_);
    this.eventsRect_
        .fill(anychart.color.TRANSPARENT_HANDLER)
        .stroke(null)
        .zIndex(anychart.ganttModule.BaseGrid.EVENTS_RECT_Z_INDEX);

    this.base_
        .addChild(/** @type {!acgraph.vector.Layer} */ (this.getCellsLayer()))
        .addChild(/** @type {!acgraph.vector.Layer} */ (this.getDrawLayer()))
        .addChild(/** @type {!acgraph.vector.Layer} */ (this.getContentLayer()))
        .addChild(/** @type {!acgraph.vector.Layer} */ (this.getEditLayer()))
        .addChild(/** @type {!acgraph.vector.Layer} */ (this.getClipLayer()))
        .addChild(/** @type {!acgraph.vector.Layer} */ (this.getScrollsLayer()));

    if (this.isStandalone) {
      /*
        NOTE: For standalone mode only!
              Not standalone scrolls are controlled by chart.
       */
      verticalScrollBar = this.controller.getScrollBar();
      verticalScrollBar
          .container(this.getScrollsLayer())
          .listenSignals(function(event) {
            // bar size for example
            if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED))
              this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
            else
              verticalScrollBar.draw();
          }, this);
      this.registerDisposable(verticalScrollBar);
    }

    horizontalScrollBar = this.horizontalScrollBar();
    horizontalScrollBar
        .container(this.getScrollsLayer())
        .listenSignals(function(event) {
          if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) horizontalScrollBar.draw();
        }, horizontalScrollBar);
    this.registerDisposable(horizontalScrollBar);

    this.base_.listenOnce(acgraph.events.EventType.MOUSEDOWN, this.dragMouseDown_, false, this);
    this.base_.listenOnce(acgraph.events.EventType.TOUCHSTART, this.dragMouseDown_, false, this);

    this.initDom();
  }


  //---------- Consistency ---------------
  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    this.base_.parent(container);
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.pixelBoundsCache = /** @type {anychart.math.Rect} */ (this.getPixelBounds());
    this.base_.clip(/** @type {anychart.math.Rect} */ (this.pixelBoundsCache));
    this.bgRect_.setBounds(/** @type {anychart.math.Rect} */ (this.pixelBoundsCache));
    this.eventsRect_.setBounds(/** @type {anychart.math.Rect} */ (this.pixelBoundsCache));
    this.totalGridsWidth = this.pixelBoundsCache.width;

    var header = this.pixelBoundsCache.top + this.headerHeight_;
    var headSepTop = header + 0.5;

    this.getHeaderSeparationPath()
        .clear()
        .moveTo(this.pixelBoundsCache.left, headSepTop)
        .lineTo(this.pixelBoundsCache.left + this.totalGridsWidth, headSepTop);

    var barSize;
    if (this.isStandalone) {
      /*
        NOTE: For standalone mode only!
              Not standalone scrolls are controlled by chart.
       */
      verticalScrollBar = this.controller.getScrollBar();

      barSize = /** @type {number} */ (verticalScrollBar.barSize());
      verticalScrollBar.bounds(
          (this.pixelBoundsCache.left + this.pixelBoundsCache.width - barSize - 1),
          (this.pixelBoundsCache.top + this.headerHeight() + barSize + 1),
          barSize,
          (this.pixelBoundsCache.height - this.headerHeight() - 2 * barSize - 2)
      );
    }

    horizontalScrollBar = this.horizontalScrollBar();
    barSize = /** @type {number} */ (horizontalScrollBar.barSize());
    horizontalScrollBar.bounds(
        (this.pixelBoundsCache.left + barSize),
        (this.pixelBoundsCache.top + this.pixelBoundsCache.height - barSize - 1),
        (this.pixelBoundsCache.width - 2 * barSize),
        barSize
    );

    this.redrawPosition = true;

    this.boundsInvalidated();

    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.GRIDS_POSITION)) {
    this.tooltip().hide();
    this.redrawPosition = true;
    this.positionInvalidated();
    this.markConsistent(anychart.ConsistencyState.GRIDS_POSITION);
  }


  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    this.bgRect_.fill(/** @type {acgraph.vector.Fill} */(this.getOption('backgroundFill')));
    var rowFill = this.getOption('rowFill');
    var rowOddFill = this.getOption('rowOddFill');
    rowOddFill = anychart.utils.isNone(rowOddFill) ? rowFill : rowOddFill;
    var rowEvenFill = this.getOption('rowEvenFill');
    rowEvenFill = anychart.utils.isNone(rowEvenFill) ? rowFill : rowEvenFill;
    this.getOddPath().fill(/** @type {acgraph.vector.Fill} */(rowOddFill));
    this.getEvenPath().fill(/** @type {acgraph.vector.Fill} */(rowEvenFill));
    var rowSelectedFill = anychart.ganttModule.BaseGrid.getColorResolver('rowSelectedFill', anychart.enums.ColorType.FILL, false)(this, 0, this.selectedItem);
    this.getSelectedPath().fill(/** @type {acgraph.vector.Fill} */(rowSelectedFill));

    var rowStrokeColor;
    if (goog.isString(this.rowStroke_)) {
      rowStrokeColor = this.rowStroke_;
    } else if (goog.isObject(this.rowStroke_) && this.rowStroke_['color']) {
      rowStrokeColor = this.rowStroke_['color'];
    }

    if (rowStrokeColor) this.getHeaderSeparationPath().stroke(rowStrokeColor);

    this.getRowStrokePath().stroke(this.rowStroke_);

    this.getEditStructurePreviewPath_()
        .fill(this.editStructurePreviewFill_)
        .stroke(this.editStructurePreviewStroke_);

    this.appearanceInvalidated();

    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    this.getBase().zIndex(/** @type {number} */ (this.zIndex()));
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BASE_GRID_REDRAW)) {
    this.redrawPosition = true;
    this.markConsistent(anychart.ConsistencyState.BASE_GRID_REDRAW);
  }

  this.specialInvalidated();

  if (this.redrawPosition) {
    this.drawRowFills_();
    this.positionFinal();
    this.redrawPosition = false;
  }
  if (manualSuspend) stage.resume();
  if (this.isStandalone) {
    this.initMouseFeatures();
    this.initKeysFeatures();
  }

  return this;
};


/**
 * Additional actions while DOM initialization.
 */
anychart.ganttModule.BaseGrid.prototype.initDom = goog.nullFunction;


/**
 * Generates horizontal scroll bar.
 * @param {Object=} opt_value Object with settings.
 * @return {anychart.ganttModule.ScrollBar|anychart.ganttModule.BaseGrid} - Scroll bar.
 */
anychart.ganttModule.BaseGrid.prototype.horizontalScrollBar = goog.abstractMethod;


/** @inheritDoc */
anychart.ganttModule.BaseGrid.prototype.highlight = function(opt_index, opt_startY, opt_endY) {
  var definedValues = goog.isDef(opt_index) && goog.isDef(opt_startY) && goog.isDef(opt_endY);
  var draw = false;
  var clear = false;
  if (definedValues) {
    if (this.hoverStartY_ != opt_startY || this.hoverEndY_ != opt_endY) {
      this.hoveredIndex = opt_index;
      this.hoverStartY_ = opt_startY;
      this.hoverEndY_ = opt_endY;
      draw = this.hoveredIndex >= 0;
    }
  } else {
    if (this.hoveredIndex >= 0) {
      this.hoveredIndex = -1;
      this.hoverStartY_ = NaN;
      this.hoverEndY_ = NaN;
    }
    clear = true;
  }

  if (draw) {
    var dataItem = this.getVisibleItems()[/** @type {number} */ (opt_index)];
    var fill = anychart.ganttModule.BaseGrid.getColorResolver('rowHoverFill', anychart.enums.ColorType.FILL, false)(this, 0, dataItem);
    this.getHoverPath()
        .clear()
        .fill(/** @type {acgraph.vector.Fill} */(fill))
        .moveTo(this.pixelBoundsCache.left, this.hoverStartY_)
        .lineTo(this.pixelBoundsCache.left + this.pixelBoundsCache.width, this.hoverStartY_)
        .lineTo(this.pixelBoundsCache.left + this.pixelBoundsCache.width, this.hoverEndY_)
        .lineTo(this.pixelBoundsCache.left, this.hoverEndY_)
        .close();
  } else if (clear) {
    this.getHoverPath().clear();
  }
};


/** @inheritDoc */
anychart.ganttModule.BaseGrid.prototype.editStructureHighlight = function(opt_startY, opt_endY, opt_cursor) {
  var previewPath = this.getEditStructurePreviewPath_();
  if (goog.isDef(opt_startY)) {
    if (goog.isDef(opt_endY)) {
      previewPath
          .clear()
          .moveTo(this.pixelBoundsCache.left, opt_startY)
          .lineTo(this.pixelBoundsCache.left + this.totalGridsWidth, opt_startY)
          .lineTo(this.pixelBoundsCache.left + this.totalGridsWidth, opt_endY)
          .lineTo(this.pixelBoundsCache.left, opt_endY)
          .close()
          .stroke(this.editStructurePreviewStroke_);
    } else {
      previewPath
          .clear()
          .moveTo(this.pixelBoundsCache.left, opt_startY)
          .lineTo(this.pixelBoundsCache.left + this.totalGridsWidth, opt_startY)
          .stroke(this.editStructurePreviewDashStroke_);
    }
  } else {
    previewPath.clear();
  }
  if (goog.isDef(opt_cursor))
    goog.style.setStyle(anychart.document['body'], 'cursor', opt_cursor);

};


/**
 * Initializes mouse wheel scrolling and mouse drag scrolling.
 * TODO (A.Kudryavtsev): In current implementation (04 Dec 2014) mouse drag scrolling is not available.
 */
anychart.ganttModule.BaseGrid.prototype.initMouseFeatures = function() {
  if (!this.mwh_) {
    var element = this.getBase().domElement();
    var ths = this;

    if (element) {
      this.mwh_ = new goog.events.MouseWheelHandler(element);
      var mouseWheelEvent = goog.events.MouseWheelHandler.EventType.MOUSEWHEEL;
      goog.events.listen(this.mwh_, mouseWheelEvent, this.mouseWheelHandler_, false, this);

      goog.events.listen(anychart.window, 'unload', function(e) {
        goog.events.unlisten(ths.mwh_, mouseWheelEvent, ths.mouseWheelHandler_, false, this);
      });
    }

    this.horizontalScrollBar().listen(anychart.enums.EventType.SCROLLING, goog.bind(this.denyDragging, this, true));
    this.horizontalScrollBar().listen(anychart.enums.EventType.SCROLL_END, goog.bind(this.denyDragging, this, false));
  }
};


/**
 * Document mouse move listener.
 * @param {goog.fx.DragEvent} e - Event.
 * @private
 */
anychart.ganttModule.BaseGrid.prototype.docMouseMoveListener_ = function(e) {
  var l = anychart.ganttModule.BaseGrid.SCROLL_MOUSE_OUT_INSIDE_LENGTH;
  var container = this.container();
  if (container) {
    var containerPosition = container.getStage().getClientPosition();
    var top = this.pixelBoundsCache.top + containerPosition.y + this.headerHeight_ + l;
    var bottom = containerPosition.y + this.pixelBoundsCache.height - l - l;
    var left = containerPosition.x + this.pixelBoundsCache.left + l;
    var right = left + this.pixelBoundsCache.width - l - l;

    var mouseX = e.clientX;
    var mouseY = e.clientY;

    this.scrollOffsetX = 0;
    this.scrollOffsetY = 0;
    if (mouseX < left || mouseX > right) this.scrollOffsetX = mouseX - left;
    if (mouseY < top || mouseY > bottom) this.scrollOffsetY = mouseY - top;

    var ths = this;
    if (this.dragging && !this.scrollInterval && !this.denyDragScrolling) {
      this.scrollInterval = setInterval(function() {
        ths.mouseOutMove(e);
      }, anychart.ganttModule.BaseGrid.TIMER_STEP);
    }
  }

};


/**
 * Initializes keys listening.
 */
anychart.ganttModule.BaseGrid.prototype.initKeysFeatures = function() {
  if (!this.interactivityHandler.altKeyHandler) {
    this.interactivityHandler.altKeyHandler = new anychart.ganttModule.BaseGrid.KeyHandler(this.interactivityHandler, anychart.document);
    this.registerDisposable(this.interactivityHandler.altKeyHandler);

    acgraph.events.listen(this.interactivityHandler.altKeyHandler, 'key', function(e) {
      if (e.keyCode == 18) { //alt
        this.altKey = true;
      }

      if (e.keyCode == 46 || (e.metaKey && e.keyCode == 8)) { //delete
        this.deleteKeyHandler(e);
      }
    }, false, this.interactivityHandler);
  }
};


/**
 * @param {boolean} value
 */
anychart.ganttModule.BaseGrid.prototype.denyDragging = function(value) {
  this.denyDragScrolling = value;
};


/**
 * @inheritDoc
 */
anychart.ganttModule.BaseGrid.prototype.deleteKeyHandler = function(e) {
};


/**
 * Additional actions on position invalidation.
 */
anychart.ganttModule.BaseGrid.prototype.positionInvalidated = goog.nullFunction;


/**
 * Additional actions on position. Differs from positionInvalidated:
 * this method is called at the very last when this.redrawPosition is set to true.
 */
anychart.ganttModule.BaseGrid.prototype.positionFinal = goog.nullFunction;


/**
 * @inheritDoc
 */
anychart.ganttModule.BaseGrid.prototype.remove = function() {
  if (this.base_) this.base_.parent(null);
};


/**
 * Gets/sets row stroke.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill .
 * @param {number=} opt_thickness .
 * @param {string=} opt_dashpattern .
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin .
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap .
 * @return {(string|acgraph.vector.Stroke|anychart.ganttModule.BaseGrid)} - Current value or itself for method chaining.
 */
anychart.ganttModule.BaseGrid.prototype.rowStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var val = acgraph.vector.normalizeStroke.apply(null, arguments);
    var newThickness = anychart.utils.extractThickness(val);

    //TODO (A.Kudryavtsev): In current implementation (15 June 2015) method anychart.color.equals works pretty bad.
    //TODO (A.Kudryavtsev): That's why here I check thickness as well.
    if (!anychart.color.equals(this.rowStroke_, val) || newThickness != this.rowStrokeThickness) {
      this.rowStroke_ = val;
      this.rowStrokeThickness = newThickness;

      /*
        Standalone grid sets controller.rowStrokeThickness value in own draw() method.
        Not standalone grid does the same excepting one case: restoration from XML od JSON.
        It means that for not standalone case we have to set controller's rowStrokeThickness from here because rowStroke
        method is not available for not standalone instances.
       */
      if (!this.isStandalone) this.controller.rowStrokeThickness(newThickness);
      this.invalidate(anychart.ConsistencyState.GRIDS_POSITION | anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }

    return this;
  }
  return this.rowStroke_ || 'none';
};


/**
 * Performs scrolling.
 * @param {number} horizontalPixelOffset - Horizontal pixel offset.
 * @param {number} verticalPixelOffset - Vertical pixel offset.
 */
anychart.ganttModule.BaseGrid.prototype.scroll = goog.abstractMethod;


/**
 * Method to select row from outside.
 * @param {anychart.treeDataModule.Tree.DataItem} item - New selected data item.
 * @return {boolean} - Whether has been selected.
 */
anychart.ganttModule.BaseGrid.prototype.selectRow = function(item) {
  if (item && item != this.selectedItem) {
    this.controller.data().suspendSignalsDispatching();//this.controller.data() can be Tree or TreeView.
    item.meta('selected', true);
    if (this.selectedItem) this.selectedItem.meta('selected', false); //selectedItem has the same tree as item.
    this.selectedItem = item;
    this.controller.data().resumeSignalsDispatching(false);
    this.invalidate(anychart.ConsistencyState.BASE_GRID_REDRAW, anychart.Signal.NEEDS_REDRAW);
    return true;
  }
  return false;
};


/**
 * Special invalidation. Used by child classes to preform own invalidation.
 */
anychart.ganttModule.BaseGrid.prototype.specialInvalidated = goog.nullFunction;


/**
 * @inheritDoc
 */
anychart.ganttModule.BaseGrid.prototype.rowUnselect = function(event) {
  if (this.selectedItem && this.controller.data()) {
    this.controller.data().suspendSignalsDispatching();
    this.selectedItem.meta('selected', false);
    this.selectedItem = null;
    this.controller.data().resumeSignalsDispatching(false);

    if (this.interactivityHandler == this) { //Should dispatch 'unselect-event' by itself.
      var newEvent = {
        'type': anychart.enums.EventType.ROW_SELECT,
        'actualTarget': event ? event.target : this,
        'target': this,
        'originalEvent': event,
        'item': null //This is a real difference between 'select' and 'unselect' events.
      };
      this.dispatchEvent(newEvent);
    }

    this.invalidate(anychart.ConsistencyState.GRIDS_POSITION, anychart.Signal.NEEDS_REDRAW);
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Exported (without Decoration).
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Sets new data.
 * @param {anychart.treeDataModule.Tree=} opt_value - New data tree.
 * @return {?(anychart.ganttModule.BaseGrid|anychart.treeDataModule.Tree)} - Current data tree or itself for method chaining.
 */
anychart.ganttModule.BaseGrid.prototype.data = function(opt_value) {
  var data = /** @type {?anychart.treeDataModule.Tree} */ (this.controller.data());
  if (goog.isDef(opt_value)) {
    if ((opt_value != data) && (anychart.utils.instanceOf(opt_value, anychart.treeDataModule.Tree))) {
      this.controller.data(opt_value); //This will invalidate position.
    }
    return this;
  }
  return data;
};


/**
 * Draws grid.
 * @return {anychart.ganttModule.BaseGrid}
 */
anychart.ganttModule.BaseGrid.prototype.draw = function() {
  if (!this.pixelBoundsCache || this.pixelBoundsCache.height || !this.pixelBoundsCache.height)
    this.pixelBoundsCache = /** @type {anychart.math.Rect} */ (this.getPixelBounds());
  this.controller
      .availableHeight(this.pixelBoundsCache.height - this.headerHeight_ - 1)
      .rowStrokeThickness(this.rowStrokeThickness)
      .run();
  return this;
};


/**
 * Gets/sets end index.
 * @param {number=} opt_value - Value to be set.
 * @return {(anychart.ganttModule.BaseGrid|number)} - Current value or itself for method chaining.
 */
anychart.ganttModule.BaseGrid.prototype.endIndex = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.controller.endIndex(opt_value);
    return this;
  }
  return /** @type {number} */ (this.controller.endIndex());
};


/**
 * Getter for the set of visible (not collapsed) data items.
 * @return {Array.<anychart.treeDataModule.Tree.DataItem>}
 */
anychart.ganttModule.BaseGrid.prototype.getVisibleItems = function() {
  return this.controller.getVisibleItems();
};


/**
 * Gets/sets start index.
 * @param {number=} opt_value - Value to be set.
 * @return {(anychart.ganttModule.BaseGrid|number)} - Current value or itself for method chaining.
 */
anychart.ganttModule.BaseGrid.prototype.startIndex = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.controller.startIndex(opt_value);
    return this;
  }
  return /** @type {number} */ (this.controller.startIndex());
};


/**
 * Gets/sets header height.
 * @param {number=} opt_value - Value to be set.
 * @return {(number|anychart.ganttModule.BaseGrid)} - Current value or itself for method chaining.
 */
anychart.ganttModule.BaseGrid.prototype.headerHeight = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.headerHeight_ != opt_value) {
      this.headerHeight_ = opt_value;
      if (!this.pixelBoundsCache) this.pixelBoundsCache = /** @type {anychart.math.Rect} */ (this.getPixelBounds());

      if (this.isStandalone) {
        this.controller
            .suspendSignalsDispatching()
            .availableHeight(this.pixelBoundsCache.height - opt_value - 1)
            .resumeSignalsDispatching(false);
      }

      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.headerHeight_;
};


/**
 * Getter for tooltip settings.
 * @param {(Object|boolean|null)=} opt_value - Tooltip settings.
 * @return {!(anychart.ganttModule.BaseGrid|anychart.core.ui.Tooltip)} - Tooltip instance or self for method chaining.
 */
anychart.ganttModule.BaseGrid.prototype.tooltip = function(opt_value) {
  if (!this.tooltip_) {
    this.tooltip_ = new anychart.core.ui.Tooltip(0);
    this.registerDisposable(this.tooltip_);
    this.tooltip_.listenSignals(this.onTooltipSignal_, this);
    this.tooltip_.containerProvider(this);
  }
  if (goog.isDef(opt_value)) {
    this.tooltip_.setup(opt_value);
    return this;
  } else {
    return this.tooltip_;
  }
};


/**
 * Gets/sets vertical offset.
 * @param {number=} opt_value - Value to be set.
 * @return {(anychart.ganttModule.BaseGrid|number)} - Current value or itself for method chaining.
 */
anychart.ganttModule.BaseGrid.prototype.verticalOffset = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.controller.verticalOffset(opt_value);
    return this;
  }
  return /** @type {number} */ (this.controller.verticalOffset());
};


/**
 * @inheritDoc
 */
anychart.ganttModule.BaseGrid.prototype.disposeInternal = function() {
  goog.dispose(this.palette_);
  anychart.ganttModule.BaseGrid.base(this, 'disposeInternal');
  goog.events.unlisten(document, goog.events.EventType.MOUSEMOVE, this.docMouseMoveListener_, false, this);
};


/** @inheritDoc */
anychart.ganttModule.BaseGrid.prototype.serialize = function() {
  var json = anychart.ganttModule.BaseGrid.base(this, 'serialize');

  json['isStandalone'] = this.isStandalone;

  /*
    Note: not standalone grid is controlled by some higher entity (e.g. gantt chart).
    It means that controller must be serialized and restored by this entity, but not by base grid.
   */
  if (this.isStandalone) {
    json['controller'] = this.controller.serialize();
    json['defaultRowHeight'] = this.defaultRowHeight();
    json['palette'] = this.palette().serialize();
  }

  anychart.core.settings.serialize(this, anychart.ganttModule.BaseGrid.COLOR_DESCRIPTORS, json);

  json['rowStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke} */ (this.rowStroke_));
  json['headerHeight'] = this.headerHeight_;
  json['headerHeight'] = this.defaultRowHeight();
  json['editStructurePreviewFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill} */ (this.editStructurePreviewFill_));
  json['editStructurePreviewStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke} */ (this.editStructurePreviewStroke_));
  json['editStructurePreviewDashStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke} */ (this.editStructurePreviewDashStroke_));

  json['editing'] = this.editable;
  json['tooltip'] = this.tooltip().serialize();

  return json;
};


/**
 * @inheritDoc
 */
anychart.ganttModule.BaseGrid.prototype.setupByJSON = function(config, opt_default) {
  anychart.ganttModule.BaseGrid.base(this, 'setupByJSON', config, opt_default);

  this.isStandalone = ('isStandalone' in config) ? config['isStandalone'] : ('controller' in config);

  if (this.isStandalone && 'controller' in config) {
    this.createController();
    this.controller.setup(config['controller']);
    this.defaultRowHeight(config['defaultRowHeight']);
    this.palette(config['palette']);
  }

  anychart.core.settings.deserialize(this, anychart.ganttModule.BaseGrid.COLOR_DESCRIPTORS, config, opt_default);

  this.rowStroke(config['rowStroke']);

  if ('tooltip' in config)
    this.tooltip().setupInternal(!!opt_default, config['tooltip']);

  this.headerHeight(config['headerHeight']);
  this.editStructurePreviewFill(config['editStructurePreviewFill']);
  this.editStructurePreviewStroke(config['editStructurePreviewStroke']);
  this.editStructurePreviewDashStroke(config['editStructurePreviewDashStroke']);
  this.editing(config['editing']);
};



//region --- Base Grid Dragger
/**
 * Dragger.
 * @param {acgraph.vector.Element} target - Target element.
 * @param {anychart.ganttModule.BaseGrid} grid - Current grid to be scrolled.
 * @constructor
 * @extends {goog.fx.Dragger}
 */
anychart.ganttModule.BaseGrid.Dragger = function(target, grid) {
  anychart.ganttModule.BaseGrid.Dragger.base(this, 'constructor', target.domElement());

  /**
   * @type {anychart.ganttModule.BaseGrid}
   */
  this.grid = grid;

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

  this.setHysteresis(3);
};
goog.inherits(anychart.ganttModule.BaseGrid.Dragger, goog.fx.Dragger);


/**
 * @override
 */
anychart.ganttModule.BaseGrid.Dragger.prototype.computeInitialPosition = function() {
  //TODO (A.Kudryavtsev): We don't actually need to override it right here, but
  //TODO (A.Kudryavtsev): default method dies in IE.
  this.deltaX = 0;
  this.deltaY = 0;
};


/**
 * @override
 */
anychart.ganttModule.BaseGrid.Dragger.prototype.defaultAction = function(x, y) {
  if (this.grid.interactivityHandler.altKey || (!this.grid.editable && !this.grid.denyDragScrolling)) {
    var dX = this.x - x;
    var dY = this.y - y;

    this.x = x;
    this.y = y;

    this.grid.scroll(dX, dY);
  }
};


/**
 * Resets dragger.
 */
anychart.ganttModule.BaseGrid.Dragger.prototype.reset = function() {
  this.x = 0;
  this.y = 0;
};



//endregion
//region --- Base Grid KeyHandler
/**
 * Key handler.
 * @param {anychart.ganttModule.IInteractiveGrid} grid - Base grid itself.
 * @param {Element|Document=} opt_element - The element or document to listen on.
 * @param {boolean=} opt_capture - Whether to listen for browser events in
 *     capture phase (defaults to false).
 * @constructor
 * @extends {goog.events.KeyHandler}
 * @suppress {accessControls} - TODO Add another mechanism (fix this inheritance).
 */
anychart.ganttModule.BaseGrid.KeyHandler = function(grid, opt_element, opt_capture) {
  anychart.ganttModule.BaseGrid.KeyHandler.base(this, 'constructor', opt_element, opt_capture);

  /**
   * @type {anychart.ganttModule.IInteractiveGrid}
   */
  this.grid = grid;
};
goog.inherits(anychart.ganttModule.BaseGrid.KeyHandler, goog.events.KeyHandler);


/** @inheritDoc */
anychart.ganttModule.BaseGrid.KeyHandler.prototype.resetState = function() {
  anychart.ganttModule.BaseGrid.KeyHandler.base(this, 'resetState');
  this.grid.altKey = false;
};



//endregion
//region --- Base Grid Element
/**
 * Actually is a path to be drawn on drawLayer.
 * Used to draw some elements as Timeline's bars with additional data.
 * @constructor
 * @extends {acgraph.vector.Path}
 */
anychart.ganttModule.BaseGrid.Element = function() {
  anychart.ganttModule.BaseGrid.Element.base(this, 'constructor');

  /**
   * Meta information. Used for inner purposes only.
   * @type {Object}
   */
  this.meta = {};
};
goog.inherits(anychart.ganttModule.BaseGrid.Element, acgraph.vector.Path);


/**
 * Resets fields.
 */
anychart.ganttModule.BaseGrid.Element.prototype.reset = function() {
  this.fill(null).stroke(null).clear();
  this.currBounds = null;
  this.type = void 0;
  if (this.label) {
    this.label.resetSettings();
    this.label.enabled(false);
    this.label.draw();
  }
  this.label = null;
  this.labelPointSettings = null;
  this.typeLabels = null;
  this.item = null;
  this.period = null;
  this.periodIndex = void 0;
};


/**
 * Type of element. In current implementation (21 Jul 2015) can be one of timeline's bars type.
 * @type {anychart.enums.TLElementTypes|undefined}
 */
anychart.ganttModule.BaseGrid.Element.prototype.type;


/**
 * Current bounds cache. Used to avoid unnecessary bounds calculation.
 * @type {?anychart.math.Rect}
 */
anychart.ganttModule.BaseGrid.Element.prototype.currBounds = null;


/**
 * Related element label.
 * @type {?anychart.core.ui.LabelsFactory.Label}
 */
anychart.ganttModule.BaseGrid.Element.prototype.label = null;


/**
 * Related element label point settings.
 * @type {?Object}
 */
anychart.ganttModule.BaseGrid.Element.prototype.labelPointSettings = null;


/**
 * Related element labels factory that contains settings by element type.
 * Storing this field allows to avoid detecting related labels factory by type.
 * @type {?anychart.core.ui.LabelsFactory}
 */
anychart.ganttModule.BaseGrid.Element.prototype.typeLabels = null;


/**
 * Related tree data item.
 * @type {?(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)}
 */
anychart.ganttModule.BaseGrid.Element.prototype.item = null;


/**
 * Related period object.
 * @type {?Object}
 */
anychart.ganttModule.BaseGrid.Element.prototype.period = null;


/**
 * Related period object.
 * @type {number|undefined}
 */
anychart.ganttModule.BaseGrid.Element.prototype.periodIndex = void 0;
//endregion
