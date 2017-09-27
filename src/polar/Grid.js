goog.provide('anychart.polarModule.Grid');
goog.provide('anychart.standalones.grids.Polar');
goog.require('acgraph');
goog.require('anychart.color');
goog.require('anychart.core.IStandaloneBackend');
goog.require('anychart.core.reporting');
goog.require('anychart.core.utils.TypedLayer');
goog.require('anychart.enums');
goog.require('anychart.radarPolarBaseModule.Grid');
goog.require('anychart.scales');



/**
 * Grid.
 * @constructor
 * @extends {anychart.radarPolarBaseModule.Grid}
 * @implements {anychart.core.IStandaloneBackend}
 */
anychart.polarModule.Grid = function() {
  anychart.polarModule.Grid.base(this, 'constructor');
};
goog.inherits(anychart.polarModule.Grid, anychart.radarPolarBaseModule.Grid);


//region --- Drawing
/**
 * Draw horizontal line.
 * @param {number} ratio Scale ratio to draw grid line.
 * @protected
 */
anychart.polarModule.Grid.prototype.drawLineCircuit = function(ratio) {
  var radius = this.iRadius_ + (this.radius_ - this.iRadius_) * ratio;
  this.lineElementInternal.circularArc(this.cx_, this.cy_, radius, radius, 0, 360);
};


/**
 * Draw vertical line.
 * @param {number} x .
 * @param {number} y .
 * @param {number} cx .
 * @param {number} cy .
 * @param {number} xPixelShift .
 * @param {number} yPixelShift .
 * @protected
 */
anychart.polarModule.Grid.prototype.drawLineRadial = function(x, y, cx, cy, xPixelShift, yPixelShift) {
  this.lineElementInternal.moveTo(x + xPixelShift, y + yPixelShift);
  this.lineElementInternal.lineTo(cx + xPixelShift, cy + yPixelShift);
};


/**
 * Draw radial line.
 * @param {number} ratio Scale ratio to draw grid interlace.
 * @param {number} prevRatio Previous yScale ratio to draw grid interlace.
 * @param {acgraph.vector.Path} element Path element to draw interlace .
 * @protected
 */
anychart.polarModule.Grid.prototype.drawInterlaceCircuit = function(ratio, prevRatio, element) {
  if (!isNaN(prevRatio)) {
    var x, y, angleRad, radius;

    radius = this.iRadius_ + (this.radius_ - this.iRadius_) * ratio;
    angleRad = goog.math.toRadians(0);
    x = Math.round(this.cx_ + radius * Math.cos(angleRad));
    y = Math.round(this.cy_ + radius * Math.sin(angleRad));
    element.moveTo(x, y);

    element.circularArc(this.cx_, this.cy_, radius, radius, 0, 360);

    radius = this.iRadius_ + (this.radius_ - this.iRadius_) * prevRatio;
    angleRad = goog.math.toRadians(360);
    x = Math.round(this.cx_ + radius * Math.cos(angleRad));
    y = Math.round(this.cy_ + radius * Math.sin(angleRad));
    element.lineTo(x, y);

    element.circularArc(this.cx_, this.cy_, radius, radius, 360, -360);

    element.close();
  }
};


/**
 * Draw angle line.
 * @param {number} angle .
 * @param {number} sweep .
 * @param {number} x .
 * @param {number} y .
 * @param {number} prevX .
 * @param {number} prevY .
 * @param {acgraph.vector.Path} element Path element to draw interlace .
 * @protected
 */
anychart.polarModule.Grid.prototype.drawInterlaceRadial = function(angle, sweep, x, y, prevX, prevY, element) {
  if (!(isNaN(prevX) && isNaN(prevY))) {
    element.circularArc(this.cx_, this.cy_, this.radius_, this.radius_, angle, -sweep);
    if (this.iRadius_) {
      element.lineTo(this.cx_ + this.iRadius_ * Math.cos(angle), this.cy_ + this.iRadius_ * Math.sin(angle));
      element.circularArc(this.cx_, this.cy_, this.iRadius_, this.iRadius_, angle - sweep, sweep);
    } else {
      element.lineTo(this.cx_, this.cy_);
    }
    element.close();
  }
};


