goog.provide('anychart.core.grids.Linear3d');
goog.require('acgraph');
goog.require('anychart.core.IStandaloneBackend');
goog.require('anychart.core.grids.Linear');



/**
 * Grid.
 * @constructor
 * @extends {anychart.core.grids.Linear}
 * @implements {anychart.core.IStandaloneBackend}
 */
anychart.core.grids.Linear3d = function() {
  anychart.core.grids.Linear3d.base(this, 'constructor');
};
goog.inherits(anychart.core.grids.Linear3d, anychart.core.grids.Linear);


//----------------------------------------------------------------------------------------------------------------------
//
//  Line drawing.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Draw horizontal line.
 * @param {number} ratio Scale ratio to draw grid line.
 * @param {number} shift Grid line pixel shift.
 * @protected
 */
anychart.core.grids.Linear3d.prototype.drawLineHorizontal = function(ratio, shift) {
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


/**
 * Draw vertical line.
 * @param {number} ratio Scale ratio to draw grid line.
 * @param {number} shift Grid line pixel shift.
 * @protected
 */
anychart.core.grids.Linear3d.prototype.drawLineVertical = function(ratio, shift) {
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


//----------------------------------------------------------------------------------------------------------------------
//
//  Interlaced drawing.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Draw horizontal line.
 * @param {number} ratio Scale ratio to draw grid interlace.
 * @param {number} prevRatio Previous scale ratio to draw grid interlace.
 * @param {string} fillSettings Interlace fill settings.
 * @param {acgraph.vector.Path} path Layer to draw interlace.
 * @param {number} shift Grid line pixel shift.
 * @protected
 */
anychart.core.grids.Linear3d.prototype.drawInterlaceHorizontal = function(ratio, prevRatio, fillSettings, path, shift) {
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


/**
 * Draw horizontal line.
 * @param {number} ratio Scale ratio to draw grid interlace.
 * @param {number} prevRatio Previous scale ratio to draw grid interlace.
 * @param {string} fillSettings Interlace fill settings.
 * @param {acgraph.vector.Path} path Layer to draw interlace.
 * @param {number} shift Grid line pixel shift.
 * @protected
 */
anychart.core.grids.Linear3d.prototype.drawInterlaceVertical = function(ratio, prevRatio, fillSettings, path, shift) {
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
