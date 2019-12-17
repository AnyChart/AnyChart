//region Provide / Require
goog.provide('anychart.sankeyModule.Chart');
goog.require('anychart.consistency');
goog.require('anychart.core.Chart');
goog.require('anychart.core.StateSettings');
goog.require('anychart.data.Set');
goog.require('anychart.format.Context');
goog.require('anychart.sankeyModule.elements.VisualElement');
goog.require('goog.array');
//endregion
//region Constructor



/**
 * Sankey chart class.
 * @constructor
 * @param {?(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Value to set.
 * @param {(anychart.enums.TextParsingMode|anychart.data.TextParsingSettings)=} opt_csvSettings - If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @extends {anychart.core.Chart}
 */
anychart.sankeyModule.Chart = function(opt_data, opt_csvSettings) {
  anychart.sankeyModule.Chart.base(this, 'constructor');

  this.addThemes('sankey');

  this.bindHandlersToComponent(this,
      this.handleMouseOverAndMove,    // override from anychart.core.Chart
      this.handleMouseOut,            // override from anychart.core.Chart
      null,                           // click handler
      this.handleMouseOverAndMove,    // override from anychart.core.Chart
      null,                           // all handler
      null);                          // anychart.core.Chart

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, anychart.sankeyModule.Chart.OWN_DESCRIPTORS_META);

  this.data(opt_data || null, opt_csvSettings);

  this.ascendingToNodeFlowY = goog.bind(this.ascendingToNodeFlowY, this);
  this.ascendingFromNodeFlowY = goog.bind(this.ascendingFromNodeFlowY, this);
};
goog.inherits(anychart.sankeyModule.Chart, anychart.core.Chart);
anychart.consistency.supportStates(anychart.sankeyModule.Chart, anychart.enums.Store.SANKEY, [
  anychart.enums.State.APPEARANCE,
  anychart.enums.State.DATA,
  anychart.enums.State.FLOW_LABELS,
  anychart.enums.State.NODE_LABELS]);


//endregion
//region ConsistencyStates / Signals
/**
 * Supported signals.
 * @type {number}
 */
anychart.sankeyModule.Chart.prototype.SUPPORTED_SIGNALS = anychart.core.Chart.prototype.SUPPORTED_SIGNALS;


//endregion
//region Properties
/**
 * Properties that should be defined in class prototype.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.sankeyModule.Chart.OWN_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'nodeWidth', anychart.core.settings.numberOrPercentNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'nodePadding', anychart.core.settings.numberNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'curveFactor', anychart.core.settings.ratioNormalizer]
  ]);

  return map;
})();
anychart.core.settings.populate(anychart.sankeyModule.Chart, anychart.sankeyModule.Chart.OWN_DESCRIPTORS);


/**
 * Descriptors meta.
 * @type {!Array.<Array>}
 */
anychart.sankeyModule.Chart.OWN_DESCRIPTORS_META = (function() {
  return [
    ['nodeWidth', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW],
    ['nodePadding', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW],
    ['curveFactor', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW]
  ];
})();


/**
 * Z-index of a sankey data layer.
 * @type {number}
 */
anychart.sankeyModule.Chart.ZINDEX_SANKEY = 30;


//endregion
//region Data
/**
 * Sets data for sankey chart.
 * @param {?(anychart.data.View|anychart.data.Set|Array|string)=} opt_value Value to set.
 * @param {(anychart.enums.TextParsingMode|anychart.data.TextParsingSettings)=} opt_csvSettings - If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @return {anychart.sankeyModule.Chart|anychart.data.View}
 */
