goog.provide('anychart.core.ui.BaseGrid');

goog.require('acgraph.vector.Path');
goog.require('anychart.core.IStandaloneBackend');
goog.require('anychart.core.VisualBaseWithBounds');
goog.require('anychart.core.gantt.Controller');
goog.require('anychart.core.reporting');
goog.require('anychart.core.ui.IInteractiveGrid');
goog.require('anychart.core.ui.ScrollBar');
goog.require('anychart.core.ui.Tooltip');
goog.require('anychart.core.utils.GanttContextProvider');
goog.require('anychart.math.Rect');
goog.require('goog.events.KeyHandler');
goog.require('goog.events.MouseWheelHandler');
goog.require('goog.fx.Dragger');
goog.require('goog.labs.userAgent.device');



/**
 * Base class for grid-like classes like DataGrid and Timeline.
 * Has a header area and interactive grid area.
 * @param {anychart.core.gantt.Controller=} opt_controller - Controller to be set. Setting this parameter has a key
 *  meaning:
 *  - If controller is set, in means that this grid (DG or TL) is not standalone (it is part of higher entity
 *    with its own controller like Gantt Chart). It means that controller must be already created before this grid.
 *  - If controller is not set, the grid becomes standalone and creates its own controller.
 * @param {boolean=} opt_isResource - If opt_controller is not set, this flag says what kind of controller to create.
 * @constructor
 * @extends {anychart.core.VisualBaseWithBounds}
 * @implements {anychart.core.ui.IInteractiveGrid}
 * @implements {anychart.core.IStandaloneBackend}
 */
