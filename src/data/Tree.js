goog.provide('anychart.data.Tree');

goog.require('anychart.core.Base');
goog.require('anychart.core.reporting');
goog.require('anychart.data.Traverser');
goog.require('anychart.data.TreeView');
goog.require('anychart.data.csv.Parser');
goog.require('anychart.data.csv.TreeItemsProcessor');
goog.require('anychart.enums');
goog.require('anychart.utils');
goog.require('goog.array');
goog.require('goog.object');



/**
 * Tree data implementation.
 * @param {(Array.<Object>|string)=} opt_data - Raw data or CSV-string. If string is passed, second parameter will be
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
 * @param {(Object|Array.<anychart.data.Tree.Dependency>)=} opt_csvSettingsOrDeps - CSV settings object or dependencies data.
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
 * @constructor
 * @extends {anychart.core.Base}
 */
anychart.data.Tree = function(opt_data, opt_fillMethodOrCsvMapping, opt_csvSettingsOrDeps) {
  anychart.data.Tree.base(this, 'constructor');


  /**
   * Contains roots.
   * @type {Array.<anychart.data.Tree.DataItem>}
   * @private
   */
  this.roots_ = [];


  /**
   * Index storage.
   * @type {Object.<string, Array>}
   * @private
   */
  this.index_ = {};

  /**
   *
   * @type {Object.<string, boolean>}
   * @private
   */
  this.isStringIndex_ = {};


  /**
   * Default traverser.
   * @type {anychart.data.Traverser}
   * @private
   */
  this.defaultTraverser_ = this.getTraverser();

  /**
   * Traverser 'toArray' cache.
   * @type {Array.<anychart.data.Tree.DataItem>}
   * @private
   */
  this.traverserToArrayCache_ = null;

  /**
   * Flag whether to dispatch CRUD events.
   * @type {boolean}
   * @private
   */
  this.dispatchEvents_ = true;

  this.createIndexOn(anychart.enums.GanttDataFields.ID, true); //Silent ID indexing.

  //Filling with data.
  if (opt_data) this.addData(opt_data, opt_fillMethodOrCsvMapping, opt_csvSettingsOrDeps);

};
goog.inherits(anychart.data.Tree, anychart.core.Base);


/**
 * Creates new data tree by JSON config.
 * @param {Object} config - Config.
 * @return {?(anychart.data.Tree|anychart.data.TreeView)} - Data tree created by config.
 */
anychart.data.Tree.fromJson = function(config) {
  var tree = new anychart.data.Tree();
  tree.suspendSignalsDispatching();

  if ('index' in config) {
    var indexData = config['index'];

    //We create indexes first because it's a way faster than create index after the data is added.
    for (var i = 0, l = indexData.length; i < l; i++) {
      tree.createIndexOn(indexData[i]);
    }
  }

  if ('children' in config) {
    var rootsData = config['children'];
    for (i = 0, l = rootsData.length; i < l; i++) {
      tree.addChild(anychart.data.Tree.DataItem.fromSerializedItem(tree, rootsData[i]));
    }
  }

  tree.resumeSignalsDispatching(false);
  if ('mapping' in config)
    return tree.mapAs(config['mapping']);
  return tree;
};


/**
 * @typedef {{
 *    key:*,
 *    value:(anychart.data.Tree.DataItem|Array.<anychart.data.Tree.DataItem>)
 * }}
 */
anychart.data.Tree.IndexKeyValue;


/**
 * @typedef {{
 *    type: string,
 *    dataItem: anychart.data.Tree.DataItem,
 *    key: string,
 *    value: *
 * }}
 */
anychart.data.Tree.ChangeEvent;


/**
 * @typedef {{
 *    treeDataItemData: !Object,
 *    treeDataItemMeta: (Object|undefined),
 *    children: (Array.<anychart.data.Tree.SerializedDataItem>|undefined)
 * }}
 */
anychart.data.Tree.SerializedDataItem;


/**
 * @typedef {{
 *    from: (string|number),
 *    to: (string|number)
 * }}
 */
anychart.data.Tree.Dependency;


/**
 * Consistency state mask supported by this object.
 * @type {number}
 */
anychart.data.Tree.prototype.SUPPORTED_SIGNALS = anychart.Signal.DATA_CHANGED | anychart.Signal.META_CHANGED;


/**
 * Checks if potentialChild has potentialPrent in upper hierarchy.
 * @param {anychart.data.Tree.DataItem} potentialChild - Potential child.
 * @param {anychart.data.Tree.DataItem} potentialParent - Potential parent.
 * @return {boolean} - Result.
 */
anychart.data.Tree.isDescendant = function(potentialChild, potentialParent) {
  if (!potentialChild.getParent()) return false;
  if (potentialChild.getParent() == potentialParent) return true;
  return anychart.data.Tree.isDescendant(potentialChild.getParent(), potentialParent);
};


/**
 * Starts/stops tree CRUD events dispatching.
 * @param {boolean=} opt_val - Value to be set.
 * @return {boolean|anychart.data.Tree} - Current value or itself for method chaining.
 */
anychart.data.Tree.prototype.dispatchEvents = function(opt_val) {
  if (goog.isDef(opt_val)) {
    this.dispatchEvents_ = opt_val;
    return this;
  }
  return this.dispatchEvents_;
};


/** @inheritDoc */
anychart.data.Tree.prototype.dispatchSignal = function(value) {
  if (!this.suspendedDispatching && !!(value & anychart.Signal.DATA_CHANGED))
    this.traverserToArrayCache_ = null;
  anychart.data.Tree.base(this, 'dispatchSignal', value);
};


/**
 * Creates tree data traverser.
 * @return {anychart.data.Traverser} - New traverser.
 */
anychart.data.Tree.prototype.getTraverser = function() {
  return new anychart.data.Traverser(this);
};


/**
 * Fill data supposing that the source data object has a tree structure.
 * @param {Array.<Object>} data - Tree-structured data.
 * @private
 */
anychart.data.Tree.prototype.fillAsTree_ = function(data) {
  this.suspendSignalsDispatching();
  for (var i = 0, l = data.length; i < l; i++) {
    var newRoot = this.createRoot(data[i]);
    this.roots_.push(newRoot);
    this.indexBranch_(newRoot);
  }
  if (data.length) this.dispatchSignal(anychart.Signal.DATA_CHANGED); //if data is changed.
  this.resumeSignalsDispatching(true);
};


/**
 * Creates root tree data item of incoming raw object.
 * NOTE: Do not export!
 * @param {Object} rawItem - Raw data object.
 * @return {anychart.data.Tree.DataItem} - Root data item.
 */
anychart.data.Tree.prototype.createRoot = function(rawItem) {
  var treeItem = new anychart.data.Tree.DataItem(this, rawItem);

  var children = rawItem[anychart.enums.GanttDataFields.CHILDREN];

  if (children) {
    for (var i = 0, l = children.length; i < l; i++) {
      treeItem.addChildWithoutIndexing(this.createRoot(children[i]));
    }
  }

  return treeItem;
};


/**
 * Fill data supposing that the raw data is a linear array of objects with parent field set.
 * NOTE: Cycles will not be added as data.
 * @param {Array.<Object>} data - Linear set of raw data items pointing to their parents.
 * @private
 */
