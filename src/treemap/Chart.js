goog.provide('anychart.treemapModule.Chart');

goog.require('anychart.colorScalesModule.ui.ColorRange');
goog.require('anychart.core.SeparateChart');
goog.require('anychart.core.reporting');
goog.require('anychart.core.settings');
goog.require('anychart.core.ui.LabelsFactory');
goog.require('anychart.core.ui.MarkersFactory');
goog.require('anychart.core.utils.IInteractiveSeries');
goog.require('anychart.core.utils.InteractivityState');
goog.require('anychart.core.utils.TypedLayer');
goog.require('anychart.format.Context');
goog.require('anychart.treeDataModule.Tree');
goog.require('anychart.treemapModule.ArrayIterator');
goog.require('anychart.treemapModule.Point');
goog.require('anychart.utils');



/**
 * AnyChart TreeMap class.
 * @param {(anychart.treeDataModule.Tree|anychart.treeDataModule.View|Array.<Object>)=} opt_data - Data tree or raw data.
 * @param {anychart.enums.TreeFillingMethod=} opt_fillMethod - Fill method.
 * @extends {anychart.core.SeparateChart}
 * @implements {anychart.core.utils.IInteractiveSeries}
 * @constructor
 */
anychart.treemapModule.Chart = function(opt_data, opt_fillMethod) {
  anychart.treemapModule.Chart.base(this, 'constructor');

  // need for ColorRange
  this.referenceValueNames = ['x', 'value'];

  /**
   * @type {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem}
   * @private
   */
  this.rootNode_ = null;

  /**
   * Linear index of tree's node.
   * @type {number}
   * @private
   */
  this.linearIndex_ = 0;

  /**
   * Array of nodes.
   * @type {Array.<anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem>}
   * @private
   */
  this.linearNodes_ = [];

  /**
   * Array of nodes.
   * @type {Array.<anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem>}
   * @private
   */
  this.drawingNodes_ = [];

  /**
   * Array of node values.
   * Need to calculate color scale.
   * @type {Array.<number>}
   * @private
   */
  this.nodeValues_ = [];

  /**
   * Array of hint node values.
   * Need to calculate color scale.
   * @type {Array.<number>}
   * @private
   */
  this.hintNodeValues_ = [];

  /**
   * Interactivity state.
   * @type {anychart.core.utils.InteractivityState}
   */
  this.state = new anychart.core.utils.InteractivityState(this);

  this.data(opt_data, opt_fillMethod);

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['maxDepth',
      anychart.ConsistencyState.CHART_LEGEND | anychart.ConsistencyState.TREEMAP_NODE_TYPES | anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_COLOR_RANGE],
    ['hintDepth',
      anychart.ConsistencyState.TREEMAP_NODE_TYPES | anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW],
    ['hintOpacity', anychart.ConsistencyState.TREEMAP_HINT_OPACITY, anychart.Signal.NEEDS_REDRAW],
    ['maxHeadersHeight', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['sort', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['headersDisplayMode', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['labelsDisplayMode', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW]
  ]);
};
goog.inherits(anychart.treemapModule.Chart, anychart.core.SeparateChart);


/**
 * Supported signals.
 * @type {number}
 */
anychart.treemapModule.Chart.prototype.SUPPORTED_SIGNALS =
    anychart.core.SeparateChart.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.NEED_UPDATE_COLOR_RANGE;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.treemapModule.Chart.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.SeparateChart.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.TREEMAP_DATA |
    anychart.ConsistencyState.TREEMAP_LABELS |
    anychart.ConsistencyState.TREEMAP_MARKERS |
    anychart.ConsistencyState.TREEMAP_COLOR_SCALE |
    anychart.ConsistencyState.TREEMAP_COLOR_RANGE |
    anychart.ConsistencyState.TREEMAP_NODE_TYPES |
    anychart.ConsistencyState.TREEMAP_HINT_OPACITY |
    anychart.ConsistencyState.APPEARANCE;


/** @inheritDoc */
anychart.treemapModule.Chart.prototype.usesTreeData = function() {
  return true;
};


/**
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.treemapModule.Chart.PROPERTY_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  function maxDepthNormalizer(opt_value) {
    return anychart.utils.normalizeToNaturalNumber(opt_value, 1, false);
  }
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'maxDepth',
      maxDepthNormalizer);
  function hintDepthNormalizer(opt_value) {
    return anychart.utils.normalizeToNaturalNumber(opt_value, 0, false);
  }
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'hintDepth',
      hintDepthNormalizer);
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'hintOpacity',
      anychart.core.settings.ratioNormalizer);
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'maxHeadersHeight',
      anychart.core.settings.asIsNormalizer);
  function sortNormalizer(opt_value) {
    return anychart.enums.normalizeSort(opt_value, anychart.enums.Sort.DESC);
  }
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'sort',
      sortNormalizer);
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'headersDisplayMode',
      anychart.enums.normalizeLabelsDisplayMode);
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'labelsDisplayMode',
      anychart.enums.normalizeLabelsDisplayMode);

  return map;
})();


/**
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.treemapModule.Chart.COLOR_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  return map;
})();
anychart.core.settings.populate(anychart.treemapModule.Chart, anychart.treemapModule.Chart.PROPERTY_DESCRIPTORS);
anychart.core.settings.populate(anychart.treemapModule.Chart, anychart.treemapModule.Chart.COLOR_DESCRIPTORS);


/** @inheritDoc */
anychart.treemapModule.Chart.prototype.getType = function() {
  return anychart.enums.ChartTypes.TREE_MAP;
};


///  IInteractivitySeries INTERFACE IMPLEMENTATION ///
/**
 * Returns iterator.
 * @return {!anychart.treemapModule.ArrayIterator}
 */
anychart.treemapModule.Chart.prototype.getIterator = function() {
  return this.iterator_ || this.getResetIterator();
};


/**
 * Returns reset iterator.
 * @return {!anychart.treemapModule.ArrayIterator}
 */
anychart.treemapModule.Chart.prototype.getResetIterator = function() {
  return this.iterator_ = new anychart.treemapModule.ArrayIterator(this.drawingNodes_);
};


/** @inheritDoc */
anychart.treemapModule.Chart.prototype.isSeries = function() {
  return true;
};


/** @inheritDoc */
anychart.treemapModule.Chart.prototype.isDiscreteBased = function() {
  return true;
};


/** @inheritDoc */
anychart.treemapModule.Chart.prototype.isSizeBased = function() {
  return false;
};


/** @inheritDoc */
anychart.treemapModule.Chart.prototype.applyAppearanceToPoint = function(pointState) {
  var node = /** @type {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} */ (this.getIterator().getItem());
  var missing = !goog.isDef(node) || node.meta(anychart.treemapModule.Chart.DataFields.MISSING);
  if (missing)
    return;
  var type = node.meta(anychart.treemapModule.Chart.DataFields.TYPE);

  if (type == anychart.treemapModule.Chart.NodeType.HEADER) {
    this.drawLabel_(pointState);
    return;
  }

  // here type can only be RECT and LEAF. both has shape in meta.

  var shape = node.meta(anychart.treemapModule.Chart.DataFields.SHAPE);
  if (shape) {
    this.colorizeShape(pointState);
    this.applyHatchFill(pointState);
  }
  this.drawLabel_(pointState);
  this.drawMarker_(pointState);
};


/** @inheritDoc */
anychart.treemapModule.Chart.prototype.applyAppearanceToSeries = goog.nullFunction;


/** @inheritDoc */
anychart.treemapModule.Chart.prototype.finalizePointAppearance = goog.nullFunction;


/** @inheritDoc */
anychart.treemapModule.Chart.prototype.hoverMode = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeHoverMode(opt_value);
    if (opt_value != this.hoverMode_) {
      this.hoverMode_ = opt_value;
    }
    return this;
  }
  return /** @type {anychart.enums.HoverMode}*/(this.hoverMode_);
};


/**
 * @param {(anychart.enums.SelectionMode|string|null)=} opt_value Selection mode.
 * @return {anychart.treemapModule.Chart|anychart.enums.SelectionMode|null} .
 */
anychart.treemapModule.Chart.prototype.selectionMode = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = goog.isNull(opt_value) ? null : anychart.enums.normalizeSelectMode(opt_value);
    if (opt_value != this.selectionMode_) {
      this.selectionMode_ = opt_value;
    }
    return this;
  }
  return /** @type {anychart.enums.SelectionMode}*/(this.selectionMode_);
};


/**
 * Makes interactive.
 * @param {acgraph.vector.Element} element .
 * @protected
 */
anychart.treemapModule.Chart.prototype.makeInteractive = function(element) {
  if (!element) return;
  var node = this.getIterator().getItem();
  element.tag = {
    series: this,
    index: node.meta('index'),
    node: node
  };
};


/** @inheritDoc */
anychart.treemapModule.Chart.prototype.makeBrowserEvent = function(e) {
  var res = {
    'type': e['type'],
    'target': this,
    'relatedTarget': this.getOwnerElement(e['relatedTarget']) || e['relatedTarget'],
    'domTarget': e['target'],
    'relatedDomTarget': e['relatedTarget'],
    'offsetX': e['offsetX'],
    'offsetY': e['offsetY'],
    'clientX': e['clientX'],
    'clientY': e['clientY'],
    'screenX': e['screenX'],
    'screenY': e['screenY'],
    'button': e['button'],
    'keyCode': e['keyCode'],
    'charCode': e['charCode'],
    'ctrlKey': e['ctrlKey'],
    'altKey': e['altKey'],
    'shiftKey': e['shiftKey'],
    'metaKey': e['metaKey'],
    'platformModifierKey': e['platformModifierKey'],
    'state': e['state']
  };
  var tag = anychart.utils.extractTag(res['domTarget']);
  res['pointIndex'] = anychart.utils.toNumber(tag.index);
  return res;
};


/**
 * Patches the original source event to maintain pointIndex support for
 * browser events.
 * @param {anychart.core.MouseEvent} event
 * @return {Object} An object of event to dispatch. If null - unrecognized type was found.
 */
anychart.treemapModule.Chart.prototype.makePointEvent = function(event) {
  var type = event['type'];
  switch (type) {
    case acgraph.events.EventType.MOUSEOUT:
      type = anychart.enums.EventType.POINT_MOUSE_OUT;
      break;
    case acgraph.events.EventType.MOUSEOVER:
      type = anychart.enums.EventType.POINT_MOUSE_OVER;
      break;
    case acgraph.events.EventType.MOUSEMOVE:
      type = anychart.enums.EventType.POINT_MOUSE_MOVE;
      break;
    case acgraph.events.EventType.MOUSEDOWN:
      type = anychart.enums.EventType.POINT_MOUSE_DOWN;
      break;
    case acgraph.events.EventType.MOUSEUP:
      type = anychart.enums.EventType.POINT_MOUSE_UP;
      break;
    case acgraph.events.EventType.CLICK:
      type = anychart.enums.EventType.POINT_CLICK;
      break;
    case acgraph.events.EventType.DBLCLICK:
      type = anychart.enums.EventType.POINT_DBLCLICK;
      break;
    default:
      return null;
  }

  var pointIndex;
  if ('pointIndex' in event) {
    pointIndex = event['pointIndex'];
  } else if ('labelIndex' in event) {
    pointIndex = event['labelIndex'];
  } else if ('markerIndex' in event) {
    pointIndex = event['markerIndex'];
  }
  pointIndex = anychart.utils.toNumber(pointIndex);
  event['pointIndex'] = pointIndex;

  return {
    'type': type,
    'actualTarget': event['target'],
    'series': this,
    'pointIndex': pointIndex,
    'target': this,
    'originalEvent': event,
    'point': this.getPoint(pointIndex)
  };
};


/** @inheritDoc */
anychart.treemapModule.Chart.prototype.getPoint = function(pointIndex) {
  if (pointIndex in this.linearNodes_)
    return new anychart.treemapModule.Point(this, this.linearNodes_[pointIndex]);
  else
    return null;
};


/** @inheritDoc */
anychart.treemapModule.Chart.prototype.doAdditionActionsOnMouseOverAndMove = function(index, series) {
  index = goog.isArray(index) && index.length ? index[0] : index;
  if (this.colorRange_ && this.colorRange_.target()) {
    var target = this.colorRange_.target();
    if (target == series) {
      var iterator = target.getIterator();
      iterator.select(index);
      var value = iterator.meta(target.referenceValueNames[1]);
      this.colorRange_.showMarker(value);
    }
  }
};


/** @inheritDoc */
anychart.treemapModule.Chart.prototype.doAdditionActionsOnMouseOut = function() {
  if (this.colorRange_ && this.colorRange_.enabled()) {
    this.colorRange_.hideMarker();
  }
};


