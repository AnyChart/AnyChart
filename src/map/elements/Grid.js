//region --- Requiring and Providing
goog.provide('anychart.mapModule.elements.Grid');

goog.require('acgraph');
goog.require('anychart.core.VisualBase');
goog.require('anychart.core.reporting');
goog.require('anychart.core.settings');
goog.require('anychart.enums');
//endregion



/**
 * Map axes settings.
 * @extends {anychart.core.VisualBase}
 * @implements {anychart.core.settings.IResolvable}
 * @constructor
 */
anychart.mapModule.elements.Grid = function() {
  anychart.mapModule.elements.Grid.base(this, 'constructor');

  delete this.themeSettings['enabled'];

  /**
   * Parent title.
   * @type {anychart.mapModule.elements.GridSettings}
   * @private
   */
  this.parent_ = null;

  /**
   * @type {acgraph.vector.Path}
   * @private
   */
  this.oddFillElement_ = null;

  /**
   * @type {acgraph.vector.Path}
   * @private
   */
  this.evenFillElement_ = null;

  /**
   * @type {acgraph.vector.Path}
   * @protected
   */
  this.lineElementInternal = null;

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

  /**
   * @type {anychart.enums.Layout}
   * @private
   */
  this.layout_;

  /**
   * Resolution chain cache.
   * @type {?Array.<Object|null|undefined>}
   * @private
   */
  this.resolutionChainCache_ = null;

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['stroke', anychart.ConsistencyState.APPEARANCE],
    ['minorStroke', anychart.ConsistencyState.APPEARANCE],
    ['oddFill', anychart.ConsistencyState.APPEARANCE],
    ['evenFill', anychart.ConsistencyState.APPEARANCE],
    ['drawFirstLine', anychart.ConsistencyState.GRIDS_POSITION],
    ['drawLastLine', anychart.ConsistencyState.GRIDS_POSITION]
  ]);
};
goog.inherits(anychart.mapModule.elements.Grid, anychart.core.VisualBase);


//region --- Internal properties
/**
 * Supported signals.
 * @type {number}
 */
anychart.mapModule.elements.Grid.prototype.SUPPORTED_SIGNALS =
    anychart.core.VisualBase.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.ENABLED_STATE_CHANGED |
    anychart.Signal.Z_INDEX_STATE_CHANGED;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.mapModule.elements.Grid.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.GRIDS_POSITION;


//endregion
//region --- IObjectWithSettings overrides
/**
 * @override
 * @param {string} name
 * @return {*}
 */
anychart.mapModule.elements.Grid.prototype.getOption = anychart.core.settings.getOption;


/** @inheritDoc */
anychart.mapModule.elements.Grid.prototype.getSignal = function(fieldName) {
  // all properties invalidates with NEEDS_REDRAW;
  return anychart.Signal.NEEDS_REDRAW;
};


//endregion
//region --- IResolvable implementation
/** @inheritDoc */
anychart.mapModule.elements.Grid.prototype.resolutionChainCache = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.resolutionChainCache_ = opt_value;
  }
  return this.resolutionChainCache_;
};


/** @inheritDoc */
anychart.mapModule.elements.Grid.prototype.getResolutionChain = anychart.core.settings.getResolutionChain;


/** @inheritDoc */
anychart.mapModule.elements.Grid.prototype.getLowPriorityResolutionChain = function() {
  var sett = [this.themeSettings];
  if (this.parent_) {
    sett = goog.array.concat(sett, this.parent_.getLowPriorityResolutionChain());
  }
  return sett;
};


/** @inheritDoc */
anychart.mapModule.elements.Grid.prototype.getHighPriorityResolutionChain = function() {
  var sett = [this.ownSettings];
  if (this.parent_) {
    sett = goog.array.concat(sett, this.parent_.getHighPriorityResolutionChain());
  }
  return sett;
};


//endregion
//region --- Parental relations
/**
 * Gets/sets new parent.
 * @param {anychart.mapModule.elements.GridSettings=} opt_value - Value to set.
 * @return {anychart.mapModule.elements.GridSettings|anychart.mapModule.elements.Grid} - Current value or itself for method chaining.
 */
