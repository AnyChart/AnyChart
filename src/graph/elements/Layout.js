goog.provide('anychart.graphModule.elements.Layout');

goog.require('anychart.core.Base');
goog.require('goog.math.Rect');


/**
 * @constructor
 * @param {anychart.graphModule.Chart} chart
 * @extends {anychart.core.Base}
 */
anychart.graphModule.elements.Layout = function(chart) {
  anychart.graphModule.elements.Layout.base(this, 'constructor');

  /**
   * Chart instance.
   * @type {anychart.graphModule.Chart}
   * @private
   */
  this.chart_ = chart;

  //manipulate this values you can achieve different results.
  /**
   * Maximum velocity.
   * @type {number}
   * @const
   */
  this.maximumVelocity = 0.12;

  /**
   * Minimum velocity.
   * @type {number}
   * @const
   */
  this.minimumVelocity = -this.maximumVelocity;

  /**
   *
   * @type {number}
   * @const
   */
  this.initialPositionFactor = 10;

  /**
   * @type {number}
   */
  this.repulsiveFactor = 0.9;

  /**
   * @type {number}
   */
  this.attractiveForceFactor = 10;

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['type', 0, anychart.Signal.NEEDS_REDRAW],
    ['iterationCount', 0, anychart.Signal.NEEDS_REDRAW]
  ]);
};
goog.inherits(anychart.graphModule.elements.Layout, anychart.core.Base);


/**
 * Own property descriptors
 */
anychart.graphModule.elements.Layout.OWN_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  function layoutNormalizer (value) {
    return anychart.enums.normalize(anychart.enums.LayoutType, value, anychart.enums.LayoutType.FORCED);
  }

  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'type', layoutNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'iterationCount', anychart.core.settings.numberNormalizer]
  ]);
  return map;
})();
anychart.core.settings.populate(anychart.graphModule.elements.Layout, anychart.graphModule.elements.Layout.OWN_DESCRIPTORS);


/**
 * Supported signals.
 * @type {number}
 */
anychart.graphModule.elements.Layout.prototype.SUPPORTED_SIGNALS = anychart.Signal.NEEDS_REDRAW;


/**
 * Call layout function for current layout type.
 */
anychart.graphModule.elements.Layout.prototype.getCoordinatesForCurrentLayout = function() {
  var type = /** @type {anychart.enums.LayoutType} */(this.getOption('type'));

  switch (type) {
    case anychart.enums.LayoutType.FORCED:
      this.forceLayout_();
      break;
    case anychart.enums.LayoutType.FIXED:
      this.explicitLayout_();
      break;
  }
};


/**
 * Set coordinates for nodes if in data or 0.
 * @private
 */
anychart.graphModule.elements.Layout.prototype.explicitLayout_ = function() {
  var nodes = this.chart_.getNodesArray();

  for (var i = 0; i < nodes.length; i++) {
    var node = nodes[i];
    var row = this.chart_.data()['nodes'].getRow(node.dataRow);
    var x = row['x'];
    var y = row['y'];

    if (!goog.isDefAndNotNull(x)) {
      x = 0;
      anychart.core.reporting.warning(anychart.enums.WarningCode.GRAPH_NO_COORDINATE_FOR_FIXED_MODE, null, [node.id, 'x'], true);
    }
    if (!goog.isDefAndNotNull(y)) {
      y = 0;
      anychart.core.reporting.warning(anychart.enums.WarningCode.GRAPH_NO_COORDINATE_FOR_FIXED_MODE, null, [node.id, 'y'], true);
    }

    node.position.x = x;
    node.position.y = y;
  }
};


/**
 * Repel two nodes.
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @param {number} factor
 * @return {Array.<number>} Array with force
 * @private
 */
anychart.graphModule.elements.Layout.prototype.repulsive_ = function(x1, y1, x2, y2, factor) {
  var repulsiveX, repulsiveY;
  var distanceX = x1 - x2;
  var distanceY = y1 - y2;
  var distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
  if (distance != 0) {
    var directX = distanceX / distance;
    var directY = distanceY / distance;
    repulsiveX = directX / distance * factor;
    repulsiveY = directY / distance * factor;
  }
  return [repulsiveX, repulsiveY];
};


/**
 * Push two nodes.
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @param {number} factor
 * @return {Array.<number>} Array with force
 * @private
 */
