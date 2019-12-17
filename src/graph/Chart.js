//region Provide and require
goog.provide('anychart.graphModule.Chart');

goog.require('anychart.core.Chart');
goog.require('anychart.core.ui.LabelsSettings');
goog.require('anychart.graphModule.elements.Edge');
goog.require('anychart.graphModule.elements.Group');
goog.require('anychart.graphModule.elements.Interactivity');
goog.require('anychart.graphModule.elements.Layout');
goog.require('anychart.graphModule.elements.Node');
goog.require('goog.Timer');
goog.require('goog.events.MouseWheelHandler');
goog.require('goog.fx.Dragger');
goog.require('goog.math.AffineTransform');
goog.require('goog.math.Coordinate');
goog.require('goog.math.Rect');


//endregion
//region Constructor
//TODO jsdoc
/**
 * @constructor
 * @param {Object=} opt_data
 * @extends {anychart.core.Chart}
 */
anychart.graphModule.Chart = function(opt_data) {
  anychart.graphModule.Chart.base(this, 'constructor');

  this.addThemes('graph');

  /**
   * Map where key is nodeId, value is node data.
   * @type {Object.<string, anychart.graphModule.Chart.Node>}
   * @private
   */
  this.nodesMap_ = {};

  /**
   * Map where key is groupId, value is settings for group.
   * @type {Object.<string, ?anychart.graphModule.elements.Group>}
   * @private
   */
  this.groupsMap_ = {};

  /**
   * Map where key is graph, value is array with ids of node of this graph.
   * @type {Object.<string, Array.<string>>}
   * @private
   */
  this.subGraphGroups_ = {};

  /**
   * Array with all nodes.
   * @type {?Array.<anychart.graphModule.Chart.Node>}
   * @private
   */
  this.nodesArray_ = null;

  /**
   * Array with all edges.
   * @type {?Array.<anychart.graphModule.Chart.Edge>}
   * @private
   */
  this.edgesArray_ = null;

  /**
   * Map with all edges.
   * @type {Object.<string, anychart.graphModule.Chart.Edge>}
   * @private
   */
  this.edgesMap_ = {};

  /**
   * Selected nodes.
   * @type {Object.<string, {id: string, type:anychart.graphModule.Chart.Element}>}
   * @private
   */
  this.selectedNodes_ = {};

  /**
   * Selected edges.
   * @type {Object.<string, {id: string, type:anychart.graphModule.Chart.Element}>}
   * @private
   */
  this.selectedEdges_ = {};

  /**
   * Mouse wheel handler.
   * @type {?goog.events.MouseWheelHandler}
   * @private
   */
  this.mouseWheelHandler_ = null;

  /**
   * Events interceptor rectangle.
   * @type {acgraph.vector.Rect}
   * @private
   */
  this.eventsInterceptor_ = null;

  /**
   * Dragger
   * @type {goog.fx.Dragger}
   * @private
   */
  this.dragger_ = null;

  /**
   * Data for chart.
   * @type {
   *  {
   *    nodes: anychart.data.View,
   *    edges: anychart.data.View,
   * }}
   * @private
   */
  this.data_ = {'nodes': null, 'edges': null};

  /**
   * Transformation matrix for main layer.
   * @type {goog.math.AffineTransform}
   * @private
   */
  this.transformationMatrix_ = new goog.math.AffineTransform();

  /**
   * Delay call function
   * @type {Function}
   */
  this.debounceFuntion = this.debounce(this);

  /**
   * Prevent click after drag.
   * @type {boolean}
   */
  this.preventClickAfterDrag = false;

  /**
   * Rotation degree
   * @type {number}
   * @private
   */
  this.chartRotation_ = 0;

  /**
   * Degree we need to rotate chart on.
   * @type {number}
   * @private
   */
  this.rotateOn_ = 0;

  /**
   *
   * @type {number}
   */
  this.nodesDx = 0;

  /**
   *
   * @type {number}
   */
  this.nodesDy = 0;

  /**
   *
   * @type {boolean}
   */
  this.isfixed = false;

  /**
   * Does drag element dragging.
   * Call dragger.isDragging() returns true if no move made.
   * @type {boolean}
   * @private
   */
  this.isDraggerDragging_ = false;

  this.data(opt_data);
};
goog.inherits(anychart.graphModule.Chart, anychart.core.Chart);


anychart.consistency.supportStates(anychart.graphModule.Chart, anychart.enums.Store.GRAPH, [
  anychart.enums.State.APPEARANCE,
  anychart.enums.State.DATA,
  anychart.enums.State.LABELS_BOUNDS,
  anychart.enums.State.LABELS_ENABLED,
  anychart.enums.State.LABELS_STYLE,
  anychart.enums.State.LAYOUT,
  anychart.enums.State.TRANSFORM,
  anychart.enums.State.ROTATE,
  anychart.enums.State.NODES,
  anychart.enums.State.EDGES
]);


/**
 * @typedef {{
 *  index: number,
 *  id: string,
 *  groupId: (string|undefined),
 *  dataRow: number,
 *  position: {
 *    x:number,
 *    y:number
 *  },
 *  currentState: anychart.SettingsState,
 *  path: (acgraph.vector.Path|undefined),
 *  optimizedText: (anychart.core.ui.OptimizedText|undefined),
 *  connectedEdges: Array.<string>,
 *  labelPosition:  (anychart.enums.Position|undefined),
 *  labelAnchor:  (anychart.enums.Anchor|undefined),
 *  repulsiveX: (number|undefined),
 *  repulsiveY: (number|undefined),
 *  attractiveX: (number|undefined),
 *  attractiveY: (number|undefined),
 *  velocityY: (number|undefined),
 *  velocityX: (number|undefined),
 *  subGraphId: (string|undefined),
 *  siblings: Array
 * }}
 */
anychart.graphModule.Chart.Node;


/**
 * @typedef {{
 *  index: number,
 *  id: string,
 *  dataRow: number,
 *  from: string,
 *  to: string,
 *  currentState: anychart.SettingsState,
 *  path: (acgraph.vector.Path|undefined),
 *  hoverPath: (acgraph.vector.Path|undefined),
 *  optimizedText: (anychart.core.ui.OptimizedText|undefined),
 *  labelDx: (number|undefined),
 *  labelDy: (number|undefined),
 *  angle: (number|undefined),
 *  pivot: (goog.math.Coordinate|undefined)
 * }}
 */
anychart.graphModule.Chart.Edge;


/**
 * @typedef {{
 *  id: string,
 *  type: anychart.graphModule.Chart.Element,
 *  currentState: anychart.SettingsState
 * }}
 */
anychart.graphModule.Chart.Tag;


/**
 * Enum for elements
 * @enum {string}
 */
anychart.graphModule.Chart.Element = {
  NODE: 'node',
  GROUP: 'group',
  EDGE: 'edge'
};


//endregion
//region Properties
/**
 * Supported signals.
 * @type {number}
 */
anychart.graphModule.Chart.prototype.SUPPORTED_SIGNALS = anychart.core.Chart.prototype.SUPPORTED_SIGNALS |
  anychart.Signal.NEEDS_REDRAW_APPEARANCE |
  anychart.Signal.NEEDS_REAPPLICATION;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.graphModule.Chart.prototype.SUPPORTED_CONSISTENCY_STATES = anychart.core.Chart.prototype.SUPPORTED_CONSISTENCY_STATES |
  anychart.ConsistencyState.APPEARANCE;


/**
 * Z-index for graph chart.
 * @type {number}
 */
anychart.graphModule.Chart.Z_INDEX = 30;


//endregion
//region Infrastructure
/** @inheritDoc */
anychart.graphModule.Chart.prototype.getType = function() {
  return anychart.enums.ChartTypes.GRAPH;
};


/** @inheritDoc */
anychart.graphModule.Chart.prototype.isNoData = function() {
  return !this.data_['nodes'] || !this.data_['nodes'].getRowsCount();
};


/** @inheritDoc */
anychart.graphModule.Chart.prototype.getAllSeries = function() {
  return [];
};


/** @inheritDoc */
anychart.graphModule.Chart.prototype.getDataHolders = function() {
  return [this];
};


/** @inheritDoc */
anychart.graphModule.Chart.prototype.toCsv = function(opt_chartDataExportMode, opt_csvSettings) {

};


//endregion
//region Tooltip data
/**
 * Creates context provider for tooltip.
 * @param {anychart.graphModule.Chart.Element} type
 * @param {string} id
 * @return {anychart.format.Context}
 */
anychart.graphModule.Chart.prototype.createContextProvider = function(type, id) {
  var provider;
  if (type == anychart.graphModule.Chart.Element.NODE) {
    var node = this.getNodeById(id);
    provider = this.nodes_.createFormatProvider(node);
  } else {
    var edge = this.getEdgeById(id);
    provider = this.edges_.createFormatProvider(edge);
  }
  return provider;
};


//endregion
//region Event handlers and interactivity
/**
 * Deselect all edges and nodes
 * @private
 */
