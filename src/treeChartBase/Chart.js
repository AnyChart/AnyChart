//region --- Requiring and Providing
goog.provide('anychart.treeChartBase.Chart');

goog.require('anychart.core.SeparateChart');
goog.require('anychart.core.utils.IInteractiveSeries');
goog.require('anychart.data.Set');
goog.require('anychart.enums');
goog.require('anychart.treeChartBase.ArrayIterator');
goog.require('anychart.treeChartBase.Point');
goog.require('anychart.treeDataModule.Tree');
goog.require('anychart.treeDataModule.utils');
//endregion;



/**
 * Tree chart base class.
 * @param {(anychart.treeDataModule.Tree|anychart.treeDataModule.View|Array.<Object>)=} opt_data - Data tree or raw data.
 * @param {anychart.enums.TreeFillingMethod=} opt_fillMethod - Fill method.
 * @extends {anychart.core.SeparateChart}
 * @implements {anychart.core.utils.IInteractiveSeries}
 * @constructor
 */
anychart.treeChartBase.Chart = function(opt_data, opt_fillMethod) {
  anychart.treeChartBase.Chart.base(this, 'constructor');

  this.referenceValueNames = ['x', 'value'];

  /**
   * Linear index of tree's node.
   * @type {number}
   */
  this.linearIndex = 0;

  /**
   * Array of nodes.
   * @type {Array.<anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem>}
   */
  this.linearNodes = [];

  /**
   * Array of nodes.
   * @type {Array.<anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem>}
   */
  this.drawingNodes = [];

  this.data(opt_data, opt_fillMethod);
};
goog.inherits(anychart.treeChartBase.Chart, anychart.core.SeparateChart);


//region --- Interface methods
/**
 * Tester if the series is discrete based.
 * @return {boolean}
 */
anychart.treeChartBase.Chart.prototype.isDiscreteBased = function() {
  return true;
};


/**
 * Tester if the series is discrete based.
 * @return {boolean}
 */
anychart.treeChartBase.Chart.prototype.isSizeBased = function() {
  return false;
};


/**
 * @inheritDoc
 */
anychart.treeChartBase.Chart.prototype.isSeries = function() {
  return true;
};


/**
 * @inheritDoc
 */
anychart.treeChartBase.Chart.prototype.getAllSeries = function() {
  return [this];
};


//endregion
//region --- Static props
/**
 * Supported signals.
 * @type {number}
 */
anychart.treeChartBase.Chart.prototype.SUPPORTED_SIGNALS =
    anychart.treeChartBase.Chart.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.DATA_CHANGED;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.treeChartBase.Chart.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.SeparateChart.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.TREE_DATA |
    anychart.ConsistencyState.APPEARANCE;


/**
 * TreeMap node types.
 * @enum {number}
 */
anychart.treeChartBase.Chart.NodeType = {
  LEAF: 0,
  HEADER: 1,
  RECT: 2,
  TRANSIENT: 3,
  HINT_LEAF: 4,
  VERTEX: 5
};


//endregion
//region --- Interactivity
/** @inheritDoc */
anychart.treeChartBase.Chart.prototype.applyAppearanceToPoint = goog.nullFunction;


/** @inheritDoc */
anychart.treeChartBase.Chart.prototype.applyAppearanceToSeries = goog.nullFunction;


/** @inheritDoc */
anychart.treeChartBase.Chart.prototype.finalizePointAppearance = goog.nullFunction;


/** @inheritDoc */
anychart.treeChartBase.Chart.prototype.getStartValueForAppearanceReduction = goog.nullFunction;


/**
 * @param {(anychart.enums.HoverMode|string)=} opt_value Hover mode.
 * @return {anychart.treeChartBase.Chart|anychart.enums.HoverMode} .
 */
anychart.treeChartBase.Chart.prototype.hoverMode = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeHoverMode(opt_value);
    if (opt_value != this.hoverMode_) {
      this.hoverMode_ = opt_value;
    }
    return this;
  }
  return /** @type {anychart.enums.HoverMode} */(this.hoverMode_);
};


/**
 * @param {(anychart.enums.SelectionMode|string|null)=} opt_value Selection mode.
 * @return {anychart.treeChartBase.Chart|anychart.enums.SelectionMode|null} .
 */
anychart.treeChartBase.Chart.prototype.selectionMode = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = goog.isNull(opt_value) ? null : anychart.enums.normalizeSelectMode(opt_value);
    if (opt_value != this.selectionMode_) {
      this.selectionMode_ = opt_value;
    }
    return this;
  }
  return /** @type {anychart.enums.SelectionMode} */(this.selectionMode_);
};


/**
 * Makes interactive.
 * @param {acgraph.vector.Element} element .
 * @protected
 */
anychart.treeChartBase.Chart.prototype.makeInteractive = function(element) {
  if (!element) return;
  var node = this.getIterator().getItem();
  element.tag = {
    series: this,
    index: node.meta('index'),
    node: node
  };
};


