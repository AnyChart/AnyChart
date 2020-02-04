goog.provide('anychart.graphModule.elements.Edge');

goog.require('anychart.core.ui.OptimizedText');
goog.require('anychart.core.ui.Tooltip');
goog.require('anychart.graphModule.elements.Base');
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
//region Signals.
/**
 * Supported signals.
 * @type {number}
 */
anychart.graphModule.elements.Edge.prototype.SUPPORTED_SIGNALS = anychart.graphModule.elements.Base.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistency states
 * @type {anychart.ConsistencyState|number}
 */
anychart.graphModule.elements.Edge.prototype.SUPPORTED_CONSISTENCY_STATES = anychart.ConsistencyState.APPEARANCE;


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
      edge.labelDy = dy; //

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
 */
anychart.graphModule.elements.Edge.prototype.updateLabelStyle = function(edge) {
  var enabled = this.resolveLabelSettings(edge).enabled();
  if (enabled && !edge.optimizedText) {
    this.getTextOptimizedText(edge);
  }

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
  var halfEdgeThickness = this.getEdgeThickness(edge) / 2;

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
  }
  else {
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
//region Appearance
/**
 * Create path element for edge and return it.
 * @param {anychart.graphModule.Chart.Edge} edge
 * @return {acgraph.vector.Path}
 */
anychart.graphModule.elements.Edge.prototype.createPath = function(edge) {
  var path;
  this.clear(edge);
  if (!edge.path) {
    edge.path = this.getEdgePath();
  }

  path = edge.path;
  path.tag = this.createTag(edge);
  edge.currentState = /** @type {anychart.SettingsState} */(this.state(edge));
  edge.path = path;

  if (this.chart_.interactivity().getOption('edges')) {
    var thickness = this.getEdgeThickness(edge) + /** @type {number} */(this.chart_.interactivity().getOption('hoverGap'));
    var hoverPath = this.getEdgePath();
    hoverPath.tag = path.tag;
    hoverPath.fill(/** @type {acgraph.vector.SolidFill} */(anychart.color.TRANSPARENT_HANDLER));
    hoverPath.stroke(/** @type {acgraph.vector.SolidFill} */(anychart.color.TRANSPARENT_HANDLER), thickness);
  }

  edge.hoverPath = hoverPath;
  var lbs = this.resolveLabelSettings(edge);
  if (lbs.enabled()) {
    edge.optimizedText = this.getText();
  }
  return path;
};


/**
 * Return path object for edge.
 * @return {acgraph.vector.Path}
 */
anychart.graphModule.elements.Edge.prototype.getEdgePath = function() {
  if (this.chart_.interactivity().getOption('edges')) {
    return this.getPath();
  } else {
    if (!this.path_) {
      this.path_ = acgraph.path();
    }
    return this.path_;
  }
};


/**
 * Update stroke of passed edge.
 * @param {anychart.graphModule.Chart.Edge} edge
 */
anychart.graphModule.elements.Edge.prototype.updateColors = function(edge) {
  var context = this.getColorResolutionContext(edge);
  var stroke = this.getStroke(context, edge);
  edge.path.stroke(stroke);
};


/**
 * Update colors
 * @param {anychart.graphModule.Chart.Edge=} opt_edge
 */
anychart.graphModule.elements.Edge.prototype.updateAppearance = function(opt_edge) {
  if (goog.isDef(opt_edge)) {
    this.updateColors(opt_edge);
  } else {
    if (this.chart_.interactivity().getOption('edges')) {
      var edges = this.getElementsArray();
      for (var i = 0; i < edges.length; i++) {
        var edge = edges[i];
        this.updateColors(edge);
      }
    } else {
      var context = this.getColorResolutionContext();
      var stroke = this.getStroke(context);
      this.path_.stroke(stroke);
    }
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
 * Returns id of element.
 * @param {anychart.graphModule.Chart.Edge} edge
 * @return {string} id of element.
 */
anychart.graphModule.elements.Edge.prototype.getElementId = function(edge) {
  return edge.id;
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


/**
 * Return edge iterator.
 * @return {!anychart.data.Iterator} iterator
 */
anychart.graphModule.elements.Edge.prototype.getIterator = function() {
  return this.iterator_ || (this.iterator_ = this.chart_.data()['edges'].getIterator());
};


/**
 * Return array of nodes.
 * @return {Array<anychart.graphModule.Chart.Edge>}
 */
anychart.graphModule.elements.Edge.prototype.getElementsArray = function() {
  return this.chart_.getEdgesArray();
};


/**
 * Interactivity signal handler.
 * @param {anychart.SignalEvent} event
 */
anychart.graphModule.elements.Edge.prototype.onInteractivitySignal = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.APPEARANCE);
  }
};


/**
 * Return thickness of the edge
 * @param {anychart.graphModule.Chart.Edge} edge
 * @return {number}
 */
anychart.graphModule.elements.Edge.prototype.getEdgeThickness = function(edge) {
  var context = this.getColorResolutionContext(edge);
  var stroke = this.getStroke(context, edge);
  var thickness = anychart.utils.extractThickness(stroke);

  return thickness;
};


//endregion
// region drawing
/**
 * Append edge into layer.
 * @param {anychart.graphModule.Chart.Edge} edge
 */
anychart.graphModule.elements.Edge.prototype.appendEdgeOnLayer = function(edge) {
  var path = this.createPath(edge);
  var hoverPath = edge.hoverPath;
  var from = this.chart_.getNodeById(edge.from);
  var to = this.chart_.getNodeById(edge.to);

  path.moveTo(from.position.x, from.position.y);
  path.lineTo(to.position.x, to.position.y);

  hoverPath.moveTo(from.position.x, from.position.y);
  hoverPath.lineTo(to.position.x, to.position.y);

  path.parent(this.layerForEdges_);
  hoverPath.parent(this.layerForEdges_);
};


/**
 * @param {Array.<anychart.graphModule.Chart.Edge>} edges
 * @return {string}
 */
anychart.graphModule.elements.Edge.prototype.getPathData = function(edges) {
  var pathData = [];
  for (var i = 0, length = edges.length; i < length; i++) {
    var edge = edges[i];
    var from = this.chart_.getNodeById(edge.from).position;
    var to = this.chart_.getNodeById(edge.to).position;
    pathData.push('M', from.x, from.y, 'L', to.x, to.y);
  }
  pathData = pathData.join(' ');
  return pathData;
};


/**
 * Append all nodes on layer.
 * @param {anychart.graphModule.Chart.Edge=} opt_edge Edge
 */
anychart.graphModule.elements.Edge.prototype.drawEdge = function(opt_edge) {
  var edges = this.getElementsArray();
  var edge;
  if (opt_edge) {
    edge = opt_edge;
    var from = this.chart_.getNodeById(edge.from);
    var to = this.chart_.getNodeById(edge.to);
    var x1 = from.position.x;
    var y1 = from.position.y;

    var x2 = to.position.x;
    var y2 = to.position.y;

    edge.path.clear().moveTo(x1, y1).lineTo(x2, y2);
    edge.hoverPath.clear().moveTo(x1, y1).lineTo(x2, y2);
  } else {
    if (this.chart_.interactivity().getOption('edges')) {
      for (var i = 0, length = edges.length; i < length; i++) {
        edge = edges[i];
        this.appendEdgeOnLayer(edge);
      }
    } else {
      var path = this.getEdgePath();
      var domElement = path.domElement();
      if (!domElement) { //at first draw we have no dom element here.
        path.createDom(true);
        domElement = path.domElement();
      }
      var pathData = this.getPathData(edges);
      domElement.setAttribute('d', pathData);
      path.parent(this.layerForEdges_);
      path.clearDirtyState(acgraph.vector.Element.DirtyState.DATA);
    }
    // this.edges_.needsMeasureLabels();
  }
};


/**
 * Draw edges.
 */
anychart.graphModule.elements.Edge.prototype.drawEdges = function() {
  this.path = this.chart_.mainLayer_.path();
  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    this.clearAll();
    var dom = this.path_.domElement();
    if (dom) {
      dom.removeAttribute('d');
    }
    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }
  this.drawEdge();
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
/**
 * Getter for tooltip settings.
 * @param {(Object|boolean|null)=} opt_value - Tooltip settings.
 * @return {!(anychart.graphModule.elements.Edge|anychart.core.ui.Tooltip)} - Tooltip instance or self for method chaining.
 */
anychart.graphModule.elements.Edge.prototype.tooltip = function(opt_value) {
  if (!this.tooltip_) {
    this.tooltip_ = new anychart.core.ui.Tooltip(0);
    this.tooltip_.dropThemes();
    this.setupCreated('tooltip', this.tooltip_);
    this.tooltip_.parent(/** @type {anychart.core.ui.Tooltip} */ (this.chart_.tooltip()));
    this.tooltip_.chart(this.chart_);
  }
  if (goog.isDef(opt_value)) {
    this.tooltip_.setup(opt_value);
    return this;
  } else {
    return this.tooltip_;
  }
};


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
  }
  //Dispose all elements in pools and dispose all label settings.
  anychart.graphModule.elements.Edge.base(this, 'disposeInternal');
};


//endregion
//region Exports
(function() {
  var proto = anychart.graphModule.elements.Edge.prototype;
  proto['tooltip'] = proto.tooltip;
})();
//endregion

