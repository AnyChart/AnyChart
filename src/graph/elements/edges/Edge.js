goog.provide('anychart.graphModule.elements.Edge');

goog.require('anychart.core.ui.OptimizedText');
goog.require('anychart.graphModule.elements.Base');
goog.require('anychart.graphModule.elements.arrows.Controller');
goog.require('anychart.reflow.IMeasurementsTargetProvider');
goog.require('goog.math.Coordinate');


//region Constructor
/**
 * Settings object for edges.
 * @constructor
 * @param {anychart.graphModule.Chart} chart
 * @implements {anychart.reflow.IMeasurementsTargetProvider}
 * @extends {anychart.graphModule.elements.Base}
 */
anychart.graphModule.elements.Edge = function(chart) {
  anychart.graphModule.elements.Edge.base(this, 'constructor', chart);

  /**
   * @type {anychart.graphModule.Chart}
   * @private
   */
  this.chart_ = chart;

  /**
   * Type of element.
   * @type {anychart.graphModule.Chart.Element}
   */
  this.type = anychart.graphModule.Chart.Element.EDGE;

  /**
   * Context provider.
   * @type {anychart.format.Context}
   * @private
   */
  this.formatProvider_ = null;

  /**
   *
   * @type {acgraph.vector.Path}
   * @private
   */
  this.path_ = acgraph.path();

  /**
   *
   * @type {acgraph.vector.Layer}
   * @private
   */
  this.mainLayer_ = acgraph.layer();

  /**
   *
   * @type {acgraph.vector.Layer}
   * @private
   */
  this.layerForEdges_ = acgraph.layer();
  /**
   *
   * @type {acgraph.vector.UnmanagedLayer}
   * @private
   */
  this.layerForEdgesLabels_ = this.getLabelsLayer();

  this.layerForEdges_.parent(this.mainLayer_);
  this.layerForEdgesLabels_.parent(this.mainLayer_);

  anychart.measuriator.register(this);
};
goog.inherits(anychart.graphModule.elements.Edge, anychart.graphModule.elements.Base);


//endregion
//region Labels
/** @inheritDoc */
anychart.graphModule.elements.Edge.prototype.provideMeasurements = function() {
  var texts = [];

  var edges = this.chart_.getEdgesArray();
  for (var i = 0; i < edges.length; i++) {
    var edge = edges[i];
    var labelSettings = this.resolveLabelSettings(edge);
    var te = this.getTextOptimizedText(edge);
    if (labelSettings.enabled()) {
      texts.push(te);
    }
  }

  return texts;
};


/**
 * Return bounds for edge.
 * @param {anychart.graphModule.Chart.Edge} edge
 * @return {anychart.math.Rect}
 */
anychart.graphModule.elements.Edge.prototype.getLabelBounds = function(edge) {
  var labelSettings = this.resolveLabelSettings(edge);
  var position = this.getLabelPosition(edge);
  var from = this.chart_.getNodeById(edge.from);
  var to = this.chart_.getNodeById(edge.to);
  var rightPoint = new goog.math.Coordinate(from.position.x, from.position.y);
  var leftPoint = new goog.math.Coordinate(to.position.x, to.position.y);
  var center = new goog.math.Coordinate(position.x, position.y);
  var thickness = this.getEdgeThickness(edge);
  var length = this.getLength(edge);
  var halfThickness = thickness / 2;

  if (rightPoint.x > leftPoint.x) {
    var tmp = leftPoint;
    leftPoint = rightPoint;
    rightPoint = tmp;
  }

  var angle = goog.math.angle(leftPoint.x, leftPoint.y, rightPoint.x, rightPoint.y);

  rightPoint.rotateDegrees(-angle, center);
  leftPoint.rotateDegrees(-angle, center);

  rightPoint.y += halfThickness;
  leftPoint.y += halfThickness;

  rightPoint.rotateDegrees(angle, center);
  leftPoint.rotateDegrees(angle, center);

  var left = rightPoint.x;
  var top = rightPoint.y;
  var width = length;
  var height = thickness;
  var bounds = anychart.math.rect(left, top, width, height);
  var padding = labelSettings.padding();

  bounds = padding.tightenBounds(bounds);
  edge.pivot = rightPoint;
  edge.angle = (angle ? angle + 180 : -270);

  return bounds;
};


