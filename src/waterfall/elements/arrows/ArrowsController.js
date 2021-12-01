goog.provide('anychart.waterfallModule.ArrowsController');

goog.require('anychart.core.VisualBase');
goog.require('anychart.math.Point2D');
goog.require('anychart.math.Rect');
goog.require('anychart.reflow.IMeasurementsTargetProvider');
goog.require('anychart.waterfallModule.Arrow');



/**
 * Arrow controller. Handles arrows positioning.
 *
 * @constructor
 * @extends {anychart.core.VisualBase}
 * @implements {anychart.reflow.IMeasurementsTargetProvider}
 * @param {anychart.waterfallModule.Chart} chart
 */
anychart.waterfallModule.ArrowsController = function(chart) {
  anychart.waterfallModule.ArrowsController.base(this, 'constructor');

  this.chart_ = chart;

  this.arrows_ = [];

  this.arrowsLayer_ = null;

  /**
   * Each element of the array is the index of xScale value. It contains array
   * of arrows with from or to values equal to the xScale at its index.
   * This array is used to position from/to points so, that they do not overlap.
   *
   * @type {Array.<Array.<anychart.waterfallModule.Arrow>>}
   * @private
   */
  this.xScaleIndexToArrows_ = [];

  anychart.measuriator.register(this);
};
goog.inherits(anychart.waterfallModule.ArrowsController, anychart.core.VisualBase);


/**
 * Arrows controller supported signals.
 *
 * @type {number}
 */
anychart.waterfallModule.ArrowsController.prototype.SUPPORTED_SIGNALS =
    anychart.core.VisualBase.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.NEEDS_REDRAW |
    anychart.Signal.MEASURE_COLLECT | //Signal for Measuriator to collect labels to measure.
    anychart.Signal.MEASURE_BOUNDS; //Signal for Measuriator to measure the bounds of collected labels.


/**
 * Name of consistency storage.
 * @type {string}
 */
anychart.waterfallModule.ArrowsController.CONSISTENCY_STORAGE_NAME = 'arrowsController';

/**
 * States supported by arrow.
 *
 * @enum {string}
 */
anychart.waterfallModule.ArrowsController.SUPPORTED_STATES = {
  RECALCULATION: 'recalculation',
  APPEARANCE: 'appearance'
};


anychart.consistency.supportStates(
    anychart.waterfallModule.ArrowsController,
    anychart.waterfallModule.ArrowsController.CONSISTENCY_STORAGE_NAME,
    [
      anychart.waterfallModule.ArrowsController.SUPPORTED_STATES.RECALCULATION,
      anychart.waterfallModule.ArrowsController.SUPPORTED_STATES.APPEARANCE
    ]
);


/**
 * Arrows element z-index value.
 *
 * @type {number}
 */
anychart.waterfallModule.ArrowsController.ARROWS_ZINDEX = 41;


/**
 * Arrows labels z-index value.
 *
 * @type {number}
 */
anychart.waterfallModule.ArrowsController.ARROWS_LABELS_ZINDEX = 42;


/**
 * If chart is in vertical mode.
 *
 * @return {boolean}
 */
anychart.waterfallModule.ArrowsController.prototype.isVertical = function() {
  return /** @type {boolean} */(this.chart_.isVertical());
};


/**
 * Inversion is checked against screen coordinates axes. Scale is not inverted
 * if it is aligned with screen coordinates axes:
 *  1) X axis going from left-top rightwards
 *  2) Y axis going from left-top downwards
 * So this scale inversion is not same as simple scale.inverted() and even goes
 * against it.
 *
 * @return {boolean}
 */
anychart.waterfallModule.ArrowsController.prototype.yScaleInverted = function() {
  return this.isVertical() === this.chart_.yScale().inverted();
};


/**
 * X scale inversion is checked against screen coordinates axes.
 * Notice that the condition is slightly different from yScaleInverted
 * method, though principle remains the same.
 *
 * @return {boolean}
 */
anychart.waterfallModule.ArrowsController.prototype.xScaleInverted = function() {
  return this.isVertical() !== this.chart_.xScale().inverted();
};


/**
 * Returns index of the given value on X scale.
 *
 * @param {string} value - From/to arrow value.
 * @return {number}
 */
anychart.waterfallModule.ArrowsController.prototype.getIndexFromValue = function(value) {
  return this.chart_.xScale().getIndexByValue(value);
};


