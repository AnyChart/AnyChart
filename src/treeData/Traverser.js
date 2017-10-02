goog.provide('anychart.treeDataModule.Traverser');



/**
 * Tree data traverser.
 * @param {(anychart.treeDataModule.Tree|anychart.treeDataModule.View)} tree - Tree that current traverser belongs to.
 * @constructor
 */
anychart.treeDataModule.Traverser = function(tree) {

  /**
   * Tree that current traverser belongs to.
   * @type {(anychart.treeDataModule.Tree|anychart.treeDataModule.View)}
   * @private
   */
  this.tree_ = tree;


  /**
   * Position of current child in parent's children.
   * Actually this array is a coordinate where we are:
   *  [2] means that we are at 0-level (root), third position.
   *  [1, 2] means that we are in a third child of second root item.
   *  [6, 3, 0] means that we are in a first child of a fourth child of seventh root data item.
   *  [-1] means that we are nowhere: initial position. Analogue of currentPosition = -1 for iterator.
   *  [5, -1] means that we are ready to pass through sixth root's children but didn't start the passage yet.
   *
   * @type {Array.<number>}
   * @private
   */
  this.currentPosition_ = [-1];


  /**
   * Current tree data item.
   * @type {(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem|undefined)}
   * @private
   */
  this.currentItem_ = undefined;


  /**
   * Function that decides if data item must be returned while passage.
   * @type {function((anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)):boolean}
   * @private
   */
  this.nodeYieldCondition_ = this.defaultNodeYieldCondition_;


  /**
   * Function that decides if we go through data item's children while passage.
   * @type {function((anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)):boolean}
   * @private
   */
  this.traverseChildrenCondition_ = this.defaultTraverseChildrenCondition_;


  /**
   * Current depth.
   * @type {number}
   * @private
   */
  this.currentDepth_ = -1;

};


/**
 * Default value of this.nodeYieldCondition_.
 * @param {(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)} item - Incoming tree data item.
 * @return {boolean}
 * @private
 */
anychart.treeDataModule.Traverser.prototype.defaultNodeYieldCondition_ = function(item) {
  return true;
};


/**
 * Default value of this.traverseChildrenCondition_.
 * @param {(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)} item - Incoming tree data item.
 * @return {boolean} - If incoming data item matches.
 * @private
 */
anychart.treeDataModule.Traverser.prototype.defaultTraverseChildrenCondition_ = function(item) {
  return true;
};


/**
 * Resets traverser.
 * @return {anychart.treeDataModule.Traverser} - Itself for method chaining.
 */
anychart.treeDataModule.Traverser.prototype.reset = function() {
  this.currentPosition_.length = 1;
  this.currentPosition_[0] = -1;
  this.currentItem_ = undefined;
  this.currentDepth_ = -1;
  return this;
};


/**
 * Gets current tree data item.
 * @return {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem|undefined}
 */
anychart.treeDataModule.Traverser.prototype.current = function() {
  return this.currentItem_;
};


/**
 * Gets depth of current data item.
 * @return {number} - Depth.
 */
anychart.treeDataModule.Traverser.prototype.getDepth = function() {
  return this.currentDepth_;
};


/**
 * Gets current data item's data value by field specified.
 * @param {string} key - Key of value to be got from current data item.
 * @return {*} - Value.
 */
anychart.treeDataModule.Traverser.prototype.get = function(key) {
  if (this.currentItem_) {
    return this.currentItem_.get(key);
  } else {
    return undefined;
  }
};


/**
 * Sets current item's value by key specified.
 * @param {string} key - Key.
 * @param {*} value - Value.
 * @return {anychart.treeDataModule.Traverser} - Itself for method chaining.
 */
anychart.treeDataModule.Traverser.prototype.set = function(key, value) {
  if (this.currentItem_) this.currentItem_.set(key, value);
  return this;
};


/**
 * Gets/sets a meta value.
 * @param {string} key - Key.
 * @param {*=} opt_value - Optional value.
 * @return {*} - Value or itself for method chaining if method is used as setter.
 */
anychart.treeDataModule.Traverser.prototype.meta = function(key, opt_value) {
  if (arguments.length > 1) { //Setter
    if (this.currentItem_ && this.currentItem_.meta(key) != opt_value) {
      this.currentItem_.meta(key, opt_value);
    }
    return this;
  } else { //Getter
    return this.currentItem_ ? this.currentItem_.meta(key) : undefined;
  }
};


