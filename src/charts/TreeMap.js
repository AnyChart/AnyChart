goog.provide('anychart.charts.TreeMap');
goog.require('anychart.core.SeparateChart');
goog.require('anychart.core.TreeMapPoint');
goog.require('anychart.core.ui.ColorRange');
goog.require('anychart.core.ui.LabelsFactory');
goog.require('anychart.core.ui.MarkersFactory');
goog.require('anychart.core.utils.ArrayIterator');
goog.require('anychart.core.utils.IInteractiveSeries');
goog.require('anychart.core.utils.InteractivityState');
goog.require('anychart.core.utils.TreeMapPointContextProvider');
goog.require('anychart.core.utils.TypedLayer');
goog.require('anychart.data.Tree');
goog.require('anychart.utils');



/**
 * AnyChart TreeMap class.
 * @param {(anychart.data.Tree|Array.<Object>)=} opt_data - Data tree or raw data.
 * @param {anychart.enums.TreeFillingMethod=} opt_fillMethod - Fill method.
 * @extends {anychart.core.SeparateChart}
 * @implements {anychart.core.utils.IInteractiveSeries}
 * @constructor
 */
anychart.charts.TreeMap = function(opt_data, opt_fillMethod) {
  anychart.charts.TreeMap.base(this, 'constructor');

  // need for ColorRange
  this.referenceValueNames = ['x', 'value'];

  /**
   * @type {anychart.data.Tree.DataItem}
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
   * @type {Array.<anychart.data.Tree.DataItem>}
   * @private
   */
  this.linearNodes_ = [];

  /**
   * Array of nodes.
   * @type {Array.<anychart.data.Tree.DataItem>}
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
};
goog.inherits(anychart.charts.TreeMap, anychart.core.SeparateChart);


/**
 * Supported signals.
 * @type {number}
 */
anychart.charts.TreeMap.prototype.SUPPORTED_SIGNALS =
    anychart.core.SeparateChart.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.NEED_UPDATE_COLOR_RANGE;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.charts.TreeMap.prototype.SUPPORTED_CONSISTENCY_STATES =
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
anychart.charts.TreeMap.prototype.getType = function() {
  return anychart.enums.ChartTypes.TREE_MAP;
};


///  IInteractivitySeries INTERFACE IMPLEMENTATION ///
/**
 * Returns iterator.
 * @return {!anychart.core.utils.ArrayIterator}
 */
anychart.charts.TreeMap.prototype.getIterator = function() {
  return this.iterator_ || this.getResetIterator();
};


/**
 * Returns reset iterator.
 * @return {!anychart.core.utils.ArrayIterator}
 */
anychart.charts.TreeMap.prototype.getResetIterator = function() {
  return this.iterator_ = new anychart.core.utils.ArrayIterator(this.drawingNodes_);
};


/** @inheritDoc */
anychart.charts.TreeMap.prototype.isSeries = function() {
  return true;
};


/** @inheritDoc */
anychart.charts.TreeMap.prototype.isDiscreteBased = function() {
  return true;
};


/** @inheritDoc */
anychart.charts.TreeMap.prototype.applyAppearanceToPoint = function(pointState) {
  var node = /** @type {anychart.data.Tree.DataItem} */ (this.getIterator().getItem());
  var missing = node.meta(anychart.charts.TreeMap.DataFields.MISSING);
  if (missing)
    return;
  var type = node.meta(anychart.charts.TreeMap.DataFields.TYPE);

  if (type == anychart.charts.TreeMap.NodeType.HEADER) {
    this.drawLabel_(pointState);
    return;
  }

  // here type can only be RECT and LEAF. both has shape in meta.

  var shape = node.meta('shape');
  if (shape) {
    this.colorizeShape(pointState);
    this.applyHatchFill(pointState);
  }
  this.drawLabel_(pointState);
  this.drawMarker_(pointState);
};


/** @inheritDoc */
anychart.charts.TreeMap.prototype.applyAppearanceToSeries = goog.nullFunction;


/** @inheritDoc */
anychart.charts.TreeMap.prototype.finalizePointAppearance = goog.nullFunction;


/** @inheritDoc */
anychart.charts.TreeMap.prototype.hoverMode = function(opt_value) {
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
 * @return {anychart.charts.TreeMap|anychart.enums.SelectionMode|null} .
 */
anychart.charts.TreeMap.prototype.selectionMode = function(opt_value) {
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
anychart.charts.TreeMap.prototype.makeInteractive = function(element) {
  if (!element) return;
  var node = this.getIterator().getItem();
  element.tag = {
    series: this,
    index: node.meta('index'),
    node: node
  };
};


/** @inheritDoc */
anychart.charts.TreeMap.prototype.makeBrowserEvent = function(e) {
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
anychart.charts.TreeMap.prototype.makePointEvent = function(event) {
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
anychart.charts.TreeMap.prototype.getPoint = function(pointIndex) {
  if (pointIndex in this.linearNodes_)
    return new anychart.core.TreeMapPoint(this, this.linearNodes_[pointIndex]);
  else
    return null;
};


/** @inheritDoc */
anychart.charts.TreeMap.prototype.doAdditionActionsOnMouseOverAndMove = function(index, series) {
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
anychart.charts.TreeMap.prototype.doAdditionActionsOnMouseOut = function() {
  if (this.colorRange_ && this.colorRange_.enabled()) {
    this.colorRange_.hideMarker();
  }
};


/** @inheritDoc */
anychart.charts.TreeMap.prototype.checkIfColorRange = function(target) {
  return target instanceof anychart.core.ui.ColorRange;
};


/** @inheritDoc */
anychart.charts.TreeMap.prototype.handleMouseDown = function(event) {
  var legendOrColorRange = event['target'] instanceof anychart.core.ui.Legend || this.checkIfColorRange(event['target']);
  /*
    Because this method also handle legend item click and color range item click
    we should prevent this click behaviour to avoid drilldown
  */
  if (legendOrColorRange) return;
  var tag = anychart.utils.extractTag(event['domTarget']);

  var series, s, index;
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
    var drillChange;
    var iterator = this.getIterator();
    iterator.select(/** @type {number} */ (index));
    var node = /** @type {anychart.data.Tree.DataItem} */ (iterator.getItem());
    if (this.isRootNode(node)) {
      if (!this.isTreeRoot(node)) {
        var drillTo = node.getParent();
        drillChange = {
          'type': anychart.enums.EventType.DRILL_CHANGE,
          'path': this.createCrumbsTo(drillTo)
        };
        this.unselect();
        if (this.prevSelectSeriesStatus) {
          this.dispatchEvent(this.makeInteractivityPointEvent('selected', event, this.prevSelectSeriesStatus, true));
          this.prevSelectSeriesStatus = null;
        }
        if (this.dispatchEvent(drillChange))
          this.setRootNode(drillTo);
      }
    } else if (node.numChildren()) {
      drillChange = {
        'type': anychart.enums.EventType.DRILL_CHANGE,
        'path': this.createCrumbsTo(node)
      };
      this.unselect();
      if (this.prevSelectSeriesStatus) {
        this.dispatchEvent(this.makeInteractivityPointEvent('selected', event, this.prevSelectSeriesStatus, true));
        this.prevSelectSeriesStatus = null;
      }
      if (this.dispatchEvent(drillChange))
        this.setRootNode(node);
    } else {
      anychart.charts.TreeMap.base(this, 'handleMouseDown', event);
    }
  }
};


/**
 * Creates crumbs to node from tree root.
 * @param {anychart.data.Tree.DataItem} node Node.
 * @return {Array} Array of crumbs.
 */
anychart.charts.TreeMap.prototype.createCrumbsTo = function(node) {
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
anychart.charts.TreeMap.prototype.getCurrentPath = function() {
  this.ensureDataPrepared();
  if (!this.rootNode_)
    return null;
  return this.createCrumbsTo(this.rootNode_);
};


/**
 * Selects a point of the series by its index.
 * @param {number|Array<number>} indexOrIndexes Index of the point to select.
 * @param {anychart.core.MouseEvent=} opt_event Event that initiate point selecting.
 * @return {!anychart.charts.TreeMap} {@link anychart.charts.TreeMap} instance for method chaining.
 */
anychart.charts.TreeMap.prototype.selectPoint = function(indexOrIndexes, opt_event) {
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
anychart.charts.TreeMap.prototype.unselect = function(opt_indexOrIndexes) {
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
 * @return {!anychart.charts.TreeMap}  {@link anychart.charts.TreeMap} instance for method chaining.
 */
anychart.charts.TreeMap.prototype.hoverPoint = function(index) {
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
anychart.charts.TreeMap.prototype.unhover = function(opt_indexOrIndexes) {
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
anychart.charts.TreeMap.prototype.useUnionTooltipAsSingle = function() {
  return true;
};


/**
 * Shows depth of drawing.
 * @param {number=} opt_value Max depth to draw.
 * @return {number|anychart.charts.TreeMap} Max depth value or self for chaining.
 */
anychart.charts.TreeMap.prototype.maxDepth = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.normalizeToNaturalNumber(opt_value, 1, false);
    if (opt_value != this.maxDepth_) {
      this.maxDepth_ = opt_value;
      this.invalidate(anychart.ConsistencyState.CHART_LEGEND | anychart.ConsistencyState.TREEMAP_NODE_TYPES | anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_COLOR_RANGE);
    }
    return this;
  }
  return this.maxDepth_;
};


/**
 * Show additional segmentation of treemap points.
 * @param {number=} opt_value Additional depth of visibility.
 * @return {number|anychart.charts.TreeMap} Hint depth value or self for chaining.
 */
anychart.charts.TreeMap.prototype.hintDepth = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.normalizeToNaturalNumber(opt_value, 0, false);
    if (opt_value != this.hintDepth_) {
      this.hintDepth_ = opt_value;
      this.invalidate(anychart.ConsistencyState.TREEMAP_NODE_TYPES | anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.hintDepth_;
};


/**
 * How transparent should be nodes below node that drawn when hintDepth greater than 0.
 * @param {number=} opt_value Opacity value.
 * @return {number|anychart.charts.TreeMap} Hint opacity or self for chaining.
 */
anychart.charts.TreeMap.prototype.hintOpacity = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.toNumber(opt_value);
    opt_value = isNaN(opt_value) ? 1 : opt_value;
    if (opt_value != this.hintOpacity_) {
      this.hintOpacity_ = opt_value;
      if (this.hintDepth_ > 0)
        this.invalidate(anychart.ConsistencyState.TREEMAP_HINT_OPACITY, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.hintOpacity_;
};


/**
 * Getter/setter for max headers height.
 * @param {(number|string)=} opt_value Max headers height value.
 * @return {number|string|anychart.charts.TreeMap} Max headers height or self for chaining.
 */
anychart.charts.TreeMap.prototype.maxHeadersHeight = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (opt_value != this.maxHeadersHeight_) {
      this.maxHeadersHeight_ = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.maxHeadersHeight_;
};


/**
 * Getter/setter for sort type.
 * @param {(anychart.enums.Sort|string)=} opt_value Sort type.
 * @return {anychart.enums.Sort|anychart.charts.TreeMap}
 */
anychart.charts.TreeMap.prototype.sort = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeSort(opt_value, anychart.enums.Sort.DESC);
    if (opt_value != this.sort_) {
      this.sort_ = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.sort_;
};


/**
 * Desc sort function.
 * @param {anychart.data.Tree.DataItem} node1 First node.
 * @param {anychart.data.Tree.DataItem} node2 Second node.
 * @return {number}
 */
anychart.charts.TreeMap.SORT_DESC = function(node1, node2) {
  var size1 = /** @type {number} */(node1.meta(anychart.charts.TreeMap.DataFields.SIZE));
  var size2 = /** @type {number} */(node2.meta(anychart.charts.TreeMap.DataFields.SIZE));
  return size2 - size1;
};


/**
 * Asc sort function.
 * @param {anychart.data.Tree.DataItem} node1 First node.
 * @param {anychart.data.Tree.DataItem} node2 Second node.
 * @return {number}
 */
anychart.charts.TreeMap.SORT_ASC = function(node1, node2) {
  return -anychart.charts.TreeMap.SORT_DESC(node1, node2);
};


/**
 * Resets data variables.
 */
anychart.charts.TreeMap.prototype.resetDataVars = function() {
  this.linearIndex_ = 0;
  this.linearNodes_ = [];
  this.drawingNodes_ = [];
  this.nodeValues_ = [];
  this.hintNodeValues_ = [];
  this.rootNode_ = null;
};


/**
 * Getter/setter for data.
 * @param {(anychart.data.Tree|Array.<Object>)=} opt_value - Data tree or raw data.
 * @param {anychart.enums.TreeFillingMethod=} opt_fillMethod - Fill method.
 * @return {*}
 */
anychart.charts.TreeMap.prototype.data = function(opt_value, opt_fillMethod) {
  if (goog.isDef(opt_value)) {
    if (opt_value instanceof anychart.data.Tree) {
      if (opt_value != this.data_)
        this.data_ = opt_value;
    } else {
      this.data_ = new anychart.data.Tree(opt_value, opt_fillMethod);
    }
    this.invalidate(anychart.ConsistencyState.TREEMAP_DATA, anychart.Signal.NEEDS_REDRAW);
    return this;
  }
  return this.data_;
};


/**
 * Drills down to target.
 * @param {anychart.data.Tree.DataItem} target Target to drill down to.
 */
anychart.charts.TreeMap.prototype.drillTo = function(target) {
  this.ensureDataPrepared();
  this.setRootNode(target);
};


/**
 * Drills one level up from current root node.
 */
anychart.charts.TreeMap.prototype.drillUp = function() {
  this.ensureDataPrepared();
  if (!this.rootNode_ || this.isTreeRoot(this.rootNode_)) return;
  this.setRootNode(this.rootNode_.getParent());
};


/** @inheritDoc */
anychart.charts.TreeMap.prototype.legendItemCanInteractInMode = function(mode) {
  return (mode == anychart.enums.LegendItemsSourceMode.CATEGORIES);
};


/** @inheritDoc */
anychart.charts.TreeMap.prototype.legendItemOver = function(item, event) {
  var meta = /** @type {Object} */(item.meta());
  var series;

  var sourceMode = this.legend().itemsSourceMode();
  if (sourceMode == anychart.enums.LegendItemsSourceMode.CATEGORIES) {
    series = /** @type {anychart.core.map.series.Base} */(meta.series);
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
anychart.charts.TreeMap.prototype.legendItemOut = function(item, event) {
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
anychart.charts.TreeMap.prototype.createLegendItemsProvider = function(sourceMode, itemsTextFormatter) {
  var i, count;
  /**
   * @type {!Array.<anychart.core.ui.Legend.LegendItemProvider>}
   */
  var data = [];
  this.calculate();
  if (sourceMode == anychart.enums.LegendItemsSourceMode.CATEGORIES) {
    var scale = this.colorScale();
    if (scale && scale instanceof anychart.scales.OrdinalColor) {
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
anychart.charts.TreeMap.prototype.getAllSeries = function() {
  return [this];
};


/**
 * Dummy. Because of ColorRange.
 * @return {anychart.charts.TreeMap} Returns self.
 */
anychart.charts.TreeMap.prototype.getChart = function() {
  return this;
};


/** @inheritDoc */
anychart.charts.TreeMap.prototype.getSeriesStatus = function(event) {
  return [];
};


/**
 * TreeMap data item fields.
 * @enum {string}
 */
anychart.charts.TreeMap.DataFields = {
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
anychart.charts.TreeMap.NodeType = {
  LEAF: 0,
  HEADER: 1,
  RECT: 2,
  TRANSIENT: 3,
  HINT_LEAF: 4
};


/**
 * Checks value for missing.
 * Point is missing when it's undefined or its number value less or equal to zero.
 * @param {*} value Value to check.
 * @return {boolean} Whether value is missing.
 */
anychart.charts.TreeMap.prototype.isMissing = function(value) {
  value = anychart.utils.toNumber(value);
  return isNaN(value) || value <= 0;
};


/**
 * Recursively calculates node values from leafs (node without children) up to root.
 * If leaf has no value - than set it to 0.
 * @param {anychart.data.Tree.DataItem} node Node which value will be calculated.
 * @param {number} depth Current depth.
 * @return {Array.<number, number>} Array of values of the node - value and size.
 */
anychart.charts.TreeMap.prototype.calculateNodeSize = function(node, depth) {
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
      ret = this.calculateNodeSize(/** @type {anychart.data.Tree.DataItem} */ (node.getChildAt(i)), depth + 1);
      valueSum += ret[0];
      sizeSum += ret[1];
    }
    value = valueSum;
    size = sizeSum;
    if (this.isMissing(value)) {
      node.meta(anychart.charts.TreeMap.DataFields.MISSING, true);
    }
  } else {
    value = node.get(anychart.charts.TreeMap.DataFields.VALUE);
    size = node.get(anychart.charts.TreeMap.DataFields.SIZE);

    if (this.isMissing(value)) {
      node.meta(anychart.charts.TreeMap.DataFields.MISSING, true);
      size = value = 0;
    } else {
      value = anychart.utils.normalizeToNaturalNumber(value, 0, true);
      size = anychart.utils.normalizeToNaturalNumber(size, 0, true) || value;
      if (size == 0)
        node.meta(anychart.charts.TreeMap.DataFields.MISSING, true);
    }
  }
  node.meta(anychart.charts.TreeMap.DataFields.SIZE, size);
  node.meta(anychart.charts.TreeMap.DataFields.VALUE, value);
  return [value, size];
};


/**
 * Calculates bounds of points.
 * @param {Array.<anychart.data.Tree.DataItem>} nodes Points to calculate.
 * @param {anychart.math.Rect} bounds Content bounds.
 */
anychart.charts.TreeMap.prototype.calculatePointsBounds = function(nodes, bounds) {
  if (this.sort_ != anychart.enums.Sort.NONE) {
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
    return acc + node.meta(anychart.charts.TreeMap.DataFields.SIZE);
  }, 0);

  var len = points.length;

  var scale = (width * height) / size;
  for (var i = 0; i < len; i++) {
    if (!points[i])
      points[i] = {};
    points[i].valueScale = anychart.math.round((/** @type {number} */ (nodes[i].meta(anychart.charts.TreeMap.DataFields.SIZE))) * scale, 4);
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
    nodes[i].meta(anychart.charts.TreeMap.DataFields.POINT_BOUNDS, pointBounds);
  }
};


/**
 * Gets aspect.
 * @param {Array.<anychart.data.Tree.DataItem>} points .
 * @param {number} dWidth .
 * @param {number} dHeight .
 * @param {number} start .
 * @param {number} end .
 * @param {boolean} vert .
 * @return {number} .
 */
anychart.charts.TreeMap.prototype.getAspect = function(points, dWidth, dHeight, start, end, vert) {
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
 * @param {anychart.data.Tree.DataItem} node Node to check.
 * @return {boolean} Is node root.
 */
anychart.charts.TreeMap.prototype.isTreeRoot = function(node) {
  return node == node.tree().getChildAt(0);
};


/**
 * Checks whether node is root in context of treemap drawing.
 * @param {anychart.data.Tree.DataItem} node Node to check.
 * @return {boolean} Is node root.
 */
anychart.charts.TreeMap.prototype.isRootNode = function(node) {
  return node == this.rootNode_;
};


/**
 * Sets root node.
 * @param {anychart.data.Tree.DataItem} node New tree map root.
 */
anychart.charts.TreeMap.prototype.setRootNode = function(node) {
  this.rootNode_ = node;
  this.invalidate(anychart.ConsistencyState.CHART_LEGEND | anychart.ConsistencyState.TREEMAP_NODE_TYPES | anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEED_UPDATE_COLOR_RANGE | anychart.Signal.NEEDS_REDRAW);
};


/**
 * Returns root node.
 * @return {anychart.data.Tree.DataItem} Current root node.
 */
anychart.charts.TreeMap.prototype.getRootNode = function() {
  return this.rootNode_;
};


/**
 * Header labels display mode.
 * @param {(string|anychart.enums.LabelsDisplayMode)=} opt_value Mode to set.
 * @return {string|anychart.enums.LabelsDisplayMode|anychart.charts.TreeMap}
 */
anychart.charts.TreeMap.prototype.headersDisplayMode = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeLabelsDisplayMode(opt_value);
    if (this.headersDisplayMode_ != opt_value) {
      this.headersDisplayMode_ = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.headersDisplayMode_;
};


/**
 * Getter/setter for point header labels.
 * @param {(Object|boolean|null)=} opt_value Point headers settings.
 * @return {!(anychart.core.ui.LabelsFactory|anychart.charts.TreeMap)} Labels instance or self for chaining.
 */
anychart.charts.TreeMap.prototype.headers = function(opt_value) {
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
anychart.charts.TreeMap.prototype.headersInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Getter/setter for point hover header labels.
 * @param {(Object|boolean|null)=} opt_value Point hover headers settings.
 * @return {!(anychart.core.ui.LabelsFactory|anychart.charts.TreeMap)} Labels instance or self for chaining.
 */
anychart.charts.TreeMap.prototype.hoverHeaders = function(opt_value) {
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
 * Content labels display mode.
 * @param {(string|anychart.enums.LabelsDisplayMode)=} opt_value Mode to set.
 * @return {string|anychart.enums.LabelsDisplayMode|anychart.charts.TreeMap} Labels display mode or self for chaining.
 */
anychart.charts.TreeMap.prototype.labelsDisplayMode = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeLabelsDisplayMode(opt_value);
    if (this.labelsDisplayMode_ != opt_value) {
      this.labelsDisplayMode_ = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.labelsDisplayMode_;
};


/**
 * Getter/setter for point labels.
 * @param {(Object|boolean|null)=} opt_value Point labels settings.
 * @return {!(anychart.core.ui.LabelsFactory|anychart.charts.TreeMap)} Labels instance or self for chaining.
 */
anychart.charts.TreeMap.prototype.labels = function(opt_value) {
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
anychart.charts.TreeMap.prototype.labelsInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Getter/setter for point hover labels.
 * @param {(Object|boolean|null)=} opt_value Point hover labels settings.
 * @return {!(anychart.core.ui.LabelsFactory|anychart.charts.TreeMap)} Labels instance or self for chaining.
 */
anychart.charts.TreeMap.prototype.hoverLabels = function(opt_value) {
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
 * @return {!(anychart.core.ui.LabelsFactory|anychart.charts.TreeMap)} Labels instance or self for chaining.
 */
anychart.charts.TreeMap.prototype.selectLabels = function(opt_value) {
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
 * @return {!(anychart.core.ui.MarkersFactory|anychart.charts.TreeMap)} Markers instance or self for chaining.
 */
anychart.charts.TreeMap.prototype.markers = function(opt_value) {
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
anychart.charts.TreeMap.prototype.markersInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Getter/setter for point markers.
 * @param {(Object|boolean|null|string)=} opt_value Point hover markers settings.
 * @return {!(anychart.core.ui.MarkersFactory|anychart.charts.TreeMap)} Markers instance or self for chaining.
 */
anychart.charts.TreeMap.prototype.hoverMarkers = function(opt_value) {
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
 * @return {!(anychart.core.ui.MarkersFactory|anychart.charts.TreeMap)} Markers instance or self for chaining.
 */
anychart.charts.TreeMap.prototype.selectMarkers = function(opt_value) {
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
 * @param {(anychart.scales.OrdinalColor|anychart.scales.LinearColor)=} opt_value
 * @return {anychart.charts.TreeMap|anychart.scales.OrdinalColor|anychart.scales.LinearColor}
 */
anychart.charts.TreeMap.prototype.colorScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.colorScale_ != opt_value) {
      if (this.colorScale_)
        this.colorScale_.unlistenSignals(this.colorScaleInvalidated_, this);
      this.colorScale_ = opt_value;
      if (this.colorScale_)
        this.colorScale_.listenSignals(this.colorScaleInvalidated_, this);

      goog.dispose(this.hintColorScale_);
      if (this.colorScale_)
        this.hintColorScale_ = /** @type {anychart.scales.OrdinalColor|anychart.scales.LinearColor} */ (anychart.scales.Base.fromString(this.colorScale_.getType(), null));
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
anychart.charts.TreeMap.prototype.colorScaleInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.TREEMAP_COLOR_SCALE | anychart.ConsistencyState.CHART_LEGEND,
        anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Getter/setter for color range.
 * @param {Object=} opt_value Color range settings to set.
 * @return {!(anychart.core.ui.ColorRange|anychart.charts.TreeMap)} Return current chart markers palette or itself for chaining call.
 */
anychart.charts.TreeMap.prototype.colorRange = function(opt_value) {
  if (!this.colorRange_) {
    this.colorRange_ = new anychart.core.ui.ColorRange();
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
anychart.charts.TreeMap.prototype.colorRangeInvalidated_ = function(event) {
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
  // if there are no signals, state == 0 and nothing happens.
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
 * @return {acgraph.vector.Fill|anychart.charts.TreeMap|Function} .
 */
anychart.charts.TreeMap.prototype.fill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
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
 * @return {acgraph.vector.Fill|anychart.charts.TreeMap|Function} .
 */
anychart.charts.TreeMap.prototype.hoverFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
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
 * @return {acgraph.vector.Fill|anychart.charts.TreeMap|Function} .
 */
anychart.charts.TreeMap.prototype.selectFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
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
 * @return {anychart.charts.TreeMap|acgraph.vector.Stroke|Function} .
 */
anychart.charts.TreeMap.prototype.stroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
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
 * @return {anychart.charts.TreeMap|acgraph.vector.Stroke|Function} .
 */
anychart.charts.TreeMap.prototype.hoverStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
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
 * @return {anychart.charts.TreeMap|acgraph.vector.Stroke|Function} .
 */
anychart.charts.TreeMap.prototype.selectStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
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
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|anychart.charts.TreeMap|Function|boolean} Hatch fill.
 */
anychart.charts.TreeMap.prototype.hatchFill = function(opt_patternFillOrTypeOrState, opt_color, opt_thickness, opt_size) {
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
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|anychart.charts.TreeMap|Function|boolean} Hatch fill.
 */
anychart.charts.TreeMap.prototype.hoverHatchFill = function(opt_patternFillOrTypeOrState, opt_color, opt_thickness, opt_size) {
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
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|anychart.charts.TreeMap|Function|boolean} Hatch fill.
 */
anychart.charts.TreeMap.prototype.selectHatchFill = function(opt_patternFillOrTypeOrState, opt_color, opt_thickness, opt_size) {
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
 * @param {anychart.data.Tree.DataItem} node Data node.
 * @param {number} depth Depth.
 * @return {anychart.charts.TreeMap.NodeType}
 * @private
 */
anychart.charts.TreeMap.prototype.getNodeType_ = function(node, depth) {
  var numChildren = node.numChildren();
  /** @type {!anychart.charts.TreeMap.NodeType} */
  var type;
  var sumDepth = this.maxDepth_ + this.hintDepth_;
  if (numChildren) {
    if (depth < this.maxDepth_)
      type = anychart.charts.TreeMap.NodeType.HEADER;
    else if (depth == this.maxDepth_) {
      if (this.hintDepth_ == 0)
        type = anychart.charts.TreeMap.NodeType.LEAF;
      else
        type = anychart.charts.TreeMap.NodeType.RECT;
    } else if (depth > this.maxDepth_) {
      if (depth == sumDepth)
        type = anychart.charts.TreeMap.NodeType.HINT_LEAF;
      else
        type = anychart.charts.TreeMap.NodeType.TRANSIENT;
    }
  } else {
    if (depth <= this.maxDepth_)
      type = anychart.charts.TreeMap.NodeType.LEAF;
    else
      type = anychart.charts.TreeMap.NodeType.HINT_LEAF;
  }
  node.meta(anychart.charts.TreeMap.DataFields.TYPE, type);
  return type;
};


/**
 * Calculates bounds for content area (for node children).
 * @param {anychart.math.Rect} bounds Bounds with header.
 * @param {anychart.math.Rect} headerBounds Bounds of header.
 * @return {!anychart.math.Rect} Bounds for content.
 * @private
 */
anychart.charts.TreeMap.prototype.getBoundsForContent_ = function(bounds, headerBounds) {
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
 * @return {anychart.core.utils.TreeMapPointContextProvider} Provider.
 */
anychart.charts.TreeMap.prototype.createFormatProvider = function(opt_force) {
  if (!this.pointProvider_ || opt_force)
    this.pointProvider_ = new anychart.core.utils.TreeMapPointContextProvider(this);
  this.pointProvider_.applyReferenceValues();
  return this.pointProvider_;
};


/**
 * Creates tooltip format provider.
 * @return {Object}
 */
anychart.charts.TreeMap.prototype.createTooltipContextProvider = function() {
  return this.createFormatProvider();
};


/**
 * Creates position provider for point.
 * @param {anychart.math.Rect} bounds Point bounds.
 * @param {anychart.enums.Anchor} anchor Label anchor.
 * @return {*} Position provider.
 */
anychart.charts.TreeMap.prototype.createPositionProvider = function(bounds, anchor) {
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
anychart.charts.TreeMap.prototype.getLabelsAnchor = function(pointState, isHeader) {
  var node = /** @type {anychart.data.Tree.DataItem} */ (this.getIterator().getItem());
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

  var pointLabel = node.get(labelType);
  var hoverPointLabel = hovered ? node.get(hoverLabelType) : null;
  var selectPointLabel = selected ? node.get(selectLabelType) : null;

  var labelAnchor = pointLabel && pointLabel['anchor'] ? pointLabel['anchor'] : null;
  var labelHoverAnchor = hoverPointLabel && hoverPointLabel['anchor'] ? hoverPointLabel['anchor'] : null;
  var labelSelectAnchor = selectPointLabel && selectPointLabel['anchor'] ? selectPointLabel['anchor'] : null;

  return hovered || selected ?
      hovered ?
          labelHoverAnchor ?
              labelHoverAnchor :
              hoverFactory.anchor() ?
                  hoverFactory.anchor() :
                  labelAnchor ?
                      labelAnchor :
                      factory.anchor() :
          labelSelectAnchor ?
              labelSelectAnchor :
              selectFactory.anchor() ?
                  selectFactory.anchor() :
                  labelAnchor ?
                      labelAnchor :
                      factory.anchor() :
      labelAnchor ?
          labelAnchor :
          factory.anchor();
};


/**
 *
 * @param {anychart.math.Rect} bounds Point bounds.
 * @param {string} position Position.
 * @return {*} Position provider.
 */
anychart.charts.TreeMap.prototype.createMarkerPositionProvider = function(bounds, position) {
  position = anychart.enums.normalizeAnchor(position);
  return {'value': anychart.utils.getCoordinateByAnchor(bounds, position)};
};


/**
 * Gets marker position.
 * @param {anychart.PointState|number} pointState If it is a hovered oe selected marker drawing.
 * @return {string} Position settings.
 */
anychart.charts.TreeMap.prototype.getMarkersPosition = function(pointState) {
  var node = /** @type {anychart.data.Tree.DataItem} */ (this.getIterator().getItem());

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
anychart.charts.TreeMap.prototype.drawMarker_ = function(pointState) {
  var node = /** @type {anychart.data.Tree.DataItem} */ (this.getIterator().getItem());
  var bounds = /** @type {anychart.math.Rect} */ (node.meta(anychart.charts.TreeMap.DataFields.POINT_BOUNDS));
  var type = node.meta(anychart.charts.TreeMap.DataFields.TYPE);
  if (type != anychart.charts.TreeMap.NodeType.LEAF && type != anychart.charts.TreeMap.NodeType.RECT)
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
anychart.charts.TreeMap.EMPTY_TEXT_FORMATTER = function() {
  return '';
};


/**
 * Whether we do not need to draw header.
 * @param {*} setting Point setting.
 * @param {*} factory Labels factory.
 * @return {boolean}
 * @private
 */
anychart.charts.TreeMap.prototype.noHeader_ = function(setting, factory) {
  return /** @type {boolean} */ (!(setting && goog.isDefAndNotNull(setting['enabled'])) && (goog.isNull(setting) || (setting && goog.isDef(setting['enabled']) && setting['enabled'] === null) || factory.enabled() === null));
};


/**
 * Configures label.
 * @param {anychart.PointState|number} pointState Point state.
 * @param {boolean} isHeader Whether it header label or not.
 * @return {anychart.core.ui.LabelsFactory.Label} Label.
 */
anychart.charts.TreeMap.prototype.configureLabel = function(pointState, isHeader) {
  var node = /** @type {anychart.data.Tree.DataItem} */ (this.getIterator().getItem());
  var bounds = /** @type {anychart.math.Rect} */ (node.meta(anychart.charts.TreeMap.DataFields.POINT_BOUNDS));
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

  var labelsFactory;
  if (selected) {
    labelsFactory = /** @type {anychart.core.ui.LabelsFactory} */(selectFactory);
  } else if (hovered) {
    labelsFactory = /** @type {anychart.core.ui.LabelsFactory} */(hoverFactory);
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
    var positionProvider = this.createPositionProvider(bounds, anchor);
    var formatProvider = this.createFormatProvider();
    if (label) {
      factory.dropCallsCache(index);
      label.formatProvider(formatProvider);
      label.positionProvider(positionProvider);
    } else {
      label = factory.add(formatProvider, positionProvider, index);
    }

    label.resetSettings();
    label.currentLabelsFactory(/** @type {anychart.core.ui.LabelsFactory} */ (labelsFactory));
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
anychart.charts.TreeMap.prototype.drawLabel_ = function(pointState) {
  var node = /** @type {anychart.data.Tree.DataItem} */ (this.getIterator().getItem());
  var bounds = /** @type {anychart.math.Rect} */ (node.meta(anychart.charts.TreeMap.DataFields.POINT_BOUNDS));
  var index = /** @type {number} */ (node.meta('index'));
  var type = node.meta(anychart.charts.TreeMap.DataFields.TYPE);
  var isHeader;

  if (type == anychart.charts.TreeMap.NodeType.LEAF || type == anychart.charts.TreeMap.NodeType.RECT) {
    isHeader = false;
  } else if (type == anychart.charts.TreeMap.NodeType.HEADER) {
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

  var adjustFontSize = labelsFactory.adjustFontSize();
  var needAdjustFontSize = (adjustFontSize['width'] || adjustFontSize['height']) && labelsFactory.enabled();

  var displayMode = isHeader ? this.headersDisplayMode() : this.labelsDisplayMode();

  var thickness;
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
    if (needAdjustFontSize) {
      factory.setAdjustFontSize(/** @type {number} */(fontSize));
    } else {
      factory.setAdjustFontSize(null);
    }

    mergedSettings['width'] = null;
    mergedSettings['height'] = null;
    if (mergedSettings['adjustByWidth'] || mergedSettings['adjustByHeight'])
      mergedSettings['fontSize'] = label.parentLabelsFactory().adjustFontSizeValue;
    var measuredBounds = factory.measure(label.formatProvider(), label.positionProvider(), mergedSettings);
    //measuredBounds = mergedSettings['padding'].widenBounds(measuredBounds);

    var outOfCellBounds = !(bounds.left <= measuredBounds.left &&
            bounds.getRight() >= measuredBounds.getRight() &&
            bounds.top <= measuredBounds.top &&
            bounds.getBottom() >= measuredBounds.getBottom());

    var dropText = false;
    var textFormatter;
    if (outOfCellBounds) {
      if (displayMode == anychart.enums.LabelsDisplayMode.DROP) {
        if (isHeader) {
          dropText = true;
          textFormatter = labelsFactory.getTextFormatterInternal();
          labelsFactory.textFormatter(anychart.charts.TreeMap.EMPTY_TEXT_FORMATTER);
          label.width(bounds.width).height(bounds.height);
        } else
          factory.clear(index);
      } else {
        if (label.width() != measuredBounds.width || label.height() != measuredBounds.height) {
          label.dropMergedSettings();
          label.width(bounds.width).height(bounds.height);
        }
      }
    } else
      label.width(bounds.width).height(bounds.height);

    if (displayMode != anychart.enums.LabelsDisplayMode.ALWAYS_SHOW) {
      label.clip(bounds);
    } else {
      label.clip(null);
    }

    if (isHeader) {
      var emptyText = false;
      if (goog.isDef(label.enabled()) && !hovered) {
        emptyText = !label.enabled();
      } else {
        emptyText = !labelsFactory.enabled();
      }
      if (emptyText) {
        textFormatter = labelsFactory.getTextFormatterInternal();
        labelsFactory.textFormatter(anychart.charts.TreeMap.EMPTY_TEXT_FORMATTER);
        label.enabled(true);
      }
    }

    label.draw();
    if (dropText || emptyText) {
      labelsFactory.setTextFormatterInternal(/** @type {?Function} */ (textFormatter));
    }
  }
};


/**
 * Draws node.
 * @param {anychart.PointState|number} pointState Point state.
 * @private
 */
anychart.charts.TreeMap.prototype.drawNodeBox_ = function(pointState) {
  var node = /** @type {anychart.data.Tree.DataItem} */ (this.getIterator().getItem());
  var bounds = /** @type {anychart.math.Rect} */ (node.meta(anychart.charts.TreeMap.DataFields.POINT_BOUNDS));
  var type = node.meta(anychart.charts.TreeMap.DataFields.TYPE);

  var box = /** @type {!acgraph.vector.Rect} */(this.dataLayer_.genNextChild());
  node.meta(anychart.charts.TreeMap.DataFields.SHAPE, box);
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
    node.meta(anychart.charts.TreeMap.DataFields.HATCH_SHAPE, hatchBox);
    this.applyHatchFill(pointState);
  }

  if (type != anychart.charts.TreeMap.NodeType.HINT_LEAF) {
    // type = RECT, LEAF
    this.makeInteractive(box);
  }
};


/**
 * Colorize shape.
 * @param {anychart.PointState|number} pointState Point state.
 */
anychart.charts.TreeMap.prototype.colorizeShape = function(pointState) {
  var node = /** @type {anychart.data.Tree.DataItem} */ (this.getIterator().getItem());
  var shape = node.meta(anychart.charts.TreeMap.DataFields.SHAPE);

  if (shape) {
    var type = node.meta(anychart.charts.TreeMap.DataFields.TYPE);
    var value = node.meta(anychart.charts.TreeMap.DataFields.VALUE);
    var fill = this.getFinalFill(true, pointState);
    if (type == anychart.charts.TreeMap.NodeType.RECT) {
      fill = anychart.color.setOpacity(fill, this.hintOpacity_, true);
    } else if (type == anychart.charts.TreeMap.NodeType.HINT_LEAF)
      fill = this.hintColorScale_ ? this.hintColorScale_.valueToColor(value) : fill;
    shape.stroke(this.getFinalStroke(true, pointState));
    shape.fill(fill);
  }
};


/**
 * Apply hatch fill.
 * @param {anychart.PointState|number} pointState Point state.
 */
anychart.charts.TreeMap.prototype.applyHatchFill = function(pointState) {
  var node = /** @type {anychart.data.Tree.DataItem} */ (this.getIterator().getItem());
  var hatchFillShape = node.meta(anychart.charts.TreeMap.DataFields.HATCH_SHAPE);
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
anychart.charts.TreeMap.prototype.getFinalFill = function(usePointSettings, pointState) {
  var node = /** @type {anychart.data.Tree.DataItem} */ (this.getIterator().getItem());
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
anychart.charts.TreeMap.prototype.getFinalStroke = function(usePointSettings, pointState) {
  var node = /** @type {anychart.data.Tree.DataItem} */ (this.getIterator().getItem());
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
anychart.charts.TreeMap.prototype.getFinalHatchFill = function(usePointSettings, pointState) {
  var node = /** @type {anychart.data.Tree.DataItem} */ (this.getIterator().getItem());
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
 * @param {anychart.data.Tree.DataItem} node .
 * @param {acgraph.vector.Fill|acgraph.vector.Stroke|Function} color Normal state color.
 * @param {...(acgraph.vector.Fill|acgraph.vector.Stroke|Function)} var_args .
 * @return {!(acgraph.vector.Fill|acgraph.vector.Stroke)} Normalized color.
 * @protected
 */
anychart.charts.TreeMap.prototype.normalizeColor = function(node, color, var_args) {
  var fill;
  var sourceColor;
  if (goog.isFunction(color)) {
    if (arguments.length > 2) {
      var args = [node];
      for (var i = 2; i < arguments.length; i++)
        args.push(arguments[i]);
      sourceColor = this.normalizeColor.apply(this, args);
    } else {
      var theme = anychart.getFullTheme();
      sourceColor = theme['palette']['items'][0];
    }
    var scope = {
      'value': node.meta(anychart.charts.TreeMap.DataFields.VALUE),
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
anychart.charts.TreeMap.prototype.normalizeHatchFill = function(hatchFill) {
  var fill;
  var index = this.getIterator().getIndex();
  var autoHatch;
  if (goog.isFunction(hatchFill)) {
    autoHatch = anychart.getFullTheme()['hatchFillPalette']['items'][0];
    var sourceHatchFill = acgraph.vector.normalizeHatchFill(autoHatch);
    var scope = {
      'index': index,
      'sourceHatchFill': sourceHatchFill
    };
    fill = acgraph.vector.normalizeHatchFill(hatchFill.call(scope));
  } else if (goog.isBoolean(hatchFill)) {
    autoHatch = anychart.getFullTheme()['hatchFillPalette']['items'][0];
    fill = hatchFill ? acgraph.vector.normalizeHatchFill(autoHatch) : null;
  } else
    fill = acgraph.vector.normalizeHatchFill(hatchFill);
  return fill;
};


/**
 * Calculates bounds of header
 * @param {anychart.data.Tree.DataItem} node Node that represents header.
 * @param {anychart.math.Rect} bounds Full bounds.
 * @return {anychart.math.Rect} Point header bounds.
 * @private
 */
anychart.charts.TreeMap.prototype.calculateHeaderBounds_ = function(node, bounds) {
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
  var maxHeadersHeight = anychart.utils.normalizeSize(/** @type {number|string} */(this.maxHeadersHeight_), bounds.height);
  var rect = this.headers().measure(formatProvider, undefined, header);
  if (rect.height > maxHeadersHeight)
    rect.height = maxHeadersHeight;
  return anychart.math.rect(bounds.left, bounds.top, bounds.width, rect.height);
};


/**
 * Recursively draws node into specified bounds.
 * @param {anychart.data.Tree.DataItem} node Node to draw.
 * @param {anychart.math.Rect} bounds Bounds to draw to.
 * @param {number} depth Current depth.
 * @private
 */
anychart.charts.TreeMap.prototype.drawNode_ = function(node, bounds, depth) {
  if (node.meta(anychart.charts.TreeMap.DataFields.MISSING))
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

  var type = node.meta(anychart.charts.TreeMap.DataFields.TYPE);

  if (type == anychart.charts.TreeMap.NodeType.LEAF || type == anychart.charts.TreeMap.NodeType.HINT_LEAF) {
    pointBounds = bounds.clone();
    node.meta(anychart.charts.TreeMap.DataFields.POINT_BOUNDS, pointBounds);
  } else {
    if (type == anychart.charts.TreeMap.NodeType.HEADER) {
      pointBounds = this.calculateHeaderBounds_(node, bounds);
      contentBounds = this.getBoundsForContent_(bounds, pointBounds);
      node.meta(anychart.charts.TreeMap.DataFields.POINT_BOUNDS, pointBounds);
      node.meta(anychart.charts.TreeMap.DataFields.CONTENT_BOUNDS, contentBounds);
    }
    if (type == anychart.charts.TreeMap.NodeType.RECT || type == anychart.charts.TreeMap.NodeType.TRANSIENT) {
      pointBounds = bounds.clone();
      node.meta(anychart.charts.TreeMap.DataFields.POINT_BOUNDS, pointBounds);
      node.meta(anychart.charts.TreeMap.DataFields.CONTENT_BOUNDS, pointBounds);
    }
    this.calculatePointsBounds(children, /** @type {anychart.math.Rect} */ (contentBounds || pointBounds));
    for (i = 0; i < numChildren; i++) {
      child = node.getChildAt(i);
      childPointBounds = child.meta(anychart.charts.TreeMap.DataFields.POINT_BOUNDS);
      this.drawNode_(child, /** @type {anychart.math.Rect} */ (childPointBounds), depth + 1);
    }
  }
  var index = /** @type {number} */ (node.meta('index'));
  this.getIterator().select(index);
  var pointState = this.state.getPointStateByIndex(index);
  if (type == anychart.charts.TreeMap.NodeType.TRANSIENT) {
  } else if (type == anychart.charts.TreeMap.NodeType.HEADER) {
    this.drawLabel_(pointState);
  } else {
    // type = RECT LEAF HINT_LEAF
    this.drawNodeBox_(pointState);
    if (type != anychart.charts.TreeMap.NodeType.HINT_LEAF) {
      this.drawLabel_(pointState);
      this.drawMarker_(pointState);
    }
  }

};


/**
 * Calculates nodes types.
 * @param {anychart.data.Tree.DataItem} node Node.
 * @param {number} depth Depth.
 * @private
 */
anychart.charts.TreeMap.prototype.calculateNodeTypes_ = function(node, depth) {
  if (depth > this.maxDepth_ + this.hintDepth_) return;
  var type = this.getNodeType_(node, depth);
  this.drawingNodes_[node.meta('index')] = node;
  var numChildren = node.numChildren();
  if (numChildren) {
    for (var i = 0; i < numChildren; i++) {
      this.calculateNodeTypes_(/** @type {anychart.data.Tree.DataItem} */ (node.getChildAt(i)), depth + 1);
    }
  }
  var value = node.meta(anychart.charts.TreeMap.DataFields.VALUE);
  if (type == anychart.charts.TreeMap.NodeType.LEAF || type == anychart.charts.TreeMap.NodeType.RECT)
    this.nodeValues_.push(value);
  else if (type == anychart.charts.TreeMap.NodeType.HINT_LEAF)
    this.hintNodeValues_.push(value);
};


/**
 * Prepares tree data for treeMap.
 */
anychart.charts.TreeMap.prototype.ensureDataPrepared = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.TREEMAP_DATA)) {
    this.resetDataVars();
    this.markConsistent(anychart.ConsistencyState.TREEMAP_DATA);
    var data = this.data();
    if (data) {
      var numChildren = data.numChildren();
      // more than one root node
      if (numChildren > 1)
        anychart.utils.warning(anychart.enums.WarningCode.TREEMAP_MANY_ROOTS);
      // no data case
      else if (numChildren == 0)
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
anychart.charts.TreeMap.prototype.calculate = function() {
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
      if (this.colorScale_ instanceof anychart.scales.OrdinalColor)
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
anychart.charts.TreeMap.prototype.drawContent = function(bounds) {
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
      this.headers_.clip(this.dataBounds_);
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
      this.headers().clip(this.dataBounds_);
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

    if (this.sort_ == anychart.enums.Sort.DESC) {
      this.sortFunction_ = anychart.charts.TreeMap.SORT_DESC;
    } else if (this.sort_ == anychart.enums.Sort.ASC) {
      this.sortFunction_ = anychart.charts.TreeMap.SORT_ASC;
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
      var type = iterator.meta(anychart.charts.TreeMap.DataFields.TYPE);
      if (type == anychart.charts.TreeMap.NodeType.RECT) {
        var shape = iterator.meta(anychart.charts.TreeMap.DataFields.SHAPE);
        if (shape) {
          var fill = this.getFinalFill(true, anychart.PointState.NORMAL);
          fill = anychart.color.setOpacity(fill, this.hintOpacity_, true);
          shape.fill(fill);
        }
      }
    }
    this.markConsistent(anychart.ConsistencyState.TREEMAP_HINT_OPACITY);
  }
};


/** @inheritDoc */
anychart.charts.TreeMap.prototype.resizeHandler = function(e) {
  if (this.bounds().dependsOnContainerSize()) {
    this.invalidate(anychart.ConsistencyState.BOUNDS,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
  }
};


/**
 * @inheritDoc
 */
anychart.charts.TreeMap.prototype.setupByJSON = function(config) {
  anychart.charts.TreeMap.base(this, 'setupByJSON', config);

  if ('data' in config)
    this.data(config['data'] || null);

  if ('colorScale' in config) {
    var json = config['colorScale'];
    var scale = null;
    if (goog.isString(json)) {
      scale = anychart.scales.Base.fromString(json, null);
    } else if (goog.isObject(json)) {
      scale = anychart.scales.Base.fromString(json['type'], false);
      scale.setup(json);
    }
    if (scale)
      this.colorScale(/** @type {anychart.scales.LinearColor|anychart.scales.OrdinalColor} */ (scale));
  }

  if ('maxDepth' in config)
    this.maxDepth(config['maxDepth']);
  if ('hintDepth' in config)
    this.hintDepth(config['hintDepth']);
  if ('hintOpacity' in config)
    this.hintOpacity(config['hintOpacity']);
  if ('maxHeadersHeight' in config)
    this.maxHeadersHeight(config['maxHeadersHeight']);
  if ('colorRange' in config)
    this.colorRange(config['colorRange']);
  this.sort(config['sort']);

  this.hoverMode(config['hoverMode']);
  this.selectionMode(config['selectionMode']);

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
  this.headersDisplayMode(config['headersDisplayMode']);

  this.labels().setup(config['labels']);
  this.hoverLabels().setup(config['hoverLabels']);
  this.selectLabels().setup(config['selectLabels']);
  this.labelsDisplayMode(config['labelsDisplayMode']);

  this.markers().setup(config['markers']);
  this.hoverMarkers().setup(config['hoverMarkers']);
  this.selectMarkers().setup(config['selectMarkers']);
};


/** @inheritDoc */
anychart.charts.TreeMap.prototype.serialize = function() {
  var json = anychart.charts.TreeMap.base(this, 'serialize');

  if (this.colorScale()) {
    json['colorScale'] = this.colorScale().serialize();
  }

  json['type'] = this.getType();

  if (goog.isFunction(this.fill())) {
    anychart.utils.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Series fill']
    );
  } else {
    json['fill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.fill()));
  }

  if (goog.isFunction(this.hoverFill())) {
    anychart.utils.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Series hoverFill']
    );
  } else {
    json['hoverFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.hoverFill()));
  }

  if (goog.isFunction(this.selectFill())) {
    anychart.utils.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Series selectFill']
    );
  } else {
    json['selectFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.selectFill()));
  }

  if (goog.isFunction(this.stroke())) {
    anychart.utils.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Series stroke']
    );
  } else {
    json['stroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.stroke()));
  }

  if (goog.isFunction(this.hoverStroke())) {
    anychart.utils.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Series hoverStroke']
    );
  } else {
    json['hoverStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.hoverStroke()));
  }

  if (goog.isFunction(this.selectStroke())) {
    anychart.utils.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Series selectStroke']
    );
  } else {
    json['selectStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.selectStroke()));
  }

  if (goog.isFunction(this.hatchFill())) {
    anychart.utils.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Series hatchFill']
    );
  } else {
    json['hatchFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.hatchFill()));
  }

  if (goog.isFunction(this.hoverHatchFill())) {
    anychart.utils.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Series hoverHatchFill']
    );
  } else {
    json['hoverHatchFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/
        (this.hoverHatchFill()));
  }

  if (goog.isFunction(this.selectHatchFill())) {
    anychart.utils.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Series selectHatchFill']
    );
  } else {
    json['selectHatchFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/
        (this.selectHatchFill()));
  }

  json['data'] = this.data().serializeWithoutMeta();
  json['colorRange'] = this.colorRange().serialize();
  json['maxDepth'] = this.maxDepth();
  json['hintDepth'] = this.hintDepth();
  json['hintOpacity'] = this.hintOpacity();
  json['maxHeadersHeight'] = this.maxHeadersHeight();
  json['sort'] = this.sort();

  json['labels'] = this.labels().serialize();
  json['hoverLabels'] = this.hoverLabels().serialize();
  json['selectLabels'] = this.selectLabels().serialize();
  json['labelsDisplayMode'] = this.labelsDisplayMode();

  json['headers'] = this.headers().serialize();
  json['hoverHeaders'] = this.hoverHeaders().serialize();
  json['headersDisplayMode'] = this.headersDisplayMode();
  json['maxHeadersHeight'] = this.maxHeadersHeight();

  json['markers'] = this.markers().serialize();
  json['hoverMarkers'] = this.hoverMarkers().serialize();
  json['selectMarkers'] = this.selectMarkers().serialize();

  return {'chart': json};
};


/** @inheritDoc */
anychart.charts.TreeMap.prototype.disposeInternal = function() {
  goog.disposeAll(this.headers_, this.hoverHeaders_, this.labels_, this.hoverLabels_, this.selectLabels_, this.markers_, this.hoverMarkers_, this.selectMarkers_);
  this.headers_ = null;
  this.hoverHeaders_ = null;

  this.labels_ = null;
  this.hoverLabels_ = null;
  this.selectLabels_ = null;

  this.markers_ = null;
  this.hoverMarkers_ = null;
  this.selectMarkers_ = null;

  anychart.charts.TreeMap.base(this, 'disposeInternal');
};


/**
 * Creates data suitable to create csv.
 * @param {Object} node Node.
 * @param {Array} rawData Raw data.
 * @param {Object} headers Hash map of seen columns.
 * @param {number} headersLength length of headers.
 * @param {?(string|number)} parentId Parent ID.
 * @param {?(string|number)} originalParent original parent id.
 */
anychart.charts.TreeMap.prototype.makeObject = function(node, rawData, headers, headersLength, parentId, originalParent) {
  var data = goog.object.clone(node['treeDataItemData']);
  if (!goog.isDef(data['id'])) {
    this.missedIds_++;
    this.idStatus_ = -1;
  }
  data['parent'] = [this.nodesCount_, parentId, originalParent];
  parentId = this.nodesCount_++;
  rawData.push(data);
  for (var key in data) {
    if (!(key in headers))
      headers[key] = headersLength++;
  }
  var children = node['children'];
  if (children && children.length) {
    for (var i = 0, len = children.length; i < len; i++)
      this.makeObject(children[i], rawData, headers, headersLength, parentId, data['id']);
  }
};


/** @inheritDoc */
anychart.charts.TreeMap.prototype.toCsv = function(csvMode, opt_csvSettings) {
  var settings = goog.isObject(opt_csvSettings) ? opt_csvSettings : {};
  var rowsSeparator = settings['rowsSeparator'] || '\n';
  this.checkSeparator(rowsSeparator);
  var columnsSeparator = settings['columnsSeparator'] || ',';
  this.checkSeparator(columnsSeparator);
  var ignoreFirstRow = settings['ignoreFirstRow'] || false;

  var data = this.data();

  var serialized = data.serialize();
  var roots = serialized['children'];

  var rawData = [];
  var headers = {};
  var i, j;
  /**
   * -1 means there is at least one missing id, so use auto generated id|parent and save original id|parent
   *  0 means there is no id at all use auto generated id|parent without original
   *  1 means there are all ids in tree, so do not use auto generated - use original id|parent
   * @type {number}
   * @private
   */
  this.idStatus_ = 1;
  this.missedIds_ = 0;
  this.nodesCount_ = 0;
  headers['id'] = 0;
  headers['parent'] = 1;
  for (i = 0; i < roots.length; i++) {
    this.makeObject(roots[i], rawData, headers, 2, null, null);
  }
  if (this.missedIds_ === this.nodesCount_) {
    this.idStatus_ = 0;
  } else if (this.missedIds_ === 0) {
    this.idStatus_ = 1;
  }

  var key;
  var columns = [];

  for (key in headers)
    columns[headers[key]] = key;


  var rowArray;
  var rowStrings = [];
  var row;
  var column;
  var parent;
  var finalValue;
  var id, parentId;
  if (this.idStatus_ < 0) {
    headers['__original_id__'] = columns.length;
    headers['__original_parent__'] = columns.length + 1;
    columns.push('__original_id__', '__original_parent__');
  }

  if (!ignoreFirstRow)
    rowStrings.push(columns.join(columnsSeparator));
  for (i = 0; i < rawData.length; i++) {
    rowArray = new Array(columns.length);
    row = rawData[i];
    // parent - array with
    // 0 - auto generated id
    // 1 - auto generated parent id
    // 2 - original parent id
    parent = row['parent'];

    if (this.idStatus_ <= 0) {
      id = parent[0];
      parentId = parent[1];
    } else {
      id = row['id'];
      parentId = parent[2];
    }

    for (j = 0; j < columns.length; j++) {
      column = columns[j];
      finalValue = goog.isObject(row[column]) ? goog.json.serialize(row[column]) : row[column];

      if (column === 'id')
        rowArray[j] = id;

      else if (column === 'parent')
        rowArray[j] = parentId;

      else if (column === '__original_parent__')
        rowArray[j] = parent[2];

      else if (column === '__original_id__')
        rowArray[j] = row['id'];

      else
        rowArray[j] = finalValue;
    }
    this.escapeValuesInRow(rowArray, columnsSeparator, rowsSeparator);
    rowStrings.push(rowArray.join(columnsSeparator));
  }
  return rowStrings.join(rowsSeparator);
};


//exports
anychart.charts.TreeMap.prototype['data'] = anychart.charts.TreeMap.prototype.data;
anychart.charts.TreeMap.prototype['maxDepth'] = anychart.charts.TreeMap.prototype.maxDepth;
anychart.charts.TreeMap.prototype['hintDepth'] = anychart.charts.TreeMap.prototype.hintDepth;
anychart.charts.TreeMap.prototype['hintOpacity'] = anychart.charts.TreeMap.prototype.hintOpacity;
anychart.charts.TreeMap.prototype['sort'] = anychart.charts.TreeMap.prototype.sort;

anychart.charts.TreeMap.prototype['selectionMode'] = anychart.charts.TreeMap.prototype.selectionMode;
anychart.charts.TreeMap.prototype['hoverMode'] = anychart.charts.TreeMap.prototype.hoverMode;

anychart.charts.TreeMap.prototype['headers'] = anychart.charts.TreeMap.prototype.headers;
anychart.charts.TreeMap.prototype['hoverHeaders'] = anychart.charts.TreeMap.prototype.hoverHeaders;
anychart.charts.TreeMap.prototype['headersDisplayMode'] = anychart.charts.TreeMap.prototype.headersDisplayMode;
anychart.charts.TreeMap.prototype['maxHeadersHeight'] = anychart.charts.TreeMap.prototype.maxHeadersHeight;

anychart.charts.TreeMap.prototype['labels'] = anychart.charts.TreeMap.prototype.labels;
anychart.charts.TreeMap.prototype['hoverLabels'] = anychart.charts.TreeMap.prototype.hoverLabels;
anychart.charts.TreeMap.prototype['selectLabels'] = anychart.charts.TreeMap.prototype.selectLabels;

anychart.charts.TreeMap.prototype['markers'] = anychart.charts.TreeMap.prototype.markers;
anychart.charts.TreeMap.prototype['hoverMarkers'] = anychart.charts.TreeMap.prototype.hoverMarkers;
anychart.charts.TreeMap.prototype['selectMarkers'] = anychart.charts.TreeMap.prototype.selectMarkers;

anychart.charts.TreeMap.prototype['colorScale'] = anychart.charts.TreeMap.prototype.colorScale;
anychart.charts.TreeMap.prototype['colorRange'] = anychart.charts.TreeMap.prototype.colorRange;

anychart.charts.TreeMap.prototype['fill'] = anychart.charts.TreeMap.prototype.fill;
anychart.charts.TreeMap.prototype['hoverFill'] = anychart.charts.TreeMap.prototype.hoverFill;
anychart.charts.TreeMap.prototype['selectFill'] = anychart.charts.TreeMap.prototype.selectFill;

anychart.charts.TreeMap.prototype['stroke'] = anychart.charts.TreeMap.prototype.stroke;
anychart.charts.TreeMap.prototype['hoverStroke'] = anychart.charts.TreeMap.prototype.hoverStroke;
anychart.charts.TreeMap.prototype['selectStroke'] = anychart.charts.TreeMap.prototype.selectStroke;

anychart.charts.TreeMap.prototype['hatchFill'] = anychart.charts.TreeMap.prototype.hatchFill;
anychart.charts.TreeMap.prototype['hoverHatchFill'] = anychart.charts.TreeMap.prototype.hoverHatchFill;
anychart.charts.TreeMap.prototype['selectHatchFill'] = anychart.charts.TreeMap.prototype.selectHatchFill;

anychart.charts.TreeMap.prototype['drillTo'] = anychart.charts.TreeMap.prototype.drillTo;
anychart.charts.TreeMap.prototype['drillUp'] = anychart.charts.TreeMap.prototype.drillUp;
anychart.charts.TreeMap.prototype['getCurrentPath'] = anychart.charts.TreeMap.prototype.getCurrentPath;

anychart.charts.TreeMap.prototype['toCsv'] = anychart.charts.TreeMap.prototype.toCsv;
