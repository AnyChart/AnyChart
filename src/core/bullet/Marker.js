goog.provide('anychart.core.bullet.Marker');

goog.require('anychart.core.VisualBase');
goog.require('anychart.core.reporting');
goog.require('anychart.enums');
goog.require('anychart.utils');



/**
 * Bullet marker.
 * @constructor
 * @extends {anychart.core.VisualBase}
 */
anychart.core.bullet.Marker = function() {
  anychart.core.bullet.Marker.base(this, 'constructor');

  /**
   * Gap for bullet marker.
   * @type {number|string|null}
   * @private
   */
  this.gap_ = null;

  /**
   * Value for bullet marker.
   * @type {number}
   * @private
   */
  this.value_ = NaN;

  /**
   * Layout of marker.
   * @type {anychart.enums.Layout}
   * @private
   */
  this.layout_;

  /**
   * @type {anychart.enums.Layout}
   * @private
   */
  this.defaultLayout_;

  /**
   * Type for bullet marker.
   * @type {anychart.enums.BulletMarkerType}
   * @private
   */
  this.type_;

  /**
   * @type {anychart.enums.BulletMarkerType}
   * @private
   */
  this.defaultType_;

  /**
   * Fill of bullet marker.
   * @type {acgraph.vector.Fill}
   * @private
   */
  this.fill_;


  /**
   * @type {acgraph.vector.Fill}
   * @private
   */
  this.defaultFill_ = 'black';

  /**
   * Stroke of bullet marker.
   * @type {acgraph.vector.Stroke}
   * @private
   */
  this.stroke_;

  /**
   * @type {acgraph.vector.Stroke}
   * @private
   */
  this.defaultStroke_ = 'black';
};
goog.inherits(anychart.core.bullet.Marker, anychart.core.VisualBase);


/**
 * Default gaps for different type of bullet marker type.
 * @enum {string}
 */
anychart.core.bullet.Marker.DEFAULT_GAP_BY_TYPE = {
  'x': '30%',
  'line': '30%',
  'ellipse': '30%',
  'bar': '50%'
};


//----------------------------------------------------------------------------------------------------------------------
//  States and signals.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Supported signals.
 * @type {number}
 */
anychart.core.bullet.Marker.prototype.SUPPORTED_SIGNALS =
    anychart.core.VisualBase.prototype.SUPPORTED_SIGNALS; // NEEDS_REDRAW, BOUNDS_CHANGED


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.bullet.Marker.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES | // ENABLED, CONTAINER, Z_INDEX
    anychart.ConsistencyState.BOUNDS |
    anychart.ConsistencyState.APPEARANCE;


/**
 * Getter/setter for bullet marker type value.
 * @param {(string|anychart.enums.BulletMarkerType)=} opt_value [{@link anychart.enums.BulletMarkerType}.BAR] Type value.
 * @return {(anychart.enums.BulletMarkerType|anychart.core.bullet.Marker)}
 */
anychart.core.bullet.Marker.prototype.type = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var type = anychart.enums.normalizeBulletMarkerType(opt_value);
    if (this.type_ != type) {
      this.type_ = type;
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.type_ || this.defaultType_;
};


/**
 * Set default Bullet Marker type.
 * @param {anychart.enums.BulletMarkerType} value Default type value.
 */
anychart.core.bullet.Marker.prototype.setDefaultType = function(value) {
  var needInvalidate = !this.type_ && this.defaultType_ != value;
  this.defaultType_ = value;
  if (needInvalidate)
    this.invalidate(anychart.ConsistencyState.BOUNDS);
};


/**
 * Getter/setter for bullet marker gap value.
 * @param {(number|string)=} opt_value ['50%'] Gap value.
 * @return {(number|string|anychart.core.bullet.Marker)}
 */
anychart.core.bullet.Marker.prototype.gap = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.gap_ != opt_value) {
      this.gap_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return goog.isNull(this.gap_) ? anychart.core.bullet.Marker.DEFAULT_GAP_BY_TYPE[this.type()] : this.gap_;
  }
};


/**
 * Getter/setter for bullet marker value.
 * @param {(number|string)=} opt_value [NaN] Value of bullet marker.
 * @return {number|string|anychart.core.bullet.Marker} Bullet marker value or itself for chaining call.
 */
anychart.core.bullet.Marker.prototype.value = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var value = anychart.utils.toNumber(opt_value);
    if (this.value_ != value) {
      this.value_ = value;
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.value_;
};