/**
 * Returns arrow 'from' value.
 *
 * @param {anychart.waterfallModule.Arrow} arrow - Arrow instance.
 * @return {string}
 */
anychart.waterfallModule.ArrowsController.prototype.getArrowFrom = function(arrow) {
  return /** @type {string} */(arrow.getOption('from'));
};


/**
 * Returns arrow 'to' value.
 *
 * @param {anychart.waterfallModule.Arrow} arrow - Arrow instance.
 * @return {string}
 */
anychart.waterfallModule.ArrowsController.prototype.getArrowTo = function(arrow) {
  return /** @type {string} */(arrow.getOption('to'));
};


/**
 * Checks if arrow is growing in the direction of Y values increase.
 * It does so, if 'from' point stack has positive diff value.
 *
 * @param {anychart.waterfallModule.Arrow} arrow - Arrow instance.
 * @return {boolean}
 */
anychart.waterfallModule.ArrowsController.prototype.arrowGrowsUp = function(arrow) {
  var fromValue = this.getArrowFrom(arrow);
  var fromIndex = this.getIndexFromValue(fromValue);

  return this.chart_.getStackSum(fromIndex, 'diff') >= 0;
};


/**
 * If arrow is drawn from left to right.
 * I.e. 'from' point index is less than 'to' point index.
 *
 * @param {anychart.waterfallModule.Arrow} arrow - Arrow instance.
 * @return {boolean} - Whether arrow is drawn left to right.
 */
anychart.waterfallModule.ArrowsController.prototype.arrowGoesLeftToRight = function(arrow) {
  var fromValue = this.getArrowFrom(arrow);
  var toValue = this.getArrowTo(arrow);

  var fromIndex = this.getIndexFromValue(fromValue);
  var toIndex = this.getIndexFromValue(toValue);

  return toIndex > fromIndex;
};


/**
 * Group arrows by their from/to values, for in/out points positioning.
 *
 * @param {anychart.waterfallModule.Arrow} arrow - Arrow instance.
 */
anychart.waterfallModule.ArrowsController.prototype.groupArrowsByFromTo = function(arrow) {
  var fromValue = this.getArrowFrom(arrow);
  var toValue = this.getArrowTo(arrow);

  var fromIndex = this.getIndexFromValue(fromValue);
  var toIndex = this.getIndexFromValue(toValue);

  this.xScaleIndexToArrows_[fromIndex] = this.xScaleIndexToArrows_[fromIndex] || [];
  this.xScaleIndexToArrows_[toIndex] = this.xScaleIndexToArrows_[toIndex] || [];

  var isRightDirection = this.arrowGoesLeftToRight(arrow);

  if (isRightDirection) {
    this.xScaleIndexToArrows_[fromIndex].push(arrow);
    this.xScaleIndexToArrows_[toIndex].unshift(arrow);
  } else {
    this.xScaleIndexToArrows_[fromIndex].unshift(arrow);
    this.xScaleIndexToArrows_[toIndex].push(arrow);
  }
};


/**
 * Returns arrows draw settings.
 *
 * @param {anychart.waterfallModule.Arrow} arrow - Arrow instance.
 */
anychart.waterfallModule.ArrowsController.prototype.createArrowDrawSettings = function(arrow) {
  var fromValue = this.getArrowFrom(arrow);
  var toValue = this.getArrowTo(arrow);

  var fromIndex = this.getIndexFromValue(fromValue);
  var toIndex = this.getIndexFromValue(toValue);

  var stackBounds = this.getStacksBounds();

  var fromStackBounds = stackBounds[fromIndex];
  var toStackBounds = stackBounds[toIndex];

  var drawSettings;

  // Minimal gap from start/end point to the horizontal line.
  var minimalGap = 15;
  var isUp = this.chart_.getStackSum(fromIndex, 'diff') >= 0;
  var normalUpDirection = this.yScaleInverted();

  var fromPoint = new anychart.math.Point2D(
      fromStackBounds.getLeft() + fromStackBounds.getWidth() / 2,
      isUp === normalUpDirection ? fromStackBounds.getTop() : fromStackBounds.getBottom()
      );

  var toPoint = new anychart.math.Point2D(
      toStackBounds.getLeft() + toStackBounds.getWidth() / 2,
      isUp === normalUpDirection ? toStackBounds.getTop() : toStackBounds.getBottom()
      );

  var baseHorizontalY = isUp && this.yScaleInverted() ?
      (Math.min(fromPoint.y, toPoint.y) - minimalGap) :
      (Math.max(fromPoint.y, toPoint.y) + minimalGap);

  drawSettings = {
    fromPoint: fromPoint,
    toPoint: toPoint,
    horizontalY: baseHorizontalY,
    isUp: isUp
  };

  arrow.drawSettings(drawSettings);
};