/** @inheritDoc */
anychart.treemapModule.Chart.prototype.checkIfColorRange = function(target) {
  return target instanceof anychart.colorScalesModule.ui.ColorRange;
};


/**
 * Dispatch drill change event.
 * @param {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} node Node in which we are trying to drill.
 * @param {anychart.core.MouseEvent=} opt_event Event object.
 */
anychart.treemapModule.Chart.prototype.doDrillChange = function(node, opt_event) {
  opt_event = /** @type {anychart.core.MouseEvent} */ (opt_event || {
    'target': this
  });
  var crumbs = this.createCrumbsTo(node);
  var drillChange = {
    'type': anychart.enums.EventType.DRILL_CHANGE,
    'path': crumbs,
    'current': crumbs[crumbs.length - 1]
  };
  this.unselect();
  if (this.prevSelectSeriesStatus) {
    this.dispatchEvent(this.makeInteractivityPointEvent('selected', opt_event, this.prevSelectSeriesStatus, true));
    this.prevSelectSeriesStatus = null;
  }
  if (this.dispatchEvent(drillChange))
    this.setRootNode(node);
};


/** @inheritDoc */
anychart.treemapModule.Chart.prototype.handleMouseDown = function(event) {
  if (event['button'] != acgraph.events.BrowserEvent.MouseButton.LEFT) return;
  var legendOrColorRange = event['target'] instanceof anychart.core.ui.Legend || this.checkIfColorRange(event['target']);
  /*
    Because this method also handles legend item click and color range item click
    we should prevent this click behaviour to avoid drilldown
  */
  if (legendOrColorRange) return;
  var tag = anychart.utils.extractTag(event['domTarget']);

  var series, index;
  if (event['target'] instanceof anychart.core.ui.LabelsFactory || event['target'] instanceof anychart.core.ui.MarkersFactory) {
    var parent = event['target'].getParentEventTarget();
    if (parent.isSeries && parent.isSeries())
      series = parent;
    index = tag;
  } else {
    series = tag && tag.series;
    index = goog.isNumber(tag.index) ? tag.index : event['pointIndex'];
  }

  if (series && !series.isDisposed() && series.enabled() && goog.isFunction(series.makePointEvent)) {
    var iterator = this.getIterator();
    iterator.select(/** @type {number} */ (index));
    var node = /** @type {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} */ (iterator.getItem());
    if (this.isRootNode(node)) {
      if (!this.isTreeRoot(node)) {
        this.doDrillChange(node.getParent());
      }
    } else if (node.numChildren()) {
      this.doDrillChange(node);
    } else {
      anychart.treemapModule.Chart.base(this, 'handleMouseDown', event);
    }
  }
};


/**
 * Creates crumbs to node from tree root.
 * @param {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} node Node.
 * @return {Array} Array of crumbs.
 */
anychart.treemapModule.Chart.prototype.createCrumbsTo = function(node) {
  var crumbs = [];
  var cur = node;
  while (cur = cur.getParent()) {
    crumbs.unshift(this.getPoint(/** @type {number} */ (cur.meta('index'))));
  }
  crumbs.push(this.getPoint(/** @type {number} */ (node.meta('index'))));
  return crumbs;
};


/**
 * Creates crumbs to current root.
 * @return {Array} Current path.
 */
anychart.treemapModule.Chart.prototype.getDrilldownPath = function() {
  this.ensureDataPrepared();
  if (!this.rootNode_)
    return null;
  return this.createCrumbsTo(this.rootNode_);
};


/**
 * Selects a point of the series by its index.
 * @param {number|Array<number>} indexOrIndexes Index of the point to select.
 * @param {anychart.core.MouseEvent=} opt_event Event that initiate point selecting.
 * @return {!anychart.treemapModule.Chart} {@link anychart.treemapModule.Chart} instance for method chaining.
 */
anychart.treemapModule.Chart.prototype.selectPoint = function(indexOrIndexes, opt_event) {
  if (!this.enabled())
    return this;

  var unselect = !(opt_event && opt_event.shiftKey);

  if (goog.isArray(indexOrIndexes)) {
    if (!opt_event)
      this.unselect();

    this.state.setPointState(anychart.PointState.SELECT, indexOrIndexes, unselect ? anychart.PointState.HOVER : undefined);
  } else if (goog.isNumber(indexOrIndexes)) {
    this.state.setPointState(anychart.PointState.SELECT, indexOrIndexes, unselect ? anychart.PointState.HOVER : undefined);
  }

  return this;
};


/**
 * Deselects all points or points by index.
 * @param {(number|Array.<number>)=} opt_indexOrIndexes Index or array of indexes of the point to select.
 */
anychart.treemapModule.Chart.prototype.unselect = function(opt_indexOrIndexes) {
  if (!this.enabled())
    return;

  var index;
  if (goog.isDef(opt_indexOrIndexes))
    index = opt_indexOrIndexes;
  else
    index = (this.state.seriesState == anychart.PointState.NORMAL ? NaN : undefined);
  this.state.removePointState(anychart.PointState.SELECT, index);
};


/**
 * Hovers a point of the series by its index.
 * @param {number|Array<number>} index Index of the point to hover.
 * @return {!anychart.treemapModule.Chart}  {@link anychart.treemapModule.Chart} instance for method chaining.
 */
anychart.treemapModule.Chart.prototype.hoverPoint = function(index) {
  if (!this.enabled())
    return this;

  if (goog.isArray(index)) {
    var hoveredPoints = this.state.getIndexByPointState(anychart.PointState.HOVER);
    for (var i = 0; i < hoveredPoints.length; i++) {
      if (!goog.array.contains(index, hoveredPoints[i])) {
        this.state.removePointState(anychart.PointState.HOVER, hoveredPoints[i]);
      }
    }
    this.state.addPointState(anychart.PointState.HOVER, index);
  } else if (goog.isNumber(index)) {
    this.unhover();
    this.state.addPointState(anychart.PointState.HOVER, index);
  }
  return this;
};


/** @inheritDoc */
anychart.treemapModule.Chart.prototype.unhover = function(opt_indexOrIndexes) {
  if (!(this.state.hasPointState(anychart.PointState.HOVER) ||
      this.state.isStateContains(this.state.getSeriesState(), anychart.PointState.HOVER)) ||
      !this.enabled())
    return;

  var index;
  if (goog.isDef(opt_indexOrIndexes))
    index = opt_indexOrIndexes;
  else
    index = (this.state.seriesState == anychart.PointState.NORMAL ? NaN : undefined);
  this.state.removePointState(anychart.PointState.HOVER, index);
};


/** @inheritDoc */
anychart.treemapModule.Chart.prototype.useUnionTooltipAsSingle = function() {
  return true;
};


/**
 * Desc sort function.
 * @param {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} node1 First node.
 * @param {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} node2 Second node.
 * @return {number}
 */
anychart.treemapModule.Chart.SORT_DESC = function(node1, node2) {
  var size1 = /** @type {number} */(node1.meta(anychart.treemapModule.Chart.DataFields.SIZE));
  var size2 = /** @type {number} */(node2.meta(anychart.treemapModule.Chart.DataFields.SIZE));
  return size2 - size1;
};


/**
 * Asc sort function.
 * @param {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} node1 First node.
 * @param {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} node2 Second node.
 * @return {number}
 */
anychart.treemapModule.Chart.SORT_ASC = function(node1, node2) {
  return -anychart.treemapModule.Chart.SORT_DESC(node1, node2);
};


/**
 * Resets data variables.
 */
anychart.treemapModule.Chart.prototype.resetDataVars = function() {
  this.linearIndex_ = 0;
  this.linearNodes_ = [];
  this.drawingNodes_ = [];
  this.nodeValues_ = [];
  this.hintNodeValues_ = [];
  this.rootNode_ = null;
};


/**
 * Getter/setter for data.
 * @param {(anychart.treeDataModule.Tree|anychart.treeDataModule.View|Array.<Object>)=} opt_value - Data tree or raw data.
 * @param {anychart.enums.TreeFillingMethod=} opt_fillMethod - Fill method.
 * @return {*}
 */
anychart.treemapModule.Chart.prototype.data = function(opt_value, opt_fillMethod) {
  if (goog.isDef(opt_value)) {
    if (opt_value instanceof anychart.treeDataModule.Tree || opt_value instanceof anychart.treeDataModule.View) {
      if (opt_value != this.data_)
        this.data_ = opt_value;
    } else {
      this.data_ = new anychart.treeDataModule.Tree(opt_value, opt_fillMethod);
    }
    this.invalidate(anychart.ConsistencyState.TREEMAP_DATA, anychart.Signal.NEEDS_REDRAW);
    return this;
  }
  return this.data_;
};


/**
 * Drills down to target.
 * @param {(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem|Array|string)} target Target to drill down to.
 */
anychart.treemapModule.Chart.prototype.drillTo = function(target) {
  if (this.prevHoverSeriesStatus) {
    this.unhover();
    this.dispatchEvent(this.makeInteractivityPointEvent('hovered', {'target': this}, this.prevHoverSeriesStatus, true));
    this.prevHoverSeriesStatus = null;
  }
  this.ensureDataPrepared();
  var node = null;
  var data;
  if (target instanceof anychart.treeDataModule.Tree.DataItem || target instanceof anychart.treeDataModule.View.DataItem) {
    // trying to drill by node
    node = target;
  } else if (goog.isArray(target)) {
    data = this.data();
    // suppose user have only one root, or id in first root of tree
    if (data && data.numChildren()) {
      var result = data.getChildAt(0);
      for (var i = 0; i < target.length; i++) {
        if (result)
          result = result.getChildAt(target[i]);
        else
          break;
      }
      if (result)
        node = result;
    }
    // trying to drill by array
  } else {
    // assume we are trying to drill using id from tree
    data = this.data();
    // suppose user have only one root, or id in first root of tree
    if (data && data.numChildren()) {
      node = data.searchItems('id', target)[0];
    }
  }
  this.setRootNode(node);
};


/**
 * Drills one level up from current root node.
 */
anychart.treemapModule.Chart.prototype.drillUp = function() {
  this.ensureDataPrepared();
  if (!this.rootNode_ || this.isTreeRoot(this.rootNode_)) return;
  this.setRootNode(this.rootNode_.getParent());
};


/** @inheritDoc */
anychart.treemapModule.Chart.prototype.legendItemCanInteractInMode = function(mode) {
  return (mode == anychart.enums.LegendItemsSourceMode.CATEGORIES);
};


/** @inheritDoc */
anychart.treemapModule.Chart.prototype.legendItemOver = function(item, event) {
  var meta = /** @type {Object} */(item.meta());
  var series;

  var sourceMode = this.legend().itemsSourceMode();
  if (sourceMode == anychart.enums.LegendItemsSourceMode.CATEGORIES) {
    series = /** @type {anychart.treemapModule.Chart} */(meta.series);
    var scale = meta.scale;
    if (scale && series) {
      var range = meta.range;
      var iterator = series.getResetIterator();

      var points = [];
      while (iterator.advance()) {
        var pointValue = iterator.get(series.referenceValueNames[1]);
        if (range == scale.getRangeByValue(pointValue)) {
          points.push(iterator.getIndex());
        }
      }

      var tag = anychart.utils.extractTag(event['domTarget']);
      if (tag) {
        if (this.interactivity().hoverMode() == anychart.enums.HoverMode.SINGLE) {
          tag.points_ = {
            series: series,
            points: points
          };
        } else {
          tag.points_ = [{
            series: series,
            points: points,
            lastPoint: points[points.length - 1],
            nearestPointToCursor: {index: points[points.length - 1], distance: 0}
          }];
        }
      }

      if (this.colorRange_ && this.colorRange_.enabled() && this.colorRange_.target()) {
        this.colorRange_.showMarker((range.start + range.end) / 2);
      }
    }
  }
};


/** @inheritDoc */
anychart.treemapModule.Chart.prototype.legendItemOut = function(item, event) {
  var meta = /** @type {Object} */(item.meta());

  var sourceMode = this.legend().itemsSourceMode();
  if (sourceMode == anychart.enums.LegendItemsSourceMode.CATEGORIES) {
    if (this.interactivity().hoverMode() == anychart.enums.HoverMode.SINGLE) {
      var tag = anychart.utils.extractTag(event['domTarget']);
      if (tag)
        tag.series = meta.series;
    }
    if (this.colorRange_ && this.colorRange_.enabled() && this.colorRange_.target()) {
      this.colorRange_.hideMarker();
    }
  }
};