anychart.mapModule.elements.Grid.prototype.parent = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.parent_ != opt_value) {
      if (this.parent_)
        this.parent_.unlistenSignals(this.parentInvalidated_, this);
      this.parent_ = opt_value;
      if (this.parent_)
        this.parent_.listenSignals(this.parentInvalidated_, this);
    }
    return this;
  }
  return this.parent_;
};


/**
 * Parent invalidation handler.
 * @param {anychart.SignalEvent} e - Signal event.
 * @private
 */
anychart.mapModule.elements.Grid.prototype.parentInvalidated_ = function(e) {
  var state = 0;
  var signal = 0;

  if (e.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state |= anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.GRIDS_POSITION;
    signal |= anychart.Signal.NEEDS_REDRAW;
  }

  if (e.hasSignal(anychart.Signal.ENABLED_STATE_CHANGED)) {
    state |= anychart.ConsistencyState.ENABLED;
    signal |= anychart.Signal.NEEDS_REDRAW;
  }


  if (e.hasSignal(anychart.Signal.Z_INDEX_STATE_CHANGED)) {
    state |= anychart.ConsistencyState.Z_INDEX;
    signal |= anychart.Signal.NEEDS_REDRAW;
  }

  this.resolutionChainCache_ = null;

  this.invalidate(state, signal);
};


//endregion
//region --- Optimized props descriptors
/**
 * Simple properties descriptors.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.mapModule.elements.Grid.prototype.SIMPLE_PROPS_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'stroke',
      anychart.core.settings.strokeNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'minorStroke',
      anychart.core.settings.strokeNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'oddFill',
      anychart.core.settings.fillNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'evenFill',
      anychart.core.settings.fillNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'drawFirstLine',
      anychart.core.settings.booleanNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'drawLastLine',
      anychart.core.settings.booleanNormalizer);

  return map;
})();
anychart.core.settings.populate(anychart.mapModule.elements.Grid, anychart.mapModule.elements.Grid.prototype.SIMPLE_PROPS_DESCRIPTORS);


//endregion
//region --- Settings
/**
 * Get/set grid layout.
 * @param {anychart.enums.Layout=} opt_value Grid layout.
 * @return {anychart.enums.Layout|anychart.mapModule.elements.Grid} Layout or this.
 */
anychart.mapModule.elements.Grid.prototype.layout = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.layout_ = opt_value;
    return this;
  } else {
    return this.layout_;
  }
};


/**
 * Setter for scale.
 * @param {anychart.mapModule.scales.Geo} value Scale.
 * @return {anychart.mapModule.elements.Grid} .
 */