/**
 * Sets function that decides if data item must be returned while passage.
 * Note: if passed argument is passed by not a function, value will be reset to default value that always returns 'true'.
 * @param {(function((anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)):boolean)=} opt_value - Function to be set.
 * @return {(function((anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)):boolean|anychart.treeDataModule.Traverser)} - Current decider function or itself
 *  for method chaining.
 */
anychart.treeDataModule.Traverser.prototype.nodeYieldCondition = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (goog.isFunction(opt_value)) {
      this.nodeYieldCondition_ = opt_value;
    } else {
      this.nodeYieldCondition_ = this.defaultNodeYieldCondition_;
    }
    return this;
  }
  return this.nodeYieldCondition_;
};


/**
 * Sets function that decides if we go through data item's children while passage.
 * Note: if passed argument is passed by not a function, value will be reset to default value that always returns 'true'.
 * @param {(function((anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)):boolean)=} opt_value - Function to be set.
 * @return {(function((anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)):boolean|anychart.treeDataModule.Traverser)} - Current decider function or itself
 *  for method chaining.
 */
anychart.treeDataModule.Traverser.prototype.traverseChildrenCondition = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (goog.isFunction(opt_value)) {
      this.traverseChildrenCondition_ = opt_value;
    } else {
      this.traverseChildrenCondition_ = this.defaultTraverseChildrenCondition_;
    }
    return this;
  }
  return this.traverseChildrenCondition_;
};


/**
 * Advances traverser to the next item.
 * @return {boolean} - Returns <b>True</b> if moved to the next item, otherwise returns <b>False</b>.
 */
anychart.treeDataModule.Traverser.prototype.advance = function() {
  var nextItem = this.findNextSuitableItem_(this.getItemsSet_());
  if (nextItem) this.currentItem_ = nextItem;
  return !!nextItem;
};


/**
 * Turns current traverser to an array of tree data items.
 * NOTE: This method resets a traverser state before turning to array and after it (be very careful in this method usage
 * while advance()-passage). Also don't forget to reset traverser after this method usage.
 *
 * @return {Array.<(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)>} - Resulting array.
 */
anychart.treeDataModule.Traverser.prototype.toArray = function() {
  this.reset();

  var result = [];
  while (this.advance()) {
    result.push(this.current());
  }

  return result;
};


/**
 * Looks for next item that corresponds to nodeYieldCondition_ and traverseChildrenCondition_.
 *
 * @param {Array.<(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)>} itemsSet - Set of tree data items where to look in.
 * @return {?(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)} - Found item or null.
 * @private
 */
anychart.treeDataModule.Traverser.prototype.findNextSuitableItem_ = function(itemsSet) {
  if (!itemsSet.length || !this.currentPosition_.length) return null;

  var nextSuspiciousItem = itemsSet[++this.currentPosition_[this.currentPosition_.length - 1]];

  if (!nextSuspiciousItem) { //We are in the end of list and trying to go higher in position.
    this.currentPosition_.pop();
    //We already did this.currentPosition_.pop() - it is actually a parent item set.
    return this.findNextSuitableItem_(this.getItemsSet_());
  }

  var nextItemSet = itemsSet;
  if (nextSuspiciousItem.numChildren() && this.traverseChildrenCondition_(nextSuspiciousItem)) { //Here we try to determine next items set.
    this.currentPosition_.push(-1);
    nextItemSet = nextSuspiciousItem.getChildrenUnsafe();
  }

  return this.nodeYieldCondition_(nextSuspiciousItem) ? nextSuspiciousItem : this.findNextSuitableItem_(nextItemSet);
};


/**
 * Gets current items set by current path. Also sets current item's depth.
 * @return {Array.<(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)>} - Current items set.
 * @private
 */
anychart.treeDataModule.Traverser.prototype.getItemsSet_ = function() {
  var items = this.tree_.getChildrenUnsafe();
  this.currentDepth_ = 0;
  if (this.currentPosition_.length > 1) {
    for (var i = 0; i < this.currentPosition_.length - 1; i++) {
      var item = items[this.currentPosition_[i]];
      this.currentDepth_ = i + 1;
      items = item.getChildrenUnsafe();
    }
  }
  return items;
};


//exports
(function() {
  var proto = anychart.treeDataModule.Traverser.prototype;
  proto['reset'] = proto.reset;
  proto['current'] = proto.current;
  proto['get'] = proto.get;
  proto['set'] = proto.set;
  proto['meta'] = proto.meta;
  proto['getDepth'] = proto.getDepth;
  proto['advance'] = proto.advance;
  proto['toArray'] = proto.toArray;
  proto['nodeYieldCondition'] = proto.nodeYieldCondition;
  proto['traverseChildrenCondition'] = proto.traverseChildrenCondition;
})();


