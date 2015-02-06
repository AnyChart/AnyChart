goog.provide('anychart.core.ui.DataGrid');

goog.require('acgraph');
goog.require('anychart.core.VisualBaseWithBounds');
goog.require('anychart.core.gantt.Controller');
goog.require('anychart.core.ui.Button');
goog.require('anychart.core.ui.LabelsFactory');
goog.require('anychart.core.ui.Splitter');
goog.require('anychart.core.ui.Tooltip');
goog.require('anychart.math.Rect');
goog.require('anychart.utils');

goog.require('goog.events');
goog.require('goog.events.MouseWheelHandler');



/**
 * Data grid implementation.
 * @constructor
 * @extends {anychart.core.VisualBaseWithBounds}
 */
anychart.core.ui.DataGrid = function() {
  goog.base(this);

  /**
   * Source data tree.
   * @type {anychart.data.Tree}
   * @private
   */
  this.data_ = null;

  /**
   * Array of visible data items.
   * @type {Array.<anychart.data.Tree.DataItem>}
   * @private
   */
  this.visibleItems_ = [];


  /**
   * Flag whether data grid is used standalone.
   * Here we suppose that user can't set controller manually is stand alone mode. That's why this flag becomes false when
   *  new controller is set.
   * @type {boolean}
   * @private
   */
  this.isStandalone_ = true;

  /**
   * Data grid controller.
   * @type {anychart.core.gantt.Controller}
   * @private
   */
  this.controller_ = null;

  /**
   * Title height. Defined by timeline's header height.
   * @type {number}
   * @private
   */
  this.titleHeight_ = 0;

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
   * Array of columns.
   * @type {Array.<anychart.core.ui.DataGrid.Column>}
   * @private
   */
  this.columns_ = [];

  /**
   * Splitters pool.
   * @type {Array.<anychart.core.ui.Splitter>}
   * @private
   */
  this.splitters_ = [];

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
   * Data grid bg.
   * @type {acgraph.vector.Fill}
   * @private
   */
  this.backgroundFill_ = acgraph.vector.normalizeFill('#ccd7e1');

  /**
   * Columns layer.
   * @type {acgraph.vector.Layer}
   * @private
   */
  this.columnsLayer_ = null;

  /**
   * Splitters layer.
   * @type {acgraph.vector.Layer}
   * @private
   */
  this.splittersLayer_ = null;

  /**
   * Cells layer.
   * @type {acgraph.vector.Layer}
   * @private
   */
  this.cellsLayer_ = null;

  /**
   * Pixel bounds cache.
   * @type {anychart.math.Rect}
   * @private
   */
  this.pixelBoundsCache_ = null;

  /**
   * Cell border settings.
   * @type {acgraph.vector.Stroke}
   * @private
   */
  this.cellBorder_ = acgraph.vector.normalizeStroke('#ccd7e1', 1);

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
   * Default title fill.
   * @type {acgraph.vector.Fill}
   * @private
   */
  this.titleFill_ = acgraph.vector.normalizeFill(['#f8f8f8', '#fff'], 90);

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
   * Data grid tooltip.
   * @type {anychart.core.ui.Tooltip}
   * @private
   */
  this.tooltip_ = null;


  this.column(0).textFormatter(function(item) {
    return goog.isDefAndNotNull(item.meta('index')) ? (item.meta('index') + 1) + '' : '';
  });

  this
      .column(1)
      .useButtons(true)
      .textFormatter(function(item) {
        return goog.isDefAndNotNull(item.get('name')) ? item.get('name') + '' : '';
      })
      .depthPaddingMultiplier(3 * anychart.core.ui.DataGrid.DEFAULT_PADDING);


  var tooltip = /** @type {anychart.core.ui.Tooltip} */(this.tooltip());
  tooltip.suspendSignalsDispatching();
  tooltip.isFloating(true);
  tooltip.anchor(anychart.enums.Anchor.LEFT_TOP);
  tooltip.content().hAlign(anychart.enums.Align.LEFT);
  tooltip.contentFormatter(function(data) {
    return data.get(anychart.enums.GanttDataFields.NAME) + '';
  });
  tooltip.resumeSignalsDispatching(false);

};
goog.inherits(anychart.core.ui.DataGrid, anychart.core.VisualBaseWithBounds);


/**
 * Supported signals.
 * @type {number}
 */
anychart.core.ui.DataGrid.SUPPORTED_SIGNALS = anychart.core.VisualBaseWithBounds.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistence states.
 * @type {number}
 */
anychart.core.ui.DataGrid.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBaseWithBounds.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.GRIDS |
    anychart.ConsistencyState.POSITION |
    anychart.ConsistencyState.HOVER |
    anychart.ConsistencyState.CLICK;


/**
 * Default cell height.
 * @type {number}
 */
anychart.core.ui.DataGrid.DEFAULT_ROW_HEIGHT = 20;


/**
 * Row space.
 * @type {number}
 */
anychart.core.ui.DataGrid.ROW_SPACE = 1;


/**
 * Default side size of expand-collapse button.
 * @type {number}
 */
anychart.core.ui.DataGrid.DEFAULT_EXPAND_COLLAPSE_BUTTON_SIDE = 15;


/**
 * Default left padding in column.
 * @type {number}
 */
anychart.core.ui.DataGrid.DEFAULT_PADDING = 5;


/**
 * Minimal column width.
 * @type {number}
 */
anychart.core.ui.DataGrid.MIN_COLUMN_WIDTH = 20;


/**
 * By default, first column is column of straight numeration.
 * Has a shortest default width.
 * @type {number}
 */
anychart.core.ui.DataGrid.NUMBER_COLUMN_WIDTH = 40;


/**
 * By default, second column of data grid is widest, contains expand/collapse button and some text that determines general
 * row information (name by default).
 * Has a longest default width.
 * @type {number}
 */
anychart.core.ui.DataGrid.NAME_COLUMN_WIDTH = 150;


/**
 * Default width of all other columns.
 * @type {number}
 */
anychart.core.ui.DataGrid.DEFAULT_COLUMN_WIDTH = 75;


/**
 * Gets/sets a default title fill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.ui.DataGrid|string} - Current value or itself for method chaining.
 */
anychart.core.ui.DataGrid.prototype.titleFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var val = acgraph.vector.normalizeFill.apply(null, arguments);
    if (!anychart.color.equals(/** @type {acgraph.vector.Fill} */ (this.titleFill_), val)) {
      this.titleFill_ = val;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.titleFill_;
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
 * @return {acgraph.vector.Fill|anychart.core.ui.DataGrid|string} - Current value or itself for method chaining.
 */
anychart.core.ui.DataGrid.prototype.rowFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
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
 * @return {acgraph.vector.Fill|anychart.core.ui.DataGrid|string} - Current value or itself for method chaining.
 * @deprecated - Use {@link rowFill} instead.
 */
anychart.core.ui.DataGrid.prototype.cellFill = anychart.core.ui.DataGrid.prototype.rowFill;


/**
 * Gets/sets row odd fill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.ui.DataGrid|string} - Current value or itself for method chaining.
 */
anychart.core.ui.DataGrid.prototype.rowOddFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
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
 * @return {acgraph.vector.Fill|anychart.core.ui.DataGrid|string} - Current value or itself for method chaining.
 * @deprecated - Use {@link rowOddFill} instead.
 */
anychart.core.ui.DataGrid.prototype.cellOddFill = anychart.core.ui.DataGrid.prototype.rowOddFill;


/**
 * Gets/sets row even fill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.ui.DataGrid|string} - Current value or itself for method chaining.
 */
anychart.core.ui.DataGrid.prototype.rowEvenFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
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
 * @return {acgraph.vector.Fill|anychart.core.ui.DataGrid|string} - Current value or itself for method chaining.
 * @deprecated - Use {@link rowEvenFill} instead.
 */
anychart.core.ui.DataGrid.prototype.cellEvenFill = anychart.core.ui.DataGrid.prototype.rowEvenFill;


/**
 * Gets/sets row hover fill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.ui.DataGrid|string} - Current value or itself for method chaining.
 */
anychart.core.ui.DataGrid.prototype.rowHoverFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
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
 * @return {acgraph.vector.Fill|anychart.core.ui.DataGrid|string} - Current value or itself for method chaining.
 */
anychart.core.ui.DataGrid.prototype.rowSelectedFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
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
 * @return {acgraph.vector.Fill|anychart.core.ui.DataGrid|string} - Current value or itself for method chaining.
 */
anychart.core.ui.DataGrid.prototype.backgroundFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
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
 * Gets/sets title height.
 * @param {number=} opt_value - Value to be set.
 * @return {(number|anychart.core.ui.DataGrid)} - Current value or itself for method chaining.
 */
anychart.core.ui.DataGrid.prototype.titleHeight = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.isStandalone_) {
      if (this.controller_) {
        if (!this.pixelBoundsCache_) this.pixelBoundsCache_ = /** @type {acgraph.math.Rect} */ (this.getPixelBounds());
        this.controller_.availableHeight(this.pixelBoundsCache_.height - opt_value - anychart.core.ui.DataGrid.ROW_SPACE);
      } else {
        if (this.titleHeight_ != opt_value) {
          this.titleHeight_ = opt_value;
          this.invalidate(anychart.ConsistencyState.POSITION, anychart.Signal.NEEDS_REDRAW);
        }
      }
    } else {
      anychart.utils.warning(anychart.enums.WarningCode.DG_INCORRECT_METHOD_USAGE, null, ['titleHeight', 'controller.availableHeight()',
        'Data grid\'s title height will be calculated as difference between data grid\'s height and controller\'s available height.']);
    }

    return this;
  }
  return this.titleHeight_;
};


