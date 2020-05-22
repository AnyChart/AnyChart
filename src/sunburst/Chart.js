//region --- Requiring and Providing
goog.provide('anychart.sunburstModule.Chart');

// goog.require('anychart.animations.AnimationSerialQueue');
goog.require('anychart.color');
goog.require('anychart.core.ICenterContentChart');
goog.require('anychart.core.IShapeManagerUser');
goog.require('anychart.core.StateSettings');
goog.require('anychart.core.StatefulColoring');
goog.require('anychart.core.reporting');
goog.require('anychart.core.settings');
goog.require('anychart.core.ui.Center');
goog.require('anychart.core.ui.LabelsFactory');
goog.require('anychart.core.ui.Tooltip');
goog.require('anychart.core.utils.InteractivityState');
goog.require('anychart.core.utils.Padding');
goog.require('anychart.core.utils.TypedLayer');
goog.require('anychart.data.Set');
goog.require('anychart.enums');
goog.require('anychart.format.Context');
goog.require('anychart.math');
goog.require('anychart.palettes');
goog.require('anychart.sunburstModule.Level');
goog.require('anychart.treeChartBase.Chart');
goog.require('anychart.treeChartBase.Point');
goog.require('anychart.treeDataModule.Tree');
goog.require('goog.labs.userAgent.device');
goog.require('goog.ui.KeyboardShortcutHandler');
//endregion;


/**
 * Sunburst Class.
 * @param {(anychart.treeDataModule.Tree|anychart.treeDataModule.View|Array.<Object>)=} opt_data - Data tree or raw data.
 * @param {anychart.enums.TreeFillingMethod=} opt_fillMethod - Fill method.
 * @extends {anychart.treeChartBase.Chart}
 * @implements {anychart.core.IShapeManagerUser}
 * @implements {anychart.core.ICenterContentChart}
 * @constructor
 */
