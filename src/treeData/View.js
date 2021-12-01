goog.provide('anychart.treeDataModule.View');

goog.require('anychart.core.Base');
goog.require('anychart.data.ITreeDataInfo');
goog.require('anychart.treeDataModule.Traverser');



/**
 * TreeView. Class of mapped tree.
 * @param {anychart.treeDataModule.Tree} tree
 * @param {Object} mapping
 * @constructor
 * @extends {anychart.core.Base}
 */
anychart.treeDataModule.View = function(tree, mapping) {
  anychart.treeDataModule.View.base(this, 'constructor');

  /**
   * Tree.
   * @type {anychart.treeDataModule.Tree}
   * @private
   */
  this.tree_ = tree;

  /**
   * Mapping.
   * @type {Object}
   * @private
   */
  this.mapping_ = mapping;

  this.tree_.listen(anychart.enums.EventType.TREE_ITEM_MOVE, this.onTreeEvent_, false, this);
  this.tree_.listen(anychart.enums.EventType.TREE_ITEM_UPDATE, this.onTreeEvent_, false, this);
  this.tree_.listen(anychart.enums.EventType.TREE_ITEM_CREATE, this.onTreeEvent_, false, this);
  this.tree_.listen(anychart.enums.EventType.TREE_ITEM_REMOVE, this.onTreeEvent_, false, this);

  this.tree_.listenSignals(this.onTreeSignal_, this);
};
goog.inherits(anychart.treeDataModule.View, anychart.core.Base);


/**
 * Consistency state mask supported by this object.
 * @type {number}
 */
anychart.treeDataModule.View.prototype.SUPPORTED_SIGNALS =
    anychart.core.Base.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.DATA_CHANGED |
    anychart.Signal.META_CHANGED;


/**
 * Tree events handler.
 * @param {anychart.treeDataModule.Tree.ChangeEvent} e Tree chage event.
 * @private
 */
anychart.treeDataModule.View.prototype.onTreeEvent_ = function(e) {
  var newEvent = {};
  goog.object.extend(newEvent, e);
  if (newEvent['dataItem'] && anychart.utils.instanceOf(newEvent['dataItem'], anychart.treeDataModule.Tree.DataItem))
    newEvent['dataItem'] = newEvent['dataItem'].getWrapper(this);
  this.dispatchEvent(newEvent);
};


/**
 * Tree signal handler.
 * @param {anychart.SignalEvent} e Signal event.
 * @private
 */
anychart.treeDataModule.View.prototype.onTreeSignal_ = function(e) {
  this.dispatchSignal(e.signals);
};


/**
 * Getter for tree view mapping.
 * @return {Object} Mapping.
 */
anychart.treeDataModule.View.prototype.getMapping = function() {
  return this.mapping_;
};


/**
 * Creates tree view data traverser.
 * @return {anychart.treeDataModule.Traverser} - New traverser.
 */
anychart.treeDataModule.View.prototype.getTraverser = function() {
  return new anychart.treeDataModule.Traverser(this);
};


/**
 * Performs a data search. Returns null if nothing is found, tree data item if here's a single result and array of
 * tree data items if here are multiple matches.
 *
 * @param {string} field - Field for search. Literally means the name of field of data item.
 * @param {?} value - Value to be found.
 * @param {(function(?, ?):number)=} opt_comparisonFn - Optional comparison function by which the array is ordered. Should
 *  take 2 arguments to compare, and return a negative number, zero, or a positive number depending on whether the
 *  first argument is less than, equal to, or greater than the second.
 * @return {(anychart.treeDataModule.View.DataItem|Array.<anychart.treeDataModule.View.DataItem>|null)} - Found tree data item or null or array of found tree data items.
 */
anychart.treeDataModule.View.prototype.search = function(field, value, opt_comparisonFn) {
  var res = this.searchItems(field, value, opt_comparisonFn);
  return res.length ? (res.length == 1 ? res[0] : res) : null;
};


