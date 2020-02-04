goog.provide('anychart.surfaceModule.Grid');
goog.require('anychart.core.GridBase');
goog.require('anychart.surfaceModule.math');



/**
 *
 * @constructor
 * @extends {anychart.core.GridBase}
 */
anychart.surfaceModule.Grid = function() {
  anychart.surfaceModule.Grid.base(this, 'constructor');

  /**
   * This is separate element for grid lines on back side of surface box.
   * @type {acgraph.vector.Path}
   * @protected
   */
  this.lineElementInternalBackSide = null;

  /**
   * Object that stores fill elements for interlaces drawn on the back side of surface box.
   * @type {{used: Array.<acgraph.vector.Path>, free: Array.<acgraph.vector.Path>}}
   * @protected
   */
  this.fillElementsBackSide = {
    used: [],
    free: []
  };

  /**
   * This is to distinguish z grid for drawing purposes
   * @type {boolean}
   * @private
   */
  this.isZGrid_ = false;
};
goog.inherits(anychart.surfaceModule.Grid, anychart.core.GridBase);


/**
 * Creates if it isn't path element for back side interlace.
 * @return {acgraph.vector.Path}
 */
anychart.surfaceModule.Grid.prototype.fillElementBackSide = function() {
  var path;
  if (this.fillElementsBackSide.free.length == 0) {
    path = acgraph.path();
    path.parent(/** @type {acgraph.vector.ILayer} */(this.container())).zIndex(/** @type {number} */(this.zIndex()));
    path.stroke('none');
    this.fillElementsBackSide.used.push(path);
    return path;
  }
  path = this.fillElementsBackSide.free.pop();
  this.fillElementsBackSide.used.push(path);
  path.parent(/** @type {acgraph.vector.ILayer} */(this.container()));
  return path;
};


/** @inheritDoc */
anychart.surfaceModule.Grid.prototype.clearFillElements = function() {
  anychart.surfaceModule.Grid.base(this, 'clearFillElements');
  var path;
  while (path = this.fillElementsBackSide.used.pop()) {
    path.clear();
    this.fillElementsBackSide.free.push(path);
  }
};


/**
 * This option is set if grid is of Z axis.
 * @param {boolean=} opt_value
 * @return {(boolean|anychart.surfaceModule.Grid)}
 */
anychart.surfaceModule.Grid.prototype.isZGrid = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.isZGrid_ = !!opt_value;
    return this;
  }
  return this.isZGrid_;
};


/**
 * Returns line element for back side part of grid.
 * @param {boolean=} opt_isMajor
 * @return {acgraph.vector.Path}
 */
anychart.surfaceModule.Grid.prototype.lineElementBackSide = function(opt_isMajor) {
  this.lineElementInternalBackSide = (this.lineElementInternalBackSide ?
      this.lineElementInternalBackSide : acgraph.path());
  return this.lineElementInternalBackSide;
};


/**
 * Applies appearance to both line elements.
 */
anychart.surfaceModule.Grid.prototype.applyAppearance = function() {
  anychart.surfaceModule.Grid.base(this, 'applyAppearance');
  this.lineElementBackSide().stroke(/** @type {acgraph.vector.Stroke} */(this.getOption('stroke')));
};


/**
 * Applies container to both line elements.
 */
anychart.surfaceModule.Grid.prototype.applyContainer = function() {
  anychart.surfaceModule.Grid.base(this, 'applyContainer');
  var container = /** @type {acgraph.vector.ILayer} */(this.container());
  this.lineElementBackSide().parent(container);
};


/**
 * Applies z index to both line elements.
 */
anychart.surfaceModule.Grid.prototype.applyZIndex = function() {
  var zIndex = /** @type {number} */(this.zIndex()) - 1;
  var bottomGridZIndex = this.rotationY_ <= 0 ? zIndex + 2 : zIndex;
  this.lineElement().zIndex(bottomGridZIndex);
  this.lineElementBackSide().zIndex(zIndex);
  goog.object.forEach(this.fillMap, function(path, key, obj) {
    path.zIndex(bottomGridZIndex);
  });
};


/** @inheritDoc */
anychart.surfaceModule.Grid.prototype.remove = function() {
  anychart.surfaceModule.Grid.base(this, 'remove');
  this.lineElementBackSide().parent(null);
};


