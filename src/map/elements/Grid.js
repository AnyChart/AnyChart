//region --- Requiring and Providing
goog.provide('anychart.mapModule.elements.Grid');

goog.require('acgraph');
goog.require('anychart.core.GridBase');
goog.require('anychart.core.reporting');
goog.require('anychart.core.settings');
goog.require('anychart.enums');
//endregion



/**
 * Map axes settings.
 * @extends {anychart.core.GridBase}
 * @constructor
 */
anychart.mapModule.elements.Grid = function() {
  anychart.mapModule.elements.Grid.base(this, 'constructor');

  /**
   * @type {acgraph.vector.Path}
   * @protected
   */
  this.minorLineElementInternal = null;

  /**
   * @type {anychart.mapModule.scales.Geo}
   * @private
   */
  this.scale_ = null;

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['minorStroke', anychart.ConsistencyState.APPEARANCE]
  ]);
};
goog.inherits(anychart.mapModule.elements.Grid, anychart.core.GridBase);


//region --- Optimized props descriptors
/**
 * Simple properties descriptors.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.mapModule.elements.Grid.prototype.SIMPLE_PROPS_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = anychart.core.GridBase.prototype.SIMPLE_PROPS_DESCRIPTORS;

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'minorStroke',
      anychart.core.settings.strokeNormalizer);

  return map;
})();
anychart.core.settings.populate(anychart.mapModule.elements.Grid, anychart.mapModule.elements.Grid.prototype.SIMPLE_PROPS_DESCRIPTORS);


//endregion
//region --- Settings
/** @inheritDoc */
anychart.mapModule.elements.Grid.prototype.scale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.scale_ != opt_value) {
      if (this.scale_)
        this.scale_.unlistenSignals(this.scaleInvalidated, this);
      this.scale_ = /** @type {anychart.mapModule.scales.Geo} */(opt_value);
      if (this.scale_)
        this.scale_.listenSignals(this.scaleInvalidated, this);
      this.invalidate(anychart.ConsistencyState.GRIDS_POSITION | anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
  }
  return /** @type {?anychart.mapModule.scales.Geo} */(this.scale_ || this.axis_ && this.axis_.scale() || null);
};


/** @inheritDoc */
anychart.mapModule.elements.Grid.prototype.scaleInvalidated = function(event) {
  var signal = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION))
    signal |= anychart.Signal.NEEDS_RECALCULATION;
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION))
    signal |= anychart.Signal.NEEDS_REDRAW;

  var state = anychart.ConsistencyState.BOUNDS |
      anychart.ConsistencyState.APPEARANCE;

  this.invalidate(state, signal);
};


//endregion
//region --- Elements creation
/** @inheritDoc */
anychart.mapModule.elements.Grid.prototype.lineElement = function(opt_isMajor) {
  var lineElement = opt_isMajor ? this.lineElementInternal : this.minorLineElementInternal;

  if (!lineElement) {
    if (opt_isMajor) {
      lineElement = this.lineElementInternal = /** @type {acgraph.vector.Path} */(acgraph.path());
      lineElement.zIndex(1);
    } else {
      lineElement = this.minorLineElementInternal = /** @type {acgraph.vector.Path} */(acgraph.path());
      lineElement.zIndex(0);
    }
    lineElement.disablePointerEvents(true).disableStrokeScaling(true);
    lineElement.parent(this.rootLayer);
  }
  return /** @type {!acgraph.vector.Path} */(lineElement);
};


/** @inheritDoc */
anychart.mapModule.elements.Grid.prototype.createFillElement = function() {
  var path = acgraph.path();
  path
      .parent(/** @type {acgraph.vector.ILayer} */(this.rootLayer))
      .zIndex(3)
      .stroke('none');
  return path;
};


//endregion
//region --- Interactivity
/**
 * Update grid on zoom or move.
 * @param {goog.math.AffineTransform} tx .
 */
anychart.mapModule.elements.Grid.prototype.updateOnZoomOrMove = function(tx) {
  if (this.rootLayer)
    this.rootLayer.setTransformationMatrix(tx.getScaleX(), tx.getShearX(), tx.getShearY(), tx.getScaleY(), tx.getTranslateX(), tx.getTranslateY());
};


//endregion
//region --- Drawing
/** @inheritDoc */
anychart.mapModule.elements.Grid.prototype.beforeDraw = function() {
  if (!this.rootLayer)
    this.rootLayer = acgraph.layer();
};