/** @inheritDoc */
anychart.treeChartBase.Chart.prototype.getPoint = function(index) {
  var node = this.linearNodes[index];
  var point = null;
  if (node)
    point = new anychart.treeChartBase.Point(this, node);
  return point;
};


/** @inheritDoc */
anychart.treeChartBase.Chart.prototype.makeBrowserEvent = function(e) {
  var res = anychart.core.VisualBase.prototype.makeBrowserEvent.call(this, e);

  var tag = anychart.utils.extractTag(res['domTarget']);
  var pointIndex = tag.index;

  // fix for domTarget == layer (mouseDown on label + mouseUp on path = click on layer)
  if (!goog.isDef(pointIndex) && this.state.hasPointState(anychart.PointState.HOVER)) {
    var hoveredPointsIndex = this.state.getIndexByPointState(anychart.PointState.HOVER);
    if (hoveredPointsIndex.length) {
      pointIndex = hoveredPointsIndex[0];
    }
  }

  pointIndex = anychart.utils.toNumber(pointIndex);
  if (!isNaN(pointIndex)) {
    res['pointIndex'] = pointIndex;
  }
  return res;
};


/**
 * Normal state settings.
 * @param {!Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.treeChartBase.Chart}
 */
anychart.treeChartBase.Chart.prototype.normal = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.normal_.setup(opt_value);
    return this;
  }
  return this.normal_;
};


/**
 * Hovered state settings.
 * @param {!Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.treeChartBase.Chart}
 */
anychart.treeChartBase.Chart.prototype.hovered = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.hovered_.setup(opt_value);
    return this;
  }
  return this.hovered_;
};


/**
 * Selected state settings.
 * @param {!Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.treeChartBase.Chart}
 */
anychart.treeChartBase.Chart.prototype.selected = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.selected_.setup(opt_value);
    return this;
  }
  return this.selected_;
};


/** @inheritDoc */
anychart.treeChartBase.Chart.prototype.getSeriesStatus = function(event) {
  return [];
};


/**
 * Hovers a point of the series by its index.
 * @param {number|Array<number>} index Index of the point to hover.
 * @param {anychart.core.MouseEvent=} opt_event Event that initiate point hovering.<br/>
 *    <b>Note:</b> Used only to display float tooltip.
 * @return {!anychart.treeChartBase.Chart}  {@link anychart.treeChartBase.Chart} instance for method chaining.
 */