/** @inheritDoc */
anychart.surfaceModule.Grid.prototype.drawInternal = function() {
  this.lineElementBackSide().clear();
  anychart.surfaceModule.Grid.base(this, 'drawInternal');
};


/**
 * Draws X grid.
 * @inheritDoc
 */
anychart.surfaceModule.Grid.prototype.drawLineHorizontal = function(ratio, shift) {
  var innerRatio = ratio - 0.5;
  var pointsOriginal;
  if (this.isZGrid_) {
    // pointsOriginal = [[0.5, -0.5, innerRatio], [-0.5, -0.5, innerRatio]];
    this.drawZGrid(innerRatio);
  } else {
    pointsOriginal = [[innerRatio, -0.5, 0.5], [innerRatio, 0.5, 0.5]];
    this.drawXYGrid(pointsOriginal);
  }
};


/**
 * Draws Y grid.
 * @inheritDoc
 */
anychart.surfaceModule.Grid.prototype.drawLineVertical = function(ratio, shift) {
  var innerRatio = ratio - 0.5;
  var pointsOriginal = [[-0.5, innerRatio, 0.5], [0.5, innerRatio, 0.5]];
  this.drawXYGrid(pointsOriginal);
};


/**
 * Draws Z grid on 2 distant sides of the box.
 * @param {number} innerRatio ratio in [-0.5, 0.5]
 */
anychart.surfaceModule.Grid.prototype.drawZGrid = function(innerRatio) {
  innerRatio = -innerRatio;
  var pointsOriginal = [
    [-0.5, -0.5, innerRatio],
    [-0.5, 0.5, innerRatio],
    [0.5, 0.5, innerRatio],
    [0.5, -0.5, innerRatio]
  ];

  var matrix = anychart.surfaceModule.math.createTransformationMatrix(this.rotationZ_, this.rotationY_);
  var pointsTransformed = [];

  var depth = -Infinity;
  var index = 0;
  for (var i = 0; i < pointsOriginal.length; i++) {
    pointsTransformed[i] = anychart.surfaceModule.math.applyTransformationMatrixToPoint(matrix, pointsOriginal[i]);
    var transformedPointDepth = anychart.surfaceModule.math.distanceToPoint(this.rotationY_, pointsTransformed[i]);
    if (transformedPointDepth > depth) {
      depth = transformedPointDepth;
      index = i;
    }
  }

  var deepestPoint = pointsOriginal[index];

  pointsTransformed = [
    [-deepestPoint[0], deepestPoint[1], deepestPoint[2]],
    [deepestPoint[0], deepestPoint[1], deepestPoint[2]],
    [deepestPoint[0], -deepestPoint[1], deepestPoint[2]]
  ];

  for (var i = 0; i < pointsTransformed.length; i++) {
    pointsTransformed[i] = anychart.surfaceModule.math.applyTransformationMatrixToPoint(matrix, pointsTransformed[i]);
  }
  var parentBounds = /** @type {goog.math.Rect} */(this.parentBounds());
  var pointsToRender = anychart.surfaceModule.math.pointsToScreenCoordinates(pointsTransformed, parentBounds);

  this.lineElementInternalBackSide.moveTo(pointsToRender[0][1], pointsToRender[0][2]);
  this.lineElementInternalBackSide.lineTo(pointsToRender[1][1], pointsToRender[1][2]);
  this.lineElementInternalBackSide.lineTo(pointsToRender[2][1], pointsToRender[2][2]);
};


/**
 * Draws X and Y grid with given prepared points.
 * @param {Array.<Array.<number>>} points for grid to draw on bottom and distant sides of the box.
 */
