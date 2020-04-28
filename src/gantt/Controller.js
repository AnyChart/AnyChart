goog.provide('anychart.ganttModule.Controller');

goog.require('anychart.core.Base');
goog.require('anychart.format');
goog.require('anychart.ganttModule.ScrollBar');
goog.require('anychart.math.Rect');
goog.require('anychart.scales.GanttDateTime');
goog.require('anychart.treeDataModule.Tree');

goog.require('goog.array');
goog.require('goog.math');



/**
 * Gantt controller implementation.
 * TODO (A.Kudryavtsev): Describe.
 * @param {boolean=} opt_isResources - Flag if controller must work in resource chart mode.
 *
 * @constructor
 * @extends {anychart.core.Base}
 */
anychart.ganttModule.Controller = function(opt_isResources) {
  anychart.ganttModule.Controller.base(this, 'constructor');

  /**
   * Resource chart works with resources.
   * Each resource has periods reflected in data model as array of period-objects (Array.<Period>).
   * Each period has some useful fields (such as 'ID').
   * Basically, field 'periods' in tree data item is just a raw array, but for resource chart here are some
   * issues when we need to quickly find a period by id (for example, for connectors).
   *
   * Indexing the periods takes a time, so we run it only in resource chart mode.
   *
   * @type {boolean}
   * @private
   */
  this.isResources_ = !!opt_isResources;

  /**
   * The map of periods.
   * Contains link to the period by its id.
   * Used for connector draw purposes.
   * @type {Object}
   * @private
   */
  this.periodsMap_ = {};

  /**
   * Visible items map.
   * Contains link to the visible data items by its id.
   * Used for connector draw purposes.
   * @type {Object}
   * @private
   */
  this.visibleItemsMap_ = {};

  /**
   * The map of connectors.
   * @type {Array.<Object>}
   * @private
   */
  this.connectorsData_ = [];

  /**
   * Tree data.
   * @type {(anychart.treeDataModule.Tree|anychart.treeDataModule.View)}
   * @private
   */
  this.data_ = null;

  /**
   * Visible items of tree (items that are not hidden by collapse).
   * @type {Array.<(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)>}
   * @private
   */
  this.visibleItems_ = [];


  /**
   * Linear list of all data.
   * @type {Array.<(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)>}
   * @private
   */
  this.allItems_ = [];

  /**
   * Array that contains a row height differences.
   * NOTE: This array doesn't store row spaces!
   * @type {Array.<number>}
   * @private
   */
  this.heightCache_ = [];

  /**
   * Related data grid.
   * @type {anychart.ganttModule.DataGrid}
   * @private
   */
  this.dataGrid_ = null;

  /**
   * Related timeline.
   * @type {anychart.ganttModule.TimeLine}
   * @private
   */
  this.timeline_ = null;

  /**
   * Row stroke thickness. Used to calculate a required number of visible data items.
   * @type {number}
   * @private
   */
  this.rowStrokeThickness_ = 1;

  /**
   * Start index.
   * @type {number}
   * @private
   */
  this.startIndex_ = NaN;

  /**
   * End index.
   * @type {number}
   * @private
   */
  this.endIndex_ = NaN;

  /**
   * Vertical offset.
   * Actually, must be calculated automatically. Take care of user doesn't set this value wrong.
   * @type {number}
   * @private
   */
  this.verticalOffset_ = 0;

  /**
   * DVF-3323: Absolute pixel vertical offset.
   * Difference from this.verticalOffset_ is in:
   *  this.verticalOffset_ is offset for exact top row (row of this.startIndex_).
   *  this.scrollTo_ is offset of all rows from the top.
   *
   * Field is used to restore vertical scroll position on XML/JSON restoration.
   * @type {number}
   * @private
   */
  this.scrollTo_ = 0;

  /**
   * DVF-3323: Whether to restore vertical position on XML/JSON operations or in
   * before draw case.
   * @type {boolean}
   * @private
   */
  this.restoreScrollState_ = false;

  /**
   * Height of data grid, available for rows render.
   * @type {number}
   * @private
   */
  this.availableHeight_ = 0;

  /**
   * Flag if startIndex, endIndex, vertical offset were recalculated.
   * @type {boolean}
   * @private
   */
  this.positionRecalculated_ = false;

  /**
   * Traverser that ignores children of collapsed items while passage.
   * @type {anychart.treeDataModule.Traverser}
   * @private
   */
  this.expandedItemsTraverser_ = null;

  /**
   * Min date timestamp.
   * @type {number}
   * @private
   */
  this.minDate_ = NaN;

  /**
   * Max date timestamp.
   * @type {number}
   * @private
   */
  this.maxDate_ = NaN;

  /**
   * Index for recursive linearization.
   * @type {number}
   * @private
   */
  this.linearIndex_ = 0;

  /**
   * Vertical scroll bar.
   * @type {anychart.ganttModule.ScrollBar}
   * @private
   */
  this.verticalScrollBar_ = null;

  /**
   * Default row height.
   * @type {number}
   * @private
   */
  this.defaultRowHeight_ = 20;

  /**
   * Start index set by api.
   * Needed to set start index before draw.
   * @type {number}
   * @private
   */
  this.apiStartIndex_ = NaN;

  /**
   * End index set by api.
   * Needed to set end index before draw.
   * @type {number}
   * @private
   */
  this.apiEndIndex_ = NaN;

  /**
   * Timeout ids storage.
   * Must be empty on all activities complete.
   * We use it to cancel timeouts on changes while async working.
   * @type {Array.<number>}
   */
  this.timeouts = [];

  /**
   * Contains map of items that are collapsed.
   * Added for https://anychart.atlassian.net/browse/ENV-1391.
   * @type {Object.<anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem>}
   */
  this.collapsedItemsMap = {};

};
goog.inherits(anychart.ganttModule.Controller, anychart.core.Base);


/**
 * Consistency state mask supported by this object.
 * @type {number}
 */
anychart.ganttModule.Controller.prototype.SUPPORTED_SIGNALS =
    anychart.Signal.DATA_CHANGED |
    anychart.Signal.NEEDS_REAPPLICATION;


/**
 * Consistency state mask supported by this object.
 * In this case consistency state
 *  DATA means that the whole tree has been changed. Needs to re-linearize, calculate visible data anew, recalculate start and end indexes.
 *  VISIBILITY means that some item was collapsed/expanded (children become visible/invisible). Needs to recalculate visible data without new tree linearization.
 *  POSITION means that new start, end, offset, available height were set. No need to linearize a tree and build new visibility data.
 * @type {number}
 */
