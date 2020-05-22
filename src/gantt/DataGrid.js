goog.provide('anychart.ganttModule.DataGrid');
goog.provide('anychart.standalones.DataGrid');

goog.require('acgraph');
goog.require('anychart.core.VisualBase');
goog.require('anychart.core.reporting');
goog.require('anychart.core.ui.Button');
goog.require('anychart.core.ui.Label');
goog.require('anychart.core.ui.LabelsFactory');
goog.require('anychart.core.ui.SimpleSplitter');
goog.require('anychart.core.ui.Title');
goog.require('anychart.enums');
goog.require('anychart.ganttModule.BaseGrid');
goog.require('anychart.ganttModule.Column');
goog.require('anychart.ganttModule.Controller');
goog.require('anychart.ganttModule.DataGridButton');
goog.require('anychart.ganttModule.ScrollBar');
goog.require('anychart.math.Rect');
goog.require('anychart.treeDataModule.Tree');
goog.require('anychart.ui.EditInput');
goog.require('anychart.utils');
goog.require('goog.date.UtcDateTime');
goog.require('goog.events');
goog.require('goog.i18n.DateTimeFormat');
goog.require('goog.string');



/**
 * Data grid implementation.
 * @param {anychart.ganttModule.Controller=} opt_controller - Controller to be set. See full description in parent class.
 * TODO (A.Kudryavtsev): Do we need second parameter here? Basically, DG doesn't care whether it is resource or not.
 * @constructor
 * @extends {anychart.ganttModule.BaseGrid}
 */
anychart.ganttModule.DataGrid = function(opt_controller) {
  anychart.ganttModule.DataGrid.base(this, 'constructor', opt_controller);
  this.addThemes('defaultDataGrid');

  /**
   * Array of columns.
   * @type {Array.<anychart.ganttModule.Column>}
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

  /**
   *
   * @type {anychart.ui.EditInput}
   * @private
   */
  this.editInput_ = null;

  /**
   *
   * @type {anychart.ganttModule.Column}
   * @private
   */
  this.editColumn_ = null;

  /**
   *
   * @type {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem}
   * @private
   */
  this.editItem_ = null;

  this.partialLabels = {
    first: NaN,
    last: NaN,
    count: NaN,
    reset: true
  };

  /**
   *
   * @type {Array.<number>}
   * @private
   */
  this.columnsWidthsCache_ = [];

  var fixedColumnsBeforeInvalidationHook = function() {
    this.interactivityHandler.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
  };

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['columnStroke', anychart.ConsistencyState.DATA_GRID_GRIDS, anychart.Signal.NEEDS_REDRAW],
    ['headerFill', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['fixedColumns', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW, 0, fixedColumnsBeforeInvalidationHook],
    ['onEditStart', 0, 0],
    ['onEditEnd', 0, 0]
  ]);

  var dgTheme = this.themeSettings;
  if ('columns' in dgTheme) {
    for (var i = 0; i < dgTheme['columns'].length; i++) {
      var columnConfig = dgTheme['columns'][i];
      if (columnConfig) {
        this.columnInternal_(i);
      }
    }
  }
};
goog.inherits(anychart.ganttModule.DataGrid, anychart.ganttModule.BaseGrid);


/**
 * Supported signals.
 * @type {number}
 */
anychart.ganttModule.DataGrid.SUPPORTED_SIGNALS = anychart.ganttModule.BaseGrid.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistence states.
 * @type {number}
 */
anychart.ganttModule.DataGrid.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.ganttModule.BaseGrid.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.DATA_GRID_GRIDS;


/**
 * @typedef {{
 *  formatter: function(*): string,
 *  textStyle: Object,
 *  width: number
 * }}
 */
anychart.ganttModule.DataGrid.ColumnFormat;


/**
 * Default left padding in column.
 * @type {number}
 */
anychart.ganttModule.DataGrid.DEFAULT_PADDING = 5;


/**
 * Minimal column width.
 * @type {number}
 */
anychart.ganttModule.DataGrid.MIN_COLUMN_WIDTH = 20;


/**
 * By default, first column is column of straight numeration.
 * Has a shortest default width.
 * @type {number}
 */
anychart.ganttModule.DataGrid.NUMBER_COLUMN_WIDTH = 50;


/**
 * By default, second column of data grid is widest, contains expand/collapse button and some text that determines general
 * row information (name by default).
 * Has a longest default width.
 * @type {number}
 */
anychart.ganttModule.DataGrid.NAME_COLUMN_WIDTH = 170;


/**
 * Default width of all other columns.
 * @type {number}
 */
anychart.ganttModule.DataGrid.DEFAULT_COLUMN_WIDTH = 90;


/**
 * Average maximal allowed labels count at once
 * to be processed.
 * @type {number}
 */
anychart.ganttModule.DataGrid.MAX_LABELS_AT_ONCE = 300;


/**
 * Gets column format by name.
 * NOTE: Presets don't contain 'textStyle' field because default text settings are in use.
 * @param {anychart.enums.ColumnFormats} formatName - Format to be created.
 * @return {anychart.ganttModule.DataGrid.ColumnFormat} - Related format.
 */
