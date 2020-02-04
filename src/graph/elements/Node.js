goog.provide('anychart.graphModule.elements.Node');

goog.require('anychart.core.Base');
goog.require('anychart.core.ui.OptimizedText');
goog.require('anychart.core.ui.Tooltip');
goog.require('anychart.graphModule.elements.Base');
goog.require('anychart.reflow.IMeasurementsTargetProvider');
goog.require('goog.math.Coordinate');



/**
 * @constructor
 * @param {anychart.graphModule.Chart} chart
 * @implements {anychart.reflow.IMeasurementsTargetProvider}
 * @extends {anychart.graphModule.elements.Base}
 */
anychart.graphModule.elements.Node = function(chart) {
  anychart.graphModule.elements.Node.base(this, 'constructor', chart);

  /**
   * Chart instance.
   * @type {anychart.graphModule.Chart}
   * @private
   */
  this.chart_ = chart;

  /**
   * Type of element
   * @type {anychart.graphModule.Chart.Element}
   */
  this.type = anychart.graphModule.Chart.Element.NODE;

  /**
   * Layer for labels.
   * @type {Element}
   * @private
   */
  this.labelsLayerEl_;

  /**
   * @type {!anychart.data.Iterator}
   * @private
   */
  this.iterator_;

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
  this.layerForNodes_ = acgraph.layer();

  /**
   *
   * @type {acgraph.vector.UnmanagedLayer}
   * @private
   */
  this.layerForNodesLabels_ = this.getLabelsLayer();

  this.layerForNodes_.parent(this.mainLayer_);
  this.layerForNodesLabels_.parent(this.mainLayer_);

  anychart.measuriator.register(this);
};
goog.inherits(anychart.graphModule.elements.Node, anychart.graphModule.elements.Base);


/**
 *  Supported signals.
 */
anychart.graphModule.elements.Node.prototype.SUPPORTED_SIGNALS = anychart.graphModule.elements.Base.prototype.SUPPORTED_SIGNALS | anychart.Signal.NEEDS_REDRAW;


/**
 * Getter for labels layer.
 * @return {acgraph.vector.UnmanagedLayer}
 */
anychart.graphModule.elements.Node.prototype.getLabelsLayer = function() {
  if (!this.labelsLayer_) {
    this.labelsLayerEl_ = /** @type {Element} */(acgraph.getRenderer().createLayerElement());
    this.labelsLayer_ = acgraph.unmanagedLayer(this.labelsLayerEl_);
  }
  return this.labelsLayer_;
};


/**
 * @return {!anychart.data.Iterator} iterator
 */
anychart.graphModule.elements.Node.prototype.getIterator = function() {
  return this.iterator_ || (this.iterator_ = this.chart_.data()['nodes'].getIterator());
};


/** @inheritDoc */
anychart.graphModule.elements.Node.prototype.provideMeasurements = function() {
  var texts = [];
  var nodes = this.chart_.getNodesArray();
  for (var i = 0; i < nodes.length; i++) {
    var node = nodes[i];
    var labelSettings = this.resolveLabelSettings(node);
    var te = this.getTextOptimizedText(node);
    if (labelSettings.enabled()) {
      texts.push(te);
    }
  }

  return texts;
};


/**
 * Getter for tooltip settings.
 * @param {(Object|boolean|null)=} opt_value - Tooltip settings.
 * @return {!(anychart.graphModule.elements.Node|anychart.core.ui.Tooltip)} - Tooltip instance or self for method chaining.
 */