anychart.graphModule.elements.Layout.prototype.attractive_ = function(x1, y1, x2, y2, factor) {
  var attractiveX, attractiveY;
  var distanceX = x1 - x2;
  var distanceY = y1 - y2;
  var distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
  if (distance != 0) {
    var directX = -distanceX / distance;
    var directY = -distanceY / distance;
    var ml = distance * distance / 50;
    attractiveX = directX * ml * factor;
    attractiveY = directY * ml * factor;
  }
  return [attractiveX, attractiveY];
};


/**
 * Automatically place nodes
 * @private
 */
anychart.graphModule.elements.Layout.prototype.forceLayout_ = function() {

  var nodes = this.chart_.getNodesArray();
  var subgraphs = this.chart_.getSubGraphsMap();
  var length, node, node2, i, j, force;

  length = nodes.length;
  var pi2 = Math.PI * 2;
  var angle = 0;
  var step = pi2 / length;
  for (i = 0; i < length; i++) {
    node = nodes[i];
    node.velocityX = 0;
    node.velocityY = 0;

    //Place nodes radial.
    node.position.x = this.initialPositionFactor * Math.cos(angle);
    node.position.y = this.initialPositionFactor * Math.sin(angle);
    angle += step;
  }

  var iterationCount = /** @type {number} */(this.getOption('iterationCount'));
  for (var iteration = 0; iteration < iterationCount; iteration++) {

    for (i = 0, length = nodes.length; i < length; i++) {
      node = nodes[i];
      node.repulsiveX = 0;
      node.repulsiveY = 0;
      for (j = 0; j < length; j++) {
        node2 = nodes[j];
        if (node != node2 && node.subGraphId == node2.subGraphId) { //repel only nodes of same groups. That works faster.
          force = this.repulsive_(node.position.x, node.position.y, node2.position.x, node2.position.y, this.repulsiveFactor);
          node.repulsiveX += force[0];
          node.repulsiveY += force[1];
        }
      }
    }
    for (i = 0, length = nodes.length; i < length; i++) {
      node = nodes[i];
      node.attractiveX = 0;
      node.attractiveY = 0;
      var neighbour = node.siblings;
      for (j = 0; j < neighbour.length; j++) {
        node2 = this.chart_.getNodeById(neighbour[j]);
        force = this.attractive_(node.position.x, node.position.y, node2.position.x, node2.position.y, this.attractiveForceFactor);
        node.attractiveX += force[0];
        node.attractiveY += force[1];
      }
    }

    for (i = 0, length = nodes.length; i < length; i++) {
      node = nodes[i];
      node.velocityX += (node.repulsiveX + node.attractiveX);
      node.velocityY += (node.repulsiveY + node.attractiveY);

      //Prevent node fly away.
      node.velocityX = goog.math.clamp(node.velocityX, this.minimumVelocity, this.maximumVelocity);
      node.velocityY = goog.math.clamp(node.velocityY, this.minimumVelocity, this.maximumVelocity);

      node.position.x += node.velocityX;
      node.position.y += node.velocityY;
    }
  }
  if (iterationCount > 0) {
    // If chart contains more than 1 disconnected graph place graphs from left to right.
    var keys = goog.object.getKeys(subgraphs);
    if (keys.length > 1) {
      var gap = 0.5; //offset between graphs
      var rectangles = [];

      //create a rectangles that includes all nodes of current graph.
      for (i = 0; i < keys.length; i++) {
        var key = keys[i];
        var elementsOfSubgraphs = subgraphs[key];
        var top = Infinity;
        var bottom = -Infinity;
        var left = Infinity;
        var right = -Infinity;
        length = elementsOfSubgraphs.length;
        //create a rectangle with side length equal gap length.
        if (length == 1) {
          node = this.chart_.getNodeById(elementsOfSubgraphs[0]);
          top = node.position.y - gap;
          left = node.position.x - gap;
          bottom = node.position.y + gap;
          right = node.position.x + gap;
        }
        //create rectangle that include all nodes.
        else {
          for (j = 0; j < length; j++) {
            node = this.chart_.getNodeById(elementsOfSubgraphs[j]);
            top = Math.min(top, node.position.y);
            bottom = Math.max(bottom, node.position.y);
            right = Math.max(right, node.position.x);
            left = Math.min(left, node.position.x);
          }
          left -= gap;
          right += gap;
          top -= gap;
          bottom += gap;
        }
        var width = Math.abs(left - right);
        var height = Math.abs(bottom - top);

        var rectangleWithGroupId = {
          id: key,
          rectangle: new goog.math.Rect(left, top, width, height)
        };
        rectangles.push(rectangleWithGroupId);

      }

      var x = 0;
      var y = 0;
      //move rectangles along x.
      for (i = 0; i < rectangles.length; i++) {
        left = rectangles[i].rectangle.getTopLeft().getX();
        width = rectangles[i].rectangle.getWidth();
        rectangles[i].dx = x - left;
        x += width + gap;
        rectangles[i].dy = -rectangles[i].rectangle.getCenter().getY();

        //move all nodes that rectangles includes on new position.
        var nodesOfCurrentSubGraph = subgraphs[rectangles[i].id];
        for (j = 0; j < nodesOfCurrentSubGraph.length; j++) {
          node = this.chart_.getNodeById(nodesOfCurrentSubGraph[j]);
          node.position.x += rectangles[i].dx;
          node.position.y += rectangles[i].dy;
        }
      }
    }
  }
};