/** @inheritDoc */
anychart.treemapModule.Chart.prototype.createLegendItemsProvider = function(sourceMode, itemsFormat) {
  var i, count;
  /**
   * @type {!Array.<anychart.core.ui.Legend.LegendItemProvider>}
   */
  var data = [];
  this.calculate();
  if (sourceMode == anychart.enums.LegendItemsSourceMode.CATEGORIES) {
    var scale = this.colorScale();
    if (scale && scale instanceof anychart.colorScalesModule.Ordinal) {
      var ranges = scale.getProcessedRanges();
      for (i = 0, count = ranges.length; i < count; i++) {
        var range = ranges[i];
        data.push({
          'text': range.name,
          'iconEnabled': true,
          'iconType': anychart.enums.LegendItemIconType.SQUARE,
          'iconFill': range.color,
          'disabled': !this.enabled(),
          'sourceUid': goog.getUid(this),
          'sourceKey': i,
          'meta': {
            series: this,
            scale: scale,
            range: range
          }
        });
      }
    }
  }
  return data;
};


/** @inheritDoc */
anychart.treemapModule.Chart.prototype.getAllSeries = function() {
  return [this];
};


/**
 * Dummy. Because of ColorRange.
 * @return {anychart.treemapModule.Chart} Returns self.
 */
anychart.treemapModule.Chart.prototype.getChart = function() {
  return this;
};


/** @inheritDoc */
anychart.treemapModule.Chart.prototype.getSeriesStatus = function(event) {
  return [];
};


/**
 * TreeMap data item fields.
 * @enum {string}
 */
anychart.treemapModule.Chart.DataFields = {
  SIZE: 'size',
  VALUE: 'value',
  TYPE: 'type',
  POINT_BOUNDS: 'pointBounds',
  CONTENT_BOUNDS: 'contentBounds',
  MISSING: 'missing',
  SHAPE: 'shape',
  HATCH_SHAPE: 'hatchShape'
};


/**
 * TreeMap node types.
 * @enum {number}
 */
anychart.treemapModule.Chart.NodeType = {
  LEAF: 0,
  HEADER: 1,
  RECT: 2,
  TRANSIENT: 3,
  HINT_LEAF: 4
};


/**
 * Checks value for missing.
 * Point is missing when it's undefined or its number value less or equal to zero.
 * @param {number} value Value to check.
 * @return {boolean} Whether value is missing.
 */
anychart.treemapModule.Chart.prototype.isMissing = function(value) {
  return isNaN(value) || value <= 0;
};


/**
 * Recursively calculates node values from leafs (node without children) up to root.
 * If leaf has no value - than set it to 0.
 * @param {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} node Node which value will be calculated.
 * @param {number} depth Current depth.
 * @return {Array.<number>} Array of values of the node - value and size.
 */
anychart.treemapModule.Chart.prototype.calculateNodeSize = function(node, depth) {
  node
      .meta('index', this.linearIndex_++)
      .meta('depth', depth);
  this.linearNodes_.push(node);
  var size;
  var value;
  var numChildren = node.numChildren();
  if (numChildren) {
    var valueSum = 0;
    var sizeSum = 0;
    var ret;
    for (var i = 0; i < numChildren; i++) {
      ret = this.calculateNodeSize(/** @type {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} */ (node.getChildAt(i)), depth + 1);
      valueSum += ret[0];
      sizeSum += ret[1];
    }
    value = valueSum;
    size = sizeSum;
    if (this.isMissing(size)) {
      node.meta(anychart.treemapModule.Chart.DataFields.MISSING, true);
    }
  } else {
    value = node.get(anychart.treemapModule.Chart.DataFields.VALUE);
    size = node.get(anychart.treemapModule.Chart.DataFields.SIZE);

    value = anychart.utils.toNumber(value);
    size = anychart.utils.toNumber(size) || value;
    if (this.isMissing(size)) {
      node.meta(anychart.treemapModule.Chart.DataFields.MISSING, true);
      size = value = 0;
    }
  }
  node.meta(anychart.treemapModule.Chart.DataFields.SIZE, size);
  node.meta(anychart.treemapModule.Chart.DataFields.VALUE, value);
  return [value, size];
};


/**
 * Calculates bounds of points.
 * @param {Array.<anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem>} nodes Points to calculate.
 * @param {anychart.math.Rect} bounds Content bounds.
 */
anychart.treemapModule.Chart.prototype.calculatePointsBounds = function(nodes, bounds) {
  if (/** @type {anychart.enums.Sort} */ (this.getOption('sort')) != anychart.enums.Sort.NONE) {
    nodes.sort(this.sortFunction_);
  }
  var points = new Array(nodes.length);
  var x = bounds.left;
  var y = bounds.top;
  var width = bounds.width;
  var height = bounds.height;

  var dWidth = width;
  var dHeight = height;

  var size = goog.array.reduce(nodes, function(acc, node) {
    return acc + node.meta(anychart.treemapModule.Chart.DataFields.SIZE);
  }, 0);

  var len = points.length;

  var scale = (width * height) / size;
  for (var i = 0; i < len; i++) {
    if (!points[i])
      points[i] = {};
    points[i].valueScale = anychart.math.round((/** @type {number} */ (nodes[i].meta(anychart.treemapModule.Chart.DataFields.SIZE))) * scale, 4);
  }

  var start = 0;
  var end = 0;
  var vert = dWidth > dHeight;
  var aspectCurr = Number.MAX_VALUE;
  var aspectLast;

  var offsetX = 0;
  var offsetY = 0;
  var pt;

  while (end < len) {
    aspectLast = this.getAspect(points, dWidth, dHeight, start, end, vert);

    if (aspectLast > aspectCurr) {
      var currX = 0;
      var currY = 0;

      for (i = start; i < end; i++) {
        pt = points[i];
        pt.x = x + offsetX + currX;
        pt.y = y + offsetY + currY;

        if (vert) {
          currY += pt.height;
        } else {
          currX += pt.width;
        }
      }

      if (vert) {
        offsetX += points[start].width;
      } else {
        offsetY += points[start].height;
      }

      dWidth = width - offsetX;
      dHeight = height - offsetY;

      vert = dWidth > dHeight;

      start = end;
      end = start;

      aspectCurr = Number.MAX_VALUE;
    } else {
      for (i = start; i <= end; i++) {
        pt = points[i];
        pt.width = pt.widthScale < 1 ? 1 : anychart.math.round(pt.widthScale, 4);
        pt.height = pt.heightScale < 1 ? 1 : anychart.math.round(pt.heightScale, 4);
      }
      aspectCurr = aspectLast;
      end++;
    }
  }

  var currX1 = 0;
  var currY1 = 0;

  for (i = start; i < end; i++) {
    pt = points[i];
    pt.x = x + offsetX + currX1;
    pt.y = y + offsetY + currY1;

    if (vert) {
      currY1 += pt.height;
    } else {
      currX1 += pt.width;
    }
  }

  for (i = 0; i < len; i++) {
    pt = points[i];
    var pointBounds = anychart.math.rect(
        pt.x,
        pt.y,
        pt.width,
        pt.height);
    nodes[i].meta(anychart.treemapModule.Chart.DataFields.POINT_BOUNDS, pointBounds);
  }
};


/**
 * Gets aspect.
 * @param {Array.<anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem>} points .
 * @param {number} dWidth .
 * @param {number} dHeight .
 * @param {number} start .
 * @param {number} end .
 * @param {boolean} vert .
 * @return {number} .
 */
anychart.treemapModule.Chart.prototype.getAspect = function(points, dWidth, dHeight, start, end, vert) {
  var total = 0;
  var localWidth;
  var localHeight;

  var pt;
  var i;

  for (i = start; i <= end; i++)
    total += points[i].valueScale;

  if (vert) {
    localHeight = dHeight / total;
    localWidth = total / dHeight;
  } else {
    localWidth = dWidth / total;
    localHeight = total / dWidth;
  }

  for (i = start; i <= end; i++) {
    pt = points[i];

    if (vert) {
      pt.heightScale = localHeight * pt.valueScale;
      pt.widthScale = localWidth;
    } else {
      pt.widthScale = localWidth * pt.valueScale;
      pt.heightScale = localHeight;
    }
  }

  pt = points[end];
  return Math.max(pt.heightScale / pt.widthScale, pt.widthScale / pt.heightScale);
};


/**
 * Checks whether node is root at top level (tree's first child).
 * @param {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} node Node to check.
 * @return {boolean} Is node root.
 */
anychart.treemapModule.Chart.prototype.isTreeRoot = function(node) {
  if (node instanceof anychart.treeDataModule.View.DataItem)
    node = node.getDataItem();
  return node == node.tree().getChildAt(0);
};


/**
 * Checks whether node is root in context of treemap drawing.
 * @param {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} node Node to check.
 * @return {boolean} Is node root.
 */
anychart.treemapModule.Chart.prototype.isRootNode = function(node) {
  return node == this.rootNode_;
};


/**
 * Sets root node.
 * @param {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} node New tree map root.
 */
anychart.treemapModule.Chart.prototype.setRootNode = function(node) {
  this.rootNode_ = node;
  this.invalidate(anychart.ConsistencyState.CHART_LEGEND | anychart.ConsistencyState.TREEMAP_NODE_TYPES | anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEED_UPDATE_COLOR_RANGE | anychart.Signal.NEEDS_REDRAW);
};


/**
 * Returns root node.
 * @return {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} Current root node.
 */
anychart.treemapModule.Chart.prototype.getRootNode = function() {
  return this.rootNode_;
};


/**
 * Getter/setter for point header labels.
 * @param {(Object|boolean|null)=} opt_value Point headers settings.
 * @return {!(anychart.core.ui.LabelsFactory|anychart.treemapModule.Chart)} Labels instance or self for chaining.
 */