/**
 * Extend bounds by arrow label bounds.
 * @param {anychart.waterfallModule.Arrow} arrow - Arrow instance.
 * @param {anychart.math.Rect} bounds - Bounds to extend.
 */
anychart.waterfallModule.ArrowsController.prototype.modifyByLabelBounds = function(arrow, bounds) {
  var text = arrow.getText();
  var textBounds = text.getBounds();
  var textWidth = textBounds.width;
  var textHeight = textBounds.height;

  var value = this.isVertical() ? textWidth : textHeight;

  bounds.top -= value;
  bounds.height += value;
};


/**
 * Returns arrow bounds to be used while arrow positioning.
 * Bounds cover horizontal line and label.
 *
 * @param {anychart.waterfallModule.Arrow.DrawSettings} arrowDrawSettings - Arrow draw settings.
 * @param {anychart.waterfallModule.Arrow} arrow - Arrow instance.
 * @return {anychart.math.Rect}
 */
anychart.waterfallModule.ArrowsController.prototype.createArrowBounds = function(arrowDrawSettings, arrow) {
  var stroke = /** @type {acgraph.vector.Stroke|string} */(arrow.connector().getOption('stroke'));

  var strokeThickness = anychart.utils.extractThickness(stroke);

  // Gap around the path.
  var gap = 2;

  // Half of the resulting rect height.
  var halfSize = (strokeThickness / 2) + gap;

  var isRightDirection = arrowDrawSettings.toPoint.x > arrowDrawSettings.fromPoint.x;

  var startX = isRightDirection ? arrowDrawSettings.fromPoint.x : arrowDrawSettings.toPoint.x;

  var width = isRightDirection ?
      arrowDrawSettings.toPoint.x - arrowDrawSettings.fromPoint.x :
      arrowDrawSettings.fromPoint.x - arrowDrawSettings.toPoint.x;

  var arrowBounds = new anychart.math.Rect(
      startX,
      arrowDrawSettings.horizontalY - halfSize,
      width,
      halfSize * 2
      );

  this.modifyByLabelBounds(arrow, arrowBounds);

  return arrowBounds;
};


/**
 * Fixes labels bounds in vertical mode.
 *
 * @param {anychart.math.Rect} bounds - Labels bounds.
 * @return {anychart.math.Rect}
 */
anychart.waterfallModule.ArrowsController.prototype.fixLabelsBounds = function(bounds) {
  if (this.isVertical()) {
    // In vertical mode bounds need to be rotated.
    return new anychart.math.Rect(
        bounds.getTop(),
        bounds.getLeft(),
        bounds.getHeight(),
        bounds.getWidth()
    );
  } else {
    return bounds;
  }
};


/**
 * Returns labels factory label bounds.
 *
 * @param {anychart.core.ui.LabelsFactory.Label} label - Labels factory label to be measured.
 * @return {anychart.math.Rect}
 */
anychart.waterfallModule.ArrowsController.prototype.getLabelBounds = function(label) {
  return label.getTextElement().getBounds();
};


/**
 * Return series and stack labels bounds.
 *
 * @param {number} index - X scale point index.
 * @return {Array.<anychart.math.Rect>}
 */
anychart.waterfallModule.ArrowsController.prototype.getAllStackLabelsBounds = function(index) {
  var labels = this.chart_.getStackLabels(index);

  labels = goog.array.filter(labels, function(label) {
    // Outside labels breaks arrow positioning.
    return !label.positionProvider()['connectorPoint'];
  });

  return goog.array.map(labels, function(label) {
    return this.fixLabelsBounds(this.getLabelBounds(label));
  }, this);
};


/**
 * Return stack bounds, expanded by all of its labels bounds.
 *
 * @param {number} index - Stack index.
 * @return {anychart.math.Rect}
 */
anychart.waterfallModule.ArrowsController.prototype.getStackFullBounds = function(index) {
  var chart = this.chart_;
  var stackBounds = chart.getStackBounds(index);

  // Fix negative height, as it breaks some Rect api, i.e. intersects().
  if (stackBounds.getHeight() < 0) {
    stackBounds = new anychart.math.Rect(
        stackBounds.getLeft(),
        stackBounds.getTop() + stackBounds.getHeight(),
        stackBounds.getWidth(),
        -stackBounds.getHeight()
        );
  }
  var seriesLabelsBounds = this.getAllStackLabelsBounds(index);

  goog.array.forEach(seriesLabelsBounds, function(labelBounds) {
    stackBounds.boundingRect(labelBounds);
  });

  return stackBounds;
};


