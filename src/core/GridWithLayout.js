goog.provide('anychart.core.GridWithLayout');
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
anychart.core.GridWithLayout = function() {
  anychart.core.GridWithLayout.base(this, 'constructor');

  /**
   * @type {acgraph.vector.Path}
   * @protected
   */
  this.lineElementInternal = null;

  /**
   * @type {anychart.enums.Layout|anychart.enums.RadialGridLayout}
   * @protected
   */
  this.defaultLayout = anychart.enums.Layout.HORIZONTAL;

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['isMinor', anychart.ConsistencyState.GRIDS_POSITION | anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED]
  ]);
};
goog.inherits(anychart.core.GridWithLayout, anychart.core.GridBase);


//region --- Optimized props descriptors
/**
 * Simple properties descriptors.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.GridWithLayout.prototype.SIMPLE_PROPS_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = anychart.core.GridBase.prototype.SIMPLE_PROPS_DESCRIPTORS;

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'isMinor',
      anychart.core.settings.asIsNormalizer);

  return map;
})();
anychart.core.settings.populate(anychart.core.GridWithLayout, anychart.core.GridWithLayout.prototype.SIMPLE_PROPS_DESCRIPTORS);


//endregion
//region --- Layout
/**
 * Get/set grid layout.
 * @param {(anychart.enums.Layout|anychart.enums.RadialGridLayout)=} opt_value Grid layout.
 * @return {(anychart.enums.RadialGridLayout|anychart.enums.Layout|anychart.core.GridWithLayout)} Layout or this.
 */
anychart.core.GridWithLayout.prototype.layout = function(opt_value) {
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
    return this.defaultLayout;
  }
};


/**
 * Set default layout.
 * @param {anychart.enums.Layout|anychart.enums.RadialGridLayout} value - Layout value.
 */
anychart.core.GridWithLayout.prototype.setDefaultLayout = function(value) {
  var needInvalidate = !this.layout_ && this.defaultLayout != value;
  this.defaultLayout = value;
  if (needInvalidate) this.invalidate(anychart.ConsistencyState.GRIDS_POSITION);
};


//endregion
//region --- infrastructure
/**
 * Sets the entry series belongs to.
 * @param {anychart.core.IChart|anychart.core.IPlot} chart Chart instance.
 */
anychart.core.GridWithLayout.prototype.setParentElement = function(chart) {
  this.parentElement_ = chart;
};


/**
 * Get the chart series belongs to.
 * @return {anychart.core.IChart|anychart.core.IPlot}
 */
anychart.core.GridWithLayout.prototype.getParentElement = function() {
  return this.parentElement_;
};


/**
 * Getter/setter for scale.
 * @param {anychart.scales.IXScale=} opt_value Scale.
 * @return {anychart.scales.IXScale|!anychart.core.GridWithLayout} Axis scale or itself for method chaining.
 */