/**
 * Draw label for edge.
 * @param {anychart.graphModule.Chart.Edge} edge
 */
anychart.graphModule.elements.Edge.prototype.drawLabel = function(edge) {
  var labelSettings = this.resolveLabelSettings(edge);

  var optimizedText = this.getTextOptimizedText(edge);
  if (optimizedText) {
    if (labelSettings.enabled()) {
      var stage = this.chart_.container().getStage();
      var cellBounds = this.getLabelBounds(edge);

      optimizedText.renderTo(this.labelsLayerEl_);
      optimizedText.putAt(cellBounds, stage);
      optimizedText.finalizeComplexity();

      var dom = optimizedText.getDomElement();
      var dx = +dom.getAttribute('x') - cellBounds.left;
      var dy = +dom.getAttribute('y') - cellBounds.top;
      edge.labelDx = dx; // Save difference between dom position and bounds.
      edge.labelDy = dy;

      this.rotateLabel(edge, cellBounds);
    } else {
      optimizedText.renderTo(null);
      optimizedText.resetComplexity();
    }
  }
};


/**
 * Draw all enabled labels for edge.
 */
anychart.graphModule.elements.Edge.prototype.drawLabels = function() {
  var edges = this.chart_.getEdgesMap();
  for (var edge in edges) {
    edge = this.chart_.getEdgeById(edge);
    this.drawLabel(edge);
  }
  // this.resetComplexityForTexts();
};


/**
 * Applies style to labels.
 * @param {boolean=} opt_needsToDropOldBounds - Whether to drop old bounds and reset complexity.
 */
anychart.graphModule.elements.Edge.prototype.applyLabelsStyle = function(opt_needsToDropOldBounds) {
  var edges = this.chart_.getEdgesArray();
  for (var i = 0; i < edges.length; i++) {
    var edge = edges[i];
    this.setupText(edge);
  }
};


/**
 * Rotate label, set it parallel to edge.
 * Use transform here because it work faster.
 * @param {anychart.graphModule.Chart.Edge} edge
 * @param {anychart.math.Rect} bounds bounds of text.
 */
anychart.graphModule.elements.Edge.prototype.rotateLabel = function(edge, bounds) {
  var x = edge.pivot.x;
  var y = edge.pivot.y;
  var angle = edge.angle;
  var rotate = angle + ',' + x + ',' + y;

  var domElement = edge.optimizedText.getDomElement();
  domElement.setAttribute('transform', 'rotate(' + rotate + ')');
};


/**
 * Update label style for current edge.
 * @param {anychart.graphModule.Chart.Edge} edge
 *
 * @private
 */
anychart.graphModule.elements.Edge.prototype.updateLabelStyle_ = function(edge) {
  if (edge.optimizedText) {
    edge.optimizedText.resetComplexity();//drop all old settings
    this.setupText(edge);
    edge.optimizedText.renderTo(this.labelsLayerEl_);
    edge.optimizedText.prepareBounds();
    this.drawLabel(edge);
  }
};


/**
 * Calculate position for label
 * @param {anychart.graphModule.Chart.Edge} edge
 * @return {{x: number, y:number}}
 */
anychart.graphModule.elements.Edge.prototype.getLabelPosition = function(edge) {
  var nodes = this.chart_.getNodesMap();
  var from = nodes[edge.from];
  var to = nodes[edge.to];

  var x1 = to.position.x;
  var x2 = from.position.x;
  var y1 = to.position.y;
  var y2 = from.position.y;
  var x, y;


  if (x1 == x2) {
    var topY = Math.max(y1, y2);
    var bottomY = Math.min(y1, y2);

    var d = bottomY - topY;
    y = topY + d / 2;
    x = x1;
  } else {
    var maxX = Math.max(x1, x2); //Most right x
    var minX = Math.min(x1, x2);
    var maxY = Math.max(y1, y2); //Most top y
    var minY = Math.min(y1, y2);

    if (maxX == minX) {
      x = maxX;
      y = minY + ((maxY - minY) / 2);
    } else {
      x = minX + ((maxX - minX) / 2);
      y = ((x - minX) / (maxX - minX)) * (maxY - minY) + minY;
    }
  }

  return {x: x, y: y};
};


/**
 * Getter for labels layer.
 * @return {acgraph.vector.UnmanagedLayer}
 */
