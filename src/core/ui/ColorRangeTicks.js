goog.provide('anychart.core.ui.ColorRangeTicks');
goog.require('anychart.core.axes.Ticks');



/**
 * Color range ticks class.<br/>
 * You can change position, length and line features.
 * @constructor
 * @extends {anychart.core.axes.Ticks}
 */
anychart.core.ui.ColorRangeTicks = function() {
  anychart.core.ui.ColorRangeTicks.base(this, 'constructor');
};
goog.inherits(anychart.core.ui.ColorRangeTicks, anychart.core.axes.Ticks);


/** @inheritDoc */
anychart.core.ui.ColorRangeTicks.prototype.drawTopTick = function(ratio, bounds, lineBounds, lineThickness, pixelShift) {
  /** @type {number} */
  var x = Math.round(bounds.left + ratio * bounds.width);
  /** @type {number} */
  var y;
  /** @type {number} */
  var dy;
  var length = /** @type {number} */(this.length());
  var position = /** @type {anychart.enums.SidePosition} */(this.position());

  if (ratio == 1) x += pixelShift;
  else x -= pixelShift;

  if (position == anychart.enums.SidePosition.OUTSIDE) {
    y = lineBounds.top - lineThickness / 2;
    dy = /** @type {number} */(-length);
  } else if (position == anychart.enums.SidePosition.CENTER) {
    y = lineBounds.top + (lineBounds.height - length) / 2;
    dy = /** @type {number} */(length);
  } else if (position == anychart.enums.SidePosition.INSIDE) {
    y = lineBounds.getBottom() + lineThickness / 2;
    dy = /** @type {number} */(length);
  }

  this.path.moveTo(x, y);
  this.path.lineTo(x, y + dy);
};


/** @inheritDoc */
anychart.core.ui.ColorRangeTicks.prototype.drawRightTick = function(ratio, bounds, lineBounds, lineThickness, pixelShift) {
  /** @type {number} */
  var x;
  /** @type {number} */
  var y = Math.round(bounds.top + bounds.height - ratio * bounds.height);
  /** @type {number} */
  var dx;
  var length = /** @type {number} */(this.length());
  var position = /** @type {anychart.enums.SidePosition} */(this.position());

  if (ratio == 1) y -= pixelShift;
  else y += pixelShift;

  if (position == anychart.enums.SidePosition.OUTSIDE) {
    x = lineBounds.getRight() + lineThickness / 2;
    dx = /** @type {number} */(length);
  } else if (position == anychart.enums.SidePosition.CENTER) {
    x = lineBounds.left + (lineBounds.width - length) / 2;
    dx = /** @type {number} */(length);
  } else {
    x = lineBounds.left - lineThickness / 2;
    dx = /** @type {number} */(-length);
  }

  this.path.moveTo(x, y);
  this.path.lineTo(x + dx, y);
};


/** @inheritDoc */
anychart.core.ui.ColorRangeTicks.prototype.drawBottomTick = function(ratio, bounds, lineBounds, lineThickness, pixelShift) {
  /** @type {number} */
  var x = Math.round(bounds.left + ratio * (bounds.width));
  /** @type {number} */
  var y;
  /** @type {number} */
  var dy;
  var length = /** @type {number} */(this.length());
  var position = /** @type {anychart.enums.SidePosition} */(this.position());

  if (ratio == 1) x += pixelShift;
  else x -= pixelShift;

  if (position == anychart.enums.SidePosition.OUTSIDE) {
    y = lineBounds.getBottom() + lineThickness / 2;
    dy = /** @type {number} */(length);
  } else if (position == anychart.enums.SidePosition.CENTER) {
    y = lineBounds.top + (lineBounds.height - length) / 2;
    dy = /** @type {number} */(length);
  } else if (position == anychart.enums.SidePosition.INSIDE) {
    y = lineBounds.top - lineThickness / 2;
    dy = /** @type {number} */(-length);
  }

  this.path.moveTo(x, y);
  this.path.lineTo(x, y + dy);
};


/** @inheritDoc */
anychart.core.ui.ColorRangeTicks.prototype.drawLeftTick = function(ratio, bounds, lineBounds, lineThickness, pixelShift) {
  /** @type {number} */
  var x;
  /** @type {number} */
  var y = Math.round(bounds.top + bounds.height - ratio * (bounds.height));
  /** @type {number} */
  var dx;
  var length = /** @type {number} */(this.length());
  var position = /** @type {anychart.enums.SidePosition} */(this.position());

  if (ratio == 1) y -= pixelShift;
  else y += pixelShift;

  if (position == anychart.enums.SidePosition.OUTSIDE) {
    x = lineBounds.left - lineThickness / 2;
    dx = /** @type {number} */(-length);
  } else if (position == anychart.enums.SidePosition.CENTER) {
    x = lineBounds.left + (lineBounds.width - length) / 2;
    dx = /** @type {number} */(length);
  } else if (position == anychart.enums.SidePosition.INSIDE) {
    x = lineBounds.getRight() + lineThickness / 2;
    dx = /** @type {number} */(length);
  }

  this.path.moveTo(x, y);
  this.path.lineTo(x + dx, y);
};
