goog.provide('anychart.core.GridWithOneDimension');
goog.require('acgraph');
goog.require('anychart.color');
goog.require('anychart.core.GridBase');
goog.require('anychart.core.IStandaloneBackend');
goog.require('anychart.core.VisualBase');
goog.require('anychart.core.reporting');
goog.require('anychart.core.utils.Padding');
goog.require('anychart.enums');
goog.require('anychart.scales');



/**
 * Grid.
 * @constructor
 * @extends {anychart.core.GridBase}
 * @implements {anychart.core.IStandaloneBackend}
 */
anychart.core.GridWithOneDimension = function() {
  anychart.core.GridWithOneDimension.base(this, 'constructor');

  /**
   * @type {acgraph.vector.Path}
   * @protected
   */
  this.lineElementInternal = null;

  /**
   * Assigned axis.
   * @type {anychart.core.Axis}
   * @private
   */
  this.axis_ = null;

  /**
   * @type {anychart.enums.Layout}
   */
  this.defaultLayout_ = anychart.enums.Layout.HORIZONTAL;

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['isMinor', anychart.ConsistencyState.GRIDS_POSITION | anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED]
  ]);
};
goog.inherits(anychart.core.GridWithOneDimension, anychart.core.GridBase);


//region --- Optimized props descriptors
/**
 * Simple properties descriptors.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.GridWithOneDimension.prototype.SIMPLE_PROPS_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = anychart.core.GridBase.prototype.SIMPLE_PROPS_DESCRIPTORS;

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'isMinor',
      anychart.core.settings.asIsNormalizer);

  return map;
})();
anychart.core.settings.populate(anychart.core.GridWithOneDimension, anychart.core.GridWithOneDimension.prototype.SIMPLE_PROPS_DESCRIPTORS);


//endregion
//region --- Layout
/**
 * Get/set grid layout.
 * @param {anychart.enums.Layout=} opt_value Grid layout.
 * @return {anychart.enums.Layout|anychart.core.GridWithOneDimension} Layout or this.
 */
anychart.core.GridWithOneDimension.prototype.layout = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var layout = anychart.enums.normalizeLayout(opt_value);
    if (this.layout_ != layout) {
      this.layout_ = layout;
      this.invalidate(anychart.ConsistencyState.GRIDS_POSITION,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else if (this.layout_) {
    return this.layout_;
  } else if (this.axis_) {
    var axisOrientation = this.axis_.orientation();
    var isHorizontal = (axisOrientation == anychart.enums.Orientation.LEFT || axisOrientation == anychart.enums.Orientation.RIGHT);
    return isHorizontal ? anychart.enums.Layout.HORIZONTAL : anychart.enums.Layout.VERTICAL;
  } else {
    return this.defaultLayout_;
  }
};


/**
 * Set default layout.
 * @param {anychart.enums.Layout} value - Layout value.
 */
anychart.core.GridWithOneDimension.prototype.setDefaultLayout = function(value) {
  var needInvalidate = !this.layout_ && this.defaultLayout_ != value;
  this.defaultLayout_ = value;
  if (needInvalidate) this.invalidate(anychart.ConsistencyState.GRIDS_POSITION);
};


//endregion
//region --- infrastructure
/**
 * Sets the entry series belongs to.
 * @param {anychart.core.SeparateChart} chart Chart instance.
 */
anychart.core.GridWithOneDimension.prototype.setParentElement = function(chart) {
  this.parentElement_ = chart;
};


/**
 * Get the chart series belongs to.
 * @return {anychart.core.SeparateChart}
 */
anychart.core.GridWithOneDimension.prototype.getParentElement = function() {
  return this.parentElement_;
};


/**
 * Getter/setter for scale.
 * @param {anychart.scales.Base=} opt_value Scale.
 * @return {anychart.scales.Base|!anychart.core.GridWithOneDimension} Axis scale or itself for method chaining.
 */
anychart.core.GridWithOneDimension.prototype.scale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.scale_ != opt_value) {
      this.scale_ = opt_value;
      this.scale_.listenSignals(this.scaleInvalidated, this);
      this.invalidate(anychart.ConsistencyState.GRIDS_POSITION | anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    if (this.scale_) {
      return this.scale_;
    } else {
      if (this.axis_)
        return /** @type {?anychart.scales.Base} */ (this.axis_.scale());
      return null;
    }
  }
};


/**
 * Internal scale invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @protected
 */