/**
 * Performs a data search. Actually does the same as (@see search) but result is always an array.
 *
 * @param {string} field - Field for search. Literally means the name of field of data item.
 * @param {?} value - Value to be found.
 * @param {(function(?, ?):number)=} opt_comparisonFn - Optional comparison function by which the array is ordered. Should
 *  take 2 arguments to compare, and return a negative number, zero, or a positive number depending on whether the
 *  first argument is less than, equal to, or greater than the second.
 * @return {Array.<anychart.treeDataModule.View.DataItem>} - Array of found tree data items.
 */
anychart.treeDataModule.View.prototype.searchItems = function(field, value, opt_comparisonFn) {
  field = this.mapping_[field] || field;
  var result = this.tree_.searchItems(field, value, opt_comparisonFn);
  var rv = [];
  for (var i = 0; i < result.length; i++) {
    rv.push(result[i].getWrapper(this));
  }
  return rv;
};


/**
 * Filters tree data items by filter-function.
 * NOTE: filter performs full data passage. It means that filtering is way slower than searching on indexed field
 *  with correctly implemented comparison function.
 * @param {function((anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)):boolean} filterFunction - Filter function.
 * @return {Array.<anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem>}
 */
anychart.treeDataModule.View.prototype.filter = function(filterFunction) {
  var traverser = this.getTraverser();
  traverser.nodeYieldCondition(filterFunction);
  return traverser.toArray();
};


/**
 * Adds a data.
 * @param {(Array.<Object>|string)} data - Raw data or CSV-string. If string is passed, second parameter will be
 *  interpreted as fields mapping.
 * @param {(anychart.enums.TreeFillingMethod|Object)=} opt_fillMethodOrCsvMapping - Fill method or CSV mapping object.
 *  This parameter is interpreted as mapping object if first parameter is string. Mapping object should have structure
 *  like
 *  <code>
 *    //'nameOfField': index_of_column
 *    mapping = {
 *      'id': 0,
 *      'name': 1,
 *      'value': 15
 *    };
 *  </code>.
 * @param {(Object|Array.<anychart.treeDataModule.Tree.Dependency>)=} opt_csvSettingsOrDeps - CSV settings object or dependencies data.
 *  If is CSV settings object, should fields like
 *  rowsSeparator - string or undefined, if it is undefined, it will not be set.
 *  columnsSeparator - string or undefined, if it is undefined, it will not be set.
 *  ignoreTrailingSpaces - boolean or undefined, if it is undefined, it will not be set.
 *  ignoreFirstRow - boolean or undefined, if it is undefined, it will not be set.
 *
 *  If is dependencies data, should take an array like this:
 *   <code>
 *     var dependencies = [
 *      {from: 0, to: 3}, //ids
 *      {from: 0, to: 4},
 *      {from: 1, to: 2},
 *      {from: 4, to: 5}
 *     ];
 *   </code>
 *  In current implementation (3 Jun 2016), just adds (and overrides if exists) field 'dependsOn' to data item.
 * @return {anychart.treeDataModule.View} - Itself for method chaining.
 */
anychart.treeDataModule.View.prototype.addData = function(data, opt_fillMethodOrCsvMapping, opt_csvSettingsOrDeps) {
  this.tree_.addData(data, opt_fillMethodOrCsvMapping, opt_csvSettingsOrDeps);
  return this;
};


/**
 * Adds a child.
 * @param {(Object|anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)} child - Child to be added.
 * @return {anychart.treeDataModule.View.DataItem} - Child.
 */
anychart.treeDataModule.View.prototype.addChild = function(child) {
  return this.addChildAt(child, this.numChildren());
};


/**
 * Inserts a child into a specified position.
 * Please make sure that child has not inner cycles to avoid stack overflow exception.
 *
 * @param {(Object|anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)} child - Child to be added.
 * @param {number} index - Position.
 * @return {anychart.treeDataModule.View.DataItem} - Child.
 */