anychart.treemapModule.Chart.prototype.headers = function(opt_value) {
  if (!this.headers_) {
    this.headers_ = new anychart.core.ui.LabelsFactory();
    this.headers_.setParentEventTarget(this);
    this.headers_.listenSignals(this.headersInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.headers_.setup(opt_value);
    return this;
  }
  return this.headers_;
};


/**
 * Listener for labels invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.treemapModule.Chart.prototype.headersInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Getter/setter for point hover header labels.
 * @param {(Object|boolean|null)=} opt_value Point hover headers settings.
 * @return {!(anychart.core.ui.LabelsFactory|anychart.treemapModule.Chart)} Labels instance or self for chaining.
 */
anychart.treemapModule.Chart.prototype.hoverHeaders = function(opt_value) {
  if (!this.hoverHeaders_) {
    this.hoverHeaders_ = new anychart.core.ui.LabelsFactory();
    this.hoverHeaders_.enabled(null);
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.hoverHeaders_.setup(opt_value);
    return this;
  }
  return this.hoverHeaders_;
};


/**
 * Getter/setter for point labels.
 * @param {(Object|boolean|null)=} opt_value Point labels settings.
 * @return {!(anychart.core.ui.LabelsFactory|anychart.treemapModule.Chart)} Labels instance or self for chaining.
 */
anychart.treemapModule.Chart.prototype.labels = function(opt_value) {
  if (!this.labels_) {
    this.labels_ = new anychart.core.ui.LabelsFactory();
    this.labels_.setParentEventTarget(this);
    this.labels_.listenSignals(this.labelsInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.labels_.setup(opt_value);
    return this;
  }
  return this.labels_;
};


/**
 * Listener for labels invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.treemapModule.Chart.prototype.labelsInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Getter/setter for point hover labels.
 * @param {(Object|boolean|null)=} opt_value Point hover labels settings.
 * @return {!(anychart.core.ui.LabelsFactory|anychart.treemapModule.Chart)} Labels instance or self for chaining.
 */
anychart.treemapModule.Chart.prototype.hoverLabels = function(opt_value) {
  if (!this.hoverLabels_) {
    this.hoverLabels_ = new anychart.core.ui.LabelsFactory();
    this.hoverLabels_.enabled(null);
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.hoverLabels_.setup(opt_value);
    return this;
  }
  return this.hoverLabels_;
};


/**
 * Getter/setter for point select labels.
 * @param {(Object|boolean|null)=} opt_value Point select labels settings.
 * @return {!(anychart.core.ui.LabelsFactory|anychart.treemapModule.Chart)} Labels instance or self for chaining.
 */
anychart.treemapModule.Chart.prototype.selectLabels = function(opt_value) {
  if (!this.selectLabels_) {
    this.selectLabels_ = new anychart.core.ui.LabelsFactory();
    this.selectLabels_.enabled(null);
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.selectLabels_.setup(opt_value);
    return this;
  }
  return this.selectLabels_;
};


/**
 * Getter/setter for point markers.
 * @param {(Object|boolean|null|string)=} opt_value Point markers settings.
 * @return {!(anychart.core.ui.MarkersFactory|anychart.treemapModule.Chart)} Markers instance or self for chaining.
 */
anychart.treemapModule.Chart.prototype.markers = function(opt_value) {
  if (!this.markers_) {
    this.markers_ = new anychart.core.ui.MarkersFactory();
    this.markers_.setParentEventTarget(this);
    this.markers_.setAutoType(anychart.enums.MarkerType.STAR5);
    this.markers_.listenSignals(this.markersInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.markers_.setup(opt_value);
    return this;
  }
  return this.markers_;
};


/**
 * Listener for markers invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.treemapModule.Chart.prototype.markersInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Getter/setter for point markers.
 * @param {(Object|boolean|null|string)=} opt_value Point hover markers settings.
 * @return {!(anychart.core.ui.MarkersFactory|anychart.treemapModule.Chart)} Markers instance or self for chaining.
 */
anychart.treemapModule.Chart.prototype.hoverMarkers = function(opt_value) {
  if (!this.hoverMarkers_) {
    this.hoverMarkers_ = new anychart.core.ui.MarkersFactory();
    // don't listen to it, for it will be reapplied at the next hover
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.hoverMarkers_.setup(opt_value);
    return this;
  }
  return this.hoverMarkers_;
};


/**
 * @param {(Object|boolean|null|string)=} opt_value Series select markers settings.
 * @return {!(anychart.core.ui.MarkersFactory|anychart.treemapModule.Chart)} Markers instance or self for chaining.
 */
anychart.treemapModule.Chart.prototype.selectMarkers = function(opt_value) {
  if (!this.selectMarkers_) {
    this.selectMarkers_ = new anychart.core.ui.MarkersFactory();
    // don't listen to it, for it will be reapplied at the next hover
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.selectMarkers_.setup(opt_value);
    return this;
  }
  return this.selectMarkers_;
};


/**
 * Color scale.
 * @param {(anychart.colorScalesModule.Ordinal|anychart.colorScalesModule.Linear)=} opt_value
 * @return {anychart.treemapModule.Chart|anychart.colorScalesModule.Ordinal|anychart.colorScalesModule.Linear}
 */
anychart.treemapModule.Chart.prototype.colorScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.colorScale_ != opt_value) {
      if (this.colorScale_)
        this.colorScale_.unlistenSignals(this.colorScaleInvalidated_, this);
      this.colorScale_ = opt_value;
      if (this.colorScale_)
        this.colorScale_.listenSignals(this.colorScaleInvalidated_, this);

      goog.dispose(this.hintColorScale_);
      if (this.colorScale_)
        this.hintColorScale_ = /** @type {anychart.colorScalesModule.Ordinal|anychart.colorScalesModule.Linear} */ (anychart.scales.Base.fromString(this.colorScale_.getType(), null));
      else
        this.hintColorScale_ = null;

      this.invalidate(anychart.ConsistencyState.TREEMAP_COLOR_SCALE | anychart.ConsistencyState.CHART_LEGEND,
          anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.colorScale_;
};


/**
 * Chart scale invalidation handler.
 * @param {anychart.SignalEvent} event Event.
 * @private
 */
anychart.treemapModule.Chart.prototype.colorScaleInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.TREEMAP_COLOR_SCALE | anychart.ConsistencyState.CHART_LEGEND,
        anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Getter/setter for color range.
 * @param {Object=} opt_value Color range settings to set.
 * @return {!(anychart.colorScalesModule.ui.ColorRange|anychart.treemapModule.Chart)} Return current chart markers palette or itself for chaining call.
 */
anychart.treemapModule.Chart.prototype.colorRange = function(opt_value) {
  if (!this.colorRange_) {
    this.colorRange_ = new anychart.colorScalesModule.ui.ColorRange();
    this.colorRange_.setParentEventTarget(this);
    this.colorRange_.listenSignals(this.colorRangeInvalidated_, this);
    this.invalidate(anychart.ConsistencyState.TREEMAP_COLOR_RANGE | anychart.ConsistencyState.BOUNDS,
        anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(opt_value)) {
    this.colorRange_.setup(opt_value);
    return this;
  } else {
    return this.colorRange_;
  }
};


/**
 * Internal marker palette invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.treemapModule.Chart.prototype.colorRangeInvalidated_ = function(event) {
  var state = 0;
  var signal = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state |= anychart.ConsistencyState.TREEMAP_COLOR_RANGE | anychart.ConsistencyState.APPEARANCE;
    signal |= anychart.Signal.NEEDS_REDRAW;
  }
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state |= anychart.ConsistencyState.BOUNDS;
    signal |= anychart.Signal.BOUNDS_CHANGED;
  }
  // if there are no signals, !state and nothing happens.
  this.invalidate(state, signal);
};


/**
 * Getter/setter for fill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|Function|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.treemapModule.Chart|Function} .
 */
anychart.treemapModule.Chart.prototype.fill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var fill = goog.isFunction(opt_fillOrColorOrKeys) ?
        opt_fillOrColorOrKeys :
        acgraph.vector.normalizeFill.apply(null, arguments);
    if (fill != this.fill_) {
      this.fill_ = fill;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_LEGEND);
    }
    return this;
  }
  return this.fill_;
};


/**
 * Getter/setter for hoverFill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|Function|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.treemapModule.Chart|Function} .
 */
anychart.treemapModule.Chart.prototype.hoverFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    this.hoverFill_ = goog.isFunction(opt_fillOrColorOrKeys) ?
        opt_fillOrColorOrKeys :
        acgraph.vector.normalizeFill.apply(null, arguments);
    return this;
  }
  return this.hoverFill_;
};


/**
 * Getter/setter for selectFill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|Function|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.treemapModule.Chart|Function} .
 */
anychart.treemapModule.Chart.prototype.selectFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    this.selectFill_ = goog.isFunction(opt_fillOrColorOrKeys) ?
        opt_fillOrColorOrKeys :
        acgraph.vector.normalizeFill.apply(null, arguments);
    return this;
  }
  return this.selectFill_;
};


/**
 * Getter/setter for stroke.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.treemapModule.Chart|acgraph.vector.Stroke|Function} .
 */
anychart.treemapModule.Chart.prototype.stroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var stroke = goog.isFunction(opt_strokeOrFill) ?
        opt_strokeOrFill :
        acgraph.vector.normalizeStroke.apply(null, arguments);
    if (stroke != this.stroke_) {
      this.stroke_ = stroke;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_LEGEND);
    }
    return this;
  }
  return this.stroke_;
};


/**
 * Getter/setter for current hover stroke settings.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line join style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.treemapModule.Chart|acgraph.vector.Stroke|Function} .
 */
anychart.treemapModule.Chart.prototype.hoverStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    this.hoverStroke_ = goog.isFunction(opt_strokeOrFill) ?
        opt_strokeOrFill :
        acgraph.vector.normalizeStroke.apply(null, arguments);
    return this;
  }
  return this.hoverStroke_;
};


/**
 * Getter/setter for current select stroke settings.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line join style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.treemapModule.Chart|acgraph.vector.Stroke|Function} .
 */
anychart.treemapModule.Chart.prototype.selectStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    this.selectStroke_ = goog.isFunction(opt_strokeOrFill) ?
        opt_strokeOrFill :
        acgraph.vector.normalizeStroke.apply(null, arguments);
    return this;
  }
  return this.selectStroke_;
};


/**
 * Getter/setter for hatchFill.
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|acgraph.vector.HatchFill.HatchFillType|
 * string|boolean)=} opt_patternFillOrTypeOrState PatternFill or HatchFill instance or type or state of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|anychart.treemapModule.Chart|Function|boolean} Hatch fill.
 */
anychart.treemapModule.Chart.prototype.hatchFill = function(opt_patternFillOrTypeOrState, opt_color, opt_thickness, opt_size) {
  if (goog.isDef(opt_patternFillOrTypeOrState)) {
    var hatchFill = goog.isFunction(opt_patternFillOrTypeOrState) || goog.isBoolean(opt_patternFillOrTypeOrState) ?
        opt_patternFillOrTypeOrState :
        acgraph.vector.normalizeHatchFill.apply(null, arguments);

    if (hatchFill != this.hatchFill_) {
      this.hatchFill_ = hatchFill;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_LEGEND);
    }
    return this;
  }
  return this.hatchFill_;
};


/**
 * Getter/setter for hoverHatchFill.
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|acgraph.vector.HatchFill.HatchFillType|
 * string|boolean)=} opt_patternFillOrTypeOrState PatternFill or HatchFill instance or type or state of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|anychart.treemapModule.Chart|Function|boolean} Hatch fill.
 */
anychart.treemapModule.Chart.prototype.hoverHatchFill = function(opt_patternFillOrTypeOrState, opt_color, opt_thickness, opt_size) {
  if (goog.isDef(opt_patternFillOrTypeOrState)) {
    var hatchFill = goog.isFunction(opt_patternFillOrTypeOrState) || goog.isBoolean(opt_patternFillOrTypeOrState) ?
        opt_patternFillOrTypeOrState :
        acgraph.vector.normalizeHatchFill.apply(null, arguments);

    if (hatchFill !== this.hoverHatchFill_)
      this.hoverHatchFill_ = hatchFill;
    return this;
  }
  return this.hoverHatchFill_;
};


/**
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|acgraph.vector.HatchFill.HatchFillType|
 * string|boolean)=} opt_patternFillOrTypeOrState PatternFill or HatchFill instance or type or state of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|anychart.treemapModule.Chart|Function|boolean} Hatch fill.
 */
anychart.treemapModule.Chart.prototype.selectHatchFill = function(opt_patternFillOrTypeOrState, opt_color, opt_thickness, opt_size) {
  if (goog.isDef(opt_patternFillOrTypeOrState)) {
    var hatchFill = goog.isFunction(opt_patternFillOrTypeOrState) || goog.isBoolean(opt_patternFillOrTypeOrState) ?
        opt_patternFillOrTypeOrState :
        acgraph.vector.normalizeHatchFill.apply(null, arguments);

    if (hatchFill !== this.selectHatchFill_)
      this.selectHatchFill_ = hatchFill;
    return this;
  }
  return this.selectHatchFill_;
};


/**
 * Gets node type depends on it's depth.
 * @param {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} node Data node.
 * @param {number} depth Depth.
 * @return {anychart.treemapModule.Chart.NodeType}
 * @private
 */
anychart.treemapModule.Chart.prototype.getNodeType_ = function(node, depth) {
  var numChildren = node.numChildren();
  /** @type {!anychart.treemapModule.Chart.NodeType} */
  var type;
  var maxDepth = /** @type {number} */ (this.getOption('maxDepth'));
  var hintDepth = /** @type {number} */ (this.getOption('hintDepth'));
  var sumDepth = maxDepth + hintDepth;
  if (numChildren) {
    if (depth < maxDepth)
      type = anychart.treemapModule.Chart.NodeType.HEADER;
    else if (depth == maxDepth) {
      if (!hintDepth)
        type = anychart.treemapModule.Chart.NodeType.LEAF;
      else
        type = anychart.treemapModule.Chart.NodeType.RECT;
    } else if (depth > maxDepth) {
      if (depth == sumDepth)
        type = anychart.treemapModule.Chart.NodeType.HINT_LEAF;
      else
        type = anychart.treemapModule.Chart.NodeType.TRANSIENT;
    }
  } else {
    if (depth <= maxDepth)
      type = anychart.treemapModule.Chart.NodeType.LEAF;
    else
      type = anychart.treemapModule.Chart.NodeType.HINT_LEAF;
  }
  node.meta(anychart.treemapModule.Chart.DataFields.TYPE, type);
  return type;
};


/**
 * Calculates bounds for content area (for node children).
 * @param {anychart.math.Rect} bounds Bounds with header.
 * @param {anychart.math.Rect} headerBounds Bounds of header.
 * @return {!anychart.math.Rect} Bounds for content.
 * @private
 */
anychart.treemapModule.Chart.prototype.getBoundsForContent_ = function(bounds, headerBounds) {
  return anychart.math.rect(
      bounds.left,
      bounds.top + headerBounds.height,
      bounds.width,
      bounds.height - headerBounds.height
  );
};


/**
 * Creates format provider for point.
 * @param {boolean=} opt_force Force creating of provider.
 * @return {anychart.format.Context} Provider.
 */