anychart.graphModule.elements.Edge.prototype.getLabelsLayer = function() {
  if (!this.labelsLayer_) {
    this.labelsLayerEl_ = acgraph.getRenderer().createLayerElement();
    this.labelsLayer_ = acgraph.unmanagedLayer(this.labelsLayerEl_);
  }
  return this.labelsLayer_;
};


/**
 * Update label position for edge label.
 * @param {anychart.graphModule.Chart.Edge} edge
 */
anychart.graphModule.elements.Edge.prototype.updateLabel = function(edge) {
  if (this.isLabelEnabled(edge)) {
    var stage = this.chart_.container().getStage();
    edge.optimizedText.renderTo(this.labelsLayerEl_);
    var bounds = this.getLabelBounds(edge);
    edge.optimizedText.putAt(bounds, stage);
    edge.optimizedText.finalizeComplexity();
    this.rotateLabel(edge, bounds);
  }
};


//endregion
//region --- Arrows
/**
 * Arrow signal handler.
 *
 * @private
 */
anychart.graphModule.elements.Edge.prototype.onArrowsSignal_ = function() {
  this.dispatchSignal(anychart.Signal.NEEDS_REDRAW_APPEARANCE);
};


/**
 * Returns arrow controller.
 *
 * @param {Object=} opt_config - Configuration object.
 * @return {anychart.graphModule.elements.Edge|!anychart.graphModule.elements.arrows.Controller}
 */
anychart.graphModule.elements.Edge.prototype.arrows = function(opt_config) {
  if (!this.arrowsController_) {
    this.arrowsController_ = new anychart.graphModule.elements.arrows.Controller(this);
    this.setupCreated('arrows', this.arrowsController_);
    this.arrowsController_.container(this.layerForEdges_);
    this.arrowsController_.listenSignals(this.onArrowsSignal_, this);
  }

  if (goog.isDef(opt_config)) {
    this.arrowsController_.setup(opt_config);

    return this;
  }

  return this.arrowsController_;
};


/**
 * Return arrow stroke color.
 * @param {anychart.graphModule.elements.arrows.Arrow} arrow
 * @return {acgraph.vector.Stroke}
 */
anychart.graphModule.elements.Edge.prototype.getArrowStroke = function(arrow) {
  var edge = arrow.edge();
  return this.getStroke(edge);
};


/**
 * Return arrow pointer position.
 *
 * @param {anychart.graphModule.elements.arrows.Arrow} arrow
 *
 * @return {!goog.math.Coordinate}
 */
anychart.graphModule.elements.Edge.prototype.getArrowPointerPosition = function(arrow) {
  var angle = this.getArrowRotation(arrow);
  var edge = arrow.edge();
  var positionRatio = 1 - this.arrows().getArrowPositionRatio(arrow);

  var to = this.chart_.getNodeById(edge.to);
  var from = this.chart_.getNodeById(edge.from);

  var toNodeWidth = this.chart_.nodes().getWidth(to) + anychart.utils.extractThickness(this.chart_.nodes().getStroke(to));
  var fromNodeWidth = this.chart_.nodes().getWidth(from) + anychart.utils.extractThickness(this.chart_.nodes().getStroke(from));

  var toNodeIntersectionPoint = new goog.math.Coordinate(to.position.x + toNodeWidth / 2, to.position.y);
  var fromNodeIntersectionPoint = new goog.math.Coordinate(
    from.position.x + fromNodeWidth / 2 + this.arrows().getArrowSize(arrow), // Do not allow node and arrow intersections.
    from.position.y
  );

  fromNodeIntersectionPoint.rotateDegrees(angle, new goog.math.Coordinate(from.position.x, from.position.y));
  toNodeIntersectionPoint.rotateDegrees(angle - 180, new goog.math.Coordinate(to.position.x, to.position.y));

  var x = toNodeIntersectionPoint.x - ((toNodeIntersectionPoint.x - fromNodeIntersectionPoint.x) * positionRatio);
  var y = toNodeIntersectionPoint.y - ((toNodeIntersectionPoint.y - fromNodeIntersectionPoint.y) * positionRatio);


  return new goog.math.Coordinate(x, y);
};


/**
 * Return arrow rotation.
 *
 * @param {anychart.graphModule.elements.arrows.Arrow} arrow
 *
 * @return {number}
 */
