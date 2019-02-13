goog.provide('anychart.bulletModule.Marker');

goog.require('anychart.core.VisualBase');
goog.require('anychart.core.reporting');
goog.require('anychart.enums');
goog.require('anychart.utils');



/**
 * Bullet marker.
 * @constructor
 * @extends {anychart.core.VisualBase}
 */
anychart.bulletModule.Marker = function() {
  anychart.bulletModule.Marker.base(this, 'constructor');

  this.addThemes('defaultRangeMarkerSettings');

  /**
   * Gap for bullet marker.
   * @type {number|string|null}
   * @private
   */
  this.gap_ = null;

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['type', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['value', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['layout', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['fill', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['stroke', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW]
  ]);
};
goog.inherits(anychart.bulletModule.Marker, anychart.core.VisualBase);


/**
 * @type {!Object<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.bulletModule.Marker.PROTOTYPE_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'type', anychart.enums.normalizeBulletMarkerType],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'value', anychart.utils.toNumber],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'layout', anychart.enums.normalizeLayout],
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'fill', anychart.core.settings.fillNormalizer],
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'stroke', anychart.core.settings.strokeNormalizer]
  ]);
  return map;
})();
anychart.core.settings.populate(anychart.bulletModule.Marker, anychart.bulletModule.Marker.PROTOTYPE_DESCRIPTORS);


/**
 * Default gaps for different type of bullet marker type.
 * @const {Object<string>}
 */
anychart.bulletModule.Marker.DEFAULT_GAP_BY_TYPE = {
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
anychart.bulletModule.Marker.prototype.SUPPORTED_SIGNALS =
    anychart.core.VisualBase.prototype.SUPPORTED_SIGNALS; // NEEDS_REDRAW, BOUNDS_CHANGED


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.bulletModule.Marker.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES | // ENABLED, CONTAINER, Z_INDEX
    anychart.ConsistencyState.BOUNDS |
    anychart.ConsistencyState.APPEARANCE;


/**
 * Getter/setter for bullet marker gap value.
 * @param {(number|string)=} opt_value ['50%'] Gap value.
 * @return {(number|string|anychart.bulletModule.Marker)}
 */
anychart.bulletModule.Marker.prototype.gap = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.gap_ != opt_value) {
      this.gap_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return goog.isNull(this.gap_) ? anychart.bulletModule.Marker.DEFAULT_GAP_BY_TYPE[this.getOption('type')] : this.gap_;
  }
};


/**
 * Checks for horizontal layout.
 * @return {boolean} Is layout horizontal.
 */
anychart.bulletModule.Marker.prototype.isHorizontal = function() {
  return this.getOption('layout') == anychart.enums.Layout.HORIZONTAL;
};


/**
 * Getter/setter for bullet marker scale.
 * @param {(anychart.scales.Base|Object|anychart.enums.ScaleTypes)=} opt_value Scale.
 * @return {(anychart.scales.Base|!anychart.bulletModule.Marker)}
 */
anychart.bulletModule.Marker.prototype.scale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = anychart.scales.Base.setupScale(this.scale_, opt_value, null,
        anychart.scales.Base.ScaleTypes.SCATTER, null, this.onScaleSignal_, this);
    if (val) {
      var dispatch = this.scale_ == val;
      this.scale_ = val;
      val.resumeSignalsDispatching(dispatch);
      if (!dispatch)
        this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.scale_;
};


/**
 * Sets default type, straight to theme settings, this is used when marker palette in chart is updated.
 * @param {string|anychart.enums.BulletMarkerType} value
 */
anychart.bulletModule.Marker.prototype.setDefaultType = function(value) {
  if (goog.isDef(value)) {
    value = anychart.enums.normalizeBulletMarkerType(value, /** @type {anychart.enums.BulletMarkerType} */(this.getThemeOption('type')));
    if (this.getThemeOption('type') != value) {
      this.themeSettings['type'] = value;
      if (!goog.isDef(this.getOwnOption('type'))) {
        this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
      }
    }
  }
};


/**
 * Sets default layout, straight to theme settings, this is used when layout in chart is updated.
 * @param {string|anychart.enums.Layout} value
 */
anychart.bulletModule.Marker.prototype.setDefaultLayout = function(value) {
  if (goog.isDef(value)) {
    value = anychart.enums.normalizeLayout(value, /** @type {anychart.enums.Layout} */(this.getThemeOption('layout')));
    if (this.getThemeOption('layout') != value) {
      this.themeSettings['layout'] = value;
      if (!goog.isDef(this.getOwnOption('layout'))) {
        this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
      }
    }
  }
};


/**
 * Internal ticks invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.bulletModule.Marker.prototype.onScaleSignal_ = function(event) {
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
 * Get drawer for bullet marker.
 * @param {anychart.enums.Layout} layout Layout.
 * @param {anychart.enums.BulletMarkerType} type Marker type.
 * @return {Function}
 */
anychart.bulletModule.Marker.getDrawer = function(layout, type) {
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
 * @return {anychart.bulletModule.Marker} {@link anychart.bulletModule.Marker} instance for method chaining.
 */
anychart.bulletModule.Marker.prototype.draw = function() {
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
    this.path_.stroke(this.getOption('stroke'));
    this.path_.fill(this.getOption('fill'));
    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    var value = this.getOption('value');
    var ratio = this.scale().transform(value, 0);
    this.path_.clear();

    if (!isNaN(ratio)) {
      ratio = goog.math.clamp(ratio, 0, 1);
      var drawer = anychart.bulletModule.Marker.getDrawer(
          /** @type {anychart.enums.Layout} */(this.getOption('layout')),
          /** @type {anychart.enums.BulletMarkerType} */(this.getOption('type'))
          );
      drawer.call(this, this.path_, ratio);
    }


    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  if (manualSuspend) stage.resume();

  return this;
};


/** @inheritDoc */
anychart.bulletModule.Marker.prototype.remove = function() {
  if (this.path_)
    this.path_.parent(null);
};


/** @inheritDoc */
anychart.bulletModule.Marker.prototype.disposeInternal = function() {
  goog.dispose(this.path_);
  this.path_ = null;
  anychart.bulletModule.Marker.base(this, 'disposeInternal');
};


///**
// * Constructor function.
// * @return {!anychart.bulletModule.Marker}
// */
//anychart.elements.bulletMarker = function() {
//  return new anychart.bulletModule.Marker();
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