/**
 * Gets/sets title height.
 * NOTE: Do not export this method. Setting a controller with this method means that data grid is not standalone and
 *  is controlled by some higher entity (chart, for example).
 * @param {anychart.core.gantt.Controller=} opt_value - Value to be set.
 * @return {(anychart.core.gantt.Controller|anychart.core.ui.DataGrid)} - Current value or itself for method chaining.
 */
anychart.core.ui.DataGrid.prototype.controller = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.controller_ != opt_value) {
      this.isStandalone_ = false;
      this.controller_ = opt_value;
    }
    return this;
  }
  return this.controller_;
};


/**
 * 'Needs reapplication' handler.
 *  @param {anychart.SignalEvent} event - Incoming event.
 * @private
 */
anychart.core.ui.DataGrid.prototype.needsReapplicationHandler_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.dispatchSignal(anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Inner getter for this.base_.
 * @return {acgraph.vector.Layer}
 * @private
 */
anychart.core.ui.DataGrid.prototype.getBase_ = function() {
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
anychart.core.ui.DataGrid.prototype.mouseMoveHandler_ = function(event) {
  var initialTop = /** @type {number} */ (this.pixelBoundsCache_.top + this.titleHeight_ + anychart.core.ui.DataGrid.ROW_SPACE - this.verticalOffset_);

  var mouseHeight = event.offsetY - this.titleHeight_ - this.pixelBoundsCache_.top;

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

      var itemIndex = this.startIndex_ + index;
      var item = this.visibleItems_[itemIndex];

      var tooltip = /** @type {anychart.core.ui.Tooltip} */(this.tooltip());
      var position = tooltip.isFloating() ?
          new acgraph.math.Coordinate(event.clientX, event.clientY) :
          new acgraph.math.Coordinate(0, 0);
      tooltip.show(item, position);

    } else {
      this.tooltip().hide();
      this.highlight();
      this.hoveredIndex_ = -1;
    }

  }
};


/**
 * Handler for mouse out.
 * TODO (A.Kudryavtsev): I really don't like that this code is a copy of mouseMoveHandler_ if timeline.
 * @param {acgraph.events.Event} event - Event.
 * @private
 */
anychart.core.ui.DataGrid.prototype.mouseOutHandler_ = function(event) {
  this.tooltip().hide();
  this.highlight();
  this.hoveredIndex_ = -1;
};


/**
 * Handler for mouse click.
 * @param {acgraph.events.Event} event - Event.
 * @private
 */
anychart.core.ui.DataGrid.prototype.mouseClickHandler_ = function(event) {
  var mouseHeight = event.offsetY - this.titleHeight_ - this.pixelBoundsCache_.top;

  if (this.gridHeightCache_.length) {
    var totalHeight = this.gridHeightCache_[this.gridHeightCache_.length - 1];
    if (mouseHeight > 0 && mouseHeight < totalHeight) { //Triggered over the rows only.
      var index = goog.array.binarySearch(this.gridHeightCache_, mouseHeight + this.verticalOffset_);
      index = index >= 0 ? index : ~index; //Index of row under mouse.

      var item = this.visibleItems_[this.startIndex_ + index]; //Theoretically, here must not be any exceptions.
      if (!item.meta('selected')) {
        this.selectRow(item);

        this.dispatchEvent({
          'type': anychart.enums.EventType.ROW_CLICK,
          'item': item
        });

        this.invalidate(anychart.ConsistencyState.CLICK, anychart.Signal.NEEDS_REDRAW);
      }
    }
  }
};


/**
 * Highlights selected vertical range.
 * TODO (A.Kudryavtsev): I really don't like that this code is a copy of mouseMoveHandler_ if timeline.
 * @param {number=} opt_index - Index of row.
 * @param {number=} opt_startY - Start Y to be highlighted.
 * @param {number=} opt_endY - End Y to be highlighted.
 * @param {boolean=} opt_preventDispatching - If dispatching should be prevented.
 */