anychart.treeDataModule.View.prototype.addChildAt = function(child, index) {
  this.tree_.addChildAt(child, index);
  return /** @type {anychart.treeDataModule.View.DataItem} */ (this.getChildAt(index));
};


/**
 * Removes data item's child.
 * @param {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} child - Child to be removed.
 * @return {anychart.treeDataModule.View.DataItem} - Removed element or null.
 */
anychart.treeDataModule.View.prototype.removeChild = function(child) {
  return this.removeChildAt(this.indexOfChild(child));
};


/**
 * Removes child at specified position.
 * @param {number} index - Index of item to be removed.
 * @return {?anychart.treeDataModule.View.DataItem} - Removed item or null if item is not found.
 */
anychart.treeDataModule.View.prototype.removeChildAt = function(index) {
  var result = this.tree_.removeChildAt(index);
  return result ? result.getWrapper(this) : null;
};


/**
 * Removes children.
 * @return {anychart.treeDataModule.View} - Itself for method chaining.
 */
anychart.treeDataModule.View.prototype.removeChildren = function() {
  this.tree_.removeChildren();
  return this;
};


/**
 * Gets index of child in a children array.
 * @param {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} child - Sought child.
 * @return {number} - Index of child.
 */
anychart.treeDataModule.View.prototype.indexOfChild = function(child) {
  return this.tree_.indexOfChild(child);
};


/**
 * Returns a roots array.
 * @return {Array.<anychart.treeDataModule.View.DataItem>} - Copy of roots array.
 */
anychart.treeDataModule.View.prototype.getChildren = function() {
  var child;
  var len = this.tree_.numChildren();
  var rv = [];
  for (var i = 0; i < len; i++) {
    child = /** @type {anychart.treeDataModule.Tree.DataItem} */ (this.tree_.getChildAt(i));
    rv.push(child.getWrapper(this));
  }
  return rv;
};


/**
 * Returns roots array.
 * @return {Array.<anychart.treeDataModule.View.DataItem>}
 */
anychart.treeDataModule.View.prototype.getChildrenUnsafe = function() {
  return this.getChildren();
};


/**
 * Returns a length of roots array.
 * @return {number} - Number of roots.
 */
anychart.treeDataModule.View.prototype.numChildren = function() {
  return this.tree_.numChildren();
};


/**
 * Gets the child by index.
 * @param {number} index - Index of child to find.
 * @return {(anychart.treeDataModule.View.DataItem|undefined)} - Child into a specified position.
 */
anychart.treeDataModule.View.prototype.getChildAt = function(index) {
  var dataItem = this.tree_.getChildAt(index);
  if (!dataItem) {
    return void 0;
  }

  return dataItem.getWrapper(this);
};


/** @inheritDoc */
anychart.treeDataModule.View.prototype.serialize = function() {
  var json = this.tree_.serialize();
  json['mapping'] = this.mapping_;
  return json;
};


/**
 * Serializes tree without meta information.
 * @param {Array.<string>=} opt_exceptions - Array of field names that will be in meta anyway.
 *  If is undefined, no meta will be stored.
 *  If array is empty, all meta will be stored.
 *  If array is not empty, only values will be stored.
 * @return {!Object} Serialized JSON object.
 */
anychart.treeDataModule.View.prototype.serializeWithoutMeta = function(opt_exceptions) {
  var json = this.tree_.serializeWithoutMeta(opt_exceptions);
  json['mapping'] = this.mapping_;
  return json;
};



/**
 * Mapped data item class.
 * @param {anychart.treeDataModule.View} treeView Tree view.
 * @param {anychart.treeDataModule.Tree.DataItem} dataItem Data item to map.
 * @param {?anychart.treeDataModule.View.DataItem} parentView Parent mapped data item or tree.
 * @constructor
 * @implements {anychart.data.ITreeDataInfo}
 */
