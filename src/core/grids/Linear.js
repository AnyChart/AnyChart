goog.provide('anychart.core.grids.Linear');
goog.require('acgraph');
goog.require('anychart.color');
goog.require('anychart.core.VisualBase');
goog.require('anychart.core.utils.TypedLayer');
goog.require('anychart.enums');
goog.require('anychart.utils');



/**
 * Grid.
 * @constructor
 * @extends {anychart.core.VisualBase}
 */
anychart.core.grids.Linear = function() {
  goog.base(this);

  /**
   * @type {anychart.core.utils.TypedLayer}
   * @private
   */
  this.oddFillElement_;

  /**
   * @type {anychart.core.utils.TypedLayer}
   * @private
   */
  this.evenFillElement_;

  /**
   * @type {acgraph.vector.Path}
   * @private
   */
  this.lineElement_;

  /**
   * @type {string|acgraph.vector.Fill}
   * @private
   */
  this.oddFill_ = '#FFFFFF';

  /**
   * @type {string|acgraph.vector.Fill}
   * @private
   */
  this.evenFill_ = '#F5F5F5';

  /**
   * @type {string|acgraph.vector.Stroke}
   * @private
   */
  this.stroke_ = '#C1C1C1';

  /**
   * @type {anychart.scales.Base}
   * @private
   */
  this.scale_;

  /**
   * @type {boolean}
   * @private
   */
  this.isMinor_ = false;

  /**
   * @type {anychart.enums.Layout}
   * @private
   */
  this.layout_ = anychart.enums.Layout.HORIZONTAL;

  /**
   * @type {boolean}
   * @private
   */
  this.drawFirstLine_ = true;

  /**
   * @type {boolean}
   * @private
   */
  this.drawLastLine_ = true;

  this.suspendSignalsDispatching();
  this.resumeSignalsDispatching(true);
};
goog.inherits(anychart.core.grids.Linear, anychart.core.VisualBase);


//----------------------------------------------------------------------------------------------------------------------
//  States and signals.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Supported signals.
 * @type {number}
 */
anychart.core.grids.Linear.prototype.SUPPORTED_SIGNALS =
    anychart.core.VisualBase.prototype.SUPPORTED_SIGNALS |
        anychart.Signal.BOUNDS_CHANGED;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.grids.Linear.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES |
        anychart.ConsistencyState.APPEARANCE |
        anychart.ConsistencyState.GRIDS_POSITION;


//----------------------------------------------------------------------------------------------------------------------
//  Layout.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Get/set grid layout.
 * @param {anychart.enums.Layout=} opt_value Grid layout.
 * @return {anychart.enums.Layout|anychart.core.grids.Linear} Layout or this.
 */
anychart.core.grids.Linear.prototype.layout = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var layout = anychart.enums.normalizeLayout(opt_value);
    if (this.layout_ != layout) {
      this.layout_ = layout;
      this.invalidate(anychart.ConsistencyState.GRIDS_POSITION,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.layout_;
  }
};


//----------------------------------------------------------------------------------------------------------------------
//  Scale.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter for axis scale.
 * @return {anychart.scales.Base} Axis scale.
 *//**
 * Setter for axis scale.
 * @param {anychart.scales.Base=} opt_value Value to set.
 * @return {!anychart.core.grids.Linear} {@link anychart.core.grids.Linear} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {anychart.scales.Base=} opt_value Scale.
 * @return {anychart.scales.Base|!anychart.core.grids.Linear} Axis scale or itself for method chaining.
 */
anychart.core.grids.Linear.prototype.scale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.scale_ != opt_value) {
      this.scale_ = opt_value;
      this.scale_.listenSignals(this.scaleInvalidated_, this);
      this.invalidate(anychart.ConsistencyState.GRIDS_POSITION | anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.scale_;
  }
};