anychart.ganttModule.Controller.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.ConsistencyState.CONTROLLER_DATA |
    anychart.ConsistencyState.CONTROLLER_VISIBILITY |
    anychart.ConsistencyState.CONTROLLER_POSITION;


/**
 * Default cell height.
 * @type {number}
 */
anychart.ganttModule.Controller.DEFAULT_ROW_HEIGHT = 20;


/**
 * Gets/sets default row height.
 * @param {number=} opt_value - Default row height to set.
 * @return {anychart.ganttModule.Controller|number} - Current value or itself for chaining.
 */
anychart.ganttModule.Controller.prototype.defaultRowHeight = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.defaultRowHeight_ != opt_value) {
      this.defaultRowHeight_ = opt_value;
      this.invalidate(anychart.ConsistencyState.CONTROLLER_VISIBILITY, anychart.Signal.NEEDS_REAPPLICATION);
      return this;
    }
  }
  return this.defaultRowHeight_;
};


/**
 * Correctly calculates data item pixel height.
 * @param {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} item - Tree data item.
 * @return {number} - Data item height.
 */
anychart.ganttModule.Controller.prototype.getItemHeight = function(item) {
  return anychart.utils.toNumber(item.get(anychart.enums.GanttDataFields.ROW_HEIGHT)) || this.defaultRowHeight_;
};


/**
 * Listener for controller invalidation.
 * @param {anychart.SignalEvent} event - Invalidation event.
 * @private
 */
anychart.ganttModule.Controller.prototype.dataInvalidated_ = function(event) {
  var state = 0;
  var signal = anychart.Signal.NEEDS_REAPPLICATION;

  /*
   Here meta_changed_signal comes from tree on tree data item change.
   We have to initialize rebuilding of visible data items.
   */
  if (event.hasSignal(anychart.Signal.META_CHANGED)) {
    this.processCollapse(event['item']);
    state |= anychart.ConsistencyState.CONTROLLER_VISIBILITY;
  }

  /*
   Here data_changed_signal comes from tree when tree has some structural changes.
   We have to relinerize data and rebuild visible data items.
   */
  if (event.hasSignal(anychart.Signal.DATA_CHANGED)) {
    state |= anychart.ConsistencyState.CONTROLLER_DATA;
  }

  if (this.dataGrid_ && this.timeline_) {
    this.timeline_.interactivityHandler.invalidate(anychart.ConsistencyState.CHART_LABELS);
  }

  this.invalidate(state, signal);
};


/**
 * Function that decides if we go through data item's children while passage.
 * @param {(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)} item - Tree data item.
 * @return {boolean} - Whether item is expanded.
 * @private
 */
anychart.ganttModule.Controller.prototype.traverseChildrenCondition_ = function(item) {
  return !item.meta(anychart.enums.GanttDataFields.COLLAPSED);
};


/**
 * Function that decides whether data item has children.
 * @param {(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)} item - Tree data item.
 * @return {boolean} - Whether data item has children.
 * @private
 */
anychart.ganttModule.Controller.prototype.itemHasChildrenCondition_ = function(item) {
  return !!item.numChildren();
};


/**
 * Writes item's dates fields to meta as timestamp.
 * @param {(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)} item - Tree data item.
 * @private
 */
anychart.ganttModule.Controller.prototype.datesToMeta_ = function(item) {
  var dateFields = [anychart.enums.GanttDataFields.ACTUAL_START, anychart.enums.GanttDataFields.ACTUAL_END,
    anychart.enums.GanttDataFields.BASELINE_START, anychart.enums.GanttDataFields.BASELINE_END];

  for (var i = 0; i < dateFields.length; i++) {
    var field = dateFields[i];

    var actValue = item.get(field);

    if (goog.isDefAndNotNull(actValue)) {
      var parsedDate = anychart.format.parseDateTime(actValue);
      var parsedVal = goog.isNull(parsedDate) ? NaN : +parsedDate;
      item.meta(field, parsedVal);
    } else {
      item.meta(field, NaN);
    }

    this.checkDate_(item.meta(field));
  }
};


/**
 * Writes item's periods to meta as timestamp.
 *
 * @param {(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)} item - Tree data item.
 * @private
 */
anychart.ganttModule.Controller.prototype.periodsToMeta_ = function(item) {
  var periods = item.get(anychart.enums.GanttDataFields.PERIODS);

  if (this.isResources_ && goog.isArray(periods)) {
    var minPeriodDate = NaN;
    var maxPeriodDate = NaN;

    for (var i = 0, l = periods.length; i < l; i++) {
      var period = periods[i];
      var periodStart = item.getMeta(anychart.enums.GanttDataFields.PERIODS, i, anychart.enums.GanttDataFields.START);
      var periodStartVal = anychart.format.parseDateTime(period[anychart.enums.GanttDataFields.START]);
      if (!goog.isNull(periodStartVal)) {
        periodStartVal = +periodStartVal;
        item.setMeta(anychart.enums.GanttDataFields.PERIODS, i, anychart.enums.GanttDataFields.START, periodStartVal);
        periodStart = periodStartVal;
      }

      var periodEnd = item.getMeta(anychart.enums.GanttDataFields.PERIODS, i, anychart.enums.GanttDataFields.END);
      var periodEndVal = anychart.format.parseDateTime(period[anychart.enums.GanttDataFields.END]);
      if (!goog.isNull(periodEndVal)) {
        periodEndVal = +periodEndVal;
        item.setMeta(anychart.enums.GanttDataFields.PERIODS, i, anychart.enums.GanttDataFields.END, +periodEndVal);
        periodEnd = periodEndVal;
      }

      minPeriodDate = this.actualizeResourceDates_(Math.min, minPeriodDate, maxPeriodDate, periodStart, periodEnd);
      maxPeriodDate = this.actualizeResourceDates_(Math.max, minPeriodDate, maxPeriodDate, periodStart, periodEnd);

      // This extends dates range.
      this.checkDate_(periodStart);
      this.checkDate_(periodEnd);
    }

    item.meta('minPeriodDate', minPeriodDate);
    item.meta('maxPeriodDate', maxPeriodDate);
  }
};


/**
 * Writes item's markers to meta.
 *
 * @param {(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)} item - Tree data item.
 * @private
 */
