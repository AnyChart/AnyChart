goog.provide('anychart.colorScalesModule.ui.ColorRangeTicks');
goog.require('anychart.core.AxisTicks');



/**
 * Color range ticks class.<br/>
 * You can change position, length and line features.
 * @constructor
 * @extends {anychart.core.AxisTicks}
 */
anychart.colorScalesModule.ui.ColorRangeTicks = function() {
  anychart.colorScalesModule.ui.ColorRangeTicks.base(this, 'constructor');
};
goog.inherits(anychart.colorScalesModule.ui.ColorRangeTicks, anychart.core.AxisTicks);


//region --- Drawers
/** @inheritDoc */
anychart.colorScalesModule.ui.ColorRangeTicks.prototype.drawTopTick = function(ratio, bounds, lineBounds, lineThickness, pixelShift) {
  /** @type {number} */
  var x = Math.round(bounds.left + ratio * bounds.width);
  /** @type {number} */
  var y;
  /** @type {number} */
  var dy;

  if (ratio == 1) x += pixelShift;
  else x -= pixelShift;

  var length = /** @type {number} */(this.getOption('length'));
  var position = /** @type {anychart.enums.SidePosition} */(this.getOption('position'));

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
anychart.colorScalesModule.ui.ColorRangeTicks.prototype.drawRightTick = function(ratio, bounds, lineBounds, lineThickness, pixelShift) {
  /** @type {number} */
  var x;
  /** @type {number} */
  var y = Math.round(bounds.top + bounds.height - ratio * bounds.height);
  /** @type {number} */
  var dx;

  if (ratio == 1) y -= pixelShift;
  else y += pixelShift;

  var length = /** @type {number} */(this.getOption('length'));
  var position = /** @type {anychart.enums.SidePosition} */(this.getOption('position'));

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
anychart.colorScalesModule.ui.ColorRangeTicks.prototype.drawBottomTick = function(ratio, bounds, lineBounds, lineThickness, pixelShift) {
  /** @type {number} */
  var x = Math.round(bounds.left + ratio * (bounds.width));
  /** @type {number} */
  var y;
  /** @type {number} */
  var dy;

  if (ratio == 1) x += pixelShift;
  else x -= pixelShift;

  var length = /** @type {number} */(this.getOption('length'));
  var position = /** @type {anychart.enums.SidePosition} */(this.getOption('position'));

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
anychart.colorScalesModule.ui.ColorRangeTicks.prototype.drawLeftTick = function(ratio, bounds, lineBounds, lineThickness, pixelShift) {
  /** @type {number} */
  var x;
  /** @type {number} */
  var y = Math.round(bounds.top + bounds.height - ratio * (bounds.height));
  /** @type {number} */
  var dx;

  if (ratio == 1) y -= pixelShift;
  else y += pixelShift;

  var length = /** @type {number} */(this.getOption('length'));
  var position = /** @type {anychart.enums.SidePosition} */(this.getOption('position'));

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
//endregion