/**
 * Internal scale invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.grids.Linear.prototype.scaleInvalidated_ = function(event) {
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


//----------------------------------------------------------------------------------------------------------------------
//  Bounds.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Axes lines space.
 * @param {(string|number|anychart.core.utils.Space)=} opt_spaceOrTopOrTopAndBottom Space object or top or top and bottom
 *    space.
 * @param {(string|number)=} opt_rightOrRightAndLeft Right or right and left space.
 * @param {(string|number)=} opt_bottom Bottom space.
 * @param {(string|number)=} opt_left Left space.
 * @return {!(anychart.core.VisualBase|anychart.core.utils.Padding)} .
 */
anychart.core.grids.Linear.prototype.axesLinesSpace = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
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


//----------------------------------------------------------------------------------------------------------------------
//  Settings.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Get/set grid odd fill settings.
 * @param {string|acgraph.vector.Fill=} opt_value Grid odd fill settings.
 * @return {string|acgraph.vector.Fill|anychart.core.grids.Linear} Grid odd fill settings or Grid instance for method chaining.
 */
anychart.core.grids.Linear.prototype.oddFill = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.oddFill_ != opt_value) {
      this.oddFill_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.oddFill_;
  }
};


/**
 * Get/set grid even fill settings.
 * @param {string|acgraph.vector.Fill=} opt_value Grid even fill settings.
 * @return {string|acgraph.vector.Fill|anychart.core.grids.Linear} Grid even fill settings or Grid instance for method chaining.
 */
anychart.core.grids.Linear.prototype.evenFill = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.evenFill_ != opt_value) {
      this.evenFill_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.evenFill_;
  }
};


/**
 * Get/set grid stroke line.
 * @param {string|acgraph.vector.Stroke=} opt_value Grid stroke line settings.
 * @return {string|acgraph.vector.Stroke|anychart.core.grids.Linear} Grid stroke line settings or Grid instance for method chaining.
 */
anychart.core.grids.Linear.prototype.stroke = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.stroke_ != opt_value) {
      this.stroke_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.stroke_;
  }
};


/**
 * Whether to draw the first line.
 * @param {boolean=} opt_value Whether grid should draw first line.
 * @return {boolean|anychart.core.grids.Linear} Whether grid should draw first line or Grid instance for method chaining.
 */
anychart.core.grids.Linear.prototype.drawFirstLine = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.drawFirstLine_ != opt_value) {
      this.drawFirstLine_ = opt_value;
      this.invalidate(anychart.ConsistencyState.GRIDS_POSITION,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.drawFirstLine_;
  }
};


/**
 * Whether to draw the last line.
 * @param {boolean=} opt_value Whether grid should draw last line.
 * @return {boolean|anychart.core.grids.Linear} Whether grid should draw first line or Grid instance for method chaining.
 */
anychart.core.grids.Linear.prototype.drawLastLine = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.drawLastLine_ != opt_value) {
      this.drawLastLine_ = opt_value;
      this.invalidate(anychart.ConsistencyState.GRIDS_POSITION,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.drawLastLine_;
  }
};


/**
 * Whether it is a minor grid or not.
 * @param {boolean=} opt_value Minor or not.
 * @return {boolean|anychart.core.grids.Linear} Is minor grid or Grid instance for method chaining.
 */
anychart.core.grids.Linear.prototype.isMinor = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.isMinor_ != opt_value) {
      this.isMinor_ = opt_value;
      this.invalidate(anychart.ConsistencyState.GRIDS_POSITION | anychart.ConsistencyState.APPEARANCE,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.isMinor_;
  }
};


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
anychart.core.grids.Linear.prototype.drawLineHorizontal = function(ratio, shift) {
  var parentBounds = this.parentBounds() || anychart.math.rect(0, 0, 0, 0);
  /** @type {number}*/
  var y = Math.round(parentBounds.getBottom() - ratio * parentBounds.height);
  ratio == 1 ? y -= shift : y += shift;
  this.lineElement_.moveTo(parentBounds.getLeft(), y);
  this.lineElement_.lineTo(parentBounds.getRight(), y);
};