anychart.ganttModule.Controller.prototype.markersToMeta_ = function(item) {
  var itemMarkers, m, marker, val, parsedDate, parsedVal;
  itemMarkers = item.get(anychart.enums.GanttDataFields.MARKERS);
  for (m = 0; itemMarkers && m < itemMarkers.length; m++) {
    marker = itemMarkers[m];
    val = marker['value'];
    parsedDate = anychart.format.parseDateTime(val);
    parsedVal = goog.isNull(parsedDate) ? null : +parsedDate;
    item.setMeta(anychart.enums.GanttDataFields.MARKERS, m, 'value', parsedVal);
    this.checkDate_(parsedVal);
  }
};

/**
 * Processes collapsed-state.
 *
 * @see https://anychart.atlassian.net/browse/ENV-1391.
 * @param {(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)=} opt_item - Item to
 *  be processed.
 */
anychart.ganttModule.Controller.prototype.processCollapse = function(opt_item) {
  if (opt_item) {
    var uid = opt_item.uid;
    if (opt_item.meta(anychart.enums.GanttDataFields.COLLAPSED)) {
      this.collapsedItemsMap[uid] = opt_item;
    } else {
      delete this.collapsedItemsMap[uid];
    }
  }
};


/**
 * Item's values auto calculation.
 *
 * @param {(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)} item - Current tree data item.
 * @param {number} currentDepth - Current depth.
 * @private
 */
anychart.ganttModule.Controller.prototype.autoCalcItem_ = function(item, currentDepth) {
  item
      .meta('depth', currentDepth)
      .meta('index', this.linearIndex_++);
  this.allItems_.push(item);

  var itemProgressValue = item.get(anychart.enums.GanttDataFields.PROGRESS_VALUE);
  if (goog.isDefAndNotNull(itemProgressValue)) {
    itemProgressValue = anychart.utils.isPercent(itemProgressValue) ? parseFloat(itemProgressValue) / 100 : +itemProgressValue;
    item.meta('progressValue', itemProgressValue);
  } else {
    item.meta('progressValue', null);
  }

  var collapsed = item.get(anychart.enums.GanttDataFields.COLLAPSED);
  if (goog.isBoolean(collapsed)) {
    item.meta(anychart.enums.GanttDataFields.COLLAPSED, collapsed);
  }

  // Block below is for https://anychart.atlassian.net/browse/ENV-1391.
  this.processCollapse(item);

  this.datesToMeta_(item);
  this.periodsToMeta_(item);
  this.markersToMeta_(item);

  var progressLength = 0;
  var totalLength = 0;

  var autoStart = NaN;
  var autoEnd = NaN;

  for (var i = 0, l = item.numChildren(); i < l; i++) {
    var child = item.getChildAt(i);
    if (child.numChildren()) {
      this.autoCalcItem_(child, currentDepth + 1);
    } else {
      child
          .meta('depth', currentDepth + 1)
          .meta('index', this.linearIndex_++);

      this.datesToMeta_(child);
      this.periodsToMeta_(child);
      this.markersToMeta_(child);
      this.allItems_.push(child);
    }

    if (!this.isResources_) {
      var metaStart = child.meta(anychart.enums.GanttDataFields.ACTUAL_START);
      var childStart = /** @type {number} */ ((goog.isNumber(metaStart) && !isNaN(metaStart)) ? metaStart : (child.meta('autoStart') || NaN));

      var metaEnd = child.meta(anychart.enums.GanttDataFields.ACTUAL_END);
      var childEnd = /** @type {number} */ ((goog.isNumber(metaEnd) && !isNaN(metaEnd)) ? metaEnd : (child.meta('autoEnd') || childStart));

      var progressValue = /** @type {number|string} */ (child.get(anychart.enums.GanttDataFields.PROGRESS_VALUE));
      if (goog.isDefAndNotNull(progressValue)) {
        progressValue = anychart.utils.normalizeToRatio(progressValue);
      }

      var childProgress = goog.isDefAndNotNull(progressValue) ? progressValue : (child.meta('autoProgress') || 0);
      child.meta('progressValue', childProgress);

      autoStart = this.actualizeProjectDates_(Math.min, autoStart, autoEnd, childStart, childEnd);
      autoEnd = this.actualizeProjectDates_(Math.max, autoStart, autoEnd, childStart, childEnd);

      if (!isNaN(childStart) && !isNaN(childEnd)) {
        var delta = (/** @type {number} */(childEnd) - /** @type {number} */(childStart));
        progressLength += /** @type {number} */(childProgress) * delta;
        totalLength += delta;
      }
    }
  }

  if (item.numChildren() && !this.isResources_) {
    if (totalLength != 0) item.meta('autoProgress', progressLength / totalLength);
    item.meta('autoStart', autoStart);
    item.meta('autoEnd', autoEnd);
  }

};


/**
 * Gets min or max value, filters invalid values.
 * This method differs from actualizeProjectDates_ according to ticket's task (DVF-4405).
 *
 * @param {Function} fn - Math.min() or Math.max(), function to get min or max value.
 * @param {*} autoStart - Value to select from.
 * @param {*} autoEnd - Value to select from.
 * @param {*} childStart - Value to select from.
 * @param {*} childEnd - Value to select from.
 * @return {number} - Min or max value depending on fn passed.
 * @private
 */
anychart.ganttModule.Controller.prototype.actualizeResourceDates_ = function(fn, autoStart, autoEnd, childStart, childEnd) {
  var vals = [];

  if (this.isValidNumber_(autoStart)) {
    vals.push(autoStart);
  }
  if (this.isValidNumber_(autoEnd)) {
    vals.push(autoEnd);
  }
  if (this.isValidNumber_(childStart)) {
    vals.push(childStart);
  }
  if (this.isValidNumber_(childEnd)) {
    vals.push(childEnd);
  }

  return vals.length ? fn.apply(null, vals) : NaN;
};


/**
 * Gets min or max value, filters invalid values.
 *
 * @param {Function} fn - Math.min() or Math.max(), function to get min or max value.
 * @param {number} autoStart - Value to select from.
 * @param {number} autoEnd - Value to select from.
 * @param {number} childStart - Value to select from.
 * @param {number} childEnd - Value to select from.
 * @return {number} - Min or max value depending on fn passed.
 * @private
 */
anychart.ganttModule.Controller.prototype.actualizeProjectDates_ = function(fn, autoStart, autoEnd, childStart, childEnd) {
  var vals = [];

  if (this.isValidNumber_(autoStart)) {
    vals.push(autoStart);
    if (this.isValidNumber_(autoEnd))
      vals.push(autoEnd);
  }

  if (this.isValidNumber_(childStart)) {
    vals.push(childStart);
    if (this.isValidNumber_(childEnd))
      vals.push(childEnd);
  }
  return vals.length ? fn.apply(null, vals) : NaN;
};