/**
 * Get/set layout.
 * @param {anychart.enums.Layout=} opt_value [{@link anychart.enums.Layout}.VERTICAL] BulletMarker layout.
 * @return {anychart.enums.Layout|anychart.core.bullet.Marker} Bullet marker layout or self for method chaining.
 */
anychart.core.bullet.Marker.prototype.layout = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var layout = anychart.enums.normalizeLayout(opt_value);
    if (this.layout_ != layout) {
      this.layout_ = layout;
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.layout_ || this.defaultLayout_;
  }
};


/**
 * Set Bullet Marker default layout value.
 * @param {anychart.enums.Layout} value Default layout value.
 */
anychart.core.bullet.Marker.prototype.setDefaultLayout = function(value) {
  var needInvalidate = !this.layout_ && this.defaultLayout_ != value;
  this.defaultLayout_ = value;
  if (needInvalidate)
    this.invalidate(anychart.ConsistencyState.BOUNDS);
};


/**
 * Checks for horizontal layout.
 * @return {boolean} Is layout horizontal.
 */
anychart.core.bullet.Marker.prototype.isHorizontal = function() {
  return this.layout() == anychart.enums.Layout.HORIZONTAL;
};


/**
 * Getter/setter for bullet marker scale.
 * @param {anychart.scales.Base=} opt_value Scale.
 * @return {(anychart.scales.Base|!anychart.core.bullet.Marker)}
 */
anychart.core.bullet.Marker.prototype.scale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.scale_ != opt_value) {
      this.scale_ = opt_value;
      this.scale_.listenSignals(this.onScaleSignal_, this);
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.scale_;
};


/**
 * Internal ticks invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.bullet.Marker.prototype.onScaleSignal_ = function(event) {
  var signal = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION))
    signal |= anychart.Signal.NEEDS_RECALCULATION;
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION))
    signal |= anychart.Signal.NEEDS_REDRAW;

  signal |= anychart.Signal.BOUNDS_CHANGED;

  var state = anychart.ConsistencyState.BOUNDS;

  this.invalidate(state, signal);
};


/**
 * Get/set bullet marker fill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {!(acgraph.vector.Fill|anychart.core.bullet.Marker)} .
 */
anychart.core.bullet.Marker.prototype.fill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var fill = acgraph.vector.normalizeFill.apply(null, arguments);
    if (fill != this.fill_) {
      this.fill_ = fill;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.fill_ || this.defaultFill_;
};


/**
 * @param {acgraph.vector.Fill} value Default fill value.
 */
anychart.core.bullet.Marker.prototype.setDefaultFill = function(value) {
  var needInvalidate = !this.fill_ && this.defaultFill_ != value;
  this.defaultFill_ = value;
  if (needInvalidate)
    this.invalidate(anychart.ConsistencyState.APPEARANCE);
};


/**
 * Get/set bullet marker stroke.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {!(anychart.core.bullet.Marker|acgraph.vector.Stroke)} LineMarker line settings or LineMarker instance for method chaining.
 */
anychart.core.bullet.Marker.prototype.stroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var stroke = acgraph.vector.normalizeStroke.apply(null, arguments);
    if (this.stroke_ != stroke) {
      this.stroke_ = stroke;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.stroke_ || this.defaultStroke_;
  }
};


/**
 * @param {acgraph.vector.Stroke} value Default stroke value.
 */
anychart.core.bullet.Marker.prototype.setDefaultStroke = function(value) {
  var needInvalidate = !this.stroke_ && this.defaultStroke_ != value;
  this.defaultStroke_ = value;
  if (needInvalidate)
    this.invalidate(anychart.ConsistencyState.APPEARANCE);
};


/**
 * Get drawer for bullet marker.
 * @param {anychart.enums.Layout} layout Layout.
 * @param {anychart.enums.BulletMarkerType} type Marker type.
 * @return {Function}
 */
