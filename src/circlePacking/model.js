/**
 * @file
 * 
 * Circle packing math model functionality.
 * Full description of what is going on can be found at DVF-4560 developer's
 * comments.
 */

goog.provide('anychart.circlePackingModule.model');

goog.require('anychart.math.Rect');
goog.require('goog.array');

/**
 * @typedef {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem}
 */
anychart.circlePackingModule.model.DataItemDef;


/**
 * Full description is at DVF-4560 developer's comments - "Code bases", paragraph 2.l.
 * 
 * @typedef {{
 *   left: number,
 *   right: number,
 *   top: number,
 *   bottom: number,
 *   radius: number
 * }}
 */
anychart.circlePackingModule.model.WeightDistances;


/**
 * Circle packing drawing model typedef.
 * Full description is at DVF-4560 developer's comments - "Code bases", paragraph 2.
 * 
 * @typedef {{
 *   index: number, 
 *   isRoot: boolean,
 *   isLeaf: boolean,
 *   weight: (number|undefined),
 *   name: (string|undefined),
 *   value: (number|undefined),
 *   item: (anychart.circlePackingModule.model.DataItemDef|undefined),
 *   children: (Array.<anychart.circlePackingModule.model.Item>|undefined),
 *   parent: (anychart.circlePackingModule.model.Item|null),
 *   weightCx: (number|undefined),
 *   weightCy: (number|undefined),
 *   weightDistances: (anychart.circlePackingModule.model.WeightDistances|undefined),
 *   cx: (number|undefined),
 *   cy: (number|undefined),
 *   radius: (number|undefined),
 *   bounds: (anychart.math.Rect|undefined),
 *   depth: number,
 *   domRef: (acgraph.vector.Element|undefined)
 * }}
 */
anychart.circlePackingModule.model.Item;


/**
 * Full description is at DVF-4560 developer's comments - "Tetris bases", paragraph 3.
 * 
 * @typedef {{
 *   circle1: anychart.circlePackingModule.model.Item,
 *   circle2: anychart.circlePackingModule.model.Item,
 *   positionMultiplier: number
 * }}
 */
anychart.circlePackingModule.model.CircleAvailability;


/**
 * Items comparison function.
 * 
 * @param {anychart.circlePackingModule.model.Item} item1 - .
 * @param {anychart.circlePackingModule.model.Item} item2 - .
 * @return {number} - Comparison value.
 * @private
 */
anychart.circlePackingModule.model.itemComparator_ = function(item1, item2) {
  if (item1 && item2) {
    var diff = item2.value - item1.value; // Can be NaN.
    if (diff > 0) {
      return 1;
    }
    // Never returns zero to avoid skipping an insertion of same value (@see goog.array.binaryInsert).
  }

  return -1;
};


/**
 * Processes the single data item of tree.
 * 
 * @param {anychart.circlePackingModule.model.DataItemDef} item - Data item to process.
 * @param {anychart.circlePackingModule.model.Item} parentModelItem - .
 * @return {anychart.circlePackingModule.model.Item|null} - Model item. Returns null if value is missing.
 * @private
 */
anychart.circlePackingModule.model.processItem_ = function(item, parentModelItem) {
  var value = Number(item.get('value'));
  var isCurrentValueMissing = (isNaN(value) || value < 0);

  /**
   * @type {anychart.circlePackingModule.model.Item}
   */
  var rv = {
    index: 0, // This value will be redefined in anychart.circlePackingModule.model.processChildren_.
    isRoot: false,
    isLeaf: false,
    weight: 0,
    name: String(item.get('name')),
    value: value,
    item: item,
    parent: parentModelItem,
    depth: parentModelItem.depth + 1
  };

  if (item.numChildren()) {
    var children = item.getChildrenUnsafe();

    // This will add children and calculated value to rv.
    anychart.circlePackingModule.model.processChildren_(children, rv);

    // This will override rv.value came from processChildren_().
    if (!isCurrentValueMissing) {
      rv.value = value;
    }
  } else {
    rv.isLeaf = true;
  }

  var isNotResultingMissing = 
    // Has correct leaf value.
    (rv.isLeaf && !isCurrentValueMissing) ||

    // Has correct parent value. This condition is kind of "Overcheck", but let it be.
    (!rv.isLeaf && rv.children && rv.children.length && !isNaN(Number(rv.value)));

  return isNotResultingMissing ? rv : null;
};


