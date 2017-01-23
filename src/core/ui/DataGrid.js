goog.provide('anychart.core.ui.DataGrid');

goog.require('acgraph');
goog.require('anychart.core.VisualBase');
goog.require('anychart.core.gantt.Controller');
goog.require('anychart.core.reporting');
goog.require('anychart.core.ui.BaseGrid');
goog.require('anychart.core.ui.Button');
goog.require('anychart.core.ui.LabelsFactory');
goog.require('anychart.core.ui.ScrollBar');
goog.require('anychart.core.ui.SimpleSplitter');
goog.require('anychart.core.ui.Title');
goog.require('anychart.data.Tree');
goog.require('anychart.enums');
goog.require('anychart.math.Rect');
goog.require('anychart.utils');

goog.require('goog.date.UtcDateTime');
goog.require('goog.events');
goog.require('goog.i18n.DateTimeFormat');



/**
 * Data grid implementation.
 * @param {anychart.core.gantt.Controller=} opt_controller - Controller to be set. See full description in parent class.
 * TODO (A.Kudryavtsev): Do we need second parameter here? Basically, DG doesn't care whether it is resource or not.
 * @constructor
 * @extends {anychart.core.ui.BaseGrid}
 */
anychart.core.ui.DataGrid = function(opt_controller) {
  anychart.core.ui.DataGrid.base(this, 'constructor', opt_controller);

  /**
   * Array of columns.
   * @type {Array.<anychart.core.ui.DataGrid.Column>}
   * @private
   */
  this.columns_ = [];

  /**
   * Splitters pool.
   * @type {Array.<anychart.core.ui.SimpleSplitter>}
   * @private
   */
  this.splitters_ = [];

  /**
   * Cell border settings.
   * @type {acgraph.vector.Stroke}
   * @private
   */
  this.columnStroke_;

  /**
   * Default title fill.
   * @type {acgraph.vector.Fill}
   * @private
   */
  this.headerFill_;


  /**
   * Header path filled by header fill.
   * @type {acgraph.vector.Path}
   * @private
   */
  this.headerPath_ = null;

  /**
   * Horizontal offset of data grid.
   * Used to perform horizontal scrolling of DG.
   * @type {number}
   * @private
   */
  this.horizontalOffset_ = 0;

  /**
   * Column formats cache.
   * @type {Object}
   * @private
   */
  this.formatsCache_ = {};

  this.controller.dataGrid(this);
};
goog.inherits(anychart.core.ui.DataGrid, anychart.core.ui.BaseGrid);


/**
 * Supported signals.
 * @type {number}
 */
anychart.core.ui.DataGrid.SUPPORTED_SIGNALS = anychart.core.ui.BaseGrid.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistence states.
 * @type {number}
 */
anychart.core.ui.DataGrid.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.ui.BaseGrid.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.DATA_GRID_GRIDS;


/**
 * @typedef {{
 *  formatter: function(*): string,
 *  textStyle: Object,
 *  width: number
 * }}
 */
anychart.core.ui.DataGrid.ColumnFormat;


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
 * Gets/sets a default title fill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.ui.DataGrid|string} - Current value or itself for method chaining.
 */
anychart.core.ui.DataGrid.prototype.headerFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var val = acgraph.vector.normalizeFill.apply(null, arguments);
    if (!anychart.color.equals(/** @type {acgraph.vector.Fill} */ (this.headerFill_), val)) {
      this.headerFill_ = val;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.headerFill_;
};


/**
 * Getter for this.headerPath_.
 * @return {acgraph.vector.Path}
 * @private
 */