anychart.core.ui.DataGrid.prototype.highlight = function(opt_index, opt_startY, opt_endY, opt_preventDispatching) {
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
    this.invalidate(anychart.ConsistencyState.HOVER, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Method to select row from outside.
 * @param {anychart.data.Tree.DataItem} item - New selected data item.
 */
anychart.core.ui.DataGrid.prototype.selectRow = function(item) {
  if (item != this.selectedItem_) {
    item.tree().suspendSignalsDispatching();
    item.meta('selected', true);
    if (this.selectedItem_) this.selectedItem_.meta('selected', false); //selectedItem_ has the same tree as item.
    this.selectedItem_ = item;
    item.tree().resumeSignalsDispatching(false);
  }
};


/**
 * Getter for this.columnsLayer_.
 * @return {acgraph.vector.Layer}
 * @private
 */
anychart.core.ui.DataGrid.prototype.getColumnsLayer_ = function() {
  if (!this.columnsLayer_) {
    this.columnsLayer_ = /** @type {acgraph.vector.Layer} */ (acgraph.layer());
    this.registerDisposable(this.columnsLayer_);
  }
  return this.columnsLayer_;
};


/**
 * Getter for this.splittersLayer_.
 * @return {acgraph.vector.Layer}
 * @private
 */
anychart.core.ui.DataGrid.prototype.getSplitterLayer_ = function() {
  if (!this.splittersLayer_) {
    this.splittersLayer_ = /** @type {acgraph.vector.Layer} */ (acgraph.layer());
    this.registerDisposable(this.splittersLayer_);
  }
  return this.splittersLayer_;
};


/**
 * Getter for this.cellsLayer_.
 * @return {acgraph.vector.Layer}
 * @private
 */
anychart.core.ui.DataGrid.prototype.getCellsLayer_ = function() {
  if (!this.cellsLayer_) {
    this.cellsLayer_ = /** @type {acgraph.vector.Layer} */ (acgraph.layer());
    this.registerDisposable(this.cellsLayer_);
  }
  return this.cellsLayer_;
};


/**
 * Getter for this.oddPath_.
 * @return {acgraph.vector.Path}
 * @private
 */
anychart.core.ui.DataGrid.prototype.getOddPath_ = function() {
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
anychart.core.ui.DataGrid.prototype.getEvenPath_ = function() {
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
anychart.core.ui.DataGrid.prototype.getHoverPath_ = function() {
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
anychart.core.ui.DataGrid.prototype.getSelectedPath_ = function() {
  if (!this.selectedPath_) {
    this.selectedPath_ = /** @type {acgraph.vector.Path} */ (this.getCellsLayer_().path());
    this.selectedPath_.stroke(null).fill(this.rowSelectedFill_).zIndex(11);
    this.registerDisposable(this.selectedPath_);
  }
  return this.selectedPath_;
};


/**
 * Goes through all columns and calls passed function for each visible column (if column exists and enabled).
 * @param {Function} fn - Function to be applied to column. Signature:
 *   function(this: opt_obj, anychart.core.ui.DataGrid.Column, number, ...[*]):void.
 * @param {*=} opt_obj - Object to be used as 'this'.
 * @param {...*} var_args optional arguments for the fn.
 * @private
 */
anychart.core.ui.DataGrid.prototype.forEachVisibleColumn_ = function(fn, opt_obj, var_args) {
  var counter = -1;
  for (var i = 0, l = this.columns_.length; i < l; i++) {
    var column = this.columns_[i];
    if (column && column.enabled()) {
      counter++;
      var args = [column, counter];
      args.push.apply(args, goog.array.slice(arguments, 2));
      fn.apply(opt_obj || this, args);
    }
  }
};


/**
 * Collapses data item.
 * NOTE: Do not export.
 * @param {number} itemIndex - Index of data item.
 * @param {boolean} state - State to be set.
 * @return {anychart.core.ui.DataGrid} - Itself for method chaining.
 */
anychart.core.ui.DataGrid.prototype.collapseExpandItem = function(itemIndex, state) {
  this.visibleItems_[itemIndex].meta('collapsed', state); //Will send signal.
  return this;
};


/**
 * Gets/sets cell border. Actually parses a value to apply width and color to columns splitter.
 * @param {(acgraph.vector.Stroke|string)=} opt_value - Value to be set.
 * @return {(string|acgraph.vector.Stroke|anychart.core.ui.DataGrid)} - Current value or itself for method chaining.
 */
anychart.core.ui.DataGrid.prototype.cellBorder = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = acgraph.vector.normalizeStroke.apply(null, arguments);
    if (!anychart.color.equals(this.cellBorder_, val)) {
      this.cellBorder_ = val;
      this.invalidate(anychart.ConsistencyState.GRIDS, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.cellBorder_;
};


/**
 * Sets new data.
 * @param {anychart.data.Tree=} opt_value - New data tree.
 * @return {(anychart.core.ui.DataGrid|anychart.data.Tree)} - Current data tree or itself for method chaining.
 */
anychart.core.ui.DataGrid.prototype.data = function(opt_value) {
  if (goog.isDef(opt_value)) {
    /*
      DEVELOPERS NOTE: This will work as setter in standalone mode only.
      In not standalone mode set all values with controller.
     */
    if (this.isStandalone_) {
      if (this.controller_) {
        this.controller_.data(opt_value);
      } else {
        if (this.data_ != opt_value) {
          this.data_ = opt_value;
          this.invalidate(anychart.ConsistencyState.POSITION, anychart.Signal.NEEDS_REDRAW);
        }
      }
    } else {
      anychart.utils.warning(anychart.enums.WarningCode.DG_INCORRECT_METHOD_USAGE, null, ['data', 'controller.data']);
    }

    return this;
  }
  return this.data_;
};


/**
 * Getter for the set of visible (not collapsed) data items.
 * @return {Array.<anychart.data.Tree.DataItem>}
 */
anychart.core.ui.DataGrid.prototype.getVisibleItems = function() {
  return this.visibleItems_;
};


/**
 * Gets/sets start index.
 * @param {number=} opt_value - Value to be set.
 * @return {(anychart.core.ui.DataGrid|number)} - Current value or itself for method chaining.
 */
anychart.core.ui.DataGrid.prototype.startIndex = function(opt_value) {
  if (goog.isDef(opt_value)) {
    /*
      DEVELOPERS NOTE: This will work as setter in standalone mode only.
      In not standalone mode set all values with controller.
     */
    if (this.isStandalone_) {
      if (this.controller_) {
        this.controller_.startIndex(opt_value);
      } else {
        if (this.startIndex_ != opt_value) {
          this.startIndex_ = opt_value;
          this.endIndex_ = NaN;
          this.invalidate(anychart.ConsistencyState.POSITION, anychart.Signal.NEEDS_REDRAW);
        }
      }
    } else {
      anychart.utils.warning(anychart.enums.WarningCode.DG_INCORRECT_METHOD_USAGE, null, ['startIndex', 'controller.startIndex']);
    }

    return this;
  }
  return this.startIndex_;
};


/**
 * Gets/sets end index.
 * @param {number=} opt_value - Value to be set.
 * @return {(anychart.core.ui.DataGrid|number)} - Current value or itself for method chaining.
 */
anychart.core.ui.DataGrid.prototype.endIndex = function(opt_value) {
  if (goog.isDef(opt_value)) {
    /*
      DEVELOPERS NOTE: This will work as setter in standalone mode only.
      In not standalone mode set all values with controller.
     */
    if (this.isStandalone_) {
      if (this.controller_) {
        this.controller_.endIndex(opt_value);
      } else {
        if (this.endIndex_ != opt_value) {
          this.endIndex_ = opt_value;
          this.startIndex_ = NaN;
          this.invalidate(anychart.ConsistencyState.POSITION, anychart.Signal.NEEDS_REDRAW);
        }
      }
    } else {
      anychart.utils.warning(anychart.enums.WarningCode.DG_INCORRECT_METHOD_USAGE, null, ['endIndex', 'controller.endIndex']);
    }

    return this;
  }
  return this.endIndex_;
};


/**
 * Gets/set vertical offset.
 * @param {number=} opt_value - Value to be set.
 * @return {(number|anychart.core.ui.DataGrid)} - Current value or itself for method chaining.
 */
anychart.core.ui.DataGrid.prototype.verticalOffset = function(opt_value) {
  if (goog.isDef(opt_value)) {
    /*
      DEVELOPERS NOTE: This will work as setter in standalone mode only.
      In not standalone mode set all values with controller.
     */
    if (this.isStandalone_) {
      if (this.controller_) {
        this.controller_.verticalOffset(opt_value);
      } else {
        if (this.verticalOffset_ != opt_value) {
          this.verticalOffset_ = opt_value;
          this.invalidate(anychart.ConsistencyState.POSITION, anychart.Signal.NEEDS_REDRAW);
        }
      }
    } else {
      anychart.utils.warning(anychart.enums.WarningCode.DG_INCORRECT_METHOD_USAGE, null, ['verticalOffset', 'controller.verticalOffset']);
    }

    return this;
  }
  return this.verticalOffset_;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Tooltip.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter for tooltip settings.
 * @param {(Object|boolean|null)=} opt_value - Tooltip settings.
 * @return {!(anychart.core.ui.DataGrid|anychart.core.ui.Tooltip)} - Tooltip instance or self for method chaining.
 */
anychart.core.ui.DataGrid.prototype.tooltip = function(opt_value) {
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
anychart.core.ui.DataGrid.prototype.onTooltipSignal_ = function(event) {
  var tooltip = /** @type {anychart.core.ui.Tooltip} */(this.tooltip());
  tooltip.redraw();
};


/**
 * Draws cells depending on data.
 * @private
 */
anychart.core.ui.DataGrid.prototype.drawRowFills_ = function() {
  var initialTop = /** @type {number} */ (this.pixelBoundsCache_.top + this.titleHeight_ + anychart.core.ui.DataGrid.ROW_SPACE - this.verticalOffset_);
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
 * Gets column by index or creates a new one if column doesn't exist yet.
 * If works like setter, sets a column by index.
 * @param {(number|anychart.core.ui.DataGrid.Column)=} opt_indexOrValue - Column index or column.
 * @param {anychart.core.ui.DataGrid.Column=} opt_value - Column to be set.
 * @return {(anychart.core.ui.DataGrid.Column|anychart.core.ui.DataGrid)} - Column by index of itself for method chaining if used
 *  like setter.
 */
anychart.core.ui.DataGrid.prototype.column = function(opt_indexOrValue, opt_value) {
  var index, value;
  var newColumn = false;
  index = anychart.utils.toNumber(opt_indexOrValue);
  if (isNaN(index)) {
    index = 0;
    value = /** @type {Object} */ (opt_indexOrValue);
  } else {
    index = opt_indexOrValue;
    value = /** @type {Object} */ (opt_value);
  }

  var column = this.columns_[index];

  if (!column) {
    column = new anychart.core.ui.DataGrid.Column(this);
    this.registerDisposable(column);

    var columnWidth = index ?
        (index == 1 ? anychart.core.ui.DataGrid.NAME_COLUMN_WIDTH : anychart.core.ui.DataGrid.DEFAULT_COLUMN_WIDTH) :
        anychart.core.ui.DataGrid.NUMBER_COLUMN_WIDTH;

    var columnTitle = index ? (index == 1 ? 'Name' : ('Column #' + index)) : '#';

    column.suspendSignalsDispatching();
    column
        .container(this.getColumnsLayer_())
        .width(columnWidth)
        .height('100%');

    column.title().text(columnTitle);
    column.title().height(this.titleHeight_);
    column.title().width(columnWidth);

    var columnsCount = 0; //Calculating how many columns are currently visible.
    for (var i = 0, l = this.columns_.length; i < l; i++) {
      if (this.columns_[i] && this.columns_[i].enabled()) columnsCount++;
    }

    //columnsCount is actually a number of currently visible splitters as well.
    if (columnsCount - 1 == this.splitters_.length) { //We need (N-1) splitters for N columns.
      var newSplitter = new anychart.core.ui.Splitter();
      this.registerDisposable(newSplitter);

      newSplitter.container(this.getSplitterLayer_());
      newSplitter.listen(anychart.enums.EventType.SPLITTER_CHANGE, goog.bind(this.splitterChangedHandler_, this, columnsCount - 1));
      this.splitters_.push(newSplitter);
    }

    column.listenSignals(this.columnInvalidated_, this);
    column.resumeSignalsDispatching(true);
    this.columns_[index] = column;
    newColumn = true;
  }

  if (goog.isDef(value)) {
    column.setup(value);
    return this;
  } else {
    if (newColumn) this.invalidate(anychart.ConsistencyState.GRIDS | anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    return column;
  }

};


/**
 * Splitter change handler.
 * @param {number} splitterIndex - Index of splitter that has been moved.
 * @param {goog.events.Event} event - Event.
 * @private
 */
anychart.core.ui.DataGrid.prototype.splitterChangedHandler_ = function(splitterIndex, event) {
  var splitter = /** @type {anychart.core.ui.Splitter} */ (event['target']);
  var width = splitter.getLeftBounds().width + anychart.core.ui.DataGrid.MIN_COLUMN_WIDTH;
  this.forEachVisibleColumn_(this.resizeColumn_, this, splitterIndex, width);
};


/**
 * Sets new column width.
 * @param {anychart.core.ui.DataGrid.Column} column - Current visible column.
 * @param {number} columnIndex - Straight index of current visible column.
 * @param {number} splitterIndex
 * @param {number} width
 * @private
 */
anychart.core.ui.DataGrid.prototype.resizeColumn_ = function(column, columnIndex, splitterIndex, width) {
  if (splitterIndex == columnIndex) { //If splitter_index == column_index.
    column.width(width); //Sets new width.
  }
};


/**
 * Column invalidation handler.
 * @param {anychart.SignalEvent} event - Signal event.
 * @private
 */
anychart.core.ui.DataGrid.prototype.columnInvalidated_ = function(event) {
  var state = 0;
  var signal = anychart.Signal.NEEDS_REDRAW;

  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) state |= anychart.ConsistencyState.APPEARANCE;
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) state |= anychart.ConsistencyState.GRIDS;

  this.invalidate(state, signal);
};


/**
 * Draws data grid.
 * @return {anychart.core.ui.DataGrid}
 */
anychart.core.ui.DataGrid.prototype.draw = function() {
  if (this.isStandalone_) {
    if (!this.controller_) {
      this.controller_ = new anychart.core.gantt.Controller();
      this.registerDisposable(this.controller_);

      if (!this.pixelBoundsCache_) this.pixelBoundsCache_ = /** @type {acgraph.math.Rect} */ (this.getPixelBounds());

      this.controller_
          .data(this.data_)
          .verticalOffset(this.verticalOffset_)
          .availableHeight(this.pixelBoundsCache_.height - this.titleHeight_ - anychart.core.ui.DataGrid.ROW_SPACE)
          .dataGrid(this);

      if (isNaN(this.startIndex_) && isNaN(this.endIndex_)) this.startIndex_ = 0;
      if (!isNaN(this.startIndex_)) {
        this.controller_.startIndex(this.startIndex_);
      } else {
        this.controller_.endIndex(this.endIndex_);
      }

      this.controller_.listenSignals(this.needsReapplicationHandler_, this);
    }
    this.controller_.run();
  } else {
    anychart.utils.warning(anychart.enums.WarningCode.DG_INCORRECT_METHOD_USAGE, null, ['draw', 'controller.run']);
  }

  /*
    DEVELOPERS NOTE: if data grid is not standalone, calling this method will not take any effect.
    General idea is in fact that not standalone data grid is managed by controller. Any actions with data grid must be
    performed with controller.
    TODO (A.Kudryavtsev): Bad english.
   */
  return this;
};


/**
 * Draws visible items.
 * @param {Array.<anychart.data.Tree.DataItem>} visibleItems - Linear array of data items prepared to be displayed in data grid.
 * @param {number} startIndex - Start index of visible data items to be displayed in data grid.
 * @param {number} endIndex - End index of visible data items to be displayed in data grid.
 * @param {number} verticalOffset - Vertical offset.
 * @param {number} availableHeight - Available height.
 * @param {boolean=} opt_positionRecalculated - If there were changes and data grid must get invalidation state.
 * @return {anychart.core.ui.DataGrid} - Itself for method chaining.
 */
anychart.core.ui.DataGrid.prototype.drawInternal = function(visibleItems, startIndex, endIndex, verticalOffset, availableHeight, opt_positionRecalculated) {
  this.visibleItems_ = visibleItems;
  this.startIndex_ = startIndex;
  this.endIndex_ = endIndex;
  this.verticalOffset_ = verticalOffset;
  var drawRows = false;

  if (opt_positionRecalculated) this.invalidate(anychart.ConsistencyState.POSITION);

  if (this.checkDrawingNeeded()) {
    var left, top;

    var container = /** @type {acgraph.vector.ILayer} */(this.container());
    var stage = container ? container.getStage() : null;
    var manualSuspend = stage && !stage.isSuspended();
    if (manualSuspend) stage.suspend();

    //Ensure DOM structure is created.
    if (!this.getBase_().numChildren()) {
      this.bgRect_ = this.getBase_().rect();
      this.registerDisposable(this.bgRect_);
      this.bgRect_.fill(this.backgroundFill_).stroke(null);

      this.getBase_()
          .addChild(/** @type {!acgraph.vector.Layer} */ (this.getCellsLayer_()))
          .addChild(/** @type {!acgraph.vector.Layer} */ (this.getColumnsLayer_()))
          .addChild(/** @type {!acgraph.vector.Layer} */ (this.getSplitterLayer_()));
    }

    if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
      this.getBase_().parent(container);
      this.markConsistent(anychart.ConsistencyState.CONTAINER);
    }

    if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
      this.pixelBoundsCache_ = /** @type {acgraph.math.Rect} */ (this.getPixelBounds());
      this.getBase_().clip(/** @type {acgraph.math.Rect} */ (this.pixelBoundsCache_));
      this.bgRect_.setBounds(/** @type {acgraph.math.Rect} */ (this.pixelBoundsCache_));
      this.titleHeight_ = this.pixelBoundsCache_.height - availableHeight;
      this.invalidate(anychart.ConsistencyState.GRIDS);
      this.markConsistent(anychart.ConsistencyState.BOUNDS);
    }


    if (this.hasInvalidationState(anychart.ConsistencyState.GRIDS)) { //Actually redraws columns and their positions.
      var width;
      var color;
      if (this.cellBorder_) {
        if (goog.isString(this.cellBorder_)) {
          color = this.cellBorder_;
          width = 1;
        } else {
          if (goog.isDef(this.cellBorder_['thickness'])) width = this.cellBorder_['thickness'] || 1;
          color = this.cellBorder_['color'] || '#ccd7e1';
        }
      }

      left = this.pixelBoundsCache_.left;
      top = this.pixelBoundsCache_.top;

      var counter = -1;
      var totalWidth = 0;

      var lastColumnIndex = -2;
      for (var j = this.columns_.length - 1; j >= 0; j--) {
        var columnFromEnd = this.columns_[j];
        if (columnFromEnd && columnFromEnd.enabled()) {
          lastColumnIndex = j;
          break;
        }
      }

      for (var i = 0, l = this.columns_.length - 1; i < l; i++) {
        var col = this.columns_[i];
        if (col && (counter != lastColumnIndex)) {
          col.suspendSignalsDispatching();
          if (col.enabled()) {
            counter += 1;
            col.position({x: totalWidth, y: 0}); //Column width and height are already set here.
            col.height(this.pixelBoundsCache_.height);
            var colWidth = col.calculateBounds().width; //We need pixel value here.
            var splitter = this.splitters_[counter];

            var add = colWidth;

            if (splitter) { //Amount of splitters is (amountOfColumns - 1).
              splitter.suspendSignalsDispatching();

              splitter
                  .enabled(true)
                  .fill(color || '#ccd7e1');

              if (width) splitter.splitterWidth(width);

              var splitterWidth = splitter.splitterWidth();
              add += splitterWidth;
              var boundsWidth = add + this.pixelBoundsCache_.width;
              var splitterPos = (colWidth - anychart.core.ui.DataGrid.MIN_COLUMN_WIDTH) / (boundsWidth - splitterWidth);

              var splitterBounds = {
                left: (left + totalWidth + anychart.core.ui.DataGrid.MIN_COLUMN_WIDTH),
                top: top,
                width: boundsWidth,
                height: this.pixelBoundsCache_.height
              };

              splitter.bounds(splitterBounds)
                  .handlePositionChange(false)
                  .position(splitterPos);

              splitter.resumeSignalsDispatching(false);
              splitter.draw();
              splitter.handlePositionChange(true);
            }

            totalWidth += add;
          }
          col.resumeSignalsDispatching(false);
          col.draw();
        }
      }

      //TODO (A.Kudryavtsev): In current implementation (11 Nov 2014) we stretch last column to fit DG width.
      var lastColumn = this.columns_[lastColumnIndex];
      if (lastColumn) {
        var w = (totalWidth < this.pixelBoundsCache_.width - anychart.core.ui.DataGrid.MIN_COLUMN_WIDTH) ?
            (this.pixelBoundsCache_.width - totalWidth) :
            void 0; //Does not change current column's width.
        lastColumn.suspendSignalsDispatching();
        lastColumn.position({x: totalWidth, y: 0});
        lastColumn.width(w); //here we can't write lastColumn.width(w).height(h) because w can be undefined.
        lastColumn.height(this.pixelBoundsCache_.height);
        lastColumn.resumeSignalsDispatching(false);
        lastColumn.draw();
      }

      drawRows = true;

      while (++counter < this.splitters_.length) { //This disables all remaining splitters.
        if (!this.splitters_[counter].enabled()) break;
        this.splitters_[counter].enabled(false).draw();
      }

      this.markConsistent(anychart.ConsistencyState.GRIDS);
    }

    if (this.hasInvalidationState(anychart.ConsistencyState.POSITION)) { //Actually sets rows for each columns.
      this.tooltip().hide();

      var columnsWidth = 0;
      var splitWidth = this.splitters_[0] ? this.splitters_[0].splitterWidth() : 1;

      this.forEachVisibleColumn_(function(col) {
        columnsWidth += (col.calculateBounds().width + splitWidth);
        col.invalidate(anychart.ConsistencyState.POSITION); //Column takes data from own data grid.
        col.draw();
      });

      drawRows = true;
      this.markConsistent(anychart.ConsistencyState.POSITION);
    }

    if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) { //Actually redraws columns and their positions.
      this.bgRect_.fill(this.backgroundFill_);
      this.getOddPath_().fill(this.rowOddFill_ || this.rowFill_);
      this.getEvenPath_().fill(this.rowEvenFill_ || this.rowFill_);
      this.getSelectedPath_().fill(this.rowSelectedFill_);

      this.forEachVisibleColumn_(function(col) {
        col.invalidate(anychart.ConsistencyState.APPEARANCE);
        col.draw();
      });

      this.markConsistent(anychart.ConsistencyState.APPEARANCE);
    }

    if (this.hasInvalidationState(anychart.ConsistencyState.HOVER)) {
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
      this.markConsistent(anychart.ConsistencyState.HOVER);
    }

    if (this.hasInvalidationState(anychart.ConsistencyState.CLICK)) {
      drawRows = true;
      this.markConsistent(anychart.ConsistencyState.CLICK);
    }

    if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
      this.getBase_().zIndex(/** @type {number} */ (this.zIndex()));
      this.markConsistent(anychart.ConsistencyState.Z_INDEX);
    }

    if (drawRows) this.drawRowFills_();
    if (manualSuspend) stage.resume();
  }
  return this;
};


/** @inheritDoc */
anychart.core.ui.DataGrid.prototype.serialize = function() {
  var json;
  json = goog.base(this, 'serialize');
  json['columns'] = [];

  json['isStandalone'] = this.isStandalone_;
  json['startIndex'] = this.startIndex_; //We don't need to store this.endIndex_ here;
  json['verticalOffset'] = this.verticalOffset_;
  json['titleHeight'] = this.titleHeight_;
  json['backgroundFill'] = anychart.color.serialize(this.backgroundFill_);
  json['cellBorder'] = anychart.color.serialize(this.cellBorder_);
  json['rowOddFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill} */ (this.rowOddFill_));
  json['rowEvenFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill} */ (this.rowEvenFill_));
  json['rowFill'] = anychart.color.serialize(this.rowFill_);
  json['titleFill'] = anychart.color.serialize(this.titleFill_);

  for (var i = 0; i < this.columns_.length; i++) {
    var col = this.columns_[i] ? this.columns_[i].serialize() : void 0;
    json['columns'].push(col);
  }

  return json;
};


/** @inheritDoc */
anychart.core.ui.DataGrid.prototype.setupByJSON = function(json) {
  this.suspendSignalsDispatching();

  this.isStandalone_ = json['isStandalone'];
  this
      .startIndex(json['startIndex'])
      .verticalOffset(json['verticalOffset'])
      .titleHeight(json['titleHeight'])
      .backgroundFill(json['backgroundFill'])
      .cellBorder(json['cellBorder'])
      .rowOddFill(json['rowOddFill'])
      .rowEvenFill(json['rowEvenFill'])
      .rowFill(json['rowFill'])
      .titleFill(json['titleFill']);

  for (var i = 0; i < json['columns'].length; i++) {
    var col = json['columns'][i];
    if (col) this.column(i, col);
  }

  this.resumeSignalsDispatching(true);
  return goog.base(this, 'setupByJSON', json);
};



//----------------------------------------------------------------------------------------------------------------------
//
//  Data Grid Column.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Data grid column.
 * 1) Has own labels factory.
 * 2) Has own index in data grid.
 * 3) Has own clip bounds.
 * 4) Has title.
 * 5) Has vertical offset.
 *
 * @param {anychart.core.ui.DataGrid} dataGrid - Column's data grid.
 *
 * @constructor
 * @extends {anychart.core.VisualBase}
 */
anychart.core.ui.DataGrid.Column = function(dataGrid) {
  goog.base(this);

  /**
   * Data grid of column.
   * @type {anychart.core.ui.DataGrid}
   * @private
   */
  this.dataGrid_ = dataGrid;

  /**
   * Column's labels factory.
   * @type {anychart.core.ui.LabelsFactory}
   * @private
   */
  this.labelsFactory_ = null;

  /**
   * Base layer to be clipped.
   * @type {acgraph.vector.Layer}
   * @private
   */
  this.base_ = null;

  /**
   * Title layer.
   * @type {acgraph.vector.Layer}
   * @private
   */
  this.titleLayer_ = null;

  /**
   * Cells layer.
   * @type {acgraph.vector.Layer}
   * @private
   */
  this.cellsLayer_ = null;

  /**
   * Title.
   * @type {anychart.core.ui.Title}
   * @private
   */
  this.title_ = null;

  /**
   * Title path.
   * @type {acgraph.vector.Path}
   * @private
   */
  this.titlePath_ = null;

  /**
   * Clip bounds.
   * @type {anychart.math.Rect}
   * @private
   */
  this.clip_ = null;

  /**
   * Width of column.
   * @type {(string|number)}
   * @private
   */
  this.width_ = 0;

  /**
   * Height of column.
   * @type {(string|number)}
   * @private
   */
  this.height_ = 0;

  /**
   * Pixel bounds cache.
   * @type {anychart.math.Rect}
   * @private
   */
  this.pixelBoundsCache_ = null;

  /**
   * Function that returns a text value for the cell by data item.
   * @type {function(anychart.data.Tree.DataItem):string}
   * @private
   */
  this.textFormatter_ = this.defaultTextFormatter_;

  /**
   * Multiplier to choose a left padding in a cell depending on a tree data item's depth.
   * Used to highlight a hierarchy of data items.
   * Overall left padding will be calculated as anychart.core.ui.DataGrid.DEFAULT_PADDING + depthPaddingMultiplier_ * item.meta('depth');
   * @type {number}
   * @private
   */
  this.depthPaddingMultiplier_ = 0;

  /**
   * Flag if collapse/expand buttons must be used.
   * @type {boolean}
   * @private
   */
  this.useButtons_ = false;

  /**
   * Pool of collapse/expand buttons.
   * @type {Array.<anychart.core.ui.DataGrid.Button>}
   * @private
   */
  this.buttons_ = [];

  /**
   * Function that overrides text settings for label.
   * @type {function(anychart.core.ui.LabelsFactory.Label, anychart.data.Tree.DataItem)}
   * @private
   */
  this.cellTextSettingsOverrider_ = this.defaultCellTextSettingsOverrider_;


  /*
    Enabling/disabling column makes data grid redraw.
    When column is just created, we suppose it is enabled to avoid unnecessary data grid redraw.
   */
  this.markConsistent(anychart.ConsistencyState.ENABLED);

};
goog.inherits(anychart.core.ui.DataGrid.Column, anychart.core.VisualBase);


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.ui.DataGrid.Column.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.BOUNDS |
    anychart.ConsistencyState.TITLE |
    anychart.ConsistencyState.POSITION;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.ui.DataGrid.Column.prototype.SUPPORTED_SIGNALS = anychart.core.VisualBase.prototype.SUPPORTED_SIGNALS;


/**
 * Default function that returns a text value for the cell by data item.
 * @param {anychart.data.Tree.DataItem} treeDataItem - Incoming tree data item.
 * @return {string} - Text value.
 * @private
 */
anychart.core.ui.DataGrid.Column.prototype.defaultTextFormatter_ = function(treeDataItem) {
  return '';
};


/**
 * Gets/sets multiplier to choose a left padding in a cell depending on a tree data item's depth.
 * Used to highlight a hierarchy of data items.
 * Overall left padding will be calculated as anychart.core.ui.DataGrid.DEFAULT_PADDING + depthPaddingMultiplier_ * item.meta('depth');
 * @param {number=} opt_value - Value to be set.
 * @return {(number|anychart.core.ui.DataGrid.Column)} - Current value or itself for method chaining.
 */
anychart.core.ui.DataGrid.Column.prototype.depthPaddingMultiplier = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.depthPaddingMultiplier_ != opt_value) {
      this.depthPaddingMultiplier_ = opt_value;
      this.invalidate(anychart.ConsistencyState.POSITION, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.depthPaddingMultiplier_;
};


/**
 * Default cell text settings overrider.
 * @param {anychart.core.ui.LabelsFactory.Label} label - Incoming label.
 * @param {anychart.data.Tree.DataItem} treeDataItem - Incoming tree data item.
 * @private
 */
anychart.core.ui.DataGrid.Column.prototype.defaultCellTextSettingsOverrider_ = goog.nullFunction;


/**
 * Sets cell text value formatter.
 * @param {(function(anychart.data.Tree.DataItem):string)=} opt_value - Function to be set.
 * @return {(function(anychart.data.Tree.DataItem):string|anychart.core.ui.DataGrid.Column)} - Current function or itself
 *  for method chaining.
 */
anychart.core.ui.DataGrid.Column.prototype.textFormatter = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (goog.isFunction(opt_value)) {
      this.textFormatter_ = opt_value;
    } else {
      this.textFormatter_ = this.defaultTextFormatter_;
    }
    this.invalidate(anychart.ConsistencyState.POSITION, anychart.Signal.NEEDS_REDRAW);
    return this;
  }
  return this.textFormatter_;
};


