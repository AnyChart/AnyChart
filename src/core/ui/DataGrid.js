goog.provide('anychart.core.ui.DataGrid');

goog.require('acgraph');
goog.require('anychart.core.VisualBaseWithBounds');
goog.require('anychart.core.gantt.Controller');
goog.require('anychart.core.ui.Button');
goog.require('anychart.core.ui.LabelsFactory');
goog.require('anychart.core.ui.ScrollBar');
goog.require('anychart.core.ui.Splitter');
goog.require('anychart.core.ui.Tooltip');
goog.require('anychart.data.Tree');
goog.require('anychart.math.Rect');
goog.require('anychart.utils');

goog.require('goog.date.UtcDateTime');
goog.require('goog.events');
goog.require('goog.events.MouseWheelHandler');
goog.require('goog.i18n.DateTimeFormat');
goog.require('goog.object');



/**
 * Data grid implementation.
 * @constructor
 * @extends {anychart.core.VisualBaseWithBounds}
 */
anychart.core.ui.DataGrid = function() {
  goog.base(this);

  /**
   * Mouse wheel handler object.
   * @type {goog.events.MouseWheelHandler}
   * @private
   */
  this.mwh_ = null;


  /**
   * Interactivity handler.
   * An object that has own methods
   *  - rowClick
   *  - rowDblClick
   *  - rowMouseMove
   *  - rowMouseOver
   *  - rowMouseOut
   *  - rowMouseDown
   *  - rowMouseUp
   *  - rowSelect
   *
   * By default we should not dispatch some event directly: we use this interactivity handler to provide an ability
   * for user to prevent default event or stop propagation.
   *
   * For standalone case, data grid dispatches events itself. Otherwise, interactivity handler should be some higher
   * essence like gantt chart or something else.
   *
   * @type {Object}
   * @private
   */
  this.interactivityHandler_ = this;

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
   * Horizontal scroll bar.
   * @type {anychart.core.ui.ScrollBar}
   * @private
   */
  this.horizontalScrollBar_ = null;

  /**
   * Title height. Defined by timeline's header height.
   * @type {number}
   * @private
   */
  this.titleHeight_ = NaN;

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
   * Horizontal offset of data grid.
   * Used to perform horizontal scrolling of DG.
   * @type {number}
   * @private
   */
  this.horizontalOffset_ = 0;

  /**
   * Sum of widths of columns and their splitters.
   * @type {number}
   * @private
   */
  this.totalColumnsWidth_ = 0;

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
   * Invisible background rect to handle mouse wheel when visible bg id disabled.
   * @type {acgraph.vector.Rect}
   * @private
   */
  this.mwhRect_ = null;

  /**
   * Data grid bg.
   * @type {acgraph.vector.Fill}
   * @private
   */
  this.backgroundFill_;

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
  this.columnStroke_;

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
   * @private
   */
  this.rowStrokeThickness_ = NaN;

  /**
   * Row stroke path.
   * @type {acgraph.vector.Path}
   * @private
   */
  this.rowStrokePath_ = null;

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
   * Default title fill.
   * @type {acgraph.vector.Fill}
   * @private
   */
  this.titleFill_;

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
   * Column formats cache.
   * @type {Object}
   * @private
   */
  this.formatsCache_ = {};

  /**
   * Data grid tooltip.
   * @type {anychart.core.ui.Tooltip}
   * @private
   */
  this.tooltip_ = null;

  //this.column(0).textFormatter(function(item) {
  //  return goog.isDefAndNotNull(item.meta('index')) ? (item.meta('index') + 1) + '' : '';
  //});
  //
  //this
  //    .column(1)
  //    .collapseExpandButtons(true)
  //    .textFormatter(function(item) {
  //      return goog.isDefAndNotNull(item.get('name')) ? item.get('name') + '' : '';
  //    })
  //    .depthPaddingMultiplier(3 * anychart.core.ui.DataGrid.DEFAULT_PADDING);

  //var tooltip = /** @type {anychart.core.ui.Tooltip} */(this.tooltip());
  //tooltip.suspendSignalsDispatching();
  //tooltip.anchor(anychart.enums.Anchor.LEFT_TOP);
  //tooltip.content().hAlign(anychart.enums.Align.LEFT);
  //tooltip.contentFormatter(function(data) {
  //  return data.get(anychart.enums.GanttDataFields.NAME) + '';
  //});
  //tooltip.resumeSignalsDispatching(false);

  this.bindHandlersToComponent(this, this.handleMouseOverAndMove_, this.handleMouseOut_, this.handleMouseClick_,
      this.handleMouseOverAndMove_, this.handleAll_);

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
    anychart.ConsistencyState.DATA_GRID_GRIDS |
    anychart.ConsistencyState.DATA_GRID_POSITION |
    anychart.ConsistencyState.DATA_GRID_HOVER |
    anychart.ConsistencyState.DATA_GRID_CLICK;


/**
 * @typedef {{
 *  formatter: function(*): string,
 *  textStyle: Object,
 *  width: number
 * }}
 */
anychart.core.ui.DataGrid.ColumnFormat;


/**
 * Default cell height.
 * @type {number}
 */
anychart.core.ui.DataGrid.DEFAULT_ROW_HEIGHT = 20;


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
anychart.core.ui.DataGrid.NUMBER_COLUMN_WIDTH = 50;


/**
 * By default, second column of data grid is widest, contains expand/collapse button and some text that determines general
 * row information (name by default).
 * Has a longest default width.
 * @type {number}
 */
anychart.core.ui.DataGrid.NAME_COLUMN_WIDTH = 170;


/**
 * Default width of all other columns.
 * @type {number}
 */
anychart.core.ui.DataGrid.DEFAULT_COLUMN_WIDTH = 90;


/**
 * Gets column format by name.
 * NOTE: Presets don't contain 'textStyle' field because default text settings are in use.
 * @param {anychart.enums.ColumnFormats} formatName - Format to be created.
 * @return {anychart.core.ui.DataGrid.ColumnFormat} - Related format.
 */
anychart.core.ui.DataGrid.prototype.getColumnFormatByName = function(formatName) {
  if (!this.formatsCache_[formatName]) {
    switch (formatName) {
      case anychart.enums.ColumnFormats.DIRECT_NUMBERING:
        this.formatsCache_[formatName] = {
          'formatter': this.formatterAsIs_,
          'width': anychart.core.ui.DataGrid.NUMBER_COLUMN_WIDTH
        };
        break;

      case anychart.enums.ColumnFormats.TEXT:
        this.formatsCache_[formatName] = {
          'formatter': this.formatterAsIs_,
          'width': anychart.core.ui.DataGrid.NAME_COLUMN_WIDTH
        };
        break;

      case anychart.enums.ColumnFormats.FINANCIAL:
        this.formatsCache_[formatName] = {
          'formatter': this.formatterFinancial_,
          'textStyle': {'hAlign': 'right'},
          'width': anychart.core.ui.DataGrid.DEFAULT_COLUMN_WIDTH
        };
        break;

      case anychart.enums.ColumnFormats.PERCENT:
        this.formatsCache_[formatName] = {
          'formatter': this.formatterPercent_,
          'textStyle': {'hAlign': 'right'},
          'width': anychart.core.ui.DataGrid.NUMBER_COLUMN_WIDTH
        };
        break;

      case anychart.enums.ColumnFormats.DATE_COMMON_LOG:
        this.formatsCache_[formatName] = {
          'formatter': this.createDateTimeFormatter_('dd/MMM/yyyy'),
          'textStyle': {'hAlign': 'right'},
          'width': anychart.core.ui.DataGrid.DEFAULT_COLUMN_WIDTH
        };
        break;

      case anychart.enums.ColumnFormats.DATE_ISO_8601:
        this.formatsCache_[formatName] = {
          'formatter': this.createDateTimeFormatter_('yyyy-MM-dd'),
          'textStyle': {'hAlign': 'right'},
          'width': anychart.core.ui.DataGrid.DEFAULT_COLUMN_WIDTH
        };
        break;

      case anychart.enums.ColumnFormats.DATE_US_SHORT:
        this.formatsCache_[formatName] = {
          'formatter': this.createDateTimeFormatter_('M/dd/yyyy'),
          'textStyle': {'hAlign': 'right'},
          'width': anychart.core.ui.DataGrid.DEFAULT_COLUMN_WIDTH
        };
        break;

      case anychart.enums.ColumnFormats.DATE_DMY_DOTS:
        this.formatsCache_[formatName] = {
          'formatter': this.createDateTimeFormatter_('dd.MM.yy'),
          'textStyle': {'hAlign': 'right'},
          'width': anychart.core.ui.DataGrid.DEFAULT_COLUMN_WIDTH
        };
        break;

      case anychart.enums.ColumnFormats.SHORT_TEXT:
      default:
        this.formatsCache_[formatName] = {
          'formatter': this.formatterAsIs_,
          'width': anychart.core.ui.DataGrid.DEFAULT_COLUMN_WIDTH
        };
        break;
    }
  }

  return this.formatsCache_[formatName];
};


/**
 * Formatter for column formats.
 * @param {*} val - Incoming value.
 * @return {string} - Value turned to string as is.
 * @private
 */
anychart.core.ui.DataGrid.prototype.formatterAsIs_ = function(val) {
  return goog.isDef(val) ? (val + '') : '';
};


/**
 * Financial formatter for column formats.
 * @param {*} val - Incoming value. If value is non number, it will be returned as is in string representation.
 * @return {string} - Value turned to string like '15,024,042.00'.
 * @private
 */
anychart.core.ui.DataGrid.prototype.formatterFinancial_ = function(val) {
  return goog.isDef(val) ? (goog.isNumber(val) ? val.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,') : val + '') : '';
};


/**
 * Percent formatter for column formats.
 * @param {*} val - Incoming value. If value is non number, it will be returned as is in string representation.
 * @return {string} - Value turned to string like '15,024,042.00'.
 * @private
 */
anychart.core.ui.DataGrid.prototype.formatterPercent_ = function(val) {
  if (goog.isNumber(val)) { //Here we suppose we've got a number like 0.1245 that literally means '12.45%'
    return anychart.math.round(100 * val, 2) + '%';
  } else {
    return /** @type {string} */ (goog.isDef(val) ? (anychart.utils.isPercent(val) ? val : val + '%') : '');
  }
};


/**
 * Creates date time formatter by pattern.
 * @param {string} pattern - Date time format pattern.
 * @return {function(*):string} - Formatter function.
 * @private
 */
anychart.core.ui.DataGrid.prototype.createDateTimeFormatter_ = function(pattern) {
  return function(value) {
    if (goog.isNumber(value)) {
      var dateTimeFormat = new goog.i18n.DateTimeFormat(pattern);
      return dateTimeFormat.format(new goog.date.UtcDateTime(new Date(value)));
    } else {
      return goog.isDef(value) ? (value + '') : '';
    }
  }
};


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
 * Getter/setter for default column settings.
 * @param {Object=} opt_val - Object with settings.
 * @return {Object} - Current value or empty object.
 */
anychart.core.ui.DataGrid.prototype.defaultColumnSettings = function(opt_val) {
  if (goog.isDef(opt_val)) {
    this.defaultColumnSettings_ = opt_val;
    return this;
  }
  return this.defaultColumnSettings_ || {};
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
        this.controller_.availableHeight(this.pixelBoundsCache_.height - opt_value - 1);
      } else {
        if (this.titleHeight_ != opt_value) {
          this.titleHeight_ = opt_value;
          this.invalidate(anychart.ConsistencyState.DATA_GRID_POSITION, anychart.Signal.NEEDS_REDRAW);
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


//----------------------------------------------------------------------------------------------------------------------
//
//  Interactivity.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Gets/sets current interactivity handler (see field description).
 * @param {Object=} opt_value - Value to be set.
 * @return {(Object|anychart.core.ui.DataGrid)} - Current value or itself for method chaining.
 */
anychart.core.ui.DataGrid.prototype.interactivityHandler = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.interactivityHandler_ = opt_value;
    return this;
  }
  return this.interactivityHandler_;
};


/**
 * Mouse click internal handler.
 * @param {anychart.core.MouseEvent} event - Event object.
 * @private
 */
anychart.core.ui.DataGrid.prototype.handleMouseClick_ = function(event) {
  var click = this.getInteractivityEvent_(event);
  if (click) {
    var mouseUp = goog.object.clone(click);
    mouseUp['type'] = anychart.enums.EventType.ROW_MOUSE_UP;
    var upDispatched = this.interactivityHandler_.dispatchEvent(mouseUp);
    var clickDispatched = this.interactivityHandler_.dispatchEvent(click);
    if (upDispatched && clickDispatched) this.interactivityHandler_.rowClick(click);
  } else {
    this.interactivityHandler_.unselect();
  }

};


/**
 * Mouse over and move internal handler.
 * @param {anychart.core.MouseEvent} event - Event object.
 * @private
 */
anychart.core.ui.DataGrid.prototype.handleMouseOverAndMove_ = function(event) {
  var evt = this.getInteractivityEvent_(event);
  if (evt && this.interactivityHandler_.dispatchEvent(evt)) {
    this.interactivityHandler_.rowMouseMove(evt);
  }
};


/**
 * "All" internal handler.
 * @param {anychart.core.MouseEvent} event - Event object.
 * @private
 */
anychart.core.ui.DataGrid.prototype.handleAll_ = function(event) {
  if (event['type'] == acgraph.events.EventType.DBLCLICK) this.handleDblMouseClick_(event);
};


/**
 * Mouse double click internal handler.
 * @param {anychart.core.MouseEvent} event - Event object.
 * @private
 */
anychart.core.ui.DataGrid.prototype.handleDblMouseClick_ = function(event) {
  var evt = this.getInteractivityEvent_(event);
  if (evt && this.interactivityHandler_.dispatchEvent(evt)) {
    this.interactivityHandler_.rowDblClick(evt);
  }
};


/**
 * Mouse out internal handler.
 * @param {anychart.core.MouseEvent} event - Event object.
 * @private
 */
anychart.core.ui.DataGrid.prototype.handleMouseOut_ = function(event) {
  var evt = this.getInteractivityEvent_(event);
  if (evt && this.interactivityHandler_.dispatchEvent(evt)) {
    this.interactivityHandler_.rowMouseOut(evt);
  }
};


/**
 * Mouse down internal handler.
 * @param {anychart.core.MouseEvent} event - Event object.
 * @private
 */
anychart.core.ui.DataGrid.prototype.handleMouseDown_ = function(event) {
  event.preventDefault();
  var evt = this.getInteractivityEvent_(event);
  if (evt) this.interactivityHandler_.dispatchEvent(evt);
};


/**
 * Row click interactivity handler.
 * @param {Object} event - Dispatched event object.
 */
anychart.core.ui.DataGrid.prototype.rowClick = function(event) {
  this.rowSelect(event);
};


/**
 * Row double click interactivity handler.
 * @param {Object} event - Dispatched event object.
 */
anychart.core.ui.DataGrid.prototype.rowDblClick = function(event) {
  var item = event['item'];
  if (item && item.numChildren())
    item.meta(anychart.enums.GanttDataFields.COLLAPSED, !item.meta(anychart.enums.GanttDataFields.COLLAPSED));
};


/**
 * Row mouse move interactivity handler.
 * @param {Object} event - Dispatched event object.
 */
anychart.core.ui.DataGrid.prototype.rowMouseMove = function(event) {
  this.highlight(event['hoveredIndex'], event['startY'], event['endY']);

  var tooltip = /** @type {anychart.core.ui.Tooltip} */(this.tooltip());
  var position = tooltip.isFloating() ?
      new acgraph.math.Coordinate(event['originalEvent']['clientX'], event['originalEvent']['clientY']) :
      new acgraph.math.Coordinate(0, 0);
  tooltip.show(event['item'], position);
};


/**
 * Row mouse over interactivity handler.
 * @param {Object} event - Dispatched event object.
 */
anychart.core.ui.DataGrid.prototype.rowMouseOver = function(event) {
};


/**
 * Row mouse out interactivity handler.
 * @param {Object} event - Dispatched event object.
 */
anychart.core.ui.DataGrid.prototype.rowMouseOut = function(event) {
  this.highlight();
  this.tooltip().hide();
};


/**
 * Handles row selection.
 * @param {Object} event - Dispatched event object.
 */
anychart.core.ui.DataGrid.prototype.rowSelect = function(event) {
  var item = event['item'];
  if (this.selectRow(item)) {
    var eventObj = goog.object.clone(event);
    eventObj['type'] = anychart.enums.EventType.ROW_SELECT;
    this.interactivityHandler_.dispatchEvent(eventObj);
  }
};


/**
 * Unselects currently selected item.
 */
anychart.core.ui.DataGrid.prototype.unselect = function() {
  if (this.selectedItem_) {
    this.selectedItem_.meta('selected', false);
    this.selectedItem_ = null;
  }
};


/**
 * Creates new event object to be dispatched.
 * @param {anychart.core.MouseEvent} event - Incoming event.
 * @return {?Object} - New event object to be dispatched.
 * @private
 */
anychart.core.ui.DataGrid.prototype.getInteractivityEvent_ = function(event) {
  if (this.gridHeightCache_.length) {
    var item;
    var type = event['type'];
    switch (type) {
      case acgraph.events.EventType.MOUSEOUT:
        type = anychart.enums.EventType.ROW_MOUSE_OUT;
        if (this.hoveredIndex_ >= 0) item = this.visibleItems_[this.startIndex_ + this.hoveredIndex_];
        break;
      case acgraph.events.EventType.MOUSEOVER:
        type = anychart.enums.EventType.ROW_MOUSE_OVER;
        break;
      case acgraph.events.EventType.MOUSEMOVE:
        type = anychart.enums.EventType.ROW_MOUSE_MOVE;
        break;
      case acgraph.events.EventType.MOUSEDOWN:
        type = anychart.enums.EventType.ROW_MOUSE_DOWN;
        break;
      case acgraph.events.EventType.MOUSEUP:
        type = anychart.enums.EventType.ROW_MOUSE_UP;
        break;
      case acgraph.events.EventType.CLICK:
        type = anychart.enums.EventType.ROW_CLICK;
        break;
      case acgraph.events.EventType.DBLCLICK:
        type = anychart.enums.EventType.ROW_DBL_CLICK;
        break;
      default:
        return null;
    }

    var newEvent = {
      'type': type,
      'actualTarget': event['target'],
      'target': this,
      'originalEvent': event
    };

    var initialTop = /** @type {number} */ (this.pixelBoundsCache_.top + this.titleHeight_ + 1);

    var min = this.pixelBoundsCache_.top +
        goog.style.getClientPosition(/** @type {Element} */(this.container().getStage().container())).y +
        this.titleHeight_;

    var mouseHeight = event['clientY'] - min;

    var totalHeight = this.gridHeightCache_[this.gridHeightCache_.length - 1];

    if (item) {
      newEvent['item'] = item;
    } else if (mouseHeight < 0 || mouseHeight > totalHeight) {
      return null;
    } else {
      var index = goog.array.binarySearch(this.gridHeightCache_, mouseHeight);
      index = index >= 0 ? index : ~index; //Index of row under mouse.
      this.hoveredIndex_ = index;

      var startHeight = index ? this.gridHeightCache_[index - 1] : 0;
      var startY = initialTop + startHeight;
      var endY = startY + (this.gridHeightCache_[index] - startHeight - this.rowStrokeThickness_);

      newEvent['item'] = this.visibleItems_[this.startIndex_ + index];
      newEvent['startY'] = startY;
      newEvent['endY'] = endY;
      newEvent['hoveredIndex'] = this.hoveredIndex_;
    }
    return newEvent;
  }
  return null;
};


/**
 * Highlights selected vertical range.
 * TODO (A.Kudryavtsev): Extract this method to parent  class.
 * @param {number=} opt_index - Index of selected item.
 * @param {number=} opt_startY - Start Y to be highlighted.
 * @param {number=} opt_endY - End Y to be highlighted.
 */
anychart.core.ui.DataGrid.prototype.highlight = function(opt_index, opt_startY, opt_endY) {
  var definedValues = goog.isDef(opt_index) && goog.isDef(opt_startY) && goog.isDef(opt_endY);
  if (definedValues) {
    if (this.hoverStartY_ != opt_startY || this.hoverEndY_ != opt_endY) {
      this.hoveredIndex_ = opt_index;
      this.hoverStartY_ = opt_startY;
      this.hoverEndY_ = opt_endY;
      this.invalidate(anychart.ConsistencyState.DATA_GRID_HOVER, anychart.Signal.NEEDS_REDRAW);
    }
  } else {
    if (this.hoveredIndex_ >= 0) {
      this.hoveredIndex_ = -1;
      this.hoverStartY_ = NaN;
      this.hoverEndY_ = NaN;
      this.invalidate(anychart.ConsistencyState.DATA_GRID_HOVER, anychart.Signal.NEEDS_REDRAW);
    }
  }
};


/**
 * Method to select row from outside.
 * @param {anychart.data.Tree.DataItem} item - New selected data item.
 * @return {boolean} - Whether has been selcted.
 */
anychart.core.ui.DataGrid.prototype.selectRow = function(item) {
  if (item && item != this.selectedItem_) {
    item.tree().suspendSignalsDispatching();
    item.meta('selected', true);
    if (this.selectedItem_) this.selectedItem_.meta('selected', false); //selectedItem_ has the same tree as item.
    this.selectedItem_ = item;
    item.tree().resumeSignalsDispatching(false);
    this.invalidate(anychart.ConsistencyState.DATA_GRID_CLICK, anychart.Signal.NEEDS_REDRAW);
    return true;
  }
  return false;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  DOM init.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Inner getter for this.base_.
 * @return {acgraph.vector.Layer}
 * @private
 */
anychart.core.ui.DataGrid.prototype.getBase_ = function() {
  if (!this.base_) {
    this.base_ = /** @type {acgraph.vector.Layer} */ (acgraph.layer());
    //We handle mouseDown here to prevent double click selection.
    this.bindHandlersToGraphics(this.base_, null, null, null, null, /** @type {Function} */ (this.handleMouseDown_));
    this.registerDisposable(this.base_);
  }
  return this.base_;
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
    this.hoverPath_.stroke(null);
    this.hoverPath_.fill(this.hoverFill_);
    this.hoverPath_.zIndex(10);
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
    this.selectedPath_.stroke(null);
    this.selectedPath_.fill(this.rowSelectedFill_);
    this.selectedPath_.zIndex(11);
    this.registerDisposable(this.selectedPath_);
  }
  return this.selectedPath_;
};


/**
 * Getter for this.rowStrokePath_.
 * @return {acgraph.vector.Path}
 * @private
 */
anychart.core.ui.DataGrid.prototype.getRowStrokePath_ = function() {
  if (!this.rowStrokePath_) {
    this.rowStrokePath_ = /** @type {acgraph.vector.Path} */ (this.getCellsLayer_().path());
    this.rowStrokePath_.stroke(this.rowStroke_);
    this.rowStrokePath_.zIndex(20);
    this.registerDisposable(this.rowStrokePath_);
  }
  return this.rowStrokePath_;
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
 * Gets/sets column stroke. Actually parses a value to apply width and color to columns splitter.
 * @param {(acgraph.vector.Stroke|string)=} opt_value - Value to be set.
 * @return {(string|acgraph.vector.Stroke|anychart.core.ui.DataGrid)} - Current value or itself for method chaining.
 */
anychart.core.ui.DataGrid.prototype.columnStroke = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = acgraph.vector.normalizeStroke.apply(null, arguments);
    if (!anychart.color.equals(this.columnStroke_, val)) {
      this.columnStroke_ = val;
      this.invalidate(anychart.ConsistencyState.DATA_GRID_GRIDS, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.columnStroke_;
};


/**
 * Gets/sets row stroke.
 * @param {(acgraph.vector.Stroke|string)=} opt_value - Value to be set.
 * @return {(string|acgraph.vector.Stroke|anychart.core.ui.DataGrid)} - Current value or itself for method chaining.
 */
anychart.core.ui.DataGrid.prototype.rowStroke = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = acgraph.vector.normalizeStroke.apply(null, arguments);
    var newThickness = anychart.utils.extractThickness(val);

    //TODO (A.Kudryavtsev): In current moment (15 June 2015) method anychart.color.equals works pretty bad.
    //TODO (A.Kudryavtsev): That's why here I check thickness as well.
    if (!anychart.color.equals(this.rowStroke_, val) || newThickness != this.rowStrokeThickness_) {
      this.rowStroke_ = val;
      this.rowStrokeThickness_ = newThickness;
      this.invalidate(anychart.ConsistencyState.DATA_GRID_POSITION | anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }

    return this;
  }
  return this.rowStroke_;
};


/**
 * Gets cached row stroke thickness.
 * NOTE: For inner usage only, do not export.
 * @return {number} - Row stroke thickness.
 */
anychart.core.ui.DataGrid.prototype.getRowStrokeThickness = function() {
  return this.rowStrokeThickness_;
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
          this.invalidate(anychart.ConsistencyState.DATA_GRID_POSITION, anychart.Signal.NEEDS_REDRAW);
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
          this.invalidate(anychart.ConsistencyState.DATA_GRID_POSITION, anychart.Signal.NEEDS_REDRAW);
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
          this.invalidate(anychart.ConsistencyState.DATA_GRID_POSITION, anychart.Signal.NEEDS_REDRAW);
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
          this.invalidate(anychart.ConsistencyState.DATA_GRID_POSITION, anychart.Signal.NEEDS_REDRAW);
        }
      }
    } else {
      anychart.utils.warning(anychart.enums.WarningCode.DG_INCORRECT_METHOD_USAGE, null, ['verticalOffset', 'controller.verticalOffset']);
    }

    return this;
  }
  return this.verticalOffset_;
};