anychart.surfaceModule.Grid.prototype.drawXYGrid = function(points) {
  var pointsOriginal = points;
  var parentBounds = /** @type {goog.math.Rect} */(this.parentBounds());
  var matrix = anychart.surfaceModule.math.createTransformationMatrix(this.rotationZ_, this.rotationY_);
  var pointsTransformed = [];
  pointsTransformed[0] = anychart.surfaceModule.math.applyTransformationMatrixToPoint(matrix, pointsOriginal[0]);
  pointsTransformed[1] = anychart.surfaceModule.math.applyTransformationMatrixToPoint(matrix, pointsOriginal[1]);

  //drawing grid on distant side of box
  var distanceToFirstPoint = anychart.surfaceModule.math.distanceToPoint(this.rotationY_, pointsTransformed[0]);
  var distanceToSecondPoint = anychart.surfaceModule.math.distanceToPoint(this.rotationY_, pointsTransformed[1]);
  if (distanceToFirstPoint > distanceToSecondPoint) {
    var tempPoint = pointsOriginal[1];
    pointsOriginal[1] = pointsOriginal[0];
    pointsOriginal[0] = tempPoint;

    tempPoint = pointsTransformed[1];
    pointsTransformed[1] = pointsTransformed[0];
    pointsTransformed[0] = tempPoint;
  }
  pointsOriginal[2] = [pointsOriginal[1][0], pointsOriginal[1][1], -0.5];
  pointsTransformed[2] = anychart.surfaceModule.math.applyTransformationMatrixToPoint(matrix, pointsOriginal[2]);

  var pointsToRender = anychart.surfaceModule.math.pointsToScreenCoordinates(pointsTransformed, parentBounds);

  this.lineElementInternal.moveTo(pointsToRender[0][1], pointsToRender[0][2]);
  this.lineElementInternal.lineTo(pointsToRender[1][1], pointsToRender[1][2]);
  this.lineElementInternalBackSide.moveTo(pointsToRender[1][1], pointsToRender[1][2]);
  this.lineElementInternalBackSide.lineTo(pointsToRender[2][1], pointsToRender[2][2]);
};


/**
 * Draws Z grid fill between the lines.
 * @param {number} ratio Scale ratio to draw grid interlace.
 * @param {number} prevRatio Previous scale ratio to draw grid interlace.
 * @param {acgraph.vector.Path} path Layer to draw interlace.
 */
anychart.surfaceModule.Grid.prototype.drawInterlaceZ = function(ratio, prevRatio, path) {
  var pathBackSide = this.fillElementBackSide();
  var innerRatio = -(ratio - 0.5);
  var innerPrevRatio = -(prevRatio - 0.5);
  var pointsOriginal = [
    [-0.5, -0.5, innerRatio],
    [-0.5, 0.5, innerRatio],
    [0.5, 0.5, innerRatio],
    [0.5, -0.5, innerRatio]
  ];

  var matrix = anychart.surfaceModule.math.createTransformationMatrix(this.rotationZ_, this.rotationY_);
  var pointsTransformed = [];

  var depth = -Infinity;
  var index = 0;
  for (var i = 0; i < pointsOriginal.length; i++) {
    pointsTransformed[i] = anychart.surfaceModule.math.applyTransformationMatrixToPoint(matrix, pointsOriginal[i]);
    var transformedPointDepth = anychart.surfaceModule.math.distanceToPoint(this.rotationY_, pointsTransformed[i]);
    if (transformedPointDepth > depth) {
      depth = transformedPointDepth;
      index = i;
    }
  }

  var deepestPoint = pointsOriginal[index];

  pointsTransformed = [
    [-deepestPoint[0], deepestPoint[1], deepestPoint[2]],
    [deepestPoint[0], deepestPoint[1], deepestPoint[2]],
    [deepestPoint[0], -deepestPoint[1], deepestPoint[2]]
  ];

  var pointsTransformedPrev = [
    [-deepestPoint[0], deepestPoint[1], innerPrevRatio],
    [deepestPoint[0], deepestPoint[1], innerPrevRatio],
    [deepestPoint[0], -deepestPoint[1], innerPrevRatio]
  ];

  for (var i = 0; i < pointsTransformed.length; i++) {
    pointsTransformed[i] = anychart.surfaceModule.math.applyTransformationMatrixToPoint(matrix, pointsTransformed[i]);
    pointsTransformedPrev[i] = anychart.surfaceModule.math.applyTransformationMatrixToPoint(matrix, pointsTransformedPrev[i]);
  }

  var parentBounds = /** @type {goog.math.Rect} */(this.parentBounds());
  var pointsToRender = anychart.surfaceModule.math.pointsToScreenCoordinates(pointsTransformed, parentBounds);
  var pointsToRenderPrev = anychart.surfaceModule.math.pointsToScreenCoordinates(pointsTransformedPrev, parentBounds);

  pathBackSide.moveTo(pointsToRender[0][1], pointsToRender[0][2]);
  pathBackSide.lineTo(pointsToRender[1][1], pointsToRender[1][2]);
  pathBackSide.lineTo(pointsToRender[2][1], pointsToRender[2][2]);

  pathBackSide.lineTo(pointsToRenderPrev[2][1], pointsToRenderPrev[2][2]);
  pathBackSide.lineTo(pointsToRenderPrev[1][1], pointsToRenderPrev[1][2]);
  pathBackSide.lineTo(pointsToRenderPrev[0][1], pointsToRenderPrev[0][2]);
  pathBackSide.close();
  pathBackSide.fill(/** @type {acgraph.vector.Fill} */(path.fill()));
  pathBackSide.zIndex(20);
};