/**
 * Checks for valid numeric value.
 * @param {*} val - Value to check.
 * @return {boolean}
 * @private
 */
anychart.ganttModule.Controller.prototype.isValidNumber_ = function(val) {
  return goog.isNumber(val) && !isNaN(val);
};


/**
 * Linearizes tree. Used to add necessary meta information to data items in a straight tree passage.
 * @return {anychart.ganttModule.Controller} - Itself for method chaining.
 * @private
 */
anychart.ganttModule.Controller.prototype.linearizeData_ = function() {
  this.linearIndex_ = 0;
  this.minDate_ = NaN;
  this.maxDate_ = NaN;

  /*
    Setting NaN values fixes some bug with no data but breaks live edit on editing
    item scrolled to bottom.
    I really can't find the bug that was fixed by setting NaNs.
    Hope, CAT will help us to find an issue.
   */
  // this.startIndex_ = NaN;
  // this.endIndex_ = NaN;

  this.allItems_.length = 0;

  this.data_.suspendSignalsDispatching();
  for (var i = 0, l = this.data_.numChildren(); i < l; i++) {
    var root = this.data_.getChildAt(i);
    this.autoCalcItem_(/** @type {anychart.treeDataModule.Tree.DataItem} */ (root), 0);
  }

  if (this.minDate_ == this.maxDate_) {
    var date = this.minDate_;
    var interval = 43200000; //ms in 12 hours.
    this.minDate_ = date - interval;
    this.maxDate_ = date + interval;
  }

  this.data_.resumeSignalsDispatching(false);
  return this;
};


/**
 * Checks data item to get it's date fields and extend current min-max range.
 * @param {*} date - Timestamp.
 * @private
 */
anychart.ganttModule.Controller.prototype.checkDate_ = function(date) {
  if (goog.isNumber(date) && !isNaN(date)) {
    if (isNaN(this.minDate_)) { //If one of dates is NaN - the second one is NaN as well.
      this.minDate_ = date;
      this.maxDate_ = date;
    }

    this.minDate_ = Math.min(date, this.minDate_);
    this.maxDate_ = Math.max(date, this.maxDate_);
  }
};


/**
 * Fills this.visibleItems_ and this.heightCache with data.
 * @return {anychart.ganttModule.Controller} - Itself for method chaining.
 * @private
 */
anychart.ganttModule.Controller.prototype.getVisibleData_ = function() {
  this.visibleItems_.length = 0;
  this.heightCache_.length = 0;
  this.connectorsData_.length = 0; //Resetting connectors map.
  this.periodsMap_ = {};
  this.visibleItemsMap_ = {};

  var item;
  var height = 0;
  this.expandedItemsTraverser_.reset();
  while (this.expandedItemsTraverser_.advance()) {
    item = /** @type {(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)} */ (this.expandedItemsTraverser_.current());
    this.visibleItems_.push(item);
    height += (this.getItemHeight(item) + this.rowStrokeThickness_);
    this.heightCache_.push(height);

    var itemId = item.get(anychart.enums.GanttDataFields.ID);
    var visItem = {'item': item, 'index': this.heightCache_.length - 1};
    if (goog.isDef(itemId) && !this.visibleItemsMap_[itemId]) this.visibleItemsMap_[itemId] = visItem;

    if (this.isResources_) {
      var periods = item.get(anychart.enums.GanttDataFields.PERIODS);
      if (goog.isArray(periods)) {
        //Working with raw array.
        for (var i = 0, l = periods.length; i < l; i++) {
          var period = periods[i];
          var periodId = period[anychart.enums.GanttDataFields.ID];
          var periodItem = {'period': period, 'index': this.heightCache_.length - 1, 'periodIndex': i};

          /*
            We must store an index of data item to determine the vertical coordinate of connector.
            Period itself is stored to access its fields.
           */
          if (!this.periodsMap_[periodId]) this.periodsMap_[periodId] = periodItem;

          //Building connectors map for resource chart.
          var to, type, connectorsMapItem;
          if (goog.isArray(period[anychart.enums.GanttDataFields.CONNECTOR])) { //New behaviour.
            var connectors = period[anychart.enums.GanttDataFields.CONNECTOR];
            for (var j = 0; j < connectors.length; j++) {
              var connector = connectors[j];
              if (connector) {
                //We put here a link to the period if it is already in the map or ID of destination period.
                to = this.periodsMap_[connector[anychart.enums.GanttDataFields.CONNECT_TO]] || connector[anychart.enums.GanttDataFields.CONNECT_TO];
                type = connector[anychart.enums.GanttDataFields.CONNECTOR_TYPE];
                connectorsMapItem = {'from': periodItem, 'to': to};
                if (type) connectorsMapItem['type'] = type;
                connectorsMapItem['connSettings'] = connector;
                this.connectorsData_.push(connectorsMapItem);
              }
            }
          } else if (period[anychart.enums.GanttDataFields.CONNECT_TO]) { //Deprecated behaviour.
            //We put here a link to the period if it is already in the map or ID of destination period.
            to = this.periodsMap_[period[anychart.enums.GanttDataFields.CONNECT_TO]] || period[anychart.enums.GanttDataFields.CONNECT_TO];
            type = period[anychart.enums.GanttDataFields.CONNECTOR_TYPE];
            connectorsMapItem = {'from': periodItem, 'to': to};
            if (type) connectorsMapItem['type'] = type;
            if (period[anychart.enums.GanttDataFields.CONNECTOR]) connectorsMapItem['connSettings'] = period[anychart.enums.GanttDataFields.CONNECTOR];
            this.connectorsData_.push(connectorsMapItem);
          }
        }
      }
    } else {
      //Building connectors map for project chart.
      var connectTo, itemConnectTo, connType, taskMapItem;
      if (goog.isArray(item.get(anychart.enums.GanttDataFields.CONNECTOR))) {//New behaviour.
        var projConnectors = item.get(anychart.enums.GanttDataFields.CONNECTOR);
        for (var k = 0; k < projConnectors.length; k++) {
          var conn = projConnectors[k];
          if (conn) {
            connectTo = conn[anychart.enums.GanttDataFields.CONNECT_TO];
            itemConnectTo = this.visibleItemsMap_[connectTo] || connectTo;
            connType = conn[anychart.enums.GanttDataFields.CONNECTOR_TYPE];
            taskMapItem = {'from': visItem, 'to': itemConnectTo};
            if (connType) taskMapItem['type'] = connType;
            taskMapItem['connSettings'] = conn;
            this.connectorsData_.push(taskMapItem);
          }
        }
      } else if (item.get(anychart.enums.GanttDataFields.CONNECT_TO)) {
        connectTo = item.get(anychart.enums.GanttDataFields.CONNECT_TO);
        itemConnectTo = this.visibleItemsMap_[connectTo] || connectTo;
        connType = item.get(anychart.enums.GanttDataFields.CONNECTOR_TYPE);
        taskMapItem = {'from': visItem, 'to': itemConnectTo};
        if (connType) taskMapItem['type'] = connType;
        if (item.get(anychart.enums.GanttDataFields.CONNECTOR)) taskMapItem['connSettings'] = item.get(anychart.enums.GanttDataFields.CONNECTOR);
        this.connectorsData_.push(taskMapItem);
      }
    }
  }

  return this;
};