/**
 * Gets/sets label factory to decorate cells.
 * @param {Object=} opt_value - Value to be set.
 * @return {(anychart.core.ui.DataGrid.Column|anychart.core.ui.LabelsFactory)} - Current value or itself for method chaining.
 */
anychart.core.ui.DataGrid.Column.prototype.cellTextSettings = function(opt_value) {
  if (!this.labelsFactory_) {
    this.labelsFactory_ = new anychart.core.ui.LabelsFactory();
    this.labelsFactory_
        .anchor(anychart.enums.Anchor.LEFT_TOP)
        .vAlign(acgraph.vector.Text.VAlign.MIDDLE)
        .padding(0, anychart.core.ui.DataGrid.DEFAULT_PADDING)
        .textWrap(acgraph.vector.Text.TextWrap.NO_WRAP)
        .container(this.getCellsLayer_());

    this.registerDisposable(this.labelsFactory_);
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
      //TODO (A.Kudryavtsev): WE invalidate position because labels factory work that way: must clear and redraw all labels.
      this.invalidate(anychart.ConsistencyState.POSITION, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.labelsFactory_;

};


/**
 * Gets/sets cells text settings overrider.
 * @param {Object=} opt_value - Value to be set.
 * @return {(anychart.core.ui.DataGrid.Column|function(anychart.core.ui.LabelsFactory.Label, anychart.data.Tree.DataItem))} - Current value or itself for method chaining.
 */
anychart.core.ui.DataGrid.Column.prototype.cellTextSettingsOverrider = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (goog.isFunction(opt_value)) {
      this.cellTextSettingsOverrider_ = opt_value;
    } else {
      this.cellTextSettingsOverrider_ = this.defaultCellTextSettingsOverrider_;
    }
    //TODO (A.Kudryavtsev): WE invalidate position because labels factory work that way: must clear and redraw all labels.
    this.invalidate(anychart.ConsistencyState.POSITION, anychart.Signal.NEEDS_REDRAW);
    return this;
  }
  return this.cellTextSettingsOverrider_;
};