/** @inheritDoc */
anychart.surfaceModule.Grid.prototype.drawInterlaceHorizontal = function(ratio, prevRatio, path) {
  if (this.isZGrid()) {
    this.drawInterlaceZ(ratio, prevRatio, path);
    return;
  }
  var matrix = anychart.surfaceModule.math.createTransformationMatrix(this.rotationZ_, this.rotationY_);
  var innerRatio = ratio - 0.5;
  var innerPrevRatio = prevRatio - 0.5;
  var pointsOriginalBottom = [[innerRatio, -0.5, 0.5], [innerRatio, 0.5, 0.5]];
  pointsOriginalBottom.push([innerPrevRatio, 0.5, 0.5]);
  pointsOriginalBottom.push([innerPrevRatio, -0.5, 0.5]);
  var pointsTransformedBottom = [];
  for (var i = 0; i < pointsOriginalBottom.length; i++) {
    pointsTransformedBottom.push(anychart.surfaceModule.math.applyTransformationMatrixToPoint(matrix, pointsOriginalBottom[i]));
  }
  var parentBounds = /** @type {goog.math.Rect} */(this.parentBounds());
  var pointsToRenderBottom = anychart.surfaceModule.math.pointsToScreenCoordinates(pointsTransformedBottom, parentBounds);
  var firstPass = !path.getCurrentPoint();
  path.moveTo(pointsToRenderBottom[0][1], pointsToRenderBottom[0][2]);
  path.lineTo(pointsToRenderBottom[1][1], pointsToRenderBottom[1][2]);
  path.lineTo(pointsToRenderBottom[2][1], pointsToRenderBottom[2][2]);
  path.lineTo(pointsToRenderBottom[3][1], pointsToRenderBottom[3][2]);
  path.close();

  var pathBackSide = this.fillElementBackSide();
  var pointsOriginalBackSide = [];
  if (pointsTransformedBottom[0][0] > pointsTransformedBottom[1][0]) {
    pointsOriginalBackSide.push(pointsOriginalBottom[0]);
  } else {
    pointsOriginalBackSide.push(pointsOriginalBottom[1]);
  }
  pointsOriginalBackSide.push([pointsOriginalBackSide[0][0], pointsOriginalBackSide[0][1], -0.5]);
  pointsOriginalBackSide.push([innerPrevRatio, pointsOriginalBackSide[0][1], -0.5]);
  pointsOriginalBackSide.push([innerPrevRatio, pointsOriginalBackSide[0][1], 0.5]);

  var pointsTransformedBackSide = [];
  for (var i = 0; i < pointsOriginalBottom.length; i++) {
    pointsTransformedBackSide.push(
        anychart.surfaceModule.math.applyTransformationMatrixToPoint(matrix, pointsOriginalBackSide[i])
    );
  }
  var pointsToRenderBackSide = anychart.surfaceModule.math.pointsToScreenCoordinates(pointsTransformedBackSide, parentBounds);
  pathBackSide.moveTo(pointsToRenderBackSide[0][1], pointsToRenderBackSide[0][2]);
  pathBackSide.lineTo(pointsToRenderBackSide[1][1], pointsToRenderBackSide[1][2]);
  pathBackSide.lineTo(pointsToRenderBackSide[2][1], pointsToRenderBackSide[2][2]);
  pathBackSide.lineTo(pointsToRenderBackSide[3][1], pointsToRenderBackSide[3][2]);
  pathBackSide.close();

  pathBackSide.fill(/** @type {acgraph.vector.Fill} */(path.fill()));
  pathBackSide.zIndex(20);
};


