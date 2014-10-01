goog.provide('anychart.gantt.Controller');

goog.require('anychart.Base');

goog.require('goog.array');



/**
 * Gantt controller implementation.
 * TODO (A.Kudryavtsev): Describe.
 *
 * @constructor
 * @extends {anychart.Base}
 */
anychart.gantt.Controller = function() {
  goog.base(this);

  /**
   * Tree data.
   * @type {anychart.data.Tree}
   * @private
   */
  this.data_ = null;

  /**
   * Visible items of tree (items that are not hidden by collapse).
   * @type {Array.<anychart.data.Tree.DataItem>}
   * @private
   */
  this.visibleData_ = [];

  /**
   * Array that contains a row height differences.
   * NOTE: This array doesn't store row spaces!
   * @type {Array.<number>}
   * @private
   */
  this.heightCache_ = [];

  /**
   * Related data grid.
   * @type {anychart.elements.DataGrid}
   * @private
   */
  this.dataGrid_ = null;


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
   * @type {anychart.data.Traverser}
   * @private
   */
  this.expandedItemsTraverser_ = null;

};
goog.inherits(anychart.gantt.Controller, anychart.Base);


/**
 * Correctly calculates data item pixel height.
 * @param {anychart.data.Tree.DataItem} item - Tree data item.
 * @return {number} - Data item height.
 */
anychart.gantt.Controller.getItemHeight = function(item) {
  return anychart.utils.toNumber(item.get('rowHeight')) || anychart.elements.DataGrid.DEFAULT_ROW_HEIGHT;
};


/**
 * Consistency state mask supported by this object.
 * @type {number}
 */
anychart.gantt.Controller.prototype.SUPPORTED_SIGNALS = anychart.Signal.NEEDS_REAPPLICATION;


/**
 * Consistency state mask supported by this object.
 * In this case consistency state
 *  DATA means that the whole tree has been changed. Needs to re-linearize, calculate visible data anew, recalculate start& end indexes.
 *  VISIBILITY means that some item was collapsed/expanded (children become visible/invisible). Needs to recalculate visible data without new tree linearization.
 *  POSITION means that new start, end, offset, available height were set. No need to linearize a tree and build new visibility data.
 * @type {number}
 */
anychart.gantt.Controller.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.ConsistencyState.DATA |
    anychart.ConsistencyState.VISIBILITY |
    anychart.ConsistencyState.POSITION;


/**
 * Listener for controller invalidation.
 * @param {anychart.SignalEvent} event - Invalidation event.
 * @private
 */
anychart.gantt.Controller.prototype.dataInvalidated_ = function(event) {
  var state = 0;
  var signal = anychart.Signal.NEEDS_REAPPLICATION;

  /*
    Here meta_changed_signal comes from tree on tree data item change.
    We have to initialize rebuilding of visible data items.
  */
  if (event.hasSignal(anychart.Signal.META_CHANGED)) state |= anychart.ConsistencyState.VISIBILITY;

  /*
    Here data_changed_signal comes from tree when tree has some structural changes.
    We have to relinerize data and rebuild visible data items.
  */
  if (event.hasSignal(anychart.Signal.DATA_CHANGED)) state |= anychart.ConsistencyState.DATA;

  this.invalidate(state, signal);
};


/**
 * Function that decides if we go through data item's children while passage.
 * @param {anychart.data.Tree.DataItem} item - Tree data item.
 * @return {boolean} - Whether item is expanded.
 * @private
 */
anychart.gantt.Controller.prototype.traverseChildrenCondition_ = function(item) {
  return !item.meta('collapsed');
};


/**
 * Linearizes tree. Used to add necessary meta information to data items in a straight tree passage.
 * @return {anychart.gantt.Controller} - Itself for method chaining.
 * @private
 */
anychart.gantt.Controller.prototype.linearizeData_ = function() {
  var item;
  var linearIndex = 0;

  this.data_.suspendSignalsDispatching();
  var fullPassageTraverser = this.data_.getTraverser();
  while (fullPassageTraverser.advance()) {
    item = fullPassageTraverser.current();

    item
        .meta('depth', fullPassageTraverser.getDepth())
        .meta('index', linearIndex++);

    if (item.numChildren() && !!item.get('collapsed')) item.meta('collapsed', true);
  }

  this.data_.resumeSignalsDispatching(false);
  return this;
};