/**
 * Gets/sets a flag if column must use expand/collapse buttons.
 * Do not export.
 * @param {boolean=} opt_value - Value to be set.
 * @return {(anychart.core.ui.DataGrid.Column|boolean)} - Current value or itself for method chaining.
 */
anychart.core.ui.DataGrid.Column.prototype.useButtons = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.useButtons_ != opt_value) {
      this.useButtons_ = opt_value;
      this.invalidate(anychart.ConsistencyState.POSITION, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.useButtons_;
};


/**
 * Gets/sets column title.
 * @param {(null|boolean|Object|string)=} opt_value - Value to be set.
 * @return {!(anychart.core.ui.Title|anychart.core.ui.DataGrid.Column)} - Current value or itself for method chaining.
 */
anychart.core.ui.DataGrid.Column.prototype.title = function(opt_value) {
  if (!this.title_) {
    this.title_ = new anychart.core.ui.Title();

    this.title_.suspendSignalsDispatching();
    this.title_
        .container(this.getTitleLayer_())
        .margin(0)
        .textWrap(acgraph.vector.Text.TextWrap.NO_WRAP)
        .hAlign(acgraph.vector.Text.HAlign.CENTER)
        .vAlign(acgraph.vector.Text.VAlign.MIDDLE);
    this.title_.resumeSignalsDispatching(false);

    this.title_.listenSignals(this.titleInvalidated_, this);

    this.registerDisposable(this.title_);
  }

  if (goog.isDef(opt_value)) {
    this.suspendSignalsDispatching();
    this.title_.setup(opt_value);
    this.title_.container(this.getTitleLayer_());
    this.resumeSignalsDispatching(true);
    return this;
  } else {
    return this.title_;
  }
};


/**
 * Internal title invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.ui.DataGrid.Column.prototype.titleInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.dataGrid_.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Inner getter for this.base_.
 * @return {acgraph.vector.Layer}
 * @private
 */
anychart.core.ui.DataGrid.Column.prototype.getBase_ = function() {
  if (!this.base_) {
    this.base_ = /** @type {acgraph.vector.Layer} */ (acgraph.layer());
    this.registerDisposable(this.base_);
  }
  return this.base_;
};


/**
 * Inner getter for this.titleLayer_.
 * @return {acgraph.vector.Layer}
 * @private
 */
anychart.core.ui.DataGrid.Column.prototype.getTitleLayer_ = function() {
  if (!this.titleLayer_) {
    this.titleLayer_ = /** @type {acgraph.vector.Layer} */ (acgraph.layer());
    this.registerDisposable(this.titleLayer_);
  }
  return this.titleLayer_;
};


/**
 * Getter for this.titlePath_.
 * @return {acgraph.vector.Path}
 * @private
 */
anychart.core.ui.DataGrid.Column.prototype.getTitlePath_ = function() {
  if (!this.titlePath_) {
    this.titlePath_ = acgraph.path();
    this.getTitleLayer_().addChildAt(this.titlePath_, 0);
    this.titlePath_.fill(/** @type {acgraph.vector.Fill} */ (this.dataGrid_.titleFill())).stroke(null);
    this.registerDisposable(this.titlePath_);
  }
  return this.titlePath_;
};


/**
 * Gets/sets position.
 * @param {anychart.math.Coordinate=} opt_value - Value to be set.
 * @return {(anychart.math.Coordinate|anychart.core.ui.DataGrid.Column)} - Current value or itself for method chaining.
 */
anychart.core.ui.DataGrid.Column.prototype.position = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (!this.position_ || this.position_.x != opt_value.x || this.position_.y != opt_value.y) {
      this.position_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.position_;
  }
};