anychart.graphModule.Chart.prototype.deselectAllElements_ = function() {
  var i;
  var element;
  for (i in this.selectedNodes_) { //deselect previous selected element
    element = this.selectedNodes_[i];
    this.updateElementStateById(element.id, anychart.graphModule.Chart.Element.NODE, anychart.SettingsState.NORMAL);
    delete this.selectedNodes_[i];
  }
  for (i in this.selectedEdges_) { //deselect previous selected element
    element = this.selectedEdges_[i];
    this.updateElementStateById(element.id, anychart.graphModule.Chart.Element.EDGE, anychart.SettingsState.NORMAL);
    delete this.selectedEdges_[i];
  }
};


/**
 * Mouse click internal handler.
 * Set selected state for selected element, deselect previous selected element if click on empty space.
 * @param {anychart.core.MouseEvent} event - Event object.
 */
anychart.graphModule.Chart.prototype.handleMouseClick = function(event) {
  if (!this.preventClickAfterDrag) {
    var tag = /** @type {anychart.graphModule.Chart.Tag} */(event['domTarget'].tag);
    if (tag) {
      var element = {id: tag.id, type: tag.type};
      var i;
      if ((!goog.userAgent.MAC && event.ctrlKey) || (goog.userAgent.MAC && event.metaKey)) {
        if (tag.currentState == anychart.SettingsState.SELECTED) {
          if (element.type == anychart.graphModule.Chart.Element.NODE) {
            this.updateElementStateById(element.id, anychart.graphModule.Chart.Element.NODE, anychart.SettingsState.NORMAL);
            delete this.selectedNodes_[element.id];
            var node = this.getNodeById(element.id);
            for (i = 0; i < node.connectedEdges.length; i++) {
              var edgeId = node.connectedEdges[i];
              this.updateElementStateById(edgeId, anychart.graphModule.Chart.Element.EDGE, anychart.SettingsState.NORMAL);
              delete this.selectedNodes_[edgeId];
            }
          } else {
            var edge = this.getEdgeById(element.id);

            this.updateElementStateById(edge.from, anychart.graphModule.Chart.Element.NODE, anychart.SettingsState.NORMAL);
            this.updateElementStateById(edge.to, anychart.graphModule.Chart.Element.NODE, anychart.SettingsState.NORMAL);
            this.updateElementStateById(edge.id, anychart.graphModule.Chart.Element.EDGE, anychart.SettingsState.NORMAL);

            delete this.selectedNodes_[edge.from];
            delete this.selectedNodes_[edge.to];
            delete this.selectedEdges_[edge.id];
          }
          return;
        }
        this.updateElementStateById(tag.id, tag.type, anychart.SettingsState.SELECTED);
      } else {
        this.deselectAllElements_();
      }
      this.updateElementStateById(tag.id, tag.type, anychart.SettingsState.SELECTED);
    } else {
      this.deselectAllElements_();
    }
  }
  this.preventClickAfterDrag = false;
};


/**
 * Handle mouseOver event handler.
 * Shows tooltip.
 * Change elements appearance if elements is't selected.
 * @param {anychart.core.MouseEvent} event - Event object.
 */
anychart.graphModule.Chart.prototype.handleMouseOver = function(event) {
  if (!this.dragger_ || !this.dragger_.isDragging()) {
    var domTarget = event['domTarget'];
    var tag = /** @type {anychart.graphModule.Chart.Tag} */(domTarget.tag);
    var tooltip;
    if (tag) {
      var type = tag.type;
      var id = tag.id;
      var state = tag.currentState;
      this.tooltip().hide();
      if (state != anychart.SettingsState.SELECTED) {
        this.updateElementStateById(id, type, anychart.SettingsState.HOVERED);
      }
      if (type == anychart.graphModule.Chart.Element.NODE) {
        tooltip = this.nodes_.tooltip();
      } else if (type == anychart.graphModule.Chart.Element.EDGE) {
        if (this.interactivity_.getOption('edges'))
          tooltip = this.edges_.tooltip();
      }
      if (tooltip)
        tooltip.showFloat(event['clientX'], event['clientY'], this.createContextProvider(type, id));
    } else {
      this.tooltip().hide();
    }
  }
};


/**
 * Mouse mouseMove handler.
 * Update only tooltip position.
 * Don't affect nodes appearance.
 * @param {anychart.core.MouseEvent} event - Event object.
 */
anychart.graphModule.Chart.prototype.handleMouseMove = function(event) {
  if (!this.dragger_ || !this.dragger_.isDragging()) { //Prevent display tooltip when node is dragging.
    var domTarget = event['domTarget'];
    var tag = /** @type {anychart.graphModule.Chart.Tag} */(domTarget.tag);
    var tooltip;
    if (tag) {
      var type = tag.type;
      var id = tag.id;
      this.tooltip().hide();
      if (tag.type == anychart.graphModule.Chart.Element.NODE) {
        tooltip = this.nodes_.tooltip();
      } else if (tag.type == anychart.graphModule.Chart.Element.EDGE) {
        if (this.interactivity_.getOption('edges'))
          tooltip = this.edges_.tooltip();
      }
      if (tooltip)
        tooltip.showFloat(event['clientX'], event['clientY'], this.createContextProvider(type, id));
    } else {
      this.tooltip().hide();
    }
  }
};


/**
 * Context menu handler.
 * Show context menu only for layer long press.
 * @param {acgraph.events.BrowserEvent} event - Context menu event.
 */
anychart.graphModule.Chart.prototype.handleContextMenu = function(event) {
  if (!event.target.tag) {
    this.handleBrowserEvent(event);
  }
};


/**
 * Setup two touch listeners, one for long press, second for simple touch.
 * TODO(anton.chengaev): Need to implement pitch-to-zoom and rework dragger.
 */
anychart.graphModule.Chart.prototype.initTouchHandlers = function() {
  var timeout = 300;
  var timerId = null;
  var isLongPressDone = false;

  // If user pressing graph element greater 300 millisecond, do select for element.
  this.eventsHandler.listen(this, acgraph.events.EventType.TOUCHSTART, function(event) {
    isLongPressDone = false;

    timerId = goog.Timer.callOnce(function() {
      // Prevent select if element is dragging.
      if (!this.isDraggerDragging_) {
        this.preventClickAfterDrag = false;
        // Do select.
        this.handleMouseClick(event);
      }

      isLongPressDone = true;
    }, timeout, this);
  });

  // If less than 300 milliseconds show tooltip.
  this.eventsHandler.listen(this, acgraph.events.EventType.TOUCHEND, function(event) {
    // Clear timer with event we create inside 'touchstart'
    goog.Timer.clear(timerId);
    if (!isLongPressDone) {
      this.handleMouseMove(event);
    }
  });
};


/**
 * Scale up layer with elements.
 * @param {number} scale Scale factor.
 * @param {number} x scaling point x.
 * @param {number} y scaling point y.
 * @private
 */
anychart.graphModule.Chart.prototype.doLayerScale_ = function(scale, x, y) {
  this.transformationMatrix_.preScale(scale, scale);
  this.transformationMatrix_.preTranslate((x || 0) * (1 - scale), (y || 0) * (1 - scale));
  this.updateTransformationMatrixForLayer_();
};


/**
 * Move layer with elements.
 * @param {number} dx
 * @param {number} dy
 * @private
 */
anychart.graphModule.Chart.prototype.doLayerTranslate_ = function(dx, dy) {
  this.transformationMatrix_.translate(dx, dy);
  this.updateTransformationMatrixForLayer_(); //update it here instead drawContent method because that works smoother.
};


/**
 * Place layers into dom.
 */
anychart.graphModule.Chart.prototype.setParentForLayers = function() {
  this.layerWithEdges.parent(this.edgesLayer_);
};


/**
 * Remove layers from dom.
 */
anychart.graphModule.Chart.prototype.unparentLayers = function() {
  this.layerWithEdges.parent(null);
};


/**
 * Create and return function that invoke after some delay.
 * @param {anychart.graphModule.Chart} scope
 * @return {Function}
 */
anychart.graphModule.Chart.prototype.debounce = function(scope) {
  var timerId;
  return function() {
    goog.Timer.clear(timerId);
    timerId = goog.Timer.callOnce(scope.setParentForLayers, 500, scope);
  };
};


/**
 * Mouse wheel handler.
 * @param {goog.events.MouseWheelEvent} event
 * @private
 */
anychart.graphModule.Chart.prototype.handleMouseWheel_ = function(event) {
  if (!this.dragger_ || !this.dragger_.isDragging()) { //Prevent zoom when layer is dragging.
    var interactivity = this.interactivity();
    if (interactivity.getOption('enabled')) {
      var dy = event.deltaY;
      if (interactivity.getOption('zoomOnMouseWheel')) {
        var scale = 0;
        if (goog.userAgent.WINDOWS && Math.abs(event.deltaY) <= 6) {
          if (event.deltaY > 0) {
            scale = 0.8;
          } else if (event.deltaY < 0) {
            scale = 1.2;
          } else {
            scale = 1;
          }
        }
        else {
          scale = goog.math.clamp(1 - event.deltaY / 120, 0.7, 2); //Use same method as map chart.
        }
        var layerScale = this.getTransformationMatrix().m00_;
        var scaleAfterZoom = layerScale * scale;

        if (scaleAfterZoom > 0.4 && scaleAfterZoom < 100) {
          var elementsCount = this.getNodesArray().length + this.getEdgesArray().length;
          if (this.interactivity_.getOption('edges') && elementsCount > 500) {
            this.unparentLayers();
            this.debounceFuntion();
          }
          this.doLayerScale_(scale, event.clientX, event.clientY);
        }
      }

      if (interactivity.getOption('scrollOnMouseWheel')) {
        this.doLayerTranslate_(0, dy);
      }
      event.preventDefault();
    }
  }
};