/**
 * Circles intersection check function.
 * 
 * @param {anychart.circlePackingModule.model.Item} c1 - .
 * @param {anychart.circlePackingModule.model.Item} c2 - .
 * @return {boolean} - Whether circles of model intersect. Works with weights, not pixels.
 */
anychart.circlePackingModule.model.intersects_ = function (c1, c2) {
  var diffX = Math.abs(c1.weightCx - c2.weightCx);
  var diffY = Math.abs(c1.weightCy - c2.weightCy);
  var sumRad = c1.weight + c2.weight;

  return (Math.sqrt(diffX * diffX + diffY * diffY) - Math.abs(sumRad)) < -1e-6;
};


/**
 * Packs circles in special algorithm, works with weight values, not pixels.
 * Full description is at DVF-4560 developer's comments - "Math bases", paragraph 1-...
 * 
 * @param {Array.<anychart.circlePackingModule.model.Item>|undefined} model - Incoming item to place.
 *  Puts circles in single-dimensional manner, full description is at DVF-4560
 *  developer's comments - "Code bases", paragraph 2.k.i.
 * @return {anychart.circlePackingModule.model.WeightDistances} - Weight distances.
 */
anychart.circlePackingModule.model.placeWeightModel_ = function(model) {
  /**
   * @type {anychart.circlePackingModule.model.WeightDistances}
   */
  var weightDistances = {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    radius: 0
  };

  if (model && model.length) {
    var i;
    var item;
    var c0 = model[0]; // c0 is not undefined here!
    c0.weightCx = 0;
    c0.weightCy = 0;

    // NOTE: These values are on-screen values.
    weightDistances.left = /** @type {number} */ (-c0.weight);
    weightDistances.right = /** @type {number} */ (c0.weight);
    weightDistances.top = /** @type {number} */ (-c0.weight); // Upper on screen.
    weightDistances.bottom = /** @type {number} */ (c0.weight); // Lower on screen.
    weightDistances.radius = /** @type {number} */ (c0.weight);

    var c1 = model[1];
    if (c1) {
      // This circle is always the right side of c0.
      c1.weightCx = c0.weightCx + c0.weight + c1.weight;
      c1.weightCy = c0.weightCy;

      // c1.weight is always <= c0.weight, that's why remaining fields are no modified.
      weightDistances.right = c1.weightCx + c1.weight;
      weightDistances.radius = weightDistances.right; // Radius is max value here.
    }

    /**
     * @type {Array.<anychart.circlePackingModule.model.CircleAvailability>}
     */
    var AVAILABLE_CIRCLES = [
      {
        circle1: c0,
        circle2: c1, // Yes, this can be undefined, but it will not be used in while-cycle.
        positionMultiplier: 1
      }
    ];

    var currItem = 2;
    item = model[currItem];

    // Full description is at DVF-4560 developer's comments - "Math bases", paragraph 2.
    while (item) {
      var availableCircles = AVAILABLE_CIRCLES[0];
      var circle1 = availableCircles.circle1;
      var circle2 = availableCircles.circle2;
      var positionMultiplier = availableCircles.positionMultiplier;
      var radius = item.weight;

      var AB = circle1.weight + circle2.weight;
      var AC = radius + circle1.weight;
      var BC = radius + circle2.weight;

      var cosAlpha = (AC * AC + AB * AB - BC * BC) / (2 * AC * AB);
      cosAlpha = goog.math.clamp(cosAlpha, -1, 1);
      var alpha = Math.acos(cosAlpha);

      var cosDeltaAlpha = (circle2.weightCx - circle1.weightCx) / AB;
      cosDeltaAlpha = goog.math.clamp(cosDeltaAlpha, -1, 1);
      var deltaAlpha = Math.acos(cosDeltaAlpha);

      var sin = (circle2.weightCy - circle1.weightCy) / (circle1.weight + circle2.weight);

      var multX = sin >= 0 ? 1 : -1;

      var sumAlpha = (alpha + positionMultiplier * multX * deltaAlpha);

      item.weightCx = circle1.weightCx + AC * Math.cos(sumAlpha);
      item.weightCy = circle1.weightCy + positionMultiplier * AC * Math.sin(sumAlpha);

      var hasIntersection = false;
      for (i = 0; i < model.length; i++) {
        var c = model[i];
        if (c !== item && anychart.circlePackingModule.model.intersects_(c, item)) {
          hasIntersection = true;
          break;
        }
      }

      if (hasIntersection) {
        if (positionMultiplier === 1) {
          availableCircles.positionMultiplier = -1;
        } else {
          /*
            This is actually a drop in priority.
            Full description is at DVF-4560 developer's comments - "Tetris bases", paragraph 3.d.ii.
           */
          availableCircles.positionMultiplier = 1;
          var el = AVAILABLE_CIRCLES.shift();
          AVAILABLE_CIRCLES.push(el);
        }
      } else {
        // No intersection: new circle can be added.
        var availableCircle1 = {
          circle1: circle1,
          circle2: item,
          positionMultiplier: 1
        };

        var availableCircle2 = {
          circle1: item,
          circle2: circle2,
          positionMultiplier: 1
        };

        // Full description is at DVF-4560 developer's comments - "Code bases", paragraph 2.l.
        weightDistances.top = Math.min(weightDistances.top, item.weightCy - item.weight);
        weightDistances.bottom = Math.max(weightDistances.bottom, item.weightCy + item.weight);
        weightDistances.left = Math.min(weightDistances.left, item.weightCx - item.weight);
        weightDistances.right = Math.max(weightDistances.right, item.weightCx + item.weight);
        weightDistances.radius = Math.max(
          weightDistances.radius,
          Math.sqrt(item.weightCx * item.weightCx + item.weightCy * item.weightCy) + item.weight
        );

        AVAILABLE_CIRCLES.push(availableCircle1, availableCircle2);

        currItem += 1;
      }

      item = model[currItem];
    }

    for (i = 0; i < model.length; i++) {
      item = model[i];
      item.weightDistances = anychart.circlePackingModule.model.placeWeightModel_(item.children);
    }
  }

  return weightDistances;
};