/**
 * Button width.
 * @param {(number|string)=} opt_value Width value.
 * @return {(number|string|anychart.core.ui.DataGrid.Column)} - Width or itself for method chaining.
 */
anychart.core.ui.DataGrid.Column.prototype.width = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.width_ != opt_value) {
      this.width_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.width_;
};


/**
 * Button height.
 * @param {(number|string)=} opt_value Height value.
 * @return {(number|string|anychart.core.ui.DataGrid.Column)} - Height or itself for method chaining.
 */
anychart.core.ui.DataGrid.Column.prototype.height = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.height_ != opt_value) {
      this.height_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.height_;
};


/**
 * Inner getter for this.cellsLayer_.
 * @return {acgraph.vector.Layer}
 * @private
 */
anychart.core.ui.DataGrid.Column.prototype.getCellsLayer_ = function() {
  if (!this.cellsLayer_) {
    this.cellsLayer_ = /** @type {acgraph.vector.Layer} */ (acgraph.layer());
    this.registerDisposable(this.cellsLayer_);
  }
  return this.cellsLayer_;
};


/** @inheritDoc */
anychart.core.ui.DataGrid.Column.prototype.remove = function() {
  if (this.base_) this.base_.parent(null);
  this.dataGrid_.invalidate(anychart.ConsistencyState.GRIDS, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Initializes mouse wheel scrolling and mouse drag scrolling.
 * TODO (A.Kudryavtsev): In current implementation (04 Dec 2014) mouse drag scrolling is not available.
 */
anychart.core.ui.DataGrid.prototype.initMouseFeatures = function() {
  var mwh = new goog.events.MouseWheelHandler(this.getBase_().domElement());
  var mouseWheelEvent = goog.events.MouseWheelHandler.EventType.MOUSEWHEEL;
  goog.events.listen(mwh, mouseWheelEvent, this.mouseWheelHandler_, false, this);
  var ths = this;

  goog.events.listen(window, 'unload', function(e) {
    goog.events.unlisten(mwh, mouseWheelEvent, ths.mouseWheelHandler_, false, this);
  });
};


/**
 * Mouse wheel default handler.
 * @param {goog.events.MouseWheelEvent} e - Mouse wheel event.
 * @private
 */
anychart.core.ui.DataGrid.prototype.mouseWheelHandler_ = function(e) {
  this.scroll(e.deltaX, e.deltaY);
  e.preventDefault();
};


/**
 * Performs scroll to pixel offsets.
 * TODO (A.Kudryavtsev): In current implementation (04 Dec 2014) horizontal scrolling of data grid is not available.
 *
 * @param {number} horizontalPixelOffset - Horizontal pixel offset.
 * @param {number} verticalPixelOffset - Vertical pixel offset.
 */
anychart.core.ui.DataGrid.prototype.scroll = function(horizontalPixelOffset, verticalPixelOffset) {
  anychart.core.Base.suspendSignalsDispatching(this, this.controller_);

  var heightCache = this.controller_.getHeightCache();
  var totalVerticalStartOffset = this.startIndex_ ? heightCache[this.startIndex_ - 1] : 0;
  totalVerticalStartOffset += (this.verticalOffset_ + verticalPixelOffset);
  this.controller_.scrollTo(totalVerticalStartOffset);

  anychart.core.Base.resumeSignalsDispatchingTrue(this, this.controller_);
};


/**
 * Calculates actual column bounds.
 * @return {anychart.math.Rect}
 */
anychart.core.ui.DataGrid.Column.prototype.calculateBounds = function() {
  var parentBounds = this.dataGrid_.getPixelBounds();
  var width = anychart.utils.normalizeSize(this.width_ || 0, parentBounds.width);
  width = Math.max(anychart.core.ui.DataGrid.MIN_COLUMN_WIDTH, width);
  var height = anychart.utils.normalizeSize(this.height_ || 0, parentBounds.height);
  var position = anychart.math.normalizeCoordinate(this.position_);

  return new anychart.math.Rect(
      (parentBounds.left + position.x),
      (parentBounds.top + position.y),
      width,
      height
  );
};


/**
 * Draws data grid column.
 * @return {anychart.core.ui.DataGrid.Column} - Itself for method chaining.
 */
anychart.core.ui.DataGrid.Column.prototype.draw = function() {
  if (this.checkDrawingNeeded()) { //We have to control enabled state manually.
    var container = /** @type {acgraph.vector.ILayer} */(this.container());
    var stage = container ? container.getStage() : null;
    var manualSuspend = stage && !stage.isSuspended();
    if (manualSuspend) stage.suspend();

    //Ensure DOM structure is created.
    if (!this.getBase_().numChildren()) {
      this.getBase_()
          .addChild(/** @type {!acgraph.vector.Layer} */ (this.getCellsLayer_()))
          .addChild(/** @type {!acgraph.vector.Layer} */ (this.getTitleLayer_()));
    }

    if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
      this.getBase_().parent(container);
      this.markConsistent(anychart.ConsistencyState.CONTAINER);
    }

    if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
      this.pixelBoundsCache_ = this.calculateBounds();
      this.getBase_().clip(this.pixelBoundsCache_);

      /*
        TODO (A.Kudryavtsev):
        NOTE: Here I can't just say "Hey labelFactory, set new X and Y coordinate to all labels without clearing it before
        new data passage".
        In current implementation of labelsFactory we have to clear labels and add it again in new data passage.
        That's why we invalidate anychart.ConsistencyState.POSITION here.
       */
      this.invalidate(anychart.ConsistencyState.POSITION);

      this.markConsistent(anychart.ConsistencyState.BOUNDS);
    }

    if (this.hasInvalidationState(anychart.ConsistencyState.POSITION)) {
      var titleHeight = /** @type {number} */ (this.dataGrid_.titleHeight());

      this.getTitlePath_()
          .clear()
          .moveTo(this.pixelBoundsCache_.left, this.pixelBoundsCache_.top)
          .lineTo(this.pixelBoundsCache_.left + this.pixelBoundsCache_.width, this.pixelBoundsCache_.top)
          .lineTo(this.pixelBoundsCache_.left + this.pixelBoundsCache_.width, this.pixelBoundsCache_.top + titleHeight)
          .lineTo(this.pixelBoundsCache_.left, this.pixelBoundsCache_.top + titleHeight)
          .close();

      this.title_.parentBounds(this.pixelBoundsCache_);
      this.title_.height(titleHeight);
      this.title_.width(this.pixelBoundsCache_.width);
      this.invalidate(anychart.ConsistencyState.TITLE);

      var data = this.dataGrid_.getVisibleItems();
      var startIndex = this.dataGrid_.startIndex();
      var endIndex = this.dataGrid_.endIndex();
      var verticalOffset = this.dataGrid_.verticalOffset();

      var totalTop = this.pixelBoundsCache_.top + titleHeight + anychart.core.ui.DataGrid.ROW_SPACE - verticalOffset;

      this.cellTextSettings().suspendSignalsDispatching();
      this.cellTextSettings().clear();

      var paddingLeft = anychart.utils.normalizeSize(/** @type {number|string} */ (this.cellTextSettings().padding().left()),
          this.pixelBoundsCache_.width);
      var paddingRight = anychart.utils.normalizeSize(/** @type {(number|string)} */ (this.cellTextSettings().padding().right()),
          this.pixelBoundsCache_.width);
      var paddingTop = anychart.utils.normalizeSize(/** @type {(number|string)} */ (this.cellTextSettings().padding().top()),
          this.pixelBoundsCache_.height);
      var paddingBottom = anychart.utils.normalizeSize(/** @type {(number|string)} */ (this.cellTextSettings().padding().bottom()),
          this.pixelBoundsCache_.height);

      var counter = -1;
      for (var i = startIndex; i <= endIndex; i++) {
        var item = data[i];
        if (!item) break;

        var height = anychart.core.gantt.Controller.getItemHeight(item);
        var depth = item.meta('depth') || 0;
        var padding = paddingLeft + this.depthPaddingMultiplier_ * /** @type {number} */ (depth);
        var addButton = 0;
        var newButton = false;

        if (this.useButtons_ && item.numChildren()) {
          counter++;
          addButton = anychart.core.ui.DataGrid.DEFAULT_EXPAND_COLLAPSE_BUTTON_SIDE + anychart.core.ui.DataGrid.DEFAULT_PADDING;
          var button = this.buttons_[counter];
          if (!button) {
            button = new anychart.core.ui.DataGrid.Button(this.dataGrid_);
            this.buttons_.push(button);
            button.container(this.getCellsLayer_());
            newButton = true;
          }

          button.suspendSignalsDispatching();

          var top = totalTop + ((height - anychart.core.ui.DataGrid.DEFAULT_EXPAND_COLLAPSE_BUTTON_SIDE) / 2);

          button
              .enabled(true)
              .collapsed(!!item.meta('collapsed'))
              .dataItemIndex(i)
              .parentBounds(this.pixelBoundsCache_)
              .position({'x': Math.floor(this.pixelBoundsCache_.left + padding) + .5, 'y': Math.floor(top) + 0.5});

          button.resumeSignalsDispatching(false);
          button.draw();

          /*
            TODO (A.Kudryavtsev): Explanation.
            In current implementation of ui.Button (2 Feb 2015) here are some troubles in click events.
            In this case we can't stop propagation on button click.
            Here I implement my own button click to stop event propagation and make data grid row click work correctly.
           */
          if (newButton) {
            acgraph.events.listen(button.backgroundPath, acgraph.events.EventType.CLICK, function(e) {
              e.stopPropagation();
              this.switchState();
            }, false, button);
          }

        }

        var newTop = totalTop + height;

        var label = this.cellTextSettings().add({'value': this.textFormatter_(item)},
            {'value': {'x': this.pixelBoundsCache_.left, 'y': totalTop}});

        label.suspendSignalsDispatching();

        label.height(height);
        label.width(this.pixelBoundsCache_.width);
        label.padding(paddingTop, paddingRight, paddingBottom, padding + addButton);

        this.cellTextSettingsOverrider_(label, item);
        label.resumeSignalsDispatching(false);

        totalTop = (newTop + anychart.core.ui.DataGrid.ROW_SPACE);
      }

      while (++counter < this.buttons_.length && this.useButtons_) { //This disables all remaining buttons.
        if (!this.buttons_[counter].enabled()) break;
        this.buttons_[counter].enabled(false).draw();
      }

      this.cellTextSettings().resumeSignalsDispatching(false);
      this.cellTextSettings().draw();
      this.markConsistent(anychart.ConsistencyState.POSITION);
    }

    if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
      this.getTitlePath_().fill(/** @type {acgraph.vector.Fill} */ (this.dataGrid_.titleFill()));
      this.invalidate(anychart.ConsistencyState.TITLE);
      this.markConsistent(anychart.ConsistencyState.APPEARANCE);
    }

    if (this.hasInvalidationState(anychart.ConsistencyState.TITLE)) {
      this.title_.draw();
      this.markConsistent(anychart.ConsistencyState.TITLE);
    }

    if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
      this.getBase_().zIndex(/** @type {number} */ (this.zIndex()));
      this.markConsistent(anychart.ConsistencyState.Z_INDEX);
    }

    if (manualSuspend) stage.resume();
  }
  return this;
};