anychart.treemapModule.Chart.prototype.createFormatProvider = function(opt_force) {
  if (!this.pointProvider_ || opt_force)
    this.pointProvider_ = new anychart.format.Context();

  var iterator = this.getIterator();
  var dataItem = iterator.getItem();

  var values = {
    'chart': {value: this, type: anychart.enums.TokenType.UNKNOWN},
    'index': {value: iterator.getIndex(), type: anychart.enums.TokenType.NUMBER},
    'name': {value: dataItem.get('name'), type: anychart.enums.TokenType.STRING},
    'value': {value: dataItem.meta('value'), type: anychart.enums.TokenType.NUMBER},
    'size': {value: dataItem.meta('size'), type: anychart.enums.TokenType.NUMBER}
  };

  this.pointProvider_
      .dataSource(dataItem)
      .statisticsSources([this]);

  return /** @type {anychart.format.Context} */ (this.pointProvider_.propagate(values));
};


/**
 * Creates tooltip format provider.
 * @return {Object}
 */
anychart.treemapModule.Chart.prototype.createTooltipContextProvider = function() {
  return this.createFormatProvider();
};


/**
 * Creates position provider for point.
 * @param {anychart.enums.Anchor} anchor Label anchor.
 * @return {*} Position provider.
 */
anychart.treemapModule.Chart.prototype.createPositionProvider = function(anchor) {
  var bounds = /** @type {anychart.math.Rect} */ (this.getIterator().meta(anychart.treemapModule.Chart.DataFields.POINT_BOUNDS));
  anchor = anychart.enums.normalizeAnchor(anchor);
  return {
    'value': anychart.utils.getCoordinateByAnchor(bounds, anchor)
  };
};


/**
 * Returns label/header anchor value.
 * @param {anychart.PointState|number} pointState Point state.
 * @param {boolean} isHeader whether factory should be for headers.
 * @return {anychart.enums.Anchor} Labels or headers anchor.
 */
anychart.treemapModule.Chart.prototype.getLabelsAnchor = function(pointState, isHeader) {
  var node = /** @type {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} */ (this.getIterator().getItem());

  var factory;
  var hoverFactory;
  var selectFactory;
  var labelType = 'label';
  var hoverLabelType = 'hoverLabel';
  var selectLabelType = 'selectLabel';
  if (isHeader) {
    factory = this.headers();
    hoverFactory = this.hoverHeaders();
    selectFactory = null;
    labelType = 'header';
    hoverLabelType = 'hoverHeader';
    selectLabelType = null;
  } else {
    factory = this.labels();
    hoverFactory = this.hoverLabels();
    selectFactory = this.selectLabels();
  }
  var selected = this.state.isStateContains(pointState, anychart.PointState.SELECT);
  var hovered = !selected && this.state.isStateContains(pointState, anychart.PointState.HOVER);

  var pointLabel = node.get(labelType);
  var hoverPointLabel = hovered ? node.get(hoverLabelType) : null;
  var selectPointLabel = selected ? node.get(selectLabelType) : null;

  var labelAnchor = pointLabel && pointLabel['anchor'] ? pointLabel['anchor'] : null;
  var labelHoverAnchor = hoverPointLabel && hoverPointLabel['anchor'] ? hoverPointLabel['anchor'] : null;
  var labelSelectAnchor = selectPointLabel && selectPointLabel['anchor'] ? selectPointLabel['anchor'] : null;

  return /** @type {anychart.enums.Anchor} */(hovered || selected ?
      hovered ?
          labelHoverAnchor ?
              labelHoverAnchor :
              hoverFactory.getOption('anchor') ?
                  hoverFactory.getOption('anchor') :
                  labelAnchor ?
                      labelAnchor :
                      factory.getOption('anchor') :
          labelSelectAnchor ?
              labelSelectAnchor :
              selectFactory.getOption('anchor') ?
                  selectFactory.getOption('anchor') :
                  labelAnchor ?
                      labelAnchor :
                      factory.getOption('anchor') :
      labelAnchor ?
          labelAnchor :
          factory.getOption('anchor'));
};


/**
 *
 * @param {anychart.math.Rect} bounds Point bounds.
 * @param {string} position Position.
 * @return {*} Position provider.
 */
anychart.treemapModule.Chart.prototype.createMarkerPositionProvider = function(bounds, position) {
  position = anychart.enums.normalizeAnchor(position);
  return {'value': anychart.utils.getCoordinateByAnchor(bounds, position)};
};


/**
 * Gets marker position.
 * @param {anychart.PointState|number} pointState If it is a hovered oe selected marker drawing.
 * @return {string} Position settings.
 */
anychart.treemapModule.Chart.prototype.getMarkersPosition = function(pointState) {
  var node = /** @type {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} */ (this.getIterator().getItem());

  var selected = this.state.isStateContains(pointState, anychart.PointState.SELECT);
  var hovered = !selected && this.state.isStateContains(pointState, anychart.PointState.HOVER);

  var pointMarker = node.get('marker');
  var hoverPointMarker = node.get('hoverMarker');
  var selectPointMarker = node.get('selectMarker');

  var markerPosition = pointMarker && pointMarker['position'] ? pointMarker['position'] : null;
  var markerHoverPosition = hoverPointMarker && hoverPointMarker['position'] ? hoverPointMarker['position'] : null;
  var markerSelectPosition = selectPointMarker && selectPointMarker['position'] ? selectPointMarker['position'] : null;

  return (hovered && (markerHoverPosition || this.hoverMarkers().position())) ||
      (selected && (markerSelectPosition || this.selectMarkers().position())) ||
      markerPosition || this.markers().position();
};


/**
 * Draws marker.
 * @param {anychart.PointState|number} pointState Point state.
 * @private
 */
anychart.treemapModule.Chart.prototype.drawMarker_ = function(pointState) {
  var node = /** @type {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} */ (this.getIterator().getItem());
  var bounds = /** @type {anychart.math.Rect} */ (node.meta(anychart.treemapModule.Chart.DataFields.POINT_BOUNDS));
  var type = node.meta(anychart.treemapModule.Chart.DataFields.TYPE);
  if (type != anychart.treemapModule.Chart.NodeType.LEAF && type != anychart.treemapModule.Chart.NodeType.RECT)
    return;

  var selected = this.state.isStateContains(pointState, anychart.PointState.SELECT);
  var hovered = !selected && this.state.isStateContains(pointState, anychart.PointState.HOVER);

  var index = /** @type {number} */ (node.meta('index'));
  var markersFactory = /** @type {anychart.core.ui.MarkersFactory} */ (this.markers());
  if (selected) {
    markersFactory = /** @type {anychart.core.ui.MarkersFactory} */(this.selectMarkers());
  } else if (hovered) {
    markersFactory = /** @type {anychart.core.ui.MarkersFactory} */(this.hoverMarkers());
  } else {
    markersFactory = /** @type {anychart.core.ui.MarkersFactory} */(this.markers());
  }

  var pointMarker = node.get('marker');
  var hoverPointMarker = node.get('hoverMarker');
  var selectPointMarker = node.get('selectMarker');

  var marker = this.markers().getMarker(index);

  var markerEnabledState = pointMarker && goog.isDef(pointMarker['enabled']) ? pointMarker['enabled'] : null;
  var markerHoverEnabledState = hoverPointMarker && goog.isDef(hoverPointMarker['enabled']) ? hoverPointMarker['enabled'] : null;
  var markerSelectEnabledState = selectPointMarker && goog.isDef(selectPointMarker['enabled']) ? selectPointMarker['enabled'] : null;

  var isDraw = hovered || selected ?
      hovered ?
          goog.isNull(markerHoverEnabledState) ?
              this.hoverMarkers_ && goog.isNull(this.hoverMarkers_.enabled()) ?
                  goog.isNull(markerEnabledState) ?
                      this.markers_.enabled() :
                      markerEnabledState :
                  this.hoverMarkers_.enabled() :
              markerHoverEnabledState :
          goog.isNull(markerSelectEnabledState) ?
              this.selectMarkers_ && goog.isNull(this.selectMarkers_.enabled()) ?
                  goog.isNull(markerEnabledState) ?
                      this.markers_.enabled() :
                      markerEnabledState :
                  this.selectMarkers_.enabled() :
              markerSelectEnabledState :
      goog.isNull(markerEnabledState) ?
          this.markers_.enabled() :
          markerEnabledState;
  if (isDraw) {
    var position = this.getMarkersPosition(pointState);
    var positionProvider = this.createMarkerPositionProvider(bounds, /** @type {anychart.enums.Position|string} */ (position));
    if (marker) {
      marker.positionProvider(positionProvider);
    } else {
      marker = this.markers().add(positionProvider, index);
    }

    marker.resetSettings();
    marker.currentMarkersFactory(markersFactory);
    marker.setSettings(/** @type {Object} */(pointMarker), /** @type {Object} */(hovered ? hoverPointMarker : selectPointMarker));
    marker.draw();
    //return marker;
  } else if (marker) {
    this.markers().clear(marker.getIndex());
  }
};


/**
 * Empty text formatter.
 * Need to control enabled=false behaviour on headers labels.
 * @return {string} Empty string.
 */
anychart.treemapModule.Chart.EMPTY_TEXT_FORMATTER = function() {
  return '';
};


/**
 * Whether we do not need to draw header.
 * @param {*} setting Point setting.
 * @param {*} factory Labels factory.
 * @return {boolean}
 * @private
 */
anychart.treemapModule.Chart.prototype.noHeader_ = function(setting, factory) {
  return /** @type {boolean} */ (!(setting && goog.isDefAndNotNull(setting['enabled'])) && (goog.isNull(setting) || (setting && goog.isDef(setting['enabled']) && setting['enabled'] === null) || factory.enabled() === null));
};


/**
 * Configures label.
 * @param {anychart.PointState|number} pointState Point state.
 * @param {boolean} isHeader Whether it header label or not.
 * @return {anychart.core.ui.LabelsFactory.Label} Label.
 */
anychart.treemapModule.Chart.prototype.configureLabel = function(pointState, isHeader) {
  var node = /** @type {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} */ (this.getIterator().getItem());
  var index = /** @type {number} */ (node.meta('index'));

  var factory;
  var hoverFactory;
  var selectFactory;
  var labelType = 'label';
  var hoverLabelType = 'hoverLabel';
  var selectLabelType = 'selectLabel';

  if (isHeader) {
    factory = this.headers();
    hoverFactory = this.hoverHeaders();
    selectFactory = null;
    labelType = 'header';
    hoverLabelType = 'hoverHeader';
    selectLabelType = null;
  } else {
    factory = this.labels();
    hoverFactory = this.hoverLabels();
    selectFactory = this.selectLabels();
  }

  var selected = this.state.isStateContains(pointState, anychart.PointState.SELECT);
  var hovered = !selected && this.state.isStateContains(pointState, anychart.PointState.HOVER);

  var label = factory.getLabel(index);

  var labelsFactory, stateFactory = null;
  if (selected) {
    stateFactory = labelsFactory = /** @type {anychart.core.ui.LabelsFactory} */(selectFactory);
  } else if (hovered) {
    stateFactory = labelsFactory = /** @type {anychart.core.ui.LabelsFactory} */(hoverFactory);
  } else {
    labelsFactory = /** @type {anychart.core.ui.LabelsFactory} */(factory);
  }

  var pointLabel = node.get(labelType);
  var hoverPointLabel = hovered ? node.get(hoverLabelType) : null;
  var selectPointLabel = selected ? node.get(selectLabelType) : null;

  var labelEnabledState = pointLabel && goog.isDef(pointLabel['enabled']) ? pointLabel['enabled'] : null;
  var labelSelectEnabledState = selectPointLabel && goog.isDef(selectPointLabel['enabled']) ? selectPointLabel['enabled'] : null;
  var labelHoverEnabledState = hoverPointLabel && goog.isDef(hoverPointLabel['enabled']) ? hoverPointLabel['enabled'] : null;
  var isDraw;
  if (isHeader) {
    isDraw = !this.noHeader_(hovered ? hoverPointLabel : pointLabel, labelsFactory);
  } else
    isDraw = hovered || selected ?
        hovered ?
            goog.isNull(labelHoverEnabledState) ?
                goog.isNull(hoverFactory.enabled()) ?
                    goog.isNull(labelEnabledState) ?
                        factory.enabled() :
                        labelEnabledState :
                    hoverFactory.enabled() :
                labelHoverEnabledState :
            goog.isNull(labelSelectEnabledState) ?
                goog.isNull(selectFactory.enabled()) ?
                    goog.isNull(labelEnabledState) ?
                        factory.enabled() :
                        labelEnabledState :
                    selectFactory.enabled() :
                labelSelectEnabledState :
        goog.isNull(labelEnabledState) ?
            factory.enabled() :
            labelEnabledState;

  if (isDraw) {
    var anchor = this.getLabelsAnchor(pointState, isHeader);
    var positionProvider = this.createPositionProvider(anchor);
    var formatProvider = this.createFormatProvider();
    if (label) {
      factory.dropCallsCache(index);
      label.formatProvider(formatProvider);
      label.positionProvider(positionProvider);
    } else {
      label = factory.add(formatProvider, positionProvider, index);
    }

    label.resetSettings();
    label.currentLabelsFactory(/** @type {anychart.core.ui.LabelsFactory} */ (stateFactory));
    label.setSettings(/** @type {Object} */(pointLabel), /** @type {Object} */(hovered ? hoverPointLabel : selectPointLabel));
    return label;
  } else if (label) {
    factory.clear(label.getIndex());
  }

  return null;
};