anychart.treeChartBase.Chart.prototype.hoverPoint = function(index, opt_event) {
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
anychart.treeChartBase.Chart.prototype.unhover = function(opt_indexOrIndexes) {
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


/**
 * Select a point of the series by its index.
 * @param {number|Array<number>} indexOrIndexes Index of the point to hover.
 * @param {anychart.core.MouseEvent=} opt_event Event that initiate point selecting.
 * @return {!anychart.treeChartBase.Chart}  {@link anychart.treeChartBase.Chart} instance for method chaining.
 */
anychart.treeChartBase.Chart.prototype.selectPoint = function(indexOrIndexes, opt_event) {
  var unselect = !(opt_event && opt_event.shiftKey);
  var changedState = unselect ? opt_event ? anychart.PointState.HOVER : anychart.PointState.NORMAL : void 0;

  if (goog.isArray(indexOrIndexes)) {
    if (!opt_event)
      this.unselect();

    this.state.setPointState(anychart.PointState.SELECT, indexOrIndexes, changedState);
  } else if (goog.isNumber(indexOrIndexes)) {
    this.state.setPointState(anychart.PointState.SELECT, indexOrIndexes, changedState);
  }

  return this;
};


//endregion
//region --- Drill Down
/**
 * Creates crumbs to node from tree root.
 * @param {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} node Node.
 * @return {Array.<anychart.treeChartBase.Point>} Array of crumbs.
 */
anychart.treeChartBase.Chart.prototype.createCrumbsTo = function(node) {
  var crumbs = [];
  if (node) {
    var cur = node;
    while (cur = cur.getParent()) {
      crumbs.unshift(this.getPoint(/** @type {number} */ (cur.meta('index'))));
    }
    crumbs.push(this.getPoint(/** @type {number} */ (node.meta('index'))));
  }
  return crumbs;
};


/**
 * Drills down to target.
 * @param {(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem|Array|string)} target Target to drill down to.
 */
anychart.treeChartBase.Chart.prototype.drillTo = function(target) {
  if (this.prevHoverSeriesStatus) {
    this.unhover();
    this.dispatchEvent(this.makeInteractivityPointEvent('hovered', {'target': this}, this.prevHoverSeriesStatus, true));
    this.prevHoverSeriesStatus = null;
  }
  this.ensureDataPrepared();
  var node = null;
  var data;
  if (anychart.utils.instanceOf(target, anychart.treeDataModule.Tree.DataItem) || anychart.utils.instanceOf(target, anychart.treeDataModule.View.DataItem)) {
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
      node = data.searchItems('id', /** @type {string} */(target))[0];
    }
  }

  this.setRootNode(node);
};


/**
 * Creates crumbs to current root.
 * @return {Array.<anychart.treeChartBase.Point>} Current path.
 */
anychart.treeChartBase.Chart.prototype.getDrilldownPath = goog.abstractMethod;


//endregion
//region --- Data
/**
 * Getter/setter for data.
 * @param {(anychart.treeDataModule.Tree|anychart.treeDataModule.View|Array.<Object>)=} opt_value - Data tree or raw data.
 * @param {anychart.enums.TreeFillingMethod=} opt_fillMethod - Fill method.
 * @return {anychart.treeDataModule.Tree|anychart.treeDataModule.View|anychart.treeChartBase.Chart}
 */
anychart.treeChartBase.Chart.prototype.data = function(opt_value, opt_fillMethod) {
  if (goog.isDef(opt_value)) {
    if (anychart.utils.instanceOf(opt_value, anychart.treeDataModule.Tree) ||
        anychart.utils.instanceOf(opt_value, anychart.treeDataModule.View)) {
      if (opt_value != this.data_) {
        if (this.data_)
          this.data_.unlistenSignals(this.dataInvalidated_, this);
        this.data_ = /** @type {anychart.treeDataModule.Tree|anychart.treeDataModule.View} */(opt_value);
        this.data_.listenSignals(this.dataInvalidated_, this);
      }
    } else {
      if (this.data_)
        this.data_.unlistenSignals(this.dataInvalidated_, this);
      this.data_ = new anychart.treeDataModule.Tree(/** @type {Array.<Object>} */(opt_value), opt_fillMethod);
      this.data_.listenSignals(this.dataInvalidated_, this);
    }
    this.invalidate(anychart.ConsistencyState.TREE_DATA | anychart.ConsistencyState.CHART_LABELS, anychart.Signal.NEEDS_REDRAW);
    return this;
  }
  return this.data_;
};


/**
 * @param {anychart.SignalEvent} event
 * @private
 */
anychart.treeChartBase.Chart.prototype.dataInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.DATA_CHANGED))
    this.invalidate(anychart.ConsistencyState.TREE_DATA | anychart.ConsistencyState.CHART_LABELS, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Returns current view iterator.
 * @return {!anychart.data.Iterator} Current pie view iterator.
 */
anychart.treeChartBase.Chart.prototype.getIterator = function() {
  return this.iterator_ || this.getResetIterator();
};


/**
 * Returns new default iterator for the current mapping.
 * @return {!anychart.data.Iterator} New iterator.
 */
anychart.treeChartBase.Chart.prototype.getResetIterator = function() {
  return this.iterator_ = new anychart.treeChartBase.ArrayIterator(this.drawingNodes);
};
//endregion
//region --- Utils
/** @inheritDoc */
anychart.treeChartBase.Chart.prototype.toCsv = function(opt_chartDataExportMode, opt_csvSettings) {
  return anychart.treeDataModule.utils.toCsv(
      /** @type {anychart.treeDataModule.Tree|anychart.treeDataModule.View} */(this.data()), opt_csvSettings);
};
//endregion
//region --- Disposing / Serialization / Setup
/** @inheritDoc */
anychart.treeChartBase.Chart.prototype.serialize = function() {
  var json = anychart.treeChartBase.Chart.base(this, 'serialize');

  var data = this.data();
  if (data)
    json['treeData'] = data.serializeWithoutMeta();

  var drillPath = this.getDrilldownPath();
  var drillTo = [];
  if (drillPath) {
    var parentNode;
    for (var i = 1; i < drillPath.length; i++) {
      parentNode = drillPath[i - 1].getNode();
      drillTo[i - 1] = parentNode.indexOfChild(drillPath[i].getNode());
    }
  }
  if (drillTo.length)
    json['drillTo'] = drillTo;

  json['normal'] = this.normal_.serialize();
  json['hovered'] = this.hovered_.serialize();
  json['selected'] = this.selected_.serialize();

  return json;
};


/** @inheritDoc */
anychart.treeChartBase.Chart.prototype.setupByJSON = function(config, opt_default) {
  anychart.treeChartBase.Chart.base(this, 'setupByJSON', config, opt_default);

  if ('treeData' in config)
    this.data(anychart.treeDataModule.Tree.fromJson(config['treeData']));

  if ('drillTo' in config)
    this.drillTo(config['drillTo']);

  this.normal_.setupInternal(!!opt_default, config);
  this.normal_.setupInternal(!!opt_default, config['normal']);
  this.hovered_.setupInternal(!!opt_default, config['hovered']);
  this.selected_.setupInternal(!!opt_default, config['selected']);
};


//endregion