anychart.core.ui.DataGrid.prototype.getHeaderPath_ = function() {
  if (!this.headerPath_) {
    this.headerPath_ = acgraph.path();
    this.getCellsLayer().addChildAt(this.headerPath_, 0);
    this.headerPath_.stroke(null);
    this.registerDisposable(this.headerPath_);
  }
  return this.headerPath_;
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
  var item = this.controller.getVisibleItems()[itemIndex];
  if (item && item.numChildren()) {
    var evtObj = {
      'type': anychart.enums.EventType.ROW_COLLAPSE_EXPAND,
      'item': item,
      'collapsed': state
    };

    if (this.interactivityHandler.dispatchEvent(evtObj))
      item.meta(anychart.enums.GanttDataFields.COLLAPSED, state);
  }
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
    var oldThickness = anychart.utils.extractThickness(this.columnStroke_);
    var newThickness = anychart.utils.extractThickness(val);
    if (!anychart.color.equals(this.columnStroke_, val) || (newThickness != oldThickness)) {
      this.columnStroke_ = val;
      this.invalidate(anychart.ConsistencyState.DATA_GRID_GRIDS, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.columnStroke_;
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
    var newSplitter = new anychart.core.ui.SimpleSplitter();
    this.registerDisposable(newSplitter);
    newSplitter.stroke(this.columnStroke_);
    newSplitter.container(this.getClipLayer());
    newSplitter.listenSignals(function() {
      newSplitter.draw();
    }, newSplitter);
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
    index = /** @type {number} */(opt_indexOrValue);
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
    if (column.enabled()) column.container(this.getContentLayer());
    this.columns_[index] = column;
    this.addSplitter_();
    this.invalidate(anychart.ConsistencyState.DATA_GRID_GRIDS | anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    return this;
  } else {
    if (newColumn) {
      var columnWidth = index ?
          (index == 1 ? anychart.core.ui.DataGrid.NAME_COLUMN_WIDTH : anychart.core.ui.DataGrid.DEFAULT_COLUMN_WIDTH) :
          anychart.core.ui.DataGrid.DEFAULT_COLUMN_WIDTH;

      var columnTitle = index ? (index == 1 ? 'Name' : ('Column #' + index)) : '#';
      column.suspendSignalsDispatching();
      column
          .container(this.getContentLayer())
          .width(columnWidth)
          .height('100%');

      column.title()['text'](columnTitle);

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
  var splitter = /** @type {anychart.core.ui.SimpleSplitter} */ (event['target']);
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
    var eventY = event['offsetY'] - this.pixelBoundsCache.top;
    if (eventY < height) {
      var titleOriginalBoundsWidth = title.getOriginalBounds().width;
      titleOriginalBoundsWidth += (title.padding().getOption('left') + title.padding().getOption('right'));
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


/** @inheritDoc */
anychart.core.ui.DataGrid.prototype.horizontalScrollBar = function(opt_value) {
  if (!this.horizontalScrollBar_) {
    this.horizontalScrollBar_ = new anychart.core.ui.ScrollBar();
    this.horizontalScrollBar_.layout(anychart.enums.Layout.HORIZONTAL);

    var ths = this;
    this.horizontalScrollBar_.listen(anychart.enums.EventType.SCROLL_CHANGE, function(e) {
      var startRatio = e['startRatio'];
      var horOffset = Math.round(startRatio * ths.totalGridsWidth);
      ths.horizontalOffset(horOffset);
    });

    this.horizontalScrollBar_.listenSignals(this.scrollBarInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    this.horizontalScrollBar_.setup(opt_value);
    return this;
  }

  return this.horizontalScrollBar_;
};


/**
 * Scrollbar invalidation.
 * @param {anychart.SignalEvent} e Event.
 * @private
 */
anychart.core.ui.DataGrid.prototype.scrollBarInvalidated_ = function(e) {
  if (e.hasSignal(anychart.Signal.BOUNDS_CHANGED))
    this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Performs scroll to pixel offsets.
 * TODO (A.Kudryavtsev): In current implementation (04 Dec 2014) horizontal scrolling of data grid is not available.
 *
 * @param {number} horizontalPixelOffset - Horizontal pixel offset.
 * @param {number} verticalPixelOffset - Vertical pixel offset.
 */
anychart.core.ui.DataGrid.prototype.scroll = function(horizontalPixelOffset, verticalPixelOffset) {
  anychart.core.Base.suspendSignalsDispatching(this, this.controller);

  this.horizontalOffset(this.horizontalOffset_ + horizontalPixelOffset);
  var startIndex = this.controller.startIndex();
  var heightCache = this.controller.getHeightCache();
  var verticalOffset = this.controller.verticalOffset();

  var totalVerticalStartOffset = startIndex ? heightCache[startIndex - 1] : 0;
  totalVerticalStartOffset += (verticalOffset + verticalPixelOffset);

  this.controller.scrollTo(/** @type {number} */ (totalVerticalStartOffset));

  anychart.core.Base.resumeSignalsDispatchingTrue(this, this.controller);
};


/**
 * @override
 */
anychart.core.ui.DataGrid.prototype.boundsInvalidated = function() {
  var headerPath = this.getHeaderPath_();

  var headerHeight = /** @type {number} */ (this.pixelBoundsCache.top + this.headerHeight());
  headerPath
      .clear()
      .moveTo(this.pixelBoundsCache.left, this.pixelBoundsCache.top)
      .lineTo(this.pixelBoundsCache.left + this.pixelBoundsCache.width, this.pixelBoundsCache.top)
      .lineTo(this.pixelBoundsCache.left + this.pixelBoundsCache.width, headerHeight)
      .lineTo(this.pixelBoundsCache.left, headerHeight)
      .close();

  var splitterWidth = anychart.utils.extractThickness(/** @type {acgraph.vector.Stroke|string} */ (this.columnStroke_));

  var totalWidth = 0;

  for (var i = 0, l = this.columns_.length; i < l; i++) {
    var col = this.columns_[i];
    if (col && col.enabled()) {
      var colWidth = col.calculateBounds().width; //We need pixel value here.
      totalWidth += (colWidth + splitterWidth);
    }
  }

  this.totalGridsWidth = totalWidth;
  //Invalidate DATA_GRID_GRIDS to redraw horizontal scroll correctly.
  this.invalidate(anychart.ConsistencyState.DATA_GRID_GRIDS);
};


/**
 * @override
 */
anychart.core.ui.DataGrid.prototype.appearanceInvalidated = function() {
  this.getHeaderPath_().fill(this.headerFill_);

  this.forEachVisibleColumn_(function(col) {
    col.invalidate(anychart.ConsistencyState.APPEARANCE);
    col.draw();
  });
};


/**
 * @override
 */
anychart.core.ui.DataGrid.prototype.positionInvalidated = function() {
  this.forEachVisibleColumn_(function(col) {
    col.invalidate(anychart.ConsistencyState.DATA_GRID_COLUMN_POSITION); //Column takes data from own data grid.
    col.draw();
  });
};


/**
 * @override
 */
anychart.core.ui.DataGrid.prototype.specialInvalidated = function() {
  /*
    This actually places a columns horizontally depending on previous column's width.
   */
  if (this.hasInvalidationState(anychart.ConsistencyState.DATA_GRID_GRIDS)) {
    var left, top;

    var totalWidth = 0;
    left = this.pixelBoundsCache.left;
    top = this.pixelBoundsCache.top;
    var splitterWidth = anychart.utils.extractThickness(/** @type {acgraph.vector.Stroke|string} */ (this.columnStroke_));

    var enabledColumns = [];
    var i, l, col, colWidth;

    for (i = 0, l = this.columns_.length; i < l; i++) {
      col = this.columns_[i];
      if (col) {
        if (col.enabled()) {
          colWidth = col.calculateBounds().width; //We need pixel value here.
          totalWidth += (colWidth + splitterWidth);
          enabledColumns.push(col);
        } else {
          col.draw(); //Clearing cons.state "enabled".
        }
      }
    }

    this.totalGridsWidth = totalWidth;

    if (this.pixelBoundsCache.width > this.totalGridsWidth) this.horizontalOffset_ = 0;

    this.horizontalOffset_ = goog.math.clamp(this.horizontalOffset_, 0, Math.abs(this.pixelBoundsCache.width - this.totalGridsWidth));

    var colLeft = -this.horizontalOffset_;

    for (i = 0, l = enabledColumns.length; i < l; i++) {
      col = enabledColumns[i];
      col.suspendSignalsDispatching();
      col.position({x: colLeft, y: 0}); //Column width and height are already set here.
      col.height(this.pixelBoundsCache.height);
      colWidth = col.calculateBounds().width; //We need pixel value here.
      var splitter = this.splitters_[i];

      var add = colWidth;

      if (splitter) { //Amount of splitters is (amountOfColumns - 1).
        splitter.suspendSignalsDispatching();
        splitter.stroke(this.columnStroke_);

        splitter.enabled(true);

        add += splitterWidth;
        var boundsWidth = add + this.pixelBoundsCache.width;

        var splitterBounds = {
          left: (left + colLeft + anychart.core.ui.DataGrid.MIN_COLUMN_WIDTH),
          top: top,
          width: boundsWidth,
          height: this.pixelBoundsCache.height
        };

        splitter
            .bounds(splitterBounds)
            .handlePositionChange(false)
            .position(colWidth - anychart.core.ui.DataGrid.MIN_COLUMN_WIDTH)
            .resumeSignalsDispatching(false)
            .draw()
            .handlePositionChange(true);
      }

      colLeft += add;
      col.resumeSignalsDispatching(false);
      col.draw();
    }

    this.redrawPosition = true;

    while (i < this.splitters_.length) { //This disables all remaining splitters.
      if (!this.splitters_[i].enabled()) break;
      this.splitters_[i].enabled(false);
      i++;
    }

    if (this.horizontalScrollBar_) {
      var contentBoundsSimulation = new anychart.math.Rect(this.pixelBoundsCache.left - this.horizontalOffset_, 0, this.totalGridsWidth, 0);
      var visibleBoundsSimulation = new anychart.math.Rect(this.pixelBoundsCache.left, 0, this.pixelBoundsCache.width, 0);

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
};


/** @inheritDoc */
anychart.core.ui.DataGrid.prototype.rowMouseDown = function(evt) {
  this.mouseDown(evt);
};


/**
 * Actually reacts on mouse down.
 * @param {anychart.core.MouseEvent|Object} evt - Event object.
 */
anychart.core.ui.DataGrid.prototype.mouseDown = function(evt) {
  if (this.editable) this.draggingItem = evt['item'];
};


/**
 * @inheritDoc
 */
anychart.core.ui.DataGrid.prototype.mouseOutMove = function(event) {
  if (this.dragging && (this.scrollOffsetX || this.scrollOffsetY)) {
    var scrollX = 0;
    var scrollY = 0;
    if (this.scrollOffsetX)
      scrollX = this.scrollOffsetX > 0 ? anychart.core.ui.BaseGrid.SCROLL_STEP : -anychart.core.ui.BaseGrid.SCROLL_STEP;

    if (this.scrollOffsetY)
      scrollY = this.scrollOffsetY > 0 ? anychart.core.ui.BaseGrid.SCROLL_STEP : -anychart.core.ui.BaseGrid.SCROLL_STEP;

    this.scroll(scrollX, scrollY);
  }
};


/** @inheritDoc */
anychart.core.ui.DataGrid.prototype.serialize = function() {
  var json = anychart.core.ui.DataGrid.base(this, 'serialize');

  json['columnStroke'] = anychart.color.serialize(this.columnStroke_);
  json['headerFill'] = anychart.color.serialize(this.headerFill_);
  json['horizontalOffset'] = this.horizontalOffset();

  json['columns'] = [];

  for (var i = 0; i < this.columns_.length; i++) {
    var col = this.columns_[i];
    json['columns'].push(col ? col.serialize() : false);
  }

  if (this.horizontalScrollBar_)
    json['horizontalScrollBar'] = this.horizontalScrollBar().serialize();

  return json;
};


/** @inheritDoc */
anychart.core.ui.DataGrid.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.ui.DataGrid.base(this, 'setupByJSON', config, opt_default);

  this.columnStroke(config['columnStroke']);
  this.headerFill(config['headerFill']);
  this.horizontalOffset(config['horizontalOffset']);

  if ('defaultColumnSettings' in config)
    this.defaultColumnSettings(config['defaultColumnSettings']);

  if ('columns' in config) {
    for (var i = 0, l = config['columns'].length; i < l; i++) {
      var col = config['columns'][i];
      if (col) this.column(i, col);
    }
  }

  if ('horizontalScrollBar' in config)
    this.horizontalScrollBar(config['horizontalScrollBar']);
};


/** @inheritDoc */
anychart.core.ui.DataGrid.prototype.disposeInternal = function() {
  goog.dispose(this.horizontalScrollBar_);
  this.horizontalScrollBar_ = null;
  anychart.core.ui.DataGrid.base(this, 'disposeInternal');
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
  anychart.core.ui.DataGrid.Column.base(this, 'constructor');

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
   * NOTE:
   *  This path is added here despite we already have headerPath in data grid.
   *  It will be filled with the same fill as DG's header path.
   *  These paths have different purposes:
   *  - this title path covers labels during the scrolling.
   *  - data grid's headerPath just lingers a header in data grid's width to fill a visible gap in gantt diagram.
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
   * @type {function(anychart.data.Tree.DataItem=):string}
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
    anychart.ConsistencyState.DATA_GRID_COLUMN_POSITION |
    anychart.ConsistencyState.DATA_GRID_COLUMN_BUTTON_CURSOR;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.ui.DataGrid.Column.prototype.SUPPORTED_SIGNALS = anychart.core.VisualBase.prototype.SUPPORTED_SIGNALS;


/**
 * Labels factory z-index.
 * @type {number}
 */
anychart.core.ui.DataGrid.Column.LF_Z_INDEX = 0;


/**
 * Buttons z-index.
 * @type {number}
 */
anychart.core.ui.DataGrid.Column.BUTTONS_Z_INDEX = 10;


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

    if (goog.isDef(formatter)) this.textFormatter(function() {
      var item = this['item'];
      return formatter(item.get(fieldName));
    });

    if (goog.isDef(width)) this.width(width).defaultWidth(width);

    if (goog.isDef(textStyle)) this.cellTextSettings().textSettings(textStyle);

    this.resumeSignalsDispatching(true);
  }
  return this;
};


/**
 * Default function that returns a text value for the cell by data item.
 * @param {anychart.data.Tree.DataItem=} opt_item - Context.
 * @return {string} - Text value.
 * @private
 */
anychart.core.ui.DataGrid.Column.prototype.defaultTextFormatter_ = function(opt_item) {
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
 * @param {(function(anychart.data.Tree.DataItem=):string)=} opt_value - Function to be set.
 * @return {(function(anychart.data.Tree.DataItem=):string|anychart.core.ui.DataGrid.Column)} - Current function or itself
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
    this.labelsFactory_.setParentEventTarget(this.dataGrid_.getBase());
    this.labelsFactory_.zIndex(anychart.core.ui.DataGrid.Column.LF_Z_INDEX);
    this.labelsFactory_.listenSignals(this.labelsInvalidated_, this);

    this.labelsFactory_.setParentEventTarget(this);

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
        .margin(0);
    this.title_['textWrap'](anychart.enums.TextWrap.NO_WRAP);
    this.title_['hAlign'](anychart.enums.HAlign.CENTER);
    this.title_['vAlign'](anychart.enums.VAlign.MIDDLE);
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
    this.titlePath_.fill(/** @type {acgraph.vector.Fill} */ (this.dataGrid_.headerFill()));
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
 * Getter/setter for buttonCursor.
 * @param {(anychart.enums.Cursor|string)=} opt_value buttonCursor.
 * @return {anychart.enums.Cursor|anychart.core.ui.DataGrid.Column} buttonCursor or self for chaining.
 */
anychart.core.ui.DataGrid.Column.prototype.buttonCursor = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeCursor(opt_value, anychart.enums.Cursor.DEFAULT);
    if (this.buttonCursor_ != opt_value) {
      this.buttonCursor_ = opt_value;
      this.invalidate(anychart.ConsistencyState.DATA_GRID_COLUMN_BUTTON_CURSOR, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.buttonCursor_;
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
      var headerHeight = /** @type {number} */ (this.dataGrid_.headerHeight());

      this.getTitlePath_()
          .clear()
          .moveTo(this.pixelBoundsCache_.left, this.pixelBoundsCache_.top)
          .lineTo(this.pixelBoundsCache_.left + this.pixelBoundsCache_.width, this.pixelBoundsCache_.top)
          .lineTo(this.pixelBoundsCache_.left + this.pixelBoundsCache_.width, this.pixelBoundsCache_.top + headerHeight)
          .lineTo(this.pixelBoundsCache_.left, this.pixelBoundsCache_.top + headerHeight)
          .close();

      var titleParentBounds = new anychart.math.Rect(this.pixelBoundsCache_.left, this.pixelBoundsCache_.top,
          this.pixelBoundsCache_.width, headerHeight);

      this.title_.suspendSignalsDispatching();
      this.title_.parentBounds(titleParentBounds);
      this.title_.height(headerHeight);
      this.title_.resumeSignalsDispatching(false);
      this.invalidate(anychart.ConsistencyState.DATA_GRID_COLUMN_TITLE);

      var data = this.dataGrid_.getVisibleItems();
      var startIndex = /** @type {number} */(this.dataGrid_.startIndex());
      var endIndex = /** @type {number} */(this.dataGrid_.endIndex());
      var verticalOffset = this.dataGrid_.verticalOffset();

      var totalTop = this.pixelBoundsCache_.top + headerHeight + 1 - verticalOffset;

      this.cellTextSettings().suspendSignalsDispatching();
      this.cellTextSettings().clear();

      var paddingLeft = anychart.utils.normalizeSize(/** @type {number|string} */ (this.cellTextSettings().padding().getOption('left')),
          this.pixelBoundsCache_.width);
      var paddingRight = anychart.utils.normalizeSize(/** @type {(number|string)} */ (this.cellTextSettings().padding().getOption('right')),
          this.pixelBoundsCache_.width);
      var paddingTop = anychart.utils.normalizeSize(/** @type {(number|string)} */ (this.cellTextSettings().padding().getOption('top')),
          this.pixelBoundsCache_.height);
      var paddingBottom = anychart.utils.normalizeSize(/** @type {(number|string)} */ (this.cellTextSettings().padding().getOption('bottom')),
          this.pixelBoundsCache_.height);

      var counter = -1;
      for (var i = startIndex; i <= endIndex; i++) {
        var item = data[i];
        if (!item) break;

        var height = this.dataGrid_.controller.getItemHeight(item);
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
            button.zIndex(anychart.core.ui.DataGrid.Column.BUTTONS_Z_INDEX);
            button.container(this.getCellsLayer_());
          }

          button.suspendSignalsDispatching();

          var top = totalTop + ((height - anychart.core.ui.DataGrid.DEFAULT_EXPAND_COLLAPSE_BUTTON_SIDE) / 2);

          var pixelShift = (acgraph.type() === acgraph.StageType.SVG) ? .5 : 0;
          button
              .enabled(true)
              .cursor(/** @type {anychart.enums.Cursor} */ (this.buttonCursor()))
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

        var textFormatter = this.dataGrid_.createFormatProvider(item);

        var labelText = this.textFormatter_.call(textFormatter, item);

        var label = this.cellTextSettings().add({'value': labelText},
            {'value': {'x': this.pixelBoundsCache_.left, 'y': totalTop}});

        label.suspendSignalsDispatching();

        label.height(height);
        label.width(this.pixelBoundsCache_.width);
        label.padding(paddingTop, paddingRight, paddingBottom, padding + addButton);

        this.cellTextSettingsOverrider_(label, item);
        label.resumeSignalsDispatching(false);
        label.draw();

        totalTop = (newTop + this.dataGrid_.rowStrokeThickness);
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
      this.getTitlePath_().fill(/** @type {acgraph.vector.Fill} */ (this.dataGrid_.headerFill()));
      this.invalidate(anychart.ConsistencyState.DATA_GRID_COLUMN_TITLE);
      this.markConsistent(anychart.ConsistencyState.APPEARANCE);
    }

    if (this.hasInvalidationState(anychart.ConsistencyState.DATA_GRID_COLUMN_TITLE)) {
      this.title_.draw();
      this.markConsistent(anychart.ConsistencyState.DATA_GRID_COLUMN_TITLE);
    }

    if (this.hasInvalidationState(anychart.ConsistencyState.DATA_GRID_COLUMN_BUTTON_CURSOR)) {
      if (this.buttons_ && this.buttons_.length) {
        for (i = 0; i < this.buttons_.length; i++) {
          button = this.buttons_[i];
          button.cursor(/** @type {anychart.enums.Cursor} */ (this.buttonCursor()));
          if (button.enabled()) button.draw();
        }
      }
      this.markConsistent(anychart.ConsistencyState.DATA_GRID_COLUMN_BUTTON_CURSOR);
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
  var json = anychart.core.ui.DataGrid.Column.base(this, 'serialize');

  json['width'] = this.width_;
  if (goog.isDef(this.defaultWidth_)) json['defaultWidth'] = this.defaultWidth_;
  json['collapseExpandButtons'] = this.collapseExpandButtons_;
  json['depthPaddingMultiplier'] = this.depthPaddingMultiplier_;
  json['cellTextSettings'] = this.cellTextSettings().serialize();
  json['title'] = this.title_.serialize();
  json['buttonCursor'] = this.buttonCursor_;

  if (this.textFormatter_ != this.defaultTextFormatter_) {
    anychart.core.reporting.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Data Grid Column textFormatter']
    );
  }

  if (this.cellTextSettingsOverrider_ != this.defaultCellTextSettingsOverrider_) {
    anychart.core.reporting.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Data Grid Column cellTextSettingsOverrider']
    );
  }

  return json;
};


/** @inheritDoc */
anychart.core.ui.DataGrid.Column.prototype.setupByJSON = function(json, opt_default) {
  anychart.core.ui.DataGrid.Column.base(this, 'setupByJSON', json, opt_default);

  this.width(json['width']);
  this.defaultWidth(json['defaultWidth']);
  this.collapseExpandButtons(json['collapseExpandButtons']);
  this.depthPaddingMultiplier(json['depthPaddingMultiplier']);
  this.cellTextSettings(json['cellTextSettings']);
  this.buttonCursor(json['buttonCursor']);

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
  anychart.core.ui.DataGrid.Button.base(this, 'constructor');

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

  //this.backgroundPath.stroke('red');

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
  anychart.core.ui.DataGrid.Button.base(this, 'handleMouseUp', event);
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
/** @suppress {deprecated} */
(function() {
  var proto = anychart.core.ui.DataGrid.prototype;
  proto['backgroundFill'] = proto.backgroundFill;
  proto['cellFill'] = proto.cellFill; //deprecated
  proto['cellEvenFill'] = proto.cellEvenFill; //deprecated
  proto['cellOddFill'] = proto.cellOddFill; //deprecated
  proto['rowFill'] = proto.rowFill;
  proto['rowEvenFill'] = proto.rowEvenFill;
  proto['rowOddFill'] = proto.rowOddFill;
  proto['rowHoverFill'] = proto.rowHoverFill;
  proto['rowSelectedFill'] = proto.rowSelectedFill;
  proto['editing'] = proto.editing;

  proto['column'] = proto.column;
  proto['columnStroke'] = proto.columnStroke;

  proto['data'] = proto.data;
  proto['startIndex'] = proto.startIndex;
  proto['endIndex'] = proto.endIndex;
  proto['getVisibleItems'] = proto.getVisibleItems;
  proto['horizontalScrollBar'] = proto.horizontalScrollBar;
  proto['horizontalOffset'] = proto.horizontalOffset;
  proto['verticalOffset'] = proto.verticalOffset;
  proto['tooltip'] = proto.tooltip;
  proto['draw'] = proto.draw;
  proto['editStructurePreviewFill'] = proto.editStructurePreviewFill;
  proto['editStructurePreviewStroke'] = proto.editStructurePreviewStroke;
  proto['editStructurePreviewDashStroke'] = proto.editStructurePreviewDashStroke;

  proto = anychart.core.ui.DataGrid.Column.prototype;
  proto['title'] = proto.title;
  proto['width'] = proto.width;
  proto['defaultWidth'] = proto.defaultWidth;
  proto['enabled'] = proto.enabled;
  proto['textFormatter'] = proto.textFormatter;
  proto['cellTextSettings'] = proto.cellTextSettings;
  proto['cellTextSettingsOverrider'] = proto.cellTextSettingsOverrider;
  proto['collapseExpandButtons'] = proto.collapseExpandButtons;
  proto['depthPaddingMultiplier'] = proto.depthPaddingMultiplier;
  proto['setColumnFormat'] = proto.setColumnFormat;
  proto['buttonCursor'] = proto.buttonCursor;
  proto['draw'] = proto.draw;
})();