/** @inheritDoc */
anychart.core.ui.DataGrid.Column.prototype.serialize = function() {
  var json;
  json = goog.base(this, 'serialize');

  json['width'] = this.width_;
  json['height'] = this.height_;
  json['useButtons'] = this.useButtons_;
  json['depthPaddingMultiplier'] = this.depthPaddingMultiplier_;
  json['labelsFactory'] = this.labelsFactory_.serialize();
  json['title'] = this.title_.serialize();

  return json;
};


/** @inheritDoc */
anychart.core.ui.DataGrid.Column.prototype.setupByJSON = function(json) {
  this.suspendSignalsDispatching();

  this
      .width(json['width'])
      .height(json['height'])
      .useButtons(json['useButtons'])
      .depthPaddingMultiplier(json['depthPaddingMultiplier'])
      .cellTextSettings(json['labelsFactory'])
      .title(json['title']);

  this.resumeSignalsDispatching(true);
  return goog.base(this, 'setupByJSON', json);
};



//----------------------------------------------------------------------------------------------------------------------
//
//  Data Grid Collapse-Expand Button.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Collapse-expand button customization.
 * @param {anychart.core.ui.DataGrid} dataGrid - Parent data grid.
 * @constructor
 * @extends {anychart.core.ui.Button}
 */