/**
 * Updates stacks bounds to use them for arrow positioning.
 */
anychart.waterfallModule.ArrowsController.prototype.updateStacksBounds = function() {
  this.stacksBounds_ = [];
  for (var i = 0; i < this.chart_.getStacksCount(); i++) {
    this.stacksBounds_.push(this.getStackFullBounds(i));
  }
};


/**
 * Returns not simple stack bounds, but bounds enlarged to
 * include series labels.
 *
 * @return {Array.<anychart.math.Rect>}
 */
anychart.waterfallModule.ArrowsController.prototype.getStacksBounds = function() {
  if (!goog.isDef(this.stacksBounds_)) {
    this.updateStacksBounds();
  }
  return this.stacksBounds_;
};


/**
 * Returns number of pixels, on which free bounds should be moved to avoid
 * intersection with the fixedBounds.
 *
 * @param {anychart.math.Rect} fixedBounds - Non-moving bounds.
 * @param {anychart.math.Rect} freeBounds - Bounds which can be moved.
 * @param {boolean} isMovingUp - If free bounds are moving up.
 * @return {number}
 */
anychart.waterfallModule.ArrowsController.prototype.getIntersectionDelta = function(fixedBounds, freeBounds, isMovingUp) {
  if (fixedBounds.intersects(freeBounds)) {
    if (isMovingUp === this.yScaleInverted()) {
      return fixedBounds.getTop() - freeBounds.getBottom();
    } else {
      return fixedBounds.getBottom() - freeBounds.getTop();
    }
  }

  return 0;
};


/**
 * Checks if arrow has correct from/to values.
 * They resolve to correct index values on xScale and are not same.
 *
 * @param {anychart.waterfallModule.Arrow} arrow - Arrow instance.
 * @return {boolean}
 */
anychart.waterfallModule.ArrowsController.prototype.arrowCorrectFromTo = function(arrow) {
  var fromValue = this.getArrowFrom(arrow);
  var toValue = this.getArrowTo(arrow);

  var fromStackIndex = this.getIndexFromValue(fromValue);
  var toStackIndex = this.getIndexFromValue(toValue);

  var fromToNotEqual = fromValue !== toValue;

  return !isNaN(fromStackIndex) && !isNaN(toStackIndex) && fromToNotEqual;
};


/**
 * Returns true if arrow with same from & to values found in the array.
 *
 * @param {Array.<anychart.waterfallModule.Arrow>} array - Arrows array.
 * @param {anychart.waterfallModule.Arrow} arrow - Arrow instance.
 * @return {boolean} - Whether arrow has unique from/to combination.
 */
anychart.waterfallModule.ArrowsController.prototype.isArrowUnique = function(array, arrow) {
  var duplicate = goog.array.find(array, function(item) {
    return this.getArrowFrom(arrow) === this.getArrowFrom(item) &&
        this.getArrowTo(arrow) === this.getArrowTo(item);
  }, this);

  return goog.isNull(duplicate);
};


/**
 * Checks if arrows are correct and marks them if they are not.
 * Incorrect arrows are:
 *  1) referencing non-existent/missing xScale values
 *  2) duplicates, with from & to values similar to already existing arrow
 *  3) with same from & to values
 */
anychart.waterfallModule.ArrowsController.prototype.checkArrowsCorrectness = function() {
  var previousArrows = [];

  goog.array.forEach(this.arrows_, function(arrow) {
    var correctFromTo = this.arrowCorrectFromTo(arrow);
    var isUnique = this.isArrowUnique(previousArrows, arrow);

    var isArrowCorrect = correctFromTo && isUnique;

    arrow.isCorrect(isArrowCorrect);

    previousArrows.push(arrow);
  }, this);
};


/**
 * Pushe arrow until it does not intersect with any of the fixedBounds.
 * Modifies arrow draw settings.
 *
 * @param {anychart.waterfallModule.Arrow} arrow - Arrow instance.
 * @param {Array.<anychart.math.Rect>} fixedBounds - Bounds to check intersection against.
 */