anychart.ganttModule.DataGrid.prototype.getColumnFormatByName = function(formatName) {
  if (!this.formatsCache_[formatName]) {
    switch (formatName) {
      case anychart.enums.ColumnFormats.DIRECT_NUMBERING:
        this.formatsCache_[formatName] = {
          'formatter': this.formatterAsIs_,
          'width': anychart.ganttModule.DataGrid.NUMBER_COLUMN_WIDTH
        };
        break;

      case anychart.enums.ColumnFormats.TEXT:
        this.formatsCache_[formatName] = {
          'formatter': this.formatterAsIs_,
          'width': anychart.ganttModule.DataGrid.NAME_COLUMN_WIDTH
        };
        break;

      case anychart.enums.ColumnFormats.FINANCIAL:
        this.formatsCache_[formatName] = {
          'formatter': this.formatterFinancial_,
          'textStyle': {'hAlign': 'right'},
          'width': anychart.ganttModule.DataGrid.DEFAULT_COLUMN_WIDTH
        };
        break;

      case anychart.enums.ColumnFormats.PERCENT:
        this.formatsCache_[formatName] = {
          'formatter': this.formatterPercent_,
          'textStyle': {'hAlign': 'right'},
          'width': anychart.ganttModule.DataGrid.NUMBER_COLUMN_WIDTH
        };
        break;

      case anychart.enums.ColumnFormats.DATE_COMMON_LOG:
        this.formatsCache_[formatName] = {
          'formatter': this.createDateTimeFormatter_('dd/MMM/yyyy'),
          'textStyle': {'hAlign': 'right'},
          'width': anychart.ganttModule.DataGrid.DEFAULT_COLUMN_WIDTH
        };
        break;

      case anychart.enums.ColumnFormats.DATE_ISO_8601:
        this.formatsCache_[formatName] = {
          'formatter': this.createDateTimeFormatter_('yyyy-MM-dd'),
          'textStyle': {'hAlign': 'right'},
          'width': anychart.ganttModule.DataGrid.DEFAULT_COLUMN_WIDTH
        };
        break;

      case anychart.enums.ColumnFormats.DATE_US_SHORT:
        this.formatsCache_[formatName] = {
          'formatter': this.createDateTimeFormatter_('M/dd/yyyy'),
          'textStyle': {'hAlign': 'right'},
          'width': anychart.ganttModule.DataGrid.DEFAULT_COLUMN_WIDTH
        };
        break;

      case anychart.enums.ColumnFormats.DATE_DMY_DOTS:
        this.formatsCache_[formatName] = {
          'formatter': this.createDateTimeFormatter_('dd.MM.yy'),
          'textStyle': {'hAlign': 'right'},
          'width': anychart.ganttModule.DataGrid.DEFAULT_COLUMN_WIDTH
        };
        break;

      case anychart.enums.ColumnFormats.SHORT_TEXT:
      default:
        this.formatsCache_[formatName] = {
          'formatter': this.formatterAsIs_,
          'width': anychart.ganttModule.DataGrid.DEFAULT_COLUMN_WIDTH
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
anychart.ganttModule.DataGrid.prototype.formatterAsIs_ = function(val) {
  return goog.isDef(val) ? String(val) : '';
};


/**
 * Financial formatter for column formats.
 * @param {*} val - Incoming value. If value is non number, it will be returned as is in string representation.
 * @return {string} - Value turned to string like '15,024,042.00'.
 * @private
 */
anychart.ganttModule.DataGrid.prototype.formatterFinancial_ = function(val) {
  return goog.isDef(val) ? (goog.isNumber(val) ? val.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,') : String(val)) : '';
};


/**
 * Percent formatter for column formats.
 * @param {*} val - Incoming value. If value is non number, it will be returned as is in string representation.
 * @return {string} - Value turned to string like '15,024,042.00'.
 * @private
 */
anychart.ganttModule.DataGrid.prototype.formatterPercent_ = function(val) {
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
anychart.ganttModule.DataGrid.prototype.createDateTimeFormatter_ = function(pattern) {
  return function(value) {
    if (goog.isNumber(value)) {
      var dateTimeFormat = new goog.i18n.DateTimeFormat(pattern);
      return dateTimeFormat.format(new goog.date.UtcDateTime(new Date(value)));
    } else {
      return goog.isDef(value) ? String(value) : '';
    }
  };
};


/**
 * Getter/setter for default column settings.
 * @param {Object=} opt_val - Object with settings.
 * @return {Object} - Current value or empty object.
 */
anychart.ganttModule.DataGrid.prototype.defaultColumnSettings = function(opt_val) {
  if (goog.isDef(opt_val)) {
    this.defaultColumnSettings_ = opt_val;
    return this;
  }
  return this.defaultColumnSettings_ || {};
};


//region --- Coloring
/**
 * @type {!Object.<anychart.core.settings.PropertyDescriptor>}
 */
anychart.ganttModule.DataGrid.DG_DESCRIPTORS = (function() {
  /** @type {!Object.<anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'columnStroke', anychart.core.settings.strokeNormalizer],
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'headerFill', anychart.core.settings.fillNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'onEditStart', anychart.core.settings.functionNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'onEditEnd', anychart.core.settings.functionNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'fixedColumns', anychart.core.settings.booleanNormalizer]
  ]);
  return map;
})();
anychart.core.settings.populate(anychart.ganttModule.DataGrid, anychart.ganttModule.DataGrid.DG_DESCRIPTORS);


/**
 * Resolve header fill.
 * @return {acgraph.vector.Fill}
 */
anychart.ganttModule.DataGrid.prototype.resolveHeaderFill = function() {
  return /** @type {acgraph.vector.Fill} */(this.getOption('headerFill'));
};


//endregion
/**
 * Getter for this.headerPath_.
 * @return {acgraph.vector.Path}
 * @private
 */
anychart.ganttModule.DataGrid.prototype.getHeaderPath_ = function() {
  if (!this.headerPath_) {
    this.headerPath_ = acgraph.path();
    this.getCellsLayer().addChildAt(this.headerPath_, 0);
    this.headerPath_.stroke(null);
  }
  return this.headerPath_;
};


/**
 * Goes through all columns and calls passed function for each visible column (if column exists and enabled).
 * @param {Function} fn - Function to be applied to column. Signature:
 *   function(this: opt_obj, anychart.ganttModule.Column, number, ...[*]):void.
 * @param {*=} opt_obj - Object to be used as 'this'.
 * @param {...*} var_args optional arguments for the fn.
 * @private
 */
anychart.ganttModule.DataGrid.prototype.forEachVisibleColumn_ = function(fn, opt_obj, var_args) {
  var counter = -1;
  for (var i = 0, l = this.columns_.length; i < l; i++) {
    var column = this.columns_[i];
    if (column && column.enabled() && !column.isDisposed()) {
      counter++;
      var args = [column, counter];
      args.push.apply(args, goog.array.slice(arguments, 2));
      fn.apply(opt_obj || this, args);
    }
  }
};


/**
 * Collapses data item.
 *
 * Added by ENV-1410: also dispatches detached event to load additional data
 * NOTE: Do not export.
 * @param {number} itemIndex - Index of data item.
 * @param {boolean} state - State to be set.
 * @return {anychart.ganttModule.DataGrid} - Itself for method chaining.
 */
anychart.ganttModule.DataGrid.prototype.collapseExpandItem = function(itemIndex, state) {
  var item = this.controller.getVisibleItems()[itemIndex];

  if (item) {
    var eventObj = {
      'item': item,
      'collapsed': state
    };

    if (item.get(anychart.enums.GanttDataFields.IS_LOADABLE) && !item.numChildren()) {
      /*
        ENV-1410:

        This condition is applied when the item is declared as parent item, but doesn't
        contain children.

        This item becomes loadable and related event to load additional data must be
        received by listener.
       */

      eventObj['type'] = anychart.enums.EventType.GANTT_LOAD_DATA;

      state = goog.isDef(state) ? state : false;

      item.meta(anychart.enums.GanttDataFields.COLLAPSED, state);
      /** @type {anychart.ganttModule.Chart} */ (this.interactivityHandler).dispatchDetachedEvent(eventObj);
    } else if (anychart.ganttModule.BaseGrid.isParent(item)) {
      // Regular expand/collapse condition and action.

      eventObj['type'] = anychart.enums.EventType.ROW_COLLAPSE_EXPAND;
      if (this.interactivityHandler.dispatchEvent(eventObj))
        item.meta(anychart.enums.GanttDataFields.COLLAPSED, state);
    }
  }

  return this;
};


/**
 * Gets/set horizontal offset.
 * @param {number=} opt_value - Value to be set.
 * @return {(number|anychart.ganttModule.DataGrid)} - Current value or itself for method chaining.
 */
anychart.ganttModule.DataGrid.prototype.horizontalOffset = function(opt_value) {
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
anychart.ganttModule.DataGrid.prototype.addSplitter_ = function() {
  var columnsCount = 0; //Calculating how many columns are currently visible.
  for (var i = 0, l = this.columns_.length; i < l; i++) {
    if (this.columns_[i] && this.columns_[i].enabled()) columnsCount++;
  }

  //NOTE: We call this method on every add-new-column action, that's why
  //(columnsCount > this.splitters_.length) is totally the same as (columnsCount - 1 == this.splitters_.length).
  if (columnsCount > this.splitters_.length) {
    var newSplitter = new anychart.core.ui.SimpleSplitter();
    var splitterStroke = /** @type {acgraph.vector.Stroke} */(anychart.ganttModule.BaseGrid.getColorResolver('columnStroke', anychart.enums.ColorType.STROKE, false)(this, 0));
    newSplitter.stroke(splitterStroke);
    newSplitter.defaultStroke = splitterStroke;
    newSplitter.container(this.getClipLayer());
    newSplitter.listenSignals(function() {
      newSplitter.draw();
      if (this.getOption('fixedColumns')) {
        // Will be invalidated only if interactivityHandler is chart.
        this.interactivityHandler.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
      }
    }, this);
    newSplitter.listen(anychart.enums.EventType.SPLITTER_POSITION_CHANGE, goog.bind(this.splitterChangedHandler_, this, columnsCount - 1));
    newSplitter.listen(acgraph.events.EventType.DBLCLICK, goog.bind(this.splitterDblClickHandler_, this, columnsCount - 1));
    newSplitter.listen(anychart.enums.EventType.DRAG_START, goog.bind(this.denyDragging, this, true));
    newSplitter.listen(anychart.enums.EventType.DRAG, goog.bind(this.denyDragging, this, true));
    // newSplitter.listen(anychart.enums.EventType.DRAG_END, goog.bind(this.denyDragging, this, false));
    this.splitters_.push(newSplitter);
  }
};


/**
 * Gets column by index or creates a new one if column doesn't exist yet.
 * If works like setter, sets a column by index.
 * @param {(number|anychart.ganttModule.Column|string)=} opt_indexOrValue - Column index or column.
 * @param {(anychart.ganttModule.Column|Object)=} opt_value - Column to be set.
 * @return {(anychart.ganttModule.Column|anychart.ganttModule.DataGrid)} - Column by index of itself for method chaining if used
 *  like setter.
 */
anychart.ganttModule.DataGrid.prototype.column = function(opt_indexOrValue, opt_value) {
  return this.columnInternal_(opt_indexOrValue, opt_value);
};


/**
 * Adds column.
 * @param {Object=} opt_config - Column config.
 * @return {anychart.ganttModule.Column}
 */
anychart.ganttModule.DataGrid.prototype.addColumn = function(opt_config) {
  return /** @type {anychart.ganttModule.Column} */ (this.column(this.columns_.length, opt_config));
};


/**
 * Extracts splitter width.
 * @return {number}
 */
anychart.ganttModule.DataGrid.prototype.getSplitterWidth = function() {
  var colorResolver = anychart.ganttModule.BaseGrid.getColorResolver('columnStroke', anychart.enums.ColorType.STROKE, false);
  var stroke = /** @type {acgraph.vector.Stroke|string} */ (colorResolver(this, 0));
  return anychart.utils.extractThickness(stroke);
};


/**
 * Calculates sum of columns width.
 * @param {boolean=} opt_skipLastColumn - Whether to get the sum without last column.
 * @return {number}
 */
anychart.ganttModule.DataGrid.prototype.getTotalColumnsWidth = function(opt_skipLastColumn) {
  var splitterWidth = this.getSplitterWidth();

  var rv = 0;
  var lastTrackedWidth = 0;
  for (var i = 0, l = this.columns_.length; i < l; i++) {
    var col = this.columns_[i];
    if (col && col.enabled() && !col.isDisposed()) {
      var width = col['width']();
      if (anychart.utils.isPercent(width)) {
        width = anychart.ganttModule.DataGrid.DEFAULT_COLUMN_WIDTH;
        col.resetBounds();
        col.suspendSignalsDispatching();
        col.resumeSignalsDispatching(false);
      }
      col['width'](width);

      lastTrackedWidth = width + splitterWidth;
      rv += lastTrackedWidth;
    }
  }

  rv = rv - (opt_skipLastColumn ? lastTrackedWidth : 0);
  return rv;
};


/**
 * Gets column by index or creates a new one if column doesn't exist yet.
 * If works like setter, sets a column by index.
 * @param {(number|anychart.ganttModule.Column|string)=} opt_indexOrValue - Column index or column.
 * @param {(anychart.ganttModule.Column|Object)=} opt_value - Column to be set.
 * @param {boolean=} opt_default - If is default config.
 * @return {(anychart.ganttModule.Column|anychart.ganttModule.DataGrid)} - Column by index of itself for method chaining if used
 *  like setter.
 *  @private
 */
anychart.ganttModule.DataGrid.prototype.columnInternal_ = function(opt_indexOrValue, opt_value, opt_default) {
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
    column = new anychart.ganttModule.Column(this, index);
    var dgTheme = this.themeSettings;
    column.addThemes(dgTheme['defaultColumnSettings']);
    if ('columns' in dgTheme) {
      column.addThemes(dgTheme['columns'][index]);
    }
    column.listenSignals(this.columnInvalidated_, this);
    // column.labels().installStyle();
    anychart.measuriator.register(column);
    newColumn = true;
  }

  if (goog.isDef(value)) {
    var conf = anychart.utils.instanceOf(value, anychart.ganttModule.Column) ? value.serialize() : value;
    column.setupInternal(!!opt_default, conf);
    if (column.enabled()) column.container(this.getContentLayer());
    this.columns_[index] = column;
    this.invalidate(anychart.ConsistencyState.DATA_GRID_GRIDS | anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    return this;
  } else {
    if (newColumn) {
      column.container(this.getContentLayer());
      this.columns_[index] = column;

      this.invalidate(anychart.ConsistencyState.DATA_GRID_GRIDS | anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
      if (this.getOption('fixedColumns')) {
        // Will be invalidated only if interactivityHandler is chart.
        this.interactivityHandler.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
      }
    }

    /*
      Create splitters on demand.
      Because splitters creates only for enabled columns we need check - If another one splitter needed?
      Then update splitters count.
     */
    this.addSplitter_();

    return column;
  }
};


/**
 * Gets all (enabled and disabled) existing not disposed columns count.
 * @return {number}
 */
anychart.ganttModule.DataGrid.prototype.getColumnsCount = function() {
  var res = 0;
  for (var i = 0; i < this.columns_.length; i++) {
    var col = this.columns_[i];
    if (col && !col.isDisposed())
      res++;
  }
  return res;
};


/**
 * Gets last enabled column.
 * @return {anychart.ganttModule.Column}
 */
anychart.ganttModule.DataGrid.prototype.getLastEnabledColumn = function() {
  var res = null;
  for (var i = this.columns_.length - 1; i > -1; i--) {
    var col = this.columns_[i];
    if (col && col.enabled() && !col.isDisposed())
      return col;
  }
  return res;
};


/**
 * Initializes this.partialLabels object (@see typedef).
 * Contains information about data rows to be processed.
 * Works with linear list of data items (rows) to asynchronously
 * process portions of labels.
 */
anychart.ganttModule.DataGrid.prototype.initPartialData = function() {
  /*
    Since this method will be called anyway during the async processing,
    the "reset" flag allows to keep resetting under control.
   */
  if (this.partialLabels.reset) {
    // This dispatching is for DVF-4398.
    this.interactivityHandler.dispatchEvent(anychart.enums.EventType.WORKING_START);

    var enabledColumnsCount = 0;
    for (var i = 0, l = this.columns_.length; i < l; i++) {
      var column = this.columns_[i];
      if (column && column.enabled() && !column.isDisposed()) {
        enabledColumnsCount++;
      }
    }

    var allItems = this.controller.getAllItems();
    var part = this.partialLabels;
    if (allItems.length) {
      part.first = 0;
      var maxRowsAllowed = Math.max(1, Math.floor(anychart.ganttModule.DataGrid.MAX_LABELS_AT_ONCE / enabledColumnsCount));
      part.count = Math.min(maxRowsAllowed, allItems.length);
      part.last = part.first + Math.max(0, part.count - 1);
      part.reset = false;
    } else {
      part.first = NaN;
      part.last = NaN;
      part.count = NaN;
      part.reset = true;
    }
  }
};


/**
 * Resets partial columns texts.
 */
anychart.ganttModule.DataGrid.prototype.resetColumnsSync = function() {
  this.partialLabels.reset = true;
  this.forEachVisibleColumn_(function(col) {
    col.resetTexts();
  });
};


/**
 * TODO (A.Kudryavtsev): Describe.
 * @return {boolean}
 */
anychart.ganttModule.DataGrid.prototype.partialMeasurement = function() {
  var allItems = this.controller.getAllItems();
  var part = this.partialLabels;
  if (isNaN(part.last) || part.last >= allItems.length - 1) {
    return false;
  } else {
    part.first = part.last + 1;
    var c = Math.min(allItems.length - 1 - part.first, part.count);
    part.last = part.first + c;
  }
  return true;
};


/**
 * Getter/setter for loading message label.
 * @param {Object=} opt_value - Config.
 * @return {anychart.ganttModule.DataGrid|anychart.core.ui.Label}
 */
anychart.ganttModule.DataGrid.prototype.loadingMessage = function(opt_value) {
  if (!this.loadingMessage_) {
    this.loadingMessage_ = new anychart.core.ui.Label();
    this.loadingMessage_.container(this.getScrollsLayer());
    this.loadingMessage_.background().enabled(true).fill('red 0.5');
    this.loadingMessage_['text']('Working...');
    this.loadingMessage_['anchor']('left-top');
    this.loadingMessage_['position']('left-top');
    this.loadingMessage_.padding(5);
    this.loadingMessage_.enabled(true);
    this.loadingMessage_.parentBounds(this.pixelBoundsCache);
  }

  if (opt_value) {
    this.loadingMessage_.setupInternal(false, opt_value);
    return this;
  }

  return this.loadingMessage_;
};


/**
 * Sync labels preparation.
 * @private
 */
anychart.ganttModule.DataGrid.prototype.prepareSync_ = function() {
  this.forEachVisibleColumn_(function(col) {
    col.provideMeasurements();
    var applyStyling = false;
    var needsToDropOldBounds = false;

    var signal = 0;
    if (col.hasInvalidationState(anychart.ConsistencyState.DATA_GRID_COLUMN_LABELS_APPEARANCE)) {
      applyStyling = true;
    }

    if (col.hasInvalidationState(anychart.ConsistencyState.DATA_GRID_COLUMN_LABELS_BOUNDS)) {
      if (col.labels().needsBoundsCalculation())
        signal |= anychart.Signal.MEASURE_BOUNDS;
      needsToDropOldBounds = true;
      applyStyling = true;
    }

    if (col.hasInvalidationState(anychart.ConsistencyState.DATA_GRID_COLUMN_DATA)) {
      /*
        Measuriator will collect labels itself on this signal.
       */
      signal |= anychart.Signal.MEASURE_COLLECT;
      needsToDropOldBounds = true;
      applyStyling = true;
    }

    /*
      Labels are already collected here, applies the style if needed.
     */
    if (applyStyling)
      col.applyLabelsStyle(needsToDropOldBounds);

    /*
      Signal makes Measuriator to collect labels and be ready to
      measure it.
     */
    col.dispatchSignal(signal);
  });
};


/**
 * Async labels preparation.
 * @private
 */
anychart.ganttModule.DataGrid.prototype.prepareAsync_ = function() {
  this.controller.timeouts.push(anychart.utils.schedule(function() {
    this.initPartialData();

    var hasInconsistentColumns = false;
    this.forEachVisibleColumn_(function(col) {
      if (!col.isConsistent()) {
        hasInconsistentColumns = true;
        col.provideMeasurements();
        var applyStyling = false;
        var needsToDropOldBounds = false;

        var signal = 0;
        if (col.hasInvalidationState(anychart.ConsistencyState.DATA_GRID_COLUMN_LABELS_APPEARANCE)) {
          applyStyling = true;
        }

        if (col.hasInvalidationState(anychart.ConsistencyState.DATA_GRID_COLUMN_LABELS_BOUNDS)) {
          if (col.labels().needsBoundsCalculation())
            signal |= anychart.Signal.MEASURE_BOUNDS;
          needsToDropOldBounds = true;
          applyStyling = true;
        }

        if (col.hasInvalidationState(anychart.ConsistencyState.DATA_GRID_COLUMN_DATA)) {
          /*
            Measuriator will collect labels itself on this signal.
           */
          signal |= anychart.Signal.MEASURE_COLLECT;
          needsToDropOldBounds = true;
          applyStyling = true;
        }

        /*
          Labels are already collected here, applies the style if needed.
         */
        if (applyStyling)
          col.applyLabelsStyle(needsToDropOldBounds);

        /*
          Signal makes Measuriator to collect labels and be ready to
          measure it.
         */
        col.dispatchSignal(signal);
      }
    });

    if (hasInconsistentColumns) {
      if (this.partialMeasurement()) {
        var percent = Math.round(this.partialLabels.last / this.controller.getAllItems().length * 100);
        if (isNaN(percent)) {
          this.loadingMessage().enabled(false);
        } else {
          this.loadingMessage().enabled(true).parentBounds(this.pixelBoundsCache)['text']('Working: ' + percent + '%').draw();
          this.interactivityHandler.dispatchEvent({
            'type': anychart.enums.EventType.WORKING,
            'progress': percent
          });
        }

        anychart.measuriator.measure();
        this.forEachVisibleColumn_(function(col) {
          col.invalidate(anychart.ConsistencyState.DATA_GRID_COLUMN_POSITION);
          col.draw();
        });
        this.prepareAsync_();
      } else {
        this.forEachVisibleColumn_(function(col) {
          //Here we suppose everything is applied correctly.
          col.markConsistent(anychart.ConsistencyState.DATA_GRID_COLUMN_DATA |
              anychart.ConsistencyState.DATA_GRID_COLUMN_LABELS_APPEARANCE |
              anychart.ConsistencyState.DATA_GRID_COLUMN_LABELS_BOUNDS);
          col.invalidate(anychart.ConsistencyState.DATA_GRID_COLUMN_POSITION);
          col.draw();
        });
        this.needsForceSignalsDispatching(false); //TODO (A.Kudryavtsev): Describe.
        this.loadingMessage().enabled(false).draw();
        this.controller.run(); //this clears remaining async consistency states on timeline.
        this.controller.timeouts.push(anychart.utils.schedule(function() {
          this.controller.resetTimeouts();

          // This dispatching is for DVF-4398.
          this.interactivityHandler.dispatchEvent({
            'type': anychart.enums.EventType.WORKING,
            'progress': 100
          });

          this.interactivityHandler.dispatchEvent(anychart.enums.EventType.WORKING_FINISH);
        }, void 0, this));
      }
    }
  }, void 0, this));
};


/**
 * @inheritDoc
 */
anychart.ganttModule.DataGrid.prototype.prepareLabels = function() {
  if (anychart.isAsync()) {
    this.prepareAsync_();
  } else {
    this.prepareSync_();
  }
};


/**
 * Splitter change handler.
 * @param {number} splitterIndex - Index of splitter that has been moved.
 * @param {goog.events.Event} event - Event.
 * @private
 */
anychart.ganttModule.DataGrid.prototype.splitterChangedHandler_ = function(splitterIndex, event) {
  var splitter = /** @type {anychart.core.ui.SimpleSplitter} */ (event['target']);
  var width = splitter.getLeftBounds().width + anychart.ganttModule.DataGrid.MIN_COLUMN_WIDTH;
  this.forEachVisibleColumn_(this.resizeColumn_, this, splitterIndex, width);
};


/**
 * Splitter double click handler.
 * @param {number} splitterIndex - Index of splitter that has been clicked.
 * @param {goog.events.Event} event - Event.
 * @private
 */
anychart.ganttModule.DataGrid.prototype.splitterDblClickHandler_ = function(splitterIndex, event) {
  this.forEachVisibleColumn_(this.dblClickResizeColumn_, this, splitterIndex, event);
};


/**
 * Sets new column width.
 * @param {anychart.ganttModule.Column} column - Current visible column.
 * @param {number} columnIndex - Straight index of current visible column.
 * @param {number} splitterIndex
 * @param {number} width
 * @private
 */
anychart.ganttModule.DataGrid.prototype.resizeColumn_ = function(column, columnIndex, splitterIndex, width) {
  if (splitterIndex == columnIndex) { //If splitter_index == column_index.
    var ev = {
      'type': anychart.enums.EventType.SPLITTER_POSITION_CHANGE,
      'columnIndex': column.getIndex(), //not the same as columnIndex parameter.
      'targetColumn': column,
      'linearColumnIndex': columnIndex,
      'oldWidth': column.getPixelBounds().width,
      'newWidth': width
    };

    column['width'](width); //Sets new width.
    this.dispatchDetachedEvent(ev);
  }
};


/**
 * Sets new column width depending on it's default width or title's width.
 * @param {anychart.ganttModule.Column} column - Current visible column.
 * @param {number} columnIndex - Straight index of current visible column.
 * @param {number} splitterIndex
 * @param {goog.events.Event} event - Event.
 * @private
 */
anychart.ganttModule.DataGrid.prototype.dblClickResizeColumn_ = function(column, columnIndex, splitterIndex, event) {
  if (splitterIndex == columnIndex) { //If splitter_index == column_index.
    var title = column.title();
    var height = title.height();
    var eventY = event['offsetY'] - this.pixelBoundsCache.top;
    if (eventY < height) {
      var titleOriginalBoundsWidth = title.getOriginalBounds().width;
      titleOriginalBoundsWidth += (title.padding().getOption('left') + title.padding().getOption('right'));
      column['width'](/** @type {number} */ (column['defaultWidth']() ? column['defaultWidth']() : titleOriginalBoundsWidth));
      if (this.getOption('fixedColumns')) {
        // Will be invalidated only if interactivityHandler is chart.
        this.interactivityHandler.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
      }
    }
  }
};


/**
 * Column invalidation handler.
 * @param {anychart.SignalEvent} event - Signal event.
 * @private
 */
anychart.ganttModule.DataGrid.prototype.columnInvalidated_ = function(event) {
  var state = 0;
  var signal = anychart.Signal.NEEDS_REDRAW;

  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW))
    state |= anychart.ConsistencyState.APPEARANCE;

  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED))
    state |= anychart.ConsistencyState.DATA_GRID_GRIDS;

  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW_LABELS)) {
    state |= anychart.ConsistencyState.GRIDS_POSITION;
    if (anychart.isAsync())
      this.partialLabels.reset = true;
  }

  /*
    Fix for case when we consequently apply changes to several columns in async mode.

    When second signal arrives first invalidation already took place and second time
    signal won't be emitted.

    To emit signal which would schedule settings reapplication we need to make data
    grid consistent again.
   */
  if (anychart.isAsync() &&
      event.hasSignal(anychart.Signal.NEEDS_REDRAW_LABELS) &&
      this.container()) // This is to avoid invoking chart.drawInternal() before container is set.
  {
    this.markConsistent(state);
  }

  var redrawChart = false;

  if (this.getOption('fixedColumns') && event.hasSignal(anychart.Signal.ENABLED_STATE_CHANGED | anychart.Signal.BOUNDS_CHANGED)) {
    state |= anychart.ConsistencyState.BOUNDS;
    redrawChart = true;
  }
  this.invalidate(state, signal);
  if (redrawChart)
    this.interactivityHandler.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
};


/** @inheritDoc */
anychart.ganttModule.DataGrid.prototype.horizontalScrollBar = function(opt_value) {
  if (!this.horizontalScrollBar_) {
    this.horizontalScrollBar_ = new anychart.ganttModule.ScrollBar();
    this.horizontalScrollBar_.setupByJSON(/** @type {!Object} */ (anychart.getFlatTheme('defaultScrollBar')));
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
anychart.ganttModule.DataGrid.prototype.scrollBarInvalidated_ = function(e) {
  if (e.hasSignal(anychart.Signal.BOUNDS_CHANGED))
    this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Performs scroll to pixel offsets.
 * TODO (A.Kudryavtsev): In current implementation (04 Dec 2014) horizontal scrolling of data grid is not available.
 *
 * @param {number} horizontalPixelOffset - Horizontal pixel offset.
 * @param {number} verticalPixelOffset - Vertical pixel offset.
 * @return {boolean} - Whether scroll has been performed.
 */
anychart.ganttModule.DataGrid.prototype.scroll = function(horizontalPixelOffset, verticalPixelOffset) {
  anychart.core.Base.suspendSignalsDispatching(this, this.controller);

  this.horizontalOffset(this.horizontalOffset_ + horizontalPixelOffset);
  var startIndex = this.controller.startIndex();
  var heightCache = this.controller.getHeightCache();
  var verticalOffset = this.controller.verticalOffset();

  var totalVerticalStartOffset = startIndex ? heightCache[startIndex - 1] : 0;
  totalVerticalStartOffset += (verticalOffset + verticalPixelOffset);

  this.controller.scrollTo(/** @type {number} */ (totalVerticalStartOffset));

  anychart.core.Base.resumeSignalsDispatchingTrue(this, this.controller);

  return true; //TODO (A.Kudryavtsev): DG doesn't need to determine whether scroll is performed for a while.
};


/**
 * @override
 */
anychart.ganttModule.DataGrid.prototype.boundsInvalidated = function() {
  var headerPath = this.getHeaderPath_();

  var headerHeight = /** @type {number} */ (this.pixelBoundsCache.top + this.headerHeight());
  headerPath
      .clear()
      .moveTo(this.pixelBoundsCache.left, this.pixelBoundsCache.top)
      .lineTo(this.pixelBoundsCache.left + this.pixelBoundsCache.width, this.pixelBoundsCache.top)
      .lineTo(this.pixelBoundsCache.left + this.pixelBoundsCache.width, headerHeight)
      .lineTo(this.pixelBoundsCache.left, headerHeight)
      .close();

  var splitterWidth = this.getSplitterWidth();

  var totalWidth = 0;

  for (var i = 0, l = this.columns_.length; i < l; i++) {
    var col = this.columns_[i];
    if (col && col.enabled()) {
      if (anychart.utils.isPercent(col.getOption('width')))
        col.resetBounds();
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
anychart.ganttModule.DataGrid.prototype.appearanceInvalidated = function() {
  this.getHeaderPath_().fill(/** @type {acgraph.vector.Fill} */(this.resolveHeaderFill()));

  this.forEachVisibleColumn_(function(col) {
    col.invalidate(anychart.ConsistencyState.APPEARANCE);
    col.draw();
  });
};


/**
 * @inheritDoc
 */
anychart.ganttModule.DataGrid.prototype.initLayersStructure = function(base) {
  base
      .addChild(/** @type {!acgraph.vector.Layer} */ (this.getCellsLayer()))
      .addChild(/** @type {!acgraph.vector.Layer} */ (this.getDrawLayer()))
      .addChild(/** @type {!acgraph.vector.Layer} */ (this.getContentLayer()))
      .addChild(/** @type {!acgraph.vector.Layer} */ (this.getEditLayer()))
      .addChild(/** @type {!acgraph.vector.Layer} */ (this.getClipLayer()))
      .addChild(/** @type {!acgraph.vector.Layer} */ (this.getScrollsLayer()));
};


/**
 * @override
 */
anychart.ganttModule.DataGrid.prototype.positionInvalidated = function() {
  this.forEachVisibleColumn_(function(col) {
    col.invalidate(anychart.ConsistencyState.DATA_GRID_COLUMN_POSITION); //Column takes data from own data grid.
    col.draw();
  });
};


/**
 * @inheritDoc
 */
anychart.ganttModule.DataGrid.prototype.getPixelBounds = function() {
  var rv = anychart.ganttModule.DataGrid.base(this, 'getPixelBounds');
  if (this.getOption('fixedColumns')) {
    rv.width = this.getTotalColumnsWidth();
  }
  return rv;
};


/**
 * @override
 */
anychart.ganttModule.DataGrid.prototype.specialInvalidated = function() {
  /*
    This actually places a columns horizontally depending on previous column's width.
   */
  if (this.hasInvalidationState(anychart.ConsistencyState.DATA_GRID_GRIDS)) {
    var left, top;

    var totalWidth = 0;
    left = this.pixelBoundsCache.left;
    top = this.pixelBoundsCache.top;
    var columnStroke = /** @type {acgraph.vector.Stroke} */(anychart.ganttModule.BaseGrid.getColorResolver('columnStroke', anychart.enums.ColorType.STROKE, false)(this, 0));
    var splitterWidth = anychart.utils.extractThickness(/** @type {acgraph.vector.Stroke|string} */ (columnStroke));

    var enabledColumns = [];
    var i, l, col, colWidth;
    this.columnsWidthsCache_.length = 0;

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
      var colBounds = col.calculateBounds();
      colWidth = colBounds.width; //We need pixel value here.
      var splitter = this.splitters_[i];

      var add = colWidth;
      var drawSplitter = !(this.getOption('fixedColumns') && i == enabledColumns.length - 1);

      if (splitter) {
        splitter.suspendSignalsDispatching();
        if (drawSplitter) { //Amount of splitters is (amountOfColumns - 1).
          splitter.stroke(columnStroke);
          splitter.defaultStroke = columnStroke;

          // splitter.enabled(true);
          this.columnsWidthsCache_.push(colLeft + colWidth + splitterWidth);

          add += splitterWidth;
          var boundsWidth = add + this.pixelBoundsCache.width;

          var splitterBounds = {
            left: (left + colLeft + anychart.ganttModule.DataGrid.MIN_COLUMN_WIDTH),
            top: top,
            width: boundsWidth,
            height: this.pixelBoundsCache.height
          };

          splitter
              .bounds(splitterBounds)
              .handlePositionChange(false)
              .enabled(true)
              .position(colWidth - anychart.ganttModule.DataGrid.MIN_COLUMN_WIDTH)
              .resumeSignalsDispatching(false)
              .draw()
              .handlePositionChange(true);
        } else {
          splitter
              .enabled(false)
              .resumeSignalsDispatching(false)
              .draw();
        }
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


/**
 *
 * @param {goog.events.Event} e - Event.
 * @private
 */
anychart.ganttModule.DataGrid.prototype.editInputSubmitHandler_ = function(e) {
  var context = {
    'columnIndex': this.editColumn_.getIndex(),
    'item': this.editItem_,
    'value': e['value']
  };
  if (goog.isFunction(this.getOption('onEditEnd'))) {
    var result = /** @type {Function} */ (this.getOption('onEditEnd')).call(context);
    if (result && goog.typeOf(result) == 'object' && !(result['cancelEdit']) && goog.typeOf(result['itemMap']) == 'object' && this.editItem_) {
      var changes = result['itemMap'];
      var tree = this.controller.data();//this.controller.data() can be Tree or TreeView.
      tree.suspendSignalsDispatching();
      for (var key in changes) {
        if (changes.hasOwnProperty(key))
          this.editItem_.set(key, changes[key]);
      }
      tree.resumeSignalsDispatching(true);
      this.submitted_ = true;
      this.escaped_ = false;
    }
  }
};


/**
 *
 * @param {goog.events.Event} e - Event.
 * @private
 */
anychart.ganttModule.DataGrid.prototype.editInputBlurHandler_ = function(e) {
  // console.log('From blur', this.submitted_ || this.escaped_ ? 'NOT WRITING' : 'WRITING');
  if (!this.submitted_ && !this.escaped_) {
    this.editInputSubmitHandler_.call(this, e);
    this.escaped_ = false;
  }
};


/**
 *
 * @param {goog.events.Event} e - Event.
 * @private
 */
anychart.ganttModule.DataGrid.prototype.editInputEscapeHandler_ = function(e) {
  this.escaped_ = true;
};


/**
 *
 * @param {goog.events.Event} e - Event.
 * @private
 */
anychart.ganttModule.DataGrid.prototype.editInputFocusHandler_ = function(e) {
  this.interactivityHandler.lockInteractivity(true);
  this.submitted_ = false;
};


/**
 *
 * @param {goog.events.Event} e - Event.
 * @private
 */
anychart.ganttModule.DataGrid.prototype.editInputHideHandler_ = function(e) {
  this.escaped_ = false;
  this.submitted_ = false;
  this.editInput_.reset();
  this.interactivityHandler.lockInteractivity(false);
};


/**
 * Initializes editor input.
 * @private
 */
anychart.ganttModule.DataGrid.prototype.initEditInput_ = function() {
  if (!this.editInput_) {
    this.editInput_ = new anychart.ui.EditInput();

    var stage = this.interactivityHandler.container().getStage();
    this.editInput_.render(/** @type {Element} */ (stage.container()));

    this.editInput_.listen(anychart.enums.EventType.EDIT_INPUT_SUBMIT, this.editInputSubmitHandler_, false, this);
    this.editInput_.listen(anychart.enums.EventType.EDIT_INPUT_ESCAPE, this.editInputEscapeHandler_, false, this);
    this.editInput_.listen(anychart.enums.EventType.EDIT_INPUT_BLUR, this.editInputBlurHandler_, false, this);
    this.editInput_.listen(anychart.enums.EventType.EDIT_INPUT_FOCUS, this.editInputFocusHandler_, false, this);
    // this.editInput_.listen(anychart.enums.EventType.EDIT_INPUT_KEY_PRESS, this.editInputKeyPressHandler_, false, this);
    // this.editInput_.listen(anychart.enums.EventType.EDIT_INPUT_BEFORE_HIDE, this.editInputKeyPressHandler_, false, this);
    this.editInput_.listen(anychart.enums.EventType.EDIT_INPUT_HIDE, this.editInputHideHandler_, false, this);
  }
};


/**
 * Gets column bounds.
 * @param {number} columnStraightIndex - Straight column index.
 * @return {anychart.math.Rect}
 * @private
 */
anychart.ganttModule.DataGrid.prototype.getColumnBounds_ = function(columnStraightIndex) {
  var bounds = null;
  var counter = -1;
  for (var i = 0, l = this.columns_.length; i < l; i++) {
    var col = this.columns_[i];
    if (col && col.enabled()) {
      counter++;
      if (counter == columnStraightIndex) {
        bounds = col.calculateBounds();
        this.editColumn_ = col;
        break;
      }
    }
  }
  return bounds;
};


/**
 * Gets input bounds.
 * @param {Object} e - Event.
 * @return {?anychart.math.Rect}
 * @private
 */
anychart.ganttModule.DataGrid.prototype.getInputBounds_ = function(e) {
  var eX = e['originalEvent']['offsetX'];
  var left = eX - this.pixelBoundsCache.left;
  var ind = ~goog.array.binarySearch(this.columnsWidthsCache_, left);
  var colBounds = this.getColumnBounds_(ind);
  if (colBounds.left < 0) {
    this.horizontalOffset(/** @type {number} */ (this.horizontalOffset()) + colBounds.left);
    colBounds.left = 0;
  }
  var itemHeight = this.controller.getItemHeight(e['item']);
  var heightReduction = e['hoveredIndex'] ? 2 : 1;
  return colBounds ? new anychart.math.Rect(colBounds.left, e['startY'], colBounds.width - 2, itemHeight - heightReduction) : null;
};


/**
 *
 * @param {Object} e - Event object.
 */
anychart.ganttModule.DataGrid.prototype.addMouseDblClick = function(e) {
  if (e && this.edit().getOption('enabled')) {
    this.interactive = false;
    this.initEditInput_();
    this.editItem_ = e['item'];
    var hoveredIndex = e['hoveredIndex'];
    var index = e['index'];

    var fixEnd = false;
    var usedIndex;


    if (index == this.controller.startIndex()) {
      this.controller.scrollToRow(index);
    } else if (index == this.controller.endIndex()) {
      this.controller.endIndex(index);
      var gridHeightCache = this.getGridHeightCache();
      usedIndex = Math.min(gridHeightCache.length - 1, hoveredIndex);
      var initialTop = /** @type {number} */ (this.pixelBoundsCache.top + /** @type {number} */ (this.headerHeight()) + 1);
      var startHeight = hoveredIndex ? gridHeightCache[usedIndex - 1] : 0;
      var startY = initialTop + startHeight;
      var endY = startY + (gridHeightCache[usedIndex] - startHeight - this.rowStrokeThickness) - 2;
      fixEnd = true;
    }

    var bounds = this.getInputBounds_(e);

    if (bounds) {
      if (fixEnd) {
        bounds.top = /** @type {number} */ (startY);
        bounds.height = endY - startY;
      }
      var val = '';
      if (this.editColumn_) {
        var colLabelTexts = this.editColumn_.getLabelTexts();
        usedIndex = Math.min(hoveredIndex, colLabelTexts.length - 1);
        val = colLabelTexts[usedIndex];

        var context = {
          'columnIndex': this.editColumn_.getIndex(),
          'item': this.editItem_,
          'value': val
        };

        if (goog.isFunction(this.getOption('onEditStart'))) {
          var result = /** @type {Function} */ (this.getOption('onEditStart')).call(context);
          if (result && goog.typeOf(result) == 'object' && !(result['cancelEdit']) && this.editItem_) {
            var valueToShow = goog.isDefAndNotNull(result['value']) ? result['value'] : val;
            this.editInput_.show(valueToShow, bounds);
            this.editInput_.focusAndSelect();
          }
        }
      }
    }
  }
};


/** @inheritDoc */
anychart.ganttModule.DataGrid.prototype.rowMouseDown = function(evt) {
  this.mouseDown(evt);
};


/**
 * Actually reacts on mouse down.
 * @param {anychart.core.MouseEvent|Object} evt - Event object.
 */
anychart.ganttModule.DataGrid.prototype.mouseDown = function(evt) {
  if (this.edit().getOption('enabled')) this.draggingItem = evt['item'];
};


/**
 * @inheritDoc
 */
anychart.ganttModule.DataGrid.prototype.mouseOutMove = function(event) {
  if (this.dragging && (this.scrollOffsetX || this.scrollOffsetY)) {
    var scrollX = 0;
    var scrollY = 0;
    if (this.scrollOffsetX)
      scrollX = this.scrollOffsetX > 0 ? anychart.ganttModule.BaseGrid.SCROLL_STEP : -anychart.ganttModule.BaseGrid.SCROLL_STEP;

    if (this.scrollOffsetY)
      scrollY = this.scrollOffsetY > 0 ? anychart.ganttModule.BaseGrid.SCROLL_STEP : -anychart.ganttModule.BaseGrid.SCROLL_STEP;

    this.scroll(scrollX, scrollY);
  }
};


/**
 * Getter/setter for datagrid button settings.
 * @param {Object=} opt_value
 * @return {anychart.ganttModule.DataGrid|anychart.ganttModule.DataGridButton}
 */
anychart.ganttModule.DataGrid.prototype.buttons = function(opt_value) {
  if (!this.buttons_) {
    this.buttons_ = new anychart.ganttModule.DataGridButton(this);
    this.setupCreated('buttons', this.buttons_);
    this.buttons_.setupStateSettings();
    this.buttons_.listenSignals(this.buttonsInvalidated_, this);
  }
  if (goog.isDef(opt_value)) {
    this.buttons_.setup(opt_value);
    return this;
  }

  return this.buttons_;
};


/**
 * Buttons invalidation handler.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.ganttModule.DataGrid.prototype.buttonsInvalidated_ = function(e) {
  if (e.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    //var buttons = this.buttons();
    //var json = buttons.serialize();
    this.buttons().markConsistent(anychart.ConsistencyState.ALL);
    this.positionInvalidated();
  }
};


/** @inheritDoc */
anychart.ganttModule.DataGrid.prototype.serialize = function() {
  var json = anychart.ganttModule.DataGrid.base(this, 'serialize');

  anychart.core.settings.serialize(this, anychart.ganttModule.DataGrid.DG_DESCRIPTORS, json, void 0, void 0, true);
  json['horizontalOffset'] = this.horizontalOffset();

  json['buttons'] = this.buttons().serialize();

  json['columns'] = [];

  for (var i = 0; i < this.columns_.length; i++) {
    var col = this.columns_[i];
    json['columns'].push(col ? col.serialize() : false);
  }

  if (this.horizontalScrollBar_)
    json['horizontalScrollBar'] = this.horizontalScrollBar().serialize();

  json['tooltip'] = this.tooltip().serialize();

  return json;
};


/** @inheritDoc */
anychart.ganttModule.DataGrid.prototype.setupByJSON = function(config, opt_default) {
  anychart.ganttModule.DataGrid.base(this, 'setupByJSON', config, opt_default);

  anychart.core.settings.deserialize(this, anychart.ganttModule.DataGrid.DG_DESCRIPTORS, config, opt_default);
  this.horizontalOffset(config['horizontalOffset']);

  this.buttons().setupInternal(!!opt_default, config['buttons']);

  if ('defaultColumnSettings' in config)
    this.defaultColumnSettings(config['defaultColumnSettings']);

  this['onEditStart'](config['onEditStart']);
  this['onEditEnd'](config['onEditEnd']);

  if ('columns' in config) {
    for (var i = 0, l = config['columns'].length; i < l; i++) {
      var col = config['columns'][i];
      if (col) this.columnInternal_(i, col, opt_default);
    }
  }

  if ('horizontalScrollBar' in config)
    this.horizontalScrollBar(config['horizontalScrollBar']);
};


/** @inheritDoc */
anychart.ganttModule.DataGrid.prototype.disposeInternal = function() {
  goog.disposeAll(this.horizontalScrollBar_, this.headerPath_, this.splitters_, this.columns_, this.buttons_);
  this.buttons_ = null;
  this.horizontalScrollBar_ = null;
  this.headerPath_ = null;
  this.splitters_.length = 0;
  this.columns_.length = 0;
  anychart.ganttModule.DataGrid.base(this, 'disposeInternal');
};



/**
 * @constructor
 * @extends {anychart.ganttModule.DataGrid}
 */
anychart.standalones.DataGrid = function() {
  anychart.standalones.DataGrid.base(this, 'constructor');
};
goog.inherits(anychart.standalones.DataGrid, anychart.ganttModule.DataGrid);
anychart.core.makeStandalone(anychart.standalones.DataGrid, anychart.ganttModule.DataGrid);


/**
 * Getter/setter for vertical scroll bar.
 * @param {Object=} opt_value Object with settings.
 * @return {anychart.standalones.DataGrid|anychart.ganttModule.ScrollBar}
 */
anychart.standalones.DataGrid.prototype.verticalScrollBar = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.controller.getScrollBar().setup(opt_value);
    return this;
  }
  return this.controller.getScrollBar();
};


/** @inheritDoc */
anychart.standalones.DataGrid.prototype.serialize = function() {
  var json = anychart.standalones.DataGrid.base(this, 'serialize');
  json['verticalScrollBar'] = this.verticalScrollBar().serialize();
  return json;
};


/** @inheritDoc */
anychart.standalones.DataGrid.prototype.setupByJSON = function(config) {
  anychart.standalones.DataGrid.base(this, 'setupByJSON', config);
  if ('verticalScrollBar' in config)
    this.verticalScrollBar(config['verticalScrollBar']);
};


/**
 * Constructor function.
 * @return {!anychart.standalones.DataGrid}
 */
anychart.standalones.dataGrid = function() {
  var dataGrid = new anychart.standalones.DataGrid();
  dataGrid.setup(anychart.getFullTheme('standalones.dataGrid'));
  return dataGrid;
};


//exports
/**
 * @suppress {deprecated}
 */
(function() {
  var proto = anychart.ganttModule.DataGrid.prototype;

  // auto generated
  //proto['backgroundFill'] = proto.backgroundFill;
  //proto['rowFill'] = proto.rowFill;
  //proto['rowEvenFill'] = proto.rowEvenFill;
  //proto['rowOddFill'] = proto.rowOddFill;
  //proto['rowHoverFill'] = proto.rowHoverFill;
  //proto['rowSelectedFill'] = proto.rowSelectedFill;
  //proto['columnStroke'] = proto.columnStroke;
  //proto['headerFill'] = proto.headerFill;

  proto['editing'] = proto.editing;
  proto['edit'] = proto.edit;

  proto['column'] = proto.column;

  proto['data'] = proto.data;
  proto['addColumn'] = proto.addColumn;
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
  proto['buttons'] = proto.buttons;
  proto['getColumnsCount'] = proto.getColumnsCount;


  proto = anychart.standalones.DataGrid.prototype;
  goog.exportSymbol('anychart.standalones.dataGrid', anychart.standalones.dataGrid);
  proto['draw'] = proto.draw;
  proto['data'] = proto.data;
  proto['addColumn'] = proto.addColumn;
  proto['parentBounds'] = proto.parentBounds;
  proto['container'] = proto.container;
  proto['headerHeight'] = proto.headerHeight;
  proto['verticalScrollBar'] = proto.verticalScrollBar;
  proto['defaultRowHeight'] = proto.defaultRowHeight;
  proto['buttons'] = proto.buttons;
})();