/**
 * Fills this.visibleData_ and this.heightCache with data.
 * @return {anychart.gantt.Controller} - Itself for method chaining.
 * @private
 */
anychart.gantt.Controller.prototype.getVisibleData_ = function() {
  this.visibleData_.length = 0;
  this.heightCache_.length = 0;

  var item;
  var height = 0;
  this.expandedItemsTraverser_.reset();
  while (this.expandedItemsTraverser_.advance()) {
    item = /** @type {anychart.data.Tree.DataItem} */ (this.expandedItemsTraverser_.current());
    this.visibleData_.push(item);
    height += (anychart.gantt.Controller.getItemHeight(item) + anychart.elements.DataGrid.ROW_SPACE);
    this.heightCache_.push(height);
  }

  return this;
};


/**
 * Returns an actual height between rows.
 * NOTE: Considers a row spacing.
 * @param {number} startIndex - Start index.
 * @param {number=} opt_endIndex - End index.
 * @return {number} - Actual height.
 * @private
 */
anychart.gantt.Controller.prototype.getHeightByIndexes_ = function(startIndex, opt_endIndex) {
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
 * @private
 * @return {number} - Index.
 */
anychart.gantt.Controller.prototype.getIndexByHeight_ = function(height) {
  var index = goog.array.binarySearch(this.heightCache_, height);
  return index >= 0 ? index : ~index;
};


/**
 * Sets values for this.startIndex_, this.endIndex_ and this.verticalOffset_ if needed based on this.visibleData_ and
 *  this.availableHeight_.
 * Clears POSITION consistency state.
 */
anychart.gantt.Controller.prototype.recalculate = function() {
  if (this.visibleData_.length) {

    var totalHeight = this.getHeightByIndexes_(0, this.heightCache_.length - 1);

    if (this.availableHeight_ >= totalHeight) {
      this.startIndex_ = 0;
      this.verticalOffset_ = 0;
      this.endIndex_ = this.visibleData_.length - 1;
    } else {
      if (isNaN(this.startIndex_) && isNaN(this.endIndex_)) this.startIndex_ = 0;

      if (!isNaN(this.startIndex_)) { //Start index is set.
        totalHeight = this.getHeightByIndexes_(this.startIndex_) - this.verticalOffset_;
        if (totalHeight < this.availableHeight_) { //Going from end of list.
          this.startIndex_ = this.getIndexByHeight_(this.heightCache_[this.heightCache_.length - 1] - this.availableHeight_);
          this.endIndex_ = this.heightCache_.length - 1;
          this.verticalOffset_ = this.getHeightByIndexes_(this.startIndex_, this.endIndex_) - this.availableHeight_;
        } else {
          var height = this.startIndex_ == 0 ? 0 : this.heightCache_[this.startIndex_ - 1];
          this.endIndex_ = this.getIndexByHeight_(height + this.availableHeight_ + this.verticalOffset_);
        }
      } else { //End index is set, start index must be NaN here.
        totalHeight = this.getHeightByIndexes_(0, this.endIndex_);
        if (totalHeight < this.availableHeight_) { //Going from start of list.
          this.startIndex_ = 0;
          this.verticalOffset_ = 0;
          this.endIndex_ = this.getIndexByHeight_(this.availableHeight_);
        } else {
          /*
            This case has another behaviour: when start index is set, we consider the vertical offset.
            In this case (end index is set instead), we suppose that end index cell is fully visible in the end
            of data grid. It means that we do not consider the vertical offset and calculate it as well.
          */
          this.startIndex_ = this.getIndexByHeight_(this.heightCache_[this.endIndex_] - this.availableHeight_);
          this.verticalOffset_ = this.getHeightByIndexes_(this.startIndex_, this.endIndex_) - this.availableHeight_;
        }
      }
    }

  } else {
    this.startIndex_ = 0;
    this.endIndex_ = 0;
    this.verticalOffset_ = 0;
  }
  this.positionRecalculated_ = true;
  this.markConsistent(anychart.ConsistencyState.POSITION);
};


/**
 * Gets/sets source data tree.
 * @param {anychart.data.Tree=} opt_value - Value to be set.
 * @return {(anychart.gantt.Controller|anychart.data.Tree)} - Current value or itself for method chaining.
 */
anychart.gantt.Controller.prototype.data = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if ((this.data_ != opt_value) && (opt_value instanceof anychart.data.Tree)) {
      if (this.data_) this.data_.unlistenSignals(this.dataInvalidated_, this); //Stop listening old tree.
      this.data_ = opt_value;
      this.data_.listenSignals(this.dataInvalidated_, this);

      this.expandedItemsTraverser_ = this.data_.getTraverser();
      this.expandedItemsTraverser_.traverseChildrenCondition(this.traverseChildrenCondition_);

      this.invalidate(anychart.ConsistencyState.DATA, anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  }
  return this.data_;
};


/**
 * Gets/sets vertical offset.
 * @param {number=} opt_value - Value to be set.
 * @return {(anychart.gantt.Controller|number)} - Current value or itself for method chaining.
 */
anychart.gantt.Controller.prototype.verticalOffset = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.verticalOffset_ != opt_value) {
      this.verticalOffset_ = opt_value;
      this.invalidate(anychart.ConsistencyState.POSITION, anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  }
  return this.verticalOffset_;
};


