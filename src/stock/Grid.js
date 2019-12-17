goog.provide('anychart.stockModule.Grid');
goog.require('acgraph');
goog.require('anychart.color');
goog.require('anychart.core.GridBase');
goog.require('anychart.core.reporting');
goog.require('anychart.core.utils.Padding');
goog.require('anychart.enums');



/**
 * Grid.
 * @constructor
 * @extends {anychart.core.GridBase}
 */
anychart.stockModule.Grid = function() {
  anychart.stockModule.Grid.base(this, 'constructor');
};
goog.inherits(anychart.stockModule.Grid, anychart.core.GridBase);


//region --- Infrastructure
/** @inheritDoc */
anychart.stockModule.Grid.prototype.scaleInvalidated = function(event) {
  //if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION) ||
  //    event.hasSignal(anychart.Signal.NEED_UPDATE_TICK_DEPENDENT))
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION))
    this.invalidate(anychart.ConsistencyState.GRIDS_POSITION | anychart.ConsistencyState.APPEARANCE,
        anychart.Signal.NEEDS_REDRAW);
};


//endregion
//region --- Drawing
/**
 * Draw horizontal line.
 * @param {number} ratio Scale ratio to draw grid line.
 * @param {number} shift Grid line pixel shift.
 * @protected
 */
anychart.stockModule.Grid.prototype.drawLineHorizontal = function(ratio, shift) {
  var parentBounds = this.parentBounds().round() || anychart.math.rect(0, 0, 0, 0);
  /** @type {number} */
  var y = parentBounds.getBottom() - ratio * parentBounds.height;
  y = anychart.utils.applyPixelShift(y, /** @type {number} */(this.lineElement().strokeThickness()));
  this.lineElementInternal.moveTo(anychart.utils.applyPixelShift(parentBounds.getLeft(), 1) - 0.5, y);
  this.lineElementInternal.lineTo(anychart.utils.applyPixelShift(parentBounds.getRight(), 1) + 0.5, y);
};


/**
 * Draw vertical line.
 * @param {number} ratio Scale ratio to draw grid line.
 * @param {number} shift Grid line pixel shift.
 * @protected
 */
anychart.stockModule.Grid.prototype.drawLineVertical = function(ratio, shift) {
  var parentBounds = this.parentBounds().round() || anychart.math.rect(0, 0, 0, 0);
  var x = (parentBounds.getLeft() + ratio * parentBounds.width);
  x = anychart.utils.applyPixelShift(x, /** @type {number} */(this.lineElement().strokeThickness()));
  this.lineElementInternal.moveTo(x, anychart.utils.applyPixelShift(parentBounds.getBottom(), 1) - 0.5);
  this.lineElementInternal.lineTo(x, anychart.utils.applyPixelShift(parentBounds.getTop(), 1) + 0.5);
};


/**
 * Draw horizontal line.
 * @param {number} ratio Scale ratio to draw grid interlace.
 * @param {number} prevRatio Previous scale ratio to draw grid interlace.
 * @param {acgraph.vector.Path} path Layer to draw interlace.
 * @param {number} shift Grid line pixel shift.
 * @protected
 */
anychart.stockModule.Grid.prototype.drawInterlaceHorizontal = function(ratio, prevRatio, path, shift) {
  if (!isNaN(prevRatio)) {
    var parentBounds = this.parentBounds().round() || anychart.math.rect(0, 0, 0, 0);

    var strokeThickness = /** @type {number} */(this.lineElement().strokeThickness());
    var y1 = parentBounds.getBottom() - prevRatio * parentBounds.height;
    y1 = anychart.utils.applyPixelShift(y1, strokeThickness);

    var y2 = parentBounds.getBottom() - ratio * parentBounds.height;
    y2 = anychart.utils.applyPixelShift(y2, strokeThickness);

    path.moveTo(parentBounds.getLeft(), y1);
    path.lineTo(parentBounds.getRight(), y1);
    path.lineTo(parentBounds.getRight(), y2);
    path.lineTo(parentBounds.getLeft(), y2);
    path.close();
  }
};


/**
 * Draw horizontal line.
 * @param {number} ratio Scale ratio to draw grid interlace.
 * @param {number} prevRatio Previous scale ratio to draw grid interlace.
 * @param {acgraph.vector.Path} path Layer to draw interlace.
 * @param {number} shift Grid line pixel shift.
 * @protected
 */