anychart.core.bullet.Marker.getDrawer = function(layout, type) {
  if (layout == anychart.enums.Layout.HORIZONTAL) {
    switch (type) {
      default:
      case anychart.enums.BulletMarkerType.BAR:
        return function(path, ratio) {
          var start = this.scale().transform(0);
          start = isNaN(start) ? 0 : goog.math.clamp(start, 0, 1);
          var bounds = this.parentBounds();

          var gap = this.gap();
          var pixGap = anychart.utils.isPercent(gap) ?
              anychart.utils.normalizeSize(gap, bounds.height) :
              bounds.height * gap;

          var left = bounds.left + start * bounds.width;
          var top = bounds.top + pixGap / 2;
          var width = (ratio - start) * bounds.width;
          var height = bounds.height - pixGap;
          path
              .clear()
              .moveTo(left, top)
              .lineTo(left + width, top)
              .lineTo(left + width, top + height)
              .lineTo(left, top + height)
              .close();
        };
      case anychart.enums.BulletMarkerType.LINE:
        return function(path, ratio) {
          var bounds = this.parentBounds();
          var gap = this.gap();
          var pixGap = anychart.utils.isPercent(gap) ?
              anychart.utils.normalizeSize(gap, bounds.height) :
              bounds.height * gap;

          var x = Math.round(bounds.left + bounds.width * ratio);
          var y = Math.round(bounds.top + bounds.height / 2);

          var height = bounds.height - pixGap;

          path.clear()
              .moveTo(x - 1, y - height / 2)
              .lineTo(x - 1, y + height / 2)
              .lineTo(x + 1, y + height / 2)
              .lineTo(x + 1, y - height / 2)
              .close();
        };
      case anychart.enums.BulletMarkerType.ELLIPSE:
        return function(path, ratio) {
          var bounds = this.parentBounds();
          var gap = this.gap();
          var pixGap = anychart.utils.isPercent(gap) ?
              anychart.utils.normalizeSize(gap, bounds.height) :
              bounds.height * gap;

          var x = bounds.left + bounds.width * ratio;
          var y = bounds.top + bounds.height / 2;
          var ry = (bounds.height - pixGap) / 2;
          var rx = ry / 4;

          path.clear();
          path.circularArc(x, y, rx, ry, 0, 360).close();
        };
      case anychart.enums.BulletMarkerType.X:
        return function(path, ratio) {
          var bounds = this.parentBounds();
          var gap = this.gap();
          var pixGap = anychart.utils.isPercent(gap) ?
              anychart.utils.normalizeSize(gap, bounds.height) :
              bounds.height * gap;

          var x = Math.round(bounds.left + bounds.width * ratio);
          var y = Math.round(bounds.top + bounds.height / 2);
          var ry = (bounds.height - pixGap) / 2;
          var rx = ry / 1.5;

          path.clear()
              //left line
              .moveTo(x - rx - 1, y - ry)
              .lineTo(x + rx - 1, y + ry)
              .lineTo(x + rx + 1, y + ry)
              .lineTo(x - rx + 1, y - ry)
              //right line
              .moveTo(x + rx - 1, y - ry)
              .lineTo(x - rx - 1, y + ry)
              .lineTo(x - rx + 1, y + ry)
              .lineTo(x + rx + 1, y - ry)
              .close();
        };
    }
  } else {
    switch (type) {
      default:
      case anychart.enums.BulletMarkerType.BAR:
        return function(path, ratio) {
          var start = this.scale().transform(0);
          start = isNaN(start) ? 0 : goog.math.clamp(start, 0, 1);
          var bounds = this.parentBounds();
          var gap = this.gap();
          var pixGap = anychart.utils.isPercent(gap) ?
              anychart.utils.normalizeSize(gap, bounds.width) :
              bounds.width * gap;
          var left = bounds.left + pixGap / 2;//start * bounds.width;
          var top = bounds.getBottom() - bounds.height * ratio;
          var width = bounds.width - pixGap;//(end - start) * bounds.width;
          var height = (ratio - start) * bounds.height;

          path.clear()
              .moveTo(left - 0.25, top - 0.5)
              .lineTo(left + width + 0.25, top - 0.5)
              .lineTo(left + width + 0.25, top + height - 0.5)
              .lineTo(left - 0.25, top + height - 0.5)
              .close();
        };
      case anychart.enums.BulletMarkerType.LINE:
        return function(path, ratio) {
          var bounds = this.parentBounds();
          var gap = this.gap();
          var pixGap = anychart.utils.isPercent(gap) ?
              anychart.utils.normalizeSize(gap, bounds.width) :
              bounds.width * gap;

          var x = Math.round(bounds.left + bounds.width / 2);
          var y = Math.round(bounds.getBottom() - bounds.height * ratio);
          var width = bounds.width - pixGap;

          path.clear()
              .moveTo(x - width / 2, y - 1)
              .lineTo(x + width / 2, y - 1)
              .lineTo(x + width / 2, y + 1)
              .lineTo(x - width / 2, y + 1)
              .close();
        };
      case anychart.enums.BulletMarkerType.ELLIPSE:
        return function(path, ratio) {
          var bounds = this.parentBounds();
          var gap = this.gap();
          var pixGap = anychart.utils.isPercent(gap) ?
              anychart.utils.normalizeSize(gap, bounds.width) :
              bounds.width * gap;

          var x = Math.round(bounds.left + bounds.width / 2);
          var y = Math.round(bounds.getBottom() - bounds.height * ratio);
          var rx = (bounds.width - pixGap) / 2;
          var ry = rx / 4;

          path.clear();
          path.circularArc(x, y, rx, ry, 0, 360).close();
        };
      case anychart.enums.BulletMarkerType.X:
        return function(path, ratio) {
          var bounds = this.parentBounds();
          var gap = this.gap();
          var pixGap = anychart.utils.isPercent(gap) ?
              anychart.utils.normalizeSize(gap, bounds.width) :
              bounds.width * gap;

          var x = Math.round(bounds.left + bounds.width / 2);
          var y = Math.round(bounds.getBottom() - bounds.height * ratio);
          var rx = (bounds.width - pixGap) / 2;
          var ry = rx / 1.5;

          path.clear()
              //left line
              .moveTo(x - rx - 1, y - ry)
              .lineTo(x + rx - 1, y + ry)
              .lineTo(x + rx + 1, y + ry)
              .lineTo(x - rx + 1, y - ry)
              //right line
              .moveTo(x + rx - 1, y - ry)
              .lineTo(x - rx - 1, y + ry)
              .lineTo(x - rx + 1, y + ry)
              .lineTo(x + rx + 1, y - ry)
              .close();
        };
    }
  }
};