/**
 * Processes children of the single data item of tree.
 * 
 * @param {Array.<anychart.circlePackingModule.model.DataItemDef>} items - Data items to process.
 *  Must be got as children.
 * @param {anychart.circlePackingModule.model.Item} parentModelItem - .
 * @return {Array.<anychart.circlePackingModule.model.Item>} - Child items model.
 * @private
 */
anychart.circlePackingModule.model.processChildren_ = function(items, parentModelItem) {
  /**
   * @type {Array.<anychart.circlePackingModule.model.Item>}
   */
  var modelChildren = [];

  var valuesSum = NaN;
  var radiusesSum = NaN;
  var i;
  var modelItem;

  for (i = 0; i < items.length; i++) {
    var item = items[i];
    modelItem = anychart.circlePackingModule.model.processItem_(item, parentModelItem);

    if (modelItem) { // Is not missing.
      goog.array.binaryInsert(
        modelChildren,
        modelItem,
        anychart.circlePackingModule.model.itemComparator_
      );
  
      valuesSum = isNaN(valuesSum) ? 0 : valuesSum;
      radiusesSum = isNaN(radiusesSum) ? 0 : radiusesSum;
      valuesSum += modelItem.value;
      radiusesSum += Math.sqrt(modelItem.value / Math.PI);
    }
  }

  for (i = 0; i < modelChildren.length; i++) {
    modelItem = modelChildren[i];
    modelItem.weight = modelChildren.length === 1 ? 0.9 : Math.sqrt(modelItem.value / Math.PI) / radiusesSum;
    modelItem.index = i;
  }

  parentModelItem.value = valuesSum;
  parentModelItem.children = modelChildren;

  return modelChildren;
};


/**
 * Calculates and builds drawing model of incoming data tree.
 * 
 * @param {(anychart.treeDataModule.Tree|anychart.treeDataModule.View)=} opt_data - Chart's data
 *  tree. Can be null or undefined if no data is provided for the chart.
 * 
 * @return {anychart.circlePackingModule.model.Item} - TODO Desctibe root.
 */
anychart.circlePackingModule.model.create = function(opt_data) {
  /**
   * @type {anychart.circlePackingModule.model.Item}
   */
  var root = {
    index: 0,
    isLeaf: false,
    isRoot: true,
    parent: null,
    depth: -1 // Pretty dummy record since this root as actually a fake model item.
  };

  anychart.circlePackingModule.model.processChildren_(opt_data.getChildrenUnsafe(), root);

  root.weightDistances = anychart.circlePackingModule.model.placeWeightModel_(root.children);

  return root;
};