anychart.graphModule.elements.Node.prototype.tooltip = function(opt_value) {
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


/**
 * Returns id of element.
 * @param {anychart.graphModule.Chart.Node} node
 * @return {string} id of element.
 */
anychart.graphModule.elements.Node.prototype.getElementId = function(node) {
  return node.id;
};


/**
 * @param {anychart.graphModule.Chart.Node} node
 * @param {string} setting
 * @return {*}
 */
anychart.graphModule.elements.Node.prototype.resolveSettings = function(node, setting) {
  var stringState = anychart.utils.pointStateToName(node.currentState);
  var normalStingState = anychart.utils.pointStateToName(anychart.SettingsState.NORMAL);

  var finalSetting, iteratorValue;
  finalSetting = this[normalStingState]()[setting]();
  var tmpSetting = this[stringState]()[setting]();
  finalSetting = goog.isDef(tmpSetting) ? tmpSetting : finalSetting;

  if (setting != 'fill' && setting != 'stroke') {
    var ownNormalSetting = this[normalStingState]().getOwnOption(setting);
    var ownStateSetting = this[stringState]().getOwnOption(setting);
    if (goog.isDef(ownStateSetting)) {
      finalSetting = ownStateSetting;
    } else if (goog.isDef(ownNormalSetting)) {
      finalSetting = ownNormalSetting;
    }
  }
  var group = this.chart_.group(/** @type {string} */(node.groupId));

  if (goog.isDef(group)) {
    var ownGroupNormalSetting = group[normalStingState]().getOwnOption(setting);
    var ownGroupStateSetting = group[stringState]().getOwnOption(setting);
    if (goog.isDefAndNotNull(ownGroupStateSetting)) {
      finalSetting = ownGroupStateSetting;
    } else if (goog.isDefAndNotNull(ownGroupNormalSetting)) {
      finalSetting = ownGroupNormalSetting;
    }
  }

  var iterator = this.getIterator();
  iterator.select(node.dataRow);

  iteratorValue = iterator.get(setting);
  finalSetting = goog.isDef(iteratorValue) ? iteratorValue : finalSetting;

  iteratorValue = iterator.get(stringState);
  finalSetting = iteratorValue && goog.isDef(iteratorValue[setting]) ? iteratorValue[setting] : finalSetting;
  return finalSetting;
};

//region Labels
// /**
//  * Update label style of all nodes
//  */
// anychart.graphModule.elements.Node.prototype.updateLabelsStyle = function() {
//   var nodes = this.chart_.getNodesArray();
//
//   for (var i = 0; i < nodes.length; i++) {
//     var node = nodes[i];
//     this.updateLabelStyle(node);
//   }
// };


/**
 * Update labels style of node
 * @param {anychart.graphModule.Chart.Node} node
 */
anychart.graphModule.elements.Node.prototype.updateLabelStyle = function(node) {
  var enabled = this.resolveLabelSettings(node).enabled();
  if (enabled && !node.optimizedText) {
    node.optimizedText = this.getText();
  }
  if (node.optimizedText) {
    node.optimizedText.resetComplexity();
    this.setupAutoAnchorAndPosition_(node);
    this.setupText(node);
    node.optimizedText.renderTo(this.labelsLayerEl_);
    node.optimizedText.prepareBounds();
    this.drawLabel(node);
    // node.optimizedText.resetComplexity();
  }
};


/**
 * Setup anchor and position for labels.
 * @param {anychart.graphModule.Chart.Node} node
 * @private
 */
anychart.graphModule.elements.Node.prototype.setupAutoAnchorAndPosition_ = function(node) {
  var labelSettings = this.resolveLabelSettings(node);
  if (labelSettings.getOption('anchor') == anychart.enums.Anchor.AUTO) {
    if (this.chart_.layout().getOption('type') == anychart.enums.LayoutType.FORCED) {
      if (this.chart_.layout().getOption('iterationCount') == 0) {
        var center = this.chart_.nodesCenter;
        var angle = 360 - goog.math.angle(center.x, center.y, node.position.x, node.position.y);
        if (angle >= 90 && angle <= 270) {
          node.labelAnchor = anychart.enums.Anchor.RIGHT_CENTER;
        } else {
          node.labelAnchor = anychart.enums.Anchor.LEFT_CENTER;
        }
        node.labelPosition = anychart.enums.Position.LEFT_TOP;
      } else {
        if (node.siblings.length == 1) { //leaf node
          var sibling = node.siblings[0];
          sibling = this.chart_.getNodeById(sibling);
          if (node.position.x > sibling.position.x) {
            node.labelPosition = anychart.enums.Position.RIGHT_CENTER;
            node.labelAnchor = anychart.enums.Anchor.LEFT_CENTER;
          } else {
            node.labelPosition = anychart.enums.Position.LEFT_CENTER;
            node.labelAnchor = anychart.enums.Anchor.RIGHT_CENTER;
          }

        } else {
          node.labelPosition = anychart.enums.Position.CENTER_BOTTOM;
          node.labelAnchor = anychart.enums.Anchor.CENTER_TOP;
        }
      }
    }
  }
};


/**
 * Setup text element.
 * @param {anychart.graphModule.Chart.Node} node
 */
anychart.graphModule.elements.Node.prototype.applyLabelStyle = function(node) {
  this.setupAutoAnchorAndPosition_(node);
  this.setupText(node);
};


/**
 * Applies style to labels.
 */
anychart.graphModule.elements.Node.prototype.applyLabelsStyle = function() {
  var nodes = this.chart_.getNodesArray();
  for (var i = 0; i < nodes.length; i++) {
    var node = nodes[i];
    this.applyLabelStyle(node);
  }
};


/**
 * Return coordinate for labels
 * @param {anychart.graphModule.Chart.Node} node
 * @return {{x:number, y:number}}
 */
anychart.graphModule.elements.Node.prototype.getLabelPosition = function(node) {
  var x = node.position.x;
  var y = node.position.y;

  return {x: x, y: y};
};


/**
 * Return labels bounds for node
 * @param {anychart.graphModule.Chart.Node} node
 * @return {anychart.math.Rect}
 */
anychart.graphModule.elements.Node.prototype.getLabelBounds = function(node) {
  var labelSettings = this.resolveLabelSettings(node);
  var position = this.getLabelPosition(node);
  var context = this.getColorResolutionContext(node);
  var thickness = anychart.utils.extractThickness(this.getStroke(context, node));
  var nodeHeight = this.getHeight(node);
  var nodeWidth = this.getWidth(node);

  var left = position.x - nodeWidth / 2;
  var top = position.y - nodeHeight / 2;

  var center = this.chart_.nodesCenter;

  var padding = labelSettings.padding();

  if (labelSettings.getOption('anchor') == anychart.enums.Anchor.AUTO &&
      this.chart_.layout().getOption('type') == anychart.enums.LayoutType.FORCED) {
    if (this.chart_.layout().getOption('iterationCount') == 0) {
      var coordinate = new goog.math.Coordinate(node.position.x, node.position.y);

      var innerRadius = goog.math.Coordinate.distance(center, coordinate);
      var outerRadius = innerRadius + Math.max(nodeWidth, nodeHeight) / 2;

      var scale = (outerRadius / innerRadius) + 0.025; //offset between node and label.

      coordinate.scale(scale);
      var tmpCenter = this.chart_.nodesCenter.clone();
      tmpCenter.scale(scale);

      //move center of circle back
      var dx = tmpCenter.x - this.chart_.nodesCenter.x;
      var dy = tmpCenter.y - this.chart_.nodesCenter.y;

      left = coordinate.x -= dx;
      top = coordinate.y -= dy;
    }
  }
  //this.chart_.mainLayer_.path().moveTo(center.x, center.y).lineTo(left, top);
  //this.chart_.mainLayer_.circle(left, top, 1)
  var bounds = anychart.math.rect(left, top, nodeWidth, nodeHeight);

  var result = padding.tightenBounds(bounds);

  return result;
};


/**
 * Set transform attribute into dom
 * @param {anychart.graphModule.Chart.Node} node
 * @param {anychart.math.Rect} bounds
 */
anychart.graphModule.elements.Node.prototype.rotateLabel = function(node, bounds) {
  if (node.optimizedText) {
    var labelSettings = this.resolveLabelSettings(node);
    var dom = node.optimizedText.getDomElement();
    dom.removeAttribute('transform');
    if (labelSettings.getOption('autoRotate')) {
      // this.chart_.mainLayer_.rect(bounds.left, bounds.top, bounds.width, bounds.height);
      var center = this.chart_.nodesCenter;
      var angle = goog.math.angle(center.x, center.y, node.position.x, node.position.y);
      if (angle >= 90 && angle <= 270) {
        angle += 180;
      }
      angle = goog.math.standardAngle(angle);
      var x = bounds.left;
      var y = bounds.top + bounds.height / 2;
      var rotation = 'rotate(' + angle + ', ' + x + ', ' + y + ')';
      dom.setAttribute('transform', rotation);
    }
  }
};


/**
 * Draw label for passed node.
 * @param {anychart.graphModule.Chart.Node} node
 */
anychart.graphModule.elements.Node.prototype.drawLabel = function(node) {
  var optimizedText = this.getTextOptimizedText(node);
  var labelSettings = this.resolveLabelSettings(node);
  if (labelSettings.enabled()) {
    var cellBounds = this.getLabelBounds(node);
    var stage = this.chart_.container().getStage();
    optimizedText.renderTo(this.labelsLayerEl_);
    optimizedText.putAt(cellBounds, stage);
    optimizedText.finalizeComplexity();
    this.rotateLabel(node, cellBounds);
  } else {
    optimizedText.renderTo(null);
    optimizedText.resetComplexity();
  }

};


/**
 * Draw all enabled labels for node.
 */
anychart.graphModule.elements.Node.prototype.drawLabels = function() {
  var nodes = this.chart_.getNodesArray();
  for (var i = 0; i < nodes.length; i++) {
    var node = nodes[i];
    this.drawLabel(node);
  }
};


//endregion
/**
 * Stick node to sibling.
 * @param {anychart.graphModule.Chart.Node} node
 */
anychart.graphModule.elements.Node.prototype.stickNode = function(node) {
  var gap = 5;
  var subGraph = this.chart_.getSubGraphsMap()[/** @type {string} */(node.subGraphId)];
  var closestX, closestY;
  closestX = closestY = Infinity;
  var x = node.position.x;
  var y = node.position.y;

  for (var i = 0; i < subGraph.length; i++) {
    if (node.id != subGraph[i]) {
      var neib = this.chart_.getNodeById(subGraph[i]);
      var neibPosition = neib.position;

      if (node.position.x > (neibPosition.x - gap) && node.position.x < (neibPosition.x + gap)) {
        var distanceX = node.position.x - neibPosition.x;
        if (distanceX < closestX) {
          closestX = distanceX;
          x = neibPosition.x;
        }
      }

      if (node.position.y > (neibPosition.y - gap) && node.position.y < (neibPosition.y + gap)) {
        var distanceY = node.position.y - neibPosition.y;
        if (distanceY < closestY) {
          closestY = distanceY;
          y = neibPosition.y;
        }
      }
    }
  }
  node.position.x = x;
  node.position.y = y;
};


/**
 * Return height of node.
 * @param {anychart.graphModule.Chart.Node} node
 * @return {number}
 */
anychart.graphModule.elements.Node.prototype.getHeight = function(node) {
  return /** @type {number} */(this.resolveSettings(node, 'height'));
};


/**
 * Return width of node.
 * @param {anychart.graphModule.Chart.Node} node
 * @return {number}
 */
anychart.graphModule.elements.Node.prototype.getWidth = function(node) {
  var shape = this.resolveSettings(node, 'shape');
  if (shape == anychart.enums.normalizeMarkerType(shape)) {
    return this.getHeight(node);
  } else {
    return /** @type {number} */(this.resolveSettings(node, 'width'));
  }
};


/**
 * Update shape and colors for node.
 * @param {anychart.graphModule.Chart.Node} node
 */
anychart.graphModule.elements.Node.prototype.updateNodeAppearance = function(node) {
  this.updatePathShape(node);
  this.updateNodeColors(node);
};


/**
 * @param {!acgraph.vector.Path} path
 * @param {number} x
 * @param {number} y
 * @param {number} height
 * @param {number} width
 * @return {!acgraph.vector.Path}
 * @private
 */
anychart.graphModule.elements.Node.prototype.rectangleDrawer_ = function(path, x, y, height, width) {
  var left = x - width;
  var top = y - height;
  var right = x + width;
  var bottom = y + height;

  path
    .moveTo(left, top)
    .lineTo(right, top)
    .lineTo(right, bottom)
    .lineTo(left, bottom)
    .lineTo(left, top)
    .close();

  return path;
};


/**
 * Return drawer for current shape type.
 * @param {anychart.graphModule.Chart.Node} node
 * @return {function(!acgraph.vector.Path, number, number, number, number):!acgraph.vector.Path} Marker drawer.
 */
anychart.graphModule.elements.Node.prototype.getShapeDrawer = function(node) {
  var type = this.resolveSettings(node, 'shape');
  if (type == anychart.enums.normalizeMarkerType(type)) {
    return anychart.utils.getMarkerDrawer(type);
  } else {
    return this.rectangleDrawer_;
  }
};


/**
 * Update path data for new state.
 * @param {anychart.graphModule.Chart.Node} node
 */
anychart.graphModule.elements.Node.prototype.updatePathShape = function(node) {
  var width = this.getWidth(node);
  var height = this.getHeight(node);

  var x = node.position.x;
  var y = node.position.y;
  var path = node.path;

  path.clear();
  if (path.domElement()) {
    path.domElement().removeAttribute('transform');
  }

  width /= 2;
  height /= 2;
  var drawer = this.getShapeDrawer(node);
  drawer(path, x, y, height, width);
};


/**
 * Set new stroke and fill for node.
 * @param {anychart.graphModule.Chart.Node} node
 */
anychart.graphModule.elements.Node.prototype.updateNodeColors = function(node) {
  var context = this.getColorResolutionContext(node);
  var fill = this.getFill(node, context);
  var stroke = this.getStroke(context, node);
  node.path.fill(fill);
  node.path.stroke(stroke);
};


/**
 * Append passed node into DOM.
 * @param {anychart.graphModule.Chart.Node} node
 */
anychart.graphModule.elements.Node.prototype.drawNode = function(node) {
  var path = this.createPath(node);
  path.parent(this.layerForNodes_);
};


/**
 * Append all nodes on layer
 */
anychart.graphModule.elements.Node.prototype.drawNodes = function() {
  var nodes = this.chart_.getNodesArray();
  for (var i = 0; i < nodes.length; i++) {
    var node = nodes[i];
    this.drawNode(node);
  }
  // this.nodes_.needsMeasureLabels();
};


/**
 * Update appearance of all nodes.
 * @param {anychart.graphModule.Chart.Node=} opt_node
 */
anychart.graphModule.elements.Node.prototype.updateAppearance = function(opt_node) {
  if (goog.isDef(opt_node)) {
    this.updateNodeAppearance(opt_node);
  } else {
    var nodes = this.chart_.getNodesArray();
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      this.updateNodeAppearance(node);
    }
  }
};