/**
 * Whether controller works in resources mode.
 * @return {boolean}
 */
anychart.ganttModule.Controller.prototype.isResources = function() {
  return this.isResources_;
};


/**
 * Returns an actual height between rows.
 * NOTE: Considers a row spacing.
 * @param {number} startIndex - Start index.
 * @param {number=} opt_endIndex - End index.
 * @return {number} - Actual height.
 */
anychart.ganttModule.Controller.prototype.getHeightByIndexes = function(startIndex, opt_endIndex) {
  if (!this.heightCache_.length) return 0;

  var cacheEnd = this.heightCache_.length - 1;
  startIndex = Math.min(startIndex, cacheEnd);
  opt_endIndex = goog.isDef(opt_endIndex) ? Math.min(opt_endIndex, cacheEnd) : cacheEnd;


  if (startIndex > opt_endIndex) { //Swapping numbers. Super memory usage optimization.
    startIndex = startIndex - opt_endIndex;
    opt_endIndex = opt_endIndex + startIndex;
    startIndex = opt_endIndex - startIndex;
  }

  var startHeight = this.heightCache_[startIndex - 1] || 0;

  return this.heightCache_[opt_endIndex] - startHeight;
};


/**
 * Calculates index related to height specified.
 * NOTE: Make sure height belongs to [0 .. this.heightCache_[this.heightCache_.length - 1]].
 * @param {number} height - Height.
 * @return {number} - Index.
 */
anychart.ganttModule.Controller.prototype.getIndexByHeight = function(height) {
  var index = goog.array.binarySearch(this.heightCache_, height);
  return index >= 0 ? index : ~index;
};


/**
 * Sets values for this.startIndex_, this.endIndex_ and this.verticalOffset_ if needed based on this.visibleItems_ and
 *  this.availableHeight_.
 * Clears POSITION consistency state.
 */
anychart.ganttModule.Controller.prototype.recalculate = function() {
  if (this.visibleItems_.length) {
    this.startIndex_ = isNaN(this.startIndex_) ? this.apiStartIndex_ : this.startIndex_;
    this.endIndex_ = isNaN(this.endIndex_) ? this.apiEndIndex_ : this.endIndex_;
    this.apiStartIndex_ = NaN;
    this.apiEndIndex_ = NaN;

    if (!isNaN(this.startIndex_)) this.startIndex_ = goog.math.clamp(this.startIndex_, 0, this.visibleItems_.length - 1);
    if (!isNaN(this.endIndex_)) this.endIndex_ = goog.math.clamp(this.endIndex_, 0, this.visibleItems_.length - 1);

    var totalHeight = this.getHeightByIndexes(0, this.heightCache_.length - 1);

    if (this.availableHeight_ >= totalHeight) {
      this.startIndex_ = 0;
      this.verticalOffset_ = 0;
      this.endIndex_ = this.visibleItems_.length - 1;
    } else {
      if (isNaN(this.startIndex_) && isNaN(this.endIndex_)) this.startIndex_ = 0;

      if (!isNaN(this.startIndex_)) { //Start index is set.
        totalHeight = this.getHeightByIndexes(this.startIndex_) - this.verticalOffset_;
        if (totalHeight < this.availableHeight_) { //Going from end of list.
          this.startIndex_ = this.getIndexByHeight(this.heightCache_[this.heightCache_.length - 1] - this.availableHeight_);
          this.endIndex_ = this.heightCache_.length - 1;
          this.verticalOffset_ = this.getHeightByIndexes(this.startIndex_, this.endIndex_) - this.availableHeight_;
        } else {
          var height = !this.startIndex_ ? 0 : this.heightCache_[this.startIndex_ - 1];
          this.endIndex_ = this.getIndexByHeight(height + this.availableHeight_ + this.verticalOffset_);
        }
      } else { //End index is set, start index must be NaN here.
        totalHeight = this.getHeightByIndexes(0, this.endIndex_);
        if (totalHeight < this.availableHeight_) { //Going from start of list.
          this.startIndex_ = 0;
          this.verticalOffset_ = 0;
          this.endIndex_ = this.getIndexByHeight(this.availableHeight_);
        } else {
          /*
           This case has another behaviour: when start index is set, we consider the vertical offset.
           In this case (end index is set instead), we suppose that end index cell is fully visible in the end
           of data grid. It means that we do not consider the vertical offset and calculate it as well.
           */
          this.startIndex_ = this.getIndexByHeight(this.heightCache_[this.endIndex_] - this.availableHeight_);
          this.verticalOffset_ = this.getHeightByIndexes(this.startIndex_, this.endIndex_) - this.availableHeight_;
        }
      }
    }

  } else {
    this.startIndex_ = 0;
    this.endIndex_ = 0;
    this.verticalOffset_ = 0;
  }
  this.positionRecalculated_ = true;
  if (!anychart.isAsync()) {
    /*
      Async feature needs to have controller invalidated.
     */
    this.markConsistent(anychart.ConsistencyState.CONTROLLER_POSITION);
  }
};


/**
 * Gets periods map.
 * @return {Object} - Map that contains related period by its id.
 */
anychart.ganttModule.Controller.prototype.getPeriodsMap = function() {
  return this.periodsMap_;
};


/**
 * Gets visible items map.
 * @return {Object} - Map that contains related tree data items by its id.
 */
anychart.ganttModule.Controller.prototype.getVisibleItemsMap = function() {
  return this.visibleItemsMap_;
};


/**
 * Gets connectors data.
 * @return {Array.<Object>} - Connectors data.
 */
anychart.ganttModule.Controller.prototype.getConnectorsData = function() {
  return this.connectorsData_;
};