anychart.waterfallModule.ArrowsController.prototype.moveArrow = function(arrow, fixedBounds) {
  var isUp = this.arrowGrowsUp(arrow);
  var isNormalUpDirection = this.yScaleInverted();

  var arrowDrawSettings = arrow.drawSettings();

  var newDrawSettings = {
    fromPoint: arrowDrawSettings.fromPoint,
    toPoint: arrowDrawSettings.toPoint,
    horizontalY: arrowDrawSettings.horizontalY,
    isUp: arrowDrawSettings.isUp
  };

  var arrowBounds = this.createArrowBounds(newDrawSettings, arrow);

  // Ensure we always go from the lowest lying to highest lying stack bounds.
  goog.array.sort(fixedBounds, function(prev, next) {
    return isUp === isNormalUpDirection ?
        next.getBottom() - prev.getBottom() :
        prev.getTop() - next.getTop();
  });

  goog.array.forEach(fixedBounds, function(fixedBoundsItem) {
    var delta = this.getIntersectionDelta(fixedBoundsItem, arrowBounds, isUp);
    if (delta) {
      newDrawSettings.horizontalY += delta;

      arrowBounds = this.createArrowBounds(newDrawSettings, arrow);
    }
  }, this);

  arrow.drawSettings(newDrawSettings);
};


/**
 * Checks arrow for intersection with stacks and other arrows.
 *
 * @param {anychart.waterfallModule.Arrow} arrow - Arrow to position.
 * @param {Array.<anychart.waterfallModule.Arrow>} positionedArrows - Already positioned arrows.
 */
anychart.waterfallModule.ArrowsController.prototype.positionArrow = function(arrow, positionedArrows) {
  // First we need to collect all fixed bounds, against which we will be checking intersection.
  var stackBounds = goog.array.clone(this.getStacksBounds());
  var arrowsBounds = goog.array.map(positionedArrows, function(a) {
    return this.createArrowBounds(a.drawSettings(), a);
  }, this);
  var allFixedBounds = goog.array.concat(arrowsBounds, stackBounds);

  // Check arrow intersection and move it away.
  this.moveArrow(arrow, allFixedBounds);
};


/**
 * If arrow is going right out of stack with given index.
 *
 * @param {anychart.waterfallModule.Arrow} arrow - Arrow instance.
 * @param {number} stackIndex - Index of the xScale item, against which we check rightness.
 * @return {boolean}
 */
anychart.waterfallModule.ArrowsController.prototype.isArrowGoingRightFromStack = function(arrow, stackIndex) {
  var fromValue = this.getArrowFrom(arrow);
  var toValue = this.getArrowTo(arrow);

  var fromIndex = this.getIndexFromValue(fromValue);
  var toIndex = this.getIndexFromValue(toValue);

  return Math.min(fromIndex, toIndex, stackIndex) === stackIndex;
};


/**
 * Returns sort function used for from/to points positioning.
 *
 * @param {number} xScaleIndex - Index of the stack on X scale.
 * @return {function(anychart.waterfallModule.Arrow, anychart.waterfallModule.Arrow): number}
 */
anychart.waterfallModule.ArrowsController.prototype.getArrowsSortFunction = function(xScaleIndex) {
  var sortFn = function arrowsSortFunction(prev, next) {
    var isPrevRight = this.isArrowGoingRightFromStack(prev, xScaleIndex);
    var isNextRight = this.isArrowGoingRightFromStack(next, xScaleIndex);
    var isArrowUp = this.arrowGrowsUp(prev);

    if (isPrevRight !== isNextRight) {
      return isPrevRight === this.xScaleInverted() ? -1 : 1;
    } else {
      return isArrowUp === this.yScaleInverted() ?
          prev.drawSettings().horizontalY - next.drawSettings().horizontalY :
          next.drawSettings().horizontalY - prev.drawSettings().horizontalY;
    }
  };

  return goog.bind(sortFn, this);
};


/**
 * Positions from/to points of the arrows so, that they do not intersect.
 *
 * @param {Array.<anychart.waterfallModule.Arrow>} arrows - Array of arrows.
 * @param {number} xScaleIndex - Index of the xScale point where arrows intersect.
 */