anychart.core.ui.BaseGrid = function(opt_controller, opt_isResource) {
  anychart.core.ui.BaseGrid.base(this, 'constructor');

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
   * @type {anychart.core.ui.BaseGrid.Dragger}
   */
  this.scrollDragger = null;

  /**
   * Interactivity handler.
   * @type {!anychart.core.ui.IInteractiveGrid}
   */
  this.interactivityHandler = /** @type {!anychart.core.ui.IInteractiveGrid} */ (this);

  /**
   * Flag whether grid is standalone.
   * @type {boolean}
   */
  this.isStandalone = true;

  /**
   * Gantt controller.
   * @type {anychart.core.gantt.Controller}
   */
  this.controller = null;

  if (opt_controller && opt_controller instanceof anychart.core.gantt.Controller) {
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
   * Background fill.
   * @type {acgraph.vector.Fill}
   * @private
   */
  this.backgroundFill_;

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
   * Odd fill.
   * @type {?acgraph.vector.Fill}
   * @private
   */
  this.rowOddFill_;

  /**
   * Even fill.
   * @type {?acgraph.vector.Fill}
   * @private
   */
  this.rowEvenFill_;

  /**
   * Default rows fill.
   * @type {acgraph.vector.Fill}
   * @private
   */
  this.rowFill_;

  /**
   * Default hover fill.
   * @type {acgraph.vector.Fill}
   * @private
   */
  this.hoverFill_;

  /**
   * Default row selected fill.
   * @type {acgraph.vector.Fill}
   * @private
   */
  this.rowSelectedFill_;

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
   * @type {anychart.data.Tree.DataItem}
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
   * @type {anychart.data.Tree.DataItem}
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
   * @type {anychart.core.utils.GanttContextProvider}
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

};
goog.inherits(anychart.core.ui.BaseGrid, anychart.core.VisualBaseWithBounds);


//----------------------------------------------------------------------------------------------------------------------
//
//  General.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Supported signals.
 * @type {number}
 */
anychart.core.ui.BaseGrid.SUPPORTED_SIGNALS = anychart.core.VisualBaseWithBounds.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistence states.
 * @type {number}
 */
anychart.core.ui.BaseGrid.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBaseWithBounds.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.APPEARANCE | //Coloring.
    anychart.ConsistencyState.GRIDS_POSITION | //Any vertical grid position change.
    anychart.ConsistencyState.BASE_GRID_REDRAW; //Light redraw. We use this state to highlight a row without redrawing all or smth like that.


/**
 * Background rect z-index.
 * @type {number}
 */
anychart.core.ui.BaseGrid.BG_RECT_Z_INDEX = 10;


/**
 * Events rect z-index.
 * @type {number}
 */
anychart.core.ui.BaseGrid.EVENTS_RECT_Z_INDEX = 20;


/**
 * Cells layer z-index.
 * @type {number}
 */
anychart.core.ui.BaseGrid.CELLS_Z_INDEX = 30;


/**
 * Draw layer z-index.
 * @type {number}
 */
anychart.core.ui.BaseGrid.DRAW_Z_INDEX = 35;


/**
 * Content layer z-index.
 * @type {number}
 */
anychart.core.ui.BaseGrid.CONTENT_Z_INDEX = 40;


/**
 * Edit layer z-index.
 * @type {number}
 */
anychart.core.ui.BaseGrid.EDIT_Z_INDEX = 45;


/**
 * Additional layer z-index.
 * @type {number}
 */
anychart.core.ui.BaseGrid.CLIP_Z_INDEX = 50;


/**
 * Tooltip z-index.
 * @type {number}
 */
anychart.core.ui.BaseGrid.TOOLTIP_Z_INDEX = 50;


/**
 * Scrolls layer z-index.
 * @type {number}
 */
anychart.core.ui.BaseGrid.SCROLLS_Z_INDEX = 60;


/**
 * The scroll timer step in ms.
 * @type {number}
 */
anychart.core.ui.BaseGrid.TIMER_STEP = 100;


/**
 * The scroll step in px.
 * @type {number}
 */
anychart.core.ui.BaseGrid.SCROLL_STEP = 30;


/**
 * The suggested scrolling margin.
 * @type {number}
 */
anychart.core.ui.BaseGrid.MARGIN = 32;


/**
 * We start scrolling on mouse move event when mouse leaves container's bounds.
 * This value is a border inside of bounds when scrolling starts.
 * @type {number}
 */
anychart.core.ui.BaseGrid.SCROLL_MOUSE_OUT_INSIDE_LENGTH = 10;


/**
 * Lower drag edit ratio.
 * TODO (A.Kudryavtsev): Describe.
 * @type {number}
 */
anychart.core.ui.BaseGrid.LOWER_DRAG_EDIT_RATIO = .2;


/**
 * Higher drag edit ratio.
 * TODO (A.Kudryavtsev): Describe.
 * @type {number}
 */
anychart.core.ui.BaseGrid.HIGHER_DRAG_EDIT_RATIO = 1 - anychart.core.ui.BaseGrid.LOWER_DRAG_EDIT_RATIO;


/**
 * Checks whether tree data item is actually a milestone.
 * @param {(anychart.data.Tree.DataItem|anychart.data.TreeView.DataItem)} treeDataItem - Tree data item.
 * @return {boolean} - Whether tree data item is milestone.
 */
anychart.core.ui.BaseGrid.isMilestone = function(treeDataItem) {
  var actualStart = treeDataItem.meta(anychart.enums.GanttDataFields.ACTUAL_START);
  var actualEnd = treeDataItem.meta(anychart.enums.GanttDataFields.ACTUAL_END);
  return goog.isDef(actualStart) && ((!isNaN(actualStart) && !goog.isDef(actualEnd)) || (actualStart == actualEnd));
};


/** @inheritDoc */
anychart.core.ui.BaseGrid.prototype.createFormatProvider = function(item, opt_period, opt_periodIndex) {
  if (!this.formatProvider_)
    this.formatProvider_ = new anychart.core.utils.GanttContextProvider(this.controller.isResources());
  this.formatProvider_.currentItem = item;
  this.formatProvider_.currentPeriod = opt_period;
  this.formatProvider_.currentPeriodIndex = opt_periodIndex;
  this.formatProvider_.applyReferenceValues();
  return this.formatProvider_;
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
anychart.core.ui.BaseGrid.prototype.handleMouseClick_ = function(event) {
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
anychart.core.ui.BaseGrid.prototype.addDragMouseMove = goog.nullFunction;


/**
 * Additional actions for inherited classes on mouse up after dragging.
 * @param {Object} evt - Event object.
 */
anychart.core.ui.BaseGrid.prototype.addDragMouseUp = goog.nullFunction;


/**
 * Additional actions for inherited classes on mouse move and over.
 * @param {?Object} evt - Event object.
 */
anychart.core.ui.BaseGrid.prototype.addMouseMoveAndOver = goog.nullFunction;


/**
 * Additional actions for inherited classes on mouse down.
 * @param {?Object} evt - Event object.
 */
anychart.core.ui.BaseGrid.prototype.addMouseDown = goog.nullFunction;


/**
 * Additional actions for inherited classes on mouse up.
 * @param {?Object} evt - Event object.
 */
anychart.core.ui.BaseGrid.prototype.addMouseUp = goog.nullFunction;


/**
 * Additional actions for inherited classes on mouse double click.
 * @param {?Object} evt - Event object.
 */
anychart.core.ui.BaseGrid.prototype.addMouseDblClick = goog.nullFunction;


/**
 * Mouse over and move internal handler.
 * @param {anychart.core.MouseEvent} event - Event object.
 * @private
 */
anychart.core.ui.BaseGrid.prototype.handleMouseOverAndMove_ = function(event) {
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
anychart.core.ui.BaseGrid.prototype.handleAll_ = function(event) {
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
anychart.core.ui.BaseGrid.prototype.handleDblMouseClick_ = function(event) {
  var evt = this.getInteractivityEvent(event);
  this.addMouseDblClick(evt);
  if (this.interactive) {
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
anychart.core.ui.BaseGrid.prototype.handleMouseOut_ = function(event) {
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
anychart.core.ui.BaseGrid.prototype.handleMouseDown_ = function(event) {
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
anychart.core.ui.BaseGrid.prototype.handleMouseUp_ = function(event) {
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
anychart.core.ui.BaseGrid.prototype.rowClick = function(event) {
  this.rowSelect(event);
};


/** @inheritDoc */
anychart.core.ui.BaseGrid.prototype.rowDblClick = function(event) {
  this.rowExpandCollapse(event);
};


/** @inheritDoc */
anychart.core.ui.BaseGrid.prototype.rowSelect = function(event) {
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
anychart.core.ui.BaseGrid.prototype.rowExpandCollapse = function(event) {
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
anychart.core.ui.BaseGrid.prototype.rowMouseMove = function(event) {
  if (!this.dragging) {
    this.interactivityHandler.highlight(event['hoveredIndex'], event['startY'], event['endY']);
    var tooltip = /** @type {anychart.core.ui.Tooltip} */(this.tooltip());
    var formatProvider = this.interactivityHandler.createFormatProvider(event['item'], event['period'], event['periodIndex']);
    tooltip.showFloat(event['originalEvent']['clientX'], event['originalEvent']['clientY'], formatProvider);
  }
};


/** @inheritDoc */
anychart.core.ui.BaseGrid.prototype.rowMouseOver = goog.nullFunction;


/** @inheritDoc */
anychart.core.ui.BaseGrid.prototype.rowMouseOut = function(event) {
  this.interactivityHandler.highlight();
  this.tooltip().hide();
};


/** @inheritDoc */
anychart.core.ui.BaseGrid.prototype.rowMouseUp = goog.nullFunction;


/** @inheritDoc */
anychart.core.ui.BaseGrid.prototype.rowMouseDown = goog.nullFunction;


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
anychart.core.ui.BaseGrid.prototype.mouseOutMove = goog.nullFunction;


/**
 * Creates new event object to be dispatched.
 * @param {anychart.core.MouseEvent|goog.fx.DragEvent} event - Incoming event.
 * @return {?Object} - New event object to be dispatched.
 */
anychart.core.ui.BaseGrid.prototype.getInteractivityEvent = function(event) {
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
anychart.core.ui.BaseGrid.prototype.editing = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.editable != opt_value) {
      this.editable = opt_value;

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
anychart.core.ui.BaseGrid.prototype.getBase = function() {
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
anychart.core.ui.BaseGrid.prototype.getCellsLayer = function() {
  if (!this.cellsLayer_) {
    this.cellsLayer_ = /** @type {acgraph.vector.Layer} */ (acgraph.layer());
    this.cellsLayer_.zIndex(anychart.core.ui.BaseGrid.CELLS_Z_INDEX);
    this.registerDisposable(this.cellsLayer_);
  }
  return this.cellsLayer_;
};


/**
 * Inner getter for this.drawLayer_.
 * @return {acgraph.vector.Layer}
 */
anychart.core.ui.BaseGrid.prototype.getDrawLayer = function() {
  if (!this.drawLayer_) {
    this.drawLayer_ = /** @type {acgraph.vector.Layer} */ (acgraph.layer());
    this.drawLayer_.zIndex(anychart.core.ui.BaseGrid.DRAW_Z_INDEX);
    this.registerDisposable(this.drawLayer_);
  }
  return this.drawLayer_;
};


/**
 * Inner getter for this.contentLayer_.
 * @return {acgraph.vector.Layer}
 */
anychart.core.ui.BaseGrid.prototype.getContentLayer = function() {
  if (!this.contentLayer_) {
    this.contentLayer_ = /** @type {acgraph.vector.Layer} */ (acgraph.layer());
    this.contentLayer_.zIndex(anychart.core.ui.BaseGrid.CONTENT_Z_INDEX);
    this.registerDisposable(this.contentLayer_);
  }
  return this.contentLayer_;
};


/**
 * Inner getter for this.editLayer_.
 * @return {acgraph.vector.Layer}
 */
anychart.core.ui.BaseGrid.prototype.getEditLayer = function() {
  if (!this.editLayer_) {
    this.editLayer_ = /** @type {acgraph.vector.Layer} */ (acgraph.layer());
    this.editLayer_.zIndex(anychart.core.ui.BaseGrid.EDIT_Z_INDEX);
    this.registerDisposable(this.editLayer_);
  }
  return this.editLayer_;
};


/**
 * Inner getter for this.clipLayer_.
 * @return {acgraph.vector.Layer}
 */
anychart.core.ui.BaseGrid.prototype.getClipLayer = function() {
  if (!this.clipLayer_) {
    this.clipLayer_ = /** @type {acgraph.vector.Layer} */ (acgraph.layer());
    this.clipLayer_.zIndex(anychart.core.ui.BaseGrid.CLIP_Z_INDEX);
    this.registerDisposable(this.clipLayer_);
  }
  return this.clipLayer_;
};


/**
 * Inner getter for this.scrollsLayer_.
 * @return {acgraph.vector.Layer}
 */
anychart.core.ui.BaseGrid.prototype.getScrollsLayer = function() {
  if (!this.scrollsLayer_) {
    this.scrollsLayer_ = /** @type {acgraph.vector.Layer} */ (acgraph.layer());
    this.scrollsLayer_.zIndex(anychart.core.ui.BaseGrid.SCROLLS_Z_INDEX);
    this.registerDisposable(this.scrollsLayer_);
  }
  return this.scrollsLayer_;
};


/**
 * Getter for this.oddPath_.
 * @return {acgraph.vector.Path}
 */
anychart.core.ui.BaseGrid.prototype.getOddPath = function() {
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
anychart.core.ui.BaseGrid.prototype.getEvenPath = function() {
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
anychart.core.ui.BaseGrid.prototype.getHoverPath = function() {
  if (!this.hoverPath_) {
    this.hoverPath_ = /** @type {acgraph.vector.Path} */ (this.getCellsLayer().path());
    this.hoverPath_.stroke(null).fill(this.hoverFill_).zIndex(2);
    this.registerDisposable(this.hoverPath_);
  }
  return this.hoverPath_;
};


/**
 * Getter for this.selectedPath_.
 * @return {acgraph.vector.Path}
 */
anychart.core.ui.BaseGrid.prototype.getSelectedPath = function() {
  if (!this.selectedPath_) {
    this.selectedPath_ = /** @type {acgraph.vector.Path} */ (this.getCellsLayer().path());
    this.selectedPath_.stroke(null).fill(this.rowSelectedFill_).zIndex(3);
    this.registerDisposable(this.selectedPath_);
  }
  return this.selectedPath_;
};


/**
 * Getter for this.rowStrokePath_.
 * @return {acgraph.vector.Path}
 */
anychart.core.ui.BaseGrid.prototype.getRowStrokePath = function() {
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
anychart.core.ui.BaseGrid.prototype.getEditStructurePreviewPath_ = function() {
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
anychart.core.ui.BaseGrid.prototype.getHeaderSeparationPath = function() {
  if (!this.headerSeparationPath_) {
    this.headerSeparationPath_ = /** @type {acgraph.vector.Path} */ (this.getCellsLayer().path());
    this.headerSeparationPath_.zIndex(40);
    this.registerDisposable(this.headerSeparationPath_);
  }
  return this.headerSeparationPath_;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Decoration.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Gets/sets a default rows fill. Resets odd fill and even fill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.ui.BaseGrid|string} - Current value or itself for method chaining.
 */
anychart.core.ui.BaseGrid.prototype.rowFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
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
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.ui.BaseGrid|string} - Current value or itself for method chaining.
 * @deprecated Since 7.7.0. Use rowFill() instead.
 */
anychart.core.ui.BaseGrid.prototype.cellFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null, ['cellFill()', 'rowFill()'], true);
  return this.rowFill(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy);
};


/**
 * Gets/sets row odd fill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.ui.BaseGrid|string} - Current value or itself for method chaining.
 */
anychart.core.ui.BaseGrid.prototype.rowOddFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
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
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.ui.BaseGrid|string} - Current value or itself for method chaining.
 * @deprecated Since 7.7.0. Use rowOddFill() instead.
 */
anychart.core.ui.BaseGrid.prototype.cellOddFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null, ['cellOddFill()', 'rowOddFill()'], true);
  return this.rowOddFill(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy);
};


/**
 * Gets/sets row even fill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.ui.BaseGrid|string} - Current value or itself for method chaining.
 */
anychart.core.ui.BaseGrid.prototype.rowEvenFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
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
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.ui.BaseGrid|string} - Current value or itself for method chaining.
 * @deprecated Since 7.7.0. Use rowEvenFill() instead.
 */
anychart.core.ui.BaseGrid.prototype.cellEvenFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null, ['cellEvenFill()', 'rowEvenFill()'], true);
  return this.rowEvenFill(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy);
};


/**
 * Gets/sets row hover fill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.ui.BaseGrid|string} - Current value or itself for method chaining.
 */
anychart.core.ui.BaseGrid.prototype.rowHoverFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var val = acgraph.vector.normalizeFill.apply(null, arguments);
    if (!anychart.color.equals(/** @type {acgraph.vector.Fill} */ (this.hoverFill_), val)) {
      //NOTE: this value will be applied on mouse event. That's why we do not invalidate anything.
      this.hoverFill_ = val;
    }
    return this;
  }
  return this.hoverFill_;
};


/**
 * Gets/sets row selected fill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.ui.BaseGrid|string} - Current value or itself for method chaining.
 */
anychart.core.ui.BaseGrid.prototype.rowSelectedFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
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
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.ui.BaseGrid|string} - Current value or itself for method chaining.
 */
anychart.core.ui.BaseGrid.prototype.backgroundFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
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
 * Gets/sets a default editStructurePreviewFill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.ui.BaseGrid|string} - Current value or itself for method chaining.
 */
anychart.core.ui.BaseGrid.prototype.editStructurePreviewFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
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
 * @return {(string|acgraph.vector.Stroke|anychart.core.ui.BaseGrid)} - Current value or itself for method chaining.
 */
anychart.core.ui.BaseGrid.prototype.editStructurePreviewStroke = function(opt_value) {
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
 * @return {(string|acgraph.vector.Stroke|anychart.core.ui.BaseGrid)} - Current value or itself for method chaining.
 */
anychart.core.ui.BaseGrid.prototype.editStructurePreviewDashStroke = function(opt_value) {
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
anychart.core.ui.BaseGrid.prototype.dragMouseDown_ = function(e) {
  if (e.currentTarget instanceof acgraph.vector.Element && !this.scrollDragger) {
    this.scrollDragger = new anychart.core.ui.BaseGrid.Dragger(this.base_, this);
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
anychart.core.ui.BaseGrid.prototype.dragStartHandler_ = function(e) {
  this.scrollDragger.reset();
};


/**
 * Drag handler.
 * @param {goog.fx.DragEvent} e
 * @private
 */
anychart.core.ui.BaseGrid.prototype.dragHandler_ = function(e) {
  this.dragging = true;
  if (this.editable) {
    this.interactive = false;
    this.interactivityHandler.highlight();
    this.tooltip().hide();
    var evt = this.getInteractivityEvent(e);
    if (evt) {
      var destinationItem = evt['item'];
      var hoveredIndex = evt['hoveredIndex'];

      var itemHeightMouseRatio = evt['itemHeightMouseRatio'];
      var startY = evt['startY'];
      var endY = evt['endY'];

      if (this.draggingItem && destinationItem && destinationItem != this.draggingItem && !destinationItem.isChildOf(this.draggingItem)) {
        if (itemHeightMouseRatio < anychart.core.ui.BaseGrid.LOWER_DRAG_EDIT_RATIO ||
            itemHeightMouseRatio > anychart.core.ui.BaseGrid.HIGHER_DRAG_EDIT_RATIO) {
          var top = itemHeightMouseRatio < anychart.core.ui.BaseGrid.LOWER_DRAG_EDIT_RATIO ? startY : endY;
          this.interactivityHandler.editStructureHighlight(top, void 0, 'auto');
        } else {
          if (anychart.core.ui.BaseGrid.isMilestone(destinationItem)) {
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
anychart.core.ui.BaseGrid.prototype.dragEndHandler_ = function(e) {
  if (this.editable) {
    var evt = this.getInteractivityEvent(e);

    this.addDragMouseUp(evt);

    if (evt) {
      var destinationItem = evt['item'];
      var hoveredIndex = evt['hoveredIndex'];
      var totalIndex = this.controller.startIndex() + hoveredIndex;

      var visibleItems = this.controller.getVisibleItems();


      var itemHeightMouseRatio = evt['itemHeightMouseRatio'];
      var firstItem, secondItem; //We drop item between these two.

      if (this.draggingItem && destinationItem && destinationItem != this.draggingItem && !anychart.core.ui.BaseGrid.isMilestone(destinationItem) && !destinationItem.isChildOf(this.draggingItem)) {
        if (itemHeightMouseRatio < anychart.core.ui.BaseGrid.LOWER_DRAG_EDIT_RATIO || itemHeightMouseRatio > anychart.core.ui.BaseGrid.HIGHER_DRAG_EDIT_RATIO) {
          if (itemHeightMouseRatio < anychart.core.ui.BaseGrid.LOWER_DRAG_EDIT_RATIO) {
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
anychart.core.ui.BaseGrid.prototype.drawRowFills_ = function() {
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
anychart.core.ui.BaseGrid.prototype.mouseWheelHandler_ = function(e) {
  if (goog.global['anychart']['ui']['ContextMenu']) {
    if (this.interactivityHandler.contextMenu) {
      var menu = this.interactivityHandler.contextMenu();
      if (menu.isVisible()) menu.hide();
    }
  }

  var dx = e.deltaX;
  var dy = e.deltaY;

  var scrollsVertically = Math.abs(dy) > 0;
  var scrollsHorizontally = Math.abs(dx) > 0;

  if (goog.userAgent.WINDOWS) {
    dx = dx * 15;
    dy = dy * 15;
  }

  var denyBodyScrollLeft = !goog.global['document']['body']['scrollLeft'];
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
anychart.core.ui.BaseGrid.prototype.needsReapplicationHandler_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.dispatchSignal(anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Tooltip invalidation handler.
 * @param {anychart.SignalEvent} event - Event object.
 * @private
 */
anychart.core.ui.BaseGrid.prototype.onTooltipSignal_ = function(event) {
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
anychart.core.ui.BaseGrid.prototype.appearanceInvalidated = goog.nullFunction;


/**
 * Additional actions on bounds invalidation.
 */
anychart.core.ui.BaseGrid.prototype.boundsInvalidated = goog.nullFunction;


/**
 * @inheritDoc
 */
anychart.core.ui.BaseGrid.prototype.defaultRowHeight = function(opt_value) {
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
anychart.core.ui.BaseGrid.prototype.createController = function(opt_isResources) {
  this.controller = new anychart.core.gantt.Controller(opt_isResources);
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
 * @return {anychart.core.ui.BaseGrid} - Itself for method chaining.
 */
anychart.core.ui.BaseGrid.prototype.drawInternal = function(positionRecalculated) {
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
        .fill(this.backgroundFill_)
        .stroke(null)
        .zIndex(anychart.core.ui.BaseGrid.BG_RECT_Z_INDEX);

    this.eventsRect_ = this.base_.rect();
    this.registerDisposable(this.eventsRect_);
    this.eventsRect_
        .fill(anychart.color.TRANSPARENT_HANDLER)
        .stroke(null)
        .zIndex(anychart.core.ui.BaseGrid.EVENTS_RECT_Z_INDEX);

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
    this.bgRect_.fill(this.backgroundFill_);
    this.getOddPath().fill(this.rowOddFill_ || this.rowFill_);
    this.getEvenPath().fill(this.rowEvenFill_ || this.rowFill_);
    this.getSelectedPath().fill(this.rowSelectedFill_);

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
anychart.core.ui.BaseGrid.prototype.initDom = goog.nullFunction;


/**
 * Generates horizontal scroll bar.
 * @param {Object=} opt_value Object with settings.
 * @return {anychart.core.ui.ScrollBar|anychart.core.ui.BaseGrid} - Scroll bar.
 */
anychart.core.ui.BaseGrid.prototype.horizontalScrollBar = goog.abstractMethod;


/** @inheritDoc */
anychart.core.ui.BaseGrid.prototype.highlight = function(opt_index, opt_startY, opt_endY) {
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
    this.getHoverPath()
        .clear()
        .fill(this.hoverFill_)
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
anychart.core.ui.BaseGrid.prototype.editStructureHighlight = function(opt_startY, opt_endY, opt_cursor) {
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
    goog.style.setStyle(goog.global['document']['body'], 'cursor', opt_cursor);

};


/**
 * Initializes mouse wheel scrolling and mouse drag scrolling.
 * TODO (A.Kudryavtsev): In current implementation (04 Dec 2014) mouse drag scrolling is not available.
 */
anychart.core.ui.BaseGrid.prototype.initMouseFeatures = function() {
  if (!this.mwh_) {
    var element = this.getBase().domElement();
    var ths = this;

    if (element) {
      this.mwh_ = new goog.events.MouseWheelHandler(element);
      var mouseWheelEvent = goog.events.MouseWheelHandler.EventType.MOUSEWHEEL;
      goog.events.listen(this.mwh_, mouseWheelEvent, this.mouseWheelHandler_, false, this);

      goog.events.listen(window, 'unload', function(e) {
        goog.events.unlisten(ths.mwh_, mouseWheelEvent, ths.mouseWheelHandler_, false, this);
      });
    }

    goog.events.listen(document, goog.events.EventType.MOUSEMOVE, this.docMouseMoveListener_, false, this);
  }
};


/**
 * Document mouse move listener.
 * @param {goog.fx.DragEvent} e - Event.
 * @private
 */
anychart.core.ui.BaseGrid.prototype.docMouseMoveListener_ = function(e) {
  var l = anychart.core.ui.BaseGrid.SCROLL_MOUSE_OUT_INSIDE_LENGTH;
  var containerPosition = this.container().getStage().getClientPosition();
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
  if (this.dragging && !this.scrollInterval) {
    this.scrollInterval = setInterval(function() {
      ths.mouseOutMove(e);
    }, anychart.core.ui.BaseGrid.TIMER_STEP);
  }

};


/**
 * Initializes keys listening.
 */
anychart.core.ui.BaseGrid.prototype.initKeysFeatures = function() {
  if (!this.interactivityHandler.altKeyHandler) {
    this.interactivityHandler.altKeyHandler = new anychart.core.ui.BaseGrid.KeyHandler(this.interactivityHandler, document);
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
 * @inheritDoc
 */
anychart.core.ui.BaseGrid.prototype.deleteKeyHandler = function(e) {
};


/**
 * Additional actions on position invalidation.
 */
anychart.core.ui.BaseGrid.prototype.positionInvalidated = goog.nullFunction;


/**
 * Additional actions on position. Differs from positionInvalidated:
 * this method is called at the very last when this.redrawPosition is set to true.
 */
anychart.core.ui.BaseGrid.prototype.positionFinal = goog.nullFunction;


/**
 * @inheritDoc
 */
anychart.core.ui.BaseGrid.prototype.remove = function() {
  if (this.base_) this.base_.parent(null);
};


/**
 * Gets/sets row stroke.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill .
 * @param {number=} opt_thickness .
 * @param {string=} opt_dashpattern .
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin .
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap .
 * @return {(string|acgraph.vector.Stroke|anychart.core.ui.BaseGrid)} - Current value or itself for method chaining.
 */
anychart.core.ui.BaseGrid.prototype.rowStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
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
anychart.core.ui.BaseGrid.prototype.scroll = goog.abstractMethod;


/**
 * Method to select row from outside.
 * @param {anychart.data.Tree.DataItem} item - New selected data item.
 * @return {boolean} - Whether has been selected.
 */
anychart.core.ui.BaseGrid.prototype.selectRow = function(item) {
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
anychart.core.ui.BaseGrid.prototype.specialInvalidated = goog.nullFunction;


/**
 * @inheritDoc
 */
anychart.core.ui.BaseGrid.prototype.rowUnselect = function(event) {
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
 * @param {anychart.data.Tree=} opt_value - New data tree.
 * @return {?(anychart.core.ui.BaseGrid|anychart.data.Tree)} - Current data tree or itself for method chaining.
 */
anychart.core.ui.BaseGrid.prototype.data = function(opt_value) {
  var data = /** @type {?anychart.data.Tree} */ (this.controller.data());
  if (goog.isDef(opt_value)) {
    if ((opt_value != data) && (opt_value instanceof anychart.data.Tree)) {
      this.controller.data(opt_value); //This will invalidate position.
    }
    return this;
  }
  return data;
};


/**
 * Draws grid.
 * @return {anychart.core.ui.BaseGrid}
 */
anychart.core.ui.BaseGrid.prototype.draw = function() {
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
 * @return {(anychart.core.ui.BaseGrid|number)} - Current value or itself for method chaining.
 */
anychart.core.ui.BaseGrid.prototype.endIndex = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.controller.endIndex(opt_value);
    return this;
  }
  return /** @type {number} */ (this.controller.endIndex());
};


/**
 * Getter for the set of visible (not collapsed) data items.
 * @return {Array.<anychart.data.Tree.DataItem>}
 */
anychart.core.ui.BaseGrid.prototype.getVisibleItems = function() {
  return this.controller.getVisibleItems();
};


/**
 * Gets/sets start index.
 * @param {number=} opt_value - Value to be set.
 * @return {(anychart.core.ui.BaseGrid|number)} - Current value or itself for method chaining.
 */
anychart.core.ui.BaseGrid.prototype.startIndex = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.controller.startIndex(opt_value);
    return this;
  }
  return /** @type {number} */ (this.controller.startIndex());
};


/**
 * Gets/sets header height.
 * @param {number=} opt_value - Value to be set.
 * @return {(number|anychart.core.ui.BaseGrid)} - Current value or itself for method chaining.
 */
anychart.core.ui.BaseGrid.prototype.headerHeight = function(opt_value) {
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
 * Gets/sets header height.
 * @param {number=} opt_value - Value to be set.
 * @deprecated Since 7.7.0. Use headerHeight() instead.
 * @return {(number|anychart.core.ui.BaseGrid)} - Current value or itself for method chaining.
 */
anychart.core.ui.BaseGrid.prototype.titleHeight = function(opt_value) {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null, ['titleHeight()', 'headerHeight()'], true);
  return this.headerHeight(opt_value);
};


/**
 * Getter for tooltip settings.
 * @param {(Object|boolean|null)=} opt_value - Tooltip settings.
 * @return {!(anychart.core.ui.BaseGrid|anychart.core.ui.Tooltip)} - Tooltip instance or self for method chaining.
 */
anychart.core.ui.BaseGrid.prototype.tooltip = function(opt_value) {
  if (!this.tooltip_) {
    this.tooltip_ = new anychart.core.ui.Tooltip(0);
    this.registerDisposable(this.tooltip_);
    this.tooltip_.listenSignals(this.onTooltipSignal_, this);
    this.tooltip_.boundsProvider = this;
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
 * @return {(anychart.core.ui.BaseGrid|number)} - Current value or itself for method chaining.
 */
anychart.core.ui.BaseGrid.prototype.verticalOffset = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.controller.verticalOffset(opt_value);
    return this;
  }
  return /** @type {number} */ (this.controller.verticalOffset());
};


/**
 * @inheritDoc
 */
anychart.core.ui.BaseGrid.prototype.disposeInternal = function() {
  anychart.core.ui.BaseGrid.base(this, 'disposeInternal');
  goog.events.unlisten(document, goog.events.EventType.MOUSEMOVE, this.docMouseMoveListener_, false, this);
};


/** @inheritDoc */
anychart.core.ui.BaseGrid.prototype.serialize = function() {
  var json = anychart.core.ui.BaseGrid.base(this, 'serialize');

  json['isStandalone'] = this.isStandalone;

  /*
    Note: not standalone grid is controlled by some higher entity (e.g. gantt chart).
    It means that controller must be serialized and restored by this entity, but not by base grid.
   */
  if (this.isStandalone) {
    json['controller'] = this.controller.serialize();
    json['defaultRowHeight'] = this.defaultRowHeight();
  }

  json['backgroundFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill} */ (this.backgroundFill_));
  json['rowStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke} */ (this.rowStroke_));
  json['headerHeight'] = this.headerHeight_;
  json['headerHeight'] = this.defaultRowHeight();
  json['rowOddFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill} */ (this.rowOddFill_));
  json['rowEvenFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill} */ (this.rowEvenFill_));
  json['rowFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill} */ (this.rowFill_));
  json['hoverFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill} */ (this.hoverFill_));
  json['rowSelectedFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill} */ (this.rowSelectedFill_));
  json['editStructurePreviewFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill} */ (this.editStructurePreviewFill_));
  json['editStructurePreviewStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke} */ (this.editStructurePreviewStroke_));
  json['editStructurePreviewDashStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke} */ (this.editStructurePreviewDashStroke_));

  json['editing'] = this.editable;
  json['tooltip'] = this.tooltip().serialize();

  return json;
};


/**
 * @inheritDoc
 * @suppress {deprecated}
 */
anychart.core.ui.BaseGrid.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.ui.BaseGrid.base(this, 'setupByJSON', config, opt_default);

  this.isStandalone = ('isStandalone' in config) ? config['isStandalone'] : ('controller' in config);

  if (this.isStandalone && 'controller' in config) {
    this.createController();
    this.controller.setup(config['controller']);
    this.defaultRowHeight(config['defaultRowHeight']);
  }

  if (goog.isDef(config['cellFill']))
    this.cellFill(config['cellFill']);
  if (goog.isDef(config['cellOddFill']))
    this.cellOddFill(config['cellOddFill']);
  if (goog.isDef(config['cellEvenFill']))
    this.cellEvenFill(config['cellEvenFill']);

  this.backgroundFill(config['backgroundFill']);
  this.rowStroke(config['rowStroke']);
  this.rowFill(config['rowFill']);
  this.rowOddFill(config['rowOddFill']);
  this.rowEvenFill(config['rowEvenFill']);
  this.rowHoverFill(config['hoverFill']);
  this.rowSelectedFill(config['rowSelectedFill']);

  if ('tooltip' in config)
    this.tooltip().setupByVal(config['tooltip'], opt_default);

  if (goog.isDef(config['titleHeight']))
    this.titleHeight(config['titleHeight']);

  this.headerHeight(config['headerHeight']);
  this.editStructurePreviewFill(config['editStructurePreviewFill']);
  this.editStructurePreviewStroke(config['editStructurePreviewStroke']);
  this.editStructurePreviewDashStroke(config['editStructurePreviewDashStroke']);
  this.editing(config['editing']);
};



/**
 * Dragger.
 * @param {acgraph.vector.Element} target - Target element.
 * @param {anychart.core.ui.BaseGrid} grid - Current grid to be scrolled.
 * @constructor
 * @extends {goog.fx.Dragger}
 */
anychart.core.ui.BaseGrid.Dragger = function(target, grid) {
  anychart.core.ui.BaseGrid.Dragger.base(this, 'constructor', target.domElement());

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
goog.inherits(anychart.core.ui.BaseGrid.Dragger, goog.fx.Dragger);


/**
 * @override
 */
anychart.core.ui.BaseGrid.Dragger.prototype.computeInitialPosition = function() {
  //TODO (A.Kudryavtsev): We don't actually need to override it right here, but
  //TODO (A.Kudryavtsev): default method dies in IE.
  this.deltaX = 0;
  this.deltaY = 0;
};


/**
 * @override
 */
anychart.core.ui.BaseGrid.Dragger.prototype.defaultAction = function(x, y) {
  if (this.grid.interactivityHandler.altKey || !this.grid.editable) {
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
anychart.core.ui.BaseGrid.Dragger.prototype.reset = function() {
  this.x = 0;
  this.y = 0;
};



/**
 * Key handler.
 * @param {anychart.core.ui.IInteractiveGrid} grid - Base grid itself.
 * @param {Element|Document=} opt_element - The element or document to listen on.
 * @param {boolean=} opt_capture - Whether to listen for browser events in
 *     capture phase (defaults to false).
 * @constructor
 * @extends {goog.events.KeyHandler}
 * @suppress {accessControls} - TODO Add another mechanism (fix this inheritance).
 */
anychart.core.ui.BaseGrid.KeyHandler = function(grid, opt_element, opt_capture) {
  anychart.core.ui.BaseGrid.KeyHandler.base(this, 'constructor', opt_element, opt_capture);

  /**
   * @type {anychart.core.ui.IInteractiveGrid}
   */
  this.grid = grid;
};
goog.inherits(anychart.core.ui.BaseGrid.KeyHandler, goog.events.KeyHandler);


/** @inheritDoc */
anychart.core.ui.BaseGrid.KeyHandler.prototype.resetState = function() {
  anychart.core.ui.BaseGrid.KeyHandler.base(this, 'resetState');
  this.grid.altKey = false;
};



/**
 * Actually is a path to be drawn on drawLayer.
 * Used to draw some elements as Timeline's bars with additional data.
 * @constructor
 * @extends {acgraph.vector.Path}
 */
anychart.core.ui.BaseGrid.Element = function() {
  anychart.core.ui.BaseGrid.Element.base(this, 'constructor');

  /**
   * Meta information. Used for inner purposes only.
   * @type {Object}
   */
  this.meta = {};
};
goog.inherits(anychart.core.ui.BaseGrid.Element, acgraph.vector.Path);


/**
 * Type of element. In current implementation (21 Jul 2015) can be one of timeline's bars type.
 * @type {anychart.enums.TLElementTypes|undefined}
 */
anychart.core.ui.BaseGrid.Element.prototype.type;


/**
 * Current bounds cache. Used to avoid unnecessary bounds calculation.
 * @type {?anychart.math.Rect}
 */
anychart.core.ui.BaseGrid.Element.prototype.currBounds = null;