/**
 * Draws label.
 * @param {anychart.PointState|number} pointState Point state.
 * @private
 */
anychart.treemapModule.Chart.prototype.drawLabel_ = function(pointState) {
  var node = /** @type {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} */ (this.getIterator().getItem());
  var bounds = /** @type {anychart.math.Rect} */ (node.meta(anychart.treemapModule.Chart.DataFields.POINT_BOUNDS));
  var index = /** @type {number} */ (node.meta('index'));
  var type = node.meta(anychart.treemapModule.Chart.DataFields.TYPE);
  var isHeader;

  if (type == anychart.treemapModule.Chart.NodeType.LEAF || type == anychart.treemapModule.Chart.NodeType.RECT) {
    isHeader = false;
  } else if (type == anychart.treemapModule.Chart.NodeType.HEADER) {
    isHeader = true;
  } else
    return;

  var factory;
  var hoverFactory;
  var selectFactory;
  if (isHeader) {
    factory = this.headers();
    hoverFactory = this.hoverHeaders();
    selectFactory = null;
  } else {
    factory = this.labels();
    hoverFactory = this.hoverLabels();
    selectFactory = this.selectLabels();
  }
  var selected = this.state.isStateContains(pointState, anychart.PointState.SELECT);
  var hovered = !selected && this.state.isStateContains(pointState, anychart.PointState.HOVER);
  /** @type {anychart.core.ui.LabelsFactory} */
  var labelsFactory;
  if (selected) {
    labelsFactory = /** @type {anychart.core.ui.LabelsFactory} */(selectFactory);
  } else if (hovered) {
    labelsFactory = /** @type {anychart.core.ui.LabelsFactory} */(hoverFactory);
  } else {
    labelsFactory = /** @type {anychart.core.ui.LabelsFactory} */(factory);
  }

  var displayMode = isHeader ? this.getOption('headersDisplayMode') : this.getOption('labelsDisplayMode');
  var fontSize;
  var label = /** @type {anychart.core.ui.LabelsFactory.Label} */ (this.configureLabel(pointState, isHeader));
  if (label) {
    var mergedSettings = label.getMergedSettings();
    var needAdjust = (mergedSettings['adjustByHeight'] || mergedSettings['adjustByHeight']);
    if (needAdjust && factory.adjustFontSizeMode() == anychart.enums.AdjustFontSizeMode.SAME) {
      fontSize = /** @type {number} */ (label.calculateFontSize(
          bounds.width,
          bounds.height,
          mergedSettings['minFontSize'],
          mergedSettings['maxFontSize'],
          mergedSettings['adjustByWidth'],
          mergedSettings['adjustByHeight']));
    }
    if (needAdjust) {
      factory.setAdjustFontSize(/** @type {number} */(fontSize));
    } else {
      factory.setAdjustFontSize(null);
    }

    mergedSettings['width'] = null;
    mergedSettings['height'] = null;
    if (mergedSettings['adjustByWidth'] || mergedSettings['adjustByHeight'])
      mergedSettings['fontSize'] = label.parentLabelsFactory().autoSettings['fontSize'];
    var measuredBounds = factory.measure(label.formatProvider(), label.positionProvider(), mergedSettings);
    //measuredBounds = mergedSettings['padding'].widenBounds(measuredBounds);

    var outOfCellBounds = !(bounds.left <= measuredBounds.left &&
            bounds.getRight() >= measuredBounds.getRight() &&
            bounds.top <= measuredBounds.top &&
            bounds.getBottom() >= measuredBounds.getBottom());

    var dropText = false;
    var format;
    if (outOfCellBounds) {
      if (displayMode == anychart.enums.LabelsDisplayMode.DROP) {
        if (isHeader) {
          dropText = true;
          format = labelsFactory.getFormat();
          labelsFactory['format'](anychart.treemapModule.Chart.EMPTY_TEXT_FORMATTER);
          label['width'](bounds.width);
          label['height'](bounds.height);
        } else
          factory.clear(index);
      } else {
        if (label.width() != measuredBounds.width || label.height() != measuredBounds.height) {
          label.dropMergedSettings();
          label['width'](bounds.width);
          label['height'](bounds.height);
        }
      }
    } else {
      label['width'](bounds.width);
      label['height'](bounds.height);
    }

    if (displayMode != anychart.enums.LabelsDisplayMode.ALWAYS_SHOW) {
      label['clip'](bounds);
    } else {
      label['clip'](null);
    }

    if (isHeader) {
      var emptyText = false;
      if (goog.isDef(label.enabled()) && !hovered) {
        emptyText = !label.enabled();
      } else {
        emptyText = !labelsFactory.enabled();
      }
      if (emptyText) {
        format = labelsFactory.getFormat();
        labelsFactory['format'](anychart.treemapModule.Chart.EMPTY_TEXT_FORMATTER);
        label.enabled(true);
      }
    }

    label.draw();
    if (dropText || emptyText) {
      labelsFactory.setFormat(/** @type {?Function} */ (format));
    }
  }
};


/**
 * Draws node.
 * @param {anychart.PointState|number} pointState Point state.
 * @private
 */
anychart.treemapModule.Chart.prototype.drawNodeBox_ = function(pointState) {
  var node = /** @type {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} */ (this.getIterator().getItem());
  var bounds = /** @type {anychart.math.Rect} */ (node.meta(anychart.treemapModule.Chart.DataFields.POINT_BOUNDS));
  var type = node.meta(anychart.treemapModule.Chart.DataFields.TYPE);

  var box = /** @type {!acgraph.vector.Rect} */(this.dataLayer_.genNextChild());
  node.meta(anychart.treemapModule.Chart.DataFields.SHAPE, box);
  this.colorizeShape(pointState);
  var shiftedBounds = anychart.math.rect(
      anychart.math.round(bounds.left, 4),
      anychart.math.round(bounds.top, 4),
      anychart.math.round(bounds.width, 4),
      anychart.math.round(bounds.height, 4));

  var stroke = box.stroke();
  var thickness = 0;
  if (stroke)
    thickness = acgraph.vector.getThickness(/** @type {acgraph.vector.Stroke} */ (stroke));
  shiftedBounds.left += thickness / 2;
  shiftedBounds.width -= thickness;
  shiftedBounds.top += thickness / 2;
  shiftedBounds.height -= thickness;

  var l = anychart.utils.applyPixelShift(shiftedBounds.left, thickness);
  var dl = l - shiftedBounds.left;
  var w = anychart.utils.applyPixelShift(shiftedBounds.width, thickness);
  var dw = w - shiftedBounds.width;

  var t = anychart.utils.applyPixelShift(shiftedBounds.top, thickness);
  var dt = t - shiftedBounds.top;
  var h = anychart.utils.applyPixelShift(shiftedBounds.height, thickness);
  var dh = h - shiftedBounds.height;

  shiftedBounds.left = l;
  shiftedBounds.width = w - dl - dw;
  shiftedBounds.top = t;
  shiftedBounds.height = h - dt - dh;
  box.setBounds(shiftedBounds);

  var needHatch = this.hatchFill() || this.hoverHatchFill() || this.selectHatchFill();
  if (needHatch) {
    var hatchBox = this.hatchLayer_.genNextChild();
    hatchBox.deserialize(box.serialize());
    node.meta(anychart.treemapModule.Chart.DataFields.HATCH_SHAPE, hatchBox);
    this.applyHatchFill(pointState);
  }

  if (type != anychart.treemapModule.Chart.NodeType.HINT_LEAF) {
    // type = RECT, LEAF
    this.makeInteractive(box);
  }
};


/**
 * Colorize shape.
 * @param {anychart.PointState|number} pointState Point state.
 */
anychart.treemapModule.Chart.prototype.colorizeShape = function(pointState) {
  var node = /** @type {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} */ (this.getIterator().getItem());
  var shape = node.meta(anychart.treemapModule.Chart.DataFields.SHAPE);

  if (shape) {
    var type = node.meta(anychart.treemapModule.Chart.DataFields.TYPE);
    var value = node.meta(anychart.treemapModule.Chart.DataFields.VALUE);
    var fill = this.getFinalFill(true, pointState);
    if (type == anychart.treemapModule.Chart.NodeType.RECT) {
      fill = anychart.color.setOpacity(fill, /** @type {number} */ (this.getOption('hintOpacity')), true);
    } else if (type == anychart.treemapModule.Chart.NodeType.HINT_LEAF)
      fill = this.hintColorScale_ ? this.hintColorScale_.valueToColor(value) : fill;
    shape.stroke(this.getFinalStroke(true, pointState));
    shape.fill(fill);
  }
};


/**
 * Apply hatch fill.
 * @param {anychart.PointState|number} pointState Point state.
 */
anychart.treemapModule.Chart.prototype.applyHatchFill = function(pointState) {
  var node = /** @type {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} */ (this.getIterator().getItem());
  var hatchFillShape = node.meta(anychart.treemapModule.Chart.DataFields.HATCH_SHAPE);
  if (goog.isDefAndNotNull(hatchFillShape)) {
    hatchFillShape
        .stroke(null)
        .fill(this.getFinalHatchFill(true, pointState));
  }
};


/**
 * Final fill.
 * @param {boolean} usePointSettings Whether to use point settings.
 * @param {anychart.PointState|number} pointState Point state.
 * @return {!acgraph.vector.Fill} Fill.
 */
anychart.treemapModule.Chart.prototype.getFinalFill = function(usePointSettings, pointState) {
  var node = /** @type {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} */ (this.getIterator().getItem());
  var normalColor = /** @type {acgraph.vector.Fill|Function} */((usePointSettings && node.get('fill')) || this.fill());

  var result;
  if (this.state.isStateContains(pointState, anychart.PointState.SELECT)) {
    result = this.normalizeColor(node,
        /** @type {acgraph.vector.Fill|Function} */(
        (usePointSettings && node.get('selectFill')) || this.selectFill() || normalColor),
        normalColor);
  } else if (this.state.isStateContains(pointState, anychart.PointState.HOVER)) {
    result = this.normalizeColor(node,
        /** @type {acgraph.vector.Fill|Function} */(
        (usePointSettings && node.get('hoverFill')) || this.hoverFill() || normalColor),
        normalColor);
  } else {
    result = this.normalizeColor(node, normalColor);
  }

  return acgraph.vector.normalizeFill(/** @type {!acgraph.vector.Fill} */(result));
};


/**
 * Final stroke.
 * @param {boolean} usePointSettings Whether to use point settings.
 * @param {anychart.PointState|number} pointState Point state.
 * @return {!acgraph.vector.Stroke} Stroke.
 */
anychart.treemapModule.Chart.prototype.getFinalStroke = function(usePointSettings, pointState) {
  var node = /** @type {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} */ (this.getIterator().getItem());
  var normalColor = /** @type {acgraph.vector.Fill|Function} */((usePointSettings && node.get('stroke')) || this.stroke());

  var result;
  if (this.state.isStateContains(pointState, anychart.PointState.SELECT)) {
    result = this.normalizeColor(node,
        /** @type {acgraph.vector.Fill|Function} */(
        (usePointSettings && node.get('selectStroke')) || this.selectStroke() || normalColor),
        normalColor);
  } else if (this.state.isStateContains(pointState, anychart.PointState.HOVER)) {
    result = this.normalizeColor(node,
        /** @type {acgraph.vector.Fill|Function} */(
        (usePointSettings && node.get('hoverStroke')) || this.hoverStroke() || normalColor),
        normalColor);
  } else {
    result = this.normalizeColor(node, normalColor);
  }

  return acgraph.vector.normalizeStroke(/** @type {!acgraph.vector.Stroke} */(result));
};


/**
 * Final hatch fill.
 * @param {boolean} usePointSettings Whether to use point settings.
 * @param {anychart.PointState|number} pointState Point state.
 * @return {!(acgraph.vector.HatchFill|acgraph.vector.PatternFill)} Hatch fill.
 */