/** @inheritDoc */
anychart.mapModule.elements.Grid.prototype.applyContainer = function() {
  var container = /** @type {acgraph.vector.ILayer} */(this.container());
  this.rootLayer.parent(container);
};


/** @inheritDoc */
anychart.mapModule.elements.Grid.prototype.applyZIndex = function() {
  var zIndex = /** @type {number} */(this.zIndex());
  this.rootLayer.zIndex(zIndex);
};


/**
 * Draw horizontal line.
 * @param {number} value Tick value to draw grid line.
 * @param {acgraph.vector.Path} line Line element for drawing.
 * @param {number} shift Grid line pixel shift.
 * @param {number} precision Grid precision.
 * @protected
 */
anychart.mapModule.elements.Grid.prototype.drawLineLongitude = function(value, line, shift, precision) {
  var scale = this.scale_;
  var xy;

  var minimumX = /** @type {number} */(scale.minimumX());
  var maximumX = /** @type {number} */(scale.maximumX());

  // shift = value == maximumX ? -shift : shift;

  if (anychart.mapModule.projections.isBaseProjection(scale.tx['default'].crs)) {
    xy = scale.transform(minimumX, value, null);
    line.moveTo(xy[0], xy[1]);
    xy = scale.transform(maximumX, value, null);
    line.lineTo(xy[0], xy[1]);
  } else {
    var currLong = minimumX;
    while (currLong < maximumX) {
      xy = scale.transform(currLong, value, null);
      if (currLong == minimumX) {
        line.moveTo(xy[0], xy[1]);
      } else {
        line.lineTo(xy[0], xy[1]);
      }
      currLong += precision;
    }
    xy = scale.transform(maximumX, value, null);
    line.lineTo(xy[0], xy[1]);
  }
};


/**
 * Draw vertical line.
 * @param {number} value Tick value to draw grid line.
 * @param {acgraph.vector.Path} line Line element for drawing.
 * @param {number} shift Grid line pixel shift.
 * @param {number} precision Grid precision.
 * @protected
 */
anychart.mapModule.elements.Grid.prototype.drawLineLatitude = function(value, line, shift, precision) {
  var scale = this.scale_;
  var xy;

  var minimumY = /** @type {number} */(scale.minimumY());
  var maximumY = /** @type {number} */(scale.maximumY());

  // shift = value == maximumY ? shift : -shift;
  if (anychart.mapModule.projections.isBaseProjection(scale.tx['default'].crs)) {
    xy = scale.transform(value, minimumY, null);
    line.moveTo(xy[0], xy[1]);
    xy = scale.transform(value, maximumY, null);
    line.lineTo(xy[0], xy[1]);
  } else {
    var currLat = minimumY;
    while (currLat < maximumY) {
      xy = scale.transform(value, currLat, null);
      if (currLat == minimumY) {
        line.moveTo(xy[0], xy[1]);
      } else {
        line.lineTo(xy[0], xy[1]);
      }
      currLat += precision;
    }
    xy = scale.transform(value, maximumY, null);
    line.lineTo(xy[0], xy[1]);
  }
};


/**
 * Draw horizontal line.
 * @param {number} value Tick value to draw grid interlace.
 * @param {number} prevValue Previous tick value to draw grid interlace.
 * @param {string} fillSettings Interlace fill settings.
 * @param {acgraph.vector.Path} path Layer to draw interlace.
 * @param {number} shift Grid line pixel shift.
 * @param {number} precision Grid precision.
 * @protected
 */