// anychart.graphModule.elements.Layout.prototype.layput2 = function () {
//   var width = this.chart_.contentBounds.width;
//   var height = this.chart_.contentBounds.height;
//   var area = width * height;
//   var nodes = this.chart_.getNodesArray();
//   var edges = this.chart_.getEdgesArray();
//   var k = Math.sqrt(area / nodes.length);
//
//   function repulsive(x) {
//     return k * k / x;
//   }
//
//   function attractive(x) {
//     return x * x / k
//   }
//   var pi2 = Math.PI * 2;
//   for (i = 0, length = nodes.length; i < length; i++) {
//     node = nodes[i];
//     node.velocityX = 0;
//     node.velocityY = 0;
//
//     //Place nodes radial.
//     node.position.x = this.initialPositionFactor * Math.cos(pi2 / (i + 1));
//     node.position.y = this.initialPositionFactor * Math.sin(pi2 / (i + 1));
//   }
//
//   for (var i = 0; i < 500; i++) {
//     for (var node_ = 0; node_ < nodes.length; node_++) {
//       var node1 = nodes[node_];
//       node1.dispx = 0;
//       node1.dispy = 0;
//       for (var node_2 = 0; node_2 < nodes.length; node_2++) {
//         var node2 = nodes[node_2];
//         if (node1 != node2) {
//           var deltaX = node1.position.x - node2.position.x;
//           var deltaY = node1.position.y - node2.position.y;
//           var distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
//           if (distance) {
//             node1.dispx = node1.dispx + deltaX / distance * repulsive(distance);
//             node1.dispy = node1.dispy + deltaY / distance * repulsive(distance);
//           }
//         }
//       }
//     }
//
//     for (var e = 0; e < edges.length; e++) {
//       var edge = edges[e];
//       var from = this.chart_.getNodeById(edge.from);
//       var to = this.chart_.getNodeById(edge.to);
//
//       var deltaX = from.position.x - to.position.x;
//       var deltaY = from.position.y - to.position.y;
//       var distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
//       from.dispx = from.dispx - (deltaX / distance) * attractive(distance);
//       from.dispy = from.dispy - (deltaY / distance) * attractive(distance);
//       to.dispx = to.dispx + (deltaX / distance) * attractive(distance);
//       to.dispy = to.dispy + (deltaY / distance) * attractive(distance);
//     }
//     for (var n = 0; n < nodes.length; n++) {
//       var node = nodes[n];
//       node.position.x = node.position.x + node.dispx / Math.abs(node.dispx);
//       node.position.y = node.position.y + node.dispy / Math.abs(node.dispy);
//     }
//
//   }
// };


/** @inheritDoc */
anychart.graphModule.elements.Layout.prototype.setupSpecial = function(isDefault, var_args) {
  if (goog.isString(var_args)) {
    this.type(var_args);
    return true;
  }
  return false;
};


/** @inheritDoc */
anychart.graphModule.elements.Layout.prototype.setupByJSON = function(config, opt_default) {
  anychart.graphModule.elements.Layout.base(this, 'setupByJSON', config, opt_default);
  anychart.core.settings.deserialize(this, anychart.graphModule.elements.Layout.OWN_DESCRIPTORS, config, opt_default);
};


/** @inheritDoc */
anychart.graphModule.elements.Layout.prototype.serialize = function() {
  var json = anychart.graphModule.elements.Layout.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.graphModule.elements.Layout.OWN_DESCRIPTORS, json);
  return json;
};