/**
 * Set position for dom element depend on node size.
 * @param {anychart.graphModule.Chart.Node} node
 */
anychart.graphModule.elements.Node.prototype.updateNodeDOMElementPosition = function(node) {
  var x = node.position.x;
  var y = node.position.y;

  var width = this.getWidth(node);
  var height = this.getHeight(node);

  x -= (width / 2);
  y -= (height / 2);

  node.path.setPosition(x, y);

  if (this.isLabelEnabled(node)) {
    var stage = this.chart_.container().getStage();
    node.optimizedText.renderTo(this.labelsLayerEl_);
    node.optimizedText.getDomElement().removeAttribute('transform');
    node.optimizedText.putAt(this.getLabelBounds(node), stage);
    node.optimizedText.finalizeComplexity();
  }
};


/**
 * Return layer for edges.
 * @return {acgraph.vector.Layer}
 */
anychart.graphModule.elements.Node.prototype.getLayer = function() {
  return this.mainLayer_;
};


/**
 * Create path element for node and return it.
 * @param {anychart.graphModule.Chart.Node} node
 * @return {acgraph.vector.Path}
 */
anychart.graphModule.elements.Node.prototype.createPath = function(node) {
  if (!node.path) {
    node.path = this.getPath();
  }
  var path = node.path;

  path.tag = this.createTag(node);
  node.currentState = /** @type {anychart.SettingsState} */(this.state(node));
  node.path = path;
  return path;
};


/** @inheritDoc */
anychart.graphModule.elements.Node.prototype.serialize = function() {
  var json = anychart.graphModule.elements.Node.base(this, 'serialize');
  var config = this.tooltip().serialize();
  if (!goog.object.isEmpty(config)) {
    json['tooltip'] = config;
  }

  return json;
};


/** @inheritDoc */
anychart.graphModule.elements.Node.prototype.disposeInternal = function() {
  var nodes = this.chart_.getNodesArray();

  for (var i = 0; i < nodes.length; i++) {
    var node = nodes[i];
    this.clear(node);
  }
  //Dispose all elements in pools and dispose all label settings.
  anychart.graphModule.elements.Node.base(this, 'disposeInternal');
};


//endregion
//region Exports
(function() {
  var proto = anychart.graphModule.elements.Node.prototype;
  proto['tooltip'] = proto.tooltip;
})();
//endregion