anychart.core.ui.DataGrid.Button = function(dataGrid) {
  goog.base(this);

  /**
   * Own data grid.
   * @type {anychart.core.ui.DataGrid}
   * @private
   */
  this.dataGrid_ = dataGrid;

  /**
   * Flag if button is in collapsed state.
   * @type {boolean}
   * @private
   */
  this.collapsed_ = false;

  /**
   * Index of data item to be expanded/collapsed.
   * @type {number}
   * @private
   */
  this.dataItemIndex_ = -1;

  this.suspendSignalsDispatching();
  this
      .width(anychart.core.ui.DataGrid.DEFAULT_EXPAND_COLLAPSE_BUTTON_SIDE)
      .height(anychart.core.ui.DataGrid.DEFAULT_EXPAND_COLLAPSE_BUTTON_SIDE)
      .hAlign('center')
      .vAlign('middle')
      .supportedStates(anychart.core.ui.Button.State.CHECKED, false);

  this.text('-');
  this.resumeSignalsDispatching(false);

  //Listens itself to process 'hover' and 'press' button decorations correctly.
  this.listenSignals(function() {
    this.draw();
  });

};
goog.inherits(anychart.core.ui.DataGrid.Button, anychart.core.ui.Button);


/**
 * Gets/sets state of button.
 * @param {boolean=} opt_value - Value to be set.
 * @return {(anychart.core.ui.DataGrid.Button|boolean)} - Current value or itself for method chaining.
 */
anychart.core.ui.DataGrid.Button.prototype.collapsed = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.collapsed_ != opt_value) {
      this.collapsed_ = opt_value;
      this.text(this.collapsed_ ? '+' : '-');
    }
    return this;
  }
  return this.collapsed_;
};


/**
 * Gets/sets data item index.
 * @param {number=} opt_value - Value to be set.
 * @return {(anychart.core.ui.DataGrid.Button|number)} - Current value or itself for method chaining.
 */
anychart.core.ui.DataGrid.Button.prototype.dataItemIndex = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.dataItemIndex_ = opt_value;
    return this;
  }
  return this.dataItemIndex_;
};


/**
 * Switches button state on button click.
 */
anychart.core.ui.DataGrid.Button.prototype.switchState = function() {
  this.collapsed(!this.collapsed());
  this.dataGrid_.collapseExpandItem(this.dataItemIndex_, this.collapsed_);
};


//exports
anychart.core.ui.DataGrid.prototype['cellBorder'] = anychart.core.ui.DataGrid.prototype.cellBorder;
anychart.core.ui.DataGrid.prototype['cellFill'] = anychart.core.ui.DataGrid.prototype.cellFill; //deprecated
anychart.core.ui.DataGrid.prototype['cellEvenFill'] = anychart.core.ui.DataGrid.prototype.cellEvenFill; //deprecated
anychart.core.ui.DataGrid.prototype['cellOddFill'] = anychart.core.ui.DataGrid.prototype.cellOddFill; //deprecated
anychart.core.ui.DataGrid.prototype['rowFill'] = anychart.core.ui.DataGrid.prototype.rowFill;
anychart.core.ui.DataGrid.prototype['rowEvenFill'] = anychart.core.ui.DataGrid.prototype.rowEvenFill;
anychart.core.ui.DataGrid.prototype['rowOddFill'] = anychart.core.ui.DataGrid.prototype.rowOddFill;
anychart.core.ui.DataGrid.prototype['rowHoverFill'] = anychart.core.ui.DataGrid.prototype.rowHoverFill;

anychart.core.ui.DataGrid.prototype['backgroundFill'] = anychart.core.ui.DataGrid.prototype.backgroundFill;
anychart.core.ui.DataGrid.prototype['titleHeight'] = anychart.core.ui.DataGrid.prototype.titleHeight;
anychart.core.ui.DataGrid.prototype['column'] = anychart.core.ui.DataGrid.prototype.column;
anychart.core.ui.DataGrid.prototype['data'] = anychart.core.ui.DataGrid.prototype.data;
anychart.core.ui.DataGrid.prototype['startIndex'] = anychart.core.ui.DataGrid.prototype.startIndex;
anychart.core.ui.DataGrid.prototype['endIndex'] = anychart.core.ui.DataGrid.prototype.endIndex;
anychart.core.ui.DataGrid.prototype['getVisibleItems'] = anychart.core.ui.DataGrid.prototype.getVisibleItems;
anychart.core.ui.DataGrid.prototype['verticalOffset'] = anychart.core.ui.DataGrid.prototype.verticalOffset;
anychart.core.ui.DataGrid.prototype['tooltip'] = anychart.core.ui.DataGrid.prototype.tooltip;
anychart.core.ui.DataGrid.prototype['draw'] = anychart.core.ui.DataGrid.prototype.draw;

anychart.core.ui.DataGrid.Column.prototype['title'] = anychart.core.ui.DataGrid.Column.prototype.title;
anychart.core.ui.DataGrid.Column.prototype['width'] = anychart.core.ui.DataGrid.Column.prototype.width;
anychart.core.ui.DataGrid.Column.prototype['enabled'] = anychart.core.ui.DataGrid.Column.prototype.enabled;
anychart.core.ui.DataGrid.Column.prototype['textFormatter'] = anychart.core.ui.DataGrid.Column.prototype.textFormatter;
anychart.core.ui.DataGrid.Column.prototype['cellTextSettings'] = anychart.core.ui.DataGrid.Column.prototype.cellTextSettings;
anychart.core.ui.DataGrid.Column.prototype['cellTextSettingsOverrider'] = anychart.core.ui.DataGrid.Column.prototype.cellTextSettingsOverrider;
anychart.core.ui.DataGrid.Column.prototype['draw'] = anychart.core.ui.DataGrid.Column.prototype.draw;