/**
 * Gets/sets start index.
 * NOTE: Calling this method sets this.endIndex_ to NaN to recalculate value correctly anew.
 * @param {number=} opt_value - Value to be set.
 * @return {(anychart.gantt.Controller|number)} - Current value or itself for method chaining.
 */
anychart.gantt.Controller.prototype.startIndex = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.startIndex_ != opt_value && !isNaN(opt_value)) {
      this.startIndex_ = opt_value;
      this.endIndex_ = NaN;
      this.invalidate(anychart.ConsistencyState.POSITION, anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  }
  return this.startIndex_;
};


/**
 * Gets/sets end index.
 * NOTE: Calling this method sets this.startIndex_ to NaN to recalculate value correctly anew.
 * @param {number=} opt_value - Value to be set.
 * @return {(anychart.gantt.Controller|number)} - Current value or itself for method chaining.
 */
anychart.gantt.Controller.prototype.endIndex = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.endIndex_ != opt_value && !isNaN(opt_value)) {
      this.endIndex_ = opt_value;
      this.startIndex_ = NaN;
      this.invalidate(anychart.ConsistencyState.POSITION, anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  }
  return this.endIndex_;
};


/**
 * Gets/sets available height.
 * @param {number=} opt_value - Value to be set.
 * @return {(anychart.gantt.Controller|number)} - Current value or itself for method chaining.
 */
anychart.gantt.Controller.prototype.availableHeight = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.availableHeight_ != opt_value) {
      this.availableHeight_ = opt_value;
      this.invalidate(anychart.ConsistencyState.POSITION, anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  }
  return this.availableHeight_;
};


/**
 * Gets/sets data grid.
 * @param {anychart.elements.DataGrid=} opt_value - Value to be set.
 * @return {(anychart.elements.DataGrid|anychart.gantt.Controller)} - Current value or itself for method chaining.
 */
anychart.gantt.Controller.prototype.dataGrid = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.dataGrid_ != opt_value) {
      this.dataGrid_ = opt_value;
      this.availableHeight_ = this.dataGrid_.pixelBounds().height - this.dataGrid_.titleHeight();
      this.invalidate(anychart.ConsistencyState.POSITION, anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  }
  return this.dataGrid_;
};


/**
 * Runs controller.
 * Actually clears all consistency states and applies changes to related data grid.
 * @return {anychart.gantt.Controller} - Itself for method chaining.
 */
anychart.gantt.Controller.prototype.run = function() {
  if (!this.isConsistent()) {
    if (this.hasInvalidationState(anychart.ConsistencyState.DATA)) {
      this.linearizeData_();
      this.markConsistent(anychart.ConsistencyState.DATA);
      this.invalidate(anychart.ConsistencyState.VISIBILITY);
    }

    if (this.hasInvalidationState(anychart.ConsistencyState.VISIBILITY)) {
      this.getVisibleData_();
      this.markConsistent(anychart.ConsistencyState.VISIBILITY);
      this.invalidate(anychart.ConsistencyState.POSITION);
    }

    this.recalculate();
  }

  //This must be called anyway. Clears consistency states of data grid not related to controller.
  this.dataGrid_.drawInternal(this.visibleData_, this.startIndex_, this.endIndex_, this.verticalOffset_, this.availableHeight_, this.positionRecalculated_);
  this.positionRecalculated_ = false;
  return this;
};