/**
 * Gets height cache.
 * @return {Array.<number>} - Height cache.
 */
anychart.ganttModule.Controller.prototype.getHeightCache = function() {
  return this.heightCache_;
};


/**
 * Gets visible items.
 * @return {Array.<(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)>} - Height cache.
 */
anychart.ganttModule.Controller.prototype.getVisibleItems = function() {
  return this.visibleItems_;
};


/**
 * Gets all items.
 * @return {Array.<(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)>} - Height cache.
 */
anychart.ganttModule.Controller.prototype.getAllItems = function() {
  return this.allItems_;
};


/**
 * Gets min date.
 * @return {number} - Min date.
 */
anychart.ganttModule.Controller.prototype.getMinDate = function() {
  return this.minDate_;
};


/**
 * Gets max date.
 * @return {number} - Height cache.
 */
anychart.ganttModule.Controller.prototype.getMaxDate = function() {
  return this.maxDate_;
};


/**
 * Gets/sets source data tree.
 * @param {(anychart.treeDataModule.Tree|anychart.treeDataModule.View)=} opt_value - Value to be set.
 * @return {(anychart.ganttModule.Controller|anychart.treeDataModule.Tree|anychart.treeDataModule.View)} - Current value or itself for method chaining.
 */
anychart.ganttModule.Controller.prototype.data = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if ((this.data_ != opt_value) && (anychart.utils.instanceOf(opt_value, anychart.treeDataModule.Tree) || anychart.utils.instanceOf(opt_value, anychart.treeDataModule.View))) {
      var dispatchWorkingCancel = false;
      this.collapsedItemsMap = {};

      if (this.data_) { //Stop listening old tree.
        this.data_.unlistenSignals(this.dataInvalidated_, this);
        dispatchWorkingCancel = true;
      }
      this.data_ = opt_value;
      this.data_.listenSignals(this.dataInvalidated_, this);

      this.expandedItemsTraverser_ = this.data_.getTraverser();
      this.expandedItemsTraverser_.traverseChildrenCondition(this.traverseChildrenCondition_);
      if (this.timeline_)
        this.timeline_.scale().reset();

      if (anychart.isAsync()) {
        /*
          ASYNC feature specific activities like working-events dispatching
          and special invalidation.
         */
        if (this.dataGrid_) {
          this.resetTimeouts();
          this.dataGrid_.resetColumnsSync();
          if (dispatchWorkingCancel)
            this.getDispatcher().dispatchEvent(anychart.enums.EventType.WORKING_CANCEL);
        }

        this.getDispatcher().invalidate(anychart.ConsistencyState.CHART_LABELS);
      } else {
        if (this.dataGrid_ && this.timeline_) {
          this.timeline_.interactivityHandler.invalidate(anychart.ConsistencyState.CHART_LABELS);
        }
      }

      this.invalidate(anychart.ConsistencyState.CONTROLLER_DATA, anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  }
  return this.data_;
};


/**
 * Gets/sets vertical offset.
 * NOTE: setting start index resets verticalOffset to 0. That's why set vertical offset AFTER you set the start index.
 * @param {number=} opt_value - Value to be set.
 * @return {(anychart.ganttModule.Controller|number)} - Current value or itself for method chaining.
 */
anychart.ganttModule.Controller.prototype.verticalOffset = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.verticalOffset_ != opt_value) {
      this.verticalOffset_ = opt_value;
      this.invalidate(anychart.ConsistencyState.CONTROLLER_POSITION, anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  }
  return this.verticalOffset_;
};


/**
 * Gets/sets start index.
 * NOTE: Calling this method sets this.endIndex_ to NaN to recalculate value correctly anew.
 * ALSO NOTE: Resets vertical offset to 0 to show required cell all.
 * @param {number=} opt_value - Value to be set.
 * @return {(anychart.ganttModule.Controller|number)} - Current value or itself for method chaining.
 */
anychart.ganttModule.Controller.prototype.startIndex = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (!isNaN(opt_value)) {
      this.startIndex_ = opt_value;
      this.endIndex_ = NaN;
      this.apiStartIndex_ = opt_value;
      this.apiEndIndex_ = NaN;
      this.verticalOffset_ = 0;
      this.invalidate(anychart.ConsistencyState.CONTROLLER_POSITION, anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  }
  return this.startIndex_;
};


/**
 * Gets/sets end index.
 * NOTE: Calling this method sets this.startIndex_ to NaN to recalculate value correctly anew.
 * @param {number=} opt_value - Value to be set.
 * @return {(anychart.ganttModule.Controller|number)} - Current value or itself for method chaining.
 */
anychart.ganttModule.Controller.prototype.endIndex = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (!isNaN(opt_value)) {
      this.startIndex_ = NaN;
      this.endIndex_ = opt_value;
      this.apiStartIndex_ = NaN;
      this.apiEndIndex_ = opt_value;
      this.invalidate(anychart.ConsistencyState.CONTROLLER_POSITION, anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  }
  return this.endIndex_;
};


/**
 * Gets/sets available height.
 * @param {number=} opt_value - Value to be set.
 * @return {(anychart.ganttModule.Controller|number)} - Current value or itself for method chaining.
 */
anychart.ganttModule.Controller.prototype.availableHeight = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.availableHeight_ != opt_value) {
      this.availableHeight_ = opt_value;
      this.invalidate(anychart.ConsistencyState.CONTROLLER_POSITION, anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  }
  return this.availableHeight_;
};


/**
 * Gets/sets row stroke thickness.
 * @param {number=} opt_value - Value to be set.
 * @return {number|anychart.ganttModule.Controller} - Current value or itself for method chaining.
 */
anychart.ganttModule.Controller.prototype.rowStrokeThickness = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.rowStrokeThickness_ != opt_value) {
      this.rowStrokeThickness_ = opt_value;
      this.invalidate(anychart.ConsistencyState.CONTROLLER_VISIBILITY, anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  }
  return this.rowStrokeThickness_;
};


/**
 * Gets/sets data grid.
 * @param {anychart.ganttModule.DataGrid=} opt_value - Value to be set.
 * @return {(anychart.ganttModule.DataGrid|anychart.ganttModule.Controller)} - Current value or itself for method chaining.
 */
anychart.ganttModule.Controller.prototype.dataGrid = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.dataGrid_ != opt_value) {
      this.dataGrid_ = opt_value;
      this.invalidate(anychart.ConsistencyState.CONTROLLER_POSITION, anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  }
  return this.dataGrid_;
};


