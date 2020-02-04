goog.provide('anychart.radarModule.Grid');
goog.provide('anychart.standalones.grids.Radar');
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
anychart.radarModule.Grid = function() {
  anychart.radarModule.Grid.base(this, 'constructor');
};
goog.inherits(anychart.radarModule.Grid, anychart.radarPolarBaseModule.Grid);


//region --- Drawing
/**
 * Draw horizontal line.
 * @param {number} ratio Scale ratio to draw grid line.
 * @protected
 */
anychart.radarModule.Grid.prototype.drawLineCircuit = function(ratio) {
  var xScaleTicks = this.xScale().ticks().get();
  var xScaleTicksCount = xScaleTicks.length;
  if (xScaleTicksCount != 0) {
    var radius = this.iRadius_ + (this.radius_ - this.iRadius_) * ratio;

    var startAngle = /** @type {number} */(this.getOption('startAngle')) - 90;

    var x, y, angleRad, xRatio, angle;
    for (var i = 0; i < xScaleTicksCount; i++) {
      xRatio = this.xScale().transform(xScaleTicks[i]);
      angle = goog.math.standardAngle(startAngle + 360 * xRatio);
      angleRad = goog.math.toRadians(angle);

      x = Math.round(this.cx_ + radius * Math.cos(angleRad));
      y = Math.round(this.cy_ + radius * Math.sin(angleRad));

      if (!i)
        this.lineElementInternal.moveTo(x, y);
      else
        this.lineElementInternal.lineTo(x, y);

    }
    angle = goog.math.standardAngle(startAngle);
    angleRad = goog.math.toRadians(angle);
    x = Math.round(this.cx_ + radius * Math.cos(angleRad));
    y = Math.round(this.cy_ + radius * Math.sin(angleRad));

    this.lineElementInternal.lineTo(x, y);
  }
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
anychart.radarModule.Grid.prototype.drawLineRadial = function(x, y, cx, cy, xPixelShift, yPixelShift) {
  this.lineElementInternal.moveTo(x + xPixelShift, y + yPixelShift);
  this.lineElementInternal.lineTo(cx, cy);
};


/**
 * Draw radial line.
 * @param {number} ratio Scale ratio to draw grid interlace.
 * @param {number} prevRatio Previous yScale ratio to draw grid interlace.
 * @param {acgraph.vector.Path} element Path element to draw interlace .
 * @protected
 */
anychart.radarModule.Grid.prototype.drawInterlaceCircuit = function(ratio, prevRatio, element) {
  if (!isNaN(prevRatio)) {
    var xScaleTicks = this.xScale().ticks().get();
    var xScaleTicksCount = xScaleTicks.length;

    if (xScaleTicksCount != 0) {
      var x, y, angleRad, i, radius, angle, xRatio;
      var startAngle = /** @type {number} */(this.getOption('startAngle')) - 90;
      radius = this.iRadius_ + (this.radius_ - this.iRadius_) * ratio;
      for (i = 0; i < xScaleTicksCount; i++) {
        xRatio = this.xScale().transform(xScaleTicks[i]);
        angle = goog.math.standardAngle(startAngle + 360 * xRatio);
        angleRad = goog.math.toRadians(angle);

        x = Math.round(this.cx_ + radius * Math.cos(angleRad));
        y = Math.round(this.cy_ + radius * Math.sin(angleRad));

        if (!i)
          element.moveTo(x, y);
        else
          element.lineTo(x, y);
      }
      angle = goog.math.standardAngle(startAngle);
      angleRad = goog.math.toRadians(angle);
      x = Math.round(this.cx_ + radius * Math.cos(angleRad));
      y = Math.round(this.cy_ + radius * Math.sin(angleRad));
      element.lineTo(x, y);


      radius = this.iRadius_ + (this.radius_ - this.iRadius_) * prevRatio;
      x = Math.round(this.cx_ + radius * Math.cos(angleRad));
      y = Math.round(this.cy_ + radius * Math.sin(angleRad));
      element.lineTo(x, y);

      for (i = xScaleTicksCount - 1; i >= 0; i--) {
        xRatio = this.xScale().transform(xScaleTicks[i]);
        angle = goog.math.standardAngle(startAngle + 360 * xRatio);
        angleRad = goog.math.toRadians(angle);

        x = Math.round(this.cx_ + radius * Math.cos(angleRad));
        y = Math.round(this.cy_ + radius * Math.sin(angleRad));

        element.lineTo(x, y);
      }

      element.close();
    }
  }
};


/**
 * Draw angle line.
 * @param {number} x .
 * @param {number} y .
 * @param {number} cx .
 * @param {number} cy .
 * @param {number} prevX .
 * @param {number} prevY .
 * @param {acgraph.vector.Path} element Path element to draw interlace .
 * @protected
 */
anychart.radarModule.Grid.prototype.drawInterlaceRadial = function(x, y, cx, cy, prevX, prevY, element) {
  if (!(isNaN(prevX) && isNaN(prevY))) {
    element.moveTo(x, y);
    element.lineTo(cx, cy);
    element.lineTo(prevX, prevY);
    element.close();
  }
};


/** @inheritDoc */
anychart.radarModule.Grid.prototype.drawInternal = function() {
  var xScale = /** @type {anychart.scales.Ordinal} */(this.xScale());
  var yScale = /** @type {anychart.scales.Linear|anychart.scales.Ordinal} */(this.yScale());

  this.clearFillElements();
  this.lineElement().clear();

  var isOrdinal, ticks, ticksArray, ticksArrLen;
  /** @type {acgraph.vector.Path} */
  var path;

  var parentBounds = /** @type {anychart.math.Rect} */(this.parentBounds());
  this.radius_ = Math.min(parentBounds.width, parentBounds.height) / 2;
  this.iRadius_ = anychart.utils.normalizeSize(/** @type {number} */(this.getOption('innerRadius')), this.radius_);
  if (this.iRadius_ == this.radius_) this.iRadius_--;
  this.cx_ = Math.round(parentBounds.left + parentBounds.width / 2);
  this.cy_ = Math.round(parentBounds.top + parentBounds.height / 2);

  this.lineElement().clip(parentBounds);

  var i, ratio, cx, cy;
  var startAngle = /** @type {number} */(this.getOption('startAngle')) - 90;

  if (this.isRadial()) {
    ticks = xScale.ticks();
    ticksArray = ticks.get();
    ticksArrLen = ticksArray.length;

    var angleRad, x, y, prevX = NaN, prevY = NaN, angle;
    var stroke = this.getOption('stroke');
    var lineThickness = stroke['thickness'] ? stroke['thickness'] : 1;
    var xPixelShift, yPixelShift;
    for (i = 0; i < ticksArrLen; i++) {
      ratio = xScale.transform(ticksArray[i]);
      angle = goog.math.standardAngle(startAngle + 360 * ratio);
      angleRad = angle * Math.PI / 180;

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
        this.drawInterlaceRadial(x, y, cx, cy, prevX, prevY, path);
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
    if (this.iRadius_) {
      cx = Math.round(this.cx_ + this.iRadius_ * Math.cos(angleRad));
      cy = Math.round(this.cy_ + this.iRadius_ * Math.sin(angleRad));
    } else {
      cx = this.cx_;
      cy = this.cy_;
    }
    this.drawInterlaceRadial(x, y, cx, cy, prevX, prevY, path);
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

      ratio = yScale.transform(leftTick);

      if (i)
        path = this.getFillElement(i - 1);
      if (i == ticksArrLen - 1) {
        if (isOrdinal) {
          this.drawInterlaceCircuit(ratio, prevRatio, path);
          path = this.getFillElement(i);
          this.drawInterlaceCircuit(yScale.transform(rightTick, 1), ratio, path);
          this.drawLineCircuit(ratio);
          if (this.getOption('drawLastLine')) this.drawLineCircuit(yScale.transform(rightTick, 1));
        } else {
          this.drawInterlaceCircuit(ratio, prevRatio, path);
          if (this.getOption('drawLastLine')) this.drawLineCircuit(ratio);
        }
      } else {
        this.drawInterlaceCircuit(ratio, prevRatio, path);
        if (i || this.iRadius_)
          this.drawLineCircuit(ratio);
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
 * @extends {anychart.radarModule.Grid}
 */
anychart.standalones.grids.Radar = function() {
  anychart.standalones.grids.Radar.base(this, 'constructor');
};
goog.inherits(anychart.standalones.grids.Radar, anychart.radarModule.Grid);
anychart.core.makeStandalone(anychart.standalones.grids.Radar, anychart.radarModule.Grid);


/**
 * Constructor function.
 * @return {!anychart.standalones.grids.Radar}
 */
anychart.standalones.grids.radar = function() {
  var grid = new anychart.standalones.grids.Radar();
  grid.addThemes('standalones.radarGrid');
  return grid;
};


//endregion
//region --- Exports
(function() {
  var proto = anychart.standalones.grids.Radar.prototype;
  goog.exportSymbol('anychart.standalones.grids.radar', anychart.standalones.grids.radar);
  proto['layout'] = proto.layout;
  proto['draw'] = proto.draw;
  proto['parentBounds'] = proto.parentBounds;
  proto['container'] = proto.container;
  //auto from radarPolarBaseModule.Grid
  //proto['startAngle'] = proto.startAngle;
  //proto['innerRadius'] = proto.innerRadius;
})();
//endregion
