goog.provide('anychart.cartesian3dModule.Grid');
goog.provide('anychart.standalones.grids.Linear3d');
goog.require('acgraph');
goog.require('anychart.core.GridBase');
goog.require('anychart.core.IStandaloneBackend');



/**
 * Grid.
 * @constructor
 * @extends {anychart.core.GridBase}
 * @implements {anychart.core.IStandaloneBackend}
 */
anychart.cartesian3dModule.Grid = function() {
  anychart.cartesian3dModule.Grid.base(this, 'constructor');
};
goog.inherits(anychart.cartesian3dModule.Grid, anychart.core.GridBase);


//region --- Infrastructure
/** @inheritDoc */
anychart.cartesian3dModule.Grid.prototype.scaleInvalidated = function(event) {
  var signal = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION))
    signal |= anychart.Signal.NEEDS_RECALCULATION;
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION))
    signal |= anychart.Signal.NEEDS_REDRAW;

  signal |= anychart.Signal.BOUNDS_CHANGED;

  var state = anychart.ConsistencyState.BOUNDS |
      anychart.ConsistencyState.APPEARANCE;

  this.invalidate(state, signal);
};


//endregion
//region --- Drawing
/** @inheritDoc */
anychart.cartesian3dModule.Grid.prototype.drawLineHorizontal = function(ratio, shift) {
  var parentBounds = this.parentBounds() || anychart.math.rect(0, 0, 0, 0);
  /** @type {number} */
  var y = Math.round(parentBounds.getBottom() - ratio * parentBounds.height);

  var stroke = /** @type {acgraph.vector.Stroke} */(this.lineElement().stroke());
  var strokeThickness = anychart.utils.extractThickness(stroke);
  y = anychart.utils.applyPixelShift(y, strokeThickness);

  var x1 = parentBounds.getLeft() + this.x3dShift;
  var y1 = y - this.y3dShift;

  this.lineElementInternal
      .moveTo(parentBounds.getLeft(), y)
      .lineTo(x1, y1)
      .lineTo(parentBounds.getRight() + this.x3dShift, y1);
};


/** @inheritDoc */
anychart.cartesian3dModule.Grid.prototype.drawLineVertical = function(ratio, shift) {
  var parentBounds = this.parentBounds() || anychart.math.rect(0, 0, 0, 0);
  /** @type {number} */
  var x = Math.round(parentBounds.getLeft() + ratio * parentBounds.width);

  var stroke = /** @type {acgraph.vector.Stroke} */(this.lineElement().stroke());
  var strokeThickness = anychart.utils.extractThickness(stroke);

  x = anychart.utils.applyPixelShift(x, strokeThickness);

  var x1 = x + this.x3dShift;
  var y1 = Math.ceil(anychart.utils.applyPixelShift(parentBounds.getBottom() - this.y3dShift, 1));

  this.lineElementInternal
      .moveTo(x, Math.ceil(anychart.utils.applyPixelShift(parentBounds.getBottom(), 1)))
      .lineTo(x1, y1)
      .lineTo(x1, parentBounds.getTop() - this.y3dShift);
};


/** @inheritDoc */
anychart.cartesian3dModule.Grid.prototype.drawInterlaceHorizontal = function(ratio, prevRatio, path, shift) {
  if (!isNaN(prevRatio)) {
    var parentBounds = this.parentBounds() || anychart.math.rect(0, 0, 0, 0);
    var y1, y2, checkIndex;
    y1 = Math.round(parentBounds.getBottom() - prevRatio * parentBounds.height);
    y2 = Math.round(parentBounds.getBottom() - ratio * parentBounds.height);
    checkIndex = 1;
    ratio == checkIndex ? y2 -= shift : y2 += shift;
    prevRatio == checkIndex ? y1 -= shift : y1 += shift;

    path
        .moveTo(parentBounds.getLeft(), y1)
        .lineTo(parentBounds.getLeft() + this.x3dShift, y1 - this.y3dShift)
        .lineTo(parentBounds.getRight() + this.x3dShift, y1 - this.y3dShift)
        .lineTo(parentBounds.getRight() + this.x3dShift, y2 - this.y3dShift)
        .lineTo(parentBounds.getLeft() + this.x3dShift, y2 - this.y3dShift)
        .lineTo(parentBounds.getLeft(), y2)
        .close();
  }
};


/** @inheritDoc */
anychart.cartesian3dModule.Grid.prototype.drawInterlaceVertical = function(ratio, prevRatio, path, shift) {
  if (!isNaN(prevRatio)) {
    var parentBounds = this.parentBounds() || anychart.math.rect(0, 0, 0, 0);
    var x1, x2, checkIndex;
    x1 = Math.round(parentBounds.getLeft() + prevRatio * parentBounds.width);
    x2 = Math.round(parentBounds.getLeft() + ratio * parentBounds.width);
    checkIndex = 1;
    ratio == checkIndex ? x2 += shift : x2 -= shift;
    prevRatio == checkIndex ? x1 += shift : x1 -= shift;

    path
        .moveTo(x1 + this.x3dShift, parentBounds.getTop() - this.y3dShift)
        .lineTo(x2 + this.x3dShift, parentBounds.getTop() - this.y3dShift)
        .lineTo(x2 + this.x3dShift, parentBounds.getBottom() - this.y3dShift)
        .lineTo(x2, parentBounds.getBottom())
        .lineTo(x1, parentBounds.getBottom())
        .lineTo(x1 + this.x3dShift, parentBounds.getBottom() - this.y3dShift)
        .close();
  }
};



//endregion
//region --- Standalone
//------------------------------------------------------------------------------
//
//  Standalone
//
//------------------------------------------------------------------------------
/**
 * @constructor
 * @extends {anychart.cartesian3dModule.Grid}
 */
anychart.standalones.grids.Linear3d = function() {
  anychart.standalones.grids.Linear3d.base(this, 'constructor');
};
goog.inherits(anychart.standalones.grids.Linear3d, anychart.cartesian3dModule.Grid);
anychart.core.makeStandalone(anychart.standalones.grids.Linear3d, anychart.cartesian3dModule.Grid);


/**
 * Constructor function.
 * @return {!anychart.standalones.grids.Linear3d}
 */
anychart.standalones.grids.linear3d = function() {
  var grid = new anychart.standalones.grids.Linear3d();
  grid.setup(anychart.getFullTheme('standalones.linearGrid'));
  return grid;
};


//endregion
//region --- Exports
(function() {
  var proto = anychart.cartesian3dModule.Grid.prototype;
  proto['isHorizontal'] = proto.isHorizontal;
  proto['scale'] = proto.scale;
  proto['axis'] = proto.axis;
  // proto['isMinor'] = proto.isMinor;

  proto = anychart.standalones.grids.Linear3d.prototype;
  goog.exportSymbol('anychart.standalones.grids.linear3d', anychart.standalones.grids.linear3d);
  proto['layout'] = proto.layout;
  proto['draw'] = proto.draw;
  proto['parentBounds'] = proto.parentBounds;
  proto['container'] = proto.container;
})();
//endregion