/**
 * Gets/sets timeline.
 * @param {anychart.ganttModule.TimeLine=} opt_value - Value to be set.
 * @return {(anychart.ganttModule.TimeLine|anychart.ganttModule.Controller)} - Current value or itself for method chaining.
 */
anychart.ganttModule.Controller.prototype.timeline = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.timeline_ != opt_value) {
      this.timeline_ = opt_value;
      this.invalidate(anychart.ConsistencyState.CONTROLLER_POSITION, anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  }
  return this.timeline_;
};


/**
 * TODO (A.Kudryavtsev): describe.
 * @private
 */
anychart.ganttModule.Controller.prototype.dataInvalidationProcessor_ = function() {
  if (anychart.isAsync() || !this.isConsistent()) {
    if (this.hasInvalidationState(anychart.ConsistencyState.CONTROLLER_DATA)) {
      this.linearizeData_();

      /*
        This signal is for another entities to process the linearized data.
       */
      this.dispatchSignal(anychart.Signal.DATA_CHANGED);

      this.markConsistent(anychart.ConsistencyState.CONTROLLER_DATA);
      if (this.timeline_)
        this.timeline_.initScale();
      this.invalidate(anychart.ConsistencyState.CONTROLLER_VISIBILITY);
    }
  }

  this.drawingInvalidationProcessor_();
};


/**
 * TODO (A.Kudryavtsev): describe.
 * @private
 */
anychart.ganttModule.Controller.prototype.drawingInvalidationProcessor_ = function() {
  if (anychart.isAsync() || !this.isConsistent()) {
    if (this.hasInvalidationState(anychart.ConsistencyState.CONTROLLER_VISIBILITY)) {
      this.getVisibleData_();
      this.markConsistent(anychart.ConsistencyState.CONTROLLER_VISIBILITY);
      this.invalidate(anychart.ConsistencyState.CONTROLLER_POSITION);
    }

    if (this.restoreScrollState_) {
      this.scrollTo(this.scrollTo_);
      this.restoreScrollState_ = false;
    }


    this.recalculate();

    if (anychart.isAsync())
      this.markConsistent(anychart.ConsistencyState.CONTROLLER_POSITION);

    if (!isNaN(this.minDate_) && this.minDate_ == this.maxDate_) {
      this.minDate_ -= anychart.scales.GanttDateTime.MILLISECONDS_IN_DAY;
      this.maxDate_ += anychart.scales.GanttDateTime.MILLISECONDS_IN_DAY;
    }
  }

  if (!anychart.isAsync()) {
    if (this.dataGrid_)
      this.dataGrid_.prepareLabels();
    if (this.timeline_)
      this.timeline_.prepareLabels();
  }

  anychart.measuriator.measure();

  this.remainingInvalidationProcessor_();
};


/**
 * TODO (A.Kudryavtsev): Describe and rename.
 * @private
 */
anychart.ganttModule.Controller.prototype.remainingInvalidationProcessor_ = function() {
  var stage = null;
  if (this.dataGrid_ && this.dataGrid_.container())
    stage = this.dataGrid_.container().getStage();
  if (!stage && this.timeline_ && this.timeline_.container())
    stage = this.timeline_.container().getStage();
  if (stage)
    stage.suspend();

  //This must be called anyway. Clears consistency states of data grid not related to controller.
  if (this.dataGrid_)
    this.dataGrid_.drawInternal(this.positionRecalculated_);
  if (this.timeline_)
    this.timeline_.drawInternal(this.positionRecalculated_);

  if (this.verticalScrollBar_) {
    this.verticalScrollBar_.suspendSignalsDispatching();
    this.verticalScrollBar_.handlePositionChange(false);

    var startRatio = 0;
    var endRatio = 1;

    if (this.heightCache_.length) {
      var itemHeight = this.getHeightByIndexes(this.startIndex_, this.startIndex_);
      var height = this.heightCache_[this.startIndex_] - itemHeight;

      var start = height + this.verticalOffset_;
      var end = start + this.availableHeight_;
      this.scrollTo_ = start;

      var totalEnd = this.heightCache_[this.heightCache_.length - 1];

      var contentBoundsSimulation = new anychart.math.Rect(0, 0, 0, totalEnd);

      startRatio = anychart.math.round(start / totalEnd, 4);
      endRatio = anychart.math.round(end / totalEnd, 4);

      this.verticalScrollBar_.contentBounds(contentBoundsSimulation);
    }

    this.verticalScrollBar_
        .setRatio(startRatio, endRatio)
        .draw()
        .handlePositionChange(true)
        .resumeSignalsDispatching(false);
  }

  if (stage)
    stage.resume();

  this.positionRecalculated_ = false;
};


/**
 * TODO (A.Kudryavtsev): Describe.
 * @private
 */
anychart.ganttModule.Controller.prototype.finalProcessor_ = function() {
  // console.log('Final Processor');
  if (this.dataGrid_)
    this.dataGrid_.prepareLabels();

  this.timeouts.push(anychart.utils.schedule(function() {
    if (this.dataGrid_)
      this.dataGrid_.drawInternal(this.positionRecalculated_);
    if (this.timeline_)
      this.timeline_.drawInternal(this.positionRecalculated_);
  }, void 0, this));
};


/**
 * Resets currently scheduled timeouts.
 */
anychart.ganttModule.Controller.prototype.resetTimeouts = function() {
  while (this.timeouts.length) {
    clearTimeout(this.timeouts.pop());
  }
};


/**
 * Gets events dispatcher.
 * @return {anychart.ganttModule.IInteractiveGrid}
 */
anychart.ganttModule.Controller.prototype.getDispatcher = function() {
  return (this.dataGrid_ && this.dataGrid_.interactivityHandler) || (this.timeline_ && this.timeline_.interactivityHandler);
};


/**
 * Runs controller.
 * Actually clears all consistency states and applies changes to related data grid.
 */
anychart.ganttModule.Controller.prototype.run = function() {
  if (anychart.isAsync()) {
    /*
      General feature: partial not blocking behaviour.
     */
    this.timeouts.push(anychart.utils.schedule(function() {
      this.timeouts.push(anychart.utils.schedule(this.dataInvalidationProcessor_, void 0, this));
      this.timeouts.push(anychart.utils.schedule(this.finalProcessor_, void 0, this));
    }, void 0, this));
  } else {
    /*
      Synchronous behaviour.
     */
    this.dataInvalidationProcessor_();
  }
};