anychart.treeDataModule.View.DataItem = function(treeView, dataItem, parentView) {
  /**
   * Tree view.
   * @type {anychart.treeDataModule.View}
   * @private
   */
  this.treeView_ = treeView;

  /**
   * @type {?anychart.treeDataModule.View.DataItem}
   */
  this.parentView = parentView;

  /**
   * Data item.
   * @type {anychart.treeDataModule.Tree.DataItem}
   * @private
   */
  this.dataItem_ = dataItem;

  /**
   * Meta data.
   * @type {!Object}
   * @private
   */
  this.meta_ = {};

  /**
   * UID.
   * @type {number}
   */
  this.uid = anychart.utils.getUid();
};


/**
 * Getter for wrapped data item.
 * @return {anychart.treeDataModule.Tree.DataItem} Data item.
 */
anychart.treeDataModule.View.DataItem.prototype.getDataItem = function() {
  return this.dataItem_;
};


/**
 * Getter for data item tree.
 * @return {anychart.treeDataModule.Tree} Tree.
 */
anychart.treeDataModule.View.DataItem.prototype.tree = function() {
  return /** @type {anychart.treeDataModule.Tree} */ (this.dataItem_.tree());
};


/**
 * DNA test.
 * TODO (A.Kudryavtsev): Add description on exporting this method.
 * @param {anychart.treeDataModule.View.DataItem} potentialParent - Suspicious data item.
 * @return {boolean} - Whether current data item is child of set in parameter.
 */
anychart.treeDataModule.View.DataItem.prototype.isChildOf = function(potentialParent) {
  return anychart.treeDataModule.Tree.isDescendant(this.dataItem_, potentialParent.getDataItem()); //Just sugar.
};


/**
 * Return Tree view.
 * @return {anychart.treeDataModule.View}
 */
anychart.treeDataModule.View.DataItem.prototype.getTreeView = function() {
  return this.treeView_;
};


/**
 * Adds a child.
 * @param {(Object|anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)} child - Child to be added.
 * @return {anychart.treeDataModule.View.DataItem} - Child.
 */
anychart.treeDataModule.View.DataItem.prototype.addChild = function(child) {
  return this.addChildAt(child, this.numChildren());
};


/**
 * Inserts a child into a specified position.
 * Please make sure that child has not inner cycles to avoid stack overflow exception.
 *
 * @param {(Object|anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)} child - Child to be added.
 * @param {number} index - Position.
 * @return {anychart.treeDataModule.View.DataItem} - child.
 */
anychart.treeDataModule.View.DataItem.prototype.addChildAt = function(child, index) {
  this.dataItem_.addChildAt(child, index);
  return this;
};


/**
 * Current item will be removed from parent's children and becomes an orphan.
 * If child is a root element, it will be removed from tree.
 * @return {anychart.treeDataModule.View.DataItem} - Itself for method chaining.
 */
anychart.treeDataModule.View.DataItem.prototype.remove = function() {
  if (this.parentView)
    this.parentView.removeChild(this);
  else
    this.treeView_.removeChild(this);

  return this;
};


/**
 * Removes data item's child.
 * @param {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} child - Child to be removed.
 * @return {anychart.treeDataModule.View.DataItem} - Removed element or null.
 */
anychart.treeDataModule.View.DataItem.prototype.removeChild = function(child) {
  return this.removeChildAt(this.indexOfChild(child));
};


/**
 * Removes child at specified position.
 * @param {number} index - Index of item to be removed.
 * @return {?anychart.treeDataModule.View.DataItem} - Removed item or null if item is not found.
 */
anychart.treeDataModule.View.DataItem.prototype.removeChildAt = function(index) {
  var result = this.dataItem_.removeChildAt(index);
  return result ? result.getWrapper(this.treeView_) : null;
};


/**
 * Removes children.
 * @return {anychart.treeDataModule.View.DataItem} - Itself for method chaining.
 */