/**
 * Draw vertical line.
 * @param {number} ratio Scale ratio to draw grid line.
 * @param {number} shift Grid line pixel shift.
 * @protected
 */
anychart.core.grids.Linear.prototype.drawLineVertical = function(ratio, shift) {
  var parentBounds = this.parentBounds() || anychart.math.rect(0, 0, 0, 0);
  /** @type {number}*/
  var x = Math.round(parentBounds.getLeft() + ratio * parentBounds.width);
  ratio == 1 ? x += shift : x -= shift;
  this.lineElement_.moveTo(x, parentBounds.getBottom());
  this.lineElement_.lineTo(x, parentBounds.getTop());
};


/**
 * Whether marker is horizontal
 * @return {boolean} If the marker is horizontal.
 */
anychart.core.grids.Linear.prototype.isHorizontal = function() {
  return this.layout_ == anychart.enums.Layout.HORIZONTAL;
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
 * @param {anychart.core.utils.TypedLayer} layer Layer to draw interlace.
 * @param {number} shift Grid line pixel shift.
 * @protected
 */
anychart.core.grids.Linear.prototype.drawInterlaceHorizontal = function(ratio, prevRatio, fillSettings, layer, shift) {
  if (!isNaN(prevRatio)) {
    var parentBounds = this.parentBounds() || anychart.math.rect(0, 0, 0, 0);
    var y1, y2, checkIndex;
    y1 = Math.round(parentBounds.getBottom() - prevRatio * parentBounds.height);
    y2 = Math.round(parentBounds.getBottom() - ratio * parentBounds.height);
    checkIndex = 1;
    ratio == checkIndex ? y2 -= shift : y2 += shift;
    prevRatio == checkIndex ? y1 -= shift : y1 += shift;

    var element = layer.genNextChild();

    element.moveTo(parentBounds.getLeft(), y1);
    element.lineTo(parentBounds.getRight(), y1);
    element.lineTo(parentBounds.getRight(), y2);
    element.lineTo(parentBounds.getLeft(), y2);
    element.close();
  }
};


/**
 * Draw horizontal line.
 * @param {number} ratio Scale ratio to draw grid interlace.
 * @param {number} prevRatio Previous scale ratio to draw grid interlace.
 * @param {string} fillSettings Interlace fill settings.
 * @param {anychart.core.utils.TypedLayer} layer Layer to draw interlace.
 * @param {number} shift Grid line pixel shift.
 * @protected
 */
anychart.core.grids.Linear.prototype.drawInterlaceVertical = function(ratio, prevRatio, fillSettings, layer, shift) {
  if (!isNaN(prevRatio)) {
    var parentBounds = this.parentBounds() || anychart.math.rect(0, 0, 0, 0);
    var x1, x2, checkIndex;
    x1 = Math.round(parentBounds.getLeft() + prevRatio * parentBounds.width);
    x2 = Math.round(parentBounds.getLeft() + ratio * parentBounds.width);
    checkIndex = 1;
    ratio == checkIndex ? x2 += shift : x2 -= shift;
    prevRatio == checkIndex ? x1 += shift : x1 -= shift;

    var element = layer.genNextChild();

    element.moveTo(x1, parentBounds.getTop());
    element.lineTo(x2, parentBounds.getTop());
    element.lineTo(x2, parentBounds.getBottom());
    element.lineTo(x1, parentBounds.getBottom());
    element.close();
  }
};


//----------------------------------------------------------------------------------------------------------------------
//  Drawing.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Drawing.
 * @return {anychart.core.grids.Linear} An instance of {@link anychart.core.grids.Linear} class for method chaining.
 */
anychart.core.grids.Linear.prototype.draw = function() {
  var scale = /** @type {anychart.scales.Linear|anychart.scales.Ordinal} */(this.scale());

  if (!scale) {
    anychart.utils.error(anychart.enums.ErrorCode.SCALE_NOT_SET);
    return this;
  }

  if (!this.checkDrawingNeeded())
    return this;

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    var zIndex = /** @type {number} */(this.zIndex());
    this.evenFillElement().zIndex(zIndex);
    this.oddFillElement().zIndex(zIndex);
    this.lineElement().zIndex(zIndex);
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    var container = /** @type {acgraph.vector.ILayer} */(this.container());
    this.evenFillElement().parent(container);
    this.oddFillElement().parent(container);
    this.lineElement().parent(container);
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.GRIDS_POSITION) ||
      this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    var layout;
    var fill;
    /** @type {anychart.core.utils.TypedLayer} */
    var layer;
    var ratio;
    var prevRatio = NaN;
    var isOrdinal = this.scale_ instanceof anychart.scales.Ordinal;
    var ticks = isOrdinal ? scale.ticks() : this.isMinor() ? scale.minorTicks() : scale.ticks();
    var ticksArray = ticks.get();

    if (this.isHorizontal()) {
      layout = [this.drawLineHorizontal, this.drawInterlaceHorizontal];
    } else {
      layout = [this.drawLineVertical, this.drawInterlaceVertical];
    }

    this.evenFillElement().clear();
    this.oddFillElement().clear();
    this.lineElement().clear();

    var bounds = this.parentBounds() || anychart.math.rect(0, 0, 0, 0);
    var axesLinesSpace = this.axesLinesSpace();
    var clip = axesLinesSpace.tightenBounds(/** @type {!anychart.math.Rect} */(bounds));

    this.evenFillElement().clip(clip);
    this.oddFillElement().clip(clip);
    this.lineElement().clip(clip);

    var drawInterlace = layout[1];
    var drawLine = layout[0];

    var pixelShift = -this.lineElement().strokeThickness() % 2 / 2;

    for (var i = 0, count = ticksArray.length; i < count; i++) {
      var tickVal = ticksArray[i];
      if (goog.isArray(tickVal)) tickVal = tickVal[0];
      ratio = scale.transform(tickVal);

      if (i % 2 == 0) {
        fill = this.evenFill_;
        layer = this.evenFillElement_;
      } else {
        fill = this.oddFill_;
        layer = this.oddFillElement_;
      }

      if (fill) {
        drawInterlace.call(this, ratio, prevRatio, fill, layer, pixelShift);
      }

      if (i == 0) {
        if (this.drawFirstLine_)
          drawLine.call(this, ratio, pixelShift);
      } else if (i == count - 1) {
        if (this.drawLastLine_ || isOrdinal)
          drawLine.call(this, ratio, pixelShift);
      } else {
        drawLine.call(this, ratio, pixelShift);
      }

      prevRatio = ratio;
    }

    //draw last line on ordinal
    if (i % 2 == 0) {
      fill = this.evenFill_;
      layer = this.evenFillElement_;
    } else {
      fill = this.oddFill_;
      layer = this.oddFillElement_;
    }

    if (isOrdinal && goog.isDef(tickVal)) {
      if (this.drawLastLine_) drawLine.call(this, 1, pixelShift);
      drawInterlace.call(this, 1, ratio, fill, layer, pixelShift);
    }

    this.markConsistent(anychart.ConsistencyState.GRIDS_POSITION);
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    this.lineElement().stroke(/** @type {acgraph.vector.Stroke} */(this.stroke()));
    this.oddFillElement().forEachChild(function(child) {
      child.fill(this.oddFill());
    }, this);

    this.evenFillElement().forEachChild(function(child) {
      child.fill(this.evenFill());
    }, this);
    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  return this;
};