/**
 * Generates vertical scroll bar.
 * @return {anychart.ganttModule.ScrollBar} - Scroll bar.
 */
anychart.ganttModule.Controller.prototype.getScrollBar = function() {
  if (!this.verticalScrollBar_) {
    this.verticalScrollBar_ = new anychart.ganttModule.ScrollBar();
    this.verticalScrollBar_.setupByJSON(/** @type {!Object} */ (anychart.getFlatTheme('defaultScrollBar')));
    this.verticalScrollBar_.layout(anychart.enums.Layout.VERTICAL);

    var controller = this;

    this.verticalScrollBar_.listen(anychart.enums.EventType.SCROLL_CHANGE, function(e) {
      var startRatio = e['startRatio'];
      var endRatio = e['endRatio'];
      var totalHeight = controller.heightCache_[controller.heightCache_.length - 1];

      controller.suspendSignalsDispatching();

      if (!startRatio) { //This fixes JS rounding.
        controller
            .startIndex(0)
            .verticalOffset(0);
      } else if (endRatio == 1) { //This fixed JS rounding troubles.
        controller.endIndex(controller.heightCache_.length); //This exceeds MAX index (max is length-1). That's why it will set visual appearance correctly.
      } else {
        var startHeight = Math.round(startRatio * totalHeight);
        var startIndex = controller.getIndexByHeight(startHeight);
        var previousHeight = startIndex ? controller.heightCache_[startIndex - 1] : 0;
        var verticalOffset = startHeight - previousHeight;
        controller
            .startIndex(startIndex)
            .verticalOffset(verticalOffset);
      }

      controller.resumeSignalsDispatching(true);
      //controller.run();
    });
  }
  return this.verticalScrollBar_;
};


/**
 * Scrolls controller to pixel offset specified.
 * TODO (A.Kudryavtsev): Describe how this method fits to total height and available height.
 * @param {number=} opt_value - Vertical pixel total offset.
 * @return {anychart.ganttModule.Controller|number} - Value or itself for method chaining.
 */
anychart.ganttModule.Controller.prototype.scrollTo = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var pxOffset = Math.max(+opt_value, 0);
    if (this.heightCache_.length) {
      var totalHeight = this.heightCache_[this.heightCache_.length - 1];
      this.suspendSignalsDispatching();

      if (pxOffset > totalHeight - this.availableHeight_) { //auto scroll to end
        this.endIndex(this.heightCache_.length - 1);
      } else {
        var itemIndex = this.getIndexByHeight(pxOffset);
        var previousHeight = itemIndex ? this.heightCache_[itemIndex - 1] : 0;
        var verticalOffset = pxOffset - previousHeight;
        this
            .startIndex(itemIndex)
            .verticalOffset(verticalOffset);
      }

      if (anychart.isAsync())
        this.recalculate();

      this.resumeSignalsDispatching(true);
    } else {
      this.scrollTo_ = pxOffset;
      this.restoreScrollState_ = true;
    }
    return this;
  }

  return this.scrollTo_;
};


/**
 * Performs vertical scroll to rowIndex specified.
 * TODO (A.Kudryavtsev): Describe how this method fits to total rows count.
 * @param {number} rowIndex - Row index to scroll to.
 * @return {anychart.ganttModule.Controller} - Itself for method chaining.
 */
anychart.ganttModule.Controller.prototype.scrollToRow = function(rowIndex) {
  this
      .suspendSignalsDispatching()
      .startIndex(rowIndex)
      .verticalOffset(0)
      .resumeSignalsDispatching(true);
  return this;
};


/**
 * Scrolls controller to set end index specified.
 * @param {number=} opt_index - End index to be set.
 * @return {anychart.ganttModule.Controller} - Itself for method chaining.
 */
anychart.ganttModule.Controller.prototype.scrollToEnd = function(opt_index) {
  opt_index = opt_index || this.heightCache_.length - 1;
  return /** @type {anychart.ganttModule.Controller} */ (this.endIndex(opt_index));
};


/**
 * Collapses/expands all.
 * @param {boolean} value - Value to be set.
 * @return {anychart.ganttModule.Controller} - Itself for method chaining.
 * @private
 */
anychart.ganttModule.Controller.prototype.collapseAll_ = function(value) {
  this.data_.suspendSignalsDispatching();
  var traverser = this.data_.getTraverser();
  traverser.nodeYieldCondition(this.itemHasChildrenCondition_);
  while (traverser.advance()) {
    var item = traverser.current();
    item.meta(anychart.enums.GanttDataFields.COLLAPSED, value);
    this.processCollapse(item);
  }

  this.data_.resumeSignalsDispatching(true);
  return this;
};


/**
 * Expands all.
 * @return {anychart.ganttModule.Controller} - Itself for method chaining.
 */
anychart.ganttModule.Controller.prototype.expandAll = function() {
  return this.collapseAll_(false);
};


/**
 * Collapses all.
 * @return {anychart.ganttModule.Controller} - Itself for method chaining.
 */
anychart.ganttModule.Controller.prototype.collapseAll = function() {
  return this.collapseAll_(true);
};


/** @inheritDoc */
anychart.ganttModule.Controller.prototype.serialize = function() {
  var json = anychart.ganttModule.Controller.base(this, 'serialize');

  json['isResourceChart'] = this.isResources_;
  if (this.data_)
    json['treeData'] = this.data_.serializeWithoutMeta(['collapsed']);
  json['verticalOffset'] = this.verticalOffset();
  if (!isNaN(this.startIndex()))
    json['startIndex'] = this.startIndex();
  else if (!isNaN(this.endIndex()))
    json['endIndex'] = this.endIndex();

  json['scrollTo'] = this.scrollTo_;

  return json;
};


/** @inheritDoc */
anychart.ganttModule.Controller.prototype.setupByJSON = function(config, opt_default) {
  anychart.ganttModule.Controller.base(this, 'setupByJSON', config, opt_default);

  this.isResources_ = config['isResourceChart']; //Direct setup. I don't want to believe that it is kind of hack.
  if ('treeData' in config) this.data(anychart.treeDataModule.Tree.fromJson(config['treeData']));
  this.verticalOffset(config['verticalOffset']);
  if ('startIndex' in config)
    this.startIndex(config['startIndex']);
  else if ('endIndex' in config)
    this.endIndex(config['endIndex']);

  /*
    NOTE: setupByJSON is called before linearizing the data.
          scrollTo() sets this.restoreScrollState_ to true.
   */
  if ('scrollTo' in config)
    this.scrollTo(+config['scrollTo']);
};