anychart.mapModule.elements.Grid.prototype.drawInterlaceLongitude = function(value, prevValue, fillSettings, path, shift, precision) {
  var scale = this.scale_;

  var minimumX = /** @type {number} */(scale.minimumX());
  var maximumX = /** @type {number} */(scale.maximumX());
  var minimumY = /** @type {number} */(scale.minimumY());

  if (isNaN(prevValue) && value != minimumY) {
    prevValue = minimumY;
  }

  if (!isNaN(prevValue)) {
    var xy, currLong, currLat;

    // shift = value == maximumX ? -shift : shift;
    // var prevShift = prevValue == maximumX ? -shift : shift;

    if (anychart.mapModule.projections.isBaseProjection(scale.tx['default'].crs)) {
      xy = scale.transform(minimumX, value, null);
      path.moveTo(xy[0], xy[1]);
      xy = scale.transform(maximumX, value, null);
      path.lineTo(xy[0], xy[1]);

      xy = scale.transform(maximumX, value, null);
      path.lineTo(xy[0], xy[1]);
      xy = scale.transform(maximumX, prevValue, null);
      path.lineTo(xy[0], xy[1]);

      xy = scale.transform(maximumX, prevValue, null);
      path.lineTo(xy[0], xy[1]);
      xy = scale.transform(minimumX, prevValue, null);
      path.lineTo(xy[0], xy[1]);

      xy = scale.transform(minimumX, prevValue, null);
      path.lineTo(xy[0], xy[1]);
      xy = scale.transform(minimumX, value, null);
      path.lineTo(xy[0], xy[1]);
      path.close();
    } else {
      currLong = minimumX;
      while (currLong < maximumX) {
        xy = scale.transform(currLong, value, null);
        if (currLong == minimumX) {
          path.moveTo(xy[0], xy[1]);
        } else {
          path.lineTo(xy[0], xy[1]);
        }
        currLong += precision;
      }
      xy = scale.transform(maximumX, value, null);
      path.lineTo(xy[0], xy[1]);


      currLat = value;
      while (currLat > prevValue) {
        xy = scale.transform(maximumX, currLat, null);
        path.lineTo(xy[0], xy[1]);
        currLat -= precision;
      }
      xy = scale.transform(maximumX, prevValue, null);
      path.lineTo(xy[0], xy[1]);


      currLong = maximumX;
      while (currLong > minimumX) {
        xy = scale.transform(currLong, prevValue, null);
        path.lineTo(xy[0], xy[1]);
        currLong -= precision;
      }
      xy = scale.transform(minimumX, prevValue, null);
      path.lineTo(xy[0], xy[1]);


      currLat = prevValue;
      while (currLat < value) {
        xy = scale.transform(minimumX, currLat, null);
        path.lineTo(xy[0], xy[1]);
        currLat += precision;
      }
      xy = scale.transform(minimumX, value, null);
      path.lineTo(xy[0], xy[1]);
      path.close();
    }
  }
};


/**
 * Draw horizontal line.
 * @param {number} value Tick value to draw grid interlace.
 * @param {number} prevValue Previous tick value to draw grid interlace.
 * @param {string} fillSettings Interlace fill settings.
 * @param {acgraph.vector.Path} path Layer to draw interlace.
 * @param {number} shift Grid line pixel shift.
 * @param {number} precision Grid precision.
 * @protected
 */
anychart.mapModule.elements.Grid.prototype.drawInterlaceLatitude = function(value, prevValue, fillSettings, path, shift, precision) {
  var scale = this.scale_;

  var minimumX = /** @type {number} */(scale.minimumX());
  var minimumY = /** @type {number} */(scale.minimumY());
  var maximumY = /** @type {number} */(scale.maximumY());

  if (isNaN(prevValue) && value != minimumX) {
    prevValue = minimumX;
  }

  if (!isNaN(prevValue)) {
    var xy, currLong, currLat;

    // shift = value == maximumY ? shift : -shift;
    // var prevShift = prevValue == maximumY ? shift : -shift;

    if (anychart.mapModule.projections.isBaseProjection(scale.tx['default'].crs)) {
      xy = scale.transform(prevValue, minimumY, null);
      path.moveTo(xy[0], xy[1]);
      xy = scale.transform(value, minimumY, null);
      path.lineTo(xy[0], xy[1]);

      xy = scale.transform(value, minimumY, null);
      path.lineTo(xy[0], xy[1]);
      xy = scale.transform(value, maximumY, null);
      path.lineTo(xy[0], xy[1]);

      xy = scale.transform(value, maximumY, null);
      path.lineTo(xy[0], xy[1]);
      xy = scale.transform(prevValue, maximumY, null);
      path.lineTo(xy[0], xy[1]);

      xy = scale.transform(prevValue, maximumY, null);
      path.lineTo(xy[0], xy[1]);
      xy = scale.transform(prevValue, minimumY, null);
      path.lineTo(xy[0], xy[1]);
      path.close();
    } else {
      currLong = prevValue;
      while (currLong < value) {
        xy = scale.transform(currLong, minimumY, null);
        if (currLong == prevValue) {
          path.moveTo(xy[0], xy[1]);
        } else {
          path.lineTo(xy[0], xy[1]);
        }
        currLong += precision;
      }
      xy = scale.transform(value, minimumY, null);
      path.lineTo(xy[0], xy[1]);


      currLat = minimumY;
      while (currLat < maximumY) {
        xy = scale.transform(value, currLat, null);
        path.lineTo(xy[0], xy[1]);
        currLat += precision;
      }
      xy = scale.transform(value, maximumY, null);
      path.lineTo(xy[0], xy[1]);


      currLong = value;
      while (currLong > prevValue) {
        xy = scale.transform(currLong, maximumY, null);
        path.lineTo(xy[0], xy[1]);
        currLong -= precision;
      }
      xy = scale.transform(prevValue, maximumY, null);
      path.lineTo(xy[0], xy[1]);


      currLat = maximumY;
      while (currLat > minimumY) {
        xy = scale.transform(prevValue, currLat);
        path.lineTo(xy[0], xy[1]);
        currLat -= precision;
      }
      xy = scale.transform(prevValue, minimumY, null);
      path.lineTo(xy[0], xy[1]);
      path.close();
    }
  }
};