anychart.waterfallModule.ArrowsController.prototype.modifyArrowsFromToPoint = function(arrows, xScaleIndex) {
  var stackBounds = this.chart_.getStackBounds(xScaleIndex);
  var width = stackBounds.getWidth();
  var step = width / (arrows.length + 1);

  goog.array.sort(arrows, this.getArrowsSortFunction(xScaleIndex));

  goog.array.forEach(arrows, function(arrow, index) {
    var fromValue = this.getArrowFrom(arrow);
    var fromIndex = this.getIndexFromValue(fromValue);

    var xValue = stackBounds.getLeft() + ((index + 1) * step);
    if (fromIndex === xScaleIndex) {
      arrow.drawSettings().fromPoint.x = xValue;
    } else {
      arrow.drawSettings().toPoint.x = xValue;
    }
  }, this);
};


/**
 * Positions from/to points of arrows so, that they do not overlap.
 */
anychart.waterfallModule.ArrowsController.prototype.positionFromToPoints = function() {
  goog.array.forEach(this.xScaleIndexToArrows_, function(arrows, index) {
    if (arrows && arrows.length > 1) {
      var upArrows = goog.array.filter(arrows, function(arrow) {
        return this.arrowGrowsUp(arrow);
      }, this);

      var downArrows = goog.array.filter(arrows, function(arrow) {
        return !this.arrowGrowsUp(arrow);
      }, this);

      this.modifyArrowsFromToPoint(upArrows, index);
      this.modifyArrowsFromToPoint(downArrows, index);
    }
  }, this);
};


/**
 * Calculates arrows positions.
 */
anychart.waterfallModule.ArrowsController.prototype.calculateArrowsPositions = function() {
  this.updateStacksBounds();

  this.xScaleIndexToArrows_.length = 0;
  var positionedArrows = [];

  goog.array.forEach(this.arrows_, function(arrow) {
    if (arrow.enabled() && arrow.isCorrect()) {
      this.createArrowDrawSettings(arrow);

      this.positionArrow(arrow, positionedArrows);

      this.groupArrowsByFromTo(arrow);

      positionedArrows.push(arrow);
    }
  }, this);

  this.positionFromToPoints();
};


/**
 * Resolve anchor value for arrow.
 * @param {anychart.waterfallModule.Arrow} arrow - Arrow instance.
 * @return {anychart.enums.Anchor}
 */
anychart.waterfallModule.ArrowsController.prototype.resolveAnchor = function(arrow) {
  var anchor = /** @type {anychart.enums.Anchor} */(arrow.label().getOption('anchor'));

  var isVertical = this.isVertical();
  if (anchor === 'auto') {
    if (isVertical) {
      return anychart.enums.Anchor.RIGHT_CENTER;
    }
    return anychart.enums.Anchor.CENTER_TOP;
  }

  return anchor;
};


/**
 * Resolve position value for arrow.
 * @param {anychart.waterfallModule.Arrow} arrow - Arrow instance.
 * @return {anychart.enums.Position}
 */
anychart.waterfallModule.ArrowsController.prototype.resolvePosition = function(arrow) {
  var position = /** @type {anychart.enums.Position} */(arrow.label().getOption('position'));

  var isVertical = this.isVertical();
  if (position === 'auto') {
    if (isVertical) {
      return anychart.enums.Position.LEFT_CENTER;
    }
    return anychart.enums.Position.CENTER;
  }

  return position;
};



/**
 * Applies labels style.
 */
anychart.waterfallModule.ArrowsController.prototype.applyLabelsStyle = function() {
  goog.array.forEach(this.arrows_, function(arrow) {
    if (!arrow.isCorrect()) return;

    var label = arrow.label();

    label.resetFlatSettings();

    var flatSettings = label.flatten();

    flatSettings['anchor'] = this.resolveAnchor(arrow);
    flatSettings['position'] = this.resolvePosition(arrow);

    var text = arrow.getText();

    var fromValue = this.getArrowFrom(arrow);
    var toValue = this.getArrowTo(arrow);

    var fromStackIndex = this.getIndexFromValue(fromValue);
    var toStackIndex = this.getIndexFromValue(toValue);

    var formatProvider = this.chart_.getFormatProviderForArrow(toStackIndex, fromStackIndex);
    var textValue = arrow.label().getText(formatProvider);

    text.text(textValue);
    text.style(flatSettings);
    text.prepareComplexity();
    text.applySettings();
  }, this);
};


/**
 * Initializes layers for arrows.
 *
 * @private
 */