/**
 * Gets/set horizontal offset.
 * @param {number=} opt_value - Value to be set.
 * @return {(number|anychart.core.ui.DataGrid)} - Current value or itself for method chaining.
 */
anychart.core.ui.DataGrid.prototype.horizontalOffset = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.horizontalOffset_ != opt_value) {
      this.horizontalOffset_ = opt_value;
      this.invalidate(anychart.ConsistencyState.DATA_GRID_GRIDS, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.horizontalOffset_;
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
  var header = this.pixelBoundsCache_.top + this.titleHeight_ + 1; //1px line always separates header from content
  var totalTop = (header - this.verticalOffset_);
  this.highlight();
  this.gridHeightCache_.length = 0;

  this.getEvenPath_().clear();
  this.getOddPath_().clear();
  this.getSelectedPath_().clear();
  this.getRowStrokePath_().clear();

  var pixelShift = (this.rowStrokeThickness_ % 2 && acgraph.type() === acgraph.StageType.SVG) ? 0.5 : 0;

  for (var i = this.startIndex_; i <= this.endIndex_; i++) {
    var item = this.visibleItems_[i];
    if (!item) break;

    var firstCell = (i == this.startIndex_);

    var top = firstCell ? header : totalTop;

    var height = anychart.core.gantt.Controller.getItemHeight(item);
    height = firstCell ? height - this.verticalOffset_ + 1 : height;

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
        .moveTo(this.pixelBoundsCache_.left, top)
        .lineTo(this.pixelBoundsCache_.left + this.totalColumnsWidth_, top)
        .lineTo(this.pixelBoundsCache_.left + this.totalColumnsWidth_, newTop)
        .lineTo(this.pixelBoundsCache_.left, newTop)
        .close();

    if (item.meta('selected')) {
      this.selectedItem_ = item; //In case of restoration from XML/JSON, this allows to save selected item state.
      this.selectedPath_
          .moveTo(this.pixelBoundsCache_.left, top)
          .lineTo(this.pixelBoundsCache_.left + this.pixelBoundsCache_.width, top)
          .lineTo(this.pixelBoundsCache_.left + this.pixelBoundsCache_.width, newTop)
          .lineTo(this.pixelBoundsCache_.left, newTop)
          .close();
    }

    totalTop = (newTop + this.rowStrokeThickness_);

    var strokePathTop = Math.floor(totalTop - this.rowStrokeThickness_ / 2) + pixelShift;
    this.rowStrokePath_
        .moveTo(this.pixelBoundsCache_.left, strokePathTop)
        .lineTo(this.pixelBoundsCache_.left + this.totalColumnsWidth_, strokePathTop);

    this.gridHeightCache_.push(totalTop - header);
  }

  this.getSplitterLayer_().clip(new acgraph.math.Rect(this.pixelBoundsCache_.left, this.pixelBoundsCache_.top,
      this.pixelBoundsCache_.width, totalTop - this.pixelBoundsCache_.top));

};


/**
 * Adds new splitter if needed.
 * @private
 */
anychart.core.ui.DataGrid.prototype.addSplitter_ = function() {
  var columnsCount = 0; //Calculating how many columns are currently visible.
  for (var i = 0, l = this.columns_.length; i < l; i++) {
    if (this.columns_[i] && this.columns_[i].enabled()) columnsCount++;
  }

  //NOTE: We call this method on every add-new-column action, that's why
  //(columnsCount > this.splitters_.length) is totally the same as (columnsCount - 1 == this.splitters_.length).
  if (columnsCount > this.splitters_.length) {
    var newSplitter = new anychart.core.ui.Splitter();
    this.registerDisposable(newSplitter);
    newSplitter.stroke(null);
    newSplitter.container(this.getSplitterLayer_());
    newSplitter.stroke(null);
    newSplitter.listen(anychart.enums.EventType.SPLITTER_CHANGE, goog.bind(this.splitterChangedHandler_, this, columnsCount - 1));
    newSplitter.listen(acgraph.events.EventType.DBLCLICK, goog.bind(this.splitterDblClickHandler_, this, columnsCount - 1));
    this.splitters_.push(newSplitter);
  }
};


/**
 * Gets column by index or creates a new one if column doesn't exist yet.
 * If works like setter, sets a column by index.
 * @param {(number|anychart.core.ui.DataGrid.Column|string)=} opt_indexOrValue - Column index or column.
 * @param {(anychart.core.ui.DataGrid.Column|Object)=} opt_value - Column to be set.
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
    column.setup(this.defaultColumnSettings());
    column.listenSignals(this.columnInvalidated_, this);
    this.registerDisposable(column);
    newColumn = true;
  }

  if (goog.isDef(value)) {
    column.setup(value instanceof anychart.core.ui.DataGrid.Column ? value.serialize() : value);
    if (column.enabled()) column.container(this.getColumnsLayer_());
    this.columns_[index] = column;
    this.addSplitter_();
    this.invalidate(anychart.ConsistencyState.DATA_GRID_GRIDS | anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    return this;
  } else {
    if (newColumn) {
      //var columnWidth = index ?
      //    (index == 1 ? anychart.core.ui.DataGrid.NAME_COLUMN_WIDTH : anychart.core.ui.DataGrid.DEFAULT_COLUMN_WIDTH) :
      //    anychart.core.ui.DataGrid.NUMBER_COLUMN_WIDTH;

      var columnTitle = index ? (index == 1 ? 'Name' : ('Column #' + index)) : '#';
      column.suspendSignalsDispatching();
      column
          .container(this.getColumnsLayer_())
          //.width(columnWidth)
          .height('100%');

      column.title().text(columnTitle);
      //column.title().height(this.titleHeight_);
      //column.title().width(columnWidth);

      column.resumeSignalsDispatching(true);
      this.columns_[index] = column;
      this.addSplitter_();

      this.invalidate(anychart.ConsistencyState.DATA_GRID_GRIDS | anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
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
 * Splitter double click handler.
 * @param {number} splitterIndex - Index of splitter that has been clicked.
 * @param {goog.events.Event} event - Event.
 * @private
 */
anychart.core.ui.DataGrid.prototype.splitterDblClickHandler_ = function(splitterIndex, event) {
  this.forEachVisibleColumn_(this.dblClickResizeColumn_, this, splitterIndex, event);
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
 * Sets new column width depending on it's default width or title's width.
 * @param {anychart.core.ui.DataGrid.Column} column - Current visible column.
 * @param {number} columnIndex - Straight index of current visible column.
 * @param {number} splitterIndex
 * @param {goog.events.Event} event - Event.
 * @private
 */
anychart.core.ui.DataGrid.prototype.dblClickResizeColumn_ = function(column, columnIndex, splitterIndex, event) {
  if (splitterIndex == columnIndex) { //If splitter_index == column_index.
    var title = column.title();
    var height = title.height();
    var eventY = event['originalEvent']['offsetY'] - this.pixelBoundsCache_.top;
    if (eventY < height) {
      var titleOriginalBoundsWidth = title.getOriginalBounds().width;
      titleOriginalBoundsWidth += (title.padding().left() + title.padding().right());
      column.width(/** @type {number} */ (column.defaultWidth() ? column.defaultWidth() : titleOriginalBoundsWidth));
    }
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
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) state |= anychart.ConsistencyState.DATA_GRID_GRIDS;

  this.invalidate(state, signal);
};


/**
 * @inheritDoc
 */
anychart.core.ui.DataGrid.prototype.remove = function() {
  if (this.base_) this.base_.parent(null);
};


/**
 * Generates horizontal scroll bar.
 *
 * @return {anychart.core.ui.ScrollBar} - Scroll bar.
 */
anychart.core.ui.DataGrid.prototype.getHorizontalScrollBar = function() {
  if (!this.horizontalScrollBar_) {
    this.horizontalScrollBar_ = new anychart.core.ui.ScrollBar();
    this.horizontalScrollBar_
        .layout(anychart.enums.Layout.HORIZONTAL)
        .buttonsVisible(false)
        .mouseOutOpacity(.25)
        .mouseOverOpacity(.45);

    var ths = this;
    this.horizontalScrollBar_.listen(anychart.enums.EventType.SCROLL_CHANGE, function(e) {
      var startRatio = e['startRatio'];
      var horOffset = Math.round(startRatio * ths.totalColumnsWidth_);
      ths.horizontalOffset(horOffset);
    });
  }
  return this.horizontalScrollBar_;
};


/**
 * Initializes mouse wheel scrolling and mouse drag scrolling.
 * TODO (A.Kudryavtsev): In current implementation (04 Dec 2014) mouse drag scrolling is not available.
 */
anychart.core.ui.DataGrid.prototype.initMouseFeatures = function() {
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
anychart.core.ui.DataGrid.prototype.mouseWheelHandler_ = function(e) {
  var dx = e.deltaX;
  var dy = e.deltaY;

  if (goog.userAgent.WINDOWS) {
    dx = dx * 15;
    dy = dy * 15;
  }

  var horizontalScroll = this.getHorizontalScrollBar();
  var verticalScroll = this.controller_.getScrollBar();

  var preventDefault = verticalScroll.startRatio() > 0 &&
      verticalScroll.endRatio() < 1 &&
      horizontalScroll.startRatio() > 0 &&
      horizontalScroll.endRatio() < 1;

  this.scroll(dx, dy);
  if (preventDefault) e.preventDefault();
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

  this.horizontalOffset(this.horizontalOffset_ + horizontalPixelOffset);

  var heightCache = this.controller_.getHeightCache();
  var totalVerticalStartOffset = this.startIndex_ ? heightCache[this.startIndex_ - 1] : 0;
  totalVerticalStartOffset += (this.verticalOffset_ + verticalPixelOffset);
  this.controller_.scrollTo(totalVerticalStartOffset);

  anychart.core.Base.resumeSignalsDispatchingTrue(this, this.controller_);
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
          .availableHeight(this.pixelBoundsCache_.height - this.titleHeight_ - 1)
          .dataGrid(this)
          .rowStrokeThickness(this.rowStrokeThickness_);

      if (isNaN(this.startIndex_) && isNaN(this.endIndex_)) this.startIndex_ = 0;
      if (!isNaN(this.startIndex_)) {
        this.controller_.startIndex(this.startIndex_);
      } else {
        this.controller_.endIndex(this.endIndex_);
      }

      this.controller_.listenSignals(this.needsReapplicationHandler_, this);
    }
    this.controller_.rowStrokeThickness(this.rowStrokeThickness_);
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

  if (opt_positionRecalculated) this.invalidate(anychart.ConsistencyState.DATA_GRID_POSITION);

  if (this.checkDrawingNeeded()) {
    var left, top;
    var verticalScrollBar, horizontalScrollBar;
    var scrollsLayer;

    var container = /** @type {acgraph.vector.ILayer} */(this.container());
    var stage = container ? container.getStage() : null;
    var manualSuspend = stage && !stage.isSuspended();
    if (manualSuspend) stage.suspend();

    //Ensure DOM structure is created.
    if (!this.getBase_().numChildren()) {
      this.bgRect_ = this.getBase_().rect();
      this.registerDisposable(this.bgRect_);
      this.bgRect_.fill(this.backgroundFill_).stroke(null);

      this.mwhRect_ = this.getBase_().rect();
      this.mwhRect_.fill('#fff 0').stroke(null);

      /*
        TODO (A.Kudryavtsev):
        In current implementation (5 Mar 2015) changing splitter's position dispatches ROW_SELECT as well.
        Fix it when another events behaviour will be implemented.
        Temp workaround: move splitters layer outside of base layer.
       */

      this.getBase_()
          .addChild(/** @type {!acgraph.vector.Layer} */ (this.getCellsLayer_()))
          .addChild(/** @type {!acgraph.vector.Layer} */ (this.getColumnsLayer_()))
          .addChild(/** @type {!acgraph.vector.Layer} */ (this.getSplitterLayer_()));

      if (this.isStandalone_) {
        /*
          NOTE: For standalone mode only!
                Not standalone scrolls are controlled by chart.
         */
        scrollsLayer = /** @type {acgraph.vector.Layer} */ (acgraph.layer());
        scrollsLayer.zIndex(10);
        this.registerDisposable(scrollsLayer);

        verticalScrollBar = this.controller_.getScrollBar();
        verticalScrollBar
            .container(scrollsLayer)
            .listenSignals(function(event) {
              if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) verticalScrollBar.draw();
            }, verticalScrollBar);
        this.registerDisposable(verticalScrollBar);

        horizontalScrollBar = this.getHorizontalScrollBar();
        horizontalScrollBar
            .container(scrollsLayer)
            .listenSignals(function(event) {
              if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) horizontalScrollBar.draw();
            }, horizontalScrollBar);
        this.registerDisposable(horizontalScrollBar);

      }
    }

    if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
      this.getBase_().parent(container);
      if (scrollsLayer) scrollsLayer.parent(container);
      this.markConsistent(anychart.ConsistencyState.CONTAINER);
    }

    if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
      this.pixelBoundsCache_ = /** @type {acgraph.math.Rect} */ (this.getPixelBounds());
      this.getBase_().clip(/** @type {acgraph.math.Rect} */ (this.pixelBoundsCache_));
      this.bgRect_.setBounds(/** @type {acgraph.math.Rect} */ (this.pixelBoundsCache_));
      this.mwhRect_.setBounds(/** @type {acgraph.math.Rect} */ (this.pixelBoundsCache_));
      this.titleHeight_ = this.pixelBoundsCache_.height - availableHeight;
      this.invalidate(anychart.ConsistencyState.DATA_GRID_GRIDS);

      if (this.isStandalone_) {
        /*
          NOTE: For standalone mode only!
                Not standalone scrolls are controlled by chart.
         */
        verticalScrollBar = this.controller_.getScrollBar();
        horizontalScrollBar = this.getHorizontalScrollBar();

        verticalScrollBar.bounds(
            (this.pixelBoundsCache_.left + this.pixelBoundsCache_.width - anychart.core.ui.ScrollBar.SCROLL_BAR_SIDE - 1),
            (this.pixelBoundsCache_.top + this.titleHeight_ + anychart.core.ui.ScrollBar.SCROLL_BAR_SIDE + 1),
            anychart.core.ui.ScrollBar.SCROLL_BAR_SIDE,
            (this.pixelBoundsCache_.height - this.titleHeight_ - 2 * anychart.core.ui.ScrollBar.SCROLL_BAR_SIDE - 2)
        );

        horizontalScrollBar.bounds(
            (this.pixelBoundsCache_.left + anychart.core.ui.ScrollBar.SCROLL_BAR_SIDE),
            (this.pixelBoundsCache_.top + this.pixelBoundsCache_.height - anychart.core.ui.ScrollBar.SCROLL_BAR_SIDE - 1),
            (this.pixelBoundsCache_.width - 2 * anychart.core.ui.ScrollBar.SCROLL_BAR_SIDE),
            anychart.core.ui.ScrollBar.SCROLL_BAR_SIDE
        );
      }

      this.markConsistent(anychart.ConsistencyState.BOUNDS);
    }


    /*
      This actually places a columns horizontally depending on previous column's width.
     */
    if (this.hasInvalidationState(anychart.ConsistencyState.DATA_GRID_GRIDS)) {
      var width;
      var color;
      if (this.columnStroke_) {
        if (goog.isString(this.columnStroke_)) {
          color = this.columnStroke_;
          width = 1;
        } else {
          if (goog.isDef(this.columnStroke_['thickness'])) width = this.columnStroke_['thickness'] || 1;
          color = this.columnStroke_['color'] || '#ccd7e1';
        }
      }

      left = this.pixelBoundsCache_.left;
      top = this.pixelBoundsCache_.top;

      var totalWidth = 0;

      var enabledColumns = [];
      var i, l, col, colWidth;

      for (i = 0, l = this.columns_.length; i < l; i++) {
        col = this.columns_[i];
        if (col) {
          if (col.enabled()) {
            colWidth = col.calculateBounds().width; //We need pixel value here.
            totalWidth += (colWidth + width);
            enabledColumns.push(col);
          } else {
            col.draw(); //Clearing cons.state "enabled".
          }
        }
      }

      this.totalColumnsWidth_ = totalWidth;

      if (this.pixelBoundsCache_.width > this.totalColumnsWidth_) this.horizontalOffset_ = 0;

      this.horizontalOffset_ = goog.math.clamp(this.horizontalOffset_, 0, Math.abs(this.pixelBoundsCache_.width - this.totalColumnsWidth_));

      var colLeft = -this.horizontalOffset_;

      for (i = 0, l = enabledColumns.length; i < l; i++) {
        col = enabledColumns[i];
        col.suspendSignalsDispatching();
        col.position({x: colLeft, y: 0}); //Column width and height are already set here.
        col.height(this.pixelBoundsCache_.height);
        colWidth = col.calculateBounds().width; //We need pixel value here.
        var splitter = this.splitters_[i];

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
            left: (left + colLeft + anychart.core.ui.DataGrid.MIN_COLUMN_WIDTH),
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

        colLeft += add;
        col.resumeSignalsDispatching(false);
        col.draw();
      }

      drawRows = true;

      while (i < this.splitters_.length) { //This disables all remaining splitters.
        if (!this.splitters_[i].enabled()) break;
        this.splitters_[i].enabled(false).draw();
        i++;
      }

      if (this.horizontalScrollBar_) {
        var contentBoundsSimulation = new acgraph.math.Rect(this.pixelBoundsCache_.left - this.horizontalOffset_, 0, this.totalColumnsWidth_, 0);
        var visibleBoundsSimulation = new acgraph.math.Rect(this.pixelBoundsCache_.left, 0, this.pixelBoundsCache_.width, 0);

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

      this.markConsistent(anychart.ConsistencyState.DATA_GRID_GRIDS);
    }

    /*
      Actually places rows on each column vertically.
     */
    if (this.hasInvalidationState(anychart.ConsistencyState.DATA_GRID_POSITION)) {
      this.tooltip().hide();

      this.forEachVisibleColumn_(function(col) {
        col.invalidate(anychart.ConsistencyState.DATA_GRID_COLUMN_POSITION); //Column takes data from own data grid.
        col.draw();
      });

      drawRows = true;
      this.markConsistent(anychart.ConsistencyState.DATA_GRID_POSITION);
    }

    if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
      this.bgRect_.fill(this.backgroundFill_);
      this.getOddPath_().fill(this.rowOddFill_ || this.rowFill_);
      this.getEvenPath_().fill(this.rowEvenFill_ || this.rowFill_);
      this.getSelectedPath_().fill(this.rowSelectedFill_);
      this.getRowStrokePath_().stroke(this.rowStroke_);

      this.forEachVisibleColumn_(function(col) {
        col.invalidate(anychart.ConsistencyState.APPEARANCE);
        col.draw();
      });

      this.markConsistent(anychart.ConsistencyState.APPEARANCE);
    }

    if (this.hasInvalidationState(anychart.ConsistencyState.DATA_GRID_HOVER)) {
      if (this.hoveredIndex_ >= 0 && goog.isDef(this.hoverStartY_) && goog.isDef(this.hoverEndY_) && goog.isDef(this.hoveredIndex_)) {
        this.getHoverPath_()
            .fill(this.hoverFill_)
            .clear()
            .moveTo(this.pixelBoundsCache_.left, this.hoverStartY_)
            .lineTo(this.pixelBoundsCache_.left + this.pixelBoundsCache_.width, this.hoverStartY_)
            .lineTo(this.pixelBoundsCache_.left + this.pixelBoundsCache_.width, this.hoverEndY_)
            .lineTo(this.pixelBoundsCache_.left, this.hoverEndY_)
            .close();
      } else {
        this.getHoverPath_().clear();
      }
      this.markConsistent(anychart.ConsistencyState.DATA_GRID_HOVER);
    }

    if (this.hasInvalidationState(anychart.ConsistencyState.DATA_GRID_CLICK)) {
      drawRows = true;
      this.markConsistent(anychart.ConsistencyState.DATA_GRID_CLICK);
    }

    if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
      this.getBase_().zIndex(/** @type {number} */ (this.zIndex()));
      this.markConsistent(anychart.ConsistencyState.Z_INDEX);
    }

    if (drawRows) this.drawRowFills_();
    if (manualSuspend) stage.resume();
  }

  if (this.isStandalone_)this.initMouseFeatures();

  return this;
};