/**
 * Update path data of each edge connected to node.
 * @param {anychart.graphModule.Chart.Node} node
 */
anychart.graphModule.Chart.prototype.updateEdgesConnectedToNode = function(node) {
  var edge;
  var path;
  var from, to;
  var i, length;
  if (this.interactivity_.getOption('edges')) {
    path = this.edges_.getEdgePath();
    path.clear();
    for (i = 0, length = node.connectedEdges.length; i < length; i++) {
      edge = this.getEdgeById(node.connectedEdges[i]);
      this.edges_.drawEdge(edge);
      this.edges_.updateLabel(edge);
    }
  } else {
    this.edges_.drawEdges();
    for (i = 0, length = node.connectedEdges.length; i < length; i++) {
      edge = this.getEdgeById(node.connectedEdges[i]);

      from = this.getNodeById(edge.from).position;
      to = this.getNodeById(edge.to).position;

      this.edges_.updateLabel(edge);
    }
  }

};


/**
 * Fit graph into bounds.
 * Calculate most values and offset graph depend on it.
 */
anychart.graphModule.Chart.prototype.fitNodesCoordinatesIntoContentBounds = function() {
  var nodes = this.getNodesArray();

  var mostTop = Infinity;
  var mostLeft = Infinity;
  var mostRight = -Infinity;
  var mostBottom = -Infinity;

  var length = nodes.length;

  var i, x, y;
  for (i = 0; i < length; i++) {
    x = nodes[i].position.x;
    y = nodes[i].position.y;
    mostTop = Math.min(y, mostTop);
    mostRight = Math.max(x, mostRight);
    mostBottom = Math.max(y, mostBottom);
    mostLeft = Math.min(x, mostLeft);
  }

  mostBottom += -mostTop;
  mostRight += -mostLeft;
  var gapFactor = 0.10; //don't let nodes to stick close to bounds.
  var widthGap = this.contentBounds.width * gapFactor;
  var heightGap = this.contentBounds.height * gapFactor;
  var height = this.contentBounds.height - 2 * heightGap;
  var width = this.contentBounds.width - 2 * widthGap;

  var scaleFactor = Math.min(width / mostRight, height / mostBottom);

  scaleFactor = isFinite(scaleFactor) ? scaleFactor : 1;

  for (i = 0; i < length; i++) {
    x = nodes[i].position.x;
    y = nodes[i].position.y;
    x += -mostLeft;
    y += -mostTop;
    x *= scaleFactor;
    y *= scaleFactor;
    nodes[i].position.x = x;
    nodes[i].position.y = y;
  }

  mostBottom *= scaleFactor;
  mostRight *= scaleFactor;
  mostTop = 0;
  mostLeft = 0;

  var boundsCenterX = this.contentBounds.getCenter().getX();
  var boundsCenterY = this.contentBounds.getCenter().getY();
  var nodesCenterX = (mostRight - mostLeft) / 2 + mostLeft;
  var nodesCenterY = (mostBottom - mostTop) / 2 + mostTop;

  this.nodesCenter = new goog.math.Coordinate(nodesCenterX, nodesCenterY); //middle point of all nodes.

  var dx = boundsCenterX - nodesCenterX;
  var dy = boundsCenterY - nodesCenterY;

  if (!isFinite(dx)) dx = 0;
  if (!isFinite(dy)) dy = 0;

  this.transformationMatrix_.translate(-this.nodesDx, -this.nodesDy);
  this.nodesDx = dx; //save nodes offset for layer translation.
  this.nodesDy = dy;
  this.transformationMatrix_.translate(dx, dy);
  this.invalidateState(anychart.enums.Store.GRAPH, anychart.enums.State.TRANSFORM);
};


/**
 * Place all node in center of content bounds.
 */
anychart.graphModule.Chart.prototype.moveNodesToCenter = function() {
  var nodes = this.getNodesArray();
  var length = nodes.length;
  var mostTop = Infinity;
  var mostLeft = Infinity;
  var mostRight = -Infinity;
  var mostBottom = -Infinity;

  for (var i = 0; i < length; i++) {
    var x = nodes[i].position.x;
    var y = nodes[i].position.y;
    mostTop = Math.min(y, mostTop);
    mostRight = Math.max(x, mostRight);
    mostBottom = Math.max(y, mostBottom);
    mostLeft = Math.min(x, mostLeft);
  }

  var boundsCenterX = this.contentBounds.getCenter().getX();
  var boundsCenterY = this.contentBounds.getCenter().getY();
  var nodesCenterX = (mostRight - mostLeft) / 2 + mostLeft;
  var nodesCenterY = (mostBottom - mostTop) / 2 + mostTop;

  var dx = boundsCenterX - nodesCenterX;
  var dy = boundsCenterY - nodesCenterY;

  this.transformationMatrix_.translate(-this.nodesDx, -this.nodesDy);

  if (!isFinite(dx)) dx = 0;
  if (!isFinite(dy)) dy = 0;

  this.nodesDx = dx;
  this.nodesDy = dy;

  this.transformationMatrix_.translate(dx, dy);
  this.invalidateState(anychart.enums.Store.GRAPH, anychart.enums.State.TRANSFORM);
};


/**
 * Update position for node.
 * @param {anychart.graphModule.Chart.Node} node
 * @param {number} dx
 * @param {number} dy
 */
anychart.graphModule.Chart.prototype.updateNodePosition = function(node, dx, dy) {
  node.position.x += dx;
  node.position.y += dy;

  node.position.dx = dx; //Store it for labels drawing.
  node.position.dy = dy;
};


/**
 * Return transformation matrix.
 * @return {goog.math.AffineTransform}
 */
anychart.graphModule.Chart.prototype.getTransformationMatrix = function() {
  return this.transformationMatrix_;
};


/**
 * Return absolute x value.
 * Translate x coordinate, depend on scale and layer translate.
 * @param {number} x
 * @return {number}
 */
anychart.graphModule.Chart.prototype.getXWithTranslate = function(x) {
  var matrix = this.getTransformationMatrix();
  var scale = matrix.m00_;
  var offsetX = matrix.m10_;
  return (-offsetX * scale + x / scale);
};


/**
 * Return absolute y value.
 * Translate y coordinate, depend on scale and layer translate.
 * @param {number} y
 * @return {number}
 */
anychart.graphModule.Chart.prototype.getYWithTranslate = function(y) {
  var matrix = this.getTransformationMatrix();
  var scale = matrix.m00_;
  var offsetY = matrix.m12_;
  return (-offsetY * scale + y / scale);
};


/** @inheritDoc */
anychart.graphModule.Chart.prototype.handleMouseOut = function(event) {
  if ((!this.dragger_ || !this.dragger_.isDragging()) ||
      !this.interactivity().getOption('enabled') ||
      !this.interactivity().getOption('nodes')) { //Prevent mouse out when node is dragging
    var domTarget = event['domTarget'];
    var tag = /** @type {anychart.graphModule.Chart.Tag} */(domTarget.tag);
    if (tag && tag.currentState != anychart.SettingsState.SELECTED) {
      this.updateElementStateById(tag.id, tag.type, anychart.SettingsState.NORMAL);
    }
  }
};


/**
 * Update style of node.
 * @param {anychart.graphModule.Chart.Node} node
 * @param {anychart.SettingsState} state New State for node.
 */
anychart.graphModule.Chart.prototype.updateNode = function(node, state) {
  this.nodes_.state(node, state);
  this.nodes_.updateAppearance(node);
  this.nodes_.updateLabelStyle(node);
};


/**
 * Update style of node.
 * @param {string} id
 * @param {anychart.SettingsState} state New State for node.
 */
anychart.graphModule.Chart.prototype.updateNodeStateById = function(id, state) {
  var node = this.getNodeById(id);
  node.path.tag.currentState = state;
  this.updateNode(node, state);
};


/**
 * Update style of edge.
 * @param {anychart.graphModule.Chart.Edge} edge
 * @param {anychart.SettingsState} state New state for edge.
 */
anychart.graphModule.Chart.prototype.updateEdge = function(edge, state) {
  this.edges_.state(edge, state);
  this.edges_.updateAppearance(edge);
  this.edges_.updateLabelStyle(edge);
};


/**
 * Update style of edge.
 * @param {string} edgeId
 * @param {anychart.SettingsState} state New state for edge.
 */
anychart.graphModule.Chart.prototype.updateEdgeStateById = function(edgeId, state) {
  if (this.interactivity_.getOption('edges')) {
    var edge = this.getEdgeById(edgeId);
    edge.path.tag.currentState = state;
    this.updateEdge(edge, state);
  }
};


/**
 * Update element by tag.
 * @param {string} id
 * @param {anychart.graphModule.Chart.Element} type
 * @param {anychart.SettingsState} state
 */