anychart.treemapModule.Chart.prototype.getFinalHatchFill = function(usePointSettings, pointState) {
  var node = /** @type {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} */ (this.getIterator().getItem());
  var normalHatchFill = /** @type {acgraph.vector.HatchFill|Function} */((usePointSettings && node.get('hatchFill')) || this.hatchFill());

  var hatchFill;
  if (this.state.isStateContains(pointState, anychart.PointState.SELECT)) {
    hatchFill = (usePointSettings && node.get('selectHatchFill')) || this.selectHatchFill() || normalHatchFill;
  } else if (this.state.isStateContains(pointState, anychart.PointState.HOVER)) {
    hatchFill = (usePointSettings && node.get('hoverHatchFill')) || this.hoverHatchFill() || normalHatchFill;
  } else {
    hatchFill = normalHatchFill;
  }

  return /** @type {!(acgraph.vector.HatchFill|acgraph.vector.PatternFill)} */(
      this.normalizeHatchFill(
          /** @type {acgraph.vector.HatchFill|acgraph.vector.PatternFill|Function|boolean|string} */(hatchFill)));
};


/**
 * Gets final normalized fill or stroke color.
 * @param {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} node .
 * @param {acgraph.vector.Fill|acgraph.vector.Stroke|Function} color Normal state color.
 * @param {...(acgraph.vector.Fill|acgraph.vector.Stroke|Function)} var_args .
 * @return {!(acgraph.vector.Fill|acgraph.vector.Stroke)} Normalized color.
 * @protected
 */
anychart.treemapModule.Chart.prototype.normalizeColor = function(node, color, var_args) {
  var fill;
  var sourceColor;
  if (goog.isFunction(color)) {
    if (arguments.length > 2) {
      var args = [node];
      for (var i = 2; i < arguments.length; i++)
        args.push(arguments[i]);
      sourceColor = this.normalizeColor.apply(this, args);
    } else {
      sourceColor = anychart.getFullTheme('palette.items.0');
    }
    var scope = {
      'value': node.meta(anychart.treemapModule.Chart.DataFields.VALUE),
      'sourceColor': sourceColor,
      'colorScale': this.colorScale()
    };
    fill = color.call(scope);
  } else
    fill = color;
  return fill;
};


/**
 * Gets final normalized hatch fill.
 * @param {acgraph.vector.HatchFill|acgraph.vector.PatternFill|Function|boolean|string} hatchFill Hatch fill.
 * @return {acgraph.vector.HatchFill|acgraph.vector.PatternFill} fill.
 * @protected
 */
anychart.treemapModule.Chart.prototype.normalizeHatchFill = function(hatchFill) {
  var fill;
  var index = this.getIterator().getIndex();
  var autoHatch;
  if (goog.isFunction(hatchFill)) {
    autoHatch = /** @type {string} */(anychart.getFullTheme('hatchFillPalette.items.0'));
    var sourceHatchFill = acgraph.vector.normalizeHatchFill(autoHatch);
    var scope = {
      'index': index,
      'sourceHatchFill': sourceHatchFill
    };
    fill = acgraph.vector.normalizeHatchFill(hatchFill.call(scope));
  } else if (goog.isBoolean(hatchFill)) {
    autoHatch = /** @type {string} */(anychart.getFullTheme('hatchFillPalette.items.0'));
    fill = hatchFill ? acgraph.vector.normalizeHatchFill(autoHatch) : null;
  } else
    fill = acgraph.vector.normalizeHatchFill(hatchFill);
  return fill;
};


/**
 * Calculates bounds of header
 * @param {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} node Node that represents header.
 * @param {anychart.math.Rect} bounds Full bounds.
 * @return {anychart.math.Rect} Point header bounds.
 * @private
 */
anychart.treemapModule.Chart.prototype.calculateHeaderBounds_ = function(node, bounds) {
  var index = /** @type {number} */ (node.meta('index'));
  var header = /** @type {?(Object|undefined)} */ (node.get('header'));
  var noHeader = this.noHeader_(header, this.headers());
  if (noHeader)
    return anychart.math.rect(bounds.left, bounds.top, bounds.width, 0);
  header = header || {};
  if (!header.width)
    header.width = bounds.width;

  this.getIterator().select(index);
  var formatProvider = this.createFormatProvider();
  var maxHeadersHeight = anychart.utils.normalizeSize(/** @type {number|string} */(this.getOption('maxHeadersHeight')), bounds.height);
  var rect = this.headers().measure(formatProvider, undefined, header);
  if (rect.height > maxHeadersHeight)
    rect.height = maxHeadersHeight;
  return anychart.math.rect(bounds.left, bounds.top, bounds.width, rect.height);
};


/**
 * Recursively draws node into specified bounds.
 * @param {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} node Node to draw.
 * @param {anychart.math.Rect} bounds Bounds to draw to.
 * @param {number} depth Current depth.
 * @private
 */
anychart.treemapModule.Chart.prototype.drawNode_ = function(node, bounds, depth) {
  if (node.meta(anychart.treemapModule.Chart.DataFields.MISSING))
    return;
  bounds = bounds.clone();
  if (bounds.width < 1 || bounds.height < 1) return;
  var i;
  var numChildren = node.numChildren();
  var children = node.getChildren();

  var pointBounds = null;
  var contentBounds;
  var child;
  var childPointBounds;

  var type = node.meta(anychart.treemapModule.Chart.DataFields.TYPE);

  if (type == anychart.treemapModule.Chart.NodeType.LEAF || type == anychart.treemapModule.Chart.NodeType.HINT_LEAF) {
    pointBounds = bounds.clone();
    node.meta(anychart.treemapModule.Chart.DataFields.POINT_BOUNDS, pointBounds);
  } else {
    if (type == anychart.treemapModule.Chart.NodeType.HEADER) {
      pointBounds = this.calculateHeaderBounds_(node, bounds);
      contentBounds = this.getBoundsForContent_(bounds, pointBounds);
      node.meta(anychart.treemapModule.Chart.DataFields.POINT_BOUNDS, pointBounds);
      node.meta(anychart.treemapModule.Chart.DataFields.CONTENT_BOUNDS, contentBounds);
    }
    if (type == anychart.treemapModule.Chart.NodeType.RECT || type == anychart.treemapModule.Chart.NodeType.TRANSIENT) {
      pointBounds = bounds.clone();
      node.meta(anychart.treemapModule.Chart.DataFields.POINT_BOUNDS, pointBounds);
      node.meta(anychart.treemapModule.Chart.DataFields.CONTENT_BOUNDS, pointBounds);
    }
    this.calculatePointsBounds(children, /** @type {anychart.math.Rect} */ (contentBounds || pointBounds));
    for (i = 0; i < numChildren; i++) {
      child = node.getChildAt(i);
      childPointBounds = child.meta(anychart.treemapModule.Chart.DataFields.POINT_BOUNDS);
      this.drawNode_(child, /** @type {anychart.math.Rect} */ (childPointBounds), depth + 1);
    }
  }
  var index = /** @type {number} */ (node.meta('index'));
  this.getIterator().select(index);
  var pointState = this.state.getPointStateByIndex(index);
  if (type == anychart.treemapModule.Chart.NodeType.TRANSIENT) {
  } else if (type == anychart.treemapModule.Chart.NodeType.HEADER) {
    this.drawLabel_(pointState);
  } else {
    // type = RECT LEAF HINT_LEAF
    this.drawNodeBox_(pointState);
    if (type != anychart.treemapModule.Chart.NodeType.HINT_LEAF) {
      this.drawLabel_(pointState);
      this.drawMarker_(pointState);
    }
  }

};


/**
 * Calculates nodes types.
 * @param {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} node Node.
 * @param {number} depth Depth.
 * @private
 */
anychart.treemapModule.Chart.prototype.calculateNodeTypes_ = function(node, depth) {
  var maxDepth = /** @type {number} */ (this.getOption('maxDepth'));
  var hintDepth = /** @type {number} */ (this.getOption('hintDepth'));
  if (depth > maxDepth + hintDepth) return;
  var type = this.getNodeType_(node, depth);
  this.drawingNodes_[/** @type {number} */(node.meta('index'))] = node;
  var numChildren = node.numChildren();
  if (numChildren) {
    for (var i = 0; i < numChildren; i++) {
      this.calculateNodeTypes_(/** @type {anychart.treeDataModule.Tree.DataItem} */ (node.getChildAt(i)), depth + 1);
    }
  }
  var value = /** @type {number} */(node.meta(anychart.treemapModule.Chart.DataFields.VALUE));
  if (type == anychart.treemapModule.Chart.NodeType.LEAF || type == anychart.treemapModule.Chart.NodeType.RECT)
    this.nodeValues_.push(value);
  else if (type == anychart.treemapModule.Chart.NodeType.HINT_LEAF)
    this.hintNodeValues_.push(value);
};


/**
 * Prepares tree data for treeMap.
 */
anychart.treemapModule.Chart.prototype.ensureDataPrepared = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.TREEMAP_DATA)) {
    this.resetDataVars();
    this.markConsistent(anychart.ConsistencyState.TREEMAP_DATA);
    var data = this.data();
    if (data) {
      var numChildren = data.numChildren();
      // more than one root node
      if (numChildren > 1)
        anychart.core.reporting.warning(anychart.enums.WarningCode.TREEMAP_MANY_ROOTS);
      // no data case
      else if (!numChildren)
        return;
      if (!this.rootNode_)
        this.rootNode_ = data.getChildAt(0);
      this.calculateNodeSize(data.getChildAt(0), 0);
    } else {
      return;
    }
    this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.TREEMAP_NODE_TYPES | anychart.ConsistencyState.TREEMAP_COLOR_SCALE);
  }
};


/**
 * Calculate data and scale.
 */
anychart.treemapModule.Chart.prototype.calculate = function() {
  this.ensureDataPrepared();
  if (!this.rootNode_)
    return;

  if (this.hasInvalidationState(anychart.ConsistencyState.TREEMAP_NODE_TYPES)) {
    this.nodeValues_ = [];
    this.hintNodeValues_ = [];
    this.drawingNodes_ = [];
    this.calculateNodeTypes_(this.rootNode_, 0);
    this.getResetIterator();
    this.markConsistent(anychart.ConsistencyState.TREEMAP_NODE_TYPES);
    this.invalidate(anychart.ConsistencyState.TREEMAP_COLOR_SCALE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.TREEMAP_COLOR_SCALE)) {
    if (this.colorScale_) {
      if (this.colorScale_.needsAutoCalc()) {
        this.colorScale_.startAutoCalc();
        this.colorScale_.extendDataRange.apply(this.colorScale_, this.nodeValues_);
        this.colorScale_.finishAutoCalc();
      } else {
        this.colorScale_.resetDataRange();
        this.colorScale_.extendDataRange.apply(this.colorScale_, this.nodeValues_);
      }
      if (this.colorScale_ instanceof anychart.colorScalesModule.Ordinal)
        this.colorScale_.ticks().markInvalid();
      this.hintColorScale_.setup(this.colorScale_.serialize());
    }
    if (this.hintColorScale_) {
      if (this.hintColorScale_.needsAutoCalc()) {
        this.hintColorScale_.startAutoCalc();
        this.hintColorScale_.extendDataRange.apply(this.hintColorScale_, this.hintNodeValues_);
        this.hintColorScale_.finishAutoCalc();
      } else {
        this.hintColorScale_.resetDataRange();
        this.hintColorScale_.extendDataRange.apply(this.hintColorScale_, this.hintNodeValues_);
      }
    }
    this.invalidate(anychart.ConsistencyState.APPEARANCE);
    this.markConsistent(anychart.ConsistencyState.TREEMAP_COLOR_SCALE);
  }
};