/** @inheritDoc */
anychart.core.ui.DataGrid.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');

  json['isStandalone'] = this.isStandalone_;

  /*
    Note: not standalone data grid is controlled by some higher entity (e.g. gantt chart).
    It means that controller must be serialized and restored by this entity, but not by data grid.
   */
  if (this.isStandalone_) {
    if (this.controller()) {
      json['controller'] = this.controller().serialize();
    } else {
      json['treeData'] = this.data().serialize();
      json['verticalOffset'] = this.verticalOffset();
      if (!isNaN(this.startIndex()))
        json['startIndex'] = this.startIndex();
      else if (!isNaN(this.endIndex()))
        json['endIndex'] = this.endIndex();
    }
  }

  json['titleHeight'] = this.titleHeight_;
  json['backgroundFill'] = anychart.color.serialize(this.backgroundFill_);
  json['columnStroke'] = anychart.color.serialize(this.columnStroke_);
  json['rowStroke'] = anychart.color.serialize(this.rowStroke_);
  json['rowOddFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill} */ (this.rowOddFill_));
  json['rowEvenFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill} */ (this.rowEvenFill_));
  json['rowFill'] = anychart.color.serialize(this.rowFill_);
  json['titleFill'] = anychart.color.serialize(this.titleFill_);
  json['hoverFill'] = anychart.color.serialize(this.hoverFill_);
  json['rowSelectedFill'] = anychart.color.serialize(this.rowSelectedFill_);
  json['horizontalOffset'] = this.horizontalOffset();
  json['tooltip'] = this.tooltip().serialize();
  json['columns'] = [];

  for (var i = 0; i < this.columns_.length; i++) {
    var col = this.columns_[i];
    json['columns'].push(col ? col.serialize() : false);
  }

  return json;
};


/** @inheritDoc */
anychart.core.ui.DataGrid.prototype.setupByJSON = function(config) {
  goog.base(this, 'setupByJSON', config);

  this.isStandalone_ = config['isStandalone'];

  if (this.isStandalone_) {
    var dataSource = ('controller' in config) ? config['controller'] : config;
    if ('treeData' in config) this.data(anychart.data.Tree.fromJson(dataSource['treeData']));
    this.verticalOffset(dataSource['verticalOffset']);
    if ('startIndex' in config)
      this.startIndex(dataSource['startIndex']);
    else if ('endIndex' in config)
      this.endIndex(dataSource['endIndex']);

    this.titleHeight(config['titleHeight']);
  }

  if ('defaultColumnSettings' in config)
    this.defaultColumnSettings(config['defaultColumnSettings']);

  this.backgroundFill(config['backgroundFill']);
  this.columnStroke(config['columnStroke']);
  this.rowStroke(config['rowStroke']);
  this.rowFill(config['rowFill']);
  this.rowOddFill(config['rowOddFill']);
  this.rowEvenFill(config['rowEvenFill']);
  this.titleFill(config['titleFill']);
  this.rowHoverFill(config['hoverFill']);
  this.rowSelectedFill(config['rowSelectedFill']);
  this.horizontalOffset(config['horizontalOffset']);
  this.tooltip(config['tooltip']);

  if ('columns' in config) {
    for (var i = 0, l = config['columns'].length; i < l; i++) {
      var col = config['columns'][i];
      if (col) this.column(i, col);
    }
  }

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
   * Default column width.
   * @type {number}
   * @private
   */
  this.defaultWidth_;

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
  this.collapseExpandButtons_ = false;

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

  this.setParentEventTarget(this.dataGrid_);

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
    anychart.ConsistencyState.DATA_GRID_COLUMN_TITLE |
    anychart.ConsistencyState.DATA_GRID_COLUMN_POSITION;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.ui.DataGrid.Column.prototype.SUPPORTED_SIGNALS = anychart.core.VisualBase.prototype.SUPPORTED_SIGNALS;


/**
 * Sets column format.
 * @param {string} fieldName - Name of field of data item to work with.
 * @param {anychart.enums.ColumnFormats|Object} presetOrSettings - Preset or custom column format.
 * @return {anychart.core.ui.DataGrid.Column} - Itself for method chaining.
 */
anychart.core.ui.DataGrid.Column.prototype.setColumnFormat = function(fieldName, presetOrSettings) {
  var settings = goog.isString(presetOrSettings) ? this.dataGrid_.getColumnFormatByName(presetOrSettings) : presetOrSettings;
  if (goog.isObject(settings)) {
    this.suspendSignalsDispatching();

    var formatter = settings['formatter'];
    var width = settings['width'];
    var textStyle = settings['textStyle'];

    if (goog.isDef(formatter)) this.textFormatter(function(dataItem) {
      return formatter(dataItem.get(fieldName));
    });

    if (goog.isDef(width)) this.width(width).defaultWidth(width);

    if (goog.isDef(textStyle)) this.cellTextSettings().textSettings(textStyle);

    this.resumeSignalsDispatching(true);
  }
  return this;
};


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
      this.invalidate(anychart.ConsistencyState.DATA_GRID_COLUMN_POSITION, anychart.Signal.NEEDS_REDRAW);
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
    this.invalidate(anychart.ConsistencyState.DATA_GRID_COLUMN_POSITION, anychart.Signal.NEEDS_REDRAW);
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

    this.labelsFactory_.container(this.getCellsLayer_());
    this.labelsFactory_.setParentEventTarget(this);
    this.labelsFactory_.listenSignals(this.labelsInvalidated_, this);

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
      this.invalidate(anychart.ConsistencyState.DATA_GRID_COLUMN_POSITION, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.labelsFactory_;

};


/**
 * Label invalidation handler.
 * @param {anychart.SignalEvent} event - Signal event.
 * @private
 */
anychart.core.ui.DataGrid.Column.prototype.labelsInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.invalidate(anychart.ConsistencyState.DATA_GRID_COLUMN_POSITION, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Gets/sets cells text settings overrider.
 * @param {function(anychart.core.ui.LabelsFactory.Label, anychart.data.Tree.DataItem)=} opt_value - New text settings
 *  overrider function.
 * @return {(anychart.core.ui.DataGrid.Column|function(anychart.core.ui.LabelsFactory.Label, anychart.data.Tree.DataItem))} - Current value or itself for method chaining.
 */
anychart.core.ui.DataGrid.Column.prototype.cellTextSettingsOverrider = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.cellTextSettingsOverrider_ = opt_value;
    //TODO (A.Kudryavtsev): WE invalidate position because labels factory work that way: must clear and redraw all labels.
    this.invalidate(anychart.ConsistencyState.DATA_GRID_COLUMN_POSITION, anychart.Signal.NEEDS_REDRAW);
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
anychart.core.ui.DataGrid.Column.prototype.collapseExpandButtons = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.collapseExpandButtons_ != opt_value) {
      this.collapseExpandButtons_ = opt_value;
      this.invalidate(anychart.ConsistencyState.DATA_GRID_COLUMN_POSITION, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.collapseExpandButtons_;
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
    this.title_.setParentEventTarget(this);

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
    this.dataGrid_.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
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
    this.titlePath_.fill(/** @type {acgraph.vector.Fill} */ (this.dataGrid_.titleFill()));
    this.titlePath_.stroke(null);
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
 * Column width.
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
 * Column default width.
 * @param {number=} opt_value - Default width value.
 * @return {(number|anychart.core.ui.DataGrid.Column)} - Width or itself for method chaining.
 */
anychart.core.ui.DataGrid.Column.prototype.defaultWidth = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.defaultWidth_ = opt_value; //We don't invalidate anything right here.
    return this;
  }
  return this.defaultWidth_;
};


/**
 * Column height.
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
  this.dataGrid_.invalidate(anychart.ConsistencyState.DATA_GRID_GRIDS, anychart.Signal.NEEDS_REDRAW);
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
        That's why we invalidate anychart.ConsistencyState.DATA_GRID_COLUMN_POSITION here.
       */
      this.invalidate(anychart.ConsistencyState.DATA_GRID_COLUMN_POSITION);

      this.markConsistent(anychart.ConsistencyState.BOUNDS);
    }

    if (this.hasInvalidationState(anychart.ConsistencyState.DATA_GRID_COLUMN_POSITION)) {
      var titleHeight = /** @type {number} */ (this.dataGrid_.titleHeight());

      this.getTitlePath_()
          .clear()
          .moveTo(this.pixelBoundsCache_.left, this.pixelBoundsCache_.top)
          .lineTo(this.pixelBoundsCache_.left + this.pixelBoundsCache_.width, this.pixelBoundsCache_.top)
          .lineTo(this.pixelBoundsCache_.left + this.pixelBoundsCache_.width, this.pixelBoundsCache_.top + titleHeight)
          .lineTo(this.pixelBoundsCache_.left, this.pixelBoundsCache_.top + titleHeight)
          .close();

      var titleParentBounds = new anychart.math.Rect(this.pixelBoundsCache_.left, this.pixelBoundsCache_.top,
          this.pixelBoundsCache_.width, titleHeight);

      this.title_.parentBounds(titleParentBounds);
      this.title_.height(titleHeight);
      this.invalidate(anychart.ConsistencyState.DATA_GRID_COLUMN_TITLE);

      var data = this.dataGrid_.getVisibleItems();
      var startIndex = this.dataGrid_.startIndex();
      var endIndex = this.dataGrid_.endIndex();
      var verticalOffset = this.dataGrid_.verticalOffset();

      var totalTop = this.pixelBoundsCache_.top + titleHeight + 1 - verticalOffset;

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

        if (this.collapseExpandButtons_ && item.numChildren()) {
          counter++;
          addButton = anychart.core.ui.DataGrid.DEFAULT_EXPAND_COLLAPSE_BUTTON_SIDE + anychart.core.ui.DataGrid.DEFAULT_PADDING;
          var button = this.buttons_[counter];
          if (!button) {
            button = new anychart.core.ui.DataGrid.Button(this.dataGrid_);
            this.buttons_.push(button);
            button.container(this.getCellsLayer_());
          }

          button.suspendSignalsDispatching();

          var top = totalTop + ((height - anychart.core.ui.DataGrid.DEFAULT_EXPAND_COLLAPSE_BUTTON_SIDE) / 2);

          var pixelShift = (acgraph.type() === acgraph.StageType.SVG) ? .5 : 0;
          button
              .enabled(true)
              .collapsed(!!item.meta('collapsed'))
              .dataItemIndex(i)
              .parentBounds(this.pixelBoundsCache_)
              .position({
                'x': Math.floor(this.pixelBoundsCache_.left + padding) + pixelShift,
                'y': Math.floor(top) + pixelShift
              });

          button.resumeSignalsDispatching(false);
          button.draw();
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

        totalTop = (newTop + this.dataGrid_.getRowStrokeThickness());
      }

      while (++counter < this.buttons_.length && this.collapseExpandButtons_) { //This disables all remaining buttons.
        if (!this.buttons_[counter].enabled()) break;
        this.buttons_[counter].enabled(false).draw();
      }

      this.cellTextSettings().resumeSignalsDispatching(false);
      this.cellTextSettings().draw();
      this.markConsistent(anychart.ConsistencyState.DATA_GRID_COLUMN_POSITION);
    }

    if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
      this.getTitlePath_().fill(/** @type {acgraph.vector.Fill} */ (this.dataGrid_.titleFill()));
      this.invalidate(anychart.ConsistencyState.DATA_GRID_COLUMN_TITLE);
      this.markConsistent(anychart.ConsistencyState.APPEARANCE);
    }

    if (this.hasInvalidationState(anychart.ConsistencyState.DATA_GRID_COLUMN_TITLE)) {
      this.title_.draw();
      this.markConsistent(anychart.ConsistencyState.DATA_GRID_COLUMN_TITLE);
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
  var json = goog.base(this, 'serialize');

  json['width'] = this.width_;
  if (goog.isDef(this.defaultWidth_)) json['defaultWidth'] = this.defaultWidth_;
  json['collapseExpandButtons'] = this.collapseExpandButtons_;
  json['depthPaddingMultiplier'] = this.depthPaddingMultiplier_;
  json['cellTextSettings'] = this.cellTextSettings().serialize();
  json['title'] = this.title_.serialize();

  if (this.textFormatter_ != this.defaultTextFormatter_) {
    anychart.utils.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Data Grid Column textFormatter']
    );
  }

  if (this.cellTextSettingsOverrider_ != this.defaultCellTextSettingsOverrider_) {
    anychart.utils.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Data Grid Column cellTextSettingsOverrider']
    );
  }

  return json;
};