anychart.mapModule.elements.Grid.prototype.setScale = function(value) {
  if (this.scale_ != value) {
    this.scale_ = value;
    this.scale_.listenSignals(this.scaleInvalidated_, this);
    this.invalidate(anychart.ConsistencyState.GRIDS_POSITION | anychart.ConsistencyState.BOUNDS,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
  }
  return this;
};


/**
 * Internal scale invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.mapModule.elements.Grid.prototype.scaleInvalidated_ = function(event) {
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
//----------------------------------------------------------------------------------------------------------------------
//
//  Elements creation.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Creates/gets line element.
 * @param {boolean} isMajor .
 * @return {!acgraph.vector.Path} Grid line element.
 */
anychart.mapModule.elements.Grid.prototype.lineElement = function(isMajor) {
  var lineElement = isMajor ? this.lineElementInternal : this.minorLineElementInternal;

  if (!lineElement) {
    if (isMajor) {
      lineElement = this.lineElementInternal = /** @type {acgraph.vector.Path} */(acgraph.path());
    } else {
      lineElement = this.minorLineElementInternal = /** @type {acgraph.vector.Path} */(acgraph.path());
    }
    lineElement.disablePointerEvents(true).disableStrokeScaling(true);
    this.registerDisposable(lineElement);
  }
  return /** @type {!acgraph.vector.Path} */(lineElement);
};


/**
 * @return {!acgraph.vector.Path} Grid odd fill element.
 * @protected
 */
anychart.mapModule.elements.Grid.prototype.oddFillElement = function() {
  if (!this.oddFillElement_) {
    this.oddFillElement_ = acgraph.path();
    this.oddFillElement_.stroke('none');
    this.registerDisposable(this.oddFillElement_);
  }

  return this.oddFillElement_;
};


/**
 * @return {!acgraph.vector.Path} Grid event fill element.
 * @protected
 */
anychart.mapModule.elements.Grid.prototype.evenFillElement = function() {
  if (!this.evenFillElement_) {
    this.evenFillElement_ = acgraph.path();
    this.evenFillElement_.stroke('none');
    this.registerDisposable(this.evenFillElement_);
  }

  return this.evenFillElement_;
};


//endregion
//region --- Interactivity
/**
 * Update grid on zoom or move.
 * @param {goog.math.AffineTransform} tx .
 */
anychart.mapModule.elements.Grid.prototype.updateOnZoomOrMove = function(tx) {
  if (this.rootLayer_)
    this.rootLayer_.setTransformationMatrix(tx.getScaleX(), tx.getShearX(), tx.getShearY(), tx.getScaleY(), tx.getTranslateX(), tx.getTranslateY());
};


//endregion
//region --- Drawing
/**
 * Draw horizontal line.
 * @param {number} value Tick value to draw grid line.
 * @param {acgraph.vector.Path} line Line element for drawing.
 * @param {number} shift Grid line pixel shift.
 * @param {number} precision Grid precision.
 * @protected
 */
anychart.mapModule.elements.Grid.prototype.drawLineHorizontal = function(value, line, shift, precision) {
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
anychart.mapModule.elements.Grid.prototype.drawLineVertical = function(value, line, shift, precision) {
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
 * Whether marker is horizontal
 * @return {boolean} If the marker is horizontal.
 */
anychart.mapModule.elements.Grid.prototype.isHorizontal = function() {
  return this.layout() == anychart.enums.Layout.HORIZONTAL;
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
anychart.mapModule.elements.Grid.prototype.drawInterlaceHorizontal = function(value, prevValue, fillSettings, path, shift, precision) {
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
anychart.mapModule.elements.Grid.prototype.drawInterlaceVertical = function(value, prevValue, fillSettings, path, shift, precision) {
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
anychart.mapModule.elements.Grid.prototype.remove = function() {
  if (this.rootLayer_) this.rootLayer_.parent(null);
};


/**
 * Drawing
 * @return {anychart.mapModule.elements.Grid}
 */
anychart.mapModule.elements.Grid.prototype.draw = function() {
  var scale = /** @type {anychart.mapModule.scales.Geo} */(this.scale_);

  if (!scale) {
    anychart.core.reporting.error(anychart.enums.ErrorCode.SCALE_NOT_SET);
    return this;
  }

  if (!this.checkDrawingNeeded())
    return this;

  var majorLineElement = this.lineElement(true);
  var minorLineElement = this.lineElement(false);

  if (!this.rootLayer_) {
    this.rootLayer_ = acgraph.layer();
    this.evenFillElement().parent(this.rootLayer_);
    this.oddFillElement().parent(this.rootLayer_);
    majorLineElement.parent(this.rootLayer_).zIndex(1);
    minorLineElement.parent(this.rootLayer_).zIndex(0);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    var zIndex = /** @type {number} */(this.zIndex());
    this.rootLayer_.zIndex(zIndex);
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    var container = /** @type {acgraph.vector.ILayer} */(this.container());
    this.rootLayer_.parent(container);
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    majorLineElement.stroke(/** @type {acgraph.vector.Stroke} */(this.getOption('stroke')));
    minorLineElement.stroke(/** @type {acgraph.vector.Stroke} */(this.getOption('minorStroke')));
    this.oddFillElement().fill(/** @type {acgraph.vector.Fill} */(this.getOption('oddFill')));
    this.evenFillElement().fill(/** @type {acgraph.vector.Fill} */(this.getOption('evenFill')));
    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.GRIDS_POSITION) ||
      this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    var layout, fill, path, ticks, minorTicks, tickVal;
    var prevTickVal = NaN;
    var pixelShift, i, count, scaleMaximum;
    var precision = scale.precision();
    if (this.isHorizontal()) {
      ticks = scale.yTicks();
      minorTicks = scale.yMinorTicks();
      precision = precision[0];
      scaleMaximum = /** @type {number} */(scale.maximumY());
      layout = [this.drawLineHorizontal, this.drawInterlaceHorizontal];
    } else {
      ticks = scale.xTicks();
      minorTicks = scale.xMinorTicks();
      precision = precision[1];
      scaleMaximum = /** @type {number} */(scale.maximumX());
      layout = [this.drawLineVertical, this.drawInterlaceVertical];
    }

    var ticksArray = ticks.get();
    var minorTicksArray = minorTicks.get();

    this.evenFillElement().clear();
    this.oddFillElement().clear();
    majorLineElement.clear();
    minorLineElement.clear();

    var drawLine = layout[0];
    var drawInterlace = layout[1];

    pixelShift = -majorLineElement.strokeThickness() % 2 / 2;

    for (i = 0, count = ticksArray.length; i < count; i++) {
      tickVal = ticksArray[i];

      if (i % 2 == 0) {
        fill = this.getOption('evenFill');
        path = this.evenFillElement_;
      } else {
        fill = this.getOption('oddFill');
        path = this.oddFillElement_;
      }

      drawInterlace.call(this, tickVal, prevTickVal, fill, path, pixelShift, precision);

      if ((!i && this.getOption('drawFirstLine')) || (i == count - 1 && this.getOption('drawLastLine')) || (i != 0 && i != count - 1)) {
        drawLine.call(this, tickVal, majorLineElement, pixelShift, precision);
      }

      prevTickVal = tickVal;
    }

    if (tickVal != scaleMaximum) {
      //draw last interlace if last scale tick is not scale maximum
      if (i % 2 == 0) {
        fill = this.getOption('evenFill');
        path = this.evenFillElement_;
      } else {
        fill = this.getOption('oddFill');
        path = this.oddFillElement_;
      }

      drawInterlace.call(this, scaleMaximum, prevTickVal, fill, path, pixelShift);
    }

    pixelShift = -majorLineElement.strokeThickness() % 2 / 2;

    for (i = 0, count = minorTicksArray.length; i < count; i++) {
      tickVal = minorTicksArray[i];
      drawLine.call(this, tickVal, minorLineElement, pixelShift, precision);
    }

    this.markConsistent(anychart.ConsistencyState.GRIDS_POSITION);
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  return this;
};


//endregion
//region --- Serialization
/**
 * Sets default settings.
 * @param {!Object} config
 */
anychart.mapModule.elements.Grid.prototype.setThemeSettings = function(config) {
  anychart.core.settings.copy(this.themeSettings, this.SIMPLE_PROPS_DESCRIPTORS, config);
};


/** @inheritDoc */
anychart.mapModule.elements.Grid.prototype.serialize = function() {
  var json = anychart.mapModule.elements.Grid.base(this, 'serialize');
  anychart.core.settings.serialize(this, this.SIMPLE_PROPS_DESCRIPTORS, json, 'Map grids props');
  return json;
};


/** @inheritDoc */
anychart.mapModule.elements.Grid.prototype.setupByJSON = function(config, opt_default) {
  anychart.mapModule.elements.Grid.base(this, 'setupByJSON', config, opt_default);

  if (opt_default) {
    this.setThemeSettings(config);
  } else {
    anychart.core.settings.deserialize(this, this.SIMPLE_PROPS_DESCRIPTORS, config);
  }
};


//----------------------------------------------------------------------------------------------------------------------
//  Disposing.
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.mapModule.elements.Grid.prototype.disposeInternal = function() {
  this.axis_ = null;
  this.chart_ = null;
  anychart.mapModule.elements.Grid.base(this, 'disposeInternal');
};


//endregion
//region --- Exports
//exports
// (function() {
  // var proto = anychart.mapModule.elements.Grid.prototype;
  // proto['zIndex'] = proto.zIndex;
  // proto['stroke'] = proto.stroke;
  // proto['minorStroke'] = proto.minorStroke;
  // proto['drawFirstLine'] = proto.drawFirstLine;
  // proto['drawLastLine'] = proto.drawLastLine;
  // proto['oddFill'] = proto.oddFill;
  // proto['evenFill'] = proto.evenFill;
// })();
//endregion