anychart.treeDataModule.View.DataItem.prototype.removeChildren = function() {
  this.dataItem_.removeChildren();
  return this;
};


/**
 * Gets index of child in a children array.
 * @param {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} child - Sought child.
 * @return {number} - Index of child.
 */
anychart.treeDataModule.View.DataItem.prototype.indexOfChild = function(child) {
  return this.dataItem_.indexOfChild(child);
};


/**
 * Returns a copy of children array of current data item.
 * @return {Array.<anychart.treeDataModule.View.DataItem>} - Copy of children array.
 */
anychart.treeDataModule.View.DataItem.prototype.getChildren = function() {
  var child;
  var len = this.dataItem_.numChildren();
  var rv = [];
  for (var i = 0; i < len; i++) {
    child = /** @type {anychart.treeDataModule.Tree.DataItem} */ (this.dataItem_.getChildAt(i));
    rv.push(child.getWrapper(this.treeView_));
  }
  return rv;
};


/**
 * Returns children array.
 * @return {Array.<anychart.treeDataModule.View.DataItem>}
 */
anychart.treeDataModule.View.DataItem.prototype.getChildrenUnsafe = function() {
  return this.getChildren();
};


/**
 * Returns a length of children array.
 * @return {number} - Number of children.
 */
anychart.treeDataModule.View.DataItem.prototype.numChildren = function() {
  return this.dataItem_.numChildren();
};


/**
 * Gets the child by index.
 * @param {number} index - Index of child to find.
 * @return {(anychart.treeDataModule.View.DataItem|undefined)} - Child into a specified position.
 */
anychart.treeDataModule.View.DataItem.prototype.getChildAt = function(index) {
  var dataItem = this.dataItem_.getChildAt(index);
  if (!dataItem) {
    return void 0;
  }
  return dataItem.getWrapper(this.treeView_);
};


/**
 * @inheritDoc
 */
anychart.treeDataModule.View.DataItem.prototype.get = function(var_args) {
  if (arguments.length) {
    var mapping = this.treeView_.getMapping();
    var keyOrPath = arguments[0];

    var iter = [];

    if (goog.isArray(keyOrPath)) { //got item.get(['a', 'b', 0 ]);
      iter = keyOrPath;
    } else if (goog.isString(keyOrPath)) { //got item.get('a', 'b', 0);
      iter = arguments;
    }

    var mappedArgs = goog.array.map(iter, function(item) {
      return mapping[item] || item;
    });

    return this.dataItem_.get(mappedArgs);
  }

  return void 0;
};


/**
 * Sets value to the data by path.
 * @param {...*} var_args - Arguments.
 *  Note:
 *  1) Can take arguments like this:
 *    <code>
 *      item.set(['a', 'b', 0, true]);
 *    </code>
 *    It means that will be created structure like this:
 *    <code>
 *      {
 *        'a': {
 *          'b': [true]
 *        }
 *      }
 *    </code>
 *    First element of array ('a') becomes key.
 *    Last value (true) becomes a value for complex object.
 *    If one of parameters is number, previous value should be an array, otherwise nothing will happen.
 *
 *  2) The same behaviour is for this case:
 *    <code>
 *      item.set(['a', 'b', 0], true);
 *    </code>
 *
 *  3) The same behaviour is for this case as well:
 *    <code>
 *      item.set('a', 'b', 0, true);
 *    </code>
 *
 * @return {anychart.treeDataModule.View.DataItem} - Itself for method chaining.
 */