/** @inheritDoc */
anychart.treemapModule.Chart.prototype.drawContent = function(bounds) {
  if (this.isConsistent())
    return;

  this.calculate();
  // if we do not set root node in previous step - something wrong with data
  if (!this.rootNode_)
    return;

  if (this.hasInvalidationState(anychart.ConsistencyState.TREEMAP_COLOR_RANGE)) {
    if (this.colorRange_) {
      this.colorRange_.suspendSignalsDispatching();
      this.colorRange_.scale(this.colorScale());
      this.colorRange_.target(this);
      this.colorRange_.resumeSignalsDispatching(false);
      this.invalidate(anychart.ConsistencyState.BOUNDS);
    }
  }
  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    if (this.colorRange_) {
      this.colorRange_.parentBounds(bounds.clone().round());
      this.dataBounds_ = this.colorRange_.getRemainingBounds();
    } else {
      this.dataBounds_ = bounds.clone();
    }
    if (this.dataLayer_)
      this.dataLayer_.clip(this.dataBounds_);
    if (this.headers_)
      this.headers_['clip'](this.dataBounds_);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.TREEMAP_COLOR_RANGE)) {
    if (this.colorRange_) {
      this.colorRange_.suspendSignalsDispatching();
      this.colorRange_.container(this.rootElement);
      this.colorRange_.zIndex(50);
      this.colorRange_.draw();
      this.colorRange_.resumeSignalsDispatching(false);
    }
    this.markConsistent(anychart.ConsistencyState.TREEMAP_COLOR_RANGE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    if (this.dataLayer_) {
      this.dataLayer_.clear();
    } else {
      this.dataLayer_ = new anychart.core.utils.TypedLayer(function() {
        return acgraph.rect();
      }, goog.nullFunction);

      this.dataLayer_.clip(this.dataBounds_);
      this.dataLayer_.zIndex(30);
      this.dataLayer_.parent(this.rootElement);

      this.headers().container(this.rootElement).zIndex(41);
      this.headers()['clip'](this.dataBounds_);
      this.labels().container(this.rootElement).zIndex(40);
      this.markers().container(this.rootElement).zIndex(40);
    }

    if (this.hatchLayer_) {
      this.hatchLayer_.clear();
    } else {
      this.hatchLayer_ = new anychart.core.utils.TypedLayer(function() {
        return acgraph.rect();
      }, goog.nullFunction);

      this.hatchLayer_.zIndex(31);
      this.hatchLayer_.parent(this.rootElement);
      this.hatchLayer_.disablePointerEvents(true);
    }

    this.headers().clear();
    this.labels().clear();
    this.markers().clear();

    var sort = /** @type {anychart.enums.Sort} */ (this.getOption('sort'));
    if (sort == anychart.enums.Sort.DESC) {
      this.sortFunction_ = anychart.treemapModule.Chart.SORT_DESC;
    } else if (sort == anychart.enums.Sort.ASC) {
      this.sortFunction_ = anychart.treemapModule.Chart.SORT_ASC;
    }

    this.drawNode_(this.rootNode_, this.dataBounds_, 0);

    this.headers().draw();
    this.labels().draw();
    this.markers().draw();
    this.markConsistent(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.TREEMAP_HINT_OPACITY);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.TREEMAP_HINT_OPACITY)) {
    var iterator = this.getIterator();
    iterator.reset();
    while (iterator.advance()) {
      var type = iterator.meta(anychart.treemapModule.Chart.DataFields.TYPE);
      if (type == anychart.treemapModule.Chart.NodeType.RECT) {
        var shape = iterator.meta(anychart.treemapModule.Chart.DataFields.SHAPE);
        if (shape) {
          var fill = this.getFinalFill(true, anychart.PointState.NORMAL);
          fill = anychart.color.setOpacity(fill, /** @type {number} */ (this.getOption('hintOpacity')), true);
          shape.fill(fill);
        }
      }
    }
    this.markConsistent(anychart.ConsistencyState.TREEMAP_HINT_OPACITY);
  }
};


/** @inheritDoc */
anychart.treemapModule.Chart.prototype.resizeHandler = function(e) {
  if (this.bounds().dependsOnContainerSize()) {
    this.invalidate(anychart.ConsistencyState.BOUNDS,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
  }
};


/** @inheritDoc */
anychart.treemapModule.Chart.prototype.specificContextMenuItems = function(items, context, isPointContext) {
  var tag = anychart.utils.extractTag(context['event']['domTarget']);
  var node;
  if (context['target'] instanceof anychart.core.ui.LabelsFactory || context['target'] instanceof anychart.core.ui.MarkersFactory) {
    node = this.linearNodes_[/** @type {number} */(tag)];
  } else {
    node = tag['node'];
  }

  var specificItems = [];

  var isHeader = node.meta(anychart.treemapModule.Chart.DataFields.TYPE) == anychart.treemapModule.Chart.NodeType.HEADER;
  var canDrillDown = node.numChildren() && !(isHeader && this.isRootNode(node));
  if (canDrillDown) {
    specificItems.push({
      'text': 'Drilldown To',
      'eventType': 'anychart.drillTo',
      'action': goog.bind(this.doDrillChange, this, node)
    });
  }

  var canDrillUp = !this.isTreeRoot(this.getRootNode());
  if (canDrillUp)
    specificItems.push({
      'text': 'Drill Up',
      'eventType': 'anychart.drillUp',
      'action': goog.bind(this.doDrillChange, this, this.getRootNode().getParent())
    });

  if (specificItems.length)
    specificItems.push(null);

  return /** @type {Array.<anychart.ui.ContextMenu.Item>} */(goog.array.concat(
      specificItems,
      anychart.utils.recursiveClone(anychart.core.Chart.contextMenuMap.selectMarquee),
      items));
};


/**
 * @inheritDoc
 */
anychart.treemapModule.Chart.prototype.setupByJSON = function(config, opt_default) {
  anychart.treemapModule.Chart.base(this, 'setupByJSON', config, opt_default);

  if ('treeData' in config)
    this.data(anychart.treeDataModule.Tree.fromJson(config['treeData']));

  if ('colorScale' in config) {
    var json = config['colorScale'];
    var scale = null;
    if (goog.isString(json)) {
      scale = anychart.scales.Base.fromString(json, null);
    } else if (goog.isObject(json)) {
      scale = anychart.scales.Base.fromString(json['type'], null);
      if (scale)
        scale.setup(json);
    }
    if (scale)
      this.colorScale(/** @type {anychart.colorScalesModule.Linear|anychart.colorScalesModule.Ordinal} */ (scale));
  }

  anychart.core.settings.deserialize(this, anychart.treemapModule.Chart.PROPERTY_DESCRIPTORS, config);
  anychart.core.settings.deserialize(this, anychart.treemapModule.Chart.COLOR_DESCRIPTORS, config);
  this.hoverMode(config['hoverMode']);
  this.selectionMode(config['selectionMode']);

  if ('colorRange' in config)
    this.colorRange(config['colorRange']);
  if ('drillTo' in config)
    this.drillTo(config['drillTo']);


  this.fill(config['fill']);
  this.hoverFill(config['hoverFill']);
  this.selectFill(config['selectFill']);

  this.stroke(config['stroke']);
  this.hoverStroke(config['hoverStroke']);
  this.selectStroke(config['selectStroke']);

  this.hatchFill(config['hatchFill']);
  this.selectHatchFill(config['selectHatchFill']);
  this.hoverHatchFill(config['hoverHatchFill']);

  this.headers().setup(config['headers']);
  this.hoverHeaders().setup(config['hoverHeaders']);

  this.labels().setupInternal(!!opt_default, config['labels']);
  this.hoverLabels().setupInternal(!!opt_default, config['hoverLabels']);
  this.selectLabels().setupInternal(!!opt_default, config['selectLabels']);

  this.markers().setup(config['markers']);
  this.hoverMarkers().setup(config['hoverMarkers']);
  this.selectMarkers().setup(config['selectMarkers']);
};


/** @inheritDoc */
anychart.treemapModule.Chart.prototype.serialize = function() {
  var json = anychart.treemapModule.Chart.base(this, 'serialize');

  if (this.colorScale()) {
    json['colorScale'] = this.colorScale().serialize();
  }

  json['type'] = this.getType();

  if (goog.isFunction(this.fill())) {
    anychart.core.reporting.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Series fill']
    );
  } else {
    json['fill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.fill()));
  }

  if (goog.isFunction(this.hoverFill())) {
    anychart.core.reporting.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Series hoverFill']
    );
  } else {
    json['hoverFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.hoverFill()));
  }

  if (goog.isFunction(this.selectFill())) {
    anychart.core.reporting.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Series selectFill']
    );
  } else {
    json['selectFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.selectFill()));
  }

  if (goog.isFunction(this.stroke())) {
    anychart.core.reporting.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Series stroke']
    );
  } else {
    json['stroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.stroke()));
  }

  if (goog.isFunction(this.hoverStroke())) {
    anychart.core.reporting.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Series hoverStroke']
    );
  } else {
    json['hoverStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.hoverStroke()));
  }

  if (goog.isFunction(this.selectStroke())) {
    anychart.core.reporting.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Series selectStroke']
    );
  } else {
    json['selectStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.selectStroke()));
  }

  if (goog.isFunction(this.hatchFill())) {
    anychart.core.reporting.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Series hatchFill']
    );
  } else {
    json['hatchFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.hatchFill()));
  }

  if (goog.isFunction(this.hoverHatchFill())) {
    anychart.core.reporting.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Series hoverHatchFill']
    );
  } else {
    json['hoverHatchFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/
        (this.hoverHatchFill()));
  }

  if (goog.isFunction(this.selectHatchFill())) {
    anychart.core.reporting.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Series selectHatchFill']
    );
  } else {
    json['selectHatchFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/
        (this.selectHatchFill()));
  }

  var data = this.data();
  if (data)
    json['treeData'] = data.serializeWithoutMeta();

  var drillPath = this.getDrilldownPath();
  var drillTo = [];
  var parentNode;
  for (var i = 1; i < drillPath.length; i++) {
    parentNode = drillPath[i - 1].getNode();
    drillTo[i - 1] = parentNode.indexOfChild(drillPath[i].getNode());
  }
  if (drillTo.length)
    json['drillTo'] = drillTo;

  json['colorRange'] = this.colorRange().serialize();

  anychart.core.settings.serialize(this, anychart.treemapModule.Chart.PROPERTY_DESCRIPTORS, json);
  anychart.core.settings.serialize(this, anychart.treemapModule.Chart.COLOR_DESCRIPTORS, json);

  json['labels'] = this.labels().serialize();
  json['hoverLabels'] = this.hoverLabels().getChangedSettings();
  json['selectLabels'] = this.selectLabels().getChangedSettings();
  if (goog.isNull(json['hoverLabels']['enabled'])) {
    delete json['hoverLabels']['enabled'];
  }
  if (goog.isNull(json['selectLabels']['enabled'])) {
    delete json['selectLabels']['enabled'];
  }

  json['headers'] = this.headers().serialize();
  json['hoverHeaders'] = this.hoverHeaders().serialize();

  json['markers'] = this.markers().serialize();
  json['hoverMarkers'] = this.hoverMarkers().serialize();
  json['selectMarkers'] = this.selectMarkers().serialize();

  return {'chart': json};
};


/** @inheritDoc */
anychart.treemapModule.Chart.prototype.disposeInternal = function() {
  goog.disposeAll(this.headers_, this.hoverHeaders_, this.labels_, this.hoverLabels_, this.selectLabels_, this.markers_, this.hoverMarkers_, this.selectMarkers_);
  this.headers_ = null;
  this.hoverHeaders_ = null;

  this.labels_ = null;
  this.hoverLabels_ = null;
  this.selectLabels_ = null;

  this.markers_ = null;
  this.hoverMarkers_ = null;
  this.selectMarkers_ = null;

  anychart.treemapModule.Chart.base(this, 'disposeInternal');
};


//exports
(function() {
  var proto = anychart.treemapModule.Chart.prototype;
  proto['getType'] = proto.getType;

  proto['data'] = proto.data;
  proto['selectionMode'] = proto.selectionMode;
  proto['hoverMode'] = proto.hoverMode;
  // auto generated
  // proto['maxDepth'] = proto.maxDepth;
  // proto['hintDepth'] = proto.hintDepth;
  // proto['hintOpacity'] = proto.hintOpacity;
  // proto['maxHeadersHeight'] = proto.maxHeadersHeight;
  // proto['sort'] = proto.sort;
  // proto['headersDisplayMode'] = proto.headersDisplayMode;
  // proto['labelsDisplayMode'] = proto.labelsDisplayMode;

  proto['headers'] = proto.headers;
  proto['hoverHeaders'] = proto.hoverHeaders;


  proto['labels'] = proto.labels;
  proto['hoverLabels'] = proto.hoverLabels;
  proto['selectLabels'] = proto.selectLabels;

  proto['markers'] = proto.markers;
  proto['hoverMarkers'] = proto.hoverMarkers;
  proto['selectMarkers'] = proto.selectMarkers;

  proto['colorScale'] = proto.colorScale;
  proto['colorRange'] = proto.colorRange;

  proto['fill'] = proto.fill;
  proto['hoverFill'] = proto.hoverFill;
  proto['selectFill'] = proto.selectFill;

  proto['stroke'] = proto.stroke;
  proto['hoverStroke'] = proto.hoverStroke;
  proto['selectStroke'] = proto.selectStroke;

  proto['hatchFill'] = proto.hatchFill;
  proto['hoverHatchFill'] = proto.hoverHatchFill;
  proto['selectHatchFill'] = proto.selectHatchFill;

  proto['drillTo'] = proto.drillTo;
  proto['drillUp'] = proto.drillUp;
  proto['getDrilldownPath'] = proto.getDrilldownPath;

  proto['toCsv'] = proto.toCsv;
})();