/** @inheritDoc */
anychart.surfaceModule.Grid.prototype.drawInterlaceVertical = function(ratio, prevRatio, path) {
  var matrix = anychart.surfaceModule.math.createTransformationMatrix(this.rotationZ_, this.rotationY_);
  var innerRatio = ratio - 0.5;
  var innerPrevRatio = prevRatio - 0.5;
  var pointsOriginalBottom = [[-0.5, innerRatio, 0.5], [0.5, innerRatio, 0.5]];
  pointsOriginalBottom.push([0.5, innerPrevRatio, 0.5]);
  pointsOriginalBottom.push([-0.5, innerPrevRatio, 0.5]);
  var pointsTransformedBottom = [];
  for (var i = 0; i < pointsOriginalBottom.length; i++) {
    pointsTransformedBottom.push(
        anychart.surfaceModule.math.applyTransformationMatrixToPoint(matrix, pointsOriginalBottom[i])
    );
  }
  var parentBounds = /** @type {goog.math.Rect} */(this.parentBounds());
  var pointsToRenderBottom = anychart.surfaceModule.math.pointsToScreenCoordinates(pointsTransformedBottom, parentBounds);
  path.moveTo(pointsToRenderBottom[0][1], pointsToRenderBottom[0][2]);
  path.lineTo(pointsToRenderBottom[1][1], pointsToRenderBottom[1][2]);
  path.lineTo(pointsToRenderBottom[2][1], pointsToRenderBottom[2][2]);
  path.lineTo(pointsToRenderBottom[3][1], pointsToRenderBottom[3][2]);
  path.close();

  var pathBackSide = this.fillElementBackSide();
  pathBackSide.clear();
  var pointsOriginalBackSide = [];
  if (pointsTransformedBottom[0][0] > pointsTransformedBottom[1][0]) {
    pointsOriginalBackSide.push(pointsOriginalBottom[0]);
  } else {
    pointsOriginalBackSide.push(pointsOriginalBottom[1]);
  }
  pointsOriginalBackSide.push([pointsOriginalBackSide[0][0], pointsOriginalBackSide[0][1], -0.5]);
  pointsOriginalBackSide.push([pointsOriginalBackSide[0][0], innerPrevRatio, -0.5]);
  pointsOriginalBackSide.push([pointsOriginalBackSide[0][0], innerPrevRatio, 0.5]);

  var pointsTransformedBackSide = [];
  for (var i = 0; i < pointsOriginalBottom.length; i++) {
    pointsTransformedBackSide.push(
        anychart.surfaceModule.math.applyTransformationMatrixToPoint(matrix, pointsOriginalBackSide[i])
    );
  }
  var pointsToRenderBackSide = anychart.surfaceModule.math.pointsToScreenCoordinates(pointsTransformedBackSide, parentBounds);
  pathBackSide.moveTo(pointsToRenderBackSide[0][1], pointsToRenderBackSide[0][2]);
  pathBackSide.lineTo(pointsToRenderBackSide[1][1], pointsToRenderBackSide[1][2]);
  pathBackSide.lineTo(pointsToRenderBackSide[2][1], pointsToRenderBackSide[2][2]);
  pathBackSide.lineTo(pointsToRenderBackSide[3][1], pointsToRenderBackSide[3][2]);
  pathBackSide.close();

  pathBackSide.fill(/** @type {acgraph.vector.Fill} */(path.fill()));
  pathBackSide.zIndex(20);
};


/**
 * Invalidate grid on rotation.
 * @private
 */
anychart.surfaceModule.Grid.prototype.invalidateOnRotation_ = function() {
  this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.BOUNDS |
      anychart.ConsistencyState.Z_INDEX, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Z rotation setter.
 * @param {number=} opt_value
 * @return {anychart.surfaceModule.Grid|number}
 */
anychart.surfaceModule.Grid.prototype.rotationZ = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.rotationZ_ = +opt_value;
    this.invalidateOnRotation_();
    return this;
  }
  return this.rotationZ_;
};


/**
 * Y rotation setter.
 * @param {number=} opt_value
 * @return {anychart.surfaceModule.Grid|number}
 */
anychart.surfaceModule.Grid.prototype.rotationY = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.rotationY_ = +opt_value;
    this.invalidateOnRotation_();
    return this;
  }
  return this.rotationY_;
};


/** @inheritDoc */
anychart.surfaceModule.Grid.prototype.disposeInternal = function() {
  goog.dispose(this.lineElementInternalBackSide);
  this.lineElementInternalBackSide = null;
  anychart.surfaceModule.Grid.base(this, 'disposeInternal');
};