/** @inheritDoc */
anychart.polarModule.Grid.prototype.drawInternal = function() {
  var xScale = /** @type {anychart.scales.Linear|anychart.scales.Ordinal} */(this.xScale());
  var yScale = /** @type {anychart.scales.Linear|anychart.scales.Ordinal} */(this.yScale());

  this.clearFillElements();
  this.lineElement().clear();

  var isOrdinal, ticks, ticksArray, ticksArrLen;
  /** @type {acgraph.vector.Path} */
  var path;

  var parentBounds = /** @type {anychart.math.Rect} */(this.parentBounds());
  this.radius_ = Math.min(parentBounds.width, parentBounds.height) / 2;
  this.iRadius_ = anychart.utils.normalizeSize(this.innerRadius_, this.radius_);
  if (this.iRadius_ == this.radius_) this.iRadius_--;
  this.cx_ = Math.round(parentBounds.left + parentBounds.width / 2);
  this.cy_ = Math.round(parentBounds.top + parentBounds.height / 2);

  this.lineElement().clip(parentBounds);

  var i, cx, cy;
  var startAngle = this.startAngle() - 90;

  if (this.isRadial()) {
    isOrdinal = anychart.utils.instanceOf(xScale, anychart.scales.Ordinal);
    ticks = (this.getOption('isMinor') && !isOrdinal) ? xScale.minorTicks() : xScale.ticks();
    ticksArray = ticks.get();
    ticksArrLen = ticksArray.length;
    if (!isOrdinal && xScale.transform(xScale.ticks().get()[0]) == 0 && xScale.transform(ticksArray[ticksArrLen - 1]) == 1) {
      ticksArrLen--;
    }

    var sweep = 360 / ticksArrLen;
    var angleRad, x, y, prevX = NaN, prevY = NaN, xRatio, angle;

    var stroke = this.getOption('stroke');
    var lineThickness = stroke['thickness'] ? stroke['thickness'] : 1;
    var xPixelShift, yPixelShift;
    for (i = 0; i < ticksArrLen; i++) {
      xRatio = xScale.transform(ticksArray[i]);
      angle = goog.math.standardAngle(startAngle + 360 * xRatio);
      angleRad = goog.math.toRadians(angle);

      xPixelShift = 0;
      yPixelShift = 0;
      if (!angle) {
        yPixelShift = lineThickness % 2 == 0 ? 0 : -.5;
      } else if (angle == 90) {
        xPixelShift = lineThickness % 2 == 0 ? 0 : -.5;
      } else if (angle == 180) {
        yPixelShift = lineThickness % 2 == 0 ? 0 : .5;
      } else if (angle == 270) {
        xPixelShift = lineThickness % 2 == 0 ? 0 : .5;
      }

      x = Math.round(this.cx_ + this.radius_ * Math.cos(angleRad));
      y = Math.round(this.cy_ + this.radius_ * Math.sin(angleRad));
      if (this.iRadius_) {
        cx = Math.round(this.cx_ + this.iRadius_ * Math.cos(angleRad));
        cy = Math.round(this.cy_ + this.iRadius_ * Math.sin(angleRad));
      } else {
        cx = this.cx_;
        cy = this.cy_;
      }

      if (i) {
        path = this.getFillElement(i - 1);
        this.drawInterlaceRadial(angle, sweep, x, y, prevX, prevY, path);
      }
      if (i || this.getOption('drawLastLine'))
        this.drawLineRadial(x, y, cx, cy, xPixelShift, yPixelShift);

      prevX = x;
      prevY = y;
    }

    //draw last line on ordinal
    path = this.getFillElement(i - 1);
    angle = goog.math.standardAngle(startAngle);
    angleRad = angle * Math.PI / 180;
    x = Math.round(this.cx_ + this.radius_ * Math.cos(angleRad));
    y = Math.round(this.cy_ + this.radius_ * Math.sin(angleRad));
    this.drawInterlaceRadial(angle, sweep, x, y, prevX, prevY, path);
  } else {
    isOrdinal = anychart.utils.instanceOf(yScale, anychart.scales.Ordinal);
    ticks = isOrdinal ? yScale.ticks() : this.getOption('isMinor') ? yScale.minorTicks() : yScale.ticks();
    ticksArray = ticks.get();
    ticksArrLen = ticksArray.length;

    var prevRatio = NaN;
    for (i = 0; i < ticksArrLen; i++) {
      var tickVal = ticksArray[i];
      var leftTick, rightTick;
      if (goog.isArray(tickVal)) {
        leftTick = tickVal[0];
        rightTick = tickVal[1];
      } else
        leftTick = rightTick = tickVal;

      var ratio = yScale.transform(leftTick);

      if (i != 0)
        path = this.getFillElement(i - 1);
      if (i == ticksArrLen - 1) {
        if (isOrdinal) {
          this.drawInterlaceCircuit(ratio, prevRatio, path);
          path = this.getFillElement(i - 1);
          this.drawInterlaceCircuit(yScale.transform(rightTick, 1), ratio, path);
          this.drawLineCircuit(ratio);
          if (this.getOption('drawLastLine'))
            this.drawLineCircuit(yScale.transform(rightTick, 1));
        } else {
          this.drawInterlaceCircuit(ratio, prevRatio, path);
          if (this.getOption('drawLastLine'))
            this.drawLineCircuit(ratio);
        }
      } else {
        this.drawInterlaceCircuit(ratio, prevRatio, path);
        if (i || this.iRadius_) {
          this.drawLineCircuit(ratio);
        }
      }
      prevRatio = ratio;
    }
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
 * @extends {anychart.polarModule.Grid}
 */
anychart.standalones.grids.Polar = function() {
  anychart.standalones.grids.Polar.base(this, 'constructor');
};
goog.inherits(anychart.standalones.grids.Polar, anychart.polarModule.Grid);
anychart.core.makeStandalone(anychart.standalones.grids.Polar, anychart.polarModule.Grid);


/**
 * Constructor function.
 * @return {!anychart.standalones.grids.Polar}
 */
anychart.standalones.grids.polar = function() {
  var grid = new anychart.standalones.grids.Polar();
  grid.setup(anychart.getFullTheme('standalones.polarGrid'));
  return grid;
};


//endregion
//exports
(function() {
  var proto = anychart.standalones.grids.Polar.prototype;
  goog.exportSymbol('anychart.standalones.grids.polar', anychart.standalones.grids.polar);
  proto['layout'] = proto.layout;
  proto['draw'] = proto.draw;
  proto['parentBounds'] = proto.parentBounds;
  proto['container'] = proto.container;
  proto['startAngle'] = proto.startAngle;
  proto['innerRadius'] = proto.innerRadius;
})();