anychart.core.GridWithLayout.prototype.scale = function(opt_value) {
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
anychart.core.GridWithLayout.prototype.scaleInvalidated = goog.nullFunction;


/**
 * Sets axis.
 * @param {anychart.core.IAxis=} opt_value - Value to be set.
 * @return {(anychart.core.IAxis|anychart.core.GridWithLayout)} - Current value or itself for method chaining.
 */
anychart.core.GridWithLayout.prototype.axis = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.axis_ != opt_value) {
      if (this.axis_) this.axis_.unlistenSignals(this.axisInvalidated, this);
      this.axis_ = opt_value;
      this.axis_.listenSignals(this.axisInvalidated, this);
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
 * @protected
 */
anychart.core.GridWithLayout.prototype.axisInvalidated = function(event) {
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
anychart.core.GridWithLayout.prototype.axesLinesSpace = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
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
anychart.core.GridWithLayout.prototype.isHorizontal = function() {
  return this.layout() == anychart.enums.Layout.HORIZONTAL;
};


//endregion
//region --- Elements creation
/** @inheritDoc */
anychart.core.GridWithLayout.prototype.lineElement = function() {
  this.lineElementInternal = this.lineElementInternal ? this.lineElementInternal : acgraph.path().parent(this.rootLayer);
  this.registerDisposable(this.lineElementInternal);
  return this.lineElementInternal;
};


//endregion
//region --- Drawing
/**
 * Check scale available.
 * @return {boolean}
 */
anychart.core.GridWithLayout.prototype.checkScale = function() {
  var scale = /** @type {anychart.scales.Linear|anychart.scales.Ordinal} */(this.scale());

  if (!scale)
    anychart.core.reporting.error(anychart.enums.ErrorCode.SCALE_NOT_SET);

  return !!scale;
};


/**
 * Draw horizontal line.
 * @param {number} ratio Scale ratio to draw grid line.
 * @param {number} shift Grid line pixel shift.
 * @protected
 */
anychart.core.GridWithLayout.prototype.drawLineHorizontal = goog.abstractMethod;


/**
 * Draw vertical line.
 * @param {number} ratio Scale ratio to draw grid line.
 * @param {number} shift Grid line pixel shift.
 * @protected
 */
anychart.core.GridWithLayout.prototype.drawLineVertical = goog.abstractMethod;


/**
 * Draw horizontal line.
 * @param {number} ratio Scale ratio to draw grid interlace.
 * @param {number} prevRatio Previous scale ratio to draw grid interlace.
 * @param {acgraph.vector.Path} path Layer to draw interlace.
 * @param {number} shift Grid line pixel shift.
 * @protected
 */
anychart.core.GridWithLayout.prototype.drawInterlaceHorizontal = goog.abstractMethod;


/**
 * Draw horizontal line.
 * @param {number} ratio Scale ratio to draw grid interlace.
 * @param {number} prevRatio Previous scale ratio to draw grid interlace.
 * @param {acgraph.vector.Path} path Layer to draw interlace.
 * @param {number} shift Grid line pixel shift.
 * @protected
 */
anychart.core.GridWithLayout.prototype.drawInterlaceVertical = goog.abstractMethod;


/**
 * Grid lines and interlace drawing.
 */
anychart.core.GridWithLayout.prototype.drawInternal = function() {
  var scale = /** @type {anychart.scales.Linear|anychart.scales.Ordinal} */(this.scale());

  var layout;
  var path;
  var ratio;
  var prevRatio = NaN;
  var isOrdinal = scale instanceof anychart.scales.Ordinal;
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

    if (i) {
      path = this.getFillElement(i - 1);
      if (path) {
        drawInterlace.call(this, ratio, prevRatio, path, pixelShift);
      }
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
};


/**
 * Drawing.
 * @return {anychart.core.GridWithLayout} An instance of {@link anychart.core.GridWithLayout} class for method chaining.
 */
anychart.core.GridWithLayout.prototype.draw = function() {
  if (!this.checkScale() || !this.checkDrawingNeeded())
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

  if (this.hasInvalidationState(anychart.ConsistencyState.GRIDS_POSITION | anychart.ConsistencyState.BOUNDS)) {
    this.drawInternal();
    this.markConsistent(anychart.ConsistencyState.GRIDS_POSITION | anychart.ConsistencyState.BOUNDS);
  }

  return this;
};


//endregion
//region --- Serialize & Deserialize

/** @inheritDoc */
anychart.core.GridWithLayout.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.GridWithLayout.base(this, 'setupByJSON', config, opt_default);
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
anychart.core.GridWithLayout.prototype.disposeInternal = function() {
  this.axis_ = null;
  this.parentElement_ = null;

  anychart.core.GridWithLayout.base(this, 'disposeInternal');
};


//endregion
//region --- Exports
// (function() {
//   var proto = anychart.core.GridWithLayout.prototype;
//   proto['isMinor'] = proto.isMinor;
// })();
//endregion