/**
 * Draw bullet marker element.
 * @return {anychart.core.bullet.Marker} {@link anychart.core.bullet.Marker} instance for method chaining.
 */
anychart.core.bullet.Marker.prototype.draw = function() {
  var scale = /** @type {anychart.scales.Linear|anychart.scales.Ordinal} */(this.scale());

  if (!scale) {
    anychart.core.reporting.error(anychart.enums.ErrorCode.SCALE_NOT_SET);
    return this;
  }

  if (!this.checkDrawingNeeded())
    return this;

  var stage = this.container() ? this.container().getStage() : null;
  var manualSuspend = stage && !stage.isSuspended();
  if (manualSuspend) stage.suspend();

  if (!this.path_) {
    this.path_ = acgraph.path();
    this.registerDisposable(this.path_);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    var zIndex = /** @type {number} */(this.zIndex());
    this.path_.zIndex(zIndex);
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    var container = /** @type {acgraph.vector.ILayer} */(this.container());
    this.path_.parent(container);
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    this.path_.stroke(this.stroke());
    this.path_.fill(this.fill());
    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    var value = this.value();
    var ratio = this.scale().transform(value, 0);
    this.path_.clear();

    if (!isNaN(ratio)) {
      ratio = goog.math.clamp(ratio, 0, 1);
      var drawer = anychart.core.bullet.Marker.getDrawer(
          /** @type {anychart.enums.Layout} */(this.layout()),
          /** @type {anychart.enums.BulletMarkerType} */(this.type())
          );
      drawer.call(this, this.path_, ratio);
    }


    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  if (manualSuspend) stage.resume();

  return this;
};


/** @inheritDoc */
anychart.core.bullet.Marker.prototype.remove = function() {
  if (this.path_)
    this.path_.parent(null);
};


///**
// * Constructor function.
// * @return {!anychart.core.bullet.Marker}
// */
//anychart.elements.bulletMarker = function() {
//  return new anychart.core.bullet.Marker();
//};


//goog.exportSymbol('anychart.elements.bulletMarker', anychart.elements.bulletMarker);
//proto['type'] = proto.type;
//proto['gap'] = proto.gap;
//proto['value'] = proto.value;
//proto['layout'] = proto.layout;
//proto['scale'] = proto.scale;
//proto['fill'] = proto.fill;
//proto['stroke'] = proto.stroke;
//proto['isHorizontal'] = proto.isHorizontal;
//proto['draw'] = proto.draw;