anychart.core.GridWithOneDimension.prototype.scaleInvalidated = function(event) {
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


/**
 * Sets axis.
 * @param {anychart.core.Axis=} opt_value - Value to be set.
 * @return {(anychart.core.Axis|anychart.core.GridWithOneDimension)} - Current value or itself for method chaining.
 */
anychart.core.GridWithOneDimension.prototype.axis = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.axis_ != opt_value) {
      if (this.axis_) this.axis_.unlistenSignals(this.axisInvalidated_, this);
      this.axis_ = opt_value;
      this.axis_.listenSignals(this.axisInvalidated_, this);
      this.invalidate(anychart.ConsistencyState.GRIDS_POSITION,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.axis_;
};


/**
 * Axis invalidation handler.
 * @param {anychart.SignalEvent} event - Event object.
 * @private
 */
anychart.core.GridWithOneDimension.prototype.axisInvalidated_ = function(event) {
  this.invalidate(anychart.ConsistencyState.GRIDS_POSITION | anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
};


/**
 * Axes lines space.
 * @param {(string|number|anychart.core.utils.Space)=} opt_spaceOrTopOrTopAndBottom Space object or top or top and bottom
 *    space.
 * @param {(string|number)=} opt_rightOrRightAndLeft Right or right and left space.
 * @param {(string|number)=} opt_bottom Bottom space.
 * @param {(string|number)=} opt_left Left space.
 * @return {!(anychart.core.VisualBase|anychart.core.utils.Padding)} .
 */
anychart.core.GridWithOneDimension.prototype.axesLinesSpace = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  if (!this.axesLinesSpace_) {
    this.axesLinesSpace_ = new anychart.core.utils.Padding();
    this.registerDisposable(this.axesLinesSpace_);
  }

  if (goog.isDef(opt_spaceOrTopOrTopAndBottom)) {
    this.axesLinesSpace_.setup.apply(this.axesLinesSpace_, arguments);
    return this;
  } else {
    return this.axesLinesSpace_;
  }
};


/**
 * Whether marker is horizontal
 * @return {boolean} If the marker is horizontal.
 */
anychart.core.GridWithOneDimension.prototype.isHorizontal = function() {
  return this.layout() == anychart.enums.Layout.HORIZONTAL;
};


//endregion
//region --- Elements creation
/** @inheritDoc */
anychart.core.GridWithOneDimension.prototype.lineElement = function() {
  this.lineElementInternal = this.lineElementInternal ? this.lineElementInternal : acgraph.path().parent(this.rootLayer);
  this.registerDisposable(this.lineElementInternal);
  return this.lineElementInternal;
};


//endregion
//region --- Drawing
/**
 * Draw horizontal line.
 * @param {number} ratio Scale ratio to draw grid line.
 * @param {number} shift Grid line pixel shift.
 * @protected
 */
anychart.core.GridWithOneDimension.prototype.drawLineHorizontal = function(ratio, shift) {
  var parentBounds = this.parentBounds() || anychart.math.rect(0, 0, 0, 0);
  /** @type {number}*/
  var y = Math.round(parentBounds.getBottom() - ratio * parentBounds.height);
  ratio == 1 ? y -= shift : y += shift;
  this.lineElementInternal.moveTo(parentBounds.getLeft(), y);
  this.lineElementInternal.lineTo(parentBounds.getRight(), y);
};


/**
 * Draw vertical line.
 * @param {number} ratio Scale ratio to draw grid line.
 * @param {number} shift Grid line pixel shift.
 * @protected
 */
anychart.core.GridWithOneDimension.prototype.drawLineVertical = function(ratio, shift) {
  var parentBounds = this.parentBounds() || anychart.math.rect(0, 0, 0, 0);
  /** @type {number}*/
  var x = Math.round(parentBounds.getLeft() + ratio * parentBounds.width);
  ratio == 1 ? x += shift : x -= shift;
  this.lineElementInternal.moveTo(x, parentBounds.getBottom());
  this.lineElementInternal.lineTo(x, parentBounds.getTop());
};


/**
 * Draw horizontal line.
 * @param {number} ratio Scale ratio to draw grid interlace.
 * @param {number} prevRatio Previous scale ratio to draw grid interlace.
 * @param {acgraph.vector.Path} path Layer to draw interlace.
 * @param {number} shift Grid line pixel shift.
 * @protected
 */
anychart.core.GridWithOneDimension.prototype.drawInterlaceHorizontal = function(ratio, prevRatio, path, shift) {
  if (!isNaN(prevRatio)) {
    var parentBounds = this.parentBounds() || anychart.math.rect(0, 0, 0, 0);
    var y1 = Math.round(parentBounds.getBottom() - prevRatio * parentBounds.height);
    prevRatio == 1 ? y1 -= shift : y1 += shift;

    var y2 = Math.round(parentBounds.getBottom() - ratio * parentBounds.height);
    ratio == 1 ? y2 -= shift : y2 += shift;


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
anychart.core.GridWithOneDimension.prototype.drawInterlaceVertical = function(ratio, prevRatio, path, shift) {
  if (!isNaN(prevRatio)) {
    var parentBounds = this.parentBounds() || anychart.math.rect(0, 0, 0, 0);
    var x1 = Math.round(parentBounds.getLeft() + prevRatio * parentBounds.width);
    prevRatio == 1 ? x1 += shift : x1 -= shift;

    var x2 = Math.round(parentBounds.getLeft() + ratio * parentBounds.width);
    ratio == 1 ? x2 += shift : x2 -= shift;


    path.moveTo(x1, parentBounds.getTop());
    path.lineTo(x2, parentBounds.getTop());
    path.lineTo(x2, parentBounds.getBottom());
    path.lineTo(x1, parentBounds.getBottom());
    path.close();
  }
};


/**
 * Drawing.
 * @return {anychart.core.GridWithOneDimension} An instance of {@link anychart.core.GridWithOneDimension} class for method chaining.
 */
anychart.core.GridWithOneDimension.prototype.draw = function() {
  var scale = /** @type {anychart.scales.Linear|anychart.scales.Ordinal} */(this.scale());

  if (!scale) {
    anychart.core.reporting.error(anychart.enums.ErrorCode.SCALE_NOT_SET);
    return this;
  }

  if (!this.checkDrawingNeeded())
    return this;

  if (!this.rootLayer) {
    this.rootLayer = acgraph.layer();
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    var zIndex = /** @type {number} */(this.zIndex());
    this.rootLayer.zIndex(zIndex);
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    var container = /** @type {acgraph.vector.ILayer} */(this.container());
    this.rootLayer.parent(container);
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    this.lineElement().stroke(/** @type {acgraph.vector.Stroke} */(this.stroke()));
    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.GRIDS_POSITION) ||
      this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    var layout;
    var path;
    var ratio;
    var prevRatio = NaN;
    var isOrdinal = this.scale() instanceof anychart.scales.Ordinal;
    var ticks = isOrdinal ? scale.ticks() : this.getOption('isMinor') ? scale.minorTicks() : scale.ticks();
    var ticksArray = ticks.get();

    if (this.isHorizontal()) {
      layout = [this.drawLineHorizontal, this.drawInterlaceHorizontal];
    } else {
      layout = [this.drawLineVertical, this.drawInterlaceVertical];
    }

    this.clearFillElements();
    this.lineElement().clear();

    var bounds = this.parentBounds() || anychart.math.rect(0, 0, 0, 0);
    var mode3d = this.parentElement_ && this.parentElement_.isMode3d();
    if (mode3d) {
      this.x3dShift = this.getChart().x3dShift;
      this.y3dShift = this.getChart().y3dShift;

      var strokeThickness = acgraph.vector.getThickness(/** @type {acgraph.vector.Stroke} */(this.stroke())) / 2;
      bounds.top -= this.y3dShift + strokeThickness;
      bounds.height += this.y3dShift + strokeThickness;
      bounds.width += this.x3dShift;
    }
    var axesLinesSpace = this.axesLinesSpace();
    var clip = axesLinesSpace.tightenBounds(/** @type {!anychart.math.Rect} */(bounds));

    this.lineElement().clip(clip);

    var drawInterlace = layout[1];
    var drawLine = layout[0];

    var pixelShift = -this.lineElement().strokeThickness() % 2 / 2;

    // zeroTick
    if (mode3d && this.isHorizontal()) {
      drawLine.call(this, 0, pixelShift);
    }

    for (var i = 0, count = ticksArray.length; i < count; i++) {
      var tickVal = ticksArray[i];
      if (goog.isArray(tickVal)) tickVal = tickVal[0];
      ratio = scale.transform(tickVal);

      path = this.getFillElement(i);
      if (path) {
        drawInterlace.call(this, ratio, prevRatio, path, pixelShift);
      }

      if (!i) {
        if (this.getOption('drawFirstLine'))
          drawLine.call(this, ratio, pixelShift);
      } else if (i == count - 1) {
        if (this.getOption('drawLastLine') || isOrdinal)
          drawLine.call(this, ratio, pixelShift);
      } else {
        drawLine.call(this, ratio, pixelShift);
      }

      prevRatio = ratio;
    }

    if (isOrdinal && goog.isDef(tickVal)) {
      if (this.getOption('drawLastLine')) drawLine.call(this, 1, pixelShift);
      path = this.getFillElement(i);
      if (path) {
        drawInterlace.call(this, 1, ratio, path, pixelShift);
      }
    }

    this.markConsistent(anychart.ConsistencyState.GRIDS_POSITION);
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  return this;
};


//endregion
//region --- Serialize & Deserialize

/** @inheritDoc */
anychart.core.GridWithOneDimension.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.GridWithOneDimension.base(this, 'setupByJSON', config, opt_default);
  if ('axis' in config) {
    var ax = config['axis'];
    if (goog.isNumber(ax)) {
      if (this.parentElement_) {
        this.axis((/** @type {anychart.core.CartesianBase} */(this.parentElement_)).getAxisByIndex(ax));
      }
    } else if (ax instanceof anychart.core.Axis) {
      this.axis(ax);
    }
  }
};


//----------------------------------------------------------------------------------------------------------------------
//  Disposing.
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.GridWithOneDimension.prototype.disposeInternal = function() {
  this.axis_ = null;
  this.parentElement_ = null;

  anychart.core.GridWithOneDimension.base(this, 'disposeInternal');
};


//endregion
//region --- Exports
(function() {
  var proto = anychart.core.GridWithOneDimension.prototype;
  // proto['isMinor'] = proto.isMinor;
  proto['isHorizontal'] = proto.isHorizontal;
  proto['scale'] = proto.scale;
  proto['axis'] = proto.axis;
})();
//endregion