anychart.sunburstModule.Chart = function(opt_data, opt_fillMethod) {
  anychart.sunburstModule.Chart.base(this, 'constructor', opt_data, opt_fillMethod);

  this.addThemes('sunburst');

  /**
   * Interactivity state.
   * @type {anychart.core.utils.InteractivityState}
   */
  this.state = new anychart.core.utils.InteractivityState(this);

  this.currentLevels = {};

  /**
   * @type {Array.<anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem>}
   */
  this.treeRoots = [];

  /**
   * @type {Array.<anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem>}
   */
  this.currentRoots = [];

  /**
   * Sunburst levels with index from root to leaves.
   * @type {Array.<anychart.sunburstModule.Level>}
   * @private
   */
  this.levelsPositive_ = [];

  /**
   * Sunburst levels with index from leaves to root.
   * @type {Array.<anychart.sunburstModule.Level>}
   * @private
   */
  this.levelsNegative_ = [];

  /**
   * Sunburst chart default palette.
   * @type {anychart.palettes.DistinctColors|anychart.palettes.RangeColors}
   * @private
   */
  this.palette_ = null;

  /**
   * @type {anychart.palettes.HatchFills}
   * @private
   */
  this.hatchFillPalette_ = null;

  /**
   * Stateful coloring instance.
   *
   * @type {anychart.core.StatefulColoring}
   * @private
   */
  this.statefulColoring_ = null;

  /**
   * Paths cache for stateful coloring.
   *
   * @type {Object.<acgraph.vector.Path>}
   * @private
   */
  this.statefulColoringPaths_ = {};

  this.invalidate(anychart.ConsistencyState.ALL);

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['radius', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW],
    ['innerRadius', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW],
    ['startAngle', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['calculationMode', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['sort', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW]
  ]);

  var normalDescriptorsMeta = {};
  anychart.core.settings.createDescriptorsMeta(normalDescriptorsMeta, [
    ['fill',
      anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.CHART_LEGEND,
      anychart.Signal.NEEDS_REDRAW],
    ['stroke',
      anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.CHART_LEGEND,
      anychart.Signal.NEEDS_REDRAW],
    ['hatchFill',
      anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.CHART_LEGEND,
      anychart.Signal.NEEDS_REDRAW],
    ['labels', 0, 0]
  ]);
  this.normal_ = new anychart.core.StateSettings(this, normalDescriptorsMeta, anychart.PointState.NORMAL);
  this.normal_.setOption(anychart.core.StateSettings.LABELS_FACTORY_CONSTRUCTOR, anychart.core.StateSettings.CIRCULAR_LABELS_CONSTRUCTOR_NO_THEME);
  this.normal_.setOption(anychart.core.StateSettings.LABELS_AFTER_INIT_CALLBACK, /** @this {anychart.sunburstModule.Chart} */ function(factory) {
    factory.listenSignals(this.labelsInvalidated, this);
    factory.setParentEventTarget(this);
    this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
  });

  var hoveredDescriptorsMeta = {};
  anychart.core.settings.createDescriptorsMeta(hoveredDescriptorsMeta, [
    ['fill', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['stroke', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['hatchFill', 0, 0],
    ['labels', 0, 0]
  ]);
  this.hovered_ = new anychart.core.StateSettings(this, hoveredDescriptorsMeta, anychart.PointState.HOVER);
  this.hovered_.setOption(anychart.core.StateSettings.LABELS_FACTORY_CONSTRUCTOR, anychart.core.StateSettings.CIRCULAR_LABELS_CONSTRUCTOR_NO_THEME);

  var selectedDescriptorsMeta = {};
  anychart.core.settings.createDescriptorsMeta(selectedDescriptorsMeta, [
    ['fill', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['stroke', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['hatchFill', 0, 0],
    ['labels', 0, 0]
  ]);
  this.selected_ = new anychart.core.StateSettings(this, selectedDescriptorsMeta, anychart.PointState.SELECT);
  this.selected_.setOption(anychart.core.StateSettings.LABELS_FACTORY_CONSTRUCTOR, anychart.core.StateSettings.CIRCULAR_LABELS_CONSTRUCTOR_NO_THEME);

  /**
   * Aaync init mouse and keyboard interactivity for cases when chart have no stage on draw moment.
   * @type {!Function}
   * @private
   */
  this.initInteractivityControlsWrapper_ = goog.bind(this.initInteractivityControls_, this);
};
goog.inherits(anychart.sunburstModule.Chart, anychart.treeChartBase.Chart);
anychart.core.settings.populateAliases(anychart.sunburstModule.Chart, ['fill', 'stroke', 'hatchFill', 'labels'], 'normal');


//region --- Static props
/**
 * Supported consistency states.
 * @type {number}
 */
anychart.sunburstModule.Chart.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.treeChartBase.Chart.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.SUNBURST_CENTER_CONTENT |
    anychart.ConsistencyState.SUNBURST_CALCULATIONS;


/**
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.sunburstModule.Chart.PROPERTY_DESCRIPTORS = (function() {
  function sortNormalizer(opt_value) {
    return goog.isFunction(opt_value) ? opt_value : anychart.enums.normalizeSort(opt_value);
  }
  function innerRadiusNormalizer(opt_value) {
    return goog.isFunction(opt_value) ? opt_value : anychart.utils.normalizeNumberOrPercent(opt_value);
  }
  function radiusNormalizer(opt_value) {
    return anychart.utils.normalizeNumberOrPercent(opt_value, '100%');
  }

  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  var descriptors = anychart.core.settings.descriptors;
  anychart.core.settings.createDescriptors(map, [
      [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'sort', sortNormalizer],
      [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'calculationMode', anychart.core.settings.asIsNormalizer],
      [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'radius', radiusNormalizer],
      [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'innerRadius', innerRadiusNormalizer],
      descriptors.START_ANGLE
  ]);

  return map;
})();
anychart.core.settings.populate(anychart.sunburstModule.Chart, anychart.sunburstModule.Chart.PROPERTY_DESCRIPTORS);


/**
 * Default start angle.
 * @type {number}
 */
anychart.sunburstModule.Chart.DEFAULT_START_ANGLE = -90;


/**
 * Center content bg z-index in root layer.
 * @type {number}
 */
anychart.sunburstModule.Chart.ZINDEX_CENTER_CONTENT_BG = 20;


/**
 * Center content layer z-index in root layer.
 * @type {number}
 */
anychart.sunburstModule.Chart.ZINDEX_CENTER_CONTENT_LAYER = 25;


/**
 * Series element z-index in series root layer.
 * @type {number}
 */
anychart.sunburstModule.Chart.ZINDEX_SERIES = 30;


/**
 * Hatch fill z-index in series root layer.
 * @type {number}
 */
anychart.sunburstModule.Chart.ZINDEX_HATCH_FILL = 31;


/**
 * Label z-index in series root layer.
 * @type {number}
 */
anychart.sunburstModule.Chart.ZINDEX_LABEL = 32;


/**
 * Sunburst data item fields.
 * @enum {string}
 */
anychart.sunburstModule.Chart.FieldsName = {
  META_VALUE: 'sunburst_value',
  VALUE: 'value',
  LEAVES_SUM: 'sunburst_leavesSum',
  CHILDREN_SUM: 'sunburst_childSum',
  VISIBLE_LEAVES_SUM: 'sunburst_visibleLeavesSum',
  LEAVES_COUNT: 'sunburst_leavesCount',
  CHILDREN_LEAVES_COUNT: 'sunburst_childrenLeavesCount',
  TYPE: 'sunburst_type',
  MISSING: 'sunburst_missing'
};


/**
 * Sunburst stats fields names.
 * @enum {string}
 */
anychart.sunburstModule.Chart.StatsFieldsName = {
  sum: 'sum',
  nodesCount: 'nodesCount',
  leavesCount: 'leavesCount',
  branchesCount: 'branchesCount',
  childSum: 'childSum',
  leavesSum: 'leavesSum',
  nodes: 'nodes',
  attendingRoots: 'attendingRoots',
  display: 'display',
  thickness: 'thickness',
  statsByRoot: 'statsByRoot'
};


//endregion
//region --- Interface methods
/** @inheritDoc */
anychart.sunburstModule.Chart.prototype.getType = function() {
  return anychart.enums.ChartTypes.SUNBURST;
};


//endregion
//region --- Interactivity
/**
 * Interactivity controls.
 * @private
 */
anychart.sunburstModule.Chart.prototype.initInteractivityControls_ = function() {
  if (this.isDisposed())
    return;

  var cnt = this.container();
  var stage = cnt ? cnt.getStage() : null;
  if (stage && this.getPlotBounds()) {
    var container = stage.getDomWrapper();

    if (!anychart.mapTextarea) {
      anychart.mapTextarea = goog.dom.createDom('textarea');
      anychart.mapTextarea.setAttribute('readonly', 'readonly');
      goog.style.setStyle(anychart.mapTextarea, {
        'border': 0,
        'clip': 'rect(0 0 0 0)',
        'height': '1px',
        'margin': '-1px',
        'overflow': 'hidden',
        'padding': '0',
        'position': 'absolute',
        'left': 0,
        'top': 0,
        'width': '1px'
      });
      goog.dom.appendChild(document['body'], anychart.mapTextarea);
      goog.events.listen(anychart.mapTextarea, [goog.events.EventType.FOCUS, goog.events.EventType.FOCUSIN, goog.events.EventType.SELECT], function(e) {
        e.preventDefault();
      });
    }

    this.shortcutHandler = new goog.ui.KeyboardShortcutHandler(anychart.mapTextarea);

    this.shortcutHandler.setAlwaysPreventDefault(true);
    this.shortcutHandler.setAlwaysStopPropagation(true);
    this.shortcutHandler.setAllShortcutsAreGlobal(true);
    this.shortcutHandler.setModifierShortcutsAreGlobal(true);

    this.shortcutHandler.registerShortcut('drill_up', goog.events.KeyCodes.BACKSPACE);
    this.shortcutHandler.registerShortcut('drill_up', goog.events.KeyCodes.ESC);

    this.shortcutHandler.listen(goog.ui.KeyboardShortcutHandler.EventType.SHORTCUT_TRIGGERED, function(e) {
      if (anychart.mapTextarea.chart && anychart.mapTextarea.chart != this)
        return;

      if (e.identifier == 'drill_up')
        this.doDrillChange(this.currentRoots[0].getParent());
    }, false, this);


    this.chartClickHandler_ = function(e) {
      if (!this.container() || !this.container().getStage())
        return;

      var containerPosition = this.container().getStage().getClientPosition();
      var bounds = this.getPixelBounds();

      var insideBounds = bounds &&
          e.clientX >= bounds.left + containerPosition.x &&
          e.clientX <= bounds.left + containerPosition.x + bounds.width &&
          e.clientY >= bounds.top + containerPosition.y &&
          e.clientY <= bounds.top + containerPosition.y + bounds.height;

      if (insideBounds) {
        var scrollEl = goog.dom.getDomHelper(anychart.mapTextarea).getDocumentScrollElement();
        var scrollX = scrollEl.scrollLeft;
        var scrollY = scrollEl.scrollTop;

        anychart.mapTextarea.select();
        anychart.mapTextarea.chart = this;
        if (goog.userAgent.GECKO) {
          var newScrollX = scrollEl.scrollLeft;
          var newScrollY = scrollEl.scrollTop;
          setTimeout(function() {
            if (scrollEl.scrollLeft == newScrollX && scrollEl.scrollTop == newScrollY)
              anychart.window.scrollTo(scrollX, scrollY);
          }, 0);
        } else {
          anychart.window.scrollTo(scrollX, scrollY);
        }
      }
    };

    goog.events.listen(container, goog.events.EventType.MOUSEUP, this.chartClickHandler_, false, this);
  } else {
    setTimeout(this.initInteractivityControlsWrapper_, 100);
  }
};


/** @inheritDoc */
anychart.sunburstModule.Chart.prototype.makeBrowserEvent = function(e) {
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


/** @inheritDoc */
anychart.sunburstModule.Chart.prototype.handleMouseEvent = function(event) {
  var evt = this.makePointEvent(event);
  if (evt)
    this.dispatchEvent(evt);
};


/**
 * Patches the original source event to maintain pointIndex support for
 * browser events.
 * @param {anychart.core.MouseEvent} event
 * @return {Object} An object of event to dispatch. If null - unrecognized type was found.
 */
anychart.sunburstModule.Chart.prototype.makePointEvent = function(event) {
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



/**
 * If index is passed, hovers a point of the series by its index, else hovers all points of the series.
 * @param {(number|Array<number>)=} opt_indexOrIndexes Point index or array of indexes.
 * @return {!anychart.sunburstModule.Chart}  {@link anychart.sunburstModule.Chart} instance for method chaining.
 */
anychart.sunburstModule.Chart.prototype.hover = function(opt_indexOrIndexes) {
  if (goog.isDef(opt_indexOrIndexes))
    this.hoverPoint(opt_indexOrIndexes);
  else
    this.hoverSeries();

  return this;
};


/**
 * Hovers all points of the series. Use <b>unhover</b> method for unhover series.
 * @return {!anychart.sunburstModule.Chart} An instance of the {@link anychart.sunburstModule.Chart} class for method chaining.
 */
anychart.sunburstModule.Chart.prototype.hoverSeries = function() {
  if (!this.enabled())
    return this;

  this.state.setPointState(anychart.PointState.HOVER, true);

  return this;
};


/**
 * Selects a point of the chart by its index.
 * @param {(number|Array.<number>)=} opt_indexOrIndexes Index or array of indexes of the point to select.
 * @return {!anychart.sunburstModule.Chart} {@link anychart.sunburstModule.Chart} instance for method chaining.
 */
anychart.sunburstModule.Chart.prototype.select = function(opt_indexOrIndexes) {
  if (!this.enabled())
    return this;

  if (goog.isDef(opt_indexOrIndexes))
    this.selectPoint(opt_indexOrIndexes);
  else {
    this.selectSeries();
  }

  return this;
};


/**
 * Selects all points of the chart. Use <b>unselect</b> method to unselect them.
 * @return {!anychart.sunburstModule.Chart} An instance of the {@link anychart.sunburstModule.Chart} class for method chaining.
 */
anychart.sunburstModule.Chart.prototype.selectSeries = function() {

  this.state.setPointState(anychart.PointState.SELECT, true);

  return this;
};


/** @inheritDoc */
anychart.sunburstModule.Chart.prototype.unselect = function(opt_indexOrIndexes) {
  if (goog.isDef(opt_indexOrIndexes)) {
    this.state.removePointState(anychart.PointState.SELECT, opt_indexOrIndexes);
  } else {
    this.state.removePointState(anychart.PointState.SELECT, true);
  }
};


/** @inheritDoc */
anychart.sunburstModule.Chart.prototype.applyAppearanceToPoint = function(pointState, opt_value) {
  this.colorizePoint(pointState);
  this.drawLabel_(pointState);
};


//endregion
//region --- Drill Down
/**
 * Sets roots nodes.
 * @param {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem|
 *          Array.<anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem>} nodes New roots.
 */
anychart.sunburstModule.Chart.prototype.setRootNode = function(nodes) {
  if (!nodes) return;
  this.currentRoots.length = 0;
  if (goog.isArray(nodes))
    Array.prototype.push.apply(this.currentRoots, nodes);
  else
    this.currentRoots.push(nodes);

  this.invalidate(
      anychart.ConsistencyState.BOUNDS |
      anychart.ConsistencyState.CHART_LEGEND |
      anychart.ConsistencyState.SUNBURST_CALCULATIONS |
      anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW);
};


/**
 * Drills one level up from current root node.
 */
anychart.sunburstModule.Chart.prototype.drillUp = function() {
  this.ensureDataPrepared();
  if (!this.currentRoots.length || (this.currentRoots.length == this.treeRoots.length && this.isTreeRoot(this.currentRoots[0])))
    return;

  var newRootNodes = this.getFirstVisibleNodes(this.currentRoots[0].getParent(), true);
  this.setRootNode(newRootNodes);
};


/** @inheritDoc */
anychart.sunburstModule.Chart.prototype.onMouseDown = function(event) {
  var interactivity = this.interactivity();
  if (interactivity.getOption('selectionMode') == anychart.enums.SelectionMode.DRILL_DOWN) {
    if (event['button'] != acgraph.events.BrowserEvent.MouseButton.LEFT) return;

    var tag = anychart.utils.extractTag(event['domTarget']);

    var series, index;
    var isLabels = anychart.utils.instanceOf(event['target'], anychart.core.ui.LabelsFactory);

    if (isLabels) {
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
      iterator.select(/** @type {number} */(index));
      var node = /** @type {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} */ (iterator.getItem());
      var isTreeNode = this.isTreeRoot(node);
      var isRootNode = this.isRootNode(node);
      var drillUpToParent = isRootNode && !isTreeNode;
      var drillUpToTreeRoot = isTreeNode && this.isTreeMultiRoot() && this.currentRoots.length == 1;

      var isDrillUp = drillUpToParent || drillUpToTreeRoot;
      if (isDrillUp) {
        this.doDrillChange(node.getParent());
      } else if (!node.meta('isLeaf')) {
        this.doDrillChange(node);
      } else {
        anychart.sunburstModule.Chart.base(this, 'onMouseDown', event);
      }
    } else {
      anychart.sunburstModule.Chart.base(this, 'onMouseDown', event);
    }
  } else {
    anychart.sunburstModule.Chart.base(this, 'onMouseDown', event);
  }
};


/**
 * Dispatch drill change event.
 * @param {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} node Node in which we are trying to drill.
 * @param {anychart.core.MouseEvent=} opt_event Event object.
 */
anychart.sunburstModule.Chart.prototype.doDrillChange = function(node, opt_event) {
  opt_event = /** @type {anychart.core.MouseEvent} */ (opt_event || {
    'target': this
  });

  var newRootNodes;
  if (node) {
    var isDrillUp = node.meta('depth') < this.currentRoots[0].meta('depth');
    newRootNodes = this.getFirstVisibleNodes(node, isDrillUp);
  } else {
    newRootNodes = this.treeRoots;
  }

  var crumbs = this.createCrumbsTo(node);
  var drillChange = {
    'type': anychart.enums.EventType.DRILL_CHANGE,
    'path': crumbs,
    'current': crumbs[crumbs.length - 1]
  };

  this.unhover();
  this.unselect();
  if (this.prevSelectSeriesStatus) {
    this.dispatchEvent(this.makeInteractivityPointEvent('selected', opt_event, this.prevSelectSeriesStatus, true));
    this.prevSelectSeriesStatus = null;
  }
  if (this.dispatchEvent(drillChange))
    this.setRootNode(newRootNodes);
};


/** @inheritDoc */
anychart.sunburstModule.Chart.prototype.getDrilldownPath = function() {
  this.ensureDataPrepared();
  if (!this.treeRoots)
    return null;
  return this.createCrumbsTo(this.currentRoots[0]);
};


//endregion
//region --- Tooltip
/**
 * Creates tooltip format provider.
 * @return {Object}
 */
anychart.sunburstModule.Chart.prototype.createTooltipContextProvider = function() {
  return this.createFormatProvider();
};


/** @inheritDoc */
anychart.sunburstModule.Chart.prototype.useUnionTooltipAsSingle = function() {
  return true;
};


//endregion
//region --- Sort
/**
 * Desc sort function.
 * @param {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} node1 First node.
 * @param {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} node2 Second node.
 * @return {number}
 * @this {anychart.sunburstModule.Chart}
 */
anychart.sunburstModule.Chart.SORT_DESC = function(node1, node2) {
  var calculationMode = this['calculationMode']();
  var isLeaf1 = !!node1.meta('isLeaf');
  var isLeaf2 = !!node2.meta('isLeaf');

  var value1 = anychart.utils.toNumber(calculationMode == anychart.enums.SunburstCalculationMode.PARENT_INDEPENDENT ?
      isLeaf1 ? node1.get(anychart.sunburstModule.Chart.FieldsName.VALUE) : node1.meta(anychart.sunburstModule.Chart.FieldsName.VISIBLE_LEAVES_SUM) :
      node1.get(anychart.sunburstModule.Chart.FieldsName.VALUE));

  var value2 = anychart.utils.toNumber(calculationMode == anychart.enums.SunburstCalculationMode.PARENT_INDEPENDENT ?
      isLeaf2 ? node2.get(anychart.sunburstModule.Chart.FieldsName.VALUE) : node2.meta(anychart.sunburstModule.Chart.FieldsName.VISIBLE_LEAVES_SUM) :
      node2.get(anychart.sunburstModule.Chart.FieldsName.VALUE));

  return value2 - value1;
};


/**
 * Asc sort function.
 * @param {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} node1 First node.
 * @param {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} node2 Second node.
 * @return {number}
 * @this {anychart.sunburstModule.Chart}
 */
anychart.sunburstModule.Chart.SORT_ASC = function(node1, node2) {
  return -anychart.sunburstModule.Chart.SORT_DESC.call(this, node1, node2);
};


//endregion
//region --- Data
/**
 *  Reset label and marker indexes meta.
 */
anychart.sunburstModule.Chart.prototype.resetIndexMeta = function() {
  for (var i = 0; i < this.linearNodes.length; i++) {
    var node = this.linearNodes[i];
    if (node) {
      node.meta('labelIndex', void 0);
    }
  }
};


/**
 * Resets data variables.
 */
anychart.sunburstModule.Chart.prototype.resetDataVars = function() {
  this.resetIndexMeta();

  this.linearIndex = 0;
  this.linearNodes = [];
  this.drawingNodes = [];
  this.currentRoots.length = 0;
};


//endregion
//region --- Palette
/**
 * Getter/setter for palette.
 * @param {(anychart.palettes.RangeColors|anychart.palettes.DistinctColors|Object|Array.<string>)=} opt_value .
 * @return {!(anychart.palettes.RangeColors|anychart.palettes.DistinctColors|anychart.sunburstModule.Chart)} .
 */
anychart.sunburstModule.Chart.prototype.palette = function(opt_value) {
  if (anychart.utils.instanceOf(opt_value, anychart.palettes.RangeColors)) {
    this.setupPalette_(anychart.palettes.RangeColors, /** @type {anychart.palettes.RangeColors} */(opt_value));
    return this;
  } else if (anychart.utils.instanceOf(opt_value, anychart.palettes.DistinctColors)) {
    this.setupPalette_(anychart.palettes.DistinctColors, /** @type {anychart.palettes.DistinctColors} */(opt_value));
    return this;
  } else if (goog.isObject(opt_value) && opt_value['type'] == 'range') {
    this.setupPalette_(anychart.palettes.RangeColors);
  } else if (goog.isObject(opt_value) || this.palette_ == null)
    this.setupPalette_(anychart.palettes.DistinctColors);

  if (goog.isDef(opt_value)) {
    this.palette_.setup(opt_value);
    return this;
  }

  return /** @type {!(anychart.palettes.RangeColors|anychart.palettes.DistinctColors)} */(this.palette_);
};


/**
 * @param {Function} cls Palette constructor.
 * @param {(anychart.palettes.RangeColors|anychart.palettes.DistinctColors)=} opt_cloneFrom Settings to clone from.
 * @private
 */
anychart.sunburstModule.Chart.prototype.setupPalette_ = function(cls, opt_cloneFrom) {
  if (anychart.utils.instanceOf(this.palette_, cls)) {
    if (opt_cloneFrom)
      this.palette_.setup(opt_cloneFrom);
  } else {
    // we dispatch only if we replace existing palette.
    var doDispatch = !!this.palette_;
    goog.dispose(this.palette_);
    this.palette_ = new cls();
    this.setupCreated('palette', this.palette_);
    this.palette_.restoreDefaults();
    if (opt_cloneFrom)
      this.palette_.setup(opt_cloneFrom);
    this.palette_.listenSignals(this.paletteInvalidated_, this);
    if (doDispatch)
      this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.CHART_LEGEND, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Chart hatch fill palette settings.
 * @param {(Array.<acgraph.vector.HatchFill.HatchFillType>|Object|anychart.palettes.HatchFills)=} opt_value Chart
 * hatch fill palette settings to set.
 * @return {!(anychart.palettes.HatchFills|anychart.sunburstModule.Chart)} Return current chart hatch fill palette or itself
 * for chaining call.
 */
anychart.sunburstModule.Chart.prototype.hatchFillPalette = function(opt_value) {
  if (!this.hatchFillPalette_) {
    this.hatchFillPalette_ = new anychart.palettes.HatchFills();
    this.hatchFillPalette_.listenSignals(this.paletteInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    this.hatchFillPalette_.setup(opt_value);
    return this;
  } else {
    return this.hatchFillPalette_;
  }
};


/**
 * Internal palette invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.sunburstModule.Chart.prototype.paletteInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.CHART_LEGEND, anychart.Signal.NEEDS_REDRAW);
  }
};


//endregion
//region --- Coloring
/**
 * Cache of resolver functions.
 * @type {Object.<string, Function>}
 * @private
 */
anychart.sunburstModule.Chart.colorResolversCache_ = {};


/**
 * Returns a color resolver for passed color names and type.
 * @param {(string|null|boolean)} colorName
 * @param {anychart.enums.ColorType} colorType
 * @param {boolean} canBeHoveredSelected Whether need to resolve hovered selected colors
 * @return {Function}
 */
anychart.sunburstModule.Chart.getColorResolver = function(colorName, colorType, canBeHoveredSelected) {
  if (!colorName) return anychart.color.getNullColor;
  var hash = colorType + '|' + colorName + '|' + canBeHoveredSelected;
  var result = anychart.sunburstModule.Chart.colorResolversCache_[hash];
  if (!result) {
    /** @type {!Function} */
    var normalizerFunc;
    switch (colorType) {
      case anychart.enums.ColorType.STROKE:
        normalizerFunc = anychart.core.settings.strokeOrFunctionSimpleNormalizer;
        break;
      case anychart.enums.ColorType.HATCH_FILL:
        normalizerFunc = anychart.core.settings.hatchFillOrFunctionSimpleNormalizer;
        break;
      default:
      case anychart.enums.ColorType.FILL:
        normalizerFunc = anychart.core.settings.fillOrFunctionSimpleNormalizer;
        break;
    }
    anychart.sunburstModule.Chart.colorResolversCache_[hash] = result = goog.partial(anychart.sunburstModule.Chart.getColor_,
        colorName, normalizerFunc, colorType == anychart.enums.ColorType.HATCH_FILL, canBeHoveredSelected);
  }
  return result;
};


/**
 *
 * @param {string} colorName
 * @param {Function} normalizer
 * @param {boolean} isHatchFill
 * @param {boolean} canBeHoveredSelected Whether need to resolve hovered selected colors
 * @param {anychart.sunburstModule.Chart} chart
 * @param {number} state
 * @param {boolean=} opt_ignorePointSettings
 * @param {(acgraph.vector.Fill|Function)=} opt_baseColor State where target will be get base color.
 * @return {*}
 * @private
 */
anychart.sunburstModule.Chart.getColor_ = function(colorName, normalizer, isHatchFill, canBeHoveredSelected, chart, state, opt_ignorePointSettings, opt_baseColor) {
  var stateColor, context;
  var iterator = chart.getIterator();
  //state = anychart.core.utils.InteractivityState.clarifyState(state);
  if (state != anychart.PointState.NORMAL && canBeHoveredSelected) {
    stateColor = chart.resolveOption(colorName, state, iterator.getItem(), normalizer, false, void 0, opt_ignorePointSettings);
    if (isHatchFill && stateColor === true)
      stateColor = normalizer(chart.getAutoHatchFill());
    if (goog.isDef(stateColor)) {
      if (!goog.isFunction(stateColor))
        return /** @type {acgraph.vector.Fill|acgraph.vector.Stroke|acgraph.vector.PatternFill} */(stateColor);
      else if (isHatchFill) { // hatch fills set as function some why cannot nest by initial implementation
        context = chart.getHatchFillResolutionContext(opt_ignorePointSettings);
        return /** @type {acgraph.vector.PatternFill} */(normalizer(stateColor.call(context, context)));
      }
    }
  }
  // we can get here only if state color is undefined or is a function
  var color = chart.resolveOption(colorName, 0, iterator.getItem(), normalizer, false, void 0, opt_ignorePointSettings);
  var baseColor = goog.isDef(opt_baseColor) ? opt_baseColor : color;

  if (isHatchFill && color === true)
    color = normalizer(chart.getAutoHatchFill());

  if (goog.isFunction(color)) {
    context = isHatchFill ?
        chart.getHatchFillResolutionContext(opt_ignorePointSettings) :
        chart.getColorResolutionContext(/** @type {acgraph.vector.Fill|acgraph.vector.Stroke} */(baseColor), opt_ignorePointSettings);
    context['sourceColor'] = normalizer(context['sourceColor']);

    color = /** @type {acgraph.vector.Fill|acgraph.vector.Stroke|acgraph.vector.PatternFill} */(normalizer(color.call(context, context)));
  }
  if (stateColor) { // it is a function and not a hatch fill here
    context = chart.getColorResolutionContext(
        /** @type {acgraph.vector.Fill|acgraph.vector.Stroke} */(color),
        opt_ignorePointSettings);
    color = normalizer(stateColor.call(context, context));
  }

  if (chart.isRadialGradientMode_(/** @type {acgraph.vector.Fill|acgraph.vector.Stroke} */(color)) && goog.isNull(color.mode)) {
    color.mode = chart.dataBounds_ ? chart.dataBounds_ : null;
  }
  return /** @type {acgraph.vector.Fill|acgraph.vector.Stroke|acgraph.vector.PatternFill} */(color);
};


/** @inheritDoc */
anychart.sunburstModule.Chart.prototype.resolveOption = function(name, state, point, normalizer, scrollerSelected, opt_seriesName, opt_ignorePointSettings) {
  var val;
  var hasHoverState = !!(state & anychart.PointState.HOVER);
  var hasSelectState = !!(state & anychart.PointState.SELECT);

  var stateObject = hasSelectState ? this.selected_ : hasHoverState ? this.hovered_ : this.normal_;
  var path = name.split('.');
  var stateValue = goog.array.reduce(path, function(rval, val) {
    return rval[val]();
  }, stateObject);

  if (opt_ignorePointSettings) {
    val = stateValue;
  } else {
    var pointStateName = hasSelectState ? 'selected' : hasHoverState ? 'hovered' : 'normal';
    var pointStateObject = point.get(pointStateName);
    var pointStateValue = goog.isDef(pointStateObject) ?
        goog.array.reduce(path, function(rval, val) {
          return rval ? rval[val] : rval;
        }, pointStateObject) :
        void 0;

    val = anychart.utils.getFirstDefinedValue(
        pointStateValue,
        point.get(anychart.color.getPrefixedColorName(state, name)),
        stateValue);
  }
  if (goog.isDef(val))
    val = normalizer(val);
  return val;
};


/** @inheritDoc */
anychart.sunburstModule.Chart.prototype.getAutoHatchFill = function() {
  var iterator = this.getIterator();
  var item = iterator.getItem();
  var pathFromRoot = item.meta('pathFromRoot');
  var parent = pathFromRoot.length > 1 ? pathFromRoot[pathFromRoot.length - 2] : null;
  var depth = item.meta('depth');

  var index;
  if (this.isTreeMultiRoot()) {
    index = goog.array.indexOf(this.treeRoots, item);
    if (index < 0) {
      index = goog.array.indexOf(this.treeRoots, pathFromRoot[0]);
    }
  } else {
    var root = this.treeRoots[0];
    if (root == item) {
      index = 0;
    } else {
      var children = root.getChildren();
      index = goog.array.indexOf(children, pathFromRoot[1]) + 1;
    }
  }

  var palette = this.hatchFillPalette();
  var autoHatchFill = palette.itemAt(index);

  var parenHatchFill;
  if (parent) {
    parenHatchFill = parent.meta('hatchFill');
  } else {
    parenHatchFill = autoHatchFill;
  }

  var sunburstHatchFill;
  if (parent) {
    if (!this.isTreeMultiRoot()) {
      sunburstHatchFill = depth == 1 ? autoHatchFill : parenHatchFill;
    } else {
      sunburstHatchFill = parent.meta('hatchFill');
    }
  } else {
    sunburstHatchFill = autoHatchFill;
  }

  return /** @type {acgraph.vector.HatchFill} */(sunburstHatchFill || anychart.sunburstModule.Chart.DEFAULT_HATCH_FILL_TYPE);
};


/** @inheritDoc */
anychart.sunburstModule.Chart.prototype.getHatchFillResolutionContext = function(opt_ignorePointSettings) {
  var iterator = this.getIterator();
  var item = iterator.getItem();
  var pointIndex = item.meta('index');
  var palette = this.hatchFillPalette();
  var depth = item.meta('depth');

  var pointHatchFill;
  if (!opt_ignorePointSettings) {
    pointHatchFill = item.get('hatchFill');
  }

  var pathFromRoot = item.meta('pathFromRoot');
  var parent = pathFromRoot.length > 1 ? pathFromRoot[pathFromRoot.length - 2] : null;
  var mainParent = this.getMainParent(item);

  var index;
  if (this.isTreeMultiRoot()) {
    index = goog.array.indexOf(this.treeRoots, item);
    if (index < 0) {
      index = goog.array.indexOf(this.treeRoots, pathFromRoot[0]);
    }
  } else {
    var root = this.treeRoots[0];
    if (root == item) {
      index = 0;
    } else {
      var children = root.getChildren();
      index = goog.array.indexOf(children, pathFromRoot[1]) + 1;
    }
  }

  var autoHatchFill = palette.itemAt(index);

  var mainColor;
  if (mainParent != item) {
    mainColor = mainParent.meta('hatchFill');
  } else {
    mainColor = autoHatchFill;
  }

  var parenHatchFill;
  if (parent) {
    parenHatchFill = parent.meta('hatchFill');
  } else {
    parenHatchFill = autoHatchFill;
  }

  var sunburstHatchFill;
  if (parent) {
    if (!this.isTreeMultiRoot()) {
      sunburstHatchFill = depth == 1 ? autoHatchFill : parenHatchFill;
    } else {
      sunburstHatchFill = parent.meta('hatchFill');
    }
  } else {
    sunburstHatchFill = autoHatchFill;
  }

  return {
    'index': iterator.getIndex(),
    'level': item.meta('depth'),
    'isLeaf': item.numChildren() == 0,
    'parent': parent,
    'point': this.getPoint(pointIndex),
    'path': pathFromRoot,
    'mainColor': mainColor,
    'autoColor': autoHatchFill,
    'parentColor': parenHatchFill,
    'sourceHatchFill': pointHatchFill || sunburstHatchFill || anychart.sunburstModule.Chart.DEFAULT_HATCH_FILL_TYPE,
    'iterator': iterator,
    'series': this,
    'chart': this
  };
};


/**
 * Identifies fill or stroke as radial gradient.
 * @param {(acgraph.vector.Fill|acgraph.vector.Stroke)} fillOrStroke Fill or stroke.
 * @return {boolean} is fill or stroke radial gradient.
 * @private
 */
anychart.sunburstModule.Chart.prototype.isRadialGradientMode_ = function(fillOrStroke) {
  return goog.isObject(fillOrStroke) && fillOrStroke.hasOwnProperty('mode') && fillOrStroke.hasOwnProperty('cx');
};


/** @inheritDoc */
anychart.sunburstModule.Chart.prototype.getColorResolutionContext = function(opt_baseColor, opt_ignorePointSettings, opt_ignoreColorScale) {
  var iterator = this.getIterator();
  var item = iterator.getItem();
  var pointIndex = item.meta('index');
  var palette = this.palette();
  var depth = item.meta('depth');

  var pointFill;
  if (!opt_ignorePointSettings) {
    pointFill = item.get('fill');
  }

  var pathFromRoot = item.meta('pathFromRoot');
  var parent = pathFromRoot.length > 1 ? pathFromRoot[pathFromRoot.length - 2] : null;
  var mainParent = this.getMainParent(item);

  var index;
  if (this.isTreeMultiRoot()) {
    index = goog.array.indexOf(this.treeRoots, item);
    if (index < 0) {
      index = goog.array.indexOf(this.treeRoots, pathFromRoot[0]);
    }
  } else {
    var root = this.treeRoots[0];
    if (root == item) {
      index = 0;
    } else {
      var children = root.getChildren();
      index = goog.array.indexOf(children, pathFromRoot[1]) + 1;
    }
  }

  var autoColor = palette.itemAt(index);

  var mainColor;
  if (mainParent != item) {
    mainColor = mainParent.meta('fill');
  } else {
    mainColor = opt_baseColor || autoColor;
  }

  var parentColor;
  if (parent) {
    parentColor = parent.meta('fill');
  } else {
    parentColor = opt_baseColor || autoColor;
  }

  var sunburstColor;
  if (parent) {
    if (!this.isTreeMultiRoot()) {
      sunburstColor = depth == 1 ? autoColor : parentColor;
    } else {
      sunburstColor = parent.meta('fill');
    }
  } else {
    sunburstColor = autoColor;
  }

  return {
    'index': iterator.getIndex(),
    'level': item.meta('depth'),
    'isLeaf': item.numChildren() == 0,
    'parent': parent,
    'point': this.getPoint(pointIndex),
    'path': pathFromRoot,
    'mainColor': mainColor,
    'autoColor': autoColor,
    'parentColor': parentColor,
    'sourceColor': opt_baseColor || pointFill || sunburstColor || palette.itemAt(0),
    'iterator': iterator,
    'series': this,
    'chart': this
  };
};


/**
 * Gets final normalized fill or stroke color.
 * @param {acgraph.vector.Fill|acgraph.vector.Stroke|Function|boolean} color Normal state color.
 * @param {...(acgraph.vector.Fill|acgraph.vector.Stroke|Function)} var_args .
 * @return {!(acgraph.vector.Fill|acgraph.vector.Stroke)} Normalized color.
 * @protected
 */
anychart.sunburstModule.Chart.prototype.normalizeColor = function(color, var_args) {
  var fill;
  var index = this.getIterator().getIndex();
  var sourceColor, scope;
  if (goog.isFunction(color)) {
    sourceColor = arguments.length > 1 ?
        this.normalizeColor.apply(this, goog.array.slice(arguments, 1)) :
        this.palette().itemAt(index);
    scope = {
      'index': index,
      'sourceColor': sourceColor
    };
    fill = color.call(scope);
  } else
    fill = color;
  return fill;
};


/**
 * @param {number} pointState
 * @return {acgraph.vector.Stroke}
 * @private
 */
anychart.sunburstModule.Chart.prototype.getStroke_ = function(pointState) {
  var strokeResolver = anychart.sunburstModule.Chart.getColorResolver('stroke', anychart.enums.ColorType.STROKE, true);
  var strokeColor = strokeResolver(this, pointState, false, null);

  if (!pointState)
    this.getIterator().getItem().meta('stroke', strokeColor);

  return strokeColor;
};

/**
 * Extracts stateful coloring for exact data item and puts it to meta.
 *
 * @private
 */
anychart.sunburstModule.Chart.prototype.extractStateColor_ = function() {
  // ..**^^ Stateful coloring magic starts here ^^**..
  var item = this.getIterator().getItem();
  var statefulFill = null;
  var statefulName = null;
  if (this.statefulColoring_) {
    // TODO (A.Kudryavtsev): Can we move these calculations to StatefulColoring somehow?
    var colors = this.statefulColoring_.colors;
    if (colors) {
      var checkers = this.statefulColoring_.checkers;
      if (checkers) {
        var state = this.statefulColoring_.state;
        for (var i = 0; i < checkers.length; i++) {
          var checker = checkers[i];
          var res = checker(item, state);
          if (res && res in colors) {
            statefulFill = colors[res];
            statefulName = res;
          }
        }
      }
    }
  }

  // Used to set fill.
  item.meta('statefulFill', statefulFill);

  // Used to get path from stateful coloring paths cache.
  item.meta('statefulName', statefulName);

  // ..**^^ Stateful coloring magic ends here ^^**..
};


/**
 * @param {number} pointState
 * @return {acgraph.vector.Fill}
 * @private
 */
anychart.sunburstModule.Chart.prototype.getFill_ = function(pointState) {
  var fillResolver = anychart.sunburstModule.Chart.getColorResolver('fill', anychart.enums.ColorType.FILL, true);
  var fillColor = fillResolver(this, pointState, false, null);

  if (!pointState)
    this.getIterator().getItem().meta('fill', fillColor);

  return fillColor;
};


/**
 * @param {number} pointState
 * @return {acgraph.vector.Fill}
 * @private
 */
anychart.sunburstModule.Chart.prototype.getHatchFill_ = function(pointState) {
  var hatchFillResolver = anychart.sunburstModule.Chart.getColorResolver('hatchFill', anychart.enums.ColorType.HATCH_FILL, true);
  var hatchFillColor = hatchFillResolver(this, pointState, false, null);

  if (!pointState)
    this.getIterator().getItem().meta('hatchFill', hatchFillColor);

  return hatchFillColor || null;
};


/**
 * Colorizes shape in accordance to current slice colorization settings.
 * Shape is get from current meta 'shape'.
 * @param {anychart.PointState|number} pointState Point state.
 * @protected
 */
anychart.sunburstModule.Chart.prototype.colorizePoint = function(pointState) {
  var iterator = this.getIterator();
  var path = /** @type {acgraph.vector.Path} */(iterator.meta('path'));

  //needs here for children resolve colors
  var fill = this.getFill_(pointState);
  var stroke = this.getStroke_(pointState);
  var hatchFill = this.getHatchFill_(pointState);

  if (goog.isDef(path)) {
    path.fill(fill);
    path.stroke(stroke);

    var hatchPath = /** @type {acgraph.vector.Path} */(iterator.meta('hatchPath'));
    if (hatchFill || hatchPath) {
      if (!hatchPath) {
        hatchPath = this.hatchLayer_.genNextChild();
        iterator.meta('hatchPath', hatchPath);
      }
      hatchPath.clear().deserialize(path.serializePathArgs());
      hatchPath
          .stroke(null)
          .fill(hatchFill);
    }
  }
};


/**
 * Stateful coloring getter.
 * Internal QLIK-specific feature, no need to work like getter/setter.
 *
 * @return {anychart.core.StatefulColoring}
 */
anychart.sunburstModule.Chart.prototype.statefulColoring = function() {
  if (!this.statefulColoring_) {
    this.statefulColoring_ = new anychart.core.StatefulColoring();
    this.statefulColoring_.listen(anychart.enums.EventType.STATE_CHANGE, function() {
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }, void 0, this);
  }
  return this.statefulColoring_;
};


//endregion
//region --- Center content
/**
 * Chart center settings.
 *
 * @param {Object=} opt_value
 * @return {anychart.sunburstModule.Chart|anychart.core.ui.Center}
 */
anychart.sunburstModule.Chart.prototype.center = function(opt_value) {
  if (!this.center_) {
    this.center_ = new anychart.core.ui.Center(this);
    this.center_.listenSignals(this.centerInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    this.center_.setup(opt_value);
    return this;
  }

  return this.center_;
};


/**
 * Pie center signal listener.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.sunburstModule.Chart.prototype.centerInvalidated_ = function(event) {
  var state = 0, signal = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state |= anychart.ConsistencyState.APPEARANCE;
    signal |= anychart.Signal.NEEDS_REDRAW;
  }

  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state |= anychart.ConsistencyState.SUNBURST_CENTER_CONTENT | anychart.ConsistencyState.BOUNDS;
    signal |= anychart.Signal.NEEDS_REDRAW;
  }

  this.invalidate(state, signal);
};


/** @inheritDoc */
anychart.sunburstModule.Chart.prototype.acgraphElementsListener = function() {
  var ccbb = this.center_.realContent.getBounds();

  if (!anychart.math.Rect.equals(ccbb, this.contentBoundingBox_)) {
    this.transformCenterContent(ccbb);
  }
};


/** @inheritDoc */
anychart.sunburstModule.Chart.prototype.chartsListener = function() {
  this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
};


//endregion
//region --- Labels
/**
 * Internal label invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 */
anychart.sunburstModule.Chart.prototype.labelsInvalidated = function(event) {
  var state = 0, signal = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state |= anychart.ConsistencyState.APPEARANCE;
    signal |= anychart.Signal.NEEDS_REDRAW;
  }

  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state |= anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.APPEARANCE;
    signal |= anychart.Signal.BOUNDS_CHANGED | anychart.Signal.NEEDS_REDRAW;
  }

  this.invalidate(state, signal);
};


/**
 *
 * @param {anychart.core.ui.LabelsFactory.Label} label .
 * @return {anychart.math.Rect}
 */
anychart.sunburstModule.Chart.prototype.getLabelBounds = function(label) {
  if (!this.labelsBoundsCache_) this.labelsBoundsCache_ = [];
  var index = label.getIndex();
  if (!this.labelsBoundsCache_[index])
    this.labelsBoundsCache_[index] = anychart.math.Rect.fromCoordinateBox(this.normal_.labels().measureWithTransform(label));

  return this.labelsBoundsCache_[index];
};


/**
 * Drop label bounds cache.
 * @param {anychart.core.ui.LabelsFactory.Label} label Label to drop bounds.
 */
anychart.sunburstModule.Chart.prototype.dropLabelBoundsCache = function(label) {
  var index = label.getIndex();
  if (this.labelsBoundsCache_) {
    this.labelsBoundsCache_[index] = null;
  }
};


//endregion
//region --- Levels
/**
 * Levels settings.
 * @param {number} index .
 * @param {(Object|boolean)=} opt_value .
 * @return {anychart.sunburstModule.Chart|anychart.sunburstModule.Level}
 */
anychart.sunburstModule.Chart.prototype.level = function(index, opt_value) {
  if (goog.isDef(index)) {
    index = anychart.utils.toNumber(index);
    if (isNaN(index))
      return this;

    var levels;
    if (index >= 0) {
      levels = this.levelsPositive_;
    } else {
      levels = this.levelsNegative_;
      index = Math.abs(index) - 1;
    }
    var level = levels[index];
    if (!level) {
      level = levels[index] = new anychart.sunburstModule.Level(this);
      level.setupInternal(true, anychart.getFullTheme('sunburst.level'));
      level.listenSignals(this.levelListener_, this);
    }
    if (goog.isDef(opt_value)) {
      level.setup(opt_value);
      return this;
    } else {
      return level;
    }
  } else {
    return this;
  }
};


/**
 * Settings fot leaves of sunburst dataTree model.
 * @param {(Object|boolean)=} opt_value .
 * @return {anychart.sunburstModule.Chart|anychart.sunburstModule.Level}
 */
anychart.sunburstModule.Chart.prototype.leaves = function(opt_value) {
  if (!this.leavesLevel_) {
    this.leavesLevel_ = new anychart.sunburstModule.Level(this);
    this.leavesLevel_.setupInternal(true, anychart.getFullTheme('sunburst.level'));
    this.leavesLevel_.listenSignals(this.levelListener_, this);
  }

  if (goog.isDef(opt_value)) {
    this.leavesLevel_.setup(opt_value);
    return this;
  }

  return this.leavesLevel_;
};


/**
 *
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.sunburstModule.Chart.prototype.levelListener_ = function(event) {
  this.invalidate(
      anychart.ConsistencyState.BOUNDS |
      anychart.ConsistencyState.APPEARANCE |
      anychart.ConsistencyState.SUNBURST_CALCULATIONS,
      anychart.Signal.NEEDS_REDRAW);
};


//endregion
//region --- Bounds
/**
 * Calculating common values for a pie plot.
 * @param {anychart.math.Rect} bounds Bounds of the content area.
 * @private
 */
anychart.sunburstModule.Chart.prototype.calculateBounds_ = function(bounds) {
  this.minWidthHeight_ = Math.min(bounds.width, bounds.height);

  this.dataPlotBounds_ = bounds.clone();

  // var ___name = 'ppb';
  // if (!this[___name]) this[___name] = this.container().rect().zIndex(1000);
  // this[___name].setBounds(this.dataPlotBounds_);

  this.radiusValue_ = Math.min(this.minWidthHeight_ / 2, Math.max(anychart.utils.normalizeSize(/** @type {number|string} */ (this.getOption('radius')), this.minWidthHeight_), 0));

  this.originalRadiusValue_ = this.radiusValue_;

  this.cx = this.dataPlotBounds_.left + this.dataPlotBounds_.width / 2;
  this.cy = this.dataPlotBounds_.top + this.dataPlotBounds_.height / 2;

  this.updateBounds();
};


/**
 * Update bounds.
 */
anychart.sunburstModule.Chart.prototype.updateBounds = function() {
  var innerRadius = /** @type {Function|string|number} */ (this.getOption('innerRadius'));
  this.innerRadiusValue_ = Math.max(Math.floor(goog.isFunction(innerRadius) ?
      innerRadius(this.radiusValue_) :
      anychart.utils.normalizeSize(innerRadius, this.radiusValue_)), 0);

  var innerRectSide = this.innerRadiusValue_ / Math.pow(2, .5) * 2;
  var x = this.cx - innerRectSide / 2;
  var y = this.cy - innerRectSide / 2;
  this.centerContentBounds = anychart.math.rect(x, y, innerRectSide, innerRectSide);

  /**
   * Bounds of pie. (Not bounds of content area).
   * Need for radial gradient to set correct bounds.
   * @type {anychart.math.Rect}
   * @private
   */
  this.dataBounds_ = new anychart.math.Rect(
      this.cx - this.radiusValue_,
      this.cy - this.radiusValue_,
      this.radiusValue_ * 2,
      this.radiusValue_ * 2);

  // var ___name = 'db';
  // if (!this[___name]) this[___name] = this.container().rect().zIndex(1000);
  // this[___name].setBounds(this.dataBounds_);

  this.calculateLevelsThickness();

  var labels = this.normal_.labels();
  labels.suspendSignalsDispatching();
  labels.cx(this.cx);
  labels.cy(this.cy);
  labels.parentRadius(this.radiusValue_);
  labels.startAngle(/** @type {number} */ (this.getStartAngle()));
  labels.sweepAngle(360);
  labels.parentBounds(this.dataBounds_);
  labels.resumeSignalsDispatching(false);

  this.hovered().labels()
      .parentBounds(this.dataBounds_);
};


//endregion
//region --- Drawing
/**
 * Change center content transformation.
 * @param {anychart.math.Rect} contentBoundingBox .
 */
anychart.sunburstModule.Chart.prototype.transformCenterContent = function(contentBoundingBox) {
  this.contentBoundingBox_ = contentBoundingBox;

  var ratio = Math.min(this.centerContentBounds.width / this.contentBoundingBox_.width,
      this.centerContentBounds.height / this.contentBoundingBox_.height);
  if (!isFinite(ratio))
    ratio = 0;

  var txCenterContentWidth = ratio * this.contentBoundingBox_.width;
  var txCenterContentHeight = ratio * this.contentBoundingBox_.height;

  var dx = (this.centerContentBounds.left - this.contentBoundingBox_.left * ratio) + (this.centerContentBounds.width - txCenterContentWidth) / 2;
  var dy = (this.centerContentBounds.top - this.contentBoundingBox_.top * ratio) + (this.centerContentBounds.height - txCenterContentHeight) / 2;

  this.center_.contentLayer.setTransformationMatrix(ratio, 0, 0, ratio, dx, dy);
};


/**
 * Calculating tree levels appearance settings.
 */
anychart.sunburstModule.Chart.prototype.calculateTreeLevelsAppearanceSettings = function() {
  var levels = this.currentLevels;
  this.currentFirstVisibleLevel = NaN;
  this.visibleLevels = [];
  var depth;
  for (depth = 0; depth <= this.treeMaxDepth; depth++) {
    var positiveLevel = this.levelsPositive_[depth];
    var negativeLevel = this.levelsNegative_[this.treeMaxDepth - depth];
    var level = levels[depth] ? levels[depth] : levels[depth] = {};

    var display = true;
    var levelThickness = NaN;
    var enabled, thickness;
    if (positiveLevel) {
      enabled = positiveLevel.getOption('enabled');
      thickness = positiveLevel.getOption('thickness');

      display = goog.isDefAndNotNull(enabled) ? !!enabled : display;
      levelThickness = goog.isDefAndNotNull(thickness) ? thickness : levelThickness;
    }

    if (negativeLevel) {
      enabled = negativeLevel.getOption('enabled');
      thickness = negativeLevel.getOption('thickness');

      display = goog.isDefAndNotNull(enabled) ? !!enabled : display;
      levelThickness = goog.isDefAndNotNull(thickness) ? thickness : levelThickness;
    }

    level.display = display;
    level.thicknessValue = levelThickness;

    if (display) {
      this.visibleLevels.push(depth);
    }
  }
};


/**
 * Calculating statistics fot hidden levels.
 */
anychart.sunburstModule.Chart.prototype.calculateStatsForHiddenLevels = function() {
  if (this.visibleLevels.length == this.treeMaxDepth + 1)
    return;

  var leavesEnabled = /** @type {boolean|null} */(this.leaves().getOption('enabled'));
  leavesEnabled = goog.isDefAndNotNull(leavesEnabled) ? leavesEnabled : true;

  for (var depth = 0; depth < this.treeMaxDepth; depth++) {
    var level = this.currentLevels[depth];
    if (!level)
      continue;

    var nextVisibleLevelIndex = goog.array.findIndex(this.visibleLevels, function(levelIndex) {
      return levelIndex > depth;
    });
    var nextVisibleLevelDepth = this.visibleLevels[nextVisibleLevelIndex];
    var nextVisibleLevel = this.currentLevels[nextVisibleLevelDepth];

    goog.object.forEach(level.statsByRoot, function(rootStats, rootIndex) {
      var nextVisibleLevelStats = nextVisibleLevel ? nextVisibleLevel.statsByRoot[rootIndex] : null;
      for (var i = 0; i < rootStats.nodes.length; i++) {
        var node = rootStats.nodes[i];

        var children = node.getChildren();
        var attendingOnNextVisLevel = [];

        if (nextVisibleLevelStats) {
          var nextVisibleLevelNodes = nextVisibleLevelStats.nodes;

          for (var j = 0; j < nextVisibleLevelNodes.length; j++) {
            var nextVisibleLevelNode = nextVisibleLevelNodes[j];
            if (nextVisibleLevelNode.meta('isLeaf') && !leavesEnabled)
              continue;

            var pathFromRoot = nextVisibleLevelNode.meta('pathFromRoot');

            var parent = pathFromRoot[depth + 1];
            if (parent && goog.array.contains(children, parent) && !goog.array.contains(attendingOnNextVisLevel, parent)) {
              attendingOnNextVisLevel.push(parent);
            }
          }
        }

        node.meta('attendingOnNextVisLevel', attendingOnNextVisLevel);
      }
    });
  }
};


/**
 * Calculating leaves thickness.
 */
anychart.sunburstModule.Chart.prototype.calculateLevelsThickness = function() {
  this.sunburstThickness = this.radiusValue_ - this.innerRadiusValue_;
  this.visibleLevelsCount = 0;
  this.levelsCountWithAutoThickness = 0;
  this.spaceForAutoThickness = this.sunburstThickness;

  var leaves = this.leaves();
  var leavesEnabled = /** @type {boolean} */(leaves.getOption('enabled'));
  leavesEnabled = goog.isDefAndNotNull(leavesEnabled) ? leavesEnabled : true;
  var leavesThickness = /** @type {number|string} */(leaves.getOption('thickness'));
  leavesThickness = anychart.utils.normalizeSize(leavesThickness, this.sunburstThickness);

  var lastVisibleLevelWithLeaves = -1;
  var level, leavesCount;

  var currentRootDepth = this.currentRootDepth;
  var currentMaxDepth = this.currentMaxDepth;
  var max = currentMaxDepth + currentRootDepth;

  for (var depth = currentRootDepth; depth <= max; depth++) {
    level = this.currentLevels[depth];
    leavesCount = level.leavesCount;
    level.thickness = Math.min(anychart.utils.normalizeSize(level.thicknessValue, this.sunburstThickness), this.sunburstThickness);

    var levelDisabledByLeaves = level.branchesCount == 0 && !leavesEnabled;
    if (level.display && !levelDisabledByLeaves) {
      if (leavesCount > 0)
        lastVisibleLevelWithLeaves = depth;

      this.visibleLevelsCount++;
      if (isNaN(level.thickness))
        this.levelsCountWithAutoThickness++;
    }

    if (level.display && !isNaN(level.thickness)) {
      this.spaceForAutoThickness -= level.thickness;
    }
  }

  this.levelAutoThickness = Math.floor(this.spaceForAutoThickness / this.levelsCountWithAutoThickness);

  //fix thickness relative leaves thickness
  if (leavesEnabled != false && !isNaN(leavesThickness)) {
    var fullThickness = 0;
    var levelsCountWithAutoThicknessAfter = 0;

    for (depth = currentRootDepth; depth <= lastVisibleLevelWithLeaves; depth++) {
      level = this.currentLevels[depth];
      if (level.display) {
        if (depth == lastVisibleLevelWithLeaves) {
          var currentLevelThickness = level.branchesCount && depth != max ?
              isNaN(level.thickness) ? this.levelAutoThickness : level.thickness : 0;
          fullThickness += Math.max(leavesThickness, currentLevelThickness);
        } else {
          if (isNaN(level.thickness)) {
            levelsCountWithAutoThicknessAfter++;
            fullThickness += this.levelAutoThickness;
          } else {
            fullThickness += level.thickness;
          }
        }
      }
    }

    if (levelsCountWithAutoThicknessAfter)
      this.levelAutoThickness -= (fullThickness - this.sunburstThickness) / levelsCountWithAutoThicknessAfter;
  }
};


/**
 *
 * @param {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} node .
 * @param {Object} levelsObj .
 */
anychart.sunburstModule.Chart.prototype.extendLevelStats = function(node, levelsObj) {
  var value = anychart.utils.toNumber(node.get(anychart.sunburstModule.Chart.FieldsName.VALUE));
  var depth = node.meta('depth');
  var root = node.meta('pathFromRoot')[0];
  var rootIndex = goog.array.indexOf(this.treeRoots, root);
  var isLeaf = !node.numChildren();
  var leavesEnabled = this.leaves().getOption('enabled');
  leavesEnabled = goog.isDefAndNotNull(leavesEnabled) ? !!leavesEnabled : true;

  var level = levelsObj[depth] ? levelsObj[depth] : levelsObj[depth] = {};
  level.sum = (level.sum || 0) + (isLeaf ? leavesEnabled ? value  : 0 : value);
  level.nodesCount = (level.nodesCount || 0) + 1;
  level.leavesCount = (level.leavesCount || 0) + (isLeaf && leavesEnabled ? 1 : 0);
  level.branchesCount = (level.branchesCount || 0) + (isLeaf ? 0 : 1);

  if (!level.attendingRoots)
    level.attendingRoots = [];

  if (goog.array.indexOf(level.attendingRoots, rootIndex) == -1 && (level.branchesCount != 0 || leavesEnabled))
    level.attendingRoots.push(rootIndex);

  var statsByRoot = level.statsByRoot ? level.statsByRoot : level.statsByRoot = {};
  var rootStats = statsByRoot[rootIndex] ? statsByRoot[rootIndex] : statsByRoot[rootIndex] = {};

  rootStats.sum = (rootStats.sum || 0) + (isLeaf ? leavesEnabled ? value  : 0 : value);
  rootStats.nodesCount = (rootStats.nodesCount || 0) + 1;
  rootStats.leavesCount = (rootStats.leavesCount || 0) + (isLeaf && leavesEnabled ? 1 : 0);
  rootStats.branchesCount = (rootStats.branchesCount || 0) + (isLeaf && leavesEnabled ? 0 : 1);

  rootStats.childSum = (rootStats.childSum || 0) + node.meta(anychart.sunburstModule.Chart.FieldsName.CHILDREN_SUM);
  rootStats.leavesSum = (rootStats.leavesSum || 0) + node.meta(anychart.sunburstModule.Chart.FieldsName.LEAVES_SUM);

  rootStats.nodes = rootStats.nodes ? rootStats.nodes : rootStats.nodes = [];
  rootStats.nodes.push(node);
};


/**
 * @param {anychart.treeDataModule.Tree|anychart.treeDataModule.View|anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} node Node which value will be calculated.
 * @param {number} depth Current depth.
 * @return {number} .
 */
anychart.sunburstModule.Chart.prototype.calcDepth = function(node, depth) {
  var result, child, i;
  var nodeMaxDepth = 0;
  var numChildren = node.numChildren();

  if (anychart.utils.instanceOf(node, anychart.treeDataModule.Tree) || anychart.utils.instanceOf(node, anychart.treeDataModule.View)) {
    for (i = 0; i < numChildren; i++) {
      child = /** @type {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} */(node.getChildAt(i));
      child
          .meta('pathFromRoot', [child]);

      result = this.calcDepth(child, depth);
      nodeMaxDepth = Math.max(nodeMaxDepth, result);
    }
  } else {
    var index = this.linearIndex++;
    node
        .meta('index', index)
        .meta('depth', depth)
        .meta('isLeaf', !numChildren);

    var parent = node.getParent();
    var pathFromRoot;
    if (parent) {
      pathFromRoot = goog.array.clone(/** @type {Array} */(parent.meta('pathFromRoot')));
      pathFromRoot.push(node);
      node.meta('pathFromRoot', pathFromRoot);
    }

    this.linearNodes[index] = /** @type {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} */(node);
    this.drawingNodes[index] = /** @type {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} */(node);

    if (numChildren) {
      for (i = 0; i < numChildren; i++) {
        child = /** @type {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} */(node.getChildAt(i));
        result = this.calcDepth(child, depth + 1);
        nodeMaxDepth = Math.max(nodeMaxDepth, result);
      }
      nodeMaxDepth += 1;
    }

    node.meta('nodeMaxDepth', nodeMaxDepth);
  }

  return nodeMaxDepth;
};


/**
 * Recursively calculates node values from leafs (node without children) up to root.
 * If leaf has no value - than set it to 0.
 * @param {anychart.treeDataModule.Tree|anychart.treeDataModule.View|anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} node Node which value will be calculated.
 * @return {Object} Object of statistics.
 */
anychart.sunburstModule.Chart.prototype.calculateNodes = function(node) {
  var result, child, i;
  var leavesSum = 0;
  var totalLeavesCount = 0;
  var childSum = 0;
  var visibleLeavesSum = 0;

  var numChildren = node.numChildren();

  if (anychart.utils.instanceOf(node, anychart.treeDataModule.Tree) || anychart.utils.instanceOf(node, anychart.treeDataModule.View)) {
    for (i = 0; i < numChildren; i++) {
      child = /** @type {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} */(node.getChildAt(i));
      result = this.calculateNodes(child);

      leavesSum += result.leavesSum;
      totalLeavesCount += result.totalLeavesCount;
      childSum += result.childSum;
    }
  } else {
    var value, type;

    if (numChildren) {
      var childrenLeavesCount = 0;
      for (i = 0; i < numChildren; i++) {
        child = /** @type {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} */(node.getChildAt(i));
        result = this.calculateNodes(child);

        leavesSum += result.leavesSum;
        totalLeavesCount += result.totalLeavesCount;
        childSum += result.childSum;
        visibleLeavesSum += result.visibleLeavesSum;
        if (child.meta('isLeaf'))
          childrenLeavesCount++;
      }
      value = anychart.utils.toNumber(node.get(anychart.sunburstModule.Chart.FieldsName.VALUE));
      type = anychart.treeChartBase.Chart.NodeType.VERTEX;

      node.meta(anychart.sunburstModule.Chart.FieldsName.LEAVES_COUNT, totalLeavesCount);
      node.meta(anychart.sunburstModule.Chart.FieldsName.CHILDREN_LEAVES_COUNT, childrenLeavesCount);
    } else {
      var depth = /** @type {number} */(node.meta('depth'));
      var isVisibleLevel = goog.array.contains(this.visibleLevels, depth);
      value = anychart.utils.toNumber(node.get(anychart.sunburstModule.Chart.FieldsName.VALUE)) || 0;
      leavesSum = value;
      type = anychart.treeChartBase.Chart.NodeType.LEAF;

      if (isVisibleLevel) {
        totalLeavesCount = 1;
        visibleLeavesSum = value;
        node.meta(anychart.sunburstModule.Chart.FieldsName.LEAVES_COUNT, 1);
      } else {
        totalLeavesCount = 0;
        visibleLeavesSum = 0;
        node.meta(anychart.sunburstModule.Chart.FieldsName.LEAVES_COUNT, 0);
      }

      node.meta(anychart.sunburstModule.Chart.FieldsName.CHILDREN_LEAVES_COUNT, 1);
    }

    node.meta(anychart.sunburstModule.Chart.FieldsName.META_VALUE, value);
    node.meta(anychart.sunburstModule.Chart.FieldsName.LEAVES_SUM, leavesSum);
    node.meta(anychart.sunburstModule.Chart.FieldsName.CHILDREN_SUM, childSum);
    node.meta(anychart.sunburstModule.Chart.FieldsName.VISIBLE_LEAVES_SUM, visibleLeavesSum);
    node.meta(anychart.sunburstModule.Chart.FieldsName.TYPE, type);

    this.extendLevelStats(/** @type {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} */(node), this.currentLevels);

    childSum = value;
  }

  return {
    childSum: childSum,
    leavesSum: leavesSum,
    totalLeavesCount: totalLeavesCount,
    visibleLeavesSum: visibleLeavesSum
  };
};


/**
 * Prepares tree data for treeMap.
 */
anychart.sunburstModule.Chart.prototype.ensureDataPrepared = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.TREE_DATA)) {
    this.resetDataVars();

    var data = /** @type {anychart.treeDataModule.Tree|anychart.treeDataModule.View} */(this.data());
    if (data) {
      this.currentLevels = {};

      this.getResetIterator();

      this.treeRoots = data.getChildren();
      this.currentRoots = goog.array.slice(this.treeRoots, 0);

      this.treeMaxDepth = this.calcDepth(data, 0);

      if (this.currentRoots.length) {
        this.currentRootDepth = this.currentRoots[0].meta('depth');
        this.currentMaxDepth = this.currentRootDepth || this.currentRoots.length == 1 ?
            this.currentRoots[0].meta('nodeMaxDepth') :
            this.treeMaxDepth;
      } else {
        this.currentRootDepth = 0;
        this.currentMaxDepth = 0;
      }

      this.calculateTreeLevelsAppearanceSettings();
      this.currentFirstVisibleLevel = this.visibleLevels[0];

      this.calculateNodes(data);
      this.calculateStatsForHiddenLevels();

      this.statistics('treeMaxDepth', this.treeMaxDepth);

      var levels = this.cloneLevels(this.currentLevels);
      this.statistics('levels', levels);
      this.statistics('currentMaxDepth', this.currentMaxDepth);
      this.statistics('currentRootDepth', this.currentRootDepth);
    }

    this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.BOUNDS);
    this.markConsistent(anychart.ConsistencyState.TREE_DATA | anychart.ConsistencyState.SUNBURST_CALCULATIONS);
  }
};


/**
 * Calculate data and scale.
 */
anychart.sunburstModule.Chart.prototype.calculate = function() {
  this.ensureDataPrepared();

  if (this.hasInvalidationState(anychart.ConsistencyState.SUNBURST_CALCULATIONS)) {
    if (this.currentRoots.length) {
      this.currentRootDepth = this.currentRoots[0].meta('depth');
      this.currentMaxDepth = this.currentRootDepth || this.currentRoots.length == 1 ?
          this.currentRoots[0].meta('nodeMaxDepth') :
          this.treeMaxDepth;

      this.currentLevels = {};

      this.calculateTreeLevelsAppearanceSettings();

      this.currentFirstVisibleLevel = goog.array.find(this.visibleLevels, function(levelDepth) {
        return levelDepth >= this.currentRootDepth;
      }, this);

      goog.array.forEach(this.currentRoots, function(node) {
        this.calculateNodes(node);
      }, this);

      this.calculateStatsForHiddenLevels();

      var levels = this.cloneLevels(this.currentLevels);
      this.statistics('levels', levels);
      this.statistics('currentMaxDepth', this.currentMaxDepth);
      this.statistics('currentRootDepth', this.currentRootDepth);
    }

    this.markConsistent(anychart.ConsistencyState.SUNBURST_CALCULATIONS);
  }
};

/**
 * Initializes basic dom elements.
 *
 * @private
 */
anychart.sunburstModule.Chart.prototype.initDom_ = function() {
  if (!this.dataLayer_) {
    // --- Initializing data layer.
    this.dataLayer_ = new anychart.core.utils.TypedLayer(function() {
      return acgraph.path();
    }, function(el) {
      (/** @type {!acgraph.vector.Path} */(el)).clear();
    });
    anychart.utils.nameElement(this.dataLayer_, 'data_layer');

    this.dataLayer_.zIndex(anychart.sunburstModule.Chart.ZINDEX_SERIES);
    this.dataLayer_.parent(this.rootElement);
    this.initInteractivityControlsWrapper_();

    // --- Initializing hatch layer.
    this.hatchLayer_ = new anychart.core.utils.TypedLayer(function() {
      return acgraph.path();
    }, function(el) {
      (/** @type {!acgraph.vector.Path} */(el)).clear();
    });
    anychart.utils.nameElement(this.hatchLayer_, 'hatch_layer');

    this.hatchLayer_.zIndex(anychart.sunburstModule.Chart.ZINDEX_HATCH_FILL);
    this.hatchLayer_.parent(this.rootElement);
    this.hatchLayer_.disablePointerEvents(true);


    this.statefulColoringLayer_ = this.rootElement.layer();
    anychart.utils.nameElement(this.statefulColoringLayer_, 'stateful_coloring_layer');
    //TODO (A.Kudryavtsev): Is it really must be above?
    this.statefulColoringLayer_.zIndex(anychart.sunburstModule.Chart.ZINDEX_HATCH_FILL + 1);
    this.statefulColoringLayer_.disablePointerEvents(true);
  }
};

/**
 * TODO (A.Kudryavtsev): JSDoc.
 *
 * @private
 */
anychart.sunburstModule.Chart.prototype.prepareStatefulColoring_ = function() {
  if (this.statefulColoring_) {
    var colors = this.statefulColoring_.colors;
    if (colors) {
      var checkers = this.statefulColoring_.checkers;
      if (checkers) {
        for (var key in colors) {
          if (!(key in this.statefulColoringPaths_)) {
            var p = /** @type {acgraph.vector.Path} */ (this.statefulColoringLayer_.path());
            p.stroke(null);
            this.statefulColoringPaths_[key] = p;
          }
          this.statefulColoringPaths_[key].clear();
        }
      }
    }
  }
};


/** @inheritDoc */
anychart.sunburstModule.Chart.prototype.drawContent = function(bounds) {
  if (this.isConsistent())
    return;

  this.calculate();
  this.initDom_();

  if (this.hasInvalidationState(anychart.ConsistencyState.SUNBURST_CENTER_CONTENT)) {
    if (this.center_.contentLayer) {
      this.center_.clearContent();
      this.center_.contentLayer.parent(this.rootElement);
      this.center_.contentLayer.zIndex(anychart.sunburstModule.Chart.ZINDEX_CENTER_CONTENT_LAYER);

      if (this.center_.contentLayer) {
        if (anychart.utils.instanceOf(this.center_.realContent, acgraph.vector.Element)) {
          this.center_.contentLayer.getStage().listen(acgraph.vector.Stage.EventType.RENDER_FINISH,
              this.acgraphElementsListener, false, this);
        } else if (anychart.utils.instanceOf(this.center_.realContent, anychart.core.VisualBase)) {
          this.center_.contentLayer.listen(anychart.enums.EventType.CHART_DRAW,
              this.chartsListener, false, this);
        }
      }
    }
    this.markConsistent(anychart.ConsistencyState.SUNBURST_CENTER_CONTENT);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.calculateBounds_(bounds);
    this.dataLayer_.clip(this.dataBounds_);
    this.hatchLayer_.clip(this.dataBounds_);
    this.statefulColoringLayer_.clip(this.dataBounds_);
    this.invalidate(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    this.dataLayer_.clear();
    this.hatchLayer_.clear();
    this.prepareStatefulColoring_();

    var labels = this.normal_.labels();
    labels.clear();

    if (!this.normal_.labels().container()) {
      labels.container(this.rootElement);
      labels.zIndex(anychart.sunburstModule.Chart.ZINDEX_LABEL);
    }

    this.resetIndexMeta();

    var startAngle = this.getStartAngle();
    var sweep = 360;
    var parentValue = NaN;
    var startRadius = this.innerRadiusValue_;

    this.normal_.labels().suspendSignalsDispatching();

    var sortFunction;
    var sort = this.getOption('sort');
    if (sort == anychart.enums.Sort.DESC) {
      sortFunction = anychart.sunburstModule.Chart.SORT_DESC;
    } else if (sort == anychart.enums.Sort.ASC) {
      sortFunction = anychart.sunburstModule.Chart.SORT_ASC;
    } else if (goog.isFunction(sort)) {
      sortFunction = sort;
    } else {
      sortFunction = null;
    }
    this.sortFunction_ = sortFunction ? goog.bind(sortFunction, this) : null;

    var currentRoots = this.currentRoots.slice();
    if (this.sortFunction_)
      goog.array.sort(currentRoots, this.sortFunction_);

    goog.array.forEach(currentRoots, function(item) {
      startAngle = goog.math.standardAngle(this.drawNode_(item, parentValue, startAngle, sweep, startRadius));
    }, this);

    this.normal_.labels().resumeSignalsDispatching(false);
    this.normal_.labels().draw();

    if (this.innerRadiusValue_) {
      var centerContentFill = /** @type {acgraph.vector.Stroke} */ (this.center_.getOption('fill'));
      var centerContentStroke = /** @type {acgraph.vector.Stroke} */ (this.center_.getOption('stroke'));

      if (!this.centerContentBg_)
        this.centerContentBg_ = acgraph.circle();

      var radius = this.innerRadiusValue_ - acgraph.vector.getThickness(centerContentStroke) / 2;

      this.centerContentBg_
          .parent(this.rootElement)
          .zIndex(anychart.sunburstModule.Chart.ZINDEX_CENTER_CONTENT_BG)
          .stroke(centerContentStroke)
          .fill(centerContentFill)
          .radius(radius);
    } else if (this.centerContentBg_) {
      this.centerContentBg_.parent(null);
    }

    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    var realContent = this.center_.realContent;
    var contentLayer = this.center_.contentLayer;
    if (anychart.utils.instanceOf(realContent, acgraph.vector.Element)) {
      var ccbb = realContent.getBounds();
      this.transformCenterContent(ccbb);
      contentLayer.clip(null);
    } else if (anychart.utils.instanceOf(realContent, anychart.core.VisualBase)) {
      realContent.parentBounds(this.centerContentBounds);
      realContent.resumeSignalsDispatching(false);
      realContent.draw();

      contentLayer.setTransformationMatrix(1, 0, 0, 1, 0, 0);
      contentLayer.clip(acgraph.circle(this.cx, this.cy, this.innerRadiusValue_ + 2));
    }

    if (this.centerContentBg_ && this.innerRadiusValue_) {
      this.centerContentBg_
          .centerX(this.cx)
          .centerY(this.cy);
    }
  }
};


/**
 * @param {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} node Node to draw.
 * @param {boolean} display .
 * @param {number} parentValue .
 * @return {Array.<number>} .
 */
anychart.sunburstModule.Chart.prototype.nodesLayouter_ = function(node, display, parentValue) {
  var calculationMode = /** @type {string} */(this.getOption('calculationMode'));
  var currValue, ratio;
  var numChildren = node.numChildren();
  var depth = /** @type {number} */(node.meta('depth'));
  var parent = this.isRootNode(node) ? null : node.getParent();
  var nexLevel, currentFirstVisibleLevel;
  var levelStats = this.getLevelStatsByRoot(node);
  var parentAttending,
      attending,
      parentAttendingOnNextVisLevelArr,
      attendingOnNextVisLevelArr,
      leavesEnabled;

  if (calculationMode == anychart.enums.SunburstCalculationMode.PARENT_INDEPENDENT) {
    currValue = parseFloat(node.meta(anychart.sunburstModule.Chart.FieldsName.LEAVES_SUM));
    ratio = currValue / parentValue;

    if (isNaN(ratio) || !display) {
      if (!parent) {
        currValue = NaN;
        currentFirstVisibleLevel = this.currentLevels[this.currentFirstVisibleLevel];
        ratio = currentFirstVisibleLevel ? 1 / currentFirstVisibleLevel.attendingRoots.length : 0;
      } else if (display) {
        var leavesSumOfCurrentLevel = levelStats.leavesSum;
        ratio = currValue / leavesSumOfCurrentLevel;
      } else {
        var visibleLeavesSum = /** @type {number} */(node.meta(anychart.sunburstModule.Chart.FieldsName.VISIBLE_LEAVES_SUM));
        var parentVisibleLeavesSum = /** @type {number} */(parent.meta(anychart.sunburstModule.Chart.FieldsName.VISIBLE_LEAVES_SUM));

        parentAttendingOnNextVisLevelArr = /** @type {Array} */(parent.meta('attendingOnNextVisLevel'));
        parentAttending = parentAttendingOnNextVisLevelArr && parentAttendingOnNextVisLevelArr.length;

        attendingOnNextVisLevelArr = /** @type {Array} */(node.meta('attendingOnNextVisLevel'));
        attending = attendingOnNextVisLevelArr && attendingOnNextVisLevelArr.length;

        ratio = attending && parentAttending ? visibleLeavesSum / parentVisibleLeavesSum : 0;
      }
    }
  } else if (calculationMode == anychart.enums.SunburstCalculationMode.PARENT_DEPENDENT) {
    if (display) {
      currValue = parseFloat(node.meta(anychart.sunburstModule.Chart.FieldsName.META_VALUE));
      if (isNaN(currValue)) {
        currValue = parseFloat(node.meta(anychart.sunburstModule.Chart.FieldsName.LEAVES_SUM));
      }
      if (isNaN(parentValue) && parent) {
        var levelSum = levelStats.sum;
        ratio = currValue / levelSum;
      } else if (!parent) {
        currentFirstVisibleLevel = this.currentLevels[this.currentFirstVisibleLevel];
        ratio = currentFirstVisibleLevel ? 1 / currentFirstVisibleLevel.attendingRoots.length : 0;
      } else {
        ratio = currValue / parentValue;
      }
    } else {
      if (numChildren) {
        if (depth >= this.currentFirstVisibleLevel) {
          currValue = parseFloat(node.meta(anychart.sunburstModule.Chart.FieldsName.META_VALUE));
          ratio = currValue / parentValue;
        } else {
          nexLevel = this.currentLevels[depth + 1];
          ratio = nexLevel && nexLevel.display ? 1 / nexLevel.attendingRoots.length : 1;
        }
      } else {
        ratio = 0;
      }
    }
    if (isNaN(ratio))
      ratio = 1 ;
  } else if (calculationMode == anychart.enums.SunburstCalculationMode.ORDINAL_FROM_ROOT) {
    leavesEnabled = /** @type {boolean|null} */(this.leaves().getOption('enabled'));
    leavesEnabled = goog.isDefAndNotNull(leavesEnabled) ? leavesEnabled : true;

    currentFirstVisibleLevel = this.currentLevels[this.currentFirstVisibleLevel];
    var parentLeavesCount = parent && (/** @type {number} */(parent.meta(anychart.sunburstModule.Chart.FieldsName.CHILDREN_LEAVES_COUNT)));

    if (!parent) {
      ratio = currentFirstVisibleLevel ? 1 / currentFirstVisibleLevel.attendingRoots.length : 0;
    } else if (display) {
      ratio = 1 / (parent.numChildren() - (leavesEnabled ? 0 : parentLeavesCount));
    } else {
      parentAttendingOnNextVisLevelArr = /** @type {Array} */(parent.meta('attendingOnNextVisLevel'));
      parentAttending = parentAttendingOnNextVisLevelArr && parentAttendingOnNextVisLevelArr.length;

      attendingOnNextVisLevelArr = /** @type {Array} */(node.meta('attendingOnNextVisLevel'));
      attending = attendingOnNextVisLevelArr && attendingOnNextVisLevelArr.length;

      ratio = attending && parentAttending ? 1 / parentAttending : 0;
    }
  } else {
    if (!parent) {
      currentFirstVisibleLevel = this.currentLevels[this.currentFirstVisibleLevel];
      ratio = currentFirstVisibleLevel ? 1 / currentFirstVisibleLevel.attendingRoots.length : 0;
    } else {
      var currNodeLeafsCount = /** @type {number} */(node.meta(anychart.sunburstModule.Chart.FieldsName.LEAVES_COUNT));
      var parentNodeLeafsCount = /** @type {number} */(parent.meta(anychart.sunburstModule.Chart.FieldsName.LEAVES_COUNT));

      ratio = parentNodeLeafsCount ? currNodeLeafsCount / parentNodeLeafsCount : 0;
    }
  }


  return [ratio, currValue];
};


/**
 * Calculating text path.
 * @param {anychart.core.ui.LabelsFactory.Label} label .
 * @param {number=} opt_radius
 * @param {number=} opt_angle
 * @return {!acgraph.vector.Path}
 */
anychart.sunburstModule.Chart.prototype.getLabelRadialTextPath = function(label, opt_radius, opt_angle) {
  var iterator = this.getIterator();
  var item = iterator.getItem();

  // var radius = goog.isDef(opt_radius) ? opt_radius : label.positionProvider()['value']['radius'];
  var angle = goog.isDef(opt_angle) ? opt_angle : label.positionProvider()['value']['angle'];
  var start = /** @type {number} */(iterator.meta('start'));
  var sweep = /** @type {number} */(iterator.meta('sweep'));
  var innerRadius = /** @type {number} */ (iterator.meta('innerRadius'));
  var outerRadius = /** @type {number} */ (iterator.meta('outerRadius'));

  var parent = item.getParent();
  var mainAngle;
  if (parent && (/** @type {number} */(parent.meta('sweep')) == 360)) {
    mainAngle = angle;
  } else {
    // var mainParent = this.getMainParent(item);
    // var mainStart = /** @type {number} */ (mainParent.meta('start'));
    // var mainSweep = /** @type {number} */ (mainParent.meta('sweep'));
    var mainStart = start;
    var mainSweep = sweep;

    mainAngle = goog.math.standardAngle(mainStart + mainSweep / 2);
    if (mainSweep == 360)
      mainAngle = (anychart.sunburstModule.Chart.DEFAULT_START_ANGLE + mainSweep) / 2;
    if (isNaN(mainAngle))
      mainAngle = angle;
  }

  var dr = outerRadius - innerRadius;
  var padding = label.getFinalSettings('padding');
  outerRadius -= anychart.utils.normalizeSize(/** @type {number|string} */(padding.left), dr);
  innerRadius += anychart.utils.normalizeSize(/** @type {number|string} */(padding.right), dr);

  var dAngle = 90;
  var flip = mainAngle > dAngle && mainAngle < dAngle + 180;
  if (flip) {
    var tmpA = innerRadius;
    innerRadius = outerRadius;
    outerRadius = tmpA;

    var hAlign = label.getFinalSettings('hAlign');
    if (hAlign == 'start' || hAlign == 'left')
      label.setOption('hAlign', 'end');
    else if (hAlign == 'end' || hAlign == 'right')
      label.setOption('hAlign', 'start');
  }

  var angleRad = goog.math.toRadians(angle);

  var x1 = anychart.math.angleDx(angleRad, innerRadius, this.cx);
  var y1 = anychart.math.angleDy(angleRad, innerRadius, this.cy);

  var x2 = anychart.math.angleDx(angleRad, outerRadius, this.cx);
  var y2 = anychart.math.angleDy(angleRad, outerRadius, this.cy);

  var path = /** @type {acgraph.vector.Path} */ (label.getTextElement().path());
  if (path) {
    path.clear();
  } else {
    path = acgraph.path();
    // since this anonymous path not managed anywhere
    // by chart, we register it to dispose with chart
    this.registerDisposable(path);
  }

  path
      .moveTo(x1, y1)
      .lineTo(x2, y2);

  //Debug text path
  // var stage = this.container().getStage();
  // var index = label.getIndex();
  // var path_ = this['lbl' + index] || (this['lbl' + index] = stage.path());
  // path_.deserialize(path.serializePathArgs());
  // path_.stroke('red');

  return path;
};


/**
 * Calculating text path.
 * @param {anychart.core.ui.LabelsFactory.Label} label .
 * @param {number=} opt_radius
 * @return {!acgraph.vector.Path}
 */
anychart.sunburstModule.Chart.prototype.getLabelCircularTextPath = function(label, opt_radius) {
  var iterator = this.getIterator();

  var radius = goog.isDef(opt_radius) ? opt_radius : label.positionProvider()['value']['radius'];
  var sweep = /** @type {number} */(iterator.meta('sweep'));
  var start = /** @type {number} */(iterator.meta('start'));
  start = sweep == 360 ? anychart.sunburstModule.Chart.DEFAULT_START_ANGLE : start;
  var padding = new anychart.core.utils.Padding().setup(label.getFinalSettings('padding'));
  var pxPerDegree = (2 * Math.PI * radius) / 360;
  var startAngle = start;
  var endAngle = start + sweep;

  var tmpSweep = Math.abs(endAngle - startAngle);
  var stroke = /** @type {acgraph.vector.Stroke} */(this.getOption('stroke'));
  var dw = ((tmpSweep - (padding.tightenWidth(tmpSweep * pxPerDegree) - acgraph.vector.getThickness(stroke)) / pxPerDegree)) / 2;
  goog.dispose(padding);
  padding = null;

  startAngle += dw;
  endAngle -= dw;

  var mainStart, mainSweep;
  mainStart = startAngle;
  mainSweep = sweep;

  // var item = iterator.getItem();
  // var mainParent = this.isRootNode(item) ? null : this.getMainParent(item);
  // if (mainParent) {
  //   mainStart = /** @type {number} */(mainParent.meta('start'));
  //   mainSweep = /** @type {number} */(mainParent.meta('sweep'));
  // }

  var mainAngle = goog.math.standardAngle(mainStart + mainSweep / 2);
  if (isNaN(mainSweep))
    mainSweep = sweep;

  if (mainSweep == 360) {
    mainAngle = (anychart.sunburstModule.Chart.DEFAULT_START_ANGLE + mainSweep) / 2;
  }

  var dAngle = 0;
  if (mainAngle > dAngle && mainAngle < 180 - dAngle) {
    var tmpA = startAngle;
    startAngle = endAngle;
    endAngle = tmpA;

    var vAlign = label.getFinalSettings('vAlign');
    if (vAlign == 'top')
      label.setOption('vAlign', 'bottom');
    else if (vAlign == 'bottom')
      label.setOption('vAlign', 'top');
  }

  var startAngleRad = goog.math.toRadians(startAngle);
  var dx = anychart.math.angleDx(startAngleRad, radius, this.cx);
  var dy = anychart.math.angleDy(startAngleRad, radius, this.cy);

  var path = /** @type {acgraph.vector.Path} */ (label.getTextElement().path());
  if (path) {
    path.clear();
  } else {
    path = acgraph.path();
    // since this anonymous path not managed anywhere
    // by chart, we register it to dispose with chart
    this.registerDisposable(path);
  }

  if (endAngle != startAngle) {
    path
        .moveTo(dx, dy)
        .arcToAsCurves(radius, radius, startAngle, endAngle - startAngle);
  }
  label.getTextElement().path(path);

  //Debug text path
  // var stage = this.container().getStage();
  // var index = label.getIndex();
  // var path_ = this['lbl' + index] || (this['lbl' + index] = stage.path());
  // path_.deserialize(path.serializePathArgs());
  // path_.stroke('red');

  return path;
};

/**
 * Draws path over the real slice path by stateful coloring.
 *
 * @param {anychart.PointState|number} pointState - Point state to define stroke.
 * @private
 */
anychart.sunburstModule.Chart.prototype.drawStatefulFill_ = function(pointState) {
  var iterator = this.getIterator();
  var statefulFill = /** @type {acgraph.vector.Fill} */ (iterator.meta('statefulFill'));
  var statefulName = /** @type {string} */ (iterator.meta('statefulName'));
  if (statefulName in this.statefulColoringPaths_) {
    var path = this.statefulColoringPaths_[statefulName];
    var stroke = this.getStroke_(pointState);
    path.fill(statefulFill);
    path.stroke(stroke);

    var innerRadius = /** @type {number} */ (iterator.meta('innerRadius'));
    var outerRadius = /** @type {number} */ (iterator.meta('outerRadius'));
    var halfStrokeThickness = /** @type {number} */ (iterator.meta('halfStrokeThickness'));
    var start = /** @type {number} */ (iterator.meta('start'));
    var sweep = /** @type {number} */ (iterator.meta('sweep'));

    acgraph.vector.primitives.donut(
        path,
        this.cx,
        this.cy,
        innerRadius + halfStrokeThickness,
        outerRadius - halfStrokeThickness,
        start,
        sweep
    );
  }
};


/**
 * Recursively draws node into specified bounds.
 * @param {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} node Node to draw.
 * @param {number} parentValue .
 * @param {number} start .
 * @param {number} sweep .
 * @param {number} radius .
 * @return {number}
 * @private
 */
anychart.sunburstModule.Chart.prototype.drawNode_ = function(node, parentValue, start, sweep, radius) {
  if (node.meta(anychart.sunburstModule.Chart.FieldsName.MISSING))
    return 0;

  var depth = /** @type {number} */(node.meta('depth'));
  var childStart = start;

  var currValue, ratio;
  var index = /** @type {number} */(node.meta('index'));
  var iterator = this.getIterator();
  iterator.select(index);
  this.extractStateColor_();

  var pointState = this.state.getPointStateByIndex(index);
  var numChildren = node.numChildren();
  var level = this.currentLevels[depth];
  var display = level.display;
  var levelThickness = level.thickness;

  var isLeaf = node.meta('isLeaf');
  if (isLeaf) {
    var leaves = this.leaves();
    var enabled = leaves.getOption('enabled');
    var thickness = leaves.getOption('thickness');

    display = goog.isDefAndNotNull(enabled) ? display && enabled : display;
    levelThickness = goog.isDefAndNotNull(thickness) ? thickness : levelThickness;
  }

  var layoutParam = this.nodesLayouter_(node, display, parentValue);
  ratio = layoutParam[0];
  currValue = layoutParam[1];

  sweep = sweep * (isNaN(ratio) ? 1 : ratio);

  var innerRadius = radius;
  var outerRadius = radius;
  if (display) {
    var stroke = this.getStroke_(0);
    var strokeThickness = anychart.utils.extractThickness(stroke);
    var halfStrokeThickness = Math.floor(strokeThickness / 2);

    levelThickness = anychart.utils.normalizeSize(levelThickness, this.sunburstThickness);
    if (isNaN(levelThickness))
      levelThickness = this.levelAutoThickness;

    outerRadius = innerRadius + levelThickness;

    var nodePath = /** @type {!acgraph.vector.Path} */(this.dataLayer_.genNextChild());

    acgraph.vector.primitives.donut(
        nodePath,
        this.cx,
        this.cy,
        innerRadius + halfStrokeThickness,
        outerRadius - halfStrokeThickness,
        start,
        sweep);

    iterator.meta('path', nodePath);
    iterator.meta('start', start);
    iterator.meta('sweep', sweep);
    iterator.meta('innerRadius', innerRadius);
    iterator.meta('outerRadius', outerRadius);
    iterator.meta('halfStrokeThickness', halfStrokeThickness);

    this.makeInteractive(nodePath);
    this.drawLabel_(pointState);
    this.drawStatefulFill_(pointState);
  } else {
    iterator.meta('path', void 0);
  }
  iterator.meta('hatchPath', void 0);
  this.colorizePoint(pointState);

  var i;
  if (numChildren) {
    var children = node.getChildren();
    if (this.sortFunction_)
      goog.array.sort(children, this.sortFunction_);

    for (i = 0; i < numChildren; i++) {
      var child = children[i];
      childStart = goog.math.standardAngle(this.drawNode_(child, currValue, childStart, sweep, outerRadius));
    }
  }

  if (depth >= this.currentFirstVisibleLevel) {
    start = start + sweep;
  } else {
    start = childStart;
  }

  return start;
};


/**
 * Draws label for a slice.
 * @private
 * @param {anychart.PointState|number} pointState Point state.
 */
anychart.sunburstModule.Chart.prototype.drawLabel_ = function(pointState) {
  pointState = anychart.core.utils.InteractivityState.clarifyState(pointState);

  var hovered = pointState == anychart.PointState.HOVER;
  var selected = pointState == anychart.PointState.SELECT;

  var iterator = this.getIterator();
  var sweep = /** @type {number} */ (iterator.meta('sweep'));
  var innerRadius = /** @type {number} */ (iterator.meta('innerRadius'));
  var outerRadius = /** @type {number} */ (iterator.meta('outerRadius'));

  var halfSweep = goog.math.toRadians(sweep / 2);
  var medianSegmentWidth = (outerRadius + innerRadius) / 2 * Math.sin(halfSweep);
  var sweepCondition = sweep <= 180 ? medianSegmentWidth >= 5 : outerRadius >= 10;

  if (sweepCondition && outerRadius - innerRadius >= 20) {
    /*
      For performance purposes, no label will be drawn if it has not enough space
      to be drawn.

      It includes:
        - available medianSegmentWidth is less than 5 pixels.
        - available levelThickness = (outerRadius - innerRadius) difference is less than 20 pixels.
        - @see QLIK-115 for explanations.
     */
    var item = iterator.getItem();

    var chartLabels = this.normal_.labels();
    var chartStateLabels = selected ? this.selected_.labels() : hovered ? this.hovered_.labels() : null;

    var pointLabel = item.get('normal');
    pointLabel = goog.isDef(pointLabel) ? pointLabel['label'] : void 0;
    pointLabel = anychart.utils.getFirstDefinedValue(pointLabel, item.get('label'));

    var statePointLabel = selected ? item.get('selected') : hovered ? item.get('hovered') : void 0;
    statePointLabel = goog.isDef(statePointLabel) ? statePointLabel['label'] : void 0;
    statePointLabel = selected ? anychart.utils.getFirstDefinedValue(statePointLabel, item.get('selectLabel')) :
        hovered ? anychart.utils.getFirstDefinedValue(statePointLabel, item.get('hoverLabel')) : null;

    var index = iterator.getIndex();
    var label = chartLabels.getLabel(index);
    if (!label)
      label = chartLabels.add(null, null, index);

    var depth = item.meta('depth');
    var positiveLevel = this.levelsPositive_[depth];
    var negativeLevel = this.levelsNegative_[this.treeMaxDepth - depth];

    var positiveLevelLabels, positiveStateLevelLabels;
    if (positiveLevel) {
      positiveLevelLabels = positiveLevel.normal().labels();
      positiveStateLevelLabels = selected ? positiveLevel.selected().labels() : hovered ? positiveLevel.hovered().labels() : null;
    }

    var negativeLevelLabels, negativeStateLevelLabels;
    if (negativeLevel) {
      negativeLevelLabels = negativeLevel.normal().labels();
      negativeStateLevelLabels = selected ? negativeLevel.selected().labels() : hovered ? negativeLevel.hovered().labels() : null;
    }

    var isLeaf = item.meta('isLeaf');
    var leavesLabels, leavesStateLabels;
    if (isLeaf) {
      var leaves = this.leaves();
      leavesLabels = leaves.normal().labels();
      leavesStateLabels = selected ? leaves.selected().labels() : hovered ? leaves.hovered().labels() : null;
    }

    label.resetSettings();
    label.stateOrder(anychart.utils.extractSettings([
      //own state
      statePointLabel, anychart.utils.ExtractSettingModes.PLAIN_OBJECT,
      leavesStateLabels, anychart.utils.ExtractSettingModes.OWN_SETTINGS,
      negativeStateLevelLabels, anychart.utils.ExtractSettingModes.OWN_SETTINGS,
      positiveStateLevelLabels, anychart.utils.ExtractSettingModes.OWN_SETTINGS,
      chartStateLabels, anychart.utils.ExtractSettingModes.OWN_SETTINGS,
      //own normal
      pointLabel, anychart.utils.ExtractSettingModes.PLAIN_OBJECT,
      leavesLabels, anychart.utils.ExtractSettingModes.OWN_SETTINGS,
      negativeLevelLabels, anychart.utils.ExtractSettingModes.OWN_SETTINGS,
      positiveLevelLabels, anychart.utils.ExtractSettingModes.OWN_SETTINGS,
      chartLabels, anychart.utils.ExtractSettingModes.OWN_SETTINGS,
      //sunburst auto settings
      label, anychart.utils.ExtractSettingModes.OWN_SETTINGS,
      //theme state
      leavesStateLabels, anychart.utils.ExtractSettingModes.THEME_SETTINGS,
      positiveStateLevelLabels, anychart.utils.ExtractSettingModes.THEME_SETTINGS,
      negativeStateLevelLabels, anychart.utils.ExtractSettingModes.THEME_SETTINGS,
      chartStateLabels, anychart.utils.ExtractSettingModes.THEME_SETTINGS,
      //theme normal
      leavesLabels, anychart.utils.ExtractSettingModes.THEME_SETTINGS,
      negativeLevelLabels, anychart.utils.ExtractSettingModes.THEME_SETTINGS,
      positiveLevelLabels, anychart.utils.ExtractSettingModes.THEME_SETTINGS,
      chartLabels, anychart.utils.ExtractSettingModes.THEME_SETTINGS
    ]));

    var needToDraw = label.getFinalSettings('enabled');
    var fitToSlice = true;
    if (needToDraw) {
      // var start
      var radiusDelta, angle, radius, path, textElement, arcLength;
      var position, padding, positionProvider, formatProvider;
      var width = null;
      var height = null;

      positionProvider = this.createPositionProvider();
      formatProvider = this.createFormatProvider(true);
      label.formatProvider(formatProvider);

      label
          .height(height)
          .width(width);

      position = label.getFinalSettings('position');
      padding = new anychart.core.utils.Padding().setup(label.getFinalSettings('padding'));
      // start = /** @type {number} */ (iterator.meta('start'));

      radiusDelta = (outerRadius - innerRadius);
      angle = positionProvider['value']['angle'];
      radius = positionProvider['value']['radius'];

      if (position == 'circular' || (position == 'radial' && sweep == 360)) {
        if (sweep == 360 && !innerRadius) {
          textElement = label.getTextElement();
          path = textElement.path();
          if (path)
            textElement.path(null);

          width = height = radiusDelta * 2;
          width = padding.tightenWidth(width);
          height = padding.tightenHeight(height);
        } else {
          path = this.getLabelCircularTextPath(label, radius);
          label.getTextElement().path(path);

          arcLength = (Math.PI * radius * sweep) / 180;
          width = padding.tightenWidth(arcLength);
          height = padding.tightenHeight(radiusDelta) - 15;
        }
      } else if (position == 'radial') {
        path = this.getLabelRadialTextPath(label, radius, angle);
        label.getTextElement().path(path);

        arcLength = (Math.PI * radius * sweep) / 180;
        height = padding.tightenHeight(arcLength);
        width = padding.tightenWidth(radiusDelta);
      }
      goog.dispose(padding);
      padding = null;

      label
          .width(width)
          .height(height)
          .positionProvider(positionProvider);
    }

    if (!needToDraw || !fitToSlice)
      chartLabels.clear(label.getIndex());
    else
      label.draw();
  }
};


//endregion
//region --- Utils
/**
 * Create pie label format provider.
 * @param {boolean=} opt_force create context provider forcibly.
 * @return {Object} Object with info for labels formatting.
 * @protected
 */
anychart.sunburstModule.Chart.prototype.createFormatProvider = function(opt_force) {
  var iterator = this.getIterator();
  var item = iterator.getItem();

  if (!this.pointProvider_ || opt_force)
    this.pointProvider_ = new anychart.format.Context();

  this.pointProvider_
      .dataSource(iterator)
      .statisticsSources([this.getPoint(iterator.getIndex()), this]);

  var calculationMode = /** @type {string} */(this.getOption('calculationMode'));

  var isLeaf = !!item.meta('isLeaf');

  var value = anychart.utils.toNumber(calculationMode == anychart.enums.SunburstCalculationMode.PARENT_INDEPENDENT ?
      isLeaf ? item.get(anychart.sunburstModule.Chart.FieldsName.VALUE) : item.meta(anychart.sunburstModule.Chart.FieldsName.VISIBLE_LEAVES_SUM) :
      item.get(anychart.sunburstModule.Chart.FieldsName.VALUE));

  var values = { //TODO (A.Kudryavtsev): Check types!!!
    'value': {value: value, type: anychart.enums.TokenType.NUMBER},
    'name': {value: item.get('name'), type: anychart.enums.TokenType.STRING},
    'index': {value: item.meta('index'), type: anychart.enums.TokenType.NUMBER},
    'chart': {value: this, type: anychart.enums.TokenType.UNKNOWN},
    'item': {value: item, type: anychart.enums.TokenType.UNKNOWN},
    'depth': {value: item.meta('depth'), type: anychart.enums.TokenType.NUMBER}
  };

  return this.pointProvider_.propagate(values);
};


/**
 * Create column position provider.
 * @return {Object} Object with info for labels formatting.
 * @protected
 */
anychart.sunburstModule.Chart.prototype.createPositionProvider = function() {
  var iterator = this.getIterator();
  var start = /** @type {number} */ (iterator.meta('start'));
  var sweep = /** @type {number} */ (iterator.meta('sweep'));
  var innerRadius = /** @type {number} */ (iterator.meta('innerRadius'));
  var outerRadius = /** @type {number} */ (iterator.meta('outerRadius'));

  var angle = goog.math.standardAngle(start + sweep / 2);
  var radius = sweep == 360 && !innerRadius ? 0 : innerRadius + (outerRadius - innerRadius) / 2;

  var dx = anychart.math.angleDx(goog.math.toRadians(angle), radius, this.cx);
  var dy = anychart.math.angleDy(goog.math.toRadians(angle), radius, this.cy);

  return {'value': {'angle': angle, 'radius': radius, 'x': dx, 'y': dy}};
};


/**
 *
 * @param {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} node .
 * @return {Object}
 */
anychart.sunburstModule.Chart.prototype.getLevelStatsByRoot = function(node) {
  var depth = node.meta('depth');
  var rootIndex = this.getIndexOfRoot(node);

  return this.currentLevels[depth].statsByRoot[rootIndex];
};


/**
 * @param {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} node Node to check.
 * @return {number}
 */
anychart.sunburstModule.Chart.prototype.getIndexOfRoot = function(node) {
  return goog.array.indexOf(this.treeRoots, node.meta('pathFromRoot')[0]);
};


/**
 * Checks whether node is root in context of treemap drawing.
 * @param {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} node Node to check.
 * @return {boolean} Is node root.
 */
anychart.sunburstModule.Chart.prototype.isRootNode = function(node) {
  return goog.array.indexOf(this.currentRoots, node) != -1;
};


/**
 * Checks whether node is root at top level (tree's first child).
 * @param {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} node Node to check.
 * @return {boolean} Is node root.
 */
anychart.sunburstModule.Chart.prototype.isTreeRoot = function(node) {
  return goog.array.indexOf(this.treeRoots, node) != -1;
};


/**
 * Tree has more then one root.
 * @return {boolean}
 */
anychart.sunburstModule.Chart.prototype.isTreeMultiRoot = function() {
  return this.treeRoots.length > 1;
};


/**
 * Returns parent of node with main .
 * @param {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} node Node.
 * @return {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} Whether value is missing.
 */
anychart.sunburstModule.Chart.prototype.getMainParent = function(node) {
  var path = /** @type {Array.<anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem>} */(node.meta('pathFromRoot'));
  return this.treeRoots.length == 1 && node != this.treeRoots[0] ? path[1] : path[0];
};


/**
 * Internal getter for fixed gauge start angle. All for human comfort.
 * @return {number}
 */
anychart.sunburstModule.Chart.prototype.getStartAngle = function() {
  return /** @type {number} */ (this.getOption('startAngle')) + anychart.sunburstModule.Chart.DEFAULT_START_ANGLE;
};


/**
 * @param {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} node .
 * @param {boolean=} opt_reverse .
 * @return {Array.<anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem>}
 */
anychart.sunburstModule.Chart.prototype.getFirstVisibleNodes = function(node, opt_reverse) {
  if (!node)
    return this.treeRoots;

  var depth = /** @type {number} */(node.meta('depth'));
  var nodeMaxDepth = /** @type {number} */(node.meta('nodeMaxDepth'));
  var max = depth + nodeMaxDepth;
  var visible = false;
  var nodes;
  if (opt_reverse) {
    if (depth < this.visibleLevels[0]) {
      nodes = this.treeRoots;
    } else {
      visible = this.currentLevels[depth].display;

      while (!visible && depth > 0) {
        depth -= 1;
        visible = this.currentLevels[depth].display;
        node = node.getParent();
      }
      nodes = [node];
    }
  } else {
    nodes = [node];
    for (var i = depth; i <= max; i++) {
      visible = this.currentLevels[i].display;
      if (visible)
        break;
      else {
        var nodes_ = [];
        for (var j = 0; j < nodes.length; j++) {
          nodes_.push(nodes[j].getChildren());
        }
        nodes = nodes_;
      }
    }
  }

  return nodes;
};


/** @inheritDoc */
anychart.sunburstModule.Chart.prototype.isNoData = function() {
  this.ensureDataPrepared();
  return !this.treeRoots.length;
};


/** @inheritDoc */
anychart.sunburstModule.Chart.prototype.getCenterCoords = function() {
  return [this.cx, this.cy];
};


/** @inheritDoc */
anychart.sunburstModule.Chart.prototype.getCenterContentBounds = function() {
  return this.centerContentBounds;
};


/**
 * Does a recursive clone of an object.
 *
 * @param {*} obj Object to clone.
 * @return {*} Clone of the input object.
 */
anychart.sunburstModule.Chart.prototype.cloneLevels = function(obj) {
  var res;
  var type = goog.typeOf(obj);
  if (anychart.utils.instanceOf(obj, anychart.treeDataModule.Tree.DataItem) ||
      anychart.utils.instanceOf(obj, anychart.treeDataModule.View.DataItem)) {
    return this.getPoint(obj.meta('index'));
  } else if (type == 'array') {
    res = [];
    for (var i = 0; i < obj.length; i++) {
      if (i in obj)
        res[i] = this.cloneLevels(obj[i]);
    }
  } else if (type == 'object') {
    res = {};
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        var value = obj[key];
        if (key in anychart.sunburstModule.Chart.StatsFieldsName)
          key = anychart.sunburstModule.Chart.StatsFieldsName[key];
        res[key] = this.cloneLevels(value);
      }
    }
  } else {
    return obj;
  }

  return res;
};


//endregion
//region --- Menu
/** @inheritDoc */
anychart.sunburstModule.Chart.prototype.specificContextMenuItems = function(items, context, isPointContext) {
  var tag = anychart.utils.extractTag(context['event']['domTarget']);
  var node;
  var isLabels = anychart.utils.instanceOf(context['target'], anychart.core.ui.LabelsFactory);
  if (isLabels) {
    var iterator = this.getIterator();
    iterator.select(/** @type {number} */(tag));
    node = /** @type {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} */ (iterator.getItem());
  } else {
    node = tag['node'];
  }

  var specificItems = {};

  var canDrillDown = node && node.numChildren() && !(this.isRootNode(node) && this.currentRoots.length == 1);
  if (canDrillDown) {
    specificItems['drill-down-to'] = {
      'index': 7, //TODO (A.Kudryavtsev): check index!!!
      'text': 'Drill down',
      'eventType': 'anychart.drillTo',
      'action': goog.bind(this.doDrillChange, this, node)
    };
  }

  var canDrillUp = this.currentRootDepth != 0 || (this.isTreeRoot(this.currentRoots[0]) && this.isTreeMultiRoot() && this.currentRoots.length == 1);
  if (canDrillUp)
    specificItems['drill-down-up'] = {
      'index': 7,
      'text': 'Drill up',
      'eventType': 'anychart.drillUp',
      'action': goog.bind(this.doDrillChange, this, this.currentRoots[0].getParent())
    };

  if (!goog.object.isEmpty(specificItems))
    specificItems['drill-down-separator'] = {'index': 7.1};

  goog.object.extend(specificItems, items);

  return /** @type {Object.<string, anychart.ui.ContextMenu.Item>} */(specificItems);
};


//endregion
//region --- Disposing / Serialization / Setup
/** @inheritDoc */
anychart.sunburstModule.Chart.prototype.serialize = function() {
  var json = anychart.sunburstModule.Chart.base(this, 'serialize');

  anychart.core.settings.serialize(this, anychart.sunburstModule.Chart.PROPERTY_DESCRIPTORS, json, 'Sunburst');

  json['palette'] = this.palette().serialize();
  json['hatchFillPalette'] = this.hatchFillPalette().serialize();

  json['center'] = this.center().serialize();

  if (this.levelsPositive_.length || this.levelsNegative_.length) {
    var levels = [];
    goog.array.forEach(this.levelsPositive_, function(item, index) {
      levels.push({index: index, level: item.serialize()});
    });
    goog.array.forEach(this.levelsNegative_, function(item, index) {
      levels.push({index: -(index + 1), level: item.serialize()});
    });
    json['levels'] = levels;
  }

  if (this.leavesLevel_) {
    json['leaves'] = this.leaves().serialize();
  }

  return {'chart': json};
};


/**
 * @inheritDoc
 */
anychart.sunburstModule.Chart.prototype.disposeInternal = function() {
  goog.disposeAll(
      this.normal_,
      this.hovered_,
      this.selected_,
      this.center_,
      this.palette_,
      this.hatchFillPalette_,
      this.levelsPositive_,
      this.levelsNegative_,
      this.leavesLevel_,
      this.shortcutHandler);
  this.normal_ = null;
  this.hovered_ = null;
  this.selected_ = null;
  this.palette_ = null;
  this.hatchFillPalette_ = null;
  this.levelsPositive_ = null;
  this.levelsNegative_ = null;
  this.leavesLevel_ = null;
  this.shortcutHandler = null;
  anychart.sunburstModule.Chart.base(this, 'disposeInternal');
};


/** @inheritDoc */
anychart.sunburstModule.Chart.prototype.setupByJSON = function(config, opt_default) {
  anychart.sunburstModule.Chart.base(this, 'setupByJSON', config, opt_default);

  anychart.core.settings.deserialize(this, anychart.sunburstModule.Chart.PROPERTY_DESCRIPTORS, config);

  this.palette(config['palette']);
  this.hatchFillPalette(config['hatchFillPalette']);

  this.center().setupInternal(!!opt_default, config['center']);

  if (goog.isArray(config['levels'])) {
    goog.array.forEach(config['levels'], function(level) {
      this.level(level.index, level.level);
    }, this);
  }

  this.leaves().setupInternal(!!opt_default, config['leaves']);

  if ('drillTo' in config)
    this.drillTo(config['drillTo']);
};


//endregion
//region --- Exports
//exports
/**
 * @suppress {deprecated}
 */
(function() {
  var proto = anychart.sunburstModule.Chart.prototype;
  // proto['stroke'] = proto.stroke;
  // proto['fill'] = proto.fill;
  // proto['hatchFill'] = proto.hatchFill;
  // proto['radius'] = proto.radius;
  // proto['innerRadius'] = proto.innerRadius;
  // proto['calculationMode'] = proto.calculationMode;
  // proto['startAngle'] = proto.startAngle;
  // proto['sort'] = proto.sort;
  // proto['labels'] = proto.labels;

  proto['getType'] = proto.getType;

  proto['data'] = proto.data;

  //levels settings
  proto['level'] = proto.level;
  proto['leaves'] = proto.leaves;

  //center content
  proto['center'] = proto.center;

  //states settings
  proto['normal'] = proto.normal;
  proto['hovered'] = proto.hovered;
  proto['selected'] = proto.selected;

  //drilldown
  proto['drillTo'] = proto.drillTo;
  proto['drillUp'] = proto.drillUp;
  proto['getDrilldownPath'] = proto.getDrilldownPath;

  proto['palette'] = proto.palette;
  proto['hatchFillPalette'] = proto.hatchFillPalette;

  proto['toCsv'] = proto.toCsv;

  proto['statefulColoring'] = proto.statefulColoring;
})();
//endregion