/** @inheritDoc */
anychart.mapModule.elements.Grid.prototype.applyAppearance = function() {
  this.lineElement(true).stroke(/** @type {acgraph.vector.Stroke} */(this.getOption('stroke')));
  this.lineElement(false).stroke(/** @type {acgraph.vector.Stroke} */(this.getOption('minorStroke')));
};


/** @inheritDoc */
anychart.mapModule.elements.Grid.prototype.remove = function() {
  if (this.rootLayer) this.rootLayer.parent(null);
};


/** @inheritDoc */
anychart.mapModule.elements.Grid.prototype.drawInternal = function() {
  var scale = /** @type {anychart.mapModule.scales.Geo} */(this.scale_);

  var majorLineElement = this.lineElement(true);
  var minorLineElement = this.lineElement(false);

  if (this.hasInvalidationState(anychart.ConsistencyState.GRIDS_POSITION) ||
      this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    var layout, path, ticks, minorTicks, tickVal;
    var prevTickVal = NaN;
    var pixelShift, i, count, scaleMaximum;
    var precision = scale.precision();
    if (this.isHorizontal()) {
      ticks = scale.yTicks();
      minorTicks = scale.yMinorTicks();
      precision = precision[0];
      scaleMaximum = /** @type {number} */(scale.maximumY());
      layout = [this.drawLineLongitude, this.drawInterlaceLongitude];
    } else {
      ticks = scale.xTicks();
      minorTicks = scale.xMinorTicks();
      precision = precision[1];
      scaleMaximum = /** @type {number} */(scale.maximumX());
      layout = [this.drawLineLatitude, this.drawInterlaceLatitude];
    }

    var ticksArray = ticks.get();
    var minorTicksArray = minorTicks.get();

    this.clearFillElements();

    majorLineElement.clear();
    minorLineElement.clear();

    var drawLine = layout[0];
    var drawInterlace = layout[1];

    pixelShift = -majorLineElement.strokeThickness() % 2 / 2;

    for (i = 0, count = ticksArray.length; i < count; i++) {
      tickVal = ticksArray[i];

      if (i) {
        path = this.getFillElement(i - 1);
        if (path)
          drawInterlace.call(this, tickVal, prevTickVal, null, path, pixelShift, precision);
      }

      if ((!i && this.getOption('drawFirstLine')) || (i == count - 1 && this.getOption('drawLastLine')) || (i != 0 && i != count - 1)) {
        drawLine.call(this, tickVal, majorLineElement, pixelShift, precision);
      }

      prevTickVal = tickVal;
    }

    if (tickVal != scaleMaximum) {
      path = this.getFillElement(i - 1);
      if (path)
        drawInterlace.call(this, scaleMaximum, prevTickVal, null, path, pixelShift);
    }

    pixelShift = -majorLineElement.strokeThickness() % 2 / 2;

    for (i = 0, count = minorTicksArray.length; i < count; i++) {
      tickVal = minorTicksArray[i];
      drawLine.call(this, tickVal, minorLineElement, pixelShift, precision);
    }

    this.markConsistent(anychart.ConsistencyState.GRIDS_POSITION);
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }
};


//endregion
//region --- Exports
//exports
// (function() {
//   var proto = anychart.mapModule.elements.Grid.prototype;
  // proto['minorStroke'] = proto.minorStroke;
// })();
//endregion
//region Dispose
/** @inheritDoc */
anychart.mapModule.elements.Grid.prototype.disposeInternal = function() {
  goog.disposeAll(this.lineElementInternal, this.minorLineElementInternal);
  this.lineElementInternal = null;
  this.minorLineElementInternal = null;
  anychart.mapModule.elements.Grid.base(this, 'disposeInternal');
};


//endregion
