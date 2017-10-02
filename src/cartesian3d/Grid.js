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


//region --- Drawing
/** @inheritDoc */
anychart.cartesian3dModule.Grid.prototype.drawLineHorizontal = function(ratio, shift) {
  var parentBounds = this.parentBounds() || anychart.math.rect(0, 0, 0, 0);
  /** @type {number}*/
  var y = Math.round(parentBounds.getBottom() - ratio * parentBounds.height);
  ratio == 1 ? y -= shift : y += shift;

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
  /** @type {number}*/
  var x = Math.round(parentBounds.getLeft() + ratio * parentBounds.width);
  ratio == 1 ? x += shift : x -= shift;

  var x1 = x + this.x3dShift;
  var y1 = parentBounds.getBottom() - this.y3dShift;

  this.lineElementInternal
      .moveTo(x, parentBounds.getBottom())
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