//----------------------------------------------------------------------------------------------------------------------
//  Disabling & enabling.
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.grids.Linear.prototype.remove = function() {
  this.evenFillElement().parent(null);
  this.oddFillElement().parent(null);
  this.lineElement().parent(null);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Elements creation.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @return {!acgraph.vector.Path} Grid line element.
 */
anychart.core.grids.Linear.prototype.lineElement = function() {
  this.lineElement_ = this.lineElement_ ? this.lineElement_ : acgraph.path();
  this.registerDisposable(this.lineElement_);
  return this.lineElement_;
};


/**
 * @return {!anychart.core.utils.TypedLayer} Grid odd fill element.
 * @protected
 */
anychart.core.grids.Linear.prototype.oddFillElement = function() {
  this.oddFillElement_ = this.oddFillElement_ ?
      this.oddFillElement_ :
      new anychart.core.utils.TypedLayer(function() {
        var path = acgraph.path();
        path.stroke('none');
        path.zIndex(this.zIndex_);
        return path;
      }, function(child) {
        child.clear();
      }, undefined, this);
  this.registerDisposable(this.oddFillElement_);

  return this.oddFillElement_;
};


/**
 * @return {!anychart.core.utils.TypedLayer} Grid event fill element.
 * @protected
 */
anychart.core.grids.Linear.prototype.evenFillElement = function() {
  this.evenFillElement_ = this.evenFillElement_ ?
      this.evenFillElement_ :
      new anychart.core.utils.TypedLayer(function() {
        var path = acgraph.path();
        path.stroke('none');
        path.zIndex(this.zIndex_);
        return path;
      }, function(child) {
        child.clear();
      }, undefined, this);
  this.registerDisposable(this.evenFillElement_);

  return this.evenFillElement_;
};


//----------------------------------------------------------------------------------------------------------------------
//  Serialize & Deserialize
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.grids.Linear.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  json['isMinor'] = this.isMinor();
  json['layout'] = this.layout();
  json['drawFirstLine'] = this.drawFirstLine();
  json['drawLastLine'] = this.drawLastLine();
  json['oddFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill} */(this.oddFill()));
  json['evenFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill} */(this.evenFill()));
  json['stroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke} */(this.stroke()));
  return json;
};


/** @inheritDoc */
anychart.core.grids.Linear.prototype.setupByJSON = function(config) {
  goog.base(this, 'setupByJSON', config);
  this.isMinor(config['isMinor']);
  this.layout(config['layout']);
  this.drawFirstLine(config['drawFirstLine']);
  this.drawLastLine(config['drawLastLine']);
  this.oddFill(config['oddFill']);
  this.evenFill(config['evenFill']);
  this.stroke(config['stroke']);
};


//----------------------------------------------------------------------------------------------------------------------
//  Disposing.
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.grids.Linear.prototype.disposeInternal = function() {
  delete this.stroke_;
  goog.base(this, 'disposeInternal');
};


//exports
anychart.core.grids.Linear.prototype['isMinor'] = anychart.core.grids.Linear.prototype.isMinor;
anychart.core.grids.Linear.prototype['oddFill'] = anychart.core.grids.Linear.prototype.oddFill;
anychart.core.grids.Linear.prototype['evenFill'] = anychart.core.grids.Linear.prototype.evenFill;
anychart.core.grids.Linear.prototype['layout'] = anychart.core.grids.Linear.prototype.layout;
anychart.core.grids.Linear.prototype['isHorizontal'] = anychart.core.grids.Linear.prototype.isHorizontal;
anychart.core.grids.Linear.prototype['scale'] = anychart.core.grids.Linear.prototype.scale;
anychart.core.grids.Linear.prototype['stroke'] = anychart.core.grids.Linear.prototype.stroke;
anychart.core.grids.Linear.prototype['drawFirstLine'] = anychart.core.grids.Linear.prototype.drawFirstLine;
anychart.core.grids.Linear.prototype['drawLastLine'] = anychart.core.grids.Linear.prototype.drawLastLine;