anychart.data.Tree.prototype.fillAsParentPointer_ = function(data) {
  var i, l, obj, parentId, index, found, searchResult, tdi;

  var uids = []; //List of unique 'id'-field values of raw data items.
  var uitems = []; //List of tree data items synchronized with uids.
  var tdis = []; //List of tree data items overall.

  this.suspendSignalsDispatching();

  //First passage. Going through raw data array.
  for (i = 0, l = data.length; i < l; i++) {
    obj = data[i];

    var dataItem = new anychart.data.Tree.DataItem(this, obj);
    var id = obj[anychart.enums.GanttDataFields.ID];
    tdis.push(dataItem);

    if (goog.isDefAndNotNull(id)) {
      id = id + ''; //Treat ID value as string anyway.
      index = goog.array.binarySearch(uids, id, anychart.utils.compareAsc);
      if (index < 0) {
        var pos = ~index;
        goog.array.insertAt(uids, id, pos);
        searchResult = this.search(anychart.enums.GanttDataFields.ID, id);

        if (searchResult) {
          found = (searchResult instanceof anychart.data.Tree.DataItem) ? searchResult : searchResult[0];
          goog.array.insertAt(uitems, found, pos);
          found.meta('nc', true);
          anychart.core.reporting.warning(anychart.enums.WarningCode.DUPLICATED_DATA_ITEM, null, [id]);
        } else {
          goog.array.insertAt(uitems, dataItem, pos);
        }
      } else {
        anychart.core.reporting.warning(anychart.enums.WarningCode.REFERENCE_IS_NOT_UNIQUE, null, [id]);
      }
    }
  }

  //Second passage. Building trees.
  for (i = 0; i < tdis.length; i++) {
    tdi = tdis[i]; //Tree data item.
    parentId = data[i][anychart.enums.GanttDataFields.PARENT];
    if (goog.isDefAndNotNull(parentId)) {
      parentId = parentId + ''; //Treat ID value as string anyway.
      index = goog.array.binarySearch(uids, parentId, anychart.utils.compareAsc);
      if (index < 0) {
        searchResult = this.search(anychart.enums.GanttDataFields.ID, parentId);
        if (searchResult) {
          found = (searchResult instanceof anychart.data.Tree.DataItem) ? searchResult : searchResult[0];
          found.addChildWithoutIndexing(tdi);
        } else {
          this.roots_.push(tdi);
          anychart.core.reporting.warning(anychart.enums.WarningCode.MISSING_PARENT_ID, null, [parentId]);
        }
        this.indexBranch_(tdi);
      } else {
        var parent = uitems[index];
        parent.addChildWithoutIndexing(tdi);
        if (parent.meta('nc')) this.indexBranch_(tdi);
      }
    } else {
      this.roots_.push(tdi);
      this.indexBranch_(tdi);
    }
  }

  //Third passage. Looking for cycles.
  if (anychart.DEVELOP) {
    for (i = 0; i < tdis.length; i++) {
      tdi = tdis[i]; //Tree data item.
      if (!tdi.meta('nc'))
        anychart.core.reporting.warning(
            anychart.enums.WarningCode.CYCLE_REFERENCE,
            null,
            [tdi.get(anychart.enums.GanttDataFields.ID), tdi.getParent().get(anychart.enums.GanttDataFields.ID)]
        );
    }
  }

  if (tdis.length) this.dispatchSignal(anychart.Signal.DATA_CHANGED); //if data is changed.
  this.resumeSignalsDispatching(true);

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
 * @param {(Object|Array.<anychart.data.Tree.Dependency>)=} opt_csvSettingsOrDeps - CSV settings object or dependencies data.
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
 * @return {anychart.data.Tree} - Itself for method chaining.
 */
anychart.data.Tree.prototype.addData = function(data, opt_fillMethodOrCsvMapping, opt_csvSettingsOrDeps) {
  var fillingMethod = anychart.enums.TreeFillingMethod.AS_TREE;

  if (goog.isString(data)) {
    var parser = new anychart.data.csv.Parser();
    if (goog.typeOf(opt_csvSettingsOrDeps) == 'object') {
      parser.rowsSeparator(/** @type {string|undefined} */(opt_csvSettingsOrDeps['rowsSeparator'])); // if it is undefined, it will not be set.
      parser.columnsSeparator(/** @type {string|undefined} */(opt_csvSettingsOrDeps['columnsSeparator'])); // if it is undefined, it will not be set.
      parser.ignoreTrailingSpaces(/** @type {boolean|undefined} */(opt_csvSettingsOrDeps['ignoreTrailingSpaces'])); // if it is undefined, it will not be set.
      parser.ignoreFirstRow(/** @type {boolean|undefined} */(opt_csvSettingsOrDeps['ignoreFirstRow'])); // if it is undefined, it will not be set.
    }

    var itemsProcessor = new anychart.data.csv.TreeItemsProcessor();
    itemsProcessor.mapping(/** @type {Object|undefined} */ (opt_fillMethodOrCsvMapping));
    parser.parse(data, itemsProcessor);
    data = itemsProcessor.getData();
    fillingMethod = (String(anychart.enums.TreeFillingMethod.AS_TABLE)).toLowerCase();
  } else {
    fillingMethod = (String(opt_fillMethodOrCsvMapping)).toLowerCase();
  }

  this.suspendSignalsDispatching();

  switch (fillingMethod) {
    case 'astable':
    case 'table':
    case 'parentid':
    case 'linear':
    case 'plain':
    case 'db':
    case 'database':
    case 'id':
    case 'parentpointer':
    case 'pointer':
      this.fillAsParentPointer_(data);
      break;

    case 'astree':
    case 'tree':
    case 'structure':
    case 'structural':
    default:
      this.fillAsTree_(data);
      break;
  }

  if (goog.typeOf(opt_csvSettingsOrDeps) == 'array') {
    this.dispatchEvents_ = false;

    for (var i = 0; i < opt_csvSettingsOrDeps.length; i++) {
      var dependency = opt_csvSettingsOrDeps[i];
      if (goog.typeOf(dependency) == 'object') {
        var from = dependency[anychart.enums.DataField.FROM];
        var to = dependency[anychart.enums.DataField.TO];

        if ((goog.isString(from) || goog.isNumber(from)) && (goog.isString(to) || goog.isNumber(to))) {
          var dependent = this.find(anychart.enums.GanttDataFields.ID, to)[0];
          if (dependent) {
            var dependsOn = dependent.get(anychart.enums.DataField.DEPENDS_ON);
            if (goog.isDef(dependsOn)) {
              if (goog.typeOf(dependsOn) == 'array') {
                dependent.set(anychart.enums.DataField.DEPENDS_ON, dependsOn.length, from);
              }
            } else {
              dependent.set(anychart.enums.DataField.DEPENDS_ON, [from]);
            }
          }
        }
      }
    }

    this.dispatchEvents_ = true;
  }

  this.resumeSignalsDispatching(true);
  return this;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Tree indexing.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Default index comparison function.
 * @type {!Function}
 * @private
 */
anychart.data.Tree.prototype.comparisonFunction_ = (function(item1, item2) {
  return anychart.utils.compareAsc(item1.key, item2.key);
});


/**
 * Adds an index for a specified field.
 * NOTE: If index is not created or object has not field specified, nothing will happen.
 * @param {anychart.data.Tree.DataItem} item - Tree data item to be indexed.
 * @param {string=} opt_field - Field name. If not set, will be indexed by all available index fields.
 * @param {boolean=} opt_subTree - Flag if we should go through children deeper.
 * @return {anychart.data.Tree} - Itself for method chaining.
 */
anychart.data.Tree.prototype.addToIndex = function(item, opt_field, opt_subTree) {
  if (!opt_field) {
    for (var field in this.index_) {
      this.addToIndex(item, field, opt_subTree);
    }
    return this;
  }

  if (opt_subTree) {
    for (var i = item.numChildren(); i--;) {
      this.addToIndex(/** @type {anychart.data.Tree.DataItem} */ (item.getChildAt(i)), opt_field, opt_subTree);
    }
  }

  var indexArr = this.index_[/** @type {string} */ (opt_field)];
  if (indexArr) {

    /**
     * @type {anychart.data.Tree.IndexKeyValue}
     */
    var indexKeyValue = {key: item.get(/** @type {string} */ (opt_field)), value: item};
    if (this.isStringIndex_[/** @type {string} */ (opt_field)])
      indexKeyValue.key = '' + indexKeyValue.key;
    var index = goog.array.binarySearch(indexArr, indexKeyValue, this.comparisonFunction_);

    if (index < 0) { //Not found.
      goog.array.insertAt(indexArr, indexKeyValue, ~index);
    } else {
      var keyValuePair = /** {anychart.data.Tree.IndexKeyValue} */ (indexArr[index]);
      if (!goog.isArray(keyValuePair.value)) keyValuePair.value = [keyValuePair.value]; //Turning single value to array.
      keyValuePair.value.push(item);
    }
  }
  return this;
};


/**
 * Removes from index for a specified field.
 * NOTE: If index is not created or object has not field specified, nothing will happen.
 * @param {anychart.data.Tree.DataItem} item - Tree data item to be removed from index.
 * @param {string=} opt_field - Field name. If not set, will be removed by all available index fields.
 * @param {boolean=} opt_subTree - Flag if we should go through children deeper.
 * @return {anychart.data.Tree} - Itself for method chaining.
 */
anychart.data.Tree.prototype.removeFromIndex = function(item, opt_field, opt_subTree) {
  if (!opt_field) {
    for (var field in this.index_) {
      this.removeFromIndex(item, field, opt_subTree);
    }
    return this;
  }

  if (opt_subTree) {
    for (var i = item.numChildren(); i--;) {
      this.removeFromIndex(/** @type {anychart.data.Tree.DataItem} */ (item.getChildAt(i)), opt_field, opt_subTree);
    }
  }

  var indexArr = this.index_[opt_field]; //Array of key-value pairs or undefined.
  if (indexArr) {
    //Looking in index array of key-value pairs for unique key.
    var indexKey = {key: item.get(/** @type {string} */ (opt_field))};
    if (this.isStringIndex_[/** @type {string} */ (opt_field)])
      indexKey.key = '' + indexKey.key;
    var index = goog.array.binarySearch(indexArr, indexKey, this.comparisonFunction_); //index here really can't be negative (value must exist). If not found - here's a bug.
    var found = indexArr[index]; //found {key:'', value:(TreeDataItem|Array)}-object. Value can be a tree data item or array.
    if (found) {
      if (goog.isArray(found.value) && found.value.length > 1) {
        goog.array.remove(found.value, item);
      } else {
        goog.array.removeAt(this.index_[opt_field], index);
      }
    }
  }

  return this;
};


/**
 * Creates an index on a specified field.
 * It can't be indexed by 'parent' or 'children' fields because these fields are not available by treeItem.get(field); (@see createComparisonFunction).
 * @param {string} field - Field name.
 * @param {boolean=} opt_asString - If the value should be treated as string always.
 * @return {anychart.data.Tree} - Itself for method chaining.
 */
anychart.data.Tree.prototype.createIndexOn = function(field, opt_asString) {
  if (!this.index_[field]) { //Index can be created.
    this.isStringIndex_[field] = !!opt_asString;
    this.defaultTraverser_.reset();
    this.index_[field] = [];

    if (!this.traverserToArrayCache_) this.traverserToArrayCache_ = this.defaultTraverser_.toArray();

    for (var i = 0; i < this.traverserToArrayCache_.length; i++) {
      this.addToIndex(/** @type {anychart.data.Tree.DataItem} */ (this.traverserToArrayCache_[i]), field);
    }
  }
  return this;
};


/**
 * Removes index on a specified field.
 * @param {string} field - Field name.
 * @return {anychart.data.Tree} - Itself for method chaining.
 */
anychart.data.Tree.prototype.removeIndexOn = function(field) {
  delete this.index_[field];
  delete this.isStringIndex_[field];
  return this;
};


/**
 * Indexes a data item with all it's children.
 * Used if item can't be indexed while creation (example: fillAsParentPointer_ method can't index item because it can
 * be cycled and must not be in index) and if item must be indexed with all it's children.
 * NOTE: Do not export this method.
 * @param {anychart.data.Tree.DataItem} root - Root item.
 * @private
 * @return {anychart.data.Tree} - Itself.
 */
anychart.data.Tree.prototype.indexBranch_ = function(root) {
  this.addToIndex(root);
  root.meta('nc', true);
  for (var i = 0; i < root.numChildren(); i++) {
    this.indexBranch_(/** @type {anychart.data.Tree.DataItem} */ (root.getChildAt(i)));
  }
  return this;
};


/**
 * Performs a data search. Returns null of nothing is found, tree data item if here's a single result and array of
 * tree data items if here are multiple matches.
 *
 * @param {string} soughtField - Field for search. Literally means the name of field of data item.
 * @param {(string|number|boolean|function(anychart.data.Tree.DataItem, anychart.data.Tree.DataItem):number|
 * function(anychart.data.Tree.DataItem, number, Array.<anychart.data.Tree.DataItem>):number)} valueOrEvaluator -
 *  Sought value or evaluator function. Evaluator function that receives 3 arguments (the element, the index and the array).
 *  Should return a negative number, zero, or a positive number depending on whether the desired index is before, at, or
 *  after the element passed to it.
 * @param {(function(anychart.data.Tree.DataItem, anychart.data.Tree.DataItem):number|Object)=} opt_comparisonFnOrEvaluatorContext -
 *  Custom comparison function or evaluator context. Optional comparison function by which the array is ordered. Should
 *  take 2 arguments to compare, and return a negative number, zero, or a positive number depending on whether the
 *  first argument is less than, equal to, or greater than the second.
 * @return {(anychart.data.Tree.DataItem|Array.<anychart.data.Tree.DataItem>|null)} - Found tree data item or null or array of found tree data items.
 */
anychart.data.Tree.prototype.search = function(soughtField, valueOrEvaluator, opt_comparisonFnOrEvaluatorContext) {
  var isEvaluator = goog.isFunction(valueOrEvaluator); //Actually means if binary select must be used.
  var i, result;
  var isStringIndex = this.isStringIndex_[soughtField];
  if (this.index_[soughtField]) { //Fast search: index exists.
    var resultIndex = isEvaluator ?
        goog.array.binarySelect(this.index_[soughtField],
            /** @type {!Function} */ (valueOrEvaluator),
            /** @type {Object} */ (opt_comparisonFnOrEvaluatorContext)) :
        goog.array.binarySearch(this.index_[soughtField], {key: isStringIndex ? '' + valueOrEvaluator : valueOrEvaluator},
            /** @type {!Function} */ (opt_comparisonFnOrEvaluatorContext) || /** @type {!Function} */ (this.comparisonFunction_));

    result = resultIndex >= 0 ? this.index_[soughtField][resultIndex].value : null;

    if (goog.isArray(result)) {
      return result.length == 1 ? result[0] : result;
    } else {
      return result;
    }

  } else { //Slow search without indexes: full passage.
    result = [];

    if (!this.traverserToArrayCache_) this.traverserToArrayCache_ = this.defaultTraverser_.toArray();

    if (isEvaluator) {
      for (i = 0; i < this.traverserToArrayCache_.length; i++) {
        var compareResult = valueOrEvaluator.call(opt_comparisonFnOrEvaluatorContext, this.traverserToArrayCache_[i], i, this.traverserToArrayCache_);
        if (!compareResult) result.push(this.traverserToArrayCache_[i]);
      }
    } else {
      var comparator = /** @type {Function} */ (opt_comparisonFnOrEvaluatorContext || anychart.utils.compareAsc);
      for (i = 0; i < this.traverserToArrayCache_.length; i++) {
        if (!comparator(this.traverserToArrayCache_[i].get(soughtField), valueOrEvaluator)) result.push(this.traverserToArrayCache_[i]);
      }
    }

    return result.length ? (result.length == 1 ? result[0] : result) : null;
  }

};


/**
 * Performs a data search. Actually does the same as (@see search) but result is always an array.
 *
 * @param {string} soughtField - Field for search. Literally means the name of field of data item.
 * @param {(string|number|boolean|function(anychart.data.Tree.DataItem, anychart.data.Tree.DataItem):number|
 * function(anychart.data.Tree.DataItem, number, Array.<anychart.data.Tree.DataItem>):number)} valueOrEvaluator -
 *  Sought value or evaluator function. Evaluator function that receives 3 arguments (the element, the index and the array).
 *  Should return a negative number, zero, or a positive number depending on whether the desired index is before, at, or
 *  after the element passed to it.
 * @param {(function(anychart.data.Tree.DataItem, anychart.data.Tree.DataItem):number|Object)=} opt_comparisonFnOrEvaluatorContext -
 *  Custom comparison function or evaluator context. Optional comparison function by which the array is ordered. Should
 *  take 2 arguments to compare, and return a negative number, zero, or a positive number depending on whether the
 *  first argument is less than, equal to, or greater than the second.
 * @return {Array.<anychart.data.Tree.DataItem>} - Array of found tree data items.
 */
anychart.data.Tree.prototype.searchItems = function(soughtField, valueOrEvaluator, opt_comparisonFnOrEvaluatorContext) {
  var result = this.search(soughtField, valueOrEvaluator, opt_comparisonFnOrEvaluatorContext);
  return result ? (goog.isArray(result) ? result : [result]) : [];
};


/**
 * Simple searcher. Searches using default comparison function anychart.utils.compareAsc().
 * NOTE: Can't compare complex values as objects or arrays.
 * TODO (A.Kudryavtsev): This method is added and not exported for inner usage.
 * @param {string} field - Sought field.
 * @param {*} value - Value to be found. If value is complex (object or array) will get incorrect result.
 * @return {Array.<anychart.data.Tree.DataItem>} - If nothing is found, empty array will be returned.
 */
anychart.data.Tree.prototype.find = function(field, value) {
  var i, result;
  var isStringIndex = this.isStringIndex_[field];
  if (this.index_[field]) { //Fast search: index exists.
    var resultIndex = goog.array.binarySearch(this.index_[field], {key: isStringIndex ? '' + value : value}, this.comparisonFunction_);
    result = resultIndex >= 0 ? this.index_[field][resultIndex].value : [];
    return (goog.isArray(result)) ? result : [result];
  } else { //Slow search without indexes: full passage.
    result = [];
    if (!this.traverserToArrayCache_) this.traverserToArrayCache_ = this.defaultTraverser_.toArray();
    for (i = 0; i < this.traverserToArrayCache_.length; i++) {
      if (!anychart.utils.compareAsc(this.traverserToArrayCache_[i].get(field), value))
        result.push(this.traverserToArrayCache_[i]);
    }
    return result;
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Tree CRUD.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Adds a new root element.
 * @param {Object} child - Child object.
 * @return {anychart.data.Tree.DataItem} - Itself for method chaining.
 */
anychart.data.Tree.prototype.addChild = function(child) {
  return this.addChildAt(child, this.numChildren());
};


/**
 * Inserts a new root element into a specified position.
 * @param {(Object|anychart.data.Tree.DataItem|anychart.data.TreeView.DataItem)} child - Child object.
 * @param {number} index - Position.
 * @return {anychart.data.Tree.DataItem} - Itself for method chaining.
 */
anychart.data.Tree.prototype.addChildAt = function(child, index) {
  var treeView = null;
  if (child instanceof anychart.data.TreeView.DataItem) {
    treeView = child.getTreeView();
    child = child.getDataItem();
  }
  this.suspendSignalsDispatching();

  var source = null;
  var sourceIndex = -1;
  var sourceTree = null;

  var dispatchMove = true;

  var oldTree = null;
  if (child instanceof anychart.data.Tree.DataItem) {
    oldTree = child.tree();
    if (oldTree && oldTree != this) {
      sourceTree = oldTree;
      oldTree.suspendSignalsDispatching();
    }
    source = child.getParent();
    sourceIndex = source ? source.indexOfChild(child) : oldTree.indexOfChild(child);
    child.remove();
  } else {
    dispatchMove = false; //We don't move existing item, we create the new one. In this case we dispatch 'create' instead of 'move'.
    child = this.createRoot(child);
  }

  index = goog.math.clamp(index, 0, this.numChildren());
  goog.array.insertAt(this.roots_, child, index);
  this.indexBranch_(child);

  child.tree(this); //Sets a new tree for all subtree. All signals are suspended.
  if (treeView) {
    child.getWrapper(treeView).setParent(null);
  }

  this.dispatchSignal(anychart.Signal.DATA_CHANGED);

  this.resumeSignalsDispatching(true); //Signals must be sent.
  if (oldTree) oldTree.resumeSignalsDispatching(true); //As well as here.

  if (this.dispatchEvents_) {
    var event = {
      'type': dispatchMove ? anychart.enums.EventType.TREE_ITEM_MOVE : anychart.enums.EventType.TREE_ITEM_CREATE,
      'target': null,
      'targetIndex': index,
      'item': child
    };

    if (sourceTree) event['sourceTree'] = sourceTree;
    if (dispatchMove) {
      event['sourceIndex'] = sourceIndex;
      event['source'] = source;
    }
    this.dispatchEvent(event);
  }

  return child;
};


/**
 * Returns a copy of roots array.
 * @return {Array.<anychart.data.Tree.DataItem>} - Copy of roots array.
 */
anychart.data.Tree.prototype.getChildren = function() {
  return goog.array.clone(this.roots_);
};


/**
 * Returns a children array of the tree.
 * DEVELOPERS NOTE: Do not export this method. For inner usage only because is faster than getChildren().
 * @return {Array.<anychart.data.Tree.DataItem>} - Children array.
 */
anychart.data.Tree.prototype.getChildrenUnsafe = function() {
  return this.roots_;
};


/**
 * Returns a length of roots array.
 * @return {number} - Number of roots.
 */
anychart.data.Tree.prototype.numChildren = function() {
  return this.roots_.length;
};


/**
 * Gets the child by index.
 * @param {number} index - Index of child to find.
 * @return {(anychart.data.Tree.DataItem|undefined)} - Child into a specified position.
 */
anychart.data.Tree.prototype.getChildAt = function(index) {
  return this.roots_[index];
};


/**
 * Removes tree's root data item.
 * @param {anychart.data.Tree.DataItem} child - Child to be removed.
 * @return {anychart.data.Tree.DataItem} - Itself for method chaining.
 */
anychart.data.Tree.prototype.removeChild = function(child) {
  return this.removeChildAt(this.indexOfChild(child));
};


/**
 * Gets index of child in a roots array.
 * @param {anychart.data.Tree.DataItem|anychart.data.TreeView.DataItem} child - Sought child.
 * @return {number} - Index of child.
 */
anychart.data.Tree.prototype.indexOfChild = function(child) {
  if (child instanceof anychart.data.TreeView.DataItem)
    child = child.getDataItem();
  return goog.array.indexOf(this.roots_, child);
};


/**
 * Removes child at specified position.
 * @param {number} index - Index of item to be removed.
 * @return {?anychart.data.Tree.DataItem} - Removed item or null if item is not found.
 */
anychart.data.Tree.prototype.removeChildAt = function(index) {
  var result = null;
  if (index >= 0 && index <= this.roots_.length) {
    result = goog.array.splice(this.roots_, index, 1)[0];
    this.removeFromIndex(result, void 0, true);
    this.dispatchSignal(anychart.Signal.DATA_CHANGED);

    if (this.dispatchEvents_) {
      var event = {
        'type': anychart.enums.EventType.TREE_ITEM_REMOVE,
        'source': null,
        'sourceIndex': index,
        'item': result
      };

      this.dispatchEvent(event);
    }
  }
  return result;
};


/**
 * Removes children.
 * @return {anychart.data.Tree} - Itself for method chaining.
 */
anychart.data.Tree.prototype.removeChildren = function() {
  if (this.roots_.length) {
    this.roots_.length = 0;

    for (var field in this.index_) { //Killing an index.
      this.index_[field].length = 0;
    }

    this.dispatchSignal(anychart.Signal.DATA_CHANGED);
  }
  return this;
};


/**
 * @inheritDoc
 */
anychart.data.Tree.prototype.serialize = function() {
  var json = anychart.data.Tree.base(this, 'serialize');
  json['children'] = [];
  for (var i = 0; i < this.numChildren(); i++) {
    var root = this.getChildAt(i);
    json['children'].push(root.serialize());
  }

  json['index'] = [];
  for (var key in this.index_) {
    json['index'].push(key);
  }

  return json;
};


/**
 * Serializes tree without meta information.
 * @return {!Object} Serialized JSON object.
 */
anychart.data.Tree.prototype.serializeWithoutMeta = function() {
  var json = {};
  json['children'] = [];
  for (var i = 0; i < this.numChildren(); i++) {
    var root = this.getChildAt(i);
    json['children'].push(root.serialize(false));
  }

  json['index'] = [];
  for (var key in this.index_) {
    json['index'].push(key);
  }

  return json;
};


//region --- MAPPING ---
/**
 * Creates tree view - mapped tree.
 * @param {Object=} opt_mapping Mapping for the tree.
 * @return {anychart.data.TreeView} Mapped tree.
 */
anychart.data.Tree.prototype.mapAs = function(opt_mapping) {
  return new anychart.data.TreeView(this, opt_mapping || {});
};
//endregion


//----------------------------------------------------------------------------------------------------------------------
//
//  Tree data item.
//
//----------------------------------------------------------------------------------------------------------------------



/**
 * Tree data item implementation.
 * @param {anychart.data.Tree} parentTree - Tree that contains a data item. Used as signal dispatcher in this case.
 * @param {Object} rawData - Data object.
 * @constructor
 */
anychart.data.Tree.DataItem = function(parentTree, rawData) {

  /**
   * Reference to the parent tree.
   * @type {anychart.data.Tree}
   * @private
   */
  this.tree_ = parentTree;

  /**
   * Link to the parent.
   * @type {anychart.data.Tree.DataItem}
   * @private
   */
  this.parent_ = null;


  /**
   * Array of links to the children.
   * @type {Array.<anychart.data.Tree.DataItem>}
   * @private
   */
  this.children_ = [];


  /**
   * Meta data.
   * @type {!Object}
   * @private
   */
  this.meta_ = {};


  var copy = goog.object.clone(rawData);
  delete copy[anychart.enums.GanttDataFields.CHILDREN];
  delete copy[anychart.enums.GanttDataFields.PARENT];


  /**
   * Data.
   * @type {!Object}
   * @private
   */
  this.data_ = copy;

  /**
   * Map of wrapped data items.
   * Key is tree view uid.
   * Value is Array of tree view object and data item object.
   * @type {Object.<string, Array>}
   */
  this.wrappersMap = {};
};


/**
 * Creates a data item from serialized data item.
 * NOTE: Suspend tree's signals dispatching before calling this method.
 * @param {anychart.data.Tree} tree - Parent tree.
 * @param {anychart.data.Tree.SerializedDataItem} config - Serialized data item.
 * @return {anychart.data.Tree.DataItem} - Restored tree data item.
 */
anychart.data.Tree.DataItem.fromSerializedItem = function(tree, config) {
  var data = ('treeDataItemData' in config) ? config['treeDataItemData'] : {};

  var item = new anychart.data.Tree.DataItem(tree, data);

  if ('treeDataItemMeta' in config) {
    var meta = config['treeDataItemMeta'];
    for (var key in meta) { //Restoring meta.
      item.meta(key, meta[key]);
    }
  }

  if ('children' in config) {
    var children = config['children'];
    for (var i = 0; i < children.length; i++) {
      var child = anychart.data.Tree.DataItem.fromSerializedItem(tree, children[i]);
      item.addChild(child);
    }
  }

  return item;
};


/**
 * Suspends tree signal dispatching.
 * @return {anychart.data.Tree.DataItem} - Itself for method chaining.
 * @private
 */
anychart.data.Tree.DataItem.prototype.suspendSignals_ = function() {
  this.tree_.suspendSignalsDispatching();
  return this;
};


/**
 * Resumes tree signal dispatching.
 * @param {boolean} doDispatchSuspendedSignals - Whether to dispatch all signals that were to be dispatched while the
 *    suspend or not.
 * @return {anychart.data.Tree.DataItem} - Itself for method chaining.
 * @private
 */
anychart.data.Tree.DataItem.prototype.resumeSignals_ = function(doDispatchSuspendedSignals) {
  this.tree_.resumeSignalsDispatching(doDispatchSuspendedSignals);
  return this;
};


/**
 * Gets value from data by path specified.
 * @param {...*} var_args - Arguments.
 *
 * Note:
 * For example we have such a structure of object in item:
 *  <code>
 *    'a': {          //Object 'a' - root object in data of tree data item
 *      'b': {        //Object 'b' - Object item.get('a')['b']
 *        'c': [      //Array 'c' as field of object 'c'
 *          {         //0-element of array 'c'. Actually is an Object.
 *            'd': [  //field 'd' of parent Object. Actually is array ['v1', 'v2', 'v3']
 *              'v1',
 *              'v2',
 *              'v3'
 *            ]
 *          }
 *        ]
 *      }
 *    }
 *  </code>
 *
 *  1) Can take arguments like this:
 *    <code>
 *      item.get(['a', 'b', 'c', 0, 'd', 1]);
 *    </code>
 *
 *    It means that element with index 1 in destination array 'd' will be returned as value.
 *
 *  2) The same behaviour is for this case:
 *    <code>
 *      item.get('a', 'b', 'c', 0, 'd', 1);
 *    </code>
 *
 *  4) Note: If path contains some errors, nothing will happen.
 *  Sample of wrong data for the same sample object 'a':
 *    <code>
 *      item.get('a', 'b', 'e', 0, 'd', 1);    //Incorrect name 'e' in path.
 *      item.get('a', 'b', 'c', 2, 'd', 1);    //Incorrect index 2 in path.
 *      item.get(['a', true, 'c', 0, 'd', 1]); //Incorrect (boolean) value in path
 *      //... etc.
 *    </code>
 * @return {*} - Value or undefined if path is invalid.
 */
anychart.data.Tree.DataItem.prototype.get = function(var_args) {
  if (arguments.length) {
    var keyOrPath = arguments[0];

    var iter, item;

    if (goog.isArray(keyOrPath)) { //got item.get(['a', 'b', 0 ]);
      iter = keyOrPath;
    } else if (goog.isString(keyOrPath)) { //got item.get('a', 'b', 0);
      iter = arguments;
    }

    if (goog.isDef(iter)) {
      var parent = this.data_;
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
 * @return {anychart.data.Tree.DataItem} - Itself for method chaining.
 */
anychart.data.Tree.DataItem.prototype.set = function(var_args) {
  if (arguments.length) {
    var keyOrPath = arguments[0];
    var iter, key, i, value, curr, item, prevItem, parent;
    var reduce = 0;
    var path = [];

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
      key = keyOrPath;
      iter = arguments;
      value = iter[iter.length - 1];
      reduce = 1;
    }

    if (goog.isDef(iter)) {
      parent = this.data_;
      prevItem = iter[0];
      path.push(prevItem);
      curr = parent[prevItem];

      //pre-check
      for (i = 1; i < iter.length - reduce; i++) {
        item = iter[i];
        if (!goog.isNumber(item) && !goog.isString(item)) {
          anychart.core.reporting.warning(anychart.enums.WarningCode.DATA_ITEM_SET_PATH);
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
              anychart.core.reporting.warning(anychart.enums.WarningCode.DATA_ITEM_SET_PATH);
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
              anychart.core.reporting.warning(anychart.enums.WarningCode.DATA_ITEM_SET_PATH);
              return this; //Incorrect input.
            }
          } else {
            parent[prevItem] = {};
            curr = parent[item];
            parent = parent[prevItem];
            prevItem = item;
          }
        } else {
          anychart.core.reporting.warning(anychart.enums.WarningCode.DATA_ITEM_SET_PATH);
          return this; //Incorrect input.
        }
      }

      if (parent[prevItem] != value) {
        parent[prevItem] = value;
        this.tree_.removeFromIndex(this, key);
        this.tree_.addToIndex(this, key);
        this.tree_.dispatchSignal(anychart.Signal.DATA_CHANGED);

        if (this.tree_.dispatchEvents()) {
          var event = {
            'type': anychart.enums.EventType.TREE_ITEM_UPDATE,
            'item': this,
            'path': path,
            'field': path[0],
            'value': value
          };

          this.tree_.dispatchEvent(event);
        }
      }
    } else {
      anychart.core.reporting.warning(anychart.enums.WarningCode.DATA_ITEM_SET_PATH);
    }

  }

  return this;
};


/**
 * Removes from data by path specified.
 * @param {...*} var_args - Arguments.
 *
 * Note:
 * For example we have such a structure of object in item.get('a'):
 *  <code>
 *    'a': {          //Object 'a' - root object in data of tree data item
 *      'b': {        //Object 'b' - Object item.get('a')['b']
 *        'c': [      //Array 'c' as field of object 'c'
 *          {         //0-element of array 'c'. Actually is an Object.
 *            'd': [  //field 'd' of parent Object. Actually is array ['v1', 'v2', 'v3']
 *              'v1',
 *              'v2',
 *              'v3'
 *            ]
 *          }
 *        ]
 *      }
 *    }
 *  </code>
 *
 *  1) Can take arguments like this:
 *    <code>
 *      item.delete(['a', 'b', 'c', 0, 'd', 1]);
 *    </code>
 *
 *    It means that element with index 1 in destination array 'd' will be completely removed and
 *    array 'd' will become ['v1', 'v3'].
 *    In this case dispatched event will have the following structure:
 *
 *    <code>
 *      {
 *        type: 'treeItemUpdate',
 *        item: treeDataItem,
 *        field: 'a',
 *        path: ['a', 'b', 'c', 0, 'd', 1],
 *        value: 'v2'
 *      }
 *    </code>
 *
 *  2) The same behaviour is for this case:
 *    <code>
 *      item.delete('a', 'b', 'c', 0, 'd', 1);
 *    </code>
 *
 *  3) This method deletes all the complex structure if path is set:
 *    <code>
 *       item.delete('a');
 *       item.get('a'); //Will return 'undefined'.
 *    </code>
 *
 *  4) Note: If path to be deleted caontains some errors, nothing will happen.
 *  Sample of wrong data for the same sample object 'a':
 *    <code>
 *      item.delete('a', 'b', 'e', 0, 'd', 1);    //Incorrect name 'e' in path.
 *      item.delete('a', 'b', 'c', 2, 'd', 1);    //Incorrect index 2 in path.
 *      item.delete(['a', true, 'c', 0, 'd', 1]); //Incorrect (boolean) value in path
 *      //... etc.
 *    </code>
 * @return {anychart.data.Tree.DataItem} - Itself for method chaining.
 */
anychart.data.Tree.DataItem.prototype.del = function(var_args) {
  if (arguments.length) {
    var keyOrPath = arguments[0];

    var iter, key, item;

    if (goog.isArray(keyOrPath)) { //got item.delete(['a', 'b', 0 ]);
      iter = keyOrPath;
      key = iter[0];
    } else if (goog.isString(keyOrPath)) { //got item.delete('a', 'b', 0);
      iter = arguments;
      key = keyOrPath;
    }

    if (goog.isDef(iter)) {
      var path = [];
      var parent = this.data_;
      var i;

      //pre-check
      for (i = 1; i < iter.length; i++) {
        item = iter[i];
        if (!goog.isNumber(item) && !goog.isString(item)) {
          return this;
        }
      }

      for (i = 0; i < iter.length; i++) {
        item = iter[i];
        path.push(item);

        if (goog.isObject(parent) || goog.isArray(parent)) {
          if (i == iter.length - 1) { //Exactly this should be deleted.
            if (item in parent) {
              var itemToBeDeleted = parent[item];
              if (goog.isArray(parent)) {
                goog.array.removeAt(parent, item);
              } else { //is object.
                delete parent[item];
              }

              this.tree_.removeFromIndex(this, key);
              this.tree_.addToIndex(this, key);
              this.tree_.dispatchSignal(anychart.Signal.DATA_CHANGED);

              if (this.tree_.dispatchEvents()) {
                var event = {
                  'type': anychart.enums.EventType.TREE_ITEM_UPDATE,
                  'item': this,
                  'path': path,
                  'field': path[0],
                  'value': itemToBeDeleted
                };

                this.tree_.dispatchEvent(event);
              }
            } else {
              return this;
            }
          } else {
            parent = parent[item];
          }
        } else {
          return this;
        }
      }
    }
  }

  return this;
};


/**
 * Gets index of data item in parent.
 * NOTE: If parent is null (tree data item is root), index of root in tree will be returned.
 * TODO (A.Kudryavtsev): Do we need to export this?
 * @return {number} - Index of current data item in it's parent (tree or another data item).
 */
anychart.data.Tree.DataItem.prototype.getIndexInParent = function() {
  var parent = this.parent_ || this.tree_;
  return parent.indexOfChild(this);
};


/**
 * Gets/sets a meta data.
 * @param {string} key - Key.
 * @param {*=} opt_value - Value.
 * @return {*} - Value or itself for method chaining.
 */
anychart.data.Tree.DataItem.prototype.meta = function(key, opt_value) {
  if (arguments.length > 1) {
    return this.setMeta(key, opt_value);
  }
  return this.getMeta(key);
};


/**
 * Gets value from meta by path specified.
 * Works totally the same way as item.get().
 * TODO (A.Kudryavtsev): NOTE: Not exported for a while.
 * @param {...*} var_args - Arguments.
 * @return {*} - Value or undefined if path is invalid.
 */
anychart.data.Tree.DataItem.prototype.getMeta = function(var_args) {
  if (arguments.length) {
    var keyOrPath = arguments[0];

    var iter, item;

    if (goog.isArray(keyOrPath)) { //got item.met(['a', 'b', 0 ]);
      iter = keyOrPath;
    } else if (goog.isString(keyOrPath)) { //got item.get('a', 'b', 0);
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
 * TODO (A.Kudryavtsev): NOTE: Not exported for a while.
 * @param {...*} var_args - Path.
 * @return {anychart.data.Tree.DataItem} - Itself for method chaining.
 */
anychart.data.Tree.DataItem.prototype.setMeta = function(var_args) {
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
      key = keyOrPath;
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
        this.tree_.dispatchSignal(anychart.Signal.META_CHANGED);
      }
    }
  }

  return this;
};


/**
 * Gets a data item's parent.
 * @return {anychart.data.Tree.DataItem} - Parent.
 */
anychart.data.Tree.DataItem.prototype.getParent = function() {
  return this.parent_;
};


/**
 * Internal parent setter.
 *
 * NOTE: This method just sets a parent of current tree data item, it doesn't modify a parent's children list.
 * Use parent.addChild() to set the both linkages: parent.addChild(child) sets a parent for child and adds a child into a
 * parent's children list.
 *
 * @param {anychart.data.Tree.DataItem} parent - Parent to be set.
 * @return {anychart.data.Tree.DataItem} - Itself for method chaining.
 * @private
 */
anychart.data.Tree.DataItem.prototype.setParent_ = function(parent) {
  if (this.parent_ != parent) {
    this.parent_ = parent;
    this.tree_.dispatchSignal(anychart.Signal.DATA_CHANGED);
  }
  return this;
};

//----------------------------------------------------------------------------------------------------------------------
//
//  Tree data item CRUD.
//
//----------------------------------------------------------------------------------------------------------------------


/**
 * Adds a child.
 * @param {(Object|anychart.data.Tree.DataItem)} child - Child to be added.
 * @return {anychart.data.Tree.DataItem} - Itself for method chaining.
 */
anychart.data.Tree.DataItem.prototype.addChild = function(child) {
  return this.addChildAt(child, this.numChildren());
};


/**
 * Inserts a child into a specified position.
 * Please make sure that child has not inner cycles to avoid stack overflow exception.
 *
 * @param {(Object|anychart.data.Tree.DataItem|anychart.data.TreeView.DataItem)} child - Child to be added.
 * @param {number} index - Position.
 * @return {anychart.data.Tree.DataItem} - Itself for method chaining.
 */
anychart.data.Tree.DataItem.prototype.addChildAt = function(child, index) {
  var treeView = null;
  if (child instanceof anychart.data.TreeView.DataItem) {
    treeView = child.getTreeView();
    child = child.getDataItem();
  }
  this.tree_.suspendSignalsDispatching();

  var oldTree = null;
  var source = null;
  var sourceIndex = -1;
  var sourceTree = null;

  var dispatchMove = true;

  if (child instanceof anychart.data.Tree.DataItem) {
    oldTree = child.tree();
    if (oldTree && oldTree != this.tree_) {
      sourceTree = oldTree;
      oldTree.suspendSignalsDispatching();
    }
    source = child.getParent();
    sourceIndex = source ? source.indexOfChild(child) : oldTree.indexOfChild(child);
    child.remove();
  } else {
    dispatchMove = false; //We don't move existing item, we create the new one. In this case we dispatch 'create' instead of 'move'.
    child = this.tree_.createRoot(child);
  }

  index = goog.math.clamp(index, 0, this.numChildren());
  goog.array.insertAt(this.children_, child, index);
  this.tree_.addToIndex(child, void 0, true);

  child.tree(this.tree_); //Sets a new tree for all subtree. All signals are suspended.

  child.parent_ = this;
  if (treeView) {
    child.getWrapper(treeView).setParent(this.getWrapper(treeView));
  }

  this.tree_.dispatchSignal(anychart.Signal.DATA_CHANGED);

  this.tree_.resumeSignalsDispatching(true); //Signals must be sent.
  if (oldTree) oldTree.resumeSignalsDispatching(true); //As well as here.

  if (this.tree_.dispatchEvents()) {
    var event = {
      'type': dispatchMove ? anychart.enums.EventType.TREE_ITEM_MOVE : anychart.enums.EventType.TREE_ITEM_CREATE,
      'target': this,
      'targetIndex': index,
      'item': child
    };

    if (sourceTree) event['sourceTree'] = sourceTree;
    if (dispatchMove) {
      event['sourceIndex'] = sourceIndex;
      event['source'] = source;
    }
    this.tree_.dispatchEvent(event);
  }

  return child;
};


/**
 * Adds a child without indexing it. Used for inner data operations to avoid cycles that were not excepted.
 * NOTE: DO NOT EXPORT THIS METHOD!
 *
 * @param {anychart.data.Tree.DataItem} child - Child to be added.
 * @return {anychart.data.Tree.DataItem} - Itself for method chaining.
 */
anychart.data.Tree.DataItem.prototype.addChildWithoutIndexing = function(child) {
  goog.array.insertAt(this.children_, child, this.numChildren());
  child.parent_ = this;
  return this;
};


/**
 * Returns a copy of children array of current data item.
 * @return {Array.<anychart.data.Tree.DataItem>} - Copy of children array.
 */
anychart.data.Tree.DataItem.prototype.getChildren = function() {
  return goog.array.clone(this.children_);
};


/**
 * Returns a children array of current data item.
 * DEVELOPERS NOTE: Do not export this method. For inner usage only because is faster than getChildren().
 * @return {Array.<anychart.data.Tree.DataItem>} - Children array.
 */
anychart.data.Tree.DataItem.prototype.getChildrenUnsafe = function() {
  return this.children_;
};


/**
 * Returns a length of children array.
 * @return {number} - Number of children.
 */
anychart.data.Tree.DataItem.prototype.numChildren = function() {
  return this.children_.length;
};


/**
 * Gets the child by index.
 * @param {number} index - Index of child to find.
 * @return {(anychart.data.Tree.DataItem|undefined)} - Child into a specified position.
 */
anychart.data.Tree.DataItem.prototype.getChildAt = function(index) {
  return this.children_[index];
};


/**
 * Removes data item's child.
 * @param {anychart.data.Tree.DataItem} child - Child to be removed.
 * @return {anychart.data.Tree.DataItem} - Removed element or null.
 */
anychart.data.Tree.DataItem.prototype.removeChild = function(child) {
  return this.removeChildAt(this.indexOfChild(child));
};


/**
 * Removes child at specified position.
 * @param {number} index - Index of item to be removed.
 * @return {?anychart.data.Tree.DataItem} - Removed item or null if item is not found.
 */
anychart.data.Tree.DataItem.prototype.removeChildAt = function(index) {
  var result = null;
  if (index >= 0 && index <= this.children_.length) {
    result = goog.array.splice(this.children_, index, 1)[0];
    this.tree_.removeFromIndex(result, void 0, true);
    result.setParent_(null);

    if (this.tree_.dispatchEvents()) {
      var event = {
        'type': anychart.enums.EventType.TREE_ITEM_REMOVE,
        'source': this,
        'sourceIndex': index,
        'item': result
      };

      this.tree_.dispatchEvent(event);
    }
  }
  return result;
};


/**
 * Removes children.
 * @return {anychart.data.Tree.DataItem} - Itself for method chaining.
 */
anychart.data.Tree.DataItem.prototype.removeChildren = function() {
  var l = this.children_.length;
  if (l) {
    this.suspendSignals_();
    for (var i = 0; i < l; i++) {
      var child = this.children_[i];
      child.setParent_(null);
      this.tree_.removeFromIndex(child, void 0, true);
    }
    this.resumeSignals_(false);
    this.children_.length = 0;
    this.tree_.dispatchSignal(anychart.Signal.DATA_CHANGED);
  }
  return this;
};


/**
 * Gets index of child in a children array.
 * @param {anychart.data.Tree.DataItem|anychart.data.TreeView.DataItem} child - Sought child.
 * @return {number} - Index of child.
 */
anychart.data.Tree.DataItem.prototype.indexOfChild = function(child) {
  if (child instanceof anychart.data.TreeView.DataItem)
    child = child.getDataItem();
  return goog.array.indexOf(this.children_, child);
};


/**
 * Current item will be removed from parent's children and becomes an orphan.
 * If child is a root element, it will be removed from tree.
 * @return {anychart.data.Tree.DataItem} - Itself for method chaining.
 */
anychart.data.Tree.DataItem.prototype.remove = function() {
  if (this.parent_) {
    this.parent_.removeChild(this);
  } else {
    var indexInRoots = this.tree_.indexOfChild(this);
    if (indexInRoots >= 0) { //Is root element.
      this.tree_.removeChildAt(indexInRoots);
    }
  }
  return this;
};


/**
 * Gets/sets a tree that data items belongs to.
 * @param {anychart.data.Tree=} opt_value - New tree to be set.
 * @return {(anychart.data.Tree.DataItem|anychart.data.Tree)} - Current value or itself for method chaining.
 */
anychart.data.Tree.DataItem.prototype.tree = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.tree_ != opt_value) {
      this.treeInternal_(opt_value);
    }
    return this;
  }
  return this.tree_;
};


/**
 * Recursively sets a new tree.
 * @param {anychart.data.Tree} newTree - New tree to be set.
 * @private
 */
anychart.data.Tree.DataItem.prototype.treeInternal_ = function(newTree) {
  this.tree_ = newTree;
  for (var i = 0, l = this.numChildren(); i < l; i++) {
    this.children_[i].treeInternal_(newTree);
  }
};


/**
 * Clone DataItem.
 * @param {anychart.data.Tree} tree
 * @return {anychart.data.Tree.DataItem}
 */
anychart.data.Tree.DataItem.prototype.clone = function(tree) {
  var copy = /** @type {Object} */(anychart.utils.recursiveClone(this.data_));
  delete copy[anychart.enums.GanttDataFields.CHILDREN];
  delete copy[anychart.enums.GanttDataFields.PARENT];

  var clone = new anychart.data.Tree.DataItem(tree, copy);

  for (var i = 0, len = this.numChildren(); i < len; i++) {
    var child = this.getChildAt(i);
    clone.addChild(child.clone(tree));
  }
  return clone;
};


/**
 * DNA test.
 * TODO (A.Kudryavtsev): Add description on exporting this method.
 * @param {anychart.data.Tree.DataItem} potentialParent - Suspicious data item.
 * @return {boolean} - Whether current data item is child of set in parameter.
 */
anychart.data.Tree.DataItem.prototype.isChildOf = function(potentialParent) {
  return anychart.data.Tree.isDescendant(this, potentialParent); //Just sugar.
};


/**
 * Serializes tree data item with its children.
 * @param {boolean=} opt_addMeta [true] Whether to add meta to tree.
 * @return {anychart.data.Tree.SerializedDataItem} - Serialized tree data item.
 */
anychart.data.Tree.DataItem.prototype.serialize = function(opt_addMeta) {
  var result = {
    'treeDataItemData': this.data_
  };
  if (opt_addMeta !== false)
    result['treeDataItemMeta'] = this.meta_;

  for (var i = 0, len = this.numChildren(); i < len; i++) {
    var child = this.getChildAt(i);
    if (!result.children) result.children = [];
    result.children.push(child.serialize(opt_addMeta));
  }

  return result;
};


/**
 * Get data item wrapper.
 * @param {anychart.data.TreeView} treeView Tree view.
 * @return {anychart.data.TreeView.DataItem} Tree view data item.
 */
anychart.data.Tree.DataItem.prototype.getWrapper = function(treeView) {
  var uid = String(goog.getUid(treeView));
  if (uid in this.wrappersMap)
    return /** @type {anychart.data.TreeView.DataItem} */ (this.wrappersMap[uid][1]);
  var isRoot = this.getParent() === null;
  var parentView = isRoot ? null : this.getParent().getWrapper(treeView);
  var treeViewDataItem = new anychart.data.TreeView.DataItem(treeView, this, parentView);
  this.wrappersMap[uid] = [treeView, treeViewDataItem];
  return treeViewDataItem;
};


/**
 * Checks that data item has wrapper.
 * @param {anychart.data.TreeView} treeView Tree view.
 * @return {boolean} Whether data item has wrapper.
 */
anychart.data.Tree.DataItem.prototype.hasWrapper = function(treeView) {
  return (goog.getUid(treeView) in this.wrappersMap);
};


/**
 * Constructor function
 * @param {(Array.<Object>|string)=} opt_data - Raw data or CSV-string. If string is passed, second parameter will be
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
 * @param {Object=} opt_csvSettings - CSV settings object. Should be fields like
 *  rowsSeparator - string or undefined, if it is undefined, it will not be set.
 *  columnsSeparator - string or undefined, if it is undefined, it will not be set.
 *  ignoreTrailingSpaces - boolean or undefined, if it is undefined, it will not be set.
 *  ignoreFirstRow - boolean or undefined, if it is undefined, it will not be set.
 * @return {!anychart.data.Tree}
 */
anychart.data.tree = function(opt_data, opt_fillMethodOrCsvMapping, opt_csvSettings) {
  return new anychart.data.Tree(opt_data, opt_fillMethodOrCsvMapping, opt_csvSettings);
};


//exports
(function() {
  var proto = anychart.data.Tree.prototype;
  goog.exportSymbol('anychart.data.tree', anychart.data.tree);
  proto['getTraverser'] = proto.getTraverser;
  proto['dispatchEvents'] = proto.dispatchEvents;
  proto['addData'] = proto.addData;
  proto['createIndexOn'] = proto.createIndexOn;
  proto['removeIndexOn'] = proto.removeIndexOn;
  proto['search'] = proto.search;
  proto['searchItems'] = proto.searchItems;
  proto['addChild'] = proto.addChild;
  proto['addChildAt'] = proto.addChildAt;
  proto['getChildren'] = proto.getChildren;
  proto['numChildren'] = proto.numChildren;
  proto['getChildAt'] = proto.getChildAt;
  proto['removeChild'] = proto.removeChild;
  proto['removeChildAt'] = proto.removeChildAt;
  proto['removeChildren'] = proto.removeChildren;
  proto['indexOfChild'] = proto.indexOfChild;
  proto['mapAs'] = proto.mapAs;
  //----------------------------------------------------------------------------------------------------------------------
  //
  //  anychart.data.Tree.DataItem
  //  NOTE: instance is not exported.
  //
  //----------------------------------------------------------------------------------------------------------------------
  proto = anychart.data.Tree.DataItem.prototype;
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