anychart.waterfallModule.ArrowsController.prototype.initLayers_ = function() {
  var labelsLayer = /** @type {!acgraph.vector.UnmanagedLayer} */(this.getLabelsLayer());
  var arrowsLayer = /** @type {!acgraph.vector.Layer} */(this.getArrowsLayer());
  var rootLayer = /** @type {!acgraph.vector.Layer} */(this.getRootLayer());

  this.container().addChild(rootLayer);

  rootLayer
      .addChild(arrowsLayer)
      .addChild(labelsLayer);

  rootLayer.clip(this.chart_.getPlotBounds());
};


/**
 * Prepare and draw arrows.
 */
anychart.waterfallModule.ArrowsController.prototype.draw = function() {
  if (!this.arrows_.length) {
    this.markStoreConsistent(anychart.waterfallModule.ArrowsController.CONSISTENCY_STORAGE_NAME);
    this.markConsistent(anychart.ConsistencyState.ALL);
    return;
  }

  this.initLayers_();

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    goog.array.forEach(this.arrows_, function(arrow) {
      arrow.suspendSignalsDispatching();
      arrow.invalidate(anychart.ConsistencyState.BOUNDS);
      arrow.resumeSignalsDispatching(false);
    }, this);

    this.invalidateMultiState(
        anychart.waterfallModule.ArrowsController.CONSISTENCY_STORAGE_NAME,
        [
          anychart.waterfallModule.ArrowsController.SUPPORTED_STATES.RECALCULATION,
          anychart.waterfallModule.ArrowsController.SUPPORTED_STATES.APPEARANCE
        ]
    );
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  if (this.hasStateInvalidation(anychart.waterfallModule.ArrowsController.CONSISTENCY_STORAGE_NAME, anychart.waterfallModule.ArrowsController.SUPPORTED_STATES.RECALCULATION)) {
    this.checkArrowsCorrectness();

    this.applyLabelsStyle();

    // We need arrows labels bounds, when calculating arrows positions.
    this.dispatchSignal(anychart.Signal.MEASURE_BOUNDS | anychart.Signal.MEASURE_COLLECT);
    anychart.measuriator.measure();

    this.calculateArrowsPositions();

    this.markStateConsistent(anychart.waterfallModule.ArrowsController.CONSISTENCY_STORAGE_NAME, anychart.waterfallModule.ArrowsController.SUPPORTED_STATES.RECALCULATION);
  }

  if (this.hasStateInvalidation(anychart.waterfallModule.ArrowsController.CONSISTENCY_STORAGE_NAME, anychart.waterfallModule.ArrowsController.SUPPORTED_STATES.APPEARANCE)) {
    var arrowsLayer = this.getArrowsLayer();

    goog.array.forEach(this.arrows_, function(arrow) {
      arrow.container(arrowsLayer);
      arrow.invalidateStorage();
      arrow.draw();
    }, this);
  }

  this.markStoreConsistent(anychart.waterfallModule.ArrowsController.CONSISTENCY_STORAGE_NAME);
};


//region --- Arrow manipulation API for chart.
/**
 *
 * @param {anychart.waterfallModule.Arrow} arrow - Arrow instance.
 * @return {boolean}
 */
anychart.waterfallModule.ArrowsController.prototype.removeArrow = function(arrow) {
  var indexToDelete = goog.array.indexOf(this.arrows_, arrow);

  if (indexToDelete >= 0) {
    return this.removeArrowAt(indexToDelete);
  }
  return false;
};


/**
 * Remove arrow at index.
 *
 * @param {number} index
 * @return {boolean}
 */
anychart.waterfallModule.ArrowsController.prototype.removeArrowAt = function(index) {
  var arrow = this.arrows_[index];

  if (goog.isDef(arrow)) {
    arrow.unlistenSignals(this.arrowInvalidationHandler_, this);

    goog.array.splice(this.arrows_, index, 1);
    goog.dispose(arrow);
    return true;
  }

  return false;
};


/**
 * Get arrow at index.
 *
 * @param {number} index - Arrow index.
 * @return {anychart.waterfallModule.Arrow}
 */
anychart.waterfallModule.ArrowsController.prototype.getArrow = function(index) {
  return this.arrows_[index] || null;
};


/**
 * Create arrow with given settings.
 *
 * @param {Object=} opt_settings
 * @return {anychart.waterfallModule.Arrow}
 */