anychart.graphModule.elements.Edge.prototype.getArrowRotation = function(arrow) {
  var edge = arrow.edge();
  var to = this.chart_.getNodeById(edge.to);
  var from = this.chart_.getNodeById(edge.from);

  return goog.math.angle(from.position.x, from.position.y, to.position.x, to.position.y);
};


/**
 * Return arrow fill color.
 *
 * @param {anychart.graphModule.elements.arrows.Arrow} arrow
 * @return {acgraph.vector.Stroke}
 */
anychart.graphModule.elements.Edge.prototype.getArrowFill = function(arrow) {
  var edge = arrow.edge();
  // Todo: Rework it when arrow coloring implemented.
  return this.getStroke(edge);
};


//endregion
//region Appearance
/** @inheritDoc */
anychart.graphModule.elements.Edge.prototype.clear = function(edge) {
  anychart.graphModule.elements.Edge.base(this, 'clear', edge);

  goog.dispose(edge.arrow);

  edge.arrow = null;

  if (edge.hoverPath) {
    edge.hoverPath.tag = null;
    edge.hoverPath.clear();
    edge.hoverPath.parent(null);
    this.pathPool.push(edge.hoverPath);
    edge.hoverPath = null;
  }
};


/**
 * Populate edge by drawing elements.
 *
 * @param {anychart.graphModule.Chart.Edge} edge
 */
anychart.graphModule.elements.Edge.prototype.populateEdgeByDrawingElements = function(edge) {
  if (this.chart_.interactivity().getOption('edges')) {
    edge.path = this.getPath();
    edge.path.tag = this.createTag(edge);
    edge.currentState = /** @type {anychart.SettingsState} */(this.state(edge));

    var thickness = this.getEdgeThickness(edge) + /** @type {number} */(this.chart_.interactivity().getOption('hoverGap'));

    edge.hoverPath = this.getPath();
    edge.hoverPath.tag = edge.path.tag;
    edge.hoverPath.fill(/** @type {acgraph.vector.SolidFill} */(anychart.color.TRANSPARENT_HANDLER));
    edge.hoverPath.stroke(/** @type {acgraph.vector.SolidFill} */(anychart.color.TRANSPARENT_HANDLER), thickness);
  }

  var labelSettings = this.resolveLabelSettings(edge);
  if (labelSettings.getOption('enabled')) {
    edge.optimizedText = this.getText();
  }

  if (this.arrows().getOption('enabled')) {
    edge.arrow = this.arrows().getArrow();
    edge.arrow.edge(edge);
  }
};


//endregion
//region Utils
/**
 * Setting resolver.
 * Resolve settings from data, theme and from user, and return that we need.
 * @param {anychart.graphModule.Chart.Edge} edge
 * @param {string} setting
 * @return {*}
 */
anychart.graphModule.elements.Edge.prototype.resolveSettings = function(edge, setting) {
  var stringState = anychart.utils.pointStateToName(edge.currentState);
  var settingsObject = this;
  var defaultSetting = settingsObject[stringState]().getOption(setting);
  var specificSetting;
  var settingForSpecificGroup;

  if (setting != 'fill' && setting != 'stroke') {
    var normalOwnOption = settingsObject['normal']().getOwnOption(setting);
    var stateOwnOption = settingsObject[stringState]().getOwnOption(setting);
    if (goog.isDef(stateOwnOption)) {
      defaultSetting = stateOwnOption;
    } else if (goog.isDef(normalOwnOption)) {
      defaultSetting = normalOwnOption;
    }
  }
  var iterator = this.getIterator();
  iterator.select(edge.dataRow);

  var value = iterator.get(setting);
  if (value) {
    specificSetting = value;
  }

  value = iterator.get(stringState);
  if (value && value[setting]) {
    specificSetting = value[setting];
  }
  var result = defaultSetting;
  result = goog.isDef(specificSetting) ? specificSetting : result;
  return result;
};


/**
 * Returns length of edge.
 * @param {anychart.graphModule.Chart.Edge} edge
 * @return {number} id of element.
 */
anychart.graphModule.elements.Edge.prototype.getLength = function(edge) {
  var from = this.chart_.getNodeById(edge.from);
  var to = this.chart_.getNodeById(edge.to);
  return Math.sqrt(Math.pow(to.position.x - from.position.x, 2) + Math.pow(to.position.y - from.position.y, 2));
};