/** @inheritDoc */
anychart.core.ui.DataGrid.Column.prototype.setupByJSON = function(json) {
  goog.base(this, 'setupByJSON', json);

  this.width(json['width']);
  this.defaultWidth(json['defaultWidth']);
  this.collapseExpandButtons(json['collapseExpandButtons']);
  this.depthPaddingMultiplier(json['depthPaddingMultiplier']);
  this.cellTextSettings(json['cellTextSettings']);
  this.title(json['title']);

  if ('textFormatter' in json) this.textFormatter(json['textFormatter']);
  if ('cellTextSettingsOverrider' in json) this.cellTextSettingsOverrider(json['cellTextSettingsOverrider']);

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
 * Handler for mouse up.
 * @param {acgraph.events.BrowserEvent} event - Event.
 * @override
 */
anychart.core.ui.DataGrid.Button.prototype.handleMouseUp = function(event) {
  goog.base(this, 'handleMouseUp', event);
  this.switchState();
};


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
anychart.core.ui.DataGrid.prototype['cellFill'] = anychart.core.ui.DataGrid.prototype.cellFill; //deprecated
anychart.core.ui.DataGrid.prototype['cellEvenFill'] = anychart.core.ui.DataGrid.prototype.cellEvenFill; //deprecated
anychart.core.ui.DataGrid.prototype['cellOddFill'] = anychart.core.ui.DataGrid.prototype.cellOddFill; //deprecated
anychart.core.ui.DataGrid.prototype['rowFill'] = anychart.core.ui.DataGrid.prototype.rowFill;
anychart.core.ui.DataGrid.prototype['rowEvenFill'] = anychart.core.ui.DataGrid.prototype.rowEvenFill;
anychart.core.ui.DataGrid.prototype['rowOddFill'] = anychart.core.ui.DataGrid.prototype.rowOddFill;
anychart.core.ui.DataGrid.prototype['rowHoverFill'] = anychart.core.ui.DataGrid.prototype.rowHoverFill;

anychart.core.ui.DataGrid.prototype['columnStroke'] = anychart.core.ui.DataGrid.prototype.columnStroke;
anychart.core.ui.DataGrid.prototype['titleHeight'] = anychart.core.ui.DataGrid.prototype.titleHeight;
anychart.core.ui.DataGrid.prototype['column'] = anychart.core.ui.DataGrid.prototype.column;
anychart.core.ui.DataGrid.prototype['data'] = anychart.core.ui.DataGrid.prototype.data;
anychart.core.ui.DataGrid.prototype['startIndex'] = anychart.core.ui.DataGrid.prototype.startIndex;
anychart.core.ui.DataGrid.prototype['endIndex'] = anychart.core.ui.DataGrid.prototype.endIndex;
anychart.core.ui.DataGrid.prototype['getVisibleItems'] = anychart.core.ui.DataGrid.prototype.getVisibleItems;
anychart.core.ui.DataGrid.prototype['getHorizontalScrollBar'] = anychart.core.ui.DataGrid.prototype.getHorizontalScrollBar;
anychart.core.ui.DataGrid.prototype['horizontalOffset'] = anychart.core.ui.DataGrid.prototype.horizontalOffset;
anychart.core.ui.DataGrid.prototype['verticalOffset'] = anychart.core.ui.DataGrid.prototype.verticalOffset;
anychart.core.ui.DataGrid.prototype['tooltip'] = anychart.core.ui.DataGrid.prototype.tooltip;
anychart.core.ui.DataGrid.prototype['draw'] = anychart.core.ui.DataGrid.prototype.draw;

anychart.core.ui.DataGrid.Column.prototype['title'] = anychart.core.ui.DataGrid.Column.prototype.title;
anychart.core.ui.DataGrid.Column.prototype['width'] = anychart.core.ui.DataGrid.Column.prototype.width;
anychart.core.ui.DataGrid.Column.prototype['defaultWidth'] = anychart.core.ui.DataGrid.Column.prototype.defaultWidth;
anychart.core.ui.DataGrid.Column.prototype['enabled'] = anychart.core.ui.DataGrid.Column.prototype.enabled;
anychart.core.ui.DataGrid.Column.prototype['textFormatter'] = anychart.core.ui.DataGrid.Column.prototype.textFormatter;
anychart.core.ui.DataGrid.Column.prototype['cellTextSettings'] = anychart.core.ui.DataGrid.Column.prototype.cellTextSettings;
anychart.core.ui.DataGrid.Column.prototype['cellTextSettingsOverrider'] = anychart.core.ui.DataGrid.Column.prototype.cellTextSettingsOverrider;
anychart.core.ui.DataGrid.Column.prototype['collapseExpandButtons'] = anychart.core.ui.DataGrid.Column.prototype.collapseExpandButtons;
anychart.core.ui.DataGrid.Column.prototype['depthPaddingMultiplier'] = anychart.core.ui.DataGrid.Column.prototype.depthPaddingMultiplier;
anychart.core.ui.DataGrid.Column.prototype['setColumnFormat'] = anychart.core.ui.DataGrid.Column.prototype.setColumnFormat;
anychart.core.ui.DataGrid.Column.prototype['draw'] = anychart.core.ui.DataGrid.Column.prototype.draw;