anychart.treeDataModule.View.DataItem.prototype.set = function(var_args) {
  if (arguments.length) {
    var mapping = this.treeView_.getMapping();
    var mappedPath = [];
    var iter = [];
    var key, i, value;
    var reduce = 0;

    var keyOrPath = arguments[0];
    if (goog.isArray(keyOrPath)) {
      iter = keyOrPath;
      key = iter[0];
      if (iter.length > 1 && goog.isString(key)) {
        if (arguments.length > 1) { //got item.set(['a', 'b', 0], true);
          value = arguments[1];
        } else { //got item.set(['a', 'b', 0, true]);
          value = iter[iter.length - 1];
          reduce = 1;
        }
      }
    } else if (goog.isString(keyOrPath) && arguments.length > 1) { //got item.set('a', 'b', 0, true);
      iter = arguments;
      value = iter[iter.length - 1];
      reduce = 1;
    }
    for (i = 0; i < iter.length - reduce; i++)
      mappedPath[i] = mapping[iter[i]] || iter[i];
    mappedPath.push(value);
    this.dataItem_.set.apply(this.dataItem_, mappedPath);
    return this;
  }
  return this;
};


/**
 * Removes from data by path specified using mapping.
 * @param {...*} var_args - Arguments.
 * @return {anychart.treeDataModule.View.DataItem} - Itself for method chaining.
 */
anychart.treeDataModule.View.DataItem.prototype.del = function(var_args) {
  if (arguments.length) {
    var mapping = this.treeView_.getMapping();
    var keyOrPath = arguments[0];
    var iter = [];
    if (goog.isArray(keyOrPath)) { //got item.del(['a', 'b', 0 ]);
      iter = keyOrPath;
    } else if (goog.isString(keyOrPath)) { //got item.del('a', 'b', 0);
      iter = arguments;
    }

    var mappedArgs = goog.array.map(iter, function(item) {
      return mapping[item] || item;
    });
    this.dataItem_.del(mappedArgs);
  }
  return this;
};

/**
 * @inheritDoc
 */
 anychart.treeDataModule.View.DataItem.prototype.hasField = function(fieldName) {
   return this.dataItem_.hasField(fieldName);
 };


/**
 * Gets/sets a meta data.
 * @param {string} key - Key.
 * @param {*=} opt_value - Value.
 * @return {*} - Value or itself for method chaining.
 */
anychart.treeDataModule.View.DataItem.prototype.meta = function(key, opt_value) {
  if (arguments.length > 1) {
    return this.setMeta(key, opt_value);
  }
  return this.getMeta(key);
};


/**
 * Gets value from meta by path specified.
 * Works totally the same way as get().
 * @param {...*} var_args - Arguments.
 * @return {*} - Value or undefined if path is invalid.
 */
anychart.treeDataModule.View.DataItem.prototype.getMeta = function(var_args) {
  if (arguments.length) {
    var keyOrPath = arguments[0];

    var iter, item;

    if (goog.isArray(keyOrPath)) { //got item.meta(['a', 'b', 0 ]);
      iter = keyOrPath;
    } else if (goog.isString(keyOrPath)) { //got item.meta('a', 'b', 0);
      iter = arguments;
    }

    if (goog.isDef(iter)) {
      var parent = this.meta_;
      var i;

      for (i = 0; i < iter.length; i++) {
        item = iter[i];
        if (goog.isObject(parent) || goog.isArray(parent)) {
          if (i == iter.length - 1) { //Exactly this should be returned.
            return parent[item];
          } else {
            parent = parent[item];
          }
        } else {
          return void 0;
        }
      }
    }
  }

  return void 0;
};


/**
 * Internal public method to set complex object in item's meta by path. (As set() method woks).
 * @param {...*} var_args - Path.
 * @return {anychart.treeDataModule.View.DataItem} - Itself for method chaining.
 */