/** @inheritDoc */
anychart.graphModule.elements.Edge.prototype.dropDataDependent = function() {
  anychart.graphModule.elements.Edge.base(this, 'dropDataDependent');

  this.iterator_ = null;
};


/**
 * Return edge iterator.
 * @return {!anychart.data.Iterator} iterator
 */
anychart.graphModule.elements.Edge.prototype.getIterator = function() {
  return this.iterator_ || (this.iterator_ = this.chart_.data()['edges'].getIterator());
};


/**
 * Return thickness of the edge
 * @param {anychart.graphModule.Chart.Edge} edge
 * @return {number}
 */
anychart.graphModule.elements.Edge.prototype.getEdgeThickness = function(edge) {
  var stroke = this.getStroke(edge);
  var thickness = anychart.utils.extractThickness(stroke);

  return thickness;
};


/**
 * Return position of node by node id.
 * @param {string} nodeId
 *
 * @return {{x:number, y:number}}
 */
anychart.graphModule.elements.Edge.prototype.getNodePosition = function(nodeId) {
  var node = this.chart_.getNodeById(nodeId);

  return node.position;
};


//endregion
// region drawing
/**
 * Append all nodes on layer.
 * @param {anychart.graphModule.Chart.Edge} edge Edge
 */
anychart.graphModule.elements.Edge.prototype.drawEdge = function(edge) {
  var from = this.chart_.getNodeById(edge.from);
  var to = this.chart_.getNodeById(edge.to);

  this.clear(edge);
  this.populateEdgeByDrawingElements(edge);

  if (edge.path) {
    edge.path.moveTo(from.position.x, from.position.y);
    edge.path.lineTo(to.position.x, to.position.y);
    edge.path.parent(this.layerForEdges_);

    edge.hoverPath.moveTo(from.position.x, from.position.y);
    edge.hoverPath.lineTo(to.position.x, to.position.y);
    edge.hoverPath.parent(this.layerForEdges_);

    edge.path.stroke(this.getStroke(edge));
  } else {
    this.path_.moveTo(from.position.x, from.position.y);
    this.path_.lineTo(to.position.x, to.position.y);
    this.path_.stroke(this.getStroke(edge));
  }

  if (edge.arrow) {
    edge.arrow.draw();
  }

  this.updateLabelStyle_(edge);
};


/**
 * Reset dom of all elements.
 */
anychart.graphModule.elements.Edge.prototype.clearAll = function() {
  this.path_.clear();

  var edges = this.chart_.getEdgesArray();
  for (var i = 0; i < edges.length; i++) {
    this.clear(edges[i]);
  }
};


/**
 * Draw edges.
 */
anychart.graphModule.elements.Edge.prototype.drawEdges = function() {
  var edges = this.chart_.getEdgesArray();

  this.layerForEdges_.suspend();

  this.path_.parent(this.layerForEdges_);

  this.clearAll();

  for (var i = 0; i < edges.length; i++) {
    this.drawEdge(edges[i]);
  }

  this.layerForEdges_.resume();
};


/**
 * Return layer for edges.
 * @return {acgraph.vector.Layer}
 */
anychart.graphModule.elements.Edge.prototype.getLayer = function() {
  return this.mainLayer_;
};


//endregion
//region tooltip and dispose
/** @inheritDoc */
anychart.graphModule.elements.Edge.prototype.serialize = function() {
  var json = anychart.graphModule.elements.Edge.base(this, 'serialize');
  var config = this.tooltip().serialize();
  if (!goog.object.isEmpty(config)) {
    json['tooltip'] = config;
  }
  return json;
};


/** @inheritDoc */
anychart.graphModule.elements.Edge.prototype.disposeInternal = function() {
  var edges = this.chart_.getEdgesArray();

  for (var i = 0; i < edges.length; i++) {
    var edge = edges[i];
    this.clear(edge);
    goog.dispose(edge.arrow);
  }
  //Dispose all elements in pools and dispose all label settings.
  anychart.graphModule.elements.Edge.base(this, 'disposeInternal');
};


//endregion
//region Exports
(function() {
  var proto = anychart.graphModule.elements.Edge.prototype;
  proto['arrows'] = proto.arrows;
  proto['tooltip'] = proto.tooltip;
})();
//endregion