/**
 * Turns incoming bounds to the squared ones.
 * 
 * @param {anychart.math.Rect} bounds - Bounds to be sqarified.
 * @returns {anychart.math.Rect} - Squarified bounds.
 */
anychart.circlePackingModule.model.squarifyBounds_ = function(bounds) {
  if (bounds.width !== bounds.height) {
    var cx = bounds.left + bounds.width / 2;
    var cy = bounds.top + bounds.height / 2;
    var minSide = Math.min(bounds.width, bounds.height);

    var normalizedBounds = bounds.clone();

    normalizedBounds.width = minSide;
    normalizedBounds.height = minSide;
    normalizedBounds.left = cx - minSide / 2;
    normalizedBounds.top = cy - minSide / 2;

    return normalizedBounds;
  }

  return bounds;
};


/**
 * Adds real pixel positioning in current model to place circles on the screen.
 * 
 * @param {Array.<anychart.circlePackingModule.model.Item>|undefined} children - Model items to get the pixel positioning.
 * @param {anychart.circlePackingModule.model.Item} parent - Parent circle.
 * @param {anychart.math.Rect} bounds - Pixel bounds to be put in.
 */
anychart.circlePackingModule.model.applyBoundsForChildren_ = function(children, parent, bounds) {
  if (children && children.length) {
    var isParentRoot = parent && parent.isRoot;

    bounds = anychart.circlePackingModule.model.squarifyBounds_(bounds);
    parent.bounds = bounds;

    var weightDistances = parent.weightDistances;

    var weightDistancesWidth = weightDistances.right + Math.abs(weightDistances.left);
    var weightDistancesHeight = weightDistances.bottom + Math.abs(weightDistances.top);

    var delta = Math.abs(weightDistancesWidth - weightDistancesHeight) / 2;
    if (weightDistancesWidth > weightDistancesHeight) {
      weightDistances.top -= delta;
      weightDistances.bottom += delta;
    } else {
      weightDistances.left -= delta;
      weightDistances.right += delta;
    }

    var maxWeightDistance = Math.max(weightDistancesWidth, weightDistancesHeight);

    // Full description is at DVF-4560 developer's comments - "Code bases", paragraph 6.d.
    var r = isParentRoot ? 0 : Math.min(weightDistances.radius, maxWeightDistance / 2);

    // Full description is at DVF-4560 developer's comments - "Code bases", paragraph 6.e.
    var reduction = Math.min(
      weightDistancesWidth / maxWeightDistance,
      weightDistancesHeight / maxWeightDistance
    );

    // Full description is at DVF-4560 developer's comments - "Code bases", paragraph 6.f, 6.h.
    var b = reduction * r * (2 - Math.sqrt(2)) / 2;

    maxWeightDistance = maxWeightDistance + 2 * b;
    weightDistances.top -= b;
    weightDistances.bottom += b;
    weightDistances.left -= b;
    weightDistances.right += b;

    // bounds.width === bounds.height here.
    var ratio = bounds.width / maxWeightDistance;

    for (var i = 0; i < children.length; i++) {
      var child = children[i];

      child.cx = bounds.left + (child.weightCx + Math.abs(weightDistances.left)) * (bounds.width / maxWeightDistance);
      child.cy = bounds.top + (child.weightCy + Math.abs(weightDistances.top)) * (bounds.height / maxWeightDistance);
      child.radius = child.weight * ratio;
    
      var childBounds = new anychart.math.Rect(
        child.cx - child.radius,
        child.cy - child.radius,
        child.radius * 2,
        child.radius * 2
      );

      child.bounds = childBounds;    
      anychart.circlePackingModule.model.applyBoundsForChildren_(child.children, child, childBounds);
    }
  }
};


/**
 * Function to be used externally. Basicly must take a model as single virtual root model item.
 * 
 * @param {anychart.circlePackingModule.model.Item} model - Drawing model item.
 *  NOTE: For developer's call, it always must be the root.
 * @param {anychart.math.Rect} bounds - Screen bounds.
 */
anychart.circlePackingModule.model.applyBounds = function(model, bounds) {
  //TODO add padding.
  anychart.circlePackingModule.model.applyBoundsForChildren_(model.children, model, bounds);
};