anychart.waterfallModule.ArrowsController.prototype.addArrow = function(opt_settings) {
  var arrow = new anychart.waterfallModule.Arrow(this);
  if (goog.isDef(opt_settings)) {
    arrow.setup(opt_settings);
    arrow.listenSignals(this.arrowInvalidationHandler_, this);
  }

  this.arrows_.push(arrow);

  this.invalidateMultiState(
    anychart.waterfallModule.ArrowsController.CONSISTENCY_STORAGE_NAME,
      [
        anychart.waterfallModule.ArrowsController.SUPPORTED_STATES.APPEARANCE,
        anychart.waterfallModule.ArrowsController.SUPPORTED_STATES.RECALCULATION
      ],
      anychart.Signal.NEEDS_REDRAW
  );

  return arrow;
};


/**
 * Arrow invalidation handler.
 *
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.waterfallModule.ArrowsController.prototype.arrowInvalidationHandler_ = function(event) {
  var states = [anychart.waterfallModule.ArrowsController.SUPPORTED_STATES.APPEARANCE];
  if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION) || event.hasSignal(anychart.Signal.ENABLED_STATE_CHANGED)) {
    states.push(
        anychart.waterfallModule.ArrowsController.SUPPORTED_STATES.RECALCULATION
    );

    goog.array.forEach(this.arrows_, function(arrow) {
      arrow.suspendSignalsDispatching();
      arrow.invalidateStore(anychart.waterfallModule.ArrowsController.CONSISTENCY_STORAGE_NAME);
      arrow.resumeSignalsDispatching(false);
    }, this);
  }

  this.invalidateMultiState(anychart.waterfallModule.ArrowsController.CONSISTENCY_STORAGE_NAME, states, anychart.Signal.NEEDS_REDRAW);
};


/**
 * @return {Array.<anychart.waterfallModule.Arrow>}
 */
anychart.waterfallModule.ArrowsController.prototype.getAllArrows = function() {
  return goog.array.clone(this.arrows_);
};
//endregion


/**
 * Returns arrows root layer.
 *
 * @return {acgraph.vector.Layer}
 */
anychart.waterfallModule.ArrowsController.prototype.getRootLayer = function() {
  if (!this.rootLayer_) {
    this.rootLayer_ = acgraph.layer();
    this.rootLayer_.zIndex(anychart.waterfallModule.ArrowsController.ARROWS_ZINDEX);
  }

  return this.rootLayer_;
};


/**
 * Getter for labels layer.
 *
 * @return {acgraph.vector.UnmanagedLayer}
 */
anychart.waterfallModule.ArrowsController.prototype.getLabelsLayer = function() {
  if (!this.labelsLayer_) {
    this.labelsLayerEl_ = /** @type {Element} */(acgraph.getRenderer().createLayerElement());
    this.labelsLayer_ = acgraph.unmanagedLayer(this.labelsLayerEl_);
    this.labelsLayer_.zIndex(anychart.waterfallModule.ArrowsController.ARROWS_LABELS_ZINDEX);
  }

  return this.labelsLayer_;
};


/**
 * Getter for arrows layer.
 *
 * @return {acgraph.vector.Layer}
 */
anychart.waterfallModule.ArrowsController.prototype.getArrowsLayer = function() {
  if (!this.arrowsLayer_) {
    this.arrowsLayer_ = acgraph.layer();
    this.arrowsLayer_.zIndex(anychart.waterfallModule.ArrowsController.ARROWS_ZINDEX);
  }

  return this.arrowsLayer_;
};


/** @inheritDoc */
anychart.waterfallModule.ArrowsController.prototype.setupByJSON = function(config, opt_default) {
  anychart.waterfallModule.ArrowsController.base(this, 'setupByJSON', config, opt_default);

  goog.array.forEach(/** @type {Array} */(config), function(arrowSettings) {
    this.addArrow(arrowSettings);
  }, this);
};


/** @inheritDoc */
anychart.waterfallModule.ArrowsController.prototype.serialize = function() {
  var json = [];

  goog.array.forEach(this.arrows_, function(arrow) {
    json.push(arrow.serialize());
  }, this);

  return json;
};


/** @inheritDoc */
anychart.waterfallModule.ArrowsController.prototype.disposeInternal = function() {
  goog.disposeAll(
      this.arrows_,
      this.arrowsLayer_,
      this.labelsLayer_
  );
  anychart.waterfallModule.ArrowsController.base(this, 'disposeInternal');
};


//region --- IMeasurementsTargetProvider
/**
 * @return {Array.<anychart.core.ui.OptimizedText>}
 */
anychart.waterfallModule.ArrowsController.prototype.provideMeasurements = function() {
  var labels = goog.array.map(this.arrows_, function(arrow) {
    return arrow.getText();
  }, this);

  return labels;
};
//endregion