anychart.sankeyModule.Chart.prototype.data = function(opt_value, opt_csvSettings) {
  if (goog.isDef(opt_value)) {
    // handle HTML table data
    if (opt_value) {
      var title = opt_value['title'] || opt_value['caption'];
      if (title) this.title(title);
      if (opt_value['rows']) opt_value = opt_value['rows'];
    }

    if (this.rawData_ !== opt_value) {
      this.rawData_ = opt_value;
      goog.dispose(this.data_);
      goog.dispose(this.parentViewToDispose_);
      this.iterator_ = null;
      if (anychart.utils.instanceOf(opt_value, anychart.data.View))
        this.data_ = (/** @type {anychart.data.View} */ (opt_value)).derive();
      else if (anychart.utils.instanceOf(opt_value, anychart.data.Set))
        this.data_ = (/** @type {anychart.data.Set} */ (opt_value)).mapAs();
      else
        this.data_ = (this.parentViewToDispose_ = new anychart.data.Set(
            (goog.isArray(opt_value) || goog.isString(opt_value)) ? opt_value : null, opt_csvSettings)).mapAs();
      this.data_.listenSignals(this.dataInvalidated_, this);
      this.invalidate(anychart.ConsistencyState.CHART_LABELS); // for noData label
      this.invalidateState(anychart.enums.Store.SANKEY, anychart.enums.State.DATA, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.data_;
};


/**
 * Data invalidation handler.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.sankeyModule.Chart.prototype.dataInvalidated_ = function(e) {
  this.invalidate(anychart.ConsistencyState.CHART_LABELS); // for noData label
  this.invalidateState(anychart.enums.Store.SANKEY, anychart.enums.State.DATA, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Returns detached iterator.
 * @return {!anychart.data.Iterator}
 */
anychart.sankeyModule.Chart.prototype.getDetachedIterator = function() {
  return this.data_.getIterator();
};


/**
 * Returns new data iterator.
 * @return {!anychart.data.Iterator}
 */
anychart.sankeyModule.Chart.prototype.getResetIterator = function() {
  return this.iterator_ = this.data_.getIterator();
};


/**
 * Returns current data iterator.
 * @return {!anychart.data.Iterator}
 */
anychart.sankeyModule.Chart.prototype.getIterator = function() {
  return this.iterator_ || (this.iterator_ = this.data_.getIterator());
};


/**
 * Checks if value is missing.
 * @param {!string} from From value to check.
 * @param {?string} to To value to check.
 * @param {*} flow Flow value to check.
 * @return {boolean} Is point missing.
 * @private
 */
anychart.sankeyModule.Chart.prototype.isMissing_ = function(from, to, flow) {
  var valueMissing = !(goog.isNumber(flow) && flow > 0);
  var fromMissing = !from.length;
  var toMissing = !goog.isNull(to) && !to.length;
  return valueMissing || fromMissing || toMissing;
};


//endregion
//region Infrastructure
/**
 * @typedef {{
 *   id: (number|undefined),
 *   type: anychart.sankeyModule.Chart.ElementType,
 *   name: !string,
 *   level: !number,
 *   weight: (number|undefined),
 *   incomeValue: !number,
 *   outcomeValue: !number,
 *   dropoffValue: !number,
 *   incomeNodes: !Array.<anychart.sankeyModule.Chart.Node>,
 *   outcomeNodes: !Array.<anychart.sankeyModule.Chart.Node>,
 *   incomeValues: !Array.<number>,
 *   outcomeValues: !Array.<number>,
 *   dropoffValues: !Array.<number>,
 *   incomeCoords: Array.<{x: number, y1: number, y2: number}>,
 *   outcomeCoords: Array.<{x: number, y1: number, y2: number}>,
 *   incomeFlows: Array.<anychart.sankeyModule.Chart.Flow>,
 *   outcomeFlows: Array.<anychart.sankeyModule.Chart.Flow>,
 *   conflict: boolean,
 *   x0: (number|undefined),
 *   y0: (number|undefined),
 *   x1: (number|undefined),
 *   y1: (number|undefined),
 *   top: (number|undefined),
 *   right: (number|undefined),
 *   bottom: (number|undefined),
 *   left: (number|undefined),
 *   label: (anychart.core.ui.LabelsFactory.Label|undefined)
 * }}
 */
anychart.sankeyModule.Chart.Node;


/**
 * @typedef {{
 *   type: anychart.sankeyModule.Chart.ElementType,
 *   dataIndex: number,
 *   from: anychart.sankeyModule.Chart.Node,
 *   to: ?anychart.sankeyModule.Chart.Node,
 *   weight: number,
 *   left: (number|undefined),
 *   right: (number|undefined),
 *   top: (number|undefined),
 *   bottom: (number|undefined),
 *   topCenter: (number|undefined),
 *   bottomCenter: (number|undefined),
 *   leftTop: ({x: number, y: number}|undefined),
 *   rightTop: ({x: number, y: number}|undefined),
 *   rightBottom: ({x: number, y: number}|undefined),
 *   leftBottom: ({x: number, y: number}|undefined),
 *   y0: (number|undefined),
 *   y1: (number|undefined),
 *   path: (acgraph.vector.Path|undefined),
 *   label: (anychart.core.ui.LabelsFactory.Label|undefined)
 * }}
 */
anychart.sankeyModule.Chart.Flow;


/**
 * @typedef {{
 *   nodes: Array.<anychart.sankeyModule.Chart.Node>,
 *   weight: number,
 *   top: number
 * }}
 */
anychart.sankeyModule.Chart.Level;


/** @inheritDoc */
anychart.sankeyModule.Chart.prototype.getType = function() {
  return anychart.enums.ChartTypes.SANKEY;
};


/**
 * Update node levels
 * @param {anychart.sankeyModule.Chart.Node} fromNode
 */
anychart.sankeyModule.Chart.prototype.shiftNodeLevels = function(fromNode) {
  var toNodes = fromNode.outcomeNodes;
  for (var i = 0; i < toNodes.length; i++) {
    var toNode = toNodes[i];
    if (fromNode.level >= toNode.level) {
      toNode.level = fromNode.level + 1;
      this.shiftNodeLevels(toNode);
    }
    if (toNode.level > this.lastLevel)
      this.lastLevel = toNode.level;
  }
};


/**
 * Creates flow.
 * @param {anychart.sankeyModule.Chart.Node} fromNode
 * @param {?anychart.sankeyModule.Chart.Node} toNode
 * @param {number} flow
 */
anychart.sankeyModule.Chart.prototype.createFlow = function(fromNode, toNode, flow) {
  var index = this.getIterator().getIndex();
  this.flows[index] = {
    type: toNode ? anychart.sankeyModule.Chart.ElementType.FLOW : anychart.sankeyModule.Chart.ElementType.DROPOFF,
    dataIndex: index,
    from: fromNode,
    to: toNode,
    weight: flow
  };
  fromNode.outcomeValue += flow;

  if (toNode) {
    fromNode.outcomeFlows.push(this.flows[index]);
    fromNode.outcomeValues.push(flow);
    fromNode.outcomeNodes.push(toNode);

    toNode.incomeValue += flow;
    toNode.incomeValues.push(flow);
    toNode.incomeNodes.push(fromNode);
    toNode.incomeFlows.push(this.flows[index]);
    if (fromNode.level >= toNode.level) {
      toNode.level = fromNode.level + 1;
      this.shiftNodeLevels(toNode);
    }
    if (toNode.level > this.lastLevel)
      this.lastLevel = toNode.level;
  } else {
    fromNode.dropoffValue += flow;
    fromNode.dropoffValues.push(flow);
  }
};


/**
 * Returns node by name.
 * @param {?string} name Node name or null in case of dropoff
 * @return {?anychart.sankeyModule.Chart.Node}
 */
anychart.sankeyModule.Chart.prototype.getNode = function(name) {
  if (name) {
    if (!this.nodes[name]) {
      this.nodes[name] = {
        type: anychart.sankeyModule.Chart.ElementType.NODE,
        name: /** @type {string} */ (name),
        level: 0,
        incomeValue: 0,
        outcomeValue: 0,
        dropoffValue: 0,
        incomeNodes: [],
        outcomeNodes: [],
        incomeValues: [],
        outcomeValues: [],
        dropoffValues: [],
        incomeCoords: [],
        outcomeCoords: [],
        incomeFlows: [],
        outcomeFlows: [],
        conflict: false
      };
    }
    return this.nodes[name];
  }
  return null;
};


/**
 * Returns level by it's number.
 * @param {number} levelNumber
 * @return {anychart.sankeyModule.Chart.Level}
 */
anychart.sankeyModule.Chart.prototype.getLevel = function(levelNumber) {
  if (!this.levels[levelNumber]) {
    this.levels[levelNumber] = {
      nodes: [],
      weight: 0,
      top: NaN
    };
  }
  return this.levels[levelNumber];
};


/**
 * Calculate node levels.
 * @private
 */
anychart.sankeyModule.Chart.prototype.calculateLevels_ = function() {
  /** @type {*} */
  var from;

  /** @type {*} */
  var to;

  /** @type {number} */
  var flow;

  /**
   * Nodes information by node name.
   * @type {Object.<string, anychart.sankeyModule.Chart.Node>}
   */
  this.nodes = {};

  /**
   * Flows information by row index
   * @type {Object.<(string|number), anychart.sankeyModule.Chart.Flow>}
   */
  this.flows = {};

  /**
   * @type {anychart.sankeyModule.Chart.Node}
   */
  var fromNode;

  /**
   * @type {?anychart.sankeyModule.Chart.Node}
   */
  var toNode;

  /**
   * Number of the last level.
   * @type {number}
   */
  this.lastLevel = -1;

  var iterator = this.getIterator().reset();
  while (iterator.advance()) {
    from = String(iterator.get('from'));
    to = iterator.get('to');
    to = goog.isNull(to) || goog.isObject(to) ? null : String(to);
    flow = /** @type {number} */ (anychart.utils.toNumber(iterator.get('weight')));
    if (this.isMissing_(from, to, flow))
      continue;

    fromNode = /** @type {anychart.sankeyModule.Chart.Node} */ (this.getNode(from));
    toNode = /** @type {?anychart.sankeyModule.Chart.Node} */ (this.getNode(to));
    this.createFlow(fromNode, toNode, flow);
  }
  /**
   * Levels meta.
   * @type {Array.<anychart.sankeyModule.Chart.Level>}
   */
  this.levels = [];

  this.setAsLast = true;

  /** @type {anychart.sankeyModule.Chart.Level} */
  var level;

  for (var name in this.nodes) {
    var node = this.nodes[name];
    node.weight = Math.max(node.incomeValue, node.outcomeValue);

    // if there any outcome flow
    var outLength = node.outcomeNodes.length + node.dropoffValues.length;

    // place node without outcome nodes at last level
    if (this.setAsLast && !outLength)
      node.level = this.lastLevel;

    // check whether node in confict (first and last nodes can't be conflict)
    if (node.incomeNodes.length && outLength) {
      node.conflict = (node.incomeValue != node.outcomeValue);
    }

    level = this.getLevel(node.level);
    level.nodes.push(node);
    level.weight += node.weight;
  }

  var linearId = 0;
  for (var i = 0; i < this.levels.length; i++) {
    level = this.levels[i];
    for (var j = 0; j < level.nodes.length; j++) {
      level.nodes[j].id = linearId++;
    }
  }
};


/** @inheritDoc */
anychart.sankeyModule.Chart.prototype.calculate = function() {
  if (this.hasStateInvalidation(anychart.enums.Store.SANKEY, anychart.enums.State.DATA)) {
    this.calculateLevels_();
    this.invalidate(anychart.ConsistencyState.BOUNDS);
    this.markStateConsistent(anychart.enums.Store.SANKEY, anychart.enums.State.DATA);
  }
};


/** @inheritDoc */
anychart.sankeyModule.Chart.prototype.isNoData = function() {
  var rowsCount = this.getIterator().getRowsCount();
  return (!rowsCount);
};


//endregion
//region Interactivity
/** @inheritDoc */
anychart.sankeyModule.Chart.prototype.getAllSeries = function() {
  return [];
};


/**
 * Tooltip invalidation handler.
 * @param {anychart.SignalEvent} event - Event object.
 * @private
 */
anychart.sankeyModule.Chart.prototype.onTooltipSignal_ = function(event) {
  var tooltip = /** @type {anychart.core.ui.Tooltip} */(this.tooltip());
  tooltip.draw();
};


/**
 * Creates context values.
 * @param {Object} values
 * @param {anychart.sankeyModule.Chart.Node|anychart.sankeyModule.Chart.Flow} element
 */
anychart.sankeyModule.Chart.prototype.createContextValues = function(values, element) {
  var name;
  var elementType = /** @type {anychart.sankeyModule.Chart.ElementType} */ (element.type);
  var i;

  if (elementType == anychart.sankeyModule.Chart.ElementType.NODE) {
    name = element.name;
    var node, arr;
    var elementIndex;

    values['isConflict'] = {
      value: element.conflict,
      type: anychart.enums.TokenType.STRING
    };

    arr = [];
    for (i = 0; i < element.incomeNodes.length; i++) {
      node = element.incomeNodes[i];
      elementIndex = goog.array.findIndex(node.outcomeNodes, function(item) {
        return item == element;
      });
      arr.push({
        'name': node.name,
        'value': node.outcomeValues[elementIndex]
      });
    }
    values['income'] = {
      value: arr,
      type: anychart.enums.TokenType.UNKNOWN
    };

    arr = [];
    for (i = 0; i < element.outcomeNodes.length; i++) {
      node = element.outcomeNodes[i];
      elementIndex = goog.array.findIndex(node.incomeNodes, function(item) {
        return item == element;
      });
      arr.push({
        'name': node.name,
        'value': node.incomeValues[elementIndex]
      });
    }
    values['outcome'] = {
      value: arr,
      type: anychart.enums.TokenType.UNKNOWN
    };

    values['dropoff'] = {
      value: element.dropoffValue,
      type: anychart.enums.TokenType.NUMBER
    };

  } else if (elementType == anychart.sankeyModule.Chart.ElementType.FLOW) {
    name = element.from.name + ' -> ' + element.to.name;
  } else {
    name = element.from.name + ' dropoff';
  }
  values['type'] = {value: anychart.sankeyModule.Chart.ElementTypeString[elementType], type: anychart.enums.TokenType.STRING};
  values['name'] = {value: name, type: anychart.enums.TokenType.STRING};
  values['value'] = {value: element.weight, type: anychart.enums.TokenType.NUMBER};
};


/**
 * Creates provider for sankey labels.
 * @param {anychart.sankeyModule.Chart.Node|anychart.sankeyModule.Chart.Flow} element
 * @param {boolean=} opt_force - create context provider forcibly.
 * @return {anychart.format.Context}
 */
anychart.sankeyModule.Chart.prototype.createLabelsContextProvider = function(element, opt_force) {
  if (!this.labelsContextProvider_ || opt_force)
    this.labelsContextProvider_ = new anychart.format.Context();

  var values = {};
  this.createContextValues(values, element);
  if (element.type != anychart.sankeyModule.Chart.ElementType.NODE) {
    var iterator = this.getIterator();
    iterator.select(element.dataIndex);
    this.labelsContextProvider_.dataSource(iterator);
  } else {
    this.labelsContextProvider_.dataSource(null);
  }

  return /** @type {anychart.format.Context} */ (this.labelsContextProvider_.propagate(values));
};


/**
 * Creates provider for sankey labels.
 * @param {anychart.sankeyModule.Chart.Node} node
 * @param {anychart.PointState|number} state
 * @return {{value: {x: number, y: number}}}
 */
anychart.sankeyModule.Chart.prototype.createNodeLabelsPositionProvider = function(node, state) {
  var stateObject = state ? this.node().hovered().labels() : this.node().normal().labels();
  var stateNormal = this.node().normal().labels();
  var statePosition = stateObject.getOption('position');
  var normalPosition = stateNormal.getOption('position');
  var position = anychart.enums.normalizePosition(statePosition || normalPosition, anychart.enums.Position.CENTER);
  var x = 0;
  var y = 0;
  var centerX = (node.x0 + node.x1) / 2;
  var centerY = (node.y0 + node.y1) / 2;
  switch (position) {
    case anychart.enums.Position.LEFT_TOP:
      x = node.x0;
      y = node.y0;
      break;
    case anychart.enums.Position.LEFT_CENTER:
      x = node.x0;
      y = centerY;
      break;
    case anychart.enums.Position.LEFT_BOTTOM:
      x = node.x0;
      y = node.y1;
      break;
    case anychart.enums.Position.CENTER_TOP:
      x = centerX;
      y = node.y0;
      break;
    case anychart.enums.Position.CENTER:
      x = centerX;
      y = centerY;
      break;
    case anychart.enums.Position.CENTER_BOTTOM:
      x = centerX;
      y = node.y1;
      break;
    case anychart.enums.Position.RIGHT_TOP:
      x = node.x1;
      y = node.y0;
      break;
    case anychart.enums.Position.RIGHT_CENTER:
      x = node.x1;
      y = centerY;
      break;
    case anychart.enums.Position.RIGHT_BOTTOM:
      x = node.x1;
      y = node.y1;
      break;
  }

  return {
    'value': {
      'x': /** @type {number} */ (x),
      'y': /** @type {number} */ (y)
    }
  };
};


/**
 * Creates context provider for tooltip.
 * @param {Object} tag
 * @return {anychart.format.Context}
 */
anychart.sankeyModule.Chart.prototype.createContextProvider = function(tag) {
  if (!this.contextProvider_)
    this.contextProvider_ = new anychart.format.Context();

  var values = {};
  var element = /** @type {anychart.sankeyModule.Chart.Node|anychart.sankeyModule.Chart.Flow} */ (tag.element);
  this.createContextValues(values, element);
  if (element.type != anychart.sankeyModule.Chart.ElementType.NODE) {
    var iterator = this.getIterator();
    iterator.select(element.dataIndex);
    this.contextProvider_.dataSource(iterator);
  } else {
    this.contextProvider_.dataSource(null);
  }

  return /** @type {anychart.format.Context} */ (this.contextProvider_.propagate(values));
};


/**
 * Labels position for HOVERED state flows.
 * @param {anychart.sankeyModule.Chart.Flow} flow
 * @param {string=} opt_side
 * @return {{x: number, y: number}}
 */
anychart.sankeyModule.Chart.prototype.hoverNodeFlowsPositionProvider = function(flow, opt_side) {
  return {
    'x': flow[opt_side].x,
    'y': flow[opt_side].y
  };
};


/**
 * Labels position for NORMAL state flows.
 * @param {anychart.sankeyModule.Chart.Flow} flow
 * @param {string=} opt_side
 * @return {{x: number, y: number}}
 */
anychart.sankeyModule.Chart.prototype.unhoverNodeFlowsPositionProvider = function(flow, opt_side) {
  return {
    'x': /** @type {number} */ ((flow['left'] + flow['right']) / 2),
    'y': /** @type {number} */ (flow['topCenter'])
  };
};


/**
 * Colors node flows depends on state
 * @param {Array.<anychart.sankeyModule.Chart.Flow>} flowArray
 * @param {anychart.enums.Anchor} autoAnchor
 * @param {anychart.PointState|number} state
 * @param {function(anychart.sankeyModule.Chart.Flow, string=):{x:number, y:number}} positionProviderFn
 * @param {string=} opt_side
 */
anychart.sankeyModule.Chart.prototype.colorNodeFlows = function(flowArray, autoAnchor, state, positionProviderFn, opt_side) {
  var flow, flowPath;
  for (var i = 0; i < flowArray.length; i++) {
    flow = flowArray[i];
    flowPath = flow.path;
    this.setFillStroke(this.flow_, /** @type {Object} */ (flowPath.tag), flowPath, state);

    flow.label.autoAnchor(autoAnchor);
    flow.label.positionProvider({
      'value': positionProviderFn(flow, opt_side)
    });
    this.drawLabel_(this.flow_, flow, state);
  }
};


/**
 * Sets fill and stroke depends on context.
 * @param {anychart.sankeyModule.elements.VisualElement} source
 * @param {Object} tag
 * @param {acgraph.vector.Path} path
 * @param {anychart.PointState|number} state
 */
anychart.sankeyModule.Chart.prototype.setFillStroke = function(source, tag, path, state) {
  var context = this.getColorResolutionContext(tag);
  var fill = /** @type {acgraph.vector.Fill} */ (source.getFill(state, context));
  var stroke = /** @type {acgraph.vector.Stroke} */ (source.getStroke(state, context));
  path.fill(fill);
  path.stroke(stroke);
};


/**
 * Colorize node and related flows.
 * @param {acgraph.vector.Path} path
 * @param {anychart.PointState|number} state
 * @param {anychart.enums.Anchor} incomeAutoAnchor Auto anchor for related income flows.
 * @param {anychart.enums.Anchor} outcomeAutoAnchor Auto anchor for related outcome flows.
 * @param {function(anychart.sankeyModule.Chart.Flow, string=):{x:number, y:number}} positionProviderFn Labels position provider function.
 */
anychart.sankeyModule.Chart.prototype.colorizeNode = function(path, state, incomeAutoAnchor, outcomeAutoAnchor, positionProviderFn) {
  var tag = /** @type {Object} */ (path.tag);
  // sets <state> state color for node
  this.setFillStroke(this.node_, tag, path, state);
  var element = /** @type {anychart.sankeyModule.Chart.Node} */ (tag.element);
  // sets <state>> state color for node's income and outcome flows
  this.colorNodeFlows(element.incomeFlows, incomeAutoAnchor, state, positionProviderFn, 'leftTop');
  this.colorNodeFlows(element.outcomeFlows, outcomeAutoAnchor, state, positionProviderFn, 'rightTop');

  element.label.positionProvider(this.createNodeLabelsPositionProvider(element, state));

  // draws <state> label for node
  this.drawLabel_(this.node_, element, state);
};


/**
 * Colorize flow and related nodes.
 * @param {acgraph.vector.Path} path
 * @param {anychart.PointState|number} state
 */
anychart.sankeyModule.Chart.prototype.colorizeFlow = function(path, state) {
  var tag = /** @type {Object} */ (path.tag);
  var flow = /** @type {anychart.sankeyModule.Chart.Flow} */ (tag.element);
  // sets <state> state color for flow
  this.setFillStroke(this.flow_, tag, /** @type {acgraph.vector.Path} */ (flow.path), state);

  flow.label.autoAnchor(anychart.enums.Anchor.CENTER_BOTTOM);
  flow.label.positionProvider({
    'value': this.unhoverNodeFlowsPositionProvider(flow)
  });

  // sets <state> state color for FROM and TO nodes of the flow.
  this.setFillStroke(this.node_, flow.from.path.tag, flow.from.path, state);
  this.setFillStroke(this.node_, flow.to.path.tag, flow.to.path, state);

  // draws <state> label for flow
  this.drawLabel_(this.flow_, flow, state);
};


/**
 * Colorize dropoff.
 * @param {acgraph.vector.Path} path
 * @param {anychart.PointState|number} state
 */
anychart.sankeyModule.Chart.prototype.colorizeDropoff = function(path, state) {
  var tag = /** @type {Object} */ (path.tag);
  // sets <state> state color for dropoff
  this.setFillStroke(this.dropoff_, tag, path, state);

  // draws <state> label for dropoff flow
  this.drawLabel_(this.dropoff_, tag.element, state);
};


/** @inheritDoc */
anychart.sankeyModule.Chart.prototype.handleMouseOverAndMove = function(event) {
  var domTarget = /** @type {acgraph.vector.Path} */ (event['domTarget']);
  var tag = /** @type {Object} */ (domTarget.tag);
  var tooltip;

  if (tag) {
    var type = tag.element.type;

    if (type == anychart.sankeyModule.Chart.ElementType.NODE) {
      tooltip = this.node_.tooltip();

      // colorize node and all related flows
      this.colorizeNode(domTarget, anychart.PointState.HOVER, anychart.enums.Anchor.LEFT_BOTTOM, anychart.enums.Anchor.RIGHT_BOTTOM, this.hoverNodeFlowsPositionProvider);
    } else if (type == anychart.sankeyModule.Chart.ElementType.FLOW) {
      tooltip = this.flow_.tooltip();

      // colorize flow and related nodes(from, to)
      this.colorizeFlow(domTarget, anychart.PointState.HOVER);
    } else {
      tooltip = this.dropoff_.tooltip();

      // colorize dropoff flow
      this.colorizeDropoff(domTarget, anychart.PointState.HOVER);
    }
    tooltip.showFloat(event['clientX'], event['clientY'], this.createContextProvider(/** @type {Object} */ (tag)));
  } else {
    this.tooltip().hide();
  }
};


/** @inheritDoc */
anychart.sankeyModule.Chart.prototype.handleMouseOut = function(event) {
  var domTarget = /** @type {acgraph.vector.Path} */ (event['domTarget']);
  var tag = /** @type {Object} */ (domTarget.tag);
  this.tooltip().hide();
  if (tag) {
    var type = tag.element.type;

    if (type == anychart.sankeyModule.Chart.ElementType.NODE) {
      // colorize node and all related flows
      this.colorizeNode(domTarget, anychart.PointState.NORMAL, anychart.enums.Anchor.CENTER_BOTTOM, anychart.enums.Anchor.CENTER_BOTTOM, this.unhoverNodeFlowsPositionProvider);
    } else if (type == anychart.sankeyModule.Chart.ElementType.FLOW) {
      // colorize flow and related nodes(from, to)
      this.colorizeFlow(domTarget, anychart.PointState.NORMAL);
    } else {
      // colorize dropoff flow
      this.colorizeDropoff(domTarget, anychart.PointState.NORMAL);
    }
  }
};


//endregion
//region Element Settings
/**
 * Element settings invalidation handler (node, flow, dropoff).
 * @param {anychart.SignalEvent} event
 * @private
 */
anychart.sankeyModule.Chart.prototype.elementInvalidated_ = function(event) {
  var states = [];
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW_APPEARANCE)) {
    states.push(anychart.enums.State.APPEARANCE);
  }
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW_LABELS)) {
    var nodeLabels = this.isNode(/** @type {anychart.sankeyModule.elements.VisualElement} */ (event.target));
    states.push(nodeLabels ? anychart.enums.State.NODE_LABELS : anychart.enums.State.FLOW_LABELS);
  }
  this.invalidateMultiState(anychart.enums.Store.SANKEY, states, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Dropoff element settings.
 * @param {Object=} opt_value
 * @return {anychart.sankeyModule.elements.VisualElement|anychart.sankeyModule.Chart}
 */
anychart.sankeyModule.Chart.prototype.dropoff = function(opt_value) {
  if (!this.dropoff_) {
    this.dropoff_ = new anychart.sankeyModule.elements.VisualElement(this, anychart.sankeyModule.Chart.ElementType.DROPOFF);
    this.setupCreated('dropoff', this.dropoff_);
    this.dropoff_.setupElements();
    this.dropoff_.listenSignals(this.elementInvalidated_, this);
  }
  if (goog.isDef(opt_value)) {
    this.dropoff_.setup(opt_value);
    return this;
  }
  return this.dropoff_;
};


/**
 * Flow element settings.
 * @param {Object=} opt_value
 * @return {anychart.sankeyModule.elements.VisualElement|anychart.sankeyModule.Chart}
 */
anychart.sankeyModule.Chart.prototype.flow = function(opt_value) {
  if (!this.flow_) {
    this.flow_ = new anychart.sankeyModule.elements.VisualElement(this, anychart.sankeyModule.Chart.ElementType.FLOW);
    this.setupCreated('flow', this.flow_);
    this.flow_.setupElements();
    this.flow_.listenSignals(this.elementInvalidated_, this);
  }
  if (goog.isDef(opt_value)) {
    this.flow_.setup(opt_value);
    return this;
  }
  return this.flow_;
};


/**
 * Node element settings.
 * @param {Object=} opt_value
 * @return {anychart.sankeyModule.elements.VisualElement|anychart.sankeyModule.Chart}
 */
anychart.sankeyModule.Chart.prototype.node = function(opt_value) {
  if (!this.node_) {
    this.node_ = new anychart.sankeyModule.elements.VisualElement(this, anychart.sankeyModule.Chart.ElementType.NODE);
    this.setupCreated('node', this.node_);
    this.node_.setupElements();
    this.node_.listenSignals(this.elementInvalidated_, this);
  }
  if (goog.isDef(opt_value)) {
    this.node_.setup(opt_value);
    return this;
  }
  return this.node_;
};


//endregion
//region Coloring
/**
 * Getter/setter for palette.
 * @param {(anychart.palettes.RangeColors|anychart.palettes.DistinctColors|Object|Array.<string>)=} opt_value .
 * @return {!(anychart.palettes.RangeColors|anychart.palettes.DistinctColors|anychart.sankeyModule.Chart)} .
 */
anychart.sankeyModule.Chart.prototype.palette = function(opt_value) {
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
anychart.sankeyModule.Chart.prototype.setupPalette_ = function(cls, opt_cloneFrom) {
  if (anychart.utils.instanceOf(this.palette_, cls)) {
    if (opt_cloneFrom)
      this.palette_.setup(opt_cloneFrom);
  } else {
    // we dispatch only if we replace existing palette.
    var doDispatch = !!this.palette_;
    goog.dispose(this.palette_);
    this.palette_ = /** @type {anychart.palettes.DistinctColors|anychart.palettes.RangeColors} */ (new cls());
    this.setupCreated('palette', this.palette_);
    this.palette_.restoreDefaults();
    if (opt_cloneFrom)
      this.palette_.setup(opt_cloneFrom);
    this.palette_.listenSignals(this.paletteInvalidated_, this);
    if (doDispatch)
      this.invalidateState(anychart.enums.Store.SANKEY, anychart.enums.State.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Internal palette invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.sankeyModule.Chart.prototype.paletteInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidateState(anychart.enums.Store.SANKEY, anychart.enums.State.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Returns context for color resolution.
 * @param {Object} tag Tag
 * @return {Object}
 */
anychart.sankeyModule.Chart.prototype.getColorResolutionContext = function(tag) {
  var element = /** @type {anychart.sankeyModule.Chart.Node|anychart.sankeyModule.Chart.Flow} */ (tag.element);
  var type = tag.element.type;
  var palette = this.palette();

  if (type == anychart.sankeyModule.Chart.ElementType.NODE) { // node, conflict
    return {
      'id': element.id,
      'name': element.name,
      'sourceColor': palette.itemAt(element.id),
      'conflict': element.conflict
    };
  } else if (type == anychart.sankeyModule.Chart.ElementType.FLOW) { // flow
    return {
      'from': element.from.name,
      'to': element.to.name,
      'sourceColor': palette.itemAt(element.from.id)
    };
  } else { // dropoff
    return {
      'from': element.from.name,
      'sourceColor': palette.itemAt(element.from.id)
    };
  }
};


//endregion
//region Drawing
/**
 * Calculate coords for flows.
 * @param {Array.<number>} values Flow values
 * @param {number} x
 * @param {number} top
 * @return {Array}
 */
anychart.sankeyModule.Chart.prototype.calculateCoords = function(values, x, top) {
  var rv = [];
  for (var i = 0; i < values.length; i++) {
    rv.push({
      x: x,
      y1: top,
      y2: top += values[i] * this.weightAspect
    });
  }
  return rv;
};


/**
 * Element type.
 * @enum {number}
 */
anychart.sankeyModule.Chart.ElementType = {
  NODE: 0,
  FLOW: 1,
  DROPOFF: 2
};


/**
 * Element type string representation.
 * @enum {string}
 */
anychart.sankeyModule.Chart.ElementTypeString = {
  0: 'node',
  1: 'flow',
  2: 'dropoff'
};


/**
 * Default ascending compare function to sort nodes/values for
 * better user experience on drawing flows.
 * @param {anychart.sankeyModule.Chart.Node} node1
 * @param {anychart.sankeyModule.Chart.Node} node2
 * @return {number}
 */
anychart.sankeyModule.Chart.NODE_COMPARE_FUNCTION = function(node1, node2) {
  return node1.id - node2.id;
};


/**
 * Returns node center y coordinate.
 * @param {anychart.sankeyModule.Chart.Node} node
 * @return {number}
 */
anychart.sankeyModule.Chart.prototype.nodeCenter = function(node) {
  return (/** @type {number} */ (node.y0) + /** @type {number} */ (node.y1)) / 2;
};


/**
 * Weighted flow by from node.
 * @param {anychart.sankeyModule.Chart.Flow} flow
 * @return {number}
 */
anychart.sankeyModule.Chart.prototype.weightedFromNodeFlow = function(flow) {
  return this.nodeCenter(/** @type {anychart.sankeyModule.Chart.Node} */ (flow.from)) * flow.weight;
};


/**
 * Weighted flow by to node.
 * @param {anychart.sankeyModule.Chart.Flow} flow
 * @return {number}
 */
anychart.sankeyModule.Chart.prototype.weightedToNodeFlow = function(flow) {
  return this.nodeCenter(/** @type {anychart.sankeyModule.Chart.Node} */ (flow.to)) * flow.weight;
};


/**
 * Sort function for "from" node.
 * @param {anychart.sankeyModule.Chart.Flow} a
 * @param {anychart.sankeyModule.Chart.Flow} b
 * @return {number}
 */
anychart.sankeyModule.Chart.prototype.ascendingFromNodeFlowY = function(a, b) {
  return this.ascendingNodeY(/** @type {anychart.sankeyModule.Chart.Node} */ (a.from), /** @type {anychart.sankeyModule.Chart.Node} */ (b.from));
};


/**
 * Sort function for "to" node.
 * @param {anychart.sankeyModule.Chart.Flow} a
 * @param {anychart.sankeyModule.Chart.Flow} b
 * @return {number}
 */
anychart.sankeyModule.Chart.prototype.ascendingToNodeFlowY = function(a, b) {
  return this.ascendingNodeY(/** @type {anychart.sankeyModule.Chart.Node} */ (a.to), /** @type {anychart.sankeyModule.Chart.Node} */ (b.to));
};


/**
 * Sort function for node.
 * @param {anychart.sankeyModule.Chart.Node} a
 * @param {anychart.sankeyModule.Chart.Node} b
 * @return {number}
 */
anychart.sankeyModule.Chart.prototype.ascendingNodeY = function(a, b) {
  return a.y0 - b.y0;
};


/**
 * @param {number} alpha
 */
anychart.sankeyModule.Chart.prototype.relaxLeftToRight = function(alpha) {
  for (var i = 0; i < this.levels.length; i++) {
    var level = this.levels[i];
    var nodes = level.nodes;
    for (var j = 0; j < nodes.length; j++) {
      var node = nodes[j];
      if (node.incomeFlows.length) {

        var sum1 = goog.array.reduce(node.incomeFlows, function(prev, flow) {
          return prev + this.weightedFromNodeFlow(flow);
        }, 0, this);

        var sum2 = goog.array.reduce(node.incomeFlows, function(prev, flow) {
          return prev + flow.weight;
        }, 0, this);

        var dy = (sum1 / sum2 - this.nodeCenter(node)) * alpha;
        node.y0 += dy;
        node.y1 += dy;
      }
    }
  }
};


/**
 * @param {number} alpha
 */
anychart.sankeyModule.Chart.prototype.relaxRightToLeft = function(alpha) {
  var levels = /** @type {Array.<anychart.sankeyModule.Chart.Level>} */ (this.levels.slice());
  for (var i = 0; i < levels.length; i++) {
    var level = this.levels[i];
    var nodes = level.nodes;
    for (var j = 0; j < nodes.length; j++) {
      var node = nodes[j];
      if (node.outcomeFlows.length) {

        var sum1 = goog.array.reduce(node.outcomeFlows, function(prev, flow) {
          return prev + this.weightedToNodeFlow(flow);
        }, 0, this);

        var sum2 = goog.array.reduce(node.outcomeFlows, function(prev, flow) {
          return prev + flow.weight;
        }, 0, this);

        var dy = (sum1 / sum2 - this.nodeCenter(node)) * alpha;
        node.y0 += dy;
        node.y1 += dy;
      }
    }
  }
};


/**
 * Resolve collisions between nodes.
 * @param {anychart.math.Rect} bounds
 */
anychart.sankeyModule.Chart.prototype.resolveCollisions = function(bounds) {
  for (var k = 0; k < this.levels.length; k++) {
    var level = this.levels[k];
    var nodes = level.nodes.slice();
    var node;
    var y = bounds.top;
    var bottomY = y + bounds.height;
    var dy;
    var n = nodes.length;
    var i;
    var nodePadding = /** @type {number} */ (this.getOption('nodePadding'));

    nodes.sort(this.ascendingNodeY);

    for (i = 0; i < n; ++i) {
      node = nodes[i];
      dy = y - node.y0;
      if (dy > 0) {
        node.y0 += dy;
        node.y1 += dy;
      }
      y = node.y1 + nodePadding;
    }

    // If the bottommost node goes outside the bounds, push it back up.
    dy = y - nodePadding - bottomY;
    if (dy > 0) {
      node.y0 = node.y0 - dy;
      node.y1 = node.y1 - dy;
      y = node.y0;

      // Push any overlapping nodes back up.
      for (i = n - 2; i >= 0; --i) {
        node = nodes[i];
        dy = node.y1 + nodePadding - y;
        if (dy > 0) {
          node.y0 = node.y0 - dy;
          node.y1 = node.y1 - dy;
        }
        y = node.y0;
      }
    }
  }
};


/**
 * Interpolator.
 * @param {number} a
 * @param {number} b
 * @return {Function}
 */
anychart.sankeyModule.Chart.prototype.interpolateNumber = function(a, b) {
  return function(t) {
    return a * (1 - t) + b * t;
  };
};


/**
 * Apply normal appearance for path elements.
 * @param {Array.<acgraph.vector.Path>} arr Array of path elements
 * @param {anychart.sankeyModule.elements.VisualElement} source
 */
anychart.sankeyModule.Chart.prototype.applyAppearance = function(arr, source) {
  var i, path;
  for (i = 0; i < arr.length; i++) {
    path = /** @type {acgraph.vector.Path} */ (arr[i]);
    this.setFillStroke(source, /** @type {Object} */ (path.tag), path, anychart.PointState.NORMAL);
  }
};


/** @inheritDoc */
anychart.sankeyModule.Chart.prototype.drawContent = function(bounds) {
  if (this.isConsistent())
    return;

  // calculates everything that can be calculated from data
  this.calculate();

  if (!this.rootLayer) {
    this.rootLayer = this.rootElement.layer();
    this.rootLayer.zIndex(anychart.sankeyModule.Chart.ZINDEX_SANKEY);
    //We need create elements here because now we don't call setupByJson method.
    this.node();
    this.flow();
    this.dropoff();
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.rootLayer.removeChildren();
    this.node_.labels().invalidate(anychart.ConsistencyState.CONTAINER);
    this.flow_.labels().invalidate(anychart.ConsistencyState.CONTAINER);
    this.dropoff_.labels().invalidate(anychart.ConsistencyState.CONTAINER);
    this.dropoffPaths = [];
    this.nodePaths = [];
    this.flowPaths = [];
    this.hoverPaths = [];

    var level, nodes;
    var levelsCount, levelWidth;
    var dropOffPadding;
    var lastNodeDropOffPadding;

    var flow, node;

    var nodePadding = /** @type {number} */ (this.getOption('nodePadding'));
    var nodeWidth = /** @type {string|number} */ (this.getOption('nodeWidth'));

    if (this.levels.length) {
      levelsCount = this.levels.length;
      levelWidth = bounds.width / levelsCount;
      nodeWidth = anychart.utils.normalizeSize(nodeWidth, levelWidth);
      dropOffPadding = nodeWidth * 0.3;
    } else {
      levelWidth = nodeWidth = dropOffPadding = levelsCount = 0;
    }
    var emptyLevelSpace = levelWidth - nodeWidth;

    var i, j;

    var weightAspects = [], aspect;
    for (i = 0; i < this.levels.length; i++) {
      level = this.levels[i];
      nodes = level.nodes;
      lastNodeDropOffPadding = nodes[nodes.length - 1].dropoffValue ? dropOffPadding : 0;
      aspect = (bounds.height - lastNodeDropOffPadding - nodePadding * (nodes.length - 1)) / level.weight;
      weightAspects.push(aspect);
    }
    this.weightAspect = Math.min.apply(null, weightAspects);

    var kx = (bounds.width - nodeWidth) / (levelsCount - 1);
    for (i = 0; i < this.levels.length; i++) {
      level = this.levels[i];
      nodes = level.nodes;
      for (j = 0; j < nodes.length; j++) {
        node = nodes[j];
        // node.x0 = bounds.left + node.level * levelWidth + emptyLevelSpace / 2;
        node.x0 = bounds.left + (node.level * kx);
        node.x1 = node.x0 + nodeWidth;
        node.y0 = bounds.top + j;
        node.y1 = node.y0 + node.weight * this.weightAspect;
      }
    }

    for (var dataIndex in this.flows) {
      flow = this.flows[dataIndex];
      flow.height = flow.weight * this.weightAspect;
    }

    this.resolveCollisions(bounds);
    for (var alpha = 1, n = 32; n > 0; --n) {
      alpha = alpha * 0.99;
      this.relaxRightToLeft(alpha);
      this.resolveCollisions(bounds);
      this.relaxLeftToRight(alpha);
      this.resolveCollisions(bounds);
    }

    for (name in this.nodes) {
      node = this.nodes[name];
      node.outcomeFlows.sort(this.ascendingToNodeFlowY);
      node.incomeFlows.sort(this.ascendingFromNodeFlowY);
    }

    var x0, x1, x2, x3, xi, y0, y1, y2;
    for (name in this.nodes) {
      node = this.nodes[name];
      y0 = y1 = node.y0;

      for (i = 0; i < node.outcomeFlows.length; i++) {
        flow = node.outcomeFlows[i];
        flow.y0 = y0 + flow.height / 2;
        y0 += flow.height;
      }

      for (i = 0; i < node.incomeFlows.length; i++) {
        flow = node.incomeFlows[i];
        flow.y1 = y1 + flow.height / 2;
        y1 += flow.height;
      }
    }

    var path;
    for (name in this.nodes) {
      node = this.nodes[name];
      path = this.rootLayer.path();
      path.zIndex(3);
      this.nodePaths.push(path);

      path.tag = {
        element: node
      };
      node.path = path;
      node.x0 = anychart.utils.applyPixelShift(anychart.math.round(/** @type {number} */ (node.x0), 4), 1);
      node.y0 = anychart.utils.applyPixelShift(anychart.math.round(/** @type {number} */ (node.y0), 4), 1);
      node.x1 = anychart.utils.applyPixelShift(anychart.math.round(/** @type {number} */ (node.x1), 4), 1);
      node.y1 = anychart.utils.applyPixelShift(anychart.math.round(/** @type {number} */ (node.y1), 4), 1);

      path
          .moveTo(node.x0, node.y0)
          .lineTo(node.x1, node.y0)
          .lineTo(node.x1, node.y1)
          .lineTo(node.x0, node.y1)
          .lineTo(node.x0, node.y0)
          .close();
    }

    var curveFactor = /** @type {number} */ (this.getOption('curveFactor'));
    for (dataIndex in this.flows) {
      flow = this.flows[dataIndex];
      if (flow.to) {
        path = this.rootLayer.path();
        path.zIndex(1);
        this.flowPaths.push(path);

        path.tag = {
          element: flow
        };

        flow.path = path;

        x0 = /** @type {number} */ (flow.from.x1);
        x1 = /** @type {number} */ (flow.to.x0);
        y0 = /** @type {number} */ (flow.y0);
        y1 = /** @type {number} */ (flow.y1);

        xi = this.interpolateNumber(x0, x1);
        x2 = xi(curveFactor);
        x3 = xi(1 - curveFactor);

        var halfHeight = flow.height / 2;

        flow['left'] = x0;
        flow['right'] = x1;
        flow['topCenter'] = (y0 + y1) / 2 - halfHeight;
        flow['leftTop'] = {x: x0, y: y0 - halfHeight};
        flow['rightTop'] = {x: x1, y: y1 - halfHeight};

        var y0top = y0 - halfHeight;
        var y1top = y1 - halfHeight;
        var y0bot = y0 + halfHeight;
        var y1bot = y1 + halfHeight;

        path
            .moveTo(x0, y0top)
            .curveTo(x2, y0top, x3, y1top, x1, y1top)
            .lineTo(x1, y1bot)
            .curveTo(x3, y1bot, x2, y0bot, x0, y0bot)
            .lineTo(x0, y0top);

        // hover gap for low-thickness flows to make interactivity more comfortable
        if (flow.height < 3) {
          var hoverPath = this.rootLayer.path();
          hoverPath.zIndex(2);
          this.hoverPaths.push(hoverPath);

          hoverPath
              .fill(anychart.color.TRANSPARENT_HANDLER)
              .stroke(/** @type {acgraph.vector.SolidFill} */(anychart.color.TRANSPARENT_HANDLER), 3);

          hoverPath
              .moveTo(x0, y0top)
              .curveTo(x2, y0top, x3, y1top, x1, y1top)
              .lineTo(x1, y1bot)
              .curveTo(x3, y1bot, x2, y0bot, x0, y0bot)
              .lineTo(x0, y0top);

          hoverPath.tag = {
            element: flow
          };
        }


        /*path
            .moveTo(x0, y0top)
            .curveTo(x2, y0top, x3, y1top, x1, y1top)
            .lineTo(x1, y1bot)
            .moveTo(x0, y0top)
            .lineTo(x0, y0bot)
            //.moveTo(x0, y0 + halfHeight)
            .curveTo(x2, y0bot, x3, y1bot, x1, y1bot);*/

      } else {
        // dropoff flow
        var height = flow.from.dropoffValue * this.weightAspect;
        var radius = Math.min(height, nodeWidth / 4);

        x0 = flow.from.x1;
        x1 = x0 + radius;
        y2 = flow.from.y1;
        y1 = y2 - height;

        path = this.rootLayer.path();
        path.zIndex(1);
        this.dropoffPaths.push(path);

        path.tag = {
          element: flow
        };

        flow.path = path;
        flow.rightX = x1;
        flow.rightY = y2;

        path
            .moveTo(x0, y1)
            .arcTo(radius, radius, -90, 90);

        if (y1 + radius < y2)
          path.lineTo(x1, y2);

        path
            .lineTo((x0 + x1) / 2, y2 + dropOffPadding)
            .lineTo(x0, y2)
            .close();
      }
    }

    //region OLD DRAWING
    // old
    /*for (i = 0; i < 0; i++) {
      level = this.levels[i];
      nodesLength = level.nodes.length;
      var pixelHeight = level.weight * this.weightAspect;
      lastNodeDropOffPadding = level.nodes[nodesLength - 1].dropoffValue ? dropOffPadding : 0;

      var height = (nodesLength - 1) * levelPadding + pixelHeight + lastNodeDropOffPadding;
      if (height > bounds.height) {
        height = bounds.height;
        levelPadding = (height - pixelHeight - lastNodeDropOffPadding) / (nodesLength - 1);
      }
      level.top = bounds.top + (bounds.height - height) / 2;

      var lastTop = level.top;
      var index;

      for (j = 0; j < nodesLength; j++) {
        var node = level.nodes[j];
        var nodeHeight = node.weight * this.weightAspect;

        var path = this.rootLayer.path();
        path.zIndex(2);
        this.nodePaths.push(path);

        path.tag = {
          type: anychart.sankeyModule.Chart.ElementType.NODE,
          node: node
        };
        node.path = path;

        var nodeLeft = bounds.left + (i * levelWidth) + (levelWidth - nodeWidth) / 2;
        var nodeTop = lastTop;
        var nodeRight = nodeLeft + nodeWidth;
        var nodeBottom = nodeTop + nodeHeight;

        nodeLeft = anychart.utils.applyPixelShift(nodeLeft, 1);
        nodeTop = anychart.utils.applyPixelShift(nodeTop, 1);
        nodeRight = anychart.utils.applyPixelShift(nodeRight, 1);
        nodeBottom = anychart.utils.applyPixelShift(nodeBottom, 1);

        node.top = nodeTop;
        node.right = nodeRight;
        node.bottom = nodeBottom;
        node.left = nodeLeft;

        var sortedNodes, sortedValues, sortedFlows, k;
        if (!isNaN(node.incomeValue) && node.incomeValue) {
          sortedNodes = Array.prototype.slice.call(node.incomeNodes, 0);
          goog.array.sort(sortedNodes, anychart.sankeyModule.Chart.NODE_COMPARE_FUNCTION);
          sortedValues = [];
          sortedFlows = [];
          for (k = 0; k < sortedNodes.length; k++) {
            index = goog.array.indexOf(node.incomeNodes, sortedNodes[k]);
            sortedValues.push(node.incomeValues[index]);
            sortedFlows.push(node.incomeFlows[index]);
          }

          node.incomeValues = sortedValues;
          node.incomeNodes = sortedNodes;
          node.incomeFlows = sortedFlows;

          node.incomeCoords = this.calculateCoords(node.incomeValues, nodeLeft, nodeTop);
        }

        if (node.outcomeValue) {
          sortedNodes = Array.prototype.slice.call(node.outcomeNodes, 0);
          goog.array.sort(sortedNodes, anychart.sankeyModule.Chart.NODE_COMPARE_FUNCTION);
          sortedValues = [];
          sortedFlows = [];
          for (k = 0; k < sortedNodes.length; k++) {
            index = goog.array.indexOf(node.outcomeNodes, sortedNodes[k]);
            sortedValues.push(node.outcomeValues[index]);
            sortedFlows.push(node.outcomeFlows[index]);
          }

          node.outcomeValues = sortedValues;
          node.outcomeNodes = sortedNodes;
          node.outcomeFlows = sortedFlows;

          node.outcomeCoords = this.calculateCoords(node.outcomeValues, nodeRight, nodeTop);
        }

        path
            .moveTo(nodeLeft, nodeTop)
            .lineTo(nodeRight, nodeTop)
            .lineTo(nodeRight, nodeBottom)
            .lineTo(nodeLeft, nodeBottom)
            .lineTo(nodeLeft, nodeTop)
            .close();

        lastTop = nodeBottom + levelPadding;
      }
    } */

    // var curvy = /** @type {number} */ (this.getOption('curveFactor')) * (bounds.width - nodeWidth) / (this.levels.length - 1);

    /*for (var dataIndex in this.flows) {
      var flow = this.flows[dataIndex];
      var fromNode = flow.from;
      var toNode = flow.to;
      if (toNode) {
        var indexFrom = goog.array.indexOf(fromNode.outcomeFlows, flow);
        var indexTo = goog.array.indexOf(toNode.incomeFlows, flow);

        var fromCoords = fromNode.outcomeCoords[indexFrom];
        var toCoords = toNode.incomeCoords[indexTo];

        path = this.rootLayer.path();
        path.zIndex(1);

        path.tag = {
          type: anychart.sankeyModule.Chart.ElementType.FLOW,
          flow: flow
        };

        this.flowPaths.push(path);
        flow.path = path;

        flow['left'] = fromCoords.x;
        flow['right'] = toCoords.x;
        flow.top = Math.min(fromCoords.y1, toCoords.y1);    // highest y coordinate
        flow.bottom = Math.max(fromCoords.y2, toCoords.y2); // lowest y coordinate
        flow['topCenter'] = (fromCoords.y1 + toCoords.y1) / 2;
        flow.bottomCenter = (fromCoords.y2 + toCoords.y2) / 2;

        flow['leftTop'] = {x: fromCoords.x, y: fromCoords.y1};
        flow['rightTop'] = {x: toCoords.x, y: toCoords.y1};
        flow.rightBottom = {x: toCoords.x, y: toCoords.y2};
        flow.leftBottom = {x: fromCoords.x, y: fromCoords.y2};

        path
            .moveTo(fromCoords.x, fromCoords.y1)
            .curveTo(fromCoords.x + curvy, fromCoords.y1, toCoords.x - curvy, toCoords.y1, toCoords.x, toCoords.y1)
            .lineTo(toCoords.x, toCoords.y2)
            .curveTo(toCoords.x - curvy, toCoords.y2, fromCoords.x + curvy, fromCoords.y2, fromCoords.x, fromCoords.y2)
            .lineTo(fromCoords.x, fromCoords.y1)
            .close();
      } else {
        // dropoff flow
        height = fromNode.dropoffValue * this.weightAspect;
        var left = /!** @type {number} *!/ (fromNode.right);
        var radius = Math.min(height, nodeWidth / 4);
        var right = left + radius;
        var y2 = /!** @type {number} *!/ (fromNode.bottom);
        var y1 = y2 - height;

        path = this.rootLayer.path();
        path.zIndex(1);

        path.tag = {
          type: anychart.sankeyModule.Chart.ElementType.DROPOFF,
          from: fromNode,
          flow: flow
        };

        this.dropoffPaths.push(path);
        flow.path = path;
        flow.rightX = right;
        flow.rightY = y2;

        path
            .moveTo(left, y1)
            .arcTo(radius, radius, -90, 90);

        if (y1 + radius < y2)
          path.lineTo(right, y2);

        path
            .lineTo((left + right) / 2, y2 + dropOffPadding)
            .lineTo(left, y2)
            .close();
      }
    } */
    //endregion

    this.invalidateMultiState(anychart.enums.Store.SANKEY, [
      anychart.enums.State.APPEARANCE,
      anychart.enums.State.NODE_LABELS,
      anychart.enums.State.FLOW_LABELS
    ]);
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  if (this.hasStateInvalidation(anychart.enums.Store.SANKEY, anychart.enums.State.APPEARANCE)) {
    this.applyAppearance(this.nodePaths, this.node_);
    this.applyAppearance(this.flowPaths, this.flow_);
    this.applyAppearance(this.dropoffPaths, this.dropoff_);

    this.markStateConsistent(anychart.enums.Store.SANKEY, anychart.enums.State.APPEARANCE);
  }

  var labelsFormatProvider, labelsPositionProvider, labelIndex;
  if (this.hasStateInvalidation(anychart.enums.Store.SANKEY, anychart.enums.State.NODE_LABELS)) {
    var labels = this.node_.labels();
    labels.clear().container(this.rootLayer).zIndex(3);

    for (var name in this.nodes) {
      node = /** @type {anychart.sankeyModule.Chart.Node} */ (this.nodes[name]);
      labelIndex = node.id;
      labelsFormatProvider = this.createLabelsContextProvider(node, true);
      labelsPositionProvider = this.createNodeLabelsPositionProvider(node, anychart.PointState.NORMAL);

      node.label = labels.add(labelsFormatProvider, labelsPositionProvider, labelIndex);
      this.drawLabel_(this.node_, node, anychart.PointState.NORMAL);
    }
    labels.draw();

    this.node_.markLabelsConsistent();
    this.markStateConsistent(anychart.enums.Store.SANKEY, anychart.enums.State.NODE_LABELS);
  }

  if (this.hasStateInvalidation(anychart.enums.Store.SANKEY, anychart.enums.State.FLOW_LABELS)) {
    var flowLabels = this.flow_.labels();
    var dropoffLabels = this.dropoff_.labels();

    flowLabels.clear().container(this.rootLayer).zIndex(3);
    dropoffLabels.clear().container(this.rootLayer).zIndex(3);

    var fromNode, toNode;
    for (dataIndex in this.flows) {
      flow = /** @type {anychart.sankeyModule.Chart.Flow} */ (this.flows[dataIndex]);
      labelIndex = anychart.utils.toNumber(dataIndex);
      fromNode = flow.from;
      toNode = flow.to;

      labelsFormatProvider = this.createLabelsContextProvider(flow, true);
      if (toNode) {
        labelsPositionProvider = {
          'value': this.unhoverNodeFlowsPositionProvider(flow)
        };
        flow.label = flowLabels.add(labelsFormatProvider, labelsPositionProvider, labelIndex);
        flow.label.autoAnchor(anychart.enums.Anchor.CENTER_BOTTOM);
      } else {
        labelsPositionProvider = {
          'value': {
            'x': flow.rightX,
            'y': flow.rightY
          }
        };
        flow.label = dropoffLabels.add(labelsFormatProvider, labelsPositionProvider, labelIndex);
        flow.label.autoAnchor(anychart.enums.Anchor.LEFT_CENTER);
      }

      this.drawLabel_(toNode ? this.flow_ : this.dropoff_, flow, anychart.PointState.NORMAL);
    }
    flowLabels.draw();
    dropoffLabels.draw();

    this.flow_.markLabelsConsistent();
    this.dropoff_.markLabelsConsistent();
    this.markStateConsistent(anychart.enums.Store.SANKEY, anychart.enums.State.FLOW_LABELS);
  }
};


/**
 * Check if the passed element is node.
 * @param {anychart.sankeyModule.elements.VisualElement} element
 * @return {boolean}
 */
anychart.sankeyModule.Chart.prototype.isNode = function(element) {
  return (element.getType() == anychart.sankeyModule.Chart.ElementType.NODE);
};


/**
 * Draws specified label.
 * @param {anychart.sankeyModule.elements.VisualElement} source
 * @param {anychart.sankeyModule.Chart.Node|anychart.sankeyModule.Chart.Flow} element
 * @param {anychart.PointState|number} state
 * @private
 */
anychart.sankeyModule.Chart.prototype.drawLabel_ = function(source, element, state) {
  var label = /** @type {anychart.core.ui.LabelsFactory.Label} */ (element.label);
  if (label) {
    var draw;
    var pointNormalLabel, pointHoveredLabel;
    var iterator = this.getIterator();
    this.isNode(source) ? iterator.reset() : iterator.select(element.dataIndex);

    pointNormalLabel = iterator.get('normal');
    pointNormalLabel = goog.isDef(pointNormalLabel) ? pointNormalLabel['label'] : void 0;
    pointHoveredLabel = iterator.get('hovered');
    pointHoveredLabel = goog.isDef(pointHoveredLabel) ? pointHoveredLabel['label'] : void 0;
    var pointLabel = anychart.utils.getFirstDefinedValue(pointNormalLabel, iterator.get('label'), null);
    var hoverLabel = anychart.utils.getFirstDefinedValue(pointHoveredLabel, iterator.get('hoverLabel'), null);

    var pointState = state ? hoverLabel : null;
    var pointNormal = pointLabel;

    var elementState = state ? source.hovered().labels() : null;
    var elementNormal = source.normal().labels();
    var elementStateTheme = state ? source.hovered().labels().themeSettings : null;
    var elementNormalTheme = source.normal().labels().themeSettings;

    var pointStateLabelsEnabled = pointState && goog.isDef(pointState['enabled']) ? pointState['enabled'] : null;
    var pointNormalLabelsEnabled = pointNormal && goog.isDef(pointNormal['enabled']) ? pointNormal['enabled'] : null;
    var elementStateLabelsEnabled = elementState && !goog.isNull(elementState.enabled()) ? elementState.enabled() : null;
    var elementNormalEnabled = elementNormal && !goog.isNull(elementNormal.enabled()) ? elementNormal.enabled() : null;

    draw = false;
    if (goog.isDefAndNotNull(pointStateLabelsEnabled)) {
      draw = pointStateLabelsEnabled;
    } else if (goog.isDefAndNotNull(pointNormalLabelsEnabled)) {
      draw = pointNormalLabelsEnabled;
    } else if (goog.isDefAndNotNull(elementStateLabelsEnabled)) {
      draw = elementStateLabelsEnabled;
    } else {
      draw = elementNormalEnabled;
    }

    if (draw) {
      label.enabled(true);

      label.state('labelOwnSettings', label.ownSettings, 0);
      label.state('pointState', /** @type {?Object} */ (pointState), 1);
      label.state('pointNormal', /** @type {?Object} */ (pointLabel), 2);

      label.state('elementState', elementState, 3);
      label.state('elementNormal', elementNormal, 4);

      label.state('elementStateTheme', elementStateTheme, 5);
      label.state('auto', label.autoSettings, 6);

      label.state('elementNormalTheme', elementNormalTheme, 7);
    } else {
      label.enabled(false);
    }
    label.draw();
  }
};


//endregion
//region CSV
/** @inheritDoc */
anychart.sankeyModule.Chart.prototype.getDataHolders = function() {
  return /** @type {Array.<{data: function():anychart.data.IDataSource}>} */([this]);
};


/** @inheritDoc */
anychart.sankeyModule.Chart.prototype.getCsvColumns = function(dataHolder) {
  return ['from', 'to', 'weight'];
};


//endregion
//region Serialize / Setup / Dispose
/** @inheritDoc */
anychart.sankeyModule.Chart.prototype.serialize = function() {
  var json = anychart.sankeyModule.Chart.base(this, 'serialize');

  json['data'] = this.data().serialize();
  json['tooltip'] = this.tooltip().serialize();
  json['palette'] = this.palette().serialize();

  json['dropoff'] = this.dropoff().serialize();
  json['flow'] = this.flow().serialize();
  json['node'] = this.node().serialize();

  anychart.core.settings.serialize(this, anychart.sankeyModule.Chart.OWN_DESCRIPTORS, json);

  return {'chart': json};
};


/** @inheritDoc */
anychart.sankeyModule.Chart.prototype.setupByJSON = function(config, opt_default) {
  anychart.sankeyModule.Chart.base(this, 'setupByJSON', config, opt_default);
  if ('data' in config)
    this.data(config['data']);
  this.palette(config['palette']);

  if ('tooltip' in config)
    this.tooltip().setupInternal(!!opt_default, config['tooltip']);
  if ('dropoff' in config)
    this.dropoff().setupInternal(!!opt_default, config['dropoff']);
  if ('flow' in config)
    this.flow().setupInternal(!!opt_default, config['flow']);
  if ('node' in config) {
    this.node().setupInternal(!!opt_default, config['node']);
  }
  anychart.core.settings.deserialize(this, anychart.sankeyModule.Chart.OWN_DESCRIPTORS, config, opt_default);
};


/** @inheritDoc */
anychart.sankeyModule.Chart.prototype.disposeInternal = function() {
  goog.disposeAll(
      this.palette_,
      this.dropoff_,
      this.flow_,
      this.node_,
      this.tooltip_,
      this.dropoffPaths,
      this.nodePaths,
      this.flowPaths,
      this.hoverPaths,
      this.data_,
      this.parentViewToDispose_);
  this.palette_ = null;
  this.dropoff_ = null;
  this.flow_ = null;
  this.node_ = null;
  this.tooltip_ = null;
  this.dropoffPaths.length = 0;
  this.nodePaths.length = 0;
  this.flowPaths.length = 0;
  this.hoverPaths.length = 0;
  this.data_ = null;
  this.parentViewToDispose_ = null;
  this.iterator_ = null;

  anychart.sankeyModule.Chart.base(this, 'disposeInternal');
};


//endregion
//region Exports
//exports
(function() {
  var proto = anychart.sankeyModule.Chart.prototype;
  // common
  proto['getType'] = proto.getType;
  proto['data'] = proto.data;
  proto['noData'] = proto.noData;
  proto['tooltip'] = proto.tooltip;

  // elements settings
  proto['dropoff'] = proto.dropoff;
  proto['flow'] = proto.flow;
  proto['node'] = proto.node;

  // palettes
  proto['palette'] = proto.palette;

  // auto generated
  // proto['nodePadding'] = proto.nodePadding;
  // proto['nodeWidth'] = proto.nodeWidth;
  // proto['curveFactor'] = proto.curveFactor;
})();
//endregion