anychart.graphModule.Chart.prototype.updateElementStateById = function(id, type, state) {
  switch (type) {
    case anychart.graphModule.Chart.Element.EDGE:
      if (this.interactivity_.getOption('edges')) {
        this.updateEdgeStateById(id, state);
        var edge = this.getEdgeById(id);

        var fromNode = edge.from;
        if (!(fromNode in this.selectedNodes_)) {
          this.updateNodeStateById(fromNode, state);
        }

        var toNode = edge.to;
        if (!(toNode in this.selectedNodes_)) {
          this.updateNodeStateById(toNode, state);
        }
        if (state == anychart.SettingsState.SELECTED) {
          this.selectedEdges_[edge.id] = {id: edge.id, type: anychart.graphModule.Chart.Element.EDGE};
          this.selectedNodes_[fromNode] = {id: fromNode, type: anychart.graphModule.Chart.Element.NODE};
          this.selectedNodes_[toNode] = {id: toNode, type: anychart.graphModule.Chart.Element.NODE};
        }
      }
      break;
    case anychart.graphModule.Chart.Element.NODE:
      this.updateNodeStateById(id, state);
      var edges = this.getNodeById(id).connectedEdges;
      for (var i = 0; i < edges.length; i++) {
        var edgeId = edges[i];
        if (!(edgeId in this.selectedEdges_)) {
          this.updateEdgeStateById(edgeId, state);
        }
        if (state == anychart.SettingsState.SELECTED) {
          this.selectedEdges_[edgeId] = {id: edgeId, type: anychart.graphModule.Chart.Element.EDGE};
        }
      }
      if (state == anychart.SettingsState.SELECTED) {
        this.selectedNodes_[id] = {id: id, type: anychart.graphModule.Chart.Element.NODE};
      }
      break;
  }
};


/** @inheritDoc */
anychart.graphModule.Chart.prototype.specificContextMenuItems = function(items, context, isPointContext) {
  var specificItems = {};
  goog.object.extend(specificItems,
    /** @type {Object} */ (anychart.utils.recursiveClone(anychart.core.Chart.contextMenuMap['select-marquee'])),
    items);
  return specificItems;
};


/** @inheritDoc */
anychart.graphModule.Chart.prototype.selectByRect = function(event) {
  var matrix = this.getTransformationMatrix();
  var x = event.left;
  var y = event.top;
  var width = event.width;
  var height = event.height;

  var rect = new goog.math.Rect(x, y, width, height);

  var coordinate = new goog.math.Coordinate(0, 0);
  var nodes = this.getNodesArray();
  for (var i = 0; i < nodes.length; i++) {
    var node = nodes[i];
    coordinate.x = (node.position.x * matrix.m00_) + matrix.getTranslateX();
    coordinate.y = (node.position.y * matrix.m00_) + matrix.getTranslateY();

    var distance = rect.squaredDistance(coordinate);

    if (!distance) {
      this.updateElementStateById(node.id, anychart.graphModule.Chart.Element.NODE, anychart.SettingsState.SELECTED);
    }
  }
  this.preventClickAfterDrag = true;
};


//endregion
//region Data manipulation
/**
 * Create object for internal manipulation for each node.
 * @private
 */
anychart.graphModule.Chart.prototype.proceedNodes_ = function() {
  var iterator = this.data_['nodes'].getIterator();
  iterator.reset();

  while (iterator.advance()) {
    var id = iterator.get('id');
    if (goog.isDefAndNotNull(id)) {

      id = String(id);
      if (!this.getNodeById(id)) {
        /**
         * @type {anychart.graphModule.Chart.Node}
         */
        var nodeObj;
        nodeObj = this.nodesMap_[id] = {};
        nodeObj.index = iterator.getIndex();
        nodeObj.id = id;
        nodeObj.dataRow = iterator.getIndex();
        nodeObj.connectedEdges = [];
        nodeObj.siblings = [];
        nodeObj.currentState = anychart.SettingsState.NORMAL;
        nodeObj.position = {
          x: iterator.get('x'),
          y: iterator.get('y')
        };

        var groupId = iterator.get('group');
        if (goog.isDefAndNotNull(groupId)) {
          if (!this.groupsMap_[groupId]) {
            this.groupsMap_[groupId] = null;
          }
          nodeObj.groupId = groupId;
        }
      } else {
        anychart.core.reporting.warning(anychart.enums.WarningCode.GRAPH_NODE_ALREADY_EXIST, null, [id], true);
      }
    } else {
      anychart.core.reporting.warning(anychart.enums.WarningCode.GRAPH_NO_ID, null, [], true);
    }
  }
  iterator.reset();
};


/**
 * Create object for internal manipulation for each edge.
 * @private
 */
anychart.graphModule.Chart.prototype.proceedEdges_ = function() {
  var iterator = this.data_['edges'].getIterator();
  iterator.reset();
  var i = 0;
  while (iterator.advance()) {
    var fromId = iterator.get('from');
    var toId = iterator.get('to');
    var edgeId = iterator.get('id');

    if (goog.isDefAndNotNull(edgeId)) {
      edgeId = String(edgeId);
    } else {
      edgeId = anychart.graphModule.Chart.Element.EDGE + '_' + iterator.getIndex();
    }

    if (fromId != toId) {
      var from = this.getNodeById(fromId);
      var to = this.getNodeById(toId);

      if (from && to) {
        var edge = {};

        edge.index = iterator.getIndex();
        edge.id = edgeId;
        edge.from = from.id;
        edge.to = to.id;
        edge.dataRow = iterator.getIndex();
        edge.currentState = anychart.SettingsState.NORMAL;

        var sibling;

        var isConnected = false;
        //check if two node already connected
        for (i = 0; i < from.siblings.length; i++) {
          sibling = from.siblings[i];
          if (sibling == from.id || sibling == to.id) {
            anychart.core.reporting.warning(anychart.enums.WarningCode.GRAPH_NODES_ALREADY_CONNECTED, null, [from.id, to.id], true);
            isConnected = true;
            break;
          }
        }
        if (!isConnected) {
          //check if two node already connected
          for (i = 0; i < to.siblings.length; i++) {
            sibling = to.siblings[i];
            if (sibling == from.id || sibling == to.id) {
              anychart.core.reporting.warning(anychart.enums.WarningCode.GRAPH_NODES_ALREADY_CONNECTED, null, [to.id, from.id], true);
              isConnected = true;
              break;
            }
          }
        }
        if (isConnected) continue;

        from.connectedEdges.push(edge.id);
        to.connectedEdges.push(edge.id);
        from.siblings.push(to.id);
        to.siblings.push(from.id);

        this.edgesMap_[edgeId] = edge;
      } else {
        if (!from) {
          anychart.core.reporting.warning(anychart.enums.WarningCode.GRAPH_NO_NODE_TO_CONNECT_EDGE, null, [edgeId, fromId], true);
        }
        if (!to) {
          anychart.core.reporting.warning(anychart.enums.WarningCode.GRAPH_NO_NODE_TO_CONNECT_EDGE, null, [edgeId, toId], true);
        }
      }
    } else {
      anychart.core.reporting.warning(anychart.enums.WarningCode.GRAPH_CONNECT_SAME_NODE, null, [edgeId, toId], true);
    }
  }
  if (iterator.getRowsCount() > 300) {
    this.interactivity().addThemes({'edges': false});
  }

  iterator.reset();
};


/**
 * Calculate number of disconnected graphs.
 * Setup id for each graph.
 * @private
 */
anychart.graphModule.Chart.prototype.setupGroupsForChart_ = function() {
  var nodes = this.getNodesArray();
  var nodesForProceed = []; // already processed nodes.
  var proceededNodes = []; // nodes we need to process
  var node;
  var gid = 0; //subGraph id

  for (var i = 0, length = nodes.length; i < length; i++) {
    node = nodes[i];
    if (goog.array.indexOf(proceededNodes, node) == -1) {
      var groupId = String(gid);
      this.subGraphGroups_[groupId] = [];
      nodesForProceed.push(node.id);
      nodesForProceed.push.apply(nodesForProceed, node.siblings);
      var proceedNode;
      while (proceedNode = nodesForProceed.pop()) {
        var nodeObject = this.getNodeById(proceedNode);
        if (goog.array.indexOf(proceededNodes, nodeObject) == -1) {
          nodesForProceed.push.apply(nodesForProceed, nodeObject.siblings);
          proceededNodes.push(nodeObject);
          this.subGraphGroups_[groupId].push(proceedNode);
          nodeObject.subGraphId = String(gid);
        }
      }
      gid++;
    }
  }
};


/**
 * Create node and edge object for internal manipulation.
 * @private
 */
anychart.graphModule.Chart.prototype.prepareNewData_ = function() {
  var edges = this.data_['edges'];
  var nodes = this.data_['nodes'];
  if (nodes.getRowsCount() > 0) {
    this.proceedNodes_();
  }

  if (edges.getRowsCount() > 0) {
    this.proceedEdges_();
  }
};


/**
 * Reset DOM of all drawn elements.
 * Dispose all created elements.
 * @private
 */