anychart.stockModule.Grid.prototype.drawInterlaceVertical = function(ratio, prevRatio, path, shift) {
  if (!isNaN(prevRatio)) {
    var parentBounds = this.parentBounds().round() || anychart.math.rect(0, 0, 0, 0);

    var strokeThickness = /** @type {number} */(this.lineElement().strokeThickness());
    var x1 = parentBounds.getLeft() + prevRatio * parentBounds.width;
    x1 = anychart.utils.applyPixelShift(x1, strokeThickness);

    var x2 = parentBounds.getLeft() + ratio * parentBounds.width;
    x2 = anychart.utils.applyPixelShift(x2, strokeThickness);

    path.moveTo(x1, parentBounds.getTop());
    path.lineTo(x2, parentBounds.getTop());
    path.lineTo(x2, parentBounds.getBottom());
    path.lineTo(x1, parentBounds.getBottom());
    path.close();
  }
};


/** @inheritDoc */
anychart.stockModule.Grid.prototype.drawInternal = function() {
  var scale = /** @type {anychart.scales.Base|anychart.stockModule.scales.Scatter} */(this.scale());

  var layout;
  var path;
  var ratio;
  var prevRatio = NaN;
  var isOrdinal = anychart.utils.instanceOf(scale, anychart.scales.Ordinal);
  var isStock = anychart.utils.instanceOf(scale, anychart.stockModule.scales.Scatter);
  var ticksArray;
  var isMinor = this.getOption('isMinor');
  if (isStock) {
    ticksArray = (/** @type {anychart.stockModule.scales.Scatter} */(scale)).getTicks().toArray(!isMinor);
    ticksArray = goog.array.concat(NaN, ticksArray, NaN);
  } else if (isOrdinal) {
    ticksArray = (/** @type {anychart.scales.Ordinal} */(scale)).ticks().get();
  } else if (isMinor) {
    ticksArray = (/** @type {anychart.scales.Linear} */(scale)).minorTicks().get();
  } else {
    ticksArray = (/** @type {anychart.scales.Linear} */(scale)).ticks().get();
  }

  if (this.isHorizontal()) {
    layout = [this.drawLineHorizontal, this.drawInterlaceHorizontal];
  } else {
    layout = [this.drawLineVertical, this.drawInterlaceVertical];
  }

  this.clearFillElements();
  this.lineElement().clear();

  var bounds = this.parentBounds() || anychart.math.rect(0, 0, 0, 0);

  var clip = bounds.clone().round();
  // align clip to bottom tick
  var bottom = clip.getBottom();
  var right = clip.getRight();
  bottom = Math.ceil(anychart.utils.applyPixelShift(bottom, 1));
  right = Math.ceil(anychart.utils.applyPixelShift(right, 1));

  clip.width = right - clip.left;
  clip.height = bottom - clip.top;

  this.lineElement().clip(/** @type {goog.math.Rect} */(clip));

  var drawInterlace = layout[1];
  var drawLine = layout[0];

  var needsShift = acgraph.vector.getThickness(/** @type {acgraph.vector.Stroke} */(this.getOption('stroke'))) % 2 == 1;

  for (var i = 0, count = ticksArray.length; i < count; i++) {
    var tickVal = ticksArray[i];
    if (goog.isArray(tickVal)) tickVal = tickVal[0];
    if (isStock) {
      if (!i) {
        ratio = 0;
      } else if (i == count - 1) {
        ratio = 1;
      } else {
        ratio = (/** @type {anychart.stockModule.scales.Scatter} */(scale)).transformAligned(tickVal);
      }
    } else {
      ratio = scale.transform(tickVal);
    }

    if (i) {
      path = this.getFillElement(i - 1);
      if (path) {
        drawInterlace.call(this, ratio, prevRatio, path, needsShift);
      }
    }

    if (!i) {
      if (this.getOption('drawFirstLine'))
        drawLine.call(this, ratio, needsShift);
    } else if (i == count - 1) {
      if (this.getOption('drawLastLine') || isOrdinal)
        drawLine.call(this, ratio, needsShift);
    } else {
      drawLine.call(this, ratio, needsShift);
    }

    prevRatio = ratio;
  }

  //draw last line on ordinal
  if (isOrdinal && goog.isDef(tickVal)) {
    ratio = scale.inverted() ? 0 : 1;
    if (this.getOption('drawLastLine'))
      drawLine.call(this, ratio, needsShift);
    path = this.getFillElement(i - 1);
    if (path) {
      drawInterlace.call(this, ratio, prevRatio, path, needsShift);
    }
  }
};


//endregion
//region --- Exports
(function() {
  var proto = anychart.stockModule.Grid.prototype;
  proto['isHorizontal'] = proto.isHorizontal;
  proto['scale'] = proto.scale;
  proto['axis'] = proto.axis;
  // proto['isMinor'] = proto.isMinor;
})();
//endregion