anychart.treeDataModule.View.DataItem.prototype.setMeta = function(var_args) {
  if (arguments.length) {
    var keyOrPath = arguments[0];
    var iter, key, i, value, curr, item, prevItem, parent;
    var reduce = 0;
    var path = [];

    if (goog.isArray(keyOrPath)) {
      iter = keyOrPath;
      key = iter[0];
      if (iter.length > 1 && goog.isString(key)) {
        if (arguments.length > 1) { //got item.setMeta(['a', 'b', 0], true);
          value = arguments[1];
        } else { //got item.setMeta(['a', 'b', 0, true]);
          value = iter[iter.length - 1];
          reduce = 1;
        }
      }
    } else if (goog.isString(keyOrPath) && arguments.length > 1) { //got item.setMeta('a', 'b', 0, true);
      //key = keyOrPath;
      iter = arguments;
      value = iter[iter.length - 1];
      reduce = 1;
    }

    if (goog.isDef(iter)) {
      parent = this.meta_;
      prevItem = iter[0];
      path.push(prevItem);
      curr = parent[prevItem];

      //pre-check
      for (i = 1; i < iter.length - reduce; i++) {
        item = iter[i];
        if (!goog.isNumber(item) && !goog.isString(item)) {
          return this;
        }
      }

      for (i = 1; i < iter.length - reduce; i++) {
        item = iter[i];
        path.push(item);
        if (goog.isNumber(item)) {
          if (goog.isDef(curr)) {
            if (goog.isArray(curr)) {
              parent = curr;
              curr = parent[item];
              prevItem = item;
            } else {
              return this; //Incorrect input.
            }
          } else {
            parent[prevItem] = [];
            curr = parent[item];
            parent = parent[prevItem];
            prevItem = item;
          }
        } else if (goog.isString(item)) {
          if (goog.isDef(curr)) {
            if (goog.isObject(curr)) {
              parent = curr;
              curr = parent[item];
              prevItem = item;
            } else {
              return this; //Incorrect input.
            }
          } else {
            parent[prevItem] = {};
            curr = parent[item];
            parent = parent[prevItem];
            prevItem = item;
          }
        } else {
          return this; //Incorrect input.
        }
      }
      if (parent[prevItem] != value) {
        parent[prevItem] = value;
        this.treeView_.dispatchSignal(anychart.Signal.META_CHANGED, void 0, {
          'item': this
        });
      }
    }
  }

  return this;
};


/**
 * Gets a data item's parent.
 * @return {?anychart.treeDataModule.View.DataItem} - Parent.
 */
anychart.treeDataModule.View.DataItem.prototype.getParent = function() {
  return this.parentView;
};


/**
 * Sets parent view for tree view data item.
 * @param {anychart.treeDataModule.View.DataItem} parentView Parent view to set.
 */
anychart.treeDataModule.View.DataItem.prototype.setParent = function(parentView) {
  this.parentView = parentView;
};


//exports
(function() {
  var proto = anychart.treeDataModule.View.prototype;
  proto['getTraverser'] = proto.getTraverser;
  proto['addData'] = proto.addData;
  proto['search'] = proto.search;
  proto['searchItems'] = proto.searchItems;
  proto['filter'] = proto.filter;
  proto['addChild'] = proto.addChild;
  proto['addChildAt'] = proto.addChildAt;
  proto['getChildren'] = proto.getChildren;
  proto['numChildren'] = proto.numChildren;
  proto['getChildAt'] = proto.getChildAt;
  proto['removeChild'] = proto.removeChild;
  proto['removeChildAt'] = proto.removeChildAt;
  proto['removeChildren'] = proto.removeChildren;
  proto['indexOfChild'] = proto.indexOfChild;

  proto = anychart.treeDataModule.View.DataItem.prototype;
  proto['get'] = proto.get;
  proto['set'] = proto.set;
  proto['meta'] = proto.meta;
  proto['del'] = proto.del;
  proto['getParent'] = proto.getParent;
  proto['addChild'] = proto.addChild;
  proto['addChildAt'] = proto.addChildAt;
  proto['getChildren'] = proto.getChildren;
  proto['numChildren'] = proto.numChildren;
  proto['getChildAt'] = proto.getChildAt;
  proto['remove'] = proto.remove;
  proto['removeChild'] = proto.removeChild;
  proto['removeChildAt'] = proto.removeChildAt;
  proto['removeChildren'] = proto.removeChildren;
  proto['indexOfChild'] = proto.indexOfChild;
})();