anychart.graphModule.Chart.prototype.dropCurrentData_ = function() {
  if (this.nodesMap_) {
    for (var id in this.nodesMap_) {
      var node = this.getNodeById(id);
      this.nodes_.clear(node);
    }
  }

  if (this.edgesMap_) {
    for (var edgeId in this.edgesMap_) {
      var edge = this.getEdgeById(edgeId);
      this.edges_.clear(edge);
    }
  }
  this.nodes().resetLabelSettings();
  this.edges().resetLabelSettings();
  this.nodesMap_ = {};
  this.edgesMap_ = {};
  this.nodesArray_ = null;
  this.edgesArray_ = null;
  this.subGraphGroups_ = {};
  var i;
  for (i in this.selectedNodes_) {
    delete this.selectedNodes_[i];
  }
  for (i in this.selectedEdges_) {
    delete this.selectedEdges_[i];
  }
};


/**
 * Element signal handler.
 * @param {anychart.SignalEvent} event
 * @private
 */
anychart.graphModule.Chart.prototype.onElementSignal_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW_APPEARANCE)) {
    this.invalidateState(anychart.enums.Store.GRAPH, anychart.enums.State.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Layout signal handler
 * @param {anychart.SignalEvent} event
 * @private
 */
anychart.graphModule.Chart.prototype.onLayoutSignal_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    var states = [
      anychart.enums.State.APPEARANCE,
      anychart.enums.State.LABELS_STYLE,
      anychart.enums.State.LABELS_BOUNDS,
      anychart.enums.State.LABELS_ENABLED,
      anychart.enums.State.LAYOUT
    ];
    this.invalidate(anychart.ConsistencyState.BOUNDS);
    this.invalidateMultiState(anychart.enums.Store.GRAPH, states, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Interactivity signal handler.
 * @param {anychart.SignalEvent} event
 * @private
 */
anychart.graphModule.Chart.prototype.onInteractivitySignal_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Data signal handler.
 * @param {anychart.SignalEvent} event
 * @private
 */
anychart.graphModule.Chart.prototype.dataInvalidated_ = function(event) {
  var statesForInvalidate = [
    anychart.enums.State.DATA,
    anychart.enums.State.APPEARANCE,
    anychart.enums.State.LABELS_STYLE,
    anychart.enums.State.LABELS_BOUNDS,
    anychart.enums.State.LABELS_ENABLED,
    anychart.enums.State.LAYOUT
  ];
  this.dropCurrentData_();
  this.prepareNewData_();
  this.setupGroupsForChart_();
  this.invalidate(anychart.ConsistencyState.BOUNDS);
  this.invalidateMultiState(anychart.enums.Store.GRAPH, statesForInvalidate, anychart.Signal.NEEDS_REDRAW);
};


//endregion
//region Palette
/**
 * Getter/setter for palette.
 * @param {(anychart.palettes.RangeColors|anychart.palettes.DistinctColors|Object|Array.<string>)=} opt_value .
 * @return {!(anychart.palettes.RangeColors|anychart.palettes.DistinctColors|anychart.graphModule.Chart)} .
 */
anychart.graphModule.Chart.prototype.palette = function(opt_value) {
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
anychart.graphModule.Chart.prototype.setupPalette_ = function(cls, opt_cloneFrom) {
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
anychart.graphModule.Chart.prototype.paletteInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidateState(anychart.enums.Store.SANKEY, anychart.enums.State.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
  }
};


//endregion
//region Elements
/**
 * Settings object for nodes.
 * @param {Object=} opt_value
 * @return {(anychart.graphModule.Chart|anychart.graphModule.elements.Node)}
 */
anychart.graphModule.Chart.prototype.nodes = function(opt_value) {
  if (!this.nodes_) {
    this.nodes_ = new anychart.graphModule.elements.Node(this);
    this.setupCreated('nodes', this.nodes_);
    this.nodes_.setupElements();
    this.nodes_.listenSignals(this.onElementSignal_, this);
  }
  if (opt_value) {
    this.nodes_.setup(opt_value);
    return this;
  }
  return this.nodes_;
};


/**
 * Settings object for interactivity.
 * @param {Object=} opt_value Object with interactivity settings
 * @return {(anychart.graphModule.Chart|anychart.graphModule.elements.Interactivity)}
 * @suppress {checkTypes}
 */
anychart.graphModule.Chart.prototype.interactivity = function(opt_value) {
  if (!this.interactivity_) {
    this.interactivity_ = new anychart.graphModule.elements.Interactivity();
    this.setupCreated('interactivity', this.interactivity_);
    this.interactivity_.listenSignals(this.edges().onInteractivitySignal, this.edges());
    this.interactivity_.listenSignals(this.onInteractivitySignal_, this);
  }
  if (goog.isDef(opt_value)) {
    this.interactivity_.setup(opt_value);
    return this;
  }
  return this.interactivity_;
};


/**
 * Return settings object for group by id if exists.
 * @param {string} id Id of group
 * @param {Object=} opt_value Config object
 * @return {(anychart.graphModule.Chart|anychart.graphModule.elements.Group|undefined)}
 */
anychart.graphModule.Chart.prototype.group = function(id, opt_value) {
  if (goog.isDefAndNotNull(id)) {
    if (goog.isDef(this.groupsMap_[id])) {
      if (goog.isNull(this.groupsMap_[id])) {
        var group = new anychart.graphModule.elements.Group(this);
        group.setupElements();
        group.listenSignals(this.onElementSignal_, this);
        this.groupsMap_[id] = group;
      }
      if (opt_value) {
        this.groupsMap_[id].setup(opt_value);
        return this;
      }
      return this.groupsMap_[id];
    } else {
      anychart.core.reporting.warning(anychart.enums.WarningCode.GRAPH_NO_GROUP, null, [id], true);
    }
  }
  return void 0;
};


/**
 * Layout object.
 * Contains layout functions.
 * @param {Object=} opt_value
 * @return {(anychart.graphModule.Chart|anychart.graphModule.elements.Layout)}
 */
anychart.graphModule.Chart.prototype.layout = function(opt_value) {
  if (!this.layout_) {
    this.layout_ = new anychart.graphModule.elements.Layout(this);
    this.setupCreated('layout', this.layout_);
    this.layout_.listenSignals(this.onLayoutSignal_, this);
  }
  if (goog.isDef(opt_value)) {
    this.layout_.setup(opt_value);
    return this;
  }
  return this.layout_;
};


/**
 * Edges object.
 * Contains settings for edges.
 * @param {Object=} opt_value
 * @return {(anychart.graphModule.Chart|anychart.graphModule.elements.Edge)}
 */
anychart.graphModule.Chart.prototype.edges = function(opt_value) {
  if (!this.edges_) {
    this.edges_ = new anychart.graphModule.elements.Edge(this);
    this.setupCreated('edges', this.edges_);
    this.edges_.setupElements();
    this.edges_.listenSignals(this.onElementSignal_, this);
  }
  if (goog.isDef(opt_value)) {
    this.edges_.setup(opt_value);
    return this;
  }
  return this.edges_;
};


/**
 * Labels signal handler.
 * @param {anychart.SignalEvent} event
 * @param {anychart.graphModule.Chart.Element=} opt_signalTarget
 */
anychart.graphModule.Chart.prototype.labelsSettingsInvalidated = function(event, opt_signalTarget) {
  var needsMeasure = event.hasSignal(anychart.Signal.BOUNDS_CHANGED);
  var states = [];

  if (goog.isDef(opt_signalTarget)) {
    switch (opt_signalTarget) {
      case anychart.graphModule.Chart.Element.NODE:
      case anychart.graphModule.Chart.Element.GROUP:
        states.push(anychart.enums.State.NODES);
        if (needsMeasure) {
          this.nodes_.needsMeasureLabels();
        }
        break;
      case anychart.graphModule.Chart.Element.EDGE:
        states.push(anychart.enums.State.EDGES);
        if (needsMeasure) {
          this.edges_.needsMeasureLabels();
        }
        break;
    }
  }

  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    states.push(anychart.enums.State.LABELS_STYLE);
    states.push(anychart.enums.State.LABELS_ENABLED);
  }
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    states.push(anychart.enums.State.LABELS_ENABLED);
  }
  if (event.hasSignal(anychart.Signal.ENABLED_STATE_CHANGED)) {
    states.push(anychart.enums.State.LABELS_ENABLED);
    states.push(anychart.enums.State.LABELS_STYLE);
  }

  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    states.push(anychart.enums.State.LABELS_BOUNDS);
    states.push(anychart.enums.State.LABELS_ENABLED);
    states.push(anychart.enums.State.LABELS_STYLE);
  }

  this.invalidateMultiState(anychart.enums.Store.GRAPH, states, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Labels setting object.
 * @param {Object=} opt_value - Settings object.
 * @return {(anychart.graphModule.Chart|anychart.core.ui.LabelsSettings)} - Current value or itself for method chaining.
 */
anychart.graphModule.Chart.prototype.labels = function(opt_value) {
  if (!this.labels_) {
    this.labels_ = new anychart.core.ui.LabelsSettings();
    this.setupCreated('labels', this.labels_);
  }

  if (goog.isDef(opt_value)) {
    this.labels_.setup(opt_value);
    return this;
  }

  return this.labels_;
};


/**
 * Return map with edges.
 * @return {Object.<string, anychart.graphModule.Chart.Edge>}
 */
anychart.graphModule.Chart.prototype.getEdgesMap = function() {
  return this.edgesMap_;
};


/**
 * @return {Object.<string, anychart.graphModule.Chart.Node>}
 */
anychart.graphModule.Chart.prototype.getNodesMap = function() {
  return this.nodesMap_;
};


/**
 * @return {Object.<string, anychart.graphModule.elements.Group>}
 */
anychart.graphModule.Chart.prototype.getGroupsMap = function() {
  return this.groupsMap_;
};


/**
 * Return map where key is id of graph, value is nodes ids of this graph.
 * @return {Object.<string, Array.<string>>}
 */
anychart.graphModule.Chart.prototype.getSubGraphsMap = function() {
  return this.subGraphGroups_;
};


/**
 * Return array with all nodes.
 * @return {Array.<anychart.graphModule.Chart.Node>}
 */
anychart.graphModule.Chart.prototype.getNodesArray = function() {
  if (!this.nodesArray_) {
    this.nodesArray_ = [];
    for (var id in this.getNodesMap()) {
      var nodes = this.getNodeById(id);
      this.nodesArray_.push(nodes);
    }
  }
  return this.nodesArray_;
};


/**
 * Return array with all edges.
 * @return {Array.<anychart.graphModule.Chart.Edge>}
 */
anychart.graphModule.Chart.prototype.getEdgesArray = function() {
  if (!this.edgesArray_) {
    this.edgesArray_ = [];
    for (var edgeId in this.getEdgesMap()) {
      var edge = this.getEdgeById(edgeId);
      this.edgesArray_.push(edge);
    }
  }
  return this.edgesArray_;
};


/**
 * Return node object by id.
 * @param {string} id
 * @return {anychart.graphModule.Chart.Node}
 */
anychart.graphModule.Chart.prototype.getNodeById = function(id) {
  return this.getNodesMap()[id];
};


/**
 * Return edge object by id.
 * @param {string} id
 * @return {anychart.graphModule.Chart.Edge}
 */
anychart.graphModule.Chart.prototype.getEdgeById = function(id) {
  return this.getEdgesMap()[id];
};


//endregion
// region Draw


/**
 * Init dragger
 * @param {acgraph.events.BrowserEvent} event
 * @private
 */
anychart.graphModule.Chart.prototype.initDragger_ = function(event) {
  if (!this.dragger_) {
    this.dragger_ = new goog.fx.Dragger(this.rootLayer.domElement(), this.rootLayer);
    var startX, startY, eventStartX, eventStartY;
    var element = null;
    var tag, x, y, dx, dy;
    var node;
    var nodesForDrag = [];
    var interactivityEnabled;
    var nodeInteractivityEnabled;
    var elementCount;
    this.dragger_.listen(goog.fx.Dragger.EventType.START, function(e) {
      interactivityEnabled = this.interactivity().getOption('enabled');
      nodeInteractivityEnabled = this.interactivity().getOption('nodes');
      elementCount = this.getNodesArray().length + this.getEdgesArray().length;
      if (interactivityEnabled) {
        element = e.browserEvent.target;
        tag = element.tag;
        if (goog.labs.userAgent.device.isDesktop()) {
          /*
            In tests we hide tooltip on click.
            todo(anton.chengaev) Rework dragger.
           */
          this.tooltip().hide();
        }
        if (tag && tag.type == anychart.graphModule.Chart.Element.NODE) {
          if (nodeInteractivityEnabled) {
            var id = tag.id;
            if (goog.object.isEmpty(this.selectedNodes_)) {
              node = this.getNodeById(id);
            } else if (!(id in this.selectedNodes_)) {
              if ((!goog.userAgent.MAC && !e.browserEvent.ctrlKey) || (goog.userAgent.MAC && !e.browserEvent.metaKey)) {
                this.deselectAllElements_();
              }
              node = this.getNodeById(id);
            } else {
              for (var i in this.selectedNodes_) {
                nodesForDrag.push(this.getNodeById(i));
              }
            }
            startX = this.getXWithTranslate(e.clientX);
            startY = this.getYWithTranslate(e.clientY);
          }
        } else {
          this.deselectAllElements_();

          startX = e.clientX;
          startY = e.clientY;
        }
      }
      eventStartX = e.clientX;
      eventStartY = e.clientY;
    }, false, this);
    this.dragger_.listen(goog.fx.Dragger.EventType.DRAG, function(e) {
      if (interactivityEnabled) {
        this.isDraggerDragging_ = true;
        this.tooltip().hide();
        var scale = this.getTransformationMatrix().m00_;

        var x = e.clientX;
        var y = e.clientY;

        if (tag && tag.type == anychart.graphModule.Chart.Element.NODE) {
          if (nodeInteractivityEnabled) {
            x = this.getXWithTranslate(x);
            y = this.getYWithTranslate(y);

            dx = x - startX;
            dy = y - startY;
            startX = x;
            startY = y;
            if (!nodesForDrag.length) {
              this.updateNodePosition(node, dx, dy);
              this.nodes_.updateNodeDOMElementPosition(node);
              this.updateEdgesConnectedToNode(node);
            } else {
              for (var i = 0; i < nodesForDrag.length; i++) {
                var dragNode = nodesForDrag[i];
                this.updateNodePosition(dragNode, dx, dy);
                this.nodes_.updateNodeDOMElementPosition(dragNode);
                this.updateEdgesConnectedToNode(dragNode);
              }
            }
          }
        } else {
          dx = (x - startX) / scale; //slowdown drag when zoom are used
          dy = (y - startY) / scale;
          startX = x;
          startY = y;
          this.doLayerTranslate_(dx, dy);
        }
        if (this.interactivity_.getOption('edges') && elementCount > 500) {
          this.unparentLayers();
        }
      }
    }, false, this);
    this.dragger_.listen(goog.fx.Dragger.EventType.END, /** @this {anychart.graphModule.Chart} */ function(e) {
      if (interactivityEnabled) {
        this.isDraggerDragging_ = false;
        if (tag && tag.type == anychart.graphModule.Chart.Element.NODE) {
          if (nodeInteractivityEnabled) {
            if (!nodesForDrag.length) {
              if (this.interactivity().getOption('magnetize')) {
                this.nodes_.stickNode(node);
                this.nodes_.updateNodeDOMElementPosition(node);
              }
              this.updateEdgesConnectedToNode(node);
            }
          }
        }
        nodesForDrag.length = 0;
      }
      if (e.clientX != eventStartX || eventStartY != e.clientY) {
        if (this.interactivity_.getOption('edges') && elementCount > 500) {
          this.debounceFuntion();
        }
        this.preventClickAfterDrag = true;
      }
    }, false, this);
  }
};


/**
 * Initialize mouseWheel handler.
 * @private
 */
anychart.graphModule.Chart.prototype.initMouseWheel_ = function() {
  if (!this.mouseWheelHandler_) {
    var element = this.rootLayer.domElement();
    this.mouseWheelHandler_ = new goog.events.MouseWheelHandler(element, false);
    this.mouseWheelHandler_.listen(goog.events.MouseWheelHandler.EventType.MOUSEWHEEL, this.handleMouseWheel_, false, this);
  }
};


/**
 * Update bounds of elements.
 * @param {anychart.math.Rect} bounds
 * @private
 */
anychart.graphModule.Chart.prototype.updateBoundsOfElements_ = function(bounds) {
  var clipShape = this.clipArea_.shape();

  clipShape.setX(bounds.left);
  clipShape.setY(bounds.top);
  clipShape.setWidth(bounds.width);
  clipShape.setHeight(bounds.height);

  this.eventsInterceptor_.setX(bounds.left);
  this.eventsInterceptor_.setY(bounds.top);
  this.eventsInterceptor_.setWidth(bounds.width);
  this.eventsInterceptor_.setHeight(bounds.height);
};


/**
 * Update transformation matrix for main layer.
 * @private
 */
anychart.graphModule.Chart.prototype.updateTransformationMatrixForLayer_ = function() {
  this.mainLayer_.setTransformationMatrix(
    this.transformationMatrix_.m00_,
    this.transformationMatrix_.m10_,
    this.transformationMatrix_.m01_,
    this.transformationMatrix_.m11_,
    this.transformationMatrix_.m02_,
    this.transformationMatrix_.m12_
  );
};


/**
 * Rotate all nodes.
 * @private
 */
anychart.graphModule.Chart.prototype.rotateNodes_ = function() {
  var nodes = this.getNodesArray();
  var center = this.contentBounds.getCenter();
  for (var i = 0; i < nodes.length; i++) {
    var node = nodes[i];
    var coordinate = new goog.math.Coordinate(node.position.x, node.position.y);
    coordinate.rotateDegrees(this.rotateOn_, center);
    node.position.x = coordinate.getX();
    node.position.y = coordinate.getY();
  }
};


/** @inheritDoc */
anychart.graphModule.Chart.prototype.drawContent = function(bounds) {
  if (this.isConsistent())
    return;

  if (!this.rootLayer) {
    this.rootLayer = this.rootElement.layer();

    this.nodes();
    this.edges();
    this.layout();
    this.interactivity();

    this.mainLayer_ = acgraph.layer();
    this.clipArea_ = acgraph.clip(bounds);
    this.interceptorLayer_ = acgraph.layer();
    this.eventsInterceptor_ = acgraph.rect(bounds.left, bounds.top, bounds.width, bounds.height);
    this.eventsInterceptor_.fill(/** @type {acgraph.vector.SolidFill} */(anychart.color.TRANSPARENT_HANDLER));
    this.eventsInterceptor_.stroke(null);
    this.eventsInterceptor_.parent(this.interceptorLayer_);
    this.interceptorLayer_.parent(this.rootLayer);

    this.eventsHandler.listenOnce(this, anychart.enums.EventType.CHART_DRAW, this.initDragger_);
    this.eventsHandler.listenOnce(this, anychart.enums.EventType.CHART_DRAW, this.initMouseWheel_);

    if (goog.labs.userAgent.device.isDesktop()) {
      this.bindHandlersToComponent(this,
        this.handleMouseOver,
        this.handleMouseOut,
        this.handleMouseClick,
        this.handleMouseMove,
        null,
        null);
    } else {
      // Dont show context menu on nodes or edges if it is dragging or selected.
      this.eventsHandler.unlisten(this.rootElement, acgraph.events.EventType.CONTEXTMENU, this.handleBrowserEvent);
      this.eventsHandler.listen(this.rootElement, acgraph.events.EventType.CONTEXTMENU, this.handleContextMenu);
      this.initTouchHandlers();
    }

    this.layerForElements_ = acgraph.layer();

    this.nodesLayer_ = acgraph.layer();
    this.edgesLayer_ = acgraph.layer();

    this.layerWithEdges = this.edges_.getLayer();
    this.layerWithNodes = this.nodes_.getLayer();

    this.layerWithEdges.parent(this.edgesLayer_);
    this.layerWithNodes.parent(this.nodesLayer_);
    this.edgesLayer_.parent(this.layerForElements_);
    this.nodesLayer_.parent(this.layerForElements_);

    this.layerForElements_.parent(this.mainLayer_);

    this.rootLayer.zIndex(anychart.graphModule.Chart.Z_INDEX);
    this.rootLayer.clip(this.clipArea_);

    this.mainLayer_.parent(this.rootLayer);
    this.nodes_.dispatchSignal(anychart.Signal.MEASURE_COLLECT);
    this.edges_.dispatchSignal(anychart.Signal.MEASURE_COLLECT);
  }

  if (this.hasStateInvalidation(anychart.enums.Store.GRAPH, anychart.enums.State.LAYOUT)) {
    this.layout().getCoordinatesForCurrentLayout();
    this.markStateConsistent(anychart.enums.Store.GRAPH, anychart.enums.State.LAYOUT);
  }

  if (this.hasStateInvalidation(anychart.enums.Store.GRAPH, anychart.enums.State.ROTATE)) {
    this.rotateNodes_();
    this.markStateConsistent(anychart.enums.Store.GRAPH, anychart.enums.State.ROTATE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.updateBoundsOfElements_(bounds);
    if (this.isfixed || this.layout().type() == anychart.enums.LayoutType.FORCED) {
      this.fitNodesCoordinatesIntoContentBounds();
    } else {
      this.moveNodesToCenter();
    }
    this.edges_.drawEdges();
    this.nodes_.drawNodes();

    this.invalidateMultiState(anychart.enums.Store.GRAPH, [
      anychart.enums.State.EDGES,
      anychart.enums.State.NODES,
      anychart.enums.State.LABELS_STYLE,
      anychart.enums.State.LABELS_ENABLED,
      anychart.enums.State.LABELS_BOUNDS,
      anychart.enums.State.APPEARANCE

    ]);
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  if (this.hasStateInvalidation(anychart.enums.Store.GRAPH, anychart.enums.State.APPEARANCE)) {
    this.edges_.updateAppearance();
    this.nodes_.updateAppearance();
    this.markStateConsistent(anychart.enums.Store.GRAPH, anychart.enums.State.APPEARANCE);
  }
  if (this.hasMultiStateInvalidation(anychart.enums.Store.GRAPH,
    [
      anychart.enums.State.LABELS_STYLE,
      anychart.enums.State.LABELS_BOUNDS,
      anychart.enums.State.LABELS_ENABLED
    ])) {
    if (this.hasStateInvalidation(anychart.enums.Store.GRAPH, anychart.enums.State.LABELS_STYLE)) {
      if (this.hasStateInvalidation(anychart.enums.Store.GRAPH, anychart.enums.State.NODES)) {
        this.nodes_.applyLabelsStyle();
      }

      if (this.hasStateInvalidation(anychart.enums.Store.GRAPH, anychart.enums.State.EDGES)) {
        this.edges_.applyLabelsStyle();
      }
      this.markStateConsistent(anychart.enums.Store.GRAPH, anychart.enums.State.LABELS_STYLE);
    }

    if (this.hasStateInvalidation(anychart.enums.Store.GRAPH, anychart.enums.State.LABELS_BOUNDS)) {
      anychart.measuriator.measure();
      this.markStateConsistent(anychart.enums.Store.GRAPH, anychart.enums.State.LABELS_BOUNDS);
    }

    if (this.hasStateInvalidation(anychart.enums.Store.GRAPH, anychart.enums.State.LABELS_ENABLED)) {
      if (this.hasStateInvalidation(anychart.enums.Store.GRAPH, anychart.enums.State.EDGES)) {
        this.edges_.drawLabels();
      }

      if (this.hasStateInvalidation(anychart.enums.Store.GRAPH, anychart.enums.State.NODES)) {
        this.nodes_.drawLabels();
      }
      this.markStateConsistent(anychart.enums.Store.GRAPH, anychart.enums.State.LABELS_ENABLED);
    }
    this.markMultiStateConsistent(anychart.enums.Store.GRAPH, [anychart.enums.State.EDGES, anychart.enums.State.NODES]);
  }

  if (this.hasStateInvalidation(anychart.enums.Store.GRAPH, anychart.enums.State.TRANSFORM)) {
    this.updateTransformationMatrixForLayer_();
    this.markStateConsistent(anychart.enums.Store.GRAPH, anychart.enums.State.TRANSFORM);
  }
};


//endregion
//region Chart transform
/**
 * Increase zoom on passed value.
 * @param {number=} opt_value Zoom factor.
 * @param {number=} opt_cx scaling point x.
 * @param {number=} opt_cy scaling point y.
 * @return {number | anychart.graphModule.Chart} zoomFactor or chart instance
 */
anychart.graphModule.Chart.prototype.zoom = function(opt_value, opt_cx, opt_cy) {
  var matrix = this.getTransformationMatrix();
  if (goog.isDef(opt_value)) {
    if (goog.isNull(opt_value)) {
      this.fit();
    } else {
      if (!goog.isNumber(opt_cx)) {
        if (this.contentBounds)
          opt_cx = this.contentBounds.left + (this.contentBounds.width / 2);
      }
      if (!goog.isNumber(opt_cy)) {
        if (this.contentBounds)
          opt_cy = this.contentBounds.top + (this.contentBounds.height / 2);
      }
      this.transformationMatrix_.preScale(opt_value, opt_value);
      this.transformationMatrix_.preTranslate((opt_cx || 0) * (1 - opt_value), (opt_cy || 0) * (1 - opt_value));
      this.invalidateState(anychart.enums.Store.GRAPH, anychart.enums.State.TRANSFORM, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return matrix.m00_;
};


/**
 * Return chart instance for zoom controller.
 * @return {anychart.graphModule.Chart}
 */
anychart.graphModule.Chart.prototype.getCurrentScene = function() {
  return this;
};


/**
 * Proxy fit method to zoom controller.
 */
anychart.graphModule.Chart.prototype.fitAll = function() {
  this.fit();
};


/**
 * Zoom in.
 * For zoom controller.
 */
anychart.graphModule.Chart.prototype.zoomIn = function() {
  this.zoom(1.3);
};


/**
 * Zoom out.
 * For zoom controller.
 */
anychart.graphModule.Chart.prototype.zoomOut = function() {
  this.zoom(1 / 1.3);
};


/**
 * Move chart on passed values.
 * @param {?number=} opt_dx movement x.
 * @param {?number=} opt_dy movement y.
 * @return {Array.<number> | anychart.graphModule.Chart}
 */
anychart.graphModule.Chart.prototype.move = function(opt_dx, opt_dy) {
  if (goog.isDef(opt_dx)) {
    if (goog.isNull(opt_dx)) {
      opt_dx = -this.transformationMatrix_.m02_;
      opt_dy = -this.transformationMatrix_.m12_;
    }
    opt_dx = opt_dx ? opt_dx : 0;
    opt_dy = opt_dy ? opt_dy : 0;
    this.transformationMatrix_.translate(opt_dx, opt_dy);
    this.invalidateState(anychart.enums.Store.GRAPH, anychart.enums.State.TRANSFORM, anychart.Signal.NEEDS_REDRAW);
    return this;
  }
  var matrix = this.getTransformationMatrix();
  return [matrix.m02_, matrix.m12_];
};


/**
 * Return chart back to initial state.
 * Reset zoom and move of chart.
 * @param {boolean=} opt_forFixedMode Non api param
 * @return {anychart.graphModule.Chart}
 */
anychart.graphModule.Chart.prototype.fit = function(opt_forFixedMode) {
  if (goog.isBoolean(opt_forFixedMode)) {
    this.isfixed = opt_forFixedMode;
    this.invalidate(anychart.ConsistencyState.BOUNDS);
  }
  this.transformationMatrix_.setTransform(1, 0, 0, 1, 0, 0);
  this.transformationMatrix_.translate(this.nodesDx, this.nodesDy);
  this.invalidateState(anychart.enums.Store.GRAPH, anychart.enums.State.TRANSFORM, anychart.Signal.NEEDS_REDRAW);
  return this;
};


/**
 * Rotate nodes of chart.
 * @param {?number=} opt_degree
 * @return {anychart.graphModule.Chart|number}
 */
anychart.graphModule.Chart.prototype.rotation = function(opt_degree) {
  if (goog.isDef(opt_degree)) {
    if (this.chartRotation_ != opt_degree) {
      if (goog.isNull(opt_degree)) {
        opt_degree = 0;
      }
      opt_degree = goog.math.standardAngle(opt_degree);
      this.rotateOn_ = -this.chartRotation_ + opt_degree;
      this.chartRotation_ = opt_degree;
      var states = [
        anychart.enums.State.LABELS_STYLE,
        anychart.enums.State.ROTATE,
        anychart.enums.State.APPEARANCE
      ];
      this.invalidate(anychart.ConsistencyState.BOUNDS);
      this.invalidateMultiState(anychart.enums.Store.GRAPH, states, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.chartRotation_;
  }
};


//endregion
//region Serialize, setup, dispose
/**
 * Get/set data for chart.
 * @param {Object=} opt_value
 * @return {(Object | anychart.graphModule.Chart)}
 */
anychart.graphModule.Chart.prototype.data = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (goog.isNull(opt_value) || (goog.isDef(opt_value['nodes']) && goog.isDef(opt_value['edges']))) {
      var nodes = opt_value && opt_value['nodes'] ? opt_value['nodes'] : null;
      var edges = opt_value && opt_value['edges'] ? opt_value['edges'] : null;
      var data;
      var dataElement = nodes;
      if (this.rawDataForNodes !== dataElement) {
        this.rawDataForNodes = dataElement;
        if (this.data_ && this.data_['nodes']) {
          this.data_['nodes'].unlistenSignals(this.dataInvalidated_);
          goog.dispose(this.data_['nodes']);
        }

        if (anychart.utils.instanceOf(dataElement, anychart.data.Set)) {
          data = dataElement.mapAs().derive();
        } else if (anychart.utils.instanceOf(dataElement, anychart.data.View)) {
          data = dataElement.derive();
        } else {
          data = anychart.data.set(dataElement).mapAs().derive();
        }
        data.listenSignals(this.dataInvalidated_, this);
        this.data_['nodes'] = data;
      }

      dataElement = edges;
      if (this.rawDataForEdges !== dataElement) {
        this.rawDataForEdges = dataElement;
        if (this.data_ && this.data_['edges']) {
          this.data_['edges'].unlistenSignals(this.dataInvalidated_);
          goog.dispose(this.data_['edges']);
        }
        if (anychart.utils.instanceOf(dataElement, anychart.data.Set)) {
          data = dataElement.mapAs().derive();
        } else if (anychart.utils.instanceOf(dataElement, anychart.data.View)) {
          data = dataElement.derive();
        } else {
          data = anychart.data.set(dataElement).mapAs().derive();
        }
        data.listenSignals(this.dataInvalidated_, this);
        this.data_['edges'] = data;
      }

      this.dropCurrentData_();
      this.prepareNewData_();
      this.setupGroupsForChart_();

      var statesForInvalidate = [
        anychart.enums.State.DATA,
        anychart.enums.State.APPEARANCE,
        anychart.enums.State.LABELS_STYLE,
        anychart.enums.State.LABELS_BOUNDS,
        anychart.enums.State.LABELS_ENABLED,
        anychart.enums.State.LAYOUT
      ];
      this.invalidate(anychart.ConsistencyState.BOUNDS);
      this.invalidateMultiState(anychart.enums.Store.GRAPH, statesForInvalidate, anychart.Signal.NEEDS_REDRAW);
    } else {
      anychart.core.reporting.warning(anychart.enums.WarningCode.GRAPH_DATA_HAS_NO_FIELD, null, [], true);
    }
    return this;
  }
  return this.data_;
};


/** @inheritDoc */
anychart.graphModule.Chart.prototype.serialize = function() {
  var json = anychart.graphModule.Chart.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.graphModule.Chart.OWN_DESCRIPTORS, json);

  var dataNodes = this.data()['nodes'];
  dataNodes = dataNodes ? dataNodes.serialize() : dataNodes;
  var dataEdges = this.data()['edges'];
  dataEdges = dataEdges ? dataEdges.serialize() : dataEdges;
  var i;
  if (dataNodes) {
    for (i = 0; i < dataNodes.length; i++) {
      var dataNode = dataNodes[i];
      if (dataNode && dataNode['id']) {
        var node = this.getNodeById(dataNode['id']);
        dataNode['x'] = node.position.x;
        dataNode['y'] = node.position.y;
      }
    }
  }
  json['graphData'] = {
    'nodes': dataNodes,
    'edges': dataEdges
  };

  json['nodes'] = this.nodes().serialize();
  json['edges'] = this.edges().serialize();

  var labels = this.labels().serialize();
  if (!goog.object.isEmpty(labels)) {
    json['labels'] = labels;
  }

  json['groups'] = [];

  for (i in this.groupsMap_) {
    var group = {};
    group['id'] = i;
    group['settings'] = this.group(i).serialize();
    json['groups'].push(group);
  }
  json['layout'] = this.layout().serialize();
  json['interactivity'] = this.interactivity().serialize();
  var matrix = this.transformationMatrix_.clone();
  matrix.translate(-this.nodesDx, -this.nodesDy);
  json['transformationMatrix'] = {
    'm00_': matrix.m00_,
    'm10_': matrix.m10_,
    'm01_': matrix.m01_,
    'm11_': matrix.m11_,
    'm02_': matrix.m02_,
    'm12_': matrix.m12_
  };
  json['rotation'] = this.rotation();
  return {'chart': json};
};


/** @inheritDoc */
anychart.graphModule.Chart.prototype.setupByJSON = function(config, opt_default) {
  anychart.graphModule.Chart.base(this, 'setupByJSON', config, opt_default);
  anychart.core.settings.deserialize(this, anychart.graphModule.Chart.OWN_DESCRIPTORS, config, opt_default);

  if ('graphData' in config)
    this.data(config['graphData']);

  if ('edges' in config)
    this.edges().setup(config['edges']);

  if ('nodes' in config)
    this.nodes().setup(config['nodes']);

  if ('transformationMatrix' in config) {
    var matrix = config['transformationMatrix'];
    this.transformationMatrix_.setTransform(
      matrix['m00_'],
      matrix['m10_'],
      matrix['m01_'],
      matrix['m11_'],
      matrix['m02_'],
      matrix['m12_']
    );
  }

  if ('rotation' in config)
    this.chartRotation_ = +config['rotation'];

  if ('labels' in config)
    this.labels().setup(config['labels']);

  if ('layout' in config) {
    this.layout().setup(config['layout']);
    if (config['layout']['type'] == anychart.enums.LayoutType.FORCED) {
      this.markStateConsistent(anychart.enums.Store.GRAPH, anychart.enums.State.LAYOUT);
    }
  }
  if ('group' in config) {
    var groups = config['groups'];
    for (var i = 0; i < groups.length; i++) {
      var group = groups[i];
      this.group(group['id'], group['settings']);
    }
  }

  if ('interactivity' in config)
    this.interactivity().setup(config['interactivity']);
};


/** @inheritDoc */
anychart.graphModule.Chart.prototype.disposeInternal = function() {
  goog.disposeAll(
    this.edges_,
    this.nodes_,
    this.interactivity_,
    this.layout_,
    this.dragger_
  );
  this.edges().disposeInternal();
  this.nodes().disposeInternal();
  this.nodesArray_ = null;
  this.edgesArray_ = null;

  this.edges_ = null;
  this.nodes_ = null;
  this.interactivity_ = null;
  this.layout_ = null;

  this.edgesMap_ = {};
  this.nodesMap_ = {};
  this.groupsMap_ = {};

  anychart.graphModule.Chart.base(this, 'disposeInternal');
};


//endregion
//region Exports
(function() {
  var proto = anychart.graphModule.Chart.prototype;
  proto['data'] = proto.data;
  proto['edges'] = proto.edges;
  proto['fit'] = proto.fit;
  proto['zoom'] = proto.zoom;
  proto['getCurrentScene'] = proto.getCurrentScene;
  proto['fitAll'] = proto.fitAll;
  proto['zoomIn'] = proto.zoomIn;
  proto['zoomOut'] = proto.zoomOut;

  proto['move'] = proto.move;
  proto['getType'] = proto.getType;
  proto['group'] = proto.group;
  proto['rotation'] = proto.rotation;
  proto['nodes'] = proto.nodes;
  proto['layout'] = proto.layout;
  proto['interactivity'] = proto.interactivity;
  proto['noData'] = proto.noData;
})();
//endregion
